/* ============================================================================
   主题设置页（主区模式 6）
   ----------------------------------------------------------------------------
   这个面板由 DUI 布局里的一个 JSplitter 元素提供，caption 必须是 ThemeSettings，
   Eole_layout.js 在模式 6 时把主区让给它，右栏保持原样。

   面板脚本：DUI 里只挂 theme_settings.js 这一支就够了（文件开头的探针会
   自己 include 下面两个公共脚本，已加载则跳过）：
       theme_common.js   —— g_font / GetGrey / chrome* / 各种全局设置函数
       pss_switch.js     —— 所有 oPanelSetting 状态对象（main_panel_state 等）

   写设置的三种方式（和别处保持一致，别自己另发明一套）：
     1. 状态文件：直接 oPanelSetting.setValue()。setValue 会移动
        eole-settings 下的状态文件、广播状态名，并请求一次 eole_layout 重排。
     2. 窗口级设置（边框/菜单栏/状态栏）：chromeRead / chromeApply，落在
        eole-settings\WINDOWCHROME.cfg，标题栏与本页共用同一份。
     3. 广播协议：set_font / colors / colorsControls / MemSolicitation /
        coverCacheWidthMax / DiskCacheState / 四个 *_dark_theme …
        这些是各面板 on_notify_data 里已经实现好的接口，照原样发即可。

   注意：window.NotifyOthers 不会回送给发送者，所以本页自己的显示要
   同步更新（见 tsSetColorsControls / tsSetAllDark 里的本地写回）。
   ============================================================================ */

/* 本面板只需要在 DUI 里挂这一支脚本：缺的公共脚本自己补上。
   如果布局里已经按顺序加了 theme_common.js / pss_switch.js，这里的
   typeof 探针会跳过，不会重复执行。 */
if (typeof GetGrey === 'undefined') {
    include(fb.ProfilePath + 'Eole\\js\\theme_common.js');
}
if (typeof panelSetting === 'undefined') {
    include(fb.ProfilePath + 'Eole\\js\\pss_switch.js');
}

/* 面板名必须是 ThemeSettings：Eole_layout.js 用 window.GetPanel('ThemeSettings')
   找它，标题栏也靠这个名字判断菜单项是否可用。
   DefinePanel 每个面板只能调用一次，所以包在 try 里：如果面板脚本里已经
   写了一条，这里重复调用会抛错，被吞掉即可。 */
try {
    window.DefinePanel('ThemeSettings', {
        author: 'Ottodix',
        version: globalProperties.theme_version,
        features: { drag_n_drop: false }
    });
} catch (eDefine) {}

var ww = 0, wh = 0;

/* JSplitter 4.4.0 的全局环境不提供全部 DT_* 常量（实测缺 DT_WORDBREAK，
   DT_END_ELLIPSIS 等也不保证有），这里按 Win32 原值补齐，已有的不动。 */
var DT_WORDBREAK = (typeof DT_WORDBREAK !== 'undefined') ? DT_WORDBREAK : 0x00000010;
var DT_END_ELLIPSIS = (typeof DT_END_ELLIPSIS !== 'undefined') ? DT_END_ELLIPSIS : 0x00008000;
var DT_NOPREFIX = (typeof DT_NOPREFIX !== 'undefined') ? DT_NOPREFIX : 0x00000800;
var DT_CALCRECT = (typeof DT_CALCRECT !== 'undefined') ? DT_CALCRECT : 0x00000400;
var DT_SINGLELINE = (typeof DT_SINGLELINE !== 'undefined') ? DT_SINGLELINE : 0x00000020;

/* theme_common 的 get_colors_global / 部分工具会读这两个全局对象，
   本面板不用它们画整页，但必须存在，避免误调用时抛错。 */
var colors = {};
var darkcolors = {};
var properties = {
    darklayout: false,
    stick2darklayout: false,
    /* theme_common 的 get_font() 会加这个偏移；没有它 g_fsize 会变 NaN，
       所有字体都变成 null，整页文字消失。 */
    panelFontAdjustement: 0
};

/* ---------------------------------------------------------------- 页面定义 */

var TS_PROP_NAVW = '设置·左栏宽度';   /* 左栏宽度（可拖拽分隔线调整） */
var TS_NAV_W0 = 150;         /* 默认宽度 */
function tsNavW() { return tsPropInt(TS_PROP_NAVW, TS_NAV_W0, 110, 320); }
var TS_PAD = 24;             /* 右栏左右留白 */
var TS_HEADER_H = 86;        /* 右栏标题区高度（按 tsK() 缩放，见 tsHeaderH） */

var TS_PANES = [
    { id: 'layout', title: '布局与面板', sub: '分栏设置与主区选项' },
    { id: 'theme',  title: '主题配色',   sub: '深浅色、配色与全屏壁纸' },
    { id: 'cache',  title: '封面与缓存', sub: '内存策略与封面缓存' },
    { id: 'chrome', title: '窗口外观',   sub: '边框、菜单栏、状态栏与屏幕显示' },
    { id: 'about',  title: '组件信息',   sub: '版本与已安装组件' },
    { id: 'maint',  title: '维护',       sub: '重载界面、目录与开源地址' }
];

var g_ts = {
    page: 0,
    scroll: 0,
    contentH: 0,
    hits: [],
    navHover: -1,
    rowHover: '',
    hoverKey: '',
    downRow: '',
    scrollDrag: false,
    /* 鼠标是否停在滚动条热区（悬停变粗用） */
    sbHot: false,
    /* 页头「退出设置面板」按钮：热区矩形在绘制时写入，exitHot 用于悬停变色 */
    exitBtn: null,
    exitHot: false,
    /* 拖动滚动条时鼠标与滑块顶部的偏移（按住滑块原处，不跳到鼠标位置） */
    sbGrab: 0,
    mouse: { x: -1, y: -1 },
    /* 折叠状态：{ 分区键: true }；分区键带页号，切页不会串 */
    collapsed: {},
    /* 行对象每页只建一次：get() 都在绘制时读实时状态，缓存住可以避免
       on_paint 里反复 new 闭包（组件文档也提醒别在 paint 里造对象）。 */
    rows: null,
    rowsPage: -1
};

/* ---------------------------------------------------------------- 小工具 */

function tsInt(v, def) {
    var n = parseInt(v);
    return isFinite(n) ? n : def;
}

function tsClamp(v, lo, hi) {
    return v < lo ? lo : (v > hi ? hi : v);
}

/* ---------------------------------------------------------------- 本页排版
   行高仍只属于设置页（面板私有属性）；字号已并入全主题：Ctrl+滚轮与标题栏主菜单
   「字体大小」同源，改的是「全局·字体调整」，本页跟着一起变。
   Shift+滚轮 = 本页行高（40…120），图标与控件跟着行高等比放大。
   行高上限 120 是留给「窗口外观 → 屏幕显示」的一键适配用的（200% 屏行高×2）。 */
var TS_PROP_ROWH  = '设置·行高';
var TS_PROP_LYRICW = '设置·歌词面板宽度记忆';   /* 歌词面板关闭前记住的宽度，供重新打开时恢复 */
/* 歌词面板宽度比例：lyrics_state 是 0…11 的档位（0 隐藏、11 铺满），
   这里按“每档 = 主区 10%”换算，默认 5 档＝50%。 */
var TS_LYRIC_STEPS = [20, 30, 40, 50, 60, 70, 80, 100];
var TS_LYRIC_PCTS  = ['20%', '30%', '40%', '50%', '60%', '70%', '80%', '铺满'];
function tsLyricPctIndex() {
    var st = tsInt(lyrics_state.value, 5);
    if (st <= 0) st = tsInt(window.GetProperty(TS_PROP_LYRICW, 5), 5);
    st = tsClamp(st, 1, 11);
    var pct = (st >= 11) ? 100 : st * 10;
    var best = 0, bd = 1e9;
    for (var i = 0; i < TS_LYRIC_STEPS.length; ++i) {
        var d = Math.abs(TS_LYRIC_STEPS[i] - pct);
        if (d < bd) { bd = d; best = i; }
    }
    return best;
}
function tsLyricSetPct(i) {
    var pct = TS_LYRIC_STEPS[tsClamp(tsInt(i, 3), 0, TS_LYRIC_STEPS.length - 1)];
    lyrics_state.setValue(pct >= 100 ? 11 : tsClamp(Math.round(pct / 10), 1, 11));
}
var TS_BASE_ROWH  = 48;      /* 基准行高，48 时所有控件尺寸与旧版完全一致 */

function tsPropInt(name, def, lo, hi) {
    var n = def;
    try { n = tsInt(window.GetProperty(name, def), def); } catch (e) { n = def; }
    return tsClamp(n, lo, hi);
}
/* 本页字号微调已取消（并入全局字号），恒为 0；函数留着只为兼容旧调用点 */
function tsFontDelta() { return 0; }
function tsRowH() { return tsPropInt(TS_PROP_ROWH, TS_BASE_ROWH, 40, 120); }

/* 行高统一到 48：早前的版本可能存下 52/60 这类零碎值，导致各行看着不齐。
   第一次载入时拉回基准（只做一次，之后用户仍可用 Shift+滚轮自行调整）。 */
var TS_PROP_ROWH_ONCE = '设置·行高已归一';
function tsRowHNormalize() {
    var fix = false;
    try { fix = !!window.GetProperty(TS_PROP_ROWH_ONCE, false); } catch (e0) { return; }
    if (fix) return;
    /* 已经按 >100% 适配过的，行高是适配算出来的，别拉回 48 打乱它；
       ×1 的适配记录不算，照样归一，顺便把快照里的基准行高改成 48 */
    try {
        var s0 = tsDpiSnap();
        if (s0 && s0.scale > 1.001) { window.SetProperty(TS_PROP_ROWH_ONCE, true); return; }
        if (s0) { s0.rowh = TS_BASE_ROWH; tsDpiSaveSnap(s0); }
    } catch (e1s) {}
    try {
        window.SetProperty(TS_PROP_ROWH, TS_BASE_ROWH);
        window.SetProperty(TS_PROP_ROWH_ONCE, true);
    } catch (e1) { return; }
    tsMdl2Font._f = null;
    tsMdl2Small._f = null;
    g_ts.rows = null;
}
/* 控件尺寸系数：以 48 行高为 1.0 */
function tsK() { return tsRowH() / TS_BASE_ROWH; }

/* 字体统一：整页只用一种字体一个字号（按用户要求）。原来按 kind 区分的
   boldplus1 / min2 / plus1 等全部并到同一份，kind 参数保留仅为兼容调用点。
   字号 = g_fsize + 本页私有偏移，缓存住，on_font_changed 里置空重建。 */
var TS_MDL2 = 'Segoe Fluent Icons';
function tsFont(kind) {
    var d = tsFontDelta();
    /* 缓存键要带上基准字号：全局「字体调整」被一键适配改过之后 g_fsize 会变，
       只比 d 会让整页停留在旧字号。 */
    var base = 13;
    try { if (typeof g_fsize === 'number' && isFinite(g_fsize)) base = g_fsize; } catch (eB0) { base = 13; }
    if (!tsFont._f || tsFont._d !== d || tsFont._b !== base) {
        var fam = 'Microsoft YaHei UI';
        try { if (typeof g_fname === 'string' && g_fname) fam = g_fname; } catch (eF) { fam = 'Microsoft YaHei UI'; }
        var f = null;
        try { f = gdi.Font(fam, Math.max(9, base + d), 0); } catch (e3) { f = null; }
        if (!f) { try { f = g_font.normal; } catch (e4) { f = null; } }
        tsFont._f = f;
        tsFont._d = d;
        tsFont._b = base;
    }
    return tsFont._f;
}

/* 开关专用图标字体（Segoe Fluent Icons，向量字形，圆滑无锯齿）：打开 U+F19F / 关闭 U+F19E
   字号跟行高走：48 行高时 36 号，与旧版一致 */
function tsMdl2Font() {
    var gs = Math.round(36 * tsK());
    if (!tsMdl2Font._f || tsMdl2Font._s !== gs) {
        try { tsMdl2Font._f = gdi.Font(TS_MDL2, gs); } catch (e) { tsMdl2Font._f = null; }
        tsMdl2Font._s = gs;
    }
    return tsMdl2Font._f;
}

/* 折叠箭头用的小号 MDL2（ChevronDown U+E70D / ChevronRight U+E76C） */
function tsMdl2Small() {
    var gs = Math.round(12 * tsK());
    if (!tsMdl2Small._f || tsMdl2Small._s !== gs) {
        try { tsMdl2Small._f = gdi.Font(TS_MDL2, gs); } catch (e) { tsMdl2Small._f = null; }
        tsMdl2Small._s = gs;
    }
    return tsMdl2Small._f;
}

/* 页头小图标（退出按钮等）用 MDL2，按需建并把字号写进缓存键 */
function tsMdl2Icon(px) {
    px = Math.max(9, Math.round(px));
    if (!tsMdl2Icon._f || tsMdl2Icon._s !== px) {
        try { tsMdl2Icon._f = gdi.Font(TS_MDL2, px); } catch (e) { tsMdl2Icon._f = null; }
        tsMdl2Icon._s = px;
    }
    return tsMdl2Icon._f;
}

function tsText(gr, text, font, color, x, y, w, h, flags) {
    if (!font) return;
    /* GdiDrawText 下 DT_VCENTER 只在单行模式生效，少了 DT_SINGLELINE
       文字就会贴顶（分段器、按钮、开关旁的标签都是这个毛病）。
       需要自动换行（note 行）时才保留多行。 */
    if (!(flags & DT_WORDBREAK)) flags |= DT_SINGLELINE;
    try {
        gr.GdiDrawText(String(text), font, color, Math.round(x), Math.round(y),
            Math.max(1, Math.round(w)), Math.max(1, Math.round(h)), flags);
    } catch (e) {}
}

function tsMouseIn(x, y, w, h) {
    var m = g_ts.mouse;
    return (m.x >= x && m.x < x + w && m.y >= y && m.y < y + h);
}

/* CalcTextWidth 遇到 null 字体会抛；给个按字数的退路，排版不至于散架 */
function tsTextW(gr, text, font) {
    try {
        var w = gr.CalcTextWidth(String(text), font);
        if (w > 0) return w;
    } catch (e) {}
    return String(text).length * 7;
}

/* 深浅：模式 6 与模式 3/4/5 共用「可视化·深色主题」一份状态
   （darklxbox_state 由标题栏在收到 visualization_dark_theme 时落盘）。
   控制栏的判定里还留了 colorsMainPanel 的兜底，这里照抄。 */
function tsIsDark() {
    var vis = false;
    try { vis = (typeof darklxbox_state !== 'undefined') && darklxbox_state.isActive(); } catch (e) { vis = false; }
    var cm = tsInt(globalProperties.colorsMainPanel, 0);
    return vis || (cm !== 0 && cm !== 1 && cm !== 2);
}

/* 深色正文跟 theme_common.js 第 950 行的 darkcolors.normal_txt 同源（当前 200）。
   本面板的 colors / darkcolors 只是占位对象（见文件上方说明），绘制全部走 tsColors()
   返回的局部对象，所以这里补调一次 get_colors_global() 取常量不会有副作用。
   取到后缓存；改了 950 行需重载本面板才跟随。 */
var tsDarkTxtCache = null;
function tsDarkTxt() {
    if (tsDarkTxtCache) return tsDarkTxtCache;
    try {
        if (typeof get_colors_global === 'function') get_colors_global();
        if (typeof darkcolors !== 'undefined' && darkcolors &&
            typeof darkcolors.normal_txt === 'number' && darkcolors.normal_txt) {
            tsDarkTxtCache = darkcolors.normal_txt;
        }
    } catch (e) {}
    if (!tsDarkTxtCache) tsDarkTxtCache = GetGrey(200);
    return tsDarkTxtCache;
}

function tsColors() {
    if (tsIsDark()) {
        return {
            bg: 0xff1a1a1a,
            nav: 0xff141414,
            rowHover: GetGrey(255, 12),
            rowHover2: GetGrey(255, 8),
            rowLine: GetGrey(255, 16),
            text: tsDarkTxt(),
            sub: GetGrey(150),
            sub2: GetGrey(110),
            value: GetGrey(178),
            accent: RGB(15, 177, 255),
            accentText: GetGrey(255),
            ctrlBg: GetGrey(255, 14),
            ctrlBgHover: GetGrey(255, 30),
            ctrlBorder: GetGrey(255, 40),
            pillBg: GetGrey(255, 45),
            on: RGB(15, 177, 255),
            knob: GetGrey(255)
        };
    }
    return {
        bg: GetGrey(250),
        nav: GetGrey(240),
        rowHover: GetGrey(0, 10),
        rowHover2: GetGrey(0, 6),
        rowLine: GetGrey(0, 18),
        text: GetGrey(25),
        sub: GetGrey(115),
        sub2: GetGrey(150),
        value: GetGrey(70),
        accent: RGB(0, 130, 210),
        accentText: GetGrey(255),
        ctrlBg: GetGrey(0, 10),
        ctrlBgHover: GetGrey(0, 24),
        ctrlBorder: GetGrey(0, 40),
        pillBg: GetGrey(0, 35),
        on: RGB(0, 130, 210),
        knob: GetGrey(255)
    };
}

/* ---------------------------------------------------------------- THEME.cfg */

function tsCfgPath() {
    return SettingsPath + 'THEME.cfg';
}

function tsLoadPage() {
    var page = 0;
    try {
        var t = utils.ReadTextFile(tsCfgPath());
        if (t) {
            var o = JSON.parse(String(t).replace(/^\uFEFF/, ''));
            if (o && typeof o.page === 'number') {
                page = tsClamp(Math.round(o.page), 0, TS_PANES.length - 1);
            }
            if (o && o.collapsed && typeof o.collapsed === 'object') {
                g_ts.collapsed = o.collapsed;
            }
        }
    } catch (e) { page = 0; }
    g_ts.page = page;
}

function tsSavePage() {
    try {
        utils.WriteTextFile(tsCfgPath(), JSON.stringify({ page: g_ts.page, collapsed: g_ts.collapsed }));
    } catch (e) {}
}

/* ---------------------------------------------------------------- 设置助手 */


function tsOpenhacksOn() {
    try { return !!(typeof openhacksGet === 'function' && openhacksGet()); } catch (e) { return false; }
}

/* 组件版本：CheckComponent(name, true) 装了会返回版本字符串，没装返回 false */
function tsComponent(name) {
    var v = false;
    try { v = utils.CheckComponent(name, true); } catch (e) { v = false; }
    if (!v) return '未安装';
    if (typeof v === 'string' && v.length) return '已安装 ' + v;
    return '已安装';
}

function tsRun(cmd) {
    try {
        var sh = new ActiveXObject('WScript.Shell');
        sh.Run(cmd);
        return true;
    } catch (e) {}
    try { utils.Run(cmd); return true; } catch (e2) {}
    return false;
}

function tsOpenFolder(path) {
    if (!path) return;
    tsRun('explorer.exe "' + String(path) + '"');
}

/* 版面：迷你/完整由标题栏的 toggleLayoutMode 负责（要动窗口尺寸，本面板
   没有 g_uihacks），这里只发请求。切迷你前先回媒体库，避免设置页被夹在
   没有主区的布局里。 */

/* ---- 主题设置自己的三项广播（本地也写回，因为 NotifyOthers 不回送自身） ---- */

function tsSetColorsControls(v) {
    v = tsInt(v, 0);
    globalProperties.colorsControls = v;
    window.SetProperty('全局·控制栏配色', v);
    try { window.NotifyOthers('colorsControls', v); } catch (e) {}
    window.Repaint();
}

function tsSetDiskCache(v) {
    globalProperties.enableDiskCache = !!v;
    window.SetProperty('封面·磁盘缓存', globalProperties.enableDiskCache);
    try { window.NotifyOthers('DiskCacheState', globalProperties.enableDiskCache); } catch (e) {}
    window.Repaint();
}

function tsSetDeleteCache(v) {
    globalProperties.deleteDiskCache = !!v;
    window.SetProperty('封面·下次启动时删除缓存', globalProperties.deleteDiskCache);
    window.Repaint();
}

/* ---------------------------------------------------------------- 全屏壁纸 */

/* 与标题栏右键「全屏壁纸」菜单同一份配置（FW_PROP_* / fw_* 均在 theme_common.js）。
   改完统一走：fw_cfgWrite 落盘 + fullscreenWallpaperRefit 让壁纸宿主重建 +
   fw_setOn 同步共享开关。 */
