// ============================================================================
// Eole 布局脚本 —— JSplitter x64 版
// ----------------------------------------------------------------------------
// 这个面板本身什么都不显示，它只干一件事：按当前窗口尺寸和皮肤里的各种开关，
// 把同一个窗口里的其它子面板（标题栏、封面、播放控制、筛选器、媒体库、
// 播放列表、右侧栏……）摆到该在的位置、给该有的尺寸。所有面板都是
// 「绝对坐标 + Move」，没有用到 splitter 的自动分割。
//
// 数据来源：Eole 的各个面板把设置写成文件，路径形如
//     <foobar2000 配置目录>\Eole\eole-settings\<键名>_<值>
// 例如 RIGHTPLAYLISTWIDTH_240 就表示右侧栏宽 240。所以本脚本不去问面板
// 要设置，而是直接枚举这个目录里的文件名——这也是后面必须用 utils.Glob
// 的原因。目录里同一个键只会存在一个文件（换值时先删旧的再写新的）。
//
// 摆位是事件驱动的：面板改设置后会 NotifyOthers("eole_layout")，
// on_notify_data 只认这一个名字并随即 arrange()，不设兜底分支——与本面板
// 无关的通知（颜色、评分、随机播放、焦点、字体缩放……）不再顺带触发重排。
// 因此凡是"面板尺寸/可见性变了"的地方都必须发 "eole_layout"。
// 低频 SetInterval 只作兜底（兜设置文件改动没发通知的情况 + 壁纸生成失败后的重试）。
// ============================================================================
// 原始面板脚本作者：Ottodix 及 melkosofter，这是根据我个人喜好做的本地适配版。
window.DefinePanel('Eole layout', {author: 'Eole contributors / local adaptation'});

try {
    include(fb.ProfilePath + 'Eole\\js\\theme_common.js');
} catch (e) {}
if (typeof fw_enabled !== 'function') {
    var fw_enabled = function () { return false; };
    var fw_sharedOn = function () { return false; };
    var fw_pickSource = function () { return { img: null, path: '' }; };
    var fw_buildWallpaper = function () { return null; };
    var fw_drawWallpaper = function (gr, w, h) { gr.FillSolidRect(0, 0, w, h, 0xff1e1e1e); return false; };
    var fw_isDark = function () { return true; };
    var fw_source = function () { return 0; };
    var fw_blurValue = function () { return 0; };
    var fw_maskAlpha = function () { return 0; };
    var fw_quality = function () { return 1; };
    var FW_PROP_DARK = "显示·全屏壁纸深色(-1=跟随 0=浅 1=深)";
    var FW_PROP_DARK_REF = "显示·全屏壁纸深色·fb2k基准";
    var fw_bgIsDark = function () { return true; };
    var fw_themeDark = function () { return true; };
    var fw_themeStale = function () { return false; };
    var fw_setThemeDark = function (v) { return !!v; };
    var fw_clearThemeDark = function () { return false; };
}


function fw_hostOn(force) {
    try { if (!force && typeof g_fw_live === 'boolean') return g_fw_live; } catch (eLive) {}
    var st = null;
    try { st = (typeof fw_sharedState === 'function') ? fw_sharedState(force) : null; } catch (e) { st = null; }
    if (st === null) {
        try { return !!fw_enabled(); } catch (e2) { return false; }
    }
    return st === true;
}

function fwSeedShared() {
    var st = null;
    try { st = fw_sharedState(true); } catch (e) { st = null; }
    if (st !== null) return;
    var on = false;
    try { on = !!fw_enabled(); } catch (e2) { on = false; }
    if (!on) return;
    try { fw_sharedSet(true); } catch (e3) {}
    try { console.log('[FW] [宿主] 共享开关已补写: 1'); } catch (e4) {}
}


