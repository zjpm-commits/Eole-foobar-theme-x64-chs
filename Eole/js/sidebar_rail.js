/* ============================================================================
   折叠侧边栏 —— 第 4 种标题栏布局的左侧常驻入口
   ----------------------------------------------------------------------------
   这个面板由 DUI 布局里的一个 JSplitter 元素提供，caption / Name 必须是
   Sidebar：Eole_layout.js 用 window.GetPanel('Sidebar') 找它，并配合
   eole-settings\SIDEBARCOLLAPSED_0/1 两个条件决定要不要启用第 4 种布局。
   老三种标题栏布局里没有这张面板，本脚本根本不会跑，零影响。

   设计口径（与用户逐条拍板过的最终版一致）：
     * 展开态固定 128px、折叠态固定 48px，不做鼠标拖宽；
     * 窗口宽度不足（< RAIL_BREAK_W）时由 Eole_layout 自动折到 48，
       本面板只按「自己被摆成多宽」决定画不画文字，不自己判断阈值；
     * 没有悬停展开、没有搜索框；展开/收起只在标题栏点 ☰；
     * 7 个入口常驻（含 MilkDrop / MPV），模式 6（主题设置）不隐藏侧栏，
       只把「主题设置」这一项点亮；
     * MilkDrop / MPV 不可用时点一下弹「未安装」，不切模式。

   图标整套改用 Segoe MDL2 Assets 字形（E700/E8F1/E8FD/E8A5/E8D6/E9D9/E714/E713），
   不再往 img\icons\dark|white 里补 png：一套码位同时吃深浅两套配色和折叠态，
   还能随 DPI 清晰缩放。字体缺失时自动退回「只画文字」。
   ============================================================================ */

if (typeof GetGrey === 'undefined') {
    try { include(fb.ProfilePath + 'Eole\\js\\theme_common.js'); } catch (e0) {}
}
if (typeof panelSetting === 'undefined') {
    try { include(fb.ProfilePath + 'Eole\\js\\pss_switch.js'); } catch (e1) {}
}

try {
    window.DefinePanel('Sidebar', {
        author: 'Eole contributors / local adaptation',
        version: (typeof globalProperties !== 'undefined' && globalProperties.theme_version) ? globalProperties.theme_version : '',
        features: { drag_n_drop: false }
    });
} catch (eDefine) {}

var properties = {
    darklayout: window.GetProperty("显示·深色布局", false),
    stick2darklayout: false,
    /* theme_common 的 get_font() 会加这个偏移；没有它 g_fsize 会变 NaN */
    panelFontAdjustement: 0
};

var ww = 0, wh = 0;

/* 顶部折叠按钮：44px 高的独立头部，图标 F168（竖条+三横），展开 / 折叠都不换字形 */
var RAIL_HEADER_H = 44;
var RAIL_HEADER_GLYPH = '\uF168';

/* 7 个入口：mode 对应 pss_switch.js 的 main_panel_state 0…6。
   图标整套用 Segoe MDL2 Assets：E8F1 本地音乐 / E90B 播放列表 / E779 简介歌词 /
   E8D6 洛雪音源 / E9D9 可视化 / E786 视频 / E713 主题设置。 */
var RAIL_ITEMS = [
    { mode: 0, label: '本地音乐', glyph: '\uE8F1' },
    { mode: 1, label: '播放列表', glyph: '\uE90B' },
    { mode: 2, label: '简介歌词', glyph: '\uE779' },
    { mode: 3, label: '洛雪音源', glyph: '\uE8D6' },
    { mode: 4, label: '可视化',   glyph: '\uE9D9' },
    { mode: 5, label: '视频',     glyph: '\uE786' },
    { mode: 6, label: '主题设置', glyph: '\uE713' }
];

var g_rail = {
    hover: -1,
    hoverHeader: false,
    scroll: 0,
    scrollMax: 0,
    itemH: 44,
    /* MilkDrop / MPV 在不在：-1 未知（还没收到 Eole_layout 的答复）、0 不在、1 在 */
    mdOk: -1,
    mpvOk: -1,
    /* 「显示可视化标签页」那条属性：0 = 洛雪音源入口不摆，1 = 摆 */
    lxOk: 1,
    /* 当前实际显示的入口（过滤后的列表，索引与绘制/命中一致） */
    items: []
};

