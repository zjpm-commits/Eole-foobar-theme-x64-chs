// ============================================================================
// MilkDrop 主面板 —— Eole 补充层
// ----------------------------------------------------------------------------
// 主体是官方样例 <组件目录>\samples\vis\Shader - MilkDrop ALL.js（清单里在
// 本文件之后 include）：画面渲染、侧边栏、预设列表、播放列表、FPS 输入框、
// 自动切换、歌曲通知全归它管。
//
// 本文件只做样例没有的 Eole 集成，按职责分四块：
//   1. 右键菜单——样例没有 on_mouse_rbtn_up，选预设/帧率/自动切换在这里；
//   2. Eole 设置键联动——milkdropvis_state / milkdropfps_state 与样例互同步；
//   3. 主区模式联动——非模式 4 时停掉样例的帧定时器与自动切换，省 CPU；
//   4. 左侧面板开关——接管样例的 layout()/drawSidebar()，右键菜单可隐藏侧栏；
//   5. 伪透明必须关——样例是 D2D 自绘，开着会去截宿主背景，截到一片黑。
//
// 共存规则（改这个文件前必读）：
//   * 样例后 include，它的 on_paint / on_size 等回调会覆盖本文件的同名声明，
//     所以这里【绝不】定义绘制类回调，也【绝不】与样例的顶层 const/let 同名
//     （比如 presetDir——同名直接 SyntaxError，面板白屏）；
//   * 样例的顶层 const/let（presets、fps、currentIndex…）在同一个面板 realm
//     里，本文件的回调运行期可以直接读写；
//   * 本文件顶层不得引用样例标识符（include 顺序在前，此刻它们还不存在），
//     一律放到回调里，用 typeof 先探再调。
// ============================================================================
window.DrawMode = 1;

var md_titles = {};                // 预设编号 → 标题（右键菜单用，读过就缓存）

// ---------------------------------------------------------------------------
// 基础工具
// ---------------------------------------------------------------------------
function md_pad(v) {
    var n = parseInt(v);
    if (!isFinite(n) || n < 0) n = 0;
    var s = String(n);
    while (s.length < 4) s = '0' + s;
    return s;
}

/* 当前主区是不是模式 4。pss_switch 没载入时按 4 处理（单测环境）。 */
function md_active() {
    if (typeof main_panel_state === 'undefined') return true;
    var m = 4;
    try { m = parseInt(main_panel_state.value); } catch (e) { m = 4; }
    return m === 4;
}

/* 样例是否已就绪：回调运行期才调用，样例 include 完成后这些标识符才存在 */
function md_ready() {
    return typeof selectPreset === 'function' &&
        typeof presets !== 'undefined' && presets.length > 0;
}

/* 预设文件首行注释里有名字：MilkDrop 0014 — rain on inverted London */
function md_title(id) {
    if (md_titles[id] !== undefined) return md_titles[id];
    var t = '';
    try {
        var txt = String(utils.ReadTextFile(presetDir + id + '.js') || '');
        var m = /MilkDrop\s*\d{4}\s*[\u2014\u2013-]\s*([^\r\n]+)/.exec(txt.slice(0, 400));
        if (m) t = m[1].replace(/[.。]\s*$/, '');
    } catch (e) { t = ''; }
    md_titles[id] = t;
    return t;
}

// ---------------------------------------------------------------------------
// Eole 设置键 ↔ 样例状态
// ---------------------------------------------------------------------------
function md_indexOf(id) {
    try {
        for (var i = 0; i < presets.length; ++i) {
            if (presets[i].id === id) return i;
        }
    } catch (e) { }
    return -1;
}

function md_selectedId() {
    try {
        return (presets && presets[currentIndex]) ? presets[currentIndex].id : '';
    } catch (e) { return ''; }
}

/* milkdropvis_state 变了：让样例切到对应编号；编号不存在则把键拉回当前。
   注意值一律用通知的 info —— 本面板的 pss_switch 状态对象不会因通知更新 */
