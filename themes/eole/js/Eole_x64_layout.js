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

    var fwSig = '';
    try {
        fwSig = (fw_hostOn() ? '1' : '0') + '/' +
                (window.GetProperty("显示·圆形模式", true) ? '1' : '0') + '/' +
                (window.GetProperty("显示曲目信息", false) ? '1' : '0');
    } catch (e) { fwSig = ''; }
    out.push(fwSig);

    return out.join(',');
}


function arrange(arg) {
    /* arg: 'live'  = 正在拖动尺寸（只重排，不折腾显隐）
            'force' = 松手后补一次完整重排（不看 layoutKey）
            其它    = 常规调用
       注意下面还有个 var mode（主面板编号），两者不是一回事。 */
    /* 除了 on_size 显式传 'live'，其它来源（600ms 轮询、消息触发的 arrange()）
       在拖动期间也要降级成 live，否则它们会跑全隐全显，照样闪。 */
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
    /* 拖动尺寸时绝对不能再全隐全显：13 个子面板每帧隐藏再显示一次，
       就是肉眼看到的"闪一闪"。这里只跳过隐藏，Move/Show(true) 照常走。 */
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
                panel('LyricsTitle', mainWidth - lyricsWidth, top, lyricsWidth, 28);
                panel('Lyrics', mainWidth - lyricsWidth, top + 28, lyricsWidth, bodyHeight - 28);
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

/* 尺寸拉完（停顿 260ms）才重建壁纸、刷玻璃。
   拖动过程中 on_size 每帧都来，若每次都往 fwQueue 里塞，
   停一下就会跑 fwEnsure(true, 0.5) + 300ms 后 fwEnsure(true) 两次全量模糊，
   两者都是同步阻塞 UI 线程的，所以表现为"边拉边闪"。 */
function fwScheduleResizeSettle() {
    if (rsTimer) { clearTimeout(rsTimer); rsTimer = 0; }
    rsTimer = setTimeout(function () {
        rsTimer = 0;
        /* 尺寸没变 = 只是最小化后恢复、或被别的窗口遮挡后重新显示。
           arrange('force') 会把 13 个子面板先全部 Show(false) 再逐个 Show(true)，
           每个面板在画出内容之前露的是窗口默认底色，肉眼就是「黑一下，然后
           一个一个加载」。这种场景只需要请各面板重画一次，不要重排。 */
        var w = 0, h = 0;
        try { w = window.Width; h = window.Height; } catch (eW) { w = 0; h = 0; }
        /* 最小化过程中 on_size 可能报 0 尺寸。这时既不能重排、更不能把 0 记进
           基准——否则恢复时 1400 !== 0，又会被判成"尺寸变了"而重排一次。 */
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
        /* 这里直接全质量重建一次，不走 fwQueue：fwQueue 会先跑 0.5 低清预热、
           300ms 后再全清，等于多算一遍；松手时画面本来就有旧图顶着，不需要预热。 */
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
    /* fb2k 换过界面深浅：标题栏按钮写下的壁纸覆盖失效，回到自动跟随。 */
    try {
        if (typeof fw_themeStale === 'function' && fw_themeStale()) fw_clearThemeDark();
    } catch (eS) {}
    try { fw_isDark(true); } catch (e0) {}
    try { if (fw_hostOn()) fwQueue(60); } catch (e) {}
    /* 外部面板（简介、Lxbox）只认 fb2k 配色，这里把"失效后回到自动跟随"的结果
       再广播一次，免得它们还停在上一轮的深 / 浅上。 */
    try { window.NotifyOthers('fw_theme_dark', !!fw_isDark()); } catch (eB) {}
}

function on_notify_data(name, info) {
    /* 外部面板（SMPbiography、Lxbox）读不到本主题的面板属性，它们启动时会来问一次
       "现在到底是深还是浅"，这里回一条它们认识的广播。不回的话它们只能按
       fb2k 的 CUI/DUI 配色猜，标题栏按钮切了它们也不动。 */
    if (name === 'fw_theme_request') {
        var dreq = false;
        try { dreq = !!fw_isDark(); } catch (eReq) { dreq = false; }
        try { window.NotifyOthers('fw_theme_dark', dreq); } catch (eReq2) {}
        return;
    }
    /* 深 / 浅切换：壁纸是宿主画的，必须自己收下状态、重建一次，
       否则只有面板变色、背景不动。global_dark_theme 是标题栏切全部面板时
       顺带发的，一并当作壁纸切换处理（否则会落到末尾的 arrange() 重排）。 */
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
        /* Lxbox 挂好流播封面后会把图片路径广播过来。宿主这边壁纸是整窗背景，
           子面板的封面框归各自面板管，但背景归这里，所以要收下路径重建壁纸。 */
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
        window.SetTimeout(function () {
            try { fw_hostOn(true); } catch (eS) {}
            try { arrange(); } catch (e) {}
            fwQueue(30);
        }, 0);
        return;
    }
    if (name === 'fullscreenWallpaperRefit') {
        fwQueue(30);
        return;
    }
    window.SetTimeout(arrange, 0);
}

var fwImg = null;
var fwKey = "";
var g_fwExtCover = "";
var fwTimer = 0;
var fwTimer2 = 0;
var fwFailAt = 0;
var rsLive = false;      /* 正在拖动尺寸 */
var rsTimer = 0;
/* 上一次真正重排时窗口的尺寸。从任务栏恢复 / 被遮挡后重新显示也会触发
   on_size，但尺寸其实没变；这时绝不能重排（原因见 fwScheduleResizeSettle）。 */
var rsLastW = -1, rsLastH = -1;
var fwBuilding = false;
var fwLastW = 0, fwLastH = 0;

function fwEnsure(force, qOverride) {
    if (!fw_hostOn()) {
        fwImg = null;
        fwKey = "";
        return null;
    }
    var w = window.Width, h = window.Height;
    if (!(w > 0 && h > 0)) return null;

    var low = (typeof qOverride === 'number' && qOverride > 0);

    var src = fw_pickSource();
    var key = [w, h, fw_isDark() ? 1 : 0, fw_source(), src.path || "-",
        fw_blurValue(), fw_maskAlpha(), fw_quality(),
        (typeof g_fwExtCover === 'string' ? g_fwExtCover : '')].join(":");
    if (fw_source() !== 1 || !src.path) {
        var h0 = null;
        try { h0 = fb.GetNowPlaying(); } catch (e) { h0 = null; }
        key += ":" + (h0 ? h0.Path : "none");
    }
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

    fwBuilding = true;
    try {
        var np = null;
        try { np = fb.GetNowPlaying(); } catch (e) { np = null; }
        var __t0 = (new Date()).getTime();
        fwImg = low ? fw_buildWallpaper(w, h, np, qOverride) : fw_buildWallpaper(w, h, np);
        fwKey = fwImg ? cacheKey : "";
        try {
            console.log("[FW] [宿主] 壁纸生成 " + w + "x" + h + (low ? "（低清预热）" : "") +
                " 用时 " + ((new Date()).getTime() - __t0) + "ms");
        } catch (eL) {}
        if (!fwImg) fwFailAt = (new Date()).getTime();
    } catch (e2) {
        fwImg = null;
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
        if (rsLive) { fwQueue(200); return; }   /* 还在拖，重建会卡画面，往后推 */
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
    /* 拖动尺寸期间不重建壁纸：直接拿上一张按新尺寸拉伸顶着，
       松手后由 fwScheduleResizeSettle 一次性重建。
       fw_drawWallpaper 本身就是 DrawImage 拉伸，不会出现黑边。 */
    var img = rsLive ? fwImg : fwEnsure(false);
    fw_drawWallpaper(gr, w, h, img);
}

window.SetTimeout(arrange, 0);
window.SetTimeout(arrange, 40);
window.SetTimeout(arrange, 120);
window.SetTimeout(arrange, 300);
window.SetTimeout(arrange, 700);

window.SetTimeout(function () { try { fwSeedShared(); } catch (e) {} }, 300);

window.SetInterval(function () { try { arrange(); } catch (e) {} }, 600);