function fwApplyCfg() {
    var c = null;
    try { c = (typeof fw_cfgRead === 'function') ? fw_cfgRead() : null; } catch (e) { c = null; }
    if (!c) return false;
    try {
        if (typeof c.on === 'boolean')  window.SetProperty(FW_PROP_ENABLED, c.on);
        if (typeof c.src === 'number')  window.SetProperty(FW_PROP_SOURCE, c.src);
        if (typeof c.img === 'string')  window.SetProperty(FW_PROP_IMAGE, c.img);
        if (typeof c.bd === 'number')   window.SetProperty(FW_PROP_BLUR, c.bd);
        if (typeof c.bl === 'number')   window.SetProperty(FW_PROP_BLUR_LT, c.bl);
        if (typeof c.md === 'number')   window.SetProperty(FW_PROP_MASK, c.md);
        if (typeof c.ml === 'number')   window.SetProperty(FW_PROP_MASK_LT, c.ml);
        if (typeof c.q === 'number')    window.SetProperty(FW_PROP_QUALITY, c.q);
    } catch (e2) { return false; }
    return true;
}


var settingRoot = fb.ProfilePath + 'Eole\\eole-settings\\';

/* PATCH(perf): 一次 arrange() 原本要跑 1 次 snapshot() + 十余次 setting()，
   每次 setting() 都自跑一次 utils.Glob 枚举目录（同一个目录被反复枚举十余遍）。
   改为：一次枚举建索引，之后全部在内存里查。索引由 arrange() 开头的
   snapshot() 刷新，所以 setting() 只应在 arrange() 内部被调用——那样每个
   重排周期恰好扫盘 1 次，同时保留「别的面板改了设置能被发现」的能力。
   若 Glob 失败，索引置为空表，setting() 一律返回默认值，且不再重复扫盘。 */
var g_settingIndex = null;

function refreshSettingIndex() {
    var files = null;
    try { files = utils.Glob(settingRoot + "*"); } catch (e) { files = null; }
    if (!files) { g_settingIndex = {}; return null; }
    var map = {};
    for (var i = 0; i < files.length; ++i) {
        var path = String(files[i]);
        //   ...\Eole\eole-settings\RIGHTPLAYLISTWIDTH_240
        var us = path.lastIndexOf('_'), sl = Math.max(path.lastIndexOf('\\'), path.lastIndexOf('/'));
        if (us <= sl || us <= 0) continue;
        var key = path.substring(sl + 1, us), val = path.substring(us + 1);
        // 同一个键正常只有一份文件（换值时先删旧的再写新的）。万一有残留，
        // 取数值最大的那个，避免依赖 utils.Glob 不保证稳定的返回顺序。
        var old = map[key];
        if (old === undefined || Number(val) > Number(old)) map[key] = val;
    }
    g_settingIndex = map;
    return map;
}

function setting(prefix, fallback) {
    var map = g_settingIndex;
    if (map === null) map = refreshSettingIndex();
    if (!map) return fallback;
    var raw = map[prefix];
    if (raw === undefined) return fallback;
    var value = Number(raw);
    return isFinite(value) ? value : fallback;
}


function getPanel(names) {
    if (typeof names === 'string') names = [names];
    for (var i = 0; i < names.length; ++i) {
        try {
            var p = window.GetPanel(names[i]);
            if (p) return p;
        } catch (e) {}
    }
    return null;
}

var previousLayout = "";

/* MilkDrop 全屏态：milkdrop_panel.js 右键菜单开关。只在 'milkdrop_fullscreen'
   通知里置位并以 arrange('force') 生效；任何普通重排（'eole_layout'）自动退出，
   状态不持久化。 */
var mdFullscreen = false;

var INFO_EXTRA_HEIGHT = 41;

var FINGERPRINT_KEYS = ['MAINPANEL', 'LAYOUT', 'COMPACTTITLEBAR', 'LIBRARYFILTER', 'LIBRARYFILTERWIDTH',
    'LIBRARYTREE', 'PLAYLISTPANELWIDTH', 'FILTERSPANEL', 'FILTER1', 'FILTER2', 'FILTER3', 'LYRICS',
    'NOWPLAYINGLIB', 'NOWPLAYINGPLAYLIST', 'NOWPLAYINGBIO', 'NOWPLAYINGLXBOX', 'RIGHTPLAYLISTWIDTH',
    'COVERPANELBIG', 'COVERPANELMINI', 'MINICONTROLBAR', 'SHOWTRACKINFOBIG', 'SHOWTRACKINFOSMALL',
    'TRACKINFOSLIB', 'TRACKINFOSPLAYLIST', 'TRACKINFOSBIO', 'TRACKINFOSLXBOX', 'TRACKINFOSMDROP',
    'NOWPLAYINGMDROP', 'TRACKINFOSTEXT'];