function md_applyVis(id) {
    if (!md_ready()) return;
    if (id === undefined || id === null || isNaN(id)) id = parseInt(milkdropvis_state.value);
    var idx = md_indexOf(md_pad(id));
    if (idx >= 0 && idx !== currentIndex) {
        selectPreset(idx);
    } else if (idx < 0) {
        var cur = md_indexOf(md_selectedId());
        if (cur >= 0) { try { milkdropvis_state.setValue(parseInt(md_selectedId())); } catch (e) { } }
    }
}

/* milkdropfps_state 变了（0/1/2 = 30/60/120）：让样例换帧率 */
function md_applyFps(i) {
    if (!md_ready()) return;
    if (i === undefined || i === null || isNaN(i)) i = parseInt(milkdropfps_state.value);
    if (!(i >= 0 && i < FPS_OPTIONS.length)) i = 1;
    if (FPS_OPTIONS[i] !== fps) selectFps(FPS_OPTIONS[i]);
}

// ---------------------------------------------------------------------------
// 主区模式联动：切走停样例的帧定时器与自动切换，切回恢复（画面状态都留着）
// ---------------------------------------------------------------------------
function md_setRunning(on) {
    if (typeof startRepaintTimer !== 'function') return;
    if (on) {
        startRepaintTimer();
        restartAutoSwitchTimer();
    } else {
        if (repaintTimer !== null && repaintTimer !== undefined) {
            clearInterval(repaintTimer);
            repaintTimer = null;
        }
        if (autoSwitchTimer !== null && autoSwitchTimer !== undefined) {
            clearInterval(autoSwitchTimer);
            autoSwitchTimer = null;
        }
    }
}

// ---------------------------------------------------------------------------
// 左侧面板开关：样例没有隐藏侧栏的功能，这里接管它的两个函数
//   * layout()   —— 样例所有坐标的唯一来源。隐藏时把侧栏尺寸归零/移出屏外：
//     sidebar=-1 让 1px 边线画到屏外、也让侧栏鼠标命中全部失效（hoveredItem
//     对 x >= sidebar 直接返回空）；viewX=0/viewWidth=全宽，画面铺满面板；
//     listWidth/listHeight/trackWidth=0，列表、滚动条、FPS 输入框全消失。
//   * drawSidebar() —— 整体置空。layout 归零后它仍会画边线和一批负宽文字，
//     置空最干净。
// 两个都是样例的普通函数声明（全局可写绑定），on_load 后重新赋值即可生效；
// 恢复显示时把原函数换回去。开关状态存面板属性，重启记住。
// ---------------------------------------------------------------------------
var md_sidebarHidden = false;
var md_layoutOrig = null, md_drawSidebarOrig = null;
try { md_sidebarHidden = !!window.GetProperty('Eole.MilkDrop.HideSidebar', false); } catch (eP0) { }

function md_layoutNoSidebar() {
    var r = md_layoutOrig();
    r.sidebar = -1;
    r.viewX = 0;
    r.viewWidth = Math.max(0, window.Width);
    r.listX = 0;
    r.listWidth = 0;
    r.listHeight = 0;
    r.trackX = 0;
    r.trackWidth = 0;
    return r;
}

function md_sidebarNone(gr, r) { }

function md_applySidebar() {
    if (typeof layout !== 'function' || typeof drawSidebar !== 'function') return;
    if (!md_layoutOrig) { md_layoutOrig = layout; md_drawSidebarOrig = drawSidebar; }
    try {
        layout = md_sidebarHidden ? md_layoutNoSidebar : md_layoutOrig;
        drawSidebar = md_sidebarHidden ? md_sidebarNone : md_drawSidebarOrig;
    } catch (eA) {
        try { console.log('[MilkDrop] 侧栏开关接管失败：' + eA); } catch (eL) { }
    }
}

function md_toggleSidebar() {
    md_sidebarHidden = !md_sidebarHidden;
    try { window.SetProperty('Eole.MilkDrop.HideSidebar', md_sidebarHidden); } catch (eS) { }
    md_applySidebar();
    try { window.Repaint(); } catch (eR) { }
}