function tsFwApply() {
    try { fw_cfgWrite(); } catch (e0) {}
    try { fw_publish(); } catch (eP) {}      /* 把 10 项壁纸参数广播给其他面板 */
    try { window.NotifyOthers('fullscreenWallpaperRefit', true); } catch (e1) {}
    try { fw_setOn(fw_enabled()); } catch (e2) {}
    window.Repaint();
}

function tsSetWallEnabled(v) {
    try { fw_broadcast(!!v); } catch (e) {}
    tsFwApply();
}

function tsSetWallSource(v) {
    try { window.SetProperty(FW_PROP_SOURCE, tsInt(v, 0)); } catch (e) {}
    tsFwApply();
}

function tsSetWallQuality(v) {
    try { window.SetProperty(FW_PROP_QUALITY, tsClamp(tsInt(v, 1), 1, 3)); } catch (e) {}
    tsFwApply();
}

/* 选图片：SMP/JSplitter 没有 OpenFileDialog，和标题栏菜单一样用输入框贴路径 */
function tsWallPickImage() {
    var cur = '';
    try { cur = String(fw_imagePath() || ''); } catch (e0) { cur = ''; }
    var inp = null;
    try {
        inp = utils.InputBox(window.ID,
            '粘贴图片完整路径（jpg / png / bmp / gif / webp 均可）。\n\n' +
            '支持三种写法：\n' +
            '  绝对路径      C:\\Pictures\\wall.jpg\n' +
            '  带变量        %profile%\\Eole\\img\\wall.jpg\n' +
            '  相对 profile  Eole\\img\\wall.jpg',
            '全屏壁纸图片', cur, true);
    } catch (e1) { inp = null; }
    if (inp === null || inp === undefined) return;
    var p = String(inp).replace(/^\s+|\s+$/g, '').replace(/^"|"$/g, '');
    if (p === cur) return;
    if (!p) { try { fw_setImagePath(''); } catch (e2) {} tsFwApply(); return; }
    var abs = '';
    try { abs = fw_absImagePath(p); } catch (e3) { abs = ''; }
    if (!abs) {
        fb.ShowPopupMessage('找不到这个图片文件：\n' + p +
            '\n\n可以填绝对路径，或用 %profile%\\ 开头的路径。', '全屏壁纸');
        return;
    }
    try { fw_setImagePath(abs); } catch (e4) {}
    try { if (fw_source() === 0) window.SetProperty(FW_PROP_SOURCE, 1); } catch (e5) {}
    tsFwApply();
}

/* 预置背景：img\Background 下的图片弹成菜单，点一下就换（同标题栏「预置背景」） */
function tsWallPresetMenu(x, y) {
    var presets = [];
    try { presets = fw_presetFiles() || []; } catch (e0) { presets = []; }
    if (!presets.length) {
        fb.ShowPopupMessage('img\\Background 里还没有图片。\n\n把图片放进去之后再来这里选。',
            '预置背景');
        return;
    }
    var menu = window.CreatePopupMenu();
    var curLow = '';
    try { curLow = String(fw_imagePath() || '').toLowerCase(); } catch (e1) {}
    var paths = [];
    var count = 0;
    for (var i = 0; i < presets.length && count < 60; ++i) {
        if (!presets[i] || !presets[i].path) continue;
        menu.AppendMenuItem(MF_STRING, 2000 + count, presets[i].name || presets[i].path);
        if (String(presets[i].path).toLowerCase() === curLow) menu.CheckMenuItem(2000 + count, true);
        paths.push(presets[i].path);
        count++;
    }
    if (presets.length > count) {
        menu.AppendMenuItem(MF_GRAYED, 0, '（还有 ' + (presets.length - count) + ' 张未列出）');
    }
    var idx = menu.TrackPopupMenu(x, y, 0x0020);
    menu = null;
    if (!(idx >= 2000)) return;
    var pick = paths[idx - 2000];
    if (!pick) return;
    try { fw_setImagePath(pick); } catch (e2) {}
    try { if (fw_source() === 0) window.SetProperty(FW_PROP_SOURCE, 1); } catch (e3) {}
    tsFwApply();
}

/* ---------------------------------------------------------------- 分类标题 */

/* 行类型 heading：只画一行小标题，不参与点击（id 为空） */
function tsHeading(text, h, noFold) {
    return { kind: 'heading', text: text, h: h || 40, fold: (noFold ? false : true) };
}

/* ---------------------------------------------------------------- 控制栏跨面板 */

/* 控制栏（controls.js）里的曲目详情 / 音量条 / 滑块样式是面板私有属性，
   别的面板读不到，只能靠一问一答同步：
     本页发 ts_control_get → controls.js 回 ts_control_state（同步返回）。
   本页的修改则发 ts_control {key, value} 让它落地并重建。 */
var g_ctrl = {
    rows: 0, prefix: 0, volume: 0, cursor: 0, trackinfo: 0,
    btn_stop: 0, btn_repeat: 0, btn_shuffle: 0, btn_random: 0, btn_open: 0,
    btn_device: 0, btn_equalizer: 0, btn_rating: 0, btn_scheduler: 0,
    valid: false
};

function tsQueryControl() {
    g_ctrl.querying = true;
    g_ctrl.valid = false;
    try { window.NotifyOthers('ts_control_get', 1); } catch (e) {}
    g_ctrl.querying = false;
}

function tsSetControl(key, value) {
    try { window.NotifyOthers('ts_control', { key: key, value: value }); } catch (e) {}
    /* 本地也更新一份，重画时显示的就是刚点的值 */
    if (g_ctrl[key] !== undefined) g_ctrl[key] = tsInt(value, 0);
    g_ctrl.valid = true;
    window.Repaint();
}

/* ---------------------------------------------------------------- 标题栏跨面板 */

/* 标题栏「设置...」菜单里的开关同样是面板私有属性，走同一套一问一答：
   ts_titlebar_get → title_bar 回 ts_titlebar_state；写入发 ts_titlebar {key,value}。 */
var g_tb = {
    titleinfo: 0, uppercase: 0, minimenu: 0, search: 0, remember: 0, hide_lxbox: 0,
    btn_nowplaying: 0, btn_configlayout: 0, btn_rightsidebar: 0,
    btn_lightswitch: 0, btn_fullscreen: 0, btn_themesettings: 0, btn_search: 0,
    duifollow: 0, valid: false
};

function tsQueryTitlebar() {
    g_tb.valid = false;
    try { window.NotifyOthers('ts_titlebar_get', 1); } catch (e) {}
}

function tsSetTitlebar(key, value) {
    try { window.NotifyOthers('ts_titlebar', { key: key, value: value }); } catch (e) {}
    if (g_tb[key] !== undefined) g_tb[key] = tsInt(value, 0);
    g_tb.valid = true;
    window.Repaint();
}

/* ---------------------------------------------------------------- 屏幕显示
   高 DPI / 4K 一键适配。全部复用主题已有的通道，不另立一套缩放体系：
     · 标题栏加宽   ts_titlebar {compacttitlebar:2}——与标题栏右键菜单同一套动作
     · 控制栏加宽   mini_controlbar.setValue(0)
     · 全主题字号   全局·字体调整 + NotifyOthers('set_font')——与 Ctrl+滚轮同一条
     · 列表行高     NotifyOthers('ts_dpi_preset')，各面板按自己的基准行高乘比例
   适配前的值存一份快照（一行竖线分隔的纯文本，不用 JSON），
   行高基准由各面板自己记，还原时一起退回。 */
var TS_PROP_DPI      = '屏幕显示·适配快照';
var TS_PROP_DPI_FORCE = '屏幕显示·适配倍率';
var TS_DPI_FORCE = [0, 100, 125, 150, 175, 200];   /* 0 = 自动（按屏幕 DPI 换算，非高分屏退回 150%） */

function tsScreenDpi() {
    var d = 96;
    try { d = (typeof window.DPI !== 'undefined' && window.DPI) ? tsInt(window.DPI, 96) : 96; } catch (eSD) { d = 96; }
    if (d <= 0) d = 96;
    return d;
}
function tsDpiForceIndex() { return tsPropInt(TS_PROP_DPI_FORCE, 0, 0, 5); }
/* 自动：严格按屏幕 DPI 换算（1080P / 100% 就是 100%，不会自作主张放大）。
   DPI 读不到时按 100%，由「适配倍率」手动指定。 */
function tsScreenScale() {
    var i = tsDpiForceIndex();
    if (i > 0) return TS_DPI_FORCE[i] / 100;
    var s = tsScreenDpi() / 96;
    return (s >= 1) ? s : 1;
}

/* 基准字号：g_fsize 里已经带了当前偏移，减掉就是主题原始字号 */
function tsDpiBaseFont() {
    var base = 14;
    try {
        var cur = (typeof g_fsize === 'number' && isFinite(g_fsize)) ? g_fsize : 0;
        if (cur > 8) base = cur - tsInt(globalProperties.fontAdjustement, 0);
    } catch (eBF) { base = 14; }
    if (!(base > 8)) base = 14;
    return base;
}
function tsDpiFontTarget(scale) {
    var base = tsDpiBaseFont();
    var v = Math.round(base * scale) - base;
    return tsClamp(v, globalProperties.fontAdjustement_min, globalProperties.fontAdjustement_max);
}

function tsDpiSnap() {
    var raw = '';
    try { raw = String(window.GetProperty(TS_PROP_DPI, '')); } catch (e0) { raw = ''; }
    if (!raw) return null;
    var p = raw.split('|');
    if (p.length < 5) return null;
    return {
        compact: tsInt(p[0], 0), mini: tsInt(p[1], 1), font: tsInt(p[2], 0),
        rowh: tsInt(p[3], TS_BASE_ROWH), scale: parseFloat(p[4]) || 0
    };
}
function tsDpiSaveSnap(o) {
    try {
        window.SetProperty(TS_PROP_DPI, [o.compact, o.mini, o.font, o.rowh, o.scale].join('|'));
    } catch (eSS) {}
}

function tsDpiSetFont(v) {
    v = tsClamp(tsInt(v, 0), globalProperties.fontAdjustement_min, globalProperties.fontAdjustement_max);
    globalProperties.fontAdjustement = v;
    try { window.SetProperty('全局·字体调整', v); } catch (eF1) {}
    try { window.NotifyOthers('set_font', v); } catch (eF2) {}
    try { if (typeof get_font === 'function') get_font(); } catch (eF3) {}
    tsFont._f = null;      /* 本页私有字体缓存重建 */
    tsMdl2Font._f = null;
    tsMdl2Small._f = null;
}

/* ===== 字体样式（窗口外观页）：0=默认 1=跟随DUI 2=自定义 ===== */
var TS_PROP_FONT_MODE = '全局·字体样式';
var TS_PROP_FONT_NAME = '全局·字体名称';
function tsFontModeGet() {
	/* 先读跨面板共享文件（真正全局），没有再回落到本面板属性（兼容旧版） */
	try {
		var st = (typeof tsReadFontState === 'function') ? tsReadFontState() : null;
		if (st && st.mode >= 0) return tsClamp(st.mode, 0, 2);
	} catch (eFM1) {}
	var v = 0;
	try { v = tsInt(window.GetProperty(TS_PROP_FONT_MODE, 0), 0); } catch (eFM0) { v = 0; }
	return tsClamp(v, 0, 2);
}
/* 按指定档位解析族名；与 theme_common 的 tsResolveFontFamily 同一顺序，供显示与落盘复用 */
function tsFamilyOfMode(mode) {
	mode = tsClamp(tsInt(mode, 0), 0, 2);
	if (mode === 2) {
		var st = null;
		try { st = (typeof tsReadFontState === 'function') ? tsReadFontState() : null; } catch (eFN0) { st = null; }
		if (st && st.fam) return st.fam;
		var n = '';
		try { n = String(window.GetProperty(TS_PROP_FONT_NAME, '') || ''); } catch (eFN1) { n = ''; }
		return n || 'Microsoft YaHei UI';
	}
	if (mode === 1) {
		try {
			var f = (window.InstanceType == 0) ? window.GetFontCUI(FontTypeCUI.items) : window.GetFontDUI(FontTypeDUI.playlists);
			if (f) { var nm = String(f.Name || ''); if (nm) return nm; }
		} catch (eFN2) {}
	}
	return 'Microsoft YaHei UI';
}
function tsFontFamilyNow() {
	return tsFamilyOfMode(tsFontModeGet());
}
function tsFontInfo() {
	var fam = tsFontFamilyNow();
	var ok = false;
	try { ok = utils.CheckFont(fam); } catch (eFO) { ok = false; }
	var mode = tsFontModeGet();
	var src = (mode === 0) ? '默认' : (mode === 1 ? '跟随DUI' : '自定义');
	var size = 13;
	try { if (typeof g_fsize === 'number' && isFinite(g_fsize)) size = g_fsize; } catch (eFZ) {}
	return fam + '　' + size + ' 号　来源：' + src + (ok ? '' : '（系统里没有该字体，已回退微软雅黑 UI）');
}
function tsSetFontMode(v) {
	v = tsClamp(tsInt(v, 0), 0, 2);
	var cand = '';                       /* v===2 时记下对话框选中的族名 */
	if (v === 2) {
		/* utils.FontPicker 收的是 Font 对象（不是族名字符串），返回同类型 Font；
		   取消时原样返回传入的默认字体，传 null 时返回 null。这里只取返回的族名，字号仍归「字体调整」。 */
		var fam = tsFontFamilyNow();
		var fsz = 13, fst = 0;
		try { if (typeof g_fsize === 'number' && isFinite(g_fsize)) fsz = Math.round(g_fsize); } catch (eFS0) {}
		try { if (typeof g_fstyle === 'number' && isFinite(g_fstyle)) fst = g_fstyle; } catch (eFST0) {}
		var def = null;
		try { def = (window.DrawMode === 1) ? d2d.Font(fam, fsz, fst) : gdi.Font(fam, fsz, fst); } catch (eFD0) { def = null; }
		var picked = null;
		try { picked = utils.FontPicker(def); } catch (eFP0) {
			try { fb.ShowPopupMessage('打开系统字体对话框失败：' + eFP0, '字体样式'); } catch (eFPX) {}
			return;
		}
		if (!picked || picked === def) return;      /* 取消：保持原档不动 */
		try { cand = String(picked.Name || ''); } catch (eFP1) { cand = ''; }
		if (!cand) return;
		var ok = false;
		try { ok = utils.CheckFont(cand); } catch (eFP2) { ok = false; }
		if (!ok) {
			try { fb.ShowPopupMessage('系统里找不到字体「' + cand + '」，已放弃。', '字体样式'); } catch (eFP3) {}
			return;
		}
		try { window.SetProperty(TS_PROP_FONT_NAME, cand); } catch (eFP4) {}
	}
	try { window.SetProperty(TS_PROP_FONT_MODE, v); } catch (eFP4) {}
	/* 关键：写跨面板共享文件，否则别的面板读自己的属性，永远停在默认字体 */
	var famSave = (v === 2) ? cand : tsFamilyOfMode(v);
	try { utils.WriteTextFile(TS_FONT_STATE_PATH, String(v) + '|' + famSave, false); } catch (eFW0) {}
	/* 本页先自更新，再广播；沿用现有 set_font 通知，不新增面板 handler */
	try { if (typeof get_font === 'function') get_font(); } catch (eFP5) {}
	tsFont._f = null;
	tsMdl2Font._f = null;
	tsMdl2Small._f = null;
	g_ts.rows = null;
	try { window.NotifyOthers('set_font', globalProperties.fontAdjustement); } catch (eFP6) {}
	window.Repaint();
}
function tsDpiSetRowH(base, scale) {
    var want = Math.round(tsInt(base, TS_BASE_ROWH) * ((scale && scale > 0) ? scale : 1));
    try { window.SetProperty(TS_PROP_ROWH, tsClamp(want, 40, 120)); } catch (eRH) {}
    tsMdl2Font._f = null;      /* 图标字号跟行高走，要重建 */
    tsMdl2Small._f = null;
    g_ts.rows = null;
    try {
        var cr = tsContentRect();
        g_ts.scroll = Math.round(tsClamp(g_ts.scroll, 0, Math.max(0, g_ts.contentH - cr.h)));
    } catch (eRS2) {}
}

/* 改标题栏形态 / 控制栏宽度：适配与还原共用，避免重复写法 */
function tsDpiSetCompact(v) {
    v = tsClamp(tsInt(v, 0), 0, 2);
    if (tsInt(compact_titlebar.value, 0) === v) return;
    try { compact_titlebar.setValue(v); } catch (eC1) {}
    tsSetTitlebar('compacttitlebar', v);
}
function tsDpiSetMini(v) {
    v = tsClamp(tsInt(v, 1), 0, 1);
    if (tsInt(mini_controlbar.value, 1) === v) return;
    try { mini_controlbar.setValue(v); } catch (eM1) {}
}
/* 第 4 种形态（compact=3）的加宽不占 compact 值：单独写 SIDEBARWIDEBAR，
   标题栏与 Eole_layout 都读这一个键，保证高度与按钮尺寸一起变。 */
function tsDpiSetRailWide(on) {
    try { if (typeof railWidePrefSet === 'function') railWidePrefSet(on ? 1 : 0); } catch (eRW) {}
    try { window.NotifyOthers('eole_layout', true); } catch (eRW2) {}
}

function tsDpiApply() {
    var scale = tsScreenScale();
    var snap = tsDpiSnap();
    if (!snap) {
        snap = {
            compact: tsInt(compact_titlebar.value, 0),
            mini: tsInt(mini_controlbar.value, 1),
            font: tsInt(globalProperties.fontAdjustement, 0),
            rowh: tsRowH(),
            scale: 0
        };
        tsDpiSaveSnap(snap);
    }
    snap.scale = scale;
    tsDpiSaveSnap(snap);

    /* 第 4 种形态单独处理：加宽 = 50px，与「加宽紧凑」同高，但不改 compact 的 3 */
    var isRail = tsInt(compact_titlebar.value, 0) === 3;
    if (scale <= 1.001) {
        /* 100% 档：标题栏与控制栏都退出加宽型，回到适配前的形态 */
        if (isRail) tsDpiSetRailWide(false);
        tsDpiSetCompact(tsInt(snap.compact, 0));
        tsDpiSetMini(tsInt(snap.mini, 1));
    } else {
        /* 1. 标题栏：两行标题栏不动，只有常规紧凑才升到加宽紧凑
           （先 setValue 移状态文件，再发动作，和本页「标题栏形态」那一行同源）；
           第 4 种形态走 SIDEBARWIDEBAR，高度从 36 变 50 */
        if (isRail) tsDpiSetRailWide(true);
        else if (tsInt(compact_titlebar.value, 0) === 1) tsDpiSetCompact(2);
        /* 2. 控制栏：统一改成加宽控制栏 */
        tsDpiSetMini(0);
    }
    /* 3. 全主题字号（和 Ctrl+滚轮同一条通道） */
    tsDpiSetFont(tsDpiFontTarget(scale));
    /* 4. 列表类面板行高：各面板自己按比例调 */
    try { window.NotifyOthers('ts_dpi_preset', { mode: 'apply', scale: scale }); } catch (eN4) {}
    /* 5. 本页自己的行高：100% 档一律统一回 48，放大档才按基准乘比例 */
    var rowBase = tsInt(snap.rowh, TS_BASE_ROWH);
    if (scale <= 1.001) rowBase = TS_BASE_ROWH;
    tsDpiSetRowH(rowBase, scale);
    window.Repaint();
}

function tsDpiRestore() {
    var snap = tsDpiSnap();
    if (!snap) {
        fb.ShowPopupMessage('还没有做过屏幕适配，没有可还原的内容。', '屏幕显示');
        return;
    }
    tsDpiSetCompact(tsInt(snap.compact, 0));
    if (tsInt(snap.compact, 0) === 3) tsDpiSetRailWide(false);
    tsDpiSetMini(tsInt(snap.mini, 1));
    tsDpiSetFont(tsInt(snap.font, 0));
    try { window.NotifyOthers('ts_dpi_preset', { mode: 'restore', scale: 1 }); } catch (eR3) {}
    tsDpiSetRowH(tsInt(snap.rowh, TS_BASE_ROWH), 1);
    try { window.SetProperty(TS_PROP_DPI, ''); } catch (eR4) {}
    window.Repaint();
}

/* ---------------------------------------------------------------- 右侧栏 */

/* 各主区模式的 TrackInfo（封面/属性）三态：1 顶部 / 2 底部 / 0 隐藏 */

/* 右栏「封面、属性」位置。读写都交给 title_bar.js 的 getTrackInfosState() /
   toggleTrackInfosState()，和「布局配置 → 右侧播放列表 → 封面、属性」菜单
   完全同一套逻辑，避免本页读到的状态副本过期而对不上勾选。 */
