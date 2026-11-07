/* ==========================================================================
   Lxbox · 洛雪音源 JSplitter 面板
   发布页：https://github.com/zjpm-commits/foobar-Lxbox-for-jsplitter

   一、这是什么
     运行在 foobar2000 的 foo_uie_jsplitter 面板中，用来浏览、搜索和播放
     多平台在线音乐。数据可来自 QQ、网易云、酷我、酷狗、咪咕；实际播放
     直链由音源脚本提供，可按加载顺序自动选择，也可为每个平台指定脚本。
     播放前默认先缓存到本地；同名、同扩展名的音频已存在时直接播放，
     不重复取链、下载或写入标签。关掉「检测扩展名」后，同名文件不论
     扩展名（mp3 / flac / m4a…）都直接播那一份。

   二、主要功能
     1. 浏览与搜索
        - 排行榜：QQ / 网易 / 酷我 / 酷狗 / 咪咕。
        - 搜索：在当前平台搜索单曲；不输关键词时显示热门推荐。
        - 歌单 / 播客 / 歌手：进入后显示推荐，也可输入关键词搜索。
        - 推荐内容随当前平台切换；播客推荐仅网易云提供，其它平台会提示。
     2. 播放与曲目管理
        - 双击曲目播放；曲目行首方框支持多选，Shift 可连续选择。
        - 右键可把选中的曲目批量加入「洛雪音源」播放列表，或批量下载到缓存并写标签。
        - 播放列表中已有同一缓存文件时直接播放该条目，不重复添加。
     3. 评论与艺人资料
        - 顶栏「评论」或 F3：打开 / 关闭当前歌曲评论浮层。
        - 顶栏「简介」或 F4：打开 / 关闭当前艺人介绍浮层。
        - 浮层打开时，F3 / F4 可在评论与艺人介绍之间切换，Esc 关闭。
     4. 外观与背景
        - 字体、字号、文字颜色默认跟随 foobar2000 的显示设置。
        - 可调整配色、曲目清单行数、行距，以及背景效果 / 四个区块 / 浮层三段设置。
        - 面板内容较宽时曲目可排成两列；设置项修改后即时生效并写入属性。
     5. 缓存与音源维护
        - mp3 / flac 分目录缓存，缓存目录和音源目录均可修改。
        - 播放方式三选一：在线流播 / 边下边播 / 下完再播。
        - 流播时可把封面挂到播放项、并可选留一份 cover.jpg。
        - 曲目信息广播：直链项在 fb2k 里没有标签，皮肤面板从 metadb 取 %artist% /
          %title% 只能拿到空和 URL 末段。面板把自己手上的歌手 / 歌名广播出去
          （lx_now_info / lx_now_json / lx_now_text），并写一份
          nowplaying\info.json（含 items 路径索引），皮肤的面板接住即可显示。
        - 流播时直接把歌手 / 歌名交给 ESLyric 搜词（IESLyricControl.RequestLyric），
          不依赖 fb2k 的 %artist%（流播项里它恒空），歌词搜索框两栏都有值。
        - 支持封面写入音频标签、额外保存同名 jpg。
        - 支持导入 / 重载音源、重嵌封面、清理缓存、音质检测和诊断日志。
        - 可填写在线音源 .js 直链：启动时检查，有变化则下载覆盖并重载。

   三、安装与目录
     1. 将 main.js、crypto.js、lx.js、providers.js 放在同一模块目录，
        通常为 JSplitter\net；tagwriter.js 可选，建议一起放置以支持
        更完整的音频标签 / 封面写入。
     2. 模块目录也可通过面板属性 lx.moduleDir 指定。
     3. 音源脚本放在自动探测到的 sources 目录；如未识别，在
        设置 → 音源 → 音源目录 中手动指定，然后重载音源。
     4. 默认本地目录（均可在设置中修改）：
          mp3 音频       <profile>\Lxbox\mp3
          flac 音频      <profile>\Lxbox\flac
          索引 / 封面等  <profile>\Lxbox\cache
        <profile> 指 foobar2000 的配置目录。

   四、基本使用
     1. 在顶栏选择数据平台，再进入排行榜、搜索、歌单、播客或歌手页面。
     2. 搜索框中直接输入关键词；中文输入法不便输入时可 Ctrl+V 粘贴。
     3. 双击曲目播放；需要批量加入播放列表 / 批量下载时，先勾选再使用右键菜单。
     4. 顶栏「简介」「评论」查看当前艺人资料和歌曲评论。
     5. 顶栏「设置」调整外观、背景、音源、标签、检测与维护选项。
     6. 设置 → 维护 底部的「Lxbox 界面发布页」可打开本面板发布页。
     7. 设置 → 标签 可开「苹果标签源」：默认一律用播放音源的 TITLE /
        ARTIST / ALBUM / DATE，只有勾上的字段才用 Apple Music 中国区的值；
        网易来源的发行日改从腾讯取（腾讯没有再退苹果）。勾「作品/乐章」
        时古典曲目还会写 WORK / MOVEMENTNAME / MOVEMENT / MOVEMENTTOTAL /
        SHOWMOVEMENT（数据来自 classical.music.apple.com 中国区）。

   五、快捷键与鼠标
     直接打字       在搜索框输入关键词
     Ctrl+V         向搜索框粘贴剪贴板文字
     F3             开关歌曲评论浮层
     F4             开关艺人介绍浮层
     Esc            关闭浮层
     Shift + 滚轮   调整列表文字行间距（每格 2px，范围 -12～+36）
     Ctrl + 滚轮    调整面板字号（每格 1px，范围 9～18；改为手动字号）
     鼠标中键       展开 / 收起左栏（设置、浮层等无左栏界面不适用）
     Shift + 点击   在曲目多选框中连续选择
     双击曲目       播放该曲目

   六、设置面板速查
     外观           缩放、字号、配色、曲目清单行数、第二排平台（以及
                    隐藏第二排时单独用的音质）。
     背景           分三段：
                    ① 背景效果 —— 全屏透明、封面背景、调色、遮罩、模糊、亮度、饱和度。
                    ② 四个区块 —— 标题栏 / 搜索栏 / 左侧栏 / 内容区各一条透明度（内容区 = 左侧栏
                       右边那整块，状态栏不在内），内容区还能染色。
                    ③ 浮层 —— 设置界面 / 简介界面 / 评论界面共用浮层遮罩（底下垫一张虚化封面）
                       与浮层不透明度（无图时的实色浓度，0~100）。
     音源           mp3 / flac / 缓存目录、扩展名检测、播放方式（在线流播 /
                    边下边播 / 下完再播，三选一按钮）、流播封面挂载（流播时
                    把封面写成 nowplaying\cover.jpg 给 foobar 读）、曲目信息广播
                    （把歌手 / 歌名推给皮肤面板）、让 ESLyric 代搜歌词、音源目录、
                    播放音源、全局音质（自动 / 128K / 320K / FLAC / FLAC 24 /
                    Hi-Res / 全景声 / 全景声+ / 母带，下拉选）、在线音源网址。
     标签           封面嵌入音频、同时写同名 jpg；
                    苹果标签源（可选）：总开关、逐字段勾选、1200px封面、
                    播放后自动补、补当前 / 选中 / 整张列表、清缓存。
     检测           音源音质检测（右栏内嵌，左栏不关闭：勾平台 / 档位
                    （128Kbps / 320Kbps / FLAC / Hi-Res）、选脚本、
                    开始 / 停止检测、看各平台逐档结果；上次的结果会存下来，
                    重开面板还看得到）。
     维护           刷新列表、重载 / 导入音源、重嵌封面、清空缓存、
                    清空搜索历史、诊断日志、Lxbox 界面发布页。
     每页的「恢复默认」只恢复当前分类；「退出设置」返回主界面。

   七、常见问题
     没有可用音源脚本
       检查 crypto.js / lx.js / providers.js 是否齐全、音源脚本是否在
       sources 目录；必要时指定音源目录并在维护页重载。点状态栏或打开
       诊断 / 日志可查看失败原因。
     播放或下载异常
       先看状态栏与诊断日志；可切换播放音源、平台或音质，必要时清理缓存。
       清空缓存只删除音频和 index.json，评论与艺人资料保留。
     发布页链接没有打开浏览器
       状态栏会显示实际结果；诊断日志中的 Win32Error / ShellCode 可用于
       排查系统默认浏览器或 URL 关联问题。
     ESLyric 播流时搜不到歌词 / 搜索框两个字段都是空的
       fb2k 没有给流式项目写文本标签的接口，流播项的 %artist% 恒空，而 ESLyric
       的搜索框是分开取 %title% 和 %artist% 的，所以光把标题塞进 URL 也不够。
       真正的解法是走 ESLyric 自己的 COM 接口 IESLyricControl.RequestLyric(标题,
       艺术家) —— 面板把手上的歌手 / 歌名直接喂过去，完全不经过 metadb。
       设置 → 音源里「流播时让 ESLyric 按面板信息搜词」默认就是开的，换歌后
       800ms 自动发一次；「立即让 ESLyric 搜一次」可以手动补一发。
       皮肤面板上的显示另走一条：广播（见下面「皮肤面板显示的还是 hash」）。
       本地文件（下完再播 / 边下边播第二次起）有真标签，两条都用不上。
FAQ 超时     皮肤面板显示的还是 hash（列表行 / 标题栏）
       流播项的 %artist% 恒空、%title% 只是 URL 末段，这是 fb2k 的硬限制：
       没有给流式项目写文本标签的接口。解法是让面板把信息广播出去 ——
       设置 → 音源里「把曲目信息广播给皮肤面板」默认开，每首流播曲目广播
       lx_now_info（对象）/ lx_now_json（JSON 串）/ lx_now_text（纯文本），
       切回本地文件时发 lx_now_clear。同时写 <缓存目录>\nowplaying\info.json，
       里面的 items 以播放项路径为键，列表面板逐行查表即可显示正确名字。
       接收端在 on_notify_data 里加一个 case 就行；晚加载的面板发一次
       lx_now_request 就能要到当前曲目。

     修改脚本后没有生效
       确认覆盖的是面板实际加载目录中的 main.js，并重新加载脚本 / 面板。

   ========================================================================== */
var APP_VERSION = '2.2.3';
window.DefineScript('洛雪音源', { author: 'OpenCode', version: APP_VERSION });

/* 早期版本把 lx.* 属性改成「lx.xxx·中文」时留下的迁移标记，已经没用，读到就删掉 */
(function purgeLegacyPropMarks() {
  try { if (window.GetProperty('Lxbox·属性还原') !== undefined) window.SetProperty('Lxbox·属性还原', null); } catch (e) {}
})();

function getP(k, d) {
  try { return window.GetProperty(k, d); } catch (e) { return d; }
}

function setP(k, v) {
  try { window.SetProperty(k, v); } catch (e) {}
}

var MODULE_DIRS = [];
var MODULE_NAMES = ['crypto.js', 'tagwriter.js', 'apple-tags.js', 'lx.js', 'providers.js', 'main.js'];

function addModuleDir(p) {
  p = String(p || '').replace(/[\\\/]+$/, '');
  if (p && MODULE_DIRS.indexOf(p) < 0) MODULE_DIRS.push(p);
}

function joinPath(a, b) {
  a = String(a == null ? '' : a).replace(/[\\\/]+$/, '');
  b = String(b == null ? '' : b).replace(/^[\\\/]+/, '');
  if (!a) return b;
  if (!b) return a;
  return a + '\\' + b;
}

