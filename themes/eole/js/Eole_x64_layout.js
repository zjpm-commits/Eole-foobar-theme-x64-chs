// ============================================================================
// Eole 布局脚本 —— JSplitter x64 版
// ----------------------------------------------------------------------------
// 这个面板本身什么都不显示，它只干一件事：按当前窗口尺寸和皮肤里的各种开关，
// 把同一个窗口里的其它子面板（标题栏、封面、播放控制、筛选器、媒体库、
// 播放列表、右侧栏……）摆到该在的位置、给该有的尺寸。所有面板都是
// 「绝对坐标 + Move」，没有用到 splitter 的自动分割。
//
// 数据来源：Eole 的各个面板把设置写成文件，路径形如
//     <foobar2000 配置目录>\wsh-data\eole-settings\<键名>_<值>
// 例如 RIGHTPLAYLISTWIDTH_240 就表示右侧栏宽 240。所以本脚本不去问面板
// 要设置，而是直接枚举这个目录里的文件名——这也是后面必须用 utils.Glob
// 的原因。目录里同一个键只会存在一个文件（换值时先删旧的再写新的）。
//
// 摆位是事件驱动的：面板改设置后会 NotifyOthers("eole_x64_layout")，
// on_notify_data 的兜底分支随即 arrange()。低频 SetInterval 只作兜底
// （兜设置文件改动没发通知的情况 + 壁纸生成失败后的重试），平时不扫盘。
// ============================================================================
// 原始面板脚本作者：Ottodix 及贡献者，这里是本地适配版。
window.DefinePanel('Eole x64 layout', {author: 'Eole contributors / local adaptation'});

try {
    include(fb.ProfilePath + 'themes\\eole\\js\\JStheme_common.js');
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


var settingRoot = fb.ProfilePath + 'wsh-data\\eole-settings\\';

function setting(prefix, fallback) {
    try {
        var files = utils.Glob(settingRoot + prefix + '_*');
        if (!files.length) return fallback;
        var value = Number(files[0].substring(files[0].lastIndexOf('_') + 1));
        return isFinite(value) ? value : fallback;
    } catch (e) { return fallback; }
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

var INFO_EXTRA_HEIGHT = 41;

var FINGERPRINT_KEYS = ['MAINPANEL', 'LAYOUT', 'COMPACTTITLEBAR', 'LIBRARYFILTER', 'LIBRARYFILTERWIDTH',
    'LIBRARYTREE', 'PLAYLISTPANELWIDTH', 'FILTERSPANEL', 'FILTER1', 'FILTER2', 'FILTER3', 'LYRICS',
    'NOWPLAYINGLIB', 'NOWPLAYINGPLAYLIST', 'NOWPLAYINGBIO', 'NOWPLAYINGVISU', 'RIGHTPLAYLISTWIDTH',
    'COVERPANELBIG', 'COVERPANELMINI', 'MINICONTROLBAR', 'SHOWTRACKINFOBIG', 'SHOWTRACKINFOSMALL',
    'TRACKINFOSLIB', 'TRACKINFOSPLAYLIST', 'TRACKINFOSBIO', 'TRACKINFOSVISU', 'TRACKINFOSTEXT'];


function snapshot() {
    var files = null;
    try { files = utils.Glob(settingRoot + "*"); } catch (e) { files = null; }
    if (!files) return null;
    var map = {};
    for (var i = 0; i < files.length; ++i) {
        var path = String(files[i]);
        //   ...\eole-settings\RIGHTPLAYLISTWIDTH_240
        var us = path.lastIndexOf('_'), sl = Math.max(path.lastIndexOf('\\'), path.lastIndexOf('/'));
        if (us > sl && us > 0) map[path.substring(sl + 1, us)] = path.substring(us + 1);
    }
    var out = [];
    for (var k = 0; k < FINGERPRINT_KEYS.length; ++k) out.push(map[FINGERPRINT_KEYS[k]] || '');

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

    var suffix = ['LIB', 'PLAYLIST', 'BIO', 'VISU'][mode] || 'LIB';
    var right = mini ? w : setting('NOWPLAYING' + suffix, 1) ?
        Math.min(setting('RIGHTPLAYLISTWIDTH', 210), Math.floor(w * 0.4)) : 0;
    var mainWidth = w - right;

    var panelCount = 0;
    try { panelCount = window.GetPanelCount(); } catch (e) { panelCount = 0; }
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
            try { circle = !!window.GetProperty("显示·圆形模式", true); } catch (e2) {}
            try { txt = !!window.GetProperty("显示曲目信息", false); } catch (e3) {}
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
            var lyrics = setting('LYRICS', 1);
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
        if (info) panel('TrackInfo', rx, info === 2 ? top + bodyHeight - infoHeight : top, right, infoHeight);
        var npp = panel(['NowPlayingPlaylist', 'BottomPlaylist'], rx, info === 1 ? top + infoHeight : top, right,
            bodyHeight - infoHeight);
        if (npp && getPanel('NowPlaying') === npp) glassNowPlaying(npp, true);
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
    try { if (fw_hostOn() && fw_source() !== 1) fwQueue(120); } catch (e) {}
}
function on_playback_stop() {
    try { if (fw_hostOn() && fw_source() !== 1) fwQueue(120); } catch (e) {}
}
function on_colours_changed() {
    try {
        if (typeof fw_themeStale === 'function' && fw_themeStale()) fw_clearThemeDark();
    } catch (eS) {}
    try { fw_isDark(true); } catch (e0) {}
    try { if (fw_hostOn()) fwQueue(60); } catch (e) {}
    try { window.NotifyOthers('fw_theme_dark', !!fw_isDark()); } catch (eB) {}
}

function on_notify_data(name, info) {
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
                fwQueue(60);
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
    window.SetTimeout(function () {
        try { fwGlassAll(false); } catch (eGA) {}
        try { arrange(); } catch (eA2) {}
    }, 0);
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
    if (fw_source() !== 1 || !src.path) {
        var h0 = null;
        try { h0 = fb.GetNowPlaying(); } catch (e) { h0 = null; }
        key += ":" + (h0 ? h0.Path : "none");
    }
    return key;
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


function fwQueue(ms) {
    if (fwTimer) { clearTimeout(fwTimer); fwTimer = 0; }
    if (fwTimer2) { clearTimeout(fwTimer2); fwTimer2 = 0; }
    fwTimer = setTimeout(function () {
        fwTimer = 0;
        if (rsLive) { fwQueue(200); return; }
        try { fwApplyCfg(); } catch (eA) {}
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
            try { circle = !!window.GetProperty("显示·圆形模式", true); } catch (e3) {}
            try { txt = !!window.GetProperty("显示曲目信息", false); } catch (e4) {}
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