/* 查询只在加载 / 切页 / 收到状态通知时做——绝不能在 on_paint 里 NotifyOthers，
   那会在绘制中途抛出并被上层 try/catch 吞掉，高亮就永远停在“顶部”。 */
var g_ti = { val: 0, valid: false, timer: 0 };

/* 各主区模式的 TrackInfo 三态：1 顶部 / 2 底部 / 0 隐藏（本地兜底读用） */
function tsInfoStates() {
    return [trackinfoslib_state, trackinfosplaylist_state, trackinfosbio_state,
        trackinfoslxbox_state, trackinfosmdrop_state, trackinfosmpv_state, trackinfostheme_state];
}

function tsQueryInfo() {
    g_ti.timer = 0;
    try { window.NotifyOthers('ts_info_get', 1); } catch (e) {}
}

/* 收到状态通知后延迟一拍再查，避开通知回调里重入 */
function tsQueryInfoLater() {
    if (g_ti.timer) { try { window.ClearTimeout(g_ti.timer); } catch (e0) {} }
    g_ti.timer = window.SetTimeout(tsQueryInfo, 0);
}

function tsSetInfo(raw) {
    g_ti.val = tsInt(raw, 0);
    g_ti.valid = true;
    try { window.NotifyOthers('ts_info_set', g_ti.val); } catch (e) {}
    window.Repaint();
}

/* ---------------------------------------------------------------- 全局深浅色 */

/* 「媒体库 / 播放列表 / 艺术家简介 / 可视化」四个深色主题合并成一个总开关。
   必须和标题栏右上角「深色与浅色切换按钮」同源：
     · 读状态：用 fw_themeDark()（与按钮的判定一致，还能反映壁纸深浅）
     · 写状态：发 ts_lightswitch 让 title_bar 执行 Lightswitch(true, v)，
       由它统一改四份状态、写壁纸深浅、发 global_dark_theme 广播。 */
function tsAllDarkOn() {
    try { if (typeof fw_themeDark === 'function') return !!fw_themeDark(); } catch (e0) {}
    try {
        return darklib_state.isActive() && darkplaylist_state.isActive() &&
            darkbio_state.isActive() && darklxbox_state.isActive();
    } catch (e) { return false; }
}

var g_dark = { val: 0, valid: false };

function tsSetAllDark(v) {
    v = !!v;
    g_dark.val = v ? 1 : 0;
    g_dark.valid = true;
    try { window.NotifyOthers('ts_lightswitch', v); } catch (e) {}
    window.Repaint();
}

/* ---------------------------------------------------------------- MilkDrop 预设 */

var g_ts_presetDir = null;
var g_ts_presetTitles = {};

function tsPresetDir() {
    if (g_ts_presetDir !== null) return g_ts_presetDir;
    var base = '';
    try { base = String(fb.ComponentPath || '').replace(/[\\/]+$/, ''); } catch (e) { base = ''; }
    if (!base) {
        try { base = ProfilePath.replace(/[\\/]+$/, '') + '\\user-components-x64\\foo_uie_jsplitter'; } catch (e2) { base = ''; }
    }
    g_ts_presetDir = base + '\\samples\\vis\\MilkDrop\\';
    return g_ts_presetDir;
}

/* 预设文件首行注释里有名字：MilkDrop 0014 — rain on inverted London */
function tsPresetTitle(dir, id) {
    if (g_ts_presetTitles[id] !== undefined) return g_ts_presetTitles[id];
    var t = '';
    try {
        var txt = String(utils.ReadTextFile(dir + id + '.js') || '');
        var m = /MilkDrop\s*\d{4}\s*[\u2014\u2013-]\s*([^\r\n]+)/.exec(txt.slice(0, 400));
        if (m) t = m[1].replace(/[.。]\s*$/, '');
    } catch (e) { t = ''; }
    g_ts_presetTitles[id] = t;
    return t;
}

function tsPresetMenu(x, y) {
    var dir = tsPresetDir();
    var files = [];
    try { files = utils.Glob(dir + '*.js'); } catch (e) { files = []; }
    if (!files || !files.length) {
        fb.ShowPopupMessage('没有找到 MilkDrop 预设目录：\n' + dir +
            '\n\n请确认 foo_uie_jsplitter 的 samples\\vis\\MilkDrop 目录还在。', 'MilkDrop 预设');
        return;
    }
    var menu = window.CreatePopupMenu();
    var idByMenu = {};
    var count = 0;
    for (var i = 0; i < files.length; ++i) {
        var m = /(\d{4})\.js$/i.exec(files[i]);
        if (!m) continue;
        var id = m[1];
        var title = tsPresetTitle(dir, id);
        idByMenu[1000 + i] = id;
        count++;
        menu.AppendMenuItem(MF_STRING, 1000 + i, id + (title ? ('  ' + title) : ''));
        if (tsInt(milkdropvis_state.value, -1) === tsInt(id, -2)) menu.CheckMenuItem(1000 + i, true);
    }
    if (!count) {
        fb.ShowPopupMessage('预设目录里没有 4 位编号的 .js 预设：\n' + dir, 'MilkDrop 预设');
        menu = null;
        return;
    }
    var idx = menu.TrackPopupMenu(x, y, 0x0020);
    menu = null;
    var pick = idByMenu[idx];
    if (pick) milkdropvis_state.setValue(tsInt(pick, 14));
}

/* ---------------------------------------------------------------- 页面内容 */

/* 三个筛选器全关时不要保留筛选区高度（和标题栏菜单的处理一致），
   反过来只要还有筛选器开着，高度 0 会被自动抬到 1。
   否则模式 1 会在播放列表上方白留一条空带。 */
function tsFixFilterSpace() {
    if (!filter1_state.isActive() && !filter2_state.isActive() && !filter3_state.isActive()) {
        filters_panel_state.setValue(0);
    } else if (!filters_panel_state.isActive()) {
        filters_panel_state.setValue(1);
    }
}

/* 通用：把 oPanelSetting 包成一行设置 */
function tsStateRow(id, label, desc, kind, st, labels, extra) {
    var row = {
        id: id, label: label, desc: desc, kind: kind,
        labels: labels,
        get: function () { return tsInt(st.value, 0); },
        set: function (v) { st.setValue(tsInt(v, 0)); }
    };
    if (extra) for (var k in extra) if (extra.hasOwnProperty(k)) row[k] = extra[k];
    return row;
}

