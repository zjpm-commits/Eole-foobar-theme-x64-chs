var padding_top = 27;
var padding_top_nobio = 17;
var padding_bottom = 5;
var padding_left = 35;
var padding_right = 35;
var header_height = 135;
var ww = 0;
var wh = 0;
var lyricsText_Width = -1;
var esl = null;
var eslPanel = null;
var esl_font_applied = false;
var esl_report = [];
var esl_attempts = 0;

function eslErr(e) {
	try { return e.description || e.message || ("" + e); } catch (e2) { return "未知错误"; }
}
function eslLog(s) {
	try { console.log("[Eole/ESLyric] " + s); } catch (e) {}
}
// 惰性创建：脚本加载时 ESLyric 可能还没就绪（面板没建好、expose 接口没注册），
// 原来只在顶层 new 一次，失败就永远拿不到接口。这里每次调用都重试。
function eslCreate() {
	if (esl) return esl;
	esl_attempts++;
	try { fb.TitleFormat("%esl_expose_api%").Eval(true); } catch (e) {}
	try {
		esl = new ActiveXObject("ESLyric");
		esl_report.push("✔ ActiveXObject(\"ESLyric\") 创建成功"
			+ (function(){ try { return "，版本 " + esl.Version; } catch (e) { return ""; } })());
		eslLog("ActiveXObject 创建成功");
	} catch (e) {
		esl = null;
		esl_report.push("✘ ActiveXObject(\"ESLyric\") 创建失败：" + eslErr(e));
		eslLog("创建失败: " + eslErr(e));
	}
	return esl;
}
function eslCall(label, fn) {
	try { fn(); esl_report.push("✔ " + label); return true; }
	catch (e) { esl_report.push("✘ " + label + "：" + eslErr(e)); return false; }
}
var Update_Required_function= "";
var btn_initialized = false;
var images = {};
var properties = {
	panelName: 'WSHlyrics_title',
	panelFontAdjustement: window.GetProperty("主面板·面板字体调整", 0),
    enableDiskCache: window.GetProperty("封面·磁盘缓存", true),
    wallpaperdisplay: window.GetProperty("壁纸(0=填充 1=适应 2=拉伸)", 2),
	showwallpaper: window.GetProperty("显示·显示壁纸", false),
	darklayout: window.GetProperty("显示·深色布局", false),
	stick2darklayout: window.GetProperty("显示·固定深色布局", true),
    album_review: window.GetProperty("系统·显示专辑评论", false),
	esl_follow_theme_font: window.GetProperty("歌词·跟随主题字体", true),
	esl_font_size: window.GetProperty("歌词·字号(0=自动)", 0),
	esl_line_space: window.GetProperty("歌词·行距(0=自动)", 0),
	// ESLyric 的背景由「背景类型」决定：颜色只在类型为纯色时才看得见，
	// 类型是图片（专辑封面等）时 SetBackgroundColor 设了也被盖住。
	esl_bg_type: window.GetProperty("歌词·背景类型(-1不改 0无 1纯色 2图片 3图片2)", 1),
	// 标题条文字。原来固定是「歌词」两个字，用 nowplaying_title 字体（正文 +14 号、斜体），
	// 在这么窄的一条上显得过大。改成可配置的 title format，字号也跟着降到正文 +1。
	title_format: window.GetProperty("歌词·标题文字(title format，留空显示 歌词)", "%artist% - %title%"),
	title_font_size: window.GetProperty("歌词·标题字号(0=跟随主题)", 0)
}
function build_buttons(){
	if(btn_initialized){
	} else {
		btn_initialized = true;
		buttons = {
			//LyricsWidth: new JSButton(0, 0, 40, images.lyrics_off_icon.Height, "Bio", "Bio", "显示简介", function () {
			//}, false, false,images.lyrics_off_icon,images.lyrics_off_hover_icon,-1, false, false, true)
		}

		all_btns = new JSButtonGroup("top-left", padding_left, padding_top+10, 'all_btns', true);
		all_btns.addButtons(buttons, [0,0,0,0]);
	}
}
function positionButtons(){
	all_btns.x = padding_left + lyricsText_Width;
}

