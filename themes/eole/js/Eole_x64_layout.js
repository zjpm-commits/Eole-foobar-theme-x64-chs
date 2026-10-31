// Eole layout for JSplitter x64. Original panel scripts: Ottodix and contributors.
window.DefinePanel('Eole x64 layout', {author: 'Eole contributors / local adaptation'});
var settingRoot = fb.ProfilePath + 'wsh-data\\eole-settings\\';
function setting(prefix, fallback) {
    try {
        var files = utils.Glob(settingRoot + prefix + '_*');
        if (!files.length) return fallback;
        var value = Number(files[0].substring(files[0].lastIndexOf('_') + 1));
        return isFinite(value) ? value : fallback;
    } catch (e) { return fallback; }
}

// ---- panel lookup -------------------------------------------------------
// window.GetPanel(name) THROWS when no child panel matches, which used to abort
// the whole layout. It also only matches the *registered* name of a child, so a
// panel whose script failed to load (or that reports another name, e.g. the
// "Lxbox" slot running 洛雪音源) is never found by that exact string.
// Here a missing panel is skipped instead of killing arrange(), and the lookup
// also matches PanelObject.Name / PanelObject.Text and can claim the one child
// that does not belong to the standard Eole panel set.
var KNOWN_PANELS = ['Eole x64 layout', 'TitleBar', 'CoverPanel', 'Controls', 'LibraryFilter',
    'LibraryTree', 'GraphicBrowser', 'SmoothPlaylistManager', 'PlaylistFilter1', 'PlaylistFilter2',
    'PlaylistFilter3', 'PlaylistHeader', 'BottomPlaylist', 'Biography', 'LyricsTitle', 'Lyrics',
    'TrackInfo', 'NowPlayingPlaylist'];
var KNOWN_KEYS = {};
(function() {
    for (var i = 0; i < KNOWN_PANELS.length; ++i) KNOWN_KEYS[normalize(KNOWN_PANELS[i])] = true;
})();

function normalize(name) {
    return String(name == null ? '' : name).replace(/\s+/g, ' ').trim().toLowerCase();
}

var PANEL_INDEX = null;
function buildPanelIndex() {
    var list = [], n = 0;
    try { n = window.GetPanelCount(); } catch (e) { n = 0; }
    for (var i = 0; i < n; ++i) {
        var p = null;
        try { p = window.GetPanelByIndex(i); } catch (e) { continue; }
        if (!p) continue;
        var keys = [];
        try { if (p.Name) keys.push(normalize(p.Name)); } catch (e) {}
        try { if (p.Text) keys.push(normalize(p.Text)); } catch (e) {}
        list.push({ panel: p, keys: keys });
    }
    PANEL_INDEX = list;
    return list;
}

function findPanel(name) {
    if (!name) return null;
    try { var exact = window.GetPanel(name); if (exact) return exact; } catch (e) {}
    if (!PANEL_INDEX) buildPanelIndex();
    var key = normalize(name);
    for (var i = 0; i < PANEL_INDEX.length; ++i) {
        var keys = PANEL_INDEX[i].keys;
        for (var k = 0; k < keys.length; ++k) if (keys[k] === key) return PANEL_INDEX[i].panel;
    }
    return null;
}

// First child panel that is not part of the standard Eole set (e.g. the
// visualization / Lxbox slot, whatever name its script registers).
function unknownPanel() {
    if (!PANEL_INDEX) buildPanelIndex();
    for (var i = 0; i < PANEL_INDEX.length; ++i) {
        var keys = PANEL_INDEX[i].keys, known = false;
        for (var k = 0; k < keys.length; ++k) if (KNOWN_KEYS[keys[k]]) { known = true; break; }
        if (!known) return PANEL_INDEX[i].panel;
    }
    return null;
}

function firstPanel(names) {
    for (var i = 0; i < names.length; ++i) {
        var p = findPanel(names[i]);
        if (p) return p;
    }
    return null;
}

var previousLayout = "";
function arrange() {
    var w = window.Width, h = window.Height;
    if (w < 1 || h < 1) return;
    var layoutKey = w + ":" + h + ":" + settingRoot;
    try { layoutKey += ":" + utils.Glob(settingRoot + "*").join("|"); } catch (e) {}
    if (layoutKey === previousLayout) return;
    previousLayout = layoutKey;
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
    PANEL_INDEX = null;
    buildPanelIndex();
    for (var i = 0; i < PANEL_INDEX.length; ++i) {
        try { PANEL_INDEX[i].panel.Show(false); } catch (e) {}
    }
    // names: a single panel name, or a list of accepted fallbacks.
    // useUnknown: last resort, claim the non-Eole child panel.
    function panel(names, x, y, width, height, useUnknown) {
        if (width <= 0 || height <= 0) return null;
        var p = firstPanel(typeof names === 'string' ? [names] : names);
        if (!p && useUnknown) p = unknownPanel();
        if (!p) return null;
        try {
            p.Move(Math.round(x), Math.round(y), Math.max(1, Math.round(width)), Math.max(1, Math.round(height)));
            p.Show(true);
        } catch (e) { return null; }
        return p;
    }
    panel('TitleBar', 0, 0, w, top);
    var cover = mini ? setting('COVERPANELMINI', 1) : setting('COVERPANELBIG', 1);
    var coverWidth = cover ? bottom : 0;
    panel('CoverPanel', 0, h - bottom, coverWidth, bottom);
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
            // Without the optional "Lyrics" panel the area would stay empty.
            if (!findPanel('Lyrics')) lyricsWidth = 0;
            panel('Biography', 0, top, mainWidth - lyricsWidth, bodyHeight);
            if (lyricsWidth > 0) {
                panel('LyricsTitle', mainWidth - lyricsWidth, top, lyricsWidth, 28);
                panel('Lyrics', mainWidth - lyricsWidth, top + 28, lyricsWidth, bodyHeight - 28);
            }
        } else {
            // "Lxbox" is an optional panel (visualization / 洛雪音源 slots).
            // Take it by name first, otherwise claim the non-standard child,
            // otherwise degrade to a panel that is always present.
            panel(['Lxbox', '洛雪音源', 'LX Music'], 0, top, mainWidth, bodyHeight, true) ||
                panel(['GraphicBrowser', 'BottomPlaylist', 'NowPlayingPlaylist'], 0, top, mainWidth, bodyHeight);
        }
    }
    if (right) {
        var info = mini ? 0 : setting('TRACKINFOS' + suffix, mode >= 2 ? 1 : 0);
        if (info && !findPanel('TrackInfo')) info = 0;
        var infoHeight = info ? Math.min(right + 41, bodyHeight / 2) : 0;
        var rx = mini ? 0 : mainWidth;
        if (info) panel('TrackInfo', rx, info === 2 ? top + bodyHeight - infoHeight : top, right, infoHeight);
        panel(['NowPlayingPlaylist', 'BottomPlaylist'], rx, info === 1 ? top + infoHeight : top, right, bodyHeight - infoHeight);
    }
    window.Repaint();
}
function on_size() { try { arrange(); } catch (e) {} }
function on_notify_data(name, info) { window.SetTimeout(arrange, 0); }
function on_paint(gr) { gr.FillSolidRect(0, 0, window.Width, window.Height, 0xff1e1e1e); }
window.SetTimeout(arrange, 100);