function tsRows() {
    if (g_ts.rows && g_ts.rowsPage === g_ts.page) return g_ts.rows;
    var R = [];

    if (g_ts.page === 0) {
        /* ---------- 布局与面板：按面板分区 ---------- */
        R.push(tsHeading('标题栏设置'));
        R.push({
            id: 'titlebar', label: '标题栏形态',
            desc: '紧凑标题栏会把主区整体上移',
            kind: 'choice',
            labels: ['标准两行', '常规紧凑', '加宽紧凑', '折叠侧边栏'],
            get: function () { return tsInt(compact_titlebar.value, 0); },
            set: function (v) {
                /* 先移状态文件（持久化 + 触发重排），再把新值连同“重建按钮/重算配色/
                   重排/重设伪标题栏”一起发给标题栏面板，效果与右键菜单同源 */
                var vv = tsClamp(tsInt(v, 0), 0, 3);
                compact_titlebar.setValue(vv);
                tsSetTitlebar('compacttitlebar', vv);
            }
        });
        R.push({
            id: 'tb_titleinfo', label: '标题栏显示曲目信息', desc: '标题栏右侧显示正在播放的歌名',
            kind: 'toggle',
            get: function () { return g_tb.valid ? tsInt(g_tb.titleinfo, 0) : 0; },
            set: function (v) { tsSetTitlebar('titleinfo', v ? 1 : 0); }
        });
        R.push({
            id: 'tb_titleformat', label: '正在播放曲目标题格式', desc: '使用完整的 foobar 标题格式化语法',
            kind: 'button', button: '编辑格式…',
            get: function () { return 0; }, set: function () {},
            action: function () { tsSetTitlebar('titleformat', 1); }
        });
        R.push({
            id: 'tb_uppercase', label: '面板按钮文字大写', desc: '标题栏与面板按钮的文字转大写',
            kind: 'toggle',
            get: function () { return g_tb.valid ? tsInt(g_tb.uppercase, 0) : 0; },
            set: function (v) { tsSetTitlebar('uppercase', v ? 1 : 0); }
        });
        R.push({
            id: 'tb_minimenu', label: '迷你主菜单按钮', desc: '用一个小按钮代替完整主菜单栏',
            kind: 'toggle',
            get: function () { return g_tb.valid ? tsInt(g_tb.minimenu, 0) : 0; },
            set: function (v) { tsSetTitlebar('minimenu', v ? 1 : 0); }
        });
        R.push({
            id: 'tb_search', label: '始终显示搜索框', desc: '紧凑标题栏下由标题栏自动决定',
            kind: 'toggle',
            get: function () { return g_tb.valid ? tsInt(g_tb.search, 0) : 0; },
            set: function (v) { tsSetTitlebar('search', v ? 1 : 0); }
        });
        R.push({
            id: 'tb_remember', label: '启动时恢复面板状态', desc: '重新打开时回到上次停留的主区模式（MilkDrop、MPV、主题设置除外）',
            kind: 'toggle',
            get: function () { return g_tb.valid ? tsInt(g_tb.remember, 0) : 0; },
            set: function (v) { tsSetTitlebar('remember', v ? 1 : 0); }
        });
        R.push({
            id: 'tb_hidelxbox', label: '隐藏洛雪音源面板', desc: '隐藏后标题栏菜单里不再出现洛雪音源',
            kind: 'toggle',
            get: function () { return g_tb.valid ? tsInt(g_tb.hide_lxbox, 0) : 0; },
            set: function (v) { tsSetTitlebar('hide_lxbox', v ? 1 : 0); }
        });

        /* 7 个标题栏按钮：整排图标，选中＝显示、未选中＝隐藏（与「设置…」菜单同源） */
        R.push({
            id: 'tbbtns', label: '标题栏按钮', desc: '点亮的显示、变暗的隐藏；选中的图标下方有下划线',
            kind: 'iconbar',
            icons: [
                { key: 'btn_nowplaying',    name: '右侧栏可见性按钮', file: 'nowplaying_off.png',  dir: 'tb' },
                { key: 'btn_configlayout',  name: '面板布局按钮',     file: 'panel_settings.png',  dir: 'tb' },
                { key: 'btn_themesettings', name: '主题设置按钮',     file: 'theme_settings.png',  dir: 'tb' },
                { key: 'btn_rightsidebar',  name: '右侧栏功能按钮',   file: 'trackinfos_on.png',   dir: 'tb' },
                { key: 'btn_lightswitch',   name: '明暗切换按钮',     file: 'lightswitch_icon3.png', dir: 'tb' },
                { key: 'btn_fullscreen',    name: '全屏按钮',         file: 'fullscreen_icon.png', dir: 'tb' },
                { key: 'btn_search',        name: '搜索按钮',         file: 'search_icon.png',     dir: 'tb' }
            ],
            get: function (k) { return g_tb.valid ? tsInt(g_tb[k], 0) : 0; },
            set: function (k, v) { tsSetTitlebar(k, v ? 1 : 0); }
        });
        R.push(tsHeading('控制栏设置'));
        R.push({
            id: 'controlbar', label: '控制栏高度',
            desc: '「加宽」即控制栏右键的加宽控制栏；迷你高度更省纵向空间',
            kind: 'choice',
            labels: ['迷你', '加宽'],
            get: function () { return mini_controlbar.isActive() ? 0 : 1; },
            set: function (v) {
                /* 等价控制栏右键「加宽控制栏」：非迷你 = 加宽 */
                mini_controlbar.setValue(tsInt(v, 0) === 1 ? 0 : 1);
            }
        });
        R.push({
            id: 'trackinfo', label: '曲目详情显示',
            desc: '控制栏进度条上方那行歌名与歌手；与右键「曲目详情」3015 同源',
            kind: 'toggle',
            get: function () { return g_ctrl.valid ? tsInt(g_ctrl.trackinfo, 0) : (showtrackinfo_big.isActive() ? 1 : 0); },
            set: function (v) { tsSetControl('trackinfo', v ? 1 : 0); }
        });
        R.push({
            id: 'tdlines', label: '曲目详情行数', desc: '对应控制栏右键「曲目详情 → 双行显示」',
            kind: 'choice',
            labels: ['单行', '双行'],
            get: function () { return g_ctrl.valid ? tsInt(g_ctrl.rows, 0) : 0; },
            set: function (v) { tsSetControl('rows', tsInt(v, 0)); }
        });
        R.push({
            id: 'tdprefix', label: '曲目标题前缀', desc: '在曲名前加「碟号.音轨号」前缀',
            kind: 'toggle',
            get: function () { return g_ctrl.valid ? tsInt(g_ctrl.prefix, 0) : 0; },
            set: function (v) { tsSetControl('prefix', v ? 1 : 0); }
        });
        R.push({
            id: 'cover', label: '显示当前播放封面',
            desc: '控制栏最左侧的方形封面；完整/迷你各有一份状态，照右键菜单的规则走',
            kind: 'toggle',
            get: function () {
                return (layout_state.isEqual(0) ? coverpanel_state_big.isActive() : coverpanel_state_mini.isActive()) ? 1 : 0;
            },
            set: function (v) {
                if (layout_state.isEqual(0)) coverpanel_state_big.setValue(v ? 1 : 0);
                else coverpanel_state_mini.setValue(v ? 1 : 0);
            }
        });
        R.push({
            id: 'volume', label: '始终显示音量条', desc: '控制栏右键里的同名选项',
            kind: 'toggle',
            get: function () { return g_ctrl.valid ? tsInt(g_ctrl.volume, 0) : 0; },
            set: function (v) { tsSetControl('volume', v ? 1 : 0); }
        });
        R.push({
            id: 'cursor', label: '滑块光标', desc: '进度条滑块的外观',
            kind: 'choice',
            labels: ['圆形', '实心圆盘', '悬停时显示实心圆盘'],
            get: function () { return g_ctrl.valid ? tsClamp(tsInt(g_ctrl.cursor, 0), 0, 2) : 0; },
            set: function (v) { tsSetControl('cursor', tsInt(v, 0)); }
        });
        /* 9 个控制栏按钮：整排图标，选中＝显示、未选中＝隐藏（与右键「显示按钮」同源） */
        R.push({
            id: 'ctlbtns', label: '控制栏按钮', desc: '点亮的显示、变暗的隐藏；选中的图标下方有下划线',
            kind: 'iconbar',
            icons: [
                { key: 'btn_stop',      name: '停止按钮',        file: 'stop.png',        dir: 'ctl' },
                { key: 'btn_repeat',    name: '循环按钮',        file: 'repeat.png',      dir: 'ctl' },
                { key: 'btn_shuffle',   name: '乱序按钮',        file: 'shuffle.png',     dir: 'ctl' },
                { key: 'btn_random',    name: '随机按钮',        file: 'random.png',      dir: 'ctl' },
                { key: 'btn_open',      name: '打开文件按钮',    file: 'open.png',        dir: 'ctl' },
                { key: 'btn_device',    name: '输出设备与 DSP',  file: 'output.png',      dir: 'ctl' },
                { key: 'btn_equalizer', name: '均衡器',          file: 'equalizer.png',   dir: 'ctl' },
                { key: 'btn_rating',    name: '评级',            file: 'rating_3.png',    dir: 'ctl' },
                { key: 'btn_scheduler', name: '电源计划',        file: 'shutdown.png',    dir: 'ctl' }
            ],
            get: function (k) { return g_ctrl.valid ? tsInt(g_ctrl[k], 0) : 0; },
            set: function (k, v) { tsSetControl(k, v ? 1 : 0); }
        });
        R.push(tsHeading('左侧栏设置'));
        R.push(tsStateRow('libwidth', '媒体库左栏宽度', '模式 0 左侧筛选栏（100-900）', 'step', libraryfilter_width,
            null, { step: 10, min: 100, max: 900, format: function (v) { return v + ' px'; } }));
        R.push({
            id: 'libfilter', label: '显示左侧栏菜单（媒体库或筛选器）',
            desc: '关闭后模式 0 的左栏整体隐藏，主区更宽',
            kind: 'toggle',
            get: function () { return libraryfilter_state.isActive() ? 1 : 0; },
            set: function (v) { libraryfilter_state.setValue(v ? 1 : 0); }
        });
        R.push({
            id: 'libstyle', label: '左侧栏菜单样式',
            desc: '树形目录 LibraryTree；筛选面板 LibraryFilter',
            kind: 'choice',
            labels: ['筛选样式', '树形目录'],
            get: function () { return librarytree.isActive() ? 1 : 0; },
            set: function (v) { librarytree.setValue(tsInt(v, 0)); }
        });
        R.push(tsStateRow('plwidth', '播放列表管理器宽度', '模式 1 左侧列表管理器（100-900）', 'step', playlistpanel_width,
            null, { step: 10, min: 100, max: 900, format: function (v) { return v + ' px'; } }));

        R.push(tsHeading('右侧栏设置'));
        R.push(tsStateRow('rightwidth', '右侧栏宽度', '所有模式共用的右侧播放列表（100-900）', 'step', rightplaylist_width,
            null, { step: 10, min: 100, max: 900, format: function (v) { return v + ' px'; } }));
        R.push({
            /* 右栏上方的 TrackInfo（封面 + 属性）。标签顺序 顶部/底部/隐藏，
               对应原始状态 1 / 2 / 0（Eole_layout 的 info 判定同此）。
               读写走 title_bar 的 getTrackInfosState / toggleTrackInfosState，
               和「布局配置 → 右侧播放列表 → 封面、属性」菜单完全同源。 */
            id: 'infopos', label: '曲目详情（封面/属性）位置',
            desc: '右侧栏上方的封面与属性面板；选顶部或底部会自动显示右栏',
            kind: 'choice',
            labels: ['顶部', '底部', '隐藏'],
            get: function () {
                /* 绘制期绝不发通知：没有回传就用本地副本兜底 */
                var raw = 0;
                if (g_ti.valid) raw = tsInt(g_ti.val, 0);
                else { try { var ii = tsClamp(tsInt(main_panel_state.value, 0), 0, 6); raw = tsInt(tsInfoStates()[ii].value, 0); } catch (eIG) { raw = 0; } }
                return (raw === 1) ? 0 : (raw === 2 ? 1 : 2);
            },
            set: function (v) {
                var map = [1, 2, 0];
                tsSetInfo(map[tsClamp(tsInt(v, 0), 0, 2)]);
                g_ts.rows = null;
            }
        });

        R.push(tsHeading('主区内容设置'));
        /* 三个筛选器合并成一行：左侧“筛选器比例”下拉，右侧“左 / 中 / 右”三个文字按钮
           （对应筛选器 1/2/3）。高度项原来单列一行，现在并进这一行。 */
        R.push({
            id: 'filters3', label: '播放列表视图筛选器',
            desc: '左侧下拉是筛选区占播放列表的高度比例，右侧三个按钮依次为左 / 中 / 右',
            kind: 'menu_tri',
            menuPrefix: '筛选器比例',
            menuLabels: ['隐藏', '20%', '30%', '40%', '60%', '满高'],
            labels: ['左', '中', '右'],
            menuGet: function () { return tsInt(filters_panel_state.value, 0); },
            menuSet: function (v) {
                var hv = tsInt(v, 0);
                /* 高度调出来但三个筛选器全关时，会白留一条空带；顺手打开第 1 个 */
                if (hv > 0 && !filter1_state.isActive() && !filter2_state.isActive() && !filter3_state.isActive()) {
                    filter1_state.setValue(1);
                }
                filters_panel_state.setValue(hv);
            },
            get: function (i) {
                var k = ['filter1', 'filter2', 'filter3'][tsClamp(tsInt(i, 0), 0, 2)];
                return panelSetting(k + '_state').isActive() ? 1 : 0;
            },
            set: function (i, v) {
                var k = ['filter1', 'filter2', 'filter3'][tsClamp(tsInt(i, 0), 0, 2)];
                panelSetting(k + '_state').setValue(v ? 1 : 0);
                tsFixFilterSpace();
            }
        });
        /* 第 3 模式（简介歌词）右栏歌词面板：左边是宽度比例下拉（占主区），
           右边是显隐开关。关＝把宽度记下来后置 0，开＝恢复记忆值（默认 50%）。 */
        R.push({
            id: 'lyricsvis', label: '歌词面板比例与开关', desc: '第 3 模式（简介歌词）右侧歌词面板；左侧为歌词宽度比例',
            kind: 'menu_toggle',
            menuPrefix: '歌词宽度比例',
            menuLabels: TS_LYRIC_PCTS,                  /* 下拉选项：20%…铺满 */
            menuGet: function () { return tsLyricPctIndex(); },
            menuSet: function (i) { tsLyricSetPct(tsInt(i, 3)); },
            get: function () { return lyrics_state.isActive() ? 1 : 0; },
            set: function (v) {
                if (v) {
                    var w = tsInt(window.GetProperty(TS_PROP_LYRICW, 5), 5);
                    lyrics_state.setValue(tsClamp(w > 0 ? w : 5, 1, 11));
                } else {
                    var cur = tsInt(lyrics_state.value, 0);
                    if (cur > 0) { try { window.SetProperty(TS_PROP_LYRICW, cur); } catch (eLW) {} }
                    lyrics_state.setValue(0);
                }
            }
        });
        /* MilkDrop：帧率分段器 + 左侧“选择预设…”按钮，原来单列一行的预设项并进来 */
        R.push({
            id: 'mdfps', label: 'MilkDrop帧率与预设',
            desc: '模式和预设由 MilkDrop 面板自己维持；左侧按钮从 samples\\vis\\MilkDrop 选预设',
            kind: 'button_choice',
            button: '选择预设…',
            labels: ['30 fps', '60 fps', '120 fps'],
            get: function () { return tsInt(milkdropfps_state.value, 0); },
            set: function (v) { milkdropfps_state.setValue(tsInt(v, 0)); },
            action: function () { tsPresetMenu(g_ts.mouse.x, g_ts.mouse.y); }
        });

    } else if (g_ts.page === 1) {
        /* ---------- 主题配色：深浅色 + 配色 + 全屏壁纸 ---------- */
        R.push(tsHeading('配色', 0, true));
        R.push({
            id: 'darkall', label: '深色与浅色',
            desc: '与标题栏右上角的明暗切换按钮同源：一处控制四个主区（媒体库 / 播放列表 / 艺术家简介 / 可视化）',
            kind: 'choice',
            labels: ['浅色', '深色'],
            get: function () {
                if (g_dark.valid) return g_dark.val ? 1 : 0;
                return tsAllDarkOn() ? 1 : 0;
            },
            set: function (i) {
                /* 直接点“浅色/深色”，不再靠取反，避免读到的状态陈旧导致只能单向切换 */
                var want = tsInt(i, 0) === 1;
                g_dark.val = want ? 1 : 0;
                g_dark.valid = true;
                tsSetAllDark(want);
            }
        });
        R.push({
            id: 'duifollow', label: '监视 DUI 深浅色',
            desc: '跟随 DUI 的配色自动切换本主题深浅（全屏壁纸菜单里的同一项）',
            kind: 'toggle',
            get: function () { return g_tb.valid ? tsInt(g_tb.duifollow, 0) : 0; },
            set: function (v) { tsSetTitlebar('duifollow', v ? 1 : 0); }
        });
        R.push({
            id: 'ctrlpalette', label: '控制栏配色', desc: '「跟随面板」会随当前模式的深浅走',
            kind: 'choice',
            labels: ['跟随面板', '浅色', '深色'],
            get: function () {
                var v = tsInt(globalProperties.colorsControls, 0);
                if (v === 0 || v === 1) return 1;
                if (v === 2 || v === 3) return 2;
                return 0;
            },
            set: function (i) { tsSetColorsControls([4, 0, 2][tsInt(i, 0)]); }
        });
        R.push(tsHeading('全屏壁纸', 0, true));
        R.push({
            id: 'wallon', label: '启用全屏壁纸', desc: '整窗背景使用壁纸（主菜单「全屏壁纸」的开关）',
            kind: 'toggle',
            get: function () {
                var on = false;
                try { on = !!fw_enabled(); } catch (e0) { on = false; }
                return on ? 1 : 0;
            },
            set: function (v) { tsSetWallEnabled(v); }
        });
        R.push({
            id: 'wallsrc', label: '壁纸来源', desc: '跟随封面 / 本地图片 / 封面优先',
            kind: 'choice',
            labels: ['跟随封面', '本地图片', '封面优先'],
            get: function () {
                var s = 0;
                try { s = tsInt(fw_source(), 0); } catch (e1) { s = 0; }
                return tsClamp(s, 0, 2);
            },
            set: function (v) { tsSetWallSource(v); }
        });
        R.push({
            id: 'wallpick', label: '壁纸图片', desc: '本地图片路径；清空即回默认壁纸',
            kind: 'button', button: '选择图片…',
            get: function () { return 0; }, set: function () {},
            action: function () { tsWallPickImage(); }
        });
        R.push({
            id: 'wallpreset', label: '预置背景', desc: 'img\\Background 下的图片，点选即换',
            kind: 'button', button: '选择预置背景…',
            get: function () { return 0; }, set: function () {},
            action: function () { tsWallPresetMenu(g_ts.mouse.x, g_ts.mouse.y); }
        });
        R.push({
            id: 'wallblur', label: '模糊强度', desc: '全屏壁纸全局项（与主菜单「全屏壁纸」同源），深浅主题各一份',
            kind: 'slider', step: 5, min: 0, max: 90,
            get: function () { return tsClamp(Math.round(fw_blurValue()), 0, 90); },
            set: function (v) { try { fw_setBlur(tsInt(v, 0)); } catch (e2) {} tsFwApply(); },
            format: function (v) { return String(v); }
        });
        R.push({
            id: 'wallmask', label: '蒙版浓度', desc: '全屏壁纸全局项：压在壁纸上的一层底色，越深文字越清楚',
            kind: 'slider', step: 10, min: 0, max: 255,
            /* 读原始属性（fw_maskRaw）：与主菜单同源，不走 fw_maskAlpha() 的 1/3 折算 */
            get: function () { return tsClamp(Math.round(fw_maskRaw()), 0, 255); },
            set: function (v) { try { fw_setMask(tsInt(v, 0)); } catch (e3) {} tsFwApply(); },
            format: function (v) { return String(v); }
        });
        R.push({
            id: 'wallq', label: '壁纸质量', desc: '越高越清晰，显存占用也越大',
            kind: 'choice',
            labels: ['标准', '高 1.5x', '极高 2x'],
            get: function () { return tsClamp(tsInt(fw_quality(), 1), 1, 3) - 1; },
            set: function (v) { tsSetWallQuality(tsInt(v, 0) + 1); }
        });
        R.push({
            id: 'wallrefresh', label: '刷新壁纸', desc: '换过封面或图片后重建一次壁纸',
            kind: 'button', button: '刷新',
            get: function () { return 0; }, set: function () {},
            action: function () {
                try { window.NotifyOthers('fullscreenWallpaperRefit', true); } catch (e4) {}
                window.Repaint();
            }
        });
        R.push({
            kind: 'note',
            text: '提示：壁纸每一项与标题栏右键「全屏壁纸」菜单同源，两边实时同步。'
        });

    } else if (g_ts.page === 2) {
        /* ---------- 封面与缓存 ---------- */
        R.push({
            id: 'mem', label: '内存占用策略', desc: '改动会重载所有面板，请稍等一两秒',
            kind: 'menu',
            labels: ['最小占用', '保留已加载封面', '启动加载所有封面', '启动加载封面与艺术家'],
            get: function () { return tsClamp(tsInt(globalProperties.mem_solicitation, 0), 0, 3); },
            set: function (v) { setMemoryUsageGlobally(tsInt(v, 0)); }
        });
        R.push({
            id: 'coverwidth', label: '封面缓存最大宽度', desc: '越低越省内存；过低封面会发糊',
            kind: 'step', step: 50, min: 100, max: 2000,
            get: function () { return tsInt(globalProperties.coverCacheWidthMax, 400); },
            set: function (v) { setCoverCacheMaxWidthGlobally(tsInt(v, 400)); },
            format: function (v) { return v + ' px'; }
        });
        R.push({
            id: 'thumbwidth', label: '缩略图最大宽度', desc: '列表与艺术家缩略图的上限',
            kind: 'step', step: 25, min: 50, max: 1000,
            get: function () { return tsInt(globalProperties.thumbnailWidthMax, 200); },
            set: function (v) { setGlobalParameter('thumbnailWidthMax', tsInt(v, 200), true); },
            format: function (v) { return v + ' px'; }
        });
        R.push({
            id: 'diskcache', label: '磁盘图像缓存', desc: '基于 %album artist% 与 %album%；关闭后 foobar 可能变慢',
            kind: 'toggle',
            get: function () { return globalProperties.enableDiskCache ? 1 : 0; },
            set: function (v) { tsSetDiskCache(v); }
        });
        R.push({
            id: 'loadcovers', label: '启动时加载所有封面',
            desc: '由「内存占用策略」决定，改策略才会变',
            kind: 'info',
            get: function () { return globalProperties.load_covers_at_startup ? '开启' : '关闭'; }
        });
        R.push({
            id: 'loadartist', label: '启动时加载艺术家图片',
            desc: '由「内存占用策略」决定，改策略才会变',
            kind: 'info',
            get: function () { return globalProperties.load_artist_img_at_startup ? '开启' : '关闭'; }
        });
        R.push({
            id: 'clearcache', label: '下次启动时清空封面缓存',
            desc: '重启后缓存会重新建立；大媒体库第一次会慢一些',
            kind: 'toggle',
            get: function () { return globalProperties.deleteDiskCache ? 1 : 0; },
            set: function (v) { tsSetDeleteCache(v); }
        });
        R.push({
            kind: 'note',
            text: '提示：封面缓存按专辑建立，第一次显示某张封面会稍慢，第二次就快了。'
        });

    } else if (g_ts.page === 3) {
        /* ---------- 窗口外观 ---------- */
        R.push({
            id: 'frame', label: '隐藏原生边框与标题栏',
            desc: '打开为隐藏，由自绘标题栏拖动窗口（主题默认隐藏）',
            kind: 'toggle',
            get: function () { return chromeRead().frame ? 0 : 1; },
            set: function (v) { var s = chromeRead(); s.frame = !v; chromeApply(s); window.Repaint(); }
        });
        R.push({
            id: 'menu', label: '隐藏原生菜单栏',
            desc: '打开为隐藏，菜单仍可从标题栏按钮打开',
            kind: 'toggle',
            get: function () { return chromeRead().menu ? 0 : 1; },
            set: function (v) { var s = chromeRead(); s.menu = !v; chromeApply(s); window.Repaint(); }
        });
        R.push({
            id: 'status', label: '隐藏原生状态栏',
            kind: 'toggle',
            get: function () { return chromeRead().status ? 0 : 1; },
            set: function (v) { var s = chromeRead(); s.status = !v; chromeApply(s); window.Repaint(); }
        });
        R.push({
            id: 'manager', label: '窗口接管方',
            desc: tsOpenhacksOn() ? 'OpenHacks 可在整窗范围内接管伪标题栏' : '未安装 foo_openhacks，只能用 uie_jsplitter',
            kind: 'choice',
            labels: ['uie_jsplitter', 'OpenHacks'],
            get: function () { return chromeRead().manager === 'openhacks' ? 1 : 0; },
            set: function (v) {
                if (tsInt(v, 0) === 1 && !tsOpenhacksOn()) {
                    fb.ShowPopupMessage('没有检测到 foo_openhacks 组件。\n\n' +
                        '装好之后再来这里切换，否则窗口会变成两不管状态。', '窗口接管方');
                    return;
                }
                var s = chromeRead();
                s.manager = (tsInt(v, 0) === 1) ? 'openhacks' : 'jsplitter';
                chromeApply(s);
                window.Repaint();
            }
        });
        R.push({
            kind: 'note',
            text: tsOpenhacksOn()
                ? '提示：接管方切换后会立即重排窗口；如边框没变，点击下方「重载所有面板」。当前版本的 foo_uie_jsplitter 接管无边框时，会导致窗口从任务栏和系统托盘恢复时出现黑块，'
                : '提示：没装 foo_openhacks 时，边框/菜单栏/状态栏由 uie_jsplitter 负责。'
        });
        /* 屏幕显示四项直接跟在上面，不另起分类标题（本页没有分项标题，
           也就不会被折叠隐藏）。与上面的窗口级开关之间拉一条蓝色分割线。 */
        /* 字体样式：只换字体族；字号仍由「全局·字体调整」与屏幕适配决定 */
        R.push({ id: 'font_div', kind: 'divider', h: Math.round(14 * tsK()) });
        R.push({
            id: 'fontmode', label: '字体样式',
            desc: '默认＝微软雅黑 UI（主题内置）；跟随DUI＝用 foobar2000 播放列表字体；自定义＝系统字体对话框里选',
            kind: 'choice',
            labels: ['默认', '跟随DUI', '自定义'],
            get: function () { return tsFontModeGet(); },
            set: function (v) { tsSetFontMode(v); }
        });
        R.push({
            id: 'fontnow', label: '当前字体', kind: 'info',
            desc: '实际生效的字体族与字号；出现「已回退」说明系统里没装所选字体',
            get: function () { return tsFontInfo(); }
        });
        R.push({
            id: 'fontstep', label: '字体大小',
            desc: '与标题栏主菜单「字体大小 → 增大/减小/重置」同源，也等价于 Ctrl+滚轮；作用的是全局·字体调整',
            kind: 'btn3',
            labels: ['减小', '重置', '增大'],
            get: function () { return 0; },          /* 三个都是动作按钮，不显示选中态 */
            set: function (i) { tsFontStepGlobal(i === 0 ? -1 : (i === 1 ? 0 : 1)); }
        });
        R.push({ id: 'dpi_div', kind: 'divider', h: Math.round(16 * tsK()) });
        R.push({
            id: 'dpiinfo', label: '当前屏幕 DPI', kind: 'info',
            desc: '自动档按这个比例换算；手动倍率选了什么就按什么放大',
            get: function () {
                var real = Math.round(tsScreenDpi() / 96 * 100);
                var n = tsInt(window.DPI, 0);
                var head = (isFinite(n) && n > 0)
                    ? (tsScreenDpi() + ' DPI（' + real + '%）')
                    : '未读到 DPI（按 100%）';
                var eff = Math.round(tsScreenScale() * 100);
                return head + (eff !== real ? '　当前按 ' + eff + '% 适配' : '');
            }
        });
        R.push({
            id: 'dpistate', label: '适配状态', kind: 'info',
            desc: '适配会同时改标题栏、控制栏、全主题字号与列表行高',
            get: function () {
                var s = tsDpiSnap();
                if (!s) return '未适配　字号 +' + tsInt(globalProperties.fontAdjustement, 0) + '　行高 ' + tsRowH();
                return '已适配 ×' + (Math.round((s.scale || 1) * 100) / 100) +
                    '　字号 +' + tsInt(globalProperties.fontAdjustement, 0) + '　行高 ' + tsRowH();
            }
        });
        R.push({
            id: 'dpiforce', label: '适配倍率', kind: 'choice',
            desc: '1080P 显示器选 100% 就是原尺寸，想放大就往上选；点选后立即生效',
            labels: ['自动', '100%', '125%', '150%', '175%', '200%'],
            get: function () { return tsDpiForceIndex(); },
            set: function (v) {
                try { window.SetProperty(TS_PROP_DPI_FORCE, tsClamp(tsInt(v, 0), 0, 5)); } catch (eDF) {}
                /* 选完立刻按这一档适配，不用再点「一键适配本屏」 */
                tsDpiApply();
            }
        });
        R.push({
            id: 'dpiapply', label: '一键适配本屏',
            desc: '两行标题栏保持不变，紧凑标题栏升为加宽；控制栏升为加宽；字号与行高按 DPI 同比放大',
            kind: 'button', button: '适配',
            get: function () { return 0; }, set: function () {},
            action: function () { tsDpiApply(); }
        });
        R.push({
            id: 'dpirestore', label: '还原适配前状态',
            desc: '标题栏、控制栏、字号、行高一起退回适配前的值',
            kind: 'button', button: '还原',
            get: function () { return 0; }, set: function () {},
            action: function () { tsDpiRestore(); }
        });
        R.push({
            kind: 'note',
            text: '提示：适配只改标题栏形态、控制栏宽度、全主题字号与列表行高；随时点「还原」退回。'
        });

    } else if (g_ts.page === 4) {
        /* ---------- 组件信息 ---------- */
        R.push({
            id: 'ver', label: '主题版本', kind: 'info',
            get: function () { return 'Eole ' + String(globalProperties.theme_version || '?'); }
        });
        R.push({ id: 'c1', label: 'foo_uie_jsplitter（窗口与脚本）', kind: 'info', get: function () { return tsComponent('foo_uie_jsplitter'); } });
        R.push({ id: 'c2', label: 'foo_ui_webview2（视频面板）', kind: 'info', get: function () { return tsComponent('foo_ui_webview2'); } });
        R.push({ id: 'c3', label: 'foo_uie_eslyric（歌词）', kind: 'info', get: function () { return tsComponent('foo_uie_eslyric'); } });
        R.push({ id: 'c4', label: 'foo_openhacks（窗口接管）', kind: 'info', get: function () { return tsComponent('foo_openhacks'); } });
        R.push({ id: 'c5', label: 'foo_playcount（播放统计）', kind: 'info', get: function () { return tsComponent('foo_playcount'); } });
        R.push({ id: 'prof', label: '配置目录', desc: 'profile 路径', kind: 'info', get: function () { return String(fb.ProfilePath); } });
        R.push({
            kind: 'note',
            text: '提示：模式 5 的画面由 caption 为 video 的 foo_ui_webview2 面板提供，布局里没有这个面板时模式 5 是一片空白。视频画面无声，声音由 foobar2000 播放。'
        });

    } else {
        /* ---------- 维护 ---------- */
        R.push({
            id: 'reload', label: '重载所有面板',
            desc: '先切回媒体库模式，再让所有 JSplitter 面板重新载入脚本',
            kind: 'button', button: '立即重载',
            get: function () { return 0; }, set: function () {},
            action: function () { tsReloadAll(); }
        });
        R.push({
            id: 'opensettings', label: '设置文件夹', desc: '所有状态文件，包括本页的 THEME.cfg',
            kind: 'button', button: '打开',
            get: function () { return 0; }, set: function () {},
            action: function () { tsOpenFolder(SettingsPath); }
        });
        R.push({
            id: 'opentheme', label: '主题文件夹', desc: 'js / img / html',
            kind: 'button', button: '打开',
            get: function () { return 0; }, set: function () {},
            action: function () { tsOpenFolder(skin_global_path); }
        });
        R.push({
            id: 'opencache', label: '封面缓存文件夹', desc: '删掉里面的文件等于重建缓存',
            kind: 'button', button: '打开',
            get: function () { return 0; }, set: function () {},
            action: function () { tsOpenFolder(cover_img_cache); }
        });
        R.push({
            id: 'openprofile', label: '配置文件夹', desc: 'foobar2000 profile',
            kind: 'button', button: '打开',
            get: function () { return 0; }, set: function () {},
            action: function () { tsOpenFolder(fb.ProfilePath); }
        });
        R.push({
            id: 'openmpv', label: 'WebView2 模板目录', desc: 'webview-ui 下的模板，视频面板的 index.html 就放这里',
            kind: 'button', button: '打开',
            get: function () { return 0; }, set: function () {},
            action: function () { tsOpenFolder(fb.ProfilePath + 'webview-ui'); }
        });

        R.push(tsHeading('在线更新'));
        R.push({
            id: 'upd_check', label: '检查更新',
            desc: '对比远端清单，只拉取有变动的文件（Eole 与 Lxbox 两目录）',
            kind: 'button', button: '检查',
            get: function () { return 0; }, set: function () {},
            action: function () { tsUpdateCheck(); }
        });
        R.push({ kind: 'note', text: tsUpdState.msg });
        R.push({
            id: 'upd_apply', label: '立即更新',
            desc: '确认后退出 foobar2000，更新程序等进程退出并重试替换（先整份备份到 _update_backup）',
            kind: 'button', button: '更新',
            get: function () { return 0; }, set: function () {},
            action: function () { tsUpdateApply(); }
        });
        R.push({
            id: 'upd_restart', label: '更新后自动重启',
            desc: '替换完成后自动启动 foobar2000；替换失败或已有实例在跑时不拉起',
            kind: 'toggle',
            get: function () { return tsUpdAutoRestartGet(); },
            set: function (v) { tsUpdAutoRestartSet(v); }
        });
        R.push({
            id: 'upd_log', label: '更新日志与备份',
            desc: '_update_backup\\last_update.log 与按时间戳存放的旧文件',
            kind: 'button', button: '打开',
            get: function () { return 0; }, set: function () {},
            action: function () { tsOpenFolder(fb.ProfilePath + '_update_backup'); }
        });

        R.push(tsHeading('开源地址'));
        R.push({
            id: 'gh_eole_x64', label: 'Eole x64 开源地址',
            desc: 'https://github.com/zjpm-commits/Eole-foobar-theme-x64-chs',
            kind: 'button', button: '打开',
            get: function () { return 0; }, set: function () {},
            action: function () { tsRun('https://github.com/zjpm-commits/Eole-foobar-theme-x64-chs'); }
        });
        R.push({
            id: 'gh_lxbox', label: 'Lxbox 开源地址',
            desc: 'https://github.com/zjpm-commits/foobar-Lxbox-for-jsplitter',
            kind: 'button', button: '打开',
            get: function () { return 0; }, set: function () {},
            action: function () { tsRun('https://github.com/zjpm-commits/foobar-Lxbox-for-jsplitter'); }
        });
        R.push({
            kind: 'note',
            text: '重载只重启面板脚本，不重启 foobar2000；播放不会中断。'
        });
    }

    /* 行高统一 48：两行文字（22+16=38）居中后上下各留 5px，
       开关盒、分段器、步进按钮都在行内居中，不再一行一个高度 */
    for (var i = 0; i < R.length; ++i) {
        if (!R[i].h) R[i].h = tsRowH();
    }

    /* 分区归属：每个 heading 开一个分区（键带页号，避免跨页重名），
       紧跟其后的行都归它；折叠时就整段隐藏，只留标题。 */
    var secIdx = 0, curSec = null, withSec = [];
    for (var k = 0; k < R.length; ++k) {
        if (R[k].kind === 'heading') {
            curSec = 's' + (secIdx++) + '@' + g_ts.page;
            R[k].sec = curSec;
            R[k].id = 'sec_' + curSec;
        } else if (curSec) {
            R[k].sec = curSec;
        }
        withSec.push(R[k]);
    }
    var V = [];
    curSec = null;
    for (var m = 0; m < withSec.length; ++m) {
        var rr = withSec[m];
        if (rr.kind === 'heading') { V.push(rr); curSec = (rr.fold === false ? null : rr.sec); continue; }
        if (curSec && g_ts.collapsed[curSec]) continue;   /* 该分区已折叠 */
        V.push(rr);
    }
    R = V;

    g_ts.rows = R;
    g_ts.rowsPage = g_ts.page;
    return R;
}