// ---------------------------------------------------------------------------
// 全屏：MilkDrop 铺满整个 fb2k 窗口（面板内的全屏，不是 Eole 的布局全屏）。
// 面板自己挪不了自己，摆位在宿主 Eole_layout.js——它收到 'milkdrop_fullscreen'
// 通知后 arrange('force')，隐藏其余全部面板、把本面板 Move(0,0,w,h)。
// 进出全屏都走右键菜单（无 ESC）；切主面板模式/任何普通重排（宿主清标志并
// 广播 eole_layout）自动退出；状态不持久化，重启回窗口态。
// ---------------------------------------------------------------------------
var md_fullscreen = false;

function md_setFullscreen(on) {
    md_fullscreen = !!on;
    try { window.NotifyOthers('milkdrop_fullscreen', md_fullscreen); } catch (eN) { }
}

function md_playlistVisible() {
    try { return !!playlistVisible; } catch (eV) { return false; }
}

// ---------------------------------------------------------------------------
// 浮层列表开关（面板内的播放列表浮层，不是 Eole 的播放列表）：
// 显隐由样例的 playlistVisible 单一控制。关闭走样例自己的
// injectPlaylistOverlay()（带反馈注入淡出效果）；打开走 showActivePlaylist()。
// showActivePlaylist 在样例里唯一的触发点是"单击画面区"，所以包装它：
// '关闭浮层列表'之后置 md_listClosed，单击画面不再自动重弹，
// 只有菜单'打开浮层列表'才恢复。'自动隐藏播放列表'开关（autoHidePlaylist）
// 不受影响，两者独立。
// ---------------------------------------------------------------------------
var md_listClosed = false;
var md_showPlaylistOrig = null;

function md_applyPlaylistLock() {
    if (typeof showActivePlaylist !== 'function') return;
    if (!md_showPlaylistOrig) md_showPlaylistOrig = showActivePlaylist;
    try {
        showActivePlaylist = function () {
            if (md_listClosed) return;
            return md_showPlaylistOrig();
        };
    } catch (eL) {
        try { console.log('[MilkDrop] 浮层列表开关接管失败：' + eL); } catch (eL2) { }
    }
}

function md_togglePlaylistOverlay() {
    if (md_playlistVisible()) {
        md_listClosed = true;
        try { injectPlaylistOverlay(); } catch (eC) { }
    } else {
        md_listClosed = false;
        try { showActivePlaylist(); } catch (eO) { }
    }
}

// ---------------------------------------------------------------------------
// 通知：设置文件是各面板共用的，谁改了都会广播
// ---------------------------------------------------------------------------
function on_notify_data(name, info) {
	/* 状态对象同步：别的面板改了某个 oPanelSetting（模式/宽度/滤镜/迷你控制栏…），
	   本地这份 .value 必须跟上，否则本面板还在按旧状态画。 */
	if (typeof syncStateFromNotify === 'function' && syncStateFromNotify(name, info)) {
		try { window.Repaint(); } catch (eSyncRp) {}
	}
    if (name === 'milkdropvis_state') { md_applyVis(parseInt(info)); return; }
    if (name === 'milkdropfps_state') { md_applyFps(parseInt(info)); return; }
    if (name === 'main_panel_state') {
        md_setRunning(parseInt(info) === 4);
        try { window.Repaint(); } catch (e) { }
    }
    /* 宿主普通重排（切模式/改设置）＝全屏已被退出，同步本地标志。
       md_listClosed 不跟随——浮层显隐与重排无关。 */
    if (name === 'eole_layout') { md_fullscreen = false; }
}