function collectModuleDirs() {
  addModuleDir(getP('lx.moduleDir', ''));
  try { if (fb.ComponentPath) addModuleDir(joinPath(fb.ComponentPath, 'net')); } catch (e) {}
  try { if (fb.ComponentPath) addModuleDir(joinPath(fb.ComponentPath, 'net\\sources')); } catch (e) {}

  var prof = '';
  try { prof = String(fb.ProfilePath || ''); } catch (e) { prof = ''; }
  if (prof) {
    addModuleDir(joinPath(prof, 'Lxbox'));
    addModuleDir(joinPath(prof, 'Lxbox\\sources'));

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

function sourcesDirFor(dir) {
  return dir ? joinPath(dir, 'resources') : '';
}

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
  try {
    include(name, { always_evaluate: true });
    return '';
  } catch (e) {
  }

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

var tagWriterDir = '';
try {
  tagWriterDir = loadModule('tagwriter.js');
} catch (eTag) {
  try { console.log('[LX] tagwriter.js 未加载，封面嵌入退化为兜底路径：' + ((eTag && eTag.message) || eTag)); } catch (eL) {}
}
if (!moduleDir && tagWriterDir) moduleDir = tagWriterDir;

/* 苹果标签源可选：没这个文件时面板照常跑，只是设置页里那一块变成灰的 */
var appleSrcDir = '';
try {
  appleSrcDir = loadModule('apple-tags.js');
} catch (eApple) {
  try { console.log('[LX] apple-tags.js 未加载，苹果标签源不可用：' + ((eApple && eApple.message) || eApple)); } catch (eA) {}
}
if (!moduleDir && appleSrcDir) moduleDir = appleSrcDir;

var NM = window.NM;
if (!NM) {
  throw new Error('模块已加载但 NM 未初始化（检查 crypto.js / lx.js / providers.js 是否完整）');
}

if (!moduleDir) moduleDir = detectModuleDir();
if (moduleDir) {
  try { setP('lx.moduleDir', moduleDir); } catch (e) {}
  NM.moduleDir = moduleDir;
}

var PAD = 10;
var HEAD_H = 62;
var FOOT_H = 24;
var ROW_H = 44;
var ROW_H_ONE = 30;
var BOARD_W = 190;
var BOARD_ROW_H = 27;
var SIDE_RAIL_W = 26;
var LIST_ROW_H = 38;
var PLAYLIST_NAME = '洛雪音源';

var TAB_DEFS = [
  { key: 'board', label: '排行榜' },
  { key: 'search', label: '搜索' },
  { key: 'playlist', label: '歌单' },
  { key: 'podcast', label: '播客' },
  { key: 'artist', label: '歌手' }
];
var TAB_GAP = 6;

function hdRow1H() { return Math.max(26, FONT_BASE + 8); }
function hdRow2H() { return clamp(FONT_BASE + 10, 22, 28); }
function brandW() { return Math.max(58, FONT_BASE * 4 + 12); }

function tabsX() { return 12 + brandW() + 12; }

function headGrid() {
  var gap = W >= 400 ? TAB_GAP : 4;
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

function isBrowseTab() {
  return tab >= 2;
}

var rowLinesCache = 0;

function rowLines() {
  if (!rowLinesCache) {
    rowLinesCache = Number(getP('lx.rowLines', 2)) === 1 ? 1 : 2;
  }
  return rowLinesCache;
}

var ROW_GAP_MIN = -12;
var ROW_GAP_MAX = 36;
var rowGapCache = null;

function rowGap() {
  if (rowGapCache === null) {
    var v = parseInt(getP('lx.rowGap', 0), 10);
    if (isNaN(v)) v = 0;
    rowGapCache = clamp(v, ROW_GAP_MIN, ROW_GAP_MAX);
  }
  return rowGapCache;
}

function boardRowH() {
  return Math.max(18, BOARD_ROW_H + rowGap());
}

function rowH() {
  var f = FONT_BASE || 12;
  var base = rowLines() === 1 ? Math.max(ROW_H_ONE, Math.round(f * 2.3))
                              : Math.max(ROW_H, trackLineH1() + trackLineH2() + 6);
  return Math.max(18, base + rowGap());
}

function toggleRowLines() {
  var next = rowLines() === 1 ? 2 : 1;
  rowLinesCache = 0;
  setProp('lx.rowLines', next);
  trackScroll = 0;
  clampScroll();
  setStatus('曲目清单：' + (next === 1 ? '单行显示' : '双行显示'));
  repaint();
}

var multiSel = {};
var multiAnchor = -1;
var multiOwner = null;

function syncMulti() {
  if (multiOwner === tracks) return;
  multiOwner = tracks;
  multiSel = {};
  multiAnchor = -1;
}

function multiCount() {
  syncMulti();
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
  setStatus(tracks.length ? ('已勾选 ' + tracks.length + ' 首，右键可批量加入播放列表 / 下载') : '列表是空的');
  repaint();
}

function checkRect(i) {
  var rh = rowH();
  var cr = trackColRect(trackColOf(i));
  var ry = L.track.y + (trackRowOf(i) - trackScroll) * rh;
  return { x: cr.x + 9, y: ry + Math.round((rh - 12) / 2), w: 12, h: 12 };
}

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
  setStatus(n ? ('已勾选 ' + n + ' 首，右键可批量加入播放列表 / 下载') : '已取消勾选');
  repaint();
}

var BATCH_PARALLEL = 2;
var BATCH_ITEM_TIMEOUT = 45000;

function addManyToPlaylist(list) {
  list = (list || []).slice();
  if (!list.length) { setStatus('没有勾选曲目'); return; }

  var total = list.length;
  var batch = ++batchSeq;
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
      if (batch !== batchSeq) return;
      progress();
      pump();
    }

    try {
      playTrack(track, true, { silent: true, batch: batch, onDone: settle });
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
var MF_GRAYED = 0x00000001;
var MF_CHECKED = 0x00000008;

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

var tab = clampTab(getP('lx.tab', 0));
var hidePlatformRow = !!Number(getP('lx.hidePlatformRow', 0) || 0);
var fixedPlatform = String(getP('lx.fixedPlatform', 'wy') || 'wy');

function platformKnown(p) {
  var order = (NM && NM.providers && NM.providers.order) || [];
  var i;
  for (i = 0; i < order.length; i++) if (order[i] === p) return p;
  for (i = 0; i < order.length; i++) if (order[i] === 'wy') return 'wy';
  return order[0] || p;
}

var platform = platformKnown(hidePlatformRow
  ? fixedPlatform
  : String(getP('lx.platform', 'tx') || 'tx'));
fixedPlatform = platformKnown(fixedPlatform);
var qualityAll = String(getP('lx.quality', '320k') || '320k');
var qualityHidden = String(getP('lx.qualityHidden', '') || '');
var quality = qualityEff();

function qualityEff() {
  return (hidePlatformRow && qualityHidden) ? qualityHidden : qualityAll;
}

function syncQuality() {
  quality = qualityEff();
  return quality;
}

function qualityName(q) {
  return QUALITY_LABEL[q] || q || '自动';
}

var searchKeyword = '';

var editKind = '';
var editText = '';
var editPos = 0;
var editAll = false;
var editBlinkOn = true;
var editBlinkTimer = 0;
var setEditRow = null;
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

var sideCollapsed = !!Number(getP('lx.sideCollapsed', 0));
var sideTogHot = false;
var mouseY = 0;
var cursorHand = false;
var busy = false;
var status = '正在加载音源脚本…';
var lastProblem = '';
var footHot = false;
function setLastProblem(text) {
  lastProblem = String(text == null ? '' : text);
}
var reqSeq = 0;
var playSeq = 0;
var batchSeq = 0;

function tokenAlive(t) {
  if (t == null) return true;
  if (typeof t === 'number') return t === playSeq;
  if (t.kind === 'batch') return t.id === batchSeq;
  return t.id === playSeq;
}

function finishOnce(opts, ok, err) {
  if (!opts || typeof opts.onDone !== 'function') return;
  if (opts.__done) return;
  opts.__done = true;
  try { opts.onDone(!!ok, err ? String(err) : ''); } catch (e) {}
}

var lastTrack = null;

var collMode = 'top';
var collKeyword = '';
var collItems = [];
var collIndex = -1;
var collScroll = 0;
var collLoading = false;
var collTopCache = {};
var COLL_TOP_TTL = 10 * 60 * 1000;

var HOT_BOARDS = {
  tx: [{ id: '26', name: 'QQ音乐热歌榜' }, { id: '27', name: 'QQ音乐新歌榜' }, { id: '62', name: 'QQ音乐飙升榜' }],
  wy: [{ id: '3778678', name: '网易云热歌榜' }, { id: '3779629', name: '网易云新歌榜' }, { id: '19723756', name: '网易云飙升榜' }],
  kw: [{ id: '16', name: '酷我热歌榜' }, { id: '17', name: '酷我新歌榜' }, { id: '93', name: '酷我飙升榜' }],
  kg: [{ id: '8888', name: '酷狗TOP500' }, { id: '6666', name: '酷狗飙升榜' }, { id: '52144', name: '酷狗抖音热歌榜' }],
  mg: [{ id: '27186466', name: '咪咕尖叫热歌榜' }, { id: '27553319', name: '咪咕尖叫新歌榜' }, { id: '27553408', name: '咪咕尖叫原创榜' }]
};
var hotBoardIndex = parseInt(getP('lx.hotBoard', 0), 10);
var hotTracks = [];
var hotPlatform = '';
var hotAt = 0;
var hotLoading = false;
var hotMode = false;
var HOT_TTL = 10 * 60 * 1000;

var collKeywordMem = {};

function collKeywordOf(kind) {
  return String(collKeywordMem[kind] || '');
}

function setCollKeywordOf(kind, kw) {
  collKeywordMem[kind] = String(kw || '');
}

var overlay = '';          /* '' | 'comments' | 'bio' */
var overlayName = '';
var overlaySubject = '';
var overlayHot = '';
var overlayItems = null;
var overlayText = '';
var overlayCols = [];
var overlayWrapKey = '';
var overlayScroll = 0;
var overlayLoading = false;
var overlayError = '';

var BIO_PAGE = 15;
var bioTracks = [];
var bioTotal = 0;
var bioShow = BIO_PAGE;
var bioSongScroll = 0;
var bioMoreHot = false;
var bioSongSel = -1;
var bioPicPath = '';
var bioPic = null;
var bioPicFor = '';
var bioPicLoading = false;
var bioPicClickTimer = 0;
var bioPicDblAt = 0;
var bioId = 0;
var bioSongsFile = '';
var bioSongsBusy = false;
var bioSongsFull = false;


var QUALITIES = ['auto', '128k', '320k', 'flac', 'flac24bit',
                 'hires', 'atmos', 'atmos_plus', 'master'];
var QUALITY_LABEL = { auto: '自动', '128k': '128K', '320k': '320K', flac: 'FLAC',
                      'flac24bit': 'FLAC 24', hires: 'Hi-Res',
                      atmos: '全景声', 'atmos_plus': '全景声+', master: '母带' };

var QUALITY_DESC = {
  auto: '按脚本能力挑最高的',
  '128k': '低码率 mp3',
  '320k': '高码率 mp3',
  flac: '16bit 无损',
  'flac24bit': '24bit 无损',
  hires: '24bit 以上高解析',
  atmos: '杜比空间音频',
  'atmos_plus': '杜比全景声增强',
  master: '平台最高规格'
};

function qualityHint(q) {
  return QUALITY_DESC[q] || '';
}

var UI_S = 1;
var UI_AUTO = 1;

function quantUiScale(v) {
  var steps = [1, 1.1, 1.25, 1.3, 1.5, 1.6, 1.75, 2, 2.25, 2.5, 2.75, 3];
  var best = 1, d = 1e9;
  for (var i = 0; i < steps.length; i++) {
    var dd = Math.abs(v - steps[i]);
    if (dd < d) { d = dd; best = steps[i]; }
  }
  return best;
}

function detectUiScale() {
  var s = 0;

  try {
    var d = window.DlgFont;
    var n = d ? Number(d.Size) : 0;
    if (n >= 12 && n <= 48) s = Math.max(s, n / 12);
    else if (n >= 8 && n < 12) s = Math.max(s, n / 9);
  } catch (e) {}

  try {
    var v = Number(utils.GetSystemMetrics(2));
    if (v >= 10 && v <= 80) s = Math.max(s, v / 17);
  } catch (e) {}

  try {
    var ic = Number(utils.GetSystemMetrics(49));
    if (ic >= 10 && ic <= 96) s = Math.max(s, ic / 16);
  } catch (e) {}

  if (!(s > 0.5)) s = 1;
  return quantUiScale(clamp(s, 1, 3));
}

function uiScaleProp() {
  var v = String(getP('lx.uiScale', 'auto') || 'auto').toLowerCase();
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

var FONT_BASE = 12;
var FONT_MIN = 9;
var FONT_MAX = 18;
var FONT_DEF = 12;

function fbDlgFont() {
  var size = 0, name = '';
  try {
    var o = window.DlgFont;
    if (o) {
      size = Number(o.Size) || 0;
      try { name = String(o.Name || o.Face || o.Family || ''); } catch (e2) { name = ''; }
    }
  } catch (e) {}
  if (size >= 8 && size < 12) size = size * 96 / 72;
  if (!(size >= 8 && size <= 60)) size = 0;
  return { size: Math.round(size), name: name };
}

function fbFontName() {
  var n = fbDlgFont().name;
  return (n && n.length >= 2 && n.length <= 64) ? n : 'Microsoft YaHei UI';
}

function fbFontLogical() {
  var px = fbDlgFont().size;
  if (!(px > 0)) return FONT_DEF;
  return clamp(Math.round(px / UI_S), FONT_MIN, FONT_MAX);
}

function fontSizeFollow() {
  var v = '', old = '';
  try { v = String(getP('lx.fontSize', '') || '').trim().toLowerCase(); } catch (e) { v = ''; }
  if (v !== '' && v !== 'auto') return false;
  try { old = String(getP('lx.fontScale', '') || '').trim(); } catch (e2) { old = ''; }
  return old === '';
}

function fontSizeProp() {
  if (fontSizeFollow()) return fbFontLogical();
  var n = parseInt(getP('lx.fontSize', -1), 10);
  if (n >= FONT_MIN && n <= FONT_MAX) return n;
  var f = parseInt(getP('lx.fontScale', 100), 10);
  if (!(f >= 85 && f <= 130)) f = 100;
  return clamp(Math.round(FONT_DEF * f / 100), FONT_MIN, FONT_MAX);
}

function fpx(v) {
  return Math.max(6, Math.round(v * UI_S));
}

function trackLineH1() { return Math.round(FONT_BASE * 1.7); }
function trackLineH2() { return Math.round(FONT_BASE * 1.4); }

function overlayLineH() { return Math.max(14, Math.round(FONT_BASE * 1.6)); }

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
function scaledGraphics(g) {
  var s = UI_S;
  if (!g) return g;
  if (Math.abs(s - 1) < 0.005) return g;

  function X(v) {
    v = Number(v);
    if (!isFinite(v)) return 0;
    return v * s;
  }
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
    CalcTextWidth: function (t, f) {
      return g.CalcTextWidth(t, f) / s;
    },
    CalcTextHeight: function (t, f) {
      return g.CalcTextHeight(t, f) / s;
    },
    SetTextRenderingHint: function (v) { return g.SetTextRenderingHint(v); },
    SetSmoothingMode: function (v) { return g.SetSmoothingMode(v); },
    SetInterpolationMode: function (v) { return g.SetInterpolationMode(v); },
    SetTextContrast: function (v) { return g.SetTextContrast(v); }
  };

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

function initTheme() {
  var name = fbFontName();
  var px = fpx(FONT_BASE);

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
  if (c == null) c = readColour(function () { return window.GetColourCUI(ColorTypeCUI.background); });
  if (c == null) c = readColour(function () { return window.GetColourDUI(ColorTypeDUI.background); });
  if (c == null) c = readColour(function () { return utils.GetSysColour(COLOR_WINDOW); });
  return c;
}

function themeMode() {
  var m = String(getP('lx.theme', 'auto') || 'auto').toLowerCase();
  return (m === 'dark' || m === 'light') ? m : 'auto';
}

function themeLabel(mode) {
  return mode === 'dark' ? '深色' : (mode === 'light' ? '浅色' : '跟随系统');
}

function detectTheme() {
  var mode = themeMode();
  if (mode !== 'auto') return mode;
  /* Eole 的深浅按钮优先于 fb2k 的界面配色 */
  if (eoleTheme === 'dark' || eoleTheme === 'light') return eoleTheme;
  var c = uiBackgroundColour();
  if (c == null) return 'dark';
  return luminanceOf(c) >= 0.5 ? 'light' : 'dark';
}

function mixColour(a, b, t) {
  t = clamp(t, 0, 1);
  var ar = (a >>> 16) & 0xFF, ag = (a >>> 8) & 0xFF, ab = a & 0xFF;
  var br = (b >>> 16) & 0xFF, bg2 = (b >>> 8) & 0xFF, bb = b & 0xFF;
  var r = Math.round(ar + (br - ar) * t);
  var g = Math.round(ag + (bg2 - ag) * t);
  var bl = Math.round(ab + (bb - ab) * t);
  return (0xFF000000 | (r << 16) | (g << 8) | bl) >>> 0;
}

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

function paletteFromFb(fbc) {
  var bg = fbc.bg, fg = fbc.fg;
  var light = luminanceOf(bg) >= 0.5;

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

var eoleTheme = null;

function fbTextColour() {
  var fbc = fbUiColours();
  if (fbc && typeof fbc.fg === 'number' && fbc.fg > 0) return fbc.fg & 0xFFFFFF;
  return -1;
}

function applyFontColour() {
  var fc = fbTextColour();
  if (fc < 0) return;
  var bg = C.bg & 0xFFFFFF;
  if (Math.abs(luminanceOf(fc) - luminanceOf(bg)) < 0.25) return;
  C.text = (0xFF000000 | fc) >>> 0;
  C.dim = mixColour(fc, bg, 0.35);
}

function applyTheme(force) {
  var t = detectTheme();
  THEME = t;

  var eole = (themeMode() === 'auto' && (eoleTheme === 'dark' || eoleTheme === 'light'));
  var fbc = null;
  var sig;
  if (bgArtEnabled()) {
    sig = 'art|' + t;
  } else {
    fbc = fbUiColours();
    sig = fbc ? ('fb|' + fbc.bg + ',' + fbc.fg + ',' + fbc.sel) : ('own|' + t);
  }
  sig += '|h' + bgHue();
  sig += '|t' + fbTextColour();
  sig += '|e' + (eole ? eoleTheme : '');
  if (!force && sig === THEME_SIG && C.text) return false;
  THEME_SIG = sig;

  var p = PALETTE[t] || PALETTE.dark;
  for (var k in p) { if (p.hasOwnProperty(k)) C[k] = p[k]; }

  if (fbc && !eole) {
    var fp = paletteFromFb(fbc);
    for (var k2 in fp) { if (fp.hasOwnProperty(k2)) C[k2] = fp[k2]; }
  }
  applyHueTint();
  if (!eole) applyFontColour();
  return true;
}

var bgArt = null;
var bgBackdrop = null;
var bgBackdropKey = '';
var bgArtKey = '';

function bgArtEnabled() {
  return String(getP('lx.bgArt', '1')) !== '0';
}

function bgHue() {
  var v = parseInt(getP('lx.bgHue', -1), 10);
  if (!(v >= 0 && v <= 359)) return -1;
  return v;
}

function bgArtAlpha() {
  var v = parseInt(getP('lx.bgArtAlpha', -1), 10);
  if (!(v >= 0)) return -1;
  return clamp(v, 0, 255);
}

function bgVeil() {
  var v = parseInt(getP('lx.bgVeil', -1), 10);
  if (v >= 0) return clamp(v, 0, 100);
  var old = bgArtAlpha();
  if (old >= 0) return clamp(Math.round(100 - old / 255 * 100), 0, 100);
  return 50;
}

function bgBlur() {
  var v = parseInt(getP('lx.bgBlur', 20), 10);
  if (!(v >= 0)) v = 20;
  return clamp(v, 0, 40);
}

function bgLum() {
  var v = parseInt(getP('lx.bgLum', 100), 10);
  if (!(v >= 40)) v = 100;
  return clamp(v, 40, 160);
}

function bgSat() {
  var v = parseInt(getP('lx.bgSat', 50), 10);
  if (!(v >= 0)) v = 50;
  return clamp(v, 0, 100);
}

function bgClear() {
  var v = parseInt(getP('lx.bgClear', -1), 10);
  if (v >= 0) return clamp(v, 0, 100);
  var g = parseInt(getP('lx.bgGlass', -1), 10);
  if (!(g >= 0)) return 0;           // 新面板：内容区不额外压暗
  var glass = 0.35 + clamp(g, 0, 100) / 100 * 0.65;
  return clamp(Math.round((1 - glass) * 100), 0, 100);
}

function bgTint() {
  var v = parseInt(getP('lx.bgTint', 0), 10);
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

function hueBase(hue) {
  return THEME === 'light' ? hslToRgb(hue, 0.30, 0.92) : hslToRgb(hue, 0.45, 0.16);
}

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
  return bgArtKey + '@' + W + 'x' + H + '#' + THEME +
         '|b' + bgBlur() + '|h' + bgHue() +
         '|v' + bgVeil() + '|l' + bgLum() + '|s' + bgSat();
}

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
      g.FillSolidRect(0, 0, W, H, A(artAvg, 255));
      var satA = Math.round(bgSat() / 100 * 255);
      if (satA > 0) g.DrawImage(cover, 0, 0, W, H, 0, 0, W, H, 0, satA);

      var lum = bgLum();
      if (lum < 100) {
        g.FillSolidRect(0, 0, W, H, A(0x000000, Math.round((100 - lum) / 100 * 210)));
      } else if (lum > 100) {
        g.FillSolidRect(0, 0, W, H, A(0xFFFFFF, Math.round((lum - 100) / 60 * 210)));
      }
    } else {
      paintFallbackBg(g, W, H);
    }

    var veil = bgVeil();
    if (veil > 0) {
      g.FillSolidRect(0, 0, W, H, A(C.bg, Math.round(clamp(veil, 0, 100) / 100 * 238)));
    }
    bmp.ReleaseGraphics(g);

    var prevBmp = bgBackdrop;
    bgBackdrop = bmp;
    bgBackdropKey = backdropKeyOf();
    bmp = null;
    disposeObj(prevBmp);
    buildOverlayArt();
  } catch (e) {
    try { console.log('[LX-UI] 生成背景失败：' + ((e && e.message) || e)); } catch (e2) {}
  } finally {
    disposeObj(small);
    disposeObj(cover);
    disposeObj(bmp);
  }
}

function disposeObj(o) {
  try { if (o && typeof o.Dispose === 'function') o.Dispose(); } catch (e) {}
}

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

function dropBackdrop() {
  var prev = bgBackdrop;
  bgBackdrop = null;
  bgBackdropKey = '';
  disposeObj(prev);
  dropOverlayArt();
}

function ensureBackdrop() {
  if (!bgArtEnabled()) return;
  if (bgFxTimer) return;
  if (bgBackdropKey !== backdropKeyOf()) buildBackdrop();
}

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

  if (coverFile && coverPath && low && low === coverPath && fileReady(coverFile)) {
    img = loadImageFile(coverFile);
  }
  if (!img) img = albumArtOf(h);
  if (!img && coverFile && fileReady(coverFile)) {
    if (inCacheDir(low) || sameTitle(h)) img = loadImageFile(coverFile);
  }

  var key = low + '|' + (img ? (coverFile && fileReady(coverFile) ? coverFile : 'tag') : 'none');
  if (!force && key === bgArtKey) {
    disposeObj(img);
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

var themeTimer = 0;

function watchTheme() {
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

var coverUrl = '';
var coverFile = '';
var coverPath = '';
var coverTitle = '';

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

function albumArtOf(handle) {
  if (!handle) return null;
  var img = null;
  try { img = utils.GetAlbumArtV2(handle, 0, false); } catch (e) { img = null; }
  if (!img) { try { img = utils.GetAlbumArtV2(handle, 4, false); } catch (e) {} }
  return img || null;
}

function inCacheDir(path) {
  if (!path) return false;
  var low = String(path).toLowerCase();
  var dirs = [];
  try { if (cacheRoot()) dirs.push(cacheRoot()); } catch (e) {}
  try { dirs = dirs.concat(cacheAllDirs()); } catch (e) { return false; }
  for (var i = 0; i < dirs.length; i++) {
    if (low.indexOf(dirs[i].toLowerCase()) === 0) return true;
  }
  return false;
}

var coverPending = {};

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
  coverMemSaveTimer = setTimeout(coverCacheSave, 1200);
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

function isJpegFile(file) {
  try {
    var b = utils.ReadBinaryFile(file);
    return !!(b && b.length > 3 && b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF);
  } catch (e) {
    return false;
  }
}

function fitCoverWidth(file, target) {
  var img = loadImageFile(file);
  if (!img) return file;

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

function coverDownload(url, target) {
  url = String(url || '');
  if (!url) return Promise.resolve('');
  var dir = coverCacheDir();
  if (!dir) return Promise.resolve('');

  /* target：目标宽度。默认 600（老封面就是这么存的）；
     苹果 1200px封面传 1200，不然下完先被缩到 600 就白折腾了。 */
  var tw = Number(target) > 0 ? Math.max(120, Math.min(2400, Math.round(target))) : 600;

  var file = dir + '\\' + coverHash(url) + '.jpg';
  if (fileReady(file)) return Promise.resolve(fitCoverWidth(file, tw));
  if (coverPending[url]) return coverPending[url];

  var part = file + '.' + String(Date.now() % 100000) + '.part';
  var p = NM.lx.download(safeUrl(url), part).then(function () {
    var ok = false;
    try { ok = utils.RenamePath(part, file); } catch (e) {}
    if (!ok) {
      try { utils.RemovePath(part); } catch (e2) {}
      return '';
    }
    return fitCoverWidth(file, tw);
  }, function () {
    try { utils.RemovePath(part); } catch (e) {}
    return '';
  });

  coverPending[url] = p;
  p.then(function () { delete coverPending[url]; }, function () { delete coverPending[url]; });
  return p;
}

/* coverFile 是全局共用的，切歌时会先清空再异步赋值；这里给每次 rememberCover 发一个
   递增 token，并记在曲目对象上。挂封面时比对 token，才能确认「这张图就是这首歌的」，
   不然网络慢的时候容易把上一首的图挂到新播放项上。 */
var coverToken = 0;
var coverFileToken = 0;

function rememberCover(track, audioPath) {
  if (audioPath) coverPath = String(audioPath).toLowerCase();
  coverTitle = String((track && track.title) || '');

  var tok = ++coverToken;
  if (track) {
    /* 不可枚举：track 有时会整对象丢给音源脚本，别多带一个字段出去 */
    try {
      Object.defineProperty(track, '__coverToken',
        { value: tok, writable: true, configurable: true, enumerable: false });
    } catch (e) { try { track.__coverToken = tok; } catch (e2) {} }
  }

  trackCoverUrl(track).then(function (url) {
    if (!url) return;
    if (lastTrack && lastTrack !== track) return;
    if (url === coverUrl) {
      if (coverFile) { coverFileToken = tok; refreshBackground(true); }
      return;
    }
    coverUrl = url;
    coverFile = '';
    coverDownload(url).then(function (f) {
      if (!f) return;
      if (url !== coverUrl) return;
      coverFile = f;
      coverFileToken = tok;
      refreshBackground(true);
    });
  });
}

/* 只有确认是这首歌的图才返回，否则空串 */
function coverFileForTrack(track) {
  if (!track || !coverFile || !fileReady(coverFile)) return '';
  var tok = track.__coverToken || 0;
  if (!tok || tok !== coverFileToken) return '';
  return coverFile;
}

/* ===========================================================================
 * 流播封面推送（在线流播 / 边下边播时用）
 * 播的是 http 直链，foobar2000 手上没有文件、也没有内嵌图，它自带的封面读取一律空着。
 * 做法：把当前曲目的封面固定写成 <缓存目录>\nowplaying\cover.jpg，
 * 再在 fb2k「首选项 → 显示 → 专辑封面 → 前封面」里加上这个完整路径，
 * 之后任何播放项（包括流）都能读到这里最新的封面。
 * 播本地文件时把这个文件撤掉，免得盖到没有内嵌封面的本地曲目上。
 * =========================================================================== */
var NOWPLAY_KEY = '';

function streamCoverOn() {
  return propStr('lx.streamCover', '1') !== '0';
}

function nowPlayDir() {
  var d = '';
  try { d = cacheDir(); } catch (e) { d = ''; }
  if (!d) return '';
  d = d + '\\nowplaying';
  try { utils.CreateFolder(d); } catch (e2) {}
  return d;
}

function nowPlayCoverFile() {
  var d = nowPlayDir();
  return d ? (d + '\\cover.jpg') : '';
}

function streamCoverKey(track) {
  if (!track) return '';
  return String(track.source || '') + '|' +
         String(track.songmid || track.hash || track.rid || track.id || '') + '|' +
         String(track.title || '');
}

function pushStreamCover(track) {
  if (!streamCoverOn()) return;
  var dest = nowPlayCoverFile();
  if (!dest) return;

  if (!track) {                       /* 回到本地播放：撤掉，别盖住别人的封面 */
    ATTACH_KEY = '';
    if (!NOWPLAY_KEY) return;
    NOWPLAY_KEY = '';
    try { utils.RemovePath(dest); } catch (e) {}
    return;
  }

  var key = streamCoverKey(track);
  if (key === NOWPLAY_KEY) return;
  NOWPLAY_KEY = key;

  ensureCoverFile(track).then(function (cf) {
    if (!cf || key !== NOWPLAY_KEY) return;
    if (copyBytesFile(cf, dest)) {
      NM.lx.pushLog('info', '流播封面已推送：' + baseName(dest) + ' ← ' + baseName(cf));
      attachToHandle(nowPlayingHandle(), dest, '推送后');
    } else {
      NOWPLAY_KEY = '';
      NM.lx.pushLog('warn', '流播封面推送失败（写不进 ' + dest + '）');
    }
  }, function () {});
}

/* ---------------------------------------------------------------------------
 * 流播封面挂载（metadb 附着）
 *
 * 纯流播的播放项就是一个 http 直链：没有目录、没有内嵌标签，fb2k 自带的封面
 * 读取一律是空的。以前的办法是写一张固定的 cover.jpg，再让人去
 * 「首选项 → 显示 → 专辑封面 → 前封面」里加这个路径 —— 那是全局单图，属于
 * album art 优先级链最弱的一档，会盖住本地曲目自己的封面，还得手动配一次。
 *
 * 这里改成把图挂到播放项的 metadb handle 上（attached image，优先级链第一档）：
 * 图跟着这一条播放项走，不是全局图；之后任何 JSplitter 面板读 album art
 * 都能直接拿到（Eole、播放列表缩略图、系统媒体控制都一样），
 * 不用在 fb2k 里填任何地址，也不用改任何面板的代码。
 *
 * 本地曲目一律不挂 —— 它们自己有内嵌图和 sidecar，挂了反而串图。
 * ------------------------------------------------------------------------- */
var ATTACH_KEY = '';
var LAST_PLAY_URL = '';

function attachOn() {
  return propStr('lx.streamAttach', '1') !== '0';
}

function pathIsStream(p) {
  var s = String(p || '').toLowerCase();
  return s.indexOf('http://') === 0 || s.indexOf('https://') === 0 ||
         s.indexOf('rtsp://') === 0 || s.indexOf('mms://') === 0;
}

/* 流播判定：URL 前缀最直接；%length% 为空兜底（流没有总时长） */
function isStreamHandle(handle) {
  if (!handle) return false;
  var p = '';
  try { p = String(handle.Path || ''); } catch (e) { p = ''; }
  if (p && pathIsStream(p)) return true;
  var len = null;
  try { len = fb.TitleFormat('%length%').EvalWithMetadb(handle); } catch (e) { return false; }
  return String(len || '') === '';
}

function attachToHandle(handle, file, why) {
  if (!attachOn() || !handle || !file) return;
  if (!fileReady(file)) return;
  if (!isStreamHandle(handle)) return;

  var hp = '';
  try { hp = String(handle.Path || ''); } catch (e) { hp = ''; }
  var key = String(file).toLowerCase() + '|' + hp;
  if (key === ATTACH_KEY) return;
  ATTACH_KEY = key;

  /* 先广播：Eole 的子面板和宿主壁纸都是直接读这个文件，不依赖 attach 成不成功；
     attach 只是让 foobar2000 自己的 album art（播放列表缩略图、系统媒体控制）也有。 */
  notifyCoverReady(file);

  attachImageAsync(handle, file, why || '').then(function (r) {
    if (r && r.ok) {
      NM.lx.pushLog('info', '封面已挂到播放项（' + (r.how || 'AttachImage') + '）：' + baseName(file));
    } else {
      NM.lx.pushLog('warn', '封面挂载失败：' + ((r && r.reason) || '未知原因') + '（面板仍可直接读文件）');
    }
  }, function () {});
}

/* 通用广播：别的面板实现了 on_notify_data('lx_cover_ready') 就能自己刷新，
   没实现的直接忽略，不会有副作用。 */
function notifyCoverReady(file) {
  var p = String(file || '');
  try { window.NotifyOthers('lx_cover_ready', { path: p, how: 'attach' }); } catch (e) {}
  /* 再发一条纯字符串：跨组件传对象不一定通，字符串一定通 */
  try { window.NotifyOthers('lx_cover_path', p); } catch (e2) {}
  if (propStr('lx.streamWake', '0') !== '1') return;
  /* 可选唤醒：有些面板（比如 Eole 的右侧栏）只在切歌事件里取一次图，
     流播换曲时 handle 不变就不会重取。这里借它已有的消息名让它重走一遍，
     不改它代码；代价是可能有界面跳动，所以默认关，需要时把 lx.streamWake 设 1。 */
  try { window.NotifyOthers('rigthsidebar_shownowplaying', true); } catch (e2) {}
}

/* 抢跑：播放列表项刚加好、fb.Play() 还没发出去时先挂。
   别的面板在 on_playback_new_track 里是同步取图的，晚一步就赶不上。 */
function preAttachCover(track, handle) {
  if (!attachOn() || !handle) return;
  var f = coverFileForTrack(track);
  if (!f) return;
  attachToHandle(handle, f, '抢跑');
}

/* 兜底：当前播放项是流播、封面要现取，取到了再挂（手动开关也会用它）。
   必须先确认播放项确实是 Lxbox 刚点的这首，否则手动在 fb2k 里播别的流会串图。 */
function attachLastTrack(why) {
  if (!attachOn()) return;
  var tr = lastTrack;
  var h = nowPlayingHandle();
  if (!h || !isStreamHandle(h)) return;

  var want = String((tr && tr.title) || '');
  var own = (!!tr && !!NOWPLAY_KEY && NOWPLAY_KEY === streamCoverKey(tr));

  /* 最准的一条：这条播放项的地址就是上次点播的直链 */
  var hp = '';
  try { hp = String(h.Path || ''); } catch (e) { hp = ''; }
  var urlOk = !!LAST_PLAY_URL && !!hp &&
              (hp === LAST_PLAY_URL || hp.indexOf(LAST_PLAY_URL) >= 0 ||
               LAST_PLAY_URL.indexOf(hp) >= 0);

  var t = '';
  try { t = String(fb.TitleFormat('%title%').EvalWithMetadb(h) || ''); } catch (e) { t = ''; }
  var titleOk = !!want && !!t && (t === want || t.indexOf(want) >= 0);

  if (!own && !urlOk && !titleOk) return;

  var f = own ? nowPlayCoverFile() : '';
  if (f && fileReady(f)) { attachToHandle(h, f, why || ''); return; }
  var cf0 = coverFileForTrack(tr);
  if (cf0) { attachToHandle(h, cf0, why || ''); return; }
  if (!tr) return;
  ensureCoverFile(tr).then(function (cf) {
    if (!cf) return;
    attachToHandle(h, cf, why || '');
  }, function () {});
}

function openNowPlayDir() {
  var dir = nowPlayDir();
  if (!dir) { setStatus('缓存目录还没确定，先在「音源」页选缓存目录', true); return; }
  if (openDirWithShell(dir)) {
    setStatus('已打开流播封面文件夹：' + dir + '（封面由面板自动挂到播放项，这里只是留档）');
    return;
  }
  setStatus('打不开目录：' + dir, true);
}

/* ===========================================================================
 * 曲目信息广播：把「歌手 / 歌名」交给皮肤里的其他 JSplitter 面板
 *
 * 流播项在 fb2k 里没有标签，面板只要是从 metadb 取字段（%artist% / %title%），
 * 拿到的永远是空和 URL 末段。好在 JSplitter 面板之间可以直接通话：
 *     window.NotifyOthers(名字, 数据)  →  对面 on_notify_data(名字, 数据)
 * 于是面板把自己手上准确的歌手 / 歌名广播出去，皮肤接住就能显示。
 *
 * 三条消息，按可靠程度排，接收方实现其中一条即可：
 *   lx_now_info    对象 {url, artist, title, album, cover, ts}
 *   lx_now_json    同上，JSON 字符串（跨组件传对象不一定通，字符串一定通）
 *   lx_now_text    "歌手 - 歌名" 纯文本
 *   lx_now_clear   切到本地文件 / 停止时发，表示「回到 metadb 自己取」
 * 另外落一份 <缓存目录>\nowplaying\info.json：
 *   { v:1, now:{...}, items:{ "<播放项路径小写>": {artist,title,album,cover,ts} } }
 * items 是给「列表每一行」用的：行渲染时拿 handle.Path 查表，查得到就覆盖显示。
 * 文件同时是兜底 —— 面板晚加载、或没收到消息，读一次文件就能补齐。
 * =========================================================================== */
var NOW_INFO_VER = 1;
var NOW_INFO_KEY = '';
var LX_REQ_LAST = 0;
var NOW_ITEMS_MAX = 80;

function broadcastOn() {
  return propStr('lx.broadcast', '1') !== '0';
}

function nowInfoFile() {
  var d = '';
  try { d = nowPlayDir(); } catch (e) { d = ''; }
  return d ? (d + '\\info.json') : '';
}

function nowInfoRead() {
  var out = { v: NOW_INFO_VER, now: null, items: {} };
  var f = nowInfoFile();
  if (!f) return out;
  try {
    if (!utils.FileExists(f)) return out;
    var j = JSON.parse(String(utils.ReadTextFile(f, 65001) || '{}').replace(/^\uFEFF/, ''));
    if (j && j.items && typeof j.items === 'object') {
      Object.keys(j.items).forEach(function (k) {
        var v = j.items[k];
        if (v && (v.title || v.artist)) out.items[k] = v;
      });
    }
    if (j && j.now && (j.now.title || j.now.artist)) out.now = j.now;
  } catch (e2) {}
  return out;
}

/* 固定投放一份给皮肤读：<profile>\Lxbox\nowplaying\info.json
   皮肤不知道缓存目录被改到哪儿去，所以这份不跟着 lx.cacheDir 走。 */
function lxInfoSharedFile() {
  var prof = '';
  try { prof = String(fb.ProfilePath || ''); } catch (e) { prof = ''; }
  if (!prof) return '';
  return prof.replace(/[\\\/]+$/, '') + '\\Lxbox\\nowplaying\\info.json';
}

function nowInfoWrite(obj) {
  var txt = JSON.stringify(obj);
  var ok = false;
  var f = nowInfoFile();
  if (f) { try { ok = utils.WriteTextFile(f, txt) !== false; } catch (e) { } }
  var f2 = lxInfoSharedFile();
  if (f2) {
    try { ensureFolder(dirOfFile(f2)); utils.WriteTextFile(f2, txt); } catch (e2) { }
  }
  return ok;
}

/* 当前播放项是不是 Lxbox 刚点的那首 —— 别人的流不能被我们按上一首的信息顶掉 */
function lxCurrentIsOurs(h) {
  if (!h || !lastTrack) return false;
  var hp = '';
  try { hp = String(h.Path || ''); } catch (e) { hp = ''; }
  if (LAST_PLAY_URL && hp &&
      (hp === LAST_PLAY_URL || hp.indexOf(LAST_PLAY_URL) >= 0 || LAST_PLAY_URL.indexOf(hp) >= 0)) return true;
  var shown = '';
  try { shown = String(fb.TitleFormat('%title%').EvalWithMetadb(h) || ''); } catch (e2) { shown = ''; }
  var want = String(lastTrack.title || '');
  return !!(want && shown && shown.indexOf(want) >= 0);
}

function lxPublishNow(tries) {
  if (!broadcastOn()) return;
  tries = tries || 0;

  var h = nowPlayingHandle();
  if (!h) { lxClearNow(); return; }
  if (!isStreamHandle(h)) { lxClearNow(); return; }   /* 本地文件有真标签，交回给 metadb */
  if (!lastTrack) return;

  if (!lxCurrentIsOurs(h)) {
    if (tries < 2) setTimeout(function () { try { lxPublishNow(tries + 1); } catch (e) {} }, 1500);
    return;
  }

  var hp = '';
  try { hp = String(h.Path || ''); } catch (e2) { hp = ''; }
  var artist = '';
  try { artist = String(artistText(lastTrack) || ''); } catch (e3) { artist = ''; }
  var info = {
    url: hp,
    artist: artist,
    title: String(lastTrack.title || ''),
    album: String(lastTrack.album || ''),
    cover: '',
    file: nowInfoFile(),      /* 皮肤那边照这个路径读 items，补齐历史行 */
    ts: Date.now()
  };
  try { info.cover = coverFileForTrack(lastTrack) || ''; } catch (e4) {}

  var key = hp + '|' + info.title;
  if (key === NOW_INFO_KEY) return;                   /* 同一首重复触发就别再发 */
  NOW_INFO_KEY = key;

  /* 先落盘：晚加载的面板读文件也能补齐 */
  var db = nowInfoRead();
  db.now = info;
  if (hp) db.items[hp.toLowerCase()] = { artist: info.artist, title: info.title, album: info.album, cover: info.cover, ts: info.ts };
  var keys = Object.keys(db.items);
  if (keys.length > NOW_ITEMS_MAX) {
    keys.sort(function (a, b) { return Number(db.items[b].ts || 0) - Number(db.items[a].ts || 0); });
    keys.slice(NOW_ITEMS_MAX).forEach(function (k) { delete db.items[k]; });
  }
  nowInfoWrite(db);

  /* 再三路广播：对象 / JSON 字符串 / 纯文本，接收方挑好实现的用 */
  try { window.NotifyOthers('lx_now_info', info); } catch (e5) {}
  try { window.NotifyOthers('lx_now_json', JSON.stringify(info)); } catch (e6) {}
  try { window.NotifyOthers('lx_now_text', (info.artist ? info.artist + ' - ' : '') + info.title); } catch (e7) {}

  NM.lx.pushLog('info', '已广播曲目信息：' + (info.artist ? info.artist + ' - ' : '') + info.title);
}

function lxClearNow() {
  if (NOW_INFO_KEY === '') return;
  NOW_INFO_KEY = '';
  var db = nowInfoRead();
  if (!db.now) return;
  db.now = null;
  nowInfoWrite(db);
  try { window.NotifyOthers('lx_now_clear', true); } catch (e) {}
}

function lxBroadcastNow() {
  if (!broadcastOn()) { setStatus('先打开「把曲目信息广播给皮肤面板」', true); return; }
  var h = nowPlayingHandle();
  if (!h) { setStatus('现在没有在播放的曲目', true); return; }
  if (!isStreamHandle(h)) { setStatus('当前是本地文件，皮肤直接读 metadb 就行，不需要广播', true); return; }
  if (!lastTrack || !lxCurrentIsOurs(h)) { setStatus('当前播放项不是从 Lxbox 点的，没有歌手 / 歌名可发', true); return; }
  NOW_INFO_KEY = '';
  lxPublishNow();
  var info = nowInfoRead().now;
  setStatus(info ? ('已广播：' + (info.artist ? info.artist + ' - ' : '') + info.title)
                 : '广播没发出（看诊断日志）');
}

/* ===========================================================================
 * 让 ESLyric 按面板自己的歌手 / 歌名搜词
 *
 * 流播项在 fb2k 里没有标签，%artist% 恒空，ESLyric 的自动搜词拿不到歌手，
 * 搜索框两个字段永远是空的。而 ESLyric 的 COM 接口里正好有一个直接吃字符串的
 *     IESLyricControl.RequestLyric(title, artist)
 * 于是根本不用绕 metadb：面板手上本来就有准确的歌手和歌名，直接喂给它。
 * 只对「流播」生效 —— 本地文件有真标签，插手反而可能用错值。
 * =========================================================================== */
var ESL_CTL = null;
var ESL_TRIED = false;
var ESL_VER = '';
var ESL_KEY = '';
var ESL_AT = 0;

function eslRequestOn() {
  return propStr('lx.eslRequest', '1') !== '0';
}

function eslControl() {
  if (ESL_TRIED) return ESL_CTL;
  ESL_TRIED = true;
  /* 脚本接口默认是关的：这个 titleformat 会把它临时打开（皮肤改配色也是这么干的） */
  try { fb.TitleFormat('%esl_expose_api%').Eval(true); } catch (e) {}
  try { ESL_CTL = new ActiveXObject('ESLyric'); } catch (e2) { ESL_CTL = null; }
  if (ESL_CTL) {
    try { ESL_VER = String(ESL_CTL.Version || ''); } catch (e3) { ESL_VER = ''; }
    NM.lx.pushLog('info', 'ESLyric 控制接口已连上' + (ESL_VER ? '（版本 ' + ESL_VER + '）' : ''));
  } else {
    NM.lx.pushLog('warn', '连不上 ESLyric 控制接口（没装 / 脚本接口没开），流播时不会代搜歌词');
  }
  return ESL_CTL;
}

function eslRequestLyric(track, force) {
  if (!eslRequestOn() || !track) return false;
  var t = String(track.title || '').trim();
  var a = '';
  try { a = String(artistText(track) || '').trim(); } catch (e) { a = ''; }
  if (!t && !a) return false;

  var key = a + '|' + t;
  /* 同一次起播可能被两处触发，4 秒内只发一遍 */
  if (!force && key === ESL_KEY && Date.now() - ESL_AT < 4000) return true;

  var ctl = eslControl();
  if (!ctl) return false;

  try {
    ctl.RequestLyric(t, a);
    ESL_KEY = key;
    ESL_AT = Date.now();
    NM.lx.pushLog('info', 'ESLyric 按面板信息搜词：' + (a ? a + ' - ' : '') + t);
    return true;
  } catch (e2) {
    NM.lx.pushLog('warn', 'ESLyric RequestLyric 调用失败（' + (ESL_VER || '版本未知') + '）：' +
                  ((e2 && e2.message) || e2) + '；很老的版本没有这个接口');
    return false;
  }
}

/* 只在这条播放项确实是 Lxbox 刚点的那首流时才发，免得手动在 fb2k 里播别的流
   也被我们按上一首的信息去搜词。判定：地址一致 → %title% 里含歌名。 */
function eslAutoRequest(tries) {
  if (!eslRequestOn()) return;
  tries = tries || 0;
  var h = nowPlayingHandle();
  if (!h || !isStreamHandle(h)) return;
  if (!lastTrack) return;

  if (!lxCurrentIsOurs(h)) {
    /* 列表项还没就位、标题还没算出来，隔一会儿再问一次 */
    if (tries < 2) setTimeout(function () { try { eslAutoRequest(tries + 1); } catch (e3) {} }, 1500);
    return;
  }
  eslRequestLyric(lastTrack);
}

function eslRequestNow() {
  if (!eslRequestOn()) { setStatus('先打开「流播时让 ESLyric 按面板信息搜词」', true); return; }
  var h = nowPlayingHandle();
  if (!h) { setStatus('现在没有在播放的曲目', true); return; }
  if (!isStreamHandle(h)) { setStatus('当前是本地文件，ESLyric 自己有标签可读，不需要代搜', true); return; }
  if (!lastTrack) { setStatus('当前播放项不是从 Lxbox 点的，没有歌手 / 歌名可发', true); return; }
  if (!eslControl()) { setStatus('连不上 ESLyric 控制接口（检查是否安装 / 脚本接口是否开启）', true); return; }
  if (eslRequestLyric(lastTrack, true)) {
    setStatus('已让 ESLyric 按「' + (artistText(lastTrack) || '') + ' - ' + (lastTrack.title || '') + '」搜词');
  } else {
    setStatus('ESLyric 搜词调用失败，详情看诊断日志', true);
  }
}

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

function writeCoverSidecar(audioPath, coverFile) {
  if (!PUSH_COVER) return 0;
  if (!audioPath || !coverFile) return 0;
  if (!fileReady(coverFile)) return 0;

  var dir = dirOfFile(audioPath);
  if (!dir) return 0;

  var base = baseName(audioPath).replace(/\.[^.\\\/]+$/, '');
  if (!base) return 0;
  var dst = dir + '\\' + base + '.jpg';
  if (fileReady(dst)) return 1;
  return copyBytesFile(coverFile, dst) ? 1 : 0;
}

var TAG_WRITER = (NM && NM.tag) ? NM.tag : null;
var APPLE = (NM && NM.apple) ? NM.apple : null;

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

function pushCoverTo(track, dest, handle) {
  if (!PUSH_COVER || !dest) return Promise.resolve(0);

  var path = String(dest).toLowerCase();
  var title = String((track && track.title) || '');
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

var BG_A = {
  header: 112,
  side: 108,
  field: 116,
  fieldHot: 150,
  tabHot: 116,
  chip: 140,
  btnHot: 208,
  rowSel: 186,
  rowHot: 140
};

var FR = { art: false, hover: false };

function beginFrame() {
  FR.art   = bgArtEnabled() && !!bgBackdrop;
  FR.hover = hoverPaintProp();
}

function hoverPaintProp() {
  try { return String(getP('lx.hoverPaint', '0')) === '1'; } catch (e) { return false; }
}

function hoverOn(r) {
  if (!FR.hover || !r) return false;
  return inRect(r, mouseX, mouseY);
}

function tint(colour, alpha) {
  if (!FR.art) return colour;      // 没封面背景时这些块本来就是实心
  return A(colour, clamp(Math.round(alpha), 0, 255));
}

function solidTint(colour, alpha) {
  return A(colour, clamp(Math.round(alpha), 0, 255));
}

var SEL_FADE = 13;
var SEL_LINE_A = 150;

function selLine(gr, x, y, w, col) {
  if (!(w > 0)) return;
  var c = A(col, SEL_LINE_A), t = A(col, 0);
  var f = Math.min(SEL_FADE, Math.floor(w / 3));
  if (f < 3) { gr.FillSolidRect(x, y, w, 1, c); return; }
  gr.FillGradRect(x, y, f, 1, 0, t, c, 1.0);
  gr.FillSolidRect(x + f, y, w - f * 2, 1, c);
  gr.FillGradRect(x + w - f, y, f, 1, 0, c, t, 1.0);
}

function drawSelFrame(gr, x, y, w, h, col) {
  selLine(gr, x, y, w, col);
  selLine(gr, x, y + h - 1, w, col);
}

function contentVeil() {
  var r = L.content;
  if (!r || r.w <= 0 || r.h <= 0) return null;
  var a = Math.round(255 * (1 - bgClear() / 100));
  if (a <= 0) return null;
  var col = C.bg & 0xFFFFFF;
  var k = bgTint();
  if (k > 0 && FR.art) col = mixColour(col, artAvg, k / 100);
  return { x: r.x, y: r.y, w: r.w, h: r.h, colour: A(col, a) };
}

function paintContentVeil(gr) {
  var v = contentVeil();
  if (!v) return;
  gr.FillSolidRect(v.x, v.y, v.w, v.h, v.colour);
}

var SURF_CLEAR_PROPS = {
  head:   'lx.clearHead',
  search: 'lx.clearSearch',
  side:   'lx.clearSide'
};

function surfClear(surf) {
  var k = SURF_CLEAR_PROPS[surf];
  if (!k) return 0;
  var v = parseInt(getP(k, 50), 10);
  if (!(v >= 0)) return 50;
  return clamp(v, 0, 100);
}

function surfA(surf, alpha) {
  return Math.round(alpha * (1 - surfClear(surf) / 100));
}

function bgOverlayPct() {
  var v = parseInt(getP('lx.bgOverlay', 90), 10);
  if (!(v >= 0)) v = 90;
  return clamp(v, 0, 100);          // 0 = 完全透，100 = 和面板外同色
}

function overlayFill(colour, alpha) {
  var pct = bgOverlayPct() / 100;
  var a = (alpha === undefined || !(alpha >= 0)) ? 252 : alpha;
  return solidTint(colour === undefined ? C.bg : colour, Math.round(a * pct));
}

function bgOverlayScrimPct() {
  var v = parseInt(getP('lx.bgOverlayScrim', 80), 10);
  if (!(v >= 0)) v = 80;
  return clamp(v, 0, 100);
}

function overlayScrim(colour) {
  return solidTint(colour, Math.round(bgOverlayScrimPct() * 2.55));
}

var ovArt = null;
var ovArtKey = '';

function ovArtKeyOf() {
  return bgArtKey + '@' + W + 'x' + H + '#' + THEME + '|b' + bgBlur();
}

function buildOverlayArt() {
  var prev = ovArt, small = null, big = null;
  try {
    if (!bgArt || W <= 0 || H <= 0) { ovArt = null; ovArtKey = ''; disposeObj(prev); return; }
    var key = ovArtKeyOf();
    if (ovArt && key === ovArtKey) return;

    var size = imageSize(bgArt);
    var iw = size[0], ih = size[1];
    if (!(iw > 0 && ih > 0)) { ovArt = null; ovArtKey = ''; disposeObj(prev); return; }

    // 先缩到 96px 见方再放大：糊度主要来自这一步，StackBlur 只补一点
    var sc = 96 / Math.max(iw, ih);
    small = bgArt.Resize(Math.max(16, Math.round(iw * sc)),
                         Math.max(16, Math.round(ih * sc)), 2);
    if (!small) return;
    try { small.StackBlur(clamp(Math.round(bgBlur() * 1.5) + 14, 14, 40)); } catch (eB) {}

    big = small.Resize(W, H, 2);
    if (!big) return;
    ovArt = big; big = null;
    ovArtKey = key;
    disposeObj(prev);
  } catch (e) {
    try { console.log('[LX-UI] 生成浮层底图失败：' + ((e && e.message) || e)); } catch (e2) {}
  } finally {
    disposeObj(small);
    disposeObj(big);
  }
}

function dropOverlayArt() {
  var prev = ovArt;
  ovArt = null;
  ovArtKey = '';
  disposeObj(prev);
}

function overlayArtOn() {
  return !!(ovArt || bgBackdrop);
}

function blitBackdropRect(gr, x, y, w, h) {
  var src = ovArt || bgBackdrop;      // 浮层优先用虚化那张
  if (!src || w <= 0 || h <= 0) return false;
  try {
    gr.GdiDrawBitmap(src, x, y, w, h, x, y, w, h);
    return true;
  } catch (e) {}
  try {
    gr.DrawImage(src, x, y, w, h, x, y, w, h, 0, 255);
    return true;
  } catch (e2) {}
  return false;
}

// ---------------------------------------------------------------------------
// 全屏壁纸（宿主 Eole_x64_layout.js 铺的那一整张）打开时，本面板整体变玻璃：
// 封面背景和底色都不画，让宿主画好的像素透出来。
// 这是 Lxbox 自己的独立开关（"Lxbox·全屏透明"），与 Eole 的"显示·全屏壁纸"
// 互相独立 —— 但只有 Eole 那边也开着，宿主才会真的铺图，单独开这个只会看到
// 一片空白（所以设置面板里会提示）。
// ---------------------------------------------------------------------------
var FW_LXB_PROP = 'Lxbox·全屏透明';
function lxFwOn() {
  try { return !!getP(FW_LXB_PROP, false); } catch (e) { return false; }
}
function lxSetFwOn(v) {
  try { setP(FW_LXB_PROP, !!v); } catch (e) {}
  setVer++;
  setLayoutCache = null;
  repaint();
}

function drawBackdrop(gr) {
  if (lxFwOn()) return;   // 玻璃模式：什么都不画，交给宿主的整张壁纸
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
function sideW() {
  return sideCollapsed ? SIDE_RAIL_W : BOARD_W;
}

function sideToggleRect() {
  if (!L.board || L.board.w <= 0) return null;
  return { x: L.board.x + L.board.w - 22, y: L.board.y + 3, w: 18, h: 18 };
}

function toggleSide() {
  sideCollapsed = !sideCollapsed;
  try { setP('lx.sideCollapsed', sideCollapsed ? 1 : 0); } catch (e) {}
  computeLayout();
  clampScroll();
  sbGeom = {};
  sbDrag = null;
  var r = sideToggleRect();
  sideTogHot = !!(r && inRect(r, mouseX, mouseY));
  repaint();
}

function computeLayout() {
  L.bodyTop = HEAD_H;
  L.bodyBottom = Math.max(HEAD_H, H - FOOT_H);

  L.search = { x: 0, y: L.bodyTop, w: Math.max(80, W), h: 34 };

  if (tab === 0) {
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
    L.search = { x: 0, y: L.bodyTop, w: Math.max(80, W), h: 30 };
    var top = L.bodyTop + 30;
    var sw1 = sideW();
    L.board = { x: 0, y: top, w: sw1, h: Math.max(0, L.bodyBottom - top) };
    L.boardListY = top + 26;
    L.boardListH = Math.max(0, L.bodyBottom - L.boardListY);
    L.track = {
      x: sw1,
      y: L.boardListY,
      w: Math.max(80, W - sw1),
      h: Math.max(0, L.bodyBottom - L.boardListY)
    };
    L.trackHeaderY = top;
  } else {
    L.board = null;
    L.search = { x: 0, y: L.bodyTop, w: Math.max(80, W), h: 32 };
    if (hotMode) {
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

  // 内容区：左侧栏右边那一整块（底部状态栏不归它管）
  var cx0 = (L.board ? L.board.x + L.board.w : 0);
  var cy0 = (tab === 0) ? L.bodyTop : L.bodyTop + L.search.h;
  L.content = { x: cx0, y: cy0, w: Math.max(0, W - cx0), h: Math.max(0, L.bodyBottom - cy0) };

  L.overlay = { x: 0, y: L.bodyTop, w: Math.max(80, W), h: Math.max(0, L.bodyBottom - L.bodyTop) };
}

var TRACK_COL_MIN_W = 620;

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
  return Math.max(0, Math.floor(L.boardListH / boardRowH()));
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

var statusIsError = false;

function setStatus(text, isError) {
  status = String(text == null ? '' : text);
  statusIsError = !!isError;
  try { console.log('[LX-UI] ' + status); } catch (e) {}
  repaint();
}

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
    computeLayout();
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
  computeLayout();
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

function switchHotBoard() {
  hotBoardIndex = (hotBoardIndex + 1) % hotBoardList().length;
  try { setP('lx.hotBoard', String(hotBoardIndex)); } catch (e) {}
  hotTracks = [];
  hotAt = 0;
  loadHot(true);
}

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
  enableCharInput();

  if (editKind === 'search') {
    if (tab !== 1) {
      tab = 1;
      try { setP('lx.tab', tab); } catch (e) {}
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

var DLGC_WANTARROWS = 0x0001;
var DLGC_WANTCHARS = 0x0080;

function enableCharInput() {
  var code = DLGC_WANTARROWS | DLGC_WANTCHARS;
  try {
    if (typeof window.DlgCode === 'function') { window.DlgCode(code); return true; }
  } catch (e) {}
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

var shiftDown = false;
var ctrlDown = false;
var keyGuard = '';
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
  if (vkey >= 0x60 && vkey <= 0x69) return String.fromCharCode(vkey - 0x30);
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

  if (vkey === 0x56 && keyPressed(0x11)) {
    var pasted = clipboardText();
    if (pasted) { editInsert(pasted); setStatus('已粘贴：' + pasted); }
    return true;
  }

  if (vkey === 0xE5) {
    if (!imeHinted) {
      imeHinted = true;
      setStatus('中文输入法打不进面板：请切英文输入法，或右键「输入关键词（输入法）」', true);
    }
    return true;
  }

  var ch = vkChar(vkey);
  if (ch) { editInsert(ch); keyGuard = ch; return true; }

  return true;
}

function runSearch(kw) {
  tab = 1;
  hotMode = false;
  try { setP('lx.tab', tab); } catch (e) {}
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

function openSearch() {
  startEdit('search');
}

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

function browseKind() {
  return tab === 2 ? 'playlist' : (tab === 3 ? 'podcast' : 'artist');
}

function browseLabel() {
  return tab === 2 ? '歌单' : (tab === 3 ? '播客' : '歌手');
}

function browseHint() {
  return platformName() + ' · ' + collTopName() + '，点搜索框可输入' + browseLabel() + '关键词';
}

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

var CACHE_ROOT = '';
var CACHE_DIR = '';
var CACHE_INDEX = null;

/* 播放方式三选一（lx.playMode）：
     stream = 在线流播：只播直链，不落盘、不写标签
     hybrid = 边下边播：立刻播直链（foobar 自己边缓冲边放），后台再落一份缓存并补标签
     cache  = 下完再播：先缓存到本地、写完标签再播（原来的行为）
   旧属性 lx.download（1 / 0）仍然认：1 → cache，0 → stream。 */
var PLAY_MODES = ['stream', 'hybrid', 'cache'];

function playMode() {
  var v = '';
  try { v = String(getP('lx.playMode', '') || '').trim(); } catch (e) { v = ''; }
  if (PLAY_MODES.indexOf(v) >= 0) return v;
  return String(getP('lx.download', '0')) !== '0' ? 'cache' : 'stream';
}

function playModeName(v) {
  v = v || playMode();
  return v === 'stream' ? '在线流播' : (v === 'hybrid' ? '边下边播' : '下完再播');
}

/* 会落盘（缓存 + 写标签）的模式：取链失败回退本地缓存、清缓存等处按它判断 */
function downloadEnabled() {
  return playMode() !== 'stream';
}

function cacheRoot() {
  if (CACHE_ROOT) return CACHE_ROOT;

  var custom = String(getP('lx.cacheDir', '') || '').trim();
  if (custom) {
    CACHE_ROOT = custom.replace(/[\\\/]+$/, '');
  } else {
    var prof = '';
    try { prof = String(fb.ProfilePath || ''); } catch (e) { prof = ''; }
    CACHE_ROOT = prof ? joinPath(prof, 'Lxbox') : '';
  }
  return CACHE_ROOT;
}

function cacheDir() {
  if (CACHE_DIR) return CACHE_DIR;

  var custom = String(getP('lx.cacheDir', '') || '').trim();
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

var AUDIO_DIRS = { mp3: '', flac: '' };

function audioKindForExt(ext) {
  return String(ext || '').toLowerCase() === '.flac' ? 'flac' : 'mp3';
}

function audioDirProp(kind) {
  return (kind === 'flac') ? 'lx.cacheDirFlac' : 'lx.cacheDirMp3';
}

function audioDir(kind) {
  kind = (kind === 'flac') ? 'flac' : 'mp3';
  if (AUDIO_DIRS[kind]) return AUDIO_DIRS[kind];

  var custom = String(getP(audioDirProp(kind), '') || '').trim();
  var dir = '';
  if (custom) {
    dir = custom.replace(/[\\\/]+$/, '');
  } else {
    var root = cacheRoot();
    dir = root ? joinPath(root, kind) : '';
  }

  AUDIO_DIRS[kind] = dir;
  if (dir) { try { utils.CreateFolder(dir); } catch (e) {} }
  return dir;
}

function audioDirForExt(ext) {
  return audioDir(audioKindForExt(ext));
}

function resetCachePaths() {
  CACHE_ROOT = '';
  CACHE_DIR = '';
  AUDIO_DIRS.mp3 = '';
  AUDIO_DIRS.flac = '';
  CACHE_INDEX = null;
  coverMemFile = '';
  try { if (coverMem) coverMem._loaded = false; } catch (e) {}
}

function cacheAllDirs() {
  var out = [];
  [cacheDir(), audioDir('mp3'), audioDir('flac')].forEach(function (d) {
    d = String(d || '').replace(/[\\\/]+$/, '');
    if (!d) return;
    var low = d.toLowerCase();
    for (var i = 0; i < out.length; i++) if (out[i].toLowerCase() === low) return;
    out.push(d);
  });
  return out;
}

function cacheSubDir(name) {
  var dir = cacheDir();
  if (!dir) return '';
  var p = dir + '\\' + name;
  try { utils.CreateFolder(p); } catch (e) {}
  return p;
}

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

function docBase(track) {
  var raw = artistText(track).replace(/\s*[\/]\s*/g, '、').replace(/\s*、\s*/g, '、');
  var a = cleanName(raw, 40) || '未知歌手';
  var t = cleanName((track && track.title) || '', 60) || '未知曲目';
  return a + ' - ' + t;
}

function baseName(p) {
  return String(p == null ? '' : p).replace(/^.*[\\\/]/, '');
}

/* 无损档：flac / flac24bit / hires / master 都是 flac 容器，缓存都落在 flac 目录；
   atmos / atmos_plus 是有损的 m4a，跟 mp3 一起放 */
function losslessQuality(q) {
  var s = String(q || '');
  return s === 'flac' || s === 'flac24bit' || s === 'hires' || s === 'master';
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

function pruneCacheIndex() {
  var dir = cacheDir();
  if (!dir) return;
  var idx = cacheIndex();
  var dirty = 0;
  Object.keys(idx).forEach(function (k) {
    var f = String((idx[k] && idx[k].f) || '');
    if (!f) { delete idx[k]; dirty++; return; }
    var p = cacheAbsPath(f);
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

function indexOwnerOf(name) {
  var idx = cacheIndex();
  var low = String(name || '').toLowerCase();
  if (!low) return '';
  var keys = Object.keys(idx);
  var dirty = false;
  for (var i = 0; i < keys.length; i++) {
    var f = String((idx[keys[i]] && idx[keys[i]].f) || '');
    if (!f || baseName(f).toLowerCase() !== low) continue;
    if (!fileReady(cacheAbsPath(f))) { delete idx[keys[i]]; dirty = true; continue; }
    if (dirty) saveCacheIndex();
    return keys[i];
  }
  if (dirty) saveCacheIndex();
  return '';
}

function cachePathFor(track, q, url) {
  var ext = extFor(q, url);
  var dir = audioDirForExt(ext);
  if (!dir) return '';
  var key = cacheKeyOf(track, q);

  var hit = indexGet(key);
  if (hit && hit.f) {
    var cur = cacheAbsPath(hit.f);
    if (cur && fileReady(cur)) {
      if (dirOfFile(cur).toLowerCase() === dir.toLowerCase()) return cur;
      var moved0 = adoptOldCache(track, hit, key);
      return moved0 || cur;
    }

    var moved = adoptOldCache(track, hit, key);
    if (moved) return moved;
  }

  var base = docBase(track);
  var same = dir + '\\' + base + ext;
  var exists = false;
  try { exists = utils.FileExists(same); } catch (e) { exists = false; }
  if (exists && fileReady(same) && sniffAudio(same).ok) {
    try { NM.lx.pushLog('info', '缓存里已有同名同扩展名的文件，直接复用：' + baseName(same)); } catch (e0) {}
    return reuseCacheFile(track, q, same);
  }

  // 关掉「检测扩展名」时，同目录下同名的别的扩展名也拿来用
  if (!checkExtOn()) {
    var any = sameNameInDir(dir, base, ext);
    if (any) {
      try { NM.lx.pushLog('info', '不检测扩展名，直接复用同名文件：' + baseName(any)); } catch (e1) {}
      return reuseCacheFile(track, q, any);
    }
  }

  return dir + '\\' + targetName(track, ext, key);
}

function reuseCacheFile(track, q, path) {
  try {
    indexPut(cacheKeyOf(track, q), relCachePath(path), 1, EMBED_COVER ? 1 : 0);
  } catch (e) {}
  return path;
}

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

function relCachePath(p) {
  var s = String(p || '');
  if (!s) return '';

  var root = '', dir = '';
  try { root = String(cacheRoot() || ''); } catch (e) { root = ''; }
  try { dir = String(cacheDir() || ''); } catch (e) { dir = ''; }

  if (root) {
    var pre = root.replace(/[\\\/]+$/, '') + '\\';
    if (s.toLowerCase().indexOf(pre.toLowerCase()) === 0) {
      var rel = s.slice(pre.length);
      if (/^cache[\\\/]/i.test(rel)) rel = rel.slice(6);
      return rel;
    }
  }
  if (dir) {
    var pre2 = dir.replace(/[\\\/]+$/, '') + '\\';
    if (s.toLowerCase().indexOf(pre2.toLowerCase()) === 0) s = s.slice(pre2.length);
  }
  return s.replace(/^[\\\/]+/, '');
}

function cacheAbsPath(f) {
  var s = String(f || '');
  if (!s) return '';
  if (/^[a-zA-Z]:[\\\/]/.test(s)) return s;

  if (/^(mp3|flac|cache)[\\\/]/i.test(s)) {
    var root = '';
    try { root = String(cacheRoot() || ''); } catch (e) { root = ''; }
    if (root) return root.replace(/[\\\/]+$/, '') + '\\' + s;
  }

  var dir = '';
  try { dir = String(cacheDir() || ''); } catch (e) { dir = ''; }
  return dir ? dir + '\\' + s : s;
}

function adoptOldCache(track, hit, key) {
  var file = String((hit && hit.f) || '');
  if (!file) return '';

  var cdir = cacheDir();
  if (!cdir) return '';
  var root = cacheRoot();
  var leaf = baseName(file);

  var cands = [cacheAbsPath(file), cdir + '\\' + file];
  if (leaf !== file) cands.push(cdir + '\\' + leaf);
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

  var m = /\.[^.\\\/]+$/.exec(leaf);
  var ext = m ? m[0].toLowerCase() : '.mp3';
  var tdir = audioDirForExt(ext);
  if (!tdir) return src;

  var srcDir = dirOfFile(src);
  if (srcDir.toLowerCase() === tdir.toLowerCase()) return src;

  var name = targetName(track, ext, key);
  var dst = tdir + '\\' + name;
  if (!ensureFolder(tdir)) return src;

  if (!fileReady(dst)) {
    var ok = false;
    try { ok = utils.RenamePath(src, dst); } catch (e) { ok = false; }
    if (!ok || !fileReady(dst)) {
      if (!copyBytesFile(src, dst) || !fileReady(dst)) return src;
    }
  }

  cleanupOldDir(srcDir);
  try { indexPut(key, relCachePath(dst), Number(hit.tagged || 0) === 1, hit.art); } catch (e2) {}
  return dst;
}

function cleanupOldDir(dir) {
  if (!dir) return;

  var low = dir.toLowerCase();
  var cdir = String(cacheDir() || '').toLowerCase();
  var root = String(cacheRoot() || '').toLowerCase();
  if (!cdir || !root) return;
  if (low === cdir || low === root || low === root + '\\music') return;
  var a1 = String(audioDir('mp3') || '').toLowerCase();
  var a2 = String(audioDir('flac') || '').toLowerCase();
  if (low === a1 || low === a2) return;
  if (low.indexOf(cdir + '\\') !== 0 && low.indexOf(root + '\\') !== 0) return;

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

var AUDIO_MIN_BYTES = 4096;
var AUDIO_READ_MAX = 96 * 1024 * 1024;

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
  if (b0 === 0xFF && (b1 & 0xE0) === 0xE0) return 'mp3';
  if (b.length >= 12 && b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70) return 'm4a';
  return '';
}

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

function sniffAudio(p) {
  var size = 0;
  try { size = utils.GetFileSize(p); } catch (e) { size = 0; }
  if (!size) return { ok: false, size: 0, why: '文件是 0 字节' };
  if (size < AUDIO_MIN_BYTES) return { ok: false, size: size, why: '文件只有 ' + size + ' 字节' };

  var ext = extOfPath(p);
  var extKind = AUDIO_EXT_KIND[ext] || '';

  var b = readHead(p, 64);
  if (!b) {
    if (size > AUDIO_READ_MAX) {
      if (extKind) return { ok: true, size: size, kind: extKind };
      return { ok: false, size: size, why: '文件很大但扩展名不是音频（' + (ext || '无') + '）' };
    }
    try { b = utils.ReadBinaryFile(p); } catch (e) { b = null; }
  }
  if (!b || !b.length) {
    if (extKind) return { ok: true, size: size, kind: extKind };
    return { ok: false, size: size, why: '读不了文件内容，扩展名也不是音频' };
  }

  var kind = audioKindOf(b);
  if (kind) return { ok: true, size: size, kind: kind };
  return { ok: false, size: size, why: '内容不是音频（开头是' + sniffHint(b) + '）' };
}

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

function cachePlaylistIndex() {
  try {
    if (!plman || typeof plman.FindPlaylist !== 'function') return -1;
    return plman.FindPlaylist(PLAYLIST_NAME);
  } catch (e) { return -1; }
}

function cleanPlaylistDeadCache() {
  var dirs = cacheAllDirs();
  var idx = cachePlaylistIndex();
  if (!dirs.length || idx < 0) return;

  var prefixes = [];
  for (var d = 0; d < dirs.length; d++) prefixes.push((dirs[d] + '\\').toLowerCase());
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
    var low = p.toLowerCase();
    var inCache = false;
    for (var q2 = 0; q2 < prefixes.length; q2++) {
      if (low.indexOf(prefixes[q2]) === 0) { inCache = true; break; }
    }
    if (!inCache) continue;
    if (fileReady(p)) continue;
    dead.push(i);
  }
  if (!dead.length) return;

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

/* 旧版本写进列表的 127.0.0.1 代理地址（那个功能已经取消），重启后全是死链。
   这些条目本来就是面板加的，启动时顺手清掉，免得用户点到一条播不了的。 */
function cleanProxyPlaylistItems() {
  var idx = cachePlaylistIndex();
  if (idx < 0) return;
  var total = 0;
  try { total = plman.PlaylistItemCount(idx); } catch (e) { return; }
  if (!total) return;

  var dead = [];
  for (var i = 0; i < total; i++) {
    var p = '';
    try {
      var h = plman.GetPlaylistItemHandle(idx, i);
      p = h ? String(h.Path || '') : '';
    } catch (e2) { p = ''; }
    if (p && /^https?:\/\/127\.0\.0\.1:\d+\/lx\//i.test(p)) dead.push(i);
  }
  if (!dead.length) return;

  try { if (plman.UndoBackup) plman.UndoBackup(idx); } catch (e3) {}
  try {
    plman.ClearPlaylistSelection(idx);
    dead.forEach(function (n) { plman.SetPlaylistSelectionSingle(idx, n, true); });
    plman.RemovePlaylistSelection(idx);
    NM.lx.pushLog('info', '已从「' + PLAYLIST_NAME + '」清掉 ' + dead.length + ' 条失效条目');
  } catch (e4) {
    NM.lx.pushLog('warn', '清理失效条目失败：' + ((e4 && e4.message) || e4));
  }
}

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
    var p = cacheAbsPath(f);
    if (!p || !fileReady(p)) continue;
    if (!sniffAudio(p).ok) { dropCacheFile(p, all[j]); continue; }
    return { path: p, quality: String(all[j]).slice(head.length) || q };
  }
  return null;
}

// 本地已有检测是否连扩展名一起比。默认开（老行为），关掉后同名文件不管扩展名都算命中。
function checkExtOn() {
  return propStr('lx.checkExt', '1') !== '0';
}

var SAME_NAME_EXTS = ['.mp3', '.flac', '.m4a', '.aac', '.ogg', '.wav', '.ape',
                      '.mp4', '.oga', '.opus', '.wv', '.aiff', '.aif', '.wma'];

// 在 dir 里找 base + 任意音频扩展名的文件；preferExt 先试，命中就返回绝对路径
function sameNameInDir(dir, base, preferExt) {
  if (!dir || !base) return '';
  var first = String(preferExt || '').toLowerCase();
  var exts = [], i;
  if (first) exts.push(first);
  for (i = 0; i < SAME_NAME_EXTS.length; i++) {
    if (SAME_NAME_EXTS[i] !== first) exts.push(SAME_NAME_EXTS[i]);
  }
  for (i = 0; i < exts.length; i++) {
    var p = dir + '\\' + base + exts[i];
    var exists = false;
    try { exists = utils.FileExists(p); } catch (e) { exists = false; }
    if (!exists || !fileReady(p)) continue;
    if (!sniffAudio(p).ok) continue;
    return p;
  }
  return '';
}

function cachedByName(track) {
  if (!track) return null;
  var base = docBase(track);
  if (!base) return null;

  var preferFlac = losslessQuality(quality);
  /* 当前档位该下的扩展名（flac / hires / master → .flac，atmos → .m4a），先试它 */
  var wantExt = extFor(quality, '');

  // 不检测扩展名：mp3 / flac 两个目录都翻，文件名对上就播，扩展名随便
  if (!checkExtOn()) {
    var kinds = preferFlac ? ['flac', 'mp3'] : ['mp3', 'flac'];
    for (var d = 0; d < kinds.length; d++) {
      var dirAny = audioDir(kinds[d]);
      if (!dirAny) continue;
      var got = sameNameInDir(dirAny, base, wantExt);
      if (got) return { path: got, ext: extOfPath(got) };
    }
    return null;
  }

  var order = [wantExt];
  (preferFlac ? ['.flac'] : ['.mp3', '.flac']).forEach(function (e) {
    if (order.indexOf(e) < 0) order.push(e);
  });
  for (var i = 0; i < order.length; i++) {
    var dir = audioDirForExt(order[i]);
    if (!dir) continue;
    var p = dir + '\\' + base + order[i];
    var exists = false;
    try { exists = utils.FileExists(p); } catch (e) { continue; }
    if (!exists || !fileReady(p)) continue;
    if (!sniffAudio(p).ok) continue;
    return { path: p, ext: order[i] };
  }
  return null;
}

function queryValue(url, name) {
  var m = new RegExp('[?&]' + name + '=([^&#]*)', 'i').exec(String(url || ''));
  return m ? m[1] : null;
}

function urlLacksTicket(url) {
  var vk = queryValue(url, 'vkey');
  return vk !== null && !vk;
}

function looksTrialUrl(url) {
  return /RS0[12][0-9A-Za-z]{5,}/i.test(String(url || ''));
}

function shortUrl(url) {
  var u = String(url || '');
  var q = u.indexOf('?');
  if (q < 0) return u.length > 100 ? u.slice(0, 100) + '…' : u;
  return u.slice(0, Math.min(q, 96)) + '?…（' + (u.length - q - 1) + ' 字节参数）';
}

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
  var mainDir = String(cacheDir() || '').replace(/[\\\/]+$/, '');
  var dirs = cacheAllDirs();
  if (!dirs.length) {
    setStatus('缓存目录不可用', true);
    return;
  }

  var n = 0;
  dirs.forEach(function (dir) {
    var inMain = !!mainDir && dir.toLowerCase() === mainDir.toLowerCase();
    var items = [];
    try { items = utils.Glob(dir + '\\*') || []; } catch (e) { items = []; }
    items.forEach(function (p) {
      var low = String(p).toLowerCase();
      if (/[\\\/](review|bio|artist|covers)([\\\/]|$)/.test(low)) return;
      if (/[\\\/]index\.json$/.test(low)) return;
      if (!inMain) {
        var ext = extOfPath(low);
        var exts = /\.(mp3|flac|m4a|aac|ogg|oga|opus|wav|ape|wv|aiff|aif|wma|part)$/;
        if (!exts.test(ext || low)) return;
      }
      if (removeTree(p)) n++;
    });
  });

  var idx = cacheIndexFile();
  if (idx) { try { utils.RemovePath(idx); } catch (e) {} }
  CACHE_INDEX = null;
  setStatus('已清空播放缓存：' + n + ' 项');
}


var withTimeout = NM.lx.withTimeout;

var TAG_TOOL = null;

function tagScriptPath() {
  if (TAG_TOOL !== null) return TAG_TOOL;
  var dirs = [];
  if (moduleDir) dirs.push(moduleDir);
  var md = String(getP('lx.moduleDir', '') || '').replace(/[\\\/]+$/, '');
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
  if (track && track.source === 'wy') return '';
  var raw = (track && track.raw) || {};
  var album = raw.album || {};
  var list = [raw.time_public, raw.publishTime, raw.publish_time, raw.releaseDate, raw.publish_date,
              album.time_public, album.publishTime, album.publish_time, album.releaseDate];
  for (var i = 0; i < list.length; i++) {
    var v = niceDate(list[i]);
    if (v) return v;
  }
  return '';
}

/* 日期归一：字符串日期 / 10 位秒戳 / 13 位毫秒戳 都收，认不出来或年份离谱就返回空 */
function niceDate(v) {
  var s = String(v == null ? '' : v).trim();
  if (!s || s === '0' || s === 'null' || s === 'undefined') return '';
  var y = 0, mo = 0, d = 0, m;

  if (/^\d{13}$/.test(s)) {
    var dt = new Date(Number(s));
    if (!isNaN(dt.getTime())) { y = dt.getFullYear(); mo = dt.getMonth() + 1; d = dt.getDate(); }
  } else if (/^\d{10}$/.test(s)) {
    var dt2 = new Date(Number(s) * 1000);
    if (!isNaN(dt2.getTime())) { y = dt2.getFullYear(); mo = dt2.getMonth() + 1; d = dt2.getDate(); }
  } else if ((m = /^(\d{4})[-.\/](\d{1,2})[-.\/](\d{1,2})/.exec(s))) {
    y = Number(m[1]); mo = Number(m[2]); d = Number(m[3]);
  } else if ((m = /^(\d{4})(\d{2})(\d{2})$/.exec(s))) {
    y = Number(m[1]); mo = Number(m[2]); d = Number(m[3]);
  } else if ((m = /^(\d{4})$/.exec(s))) {
    y = Number(m[1]);
  } else if ((m = /^(\d{4})[-.\/](\d{1,2})/.exec(s))) {
    y = Number(m[1]); mo = Number(m[2]);
  }

  var nowY = new Date().getFullYear();
  if (!y || y < 1900 || y > nowY + 1) return '';
  if (mo < 1 || mo > 12) mo = 0;
  if (d < 1 || d > 31) d = 0;
  if (!mo) return String(y);
  var mm = (mo < 10 ? '0' : '') + mo;
  if (!d) return y + '-' + mm;
  return y + '-' + mm + '-' + ((d < 10 ? '0' : '') + d);
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

var TAG_FIELD_KEYS = ['genre', 'track', 'disc', 'albumartist', 'composer',
                      'classical', 'copyright', 'album', 'date', 'title', 'artist'];
var TAG_FIELD_LABEL = {
  genre: '流派', track: '音轨号', disc: '碟号', albumartist: '专辑艺人',
  composer: '作曲', classical: '作品/乐章（古典）', copyright: '版权',
  album: '专辑', date: '年份', title: '标题', artist: '歌手'
};

function appleOn() { return !!APPLE && propStr('lx.appleTags', '0') !== '0'; }
function appleAuto() { return !!APPLE && propStr('lx.appleAuto', '0') !== '0'; }
function appleCoverOn() { return !!APPLE && propStr('lx.appleCover', '0') !== '0'; }

function appleFields() {
  var csv = propStr('lx.appleFields', '');
  var out = [];
  csv.split(',').forEach(function (k) {
    k = String(k || '').trim();
    if (k && TAG_FIELD_KEYS.indexOf(k) >= 0 && out.indexOf(k) < 0) out.push(k);
  });
  return out;
}

function setAppleFields(list) {
  var out = [];
  (list || []).forEach(function (k) {
    if (TAG_FIELD_KEYS.indexOf(k) >= 0 && out.indexOf(k) < 0) out.push(k);
  });
  setProp('lx.appleFields', out.join(','));
}

function appleFieldsText() {
  var f = appleFields();
  if (!f.length) return '全不选（只用音源值）';
  var names = f.map(function (k) { return TAG_FIELD_LABEL[k] || k; });
  if (names.length <= 3) return names.join('、');
  return names.slice(0, 3).join('、') + ' 等 ' + names.length + ' 项';
}

/* ---------------- 腾讯补日期 / 专辑名 ---------------- */
var txMetaCache = Object.create(null);
var txMetaInflight = Object.create(null);
var TX_META_TTL = 7 * 24 * 3600 * 1000;

function txMetaOf(track) {
  if (!track || !track.title) return Promise.resolve(null);
  var key = normLoose(track.title) + '|' + normLoose(track.artist || '');
  var hit = txMetaCache[key];
  if (hit && (Date.now() - hit.at) < TX_META_TTL) return Promise.resolve(hit);
  if (txMetaInflight[key]) return txMetaInflight[key];
  if (!NM.providers || typeof NM.providers.searchOne !== 'function') return Promise.resolve(null);

  var kw = [track.title, track.artist].filter(Boolean).join(' ');
  var p = null;
  try { p = NM.providers.searchOne('tx', kw, 1, 8); } catch (e) { return Promise.resolve(null); }
  if (!p || typeof p.then !== 'function') return Promise.resolve(null);

  p = p.then(function (list) {
    list = list || [];
    var t1 = normLoose(track.title);
    var a2 = normLoose(track.artist || '');
    var d2 = Number(track.duration) || 0;
    var best = null, bestScore = 0;
    for (var i = 0; i < list.length; i++) {
      var t = list[i] || {};
      var tname = normLoose(t.title);
      var score = 0;
      if (tname && tname === t1) score += 2.2;
      else if (tname && t1 && tname.indexOf(t1) >= 0) score += 1.2;
      var a1 = normLoose(t.artist || '');
      if (a1 && a2 && (a1.indexOf(a2) >= 0 || a2.indexOf(a1) >= 0)) score += 1.0;
      var d1 = Number(t.duration) || 0;
      if (d1 && d2) {
        var dd = Math.abs(d1 - d2);
        score += dd <= 3 ? 1.0 : (dd <= 8 ? 0.3 : -1.2);
      }
      if (score > bestScore) { bestScore = score; best = t; }
    }
    if (!best || bestScore < 1.8) return null;
    var raw = best.raw || {};
    var alb = raw.album || {};
    var rec = {
      at: Date.now(),
      DATE: niceDate(raw.time_public || raw.publishTime),
      ALBUM: String(alb.name || '').replace(/<[^>]+>/g, '').trim()
    };
    if (!rec.DATE && !rec.ALBUM) return null;
    txMetaCache[key] = rec;
    return rec;
  }, function () { return null; });

  txMetaInflight[key] = p;
  p.then(function () { delete txMetaInflight[key]; }, function () { delete txMetaInflight[key]; });
  return p;
}

/* ---------------- 进度与批量 ---------------- */
var appleJob = null;

function appleJobText() {
  if (!APPLE) return '没加载 apple-tags.js，苹果标签源不可用（把它放到和 main.js 同一个目录）。';
  if (appleJob && appleJob.on) {
    return '批量补标签：' + appleJob.done + '/' + appleJob.total +
           ' · 命中 ' + appleJob.hit + ' · 未找到 ' + appleJob.miss +
           ' · 失败 ' + appleJob.fail + '（点「停止」可中断）';
  }
  if (appleJob && appleJob.total) {
    return '上次批量：' + appleJob.total + ' 首 · 命中 ' + appleJob.hit +
           ' · 未找到 ' + appleJob.miss + ' · 失败 ' + appleJob.fail;
  }
  if (!appleOn()) return '苹果标签开着才生效。关着的时候，写标签只用音源自带的值（默认写入%artist%、%title%、%date%、COVER）。';
  if (!appleFields().length && !appleCoverOn()) return '勾几个字段再补，否则苹果查了也不会写。';
  return '只补勾选的字段；查不到就保留原值，不影响播放。';
}

function trackOfHandle(handle) {
  function fv(fmt) {
    try { return String(fb.TitleFormat(fmt).EvalWithMetadb(handle) || ''); } catch (e) { return ''; }
  }
  var dur = 0;
  try { dur = Math.round(Number(fv('%length_seconds%')) || 0); } catch (e) { dur = 0; }
  return {
    title: fv('%title%').trim(),
    artist: fv('%artist%').trim(),
    album: fv('%album%').trim(),
    duration: dur,
    source: '',
    raw: {}
  };
}

function playlistTagTargets(onlySelected) {
  var idx = -1;
  try { idx = plman.ActivePlaylist; } catch (e) { idx = -1; }
  if (idx == null || idx < 0) return { idx: -1, list: [] };
  var n = 0;
  try { n = plman.PlaylistItemCount(idx) || 0; } catch (e) { n = 0; }
  var list = [], anySel = false, i, sel;
  for (i = 0; i < n; i++) {
    sel = false;
    try { sel = !!plman.IsPlaylistItemSelected(idx, i); } catch (e) { sel = false; }
    if (sel) anySel = true;
  }
  for (i = 0; i < n; i++) {
    sel = false;
    try { sel = !!plman.IsPlaylistItemSelected(idx, i); } catch (e) { sel = false; }
    /* 只处理选中项；但一个都没选时，批量就当成整张列表 */
    if (onlySelected && anySel && !sel) continue;
    if (onlySelected && !sel && !anySel) continue;
    list.push(i);
  }
  return { idx: idx, list: list };
}

function appleTagOne(handle) {
  var tr = trackOfHandle(handle);
  if (!tr.title) return Promise.resolve({ ok: false, reason: '没有曲名' });

  /* 文件里的 DATE 是空的或者明显错的（历史上的 1749-05-28 那种）→ 让腾讯先补一次 */
  var oldDate = '';
  try { oldDate = String(fb.TitleFormat('%date%').EvalWithMetadb(handle) || ''); } catch (e) { oldDate = ''; }
  if (!niceDate(oldDate)) tr._needTxDate = true;
  return appleMetaOf(tr, true).then(function (m) {
    var f = (m && m.fields) || {};
    var hasField = Object.keys(f).length > 0;
    if (!hasField && !(m && m.cover)) return { ok: false, reason: (m && m.reason) || 'Apple 没找到' };
    var w = writeTagsByFoobar(handle, tr, { fields: f });
    if (w && !w.ok) return { ok: false, reason: w.reason || '写入失败' };
    if (m && m.cover && EMBED_COVER) {
      coverDownload(m.cover, 1200).then(function (cf) {
        if (!cf || !fileReady(cf)) return;
        var path = '';
        try { path = String(handle.Path || ''); } catch (e) { path = ''; }
        if (!path) return;
        try { embedCoverToFile(tr, path, cf, f); } catch (e) {}
      }, function () {});
    }
    return { ok: true, fields: f, match: m && m.match };
  }, function (e) {
    return { ok: false, reason: (e && e.message) || '查询失败' };
  });
}

function appleTagCurrent() {
  if (!APPLE) { setStatus('没加载 apple-tags.js', true); return; }
  if (!appleOn()) { setStatus('先打开「苹果标签」', true); return; }
  var h = nowPlayingHandle();
  if (!h) h = null;
  if (!h) {
    try {
      var pl = plman.ActivePlaylist;
      var fi = plman.GetPlaylistFocusItemIndex(pl);
      if (fi >= 0) h = plman.GetPlaylistItemHandle(pl, fi);
    } catch (e) { h = null; }
  }
  if (!h) { setStatus('没有正在播放或选中的曲目', true); return; }
  setStatus('正在问苹果要标签：' + (trackOfHandle(h).title || '') + ' …');
  appleTagOne(h).then(function (r) {
    if (r.ok) {
      var n = Object.keys(r.fields || {}).length;
      setStatus('已写入 ' + n + ' 个字段' + (r.match ? '（' + r.match.title + '）' : ''));
      NM.lx.pushLog('ok', '苹果标签已写入：' + (trackOfHandle(h).title || '') + ' · ' + n + ' 项');
    } else {
      setStatus('没写成：' + (r.reason || '未知'), true);
      NM.lx.pushLog('warn', '苹果标签没写成（' + (r.reason || '未知') + '）');
    }
    repaint();
  });
}

function appleTagBatch(onlySelected) {
  if (!APPLE) { setStatus('没加载 apple-tags.js', true); return; }
  if (!appleOn()) { setStatus('先打开「苹果标签」', true); return; }
  if (!appleFields().length && !appleCoverOn()) { setStatus('先在「苹果补哪些」里勾几个字段', true); return; }
  if (appleJob && appleJob.on) { setStatus('正在补标签，先点「停止」', true); return; }

  var t = playlistTagTargets(onlySelected);
  if (t.idx < 0 || !t.list.length) {
    setStatus(onlySelected ? '播放列表里没有选中的曲目' : '播放列表是空的', true);
    return;
  }

  var job = { on: true, total: t.list.length, done: 0, hit: 0, miss: 0, fail: 0 };
  appleJob = job;
  setStatus('开始补标签：0/' + job.total);
  repaint();

  (function next(k) {
    if (!job.on || k >= t.list.length) {
      job.on = false;
      setStatus('补标签结束：命中 ' + job.hit + ' · 未找到 ' + job.miss + ' · 失败 ' + job.fail);
      NM.lx.pushLog('info', '批量补标签结束：' + job.total + ' 首，命中 ' + job.hit +
                            '，未找到 ' + job.miss + '，失败 ' + job.fail);
      repaint();
      return;
    }
    var h = null;
    try { h = plman.GetPlaylistItemHandle(t.idx, t.list[k]); } catch (e) { h = null; }
    if (!h) {
      job.fail++; job.done++; setTimeout(function () { next(k + 1); }, 60); return;
    }
    appleTagOne(h).then(function (r) {
      if (r && r.ok) job.hit++;
      else if (r && /没找到|没有曲名/.test(String(r.reason || ''))) job.miss++;
      else job.fail++;
      job.done++;
      if (job.done % 5 === 0 || job.done === job.total) {
        setStatus('补标签：' + job.done + '/' + job.total + ' · 命中 ' + job.hit);
        repaint();
      }
      setTimeout(function () { next(k + 1); }, 120);
    }, function () {
      job.fail++; job.done++;
      setTimeout(function () { next(k + 1); }, 120);
    });
  })(0);
}

/* ---------------- 设置页：字段多选菜单 ---------------- */
function appleFieldHint(k) {
  if (k === 'genre') return '（音源基本拿不到）';
  if (k === 'track' || k === 'disc') return '（苹果专辑页的曲序）';
  if (k === 'albumartist') return '（专辑艺人）';
  if (k === 'composer') return '（古典才有，取本地化全名）';
  if (k === 'classical') return '（作品 / 乐章 / 乐章号，走古典站）';
  if (k === 'copyright') return '（专辑版权行）';
  if (k === 'title' || k === 'artist') return '（会把苹果写法盖上来）';
  if (k === 'album') return '（默认用音源）';
  if (k === 'date') return '（默认用音源）';
  return '';
}

function openAppleFieldMenu(x, y) {
  if (!APPLE) { setStatus('没加载 apple-tags.js', true); return; }
  var f = appleFields();
  for (var guard = 0; guard < 40; guard++) {
    var m = window.CreatePopupMenu();
    for (var i = 0; i < TAG_FIELD_KEYS.length; i++) {
      var k = TAG_FIELD_KEYS[i];
      m.AppendMenuItem(MF_STRING | (f.indexOf(k) >= 0 ? MF_CHECKED : 0), 10 + i,
                       TAG_FIELD_LABEL[k] + appleFieldHint(k));
    }
    try { m.AppendMenuSeparator(); } catch (e) {}
    m.AppendMenuItem(MF_STRING, 1, '全不选（只用音源值）');
    m.AppendMenuItem(MF_GRAYED, 2, '勾上的字段会用苹果的值覆盖');
    var sel = m.TrackPopupMenu(x, y);
    if (!sel) break;
    if (sel === 1) { f = []; setAppleFields(f); continue; }
    var kk = TAG_FIELD_KEYS[sel - 10];
    if (!kk) break;
    var at = f.indexOf(kk);
    if (at >= 0) f.splice(at, 1); else f.push(kk);
    setAppleFields(f);
  }
  repaint();
}

/* 设置页里「苹果标签」这一组行 */
function tagSourceRows() {
  if (!APPLE) {
    return [{ kind: 'note', text: '没找到 apple-tags.js：把它和 main.js 放在同一个目录就能用苹果标签源。' }];
  }
  return [
    { kind: 'seg', id: 'appleTags', label: '苹果标签源', value: appleOn() ? '1' : '0',
      options: [['1', '开'], ['0', '关']],
      onPick: function (v) {
        setProp('lx.appleTags', v);
        setStatus(v === '1' ? '苹果标签已开（只补你勾的字段）' : '苹果标签已关，只用音源值');
      } },
    { kind: 'pick', id: 'appleFields', label: '苹果补哪些', disp: appleFieldsText },
    { kind: 'seg', id: 'appleCover', label: '1200px封面', value: appleCoverOn() ? '1' : '0',
      options: [['1', '开'], ['0', '关']],
      onPick: function (v) {
        setProp('lx.appleCover', v);
        setStatus(v === '1' ? '会用苹果 1200×1200封面替换' : '封面保持现在的来源');
      } },
    { kind: 'seg', id: 'appleAuto', label: '播放后自动补', value: appleAuto() ? '1' : '0',
      options: [['1', '开'], ['0', '关']],
      onPick: function (v) {
        setProp('lx.appleAuto', v);
        setStatus(v === '1' ? '每次播放写标签时顺带问苹果（每首多 1~2 次请求）' : '只在手动点「补标签」时问苹果');
      } },
    { kind: 'btns', items: [
      { id: 'appleNow', label: '补当前曲目' },
      { id: 'appleSel', label: '补选中曲目' }
    ] },
    { kind: 'btns', items: [
      { id: 'appleBatch', label: '批量补播放列表' },
      { id: 'appleStop', label: '停止' }
    ] },
    { kind: 'note', text: appleJobText },
    { kind: 'btn', id: 'appleClear', label: '清空苹果匹配缓存' },
    { kind: 'note', text: '只查中国区（music.apple.com/cn）；每首最多 2 次请求，结果缓存 7 天。' +
        '勾了「作品/乐章」且这张像古典专辑时，会多问一次古典站（classical.music.apple.com）。' +
        '苹果没有的歌、或匹配分太低时一律不写，保留音源原值。' }
  ];
}

/* ---------------- 合并：腾讯 → 苹果 ---------------- */
var appleCacheReady = false;

function appleEnsureCache() {
  if (appleCacheReady || !APPLE) return;
  appleCacheReady = true;
  try {
    var dir = cacheDir();
    if (dir) {
      NM.appleCacheDir = dir;
      APPLE.loadCache();
    }
  } catch (e) {}
}

function appleMetaOf(track, useApple) {
  appleEnsureCache();
  var out = { fields: {}, cover: '', source: '', reason: '', match: null };
  var want = useApple ? appleFields() : [];
  var wantCover = useApple && appleCoverOn();
  /* 网易来源，或者批量补标签时发现文件里的日期是坏的（_needTxDate）→ 去腾讯问 */
  var needTx = !!(track && (track.source === 'wy' || track._needTxDate));

  var p0 = needTx ? txMetaOf(track) : Promise.resolve(null);
  return p0.then(function (tx) {
    if (tx) {
      /* 只补音源没有的：专辑名音源有就保留音源名，别被腾讯的写法顶掉 */
      if (tx.DATE && !dateOf(track)) out.fields.DATE = tx.DATE;
      if (tx.ALBUM && !String((track && track.album) || '').trim()) out.fields.ALBUM = tx.ALBUM;
      if (out.fields.DATE || out.fields.ALBUM) out.source = 'tx';
    }
    if (!useApple || (!want.length && !wantCover)) return out;
    if (typeof APPLE.lookup !== 'function') { out.reason = 'apple-tags.js 没加载'; return out; }

    /* 只勾了 1200px封面时，fields 传空会让模块把全部字段都吐出来，这里兜一下 */
    var ask = want.length ? want.slice() : ['cover'];
    return APPLE.lookup(track, { fields: ask }).then(function (r) {
      if (!r || !r.ok) { out.reason = (r && r.reason) || 'Apple 没找到'; return out; }
      var got = r.fields || {};
      Object.keys(got).forEach(function (k) {
        if (got[k] == null || got[k] === '') return;
        if (out.fields[k]) return;              /* 腾讯已经给了（DATE / ALBUM） */
        out.fields[k] = String(got[k]);
      });
      if (wantCover && r.cover) out.cover = r.cover;
      out.match = r.match || null;
      out.source = out.source ? (out.source + '+apple') : 'apple';
      return out;
    }, function (e) {
      out.reason = (e && e.message) || 'Apple 查询失败';
      return out;
    });
  }, function () { return out; });
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

function ensureCoverFile(track) {
  return trackCoverUrl(track).then(function (url) {
    if (!url) return '';
    return coverDownload(url);
  });
}

/* 给「播放后自动补」用：超时就先不写，别把首播卡住；模块那边会继续跑完并进缓存 */
function softTimeout(pr, ms) {
  return new Promise(function (resolve) {
    var done = false;
    var t = setTimeout(function () {
      if (done) return;
      done = true;
      resolve(null);
    }, ms);
    pr.then(function (v) {
      if (done) return;
      done = true;
      clearTimeout(t);
      resolve(v);
    }, function () {
      if (done) return;
      done = true;
      clearTimeout(t);
      resolve(null);
    });
  });
}

function prepareTagData(track) {
  var lyr = Promise.resolve('');
  var cov = Promise.resolve('');
  try { lyr = fetchLyricText(track); } catch (e) { lyr = Promise.resolve(''); }
  try { cov = (EMBED_COVER || PUSH_COVER) ? ensureCoverFile(track) : Promise.resolve(''); } catch (e) { cov = Promise.resolve(''); }
  lyr = lyr.then(null, function () { return ''; });
  cov = cov.then(null, function () { return ''; });

  /* 网易来源要补日期；勾了苹果且开了「播放后自动补」时顺带问苹果 */
  var useApple = appleOn() && appleAuto();
  var wantF = useApple ? appleFields() : [];
  var needMeta = !!(track && track.source === 'wy') ||
                 (useApple && (wantF.length > 0 || appleCoverOn()));
  /* 勾了古典要多问一次古典站，一次跳转也要时间，预算放宽到 6.5s；
     超时只是这次不写，模块会继续跑完并把结果进缓存，下次播放就快了。 */
  var budget = (wantF.indexOf('classical') >= 0) ? 6500 : 4500;
  var metaP = needMeta ? softTimeout(appleMetaOf(track, useApple), budget) : Promise.resolve(null);

  return Promise.all([lyr, cov, metaP]).then(function (a) {
    var m = a[2] || null;
    var lyric = String(a[0] || '');
    var cover = String(a[1] || '');
    var fields = (m && m.fields) || {};
    if (!m || !m.cover) return { lyric: lyric, cover: cover, fields: fields };
    /* 勾了 1200px封面：换成苹果图，下载失败就退回原封面 */
    return coverDownload(m.cover, 1200).then(function (f) {
      return { lyric: lyric, cover: String(f || cover || ''), fields: fields };
    }, function () {
      return { lyric: lyric, cover: cover, fields: fields };
    });
  }, function () {
    return { lyric: '', cover: '', fields: {} };
  });
}

function writeTags(track, dest, preset) {
  var tool = tagScriptPath();
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

function embedCoverEnabled() {
  try { return Number(getP('lx.embedCover', 1)) !== 0; } catch (e) { return true; }
}
var EMBED_COVER = embedCoverEnabled();

function pushCoverEnabled() {
  try { return Number(getP('lx.pushCover', 0)) !== 0; } catch (e) { return false; }
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

function fbTagName(k) {
  if (k === 'TRACK') return 'TRACKNUMBER';
  if (k === 'TRACKTOTAL') return 'TOTALTRACKS';
  if (k === 'DISCTOTAL') return 'TOTALDISCS';
  return k;
}

/* 标签字段：写文件（内置写入器）和写 metadb 两边共用，避免两处对不上 */
function buildTagFields(track, data) {
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

  /* 苹果 / 腾讯补出来的字段覆盖在上面（勾了哪个就只来哪个）。
     foobar 认的是 TRACKNUMBER / TOTALTRACKS / TOTALDISCS，不是 Mp3tag 那套
     TRACK / TRACKTOTAL，这里转一道，免得多出一堆自定义字段。 */
  var extra = (data && data.fields) || null;
  if (extra) {
    Object.keys(extra).forEach(function (k) {
      var v = extra[k] == null ? '' : String(extra[k]).trim();
      if (v) fields[fbTagName(k)] = v;
    });
  }

  return fields;
}

function writeTagsByFoobar(handle, track, data) {
  if (!handle) return { ok: false, reason: '还没进播放列表' };
  if (typeof FbMetadbHandleList === 'undefined') {
    return { ok: false, reason: '当前 JSplitter 没有 FbMetadbHandleList' };
  }

  var fields = buildTagFields(track, data);
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

function embedCover(handle, track, dest, data) {
  if (!EMBED_COVER) return Promise.resolve({ ok: false, skipped: true, reason: '没开启封面嵌入（lx.embedCover=0）' });
  var cf = String((data && data.cover) || '');
  if (!cf || !fileReady(cf)) return Promise.resolve({ ok: false, reason: '没取到封面（网络没拿到图）' });

  var path = String(dest || '');
  if (!path) {
    try { path = String(handle && handle.Path || ''); } catch (e) { path = ''; }
  }
  if (!path) return attachImageAsync(handle, cf, '没有缓存文件路径');

  var fields = {
    TITLE: String((track && track.title) || ''),
    ARTIST: artistText(track),
    ALBUM: String((track && track.album) || ''),
    DATE: dateOf(track),
    GENRE: genreOf(track),
    LYRICS: String((data && data.lyric) || '')
  };
  var xf = (data && data.fields) || null;
  if (xf) {
    Object.keys(xf).forEach(function (k) {
      var v = xf[k] == null ? '' : String(xf[k]).trim();
      if (v) fields[k] = v;
    });
  }

  return new Promise(function (resolve) {
    var tries = 0;
    (function attempt() {
      var js = null;
      try { js = embedCoverToFile(track, path, cf, fields); }
      catch (e) { js = { ok: false, reason: (e && e.message) || String(e) }; }
      if (js && js.ok) { resolve(js); return; }

      if (js && js.busy && ++tries < 3) { setTimeout(attempt, 180); return; }

      NM.lx.pushLog('warn', '内置写入器没成功（' + ((js && js.reason) || '未知') + '），改试 PowerShell');

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

function playlistIndexOfPath(idx, path) {
  var low = String(path || '').toLowerCase();
  if (!low) return -1;
  var total = 0;
  try { total = plman.PlaylistItemCount(idx) || 0; } catch (e) { return -1; }
  for (var i = 0; i < total; i++) {
    var p = '';
    try {
      var h = plman.GetPlaylistItemHandle(idx, i);
      p = h ? String(h.Path || '') : '';
    } catch (e) { p = ''; }
    if (p && p.toLowerCase() === low) return i;
  }
  return -1;
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

  if (local) {
    var at = playlistIndexOfPath(idx, url);
    if (at >= 0) {
      if (!tokenAlive(opts.token)) { finishOnce(opts, false, '已被新的播放请求取消'); return; }
      try {
        plman.SetPlaylistFocusItem(idx, at);
        plman.SetPlaylistSelectionSingle(idx, at, true);
      } catch (e) {}
      if (!enqueue) {
        try {
          var rr = plman.ExecutePlaylistDefaultAction(idx, at);
          if (rr === -1) fb.Play();
        } catch (e2) { try { fb.Play(); } catch (e3) {} }
        setStatus('播放（缓存）：' + track.title + ' · ' + (QUALITY_LABEL[q] || q || ''));
        setTimeout(function () { refreshBackground(false); }, 80);
      } else if (!opts.silentStatus) {
        setStatus('已在「' + PLAYLIST_NAME + '」里：' + track.title);
      }
      finishOnce(opts, true);
      return;
    }
  }

  var before = 0;
  try { before = plman.PlaylistItemCount(idx); } catch (e) {}

  /* 只记真正要播的那条；纯入队不算，免得兜底时认错播放项 */
  if (!enqueue) LAST_PLAY_URL = local ? String(url) : safeUrl(url);
  try {
    plman.AddLocations(idx, [LAST_PLAY_URL], !enqueue);
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
      setTimeout(function () { refreshBackground(false); }, 80);
      finishOnce(opts, true);
    }

    /* 抢跑：列表项已就位、fb.Play() 还没发出去，先把封面挂上。
       别的面板是在 on_playback_new_track 里同步取图的，晚一步就赶不上；
       这里提前挂好，它那一问就有图。 */
    try { preAttachCover(track, handle); } catch (ePA) {}

    if (!opts.prep) { playNow(); return; }

    setStatus('正在写入标签：' + track.title + ' …');
    opts.prep.then(function (d) {
      if (!tokenAlive(opts.token)) { finishOnce(opts, false, '已被新的播放请求取消'); return; }

      if (PUSH_COVER && d && d.cover && opts.dest) {
        if (writeCoverSidecar(opts.dest, d.cover)) {
          NM.lx.pushLog('ok', '封面已推到音轨目录（cover.jpg）：' + (opts.name || ''));
        }
      }

      var r = writeTagsByFoobar(handle, track, { lyric: d && d.lyric });
      if (r && !r.ok) {
        NM.lx.pushLog('warn', 'foobar2000 写文本标签失败（' + ((r.reason) || '') + '）：' + opts.name);
      }

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
        var byWriter = !!(c && c.ok && String(c.how || '').indexOf('AttachImage') < 0);
        var textOk = !!((tr && tr.ok) || byWriter);
        var coverOk = !!(c && c.ok);
        var coverSkipped = !!(c && c.skipped);
        if (opts.key != null) {
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

function playCachedFile(track, dest, quality, enqueue, token, onDone) {
  if (!enqueue) pushStreamCover(null);   /* 真的在播本地文件才撤掉流播那张封面 */
  var key = cacheKeyOf(track, quality);
  var hit = indexGet(key);
  var rel = relCachePath(dest);
  var name = baseName(dest);

  var ready = !!(hit && hit.tagged && Number(hit.v || 0) === TAG_VERSION &&
                 (hit.art || !EMBED_COVER));

  if (ready) {
    pushCoverTo(track, dest, null);
    addToFoobar(dest, enqueue, track, quality, true, { token: token, onDone: onDone });
    return;
  }

  if (enqueue) {
    indexPut(key, rel, 0, 0);
    addToFoobar(dest, true, track, quality, true, { token: token, onDone: onDone });
    return;
  }

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

function txNativeEnabled() {
  return String(getP('lx.txNative', '1')) !== '0';
}

function txTrialEnabled() {
  return String(getP('lx.txTrial', '1')) !== '0';
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
  var token = opts.silent
    ? { kind: 'batch', id: (opts.batch != null ? opts.batch : batchSeq) }
    : { kind: 'play', id: ++playSeq };
  lastTrack = track;
  if (!enqueue) rememberCover(track, '');

  function dead() {
    if (tokenAlive(token)) return false;
    finishOnce(opts, false, '已被新的请求取消');
    return true;
  }

  var pre0 = cachedByName(track);
  if (pre0) {
    var q0 = quality;
    reuseCacheFile(track, q0, pre0.path);
    if (!enqueue) rememberCover(track, pre0.path);
    NM.lx.pushLog('info', '本地已有同名同扩展名缓存，直接播放：' + baseName(pre0.path));
    setStatus('播放缓存：' + track.title + ' · ' + baseName(pre0.path));
    playCachedFile(track, pre0.path, q0, enqueue, token, opts.onDone);
    return;
  }

  setStatus('正在取链：' + track.title + ' …');
  txResolve(track, quality).then(function (res) {
    if (dead()) return;

    if (res && looksTrialUrl(res.url)) res.trial = true;

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

    var dest = (res.trial ? '' : (downloadEnabled() ? cachePathFor(track, res.quality, res.url) : ''));
    if (dest) ensureFolder(dirOfFile(dest));
    if (!enqueue) rememberCover(track, dest);

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
      if (!enqueue) pushStreamCover(track);
      return;
    }

    if (playMode() === 'hybrid') {
      /* 边下边播：直链先丢进列表立刻响（foobar 对 http 源本来就是边缓冲边放），
         后台再落一份缓存 + 补标签，下次播这首就走本地文件。
         本次播放不受后台下载失败影响。 */
      NM.lx.pushLog('info', '边下边播，后台缓存：' + (track.title || ''));
      addToFoobar(res.url, enqueue, track, res.quality, false, { token: token, onDone: opts.onDone });
      if (!enqueue) pushStreamCover(track);
      bgCacheTrack(track, res.url, dest, res.quality);
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

/* ===========================================================================
 * 后台缓存（边下边播用）
 * 播的是直链，下载器不支持进度/取消，所以这里只做「下完 → 校验 → 入索引 → 补标签」，
 * 不参与本次播放。同时最多两个任务，切歌再快也不会把带宽和硬盘拖死。
 * =========================================================================== */
var BG_CACHE_MAX = 2;
var bgActive = 0;
var bgQueue = [];
var bgInflight = {};

function bgCacheTrack(track, url, dest, quality, cb) {
  if (!track || !url || !dest) return false;
  var k = String(dest).toLowerCase();
  if (bgInflight[k]) return false;    /* 同一首连点两次，排一个就够了 */
  bgInflight[k] = 1;
  bgQueue.push({ track: track, url: url, dest: dest, quality: quality, cb: cb });
  bgPump();
  return true;
}

function bgPump() {
  while (bgActive < BG_CACHE_MAX && bgQueue.length) {
    bgActive++;
    (function (job) {
      // 成功、失败、甚至同步抛错都要把名额还回去，否则队列会卡死
      function release() {
        bgActive--;
        try { delete bgInflight[String(job.dest).toLowerCase()]; } catch (e) {}
        bgPump();
      }
      var pr;
      try { pr = bgRun(job); } catch (e) { pr = Promise.resolve(); }
      pr.then(release, release);
    })(bgQueue.shift());
  }
}

function bgRun(job) {
  var track = job.track, dest = job.dest;
  var key = cacheKeyOf(track, job.quality);
  var part = dest + '.bgpart';
  try { ensureFolder(dirOfFile(dest)); } catch (eE) {}

  return NM.lx.download(safeUrl(job.url), part).then(function () {
    var ok = false;
    try { ok = utils.RenamePath(part, dest); } catch (e) {}
    if (!ok) {
      try { utils.RemovePath(part); } catch (e2) {}
      NM.lx.pushLog('warn', '缓存文件改名失败：' + (track.title || ''));
      if (job.cb) job.cb(false, '改名失败');
      return;
    }

    var sn = sniffAudio(dest);
    if (!sn.ok) {
      dropCacheFile(dest, key);
      NM.lx.pushLog('warn', '缓存的不是音频（' + sn.why + '）：' + (track.title || ''));
      if (job.cb) job.cb(false, sn.why);
      return;
    }

    var path = ensureAudioExt(track, dest, sn.kind, job.quality);
    var rel = relCachePath(path);
    indexPut(key, rel, 0, 0);          // 先登记「文件在」，标签随后补
    NM.lx.pushLog('ok', '已缓存：' + baseName(path));
    setStatus('已缓存：' + (track.title || '') + '（下次直接播本地）');
    bgTagFile(track, path, key, rel, job.cb);
  }, function (e) {
    var msg = (e && e.message) || String(e);
    /* 别人正在下同一条时别去删它的临时文件，否则那边改名必然失败 */
    if (msg.indexOf('正在下载') < 0) {
      try { utils.RemovePath(part); } catch (e2) {}
    }
    NM.lx.pushLog('warn', '缓存失败（' + msg + '）：' + (track.title || ''));
    if (job.cb) job.cb(false, msg);
  });
}

/* 播的是直链，手上没有 metadb handle，所以走内置写入器直接改文件；
   内置写入器不认的格式（m4a 等）就留 tagged=0，下次播这首时用原来的链路补。 */
function bgTagFile(track, path, key, rel, cb) {
  function fin() { if (cb) { var f = cb; cb = null; f(true); } }
  if (!EMBED_COVER && !PUSH_COVER) { fin(); return; }
  prepareTagData(track).then(function (d) {
    if (PUSH_COVER && d && d.cover) {
      try { writeCoverSidecar(path, d.cover); } catch (eS) {}
    }
    if (!EMBED_COVER || !d || !d.cover) { fin(); return; }

    var r = null;
    try { r = embedCoverToFile(track, path, d.cover, buildTagFields(track, d)); }
    catch (e) { r = { ok: false, reason: (e && e.message) || String(e) }; }

    if (r && r.ok) {
      indexPut(key, rel, 1, 1);
      NM.lx.pushLog('ok', '已写入标签 + 封面：' + baseName(path));
    } else {
      NM.lx.pushLog('warn', '标签没写成（' + ((r && r.reason) || '内置写入器不支持') +
                    '），下次播放时再补：' + baseName(path));
    }
    fin();
  }, function () { fin(); });
}

/* ===========================================================================
 * 右键「下载」：把曲目存进缓存目录并补标签，不播放、不动播放列表。
 * 和边下边播的后台缓存共用一条流水线（排队 / 最多两路 / 同名去重），
 * 区别只是不需要先把直链丢进播放列表。
 * =========================================================================== */
/* 右键「下载」之前先挑一档音质：只影响这一次下载，不动全局音质设置；
   上次挑的那档会记住（lx.dlQuality），下次默认勾在它上面。 */
function pickDownloadQuality(x, y, cb) {
  var last = propStr('lx.dlQuality', '');
  if (QUALITIES.indexOf(last) < 0) last = '';
  var cur = last || quality;

  var m = window.CreatePopupMenu();
  m.AppendMenuItem(MF_STRING | MF_GRAYED, 0, '选择下载音质（只影响这次下载）');
  for (var i = 0; i < QUALITIES.length; i++) {
    var q = QUALITIES[i];
    var label = (q === 'auto')
      ? '自动（按脚本能力挑最高的）'
      : (qualityName(q) + (qualityHint(q) ? '　' + qualityHint(q) : ''));
    if (q === qualityAll) label += '　← 跟全局一样';
    m.AppendMenuItem(MF_STRING | (q === cur ? MF_CHECKED : 0), 10 + i, label);
  }
  var sel = m.TrackPopupMenu(x, y);
  var idx = sel - 10;
  if (idx < 0 || idx >= QUALITIES.length) return false;
  var pick = QUALITIES[idx];
  setProp('lx.dlQuality', pick);
  cb(pick);
  return true;
}

function downloadTracks(list, wantQ) {
  var q0 = wantQ || quality;
  list = (list || []).filter(function (t) { return t && t.title; });
  if (!list.length) { setStatus('没有可下载的曲目', true); return; }

  var todo = [], skipped = 0;
  list.forEach(function (t) {
    var hit = null;
    try { hit = cachedFileFor(t, q0) || cachedByName(t); } catch (e) { hit = null; }
    if (hit) {
      skipped++;
      NM.lx.pushLog('info', '缓存里已有，跳过：' + (t.title || ''));
      return;
    }
    todo.push(t);
  });

  if (!todo.length) {
    setStatus('已在缓存里，不用再下：' + skipped + ' 首');
    return;
  }

  var total = todo.length, done = 0, okN = 0, failN = 0;

  function finishOne(ok) {
    if (ok) okN++; else failN++;
    done++;
    if (done < total) {
      setStatus('下载中 ' + done + '/' + total + '（成功 ' + okN + '，失败 ' + failN + '）…');
      return;
    }
    var msg = '下载完成（' + qualityName(q0) + '）：成功 ' + okN + ' 首' +
              (failN ? '，失败 ' + failN + ' 首' : '') +
              (skipped ? '，已在缓存 ' + skipped + ' 首' : '');
    NM.lx.pushLog(failN ? 'warn' : 'ok', msg + '（' + (cacheDir() || '?') + '）');
    setStatus(msg, failN > 0);
  }

  var i = 0;
  function next() {
    if (i >= todo.length) return;
    var t = todo[i++];
    var fired = false;
    function once(ok) {
      if (fired) return;
      fired = true;
      finishOne(ok);
    }
    /* 进队列之前就失败的（取链 / 试听 / 加密 / 没目录）在这里记一笔；
       真正下载失败的日志由后台缓存那边写，别重复 */
    function fail(why) {
      NM.lx.pushLog('warn', '下载失败（' + why + '）：' + (t.title || ''));
      once(false);
    }

    function queue(url, q) {
      var dest = '';
      try { dest = cachePathFor(t, q, url); } catch (e) { dest = ''; }
      if (!dest) { fail('缓存目录没定'); next(); return; }
      try { ensureFolder(dirOfFile(dest)); } catch (e2) {}
      if (!bgCacheTrack(t, url, dest, q, once)) {
        /* 这首正好已经在下载队列里了，不用再排一次 */
        NM.lx.pushLog('info', '这首正在下载，跳过：' + (t.title || ''));
        once(true);
      }
      next();
    }

    txResolve(t, q0).then(function (res) {
      if (!res || !res.url) { fail('没取到直链'); next(); return; }
      if (looksTrialUrl(res.url)) { fail('VIP 只有 30 秒试听'); next(); return; }
      var enc = (NM.lx && typeof NM.lx.encryptedExt === 'function') ? NM.lx.encryptedExt(res.url) : '';
      if (enc) { fail('加密格式 ' + enc); next(); return; }
      if (urlLacksTicket(res.url)) { fail('平台没下发 vkey'); next(); return; }
      queue(res.url, res.quality);
    }, function (e) {
      fail((e && e.message) || String(e));
      next();
    });
  }

  setStatus('开始下载 ' + total + ' 首到缓存（' + qualityName(q0) + '）' +
            (skipped ? '，另 ' + skipped + ' 首已在缓存' : '') + ' …');
  NM.lx.pushLog('info', '手动下载 ' + total + ' 首（' + qualityName(q0) + '）→ ' + (cacheDir() || '?'));
  next();
}

/* 行内「下载」按钮：一曲一按，直接开下。
   音质优先用右键下载时记住的那一档，没记过就跟全局音质；
   想临时换档仍走右键「下载到缓存」那条（会先弹音质菜单）。 */
function downloadOne(t) {
  if (!t || !t.title) { setStatus('这首没有歌名，下不了', true); return; }
  var q = propStr('lx.dlQuality', '');
  if (QUALITIES.indexOf(q) < 0) q = quality;
  downloadTracks([t], q);
}

function sourcesFailText() {
  var st = (NM.lx && NM.lx.state) || {};
  var out = [];
  out.push('音源脚本目录：' + (st.dir || '（没找到）'));
  try {
    out.push('模块目录：' + (NM.moduleDir || getP('lx.moduleDir', '') || '（没找到）'));
  } catch (e) {}
  if (st.error) out.push('加载错误：' + st.error);
  (st.runtimes || []).forEach(function (r) {
    if (!r.sources) out.push('× ' + r.name + '：' + (r.error || r.status || '未初始化'));
  });
  out.push('');
  out.push('排查：面板属性 lx.scriptDir / lx.moduleDir 可手动指定；');
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

function trimDirPath(p) {
  return String(p == null ? '' : p).replace(/[\\\/]+$/, '');
}

function importTargetDir() {
  var custom = trimDirPath(String(getP('lx.scriptDir', '') || '').trim());
  if (custom) return custom;
  var active = trimDirPath(NM.lx.state && NM.lx.state.dir);
  if (active && /[\\\/](resources|sources)$/i.test(active)) return active;
  var mod = trimDirPath(NM.moduleDir || moduleDir || '');
  var std = sourcesDirFor(mod);
  if (std) return std;
  return active || mod;
}

function scriptDirForOpen() {
  var cands = [];
  var add = function (p) {
    var v = trimDirPath(String(p == null ? '' : p).trim());
    if (v && cands.indexOf(v) < 0) cands.push(v);
  };
  try { add(NM.lx && NM.lx.state && NM.lx.state.dir); } catch (e) {}
  try { add(getP('lx.scriptDir', '')); } catch (e2) {}
  try { add(importTargetDir()); } catch (e3) {}
  for (var i = 0; i < cands.length; i++) {
    var ok = false;
    try { ok = !!utils.IsDirectory(cands[i]); } catch (e4) { ok = false; }
    if (ok) return cands[i];
  }
  return cands[0] || '';
}

function openScriptDirAction() {
  var dir = scriptDirForOpen();
  var dirOk = false;
  try { dirOk = !!utils.IsDirectory(cleanPath(dir)); } catch (e) { dirOk = false; }
  if (!dir) {
    setStatus('没找到音源脚本目录，可在 设置 → 音源 → 音源目录 里指定', true);
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
        overwrite = utils.MessageBox('音源目录已有同名脚本：\n' + name + '\n\n是否覆盖？',
                                     '导入音源脚本', 4, 32) === 6;
      } catch (e7) { overwrite = true; }
    }
    if (!overwrite) { setStatus('已取消导入'); return; }
  }

  var copied = false;
  try { copied = utils.CopyFile(picked, dest, true) !== false; } catch (e8) { copied = false; }
  if (!copied) {
    try { copied = utils.WriteTextFile(dest, text) !== false; } catch (e9) { copied = false; }
  }
  if (!copied) {
    setStatus('写入失败（可能没有权限）：' + dir, true);
    return;
  }

  setProp('lx.scriptDir', dir);
  reloadSources('已导入 ' + name);
}

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
      try { wrote = utils.WriteTextFile(dest, text) !== false; } catch (e6) { wrote = false; }
    }
    if (!wrote) throw new Error('写入失败（可能没有权限）：' + dest);

    onlineCheckBusy = false;
    reloadAfterOnline((old ? '在线音源已更新：' : '在线音源已下载：') + name);
  }).then(null, function (e) {
    onlineCheckBusy = false;
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

var COMMENT_TTL = 7 * 24 * 3600 * 1000;
var BIO_TTL = 30 * 24 * 3600 * 1000;

var commentLoadId = 0;

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
  if (a1 && a2 && a1 !== a2) return false;
  return true;
}

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
  if (cur && lastTrack && sameTrackAs(cur, lastTrack)) return lastTrack;
  if (cur) return cur;
  return lastTrack;
}

function openOverlay(kind, name, subject) {
  if (editKind) endEdit();
  if (overlay === 'probe' && kind !== 'probe' && probeBusy) probeCancel();
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
  overlayHot = '';
  resetBioState();
  repaint();
}

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
  if (overlay === 'probe') {
    if (probeBusy) probeCancel();
    probeHot = false;
    probePickHot = false;
    probeStopHot = false;
  }
  commentLoadId++;
  overlay = '';
  overlayItems = null;
  overlayText = '';
  overlayCols = [];
  overlayWrapKey = '';
  overlayScroll = 0;
  overlayLoading = false;
  overlayError = '';
  overlayHot = '';
  if (bioPicClickTimer) { clearTimeout(bioPicClickTimer); bioPicClickTimer = 0; }
  scriptHot = false;
  resetBioState();
  repaint();
}

function openDiagnostics() {
  openOverlay('logs', '诊断 / 日志', lastProblem ? '含最近一次失败原因' : '当前没有失败记录');
  overlayLoading = false;
  rebuildOverlayLines(true);
  repaint();
}

var PROBE_SRC = ['tx', 'wy', 'kw', 'kg', 'mg'];
/* 检测四档，跟播放音质同名：128k / 320k / flac / hires。
   Hi-Res 这一档不是「拿到 FLAC 就算」，要文件头里 bits ≥ 24 或采样率 > 48kHz
   才算数（见 probeVerify）：脚本只给 16bit 的时候会标成「只有 16bit」。 */
var PROBE_Q = ['128k', '320k', 'flac', 'hires'];
/* 列头两套写法：宽裕时用长的（128Kbps / Hi-Res），列窄了换短的，免得被省略号吃掉 */
var PROBE_Q_LABEL = { '128k': '128Kbps', '320k': '320Kbps', flac: 'FLAC',
                      hires: 'Hi-Res' };
var PROBE_Q_SHORT = { '128k': '128K', '320k': '320K', flac: 'FLAC',
                      hires: 'Hi-Res' };
var PROBE_SAMPLES = 2;
var PROBE_KEYWORD = '两只老虎';
var PROBE_TIMEOUT = 15000;

var probeRun = 0;
var probeBusy = false;
var probeAt = 0;
var probeFromSaved = false;      /* 现在表格里的是「上次」存下来的结果 */
var probeRes = {};
var probeSampleCache = {};
var probeMsg = '还没检测过';
var probeNote = '';
var probeHot = false;
var probePickHot = false;
var probeStopHot = false;

/* ---- 勾选：测哪几档、测哪几个平台 ----------------------------------------
   存在 lx.probeQ / lx.probeSrc 里，值形如 "128k,flac" / "tx,wy"；
   属性为空 = 全勾（老配置和第一次用都是这个状态）。
   一个都不勾也允许，只是「开始检测」会提示没东西可测。            */
function probeSel(key, list) {
  var raw = propStr(key, '').trim();
  if (!raw) return list.slice();
  var parts = raw.split(',');
  var out = [];
  for (var i = 0; i < list.length; i++) {
    if (parts.indexOf(list[i]) >= 0) out.push(list[i]);
  }
  return out;
}

function probeQTiers() { return probeSel('lx.probeQ', PROBE_Q); }
function probePSrcs() { return probeSel('lx.probeSrc', PROBE_SRC); }
function probeQOn(q) { return probeQTiers().indexOf(q) >= 0; }
function probePOn(p) { return probePSrcs().indexOf(p) >= 0; }

function probeSaveSel(key, on, list) {
  var out = [];
  for (var i = 0; i < list.length; i++) {
    if (on.indexOf(list[i]) >= 0) out.push(list[i]);
  }
  setProp(key, out.join(','));
}

function probeToggleQ(q) {
  if (probeBusy) { setStatus('正在检测，等这一轮跑完再改勾选', true); return; }
  var on = probeQTiers();
  var i = on.indexOf(q);
  if (i >= 0) {
    if (on.length <= 1) { setStatus('至少要留一档，全不勾就没东西可测了', true); return; }
    on.splice(i, 1);
  } else {
    on.push(q);
  }
  probeSaveSel('lx.probeQ', on, PROBE_Q);
  var lab = on.map(function (x) { return PROBE_Q_LABEL[x] || x; });
  setStatus('检测档位：' + (lab.length ? lab.join(' / ') : '一档都没勾'));
  repaint();
}

function probeToggleP(p) {
  if (probeBusy) { setStatus('正在检测，等这一轮跑完再改勾选', true); return; }
  var on = probePSrcs();
  var i = on.indexOf(p);
  if (i >= 0) {
    if (on.length <= 1) { setStatus('至少要留一个平台，全不勾就没东西可测了', true); return; }
    on.splice(i, 1);
  } else {
    on.push(p);
  }
  probeSaveSel('lx.probeSrc', on, PROBE_SRC);
  var lab = on.map(probeName);
  setStatus('检测平台：' + (lab.length ? lab.join(' / ') : '一个都没勾'));
  repaint();
}

/* ---- 上次检测结果落盘 ----------------------------------------------------
   面板重载 / 切分类回来还能看到上次那张表。一个「检测音源」一个文件，
   装在 cache\probe\<脚本 id | all>.json。                                */
function probeSavedFile() {
  var dir = cacheSubDir('probe');
  if (!dir) return '';
  var id = probeScriptId();
  if (id) id = id.replace(/[\\\/:*?"<>|\s]/g, '_');
  return dir + '\\' + (id || 'all') + '.json';
}

function probeSaveRes() {
  try {
    var file = probeSavedFile();
    if (!file) return;
    var cells = [];
    PROBE_SRC.forEach(function (p) {
      PROBE_Q.forEach(function (q) {
        var c = probeCell(p, q);
        if (c.st === 'wait' || c.st === 'run' || c.st === 'na') return;
        cells.push([p, q, c.st, Math.round(c.ms || 0), c.via || '']);
      });
    });
    if (!cells.length) return;
    writeCacheJson(file, { at: probeAt || Date.now(), qs: PROBE_Q.join(','), cells: cells });
  } catch (e) {}
}

function probeLoadSaved() {
  probeResetRes();
  probeAt = 0;
  probeFromSaved = false;
  probeNote = '';
  probeMsg = '还没检测过';

  var j = readCacheJson(probeSavedFile(), 0);
  if (!j || !j.at || !j.cells || !j.cells.length) return false;
  /* 档位定义换过（例如 FLAC 24bit 改成 Hi-Res）就不再拿旧表当结果，
     否则旧数据里的格会被当成新档位的结论，看着像测过。 */
  if (String(j.qs || '') !== PROBE_Q.join(',')) return false;

  probeAt = Number(j.at) || 0;
  probeFromSaved = true;
  probeMsg = '上次检测';
  j.cells.forEach(function (a) {
    if (!a) return;
    var p = a[0], q = a[1];
    if (!probeRes[p] || !probeRes[p][q]) return;
    probeRes[p][q] = { st: a[2] || 'na', ms: Number(a[3]) || 0,
                       why: '', via: a[4] || '', url: '' };
  });
  return true;
}

function probeResetRes() {
  var qs = probeQTiers(), ps = probePSrcs();
  probeRes = {};
  PROBE_SRC.forEach(function (p) {
    probeRes[p] = {};
    var pOn = ps.indexOf(p) >= 0;
    PROBE_Q.forEach(function (q) {
      probeRes[p][q] = { st: (pOn && qs.indexOf(q) >= 0) ? 'wait' : 'na',
                         ms: 0, why: '', via: '', url: '' };
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

function probeScriptId() {
  try { return String(getP('lx.probeScript', '') || ''); } catch (e) { return ''; }
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

function setProbeScript(id) {
  setProp('lx.probeScript', id || '');
  probeRun++;
  probeBusy = false;
  /* 范围变了就换成那个范围上次存下来的结果（没有就回到「还没检测过」） */
  probeLoadSaved();
  setStatus('音质检测范围：' + probeScriptLabel() + (probeAt ? '（下面显示上次结果）' : '') +
            '，点「开始检测」开始');
  repaint();
}

function probeClock(ts) {
  var d = new Date(ts || Date.now());
  function p2(n) { return (n < 10 ? '0' : '') + n; }
  return p2(d.getHours()) + ':' + p2(d.getMinutes()) + ':' + p2(d.getSeconds());
}

function probeSummary() {
  var qs = probeQTiers(), ps = probePSrcs();
  var okN = 0, total = 0, hit = [];
  ps.forEach(function (p) {
    var n = 0, tried = 0;
    qs.forEach(function (q) {
      var st = probeCell(p, q).st;
      if (st === 'wait' || st === 'run' || st === 'na') return;
      tried++;
      if (st === 'ok') { okN++; n++; }
    });
    if (!tried) return;
    total += tried;
    if (n) hit.push(probeName(p) + ' ' + n + ' 档');
  });
  if (!total) return '没有结果';
  return okN + '/' + total + ' 格可用' + (hit.length ? '（' + hit.join('、') + '）' : '');
}

function probeSamplesOf(p) {
  if (probeSampleCache[p]) return Promise.resolve(probeSampleCache[p]);
  var search = (NM.providers && NM.providers.search) || null;
  if (!search) { probeSampleCache[p] = []; return Promise.resolve([]); }

  function ask(kw) {
    return NM.lx.withTimeout(Promise.resolve(search([p], kw, 1, 24)), 15000, '搜索样本')
      .then(function (res) {
        var one = res && res[0] != null ? res[0] : res;
        if (Array.isArray(one)) return one;
        return (one && one.ok && Array.isArray(one.tracks)) ? one.tracks : [];
      }, function () { return []; });
  }

  return ask(PROBE_KEYWORD).then(function (list) {
    if (list.length) return list;
    return ask('热门');
  }).then(function (list) {
    probeSampleCache[p] = list || [];
    return probeSampleCache[p];
  });
}

/* 这首歌的搜索结果里声明支持哪一档；Hi-Res 认 hires / flac24bit / master 三种写法 */
function probeTypeHas(t, q) {
  var ty = t && t.types;
  if (!ty) return false;
  if (ty[q]) return true;
  if (q === 'hires') return !!(ty.hires || ty.flac24bit || ty.master);
  return false;
}

function probePick(list, q, n) {
  var marked = [], rest = [];
  (list || []).forEach(function (t) {
    if (!t) return;
    if (probeTypeHas(t, q)) marked.push(t);
    else rest.push(t);
  });
  return marked.concat(rest).slice(0, n);
}

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

/* 无损档：flac / flac24bit / hires / master 拿到手的都应该是 flac 容器 */
function probeLosslessQ(q) {
  return q === 'flac' || q === 'flac24bit' || q === 'hires' || q === 'master';
}

/* 最近一次探测读到的 FLAC 头（位深 / 采样率），只用来写提示文案 */
var probeLastFlac = null;

/* FLAC 的 STREAMINFO 紧跟 fLaC 标记，34 字节里带着采样率 / 位深 / 声道数。
   探测只抓前 64 字节，正好够读；读不出来就返回 null，让上层当「没验证」。 */
function flacInfoOf(b) {
  if (!b || b.length < 42) return null;
  if ((b[0] & 0xFF) !== 0x66 || (b[1] & 0xFF) !== 0x4C ||
      (b[2] & 0xFF) !== 0x61 || (b[3] & 0xFF) !== 0x43) return null;
  if ((b[4] & 0x7F) !== 0) return null;          /* 第一块不是 STREAMINFO，不认 */
  var d = 8;
  var rate = ((b[d + 10] & 0xFF) << 12) | ((b[d + 11] & 0xFF) << 4) |
             ((b[d + 12] & 0xFF) >> 4);
  var bits = (((b[d + 12] & 0x01) << 4) | ((b[d + 13] & 0xFF) >> 4)) + 1;
  var ch = (((b[d + 12] & 0xFF) >> 1) & 0x07) + 1;
  if (!rate || !bits) return null;
  return { rate: rate, bits: bits, ch: ch };
}

function probeVerify(url, q) {
  probeLastFlac = null;
  if (NM.lx && typeof NM.lx.encryptedExt === 'function' && NM.lx.encryptedExt(url)) {
    return Promise.resolve('bad');
  }
  if (looksTrialUrl(url)) return Promise.resolve('trial');
  if (!NM.http || typeof NM.http.probe !== 'function') return Promise.resolve('unknown');
  return NM.http.probe(url, 8000).then(function (r) {
    var st = (r && (r.statusCode || r.status)) || 0;
    if (st && st >= 400) return 'bad';
    var body = (r && (r.body || r.raw)) || null;
    if (!body || !body.length) return 'unknown';
    var kind = audioKindOf(body);
    if (!kind) return 'bad';
    if (probeLosslessQ(q) && kind !== 'flac') return 'low';
    /* Hi-Res：光有 flac 容器不算，得看头里的位深和采样率 */
    if (q === 'hires') {
      probeLastFlac = flacInfoOf(body);
      if (!probeLastFlac) return 'unknown';
      if (probeLastFlac.bits < 24 && probeLastFlac.rate <= 48000) return 'low16';
    }
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
  var lastAddr = null;
  var lastLow = null;

  function say(why) {
    probeNote = probeName(p) + ' ' + (PROBE_Q_LABEL[q] || q) + '：' + why;
    repaint();
  }

  function at(i) {
    if (run !== probeRun) return Promise.resolve();
    if (i >= list.length) {
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

        if (v === 'low' || v === 'trial' || v === 'low16') {
          var lowWhy = '只拿到有损格式，不是 FLAC';
          if (v === 'trial') lowWhy = '只拿到 30 秒试听，不算完整这一档';
          else if (v === 'low16') {
            lowWhy = '只拿到 ' + (probeLastFlac ? probeLastFlac.bits + 'bit / ' +
                     (probeLastFlac.rate / 1000).toFixed(probeLastFlac.rate % 1000 ? 1 : 0) +
                     'kHz' : '16bit') + ' 的 FLAC，不够 Hi-Res';
          }
          lastLow = { why: lowWhy, via: r.via, url: r.url };
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
  probeMsg = '已取消（只留下已经测到的）';
  PROBE_SRC.forEach(function (p) {
    PROBE_Q.forEach(function (q) {
      var c = (probeRes[p] || {})[q];
      if (c && (c.st === 'run' || c.st === 'wait')) c.st = 'na';
    });
  });
  probeAt = Date.now();
  probeFromSaved = false;
  probeSaveRes();
  setStatus('已停止检测：' + probeSummary());
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

  var qs = probeQTiers(), ps = probePSrcs();
  if (!qs.length) {
    setStatus('一档都没勾：把 128Kbps / 320Kbps / FLAC / Hi-Res 里的勾选框勾上再检测', true);
    probeMsg = '没有勾选任何档位';
    repaint();
    return;
  }
  if (!ps.length) {
    setStatus('一个平台都没勾：把要测的平台勾上再检测', true);
    probeMsg = '没有勾选任何平台';
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
  probeFromSaved = false;
  probeNote = '';
  probeMsg = (only ? '只测 ' + probeScriptLabel() + ' · ' : '') + '正在搜索样本歌曲…';
  repaint();

  var todo = [];
  for (var i0 = 0; i0 < PROBE_SRC.length; i0++) {
    if (ps.indexOf(PROBE_SRC[i0]) >= 0) todo.push(PROBE_SRC[i0]);
  }

  function step(i) {
    if (run !== probeRun) return Promise.resolve();
    if (i >= todo.length) return Promise.resolve();
    var p = todo[i];

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
               probeName(p) + ' …（' + (i + 1) + '/' + todo.length + '）';
    repaint();

    return probeSamplesOf(p).then(function () {
      if (run !== probeRun) return;
      var queue = qs.slice();
      var workers = [];
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
    probeSaveRes();
    setStatus('音源音质检测完成' + (only ? '（只测 ' + probeScriptLabel() + '）' : '') +
              '：' + probeSummary());
    repaint();
  });
}

// 浮层版检测：设置里的「检测」已改为右栏内嵌，这里保留一个独立入口备用
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
var PROBE_PICK_H = 28;
var PROBE_PICK_GAP = 8;
var PROBE_BTN_W = 96;          /* 开始 / 停止按钮宽 */
var PROBE_BTN_GAP = 8;         /* 两个按钮之间 */
var PROBE_PICK_MIN = 168;      /* 「检测音源」并到按钮右边，至少要留这么宽；窄面板还是单独一行 */
var PROBE_CHECK = 13;          /* 勾选框边长 */
var PROBE_CHECK_GAP = 6;

function probeLegendLines() {
  return [
    '可用 = 拿到直链，且文件头与这一档相符',
    '仅地址 = 有链接，但内容不是音频 / 没能验证',
    '失败 = 这一档没取到　　— = 没勾选 / 没声明'
  ];
}

function probeNoteLines(width) {
  var scope = probeScriptId() ? ('只测脚本：' + probeScriptLabel() + '。') : '';
  var text = probeNote
    ? '最近一条：' + probeNote
    : (scope + '样本：每个平台搜「' + PROBE_KEYWORD + '」取前 24 首，每档最多试 ' +
       PROBE_SAMPLES + ' 首；只代表样本，不代表所有歌都能出这一档。');
  var raw = wrapNoteText(text, Math.max(120, width - 6));
  var out = [];
  for (var i = 0; i < raw.length && i < 3; i++) out.push({ t: raw[i], c: 'dim' });
  return out;
}

// 检测页最下面那段状态说明
function probeWhen(ts) {
  var d = new Date(ts || Date.now());
  var now = new Date();
  var same = d.getFullYear() === now.getFullYear() &&
             d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
  return (same ? '' : ((d.getMonth() + 1) + '-' + d.getDate() + ' ')) + probeClock(ts);
}

function probeInfoText() {
  var scope = probeScriptId() ? ('只测 ' + probeScriptLabel() + ' · ') : '全部脚本 · ';
  if (probeBusy) return '音质检测：' + scope + probeMsg;
  if (!probeAt) {
    return '音质检测：' + scope + '还没检测过。上面每个平台、每一档前面都有勾选框，' +
           '不想测的可以勾掉；「检测音源」可选只测哪个脚本，然后点「开始检测」。';
  }
  return '音质检测：' + scope + (probeFromSaved ? '上次检测 ' : '') +
         probeWhen(probeAt) + ' · ' + probeSummary();
}

function probeInfoLines(width) {
  var raw = wrapNoteText(probeInfoText(), Math.max(120, width - 6));
  var out = [];
  for (var i = 0; i < raw.length && i < 4; i++) out.push({ t: raw[i], c: 'dim' });
  return out;
}

var PROBE_COL_MIN = 44;
var PROBE_COL_MAX = 190;
var PROBE_HEAD_H1 = 24;        /* 列头一行：勾选框 + 档位名并排 */
var PROBE_HEAD_H2 = 38;        /* 列头两行：勾选框在上、档位名在下（列窄时用） */

/* 列宽够不够把「勾选框 + Hi-Res」并排放一行 */
function probeHeadWide(colW) {
  var room = colW - PROBE_CHECK - PROBE_CHECK_GAP - 6;
  return room >= btnTextNeed(PROBE_Q_LABEL[PROBE_Q[PROBE_Q.length - 1]] || 'Hi-Res');
}

function probeRowH() {
  return Math.max(22, Math.min(34, Math.round((FONT_BASE + 10) * 1.7)));
}

// stretch = 铺满给定宽度（设置右栏用）；否则按浮层的老算法收窄
function probeBlocks(x0, w, top0, stretch) {
  var nameW = Math.max(46, Math.min(92, Math.round(w * 0.2)));
  var colW = Math.floor((w - nameW) / PROBE_Q.length);
  if (stretch) colW = Math.max(PROBE_COL_MIN, Math.min(PROBE_COL_MAX, colW));
  else colW = Math.max(60, Math.min(132, colW));
  var tw = Math.min(w, nameW + colW * PROBE_Q.length);
  var headRowH = probeHeadWide(colW) ? PROBE_HEAD_H1 : PROBE_HEAD_H2;
  var rowH = probeRowH();

  /* 第一行：[开始检测][停止检测] + 右边跟「检测音源」。
     面板太窄（右边剩不下 PROBE_PICK_MIN）就把「检测音源」放回上面单独一行。 */
  var btnH = 28;
  var pairW = PROBE_BTN_W * 2 + PROBE_BTN_GAP;
  var inline = (tw - pairW - 10) >= PROBE_PICK_MIN;
  var pickX = inline ? (x0 + pairW + 10) : x0;
  var pickW = inline ? (tw - pairW - 10) : tw;
  var pickY = top0;
  var btnY = inline ? top0 : (top0 + PROBE_PICK_H + PROBE_PICK_GAP);
  var top = btnY + btnH + 12;

  var tableH = headRowH + PROBE_SRC.length * rowH;
  var legendH = probeLegendLines().length * PROBE_LEGEND_H;
  var noteH = Math.max(1, probeNoteLines(w).length) * PROBE_LEGEND_H;
  var legendY = top + tableH + 10;
  var infoY = legendY + legendH + 6 + noteH + 8;
  var infoH = probeInfoLines(w).length * PROBE_LEGEND_H;
  var bodyH = infoY + infoH - top0;
  return { x0: x0, w: w, tw: tw, nameW: nameW, colW: colW, headRowH: headRowH,
           rowH: rowH, pickX: pickX, pickY: pickY, pickW: pickW, pickH: PROBE_PICK_H,
           top: top, tableH: tableH, legendY: legendY, legendH: legendH, noteH: noteH,
           btnY: btnY, btnH: btnH, inlinePick: inline, infoY: infoY, infoH: infoH, h: bodyH };
}

function probeShift(g, dy) {
  if (!dy) return g;
  var o = {};
  for (var k in g) o[k] = g[k];
  o.pickY += dy;
  o.top += dy;
  o.legendY += dy;
  o.btnY += dy;
  o.infoY += dy;
  return o;
}

function probeGeom() {
  var r = L.overlay;
  if (!r) return null;
  var top0 = overlayTopY();
  var g0 = probeBlocks(r.x + 16, Math.max(180, r.w - 32), top0, false);
  var oy = Math.max(0, Math.min(36, Math.floor((r.y + r.h - 8 - (top0 + g0.h)) / 2)));
  return probeShift(g0, oy);
}

function probeRunRectOf(g) {
  return g ? { x: g.x0, y: g.btnY, w: PROBE_BTN_W, h: g.btnH } : null;
}

function probeStopRectOf(g) {
  return g ? { x: g.x0 + PROBE_BTN_W + PROBE_BTN_GAP, y: g.btnY,
               w: PROBE_BTN_W, h: g.btnH } : null;
}

function probePickRectOf(g) {
  return g ? { x: g.pickX == null ? g.x0 : g.pickX, y: g.pickY,
               w: g.pickW == null ? g.tw : g.pickW, h: g.pickH } : null;
}

/* 表头每一档的勾选框 + 文字位置；hit 是整列（点列头任何地方都能开关这一档）。
   列窄的时候自动改成「勾选框在上、档位名在下」两行，免得档位名被省略号切掉。 */
function probeQHeadRect(g, i) {
  var bx = g.x0 + g.nameW + i * g.colW;
  var lab = PROBE_Q_LABEL[PROBE_Q[i]] || PROBE_Q[i];
  var short = PROBE_Q_SHORT[PROBE_Q[i]] || lab;
  var twoLine = !probeHeadWide(g.colW);
  var lw = btnTextNeed(twoLine ? short : lab) + 2;
  var gw = PROBE_CHECK + PROBE_CHECK_GAP + lw;
  var gx = twoLine ? (bx + Math.round((g.colW - PROBE_CHECK) / 2))
                   : (bx + Math.max(1, Math.round((g.colW - gw) / 2)));
  var tx = gx + PROBE_CHECK + PROBE_CHECK_GAP;
  return {
    twoLine: twoLine,
    box: { x: gx, y: twoLine ? (g.top + 3) : (g.top + Math.round((g.headRowH - PROBE_CHECK) / 2)),
           w: PROBE_CHECK, h: PROBE_CHECK },
    /* 单行时文字宽度给到列右边界：估算偏小时宁可左边多留白，也不让文字被省略号切掉 */
    label: twoLine
      ? { x: bx + 1, y: g.top + 3 + PROBE_CHECK + 1,
          w: Math.max(10, g.colW - 2), h: Math.max(10, g.headRowH - PROBE_CHECK - 4) }
      : { x: tx, y: g.top, w: Math.max(10, bx + g.colW - tx - 2), h: g.headRowH },
    hit: { x: bx, y: g.top, w: g.colW, h: g.headRowH }
  };
}

/* 列头文字：能用长写法（128Kbps / Hi-Res）就用长的，列窄了换短的，再窄才截断 */
function probeHeadLabel(gr, g, i) {
  var q = PROBE_Q[i];
  var long = PROBE_Q_LABEL[q] || q;
  var short = PROBE_Q_SHORT[q] || long;
  var room = Math.max(12, g.colW - PROBE_CHECK - PROBE_CHECK_GAP - 6);
  if (textWidthOf(gr, long, F.small) <= room) return long;
  if (textWidthOf(gr, short, F.small) <= room) return short;
  return probeFitText(short, room);
}

/* 每个平台名前面的勾选框；hit 覆盖左边整块名字区 */
function probePNameRect(g, si) {
  var y = g.top + g.headRowH + si * g.rowH;
  return {
    box: { x: g.x0 + 8, y: y + Math.round((g.rowH - PROBE_CHECK) / 2),
           w: PROBE_CHECK, h: PROBE_CHECK },
    label: { x: g.x0 + 8 + PROBE_CHECK + PROBE_CHECK_GAP, y: y,
             w: Math.max(8, g.nameW - 8 - PROBE_CHECK - PROBE_CHECK_GAP - 2), h: g.rowH },
    hit: { x: g.x0 + 4, y: y + 1, w: Math.max(24, g.nameW - 6), h: g.rowH - 2 }
  };
}

function probeAgainRect() { return probeRunRectOf(probeGeom()); }

function probeStopRect() { return probeStopRectOf(probeGeom()); }

function probePickRect() { return probePickRectOf(probeGeom()); }

function toggleComments() {
  if (overlay === 'comments') { closeOverlay(); return; }
  showComments();
}

function showComments() {
  var track = targetTrack();
  if (!track || (!track.title && !track.artist)) {
    setStatus('没有正在播放的曲目，先播一首再点「评论」', true);
    return;
  }
  var cid = ++commentLoadId;
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
    if (cid !== commentLoadId || overlay !== 'comments') return;
    overlayLoading = false;
    overlayItems = items || [];
    writeCacheJson(file, { at: Date.now(), items: overlayItems });
    overlaySubject = docBase(track) + ' · 网易云';
    rebuildOverlayLines(true);
    setStatus('评论：' + overlayItems.length + ' 条');
    repaint();
  }, function (e) {
    if (cid !== commentLoadId || overlay !== 'comments') return;
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

function artistPicUrl(url) {
  var u = String(url || '').trim();
  if (!u) return '';
  if (u.indexOf('//') === 0) u = 'https:' + u;
  if (!/music\.126\.net/i.test(u)) return u;
  u = u.split('?')[0];
  return u + '?param=600y600';
}

function slimTrack(t) {
  return {
    uid: t.uid, source: t.source, id: t.id, songmid: t.songmid, mediaMid: t.mediaMid,
    albumId: t.albumId, hash: t.hash, rid: t.rid,
    title: t.title, artist: t.artist, album: t.album,
    duration: t.duration, pic: t.pic, types: t.types || {}
  };
}

function loadBioPic(file, who) {
  bioPicPath = file || '';
  if (!file || !fileReady(file)) return false;
  if (bioPic && bioPicFor === who) return true;
  disposeObj(bioPic);
  bioPic = loadImageFile(file);
  bioPicFor = bioPic ? who : '';
  return !!bioPic;
}

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

function downloadBioPic(pic, picFile, name) {
  if (!pic || !picFile || fileReady(picFile) || bioPicLoading) return;
  var part = picFile + '.part';
  bioPicLoading = true;
  repaint();
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

function toggleBio() {
  if (overlay === 'bio') { closeOverlay(); return; }
  if (editKind) commitEdit();
  showBio();
}

function showBio() {
  var track = targetTrack();
  var name = String((track && track.artist) || '').trim();
  if (!name) {
    setStatus('不知道歌手是谁，先播一首再按 F4（或点顶栏「简介」）看艺人介绍', true);
    return;
  }
  openOverlay('bio', '艺人介绍', name + ' · 网易云');
  setStatus('正在取网易云艺人资料：' + name + ' …');

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
    loadBioPic(picFile, name);
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
function inRect(r, x, y) {
  return !!r && x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h;
}

function platformRect(i) {
  if (hidePlatformRow) return null;
  var g = headGrid();
  return { x: g.x + i * (g.w + g.gap), y: 36, w: g.w, h: hdRow2H() };
}

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
  else if (tab === 1) loadHot(true);
  else if (isBrowseTab()) {
    if (collMode === 'search' && collKeyword) runBrowseSearch();
    else loadRecommend(false);
  }
  repaint();
}

function applyPlatformMode() {
  HEAD_H = headHeight();
  syncPanelSize();
  computeLayout();
  syncQuality();
  if (hidePlatformRow) {
    switchPlatform(fixedPlatform);
  } else {
    var back = String(getP('lx.platform', '') || '');
    switchPlatform(back || platform);
  }
  repaint();
}

function qualityBarW() {
  /* 要放得下最长的一档（音质 FLAC24）；以前写死 96，多一档就会被省略号吃掉 */
  var k = clamp((FONT_BASE || 12) / 12, 1, 1.6);
  return Math.round(120 * k);
}

var HB_GAP = 6;
var SET_W = 50;
var HEAD_BTN_W = 50;

function headCompact() { return hidePlatformRow; }
function headBtnY() { return headCompact() ? 8 : 36; }
function headBtnH() { return headCompact() ? hdRow1H() : hdRow2H(); }

function headHeight() {
  return headCompact() ? Math.max(40, 8 + hdRow1H() + 6)
                       : Math.max(62, 36 + hdRow2H() + 2);
}

function textBtnW() {
  var k = clamp((FONT_BASE || 12) / 12, 1, 1.35);
  return Math.round(HEAD_BTN_W * k);
}

function settingsRect() {
  var w = Math.min(SET_W, Math.max(0, W - PAD));
  return { x: W - PAD - w, y: headBtnY(), w: w, h: headBtnH() };
}

function qualityRect() {
  if (headCompact()) return null;
  var s = settingsRect();
  var w = qualityBarW();
  return { x: s.x - HB_GAP - w, y: 36, w: w, h: hdRow2H() };
}

function commentsRect() {
  var w = textBtnW();
  var x = headCompact() ? (settingsRect().x - HB_GAP - w)
                        : (qualityRect().x - HB_GAP - w);
  return { x: x, y: headBtnY(), w: w, h: headBtnH() };
}

function bioRect() {
  var c = commentsRect();
  var w = textBtnW();
  var x = headCompact() ? (c.x - HB_GAP - w) : c.x;
  return { x: x, y: 8, w: w, h: hdRow1H() };
}

var HEAD_BTNS = [
  { key: 'settings', label: '设置', icon: '' },
  { key: 'comments', label: '评论', icon: '' },
  { key: 'bio', label: '简介', icon: '' }
];

function headerButtonRect(key) {
  if (key === 'settings') return settingsRect();
  if (key === 'comments') return commentsRect();
  if (key === 'bio') return bioRect();
  return null;
}

function headerButtonVisible(key) {
  var r = headerButtonRect(key);
  if (!r) return false;
  if (key === 'settings') return r.x >= PAD;
  return r.x >= tabsEnd() + 8;
}

function iconRect(b) {
  var s = iconSize();
  return { x: b.x + Math.round((b.w - s) / 2),
           y: b.y + Math.round((b.h - s) / 2),
           w: s, h: s };
}

function iconSize() {
  return clamp(Math.round((FONT_BASE || 12) * 1.2), 14, 21);
}

function importRect() {
  return { x: 12, y: 36, w: brandW(), h: hdRow2H() };
}

function drawVersionTag(gr) {
  if (headCompact()) return;
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
  var i = boardScroll + Math.floor((y - L.boardListY) / boardRowH());
  return i >= 0 && i < boards.length ? i : -1;
}

function collAt(x, y) {
  if (!isBrowseTab() || sideCollapsed) return -1;
  if (x < L.board.x || x >= L.board.x + L.board.w) return -1;
  if (y < L.boardListY || y >= L.boardListY + L.boardListH) return -1;
  var i = collScroll + Math.floor((y - L.boardListY) / boardRowH());
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

var ROWBTN_THREE_W = 210;   /* 放得下三个按钮的最小列宽 */
var ROWBTN_TWO_W   = 154;   /* 放得下两个按钮的最小列宽 */

function rowButtonRects(i) {
  var rh = rowH();
  var cr = trackColRect(trackColOf(i));
  var ry = L.track.y + (trackRowOf(i) - trackScroll) * rh;
  var bh = 22;
  var by = ry + Math.round((rh - bh) / 2);
  var out = {};
  if (cr.w >= ROWBTN_THREE_W) {
    /* 够宽：播放 / 队列 / 下载 三连 */
    out.play = { x: cr.x + cr.w - 142, y: by, w: 42, h: bh };
    out.queue = { x: cr.x + cr.w - 96, y: by, w: 42, h: bh };
    out.download = { x: cr.x + cr.w - 50, y: by, w: 42, h: bh };
  } else if (cr.w >= ROWBTN_TWO_W) {
    /* 中等宽：只留播放 / 队列，别把歌名挤没 */
    out.play = { x: cr.x + cr.w - 96, y: by, w: 42, h: bh };
    out.queue = { x: cr.x + cr.w - 50, y: by, w: 42, h: bh };
  }
  /* 再窄就一个按钮都不放，整行留给歌名 */
  return out;
}

function buttonAt(x, y) {
  var i = trackAt(x, y);
  if (i < 0) return '';
  var r = rowButtonRects(i);
  if (r.play && inRect(r.play, x, y)) return 'play';
  if (r.queue && inRect(r.queue, x, y)) return 'queue';
  if (r.download && inRect(r.download, x, y)) return 'download';
  return '';
}

function overlayCloseRect() {
  var r = L.overlay;
  if (!r) return null;
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

// 全局音质：顶栏音质条与「音源」页共用，改它等于所有（非隐藏模式的）播放都跟着变
function setQuality(q) {
  qualityAll = (QUALITIES.indexOf(q) < 0) ? 'auto' : q;
  setProp('lx.quality', qualityAll);
  syncQuality();
  setStatus('全局音质：' + qualityName(qualityAll));
}

// 隐藏第二排平台时专用的音质；选成跟全局一样就等于「跟随全局」，不单存
function setQualityHidden(q) {
  var v = (q && q !== qualityAll && QUALITIES.indexOf(q) >= 0) ? q : '';
  qualityHidden = v;
  setProp('lx.qualityHidden', v);
  syncQuality();
  setStatus(v
    ? '隐藏第二排时音质：' + qualityName(v) + '（顶栏音质条收起后仍按这个走）'
    : '隐藏第二排时音质：跟随全局（' + qualityName(qualityAll) + '）');
}

function estimateTextWidth(text, size) {
  var s = String(text == null ? '' : text);
  var w = 0;
  for (var i = 0; i < s.length; i++) {
    var c = s.charCodeAt(i);
    w += (c > 0x2E80) ? (size || FONT_BASE) : (size || FONT_BASE) * 0.55;
  }
  return w;
}

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
  var w = 0;

  for (var i = 0; i < s.length; i++) {
    var ch = s.charAt(i);
    if (ch === '\n') {
      out.push({ t: line, c: cls });
      line = ''; w = 0;
      continue;
    }
    w += (ch.charCodeAt(0) > 0x2E80) ? base : base * 0.55;
    line += ch;
    if (w > width) {
      out.push({ t: line, c: cls });
      line = ''; w = 0;
    }
  }
  out.push({ t: line, c: cls });
}

// 设置页说明文字折行：优先在空格 / 标点 / 斜杠处断开，避免把一个路径切成 "fl/ac"
var NOTE_BREAK_CH = ' \t，。、；：！？）】》」』,;:!?)/\\|-';

function noteCharW(ch) {
  return ch.charCodeAt(0) > 0x2E80 ? FONT_BASE : FONT_BASE * 0.55;
}

function wrapNoteText(text, width) {
  var s = String(text == null ? '' : text).replace(/\r/g, '');
  var max = Math.max(40, width);
  var out = [], line = '', w = 0, brk = -1;
  var i, j, ch;

  for (i = 0; i < s.length; i++) {
    ch = s.charAt(i);
    if (ch === '\n') { out.push(line); line = ''; w = 0; brk = -1; continue; }
    line += ch;
    w += noteCharW(ch);
    if (NOTE_BREAK_CH.indexOf(ch) >= 0) brk = line.length;
    if (w <= max) continue;
    if (brk > 0 && brk < line.length) {
      out.push(line.slice(0, brk));
      line = line.slice(brk);
      w = 0;
      for (j = 0; j < line.length; j++) w += noteCharW(line.charAt(j));
      brk = -1;
    } else {
      out.push(line); line = ''; w = 0; brk = -1;
    }
  }
  if (line) out.push(line);
  if (!out.length) out.push('');
  return out;
}

function visOverlayLines() {
  var r = L.overlay;
  if (!r) return 0;
  return Math.max(1, Math.floor((overlayBottomY() - overlayTopY()) / overlayLineH()));
}

var OVERLAY_COL_MIN_W = 700;

function overlayColCount() {
  if (overlay !== 'comments') return 1;
  var w = (L.overlay ? L.overlay.w : W) - 34;
  return w >= OVERLAY_COL_MIN_W ? 2 : 1;
}

function overlayColGeom() {
  var r = L.overlay || { x: 0, w: W, h: 0 };
  var avail = Math.max(60, r.w - 34);
  var n = overlayColCount();
  if (n < 2) return { n: 1, x0: r.x + 16, colW: avail, gap: 0 };
  var gap = 18;
  return { n: 2, x0: r.x + 16, colW: Math.max(80, Math.floor((avail - gap) / 2)), gap: gap };
}

var BIO_PIC_MAX = 600;
var BIO_ROW_H = 22;
var BIO_MORE_H = 26;
var BIO_LIST_HEAD = 20;
var BIO_GAP = 16;
var BIO_PAD = 14;

function bioSplitOn() {
  var r = L.overlay;
  if (!r) return false;
  return r.w >= 520 && (r.h - 18) >= 210;
}

function bioLayout() {
  var r = L.overlay || { x: 0, y: 0, w: W, h: 0 };
  var top = overlayTopY();
  var bottom = overlayBottomY();
  var h = Math.max(0, bottom - top);
  var availW = Math.max(120, r.w - BIO_PAD * 2);

  if (!bioSplitOn()) {
    return { split: false, x: r.x + BIO_PAD, y: top, w: availW, h: h,
             top: top, bottom: bottom, rightX: r.x + BIO_PAD, rightW: availW, rightH: h };
  }

  var leftWc = Math.round(availW * 0.52);
  var maxLeft = availW - BIO_GAP - 260;
  if (leftWc > maxLeft) leftWc = Math.max(140, maxLeft);
  leftWc = clamp(leftWc, 140, BIO_PIC_MAX);

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

function bioSongVis(g) {
  if (!g || !g.split) return 0;
  var listH = Math.max(0, g.bottom - g.listY);
  return Math.max(0, Math.floor((listH - BIO_LIST_HEAD - BIO_MORE_H - 4) / BIO_ROW_H));
}

function bioShowCount() {
  return Math.min(bioShow, bioTracks.length);
}

function bioSongClamp(g) {
  var vis = bioSongVis(g);
  var maxS = Math.max(0, bioShowCount() - vis);
  bioSongScroll = clamp(bioSongScroll, 0, maxS);
}

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

function bioHasMore() {
  if (bioShowCount() < bioTracks.length) return true;
  return !!bioId && bioTotal > bioTracks.length && !bioSongsFull;
}

function bioPicAt(x, y) {
  if (overlay !== 'bio' || !bioSplitOn()) return null;
  var g = bioLayout();
  if (!g.split || !g.pic) return null;
  return inRect(g.pic, x, y) ? g.pic : null;
}

function togglePlayback() {
  var wasPlaying = false;
  try { wasPlaying = !!fb.IsPlaying; } catch (e) {}
  try {
    fb.PlayOrPause();
    setStatus(wasPlaying ? '已暂停' : '播放');
    return true;
  } catch (e2) {}

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
  s = s.replace(/^["']+|["']+$/g, '').trim();
  s = trimDirPath(s);
  return /^[a-zA-Z]:$/.test(s) ? s + '\\' : s;
}

function openFileWithShell(path) {
  var p = cleanPath(path);
  if (!p) return false;
  try {
    if (typeof utils.RunFile === 'function') { utils.RunFile(p); return true; }
  } catch (e) {}
  var url = toFileUrl(p);
  if (url && runShellOpen('rundll32.exe', ['url.dll,FileProtocolHandler', url])) return true;
  if (runShellOpen('explorer.exe', [p])) return true;
  return false;
}

function openUrlWithShell(url) {
  var u = String(url == null ? '' : url).trim();
  if (!/^https?:\/\//i.test(u)) return false;

  try {
    if (typeof utils.Run === 'function') {
      var r = utils.Run(u);
      if (r && r.OK) return true;
      try {
        console.log('[LX-UI] utils.Run 打开网址被系统拒绝：Win32Error=' + (r && r.Win32Error) +
                    ' ShellCode=' + (r && r.ShellCode) + '（>32 才算 shell 接受）');
      } catch (e0) {}
    }
  } catch (e) {
    try { console.log('[LX-UI] utils.Run 不可用：' + ((e && e.message) || e)); } catch (e1) {}
  }

  try {
    var sh = new ActiveXObject('Shell.Application');
    sh.ShellExecute(u, '', '', 'open', 1);
    return true;
  } catch (e2) {
    try { console.log('[LX-UI] ShellExecute 打开网址失败，换下一招：' + ((e2 && e2.message) || e2)); } catch (e3) {}
  }

  try {
    if (typeof utils.Run === 'function') {
      var r2 = utils.Run('explorer.exe', [u]);
      if (r2 && r2.OK) return true;
    }
  } catch (e4) {}

  if (runShellOpen('cmd.exe', '/c start "" "' + u.replace(/&/g, '^&') + '"')) return true;
  if (runShellOpen('rundll32.exe', ['url.dll,FileProtocolHandler', u])) return true;
  return false;
}

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

function durText(sec) {
  var s = Math.max(0, Math.round(Number(sec) || 0));
  var m = Math.floor(s / 60);
  var r = s - m * 60;
  return m + ':' + (r < 10 ? '0' : '') + r;
}


function overlayRowCount() {
  var n = 0;
  for (var i = 0; i < overlayCols.length; i++) {
    if (overlayCols[i].length > n) n = overlayCols[i].length;
  }
  return n;
}

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
      ls.push({ t: '', c: 'text' });
      blocks.push(ls);
    });
  }

  var i, k, one = [];
  if (cols < 2 || blocks.length < 2) {
    for (i = 0; i < blocks.length; i++) one = one.concat(blocks[i]);
    return [one];
  }

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

function overlayTextGeom() {
  if (overlay === 'bio') {
    var b = bioLayout();
    var w = Math.max(60, b.split ? b.rightW : b.w);
    return { n: 1, x0: b.split ? b.rightX : b.x, colW: w, gap: 0, bio: b };
  }
  return overlayColGeom();
}

function rebuildOverlayLines(force) {
  if (overlay === 'probe') { overlayCols = []; return; }
  var g = overlayTextGeom();
  var key = g.n + '|' + g.colW;
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

function buildDiagnosticLines(out, width) {
  var st = (NM.lx && NM.lx.state) || {};
  var runtimes = st.runtimes || [];
  var usable = runtimes.filter(function (r) { return r.sources; });

  out.push({ t: '【环境】', c: 'head' });
  out.push({ t: '音源脚本目录：' + (st.dir || '（没找到）'), c: st.dir ? 'text' : 'err' });
  out.push({ t: '模块目录：' + (NM.moduleDir || getP('lx.moduleDir', '') || '（没找到）'), c: 'text' });
  out.push({ t: '缓存目录：' + (cacheDir() || '（不可用）') + '（索引 / 评论 / 封面）', c: 'text' });
  out.push({ t: 'MP3 缓存：' + (audioDir('mp3') || '（不可用）'), c: 'text' });
  out.push({ t: 'FLAC 缓存：' + (audioDir('flac') || '（不可用）'), c: 'text' });
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


function iconEllipse(gr, cx, cy, r, col, yMin, yMax, ry) {
  ry = ry || r;
  var y0 = Math.floor(cy - ry), y1 = Math.ceil(cy + ry);
  if (yMin != null) y0 = Math.max(y0, yMin);
  if (yMax != null) y1 = Math.min(y1, yMax);
  for (var yy = y0; yy <= y1; yy++) {
    var dy = ((yy + 0.5) - cy) / ry;
    var q = 1 - dy * dy;
    if (q <= 0) continue;
    var hw = Math.round(r * Math.sqrt(q) * 2) / 2;
    if (hw < 1) continue;
    var xa = Math.round(cx - hw), xb = Math.round(cx + hw);
    if (xb - xa < 1) continue;
    gr.FillSolidRect(xa, yy, xb - xa, 1, col);
  }
}

function iconCircle(gr, cx, cy, r, col, yMin, yMax) {
  iconEllipse(gr, cx, cy, r, col, yMin, yMax, r);
}

function drawUserIcon(gr, x, y, s, col) {
  var k = s / 14;
  var cx = x + s / 2;
  iconEllipse(gr, cx, y + 4.5 * k, 3.6 * k, col, null, null, 3.4 * k);
  iconCircle(gr, cx, y + 12.6 * k, 5.4 * k, col,
             Math.round(y + 8.2 * k), Math.round(y + 12.3 * k));
}

function drawChatIcon(gr, x, y, s, col) {
  var k = s / 14;
  var lh = Math.max(1, Math.round(k));
  var rows = 6;
  for (var row = 0; row < rows; row++) {
    var inset = (row === 0 || row === rows - 1) ? 1 : 0;
    var bx = Math.round(x + (1.5 + inset) * k);
    var bw = Math.round((11 - inset * 2) * k);
    if (bw < 1) continue;
    gr.FillSolidRect(bx, Math.round(y + (3 + row) * k), bw, lh, col);
  }
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
    /* 背景透明：常态不铺底，直接用标题栏自己的底；只有悬停时补一层淡色 */
    if (hot) gr.FillSolidRect(b.x, b.y, b.w, b.h, tint(C.hover, BG_A.rowHot));
    gr.DrawRect(b.x + 0.5, b.y + 0.5, b.w - 1, b.h - 1, 1, A(C.line, hot ? 235 : 190));
    if (btn.icon) {
      drawButtonIcon(gr, btn.icon, b, hot ? C.accent : C.text);
    } else {
      gr.GdiDrawText(btn.label, F.hdr, hot ? C.accent : C.text,
                     b.x, b.y, b.w, b.h, FLAG_CENTER);
    }
  }
}

var BRAND = '网络音乐';
var BRAND_ASPECT = 2;          /* 800 × 400 */

var brandLogo = null;
var brandLogoChecked = false;

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

function brandLogoPath() {
  var dirs = [];
  function add(p) {
    p = String(p || '').replace(/[\\\/]+$/, '');
    if (p && dirs.indexOf(p) < 0) dirs.push(p);
  }
  try { add(NM && NM.moduleDir); } catch (e) {}
  add(moduleDir);
  try { add(getP('lx.moduleDir', '')); } catch (e) {}

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
        try { gr.SetInterpolationMode(7); } catch (eI) {}
        gr.DrawImage(lg, lr.x, lr.y, lr.w, lr.h, 0, 0, sz[0], sz[1], 0, 255);
        try { gr.SetInterpolationMode(0); } catch (eI2) {}
        return;
      } catch (e) {}
    }
  }

  gr.GdiDrawText(BRAND, F.hdrB, C.text, r.x, r.y, r.w, r.h, FLAG_CENTER);
}

function drawHeader(gr) {
  gr.FillSolidRect(0, 0, W, HEAD_H, tint(C.bg, surfA('head', BG_A.header)));

  drawBrand(gr);
  drawVersionTag(gr);

  for (var i = 0; i < TAB_DEFS.length; i++) {
    var r = tabRect(i);
    var active = tab === i;
    var hot = hoverOn(r);
    /* 标签页背景透明：当前页靠文字强调色 + 底部 2px 条区分，不铺底 */
    if (!active && hot) gr.FillSolidRect(r.x, r.y, r.w, r.h, tint(C.hover, BG_A.tabHot));
    gr.GdiDrawText(TAB_DEFS[i].label, F.hdrB, active ? C.accent : (hot ? C.text : C.dim),
                   r.x, r.y, r.w, r.h, FLAG_CENTER);
    if (active) gr.FillSolidRect(r.x, r.y + r.h - 2, r.w, 2, C.accent);
  }

  var order = NM.providers.order;
  for (var j = 0; j < order.length; j++) {
    var p = order[j];
    var pr = platformRect(j);
    if (!pr) break;
    var on = platform === p;
    var phot = hoverOn(pr);
    /* 背景透明：选中只靠文字变强调色 */
    if (!on && phot) gr.FillSolidRect(pr.x, pr.y, pr.w, pr.h, tint(C.hover, BG_A.chip));
    var meta = NM.providers.meta[p] || { short: p };
    gr.GdiDrawText(meta.short || p, F.hdr, on ? C.accent : (phot ? C.text : C.dim),
                   pr.x, pr.y, pr.w, pr.h, FLAG_CENTER);
  }

  drawQualityBar(gr);
  drawScriptBar(gr);

  drawHeaderButtons(gr);
}

var sbGeom = {};        /* id -> { x, y, h, total, visible, offset } */
var sbDrag = null;
var sbGuard = false;
var sbHotId = '';

/* 鼠标进入滚动条判定区时加宽显示；sbHotId 用于触发重绘 */
function sbHoverAt(id, x, y, h) {
  if (sbDrag && sbDrag.id === id) return true;
  return mouseX >= x - 7 && mouseX <= x + 6 && mouseY >= y && mouseY <= y + h;
}

function updateScrollbarHot(x, y, id) {
  var now = (id === undefined) ? scrollbarHit(x, y) : id;
  if (now !== sbHotId) {
    sbHotId = now;
    repaint();
  }
}

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
  var hot = sbHoverAt(id, x, y, h);
  var wide = hot ? 7 : 3;
  var bx = x - (wide - 3);

  gr.FillSolidRect(bx, y, wide, h, A(C.scroll, hot ? 0x66 : 0x30));
  gr.FillSolidRect(bx, p.thumbY, wide, p.thumbH, A(C.scroll, hot ? 0xD0 : 0x80));
}

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
  else if (id === 'set') setScroll = v;
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
  var dir = sideCollapsed ? 1 : -1;
  gr.DrawLine(cx + dir * 3, cy, cx - dir * 2, cy - 4, 1, col);
  gr.DrawLine(cx + dir * 3, cy, cx - dir * 2, cy + 4, 1, col);
}

function drawSideRail(gr, label) {
  var r = L.board;
  gr.FillSolidRect(r.x, r.y, r.w, r.h, tint(C.panel, surfA('side', BG_A.side)));
  gr.DrawLine(r.x + r.w - 1, r.y, r.x + r.w - 1, r.y + r.h, 1, A(C.line, 205));

  var t = String(label || '');
  var lh = clamp(FONT_BASE + 2, 13, 17);
  var y0 = r.y + 28;
  for (var i = 0; i < t.length; i++) {
    if (y0 + i * lh > r.y + r.h - lh) break;
    gr.GdiDrawText(t.charAt(i), F.small, C.dim, r.x, y0 + i * lh, r.w - 1, lh, FLAG_CENTER);
  }
  drawSideToggle(gr);
}

function drawBoardList(gr) {
  if (sideCollapsed) { drawSideRail(gr, '榜单'); return; }
  gr.FillSolidRect(L.board.x, L.board.y, L.board.w, L.board.h, tint(C.panel, surfA('side', BG_A.side)));
  var bh1 = Math.min(24, Math.max(20, FONT_BASE + 4));
  gr.GdiDrawText('榜单', F.small, C.dim, L.board.x + 10, L.board.y + 2,
                 Math.max(30, L.board.w - 20 - 26), bh1, FLAG_LEFT);
  drawSideToggle(gr);

  var vis = visBoardRows();
  var rh = boardRowH();
  for (var i = boardScroll; i < boards.length && i < boardScroll + vis; i++) {
    var ry = L.boardListY + (i - boardScroll) * rh;
    var on = i === boardIndex;
    var hot = i === hoverRow && hoverKind === 'board';
    if (on) drawSelFrame(gr, L.board.x, ry, L.board.w, rh, C.accent);
    else if (hot) gr.FillSolidRect(L.board.x, ry, L.board.w, rh, tint(C.hover, BG_A.rowHot));
    gr.GdiDrawText(boards[i].name, F.normal, on ? C.accent : C.text,
                   L.board.x + 10, ry, L.board.w - 20, rh, FLAG_LEFT);
  }

  drawScrollbar(gr, 'board', L.board.x + L.board.w - 4, L.boardListY, L.boardListH,
                boards.length, vis, boardScroll);
}

function collRecRect() {
  if (sideCollapsed || !isBrowseTab() || !L.board) return null;
  return { x: L.board.x + L.board.w - 72, y: L.board.y + 3, w: 42, h: 18 };
}

function drawCollList(gr) {
  if (sideCollapsed) { drawSideRail(gr, browseLabel()); return; }
  gr.FillSolidRect(L.board.x, L.board.y, L.board.w, L.board.h, tint(C.panel, surfA('side', BG_A.side)));
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
  var rh = boardRowH();
  for (var i = collScroll; i < collItems.length && i < collScroll + vis; i++) {
    var it = collItems[i] || {};
    var ry = L.boardListY + (i - collScroll) * rh;
    var on = i === collIndex;
    var hot = i === hoverRow && hoverKind === 'coll';
    if (on) drawSelFrame(gr, L.board.x, ry, L.board.w, rh, C.accent);
    else if (hot) gr.FillSolidRect(L.board.x, ry, L.board.w, rh, tint(C.hover, BG_A.rowHot));
    var label = String(it.name || '(未命名)');
    var tip = String(it.artist || '');
    if (!tip && it.count) tip = it.count + ' 首';
    if (tip) label += '  ' + tip;
    gr.GdiDrawText(label, F.small, on ? C.accent : C.text,
                   L.board.x + 10, ry, L.board.w - 20, rh, FLAG_LEFT);
  }

  drawScrollbar(gr, 'coll', L.board.x + L.board.w - 4, L.boardListY, L.boardListH,
                collItems.length, vis, collScroll);
  drawSideToggle(gr);
}

function drawTrackHeader(gr) {
  if (tab === 1 && hotMode) return;

  var fallback = tab === 0 ? '选择榜单'
    : (tab === 1 ? (hotMode ? hotTitle() : '搜索')
      : (collMode === 'search' && collKeyword
          ? browseLabel() + '：' + collKeyword
          : collTopName()));
  var title = trackTitle || fallback;
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
  // 静止态和标题栏同色（C.bg），中间没有线，融成一片；指上去 / 打字时才浮起一层
  gr.FillSolidRect(r.x, r.y, r.w, r.h,
                   (hot || editing) ? tint(C.panel2, surfA('search', BG_A.fieldHot))
                                    : tint(C.bg, surfA('search', BG_A.field)));

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

function drawButtons(gr, i) {
  var r = rowButtonRects(i);
  var isHover = hoverRow === i && hoverKind === 'track';
  var playHot = isHover && hoverBtn === 'play';
  var queueHot = isHover && hoverBtn === 'queue';
  var dlHot = isHover && hoverBtn === 'download';

  if (r.play) {
    if (playHot) gr.FillSolidRect(r.play.x, r.play.y, r.play.w, r.play.h, tint(C.hover, BG_A.rowHot));
    gr.GdiDrawText('播放', F.tiny, playHot ? C.accent : C.dim,
                   r.play.x, r.play.y, r.play.w, r.play.h, FLAG_CENTER);
  }

  if (r.queue) {
    if (queueHot) gr.FillSolidRect(r.queue.x, r.queue.y, r.queue.w, r.queue.h, tint(C.hover, BG_A.rowHot));
    gr.GdiDrawText('队列', F.tiny, queueHot ? C.accent : C.dim,
                   r.queue.x, r.queue.y, r.queue.w, r.queue.h, FLAG_CENTER);
  }

  if (r.download) {
    if (dlHot) gr.FillSolidRect(r.download.x, r.download.y, r.download.w, r.download.h, tint(C.hover, BG_A.rowHot));
    gr.GdiDrawText('下载', F.tiny, dlHot ? C.accent : C.dim,
                   r.download.x, r.download.y, r.download.w, r.download.h, FLAG_CENTER);
  }
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

      if (checked) gr.FillSolidRect(cx, ry, cw, rh, tint(C.accentDim, 170));
      else if (hot) gr.FillSolidRect(cx, ry, cw, rh, tint(C.hover, BG_A.rowHot));
      if (on) drawSelFrame(gr, cx + 2, ry, cw - 4, rh, C.accent);
      drawCheckbox(gr, i, checked);

      var t = tracks[i];
      var textW = Math.max(40, cw - (cw >= ROWBTN_THREE_W ? 178
                                   : (cw >= ROWBTN_TWO_W ? 132 : 34)));
      var title = t.title || '(未知曲目)';
      var tx = cx + 26;

      if (one) {
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
        var lh1 = trackLineH1();
        gr.GdiDrawText(title, F.normal, on ? C.accent : C.text,
                       tx, ry + 2, textW, lh1, FLAG_LEFT);
        gr.GdiDrawText(subtitleOf(t), F.small, C.dim,
                       tx, ry + 2 + lh1, textW, trackLineH2(), FLAG_LEFT);
      }
      drawButtons(gr, i);

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

function overlayHeadH(r) {
  if (overlay !== 'logs' && overlay !== 'probe') return 0;
  return Math.min(50, (r || L.overlay || { h: 0 }).h);
}

function overlayHeadRows() {
  return overlay === 'comments' ? 2 : 0;
}

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

var SCRIPT_BAR_MIN_W = 520;
var scriptHot = false;
var qBarHot = false;

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
  try { v = String(getP('lx.script.' + (source || platform), '') || ''); } catch (e) { v = ''; }
  return v;
}

function scriptName(rt) {
  var n = String((rt && rt.name) || '');
  var v = String((rt && rt.version) || '');
  return v ? (n + ' ' + v) : n;
}

function scriptShort(source) {
  var id = scriptPrefId(source);
  if (!id) return '自动';
  var list = scriptRuntimes();
  for (var i = 0; i < list.length; i++) if (list[i].id === id) return String(list[i].name || id);
  return '已移除的脚本';
}

function qualityBarHot(x, y) {
  if (W < 440) return false;
  return inRect(qualityRect(), x, y);
}

function drawQualityBar(gr) {
  if (W < 440) return;
  var r = qualityRect();
  if (!r) return;
  var hot = qBarHot || hoverOn(r);
  if (hot) gr.FillSolidRect(r.x, r.y, r.w, r.h, tint(C.hover, BG_A.rowHot));
  gr.DrawRect(r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1, 1, A(C.line, hot ? 235 : 190));

  var col = hot ? C.accent : C.text;
  gr.GdiDrawText('音质 ' + qualityName(qualityAll), F.hdr, col,
                 r.x + 8, r.y, Math.max(20, r.w - 24), r.h, FLAG_LEFT);

  var ax = r.x + r.w - 14, ay = r.y + Math.round(r.h / 2) - 2;
  gr.DrawLine(ax, ay, ax + 4, ay + 4, 1, col);
  gr.DrawLine(ax + 8, ay, ax + 4, ay + 4, 1, col);
}

/* 下拉里那一行：名字 + 一句说明（太长的说法只有菜单里有） */
function qualityPickText(q) {
  var n = qualityName(q);
  var d = qualityHint(q);
  return d ? (n + ' · ' + d) : n;
}

/* forHidden = true 时改的是「隐藏第二排时音质」；选成跟全局同一档就等于跟随全局 */
function openQualityMenu(x, y, forHidden) {
  var cur = forHidden ? (qualityHidden || qualityAll) : qualityAll;
  var m = window.CreatePopupMenu();
  for (var i = 0; i < QUALITIES.length; i++) {
    var q = QUALITIES[i];
    var label = (q === 'auto')
      ? '自动（按脚本能力挑最高的）'
      : (qualityName(q) + (qualityHint(q) ? '　' + qualityHint(q) : ''));
    if (forHidden && q === qualityAll) label += '　← 跟全局一样';
    m.AppendMenuItem(MF_STRING | (q === cur ? MF_CHECKED : 0), 10 + i, label);
  }
  var sel = m.TrackPopupMenu(x, y);
  var idx = sel - 10;
  if (idx >= 0 && idx < QUALITIES.length) {
    if (forHidden) setQualityHidden(QUALITIES[idx]);
    else setQuality(QUALITIES[idx]);
    repaint();
  }
}

function scriptBarText() {
  return '音源：' + scriptShort(platform);
}

function scriptBarOn() {
  return W >= SCRIPT_BAR_MIN_W;
}

function scriptBarRect() {
  if (headCompact()) return null;
  if (!scriptBarOn()) return null;
  var x = bioRect().x + bioRect().w + HB_GAP;
  var minX = tabsEnd() + 8;
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

  /* 背景透明：固定（pin）与悬停都只改描边和文字色 */
  if (hot && !pin) gr.FillSolidRect(r.x, r.y, r.w, r.h, tint(C.hover, BG_A.rowHot));

  gr.DrawRect(r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1, 1,
              A(C.line, pin ? 220 : (hot ? 235 : 190)));

  var col = pin ? C.accent : (hot ? C.text : C.dim);
  gr.GdiDrawText(scriptBarText(), F.hdr, col,
                 r.x + 8, r.y, Math.max(20, r.w - 24), r.h, FLAG_LEFT);

  var ax = r.x + r.w - 14, ay = r.y + Math.round(r.h / 2) - 2;
  gr.DrawLine(ax, ay, ax + 4, ay + 4, 1, col);
  gr.DrawLine(ax + 8, ay, ax + 4, ay + 4, 1, col);
}

function applyScript(id) {
  var label = id ? '' : '自动';
  if (id) {
    var list = scriptRuntimes();
    for (var i = 0; i < list.length; i++) if (list[i].id === id) label = scriptName(list[i]);
    if (!label) label = id;
  }
  setProp('lx.script.' + platform, id || '');
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

function drawBioLeft(gr, g) {
  drawBioPic(gr, g);

  var head = !bioTracks.length
    ? (overlayLoading ? '热门歌曲 · 正在加载…' : '热门歌曲')
    : '热门歌曲 ' + bioShowCount() + ' / ' + (bioTotal || bioTracks.length);
  gr.GdiDrawText(head, F.small, C.dim, g.listX, g.listY, g.listW, BIO_LIST_HEAD, FLAG_LEFT);

  bioSongClamp(g);
  var vis = bioSongVis(g);
  var rowsTop = g.listY + BIO_LIST_HEAD;
  var rightW = 46;

  for (var i = bioSongScroll; i < bioShowCount() && i < bioSongScroll + vis; i++) {
    var t = bioTracks[i];
    if (!t) continue;
    var ry = rowsTop + (i - bioSongScroll) * BIO_ROW_H;
    var on = i === bioSongSel;
    if (on) drawSelFrame(gr, g.listX, ry, g.listW, BIO_ROW_H, C.accent);

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

/* 列窄（四档挤在一起）时用紧凑文案，省掉「可用」两个字也读得懂 */
function probeCellTextShort(c) {
  if (!c) return '—';
  if (c.st === 'wait') return '·';
  if (c.st === 'run') return '…';
  if (c.st === 'ok') return (c.ms / 1000).toFixed(1) + 's';
  if (c.st === 'addr') return '地址';
  if (c.st === 'fail') return '失败';
  return '—';
}

function probeCellText(c) {
  if (!c) return '—';
  if (c.st === 'wait') return '·';
  if (c.st === 'run') return '…';
  if (c.st === 'ok') return '可用 ' + (c.ms / 1000).toFixed(1) + 's';
  if (c.st === 'addr') return '仅地址';
  if (c.st === 'fail') return '失败';
  return '—';
}

/* 按估算宽度把文字截到放得下，末尾补省略号 */
function probeFitText(s, maxW) {
  s = String(s == null ? '' : s);
  if (btnTextNeed(s) <= maxW) return s;
  var t = s;
  while (t.length > 1 && btnTextNeed(t + '…') > maxW) t = t.slice(0, t.length - 1);
  return t + '…';
}

/* 检测表里的小勾选框：跟段控（seg）一个调子——淡accent底 + accent 边框 */
function drawProbeCheck(gr, r, on, hot) {
  if (!r) return;
  gr.FillSolidRect(r.x, r.y, r.w, r.h,
                   on ? A(C.accent, hot ? 78 : 58) : (hot ? tint(C.btnHot, 215) : tint(C.panel2, 200)));
  gr.DrawRect(r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1, 1,
              on ? A(C.accent, hot ? 255 : 225) : A(C.line, hot ? 240 : 185));
  if (!on) return;
  var x1 = r.x + 3, y1 = r.y + Math.round(r.h / 2);
  var x2 = r.x + Math.round(r.w * 0.42), y2 = r.y + r.h - 4;
  var x3 = r.x + r.w - 3.5, y3 = r.y + 4;
  gr.DrawLine(x1, y1, x2, y2, 2, C.accent);
  gr.DrawLine(x2, y2, x3, y3, 2, C.accent);
}

// 检测界面主体：浮层与设置右栏共用。o.clipTop / o.clipBot 限定可绘制范围。
function drawProbeBody(gr, g, o) {
  o = o || {};
  var cTop = o.clipTop == null ? -100000 : o.clipTop;
  var cBot = o.clipBot == null ? 100000 : o.clipBot;
  function vis(y, h) { return (y >= cTop - 2) && (y + h <= cBot + 2); }

  var pr = probePickRectOf(g);
  if (pr && vis(pr.y, pr.h)) {
    var ph = hoverOn(pr);
    gr.FillSolidRect(pr.x, pr.y, pr.w, pr.h, ph ? tint(C.btnHot, 220) : tint(C.panel2, 215));
    gr.DrawRect(pr.x + 0.5, pr.y + 0.5, pr.w - 1, pr.h - 1, 1,
                ph ? C.accent : A(C.line, 185));
    /* 并到按钮右边以后宽度有限：先去掉「检测音源：」前缀，再不行就省略号 */
    var avail = Math.max(20, pr.w - 28);
    var plab = '检测音源：' + probeScriptLabel();
    if (btnTextNeed(plab) > avail && btnTextNeed(probeScriptLabel()) <= avail) {
      plab = probeScriptLabel();
    }
    gr.GdiDrawText(probeFitText(plab, avail), F.small,
                   ph ? C.accent : C.text, pr.x + 8, pr.y,
                   avail, pr.h, FLAG_LEFT);
    var pax = pr.x + pr.w - 15, pay = pr.y + Math.round(pr.h / 2) - 2;
    var pac = ph ? C.accent : C.dim;
    gr.DrawLine(pax, pay, pax + 4, pay + 4, 1, pac);
    gr.DrawLine(pax + 8, pay, pax + 4, pay + 4, 1, pac);
  }

  var qi, qj, si, vi;

  if (vis(g.top, g.headRowH)) {
    gr.FillSolidRect(g.x0, g.top, g.tw, g.headRowH, tint(C.panel, 210));
    gr.GdiDrawText('音源', F.small, C.dim, g.x0 + 8, g.top, g.nameW - 10, g.headRowH, FLAG_LEFT);
    for (qi = 0; qi < PROBE_Q.length; qi++) {
      var hq = probeQHeadRect(g, qi);
      var qon = probeQOn(PROBE_Q[qi]);
      var qhot = hoverOn(hq.hit);
      var qcol = qon ? C.dim : A(C.dim, 140);
      var qbx = g.x0 + g.nameW + qi * g.colW;
      if (hq.twoLine) {
        /* 两行：勾选框居中在上，档位名（短写法）居中在下 */
        var qslab = PROBE_Q_SHORT[PROBE_Q[qi]] || PROBE_Q_LABEL[PROBE_Q[qi]] || PROBE_Q[qi];
        drawProbeCheck(gr, hq.box, qon, qhot);
        gr.GdiDrawText(qslab, F.small, qcol,
                       hq.label.x, hq.label.y, hq.label.w, hq.label.h, FLAG_CENTER);
      } else {
        /* 一行：按真实字宽重新居中（估算值只用来算点击区），文字框给足不吃省略号 */
        var qlab = probeHeadLabel(gr, g, qi);
        var qtw = textWidthOf(gr, qlab, F.small);
        var qgw = PROBE_CHECK + PROBE_CHECK_GAP + qtw;
        var qgx = qbx + Math.max(1, Math.round((g.colW - qgw) / 2));
        drawProbeCheck(gr, { x: qgx, y: hq.box.y, w: PROBE_CHECK, h: PROBE_CHECK }, qon, qhot);
        gr.GdiDrawText(qlab, F.small, qcol,
                       qgx + PROBE_CHECK + PROBE_CHECK_GAP, hq.label.y,
                       qtw + 6, hq.label.h, FLAG_LEFT);
      }
    }
  }

  var y = g.top + g.headRowH;
  for (si = 0; si < PROBE_SRC.length; si++) {
    if (vis(y, g.rowH)) {
      var p = PROBE_SRC[si];
      var pon = probePOn(p);
      var np = probePNameRect(g, si);
      var nhot = hoverOn(np.hit);
      if (si % 2 === 0) gr.FillSolidRect(g.x0, y, g.tw, g.rowH, tint(C.panel2, 90));
      drawProbeCheck(gr, np.box, pon, nhot);
      gr.GdiDrawText(probeName(p), F.small,
                     pon ? (nhot ? C.accent : C.text) : A(C.dim, 145),
                     np.label.x, np.label.y, np.label.w, np.label.h, FLAG_LEFT);
      for (qj = 0; qj < PROBE_Q.length; qj++) {
        var c = probeCell(p, PROBE_Q[qj]);
        var off = !pon || !probeQOn(PROBE_Q[qj]);
        var col = off ? A(C.dim, 120)
                : c.st === 'ok' ? C.accent
                : c.st === 'fail' ? C.err
                : (c.st === 'addr' ? C.text : A(C.dim, 190));
        gr.GdiDrawText(off ? '—' : (g.colW < 68 ? probeCellTextShort(c) : probeCellText(c)),
                       F.small, col,
                       g.x0 + g.nameW + qj * g.colW, y, g.colW, g.rowH, FLAG_CENTER);
      }
    }
    y += g.rowH;
  }

  for (si = 0; si <= PROBE_SRC.length; si++) {
    var ly = si === 0 ? g.top : g.top + g.headRowH + (si - 1) * g.rowH;
    if (ly >= cTop - 1 && ly <= cBot + 1) {
      gr.DrawLine(g.x0, ly, g.x0 + g.tw, ly, 1, A(C.line, si <= 1 ? 200 : 150));
    }
  }
  var vy0 = Math.max(g.top, cTop);
  var vy1 = Math.min(g.top + g.tableH, cBot);
  if (vy1 > vy0) {
    for (vi = 0; vi <= PROBE_Q.length; vi++) {
      var vx = g.x0 + g.nameW + vi * g.colW;
      gr.DrawLine(vx, vy0, vx, vy1, 1, A(C.line, 150));
    }
  }

  var lg = probeLegendLines();
  for (si = 0; si < lg.length; si++) {
    var lyy = g.legendY + si * PROBE_LEGEND_H;
    if (!vis(lyy, PROBE_LEGEND_H)) continue;
    gr.GdiDrawText(lg[si], F.tiny, A(C.dim, 225),
                   g.x0, lyy, g.w, PROBE_LEGEND_H, FLAG_LEFT);
  }
  var nl = probeNoteLines(g.w);
  for (si = 0; si < nl.length; si++) {
    var ny = g.legendY + g.legendH + 6 + si * PROBE_LEGEND_H;
    if (!vis(ny, PROBE_LEGEND_H)) continue;
    gr.GdiDrawText(nl[si].t, F.tiny, probeNote ? A(C.err, 225) : A(C.dim, 195),
                   g.x0, ny, g.w, PROBE_LEGEND_H, FLAG_LEFT);
  }

  var b = probeRunRectOf(g);
  if (b && vis(b.y, b.h)) {
    var bhot = hoverOn(b);
    gr.FillSolidRect(b.x, b.y, b.w, b.h, bhot ? tint(C.btnHot, 220) : tint(C.btn, 170));
    gr.DrawRect(b.x + 0.5, b.y + 0.5, b.w - 1, b.h - 1, 1, A(C.line, bhot ? 240 : 180));
    gr.GdiDrawText(probeBusy ? '检测中…' : (probeAt ? '重新检测' : '开始检测'), F.small,
                   probeBusy ? C.dim : (bhot ? C.accent : C.text),
                   b.x, b.y, b.w, b.h, FLAG_CENTER);
  }

  var sb = probeStopRectOf(g);
  if (sb && vis(sb.y, sb.h)) {
    var sOn = probeBusy && hoverOn(sb);
    gr.FillSolidRect(sb.x, sb.y, sb.w, sb.h,
                     sOn ? tint(C.btnHot, 220) : tint(C.btn, probeBusy ? 170 : 110));
    gr.DrawRect(sb.x + 0.5, sb.y + 0.5, sb.w - 1, sb.h - 1, 1,
                A(C.line, probeBusy ? 180 : 120));
    gr.GdiDrawText('停止检测', F.small,
                   !probeBusy ? A(C.dim, 165) : (sOn ? C.err : C.dim),
                   sb.x, sb.y, sb.w, sb.h, FLAG_CENTER);
  }

  var il = probeInfoLines(g.w);
  for (si = 0; si < il.length; si++) {
    var iy = g.infoY + si * PROBE_LEGEND_H;
    if (!vis(iy, PROBE_LEGEND_H)) continue;
    gr.GdiDrawText(il[si].t, F.tiny, probeBusy ? A(C.accent, 235) : A(C.dim, 235),
                   g.x0, iy, g.w, PROBE_LEGEND_H, FLAG_LEFT);
  }
}

function scopeLine() {
  var scope = probeScriptId() ? ('只测 ' + probeScriptLabel() + ' · ') : '';
  if (probeBusy) return scope + probeMsg;
  return probeAt ? (scope + probeClock(probeAt) + ' · ' + probeSummary()) : (scope + probeMsg);
}

function drawProbeOverlay(gr, r) {
  var g = probeGeom();
  if (!g) return;

  gr.GdiDrawText('音源音质检测', F.head, C.accent,
                 r.x + 14, r.y + 6, Math.max(40, r.w - 70), 24, FLAG_LEFT);
  gr.GdiDrawText(scopeLine(), F.small, C.dim, r.x + 14, r.y + 28,
                 Math.max(40, r.w - 60), 20, FLAG_LEFT);
  gr.DrawLine(r.x + 10, r.y + 50, r.x + r.w - 10, r.y + 50, 1, A(C.line, 220));

  drawProbeBody(gr, g, { clipTop: r.y + 50, clipBot: r.y + r.h - 6 });

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

  paintOverlayBg(gr, r);

  if (overlay === 'probe') {
    drawProbeOverlay(gr, r);
    return;
  }

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

  if (overlayHeadRows() > 0) {
    var hy = r.y + 6;
    gr.GdiDrawText(overlayName || '', F.head, C.accent,
                   g.x0, hy, Math.max(40, g.colW - 20), lineH + 4, FLAG_LEFT);
    if (overlaySubject) {
      gr.GdiDrawText(overlaySubject, F.small, C.dim,
                     g.x0, hy + lineH, Math.max(40, g.colW - 10), lineH, FLAG_LEFT);
    }
  }

  if (bio && bio.split) {
    drawBioLeft(gr, bio);
    gr.DrawLine(bio.sepX, top - 4, bio.sepX, bottom, 1, A(C.line, 170));
  }

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

  var over = bottom + vis * lineH;
  if (over > bottom) {
    paintOverlayTail(gr, r, bottom, Math.max(0, r.y + r.h - bottom - 1));
  }

  drawScrollbar(gr, 'overlay', r.x + r.w - 7, top, bottom - top, overlayRowCount(), vis, overlayScroll);

  var cb = overlayCloseRect();
  if (cb) {
    var chot = hoverOn(cb);
    gr.GdiDrawText('×', F.head, chot ? C.err : C.dim, cb.x, cb.y, cb.w, cb.h, FLAG_CENTER);
  }
}

var setVer = 0;
var setLayoutCache = null;
var setLayoutKey = '';

function setProp(k, v) {
  try { setP(k, String(v)); } catch (e) {}
  setVer++;
  setLayoutCache = null;
  rowLinesCache = 0;
  rowGapCache = null;
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
var setDrag = '';
var setCat = 'look';
var setHot = '';

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
/* 设置页滚轮一格滚多远：约等于一行，滚起来跟手 */
var SET_WHEEL_STEP = 46;
var SET_CTL_X = 110;
var SET_CTL_MAX = 360;

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
  { id: 'look', name: '外观', hint: '缩放、字号、配色、曲目清单行数、第二排平台、隐藏时的音质。改完立刻生效。' },
  { id: 'bg', name: '背景', hint: '三段：背景效果（底图）、四个区块（标题栏 / 搜索栏 / 左侧栏 / 内容区的蒙版）、浮层（设置 / 简介 / 评论三个整屏界面）。' },
  { id: 'src', name: '音源', hint: '播放方式（在线流播 / 边下边播 / 下完再播）、流播封面挂载、曲目信息广播（把歌手 / 歌名推给皮肤面板）、让 ESLyric 代搜歌词、缓存 / 音源目录、扩展名检测、播放音源、全局音质、在线音源网址。目录留空用默认。' },
  { id: 'tag', name: '标签', hint: '封面嵌入音频、同时写同名 jpg；苹果标签源（可选，逐字段勾选，含古典作品 / 乐章）。播放方式与流播封面推送在「音源」页。' },
  { id: 'probe', name: '检测', hint: '音源音质检测：各平台到底能出哪几档。左栏不用关，右栏勾平台 / 档位、选脚本、开始 / 停止检测。' },
  { id: 'maint', name: '维护', hint: '刷新列表 / 重载音源 / 导入音源 / 重嵌封面 / 清缓存 / 诊断日志 / 界面发布页地址。' }
];

function propStr(k, d) {
  var v = '';
  try { v = getP(k, d); } catch (e) { v = d; }
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

function refreshBgFx(retheme) {
  if (retheme) applyTheme(true);
  buildBackdrop();
  repaint();
}

function setBgArt(on) {
  setProp('lx.bgArt', on ? '1' : '0');
  applyTheme(true);
  if (on) {
    bgArtKey = '';
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

var LXBOX_RELEASE_URL = 'https://github.com/zjpm-commits/foobar-Lxbox-for-jsplitter';

function openReleasePage() {
  var ok = openUrlWithShell(LXBOX_RELEASE_URL);
  setStatus(ok ? '已打开发布页：' + LXBOX_RELEASE_URL
               : '打不开发布页，地址：' + LXBOX_RELEASE_URL, !ok);
  repaint();
}

// 设置页滑杆：value 取当前值，拖动时写属性再重绘；after 用来替换重绘动作
function setSlider(o) {
  return { kind: 'slider', inline: true, id: o.id, label: o.label,
           min: o.min === undefined ? 0 : o.min,
           max: o.max === undefined ? 100 : o.max,
           value: o.value(),
           fmt: o.fmt || function (v) { return v + '%'; },
           onSet: function (v) { setProp(o.key, v); if (o.after) o.after(); else repaint(); } };
}

// 设置页按分类拆开写，settingsSections() 只负责按顺序拼起来（同一分类可以有多段）
function settingsSections() {
  return [].concat(
    lookSections(),
    bgSections(),
    srcSections(),
    tagSections(),
    [{ cat: 'probe', title: '检测', rows: [] }],
    maintSections()
  );
}

// 外观：缩放、字号、配色、行数、第二排平台
function lookSections() {
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
          if (String(rowLines()) !== String(v)) toggleRowLines();
          repaint();
        } },
      { kind: 'seg', id: 'hideplat', label: '第二排音源平台',
        value: hidePlatformRow ? '1' : '0',
        options: [['0', '显示'], ['1', '隐藏']],
        onPick: function (v) {
          setProp('lx.hidePlatformRow', v === '1' ? 1 : 0);
          hidePlatformRow = (v === '1');
          syncQuality();
          applyPlatformMode();
          setStatus(hidePlatformRow
            ? '已隐藏第二排平台按钮，各页数据固定来自 ' + platformName(fixedPlatform) +
              '，音质 ' + qualityName(quality)
            : '已显示第二排平台按钮，音质 ' + qualityName(quality));
        } },
      { kind: 'note', text: function () {
          return hidePlatformRow
            ? '顶栏已收成一行，数据来自 ' + platformName(fixedPlatform) + '；想换一家点上面的「数据来自」。'
            : '隐藏后顶栏只剩一行（版本号 / 音源 / 音质一起收起），数据固定来自所选平台。';
        } },
      { kind: 'pick', id: 'qualityHidden', label: '隐藏时音质',
        disp: function () {
          if (!qualityHidden) return '跟随全局（' + qualityName(qualityAll) + '）';
          return qualityPickText(qualityHidden);
        },
        short: function () {
          return qualityHidden ? qualityName(qualityHidden)
                               : '跟随全局（' + qualityName(qualityAll) + '）';
        } },
      { kind: 'note', text: function () {
          return '只管「隐藏第二排平台」之后的播放：那时顶栏只剩一行、音质条收起，就按这里走，' +
                 '现在生效 ' + qualityName(quality) +
                 (qualityHidden ? '（单独设的）' : '（跟全局一致）') +
                 '。全局音质在「音源」页。';
        } },
      { kind: 'note', text: function () {
          var d = fbDlgFont();
          return '字号 ' + FONT_BASE + 'px' +
                 (fontSizeFollow() ? '（跟随 foobar2000 字体 ' + (d.size || '?') + 'px）' : '（手动）') +
                 ' · 缩放 ' + Math.round(UI_S * 100) + '%（探测 ' + Math.round(UI_AUTO * 100) + '%）';
        } },
      { kind: 'note', text: '字号只动字；整体放大调「界面缩放」。文字色跟 foobar2000 走。' }
    ] }
  ];

  // 隐藏第二排时，补一行「数据来自」放在那组开关后面
  if (hidePlatformRow) {
    var rows = secs[0].rows;
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
    for (var i = 0; i < rows.length; i++) if (rows[i].id === 'hideplat') { at = i + 1; break; }
    rows.splice(at, 0, platRow);
  }
  return secs;
}

// 背景三段：背景效果（底图）→ 四个区块（各自蒙版）→ 浮层（设置 / 简介 / 评论）
function bgSections() {
  var hue = bgHue();
  return [
    { cat: 'bg', title: '背景效果', rows: [
      { kind: 'seg', id: 'fwall', label: '全屏透明', value: lxFwOn() ? '1' : '0',
        options: [['1', '开'], ['0', '关']],
        onPick: function (v) {
          lxSetFwOn(v === '1');
          setStatus(v === '1' ? '已开启全屏透明（需 Eole主题 的[显示·全屏壁纸]同时打开）'
                              : '已关闭全屏透明');
        } },
      { kind: 'note', text: '[全屏透明即伪透明] 打开后与其他伪透明的主题界面搭配使用效果协调。' },
      { kind: 'seg', id: 'bgart', label: '封面背景', value: bgArtEnabled() ? '1' : '0',
        options: [['1', '开'], ['0', '关']],
        onPick: function (v) { setBgArt(v === '1'); } },
      { kind: 'note', text: '上面两项是总闸。下面六项调的是铺在整块面板底下的那张封面图——' +
                            '四个区块和浮层都盖在它上面，所以图一变，全局都跟着变。' },
      { kind: 'swatch', id: 'hue', label: '背景调色', value: hue,
        options: HUE_PRESETS,
        onPick: function (v) {
          setProp('lx.bgHue', v);
          refreshBgFx(true);
          setStatus('背景调色：' + hueName(v));
        } },
      setSlider({ id: 'veil', label: '背景遮罩', key: 'lx.bgVeil', value: bgVeil,
                  after: function () { queueBackdrop(90); } }),
      setSlider({ id: 'blur', label: '背景模糊', key: 'lx.bgBlur', value: bgBlur, max: 40,
                  fmt: function (v) { return v === 0 ? '不模糊' : v + ' px'; },
                  after: function () { queueBackdrop(90); } }),
      setSlider({ id: 'lum', label: '背景亮度', key: 'lx.bgLum', value: bgLum, min: 40, max: 160,
                  after: function () { queueBackdrop(90); } }),
      setSlider({ id: 'sat', label: '背景饱和度', key: 'lx.bgSat', value: bgSat,
                  after: function () { queueBackdrop(90); } })
    ] },

    { cat: 'bg', title: '四个区块（标题栏 / 搜索栏 / 左侧栏 / 内容区）', rows: [
      { kind: 'note', text: '对应主界面的四块：最上面一条是标题栏，标题栏下面一条是搜索栏，' +
                            '左下那一列是左侧栏，左侧栏右边那整片是内容区。四条各管自己那层蒙版，互不影响；' +
                            '最底下的状态栏（点一下看诊断日志那行）没有单独的滑杆，它和标题栏同色，' +
                            '跟着「标题栏透明度」一起变。' },
      setSlider({ id: 'clearhead', label: '标题栏透明度', key: 'lx.clearHead',
                  value: function () { return surfClear('head'); } }),
      setSlider({ id: 'clearsearch', label: '搜索栏透明度', key: 'lx.clearSearch',
                  value: function () { return surfClear('search'); } }),
      setSlider({ id: 'clearside', label: '左侧栏透明度', key: 'lx.clearSide',
                  value: function () { return surfClear('side'); } }),
      setSlider({ id: 'clear', label: '内容区透明度', key: 'lx.bgClear', value: bgClear }),
      setSlider({ id: 'tint', label: '内容区染色', key: 'lx.bgTint', value: bgTint, max: 30,
                  fmt: function (v) { return v === 0 ? '不染色' : v + '%'; } }),
      { kind: 'note', text: function () {
          return '四条同一套算法：0% = 原样，越大越透，100% = 这一层完全不盖（字、按钮、列表照旧，只没了底）。' +
                 '内容区只盖左侧栏右边那一块，和状态栏、前面三块都互不影响；染色也只掺内容区这一层。' +
                 (bgArtEnabled() ? '' : '（封面背景关着，四条和染色都看不出效果）');
        } }
    ] },

    { cat: 'bg', title: '浮层（设置界面 / 简介界面 / 评论界面）', rows: [
      { kind: 'note', text: '浮层指的是整块盖住面板的三个界面：面板设置、歌曲简介（F4）、歌曲评论（F3）。' +
                            '它们共用下面两项，和四个区块的位置、透明度都无关。' },
      setSlider({ id: 'ovscrim', label: '浮层遮罩', key: 'lx.bgOverlayScrim', value: bgOverlayScrimPct,
                  fmt: function (v) { return v === 0 ? '透出底图' : v + '%'; } }),
      { kind: 'note', text: '浮层遮罩：浮层底下垫一张重度虚化的封面（壁纸，没有就拿封面），' +
                            '这一项调上面盖多厚。越小越透出那张虚化图，0% 就只剩字浮在图上。' },
      setSlider({ id: 'overlay', label: '浮层不透明度', key: 'lx.bgOverlay', value: bgOverlayPct }),
      { kind: 'note', text: '浮层不透明度：手上没有封面图时，浮层底的实色浓度。' +
                            '0% 完全透明、100% 和面板外同色；有虚化底图时这一项不参与。' }
    ] }
  ];
}

// 标签：封面嵌入音频 / 写同名 jpg，苹果标签源单独一组
function tagSections() {
  return [
    { cat: 'tag', title: '标签', rows: [
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
          PUSH_COVER = pushCoverEnabled();
          setStatus(v === '1' ? '缓存目录里额外放一份同名 jpg' : '不再写同名 jpg');
          repaint();
        } },
      { kind: 'note', text: '嵌入 / 写 jpg 都改缓存目录里的文件；同名同扩展名的音频已在缓存里时直接播，不再下载。' }
    ].concat(tagSourceRows()) }
  ];
}

// 维护：一排排按钮 + 说明
function maintSections() {
  return [
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
      { kind: 'note', text: '清空缓存只删音频与 index.json（mp3 / flac 两个目录一起清），评论 / 艺人资料保留。' },
      { kind: 'link', id: 'releasePage', label: 'Lxbox 界面发布页：', url: LXBOX_RELEASE_URL }
    ] }
  ];
}

// 音源：目录在前，播放音源 / 全局音质 / 在线网址挂在音源目录后面
function srcSections() {
  var secs = [
    { cat: 'src', title: '音源', rows: [
      { kind: 'text', id: 'cacheDir', label: '缓存目录',
        value: propStr('lx.cacheDir', ''),
        disp: function () { return cacheDir() || '（未确定）'; },
        onCommit: function (t) {
          setProp('lx.cacheDir', t);
          resetCachePaths();
          setStatus(t ? '缓存目录：' + t : '缓存目录已恢复默认');
          repaint();
        },
        resetId: 'defCacheDir' },
      { kind: 'text', id: 'cacheDirMp3', label: 'MP3 缓存目录',
        value: propStr('lx.cacheDirMp3', ''),
        disp: function () { return audioDir('mp3') || '（未确定）'; },
        onCommit: function (t) {
          setProp('lx.cacheDirMp3', t);
          resetCachePaths();
          setStatus(t ? 'MP3 缓存目录：' + t : 'MP3 缓存目录已恢复默认（' + (audioDir('mp3') || 'Lxbox\\mp3') + '）');
          repaint();
        },
        resetId: 'defCacheDirMp3' },
      { kind: 'text', id: 'cacheDirFlac', label: 'FLAC 缓存目录',
        value: propStr('lx.cacheDirFlac', ''),
        disp: function () { return audioDir('flac') || '（未确定）'; },
        onCommit: function (t) {
          setProp('lx.cacheDirFlac', t);
          resetCachePaths();
          setStatus(t ? 'FLAC 缓存目录：' + t : 'FLAC 缓存目录已恢复默认（' + (audioDir('flac') || 'Lxbox\\flac') + '）');
          repaint();
        },
        resetId: 'defCacheDirFlac' },
      { kind: 'seg', id: 'checkExt', label: '检测扩展名', value: checkExtOn() ? '1' : '0',
        options: [['1', '检测'], ['0', '不检测']],
        onPick: function (v) {
          setProp('lx.checkExt', v);
          setStatus(v === '1'
            ? '本地已有检测恢复：扩展名不同就算另一首，会重新取链缓存'
            : '不再检测扩展名：同名文件不管 .mp3 / .flac / .m4a，找到就直接播');
          repaint();
        } },
      { kind: 'note', text: function () {
          return checkExtOn()
            ? '本地已有检测：要「艺人 - 曲名」和扩展名都对上才算命中，扩展名不同会当成新歌重新下载。'
            : '不检测扩展名：缓存里只要有「艺人 - 曲名」这个文件名（.mp3 / .flac / .m4a… 都算），直接播它，不再取链下载。';
        } },
      { kind: 'seg', id: 'playmode', label: '播放方式', value: playMode(),
        options: [['stream', '在线流播'], ['hybrid', '边下边播'], ['cache', '下完再播']],
        onPick: function (v) {
          setProp('lx.playMode', v);
          setProp('lx.download', v === 'stream' ? 0 : 1);   // 旧属性跟着走，别处还在读
          setStatus('播放方式：' + playModeName(v) + '（' +
                    (v === 'stream' ? '不落盘、不写标签'
                     : (v === 'hybrid' ? '先响，后台攒缓存，下次播本地'
                                       : '缓存并写完标签再播')) + '）');
          repaint();
        } },
      { kind: 'note', text: function () {
          var m = playMode();
          if (m === 'stream') {
            return '在线流播：只播直链，不落盘，也就没有标签 / 封面（面板自己的封面照常显示）；' +
                   '音源直链过期或断网就播不了，Lxbox将 http 直链交给foobar自己播放，没有本地缓存。';
          }
          if (m === 'hybrid') {
            return '边下边播：点下去立刻响，同时后台落一份缓存并补标签，下次播这首直接走本地文件；' +
                   '后台那条下载是另开的连接，会多花一份流量，网络差时也不影响本次播放。';
          }
          return '下完再播：先把整首缓存到本地、写完标签和封面再播，起播慢几秒，' +
                 '换来断网能重播、播放列表里看到的就是整理好的曲目信息。';
        } },
      { kind: 'seg', id: 'streamattach', label: '流播封面自动挂载', value: attachOn() ? '1' : '0',
        options: [['1', '开'], ['0', '关']],
        onPick: function (v) {
          setProp('lx.streamAttach', v);
          ATTACH_KEY = '';
          if (v === '1') {
            setStatus('已开启：封面会挂到当前播放项，所有面板自动读到，不用再填 fb2k 路径');
            attachLastTrack('手动');
          } else {
            setStatus('已关闭流播封面自动挂载');
          }
          repaint();
        } },
      { kind: 'seg', id: 'streamcover', label: '同时写固定 cover.jpg（备用）', value: streamCoverOn() ? '1' : '0',
        options: [['1', '开'], ['0', '关']],
        onPick: function (v) {
          setProp('lx.streamCover', v);
          NOWPLAY_KEY = '';
          if (v === '1') {
            NM.lx.pushLog('info', '流播封面另存到：' + nowPlayCoverFile());
            setStatus('已开启：额外留一份 cover.jpg（自动挂载失灵时排查用）');
            pushStreamCover(lastTrack);
          } else {
            try { utils.RemovePath(nowPlayCoverFile()); } catch (e) {}
            setStatus('已关闭固定 cover.jpg');
          }
          repaint();
        } },
      { kind: 'note', text: function () {
          if (!attachOn()) {
            return '在线流播播的是直链，fb2k 手上没有文件，自带封面读取是空的。' +
                   '开启自动挂载后，面板把封面挂到这条播放项上，所有面板按 album art 读就能拿到。';
          }
          return '自动挂载：每次播流把封面挂到播放项的 metadb handle 上（attached image，' +
                 'album art 优先级最高），Eole、播放列表缩略图、系统媒体控制都能读到，' +
                 '不需要在 fb2k 里填任何路径，也不会影响本地曲目。' +
                 '下面那个 cover.jpg 只是备用留档，不开也不影响显示。';
        } },
      { kind: 'btn', id: 'openNowPlay', label: '打开流播封面文件夹（排查用）…', close: true, ctl: true },
      { kind: 'seg', id: 'lxcast', label: '把曲目信息广播给皮肤面板', value: broadcastOn() ? '1' : '0',
        options: [['1', '开'], ['0', '关']],
        onPick: function (v) {
          setProp('lx.broadcast', v);
          NOW_INFO_KEY = '';
          if (v === '1') {
            lxPublishNow(0);
            setStatus('已开启：流播时把歌手 / 歌名广播给其他面板（lx_now_info / lx_now_json / lx_now_text）');
          } else {
            lxClearNow();
            setStatus('已关闭：皮肤只能从 metadb 取，流播时会显示 URL 末段');
          }
          repaint();
        } },
      { kind: 'note', text: function () {
          if (!broadcastOn()) {
            return '关掉后皮肤面板拿不到歌手 / 歌名，流播时列表行和标题只能显示 URL 末段（一串 hash）。';
          }
          return '每首流播曲目起播约 0.9 秒广播一次：lx_now_info（对象）、lx_now_json（JSON 串）、' +
                 'lx_now_text（「歌手 - 歌名」）；切到本地文件时发 lx_now_clear。' +
                 '同时写一份 <缓存目录>\\nowplaying\\info.json，里面的 items 按播放项路径索引，' +
                 '列表面板拿 handle.Path 查表就能逐行显示正确名字。' +
                 '面板晚加载可以发 lx_now_request 要一次。';
        } },
      { kind: 'btn', id: 'lxcastNow', label: '立即广播一次…', close: true, ctl: true },
      { kind: 'seg', id: 'eslreq', label: '流播时让 ESLyric 按面板信息搜词', value: eslRequestOn() ? '1' : '0',
        options: [['1', '开'], ['0', '关']],
        onPick: function (v) {
          setProp('lx.eslRequest', v);
          if (v === '1') {
            var ctl = eslControl();
            setStatus(ctl ? '已开启：流播换歌后会把歌手 / 歌名直接交给 ESLyric 搜词'
                          : '已开启，但连不上 ESLyric 控制接口（看诊断日志）', !ctl);
          } else {
            setStatus('已关闭：ESLyric 只能拿到 %artist%（流播时为空）');
          }
          repaint();
        } },
      { kind: 'note', text: function () {
          if (!eslRequestOn()) {
            return 'ESLyric 的搜索框分开取 %title% 和 %artist%，而流播项的 %artist% 永远是空的' +
                   '（fb2k 没有给流式项目写文本标签的接口）。关掉这个开关，自动搜词就只能靠 title。';
          }
          return '开启后，流播换歌时面板直接调用 ESLyric 的 RequestLyric(歌名, 歌手)，' +
                 '用的是 Lxbox 自己的曲目信息，不经过 fb2k 的 %artist% —— 所以搜索框里' +
                 '「标题」「艺术家」两栏都会有值。默认对每一首流播曲目只发一次，' +
                 '本地文件不插手（它们有真标签）。';
        } },
      { kind: 'btn', id: 'eslreqNow', label: '立即让 ESLyric 搜一次…', close: true, ctl: true },
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
      { kind: 'btn', id: 'openScriptDir', label: '打开音源目录（资源管理器）…', close: true, ctl: true }
    ] }
  ];

  var playRow = {
    kind: 'pick', id: 'playScript', label: '播放音源',
    disp: function () {
      return scriptPrefId(platform) ? scriptShort(platform) : '自动（按加载顺序）';
    }
  };
  var onlineRow = {
    kind: 'text', id: 'onlineScriptUrl', label: '在线音源网址',
    value: propStr('lx.onlineScriptUrl', ''),
    disp: function () { return '（.js 直链）'; },
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
  var dirNote = {
    kind: 'note',
    text: '目录留空 = 用默认：mp3 → <profile>\\Lxbox\\mp3，flac → <profile>\\Lxbox\\flac，' +
          '缓存 / 索引 / 封面 → <profile>\\Lxbox\\cache；音源目录自动探测。'
  };

  // 全局音质：所有播放默认按它走，顶栏音质条改的也是它
  // 九档没法一排铺开（控件区最宽 360，窄面板只有 60），所以用下拉，名字 + 说明都放得下
  var qualityRow = {
    kind: 'pick', id: 'quality', label: '全局音质',
    disp: function () { return qualityPickText(qualityAll); },
    short: function () { return qualityName(qualityAll); }
  };
  var qualityNote = {
    kind: 'note',
    text: function () {
      return '顶栏「音质」按钮改的就是这一档。' +
             (qualityHidden
               ? '隐藏第二排平台时会换成「外观」页里单独设的 ' + qualityName(qualityHidden) + '。'
               : '隐藏第二排平台时也用它（想单独设去「外观」页）。');
    }
  };

  // 播放音源 / 全局音质 / 在线音源网址属于「音源」页，挂在音源目录后面
  var srcRows = secs[0].rows;
  if (srcRows) {
    var atSrc = srcRows.length;
    for (var rj = 0; rj < srcRows.length; rj++) {
      if (srcRows[rj].id === 'scriptDir') { atSrc = rj + 1; break; }
    }
    srcRows.splice(atSrc, 0, playRow, qualityRow, qualityNote, onlineRow, onlineNote);
    srcRows.push(dirNote);
  }

  return secs;
}

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

function noteLineH() {
  return Math.max(15, Math.round(FONT_BASE) + 4);
}

// 说明文字按可用宽度折行，行数决定这一行的高度
function noteLinesOf(row, w) {
  var t = (typeof row.text === 'function') ? row.text() : row.text;
  var raw = wrapNoteText(String(t == null ? '' : t), Math.max(60, (w || 320) - 6));
  var out = [];
  for (var i = 0; i < raw.length; i++) out.push({ t: raw[i], c: 'dim' });
  return out;
}

function rowHeightOf(row, w) {
  if (row.kind === 'slider') return row.inline ? SET_ROW_SLIDER_IN : SET_ROW_SLIDER;
  if (row.kind === 'swatch') return SET_ROW_SWATCH;
  if (row.kind === 'btn' || row.kind === 'btns') return SET_ROW_BTN;
  if (row.kind === 'text' || row.kind === 'pick') return SET_ROW_TEXT;
  if (row.kind === 'link') return SET_ROW_NOTE;
  if (row.kind === 'note') {
    return Math.max(SET_ROW_NOTE, noteLinesOf(row, w).length * noteLineH() + 2);
  }
  return SET_ROW_SEG;
}

function linkRowGeom(x, w, y, h) {
  return { x: x, y: y, w: Math.max(40, w - 4), h: h };
}

// 按钮文字大约要多宽（中文按一个字宽算，西文按 0.55）
function btnTextNeed(s) {
  var t = String(s == null ? '' : s);
  var em = FONT_BASE || 12;
  var w = 0;
  for (var i = 0; i < t.length; i++) {
    w += (t.charCodeAt(i) > 0x2E80) ? em : em * 0.55;
  }
  return w;
}

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
  } else if (row.kind === 'link') {
    out.push({ k: 'link', id: row.id, url: row.url, rect: linkRowGeom(x, w, y, h) });
  } else if (row.kind === 'btn' || row.kind === 'btns') {
    // 按钮框跟上面的控件区对齐（同样的 cx / cw）；实在放不下才铺整行，免得好几个字被切掉
    var rowBtns = (row.kind === 'btns') ? row.items : [row];
    var bgap = 8;
    var bn = rowBtns.length || 1;
    var need = 0;
    for (i = 0; i < bn; i++) {
      var nw = btnTextNeed(rowBtns[i].label) + 18;
      if (nw > need) need = nw;
    }
    var fitCtl = cw >= bn * need + bgap * (bn - 1);
    var bx0 = fitCtl ? cx : x;
    var bwid = Math.floor(((fitCtl ? cw : w) - bgap * (bn - 1)) / bn);
    for (i = 0; i < bn; i++) {
      out.push({ k: 'btn', id: rowBtns[i].id, close: rowBtns[i].close,
                 label: rowBtns[i].label,
                 rect: { x: bx0 + i * (bwid + bgap), y: y + 2, w: bwid, h: h - 4 } });
    }
  }
  return out;
}

function settingsCloseW() {
  var k = clamp((FONT_BASE || 12) / 12, 1, 1.4);
  return Math.round(76 * k);
}

function settingsResetRect() {
  if (!setOpen) return null;
  return { x: Math.max(60, W - 8 - settingsCloseW() - 10 - 96), y: 10, w: 96, h: 26 };
}

function settingsCloseRect() {
  if (!setOpen) return null;
  var w = settingsCloseW();
  return { x: W - 8 - w, y: 10, w: w, h: 26 };
}

function settingsSig() {
  return W + 'x' + H + '|' + setCat + '|' + setScroll + '|' + setVer +
         '|q' + quality + '|r' + rowLines() +
         '|e' + (EMBED_COVER ? 1 : 0) + '|p' + (PUSH_COVER ? 1 : 0) +
         '|cx' + (checkExtOn() ? 1 : 0) +
         '|pb' + (probeBusy ? 'b' : '') + (probeAt || 0) +
         '|ps' + probeQTiers().join('.') + probePSrcs().join('.') +
         '|ap' + (appleOn() ? 1 : 0) + (appleAuto() ? 1 : 0) + (appleCoverOn() ? 1 : 0) +
         appleFields().join('.') +
         (appleJob ? ('j' + appleJob.done + '/' + appleJob.total + (appleJob.on ? 'r' : '')) : '');
}

function settingsLayout() {
  var key0 = settingsSig();
  if (setLayoutCache && setLayoutKey === key0) return setLayoutCache;

  var wide = W >= 430;
  var padX = 16;
  var navW = wide ? Math.min(SET_NAV_W, Math.max(96, Math.round(W * 0.2))) : 0;
  var catBarH = wide ? 0 : 32;

  var secs = settingsSections();
  var cur = [], i;
  for (i = 0; i < secs.length; i++) if (secs[i].cat === setCat) cur.push(secs[i]);
  if (!cur.length) { setCat = secs[0].cat; cur = [secs[0]]; }

  var availW = W - (padX + navW) - padX;
  var wantW = Math.min(900, Math.max(700, Math.round(availW * 0.66)));
  var contentW = Math.max(150, Math.min(wantW, availW - 12));
  var contentX = padX + navW + Math.max(0, Math.round((availW - contentW) / 2));
  var top = SET_HEAD_H + catBarH + 8;
  var bottom = Math.max(top + 20, H - SET_FOOT_H);

  var items = [], y = 0, k, sec, row, rh;
  for (k = 0; k < cur.length; k++) {
    sec = cur[k];
    if (sec.title) {
      items.push({ kind: 'title', text: sec.title, h: SET_SEC_H, rel: y });
      y += SET_SEC_H;
    }
    if (sec.cat === 'probe') {
      // 检测页不再弹浮层：直接在右栏里排开检测界面
      var ph = probeBlocks(contentX, contentW, 0, true).h;
      items.push({ kind: 'probe', h: ph, rel: y });
      y += ph + 4;
      continue;
    }
    for (i = 0; i < sec.rows.length; i++) {
      row = sec.rows[i];
      rh = rowHeightOf(row, contentW);
      items.push({ kind: 'row', row: row, h: rh, rel: y });
      y += rh + 4;
    }
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

  setLayoutCache = out;
  setLayoutKey = settingsSig();
  return out;
}

function drawSettings(gr) {
  if (!setOpen) return;
  var P = settingsLayout();
  var i;

  paintOverlayBg(gr, { x: 0, y: 0, w: W, h: H });      // 和简介 / 评论浮层同一套底

  gr.FillSolidRect(0, 0, W, SET_HEAD_H, overlayFill(C.panel, 244));
  gr.DrawLine(0, SET_HEAD_H, W, SET_HEAD_H, 1, A(C.line, 220));
  gr.GdiDrawText('面板设置', F.head, C.accent, 16, 1, Math.max(60, W - 200), 24, FLAG_LEFT);
  gr.GdiDrawText('改动即时生效，并写进面板属性', F.tiny, C.dim, 17, 21, Math.max(60, W - 210), 24, FLAG_LEFT);

  var rb = settingsResetRect();
  var rhot = hoverOn(rb);
  gr.FillSolidRect(rb.x, rb.y, rb.w, rb.h, rhot ? tint(C.btnHot, 220) : tint(C.btn, 170));
  gr.DrawRect(rb.x + 0.5, rb.y + 0.5, rb.w - 1, rb.h - 1, 1, A(C.line, rhot ? 235 : 180));
  gr.GdiDrawText('恢复默认', F.small, rhot ? C.accent : C.dim, rb.x, rb.y, rb.w, rb.h, FLAG_CENTER);

  var cb = settingsCloseRect();
  var chot = hoverOn(cb);
  gr.FillSolidRect(cb.x, cb.y, cb.w, cb.h, chot ? A(C.err, 60) : tint(C.btn, 150));
  gr.DrawRect(cb.x + 0.5, cb.y + 0.5, cb.w - 1, cb.h - 1, 1, A(C.line, 190));
  gr.GdiDrawText('退出设置', F.small, chot ? C.err : C.dim, cb.x, cb.y, cb.w, cb.h, FLAG_CENTER);

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

  for (i = 0; i < P.items.length; i++) {
    var it = P.items[i];
    if (it.kind === 'probe') {
      drawProbePanel(gr, it, P);
      continue;
    }
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

  var fy = H - SET_FOOT_H;
  gr.FillSolidRect(0, fy, W, SET_FOOT_H, tint(C.panel, 230));
  var hint = SET_CATS[catIndexOf(setCat)].hint;
  gr.GdiDrawText(hint, F.tiny, A(C.dim, 235), 16, fy, Math.max(40, W - 32), SET_FOOT_H, FLAG_LEFT);
}

function drawProbePanel(gr, it, P) {
  var g = probeBlocks(it.x, it.w, it.ay, true);
  drawProbeBody(gr, g, { clipTop: P.top, clipBot: P.bottom });
}

function drawSettingRow(gr, it) {
  var row = it.row, x = it.x, w = it.w, y = it.ay, h = it.h;
  var i;

  if (row.kind === 'note') {
    var nl = noteLinesOf(row, w);
    var nlh = noteLineH();
    for (i = 0; i < nl.length; i++) {
      gr.GdiDrawText(nl[i].t, F.tiny, A(C.dim, 225),
                     x + 1, y + i * nlh, w - 2, nlh, FLAG_LEFT);
    }
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

  if (row.kind === 'link') {
    var lgr = linkRowGeom(x, w, y, h);
    var lkhot = hoverOn(lgr);
    var pre = String(row.label || '');
    var url = String(row.url || '');
    var preW = pre ? textWidthOf(gr, pre, F.small) : 0;
    var urlW = Math.min(textWidthOf(gr, url, F.small), Math.max(10, lgr.w - preW));

    if (pre) {
      gr.GdiDrawText(pre, F.small, lkhot ? C.text : C.dim,
                     lgr.x, lgr.y, lgr.w, lgr.h, FLAG_LEFT);
    }
    gr.GdiDrawText(url, F.small, C.accent,
                   lgr.x + preW, lgr.y, Math.max(10, lgr.w - preW), lgr.h, FLAG_LEFT);

    var uy = lgr.y + Math.round(lgr.h / 2) + Math.round(FONT_BASE * 0.45);
    gr.DrawLine(lgr.x + preW, uy, lgr.x + preW + urlW, uy, 1, A(C.accent, lkhot ? 255 : 175));
    return;
  }

  var swLh = Math.max(18, FONT_BASE + 6);
  var lh = row.kind === 'swatch' ? swLh : h;
  var ly = row.kind === 'swatch' ? (y + Math.round((h - swLh) / 2)) : y;
  gr.GdiDrawText(row.label, F.small, C.dim, x + 1, ly, SET_CTL_X - 12, lh, FLAG_LEFT);

  if (row.kind === 'pick') {
    var pb = ctlBox(x, w);
    var ph = Math.max(20, h - 12), py = y + 6;
    var pr = { x: pb[0], y: py, w: pb[1], h: ph };
    var phot = hoverOn(pr);
    gr.FillSolidRect(pr.x, pr.y, pr.w, pr.h, phot ? tint(C.btnHot, 220) : tint(C.panel2, 215));
    gr.DrawRect(pr.x + 0.5, pr.y + 0.5, pr.w - 1, pr.h - 1, 1,
                phot ? C.accent : A(C.line, 185));
    var pv = row.disp ? row.disp() : String(row.value || '');
    /* 窄面板放不下「名字 · 说明」时退回只显示名字（GDI 会直接省略号，很难看） */
    if (row.short && textWidthOf(gr, pv, F.small) > Math.max(20, pr.w - 30)) {
      pv = row.short();
    }
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
    if (it.kind === 'probe') {
      if (y < P.top - 2 || y > P.bottom + 2) break;
      var pg = probeBlocks(it.x, it.w, it.ay, true);
      var prr = probePickRectOf(pg);
      if (prr && inRect(prr, x, y)) return { k: 'probePick' };
      var srr = probeStopRectOf(pg);
      if (srr && probeBusy && inRect(srr, x, y)) return { k: 'probeStop' };
      var rrr = probeRunRectOf(pg);
      if (rrr && inRect(rrr, x, y)) return { k: 'probeRun' };
      for (var qk = 0; qk < PROBE_Q.length; qk++) {
        var qr = probeQHeadRect(pg, qk);
        if (inRect(qr.hit, x, y)) return { k: 'probeQT', v: PROBE_Q[qk] };
      }
      for (var pk = 0; pk < PROBE_SRC.length; pk++) {
        var pk2 = probePNameRect(pg, pk);
        if (inRect(pk2.hit, x, y)) return { k: 'probePT', v: PROBE_SRC[pk] };
      }
      break;
    }
    if (it.kind !== 'row' || !it.hits) continue;
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

/* 设置页右侧那条滚动条：total > visible 时才可拖，判定区左右各放宽 8px */
function setScrollbarRect() {
  var g = sbGeom['set'];
  if (!g || g.total <= g.visible || g.h <= 0) return null;
  return { x: g.x - 8, y: g.y, w: 16, h: g.h };
}

function settingsMouseDown(x, y) {
  var sb = setScrollbarRect();
  if (sb && inRect(sb, x, y)) {
    var g = sbGeom['set'];
    var p = scrollbarParts(g);
    var onThumb = (y >= p.thumbY && y <= p.thumbY + p.thumbH);
    sbDrag = { id: 'set', grab: onThumb ? (y - p.thumbY) : Math.round(p.thumbH / 2) };
    scrollDragTo(y);
    repaint();
    return true;
  }

  var hit = settingsHit(x, y);
  if (hit.k === 'slider') {
    setDrag = hit.row.id;
    applySliderDrag(x);
    return true;
  }
  return true;
}

var BG_FX_SLIDERS = { veil: 1, blur: 1, lum: 1, sat: 1 };

function settingsMouseUp(x, y) {
  var dragged = setDrag;
  setDrag = '';
  sbDrag = null;
  if (dragged && BG_FX_SLIDERS[dragged]) flushBackdrop();

  var hit = settingsHit(x, y);
  if (hit.k === 'close') { closeSettings(); return; }
  if (hit.k === 'reset') { resetSettingCat(); return; }
  if (hit.k === 'cat') {
    if (hit.v !== setCat) { setCat = hit.v; setScroll = 0; }
    repaint();
    return;
  }
  if (hit.k === 'probePick') {
    openProbeScriptMenu(x, y);
    return;
  }
  if (hit.k === 'probeRun') {
    if (!probeBusy) probeStart();
    return;
  }
  if (hit.k === 'probeStop') {
    if (probeBusy) probeCancel();
    return;
  }
  if (hit.k === 'probeQT') { probeToggleQ(hit.v); return; }
  if (hit.k === 'probePT') { probeToggleP(hit.v); return; }
  if (hit.k === 'pick') {
    if (hit.id === 'playScript') openScriptMenu(x, y);
    else if (hit.id === 'appleFields') openAppleFieldMenu(x, y);
    else if (hit.id === 'quality') openQualityMenu(x, y, false);
    else if (hit.id === 'qualityHidden') openQualityMenu(x, y, true);
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
  if (hit.k === 'link') {
    closeSettings();
    openReleasePage();
    return;
  }
  if (hit.k === 'btn') {
    runSettingsButton(hit.id, hit.close);
    return;
  }
  if (hit.k === 'panel') {
    if (editKind === 'setting') commitEdit();
    return;
  }
}

function resetSettingCat() {
  var bg = false, ui = false;
  if (setCat === 'look') {
    setProp('lx.uiScale', 'auto');
    setProp('lx.fontSize', '');
    setProp('lx.fontScale', '');
    setProp('lx.fontColor', '');
    setProp('lx.theme', 'auto');
    setProp('lx.rowLines', '2');
    setProp('lx.rowGap', 0);
    setQualityHidden('');            // 隐藏第二排时的音质回到「跟随全局」
    if (NM.lx && typeof NM.lx.clearResolveCache === 'function') NM.lx.clearResolveCache();
    ui = true;
  } else if (setCat === 'bg') {
    setProp('lx.bgArt', '1');
    setProp('lx.bgHue', -1);
    setProp('lx.bgVeil', 50);
    setProp('lx.bgBlur', 20);
    setProp('lx.bgLum', 100);
    setProp('lx.bgSat', 50);
    setProp('lx.bgClear', 0);
    setProp('lx.bgGlass', '');
    setProp('lx.bgTint', 0);
    setProp('lx.clearHead', 50);
    setProp('lx.clearSearch', 50);
    setProp('lx.clearSide', 50);
    setProp('lx.bgOverlay', 90);
    setProp('lx.bgOverlayScrim', 80);
    setProp('lx.bgArtAlpha', '');
    bg = true;
  } else if (setCat === 'src') {
    setProp('lx.cacheDir', '');
    setProp('lx.cacheDirMp3', '');
    setProp('lx.cacheDirFlac', '');
    setProp('lx.checkExt', 1);
    resetCachePaths();
    setProp('lx.scriptDir', '');
    setProp('lx.script.' + platform, '');
    setProp('lx.onlineScriptUrl', '');
    setProp('lx.playMode', 'stream');
    setProp('lx.download', 0);
    setQuality('320k');              // 全局音质
    if (NM.lx && typeof NM.lx.clearResolveCache === 'function') NM.lx.clearResolveCache();
  } else if (setCat === 'tag') {
    setProp('lx.embedCover', 1);
    setProp('lx.pushCover', 0);
    setProp('lx.streamAttach', 1);
    setProp('lx.streamCover', 1);
    setProp('lx.streamWake', 0);
    setProp('lx.appleTags', 0);
    setProp('lx.appleAuto', 0);
    setProp('lx.appleCover', 0);
    setProp('lx.appleFields', '');
    ATTACH_KEY = '';
    NOWPLAY_KEY = '';
    EMBED_COVER = embedCoverEnabled();
    PUSH_COVER = pushCoverEnabled();
  } else if (setCat === 'probe') {
    setProp('lx.probeQ', '');
    setProp('lx.probeSrc', '');
    setProbeScript('');
  }
  setStatus('已恢复「' + SET_CATS[catIndexOf(setCat)].name + '」的默认值');
  applyTheme(true);
  if (bg) { bgArtKey = ''; refreshBackground(true); }
  if (ui) { applyUiScale(); return; }
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
  else if (id === 'openNowPlay') openNowPlayDir();
  else if (id === 'eslreqNow') eslRequestNow();
  else if (id === 'lxcastNow') lxBroadcastNow();
  else if (id === 'appleNow') { appleTagCurrent(); }
  else if (id === 'appleSel') { appleTagBatch(true); }
  else if (id === 'appleBatch') { appleTagBatch(false); }
  else if (id === 'appleStop') {
    if (appleJob && appleJob.on) { appleJob.on = false; setStatus('已停止补标签'); }
    else setStatus('现在没有在补标签');
  }
  else if (id === 'appleClear') {
    if (APPLE && typeof APPLE.clearCache === 'function') APPLE.clearCache();
    txMetaCache = Object.create(null);
    setStatus('苹果 / 腾讯的匹配缓存已清空');
  }
  else if (id === 'defCacheDir') {
    setProp('lx.cacheDir', '');
    resetCachePaths();
    setStatus('缓存目录已恢复默认');
  }
  else if (id === 'defCacheDirMp3') {
    setProp('lx.cacheDirMp3', '');
    resetCachePaths();
    setStatus('MP3 缓存目录已恢复默认');
  }
  else if (id === 'defCacheDirFlac') {
    setProp('lx.cacheDirFlac', '');
    resetCachePaths();
    setStatus('FLAC 缓存目录已恢复默认');
  }
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
  // 和标题栏同色：同一个表达式，拖动「标题栏透明度」时两处一起变
  gr.FillSolidRect(0, y, W, FOOT_H, tint(C.bg, surfA('head', BG_A.header)));

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
  if (isErr) hint = '点此看原因 ›';
  var hintCol = isErr ? C.err : (mc ? C.accent : C.dim);
  if (footHot && !isErr) hintCol = C.text;
  gr.GdiDrawText(hint, F.small, hintCol, W - 230, y, 220, FOOT_H, FLAG_RIGHT);
}

function on_paint(gr) {
  if (W <= 0 || H <= 0) return;

  gr = scaledGraphics(gr);

  gr.SetTextRenderingHint(5);
  gr.SetSmoothingMode(4);
  drawBackdrop(gr);

  beginFrame();

  if (setOpen) { drawSettings(gr); return; }

  drawHeader(gr);
  paintContentVeil(gr);

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
}
function setCursorHand(on) {
  if (on === cursorHand) return;
  cursorHand = on;
  try { window.SetCursor(on ? 32649 : 32512); } catch (e) {}
}

function syncPanelSize() {
  var pw = Number(window.Width) || 0;
  var ph = Number(window.Height) || 0;
  if (!(pw > 0)) pw = 600;
  if (!(ph > 0)) ph = 400;
  W = Math.max(1, Math.ceil(pw / UI_S));
  H = Math.max(1, Math.ceil(ph / UI_S));
}

function on_size() {
  var changed = refreshUiScale();
  syncPanelSize();
  computeLayout();
  clampScroll();
  if (overlay) rebuildOverlayLines(true);
  buildBackdrop();
  sbGeom = {};
  sbDrag = null;
  if (changed) logUiScale();
  repaint();
}

// 接收 Eole 宿主和其它面板广播的跨面板消息。
// 全屏壁纸相关三条消息都要响应：宿主铺图 / 换图后重绘一次，把新像素透出来。
// 注意 Cfg 那条不能漏 —— TitleBar 点开关时先发 Cfg、宿主随后才发 Repaint，
// 只监听后两者的话，切歌换图那一瞬间本面板会残留上一张壁纸的像素。
function on_notify_data(name, info) {
  /* 别的面板刚加载完，问一句「现在在放什么」——重发一遍就行 */
  if (name === 'lx_now_request') {
    /* 皮肤里有六七个面板都会在启动时问一次，回一次就够 */
    var lxNow = Date.now();
    if (lxNow - LX_REQ_LAST < 2000) return;
    LX_REQ_LAST = lxNow;
    try { NOW_INFO_KEY = ''; lxPublishNow(0); } catch (eRR) {}
    return;
  }
  if (name === 'fw_theme_dark' || name === 'bio_dark_theme') {
    var m = (info === true || Number(info) === 1) ? 'dark' : 'light';
    if (eoleTheme !== m) {
      eoleTheme = m;
      applyTheme(true);
      buildBackdrop();
      repaint();
    }
    return;
  }
  if (name === 'fullscreenWallpaper' ||
      name === 'fullscreenWallpaperCfg' ||
      name === 'fullscreenWallpaperRepaint') {
    setLayoutCache = null;
    repaint();
    return;
  }
}

function logUiScale() {
  try {
    console.log('[LX-UI] 界面缩放 ' + Math.round(UI_S * 100) + '%' +
                '（自动探测 ' + Math.round(UI_AUTO * 100) + '%' +
                '），统一字号 ' + FONT_BASE + 'px' +
                '，面板 ' + W + '×' + H + ' 逻辑像素');
  } catch (e) {}
}

function applyUiScale(opts) {
  opts = opts || {};
  if (!refreshUiScale()) initTheme();
  var w0 = W, h0 = H;
  syncPanelSize();
  computeLayout();
  clampScroll();
  if (overlay) rebuildOverlayLines(true);
  sbGeom = {};
  if (!opts.quiet) logUiScale();
  if (W !== w0 || H !== h0) buildBackdrop();
  repaint();
}

function selectTab(i) {
  i = clampTab(i);
  if (i === tab) return;
  if (editKind) endEdit();
  tab = i;
  try { setP('lx.tab', tab); } catch (e) {}
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
    else loadHot(false);
  } else {
    loadRecommend(false);
  }
  repaint();
}

function toLogical(v) { return (Number(v) || 0) / UI_S; }

function on_mouse_move(x, y, mask) {
  x = toLogical(x);
  y = toLogical(y);
  mouseX = x;
  mouseY = y;

  var drawHover = hoverPaintProp();

  if (setOpen) {
    if (sbDrag) {
      var heldSb = (typeof mask === 'number') ? !!(mask & 1) : true;
      if (!heldSb) sbDrag = null;
      else { scrollDragTo(y); setCursorHand(true); return; }
    }
    if (setDrag) {
      var held2 = (typeof mask === 'number') ? !!(mask & 1) : true;
      if (held2) { applySliderDrag(x); setCursorHand(true); return; }
      setDrag = '';
    }
    var hh0 = settingsHit(x, y);
    var sbR = setScrollbarRect();
    setCursorHand((sbR && inRect(sbR, x, y)) || hh0.k !== 'panel');
    var setG = sbGeom['set'];
    updateScrollbarHot(x, y, (sbR && setG && sbHoverAt('set', setG.x, setG.y, setG.h)) ? 'set' : '');
    if (drawHover) {
      var hk = hh0.k + '|' + (hh0.row ? hh0.row.id : '') + '|' +
               (hh0.v == null ? '' : hh0.v) + '|' + (hh0.id || '');
      if (hk !== setHot) { setHot = hk; repaint(); }
    }
    return;
  }

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
    updateScrollbarHot(x, y);

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
  else if (y >= H - FOOT_H) hand = true;
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

  var togR = sideToggleRect();
  var togHot = !!(togR && inRect(togR, x, y));
  if (togHot !== sideTogHot) {
    sideTogHot = togHot;
    repaint();
  }

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

  updateScrollbarHot(x, y);

  if (!drawHover) return;

  if (newRow !== hoverRow || newKind !== hoverKind || newBtn !== hoverBtn) {
    hoverRow = newRow;
    hoverKind = newKind;
    hoverBtn = newBtn;
    repaint();
  }

  var inFoot = y >= H - FOOT_H;
  if (inFoot !== footHot) {
    footHot = inFoot;
    repaint();
  }
}

function on_mouse_leave() {
  sbDrag = null;
  setCursorHand(false);
  if (sbHotId) { sbHotId = ''; repaint(); }
  if (sideTogHot) { sideTogHot = false; repaint(); }
  if (scriptHot) { scriptHot = false; repaint(); }
  if (qBarHot) { qBarHot = false; repaint(); }
  if (probeHot) { probeHot = false; repaint(); }
  if (bioMoreHot) {
    bioMoreHot = false;
    repaint();
  }
  if (hoverRow !== -1 || hoverKind || hoverBtn || footHot) {
    hoverRow = -1;
    hoverKind = '';
    hoverBtn = '';
    footHot = false;
    if (hoverPaintProp()) repaint();
  }
}

function on_mouse_mbtn_up(x, y) {
  x = toLogical(x);
  y = toLogical(y);
  if (setOpen || overlay) return;
  if (!L.board) return;
  toggleSide();
  setStatus('左栏已' + (sideCollapsed ? '收起' : '展开') + '（鼠标中键切换）');
  return true;
}

function on_mouse_lbtn_down(x, y) {
  x = toLogical(x);
  y = toLogical(y);
  if (setOpen) return settingsMouseDown(x, y);
  var id = scrollbarHit(x, y);
  if (!id) {
    sbGuard = false;
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
  sbDrag = null;
  if (sbGuard) {
    sbGuard = false;
    hoverRow = -1;
    hoverKind = '';
    hoverBtn = '';
    repaint();
    return;
  }

  if (overlay) {
    for (var ob = 0; ob < HEAD_BTNS.length; ob++) {
      var obtn = HEAD_BTNS[ob];
      if (obtn.key === 'settings') continue;
      if (!headerButtonVisible(obtn.key) || !inRect(headerButtonRect(obtn.key), x, y)) continue;
      if (obtn.key === 'bio') toggleBio();
      else if (obtn.key === 'comments') toggleComments();
      return;
    }
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

      if (bg.pic && inRect(bg.pic, x, y)) {
        if (Date.now() - bioPicDblAt < 500) return;
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

  if (y >= H - FOOT_H) {
    openDiagnostics();
    return;
  }

  if (editKind) {
    if (inRect(L.search, x, y)) {
      if (x >= L.search.x + L.search.w - 76) commitEdit();
      return;
    }
    commitEdit();
    return;
  }

  var ck = checkAt(x, y);
  if (ck >= 0) {
    multiToggle(ck, keyPressed(0x10));
    return;
  }


  for (var b = 0; b < HEAD_BTNS.length; b++) {
    var btn = HEAD_BTNS[b];
    if (!headerButtonVisible(btn.key) || !inRect(headerButtonRect(btn.key), x, y)) continue;
    if (btn.key === 'settings') openSettings();
    else if (btn.key === 'comments') toggleComments();
    else if (btn.key === 'bio') toggleBio();
    return;
  }

  for (var i = 0; i < TAB_DEFS.length; i++) {
    if (inRect(tabRect(i), x, y)) {
      selectTab(i);
      return;
    }
  }

  var togRect = sideToggleRect();
  if (togRect && inRect(togRect, x, y)) {
    toggleSide();
    return;
  }

  var recRect = collRecRect();
  if (recRect && inRect(recRect, x, y)) {
    loadRecommend(collMode === 'top');
    return;
  }

  var order = NM.providers.order;
  for (var j = 0; j < order.length; j++) {
    if (inRect(platformRect(j), x, y)) {
      if (platform !== order[j]) {
        setP('lx.platform', order[j]);
        switchPlatform(order[j]);
      } else repaint();
      return;
    }
  }

  var sbr = scriptBarRect();
  if (sbr && inRect(sbr, x, y)) {
    openScriptMenu(sbr.x, sbr.y + sbr.h);
    return;
  }

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
    if (b2 === 'download') {
      selected = ti;
      repaint();
      downloadOne(tracks[ti]);
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
  if (checkAt(x, y) >= 0) return;
  var ti = trackAt(x, y);
  if (ti >= 0 && !buttonAt(x, y)) {
    selected = ti;
    repaint();
    playTrack(tracks[ti], false);
  }
}

function nudgeFontSize(delta) {
  var cur = Math.round(FONT_BASE || FONT_DEF);
  var v = clamp(cur + delta, FONT_MIN, FONT_MAX);
  if (v === cur) {
    setStatus('字号已经是 ' + v + ' px（' + (delta > 0 ? '已经是最大' : '已经是最小') + '）');
    return;
  }
  setProp('lx.fontSize', v);
  applyUiScale({ quiet: true });
  setStatus('字号：' + v + ' px（Ctrl + 滚轮调节；设置 → 外观 →「恢复默认」可回到跟随 foobar2000）');
}

function nudgeRowGap(delta) {
  var v = clamp(rowGap() + delta, ROW_GAP_MIN, ROW_GAP_MAX);
  if (v === rowGap()) {
    setStatus('行间距已经是 ' + (v > 0 ? '+' : '') + v + ' px（' +
              (delta > 0 ? '已经是最大' : '已经是最小') + '）');
    return;
  }
  setProp('lx.rowGap', v);
  computeLayout();
  clampScroll();
  sbGeom = {};
  repaint();
  setStatus('行间距：' + (v > 0 ? '+' : '') + v + ' px（Shift + 滚轮调节，0 = 默认）');
}

function on_mouse_wheel(step) {
  step = Number(step) || 0;
  if (!step) return;

  if (keyPressed(0x11)) { nudgeFontSize(step > 0 ? 1 : -1); return; }
  if (keyPressed(0x10)) { nudgeRowGap(step > 0 ? 2 : -2); return; }

  if (setOpen) {
    var P = settingsLayout();
    setScroll = clamp(setScroll - step * SET_WHEEL_STEP, 0, P.maxScroll);
    repaint();
    return;
  }

  if (overlay) {
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

  if (editKind && editKey(vkey)) return;

  if (vkey === 0x1B) {          // Esc
    if (setOpen) { closeSettings(); return; }
    if (overlay) closeOverlay();
    return;
  }
  if (overlay) {
    if (vkey === 0x72) { toggleComments(); return; }
    if (vkey === 0x73) { toggleBio(); return; }
    if (vkey === 0x26) { overlayScroll -= 1; clampScroll(); repaint(); }
    else if (vkey === 0x28) { overlayScroll += 1; clampScroll(); repaint(); }
    else if (vkey === 0x21) { overlayScroll -= visOverlayLines(); clampScroll(); repaint(); }
    else if (vkey === 0x22) { overlayScroll += visOverlayLines(); clampScroll(); repaint(); }
    return;
  }
  if (setOpen) {
    if (vkey === 0x25) { shiftCat(-1); return; }
    if (vkey === 0x27) { shiftCat(1); return; }
    return;
  }

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
  if (vkey === 0x72) {
    toggleComments();
    return;
  }
  if (vkey === 0x73) {
    toggleBio();
    return;
  }
  if (vkey === 0x74) {          // F5
    reloadSources();
    return;
  }

  if (vkey === 0x26 || vkey === 0x28 || vkey === 0x21 || vkey === 0x22 ||
      vkey === 0x24 || vkey === 0x23 || vkey === 0x25 || vkey === 0x27) {
    if (!tracks.length) return;
    var cols = trackColCount();
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

function on_key_up(vkey) {
  if (vkey === 0x10) shiftDown = false;
  else if (vkey === 0x11) ctrlDown = false;
  else if (vkey === 0x0D && editKind) commitEdit();
  else if (vkey === 0x1B && editKind) cancelEdit();
}

function on_char(code) {
  if (!editKind) return false;
  if (code === 13 || code === 10) { commitEdit(); return true; }
  if (!(code >= 32)) return false;
  var s = String.fromCharCode(code);
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

function refreshLabel() {
  return tab === 0 ? '刷新当前榜单'
    : (isBrowseTab() ? (collMode === 'top' ? '刷新' + collTopName() : '刷新搜索结果')
      : (hotMode ? '刷新热门推荐' : '重新搜索'));
}

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
  if (setOpen) return true;

  if (y < HEAD_H) return compactContextMenu(x, y);

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
    m.AppendMenuItem(MF_STRING, 9, '下载已勾选的 ' + mc + ' 首（缓存 + 标签）');
    m.AppendMenuItem(MF_STRING, 4, '取消全部勾选');
    m.AppendMenuSeparator();
  }
  if (ti >= 0) {
    m.AppendMenuItem(MF_STRING, 1, '播放：' + tracks[ti].title);
    m.AppendMenuItem(MF_STRING, 2, '加入「' + PLAYLIST_NAME + '」');
    m.AppendMenuItem(MF_STRING, 8, '下载到缓存（嵌入标签）：' + tracks[ti].title);
    m.AppendMenuItem(MF_STRING, 5, '勾选这一行（也可左键点行首方框）');
    m.AppendMenuSeparator();
  }
  if (tracks.length) {
    m.AppendMenuItem(MF_STRING, 6, '全部勾选（' + tracks.length + ' 首）');
  }
  m.AppendMenuItem(MF_STRING, 7, '输入关键词（中文输入法）…');
  m.AppendMenuSeparator();

  if (isBrowseTab()) m.AppendMenuItem(MF_STRING, 19, '网易云' + collTopName() + '（不用关键词）');
  if (tab === 1) {
    m.AppendMenuItem(MF_STRING, 25, '刷新热门推荐（' + hotBoardDef().name + '）');
    m.AppendMenuItem(MF_STRING, 26, '热门推荐换一份榜（热歌 / 飙升 / 新歌）');
  }
  m.AppendMenuItem(MF_STRING, 10, refreshLabel());
  m.AppendMenuSeparator();
  m.AppendMenuItem(MF_STRING, 30, '面板设置…' + (lastProblem ? '（有新问题）' : ''));

  var id = m.TrackPopupMenu(x, y);
  if (!id) return true;

  if (id === 1) playTrack(tracks[ti], false);
  else if (id === 2) playTrack(tracks[ti], true);
  else if (id === 8) pickDownloadQuality(x, y, function (q) { downloadTracks([tracks[ti]], q); });
  else if (id === 9) pickDownloadQuality(x, y, function (q) { downloadTracks(multiList(), q); });
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

function openSearchAgain() {
  var kw = searchKeyword;
  if (!kw) return;
  hotMode = false;
  computeLayout();
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

function init() {
  ['lx.keyword', 'lx.collKeyword.playlist', 'lx.collKeyword.podcast', 'lx.collKeyword.artist']
    .forEach(function (k) { try { setP(k, ''); } catch (e) {} });

  refreshUiScale();
  syncPanelSize();

  enableCharInput();
  applyTheme(true);
  if (!F.head) initTheme();
  logUiScale();

  if (NM.providers.order.indexOf(platform) < 0) platform = 'tx';
  if (QUALITIES.indexOf(qualityAll) < 0) qualityAll = '320k';
  if (qualityHidden && QUALITIES.indexOf(qualityHidden) < 0) qualityHidden = '';
  syncQuality();

  refreshBoards();
  computeLayout();
  try { probeLoadSaved(); } catch (e) {}

  NM.lx.onChange(function () {
    repaint();
  });

  if (tab === 0 && boards.length) loadBoard();
  else if (tab === 1) setTimeout(function () { loadHot(false); }, 60);
  else if (isBrowseTab()) setTimeout(function () { loadRecommend(false); }, 60);

  refreshBackground(true);
  setTimeout(function () { refreshBackground(false); }, 900);

  startThemeWatch();

  /* 启动时向 Eole 宿主要一次当前深浅：外部面板读不到它的面板属性，
     不问的话只能按 fb2k 配色猜，标题栏按钮切过之后就对不上了。 */
  setTimeout(function () {
    try { window.NotifyOthers('fw_theme_request', true); } catch (e) {}
  }, 900);

  setTimeout(function () {
    NM.lx.loadAll({ delay: 120 }).then(function (runtimes) {
      var ok = (runtimes || []).filter(function (r) { return r.sources; }).length;
      if (ok) setStatus('音源已就绪：' + ok + ' 个脚本可用');
      else {
        setLastProblem('没有可用的音源脚本\n' + sourcesFailText());
        setStatus('没有可用的音源脚本（点状态栏看原因）', true);
      }
      checkOnlineScript({ startup: true });
    }, function (e) {
      setLastProblem('音源加载失败\n' + ((e && e.message) || e) + '\n' + sourcesFailText());
      setStatus('音源加载失败（点状态栏看原因）', true);
      checkOnlineScript({ startup: true });
    });
  }, 200);

  setTimeout(function () {
    pruneCacheIndex();
    cleanPlaylistDeadCache();
    cleanProxyPlaylistItems();
  }, 1200);

  repaint();
}

function on_playback_new_track(handle) {
  /* 每次切歌都允许重挂一次：列表项是新 handle，即使 path 和上次一样也得重挂 */
  ATTACH_KEY = '';
  setTimeout(function () { refreshBackground(true); }, 0);
  try { pushCoverForHandle(handle); } catch (e) {}
  /* 流播换歌时封面往往还在下载/还没落盘，隔一下再补挂一次。
     已经挂上的会被 ATTACH_KEY 挡掉，不会重复写。 */
  setTimeout(function () { try { attachLastTrack('切歌'); } catch (e2) {} }, 700);
  /* 流播项的 %artist% 恒空，ESLyric 自己搜不到词：换歌后把手上的歌手 / 歌名
     直接喂给它（RequestLyric）。本地文件不走这条，它有真标签。 */
  setTimeout(function () { try { eslAutoRequest(0); } catch (e3) {} }, 800);
  /* 同一时刻把曲目信息广播给皮肤里的其他面板（列表 / 标题栏都用得上） */
  setTimeout(function () { try { lxPublishNow(0); } catch (e4) {} }, 900);
  repaint();
}

function on_playback_starting(cmd, is_paused) {
  setTimeout(function () { refreshBackground(false); }, 120);
}

function on_playback_stop(reason) {
}

function on_script_unload() {
  stopThemeWatch();
  stopEditBlink();
  disposeObj(brandLogo);
  brandLogo = null;
  brandLogoChecked = false;
}

init();
