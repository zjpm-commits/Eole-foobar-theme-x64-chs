var padding_top = 27;
var padding_top_nobio = 17;
var padding_bottom = 5;
var padding_left = 35;
var padding_right = 35;
var header_height = 135;
var ww = 0;
var wh = 0;
var lyricsText_Width = -1;
var g_btn_x = 35;          // 按钮组左边距，随标题块位置更新（标题现在整块居中）
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
var WSH_TITLE_ALIGN = "line";   // "line"=每行各自居中；"block"=整块居中、行内左对齐
var WSH_DEFAULT_TITLE_FORMAT = "艺术家: %ARTIST%$crlf()$crlf()标题: %TITLE%$crlf()$crlf()[专辑: %ALBUM%$crlf()$crlf()]$if2(%playback_time%,0:00)[ / %length%]";
// 历史默认值：升级时只在属性还等于这两个之一时才覆盖，用户自己改过的不动
var WSH_LEGACY_TITLE_FORMATS = [
	"%artist% - %title%",
	"艺术家: %BIO_ARTIST%$crlf()$crlf()标题: %BIO_TITLE%$crlf()$crlf()[专辑: %BIO_ALBUM%$crlf()$crlf()]$if2(%playback_time%,0:00)[ / %length%]"
];
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
	esl_highlight_bold: window.GetProperty("歌词·高亮行加粗", false),
	esl_font_size: window.GetProperty("歌词·字号(0=自动)", 0),
	esl_line_space: window.GetProperty("歌词·行距(0=自动)", 0),
	esl_bg_type: window.GetProperty("歌词·背景类型(0纯色 1图片 2动态模糊 3仿真透明)", 3),
	title_format: window.GetProperty("歌词·标题文字(title format，留空显示 歌词)", WSH_DEFAULT_TITLE_FORMAT),
	title_font_size: window.GetProperty("歌词·标题字号(0=跟随主题)", 0),
	title_refresh_sec: window.GetProperty("歌词·标题时间刷新秒数(0=不刷新)", 1),
	spec_show: window.GetProperty("频谱·显示", true),
	spec_height: window.GetProperty("频谱·高度(px)", 76),
	spec_fps: window.GetProperty("频谱·帧率(5-60)", 60),
	spec_barw: window.GetProperty("频谱·柱宽(px)", 4),
	spec_cover_colour: window.GetProperty("频谱·柱色跟随封面", true),
	spec_colour_gain: window.GetProperty("频谱·柱色提亮(0-100)", 60)
}
// 频谱参数迁移：帧率默认值 30 → 60（只改还是旧默认值的用户，自己调过的保留）
;(function () {
	try {
		if (window.GetProperty("频谱·配置版本", 0) >= 1) return;
		if (properties.spec_fps === 30) {
			properties.spec_fps = 60;
			window.SetProperty("频谱·帧率(5-60)", 60);
		}
		window.SetProperty("频谱·配置版本", 1);
	} catch (eSpecMig) {}
})();
// 升级到本版时自动换成多行信息版（只认历史默认值，用户自己改过的格式不覆盖）
;(function () {
	try {
		if (window.GetProperty("歌词·标题格式版本", 0) >= 3) return;
		for (var i = 0; i < WSH_LEGACY_TITLE_FORMATS.length; i++) {
			if (properties.title_format === WSH_LEGACY_TITLE_FORMATS[i]) {
				properties.title_format = WSH_DEFAULT_TITLE_FORMAT;
				window.SetProperty("歌词·标题文字(title format，留空显示 歌词)", properties.title_format);
				window.SetProperty("歌词·标题格式版本", 3);
				return;
			}
		}
		window.SetProperty("歌词·标题格式版本", 3);   // 是自定义格式，记下版本号，以后不再动它
	} catch (eMig) {}
})();
function build_buttons(){
	if(btn_initialized){
	} else {
		btn_initialized = true;
		buttons = {
			//}, false, false,images.lyrics_off_icon,images.lyrics_off_hover_icon,-1, false, false, true)
		}

		all_btns = new JSButtonGroup("top-left", padding_left, padding_top+10, 'all_btns', true);
		all_btns.addButtons(buttons, [0,0,0,0]);
	}
}
function positionButtons(){
	all_btns.x = g_btn_x;
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
	// 左右边距原来是写死的 35px：面板窄的时候（歌词区宽度靠 mainWidth*LYRICS/10 算）
	// 两边一扣就把可显示宽度吃到只剩一半，文字被逼成一字一行。这里按宽度比例收。
	var pad = Math.max(10, Math.min(35, Math.round(w * 0.07)));
	padding_left = pad;
	padding_right = pad;
	lyricsText_Width = -1;
}

