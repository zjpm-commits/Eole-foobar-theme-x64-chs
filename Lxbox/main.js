/* ==========================================================================
   洛雪音源 · JSplitter 面板  v2.0.1
     - 排行榜：QQ / 网易 / 酷我 / 酷狗 / 咪咕（与上排标签严格同列对齐）
     - 搜索：当前平台单曲搜索（面板内直接打字，on_char + 按键兜底 + Ctrl+V）
     - 不输关键词时，搜索框下面直接显示「热门推荐」曲目（网易云热歌榜）
       歌单 / 播客 / 歌手：进入即显示网易云推荐（也可输关键词搜索），双击播放
     - 曲目清单行首方框多选（可 Shift 连选），右键批量加入播放列表
     - 全界面统一成一个字号：标题、标签、平台、列表、说明、底栏、设置面板
       不再分 12 / 11 / 10 三档，层级只靠加粗（F.head / F.hdrB）与颜色区分
     - **字号与字体默认就跟 foobar2000 走**：取自 window.DlgFont，也就是首选项
       → 显示 → 字体 里「默认」那一项；在 fb2k 里把字体调大，面板的字和行高
       跟着长，两边一致。字体名也用同一个（取不到才退回微软雅黑 UI）
     - 设置面板「外观」栏的「字号」从小 / 标准 / 大 三档改成 9~18 px 的滑块，
       拖动即变成手动覆盖；「恢复默认」回到跟随 foobar2000
     - **文字颜色不设开关**：始终跟 foobar2000 首选项 → 显示 → 颜色 里「文字」
       那一项走，正文 = 该颜色，次要文字从它朝背景淡出 35%；选中 / 高亮仍用
       fb2k 的「选定项目 / 高亮」色，层级不丢。取到的颜色与面板底色太接近时
       才退回面板自己的文字色（宁可不一致，也不能看不见）
     - 新增属性 lx.fontSize；旧属性 lx.fontScale（百分比）仍然认，老配置不用改。
       v1.9.16 早期版本写过的 lx.fontColor 已废弃，读取时直接忽略
     - 字号变大时曲目行高、评论 / 日志浮层行距、顶栏两行高度一起长，不会叠字
     - 面板改成「无缝铺满」：左栏贴面板左边、左右两栏紧贴、曲目区贴到右边、
       列表行之间不再留 1px 缝、搜索框通栏贴边、评论 / 艺人浮层整块盖住内容区；
       顺手修好歌单 / 播客 / 歌手页「标题与首行曲目重叠」的老问题
     - 搜索页去掉「热门推荐 · XX榜」标题行（多出的 26px 给列表）；
       内容宽 ≥ 620px 时曲目排两列（行优先），上下键按行跳、左右键按格走
     - **搜索 / 歌单 / 播客 / 歌手 的推荐也跟着平台走**：热门推荐取当前平台的热歌 /
       新歌 / 飙升榜；歌单、歌手按平台各自取（QQ 歌单搜索 + 歌手列表、酷我 / 酷狗 /
       咪咕各自的歌单搜索、网易云个性化推荐）；播客仍只有网易云，其余平台给提示。
       推荐缓存按「平台 + 类型」分开存，切平台立刻换内容；歌单曲目新增酷狗，
       歌手歌曲五平台都能取（按歌手名搜索）
     - 搜索词不再写进面板属性（lx.keyword / lx.collKeyword.*）：重开软件 / 重载脚本后
       搜索框是空的；同一会话内切页签回来仍记得刚输的词

   v2.0.1 相对 v2.0.0：
     - **腾讯取链改成面板自己做**：以前只能靠音源脚本，而脚本用的都是
       vkey.GetVkeyServer / CgiGetVkey 这套只认 songmid 的老接口 —— 腾讯现在对未登录
       请求一律回 result=104003、purl 为空，脚本再新也拿不到东西。
       面板改走 music.vkey.GetVkey / UrlGetVkey：这个接口必须带「文件名」
       （M500{media_mid}.mp3 / M800….mp3 / F000….flac），只要拼对，免登录照样下发
       128k 的 purl，拼到 sip 后面就能直接下 —— 实测整首歌 5.1 MB 正常抓完
     - 一次请求把四档音质全问一遍，谁有 purl 用谁；缺 media_mid 时自动查
       music.pf_song_detail_svr 补上，不用再依赖脚本里那份字段
     - VIP 专享歌腾讯只回 RS02{songmid}.mp3 的试听（约 30 秒）：先让音源脚本试 8 秒
       看能不能解锁，拿不到就播试听并在底栏注明。试听**不写缓存**，
       免得 30 秒的片段被当成整首歌存下来
     - 内置取链失败时仍退回音源脚本，两条路都断了才报错，报错文案也改了
     - 顺手修 songId：lx-music 的 songId 是数字 id（97773），以前这里错填成 songmid
       （0039MnYb…），凡是拿 songId 取链的脚本都会查不到歌
     - 新增属性 lx.txNative（默认 1，写 0 就回到纯脚本）、lx.txTrial（默认 1，
       写 0 就不再拿试听凑数）
     - **取回来的东西先验一遍再播**：直链带 vkey= 但值为空时直接判失败（这种链接在
       CDN 上必然 403）；缓存命中、下载完成后都读文件头认容器，认不出来（HTML / JSON /
       0 字节）就删掉重下。以前只判断「文件大于 1 KB」，一个 403 错误页就能把一首歌
       永久锁死在缓存里 —— foobar2000 只会说「不支持的格式或文件损坏」，重试多少次都一样
     - 下载本身失败、且链接带 vkey 时如实报错，不再把 403 链接原样丢给 foobar2000 弹窗
     - **取链失败但有本地缓存时直接播缓存**：平台挂了 / 断网，已经下好的歌照样能听

   播放时默认先缓存到 <profile>\Lxbox\cache 再播放（lx.download=0 可关闭）。
   配色跟随 foobar2000 的浅色/深色设置；背景使用正在播放曲目的专辑封面（模糊+半透明）。
   ========================================================================== */
var APP_VERSION = '2.0.1';       /* 顶栏左下角显示的就是它，与 DefineScript 保持一致 */
window.DefineScript('洛雪音源', { author: 'OpenCode', version: APP_VERSION });

/* --------------------------------------------------------------------------
   模块加载
   JSplitter 的 include() 相对路径基准取决于脚本的加载方式：
     - 以文件形式加载 → 脚本所在目录
     - 以「内存脚本」形式加载 → fb.ComponentPath
   这里先按默认相对路径试一次，再按已知目录逐个探测，避免依赖加载方式。
   -------------------------------------------------------------------------- */
var MODULE_DIRS = [];
/* 模块清单：isModuleFile() 用它把面板自己的文件从「音源脚本」里排除掉，
   所以新增模块必须同时登记到 lx.js 的 MODULE_FILES，否则会被当成音源加载。
   v1.9.18 起 tagwriter.js（ID3v2 / FLAC 二进制写入器）也是模块之一。 */
var MODULE_NAMES = ['crypto.js', 'tagwriter.js', 'lx.js', 'providers.js', 'main.js'];

function addModuleDir(p) {
  p = String(p || '').replace(/[\\\/]+$/, '');
  if (p && MODULE_DIRS.indexOf(p) < 0) MODULE_DIRS.push(p);
}

/* 拼路径不依赖 ProfilePath 结尾有没有反斜杠（不同 foobar2000 版本不一致） */
function joinPath(a, b) {
  a = String(a == null ? '' : a).replace(/[\\\/]+$/, '');
  b = String(b == null ? '' : b).replace(/^[\\\/]+/, '');
  if (!a) return b;
  if (!b) return a;
  return a + '\\' + b;
}

function collectModuleDirs() {
  addModuleDir(window.GetProperty('lx.moduleDir', ''));
  try { if (fb.ComponentPath) addModuleDir(joinPath(fb.ComponentPath, 'net')); } catch (e) {}
  try { if (fb.ComponentPath) addModuleDir(joinPath(fb.ComponentPath, 'net\\sources')); } catch (e) {}

  var prof = '';
  try { prof = String(fb.ProfilePath || ''); } catch (e) { prof = ''; }
  if (prof) {
    /* 安装位置固定在 profile\Lxbox（C:\Program Files\foobar2000\profile\Lxbox） */
    addModuleDir(joinPath(prof, 'Lxbox'));
    addModuleDir(joinPath(prof, 'Lxbox\\sources'));

    /* 兜底：目录被改过名也能用 —— 谁那儿有 crypto.js 就认谁 */
    ['crypto.js', '*\\crypto.js', '*\\*\\crypto.js', '*\\*\\*\\crypto.js'].forEach(function (pat) {
      try {
        (utils.Glob(joinPath(prof, pat)) || []).forEach(function (p) {
          var dir = String(p).replace(/[\\\/][^\\\/]*$/, '');
          addModuleDir(dir);
          addModuleDir(joinPath(dir, 'sources'));
        });
      } catch (e) {}
    });
  }
}

function isModuleFile(name) {
  return MODULE_NAMES.indexOf(String(name || '').toLowerCase()) >= 0;
}

/* 这个目录里（含 resources / sources 两个子目录）有没有音源脚本。
   v1.9.9 起音源统一放 <模块目录>\resources\，模块目录本身只剩面板模块文件，
   所以子目录也要看，否则会因为「根目录没音源」而认错模块目录。 */
function hasSourceScript(dir) {
  var dirs = [dir, joinPath(dir, 'resources'), joinPath(dir, 'sources')];
  for (var d = 0; d < dirs.length; d++) {
    var files = [];
    try { files = utils.Glob(dirs[d] + '\\*.js') || []; } catch (e) { files = []; }
    for (var i = 0; i < files.length; i++) {
      if (!isModuleFile(String(files[i]).replace(/^.*[\\\/]/, ''))) return true;
    }
  }
  return false;
}

/* 音源脚本目录：<模块目录>\resources（v1.9.9 起的标准位置） */
function sourcesDirFor(dir) {
  return dir ? joinPath(dir, 'resources') : '';
}

/* 即使模块走默认相对路径 include 成功（拿不到目录），也要找出真正的模块目录，
   否则 lx.js 不知道去哪里找同目录下的音源脚本。 */
function detectModuleDir() {
  var fallback = '';
  for (var i = 0; i < MODULE_DIRS.length; i++) {
    var d = MODULE_DIRS[i];
    var ok = false;
    try { ok = utils.FileExists(d + '\\crypto.js'); } catch (e) {}
    if (!ok) continue;
    if (hasSourceScript(d)) return d;
    if (!fallback) fallback = d;
  }
  return fallback;
}

function loadModule(name) {
  /* 1) 默认相对路径（脚本以文件形式加载时，这里就是脚本目录） */
  try {
    include(name, { always_evaluate: true });
    return '';
  } catch (e) {
    /* 继续探测绝对路径 */
  }

  /* 2) 已知目录 */
  for (var i = 0; i < MODULE_DIRS.length; i++) {
    var p = MODULE_DIRS[i] + '\\' + name;
    var exists = false;
    try { exists = utils.FileExists(p); } catch (e) {}
    if (!exists) continue;
    try {
      include(p, { always_evaluate: true });
      return MODULE_DIRS[i];
    } catch (e2) {
      throw new Error('加载模块失败 ' + p + '：' + ((e2 && e2.message) || e2));
    }
  }

  throw new Error('找不到模块 ' + name +
    '（已尝试默认路径与：' + (MODULE_DIRS.join('；') || '无') +
    '）。请把脚本放在 JSplitter\\net 下，或在面板属性 lx.moduleDir 指定目录。');
}

collectModuleDirs();
var moduleDir = '';
['crypto.js', 'lx.js', 'providers.js'].forEach(function (name) {
  var d = loadModule(name);
  if (!moduleDir && d) moduleDir = d;
});

/* tagwriter.js 是可选的：老安装里没有这个文件时面板要照样起来，
   封面嵌入退化成「不支持」，由 PowerShell / AttachImage 两条兜底接手。 */
var tagWriterDir = '';
try {
  tagWriterDir = loadModule('tagwriter.js');
} catch (eTag) {
  try { console.log('[LX] tagwriter.js 未加载，封面嵌入退化为兜底路径：' + ((eTag && eTag.message) || eTag)); } catch (eL) {}
}
if (!moduleDir && tagWriterDir) moduleDir = tagWriterDir;

/* JSplitter v4 的 window 是宿主 API 对象，不是全局对象本身：
   window.NM 不会自动变成裸 NM，这里显式取一次并声明成全局变量。 */
var NM = window.NM;
if (!NM) {
  throw new Error('模块已加载但 NM 未初始化（检查 crypto.js / lx.js / providers.js 是否完整）');
}

/* 让 lx.js 优先从模块所在目录找音源脚本 */
if (!moduleDir) moduleDir = detectModuleDir();
if (moduleDir) {
  try { window.SetProperty('lx.moduleDir', moduleDir); } catch (e) {}
  NM.moduleDir = moduleDir;
}

/* --------------------------------------------------------------------------
   常量 / 主题
   -------------------------------------------------------------------------- */
var PAD = 10;
var HEAD_H = 62;
var FOOT_H = 24;
var ROW_H = 44;
var ROW_H_ONE = 30;
var BOARD_W = 190;
var BOARD_ROW_H = 27;
/* 左栏收起后剩下的一条窄边：只放一个展开按钮和竖排标题，右侧曲目区整宽显示 */
var SIDE_RAIL_W = 26;
var LIST_ROW_H = 38;
var PLAYLIST_NAME = '洛雪音源';

/* 顶部标签：排行榜 / 搜索 / 歌单 / 播客 / 歌手 */
var TAB_DEFS = [
  { key: 'board', label: '排行榜' },
  { key: 'search', label: '搜索' },
  { key: 'playlist', label: '歌单' },
  { key: 'podcast', label: '播客' },
  { key: 'artist', label: '歌手' }
];
var TAB_GAP = 6;

/* 顶栏两行的高度、左上角品牌列的宽度：12px 时就是原来的 26 / 22 / 58，
   字号调大以后跟着长，否则「网络音乐」和下面的版本号会被省略号截掉。
   必须写在 initTheme 里，因为它依赖当前字号。 */
function hdRow1H() { return Math.max(26, FONT_BASE + 8); }
function hdRow2H() { return clamp(FONT_BASE + 10, 22, 28); }
function brandW() { return Math.max(58, FONT_BASE * 4 + 12); }

/* 「网络音乐」右边，两行共用的起始 x */
function tabsX() { return 12 + brandW() + 12; }

/* 标签行和音源行共用同一套列：
   排行榜↔QQ、搜索↔网易、歌单↔酷我、播客↔酷狗、歌手↔咪咕 严格同列 */
function headGrid() {
  var gap = W >= 400 ? TAB_GAP : 4;
  /* 页签给右排按钮让出 12px：正常模式最左是「歌曲评论 / 艺人介绍」那一列，
     紧凑模式是三个按钮里的「人物」 */
  var right = Math.min(W - PAD, bioRect().x - 12);
  var avail = Math.max(0, right - tabsX());
  var cw = Math.floor((avail - gap * (TAB_DEFS.length - 1)) / TAB_DEFS.length);
  cw = Math.max(34, Math.min(54, cw));
  return { x: tabsX(), w: cw, gap: gap };
}

function tabRect(i) {
  var g = headGrid();
  return { x: g.x + i * (g.w + g.gap), y: 8, w: g.w, h: hdRow1H() };
}

function tabsEnd() {
  var r = tabRect(TAB_DEFS.length - 1);
  return r.x + r.w;
}

function clampTab(n) {
  n = parseInt(n, 10);
  if (!(n >= 0)) n = 0;
  return n > TAB_DEFS.length - 1 ? TAB_DEFS.length - 1 : n;
}

function tabKey() {
  return (TAB_DEFS[tab] || TAB_DEFS[0]).key;
}

/* 2 歌单 / 3 播客 / 4 歌手：左侧是「集合」列表，右侧是曲目 */
function isBrowseTab() {
  return tab >= 2;
}

/* 曲目清单：单行 / 双行（右键切换，属性 lx.rowLines 持久化） */
var rowLinesCache = 0;      /* 0 = 还没读过；1 / 2 = 缓存值 */

function rowLines() {
  /* 缓存一份：rowH() 在绘制时每行都要问一次（checkRect → rowH），
     鼠标掠过时 trackAt / checkAt / buttonAt 又各问一次 —— 一次 move 就是
     好几次 window.GetProperty。值只在切换行数时变，setProp 里统一失效。 */
  if (!rowLinesCache) {
    rowLinesCache = Number(window.GetProperty('lx.rowLines', 2)) === 1 ? 1 : 2;
  }
  return rowLinesCache;
}

/* 曲目行高：跟着统一字号走。12px 时就是原来的 44 / 30，
   字调大以后行也跟着长，双行显示才不会两行叠在一起。 */
function rowH() {
  var f = FONT_BASE || 12;
  if (rowLines() === 1) return Math.max(ROW_H_ONE, Math.round(f * 2.3));
  return Math.max(ROW_H, trackLineH1() + trackLineH2() + 6);
}

function toggleRowLines() {
  var next = rowLines() === 1 ? 2 : 1;
  rowLinesCache = 0;                 /* 改完立刻作废缓存 */
  setProp('lx.rowLines', next);      /* 走 setProp：设置面板的按钮高亮才会跟着换 */
  trackScroll = 0;
  clampScroll();
  setStatus('曲目清单：' + (next === 1 ? '单行显示' : '双行显示'));
  repaint();
}

/* --------------------------------------------------------------------------
   曲目清单多选
   每行左边一个小方框，点一下勾上（可以连着勾好几首），
   右键「加入播放列表：N 首」一次性批量入列。
   勾选跟着当前这份列表走：换榜单 / 换歌单 / 重新搜索会自动清空。
   -------------------------------------------------------------------------- */
var multiSel = {};        /* 行号 -> true */
var multiAnchor = -1;     /* 上次勾的行（Shift 连选用） */
var multiOwner = null;    /* 勾选属于哪一份 tracks */

function syncMulti() {
  if (multiOwner === tracks) return;
  multiOwner = tracks;
  multiSel = {};
  multiAnchor = -1;
}

function multiCount() {
  syncMulti();          /* 列表换过就先把旧勾选清掉，别报错误的数 */
  var n = 0;
  for (var k in multiSel) { if (multiSel[k]) n++; }
  return n;
}

function multiList() {
  var out = [];
  for (var i = 0; i < tracks.length; i++) if (multiSel[i]) out.push(tracks[i]);
  return out;
}

function multiClear(silent) {
  multiSel = {};
  multiAnchor = -1;
  if (!silent) { setStatus('已取消全部勾选'); repaint(); }
}

function multiSelectAll() {
  syncMulti();
  multiSel = {};
  for (var i = 0; i < tracks.length; i++) multiSel[i] = true;
  multiAnchor = tracks.length ? 0 : -1;
  setStatus(tracks.length ? ('已勾选 ' + tracks.length + ' 首，右键可批量加入播放列表') : '列表是空的');
  repaint();
}

function checkRect(i) {
  var rh = rowH();
  var cr = trackColRect(trackColOf(i));
  var ry = L.track.y + (trackRowOf(i) - trackScroll) * rh;
  return { x: cr.x + 9, y: ry + Math.round((rh - 12) / 2), w: 12, h: 12 };
}

/* 点在行首方框（左右各放宽 3px）就算勾选 */
function checkAt(x, y) {
  var i = trackAt(x, y);
  if (i < 0) return -1;
  var r = checkRect(i);
  if (x >= r.x - 4 && x <= r.x + r.w + 4 && y >= r.y - 4 && y <= r.y + r.h + 4) return i;
  return -1;
}

function multiToggle(i, range) {
  syncMulti();
  if (i < 0 || i >= tracks.length) return;
  if (range && multiAnchor >= 0 && multiAnchor < tracks.length) {
    var a = Math.min(multiAnchor, i), b = Math.max(multiAnchor, i);
    var want = !multiSel[i];
    for (var k = a; k <= b; k++) {
      if (want) multiSel[k] = true;
      else delete multiSel[k];
    }
  } else if (multiSel[i]) {
    delete multiSel[i];
  } else {
    multiSel[i] = true;
  }
  multiAnchor = i;
  var n = multiCount();
  setStatus(n ? ('已勾选 ' + n + ' 首，右键可批量加入播放列表') : '已取消勾选');
  repaint();
}

/* 批量入列：最多 2 首同时跑（取链 + 下载），跑完一首补一首。
   1.9.2 是每 260ms 硬塞一首，20 首等于 20 个并发下载，最容易触发接口风控；
   而且状态栏在"提交完"就说"已加入 20 首"，其实大部分还没下载完。 */
var BATCH_PARALLEL = 2;
var BATCH_ITEM_TIMEOUT = 45000;

function addManyToPlaylist(list) {
  list = (list || []).slice();
  if (!list.length) { setStatus('没有勾选曲目'); return; }

  var total = list.length;
  var batch = ++batchSeq;          /* 新批次：上一次没跑完的全部作废 */
  var next = 0, running = 0, okCount = 0, fails = [];
  var finished = false;

  setStatus('正在加入「' + PLAYLIST_NAME + '」：0/' + total + ' …');
  pump();

  function progress() {
    var done = okCount + fails.length;
    setStatus('正在加入「' + PLAYLIST_NAME + '」：' + done + '/' + total +
      (fails.length ? '（失败 ' + fails.length + '）' : '') + ' …');
    repaint();
  }

  function pump() {
    while (running < BATCH_PARALLEL && next < total) start(list[next], next++);
    if (!running && next >= total) done();
  }

  function start(track, pos) {
    running++;
    var settled = false;
    var timer = setTimeout(function () { settle(false, '超时（' + Math.round(BATCH_ITEM_TIMEOUT / 1000) + 's）'); }, BATCH_ITEM_TIMEOUT);

    function settle(ok, err) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      running--;
      if (ok) okCount++;
      else {
        fails.push((track.title || '未知曲目') + '：' + (err || '失败'));
        NM.lx.pushLog('warn', '入列失败（' + (pos + 1) + '/' + total + '）' + (track.title || '') + '：' + (err || ''));
      }
      if (batch !== batchSeq) return;   /* 已经开了新批次，静默收尾 */
      progress();
      pump();
    }

    try {
      playTrack(track, true, { silent: true, batch: batch, onDone: settle });   /* 只入列，不切歌 */
    } catch (e) {
      settle(false, (e && e.message) || '异常');
    }
  }

  function done() {
    if (finished) return;
    finished = true;
    if (batch !== batchSeq) return;
    multiClear(true);
    if (!fails.length) {
      setStatus('已加入「' + PLAYLIST_NAME + '」：' + okCount + ' 首');
    } else {
      setLastProblem('批量加入完成：成功 ' + okCount + ' 首，失败 ' + fails.length + ' 首\n' +
        fails.map(function (s, i) { return (i + 1) + '. ' + s; }).join('\n'));
      setStatus('已加入 ' + okCount + ' 首，' + fails.length + ' 首失败（点状态栏看原因）', true);
    }
    repaint();
  }
}


var DT_SINGLELINE = 0x20;
var DT_NOPREFIX = 0x800;
var DT_END_ELLIPSIS = 0x8000;
var DT_VCENTER = 0x4;
var DT_CENTER = 0x1;
var DT_RIGHT = 0x2;
var DT_CALCRECT = 0x400;

var FLAG_LEFT = DT_SINGLELINE | DT_NOPREFIX | DT_END_ELLIPSIS | DT_VCENTER;
var FLAG_CENTER = DT_SINGLELINE | DT_NOPREFIX | DT_END_ELLIPSIS | DT_VCENTER | DT_CENTER;
var FLAG_RIGHT = DT_SINGLELINE | DT_NOPREFIX | DT_END_ELLIPSIS | DT_VCENTER | DT_RIGHT;

var MF_STRING = 0x00000000;
var MF_GRAYED = 0x00000001;      /* 灰掉、不可选 */
var MF_CHECKED = 0x00000008;     /* 前面打勾：音源脚本下拉里标当前那个 */

/* 两套配色：深色 / 浅色，由 foobar2000 当前界面颜色自动选择 */
var PALETTE = {
  dark: {
    bg: 0xFF0B0E14,
    panel: 0xFF11151D,
    panel2: 0xFF171D27,
    hover: 0xFF1E2633,
    sel: 0xFF14303A,
    line: 0xFF232A36,
    text: 0xFFE8EEF7,
    dim: 0xFF8A96A8,
    accent: 0xFF4CD6FF,
    accentDim: 0xFF163642,
    warn: 0xFFFFB86B,
    err: 0xFFFF7B8A,
    btn: 0xFF1B2230,
    btnHot: 0xFF244052,
    scroll: 0xFFFFFFFF
  },
  light: {
    bg: 0xFFF2F4F8,
    panel: 0xFFFDFEFF,
    panel2: 0xFFE8EDF5,
    hover: 0xFFE2E9F3,
    sel: 0xFFD3EBF7,
    line: 0xFFD3DBE6,
    text: 0xFF1B2028,
    dim: 0xFF66707F,
    accent: 0xFF0E7BA6,
    accentDim: 0xFFCBE7F3,
    warn: 0xFFA96300,
    err: 0xFFC0392B,
    btn: 0xFFEDF1F7,
    btnHot: 0xFFD8E7F2,
    scroll: 0xFF000000
  }
};

var THEME = '';
var C = {};

/* 0xAARRGGBB */
function A(colour, alpha) {
  alpha = clamp(Math.round(alpha), 0, 255);
  return ((alpha << 24) | (colour & 0x00FFFFFF)) >>> 0;
}

var F = {};

var W = 0;
var H = 0;
var L = {};

/* 状态 */
var tab = clampTab(window.GetProperty('lx.tab', 0));
/* 顶栏第二排的音源平台按钮可以藏起来（设置 → 外观 → 第二排音源平台）。
   藏起来以后就没有「点一下换平台」的入口了，平台固定在 lx.fixedPlatform（默认网易云），
   排行榜 / 搜索 / 歌单 / 播客 / 歌手都按它拉数据。 */
var hidePlatformRow = !!Number(window.GetProperty('lx.hidePlatformRow', 0) || 0);
var fixedPlatform = String(window.GetProperty('lx.fixedPlatform', 'wy') || 'wy');

/* 属性里存的平台可能在脚本更新后消失（某个平台被砍）：退回网易云，再不行就用第一个 */
function platformKnown(p) {
  var order = (NM && NM.providers && NM.providers.order) || [];
  var i;
  for (i = 0; i < order.length; i++) if (order[i] === p) return p;
  for (i = 0; i < order.length; i++) if (order[i] === 'wy') return 'wy';
  return order[0] || p;
}

var platform = platformKnown(hidePlatformRow
  ? fixedPlatform
  : String(window.GetProperty('lx.platform', 'tx') || 'tx'));
fixedPlatform = platformKnown(fixedPlatform);
var quality = String(window.GetProperty('lx.quality', 'auto') || 'auto');
/* 搜索词只在本次运行里用：不写面板属性，重开 foobar2000 / 重载脚本后搜索框是空的 */
var searchKeyword = '';

/* 搜索框内联输入（直接打字，不再弹系统对话框） */
var editKind = '';        /* '' 未编辑 | 'search' 单曲搜索 | 'coll' 歌单/播客/歌手 | 'setting' 设置项 */
var editText = '';
var editPos = 0;
var editAll = false;      /* 激活时相当于「全选」，第一次输入/退格先清空 */
var editBlinkOn = true;
var editBlinkTimer = 0;
var setEditRow = null;    /* editKind === 'setting' 时正在编辑的那一行 */
var boards = [];
var boardIndex = 0;
var tracks = [];
var trackTitle = '';
var viewMode = 'board';
var trackScroll = 0;
var boardScroll = 0;
var selected = -1;
var hoverRow = -1;
var hoverKind = '';
var hoverBtn = '';
var mouseX = 0;

/* 左侧栏收起 / 展开：记在面板属性里，重开 foobar2000 还是上次的样子。
   收起时 L.board 宽度缩成 SIDE_RAIL_W，列表不画，只留窄条 + 展开箭头。 */
var sideCollapsed = !!Number(window.GetProperty('lx.sideCollapsed', 0));
var sideTogHot = false;     /* 箭头按钮正在被鼠标指着（跟 hoverPaint 无关，始终给反馈） */
var mouseY = 0;
var cursorHand = false;
var busy = false;
var status = '正在加载音源脚本…';
/* 最近一次失败详情（完整、多行）：状态栏只显示一行摘要，点状态栏能看全文 */
var lastProblem = '';
var footHot = false;          /* 鼠标在底栏上：底栏可点，换手型并提亮 */
function setLastProblem(text) {
  lastProblem = String(text == null ? '' : text);
}
var reqSeq = 0;
var playSeq = 0;
var batchSeq = 0;      /* 批量加入的批次号，与 playSeq 互不影响 */

/* 播放令牌：
   单曲点播 → {kind:'play', id}   被下一次点播作废
   批量入列 → {kind:'batch', id}  只被新的一次批量作废（点播不会再把批量请求打断）
   1.9.2 用同一个 playSeq 判断，批量入列中途点一首歌，剩下全部静默丢弃。 */
function tokenAlive(t) {
  if (t == null) return true;
  if (typeof t === 'number') return t === playSeq;
  if (t.kind === 'batch') return t.id === batchSeq;
  return t.id === playSeq;
}

/* 完成回调只触发一次（播放/入列/失败的每个出口都要报一次，批量靠它排队） */
function finishOnce(opts, ok, err) {
  if (!opts || typeof opts.onDone !== 'function') return;
  if (opts.__done) return;
  opts.__done = true;
  try { opts.onDone(!!ok, err ? String(err) : ''); } catch (e) {}
}

/* 最近一次点播的曲目（评论 / 艺人信息用） */
var lastTrack = null;

/* 歌单 / 播客 / 歌手 浏览状态 */
var collMode = 'top';      /* 'top' = 平台推荐（默认） | 'search' = 关键词搜索 */
var collKeyword = '';
var collItems = [];
var collIndex = -1;
var collScroll = 0;
var collLoading = false;
var collTopCache = {};     /* key = 平台 + ':' + 类型，切平台互不干扰 */
var COLL_TOP_TTL = 10 * 60 * 1000;

/* 搜索页「热门推荐」：不输关键词时搜索框下面直接给的曲目 —— 取**当前平台**的榜，
   切到 QQ 就是 QQ 热歌榜，切到酷狗就是酷狗 TOP500，不再是固定网易云。
   三个候选（热歌 / 新歌 / 飙升）按平台各配一套，换榜走右键菜单；索引存属性 lx.hotBoard。 */
var HOT_BOARDS = {
  tx: [{ id: '26', name: 'QQ音乐热歌榜' }, { id: '27', name: 'QQ音乐新歌榜' }, { id: '62', name: 'QQ音乐飙升榜' }],
  wy: [{ id: '3778678', name: '网易云热歌榜' }, { id: '3779629', name: '网易云新歌榜' }, { id: '19723756', name: '网易云飙升榜' }],
  kw: [{ id: '16', name: '酷我热歌榜' }, { id: '17', name: '酷我新歌榜' }, { id: '93', name: '酷我飙升榜' }],
  kg: [{ id: '8888', name: '酷狗TOP500' }, { id: '6666', name: '酷狗飙升榜' }, { id: '52144', name: '酷狗抖音热歌榜' }],
  mg: [{ id: '27186466', name: '咪咕尖叫热歌榜' }, { id: '27553319', name: '咪咕尖叫新歌榜' }, { id: '27553408', name: '咪咕尖叫原创榜' }]
};
var hotBoardIndex = parseInt(window.GetProperty('lx.hotBoard', 0), 10);
var hotTracks = [];        /* 热门推荐缓存（10 分钟） */
var hotPlatform = '';      /* 上面这撮缓存是哪个平台的 */
var hotAt = 0;
var hotLoading = false;
var hotMode = false;       /* 曲目区当前显示的是热门推荐（不是搜索结果） */
var HOT_TTL = 10 * 60 * 1000;

/* 同一页里「上次搜的关键词」只活在内存：切走再切回来还记得，
   重开软件 / 重载脚本就没了（以前存 lx.collKeyword.*，会一直留着） */
var collKeywordMem = {};

function collKeywordOf(kind) {
  return String(collKeywordMem[kind] || '');
}

function setCollKeywordOf(kind, kw) {
  collKeywordMem[kind] = String(kw || '');
}

/* 评论 / 艺人介绍浮层 */
var overlay = '';          /* '' | 'comments' | 'bio' */
var overlayName = '';      /* 浮层标题 */
var overlaySubject = '';   /* 副标题：曲目 / 歌手 */
var overlayHot = '';       /* 浮层里上次的 hover 状态：只有变了才重绘 */
var overlayItems = null;   /* 评论条目 */
var overlayText = '';      /* 艺人介绍纯文本 */
/* 排版结果只有 overlayCols 一处：v1.9.19 把「一维行数组」升级成「按列的行数组」，
   单列时就是 [[全部行…]]。绘制、滚动、滚动条都从这里取，不再另存一份拍平的行。 */
var overlayCols = [];      /* 分列结果：[[第 1 列的行…], [第 2 列的行…]] */
var overlayWrapKey = '';   /* 排版缓存 key：列数 + 单列宽，变了才重排 */
var overlayScroll = 0;
var overlayLoading = false;
var overlayError = '';

/* 艺人介绍浮层（v1.9.21）：左上歌手图片 + 左下热门歌曲 + 右侧介绍文本。
   热门歌曲单独一套状态，滚动位置跟右侧正文各走各的。 */
var BIO_PAGE = 15;          /* 一屏（一组）15 首，点「更多」再加 15 */
var bioTracks = [];         /* 热门歌曲（完整 track，可直接点播） */
var bioTotal = 0;           /* 歌手一共有多少首热门歌（可能多于 bioTracks.length） */
var bioShow = BIO_PAGE;     /* 当前显示到第几首 */
var bioSongScroll = 0;      /* 歌单自己的滚动位置 */
var bioMoreHot = false;     /* 「更多…」hover（歌单行不再有 hover 态） */
var bioSongSel = -1;        /* 歌单里选中的行（右键 / 单选反馈） */
var bioPicPath = '';        /* 已加载的歌手图片文件 */
var bioPic = null;          /* gdi.Image：歌手图片（缓存下来，别每次重绘读盘） */
var bioPicFor = '';         /* bioPic 属于哪位歌手 */
var bioPicLoading = false;
var bioPicClickTimer = 0;   /* 单击图片的延时器：等一等看是不是双击（v2.0.0） */
var bioPicDblAt = 0;        /* 双击图片的时间戳，用来吞掉双击后紧跟的那次 up */
var bioId = 0;              /* 网易云歌手 ID（补取热门歌曲时用） */
var bioSongsFile = '';      /* cache\artist\歌手名.songs.json */
var bioSongsBusy = false;   /* 正在补取更多歌曲 */
var bioSongsFull = false;   /* 已经按歌手 ID 拉过一轮完整歌单 */

var QUALITIES = ['auto', '128k', '320k', 'flac'];
var QUALITY_LABEL = { auto: '自动', '128k': '128K', '320k': '320K', flac: 'FLAC' };
/* --------------------------------------------------------------------------
   主题 / 布局
   -------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------
   高 DPI / 4K 适配
   foobar2000 在 4K 屏、150% / 200% 缩放下，面板拿到的 Width / Height 是**物理
   像素**（3840×2160），而 gdi 画的坐标、创建的字号都是逻辑像素 —— 结果就是
   「面板变大了，字还是 12px」。整份脚本里有几百个写死的 12 / 44 / 190，
   逐个改成乘系数既容易漏，也没法保证命中测试还对得上。

   所以这里分两层换算，脚本里的数字一个都不用动：
     布局层：W / H / L / 所有 rect / 命中测试 —— 一律「逻辑像素」= 物理 ÷ UI_S
     绘制层：on_paint 拿到的 gr 包一层代理，把逻辑坐标乘回 UI_S
   100% 缩放下 UI_S = 1，代理直接返回原生 gr，零开销。

   缩放值怎么来（三条路，取最大的一个，都被 clamp 在 1~3）：
     ① 组件给的对话框字号 window.DlgFont.Size：96dpi 是 12px（9pt），
        125% → 15、150% → 18、200% → 24；有的版本按 pt 给（9 / 11.25 / 13.5）
     ② 系统滚动条宽度 SM_CXVSCROLL(2)：96dpi 下 17px，144dpi 下 25，192dpi 下 34
     ③ 系统小图标 SM_CXSMICON(49)：96dpi 下 16px
   DPI-unaware 的进程里这些 API 返回的也是虚拟化后的 96dpi 值，算出来还是 100%，
   不会误放大。属性 lx.uiScale 可以手选覆盖（auto / 100 / 125 / 150 / 200）。
   -------------------------------------------------------------------------- */
var UI_S = 1;        /* 界面缩放：几何 + 字号 */
var UI_AUTO = 1;     /* 上次自动探测到的值，只用于显示与诊断 */

/* 1.0 / 1.25 / 1.5 这种档位，允许一点误差 */
function quantUiScale(v) {
  var steps = [1, 1.1, 1.25, 1.3, 1.5, 1.6, 1.75, 2, 2.25, 2.5, 2.75, 3];
  var best = 1, d = 1e9;
  for (var i = 0; i < steps.length; i++) {
    var dd = Math.abs(v - steps[i]);
    if (dd < d) { d = dd; best = steps[i]; }
  }
  return best;
}

/* 自动探测系统 DPI 缩放 */
function detectUiScale() {
  var s = 0;

  /* ① 组件的对话框字号 */
  try {
    var d = window.DlgFont;
    var n = d ? Number(d.Size) : 0;
    if (n >= 12 && n <= 48) s = Math.max(s, n / 12);      /* px 单位 */
    else if (n >= 8 && n < 12) s = Math.max(s, n / 9);    /* pt 单位 */
  } catch (e) {}

  /* ② 系统滚动条宽度 */
  try {
    var v = Number(utils.GetSystemMetrics(2));
    if (v >= 10 && v <= 80) s = Math.max(s, v / 17);
  } catch (e) {}

  /* ③ 系统小图标 */
  try {
    var ic = Number(utils.GetSystemMetrics(49));
    if (ic >= 10 && ic <= 96) s = Math.max(s, ic / 16);
  } catch (e) {}

  if (!(s > 0.5)) s = 1;
  return quantUiScale(clamp(s, 1, 3));
}

/* 属性 lx.uiScale：auto 或 80~300 的百分数 */
function uiScaleProp() {
  var v = String(window.GetProperty('lx.uiScale', 'auto') || 'auto').toLowerCase();
  if (v === 'auto') return 'auto';
  var n = parseFloat(v);
  if (!(n >= 80 && n <= 300)) return 'auto';
  return String(Math.round(n));
}

function uiScale() {
  var p = uiScaleProp();
  if (p === 'auto') return detectUiScale();
  return clamp(parseInt(p, 10) / 100, 0.8, 3);
}

/* --------------------------------------------------------------------------
   统一字号（属性 lx.fontSize）—— 默认直接跟 foobar2000 的界面字体
   整个面板只用**一个**字号：标题、标签、平台、列表、说明、底栏、设置面板全部
   一样大，层级只靠加粗（F.head / F.hdrB）与颜色（C.text / C.dim / C.accent）区分。
   以前是 12 / 11 / 10 三种尺寸混排，同一屏里看着高低不齐。

   默认**不写死数字**：字号取自 window.DlgFont —— 也就是 foobar2000 首选项 →
   显示 → 字体 里「默认」那一项。在 fb2k 里把字体调大，面板的字跟着变大，
   两边永远一致；面板自己的「字体字号」滑块只是覆盖值（拖动即变成手动）。

   lx.fontSize：留空 / auto = 跟随 foobar2000；9~18 = 手动（96dpi 下的逻辑像素，
   落到 gdi.Font 时再乘 UI_S）。旧属性 lx.fontScale（90 / 100 / 110 的百分比）
   仍然认，老配置不用改。
   -------------------------------------------------------------------------- */
var FONT_BASE = 12;      /* 当前生效的统一字号（逻辑像素） */
var FONT_MIN = 9;
var FONT_MAX = 18;
var FONT_DEF = 12;

/* foobar2000 的界面字体。window.DlgFont 是组件对话框字体，fb2k 改了「字体」设置
   它就跟着改：Size 在 96dpi 下是 12（= 9pt），也有版本按 pt 给 9。
   字体名有就一起用，没有就退回微软雅黑 UI。 */
function fbDlgFont() {
  var size = 0, name = '';
  try {
    var o = window.DlgFont;
    if (o) {
      size = Number(o.Size) || 0;
      try { name = String(o.Name || o.Face || o.Family || ''); } catch (e2) { name = ''; }
    }
  } catch (e) {}
  if (size >= 8 && size < 12) size = size * 96 / 72;      /* 按 pt 给 → 换成 px */
  if (!(size >= 8 && size <= 60)) size = 0;
  return { size: Math.round(size), name: name };
}

function fbFontName() {
  var n = fbDlgFont().name;
  return (n && n.length >= 2 && n.length <= 64) ? n : 'Microsoft YaHei UI';
}

/* 跟随 foobar2000 时的逻辑字号 = 它的物理字号 ÷ 界面缩放
   （这样 fpx(FONT_BASE) 还原回去，正好等于 fb2k 里那个字号） */
function fbFontLogical() {
  var px = fbDlgFont().size;
  if (!(px > 0)) return FONT_DEF;
  return clamp(Math.round(px / UI_S), FONT_MIN, FONT_MAX);
}

/* 是否「跟随 foobar2000 字体」：lx.fontSize 留空 / auto，且没有老的 lx.fontScale */
function fontSizeFollow() {
  var v = '', old = '';
  try { v = String(window.GetProperty('lx.fontSize', '') || '').trim().toLowerCase(); } catch (e) { v = ''; }
  if (v !== '' && v !== 'auto') return false;
  try { old = String(window.GetProperty('lx.fontScale', '') || '').trim(); } catch (e2) { old = ''; }
  return old === '';
}

function fontSizeProp() {
  if (fontSizeFollow()) return fbFontLogical();
  var n = parseInt(window.GetProperty('lx.fontSize', -1), 10);
  if (n >= FONT_MIN && n <= FONT_MAX) return n;
  /* 老属性 lx.fontScale：百分比换算成 px */
  var f = parseInt(window.GetProperty('lx.fontScale', 100), 10);
  if (!(f >= 85 && f <= 130)) f = 100;
  return clamp(Math.round(FONT_DEF * f / 100), FONT_MIN, FONT_MAX);
}

/* 逻辑像素 → 实际字号（物理像素） */
function fpx(v) {
  return Math.max(6, Math.round(v * UI_S));
}

/* 曲目行里两行文字的高度：跟着统一字号走，12px 时就是原来的 21 / 18 */
function trackLineH1() { return Math.round(FONT_BASE * 1.7); }
function trackLineH2() { return Math.round(FONT_BASE * 1.4); }

/* 评论 / 日志浮层的行距：12px 时 19，字大了行距一起长，否则两行贴着叠 */
function overlayLineH() { return Math.max(14, Math.round(FONT_BASE * 1.6)); }

/* 重新读一次缩放 / 字号设置，变了就重建字体。
   顺序讲究：跟随 foobar2000 时字号是「它的物理字号 ÷ 界面缩放」，
   所以必须先定 UI_S 再算字号，否则会用到上一轮的缩放。 */
function refreshUiScale() {
  var s = uiScale(), old = UI_S;
  UI_S = s;
  var f = fontSizeProp();
  UI_AUTO = detectUiScale();
  if (Math.abs(s - old) < 0.005 && f === FONT_BASE) { UI_S = old; return false; }
  FONT_BASE = f;
  initTheme();
  return true;
}
/* --------------------------------------------------------------------------
   绘制代理：逻辑坐标 → 物理像素
   覆盖 main.js 里实际用到的 7 个几何方法，其余方法原样透传。
   DrawImage / GdiDrawBitmap 只缩放**目标**矩形，源矩形是位图自己的像素坐标，
   不能动（背景位图就是按逻辑尺寸烘的，贴图时放大到物理尺寸）。
   -------------------------------------------------------------------------- */
function scaledGraphics(g) {
  var s = UI_S;
  if (!g) return g;
  /* 100% 缩放：坐标不用换算，直接把原生对象还回去（这条路径最常用） */
  if (Math.abs(s - 1) < 0.005) return g;

  function X(v) {
    v = Number(v);
    if (!isFinite(v)) return 0;
    return v * s;
  }
  /* 线宽随缩放走，但至少 1px，否则 150% 下细线会断成一截一截 */
  function LW(v) {
    var w = X(v == null ? 1 : v);
    return w < 1 ? 1 : w;
  }

  var p = {
    FillSolidRect: function (x, y, w, h, c) {
      return g.FillSolidRect(X(x), X(y), X(w), X(h), c);
    },
    DrawRect: function (x, y, w, h, lw, c) {
      return g.DrawRect(X(x), X(y), X(w), X(h), LW(lw), c);
    },
    DrawLine: function (x1, y1, x2, y2, lw, c) {
      return g.DrawLine(X(x1), X(y1), X(x2), X(y2), LW(lw), c);
    },
    /* DT_CALCRECT 时宿主返回的是**物理像素**矩形，而布局算的是逻辑像素 —— 得除回去。
       v1.9.18 之前这里漏了（CalcTextWidth 那条路有除，这条没有），于是
       textWidth() 在 200% 缩放下量出两倍宽：单行显示时歌名后面的歌手 / 专辑
       会被推到很远，看着像「这首歌名字特别长」。 */
    GdiDrawText: function (t, f, c, x, y, w, h, fl) {
      var r = g.GdiDrawText(t, f, c, X(x), X(y), X(w), X(h), fl);
      if (r && typeof r.length === 'number' && r.length >= 4) {
        return [r[0] / s, r[1] / s, r[2] / s, r[3] / s];
      }
      return r;
    },
    GdiDrawBitmap: function (img, dx, dy, dw, dh, sx, sy, sw, sh) {
      return g.GdiDrawBitmap(img, X(dx), X(dy), X(dw), X(dh), sx, sy, sw, sh);
    },
    DrawImage: function (img, dx, dy, dw, dh, sx, sy, sw, sh, ang, a) {
      return g.DrawImage(img, X(dx), X(dy), X(dw), X(dh), sx, sy, sw, sh, ang, a);
    },
    /* 量出来的宽度是物理像素，布局要逻辑像素 —— 得除回去 */
    CalcTextWidth: function (t, f) {
      return g.CalcTextWidth(t, f) / s;
    },
    CalcTextHeight: function (t, f) {
      return g.CalcTextHeight(t, f) / s;
    },
    /* 无坐标参数，但必须显式列出来：宿主对象的方法不保证可枚举，
       漏了 on_paint 第一行就会 undefined 报错，整块面板画不出来 */
    SetTextRenderingHint: function (v) { return g.SetTextRenderingHint(v); },
    SetSmoothingMode: function (v) { return g.SetSmoothingMode(v); },
    SetInterpolationMode: function (v) { return g.SetInterpolationMode(v); },
    SetTextContrast: function (v) { return g.SetTextContrast(v); }
  };

  /* 其余方法（SetTextRenderingHint / SetSmoothingMode / SetInterpolationMode …）
     原样透传，免得将来加了新调用就报 undefined */
  try {
    for (var k in g) {
      if (p[k]) continue;
      var v = g[k];
      if (typeof v === 'function') p[k] = (function (fn) {
        return function () { return fn.apply(g, arguments); };
      })(v);
      else p[k] = v;
    }
  } catch (e) {}

  return p;
}

/* 全界面统一字号：96dpi 下的 FONT_BASE（默认 12px），真正的放大交给 UI_S，
   这里不再回头看 DlgFont —— 那个值已经用来推 UI_S 了，再用一次会双倍。

   六个字体对象全部同一个字号，只是「加粗 / 常规」不同：
     F.head / F.hdrB  加粗：面板标题、顶栏标题、标签页、曲目清单标题
     F.normal / F.small / F.tiny / F.hdr  常规：其余一切
   保留这几个名字是为了不动几百个调用点；v1.9.16 起它们的字号完全一样。 */
function initTheme() {
  var name = fbFontName();          /* 跟 foobar2000 的字体名一致 */
  var px = fpx(FONT_BASE);

  /* 换字号 / 换字体时旧的六个 Font 先 Dispose（v1.9.18）：
     它们也是 GDI+ 对象，拖一次字号滑块就是 6 个，拖 100px 就是 600 个。 */
  ['head', 'hdrB', 'normal', 'small', 'tiny', 'hdr'].forEach(function (k) {
    disposeObj(F[k]);
    F[k] = null;
  });

  function mk(face, bold) {
    var w = bold ? 1 : 0;
    try { return gdi.Font(face, px, w); }
    catch (e) { return gdi.Font('Segoe UI', px, w); }
  }

  F.head = mk(name, true);
  F.hdrB = mk(name, true);
  F.normal = mk(name, false);
  F.small = mk(name, false);
  F.tiny = mk(name, false);
  F.hdr = mk(name, false);

  HEAD_H = headHeight();
}

function clamp(v, lo, hi) {
  return v < lo ? lo : (v > hi ? hi : v);
}

/* --------------------------------------------------------------------------
   跟随 foobar2000 的浅色 / 深色设置
   颜色索引取自组件自带的 ColorTypeCUI / ColorTypeDUI 枚举（见 jsplaylist-mod）：
     CUI：text 0, selection_text 1, background 3, selection_background 4 …
     DUI：text 0, background 1, highlight 2, selection 3
   取到界面背景色后按亮度判断：亮 → 浅色配色，暗 → 深色配色。
   属性 lx.theme = auto / dark / light 可以强制。
   -------------------------------------------------------------------------- */
var ColorTypeCUI = {
  text: 0, selection_text: 1, inactive_selection_text: 2,
  background: 3, selection_background: 4,
  inactive_selection_background: 5, active_item_frame: 6
};
var ColorTypeDUI = { text: 0, background: 1, highlight: 2, selection: 3 };
var COLOR_WINDOW = 5;
function luminanceOf(colour) {
  var r = (colour >> 16) & 0xFF;
  var g = (colour >> 8) & 0xFF;
  var b = colour & 0xFF;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function readColour(getter) {
  if (typeof getter !== 'function') return null;
  try {
    var c = getter();
    if (typeof c === 'number' && isFinite(c) && c !== 0) return c;
  } catch (e) {}
  return null;
}

function uiBackgroundColour() {
  var inst = -1;
  try { inst = Number(window.InstanceType); } catch (e) { inst = -1; }

  var c = null;
  if (inst === 0) {
    c = readColour(function () { return window.GetColourCUI(ColorTypeCUI.background); });
  } else if (inst === 1) {
    c = readColour(function () { return window.GetColourDUI(ColorTypeDUI.background); });
  }
  /* 兜底：两种接口都试一遍，最后退回系统窗口色 */
  if (c == null) c = readColour(function () { return window.GetColourCUI(ColorTypeCUI.background); });
  if (c == null) c = readColour(function () { return window.GetColourDUI(ColorTypeDUI.background); });
  if (c == null) c = readColour(function () { return utils.GetSysColour(COLOR_WINDOW); });
  return c;
}

function themeMode() {
  var m = String(window.GetProperty('lx.theme', 'auto') || 'auto').toLowerCase();
  return (m === 'dark' || m === 'light') ? m : 'auto';
}

function themeLabel(mode) {
  return mode === 'dark' ? '深色' : (mode === 'light' ? '浅色' : '跟随系统');
}

function detectTheme() {
  var mode = themeMode();
  if (mode !== 'auto') return mode;
  var c = uiBackgroundColour();
  if (c == null) return 'dark';
  return luminanceOf(c) >= 0.5 ? 'light' : 'dark';
}

/* ---------------------------------------------------------------- 色板
   封面背景关掉时，直接拿 foobar2000 自己的「背景色 / 文字色」当底色和字色，
   其余面板色（底板、分隔线、按钮…）从这两个颜色按亮度混合出来，
   这样换 fb2k 主题时面板也跟着变。封面开着时仍用内置深浅两套（保证封面上的文字可读）。
   -------------------------------------------------------------------------- */
function mixColour(a, b, t) {
  t = clamp(t, 0, 1);
  var ar = (a >>> 16) & 0xFF, ag = (a >>> 8) & 0xFF, ab = a & 0xFF;
  var br = (b >>> 16) & 0xFF, bg2 = (b >>> 8) & 0xFF, bb = b & 0xFF;
  var r = Math.round(ar + (br - ar) * t);
  var g = Math.round(ag + (bg2 - ag) * t);
  var bl = Math.round(ab + (bb - ab) * t);
  return (0xFF000000 | (r << 16) | (g << 8) | bl) >>> 0;
}

/* 取 foobar2000 当前的背景 / 文字 / 选中色（DUI 与 CUI 都试） */
function fbUiColours() {
  var inst = -1;
  try { inst = Number(window.InstanceType); } catch (e) { inst = -1; }
  function dui(t) { return readColour(function () { return window.GetColourDUI(t); }); }
  function cui(t) { return readColour(function () { return window.GetColourCUI(t); }); }

  var bg = null, fg = null, sel = null;
  if (inst === 1) {
    bg = dui(ColorTypeDUI.background);
    fg = dui(ColorTypeDUI.text);
    sel = dui(ColorTypeDUI.selection);
  } else if (inst === 0) {
    bg = cui(ColorTypeCUI.background);
    fg = cui(ColorTypeCUI.text);
    sel = cui(ColorTypeCUI.selection_background);
  }
  if (bg == null) bg = cui(ColorTypeCUI.background);
  if (bg == null) bg = dui(ColorTypeDUI.background);
  if (fg == null) fg = cui(ColorTypeCUI.text);
  if (fg == null) fg = dui(ColorTypeDUI.text);
  if (sel == null) sel = cui(ColorTypeCUI.selection_background);
  if (sel == null) sel = dui(ColorTypeDUI.selection);
  if (bg == null) bg = readColour(function () { return utils.GetSysColour(COLOR_WINDOW); });
  if (bg == null) return null;

  bg = bg & 0xFFFFFF;
  if (fg == null) fg = luminanceOf(bg) >= 0.5 ? 0x1B2028 : 0xE8EEF7;
  return { bg: bg, fg: fg & 0xFFFFFF, sel: sel ? (sel & 0xFFFFFF) : 0 };
}

/* 由 foobar2000 的两个基色派生出整套面板色 */
function paletteFromFb(fbc) {
  var bg = fbc.bg, fg = fbc.fg;
  var light = luminanceOf(bg) >= 0.5;

  /* 选中色当强调色用，但和底色太接近就换内置的 */
  var accent = 0;
  if (fbc.sel && Math.abs(luminanceOf(fbc.sel) - luminanceOf(bg)) >= 0.12) accent = fbc.sel;
  if (!accent) accent = light ? 0x0E7BA6 : 0x4CD6FF;

  return {
    bg: (0xFF000000 | bg) >>> 0,
    panel: mixColour(bg, fg, light ? 0.045 : 0.07),
    panel2: mixColour(bg, fg, light ? 0.085 : 0.115),
    hover: mixColour(bg, fg, light ? 0.13 : 0.16),
    sel: mixColour(bg, accent, light ? 0.26 : 0.32),
    line: mixColour(bg, fg, light ? 0.16 : 0.2),
    text: (0xFF000000 | fg) >>> 0,
    dim: mixColour(fg, bg, 0.42),
    accent: (0xFF000000 | accent) >>> 0,
    accentDim: mixColour(bg, accent, 0.28),
    btn: mixColour(bg, fg, light ? 0.06 : 0.09),
    btnHot: mixColour(bg, fg, light ? 0.14 : 0.17),
    scroll: light ? 0xFF000000 : 0xFFFFFFFF
  };
}

var THEME_SIG = '';

/* ---------------------------------------------------------------- 文字颜色
   面板不提供文字颜色设置：始终跟 foobar2000 首选项 → 显示 → 颜色 → 「文字」那一项走，
   改了 fb2k 的颜色，面板正文 1~2 秒内自动跟上（主题巡检）。
   只盖正文与次要文字：正文 = fb2k 的文字色，次要文字从它朝背景淡出 35%；
   选定 / 高亮仍用 fb2k 的「选定项目 / 高亮」色（paletteFromFb 已经在用），层级不丢。
   -------------------------------------------------------------------------- */
function fbTextColour() {
  var fbc = fbUiColours();
  if (fbc && typeof fbc.fg === 'number' && fbc.fg > 0) return fbc.fg & 0xFFFFFF;
  return -1;
}

function applyFontColour() {
  var fc = fbTextColour();
  if (fc < 0) return;                          /* 取不到：保持调色板原样 */
  var bg = C.bg & 0xFFFFFF;
  /* 亮度差太小（fb2k 浅色主题 + 面板被强制成深色）就不用，宁可不一致也别看不见 */
  if (Math.abs(luminanceOf(fc) - luminanceOf(bg)) < 0.25) return;
  C.text = (0xFF000000 | fc) >>> 0;
  C.dim = mixColour(fc, bg, 0.35);
}

/* 返回 true 表示配色有变化 */
function applyTheme(force) {
  var t = detectTheme();
  THEME = t;

  /* 用「签名」判断要不要重算：fb2k 换了同深浅的另一个主题色也能跟上 */
  var fbc = null;
  var sig;
  if (bgArtEnabled()) {
    sig = 'art|' + t;
  } else {
    fbc = fbUiColours();
    sig = fbc ? ('fb|' + fbc.bg + ',' + fbc.fg + ',' + fbc.sel) : ('own|' + t);
  }
  sig += '|h' + bgHue();        /* 背景调色也参与：换色调要重算整套色板 */
  sig += '|t' + fbTextColour(); /* fb2k 的文字色变了也要重算 */
  if (!force && sig === THEME_SIG && C.text) return false;
  THEME_SIG = sig;

  var p = PALETTE[t] || PALETTE.dark;
  for (var k in p) { if (p.hasOwnProperty(k)) C[k] = p[k]; }

  if (fbc) {
    var fp = paletteFromFb(fbc);
    for (var k2 in fp) { if (fp.hasOwnProperty(k2)) C[k2] = fp[k2]; }
  }
  applyHueTint();
  applyFontColour();            /* fb2k 的文字色最后盖上去 */
  return true;
}

/* --------------------------------------------------------------------------
   背景：正在播放曲目的专辑封面（模糊 + 半透明）
   参考 jsplaylist-mod 的做法：
     1. 取封面：gdi.Image 读缓存文件，utils.GetAlbumArtV2 读文件内嵌封面
     2. 缩到长边 160 → StackBlur → 拉回面板尺寸
     3. 把「模糊封面 + 半透明底色」预先画进一张面板大小的位图（烘背景）
     4. on_paint 里用 GdiDrawBitmap 一次贴上，最快且不依赖 DrawImage 的 alpha
   属性 lx.bgArt = 0 关闭；lx.bgArtAlpha = 0~255 控制封面浓度
   -------------------------------------------------------------------------- */
var bgArt = null;        /* 原始封面 */
var bgBackdrop = null;   /* 已烘好底色的面板背景 */
var bgBackdropKey = '';
var bgArtKey = '';

function bgArtEnabled() {
  return String(window.GetProperty('lx.bgArt', '1')) !== '0';
}

/* ---------------------------------------------------------------- 背景参数
   参数口径对齐常见播放器主题（背景遮罩 / 模糊 / 亮度 / 饱和度 / 内容区不透明度）：
     lx.bgHue    -1~359   背景调色（色相）。-1 = 不染色
     lx.bgVeil   0~100    背景遮罩 %。越大封面被底色盖得越狠，100 = 基本看不见封面
     lx.bgBlur   0~40     背景模糊半径 px，0 = 不模糊
     lx.bgLum    40~160   背景亮度 %，100 = 原样
     lx.bgSat    0~100    背景饱和度 %，100 = 原色，0 = 全灰
     lx.bgGlass  0~100    内容区不透明度 %，100 = 面板最实，0 = 最透
     lx.bgTint   0~30     内容区封面染色 %，面板底色掺一点封面主色
   旧属性 lx.bgArtAlpha（0~255 越大封面越明显）自动换算成 lx.bgVeil，老配置不用改。 */
function bgHue() {
  var v = parseInt(window.GetProperty('lx.bgHue', -1), 10);
  if (!(v >= 0 && v <= 359)) return -1;
  return v;
}

function bgArtAlpha() {
  var v = parseInt(window.GetProperty('lx.bgArtAlpha', -1), 10);
  if (!(v >= 0)) return -1;          /* -1 = 没设过 */
  return clamp(v, 0, 255);
}

function bgVeil() {
  var v = parseInt(window.GetProperty('lx.bgVeil', -1), 10);
  if (v >= 0) return clamp(v, 0, 100);
  var old = bgArtAlpha();            /* 老配置：alpha 越大封面越明显 → 遮罩越薄 */
  if (old >= 0) return clamp(Math.round(100 - old / 255 * 100), 0, 100);
  return 22;
}

function bgBlur() {
  var v = parseInt(window.GetProperty('lx.bgBlur', 24), 10);
  if (!(v >= 0)) v = 24;
  return clamp(v, 0, 40);
}

function bgLum() {
  var v = parseInt(window.GetProperty('lx.bgLum', 100), 10);
  if (!(v >= 40)) v = 100;
  return clamp(v, 40, 160);
}

function bgSat() {
  var v = parseInt(window.GetProperty('lx.bgSat', 100), 10);
  if (!(v >= 0)) v = 100;
  return clamp(v, 0, 100);
}

/* 内容区不透明度：0 → 0.35（最透，但留一点底保文字可读），100 → 1（实色） */
function bgGlass() {
  var v = parseInt(window.GetProperty('lx.bgGlass', 92), 10);
  if (!(v >= 0)) v = 92;
  return 0.35 + clamp(v, 0, 100) / 100 * 0.65;
}

function bgTint() {
  var v = parseInt(window.GetProperty('lx.bgTint', 0), 10);
  if (!(v >= 0)) return 0;
  return clamp(v, 0, 30);
}

function hslToRgb(h, s, l) {
  h = ((h % 360) + 360) % 360 / 360;
  var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  var p = 2 * l - q;
  function f(t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  }
  var r = Math.round(f(h + 1 / 3) * 255);
  var g = Math.round(f(h) * 255);
  var b = Math.round(f(h - 1 / 3) * 255);
  return ((r << 16) | (g << 8) | b) >>> 0;
}

/* 该色相在当前深浅主题下的「目标底色」：深色压暗、浅色提亮，都用同一个色相 */
/* 调色板混合用的目标色：深色压得很低，只做「染色」不抬高整体亮度 */
function hueBase(hue) {
  return THEME === 'light' ? hslToRgb(hue, 0.30, 0.92) : hslToRgb(hue, 0.45, 0.16);
}

/* 色块本身要看得出色相差别，比 hueBase 亮一档 */
function hueSwatch(hue) {
  return THEME === 'light' ? hslToRgb(hue, 0.42, 0.86) : hslToRgb(hue, 0.50, 0.34);
}

var HUE_BG_KEYS = ['bg', 'panel', 'panel2', 'hover', 'sel', 'line',
                   'btn', 'btnHot', 'accentDim', 'scroll'];
var HUE_FG_KEYS = ['text', 'dim', 'accent', 'warn', 'err'];

function applyHueTint() {
  var hue = bgHue();
  if (hue < 0) return;
  var base = hueBase(hue);
  var i, k, a, c;
  for (i = 0; i < HUE_BG_KEYS.length; i++) {
    k = HUE_BG_KEYS[i];
    if (C[k] == null) continue;
    a = (C[k] >>> 24) & 0xFF;
    c = mixColour(C[k] & 0xFFFFFF, base, 0.5);
    C[k] = A(c, a);
  }
  for (i = 0; i < HUE_FG_KEYS.length; i++) {
    k = HUE_FG_KEYS[i];
    if (C[k] == null) continue;
    a = (C[k] >>> 24) & 0xFF;
    c = mixColour(C[k] & 0xFFFFFF, base, 0.12);
    C[k] = A(c, a);
  }
}

function handleKey(h) {
  if (!h) return '';
  var p = '';
  try { p = h.RawPath || h.Path || h.rawpath || h.path || ''; } catch (e) { p = ''; }
  return String(p || '');
}

function nowPlayingHandle() {
  try { return fb.GetNowPlaying(); } catch (e) { return null; }
}

function imageSize(img) {
  var w = 0, h = 0;
  if (!img) return [0, 0];
  try { w = img.Width || img.width || 0; } catch (e) {}
  try { h = img.Height || img.height || 0; } catch (e) {}
  return [w, h];
}

function backdropKeyOf() {
  /* 通透度只影响 tint()，不进这张位图，所以不出现在 key 里（拖动时不用重烘） */
  return bgArtKey + '@' + W + 'x' + H + '#' + THEME +
         '|b' + bgBlur() + '|h' + bgHue() +
         '|v' + bgVeil() + '|l' + bgLum() + '|s' + bgSat();
}

/* 封面主色：缩到 1x1 取平均。取不到就退回中性灰（只影响染色，不影响主体） */
var artAvg = 0x808080;
function artAverage() {
  var c = -1;
  try {
    var one = bgArt.Resize(1, 1, 2);
    if (one) {
      var px = 0;
      try { px = one.GetPixel(0, 0); } catch (e1) { px = -1; }
      if (!(px >= 0)) {
        try { px = one.GetPixel(0, 0, true); } catch (e2) { px = -1; }
      }
      if (px >= 0) c = px & 0xFFFFFF;
    }
  } catch (e) { c = -1; }
  return c >= 0 ? c : 0x808080;
}

/* 没有封面时的兜底背景：按当前配色/色调画一层柔和斜向渐变，
   保证「开关打开」永远有肉眼可见的区别，不会让人怀疑开关反了。 */
function paintFallbackBg(g, w, h) {
  var hue = bgHue();
  var top, bot;
  if (hue >= 0) {
    top = hslToRgb(hue, THEME === 'light' ? 0.30 : 0.42, THEME === 'light' ? 0.94 : 0.26);
    bot = hslToRgb((hue + 38) % 360, THEME === 'light' ? 0.34 : 0.46, THEME === 'light' ? 0.86 : 0.13);
  } else {
    top = THEME === 'light' ? 0xE8ECF4 : 0x1B2536;
    bot = THEME === 'light' ? 0xD2DAE8 : 0x0A0F19;
  }
  var steps = Math.max(8, Math.min(64, Math.round(h / 6)));
  for (var i = 0; i < steps; i++) {
    var t = steps <= 1 ? 0 : i / (steps - 1);
    var y0 = Math.round(h * i / steps);
    var y1 = Math.round(h * (i + 1) / steps);
    var c = mixColour(top, bot, t);
    g.FillSolidRect(0, y0, w, Math.max(1, y1 - y0), A(c, 255));
  }
}

function buildBackdrop() {
  if (!bgArtEnabled() || W <= 0 || H <= 0) { dropBackdrop(); return; }

  var bmp = null, small = null, cover = null;
  try {
    bmp = gdi.CreateImage(W, H);
    if (!bmp) return;
    var g = bmp.GetGraphics();

    if (bgArt) {
      var size = imageSize(bgArt);
      var iw = size[0], ih = size[1];
      if (iw && ih) {
        /* 先缩到长边 192 再模糊：既快，又保证大屏拉回时不糊成一片色块 */
        var sc = 192 / Math.max(iw, ih);
        var bw = Math.max(16, Math.round(iw * sc));
        var bh = Math.max(16, Math.round(ih * sc));
        small = bgArt.Resize(bw, bh, 2);
        if (small) {
          var blur = bgBlur();
          if (blur > 0) {
            try { small.StackBlur(clamp(blur, 1, 40)); } catch (eB) {}
          }
          cover = small.Resize(W, H, 2);
        }
        artAvg = artAverage();
      }
    }

    if (cover) {
      /* ① 先铺一层封面平均色，再用 alpha 把封面叠上去。
            sat=100 时 alpha=255 完全覆盖（原色）；sat 越小，平均色占比越大 → 越灰，
            这就是「背景饱和度」，不需要逐像素运算。 */
      g.FillSolidRect(0, 0, W, H, A(artAvg, 255));
      var satA = Math.round(bgSat() / 100 * 255);
      if (satA > 0) g.DrawImage(cover, 0, 0, W, H, 0, 0, W, H, 0, satA);

      /* ② 亮度：压暗盖黑、提亮盖白 */
      var lum = bgLum();
      if (lum < 100) {
        g.FillSolidRect(0, 0, W, H, A(0x000000, Math.round((100 - lum) / 100 * 210)));
      } else if (lum > 100) {
        g.FillSolidRect(0, 0, W, H, A(0xFFFFFF, Math.round((lum - 100) / 60 * 210)));
      }
    } else {
      paintFallbackBg(g, W, H);
    }

    /* ③ 背景遮罩：主题底色压上去，越大封面越淡 */
    var veil = bgVeil();
    if (veil > 0) {
      g.FillSolidRect(0, 0, W, H, A(C.bg, Math.round(clamp(veil, 0, 100) / 100 * 238)));
    }
    bmp.ReleaseGraphics(g);

    /* 烘好了才替换：中途抛异常时旧位图还在，界面不会突然掉成一块纯色 */
    var prevBmp = bgBackdrop;
    bgBackdrop = bmp;
    bgBackdropKey = backdropKeyOf();
    bmp = null;
    disposeObj(prevBmp);
  } catch (e) {
    try { console.log('[LX-UI] 生成背景失败：' + ((e && e.message) || e)); } catch (e2) {}
  } finally {
    disposeObj(small);
    disposeObj(cover);
    disposeObj(bmp);
  }
}

/* GDI+ 对象必须自己 Dispose（v1.9.18）：
   以前 bgArt / bgBackdrop / F.* 六个字体在替换时直接丢掉引用，靠 GC 收尾。
   SMP 里这些是 GDI+ 句柄，听几百首歌、拖几十次背景滑块之后会积起来 ——
   表现就是"用了半个月越来越卡"，严重时某次重绘变黑或花屏。 */
function disposeObj(o) {
  try { if (o && typeof o.Dispose === 'function') o.Dispose(); } catch (e) {}
}

/* --------------------------------------------------------------------------
   背景重建的节流（v1.9.18）
   --------------------------------------------------------------------------
   背景遮罩 / 模糊 / 亮度 / 饱和度这四个滑块，以前 onSet 里直接 buildBackdrop()，
   而且 drawBackdrop → ensureBackdrop 每次重绘还会自己再查一次 key —— 拖动时
   等于「每个像素重建一张面板大小的位图 + 重新 StackBlur」，4K / 200% 下每次
   200 万像素。拖 200px 就是 200 次。

   现在：拖动中走 queueBackdrop，把上百次合并成每 ~90ms 一次；节流窗口内
   ensureBackdrop 直接返回（贴旧图），不再自己偷偷重建。松手 flushBackdrop。
   -------------------------------------------------------------------------- */
var bgFxTimer = 0;

function queueBackdrop(ms) {
  if (bgFxTimer) return;
  bgFxTimer = setTimeout(function () {
    bgFxTimer = 0;
    buildBackdrop();
    repaint();
  }, ms == null ? 90 : ms);
}

function flushBackdrop() {
  if (bgFxTimer) {
    try { clearTimeout(bgFxTimer); } catch (e) {}
    bgFxTimer = 0;
  }
  buildBackdrop();
  repaint();
}

/* 丢掉当前背景位图（关闭封面背景时用） */
function dropBackdrop() {
  var prev = bgBackdrop;
  bgBackdrop = null;
  bgBackdropKey = '';
  disposeObj(prev);
}

function ensureBackdrop() {
  if (!bgArtEnabled()) return;
  if (bgFxTimer) return;        /* 节流窗口内：先贴旧图，别自己重建 */
  if (bgBackdropKey !== backdropKeyOf()) buildBackdrop();
}

/* 决定当前该用哪张封面，并生成背景 */
function refreshBackground(force) {
  if (!bgArtEnabled()) {
    var oldArt = bgArt;
    bgArt = null; bgArtKey = '';
    disposeObj(oldArt);
    dropBackdrop();
    return;
  }

  var h = nowPlayingHandle();
  var path = handleKey(h);
  var low = path.toLowerCase();
  var img = null;

  /* 1. 面板点播的曲目：用平台接口给的封面 */
  if (coverFile && coverPath && low && low === coverPath && fileReady(coverFile)) {
    img = loadImageFile(coverFile);
  }
  /* 2. 文件内嵌封面（外部播放的曲目） */
  if (!img) img = albumArtOf(h);
  /* 3. 缓存目录里的曲目 / 曲名对得上：退回最近一次点播的封面 */
  if (!img && coverFile && fileReady(coverFile)) {
    if (inCacheDir(low) || sameTitle(h)) img = loadImageFile(coverFile);
  }

  var key = low + '|' + (img ? (coverFile && fileReady(coverFile) ? coverFile : 'tag') : 'none');
  if (!force && key === bgArtKey) {
    disposeObj(img);           /* 这张新读出来的用不上，别留着占句柄 */
    ensureBackdrop();
    return;
  }

  bgArtKey = key;
  var prevArt = bgArt;
  bgArt = img;
  disposeObj(prevArt);
  buildBackdrop();
  repaint();
}

function sameTitle(h) {
  if (!h || !coverTitle) return false;
  var t = '';
  try { t = fb.TitleFormat('%title%').EvalWithMetadb(h) || ''; } catch (e) { t = ''; }
  return !!t && t === coverTitle;
}

/* 定时检查软件深浅色：切设置后自动换配色。
   on_paint 只在面板重绘时才跑，靠它检查会一直「没生效」。 */
var themeTimer = 0;

function watchTheme() {
  /* 跟随 foobar2000 字体时：fb2k 里改了字体 / 换了 DPI，这里要把字号与行高追上 */
  if (fontSizeFollow() && fbFontLogical() !== FONT_BASE) { applyUiScale(); return; }
  if (!applyTheme(false)) return;
  buildBackdrop();
  setStatus(bgArtEnabled()
    ? ('配色已切换：' + themeLabel(THEME))
    : '配色已跟随 foobar2000');
  repaint();
}

function startThemeWatch() {
  stopThemeWatch();
  themeTimer = setTimeout(function () {
    themeTimer = 0;
    try { watchTheme(); } catch (e) {}
    startThemeWatch();
  }, 1200);
}

function stopThemeWatch() {
  if (!themeTimer) return;
  try { clearTimeout(themeTimer); } catch (e) {}
  themeTimer = 0;
}

/* 面板点播的歌曲：平台接口给了封面地址，下载到 cache\covers\ 复用 */
var coverUrl = '';     /* 最近一次点播的封面地址 */
var coverFile = '';    /* 已下载的封面文件 */
var coverPath = '';    /* 该封面对应的音频路径（小写） */
var coverTitle = '';   /* 该封面对应的曲名 */

function coverCacheDir() {
  var dir = '';
  try { dir = cacheDir(); } catch (e) { dir = ''; }
  if (!dir) return '';
  var d = dir + '\\covers';
  try { utils.CreateFolder(d); } catch (e) {}
  return d;
}

function coverHash(url) {
  var s = String(url || '');
  try { if (NM.crypto && NM.crypto.md5) return NM.crypto.md5(s); } catch (e) {}
  var h = 0;
  for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return 'c' + (h >>> 0).toString(16);
}

function loadImageFile(file) {
  var img = null;
  try { img = gdi.Image(file); } catch (e) { img = null; }
  return img || null;
}

/* 文件内嵌封面（0 = front，4 = artist） */
function albumArtOf(handle) {
  if (!handle) return null;
  var img = null;
  try { img = utils.GetAlbumArtV2(handle, 0, false); } catch (e) { img = null; }
  if (!img) { try { img = utils.GetAlbumArtV2(handle, 4, false); } catch (e) {} }
  return img || null;
}

/* 音轨是不是本面板缓存下来的（cache 目录下，含老版 music\ 结构） */
function inCacheDir(path) {
  if (!path) return false;
  var dir = '';
  try { dir = String(cacheRoot() || '').toLowerCase(); } catch (e) { return false; }
  if (!dir) return false;
  return String(path).toLowerCase().indexOf(dir) === 0;
}

/* ---------------------------------------------------------------- 封面
   所有封面统一从网易云取（600x600），一份文件同时给背景和标签用：
   下载只做一次，尺寸不是 600 宽的再用面板内重采样补齐。            */
var coverPending = {};

/* 封面地址缓存（v1.9.18）
   --------------------------------------------------------------------------
   非网易云的曲目取封面要现场搜一次网易云（providers.cover →
   searchCandidates → searchOne，空结果还会停 260ms 再试一次），也就是点播
   一首 QQ / 酷我 / 酷狗 / 咪咕 的歌，背后先跑了一到两次搜索。
   以前这个结果只挂在当次搜索生成的 track 对象上（track._coverP），换个关键词
   重新搜同一首歌、或者重开软件，又要从头查一遍。

   这里按「平台 + 曲目 id + 曲名」记住结果：内存一份、cache\covers\urls.json
   一份（最多 500 条）。命中的话点播直接进下载，省掉那一次搜索往返。
   -------------------------------------------------------------------------- */
var coverMem = Object.create(null);
var coverMemDirty = false;
var coverMemFile = '';
var coverMemSaveTimer = 0;

function coverCacheFile() {
  if (coverMemFile) return coverMemFile;
  var dir = coverCacheDir();
  coverMemFile = dir ? dir + '\\urls.json' : '';
  return coverMemFile;
}

function coverCacheLoad() {
  if (coverCacheFile() === '') return;
  if (coverMem._loaded) return;
  coverMem._loaded = true;
  try {
    var f = coverCacheFile();
    if (!f || !utils.FileExists(f)) return;
    var j = JSON.parse(String(utils.ReadTextFile(f, 65001) || '{}').replace(/^\uFEFF/, ''));
    if (j && typeof j === 'object') {
      Object.keys(j).forEach(function (k) {
        if (k !== '_loaded' && typeof j[k] === 'string') coverMem[k] = j[k];
      });
    }
  } catch (e) {}
}

function coverCacheSave() {
  coverMemSaveTimer = 0;
  if (!coverMemDirty) return;
  coverMemDirty = false;
  var f = coverCacheFile();
  if (!f) return;
  try {
    var keys = Object.keys(coverMem).filter(function (k) { return k !== '_loaded'; });
    if (keys.length > 500) {
      keys.slice(0, keys.length - 500).forEach(function (k) { delete coverMem[k]; });
    }
    utils.WriteTextFile(f, JSON.stringify(coverMem));
  } catch (e) {}
}

function scheduleCoverCacheSave() {
  coverMemDirty = true;
  if (coverMemSaveTimer) return;
  coverMemSaveTimer = setTimeout(coverCacheSave, 1200);   /* 合并写入，别每首写一次 */
}

function coverCacheKeyOf(track) {
  if (!track) return '';
  var id = track.songmid || track.hash || track.rid || track.id || '';
  if (!id && !track.title) return '';
  return String(track.source || '') + '|' + id + '|' + String(track.title || '');
}

function trackCoverUrl(track) {
  if (track && track._coverP) return track._coverP;

  var ck = coverCacheKeyOf(track);
  if (ck) {
    coverCacheLoad();
    if (coverMem[ck]) {
      track.pic = coverMem[ck];
      var pk = Promise.resolve(coverMem[ck]);
      track._coverP = pk;
      return pk;
    }
  }

  var p = Promise.resolve('');
  try {
    p = NM.providers.cover(track);
  } catch (e) {
    p = Promise.resolve(String((track && track.pic) || ''));
  }
  p = p.then(function (u) {
    if (u) track.pic = u;
    var out = String((track && track.pic) || '');
    if (out && ck && /^https?:\/\//i.test(out)) {
      coverMem[ck] = out;
      scheduleCoverCacheSave();
    }
    return out;
  }, function () {
    return String((track && track.pic) || '');
  });
  if (track) track._coverP = p;
  return p;
}

/* 判断是不是 JPEG（网易云 ?param 有时回 PNG） */
function isJpegFile(file) {
  try {
    var b = utils.ReadBinaryFile(file);
    return !!(b && b.length > 3 && b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF);
  } catch (e) {
    return false;
  }
}

/* 封面统一成「600 宽 + JPEG」：
   宽的按比例缩到 600，PNG 的顺手转成 jpg（体积能小 3~4 倍）。
   缩放全部在面板内用 gdi 完成，不重新下载。                      */
function fitCoverWidth(file, target) {
  var img = loadImageFile(file);
  if (!img) return file;          /* 读不出来就原样用 */

  var w = 0, h = 0, out = null;
  try { w = img.Width; h = img.Height; } catch (e) { w = 0; }

  if (!w || !h) {
    try { img.Dispose(); } catch (e) {}
    return file;
  }

  var needResize = (w !== target);
  var needJpeg = !isJpegFile(file);
  if (!needResize && !needJpeg) {
    try { img.Dispose(); } catch (e) {}
    return file;
  }

  var nh = needResize ? Math.max(1, Math.round(h * target / w)) : h;
  if (needResize) {
    try { out = img.Resize(target, nh, 2); } catch (e) { out = null; }
  }
  var src = out || img;

  var tmp = file + '.fit';
  var ok = false;
  try { src.SaveAs(tmp, 'jpg'); } catch (e) { ok = false; }
  try { ok = !!ok && utils.FileExists(tmp); } catch (e) { ok = false; }

  if (ok) {
    try { utils.RemovePath(file); } catch (e) {}
    try {
      if (!utils.RenamePath(tmp, file)) file = tmp;
    } catch (e) {
      file = tmp;
    }
  } else {
    try { utils.RemovePath(tmp); } catch (e) {}
  }

  if (out) { try { out.Dispose(); } catch (e) {} }
  try { img.Dispose(); } catch (e) {}
  return file;
}

/* 下载一张封面（同 URL 只下一次，背景和标签共用结果） */
function coverDownload(url) {
  url = String(url || '');
  if (!url) return Promise.resolve('');
  var dir = coverCacheDir();
  if (!dir) return Promise.resolve('');

  var file = dir + '\\' + coverHash(url) + '.jpg';
  if (fileReady(file)) return Promise.resolve(fitCoverWidth(file, 600));
  if (coverPending[url]) return coverPending[url];

  var part = file + '.' + String(Date.now() % 100000) + '.part';
  var p = NM.lx.download(safeUrl(url), part).then(function () {
    var ok = false;
    try { ok = utils.RenamePath(part, file); } catch (e) {}
    if (!ok) {
      try { utils.RemovePath(part); } catch (e2) {}
      return '';
    }
    return fitCoverWidth(file, 600);
  }, function () {
    try { utils.RemovePath(part); } catch (e) {}
    return '';
  });

  coverPending[url] = p;
  p.then(function () { delete coverPending[url]; }, function () { delete coverPending[url]; });
  return p;
}

/* 点播时先记住封面，下载完成后自动换成背景 */
function rememberCover(track, audioPath) {
  if (audioPath) coverPath = String(audioPath).toLowerCase();
  coverTitle = String((track && track.title) || '');

  trackCoverUrl(track).then(function (url) {
    if (!url) return;
    if (lastTrack && lastTrack !== track) return;   /* 已经切歌了 */
    if (url === coverUrl) {
      if (coverFile) refreshBackground(true);
      return;
    }
    coverUrl = url;
    coverFile = '';
    coverDownload(url).then(function (f) {
      if (!f) return;
      if (url !== coverUrl) return;
      coverFile = f;
      refreshBackground(true);
    });
  });
}

/* --------------------------------------------------------------------------
   封面副本（可选的兜底）
   --------------------------------------------------------------------------
   封面本身已经嵌在音频文件里（见下面的「封面嵌入写入器」），foobar2000 的
   Album Art、Eole 这类主题的封面区、播放列表缩略图都直接读内嵌图。
   这里的 jpg 只是给「只认音轨旁边图片」的老组件留的备份：
     · 音频全平铺在 cache\ 下，一张 cover.jpg 会被几十首歌反复顶掉，
       所以永远不写 cover.jpg，只写同名的 <歌手 - 歌名>.jpg（一对一）
     · 默认关闭（lx.pushCover=1 才写），音频文件本身不会被这一步改动
   -------------------------------------------------------------------------- */
var AUDIO_EXT = ['mp3', 'flac', 'm4a', 'aac', 'ogg', 'wav', 'ape'];

function dirOfFile(p) {
  var s = String(p || '');
  var i = Math.max(s.lastIndexOf('\\'), s.lastIndexOf('/'));
  return i > 0 ? s.slice(0, i) : '';
}

function ensureFolder(dir) {
  if (!dir) return false;
  try { if (utils.IsDirectory(dir)) return true; } catch (e) {}
  try { utils.CreateFolder(dir); return true; } catch (e) { return false; }
}

function copyBytesFile(from, to) {
  if (!from || !to) return false;
  var ok = false;
  try { if (typeof utils.CopyFile === 'function') ok = utils.CopyFile(from, to) !== false; } catch (e) { ok = false; }
  if (ok) return true;
  try {
    var data = utils.ReadBinaryFile(from);
    if (!data) return false;
    return utils.WriteBinaryFile(to, data) !== false;
  } catch (e2) { return false; }
}

/* 目录里有几首音频：用来判断「里面还有没有别的歌」（清理老目录前用） */
function dirAudioCount(dir) {
  if (!dir) return 0;
  var n = 0;
  for (var i = 0; i < AUDIO_EXT.length; i++) {
    var hit = [];
    try { hit = utils.Glob(dir + '\\*.' + AUDIO_EXT[i]) || []; } catch (e) { hit = []; }
    n += hit.length;
  }
  return n;
}

/* 封面副本：平铺目录里不写 cover.jpg —— 几十首歌挤在一个 cache 目录下，
   一张 cover.jpg 会被后面的歌反复顶掉，播到谁就显示谁的脸。
   只写同名 jpg（<歌手 - 歌名>.jpg），一对一，绝不串。
   封面本身已经嵌在音频文件里了，这份 jpg 只是给「只认旁边图片」的老组件
   兜底，默认关闭（lx.pushCover=1 时才写）。返回写了几个文件。 */
function writeCoverSidecar(audioPath, coverFile) {
  if (!PUSH_COVER) return 0;
  if (!audioPath || !coverFile) return 0;
  if (!fileReady(coverFile)) return 0;

  var dir = dirOfFile(audioPath);
  if (!dir) return 0;

  var base = baseName(audioPath).replace(/\.[^.\\\/]+$/, '');
  if (!base) return 0;
  var dst = dir + '\\' + base + '.jpg';
  if (fileReady(dst)) return 1;                  /* 已经是这张，不重复写 */
  return copyBytesFile(coverFile, dst) ? 1 : 0;
}

/* --------------------------------------------------------------------------
   封面嵌入写入器 —— v1.9.18 起搬到 tagwriter.js（NM.tag）
   那 440 行是纯函数：解析 ID3v2 / FLAC、拼新文件、写后自检，和界面无关。
   这里只留一层薄适配：模块没装上时退化成「不支持」，让 PowerShell / AttachImage
   两条兜底继续工作，绝不因为缺一个文件就整块面板起不来。
   -------------------------------------------------------------------------- */
var TAG_WRITER = (NM && NM.tag) ? NM.tag : null;

function embedCoverToFile(track, path, coverFile, fields) {
  if (!TAG_WRITER) {
    return { ok: false, unsupported: true, reason: '没有加载 tagwriter.js' };
  }
  return TAG_WRITER.embedCoverToFile(track, path, coverFile, fields);
}

function hasEmbeddedCover(path) {
  if (!TAG_WRITER) return false;
  return TAG_WRITER.hasEmbeddedCover(path);
}

/* main.js 里只有 reembedCurrentCover 用到它，留一份本地实现兜底 */
function extOfPath(p) {
  var m = /\.([A-Za-z0-9]+)$/.exec(String(p || ''));
  return m ? '.' + m[1].toLowerCase() : '';
}


/* 点播链路：取封面 → 按需写一份同名 jpg 兜底（默认关）。
   封面主体是嵌进文件，那一步在 embedCover 里做。失败只返回 0，绝不挡播放 */
function pushCoverTo(track, dest, handle) {
  if (!PUSH_COVER || !dest) return Promise.resolve(0);

  var path = String(dest).toLowerCase();
  var title = String((track && track.title) || '');
  /* rememberCover 可能已经为这首下过图了，直接复用，别再去打接口 */
  var p;
  if (coverFile && fileReady(coverFile) && (path === coverPath || (!!title && title === coverTitle))) {
    p = Promise.resolve(coverFile);
  } else {
    try { p = ensureCoverFile(track); } catch (e) { p = Promise.resolve(''); }
  }

  return p.then(function (cf) {
    var n = writeCoverSidecar(dest, cf);
    if (n) { try { if (handle) handle.RefreshStats(); } catch (e) {} }
    return n;
  }, function () { return 0; });
}

/* 从 foobar2000 播放列表直接双击播缓存曲目：没有 track 对象可用，
   就按「路径 / 曲名」对上最近一次点播的封面补一张 */
function pushCoverForHandle(handle) {
  if (!PUSH_COVER || !handle) return false;
  if (!coverFile || !fileReady(coverFile)) return false;

  var path = '';
  try { path = String(handle.Path || ''); } catch (e) { path = ''; }
  if (!path) return false;
  var low = path.toLowerCase();
  if (!inCacheDir(low)) return false;
  if (!(low === coverPath || sameTitle(handle))) return false;

  var n = writeCoverSidecar(path, coverFile);
  if (n) { try { handle.RefreshStats(); } catch (e) {} }
  return n > 0;
}

/* 手动补救：把当前播放那首的封面重新嵌一遍。
   用在「文件早就在缓存里、但当时没嵌进去」的情况，不用清缓存重下。 */
function reembedCurrentCover() {
  if (!EMBED_COVER) {
    setStatus('封面嵌入已关掉（lx.embedCover=0）', true);
    return;
  }

  var h = null;
  try { h = fb.GetNowPlaying(); } catch (e) { h = null; }
  if (!h) { setStatus('没有正在播放的曲目', true); return; }

  var path = '';
  try { path = String(h.Path || ''); } catch (e) { path = ''; }
  if (!path) { setStatus('拿不到当前曲目的文件路径', true); return; }

  var ext = extOfPath(path);
  if (ext !== '.mp3' && ext !== '.flac') {
    setStatus('内嵌只支持 mp3 / flac，当前是 ' + (ext || '未知格式'), true);
    return;
  }

  var track = lastTrack;
  if (!track) {
    setStatus('先点一首网络歌曲播起来，再对这个文件补封面', true);
    return;
  }

  setStatus('正在重新嵌入封面：' + (track.title || baseName(path)) + ' …');
  var p;
  try { p = ensureCoverFile(track); } catch (e) { p = Promise.resolve(''); }
  p.then(function (cf) {
    if (!cf || !fileReady(cf)) {
      setStatus('没取到封面图（网络没拿到），稍后再试', true);
      return;
    }
    var fields = {
      TITLE: String(track.title || ''),
      ARTIST: artistText(track),
      ALBUM: String(track.album || ''),
      DATE: dateOf(track),
      GENRE: genreOf(track),
      LYRICS: ''
    };
    var r = embedCoverToFile(track, path, cf, fields);
    if (r && r.ok) {
      try { h.RefreshStats(); } catch (e) {}
      var key = cacheKeyOf(track, quality);
      var hit = indexGet(key);
      if (hit) indexPut(key, hit.f, 1, 1);
      NM.lx.pushLog('ok', '手动重嵌封面成功（' + r.how + '）：' + baseName(path));
      setStatus('封面已嵌入（' + r.how + '）：' + baseName(path));
    } else {
      NM.lx.pushLog('err', '手动重嵌封面失败：' + ((r && r.reason) || '未知'));
      setStatus('嵌入失败：' + ((r && r.reason) || '未知'), true);
    }
  }, function (e) {
    setStatus('取封面失败：' + ((e && e.message) || e), true);
  });
}

/* 有封面时各层底色的不透明度：数越小封面越透出来。
   没封面时 tint() 直接返回实色，这些数值不生效。
   目标：整块面板都是同一张封面 + 一层薄雾，而不是只有中间内容区有背景。 */
var BG_A = {
  header: 112,     /* 顶栏 */
  footer: 126,     /* 底栏 */
  side: 108,       /* 左侧榜单 / 歌单列表底板 */
  field: 116,      /* 搜索框 */
  fieldHot: 150,   /* 搜索框（悬停 / 输入中） */
  tabOn: 150,      /* 页签选中 */
  tabHot: 116,     /* 页签悬停 */
  chip: 140,       /* 平台按钮 */
  chipOn: 175,     /* 平台按钮选中 */
  btn: 175,        /* 播放 / 队列 / 导入等小按钮 */
  btnHot: 208,
  rowSel: 186,     /* 选中行 */
  rowHot: 140      /* 悬停行 */
  /* 评论 / 艺人浮层不在这里：它是阅读区，压在曲目列表上，
     跟着 bgGlass 一起变透就会和下面的行文字叠在一起 —— 见 bgOverlayPct() */
};

/* --------------------------------------------------------------------------
   绘制期属性快照（v1.9.18）
   --------------------------------------------------------------------------
   以前 tint() 每调用一次就要问三次宿主属性：artShowing() 读 lx.bgArt、
   bgTint() 读 lx.bgTint、bgGlass() 读 lx.bgGlass。而 tint 是纯绘制期函数：
   曲目列表每行 3 次（行底色 + 播放 / 队列按钮），30 行就是 90 次，加顶栏、
   平台条、底栏、侧栏，一帧约 100 次 —— 乘 3 就是 300 次 window.GetProperty。
   那是跨 COM 边界的宿主调用，比普通 JS 属性访问贵两三个数量级，滚轮滚动、
   鼠标划过列表时每一帧都在付这笔钱。

   现在 on_paint 开头取一次快照，绘制期间只读 FR，宿主调用降到 3 次/帧。
   tint / solidTint 只出现在 draw* 函数里（已核对全部调用点），所以安全。
   -------------------------------------------------------------------------- */
var FR = { art: false, tint: 0, glass: 1, hover: false };

function beginFrame() {
  FR.art   = bgArtEnabled() && !!bgBackdrop;
  FR.tint  = bgTint();
  FR.glass = bgGlass();
  FR.hover = hoverPaintProp();
}

/* --------------------------------------------------------------------------
   鼠标掠过要不要画（属性 lx.hoverPaint，默认 0 = 不画）
   --------------------------------------------------------------------------
   hover 高亮看着精致，代价是「鼠标每跨过一个可点区域就整屏重画一次」：
   整屏背景位图贴一遍（4K 下 800 万像素）+ 曲目清单几十行文字 + 顶栏。
   在设置面板里划过一排按钮、或者在曲目清单上从上往下扫，等于连续整屏重绘，
   手感就是「鼠标发粘、跟不上」。

   现在默认关掉：掠过只换光标（SetCursor 是系统调用，不碰面板），
   一个像素都不画；点下去才重绘（选中态 / 勾选态 / 切页这些是持久状态）。
   想要回老行为，属性 lx.hoverPaint=1。

   注意 FR.hover 一帧只读一次属性，绘制期 hoverOn() 不再碰宿主。
   -------------------------------------------------------------------------- */
function hoverPaintProp() {
  try { return String(window.GetProperty('lx.hoverPaint', '0')) === '1'; } catch (e) { return false; }
}

/* 绘制期判 hover：默认恒 false，所以画出来的永远是「没悬停」的静态样子。
   注意里面要算 inRect，不能写成 return hoverOn(r) —— 那会自己调自己，
   一旦把 lx.hoverPaint 打开就是无限递归（栈溢出，面板直接白掉）。 */
function hoverOn(r) {
  if (!FR.hover || !r) return false;
  return inRect(r, mouseX, mouseY);
}

/* 有背景在显示时，面板用半透明填充，让背景透出来 */
function tint(colour, alpha) {
  if (!FR.art) return colour;

  /* 内容区封面染色：面板底色掺一点封面主色，界面和封面更「贴」 */
  var c = colour;
  var k = FR.tint;
  if (k > 0) {
    var a0 = (c >>> 24) & 0xFF;
    c = mixColour(c & 0xFFFFFF, artAvg, k / 100);
    if (a0) c = A(c, a0);
  }

  /* 内容区不透明度（设置里的滑块）：越小越透，背景越抢眼 */
  return A(c, Math.round(alpha * FR.glass));
}

/* 和 tint() 一样会掺封面主色，但**不乘**内容区不透明度。
   评论 / 艺人浮层用这个：它盖在列表上，要是跟着 bgGlass 变透，
   下面的行文字会透上来和正文糊成一片。 */
function solidTint(colour, alpha) {
  var c = colour;
  if (FR.art) {
    var k = FR.tint;
    if (k > 0) {
      var a0 = (c >>> 24) & 0xFF;
      c = mixColour(c & 0xFFFFFF, artAvg, k / 100);
      if (a0) c = A(c, a0);
    }
  }
  return A(c, clamp(Math.round(alpha), 0, 255));
}

/* 评论 / 艺人浮层的底色：默认 98%，几乎不透；下限 80% 兜底，怎么调都不会糊到看不清。
   属性 lx.bgOverlay 0~100，设置面板「背景」栏里调。 */
function bgOverlayPct() {
  var v = parseInt(window.GetProperty('lx.bgOverlay', 98), 10);
  if (!(v >= 0)) v = 98;
  return clamp(v, 80, 100);
}

/* 浮层底色 = 设置面板那一套：
     正文 C.bg / 252，标题条 C.panel / 244 —— 跟「面板设置」完全同色同透明度，
     打开评论就像打开设置，不再是另一块颜色的板子贴在列表上。
   「浮层不透明度」按 98% 为基准整体缩放：98% 时正好等于设置面板，100% 更实，
   80% 时还剩 205/255。仍走 solidTint()，不乘「内容区不透明度」——
   浮层压在曲目列表上，跟着变透就会和下面的行文字叠在一起（见上面的注释）。 */
function overlayFill(colour, alpha) {
  var pct = bgOverlayPct() / 98;
  var a = (alpha === undefined || !(alpha >= 0)) ? 252 : alpha;
  return solidTint(colour === undefined ? C.bg : colour, Math.round(a * pct));
}

/* --------------------------------------------------------------------------
   浮层也铺封面背景（v1.9.20）
   --------------------------------------------------------------------------
   以前浮层是一整块实色：封面背景在列表上是有的，点「歌曲评论」/「艺人介绍」
   一开就变成一块纯色板子，跟面板其余部分断开。

   现在浮层把那张**已经烘好的背景位图按同一坐标贴回来**，再从上面压一层遮罩：
     ① 同一坐标 → 浮层里的封面与它外面严丝合缝，看不出边界；
     ② 贴图同时把下面的曲目列表整块盖住 —— 「浮层和列表文字叠字」的老问题
        不会因为透出背景而回来（v1.9.14 那条结论仍然成立）；
     ③ 遮罩浓度单独一档 lx.bgOverlayScrim（默认 62%），跟「内容区不透明度」
        无关：列表行不怕封面花，评论是整段读的，得多盖一点才不累眼。

   封面背景关掉时仍走原来的实色（overlayFill，98% 基准 = 设置面板同款）。
   -------------------------------------------------------------------------- */
function bgOverlayScrimPct() {
  var v = parseInt(window.GetProperty('lx.bgOverlayScrim', 62), 10);
  if (!(v >= 0)) v = 62;
  return clamp(v, 0, 100);
}

/* 封面上压的那层主题底色：0% 完全透出封面，100% 基本等于实色 */
function overlayScrim(colour) {
  return solidTint(colour, Math.round(bgOverlayScrimPct() * 2.55));
}

/* 用一帧一次的快照（FR.art 就是 bgArtEnabled() && !!bgBackdrop），
   绘制期不再问宿主 —— 每帧 drawOverlay 要判两次，撑不住 window.GetProperty。 */
function overlayArtOn() {
  return !!FR.art;
}

/* 从整块背景位图里抠一块贴到 (x,y,w,h)：源坐标与目标同值 ——
   位图就是按面板逻辑尺寸烘的（含封面 + 遮罩 + 调色），贴回去与面板其它区域连续。
   两套 API 都试：GdiDrawBitmap 快，老组件版本没有就走 DrawImage。 */
function blitBackdropRect(gr, x, y, w, h) {
  if (!bgBackdrop || w <= 0 || h <= 0) return false;
  try {
    gr.GdiDrawBitmap(bgBackdrop, x, y, w, h, x, y, w, h);
    return true;
  } catch (e) {}
  try {
    gr.DrawImage(bgBackdrop, x, y, w, h, x, y, w, h, 0, 255);
    return true;
  } catch (e2) {}
  return false;
}

function drawBackdrop(gr) {
  /* 有封面背景位图时，底色已经烘进那张图里，整屏贴一次就够了 ——
     原来前面还无条件 FillSolidRect 一整屏，这层马上被贴图整个盖掉，
     纯属多刷一遍 W×H 个像素（4K 下 800 万），鼠标划动时很吃重。 */
  if (bgArtEnabled()) {
    ensureBackdrop();
    if (bgBackdrop) {
      try {
        gr.GdiDrawBitmap(bgBackdrop, 0, 0, W, H, 0, 0, W, H);
        return;
      } catch (e) {
        try { gr.DrawImage(bgBackdrop, 0, 0, W, H, 0, 0, W, H, 0, 255); return; } catch (e2) {}
      }
    }
  }
  try { gr.FillSolidRect(0, 0, W, H, C.bg); } catch (e3) {}
}
/* --------------------------------------------------------------------------
   布局
   -------------------------------------------------------------------------- */
/* 当前左栏宽度：展开 = BOARD_W，收起 = 一条窄边 */
function sideW() {
  return sideCollapsed ? SIDE_RAIL_W : BOARD_W;
}

/* 左栏右上角的收起 / 展开按钮：18×18 的小方块，贴着右上角 3px。
   展开时它左边 8px 起才是「推荐 / 刷新」（见 collRecRect），互不遮挡。 */
function sideToggleRect() {
  if (!L.board || L.board.w <= 0) return null;
  return { x: L.board.x + L.board.w - 22, y: L.board.y + 3, w: 18, h: 18 };
}

function toggleSide() {
  sideCollapsed = !sideCollapsed;
  try { window.SetProperty('lx.sideCollapsed', sideCollapsed ? 1 : 0); } catch (e) {}
  computeLayout();
  clampScroll();
  sbGeom = {};              /* 左栏滚动条没了 / 回来了，几何要重建 */
  sbDrag = null;
  /* 按钮跟着栏宽挪了位置：按当前鼠标位置重算高亮，不然它会一直亮到下次划动 */
  var r = sideToggleRect();
  sideTogHot = !!(r && inRect(r, mouseX, mouseY));
  repaint();
}

function computeLayout() {
  L.bodyTop = HEAD_H;
  L.bodyBottom = Math.max(HEAD_H, H - FOOT_H);

  /* v1.9.16：整块面板「无缝铺满」—— 各区块之间不留间隙、左右不留边距，
     需要区分的地方用 1px 分隔线（见 drawBoardList / 顶栏 / 底栏）。
     文字仍保留 10px 左右的行内缩进，否则会贴着面板边缘。 */
  L.search = { x: 0, y: L.bodyTop, w: Math.max(80, W), h: 34 };

  if (tab === 0) {
    /* 排行榜：左「榜单」右「曲目」，两栏紧贴，标题行同样高度 */
    var sw0 = sideW();
    L.board = { x: 0, y: L.bodyTop, w: sw0, h: Math.max(0, L.bodyBottom - L.bodyTop) };
    L.boardListY = L.bodyTop + 26;
    L.boardListH = Math.max(0, L.bodyBottom - L.boardListY);
    L.track = {
      x: sw0,
      y: L.boardListY,
      w: Math.max(80, W - sw0),
      h: Math.max(0, L.bodyBottom - L.boardListY)
    };
    L.trackHeaderY = L.bodyTop;
  } else if (isBrowseTab()) {
    /* 歌单 / 播客 / 歌手：顶部一行搜索框，下面左「集合」右「曲目」 */
    L.search = { x: 0, y: L.bodyTop, w: Math.max(80, W), h: 30 };
    var top = L.bodyTop + 30;
    var sw1 = sideW();
    L.board = { x: 0, y: top, w: sw1, h: Math.max(0, L.bodyBottom - top) };
    L.boardListY = top + 26;
    L.boardListH = Math.max(0, L.bodyBottom - L.boardListY);
    L.track = {
      x: sw1,
      y: L.boardListY,          /* 曲线目标题占 26px，列表紧跟其后，不留缝 */
      w: Math.max(80, W - sw1),
      h: Math.max(0, L.bodyBottom - L.boardListY)
    };
    L.trackHeaderY = top;
  } else {
    /* 搜索页：搜索框 → 一行标题（热门推荐 / 搜索结果）→ 曲目清单 */
    L.board = null;                 /* 这一页没有左栏，清掉免得留着上一页的矩形 */
    L.search = { x: 0, y: L.bodyTop, w: Math.max(80, W), h: 32 };
    if (hotMode) {
      /* 热门推荐不显示「热门推荐 · 网易云热歌榜」这一行标题，列表直接从搜索框下面开始 */
      L.trackHeaderY = null;
      L.track = {
        x: 0,
        y: L.bodyTop + 32,
        w: Math.max(80, W),
        h: Math.max(0, L.bodyBottom - (L.bodyTop + 32))
      };
    } else {
      L.trackHeaderY = L.bodyTop + 32;
      L.track = {
        x: 0,
        y: L.bodyTop + 58,
        w: Math.max(80, W),
        h: Math.max(0, L.bodyBottom - (L.bodyTop + 58))
      };
    }
  }

  /* 评论 / 艺人浮层：整块盖住内容区，不留四周边距 */
  L.overlay = { x: 0, y: L.bodyTop, w: Math.max(80, W), h: Math.max(0, L.bodyBottom - L.bodyTop) };
}

/* --------------------------------------------------------------------------
   曲目区的列：搜索页（搜索结果 / 热门推荐）在面板够宽时排两列，
   行优先填充（第 1、2 首并排，第 3、4 首下一行），滚动仍按「行」。
   -------------------------------------------------------------------------- */
var TRACK_COL_MIN_W = 620;      /* 两列所需的最小内容宽：760 宽面板正好两列各 380 */

function trackColCount() {
  if (tab !== 1 || !L.track) return 1;
  return L.track.w >= TRACK_COL_MIN_W ? 2 : 1;
}

function trackRowOf(i) {
  var n = trackColCount();
  return n > 1 ? Math.floor(i / n) : i;
}

function trackColOf(i) {
  var n = trackColCount();
  return n > 1 ? (i % n) : 0;
}

function trackRowCount() {
  var n = trackColCount();
  return n > 1 ? Math.ceil(tracks.length / n) : tracks.length;
}

/* 第 col 列的矩形（滚动条仍占整个曲目区右侧，列宽平分） */
function trackColRect(col) {
  var n = trackColCount();
  if (n <= 1) return L.track;
  var cw = Math.floor(L.track.w / n);
  var w = (col === n - 1) ? (L.track.w - cw * (n - 1)) : cw;
  return { x: L.track.x + col * cw, y: L.track.y, w: w, h: L.track.h };
}

function visTrackRows() {
  return Math.max(0, Math.floor(L.track.h / rowH()));
}

function visBoardRows() {
  if (!L.board) return 0;
  return Math.max(0, Math.floor(L.boardListH / BOARD_ROW_H));
}

function clampScroll() {
  var maxT = Math.max(0, trackRowCount() - visTrackRows());
  trackScroll = clamp(trackScroll, 0, maxT);
  var list = tab === 0 ? boards : collItems;
  var maxB = Math.max(0, list.length - visBoardRows());
  boardScroll = clamp(boardScroll, 0, maxB);
  collScroll = clamp(collScroll, 0, maxB);
  var maxO = Math.max(0, overlayRowCount() - visOverlayLines());
  overlayScroll = clamp(overlayScroll, 0, maxO);
}

function repaint() {
  window.Repaint();
}

/* isError 以前收了但从来没用 —— 底栏改成拿 /失败|错误|超时|取消/ 正则去猜，
   于是「已取消勾选」「已取消导入」这类正常提示也被染成红色。现在老老实实存下来。 */
var statusIsError = false;

function setStatus(text, isError) {
  status = String(text == null ? '' : text);
  statusIsError = !!isError;
  try { console.log('[LX-UI] ' + status); } catch (e) {}
  repaint();
}

/* --------------------------------------------------------------------------
   数据
   -------------------------------------------------------------------------- */
function refreshBoards() {
  boards = (NM.providers.boards[platform] || []).slice();
  boardIndex = clamp(boardIndex, 0, Math.max(0, boards.length - 1));
  boardScroll = 0;
}

function loadBoard() {
  if (tab !== 0) return;
  var b = boards[boardIndex];
  if (!b) return;

  var token = ++reqSeq;
  busy = true;
  viewMode = 'board';
  setStatus('正在加载「' + b.name + '」…');
  NM.providers.loadBoard(platform, b.id, 100).then(function (res) {
    if (token !== reqSeq) return;
    busy = false;
    trackTitle = b.name;
    if (!res || !res.ok) {
      tracks = [];
      selected = -1;
      setStatus('榜单加载失败：' + ((res && res.error) || '未知错误'), true);
      return;
    }
    tracks = res.tracks || [];
    trackScroll = 0;
    selected = tracks.length ? 0 : -1;
    setStatus(b.name + ' · ' + tracks.length + ' 首');
  }, function (e) {
    if (token !== reqSeq) return;
    busy = false;
    tracks = [];
    selected = -1;
    setStatus('榜单加载失败：' + ((e && e.message) || e), true);
  });
}

/* --------------------------------------------------------------------------
   搜索页「热门推荐」
   进搜索页不输关键词也能直接看到/播放一批热门曲目（网易云榜单）。
   数据来自 providers.loadBoard，不依赖音源脚本；10 分钟内存缓存。
   -------------------------------------------------------------------------- */
function hotBoardList() {
  return HOT_BOARDS[platform] || HOT_BOARDS.wy;
}

function hotBoardDef() {
  var list = hotBoardList();
  if (!(hotBoardIndex >= 0 && hotBoardIndex < list.length)) hotBoardIndex = 0;
  var b = list[hotBoardIndex];
  return { platform: platform, id: b.id, name: b.name };
}

function hotTitle() {
  return '热门推荐 · ' + hotBoardDef().name;
}

function loadHot(force) {
  if (tab !== 1) return;
  var b = hotBoardDef();
  var fresh = hotTracks.length && hotPlatform === platform && (Date.now() - hotAt) < HOT_TTL;

  if (fresh && !force) {
    hotMode = true;
    viewMode = 'search';
    tracks = hotTracks.slice();
    trackScroll = 0;
    computeLayout();               /* 热门推荐没有标题行，布局要重算 */
    if (selected < 0 || selected >= tracks.length) selected = tracks.length ? 0 : -1;
    trackTitle = hotTitle();
    setStatus(hotTitle() + ' · ' + tracks.length + ' 首');
    repaint();
    return;
  }

  var token = ++reqSeq;
  busy = true;
  hotLoading = true;
  hotMode = true;
  viewMode = 'search';
  computeLayout();                 /* 同上：去掉标题行 */
  tracks = [];
  trackTitle = hotTitle();
  selected = -1;
  trackScroll = 0;
  setStatus('正在加载热门推荐（' + b.name + '）…');
  repaint();

  NM.providers.loadBoard(b.platform, b.id, 60).then(function (res) {
    if (token !== reqSeq) return;
    busy = false;
    hotLoading = false;
    if (!res || !res.ok) {
      tracks = [];
      selected = -1;
      setLastProblem('热门推荐加载失败（' + b.name + '）\n' + ((res && res.error) || '没有返回原因'));
      setStatus('热门推荐加载失败：' + String((res && res.error) || '').slice(0, 30) + '（点状态栏看原因）', true);
      return;
    }
    hotTracks = res.tracks || [];
    hotPlatform = platform;
    hotAt = Date.now();
    tracks = hotTracks.slice();
    trackScroll = 0;
    selected = tracks.length ? 0 : -1;
    setStatus(hotTitle() + ' · ' + tracks.length + ' 首');
    repaint();
  }, function (e) {
    if (token !== reqSeq) return;
    busy = false;
    hotLoading = false;
    tracks = [];
    selected = -1;
    setStatus('热门推荐加载失败：' + ((e && e.message) || e), true);
  });
}

/* 右键「换一份榜」：热歌 → 飙升 → 新歌 轮着来 */
function switchHotBoard() {
  hotBoardIndex = (hotBoardIndex + 1) % hotBoardList().length;
  try { window.SetProperty('lx.hotBoard', String(hotBoardIndex)); } catch (e) {}
  hotTracks = [];
  hotAt = 0;
  loadHot(true);
}

/* --------------------------------------------------------------------------
   搜索框内联输入
   直接在面板里打字（on_char 收字符），回车搜索 / Esc 取消，
   不再弹 utils.InputBox 那个系统对话框。

   实测 JSplitter / SMP 里 on_char 常常不触发（面板没拿到键盘焦点，
   或者系统输入法把按键吞成 VK_PROCESSKEY），所以另外补了一条
   on_key_down → 虚拟键转字符 的兜底路径，两条路任意一条通就能打字。
   -------------------------------------------------------------------------- */
function textWidthOf(gr, s, font) {
  s = String(s == null ? '' : s);
  try {
    if (gr && typeof gr.CalcTextWidth === 'function') return gr.CalcTextWidth(s, font);
  } catch (e) {}
  var w = 0;
  for (var i = 0; i < s.length; i++) w += s.charCodeAt(i) > 0x2E80 ? 13 : 7;
  return w;
}

function scheduleEditBlink() {
  if (editBlinkTimer) return;
  editBlinkTimer = setTimeout(function () {
    editBlinkTimer = 0;
    if (!editKind) return;
    editBlinkOn = !editBlinkOn;
    repaint();
    scheduleEditBlink();
  }, 520);
}

function stopEditBlink() {
  if (editBlinkTimer) {
    try { clearTimeout(editBlinkTimer); } catch (e) {}
    editBlinkTimer = 0;
  }
}

function startEdit(kind) {
  editKind = kind === 'coll' ? 'coll' : 'search';
  enableCharInput();          /* 每次进编辑都重新声明，防止面板重建后失效 */

  if (editKind === 'search') {
    if (tab !== 1) {
      tab = 1;
      try { window.SetProperty('lx.tab', tab); } catch (e) {}
      tracks = [];
      trackTitle = '';
      selected = -1;
      trackScroll = 0;
      computeLayout();
      clampScroll();
    }
    editText = searchKeyword;
  } else {
    editText = collKeywordOf(browseKind());
  }

  editPos = editText.length;
  editAll = editText.length > 0;
  editBlinkOn = true;
  scheduleEditBlink();
  setStatus(panelFocused()
    ? '直接打字，回车搜索；中文打不进面板时用右键「输入关键词」'
    : '点一下面板再打字；中文用右键「输入关键词（中文输入法）」');
  repaint();
}

function endEdit() {
  editKind = '';
  editText = '';
  editPos = 0;
  editAll = false;
  setEditRow = null;
  stopEditBlink();
  repaint();
}

/* 设置面板里的文本行（缓存目录 / 音源目录）：就地编辑，不弹系统对话框 */
function startSettingEdit(row) {
  editKind = 'setting';
  setEditRow = row;
  enableCharInput();
  editText = String(row.value == null ? '' : row.value);
  editPos = editText.length;
  editAll = editText.length > 0;
  editBlinkOn = true;
  scheduleEditBlink();
  setStatus('改完回车生效，Esc 取消');
  repaint();
}

function cancelEdit() {
  if (!editKind) return;
  endEdit();
  setStatus('已取消输入');
}

function commitEdit() {
  if (!editKind) return;
  var kind = editKind;
  var row = setEditRow;
  var text = String(editText || '').replace(/\s+/g, ' ').trim();
  endEdit();

  if (kind === 'setting') {
    if (row && typeof row.onCommit === 'function') row.onCommit(text);
    return;
  }

  if (kind === 'search') {
    if (!text) { setStatus('关键词为空，没有搜索'); return; }
    searchKeyword = text;
    runSearch(text);
    return;
  }

  if (!text) { loadRecommend(true); return; }
  collKeyword = text;
  setCollKeywordOf(browseKind(), text);
  runBrowseSearch();
}

function editInsert(ch) {
  if (!editKind || !ch) return;
  if (editAll) { editText = ''; editPos = 0; editAll = false; }
  editText = editText.slice(0, editPos) + ch + editText.slice(editPos);
  editPos += ch.length;
  editBlinkOn = true;
  repaint();
}

/* ---- 让面板真正收到字符消息 ----
   SMP / JSplitter 里 on_char 只有在 window.DlgCode 声明了 DLGC_WANTCHARS
   之后才会被调用，否则打字永远进不来（这就是「搜索框不能输入文字」的根因）。
   顺带声明 WANTARROWS，方向键选歌才不会被系统吞掉。               */
var DLGC_WANTARROWS = 0x0001;
var DLGC_WANTCHARS = 0x0080;

function enableCharInput() {
  var code = DLGC_WANTARROWS | DLGC_WANTCHARS;
  /* 新版 JSplitter：window.DlgCode(flags) 是方法 */
  try {
    if (typeof window.DlgCode === 'function') { window.DlgCode(code); return true; }
  } catch (e) {}
  /* 老版 SMP：window.DlgCode 是可读写属性，按位或上去，别覆盖原有的标志 */
  try {
    var cur = 0;
    try { cur = Number(window.DlgCode) || 0; } catch (e0) {}
    window.DlgCode = cur | code;
    return true;
  } catch (e2) {}
  return false;
}

function panelFocused() {
  try { if (typeof window.IsFocused !== 'undefined') return !!window.IsFocused; } catch (e) {}
  return true;
}

/* ---- 键盘兜底：on_char 不触发时，用虚拟键自己转字符 ----
   Shift / Ctrl 用 utils.IsKeyPressed 现场查询（比记状态可靠），
   老组件没有这个函数时退回 on_key_down / on_key_up 的记号。 */
var shiftDown = false;
var ctrlDown = false;
var keyGuard = '';        /* on_key_down 刚插入的字符，on_char 再送一次就跳过 */
var imeHinted = false;

function keyPressed(vk) {
  try {
    if (typeof utils !== 'undefined' && utils && typeof utils.IsKeyPressed === 'function') {
      return !!utils.IsKeyPressed(vk);
    }
  } catch (e) {}
  if (vk === 0x10) return shiftDown;
  if (vk === 0x11) return ctrlDown;
  return false;
}

/* 虚拟键 → 字符（按美式键盘布局，够打字母/数字/符号） */
var VK_CHARS = {
  0x20: [' ', ' '], 0xBA: [';', ':'], 0xBB: ['=', '+'], 0xBC: [',', '<'],
  0xBD: ['-', '_'], 0xBE: ['.', '>'], 0xBF: ['/', '?'], 0xC0: ['`', '~'],
  0xDB: ['[', '{'], 0xDC: ['\\', '|'], 0xDD: [']', '}'], 0xDE: ["'", '"'],
  0x6A: ['*', '*'], 0x6B: ['+', '+'], 0x6D: ['-', '-'], 0x6E: ['.', '.'], 0x6F: ['/', '/']
};
var VK_SHIFT_DIGITS = ')!@#$%^&*(';

function vkChar(vkey) {
  var sh = keyPressed(0x10);
  if (vkey >= 0x41 && vkey <= 0x5A) {                 /* A-Z */
    var c = String.fromCharCode(vkey);
    return sh ? c : c.toLowerCase();
  }
  if (vkey >= 0x30 && vkey <= 0x39) {                 /* 0-9 */
    return sh ? VK_SHIFT_DIGITS.charAt(vkey - 0x30) : String.fromCharCode(vkey);
  }
  if (vkey >= 0x60 && vkey <= 0x69) return String.fromCharCode(vkey - 0x30); /* 小键盘 */
  var p = VK_CHARS[vkey];
  return p ? (sh ? p[1] : p[0]) : '';
}

function clipboardText() {
  var s = '';
  try {
    if (typeof utils !== 'undefined' && utils && typeof utils.GetClipboardText === 'function') {
      s = utils.GetClipboardText() || '';
    }
  } catch (e) { s = ''; }
  return String(s).replace(/[\r\n\t]+/g, ' ').trim();
}

/* 编辑状态的按键：返回 true 表示已消费（不要再走列表快捷键） */
function editKey(vkey) {
  if (!editKind) return false;

  if (vkey === 0x0D) { commitEdit(); return true; }
  if (vkey === 0x1B) { cancelEdit(); return true; }

  if (vkey === 0x08) {          /* Backspace */
    if (editAll) { editText = ''; editPos = 0; editAll = false; }
    else if (editPos > 0) {
      editText = editText.slice(0, editPos - 1) + editText.slice(editPos);
      editPos--;
    }
    editBlinkOn = true; repaint(); return true;
  }
  if (vkey === 0x2E) {          /* Delete */
    if (editAll) { editText = ''; editPos = 0; editAll = false; }
    else if (editPos < editText.length) {
      editText = editText.slice(0, editPos) + editText.slice(editPos + 1);
    }
    editBlinkOn = true; repaint(); return true;
  }
  if (vkey === 0x25) { editPos = Math.max(0, editPos - 1); editAll = false; editBlinkOn = true; repaint(); return true; }
  if (vkey === 0x27) { editPos = Math.min(editText.length, editPos + 1); editAll = false; editBlinkOn = true; repaint(); return true; }
  if (vkey === 0x24) { editPos = 0; editAll = false; editBlinkOn = true; repaint(); return true; }
  if (vkey === 0x23) { editPos = editText.length; editAll = false; editBlinkOn = true; repaint(); return true; }

  /* Ctrl+V 粘贴：中文输入法打不进面板时，从别处复制过来贴 */
  if (vkey === 0x56 && keyPressed(0x11)) {
    var pasted = clipboardText();
    if (pasted) { editInsert(pasted); setStatus('已粘贴：' + pasted); }
    return true;
  }

  /* 输入法正在组词：面板收不到字母，提示一下 */
  if (vkey === 0xE5) {
    if (!imeHinted) {
      imeHinted = true;
      setStatus('中文输入法打不进面板：请切英文输入法，或右键「输入关键词（输入法）」', true);
    }
    return true;
  }

  /* 普通字符：自己在按键阶段插入（on_char 不触发时也能打字） */
  var ch = vkChar(vkey);
  if (ch) { editInsert(ch); keyGuard = ch; return true; }

  return true;      /* 编辑中吞掉其余按键，别触发列表播放/切换 */
}

function runSearch(kw) {
  tab = 1;
  hotMode = false;          /* 有关键词：曲目区换成搜索结果 */
  try { window.SetProperty('lx.tab', tab); } catch (e) {}
  computeLayout();
  tracks = [];
  trackTitle = '';
  selected = -1;
  trackScroll = 0;

  var token = ++reqSeq;
  busy = true;
  viewMode = 'search';
  setStatus('正在搜索「' + kw + '」…');
  NM.providers.search([platform], kw, 1, 50).then(function (list) {
    if (token !== reqSeq) return;
    busy = false;
    var res = list && list[0];
    trackTitle = '搜索：' + kw;
    if (!res) {
      tracks = [];
      selected = -1;
      setStatus('搜索没有返回结果', true);
      return;
    }
    if (!res.ok) {
      tracks = [];
      selected = -1;
      setLastProblem('搜索「' + kw + '」失败（平台：' + platform + '）\n' + (res.error || '没有返回原因'));
      setStatus('搜索失败：' + String(res.error || '').slice(0, 40) + '（点状态栏看原因）', true);
      return;
    }
    tracks = res.tracks || [];
    trackScroll = 0;
    selected = tracks.length ? 0 : -1;
    if (!tracks.length) {
      setLastProblem('搜索「' + kw + '」没有结果（平台：' + platform + '）\n' +
        '平台接口返回空列表，通常是限流；换个关键词、换平台或稍后重试。');
      setStatus('「' + kw + '」 · 0 首（点状态栏看原因）', true);
      return;
    }
    setStatus('「' + kw + '」 · ' + tracks.length + ' 首');
  }, function (e) {
    if (token !== reqSeq) return;
    busy = false;
    tracks = [];
    selected = -1;
    setStatus('搜索失败：' + ((e && e.message) || e), true);
  });
}

/* 兼容旧调用点：都是「开始输入」，不再弹窗 */
function openSearch() {
  startEdit('search');
}

/* 中文关键词：面板本身接不了输入法，这里用系统输入框（唯一能打中文的通道） */
function promptKeyword(kind) {
  var owner = 0;
  try { owner = window.ID || 0; } catch (e) {}
  var def = kind === 'coll' ? collKeywordOf(browseKind()) : searchKeyword;
  var v = '';
  try {
    v = utils.InputBox(owner, '输入关键词（可以用输入法打中文）：', '搜索', def || '', false) || '';
  } catch (e) {
    v = '';
  }
  v = String(v).replace(/^\s+|\s+$/g, '');
  if (!v) { setStatus('已取消输入'); return; }
  if (kind === 'coll') {
    collKeyword = v;
    setCollKeywordOf(browseKind(), v);
    runBrowseSearch();
  } else {
    searchKeyword = v;
    runSearch(v);
  }
}

/* --------------------------------------------------------------------------
   歌单 / 播客 / 歌手
   数据全部来自 providers.js（各平台公开接口），不依赖音源脚本，
   音源脚本只负责把「曲目 → 直链」，所以这几个入口不会因为脚本失效而废掉。
   -------------------------------------------------------------------------- */
function browseKind() {
  return tab === 2 ? 'playlist' : (tab === 3 ? 'podcast' : 'artist');
}

function browseLabel() {
  return tab === 2 ? '歌单' : (tab === 3 ? '播客' : '歌手');
}

function browseHint() {
  return platformName() + ' · ' + collTopName() + '，点搜索框可输入' + browseLabel() + '关键词';
}

/* 推荐列表的标题：推荐歌单 / 推荐播客 / 推荐歌手 */
function collTopName(kind) {
  kind = kind || browseKind();
  return kind === 'playlist' ? '推荐歌单' : (kind === 'podcast' ? '推荐播客' : '推荐歌手');
}

function platformName(p) {
  var m = (NM.providers.meta || {})[p || platform];
  return (m && m.name) || (p || platform);
}

function collTopLoader(kind) {
  if (kind === 'playlist') return NM.providers.topPlaylists(platform, 30);
  if (kind === 'podcast') return NM.providers.topPodcasts(platform, 30);
  return NM.providers.topArtists(platform, 60);
}

function applyCollItems(items) {
  collItems = items || [];
  collIndex = collItems.length ? 0 : -1;
  collScroll = 0;
  setStatus(platformName() + collTopName() + ' · ' + collItems.length + ' 个');
  repaint();
  if (collIndex >= 0) loadCollTracks(collIndex);
}

/* 进入歌单 / 播客 / 歌手：不输关键词，直接显示平台推荐（10 分钟内复用内存缓存） */
function loadRecommend(force) {
  var kind = browseKind();
  var cacheKey = platform + ':' + kind;
  var cache = collTopCache[cacheKey];
  var fresh = cache && (Date.now() - cache.at) < COLL_TOP_TTL && (cache.items || []).length;

  collMode = 'top';
  collKeyword = '';
  viewMode = 'browse';

  if (fresh && !force) {
    tracks = [];
    trackTitle = '';
    selected = -1;
    trackScroll = 0;
    applyCollItems(cache.items);
    return;
  }

  var token = ++reqSeq;
  busy = true;
  collLoading = true;
  collItems = [];
  collIndex = -1;
  collScroll = 0;
  tracks = [];
  trackTitle = '';
  selected = -1;
  trackScroll = 0;
  setStatus('正在拉取' + platformName() + collTopName() + '…');
  repaint();

  Promise.resolve(collTopLoader(kind)).then(function (items) {
    if (token !== reqSeq) return;
    busy = false;
    collLoading = false;
    collTopCache[cacheKey] = { at: Date.now(), items: items || [] };
    applyCollItems(items);
  }, function (e) {
    if (token !== reqSeq) return;
    busy = false;
    collLoading = false;
    collItems = [];
    collIndex = -1;
    setStatus(((e && e.message) || (collTopName() + '加载失败')), true);
  });
}

function openBrowseSearch() {
  startEdit('coll');
}

function runBrowseSearch() {
  var kw = collKeyword;
  if (!kw) {
    setStatus(browseHint());
    return;
  }
  var kind = browseKind();
  var collPlats = NM.providers.collectionPlatforms || [];
  if (kind === 'playlist' && collPlats.indexOf(platform) < 0) {
    setStatus(platformName() + '暂不支持搜索歌单，切到 QQ / 网易云 试试', true);
    repaint();
    return;
  }
  if (kind !== 'playlist' && platform !== 'wy') {
    setStatus(platformName() + (kind === 'podcast' ? '没有播客' : '暂不支持搜索歌手') + '，切到网易云 试试', true);
    repaint();
    return;
  }

  var token = ++reqSeq;
  collMode = 'search';
  busy = true;
  collLoading = true;
  viewMode = 'browse';
  collItems = [];
  collIndex = -1;
  collScroll = 0;
  tracks = [];
  trackTitle = '';
  selected = -1;
  trackScroll = 0;
  setStatus('正在搜索' + browseLabel() + '「' + kw + '」…');
  repaint();

  var p;
  if (kind === 'playlist') {
    p = NM.providers.searchPlaylists(platform, kw, 1, 30).then(function (r) {
      if (!r || (!r.ok && !(r.items || []).length)) throw new Error((r && r.error) || '没有结果');
      return (r.items || []).map(function (it) { it.platform = it.platform || r.platform; return it; });
    });
  } else if (kind === 'podcast') {
    p = NM.providers.searchPodcasts(kw, 30);
  } else {
    p = NM.providers.searchArtists(kw, 30);
  }

  Promise.resolve(p).then(function (items) {
    if (token !== reqSeq) return;
    busy = false;
    collLoading = false;
    collItems = items || [];
    collIndex = collItems.length ? 0 : -1;
    collScroll = 0;
    setStatus(browseLabel() + '「' + kw + '」 · ' + collItems.length + ' 个');
    repaint();
    if (collIndex >= 0) loadCollTracks(collIndex);
  }, function (e) {
    if (token !== reqSeq) return;
    busy = false;
    collLoading = false;
    setStatus(browseLabel() + '搜索失败：' + ((e && e.message) || e), true);
  });
}

/* 能读到「歌单里面有哪些歌」的平台：QQ / 网易云 / 酷狗（酷我、咪咕没有公开接口） */
var PLAYLIST_DETAIL_PLATFORMS = ['tx', 'wy', 'kg'];

function loadCollTracks(i) {
  var item = collItems[i];
  if (!item) return;
  var kind = browseKind();

  if (kind === 'playlist' && PLAYLIST_DETAIL_PLATFORMS.indexOf(item.platform || platform) < 0) {
    tracks = [];
    trackTitle = item.name || '';
    selected = -1;
    setStatus(platformName(item.platform) + '没有公开的歌单内容接口，切到 QQ / 网易云 / 酷狗 可以打开', true);
    repaint();
    return;
  }

  var token = ++reqSeq;
  busy = true;
  setStatus('正在加载：' + (item.name || '') + ' …');

  var p;
  if (kind === 'playlist') p = NM.providers.playlistTracks(item);
  else if (kind === 'podcast') p = NM.providers.podcastEpisodes(item.id);
  else p = NM.providers.artistSongs(item);

  Promise.resolve(p).then(function (r) {
    if (token !== reqSeq) return;
    busy = false;
    tracks = (r && r.tracks) || [];
    trackTitle = (r && r.name) || item.name || '';
    trackScroll = 0;
    selected = tracks.length ? 0 : -1;
    setStatus(trackTitle + ' · ' + tracks.length + ' 首');
  }, function (e) {
    if (token !== reqSeq) return;
    busy = false;
    tracks = [];
    selected = -1;
    setStatus('加载失败：' + ((e && e.message) || e), true);
  });
}

function formatDuration(sec) {
  sec = Math.max(0, parseInt(sec, 10) || 0);
  var m = Math.floor(sec / 60);
  var s = sec % 60;
  return m + ':' + (s < 10 ? '0' : '') + s;
}

function subtitleOf(t) {
  var parts = [];
  if (t.artist) parts.push(t.artist);
  if (t.album) parts.push(t.album);
  if (t.duration) parts.push(formatDuration(t.duration));
  return parts.join(' · ');
}

/* LX 脚本需要的曲目字段（洛雪自定义源取链后回填的那一套） */
function buildMusicInfo(track) {
  if (!track) return null;
  var base = track.raw && typeof track.raw === 'object' ? track.raw : {};
  var info = {};

  Object.keys(base).forEach(function (k) {
    var v = base[k];
    if (v == null || typeof v === 'object') return;
    info[k] = v;
  });

  info.source = track.source;
  info.name = track.title;
  info.songName = track.title;
  info.title = track.title;
  info.singer = track.artist;
  info.singerName = track.artist;
  info.albumName = track.album;
  info.album = track.album;
  info.interval = String(track.duration || 0);
  info.duration = track.duration || 0;
  info.picUrl = track.pic || '';

  if (track.source === 'tx') {
    info.songmid = track.songmid;
    /* lx-music 的 songId 是数字 id（如 97773），songmid 才是那串字母；
       以前这里把 songId 也写成了 mid，用 songId 取链的脚本会直接拿不到东西 */
    info.songId = track.songId || track.songmid;
    info.mediaMid = track.mediaMid;
    info.strMediaMid = track.mediaMid;
    info.media_mid = track.mediaMid;
    info.albumId = track.albumId;
    info._types = track.types || {};
  } else if (track.source === 'wy') {
    info.id = track.id;
    info.songmid = track.id;
    info.songId = track.id;
    info.albumId = track.albumId;
    info._types = track.types || {};
  } else if (track.source === 'kg') {
    info.hash = track.hash;
    info.songmid = track.hash;
    info.albumId = track.albumId;
    info._types = track.types || { '128k': { hash: track.hash } };
  } else if (track.source === 'kw') {
    info.rid = track.rid;
    info.musicrid = 'MUSIC_' + track.rid;
    info.songmid = track.rid;
    info.albumId = track.albumId;
    info._types = track.types || {};
  } else if (track.source === 'mg') {
    info.songmid = track.songmid;
    info.id = track.id;
    info.copyrightId = track.songmid;
    info.albumId = track.albumId;
    info._types = track.types || {};
  }

  Object.keys(info).forEach(function (k) {
    if (info[k] === '' || info[k] == null) delete info[k];
  });

  return info;
}

function safeUrl(url) {
  var u = String(url || '');
  return /[^\x00-\x7F]/.test(u) ? encodeURI(u) : u;
}

/* --------------------------------------------------------------------------
   缓存：先下载到本地再播放
   直链会过期、部分 CDN 需要特定 Referer/UA，foobar2000 直接流播常常失败；
   先落盘再播放最稳，也避免每次重播都重新取链。

   目录结构（默认 = <profile>\Lxbox\cache，自定义 lx.cacheDir 时就是那个目录）：
     cache\<歌手 - 歌名>.<ext>             音频（全部平铺在一个目录里）
     cache\index.json                      曲目 → 文件 的索引
     cache\review|bio|artist|covers\       评论 / 艺人介绍 / 面板背景图
   封面直接嵌在音频文件里，目录里不再另存 cover.jpg（平铺目录会互相顶掉）；
   重名（同歌手同曲名的不同录音）自动加 (2)、(3)；换音质时扩展名不同，两条并存。
   -------------------------------------------------------------------------- */
var CACHE_ROOT = '';     /* <profile>\Lxbox，或 lx.cacheDir 指定的根 */
var CACHE_DIR = '';      /* 音频 + 索引 + 资料，全在这一个目录里 */
var CACHE_INDEX = null;

function downloadEnabled() {
  return String(window.GetProperty('lx.download', '1')) !== '0';
}

function cacheRoot() {
  if (CACHE_ROOT) return CACHE_ROOT;

  var custom = String(window.GetProperty('lx.cacheDir', '') || '').trim();
  if (custom) {
    CACHE_ROOT = custom.replace(/[\\\/]+$/, '');
  } else {
    var prof = '';
    try { prof = String(fb.ProfilePath || ''); } catch (e) { prof = ''; }
    /* 跟着安装目录走：profile\Lxbox，路径拼接不依赖结尾反斜杠 */
    CACHE_ROOT = prof ? joinPath(prof, 'Lxbox') : '';
  }
  return CACHE_ROOT;
}

/* 缓存目录：音频、索引、评论 / 艺人介绍 / 背景图全在这里。
   默认 <profile>\Lxbox\cache；设了 lx.cacheDir 就直接用那个目录本身。 */
function cacheDir() {
  if (CACHE_DIR) return CACHE_DIR;

  var custom = String(window.GetProperty('lx.cacheDir', '') || '').trim();
  if (custom) {
    CACHE_DIR = custom.replace(/[\\\/]+$/, '');
  } else {
    var root = cacheRoot();
    CACHE_DIR = root ? joinPath(root, 'cache') : '';
  }

  if (CACHE_DIR) {
    try { utils.CreateFolder(CACHE_DIR); } catch (e) {}
  }
  return CACHE_DIR;
}

/* cache\review、cache\bio、cache\artist —— 评论 / 艺人介绍缓存 */
function cacheSubDir(name) {
  var dir = cacheDir();
  if (!dir) return '';
  var p = dir + '\\' + name;
  try { utils.CreateFolder(p); } catch (e) {}
  return p;
}

/* Windows 文件名清洗：非法字符、结尾空格/点、保留名、长度 */
function cleanName(s, max) {
  var t = String(s == null ? '' : s)
    .replace(/[\\\/:*?"<>|]/g, ' ')
    .replace(/[\x00-\x1F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[. ]+$/, '');
  max = max || 60;
  if (t.length > max) t = t.slice(0, max).replace(/[. ]+$/, '');
  if (/^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i.test(t)) t = '_' + t;
  return t;
}

function artistText(track) {
  var a = String((track && track.artist) || '').trim();
  return a || '未知歌手';
}

/* 歌手 - 歌名（缓存文件名 / 评论与简介的缓存基名）
   多歌手的分隔符（/ 、& feat.）统一成「、」，避免被文件名清洗吃掉 */
function docBase(track) {
  var raw = artistText(track).replace(/\s*[\/]\s*/g, '、').replace(/\s*、\s*/g, '、');
  var a = cleanName(raw, 40) || '未知歌手';
  var t = cleanName((track && track.title) || '', 60) || '未知曲目';
  return a + ' - ' + t;
}

function baseName(p) {
  return String(p == null ? '' : p).replace(/^.*[\\\/]/, '');
}

function extFor(q, url) {
  var m = /\.(flac|mp3|m4a|aac|ogg|wav|ape)(?:$|[?#])/i.exec(String(url || ''));
  if (m) return '.' + m[1].toLowerCase();
  if (/^(flac|flac24bit|hires|master)$/i.test(q)) return '.flac';
  if (/^atmos/i.test(q)) return '.m4a';
  return '.mp3';
}

function cacheKeyOf(track, q) {
  var id = (track && (track.songmid || track.hash || track.rid || track.id)) || '';
  return String((track && track.source) || '') + '|' + id + '|' + (q || 'auto');
}

function cacheIndexFile() {
  var dir = cacheDir();
  return dir ? dir + '\\index.json' : '';
}

function cacheIndex() {
  if (CACHE_INDEX) return CACHE_INDEX;
  CACHE_INDEX = {};

  var f = cacheIndexFile();
  if (!f) return CACHE_INDEX;

  var txt = null;
  try { if (utils.FileExists(f)) txt = utils.ReadTextFile(f, 65001); } catch (e) { txt = null; }

  /* v1.9.5 及更早：设了 lx.cacheDir 的话，index.json 直接躺在那个目录里，
     当时那个目录就是缓存目录本身。这里顺手读一次，下次保存就落到新的 cache\ 下。 */
  if (txt == null) {
    var legacy = '';
    try {
      var root = cacheRoot();
      legacy = root ? root + '\\index.json' : '';
    } catch (e2) { legacy = ''; }
    if (legacy && legacy.toLowerCase() !== f.toLowerCase()) {
      try { if (utils.FileExists(legacy)) txt = utils.ReadTextFile(legacy, 65001); } catch (e3) { txt = null; }
    }
  }

  if (txt == null) return CACHE_INDEX;
  try {
    /* utils.WriteTextFile 写出去的文件带 UTF-8 BOM，ReadTextFile 又原样返回；
       不剥掉的话 JSON.parse 每次都失败，索引等于每次启动都被清空。 */
    var j = JSON.parse(String(txt).replace(/^\uFEFF/, '') || '{}');
    if (j && typeof j === 'object' && !(j instanceof Array)) CACHE_INDEX = j;
  } catch (e) {
    CACHE_INDEX = {};
  }
  return CACHE_INDEX;
}

function saveCacheIndex() {
  var f = cacheIndexFile();
  if (!f) return;
  try { utils.WriteTextFile(f, JSON.stringify(cacheIndex())); } catch (e) {}
}

/* 索引里指向已不存在文件的条目：留着只会让「本地有没有缓存」的判断多绕一圈，
   也会让同名的新歌被迫加 (2)、(3)。启动时清一次。 */
function pruneCacheIndex() {
  var dir = cacheDir();
  if (!dir) return;
  var idx = cacheIndex();
  var dirty = 0;
  Object.keys(idx).forEach(function (k) {
    var f = String((idx[k] && idx[k].f) || '');
    if (!f) { delete idx[k]; dirty++; return; }
    var p = /^[a-zA-Z]:[\\\/]/.test(f) ? f : dir + '\\' + f;
    var s = 0;
    try { s = utils.GetFileSize(p); } catch (e) { s = 0; }
    if (s <= 0) { delete idx[k]; dirty++; }
  });
  if (dirty) {
    saveCacheIndex();
    try { NM.lx.pushLog('info', '缓存索引清掉 ' + dirty + ' 条失效记录'); } catch (e2) {}
  }
}

function indexGet(key) {
  var it = cacheIndex()[key];
  return it && it.f ? it : null;
}

/* art：1 = 封面已经嵌进文件；0 = 没嵌（下次点播再补）；null/省略 = 不动原来的值 */
function indexPut(key, file, tagged, art) {
  var idx = cacheIndex();
  var it = idx[key] || {};
  it.f = file;
  it.tagged = tagged ? 1 : 0;
  it.v = TAG_VERSION;
  it.at = Date.now();
  if (art != null) it.art = art ? 1 : 0;
  idx[key] = it;
  saveCacheIndex();
}

/* 这个相对路径已经被哪首曲目占着。
   索引里指向已经不存在的文件的死条目会顺手清掉，否则被删掉的歌会一直
   占着名字，逼着同名的新歌不断加 (2)、(3)。 */
function indexOwnerOf(name) {
  var idx = cacheIndex();
  var low = String(name || '').toLowerCase();
  var dir = '';
  try { dir = String(cacheDir() || ''); } catch (e) { dir = ''; }
  var keys = Object.keys(idx);
  var dirty = false;
  for (var i = 0; i < keys.length; i++) {
    if (String(idx[keys[i]].f || '').toLowerCase() !== low) continue;
    if (dir && !fileReady(dir + '\\' + idx[keys[i]].f)) { delete idx[keys[i]]; dirty = true; continue; }
    if (dirty) saveCacheIndex();
    return keys[i];
  }
  if (dirty) saveCacheIndex();
  return '';
}

/* 缓存落点：cache\<歌手 - 歌名>.<ext>（全部平铺，一首歌一个文件）
   封面嵌在文件里，不需要为每首歌/每张专辑单独建目录；重名时加 (2)、(3)。
   索引里存的是相对 cacheDir 的路径。 */
function cachePathFor(track, q, url) {
  var dir = cacheDir();
  if (!dir) return '';
  var key = cacheKeyOf(track, q);
  var ext = extFor(q, url);

  /* 索引命中且文件还在：直接用（老结构的会顺手搬到 cache 根下） */
  var hit = indexGet(key);
  if (hit && hit.f) {
    var f = String(hit.f);
    /* 搬家失败时索引里可能留下一条绝对路径，仍然是可用的 */
    if (/^[a-zA-Z]:[\\\/]/.test(f) && fileReady(f)) return f;

    var cur = dir + '\\' + f;
    if (fileReady(cur)) {
      /* 直接躺在 cache 根下（索引里就一个文件名）：目标结构，不用动 */
      if (f.indexOf('\\') < 0) return cur;
      /* 还在子目录里（v1.9.5 的 一首歌一个文件夹）：搬到根下，搬不动就原地用 */
      var moved0 = adoptOldCache(track, hit, key);
      return moved0 || cur;
    }

    var moved = adoptOldCache(track, hit, key);
    if (moved) return moved;
  }

  return dir + '\\' + targetName(track, ext, key);
}

/* 这首歌在 cache 根下的文件名，避开已被别的曲目占用的名字 */
function targetName(track, ext, key) {
  var base = docBase(track);
  var name = base + ext;
  var n = 1;
  while (n < 50) {
    var owner = indexOwnerOf(name);
    if (!owner || owner === key) return name;
    n++;
    name = base + ' (' + n + ')' + ext;
  }
  return base + ext;
}

/* 索引里存的是「相对 cacheDir 的路径」，正常情况就是一个文件名 */
function relCachePath(p) {
  var dir = '';
  try { dir = String(cacheDir() || ''); } catch (e) { dir = ''; }
  var s = String(p || '');
  if (dir && s.toLowerCase().indexOf(dir.toLowerCase()) === 0) s = s.slice(dir.length);
  return s.replace(/^[\\\/]+/, '');
}

/* 老版本缓存搬家（不用重下，找到就挪到 cache 根下平铺）：
     v1.9.6 / 1.9.7 → music\<专辑>\<歌手 - 歌名>.mp3
     v1.9.5         → cache\<歌手 - 歌名>\<歌手 - 歌名>.mp3
     v1.9.4 及更早  → cache\<歌手 - 歌名>.mp3（本来就在目标位置）
   搬不动（文件被占用 / 跨盘 / 没权限）就原地播放，不影响听歌。 */
function adoptOldCache(track, hit, key) {
  var file = String((hit && hit.f) || '');
  if (!file) return '';

  var cdir = cacheDir();
  if (!cdir) return '';
  var root = cacheRoot();
  var leaf = baseName(file);

  var cands = [cdir + '\\' + file];
  if (leaf !== file) cands.push(cdir + '\\' + leaf);     /* 索引里带子目录、文件其实平铺 */
  if (root) {
    cands.push(root + '\\' + file);
    cands.push(root + '\\music\\' + file);
    if (leaf !== file) cands.push(root + '\\music\\' + leaf);
  }

  var src = '';
  for (var i = 0; i < cands.length; i++) {
    if (fileReady(cands[i])) { src = cands[i]; break; }
  }
  if (!src) return '';

  /* 本来就在 cache 根下（v1.9.4 的平铺缓存）：不用搬 */
  var srcDir = dirOfFile(src);
  if (srcDir.toLowerCase() === cdir.toLowerCase()) return src;

  var m = /\.[^.\\\/]+$/.exec(leaf);
  var ext = m ? m[0].toLowerCase() : '.mp3';
  var name = targetName(track, ext, key);
  var dst = cdir + '\\' + name;
  if (!ensureFolder(cdir)) return src;

  if (!fileReady(dst)) {
    var ok = false;
    try { ok = utils.RenamePath(src, dst); } catch (e) { ok = false; }
    /* 跨盘 / 被占用：退一步复制一份，原文件留着下次再清 */
    if (!ok || !fileReady(dst)) {
      if (!copyBytesFile(src, dst) || !fileReady(dst)) return src;
    }
  }

  cleanupOldDir(srcDir);
  try { indexPut(key, name, Number(hit.tagged || 0) === 1, hit.art); } catch (e2) {}
  return dst;
}

/* 老目录搬完就清掉：里面的 jpg 是当初给 foobar2000 准备的封面副本，
   现在封面已经嵌进文件了，留着只会在平铺目录里互相顶掉，直接删；
   没有音频残留就把空目录也删掉。cache 根 / 自定义根 / music 根本身不碰。 */
function cleanupOldDir(dir) {
  if (!dir) return;

  var low = dir.toLowerCase();
  var cdir = String(cacheDir() || '').toLowerCase();
  var root = String(cacheRoot() || '').toLowerCase();
  if (!cdir || !root) return;
  if (low === cdir || low === root || low === root + '\\music') return;
  if (low.indexOf(cdir + '\\') !== 0 && low.indexOf(root + '\\') !== 0) return;

  /* 目录里还有别的歌：图留给它们用（它们还没搬走，可能就靠这张图） */
  if (dirAudioCount(dir) > 0) return;

  var exts = ['jpg', 'jpeg', 'png'];
  for (var i = 0; i < exts.length; i++) {
    var list = [];
    try { list = utils.Glob(dir + '\\*.' + exts[i]) || []; } catch (e) { list = []; }
    for (var k = 0; k < list.length; k++) {
      try { utils.RemovePath(list[k]); } catch (e2) {}
    }
  }

  removeTree(dir);
}

function fileReady(p) {
  var size = 0;
  try { size = utils.GetFileSize(p); } catch (e) { size = 0; }
  return size > 1024;
}

/* --------------------------------------------------------------------------
   音频文件校验：别把「错误页」当成一首歌
   直链过期 / 平台要登录 / vkey 为空时，CDN 回的是 403，可宿主照样可能
   回调「下载成功」，落下一个 0 字节或几百字节的 HTML、JSON。这份东西一进
   索引，之后每次点播都直接播它，foobar2000 只能说「不支持的格式或文件损坏」
   —— 而这首歌就永久坏在缓存里，重试多少次都没用。

   这里读文件头认容器，认不出来就删掉重下：
     - 小于 4 KB 的一律当坏文件（没有一首歌这么小）
     - 超过 96 MB 的不整份读，按扩展名放行（内存顶不住，正常歌曲也没这么大）
   读盘用的 utils.ReadBinaryFile 在不同 JSplitter 版本里返回过
   Uint8Array / ArrayBuffer / 每字符一字节的字符串，这里只按下标取值，
   三种都能用。
   -------------------------------------------------------------------------- */
var AUDIO_MIN_BYTES = 4096;
var AUDIO_READ_MAX = 96 * 1024 * 1024;   /* 再大就不整份读，按扩展名放行 */

/* 扩展名 ↔ 容器：两边对不上时 foobar2000 会报「不支持的格式或文件损坏」 */
var AUDIO_EXT_KIND = {
  '.mp3': 'mp3', '.flac': 'flac', '.m4a': 'm4a', '.mp4': 'm4a',
  '.aac': 'aac', '.ogg': 'ogg', '.oga': 'ogg', '.opus': 'ogg',
  '.wav': 'wav', '.ape': 'ape', '.wv': 'wv', '.aiff': 'aiff', '.aif': 'aiff',
  '.wma': 'wma'
};
var AUDIO_KIND_EXT = {
  mp3: '.mp3', flac: '.flac', m4a: '.m4a', aac: '.aac',
  ogg: '.ogg', wav: '.wav', ape: '.ape', wv: '.wv', aiff: '.aiff', wma: '.wma'
};

function extOfPath(p) {
  var m = /\.([a-z0-9]+)$/i.exec(String(p || ''));
  return m ? '.' + m[1].toLowerCase() : '';
}

/* 认容器：只认真正能交给解码器的几种 */
function audioKindOf(b) {
  if (!b || b.length < 4) return '';
  var b0 = b[0] & 0xFF, b1 = b[1] & 0xFF, b2 = b[2] & 0xFF, b3 = b[3] & 0xFF;
  if (b0 === 0x49 && b1 === 0x44 && b2 === 0x33) return 'mp3';        /* ID3 */
  if (b0 === 0x66 && b1 === 0x4C && b2 === 0x61 && b3 === 0x43) return 'flac';  /* fLaC */
  if (b0 === 0x4F && b1 === 0x67 && b2 === 0x67 && b3 === 0x53) return 'ogg';   /* OggS */
  if (b0 === 0x52 && b1 === 0x49 && b2 === 0x46 && b3 === 0x46) return 'wav';   /* RIFF */
  if (b0 === 0x4D && b1 === 0x41 && b2 === 0x43 && b3 === 0x20) return 'ape';   /* MAC  */
  if (b0 === 0x77 && b1 === 0x76 && b2 === 0x70 && b3 === 0x6B) return 'wv';    /* wvpk */
  if (b0 === 0x46 && b1 === 0x4F && b2 === 0x52 && b3 === 0x4D) return 'aiff';  /* FORM */
  if (b0 === 0x30 && b1 === 0x26 && b2 === 0xB2 && b3 === 0x75) return 'wma';   /* ASF  */
  if (b0 === 0xFF && (b1 & 0xE0) === 0xE0) return 'mp3';              /* MPEG 帧同步 */
  /* ftyp 在第 5 字节：m4a / mp4（QQ 的 C400、网易云的 m4a 都走这里） */
  if (b.length >= 12 && b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70) return 'm4a';
  return '';
}

/* 认不出来时给一句"那它到底像什么"，方便用户 / 日志直接看懂 */
function sniffHint(b) {
  var s = '';
  for (var i = 0; i < Math.min(16, b.length); i++) {
    var c = b[i] & 0xFF;
    s += (c >= 0x20 && c < 0x7F) ? String.fromCharCode(c) : '.';
  }
  var low = s.toLowerCase().replace(/^[.\s]+/, '');
  if (low.indexOf('<!do') === 0 || low.indexOf('<htm') === 0 || low.indexOf('<?xm') === 0) return '网页';
  if (low.charAt(0) === '{' || low.charAt(0) === '[') return 'JSON';
  if (/[a-z]/i.test(s)) return '文本「' + s.trim() + '」';
  return '未知数据 ' + s;
}

/* 只读文件开头 n 字节。缓存里动辄几十 MB 的无损，每次点播都整份读进内存
   太浪费；新版 JSplitter 的 utils.OpenBinaryReader 可以只读开头。
   老版本没有这个 API，返回 null，调用方再退回整份读。 */
function readHead(p, n) {
  n = n || 64;
  try {
    if (typeof utils.OpenBinaryReader !== 'function') return null;
    var rd = utils.OpenBinaryReader(p);
    if (!rd) return null;
    var buf = new Uint8Array(n);
    var got = 0;
    try { got = Number(rd.Read(buf, 0, n)) || 0; } catch (e0) { got = 0; }
    try { rd.Close(); } catch (e1) {}
    if (got <= 0) return null;
    return got >= n ? buf : buf.subarray(0, got);
  } catch (e) { return null; }
}

/* 返回 { ok, size, kind, why } —— why 只在 ok=false 时有意义。
   现在连大文件也读开头：以前「大于 512 KB 直接放行」会漏掉两种情况——
   一是 CDN 返回了很大的错误页，二是扩展名和真实容器对不上（.flac 里装 MP3），
   后者进 foobar2000 就是「不支持的格式或文件损坏」。 */
function sniffAudio(p) {
  var size = 0;
  try { size = utils.GetFileSize(p); } catch (e) { size = 0; }
  if (!size) return { ok: false, size: 0, why: '文件是 0 字节' };
  if (size < AUDIO_MIN_BYTES) return { ok: false, size: size, why: '文件只有 ' + size + ' 字节' };

  var ext = extOfPath(p);
  var extKind = AUDIO_EXT_KIND[ext] || '';

  var b = readHead(p, 64);
  if (!b) {
    /* 老版本 JSplitter：没有增量读取，超大文件不整份读，只按扩展名放行 */
    if (size > AUDIO_READ_MAX) {
      if (extKind) return { ok: true, size: size, kind: extKind };
      return { ok: false, size: size, why: '文件很大但扩展名不是音频（' + (ext || '无') + '）' };
    }
    try { b = utils.ReadBinaryFile(p); } catch (e) { b = null; }
  }
  if (!b || !b.length) {
    /* 读不了就不拦，但扩展名得像个音频 */
    if (extKind) return { ok: true, size: size, kind: extKind };
    return { ok: false, size: size, why: '读不了文件内容，扩展名也不是音频' };
  }

  var kind = audioKindOf(b);
  if (kind) return { ok: true, size: size, kind: kind };
  return { ok: false, size: size, why: '内容不是音频（开头是' + sniffHint(b) + '）' };
}

/* 扩展名和真实容器不一致时改名。比删掉重下便宜，也不会让已经进播放列表的
   同名文件突然变成 0 字节。改名后同步更新索引里的相对路径。 */
function ensureAudioExt(track, path, kind, q) {
  var want = AUDIO_KIND_EXT[kind] || '';
  if (!want) return path;
  var cur = extOfPath(path);
  if (cur === want) return path;

  var src = String(path);
  var stem = cur ? src.slice(0, src.length - cur.length) : src;
  var next = stem + want;
  var n = 1;
  while (n < 20) {
    var exists = false;
    try { exists = utils.FileExists(next); } catch (e) { exists = false; }
    if (!exists || next.toLowerCase() === src.toLowerCase()) break;
    n++;
    next = stem + ' (' + n + ')' + want;
  }

  var ok = false;
  try { ok = utils.RenamePath(src, next); } catch (e) { ok = false; }
  if (!ok) return path;

  var key = cacheKeyOf(track, q);
  var idx = cacheIndex();
  if (idx[key]) { idx[key].f = relCachePath(next); saveCacheIndex(); }
  try {
    NM.lx.pushLog('info', '扩展名与内容不符，已改名：' + baseName(src) + ' → ' + baseName(next));
  } catch (e2) {}
  return next;
}

/* 删掉坏缓存 + 把索引里指向它的条目一起摘掉，否则下次还会命中 */
function dropCacheFile(path, key) {
  var rel = relCachePath(path).toLowerCase();
  try { utils.RemovePath(path); } catch (e) {}
  var idx = cacheIndex();
  var dirty = false;
  Object.keys(idx).forEach(function (k) {
    var f = String((idx[k] && idx[k].f) || '').toLowerCase();
    if ((key && k === key) || (rel && f === rel)) { delete idx[k]; dirty = true; }
  });
  if (dirty) saveCacheIndex();
}

/* --------------------------------------------------------------------------
   「洛雪音源」播放列表里指向缓存目录的死条目
   --------------------------------------------------------------------------
   面板每播一首就把缓存文件的绝对路径加进这个播放列表。缓存文件一旦被删
   （换音质、校验失败、手动清理），列表里那条就指向一个不存在的文件，点它
   foobar2000 只会弹「无法打开用于播放的项目(不支持的格式或文件损坏)」。
   这类条目全是面板自己加的，启动时扫一遍清掉；同名的其它音质（比如 .mp3）
   如果是好的，会原样留在列表里，不影响继续播。
   只在启动时做：播放流程里改播放列表会让「加入后等待条数 +1」的轮询算错。
   -------------------------------------------------------------------------- */
function cachePlaylistIndex() {
  try {
    if (!plman || typeof plman.FindPlaylist !== 'function') return -1;
    return plman.FindPlaylist(PLAYLIST_NAME);
  } catch (e) { return -1; }
}

function cleanPlaylistDeadCache() {
  var dir = cacheDir();
  var idx = cachePlaylistIndex();
  if (!dir || idx < 0) return;

  var prefix = (dir.replace(/[\\\/]+$/, '') + '\\').toLowerCase();
  var total = 0;
  try { total = plman.PlaylistItemCount(idx); } catch (e) { return; }
  if (!total) return;

  var dead = [];
  for (var i = 0; i < total; i++) {
    var p = '';
    try {
      var h = plman.GetPlaylistItemHandle(idx, i);
      p = h ? String(h.Path || '') : '';
    } catch (e) { p = ''; }
    if (!p) continue;
    if (p.toLowerCase().indexOf(prefix) !== 0) continue;   /* 不是缓存文件，别碰 */
    if (fileReady(p)) continue;
    dead.push(i);
  }
  if (!dead.length) return;

  /* 先留一个撤销点：万一用户想找回来，Ctrl+Z 就行 */
  try { if (plman.UndoBackup) plman.UndoBackup(idx); } catch (e) {}

  try {
    plman.ClearPlaylistSelection(idx);
    dead.forEach(function (n) { plman.SetPlaylistSelectionSingle(idx, n, true); });
    plman.RemovePlaylistSelection(idx);
    NM.lx.pushLog('info', '已从「' + PLAYLIST_NAME + '」清掉 ' + dead.length + ' 条失效缓存条目');
  } catch (e) {
    NM.lx.pushLog('warn', '清理失效播放列表条目失败：' + ((e && e.message) || e));
  }
}

/* 本地已经有一份能播的缓存吗？取链失败时的兜底：
   key 是「source|id|quality」，换过音质就会有多个键，这里按前缀扫一遍，
   优先当前音质、其次任意音质，只认文件还在、且内容像音频的。 */
function cachedFileFor(track, q) {
  var dir = cacheDir();
  if (!dir) return null;
  var id = String((track && (track.songmid || track.hash || track.rid || track.id)) || '');
  if (!id) return null;
  var head = String((track && track.source) || '') + '|' + id + '|';
  var idx = cacheIndex();
  var keys = Object.keys(idx);
  var exact = [], other = [];
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i];
    if (k.indexOf(head) !== 0) continue;
    if (k === head + (q || 'auto')) exact.push(k); else other.push(k);
  }
  var all = exact.concat(other);
  for (var j = 0; j < all.length; j++) {
    var f = String((idx[all[j]] && idx[all[j]].f) || '');
    if (!f) continue;
    var p = /^[a-zA-Z]:[\\\/]/.test(f) ? f : dir + '\\' + f;
    if (!fileReady(p)) continue;
    if (!sniffAudio(p).ok) { dropCacheFile(p, all[j]); continue; }
    return { path: p, quality: String(all[j]).slice(head.length) || q };
  }
  return null;
}

/* URL 查询参数：没有这个参数返回 null，有但为空返回 '' */
function queryValue(url, name) {
  var m = new RegExp('[?&]' + name + '=([^&#]*)', 'i').exec(String(url || ''));
  return m ? m[1] : null;
}

/* 腾讯的直链靠 vkey 授权。脚本没取到 vkey 时照样会拼出一条
   …&vkey=&uin=&fromtag=30 的链接 —— CDN 对它一律 403，
   交给 foobar2000 就是「不支持的格式或文件损坏」。这种链接不用试。 */
function urlLacksTicket(url) {
  var vk = queryValue(url, 'vkey');
  return vk !== null && !vk;      /* 没这个参数 = 别的平台，不猜 */
}

/* 腾讯试听文件名固定 RS01/RS02 + songmid：有些音源脚本不标 trial，
   结果 30 秒片段被当完整歌缓存下来，下次点播永远只有 30 秒。 */
function looksTrialUrl(url) {
  return /RS0[12][0-9A-Za-z]{5,}/i.test(String(url || ''));
}

/* 日志/状态栏里显示用：去掉又长又没用的签名参数 */
function shortUrl(url) {
  var u = String(url || '');
  var q = u.indexOf('?');
  if (q < 0) return u.length > 100 ? u.slice(0, 100) + '…' : u;
  return u.slice(0, Math.min(q, 96)) + '?…（' + (u.length - q - 1) + ' 字节参数）';
}

/* 「链接拿不到 / 拿回来不是音频」的统一解释，给底栏「点此看原因」用 */
function badMediaHint(track, url) {
  var src = platformName(track && track.source);
  var out = [];
  out.push('这条直链拿回来的不是能播的音频，' + src + ' 那边多半已经拒绝（HTTP 403 / 需要登录 / 会员专享 / 链接过期）。');
  if (urlLacksTicket(url)) {
    out.push('直链里的 vkey 是空的 —— 平台根本没下发播放凭据，这种链接在 CDN 上必然 403。');
  }
  var enc = (NM.lx && typeof NM.lx.encryptedExt === 'function')
    ? NM.lx.encryptedExt(url) : '';
  if (enc) {
    out.push('这条链接是 QQ 音乐加密格式（' + enc + '），只有 QQ 音乐客户端能解，foobar2000 播不了。');
    out.push('换一个音源脚本，或右键「换源」到别的平台。');
  }
  out.push('坏缓存已经删掉，下次点播会重新下载，不会一直卡在这份坏文件上。');
  out.push('链接：' + shortUrl(url));
  return out.join('\n');
}

/* 彻底删掉一个目录（先递归里面的东西，再删空壳） */
function removeTree(p) {
  if (!p) return false;
  var isDir = false;
  try { isDir = !!utils.IsDirectory(p); } catch (e) { isDir = false; }
  if (isDir) {
    var kids = [];
    try { kids = utils.Glob(p + '\\*') || []; } catch (e) { kids = []; }
    for (var i = 0; i < kids.length; i++) removeTree(kids[i]);
  }
  try { return !!utils.RemovePath(p); } catch (e) { return false; }
}

function clearCache() {
  var dir = cacheDir();
  if (!dir) {
    setStatus('缓存目录不可用', true);
    return;
  }

  var items = [];
  try { items = utils.Glob(dir + '\\*') || []; } catch (e) { items = []; }

  var n = 0;
  items.forEach(function (p) {
    var low = String(p).toLowerCase();
    /* review / bio / artist / covers 是资料缓存，保留；只清音频与临时文件。
       注意 .tag 是临时目录（job.json / lyric.txt），属于该清的（v1.9.18） */
    if (/[\\\/](review|bio|artist|covers)([\\\/]|$)/.test(low)) return;
    if (/[\\\/]index\.json$/.test(low)) return;
    if (removeTree(p)) n++;
  });

  var idx = cacheIndexFile();
  if (idx) { try { utils.RemovePath(idx); } catch (e) {} }
  CACHE_INDEX = null;
  setStatus('已清空播放缓存：' + n + ' 项');
}

/* --------------------------------------------------------------------------
   标签写入（tools\lx_tag.ps1）—— 备用写入器
   主写入器是 tagwriter.js（NM.tag，纯 JS 直接改字节，同步完成）；
   这里的 PowerShell 脚本只在「格式不支持 / 内置写入器写不进去」时用。
   -------------------------------------------------------------------------- */

/* 超时包装：实现只有一份，在 lx.js 里（NM.lx.withTimeout），这里转调。
   v1.9.18 之前 main.js 和 lx.js 各写了一遍，行为还不完全一样。 */
var withTimeout = NM.lx.withTimeout;

var TAG_TOOL = null;   /* null = 未探测；'' = 不可用 */

function tagScriptPath() {
  if (TAG_TOOL !== null) return TAG_TOOL;
  var dirs = [];
  if (moduleDir) dirs.push(moduleDir);
  var md = String(window.GetProperty('lx.moduleDir', '') || '').replace(/[\\\/]+$/, '');
  if (md && dirs.indexOf(md) < 0) dirs.push(md);
  for (var i = 0; i < dirs.length; i++) {
    var cands = [dirs[i] + '\\tools\\lx_tag.ps1', dirs[i] + '\\lx_tag.ps1'];
    for (var j = 0; j < cands.length; j++) {
      var exists = false;
      try { exists = utils.FileExists(cands[j]); } catch (e) {}
      if (exists) { TAG_TOOL = cands[j]; return TAG_TOOL; }
    }
  }
  TAG_TOOL = '';
  return '';
}

function powershellExe() {
  var p = 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe';
  try { if (utils.FileExists(p)) return p; } catch (e) {}
  return 'powershell.exe';
}

function dateOf(track) {
  var raw = (track && track.raw) || {};
  var album = raw.album || {};
  var list = [raw.time_public, raw.publishTime, raw.publish_time, raw.releaseDate, raw.publish_date,
              album.time_public, album.publishTime, album.publish_time, album.releaseDate];
  for (var i = 0; i < list.length; i++) {
    var v = String(list[i] == null ? '' : list[i]).trim();
    if (!v) continue;
    var m = /^(\d{4})[-.\/]?(\d{2})?[-.\/]?(\d{2})?/.exec(v);
    if (m) return m[2] ? (m[1] + '-' + m[2] + (m[3] ? '-' + m[3] : '')) : m[1];
  }
  return '';
}

function genreOf(track) {
  var raw = (track && track.raw) || {};
  var album = raw.album || {};
  var list = [raw.genre, raw.genreName, album.genre, (track && track.genre)];
  for (var i = 0; i < list.length; i++) {
    var v = String(list[i] == null ? '' : list[i]).trim();
    if (v) return v;
  }
  return '';
}

function fetchLyricText(track) {
  if (!track || !track.source) return Promise.resolve('');
  var p;
  try { p = NM.providers.lyric(track); } catch (e) { return Promise.resolve(''); }
  return withTimeout(p, 9000, '取歌词').then(function (r) {
    var lrc = String((r && r.lyric) || '');
    var tr = String((r && r.translation) || '');
    var out = lrc;
    if (tr) out += (out ? '\n\n' : '') + tr;
    return out.trim();
  }, function () { return ''; });
}

/* 标签用的封面：统一走网易云 600 宽那份 */
function ensureCoverFile(track) {
  return trackCoverUrl(track).then(function (url) {
    if (!url) return '';
    return coverDownload(url);
  });
}

/* 歌词 + 封面一起准备好（并行，减少等待）。
   PUSH_COVER 时也要取封面：写标签用不上，但要把图放到音频旁边给 fb2k 显示 */
function prepareTagData(track) {
  var lyr = Promise.resolve('');
  var cov = Promise.resolve('');
  try { lyr = fetchLyricText(track); } catch (e) { lyr = Promise.resolve(''); }
  try { cov = (EMBED_COVER || PUSH_COVER) ? ensureCoverFile(track) : Promise.resolve(''); } catch (e) { cov = Promise.resolve(''); }
  return Promise.all([lyr, cov]).then(function (a) {
    return { lyric: String(a[0] || ''), cover: String(a[1] || '') };
  }, function () {
    return { lyric: '', cover: '' };
  });
}

/* preset 可以带已经取好的 { lyric, cover }，避免重复请求网络 */
function writeTags(track, dest, preset) {
  var tool = tagScriptPath();
  /* missing = 这台机器上没有 ps1 脚本，和「该格式不支持写标签」是两件事。
     以前两种情况都返回 skip:true，调用方据此把索引记成「标签已写」——
     结果 lx.embedCover=0 的安装里，ready 判定成立，歌直接播、标签永远是空的。 */
  if (!tool) return Promise.resolve({ ok: false, missing: true, reason: '未找到 tools\\lx_tag.ps1' });
  var dir = cacheDir();
  if (!dir) return Promise.resolve({ ok: false, reason: '缓存目录不可用' });

  var work = dir + '\\.tag';
  try { utils.CreateFolder(work); } catch (e) {}
  var jobFile = work + '\\job.json';
  var lyricFile = work + '\\lyric.txt';

  preset = preset || {};
  var lyrP = (typeof preset.lyric === 'string')
    ? Promise.resolve(preset.lyric)
    : fetchLyricText(track);
  var covP = (typeof preset.cover === 'string')
    ? Promise.resolve(preset.cover)
    : (EMBED_COVER ? ensureCoverFile(track) : Promise.resolve(''));

  return lyrP.then(function (lrc) {
    var lf = '';
    if (lrc) {
      try { if (utils.WriteTextFile(lyricFile, lrc) !== false) lf = lyricFile; } catch (e) { lf = ''; }
    }
    return covP.then(function (c) {
      return { lf: lf, cover: c || '' };
    });
  }).then(function (f) {
    var job = {
      file: dest,
      title: String(track.title || ''),
      artist: artistText(track),
      album: String(track.album || ''),
      date: dateOf(track),
      genre: genreOf(track),
      lyricFile: f.lf,
      coverFile: f.cover
    };
    try {
      if (utils.WriteTextFile(jobFile, JSON.stringify(job)) === false) throw new Error('写入失败');
    } catch (e) {
      return { ok: false, reason: '写 job.json 失败' };
    }

    return NM.sys.run(powershellExe(),
      ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', tool, '-job', jobFile],
      45000).then(function (r) {
      var out = String((r && r.stdout) || '');
      var errText = String((r && r.stderr) || '');
      if (/^OK/m.test(out)) {
        var mc = /cover=(\d+)/.exec(out);
        return { ok: true, cover: !!(mc && Number(mc[1]) > 0) };
      }
      if (/^SKIP/m.test(out)) {
        var m2 = /^SKIP:?\s*(.*)$/m.exec(out);
        return { ok: false, skip: true, reason: (m2 && m2[1]) || '该格式暂不支持写标签' };
      }
      return {
        ok: false,
        reason: (out || errText || ('powershell exit ' + (r && r.exitCode))).replace(/\s+/g, ' ').slice(0, 160)
      };
    }, function (e) {
      return { ok: false, reason: (e && e.message) || String(e) };
    });
  });
}

/* --------------------------------------------------------------------------
   写标签：文本 + 封面分两条路，各用最可靠的办法
     文本 → FbMetadbHandleList.UpdateFileInfoFromJSON（fb2k 自己的 tagger，各格式通吃）
     封面 → ① 内置 JS 写入器（utils.ReadBinaryFile/WriteBinaryFile，见上面那段）
            ② tools\lx_tag.ps1（PowerShell，格式/接口不支持时的备份）
            ③ FbMetadbHandleList.AttachImage（最后兜底，异步）

   顺序很重要：先让 foobar2000 把文本标签写完（它会重写整个 tag 块），
   再往里塞 APIC / PICTURE —— 反过来做的话，fb2k 重写标签时可能把刚放进去的
   封面顶掉，这正是以前「标签写进去了、封面却一直是空的」的原因之一。

   为什么不能只靠 AttachImage：
     JSplitter 文档写明「Embedding covers is an asynchronous operation」——
     它只是把任务丢给后台，返回 true 只代表读图成功。旧代码调用后立刻
     RefreshStats() 接着播放，foobar2000 抢先打开文件，后台嵌图就失败了。
   -------------------------------------------------------------------------- */
/* 封面嵌入开关：lx.embedCover（默认 1）。关掉就只写文本标签。
   TAG_VERSION 4：v1.9.6 及更早的缓存标的是 3，升级后第一次播放会补写标签
   并把封面嵌进去（一首一次，播到哪首补哪首）。 */
function embedCoverEnabled() {
  try { return Number(window.GetProperty('lx.embedCover', 1)) !== 0; } catch (e) { return true; }
}
var EMBED_COVER = embedCoverEnabled();

/* 封面副本：除了嵌在文件里，要不要再往旁边放一张同名 jpg 兜底。
   默认关 —— 封面已经在文件里了，平铺目录里再堆一堆 jpg 只会乱；
   有老组件只认「旁边的图」时才需要打开（lx.pushCover=1）。
   注意：平铺目录里永远不写 cover.jpg，只写 <歌手 - 歌名>.jpg。 */
function pushCoverEnabled() {
  try { return Number(window.GetProperty('lx.pushCover', 0)) !== 0; } catch (e) { return false; }
}
var PUSH_COVER = pushCoverEnabled();

var TAG_VERSION = 4;

function fbHandleListOf(handle) {
  var hl = null;
  try { hl = new FbMetadbHandleList(handle); } catch (e) { hl = null; }
  if (!hl) {
    try { hl = fb.CreateHandleList(); hl.Add(handle); } catch (e2) { hl = null; }
  }
  return hl;
}

/* 只写文本字段（封面另走 embedCover） */
function writeTagsByFoobar(handle, track, data) {
  if (!handle) return { ok: false, reason: '还没进播放列表' };
  if (typeof FbMetadbHandleList === 'undefined') {
    return { ok: false, reason: '当前 JSplitter 没有 FbMetadbHandleList' };
  }

  var fields = {};
  var title = String((track && track.title) || '').trim();
  var artist = artistText(track).trim();
  var album = String((track && track.album) || '').trim();
  var date = dateOf(track);
  var genre = genreOf(track);
  var lyric = String((data && data.lyric) || '').trim();
  if (title) fields.TITLE = title;
  if (artist) fields.ARTIST = artist;
  if (album) fields.ALBUM = album;
  if (date) fields.DATE = date;
  if (genre) fields.GENRE = genre;
  if (lyric) fields.LYRICS = lyric;

  var keys = Object.keys(fields);
  if (!keys.length) return { ok: false, reason: '没有可写的字段' };

  var hl = fbHandleListOf(handle);
  if (!hl) return { ok: false, reason: '拿不到 FbMetadbHandleList' };

  try {
    hl.UpdateFileInfoFromJSON(JSON.stringify(fields));
  } catch (e) {
    return { ok: false, reason: 'UpdateFileInfoFromJSON：' + ((e && e.message) || e) };
  }

  return { ok: true, fields: keys.length };
}

/* 封面写进文件：返回 { ok, how, reason }。三条路依次尝试，成功就停。 */
function embedCover(handle, track, dest, data) {
  if (!EMBED_COVER) return Promise.resolve({ ok: false, skipped: true, reason: '没开启封面嵌入（lx.embedCover=0）' });
  var cf = String((data && data.cover) || '');
  if (!cf || !fileReady(cf)) return Promise.resolve({ ok: false, reason: '没取到封面（网络没拿到图）' });

  var path = String(dest || '');
  if (!path) {
    try { path = String(handle && handle.Path || ''); } catch (e) { path = ''; }
  }
  if (!path) return attachImageAsync(handle, cf, '没有缓存文件路径');

  /* 文本字段：JS 写入器只补「文件里还没有的」，绝不会盖掉 fb2k 刚写好的 */
  var fields = {
    TITLE: String((track && track.title) || ''),
    ARTIST: artistText(track),
    ALBUM: String((track && track.album) || ''),
    DATE: dateOf(track),
    GENRE: genreOf(track),
    LYRICS: String((data && data.lyric) || '')
  };

  return new Promise(function (resolve) {
    var tries = 0;
    (function attempt() {
      var js = null;
      try { js = embedCoverToFile(track, path, cf, fields); }
      catch (e) { js = { ok: false, reason: (e && e.message) || String(e) }; }
      if (js && js.ok) { resolve(js); return; }

      /* 文件刚被 foobar2000 写完标签、句柄可能还没放开：稍微等一下重试 */
      if (js && js.busy && ++tries < 3) { setTimeout(attempt, 180); return; }

      NM.lx.pushLog('warn', '内置写入器没成功（' + ((js && js.reason) || '未知') + '），改试 PowerShell');

      /* ② PowerShell 写入器 */
      if (tagScriptPath()) {
        writeTags(track, path, data).then(function (r) {
          if (r && r.ok && r.cover) resolve({ ok: true, how: 'PowerShell 写入器' });
          else resolve(attachImageAsync(handle, cf, (r && r.reason) || 'PowerShell 写入器没写入封面'));
        }, function (e) {
          resolve(attachImageAsync(handle, cf, (e && e.message) || 'PowerShell 写入器异常'));
        });
        return;
      }

      resolve(attachImageAsync(handle, cf, '内置写入器：' + ((js && js.reason) || '失败')));
    })();
  });
}

/* ② 备用：AttachImage 是异步的，留 700ms 让它真的把图写进文件再刷新/播放 */
function attachImageAsync(handle, coverFile, why) {
  var pre = why ? why + '；' : '';
  if (!handle || typeof FbMetadbHandleList === 'undefined') {
    return Promise.resolve({ ok: false, reason: pre + '没有 FbMetadbHandleList' });
  }
  var hl = fbHandleListOf(handle);
  if (!hl || typeof hl.AttachImage !== 'function') {
    return Promise.resolve({ ok: false, reason: pre + '组件没有 AttachImage' });
  }

  var ok = false;
  try { ok = hl.AttachImage(coverFile, 0) !== false; } catch (e) { ok = false; }
  if (!ok) return Promise.resolve({ ok: false, reason: pre + 'AttachImage 调用失败' });

  return new Promise(function (resolve) {
    setTimeout(function () {
      try { hl.RefreshStats(); } catch (e) {}
      resolve({ ok: true, how: 'AttachImage（异步）' });
    }, 700);
  });
}

function addToFoobar(url, enqueue, track, q, local, opts) {
  opts = opts || {};
  var idx;
  try {
    idx = plman.FindOrCreatePlaylist(PLAYLIST_NAME, true);
  } catch (e) {
    setStatus('创建播放列表失败：' + ((e && e.message) || e), true);
    finishOnce(opts, false, '创建播放列表失败');
    return;
  }

  var before = 0;
  try { before = plman.PlaylistItemCount(idx); } catch (e) {}

  try {
    plman.AddLocations(idx, [local ? String(url) : safeUrl(url)], !enqueue);
  } catch (e) {
    setStatus('加入播放列表失败：' + ((e && e.message) || e), true);
    finishOnce(opts, false, '加入播放列表失败');
    return;
  }

  if (enqueue) {
    if (!opts.silentStatus) setStatus('已加入「' + PLAYLIST_NAME + '」：' + track.title);
    finishOnce(opts, true);
    return;
  }

  setStatus('正在添加到播放列表…');
  var tries = 0;
  (function waitAdded() {
    var count = 0;
    try { count = plman.PlaylistItemCount(idx); } catch (e) {}
    if (count > before) {
      afterAdded(idx, before);
      return;
    }
    if (++tries > 50) {
      setStatus('加入播放列表超时，请检查播放列表状态', true);
      finishOnce(opts, false, '加入播放列表超时');
      return;
    }
    setTimeout(waitAdded, 100);
  })();

  function afterAdded(idx, item) {
    var handle = null;
    try { handle = plman.GetPlaylistItemHandle(idx, item); } catch (e) { handle = null; }

    function playNow() {
      if (!tokenAlive(opts.token)) { finishOnce(opts, false, '已被新的播放请求取消'); return; }
      try {
        plman.SetPlaylistFocusItem(idx, item);
        plman.SetPlaylistSelectionSingle(idx, item, true);
      } catch (e) {}
      try {
        var r = plman.ExecutePlaylistDefaultAction(idx, item);
        if (r === -1) fb.Play();
      } catch (e) {
        try { fb.Play(); } catch (e2) {}
      }
      setStatus((local ? '播放（缓存）：' : '播放：') + track.title + ' · ' + (QUALITY_LABEL[q] || q || ''));
      /* 开始播放后换上这张封面，不依赖播放回调的时序。
         用 false 不用 true（v1.9.18）：on_playback_new_track 马上还会调一次
         refreshBackground，force=true 会跳过 key 比较，等于把同一张封面
         连着取两次、把同一张位图连着烘两次。 */
      setTimeout(function () { refreshBackground(false); }, 80);
      finishOnce(opts, true);
    }

    /* 不需要补标签：直接播 */
    if (!opts.prep) { playNow(); return; }

    /* 先把标签写进文件，再播 */
    setStatus('正在写入标签：' + track.title + ' …');
    opts.prep.then(function (d) {
      if (!tokenAlive(opts.token)) { finishOnce(opts, false, '已被新的播放请求取消'); return; }

      /* ⓪ 先把封面图放到音轨旁边：foobar2000 的 Album Art、主题封面面板都读同目录，
          播放起来就有封面（音频文件本身一个字节都不改） */
      if (PUSH_COVER && d && d.cover && opts.dest) {
        if (writeCoverSidecar(opts.dest, d.cover)) {
          NM.lx.pushLog('ok', '封面已推到音轨目录（cover.jpg）：' + (opts.name || ''));
        }
      }

      /* ① 文本字段：foobar2000 自己的 tagger */
      var r = writeTagsByFoobar(handle, track, { lyric: d && d.lyric });
      if (r && !r.ok) {
        NM.lx.pushLog('warn', 'foobar2000 写文本标签失败（' + ((r.reason) || '') + '）：' + opts.name);
      }

      /* ② 封面：v1.9.3 起默认不做（EMBED_COVER=false），写完文本标签直接播 */
      var hadCover = !!(d && d.cover);
      if (!EMBED_COVER) {
        finish(r, { ok: true, skipped: true, how: '未嵌入封面' });
        return;
      }
      if (!hadCover) {
        finish(r, { ok: true, how: '无封面可写' });
        return;
      }
      setStatus('正在嵌入封面：' + track.title + ' …');
      embedCover(handle, track, opts.dest, d).then(function (c) {
        finish(r, c);
      }, function (e) {
        finish(r, { ok: false, reason: (e && e.message) || '嵌入封面异常' });
      });

      function finish(tr, c) {
        if (!tokenAlive(opts.token)) { finishOnce(opts, false, '已被新的播放请求取消'); return; }
        /* 两个写入器（JS / PowerShell）都是全量写（文本 + 歌词 + 封面），
           它们成功就说明文本也进去了；AttachImage 只贴图，不能算文本写成功 */
        var byWriter = !!(c && c.ok && String(c.how || '').indexOf('AttachImage') < 0);
        var textOk = !!((tr && tr.ok) || byWriter);
        var coverOk = !!(c && c.ok);
        var coverSkipped = !!(c && c.skipped);
        if (opts.key != null) {
          /* 有封面却没嵌进去 → art 标 0，下次点播再补一次，不会永久留个空封面 */
          var taggedOk = textOk && (coverSkipped || coverOk || !hadCover) ? 1 : 0;
          indexPut(opts.key, opts.rel || opts.name, taggedOk, (coverOk || !EMBED_COVER) ? 1 : 0);
        }
        if (coverSkipped) {
          if (textOk) NM.lx.pushLog('ok', '已写入标签（不嵌封面）：' + opts.name);
          else NM.lx.pushLog('warn', '标签写入失败（不影响播放）：' + ((tr && tr.reason) || ''));
        } else if (textOk && coverOk) {
          NM.lx.pushLog('ok', '已写入标签 + 内嵌封面（' + c.how + '）：' + opts.name);
        } else if (textOk) {
          NM.lx.pushLog('warn', '标签已写，封面未嵌入（' + ((c && c.reason) || '') + '）：' + opts.name);
        } else {
          NM.lx.pushLog('warn', '标签写入失败（不影响播放）：' + ((tr && tr.reason) || ''));
        }
        try { if (handle) handle.RefreshStats(); } catch (e) {}
        playNow();
      }
    }, function () {
      playNow();
    });
  }
}

/* 缓存文件已就绪：需要时补写标签 + 把封面嵌进文件，然后再送进播放列表 */
function playCachedFile(track, dest, quality, enqueue, token, onDone) {
  var key = cacheKeyOf(track, quality);
  var hit = indexGet(key);
  var rel = relCachePath(dest);        /* 索引里存相对路径（专辑\文件名） */
  var name = baseName(dest);           /* 显示 / 日志用纯文件名 */

  /* 标签写过、版本对、封面也嵌好了 —— 最快的一条路，直接播 */
  var ready = !!(hit && hit.tagged && Number(hit.v || 0) === TAG_VERSION &&
                 (hit.art || !EMBED_COVER));

  if (ready) {
    pushCoverTo(track, dest, null);     /* 旁边的 cover.jpg 被删了就补一张 */
    addToFoobar(dest, enqueue, track, quality, true, { token: token, onDone: onDone });
    return;
  }

  /* 入队不切歌：只把文件位置记进索引，标签等这首真的被点播时再写。
     以前这里走 writeTags() → powershell.exe：勾 20 首批量加入就是 20 次
     进程启动（每次 45s 超时），而这张专辑的标签其实还一句都没写。
     点播时 ready=false 会自动走完整流程（fb2k 写文本 + 内嵌封面），一个都不会少。 */
  if (enqueue) {
    indexPut(key, rel, 0, 0);
    addToFoobar(dest, true, track, quality, true, { token: token, onDone: onDone });
    return;
  }

  /* 还差标签或封面（含 v1.9.6 及更早留下的老缓存）：走完整流程补一次 */
  setStatus('正在准备封面与歌词：' + track.title + ' …');
  addToFoobar(dest, false, track, quality, true, {
    token: token,
    onDone: onDone,
    key: key,
    name: name,
    rel: rel,
    dest: dest,
    prep: prepareTagData(track)
  });
}

/* --------------------------------------------------------------------------
   腾讯取链：面板自己来
   --------------------------------------------------------------------------
   官方 music.vkey.GetVkey 现在对未登录请求基本只回 104009（invalidq），
   偶尔能下发的也多是 RS02 试听。所以 providers.txUrl 的顺序是：
     ① 官方接口（可能可用，失败 / 只给试听就往下走）
     ② api.vkeys.cn 免登录直链（免费歌给完整 320k，VIP 歌只给 30 秒）
   脚本能解锁高音质，所以内置只拿到试听时，仍给脚本留一次机会 ——
   「安妮独家音源 v5」这类后端拿的是登录态票据，VIP 歌能取到完整 FLAC。
   -------------------------------------------------------------------------- */
function txNativeEnabled() {
  return String(window.GetProperty('lx.txNative', '1')) !== '0';
}

function txTrialEnabled() {
  return String(window.GetProperty('lx.txTrial', '1')) !== '0';
}

function raceTimeout(pr, ms) {
  return new Promise(function (resolve, reject) {
    var t = setTimeout(function () { reject(new Error('超时')); }, ms);
    pr.then(function (v) { clearTimeout(t); resolve(v); },
            function (e) { clearTimeout(t); reject(e); });
  });
}

function txResolve(track, want) {
  function byScript() {
    return NM.lx.resolve(track.source, buildMusicInfo(track), want || quality);
  }

  if (!track || track.source !== 'tx') return byScript();
  if (!txNativeEnabled()) return byScript();
  if (!NM.providers || typeof NM.providers.txUrl !== 'function') return byScript();

  return NM.providers.txUrl(track, want).then(function (nat) {
    if (!nat) return byScript();

    if (!nat.trial) {
      NM.lx.pushLog('ok', '内置取链 ' + nat.quality + '（' + track.title + '）');
      if (want && want !== 'auto' && want !== nat.quality) {
        NM.lx.pushLog('info', '腾讯免登录只给到 ' + nat.quality + '，想要 ' + want + ' 需要登录或换音源');
      }
      return nat;
    }

    if (!txTrialEnabled()) {
      var eNoTrial = new Error('这首歌腾讯只给 30 秒试听（VIP 专享），已关闭试听兜底');
      throw eNoTrial;
    }

    /* 只拿到试听：先让脚本试一次，脚本也许能解锁完整版。
       给 12 秒：脚本自己的 HTTP 超时是 8 秒，留出解析 + 换脚本的余量。
       以前给 8 秒，后端稍慢一点就整首退成 30 秒试听。 */
    return raceTimeout(byScript(), 12000).then(function (r) {
      if (looksTrialUrl(r.url)) {
        NM.lx.pushLog('warn', '脚本也只给到 30 秒试听，改用官方试听：' + track.title);
        return nat;
      }
      NM.lx.pushLog('ok', '脚本取到了完整版，用脚本的：' + track.title);
      return r;
    }, function (e) {
      NM.lx.pushLog('warn', '脚本没解锁（' + ((e && e.message) || e) + '），改播 30 秒试听');
      return nat;
    });
  }, function (e) {
    NM.lx.pushLog('warn', '内置取链失败（' + ((e && e.message) || e) + '），改用音源脚本');
    return byScript();
  });
}

function playTrack(track, enqueue, opts) {
  if (!track) return;
  opts = opts || {};
  /* silent：批量入列用，不顶掉当前正在加载/播放的那一首；
     批量用独立批次号，点播一首不会再把剩下的批量请求全部作废 */
  var token = opts.silent
    ? { kind: 'batch', id: (opts.batch != null ? opts.batch : batchSeq) }
    : { kind: 'play', id: ++playSeq };
  lastTrack = track;
  if (!enqueue) rememberCover(track, '');

  /* 令牌失效：报一次"已取消"给批量队列，别让它一直等 */
  function dead() {
    if (tokenAlive(token)) return false;
    finishOnce(opts, false, '已被新的请求取消');
    return true;
  }

  setStatus('正在取链：' + track.title + ' …');
  txResolve(track, quality).then(function (res) {
    if (dead()) return;

    /* 有些脚本不标试听：腾讯试听地址固定是 RS01/RS02 开头，
       认出来就按试听处理，绝不写进缓存。 */
    if (res && looksTrialUrl(res.url)) res.trial = true;

    /* QQ 音乐加密格式（.mflac / .mgg / .qmc*）：下载下来是乱码，foobar2000 播不了。
       取链层通常已经拒掉，这里再兜一次，避免绕过 lx.js 的路径把坏文件写进缓存。 */
    var enc = (NM.lx && typeof NM.lx.encryptedExt === 'function')
      ? NM.lx.encryptedExt(res.url) : '';
    if (enc) {
      NM.lx.pushLog('err', '取链返回加密格式 ' + enc + ' ' + (track.title || '') +
                    '：' + shortUrl(res.url));
      setLastProblem('音源返回的是加密格式 ' + enc + '，foobar2000 播不了：' +
                     (track.title || '') + '\n换一个音源脚本，或右键「换源」到别的平台。');
      setStatus('音源返回的是加密格式（' + enc + '），foobar2000 播不了（点底栏看原因）', true);
      finishOnce(opts, false, '加密格式 ' + enc);
      return;
    }

    /* 试听是 30 秒的片段，绝不能当完整歌缓存下来 */
    var dest = (res.trial ? '' : (downloadEnabled() ? cachePathFor(track, res.quality, res.url) : ''));
    if (dest) ensureFolder(dirOfFile(dest));      /* cache 目录先建好（通常已存在） */
    if (!enqueue) rememberCover(track, dest);

    /* 本地已经有这一份：校验一下再播。以前只判断文件大于 1 KB，
       一份 403 的错误页（几百字节的 HTML）也能骗过去，于是一首歌永久坏在缓存里。
       这里连 0 字节的残留文件也一起清 —— 反正留着它会让后面的改名失败。 */
    if (dest) {
      var has = false;
      try { has = !!utils.FileExists(dest); } catch (e) { has = false; }
      if (has) {
        var sn0 = sniffAudio(dest);
        if (sn0.ok) {
          var fixed0 = ensureAudioExt(track, dest, sn0.kind, res.quality);
          playCachedFile(track, fixed0, res.quality, enqueue, token, opts.onDone);
          return;
        }
        NM.lx.pushLog('warn', '缓存不是音频（' + sn0.why + '），删掉重下：' + baseName(dest));
        dropCacheFile(dest, cacheKeyOf(track, res.quality));
      }
    }

    /* 先验票：腾讯的直链靠 vkey 授权，脚本没取到 vkey 时会拼出 vkey= 为空的
       链接，CDN 对它只会回 403，下载下来是个 0 字节文件，塞给 foobar2000
       就是「不支持的格式或文件损坏」。这里直接判失败，别浪费一次下载。 */
    if (urlLacksTicket(res.url)) {
      var tmsg = badMediaHint(track, res.url);
      NM.lx.pushLog('err', '取链无效（vkey 为空）' + (track.title || '') + '：' + shortUrl(res.url));
      setLastProblem('取链无效：' + (track.title || '') + '\n' + tmsg);
      setStatus('平台没下发播放凭据（vkey 为空），链接必然 403（点底栏看原因）', true);
      finishOnce(opts, false, 'vkey 为空');
      return;
    }

    if (!dest) {
      if (res.trial) {
        NM.lx.pushLog('warn', 'VIP 歌曲，只播 30 秒试听：' + (track.title || ''));
        setStatus('VIP 歌曲：只播放 30 秒试听（换平台可听完整版）', true);
      }
      addToFoobar(res.url, enqueue, track, res.quality, false, { token: token, onDone: opts.onDone });
      return;
    }

    setStatus('正在缓存：' + track.title + ' …');
    var part = dest + '.part';
    NM.lx.download(safeUrl(res.url), part).then(function () {
      if (dead()) return;
      var ok = false;
      try { ok = utils.RenamePath(part, dest); } catch (e) {}
      if (!ok) {
        NM.lx.pushLog('warn', '缓存文件改名失败，改为直接播放');
        try { utils.RemovePath(part); } catch (e2) {}
        addToFoobar(res.url, enqueue, track, res.quality, false, { token: token, onDone: opts.onDone });
        return;
      }

      /* 下载「成功」不等于下到了歌：403 页面、限流提示、JSON 都可能被写成文件。
         校验不过就删掉并如实报错，不把坏文件塞进播放列表。 */
      var sn = sniffAudio(dest);
      if (!sn.ok) {
        NM.lx.pushLog('err', '缓存校验失败 ' + (track.title || '') + '：' + sn.why + '，' + shortUrl(res.url));
        dropCacheFile(dest, cacheKeyOf(track, res.quality));
        setLastProblem('下载回来的不是音频：' + (track.title || '') + '\n' +
                       sn.why + '\n\n' + badMediaHint(track, res.url));
        setStatus('平台返回的不是音频文件（点底栏看原因）', true);
        finishOnce(opts, false, sn.why);
        return;
      }
      playCachedFile(track, ensureAudioExt(track, dest, sn.kind, res.quality),
                     res.quality, enqueue, token, opts.onDone);
    }, function (e) {
      if (dead()) return;
      var emsg = (e && e.message) || String(e);
      NM.lx.pushLog('warn', '缓存失败：' + emsg + '，' + shortUrl(res.url));
      try { utils.RemovePath(part); } catch (e2) {}

      /* 带票据的链接（腾讯的 vkey 这类）下载失败，基本就是 CDN 拒绝了这个请求；
         再把它原样塞给 foobar2000，只会弹「不支持的格式或文件损坏」，还查不到原因。
         这种情况如实报错，别让宿主去猜。 */
      if (queryValue(res.url, 'vkey') !== null) {
        setLastProblem('下载失败：' + (track.title || '') + '\n' + emsg + '\n\n' + badMediaHint(track, res.url));
        setStatus('缓存失败，链接很可能被平台拒绝了（点底栏看原因）', true);
        finishOnce(opts, false, emsg);
        return;
      }
      addToFoobar(res.url, enqueue, track, res.quality, false, { token: token, onDone: opts.onDone });
    });
  }, function (e) {
    if (dead()) return;

    /* 取链失败（平台挂了 / 脚本抽风 / 断网）：本地要是还有一份能播的，
       照样放，别让已经下好的歌跟着一起废掉。 */
    var pre = downloadEnabled() ? cachedFileFor(track, quality) : null;
    if (pre) {
      NM.lx.pushLog('warn', '取链失败，改播本地缓存：' + baseName(pre.path));
      setStatus('平台取链失败，播放本地缓存：' + track.title);
      playCachedFile(track, pre.path, pre.quality, enqueue, token, opts.onDone);
      return;
    }

    var msg = (e && e.message) || String(e);
    NM.lx.pushLog('err', '取链失败 ' + (track.title || '') + '（' + (track.source || '?') + '）：' + msg);
    setLastProblem('取链失败：' + (track.title || '') + '（' + (track.source || '?') + '）\n' + msg +
      (track.source === 'tx'
        ? '\n\n腾讯这次连内置取链也没给直链，通常是 VIP 专享 / 已下架 / 地区限制。\n'
          + '可以右键「换源」到其它平台播放，或者换一个音源脚本试试。'
        : ''));
    setStatus('取链失败：' + (track.title || '') + '（点状态栏看原因）', true);
    finishOnce(opts, false, msg);
  });
}

/* 音源加载失败时拼一份能看懂的原因（放诊断浮层里，状态栏只显示摘要） */
function sourcesFailText() {
  var st = (NM.lx && NM.lx.state) || {};
  var out = [];
  out.push('音源脚本目录：' + (st.dir || '（没找到）'));
  try {
    out.push('模块目录：' + (NM.moduleDir || window.GetProperty('lx.moduleDir', '') || '（没找到）'));
  } catch (e) {}
  if (st.error) out.push('加载错误：' + st.error);
  (st.runtimes || []).forEach(function (r) {
    if (!r.sources) out.push('× ' + r.name + '：' + (r.error || r.status || '未初始化'));
  });
  out.push('');
  out.push('排查：面板属性 lx.scriptDir / lx.moduleDir 可手动指定目录；');
  out.push('或把音源脚本放到「模块目录\resources」下，再右键「重新加载音源脚本」。');
  return out.join('\n');
}

function reloadSources(doneText) {
  setStatus('正在重新加载音源脚本…');
  NM.lx.loadAll({ delay: 30 }).then(function (runtimes) {
    var ok = (runtimes || []).filter(function (r) { return r.sources; }).length;
    if (ok) {
      setStatus((doneText ? doneText + '，' : '') + '音源已就绪：' + ok + ' 个脚本可用');
    } else {
      setLastProblem('没有可用的音源脚本\n' + sourcesFailText());
      setStatus((doneText ? doneText + '，但没有可用音源' : '没有可用的音源脚本') + '（点状态栏看原因）', true);
    }
    repaint();
  }, function (e) {
    setStatus('音源加载失败：' + ((e && e.message) || e), true);
  });
}

/* --------------------------------------------------------------------------
   手动导入音源脚本
   目标目录优先级：lx.scriptDir → 当前正在使用的音源目录 → 模块所在目录。
   -------------------------------------------------------------------------- */
function trimDirPath(p) {
  return String(p == null ? '' : p).replace(/[\\\/]+$/, '');
}

function importTargetDir() {
  var custom = trimDirPath(String(window.GetProperty('lx.scriptDir', '') || '').trim());
  if (custom) return custom;
  /* 当前正在用的目录优先（老安装音源躺在模块目录里，就还放回那儿） */
  var active = trimDirPath(NM.lx.state && NM.lx.state.dir);
  if (active && /[\\\/](resources|sources)$/i.test(active)) return active;
  /* NM.moduleDir 是 lx.js 实际看到的模块目录，比顶层变量更可信 */
  var mod = trimDirPath(NM.moduleDir || moduleDir || '');
  var std = sourcesDirFor(mod);
  if (std) return std;
  return active || mod;
}

/* 「打开音源脚本目录」该开哪一个：正在用的 → 属性 lx.scriptDir → 自动探测，
   取第一个真实存在的；一个都不在就返回最有意义的那个，让调用方把路径报出来。 */
function scriptDirForOpen() {
  var cands = [];
  var add = function (p) {
    var v = trimDirPath(String(p == null ? '' : p).trim());
    if (v && cands.indexOf(v) < 0) cands.push(v);
  };
  try { add(NM.lx && NM.lx.state && NM.lx.state.dir); } catch (e) {}
  try { add(window.GetProperty('lx.scriptDir', '')); } catch (e2) {}
  try { add(importTargetDir()); } catch (e3) {}
  for (var i = 0; i < cands.length; i++) {
    var ok = false;
    try { ok = !!utils.IsDirectory(cands[i]); } catch (e4) { ok = false; }
    if (ok) return cands[i];
  }
  return cands[0] || '';
}

/* 菜单项和设置按钮共用：找目录 → 校验 → 打开 → 把结果写状态栏。
   以前失败是「静默」的（既不弹窗也不报错），所以才像按钮坏掉。 */
function openScriptDirAction() {
  var dir = scriptDirForOpen();
  var dirOk = false;
  try { dirOk = !!utils.IsDirectory(cleanPath(dir)); } catch (e) { dirOk = false; }
  if (!dir) {
    setStatus('没找到音源脚本目录，可在 设置 → 音源与属性 → 音源目录 里指定', true);
    return;
  }
  if (!dirOk) {
    setStatus('音源脚本目录不存在：' + dir, true);
    return;
  }
  if (openDirWithShell(dir)) {
    setStatus('已打开音源脚本目录：' + dir);
    return;
  }
  try { console.log('[LX] 打不开目录：' + dir); } catch (e2) {}
  setStatus('打不开目录：' + dir, true);
}

function importSourceScript() {
  var dir = importTargetDir();
  if (!dir) {
    setStatus('找不到音源脚本目录，请先在属性 lx.scriptDir 指定', true);
    return;
  }
  try { if (!utils.IsDirectory(dir)) utils.CreateFolder(dir); } catch (e) {}

  var owner = 0;
  try { owner = window.ID || 0; } catch (e2) {}

  var picked = '';
  if (typeof utils.FilePicker === 'function') {
    try {
      picked = utils.FilePicker('选择音源脚本（.js）', dir,
                                '音源脚本 (*.js)|*.js|所有文件 (*.*)|*.*', 0, owner) || '';
    } catch (e3) {
      setStatus('打开文件选择框失败：' + ((e3 && e3.message) || e3), true);
      return;
    }
  } else {
    /* 老版本组件没有 FilePicker：退回到输入路径 */
    var input = '';
    try {
      input = utils.InputBox(owner, '输入音源脚本的完整路径：', '导入音源脚本', dir + '\\', false) || '';
    } catch (e4) {
      input = '';
    }
    picked = String(input).replace(/^"|"$/g, '').trim();
  }

  picked = String(picked || '').trim();
  if (!picked) { setStatus('已取消导入'); return; }

  var name = baseName(picked);
  if (!/\.js$/i.test(name)) {
    setStatus('只支持 .js 音源脚本：' + name, true);
    return;
  }
  if (MODULE_NAMES.indexOf(name.toLowerCase()) >= 0) {
    setStatus('这是面板模块文件，不能作为音源导入：' + name, true);
    return;
  }

  var exists = false;
  try { exists = utils.FileExists(picked); } catch (e5) {}
  if (!exists) { setStatus('文件不存在：' + picked, true); return; }

  var text = '';
  try { text = utils.ReadTextFile(picked, 65001); } catch (e6) { text = ''; }
  if (typeof text !== 'string') text = String(text == null ? '' : text);
  if (!text.replace(/^\uFEFF/, '').replace(/\s+/g, '')) {
    setStatus('脚本内容为空或无法读取：' + name, true);
    return;
  }

  var dest = dir + '\\' + name;
  if (picked.toLowerCase() === dest.toLowerCase()) {
    setStatus('该脚本已在音源目录中：' + name);
    return;
  }

  if (utils.FileExists(dest)) {
    var overwrite = true;
    if (typeof utils.MessageBox === 'function') {
      try {
        /* MessageBoxButtons.YesNo = 4，返回 6 表示「是」 */
        overwrite = utils.MessageBox('音源目录已有同名脚本：\n' + name + '\n\n是否覆盖？',
                                     '导入音源脚本', 4, 32) === 6;
      } catch (e7) { overwrite = true; }
    }
    if (!overwrite) { setStatus('已取消导入'); return; }
  }

  var copied = false;
  try { copied = utils.CopyFile(picked, dest, true) !== false; } catch (e8) { copied = false; }
  if (!copied) {
    /* 退路：按文本写入（CopyFile 不可用时） */
    try { copied = utils.WriteTextFile(dest, text) !== false; } catch (e9) { copied = false; }
  }
  if (!copied) {
    setStatus('写入失败（可能没有权限）：' + dir, true);
    return;
  }

  /* 固定到该目录，保证下次仍从这里加载新脚本（走 setProp，设置面板那行才会刷新） */
  setProp('lx.scriptDir', dir);
  reloadSources('已导入 ' + name);
}

/* --------------------------------------------------------------------------
   在线音源脚本
   --------------------------------------------------------------------------
   启动时把「在线音源网址」里的脚本拉下来，和音源目录里的同名文件比内容：
   不一样就写回并重载。网址留空 = 不检查。
   - 只认 http(s)，文件名取自 URL（去掉查询串、解码 %xx）
   - 同名模块文件（main.js / lx.js …）自动加 online- 前缀，绝不覆盖面板
   - 先写 .part 再覆盖，网络失败或写失败都保留本地旧脚本
   -------------------------------------------------------------------------- */
var onlineCheckBusy = false;

function onlineScriptUrl() {
  return String(propStr('lx.onlineScriptUrl', '') || '').trim();
}

function onlineScriptName(url) {
  var s = String(url || '').replace(/[?#].*$/, '');
  var name = s.replace(/^.*[\\\/]/, '');
  try { name = decodeURIComponent(name); } catch (e) {}
  name = String(name || '').replace(/[<>:"\/\\|?*\x00-\x1F]/g, '_')
                            .replace(/^\.+/, '').replace(/[. ]+$/, '');
  if (!name) name = 'online-source.js';
  if (!/\.js$/i.test(name)) name += '.js';
  if (isModuleFile(name)) name = 'online-' + name;
  return name;
}

/* 比较时忽略 BOM 与换行风格，避免只是 CRLF/LF 不同就整份重下 */
function onlineScriptBody(text) {
  return String(text == null ? '' : text).replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
}

function onlineHeader(headers, name) {
  if (!headers) return '';
  var want = String(name || '').toLowerCase();
  var keys = Object.keys(headers);
  for (var i = 0; i < keys.length; i++) {
    if (String(keys[i]).toLowerCase() === want) return String(headers[keys[i]] || '');
  }
  return '';
}

/* 初次加载还没结束时 reloadSources 只会复用旧 Promise；等它结束再重载一次 */
function reloadAfterOnline(text) {
  var loading = NM.lx && NM.lx.state && NM.lx.state.loading;
  if (loading && typeof loading.then === 'function') {
    loading.then(function () { reloadSources(text); },
                 function () { reloadSources(text); });
    return;
  }
  reloadSources(text);
}

function checkOnlineScript(opt) {
  opt = opt || {};
  var url = onlineScriptUrl();
  if (!url) {
    if (opt.manual) setStatus('在线音源网址为空，已关闭自动更新');
    return;
  }
  if (!/^https?:\/\//i.test(url)) {
    setStatus('在线音源网址必须以 http:// 或 https:// 开头', true);
    return;
  }
  if (onlineCheckBusy) {
    if (opt.manual) setStatus('正在检查在线音源，请稍候…');
    return;
  }
  if (!NM.http || typeof NM.http.request !== 'function') {
    setStatus('当前组件不支持网络请求，无法检查在线音源', true);
    return;
  }

  var name = onlineScriptName(url);
  var dir = importTargetDir();
  if (!dir) {
    setStatus('找不到音源脚本目录，无法保存在线音源', true);
    return;
  }
  try { if (!utils.IsDirectory(dir)) utils.CreateFolder(dir); } catch (e) {}

  onlineCheckBusy = true;
  if (opt.manual) setStatus('正在检查在线音源：' + name + ' …');

  NM.http.request({
    url: url,
    timeout: 30000,
    headers: {
      'Accept': 'application/javascript,text/javascript,*/*',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    }
  }).then(function (r) {
    var code = (r && r.status) || 0;
    if (code && (code < 200 || code > 299)) throw new Error('HTTP ' + code);

    var body = String((r && r.body) || '').replace(/^\uFEFF/, '');
    var ctype = onlineHeader(r && r.headers, 'content-type');
    if (/text\/html|application\/xhtml/i.test(ctype) ||
        /^\s*<(?:!doctype|html|head|body|!--)/i.test(body)) {
      throw new Error('网址返回的是网页，不是音源脚本');
    }
    if (/application\/json/i.test(ctype)) {
      throw new Error('网址返回的是 JSON，不是音源脚本');
    }
    var head0 = body.replace(/^\s+/, '');
    if (head0.charAt(0) === '{' || head0.charAt(0) === '[') {
      var isJson = false;
      try { JSON.parse(head0); isJson = true; } catch (eJson) {}
      if (isJson) throw new Error('网址返回的是 JSON，不是音源脚本');
    }

    var text = onlineScriptBody(body);
    if (!text.replace(/\s+/g, '')) throw new Error('网址返回空内容');
    if (text.length > 2 * 1024 * 1024) throw new Error('脚本太大（超过 2 MB）');

    /* 下载期间用户改了网址：这份内容已经过期，别写进去；按新网址再查一次 */
    if (onlineScriptUrl() !== url) {
      onlineCheckBusy = false;
      setTimeout(function () { checkOnlineScript({ manual: true }); }, 0);
      return;
    }

    var dest = joinPath(dir, name);
    var old = '';
    try {
      if (utils.FileExists(dest)) old = String(utils.ReadTextFile(dest, 65001) || '');
    } catch (e2) { old = ''; }

    if (old && onlineScriptBody(old) === text) {
      onlineCheckBusy = false;
      if (opt.manual) setStatus('在线音源已是最新：' + name);
      else if (NM.lx && NM.lx.pushLog) NM.lx.pushLog('info', '在线音源已是最新：' + name);
      return;
    }

    var wrote = false;
    var part = dest + '.part';
    try {
      wrote = utils.WriteTextFile(part, text) !== false;
      if (wrote) {
        try { wrote = utils.CopyFile(part, dest, true) !== false; } catch (e3) { wrote = false; }
      }
    } catch (e4) { wrote = false; }
    try { if (utils.FileExists(part)) utils.RemovePath(part); } catch (e5) {}
    if (!wrote) {
      /* 老组件没有 CopyFile 时直接写目标文件 */
      try { wrote = utils.WriteTextFile(dest, text) !== false; } catch (e6) { wrote = false; }
    }
    if (!wrote) throw new Error('写入失败（可能没有权限）：' + dest);

    onlineCheckBusy = false;
    reloadAfterOnline((old ? '在线音源已更新：' : '在线音源已下载：') + name);
  }).then(null, function (e) {
    onlineCheckBusy = false;
    /* 失败时网址已经换了：旧网址的失败不再打扰用户，直接查新网址 */
    if (onlineScriptUrl() !== url) {
      setTimeout(function () { checkOnlineScript({ manual: true }); }, 0);
      return;
    }
    var msg = (e && e.message) || String(e);
    if (NM.lx && NM.lx.pushLog) NM.lx.pushLog('warn', '在线音源检查失败：' + msg);
    if (opt.manual) setStatus('在线音源检查失败：' + msg, true);
    else if (opt.startup) setStatus('在线音源检查失败，继续使用本地脚本（详情见诊断日志）');
  });
}

function sourceCount() {
  var n = 0;
  (NM.lx.state.runtimes || []).forEach(function (r) { if (r.sources) n++; });
  return n;
}

/* --------------------------------------------------------------------------
   歌曲评论 / 艺人介绍
   评论 → cache\review\歌手 - 歌名.json
   简介 → cache\bio\歌手.txt
   图片 → cache\artist\歌手.jpg
   评论缓存 7 天、简介 30 天，过期后自动重新拉取。
   -------------------------------------------------------------------------- */
var COMMENT_TTL = 7 * 24 * 3600 * 1000;
var BIO_TTL = 30 * 24 * 3600 * 1000;

function readCacheJson(file, ttl) {
  if (!file) return null;
  try {
    if (!utils.FileExists(file)) return null;
    var txt = utils.ReadTextFile(file, 65001);
    var j = JSON.parse(String(txt == null ? '' : txt).replace(/^\uFEFF/, ''));
    if (!j || typeof j !== 'object') return null;
    if (ttl && j.at && (Date.now() - j.at) > ttl) return null;
    return j;
  } catch (e) {
    return null;
  }
}

function writeCacheJson(file, obj) {
  if (!file) return;
  try { utils.WriteTextFile(file, JSON.stringify(obj)); } catch (e) {}
}

function readCacheText(file, ttl) {
  if (!file) return null;
  try {
    if (!utils.FileExists(file)) return null;
    var size = 0;
    try { size = utils.GetFileSize(file); } catch (e) {}
    if (!size) return null;
    if (ttl) {
      /* 用文件时间判断过期不靠谱（filetime 换算麻烦），这里把时间写在第一行 */
      var txt0 = String(utils.ReadTextFile(file, 65001) || '');
      var m = /^#lx-at:(\d+)\r?\n/.exec(txt0);
      if (m && (Date.now() - Number(m[1])) > ttl) return null;
      return txt0.replace(/^#lx-at:\d+\r?\n/, '');
    }
    return String(utils.ReadTextFile(file, 65001) || '');
  } catch (e) {
    return null;
  }
}

function writeCacheText(file, text) {
  if (!file) return;
  try {
    utils.WriteTextFile(file, '#lx-at:' + Date.now() + '\n' + String(text == null ? '' : text));
  } catch (e) {}
}

/* 比对用：去掉空格、标点、分隔符，避免「周杰伦 / 费玉清」和「周杰伦、费玉清」判成两首 */
function normLoose(s) {
  return String(s == null ? '' : s).toLowerCase()
    .replace(/[\s·・.\-_'’"“”()（）\[\]【】、,，;；\/&＋+]/g, '');
}

function sameTrackAs(a, b) {
  if (!a || !b) return false;
  var t1 = normLoose(a.title);
  var t2 = normLoose(b.title);
  if (!t1 || !t2 || t1 !== t2) return false;
  var a1 = normLoose(a.artist);
  var a2 = normLoose(b.artist);
  if (a1 && a2 && a1 !== a2) return false;   /* 同名不同歌手，算两首 */
  return true;
}

/* 评论 / 艺人资料的对象：始终是「当前正在播放的曲目」 */
function targetTrack() {
  var h = nowPlayingHandle();
  var cur = null;
  if (h) {
    var t = '', a = '', al = '';
    try { t = String(fb.TitleFormat('%title%').EvalWithMetadb(h) || ''); } catch (e) { t = ''; }
    try { a = String(fb.TitleFormat('%artist%').EvalWithMetadb(h) || ''); } catch (e) { a = ''; }
    try { al = String(fb.TitleFormat('%album%').EvalWithMetadb(h) || ''); } catch (e) { al = ''; }
    if (t || a) cur = { title: t, artist: a, album: al, source: '', id: '', songmid: '', hash: '', rid: '' };
  }
  /* 正在播的就是面板点播的那首（缓存文件已写入标签）→ 复用带平台 ID 的原始曲目 */
  if (cur && lastTrack && sameTrackAs(cur, lastTrack)) return lastTrack;
  if (cur) return cur;
  return lastTrack;
}

function openOverlay(kind, name, subject) {
  if (editKind) endEdit();
  overlay = kind;
  overlayName = name || '';
  overlaySubject = subject || '';
  overlayItems = null;
  overlayText = '';
  overlayCols = [];
  overlayWrapKey = '';
  overlayScroll = 0;
  overlayError = '';
  overlayLoading = true;
  overlayHot = '';        /* 新浮层：hover 缓存作废，第一次移动要能触发重绘 */
  resetBioState();
  repaint();
}

/* 艺人浮层的数据全清空。图片（bioPic）留着不 dispose：
   同一个歌手反复开关是常事，重新读盘 + 解码要几十毫秒，白等。 */
function resetBioState() {
  bioTracks = [];
  bioTotal = 0;
  bioShow = BIO_PAGE;
  bioSongScroll = 0;
  bioMoreHot = false;
  bioSongSel = -1;
  bioId = 0;
  bioPicLoading = false;
  bioPicPath = '';
  bioSongsBusy = false;
  bioSongsFull = false;
}

function closeOverlay() {
  /* 检测跑到一半就关掉浮层：把这一轮作废，别再往已经关掉的表格里写结果 */
  if (overlay === 'probe') {
    if (probeBusy) probeCancel();
    probeHot = false;
    probePickHot = false;
    probeStopHot = false;
  }
  overlay = '';
  overlayItems = null;
  overlayText = '';
  overlayCols = [];
  overlayWrapKey = '';
  overlayScroll = 0;
  overlayLoading = false;
  overlayError = '';
  overlayHot = '';
  /* 关掉浮层就别再执行那次「单击图片」的延时动作了 */
  if (bioPicClickTimer) { clearTimeout(bioPicClickTimer); bioPicClickTimer = 0; }
  scriptHot = false;
  resetBioState();
  repaint();
}

/* 诊断 / 日志浮层：点状态栏或右键「诊断 / 日志」打开。
   1.9.2 里取链失败的完整原因只进了 console，状态栏单行还被截断，等于看不见。 */
function openDiagnostics() {
  openOverlay('logs', '诊断 / 日志', lastProblem ? '含最近一次失败原因' : '当前没有失败记录');
  overlayLoading = false;
  rebuildOverlayLines(true);
  repaint();
}

/* --------------------------------------------------------------------------
   音源音质检测（移植自 LX Music / LX-M 的「音源音质检测」）
   --------------------------------------------------------------------------
   为什么需要它：音源脚本在 inited 时声明的 qualitys 只是「它想提供这几档」，
   实际能不能拿到直链要看平台本身（VIP 专享、版权、下架、接口改版）。所以光看
   声明没用，得真去要一次。

   做法（与 LX-M 一致的部分）：
     1. 每个平台搜同一组样本歌，只有「这一档」真的返回 http(s) 直链才算可用；
        最多试 2 首，两首都失败才判失败 —— 单首失败常常只是这首没这档。
     2. 平台之间**串行**，同一平台内最多两档并行：所有平台共用同一批脚本，
        并发一高就容易被限流，整张表会误判成「全都不支持」。
     3. 只问这一档，不降级（LX.lx.probeUrl 走单档请求），否则 flac 一列会
        因为脚本内部退到 128k 而全绿。

   我们多走一步：拿到直链后再 Range 取前 64 字节认文件头（ID3 / fLaC / ftyp…）。
   腾讯那个「地址拿到了、内容是错误页」的坑就是这么抓到的 —— 只判 URL 判不出来。
   -------------------------------------------------------------------------- */
var PROBE_SRC = ['tx', 'wy', 'kw', 'kg', 'mg'];
var PROBE_Q = ['128k', '320k', 'flac'];
var PROBE_Q_LABEL = { '128k': '128K', '320k': '320K', 'flac': 'FLAC' };
var PROBE_SAMPLES = 2;             /* 每档最多试几首样本 */
var PROBE_KEYWORD = '爱';          /* 与 LX-M 同一个关键词：命中的曲目多、各档都全 */
var PROBE_TIMEOUT = 15000;

var probeRun = 0;
var probeBusy = false;
var probeAt = 0;
var probeRes = {};                 /* 平台 → 音质 → { st, ms, why, via, url } */
var probeSampleCache = {};         /* 平台 → 样本曲目（一次检测内复用） */
var probeMsg = '还没检测过';
var probeNote = '';                /* 最近一条失败原因，画在图例下面 */
var probeHot = false;
var probePickHot = false;          /* 「检测音源」选择框的悬停态 */
var probeStopHot = false;          /* 「停止检测」按钮的悬停态 */

/* 单元格状态：wait 排队 / run 检测中 / ok 可用 / addr 只有地址 / fail 失败 / na 无此档 */
function probeResetRes() {
  probeRes = {};
  PROBE_SRC.forEach(function (p) {
    probeRes[p] = {};
    PROBE_Q.forEach(function (q) {
      probeRes[p][q] = { st: 'wait', ms: 0, why: '', via: '', url: '' };
    });
  });
}
probeResetRes();

function probeName(p) {
  var meta = (NM.providers && NM.providers.meta) || {};
  return (meta[p] && (meta[p].short || meta[p].name)) || p;
}

function probeCell(p, q) {
  return (probeRes[p] || {})[q] || { st: 'na', ms: 0, why: '', via: '', url: '' };
}

function probeReady() {
  return !!(NM.lx && typeof NM.lx.probeUrl === 'function' &&
            NM.providers && typeof NM.providers.search === 'function');
}

/* 「只检测选中脚本」：lx.probeScript 存脚本 id（文件名），空 = 全部脚本。
   设置面板里的选择框和检测流程都读这一份，保证「看到哪个就测哪个」。 */
function probeScriptId() {
  try { return String(window.GetProperty('lx.probeScript', '') || ''); } catch (e) { return ''; }
}

function probeScriptRuntime() {
  var id = probeScriptId();
  if (!id) return null;
  var list = scriptRuntimes();
  for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
  return null;
}

function probeScriptLabel() {
  var id = probeScriptId();
  if (!id) return '全部脚本';
  var rt = probeScriptRuntime();
  return rt ? scriptName(rt) : ('已移除的脚本：' + id);
}

/* 换检测范围：旧结果作废（否则会把上一个脚本的结果当成新脚本的） */
function setProbeScript(id) {
  setProp('lx.probeScript', id || '');
  probeRun++;
  probeBusy = false;
  probeAt = 0;
  probeNote = '';
  probeMsg = '还没检测过';
  probeResetRes();
  setStatus('音质检测范围：' + probeScriptLabel() + '，点「开始检测」开始');
  repaint();
}

function probeClock(ts) {
  var d = new Date(ts || Date.now());
  function p2(n) { return (n < 10 ? '0' : '') + n; }
  return p2(d.getHours()) + ':' + p2(d.getMinutes()) + ':' + p2(d.getSeconds());
}

/* 一句话结论：哪些平台有可用档，一共几格可用 */
function probeSummary() {
  var okN = 0, total = 0, hit = [];
  PROBE_SRC.forEach(function (p) {
    var n = 0, tried = 0;
    PROBE_Q.forEach(function (q) {
      var st = probeCell(p, q).st;
      if (st !== 'na') tried++;
      if (st === 'ok') { okN++; n++; }
    });
    /* 整行都是 na（脚本没声明这个平台 / 没搜到样本）就不算进总数 */
    if (!tried) return;
    total += tried;
    if (n) hit.push(probeName(p) + ' ' + n + ' 档');
  });
  if (!total) return '没有结果';
  return okN + '/' + total + ' 格可用' + (hit.length ? '（' + hit.join('、') + '）' : '');
}

/* 样本：每个平台搜一次，结果留到本次检测结束（换关键词就重搜） */
function probeSamplesOf(p) {
  if (probeSampleCache[p]) return Promise.resolve(probeSampleCache[p]);
  var search = (NM.providers && NM.providers.search) || null;
  if (!search) { probeSampleCache[p] = []; return Promise.resolve([]); }

  function ask(kw) {
    return NM.lx.withTimeout(Promise.resolve(search([p], kw, 1, 24)), 15000, '搜索样本')
      .then(function (res) {
        /* 返回是 [{ platform, ok, tracks }]（老接口是曲目数组，两种都认） */
        var one = res && res[0] != null ? res[0] : res;
        if (Array.isArray(one)) return one;
        return (one && one.ok && Array.isArray(one.tracks)) ? one.tracks : [];
      }, function () { return []; });
  }

  return ask(PROBE_KEYWORD).then(function (list) {
    if (list.length) return list;
    return ask('热门');          /* 「爱」搜不出来（接口抽风）就换个词再试一次 */
  }).then(function (list) {
    probeSampleCache[p] = list || [];
    return probeSampleCache[p];
  });
}

/* 挑样本：标了「这一档」的排前面，其次才是别的 —— 但不能只认标了的那几首，
   网易 / 酷我 / 咪咕的曲目根本没有 types 字段，只认标记等于整列判死 */
function probePick(list, q, n) {
  var marked = [], rest = [];
  (list || []).forEach(function (t) {
    if (!t) return;
    if (t.types && t.types[q]) marked.push(t);
    else rest.push(t);
  });
  return marked.concat(rest).slice(0, n);
}

/* 取一次链：腾讯优先内置（内置能按单一文件名精确问），失败再交给脚本。
   选了「检测音源」时不能走内置 —— 那测的是面板自己，不是那个脚本。 */
function probeResolveOnce(p, track, q) {
  var only = probeScriptId();
  function byScript() {
    var opt = { timeout: PROBE_TIMEOUT };
    if (only) opt.script = only;
    return NM.lx.probeUrl(p, buildMusicInfo(track), q, opt)
      .then(function (r) { return { url: r.url, via: r.script || '脚本' }; });
  }
  var nativeOk = !only && p === 'tx' && txNativeEnabled() && NM.providers &&
                 typeof NM.providers.txUrlExact === 'function';
  if (!nativeOk) return byScript();
  return NM.providers.txUrlExact(track, q).then(function (r) {
    return { url: r.url, via: '内置' };
  }, byScript);
}

/* 只取前 64 字节验一验：
     'ok'      文件头是音频，且和这一档相符
     'low'     是音频，但比这一档低（要 FLAC 给了 MP3）
     'trial'   只有 30 秒试听
     'bad'     不是音频 / HTTP 错误
     'unknown' 没验成（不冤枉它） */
function probeVerify(url, q) {
  /* 加密格式（.mflac / .mgg / .qmc*）连读文件头都不用读：foobar2000 播不了 */
  if (NM.lx && typeof NM.lx.encryptedExt === 'function' && NM.lx.encryptedExt(url)) {
    return Promise.resolve('bad');
  }
  /* 试听片段也是合法音频，但它不是这一档的完整歌，不能算「可用」 */
  if (looksTrialUrl(url)) return Promise.resolve('trial');
  if (!NM.http || typeof NM.http.probe !== 'function') return Promise.resolve('unknown');
  return NM.http.probe(url, 8000).then(function (r) {
    var st = (r && (r.statusCode || r.status)) || 0;
    if (st && st >= 400) return 'bad';
    var body = (r && (r.body || r.raw)) || null;
    if (!body || !body.length) return 'unknown';
    var kind = audioKindOf(body);
    if (!kind) return 'bad';
    /* 检测 FLAC 列时，返回 MP3/OGG 不能算数：备用接口和脚本都会悄悄降档 */
    if (q === 'flac' && kind !== 'flac') return 'low';
    return 'ok';
  }, function () { return 'unknown'; });
}

function probeOneCell(p, q, run) {
  var cell = probeRes[p][q];
  if (!cell) return Promise.resolve();
  cell.st = 'run';
  cell.why = '';
  repaint();

  var list = probePick(probeSampleCache[p], q, PROBE_SAMPLES);
  if (!list.length) {
    cell.st = 'na';
    cell.why = '没搜到样本歌曲';
    repaint();
    return Promise.resolve();
  }

  var t0 = Date.now();
  var lastAddr = null;      /* 拿到过地址但内容没验过 */
  var lastLow = null;       /* 只拿到低一档的音频 */

  function say(why) {
    probeNote = probeName(p) + ' ' + (PROBE_Q_LABEL[q] || q) + '：' + why;
    repaint();
  }

  function at(i) {
    if (run !== probeRun) return Promise.resolve();
    if (i >= list.length) {
      /* 两首都没验成：有地址就记「仅地址」，否则如实失败 */
      cell.ms = Date.now() - t0;
      if (lastAddr) {
        cell.st = 'addr';
        cell.why = lastAddr.why;
        cell.via = lastAddr.via;
        cell.url = lastAddr.url;
        say(cell.why);
      } else {
        cell.st = 'fail';
        cell.why = (lastLow && lastLow.why) || cell.why || '取链失败';
        say(cell.why);
      }
      return Promise.resolve();
    }

    return probeResolveOnce(p, list[i], q).then(function (r) {
      return probeVerify(r.url, q).then(function (v) {
        if (run !== probeRun) return;
        cell.ms = Date.now() - t0;
        cell.via = r.via || '';
        cell.url = r.url;

        if (v === 'ok') {
          cell.st = 'ok';
          cell.why = '';
          repaint();
          return;
        }

        if (v === 'low' || v === 'trial') {
          lastLow = {
            why: v === 'trial' ? '只拿到 30 秒试听，不算完整这一档' : '只拿到有损格式，不是 FLAC',
            via: r.via, url: r.url
          };
          say(lastLow.why + '，换下一首再试');
          return at(i + 1);
        }

        lastAddr = {
          why: v === 'bad' ? '直链能拿到，但返回内容不是音频' : '直链能拿到，没能验证内容',
          via: r.via, url: r.url
        };
        say(lastAddr.why + '，换下一首再试');
        return at(i + 1);
      });
    }, function (e) {
      cell.why = (e && e.message) || String(e);
      return at(i + 1);
    });
  }

  return at(0);
}

function probeCancel() {
  probeRun++;
  probeBusy = false;
  probeMsg = '已取消';
  PROBE_SRC.forEach(function (p) {
    PROBE_Q.forEach(function (q) {
      var c = (probeRes[p] || {})[q];
      if (c && (c.st === 'run' || c.st === 'wait')) c.st = 'na';
    });
  });
  repaint();
}

function probeStart() {
  if (probeBusy) return;
  if (!probeReady()) {
    setStatus('音源脚本还没加载好，先「重载音源」再检测', true);
    probeMsg = '音源脚本没就绪';
    repaint();
    return;
  }

  var only = probeScriptId();
  var onlyRt = null;
  if (only) {
    onlyRt = probeScriptRuntime();
    if (!onlyRt) {
      setStatus('选中的检测音源脚本不在了，请在设置里重新选择', true);
      probeMsg = '检测音源脚本不存在';
      repaint();
      return;
    }
  }

  var run = ++probeRun;
  probeResetRes();
  probeSampleCache = {};
  probeBusy = true;
  probeAt = 0;
  probeNote = '';
  probeMsg = (only ? '只测 ' + probeScriptLabel() + ' · ' : '') + '正在搜索样本歌曲…';
  repaint();

  function step(i) {
    if (run !== probeRun) return Promise.resolve();
    if (i >= PROBE_SRC.length) return Promise.resolve();
    var p = PROBE_SRC[i];

    /* 选中的脚本没声明这个平台 / 没有 musicUrl 动作：整行标成「—」，
       别去要链白等 15 秒 */
    var psrc = onlyRt && onlyRt.sources && onlyRt.sources[p];
    if (onlyRt && (!psrc || (psrc.actions || ['musicUrl']).indexOf('musicUrl') < 0)) {
      PROBE_Q.forEach(function (q) {
        var c = (probeRes[p] || {})[q];
        if (!c) return;
        c.st = 'na';
        c.why = '该脚本没声明支持' + probeName(p);
      });
      probeNote = onlyRt.name + ' 没声明支持' + probeName(p) + '，这一行跳过';
      repaint();
      return step(i + 1);
    }

    probeMsg = '正在检测 ' + (only ? probeScriptLabel() + ' · ' : '') +
               probeName(p) + ' …（' + (i + 1) + '/' + PROBE_SRC.length + '）';
    repaint();

    return probeSamplesOf(p).then(function () {
      if (run !== probeRun) return;
      var queue = PROBE_Q.slice();
      var workers = [];
      /* 同一平台内两档并行：再多就容易触发平台限流，反而把表测花 */
      for (var k = 0; k < Math.min(2, queue.length); k++) {
        workers.push((function loop() {
          if (run !== probeRun) return Promise.resolve();
          var q = queue.shift();
          if (!q) return Promise.resolve();
          return probeOneCell(p, q, run).then(loop);
        })());
      }
      return Promise.all(workers);
    }).then(function () { return step(i + 1); });
  }

  step(0).then(function () {
    if (run !== probeRun) return;
    probeBusy = false;
    probeAt = Date.now();
    probeMsg = '检测完成';
    setStatus('音源音质检测完成' + (only ? '（只测 ' + probeScriptLabel() + '）' : '') +
              '：' + probeSummary());
    repaint();
  });
}

function openProbe() {
  openOverlay('probe', '音源音质检测',
              probeScriptId() ? ('只测：' + probeScriptLabel()) : '全部脚本');
  overlayLoading = false;
  /* 不自动开测：打开时只显示上次结果（或空表），由用户点「开始检测」触发 */
  repaint();
}

/* 设置面板里的「检测音源」选择框：用宿主弹出菜单（和顶栏音源下拉同款）。
   只列已就绪的脚本，并标出它声明支持哪些平台；空 = 全部脚本。 */
function openProbeScriptMenu(x, y) {
  var list = scriptRuntimes();
  var cur = probeScriptId();
  var m = window.CreatePopupMenu();
  var ids = {};
  var next = 100;

  m.AppendMenuItem(MF_STRING | (cur ? 0 : MF_CHECKED), 1, '全部脚本（按加载顺序）');
  m.AppendMenuSeparator();

  for (var i = 0; i < list.length; i++) {
    var rt = list[i];
    var sup = [];
    PROBE_SRC.forEach(function (p) {
      var s = rt.sources && rt.sources[p];
      if (s && (s.actions || ['musicUrl']).indexOf('musicUrl') >= 0) {
        sup.push(probeName(p));
      }
    });
    var label = scriptName(rt);
    label += sup.length ? ('（' + sup.join('/') + '）') : '（没有可检测的平台）';
    m.AppendMenuItem(MF_STRING | (sup.length ? 0 : MF_GRAYED) |
                     (rt.id === cur ? MF_CHECKED : 0), next, label);
    if (sup.length) ids[next] = rt.id;
    next++;
  }
  if (!list.length) m.AppendMenuItem(MF_GRAYED, 2, '还没有加载到音源脚本');

  m.AppendMenuSeparator();
  m.AppendMenuItem(MF_STRING, 3, '重新加载音源脚本');
  m.AppendMenuItem(MF_STRING, 4, '打开音源脚本目录…');

  var sel = m.TrackPopupMenu(x, y);
  if (!sel) return;
  if (sel === 1) { setProbeScript(''); return; }
  if (ids[sel]) { setProbeScript(ids[sel]); return; }
  if (sel === 3) { reloadSources('音源脚本已重新加载'); repaint(); return; }
  if (sel === 4) { openScriptDirAction(); return; }
}

var PROBE_LEGEND_H = 16;
var PROBE_PICK_H = 28;             /* 表格上方「检测音源」选择框 */
var PROBE_PICK_GAP = 8;

function probeLegendLines() {
  return [
    '可用 = 拿到直链，且文件头与这一档相符',
    '仅地址 = 有链接，但内容不是音频 / 没能验证',
    '失败 = 这一档没取到　　— = 脚本没声明这一档'
  ];
}

/* 说明那一行：有失败就显示最近一条原因，否则写样本口径。
   折成最多两行 —— 换成一句长话，窄面板会直接裁掉后半截。 */
function probeNoteLines(width) {
  var scope = probeScriptId() ? ('只测脚本：' + probeScriptLabel() + '。') : '';
  var text = probeNote
    ? '最近一条：' + probeNote
    : (scope + '样本：每个平台搜「' + PROBE_KEYWORD + '」取前 24 首，每档最多试 ' +
       PROBE_SAMPLES + ' 首；只代表样本，不代表所有歌都能出这一档。');
  var out = [];
  wrapInto(out, text, Math.max(120, width), FONT_BASE - 2, 'dim');
  return out.slice(0, 2);
}

/* 表格几何：绘制与点击共用这一份 */
function probeGeom() {
  var r = L.overlay;
  if (!r) return null;
  var x0 = r.x + 16;
  var w = Math.max(180, r.w - 32);
  var nameW = Math.max(56, Math.min(92, Math.round(w * 0.22)));
  /* 列宽给个上限：4K 面板上三列各拉 260px，字飘在中间反而看不清 */
  var colW = Math.max(60, Math.min(132, Math.floor((w - nameW) / PROBE_Q.length)));
  var tw = nameW + colW * PROBE_Q.length;
  var headRowH = 24;
  var rowH = Math.max(22, Math.min(34, Math.round((FONT_BASE + 10) * 1.7)));
  var top0 = overlayTopY();
  var pickH = PROBE_PICK_H;
  var tableH = headRowH + PROBE_SRC.length * rowH;
  var legendH = probeLegendLines().length * PROBE_LEGEND_H;
  var noteH = probeNoteLines(w).length * PROBE_LEGEND_H;
  /* 内容比浮层矮时往下让一点（最多 56px）：表格贴着标题条、下面空一大截，
     会像是没画完。算完再夹住，面板矮的时候仍然从头排。 */
  var naturalBtn = top0 + pickH + PROBE_PICK_GAP + tableH + 10 + legendH + 6 + noteH + 10;
  /* 按钮区：开始检测 28 + 间隔 6 + 停止检测 28 */
  var oy = Math.max(0, Math.min(36, Math.floor((r.y + r.h - 8 - (naturalBtn + 28 + 6 + 28)) / 2)));
  var pickY = top0 + oy;
  var top = pickY + pickH + PROBE_PICK_GAP;
  var legendY = top + tableH + 10;
  var btnY = legendY + legendH + 6 + noteH + 10;
  return { x0: x0, w: w, tw: tw, nameW: nameW, colW: colW, headRowH: headRowH,
           rowH: rowH, pickY: pickY, pickH: pickH, top: top, tableH: tableH,
           legendY: legendY, legendH: legendH, noteH: noteH, btnY: btnY };
}

function probeAgainRect() {
  var g = probeGeom();
  if (!g) return null;
  return { x: g.x0, y: g.btnY, w: 96, h: 28 };
}

/* 「开始检测」下面那颗「停止检测」：只有检测进行中才可点 */
function probeStopRect() {
  var g = probeGeom();
  if (!g) return null;
  return { x: g.x0, y: g.btnY + 34, w: 96, h: 28 };
}

/* 表格上方的「检测音源」选择框：宽度与下面的表格严格对齐 */
function probePickRect() {
  var g = probeGeom();
  if (!g) return null;
  return { x: g.x0, y: g.pickY, w: g.tw, h: g.pickH };
}

function showComments() {
  var track = targetTrack();
  if (!track || (!track.title && !track.artist)) {
    setStatus('没有正在播放的曲目，先播一首再点「评论」', true);
    return;
  }
  openOverlay('comments', '歌曲评论', docBase(track) + ' · 网易云');
  setStatus('正在取网易云评论：' + docBase(track) + ' …');

  var file = '';
  var dir = cacheSubDir('review');
  if (dir) file = dir + '\\' + docBase(track) + '.json';

  var cached = readCacheJson(file, COMMENT_TTL);
  if (cached && cached.items && cached.items.length) {
    overlayLoading = false;
    overlayItems = cached.items;
    overlaySubject = docBase(track) + ' · 网易云 · 缓存 ' + commentTimeText(cached.at);
    rebuildOverlayLines(true);
    setStatus('评论（缓存）：' + cached.items.length + ' 条');
    repaint();
    return;
  }

  withTimeout(NM.providers.comments(track), 25000, '取评论').then(function (items) {
    overlayLoading = false;
    overlayItems = items || [];
    writeCacheJson(file, { at: Date.now(), items: overlayItems });
    overlaySubject = docBase(track) + ' · 网易云';
    rebuildOverlayLines(true);
    setStatus('评论：' + overlayItems.length + ' 条');
    repaint();
  }, function (e) {
    overlayLoading = false;
    overlayError = '取网易云评论失败：' + ((e && e.message) || e);
    rebuildOverlayLines(true);
    setStatus(overlayError, true);
    repaint();
  });
}

function commentTimeText(t) {
  if (!t) return '未知时间';
  try {
    var d = new Date(Number(t));
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() + ' ' +
           d.getHours() + ':' + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
  } catch (e) {
    return '未知时间';
  }
}

/* 歌手图片地址：网易云 CDN 支持 ?param=600y600 直接给 600×600，
   省得下一张两三千像素的原图再自己缩（v1.9.21） */
function artistPicUrl(url) {
  var u = String(url || '').trim();
  if (!u) return '';
  if (u.indexOf('//') === 0) u = 'https:' + u;
  if (!/music\.126\.net/i.test(u)) return u;
  u = u.split('?')[0];
  return u + '?param=600y600';
}

/* 缓存里精简一条 track：raw（网易云原始 json）动辄几 KB，50 首就是上百 KB，
   而点播只需要 id / albumId 这几个字段（buildMusicInfo 自己会补） */
function slimTrack(t) {
  return {
    uid: t.uid, source: t.source, id: t.id, songmid: t.songmid, mediaMid: t.mediaMid,
    albumId: t.albumId, hash: t.hash, rid: t.rid,
    title: t.title, artist: t.artist, album: t.album,
    duration: t.duration, pic: t.pic, types: t.types || {}
  };
}

/* 歌手图片：本地有文件才读，读一次缓存住（bioPic）。
   以前这里只下载、从来没人加载 —— 这就是「歌手图片不显示」的原因。 */
function loadBioPic(file, who) {
  bioPicPath = file || '';
  if (!file || !fileReady(file)) return false;
  if (bioPic && bioPicFor === who) return true;
  disposeObj(bioPic);
  bioPic = loadImageFile(file);
  bioPicFor = bioPic ? who : '';
  return !!bioPic;
}

/* 热门歌曲：先看本地缓存，没有再用歌手 ID 补取一次。
   total 是歌手一共有多少首（网易云的 musicSize），用来显示「15 / 84」并决定还能不能「加载全部」 */
function loadBioSongs(name, id, fromInfo, songsFile, total) {
  var cached = readCacheJson(songsFile, BIO_TTL);
  if (cached && cached.tracks && cached.tracks.length) {
    bioTracks = cached.tracks;
    bioTotal = Number(cached.total) || bioTracks.length;
    bioId = Number(cached.id) || Number(id) || 0;
    return true;
  }
  if (fromInfo && fromInfo.length) {
    bioTracks = fromInfo;
    bioTotal = Math.max(Number(total) || 0, fromInfo.length);
    writeCacheJson(songsFile, {
      at: Date.now(), id: bioId || 0, total: bioTotal,
      tracks: fromInfo.map(slimTrack)
    });
    return true;
  }
  /* 资料里没带 / 缓存里没有：按歌手 ID 单独取 */
  if (!id) return false;
  bioId = Number(id) || 0;
  withTimeout(NM.providers.artistHotSongs(id, 50), 20000, '取热门歌曲').then(function (list) {
    if (overlay !== 'bio') return;
    bioTracks = list || [];
    bioTotal = Math.max(Number(total) || 0, bioTracks.length);
    writeCacheJson(songsFile, {
      at: Date.now(), id: bioId, total: bioTotal,
      tracks: bioTracks.map(slimTrack)
    });
    rebuildOverlayLines(true);
    repaint();
  }, function (e) {
    NM.lx.pushLog('warn', '取热门歌曲失败（' + name + '）：' + ((e && e.message) || e));
  });
  return false;
}

/* 歌手图片下载：先写 .part 再改名，成功立刻读进 bioPic 并重绘 */
function downloadBioPic(pic, picFile, name) {
  if (!pic || !picFile || fileReady(picFile) || bioPicLoading) return;
  var part = picFile + '.part';
  bioPicLoading = true;
  repaint();                                  /* 立刻把「正在取歌手图片…」显示出来 */
  NM.lx.download(safeUrl(pic), part).then(function () {
    bioPicLoading = false;
    var ok = false;
    try { ok = utils.RenamePath(part, picFile); } catch (e) {}
    if (!ok) { try { utils.RemovePath(part); } catch (e2) {} }
    if (ok && overlay === 'bio') {
      loadBioPic(picFile, name);
      repaint();
    }
  }, function () {
    bioPicLoading = false;
    try { utils.RemovePath(part); } catch (e) {}
    NM.lx.pushLog('warn', '歌手图片下载失败：' + name);
  });
}

/* 老缓存补全：v1.9.20 及更早只存了 bio\歌手.txt，没有 songs.json、也可能没图。
   正文先用本地缓存立刻显示，歌单与图片在后台补 —— 界面不空着等网络。 */
function ensureBioRemote(name, picFile, songsFile) {
  withTimeout(NM.providers.artistInfo(name), 25000, '取艺人资料').then(function (info) {
    if (overlay !== 'bio') return;
    bioId = Number((info && info.id) || 0) || bioId;
    loadBioSongs(name, bioId, (info && info.tracks) || null, songsFile, info && info.songs);
    if (!bioPic) downloadBioPic(artistPicUrl(info && info.pic), picFile, name);
    setStatus('艺人介绍：' + name);
    rebuildOverlayLines(true);
    repaint();
  }, function () {
    setStatus('艺人介绍（缓存）：' + name);
  });
}

function showBio() {
  var track = targetTrack();
  var name = String((track && track.artist) || '').trim();
  if (!name) {
    setStatus('不知道歌手是谁，先播一首再点「艺人」', true);
    return;
  }
  openOverlay('bio', '艺人介绍', name + ' · 网易云');
  setStatus('正在取网易云艺人资料：' + name + ' …');

  /* 换了位歌手：上一张图必须丢掉，否则新歌手没图时会显示成上一位的照片 */
  if (bioPic && bioPicFor !== name) {
    disposeObj(bioPic);
    bioPic = null;
    bioPicFor = '';
  }

  var safeArtist = cleanName(name, 40) || '未知歌手';
  var bioDir = cacheSubDir('bio');
  var artDir = cacheSubDir('artist');
  var bioFile = bioDir ? bioDir + '\\' + safeArtist + '.txt' : '';
  var picFile = artDir ? artDir + '\\' + safeArtist + '.jpg' : '';
  var songsFile = artDir ? artDir + '\\' + safeArtist + '.songs.json' : '';
  bioSongsFile = songsFile;

  var cached = readCacheText(bioFile, BIO_TTL);
  if (cached && cached.trim()) {
    overlayLoading = false;
    overlayText = cached;
    overlaySubject = name + ' · 网易云 · 缓存';
    loadBioPic(picFile, name);                  /* 图片可能上一轮已经下好了 */
    /* 歌单：缓存命中就直接排；没有（老版本只存了 txt）就后台补一次 */
    if (!loadBioSongs(name, 0, null, songsFile)) ensureBioRemote(name, picFile, songsFile);
    rebuildOverlayLines(true);
    setStatus('艺人介绍（缓存）：' + name);
    repaint();
    return;
  }

  withTimeout(NM.providers.artistInfo(name), 25000, '取艺人资料').then(function (info) {
    overlayLoading = false;
    var text = formatBio(info);
    overlayText = text;
    writeCacheText(bioFile, text);
    overlaySubject = String((info && info.name) || name) + ' · 网易云';
    setStatus('艺人介绍：' + overlaySubject);

    bioId = Number((info && info.id) || 0) || bioId;
    downloadBioPic(artistPicUrl(info && info.pic), picFile, name);
    loadBioSongs(name, bioId, (info && info.tracks) || null, songsFile, info && info.songs);
    rebuildOverlayLines(true);
    repaint();
  }, function (e) {
    overlayLoading = false;
    overlayError = '取网易云艺人资料失败：' + ((e && e.message) || e);
    rebuildOverlayLines(true);
    setStatus(overlayError, true);
    repaint();
  });
}

function formatBio(info) {
  if (!info) return '';
  var out = [];
  out.push(String(info.name || overlaySubject || ''));
  var meta = [];
  if (info.songs) meta.push('单曲 ' + info.songs);
  if (info.albums) meta.push('专辑 ' + info.albums);
  if (meta.length) out.push(meta.join(' · '));
  out.push('');
  if (info.brief) { out.push(String(info.brief)); out.push(''); }
  (info.sections || []).forEach(function (s) {
    if (s && s.text) {
      if (s.title) out.push('【' + s.title + '】');
      out.push(String(s.text));
      out.push('');
    }
  });
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}
/* --------------------------------------------------------------------------
   命中测试
   -------------------------------------------------------------------------- */
function inRect(r, x, y) {
  return !!r && x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h;
}

/* 音源行：与标签行同一列网格。第二排藏起来时返回 null：绘制和命中一起撤掉 */
function platformRect(i) {
  if (hidePlatformRow) return null;
  var g = headGrid();
  return { x: g.x + i * (g.w + g.gap), y: 36, w: g.w, h: hdRow2H() };
}

/* 换平台：清列表、重拉当前页（点平台按钮 和 设置里锁定平台 共用这一段） */
function switchPlatform(p) {
  p = platformKnown(p);
  if (platform === p) return;
  platform = p;
  boardIndex = 0;
  refreshBoards();
  tracks = [];
  trackTitle = '';
  selected = -1;
  trackScroll = 0;
  if (tab === 0) loadBoard();
  else if (tab === 1 && searchKeyword) openSearchAgain();
  else if (tab === 1) loadHot(true);            /* 无关键词：热门推荐要换成新平台的榜 */
  else if (isBrowseTab()) {
    if (collMode === 'search' && collKeyword) runBrowseSearch();
    else loadRecommend(false);
  }
  repaint();
}

/* 按「显示 / 隐藏第二排」重新定平台：藏起来用固定平台，露出来回到上次点的那个。
   顶栏高度在两行 / 一行之间切换，所以这里要重算布局（不只是 repaint）。 */
function applyPlatformMode() {
  HEAD_H = headHeight();
  syncPanelSize();
  computeLayout();
  if (hidePlatformRow) {
    switchPlatform(fixedPlatform);
  } else {
    var back = String(window.GetProperty('lx.platform', '') || '');
    switchPlatform(back || platform);
  }
  repaint();
}

/* 音质下拉：宽按统一字号放大（12px 字号下 96px） */
function qualityBarW() {
  var k = clamp((FONT_BASE || 12) / 12, 1, 1.6);
  return Math.round(96 * k);
}

/* --------------------------------------------------------------------------
   顶栏右侧：两行三列，上下对齐
   --------------------------------------------------------------------------
     第一行   [人物] | 音源：自动 ……………………▾
     第二行   [气泡] | 音质 320K ▾ | 设置

   列 1 是两个只放图标的按钮（上面人物 = 艺人介绍，下面气泡 = 歌曲评论），
   两行同 x 同宽，上下正对；
   列 2（音源 / 音质）左端同 x —— 音源那格更长，往右吃掉设置上方的空白；
   列 3 只有第二行有（设置），右端贴 W - PAD，永远是最后被挤掉的。
   几何全部从右往左算：设置 → 音质 → 气泡 → 人物 → 音源，
   每一格都不依赖 headGrid，所以页签那套网格可以放心调用它们。
   -------------------------------------------------------------------------- */
var HB_GAP = 6;                /* 格与格之间的间距 */
var SET_W = 50;                /* 设置（保留文字：两个字，换成图标反而更难认） */

/* 第二排收起（设置 → 外观 → 第二排音源平台 = 隐藏）后，顶栏只剩一行：
   版本号、平台按钮、音源下拉、音质下拉全撤掉，气泡和设置挪到「人物」右边，
   一排放 [人物][气泡][设置]。所有几何都从这里分流，别处不用再判断。 */
function headCompact() { return hidePlatformRow; }
function headBtnY() { return headCompact() ? 8 : 36; }
function headBtnH() { return headCompact() ? hdRow1H() : hdRow2H(); }

/* 顶栏总高：正常两行（平台 / 音质 / 版本号），12px 时 62；
   第二排收起后只剩一行，收到 40，下面内容整体上移 22px */
function headHeight() {
  return headCompact() ? Math.max(40, 8 + hdRow1H() + 6)
                       : Math.max(62, 36 + hdRow2H() + 2);
}

/* 图标按钮（艺人介绍 / 歌曲评论）：不放四个字了，只放一个 14px 图标，
   宽度从 68 收到 30 —— 左边那排页签和右上角的音源下拉都松一口气。
   跟着字号缩放，免得大字号下按钮比图标还小。 */
function iconBtnW() {
  var k = clamp((FONT_BASE || 12) / 12, 1, 1.5);
  return Math.round(30 * k);
}

/* 设置：第二行最右，常驻 */
function settingsRect() {
  var w = Math.min(SET_W, Math.max(0, W - PAD));
  return { x: W - PAD - w, y: headBtnY(), w: w, h: headBtnH() };
}

/* 音质：第二行，设置左边。紧凑模式整格撤掉（返回 null，绘制和命中一起消失） */
function qualityRect() {
  if (headCompact()) return null;
  var s = settingsRect();
  var w = qualityBarW();
  return { x: s.x - HB_GAP - w, y: 36, w: w, h: hdRow2H() };
}

/* 歌曲评论：正常模式在第二行音质左边；紧凑模式跟到第一行设置的左边 */
function commentsRect() {
  var w = iconBtnW();
  var x = headCompact() ? (settingsRect().x - HB_GAP - w)
                        : (qualityRect().x - HB_GAP - w);
  return { x: x, y: headBtnY(), w: w, h: headBtnH() };
}

/* 艺人介绍：第一行。正常模式与「歌曲评论」同一列（同 x 同宽）；
   紧凑模式排到气泡左边，三个按钮一溜在第一行右端 */
function bioRect() {
  var c = commentsRect();
  var x = headCompact() ? (c.x - HB_GAP - iconBtnW()) : c.x;
  return { x: x, y: 8, w: iconBtnW(), h: hdRow1H() };
}

/* 顶栏按钮元数据：label 给人看（菜单 / 日志 / 辅助文字用），
   icon 非空就画图标不写字，几何在各自的 xxxRect() 里。
   两个图标按钮一上一下同一列：上面「人物」= 艺人介绍，下面「气泡」= 歌曲评论。 */
var HEAD_BTNS = [
  { key: 'settings', label: '设置', icon: '' },
  { key: 'comments', label: '歌曲评论', icon: 'chat' },
  { key: 'bio', label: '艺人介绍', icon: 'user' }
];

function headerButtonRect(key) {
  if (key === 'settings') return settingsRect();
  if (key === 'comments') return commentsRect();
  if (key === 'bio') return bioRect();
  return null;
}

/* 挤不下就隐藏：设置常驻（再窄也要能点到），其余以页签右端为界 */
function headerButtonVisible(key) {
  var r = headerButtonRect(key);
  if (!r) return false;
  if (key === 'settings') return r.x >= PAD;
  return r.x >= tabsEnd() + 8;
}

/* 按钮里那个图标的方框：正方形，在按钮里居中 */
function iconRect(b) {
  var s = iconSize();
  return { x: b.x + Math.round((b.w - s) / 2),
           y: b.y + Math.round((b.h - s) / 2),
           w: s, h: s };
}

/* 图标边长：14px（12px 字号）到 21px（18px 字号）。第二行按钮只有 22px 高，
   再大就顶到边框了。 */
function iconSize() {
  return clamp(Math.round((FONT_BASE || 12) * 1.2), 14, 21);
}

/* 左上角标志下面那一格：原来放「导入音源」按钮，现在显示 Lxbox 版本号。
   名字保留 importRect()（标志图 brandRect 与它共用同一个竖列），几何没变。
   导入音源仍在：设置 → 维护 → 导入音源…，或者右键菜单里的同名项。 */
function importRect() {
  return { x: 12, y: 36, w: brandW(), h: hdRow2H() };
}

/* 版本号：窗口够宽写「Lxbox v2.0.1」，窄了只留「v2.0.1」——
   GDI 没有省略号兜底，先量一遍再决定用哪一串，免得被裁成半截。 */
function drawVersionTag(gr) {
  if (headCompact()) return;          /* 第二排收起时不画版本号，那一格整个没了 */
  var r = importRect();
  if (W < 220 || r.w < 30 || r.h < 10) return;
  var full = 'Lxbox v' + APP_VERSION;
  var text = textWidth(gr, full, F.small, FONT_BASE) <= r.w - 4 ? full : ('v' + APP_VERSION);
  gr.GdiDrawText(text, F.small, C.dim, r.x, r.y, r.w, r.h, FLAG_CENTER);
}

function boardAt(x, y) {
  if (tab !== 0 || sideCollapsed) return -1;
  if (x < L.board.x || x >= L.board.x + L.board.w) return -1;
  if (y < L.boardListY || y >= L.boardListY + L.boardListH) return -1;
  var i = boardScroll + Math.floor((y - L.boardListY) / BOARD_ROW_H);
  return i >= 0 && i < boards.length ? i : -1;
}

function collAt(x, y) {
  if (!isBrowseTab() || sideCollapsed) return -1;
  if (x < L.board.x || x >= L.board.x + L.board.w) return -1;
  if (y < L.boardListY || y >= L.boardListY + L.boardListH) return -1;
  var i = collScroll + Math.floor((y - L.boardListY) / BOARD_ROW_H);
  return i >= 0 && i < collItems.length ? i : -1;
}

function trackAt(x, y) {
  if (!inRect(L.track, x, y)) return -1;
  var n = trackColCount();
  var row = trackScroll + Math.floor((y - L.track.y) / rowH());
  var col = 0;
  if (n > 1) {
    var cw = Math.max(1, Math.floor(L.track.w / n));
    col = Math.floor((x - L.track.x) / cw);
    if (col > n - 1) col = n - 1;
    if (col < 0) col = 0;
  }
  var i = row * n + col;
  return i >= 0 && i < tracks.length ? i : -1;
}

function rowButtonRects(i) {
  var rh = rowH();
  var cr = trackColRect(trackColOf(i));
  var ry = L.track.y + (trackRowOf(i) - trackScroll) * rh;
  var bh = 22;
  var by = ry + Math.round((rh - bh) / 2);
  return {
    play: { x: cr.x + cr.w - 96, y: by, w: 42, h: bh },
    queue: { x: cr.x + cr.w - 50, y: by, w: 42, h: bh }
  };
}

function buttonAt(x, y) {
  var i = trackAt(x, y);
  if (i < 0) return '';
  var r = rowButtonRects(i);
  if (inRect(r.play, x, y)) return 'play';
  if (inRect(r.queue, x, y)) return 'queue';
  return '';
}

function overlayCloseRect() {
  var r = L.overlay;
  if (!r) return null;
  /* 有标题条的（诊断日志）落在标题条最右；没标题条的（艺人介绍、歌曲评论）
     落在正文区右上角 */
  if (overlayHeadH(r) > 0) return { x: r.x + r.w - 34, y: r.y + 4, w: 28, h: 26 };
  return { x: r.x + r.w - 34, y: r.y + 4, w: 24, h: 24 };
}

function ensureVisible() {
  if (selected < 0) return;
  var vis = visTrackRows();
  var row = trackRowOf(selected);
  if (row < trackScroll) trackScroll = row;
  if (row >= trackScroll + vis) trackScroll = row - vis + 1;
  clampScroll();
}

/* 音质：必须走 setProp —— 设置面板的布局缓存靠 setProp 递增版本号失效，
   直接 window.SetProperty 的话「音质」那排分段按钮点了不会换高亮
   （值其实改了，取链也用新音质，就是面板上不亮，看着像失效）。
   顶栏音质下拉、设置面板的分段按钮都走这里。 */
function setQuality(q) {
  quality = q;
  setProp('lx.quality', quality);
  setStatus('音质：' + (QUALITY_LABEL[quality] || quality));
}

/* --------------------------------------------------------------------------
   文字排版（GDI 没有直接暴露测量接口时用估算兜底）
   -------------------------------------------------------------------------- */
function estimateTextWidth(text, size) {
  var s = String(text == null ? '' : text);
  var w = 0;
  for (var i = 0; i < s.length; i++) {
    var c = s.charCodeAt(i);
    w += (c > 0x2E80) ? (size || FONT_BASE) : (size || FONT_BASE) * 0.55;
  }
  return w;
}

/* 用 DT_CALCRECT 让 GDI 自己算宽度；某些组件版本会返回 undefined，就退回估算 */
function textWidth(gr, text, font, size) {
  if (gr) {
    try {
      var r = gr.GdiDrawText(String(text == null ? '' : text), font, 0xFF000000, 0, 0, 0, 0,
                             DT_SINGLELINE | DT_NOPREFIX | DT_CALCRECT);
      if (r && r.length >= 3 && (r[2] - r[0]) > 0) return r[2] - r[0];
    } catch (e) {}
  }
  return estimateTextWidth(text, size || FONT_BASE);
}

function wrapInto(out, text, width, size, cls) {
  var s = String(text == null ? '' : text).replace(/\r/g, '');
  var base = size || FONT_BASE;
  var line = '';
  var w = 0;                     /* 当前行已经占多宽：增量累加，不再每加一个字重头量 */

  for (var i = 0; i < s.length; i++) {
    var ch = s.charAt(i);
    if (ch === '\n') {
      out.push({ t: line, c: cls });
      line = ''; w = 0;
      continue;
    }
    /* 和 estimateTextWidth 同一套估算口径：中日韩按字宽，其余按 0.55 字宽 */
    w += (ch.charCodeAt(0) > 0x2E80) ? base : base * 0.55;
    line += ch;
    if (w > width) {
      out.push({ t: line, c: cls });
      line = ''; w = 0;
    }
  }
  out.push({ t: line, c: cls });
}

function visOverlayLines() {
  var r = L.overlay;
  if (!r) return 0;
  return Math.max(1, Math.floor((overlayBottomY() - overlayTopY()) / overlayLineH()));
}

/* --------------------------------------------------------------------------
   评论浮层：宽度够就排两列（v1.9.19）
   --------------------------------------------------------------------------
   单列铺满 1000px 宽时，一行能塞下 80 个字，读起来要来回甩头；而评论本身是
   「一条一块」的短文本，天然适合并排。所以跟曲目清单一个思路 —— 宽度自己长
   出来就变两列，窄回去又变一列，不需要任何开关。

   两列不是把行数组对半切（那样一条评论会被劈到两列里），而是先把每条评论排成
   一个「块」，再挑一个高度最接近对半的切点，整块搬过去。
   -------------------------------------------------------------------------- */
var OVERLAY_COL_MIN_W = 700;   /* 两列所需的最小正文宽：760 宽面板正好两列各 ~350 */

function overlayColCount() {
  if (overlay !== 'comments') return 1;      /* 艺人介绍 / 日志是长文，仍单列 */
  var w = (L.overlay ? L.overlay.w : W) - 34;     /* 左 16 + 右 18（滚动条） */
  return w >= OVERLAY_COL_MIN_W ? 2 : 1;
}

/* 列几何：x0 = 第一列左边，colW = 单列文字宽，gap = 列间距 */
function overlayColGeom() {
  var r = L.overlay || { x: 0, w: W, h: 0 };
  var avail = Math.max(60, r.w - 34);
  var n = overlayColCount();
  if (n < 2) return { n: 1, x0: r.x + 16, colW: avail, gap: 0 };
  var gap = 18;
  return { n: 2, x0: r.x + 16, colW: Math.max(80, Math.floor((avail - gap) / 2)), gap: gap };
}

/* --------------------------------------------------------------------------
   艺人介绍浮层：三分区（v1.9.21）
   --------------------------------------------------------------------------
   以前艺人介绍就是一整段长文铺满浮层，左边那一大片空白全浪费了。现在拆成：

     ┌──────────────────────────┬─────────────────────────┐
     │  歌手图片（正方形，≤600） │                         │
     ├──────────────────────────┤   介绍正文（可滚动）    │
     │  热门歌曲 15 首 + 更多…   │                         │
     └──────────────────────────┴─────────────────────────┘

   图片按「上限 600×600、空间不够就等比缩」处理：600 是给大面板 / 4K 用的，
   600 宽面板（默认尺寸）里硬画 600 的图会把歌单挤没。
   面板太窄或太矮（< 520 宽 / < 210 高）时退回旧版单栏长文 —— 两个 200px 的
   窄条比一段通栏长文更难读。
   -------------------------------------------------------------------------- */
var BIO_PIC_MAX = 600;        /* 图片显示范围上限：600×600 正方形 */
var BIO_ROW_H = 22;           /* 歌单行高 */
var BIO_MORE_H = 26;          /* 「更多…」按钮那一行 */
var BIO_LIST_HEAD = 20;       /* 歌单小标题「热门歌曲 15/50」 */
var BIO_GAP = 16;             /* 左右两栏间距 */
var BIO_PAD = 14;             /* 浮层内边距 */

/* 面板够不够放三分区。这一页没有标题条（v1.9.22），扣的只是上下边距 */
function bioSplitOn() {
  var r = L.overlay;
  if (!r) return false;
  return r.w >= 520 && (r.h - 18) >= 210;
}

function bioLayout() {
  var r = L.overlay || { x: 0, y: 0, w: W, h: 0 };
  /* 这一页没有标题条，版面从浮层顶端 10px 处开始（v1.9.22） */
  var top = overlayTopY();
  var bottom = overlayBottomY();
  var h = Math.max(0, bottom - top);
  var availW = Math.max(120, r.w - BIO_PAD * 2);

  if (!bioSplitOn()) {
    return { split: false, x: r.x + BIO_PAD, y: top, w: availW, h: h,
             top: top, bottom: bottom, rightX: r.x + BIO_PAD, rightW: availW, rightH: h };
  }

  /* 左栏占一半，但右侧正文至少留 260px —— 一行只放得下五六个字的正文没法读。
     左栏宽就是图片宽的上限，所以左栏给得宽，图片才可能真的到 600。 */
  var leftWc = Math.round(availW * 0.52);
  var maxLeft = availW - BIO_GAP - 260;
  if (leftWc > maxLeft) leftWc = Math.max(140, maxLeft);
  leftWc = clamp(leftWc, 140, BIO_PIC_MAX);

  /* 图片边长：上限 600、不超过左栏宽、不超过「总高 − 歌单最小高度」。
     歌单下限随高度走：高面板留 8 行，矮面板 4 行（不然图被挤成邮票）。
     小面板里图比栏窄，左栏就跟着收一收，把宽度让给正文。 */
  var minRows = h >= 520 ? 8 : 4;
  var minListH = BIO_LIST_HEAD + BIO_ROW_H * minRows + BIO_MORE_H + 4;
  var side = Math.min(BIO_PIC_MAX, leftWc, h - minListH - 10);
  if (side < 96) side = Math.max(48, Math.min(96, Math.round(h * 0.5)));
  var leftW = clamp(Math.max(side, 220), 140, leftWc);

  return {
    split: true,
    top: top, bottom: bottom,
    leftX: r.x + BIO_PAD, leftW: leftW,
    pic: { x: r.x + BIO_PAD, y: top, w: side, h: side },
    listX: r.x + BIO_PAD,
    listY: top + side + 10,
    listW: leftW,
    rightX: r.x + BIO_PAD + leftW + BIO_GAP,
    rightW: Math.max(140, availW - leftW - BIO_GAP),
    rightY: top,
    rightH: h,
    sepX: Math.round(r.x + BIO_PAD + leftW + BIO_GAP / 2)
  };
}

/* 歌单区：小标题 → 行 → 更多。可见行数按剩余高度算 */
function bioSongVis(g) {
  if (!g || !g.split) return 0;
  var listH = Math.max(0, g.bottom - g.listY);
  return Math.max(0, Math.floor((listH - BIO_LIST_HEAD - BIO_MORE_H - 4) / BIO_ROW_H));
}

/* 歌单里当前实际排到第几首 */
function bioShowCount() {
  return Math.min(bioShow, bioTracks.length);
}

function bioSongClamp(g) {
  var vis = bioSongVis(g);
  var maxS = Math.max(0, bioShowCount() - vis);
  bioSongScroll = clamp(bioSongScroll, 0, maxS);
}

/* 命中：返回歌单行号（-1 = 不在歌单行上） */
function bioSongAt(x, y) {
  if (overlay !== 'bio') return -1;
  var g = bioLayout();
  if (!g.split) return -1;
  var vis = bioSongVis(g);
  var rowsTop = g.listY + BIO_LIST_HEAD;
  if (!vis) return -1;
  if (x < g.listX || x > g.listX + g.listW) return -1;
  if (y < rowsTop || y >= rowsTop + vis * BIO_ROW_H) return -1;
  var idx = bioSongScroll + Math.floor((y - rowsTop) / BIO_ROW_H);
  return idx < bioShowCount() ? idx : -1;
}

/* 「更多…」按钮：本地这 15 首之后还有 —— 或者歌手的歌根本没取完 —— 才画 */
function bioHasMore() {
  if (bioShowCount() < bioTracks.length) return true;
  return !!bioId && bioTotal > bioTracks.length && !bioSongsFull;
}

/* 图片命中区：只有三分区布局里才有图片可点（v2.0.0） */
function bioPicAt(x, y) {
  if (overlay !== 'bio' || !bioSplitOn()) return null;
  var g = bioLayout();
  if (!g.split || !g.pic) return null;
  return inRect(g.pic, x, y) ? g.pic : null;
}

/* 播放 / 暂停。fb.PlayOrPause 在「停止」状态下会接着放列表里的焦点项，正好 */
function togglePlayback() {
  var wasPlaying = false;
  try { wasPlaying = !!fb.IsPlaying; } catch (e) {}
  try {
    fb.PlayOrPause();
    setStatus(wasPlaying ? '已暂停' : '播放');
    return true;
  } catch (e2) {}

  /* 老组件没有 PlayOrPause：退回「有焦点项就播这一项」 */
  try {
    var pl = plman.ActivePlaylist;
    if (pl >= 0 && plman.PlaylistItemCount(pl) > 0) {
      var f = plman.GetPlaylistFocusItemIndex(pl);
      if (f < 0) f = 0;
      plman.SetPlaylistFocusItem(pl, f);
      plman.ExecutePlaylistDefaultAction(pl, f);
      setStatus('播放');
      return true;
    }
  } catch (e3) {}
  setStatus('没有可播放的内容', true);
  return false;
}

/* 本地路径 → file:/// URL。rundll32 的 FileProtocolHandler 只认 URL，不认裸路径；
   顺手把空格 / # / ? 编掉 —— 宿主拼命令行时怎么加引号都不会把参数切碎（v2.0.1 修） */
function toFileUrl(p) {
  var s = String(p == null ? '' : p).replace(/\\/g, '/');
  s = s.replace(/%(?![0-9a-fA-F]{2})/g, '%25')
       .replace(/#/g, '%23')
       .replace(/\?/g, '%3F')
       .replace(/ /g, '%20');
  if (!s) return '';
  if (s.slice(0, 2) === '//') return 'file://' + s.replace(/^\/+/, '');   /* \\srv\share\… */
  if (/^[a-zA-Z]:/.test(s)) return 'file:///' + s;                        /* C:\… */
  return s.charAt(0) === '/' ? 'file://' + s : 'file:///' + s;
}

/* 起一个外部程序。参数一律自己拼干净（不加引号）：宿主不同版本对「含空格参数要不要补引号」
   处理不一致，补过的会被再包一层，反而把路径切开。 */
function runShellOpen(exe, args) {
  try {
    if (typeof utils.RunCmdAsync === 'function') {
      utils.RunCmdAsync(exe, args, '', 1, 8000);
      return true;
    }
  } catch (e) {}
  try {
    if (typeof utils.RunCmd === 'function') { utils.RunCmd(exe, args, '', 1); return true; }
  } catch (e2) {}
  return false;
}

function cleanPath(p) {
  var s = String(p == null ? '' : p).trim();
  s = s.replace(/^["']+|["']+$/g, '').trim();   /* 先 trim 再剥引号：外面裹着空格时引号剥不掉 */
  s = trimDirPath(s);
  /* 盘符根目录（C:\）别被削成 C:，那是「C 盘当前目录」的意思 */
  return /^[a-zA-Z]:$/.test(s) ? s + '\\' : s;
}

/* 用系统默认程序打开一个文件 */
function openFileWithShell(path) {
  var p = cleanPath(path);
  if (!p) return false;
  /* 文件最正的路子是 ShellExecute：系统自己知道该用哪个程序 */
  try {
    if (typeof utils.RunFile === 'function') { utils.RunFile(p); return true; }
  } catch (e) {}
  var url = toFileUrl(p);
  if (url && runShellOpen('rundll32.exe', ['url.dll,FileProtocolHandler', url])) return true;
  if (runShellOpen('explorer.exe', [p])) return true;
  return false;
}

/* 打开一个目录（资源管理器）。
   以前这里直接走 utils.RunFile，目录不存在 / 宿主没实现时既不开窗也不报错，看着就是「点了没反应」。
   现在：先确认目录真的在 → 依次试 file:// URL（无空格，最稳）、explorer.exe、ShellExecute。 */
function openDirWithShell(dir) {
  var p = cleanPath(dir);
  if (!p) return false;
  var isDir = false;
  try { isDir = !!utils.IsDirectory(p); } catch (e) { isDir = false; }
  if (!isDir) return false;
  var url = toFileUrl(p);
  if (url && runShellOpen('rundll32.exe', ['url.dll,FileProtocolHandler', url])) return true;
  if (runShellOpen('explorer.exe', [p])) return true;
  try {
    if (typeof utils.RunFile === 'function') { utils.RunFile(p); return true; }
  } catch (e2) {}
  return false;
}

/* 双击歌手图片：交给系统默认看图程序（v2.0.0） */
function openArtistPic() {
  if (!bioPicPath || !fileReady(bioPicPath)) {
    setStatus('歌手图片还没准备好，稍后再双击', true);
    return;
  }
  if (openFileWithShell(bioPicPath)) setStatus('已打开歌手图片：' + bioPicPath);
  else setStatus('打不开这张图片：' + bioPicPath, true);
}

function bioMoreRect(g) {
  if (!g || !g.split) return null;
  if (!bioHasMore()) return null;
  var vis = bioSongVis(g);
  var y = g.listY + BIO_LIST_HEAD + vis * BIO_ROW_H + 2;
  return { x: g.listX, y: y, w: Math.min(g.listW, 140), h: BIO_MORE_H - 6 };
}

function bioMoreClick() {
  var g = bioLayout();
  if (!g.split) return;
  /* 本地这 15 / 30 首已经全排出来了，但歌手还有歌：再去拉一次完整歌单 */
  if (bioShowCount() >= bioTracks.length && bioTotal > bioTracks.length && !bioSongsFull) {
    loadMoreBioSongs();
    return;
  }
  bioShow = Math.min(bioTracks.length, bioShowCount() + BIO_PAGE);
  bioSongClamp(g);
  setStatus('热门歌曲：显示前 ' + bioShowCount() + ' 首' +
            (bioTotal > bioTracks.length ? '（已取 ' + bioTracks.length + ' / 共 ' + bioTotal + '）' : ''));
  repaint();
}

/* 「更多」把本地这份用完之后：按歌手 ID 拉一次完整歌曲列表（最多 100 首）再合并 */
function loadMoreBioSongs() {
  if (!bioId || bioSongsBusy) return;
  bioSongsBusy = true;
  setStatus('正在取更多热门歌曲…');
  withTimeout(NM.providers.artistSongs(bioId), 20000, '取歌手歌曲').then(function (res) {
    bioSongsBusy = false;
    bioSongsFull = true;
    if (overlay !== 'bio') return;
    var list = (res && res.tracks) || [];
    var seen = Object.create(null);
    bioTracks.forEach(function (t) { seen[t.uid || (t.source + ':' + t.id)] = 1; });
    var add = list.filter(function (t) {
      return t && !seen[t.uid || (t.source + ':' + t.id)];
    });
    if (!add.length) {
      setStatus('网易云只提供到这 ' + bioTracks.length + ' 首');
      repaint();
      return;
    }
    bioTracks = bioTracks.concat(add);
    bioTotal = Math.max(bioTotal, bioTracks.length);
    bioShow = Math.min(bioTracks.length, bioShowCount() + BIO_PAGE);
    writeCacheJson(bioSongsFile, {
      at: Date.now(), id: bioId, total: bioTotal,
      tracks: bioTracks.map(slimTrack)
    });
    bioSongClamp(bioLayout());
    setStatus('热门歌曲：显示前 ' + bioShowCount() + ' 首（已取 ' + bioTracks.length + ' 首）');
    repaint();
  }, function (e) {
    bioSongsBusy = false;
    setStatus('取更多歌曲失败：' + ((e && e.message) || e), true);
    repaint();
  });
}

/* 时长：秒 → m:ss */
function durText(sec) {
  var s = Math.max(0, Math.round(Number(sec) || 0));
  var m = Math.floor(s / 60);
  var r = s - m * 60;
  return m + ':' + (r < 10 ? '0' : '') + r;
}


/* 滚动基数：双列时取最高的那一列。两列共用同一个滚动位置，
   短的那列先到头，下面留白 —— 这比「左列到底再接着流到右列」好实现，看着也稳。 */
function overlayRowCount() {
  var n = 0;
  for (var i = 0; i < overlayCols.length; i++) {
    if (overlayCols[i].length > n) n = overlayCols[i].length;
  }
  return n;
}

/* 评论条目 → 分列。返回 [[第 1 列的行…], [第 2 列的行…]]（单列时只有一项） */
function commentColumns(width, cols) {
  var blocks = [];

  if (overlayError) {
    var err = [];
    wrapInto(err, overlayError, width, FONT_BASE, 'err');
    blocks.push(err);
  } else if (!overlayItems || !overlayItems.length) {
    blocks.push([{ t: overlayLoading ? '正在加载评论…' : '还没有评论', c: 'dim' }]);
  } else {
    overlayItems.forEach(function (c) {
      var ls = [{ t: '@' + (c.user || '匿名') + '    ♥ ' + (c.likes || 0), c: 'head' }];
      wrapInto(ls, String(c.text || ''), width, FONT_BASE, 'text');
      ls.push({ t: '', c: 'text' });        /* 条与条之间留一行 */
      blocks.push(ls);
    });
  }

  var i, k, one = [];
  if (cols < 2 || blocks.length < 2) {
    for (i = 0; i < blocks.length; i++) one = one.concat(blocks[i]);
    return [one];
  }

  /* 挑切点：让两列高度差最小。块只能整块搬，所以是「挑」而不是直接对半分 */
  var total = 0;
  for (i = 0; i < blocks.length; i++) total += blocks[i].length;
  var cut = 1, bestDiff = 1e9, acc = 0;
  for (i = 0; i < blocks.length - 1; i++) {
    acc += blocks[i].length;
    var diff = Math.abs(acc * 2 - total);
    if (diff < bestDiff) { bestDiff = diff; cut = i + 1; }
  }

  var c0 = [], c1 = [];
  for (k = 0; k < cut; k++) c0 = c0.concat(blocks[k]);
  for (k = cut; k < blocks.length; k++) c1 = c1.concat(blocks[k]);
  return [c0, c1];
}

/* 正文排版几何：评论按列、艺人介绍按右栏（三分区）、其余整幅。
   排版与绘制必须走同一份 —— 两处各算一次，宽度一变就对不上。 */
function overlayTextGeom() {
  if (overlay === 'bio') {
    var b = bioLayout();
    var w = Math.max(60, b.split ? b.rightW : b.w);
    return { n: 1, x0: b.split ? b.rightX : b.x, colW: w, gap: 0, bio: b };
  }
  return overlayColGeom();
}

function rebuildOverlayLines(force) {
  /* 音质检测浮层是自绘表格，没有「行数组」这回事 */
  if (overlay === 'probe') { overlayCols = []; return; }
  var g = overlayTextGeom();
  /* 缓存 key 用「列数 + 单列宽」：面板一变宽就重排（也可能顺便从一列变两列） */
  var key = g.n + '|' + g.colW;
  /* 诊断浮层是"实时日志窗口"：日志一直在变，每次重绘都重建 */
  if (overlay === 'logs') force = true;
  if (!force && overlayWrapKey === key) return;
  overlayWrapKey = key;

  var width = Math.max(60, g.colW);

  if (overlay === 'comments') {
    overlayCols = commentColumns(width, g.n);
  } else {
    var out = [];
    if (overlay === 'bio') {
      if (overlayError) out.push({ t: overlayError, c: 'err' });
      else if (!overlayText) {
        out.push({ t: overlayLoading ? '正在加载艺人介绍…' : '没有这位歌手的介绍', c: 'dim' });
      } else {
        String(overlayText).split(/\r?\n/).forEach(function (line) {
          if (!String(line).trim()) { out.push({ t: '', c: 'text' }); return; }
          var head = /^【.*】$/.test(String(line).trim());
          wrapInto(out, line, width, FONT_BASE, head ? 'head' : 'text');
        });
      }
    } else if (overlay === 'logs') {
      buildDiagnosticLines(out, width);
    }
    overlayCols = [out];
  }

  var maxO = Math.max(0, overlayRowCount() - visOverlayLines());
  overlayScroll = clamp(overlayScroll, 0, maxO);
}

/* 诊断浮层正文：环境 → 最近一次失败 → 日志（最新在上） */
function buildDiagnosticLines(out, width) {
  var st = (NM.lx && NM.lx.state) || {};
  var runtimes = st.runtimes || [];
  var usable = runtimes.filter(function (r) { return r.sources; });

  out.push({ t: '【环境】', c: 'head' });
  out.push({ t: '音源脚本目录：' + (st.dir || '（没找到）'), c: st.dir ? 'text' : 'err' });
  out.push({ t: '模块目录：' + (NM.moduleDir || window.GetProperty('lx.moduleDir', '') || '（没找到）'), c: 'text' });
  out.push({ t: '缓存目录：' + (cacheDir() || '（不可用）') + '（音频与索引都在这里）', c: 'text' });
  out.push({
    t: '封面：' + (EMBED_COVER ? '嵌入音频文件（MP3→APIC / FLAC→PICTURE）' : '不嵌入（lx.embedCover=0）') +
       ' ｜ 旁边同名 jpg：' + (PUSH_COVER ? '开' : '关'),
    c: 'text'
  });
  out.push({
    t: '音源脚本：' + usable.length + '/' + runtimes.length + ' 可用' +
       (usable.length ? '（' + usable.map(function (r) {
         return r.name + (r.version ? ' v' + r.version : '');
       }).join('、') + '）' : ''),
    c: usable.length ? 'text' : 'err'
  });
  runtimes.forEach(function (r) {
    if (r.sources) return;
    out.push({ t: '  × ' + r.name + '：' + (r.error || r.status || '未初始化'), c: 'err' });
  });
  if (st.error) out.push({ t: '加载错误：' + st.error, c: 'err' });
  out.push({ t: '', c: 'text' });

  if (lastProblem) {
    out.push({ t: '【最近一次失败】', c: 'head' });
    wrapInto(out, lastProblem, width, FONT_BASE, 'err');
    out.push({ t: '', c: 'text' });
  }

  var logs = (NM.lx && NM.lx.logs) || [];
  out.push({ t: '【日志】最新在上，共 ' + logs.length + ' 条', c: 'head' });
  if (!logs.length) {
    out.push({ t: '还没有日志', c: 'dim' });
    return;
  }
  logs.slice(-100).reverse().forEach(function (l) {
    var d = new Date(l.t || Date.now());
    var hh = ('0' + d.getHours()).slice(-2) + ':' +
             ('0' + d.getMinutes()).slice(-2) + ':' +
             ('0' + d.getSeconds()).slice(-2);
    var tag = l.kind === 'err' ? '错误' : (l.kind === 'warn' ? '警告' : (l.kind === 'ok' ? '成功' : '信息'));
    out.push({ t: hh + ' ' + tag, c: l.kind === 'err' ? 'err' : (l.kind === 'warn' ? 'head' : 'dim') });
    wrapInto(out, String(l.text || ''), width, FONT_BASE, l.kind === 'err' ? 'err' : 'text');
  });
}

/* --------------------------------------------------------------------------
   绘制
   -------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------
   顶栏两个图标按钮
   --------------------------------------------------------------------------
   上「人物」= 艺人介绍，下「气泡」= 歌曲评论。原来各写四个字，一列占 68px，
   页签被挤得只剩三十来像素；换成图标后这一列只要 30px。

   两个图标全部用 FillSolidRect 逐行堆出来，不用 FillEllipse / DrawEllipse：
   宿主 gdi 有没有那两个方法，不同 JSplitter 版本不一样（这一份代码里
   一次都没用过），而 FillSolidRect 一定在。14px 的圆拆成十来行 1px 横线，
   边缘差半格看不出来，缩放后也不会糊。
   颜色跟文字按钮一致：常态 C.text，hover 转 C.accent。
   -------------------------------------------------------------------------- */

/* 实心圆 / 实心椭圆（可以只画中间某一段行）。cx / cy / r 是屏幕坐标，
   ry 省略就是正圆（脑袋那种「上圆下扁」的用得上椭圆） */
function iconEllipse(gr, cx, cy, r, col, yMin, yMax, ry) {
  ry = ry || r;
  var y0 = Math.floor(cy - ry), y1 = Math.ceil(cy + ry);
  if (yMin != null) y0 = Math.max(y0, yMin);
  if (yMax != null) y1 = Math.min(y1, yMax);
  for (var yy = y0; yy <= y1; yy++) {
    var dy = ((yy + 0.5) - cy) / ry;
    var q = 1 - dy * dy;
    if (q <= 0) continue;
    /* 半宽量化到 0.5 格：14px 的框是偶数宽、圆是奇数直径，直接 round
       会让中间那行多出 1px（宽 8 夹在 6 中间，看着像个腰鼓） */
    var hw = Math.round(r * Math.sqrt(q) * 2) / 2;
    if (hw < 1) continue;
    var xa = Math.round(cx - hw), xb = Math.round(cx + hw);
    if (xb - xa < 1) continue;
    gr.FillSolidRect(xa, yy, xb - xa, 1, col);
  }
}

/* 正圆走这条，名字短一点，调用处读着清楚 */
function iconCircle(gr, cx, cy, r, col, yMin, yMax) {
  iconEllipse(gr, cx, cy, r, col, yMin, yMax, r);
}

/* 图标按 14×14 画，实际尺寸 s 等比放大（k 是倍数） */
function drawUserIcon(gr, x, y, s, col) {
  var k = s / 14;
  var cx = x + s / 2;
  /* 脑袋：横向半径 3.6、纵向 3.4，圆心落在 4.5（正好压在像素行中心上）。
     偏一点就长歪：正圆会得到 4 / 6 / 7 / 7 / 7 / 6 / 4（顶上一刀切平），
     纵向压扁一点才是 3 / 6 / 7 / 7 / 7 / 6 / 3 的圆头 */
  iconEllipse(gr, cx, y + 4.5 * k, 3.6 * k, col, null, null, 3.4 * k);
  /* 肩膀：圆心压在图标底边外，只取脑袋下面那一段，出来是半个椭圆。
     从 8.2 行起 —— 正好是脑袋收窄到 3px 的那一行之后。接早了头肩糊成
     一团（像个雪人），接晚了中间空一行（头会浮起来） */
  iconCircle(gr, cx, y + 12.6 * k, 5.4 * k, col,
             Math.round(y + 8.2 * k), Math.round(y + 12.3 * k));
}

function drawChatIcon(gr, x, y, s, col) {
  var k = s / 14;
  var lh = Math.max(1, Math.round(k));
  var rows = 6;
  /* 气泡主体：x 1.5..12.5、y 3..8，首尾两行各内缩一格收圆角 */
  for (var row = 0; row < rows; row++) {
    var inset = (row === 0 || row === rows - 1) ? 1 : 0;
    var bx = Math.round(x + (1.5 + inset) * k);
    var bw = Math.round((11 - inset * 2) * k);
    if (bw < 1) continue;
    gr.FillSolidRect(bx, Math.round(y + (3 + row) * k), bw, lh, col);
  }
  /* 尾巴：贴着底行左端往下两行，一行 4px、一行 2px，斜边就出来了。
     起点跟底行的圆角内缩对齐（2.5 而不是 1.5）—— 差这一格，尾巴和主体
     之间会露出一个台阶，看着像缺角；三行又太高，气泡会长出一个方角 */
  gr.FillSolidRect(Math.round(x + 2.5 * k), Math.round(y + 9 * k), Math.round(4 * k), lh, col);
  gr.FillSolidRect(Math.round(x + 2.5 * k), Math.round(y + 10 * k), Math.round(2 * k), lh, col);
}

function drawButtonIcon(gr, kind, b, col) {
  var ir = iconRect(b);
  if (kind === 'user') drawUserIcon(gr, ir.x, ir.y, ir.w, col);
  else if (kind === 'chat') drawChatIcon(gr, ir.x, ir.y, ir.w, col);
}

function drawHeaderButtons(gr) {
  for (var i = 0; i < HEAD_BTNS.length; i++) {
    var btn = HEAD_BTNS[i];
    if (!headerButtonVisible(btn.key)) continue;
    var b = headerButtonRect(btn.key);
    var hot = hoverOn(b);
    gr.FillSolidRect(b.x, b.y, b.w, b.h, hot ? tint(C.btnHot, BG_A.btnHot) : tint(C.btn, BG_A.btn));
    gr.DrawRect(b.x + 0.5, b.y + 0.5, b.w - 1, b.h - 1, 1, A(C.line, hot ? 235 : 190));
    if (btn.icon) {
      drawButtonIcon(gr, btn.icon, b, hot ? C.accent : C.text);
    } else {
      gr.GdiDrawText(btn.label, F.hdr, hot ? C.accent : C.text,
                     b.x, b.y, b.w, b.h, FLAG_CENTER);
    }
  }
}

/* --------------------------------------------------------------------------
   左上角标志
   --------------------------------------------------------------------------
   原来是「网络音乐」四个字。现在贴一张 LXbox 标志图（lxbox-logo.png，和
   main.js 同目录），它由 Lxbox.svg 转出来：800×400 的横版标志，转成
   256×128 的 PNG —— 26px 高要用到 300% 缩放场景，留了 4 倍余量。

   JSplitter 的 gdi 不认识 SVG，所以只能预转位图；图找不到就退回原来的
   四个字，不会因为少一个 png 就空白。圆角矩形底本身带深蓝到青的渐变，
   贴在深色 / 浅色面板上都成立，不做主题反色。

   尺寸：标志是 2:1，顶栏第一行只有 26px（hdRow1H() 的取值恒为 26：
   max(26, FONT_BASE + 8) 在 9~18px 字号下都取不到更大的值），
   所以贴出来固定是 52×26，在 brandW() 的列里居中。
   -------------------------------------------------------------------------- */
var BRAND = '网络音乐';        /* 找不到标志图时的回退文字 */
var BRAND_ASPECT = 2;          /* 800 × 400 */

var brandLogo = null;          /* gdi.Image，只加载一次 */
var brandLogoChecked = false;

/* 标志与下面的版本号共用同一个竖列：同 x、同宽，各自居中。
   纵向：第一行页签是 y 8..34（文字居中在 21），标志原来贴着 y 6，比页签
   高 2px；而它是一块填满的深色圆角矩形，比旁边几个字重得多，看上去就往上
   飘。往下压 4px（y 10..36）之后，标志整个落在第一行的范围内、底边正好抵
   住第二行的顶线，和右边那排按钮、下面那行版本号才像一个整体。 */
var BRAND_DROP = 4;
function brandRect() {
  var ir = importRect();
  var y = headCompact() ? Math.round((HEAD_H - hdRow1H()) / 2) : 6 + BRAND_DROP;
  return { x: ir.x, y: y, w: ir.w, h: hdRow1H() };
}

function brandLogoRect(r) {
  var h = Math.max(6, r.h);
  var w = Math.round(h * BRAND_ASPECT);
  if (w > r.w) { w = Math.max(6, r.w); h = Math.round(w / BRAND_ASPECT); }
  return {
    x: r.x + Math.round((r.w - w) / 2),
    y: r.y + Math.round((r.h - h) / 2),
    w: w, h: h
  };
}

/* 图跟着模块目录走；目录被改名也能用（moduleDir 是探测出来的） */
function brandLogoPath() {
  var dirs = [];
  function add(p) {
    p = String(p || '').replace(/[\\\/]+$/, '');
    if (p && dirs.indexOf(p) < 0) dirs.push(p);
  }
  try { add(NM && NM.moduleDir); } catch (e) {}
  add(moduleDir);
  try { add(window.GetProperty('lx.moduleDir', '')); } catch (e) {}

  var names = ['lxbox-logo.png', 'Lxbox.png', 'logo.png'];
  for (var i = 0; i < dirs.length; i++) {
    for (var j = 0; j < names.length; j++) {
      var p = dirs[i] + '\\' + names[j];
      var ok = false;
      try { ok = utils.FileExists(p); } catch (e) {}
      if (ok) return p;
    }
  }
  return '';
}

/* 只探测一次：第一次绘制时 moduleDir 一定已经定下来了 */
function loadBrandLogo() {
  if (brandLogoChecked) return brandLogo;
  brandLogoChecked = true;

  var p = brandLogoPath();
  if (!p) return null;
  try { brandLogo = gdi.Image(p); } catch (e) { brandLogo = null; }
  if (!brandLogo) {
    try { console.log('[LX-UI] 标志图读取失败：' + p); } catch (e2) {}
  }
  return brandLogo;
}

function drawBrand(gr) {
  var r = brandRect();
  var lg = loadBrandLogo();

  if (lg) {
    var sz = imageSize(lg);
    if (sz[0] && sz[1]) {
      var lr = brandLogoRect(r);
      try {
        /* 256 → 52 是缩小，默认插值会让边缘发毛，临时调到高质量三次卷积 */
        try { gr.SetInterpolationMode(7); } catch (eI) {}
        gr.DrawImage(lg, lr.x, lr.y, lr.w, lr.h, 0, 0, sz[0], sz[1], 0, 255);
        try { gr.SetInterpolationMode(0); } catch (eI2) {}
        return;
      } catch (e) {}
    }
  }

  /* 没有标志图：退回原来的四个字 */
  gr.GdiDrawText(BRAND, F.hdrB, C.text, r.x, r.y, r.w, r.h, FLAG_CENTER);
}

function drawHeader(gr) {
  /* 半透明顶栏，压住封面，保证标题可读 */
  gr.FillSolidRect(0, 0, W, HEAD_H, tint(C.bg, BG_A.header));

  /* 左上角：标志图（找不到图就退回「网络音乐」四个字），与下面的版本号
     共用同一个竖列：同 x、同宽、各自居中 */
  drawBrand(gr);
  drawVersionTag(gr);

  for (var i = 0; i < TAB_DEFS.length; i++) {
    var r = tabRect(i);
    var active = tab === i;
    var hot = hoverOn(r);
    if (active) gr.FillSolidRect(r.x, r.y, r.w, r.h, tint(C.panel2, BG_A.tabOn));
    else if (hot) gr.FillSolidRect(r.x, r.y, r.w, r.h, tint(C.hover, BG_A.tabHot));
    gr.GdiDrawText(TAB_DEFS[i].label, F.hdrB, active ? C.accent : (hot ? C.text : C.dim),
                   r.x, r.y, r.w, r.h, FLAG_CENTER);
    if (active) gr.FillSolidRect(r.x, r.y + r.h - 2, r.w, 2, C.accent);
  }

  var order = NM.providers.order;
  for (var j = 0; j < order.length; j++) {
    var p = order[j];
    var pr = platformRect(j);
    if (!pr) break;                 /* 第二排藏起来了 */
    var on = platform === p;
    var phot = hoverOn(pr);
    if (on) gr.FillSolidRect(pr.x, pr.y, pr.w, pr.h, tint(C.accentDim, BG_A.chipOn));
    else if (phot) gr.FillSolidRect(pr.x, pr.y, pr.w, pr.h, tint(C.panel2, BG_A.chip));
    var meta = NM.providers.meta[p] || { short: p };
    gr.GdiDrawText(meta.short || p, F.hdr, on ? C.accent : (phot ? C.text : C.dim),
                   pr.x, pr.y, pr.w, pr.h, FLAG_CENTER);
  }

  /* 第二行右边的两格下拉：先音质（左），再音源（右，右边缘与「设置」对齐） */
  drawQualityBar(gr);
  drawScriptBar(gr);

  drawHeaderButtons(gr);

  gr.DrawLine(0, HEAD_H - 1, W, HEAD_H - 1, 1, C.line);
}

/* ---------------------------------------------------------------- 滚动条
   条本身只有 3px 宽，可点区域放宽到 14px：
     按住滑块拖动、点轨道空白直接跳过去、滚轮照旧。
   几何由绘制时记录（sbGeom），交互时按当前视图取用。            */
var sbGeom = {};        /* id -> { x, y, h, total, visible, offset } */
var sbDrag = null;      /* { id, grab } 正在拖 */
var sbGuard = false;    /* 本次按下是拖滚动条 → 松开时别当成列表点击 */

function scrollbarParts(g) {
  var maxOff = Math.max(1, g.total - g.visible);
  var thumbH = Math.min(g.h, Math.max(22, Math.round(g.h * g.visible / g.total)));
  var maxY = Math.max(0, g.h - thumbH);
  var thumbY = g.y + Math.round(maxY * clamp(g.offset / maxOff, 0, 1));
  return { maxOff: maxOff, thumbH: thumbH, maxY: maxY, thumbY: thumbY };
}

function drawScrollbar(gr, id, x, y, h, total, visible, offset) {
  sbGeom[id] = { x: x, y: y, h: h, total: total, visible: visible, offset: offset };
  if (total <= visible || h <= 0) return;

  var p = scrollbarParts(sbGeom[id]);
  var hot = !!(sbDrag && sbDrag.id === id) ||
            (FR.hover && mouseX >= x - 7 && mouseX <= x + 6 && mouseY >= y && mouseY <= y + h);
  var wide = hot ? 4 : 3;
  var bx = x - (wide - 3);

  gr.FillSolidRect(bx, y, wide, h, A(C.scroll, hot ? 0x50 : 0x30));
  gr.FillSolidRect(bx, p.thumbY, wide, p.thumbH, A(C.scroll, hot ? 0xB0 : 0x80));
}

/* 浮层打开时只认浮层的条；否则按当前页签取列表条。
   艺人介绍浮层有两个可滚区：左下的热门歌曲、右侧的正文（v1.9.21）。 */
function activeScrollIds() {
  if (overlay) {
    if (overlay === 'bio' && bioSplitOn()) return ['biosongs', 'overlay'];
    return ['overlay'];
  }
  if (tab === 0) return sideCollapsed ? ['track'] : ['board', 'track'];
  if (isBrowseTab()) return sideCollapsed ? ['track'] : ['coll', 'track'];
  return ['track'];
}

function scrollbarHit(x, y) {
  var ids = activeScrollIds();
  for (var i = 0; i < ids.length; i++) {
    var g = sbGeom[ids[i]];
    if (!g || g.total <= g.visible || g.h <= 0) continue;
    if (x >= g.x - 7 && x <= g.x + 6 && y >= g.y && y <= g.y + g.h) return ids[i];
  }
  return '';
}

function scrollSet(id, v) {
  var g = sbGeom[id];
  if (!g) return;
  v = clamp(Math.round(v), 0, Math.max(0, g.total - g.visible));
  if (id === 'board') boardScroll = v;
  else if (id === 'coll') collScroll = v;
  else if (id === 'track') trackScroll = v;
  else if (id === 'overlay') overlayScroll = v;
  else if (id === 'biosongs') bioSongScroll = v;
  else return;
  g.offset = v;
  repaint();
}

function scrollDragTo(y) {
  if (!sbDrag) return;
  var g = sbGeom[sbDrag.id];
  if (!g) return;
  var p = scrollbarParts(g);
  if (p.maxY <= 0) { scrollSet(sbDrag.id, 0); return; }
  var ty = clamp(y - sbDrag.grab, g.y, g.y + p.maxY) - g.y;
  scrollSet(sbDrag.id, ty / p.maxY * p.maxOff);
}

/* 左栏右上角的收起 / 展开按钮。箭头自己用两根线画，不依赖字体里有没有 « »
   —— 中文字体里这两个字形时有时无，换个字体就变成豆腐块。 */
function drawSideToggle(gr) {
  var r = sideToggleRect();
  if (!r) return;
  var hot = sideTogHot;
  gr.FillSolidRect(r.x, r.y, r.w, r.h,
                   hot ? tint(C.btnHot, BG_A.btnHot) : tint(C.btn, BG_A.chip));
  gr.DrawRect(r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1, 1, A(C.line, hot ? 235 : 185));

  var cx = Math.round(r.x + r.w / 2);
  var cy = Math.round(r.y + r.h / 2);
  var col = hot ? C.accent : C.dim;
  /* dir = 箭头「指的方向」：展开态指左（点它往左收），收起态指右（点它往右展开）。
     尖端在 cx + dir*3，两个尾端在 cx - dir*2 —— 上面这两句别写反，
     反了就是「按箭头提示点下去，栏反而朝相反方向跑」。 */
  var dir = sideCollapsed ? 1 : -1;
  gr.DrawLine(cx + dir * 3, cy, cx - dir * 2, cy - 4, 1, col);
  gr.DrawLine(cx + dir * 3, cy, cx - dir * 2, cy + 4, 1, col);
}

/* 收起态的左栏：一条窄边 + 竖排标题（一个字一行，紧跟在展开按钮下面，像书脊） */
function drawSideRail(gr, label) {
  var r = L.board;
  gr.FillSolidRect(r.x, r.y, r.w, r.h, tint(C.panel, BG_A.side));
  gr.DrawLine(r.x + r.w - 1, r.y, r.x + r.w - 1, r.y + r.h, 1, A(C.line, 205));

  var t = String(label || '');
  var lh = clamp(FONT_BASE + 2, 13, 17);
  var y0 = r.y + 28;                     /* 上面 3+18 是按钮，下面 7px 起排 */
  for (var i = 0; i < t.length; i++) {
    if (y0 + i * lh > r.y + r.h - lh) break;
    gr.GdiDrawText(t.charAt(i), F.small, C.dim, r.x, y0 + i * lh, r.w - 1, lh, FLAG_CENTER);
  }
  drawSideToggle(gr);
}

function drawBoardList(gr) {
  if (sideCollapsed) { drawSideRail(gr, '榜单'); return; }
  gr.FillSolidRect(L.board.x, L.board.y, L.board.w, L.board.h, tint(C.panel, BG_A.side));
  var bh1 = Math.min(24, Math.max(20, FONT_BASE + 4));
  gr.GdiDrawText('榜单', F.small, C.dim, L.board.x + 10, L.board.y + 2,
                 Math.max(30, L.board.w - 20 - 26), bh1, FLAG_LEFT);
  drawSideToggle(gr);

  var vis = visBoardRows();
  for (var i = boardScroll; i < boards.length && i < boardScroll + vis; i++) {
    var ry = L.boardListY + (i - boardScroll) * BOARD_ROW_H;
    var on = i === boardIndex;
    var hot = i === hoverRow && hoverKind === 'board';
    if (on) gr.FillSolidRect(L.board.x, ry, L.board.w, BOARD_ROW_H, tint(C.sel, BG_A.rowSel));
    else if (hot) gr.FillSolidRect(L.board.x, ry, L.board.w, BOARD_ROW_H, tint(C.hover, BG_A.rowHot));
    if (on) gr.FillSolidRect(L.board.x, ry, 2, BOARD_ROW_H, C.accent);
    gr.GdiDrawText(boards[i].name, F.normal, on ? C.accent : C.text,
                   L.board.x + 10, ry, L.board.w - 20, BOARD_ROW_H, FLAG_LEFT);
  }

  drawScrollbar(gr, 'board', L.board.x + L.board.w - 4, L.boardListY, L.boardListH,
                boards.length, vis, boardScroll);
}

/* 集合列表右上角的小按钮：推荐 / 刷新（收起按钮在它右边，见 sideToggleRect） */
function collRecRect() {
  if (sideCollapsed || !isBrowseTab() || !L.board) return null;
  return { x: L.board.x + L.board.w - 72, y: L.board.y + 3, w: 42, h: 18 };
}

function drawCollList(gr) {
  if (sideCollapsed) { drawSideRail(gr, browseLabel()); return; }
  gr.FillSolidRect(L.board.x, L.board.y, L.board.w, L.board.h, tint(C.panel, BG_A.side));
  var btn = collRecRect();
  var headW = Math.max(30, L.board.w - 20 - 26 - (btn ? btn.w + 8 : 0));
  var head = (collMode === 'search' ? '搜索' : collTopName()) +
             '（' + collItems.length + '）';
  gr.GdiDrawText(head, F.small, C.dim, L.board.x + 10, L.board.y + 2, headW,
                 Math.min(24, Math.max(20, FONT_BASE + 4)), FLAG_LEFT);

  if (btn) {
    var bhot = hoverOn(btn);
    var active = collMode === 'top';
    gr.FillSolidRect(btn.x, btn.y, btn.w, btn.h,
                     bhot ? tint(C.btnHot, BG_A.btnHot) : (active ? tint(C.sel, BG_A.rowSel) : tint(C.btn, BG_A.chip)));
    gr.DrawRect(btn.x + 0.5, btn.y + 0.5, btn.w - 1, btn.h - 1, 1, A(C.line, bhot ? 235 : 185));
    gr.GdiDrawText(active ? '刷新' : '推荐', F.small,
                   (bhot || active) ? C.accent : C.dim,
                   btn.x, btn.y, btn.w, btn.h, FLAG_CENTER);
  }

  var vis = visBoardRows();
  for (var i = collScroll; i < collItems.length && i < collScroll + vis; i++) {
    var it = collItems[i] || {};
    var ry = L.boardListY + (i - collScroll) * BOARD_ROW_H;
    var on = i === collIndex;
    var hot = i === hoverRow && hoverKind === 'coll';
    if (on) gr.FillSolidRect(L.board.x, ry, L.board.w, BOARD_ROW_H, tint(C.sel, BG_A.rowSel));
    else if (hot) gr.FillSolidRect(L.board.x, ry, L.board.w, BOARD_ROW_H, tint(C.hover, BG_A.rowHot));
    if (on) gr.FillSolidRect(L.board.x, ry, 2, BOARD_ROW_H, C.accent);
    var label = String(it.name || '(未命名)');
    var tip = String(it.artist || '');
    if (!tip && it.count) tip = it.count + ' 首';
    if (tip) label += '  ' + tip;
    gr.GdiDrawText(label, F.small, on ? C.accent : C.text,
                   L.board.x + 10, ry, L.board.w - 20, BOARD_ROW_H, FLAG_LEFT);
  }

  drawScrollbar(gr, 'coll', L.board.x + L.board.w - 4, L.boardListY, L.boardListH,
                collItems.length, vis, collScroll);
  drawSideToggle(gr);
}

function drawTrackHeader(gr) {
  /* 热门推荐：标题整行去掉，曲目直接从搜索框下面排（布局里也少留了这 26px） */
  if (tab === 1 && hotMode) return;

  var fallback = tab === 0 ? '选择榜单'
    : (tab === 1 ? (hotMode ? hotTitle() : '搜索')
      : (collMode === 'search' && collKeyword
          ? browseLabel() + '：' + collKeyword
          : collTopName()));
  var title = trackTitle || fallback;
  /* 左栏收起时右边只剩一条窄边，标题往里缩一点，不贴着那条竖线 */
  var hx = L.track.x + (sideCollapsed ? PAD : 0);
  var hw = Math.max(40, L.track.w - (sideCollapsed ? PAD : 0));
  gr.GdiDrawText(title, F.head, C.text, hx, L.trackHeaderY, Math.max(40, hw - 90), 26, FLAG_LEFT);
  if (tracks.length) {
    gr.GdiDrawText(tracks.length + ' 首', F.small, C.dim,
                   hx, L.trackHeaderY, hw, 26, FLAG_RIGHT);
  }
}

function drawSearchBox(gr) {
  var r = L.search;
  var hot = hoverOn(r);
  var editing = !!editKind;
  gr.FillSolidRect(r.x, r.y, r.w, r.h, (hot || editing) ? tint(C.panel2, BG_A.fieldHot) : tint(C.panel, BG_A.field));
  gr.DrawLine(r.x, r.y + r.h - 1, r.x + r.w, r.y + r.h - 1, 1, (hot || editing) ? C.accent : C.line);

  /* 正在输入：显示编辑缓冲 + 光标 */
  if (editing) {
    var ph = tab === 1 ? '输入关键词，回车搜索'
                       : ('输入' + browseLabel() + '关键词，回车搜索');
    var tx = r.x + 12;
    var tw = Math.max(36, r.w - 94);
    if (editText) gr.GdiDrawText(editText, F.normal, C.text, tx, r.y, tw, r.h, FLAG_LEFT);
    else gr.GdiDrawText(ph, F.normal, C.dim, tx, r.y, tw, r.h, FLAG_LEFT);

    if (editBlinkOn) {
      var cx = tx + (editText ? textWidthOf(gr, editText.slice(0, editPos), F.normal) : 0);
      cx = Math.min(cx, r.x + r.w - 78);
      gr.FillSolidRect(cx, r.y + 7, 1, Math.max(6, r.h - 14), C.accent);
    }
    /* 右侧「回车搜索」= 点击提交（和按回车等价） */
    var subHot = hoverOn(r) && mouseX >= r.x + r.w - 76;
    gr.GdiDrawText('回车搜索', F.small, subHot ? C.text : C.accent, r.x + r.w - 74, r.y, 66, r.h, FLAG_RIGHT);
    return;
  }

  var kw = isBrowseTab() ? collKeyword : searchKeyword;
  var browsing = isBrowseTab();
  var prefix = browsing ? browseLabel() + '：' : '搜索：';
  var text;
  if (browsing && collMode === 'top') {
    text = kw ? (prefix + kw) : ('网易云 · ' + collTopName() + '　（点击输入' + browseLabel() + '关键词）');
  } else {
    text = kw ? (prefix + kw) : ('点击输入' + (browsing ? browseLabel() : '') + '关键词…');
  }
  gr.GdiDrawText(text, F.normal, kw ? C.text : C.dim,
                 r.x + 12, r.y, Math.max(40, r.w - 80), r.h, FLAG_LEFT);
  gr.GdiDrawText('搜索', F.small, hot ? C.accent : C.dim,
                 r.x + r.w - 60, r.y, 50, r.h, FLAG_RIGHT);
}

function browseLabelOr() {
  return isBrowseTab() ? browseLabel() : '';
}

function drawButtons(gr, i) {
  var r = rowButtonRects(i);
  var isHover = hoverRow === i && hoverKind === 'track';
  var playHot = isHover && hoverBtn === 'play';
  var queueHot = isHover && hoverBtn === 'queue';

  gr.FillSolidRect(r.play.x, r.play.y, r.play.w, r.play.h, playHot ? tint(C.btnHot, BG_A.btnHot) : tint(C.btn, BG_A.btn));
  gr.GdiDrawText('播放', F.tiny, playHot ? C.accent : C.dim,
                 r.play.x, r.play.y, r.play.w, r.play.h, FLAG_CENTER);

  gr.FillSolidRect(r.queue.x, r.queue.y, r.queue.w, r.queue.h, queueHot ? tint(C.btnHot, BG_A.btnHot) : tint(C.btn, BG_A.btn));
  gr.GdiDrawText('队列', F.tiny, queueHot ? C.accent : C.dim,
                 r.queue.x, r.queue.y, r.queue.w, r.queue.h, FLAG_CENTER);
}

function drawCheckbox(gr, i, checked) {
  var r = checkRect(i);
  if (checked) {
    gr.FillSolidRect(r.x, r.y, r.w, r.h, C.accent);
    gr.DrawLine(r.x + 3, r.y + 6, r.x + 5, r.y + 9, 2, C.bg);
    gr.DrawLine(r.x + 5, r.y + 9, r.x + 9, r.y + 3, 2, C.bg);
  } else {
    gr.DrawRect(r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1, 1, A(C.dim, 150));
  }
}

function drawTrackList(gr) {
  syncMulti();
  var n = trackColCount();
  var vis = visTrackRows();
  var rh = rowH();
  var one = rowLines() === 1;
  var rows = trackRowCount();

  for (var row = trackScroll; row < rows && row < trackScroll + vis; row++) {
    var ry = L.track.y + (row - trackScroll) * rh;
    for (var c = 0; c < n; c++) {
      var i = row * n + c;
      if (i >= tracks.length) break;

      var cr = trackColRect(c);
      var cx = cr.x, cw = cr.w;
      var on = i === selected;
      var checked = !!multiSel[i];
      var hot = i === hoverRow && hoverKind === 'track';

      if (on) gr.FillSolidRect(cx, ry, cw, rh, tint(C.sel, BG_A.rowSel));
      else if (checked) gr.FillSolidRect(cx, ry, cw, rh, tint(C.accentDim, 170));
      else if (hot) gr.FillSolidRect(cx, ry, cw, rh, tint(C.hover, BG_A.rowHot));
      if (on) gr.FillSolidRect(cx, ry, 2, rh, C.accent);
      drawCheckbox(gr, i, checked);

      var t = tracks[i];
      var textW = Math.max(40, cw - 132);
      var title = t.title || '(未知曲目)';
      var tx = cx + 26;

      if (one) {
        /* 单行：歌名 + 紧跟其后的歌手 / 专辑 / 时长 */
        var tw = textWidth(gr, title, F.normal, FONT_BASE);
        tw = Math.min(tw + 6, Math.max(40, textW - 40));
        gr.GdiDrawText(title, F.normal, on ? C.accent : C.text,
                       tx, ry, tw, rh, FLAG_LEFT);
        var sub = subtitleOf(t);
        var sw = textW - tw - 10;
        if (sub && sw > 40) {
          gr.GdiDrawText(sub, F.small, C.dim, tx + tw + 10, ry, sw, rh, FLAG_LEFT);
        }
      } else {
        /* 双行：第一行歌名，第二行歌手 · 专辑 · 时长（行高跟着字号走） */
        var lh1 = trackLineH1();
        gr.GdiDrawText(title, F.normal, on ? C.accent : C.text,
                       tx, ry + 2, textW, lh1, FLAG_LEFT);
        gr.GdiDrawText(subtitleOf(t), F.small, C.dim,
                       tx, ry + 2 + lh1, textW, trackLineH2(), FLAG_LEFT);
      }
      drawButtons(gr, i);

      /* 两列之间画一条很淡的竖线，否则左右两首会粘在一起 */
      if (n > 1 && c < n - 1) {
        gr.DrawLine(cx + cw - 1, ry, cx + cw - 1, ry + rh, 1, A(C.line, 90));
      }
    }
  }

  if (!tracks.length) {
    var msg;
    if (busy) msg = hotLoading ? '正在加载热门推荐…' : '正在加载…';
    else if (tab === 0) msg = '选择左侧榜单，双击歌曲播放';
    else if (tab === 1) msg = hotMode
      ? '热门推荐暂时没有内容，右键「热门推荐换一份榜」'
      : '点击上方搜索框，输入关键词';
    else msg = browseHint();
    gr.GdiDrawText(msg, F.normal, busy ? C.accent : C.dim,
                   L.track.x, L.track.y, L.track.w, L.track.h, FLAG_CENTER);
  }

  drawScrollbar(gr, 'track', L.track.x + L.track.w - 4, L.track.y, L.track.h,
                rows, vis, trackScroll);
}

/* 浮层底色：整块（封面背景 + 遮罩，或实色）。标题条 50px 与正文分两档 ——
   跟设置面板同一个画法（正文 C.bg / 标题条 C.panel），只是封面上盖的是「浮层遮罩」。 */
/* 标题条高度：只剩「诊断日志」还有这条 50px 的带子。
   「艺人介绍」（v1.9.22）和「歌曲评论」（v1.9.23）都把标题条去掉，
   × 一并挪到正文区右上角 —— 评论那页的标题顺到左列顶部，见 overlayHeadRows() */
function overlayHeadH(r) {
  if (overlay !== 'logs' && overlay !== 'probe') return 0;
  return Math.min(50, (r || L.overlay || { h: 0 }).h);
}

/* 没有标题条的浮层，头部要留几行：评论 2 行（「歌曲评论」+ 副标题），艺人介绍 0 行 */
function overlayHeadRows() {
  return overlay === 'comments' ? 2 : 0;
}

/* 正文区上下边界：只要有这一对函数，加不加标题条都不会让各行算法对不上 */
function overlayTopY() {
  var r = L.overlay;
  if (!r) return 0;
  if (overlayHeadH(r) > 0) return r.y + 54;
  var rows = overlayHeadRows();
  return r.y + 10 + (rows ? rows * overlayLineH() + 6 : 0);
}

function overlayBottomY() {
  var r = L.overlay;
  if (!r) return 0;
  return r.y + r.h - 8;
}

/* --------------------------------------------------------------------------
   顶栏第二行右侧的两格下拉：音质（左）· 音源脚本（右）
   --------------------------------------------------------------------------
   音源：同一个平台可能有多个脚本，以前无从指定 —— 取链时按脚本加载顺序挨个试，
   撞上哪个用哪个。这格给**当前平台**指定脚本：选中的脚本排到最前面，其余脚本
   仍然兜底；选「自动」就回到加载顺序。选择写进面板属性 lx.script.<平台>，
   所有页面、浮层共用同一个值，换平台自动跟着换（每个平台各存一份）。
   音质：原来点一下轮换四档，看不出有哪几档；改成下拉，选项一目了然。
   两格都贴右排：音源右边缘对齐第一行「设置」按钮，音质再贴它左边。
   -------------------------------------------------------------------------- */
var SCRIPT_BAR_MIN_W = 520;    /* 比这窄就收起音源下拉，把宽度让给页签 */
var scriptHot = false;         /* 音源下拉 hover 态：尺寸小，必须给点反馈 */
var qBarHot = false;           /* 音质下拉 hover 态 */

/* 已就绪（ok / warn）的脚本列表 */
function scriptRuntimes() {
  var out = [];
  try {
    var list = (NM.lx.state && NM.lx.state.runtimes) || [];
    for (var i = 0; i < list.length; i++) {
      var rt = list[i];
      if (!rt) continue;
      if (rt.status !== 'ok' && rt.status !== 'warn') continue;
      out.push(rt);
    }
  } catch (e) {}
  return out;
}

function scriptPrefId(source) {
  var v = '';
  try { v = String(window.GetProperty('lx.script.' + (source || platform), '') || ''); } catch (e) { v = ''; }
  return v;
}

function scriptName(rt) {
  var n = String((rt && rt.name) || '');
  var v = String((rt && rt.version) || '');
  return v ? (n + ' ' + v) : n;
}

/* 不带版本号的短名：顶栏那一格只有 150px 宽，「墨澜音乐源 v2.3.4」会被截 */
function scriptShort(source) {
  var id = scriptPrefId(source);
  if (!id) return '自动';
  var list = scriptRuntimes();
  for (var i = 0; i < list.length; i++) if (list[i].id === id) return String(list[i].name || id);
  return '已移除的脚本';
}

/* 音质那一格：外观和音源下拉同款，右边缘不贴死（右边还隔着音源下拉） */
function qualityBarHot(x, y) {
  if (W < 440) return false;
  return inRect(qualityRect(), x, y);
}

function drawQualityBar(gr) {
  if (W < 440) return;
  var r = qualityRect();
  if (!r) return;
  var hot = qBarHot || hoverOn(r);
  gr.FillSolidRect(r.x, r.y, r.w, r.h, hot ? tint(C.btnHot, BG_A.btnHot) : tint(C.btn, BG_A.btn));
  gr.DrawRect(r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1, 1, A(C.line, hot ? 235 : 190));

  var col = hot ? C.accent : C.text;
  gr.GdiDrawText('音质 ' + (QUALITY_LABEL[quality] || quality), F.hdr, col,
                 r.x + 8, r.y, Math.max(20, r.w - 24), r.h, FLAG_LEFT);

  var ax = r.x + r.w - 14, ay = r.y + Math.round(r.h / 2) - 2;
  gr.DrawLine(ax, ay, ax + 4, ay + 4, 1, col);
  gr.DrawLine(ax + 8, ay, ax + 4, ay + 4, 1, col);
}

/* 音质菜单：四档一目了然，当前那档打勾（以前点一下轮换，看不出有哪几档） */
function openQualityMenu(x, y) {
  var m = window.CreatePopupMenu();
  for (var i = 0; i < QUALITIES.length; i++) {
    var q = QUALITIES[i];
    var label = q === 'auto' ? '自动（按脚本能力挑最高的）' : ('音质 ' + (QUALITY_LABEL[q] || q));
    m.AppendMenuItem(MF_STRING | (q === quality ? MF_CHECKED : 0), 10 + i, label);
  }
  var sel = m.TrackPopupMenu(x, y);
  var idx = sel - 10;
  if (idx >= 0 && idx < QUALITIES.length) {
    setQuality(QUALITIES[idx]);
    repaint();
  }
}

/* 顶栏那一格写什么：没指定 →「自动」；指定了名字太长就交给 GDI 裁 */
function scriptBarText() {
  return '音源：' + scriptShort(platform);
}

/* 窗口太窄就整格收起（平台按钮比它重要），返回 null 时绘制与命中也一起消失 */
function scriptBarOn() {
  return W >= SCRIPT_BAR_MIN_W;
}

/* 位置：第一行，紧接「艺人介绍」右边，一直撑到 W - PAD（右边缘与第二行
   「设置」对齐）。宽度不用写死：它占的是两行三列里剩下那一块，
   脚本名再长也放得下；面板窄到连 88px 都没有就整格收起。 */
function scriptBarRect() {
  if (headCompact()) return null;     /* 紧凑模式：音源那格整格撤掉 */
  if (!scriptBarOn()) return null;
  var x = bioRect().x + iconBtnW() + HB_GAP;
  var minX = tabsEnd() + 8;                    /* 不许压到页签上 */
  if (x < minX) x = minX;
  var w = W - PAD - x;
  if (w < 88) return null;
  return { x: x, y: 8, w: w, h: hdRow1H() };
}

function scriptBarHot(x, y) {
  var r = scriptBarRect();
  return !!(r && inRect(r, x, y));
}

function drawScriptBar(gr) {
  var r = scriptBarRect();
  if (!r) return;

  var pin = scriptPrefId(platform);
  var hot = scriptHot || hoverOn(r);

  /* 指定了脚本 = 覆盖了默认顺序，用选中色标出来；「自动」就是普通格 */
  if (pin) gr.FillSolidRect(r.x, r.y, r.w, r.h, tint(C.accentDim, BG_A.chipOn));
  else if (hot) gr.FillSolidRect(r.x, r.y, r.w, r.h, tint(C.btnHot, BG_A.btnHot));
  else gr.FillSolidRect(r.x, r.y, r.w, r.h, tint(C.btn, BG_A.btn));

  gr.DrawRect(r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1, 1,
              A(C.line, pin ? 220 : (hot ? 235 : 190)));

  var col = pin ? C.accent : (hot ? C.text : C.dim);
  gr.GdiDrawText(scriptBarText(), F.hdr, col,
                 r.x + 8, r.y, Math.max(20, r.w - 24), r.h, FLAG_LEFT);

  /* 下拉箭头用两根线画：不赌字体里有没有 ▾ / ▼，换个字体也不会变成方块 */
  var ax = r.x + r.w - 14, ay = r.y + Math.round(r.h / 2) - 2;
  gr.DrawLine(ax, ay, ax + 4, ay + 4, 1, col);
  gr.DrawLine(ax + 8, ay, ax + 4, ay + 4, 1, col);
}

/* 选定一个脚本 id（'' = 自动）：写属性 + 清掉取链缓存，下一次点播立刻生效 */
function applyScript(id) {
  var label = id ? '' : '自动';
  if (id) {
    var list = scriptRuntimes();
    for (var i = 0; i < list.length; i++) if (list[i].id === id) label = scriptName(list[i]);
    if (!label) label = id;
  }
  setProp('lx.script.' + platform, id || '');
  /* 缓存里存的是「这个平台这首歌唱用了哪个链接」，换脚本就该作废 */
  if (NM.lx && typeof NM.lx.clearResolveCache === 'function') NM.lx.clearResolveCache();
  setStatus(platformName() + ' 音源脚本：' + (label || '自动（加载顺序）'));
  repaint();
}

function openScriptMenu(x, y) {
  var list = scriptRuntimes();
  var cur = scriptPrefId(platform);
  var m = window.CreatePopupMenu();
  var ids = {};
  var next = 100;

  m.AppendMenuItem(MF_STRING | (cur ? 0 : MF_CHECKED), 1, '自动（按脚本加载顺序）');
  m.AppendMenuSeparator();

  var sup = [], rest = [];
  for (var i = 0; i < list.length; i++) {
    var rt = list[i];
    if (rt.sources && rt.sources[platform]) sup.push(rt); else rest.push(rt);
  }

  function addGroup(arr, gray) {
    for (var k = 0; k < arr.length; k++) {
      var r = arr[k];
      var label = scriptName(r);
      if (gray) label += '（不支持' + platformName(platform) + '）';
      m.AppendMenuItem(MF_STRING | (gray ? MF_GRAYED : 0) | (!gray && r.id === cur ? MF_CHECKED : 0),
                       next, label);
      if (!gray) ids[next] = r.id;
      next++;
    }
  }
  addGroup(sup, false);
  if (rest.length) {
    if (sup.length) m.AppendMenuSeparator();
    addGroup(rest, true);
  }
  if (!list.length) m.AppendMenuItem(MF_GRAYED, 2, '还没有加载到音源脚本');

  m.AppendMenuSeparator();
  m.AppendMenuItem(MF_STRING, 3, '重新加载音源脚本');
  m.AppendMenuItem(MF_STRING, 4, '打开音源脚本目录…');

  var sel = m.TrackPopupMenu(x, y);
  if (!sel) return;
  if (sel === 1) { applyScript(''); return; }
  if (ids[sel]) { applyScript(ids[sel]); return; }
  if (sel === 3) { reloadSources('音源脚本已重新加载'); repaint(); return; }
  if (sel === 4) { openScriptDirAction(); return; }
}

function paintOverlayBg(gr, r) {
  var headH = overlayHeadH(r);
  if (overlayArtOn() && blitBackdropRect(gr, r.x, r.y, r.w, r.h)) {
    if (headH > 0) gr.FillSolidRect(r.x, r.y, r.w, headH, overlayScrim(C.panel));
    if (r.h > headH) {
      gr.FillSolidRect(r.x, r.y + headH, r.w, r.h - headH, overlayScrim(C.bg));
    }
    return;
  }
  gr.FillSolidRect(r.x, r.y, r.w, r.h, overlayFill(C.bg, 252));
  if (headH > 0) gr.FillSolidRect(r.x, r.y, r.w, headH, overlayFill(C.panel, 244));
}

/* 遮住底部露出的半行：贴着 bottom 往下重铺一遍同样的底（封面背景下要重贴位图，
   只用半透明色盖是盖不干净的，字会隐隐透上来） */
function paintOverlayTail(gr, r, y, h) {
  if (h <= 0) return;
  var x = r.x + 1, w = r.w - 2;
  if (w <= 0) return;
  if (overlayArtOn() && blitBackdropRect(gr, x, y, w, h)) {
    gr.FillSolidRect(x, y, w, h, overlayScrim(C.bg));
    return;
  }
  gr.FillSolidRect(x, y, w, h, overlayFill(C.bg, 252));
}

/* 歌手图片：按 cover 方式居中裁成正方形（600 上限已经由布局算好）。
   没图时铺一块底板写提示 —— 空着会让人以为是漏了。 */
function drawBioPic(gr, g) {
  var p = g.pic;
  var iw = 0, ih = 0;
  if (bioPic) {
    try { iw = Number(bioPic.Width) || 0; ih = Number(bioPic.Height) || 0; } catch (e) { iw = 0; }
  }
  if (iw > 0 && ih > 0) {
    var s = Math.min(iw, ih);
    var sx = Math.round((iw - s) / 2), sy = Math.round((ih - s) / 2);
    var drawn = false;
    try { gr.DrawImage(bioPic, p.x, p.y, p.w, p.h, sx, sy, s, s, 0, 255); drawn = true; } catch (e) {}
    if (!drawn) {
      try { gr.GdiDrawBitmap(bioPic, p.x, p.y, p.w, p.h, sx, sy, s, s); drawn = true; } catch (e2) {}
    }
    if (drawn) return;
  }
  gr.FillSolidRect(p.x, p.y, p.w, p.h, tint(C.panel2, 150));
  gr.GdiDrawText(bioPicLoading ? '正在取歌手图片…' : (bioPicPath ? '图片读取失败' : '暂无歌手图片'),
                 F.small, C.dim, p.x, p.y, p.w, p.h, FLAG_CENTER);
}

/* 左栏：图片 + 热门歌曲 + 「更多…」 */
function drawBioLeft(gr, g) {
  drawBioPic(gr, g);

  var head = !bioTracks.length
    ? (overlayLoading ? '热门歌曲 · 正在加载…' : '热门歌曲')
    : '热门歌曲 ' + bioShowCount() + ' / ' + (bioTotal || bioTracks.length);
  gr.GdiDrawText(head, F.small, C.dim, g.listX, g.listY, g.listW, BIO_LIST_HEAD, FLAG_LEFT);

  bioSongClamp(g);
  var vis = bioSongVis(g);
  var rowsTop = g.listY + BIO_LIST_HEAD;
  var rightW = 46;                     /* 行尾时长那一格 */

  for (var i = bioSongScroll; i < bioShowCount() && i < bioSongScroll + vis; i++) {
    var t = bioTracks[i];
    if (!t) continue;
    var ry = rowsTop + (i - bioSongScroll) * BIO_ROW_H;
    var on = i === bioSongSel;
    /* 只有「点中」的这一行才有底色。指针掠过不画任何东西 —— 以前这里还有个
       hover 底色，鼠标在行间移动时那片色块跟着走，看着像粘在指针上。 */
    if (on) gr.FillSolidRect(g.listX, ry, g.listW, BIO_ROW_H, tint(C.sel, BG_A.rowSel));

    var num = (i + 1 < 10 ? '0' : '') + (i + 1);
    gr.GdiDrawText(num, F.small, on ? C.accent : C.dim, g.listX + 2, ry, 22, BIO_ROW_H, FLAG_RIGHT);
    gr.GdiDrawText(String(t.title || ''), F.normal, on ? C.accent : C.text,
                   g.listX + 28, ry, Math.max(24, g.listW - 30 - rightW), BIO_ROW_H, FLAG_LEFT);
    gr.GdiDrawText(durText(t.duration), F.small, C.dim,
                   g.listX + g.listW - rightW, ry, rightW - 4, BIO_ROW_H, FLAG_RIGHT);
  }

  if (!bioTracks.length && !overlayLoading) {
    gr.GdiDrawText('没有取到热门歌曲', F.small, C.dim, g.listX, rowsTop, g.listW, BIO_ROW_H, FLAG_LEFT);
  }

  var mr = bioMoreRect(g);
  if (mr) {
    var label = bioSongsBusy ? '正在取更多…'
      : (bioShowCount() < bioTracks.length
          ? '更多…（+' + Math.min(BIO_PAGE, bioTracks.length - bioShowCount()) + ' 首）'
          : '更多…（加载全部）');
    gr.GdiDrawText(label, F.small, bioMoreHot ? C.accent : C.dim, mr.x + 2, mr.y, mr.w, mr.h, FLAG_LEFT);
    var ul = Math.min(mr.w - 4, Math.round(estimateTextWidth(label, FONT_BASE)));
    gr.DrawLine(mr.x + 2, mr.y + mr.h - 3, mr.x + 2 + ul, mr.y + mr.h - 3, 1,
                bioMoreHot ? C.accent : A(C.line, 180));
  } else if (bioTracks.length && !bioHasMore()) {
    gr.GdiDrawText('已全部显示', F.small, C.dim,
                   g.listX, rowsTop + vis * BIO_ROW_H + 2, g.listW, BIO_MORE_H - 6, FLAG_LEFT);
  }

  drawScrollbar(gr, 'biosongs', g.listX + g.listW - 3, rowsTop, vis * BIO_ROW_H,
                bioShowCount(), vis, bioSongScroll);
}

/* 音源音质检测浮层：5 行 × 3 列的表格。
   不用正文那套「行数组」——表格要按列对齐，GDI 没有等宽字体可用，
   只能自己算每一列的 x，命中测试也复用同一份 probeGeom()。 */
function probeCellText(c) {
  if (!c) return '—';
  if (c.st === 'wait') return '·';
  if (c.st === 'run') return '…';
  if (c.st === 'ok') return '可用 ' + (c.ms / 1000).toFixed(1) + 's';
  if (c.st === 'addr') return '仅地址';
  if (c.st === 'fail') return '失败';
  return '—';
}

function drawProbeOverlay(gr, r) {
  var g = probeGeom();
  if (!g) return;

  gr.GdiDrawText('音源音质检测', F.head, C.accent,
                 r.x + 14, r.y + 6, Math.max(40, r.w - 70), 24, FLAG_LEFT);
  var scope = probeScriptId() ? ('只测 ' + probeScriptLabel() + ' · ') : '';
  var sub = probeBusy
    ? probeMsg
    : (probeAt ? scope + probeClock(probeAt) + ' 检测 · ' + probeSummary()
               : scope + probeMsg);
  gr.GdiDrawText(sub, F.small, C.dim, r.x + 14, r.y + 28, Math.max(40, r.w - 60), 20, FLAG_LEFT);
  gr.DrawLine(r.x + 10, r.y + 50, r.x + r.w - 10, r.y + 50, 1, A(C.line, 220));

  /* 「检测音源」选择框：标题下面、表格上面 */
  var pr = probePickRect();
  if (pr) {
    var ph = probePickHot || hoverOn(pr);
    gr.FillSolidRect(pr.x, pr.y, pr.w, pr.h, ph ? tint(C.btnHot, 220) : tint(C.panel2, 215));
    gr.DrawRect(pr.x + 0.5, pr.y + 0.5, pr.w - 1, pr.h - 1, 1,
                ph ? C.accent : A(C.line, 185));
    gr.GdiDrawText('检测音源：' + probeScriptLabel(), F.small,
                   ph ? C.accent : C.text, pr.x + 8, pr.y,
                   Math.max(20, pr.w - 28), pr.h, FLAG_LEFT);
    var pax = pr.x + pr.w - 15, pay = pr.y + Math.round(pr.h / 2) - 2;
    var pac = ph ? C.accent : C.dim;
    gr.DrawLine(pax, pay, pax + 4, pay + 4, 1, pac);
    gr.DrawLine(pax + 8, pay, pax + 4, pay + 4, 1, pac);
  }

  var y = g.top;
  gr.FillSolidRect(g.x0, y, g.tw, g.headRowH, tint(C.panel, 210));
  gr.GdiDrawText('音源', F.small, C.dim, g.x0 + 8, y, g.nameW - 10, g.headRowH, FLAG_LEFT);
  for (var qi = 0; qi < PROBE_Q.length; qi++) {
    gr.GdiDrawText(PROBE_Q_LABEL[PROBE_Q[qi]], F.small, C.dim,
                   g.x0 + g.nameW + qi * g.colW, y, g.colW, g.headRowH, FLAG_CENTER);
  }
  y += g.headRowH;

  for (var si = 0; si < PROBE_SRC.length; si++) {
    var p = PROBE_SRC[si];
    if (si % 2 === 0) gr.FillSolidRect(g.x0, y, g.tw, g.rowH, tint(C.panel2, 90));
    gr.GdiDrawText(probeName(p), F.small, C.text, g.x0 + 8, y, g.nameW - 10, g.rowH, FLAG_LEFT);
    for (var qj = 0; qj < PROBE_Q.length; qj++) {
      var c = probeCell(p, PROBE_Q[qj]);
      var col = c.st === 'ok' ? C.accent
              : c.st === 'fail' ? C.err
              : (c.st === 'addr' ? C.text : A(C.dim, 190));
      gr.GdiDrawText(probeCellText(c), F.small, col,
                     g.x0 + g.nameW + qj * g.colW, y, g.colW, g.rowH, FLAG_CENTER);
    }
    y += g.rowH;
  }

  /* 网格只画横线与列分隔：画满框会像一堆按钮，反而看不清 */
  gr.DrawLine(g.x0, g.top, g.x0 + g.tw, g.top, 1, A(C.line, 200));
  for (var li = 0; li <= PROBE_SRC.length; li++) {
    var ly = g.top + g.headRowH + li * g.rowH;
    gr.DrawLine(g.x0, ly, g.x0 + g.tw, ly, 1, A(C.line, li === 0 ? 200 : 150));
  }
  for (var vi = 0; vi <= PROBE_Q.length; vi++) {
    var vx = g.x0 + g.nameW + vi * g.colW;   /* 最后一条正好落在表格右边界 */
    gr.DrawLine(vx, g.top, vx, g.top + g.tableH, 1, A(C.line, 150));
  }

  /* 图例一行一条，不再拼成一长串：窄面板上那一长串会被 GDI 直接裁掉 */
  var lg = probeLegendLines();
  for (var gi = 0; gi < lg.length; gi++) {
    gr.GdiDrawText(lg[gi], F.tiny, A(C.dim, 225),
                   g.x0, g.legendY + gi * PROBE_LEGEND_H, g.w, PROBE_LEGEND_H, FLAG_LEFT);
  }
  var nl = probeNoteLines(g.w);
  for (var ni = 0; ni < nl.length; ni++) {
    gr.GdiDrawText(nl[ni].t, F.tiny, probeNote ? A(C.err, 225) : A(C.dim, 195),
                   g.x0, g.legendY + g.legendH + 6 + ni * PROBE_LEGEND_H,
                   g.w, PROBE_LEGEND_H, FLAG_LEFT);
  }

  var b = probeAgainRect();
  if (b) {
    gr.FillSolidRect(b.x, b.y, b.w, b.h, probeHot ? tint(C.btnHot, 220) : tint(C.btn, 170));
    gr.DrawRect(b.x + 0.5, b.y + 0.5, b.w - 1, b.h - 1, 1, A(C.line, probeHot ? 240 : 180));
    gr.GdiDrawText(probeBusy ? '检测中…' : (probeAt ? '重新检测' : '开始检测'), F.small,
                   probeBusy ? C.dim : (probeHot ? C.accent : C.text),
                   b.x, b.y, b.w, b.h, FLAG_CENTER);
    if (probeBusy) {
      gr.GdiDrawText(probeMsg, F.small, C.dim, b.x + b.w + 10, b.y,
                     Math.max(40, g.w - b.w - 10), b.h, FLAG_LEFT);
    }

    var sb = probeStopRect();
    if (sb) {
      var sOn = probeBusy && (probeStopHot || hoverOn(sb));
      gr.FillSolidRect(sb.x, sb.y, sb.w, sb.h,
                       sOn ? tint(C.btnHot, 220) : tint(C.btn, probeBusy ? 170 : 110));
      gr.DrawRect(sb.x + 0.5, sb.y + 0.5, sb.w - 1, sb.h - 1, 1,
                  A(C.line, probeBusy ? 180 : 120));
      gr.GdiDrawText('停止检测', F.small,
                     !probeBusy ? A(C.dim, 165) : (sOn ? C.err : C.dim),
                     sb.x, sb.y, sb.w, sb.h, FLAG_CENTER);
    }
  }

  var cb = overlayCloseRect();
  if (cb) {
    var chot = hoverOn(cb);
    gr.GdiDrawText('×', F.head, chot ? C.err : C.dim, cb.x, cb.y, cb.w, cb.h, FLAG_CENTER);
  }
}

function drawOverlay(gr) {
  if (!overlay) return;
  var r = L.overlay;
  if (!r || r.h < 60) return;

  /* 浮层整块铺满内容区：不画外框，靠底色与下面的列表区分（贴边画框会多出一条线） */
  paintOverlayBg(gr, r);

  /* 音质检测是自绘的表格（不是评论那种「行数组」），单独一条路 */
  if (overlay === 'probe') {
    drawProbeOverlay(gr, r);
    return;
  }

  /* 标题条：现在只剩「诊断日志」有。艺人介绍（v1.9.22）、歌曲评论（v1.9.23）
     都把这一条去掉 —— 评论那页的标题与副标题改画在左列顶部，见下面 */
  var headH = overlayHeadH(r);
  if (headH > 0) {
    gr.GdiDrawText(overlayName || '', F.head, C.accent,
                   r.x + 14, r.y + 6, Math.max(40, r.w - 70), 24, FLAG_LEFT);
    if (overlaySubject) {
      gr.GdiDrawText(overlaySubject, F.small, C.dim,
                     r.x + 14, r.y + 28, Math.max(40, r.w - 28), 20, FLAG_LEFT);
    }
    gr.DrawLine(r.x + 10, r.y + 50, r.x + r.w - 10, r.y + 50, 1, A(C.line, 220));
  }

  var top = overlayTopY();
  var bottom = overlayBottomY();
  var lineH = overlayLineH();
  var vis = Math.max(1, Math.floor((bottom - top) / lineH));

  var g = overlayTextGeom();
  var bio = g.bio || null;

  /* 歌曲评论：标题与副标题贴在**左列顶部**（v1.9.23），不再横贯整宽。
     只写到第一列的宽度里，右列从同一条基线开始排评论，右上角留给 × */
  if (overlayHeadRows() > 0) {
    var hy = r.y + 6;
    gr.GdiDrawText(overlayName || '', F.head, C.accent,
                   g.x0, hy, Math.max(40, g.colW - 20), lineH + 4, FLAG_LEFT);
    if (overlaySubject) {
      gr.GdiDrawText(overlaySubject, F.small, C.dim,
                     g.x0, hy + lineH, Math.max(40, g.colW - 10), lineH, FLAG_LEFT);
    }
  }

  /* 艺人介绍：左栏（歌手图片 + 热门歌曲）先铺，右栏再排正文 */
  if (bio && bio.split) {
    drawBioLeft(gr, bio);
    gr.DrawLine(bio.sepX, top - 4, bio.sepX, bottom, 1, A(C.line, 170));
  }

  /* 两列时中间加一条竖线：跟设置面板「左栏 | 内容」那条同色同粗细，
     并排的两列不至于看着是一整片乱排 */
  if (g.n > 1) {
    var sepX = Math.round(g.x0 + g.colW + g.gap / 2);
    gr.DrawLine(sepX, top - 4, sepX, bottom, 1, A(C.line, 170));
  }

  for (var c = 0; c < overlayCols.length; c++) {
    var lines = overlayCols[c];
    var cx = g.x0 + c * (g.colW + g.gap);
    for (var i = overlayScroll; i < lines.length && i < overlayScroll + vis; i++) {
      var ln = lines[i];
      if (!ln || !ln.t) continue;
      var col = ln.c === 'head' ? C.accent : (ln.c === 'err' ? C.err : (ln.c === 'dim' ? C.dim : C.text));
      var font = ln.c === 'head' ? F.small : F.normal;
      gr.GdiDrawText(ln.t, font, col,
                     cx, top + (i - overlayScroll) * lineH, g.colW, lineH, FLAG_LEFT);
    }
  }

  /* 遮住超出边框的最后半行 */
  var over = bottom + vis * lineH;
  if (over > bottom) {
    paintOverlayTail(gr, r, bottom, Math.max(0, r.y + r.h - bottom - 1));
  }

  drawScrollbar(gr, 'overlay', r.x + r.w - 7, top, bottom - top, overlayRowCount(), vis, overlayScroll);

  /* 关闭按钮最后画：评论 / 日志在标题条里，艺人介绍在正文区右上角。
     放最后是为了不被正文行或滚动条盖住 */
  var cb = overlayCloseRect();
  if (cb) {
    var chot = hoverOn(cb);
    gr.GdiDrawText('×', F.head, chot ? C.err : C.dim, cb.x, cb.y, cb.w, cb.h, FLAG_CENTER);
  }
}

/* --------------------------------------------------------------------------
   面板设置（右上角「设置」按钮）
   右键菜单只留高频操作（播放 / 加入列表 / 勾选 / 关键词 / 刷新），
   其余不常用的（配色、封面背景、行数、音质、音源维护）全部收进这里。
   控件只有三种自绘件：分段按钮 seg、滑块 slider、动作按钮 btn。
   -------------------------------------------------------------------------- */
/* 设置面板布局的缓存（v1.9.18）
   settingsLayout() 每次都要调 settingsSections() 重新生成约 40 个行对象（每个
   带闭包），而 on_mouse_move 每移动一个像素就调一次它（为了算 hover），
   on_paint 里还要再来一次。一份缓存让"每帧两次"变成"每帧一次"。
   setProp 一次就把版本号 +1，值改了自然失效。 */
var setVer = 0;
var setLayoutCache = null;
var setLayoutKey = '';

function setProp(k, v) {
  try { window.SetProperty(k, String(v)); } catch (e) {}
  setVer++;
  setLayoutCache = null;
  rowLinesCache = 0;          /* 行数可能改了，让 rowLines() 重新读一次 */
}

function openSettings() {
  if (editKind) endEdit();
  setOpen = true;
  setScroll = 0;
  setDrag = '';
  setHot = '';
  repaint();
}

function closeSettings() {
  if (editKind) endEdit();
  setOpen = false;
  setDrag = '';
  setHot = '';
  repaint();
}

var setOpen = false;
var setScroll = 0;
var setDrag = '';          /* 正在拖的滑块 id */
var setCat = 'look';       /* 当前分类 */
var setHot = '';           /* 上次命中的控件，用来省掉无意义重绘 */

var SET_NAV_W = 126;
var SET_HEAD_H = 46;
var SET_FOOT_H = 26;
var SET_SEC_H = 26;
var SET_ROW_SEG = 38;
var SET_ROW_SLIDER = 46;
var SET_ROW_SLIDER_IN = 42;
var SET_ROW_SWATCH = 46;
var SET_ROW_BTN = 32;
var SET_ROW_NOTE = 28;
var SET_ROW_TEXT = 40;
var SET_CTL_X = 110;       /* 控件统一起点（标签列宽） */
var SET_CTL_MAX = 360;     /* 控件最大宽度：整屏也不要拉成一整条 */

/* 一行里控件区的起点与宽度：整屏时也不让滑块横贯整个屏幕 */
function ctlWidth(w) {
  return Math.min(SET_CTL_MAX, Math.max(60, w - SET_CTL_X - 64));
}

function ctlBox(x, w) {
  return [x + SET_CTL_X, ctlWidth(w)];
}

var HUE_PRESETS = [
  { v: -1, name: '不染色' },
  { v: 210, name: '钢蓝' },
  { v: 265, name: '紫罗兰' },
  { v: 150, name: '松绿' },
  { v: 30, name: '暖棕' },
  { v: 330, name: '玫红' },
  { v: 185, name: '青' },
  { v: 45, name: '琥珀' }
];

var SET_CATS = [
  { id: 'look', name: '外观', hint: '配色、曲目清单行数、音质。改完立刻生效，也会写进面板属性。' },
  { id: 'bg', name: '背景', hint: '封面背景开关与背景效果：遮罩越小封面越清楚，内容区不透明度越小面板越透。' },
  { id: 'src', name: '音源与属性', hint: '缓存与音源目录、封面写入方式、是否先缓存再播放。目录留空用默认；音质检测可只测选中的脚本。' },
  { id: 'maint', name: '维护', hint: '刷新列表 / 重载音源 / 导入音源 / 重嵌封面 / 清缓存 / 诊断日志。' }
];

function propStr(k, d) {
  var v = '';
  try { v = window.GetProperty(k, d); } catch (e) { v = d; }
  return v == null ? String(d) : String(v);
}

function propOn(k, d) {
  return propStr(k, d) !== '0';
}

function catIndexOf(id) {
  for (var i = 0; i < SET_CATS.length; i++) if (SET_CATS[i].id === id) return i;
  return 0;
}

function shiftCat(step) {
  var i = clamp(catIndexOf(setCat) + step, 0, SET_CATS.length - 1);
  if (SET_CATS[i].id === setCat) return;
  setCat = SET_CATS[i].id;
  setScroll = 0;
  repaint();
}

/* 改背景后统一走这里：色板 + 位图都要重来 */
function refreshBgFx(retheme) {
  if (retheme) applyTheme(true);
  buildBackdrop();
  repaint();
}

function setBgArt(on) {
  setProp('lx.bgArt', on ? '1' : '0');
  applyTheme(true);
  if (on) {
    bgArtKey = '';                 /* 强制重新取封面 */
    refreshBackground(true);
  } else {
    var a0 = bgArt;
    bgArt = null; bgArtKey = '';
    disposeObj(a0);
    dropBackdrop();
  }
  setStatus(on ? '已开启封面背景' : '已关闭封面背景（配色跟随 foobar2000）');
  repaint();
}

function refreshCurrentPage() {
  if (tab === 0) loadBoard();
  else if (tab === 1) { if (hotMode) loadHot(true); else openSearchAgain(); }
  else if (isBrowseTab() && collMode === 'top') loadRecommend(true);
  else if (isBrowseTab() && collIndex >= 0) loadCollTracks(collIndex);
  else if (isBrowseTab()) runBrowseSearch();
}

/* 面板里的全部内容。value 每次都从属性现读，所以界面永远等于当前真实设置 */
function settingsSections() {
  var hue = bgHue();
  var glassPct = Math.round((bgGlass() - 0.35) / 0.65 * 100);

  var secs = [
    { cat: 'look', title: '外观', rows: [
      { kind: 'seg', id: 'uiscale', label: '界面缩放', value: uiScaleProp(),
        options: [['auto', '自动'], ['100', '100%'], ['125', '125%'],
                  ['150', '150%'], ['200', '200%']],
        onPick: function (v) {
          setProp('lx.uiScale', v);
          applyUiScale();
          setStatus('界面缩放：' + Math.round(UI_S * 100) + '%（' +
                    (v === 'auto' ? '自动探测' : '手动指定') + '）');
        } },
      { kind: 'slider', inline: true, id: 'fontsize', label: '字体字号',
        min: FONT_MIN, max: FONT_MAX, value: FONT_BASE,
        fmt: function (v) { return v + ' px'; },
        onSet: function (v) {
          setProp('lx.fontSize', v);
          /* quiet：拖动中不刷 console；字号不影响背景位图内容，applyUiScale
             内部只在面板尺寸真的变了时才重烘，所以拖这条滑块是零重烘的 */
          applyUiScale({ quiet: true });
          setStatus('字体字号：' + v + ' px（手动，不再跟随 foobar2000 字体）');
        } },
      { kind: 'seg', id: 'theme', label: '配色', value: themeMode(),
        options: [['auto', '跟随系统'], ['dark', '深色'], ['light', '浅色']],
        onPick: function (v) {
          setProp('lx.theme', v);
          refreshBgFx(true);
          setStatus('配色：' + themeLabel(v));
        } },
      { kind: 'seg', id: 'rowlines', label: '曲目清单', value: String(rowLines()),
        options: [['2', '双行'], ['1', '单行']],
        onPick: function (v) {
          /* 切换逻辑只有 toggleRowLines 一处，这里只在值真的变了才调 */
          if (String(rowLines()) !== String(v)) toggleRowLines();
          repaint();
        } },
      { kind: 'seg', id: 'hideplat', label: '第二排音源平台',
        value: hidePlatformRow ? '1' : '0',
        options: [['0', '显示'], ['1', '隐藏']],
        onPick: function (v) {
          setProp('lx.hidePlatformRow', v === '1' ? 1 : 0);
          hidePlatformRow = (v === '1');
          applyPlatformMode();
          setStatus(hidePlatformRow
            ? '已隐藏第二排平台按钮，各页数据固定来自 ' + platformName(fixedPlatform)
            : '已显示第二排平台按钮');
        } },
      { kind: 'note', text: function () {
          return hidePlatformRow
            ? '顶栏已收成一行，数据来自 ' + platformName(fixedPlatform) + '；想换一家点上面的「数据来自」。'
            : '隐藏后顶栏只剩一行（版本号 / 音源 / 音质一起收起），数据固定来自所选平台。';
        } },
      { kind: 'seg', id: 'quality', label: '音质', value: quality,
        options: [['auto', '自动'], ['128k', '128K'], ['320k', '320K'], ['flac', 'FLAC']],
        onPick: function (v) {
          setQuality(v);
          repaint();
        } },
      { kind: 'note', text: function () {
          var d = fbDlgFont();
          return '字号 ' + FONT_BASE + 'px' +
                 (fontSizeFollow() ? '（跟随 foobar2000 字体 ' + (d.size || '?') + 'px）' : '（手动）') +
                 ' · 缩放 ' + Math.round(UI_S * 100) + '%（探测 ' + Math.round(UI_AUTO * 100) + '%）';
        } },
      { kind: 'note', text: '字号只动字；整体放大调「界面缩放」。文字色跟 foobar2000 走。' }
    ] },

    { cat: 'bg', title: '封面背景', rows: [
      { kind: 'seg', id: 'bgart', label: '封面背景', value: bgArtEnabled() ? '1' : '0',
        options: [['1', '开'], ['0', '关']],
        onPick: function (v) { setBgArt(v === '1'); } },
      { kind: 'swatch', id: 'hue', label: '背景调色', value: hue,
        options: HUE_PRESETS,
        onPick: function (v) {
          setProp('lx.bgHue', v);
          refreshBgFx(true);
          setStatus('背景调色：' + hueName(v));
        } },
      /* 以下四个滑块都要重烘背景位图。以前 onSet 里直接 buildBackdrop()：
         拖 200px 就是 200 次「新建面板大小位图 + StackBlur + 整屏拉伸」，
         4K/200% 下每次 200 万像素 —— 这是拖滑块发沉的根。
         现在走 queueBackdrop：拖动期间合并成每 ~90ms 一次，松手 flushBackdrop。 */
      { kind: 'slider', inline: true, id: 'veil', label: '背景遮罩', min: 0, max: 100, value: bgVeil(),
        fmt: function (v) { return v + '%'; },
        onSet: function (v) {
          setProp('lx.bgVeil', v);
          queueBackdrop(90);
        } },
      { kind: 'slider', inline: true, id: 'blur', label: '背景模糊', min: 0, max: 40, value: bgBlur(),
        fmt: function (v) { return v === 0 ? '不模糊' : v + ' px'; },
        onSet: function (v) {
          setProp('lx.bgBlur', v);
          queueBackdrop(90);
        } },
      { kind: 'slider', inline: true, id: 'lum', label: '背景亮度', min: 40, max: 160, value: bgLum(),
        fmt: function (v) { return v + '%'; },
        onSet: function (v) {
          setProp('lx.bgLum', v);
          queueBackdrop(90);
        } },
      { kind: 'slider', inline: true, id: 'sat', label: '背景饱和度', min: 0, max: 100, value: bgSat(),
        fmt: function (v) { return v + '%'; },
        onSet: function (v) {
          setProp('lx.bgSat', v);
          queueBackdrop(90);
        } },
      /* 这两个只改绘制时的 alpha，不需要重烘背景，所以是真正的实时 */
      { kind: 'slider', inline: true, id: 'glass', label: '内容区不透明度', min: 0, max: 100, value: glassPct,
        fmt: function (v) { return v + '%'; },
        onSet: function (v) {
          setProp('lx.bgGlass', v);
          repaint();
        } },
      { kind: 'slider', inline: true, id: 'tint', label: '内容区染色', min: 0, max: 30, value: bgTint(),
        fmt: function (v) { return v === 0 ? '不染色' : v + '%'; },
        onSet: function (v) {
          setProp('lx.bgTint', v);
          repaint();
        } },
      { kind: 'slider', inline: true, id: 'ovscrim', label: '浮层遮罩', min: 0, max: 100, value: bgOverlayScrimPct(),
        fmt: function (v) { return v === 0 ? '透出封面' : v + '%'; },
        onSet: function (v) {
          setProp('lx.bgOverlayScrim', v);
          repaint();
        } },
      { kind: 'slider', inline: true, id: 'overlay', label: '浮层不透明度', min: 80, max: 100, value: bgOverlayPct(),
        fmt: function (v) { return v + '%'; },
        onSet: function (v) {
          setProp('lx.bgOverlay', v);
          repaint();
        } },
      { kind: 'note', text: '遮罩越小封面越清楚；内容区不透明度越小，面板越透。评论 / 艺人浮层也铺封面背景，『浮层遮罩』管它盖多厚；关掉封面背景时用『浮层不透明度』的实色（98% = 设置面板同款）。' }
    ] },

    { cat: 'src', title: '音源与属性', rows: [
      { kind: 'text', id: 'cacheDir', label: '缓存目录',
        value: propStr('lx.cacheDir', ''),
        disp: function () { return cacheDir() || '（未确定）'; },
        onCommit: function (t) {
          setProp('lx.cacheDir', t);
          setStatus(t ? '缓存目录：' + t : '缓存目录已恢复默认');
          repaint();
        },
        resetId: 'defCacheDir' },
      { kind: 'text', id: 'scriptDir', label: '音源目录',
        value: propStr('lx.scriptDir', ''),
        disp: function () {
          try { return sourcesDirFor() || '（自动探测）'; } catch (e) { return '（自动探测）'; }
        },
        onCommit: function (t) {
          setProp('lx.scriptDir', t);
          setStatus(t ? '音源目录：' + t : '音源目录已恢复自动探测');
          repaint();
        },
        resetId: 'defScriptDir' },
      { kind: 'btn', id: 'openScriptDir', label: '打开音源目录（资源管理器）…', close: true },
      { kind: 'seg', id: 'embed', label: '封面嵌入音频', value: propOn('lx.embedCover', 1) ? '1' : '0',
        options: [['1', '开'], ['0', '关']],
        onPick: function (v) {
          setProp('lx.embedCover', v);
          EMBED_COVER = embedCoverEnabled();
          setStatus(v === '1' ? '封面会写进 mp3 / flac 标签' : '封面只写同名 jpg，不写进音频');
          repaint();
        } },
      { kind: 'seg', id: 'push', label: '同时写同名 jpg', value: propOn('lx.pushCover', 0) ? '1' : '0',
        options: [['1', '开'], ['0', '关']],
        onPick: function (v) {
          setProp('lx.pushCover', v);
          PUSH_COVER = pushCoverEnabled();   /* 以前只写属性，开关要重启才生效 */
          setStatus(v === '1' ? '缓存目录里额外放一份同名 jpg' : '不再写同名 jpg');
          repaint();
        } },
      { kind: 'seg', id: 'download', label: '播放前缓存', value: propOn('lx.download', 1) ? '1' : '0',
        options: [['1', '开'], ['0', '关']],
        onPick: function (v) {
          setProp('lx.download', v);
          setStatus(v === '1' ? '先缓存到本地再播放' : '直接播网络地址，不落盘');
          repaint();
        } },
      { kind: 'note', text: '目录留空 = 用默认（缓存跟着 foobar2000 配置目录走，音源目录自动探测）。' },
      /* 条目和「诊断 / 日志」并排会更挤，单独一行更清楚 */
      { kind: 'btn', id: 'probe', label: '音源音质检测（各平台到底能出哪几档）…', close: true },
      { kind: 'note', text: function () {
          var scope = probeScriptId() ? ('只测 ' + probeScriptLabel() + ' · ') : '全部脚本 · ';
          if (probeBusy) return '音质检测：' + scope + probeMsg;
          if (!probeAt) return '音质检测：' + scope + '还没检测过。浮层顶部可选择只测哪个脚本，每个平台搜样本歌逐档要一次直链。';
          return '音质检测：' + scope + probeClock(probeAt) + ' · ' + probeSummary();
        } }
    ] },

    { cat: 'maint', title: '维护', rows: [
      { kind: 'btns', items: [
        { id: 'refresh', label: '刷新列表' },
        { id: 'reload', label: '重载音源', close: true }
      ] },
      { kind: 'btns', items: [
        { id: 'import', label: '导入音源…', close: true },
        { id: 'reembed', label: '重嵌封面' }
      ] },
      { kind: 'btns', items: [
        { id: 'clearcache', label: '清空缓存' },
        { id: 'logs', label: '诊断 / 日志', close: true }
      ] },
      { kind: 'btn', id: 'clearhw', label: '清空搜索历史（关键词记录）' },
      { kind: 'note', text: '清空缓存只删 cache 下的音频与 index.json，评论 / 艺人资料保留。' }
    ] }
  ];

  /* 第二排藏起来以后就没有平台按钮可点了，这里补一组「数据来自哪家」的按钮。
     默认网易云；换一家立刻按新平台重拉当前页。 */
  if (hidePlatformRow) {
    var look = secs[0].rows;
    var platRow = {
      kind: 'seg', id: 'fixedplat', label: '数据来自', value: fixedPlatform,
      options: platformChipOptions(),
      onPick: function (v) {
        setProp('lx.fixedPlatform', v);
        fixedPlatform = v;
        switchPlatform(v);
        setStatus('第二排已隐藏：各页数据来自 ' + platformName(v));
        repaint();
      }
    };
    var at = 0;
    for (var ri = 0; ri < look.length; ri++) if (look[ri].id === 'hideplat') { at = ri + 1; break; }
    look.splice(at, 0, platRow);
  }

  /* 播放音源：和顶栏右上角那格是同一份设置（lx.script.<平台>）。
     放在「数据来自」下面；没显示「数据来自」时就放在「第二排音源平台」下面。 */
  var lookRows = secs[0].rows;
  var playRow = {
    kind: 'pick', id: 'playScript', label: '播放音源',
    disp: function () {
      return scriptPrefId(platform) ? scriptShort(platform) : '自动（按加载顺序）';
    }
  };
  /* 在线音源：启动时拉一次，内容变了就写回音源目录并重载。
     文本框直接放在「播放音源」下面，和缓存目录 / 音源目录同款。 */
  var onlineRow = {
    kind: 'text', id: 'onlineScriptUrl', label: '在线音源网址',
    value: propStr('lx.onlineScriptUrl', ''),
    disp: function () { return '（.js 直链，留空则不检查更新）'; },
    onCommit: function (t) {
      t = String(t || '').trim();
      if (t && !/^https?:\/\//i.test(t)) {
        setStatus('在线音源网址必须以 http:// 或 https:// 开头', true);
        repaint();
        return;
      }
      setProp('lx.onlineScriptUrl', t);
      if (!t) {
        setStatus('已关闭在线音源自动更新');
        repaint();
        return;
      }
      setStatus('已保存在线音源网址，正在检查更新…');
      checkOnlineScript({ manual: true });
    },
    resetId: 'defOnlineScriptUrl'
  };
  var onlineNote = {
    kind: 'note',
    text: '启动时检查；有变化就下载到音源目录并重载。留空不检查，同名会覆盖。'
  };
  var atPlay = 0;
  for (var rj = 0; rj < lookRows.length; rj++) {
    if (lookRows[rj].id === 'fixedplat' ||
        (!hidePlatformRow && lookRows[rj].id === 'hideplat')) {
      atPlay = rj + 1;
      break;
    }
  }
  lookRows.splice(atPlay, 0, playRow);
  lookRows.splice(atPlay + 1, 0, onlineRow, onlineNote);
  return secs;
}

/* 设置里那组平台按钮：标签用顶栏同款两字短名（腾讯 / 网易 / …），5 格并排才够宽 */
var SET_PLAT_LABEL = { tx: '腾讯', wy: '网易', kw: '酷我', kg: '酷狗', mg: '咪咕' };
function platformChipOptions() {
  var order = (NM && NM.providers && NM.providers.order) || [];
  var meta = (NM && NM.providers && NM.providers.meta) || {};
  var out = [];
  for (var i = 0; i < order.length; i++) {
    var id = order[i];
    var m = meta[id] || {};
    out.push([id, SET_PLAT_LABEL[id] || m.short || m.name || id]);
  }
  return out;
}

function hueName(v) {
  for (var i = 0; i < HUE_PRESETS.length; i++) if (HUE_PRESETS[i].v === v) return HUE_PRESETS[i].name;
  return '自定义 ' + v + '°';
}

function rowHeightOf(row) {
  if (row.kind === 'slider') return row.inline ? SET_ROW_SLIDER_IN : SET_ROW_SLIDER;
  if (row.kind === 'swatch') return SET_ROW_SWATCH;
  if (row.kind === 'btn' || row.kind === 'btns') return SET_ROW_BTN;
  if (row.kind === 'text' || row.kind === 'pick') return SET_ROW_TEXT;
  if (row.kind === 'note') return SET_ROW_NOTE;
  return SET_ROW_SEG;
}

/* 每行内部的可点区域。绘制和命中都用这一份，保证「看到哪就是点到哪」 */
function rowHits(it) {
  var row = it.row, x = it.x, w = it.w, y = it.ay, h = it.h;
  var out = [];
  var i, n, gap, ow, oy;

  var box = ctlBox(x, w);
  var cx = box[0], cw = box[1];

  if (row.kind === 'seg') {
    n = row.options.length;
    gap = 6;
    ow = Math.floor((cw - gap * (n - 1)) / n);
    oy = y + Math.round((h - 26) / 2);
    for (i = 0; i < n; i++) {
      out.push({ k: 'opt', v: row.options[i][0],
                 rect: { x: cx + i * (ow + gap), y: oy, w: ow, h: 26 } });
    }
  } else if (row.kind === 'swatch') {
    n = row.options.length;
    var sg = 8;
    var sw = Math.max(14, Math.min(30, Math.floor((cw - sg * (n - 1)) / n)));
    var sy = y + Math.round((h - 20) / 2);
    for (i = 0; i < n; i++) {
      out.push({ k: 'opt', v: row.options[i].v,
                 rect: { x: cx + i * (sw + sg), y: sy, w: sw, h: 20 } });
    }
  } else if (row.kind === 'slider') {
    if (row.inline) {
      /* 单行式：label 在左、数值在右，中间是轨道 */
      out.push({ k: 'slider', rect: { x: cx, y: y + 2, w: Math.max(30, cw - 58), h: h - 4 } });
    } else {
      out.push({ k: 'slider', rect: { x: x, y: y + 20, w: w, h: 24 } });
    }
  } else if (row.kind === 'text') {
    out.push({ k: 'edit', rect: { x: cx, y: y + 6, w: Math.max(40, cw - 66), h: h - 12 } });
    out.push({ k: 'btn', id: row.resetId, label: '默认',
               rect: { x: cx + Math.max(40, cw - 66) + 10, y: y + 6, w: 56, h: h - 12 } });
  } else if (row.kind === 'pick') {
    out.push({ k: 'pick', id: row.id,
               rect: { x: cx, y: y + 6, w: Math.max(40, cw), h: h - 12 } });
  } else if (row.kind === 'btn') {
    out.push({ k: 'btn', id: row.id, close: row.close, label: row.label,
               rect: { x: x, y: y + 2, w: w, h: h - 4 } });
  } else if (row.kind === 'btns') {
    var cgap = 8;
    var cw = Math.floor((w - cgap) / 2);
    for (i = 0; i < row.items.length; i++) {
      out.push({ k: 'btn', id: row.items[i].id, close: row.items[i].close,
                 label: row.items[i].label,
                 rect: { x: x + i * (cw + cgap), y: y + 2, w: cw, h: h - 4 } });
    }
  }
  return out;
}

function settingsResetRect() {
  if (!setOpen) return null;
  return { x: Math.max(60, W - 34 - 10 - 96), y: 10, w: 96, h: 26 };
}

function settingsCloseRect() {
  if (!setOpen) return null;
  return { x: W - 34, y: 10, w: 26, h: 26 };
}

/* 缓存 key。
   除了 setVer（setProp 递增），还要拼上「值直接来自模块变量」的几项：
   quality / rowLines / EMBED_COVER / PUSH_COVER。这几个一旦有人绕过 setProp
   直接 window.SetProperty，行上的 value 就还是旧的 —— 按钮点了不换高亮，
   看着像「失效」（v1.9.18 就踩过：音质和曲目清单那两排分段按钮）。
   这几个都是变量读（rowLines 自己有缓存），不碰宿主，几乎零成本。 */
function settingsSig() {
  return W + 'x' + H + '|' + setCat + '|' + setScroll + '|' + setVer +
         '|q' + quality + '|r' + rowLines() +
         '|e' + (EMBED_COVER ? 1 : 0) + '|p' + (PUSH_COVER ? 1 : 0) +
         /* 检测结果变了，那条「音质检测：…」的说明才会跟着更新 */
         '|pb' + (probeBusy ? 'b' : '') + (probeAt || 0);
}

/* 整屏覆盖：顶部标题条 + 左栏分类 + 右侧内容 + 底部属性提示。
   面板窄到放不下左栏时，分类改成标题下方的一排分段按钮。 */
function settingsLayout() {
  /* 缓存命中就直接返回（见 setVer 那段注释）。尺寸 / 分类 / 滚动 / 任何属性值
     一变，key 就不同，自动重算。 */
  var key0 = settingsSig();
  if (setLayoutCache && setLayoutKey === key0) return setLayoutCache;

  var wide = W >= 430;
  var padX = 16;
  var navW = wide ? Math.min(SET_NAV_W, Math.max(96, Math.round(W * 0.2))) : 0;
  var catBarH = wide ? 0 : 32;

  var secs = settingsSections();
  var cur = null, i;
  for (i = 0; i < secs.length; i++) if (secs[i].cat === setCat) cur = secs[i];
  if (!cur) { setCat = secs[0].cat; cur = secs[0]; }

  /* 内容区：常规面板最宽 700（滑块不横贯整屏）；4K / 宽屏下放宽到 900，
     否则 1920 逻辑宽的面板上中间空一大片，像没铺满 */
  var availW = W - (padX + navW) - padX;
  var wantW = Math.min(900, Math.max(700, Math.round(availW * 0.66)));
  var contentW = Math.max(150, Math.min(wantW, availW - 12));
  var contentX = padX + navW + Math.max(0, Math.round((availW - contentW) / 2));
  var top = SET_HEAD_H + catBarH + 8;
  var bottom = Math.max(top + 20, H - SET_FOOT_H);

  var items = [], y = 0;
  items.push({ kind: 'title', text: cur.title, h: SET_SEC_H, rel: y });
  y += SET_SEC_H;
  for (i = 0; i < cur.rows.length; i++) {
    var row = cur.rows[i];
    var rh = rowHeightOf(row);
    items.push({ kind: 'row', row: row, h: rh, rel: y });
    y += rh + 4;
  }
  y += 6;

  var viewH = Math.max(10, bottom - top);
  var maxScroll = Math.max(0, y - viewH);
  setScroll = clamp(setScroll, 0, maxScroll);

  var out = {
    wide: wide, navW: navW, catBarH: catBarH, padX: padX,
    panel: { x: 0, y: 0, w: W, h: H },
    contentX: contentX, contentW: contentW,
    top: top, bottom: bottom, maxScroll: maxScroll, contentH: y,
    items: [], navs: [], cats: []
  };

  /* 左栏分类 / 顶部分段 */
  if (wide) {
    var ny = SET_HEAD_H + 10;
    for (i = 0; i < SET_CATS.length; i++) {
      out.navs.push({ id: SET_CATS[i].id, name: SET_CATS[i].name,
                      rect: { x: 8, y: ny + i * 36, w: navW - 16, h: 32 } });
    }
  } else {
    var bw = Math.floor((W - padX * 2 - 6 * (SET_CATS.length - 1)) / SET_CATS.length);
    var by = SET_HEAD_H + 3;
    for (i = 0; i < SET_CATS.length; i++) {
      out.cats.push({ id: SET_CATS[i].id, name: SET_CATS[i].name,
                      rect: { x: padX + i * (bw + 6), y: by, w: bw, h: 26 } });
    }
  }

  for (i = 0; i < items.length; i++) {
    var it = items[i];
    it.x = contentX;
    it.w = contentW;
    it.ay = top + it.rel - setScroll;
    if (it.kind === 'row') it.hits = rowHits(it);
    out.items.push(it);
  }

  /* 缓存：用 clamp 之后的 setScroll 记 key，下一次同样的入参就能直接命中 */
  setLayoutCache = out;
  setLayoutKey = settingsSig();
  return out;
}

/* ---------------------------------------------------------------- 绘制 */
function drawSettings(gr) {
  if (!setOpen) return;
  var P = settingsLayout();
  var i;

  /* 整屏铺底：留一点封面透出来，但整块都是设置面板 */
  gr.FillSolidRect(0, 0, W, H, tint(C.bg, 252));

  /* 顶部标题条 */
  gr.FillSolidRect(0, 0, W, SET_HEAD_H, tint(C.panel, 244));
  gr.DrawLine(0, SET_HEAD_H, W, SET_HEAD_H, 1, A(C.line, 220));
  gr.GdiDrawText('面板设置', F.head, C.accent, 16, 1, Math.max(60, W - 200), 24, FLAG_LEFT);
  gr.GdiDrawText('改动即时生效，并写进面板属性', F.tiny, C.dim, 17, 21, Math.max(60, W - 210), 24, FLAG_LEFT);

  /* 右上：恢复默认 + × */
  var rb = settingsResetRect();
  var rhot = hoverOn(rb);
  gr.FillSolidRect(rb.x, rb.y, rb.w, rb.h, rhot ? tint(C.btnHot, 220) : tint(C.btn, 170));
  gr.DrawRect(rb.x + 0.5, rb.y + 0.5, rb.w - 1, rb.h - 1, 1, A(C.line, rhot ? 235 : 180));
  gr.GdiDrawText('恢复默认', F.small, rhot ? C.accent : C.dim, rb.x, rb.y, rb.w, rb.h, FLAG_CENTER);

  var cb = settingsCloseRect();
  var chot = hoverOn(cb);
  gr.FillSolidRect(cb.x, cb.y, cb.w, cb.h, chot ? A(C.err, 60) : tint(C.btn, 150));
  gr.DrawRect(cb.x + 0.5, cb.y + 0.5, cb.w - 1, cb.h - 1, 1, A(C.line, 190));
  gr.GdiDrawText('×', F.head, chot ? C.err : C.dim, cb.x, cb.y, cb.w, cb.h, FLAG_CENTER);

  /* 左栏分类 */
  if (P.wide) {
    gr.DrawLine(P.navW, SET_HEAD_H + 1, P.navW, H - SET_FOOT_H, 1, A(C.line, 170));
    for (i = 0; i < P.navs.length; i++) {
      var nv = P.navs[i], nr = nv.rect;
      var non = nv.id === setCat;
      var nhot = hoverOn(nr);
      if (non) gr.FillSolidRect(nr.x, nr.y, nr.w, nr.h, A(C.accent, 38));
      else if (nhot) gr.FillSolidRect(nr.x, nr.y, nr.w, nr.h, tint(C.btnHot, 150));
      if (non) gr.FillSolidRect(nr.x, nr.y + 4, 3, nr.h - 8, C.accent);
      gr.GdiDrawText(nv.name, F.small, non ? C.accent : (nhot ? C.text : C.dim),
                     nr.x + 12, nr.y, nr.w - 16, nr.h, FLAG_LEFT);
    }
  } else {
    for (i = 0; i < P.cats.length; i++) {
      var cv = P.cats[i], cr = cv.rect;
      var con = cv.id === setCat;
      var chot2 = hoverOn(cr);
      gr.FillSolidRect(cr.x, cr.y, cr.w, cr.h,
                       con ? A(C.accent, 46) : (chot2 ? tint(C.btnHot, 190) : tint(C.btn, 150)));
      gr.DrawRect(cr.x + 0.5, cr.y + 0.5, cr.w - 1, cr.h - 1, 1, con ? A(C.accent, 220) : A(C.line, 170));
      gr.GdiDrawText(cv.name, F.small, con ? C.accent : (chot2 ? C.text : C.dim),
                     cr.x, cr.y, cr.w, cr.h, FLAG_CENTER);
    }
  }

  /* 内容 */
  for (i = 0; i < P.items.length; i++) {
    var it = P.items[i];
    /* 只画完整露在可视区里的行，半截行压到底栏上很难看 */
    if (it.ay < P.top - 2 || it.ay + it.h > P.bottom + 2) continue;
    if (it.kind === 'title') {
      gr.GdiDrawText(it.text, F.small, C.accent, it.x, it.ay, it.w, it.h, FLAG_LEFT);
      continue;
    }
    drawSettingRow(gr, it);
  }

  if (P.maxScroll > 0) {
    drawScrollbar(gr, 'set', W - 9, P.top, P.bottom - P.top, P.contentH, P.bottom - P.top, setScroll);
  }

  /* 底部属性提示 */
  var fy = H - SET_FOOT_H;
  gr.FillSolidRect(0, fy, W, SET_FOOT_H, tint(C.panel, 230));
  gr.DrawLine(0, fy, W, fy, 1, A(C.line, 200));
  var hint = SET_CATS[catIndexOf(setCat)].hint;
  gr.GdiDrawText(hint, F.tiny, A(C.dim, 235), 16, fy, Math.max(40, W - 32), SET_FOOT_H, FLAG_LEFT);
}

function drawSettingRow(gr, it) {
  var row = it.row, x = it.x, w = it.w, y = it.ay, h = it.h;
  var i;

  if (row.kind === 'note') {
    /* text 可以是函数：设置项会随当前缩放 / 数值变化，每次都算一遍 */
    var nt = (typeof row.text === 'function') ? row.text() : row.text;
    gr.GdiDrawText(nt, F.tiny, A(C.dim, 225), x + 1, y, w - 2, h, FLAG_LEFT);
    return;
  }

  if (row.kind === 'btn' || row.kind === 'btns') {
    for (i = 0; i < it.hits.length; i++) {
      var bb = it.hits[i], br = bb.rect;
      var bhot = hoverOn(br);
      gr.FillSolidRect(br.x, br.y, br.w, br.h, bhot ? tint(C.btnHot, 220) : tint(C.btn, 170));
      gr.DrawRect(br.x + 0.5, br.y + 0.5, br.w - 1, br.h - 1, 1, A(C.line, bhot ? 240 : 180));
      gr.GdiDrawText(bb.label, F.small, bhot ? C.accent : C.text, br.x, br.y, br.w, br.h, FLAG_CENTER);
    }
    return;
  }

  /* 左侧统一标签列（色板行的标签跟色块等高，别沉到中间） */
  var swLh = Math.max(18, FONT_BASE + 6);
  var lh = row.kind === 'swatch' ? swLh : h;
  var ly = row.kind === 'swatch' ? (y + Math.round((h - swLh) / 2)) : y;
  gr.GdiDrawText(row.label, F.small, C.dim, x + 1, ly, SET_CTL_X - 12, lh, FLAG_LEFT);

  if (row.kind === 'pick') {
    /* 下拉选择框：和「音源目录」那一行同款，右侧两根线当箭头 */
    var pb = ctlBox(x, w);
    var ph = Math.max(20, h - 12), py = y + 6;
    var pr = { x: pb[0], y: py, w: pb[1], h: ph };
    var phot = hoverOn(pr);
    gr.FillSolidRect(pr.x, pr.y, pr.w, pr.h, phot ? tint(C.btnHot, 220) : tint(C.panel2, 215));
    gr.DrawRect(pr.x + 0.5, pr.y + 0.5, pr.w - 1, pr.h - 1, 1,
                phot ? C.accent : A(C.line, 185));
    var pv = row.disp ? row.disp() : String(row.value || '');
    var pac = phot ? C.accent : C.dim;
    gr.GdiDrawText(pv, F.small, C.text, pr.x + 8, pr.y,
                   Math.max(20, pr.w - 26), pr.h, FLAG_LEFT);
    var pax = pr.x + pr.w - 15, pay = pr.y + Math.round(pr.h / 2) - 2;
    gr.DrawLine(pax, pay, pax + 4, pay + 4, 1, pac);
    gr.DrawLine(pax + 8, pay, pax + 4, pay + 4, 1, pac);
    return;
  }

  if (row.kind === 'text') {
    var editing = (editKind === 'setting' && setEditRow === row);
    var tb = ctlBox(x, w);
    var eh = Math.max(20, h - 12), ey = y + 6;
    var ew = Math.max(40, tb[1] - 66);
    gr.FillSolidRect(tb[0], ey, ew, eh, editing ? tint(C.hover, 240) : tint(C.panel2, 215));
    gr.DrawRect(tb[0] + 0.5, ey + 0.5, ew - 1, eh - 1, 1, editing ? C.accent : A(C.line, 185));

    var shown = editing ? String(editText || '') : String(row.value || '');
    var empty = !shown;
    if (empty) shown = row.disp ? row.disp() : '（默认）';
    gr.GdiDrawText(shown, F.small, (empty && !editing) ? A(C.dim, 200) : C.text,
                   tb[0] + 6, ey, ew - 12, eh, FLAG_LEFT);

    if (editing && editBlinkOn) {
      var kx2 = textWidthOf(gr, String(editText || '').slice(0, editPos), F.small);
      var cx2 = tb[0] + 6 + Math.min(kx2, ew - 14);
      gr.FillSolidRect(cx2, ey + 4, 1, eh - 8, C.accent);
    }

    for (i = 0; i < it.hits.length; i++) {
      var tb = it.hits[i];
      if (tb.k !== 'btn') continue;
      var tr = tb.rect;
      var thot = hoverOn(tr);
      gr.FillSolidRect(tr.x, tr.y, tr.w, tr.h, thot ? tint(C.btnHot, 220) : tint(C.btn, 160));
      gr.DrawRect(tr.x + 0.5, tr.y + 0.5, tr.w - 1, tr.h - 1, 1, A(C.line, thot ? 235 : 175));
      gr.GdiDrawText(tb.label, F.small, thot ? C.accent : C.dim, tr.x, tr.y, tr.w, tr.h, FLAG_CENTER);
    }
    return;
  }

  if (row.kind === 'seg') {
    for (i = 0; i < it.hits.length; i++) {
      var seg = it.hits[i], sr = seg.rect;
      var on = String(seg.v) === String(row.value);
      var shot = hoverOn(sr);
      gr.FillSolidRect(sr.x, sr.y, sr.w, sr.h,
                       on ? A(C.accent, 56) : (shot ? tint(C.btnHot, 210) : tint(C.btn, 150)));
      gr.DrawRect(sr.x + 0.5, sr.y + 0.5, sr.w - 1, sr.h - 1, 1,
                  on ? A(C.accent, 225) : A(C.line, 175));
      gr.GdiDrawText(row.options[i][1], F.small,
                     on ? C.accent : (shot ? C.text : C.dim),
                     sr.x, sr.y, sr.w, sr.h, FLAG_CENTER);
    }
    return;
  }

  if (row.kind === 'swatch') {
    for (i = 0; i < it.hits.length; i++) {
      var sw = it.hits[i], wr = sw.rect;
      var son = sw.v === row.value;
      var col = sw.v < 0 ? (THEME === 'light' ? 0xF2F4F8 : 0x2A3444) : hueSwatch(sw.v);
      gr.FillSolidRect(wr.x, wr.y, wr.w, wr.h, A(col, son ? 255 : 200));
      gr.DrawRect(wr.x + 0.5, wr.y + 0.5, wr.w - 1, wr.h - 1, 1,
                  son ? C.accent : A(C.line, 190));
      if (sw.v < 0) {
        if (FONT_BASE <= 13) {
          gr.GdiDrawText('自', F.tiny, son ? C.accent : C.dim, wr.x, wr.y, wr.w, wr.h, FLAG_CENTER);
        } else {
          gr.FillSolidRect(wr.x + Math.round(wr.w / 2) - 3, wr.y + Math.round(wr.h / 2) - 3,
                           6, 6, A(C.bg, 235));
        }
      }
    }
    return;
  }

  if (row.kind === 'slider') {
    var valText = row.fmt ? row.fmt(row.value) : String(row.value);
    var t = (row.value - row.min) / Math.max(1, row.max - row.min);
    var tx, tw, by;

    if (row.inline) {
      var sb = ctlBox(x, w);
      tw = Math.max(30, sb[1] - 58);
      /* 数值框右边界正好贴到控件区右沿（以前固定 56 宽，会越出 8px） */
      gr.GdiDrawText(valText, F.small, C.accent, sb[0] + tw + 10, y,
                     Math.max(24, sb[1] - tw - 10), h, FLAG_RIGHT);
      tx = sb[0];
      by = y + Math.round(h / 2) - 2;
    } else {
      gr.GdiDrawText(valText, F.small, C.accent, x + w - 92, y, 92, 18, FLAG_RIGHT);
      tx = x + 1;
      tw = w - 2;
      by = y + 30;
    }
    gr.FillSolidRect(tx, by, tw, 4, A(C.line, 210));
    gr.FillSolidRect(tx, by, Math.max(2, Math.round(tw * t)), 4, A(C.accent, 225));
    var kx = tx + Math.round(tw * t) - 5;
    gr.FillSolidRect(kx, by - 6, 10, 16, C.accent);
    return;
  }
}

/* ---------------------------------------------------------------- 交互 */
function sliderValueAt(row, rect, mx) {
  var t = (mx - rect.x) / Math.max(1, rect.w);
  var v = row.min + (row.max - row.min) * clamp(t, 0, 1);
  return Math.round(v);
}

function settingsHit(x, y) {
  var cb = settingsCloseRect();
  if (cb && inRect(cb, x, y)) return { k: 'close' };
  var rb = settingsResetRect();
  if (rb && inRect(rb, x, y)) return { k: 'reset' };

  var P = settingsLayout();
  var i, j;

  for (i = 0; i < P.navs.length; i++) {
    if (inRect(P.navs[i].rect, x, y)) return { k: 'cat', v: P.navs[i].id };
  }
  for (i = 0; i < P.cats.length; i++) {
    if (inRect(P.cats[i].rect, x, y)) return { k: 'cat', v: P.cats[i].id };
  }

  for (i = 0; i < P.items.length; i++) {
    var it = P.items[i];
    if (it.kind !== 'row' || !it.hits) continue;
    /* 和 drawSettings 用同一个可见性判据：只画完整露出的行，那就只认完整露出的行。
       以前绘制跳过半截行、命中却照样认，会在底栏边缘点到看不见的控件。 */
    if (it.ay < P.top - 2 || it.ay + it.h > P.bottom + 2) continue;
    for (j = 0; j < it.hits.length; j++) {
      var hh = it.hits[j];
      if (inRect(hh.rect, x, y))
        return { k: hh.k, row: it.row, v: hh.v, rect: hh.rect, id: hh.id, close: hh.close };
    }
  }
  return { k: 'panel' };
}

function applySliderDrag(mx) {
  if (!setDrag) return;
  var P = settingsLayout();
  for (var i = 0; i < P.items.length; i++) {
    var it = P.items[i];
    if (it.kind !== 'row' || !it.hits || it.row.id !== setDrag) continue;
    for (var j = 0; j < it.hits.length; j++) {
      var hh = it.hits[j];
      if (hh.k !== 'slider') continue;
      var row = it.row;
      var v = sliderValueAt(row, hh.rect, mx);
      if (v === row.value) return;
      row.value = v;
      if (typeof row.onSet === 'function') row.onSet(v);
      repaint();
      return;
    }
  }
}

function settingsMouseDown(x, y) {
  var hit = settingsHit(x, y);
  if (hit.k === 'slider') {
    setDrag = hit.row.id;
    applySliderDrag(x);
    return true;
  }
  return true;
}

/* 松手时真正烘一次：拖动期间 queueBackdrop 一直在合并，最后那次值可能还没烘进去。
   只有改背景物理参数的那四个滑块需要，内容区不透明度 / 染色 / 字号都不用重烘。 */
var BG_FX_SLIDERS = { veil: 1, blur: 1, lum: 1, sat: 1 };

function settingsMouseUp(x, y) {
  var dragged = setDrag;
  setDrag = '';
  if (dragged && BG_FX_SLIDERS[dragged]) flushBackdrop();

  var hit = settingsHit(x, y);
  if (hit.k === 'close') { closeSettings(); return; }
  if (hit.k === 'reset') { resetSettingCat(); return; }
  if (hit.k === 'cat') {
    if (hit.v !== setCat) { setCat = hit.v; setScroll = 0; }
    repaint();
    return;
  }
  if (hit.k === 'pick') {
    /* 和顶栏右上角那格同一个菜单：改的是当前平台的播放音源脚本 */
    if (hit.id === 'playScript') openScriptMenu(x, y);
    return;
  }
  if (hit.k === 'edit') {
    if (hit.row && hit.row.kind === 'text') startSettingEdit(hit.row);
    return;
  }
  if (hit.k === 'opt' && typeof hit.row.onPick === 'function') {
    hit.row.onPick(hit.v);
    repaint();
    return;
  }
  if (hit.k === 'btn') {
    runSettingsButton(hit.id, hit.close);
    return;
  }
  if (hit.k === 'panel') {
    if (editKind === 'setting') commitEdit();   /* 点空白 = 提交正在编辑的路径 */
    return;
  }
}

/* 「恢复默认」按当前分类重置 */
function resetSettingCat() {
  var bg = false, ui = false;
  if (setCat === 'look') {
    setProp('lx.uiScale', 'auto');
    setProp('lx.fontSize', '');       /* 留空 = 跟随 foobar2000 的字体 */
    setProp('lx.fontScale', '');      /* 清掉老属性，免得盖住跟随 */
    setProp('lx.fontColor', '');      /* v1.9.16 起不再有文字色设置，顺手清掉 */
    setProp('lx.theme', 'auto');
    setProp('lx.rowLines', '2');
    setQuality('auto');
    /* 「播放音源」也回到自动（按脚本加载顺序） */
    setProp('lx.script.' + platform, '');
    /* 在线音源网址属于用户填的地址，恢复默认时一并清掉，避免继续自动下载 */
    setProp('lx.onlineScriptUrl', '');
    if (NM.lx && typeof NM.lx.clearResolveCache === 'function') NM.lx.clearResolveCache();
    ui = true;
  } else if (setCat === 'bg') {
    setProp('lx.bgArt', '1');
    setProp('lx.bgHue', -1);
    setProp('lx.bgVeil', 22);
    setProp('lx.bgBlur', 24);
    setProp('lx.bgLum', 100);
    setProp('lx.bgSat', 100);
    setProp('lx.bgGlass', 92);
    setProp('lx.bgTint', 0);
    setProp('lx.bgOverlay', 98);      /* v1.9.18：以前漏了这条，调到 100 就回不去 */
    setProp('lx.bgOverlayScrim', 62); /* v1.9.20：封面背景下浮层盖多厚 */
    setProp('lx.bgArtAlpha', '');     /* 清掉旧属性，免得盖住新值 */
    bg = true;
  } else if (setCat === 'src') {
    setProp('lx.cacheDir', '');
    setProp('lx.scriptDir', '');
    setProp('lx.embedCover', 1);
    setProp('lx.pushCover', 0);
    setProp('lx.download', 1);
    setProbeScript('');                 /* 检测范围回到「全部脚本」，旧结果作废 */
    EMBED_COVER = embedCoverEnabled();
    PUSH_COVER = pushCoverEnabled();
  }
  setStatus('已恢复「' + SET_CATS[catIndexOf(setCat)].name + '」的默认值');
  applyTheme(true);
  if (bg) { bgArtKey = ''; refreshBackground(true); }
  if (ui) { applyUiScale(); return; }   /* 缩放 / 字号也回到默认：重算布局并重绘 */
  buildBackdrop();
  repaint();
}

function runSettingsButton(id, close) {
  if (close) closeSettings();
  if (id === 'refresh') refreshCurrentPage();
  else if (id === 'reload') reloadSources();
  else if (id === 'import') importSourceScript();
  else if (id === 'reembed') reembedCurrentCover();
  else if (id === 'clearcache') clearCache();
  else if (id === 'logs') openDiagnostics();
  else if (id === 'openScriptDir') openScriptDirAction();
  else if (id === 'probe') openProbe();
  else if (id === 'defCacheDir') { setProp('lx.cacheDir', ''); setStatus('缓存目录已恢复默认'); }
  else if (id === 'defScriptDir') { setProp('lx.scriptDir', ''); setStatus('音源目录已恢复自动探测'); }
  else if (id === 'defOnlineScriptUrl') {
    setProp('lx.onlineScriptUrl', '');
    setStatus('已关闭在线音源自动更新');
    repaint();
  }
  else if (id === 'clearhw') {
    setProp('lx.keyword', '');
    setProp('lx.collKeyword.playlist', '');
    setProp('lx.collKeyword.podcast', '');
    setProp('lx.collKeyword.artist', '');
    searchKeyword = '';
    collKeyword = '';
    collKeywordMem = {};
    setStatus('已清空搜索历史');
  }
  repaint();
}

function drawFooter(gr) {
  var y = H - FOOT_H;
  gr.FillSolidRect(0, y, W, FOOT_H, tint(C.bg, BG_A.footer));
  gr.DrawLine(0, y, W, y, 1, C.line);

  var isErr = statusIsError;

  var col = busy ? C.accent : C.dim;
  if (isErr) col = C.err;
  else if (footHot) col = C.text;
  gr.GdiDrawText(status, F.small, col, PAD, y, Math.max(40, W - 240), FOOT_H, FLAG_LEFT);

  var src = sourceCount();
  var pin = scriptPrefId(platform);
  var hint = (NM.lx.state.loading ? '音源加载中'
    : (pin ? ('音源：' + scriptShort(platform)) : ('音源 ' + src))) + ' · 双击播放';
  var mc = multiCount();
  if (mc) hint = '已勾选 ' + mc + ' 首 · 右键批量加入播放列表';
  if (isErr) hint = '点此看原因 ›';        /* 失败时把"看原因"的入口放在最显眼处 */
  var hintCol = isErr ? C.err : (mc ? C.accent : C.dim);
  if (footHot && !isErr) hintCol = C.text;
  gr.GdiDrawText(hint, F.small, hintCol, W - 230, y, 220, FOOT_H, FLAG_RIGHT);
}

function on_paint(gr) {
  if (W <= 0 || H <= 0) return;

  /* 布局算的是逻辑像素，这里换成物理像素再交给 gdi（100% 时原样返回） */
  gr = scaledGraphics(gr);

  gr.SetTextRenderingHint(5);
  gr.SetSmoothingMode(4);
  drawBackdrop(gr);

  /* 取一次属性快照：这一帧里 tint / solidTint 读 FR，不再反复问宿主（见 beginFrame 注释）。
     必须放在 drawBackdrop 之后 —— 上面那句可能刚把 bgBackdrop 建出来。 */
  beginFrame();

  /* 设置面板整屏覆盖：底下的列表不用再画了 */
  if (setOpen) { drawSettings(gr); return; }

  drawHeader(gr);

  if (tab === 0) {
    drawBoardList(gr);
    drawTrackHeader(gr);
    drawTrackList(gr);
  } else if (isBrowseTab()) {
    drawSearchBox(gr);
    drawCollList(gr);
    drawTrackHeader(gr);
    drawTrackList(gr);
  } else {
    drawSearchBox(gr);
    drawTrackHeader(gr);
    drawTrackList(gr);
  }

  drawFooter(gr);

  if (overlay) {
    rebuildOverlayLines(false);
    drawOverlay(gr);
  }

  drawSettings(gr);      /* 设置面板压在一切之上 */
}
/* --------------------------------------------------------------------------
   交互
   -------------------------------------------------------------------------- */
function setCursorHand(on) {
  if (on === cursorHand) return;
  cursorHand = on;
  try { window.SetCursor(on ? 32649 : 32512); } catch (e) {}
}

/* 面板物理尺寸 → 逻辑尺寸。
   4K / 200% 下 window.Width = 3840，逻辑宽度仍是 1920 的观感，
   字号、行高、内边距才不会被「摊平」。ceil 是怕 round 掉的那点零头
   在贴背景时露出一条缝。 */
function syncPanelSize() {
  var pw = Number(window.Width) || 0;
  var ph = Number(window.Height) || 0;
  if (!(pw > 0)) pw = 600;
  if (!(ph > 0)) ph = 400;
  W = Math.max(1, Math.ceil(pw / UI_S));
  H = Math.max(1, Math.ceil(ph / UI_S));
}

function on_size() {
  var changed = refreshUiScale();   /* 拖到另一块屏 / 改了系统缩放：字体要重建 */
  syncPanelSize();
  computeLayout();
  clampScroll();
  if (overlay) rebuildOverlayLines(true);
  buildBackdrop();   /* 面板尺寸变了，重新烘一张背景 */
  sbGeom = {};       /* 旧滚动条几何作废，等这次绘制重建 */
  sbDrag = null;
  if (changed) logUiScale();
  repaint();
}

function logUiScale() {
  try {
    console.log('[LX-UI] 界面缩放 ' + Math.round(UI_S * 100) + '%' +
                '（自动探测 ' + Math.round(UI_AUTO * 100) + '%' +
                '），统一字号 ' + FONT_BASE + 'px' +
                '，面板 ' + W + '×' + H + ' 逻辑像素');
  } catch (e) {}
}

/* 设置面板改了缩放 / 字号：重建字体、重算布局。
   opts.quiet = 拖动中，不刷 console。
   注意背景位图只跟「面板尺寸 + 主题 + 背景参数」有关 —— 字号变了不需要重烘，
   以前这里无条件 buildBackdrop()，拖一次字号滑块就是几十上百次整屏重烘。 */
function applyUiScale(opts) {
  opts = opts || {};
  if (!refreshUiScale()) initTheme();   /* 值没变也要重建一次，防止字体被别处覆盖 */
  var w0 = W, h0 = H;
  syncPanelSize();
  computeLayout();
  clampScroll();
  if (overlay) rebuildOverlayLines(true);
  sbGeom = {};
  if (!opts.quiet) logUiScale();
  if (W !== w0 || H !== h0) buildBackdrop();   /* 只有尺寸真的变了才重烘 */
  repaint();
}

function selectTab(i) {
  i = clampTab(i);
  if (i === tab) return;
  if (editKind) endEdit();
  tab = i;
  try { window.SetProperty('lx.tab', tab); } catch (e) {}
  trackScroll = 0;
  boardScroll = 0;
  collScroll = 0;
  selected = -1;
  tracks = [];
  trackTitle = '';
  computeLayout();
  clampScroll();

  if (tab === 0) {
    if (viewMode !== 'board' || !tracks.length) loadBoard();
  } else if (tab === 1) {
    if (searchKeyword) openSearchAgain();
    else loadHot(false);      /* 不输关键词：直接给热门推荐曲目 */
  } else {
    /* 歌单 / 播客 / 歌手：进来直接给平台推荐，不用先输关键词 */
    loadRecommend(false);
  }
  repaint();
}

/* 鼠标回调给的是物理像素，命中测试用的全是逻辑坐标 —— 统一在这里除回去 */
function toLogical(v) { return (Number(v) || 0) / UI_S; }

function on_mouse_move(x, y, mask) {
  x = toLogical(x);
  y = toLogical(y);
  mouseX = x;
  mouseY = y;

  /* 掠过要不要重绘：默认 false（见 hoverPaintProp 注释）。
     关掉时这个回调只做一件事 —— 换光标，绝不 repaint。 */
  var drawHover = hoverPaintProp();

  /* 设置面板开着：只服务面板（拖滑块 / 悬停） */
  if (setOpen) {
    if (setDrag) {
      var held2 = (typeof mask === 'number') ? !!(mask & 1) : true;
      if (held2) { applySliderDrag(x); setCursorHand(true); return; }
      setDrag = '';
    }
    /* 整屏盖住了，只有落在控件上才换成手型 */
    var hh0 = settingsHit(x, y);
    setCursorHand(hh0.k !== 'panel');
    if (drawHover) {
      var hk = hh0.k + '|' + (hh0.row ? hh0.row.id : '') + '|' +
               (hh0.v == null ? '' : hh0.v) + '|' + (hh0.id || '');
      if (hk !== setHot) { setHot = hk; repaint(); }
    }
    return;
  }

  /* 正在拖滚动条：只更新位置，别的 hover 逻辑全跳过 */
  if (sbDrag) {
    var held = (typeof mask === 'number') ? !!(mask & 1) : true;
    if (!held) {
      sbDrag = null;
    } else {
      scrollDragTo(y);
      setCursorHand(true);
      return;
    }
  }

  if (overlay) {
    var cb = overlayCloseRect();
    var hotClose = !!(cb && inRect(cb, x, y));
    var hotSb = !!scrollbarHit(x, y);

    /* 艺人介绍：歌单行只认点击，指针掠过不画高亮，也不为它重绘；
       「更多…」是按钮，hover 变色照旧。 */
    var bIdx = bioSongAt(x, y);
    var bMore = false;
    if (overlay === 'bio' && bioSplitOn()) {
      var bmr = bioMoreRect(bioLayout());
      bMore = !!(bmr && inRect(bmr, x, y));
    }
    if (bMore !== bioMoreHot) {
      bioMoreHot = bMore;
      repaint();
    }

    /* 顶栏那两格在浮层开着时照样能点，hover 也要给反馈 */
    var barOnHere = scriptBarHot(x, y);
    if (barOnHere !== scriptHot) {
      scriptHot = barOnHere;
      repaint();
    }
    var qOnHere = qualityBarHot(x, y);
    if (qOnHere !== qBarHot) {
      qBarHot = qOnHere;
      repaint();
    }

    /* 音质检测：「检测音源」选择框 + 「重新检测」按钮，进 / 出各重绘一次 */
    if (overlay === 'probe') {
      var pab2 = probeAgainRect();
      var pOn = !!(pab2 && inRect(pab2, x, y));
      var pkr2 = probePickRect();
      var pkOn = !!(pkr2 && inRect(pkr2, x, y));
      var psr2 = probeStopRect();
      var psOn = !!(probeBusy && psr2 && inRect(psr2, x, y));
      if (pOn !== probeHot) {
        probeHot = pOn;
        repaint();
      }
      if (pkOn !== probePickHot) {
        probePickHot = pkOn;
        repaint();
      }
      if (psOn !== probeStopHot) {
        probeStopHot = psOn;
        repaint();
      }
      setCursorHand(hotClose || pOn || pkOn || psOn);
      return;
    }

    setCursorHand(hotClose || hotSb || bIdx >= 0 || bMore || barOnHere || qOnHere ||
                  (overlay === 'bio' && !!bioPicAt(x, y)));

    /* 浮层里鼠标只影响「×」和滚动条的高亮。默认不画，所以连这一步都省了。 */
    if (drawHover) {
      var okey = overlay + '|' + (hotClose ? 1 : 0) + (hotSb ? 1 : 0);
      if (okey !== overlayHot) { overlayHot = okey; repaint(); }
    }
    return;
  }

  var ti = trackAt(x, y);
  var bi = tab === 0 ? boardAt(x, y) : -1;
  var ci = isBrowseTab() ? collAt(x, y) : -1;

  var newKind = ti >= 0 ? 'track' : (bi >= 0 ? 'board' : (ci >= 0 ? 'coll' : ''));
  var newRow = newKind === 'track' ? ti : (newKind === 'board' ? bi : (newKind === 'coll' ? ci : -1));
  var newBtn = newKind === 'track' ? buttonAt(x, y) : '';

  var hand = false;
  if (scrollbarHit(x, y)) hand = true;
  else if (y >= H - FOOT_H) hand = true;      /* 底栏可点：诊断 / 日志 */
  else if (newBtn) hand = true;
  else if (checkAt(x, y) >= 0) hand = true;
  else if (newKind === 'track') hand = false;
  else if ((tab === 1 || isBrowseTab()) && inRect(L.search, x, y)) hand = true;
  else if (collRecRect() && inRect(collRecRect(), x, y)) hand = true;
  else if (sideToggleRect() && inRect(sideToggleRect(), x, y)) hand = true;
  else {
    for (var i = 0; i < TAB_DEFS.length; i++) if (inRect(tabRect(i), x, y)) hand = true;
    for (var j = 0; j < NM.providers.order.length; j++) if (inRect(platformRect(j), x, y)) hand = true;
    if (W >= 440 && inRect(qualityRect(), x, y)) hand = true;
    if (scriptBarRect() && inRect(scriptBarRect(), x, y)) hand = true;
    for (var b = 0; b < HEAD_BTNS.length; b++) {
      if (headerButtonVisible(HEAD_BTNS[b].key) && inRect(headerButtonRect(HEAD_BTNS[b].key), x, y)) hand = true;
    }
    if (newKind === 'board' || newKind === 'coll') hand = true;
  }
  setCursorHand(hand);

  /* 左栏收起 / 展开那个小箭头：只有 18×18，不给点反馈基本看不出能点。
     所以它不跟 lx.hoverPaint 走 —— 进 / 出各重绘一次，代价很小。 */
  var togR = sideToggleRect();
  var togHot = !!(togR && inRect(togR, x, y));
  if (togHot !== sideTogHot) {
    sideTogHot = togHot;
    repaint();
  }

  /* 顶栏两格下拉同理：都是小按钮，进 / 出各重绘一次给反馈 */
  var barHot = scriptBarHot(x, y);
  if (barHot !== scriptHot) {
    scriptHot = barHot;
    repaint();
  }
  var qHot = qualityBarHot(x, y);
  if (qHot !== qBarHot) {
    qBarHot = qHot;
    repaint();
  }

  /* ----------------------------------------------------------------
     到这里光标已经换好了，默认就结束 —— 一个像素都不画。

     以前下面三处 repaint 是「掠过发粘」的主因：在曲目清单上从上往下扫，
     每跨过一行就整屏重画一次（背景位图整屏贴 + 几十行文字 + 顶栏），
     在设置面板里划过一排按钮同理。拖动滚动条 / 滑块那种「确实要动画面」的
     路径在上面已经处理完并 return 了，不受影响。

     想要回 hover 高亮：属性 lx.hoverPaint=1。
     ---------------------------------------------------------------- */
  if (!drawHover) return;

  if (newRow !== hoverRow || newKind !== hoverKind || newBtn !== hoverBtn) {
    hoverRow = newRow;
    hoverKind = newKind;
    hoverBtn = newBtn;
    repaint();
  }

  /* 底栏 hover 也要重绘：否则"点此看原因"不会提亮 */
  var inFoot = y >= H - FOOT_H;
  if (inFoot !== footHot) {
    footHot = inFoot;
    repaint();
  }
}

function on_mouse_leave() {
  sbDrag = null;
  setCursorHand(false);
  if (sideTogHot) { sideTogHot = false; repaint(); }
  if (scriptHot) { scriptHot = false; repaint(); }
  if (qBarHot) { qBarHot = false; repaint(); }
  if (probeHot) { probeHot = false; repaint(); }
  /* 「更多…」的 hover 色要擦掉；歌单行没有 hover 态，不用管 */
  if (bioMoreHot) {
    bioMoreHot = false;
    repaint();
  }
  /* 默认不画 hover，离开时也就没什么要擦掉的；只在开着 hoverPaint 时收尾 */
  if (hoverRow !== -1 || hoverKind || hoverBtn || footHot) {
    hoverRow = -1;
    hoverKind = '';
    hoverBtn = '';
    footHot = false;
    if (hoverPaintProp()) repaint();
  }
}

/* 按住滚动条：滑块跟手拖，点轨道空白直接跳过去 */
function on_mouse_lbtn_down(x, y) {
  x = toLogical(x);
  y = toLogical(y);
  if (setOpen) return settingsMouseDown(x, y);
  var id = scrollbarHit(x, y);
  if (!id) {
    sbGuard = false;   /* 清掉可能残留的标记，别吞掉正常点击 */
    return false;
  }

  var g = sbGeom[id];
  var p = scrollbarParts(g);
  var onThumb = (y >= p.thumbY && y <= p.thumbY + p.thumbH);

  sbDrag = { id: id, grab: onThumb ? (y - p.thumbY) : Math.round(p.thumbH / 2) };
  sbGuard = true;
  scrollDragTo(y);
  repaint();
  return true;
}

function on_mouse_lbtn_up(x, y) {
  x = toLogical(x);
  y = toLogical(y);
  if (setOpen) { settingsMouseUp(x, y); return; }
  /* 这一次按下是拖滚动条：松开就结束，不要当成列表点击 */
  sbDrag = null;
  if (sbGuard) {
    sbGuard = false;
    hoverRow = -1;
    hoverKind = '';
    hoverBtn = '';
    repaint();
    return;
  }

  /* 浮层优先：关闭 / 点外面 / 艺人介绍里的歌单与「更多…」 */
  if (overlay) {
    /* 顶栏那两格不跟着「点外面就关」走：浮层开着也能直接换脚本 / 换音质 */
    if (scriptBarHot(x, y)) {
      var sbr0 = scriptBarRect();
      openScriptMenu(sbr0.x, sbr0.y + sbr0.h);
      return;
    }
    if (qualityBarHot(x, y)) {
      var qr0 = qualityRect();
      openQualityMenu(qr0.x, qr0.y + qr0.h);
      return;
    }
    var cbr = overlayCloseRect();
    if (cbr && inRect(cbr, x, y)) { closeOverlay(); return; }
    if (!inRect(L.overlay, x, y)) { closeOverlay(); return; }

    /* 音质检测：表格本身不可点；表格上方是「检测音源」选择框，
       左下角是「开始检测」和它下面的「停止检测」 */
    if (overlay === 'probe') {
      var pkr = probePickRect();
      if (pkr && inRect(pkr, x, y)) {
        openProbeScriptMenu(pkr.x, pkr.y + pkr.h);
        return;
      }
      var psr = probeStopRect();
      if (probeBusy && psr && inRect(psr, x, y)) {
        probeCancel();
        return;
      }
      var pab = probeAgainRect();
      if (pab && inRect(pab, x, y)) {
        if (!probeBusy) probeStart();
        return;
      }
      return;
    }

    if (overlay === 'bio' && bioSplitOn()) {
      var bg = bioLayout();

      /* 单击歌手图片 = 播放 / 暂停（v2.0.0）。延时 240ms 再执行，
         双击会在 on_mouse_lbtn_dblclk 里把这个定时器撤掉，改去打开图片 */
      if (bg.pic && inRect(bg.pic, x, y)) {
        if (Date.now() - bioPicDblAt < 500) return;      /* 双击的第二下 up */
        if (bioPicClickTimer) clearTimeout(bioPicClickTimer);
        bioPicClickTimer = setTimeout(function () {
          bioPicClickTimer = 0;
          togglePlayback();
        }, 240);
        return;
      }

      var bmr = bioMoreRect(bg);
      if (bmr && inRect(bmr, x, y)) { bioMoreClick(); return; }
      var si = bioSongAt(x, y);
      if (si >= 0) { bioSongSel = si; repaint(); return; }
    }
    return;
  }

  /* 底栏：点一下看诊断 / 日志（取链失败时这里就是"看原因"的入口） */
  if (y >= H - FOOT_H) {
    openDiagnostics();
    return;
  }

  /* 正在输入：点回输入框继续编辑，点右边「搜索」= 直接搜，点别处 = 确认 */
  if (editKind) {
    if (inRect(L.search, x, y)) {
      if (x >= L.search.x + L.search.w - 76) commitEdit();
      return;
    }
    commitEdit();
    return;
  }

  /* 行首方框：一次点击 = 勾上 / 取消（按住 Shift 连选一段） */
  var ck = checkAt(x, y);
  if (ck >= 0) {
    multiToggle(ck, keyPressed(0x10));
    return;
  }

  /* 左上角那一格现在是版本号，不再接鼠标（导入入口在设置 → 维护） */

  for (var b = 0; b < HEAD_BTNS.length; b++) {
    var btn = HEAD_BTNS[b];
    if (!headerButtonVisible(btn.key) || !inRect(headerButtonRect(btn.key), x, y)) continue;
    if (btn.key === 'settings') openSettings();
    else if (btn.key === 'comments') showComments();
    else if (btn.key === 'bio') showBio();
    return;
  }

  for (var i = 0; i < TAB_DEFS.length; i++) {
    if (inRect(tabRect(i), x, y)) {
      selectTab(i);
      return;
    }
  }

  /* 左栏右上角：收起 / 展开 */
  var togRect = sideToggleRect();
  if (togRect && inRect(togRect, x, y)) {
    toggleSide();
    return;
  }

  var recRect = collRecRect();
  if (recRect && inRect(recRect, x, y)) {
    /* 推荐模式下是「刷新」，搜索模式下是「回到推荐」 */
    loadRecommend(collMode === 'top');
    return;
  }

  var order = NM.providers.order;
  for (var j = 0; j < order.length; j++) {
    if (inRect(platformRect(j), x, y)) {
      if (platform !== order[j]) {
        window.SetProperty('lx.platform', order[j]);
        switchPlatform(order[j]);
      } else repaint();
      return;
    }
  }

  /* 顶栏音源下拉：点开就在格子下方弹菜单。浮层打开时顶栏被浮层盖住，
     上面那段已经 return，所以这里不必再判断 overlay */
  var sbr = scriptBarRect();
  if (sbr && inRect(sbr, x, y)) {
    openScriptMenu(sbr.x, sbr.y + sbr.h);
    return;
  }

  /* 音质下拉：四档列出来选（点一下轮换的老做法看着像开关，不知道还有哪几档） */
  if (W >= 440 && inRect(qualityRect(), x, y)) {
    var qrr = qualityRect();
    openQualityMenu(qrr.x, qrr.y + qrr.h);
    return;
  }

  if ((tab === 1) && inRect(L.search, x, y)) {
    openSearch();
    return;
  }
  if (isBrowseTab() && inRect(L.search, x, y)) {
    openBrowseSearch();
    return;
  }

  if (tab === 0) {
    var bi = boardAt(x, y);
    if (bi >= 0 && bi !== boardIndex) {
      boardIndex = bi;
      selected = -1;
      tracks = [];
      trackScroll = 0;
      repaint();
      loadBoard();
      return;
    }
  }

  if (isBrowseTab()) {
    var ci = collAt(x, y);
    if (ci >= 0 && ci !== collIndex) {
      collIndex = ci;
      selected = -1;
      tracks = [];
      trackScroll = 0;
      repaint();
      loadCollTracks(ci);
      return;
    }
  }

  var ti = trackAt(x, y);
  if (ti >= 0) {
    var b2 = buttonAt(x, y);
    if (b2 === 'play') {
      selected = ti;
      repaint();
      playTrack(tracks[ti], false);
      return;
    }
    if (b2 === 'queue') {
      selected = ti;
      repaint();
      playTrack(tracks[ti], true);
      return;
    }
    selected = ti;
    ensureVisible();
    repaint();
  }
}

function on_mouse_lbtn_dblclk(x, y) {
  x = toLogical(x);
  y = toLogical(y);
  if (setOpen) return;
  /* 艺人介绍：双击图片 → 系统默认看图程序；双击歌单 → 直接播这一首（v2.0.0） */
  if (overlay) {
    if (overlay === 'bio' && bioSplitOn() && !scrollbarHit(x, y)) {
      var bg = bioLayout();
      if (bg.pic && inRect(bg.pic, x, y)) {
        bioPicDblAt = Date.now();
        if (bioPicClickTimer) { clearTimeout(bioPicClickTimer); bioPicClickTimer = 0; }
        openArtistPic();
        return;
      }
      var si = bioSongAt(x, y);
      if (si >= 0 && bioTracks[si]) {
        bioSongSel = si;
        repaint();
        playTrack(bioTracks[si], false);
      }
    }
    return;
  }
  if (scrollbarHit(x, y)) return;
  if (checkAt(x, y) >= 0) return;      /* 双击方框只算勾选 */
  var ti = trackAt(x, y);
  if (ti >= 0 && !buttonAt(x, y)) {
    selected = ti;
    repaint();
    playTrack(tracks[ti], false);
  }
}

function on_mouse_wheel(step) {
  if (setOpen) {
    setScroll -= step * 3;
    var P = settingsLayout();
    setScroll = clamp(setScroll, 0, P.maxScroll);
    repaint();
    return;
  }

  if (overlay) {
    /* 艺人介绍：鼠标在左下歌单上滚歌单，在右侧正文上滚正文（v1.9.21） */
    if (overlay === 'bio' && bioSplitOn()) {
      var bg = bioLayout();
      var inSong = mouseX >= bg.listX && mouseX <= bg.listX + bg.listW &&
                   mouseY >= bg.listY && mouseY <= bg.bottom;
      if (inSong) {
        bioSongScroll -= step * 3;
        bioSongClamp(bg);
        repaint();
        return;
      }
    }
    overlayScroll -= step * 3;
    var maxO = Math.max(0, overlayRowCount() - visOverlayLines());
    overlayScroll = clamp(overlayScroll, 0, maxO);
    repaint();
    return;
  }

  var overList = false;
  if (!sideCollapsed && (tab === 0 || isBrowseTab())) overList = mouseX < L.board.x + L.board.w + 6;
  if (overList && tab === 0) boardScroll -= step * 3;
  else if (overList && isBrowseTab()) collScroll -= step * 3;
  else trackScroll -= step * 3;
  clampScroll();
  repaint();
}

function on_key_down(vkey) {
  if (vkey === 0x10) { shiftDown = true; return; }
  if (vkey === 0x11) { ctrlDown = true; return; }
  keyGuard = '';

  /* 正在搜索框里打字：回车搜索、Esc 取消、方向键移光标，其余键不触发列表操作 */
  if (editKind && editKey(vkey)) return;

  if (vkey === 0x1B) {          // Esc
    if (setOpen) { closeSettings(); return; }
    if (overlay) closeOverlay();
    return;
  }
  if (overlay) {
    if (vkey === 0x26) { overlayScroll -= 1; clampScroll(); repaint(); }
    else if (vkey === 0x28) { overlayScroll += 1; clampScroll(); repaint(); }
    else if (vkey === 0x21) { overlayScroll -= visOverlayLines(); clampScroll(); repaint(); }
    else if (vkey === 0x22) { overlayScroll += visOverlayLines(); clampScroll(); repaint(); }
    return;
  }
  if (setOpen) {
    /* 设置面板开着：只认 Esc（关面板）和左右键（切分类），别顺带触发播放 / 刷新 */
    if (vkey === 0x25) { shiftCat(-1); return; }
    if (vkey === 0x27) { shiftCat(1); return; }
    return;
  }

  /* 回车：有选中的曲目就照旧播放；否则开搜索 / 用上一次的关键词重搜 */
  if (vkey === 0x0D) {
    if (selected >= 0 && tracks[selected]) { playTrack(tracks[selected], false); return; }
    enterKeySearch();
    return;
  }

  if (vkey === 0xBF) {          // /
    if (isBrowseTab()) openBrowseSearch();
    else openSearch();
    return;
  }
  if (vkey === 0x72) {          // F3：评论
    showComments();
    return;
  }
  if (vkey === 0x74) {          // F5
    reloadSources();
    return;
  }

  if (vkey === 0x26 || vkey === 0x28 || vkey === 0x21 || vkey === 0x22 ||
      vkey === 0x24 || vkey === 0x23 || vkey === 0x25 || vkey === 0x27) {
    if (!tracks.length) return;
    var cols = trackColCount();                       /* 两列时上下键按「行」跳 */
    var page = Math.max(1, visTrackRows() - 1) * cols;
    if (vkey === 0x26) selected = clamp(selected - cols, 0, tracks.length - 1);
    else if (vkey === 0x28) selected = clamp(selected + cols, 0, tracks.length - 1);
    else if (vkey === 0x21) selected = clamp(selected - page, 0, tracks.length - 1);
    else if (vkey === 0x22) selected = clamp(selected + page, 0, tracks.length - 1);
    else if (vkey === 0x25) selected = clamp(selected - 1, 0, tracks.length - 1);
    else if (vkey === 0x27) selected = clamp(selected + 1, 0, tracks.length - 1);
    else if (vkey === 0x24) selected = 0;
    else if (vkey === 0x23) selected = tracks.length - 1;
    ensureVisible();
    repaint();
    return;
  }

  if (vkey === 0x20) {
    if (selected >= 0 && tracks[selected]) playTrack(tracks[selected], false);
  }
}

/* 回车开搜索（不在输入状态时也能用）
   搜索页：有关键词就重搜，没有就进入输入
   歌单 / 播客 / 歌手页：用该页自己的关键词，同理会进入输入
   排行榜页：先切到搜索页，再进入输入 */
function enterKeySearch() {
  if (overlay) return;

  if (isBrowseTab()) {
    var kw = collKeywordOf(browseKind());
    if (kw) {
      collKeyword = kw;
      setStatus('搜索' + browseLabel() + '：' + kw + ' …');
      runBrowseSearch();
    } else {
      startEdit('coll');
    }
    return;
  }

  if (tab !== 1) {
    selectTab(1);
    startEdit('search');
    return;
  }

  if (searchKeyword) {
    setStatus('搜索：' + searchKeyword + ' …');
    runSearch(searchKeyword);
  } else {
    startEdit('search');
  }
}

/* 松开按键：记下 Shift / Ctrl 状态（on_char 那套用得上）；
   另外兜一层回车 / Esc —— 某些组件版本 on_key_down 收不到回车 */
function on_key_up(vkey) {
  if (vkey === 0x10) shiftDown = false;
  else if (vkey === 0x11) ctrlDown = false;
  else if (vkey === 0x0D && editKind) commitEdit();
  else if (vkey === 0x1B && editKind) cancelEdit();
}

/* 面板直接收键盘字符（中文输入法上屏后也会走这里） */
function on_char(code) {
  if (!editKind) return false;
  /* 回车 / 换行：有的组件把回车当字符消息送过来，同样当作「提交搜索」 */
  if (code === 13 || code === 10) { commitEdit(); return true; }
  if (!(code >= 32)) return false;
  var s = String.fromCharCode(code);
  /* 这个字符刚才已经在 on_key_down 里插过了（大小写可能不同，忽略比较），别重复 */
  if (keyGuard) {
    var a = keyGuard.toLowerCase(), b = s.toLowerCase();
    keyGuard = '';
    if (a === b) return true;
    editInsert(s);
    return true;
  }
  editInsert(s);
  return true;
}

/* 刷新项的文字跟着当前页签走（排行榜 = 刷新当前榜单） */
function refreshLabel() {
  return tab === 0 ? '刷新当前榜单'
    : (isBrowseTab() ? (collMode === 'top' ? '刷新' + collTopName() : '刷新搜索结果')
      : (hotMode ? '刷新热门推荐' : '重新搜索'));
}

/* 顶栏 / 左侧栏的右键菜单：只留「面板设置…」和「刷新当前榜单」两项。
   这两块地方右键多半是想改设置或重拉一下榜，塞一长串曲目操作反而碍事。 */
function compactContextMenu(x, y) {
  var m = window.CreatePopupMenu();
  m.AppendMenuItem(MF_STRING, 30, '面板设置…' + (lastProblem ? '（有新问题）' : ''));
  m.AppendMenuItem(MF_STRING, 10, refreshLabel());
  var id = m.TrackPopupMenu(x, y);
  if (id === 30) openSettings();
  else if (id === 10) refreshCurrentPage();
  return true;
}

function on_mouse_rbtn_up(x, y) {
  x = toLogical(x);
  y = toLogical(y);
  if (setOpen) return true;      /* 设置面板里不弹菜单 */

  /* 顶栏：页签 / 平台 / 音源与音质下拉 / 右侧按钮，整条都只给两项 */
  if (y < HEAD_H) return compactContextMenu(x, y);

  /* 浮层里只有「热门歌曲」还留右键菜单（v2.0.0）。
     歌曲评论、艺人介绍的正文与图片都不弹菜单 —— 右键在那儿等于没反应 */
  if (overlay) {
    if (overlay === 'bio' && bioSplitOn()) {
      var si = bioSongAt(x, y);
      if (si >= 0 && bioTracks[si]) {
        bioSongSel = si;
        repaint();
        var bm = window.CreatePopupMenu();
        bm.AppendMenuItem(MF_STRING, 1, '播放：' + (bioTracks[si].title || ''));
        bm.AppendMenuItem(MF_STRING, 2, '加入「' + PLAYLIST_NAME + '」：' + (bioTracks[si].title || ''));
        var bid = bm.TrackPopupMenu(x, y);
        if (bid === 1) playTrack(bioTracks[si], false);
        else if (bid === 2) playTrack(bioTracks[si], true);
      }
    }
    return true;
  }

  /* 左侧栏：榜单列表 / 集合列表（含它那行标题）也只给两项 */
  if (inRect(L.board, x, y)) return compactContextMenu(x, y);

  syncMulti();
  var ti = trackAt(x, y);
  if (ti >= 0) {
    selected = ti;
    repaint();
  }

  var mc = multiCount();
  var m = window.CreatePopupMenu();
  if (mc > 0) {
    m.AppendMenuItem(MF_STRING, 3, '加入「' + PLAYLIST_NAME + '」：已勾选 ' + mc + ' 首');
    m.AppendMenuItem(MF_STRING, 4, '取消全部勾选');
    m.AppendMenuSeparator();
  }
  if (ti >= 0) {
    m.AppendMenuItem(MF_STRING, 1, '播放：' + tracks[ti].title);
    m.AppendMenuItem(MF_STRING, 2, '加入「' + PLAYLIST_NAME + '」');
    m.AppendMenuItem(MF_STRING, 5, '勾选这一行（也可左键点行首方框）');
    m.AppendMenuSeparator();
  }
  if (tracks.length) {
    m.AppendMenuItem(MF_STRING, 6, '全部勾选（' + tracks.length + ' 首）');
  }
  m.AppendMenuItem(MF_STRING, 7, '输入关键词（中文输入法）…');
  m.AppendMenuSeparator();

  /* 上下文相关的两项：只在这个页签下才有意义，留着方便 */
  if (isBrowseTab()) m.AppendMenuItem(MF_STRING, 19, '网易云' + collTopName() + '（不用关键词）');
  if (tab === 1) {
    m.AppendMenuItem(MF_STRING, 25, '刷新热门推荐（' + hotBoardDef().name + '）');
    m.AppendMenuItem(MF_STRING, 26, '热门推荐换一份榜（热歌 / 飙升 / 新歌）');
  }
  m.AppendMenuItem(MF_STRING, 10, refreshLabel());
  m.AppendMenuSeparator();
  /* 其余设置项（配色 / 背景 / 行数 / 音质 / 音源维护 / 诊断）都在右上角「设置」里 */
  m.AppendMenuItem(MF_STRING, 30, '面板设置…' + (lastProblem ? '（有新问题）' : ''));

  var id = m.TrackPopupMenu(x, y);
  if (!id) return true;

  if (id === 1) playTrack(tracks[ti], false);
  else if (id === 2) playTrack(tracks[ti], true);
  else if (id === 3) addManyToPlaylist(multiList());
  else if (id === 4) multiClear(false);
  else if (id === 5) multiToggle(ti, false);
  else if (id === 6) multiSelectAll();
  else if (id === 7) promptKeyword(isBrowseTab() ? 'coll' : 'search');
  else if (id === 19) loadRecommend(true);
  else if (id === 25) loadHot(true);
  else if (id === 26) switchHotBoard();
  else if (id === 30) openSettings();
  else if (id === 10) refreshCurrentPage();

  return true;
}

/* 切换平台后按当前关键词重新搜索 */
function openSearchAgain() {
  var kw = searchKeyword;
  if (!kw) return;
  hotMode = false;
  computeLayout();                 /* 搜索结果有标题行，高度要还回去 */
  var token = ++reqSeq;
  busy = true;
  viewMode = 'search';
  tracks = [];
  trackTitle = '搜索：' + kw;
  selected = -1;
  trackScroll = 0;
  setStatus('正在搜索「' + kw + '」…');
  NM.providers.search([platform], kw, 1, 50).then(function (list) {
    if (token !== reqSeq) return;
    busy = false;
    var res = list && list[0];
    trackTitle = '搜索：' + kw;
    tracks = (res && res.ok && res.tracks) || [];
    trackScroll = 0;
    selected = tracks.length ? 0 : -1;
    setStatus(res && res.ok ? ('「' + kw + '」 · ' + tracks.length + ' 首')
                            : ('搜索失败：' + ((res && res.error) || '未知错误')), !(res && res.ok));
  });
}

/* --------------------------------------------------------------------------
   启动
   -------------------------------------------------------------------------- */
function init() {
  /* 搜索词不再写进面板属性：顺手把老版本存下的清掉，升级后第一次启动就是干净的 */
  ['lx.keyword', 'lx.collKeyword.playlist', 'lx.collKeyword.podcast', 'lx.collKeyword.artist']
    .forEach(function (k) { try { window.SetProperty(k, ''); } catch (e) {} });

  refreshUiScale();         /* 先定缩放：字体、布局、命中测试都跟着它走 */
  syncPanelSize();

  enableCharInput();        /* 不声明 DLGC_WANTCHARS，on_char 收不到任何字符 */
  applyTheme(true);
  /* refreshUiScale 只在缩放 / 字号真的变了时才建字体；没变时这里补一次。
     以前是无条件再调一遍 initTheme()，启动时白建了 6 个 gdi.Font（v1.9.18）。 */
  if (!F.head) initTheme();
  logUiScale();

  if (NM.providers.order.indexOf(platform) < 0) platform = 'tx';
  if (QUALITIES.indexOf(quality) < 0) quality = 'auto';

  refreshBoards();
  computeLayout();

  NM.lx.onChange(function () {
    repaint();
  });

  /* 榜单不依赖音源脚本，先加载；脚本在后台初始化。
     以前这里还有一句 `tab === 1 && searchKeyword` 的分支 —— searchKeyword
     恒以 '' 起步、lx.keyword 又被清空，那段永远走不到，删掉（v1.9.18）。 */
  if (tab === 0 && boards.length) loadBoard();
  else if (tab === 1) setTimeout(function () { loadHot(false); }, 60);
  else if (isBrowseTab()) setTimeout(function () { loadRecommend(false); }, 60);

  /* 当前正在播放的曲目：取专辑封面做背景。
     900ms 那次用 false：fb2k 恢复上次播放的曲目时封面可能还没读到，
     key 变了自然会重建；key 没变就不该再烘一遍。 */
  refreshBackground(true);
  setTimeout(function () { refreshBackground(false); }, 900);

  /* 定时检查软件深浅色（面板不重绘时也能发现设置变化） */
  startThemeWatch();

  setTimeout(function () {
    NM.lx.loadAll({ delay: 120 }).then(function (runtimes) {
      var ok = (runtimes || []).filter(function (r) { return r.sources; }).length;
      if (ok) setStatus('音源已就绪：' + ok + ' 个脚本可用');
      else {
        setLastProblem('没有可用的音源脚本\n' + sourcesFailText());
        setStatus('没有可用的音源脚本（点状态栏看原因）', true);
      }
      /* 本地脚本就绪后再查在线网址：有更新会写回并重新加载 */
      checkOnlineScript({ startup: true });
    }, function (e) {
      setLastProblem('音源加载失败\n' + ((e && e.message) || e) + '\n' + sourcesFailText());
      setStatus('音源加载失败（点状态栏看原因）', true);
      checkOnlineScript({ startup: true });
    });
  }, 200);

  /* 清掉播放列表里指向已删除缓存文件的死条目：点它们只会报
     「无法打开用于播放的项目(不支持的格式或文件损坏)」。
     延后一点，等 foobar2000 把播放列表读完再动。 */
  setTimeout(function () {
    pruneCacheIndex();
    cleanPlaylistDeadCache();
  }, 1200);

  repaint();
}

/* --------------------------------------------------------------------------
   播放事件：切歌时换背景封面
   -------------------------------------------------------------------------- */
function on_playback_new_track(handle) {
  /* 延到下一轮事件循环再取图 + 烘背景：这个回调里同步做「GetAlbumArtV2 读文件 +
     Resize + StackBlur + 整屏拉伸」，自动连播时会让切歌顿一下（v1.9.18）。 */
  setTimeout(function () { refreshBackground(true); }, 0);
  /* 从 foobar2000 播放列表直接播缓存曲目时，也把封面摆到音轨旁边 */
  try { pushCoverForHandle(handle); } catch (e) {}
  repaint();
}

function on_playback_starting(cmd, is_paused) {
  setTimeout(function () { refreshBackground(false); }, 120);
}

function on_playback_stop(reason) {
  /* 保留上一张封面，停止播放时背景不闪 */
}

function on_script_unload() {
  stopThemeWatch();
  stopEditBlink();
  disposeObj(brandLogo);
  brandLogo = null;
  brandLogoChecked = false;
}

init();
