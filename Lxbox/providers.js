/* ==========================================================================
   NetMusic — 平台搜索
   洛雪音源脚本只负责「曲目信息 → 直链」，不提供搜索；搜索用各平台公开接口完成，
   结果归一成统一结构，并补齐脚本取链需要的字段（songmid/mediaMid/hash/rid/…）。

   统一曲目：
     {
       uid, source, id, songmid, mediaMid, albumId, hash, rid, copyrightId,
       title, artist, album, duration(秒), pic(URL), types(各档 hash/size), raw
     }
   ========================================================================== */
(function (global) {
  'use strict';

  var NM = global.NM = global.NM || {};
  var http = NM.http;

  var UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
         + '(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';
  var MIGU_UA = 'Mozilla/5.0 (Linux; Android 11; MI 8) AppleWebKit/537.36 '
              + '(KHTML, like Gecko) Chrome/92.0.4515.159 Mobile Safari/537.36';

  var META = {
    tx: { name: '腾讯音乐', short: '腾讯', tag: 'tx' },
    wy: { name: '网易云', short: '网易', tag: 'wy' },
    kw: { name: '酷我', short: '酷我', tag: 'kw' },
    kg: { name: '酷狗', short: '酷狗', tag: 'kg' },
    mg: { name: '咪咕', short: '咪咕', tag: 'mg' }
  };
  var ORDER = ['tx', 'wy', 'kw', 'kg', 'mg'];

  var diag = {};   // platform -> {ok, error, at, count}

  function mark(platform, ok, error, count) {
    diag[platform] = {
      ok: !!ok,
      error: error ? String(error) : '',
      at: Date.now(),
      count: count || 0
    };
  }

  function pick(obj, paths, def) {
    for (var i = 0; i < paths.length; i++) {
      var p = paths[i];
      var cur = obj;
      var ok = true;
      for (var j = 0; j < p.length; j++) {
        if (cur == null) { ok = false; break; }
        cur = cur[p[j]];
      }
      if (ok && cur != null && cur !== '') return cur;
    }
    return def;
  }

  function asInt(v, def) {
    var n = parseInt(v, 10);
    return isNaN(n) ? (def || 0) : n;
  }

  function stripTags(s) {
    return String(s == null ? '' : s).replace(/<[^>]+>/g, '').trim();
  }

  function artistsOf(list, key) {
    if (!Array.isArray(list)) return '';
    var out = [];
    list.forEach(function (it) {
      var n = it && (it[key] || it.name || it.artistName);
      if (n) out.push(String(n).trim());
    });
    return out.filter(Boolean).join(' / ');
  }

  function coverUrl(url, base) {
    if (!url) return '';
    url = String(url).trim();
    if (url.indexOf('//') === 0) return 'https:' + url;
    if (/^http:\/\//i.test(url)) return 'https://' + url.slice(7);   // 页面是 https，避免混合内容被拦
    if (/^https:\/\//i.test(url)) return url;
    if (base) return base.replace(/\/+$/, '') + '/' + url.replace(/^\/+/, '');
    return url;
  }

  function fetchJson(opt) {
    return http.getJson(opt.url, {
      method: opt.method || 'GET',
      headers: opt.headers,
      body: opt.body,
      timeout: opt.timeout || 15000
    });
  }

  /* ======================================================================
     QQ 音乐
     ====================================================================== */
  function txNormalize(item) {
    if (!item) return null;
    var singer = item.singer || item.singers || [];
    var album = item.album || {};
    var file = item.file || {};
    var mid = item.mid || item.songmid || item.songMid;
    if (!mid) return null;
    var albumMid = album.mid || album.albumMid || item.albummid || '';
    var pic = albumMid ? 'https://y.gtimg.cn/music/photo_new/T002R300x300M000' + albumMid + '.jpg' : '';
    var types = {};
    if (file.size_128mp3) types['128k'] = { size: file.size_128mp3 };
    if (file.size_320mp3) types['320k'] = { size: file.size_320mp3 };
    if (file.size_flac) types.flac = { size: file.size_flac };
    if (file.size_hires) types.hires = { size: file.size_hires };
    return {
      uid: 'tx:' + mid,
      source: 'tx',
      id: mid,
      songmid: mid,
      songId: asInt(item.id, 0),
      mediaMid: file.media_mid || item.media_mid || item.strMediaMid || mid,
      albumId: asInt(album.id || item.albumid, 0),
      hash: '',
      rid: '',
      title: stripTags(item.name || item.title || item.songname),
      artist: artistsOf(singer, 'name'),
      album: stripTags(album.name || album.title || item.albumname),
      duration: asInt(item.interval, 0),
      pic: pic,
      types: types,
      raw: item
    };
  }

  function txSearch(kw, page, size) {
    var payload = {
      req_0: {
        module: 'music.search.SearchCgiService',
        method: 'DoSearchForQQMusicDesktop',
        param: { query: kw, page_num: page, num_per_page: size, search_type: 0 }
      }
    };
    return fetchJson({
      url: 'https://u.y.qq.com/cgi-bin/musicu.fcg',
      method: 'POST',
      headers: {
        'User-Agent': UA,
        'Referer': 'https://y.qq.com/',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      timeout: 15000
    }).then(function (j) {
      var q = j && j.req_0;
      if (!q || q.code !== 0) {
        var eBad = new Error('QQ搜索返回 code=' + (q && q.code));
        /* 只有「接口答了、但答得不对」才值得再去打旧接口。
           超时 / DNS / 连不上这类网络层错误打旧接口也是白等 12 秒（v1.9.18）。 */
        eBad.fallback = true;
        throw eBad;
      }
      var list = pick(q, [['data', 'body', 'song', 'list']], []);
      return (list || []).map(txNormalize).filter(Boolean);
    }).catch(function (e) {
      if (!e || !e.fallback) throw e;
      // 旧版 Web 接口兜底
      var qs = 'ct=24&qqmusic_ver=1298&new_json=1&remoteplace=txt.yqq.song&searchid=0'
        + '&t=0&aggr=1&cr=1&catZhida=1&lossless=0&flag_qc=1'
        + '&p=' + page + '&n=' + size + '&w=' + encodeURIComponent(kw)
        + '&g_tk=5381&loginUin=0&hostUin=0&format=json&inCharset=utf8'
        + '&outCharset=utf-8&notice=0&platform=yqq.json&needNewCode=0';
      return fetchJson({
        url: 'https://c.y.qq.com/soso/fcgi-bin/client_search_cp?' + qs,
        headers: { 'User-Agent': UA, 'Referer': 'https://y.qq.com/' },
        timeout: 12000
      }).then(function (j) {
        var list = pick(j, [['data', 'song', 'list']], []);
        if (!Array.isArray(list)) throw e;
        return list.map(function (it) {
          // 旧接口字段名不同
          return txNormalize({
            mid: it.songmid,
            name: it.songname,
            singer: (it.singer || []).map(function (s) { return { name: s.name }; }),
            album: { name: it.albumname, mid: it.albummid, id: it.albumid },
            interval: it.interval,
            file: { media_mid: it.media_mid || it.strMediaMid }
          });
        }).filter(Boolean);
      });
    });
  }

  /* ---------------- QQ 音乐：内置取链（不依赖音源脚本） ----------------
     腾讯有两套 vkey 接口，差别很关键：

       · vkey.GetVkeyServer / CgiGetVkey —— 只认 songmid。
         现在已经不给未登录请求下发 purl 了，一律 result=104003。
       · music.vkey.GetVkey  / UrlGetVkey —— 还必须带上「文件名」。
         只要文件名拼对，免登录也会给 128k 的 purl，而且拼出来的链接能直接下。

     早先面板和多数音源脚本用的都是第一套，所以永远拿不到 vkey。
     这里走第二套：一次把 flac / 320k / 128k / m4a 四个文件名都问一遍，
     谁有 purl 用谁；付费歌只回试听文件，那就退到 RS02 的试听地址。
     ====================================================================== */

  var TX_VKEY_URL = 'https://u.y.qq.com/cgi-bin/musicu.fcg';

  /* guid 是客户端标识，随便一串 10 位数字即可；同一次请求内保持一致 */
  var txGuid = (function () {
    var g = '';
    for (var i = 0; i < 10; i++) g += Math.floor(Math.random() * 10);
    return g;
  })();

  var txMediaCache = {};

  function txFileName(quality, media) {
    if (quality === 'flac') return 'F000' + media + '.flac';
    if (quality === '320k') return 'M800' + media + '.mp3';
    if (quality === '128k') return 'M500' + media + '.mp3';
    return 'C400' + media + '.m4a';
  }

  /* 想要的音质排在最前，后面依次降档；'auto' 就从最高开始全试 */
  function txQualityChain(want) {
    var all = ['flac', '320k', '128k', 'm4a'];
    var i = all.indexOf(want);
    return i < 0 ? all.slice(0) : all.slice(i);
  }

  function txAbsUrl(sip, purl) {
    if (/^https?:\/\//i.test(purl)) return purl;
    return String(sip || 'http://aqqmusic.tc.qq.com/').replace(/\/+$/, '') + '/'
         + String(purl).replace(/^\/+/, '');
  }

  /* 曲目详情：只为拿 media_mid（文件名要靠它拼），搜不到时兜底 */
  function txMediaMid(mid) {
    if (txMediaCache[mid]) return Promise.resolve(txMediaCache[mid]);
    return fetchJson({
      url: TX_VKEY_URL,
      method: 'POST',
      headers: {
        'User-Agent': UA,
        'Referer': 'https://y.qq.com/',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        comm: { ct: '19', cv: '1859', uin: '0' },
        req: {
          module: 'music.pf_song_detail_svr',
          method: 'get_song_detail_yqq',
          param: { song_type: 0, song_mid: mid }
        }
      }),
      timeout: 12000
    }).then(function (j) {
      var t = pick(j, [['req', 'data', 'track_info']], null);
      var m = t && t.file && t.file.media_mid;
      if (!m) throw new Error('查不到 media_mid');
      txMediaCache[mid] = m;
      return m;
    });
  }

  /* 一次问完所有音质 + 试听，返回 midurlinfo 数组 */
  function txVkey(mid, media, qualities) {
    var files = qualities.map(function (q) { return txFileName(q, media); });
    var trialAt = files.length;
    files.push('RS02' + mid + '.mp3');

    var body = {
      comm: { ct: '19', cv: '1859', uin: '0', format: 'json' },
      req: {
        module: 'music.vkey.GetVkey',
        method: 'UrlGetVkey',
        param: {
          guid: txGuid,
          filename: files,
          songmid: files.map(function () { return mid; }),
          songtype: files.map(function () { return 0; }),
          uin: '0',
          loginflag: 1,
          platform: '20'
        }
      }
    };

    return fetchJson({
      url: TX_VKEY_URL,
      method: 'POST',
      headers: {
        'User-Agent': UA,
        'Referer': 'https://y.qq.com/',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
      timeout: 12000
    }).then(function (j) {
      var d = pick(j, [['req', 'data']], null);
      if (!d) {
        var code = pick(j, [['req', 'code']], '?');
        var e0 = new Error('vkey 接口没有返回数据（code=' + code + '）');
        if (Number(code) === 104009) e0.txDead = true;
        throw e0;
      }
      /* 104009 / invalidq：腾讯对未登录请求的统一拒绝。既然已经确认这条路
         在本会话里走不通，就别每首歌都再白问一次，直接换备用接口。 */
      if (Number(d.retcode || 0) === 104009) {
        var e1 = new Error('官方 vkey 接口拒绝未登录请求（104009 invalidq）');
        e1.txDead = true;
        throw e1;
      }
      return { sip: (d.sip && d.sip[0]) || 'http://aqqmusic.tc.qq.com/',
               list: d.midurlinfo || [],
               trialAt: trialAt };
    });
  }

  /* ---------------- QQ 音乐：免登录直链兜底（vkeys） ----------------
     官方 music.vkey.GetVkey 现在对未登录请求一律回 104009（invalidq），
     purl 全空。api.vkeys.cn 用自己的票据池换一条能直接下载的 CDN 直链：
     免费歌给完整的 M500/M800，VIP 歌给 RS02 试听（约 30 秒）。

     quality 是 vkeys 自己的档位编号，不是字节率：
       6=128k mp3  7=192k ogg  8=320k mp3  10=flac  11=24bit
       13/14=臻品全景声 / 母带（Q000 开头的 FLAC）
     它会「降档返回」—— 要 flac 却给 M800.mp3 是常态，所以实际音质必须
     从返回的文件名里认，不能信请求参数，否则会把 MP3 当 FLAC 缓存成
     .flac，foobar2000 打开就报「不支持的格式或文件损坏」。 */
  var TX_API_DEFAULT = 'https://api.vkeys.cn/v2/music/tencent/geturl';
  var TX_API_QUALITY = {
    '128k': '6', '192k': '7', '320k': '8',
    'flac': '10', 'flac24bit': '11', 'hires': '11',
    'atmos': '13', 'atmos_plus': '13', 'master': '14'
  };
  var txNativeBrokenAt = 0;

  /* QQ 音乐加密格式：vkey / 备用接口偶尔会下发 .mflac / .mgg / .qmc*，
     这种地址下载下来是乱码，foobar2000 播不了。取链层直接当失败处理，
     让调用方降档或换脚本，别等到下载完才报「不是音频」。 */
  var TX_ENC_RE = /\.(mflac|mgg|qmcflac|qmcogg|qmc0|qmc2|qmc3|qmc4|qmc6|qmc8|mgg1|mflac0|bkcmp3|bkcflac|tm0|tm2|tm3|tm6)$/i;
  function txEncExt(u) {
    var s = String(u || '');
    var q = s.indexOf('?');
    if (q >= 0) s = s.slice(0, q);
    var h = s.indexOf('#');
    if (h >= 0) s = s.slice(0, h);
    var m = TX_ENC_RE.exec(s);
    return m ? m[0].toLowerCase() : '';
  }

  function txApiBase() {
    var custom = '';
    try { custom = String(global.GetProperty('lx.txApi', '') || '').trim(); } catch (e) { custom = ''; }
    return custom || TX_API_DEFAULT;
  }

  function txQualityFromResult(label, url) {
    var s = String(label || '') + ' ' + String(url || '');
    if (/RS0[12]/i.test(s) || /试听/.test(s)) return { quality: '128k', trial: true };
    if (/Q000|臻品|全景声|母带/i.test(s)) return { quality: 'flac', trial: false };
    if (/F000|无损/i.test(s)) return { quality: 'flac', trial: false };
    if (/M800|HQ|高音质/i.test(s)) return { quality: '320k', trial: false };
    if (/O600|192/i.test(s)) return { quality: '192k', trial: false };
    if (/M500|标准/i.test(s)) return { quality: '128k', trial: false };
    if (/C400|m4a|有损/i.test(s)) return { quality: '128k', trial: false };
    return { quality: '', trial: false };
  }

  function txApiUrl(track, want) {
    var mid = track && (track.songmid || track.id);
    if (!mid) return Promise.reject(new Error('缺少 songmid'));
    var code = TX_API_QUALITY[want] || '10';    /* auto：先按无损问，拿不到会自然降档 */
    var base = txApiBase();
    var url = base + (base.indexOf('?') >= 0 ? '&' : '?')
            + 'mid=' + encodeURIComponent(mid) + '&quality=' + code;

    return fetchJson({
      url: url,
      headers: { 'User-Agent': UA, 'Referer': 'https://y.qq.com/' },
      timeout: 12000
    }).then(function (j) {
      var d = (j && j.data) || {};
      var u = d.url || '';
      if (Number(j && j.code) !== 200 || !u) {
        throw new Error('备用接口没有直链（' +
          ((j && (j.msg || j.message)) || ('code=' + (j && j.code))) + '）');
      }
      var enc = txEncExt(u);
      if (enc) throw new Error('备用接口返回加密格式 ' + enc + '，foobar2000 播不了');
      var info = txQualityFromResult(d.quality || d.level, u);
      return {
        url: String(u),
        quality: info.quality || want || '128k',
        trial: info.trial,
        via: 'vkeys',
        size: d.size || ''
      };
    });
  }

  /* 官方接口（可能可用，也可能永远 104009） */
  function txNativeUrl(track, want) {
    if (!track) return Promise.reject(new Error('没有曲目'));
    var mid = track.songmid || track.id;
    if (!mid) return Promise.reject(new Error('缺少 songmid'));

    if (txNativeBrokenAt && Date.now() - txNativeBrokenAt < 10 * 60 * 1000) {
      return Promise.reject(new Error('官方 vkey 接口已确认不可用（104009）'));
    }

    var qualities = txQualityChain(want);
    var media = track.mediaMid || '';
    /* 归一化时会把「查不到 media_mid」兜底成 songmid，那种值拼出来的文件名是错的 */
    if (media && media === mid) media = '';
    var prep = media ? Promise.resolve(media) : txMediaMid(mid);

    return prep.then(function (m) {
      return txVkey(mid, m, qualities).then(function (r) {
        for (var i = 0; i < qualities.length; i++) {
          var it = r.list[i] || {};
          if (!it.purl) continue;
          var nu = txAbsUrl(r.sip, it.purl);
          if (txEncExt(nu)) continue;      /* 加密格式：跳过，继续看下一档 */
          return { url: nu, quality: qualities[i], trial: false, mediaMid: m, via: '内置' };
        }
        var ti = r.list[r.trialAt] || {};
        if (ti.purl) {
          var tu = txAbsUrl(r.sip, ti.purl);
          if (!txEncExt(tu)) {
            return { url: tu, quality: '128k', trial: true, mediaMid: m, via: '内置' };
          }
        }
        var err = new Error('腾讯没有下发可用直链（VIP 专享 / 已下架 / 需要登录）');
        err.txEmpty = true;
        throw err;
      });
    }).then(null, function (e) {
      if (e && e.txDead) txNativeBrokenAt = Date.now();
      throw e;
    });
  }

  /* 对外：track → { url, quality, trial } —— 官方优先，失败或只给试听时走备用 */
  function txUrl(track, want) {
    return txNativeUrl(track, want).then(function (nat) {
      if (nat && !nat.trial) return nat;
      return txApiUrl(track, want).then(function (fb) {
        if (!fb.trial) return fb;
        return nat || fb;                 /* 两边都只给试听：优先官方 */
      }, function () {
        if (nat) return nat;
        throw new Error('腾讯没有下发可用直链');
      });
    }, function (e1) {
      return txApiUrl(track, want).then(null, function (e2) {
        var err = new Error('腾讯取链失败：' + ((e1 && e1.message) || e1) +
                            '；备用接口：' + ((e2 && e2.message) || e2));
        err.txEmpty = true;
        throw err;
      });
    });
  }

  /* 音质检测专用：**只问这一档**，不降级、不拿试听兜底。
     txUrl() 是给播放用的，会 flac→320k→128k 一路退，用它来检测等于
     「有 128k 就算 FLAC 可用」，整张表会全绿。检测要的是「这一档到底有没有」。
     备用接口会悄悄降档，所以这里还要核对它返回的文件名。 */
  function txUrlExact(track, want) {
    function accept(r, how) {
      if (!r || !r.url) throw new Error('这一档没有下发直链');
      if (r.trial) throw new Error('只有 30 秒试听，不算完整 ' + want);
      var got = r.quality || want;
      if (want === 'flac' && got !== 'flac') {
        throw new Error('实际给的是 ' + got + '，不是无损');
      }
      if (want === '320k' && !/^(320k|flac)$/.test(got)) {
        throw new Error('实际给的是 ' + got + '，达不到 320K');
      }
      if (want === '128k' && !got) throw new Error('认不出实际音质');
      return { url: r.url, quality: want, mediaMid: r.mediaMid || '', via: how };
    }

    return txNativeUrl(track, want).then(function (r) {
      try {
        return accept(r, '内置');
      } catch (eNat) {
        /* 官方只给试听 / 给低了一档：再问一次备用接口，它常常有完整版 */
        return txApiUrl(track, want).then(function (r2) {
          return accept(r2, 'vkeys');
        }, function () {
          throw eNat;
        });
      }
    }, function () {
      return txApiUrl(track, want).then(function (r) { return accept(r, 'vkeys'); });
    });
  }

  /* ---------------- QQ 音乐：专辑 / 歌单搜索 ---------------- */
  function txAlbumNormalize(it) {
    if (!it) return null;
    var mid = it.albumMID || it.albummid || it.albumMid;
    if (!mid) return null;
    return {
      uid: 'tx:album:' + mid,
      kind: 'album',
      source: 'tx',
      id: mid,
      name: stripTags(it.albumName || it.albumname),
      artist: stripTags(it.singerName || artistsOf(it.singer_list, 'name')),
      pic: coverUrl(it.albumPic || ('https://y.gtimg.cn/music/photo_new/T002R300x300M000' + mid + '.jpg')),
      count: asInt(it.song_count, 0),
      date: String(it.publicTime || ''),
      plays: 0,
      raw: it
    };
  }

  function txAlbumSearch(kw, page, size) {
    var qs = 'new_json=1&t=8&p=' + page + '&n=' + size + '&w=' + encodeURIComponent(kw)
      + '&format=json&platform=yqq&needNewCode=0';
    return fetchJson({
      url: 'https://c.y.qq.com/soso/fcgi-bin/client_search_cp?' + qs,
      headers: { 'User-Agent': UA, 'Referer': 'https://y.qq.com/' },
      timeout: 15000
    }).then(function (j) {
      if (j.code !== 0) throw new Error('QQ专辑搜索返回 code=' + j.code);
      var list = pick(j, [['data', 'album', 'list']], []);
      return (list || []).map(txAlbumNormalize).filter(Boolean);
    });
  }

  function txPlaylistNormalize(it) {
    if (!it) return null;
    var id = it.dissid || it.docid;
    if (!id) return null;
    return {
      uid: 'tx:playlist:' + id,
      kind: 'playlist',
      source: 'tx',
      id: String(id),
      name: stripTags(it.dissname),
      artist: stripTags(pick(it, [['creator', 'name']], '')),
      pic: coverUrl(it.imgurl || it.cover || ''),
      count: asInt(it.song_count || it.songnum, 0),
      date: String(it.createtime || ''),
      plays: asInt(it.listennum, 0),
      raw: it
    };
  }

  function txPlaylistSearch(kw, page, size) {
    var payload = {
      req_0: {
        module: 'music.search.SearchCgiService',
        method: 'DoSearchForQQMusicDesktop',
        param: { query: kw, page_num: page, num_per_page: size, search_type: 3, searchid: '0' }
      }
    };
    return fetchJson({
      url: 'https://u.y.qq.com/cgi-bin/musicu.fcg',
      method: 'POST',
      headers: {
        'User-Agent': UA,
        'Referer': 'https://y.qq.com/',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      timeout: 15000
    }).then(function (j) {
      var q = j && j.req_0;
      if (!q || q.code !== 0) throw new Error('QQ歌单搜索返回 code=' + (q && q.code));
      var list = pick(q, [['data', 'body', 'songlist', 'list']], []);
      return (list || []).map(txPlaylistNormalize).filter(Boolean);
    });
  }

  /* ======================================================================
     网易云音乐
     ====================================================================== */
  function wyNormalize(it) {
    if (!it || !it.id) return null;
    var al = it.al || it.album || {};
    var ar = it.ar || it.artists || [];
    return {
      uid: 'wy:' + it.id,
      source: 'wy',
      id: it.id,
      songmid: it.id,
      mediaMid: '',
      albumId: asInt(al.id, 0),
      hash: '',
      rid: '',
      title: stripTags(it.name),
      artist: artistsOf(ar),
      album: stripTags(al.name),
      duration: Math.round(asInt(it.dt || it.duration, 0) / 1000),
      pic: coverUrl(al.picUrl || al.pic || ''),
      types: {},
      raw: it
    };
  }

  function wySearch(kw, page, size) {
    var body = 's=' + encodeURIComponent(kw) + '&type=1'
      + '&offset=' + ((page - 1) * size) + '&limit=' + size + '&total=true';
    var headers = {
      'User-Agent': UA,
      'Referer': 'https://music.163.com/',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie': 'appver=2.0.2; os=pc; NMTID=00O'
    };
    return fetchJson({
      url: 'https://music.163.com/api/cloudsearch/pc',
      method: 'POST',
      headers: headers,
      body: body,
      timeout: 15000
    }).then(function (j) {
      if (j.code !== 200) throw new Error('网易云返回 code=' + j.code);
      var list = pick(j, [['result', 'songs']], []);
      return (list || []).map(wyNormalize).filter(Boolean);
    }).catch(function (e) {
      var qs = 's=' + encodeURIComponent(kw) + '&type=1'
        + '&offset=' + ((page - 1) * size) + '&limit=' + size;
      return fetchJson({
        url: 'https://music.163.com/api/search/get/web?' + qs,
        headers: { 'User-Agent': UA, 'Referer': 'https://music.163.com/' },
        timeout: 12000
      }).then(function (j) {
        var list = pick(j, [['result', 'songs']], []);
        if (!Array.isArray(list)) throw e;
        return list.map(wyNormalize).filter(Boolean);
      });
    });
  }

  /* ---------------- 网易云：专辑 / 歌单搜索 ---------------- */
  function wyCollectionSearch(kw, type, page, size, key) {
    var body = 's=' + encodeURIComponent(kw) + '&type=' + type
      + '&offset=' + ((page - 1) * size) + '&limit=' + size + '&total=true';
    return fetchJson({
      url: 'https://music.163.com/api/cloudsearch/pc',
      method: 'POST',
      headers: {
        'User-Agent': UA,
        'Referer': 'https://music.163.com/',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': 'appver=2.0.2; os=pc; NMTID=00O'
      },
      body: body,
      timeout: 15000
    }).then(function (j) {
      if (j.code !== 200) throw new Error('网易云搜索返回 code=' + j.code);
      var list = pick(j, [['result', key]], []);
      return Array.isArray(list) ? list : [];
    });
  }

  function wyAlbumNormalize(it) {
    if (!it || !it.id) return null;
    return {
      uid: 'wy:album:' + it.id,
      kind: 'album',
      source: 'wy',
      id: String(it.id),
      name: stripTags(it.name),
      artist: artistsOf(it.artists || it.artist, 'name'),
      pic: coverUrl(it.picUrl || it.pic || ''),
      count: asInt(it.size, 0),
      date: it.publishTime || 0,
      plays: 0,
      raw: it
    };
  }

  function wyPlaylistNormalize(it) {
    if (!it || !it.id) return null;
    return {
      uid: 'wy:playlist:' + it.id,
      kind: 'playlist',
      source: 'wy',
      id: String(it.id),
      name: stripTags(it.name),
      artist: stripTags(pick(it, [['creator', 'nickname']], '')),
      pic: coverUrl(it.coverImgUrl || it.picUrl || ''),
      count: asInt(it.trackCount, 0),
      date: it.createTime || 0,
      plays: asInt(it.playCount, 0),
      raw: it
    };
  }

  function wyAlbumSearch(kw, page, size) {
    return wyCollectionSearch(kw, 10, page, size, 'albums').then(function (list) {
      return list.map(wyAlbumNormalize).filter(Boolean);
    });
  }

  function wyPlaylistSearch(kw, page, size) {
    return wyCollectionSearch(kw, 1000, page, size, 'playlists').then(function (list) {
      return list.map(wyPlaylistNormalize).filter(Boolean);
    });
  }

  /* ======================================================================
     酷我音乐
     ====================================================================== */
  var kwToken = { value: '', at: 0 };

  function kwGetToken() {
    if (kwToken.value && Date.now() - kwToken.at < 8 * 60 * 1000) {
      return Promise.resolve(kwToken.value);
    }
    return http.request({
      url: 'https://www.kuwo.cn/',
      method: 'GET',
      headers: { 'User-Agent': UA },
      timeout: 12000
    }).then(function (r) {
      var raw = '';
      var hs = r.headers || {};
      Object.keys(hs).forEach(function (k) {
        if (/set-cookie/i.test(k)) raw += ';' + hs[k];
      });
      var m = /kw_token=([^;\s]+)/i.exec(raw);
      if (m) {
        kwToken.value = m[1];
        kwToken.at = Date.now();
        return m[1];
      }
      throw new Error('没有拿到 kw_token');
    });
  }

  function kwNormalize(it) {
    if (!it) return null;
    var rid = String(it.rid || it.musicrid || it.MUSICRID || it.DC_TARGETID || it.id || '').replace(/^MUSIC_/i, '');
    if (!rid) return null;
    var album = NM.text.decodeEntities(it.album || it.ALBUM || '');
    var pic = it.albumpic || it.web_albumpic_short || it.PICPATH || it.ALBUM_PIC || '';
    if (pic && !/^https?:/i.test(pic) && pic.indexOf('/') >= 0) {
      pic = coverUrl(pic, 'https://img1.kuwo.cn/star/albumcover');
    }
    return {
      uid: 'kw:' + rid,
      source: 'kw',
      id: rid,
      songmid: rid,
      mediaMid: '',
      albumId: asInt(it.albumid || it.ALBUMID, 0),
      hash: '',
      rid: rid,
      title: stripTags(NM.text.decodeEntities(it.name || it.NAME || it.songname)),
      artist: stripTags(NM.text.decodeEntities(it.artist || it.ARTIST || it.artistName || '')),
      album: stripTags(album),
      duration: asInt(it.song_duration || it.duration || it.DURATION, 0),
      pic: coverUrl(pic),
      types: {},
      raw: it
    };
  }

  /* 旧接口：search.kuwo.cn/r.s —— 目前唯一免 token 且稳定的入口 */
  function kwSearchOld(kw, page, size) {
    var qs = 'all=' + encodeURIComponent(kw) + '&ft=music&itemset=web_2013&client=kt'
      + '&pn=' + ((page - 1) * size) + '&rn=' + size + '&rformat=json&encoding=utf8';
    return fetchJson({
      url: 'http://search.kuwo.cn/r.s?' + qs,
      headers: { 'User-Agent': UA, 'Referer': 'https://www.kuwo.cn/' },
      timeout: 12000
    }).then(function (j) {
      var list = pick(j, [['abslist'], ['data', 'list']], []);
      if (!Array.isArray(list)) throw new Error('酷我搜索无结果结构');
      return list.map(kwNormalize).filter(Boolean);
    });
  }

  /* 新接口：需要 kw_token（站点已改成别的 cookie，命中率低，作兜底） */
  function kwSearchNew(kw, page, size) {
    return kwGetToken().then(function (token) {
      var qs = 'key=' + encodeURIComponent(kw) + '&pn=' + page + '&rn=' + size + '&httpsStatus=1';
      return fetchJson({
        url: 'https://www.kuwo.cn/api/www/search/searchMusicBykeyWord?' + qs,
        headers: {
          'User-Agent': UA,
          'Referer': 'https://www.kuwo.cn/search/list?key=' + encodeURIComponent(kw),
          'csrf': token,
          'Cookie': 'kw_token=' + token
        },
        timeout: 15000
      }).then(function (j) {
        if (j.code !== 200) throw new Error('酷我返回 code=' + j.code);
        var list = pick(j, [['data', 'list']], []);
        return (list || []).map(kwNormalize).filter(Boolean);
      });
    });
  }

  function kwSearch(kw, page, size) {
    return kwSearchOld(kw, page, size).catch(function () {
      return kwSearchNew(kw, page, size);
    });
  }

  /* ======================================================================
     酷狗音乐
     ====================================================================== */
  var KG_SECRET = 'NVPh5oo715z5DIWAeQlhMDsWXXQV4hwt';

  function kgSign(params) {
    var keys = Object.keys(params).sort();
    var str = KG_SECRET + keys.map(function (k) { return k + '=' + params[k]; }).join('') + KG_SECRET;
    return NM.crypto.md5(str);
  }

  function kgNormalize(it) {
    if (!it) return null;
    var hash = it.FileHash || it.hash || '';
    var title = it.SongName || it.songname || it.filename || '';
    if (!hash) return null;
    var types = {};
    if (it.FileHash) types['128k'] = { hash: it.FileHash };
    if (it.HQFileHash) types['320k'] = { hash: it.HQFileHash };
    if (it.SQFileHash) types.flac = { hash: it.SQFileHash };
    if (it.ResFileHash) types.flac24bit = { hash: it.ResFileHash };
    var pic = it.Image || it.trans_param || '';
    if (pic && pic.indexOf('{') === 0) {
      try {
        var tp = JSON.parse(pic);
        pic = tp && tp.union_cover ? String(tp.union_cover).replace('{size}', '400') : '';
      } catch (e) { pic = ''; }
    }
    return {
      uid: 'kg:' + hash,
      source: 'kg',
      id: hash,
      songmid: String(it.EMixSongID || it.AlbumID || hash),
      mediaMid: '',
      albumId: asInt(it.AlbumID, 0),
      hash: hash,
      rid: '',
      title: stripTags(title),
      artist: stripTags(it.SingerName || it.singername || ''),
      album: stripTags(it.AlbumName || it.album_name || ''),
      duration: asInt(it.Duration || it.duration, 0),
      pic: coverUrl(pic),
      types: types,
      raw: it
    };
  }

  function kgSearchV2(kw, page, size) {
    var params = {
      keyword: kw,
      page: page,
      pagesize: size,
      platform: 'WebFilter',
      userid: '-1',
      clientver: '2000',
      iscorrection: '1',
      privilege_filter: '0',
      filter: '10',
      area_code: '1',
      tag: 'em',
      sver: '5'
    };
    params.signature = kgSign(params);
    var qs = Object.keys(params).map(function (k) {
      return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]);
    }).join('&');
    return fetchJson({
      url: 'https://songsearch.kugou.com/song_search_v2?' + qs,
      headers: { 'User-Agent': UA, 'Referer': 'https://www.kugou.com/' },
      timeout: 15000
    }).then(function (j) {
      var list = pick(j, [['data', 'lists']], []);
      if (!Array.isArray(list)) throw new Error('酷狗搜索无结果结构');
      return list.map(kgNormalize).filter(Boolean);
    });
  }

  function kgSearchMobile(kw, page, size, cause) {
    var qs = 'format=json&keyword=' + encodeURIComponent(kw)
      + '&page=' + page + '&pagesize=' + size + '&showtype=1';
    return fetchJson({
      url: 'https://mobilecdn.kugou.com/api/v3/search/song?' + qs,
      headers: { 'User-Agent': UA, 'Referer': 'https://www.kugou.com/' },
      timeout: 12000
    }).then(function (j) {
      var list = pick(j, [['data', 'info']], []);
      if (!Array.isArray(list)) throw cause || new Error('酷狗搜索无结果结构');
      return list.map(function (it) {
        return kgNormalize({
          FileHash: it.hash,
          SongName: it.songname,
          SingerName: it.singername,
          AlbumName: it.album_name,
          AlbumID: it.album_id,
          Duration: it.duration,
          EMixSongID: it.audio_id
        });
      }).filter(Boolean);
    });
  }

  function kgSearch(kw, page, size) {
    return kgSearchV2(kw, page, size).catch(function (e) {
      return kgSearchMobile(kw, page, size, e);
    });
  }

  /* ======================================================================
     咪咕音乐
     ====================================================================== */
  function mgNormalize(it) {
    if (!it) return null;
    var id = it.id || it.copyrightId || it.songId;
    if (!id) return null;
    var singers = Array.isArray(it.singers)
      ? it.singers.map(function (s) { return s && s.name; }).filter(Boolean).join(' / ')
      : (it.singerName || it.singer || '');
    if (!singers && Array.isArray(it.singerList)) {
      singers = it.singerList.map(function (s) { return s && (s.name || s.singerName); })
        .filter(Boolean).join(' / ');
    }
    var albumObj = Array.isArray(it.albums) ? it.albums[0] : (it.album || null);
    var albumName = (albumObj && albumObj.name) || it.albumName || '';
    var pic = '';
    if (Array.isArray(it.imgItems) && it.imgItems.length) {
      var big = it.imgItems.filter(function (x) { return x && x.imgSizeType === '03'; })[0];
      pic = (big && big.img) || it.imgItems[0].img || '';
    }
    if (!pic) {
      var imgs = it.albumImgs || it.imgItems;
      if (Array.isArray(imgs) && imgs.length) {
        var b3 = imgs.filter(function (x) { return x && x.imgSizeType === '03'; })[0];
        pic = (b3 && b3.img) || imgs[0].img || '';
      }
    }
    if (!pic) pic = it.cover || it.albumPic || '';
    var dur = asInt(it.length || it.duration || 0, 0);
    if (dur > 1000) dur = Math.round(dur / 1000);
    return {
      uid: 'mg:' + id,
      source: 'mg',
      id: id,
      songmid: String(it.copyrightId || id),
      mediaMid: '',
      albumId: asInt(albumObj && albumObj.id, 0),
      hash: '',
      rid: '',
      title: stripTags(it.name || it.songName || ''),
      artist: stripTags(singers),
      album: stripTags(albumName),
      duration: dur,
      pic: coverUrl(pic),
      types: {},
      raw: it
    };
  }

  /* 咪咕新版检索接口（app.c.nf.migu.cn）；旧的 scr_search_tag 已改版为网页，不能用 */
  function mgSearch(kw, page, size) {
    var sw = encodeURIComponent(JSON.stringify({ song: 1, album: 0, singer: 0, tag: 0, mv: 0, playlist: 0 }));
    var qs = 'isCopyright=1&isQueryCover=1&pageNo=' + page + '&pageSize=' + size
      + '&searchSwitch=' + sw + '&sort=1&text=' + encodeURIComponent(kw);
    return fetchJson({
      url: 'https://app.c.nf.migu.cn/MIGUM2.0/v1.0/content/search_all.do?' + qs,
      headers: {
        'User-Agent': MIGU_UA,
        'Referer': 'https://app.c.nf.migu.cn/',
        'Accept': 'application/json'
      },
      timeout: 15000
    }).then(function (j) {
      if (j && j.code && j.code !== '000000') throw new Error('咪咕返回 code=' + j.code);
      var list = pick(j, [['songResultData', 'result'], ['songResultData', 'resultList']], []);
      if (!Array.isArray(list)) throw new Error('咪咕搜索无结果结构');
      return list.map(mgNormalize).filter(Boolean);
    });
  }

  /* ======================================================================
     对外
     ====================================================================== */
  var ADAPTERS = {
    tx: txSearch,
    wy: wySearch,
    kw: kwSearch,
    kg: kgSearch,
    mg: mgSearch
  };

  function searchOne(platform, keyword, page, size) {
    var fn = ADAPTERS[platform];
    if (!fn) return Promise.resolve({ platform: platform, ok: false, tracks: [], error: '不支持的平台' });

    function once() { return fn(keyword, page, size); }

    /* 平台接口现在经常「HTTP 200 但 list 为空」（限流 / 风控）。
       1.9.2 直接把它当成"搜索成功、0 条"，用户只看到「0 首」看不出原因。
       这里空结果再试一次；还是空就明确告诉用户是接口的问题。 */
    function retryEmpty() {
      return new Promise(function (r) { setTimeout(r, 260); }).then(once).then(function (t2) {
        if (t2 && t2.length) {
          mark(platform, true, '', t2.length);
          return { platform: platform, ok: true, tracks: t2, error: '' };
        }
        var msg = '没有搜到结果（平台接口可能被限流，换个关键词或稍后重试）';
        mark(platform, false, msg, 0);
        return { platform: platform, ok: false, tracks: [], error: msg };
      }, function (e2) {
        var m2 = (e2 && e2.message) || String(e2);
        mark(platform, false, m2, 0);
        return { platform: platform, ok: false, tracks: [], error: m2 };
      });
    }

    return once().then(function (tracks) {
      if (tracks && tracks.length) {
        mark(platform, true, '', tracks.length);
        return { platform: platform, ok: true, tracks: tracks, error: '' };
      }
      return retryEmpty();
    }, function (e) {
      mark(platform, false, (e && e.message) || e, 0);
      return { platform: platform, ok: false, tracks: [], error: (e && e.message) || String(e) };
    });
  }

  /**
   * @param {string[]} platforms
   * @returns {Promise<Array<{platform, ok, tracks, error}>>}
   */
  function search(platforms, keyword, page, size) {
    keyword = String(keyword || '').trim();
    if (!keyword) return Promise.resolve([]);
    page = Math.max(1, page | 0);
    size = Math.min(50, Math.max(5, size | 0 || 30));
    var list = (platforms && platforms.length ? platforms : ORDER).filter(function (p) {
      return ADAPTERS[p];
    });
    return Promise.all(list.map(function (p) {
      return searchOne(p, keyword, page, size);
    }));
  }

  /* ---------------- 专辑 / 歌单：搜索与详情 ---------------- */
  var COLLECTION_ADAPTERS = {
    tx: { album: txAlbumSearch, playlist: txPlaylistSearch },
    wy: { album: wyAlbumSearch, playlist: wyPlaylistSearch }
  };
  var COLLECTION_PLATFORMS = ['tx', 'wy'];

  function searchCollections(platforms, keyword, kind, page, size) {
    keyword = String(keyword || '').trim();
    if (!keyword) return Promise.resolve([]);
    page = Math.max(1, page | 0);
    size = Math.min(50, Math.max(5, size | 0 || 30));
    var list = (platforms && platforms.length ? platforms : COLLECTION_PLATFORMS).filter(function (p) {
      return COLLECTION_ADAPTERS[p] && COLLECTION_ADAPTERS[p][kind];
    });
    return Promise.all(list.map(function (p) {
      return COLLECTION_ADAPTERS[p][kind](keyword, page, size).then(function (items) {
        return { platform: p, ok: true, items: items, error: '' };
      }, function (e) {
        return { platform: p, ok: false, items: [], error: (e && e.message) || String(e) };
      });
    }));
  }

  function collectionTracks(platform, kind, id) {
    id = String(id || '');
    if (!id) return Promise.reject(new Error('缺少专辑 / 歌单 ID'));
    if (platform === 'tx' && kind === 'album') return txAlbumTracks(id);
    if (platform === 'tx' && kind === 'playlist') return txPlaylistTracks(id);
    if (platform === 'wy' && kind === 'album') return wyAlbumTracks(id);
    if (platform === 'wy' && kind === 'playlist') return wyPlaylistTracks(id);
    if (platform === 'kg' && kind === 'playlist') return kgPlaylistTracks(id);
    return Promise.reject(new Error('暂不支持该平台的专辑 / 歌单'));
  }

  function txAlbumTracks(id) {
    var url = 'https://c.y.qq.com/v8/fcg-bin/fcg_v8_album_info_cp.fcg?albummid=' + encodeURIComponent(id)
      + '&format=json&platform=yqq&needNewCode=0';
    return fetchJson({
      url: url,
      headers: { 'User-Agent': UA, 'Referer': 'https://y.qq.com/' },
      timeout: 15000
    }).then(function (j) {
      if (j.code !== 0) throw new Error('QQ专辑详情返回 code=' + j.code);
      var d = j.data || {};
      var tracks = (d.list || []).map(function (it) {
        return txNormalize({
          mid: it.songmid,
          name: it.songname,
          interval: it.interval,
          singer: it.singer,
          album: { name: d.name || it.albumname, mid: it.albummid || id, id: it.albumid || d.albumid },
          file: it.file || {}
        });
      }).filter(Boolean);
      return {
        name: stripTags(d.name || ''),
        pic: 'https://y.gtimg.cn/music/photo_new/T002R300x300M000' + id + '.jpg',
        tracks: tracks
      };
    });
  }

  function txPlaylistTracks(id) {
    var url = 'https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg?type=1&json=1&utf8=1&onlysong=0'
      + '&new_format=1&disstid=' + encodeURIComponent(id) + '&format=json&platform=yqq&needNewCode=0';
    return fetchJson({
      url: url,
      headers: { 'User-Agent': UA, 'Referer': 'https://y.qq.com/' },
      timeout: 15000
    }).then(function (j) {
      var cd = j && j.cdlist && j.cdlist[0];
      if (!cd) throw new Error('QQ歌单详情为空');
      return {
        name: stripTags(cd.dissname || ''),
        pic: coverUrl(cd.logo || cd.dir_pic_url2 || ''),
        tracks: (cd.songlist || []).map(txNormalize).filter(Boolean)
      };
    });
  }

  function wyAlbumTracks(id) {
    var url = 'https://music.163.com/api/v1/album/' + encodeURIComponent(id);
    return fetchJson({
      url: url,
      headers: { 'User-Agent': UA, 'Referer': 'https://music.163.com/' },
      timeout: 15000
    }).then(function (j) {
      if (j.code !== 200) throw new Error('网易云专辑详情返回 code=' + j.code);
      var al = j.album || {};
      return {
        name: stripTags(al.name || ''),
        pic: coverUrl(al.picUrl || ''),
        tracks: (j.songs || []).map(wyNormalize).filter(Boolean)
      };
    });
  }

  function wySongDetails(ids) {
    var out = [];
    function next(i) {
      if (i >= ids.length) return Promise.resolve(out);
      var chunk = ids.slice(i, i + 200);
      return fetchJson({
        url: 'https://music.163.com/api/song/detail?ids=[' + chunk.join(',') + ']',
        headers: { 'User-Agent': UA, 'Referer': 'https://music.163.com/' },
        timeout: 15000
      }).then(function (j) {
        (j.songs || []).forEach(function (s) { out.push(s); });
        return next(i + 200);
      });
    }
    return next(0);
  }

  function wyPlaylistTracks(id) {
    var url = 'https://music.163.com/api/v6/playlist/detail?id=' + encodeURIComponent(id) + '&n=1000&s=8';
    return fetchJson({
      url: url,
      headers: { 'User-Agent': UA, 'Referer': 'https://music.163.com/' },
      timeout: 15000
    }).then(function (j) {
      if (j.code !== 200) throw new Error('网易云歌单详情返回 code=' + j.code);
      var pl = j.playlist || {};
      var name = stripTags(pl.name || '');
      var pic = coverUrl(pl.coverImgUrl || '');
      var ids = (pl.trackIds || []).map(function (x) { return x && x.id; }).filter(Boolean);
      if (ids.length && ids.length > (pl.tracks || []).length) {
        return wySongDetails(ids).then(function (songs) {
          return { name: name, pic: pic, tracks: songs.map(wyNormalize).filter(Boolean) };
        });
      }
      return {
        name: name,
        pic: pic,
        tracks: (pl.tracks || []).map(wyNormalize).filter(Boolean)
      };
    });
  }

  /* ======================================================================
     排行榜
     榜单表来自洛雪音乐助手（LX Music）的榜单定义，接口用各平台公开入口。
     ====================================================================== */
  var BOARDS = {
    tx: [
      { id: '26', name: '热歌榜' }, { id: '27', name: '新歌榜' }, { id: '62', name: '飙升榜' },
      { id: '4', name: '流行指数榜' }, { id: '58', name: '说唱榜' }, { id: '57', name: '喜力电音榜' },
      { id: '5', name: '内地榜' }, { id: '3', name: '欧美榜' }, { id: '59', name: '香港地区榜' },
      { id: '61', name: '台湾地区榜' }, { id: '17', name: '日本榜' }, { id: '16', name: '韩国榜' },
      { id: '29', name: '影视金曲榜' }, { id: '65', name: '国风热歌榜' }, { id: '72', name: '动漫音乐榜' }
    ],
    wy: [
      { id: '19723756', name: '飙升榜' }, { id: '3779629', name: '新歌榜' }, { id: '3778678', name: '热歌榜' },
      { id: '2884035', name: '原创榜' }, { id: '991319590', name: '说唱榜' }, { id: '1978921795', name: '电音榜' },
      { id: '71385702', name: 'ACG榜' }, { id: '745956260', name: '韩语榜' }, { id: '2809513713', name: '欧美热歌榜' },
      { id: '5059642708', name: '国风榜' }, { id: '5059661515', name: '民谣榜' }, { id: '5059633707', name: '摇滚榜' }
    ],
    kw: [
      { id: '93', name: '飙升榜' }, { id: '17', name: '新歌榜' }, { id: '16', name: '热歌榜' },
      { id: '158', name: '抖音热歌榜' }, { id: '284', name: '热评榜' }, { id: '290', name: 'ACG新歌榜' },
      { id: '278', name: '古风音乐榜' }, { id: '104', name: '华语榜' }, { id: '182', name: '粤语榜' },
      { id: '22', name: '欧美榜' }, { id: '184', name: '韩语榜' }, { id: '183', name: '日语榜' }
    ],
    kg: [
      { id: '8888', name: 'TOP500' }, { id: '6666', name: '飙升榜' }, { id: '52144', name: '抖音热歌榜' },
      { id: '52767', name: '快手热歌榜' }, { id: '23784', name: '网络红歌榜' }, { id: '44412', name: '说唱先锋榜' },
      { id: '31308', name: '内地榜' }, { id: '33160', name: '电音榜' }, { id: '31313', name: '香港地区榜' },
      { id: '54848', name: '台湾地区榜' }, { id: '31310', name: '欧美榜' }, { id: '33162', name: 'ACG新歌榜' }
    ],
    mg: [
      { id: '27553319', name: '尖叫新歌榜' }, { id: '27186466', name: '尖叫热歌榜' }, { id: '27553408', name: '尖叫原创榜' },
      { id: '23189800', name: '港台榜' }, { id: '23189399', name: '内地榜' }, { id: '19190036', name: '欧美榜' },
      { id: '23189813', name: '日韩榜' }, { id: '15140034', name: '网络榜' }, { id: '15140045', name: 'KTV榜' }
    ]
  };

  function loadTxBoard(boardId, limit) {
    var body = {
      toplist: {
        module: 'musicToplist.ToplistInfoServer',
        method: 'GetDetail',
        param: { topid: Number(boardId), num: limit }
      },
      comm: { uin: 0, format: 'json', ct: 20, cv: 1859 }
    };
    return fetchJson({
      url: 'https://u.y.qq.com/cgi-bin/musicu.fcg',
      method: 'POST',
      headers: { 'User-Agent': UA, 'Referer': 'https://y.qq.com/', 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      timeout: 15000
    }).then(function (j) {
      if (j.code !== 0) throw new Error('QQ榜单返回 code=' + j.code);
      var list = pick(j, [['toplist', 'data', 'songInfoList']], []);
      return list.map(function (it) {
        var album = it.album || {};
        return txNormalize({
          mid: it.mid,
          name: it.title,
          interval: it.interval,
          singer: (it.singer || []).map(function (s) { return { name: s.name }; }),
          album: { name: album.name, mid: album.mid, id: album.id },
          file: it.file || {}
        });
      }).filter(Boolean);
    });
  }

  function loadWyBoard(boardId, limit) {
    var url = 'https://music.163.com/api/v6/playlist/detail?id=' + encodeURIComponent(boardId) + '&n=' + limit + '&s=8';
    return fetchJson({
      url: url,
      headers: { 'User-Agent': UA, 'Referer': 'https://music.163.com/', 'Cookie': 'appver=2.0.2' },
      timeout: 15000
    }).then(function (j) {
      if (j.code !== 200) throw new Error('网易云榜单返回 code=' + j.code);
      var list = pick(j, [['playlist', 'tracks']], []);
      return list.slice(0, limit).map(wyNormalize).filter(Boolean);
    });
  }

  function loadKwBoard(boardId, limit) {
    var url = 'http://kbangserver.kuwo.cn/ksong.s?from=pc&fmt=json&pn=0&rn=' + limit
      + '&type=bang&data=content&id=' + encodeURIComponent(boardId) + '&show_copyright_off=0&pcmp4=1&isbang=1';
    return fetchJson({
      url: url,
      headers: { 'User-Agent': UA, 'Referer': 'https://www.kuwo.cn/' },
      timeout: 15000
    }).then(function (j) {
      var list = pick(j, [['musiclist'], ['abslist']], []);
      return list.slice(0, limit).map(function (it) {
        return kwNormalize({
          rid: it.id || it.rid,
          name: it.name,
          artist: it.artist,
          album: it.album,
          albumid: it.albumid,
          duration: it.duration
        });
      }).filter(Boolean);
    });
  }

  function loadKgBoard(boardId, limit) {
    var url = 'http://mobilecdnbj.kugou.com/api/v3/rank/song?version=9108&ranktype=1&plat=0&pagesize=' + limit
      + '&area_code=1&page=1&rankid=' + encodeURIComponent(boardId) + '&with_res_tag=0';
    return fetchJson({
      url: url,
      headers: { 'User-Agent': UA, 'Referer': 'https://www.kugou.com/' },
      timeout: 15000
    }).then(function (j) {
      var list = pick(j, [['data', 'info']], []);
      return list.map(function (it) {
        var authors = (it.authors || []).map(function (a) { return a && a.author_name; }).filter(Boolean);
        return kgNormalize({
          FileHash: it.hash || it['128hash'] || it.HASH,
          HQFileHash: it['320hash'],
          SQFileHash: it.sqhash,
          ResFileHash: it['reshash'] || it.hash_flac,
          SongName: it.songname,
          SingerName: authors.join(' / ') || it.singername,
          AlbumName: it.album_name,
          AlbumID: it.album_id,
          Duration: it.duration || it.duration_high,
          EMixSongID: it.audio_id,
          Image: it.imgurl
        });
      }).filter(Boolean);
    });
  }

  function loadMgBoard(boardId, limit) {
    var url = 'https://app.c.nf.migu.cn/MIGUM2.0/v1.0/content/querycontentbyId.do?columnId='
      + encodeURIComponent(boardId) + '&needAll=0';
    return fetchJson({
      url: url,
      headers: { 'User-Agent': MIGU_UA, 'Referer': 'https://app.c.nf.migu.cn/' },
      timeout: 15000
    }).then(function (j) {
      if (j && j.code && j.code !== '000000') throw new Error('咪咕榜单返回 code=' + j.code);
      var contents = pick(j, [['columnInfo', 'contents']], []);
      var list = contents.map(function (c) { return c && c.objectInfo; }).filter(Boolean);
      return list.slice(0, limit).map(function (it) {
        return mgNormalize({
          id: it.songId || it.contentId,
          copyrightId: it.copyrightId,
          songName: it.songName,
          singer: it.singer,
          album: it.album,
          albumId: it.albumId,
          albumImgs: it.albumImgs
        });
      }).filter(Boolean);
    });
  }

  var BOARD_LOADERS = { tx: loadTxBoard, wy: loadWyBoard, kw: loadKwBoard, kg: loadKgBoard, mg: loadMgBoard };

  function loadBoard(platform, boardId, limit) {
    var fn = BOARD_LOADERS[platform];
    if (!fn) return Promise.reject(new Error('不支持的平台榜单：' + platform));
    return fn(boardId, limit || 50).then(function (tracks) {
      mark(platform, true, '', tracks.length);
      return { platform: platform, ok: true, tracks: tracks, error: '' };
    }, function (e) {
      mark(platform, false, (e && e.message) || e, 0);
      return { platform: platform, ok: false, tracks: [], error: (e && e.message) || String(e) };
    });
  }

  /* ======================================================================
     评论（网易云 / QQ 音乐）
     ====================================================================== */
  function wyComments(id, size) {
    var url = 'https://music.163.com/api/v1/resource/comments/R_SO_4_' + encodeURIComponent(id) +
      '?limit=' + (size || 30) + '&offset=0';
    return fetchJson({
      url: url,
      headers: { 'User-Agent': UA, 'Referer': 'https://music.163.com/', 'Cookie': 'appver=2.0.2' },
      timeout: 15000
    }).then(function (j) {
      var list = (j.hotComments || []).concat(j.comments || []);
      var seen = {};
      return list.map(function (c) {
        return {
          user: (c.user && c.user.nickname) || '匿名',
          text: c.content || '',
          likes: c.likedCount || 0,
          time: c.time || 0
        };
      }).filter(function (c) {
        if (!c.text) return false;
        var k = c.user + '|' + c.text.slice(0, 60);
        if (seen[k]) return false;      /* 热评与最新列表会重叠 */
        seen[k] = 1;
        return true;
      });
    });
  }

  function txComments(mid, size) {
    var qs = 'g_tk=5381&loginUin=0&hostUin=0&format=json&inCharset=utf8&outCharset=2052&notice=0' +
      '&platform=yqq.json&needNewCode=0&cid=205360772&reqtype=2&biztype=1&topid=' + encodeURIComponent(mid) +
      '&cmd=6&needmusiccrit=0&pagenum=0&pagesize=' + (size || 25);
    return fetchJson({
      url: 'https://c.y.qq.com/base/fcgi-bin/fcg_global_comment_h5.fcg?' + qs,
      headers: { 'User-Agent': UA, 'Referer': 'https://y.qq.com/' },
      timeout: 15000
    }).then(function (j) {
      var list = (j.comment && j.comment.commentlist) || [];
      return list.map(function (c) {
        return {
          user: c.nick || c.username || '匿名',
          text: c.rootcommentcontent || c.content || '',
          likes: c.praisenum || 0,
          time: c.time || 0
        };
      }).filter(function (c) { return !!c.text; });
    });
  }

  /* 比对用：去掉括号备注（Live/翻自…）与标点，只留歌名主体 */
  function titleNorm(s) {
    return String(s == null ? '' : s).toLowerCase()
      .replace(/[（(\[【][^）)\]】]*[）)\]】]/g, '')
      .replace(/[\s·・.\-_'’"“”,，、;；\/&＋+!！?？]/g, '');
  }

  /* 按「歌名 + 歌手」找同曲，返回按相似度排序的候选（同名翻唱很多，取最像的） */
  function searchCandidates(platform, track, size) {
    var q = [track.title, track.artist].filter(Boolean).join(' ');
    if (!q) return Promise.resolve([]);
    return searchOne(platform, q, 1, size || 10).then(function (g) {
      if (!g.ok || !g.tracks.length) return [];
      var want = titleNorm(track.title);
      if (!want) return [];
      var artists = String(track.artist || '').toLowerCase()
        .split(/[、,，;；\/&＋+~]|\s+(?:feat\.?|ft\.?|vs\.?|with)\s+/i)
        .map(function (s) { return s.trim(); })
        .filter(Boolean);
      var scored = [];
      g.tracks.forEach(function (t) {
        var tn = titleNorm(t.title);
        if (!tn) return;
        var titleHit = tn === want ? 3 : (tn.indexOf(want) >= 0 ? 2 : (want.indexOf(tn) >= 0 ? 1 : 0));
        if (!titleHit) return;                       /* 歌名都不沾边就丢掉，避免搜到无关曲 */
        var ta = String(t.artist || '').toLowerCase();
        var artistHit = 0;
        artists.forEach(function (a) { if (a && ta.indexOf(a) >= 0) artistHit = 2; });
        var pop = Number((t.raw && (t.raw.pop != null ? t.raw.pop : t.raw.popularity)) || 0);
        scored.push({ t: t, score: titleHit + artistHit, pop: pop });
      });
      scored.sort(function (x, y) {
        if (y.score !== x.score) return y.score - x.score;
        return y.pop - x.pop;                        /* 同分取热度高的（正版原曲） */
      });
      return scored.map(function (s) { return s.t; });
    }, function () { return []; });
  }

  /* 网易云图片 CDN 支持 ?param=宽y高，直接按 600 宽取图 */
  function wyPic600(u) {
    var s = String(u == null ? '' : u).trim();
    if (!s) return '';
    s = s.replace(/^http:\/\//i, 'https://');
    s = s.replace(/([?&])param=[^&]*/gi, '$1').replace(/[?&]$/, '');
    return s + (s.indexOf('?') >= 0 ? '&' : '?') + 'param=600y600';
  }

  /* 封面一律走网易云：
     - 本身就是网易云的曲目，直接把图换成 600x600
     - 其它平台 / 本地文件，用「歌名 + 歌手」在网易云匹配同一首，取它的专辑图
     - 匹配不到才退回原平台封面（面板会再缩放到 600 宽） */
  function wyCover(track) {
    if (!track) return Promise.resolve('');
    var own = String(track.pic || '').trim();
    if (track.source === 'wy' && own) return Promise.resolve(wyPic600(own));
    var want = titleNorm(track.title);
    return searchCandidates('wy', track, 6).then(function (list) {
      for (var i = 0; i < list.length; i++) {
        var t = list[i];
        var p = String(t.pic || '').trim();
        if (!p) continue;
        /* 歌名要真的对得上，避免给冷门歌配一张无关专辑图 */
        var tn = titleNorm(t.title);
        if (want && tn && tn !== want && tn.indexOf(want) < 0 && want.indexOf(tn) < 0) continue;
        return wyPic600(p);
      }
      return own;
    }, function () {
      return own;
    });
  }

  /* 按「歌名 + 歌手」在指定平台找最像的一首（本地曲目用） */
  function searchBest(platform, track) {
    return searchCandidates(platform, track, 10).then(function (list) {
      return list.length ? list[0] : null;
    });
  }

  /* 评论一律取网易云：曲目本身是网易云的直接用 ID，其它平台 / 本地文件按「歌名+歌手」匹配 */
  function getComments(track) {
    if (!track) return Promise.reject(new Error('没有正在播放的曲目'));

    function txFallback() {
      if (track.source !== 'tx') throw new Error('没能在网易云匹配到这首歌的评论');
      return txComments(track.songmid || track.mediaMid, 25);
    }

    /* 同名翻唱 / 钢琴版经常一条评论都没有，按相似度依次试 */
    function tryCandidates(list) {
      var i = 0;
      function next() {
        if (i >= list.length) return txFallback();
        var hit = list[i++];
        if (!hit || !hit.id) return next();
        return wyComments(hit.id, 30).then(function (c) {
          return (c && c.length) ? c : next();
        }, function () { return next(); });
      }
      return list.length ? next() : txFallback();
    }

    function others(cands) {
      return cands.filter(function (c) { return String(c.id) !== String(track.id); });
    }

    if (track.source === 'wy' && track.id) {
      return wyComments(track.id, 30).then(function (list) {
        if (list && list.length) return list;
        return searchCandidates('wy', track, 6).then(function (cands) {
          return tryCandidates(others(cands));
        });
      }, function () {
        return searchCandidates('wy', track, 6).then(function (cands) {
          return tryCandidates(others(cands));
        });
      });
    }

    return searchCandidates('wy', track, 6).then(tryCandidates, function () {
      return txFallback();
    });
  }

  /* 歌手名可能是「周杰伦、费玉清」「陈奕迅 Eason Chan」「A feat. B」这种组合，拆出候选名逐个查 */
  function artistNameCandidates(name) {
    var out = [];
    function add(s) {
      s = String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
      if (s && out.indexOf(s) < 0) out.push(s);
    }
    add(name);
    add(String(name).replace(/[（(\[【][^）)\]】]*[）)\]】]/g, ''));
    String(name).split(/[、,，;；\/&＋+~]|\s+(?:feat\.?|ft\.?|vs\.?|with)\s+/i).forEach(add);
    /* 「陈奕迅 Eason Chan」这类中英混写：空格再拆一层，长名优先保留 */
    String(name).split(/\s+/).forEach(function (tok) {
      if (tok.length >= 2) add(tok);
    });
    return out.slice(0, 6);
  }

  function normArtistName(s) {
    return String(s == null ? '' : s).toLowerCase()
      .replace(/[\s·・.\-_'’"“”()（）\[\]【】]/g, '');
  }

  /* 歌手信息（网易云：搜索歌手 → 详情/简介，多个接口依次尝试） */
  function artistInfo(name) {
    name = String(name || '').trim();
    if (!name) return Promise.reject(new Error('不知道歌手是谁'));
    var h = { 'User-Agent': UA, 'Referer': 'https://music.163.com/', 'Cookie': 'appver=2.0.2' };
    function tryGet(url) {
      return fetchJson({ url: url, headers: h, timeout: 15000 }).then(function (j) { return j; }, function () { return null; });
    }

    /* 同名/别名命中里取「作品最多」的那个：避免「Jay Chou」搜到同名的冷门歌手 */
    function searchArtist(q) {
      return tryGet('https://music.163.com/api/search/get?type=100&limit=10&s=' + encodeURIComponent(q))
        .then(function (j) {
          var arr = (j && pick(j, [['result', 'artists']], [])) || [];
          if (!Array.isArray(arr) || !arr.length) return null;
          var want = normArtistName(q);
          var hits = arr.filter(function (a) {
            if (!a || !a.id) return false;
            if (normArtistName(a.name) === want) return true;
            return Array.isArray(a.alias) && a.alias.some(function (x) {
              return normArtistName(x) === want;
            });
          });
          if (!hits.length) return arr[0];
          hits.sort(function (x, y) {
            return asInt(y.musicSize, 0) - asInt(x.musicSize, 0);
          });
          return hits[0];
        });
    }

    function findArtist() {
      var cands = artistNameCandidates(name);
      var i = 0;
      function next() {
        if (i >= cands.length) return Promise.resolve(null);
        var q = cands[i++];
        return searchArtist(q).then(function (a) { return a || next(); });
      }
      return next().then(function (a) {
        if (a && a.id) return a;
        return fetchJson({
          url: 'https://music.163.com/api/search/get',
          method: 'POST',
          headers: Object.assign({ 'Content-Type': 'application/x-www-form-urlencoded' }, h),
          body: 's=' + encodeURIComponent(name) + '&type=100&limit=10&offset=0',
          timeout: 15000
        }).then(function (j2) {
          var b = j2 && pick(j2, [['result', 'artists']], [])[0];
          return b && b.id ? b : null;
        }, function () { return null; });
      });
    }

    /* v1.9.21：详情接口顺带就给了 hotSongs（热门 50 首），不再单独求一次
       「歌手歌曲」接口 —— 艺人介绍页左边那 15 首要能马上排出来。 */
    function hotsOf(d) {
      var list = (d && Array.isArray(d.hotSongs)) ? d.hotSongs : [];
      return list.map(wyNormalize).filter(Boolean);
    }

    function detail(id) {
      return tryGet('https://music.163.com/api/v1/artist/' + encodeURIComponent(id)).then(function (d) {
        var ar = d && d.artist;
        if (ar && (ar.briefDesc || ar.name)) return { artist: ar, hots: hotsOf(d) };
        return tryGet('https://music.163.com/api/artist/' + encodeURIComponent(id)).then(function (d2) {
          var ar2 = (d2 && d2.artist) || null;
          return ar2 ? { artist: ar2, hots: hotsOf(d2) } : null;
        });
      });
    }

    function intro(id) {
      return tryGet('https://music.163.com/api/artist/introduction?id=' + encodeURIComponent(id)).then(function (d) {
        var list = (d && d.introduction) || [];
        return list.map(function (it) {
          return { title: it.ti || '', text: it.txt || '' };
        }).filter(function (it) { return !!it.text; });
      });
    }

    return findArtist().then(function (a) {
      if (!a) throw new Error('没在网易云找到这位歌手');
      return Promise.all([detail(a.id), intro(a.id)]).then(function (res) {
        var d0 = res[0] || {};
        var ar = d0.artist || a;
        return {
          id: ar.id || a.id,
          name: ar.name || a.name || name,
          pic: ar.picUrl || ar.img1v1Url || a.picUrl || a.img1v1Url || '',
          brief: ar.briefDesc || a.briefDesc || '',
          sections: res[1] || [],
          albums: ar.albumSize || a.albumSize || 0,
          songs: ar.musicSize || a.musicSize || 0,
          /* 热门歌曲（v1.9.21）：艺人介绍页左下的「热门歌曲 15 首」直接用这份，
             已经有完整 track（source/id/title/artist/duration），拿到就能点播 */
          tracks: d0.hots || [],
          hotComplete: (d0.hots || []).length >= 15
        };
      });
    });
  }

  /* 热门歌曲（单独取）：艺人资料里带回来的那 50 首不够 / 没有时补一次，
     两个接口依次试 —— /api/v1/artist/{id} 的 hotSongs、/api/artist/top/song */
  function artistHotSongs(id, limit) {
    id = String(id || '').trim();
    if (!id) return Promise.reject(new Error('缺少歌手 ID'));
    var n = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    function cut(list) {
      return list.map(wyNormalize).filter(Boolean).slice(0, n);
    }
    var H = { 'User-Agent': UA, 'Referer': 'https://music.163.com/', 'Cookie': 'appver=2.0.2' };
    return fetchJson({
      url: 'https://music.163.com/api/v1/artist/' + encodeURIComponent(id),
      headers: H,
      timeout: 15000
    }).then(function (j) {
      var list = cut((j && Array.isArray(j.hotSongs)) ? j.hotSongs : []);
      if (list.length) return list;
      throw new Error('empty');
    }).catch(function () {
      return fetchJson({
        url: 'https://music.163.com/api/artist/top/song?id=' + encodeURIComponent(id),
        headers: H,
        timeout: 15000
      }).then(function (j2) {
        var list = cut((j2 && Array.isArray(j2.songs)) ? j2.songs : []);
        if (!list.length) throw new Error('网易云没有返回这位歌手的热门歌曲');
        return list;
      });
    });
  }

  /* ======================================================================
     歌词（各平台公开接口；失败时用「歌名 + 歌手」在网易云兜底）
     ====================================================================== */
  var WY_H = { 'User-Agent': UA, 'Referer': 'https://music.163.com/', 'Cookie': 'appver=2.0.2' };

  function normalizeLrc(text) {
    return String(text == null ? '' : text)
      .replace(/\r\n?/g, '\n')
      .replace(/^\uFEFF/, '')
      .replace(/[ \t]+$/gm, '')
      .replace(/^\s+|\s+$/g, '');
  }

  /* 部分接口返回 base64（酷狗下载、QQ 旧接口） */
  function maybeBase64(s) {
    s = String(s == null ? '' : s).trim();
    if (!s || /\[\d{1,2}:\d{2}/.test(s) || s.indexOf('\n') >= 0) return s;
    if (!/^[A-Za-z0-9+/=\s]{16,}$/.test(s)) return s;
    try {
      var t = NM.bytes.utf8Decode(NM.bytes.fromBase64(s.replace(/\s+/g, '')));
      if (t && /[A-Za-z\u4e00-\u9fa5]/.test(t)) return t;
    } catch (e) {}
    return s;
  }

  function lyricResult(lyric, translation, source) {
    return {
      lyric: normalizeLrc(lyric),
      translation: normalizeLrc(translation),
      source: source
    };
  }

  function wyLyric(track) {
    var id = track.id || track.songmid;
    if (!id) return Promise.reject(new Error('网易云歌词缺少歌曲 ID'));
    var url = 'https://music.163.com/api/song/lyric?os=pc&id=' + encodeURIComponent(id) + '&lv=-1&kv=-1&tv=-1';
    return fetchJson({ url: url, headers: WY_H, timeout: 15000 }).then(function (j) {
      var lrc = pick(j, [['lrc', 'lyric']], '');
      var tr = pick(j, [['tlyric', 'lyric']], '');
      if (!lrc && !tr) throw new Error('网易云没有这首歌的歌词');
      return lyricResult(lrc, tr, 'wy');
    });
  }

  function txLyric(track) {
    var mid = track.songmid || track.mediaMid || track.id;
    if (!mid) return Promise.reject(new Error('QQ 歌词缺少 songmid'));
    var url = 'https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg?songmid=' +
      encodeURIComponent(mid) + '&format=json&nobase64=1&g_tk=5381';
    return fetchJson({
      url: url,
      headers: { 'User-Agent': UA, 'Referer': 'https://y.qq.com/' },
      timeout: 15000
    }).then(function (j) {
      var lrc = NM.text.decodeEntities(maybeBase64(j.lyric || j.lyric_txt || ''));
      var tr = NM.text.decodeEntities(maybeBase64(j.trans || j.translrc || ''));
      if (!lrc && !tr) throw new Error('QQ 音乐没有这首歌的歌词');
      return lyricResult(lrc, tr, 'tx');
    });
  }

  function lrcTime(sec) {
    sec = Math.max(0, Number(sec) || 0);
    var m = Math.floor(sec / 60);
    var s = sec - m * 60;
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s.toFixed(2);
  }

  function kwLyric(track) {
    var rid = track.rid || track.id;
    if (!rid) return Promise.reject(new Error('酷我歌词缺少 rid'));
    var url = 'https://m.kuwo.cn/newh5/singles/songinfoandlrc?musicId=' + encodeURIComponent(rid) + '&httpsStatus=1';
    return fetchJson({
      url: url,
      headers: { 'User-Agent': UA, 'Referer': 'https://m.kuwo.cn/' },
      timeout: 15000
    }).then(function (j) {
      var list = pick(j, [['data', 'lrclist']], []);
      if (!Array.isArray(list) || !list.length) throw new Error('酷我没有这首歌的歌词');
      var lines = list.map(function (it) {
        var t = parseFloat(it.time || it.timeSec || 0);
        return '[' + lrcTime(t) + ']' + String(it.lineLyric || it.line || '');
      }).filter(function (s) { return s.length > 10; });
      if (!lines.length) throw new Error('酷我歌词为空');
      return lyricResult(lines.join('\n'), '', 'kw');
    });
  }

  function kgLyric(track) {
    var hash = track.hash || (track.types && track.types['128k'] && track.types['128k'].hash);
    if (!hash) return Promise.reject(new Error('酷狗歌词缺少 hash'));
    var h = { 'User-Agent': UA, 'Referer': 'https://www.kugou.com/' };
    var qs = 'ver=1&man=yes&client=mobi&keyword=&duration=' + encodeURIComponent(track.duration || '') +
      '&hash=' + encodeURIComponent(hash);
    return fetchJson({ url: 'https://krcs.kugou.com/search?' + qs, headers: h, timeout: 15000 })
      .then(function (j) {
        var c = (j.candidates || [])[0];
        if (!c || !c.id) throw new Error('酷狗没有这首歌的歌词');
        var url = 'https://lyrics.kugou.com/download?ver=1&client=pc&id=' + encodeURIComponent(c.id) +
          '&accesskey=' + encodeURIComponent(c.accesskey || '') + '&fmt=lrc&charset=utf8';
        return fetchJson({ url: url, headers: h, timeout: 15000 });
      })
      .then(function (d) {
        var text = maybeBase64(d.content || '');
        if (!text) throw new Error('酷狗歌词为空');
        return lyricResult(text, '', 'kg');
      });
  }

  function mgLyric(track) {
    var cid = track.songmid || track.copyrightId || track.id;
    if (!cid) return Promise.reject(new Error('咪咕歌词缺少 copyrightId'));
    var url = 'https://music.migu.cn/v3/api/music/audioPlayer/getLyric?copyrightId=' + encodeURIComponent(cid);
    return fetchJson({
      url: url,
      headers: { 'User-Agent': MIGU_UA, 'Referer': 'https://music.migu.cn/' },
      timeout: 15000
    }).then(function (j) {
      var text = maybeBase64(j.lyric || j.lrc || '');
      if (!text) throw new Error('咪咕没有这首歌的歌词');
      return lyricResult(text, '', 'mg');
    });
  }

  var LYRIC_FNS = { wy: wyLyric, tx: txLyric, kw: kwLyric, kg: kgLyric, mg: mgLyric };

  function getLyric(track) {
    if (!track) return Promise.reject(new Error('没有曲目'));
    var fn = LYRIC_FNS[track.source];
    var first = fn ? fn(track).then(function (r) { return r; }, function (e) { return e; })
                   : Promise.resolve(new Error('不支持的平台：' + track.source));
    return first.then(function (r) {
      if (r && r.lyric) return r;
      return searchBest('wy', track).then(function (hit) {
        if (!hit || !hit.id) throw (r instanceof Error ? r : new Error('没有找到歌词'));
        return wyLyric(hit).then(null, function () {
          throw (r instanceof Error ? r : new Error('没有找到歌词'));
        });
      });
    });
  }

  /* ======================================================================
     歌单 / 播客 / 歌手（歌单优先用选中平台，不支持时回退网易云）
     ====================================================================== */
  function playlistPlatform(platform) {
    return (COLLECTION_ADAPTERS[platform] && COLLECTION_ADAPTERS[platform].playlist) ? platform : 'wy';
  }

  function searchPlaylists(platform, keyword, page, size) {
    var p = playlistPlatform(platform);
    return searchCollections([p], keyword, 'playlist', page, size).then(function (groups) {
      var g = groups[0] || { items: [], ok: false, error: '没有结果' };
      var items = (g.items || []).map(function (it) {
        it.platform = p;
        return it;
      });
      return { platform: p, ok: !!g.ok, items: items, error: g.error || '' };
    });
  }

  function playlistTracks(item) {
    if (!item) return Promise.reject(new Error('没有选中歌单'));
    return collectionTracks(item.platform || playlistPlatform(item.source), 'playlist', item.id);
  }

  function wyPodcastSearch(keyword, size) {
    keyword = String(keyword || '').trim();
    if (!keyword) return Promise.resolve([]);
    var url = 'https://music.163.com/api/search/get/web?csrf_token=&s=' + encodeURIComponent(keyword) +
      '&type=1009&offset=0&total=true&limit=' + (size || 30);
    return fetchJson({ url: url, headers: WY_H, timeout: 15000 }).then(function (j) {
      var list = pick(j, [['result', 'djradios']], []);
      return (list || []).map(function (r) {
        return {
          uid: 'wy:podcast:' + r.id,
          kind: 'podcast',
          source: 'wy',
          platform: 'wy',
          id: String(r.id),
          name: stripTags(r.name),
          artist: stripTags((r.dj && r.dj.nickname) || ''),
          pic: coverUrl(r.picUrl || ''),
          count: asInt(r.programCount, 0),
          desc: stripTags(r.desc || ''),
          raw: r
        };
      }).filter(function (x) { return !!x.id && !!x.name; });
    });
  }

  function wyPodcastEpisodes(id) {
    var url = 'https://music.163.com/api/dj/program/byradio?radioId=' + encodeURIComponent(id) +
      '&limit=100&offset=0&asc=false';
    return fetchJson({ url: url, headers: WY_H, timeout: 15000 }).then(function (j) {
      var list = j.programs || [];
      var radio = (list[0] && list[0].radio) || {};
      var tracks = list.map(function (p) {
        var t = wyNormalize(p.mainSong || {});
        if (!t || !t.id) return null;
        t.uid = 'wy:program:' + p.id;
        t.title = stripTags(p.name || t.title);
        t.artist = stripTags((p.radio && p.radio.name) || t.artist);
        t.album = stripTags((p.radio && p.radio.name) || t.album || '播客');
        t.pic = coverUrl(p.coverUrl || t.pic || '');
        if (p.duration) t.duration = Math.round(asInt(p.duration, 0) / 1000);
        return t;
      }).filter(Boolean);
      return {
        name: stripTags(radio.name || ''),
        pic: coverUrl(radio.picUrl || ''),
        tracks: tracks
      };
    });
  }

  function wyArtistSearch(keyword, size) {
    keyword = String(keyword || '').trim();
    if (!keyword) return Promise.resolve([]);
    var url = 'https://music.163.com/api/search/get/web?csrf_token=&s=' + encodeURIComponent(keyword) +
      '&type=100&offset=0&total=true&limit=' + (size || 30);
    return fetchJson({ url: url, headers: WY_H, timeout: 15000 }).then(function (j) {
      var list = pick(j, [['result', 'artists']], []);
      return (list || []).map(function (a) {
        return {
          uid: 'wy:artist:' + a.id,
          kind: 'artist',
          source: 'wy',
          platform: 'wy',
          id: String(a.id),
          name: stripTags(a.name),
          artist: stripTags(a.alias && a.alias.length ? a.alias[0] : ''),
          pic: coverUrl(a.picUrl || a.img1v1Url || ''),
          count: asInt(a.musicSize, 0),
          desc: stripTags(a.briefDesc || ''),
          raw: a
        };
      }).filter(function (x) { return !!x.id && !!x.name; });
    });
  }

  function wyArtistSongs(id) {
    var url = 'https://music.163.com/api/v1/artist/songs?id=' + encodeURIComponent(id) +
      '&limit=100&offset=0';
    return fetchJson({ url: url, headers: WY_H, timeout: 15000 }).then(function (j) {
      var list = j.songs || [];
      if (!Array.isArray(list) || !list.length) throw new Error('网易云歌手歌曲为空');
      return {
        name: stripTags((j.artist && j.artist.name) || ''),
        pic: '',
        tracks: list.map(wyNormalize).filter(Boolean)
      };
    }).catch(function () {
      return fetchJson({
        url: 'https://music.163.com/api/artist/top/song?id=' + encodeURIComponent(id),
        headers: WY_H,
        timeout: 15000
      }).then(function (j2) {
        var list2 = j2.songs || [];
        if (!list2.length) throw new Error('没取到这位歌手的歌曲');
        return { name: '', pic: '', tracks: list2.map(wyNormalize).filter(Boolean) };
      });
    });
  }

  /* ======================================================================
     平台推荐（不需要关键词）：歌单 / 播客 / 歌手
     全部走网易云公开接口 —— 音源脚本挂了，这三个入口照样能翻
     ====================================================================== */
  function recLimit(limit) {
    return Math.min(100, Math.max(5, parseInt(limit, 10) || 30));
  }

  function recItem(o) {
    return {
      uid: o.uid,
      kind: o.kind,
      source: 'wy',
      platform: 'wy',
      id: String(o.id),
      name: stripTags(o.name || ''),
      artist: stripTags(o.artist || ''),
      pic: coverUrl(o.pic || ''),
      count: asInt(o.count, 0),
      desc: stripTags(o.desc || ''),
      raw: o.raw || null
    };
  }

  /* 推荐歌单：/api/personalized/playlist（失败时退回「热门」关键词搜歌单） */
  function wyTopPlaylists(limit) {
    var n = recLimit(limit);
    return fetchJson({
      url: 'https://music.163.com/api/personalized/playlist?limit=' + n,
      headers: WY_H,
      timeout: 15000
    }).then(function (j) {
      var list = pick(j, [['result']], []);
      var items = (Array.isArray(list) ? list : []).map(function (p) {
        var id = p && (p.id || p.resourceId);
        if (!id) return null;
        return recItem({
          uid: 'wy:playlist:' + id,
          kind: 'playlist',
          id: id,
          name: p.name,
          artist: p.copywriter || '',
          pic: p.picUrl || '',
          count: p.trackCount,
          desc: p.copywriter || '',
          raw: p
        });
      }).filter(function (x) { return !!x && !!x.name; });
      return items;
    }).then(function (items) {
      if (items.length) return items;
      return searchPlaylists('wy', '热门', 1, n).then(function (r) {
        if (r && (r.items || []).length) return r.items;
        throw new Error('网易云推荐歌单为空');
      });
    });
  }

  /* 推荐播客：/api/djradio/toplist（主播电台榜，无需登录） */
  function wyTopPodcasts(limit) {
    var n = recLimit(limit);
    return fetchJson({
      url: 'https://music.163.com/api/djradio/toplist?limit=' + n + '&offset=0',
      headers: WY_H,
      timeout: 15000
    }).then(function (j) {
      var list = pick(j, [['toplist']], []);
      var items = (Array.isArray(list) ? list : []).map(function (r) {
        if (!r || !r.id) return null;
        return recItem({
          uid: 'wy:podcast:' + r.id,
          kind: 'podcast',
          id: r.id,
          name: r.name,
          artist: (r.dj && r.dj.nickname) || r.category || '',
          pic: r.picUrl || '',
          count: r.programCount,
          desc: r.rcmdtext || r.category || '',
          raw: r
        });
      }).filter(function (x) { return !!x && !!x.name; });
      if (items.length) return items;
      return wyPodcastSearch('播客', n).then(function (list2) {
        if (list2 && list2.length) return list2;
        throw new Error('网易云推荐播客为空');
      });
    });
  }

  /* 推荐歌手：/api/artist/list（默认全部地区 / 全部类型，按热度） */
  function wyTopArtists(limit) {
    var n = recLimit(limit);
    function fetchList(type, area) {
      return fetchJson({
        url: 'https://music.163.com/api/artist/list?type=' + type + '&area=' + area + '&limit=' + n,
        headers: WY_H,
        timeout: 15000
      }).then(function (j) {
        return (pick(j, [['artists']], []) || []).map(function (a) {
          if (!a || !a.id) return null;
          return recItem({
            uid: 'wy:artist:' + a.id,
            kind: 'artist',
            id: a.id,
            name: a.name,
            artist: (a.alias && a.alias.length) ? a.alias[0] : '',
            pic: a.picUrl || a.img1v1Url || '',
            count: a.musicSize,
            desc: a.briefDesc || '',
            raw: a
          });
        }).filter(function (x) { return !!x && !!x.name; });
      });
    }
    return fetchList(-1, -1).then(function (list) {
      if (list.length) return list;
      return fetchList(1, 7).then(function (list2) {
        if (list2.length) return list2;
        throw new Error('网易云推荐歌手为空');
      });
    });
  }

  /* ======================================================================
     推荐：歌单 / 歌手 / 播客 —— 按当前平台取
     以前这三个列表写死网易云，切到 QQ / 酷我 / 酷狗 / 咪咕 时对不上平台，
     网易云接口一抽风整页就空。现在各平台取自己的：
       歌单  QQ 搜「热门」歌单（musicu，UTF-8）；酷我 / 酷狗 / 咪咕用各自的歌单搜索
       歌手  QQ 歌手列表；酷我 / 酷狗 / 咪咕歌手搜索；网易云歌手榜
       播客  只有网易云有，其余平台直接报错，页面显示提示而不是空白
     点击后的曲目：歌单 TX / WY / KG 有详情接口；KW / MG 暂缺，会给出明确提示。
     歌手歌曲统一按「歌手名」在该平台搜索，省得为五家各写一套详情接口。
     ====================================================================== */
  function recLimit2(limit) {
    return Math.min(60, Math.max(5, parseInt(limit, 10) || 30));
  }

  function recMake(platform, kind, o) {
    return {
      uid: platform + ':' + kind + ':' + o.id,
      kind: kind,
      source: platform,
      platform: platform,
      id: String(o.id),
      name: stripTags(o.name || ''),
      artist: stripTags(o.artist || ''),
      pic: coverUrl(o.pic || ''),
      count: asInt(o.count, 0),
      desc: stripTags(o.desc || ''),
      raw: o.raw || null
    };
  }

  function recName(p) { return (META[p] && META[p].name) || String(p || ''); }

  /* ---------------- 推荐歌单 ---------------- */
  function txTopPlaylists(limit) {
    var n = recLimit2(limit);
    return txPlaylistSearch('热门', 1, n).catch(function () {
      return txPlaylistSearch('热歌', 1, n);        /* 接口偶发 2001 频控，换个词再试一次 */
    }).then(function (items) {
      return (items || []).map(function (it) {
        return recMake('tx', 'playlist', {
          id: it.id, name: it.name, artist: it.artist, pic: it.pic,
          count: it.count, desc: '', raw: it.raw
        });
      });
    });
  }

  function kwTopPlaylists(limit) {
    var qs = 'all=' + encodeURIComponent('热门') + '&ft=playlist&pn=0&rn=' + recLimit2(limit)
      + '&rformat=json&encoding=utf8';
    return fetchJson({
      url: 'https://search.kuwo.cn/r.s?' + qs,
      headers: { 'User-Agent': UA, 'Referer': 'https://www.kuwo.cn/' },
      timeout: 12000
    }).then(function (j) {
      var list = pick(j, [['abslist']], []);
      return (list || []).map(function (it) {
        var id = it.playlistid || it.DC_TARGETID;
        if (!id) return null;
        return recMake('kw', 'playlist', {
          id: id,
          name: it.name,
          artist: NM.text.decodeEntities(it.nickname || ''),
          pic: it.hts_pic || it.pic,
          count: it.songnum,
          desc: NM.text.decodeEntities(it.intro || ''),
          raw: it
        });
      }).filter(Boolean);
    });
  }

  function kgTopPlaylists(limit) {
    var url = 'http://mobilecdn.kugou.com/api/v3/search/special?keyword=' + encodeURIComponent('热门')
      + '&page=1&pagesize=' + recLimit2(limit);
    return fetchJson({
      url: url,
      headers: { 'User-Agent': UA, 'Referer': 'https://www.kugou.com/' },
      timeout: 12000
    }).then(function (j) {
      var list = pick(j, [['data', 'info']], []);
      return (list || []).map(function (it) {
        if (!it.specialid) return null;
        return recMake('kg', 'playlist', {
          id: it.specialid,
          name: it.specialname,
          artist: it.nickname,
          pic: String(it.imgurl || '').replace('{size}', '240'),
          count: it.songcount,
          desc: it.intro,
          raw: it
        });
      }).filter(Boolean);
    });
  }

  function mgTopPlaylists(limit) {
    var url = 'https://app.c.nf.migu.cn/MIGUM2.0/v1.0/content/search_all.do?text=' + encodeURIComponent('热门')
      + '&pageNo=1&pageSize=' + recLimit2(limit)
      + '&searchSwitch=' + encodeURIComponent('{"songList":1}') + '&isCorrect=1&companyId=0';
    return fetchJson({
      url: url,
      headers: { 'User-Agent': MIGU_UA, 'Referer': 'https://app.c.nf.migu.cn/' },
      timeout: 12000
    }).then(function (j) {
      var list = pick(j, [['songListResultData', 'result']], []);
      return (list || []).map(function (it) {
        if (!it.id) return null;
        return recMake('mg', 'playlist', {
          id: it.id,
          name: it.name,
          artist: it.userName || '',
          pic: it.musicListPicUrl || it.picUrl || '',
          count: it.musicNum,
          desc: (it.ts || []).join(' / '),
          raw: it
        });
      }).filter(Boolean);
    });
  }

  /* ---------------- 推荐歌手 ---------------- */
  function txTopArtists(limit) {
    var url = 'https://c.y.qq.com/v8/fcg-bin/v8.fcg?channel=singer&page=list&key=all_all_all'
      + '&pagesize=' + recLimit2(limit) + '&pagenum=1&format=json';
    return fetchJson({
      url: url,
      headers: { 'User-Agent': UA, 'Referer': 'https://y.qq.com/' },
      timeout: 15000
    }).then(function (j) {
      var list = pick(j, [['data', 'list']], []);
      return (list || []).map(function (it) {
        var mid = it.Fsinger_mid || it.Fsinger_id;
        if (!mid) return null;
        return recMake('tx', 'artist', {
          id: mid,
          name: it.Fsinger_name,
          artist: it.Fother_name,
          pic: it.Fsinger_mid ? ('https://y.gtimg.cn/music/photo_new/T001R300x300M000' + it.Fsinger_mid + '.jpg') : '',
          count: 0,
          raw: it
        });
      }).filter(Boolean).slice(0, recLimit2(limit));
    });
  }

  /* 酷我 / 酷狗 / 咪咕没有「推荐歌手」接口（搜「热门」出来的歌手不成样子），
     改成拿该平台热歌榜前 100 首、按歌手名去重 —— 就是这份榜上的热门歌手，
     点进去再按名字搜歌（artistSongsAny 已经这么做了）。 */
  var ARTIST_BOARD = { kw: '16', kg: '8888', mg: '27186466' };

  function artistsFromBoard(p, limit) {
    var bid = ARTIST_BOARD[p];
    if (!bid) return Promise.resolve([]);
    return loadBoard(p, bid, 100).then(function (res) {
      if (!res || !res.ok) throw new Error((res && res.error) || '榜单加载失败');
      var seen = {}, out = [];
      (res.tracks || []).forEach(function (t) {
        var name = String(t.artist || '').split(' / ')[0].trim();
        if (!name || seen[name]) return;
        seen[name] = 1;
        out.push(recMake(p, 'artist', { id: name, name: name, artist: '', pic: '', count: 0, raw: null }));
      });
      return out.slice(0, recLimit2(limit));
    });
  }

  /* ---------------- 分发 ---------------- */
  function topPlaylistsOf(platform, limit) {
    var p = String(platform || 'wy');
    if (p === 'tx') return txTopPlaylists(limit);
    if (p === 'kw') return kwTopPlaylists(limit);
    if (p === 'kg') return kgTopPlaylists(limit);
    if (p === 'mg') return mgTopPlaylists(limit);
    return wyTopPlaylists(limit);
  }

  function topArtistsOf(platform, limit) {
    var p = String(platform || 'wy');
    if (p === 'tx') return txTopArtists(limit);
    if (p === 'wy') return wyTopArtists(limit);
    return artistsFromBoard(p, limit);
  }

  function topPodcastsOf(platform, limit) {
    var p = String(platform || 'wy');
    if (p !== 'wy') {
      return Promise.reject(new Error(recName(p) + '不提供播客节目，切到网易云可以看播客'));
    }
    return wyTopPodcasts(limit);
  }

  /* 歌手歌曲：网易云用官方接口，其余平台按「歌手名」搜索（同名歌手也在里面） */
  function songsByArtistName(platform, name, limit) {
    name = String(name || '').trim();
    if (!name) return Promise.reject(new Error('缺少歌手名'));
    return search([platform], name, 1, limit || 50).then(function (res) {
      var r = (res || [])[0] || {};
      if (!r.ok) throw new Error(r.error || '搜索失败');
      return { name: name, pic: '', tracks: r.tracks || [] };
    });
  }

  function artistSongsAny(item) {
    if (typeof item === 'string' || typeof item === 'number') return wyArtistSongs(item);
    var it = item || {};
    var p = String(it.platform || it.source || 'wy');
    if (p === 'wy' && it.id) return wyArtistSongs(it.id);
    return songsByArtistName(p, it.name, 60);
  }

  /* 酷狗歌单曲目（歌单页点开时用） */
  function kgSongOf(it) {
    if (!it) return null;
    var t = it.filename || it.songname || '';
    var singer = it.singername || '';
    if (!singer && t.indexOf(' - ') > 0) {
      singer = t.slice(0, t.indexOf(' - '));
      t = t.slice(t.indexOf(' - ') + 3);
    }
    return kgNormalize({
      FileHash: it.hash,
      SongName: t,
      SingerName: singer,
      AlbumName: it.album_name || it.albumname || '',
      AlbumID: it.album_id,
      Duration: it.duration,
      Image: it.imgurl || ''
    });
  }

  function kgPlaylistTracks(id) {
    var url = 'http://mobilecdn.kugou.com/api/v3/special/song?specialid=' + encodeURIComponent(id)
      + '&page=1&pagesize=100';
    return fetchJson({
      url: url,
      headers: { 'User-Agent': UA, 'Referer': 'https://www.kugou.com/' },
      timeout: 15000
    }).then(function (j) {
      var list = pick(j, [['data', 'info']], []);
      if (!Array.isArray(list) || !list.length) throw new Error('酷狗歌单是空的');
      return { name: '', pic: '', tracks: list.map(kgSongOf).filter(Boolean) };
    });
  }

  NM.providers = {
    meta: META,
    order: ORDER,
    diag: diag,
    boards: BOARDS,
    loadBoard: loadBoard,
    comments: getComments,
    artistInfo: artistInfo,
    artistHotSongs: artistHotSongs,
    search: search,
    searchOne: searchOne,
    searchCollections: searchCollections,
    collectionTracks: collectionTracks,
    collectionPlatforms: COLLECTION_PLATFORMS,
    lyric: getLyric,
    cover: wyCover,
    searchPlaylists: searchPlaylists,
    playlistTracks: playlistTracks,
    searchPodcasts: wyPodcastSearch,
    podcastEpisodes: wyPodcastEpisodes,
    searchArtists: wyArtistSearch,
    artistSongs: artistSongsAny,
    topPlaylists: topPlaylistsOf,
    topPodcasts: topPodcastsOf,
    topArtists: topArtistsOf,
    txUrl: txUrl,
    txUrlExact: txUrlExact,
    txApiUrl: txApiUrl,
    normalize: { tx: txNormalize, wy: wyNormalize, kw: kwNormalize, kg: kgNormalize, mg: mgNormalize }
  };
})(window);