function on_paint(gr) {
	try {
		if (typeof fw_sharedOn === 'function' && fw_sharedOn() &&
			window.SupportPseudoTransparency !== true) window.SupportPseudoTransparency = true;
	} catch (ePT) {}
	if(Update_Required_function!="") {
		eval(Update_Required_function);
		Update_Required_function = "";
	}
	gr.SetTextRenderingHint(globalProperties.TextRendering);
	var lay = headerLayout(gr);
	if(lyricsText_Width<0 || lay.key !== g_header_drawn) {
		g_header_drawn = lay.key;
		g_btn_x = Math.min((lay.xs[0] || lay.block_x) + (lay.widths[0] || lay.first_w) + 10, ww - padding_right);
		positionButtons();
	}
	// 频谱占底部，文字在剩下的区域里垂直居中
	var specH = specAreaHeight(lay);
	var textH = wh - specH;
	var y = (textH >= lay.total) ? Math.round((textH - lay.total) / 2) : 0;
	for (var i = 0; i < lay.lines.length; i++) {
		var ln = lay.lines[i];
		if (y > textH) break;
		if (ln) gr.GdiDrawText(ln, font_title, colors.normal_txt, lay.xs[i], y,
			Math.max(20, ww - lay.xs[i]), lay.lh, DT_LEFT | DT_SINGLELINE | DT_NOPREFIX | DT_END_ELLIPSIS);
		y += ln ? lay.lh : lay.gap;
	}
	if (specH > 0) {
		drawSpectrum(gr, padding_left, wh - specH,
			Math.max(20, ww - padding_left - padding_right), specH);
	}
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
		esl_report.push("✘ GetAll() 返回空 —— ESLyric 组件本身是好的（COM 对象都建出来了），"
			+ "但当前进程里没有一个活着的 ESLyric 面板实例。");
		esl_report.push("   可能：1) 布局里的歌词面板根本不是 ESLyric（例如 Lyric Show Panel 3），"
			+ "那这个脚本改不到它的字体/颜色；2) 面板刚创建，还没登记进列表。");
		if (verbose) eslReportPopup();
		return false;
	}
	esl_report.push("✔ GetAll() 取到面板接口");
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
	// 「高亮行加粗」是 ESLyric 的独立开关，和 SetTextFont 的 style 参数互不相干。
	// 默认是开的，所以 fontStyle 传 0 也照样是粗体 —— 必须单独关掉。
	eslCall("SetHighlightBoldFont(" + (properties.esl_highlight_bold ? 1 : 0) + ")",
		function () { eslPanel.SetHighlightBoldFont(properties.esl_highlight_bold ? 1 : 0); });
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
function eslReportPopup() {
	var msg = "ESLyric 联动诊断\r\n"
		+ "────────────────\r\n"
		+ esl_report.join("\r\n")
		+ "\r\n────────────────\r\n"
		+ "创建尝试次数：" + esl_attempts + "\r\n"
		+ "主题色：文字 " + (typeof colors.normal_txt !== 'undefined' ? "0x" + colors.normal_txt.toString(16) : "未取值")
		+ "，高亮 " + (typeof colors.highlight_txt !== 'undefined' ? "0x" + colors.highlight_txt.toString(16) : "未取值") + "\r\n"
		+ "字体：" + (esl_fname || "未取值") + " / " + esl_px + "px / 行距 " + esl_ls
		+ " / 样式位 " + (typeof g_fstyle !== 'undefined' ? g_fstyle : "未取值") + "\r\n"
		+ "高亮行加粗：" + (properties.esl_highlight_bold ? "开" : "关")
		+ "（这是 ESLyric 自己的独立开关，和字体样式位无关）\r\n"
		+ "背景类型：" + (properties.esl_bg_type < 0 ? "保持现状（脚本未改动，颜色可能被封面图盖住）" : properties.esl_bg_type)
		+ "  背景色：" + (typeof colors.normal_bg !== 'undefined' ? "0x" + colors.normal_bg.toString(16) : "未取值") + "\r\n"
		+ "\r\n若上面全是 ✘，请看弹窗后的说明。";
	try { window.ShowPopupMessage(msg, "Eole · ESLyric 联动诊断"); } catch (e) {}
	try { console.log("[Eole/ESLyric] 诊断====\r\n" + msg); } catch (e) {}
}
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
	specBuildPalette();
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
		_menu.AppendMenuItem(MF_STRING, 108, "高亮行加粗：" + (properties.esl_highlight_bold ? "开" : "关") + "（点击切换）");
		_menu.AppendMenuItem(MF_STRING, 109, "频谱：" + (properties.spec_show ? "开" : "关") + "（点击切换，改完建议重载布局）");
		_menu.AppendMenuItem(MF_STRING, 110, "频谱柱色跟随封面："
			+ (!properties.spec_cover_colour ? "关"
				: (spec_cover.scheme ? "开（" + (spec_cover.route || "已拾到") + "）"
					: "开（未提取到，同进度条）"))
			+ "（点击切换）");
		_menu.AppendMenuItem(MF_STRING, 111, "频谱重新拾取封面色（当前：" + ((spec_cover && spec_cover.colour) ? "已拾到" : "未拾到，用主题色") + "）");
		_menu.AppendMenuItem(MF_STRING, 112, "频谱配色诊断...");
		_menu.AppendMenuSeparator();
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
			reloadPanelSafe();
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
			var bg_seq = [-1, 0, 1, 2, 3];
			var bg_pos = 0;
			for (var bi = 0; bi < bg_seq.length; bi++) {
				if (bg_seq[bi] == properties.esl_bg_type) bg_pos = bi;
			}
			bg_pos = (bg_pos + 1) % bg_seq.length;
			properties.esl_bg_type = bg_seq[bg_pos];
			window.SetProperty("歌词·背景类型(0纯色 1图片 2动态模糊 3仿真透明)", properties.esl_bg_type);
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
		case (idx == 108):
			properties.esl_highlight_bold = !properties.esl_highlight_bold;
			window.SetProperty("歌词·高亮行加粗", properties.esl_highlight_bold);
			esl_font_applied = false;
			applyESLyricStyle(false);
			break;
		case (idx == 109):
			properties.spec_show = !properties.spec_show;
			window.SetProperty("频谱·显示", properties.spec_show);
			if (properties.spec_show) specStart(); else specStop();
			window.Repaint();
			break;
		case (idx == 110):
			properties.spec_cover_colour = !properties.spec_cover_colour;
			window.SetProperty("频谱·柱色跟随封面", properties.spec_cover_colour);
			if (properties.spec_cover_colour) { specCoverRequest(true); }
			else {
				spec_cover.colour = 0; spec_cover.scheme = null; spec_cover.route = "";
				specBuildPalette(); window.Repaint();
			}
			break;
		case (idx == 111):
			specCoverRequest(true);
			break;
		case (idx == 112):
			specCoverDiag();
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
	setTimeout(function () { try { applyESLyricStyle(false); } catch (e) {} }, 600);
	g_header_text = null;
	window.Repaint();
	specCoverRequest(false);      // 换歌立刻重取封面色，不等轮询
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
	/* 洛雪音源广播（流播项的歌手 / 歌名）由公共文件统一处理 */
	if (lxNotify(name, info)) return;
    switch(name) {
		case "fullscreenWallpaper":
			fw_setOn(info);
			try { window.SupportPseudoTransparency = !!info; } catch(e) {}
			window.Repaint();
		break;
		case "fullscreenWallpaperRepaint":
			window.Repaint();
		break;
		case "colors":
			globalProperties.colorsMainPanel = info;
			window.SetProperty("全局·主面板配色", globalProperties.colorsMainPanel);
			get_colors();
			window.Repaint();
		break;
		case "use_ratings_file_tags":
			globalProperties.use_ratings_file_tags = info;
			window.SetProperty("全局·评级存入文件标签", globalProperties.use_ratings_file_tags);
			reloadPanelSafe();
		break;
		case "WSH_panels_reload":
			reloadPanelSafe();
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
var g_tf_header_src = '';
var g_header_text = null;
var g_header_drawn = null;
/* 广播到了以后把标题缓存清掉，下一帧按新值重算 */
function lxRefresh() {
	try { g_header_text = null; window.Repaint(); } catch (e) { }
}

function build_header_font() {
	var fs = (properties.title_font_size > 0) ? properties.title_font_size : (g_fsize + 1);
	font_title = gdi.Font(g_fname, fs, g_fstyle);
	g_header_text = null;
	g_header_layout = null;
	lyricsText_Width = -1;
}
function headerText() {
	if (!properties.title_format) return "歌词";
	if (g_header_text === null) {
		var s = "";
		try {
			var _lxFmt = lxFillFormat(properties.title_format);
			if (!g_tf_header || _lxFmt !== g_tf_header_src) {
				g_tf_header_src = _lxFmt;
				g_tf_header = fb.TitleFormat(_lxFmt);
			}
			var m = fb.GetNowPlaying();
			s = m ? g_tf_header.EvalWithMetadb(m) : "";
		} catch (e) { s = ""; }
		s = "" + s;
		// 单行格式（如 "%artist% - %title%"）才需要清掉首尾孤立的短横线；多行格式原样保留
		if (s.indexOf("\n") < 0 && s.indexOf("\r") < 0)
			s = s.replace(/^\s*-\s*/, "").replace(/\s*-\s*$/, "");
		g_header_text = (s.replace(/[ \t\r\n]+$/, "") !== "") ? s : "歌词";
	}
	return g_header_text;
}
// 把 title format 的结果拆成「要画的行」：去尾空格、丢掉只有标签没内容的行（如专辑为空时的 "专辑: "）、折叠连续空行
function headerLines() {
	var raw = headerText().replace(/\r\n|\r/g, "\n").split("\n");
	var out = [];
	for (var i = 0; i < raw.length; i++) {
		var t = raw[i].replace(/[ \t]+$/, "");
		if (/^[^:：]{0,10}[:：]\s*$/.test(t)) continue;
		out.push(t);
	}
	var fin = [];
	for (var j = 0; j < out.length; j++) {
		if (out[j] === "" && (fin.length === 0 || fin[fin.length - 1] === "")) continue;
		fin.push(out[j]);
	}
	while (fin.length && fin[fin.length - 1] === "") fin.pop();
	if (!fin.length) fin.push("歌词");
	return fin;
}
var g_header_layout = null;
function headerLayout(gr) {
	var lines = headerLines();
	var key = lines.join("\n") + "|" + ww + "|" + wh + "|" + properties.title_font_size
		+ "|" + (typeof g_fsize !== 'undefined' ? g_fsize : 0);
	if (g_header_layout && g_header_layout.key === key) return g_header_layout;

	var maxw = Math.max(40, ww - padding_left - padding_right);
	var lh = 0;
	try { lh = gr.CalcTextHeight("Ag", font_title); } catch (e) { lh = 0; }
	if (!lh || lh < 1) lh = (properties.title_font_size > 0 ? properties.title_font_size : 14) + 5;

	var rows = [];
	for (var i = 0; i < lines.length; i++) {
		var t = lines[i];
		if (t === "") { rows.push(""); continue; }
		if (gr.CalcTextWidth(t, font_title) <= maxw) { rows.push(t); continue; }
		var cur = "";                       // 超宽时按字符折行，中文场景够用
		for (var j = 0; j < t.length; j++) {
			var ch = t.charAt(j);
			if (cur !== "" && gr.CalcTextWidth(cur + ch, font_title) > maxw) { rows.push(cur); cur = ch; }
			else cur += ch;
		}
		if (cur !== "") rows.push(cur);
	}

	// 空行只当段落间隔用，高度取半行
	var gap = Math.max(2, Math.round(lh / 2));
	function measure(rw) {
		var t = 0;
		for (var n = 0; n < rw.length; n++) t += (rw[n] === "" ? gap : lh);
		return t;
	}
	// 差半行以内不算装不下（首尾各裁几像素看不出来），超过才把空行整行抽掉
	if (measure(rows) > wh + Math.round(lh * 0.5)) {
		var compact = [];
		for (var m = 0; m < rows.length; m++) if (rows[m] !== "") compact.push(rows[m]);
		if (compact.length) rows = compact;
	}

	// WSH_TITLE_ALIGN = "line"：每一行各自水平居中（当前）
	//                   "block"：整块居中、行内左对齐（冒号能对齐成一条竖线）
	var xs = [], widths = [], first_w = 0, block_w = 0;
	for (var k = 0; k < rows.length; k++) {
		var tw = rows[k] ? Math.min(gr.CalcTextWidth(rows[k], font_title), maxw) : 0;
		widths.push(tw);
		if (!first_w && tw) first_w = tw;
		if (tw > block_w) block_w = tw;
	}
	var block_x = Math.round((ww - block_w) / 2);
	if (block_x < 2) block_x = 2;
	for (var q = 0; q < widths.length; q++) {
		var lx = (WSH_TITLE_ALIGN === "block") ? block_x : Math.round((ww - widths[q]) / 2);
		if (lx < 2) lx = 2;
		xs.push(lx);
	}
	g_header_layout = { key: key, lines: rows, lh: lh, gap: gap, total: measure(rows),
		first_w: first_w, widths: widths, xs: xs, block_x: block_x };
	return g_header_layout;
}
// %playback_time% 需要定时重算，否则停止在开播那一刻的 0:00
var g_header_timer = null;
function startHeaderTimer() {
	if (g_header_timer) { clearInterval(g_header_timer); g_header_timer = null; }
	var iv = properties.title_refresh_sec;
	if (!iv || iv <= 0) return;
	if (("" + properties.title_format).indexOf("playback_time") < 0) return;
	g_header_timer = setInterval(function () {
		try {
			if (!window.IsVisible) return;
			var old = g_header_text;
			g_header_text = null;
			var now = headerText();
			if (now !== old) { g_header_layout = null; window.Repaint(); }
		} catch (e) {}
	}, Math.max(1, iv) * 1000);
}

/* ===================== 频谱（方案 A：GDI 绘制 + 伪透明底图） =====================
   说明：这里绝不能设 window.DrawMode = 1。D2D 后端没有父窗 DC 可以 BitBlt，
   SupportPseudoTransparency 会整块失效，面板变成实心矩形，壁纸透不出来。
   频谱本身全是 FillSolidRect，GDI 和 D2D 画出来的效果没有区别。 */
var SPEC_N = 2048;                       // FFT 点数
var SPEC_FMIN = 30, SPEC_FMAX = 16000;   // 显示频段（与 05 脚本一致）
var SPEC_MAXBARS = 96;
var spec = null;

/* --- 颜色工具（HSL 空间调色，比直接乘系数好控制） --- */
function specRGB2HSL(c) {
	var r = ((c >> 16) & 0xff) / 255, g = ((c >> 8) & 0xff) / 255, b = (c & 0xff) / 255;
	var mx = Math.max(r, g, b), mn = Math.min(r, g, b);
	var l = (mx + mn) / 2, h = 0, s = 0, d = mx - mn;
	if (d > 0.00001) {
		s = (l > 0.5) ? d / (2 - mx - mn) : d / (mx + mn);
		if (mx === r) h = (g - b) / d + (g < b ? 6 : 0);
		else if (mx === g) h = (b - r) / d + 2;
		else h = (r - g) / d + 4;
		h /= 6;
	}
	return [h, s, l];
}
function specHSL2RGB(h, s, l) {
	h = ((h % 1) + 1) % 1;
	if (s < 0) s = 0; else if (s > 1) s = 1;
	if (l < 0) l = 0; else if (l > 1) l = 1;
	var r, g, b;
	if (s === 0) { r = g = b = l; }
	else {
		var q = (l < 0.5) ? l * (1 + s) : l + s - l * s;
		var p = 2 * l - q;
		var hue = function (t) {
			if (t < 0) t += 1;
			if (t > 1) t -= 1;
			if (t < 1 / 6) return p + (q - p) * 6 * t;
			if (t < 1 / 2) return q;
			if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
			return p;
		};
		r = hue(h + 1 / 3); g = hue(h); b = hue(h - 1 / 3);
	}
	return (0xff000000 | (Math.round(r * 255) << 16) | (Math.round(g * 255) << 8) | Math.round(b * 255)) >>> 0;
}
function specMixColour(c1, c2, t) {
	if (t < 0) t = 0; else if (t > 1) t = 1;
	var r = Math.round(((c1 >> 16) & 0xff) + (((c2 >> 16) & 0xff) - ((c1 >> 16) & 0xff)) * t);
	var g = Math.round(((c1 >> 8) & 0xff) + (((c2 >> 8) & 0xff) - ((c1 >> 8) & 0xff)) * t);
	var b = Math.round((c1 & 0xff) + ((c2 & 0xff) - (c1 & 0xff)) * t);
	return (0xff000000 | (r << 16) | (g << 8) | (b)) >>> 0;
}
/* --- 封面配色提取 --- */
// 注意：不要试图在 JS 里逐像素采样。部分 JSplitter 版本的 GdiBitmap 根本没有
// GetPixel / GetPixel32，采样会一个点都取不到，然后静默退成主题色。
// 正确做法是调用原生配色接口，图像分析在 C++ 里完成，完全不经过像素 API。
var spec_cover = {
	key: null, colour: 0, scheme: null, route: "", pending: false, retry: 0, poll: 0,
	requested: 0, hasArt: false, lastErr: "", lastImg: ""
};
function specCoverItemKey() {
	try {
		var it = fb.GetNowPlaying();
		if (!it) return null;
		var p = "";
		try { p = it.Path || ""; } catch (e0) { p = ""; }
		return p ? p : null;
	} catch (e) { return null; }
}
// 原生取色：优先 GetThemeColourSchemeJSON（OKLab 加权 K-means++，直接返回 5 个语义角色），
// 退而用 GetColourSchemeJSON（按频次统计的调色板，老接口，兼容性最好）。
// 返回 { hl: 播放中高亮色, bg: 背景面颜色 }，都强制不透明；取不到返回 null。
function specCoverScheme(img) {
	if (!img) return null;
	var size = 15;
	var dark = true;
	try { if (typeof fw_isDark === 'function') dark = !!fw_isDark(); } catch (eD) {}

	try {
		if (typeof img.GetThemeColourSchemeJSON === 'function') {
			var cs = JSON.parse(img.GetThemeColourSchemeJSON(size));
			if (cs && typeof cs === 'object' && Object.keys(cs).length) {
				var bg = ((cs.backgroundColor >>> 0) & 0xffffff) | 0xff000000;
				// playingBackgroundColor 带推荐 alpha（用来叠在背景上），这里只取 RGB 做实心柱子
				var hl = ((cs.playingBackgroundColor >>> 0) & 0xffffff) | 0xff000000;
				if (((hl ^ bg) & 0xffffff) === 0)        // 高亮和背景撞色，拉一点对比出来
					hl = specMixColour(bg, dark ? 0xffffffff : 0xff000000, 0.35);
				spec_cover.route = "主题配色方案";
				return { hl: hl >>> 0, bg: bg >>> 0 };
			}
			spec_cover.lastErr = "GetThemeColourSchemeJSON 返回空对象（这张图算不出配色）";
		} else {
			spec_cover.lastErr = "本机没有 GetThemeColourSchemeJSON";
		}
	} catch (e1) { spec_cover.lastErr = "GetThemeColourSchemeJSON 出错：" + eslErr(e1); }

	try {
		if (typeof img.GetColourSchemeJSON === 'function') {
			var arr = JSON.parse(img.GetColourSchemeJSON(size));
			if (arr && arr.length) {
				// arr 按频次降序，但第一名可能是近黑/近白的大色块，没有色彩信息。
				// 往下扫几档，挑第一个"亮度正常且有饱和"的作为高亮色。
				var hl2 = (arr[0].col >>> 0) & 0xffffff;
				for (var ai = 0; ai < arr.length && ai < 8; ai++) {
					var a0 = specRGB2HSL(arr[ai].col >>> 0);
					if (a0[2] > 0.12 && a0[2] < 0.92 && a0[1] > 0.12) {
						hl2 = (arr[ai].col >>> 0) & 0xffffff; break;
					}
				}
				hl2 |= 0xff000000;
				var bg2 = specMixColour(hl2 >>> 0, dark ? 0xff000000 : 0xffffffff, 0.62);
				spec_cover.route = "调色板频次";
				return { hl: hl2 >>> 0, bg: bg2 >>> 0 };
			}
			spec_cover.lastErr = "GetColourSchemeJSON 返回空数组";
		}
	} catch (e2) { spec_cover.lastErr = "GetColourSchemeJSON 出错：" + eslErr(e2); }
	return null;
}
function specCoverRequest(force) {
	if (!properties.spec_cover_colour) return;
	var key = specCoverItemKey();
	if (!key) {
		if (spec_cover.colour || spec_cover.scheme) {
			spec_cover.colour = 0; spec_cover.scheme = null; specBuildPalette();
		}
		spec_cover.key = null;
		return;
	}
	if (!force) {
		if (key === spec_cover.key) {
			if (spec_cover.colour || spec_cover.hasArt || spec_cover.pending) return;
			if (spec_cover.retry >= 5) return;        // 这首没封面，别一直同步解码
			spec_cover.retry++;
		} else {
			spec_cover.key = key;
			spec_cover.retry = 0;
			spec_cover.hasArt = false;
		}
	} else {
		spec_cover.key = key;
		spec_cover.retry = 0;
		spec_cover.hasArt = false;
	}

	var md = null;
	try { md = fb.GetNowPlaying(); } catch (e0) { md = null; }
	if (!md) return;
	spec_cover.requested++;

	// 路线 1（首选）：utils.GetAlbumArtV2 —— SMP / JSplitter 原生提供的同步接口，
	// Eole 自己的封面面板（fw_coverArt）用的就是它，不依赖回调。
	var img = null;
	try {
		if (typeof utils.GetAlbumArtV2 === 'function') {
			try { img = utils.GetAlbumArtV2(md, 0, false); } catch (eV1) { img = null; }
			if (!img) { try { img = utils.GetAlbumArtV2(md, 0); } catch (eV2) { img = null; } }
		}
	} catch (eV0) { img = null; }

	if (img) {
		spec_cover.hasArt = true;
		spec_cover.pending = false;
		try { spec_cover.lastImg = img.Width + "x" + img.Height; } catch (eSz) { spec_cover.lastImg = ""; }
		var sc = null;
		spec_cover.lastErr = "";
		try { sc = specCoverScheme(img); } catch (eSch) {
			spec_cover.lastErr = "取色异常：" + eslErr(eSch);
		}
		spec_cover.scheme = sc;
		spec_cover.colour = sc ? sc.hl : 0;
		if (!sc) spec_cover.lastErr = (spec_cover.lastErr || "算不出配色") + "，改用主题进度条色";
		// 主图不主动 Dispose：可能是 foobar 缓存里的共用对象，交给 GC 回收
		specBuildPalette();
		try { window.Repaint(); } catch (eR) {}
		return;
	}
	spec_cover.lastErr = "utils.GetAlbumArtV2 取不到封面（这首可能没有内嵌封面）";
}
// 封面配色诊断：取不到色时跑这个，能看出卡在哪一环
function specCoverDiag() {
	var L = [];
	L.push("柱色跟随封面：" + (properties.spec_cover_colour ? "开" : "关"));
	L.push("当前配色来源：" + ((spec && spec.colourSrc) || "未定"));
	L.push("取色路线：" + (spec_cover.route || "还没成功过一次"));
	L.push("utils.GetAlbumArtV2：" + (typeof utils.GetAlbumArtV2));
	var np = null;
	try { np = fb.GetNowPlaying(); } catch (e1) {}
	var npPath = "";
	if (np) { try { npPath = np.Path || ""; } catch (e2) {} }
	L.push("当前曲目：" + (np ? (npPath || "有 metadb 但 Path 为空") : "null（没在播放？）"));
	L.push("封面 key：" + (spec_cover.key || "无"));
	L.push("请求 " + spec_cover.requested + " 次");
	L.push("是否拿到封面图：" + (spec_cover.hasArt ? "是" : "否") + "（尺寸 " + (spec_cover.lastImg || "无") + "）");
	// 现场探一次：这几个原生方法在不在、算出来是什么
	try {
		var probe = (np && typeof utils.GetAlbumArtV2 === 'function') ? utils.GetAlbumArtV2(np, 0, false) : null;
		if (probe) {
			L.push("GetThemeColourSchemeJSON：" + (typeof probe.GetThemeColourSchemeJSON));
			L.push("GetColourSchemeJSON：" + (typeof probe.GetColourSchemeJSON));
			if (typeof probe.GetThemeColourSchemeJSON === 'function') {
				var cs = JSON.parse(probe.GetThemeColourSchemeJSON(15));
				if (cs && Object.keys(cs).length) {
					var f6 = function (c) { return "#" + ("000000" + ((c >>> 0) & 0xffffff).toString(16)).slice(-6); };
					L.push("  背景 " + f6(cs.backgroundColor) + " / 文字 " + f6(cs.textColor));
					L.push("  播放高亮 " + f6(cs.playingBackgroundColor) + " / 选中 " + f6(cs.selectionBackgroundColor));
				} else L.push("  配色方案是空对象 {}");
			}
		} else L.push("诊断时重新取封面：拿不到（这首可能没有内嵌封面）");
	} catch (eProbe) { L.push("诊断探测出错：" + eslErr(eProbe)); }
	L.push("最近错误：" + (spec_cover.lastErr || "无"));
	L.push("拾到的高亮色：" + (spec_cover.colour
		? "#" + ("000000" + (spec_cover.colour >>> 0).toString(16)).slice(-6) : "无（用主题进度条色）"));
	if (spec.topColour) {
		L.push("顶部色 #" + ("000000" + (spec.topColour >>> 0).toString(16)).slice(-6)
			+ " / 底部色 #" + ("000000" + (spec.botColour >>> 0).toString(16)).slice(-6));
	}
	var msg = L.join("\r\n");
	try { console.log("[Eole/Spectrum] " + msg.replace(/\r\n/g, " | ")); } catch (e3) {}
	try { window.ShowPopupMessage(msg, "Eole · 频谱配色诊断"); } catch (e4) {}
}
function specBuildPalette() {
	if (!spec) return;
	var dark = true;
	try { if (typeof fw_isDark === 'function') dark = !!fw_isDark(); } catch (eD) {}

	var sc = (properties.spec_cover_colour && spec_cover.scheme) ? spec_cover.scheme : null;
	var hh = 0, topS = 0, topL, botL;

	if (sc) {
		// 原生配色方案给的两个语义角色：
		// playingBackgroundColor 是"播放中"的高亮色（和播放列表那行用的是同一套色系），
		// backgroundColor 是背景面颜色。柱顶取高亮色，柱根往背景色的亮度靠，就是上亮下暗的落差。
		var th = specRGB2HSL(sc.hl), bh = specRGB2HSL(sc.bg);
		hh = th[0];
		topS = th[1];
		topL = th[2];
		botL = bh[2] * 0.55 + th[2] * 0.45;
		spec.colourSrc = "封面 · " + (spec_cover.route || "原生配色");
	} else {
		// 跟随播放列表「正在播放」行上那条进度条：
		// 深色布局是半透明白（GetGrey(255,45)），浅色布局是半透明黑（GetGrey(0,70)）。
		// 直接搬过来太淡，这里沿用它的"无彩色"取向，只把亮度放大到能看清。
		topL = dark ? 0.76 : 0.16;
		botL = dark ? 0.36 : 0.58;
		spec.colourSrc = "主题进度条";
	}

	// 可见度约束：亮度按深浅布局夹紧、饱和度给个保底，避免柱子和壁纸糊成一片。
	// 提亮系数 0-100：深色背景往亮里推、浅色背景往暗里压。
	var gain = properties.spec_colour_gain;
	if (isNaN(gain)) gain = 60;
	gain = Math.max(0, Math.min(100, gain)) / 100;
	var lift = (dark ? 1 : -1) * gain * 0.16;
	topL += lift;
	botL += lift * 0.8;

	// 灰白封面不要硬凑颜色，老实做中性柱
	if (topS < 0.10) topS = 0;
	else topS = Math.min(1, Math.max(0.45, topS));
	var botS = topS * 0.85;

	// 深色布局：柱顶必须够亮、柱根要浮出背景，且上下至少差 0.18 才看得出渐变；
	// 浅色布局整个反过来，柱顶最深、柱根最浅。
	var delta = 0.18;
	if (dark) {
		if (topL < 0.58) topL = 0.58;
		if (topL > 0.95) topL = 0.95;
		if (botL > topL - delta) botL = topL - delta;
		if (botL < 0.24) botL = 0.24;
	} else {
		if (topL > 0.42) topL = 0.42;
		if (topL < 0.08) topL = 0.08;
		if (botL < topL + delta) botL = topL + delta;
		if (botL > 0.92) botL = 0.92;
	}

	spec.topColour = specHSL2RGB(hh, topS, topL);
	spec.botColour = specHSL2RGB(hh, botS, botL);
	// 峰值线：深色背景往白里冲，浅色背景往黑里压，永远是画面里最扎眼的那一道
	spec.peakColour = dark
		? specMixColour(spec.topColour, 0xfff7faff, 0.42)
		: specMixColour(spec.topColour, 0xff000000, 0.35);
	spec.palVer = (spec.palVer || 0) + 1;
	spec.ramp = null;
}
// 纵向渐变带：索引 0 = 底部（暗），末尾 = 顶部（亮、最突出）
function specRamp(n) {
	if (!spec) return null;
	if (n < 2) n = 2;
	if (spec.ramp && spec.rampKey === n) return spec.ramp;
	var a = [];
	var c0 = spec.botColour, c1 = spec.topColour;
	for (var i = 0; i < n; i++) {
		var t = i / (n - 1);
		a.push(specMixColour(c0, c1, Math.pow(t, 0.72)));
	}
	spec.ramp = a;
	spec.rampKey = n;
	return a;
}
function specInit() {
	if (spec) return;
	spec = {
		pcm: new Float32Array(131072),
		info: { SampleCount: 0, ChannelCount: 0, SampleRate: 0, ChannelConfig: 0 },
		re: new Float64Array(SPEC_N),
		im: new Float64Array(SPEC_N),
		mag: new Float64Array((SPEC_N >> 1) + 1),
		win: new Float64Array(SPEC_N),
		lo: new Int32Array(SPEC_MAXBARS),
		hi: new Int32Array(SPEC_MAXBARS),
		p0: new Float64Array(SPEC_MAXBARS),
		p1: new Float64Array(SPEC_MAXBARS),
		level: new Float64Array(SPEC_MAXBARS),
		peak: new Float64Array(SPEC_MAXBARS),
		pvel: new Float64Array(SPEC_MAXBARS),
		hold: new Float64Array(SPEC_MAXBARS),
		bands: 0, sr: 0, timer: null, lastTick: 0, quiet: true, ok: false,
		topColour: 0, botColour: 0, peakColour: 0, colourSrc: "",
		ramp: null, rampKey: 0, palVer: 0
	};
	for (var i = 0; i < SPEC_N; i++)
		spec.win[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / (SPEC_N - 1));
	specBuildPalette();
	spec_cover.key = null;
	spec_cover.retry = 0;
	specCoverRequest(true);
}
// 迭代式 radix-2 FFT，原地改写 re/im
function specFFT(re, im, n) {
	var i, j, k, len, half, wr, wi, cr, ci, tr, ti, ur, ui, vr, vi, bit, ang, ncr;
	for (i = 1, j = 0; i < n; i++) {
		bit = n >> 1;
		for (; j & bit; bit >>= 1) j ^= bit;
		j ^= bit;
		if (i < j) {
			tr = re[i]; re[i] = re[j]; re[j] = tr;
			ti = im[i]; im[i] = im[j]; im[j] = ti;
		}
	}
	for (len = 2; len <= n; len <<= 1) {
		half = len >> 1;
		ang = -2 * Math.PI / len;
		wr = Math.cos(ang); wi = Math.sin(ang);
		for (i = 0; i < n; i += len) {
			cr = 1; ci = 0;
			for (k = 0; k < half; k++) {
				ur = re[i + k]; ui = im[i + k];
				vr = re[i + k + half] * cr - im[i + k + half] * ci;
				vi = re[i + k + half] * ci + im[i + k + half] * cr;
				re[i + k] = ur + vr; im[i + k] = ui + vi;
				re[i + k + half] = ur - vr; im[i + k + half] = ui - vi;
				ncr = cr * wr - ci * wi;
				ci = cr * wi + ci * wr;
				cr = ncr;
			}
		}
	}
}
// 对数分带：低频带比一个 bin 还窄时改用几何中心插值（与 05 脚本同一套处理）
function specConfigBands(count, sr) {
	if (count > SPEC_MAXBARS) count = SPEC_MAXBARS;
	if (count !== spec.bands) {         // 柱数变了，旧电平按下标对不上，直接清掉重新长
		for (var z = 0; z < SPEC_MAXBARS; z++) {
			spec.level[z] = 0; spec.peak[z] = 0; spec.pvel[z] = 0; spec.hold[z] = 0;
		}
	}
	var half = SPEC_N >> 1;
	var scale = SPEC_N / (sr || 44100);
	var ratio = SPEC_FMAX / SPEC_FMIN;
	for (var i = 0; i < count; i++) {
		var f0 = SPEC_FMIN * Math.pow(ratio, i / count);
		var f1 = SPEC_FMIN * Math.pow(ratio, (i + 1) / count);
		var a = f0 * scale, b = f1 * scale;
		spec.p0[i] = a; spec.p1[i] = b;
		var b0 = Math.max(1, Math.floor(a));
		var b1 = Math.min(half, Math.max(b0 + 1, Math.ceil(b)));
		spec.lo[i] = b0; spec.hi[i] = b1;
	}
	spec.bands = count;
	spec.sr = sr || 44100;
}
function specGrab() {
	var info = spec.info;
	info.SampleCount = 0;
	try {
		if (typeof fb.GetAudioChunkTo === 'function') {
			if (!fb.GetAudioChunkTo(spec.pcm, 0.05, -0.02, info)) return false;
		} else if (typeof fb.GetAudioChunk === 'function') {
			var c = fb.GetAudioChunk(0.05, -0.02);
			if (!c) return false;
			info.SampleCount = c.SampleCount || 0;
			info.ChannelCount = c.ChannelCount || 0;
			info.SampleRate = c.SampleRate || 0;
			if (typeof c.CopyDataTo === 'function') {
				var need = info.SampleCount * info.ChannelCount;
				if (need > 0) {
					if (spec.pcm.length < need) spec.pcm = new Float32Array(need);
					if (!c.CopyDataTo(spec.pcm)) return false;
				}
			} else if (c.Data) {
				spec.pcm = c.Data;
			} else return false;
		} else return false;
	} catch (e) { return false; }
	return info.SampleCount > 0 && info.ChannelCount > 0 && info.SampleRate > 0;
}
function specAnalyse(dt) {
	var info = spec.info, n = SPEC_N, half = n >> 1;
	var ch = info.ChannelCount || 2;
	var used = 0, i, k;

	if (spec.ok) {
		used = Math.min(info.SampleCount, n);
		if (used < 64) used = 0;
	}
	if (used > 0) {
		var first = info.SampleCount - used;
		for (i = 0; i < n; i++) { spec.re[i] = 0; spec.im[i] = 0; }
		for (i = 0; i < used; i++) {
			var sum = 0, off = (first + i) * ch;
			for (k = 0; k < ch; k++) sum += spec.pcm[off + k] || 0;
			spec.re[i] = (sum / ch) * spec.win[i];
		}
		specFFT(spec.re, spec.im, n);
		var gain = 4 / used;             // Hann 窗相干增益补偿
		for (i = 0; i <= half; i++)
			spec.mag[i] = Math.sqrt(spec.re[i] * spec.re[i] + spec.im[i] * spec.im[i]) * gain;
	}

	var attack = 1 - Math.exp(-dt / 0.018);
	var release = 1 - Math.exp(-dt / 0.095);
	var gravity = 3.0;

	for (i = 0; i < spec.bands; i++) {
		var target = 0;
		if (used > 0) {
			var a = spec.p0[i], b = spec.p1[i], mag;
			if (b - a < 1) {
				var cPos = Math.max(1, Math.min(half - 1, Math.sqrt(a * b)));
				var bIdx = Math.floor(cPos), frac = cPos - bIdx;
				var m0 = spec.mag[bIdx], m1 = spec.mag[Math.min(half, bIdx + 1)];
				mag = m0 + (m1 - m0) * frac;
			} else {
				var energy = 0, cnt = 0;
				for (k = spec.lo[i]; k < spec.hi[i] && k <= half; k++) { energy += spec.mag[k] * spec.mag[k]; cnt++; }
				mag = Math.sqrt(energy / Math.max(1, cnt));
			}
			var db = 20 * Math.log(Math.max(1e-12, mag)) / Math.LN10;
			target = (db + 72) / 72;     // -72dB..0dB → 0..1
			if (target < 0) target = 0; else if (target > 0.98) target = 0.98;
		}

		var lv = spec.level[i];
		lv += (target - lv) * (target >= lv ? attack : release);
		if (lv < 0) lv = 0; else if (lv > 0.98) lv = 0.98;
		spec.level[i] = lv;

		var pk = spec.peak[i];
		if (lv >= pk) { pk = lv; spec.pvel[i] = 0; spec.hold[i] = 0.10; }
		else {
			var hd = spec.hold[i] - dt;
			if (hd < 0) hd = 0;
			spec.hold[i] = hd;
			if (hd <= 0) {
				var vel = spec.pvel[i] + gravity * dt;
				pk -= vel * dt;
				spec.pvel[i] = vel;
				if (pk <= lv) { pk = lv; spec.pvel[i] = 0; }
			}
		}
		if (pk < lv) pk = lv; else if (pk > 0.98) pk = 0.98;
		spec.peak[i] = pk;
	}
}
function specAreaHeight(lay) {
	if (!properties.spec_show || !spec) return 0;
	if (wh < 80) return 0;
	var room = wh - lay.total - 4;
	if (room < 16) return 0;
	var h = properties.spec_height > 0 ? properties.spec_height : 76;
	return h > room ? room : h;
}
// 按当前面板宽度算柱数（分析前就要知道，否则第一帧没有频段表）
function specBarCount() {
	var barW = properties.spec_barw > 0 ? Math.round(properties.spec_barw) : 4;
	var gap = Math.max(1, Math.round(barW / 2));
	var w = Math.max(20, ww - padding_left - padding_right);
	var c = Math.floor((w + gap) / (barW + gap));
	if (c < 4) c = 4;
	if (c > SPEC_MAXBARS) c = SPEC_MAXBARS;
	return c;
}
function drawSpectrum(gr, x0, y0, w, h) {
	if (!spec || w < 24 || h < 12) return;
	var barW = properties.spec_barw > 0 ? Math.round(properties.spec_barw) : 4;
	var gap = Math.max(1, Math.round(barW / 2));
	var count = Math.floor((w + gap) / (barW + gap));
	if (count < 4) return;
	if (count > SPEC_MAXBARS) count = SPEC_MAXBARS;
	if (count !== spec.bands) specConfigBands(count, spec.info.SampleRate || spec.sr || 44100);

	var totalW = count * barW + (count - 1) * gap;
	var left = x0 + Math.floor((w - totalW) / 2);
	if (left < x0) left = x0;
	var plotH = h - 4;                  // 上下各留 2px，别贴着文字和面板下沿
	if (plotH < 8) return;
	var baseY = y0 + h - 2;
	var ramp = specRamp(plotH);         // 长度 = plotH，索引 0 底部最暗、末位顶部最亮
	if (!ramp) return;
	var rampN = ramp.length;
	var peakCol = spec.peakColour || ramp[rampN - 1];

	for (var i = 0; i < count; i++) {
		var lv = spec.level[i];
		var px = left + i * (barW + gap);
		if (lv > 0.003) {
			var bh = Math.round(lv * plotH);
			if (bh < 1) bh = 1;
			specFillBar(gr, px, barW, baseY - bh, baseY, bh, plotH, ramp, rampN);
		}
		var pk = spec.peak[i];
		if (pk > lv + 0.008 && pk > 0.01) {
			gr.FillSolidRect(px, baseY - Math.round(pk * plotH), barW, 1, peakCol);
		}
	}
}
// 单根柱子的纵向渐变：颜色按"绝对高度"取，同时掺入"柱内高度"，
// 保证矮柱子不至于全黑、高柱子顶端最亮最突出
function specFillBar(gr, px, barW, topY, baseY, bh, plotH, ramp, rampN) {
	if (bh <= 1) { gr.FillSolidRect(px, topY, barW, 1, ramp[rampN - 1]); return; }
	// 段高：柱子越高切得越细。60fps 下每帧总调用数控制在 ~300 次以内
	var segH = bh >= 30 ? 6 : (bh >= 12 ? 4 : 2);
	var y = baseY;
	var guard = 0;
	while (y > topY && guard++ < 64) {
		var sh = segH;
		if (sh > y - topY) sh = y - topY;
		var y2 = y - sh;
		var tAbs = (baseY - y2) / plotH;
		var tBar = (baseY - y2) / bh;
		var t = tAbs * 0.62 + tBar * 0.38;
		if (t > 1) t = 1; else if (t < 0) t = 0;
		var ci = Math.round(t * (rampN - 1));
		if (ci < 0) ci = 0; else if (ci > rampN - 1) ci = rampN - 1;
		gr.FillSolidRect(px, y2, barW, sh, ramp[ci]);
		y = y2;
	}
	if (barW >= 3) gr.FillSolidRect(px, topY, barW, 1, ramp[rampN - 1]);   // 顶端 1px 高光
}
function specTick() {
	if (!spec || !properties.spec_show) return;
	try {
		var vis = true;
		try { vis = window.IsVisible !== false; } catch (eVis) { vis = true; }
		if (!vis) return;
		var now = Date.now();
		var dt = spec.lastTick ? (now - spec.lastTick) / 1000 : 0.033;
		spec.lastTick = now;
		if (dt < 0.002) dt = 0.002; else if (dt > 0.25) dt = 0.25;

		spec.ok = specGrab();
		// 封面拾色的低频兜底（首次请求时封面可能还没就绪，或面板刚重建）
		spec_cover.poll++;
		if (spec_cover.poll >= 30) { spec_cover.poll = 0; specCoverRequest(false); }
		var cnt = specBarCount();
		if (cnt !== spec.bands || !spec.sr) specConfigBands(cnt, spec.info.SampleRate || 44100);
		specAnalyse(dt);

		var active = spec.ok;
		if (!active) {
			for (var i = 0; i < spec.bands; i++) {
				if (spec.level[i] > 0.004 || spec.peak[i] > 0.004) { active = true; break; }
			}
		}
		if (active) {
			spec.quiet = false;
			window.Repaint();
		} else if (!spec.quiet) {
			spec.quiet = true;           // 柱子落干净后补最后一帧，然后停下来
			window.Repaint();
		}
	} catch (e) {}
}
function specStart() {
	specStop();
	if (!properties.spec_show) return;
	specInit();
	var fps = properties.spec_fps > 0 ? properties.spec_fps : 30;
	if (fps < 5) fps = 5; else if (fps > 60) fps = 60;
	spec.lastTick = 0;
	spec.quiet = true;
	spec.timer = setInterval(specTick, Math.round(1000 / fps));
}
function specStop() {
	if (spec && spec.timer) { clearInterval(spec.timer); spec.timer = null; }
}

function on_init(){
	get_font();
	get_colors();
	build_buttons();
	positionButtons();
	g_cursor = new oCursor();
	g_tooltip = new oTooltip();
	build_header_font();
	startHeaderTimer();
	specStart();
}
on_init();
(function () {
	var delays = [0, 250, 800, 1800, 3500, 6000, 9000, 15000, 25000];
	for (var i = 0; i < delays.length; i++) {
		(function (d) {
			setTimeout(function () {
				if (d === 0) { get_colors(); return; }
				applyESLyricStyle(false);
			}, d);
		})(delays[i]);
	}
})();