// ---------------------------------------------------------------------------
// 右键菜单（样例没有 on_mouse_rbtn_up，这里是它的补充）
// ---------------------------------------------------------------------------
function on_mouse_rbtn_up(x, y) {
    var m = window.CreatePopupMenu();
    var i, curIdx = -1, n = 0;

    if (md_ready()) {
        n = presets.length;
        var list = window.CreatePopupMenu();
        for (i = 0; i < n; ++i) {
            var t = md_title(presets[i].id);
            list.AppendMenuItem(MF_STRING, 1000 + i, presets[i].id + (t ? '   ' + t : ''));
            if (presets[i].id === md_selectedId()) curIdx = i;
        }
        if (curIdx >= 0) { try { list.CheckMenuRadioItem(1000, 1000 + n - 1, 1000 + curIdx); } catch (eC) { } }

        var fpsM = window.CreatePopupMenu();
        for (i = 0; i < FPS_OPTIONS.length; ++i) fpsM.AppendMenuItem(MF_STRING, 2000 + i, FPS_OPTIONS[i] + ' 帧');
        try { fpsM.CheckMenuRadioItem(2000, 2000 + FPS_OPTIONS.length - 1, 2000 + FPS_OPTIONS.indexOf(fps)); } catch (eF) { }

        m.AppendMenuItem(MF_STRING, 3001, autoSwitchEnabled ? '关闭自动切换' : '自动切换（16 秒）');
        m.AppendMenuItem(MF_STRING, 3002, randomPresetOrder ? '按顺序播放预设' : '随机顺序');
        m.AppendMenuItem(MF_STRING, 3003, '自动隐藏浮层列表');
        m.AppendMenuItem(MF_STRING, 3008, md_playlistVisible() ? '关闭浮层列表' : '打开浮层列表');
        m.AppendMenuItem(MF_STRING, 3006, md_sidebarHidden ? '显示左侧设置面板' : '隐藏左侧设置面板');
        m.AppendMenuItem(MF_STRING, 3007, md_fullscreen ? '退出全屏' : '全屏');
        m.AppendMenuSeparator();
        m.AppendMenuItem(MF_STRING, 3004, '重新编译当前预设');
        m.AppendMenuItem(MF_STRING, 3005, '回到媒体库模式');
        m.AppendMenuSeparator();
        fpsM.AppendTo(m, MF_STRING, '帧率');
        list.AppendTo(m, MF_STRING, '预设');
    } else {
        m.AppendMenuItem(MF_GRAYED, 0, 'MilkDrop样例未加载或目录为空');
        try { m.AppendMenuItem(MF_GRAYED, 0, typeof presetDir !== 'undefined' ? presetDir : ''); } catch (eP) { }
        /* 样例坏了也可能正处全屏：留一条退出通道 */
        m.AppendMenuSeparator();
        m.AppendMenuItem(MF_STRING, 3007, md_fullscreen ? '退出全屏' : '全屏');
    }

    var idx = m.TrackPopupMenu(x, y);
    if (!idx) return true;

    if (idx >= 1000 && idx < 1000 + n) {
        selectPreset(idx - 1000);
        try { milkdropvis_state.setValue(parseInt(presets[idx - 1000].id)); } catch (eV) { }
        return true;
    }
    if (idx >= 2000 && idx < 2000 + FPS_OPTIONS.length) {
        selectFps(FPS_OPTIONS[idx - 2000]);
        try { milkdropfps_state.setValue(idx - 2000); } catch (eS) { }
        return true;
    }
    if (idx === 3001) { toggleAutoSwitch(); return true; }
    if (idx === 3002) { togglePresetOrder(); return true; }
    if (idx === 3003) { toggleAutoHidePlaylist(); return true; }
    if (idx === 3006) { md_toggleSidebar(); return true; }
    if (idx === 3007) { md_setFullscreen(!md_fullscreen); return true; }
    if (idx === 3008) { md_togglePlaylistOverlay(); return true; }
    if (idx === 3004) { activate(); return true; }
    if (idx === 3005) { try { main_panel_state.setValue(0); } catch (eM) { } return true; }
    return true;
}

// ---------------------------------------------------------------------------
// 启动对齐：样例已按自己的属性完成首屏，这里把 Eole 设置键喂给它
// ---------------------------------------------------------------------------
function on_load() {
    md_applyVis();
    md_applyFps();
    md_applySidebar();   /* 上次隐藏了左侧面板：启动即接管（状态存在面板属性里） */
    md_applyPlaylistLock();   /* 浮层关闭态：拦住"单击画面自动重开" */
    /* 启动时就不是模式 4（记住的状态是别的模式）：把样例的定时器停掉 */
    if (!md_active()) md_setRunning(false);
}

// ---------------------------------------------------------------------------
// 引导
// ---------------------------------------------------------------------------
(function md_boot() {
    /* 这一块是 D2D 自绘，不能开伪透明——开了会去截宿主背景，截到的是别的东西 */
    try { window.SupportPseudoTransparency = false; } catch (eP) { }
})();