function snapshot() {
    // 同时完成两件事：刷新设置索引（供本轮 setting() 使用）、算出指纹字符串。
    var map = refreshSettingIndex();
    if (!map) return null;
    var out = [];
    for (var k = 0; k < FINGERPRINT_KEYS.length; ++k) {
        var v = map[FINGERPRINT_KEYS[k]];
        out.push(v === undefined ? '' : v);
    }
    return out.join(',');
}


function arrange(arg) {
    var live = (arg === 'live') || (arg !== 'force' && rsLive);
    var w = window.Width, h = window.Height;
    if (w < 1 || h < 1) return;

    var fp = snapshot();
    if (fp !== null) {
        var layoutKey = w + ":" + h + ":" + fp;
        if (arg !== 'force' && layoutKey === previousLayout) return;
        previousLayout = layoutKey;
    }

    var mode = setting('MAINPANEL', 0), mini = setting('LAYOUT', 0);
    var compact = setting('COMPACTTITLEBAR', 0);
    var top = compact === 0 || mini ? 64 : compact === 1 ? 36 : 50;
    var bottom = mini ? (setting('SHOWTRACKINFOSMALL', 0) ? 51 : 43) :
        !setting('MINICONTROLBAR', 1) ? 72 : setting('SHOWTRACKINFOBIG', 1) ? 54 : 47;
    var bodyHeight = Math.max(1, h - top - bottom);

    var suffix = ['LIB', 'PLAYLIST', 'BIO', 'LXBOX', 'MDROP'][mode] || 'LIB';
    var right = mini ? w : setting('NOWPLAYING' + suffix, 1) ?
        Math.min(setting('RIGHTPLAYLISTWIDTH', 210), Math.floor(w * 0.4)) : 0;
    var mainWidth = w - right;

    var panelCount = 0;
    try { panelCount = window.GetPanelCount(); } catch (e) { panelCount = 0; }

    /* MilkDrop 全屏：只留它一块，铺满整窗（含标题栏区）。
       摆不上（面板没建）就清标志、继续走普通布局，别留一块空白。 */
    if (mdFullscreen) {
        for (var fi = 0; fi < panelCount; ++fi) {
            try { window.GetPanelByIndex(fi).Show(false); } catch (eF) {}
        }
        if (!panel('MilkDrop', 0, 0, w, h, true)) mdFullscreen = false;
        else return;
    }

    if (!live) {
        for (var i = 0; i < panelCount; ++i) {
            try { window.GetPanelByIndex(i).Show(false); } catch (e) {}
        }
    }

    function panel(names, x, y, width, height, opaque) {
        if (width <= 0 || height <= 0) return null;
        var p = getPanel(names);
        if (!p) return null;
        try {
            var px = Math.round(x), py = Math.round(y);
            var pw = Math.max(1, Math.round(width)), ph = Math.max(1, Math.round(height));
            p.__fwOpaque = !!opaque;
            p.Move(px, py, pw, ph);
            p.Show(true);
            p.Move(px, py, pw, ph);
            glass(p, false, !!opaque);
        } catch (e) { return null; }
        return p;
    }

    function glass(p, force, opaque) {
        if (!p) return;
        var on = false;
        try { on = fw_hostOn(); } catch (e) { on = false; }
        if (opaque) on = false;
        if (!force && p.__fwGlass === on) return;
        p.__fwGlass = on;
        try { p.SupportPseudoTransparency = on; } catch (e) {}
        try { p.ShowCaption = false; } catch (e) {}
    }

    function glassNowPlaying(p, force) {
        if (!p) return;
        p.__fwNpp = true;
        var on = false;
        try { on = fw_hostOn(); } catch (e) { on = false; }
        if (on) {
            var circle = true, txt = false;
            try { circle = !!p.GetProperty("显示·圆形模式", true); } catch (e2) {}
            try { txt = !!p.GetProperty("显示曲目信息", false); } catch (e3) {}
            on = (circle || txt);
        }
        if (!force && p.__fwGlass === on) return;
        p.__fwGlass = on;
        try { p.SupportPseudoTransparency = on; } catch (e) {}
        try { p.ShowCaption = false; } catch (e) {}
    }

    var cover = mini ? setting('COVERPANELMINI', 1) : setting('COVERPANELBIG', 1);
    var coverWidth = cover ? bottom : 0;
    panel('CoverPanel', 0, h - bottom, coverWidth, bottom, true);
    panel('Controls', coverWidth, h - bottom, w - coverWidth, bottom);

    if (!mini) {
        if (mode === 0) {
            var left = setting('LIBRARYFILTER', 1) ? Math.min(setting('LIBRARYFILTERWIDTH', 210), mainWidth * 0.4) : 0;
            panel(setting('LIBRARYTREE', 0) ? ['LibraryTree', 'LibraryFilter'] : ['LibraryFilter', 'LibraryTree'],
                0, top, left, bodyHeight);
            panel('GraphicBrowser', left, top, mainWidth - left, bodyHeight);

        } else if (mode === 1) {
            var manager = Math.min(setting('PLAYLISTPANELWIDTH', 180), mainWidth * 0.35);
            panel('SmoothPlaylistManager', 0, top, manager, bodyHeight);
            var area = mainWidth - manager, filterMode = setting('FILTERSPANEL', 1);
            var filterHeight = bodyHeight * ([0, .2, .3, .4, .6, 1][filterMode] || 0);
            var enabled = [1, 2, 3].filter(function(n) { return setting('FILTER' + n, 1); });
            if (enabled.length && filterHeight) enabled.forEach(function(n, i) {
                panel('PlaylistFilter' + n, manager + area * i / enabled.length, top,
                    area / enabled.length, filterHeight);
            });
            var headerHeight = filterMode === 5 ? 0 : 32;
            panel('PlaylistHeader', manager, top + filterHeight, area, headerHeight);
            panel(['BottomPlaylist', 'NowPlayingPlaylist'], manager, top + filterHeight + headerHeight, area,
                bodyHeight - filterHeight - headerHeight);

        } else if (mode === 2) {
            var lyrics = setting('LYRICS', 5);   // 缺省 5 = 主区宽的 50%（11 = 铺满）
            var lyricsWidth = lyrics === 11 ? mainWidth : mainWidth * lyrics / 10;
            if (!getPanel('Lyrics')) lyricsWidth = 0;
            panel('Biography', 0, top, mainWidth - lyricsWidth, bodyHeight);
            if (lyricsWidth > 0) {
                var wantSpec = true;
                try {
                    var titlePanel = getPanel('LyricsTitle');
                    if (titlePanel) wantSpec = titlePanel.GetProperty("频谱·显示", true) !== false;
                } catch (eSpec) { wantSpec = true; }
                var wantHeight = wantSpec ? 202 : 124;
                var ratio = wantSpec ? 0.34 : 0.24;
                var lyricsTitleHeight = Math.round(Math.min(wantHeight, Math.max(28, bodyHeight * ratio)));
                panel('LyricsTitle', mainWidth - lyricsWidth, top, lyricsWidth, lyricsTitleHeight);
                panel('Lyrics', mainWidth - lyricsWidth, top + lyricsTitleHeight, lyricsWidth,
                    bodyHeight - lyricsTitleHeight);
            }

        } else if (mode === 4) {
            /* MilkDrop 是独立面板，自己用 Direct2D 画满这一块。
               摆不上（没在面板清单里建这个面板）就沿用模式 3 的兜底，别留一块空白。 */
            panel('MilkDrop', 0, top, mainWidth, bodyHeight, true) ||
                panel(['GraphicBrowser', 'BottomPlaylist', 'NowPlayingPlaylist'], 0, top, mainWidth, bodyHeight);

        } else {
            panel('Lxbox', 0, top, mainWidth, bodyHeight) ||
                panel(['GraphicBrowser', 'BottomPlaylist', 'NowPlayingPlaylist'], 0, top, mainWidth, bodyHeight);
        }
    }

    if (right) {
        var info = mini ? 0 : setting('TRACKINFOS' + suffix, mode >= 2 ? 1 : 0);
        if (info && !getPanel('TrackInfo')) info = 0;

        var infoText = setting('TRACKINFOSTEXT', 1);
        var infoHeight = info ? Math.min(right + (infoText ? INFO_EXTRA_HEIGHT : 0), bodyHeight / 2) : 0;
        if (info && infoHeight < right * 0.5) infoHeight = Math.min(right * 0.5, bodyHeight / 2);

        var rx = mini ? 0 : mainWidth;
        var tp = info ? panel('TrackInfo', rx, info === 2 ? top + bodyHeight - infoHeight : top, right, infoHeight) : null;
        panel(['NowPlayingPlaylist', 'BottomPlaylist'], rx, info === 1 ? top + infoHeight : top, right,
            bodyHeight - infoHeight);
        if (tp) glassNowPlaying(tp, true);
    }

    panel('TitleBar', 0, 0, w, top);

    if (!fw_hostOn()) {
        for (var j = 0; j < panelCount; ++j) {
            var pj = null;
            try { pj = window.GetPanelByIndex(j); } catch (e2) { pj = null; }
            if (!pj) continue;
            if (pj.__fwGlass !== false) {
                pj.__fwGlass = false;
                try { pj.SupportPseudoTransparency = false; } catch (e3) {}
            }
        }
    }

    window.Repaint();
}