function drawAllButtons(gr) {
	all_btns.draw(gr);
}
function on_mouse_move(x,y,m){
	if(g_cursor.x==x && g_cursor.y==y) return;
	g_cursor.onMouse("move", x, y, m);
	all_btns.on_mouse("move",x,y);
}
function on_mouse_leave() {
	all_btns.on_mouse("leave");
}
function on_mouse_lbtn_down(x,y){
	all_btns.on_mouse("lbtn_down",x, y);
}
function on_mouse_lbtn_up(x,y){
	all_btns.on_mouse("lbtn_up",x, y);
}
function on_mouse_lbtn_dblclk(x, y) {
	all_btns.on_mouse("dble_click",x, y);
}
function on_key_down(vkey) {
    var mask = GetKeyboardMask();
	if (mask == KMask.none) {
		switch (vkey) {
			case VK_ESCAPE:
				if(g_uihacks.getFullscreenState()) g_uihacks.toggleFullscreen();
				break;
		};
	}
};
function on_size(w, h) {
    ww = w;
    wh = h;
	lyricsText_Width = -1;
}
function on_paint(gr) {
	if(Update_Required_function!="") {
		eval(Update_Required_function);
		Update_Required_function = "";
	}
	gr.SetTextRenderingHint(globalProperties.TextRendering);
	gr.FillSolidRect(0, 0, ww, wh, colors.normal_bg);
	var header_txt = headerText();
	if(lyricsText_Width<0 || header_txt !== g_header_drawn) {
		g_header_drawn = header_txt;
		lyricsText_Width = Math.min(gr.CalcTextWidth(header_txt, font_title)+10, Math.max(40, ww - padding_left-padding_right));
		positionButtons();
	}
	gr.GdiDrawText(header_txt, font_title, colors.normal_txt, padding_left, 0, ww - padding_left-padding_right, wh, DT_VCENTER | DT_SINGLELINE | DT_LEFT | DT_END_ELLIPSIS | DT_NOPREFIX);
	drawAllButtons(gr);
}
function on_font_changed() {
	build_header_font();
	lyricsText_Width = -1;
    all_btns.calculateSize(true);
	window.Repaint();
};