/* 按属性过滤入口：洛雪音源被「设置... → 隐藏洛雪音源面板」关掉时，这一项直接不出现在侧栏 */
function railVisibleItems() {
    var list = [];
    for (var i = 0; i < RAIL_ITEMS.length; ++i) {
        var it = RAIL_ITEMS[i];
        if (it.mode === 3 && g_rail.lxOk === 0) continue;
        list.push(it);
    }
    return list;
}

var g_rail_glyphOk = true;
try { g_rail_glyphOk = !!utils.CheckFont('Segoe MDL2 Assets'); } catch (eGlyph) { g_rail_glyphOk = true; }

function get_colors() {
    get_colors_global();
    /* 激活条用主题自己的提香红（图标同一色），深浅两套都不换 */
    colors.rail_accent = RGB(176, 91, 36);
    if (properties.darklayout || properties.stick2darklayout) {
        colors.rail_hover = GetGrey(255, 42);
        colors.rail_active = GetGrey(255, 26);
        colors.rail_scroll = GetGrey(255, 55);
    } else {
        colors.rail_hover = GetGrey(0, 22);
        colors.rail_active = GetGrey(0, 12);
        colors.rail_scroll = GetGrey(0, 110);
    }
    colors.rail_txt = colors.normal_txt;
    colors.rail_txt_dim = colors.faded_txt;
}

/* ---------------------------------------------------------------- 尺寸/布局 */

function railItemGap() { return 2; }
function railTopPad() { return 10; }

function railRecalc() {
    g_rail.items = railVisibleItems();
    var n = g_rail.items.length;
    var gap = railItemGap(), pad = railTopPad() * 2;
    /* 可用高度要扣掉顶部折叠按钮那一条 */
    var avail = Math.max(0, wh - RAIL_HEADER_H);
    var fit = Math.floor((avail - pad - gap * (n - 1)) / n);
    var itemH = 44;
    if (fit < 44) itemH = 36;
    if (fit < 36) itemH = Math.max(24, fit);
    g_rail.itemH = itemH;
    var content = RAIL_HEADER_H + pad + n * itemH + gap * (n - 1);
    g_rail.scrollMax = Math.max(0, content - wh);
    if (g_rail.scroll > g_rail.scrollMax) g_rail.scroll = g_rail.scrollMax;
    if (g_rail.scroll < 0) g_rail.scroll = 0;
    if (g_rail.hover >= n) g_rail.hover = -1;
}

function railItemRect(i) {
    var gap = railItemGap();
    var y = RAIL_HEADER_H + railTopPad() + i * (g_rail.itemH + gap) - g_rail.scroll;
    return { x: 8, y: y, w: Math.max(1, ww - 16), h: g_rail.itemH };
}

/* 顶部折叠按钮的命中区：折叠（48 宽）只算图标那一列，展开时图标 + 文字整条都算按钮 */
function railHeaderHit(x, y) {
    if (y < 0 || y >= RAIL_HEADER_H) return false;
    if (railExpanded()) return (x >= 8 && x < ww - 8);
    return (x >= 0 && x < Math.min(ww, 48));
}

/* 展开 / 折叠只看自己被摆成多宽：布局给 128 就带文字，给 48 就只留图标 */
function railExpanded() { return ww >= 100; }

function railItemAt(x, y) {
    if (x < 0 || x >= ww || y < 0 || y >= wh) return -1;
    for (var i = 0; i < g_rail.items.length; ++i) {
        var r = railItemRect(i);
        if (y >= r.y && y < r.y + r.h) return i;
    }
    return -1;
}

/* ---------------------------------------------------------------- 绘制 */