function fwScheduleResizeSettle() {
    if (rsTimer) { clearTimeout(rsTimer); rsTimer = 0; }
    rsTimer = setTimeout(function () {
        rsTimer = 0;
        var w = 0, h = 0;
        try { w = window.Width; h = window.Height; } catch (eW) { w = 0; h = 0; }
        if (w < 1 || h < 1) { rsLive = false; return; }
        if (w === rsLastW && h === rsLastH) {
            rsLive = false;
            try { window.Repaint(); } catch (eR0) {}
            try { window.NotifyOthers("fullscreenWallpaperRepaint", true); } catch (eR1) {}
            return;
        }
        rsLastW = w; rsLastH = h;
        rsLive = false;
        try { arrange('force'); } catch (e1) {}
        try { fwApplyCfg(); } catch (e2) {}
        try { fwEnsure(true); } catch (e3) {}
        try { window.Repaint(); } catch (e4) {}
        try { fwRefreshGlass(); } catch (e5) {}
        try { window.NotifyOthers("fullscreenWallpaperRepaint", true); } catch (e6) {}
    }, 260);
}

function on_size() {
    rsLive = true;
    try { arrange('live'); } catch (e) {}
    try { window.Repaint(); } catch (eR) {}
    fwScheduleResizeSettle();
}