function tsRowById(id) {
    var rows = tsRows();
    for (var i = 0; i < rows.length; ++i) if (rows[i].id === id) return rows[i];
    return null;
}

/* ---------------------------------------------------------------- 绘制 */

/* 左栏几行字的实际像素字号：Ctrl+滚轮（本页私有）和「一键适配」的全局字号
   都会改它，间距不能只按 tsK() 算，否则字一大就压在一起。 */
function tsFontPx() {
    var base = 13;
    try { if (typeof g_fsize === 'number' && isFinite(g_fsize)) base = g_fsize; } catch (eFP) { base = 13; }
    return Math.max(9, Math.round(base + tsFontDelta()));
}
function tsNavLineH() {
    return Math.max(Math.round(22 * tsK()), Math.round(tsFontPx() * 1.55));
}
function tsNavY() { return Math.round(18 * tsK()) + tsNavLineH() * 3 + Math.round(8 * tsK()) + Math.round(16 * tsK()); }
function tsNavItemH() { return tsNavLineH() * 2 + Math.round(4 * tsK()); }
/* 右栏标题区高度，同样跟行高走 */
function tsHeaderH() { return Math.round(TS_HEADER_H * tsK()); }

function tsContentRect() {
    var x = tsNavW() + TS_PAD;
    var w = Math.max(1, ww - x - TS_PAD);
    var y = tsHeaderH();
    var h = Math.max(1, wh - y - 12);
    return { x: x, y: y, w: w, h: h };
}

function tsDrawNav(gr, c) {
    /* 左栏不铺任何底色，与右侧内容区一样直接透出壁纸/主题底色；
       只留右侧一条 1px 分隔线，作为栏与内容的界线（这条线可左右拖）。 */
    var nw = tsNavW();
    gr.FillSolidRect(nw - 1, 0, 1, wh, c.rowLine);
    /* 悬停或正在拖动时，分隔线加宽成 3px 并提亮，给一个"可以拖"的提示 */
    if (g_ts.navDrag || tsMouseIn(nw - 4, 0, 8, wh)) {
        gr.FillSolidRect(nw - 2, 0, 3, wh, c.accent);
    }

    var k = tsK();
    var lh = tsNavLineH();
    var pad = Math.round(18 * k);
    var x0 = 22, tw = tsNavW() - 44;

    tsText(gr, 'Eole', tsFont('min1'), c.sub, x0, pad, tw, lh, DT_LEFT | DT_VCENTER);
    tsText(gr, '主题设置', tsFont('boldplus1'), c.text, x0, pad + lh, tw, lh, DT_LEFT | DT_VCENTER);
    tsText(gr, 'v' + String(globalProperties.theme_version || ''), tsFont('min2'), c.sub2,
        x0, pad + lh * 2, tw, lh, DT_LEFT | DT_VCENTER);

    gr.FillSolidRect(x0, pad + lh * 3 + Math.round(8 * k), tw, 1, c.rowLine);

    var y = tsNavY();
    for (var i = 0; i < TS_PANES.length; ++i) {
        var p = TS_PANES[i];
        var active = (i === g_ts.page);
        /* 全透明面板：选中项不铺任何底色/遮罩，只靠文字色与字重区分；
           选中标题用 c.on（与分段按钮选中块、开关"开"同色），
           未选中标题保持最开始的正文色（浅色主题即近黑）。 */
        tsText(gr, p.title, active ? tsFont('bold') : tsFont('normal'),
            active ? c.on : c.text, x0, y, tw, lh, DT_LEFT | DT_VCENTER);
        tsText(gr, p.sub, tsFont('min2'), active ? c.sub : c.sub2,
            x0, y + lh, tw, lh, DT_LEFT | DT_VCENTER);
        y += tsNavItemH();
    }
}

function tsDrawHeader(gr, c) {
    var page = TS_PANES[g_ts.page];
    if (!page) return;
    var k = tsK();
    var x = tsNavW() + TS_PAD;
    var w = Math.max(1, ww - x - TS_PAD);
    var lh = tsNavLineH();

    /* 右上角「退出设置」：Fluent EB96 图标 + 四字文案，热区包住两者，
       点文字和点图标都能退出；文案在图标左侧，避免顶到窗口右边 */
    var bs = Math.max(18, Math.round(24 * k));
    var by = Math.round(16 * k) + Math.round((lh * 2 - bs) / 2);
    var ef = tsMdl2Icon(Math.max(13, Math.round(bs * 0.72)));
    var lf = null;
    try { lf = tsFont('min1'); } catch (eLF) { lf = null; }
    var exitLabel = '退出设置';
    var gap = Math.round(6 * k);
    var lw = (lf && ef) ? tsTextW(gr, exitLabel, lf) : 0;
    var bx = ww - TS_PAD - bs;
    var totalW = bs + (lw > 0 ? gap + lw : 0);
    g_ts.exitBtn = { x: ww - TS_PAD - totalW, y: by, w: totalW, h: bs };

    /* 标题要让出整块按钮的宽度，否则长标题会压到「退出设置」上 */
    var tw = Math.max(1, w - totalW - Math.round(8 * k));
    tsText(gr, page.title, tsFont('boldplus1'), c.text, x, Math.round(16 * k), tw, lh, DT_LEFT | DT_VCENTER);
    tsText(gr, page.sub, tsFont('min1'), c.sub, x, Math.round(16 * k) + lh, tw, lh, DT_LEFT | DT_VCENTER);
    gr.FillSolidRect(x, tsHeaderH() - Math.round(8 * k), w, 1, c.rowLine);

    var exCol = g_ts.exitHot ? c.accent : c.sub;
    if (lw > 0) {
        tsText(gr, exitLabel, lf, exCol, bx - gap - lw, by, lw, bs, DT_RIGHT | DT_VCENTER | DT_NOPREFIX);
    }
    if (ef) {
        tsText(gr, '\uEB96', ef, exCol, bx, by, bs, bs, DT_CENTER | DT_VCENTER | DT_NOPREFIX);
    }
}

function tsDrawRows(gr, c) {
    var cr = tsContentRect();
    var rows = tsRows();
    var totalH = 0;
    for (var n = 0; n < rows.length; ++n) totalH += rows[n].h;

    /* 先算总高度并把滚动量夹回合法范围，再画；否则画完才发现越界，
       这一帧的命中区和显示会对不上（切换页面后常见）。 */
    g_ts.contentH = totalH + 8;
    if (g_ts.contentH <= cr.h) g_ts.scroll = 0;
    else if (g_ts.scroll > g_ts.contentH - cr.h) g_ts.scroll = g_ts.contentH - cr.h;
    if (g_ts.scroll < 0) g_ts.scroll = 0;

    var y = cr.y - g_ts.scroll;
    g_ts.hits = [];

    try { gr.PushClip(cr.x - TS_PAD, cr.y, cr.w + TS_PAD * 2, cr.h); } catch (eClip) {}

    for (var i = 0; i < rows.length; ++i) {
        var row = rows[i];
        var visible = (y + row.h > cr.y) && (y < cr.y + cr.h);
        if (visible) tsDrawRow(gr, c, row, cr, y);
        y += row.h;
    }

    try { gr.PopClip(); } catch (eClip2) {}

    tsDrawScrollbar(gr, c, cr);
}

function tsDrawRow(gr, c, row, cr, y) {
    if (row.kind === 'heading') {
        /* 分类标题：可点击折叠（fold !== false）；主题配色页的分项标题不折叠，
           只当普通分段标题画，不带箭头也不响应点击。 */
        var canFold = (row.fold !== false);
        var hKey = row.sec || row.id;
        var folded = canFold && !!g_ts.collapsed[hKey];
        /* 分类标题悬停也不铺底色 */
        var ar = tsMdl2Small();
        if (canFold && ar) {
            tsText(gr, folded ? '\uE76C' : '\uE70D', ar, c.sub,
                cr.x, y, 14, row.h, DT_CENTER | DT_VCENTER | DT_NOPREFIX);
        }
        tsText(gr, row.text, tsFont('normal'), c.accent, cr.x + (canFold ? 16 : 2), y, cr.w - (canFold ? 16 : 2), row.h,
            DT_LEFT | DT_VCENTER | DT_NOPREFIX);
        gr.FillSolidRect(cr.x, y + row.h - 1, cr.w, 1, c.rowLine);
        if (row.id && canFold) g_ts.hits.push({ id: row.id, y: y, h: row.h, ctrl: null, kind: 'heading' });
        return;
    }

    if (row.kind === 'divider') {
        /* 分割线：整行只画一条强调色横线，不带标签、不参与点击
           （h 由行对象给定，通常只占十几像素留白） */
        var dy = y + Math.floor(row.h / 2);
        gr.FillSolidRect(cr.x, dy, cr.w, Math.max(1, Math.round(tsK())), c.on);
        return;
    }

    /* 行悬停不再铺底色（面板全透明，与其他子面板一致） */
    if (row.kind !== 'note') {
        gr.FillSolidRect(cr.x, y + row.h - 1, cr.w, 1, c.rowLine);
    }

    if (row.kind === 'note') {
        tsText(gr, row.text, tsFont('min1'), c.sub, cr.x, y + 8, cr.w, row.h - 10,
            DT_LEFT | DT_TOP | DT_WORDBREAK | DT_NOPREFIX);
        return;
    }

    var geo = tsDrawControl(gr, c, row, cr, y);

    var ctrlW = geo ? geo.w : 0;
    var labelW = Math.max(120, cr.w - ctrlW - 28);
    if (row.kind === 'info') labelW = Math.round(cr.w * 0.44);

    if (row.desc) {
        /* 标签两行（标题 + 说明）整块在行内垂直居中；行高不同（开关行 60）也居中 */
        var lk = tsK();
        var lh1 = Math.round(22 * lk), lh2 = Math.round(16 * lk);
        var lh = lh1 + lh2;
        var ly = y + Math.max(0, Math.round((row.h - lh) / 2));
        tsText(gr, row.label, tsFont('normal'), c.text, cr.x, ly, labelW, lh1,
            DT_LEFT | DT_VCENTER | DT_NOPREFIX | DT_END_ELLIPSIS);
        tsText(gr, row.desc, tsFont('min2'), c.sub, cr.x, ly + lh1, labelW, lh2,
            DT_LEFT | DT_TOP | DT_NOPREFIX | DT_END_ELLIPSIS);
    } else {
        tsText(gr, row.label, tsFont('normal'), c.text, cr.x, y, labelW, row.h,
            DT_LEFT | DT_VCENTER | DT_NOPREFIX | DT_END_ELLIPSIS);
    }

    if (row.kind === 'info') {
        var val = '';
        try { val = String(row.get ? row.get() : ''); } catch (eInfo) { val = ''; }
        tsText(gr, val, tsFont('min1'), c.value, cr.x + Math.round(cr.w * 0.44),
            y, Math.round(cr.w * 0.56), row.h,
            DT_RIGHT | DT_VCENTER | DT_NOPREFIX | DT_END_ELLIPSIS);
    }

    if (row.id) g_ts.hits.push({ id: row.id, y: y, h: row.h, ctrl: geo, kind: row.kind });
}

/* 分段器（顶部/底部/隐藏 这类多选一） */
function tsDrawSegs(gr, c, row, right, y) {
    var k = tsK();
    var labels = row.labels || [];
    var widths = [], total = 0, i;
    for (i = 0; i < labels.length; ++i) {
        var tw = Math.round(tsTextW(gr, labels[i], tsFont('min1'))) + Math.round(22 * k);
        widths.push(tw);
        total += tw + Math.round(2 * k);
    }
    total -= Math.round(2 * k);
    var x = right - total;
    var ch = Math.round(28 * k);
    var cy = y + Math.round((row.h - ch) / 2);
    var segs = [];
    var cur = 0;
    try { cur = tsInt(row.get(), 0); } catch (eC) { cur = 0; }
    for (i = 0; i < labels.length; ++i) {
        var sw = widths[i];
        var active = (cur === i);
        var hov = tsMouseIn(x, cy, sw, ch);
        /* 选中段用 c.on（与开关"开"同色）+ 反白文字；悬停沿用 ctrlBgHover */
        var bg = active ? c.on : (hov ? c.ctrlBgHover : c.ctrlBg);
        gr.FillSolidRect(x, cy, sw, ch, bg);
        tsText(gr, labels[i], tsFont('min1'), active ? c.accentText : c.text,
            x, cy, sw, ch, DT_CENTER | DT_VCENTER | DT_NOPREFIX);
        segs.push({ x: x, w: sw, i: i });
        x += sw + Math.round(2 * k);
    }
    return { x: right - total, y: cy, w: total, h: ch, segs: segs };
}

/* 三个文字按钮（左/中/右），返回各自可点矩形 */
function tsDrawTriButtons(gr, c, row, right, y, kt) {
    var lblT = (row.labels && row.labels.length === 3) ? row.labels : ['左', '中', '右'];
    var slotH = Math.round(28 * kt), gapT = Math.round(2 * kt);
    var slotW = 0;
    for (var wt = 0; wt < 3; ++wt) {
        var twt = Math.round(tsTextW(gr, lblT[wt], tsFont('min1'))) + Math.round(22 * kt);
        if (twt > slotW) slotW = twt;
    }
    var totT = slotW * 3 + gapT * 2;
    var sxT = right - totT;
    var syT = y + Math.round((row.h - slotH) / 2);
    var items = [];
    for (var it = 0; it < 3; ++it) {
        var ix = sxT + it * (slotW + gapT);
        var onT = false;
        try { onT = !!row.get(it); } catch (eGT) { onT = false; }
        var hovT = tsMouseIn(ix, syT, slotW, slotH);
        gr.FillSolidRect(ix, syT, slotW, slotH, onT ? c.on : (hovT ? c.ctrlBgHover : c.ctrlBg));
        tsText(gr, lblT[it], tsFont('min1'), onT ? c.accentText : c.text,
            ix, syT, slotW, slotH, DT_CENTER | DT_VCENTER | DT_NOPREFIX);
        items.push({ x: ix, y: syT, w: slotW, h: slotH, i: it });
    }
    return { x: sxT, y: syT, w: totT, h: slotH, items: items };
}

/* 迷你下拉（窄盒）+ 可选左侧前缀文字，返回盒子矩形和整块的左边界 */
function tsDrawMiniMenu(gr, c, row, rightX, y) {
    var k = tsK();
    var mw = Math.round(78 * k), bh = Math.round(30 * k);
    var bx = rightX - mw, by = y + Math.round((row.h - bh) / 2);
    var cur = 0;
    try { cur = tsInt(row.menuGet(), 0); } catch (eMC) { cur = 0; }
    var lab = (row.menuLabels && row.menuLabels[cur] !== undefined) ? row.menuLabels[cur] : '';
    var hov = tsMouseIn(bx, by, mw, bh);
    gr.FillSolidRect(bx, by, mw, bh, hov ? c.ctrlBgHover : c.ctrlBg);
    gr.DrawRect(bx, by, mw - 1, bh - 1, 1.0, hov ? c.accent : c.ctrlBorder);
    tsText(gr, lab, tsFont('min1'), c.text, bx + 10, by, mw - 30, bh,
        DT_LEFT | DT_VCENTER | DT_NOPREFIX | DT_END_ELLIPSIS);
    tsText(gr, '\u25BE', tsFont('min1'), c.sub, bx + mw - 20, by, 12, bh,
        DT_CENTER | DT_VCENTER | DT_NOPREFIX);
    var left = bx;
    if (row.menuPrefix) {
        var pw = Math.round(tsTextW(gr, row.menuPrefix, tsFont('min1'))) + Math.round(10 * k);
        tsText(gr, row.menuPrefix, tsFont('min1'), c.sub, bx - pw, by, pw - Math.round(6 * k), bh,
            DT_RIGHT | DT_VCENTER | DT_NOPREFIX);
        left = bx - pw;
    }
    return { left: left, menu: { x: bx, y: by, w: mw, h: bh } };
}

/* ---- 图标条：标题栏 / 控制栏按钮的整排预览 ----
   图标直接用主题自己的 PNG（标题栏在 img\icons\<配色>\，控制栏在 img\controls_<配色>\），
   所以预览和真实按钮长得一样。缓存按“配色+文件名”分开，切深浅时整体清空。 */
var g_ts_iconCache = {};
function tsIconCacheClear() { g_ts_iconCache = {}; }

function tsIconImage(it) {
    /* 只用常态素材、只按当前深浅取配色：设置页图标条不做悬停换图，也不再有蓝底，
       所以原 hover / onBlue 两个分支是死代码，已删 */
    var f = it.file || '';
    var dir = (it.dir === 'ctl') ? 'ctl' : 'tb';
    var useLight = tsIsDark();
    var key = dir + '|' + f + '|' + (useLight ? 'L' : 'D');
    if (g_ts_iconCache[key] !== undefined) return g_ts_iconCache[key];
    var base = '';
    try { base = theme_img_path; } catch (e0) { base = ''; }
    /* 先需要的配色，缺图再退另一套（同一图标两套配色形状一致，只是白/黑） */
    var paths = (dir === 'ctl')
        ? (useLight ? [base + '\\controls_Dark\\', base + '\\controls_Light\\']
                    : [base + '\\controls_Light\\', base + '\\controls_Dark\\'])
        : (useLight ? [base + '\\icons\\white\\', base + '\\icons\\']
                    : [base + '\\icons\\', base + '\\icons\\white\\']);
    var img = null;
    for (var i = 0; i < paths.length && !img; ++i) {
        try {
            var im = gdi.Image(paths[i] + f);
            if (im && im.Width > 0) img = im;
        } catch (e1) {}
    }
    g_ts_iconCache[key] = img;
    return img;
}

