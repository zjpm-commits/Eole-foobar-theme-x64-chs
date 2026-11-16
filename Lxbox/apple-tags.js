/* ==========================================================================
   Lxbox · Apple Music（中国区）标签源
   --------------------------------------------------------------------------
   只做一件事：给一首歌（歌名 + 歌手 + 时长 + 专辑名），从 Apple Music 中国区
   网页里扒出可写的标签字段，交给 main.js 决定用不用、覆盖哪些。

   为什么抓网页：itunes.apple.com 的 search / lookup 在中国区对「流媒体曲库」
   返回 0 条（那些歌不在 iTunes 商店卖），amp-api 又要 token。实测可用的只有
   music.apple.com 的 HTML，里面两块 JSON 就够：

     · <script id="serialized-server-data">  搜索结果、专辑曲目表（带 trackNumber /
       discNumber / duration / composer / artistName）
     · <script id="schema:music-album">      专辑名、发行日、流派、专辑艺人、封面

   已经跑通的三条链路：
     搜索  /cn/search?term=歌名+歌手         → 候选（song 带专辑 id 和曲目 id）
     专辑  /cn/album/飞语/专辑id              → 曲目表 + 专辑元数据
     古典  classical.music.apple.com/cn/album/专辑id → workName / composer / 乐章

   古典字段（WORK / MOVEMENTNAME / MOVEMENT / MOVEMENTTOTAL / SHOWMOVEMENT）：
   普通站只有一半专辑带 workName（实测 8 张里 4 张），古典站同一张专辑 100% 有，
   所以勾了「作品/乐章」时额外抓一次古典站，用专辑 id（两边通用）拼 URL。

   注意：ISRC / 厂牌 / 语言只在 amp-api 里，网页里没有，不要在这里硬凑。
   古典站也没有流派和精确发行日，这两项仍取普通站。

   对外（挂在 NM.apple）：
     lookup(track, opt) -> Promise<{ ok, fields, cover, match, album, reason }>
     search(term)       -> Promise<{ songs, albums }>
     albumById(id, url) -> Promise<album>
     classicalAlbum(id) -> Promise<{ name, year, artists, cover, tracks }>
     cover1200(url)     -> '…/1200x1200bb.jpg'
     parseSearch(html) / parseAlbum(html) / parseClassical(html)   纯函数，方便离网单测
   ========================================================================== */
