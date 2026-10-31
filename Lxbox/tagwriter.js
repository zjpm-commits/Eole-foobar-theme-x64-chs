/* ==========================================================================
   NetMusic — 标签二进制写入器（纯 JS，不启动任何外部进程）
   --------------------------------------------------------------------------
   v1.9.18：从 main.js 拆出来。这一段是 440 行纯函数 —— 解析 ID3v2 / FLAC
   metadata blocks、拼新文件、写后自检，和界面、布局、事件一点关系都没有。
   留在 main.js 里让那个文件涨到 6800 行，改一个字节序都要在 UI 代码里翻。

   为什么不用 PowerShell 那条路：它依赖「RunCmdAsync 可用 + 路径含空格能正确
   加引号 + 系统里有 powershell.exe + 执行策略放行」，任何一环挂掉封面就写不
   进去，而且被占用时只会静默失败。这里改成 SMP 自带的二进制读写直接改字节，
   读 → 改 → 校验 → 写全程同步，函数返回时封面已经在文件里了。

   MP3 ：解析 ID3v2 帧，只换掉 APIC，其余帧（fb2k 刚写的文本、TSSE、REPLAYGAIN…）
         原样保留，所以不会把标签写丢，也不会叠出双封面。
   FLAC：重建 metadata blocks，只换 PICTURE，VORBIS_COMMENT 原样不动。
   其它格式（m4a / ogg / wav…）返回 unsupported，交给 PowerShell / AttachImage。

   对外（挂到 NM.tag）：
     embedCoverToFile(track, path, coverFile, fields) -> { ok, how, reason, unsupported, busy }
     hasEmbeddedCover(path) -> boolean
     extOfPath(path) -> '.mp3' / '.flac' / …
     COVER_EMBED_MAX -> 做内存改写的文件大小上限
   ========================================================================== */