var esl_px = 0, esl_ls = 0, esl_fname = "";
function applyESLyricStyle(verbose) {
	esl_report = [];
	if (!eslCreate()) { if (verbose) eslReportPopup(); return false; }
	try { eslPanel = esl.GetAll(); }
	catch (e) { esl_report.push("✘ GetAll()：" + eslErr(e)); eslPanel = null; }
	if (!eslPanel) {
		esl_report.push("✘ GetAll() 返回空 —— 当前进程里还没有 ESLyric 面板（时机太早，或布局里根本没有 ESLyric）");
		if (verbose) eslReportPopup();
		return false;
	}
	esl_report.push("✔ GetAll() 取到面板接口");
	// 颜色：ESLyric 文档说明「设置颜色会自动打开使用自定义颜色」，
	// 但若之前被 SetUseCustom* 关掉过，这里再显式打开一次，避免设了却不显示。
	// 先切背景类型，再设颜色：类型仍是「图片」时设色不会显示。
	if (properties.esl_bg_type >= 0) {
		eslCall("SetBackgroundType(" + properties.esl_bg_type + ")",
			function () { eslPanel.SetBackgroundType(properties.esl_bg_type); });
	}
	eslCall("SetTextColor", function () { eslPanel.SetTextColor(colors.normal_txt); });
	eslCall("SetTextHighlightColor", function () { eslPanel.SetTextHighlightColor(colors.highlight_txt); });
	eslCall("SetBackgroundColor", function () { eslPanel.SetBackgroundColor(colors.normal_bg); });
	eslCall("SetUseCustomTextColor(1)", function () { eslPanel.SetUseCustomTextColor(1); });
	eslCall("SetUseCustomHighlightColor(1)", function () { eslPanel.SetUseCustomHighlightColor(1); });
	eslCall("SetUseCustomBackgroundColor(1)", function () { eslPanel.SetUseCustomBackgroundColor(1); });
	// 字体只在第一次成功应用时设一次：之后用户在 ESLyric 里 Ctrl+滚轮
	// 调过的字号不会被切歌、切主题色时打回原位。
	if (properties.esl_follow_theme_font && (!esl_font_applied || verbose)) {
		esl_fname = (typeof g_fname !== 'undefined' && g_fname) ? g_fname : "Microsoft YaHei UI";
		var fsize = (typeof g_fsize !== 'undefined' && g_fsize) ? g_fsize : 12;
		var fstyle = (typeof g_fstyle !== 'undefined') ? g_fstyle : 0;
		var dpi = (typeof window.DPI !== 'undefined' && window.DPI) ? window.DPI : 96;
		esl_px = (properties.esl_font_size > 0) ? properties.esl_font_size : Math.round(fsize * (dpi / 72) * 1.8);
		esl_ls = (properties.esl_line_space > 0) ? properties.esl_line_space : Math.round(esl_px * 0.5);
		if (eslCall("SetTextFont(" + esl_fname + ", " + esl_px + ", " + fstyle + ")",
			function () { eslPanel.SetTextFont(esl_fname, esl_px, fstyle); })) {
			eslCall("SetUseCustomFont(1)", function () { eslPanel.SetUseCustomFont(1); });
			eslCall("SetLineSpace(" + esl_ls + ")", function () { eslPanel.SetLineSpace(esl_ls); });
			esl_font_applied = true;
		}
	} else if (esl_font_applied) {
		esl_report.push("· 字体已应用过，本次跳过（改属性后点「重新应用」可强制重设）");
	}
	if (verbose) eslReportPopup();
	return true;
}
// 诊断：弹窗列出每一步的结果，并做一次肉眼可见的测试（红色 + 40px），3 秒后还原。
function eslReportPopup() {
	var msg = "ESLyric 联动诊断\r\n"
		+ "────────────────\r\n"
		+ esl_report.join("\r\n")
		+ "\r\n────────────────\r\n"
		+ "创建尝试次数：" + esl_attempts + "\r\n"
		+ "主题色：文字 " + (typeof colors.normal_txt !== 'undefined' ? "0x" + colors.normal_txt.toString(16) : "未取值")
		+ "，高亮 " + (typeof colors.highlight_txt !== 'undefined' ? "0x" + colors.highlight_txt.toString(16) : "未取值") + "\r\n"
		+ "字体：" + (esl_fname || "未取值") + " / " + esl_px + "px / 行距 " + esl_ls + "\r\n"
		+ "背景类型：" + (properties.esl_bg_type < 0 ? "保持现状（脚本未改动，颜色可能被封面图盖住）" : properties.esl_bg_type)
		+ "  背景色：" + (typeof colors.normal_bg !== 'undefined' ? "0x" + colors.normal_bg.toString(16) : "未取值") + "\r\n"
		+ "\r\n若上面全是 ✘，请看弹窗后的说明。";
	try { window.ShowPopupMessage(msg, "Eole · ESLyric 联动诊断"); } catch (e) {}
}
// 肉眼验证：把歌词临时改成红色 40px，3 秒后还原成主题配色。
function eslTest() {
	if (!eslCreate()) { eslReportPopup(); return; }
	try { eslPanel = esl.GetAll(); } catch (e) { eslPanel = null; }
	if (!eslPanel) { esl_report.push("✘ GetAll() 返回空"); eslReportPopup(); return; }
	try { eslPanel.SetTextColor(0xffff0000); } catch (e) {}
	try { eslPanel.SetTextHighlightColor(0xffff0000); } catch (e) {}
	try { eslPanel.SetUseCustomTextColor(1); } catch (e) {}
	try { eslPanel.SetUseCustomHighlightColor(1); } catch (e) {}
	try { eslPanel.SetTextFont(esl_fname || "Microsoft YaHei UI", 40, 0); } catch (e) {}
	try { eslPanel.SetUseCustomFont(1); } catch (e) {}
	setTimeout(function () { esl_font_applied = false; applyESLyricStyle(false); }, 3000);
}
function get_colors() {
	get_colors_global();
	if(properties.darklayout || properties.stick2darklayout){
		colors.highlight_txt = RGB(255,193,0);
		colors.icons_folder = "white";
		colors.btn_inactive_opacity = 255;
		colors.inactive_txt = colors.normal_txt;
	} else {
		colors.highlight_txt = RGB(215,155,0);
		colors.icons_folder = "";
		colors.btn_inactive_opacity = 255;
		colors.inactive_txt = colors.normal_txt;
	}
	images.lyrics_off_icon = gdi.Image(theme_img_path + "\\icons\\"+colors.icons_folder+"\\nowplaying_on.png");
	images.lyrics_off_hover_icon = gdi.Image(theme_img_path + "\\icons\\"+colors.icons_folder+"\\nowplaying_on_hover.png");
	applyESLyricStyle();
};
function on_mouse_rbtn_up(x, y){
	var _menu = window.CreatePopupMenu();
	var idx;

	_menu.AppendMenuItem(MF_STRING, 99, "固定为深色布局");
	_menu.CheckMenuItem(99,properties.stick2darklayout);

	if(utils.IsKeyPressed(VK_SHIFT)) {
		_menu.AppendMenuSeparator();
		_menu.AppendMenuItem(MF_STRING, 100, "属性 ");
		_menu.AppendMenuItem(MF_STRING, 101, "配置...");
		_menu.AppendMenuSeparator();
		_menu.AppendMenuItem(MF_STRING, 102, "重新加载");
		_menu.AppendMenuSeparator();
		_menu.AppendMenuItem(MF_STRING, 103, "重新应用 ESLyric 样式");
		_menu.AppendMenuItem(MF_STRING, 104, "ESLyric 联动诊断...");
		_menu.AppendMenuItem(MF_STRING, 105, "测试：歌词变红 40px");
		_menu.AppendMenuItem(MF_STRING, 106, "歌词背景类型：" + (properties.esl_bg_type < 0 ? "保持现状" : properties.esl_bg_type) + "（点击切换）");
		_menu.AppendMenuItem(MF_STRING, 107, "清除歌词背景图片");
	}
	idx = _menu.TrackPopupMenu(x,y);
	switch(true) {
		case (idx == 99):
			properties.stick2darklayout=!properties.stick2darklayout;
			window.SetProperty("显示·固定深色布局", properties.stick2darklayout);
			get_colors();
			window.Repaint();
			break
		case (idx == 100):
			window.ShowProperties();
			break;
		case (idx == 101):
			window.ShowConfigure();
			break;
		case (idx == 102):
			window.Reload();
			break;
		case (idx == 103):
			esl_font_applied = false;
			esl = null;
			applyESLyricStyle(false);
			break;
		case (idx == 104):
			esl_font_applied = false;
			esl = null;
			applyESLyricStyle(true);
			break;
		case (idx == 105):
			eslTest();
			break;
		case (idx == 106):
			// 索引由 ESLyric 自己的下拉列表决定，从 0 开始。不同版本项数不定，
			// 这里就在 -1/0/1/2/3 之间轮转，哪个变成主题色就停在哪。
			var bg_seq = [-1, 0, 1, 2, 3];
			var bg_pos = 0;
			for (var bi = 0; bi < bg_seq.length; bi++) {
				if (bg_seq[bi] == properties.esl_bg_type) bg_pos = bi;
			}
			bg_pos = (bg_pos + 1) % bg_seq.length;
			properties.esl_bg_type = bg_seq[bg_pos];
			window.SetProperty("歌词·背景类型(-1不改 0无 1纯色 2图片 3图片2)", properties.esl_bg_type);
			applyESLyricStyle(false);
			window.Repaint();
			break;
		case (idx == 107):
			if (eslCreate()) {
				try { eslPanel = esl.GetAll(); } catch (e) { eslPanel = null; }
				if (eslPanel) { try { eslPanel.SetBackgroundImagePath(""); } catch (e) {} }
			}
			applyESLyricStyle(false);
			break;
		default:
			return true;
	}
	_menu = undefined;
	return true;
}
var searching_img = gdi.CreateImage(50, 50);
gb = searching_img.GetGraphics();
	gb.SetSmoothingMode(2);
	gb.DrawLine(5, 5, 50-5, 50-5, 1.0, colors.normal_txt);
	gb.DrawLine(5, 50-5, 50-5, 5, 1.0, colors.normal_txt);
	gb.SetSmoothingMode(0);