(function (global) {
  'use strict';

  var NM = global.NM = global.NM || {};

  var STORE = 'cn';
  var HOST = 'https://music.apple.com/' + STORE;
  var CLASSICAL_HOST = 'https://classical.music.apple.com/' + STORE;
  var UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
         + '(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

  var GAP = 900;            /* 两次请求之间的最小间隔（毫秒），防 429 */
  var MATCH_MIN = 1.6;      /* 候选匹配分下限，低于它当作「没搜到」 */
  var TRACK_MIN = 1.0;      /* 古典站曲目匹配分下限 */
  var TIMEOUT = 14000;
  var TTL = 7 * 24 * 3600 * 1000;

  /* 可选字段：main.js 里勾了哪些就只回哪些。
     classical 是个打包项：勾它才抓古典站，回 WORK / MOVEMENTNAME / MOVEMENT /
     MOVEMENTTOTAL / SHOWMOVEMENT 五个字段。 */
  var FIELDS = ['title', 'artist', 'album', 'date', 'genre',
                'track', 'disc', 'albumartist', 'composer', 'copyright',
                'classical', 'cover'];

  /* ======================================================================
     0. 小工具
     ====================================================================== */
  function txt(s) {
    return String(s == null ? '' : s).trim();
  }

  function stripTags(s) {
    return String(s == null ? '' : s).replace(/<[^>]+>/g, '').trim();
  }

  /* 全角 → 半角，去大小写差异，只留中日韩 + 字母数字 */
  function normKey(s) {
    s = String(s == null ? '' : s);
    s = s.replace(/[\uFF01-\uFF5E]/g, function (c) {
      return String.fromCharCode(c.charCodeAt(0) - 0xFEE0);
    });
    s = s.replace(/[\u3000]/g, ' ');
    s = s.toLowerCase();
    s = s.replace(/\([^)]*\)|\[[^\]]*\]|（[^）]*）|【[^】]*】/g, ' ');
    s = s.replace(/[\s\-_/\\.,'"`!?~·・:;+*&@#$%^|=<>]/g, '');
    return s;
  }

  /* 去掉括号后缀后的「主标题」，用来判断是不是 Live / 伴奏 这类版本 */
  function versionTag(s) {
    var m = String(s == null ? '' : s).match(/[\(\（\[\【]([^\)\）\]\】]{1,24})[\)\）\]\】]/g);
    return m ? m.join(' ').toLowerCase() : '';
  }

  var VER_WORDS = ['live', '现场', '演唱会', 'remaster', '重制', 'acoustic', '不插电',
                   'instrumental', '伴奏', '纯音乐', 'karaoke', '翻唱', 'cover',
                   'dj', 'remix', '混音', 'demo', '女声', '男声', '片段'];

  function hasVerWord(s) {
    var low = String(s == null ? '' : s).toLowerCase();
    for (var i = 0; i < VER_WORDS.length; i++) if (low.indexOf(VER_WORDS[i]) >= 0) return true;
    return false;
  }

  /* bigram Dice 相似度：中文歌名短，字符级比词级稳 */
  function sim(a, b) {
    var x = normKey(a), y = normKey(b);
    if (!x || !y) return 0;
    if (x === y) return 1;
    if (x.length < 2 || y.length < 2) return x === y ? 1 : 0;
    var A = {}, n = 0, hit = 0, i, g;
    for (i = 0; i < x.length - 1; i++) { g = x.substr(i, 2); A[g] = (A[g] || 0) + 1; }
    for (i = 0; i < y.length - 1; i++) {
      g = y.substr(i, 2);
      if (A[g]) { A[g]--; hit++; }
      n++;
    }
    var tot = (x.length - 1) + n;
    return tot ? (2 * hit / tot) : 0;
  }

  function artistListOf(s) {
    return String(s == null ? '' : s)
      .split(/\s*(?:\/|&|,|，|、|feat\.?|ft\.?|with)\s*/i)
      .map(function (t) { return t.trim(); })
      .filter(Boolean);
  }

  /* 艺人相似度：任一对得上就算，最多取最高分 */
  function artistSim(a, b) {
    var A = artistListOf(a), B = artistListOf(b), best = 0;
    if (!A.length || !B.length) return 0;
    for (var i = 0; i < A.length; i++) {
      for (var j = 0; j < B.length; j++) {
        var s = sim(A[i], B[j]);
        if (s > best) best = s;
      }
    }
    return best;
  }

  /* ======================================================================
     1. HTML → JSON
     ====================================================================== */
  /* 注意：苹果的 JSON-LD 标签写的是无引号 id（<script id=schema:music-album …>），
     所以属性值三种写法都要认。 */
  function scriptJson(html, id) {
    var want = id.replace(/[:.]/g, '\\$&');
    var re = new RegExp('<script[^>]*\\bid\\s*=\\s*["\']?' + want + '["\']?[^>]*>([\\s\\S]*?)<\\/script>', 'i');
    var m = re.exec(String(html == null ? '' : html));
    if (!m) return null;
    try { return JSON.parse(m[1]); } catch (e) { return null; }
  }

  function serialized(html) {
    return scriptJson(html, 'serialized-server-data');
  }

  function ldAlbum(html) {
    return scriptJson(html, 'schema:music-album');
  }

  /* 遍历所有节点，收集满足条件的最长同构数组（用来找曲目表，不管它在第几层） */
  function collectArrays(root, pred) {
    var out = [];
    (function walk(o) {
      if (!o || typeof o !== 'object') return;
      if (Array.isArray(o)) {
        var ok = o.length > 0;
        for (var i = 0; i < o.length && ok; i++) if (!pred(o[i])) ok = false;
        if (ok) { out.push(o); return; }
        for (var j = 0; j < o.length; j++) walk(o[j]);
        return;
      }
      for (var k in o) if (o.hasOwnProperty(k)) walk(o[k]);
    })(root);
    return out;
  }

  function isTrackItem(it) {
    return !!(it && typeof it === 'object' && 'trackNumber' in it && 'title' in it);
  }

  function msOf(v) {
    var n = Number(v);
    return isFinite(n) && n > 0 ? n : 0;
  }

  /* "PT7M22S" → 442 秒 */
  function isoSeconds(s) {
    var m = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(String(s || '').trim());
    if (!m) return 0;
    return (Number(m[1] || 0) * 3600) + (Number(m[2] || 0) * 60) + Number(m[3] || 0);
  }

  function urlParts(u) {
    u = String(u || '');
    var albumId = '', songId = '', albumUrl = '';
    var m = /\/album\/([^\/?#]+)\/(\d+)/.exec(u);
    if (m) {
      albumId = m[2];
      albumUrl = u.slice(0, m.index + m[0].length);
    }
    var q = /[?&]i=(\d+)/.exec(u);
    if (q) songId = q[1];
    return { albumId: albumId, songId: songId, albumUrl: albumUrl };
  }

  function artTemplate(it) {
    var t = '';
    try {
      t = it && it.artwork && it.artwork.dictionary && it.artwork.dictionary.url || '';
    } catch (e) { t = ''; }
    if (!t) return '';
    return String(t);
  }

  /* ======================================================================
     2. 解析：搜索结果
     ====================================================================== */
  function parseSearch(html) {
    var d = serialized(html);
    var songs = [], albums = [];
    if (!d) return { songs: songs, albums: albums };
    var blocks = (d && d.data) || [];
    for (var b = 0; b < blocks.length; b++) {
      var secs = blocks[b] && blocks[b].data && blocks[b].data.sections;
      if (!Array.isArray(secs)) continue;
      for (var s = 0; s < secs.length; s++) {
        var items = secs[s] && secs[s].items;
        if (!Array.isArray(items)) continue;
        for (var i = 0; i < items.length; i++) {
          var it = items[i];
          var cd = (it && it.contentDescriptor) || {};
          var kind = cd.kind;
          if (kind !== 'song' && kind !== 'album') continue;
          var up = urlParts(cd.url);
          if (!up.albumId) continue;
          var id = '';
          try { id = String((cd.identifiers && cd.identifiers.storeAdamID) || ''); } catch (e) { id = ''; }
          var sub = txt(it.subtitle);
          var rec = {
            kind: kind,
            id: id,
            title: stripTags(it.title),
            subtitle: sub,
            artist: artistListOf(sub.split('·').pop() || '').join(' / '),
            albumId: up.albumId,
            songId: kind === 'song' ? (up.songId || id) : '',
            albumUrl: up.albumUrl,
            art: artTemplate(it)
          };
          if (kind === 'song') songs.push(rec); else albums.push(rec);
        }
      }
    }
    return { songs: songs, albums: albums };
  }

  /* ======================================================================
     3. 解析：专辑页
     ====================================================================== */
  function parseAlbum(html) {
    var d = serialized(html);
    var ld = ldAlbum(html) || {};

    var arrs = collectArrays(d, isTrackItem);
    arrs.sort(function (a, b) { return b.length - a.length; });
    var rawTracks = arrs.length ? arrs[0] : [];

    var tracks = [], seen = {};
    for (var i = 0; i < rawTracks.length; i++) {
      var it = rawTracks[i];
      var tid = '';
      try {
        tid = String((it.contentDescriptor && it.contentDescriptor.identifiers
                      && it.contentDescriptor.identifiers.storeAdamID) || '');
      } catch (e) { tid = ''; }
      var key = tid || (it.title + '#' + it.trackNumber);
      if (seen[key]) continue;
      seen[key] = 1;
      tracks.push({
        id: tid,
        title: stripTags(it.title),
        track: Number(it.trackNumber) || 0,
        disc: Number(it.discNumber) || 1,
        ms: msOf(it.duration),
        composer: txt(it.composer),
        artist: txt(it.artistName)
      });
    }
    tracks.sort(function (a, b) { return (a.disc - b.disc) || (a.track - b.track); });

    /* JSON-LD 兜底：曲目名/时长都在，但没序号 */
    if (!tracks.length) {
      var lt = Array.isArray(ld.tracks) ? ld.tracks : [];
      for (var j = 0; j < lt.length; j++) {
        var x = lt[j] || {};
        var up = urlParts(x.url);
        tracks.push({
          id: up.songId, title: stripTags(x.name), track: j + 1, disc: 1,
          ms: isoSeconds(x.duration) * 1000, composer: '', artist: ''
        });
      }
    }

    var discs = 0;
    for (var k = 0; k < tracks.length; k++) if (tracks[k].disc > discs) discs = tracks[k].disc;

    var artists = [];
    if (Array.isArray(ld.byArtist)) {
      for (var a = 0; a < ld.byArtist.length; a++) {
        var n = txt(ld.byArtist[a] && ld.byArtist[a].name);
        if (n) artists.push(n);
      }
    }
    var genres = [];
    if (Array.isArray(ld.genre)) genres = ld.genre.map(txt).filter(Boolean);
    else if (ld.genre) genres = [txt(ld.genre)].filter(Boolean);

    var date = txt(ld.datePublished);
    var dm = /^(\d{4})-(\d{2})-(\d{2})/.exec(date);
    if (dm) date = dm[1] + '-' + dm[2] + '-' + dm[3];
    else {
      dm = /^(\d{4})$/.exec(date);
      date = dm ? dm[1] : '';
    }

    var cover = '';
    var img = txt(ld.image);
    if (img) cover = cover1200(img);
    if (!cover) {
      var all = String(html || '');
      var mm = /"url":"(https:\/\/is\d-ssl\.mzstatic\.com\/image\/thumb\/[^"]{0,200}\/)\{w\}x\{h\}[^"]{0,20}"/.exec(all);
      if (mm) cover = mm[1].replace(/\\\//g, '/') + '1200x1200bb.jpg';
    }

    return {
      name: stripTags(ld.name),
      artist: artists.join(' / '),
      artists: artists,
      date: date,
      genres: genres,
      genre: genres.length ? genres[0] : '',
      copyright: txt(ld.copyrightHolder && ld.copyrightHolder.name),
      cover: cover,
      tracks: tracks,
      total: tracks.length,
      discs: discs || 1
    };
  }

  /* ======================================================================
     3b. 解析：古典站专辑页（classical.music.apple.com）
     ----------------------------------------------------------------------
     结构跟普通站不同：没有 data.sections 那层，直接
       data[0].data = { header, sections: [ { itemKind:'trackLockup', items:[…] } ] }
     曲目自带 workName / composer / artistName / duration，但没有
     trackNumber / discNumber，所以乐章号按 workName 分组自己算。
     ====================================================================== */
  function clsArt(it) {
    var t = '';
    try { t = (it && it.artwork && it.artwork.template) || ''; } catch (e) { t = ''; }
    if (!t) {
      try { t = (it.artwork && it.artwork.dictionary && it.artwork.dictionary.url) || ''; } catch (e2) { t = ''; }
    }
    return txt(t);
  }

  function parseClassical(html) {
    var d = serialized(html);
    if (!d) return null;

    var blocks = (d && d.data) || [];
    var root = null;
    for (var b = 0; b < blocks.length; b++) {
      var x = blocks[b] && blocks[b].data;
      if (x && (x.header || x.sections)) { root = x; break; }
    }
    if (!root) return null;

    var hdr = root.header || {};
    var secs = Array.isArray(root.sections) ? root.sections : [];
    var items = [];
    for (var s = 0; s < secs.length; s++) {
      var sec = secs[s];
      if (sec && sec.itemKind === 'trackLockup' && Array.isArray(sec.items)) {
        items = items.concat(sec.items);
      }
    }

    var tracks = [];
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      tracks.push({
        no: i + 1,
        title: stripTags(it.title),
        work: txt(it.workName),
        composer: txt(it.composer),
        artist: txt(it.artistName),
        ms: msOf(it.duration),
        movement: 0,
        movementTotal: 0
      });
    }

    /* 同一个 workName 的段内编乐章号；总数 = 该作品在本专辑里的曲目数 */
    var totals = Object.create(null), seen = Object.create(null);
    for (var j = 0; j < tracks.length; j++) {
      var w = tracks[j].work;
      if (w) totals[w] = (totals[w] || 0) + 1;
    }
    for (var k = 0; k < tracks.length; k++) {
      var w2 = tracks[k].work;
      if (!w2) continue;
      seen[w2] = (seen[w2] || 0) + 1;
      tracks[k].movement = seen[w2];
      tracks[k].movementTotal = totals[w2];
    }

    var artists = [];
    var links = Array.isArray(hdr.subtitleLinks) ? hdr.subtitleLinks : [];
    for (var a = 0; a < links.length; a++) {
      var n = txt(links[a] && links[a].title);
      if (n && artists.indexOf(n) < 0) artists.push(n);
    }

    return {
      name: stripTags(hdr.title),
      year: txt(hdr.year),
      artists: artists,
      artist: artists.join(' / '),
      cover: cover1200(clsArt(hdr)),
      total: tracks.length,
      tracks: tracks
    };
  }

  var CLS_WORDS = ['symphony', 'sonata', 'concerto', 'quartet', 'quintet', 'requiem',
                   'opera', 'overture', 'prelude', 'fugue', 'cantata', 'oratorio',
                   'nocturne', 'etude', 'étude', 'partita', 'variations',
                   '交响', '奏鸣', '协奏', '四重奏', '五重奏', '安魂', '歌剧', '序曲',
                   '前奏', '赋格', '康塔塔', '弥撒', '清唱剧', '夜曲', '练习曲', '组曲', '变奏'];

  /* 这张专辑值不值得再抓一次古典站：流派 / 作曲 / 曲名关键词任一命中 */
  function looksClassical(album) {
    if (!album) return false;
    var g = txt(album.genre).toLowerCase();
    if (g.indexOf('classical') >= 0 || g.indexOf('古典') >= 0 ||
        g.indexOf('classique') >= 0 || g.indexOf('klassik') >= 0 ||
        g.indexOf('클래식') >= 0 || g.indexOf('классик') >= 0) return true;

    var ts = (album && album.tracks) || [];
    for (var i = 0; i < ts.length; i++) if (ts[i].composer) return true;

    var hay = (txt(album.name) + ' ' + ts.map(function (t) { return t.title; }).join(' ')).toLowerCase();
    for (var j = 0; j < CLS_WORDS.length; j++) if (hay.indexOf(CLS_WORDS[j]) >= 0) return true;
    if (/ (op|bwv|hob|kv)\.? ?\d/.test(hay) || /[，,] (k|b)\. ?\d/.test(hay)) return true;
    return false;
  }

  /* 在古典站曲目表里定位这首：标题相似 + 时长接近，序号一致额外加分 */
  function pickClassicalTrack(cls, t, album) {
    var list = (cls && cls.tracks) || [];
    if (!list.length) return null;

    var myNo = 0;
    var all = (album && album.tracks) || [];
    for (var n = 0; n < all.length; n++) if (all[n] === t) { myNo = n + 1; break; }

    var best = null, bestScore = -99;
    for (var i = 0; i < list.length; i++) {
      var c = list[i];
      var s = sim(c.title, t.title) * 2.2;
      if (t.ms && c.ms) {
        var d = Math.abs(c.ms - t.ms) / 1000;
        s += d <= 3 ? 1.6 : (d <= 10 ? 0.4 : -1.4);
      }
      if (myNo && c.no === myNo) s += 0.8;
      if (!best || s > bestScore) { best = c; bestScore = s; }
    }
    return bestScore >= TRACK_MIN ? best : null;
  }

  function cover1200(url) {
    var u = txt(url);
    if (!u) return '';
    u = u.replace(/\{w\}x\{h\}[^\/]*$/, '1200x1200bb.jpg');
    u = u.replace(/\/\d+x\d+[a-z]{0,3}\.(jpg|png|webp)$/i, '/1200x1200bb.jpg');
    return u;
  }

  /* ======================================================================
     4. 请求队列（串行 + 间隔 + 去重 + 缓存）
     ====================================================================== */
  var mem = Object.create(null);
  var inflight = Object.create(null);
  var chain = Promise.resolve();
  var lastAt = 0;
  var dirty = false;
  var saveTimer = null;

  function cacheGet(k) {
    var v = mem[k];
    if (!v) return null;
    if (Date.now() - v.at > TTL) { delete mem[k]; return null; }
    return v.val;
  }

  function cachePut(k, val) {
    mem[k] = { at: Date.now(), val: val };
    dirty = true;
    scheduleSave();
  }

  function scheduleSave() {
    if (saveTimer) return;
    saveTimer = setTimeout(function () {
      saveTimer = null;
      saveNow();
    }, 1200);
  }

  function cacheFile() {
    var dir = txt(NM.appleCacheDir);
    return dir ? (dir + '\\apple-tags.json') : '';
  }

  function saveNow() {
    if (!dirty) return;
    dirty = false;
    var f = cacheFile();
    if (!f) return;
    try {
      var out = {};
      var now = Date.now(), n = 0;
      Object.keys(mem).forEach(function (k) {
        if (now - mem[k].at > TTL) return;
        out[k] = mem[k];
        n++;
        if (n > 4000) return;
      });
      utils.WriteTextFile(f, JSON.stringify({ v: 1, at: now, items: out }));
    } catch (e) {}
  }

  function loadCache() {
    var f = cacheFile();
    if (!f) return 0;
    var raw = '';
    try { if (!utils.FileExists(f)) return 0; raw = String(utils.ReadTextFile(f) || ''); } catch (e) { return 0; }
    if (!raw) return 0;
    var j = null;
    try { j = JSON.parse(raw); } catch (e) { return 0; }
    var items = (j && j.items) || {};
    var n = 0;
    Object.keys(items).forEach(function (k) {
      var v = items[k];
      if (v && v.at && Date.now() - v.at <= TTL && v.val) { mem[k] = v; n++; }
    });
    return n;
  }

  function clearCache() {
    mem = Object.create(null);
    dirty = true;
    saveNow();
    var f = cacheFile();
    try { if (f && utils.FileExists(f)) utils.RemoveFile(f); } catch (e) {}
  }

  function headerOf(r, name) {
    var h = (r && r.headers) || {};
    var low = String(name || '').toLowerCase();
    try {
      for (var k in h) if (h.hasOwnProperty(k) && String(k).toLowerCase() === low) return String(h[k]);
    } catch (e) {}
    return '';
  }

  function urlHost(u) {
    var m = /^https?:\/\/([^\/]+)/i.exec(String(u || ''));
    return m ? m[1] : '';
  }

  /* Apple 会把专辑地址 301 到规范化 slug（搜索页给的 slug 常常是旧的）。
     HTTPRequestAsync 不跟随跳转，这里自己跟，最多 2 跳。 */
  function absoluteUrl(base, loc) {
    var l = txt(loc);
    if (!l) return '';
    if (/^https?:\/\//i.test(l)) return l;
    var h = urlHost(base);
    if (!h) return l;
    return 'https://' + h + (l.charAt(0) === '/' ? l : ('/' + l));
  }

  function httpText(url, hop) {
    hop = hop || 0;
    if (!NM.http || typeof NM.http.request !== 'function') {
      return Promise.reject(new Error('没有 HTTP 层（NM.http 未初始化）'));
    }
    return NM.http.request({
      url: url,
      method: 'GET',
      headers: {
        'User-Agent': UA,
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Referer': HOST + '/'
      },
      timeout: TIMEOUT
    }).then(function (r) {
      var body = r && r.body != null ? String(r.body) : '';
      var code = (r && r.status) || 0;

      if (code === 301 || code === 302 || code === 303 || code === 307 || code === 308) {
        var loc = headerOf(r, 'location');
        var next = absoluteUrl(url, loc);
        if (next && hop < 2) return httpText(next, hop + 1);
        throw new Error('Apple 返回 ' + code + ' 跳转，但拿不到目标地址');
      }

      if (code === 429) throw new Error('Apple 限流（429），稍后再试');
      if (code && (code < 200 || code > 399)) throw new Error('Apple 返回 HTTP ' + code);
      if (!body) throw new Error('Apple 返回空页面');
      if (body.indexOf('serialized-server-data') < 0 && body.indexOf('schema:music') < 0) {
        throw new Error('页面结构不认识（可能被重定向到验证页）');
      }
      return body;
    });
  }

  /* 串行排队：前一个结束 + GAP 之后才发下一个 */
  function queue(task) {
    var p = chain.then(function () {
      var wait = Math.max(0, GAP - (Date.now() - lastAt));
      return new Promise(function (res) { setTimeout(res, wait); });
    }).then(function () {
      lastAt = Date.now();
      return task();
    });
    chain = p.then(function () {}, function () {});
    return p;
  }

  function cached(key, task) {
    var hit = cacheGet(key);
    if (hit) return Promise.resolve(hit);
    if (inflight[key]) return inflight[key];
    var p = queue(task).then(function (v) {
      delete inflight[key];
      cachePut(key, v);
      return v;
    }, function (e) {
      delete inflight[key];
      throw e;
    });
    inflight[key] = p;
    return p;
  }

  /* ======================================================================
     5. 对外查询
     ====================================================================== */
  function search(term) {
    var q = txt(term);
    if (!q) return Promise.resolve({ songs: [], albums: [] });
    var key = 's:' + normKey(q);
    return cached(key, function () {
      var url = HOST + '/search?term=' + encodeURIComponent(q);
      return httpText(url).then(function (html) {
        var r = parseSearch(html);
        if (!r.songs.length && !r.albums.length) throw new Error('搜索没有结果');
        return r;
      });
    });
  }

  function albumById(id, slugUrl) {
    var aid = txt(id);
    if (!aid) return Promise.reject(new Error('专辑 id 为空'));
    var key = 'a:' + aid;
    return cached(key, function () {
      var url = txt(slugUrl) || (HOST + '/album/' + aid);
      url += (url.indexOf('?') < 0 ? '?' : '&') + 'l=zh-Hans-CN';
      return httpText(url).then(function (html) {
        var a = parseAlbum(html);
        a.id = aid;
        if (!a.tracks.length) throw new Error('专辑页没有曲目表');
        return a;
      });
    });
  }

  /* 古典站查不到/没曲目的专辑记 30 分钟，免得每首都白跑一次请求 */
  var clsMiss = Object.create(null);
  var CLS_MISS_TTL = 30 * 60 * 1000;

  function classicalAlbum(id) {
    var aid = txt(id);
    if (!aid) return Promise.resolve(null);

    var miss = clsMiss[aid];
    if (miss && (Date.now() - miss.at) < CLS_MISS_TTL) return Promise.resolve(null);

    var key = 'c:' + aid;
    return cached(key, function () {
      var url = CLASSICAL_HOST + '/album/' + aid + '?l=zh-Hans-CN';
      return httpText(url).then(function (html) {
        var a = parseClassical(html);
        if (!a || !a.tracks.length) return { empty: true, tracks: [] };
        a.id = aid;
        return a;
      });
    }).then(function (a) {
      if (a && a.tracks && a.tracks.length) return a;
      clsMiss[aid] = { at: Date.now() };
      return null;
    }, function () {
      clsMiss[aid] = { at: Date.now() };
      return null;
    });
  }

  /* 从候选里挑最可能是这首的 */
  function pickSong(cands, track) {
    var tTitle = txt(track && track.title);
    var tArtist = txt(track && track.artist);
    var tAlbum = txt(track && track.album);
    var tDur = Number(track && track.duration) || 0;
    var tVer = hasVerWord(versionTag(tTitle) || tTitle);

    var best = null;
    for (var i = 0; i < cands.length; i++) {
      var c = cands[i];
      var score = sim(c.title, tTitle) * 2.4 + artistSim(c.artist, tArtist) * 1.2;
      if (tAlbum && c.subtitle && sim(tAlbum, c.subtitle) > 0.9) score += 0.3;
      /* 候选带版本词、原曲没有 → 明显不是同一首（Live / 伴奏 排前面是常态） */
      var cVer = hasVerWord(versionTag(c.title) || c.title);
      if (cVer && !tVer) score -= 1.6;
      if (!cVer && tVer) score -= 0.4;
      c._score = score;
      if (!best || score > best._score) best = c;
    }
    return best;
  }

  /* 在专辑曲目表里定位这首歌 */
  function pickTrack(album, cand, track) {
    var list = (album && album.tracks) || [];
    if (!list.length) return null;
    var i;
    if (cand && cand.songId) {
      for (i = 0; i < list.length; i++) if (list[i].id === cand.songId) return list[i];
    }
    var tTitle = txt(track && track.title);
    var tMs = (Number(track && track.duration) || 0) * 1000;
    var best = null, bestScore = -99;
    for (i = 0; i < list.length; i++) {
      var t = list[i];
      var s = sim(t.title, tTitle) * 2.4;
      if (tMs && t.ms) {
        var d = Math.abs(t.ms - tMs) / 1000;
        s += d <= 3 ? 1.4 : (d <= 8 ? 0.5 : (d <= 15 ? -0.3 : -1.6));
      }
      if (!best || s > bestScore) { best = t; bestScore = s; }
    }
    return bestScore >= 0.8 ? best : null;
  }

  /* 主接口：track → 字段 */
  function lookup(track, opt) {
    opt = opt || {};
    var want = opt.fields && opt.fields.length ? opt.fields : [];
    function on(k) { return !want.length || want.indexOf(k) >= 0; }

    var title = txt(track && track.title);
    var artist = txt(track && track.artist);
    if (!title) return Promise.resolve({ ok: false, reason: '曲名为空' });

    var term = title + (artist ? (' ' + artist) : '');
    return search(term).then(function (r) {
      var cand = pickSong(r.songs, track);
      /* 分数太低就当没找到：宁可留空，也不要写错歌的专辑和年份 */
      if (cand && cand._score < MATCH_MIN) cand = null;
      if (!cand) {
        /* 搜索只有专辑结果时，退一步用专辑名匹配一次 */
        var alb = null, bestA = 0;
        for (var i = 0; i < r.albums.length; i++) {
          var s = sim(r.albums[i].title, track && track.album) * 2 + sim(r.albums[i].title, title);
          if (s > bestA) { bestA = s; alb = r.albums[i]; }
        }
        if (!alb || bestA < MATCH_MIN) return { ok: false, reason: 'Apple 没搜到这首歌' };
        cand = { kind: 'album', albumId: alb.albumId, albumUrl: alb.albumUrl,
                 songId: '', title: alb.title, artist: alb.artist, _score: bestA };
      }
      return albumById(cand.albumId, cand.albumUrl).then(function (album) {
        var t = pickTrack(album, cand, track);
        if (!t) return { ok: false, reason: '专辑里没找到对应曲目', album: album };

        function finish(cls, ct) {
          var fields = {};
          if (on('title') && t.title) fields.TITLE = t.title;
          if (on('artist') && (t.artist || album.artist)) fields.ARTIST = t.artist || album.artist;
          if (on('album') && album.name) fields.ALBUM = album.name;
          if (on('date') && album.date) fields.DATE = album.date;
          if (on('genre') && album.genre) fields.GENRE = album.genre;
          if (on('track') && t.track) fields.TRACK = String(t.track);
          if (on('track') && album.total) fields.TRACKTOTAL = String(album.total);
          if (on('disc') && t.disc) fields.DISCNUMBER = String(t.disc);
          if (on('disc') && album.discs) fields.DISCTOTAL = String(album.discs);
          if (on('albumartist') && album.artist) fields.ALBUMARTIST = album.artist;
          if (on('composer') && t.composer) fields.COMPOSER = t.composer;
          if (on('copyright') && album.copyright) fields.COPYRIGHT = album.copyright;

          /* 古典：作品名 / 乐章名 / 乐章号 / 乐章总数 / Show Movement。
             古典站没有就不写，绝不拿流行专辑的曲名去凑「乐章」。 */
          if (ct && ct.work) {
            fields.WORK = ct.work;
            fields.SHOWMOVEMENT = '1';
            if (ct.title) fields.MOVEMENTNAME = ct.title;
            if (ct.movement) fields.MOVEMENT = String(ct.movement);
            if (ct.movementTotal) fields.MOVEMENTTOTAL = String(ct.movementTotal);
          }
          /* 古典站的作曲是本地化全名（路德维希・凡・贝多芬），比普通站准 */
          if (on('composer') && ct && ct.composer) fields.COMPOSER = ct.composer;

          return {
            ok: true,
            fields: fields,
            cover: on('cover') ? (album.cover || (cls && cls.cover) || '') : '',
            album: { id: album.id, name: album.name, artist: album.artist,
                     date: album.date, genre: album.genre, tracks: album.total },
            match: {
              score: Math.round((cand._score || 0) * 100) / 100,
              albumId: album.id,
              songId: t.id,
              track: t.track,
              disc: t.disc,
              title: t.title,
              classical: !!ct,
              work: ct ? ct.work : '',
              movement: ct ? ct.movement : 0
            }
          };
        }

        /* 勾了「作品/乐章」且这张专辑像古典，才多为它抓一次古典站 */
        if (!on('classical') || !looksClassical(album)) return finish(null, null);
        return classicalAlbum(cand.albumId).then(function (cls) {
          return finish(cls, pickClassicalTrack(cls, t, album));
        }, function () {
          return finish(null, null);
        });
      });
    });
  }

  NM.apple = {
    FIELDS: FIELDS,
    lookup: lookup,
    search: search,
    albumById: albumById,
    classicalAlbum: classicalAlbum,
    cover1200: cover1200,
    parseSearch: parseSearch,
    parseAlbum: parseAlbum,
    parseClassical: parseClassical,
    looksClassical: looksClassical,
    loadCache: loadCache,
    saveCache: saveNow,
    clearCache: clearCache,
    cacheCount: function () { return Object.keys(mem).length; },
    setGap: function (ms) { GAP = Math.max(0, Number(ms) || 0); },
    TTL: TTL
  };
})(window);
