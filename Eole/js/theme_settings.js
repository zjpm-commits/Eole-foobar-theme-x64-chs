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

var TS_NAV_W = 150;          /* 左栏固定宽度 */
var TS_PAD = 24;             /* 右栏左右留白 */
var TS_HEADER_H = 86;        /* 右栏标题区高度 */

var TS_PANES = [
    { id: 'layout', title: '布局与面板', sub: '分栏设置与主区选项' },
    { id: 'theme',  title: '主题配色',   sub: '深浅色、配色与全屏壁纸' },
    { id: 'cache',  title: '封面与缓存', sub: '内存策略与封面缓存' },
    { id: 'chrome', title: '窗口外观',   sub: '边框、菜单栏与状态栏' },
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

/* 字体统一：整页只用一种字体一个字号（按用户要求）。原来按 kind 区分的
   boldplus1 / min2 / plus1 等全部并到同一份，kind 参数保留仅为兼容调用点。
   字体缓存住，on_font_changed 里置空重建。 */
var TS_MDL2 = 'Segoe MDL2 Assets';
function tsFont(kind) {
    if (!tsFont._f) {
        var f = null;
        try { f = g_font.normal; } catch (e) { f = null; }
        if (!f) {
            try { f = gdi.Font('Microsoft YaHei UI', 13); } catch (e2) { f = null; }
        }
        tsFont._f = f;
    }
    return tsFont._f;
}

/* 开关专用 MDL2 字体（向量字形，圆滑无锯齿）：打开 U+F19F / 关闭 U+F19E */
function tsMdl2Font() {
    if (!tsMdl2Font._f) {
        try { tsMdl2Font._f = gdi.Font(TS_MDL2, 36); } catch (e) { tsMdl2Font._f = null; }
    }
    return tsMdl2Font._f;
}

/* 折叠箭头用的小号 MDL2（ChevronDown U+E70D / ChevronRight U+E76C） */
function tsMdl2Small() {
    if (!tsMdl2Small._f) {
        try { tsMdl2Small._f = gdi.Font(TS_MDL2, 12); } catch (e) { tsMdl2Small._f = null; }
    }
    return tsMdl2Small._f;
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

function tsColors() {
    if (tsIsDark()) {
        return {
            bg: 0xff1a1a1a,
            nav: 0xff141414,
            rowHover: GetGrey(255, 12),
            rowHover2: GetGrey(255, 8),
            rowLine: GetGrey(255, 16),
            text: GetGrey(238),
            sub: GetGrey(150),
            sub2: GetGrey(110),
            value: GetGrey(200),
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

function tsMpvOn() {
    try { return !!utils.CheckComponent('foo_mpv', true); } catch (e) { return false; }
}

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
function tsRequestLayout(v) {
    var target = tsInt(v, 0) ? 1 : 0;
    try { window.NotifyOthers('eole_set_layout', target); } catch (e) {}
}

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
    btn_lightswitch: 0, btn_fullscreen: 0, duifollow: 0, valid: false
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
            labels: ['标准两行', '常规紧凑', '加宽紧凑'],
            get: function () { return tsInt(compact_titlebar.value, 0); },
            set: function (v) { compact_titlebar.setValue(tsInt(v, 0)); }
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
            id: 'tb_remember', label: '启动时恢复面板状态', desc: '重新打开时回到上次停留的主区模式',
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

        /* 5 个标题栏按钮开关：循环生成，get/set 都发 ts_titlebar（与「设置…」菜单同源） */
        (function () {
            var defs = [
                ['btn_nowplaying', '右侧栏可见性按钮', '标题栏上的右侧栏显隐按钮'],
                ['btn_configlayout', '面板布局按钮', '打开布局配置的按钮'],
                ['btn_rightsidebar', '右侧栏功能按钮', '右侧栏功能入口'],
                ['btn_lightswitch', '明暗切换按钮', '深色与浅色切换按钮（全局同源）'],
                ['btn_fullscreen', '全屏按钮', '全屏切换按钮']
            ];
            for (var i = 0; i < defs.length; ++i) R.push({
                id: defs[i][0], label: defs[i][1], desc: defs[i][2], kind: 'toggle',
                get: (function (k) { return function () { return g_tb.valid ? tsInt(g_tb[k], 0) : 0; }; })(defs[i][0]),
                set: (function (k) { return function (v) { tsSetTitlebar(k, v ? 1 : 0); }; })(defs[i][0])
            });
        })();
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
        /* 9 个控制栏按钮开关：循环生成，get/set 都发 ts_control（与右键「显示按钮」同源） */
        (function () {
            var defs = [
                ['btn_stop', '按钮·停止', '停止按钮（播放时才出现）'],
                ['btn_repeat', '按钮·循环', '循环播放按钮'],
                ['btn_shuffle', '按钮·乱序', '乱序播放按钮'],
                ['btn_random', '按钮·随机', '随机播放按钮'],
                ['btn_open', '按钮·打开', '打开文件按钮'],
                ['btn_device', '按钮·输出设备和 DSP 预设', '输出设备切换入口'],
                ['btn_equalizer', '按钮·均衡器', '均衡器入口'],
                ['btn_rating', '按钮·评级', '评分按钮'],
                ['btn_scheduler', '按钮·电源计划', '电源计划按钮']
            ];
            for (var i = 0; i < defs.length; ++i) R.push({
                id: defs[i][0], label: defs[i][1], desc: defs[i][2], kind: 'toggle',
                get: (function (k) { return function () { return g_ctrl.valid ? tsInt(g_ctrl[k], 0) : 0; }; })(defs[i][0]),
                set: (function (k) { return function (v) { tsSetControl(k, v ? 1 : 0); }; })(defs[i][0])
            });
        })();
        R.push(tsHeading('左侧栏设置'));
        R.push(tsStateRow('libwidth', '媒体库左栏宽度', '模式 0 左侧筛选栏（100-900）', 'step', libraryfilter_width,
            null, { step: 10, min: 100, max: 900, format: function (v) { return v + ' px'; } }));
        R.push({
            id: 'libfilter', label: '显示左侧筛选栏',
            desc: '关闭后模式 0 的左栏整体隐藏，主区更宽',
            kind: 'toggle',
            get: function () { return libraryfilter_state.isActive() ? 1 : 0; },
            set: function (v) { libraryfilter_state.setValue(v ? 1 : 0); }
        });
        R.push({
            id: 'libstyle', label: '媒体库左侧样式',
            desc: '树形目录走 LibraryTree；封面视图走筛选面板 LibraryFilter',
            kind: 'choice',
            labels: ['封面视图（筛选器）', '树形目录'],
            get: function () { return librarytree.isActive() ? 1 : 0; },
            set: function (v) { librarytree.setValue(tsInt(v, 0)); }
        });
        R.push(tsStateRow('plwidth', '播放列表左栏宽度', '模式 1 左侧列表管理器（100-900）', 'step', playlistpanel_width,
            null, { step: 10, min: 100, max: 900, format: function (v) { return v + ' px'; } }));

        R.push(tsHeading('右侧栏设置'));
        R.push(tsStateRow('rightwidth', '右侧栏宽度', '所有模式共用的右侧播放列表（100-900）', 'step', rightplaylist_width,
            null, { step: 10, min: 100, max: 900, format: function (v) { return v + ' px'; } }));
        R.push(tsStateRow('lyricswidth', '歌词宽度', '模式 2 右侧歌词栏；0 隐藏，11 铺满主区', 'step', lyrics_state,
            null, {
                step: 1, min: 0, max: 11,
                format: function (v) { return v === 0 ? '隐藏' : (v >= 11 ? '铺满' : (v * 10) + '%'); }
            }));
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

        R.push(tsHeading('主区设置'));
        R.push({
            id: 'layoutmode', label: '布局模式',
            desc: '完整模式有主区；切到迷你播放器会先回到媒体库',
            kind: 'choice',
            labels: ['完整模式', '迷你播放器'],
            get: function () { return layout_state.isActive() ? 1 : 0; },
            set: function (v) { tsRequestLayout(tsInt(v, 0)); }
        });
        R.push({
            id: 'main', label: '主区模式（选后离开本页）',
            desc: '与标题栏菜单的 7 个模式同源；选中即切到该模式，本页随之关闭',
            kind: 'menu',
            labels: ['媒体库', '播放列表', '简介歌词', '洛雪音源', 'MilkDrop',
                     tsMpvOn() ? 'MPV 视频' : 'ESL 歌词', '主题设置'],
            get: function () { return tsInt(main_panel_state.value, 0); },
            set: function (v) { tsSetTitlebar('mainmode', tsInt(v, 0)); }
        });
        R.push({
            id: 'filters', label: '筛选区高度', desc: '模式 1 播放列表上方的筛选器区域',
            kind: 'menu',
            labels: ['隐藏', '20%', '30%', '40%', '60%', '满高'],
            get: function () { return tsInt(filters_panel_state.value, 0); },
            set: function (v) {
                var hv = tsInt(v, 0);
                /* 高度调出来但三个筛选器全关时，会白留一条空带；顺手打开第 1 个 */
                if (hv > 0 && !filter1_state.isActive() && !filter2_state.isActive() && !filter3_state.isActive()) {
                    filter1_state.setValue(1);
                }
                filters_panel_state.setValue(hv);
            }
        });
        /* 3 个筛选器开关：循环生成，改完统一走 tsFixFilterSpace 免得留下空白带 */
        (function () {
            var defs = [
                ['filter1', '筛选器 1', '启用第 1 个筛选器'],
                ['filter2', '筛选器 2', '启用第 2 个筛选器'],
                ['filter3', '筛选器 3', '启用第 3 个筛选器']
            ];
            for (var i = 0; i < defs.length; ++i) R.push({
                id: defs[i][0], label: defs[i][1], desc: defs[i][2], kind: 'toggle',
                get: (function (k) { return function () { return panelSetting(k + '_state').isActive() ? 1 : 0; }; })(defs[i][0]),
                set: (function (k) { return function (v) { panelSetting(k + '_state').setValue(v ? 1 : 0); tsFixFilterSpace(); }; })(defs[i][0])
            });
        })();
        R.push(tsStateRow('mdfps', 'MilkDrop 帧率', '模式和预设由 MilkDrop 面板自己维持', 'choice', milkdropfps_state,
            ['30 fps', '60 fps', '120 fps'], null));
        R.push({
            id: 'mdpreset', label: 'MilkDrop 预设', desc: '从 samples\\vis\\MilkDrop 里读取',
            kind: 'button', button: '选择预设…',
            get: function () { return 0; }, set: function () {},
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
            id: 'wallblur', label: '模糊强度', desc: '深浅主题各有一份强度，这里改当前主题那份',
            kind: 'step', step: 5, min: 0, max: 90,
            get: function () { return tsClamp(Math.round(fw_blurValue()), 0, 90); },
            set: function (v) { try { fw_setBlur(tsInt(v, 0)); } catch (e2) {} tsFwApply(); },
            format: function (v) { return String(v); }
        });
        R.push({
            id: 'wallmask', label: '蒙版浓度', desc: '压在壁纸上的一层底色，越深文字越清楚',
            kind: 'step', step: 20, min: 0, max: 255,
            get: function () { return tsClamp(Math.round(fw_maskAlpha()), 0, 255); },
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
                ? '提示：接管方切换后会立即重排窗口；如边框没变，点击下方「重载所有面板」。'
                : '提示：没装 foo_openhacks 时，边框/菜单栏/状态栏由 uie_jsplitter 负责。'
        });

    } else if (g_ts.page === 4) {
        /* ---------- 组件信息 ---------- */
        R.push({
            id: 'ver', label: '主题版本', kind: 'info',
            get: function () { return 'Eole ' + String(globalProperties.theme_version || '?'); }
        });
        R.push({ id: 'c1', label: 'foo_uie_jsplitter（窗口与脚本）', kind: 'info', get: function () { return tsComponent('foo_uie_jsplitter'); } });
        R.push({ id: 'c2', label: 'foo_mpv（视频）', kind: 'info', get: function () { return tsComponent('foo_mpv'); } });
        R.push({ id: 'c3', label: 'foo_uie_eslyric（歌词）', kind: 'info', get: function () { return tsComponent('foo_uie_eslyric'); } });
        R.push({ id: 'c4', label: 'foo_openhacks（窗口接管）', kind: 'info', get: function () { return tsComponent('foo_openhacks'); } });
        R.push({ id: 'c5', label: 'foo_playcount（播放统计）', kind: 'info', get: function () { return tsComponent('foo_playcount'); } });
        R.push({ id: 'prof', label: '配置目录', desc: 'profile 路径', kind: 'info', get: function () { return String(fb.ProfilePath); } });
        R.push({
            kind: 'note',
            text: '提示：模式 5 需要 foo_mpv 才有视频；没有插件时它退化成 ESLyric 歌词页。'
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
            id: 'openmpv', label: 'mpv 目录', desc: 'mpv.conf 与 input.conf 都在这里',
            kind: 'button', button: '打开',
            get: function () { return 0; }, set: function () {},
            action: function () { tsOpenFolder(fb.ProfilePath + 'mpv'); }
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
        if (!R[i].h) R[i].h = 48;
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

function tsNavY() { return 108; }
function tsNavItemH() { return 46; }

function tsContentRect() {
    var x = TS_NAV_W + TS_PAD;
    var w = Math.max(1, ww - x - TS_PAD);
    var y = TS_HEADER_H;
    var h = Math.max(1, wh - y - 12);
    return { x: x, y: y, w: w, h: h };
}

function tsDrawNav(gr, c) {
    gr.FillSolidRect(0, 0, TS_NAV_W, wh, c.nav);
    gr.FillSolidRect(TS_NAV_W - 1, 0, 1, wh, c.rowLine);

    tsText(gr, 'Eole', tsFont('min1'), c.sub, 22, 18, TS_NAV_W - 44, 18, DT_LEFT | DT_TOP);
    tsText(gr, '主题设置', tsFont('boldplus1'), c.text, 22, 38, TS_NAV_W - 44, 26, DT_LEFT | DT_VCENTER);
    tsText(gr, 'v' + String(globalProperties.theme_version || ''), tsFont('min2'), c.sub2,
        22, 66, TS_NAV_W - 44, 16, DT_LEFT | DT_TOP);

    gr.FillSolidRect(22, 94, TS_NAV_W - 44, 1, c.rowLine);

    var y = tsNavY();
    for (var i = 0; i < TS_PANES.length; ++i) {
        var p = TS_PANES[i];
        var active = (i === g_ts.page);
        var hover = (i === g_ts.navHover);
        if (active) gr.FillSolidRect(0, y, TS_NAV_W - 1, tsNavItemH() - 2, c.rowHover);
        else if (hover) gr.FillSolidRect(0, y, TS_NAV_W - 1, tsNavItemH() - 2, c.rowHover2);
        if (active) gr.FillSolidRect(0, y + 8, 3, tsNavItemH() - 18, c.accent);

        tsText(gr, p.title, active ? tsFont('bold') : tsFont('normal'),
            active ? c.text : c.sub, 22, y + 4, TS_NAV_W - 44, 22, DT_LEFT | DT_VCENTER);
        tsText(gr, p.sub, tsFont('min2'), active ? c.sub : c.sub2,
            22, y + 25, TS_NAV_W - 44, 16, DT_LEFT | DT_VCENTER);
        y += tsNavItemH();
    }
}

function tsDrawHeader(gr, c) {
    var page = TS_PANES[g_ts.page];
    if (!page) return;
    var x = TS_NAV_W + TS_PAD;
    var w = Math.max(1, ww - x - TS_PAD);
    tsText(gr, page.title, tsFont('boldplus1'), c.text, x, 16, w, 28, DT_LEFT | DT_VCENTER);
    tsText(gr, page.sub, tsFont('min1'), c.sub, x, 46, w, 20, DT_LEFT | DT_VCENTER);
    gr.FillSolidRect(x, TS_HEADER_H - 8, w, 1, c.rowLine);
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
        if (canFold && row.id && row.id === g_ts.rowHover) {
            gr.FillSolidRect(cr.x - TS_PAD + 8, y, cr.w + TS_PAD * 2 - 16, row.h - 1, c.rowHover2);
        }
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

    var hovered = (row.id && row.id === g_ts.rowHover);
    if (hovered && row.kind !== 'note') {
        gr.FillSolidRect(cr.x - TS_PAD + 8, y, cr.w + TS_PAD * 2 - 16, row.h - 1, c.rowHover2);
    }
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
        var lh = 22 + 16;
        var ly = y + Math.max(0, Math.round((row.h - lh) / 2));
        tsText(gr, row.label, tsFont('normal'), c.text, cr.x, ly, labelW, 22,
            DT_LEFT | DT_VCENTER | DT_NOPREFIX | DT_END_ELLIPSIS);
        tsText(gr, row.desc, tsFont('min2'), c.sub, cr.x, ly + 22, labelW, 16,
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

/* 画右侧控件，返回可点区域（含 choice 的分段、step 的加减） */
function tsDrawControl(gr, c, row, cr, y) {
    var right = cr.x + cr.w;

    if (row.kind === 'choice') {
        var labels = row.labels || [];
        var widths = [], total = 0, i;
        for (i = 0; i < labels.length; ++i) {
            var tw = Math.round(tsTextW(gr, labels[i], tsFont('min1'))) + 22;
            widths.push(tw);
            total += tw + 2;
        }
        total -= 2;
        var x = right - total;
        var cy = y + Math.round((row.h - 28) / 2);
        var segs = [];
        var cur = 0;
        try { cur = tsInt(row.get(), 0); } catch (eC) { cur = 0; }
        for (i = 0; i < labels.length; ++i) {
            var sw = widths[i];
            var active = (cur === i);
            var hov = tsMouseIn(x, cy, sw, 28);
            var bg = active ? c.accent : (hov ? c.ctrlBgHover : c.ctrlBg);
            gr.FillSolidRect(x, cy, sw, 28, bg);
            tsText(gr, labels[i], tsFont('min1'), active ? c.accentText : c.text,
                x, cy, sw, 28, DT_CENTER | DT_VCENTER | DT_NOPREFIX);
            segs.push({ x: x, w: sw, i: i });
            x += sw + 2;
        }
        return { x: right - total, y: cy, w: total, h: 28, type: 'segs', segs: segs };

    } else if (row.kind === 'menu') {
        var mw = Math.min(230, Math.max(140, Math.round(cr.w * 0.42)));
        var mx = right - mw;
        var my = y + Math.round((row.h - 30) / 2);
        var mHover = tsMouseIn(mx, my, mw, 30);
        gr.FillSolidRect(mx, my, mw, 30, mHover ? c.ctrlBgHover : c.ctrlBg);
        gr.DrawRect(mx, my, mw - 1, 29, 1.0, mHover ? c.accent : c.ctrlBorder);
        var label = '';
        try {
            var mi = tsInt(row.get(), 0);
            label = (row.labels && row.labels[mi] !== undefined) ? row.labels[mi] : '';
        } catch (eM) { label = ''; }
        tsText(gr, label, tsFont('min1'), c.text, mx + 12, my, mw - 36, 30,
            DT_LEFT | DT_VCENTER | DT_NOPREFIX | DT_END_ELLIPSIS);
        tsText(gr, '\u25BE', tsFont('min1'), c.sub, mx + mw - 24, my, 16, 30,
            DT_CENTER | DT_VCENTER | DT_NOPREFIX);
        return { x: mx, y: my, w: mw, h: 30, type: 'menu' };

    } else if (row.kind === 'step') {
        var bw = 28, vw = 78;
        var tot = bw + 4 + vw + 4 + bw;
        var sx = right - tot;
        var sy = y + Math.round((row.h - 28) / 2);
        var minus = { x: sx, y: sy, w: bw, h: 28 };
        var plus = { x: sx + bw + 4 + vw + 4, y: sy, w: bw, h: 28 };
        gr.FillSolidRect(minus.x, sy, bw, 28, tsMouseIn(minus.x, sy, bw, 28) ? c.ctrlBgHover : c.ctrlBg);
        tsText(gr, '\u2212', tsFont('plus1'), c.text, minus.x, sy, bw, 28, DT_CENTER | DT_VCENTER | DT_NOPREFIX);
        gr.FillSolidRect(sx + bw + 4, sy, vw, 28, c.ctrlBg);
        var txt = '';
        try {
            var sv = tsInt(row.get(), 0);
            txt = row.format ? row.format(sv) : String(sv);
        } catch (eS) { txt = ''; }
        tsText(gr, txt, tsFont('min1'), c.value, sx + bw + 4, sy, vw, 28,
            DT_CENTER | DT_VCENTER | DT_NOPREFIX | DT_END_ELLIPSIS);
        gr.FillSolidRect(plus.x, sy, bw, 28, tsMouseIn(plus.x, sy, bw, 28) ? c.ctrlBgHover : c.ctrlBg);
        tsText(gr, '+', tsFont('plus1'), c.text, plus.x, sy, bw, 28, DT_CENTER | DT_VCENTER | DT_NOPREFIX);
        return { x: sx, y: sy, w: tot, h: 28, type: 'step', minus: minus, plus: plus };

    } else if (row.kind === 'toggle') {
        /* 开关改用 Segoe MDL2 Assets 字形绘制（打开 U+F19F / 关闭 U+F19E）。
           字形是字体渲染的矢量路径，圆滑无锯齿，替代原来的
           FillRoundRect + FillEllipse 组合。 */
        /* 字形 36 号配 48 行高：盒 100x42，可见图形约 25px，上下各留 3px */
        var tw = 100, th = 42;
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
            /* MDL2 字体不可用时的退路：老画法 */
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
        var by = y + Math.round((row.h - 30) / 2);
        var bHover = tsMouseIn(bx, by, bwd, 30);
        gr.FillSolidRect(bx, by, bwd, 30, bHover ? c.ctrlBgHover : c.ctrlBg);
        gr.DrawRect(bx, by, bwd - 1, 29, 1.0, bHover ? c.accent : c.ctrlBorder);
        tsText(gr, btxt, tsFont('min1'), c.text, bx, by, bwd, 30,
            DT_CENTER | DT_VCENTER | DT_NOPREFIX);
        return { x: bx, y: by, w: bwd, h: 30, type: 'button' };
    }

    return { x: right, y: y, w: 0, h: row.h, type: 'none' };
}

function tsDrawScrollbar(gr, c, cr) {
    if (g_ts.contentH <= cr.h) return;
    var trackX = ww - 10;
    var trackW = 4;
    gr.FillSolidRect(trackX, cr.y, trackW, cr.h, c.rowLine);
    var thumbH = Math.max(36, Math.round(cr.h * cr.h / g_ts.contentH));
    var max = Math.max(1, g_ts.contentH - cr.h);
    var thumbY = cr.y + Math.round((cr.h - thumbH) * (g_ts.scroll / max));
    gr.FillSolidRect(trackX, thumbY, trackW, thumbH,
        tsMouseIn(trackX - 4, thumbY, 12, thumbH) ? c.sub : c.ctrlBorder);
}

/* ---------------------------------------------------------------- 点击/滚动 */

function tsNavAt(x, y) {
    if (x < 0 || x >= TS_NAV_W) return -1;
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
    return (x >= c.x && x < c.x + c.w && y >= c.y && y < c.y + c.h);
}

/* 开关/下拉/按钮：点标签也算点控件（鼠标点在行右半边以外也顺手，
   但分段器和加减号只认真正的控件区域，避免误触）。 */
function tsRowClickable(hit) {
    if (!hit || !hit.kind) return false;
    return hit.kind === 'toggle' || hit.kind === 'menu' || hit.kind === 'button' ||
        hit.kind === 'heading';
}

function tsScrollTo(y) {
    var cr = tsContentRect();
    var max = Math.max(0, g_ts.contentH - cr.h);
    if (max <= 0) { g_ts.scroll = 0; return; }
    var ratio = (y - cr.y) / Math.max(1, cr.h);
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
    }    if (row.kind === 'choice') {
        var segs = (hit.ctrl && hit.ctrl.segs) ? hit.ctrl.segs : [];
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

function on_size(w, h) {
    ww = Math.max(1, w);
    wh = Math.max(1, h);
    /* 组件文档明确说别在 on_size 里 Repaint；尺寸变化后 SMP 自己会重画 */
}

function on_paint(gr) {
    if (!ww || !wh) return;
    /* 设置页整页不透明，不参与全屏壁纸的伪透明（Eole_layout 仍会把面板标成
       伪透明，但这里每一块都填满，壁纸不会露出来，反而更干净）。 */
    var c = tsColors();
    gr.FillSolidRect(0, 0, ww, wh, c.bg);
    tsDrawNav(gr, c);
    tsDrawHeader(gr, c);
    tsDrawRows(gr, c);
}

function on_mouse_move(x, y, m) {
    g_ts.mouse.x = x;
    g_ts.mouse.y = y;

    if (g_ts.scrollDrag) { tsScrollTo(y); return; }

    var nav = tsNavAt(x, y);
    var hit = tsHitAt(x, y);
    var rowHover = hit ? hit.id : '';

    var overCtrl = hit && (tsHitControl(hit, x, y) || tsRowClickable(hit)) && hit.kind !== 'info';
    var key = overCtrl ? hit.id : '';
    var changed = (nav !== g_ts.navHover) || (rowHover !== g_ts.rowHover) || (key !== g_ts.hoverKey);

    g_ts.navHover = nav;
    g_ts.rowHover = rowHover;
    g_ts.hoverKey = key;

    if (x < TS_NAV_W) window.SetCursor(IDC_HAND);
    else window.SetCursor(overCtrl ? IDC_HAND : IDC_ARROW);

    if (changed) window.Repaint();
}

function on_mouse_leave() {
    g_ts.mouse.x = -1;
    g_ts.mouse.y = -1;
    g_ts.navHover = -1;
    g_ts.rowHover = '';
    g_ts.hoverKey = '';
    g_ts.scrollDrag = false;
    window.Repaint();
}

function on_mouse_lbtn_down(x, y, m) {
    var cr = tsContentRect();
    if (x >= ww - 16 && y >= cr.y && y <= cr.y + cr.h && g_ts.contentH > cr.h) {
        g_ts.scrollDrag = true;
        tsScrollTo(y);
        return;
    }
    var hit = tsHitAt(x, y);
    g_ts.downRow = hit ? hit.id : '';
    window.Repaint();
}

function on_mouse_lbtn_up(x, y, m) {
    if (g_ts.scrollDrag) { g_ts.scrollDrag = false; return; }

    g_ts.mouse.x = x;
    g_ts.mouse.y = y;

    var nav = tsNavAt(x, y);
    if (nav >= 0) { tsSetPage(nav); g_ts.downRow = ''; return; }
    if (x < TS_NAV_W) { g_ts.downRow = ''; return; }

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

function on_mouse_wheel(step, stepstrait, delta) {
    var cr = tsContentRect();
    if (g_ts.contentH <= cr.h) return;
    var max = Math.max(0, g_ts.contentH - cr.h);
    g_ts.scroll = Math.round(tsClamp(g_ts.scroll - step * 56, 0, max));
    window.Repaint();
}

function on_mouse_rbtn_up(x, y) {
    var menu = window.CreatePopupMenu();
    menu.AppendMenuItem(MF_STRING, 9001, '重载所有面板');
    menu.AppendMenuItem(MF_STRING, 9002, '打开设置文件夹');
    menu.AppendMenuSeparator();
    menu.AppendMenuItem(MF_GRAYED, 0, 'Eole 主题设置');
    var idx = menu.TrackPopupMenu(x, y, 0x0020);
    menu = null;
    if (idx === 9001) tsReloadAll();
    else if (idx === 9002) tsOpenFolder(SettingsPath);
    return true;
}

function on_colours_changed() {
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
                g_ctrl.rows = tsInt(info.rows, 0);
                g_ctrl.prefix = tsInt(info.prefix, 0);
                g_ctrl.trackinfo = tsInt(info.trackinfo, 0);
                g_ctrl.volume = tsInt(info.volume, 0);
                g_ctrl.cursor = tsInt(info.cursor, 0);
                g_ctrl.valid = true;
                /* 行对象里的 get() 是实时读取，但缓存值变了要重画一次 */
                if (g_ts.page === 0) g_ts.rows = null;
                window.Repaint();
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
                for (var tbK in g_tb) {
                    if (!g_tb.hasOwnProperty(tbK) || tbK === 'valid') continue;
                    g_tb[tbK] = tsInt(info[tbK], 0);
                }
                g_tb.valid = true;
                if (g_ts.page === 0) g_ts.rows = null;
                window.Repaint();
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