/* 画右侧控件，返回可点区域（含 choice 的分段、step 的加减） */
function tsDrawControl(gr, c, row, cr, y) {
    var right = cr.x + cr.w;

    if (row.kind === 'choice') {
        var sg = tsDrawSegs(gr, c, row, right, y);
        return { x: sg.x, y: sg.y, w: sg.w, h: sg.h, type: 'segs', segs: sg.segs };

    } else if (row.kind === 'button_choice') {
        /* 左：动作按钮（如“选择预设…”）；右：分段器。同一行两件套 */
        var sg2 = tsDrawSegs(gr, c, row, right, y);
        var kb2 = tsK();
        var bw2 = Math.round(tsTextW(gr, row.button || '', tsFont('min1'))) + Math.round(30 * kb2);
        var bh2 = Math.round(28 * kb2);
        var bx2 = sg2.x - Math.round(14 * kb2) - bw2;
        var by2 = y + Math.round((row.h - bh2) / 2);
        var bHov = tsMouseIn(bx2, by2, bw2, bh2);
        /* 动作按钮不带选中态，与“刷新”等按钮同一套观感 */
        gr.FillSolidRect(bx2, by2, bw2, bh2, bHov ? c.ctrlBgHover : c.ctrlBg);
        gr.DrawRect(bx2, by2, bw2 - 1, bh2 - 1, 1.0, bHov ? c.accent : c.ctrlBorder);
        tsText(gr, row.button || '', tsFont('min1'), c.value, bx2, by2, bw2, bh2,
            DT_CENTER | DT_VCENTER | DT_NOPREFIX | DT_END_ELLIPSIS);
        return {
            x: bx2, y: sg2.y, w: (right - bx2), h: sg2.h, type: 'buttonSegs',
            button: { x: bx2, y: by2, w: bw2, h: bh2 }, segs: sg2.segs
        };

    } else if (row.kind === 'menu') {
        var mw = Math.min(230, Math.max(140, Math.round(cr.w * 0.42)));
        var mx = right - mw;
        var mh = Math.round(30 * tsK());
        var my = y + Math.round((row.h - mh) / 2);
        var mHover = tsMouseIn(mx, my, mw, mh);
        gr.FillSolidRect(mx, my, mw, mh, mHover ? c.ctrlBgHover : c.ctrlBg);
        gr.DrawRect(mx, my, mw - 1, mh - 1, 1.0, mHover ? c.accent : c.ctrlBorder);
        var label = '';
        try {
            var mi = tsInt(row.get(), 0);
            label = (row.labels && row.labels[mi] !== undefined) ? row.labels[mi] : '';
        } catch (eM) { label = ''; }
        tsText(gr, label, tsFont('min1'), c.text, mx + 12, my, mw - 36, mh,
            DT_LEFT | DT_VCENTER | DT_NOPREFIX | DT_END_ELLIPSIS);
        tsText(gr, '\u25BE', tsFont('min1'), c.sub, mx + mw - 24, my, 16, mh,
            DT_CENTER | DT_VCENTER | DT_NOPREFIX);
        return { x: mx, y: my, w: mw, h: mh, type: 'menu' };

    } else if (row.kind === 'step') {
        var kk = tsK();
        var bw = Math.round(28 * kk), vw = Math.round(78 * kk);
        var gap = Math.round(4 * kk), chh = Math.round(28 * kk);
        var tot = bw + gap + vw + gap + bw;
        var sx = right - tot;
        var sy = y + Math.round((row.h - chh) / 2);
        var minus = { x: sx, y: sy, w: bw, h: chh };
        var plus = { x: sx + bw + gap + vw + gap, y: sy, w: bw, h: chh };
        gr.FillSolidRect(minus.x, sy, bw, chh, tsMouseIn(minus.x, sy, bw, chh) ? c.ctrlBgHover : c.ctrlBg);
        tsText(gr, '\u2212', tsFont('plus1'), c.text, minus.x, sy, bw, chh, DT_CENTER | DT_VCENTER | DT_NOPREFIX);
        gr.FillSolidRect(sx + bw + gap, sy, vw, chh, c.ctrlBg);
        var txt = '';
        try {
            var sv = tsInt(row.get(), 0);
            txt = row.format ? row.format(sv) : String(sv);
        } catch (eS) { txt = ''; }
        tsText(gr, txt, tsFont('min1'), c.value, sx + bw + gap, sy, vw, chh,
            DT_CENTER | DT_VCENTER | DT_NOPREFIX | DT_END_ELLIPSIS);
        gr.FillSolidRect(plus.x, sy, bw, chh, tsMouseIn(plus.x, sy, bw, chh) ? c.ctrlBgHover : c.ctrlBg);
        tsText(gr, '+', tsFont('plus1'), c.text, plus.x, sy, bw, chh, DT_CENTER | DT_VCENTER | DT_NOPREFIX);
        return { x: sx, y: sy, w: tot, h: chh, type: 'step', minus: minus, plus: plus };

    } else if (row.kind === 'slider') {
        /* 连续调节类（模糊强度 / 蒙版浓度）：右侧数值 + 一条滑轨 + 圆钮。
           拖动过程中只走 tsSliderPend，松手或停顿才真正写属性，
           避免每像素都触发一次壁纸重建。 */
        var ks = tsK();
        var vw3 = Math.round(54 * ks);
        var gap3 = Math.round(12 * ks);
        var trackW = Math.round(200 * ks);
        var maxTrackW = Math.max(Math.round(90 * ks), cr.w - vw3 - gap3 - Math.round(120 * ks));
        if (trackW > maxTrackW) trackW = maxTrackW;
        var hitH = Math.round(22 * ks);
        var tot3 = vw3 + gap3 + trackW;
        var sx3 = right - tot3;
        var sy3 = y + Math.round((row.h - hitH) / 2);
        var trackH = Math.round(6 * ks);
        var trackY = sy3 + Math.round((hitH - trackH) / 2);
        /* 圆钮改成竖长条方块：FillEllipse 在 1x 缩放下的抗锯齿很差，
           边缘锯齿明显，实心矩形反倒是齐边的。 */
        var knobW = Math.round(10 * ks), knobH = Math.round(18 * ks);

        var min3 = (row.min !== undefined) ? Number(row.min) : 0;
        var max3 = (row.max !== undefined) ? Number(row.max) : 100;
        if (max3 <= min3) max3 = min3 + 1;
        var cur3 = tsSliderCur(row);
        var t3 = tsClamp((cur3 - min3) / (max3 - min3), 0, 1);

        var valTxt = row.format ? row.format(cur3) : String(cur3);
        tsText(gr, valTxt, tsFont('min1'), c.value, sx3, sy3, vw3, hitH,
            DT_RIGHT | DT_VCENTER | DT_NOPREFIX | DT_END_ELLIPSIS);

        var trackX = sx3 + vw3 + gap3;
        /* 轨道底槽 + 已填段（已填段左侧起画，到钮为止，不再用圆角） */
        gr.FillSolidRect(trackX, trackY, trackW, trackH, c.ctrlBg);
        var fillW = Math.round((trackW - 1) * t3);
        if (fillW > 0) gr.FillSolidRect(trackX, trackY, fillW, trackH, c.accent);

        var kx = trackX + Math.round((trackW - knobW) * t3);
        var ky = sy3 + Math.round((hitH - knobH) / 2);
        /* 颜色与滑轨已填段一致（c.accent），不再描边，避免看起来像另一个控件 */
        gr.FillSolidRect(kx, ky, knobW, knobH, c.accent);

        return {
            x: trackX - Math.round(8 * ks), y: sy3,
            w: trackW + Math.round(16 * ks), h: hitH,
            type: 'slider', trackX: trackX, trackW: trackW,
            min: min3, max: max3
        };

    } else if (row.kind === 'menu_tri') {
        /* 一行：左侧比例下拉 + 右侧三个文字按钮（筛选器 左/中/右） */
        var kt = tsK();
        var lblT = (row.labels && row.labels.length === 3) ? row.labels : ['左', '中', '右'];
        var tri = tsDrawTriButtons(gr, c, row, right, y, kt);
        var mm = tsDrawMiniMenu(gr, c, row, tri.x - Math.round(16 * kt), y);
        return {
            x: mm.left, y: Math.min(mm.menu.y, tri.y),
            w: (right - mm.left), h: Math.max(mm.menu.h, tri.h),
            type: 'menuTri', menu: mm.menu, items: tri.items
        };

    } else if (row.kind === 'btn3') {
        /* 一行三个动作按钮（字体大小：减小 / 重置 / 增大），复用 menu_tri 的三段绘制 */
        var tri3 = tsDrawTriButtons(gr, c, row, right, y, tsK());
        return { x: tri3.x, y: tri3.y, w: tri3.w, h: tri3.h, type: 'btn3', items: tri3.items };
    
    } else if (row.kind === 'menu_toggle') {
        /* 左：比例下拉（带宽窄的前缀文字）；右：开关。两个子控件互不重叠 */
        var km = tsK();
        var tw2 = Math.round(100 * km), th2 = Math.round(42 * km);
        var tx2 = right - tw2;
        var ty2 = y + Math.round((row.h - th2) / 2);
        var on2 = false;
        try { on2 = !!row.get(); } catch (eO2) { on2 = false; }
        var g2 = tsMdl2Font();
        var gc2 = on2 ? c.on : (tsMouseIn(tx2, ty2, tw2, th2) ? c.text : c.sub);
        if (g2) tsText(gr, on2 ? '\uF19F' : '\uF19E', g2, gc2,
            tx2, ty2, tw2, th2, DT_CENTER | DT_VCENTER | DT_SINGLELINE);

        var mm2 = tsDrawMiniMenu(gr, c, row, tx2 - Math.round(16 * km), y);
        return {
            x: mm2.left, y: Math.min(mm2.menu.y, ty2),
            w: (tx2 + tw2) - mm2.left, h: Math.max(mm2.menu.h, th2),
            type: 'menuToggle', menu: mm2.menu,
            toggle: { x: tx2, y: ty2, w: tw2, h: th2 }
        };

    } else if (row.kind === 'iconbar') {
        /* 整排图标：选中＝同色实心底+浅色图标，未选中＝无底+图标半透明。
           图标按原始像素 1:1 绘制（缩放会发虚），格子大小由该行图标的实际尺寸决定；
           窗口窄时只压格子间距，绝不缩图标。 */
        var ki = tsK();
        var list = row.icons || [];
        var n = list.length;
        if (!n) return null;
        var padI = Math.round(6 * ki);
        /* 该行图标的最大原始边（取常态与悬停两套里大的那个，保证格子够放） */
        var maxI = Math.round(22 * ki);
        for (var m0 = 0; m0 < n; ++m0) {
            var itM = list[m0] || {};
            var iM1 = tsIconImage(itM);
            var iM2 = tsIconImage(itM);
            if (iM1) maxI = Math.max(maxI, iM1.Width, iM1.Height);
            if (iM2) maxI = Math.max(maxI, iM2.Width, iM2.Height);
        }
        var cell = maxI + padI * 2;
        var gapI = padI;
        var avail = Math.max(Math.round(90 * ki), cr.w - Math.round(140 * ki));
        var totI = cell * n + gapI * (n - 1);
        if (totI > avail && n > 1) {
            gapI = Math.floor((avail - cell * n) / (n - 1));
            if (gapI < 1) gapI = 1;
            totI = cell * n + gapI * (n - 1);
        }
        var sxI = right - totI;
        var syI = y + Math.round((row.h - cell) / 2);
        var items = [];
        for (var ii = 0; ii < n; ++ii) {
            var it = list[ii] || {};
            var ixI = sxI + ii * (cell + gapI);
            var onI = false;
            try { onI = !!row.get(it.key); } catch (eGi) { onI = false; }
            var hovI = tsMouseIn(ixI, syI, cell, cell);

            /* 选中不再铺整块蓝底，改成图标下方一条蓝色下划线；
               两排都不铺悬停底色（这里只是展示开关状态，不体现悬停效果） */
            /* 一律用常态素材：设置页只做状态展示，不体现悬停效果
               （_hover 那套 PNG 还自带淡灰圆底，避免带进来） */
            var img = tsIconImage(it);
            if (img) {
                /* 1:1 原始像素居中，不做任何缩放 */
                try {
                    gr.DrawImage(img, ixI + Math.floor((cell - img.Width) / 2),
                        syI + Math.floor((cell - img.Height) / 2),
                        img.Width, img.Height, 0, 0, img.Width, img.Height, 0, onI ? 255 : 150);
                } catch (eDI) {}
            } else {
                /* 缺图兜底：画个虚框占位，仍然可点 */
                gr.DrawRect(ixI + padI, syI + padI, cell - padI * 2, cell - padI * 2, 1.0, c.ctrlBorder);
            }
            /* 选中态：图标下方一条蓝色下划线（宽度随图标，收在行内不越界） */
            if (onI) {
                var lwI = img ? Math.min(cell - padI * 2, img.Width) : cell - padI * 2;
                if (lwI < Math.round(10 * ki)) lwI = Math.round(10 * ki);
                var lyI = Math.min(y + row.h - Math.round(3 * ki), syI + cell);
                gr.FillSolidRect(ixI + Math.floor((cell - lwI) / 2), lyI, lwI,
                    Math.max(2, Math.round(2 * ki)), c.on);
            }
            items.push({ x: ixI, y: syI, w: cell, h: cell, key: it.key, name: it.name, on: onI });
        }
        return { x: sxI, y: syI, w: totI, h: cell, type: 'icons', items: items };

    } else if (row.kind === 'toggle') {
        /* 开关改用 Segoe Fluent Icons 字形绘制（打开 U+F19F / 关闭 U+F19E）。
           字形是字体渲染的矢量路径，圆滑无锯齿，替代原来的
           FillRoundRect + FillEllipse 组合。 */
        /* 字形 36 号配 48 行高：盒 100x42，可见图形约 25px，上下各留 3px */
        var kk2 = tsK();
        var tw = Math.round(100 * kk2), th = Math.round(42 * kk2);
        var tx = right - tw;
        var ty = y + Math.round((row.h - th) / 2);
        var on = false;
        try { on = !!row.get(); } catch (eT) { on = false; }
        var tHover = tsMouseIn(tx, ty, tw, th);
        var mf = tsMdl2Font();
        var glyph = on ? '\uF19F' : '\uF19E';
        var gcol = on ? c.on : (tHover ? c.text : c.sub);
        if (mf) {
            tsText(gr, glyph, mf, gcol, tx, ty, tw, th, DT_CENTER | DT_VCENTER | DT_SINGLELINE);
        } else {
            /* 图标字体不可用时的退路：老画法 */
            var bgc = on ? c.on : c.pillBg;
            try { gr.FillRoundRect(tx, ty, tw, th, th, th, bgc); }
            catch (eR) { gr.FillSolidRect(tx, ty, tw, th, bgc); }
            var kd = th - 6;
            var kx = on ? (tx + tw - kd - 3) : (tx + 3);
            gr.FillEllipse(kx, ty + 3, kd, kd, c.knob);
        }
        return { x: tx, y: ty, w: tw, h: th, type: 'toggle' };

    } else if (row.kind === 'button') {
        var btxt = row.button || '打开';
        var bwd = Math.max(90, Math.round(tsTextW(gr, btxt, tsFont('min1'))) + 34);
        var bx = right - bwd;
        var bh = Math.round(30 * tsK());
        var by = y + Math.round((row.h - bh) / 2);
        var bHover = tsMouseIn(bx, by, bwd, bh);
        gr.FillSolidRect(bx, by, bwd, bh, bHover ? c.ctrlBgHover : c.ctrlBg);
        gr.DrawRect(bx, by, bwd - 1, bh - 1, 1.0, bHover ? c.accent : c.ctrlBorder);
        tsText(gr, btxt, tsFont('min1'), c.text, bx, by, bwd, bh,
            DT_CENTER | DT_VCENTER | DT_NOPREFIX);
        return { x: bx, y: by, w: bwd, h: bh, type: 'button' };
    }

    return { x: right, y: y, w: 0, h: row.h, type: 'none' };
}

/* 滚动条滑块几何（绘制、命中、拖动共用同一份，避免三处各算一套导致对不上） */
function tsScrollGeom(cr) {
    var k = tsK();
    var wN = Math.max(3, Math.round(cScrollBar.normalWidth * k));
    var wH = Math.max(wN + 2, Math.round(cScrollBar.hoverWidth * k));
    var hot = !!g_ts.sbHot || g_ts.scrollDrag;
    var w = hot ? wH : wN;
    var minH = Math.round(cScrollBar.defaultMinCursorHeight * k);
    var thumbH = Math.max(minH, Math.round(cr.h * cr.h / g_ts.contentH));
    var max = Math.max(1, g_ts.contentH - cr.h);
    var thumbY = cr.y + Math.round((cr.h - thumbH) * (g_ts.scroll / max));
    var mg = Math.round(cScrollBar.marginTop * k);
    if (mg > 0) { thumbY += mg; thumbH = Math.max(8, thumbH - mg * 2); }
    return { w: w, h: thumbH, y: thumbY, hot: hot };
}

function tsDrawScrollbar(gr, c, cr) {
    if (g_ts.contentH <= cr.h) return;
    /* 样式对齐 smoothplaylist 的上下滚动条：只画滑块、不铺轨道底；
       常态细条贴右，悬停变粗向右长，拖拽时最粗（宽度/最小高取全局 cScrollBar 常量）。 */
    var gm = tsScrollGeom(cr);
    var hot = gm.hot;
    /* 颜色沿用本页调色板：全局 colors.scrollbar_* 在本面板可能取到 undefined，
       直接交给 FillSolidRect 会什么都画不出来（滚动条看起来就消失了） */
    var col = c.ctrlBorder;
    if (hot || g_ts.scrollDrag) col = c.sub;
    gr.FillSolidRect(ww - gm.w, gm.y, gm.w, gm.h, col);
}

/* ---------------------------------------------------------------- 点击/滚动 */

function tsNavAt(x, y) {
    if (x < 0 || x >= tsNavW()) return -1;
    var top = tsNavY(), hgt = tsNavItemH();
    if (y < top) return -1;
    var idx = Math.floor((y - top) / hgt);
    return (idx >= 0 && idx < TS_PANES.length) ? idx : -1;
}

function tsSetPage(i) {
    i = tsClamp(tsInt(i, 0), 0, TS_PANES.length - 1);
    if (i === g_ts.page) return;
    g_ts.page = i;
    g_ts.rows = null;
    g_ts.scroll = 0;
    g_ts.rowHover = '';
    g_ts.hoverKey = '';
    /* 进入布局页时向控制栏 / 标题栏问一次状态（同步应答） */
    if (i === 0) { tsQueryControl(); tsQueryTitlebar(); tsQueryInfo(); }
    if (i === 1) { tsQueryTitlebar(); }
    tsSavePage();
    window.Repaint();
}

function tsHitAt(x, y) {
    var cr = tsContentRect();
    if (x < cr.x - 4 || x > cr.x + cr.w + 4) return null;
    if (y < cr.y || y > cr.y + cr.h) return null;
    for (var i = 0; i < g_ts.hits.length; ++i) {
        var h = g_ts.hits[i];
        if (y >= h.y && y < h.y + h.h) return h;
    }
    return null;
}

function tsHitControl(hit, x, y) {
    if (!hit || !hit.ctrl || hit.ctrl.type === 'none') return false;
    var c = hit.ctrl;
    /* 分段器左右各放宽 8px、上下各放宽 4px，点在边缘/空隙也认 */
    if (c.type === 'segs') return (x >= c.x - 8 && x < c.x + c.w + 8 && y >= c.y - 4 && y < c.y + c.h + 4);
    /* 下拉 + 开关两件套：只认两个子控件的实际矩形，中间的空隙不算 */
    if (c.type === 'menuToggle') {
        var tg = c.toggle, mn = c.menu;
        return (mn && x >= mn.x - 2 && x < mn.x + mn.w + 2 && y >= mn.y - 2 && y < mn.y + mn.h + 2) ||
               (tg && x >= tg.x && x < tg.x + tg.w && y >= tg.y && y < tg.y + tg.h);
    }
    /* 下拉 + 三个按钮：只认各自的实际矩形 */
    if (c.type === 'menuTri') {
        var mn3 = c.menu, its3 = c.items || [];
        if (mn3 && x >= mn3.x - 2 && x < mn3.x + mn3.w + 2 && y >= mn3.y - 2 && y < mn3.y + mn3.h + 2) return true;
        for (var i3 = 0; i3 < its3.length; ++i3) {
            var s3 = its3[i3];
            if (x >= s3.x && x < s3.x + s3.w && y >= s3.y && y < s3.y + s3.h) return true;
        }
        return false;
    }
    if (c.type === 'btn3') {
        var ib3h = c.items || [];
        for (var i3h = 0; i3h < ib3h.length; ++i3h) {
            var s3h = ib3h[i3h];
            if (x >= s3h.x - 4 && x < s3h.x + s3h.w + 4 && y >= s3h.y - 4 && y < s3h.y + s3h.h + 4) return true;
        }
        return false;
    }
    return (x >= c.x && x < c.x + c.w && y >= c.y && y < c.y + c.h);
}

/* 开关/下拉/按钮：点标签也算点控件（鼠标点在行右半边以外也顺手，
   但分段器和加减号只认真正的控件区域，避免误触）。 */
function tsRowClickable(hit) {
    if (!hit || !hit.kind) return false;
    return hit.kind === 'toggle' || hit.kind === 'menu' || hit.kind === 'button' ||
        hit.kind === 'heading' || hit.kind === 'tri';
}