function on_playback_new_track() {
    /* 换曲目了：指纹缓存必须作废，否则同一路径换了封面会误判 */
    try { if (typeof fw_artInvalidate === 'function') fw_artInvalidate(); } catch (eI) {}
    try { if (fw_hostOn() && fw_source() !== 1) fwQueue(120, true); } catch (e) {}
}
function on_playback_stop() {
    try { if (typeof fw_artInvalidate === 'function') fw_artInvalidate(); } catch (eI) {}
    try { if (fw_hostOn() && fw_source() !== 1) fwQueue(120, true); } catch (e) {}
}
function on_colours_changed() {
    try {
        if (typeof fw_themeStale === 'function' && fw_themeStale()) fw_clearThemeDark();
    } catch (eS) {}
    try { fw_isDark(true); } catch (e0) {}
    try { if (fw_hostOn()) fwQueue(60); } catch (e) {}
    try { window.NotifyOthers('fw_theme_dark', !!fw_isDark()); } catch (eB) {}
}

/* 所有「需要重新摆位」的请求都从这里进：刷新伪透明状态 + 重排。
   抽成一个函数，让显式通知和内部调用共用同一套动作。 */
function relayoutSoon() {
    window.SetTimeout(function () {
        try { fwGlassAll(false); } catch (eGA) {}
        try { arrange(); } catch (eA2) {}
    }, 0);
}