function railDrawItem(gr, i, iconFont, labelFont) {
    var item = g_rail.items[i];
    if (!item) return;
    var r = railItemRect(i);
    if (r.y + r.h < 0 || r.y > wh) return;

    var mode = (typeof main_panel_state !== 'undefined') ? Number(main_panel_state.value) : -1;
    var active = (mode === item.mode);
    var hover = (g_rail.hover === i);

    if (active) {
        gr.FillRoundRect(r.x, r.y, r.w, r.h, 6, 6, colors.rail_active);
        /* 左侧激活条：与 Win11 播放器同款，3px、上下各缩 6px */
        gr.FillSolidRect(0, r.y + 6, 3, Math.max(1, r.h - 12), colors.rail_accent);
    } else if (hover) {
        gr.FillRoundRect(r.x, r.y, r.w, r.h, 6, 6, colors.rail_hover);
    }

    var txt = active ? colors.normal_txt : colors.rail_txt;
    /* 图标盒 24 的横坐标固定为 12：折叠（48）与展开（128）两种宽度下都不动，
       图标中心正好落在左侧 48px 那一列的中线上，切换时不产生横向跳动 */
    var iconX = 12;
    if (iconFont) {
        gr.GdiDrawText(item.glyph, iconFont, txt, iconX, r.y, 24, r.h,
            DT_CENTER | DT_VCENTER | DT_SINGLELINE | DT_NOPREFIX);
    }
    if (railExpanded() && labelFont) {
        var tx = iconX + 24 + 10;
        var tw = Math.max(10, r.x + r.w - tx - 8);
        gr.GdiDrawText(item.label, labelFont, txt, tx, r.y, tw, r.h,
            DT_LEFT | DT_VCENTER | DT_SINGLELINE | DT_NOPREFIX | DT_END_ELLIPSIS);
    }
}

function railDrawScrollbar(gr) {
    if (g_rail.scrollMax <= 0) return;
    var w = 4, x = ww - 6;
    var total = wh + g_rail.scrollMax;
    var thumbH = Math.max(24, Math.round(wh * wh / total));
    var thumbY = Math.round((wh - thumbH) * (g_rail.scroll / g_rail.scrollMax));
    try { gr.FillRoundRect(x, thumbY, w, thumbH, 2, 2, colors.rail_scroll); } catch (eSB) {
        gr.FillSolidRect(x, thumbY, w, thumbH, colors.rail_scroll);
    }
}

function on_paint(gr) {
    try {
        if (typeof fw_sharedOn === 'function' && fw_sharedOn() &&
            window.SupportPseudoTransparency !== true) window.SupportPseudoTransparency = true;
    } catch (ePT) {}
    if (!ww || !wh || ww < 8 || wh < 8) return;

    /* 有全屏壁纸时跟其它面板一样透出去；否则自己铺面板底色 */
    if (window.SupportPseudoTransparency !== true) {
        try { gr.FillSolidRect(0, 0, ww, wh, colors.normal_bg); } catch (eBG) {}
    }
    gr.SetTextRenderingHint(globalProperties.TextRendering);

    var labelFont = (typeof g_font !== 'undefined' && g_font.plus1) ? g_font.plus1 : null;
    var iconFont = null;
    if (g_rail_glyphOk && labelFont) {
        try { iconFont = gdi.Font('Segoe MDL2 Assets', labelFont.Size + 5); } catch (eIF) { iconFont = null; }
    }
    for (var i = 0; i < g_rail.items.length; ++i) railDrawItem(gr, i, iconFont, labelFont);
    railDrawHeader(gr, iconFont, labelFont);
    railDrawScrollbar(gr);
}

/* ---------------------------------------------------------------- 鼠标 */

function railWarn(kind) {
    var msg = (kind === 'milkdrop')
        ? 'MilkDrop 入口不可用：这套布局里没有 caption 为 MilkDrop 的 JS 面板。'
        : '视频入口不可用：未安装 foo_ui_webview2 组件，或布局里没有 caption 为 video 的视频面板。';
    try { fb.ShowPopupMessage(msg, '折叠侧边栏'); } catch (eWarn) { console.log('[sidebar] ' + msg); }
}

/* 顶部折叠按钮：44px 高的一条，图标横向落在左侧 48px 那一列（x 12，24 宽），
   和下面 7 个入口图标同一根竖线，展开 / 折叠都不动 */