/* 点轨道空白：跳过去（滑块居中于鼠标） */
function tsScrollTo(y) {
    var cr = tsContentRect();
    var max = Math.max(0, g_ts.contentH - cr.h);
    if (max <= 0) { g_ts.scroll = 0; return; }
    var gm = tsScrollGeom(cr);
    var ratio = (y - g_ts.sbGrab - cr.y) / Math.max(1, cr.h - gm.h);
    g_ts.scroll = Math.round(tsClamp(ratio, 0, 1) * max);
    window.Repaint();
}

function tsOpenChoiceMenu(row, x, y) {
    var labels = row.labels || [];
    if (!labels.length) return;
    var menu = window.CreatePopupMenu();
    for (var i = 0; i < labels.length; ++i) menu.AppendMenuItem(MF_STRING, 100 + i, labels[i]);
    var cur = 0;
    try { cur = tsClamp(tsInt(row.get(), 0), 0, labels.length - 1); } catch (e) { cur = 0; }
    menu.CheckMenuRadioItem(100, 99 + labels.length, 100 + cur);
    var idx = menu.TrackPopupMenu(x, y, 0x0020);
    menu = null;
    if (!(idx >= 100)) return;
    var pick = idx - 100;
    if (pick < 0 || pick >= labels.length) return;
    /* 统一传索引：映射一律放在各行的 set() 里做，避免二次换算 */
    try { row.set(pick); } catch (e2) {}
    window.Repaint();
}

/* ---------------------------------------------------------------- 滑块 */
/* 拖拽中只改 g_ts.sliderPend（界面立刻跟手），停顿 110ms 或松手才写属性，
   因为写属性会触发壁纸重建，逐像素写会把界面拖死。 */
var g_ts_sldTimer = null;

function tsSliderCur(row) {
    if (g_ts.sliderPend && g_ts.sliderPend.id === row.id) return g_ts.sliderPend.v;
    var mn = (row.min !== undefined) ? Number(row.min) : 0;
    var mx = (row.max !== undefined) ? Number(row.max) : 100;
    if (!isFinite(mx) || mx <= mn) mx = mn + 1;
    var v = mn;
    try { v = Number(row.get()); } catch (eSC) { v = mn; }
    if (!isFinite(v)) v = mn;
    return tsClamp(Math.round(v), mn, mx);
}

function tsSliderValueAt(row, ctrl, x) {
    var mn = ctrl.min, mx = ctrl.max;
    var w = Math.max(1, ctrl.trackW - 1);
    var t = tsClamp((x - ctrl.trackX) / w, 0, 1);
    var v = mn + t * (mx - mn);
    var stp = tsInt(row.step, 1);
    if (stp > 0) v = Math.round(v / stp) * stp;
    return tsClamp(Math.round(v), mn, mx);
}

function tsSliderCommit(row, v, immediate) {
    g_ts.sliderPend = { id: row.id, v: v };
    if (g_ts_sldTimer) {
        try { window.ClearTimeout(g_ts_sldTimer); } catch (eCL) {}
        g_ts_sldTimer = null;
    }
    var doApply = function () {
        g_ts_sldTimer = null;
        if (!g_ts.sliderPend || g_ts.sliderPend.id !== row.id) return;
        var nv = g_ts.sliderPend.v;
        g_ts.sliderPend = null;
        try { row.set(nv); } catch (eAp) {}
        window.Repaint();
    };
    if (immediate) doApply();
    else g_ts_sldTimer = window.SetTimeout(doApply, 110);
    window.Repaint();
}

function tsSliderDragTo(x) {
    if (!g_ts.sliderDrag) return;
    var hit = tsHitById(g_ts.sliderDrag);
    if (!hit || !hit.ctrl || hit.ctrl.type !== 'slider') return;
    var row = tsRowById(hit.id);
    if (!row) return;
    var v = tsSliderValueAt(row, hit.ctrl, x);
    if (g_ts.sliderPend && g_ts.sliderPend.id === row.id && g_ts.sliderPend.v === v) return;
    tsSliderCommit(row, v, false);
}

function tsSliderFlush() {
    if (!g_ts.sliderDrag) return;
    var hit = tsHitById(g_ts.sliderDrag);
    g_ts.sliderDrag = '';
    g_ts.downRow = '';
    if (!hit || !hit.ctrl || hit.ctrl.type !== 'slider') return;
    var row = tsRowById(hit.id);
    if (!row || !g_ts.sliderPend) return;
    tsSliderCommit(row, g_ts.sliderPend.v, true);
}

function tsHitById(id) {
    var hs = g_ts.hits || [];
    for (var i = 0; i < hs.length; ++i) if (hs[i].id === id) return hs[i];
    return null;
}

/* 通用下拉：用外部回调取当前索引、收回选中索引，避免每个行都写一套菜单 */
function tsOpenListMenu(labels, cur, x, y, onPick) {
    if (!labels || !labels.length) return;
    var menu = window.CreatePopupMenu();
    for (var i = 0; i < labels.length; ++i) menu.AppendMenuItem(MF_STRING, 100 + i, labels[i]);
    menu.CheckMenuRadioItem(100, 99 + labels.length, 100 + tsClamp(tsInt(cur, 0), 0, labels.length - 1));
    var idx = menu.TrackPopupMenu(x, y, 0x0020);
    menu = null;
    if (!(idx >= 100)) return;
    try { onPick(idx - 100); } catch (eP) {}
}

function tsApplyClick(hit, row, x, y) {
    if (!row) return;

    if (row.kind === 'heading') {
        /* 点击分类标题：折叠/展开该分项，状态写进 THEME.cfg */
        var key = row.sec || row.id;
        g_ts.collapsed[key] = !g_ts.collapsed[key];
        g_ts.rows = null;
        tsSavePage();
        window.Repaint();
        return;
    }

    if (row.kind === 'tri') {
        /* 三个槽位各自独立：点到哪个就翻哪个 */
        var its = (hit.ctrl && hit.ctrl.items) ? hit.ctrl.items : [];
        for (var k = 0; k < its.length; ++k) {
            var sl = its[k];
            if (x >= sl.x - 4 && x < sl.x + sl.w + 4 && y >= sl.y - 4 && y < sl.y + sl.h + 4) {
                var cv = 1;
                try { cv = row.get(sl.i) ? 0 : 1; } catch (eGT2) { cv = 1; }
                try { row.set(sl.i, cv); } catch (eST) {}
                window.Repaint();
                return;
            }
        }
        return;
    }

    if (row.kind === 'button_choice') {
        var cb = hit.ctrl || {};
        if (cb.button && x >= cb.button.x && x < cb.button.x + cb.button.w &&
            y >= cb.button.y && y < cb.button.y + cb.button.h) {
            try { if (row.action) row.action(); } catch (eBS) {}
            window.Repaint();
            return;
        }
        var segs2 = cb.segs || [], pick2 = -1, bd2 = 1e9;
        for (var i2 = 0; i2 < segs2.length; ++i2) {
            var s2 = segs2[i2];
            if (x >= s2.x && x < s2.x + s2.w) { pick2 = s2.i; bd2 = 0; break; }
            var d2 = (x < s2.x) ? (s2.x - x) : (x - (s2.x + s2.w));
            if (d2 < bd2) { bd2 = d2; pick2 = s2.i; }
        }
        if (pick2 >= 0 && bd2 <= 6) {
            try { row.set(pick2); } catch (eP2) {}
            window.Repaint();
        }
        return;
    }

    if (row.kind === 'btn3') {
        /* 三个动作按钮：点哪个执行哪个（减小 / 重置 / 增大） */
        var ib3 = (hit.ctrl && hit.ctrl.items) ? hit.ctrl.items : [];
        for (var k3 = 0; k3 < ib3.length; ++k3) {
            var s3 = ib3[k3];
            if (x >= s3.x - 4 && x < s3.x + s3.w + 4 && y >= s3.y - 4 && y < s3.y + s3.h + 4) {
                try { row.set(s3.i); } catch (eB3) {}
                window.Repaint();
                return;
            }
        }
        return;
    }
    
    if (row.kind === 'iconbar') {
        var ci = hit.ctrl || {};
        var listI = ci.items || [];
        for (var iI = 0; iI < listI.length; ++iI) {
            var sI = listI[iI];
            if (x >= sI.x && x < sI.x + sI.w && y >= sI.y && y < sI.y + sI.h) {
                var onV = 1;
                try { onV = row.get(sI.key) ? 0 : 1; } catch (eGI2) { onV = 1; }
                try { row.set(sI.key, onV); } catch (eSI) {}
                /* 乐观更新本地快照：图标立刻跟着翻，不必等对方回广播校准 */
                try { if (g_tb.hasOwnProperty(sI.key)) g_tb[sI.key] = onV; } catch (eS1) {}
                try { if (g_ctrl.hasOwnProperty(sI.key)) g_ctrl[sI.key] = onV; } catch (eS2) {}
                window.Repaint();
                return;
            }
        }
        return;
    }

    if (row.kind === 'menu_tri') {
        var ctl3 = hit.ctrl;
        if (!ctl3) return;
        var mn4 = ctl3.menu, its4 = ctl3.items || [], k4;
        if (mn4 && x >= mn4.x - 2 && x < mn4.x + mn4.w + 2 && y >= mn4.y - 2 && y < mn4.y + mn4.h + 2) {
            tsOpenListMenu(row.menuLabels, tsInt(row.menuGet(), 0), x, y, function (i) {
                row.menuSet(i);
                window.Repaint();
            });
            return;
        }
        for (k4 = 0; k4 < its4.length; ++k4) {
            var sl4 = its4[k4];
            if (x >= sl4.x - 4 && x < sl4.x + sl4.w + 4 && y >= sl4.y - 4 && y < sl4.y + sl4.h + 4) {
                var cv4 = 1;
                try { cv4 = row.get(sl4.i) ? 0 : 1; } catch (eGT4) { cv4 = 1; }
                try { row.set(sl4.i, cv4); } catch (eST4) {}
                window.Repaint();
                return;
            }
        }
        return;
    }

    if (row.kind === 'menu_toggle') {
        var ctl2 = hit.ctrl;
        if (!ctl2) return;
        if (ctl2.toggle && x >= ctl2.toggle.x && x < ctl2.toggle.x + ctl2.toggle.w &&
            y >= ctl2.toggle.y && y < ctl2.toggle.y + ctl2.toggle.h) {
            var tv = 1;
            try { tv = row.get() ? 0 : 1; } catch (eTV) { tv = 1; }
            try { row.set(tv); } catch (eTS) {}
            window.Repaint();
            return;
        }
        if (ctl2.menu) {
            tsOpenListMenu(row.menuLabels || row.labels, tsInt(row.menuGet(), 0), x, y, function (i) {
                row.menuSet(i);
                window.Repaint();
            });
        }
        return;
    }

    if (row.kind === 'choice') {
        var segs = (hit.ctrl && hit.ctrl.segs) ? hit.ctrl.segs : [];
        var pick = -1, best = 1e9;
        for (var i = 0; i < segs.length; ++i) {
            var s = segs[i];
            if (x >= s.x && x < s.x + s.w) { pick = s.i; best = 0; break; }
            /* 分段之间有 2px 空隙，点偏一点也认：取最近的分段 */
            var d = (x < s.x) ? (s.x - x) : (x - (s.x + s.w));
            if (d < best) { best = d; pick = s.i; }
        }
        if (pick < 0 || best > 6) return;
        /* 统一传索引：映射一律放在各行的 set() 里做，避免二次换算 */
                try { row.set(pick); } catch (e1) {}
        window.Repaint();
        return;
    }

    if (row.kind === 'menu') {
        tsOpenChoiceMenu(row, x, y);
        return;
    }

    if (row.kind === 'step') {
        var c = hit.ctrl;
        var cur = 0;
        try { cur = tsInt(row.get(), 0); } catch (e2) { cur = 0; }
        var nv = cur;
        if (c.plus && x >= c.plus.x && x < c.plus.x + c.plus.w) nv = cur + tsInt(row.step, 1);
        else if (c.minus && x >= c.minus.x && x < c.minus.x + c.minus.w) nv = cur - tsInt(row.step, 1);
        else return;
        if (row.min !== undefined) nv = Math.max(row.min, nv);
        if (row.max !== undefined) nv = Math.min(row.max, nv);
        if (nv === cur) return;
        try { row.set(nv); } catch (e3) {}
        window.Repaint();
        return;
    }

    if (row.kind === 'toggle') {
        var v = 0;
        try { v = row.get() ? 0 : 1; } catch (e4) { v = 1; }
        try { row.set(v); } catch (e5) {}
        window.Repaint();
        return;
    }

    if (row.kind === 'button') {
        try { if (row.action) row.action(); } catch (e6) {}
        window.Repaint();
        return;
    }
}

function tsReloadAll() {
    /* 先切回模式 0，避免设置页在重载过程中还占着主区 */
    try { main_panel_state.setValue(0); } catch (e0) {}
    window.SetTimeout(function () {
        try { window.NotifyOthers('WSH_panels_reload', true); } catch (e1) {}
        try { window.NotifyOthers('eole_layout', true); } catch (e2) {}
        try { reloadPanelSafe(); } catch (e3) {}
    }, 350);
}

/* ---------------------------------------------------------------- 回调 */

/* 设置页主动轮询被控面板状态：控制栏 / 标题栏的子面板属性是各自私有的，
   只靠对方广播不可靠（面板未加载、广播丢失都会停在旧值），
   这里每 800ms 主动问一次，保证图标条与栏体状态一直一致。 */
var g_ts_poll = 0;
function tsPollStart() {
    if (g_ts_poll) return;
    try {
        g_ts_poll = window.SetInterval(function () {
            if (g_ts.page !== 0 && g_ts.page !== 1) return;
            if (g_ts.page === 0) tsQueryControl();
            tsQueryTitlebar();
        }, 800);
    } catch (ePS) { g_ts_poll = 0; }
}

function on_size(w, h) {
    tsPollStart();
    tsRowHNormalize();   /* 行高统一到 48（历史遗留的 52/60 一次性拉回） */
    ww = Math.max(1, w);
    wh = Math.max(1, h);
    /* 组件文档明确说别在 on_size 里 Repaint；尺寸变化后 SMP 自己会重画 */
}

/* ---------------------------------------------------------------- 透明底
   与其他子面板完全一致：本面板自己不画任何底色、也不自己画壁纸，
   壁纸和主题底色由宿主（Eole_layout / 壁纸宿主）在面板后面铺；
   这里只置 SupportPseudoTransparency 让窗口透过去。 */
function tsPseudoOn() {
    try {
        if (typeof fw_sharedOn === 'function' && fw_sharedOn() &&
            window.SupportPseudoTransparency !== true) window.SupportPseudoTransparency = true;
    } catch (ePT) {}
}

function on_paint(gr) {
    if (!ww || !wh) return;
    tsPseudoOn();
    var c = tsColors();
    tsDrawNav(gr, c);
    tsDrawHeader(gr, c);
    tsDrawRows(gr, c);
}

/* 左栏宽度拖拽：跟着鼠标实时写属性，松手才真正停下来 */
function tsSetNavW(v) {
    v = tsClamp(tsInt(v, TS_NAV_W0), 110, 320);
    if (v === tsNavW()) return;
    try { window.SetProperty(TS_PROP_NAVW, v); } catch (eNW) {}
    window.Repaint();
}
function tsNavSplitterHit(x, y) {
    var nw = tsNavW();
    return (x >= nw - 4 && x <= nw + 4);
}

function on_mouse_move(x, y, m) {
    g_ts.mouse.x = x;
    g_ts.mouse.y = y;

    if (g_ts.navDrag) { tsSetNavW(x - 1); window.SetCursor(IDC_SIZEWE); return; }
    if (g_ts.sliderDrag) { tsSliderDragTo(x); window.SetCursor(IDC_HAND); return; }
    if (g_ts.scrollDrag) { tsScrollTo(y); window.SetCursor(IDC_HAND); return; }

    var nav = tsNavAt(x, y);
    var hit = tsHitAt(x, y);
    var rowHover = hit ? hit.id : '';

    var overCtrl = hit && (tsHitControl(hit, x, y) || tsRowClickable(hit)) && hit.kind !== 'info';
    var key = overCtrl ? hit.id : '';

    /* 滚动条热区单独记一份：鼠标进/出热区要触发重绘，否则悬停不会变粗 */
    var crS = tsContentRect();
    var sbHot = (g_ts.contentH > crS.h) && (x >= ww - 16) && (y >= crS.y) && (y <= crS.y + crS.h);

    /* 页头退出按钮的热区（绘制时算出来，首帧之前为空） */
    var eb = g_ts.exitBtn;
    var exitHot = !!(eb && x >= eb.x && x < eb.x + eb.w && y >= eb.y && y < eb.y + eb.h);

    var changed = (nav !== g_ts.navHover) || (rowHover !== g_ts.rowHover) || (key !== g_ts.hoverKey) ||
        (sbHot !== !!g_ts.sbHot) || (exitHot !== !!g_ts.exitHot);
    g_ts.sbHot = sbHot;
    g_ts.exitHot = exitHot;

    g_ts.navHover = nav;
    g_ts.rowHover = rowHover;
    g_ts.hoverKey = key;

    if (tsNavSplitterHit(x, y)) window.SetCursor(IDC_SIZEWE);
    else if (g_ts.exitHot) window.SetCursor(IDC_HAND);
    else if (x < tsNavW()) window.SetCursor(IDC_HAND);
    else window.SetCursor(overCtrl ? IDC_HAND : IDC_ARROW);

    if (changed) window.Repaint();
}

function on_mouse_leave() {
    tsSliderFlush();          /* 拖到一半把鼠标移出面板：先把值落下去 */
    g_ts.mouse.x = -1;
    g_ts.mouse.y = -1;
    g_ts.navHover = -1;
    g_ts.rowHover = '';
    g_ts.hoverKey = '';
    g_ts.scrollDrag = false;
    g_ts.navDrag = false;
    g_ts.sbHot = false;
    g_ts.exitHot = false;
    window.Repaint();
}

function on_mouse_lbtn_down(x, y, m) {
    /* 分隔线：优先接管，避免落到滚动条/导航的判断里 */
    if (tsNavSplitterHit(x, y)) { g_ts.navDrag = true; window.SetCursor(IDC_SIZEWE); return; }
    var cr = tsContentRect();
    if (x >= ww - 16 && y >= cr.y && y <= cr.y + cr.h && g_ts.contentH > cr.h) {
        var gms = tsScrollGeom(cr);
        /* 按住滑块本体：记下抓取偏移，拖动时滑块跟手不跳；
           点轨道空白：滑块居中跳到鼠标位置后继续拖 */
        var onThumb = (y >= gms.y && y <= gms.y + gms.h) && (x >= ww - Math.max(gms.w, 12));
        g_ts.sbGrab = onThumb ? (y - gms.y) : Math.round(gms.h / 2);
        g_ts.scrollDrag = true;
        if (!onThumb) tsScrollTo(y);
        return;
    }
    var hit = tsHitAt(x, y);
    /* 滑块：按下即进入拖拽，单击轨道等于直接跳到该值 */
    if (hit && hit.ctrl && hit.ctrl.type === 'slider') {
        g_ts.sliderDrag = hit.id;
        g_ts.downRow = hit.id;
        tsSliderDragTo(x);
        return;
    }
    g_ts.downRow = hit ? hit.id : '';
    window.Repaint();
}

function on_mouse_lbtn_up(x, y, m) {
    if (g_ts.navDrag) { g_ts.navDrag = false; tsSetNavW(x - 1); return; }
    if (g_ts.sliderDrag) { tsSliderFlush(); return; }
    if (g_ts.scrollDrag) { g_ts.scrollDrag = false; g_ts.sbGrab = 0; window.Repaint(); return; }

    g_ts.mouse.x = x;
    g_ts.mouse.y = y;

    var nav = tsNavAt(x, y);
    if (nav >= 0) { tsSetPage(nav); g_ts.downRow = ''; return; }
    if (x < tsNavW()) { g_ts.downRow = ''; return; }

    /* 页头右上角「退出设置」：点图标或文字都退出，回到进设置页之前的主区模式。
       模式记忆存在标题栏面板的属性里，而 window.GetProperty 是按面板隔离的，
       本面板读不到那个值，只能发广播让标题栏自己按记忆值切回去。 */
    var eb = g_ts.exitBtn;
    if (eb && x >= eb.x && x < eb.x + eb.w && y >= eb.y && y < eb.y + eb.h && y < tsHeaderH()) {
        g_ts.downRow = '';
        var asked = false;
        try { window.NotifyOthers('ts_exit_theme_settings', 1); asked = true; } catch (eAsk) { asked = false; }
        /* 兜底：布局里没有标题栏面板接手时，退一步回媒体库，别把用户困在设置页 */
        try {
            window.SetTimeout(function () {
                try {
                    if (Number(main_panel_state.value) === 6) main_panel_state.setValue(0);
                } catch (eFB) {}
            }, 400);
        } catch (eTmr) {
            if (!asked) { try { main_panel_state.setValue(0); } catch (eExit0) {} }
        }
        return;
    }

    var hit = tsHitAt(x, y);
    var downId = g_ts.downRow;
    g_ts.downRow = '';
    if (!hit || !hit.id) return;
    if (downId && downId !== hit.id) return;   /* 按下和松开不在同一行，不算点击 */
    if (!tsHitControl(hit, x, y) && !tsRowClickable(hit)) return;

    var row = tsRowById(hit.id);
    if (!row) return;
    tsApplyClick(hit, row, x, y);
}