function on_notify_data(name, info) {
    /* 布局重排只认这两个名字，不做兜底。'eole_layout' 的发送方主要是
       pss_switch.js 的 RefreshPSS()（每次 setValue 后调用），以及面板重载前
       补发的地方——普通重排同时退出 MilkDrop 全屏；'milkdrop_fullscreen'
       是 milkdrop_panel.js 右键菜单的全屏开关，force 绕过指纹去重。 */
    if (name === 'eole_layout') { mdFullscreen = false; relayoutSoon(); return; }
    if (name === 'milkdrop_fullscreen') {
        mdFullscreen = (info === true || Number(info) === 1);
        window.SetTimeout(function () {
            try { fwGlassAll(false); } catch (eGA) {}
            try { arrange('force'); } catch (eA) {}
        }, 0);
        return;
    }
    if (name === 'fw_theme_request') {
        var dreq = false;
        try { dreq = !!fw_isDark(); } catch (eReq) { dreq = false; }
        try { window.NotifyOthers('fw_theme_dark', dreq); } catch (eReq2) {}
        return;
    }
    if (name === 'fw_theme_dark' || name === 'global_dark_theme') {
        var dv = (info === true || Number(info) === 1) ? 1 : 0;
        var ref = 0;
        try { ref = (typeof fw_bgIsDark === 'function' && fw_bgIsDark()) ? 1 : 0; } catch (eR) {}
        try { window.SetProperty(FW_PROP_DARK, dv); } catch (eA) {}
        try { window.SetProperty(FW_PROP_DARK_REF, ref); } catch (eB) {}
        try { fw_isDark(true); } catch (eC) {}
        try { fwQueue(50); } catch (eTQ) {}
        try { window.Repaint(); } catch (eTR) {}
        return;
    }
    if (name === 'lx_cover_ready' || name === 'lx_cover_path') {
        try {
            var p = (typeof info === 'string') ? info : ((info && info.path) || '');
            if (p) {
                g_fwExtCover = String(p);
                try { if (typeof fw_artInvalidate === 'function') fw_artInvalidate(); } catch (eI2) {}
                fwQueue(60, true);
                window.Repaint();
            }
        } catch (eLx) {}
        return;
    }
    if (name === 'fullscreenWallpaper') {
        try { fw_setOn(info); } catch (eFS) {}
        window.SetTimeout(function () {
            try { fw_hostOn(true); } catch (eS) {}
            try { fwGlassAll(true); } catch (eG) {}
            if (fwKeySame()) {
                try { window.Repaint(); } catch (eK1) {}
                try { fwRefreshGlass(); } catch (eK2) {}
                return;
            }
            fwQueue(30);
        }, 0);
        return;
    }
    if (name === 'fullscreenWallpaperRefit') {
        fwQueue(30);
        return;
    }
    if (name === 'fullscreenWallpaperCfg') {
        window.SetTimeout(function () {
            try { fwApplyCfg(); } catch (eC1) {}
            fwQueue(0);
        }, 0);
        return;
    }
    if (name === 'fullscreenWallpaperRepaint') {
        try { window.Repaint(); } catch (eRW) { }
        try { fwRefreshGlass(); } catch (eRG) { }
        return;
    }
    /* 有意不设兜底：未识别的通知一律忽略，不再顺带 arrange()。 */
}