function railDrawHeader(gr, iconFont, labelFont) {
    /* 展开态：图标 + 文字是一个整体按钮，悬停底色铺满整条；折叠态只剩图标那一小块 */
    var chipX = 8;
    var chipW = railExpanded() ? Math.max(32, ww - 16) : 32;
    if (g_rail.hoverHeader) {
        gr.FillRoundRect(chipX, 4, chipW, RAIL_HEADER_H - 8, 6, 6, colors.rail_hover);
    }
    if (iconFont) {
        gr.GdiDrawText(RAIL_HEADER_GLYPH, iconFont, colors.rail_txt, 12, 0, 24, RAIL_HEADER_H,
            DT_CENTER | DT_VCENTER | DT_SINGLELINE | DT_NOPREFIX);
    }
    /* 展开态在图标右侧补一行字，起点与下面各入口的文字同一条竖线（iconX+24+10 = 46） */
    if (railExpanded() && labelFont) {
        gr.GdiDrawText('折叠边栏', labelFont, colors.rail_txt, 46, 0, Math.max(10, ww - 46 - 8), RAIL_HEADER_H,
            DT_LEFT | DT_VCENTER | DT_SINGLELINE | DT_NOPREFIX | DT_END_ELLIPSIS);
    }
}

/* 点击顶部按钮：写折叠偏好 + 通知布局重排。展开前挡一下过窄的窗口（同标题栏原先的口径） */
function railToggleCollapse() {
    var pref = 0;
    try { pref = (typeof railCollapsePref === 'function') ? railCollapsePref() : 0; } catch (eP0) { pref = 0; }
    if (pref < 0) pref = 0;
    var next = (pref === 1) ? 0 : 1;
    if (next === 0) {
        var winW = 0;
        try { winW = Number(fb.Window.Width) || 0; } catch (eWW) { winW = 0; }
        var brk = (typeof RAIL_BREAK_W === 'number') ? RAIL_BREAK_W : 1030;
        if (winW > 0 && winW < brk) {
            try {
                fb.ShowPopupMessage('窗口太窄：展开 128px 侧栏会把主区压到 900px 以下。\n请把窗口拉宽到 ' +
                    brk + 'px 以上再展开。', '折叠侧边栏');
            } catch (ePM) {}
            return;
        }
    }
    try { if (typeof railCollapsePrefSet === 'function') railCollapsePrefSet(next); } catch (ePS) {}
    try { window.NotifyOthers('eole_layout', true); } catch (eEL) {}
    window.Repaint();
}

function railSelect(i) {
    var item = g_rail.items[i];
    if (!item) return;
    /* 未安装的入口只提示、不切模式（切过去也只会看到一块兜底空面板） */
    if (item.mode === 4 && g_rail.mdOk === 0) { railWarn('milkdrop'); return; }
    if (item.mode === 5 && g_rail.mpvOk === 0) { railWarn('mpv'); return; }
    if (typeof main_panel_state === 'undefined') return;
    if (Number(main_panel_state.value) === item.mode) return;
    try { main_panel_state.setValue(item.mode); } catch (eSet) {}
    window.Repaint();
}

function on_mouse_move(x, y) {
    var hdr = railHeaderHit(x, y);
    var h = hdr ? -1 : railItemAt(x, y);
    if (hdr !== g_rail.hoverHeader || h !== g_rail.hover) {
        g_rail.hoverHeader = hdr;
        g_rail.hover = h;
        window.Repaint();
    }
    try { window.SetCursor((hdr || h >= 0) ? IDC_HAND : IDC_ARROW); } catch (eCur) {}
}

function on_mouse_leave() {
    if (g_rail.hover !== -1 || g_rail.hoverHeader) {
        g_rail.hover = -1;
        g_rail.hoverHeader = false;
        window.Repaint();
    }
}

function on_mouse_lbtn_up(x, y) {
    if (railHeaderHit(x, y)) { railToggleCollapse(); return; }
    var i = railItemAt(x, y);
    if (i >= 0) railSelect(i);
}

function on_mouse_wheel(step) {
    if (g_rail.scrollMax <= 0) return;
    var delta = (typeof step === 'number') ? step : 0;
    if (!delta) return;
    g_rail.scroll -= delta * 40;
    if (g_rail.scroll < 0) g_rail.scroll = 0;
    if (g_rail.scroll > g_rail.scrollMax) g_rail.scroll = g_rail.scrollMax;
    window.Repaint();
}