function on_mouse_lbtn_dblclk(x, y) {
    on_mouse_lbtn_up(x, y, 0);
}

function tsSetRowH(v) {
    v = tsClamp(tsInt(v, TS_BASE_ROWH), 40, 120);
    try { window.SetProperty(TS_PROP_ROWH, v); } catch (eA2) {}
    tsMdl2Font._f = null;      /* 图标字号跟行高走，要重建 */
    tsMdl2Small._f = null;
    g_ts.rows = null;          /* 行高变了：按新 tsRowH() 重建行 */
    var cr = tsContentRect();
    var max = Math.max(0, g_ts.contentH - cr.h);
    g_ts.scroll = Math.round(tsClamp(g_ts.scroll, 0, max));
    window.Repaint();
}

function on_mouse_wheel(step, stepstrait, delta) {
    /* 兼容 SMP 两种签名：老版 step 就是方向，新版是 stepstrait/delta */
    var d = step;
    if (typeof stepstrait !== 'undefined' && typeof delta !== 'undefined' && delta !== 0) d = stepstrait / delta;
    var dir = d > 0 ? 1 : (d < 0 ? -1 : 0);
    if (!dir) return;

    /* Ctrl+滚轮：全主题字号（与主菜单「字体大小」同源） */
    if (utils.IsKeyPressed(VK_CONTROL)) {
        tsFontStepGlobal(dir);
        return;
    }
    /* Shift+滚轮：本页行高（图标与控件等比跟随） */
    if (utils.IsKeyPressed(VK_SHIFT)) {
        tsSetRowH(tsRowH() + dir * 2);
        return;
    }

    var cr = tsContentRect();
    if (g_ts.contentH <= cr.h) return;
    var max = Math.max(0, g_ts.contentH - cr.h);
    g_ts.scroll = Math.round(tsClamp(g_ts.scroll - dir * 56, 0, max));
    window.Repaint();
}

function on_mouse_rbtn_up(x, y) {
    var menu = window.CreatePopupMenu();
    menu.AppendMenuItem(MF_STRING, 9001, '重载所有面板');
    menu.AppendMenuItem(MF_STRING, 9002, '打开设置文件夹');
    menu.AppendMenuItem(MF_GRAYED, 0, 'Eole 主题设置');
    var idx = menu.TrackPopupMenu(x, y, 0x0020);
    menu = null;
    if (idx === 9001) tsReloadAll();
    else if (idx === 9002) tsOpenFolder(SettingsPath);
    return true;
}

function on_colours_changed() {
    tsIconCacheClear();   /* 深浅换了：图标要按新配色重读 */
    window.Repaint();
}

function on_font_changed() {
    try { get_font(); } catch (e) {}
    tsFont._f = null;      /* 统一字体缓存重建 */
    tsMdl2Font._f = null;
    tsMdl2Small._f = null;
    window.Repaint();
}

function on_notify_data(name, info) {
    /* 状态文件类通知：把新值写回本地对象（NotifyOthers 不回送自身，
       别的面板改值时本页只能这样同步）。 */
    if (/^(trackinfos|nowplaying)/.test(name)) { g_ti.valid = false; tsQueryInfoLater(); }
    if (/^dark(lib|playlist|bio|lxbox)_state$/.test(name)) g_dark.valid = false;
    var st = (typeof panelSetting === 'function') ? panelSetting(name) : null;
    if (st) {
        var v = info;
        if (st.int_value) {
            v = parseInt(info);
            if (isNaN(v)) v = st.value;
        }
        st.value = v;
        window.Repaint();
        return;
    }

    switch (name) {
        case 'ts_panel_query':
            /* 标题栏弹菜单前的同步握手：NotifyOthers 是同步调用，
               这里立刻回 ts_panel_ready，返回后标题栏的
               g_themeSettingsReady 已置位，菜单项即可用。
               不依赖 GetPanel 枚举（实测在部分布局里 GetPanelCount=0）。 */
            tsAnnounce();
            break;
        case 'fw_values': try { fw_adopt(info); } catch (eFV) {} window.Repaint(); break;
        case 'set_font':
            /* 别的面板用 Ctrl+滚轮改全主题字号：本页文字也要跟着变 */
            try { globalProperties.fontAdjustement = tsInt(info, 0); } catch (eSF0) {}
            try { if (typeof get_font === 'function') get_font(); } catch (eSF1) {}
            tsFont._f = null;
            g_ts.rows = null;
            window.Repaint();
            break;
        case 'fullscreenWallpaper':
            /* 壁纸开关切换：本页不自绘，只需重开伪透明并重绘 */
            try {
                window.SupportPseudoTransparency = (typeof fw_sharedOn === 'function' && fw_sharedOn());
            } catch (eFW) {}
            window.Repaint();
            break;
        case 'fullscreenWallpaperRepaint':
            window.Repaint();
            break;
        case 'ts_control_refresh':
            /* controls.js 右键菜单改过设置：重查一次 */
            tsQueryControl();
            if (g_ts.page === 0) g_ts.rows = null;
            window.Repaint();
            break;
        case 'ts_titlebar_refresh':
            /* title_bar 菜单改过设置：重查一次 */
            tsQueryTitlebar();
            if (g_ts.page === 0 || g_ts.page === 1) g_ts.rows = null;
            window.Repaint();
            break;
        case 'ts_control_state':
            /* controls.js 回传的曲目详情 / 音量条 / 滑块样式 */
            if (info && typeof info === 'object') {
                /* 值有变化才重绘：本页会轮询，没变化就别刷屏 */
                var chC = false;
                var setC = function (kC, vC) {
                    vC = tsInt(vC, 0);
                    if (g_ctrl[kC] !== vC) { g_ctrl[kC] = vC; chC = true; }
                };
                setC('rows', info.rows);
                setC('prefix', info.prefix);
                setC('trackinfo', info.trackinfo);
                setC('volume', info.volume);
                setC('cursor', info.cursor);
                /* 控制栏 9 个按钮的显隐：不拷这些，图标条永远像全关 */
                setC('btn_stop', info.btn_stop);
                setC('btn_repeat', info.btn_repeat);
                setC('btn_shuffle', info.btn_shuffle);
                setC('btn_random', info.btn_random);
                setC('btn_open', info.btn_open);
                setC('btn_device', info.btn_device);
                setC('btn_equalizer', info.btn_equalizer);
                setC('btn_rating', info.btn_rating);
                setC('btn_scheduler', info.btn_scheduler);
                g_ctrl.valid = true;
                if (chC) {
                    if (g_ts.page === 0) g_ts.rows = null;
                    window.Repaint();
                }
            }
            break;
        case 'global_dark_theme':
            /* 标题栏明暗按钮 / 壁纸菜单改深浅后广播过来 */
            g_dark.val = info ? 1 : 0;
            g_dark.valid = true;
            if (g_ts.page === 1) g_ts.rows = null;
            window.Repaint();
            break;
        case 'ts_info_state':
            /* title_bar 回传的「封面、属性」三态：0 隐藏 / 1 顶部 / 2 底部 */
            g_ti.val = tsInt(info, 0);
            g_ti.valid = true;
            if (g_ts.page === 0) g_ts.rows = null;
            window.Repaint();
            break;
        case 'ts_titlebar_state':
            /* title_bar.js 回传的「设置...」菜单开关 */
            if (info && typeof info === 'object') {
                var chT = false;
                for (var tbK in g_tb) {
                    if (!g_tb.hasOwnProperty(tbK) || tbK === 'valid') continue;
                    var vT = tsInt(info[tbK], 0);
                    if (g_tb[tbK] !== vT) { g_tb[tbK] = vT; chT = true; }
                }
                g_tb.valid = true;
                if (chT) {
                    if (g_ts.page === 0) g_ts.rows = null;
                    window.Repaint();
                }
            }
            break;
        case 'library_dark_theme':
            try { darklib_state.value = info ? 1 : 0; } catch (e1) {}
            window.Repaint();
            break;
        case 'playlists_dark_theme':
            try { darkplaylist_state.value = info ? 1 : 0; } catch (e2) {}
            window.Repaint();
            break;
        case 'bio_dark_theme':
            try { darkbio_state.value = info ? 1 : 0; } catch (e3) {}
            window.Repaint();
            break;
        case 'visualization_dark_theme':
            try { darklxbox_state.value = info ? 1 : 0; } catch (e4) {}
            window.Repaint();
            break;
        case 'colors':
            globalProperties.colorsMainPanel = Number(info) || 0;
            window.SetProperty('全局·主面板配色', globalProperties.colorsMainPanel);
            window.Repaint();
            break;
        case 'colorsControls':
            globalProperties.colorsControls = Number(info) || 0;
            window.SetProperty('全局·控制栏配色', globalProperties.colorsControls);
            window.Repaint();
            break;
        case 'MemSolicitation':
            applyMemoryParametersLocally(info);
            window.Repaint();
            break;
        case 'thumbnailWidthMax':
            globalProperties.thumbnailWidthMax = Number(info) || globalProperties.thumbnailWidthMax;
            window.SetProperty('全局·缩略图最大宽度', globalProperties.thumbnailWidthMax);
            window.Repaint();
            break;
        case 'coverCacheWidthMax':
            globalProperties.coverCacheWidthMax = Number(info) || globalProperties.coverCacheWidthMax;
            window.SetProperty('全局·封面缓存最大宽度', globalProperties.coverCacheWidthMax);
            window.Repaint();
            break;
        case 'DiskCacheState':
            globalProperties.enableDiskCache = !!info;
            window.SetProperty('封面·磁盘缓存', globalProperties.enableDiskCache);
            window.Repaint();
            break;
        case 'set_font':
            try { get_font(); } catch (e5) {}
            window.Repaint();
            break;
        case 'eole_layout':
            window.Repaint();
            break;
        default:
            break;
    }
}

/* ---------------------------------------------------------------- 启动 */

/* 字体对象是懒加载的，第一次访问前必须先跑一次 get_font() */
try { get_font(); } catch (eFont) {}

tsLoadPage();
g_ts.loaded = true;
/* 面板加载完先问一次控制栏 / 标题栏状态，布局页第一次绘制就是准的 */
try { tsQueryControl(); } catch (eQC) {}
try { tsQueryTitlebar(); } catch (eQT) {}
try { tsQueryInfo(); } catch (eQI) {}

/* 面板刚建好时尺寸可能还是 0，等布局摆完再刷一次 */
window.SetTimeout(function () { try { window.Repaint(); } catch (e) {} }, 300);

/* 自报信：标题栏靠 caption 找本面板，新建面板的 DUI 标题可能还停在
   "JS 分离器"，GetPanel 就落空。发几次 ts_panel_ready，标题栏收到就直接
   认为面板在（不影响 Eole_layout 的摆位，那边另有 Name/Text 扫描兜底）。 */
function tsAnnounce() {
    try { window.NotifyOthers('ts_panel_ready', 1); } catch (eA) {}
}
try {
    tsAnnounce();
    window.SetTimeout(tsAnnounce, 800);
    window.SetTimeout(tsAnnounce, 2500);
} catch (eAnn) {}

/* ---------------------------------------------------------------- 在线更新 */

var TS_UPD_MANIFEST_URLS = [
    'https://raw.githubusercontent.com/zjpm-commits/Eole-foobar-theme-x64-chs/main/update_manifest.json',
    'https://cdn.jsdelivr.net/gh/zjpm-commits/Eole-foobar-theme-x64-chs@main/update_manifest.json'
];
/* 维护栏显示的状态；检查/更新后改写并重建行 */
var tsUpdState = { checked: false, version: '', upd: 0, add: 0, del: 0,
    msg: '尚未检查更新。检查只读取远端清单，不会改动任何文件。' };

/* 更新后自动重启开关：状态文件 eole-settings\AUTORESTART_1 / _0，默认开启。
   面板把值当参数传给 ts_update.ps1（-AutoRestart 1/0），脚本不自己去猜路径。 */
function tsUpdAutoRestartRoot() {
    return fb.ProfilePath + 'Eole\\eole-settings\\';
}
function tsUpdAutoRestartGet() {
    try {
        var files = utils.Glob(tsUpdAutoRestartRoot() + 'AUTORESTART_*');
        if (files && files.length) {
            var p = String(files[0]);
            return parseInt(p.substr(p.lastIndexOf('_') + 1), 10) ? 1 : 0;
        }
    } catch (e) {}
    return 1;
}
function tsUpdAutoRestartSet(v) {
    var root = tsUpdAutoRestartRoot();
    var target = root + 'AUTORESTART_' + (v ? '1' : '0');
    try {
        var files = utils.Glob(root + 'AUTORESTART_*');
        if (files) {
            for (var i = 0; i < files.length; i++) {
                if (String(files[i]) === target) continue;
                try {
                    var fso = new ActiveXObject('Scripting.FileSystemObject');
                    fso.DeleteFile(String(files[i]), true);
                } catch (e1) {}
            }
        }
        utils.WriteTextFile(target, '1');
    } catch (e) {}
}

function tsHttpGet(url) {
    try {
        var x = new ActiveXObject('MSXML2.XMLHTTP');
        x.open('GET', url, false);
        x.setRequestHeader('User-Agent', 'Eole-Theme-Updater');
        x.send();
        if (x.status === 200 && x.responseText) return String(x.responseText);
    } catch (e) {}
    return null;
}

/* 本地文件修改时间（UTC 秒）；文件不存在返回 -1 */
function tsUpdLocalMtime(rel) {
    try {
        var fso = new ActiveXObject('Scripting.FileSystemObject');
        var f = fso.GetFile(fb.ProfilePath + String(rel).replace(/\//g, '\\'));
        return Math.floor(new Date(f.DateLastModified).getTime() / 1000);
    } catch (e) { return -1; }
}

function tsUpdRebuild() {
    g_ts.rows = null;
    window.Repaint();
}

function tsUpdateCheck() {
    var txt = null;
    for (var i = 0; i < TS_UPD_MANIFEST_URLS.length; i++) {
        txt = tsHttpGet(TS_UPD_MANIFEST_URLS[i]);
        if (txt) break;
    }
    if (!txt) {
        tsUpdState = { checked: false, version: '', upd: 0, add: 0, del: 0,
            msg: '无法获取更新清单（网络或代理问题），请稍后再试。' };
        tsUpdRebuild();
        return;
    }
    var m = null;
    try { m = JSON.parse(txt); } catch (e) {}
    if (!m || !m.files || !m.files.length) {
        tsUpdState = { checked: false, version: '', upd: 0, add: 0, del: 0,
            msg: '更新清单解析失败，请联系维护者。' };
        tsUpdRebuild();
        return;
    }
    var upd = 0, add = 0, del = 0;
    /* 判据与执行器同源：优先 MD5 比对（utils.MD5FromFile，4.4.2 官方 API），
       旧环境取不到该 API 时才退回 mtime。 */
    var hasMd5 = false;
    try { hasMd5 = (typeof utils.MD5FromFile === 'function'); } catch (eMd5) { hasMd5 = false; }
    for (var k = 0; k < m.files.length; k++) {
        var rel = String(m.files[k].path);
        var mt = tsUpdLocalMtime(rel);
        if (mt < 0) { add++; continue; }
        var same = false;
        if (hasMd5) {
            try {
                same = String(utils.MD5FromFile(fb.ProfilePath + rel.replace(/\//g, '\\'))).toLowerCase() === String(m.files[k].md5 || '').toLowerCase();
            } catch (e5) { same = false; }
        }
        if (!same && !hasMd5) {
            var rm = parseInt(m.files[k].mtime, 10);
            if (!isFinite(rm)) rm = 0;
            same = (mt >= rm);
        }
        if (!same) upd++;
    }
    if (m.removed) {
        for (var r = 0; r < m.removed.length; r++) {
            var rr = m.removed[r];
            var rp = (typeof rr === 'string') ? rr : (rr && rr.path);
            if (rp && tsUpdLocalMtime(String(rp)) >= 0) del++;
        }
    }
    var ver = String(m.version || '未知');
    var msg;
    if (upd + add + del === 0) {
        msg = '已是最新（远端版本 ' + ver + '）。';
    } else {
        msg = '远端版本 ' + ver + '：更新 ' + upd + ' 个，新增 ' + add + ' 个，移除 ' + del +
              ' 个。点“立即更新”退出 foobar2000 自动完成，' +
              (tsUpdAutoRestartGet() ? '完成后自动重启。' : '重启后生效。');
    }
    tsUpdState = { checked: true, version: ver, upd: upd, add: add, del: del, msg: msg };
    tsUpdRebuild();
}

function tsUpdateApply() {
    if (!tsUpdState.checked) tsUpdateCheck();
    if (!tsUpdState.checked) return;
    if (tsUpdState.upd + tsUpdState.add + tsUpdState.del === 0) {
        tsUpdState.msg = '已是最新（远端版本 ' + tsUpdState.version + '），无需更新。';
        tsUpdRebuild();
        return;
    }
    var ps1 = skin_global_path + '\\ts_update.ps1';
    if (tsUpdLocalMtime('Eole\\ts_update.ps1') < 0) {
        tsUpdState.msg = '缺少更新执行器 ts_update.ps1，无法更新。';
        tsUpdRebuild();
        return;
    }
    var log = fb.ProfilePath + '_update_backup\\last_update.log';
    /* 退出后应用：先弹窗确认 → 启动更新程序 → foobar2000 自行退出。
       更新程序会等进程退出（最多 20 秒）并对替换重试（最多 60 次×250ms），
       文件句柄全部释放后才动线上文件，完成后弹窗报告结果。 */
    var r = 6;
    try { r = utils.MessageBox('在线更新需要退出 foobar2000 完成文件替换。\n\n是否立即退出并完成更新？', 'Eole 主题更新', 0x4, 0x20); }
    catch (eMB) {
        /* 老版 JSplitter 没有 utils.MessageBox 时，用 WScript 原生弹窗兜底；
           两条路都走不通就按“取消”处理，绝不在没有确认的情况下突然退出。 */
        try {
            var wsh = new ActiveXObject('WScript.Shell');
            r = wsh.Popup('在线更新需要退出 foobar2000 完成文件替换。\n\n是否立即退出并完成更新？', 0, 'Eole 主题更新', 0x4 + 0x20);
        } catch (eMB2) { r = 7; }
    }
    if (r !== 6) {
        tsUpdState.msg = '已取消本次更新，可稍后再试。';
        tsUpdRebuild();
        return;
    }
    try {
        var fso = new ActiveXObject('Scripting.FileSystemObject');
        if (fso.FileExists(log)) fso.DeleteFile(log);
    } catch (e2) {}
    var autoRestart = tsUpdAutoRestartGet() ? 1 : 0;
    var cmd = 'powershell.exe -NoProfile -ExecutionPolicy Bypass -File "' + ps1 +
              '" -Profile "' + fb.ProfilePath + '" -Log "' + log + '" -AutoRestart ' + autoRestart;
    var ok = false;
    try {
        var sh = new ActiveXObject('WScript.Shell');
        sh.Run(cmd, 0, false);   /* 0 = 隐藏窗口，false = 不等待 */
        ok = true;
    } catch (e3) {}
    if (!ok) {
        tsUpdState.msg = '无法启动更新程序（PowerShell 不可用）。';
        tsUpdRebuild();
        return;
    }
    tsUpdState.msg = '更新程序已启动（版本 ' + tsUpdState.version + '），foobar2000 即将退出，完成后弹窗报告' +
                     (autoRestart ? '并自动重启。' : '，重启后生效。');
    tsUpdRebuild();
    try { fb.Exit(); } catch (eExit) {
        tsUpdState.msg = '更新程序已启动，请手动关闭 foobar2000 以完成替换。';
        tsUpdRebuild();
    }
}