var fwImg = null;
var fwKey = "";
var g_fwExtCover = "";
var fwTimer = 0;
var fwTimer2 = 0;
var fwFailAt = 0;
var rsLive = false;
var rsTimer = 0;
var rsLastW = -1, rsLastH = -1;
var fwBuilding = false;
var fwLastW = 0, fwLastH = 0;

function fwMakeKey(w, h) {
    var src = fw_pickSource();
    var key = [w, h, fw_isDark() ? 1 : 0, fw_source(), src.path || "-",
        fw_blurValue(), fw_maskAlpha(), fw_quality(),
        (typeof g_fwExtCover === 'string' ? g_fwExtCover : '')].join(":");
    /* 曲目身份：优先用「封面指纹」（theme_common.js 的 fw_artSignature）。
       同一张专辑封面 → 指纹相同 → 换歌时 key 不变 → 壁纸不必重画；
       流媒体每首封面不同 → 指纹不同 → 照常重画。
       指纹接口不可用时退回老行为：按当前曲目路径区分，一首一画。 */
    key += ":" + fwArtKeyPart();
    return key;
}

function fwArtKeyPart() {
    var sig = "";
    try {
        if (typeof fw_artSignature === 'function') sig = String(fw_artSignature() || "");
    } catch (e) { sig = ""; }
    if (sig) return sig;
    var h0 = null;
    try { h0 = fb.GetNowPlaying(); } catch (e2) { h0 = null; }
    return "track:" + (h0 ? h0.Path : "none");
}

function fwKeySame() {
    if (!fwImg) return false;
    var w = window.Width, h = window.Height;
    if (!(w > 0 && h > 0)) return false;
    return fwKey === fwMakeKey(w, h);
}

function fwEnsure(force, qOverride) {
    if (!fw_hostOn()) {
        return null;
    }
    var w = window.Width, h = window.Height;
    if (!(w > 0 && h > 0)) return null;

    var low = (typeof qOverride === 'number' && qOverride > 0);

    var key = fwMakeKey(w, h);
    var cacheKey = low ? (key + "|low") : key;

    if (!force && cacheKey === fwKey && fwImg) return fwImg;

    if (!force && !low && fwImg && (w !== fwLastW || h !== fwLastH)) {
        fwLastW = w; fwLastH = h;
        fwQueue(80);
        return fwImg;
    }
    fwLastW = w; fwLastH = h;

    if (!force && !low && fwImg && fwKey === (key + "|low")) return fwImg;

    if (!force && !low && !fwImg) {
        var nowMs = (new Date()).getTime();
        if (!fwTimer && !fwTimer2 && (nowMs - fwFailAt) > 1500) fwQueue(0);
        return null;
    }

    if (!force && !low && fwImg) {
        var nowMs2 = (new Date()).getTime();
        if (!fwTimer && !fwTimer2 && (nowMs2 - fwFailAt) > 1500) fwQueue(0);
        return fwImg;
    }

    fwBuilding = true;
    var __fwOld = fwImg;
    try {
        var np = null;
        try { np = fb.GetNowPlaying(); } catch (e) { np = null; }
        var __t0 = (new Date()).getTime();
        var __built = low ? fw_buildWallpaper(w, h, np, qOverride) : fw_buildWallpaper(w, h, np);
        fwImg = __built || __fwOld;
        fwKey = __built ? cacheKey : "";
        try {
            console.log("[FW] [宿主] 壁纸生成 " + w + "x" + h + (low ? "（低清预热）" : "") +
                " 用时 " + ((new Date()).getTime() - __t0) + "ms");
        } catch (eL) {}
        if (!__built) fwFailAt = (new Date()).getTime();
    } catch (e2) {
        fwImg = __fwOld;
        fwKey = "";
        fwFailAt = (new Date()).getTime();
    } finally {
        fwBuilding = false;
    }
    return fwImg;
}


/* soft = 切歌 / 停止这类「可能不需要重建」的场合：
   先比一次 key（含封面指纹），一样就只重绘、两次构建全部跳过。 */