/* ---------------------------------------------------------------- 回调 */

function on_size(w, h) {
    ww = w;
    wh = h;
    railRecalc();
    window.Repaint();
}

function on_font_changed() {
    try { get_font(); } catch (eF) {}
    window.Repaint();
}

function on_notify_data(name, info) {
    /* 模式 / 面板私有状态从别的面板同步过来（含 main_panel_state） */
    if (typeof syncStateFromNotify === 'function' && syncStateFromNotify(name, info)) {
        window.Repaint();
    }
    /* Eole_layout 报「MilkDrop / MPV 在不在」：格式 "md|mpv" */
    if (name === 'rail_panels') {
        var s = String(info === undefined ? '' : info);
        var parts = s.split('|');
        g_rail.mdOk = (parts[0] === '1') ? 1 : (parts[0] === '0' ? 0 : -1);
        g_rail.mpvOk = (parts.length > 1) ? ((parts[1] === '1') ? 1 : (parts[1] === '0' ? 0 : -1)) : -1;
        window.Repaint();
        return;
    }
    /* 标题栏报「洛雪音源入口要不要摆」（对应「设置... → 隐藏洛雪音源面板」）：
       关掉时这一项从侧栏里拿掉，其余入口顺势上移，而不是留在那儿点了没反应。 */
    if (name === 'rail_lxbox_visible') {
        var lxOn = (info === true || String(info) === '1' || Number(info) === 1) ? 1 : 0;
        if (lxOn !== g_rail.lxOk) {
            g_rail.lxOk = lxOn;
            railRecalc();
            window.Repaint();
        }
        return;
    }
    switch (name) {
        case 'eole_layout':
            window.Repaint();
            break;
        case 'set_font':
            globalProperties.fontAdjustement = info;
            window.SetProperty("全局·字体调整", globalProperties.fontAdjustement);
            try { get_font(); } catch (eSF) {}
            window.Repaint();
            break;
        case 'global_dark_theme':
        case 'wayne_dark_theme':
            properties.darklayout = !!info;
            window.SetProperty("显示·深色布局", properties.darklayout);
            get_colors();
            window.Repaint();
            break;
        case 'colors':
            globalProperties.colorsMainPanel = info;
            window.SetProperty("全局·主面板配色", globalProperties.colorsMainPanel);
            get_colors();
            window.Repaint();
            break;
        case 'fullscreenWallpaper':
            try { window.SupportPseudoTransparency = !!info; } catch (eFS) {}
            window.Repaint();
            break;
        case 'fullscreenWallpaperRepaint':
            window.Repaint();
            break;
        case 'fw_values':
            try { fw_adopt(info); } catch (eFV) {}
            window.Repaint();
            break;
    }
}

/* ---------------------------------------------------------------- 启动 */

function railEnsureMarker() {
    try {
        if (typeof railCollapsePref === 'function' && railCollapsePref() < 0) {
            if (typeof railCollapsePrefSet === 'function') railCollapsePrefSet(0);
            try { window.NotifyOthers('eole_layout', true); } catch (eEL) {}
        }
    } catch (eMk) {}
}

(function railInit() {
    try { get_font(); } catch (eF0) {}
    /* 深浅初值：优先问公共库（和各面板同一套判定），拿不到再退回面板属性 */
    try { if (typeof fw_isDark === 'function') properties.darklayout = !!fw_isDark(); } catch (eDk) {}
    get_colors();
    /* 标记文件：本面板一加载就补一份，Eole_layout 的双保险判断才稳定 */
    railEnsureMarker();
    /* 问 Eole_layout「MilkDrop / MPV 在不在」，答复随时会来 */
    try { window.NotifyOthers('rail_query', true); } catch (eQ) {}
    /* 问标题栏一次「显示可视化标签页」：决定「洛雪音源」这一项摆不摆 */
    try { window.NotifyOthers('rail_lxbox_query', true); } catch (eQ3) {}
    window.SetTimeout(function () { try { window.NotifyOthers('rail_query', true); } catch (eQ2) {} }, 900);
    window.SetTimeout(function () { try { window.NotifyOthers('rail_lxbox_query', true); } catch (eQ4) {} }, 900);
    railRecalc();
    window.Repaint();
})();