(function (global) {
  'use strict';

  var NM = global.NM = global.NM || {};


/* 简易字节拼装器 */
function Bytes() { this.list = []; this.len = 0; }
Bytes.prototype.push = function (b) {
  if (!b || !b.length) return;
  this.list.push(b); this.len += b.length;
};
Bytes.prototype.byte = function (v) {
  this.list.push(new Uint8Array([v & 0xFF])); this.len += 1;
};
Bytes.prototype.u32 = function (v) {
  v = v >>> 0;
  this.list.push(new Uint8Array([(v >>> 24) & 0xFF, (v >>> 16) & 0xFF, (v >>> 8) & 0xFF, v & 0xFF]));
  this.len += 4;
};
Bytes.prototype.done = function () {
  var out = new Uint8Array(this.len), p = 0;
  for (var i = 0; i < this.list.length; i++) {
    out.set(this.list[i], p);
    p += this.list[i].length;
  }
  return out;
};

function asciiBytes(s) {
  s = String(s == null ? '' : s);
  var o = new Uint8Array(s.length);
  for (var i = 0; i < s.length; i++) o[i] = s.charCodeAt(i) & 0xFF;
  return o;
}

/* UTF-16LE + BOM：ID3v2.3 里写中文最稳（v2.3 的 UTF-8 不规范） */
function utf16Bytes(s) {
  s = String(s == null ? '' : s);
  var o = new Uint8Array(2 + s.length * 2 + 2);
  o[0] = 0xFF; o[1] = 0xFE;
  var p = 2;
  for (var i = 0; i < s.length; i++) {
    var c = s.charCodeAt(i);
    o[p++] = c & 0xFF;
    o[p++] = (c >> 8) & 0xFF;
  }
  o[p++] = 0; o[p++] = 0;
  return o;
}

function u32be(u8, i) {
  return ((u8[i] << 24) >>> 0) + (u8[i + 1] << 16) + (u8[i + 2] << 8) + u8[i + 3];
}
function readSyncSafe(u8, i) {
  return (u8[i] & 0x7F) * 2097152 + (u8[i + 1] & 0x7F) * 16384 +
         (u8[i + 2] & 0x7F) * 128 + (u8[i + 3] & 0x7F);
}
function setSyncSafe(o, i, v) {
  o[i] = (v >> 21) & 0x7F;
  o[i + 1] = (v >> 14) & 0x7F;
  o[i + 2] = (v >> 7) & 0x7F;
  o[i + 3] = v & 0x7F;
}

/* 图片真实类型与尺寸（FLAC 的 PICTURE 要宽高，MIME 也要对） */
function imageMeta(u8) {
  if (!u8 || u8.length < 16) return { mime: 'image/jpeg', w: 0, h: 0 };
  if (u8[0] === 0xFF && u8[1] === 0xD8) {
    var i = 2;
    while (i + 9 < u8.length) {
      if (u8[i] !== 0xFF) { i++; continue; }
      var m = u8[i + 1];
      if (m === 0xD8 || m === 0x01 || (m >= 0xD0 && m <= 0xD7)) { i += 2; continue; }
      if (m === 0xFF) { i++; continue; }
      var len = (u8[i + 2] << 8) | u8[i + 3];
      if (m >= 0xC0 && m <= 0xCF && m !== 0xC4 && m !== 0xC8 && m !== 0xCC) {
        return { mime: 'image/jpeg', h: (u8[i + 5] << 8) | u8[i + 6], w: (u8[i + 7] << 8) | u8[i + 8] };
      }
      if (len < 2) break;
      i += 2 + len;
    }
    return { mime: 'image/jpeg', w: 0, h: 0 };
  }
  if (u8[0] === 0x89 && u8[1] === 0x50 && u8[2] === 0x4E && u8[3] === 0x47) {
    return {
      mime: 'image/png',
      w: ((u8[16] << 24) >>> 0) + (u8[17] << 16) + (u8[18] << 8) + u8[19],
      h: ((u8[20] << 24) >>> 0) + (u8[21] << 16) + (u8[22] << 8) + u8[23]
    };
  }
  return { mime: 'image/jpeg', w: 0, h: 0 };
}

/* ---------------- MP3 / ID3v2 ---------------- */
function id3Frame(id, payload, major) {
  var out = new Uint8Array(10 + payload.length);
  out.set(asciiBytes(id), 0);
  if (major === 4) setSyncSafe(out, 4, payload.length);
  else {
    out[4] = (payload.length >>> 24) & 0xFF;
    out[5] = (payload.length >>> 16) & 0xFF;
    out[6] = (payload.length >>> 8) & 0xFF;
    out[7] = payload.length & 0xFF;
  }
  out[8] = 0; out[9] = 0;
  out.set(payload, 10);
  return out;
}

function id3TextFrame(text) {
  var b = new Bytes();
  b.byte(1);                       /* encoding: UTF-16 with BOM */
  b.push(utf16Bytes(text));
  return b.done();
}

function id3UsltFrame(text) {
  var b = new Bytes();
  b.byte(1);
  b.push(asciiBytes('chi'));
  b.push(new Uint8Array([0xFF, 0xFE, 0x00, 0x00]));   /* 空描述 */
  b.push(utf16Bytes(text));
  return b.done();
}

function id3ApicFrame(img, meta) {
  var b = new Bytes();
  b.byte(0);                       /* encoding: ISO-8859-1 */
  b.push(asciiBytes(meta.mime || 'image/jpeg'));
  b.byte(0);
  b.byte(3);                       /* picture type: front cover */
  b.byte(0);                       /* 空描述 */
  b.push(img);
  return b.done();
}

/* 读 ID3v2 头：返回 { major, bodyStart, bodyEnd } 或 { unsafe: true } */
function parseId3(u8) {
  if (u8.length < 10) return null;
  if (!(u8[0] === 0x49 && u8[1] === 0x44 && u8[2] === 0x33)) return null;
  var major = u8[3];
  if (major < 2 || major > 4) return null;
  var flags = u8[5];
  if (flags & 0x80) return { unsafe: true, why: 'ID3 带 unsync 标志' };
  var size = readSyncSafe(u8, 6);
  var start = 10;
  if (flags & 0x40) {
    if (start + 4 > u8.length) return { unsafe: true, why: 'ID3 扩展头损坏' };
    var ext = (major === 4) ? readSyncSafe(u8, start) : (u32be(u8, start) + 4);
    if (!(ext > 0)) return { unsafe: true, why: 'ID3 扩展头损坏' };
    start += ext;
  }
  var end = 10 + size;
  if (end > u8.length) return { unsafe: true, why: 'ID3 声明长度超出文件' };
  if (start >= end) return { unsafe: true, why: 'ID3 没有帧' };
  return { major: major, flags: flags, bodyStart: start, bodyEnd: end };
}

/* v2.2 的 3 字符帧 ID → v2.3 */
var ID3V22 = {
  TT2: 'TIT2', TP1: 'TPE1', TAL: 'TALB', TYE: 'TYER', TCO: 'TCON',
  ULT: 'USLT', PIC: 'APIC', TCM: 'TCOM', TP2: 'TPE2', TRK: 'TRCK', TPA: 'TPOS'
};

function readId3Frames(u8, p, end, major) {
  var out = [];
  var hdr = (major === 2) ? 6 : 10;
  while (p + hdr <= end) {
    var id, sz, fflags = 0;
    if (major === 2) {
      var id3 = '';
      for (var k = 0; k < 3; k++) {
        var c = u8[p + k];
        if (c < 0x41 || c > 0x5A) { id3 = ''; break; }
        id3 += String.fromCharCode(c);
      }
      if (!id3) break;
      id = ID3V22[id3] || '';
      sz = (u8[p + 3] << 16) | (u8[p + 4] << 8) | u8[p + 5];
    } else {
      var s4 = '';
      for (var j = 0; j < 4; j++) {
        var ch = u8[p + j];
        if (!((ch >= 0x41 && ch <= 0x5A) || (ch >= 0x30 && ch <= 0x39))) { s4 = ''; break; }
        s4 += String.fromCharCode(ch);
      }
      if (!s4) break;                       /* 到 padding 了 */
      id = s4;
      sz = (major === 4) ? readSyncSafe(u8, p + 4) : u32be(u8, p + 4);
      fflags = (u8[p + 8] << 8) | u8[p + 9];
    }
    if (!(sz > 0) || p + hdr + sz > end) break;
    /* 带压缩 / 加密 / 分组标志的帧数据不是裸数据，原样搬运会写坏，直接丢掉 */
    if (id && !(fflags & 0x00E0)) out.push({ id: id, data: u8.subarray(p + hdr, p + hdr + sz) });
    p += hdr + sz;
  }
  return out;
}

function mp3WithCover(u8, img, fields) {
  var meta = imageMeta(img);
  var info = parseId3(u8);
  if (info && info.unsafe) return { ok: false, reason: info.why };
  if (!info) {
    /* 没有 ID3：检查是不是真的 mp3（帧同步 0xFFEx） */
    if (!(u8.length > 4 && u8[0] === 0xFF && (u8[1] & 0xE0) === 0xE0)) {
      return { ok: false, reason: '不是 MP3（找不到帧同步）' };
    }
  }

  var major = (info && info.major === 4) ? 4 : 3;    /* v2.2 顺手升到 v2.3 */
  var audio = info ? u8.subarray(info.bodyEnd) : u8;
  var frames = info ? readId3Frames(u8, info.bodyStart, info.bodyEnd, info.major) : [];
  if (audio.length < 128) return { ok: false, reason: '音频数据为空' };

  var keep = [], has = {};
  for (var i = 0; i < frames.length; i++) {
    if (frames[i].id === 'APIC') continue;          /* 旧封面丢掉，换新的 */
    keep.push(frames[i]);
    has[frames[i].id] = true;
  }

  /* 文本字段：文件里没有才补（fb2k 刚写好的不覆盖） */
  var map = { TITLE: 'TIT2', ARTIST: 'TPE1', ALBUM: 'TALB', DATE: 'TYER', GENRE: 'TCON' };
  for (var key in map) {
    var fid = map[key];
    var val = String((fields && fields[key]) || '').trim();
    if (!val || has[fid]) continue;
    keep.push({ id: fid, data: id3TextFrame(val) });
    has[fid] = true;
  }
  var lyr = String((fields && fields.LYRICS) || '').trim();
  if (lyr && !has.USLT) {
    keep.push({ id: 'USLT', data: id3UsltFrame(lyr) });
    has.USLT = true;
  }

  keep.push({ id: 'APIC', data: id3ApicFrame(img, meta) });

  var body = new Bytes();
  for (var n = 0; n < keep.length; n++) body.push(id3Frame(keep[n].id, keep[n].data, major));
  var bodyU8 = body.done();
  if (bodyU8.length > 0x0FFFFFFF) return { ok: false, reason: '标签太大' };

  var b = new Bytes();
  b.push(asciiBytes('ID3'));
  b.byte(major);
  b.byte(0);
  b.byte(0);
  var ss = new Uint8Array(4);
  setSyncSafe(ss, 0, bodyU8.length);
  b.push(ss);
  b.push(bodyU8);
  b.push(audio);
  return { ok: true, out: b.done(), how: 'ID3v2.' + major, kind: 'mp3', imgLen: img.length };
}

/* ---------------- FLAC ---------------- */
function flacPictureBlock(img, meta) {
  var b = new Bytes();
  var mime = asciiBytes(meta.mime || 'image/jpeg');
  b.u32(3);                       /* front cover */
  b.u32(mime.length); b.push(mime);
  b.u32(0);                       /* 空描述 */
  b.u32(meta.w || 0);
  b.u32(meta.h || 0);
  b.u32(24);                      /* 色深 */
  b.u32(0);                       /* 索引色数 */
  b.u32(img.length); b.push(img);
  return b.done();
}

function flacWithCover(u8, img) {
  if (!(u8.length > 8 && u8[0] === 0x66 && u8[1] === 0x4C && u8[2] === 0x61 && u8[3] === 0x43)) {
    return { ok: false, reason: '不是 FLAC 文件' };
  }
  var meta = imageMeta(img);
  var p = 4, blocks = [];
  while (p + 4 <= u8.length) {
    var h = u8[p];
    var type = h & 0x7F;
    var len = (u8[p + 1] << 16) | (u8[p + 2] << 8) | u8[p + 3];
    if (p + 4 + len > u8.length) return { ok: false, reason: 'FLAC 元数据块长度越界' };
    blocks.push({ type: type, data: u8.subarray(p + 4, p + 4 + len) });
    p += 4 + len;
    if (h & 0x80) break;
  }
  if (!blocks.length || blocks[0].type !== 0) return { ok: false, reason: 'FLAC 缺少 STREAMINFO' };
  if (p >= u8.length) return { ok: false, reason: 'FLAC 没有音频帧' };

  var keep = [];
  for (var i = 0; i < blocks.length; i++) {
    if (blocks[i].type === 6 || blocks[i].type === 127) continue;   /* 旧封面 / 非法块 */
    keep.push(blocks[i]);
  }
  keep.push({ type: 6, data: flacPictureBlock(img, meta) });

  var b = new Bytes();
  b.push(asciiBytes('fLaC'));
  for (var k = 0; k < keep.length; k++) {
    var bb = keep[k];
    var head = new Uint8Array(4);
    head[0] = bb.type | ((k === keep.length - 1) ? 0x80 : 0);
    head[1] = (bb.data.length >>> 16) & 0xFF;
    head[2] = (bb.data.length >>> 8) & 0xFF;
    head[3] = bb.data.length & 0xFF;
    b.push(head);
    b.push(bb.data);
  }
  b.push(u8.subarray(p));
  return { ok: true, out: b.done(), how: 'FLAC PICTURE', kind: 'flac', imgLen: img.length };
}

/* ---------------- 写后自检 ----------------
   确认新文件里真的有一张完整的封面图，而且音频尾巴没被动过 */
function checkMp3Cover(u8, imgLen) {
  var info = parseId3(u8);
  if (!info || info.unsafe) return false;
  var frames = readId3Frames(u8, info.bodyStart, info.bodyEnd, info.major);
  for (var i = 0; i < frames.length; i++) {
    if (frames[i].id === 'APIC' && frames[i].data.length > imgLen) return true;
  }
  return false;
}
function checkFlacCover(u8, imgLen) {
  var p = 4;
  while (p + 4 <= u8.length) {
    var h = u8[p];
    var type = h & 0x7F;
    var len = (u8[p + 1] << 16) | (u8[p + 2] << 8) | u8[p + 3];
    if (p + 4 + len > u8.length) return false;
    if (type === 6 && len > imgLen) return true;
    p += 4 + len;
    if (h & 0x80) break;
  }
  return false;
}
function tailEqual(a, b, n) {
  n = n || 32;
  if (a.length < n || b.length < n) return false;
  for (var i = 1; i <= n; i++) {
    if (a[a.length - i] !== b[b.length - i]) return false;
  }
  return true;
}

/* ---------- 文件读写适配 ----------
   utils.ReadBinaryFile 在不同 JSplitter 版本里返回过 Uint8Array / ArrayBuffer /
   「每字符一字节」的字符串，这里统一成 Uint8Array；WriteBinaryFile 也两种都试。 */
function readBytes(path) {
  var raw = null;
  try { raw = utils.ReadBinaryFile(path); } catch (e) { return null; }
  if (!raw) return null;

  if (typeof raw === 'string') {                 /* 二进制字符串（老版本） */
    var a = new Uint8Array(raw.length);
    for (var i = 0; i < raw.length; i++) a[i] = raw.charCodeAt(i) & 0xFF;
    return a;
  }
  try {
    if (typeof raw.length === 'number') return (raw instanceof Uint8Array) ? raw : new Uint8Array(raw);
  } catch (e1) {}
  try {
    if (typeof raw.byteLength === 'number') return new Uint8Array(raw);
  } catch (e2) {}
  return null;
}

function writeBytes(path, u8) {
  var buf = u8;
  try {
    buf = (u8.byteOffset === 0 && u8.byteLength === u8.buffer.byteLength)
      ? u8.buffer
      : u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength);
  } catch (e) { buf = u8; }
  try { if (utils.WriteBinaryFile(path, buf) !== false) return true; } catch (e2) {}
  try { if (utils.WriteBinaryFile(path, u8) !== false) return true; } catch (e3) {}
  return false;
}

function sizeOfFile(p) {
  var n = 0;
  try { n = utils.GetFileSize(p); } catch (e) { n = 0; }
  return n || 0;
}

/* 超过这个大小的文件不做内存改写（8 MB 的歌改写峰值约 20 MB，40 MB 封顶） */
var COVER_EMBED_MAX = 40 * 1024 * 1024;

function extOfPath(p) {
  var m = /\.([A-Za-z0-9]+)$/.exec(String(p || ''));
  return m ? '.' + m[1].toLowerCase() : '';
}

/* 把封面嵌进文件（同步完成）。返回 { ok, how, reason, unsupported, busy } */
function embedCoverToFile(track, path, coverFile, fields) {
  var ext = extOfPath(path);
  if (ext !== '.mp3' && ext !== '.flac') {
    return { ok: false, unsupported: true, reason: '内置写入器不支持 ' + (ext || '未知格式') };
  }

  var size = sizeOfFile(path);
  if (!size) return { ok: false, reason: '读不到缓存文件' };
  if (size > COVER_EMBED_MAX) {
    return { ok: false, unsupported: true, reason: '文件超过 ' + Math.round(COVER_EMBED_MAX / 1048576) + ' MB，不做内嵌' };
  }

  var audio = readBytes(path);
  if (!audio || audio.length < 256) return { ok: false, reason: '读不到缓存文件' };

  var img = readBytes(coverFile);
  if (!img || img.length < 100) return { ok: false, reason: '读不到封面图片' };
  if (img.length > 12 * 1024 * 1024) return { ok: false, unsupported: true, reason: '封面图片太大' };

  var r;
  try {
    r = (ext === '.mp3') ? mp3WithCover(audio, img, fields) : flacWithCover(audio, img);
  } catch (e) {
    return { ok: false, reason: '解析失败：' + ((e && e.message) || e) };
  }
  if (!r || !r.ok) return { ok: false, reason: (r && r.reason) || '解析失败' };

  /* 写盘前先在内存里自检：图真的进了 tag、音频尾巴一个字节没动 */
  var okCover = (r.kind === 'mp3') ? checkMp3Cover(r.out, r.imgLen) : checkFlacCover(r.out, r.imgLen);
  if (!okCover) return { ok: false, reason: '生成的文件自检没通过' };
  if (!tailEqual(audio, r.out, 32)) return { ok: false, reason: '音频尾部校验没通过' };

  if (!writeBytes(path, r.out)) {
    /* 写到一半失败也不能留个坏文件：把原始字节写回去 */
    try { writeBytes(path, audio); } catch (e) {}
    return { ok: false, busy: true, reason: '写回文件失败（文件被占用？）' };
  }

  var after = sizeOfFile(path);
  if (after !== r.out.length) {
    return { ok: false, busy: true, reason: '写回长度不符（' + after + ' ≠ ' + r.out.length + '）' };
  }
  return { ok: true, how: r.how, coverBytes: img.length, bytes: r.out.length };
}

/* 文件里到底有没有内嵌封面（用于播放前的一次确认） */
function hasEmbeddedCover(path) {
  var ext = extOfPath(path);
  if (ext !== '.mp3' && ext !== '.flac') return false;
  var u8 = readBytes(path);
  if (!u8) return false;
  return ext === '.mp3' ? checkMp3Cover(u8, 100) : checkFlacCover(u8, 100);
}


  /* ---------------------------------------------------------------- 导出 */
  NM.tag = {
    embedCoverToFile: embedCoverToFile,
    hasEmbeddedCover: hasEmbeddedCover,
    extOfPath: extOfPath,
    COVER_EMBED_MAX: COVER_EMBED_MAX
  };
})(window);