function fwQueue(ms, soft) {
    if (fwTimer) { clearTimeout(fwTimer); fwTimer = 0; }
    if (fwTimer2) { clearTimeout(fwTimer2); fwTimer2 = 0; }
    fwTimer = setTimeout(function () {
        fwTimer = 0;
        if (rsLive) { fwQueue(200, soft); return; }
        try { fwApplyCfg(); } catch (eA) {}
        if (soft) {
            var same = false;
            try { same = fwKeySame(); } catch (eK) { same = false; }
            if (same) {
                try { window.Repaint(); } catch (eR0) {}
                try { console.log("[FW] [宿主] 封面未变，跳过壁纸重建（" + fwArtKeyPart() + "）"); } catch (eL0) {}
                return;
            }
        }
        try { fwEnsure(true, 0.5); } catch (e1) {}
        try { window.Repaint(); } catch (e) {}
        try { window.NotifyOthers("fullscreenWallpaperRepaint", true); } catch (eN) {}
        fwTimer2 = setTimeout(function () {
            fwTimer2 = 0;
            try { fwEnsure(true); } catch (e2) {}
            try { window.Repaint(); } catch (e3) {}
            try { fwRefreshGlass(); } catch (e4) {}
            try { window.NotifyOthers("fullscreenWallpaperRepaint", true); } catch (e5) {}
        }, 300);
    }, ms == null ? 250 : ms);
}

function fwGlassAll(force) {
    var hostOn = false;
    try { hostOn = fw_hostOn(); } catch (e0) { hostOn = false; }
    var n = 0;
    try { n = window.GetPanelCount(); } catch (e1) { n = 0; }
    for (var i = 0; i < n; ++i) {
        var p = null;
        try { p = window.GetPanelByIndex(i); } catch (e2) { p = null; }
        if (!p) continue;
        var on = hostOn;
        if (p.__fwOpaque) on = false;
        if (p.__fwNpp && on) {
            var circle = true, txt = false;
            try { circle = !!p.GetProperty("显示·圆形模式", true); } catch (e3) {}
            try { txt = !!p.GetProperty("显示曲目信息", false); } catch (e4) {}
            on = (circle || txt);
        }
        if (!force && p.__fwGlass === on) continue;
        p.__fwGlass = on;
        try { p.SupportPseudoTransparency = on; } catch (e5) {}
        try { p.ShowCaption = false; } catch (e6) {}
        try { p.Repaint(); } catch (e7) {}
    }
}

function fwRefreshGlass() {
    var n = 0;
    try { n = window.GetPanelCount(); } catch (e) { n = 0; }
    var hit = 0;
    for (var i = 0; i < n; ++i) {
        var p = null;
        try { p = window.GetPanelByIndex(i); } catch (e) { p = null; }
        if (!p) continue;
        ++hit;
        try { p.Repaint(); } catch (e3) {}
    }
    if (hit) { try { window.Repaint(); } catch (e4) {} }
}

function on_paint(gr) {
    var w = window.Width, h = window.Height;
    if (!fw_hostOn()) {
        var bg = 0xff1e1e1e;
        try {
            bg = ((window.InstanceType === 1) ? window.GetColourDUI(3) : window.GetColourCUI(3)) | 0xff000000;
        } catch (eB) {}
        gr.FillSolidRect(0, 0, w, h, bg);
        return;
    }
    gr.SetSmoothingMode(0);
    fw_drawWallpaper(gr, w, h, fwImg);
}

window.SetTimeout(arrange, 0);
window.SetTimeout(arrange, 40);
window.SetTimeout(arrange, 120);
window.SetTimeout(arrange, 300);
window.SetTimeout(arrange, 700);

window.SetTimeout(function () {
    try { fwSeedShared(); } catch (e) {}
    try { if (fw_hostOn()) fwQueue(0); } catch (eF) {}
}, 300);

window.SetInterval(function () {
    try { arrange(); } catch (e) {}
    try { if (!fwImg && !fwTimer && !fwTimer2 && fw_hostOn()) fwQueue(0); } catch (eF) {}
}, 2500); // PATCH(perf): 600→2500ms —— 摆位以通知驱动为主，此间隔仅为兜底扫描