searching_img.ReleaseGraphics(gb);

function on_playback_stop(){
	g_header_text = null;
	window.Repaint();
}
function on_playback_new_track(){
	g_header_text = null;
	window.Repaint();
	if(!esl_font_applied) applyESLyricStyle(false);
	if(window.IsVisible && eslPanel) {
		eslPanel.RunContextMenu("Reload Lyric");
	} else set_update_function("on_playback_new_track()");
}
function set_update_function(string){
	if(string=="") Update_Required_function=string;
	else if( Update_Required_function.indexOf("on_playback_new_track")!=-1) return;
	else Update_Required_function=string;
}
function on_mouse_wheel(step, stepstrait, delta){
	if(typeof(stepstrait) == "undefined" || typeof(delta) == "undefined") intern_step = step;
	else intern_step = stepstrait/delta;
	if(utils.IsKeyPressed(VK_CONTROL)) { // zoom all elements
		var zoomStep = 1;
		var previous = globalProperties.fontAdjustement;
		if(!timers.mouseWheel) {
			if(intern_step > 0) {
				globalProperties.fontAdjustement += zoomStep;
				if(globalProperties.fontAdjustement > globalProperties.fontAdjustement_max) globalProperties.fontAdjustement = globalProperties.fontAdjustement_max;
			} else {
				globalProperties.fontAdjustement -= zoomStep;
				if(globalProperties.fontAdjustement < globalProperties.fontAdjustement_min) globalProperties.fontAdjustement = globalProperties.fontAdjustement_min;
			};
			if(previous != globalProperties.fontAdjustement) {
				timers.mouseWheel = setTimeout(function() {
					on_notify_data('set_font',globalProperties.fontAdjustement);
					window.NotifyOthers('set_font',globalProperties.fontAdjustement);
					timers.mouseWheel && clearTimeout(timers.mouseWheel);
					timers.mouseWheel = false;
				}, 100);
			};
		};
	}
}
function on_notify_data(name, info) {
    switch(name) {
		case "colors":
			globalProperties.colorsMainPanel = info;
			window.SetProperty("全局·主面板配色", globalProperties.colorsMainPanel);
			get_colors();
			window.Repaint();
		break;
		case "use_ratings_file_tags":
			globalProperties.use_ratings_file_tags = info;
			window.SetProperty("全局·评级存入文件标签", globalProperties.use_ratings_file_tags);
			window.Reload();
		break;
		case "WSH_panels_reload":
			window.Reload();
            break;
		case "DiskCacheState":
			globalProperties.enableDiskCache = info;
			window.SetProperty("封面·磁盘缓存", globalProperties.enableDiskCache);
			window.Repaint();
		break;
		case "set_font":
			globalProperties.fontAdjustement = info;
			window.SetProperty("全局·字体调整", globalProperties.fontAdjustement),
			on_init();
			window.Repaint();
		break;
		case "cover_cache_finalized":
			window.Repaint();
		break;
		case "lyrics_dark_theme":
		case "global_dark_theme":
			properties.darklayout = info;
			window.SetProperty("显示·深色布局", properties.darklayout);
			get_colors();
			window.Repaint();
            break;
		case "settings_file_not_found":
            break;
    }
}
var g_tf_header = null;
var g_header_text = null;
var g_header_drawn = null;
function build_header_font() {
	var fs = (properties.title_font_size > 0) ? properties.title_font_size : (g_fsize + 1);
	font_title = gdi.Font(g_fname, fs, g_fstyle);
	g_header_text = null;
	lyricsText_Width = -1;
}
// 标题条上那行字：默认「歌手 - 歌名」，没在播放时回落到原来的「歌词」。
// 结果缓存起来，切歌/停止时才重算，避免每次重绘都跑一遍 title format。
function headerText() {
	if (!properties.title_format) return "歌词";
	if (g_header_text === null) {
		var s = "";
		try {
			if (!g_tf_header) g_tf_header = fb.TitleFormat(properties.title_format);
			var m = fb.GetNowPlaying();
			s = m ? g_tf_header.EvalWithMetadb(m) : "";
		} catch (e) { s = ""; }
		s = ("" + s).replace(/^\s*-\s*/, "").replace(/\s*-\s*$/, "");
		g_header_text = s ? s : "歌词";
	}
	return g_header_text;
}
function on_init(){
	get_font();
	get_colors();
	build_buttons();
	positionButtons();
	g_cursor = new oCursor();
	g_tooltip = new oTooltip();
	build_header_font();
}
on_init();
// 布局导入时，ESLyric 的原生子面板与它的 COM 接口都是在这段脚本之后才就绪的。
// 起播、切布局、重启后各不相同，所以把重试窗口拉到 10 秒，成功一次就不再重复。
(function () {
	var delays = [0, 250, 800, 1800, 3500, 6000, 9000];
	for (var i = 0; i < delays.length; i++) {
		(function (d) {
			setTimeout(function () {
				if (d === 0) get_colors();
				else if (!esl_font_applied) applyESLyricStyle(false);
			}, d);
		})(delays[i]);
	}
})();