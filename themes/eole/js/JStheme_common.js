var theme_name = "eole";
/* JSplitter 4.4.0 exposes no window.Reload at runtime (despite the docs).
   Keep every panel's reload request safe: use the API when present, otherwise
   do nothing instead of throwing from on_notify_data. */
function reloadPanelSafe() {
	try {
		if (typeof window.Reload === 'function') { window.Reload(); return true; }
	} catch (e) {}
	return false;
}
/* Some JSplitter builds (including 4.4.0) do not expose window.Reload at all.
   Provide an inert fallback so third-party biography scripts cannot throw either;
   a real Reload is still used above when the host provides it. */
try {
	if (typeof window.Reload !== 'function') {
		window.Reload = function () { return false; };
	}
} catch (eReload) {}
var ProfilePath = fb.ProfilePath;
var FoobarPath = fb.FoobarPath;
var skin_global_path = ProfilePath + "themes\\"+theme_name;
var theme_img_path = skin_global_path + "\\img";
var theme_scripts_path = skin_global_path + "\\js";
var search_results_order = fb.TitleFormat("%album artist%|%date%|%album%|%discnumber%|%tracknumber%");
var sort_by_default = "%album artist%|%date%|%album%|%discnumber%|%tracknumber%";
var sort_by_album_artist = "%album artist%|%date%|%album%|%discnumber%|%tracknumber%";
var sort_by_album = "%album%|%date%|%discnumber%|%tracknumber%";
var sort_by_path = "%path%|%album%|%date%|%discnumber%|%tracknumber%";
var sort_by_title = "%title%|%tracknumber%";
var sort_by_tracknumber = "%tracknumber%|%album artist%";
var sort_by_date = "%date%|%album artist%|%album%";
var sort_by_date_added = "$sub(9999,$year(%added%))-$sub(9999,$month(%added%))-$sub(9999,$day_of_month(%added%))|%album artist%|%date%|%album%|%tracknumber%";
var sort_by_rating = "$sub(10,%rating%)|%album artist%|%album%";
var sort_by_time = "%length%|%album artist%|%date%|%album%";
var randomBtnTimer = false;
var last_mouse_move_notified = (new Date).getTime();
var foo_playcount = utils.CheckComponent("foo_playcount", true);
var timers = [];

var globalProperties = {
	theme_version: '1.2.3b25',
	lastest_breaking_version: '1.2.3b24',
    thumbnailWidthMax: window.GetProperty("全局·缩略图最大宽度", 200),
    coverCacheWidthMax: window.GetProperty("全局·封面缓存最大宽度", 400),
	TextRendering: 4,
    ImageCacheExt: "jpg",
    ImageCacheFileType: "image/jpeg",
	fullMode_minwidth: 250,
	fullMode_minheight:250,
	miniMode_minwidth: 150,
	minMode_minheight:200,
	tooltip_delay:500,
	tooltip_button_delay:500,
	fontAdjustement_min:-5,
	fontAdjustement_max:5,
    fontAdjustement: window.GetProperty("全局·字体调整", 0),
	mem_solicitation:window.GetProperty("全局·内存占用策略", 0),
	lx_artist_cache_dir: "",
	loaded_covers2memory:window.GetProperty("封面·已加载封面保留在内存", false),
    load_covers_at_startup: window.GetProperty("封面·启动时全部加载", true),
    load_artist_img_at_startup: window.GetProperty("艺术家图片·启动时全部加载", true),
	enableDiskCache: window.GetProperty("封面·磁盘缓存",true),
	deleteDiskCache: window.GetProperty("封面·下次启动时删除缓存",false),
	enableResizableBorders: window.GetProperty("全局·启用可调整边框",true),
	colorsMainPanel: window.GetProperty("全局·主面板配色",0),
	colorsControls: window.GetProperty("全局·控制栏配色",0),
	colorsMiniPlayer: window.GetProperty("全局·迷你播放器配色",0),
	keepProportion: window.GetProperty("全局·保持比例", false),	
	record_move_every_x_ms:3000,
	refreshRate:40,
	crc: "$if(%album artist%,$if(%album%,$crc32(%album artist%##%album%),undefined),undefined)",
	crc_artist: "$crc32('artists'$meta(artist))",
	create_playlist : "创建播放列表",
	selection_playlist : "媒体库选择",
	playing_playlist : "媒体库播放",
	filter_playlist : "筛选结果",	
	whole_library : "整个媒体库",
	media_library : "媒体库",
	default_wallpaper : theme_img_path+"\\nothing_played_full.png",
    nocover_img: gdi.Image(theme_img_path+"\\no_cover.png"),
    stream_img: gdi.Image(theme_img_path+"\\stream_icon.png"),
	ResizeQLY: 0,
	use_ratings_file_tags: window.GetProperty("全局·评级存入文件标签", false),
	enable_screensaver: window.GetProperty("全局·启用屏保", false),
	escape_on_mouse_move: window.GetProperty("全局·移动鼠标退出屏保", false),
	mseconds_before_screensaver: window.GetProperty("全局·屏保激活等待毫秒", 60000),
}
var PlaylistExclude = Array(globalProperties.whole_library,globalProperties.filter_playlist);
globalProperties.tf_crc = fb.TitleFormat(globalProperties.crc);
globalProperties.tf_genre = fb.TitleFormat("%genre%");
globalProperties.tf_album = fb.TitleFormat("%album%");
globalProperties.tf_date = fb.TitleFormat("%date%");
globalProperties.tf_time = fb.TitleFormat("%time%");
globalProperties.tf_artist = fb.TitleFormat("%artist%");
globalProperties.tf_albumartist = fb.TitleFormat("$if2($meta(album artist),$meta(artist))");
globalProperties.tf_title = fb.TitleFormat("%title%");
globalProperties.tf_order = fb.TitleFormat("%album artist%|%date%|%album%|%discnumber%|%tracknumber%");
globalProperties.coverCacheWidthMax = Math.max(50,Math.min(2000,Number(globalProperties.coverCacheWidthMax)));
if(isNaN(globalProperties.coverCacheWidthMax)) globalProperties.coverCacheWidthMax = 200;
globalProperties.thumbnailWidthMax = Math.max(50,globalProperties.coverCacheWidthMax);
function versionCompare(v1, v2, options) {
    var lexicographical = options && options.lexicographical,
        zeroExtend = options && options.zeroExtend,
        v1parts = v1.replace('a','').replace('b','').split('.'),
        v2parts = v2.replace('a','').replace('b','').split('.');
    function isValidPart(x) {
        return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);
    }
    if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
        return NaN;
    }
    if (zeroExtend) {
        while (v1parts.length < v2parts.length) v1parts.push("0");
        while (v2parts.length < v1parts.length) v2parts.push("0");
    }
    if (!lexicographical) {
        v1parts = v1parts.map(Number);
        v2parts = v2parts.map(Number);
    }
    for (var i = 0; i < v1parts.length; ++i) {
        if (v2parts.length == i) return 1;
        if (v1parts[i] == v2parts[i]) continue;
        else if (v1parts[i] > v2parts[i]) return 1;
        else return -1;
    }
    if (v1parts.length != v2parts.length) return -1;
    return 0;
}
function setMemoryParameters(){
	switch(true) {
		case (globalProperties.mem_solicitation==0):
			globalProperties.loaded_covers2memory = false;
			globalProperties.load_covers_at_startup = false;
			globalProperties.load_artist_img_at_startup = false;
		break;
		case (globalProperties.mem_solicitation==1):
			globalProperties.loaded_covers2memory = true;
			globalProperties.load_covers_at_startup = false;
			globalProperties.load_artist_img_at_startup = false;
		break;
		case (globalProperties.mem_solicitation==2):
			globalProperties.loaded_covers2memory = true;
			globalProperties.load_covers_at_startup = true;
			globalProperties.load_artist_img_at_startup = false;
		break;
		case (globalProperties.mem_solicitation==3):
			globalProperties.loaded_covers2memory = true;
			globalProperties.load_covers_at_startup = true;
			globalProperties.load_artist_img_at_startup = true;
		break;
	}
}
function applyMemoryParametersLocally(info) {
	globalProperties.mem_solicitation = Number(info);
	window.SetProperty("全局·内存占用策略", globalProperties.mem_solicitation);
	setMemoryParameters();
	try {
		if (typeof g_image_cache !== 'undefined' && g_image_cache && g_image_cache.resetAll) g_image_cache.resetAll();
	} catch (e) {}
	try { window.Repaint(); } catch (e2) {}
}
setMemoryParameters();
var GLOBAL_PARAM_KEY = {
	"keepProportion": "全局·保持比例",
	"Font Adjustement": "全局·字体调整",
	"colorsMainPanel": "全局·主面板配色",
	"colorsControls": "全局·控制栏配色",
	"colorsMiniPlayer": "全局·迷你播放器配色",
	"mem_solicitation": "全局·内存占用策略",
	"thumbnailWidthMax": "全局·缩略图最大宽度",
	"coverCacheWidthMax": "全局·封面缓存最大宽度",
	"use_ratings_file_tags": "全局·评级存入文件标签",
	"enableResizableBorders": "全局·启用可调整边框",
	"enableDiskCache": "封面·磁盘缓存",
	"loaded_covers2memory": "封面·已加载封面保留在内存",
	"load_covers_at_startup": "封面·启动时全部加载",
	"load_artist_img_at_startup": "艺术家图片·启动时全部加载"
};
function setGlobalParameter(parameter_name, parameter_value, notify_others){
	var notify_others = typeof notify_others !== 'undefined' ? notify_others : false;	
	window.SetProperty(GLOBAL_PARAM_KEY[parameter_name] || ("全局·通用" + parameter_name), parameter_value);
	eval("globalProperties."+parameter_name+" = "+parameter_value);
	if(notify_others) window.NotifyOthers("setGlobalParameter",Array(parameter_name,parameter_value));
	if(parameter_name=="keepProportion") {
g_image_cache.resetCache();
	}
}
var cScrollBar = {
    enabled: window.GetProperty("显示·显示滚动条", true),
    visible: true,
    themed: false,
    defaultWidth: 10,
	width: 10,
	normalWidth: 4,
	hoverWidth: 10,
	activeWidth: 20,
	minHeight: 60,
	downWidth: 10,
	marginTop: 3,
	marginBottom: 3,
	ButtonType: {cursor: 0, up: 1, down: 2},
    defaultMinCursorHeight: 40,
    minCursorHeight: 40,
    maxCursorHeight: 1000000,
    timerID: false,
	timerCounter: -1
};

/* Shared vertical scrollbar used by the cover browser and the screensaver. */
oScrollbar = function(parentObjectName, noText) {
    this.parentObjName = parentObjectName;
    this.noTextFn = (typeof noText === 'function') ? noText : null;
	this.isVisible=false;
	this.cursorHeight=0;
    this.buttons = Array(null, null, null);
    this.draw = function(gr, x, y) {
        // draw background and buttons up & down

        // draw up & down buttons

        // draw cursor
        this.buttons[cScrollBar.ButtonType.cursor].draw(gr, this.x, this.cursorPos, 255);
    }
	this.get_h_tot = function(){
		if(g_showlist.idx>-1) {
			if((window.Height-brw.headerBarHeight)%brw.rowHeight<colors.fading_bottom_height*0.50){
				return brw.rowHeight*brw.rowsCount + g_showlist.h - g_showlist.h%brw.rowHeight + brw.rowHeight;
			} else {
				if(g_showlist.h%brw.rowHeight<20)
					return brw.rowHeight*brw.rowsCount + g_showlist.h - g_showlist.h%brw.rowHeight;
				else
					return brw.rowHeight*brw.rowsCount + g_showlist.h
			}
		} else {
			if((window.Height-brw.headerBarHeight)%brw.rowHeight<colors.fading_bottom_height*0.60){
				return brw.rowHeight*brw.rowsCount + brw.rowHeight;
			} else {
				return brw.rowHeight*brw.rowsCount;
			}
		}
	}
	this.get_h_vis = function(){
		return brw.totalRowsVis*brw.rowHeight;
	}
	this.check_scroll = function(scroll_to_check){
		h_vis = this.get_h_vis();
		h_tot = this.get_h_tot();

		if(scroll_to_check!=0 && scroll_to_check > h_tot - h_vis) {
			scroll_to_check = h_tot - h_vis;
		}
		if(scroll_to_check < 0) scroll_to_check =  0;
		return scroll_to_check;
	}
	this.setCursor = function(h_vis, h_tot, offset) {
		if(!ww || !wh || wh < 100) {
			return true;
		}

		h_vis = this.get_h_vis();
		h_tot = this.get_h_tot();

		if((h_tot > h_vis) && this.w > 2) {
			this.isVisible=true;
			this.cursorWidth = this.w;
			this.cursorWidthNormal = this.wnormal;
			// calc cursor height
			prevCursorHeight = this.cursorHeight
			this.cursorHeight = Math.round((h_vis / h_tot) * this.area_h);
			if(this.cursorHeight < cScrollBar.minHeight) this.cursorHeight = cScrollBar.minHeight;
			// cursor pos
			var ratio = offset / (h_tot - h_vis);
			this.cursorPos = this.area_y + Math.round((this.area_h - this.cursorHeight) * ratio);
			if (typeof this.buttons[0] === 'undefined' || this.buttons[0] == null || prevCursorHeight!=this.cursorHeight) {
				this.setCursorButton();
			}
		} else if(brw.finishLoading) {
			this.isVisible=false;
			scroll = 0;
		}
	}
	this.cursor_total_height = function() {
		try{
			if(g_showlist.idx>-1){
				if((window.Height-brw.headerBarHeight)%brw.rowHeight+g_showlist.h<colors.fading_bottom_height*0.66) {
					return g_showlist.h + (brw.headerBarHeight)-(brw.headerBarHeight)%brw.rowHeight - g_showlist.h%brw.rowHeight + brw.rowHeight;
				} else {
					return g_showlist.h + (brw.headerBarHeight)-(brw.headerBarHeight)%brw.rowHeight
				}
			} else {
				if((window.Height-brw.headerBarHeight)%brw.rowHeight<colors.fading_bottom_height*0.66){
					return (brw.headerBarHeight)-(brw.headerBarHeight)%brw.rowHeight+brw.rowHeight;
				} else {
					return (brw.headerBarHeight)-(brw.headerBarHeight)%brw.rowHeight;
				}
			}
		} catch (e){}
	}

    this.setCursorButton = function() {
        // normal cursor Image
        this.cursorImage_normal = gdi.CreateImage(this.cursorWidth, this.cursorHeight+2);
        var gb = this.cursorImage_normal.GetGraphics();
			gb.FillSolidRect(this.cursorWidth-this.cursorWidthNormal-1, cScrollBar.marginTop-1, this.cursorWidthNormal, this.cursorHeight-cScrollBar.marginTop-cScrollBar.marginBottom+3, colors.scrollbar_cursor_outline);
			gb.FillSolidRect(this.cursorWidth-this.cursorWidthNormal, cScrollBar.marginTop, this.cursorWidthNormal-2, this.cursorHeight-cScrollBar.marginTop-cScrollBar.marginBottom+1, colors.scrollbar_normal_cursor);
        this.cursorImage_normal.ReleaseGraphics(gb);

        // hover cursor Image
        this.cursorImage_hover = gdi.CreateImage(this.cursorWidth, this.cursorHeight+2);
        gb = this.cursorImage_hover.GetGraphics();
			gb.FillSolidRect(this.cursorWidth-cScrollBar.hoverWidth-1,0, cScrollBar.hoverWidth+2,this.cursorHeight+2,colors.scrollbar_cursor_outline);
			gb.FillSolidRect(this.cursorWidth-cScrollBar.hoverWidth,1, cScrollBar.hoverWidth,this.cursorHeight,colors.scrollbar_hover_cursor);
        this.cursorImage_hover.ReleaseGraphics(gb);

        // down cursor Image
        this.cursorImage_down = gdi.CreateImage(this.cursorWidth, this.cursorHeight+2);
        gb = this.cursorImage_down.GetGraphics();
			gb.FillSolidRect(this.cursorWidth-cScrollBar.downWidth-1,0, cScrollBar.downWidth+2,this.cursorHeight+2,colors.scrollbar_cursor_outline);
			gb.FillSolidRect(this.cursorWidth-cScrollBar.downWidth,1, cScrollBar.downWidth,this.cursorHeight,colors.scrollbar_down_cursor);
        this.cursorImage_down.ReleaseGraphics(gb);

        // create/refresh cursor Button in buttons array
        this.buttons[cScrollBar.ButtonType.cursor] = new button(this.cursorImage_normal, this.cursorImage_hover, this.cursorImage_down,"scrollbarcursor");
    }

    this.setButtons = function() {
        // normal scroll_up Image
        this.upImage_normal = gdi.CreateImage(this.w, this.w);
        var gb = this.upImage_normal.GetGraphics();
        // Draw Themed Scrollbar (lg/col)
		gb.SetSmoothingMode(2);
		var mid_x = Math.round(this.w / 2);
		gb.DrawLine(mid_x - 5, 10, mid_x - 1, 05, 2.0, colors.scrollbar_normal_cursor);
		gb.DrawLine(mid_x - 1, 06, mid_x + 2, 10, 2.0, colors.scrollbar_normal_cursor);

        this.upImage_normal.ReleaseGraphics(gb);

        // hover scroll_up Image
        this.upImage_hover = gdi.CreateImage(this.w, this.w);
        gb = this.upImage_hover.GetGraphics();
        // Draw Themed Scrollbar (lg/col)
		gb.SetSmoothingMode(2);
		var mid_x = Math.round(this.w / 2);
		gb.DrawLine(mid_x - 5, 10, mid_x - 1, 05, 2.0, colors.scrollbar_normal_cursor);
		gb.DrawLine(mid_x - 1, 06, mid_x + 2, 10, 2.0, colors.scrollbar_normal_cursor);

        this.upImage_hover.ReleaseGraphics(gb);

        // down scroll_up Image
        this.upImage_down = gdi.CreateImage(this.w, this.w);
        gb = this.upImage_down.GetGraphics();
        // Draw Themed Scrollbar (lg/col)
		gb.SetSmoothingMode(2);
		var mid_x = Math.round(this.w / 2);
		gb.DrawLine(mid_x - 5, 10, mid_x - 1, 05, 2.0, colors.scrollbar_normal_cursor);
		gb.DrawLine(mid_x - 1, 06, mid_x + 2, 10, 2.0, colors.scrollbar_normal_cursor);

        this.upImage_down.ReleaseGraphics(gb);

        // normal scroll_down Image
        this.downImage_normal = gdi.CreateImage(this.w, this.w);
        gb = this.downImage_normal.GetGraphics();
        // Draw Themed Scrollbar (lg/col)
		gb.SetSmoothingMode(2);
		var mid_x = Math.round(this.w / 2);
		gb.DrawLine(mid_x - 5, this.w - 11, mid_x - 1, this.w - 06, 2.0, colors.scrollbar_normal_cursor);
		gb.DrawLine(mid_x - 1, this.w - 07, mid_x + 2, this.w - 11, 2.0, colors.scrollbar_normal_cursor);

        this.downImage_normal.ReleaseGraphics(gb);

        // hover scroll_down Image
        this.downImage_hover = gdi.CreateImage(this.w, this.w);
        gb = this.downImage_hover.GetGraphics();
        // Draw Themed Scrollbar (lg/col)
		gb.SetSmoothingMode(2);
		var mid_x = Math.round(this.w / 2);
		gb.DrawLine(mid_x - 5, this.w - 11, mid_x - 1, this.w - 06, 2.0, colors.scrollbar_normal_cursor);
		gb.DrawLine(mid_x - 1, this.w - 07, mid_x + 2, this.w - 11, 2.0, colors.scrollbar_normal_cursor);

        this.downImage_hover.ReleaseGraphics(gb);

        // down scroll_down Image
        this.downImage_down = gdi.CreateImage(this.w, this.w);
        gb = this.downImage_down.GetGraphics();
        // Draw Themed Scrollbar (lg/col)
		gb.SetSmoothingMode(2);
		var mid_x = Math.round(this.w / 2);
		gb.DrawLine(mid_x - 5, this.w - 11, mid_x - 1, this.w - 06, 2.0, colors.scrollbar_normal_cursor);
		gb.DrawLine(mid_x - 1, this.w - 07, mid_x + 2, this.w - 11, 2.0, colors.scrollbar_normal_cursor);

        this.downImage_down.ReleaseGraphics(gb);

        for(i = 1; i < this.buttons.length; i++) {
            switch(i) {
            case cScrollBar.ButtonType.cursor:
                this.buttons[cScrollBar.ButtonType.cursor] = new button(this.cursorImage_normal, this.cursorImage_hover, this.cursorImage_down,"scrollbarcursor");
                break;
            case cScrollBar.ButtonType.up:
                this.buttons[cScrollBar.ButtonType.up] = new button(this.upImage_normal, this.upImage_hover, this.upImage_down,"scrollbarup");
                break;
            case cScrollBar.ButtonType.down:
                this.buttons[cScrollBar.ButtonType.down] = new button(this.downImage_normal, this.downImage_hover, this.downImage_down,"scrollbardown");
                break;
            };
        };
    };

    this.setSize = function(x, y, whover, h, wnormal) {
		this.x = x;
		this.y = y + (brw.headerBarHeight - ((this.noTextFn && this.noTextFn()) ? 0 : g_headerbar.white_space));
		this.w = cScrollBar.activeWidth;
		this.wnormal = wnormal;
		this.h = h - (brw.headerBarHeight - ((this.noTextFn && this.noTextFn()) ? 0 : g_headerbar.white_space));
		// scrollbar area for the cursor (<=> scrollbar height minus up & down buttons height)
		this.area_y = this.y;
		this.area_h = this.h;
        this.setButtons();
    }

	this.setOffsetFromCursorPos = function() {
        // calc ratio of the scroll cursor to calc the equivalent item for the full playlist (with gh)
        var ratio = (this.cursorPos - this.area_y) / (this.area_h - this.cursorHeight);
        // calc idx of the item (of the full playlist with gh) to display at top of the panel list (visible)
        var newOffset = Math.round(((brw.rowsCount +  Math.round(g_showlist.delta)) - brw.totalRowsVis) * ratio);
        return newOffset;
    }

    this.cursorCheck = function(event, x, y) {

        this.ishover = (x >= this.x && x <= this.x + this.w && y >= this.cursorPos && y <= (this.cursorPos + this.cursorHeight));

		if(!this.buttons[0]) return;

        switch(event) {
        case "down":
			this.buttons[0].checkstate(event, x, y);
            if(this.ishover) {
                this.cursorClickX = x;
                this.cursorClickY = y;
                this.cursorDrag = true;
                this.cursorDragDelta = y - this.cursorPos;
				this.cursorPrevY = y;
            }
            break;
        case "up":
			this.buttons[0].checkstate(event, x, y);
            if(this.cursorDrag) {

				if(g_showlist.y<0 && g_showlist.idx>-1) {
					if(((scroll-g_showlist.h)%brw.rowHeight)/brw.rowHeight<0.5)
						scroll = scroll - (scroll-g_showlist.h)%brw.rowHeight;
					else
						scroll = scroll + (brw.rowHeight-(scroll-g_showlist.h)%brw.rowHeight);
				}
				else  {
					if((scroll%brw.rowHeight)/brw.rowHeight<0.5)
						scroll = scroll - scroll%brw.rowHeight;
					else scroll = scroll + (brw.rowHeight-scroll%brw.rowHeight);
				}
				this.repaint();
            }
            this.cursorClickX = 0;
            this.cursorClickY = 0;
			this.cursorPrevY = 0;
			this.cursorDragDelta = 0;
            this.cursorDrag = false;
            break;
        case "move":

			this.buttons[0].checkstate(event, x, y);

            if(this.cursorDrag) {
				scroll += (y - this.cursorPrevY)*((brw.rowsCount/brw.totalRowsVis<1)?1:brw.rowsCount/brw.totalRowsVis);
				scroll = g_scrollbar.check_scroll(scroll);
				this.setCursor(brw.totalRowsVis*brw.rowHeight, brw.rowHeight*brw.rowsCount, scroll_);
				this.cursorPrevY = y
            }
            break;
		case "leave":
			this.buttons[0].checkstate(event, x, y);
			break;
		default:
        }
    }

	this.check = function(event, x, y) {
		this.hover = (x >= this.x && x <= this.x + this.w && y > this.area_y && y < this.area_y + this.area_h);

		// check cursor
		this.cursorCheck(event, x, y);

		// check other buttons
		var totalButtonToCheck = 1;
		for(var i = 1; i < totalButtonToCheck; i++) {
			switch(event) {
				case "dblclk":
					switch(i) {
						case 1: // up button
							if(this.buttons[i].checkstate(event, x, y) == ButtonStates.hover) {
								brw.buttonclicked = true;
								this.buttons[i].checkstate("down", x, y);
                                on_mouse_wheel(1);
							}
							break;
						case 2: // down button
							if(this.buttons[i].checkstate(event, x, y) == ButtonStates.hover) {
								brw.buttonclicked = true;
								this.buttons[i].checkstate("down", x, y);
                                on_mouse_wheel(-1);
							}
							break;
					}
					break;
				case "down":
					switch(i) {
						case 1: // up button
							if(this.buttons[i].checkstate(event, x, y) == ButtonStates.down) {
								brw.buttonclicked = true;
                                on_mouse_wheel(1);

							}
							break;
						case 2: // down button
							if(this.buttons[i].checkstate(event, x, y) == ButtonStates.down) {
								brw.buttonclicked = true;
                                on_mouse_wheel(-1);

							}
							break;
					}
					break;
				case "up":
					this.buttons[i].checkstate(event, x, y);
					break;
				default:
					this.buttons[i].checkstate(event, x, y);
			}
		}
	}

    this.repaint = function() {
		eval(this.parentObjName+".repaint()");
    }
}

var WindowState = {
    Normal: 0,
    Minimized: 1,
    Maximized: 2
}

var g_drop_effect = {
    none: 0,
    copy: 1,
    move: 2,
    link: 4,
    scroll: 0x80000000
};

var oCursor = function () {
	this.x = -10;
	this.y = -10;
	this.first_x = -10;
	this.first_y = -10;
	this.active_zone = "";
	this.timer = false;
	this.cursor = IDC_ARROW;
    this.onMouse = function (state, x, y, m) {
		switch(state){
			case 'lbtn_down':
				this.down_x = x;
				this.down_y = y;
			break;
			case 'lbtn_up':
				this.up_x = x;
				this.up_y = y;
			break;
			case 'dble_click':
				this.down_x = x;
				this.down_y = y;
			break;
			case 'move':
				if(this.x==-10) this.first_x = x;
				if(this.y==-10) this.first_y = y;
				this.x = x;
				this.y = y;
			break;
			case 'leave':
				this.x = -10;
				this.y = -10;
				this.first_x = -10;
				this.first_y = -10;
				this.active_zone = "";
				this.cursor = IDC_ARROW;
			break;
		}
    }
	this.setCursor = function(cursor_code,active_zone,numberOfTry){
		var active_zone = typeof active_zone !== 'undefined' ? active_zone : "";
		var numberOfTry = typeof numberOfTry !== 'undefined' ? numberOfTry : 1;

		if(window.Name!='ArtistBio' && (this.x<0 || this.y<0 || this.x>ww || this.y>wh))
			return;

		this.cursor = cursor_code;
		this.active_zone = active_zone;
		if(numberOfTry>1 && !this.timer){
			this.timerExecution = 0;
			this.timer = setInterval(function(numberOfTry, cursor_code) {
				g_cursor.timerExecution++;
				window.SetCursor(g_cursor.cursor);
				if(g_cursor.timerExecution >= numberOfTry) {
					window.ClearInterval(g_cursor.timer);
					g_cursor.timer = false;
				};
			}, 2, numberOfTry, cursor_code);
		} else {
			window.SetCursor(cursor_code);
		}
	}
	this.getCursor = function(){
		return this.cursor;
	}
	this.getActiveZone = function(){
		return this.active_zone;
	}
}
function SetPlaylistFocusItemByHandle(playlist_id,metadb){
	plman.ActivePlaylist = playlist_id;
	plman.SetPlaylistFocusItem(playlist_id, metadb);
}
// HTML dialogs ---------------------------------------------------------------------
function get_windows_version() {
    let version = '';
	var WshShell = new ActiveXObject("WScript.Shell");
    try {
        version = (WshShell.RegRead('HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\CurrentMajorVersionNumber')).toString();
        version += '.';
        version += (WshShell.RegRead('HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\CurrentMinorVersionNumber')).toString();

        return version;
    }
    catch (e) {
    }

    try {
        version = WshShell.RegRead('HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\CurrentVersion');

        return version;
    }
    catch (e) {
    }

    return '6.1';
}
function htmlCode(directory,filename) {
    let htmlCode = utils.ReadTextFile(directory+"\\"+filename);

    let cssPath = directory;
    if ( get_windows_version() === '6.1' ) {
        cssPath += "\\styles7.css";
    }
    else {
        cssPath += "\\styles10.css";
    }
    htmlCode = htmlCode.replace(/href="styles10.css"/i, `href="${cssPath}"`);
    return htmlCode;
};
function HtmlMsg(msg_title, msg_content, btn_label){
	utils.ShowHtmlDialog(window.ID, htmlCode(skin_global_path+"\\html","MsgBox.html"), {
		data: [msg_title, msg_content, btn_label, null],
	});
}
function NoticeBox(msg_title, msg_content, btn_yes_label, btn_no_label, action){
	function ok_callback(status, action) {
		if(status=="ok"){
			theme_version.setValue(globalProperties.theme_version);
			eval(action);
		}
		else if(status=="never"){
			theme_version.setValue(globalProperties.theme_version);
			eval(action);
		}
	}
	utils.ShowHtmlDialog(window.ID, htmlCode(skin_global_path+"\\html","Notice.html"), {
		data: [msg_title, msg_content, btn_yes_label, btn_no_label, ok_callback, action],
	});
}

function HtmlDialog(msg_title, msg_content, btn_yes_label, btn_no_label, confirm_callback){
	utils.ShowHtmlDialog(window.ID, htmlCode(skin_global_path+"\\html","ConfirmDialog.html"), {
		data: [msg_title, msg_content, btn_yes_label, btn_no_label, confirm_callback],
	});
}
function chooseMemorySettings(title, top_msg, bottom_msg, dialog_name, inter_text){
	function ok_callback(status, mem_solicitation, covercache_max_width) {
		panels_reload = false;
		if(status!="cancel"){
			if(covercache_max_width!=globalProperties.coverCacheWidthMax){
				setCoverCacheMaxWidthGlobally(Number(covercache_max_width));
				panels_reload = true;
				globalProperties.deleteDiskCache = true;
				delete_full_cache();
			}
			if(mem_solicitation>=0 && mem_solicitation<=3 && mem_solicitation!=globalProperties.mem_solicitation && status!="cancel") {
				setMemoryUsageGlobally(Number(mem_solicitation));
			}
			if(panels_reload){
				window.NotifyOthers("WSH_panels_reload",true);
			}
		}
	}
	utils.ShowHtmlDialog(window.ID, htmlCode(skin_global_path+"\\html",dialog_name+".html"), {
		data: [title, top_msg, '取消', ok_callback,'0 - 最小占用##1 - 已加载封面保留在内存##2 - 启动时加载所有封面##3 - 启动时加载所有封面及艺术家缩略图',globalProperties.mem_solicitation,bottom_msg,globalProperties.coverCacheWidthMax,inter_text],
	});
}

function customFilterGrouping(title, top_msg, bottom_msg, input_default_values, input_labels){
	function ok_callback(status, input_values) {
		if(status!="cancel"){
			var input_values = input_values.split('##');
			var refresh_filters = false;
			switch(properties.tagMode) {
				case 1:
					if (!(typeof input_values[0] == 'undefined' || g_tagswitcherbar.items_txt[1]==input_values[0])) {
						properties.album_customGroup_label = input_values[0].substring(0, 20);
						window.SetProperty("显示·专辑自定义分组名称", properties.album_customGroup_label);
						window.NotifyOthers("album_customGroup_label",properties.album_customGroup_label);
						refresh_filters = true;
					}
					if (!(typeof input_values[1] == 'undefined' || properties.tf_groupkey_album==input_values[1])) {
						if(input_values[1] == "") properties.tf_groupkey_album = properties.tf_groupkey_album_default;
						else properties.tf_groupkey_album = input_values[1];
						window.SetProperty("属性·专辑格式", properties.tf_groupkey_album);
						refresh_filters = true;
					}
					if (!(typeof input_values[2] == 'undefined' || properties.tf_sort_album==input_values[2])) {
						properties.tf_sort_album = input_values[2];
						window.SetProperty("排序·专辑格式", properties.tf_sort_album);
						refresh_filters = true;
					}					
				break;
				case 2:
					if (!(typeof input_values[0] == 'undefined' || g_tagswitcherbar.items_txt[2]==input_values[0])) {
						properties.artist_customGroup_label = input_values[0].substring(0, 20);
						window.SetProperty("显示·艺术家自定义分组名称", properties.artist_customGroup_label);
						window.NotifyOthers("artist_customGroup_label",properties.artist_customGroup_label);
						refresh_filters = true;
					}
					if (!(typeof input_values[1] == 'undefined' || properties.tf_groupkey_artist==input_values[1])) {
						if(input_values[1] == "") properties.tf_groupkey_artist = properties.tf_groupkey_artist_default;
						else properties.tf_groupkey_artist = input_values[1];
						window.SetProperty("属性·艺术家格式", properties.tf_groupkey_artist);
						refresh_filters = true;
					}
					if (!(typeof input_values[2] == 'undefined' || properties.tf_sort_artist==input_values[2])) {
						properties.tf_sort_artist = input_values[2];
						window.SetProperty("排序·艺术家格式", properties.tf_sort_artist);
						refresh_filters = true;
					}					
				break;
				case 3:
					if (!(typeof input_values[0] == 'undefined' || g_tagswitcherbar.items_txt[3]==input_values[0])) {
						properties.genre_customGroup_label = input_values[0].substring(0, 20);
						window.SetProperty("显示·流派自定义分组名称", properties.genre_customGroup_label);
						window.NotifyOthers("genre_customGroup_label",properties.genre_customGroup_label);
						refresh_filters = true;
					}
					if (!(typeof input_values[1] == 'undefined' || properties.tf_groupkey_genre==input_values[1])) {
						if(input_values[1] == "") properties.tf_groupkey_genre = properties.tf_groupkey_genre_default;
						else properties.tf_groupkey_genre = input_values[1];
						window.SetProperty("属性·流派格式", properties.tf_groupkey_genre);
						refresh_filters = true;
					}
					if (!(typeof input_values[2] == 'undefined' || properties.tf_sort_genre==input_values[2])) {
						properties.tf_sort_genre = input_values[2];
						window.SetProperty("排序·流派格式", properties.tf_sort_genre);
						refresh_filters = true;
					}
				break;
			}
			if(refresh_filters){
				properties.albumArtId = 0;
				g_tagswitcherbar.on_init();
				g_filterbox.reset_layout();
				brw.populate(true,1);
			}
		}
	}
	utils.ShowHtmlDialog(window.ID, htmlCode(skin_global_path+"\\html","InputDialog.html"), {
		data: [title, top_msg, '取消', ok_callback,bottom_msg,input_default_values,input_labels],
	});
}
function customGraphicBrowserGrouping(title, top_msg, bottom_msg, input_default_values, input_labels){
	function ok_callback(status, input_values) {
		if(status!="cancel"){
			var input_values = input_values.split('##');
			if (!(input_values[0] == "" || typeof input_values[0] == 'undefined' || properties.TFgrouping==input_values[0]+" ^^ "+input_values[1])) {						
				properties.TFgrouping = input_values[0]+" ^^ "+input_values[1];
				TF.grouping = fb.TitleFormat(properties.TFgrouping);
				window.SetProperty("主面板·媒体库分组标题格式", properties.TFgrouping);
				g_showlist.close();
				brw.populate(5,false);
			}
		}
	}
	utils.ShowHtmlDialog(window.ID, htmlCode(skin_global_path+"\\html","InputDialog.html"), {
		data: [title, top_msg, '取消', ok_callback,bottom_msg,input_default_values,input_labels],
	});
}
function customNowPlayingInfos(title, top_msg, bottom_msg, input_default_values, input_labels){
	function ok_callback(status, input_values) {
		if(status!="cancel"){
			var input_values = input_values.split('##');
			if (!(properties.customInfos==input_values[0]+" ^^ "+input_values[1])) {
				if((input_values[0] == "" || typeof input_values[0] == 'undefined') && (input_values[1] == "" || typeof input_values[1] == 'undefined')) properties.customInfos = "";				
				else properties.customInfos = input_values[0]+" ^^ "+input_values[1];
				setCustominfos();
				window.SetProperty("显示·信息格式化", properties.customInfos);
				g_infos.getTrackInfos();
			}
		}
	}
	utils.ShowHtmlDialog(window.ID, htmlCode(skin_global_path+"\\html","InputDialog.html"), {
		data: [title, top_msg, '取消', ok_callback,bottom_msg,input_default_values,input_labels],
	});
}
function customControlDetails(title, top_msg, bottom_msg, input_default_values, input_labels){
	function ok_callback(status, input_values) {
		if(status!="cancel"){
			var input_values = input_values.split('##');
			if (!(typeof input_values[0] == 'undefined' || properties.custom_firstRow==input_values[0])) {
				properties.custom_firstRow = input_values[0];
				window.SetProperty("显示·自定义第一行", properties.custom_firstRow);
				get_text(fb.GetNowPlaying());
			}
			if (!(typeof input_values[1] == 'undefined' || properties.custom_secondRow==input_values[1])) {
				properties.custom_secondRow = input_values[1];
				window.SetProperty("显示·自定义第二行", properties.custom_secondRow);
				get_text(fb.GetNowPlaying());
			}
		}
	}
	utils.ShowHtmlDialog(window.ID, htmlCode(skin_global_path+"\\html","InputDialog.html"), {
		data: [title, top_msg, '取消', ok_callback,bottom_msg,input_default_values,input_labels],
	});
}
function customTracklistDetails(title, top_msg, bottom_msg, input_default_values, input_labels){
	function ok_callback(status, input_values) {
		if(status!="cancel"){
			var input_values = input_values.split('##');
			if (!(typeof input_values[0] == 'undefined' || properties.show2linesCustomTag==input_values[0])) {
				properties.show2linesCustomTag = input_values[0];
				window.SetProperty("曲目列表·两行曲目信息(自定义标签)", properties.show2linesCustomTag);
			}
		}
	}
	utils.ShowHtmlDialog(window.ID, htmlCode(skin_global_path+"\\html","InputDialog.html"), {
		data: [title, top_msg, '取消', ok_callback,bottom_msg,input_default_values,input_labels],
	});
}

var colors = {};
var darkcolors = {};

var _list_clip_state = false;

function rowHeightForSnap() {
    try {
        if (typeof brw !== 'undefined' && brw && brw.rowHeight > 0) return brw.rowHeight;
    } catch (e) {}
    try {
        if (properties.rowHeight > 0) return properties.rowHeight;
    } catch (e2) {}
    return 0;
}

function snapScrollToRow(v, rowHeight) {
    var rh = rowHeight;
    if (!(rh > 0)) rh = rowHeightForSnap();
    if (!(rh > 0) || !isFinite(v)) return v;
    return Math.round(v / rh) * rh;
}

function stepScrollToRow(cur, target, rowHeight, smoothness) {
    var rh = rowHeight;
    if (!(rh > 0)) rh = rowHeightForSnap();
    if (!(rh > 0) || !isFinite(cur) || !isFinite(target)) return target;
    if (target == cur) return target;
    var sm = (smoothness > 1 ? smoothness : 1);
    var next = Math.round((cur + (target - cur) / sm) / rh) * rh;
    if (next == cur) next = cur + (target > cur ? rh : -rh);
    if ((target > cur && next >= target) || (target < cur && next <= target)) next = target;
    return next;
}

function clipListArea(gr, top) {
    _list_clip_state = false;
    if (!(top > 0)) return;
    try {
        gr.SetClip(0, top, Math.max(1, ww), Math.max(1, wh - top));
        _list_clip_state = true;
    } catch (e) {
        _list_clip_state = false;
    }
}

function unclipListArea(gr) {
    if (!_list_clip_state) return;
    try { gr.ResetClip(); } catch (e) {}
    _list_clip_state = false;
}

function get_colors_global(){
	darkcolors.normal_txt = GetGrey(240);
	if(properties.darklayout || properties.stick2darklayout){
		colors.normal_bg = GetGrey(30);
		if(globalProperties.colorsMainPanel==0 || globalProperties.colorsMainPanel==1){
			colors.lightgrey_bg = GetGrey(30);
			colors.alternate_row = GetGrey(0,0);
			colors.selected_item_bg = GetGrey(255,0);
			colors.selected_item_line = GetGrey(255,35);
			colors.selected_item_line_off = GetGrey(255,0);
			colors.track_gradient_size = 20;
			colors.padding_gradient = 10;
		} else if(globalProperties.colorsMainPanel==2){
			colors.lightgrey_bg = GetGrey(27);
			colors.alternate_row = GetGrey(0,30);
			colors.selected_item_bg = GetGrey(255,15);
			colors.selected_item_line = GetGrey(255,18);
			colors.selected_item_line_off = GetGrey(255,0);
			colors.track_gradient_size = 0;
			colors.padding_gradient = 0;
		}

		colors.wallpaper_overlay = GetGrey(25,180);
		colors.wallpaper_overlay_blurred = GetGrey(25,160);

		colors.normal_txt = darkcolors.normal_txt;
		colors.faded_txt = GetGrey(165);
		colors.superfaded_txt = GetGrey(105);
		colors.full_txt = GetGrey(255);

		colors.selected_bg = RGBA(015,177,255,160);
		colors.highlight = RGB(255,175,050);

		colors.headerbar_bg = RGBA(0, 0, 0, 0);
		colors.headerbar_line = GetGrey(255,38);

		colors.scrollbar_normal_cursor = GetGrey(255,60);
		colors.scrollbar_hover_cursor = GetGrey(225);
		colors.scrollbar_down_cursor = colors.scrollbar_hover_cursor;
		colors.scrollbar_cursor_outline = GetGrey(0,60);

		colors.pm_overlay = GetGrey(0,200);
		colors.pm_bg = GetGrey(0);
		colors.pm_shadow_on = GetGrey(0,35);
		colors.pm_shadow_off = GetGrey(0,0);
		colors.pm_border = GetGrey(255,55);
		colors.pm_txt = GetGrey(255);
		colors.pm_bg2 = GetGrey(0,120);
		colors.pm_bg3 = GetGrey(0,150);
		colors.pm_bg4 = GetGrey(255,40);
		colors.pm_item_separator_line = GetGrey(255,45);
		colors.pm_item_bg1 = GetGrey(0,130);
		colors.pm_item_bg2 = GetGrey(255,20);
		colors.pm_hover_row_bg = GetGrey(255,40);
		colors.pm_blink = GetGrey(255,15);
		colors.pm_blink_rectline = GetGrey(70);
		colors.pm_scrollbar = GetGrey(240);
		colors.dragimage_border = GetGrey(255,75);
		colors.dragimage_bg = GetGrey(0);
		colors.dragimage_text = GetGrey(255);
		colors.dragimage_gradline1 = GetGrey(255,100);
		colors.dragimage_gradline2 = GetGrey(255,200);
		colors.dragcover_overlay = GetGrey(0,85);
		colors.dragcover_rectline = GetGrey(255,40);

		colors.rating_icon_on = GetGrey(255);
		colors.rating_icon_off = GetGrey(255,60);
		colors.rating_icon_border = GetGrey(255,0);

		colors.reseticon_down = RGB(255,50,50);
		colors.keyboard_search_bg = GetGrey(0,205);
		colors.keyboard_search_txt = GetGrey(255,245);
		colors.keyboard_search_txtred = RGB(255,80,80);

		colors.sidesline = GetGrey(255,25);
		colors.border = GetGrey(255,50);
		colors.border_dark = GetGrey(0,40);
		colors.border_light = colors.border;
		colors.border_0 = GetGrey(255,50);

		colors.marker_hover_item = GetGrey(255);
		colors.width_marker_hover_item = 2;
		colors.dragdrop_marker_line = GetGrey(255,205);
	} else {
		if(globalProperties.colorsMainPanel==0 || globalProperties.colorsMainPanel==1){
			colors.normal_bg = GetGrey(255);
			colors.lightgrey_bg = GetGrey(255);
			colors.alternate_row = GetGrey(0,0);
			colors.selected_item_bg = GetGrey(0,0);
			colors.selected_item_line = GetGrey(0,37);
			colors.selected_item_line_off = GetGrey(0,0);
			colors.track_gradient_size = 20;
			colors.padding_gradient = 10;
		} else if(globalProperties.colorsMainPanel==2){
			colors.normal_bg = GetGrey(255);
			colors.lightgrey_bg = GetGrey(245);
			colors.alternate_row = GetGrey(0,3);
			colors.selected_item_bg = GetGrey(0,15);
			colors.selected_item_line = GetGrey(0,10);
			colors.track_gradient_size = 0;
			colors.padding_gradient = 0;
		}

		colors.wallpaper_overlay = GetGrey(255,210);
		colors.wallpaper_overlay_blurred = GetGrey(255,210);

		colors.normal_txt = GetGrey(0);
		colors.faded_txt = GetGrey(140);
		colors.superfaded_txt = GetGrey(200);
        colors.full_txt = GetGrey(0);
		colors.selected_bg = RGBA(015,177,255,100);
		colors.highlight = RGB(255,175,050);

		colors.headerbar_bg = RGBA(0, 0, 0, 0);
		colors.headerbar_line = GetGrey(0,36);

		colors.scrollbar_normal_cursor = GetGrey(0,120);
		colors.scrollbar_hover_cursor = GetGrey(0);
		colors.scrollbar_down_cursor = colors.scrollbar_hover_cursor;
		colors.scrollbar_cursor_outline = GetGrey(255,60);

		colors.pm_overlay = GetGrey(255,200);
		colors.pm_bg = GetGrey(255);
		colors.pm_shadow_on = GetGrey(0,5);
		colors.pm_shadow_off = GetGrey(0,0);
		colors.pm_border = GetGrey(0,40);
		colors.pm_txt = GetGrey(0);
		colors.pm_bg2 = GetGrey(0,120);
		colors.pm_bg3 = GetGrey(0,150);
		colors.pm_bg4 = GetGrey(255,40);
		colors.pm_item_separator_line = GetGrey(0,20);
		colors.pm_item_bg1 = GetGrey(0,130);
		colors.pm_item_bg2 = GetGrey(255,20);
		colors.pm_hover_row_bg = GetGrey(0,20);
		colors.pm_blink = GetGrey(0,10);
		colors.pm_blink_rectline = GetGrey(211);
		colors.pm_scrollbar = GetGrey(30);
		colors.dragimage_border = GetGrey(0);
		colors.dragimage_bg = GetGrey(0);
		colors.dragimage_text = GetGrey(255);
		colors.dragimage_gradline1 = GetGrey(255,100);
		colors.dragimage_gradline2 = GetGrey(255,200);

		colors.rating_icon_on = GetGrey(0);
		colors.rating_icon_off = GetGrey(0,30);
		colors.rating_icon_border = GetGrey(0,0);

		colors.dragcover_overlay = GetGrey(0,85);
		colors.dragcover_rectline = GetGrey(0,105);

		colors.reseticon_down = RGB(255,50,50);
		colors.keyboard_search_bg = GetGrey(0,205);
		colors.keyboard_search_txt = GetGrey(255,205);
		colors.keyboard_search_txtred = RGB(255,80,80);

		colors.sidesline = GetGrey(0,37);
		colors.border = GetGrey(0,50);
		colors.border_dark = GetGrey(0,40);
		colors.border_light = GetGrey(255,50);
		colors.border_0 = GetGrey(0,0);

		colors.marker_hover_item = GetGrey(30);
		colors.width_marker_hover_item = 2;
		colors.dragdrop_marker_line = GetGrey(20);
	}
}
//Files, Folders, FileSystemObject ----------------------------------------------------
oFileSystObject = function () {
    this.fileObject = new ActiveXObject("Scripting.FileSystemObject");
    this.CreateTextFile = function (path) {
		try {
           return this.fileObject.CreateTextFile(path);
        } catch (e) {
			fb.ShowPopupMessage('Oupppppsssss, it look like an error\n\n'+"CreateTextFile call, "+path, "Error");
            console.log(e)
        }
    };
    this.FileExists = function (path) {
		try {
           return utils.FileTest(path, "e")
        } catch (e) {
			fb.ShowPopupMessage('Oupppppsssss, it look like an error\n\n'+"FileExists call, "+path, "Error");
			console.log(e);
		}
    };
    this.MoveFile = function (target,dest) {
		try {
           return this.fileObject.MoveFile(target,dest);
        } catch (e) {
			fb.ShowPopupMessage('Oupppppsssss, it look like an error\n\n'+"MoveFile call, from "+target+" to "+dest, "Error");
			console.log(e);
		}
    };
    this.DeleteFile = function (path) {
        return this.fileObject.DeleteFile(path);
    };
    this.FolderExists = function (path) {
        try {
           return this.fileObject.FolderExists(path);
        } catch (e) {
			fb.ShowPopupMessage('Oupppppsssss, it look like an error\n\n'+"FolderExists call, "+path, "Error");
			console.log(e);
		}
    };
    this.CreateFolder = function (path) {
        try {
           return this.fileObject.CreateFolder(path);
        } catch (e) {
			fb.ShowPopupMessage('Oupppppsssss, it look like an error\n\n'+"CreateFolder call, "+path, "Error");
			console.log(e);
		}
    };
    this.DeleteFolder = function (path,force) {
        try {
           return this.fileObject.DeleteFolder(path,force);
        } catch (e) {
			fb.ShowPopupMessage('Oupppppsssss, it look like an error\n\n'+"DeleteFolder call, "+path+" force:"+force, "Error");
			console.log(e);
		}
    };
    this.GetFolder = function (path) {
        try {
           return this.fileObject.GetFolder(path);
        } catch (e) {
			fb.ShowPopupMessage('Oupppppsssss, it look like an error\n\n'+"GetFolder call, "+path, "Error");
			console.log(e);
		}
    };
    this.GetExtensionName = function (path) {
        try {
            return this.fileObject.GetExtensionName(path);
        } catch (e) {
			fb.ShowPopupMessage('Oupppppsssss, it look like an error\n\n'+"GetExtensionName call, "+path, "Error");
			console.log(e);
		}
    };
    this.OpenTextFile = function (path, openMode) {
        try {
           return this.fileObject.OpenTextFile(path, openMode);
        } catch (e) {
			fb.ShowPopupMessage('Oupppppsssss, it look like an error\n\n'+"OpenTextFile call, "+path, "Error");
			console.log(e);
		}
    };
}
g_files = new oFileSystObject();

var data_global_path = ProfilePath + "wsh-data";
if(!g_files.FolderExists(data_global_path))
g_files.CreateFolder(data_global_path);

var cover_img_cache = data_global_path+"\\"+theme_name+"-img-cache";
if(!g_files.FolderExists(cover_img_cache))
g_files.CreateFolder(cover_img_cache);
var SettingsPath = data_global_path+"\\"+theme_name+"-settings\\";
if (!g_files.FolderExists(SettingsPath))
g_files.CreateFolder(SettingsPath);

// Foobar commands -------------------------------------------------------
let playing_item_location = false;
let playing_item_location_old_index = false;
let ignore_playback_queue = false;
let timer_ignore_queue = false;
function fb_play_from_playing(offset){
	if(offset<0){
		fb.Prev();
	} else {
		if(fb.IsPaused || fb.IsPlaying) fb.Next();
		else fb.Play();
	}
}

// Tooltips ---------------------------------------------------------------
oTooltip = function (varName) {
	this.tooltip  = window.CreateTooltip();
	this.tooltip.TrackActivate = true;
	this.showTimer = false;
	this.activated = false;
	this.toolTipText = false;
	this.varName = varName;
	this.followMouse = false;
	this.x = -1;
	this.y = -1;
	this.activeZone = '';
	this.setText = function (new_text) {
		this.tooltip.Text = new_text;
	};
	this.getText = function () {
		return this.tooltip.Text;
	}
	this.getActiveZone = function () {
		return this.activeZone;
	}
    this.ActivateDelay = function(new_text, x, y, delay, maxWith, followMouse, activeZone) {
		this.activeZone = activeZone;
		if((!this.showTimer && !this.activated) || new_text!=this.tooltip.Text){
			this.offset_x = x - g_cursor.x;
			this.offset_y = y - g_cursor.y;
			followMouse = typeof followMouse !== 'undefined' ? followMouse : false;
			maxWith = typeof maxWith !== 'undefined' ? maxWith : 0;
			this.showTimer && clearTimeout(this.showTimer);
			this.showTimer = setTimeout(function (activeTooltip) {
				activeTooltip.Activate(new_text, g_cursor.x + activeTooltip.offset_x, g_cursor.y + activeTooltip.offset_y, maxWith, followMouse, activeZone);
				window.ClearInterval(this.showTimer);
				activeTooltip.showTimer = false;
			}, delay, this);
		}
    };
    this.Activate = function(new_text, x, y, maxWith, followMouse, activeZone) {
		maxWith = typeof maxWith !== 'undefined' ? maxWith : 0;
		this.activeZone = activeZone;
		this.followMouse = typeof followMouse !== 'undefined' ? followMouse : false;
		if(x != this.x || y != this.y){
			this.tooltip.TrackActivate = true;
			this.tooltip.TrackPosition(x, y);
		}
		if(this.tooltip.Text != new_text || !this.activated){
			this.offset_x = x - g_cursor.x;
			this.offset_y = y - g_cursor.y;
			if(maxWith>0) this.tooltip.SetMaxWidth(maxWith);
			this.tooltip.Text = new_text;
			this.tooltip.Activate();
			this.activated = true;
		}
		if(x != this.x || y != this.y){
			this.tooltip.TrackActivate = true;
			this.tooltip.TrackPosition(x, y);
		}
		this.x = x;
		this.y = y;
    };
    this.Deactivate = function() {
		this.activeZone = '';
		this.followMouse = false;
		if(this.activated){
			this.tooltip.Deactivate();
			this.activated = false;
			clearTimeout(this.showTimer);
			this.showTimer = false;
		} else if(this.showTimer)	{
			clearTimeout(this.showTimer);
			this.showTimer = false;
		}
		this.x = -1;
		this.y = -1;
    };
    this.onMouse = function (state, x, y, m) {
		switch(state){
			case 'lbtn_down':
			break;
			case 'lbtn_up':
			break;
			case 'dble_click':
			break;
			case 'move':
				if(this.followMouse && (x != this.x || y != this.y)){
					this.tooltip.TrackPosition(x+this.offset_x, y+this.offset_y);
					this.x = x;
					this.y = y;
				}
			break;
			case 'leave':
				this.Deactivate();
			break;
		}
    }
};

oUIHacks = function () {
    this.useNative = (typeof fb !== 'undefined' && typeof fb.Window !== 'undefined');

    this.EnableSizing = function () {};
    this.DisableSizing = function () {};
    
    this.SetPseudoCaption = function (x, y, w, h) {
        var oh = openhacksGet();
        /* 「禁用」模式＝foo_openhacks 系组件（mod / cn 修补版）全权接管：
           边框和伪标题栏都必须走它自己的
           COM 配置，不能同时注册 jsplitter 的伪标题栏请求——两套系统各管一半时
           （边框 openhacks、拖动 jsplitter），它的窗口吸附模块不会介入，吸附会失效。 */
        if (oh && chromeCfgIsDisabled()) {
            /* 面板还没排好版时 window.Width 不可信，跳过这次，
               等首次 on_size / 鼠标移动跟随再设置，避免错误区域盖住按钮。 */
            if (!(window.Width > 0)) return;
            try {
                oh.PseudoCaptionLeftEnabled = true;
                oh.PseudoCaptionRightEnabled = true;
                oh.PseudoCaptionTopEnabled = true;
                oh.PseudoCaptionBottomEnabled = false;
                oh.PseudoCaptionLeft = Math.round(x);
                oh.PseudoCaptionRight = Math.max(0, Math.round(window.Width - x - w));
                oh.PseudoCaptionTop = Math.round(y);
                oh.PseudoCaptionHeight = Math.max(0, Math.round(h));
            } catch (e) { console.log("OpenHacks PseudoCaption Err: " + e); }
            return;
        }
        /* 正常模式优先走 fb.Window.SetPseudoCaption（jsplitter 原生路径）：
           拖动是货真价实的系统移动循环，Win11 贴靠/分屏自然生效（Foorab 实测同款）；
           openhacks_mod 此时只做旁观者提供窗口吸附。
           fb.Window 不存在时才回退到 COM 锚点方式。 */
        if (this.useNative) {
            try {
                /* 边框/标题栏样式不在这里写死：改由标题栏的「边框控制项」统一管理
                   （WSHtitle_bar.js 的 chromeApply），否则一开边框就会被这里按回无边框。 */
                fb.Window.SetPseudoCaption(x, y - 2, w, h, true);
                return;
            } catch (e) { console.log("Native PseudoCaption Err: " + e); }
        }
        if (oh) {
            /* 面板还没排好版时 window.Width 不可信，跳过这次，
               等首次 on_size / 鼠标移动跟随再设置，避免错误区域盖住按钮。 */
            if (!(window.Width > 0)) return;
            try {
                oh.PseudoCaptionLeftEnabled = true;
                oh.PseudoCaptionRightEnabled = true;
                oh.PseudoCaptionTopEnabled = true;
                oh.PseudoCaptionBottomEnabled = false;
                oh.PseudoCaptionLeft = Math.round(x);
                oh.PseudoCaptionRight = Math.max(0, Math.round(window.Width - x - w));
                oh.PseudoCaptionTop = Math.round(y);
                oh.PseudoCaptionHeight = Math.max(0, Math.round(h));
            } catch (e) { console.log("OpenHacks PseudoCaption Err: " + e); }
        }
    };
    
    this.getFullscreenState = function () { 
        var oh = openhacksGet();
        if (oh) { try { return !!oh.Fullscreen; } catch (e) {} }
        if (this.useNative) return fb.Window.Fullscreen;
        return false; 
    };
    
    this.setFullscreenState = function (v) { 
        var oh = openhacksGet();
        if (oh) { try { oh.Fullscreen = !!v; return; } catch (e) {} }
        if (this.useNative) fb.Window.Fullscreen = v;
    };
    
    this.toggleFullscreen = function () { 
        var oh = openhacksGet();
        if (oh) { try { oh.Fullscreen = !oh.Fullscreen; return; } catch (e) {} }
        if (this.useNative) fb.Window.Fullscreen = !fb.Window.Fullscreen;
    };
    
    this.getMainWindowState = function () { 
        var oh = openhacksGet();
        if (oh) {
            try {
                /* COM 的 3 = 全屏；主题原语义里全屏不算最大化，按 0（正常）返回 */
                if (oh.WindowState == 3) return 0;
                return oh.WindowState;
            } catch (e) {}
        }
        if (this.useNative) {
            if (fb.Window.IsMaximized) return 2; // Maximized
            if (fb.Window.IsMinimized) return 1; // Minimized
            return 0; // Normal
        }
        return 0; 
    };
    
    this.setMainWindowState = function (v) { 
        var oh = openhacksGet();
        if (oh) { try { oh.WindowState = v; return; } catch (e) {} }
        if (this.useNative) {
            if (v === 2) fb.Window.Maximize();
            else if (v === 1) fb.Window.Minimize();
            else fb.Window.Restore();
        }
    };

    this.enableMinSize = function () {}; this.disableMinSize = function () {};
    this.setMinWidth = function () {}; this.setMinHeight = function () {};
    this.enableMaxSize = function () {}; this.disableMaxSize = function () {};
    this.setMaxWidth = function () {}; this.setMaxHeight = function () {};
    this.setAero = function () {}; this.setAeroEffect = function () {};
    
    this.setFrameStyle = function (v) { 
        if (this.useNative) fb.Window.FrameStyle = (v === 3 ? 2 : 0);
    };
};

/* foo_openhacks（COM: OpenHacks）检测：cn 修补版全权接管边框/伪标题栏，
   拖动为真实标题栏语义，Win11 原生贴靠/Win+方向键可用。
   fb.Window（foo_ui_hacks 系接口）只作后备。 */
var g_ohObj = undefined;
function openhacksGet() {
    if (g_ohObj === undefined) {
        g_ohObj = null;
        try {
            if (typeof utils.CheckComponent === 'function' && utils.CheckComponent("foo_openhacks"))
                g_ohObj = new ActiveXObject("OpenHacks");
        } catch (e) { g_ohObj = null; }
    }
    return g_ohObj;
}

var g_uihacks = new oUIHacks();

/* 菜单栏 / 状态栏的显隐由标题栏的「边框控制项」决定，状态存在 profile 下的共享配置文件里，
   这样每个面板读到的是同一份结果，不会出现「标题栏刚打开、别的面板 300ms 后又关掉」。 */
function chromeCfgPath() {
    return fb.ProfilePath + 'wsh-data\\eole-settings\\WINDOWCHROME.cfg';
}
function chromeCfgRead() {
    var st = { frame: false, menu: false, status: false, manager: 'jsplitter' };
    try {
        var t = utils.ReadTextFile(chromeCfgPath());
        if (t) {
            var c = JSON.parse(String(t).replace(/^\uFEFF/, ""));
            if (c && typeof c === 'object') {
                if (typeof c.frame === 'boolean') st.frame = c.frame;
                if (typeof c.menu === 'boolean') st.menu = c.menu;
                if (typeof c.status === 'boolean') st.status = c.status;
                /* 接管方：'openhacks' / 'jsplitter'（单选）。
                   迁移：旧版 disabled=true 等价于 OpenHacks 接管。 */
                if (c.manager === 'openhacks' || c.manager === 'jsplitter') st.manager = c.manager;
                else if (c.disabled === true) st.manager = 'openhacks';
            }
        }
    } catch (e) {}
    return st;
}
/* OpenHacks 接管状态的带缓存读取（1 秒 TTL）：
   SetPseudoCaption 在鼠标移动时会高频调用，不能每次都读配置文件。 */
var g_chromeDisabledCache = null, g_chromeDisabledAt = 0;
function chromeCfgIsDisabled() {
    var now = (new Date()).getTime();
    if (g_chromeDisabledCache === null || (now - g_chromeDisabledAt) > 1000) {
        g_chromeDisabledCache = chromeCfgRead().manager === 'openhacks';
        g_chromeDisabledAt = now;
    }
    return g_chromeDisabledCache;
}
function hideDuiBars() {
    if (window.InstanceType !== 1) return;
    var st = chromeCfgRead();   /* 配置文件还不存在时，就是主题默认的「都隐藏」 */
    /* foo_openhacks 已卸载时，接管状态自动作废，恢复 jsplitter 控制 */
    if (st.manager === 'openhacks' && typeof openhacksGet === 'function' && !openhacksGet()) st.manager = 'jsplitter';
    if (st.manager === 'openhacks') return; /* OpenHacks 接管＝菜单栏/状态栏由它的 COM 接口控制 */
    try {
        if (fb.Window) {
            fb.Window.MainMenuHidden = !st.menu;
            fb.Window.StatusBarHidden = !st.status;
        }
    } catch (e) {}
}

hideDuiBars();
window.SetTimeout(hideDuiBars, 300);
window.SetTimeout(hideDuiBars, 1500);

function Resizing(panelName, resizing_left,resizing_right, y_min, y_max) {
	this.resizing_left = typeof resizing_left !== 'undefined' ? resizing_left : false;
	this.resizing_right = typeof resizing_right !== 'undefined' ? resizing_right : false;
	this.panelName = typeof panelName !== 'undefined' ? panelName : "unknown";
	this.y_min = typeof y_min !== 'undefined' ? y_min : 0;
	this.y_max = typeof y_max !== 'undefined' ? y_max : 0;
	this.over_resizing_left = false;
	this.over_resizing_right = false;
	this.resizing_left_active = false;
	this.resizing_right_active = false;
	this.resizing_x = 0;
	this.resizing_activate_x = -1;
	this.show_resize_border = false;
	this.enableWindowSizing = function(m){
		g_uihacks.EnableSizing(m);
	}
	this.draw = function(gr){
	}
	this.isResizing = function(){
		return (this.resizing_left_active || this.resizing_right_active);
	}
	this.showResizeBorder = function(){
		return (this.isResizing() || this.show_resize_border);
	}
	this.disableWindowSizing = function(m){
		g_uihacks.DisableSizing(m);
	}
	this.deactivatePanelSizing = function(){
		if(globalProperties.enableResizableBorders){
			if(this.resizing_left_active) window.NotifyOthers("resizingleft_"+this.panelName,false);
			if(this.resizing_right_active) window.NotifyOthers("resizingright_"+this.panelName,false);
			this.resizing_left_active = false;
			this.resizing_right_active = false;
			this.over_resizing_left = false;
			this.over_resizing_right = false;
			this.resizing_x = 0;
			window.Repaint();
			if(g_cursor.getActiveZone()==this.panelName) g_cursor.setCursor(IDC_ARROW,2);
		}
	}
	this.on_mouse = function(event, x, y, m, resizing){
		var resizing = typeof resizing !== 'undefined' ? resizing : true;
		switch(event){
			case "move":
				if(globalProperties.enableResizableBorders){
					this.over_resizing_right = this.over_resizing_left = false;
					if(resizing){
						if(this.resizing_right && x>ww-10 && y>this.y_min && y<wh-this.y_max){
							this.over_resizing_right = true;
							this.resizing_activate_x = x;
							this.over_resizing_left = false;
							if(g_cursor.getCursor()!=IDC_SIZEWE) g_cursor.setCursor(IDC_SIZEWE,this.panelName,5);
						} else if(this.resizing_left && x<10 && y>this.y_min && y<wh-this.y_max){
							this.over_resizing_left = true;
							this.resizing_activate_x = x;
							this.over_resizing_right = false;
							if(g_cursor.getCursor()!=IDC_SIZEWE) g_cursor.setCursor(IDC_SIZEWE,this.panelName,5);
						} else if(g_cursor.getActiveZone()==this.panelName && !this.resizing_left_active){
							g_cursor.setCursor(IDC_ARROW,'1');
							this.over_resizing_left = false;
							this.resizing_activate_x = -1;
							this.over_resizing_right = false;
						} else {
							this.over_resizing_left = false;
							this.resizing_activate_x = -1;
							this.over_resizing_right = false;
						}
					}
				}
				return (this.resizing_left_active || this.resizing_right_active);
			break;
			case "lbtn_down":
				if(globalProperties.enableResizableBorders && resizing && this.resizing_activate_x==x){
					if(this.over_resizing_left){
						this.resizing_left_active = true;
						window.NotifyOthers("resizingleft_"+this.panelName,true);
						this.resizing_x = x;
						window.Repaint();
					}
					else if(this.over_resizing_right){
						this.resizing_right_active = true;
						window.NotifyOthers("resizingright_"+this.panelName,true);
						this.resizing_x = x;
						window.Repaint();
					}
					if(typeof g_tooltip == 'object') g_tooltip.Deactivate();
				}
				this.disableWindowSizing(m);
				return (this.resizing_left_active || this.resizing_right_active);
			break;
			case "lbtn_up":
				var return_var = (this.resizing_left_active || this.resizing_right_active);
				this.deactivatePanelSizing();
				this.enableWindowSizing(m);
				return return_var;
			break;
			case "leave":
				g_cursor.setCursor(IDC_ARROW,3);
			break;
		}
	}
	this.on_drag = function(event, x, y, m){
		switch(event){
			case "move":
			break;
			case "lbtn_down":
				this.disableWindowSizing(m);
			break;
			case "lbtn_up":
				this.enableWindowSizing(m);
			break;
			case "leave":
				this.on_mouse("lbtn_up", x, y, m);
			break;
		}
	}
}
// Playlists ----------------------------------------------------------------
function ExcludePlaylist(name){
	for (var i = 0; i < PlaylistExclude.length; i++) {
		if(PlaylistExclude[i]==name) return true;
	}
	return false;
}

function check_playlist(name){
    var pl_name = "", pl_idx = -1;
    for(var i=0; i < plman.PlaylistCount; i++) {
        pl_name = plman.GetPlaylistName(i);
        if(pl_name == name) {
            pl_idx = i;
            break;
        };
    };
    return pl_idx;
};
var setPlaybackPlaylist_timer=false;
function renamePlaybackPlaylist(){
	if(fb.IsPlaying && plman.GetPlaylistName(plman.PlayingPlaylist) == globalProperties.selection_playlist) {
		window.NotifyOthers("avoid_on_playlists_changed",true);
		var found_playingPlaylist = false;
		var total = plman.PlaylistCount;
		var pidx_selection = plman.PlayingPlaylist;
		var pidx_playing = -1;
		for(var i = 0; i < total; i++) {
			if(!found_playingPlaylist && plman.GetPlaylistName(i) == globalProperties.playing_playlist) {
				pidx_playing = i;
				found_playingPlaylist = true;
			};
			if(found_playingPlaylist) break;
		};
		plman.RenamePlaylist(pidx_selection, globalProperties.playing_playlist);
		if(found_playingPlaylist) {
			plman.RenamePlaylist(pidx_playing, globalProperties.selection_playlist);
		};
		if(!setPlaybackPlaylist_timer) {
			setPlaybackPlaylist_timer = setTimeout(function() {
				window.NotifyOthers("avoid_on_playlists_changed",false);
				window.NotifyOthers("UpdatePlaylistsManager",true);
				setPlaybackPlaylist_timer && clearTimeout(setPlaybackPlaylist_timer);
				setPlaybackPlaylist_timer = false;
			}, 125);
		};			
		return pidx_playing;
	}
	return false;
}
function sendandplayPlaybackPlaylist(items, play_metadb){
	play_metadb = typeof play_metadb !== 'undefined' ? play_metadb : null;
	window.NotifyOthers("avoid_on_playlists_changed",true);
	var found_playingPlaylist = false;
	var total = plman.PlaylistCount;
	var pidx_selection = plman.PlayingPlaylist;
	var pidx_playing = getPlaybackPlaylist();
	if(pidx_playing>-1) {
		plman.ClearPlaylist(pidx_playing);
		plman.InsertPlaylistItems(pidx_playing, 0, items);

		plman.FlushPlaybackQueue();
		plman.PlayingPlaylist = pidx_playing;
		if(play_metadb)
			plman.SetPlaylistFocusItem(pidx_playing, play_metadb);
		else
			plman.SetPlaylistFocusItem(pidx_playing, 0);
		if(play_metadb)
			runContextCommand("Add to playback queue", play_metadb);
		else
			plman.AddPlaylistItemToPlaybackQueue(pidx_playing, 0);
		if(fb.IsPaused || fb.IsPlaying) fb.Next();
		else fb.Play();

	};
	if(!setPlaybackPlaylist_timer) {
		setPlaybackPlaylist_timer = setTimeout(function() {
			window.NotifyOthers("avoid_on_playlists_changed",false);
			setPlaybackPlaylist_timer && clearTimeout(setPlaybackPlaylist_timer);
			setPlaybackPlaylist_timer = false;
		}, 125);
	};
}
function getPlaybackPlaylist(){
	var total = plman.PlaylistCount;
	var pidx_playing=-1;
	for (i=0; i < total; i++) {
		if(plman.GetPlaylistName(i)==globalProperties.playing_playlist){
			pidx_playing=i;break;
		}
	}
	if(pidx_playing<0){plman.CreatePlaylist(0, globalProperties.playing_playlist);pidx_playing=0}
	return pidx_playing;
}
function findSelectionPlaylist(){
	var total = plman.PlaylistCount;
	var pidx_selection = -1;
	var found_selectionPlaylist = false
	for(var i = 0; i < total; i++) {
		if(!found_selectionPlaylist && plman.GetPlaylistName(i) == globalProperties.selection_playlist) {
			pidx_selection = i;
			found_selectionPlaylist = true;
		};
		if(found_selectionPlaylist) break;
	};
	return pidx_selection;
}
function setMemoryUsageGlobally(mem_solicitation){
	globalProperties.mem_solicitation = mem_solicitation;
	window.SetProperty("全局·内存占用策略", globalProperties.mem_solicitation);
	setMemoryParameters();
	try {
		if (typeof g_image_cache !== 'undefined' && g_image_cache && g_image_cache.resetAll) g_image_cache.resetAll();
	} catch (e) {}
	window.NotifyOthers("MemSolicitation",globalProperties.mem_solicitation);
	window.NotifyOthers("WSH_panels_reload",true);
}
function setCoverCacheMaxWidthGlobally(covercache_max_mwith){
	globalProperties.coverCacheWidthMax = Number(covercache_max_mwith);
	window.SetProperty("全局·封面缓存最大宽度", globalProperties.coverCacheWidthMax);
	window.NotifyOthers("coverCacheWidthMax",globalProperties.coverCacheWidthMax);
}
function enableDiskCacheGlobally(){
	globalProperties.enableDiskCache = !globalProperties.enableDiskCache;
	window.SetProperty("封面·磁盘缓存", globalProperties.enableDiskCache);
	window.NotifyOthers("DiskCacheState",globalProperties.enableDiskCache);
	if(globalProperties.enableDiskCache) HtmlMsg("磁盘图像缓存说明", "磁盘图像缓存是一点一点建立的：显示封面时，如果尚未存入缓存，就会加入缓存。\n\n磁盘图像缓存基于 %album artist% 与 %album% 标签。\n\n更新已有封面后，必须在 foobar 中手动刷新：右键单击需要刷新的封面，会出现相应菜单项。", "确定")
	else  HtmlMsg("磁盘图像缓存说明", "警告：未启用磁盘图像缓存时，foobar 可能会变慢。\n\n要完全停用，请重启 foobar。", "确定");
}
function enableCoversAtStartupGlobally(){
	globalProperties.load_covers_at_startup = !globalProperties.load_covers_at_startup;
	window.SetProperty("封面·启动时全部加载", globalProperties.load_covers_at_startup);
	window.NotifyOthers("LoadAllCoversState",globalProperties.load_covers_at_startup);
	if(globalProperties.load_covers_at_startup) HtmlMsg("磁盘图像缓存说明", ((!globalProperties.enableDiskCache)?"如果磁盘图像缓存已启用并已建立完成，此选项效果更好（请检查下方选项）。\n\n":"")+"启用此选项后 foobar 的内存占用会更高，因为所有封面都会载入内存；如果您的媒体库不是特别庞大，应该没有问题。\n\n如需更新封面，必须在 foobar 中手动刷新：右键单击需要刷新的封面，会出现相应菜单项。\n\n磁盘图像缓存基于 %album artist% 与 %album% 标签。\n\n重启 foobar 后开始加载所有封面。", "确定")
}
function enableArtistImgAtStartupGlobally(){
	globalProperties.load_artist_img_at_startup = !globalProperties.load_artist_img_at_startup;
	window.SetProperty("艺术家图片·启动时全部加载", globalProperties.load_artist_img_at_startup);
	window.NotifyOthers("LoadAllArtistImgState",globalProperties.load_artist_img_at_startup);
	if(globalProperties.load_artist_img_at_startup) HtmlMsg("磁盘图像缓存说明",((!globalProperties.enableDiskCache)?"如果磁盘图像缓存已启用并已建立完成，此选项效果更好（请检查下方选项）。\n\n":"")+"启用此选项后 foobar 的内存占用会更高，因为所有艺术家缩略图都会载入内存；如果您的媒体库不是特别庞大，应该没有问题。\n\n如需更新艺术家图片，必须在 foobar 中手动刷新：右键单击需要刷新的艺术家缩略图，会出现相应菜单项。\n\n磁盘图像缓存基于 %album artist% 标签。\n\n重启 foobar 后开始加载所有封面。", "确定")
}
function hibernate_computer(){
	var WshShell = new ActiveXObject("WScript.Shell");
	WshShell.Run("shutdown.exe /h", 0);
}
function shutdown_computer(){
	var WshShell = new ActiveXObject("WScript.Shell");
	WshShell.Run("shutdown.exe /s /t 00", 0);
}
var MF_SEPARATOR = 0x00000800;
var MF_GRAYED = 0x00000001;
var MF_STRING = 0x00000000;
var MF_DISABLED = 0x00000002;
var MF_CHECKED = 0x00000008;
var MFT_RADIOCHECK = 0x00000200;
var MFS_CHECKED = 0x00000008;
var MF_POPUP = 0x00000010;
var DT_TOP = 0x00000000;
var DT_LEFT = 0x00000000;
var DT_CENTER = 0x00000001;
var DT_RIGHT = 0x00000002;
var DT_VCENTER = 0x00000004;
var DT_BOTTOM = 0x00000008;
var DT_WORDBREAK = 0x00000010;
var DT_SINGLELINE = 0x00000020;
var DT_NOCLIP = 0x00000100;
var DT_CALCRECT = 0x00000400;  // [1.2.1] Handles well
var DT_NOPREFIX = 0x00000800;  // NOTE: Please use this flag, or a '&' character will become an underline '_'
var DT_END_ELLIPSIS = 0x00008000;
var DT_WORD_ELLIPSIS = 0x00040000;
var VK_F2 = 0x71;
var VK_F3 = 0x72;
var VK_F5 = 0x74;
var VK_F6 = 0x75;
var VK_BACK = 0x08;
var VK_TAB = 0x09;
var VK_RETURN = 0x0D;
var VK_SHIFT = 0x10;
var VK_CONTROL = 0x11;
var VK_ALT = 0x12;
var VK_ESCAPE = 0x1B;
var VK_PGUP = 0x21;
var VK_PGDN = 0x22;
var VK_END = 0x23;
var VK_HOME = 0x24;
var VK_LEFT = 0x25;
var VK_UP = 0x26;
var VK_RIGHT = 0x27;
var VK_DOWN = 0x28;
var VK_DELETE = 0x2E;

// Used in window.SetCursor()
var IDC_ARROW = 32512;
var IDC_IBEAM = 32513;
var IDC_SIZEWE = 32644;
var IDC_SIZEALL = 32646;
var IDC_HAND = 32649;
var IDC_HELP = 32651;

var vb = {};
vb.Function = function (func) {
    return function () {
        return vb.Function.eval.call(this, func, arguments);
    };
};

vb.Function.eval = function (func) {
    var args = Array.prototype.slice.call(arguments[1]);
    for (var i = 0;
    i < args.length;
    i++) {
        if (typeof args[i] != 'string') {
            continue;
        };
        args[i] = args[i].replace(/"/g, '" + Chr(34) + "') ;
		args[i] = '"' + args[i].replace(/\n/g, '" + Chr(13) + "') + '"';
    };
    var vbe = new ActiveXObject('ScriptControl');
    vbe.Language = 'VBScript';
    return vbe.Eval(func + '(' + args.join(', ') + ')');
};

var MsgBox = vb.Function('MsgBox');
vb.OKOnly = 0;
vb.OKCancel = 1;
vb.AbortRetryIgnore = 2;
vb.YesNoCancel = 3;
vb.YesNo = 4;
vb.RetryCancel = 5;
vb.Critical = 16;
vb.Question = 32;
vb.Exclamation = 48;
vb.Information = 64;
vb.DefaultButton1 = 0;
vb.DefaultButton2 = 256;
vb.DefaultButton3 = 512;
vb.DefaultButton4 = 768;
vb.ApplicationModal = 0;
vb.SystemModal = 4096;
vb.OK = 1;
vb.Cancel = 2;
vb.Abort = 3;
vb.Retry = 4;
vb.Ignore = 5;
vb.Yes = 6;
vb.No = 7;

var KMask = {
    none: 0,
    ctrl: 1,
    shift: 2,
    ctrlshift: 3,
    ctrlalt: 4,
    ctrlaltshift: 5,
    alt: 6
};

var ButtonStates = {
    normal: 0,
    hover: 1,
    down: 2,
    hide: 3,
    active: 4,
}
var AlbumArtId = {
	front: 0,
	back: 1,
	disc: 2,
	icon: 3,
	artist: 4
};
// Used in window.GetColourCUI()
ColorTypeCUI = {
    text: 0,
    selection_text: 1,
    inactive_selection_text: 2,
    background: 3,
    selection_background: 4,
    inactive_selection_background: 5,
    active_item_frame: 6
};
// Used in window.GetFontCUI()
FontTypeCUI = {
    items: 0,
    labels: 1
};
// Used in window.GetColourDUI()
ColorTypeCUI = {
    text: 0,
    selection_text: 1,
    inactive_selection_text: 2,
    background: 3,
    selection_background: 4,
    inactive_selection_background: 5,
    active_item_frame: 6
};
// Used in window.GetFontDUI()
FontTypeDUI = {
    defaults: 0,
    tabs: 1,
    lists: 2,
    playlists: 3,
    statusbar: 4,
    console: 5
};
function RGB(r, g, b) {
    return (0xff000000 | (r << 16) | (g << 8) | (b));
};
function RGBA(r, g, b, a) {
    return ((a << 24) | (r << 16) | (g << 8) | (b));
};
var MAIN_MENU_ALIAS = {
	"File/New playlist": "文件/新建播放列表",
	"File/Open...": "文件/打开...",
	"File/Preferences": "文件/首选项",
	"File/Save playlist...": "文件/保存播放列表...",
	"File/Save Playlist...": "文件/保存播放列表...",
	"File/Load Playlist...": "文件/载入播放列表...",
	"Edit/Search": "编辑/搜索",
	"Edit/Undo": "编辑/撤销",
	"Edit/Select all": "编辑/全选",
	"View/Always on Top": "查看/总在最前",
	"View/ElPlaylist/Refresh": "查看/ElPlaylist/刷新",
	"View/ElPlaylist/Show Now Playing": "查看/ElPlaylist/显示正在播放",
	"Library/Configure": "媒体库/配置"
};
var CONTEXT_CMD_ALIAS = {
	"Properties": "属性",
	"Add to playback queue": "添加到播放队列",
	"Open containing folder": "打开所在文件夹"
};
function aliasLookup(table, cmd) {
	for (var k in table) {
		if (k === cmd) return table[k];
		if (table[k] === cmd) return k;
	}
	return null;
}
function runMainMenuCommand(cmd) {
	var ok = false;
	try { ok = fb.RunMainMenuCommand(cmd); } catch (e) { ok = false; }
	if (ok === false) {
		var alt = aliasLookup(MAIN_MENU_ALIAS, cmd);
		if (alt) { try { ok = fb.RunMainMenuCommand(alt); } catch (e) { ok = false; } }
	}
	return ok;
}
function runContextCommand(cmd, handle, flags) {
	var ok = false;
	try {
		ok = (typeof flags === 'undefined')
			? fb.RunContextCommandWithMetadb(cmd, handle)
			: fb.RunContextCommandWithMetadb(cmd, handle, flags);
	} catch (e) { ok = false; }
	if (ok === false) {
		var alt = aliasLookup(CONTEXT_CMD_ALIAS, cmd);
		if (alt) {
			try {
				ok = (typeof flags === 'undefined')
					? fb.RunContextCommandWithMetadb(alt, handle)
					: fb.RunContextCommandWithMetadb(alt, handle, flags);
			} catch (e) { ok = false; }
		}
	}
	return ok;
}

function GetGrey(grey,alpha){
	alpha = typeof alpha !== 'undefined' ? alpha : 255;
	return RGBA(grey,grey,grey,alpha);
}

function HSL2RGB(zH, zS, zL, result) {
    var L = zL / 100;
    var S = zS / 100;
    var H = zH / 100;
    var R, G, B, var_1, var_2;
    if (S==0) {             //HSL from 0 to 1
       R = L * 255;         //RGB results from 0 to 255
       G = L * 255;
       B = L * 255;
    } else {
       if (L<0.5) var_2 = L * (1 + S);
       else var_2 = (L + S) - (S * L);

       var_1 = 2 * L - var_2;

       R = 255 * Hue2RGB(var_1, var_2, H + ( 1 / 3 ));
       G = 255 * Hue2RGB(var_1, var_2, H );
       B = 255 * Hue2RGB(var_1, var_2, H - ( 1 / 3 ));
    }
    switch(result) {
        case "R":
            return Math.round(R);
            break;
        case "G":
            return Math.round(G);
            break;
        case "B":
            return Math.round(B);
            break;
        default:
            return RGB(Math.round(R), Math.round(G), Math.round(B));
    }
};
function Hue2RGB(v1, v2, vH) {
   if (vH < 0) vH += 1;
   if (vH > 1) vH -= 1;
   if ((6 * vH) < 1) return (v1 + ( v2 - v1 ) * 6 * vH);
   if ((2 * vH) < 1) return (v2);
   if ((3 * vH) < 2) return (v1 + ( v2 - v1 ) * ( ( 2 / 3 ) - vH ) * 6);
   return (v1);
};
function RGB2HSL(RGB_colour) {
    var R = (getRed(RGB_colour) / 255);
    var G = (getGreen(RGB_colour) / 255);
    var B = (getBlue(RGB_colour) / 255);
    var HSL_colour = {RGB:0, H:0, S:0, L:0};

    var_Min = Math.min(R, G, B);    //Min. value of RGB
    var_Max = Math.max(R, G, B);    //Max. value of RGB
    del_Max = var_Max - var_Min;    //Delta RGB value

    L = ( var_Max + var_Min ) / 2;

    if ( del_Max == 0 ) {           //This is a gray, no chroma...
       H = 0;                       //HSL results from 0 to 1
       S = 0;
    }
    else {                          //Chromatic data...
       if ( L < 0.5 ) S = del_Max / ( var_Max + var_Min );
       else           S = del_Max / ( 2 - var_Max - var_Min );

       del_R = ( ( ( var_Max - R ) / 6 ) + ( del_Max / 2 ) ) / del_Max;
       del_G = ( ( ( var_Max - G ) / 6 ) + ( del_Max / 2 ) ) / del_Max;
       del_B = ( ( ( var_Max - B ) / 6 ) + ( del_Max / 2 ) ) / del_Max;

       if      ( R == var_Max ) H = del_B - del_G;
       else if ( G == var_Max ) H = ( 1 / 3 ) + del_R - del_B;
       else if ( B == var_Max ) H = ( 2 / 3 ) + del_G - del_R;

       if ( H < 0 ) H += 1;
       if ( H > 1 ) H -= 1;
    }
    HSL_colour.RGB = RGB_colour;
    HSL_colour.H = Math.round(H * 100);
    HSL_colour.S = Math.round(S * 100);
    HSL_colour.L = Math.round(L * 100);
    return HSL_colour;
};
function getRed(color) {
    return ((color >> 16) & 0xff);
};
function getGreen(color) {
    return ((color >> 8) & 0xff);
};

function getBlue(color) {
    return (color & 0xff);
};
function setAlpha(color, alpha) {
	colorRGB = toRGB(color);
    return RGBA(colorRGB[0], colorRGB[1], colorRGB[2],alpha);
};
function toRGB(d){ // convert back to RGB values
	var d = d - 0xff000000;
	var r = d >> 16;
	var g = d >> 8 & 0xFF;
	var b = d & 0xFF;
	return [r,g,b];
};

function blendColors(c1, c2, factor) {
	// When factor is 0, result is 100% color1, when factor is 1, result is 100% color2.
	var c1 = toRGB(c1);
	var c2 = toRGB(c2);
	var r = Math.round(c1[0] + factor * (c2[0] - c1[0]));
	var g = Math.round(c1[1] + factor * (c2[1] - c1[1]));
	var b = Math.round(c1[2] + factor * (c2[2] - c1[2]));
	return (0xff000000 | (r << 16) | (g << 8) | (b));
};
oGenreCache = function () {
    this.genreList = Array();
	this.tf_genre = globalProperties.tf_genre;
    this.initialized = false;
    this.genreExist = function (genre) {
		for (var i = 0; i < this.genreList.length; i++) {
			if(this.genreList[i][0]==genre) return true;
		}
		return false;
    };
    this.add = function (genre) {
		if(!this.genreExist(genre)) {
			this.genreList[this.genreList.length] = Array(genre,"0");
			return true;
		}
		return false;
    };
	this.onFinish = function (genre) {
		this.sort();
		this.setHierarchy();
		this.initialized = true;
		window.NotifyOthers("hereIsGenreList",JSON_stringify(g_genre_cache));
	}
	this.setHierarchy = function () {
		var submenu=false;
		for (var i = 0; i < this.genreList.length; i++) {
			if(this.genreList[i][0].charAt(1)==".") {
				this.genreList[i][1]="2";
				if(submenu) this.genreList[i-1][1]="1";
				submenu=false;
			} else submenu=true;
		}
	}
	this.sort = function (genre) {
		this.genreList.sort(sortNumber);
	}
	this.isEmpty = function () {
		return (this.genreList.length == 0);
	}
    this.trace = function (genre) {
		for (var i = 0; i < this.genreList.length; i++) {
		}
    };
    this.on_metadb_changed = function (metadbs, fromhook) {
		if(fromhook) return;
		var previous = "123456789";
		var total = metadbs.Count;
		var item_genre = "";
		var genre_added = false;
		for(var i=0; i < total; i++) {
			item_genre = this.tf_genre.EvalWithMetadb(metadbs[i]);
			if(item_genre!=previous){
				if(this.add(item_genre)) genre_added = true;
				previous=item_genre;
			}
		}
		if(genre_added) this.onFinish();
    };
	this.build_from_library = function () {
		var libraryList = fb.GetLibraryItems();
		libraryList.OrderByFormat(globalProperties.tf_genre, 1);
		var i = 0;
		var previous = "123456789";
		var total = libraryList.Count;
		var item_genre = "";
		while(i < total){
			item_genre = this.tf_genre.EvalWithMetadb(libraryList[i]);
			if(item_genre!=previous){
				this.add(item_genre);
				previous=item_genre;
			}
			i++;
		}
		libraryList = undefined;
		this.onFinish();
	}
}
var_cache = function(){
	this.vars = {};
	this.set = function(name,value){
		this.vars[name] = value;
	};
	this.get = function(name){
		return this.vars[name];
	};
	this.setOnce = function(name,value){
		if(!this.isdefined(name)) this.vars[name] = value;
	};
	this.isdefined = function(name){
		return (typeof this.vars[name] != 'undefined' &&  this.vars[name]!=null);
	}
	this.reset = function(name){
		delete this.vars[name];
	}
	this.resetAll = function(){
		this.vars = {};
	}
}
function isDefined(variable){
	return (typeof variable != 'undefined' && variable!=null);
}
function sortNumber(a,b) {
    if(a[0] < b[0]) return -1;
    if(a[0] > b[0]) return 1;
    return 0;
}
function createGenrePopupMenu(firstFile, checked_item, genrePopupMenu){
	var checked_item = typeof checked_item !== 'undefined' ? checked_item : -1;
	var genrePopupMenu = typeof genrePopupMenu !== 'undefined' ? genrePopupMenu : window.CreatePopupMenu();
	if(checked_item >= 1000 && checked_item < 2001) var checked_name=g_genre_cache.genreList[checked_item-1000][0];
	else checked_name="#";

	//Append first song path
	try {
		if(!g_genre_cache.initialized) g_genre_cache.build_from_library();
	} catch (e) {
		g_genre_cache = new oGenreCache();
		g_genre_cache.build_from_library();
	}
	if(firstFile){
		var firstFileGenre = globalProperties.tf_genre.EvalWithMetadb(firstFile);
		var firstFilePath = firstFile.Path.substring(0,firstFile.Path.lastIndexOf("\\")+1)
		if(firstFilePath.indexOf(firstFileGenre)!=-1) var showBelow=true; else var showBelow=false;

		var DefaultGenreIndex=0;
		for (var i = 0; i < g_genre_cache.genreList.length; i++) {
			if(firstFilePath.indexOf(g_genre_cache.genreList[i][0])!=-1) {DefaultGenreIndex=i+1;break;}
		}
		if (DefaultGenreIndex>0 && !showBelow) {
			genrePopupMenu.AppendMenuItem(MF_STRING, DefaultGenreIndex+999, g_genre_cache.genreList[DefaultGenreIndex-1][0].replace("&","&&")+"（从首个文件路径推断）");
			genrePopupMenu.AppendMenuSeparator();
		}
    }

    var genre1 = window.CreatePopupMenu(); //Main genre 1
    var genre2 = window.CreatePopupMenu(); //Main genre 2
    var genre3 = window.CreatePopupMenu(); //Main genre 3
    var genre4 = window.CreatePopupMenu(); //Main genre 4
    var genre5 = window.CreatePopupMenu(); //Main genre 5
    var genre6 = window.CreatePopupMenu(); //Main genre 6
    var genre7 = window.CreatePopupMenu(); //Main genre 6

	var currentLevel=0;var flags=MF_STRING;
	if(g_genre_cache.genreList.length==0){
		if(g_genre_cache.initialized === false) genrePopupMenu.AppendMenuItem(MF_DISABLED, 0, "流派列表正在构建中，几秒后即可就绪。");
		else {
			genrePopupMenu.AppendMenuItem(MF_DISABLED, 0, "从媒体库生成的列表当前为空。");
			genrePopupMenu.AppendMenuItem(MF_DISABLED, 0, "注意：列表将在下次启动时刷新。");
			genrePopupMenu.AppendMenuSeparator();
			genrePopupMenu.AppendMenuItem(MF_STRING, 10000, "立即刷新");
		}
	} else {
		for (var i = 0; i < g_genre_cache.genreList.length; i++) {
			if(i+1000==checked_item) flags=MF_CHECKED;
			if(g_genre_cache.genreList[i][1]=="0") genrePopupMenu.AppendMenuItem(flags, i+1000, g_genre_cache.genreList[i][0].replace("&","&&"));
			else if(g_genre_cache.genreList[i][1]=="1") {
				currentLevel++;
				try {
					eval('genre'+currentLevel).AppendMenuItem(flags, i+1000, g_genre_cache.genreList[i][0].replace("&","&&"));
					if(checked_name.charAt(0)==g_genre_cache.genreList[i][0].charAt(0)) flags=MF_CHECKED;
					eval('genre'+currentLevel).AppendTo(genrePopupMenu, flags, g_genre_cache.genreList[i][0].replace("&","&&"));
				} catch (e){}
			}
			else {
				try {
					eval('genre'+currentLevel).AppendMenuItem(flags, i+1000, g_genre_cache.genreList[i][0].replace("&","&&"));
				} catch (e){}
			}
			flags=MF_STRING;
		}
	}
	if(firstFile){
		if(firstFileGenre!="") var currentGenre="Current genre: '"+firstFileGenre.replace("&","&&")+"'";

		genrePopupMenu.AppendMenuSeparator();
		genrePopupMenu.AppendMenuItem(MF_GRAYED, 0, currentGenre);
		if(showBelow && firstFileGenre!="") genrePopupMenu.AppendMenuItem(MF_GRAYED, 0, "从路径推断的流派相同");
	}
	return genrePopupMenu;
}
function showNowPlaying(force){
	var force = typeof force !== 'undefined' ? force : false;
	if(layout_state.isEqual(0) && (!main_panel_state.isEqual(1) || (getNowPlayingState()!=1 && !filters_panel_state.isMaximumValue()))){
		if(!force) window.NotifyOthers("FocusOnNowPlaying",fb.GetNowPlaying());
		else window.NotifyOthers("FocusOnNowPlayingForce",fb.GetNowPlaying());
		on_notify_data("FocusOnNowPlaying",fb.GetNowPlaying());
	} else {
		if(!force) window.NotifyOthers("FocusOnNowPlaying",fb.GetNowPlaying());
		else window.NotifyOthers("FocusOnNowPlayingForce",fb.GetNowPlaying());
	}
}
function rateAlbum(new_rating, old_rating, metadbs){
	let arr = [];
		arr.push({
			'rating_album' : new_rating,
		});
	g_avoid_metadb_updated = true;
	metadbs.UpdateFileInfoFromJSON(JSON.stringify(arr));
	window.NotifyOthers('rating_album_updated',metadbs);
	return new_rating;
}
function rateSong(new_rating, old_rating, metadb){
	var new_rating = Number(new_rating);
	var old_rating = Number(old_rating);
	if(!globalProperties.use_ratings_file_tags && foo_playcount) {
		// Rate to database statistics brought by foo_playcount.dll
		if (new_rating != old_rating) {
			if (metadb) {
				window.NotifyOthers('rating_updated',metadb);
				var bool = runContextCommand("Rating/" + ((new_rating == 0) ? "<not set>" : new_rating), metadb,8);
				if(bool) return new_rating;
				else return false;
			};
		} else {
			window.NotifyOthers('rating_updated',metadb);
			var bool = runContextCommand("Rating/<not set>", metadb,8);
			if(bool) return 0;
			else return false;
		};
	} else {
		// Rate to file
		if (new_rating != old_rating) {
			if (metadb) {
				window.NotifyOthers('rating_updated',metadb);
				var metadbList=new FbMetadbHandleList();
				metadbList.Add(metadb);

				var arr = [];
				arr.push({
					"rating" : new_rating,
				});

				metadbList.UpdateFileInfoFromJSON(JSON_stringify(arr));
				metadbList = undefined;
				return new_rating;
			};
		} else {
			window.NotifyOthers('rating_updated',metadb);

			var metadbList=new FbMetadbHandleList();
			metadbList.Add(metadb);

			var arr = [];
			arr.push({
				"rating" : "",
			});

			metadbList.UpdateFileInfoFromJSON(JSON_stringify(arr));
			metadbList = undefined;
			return 0;
		};
	};
}
function SetGenre(GenreNumber, plist_items, max_items, clean_file){
	var max_items = typeof max_items !== 'undefined' ? max_items : 9000;
	var clean_file = typeof clean_file !== 'undefined' ? clean_file : false;
    if(plist_items.Count>max_items) {
         var result = HtmlMsg("错误", "当前播放列表包含超过 "+max_items+" 个文件。请使用标准属性对话框。", "确定");
		 return false;
    } else {
		function update_confirmation(status, confirmed) {
			if(confirmed){
				var arr = [];
				for (var i = 0; i < plist_items.Count; i++) {
					arr.push({
						"genre" : [g_genre_cache.genreList[GenreNumber][0]] // we can use an array here for multiple value tags
					});
				}
				var str = JSON_stringify(arr);
				plist_items.UpdateFileInfoFromJSON(str);
			}
		}
        var QuestionString = "正在更新 "+plist_items.Count+" 个文件的流派为 '"+g_genre_cache.genreList[GenreNumber][0]+"' ?";
		HtmlDialog("请确认", QuestionString, '是', '否', update_confirmation);
    }
	return false;
}
// The items must be selected before calling this function
function removeItems(plist_items, plist_Idx, ask_for_confirmation){
	var ask_for_confirmation = typeof ask_for_confirmation !== 'undefined' ? ask_for_confirmation : true;
	if(!plist_items) {
		function delete_confirmation(status, confirmed) {
			if(confirmed){
				plman.ClearPlaylist(plist_Idx)
			}
		}
        var QuestionString = "删除所有文件（"+plman.PlaylistItemCount(plist_Idx)+"）来自播放列表（"+plman.GetPlaylistName(plist_Idx)+") ?";
		HtmlDialog("请确认", QuestionString, '是', '否', delete_confirmation);
    } else {
		if(ask_for_confirmation){
			function delete_confirmation(status, confirmed) {
				if(confirmed){
					plman.RemovePlaylistSelection(plist_Idx)
				}
			}
			var QuestionString = "删除 "+plist_items.Count+" 个文件来自播放列表（"+plman.GetPlaylistName(plist_Idx)+") ?";
			HtmlDialog("请确认", QuestionString, '是', '否', delete_confirmation);
		} else plman.RemovePlaylistSelection(plist_Idx)
    }
	return false;
}
String.prototype.sanitise = function() {
    return this.replace(/[\/\\|:]/g, "-").replace(/\*/g, "x").replace(/"/g, "''").replace(/[<>]/g, "_").replace(/\?/g, "").replace(/^\./, "_").replace(/\.+$/, "").replace(/^\s+|[\n\s]+$/g, "");
}
String.prototype.extract_year = function() {
	var year = this.match(/[0-9]{4}/);
	if(year) return year[0];
	return this;
}
function trim1(str) {
    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}

function apply_playlist(itemsList, play_results, order_list, undobackup){
	var undobackup = typeof undobackup !== 'undefined' ? undobackup : true;
	var pl_idx=-1;playlist_2remove=-1;
	for (i=0; i < plman.PlaylistCount; i++) {
		if(plman.GetPlaylistName(i)==globalProperties.selection_playlist){
			pl_idx=i;break;
		}
	}
	if(pl_idx<0){plman.CreatePlaylist(0, globalProperties.selection_playlist);pl_idx=0}
	else if(fb.IsPlaying && plman.PlayingPlaylist==pl_idx) {
		for (i=0; i < plman.PlaylistCount; i++) {
			if(plman.GetPlaylistName(i)==globalProperties.playing_playlist) {playlist_2remove = i;break;}
		}
		plman.RenamePlaylist(pl_idx,globalProperties.playing_playlist);
		if(playlist_2remove>-1) plman.RemovePlaylist(playlist_2remove);
		plman.CreatePlaylist(0, globalProperties.selection_playlist);pl_idx=0;
	}
	if(undobackup) plman.UndoBackup(pl_idx);
	plman.ActivePlaylist = pl_idx;
	plman.ClearPlaylist(pl_idx);
	if(order_list) itemsList.OrderByFormat(search_results_order, 1);
	plman.InsertPlaylistItems(pl_idx, 0, itemsList);
    if(play_results) plman.ExecutePlaylistDefaultAction(pl_idx,0);
}
function match(input, str){
    input = input.removeAccents().toLowerCase();
    for(var i in str){
        if(input.indexOf(str[i]) < 0)
            return false;
    }
    return true;
}

function process_string(str){
    var str_ = [];
    var str = str.removeAccents().toLowerCase();
    var str = str.split(" ").sort();
    for(var i in str){
        if(str[i] != "")
            str_.push(str[i]);
    }
    return str_;
}
function quickSearch(start,search_function){
	if(layout_state.isEqual(0) && (main_panel_state.isEqual(2) || main_panel_state.isEqual(3))){
		main_panel_state.setValue(0);
		on_notify_data("main_panel_state_force",main_panel_state.value);
	}
	switch(search_function) {
		case 'artist':
			var arr = globalProperties.tf_albumartist.EvalWithMetadb(start);
			try{
				artist_items = fb.GetQueryItems(fb.GetLibraryItems(), '"*$meta_sep(artist,*)*" HAS *'+trim1(arr)+'*');
				if(artist_items.Count>0){
					artist_items.OrderByFormat(globalProperties.tf_order, 1);
					apply_playlist(artist_items,false,false);
				} else {
					return false;
				}
				artist_items = undefined;
			} catch(e) {return false;}
			break;
		case 'album':
			var arr = globalProperties.tf_album.EvalWithMetadb(start);
			try{
				album_items = fb.GetQueryItems(fb.GetLibraryItems(), "%album% IS "+trim1(arr));
				if(album_items.Count>0){
					album_items.OrderByFormat(globalProperties.tf_order, 1);
					apply_playlist(album_items,false,false);
				} else {
					return false;
				}
				album_items = undefined;
			} catch(e) {return false;}
			break;
		case 'genre':
			var arr = globalProperties.tf_genre.EvalWithMetadb(start);
			try{
				genre_items = fb.GetQueryItems(fb.GetLibraryItems(), "%genre% IS "+trim1(arr));
				if(genre_items.Count>0){
					genre_items.OrderByFormat(globalProperties.tf_order, 1);
					apply_playlist(genre_items,false,false);
				} else {
					return false;
				}
				genre_items = undefined;
			} catch(e) {return false;}
			break;
		case 'date':
			var arr = globalProperties.tf_date.EvalWithMetadb(start);
			try{
				date_items = fb.GetQueryItems(fb.GetLibraryItems(), "%date% IS "+trim1(arr));
				if(date_items.Count>0){
					date_items.OrderByFormat(globalProperties.tf_order, 1);
					apply_playlist(date_items,false,false);
				} else {
					return false;
				}
				date_items = undefined;
			} catch(e) {return false;}
			break;
		case 'title':
			var arr = globalProperties.tf_title.EvalWithMetadb(start);
			try{
				title_items = fb.GetQueryItems(fb.GetLibraryItems(), "%title% IS "+trim1(arr));
				if(title_items.Count>0){
					title_items.OrderByFormat(globalProperties.tf_order, 1);
					apply_playlist(title_items,false,false);
				} else {
					return false;
				}
				title_items = undefined;
			} catch(e) {return false;}
			break;
	}
	return true;
}
function shuffleList(metadb_list) {
  var currentIndex = metadb_list.Count, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = metadb_list[currentIndex];
    metadb_list[currentIndex] = metadb_list[randomIndex];
    metadb_list[randomIndex] = temporaryValue;
  }
}
function pickRandom(metadb_list, nb_of_items){
	var list_count=metadb_list.Count;
	var tracks_list=new FbMetadbHandleList();
	var i=0;
	while(i < nb_of_items && i < list_count) {
		tracks_list.Add(metadb_list[Math.floor(Math.random()*list_count)]);
		i++;
	}
	return tracks_list;
}
function play_random(random_function, addAtTheEnd, current_played_track){
	var random_function = typeof random_function !== 'undefined' ? random_function : '200_tracks';
	var addAtTheEnd = typeof addAtTheEnd !== 'undefined' ? addAtTheEnd : false;
	var current_played_track = typeof current_played_track !== 'undefined' ? current_played_track : false;

	switch(random_function) {
		case '20_albums':
			var number_of_items = addAtTheEnd?1:25;
			break;
		case '1_genre':
		case 'same_genre':
			var number_of_items = addAtTheEnd?25:0;
			if(current_played_track)
				var current_genre = globalProperties.tf_genre.EvalWithMetadb(current_played_track);
			else random_function == '1_genre';
			break;
		case '1_artist':
		case 'same_artist':
			var number_of_items = addAtTheEnd?25:0;
			break;
		case '200_tracks':
			var number_of_items = addAtTheEnd?25:200;
			break;
		default:
			var genreValue=parseInt(random_function);
			if(genreValue >= 1000 && genreValue < 2001){
				var number_of_items = addAtTheEnd?25:0;
			} else {
				var number_of_items = addAtTheEnd?25:200;
			}
			break;
	}

	randomBtnTimer && clearTimeout(randomBtnTimer);
	var playlist_index = getPlaybackPlaylist();
	plman.UndoBackup(playlist_index);
	if(!addAtTheEnd) {
		plman.ClearPlaylist(playlist_index);
		var start_index = 0;
	} else {
		var start_index = plman.PlaylistItemCount(playlist_index);
	}
    plman.PlayingPlaylist=playlist_index;
	if(!g_genre_cache.initialized) g_genre_cache.build_from_library();
	
	var library_items = fb.GetLibraryItems();
	var library_items_number=library_items.Count;
	
	if(library_items_number==0) return;
	switch(random_function) {
		case '20_albums_old':
			var tfo = fb.TitleFormat("%album artist%|%date%|%album%|%discnumber%|%tracknumber%");
			var albums_list=new FbMetadbHandleList();
			var i=0;
			var query = "";
			while(i < number_of_items && i < library_items_number) {
				try {
					var random_item = library_items[Math.floor(Math.random()*library_items_number)];
					var arr = fb.TitleFormat("%album artist% ## %album%").EvalWithMetadb(random_item).split(" ## ");
					album_items = fb.GetQueryItems(library_items, "%album artist% IS "+arr[0]+" AND %album% IS "+arr[1]);
					album_items.OrderByFormat(tfo, 1);
					albums_list.AddRange(album_items);
					album_items = undefined;
				} catch(e) {}
				i++;
			}
			plman.InsertPlaylistItems(playlist_index, start_index, albums_list);
			plman.ExecutePlaylistDefaultAction(playlist_index,start_index);
			albums_list = undefined;
			library_items = undefined;
			break;
		case '20_albums':
			var tfo = fb.TitleFormat("%album artist%|%date%|%album%|%discnumber%|%tracknumber%");
			var albums_list=new FbMetadbHandleList();

			try {
				var random_item = library_items[Math.floor(Math.random()*library_items_number)];
				var arr = fb.TitleFormat("%album artist% ## %album%").EvalWithMetadb(random_item).split(" ## ");
				album_items = fb.GetQueryItems(library_items, "%album artist% IS "+arr[0]+" AND %album% IS "+arr[1]);
				album_items.OrderByFormat(tfo, 1);
			} catch(e) {}
			
			plman.InsertPlaylistItems(playlist_index, start_index, album_items);
			plman.ExecutePlaylistDefaultAction(playlist_index,start_index);
			album_items = undefined;
			library_items = undefined;
			break;		
		case '1_genre':
		case 'same_genre':
				if(random_function=="same_genre"){
					var genre_item_list = fb.GetQueryItems(library_items, "%genre% IS "+current_genre);
				} else
					var genre_item_list = fb.GetQueryItems(library_items, "%genre% IS "+g_genre_cache.genreList[Math.floor(Math.random()*g_genre_cache.genreList.length)][0]);
				if(number_of_items>0) genre_item_list = pickRandom(genre_item_list, number_of_items)
				else shuffleList(genre_item_list)
				plman.InsertPlaylistItems(playlist_index, start_index, genre_item_list);
				plman.ExecutePlaylistDefaultAction(playlist_index,start_index);
				genre_item_list = undefined;
			break;
		case '1_artist':
			var tfo = fb.TitleFormat("%album artist%|%date%|%album%|%discnumber%|%tracknumber%");
			try {
				var random_item = library_items[Math.floor(Math.random()*library_items_number)];
				var artist_name = fb.TitleFormat("%artist%").EvalWithMetadb(random_item);
				var artist_list = fb.GetQueryItems(library_items, "%artist% IS "+artist_name);
				if(number_of_items>0) artist_list = pickRandom(artist_list, number_of_items)
				else shuffleList(artist_list)
				plman.InsertPlaylistItems(playlist_index, start_index, artist_list);
				plman.ExecutePlaylistDefaultAction(playlist_index,start_index);
				artist_list = undefined;
			} catch(e) {}
			library_items = undefined;
			break;
		case '200_tracks':
			var tracks_list=new FbMetadbHandleList();
			var i=0;
			while(i < number_of_items && i < library_items_number) {
				tracks_list.Add(library_items[Math.floor(Math.random()*library_items_number)]);
				i++;
			}
			plman.InsertPlaylistItems(playlist_index, start_index, tracks_list);
			plman.ExecutePlaylistDefaultAction(playlist_index,start_index);
			tracks_list = undefined;
			library_items = undefined;
			break;
		default:
			var genreValue=parseInt(random_function);
			if(genreValue >= 1000 && genreValue < 2001){
				try {
					var genre_item_list = fb.GetQueryItems(library_items, "%genre% IS "+g_genre_cache.genreList[genreValue-1000][0]);
					if(number_of_items>0) genre_item_list = pickRandom(genre_item_list, number_of_items)
					else shuffleList(genre_item_list)
					plman.InsertPlaylistItems(playlist_index, start_index, genre_item_list);
					plman.ExecutePlaylistDefaultAction(playlist_index,start_index);
					genre_item_list = undefined;
				} catch(e) {}
			} else {
				var tracks_list=new FbMetadbHandleList();
				i=0;
				while(i < number_of_items && i < library_items_number) {
					tracks_list.Add(library_items[Math.floor(Math.random()*library_items_number)]);
					i++;
				}
				plman.InsertPlaylistItems(playlist_index, start_index, tracks_list);
				plman.ExecutePlaylistDefaultAction(playlist_index,start_index);
				tracks_list = undefined;
				library_items = undefined;
			}
			break;
	}
	fb.Stop();fb.Play();
    Randomsetfocus=true;
	window.NotifyOthers("Randomsetfocus", Randomsetfocus);
}

function arrayContains(array,name){
	for (var i = 0; i < array.length; i++) {
		if(array[i]==name) return true;
	}
	return false;
}
function delete_tags_except(track_metadb,except_array){
	var track_FileInfo = track_metadb.GetFileInfo();

	for (var i = 0; i <= track_FileInfo.MetaCount; i++) {
		if(!arrayContains(except_array , track_FileInfo.MetaName(i)))
			 track_metadb.UpdateFileInfoSimple(track_FileInfo.MetaName(i), "");
	}
}

// *****************************************************************************************************************************************
// Common functions & flags by Br3tt aka Falstaff (c)2013-2015
// *****************************************************************************************************************************************

//=================================================// General declarations

function GetKeyboardMask() {
    var c = utils.IsKeyPressed(VK_CONTROL) ? true : false;
    var a = utils.IsKeyPressed(VK_ALT) ? true : false;
    var s = utils.IsKeyPressed(VK_SHIFT) ? true : false;
    var ret = KMask.none;
    if (c && !a && !s) ret = KMask.ctrl;
    if (!c && !a && s) ret = KMask.shift;
    if (c && !a && s) ret = KMask.ctrlshift;
    if (c && a && !s) ret = KMask.ctrlalt;
    if (c && a && s) ret = KMask.ctrlaltshift;
    if (!c && a && !s) ret = KMask.alt;
    return ret;
};

// Used everywhere!
function TrackType(metadb) {
    var taggable;
    var type;
	var trackpath = metadb.RawPath.substring(0, 4);
    switch (trackpath) {
        case "file":
        taggable = 1;
        type = 0;
        break;
        case "cdda":
        taggable = 1;
        type = 1;
        break;
        case "FOO_":
        taggable = 0;
        type = 2;
        break;
        case "fy+h":		
        case "http":
        taggable = 0;
        type = 3;
        break;
        case "mms:":
        taggable = 0;
        type = 3;
        break;
        case "unpa":
        taggable = 0;
        type = 4;
        break;
        default:
        taggable = 0;
        type = 5;
    };
    return type;
};
//}}

//=================================================// Buttons objects
button = function (normal, hover, down, name, tooltip_text) {
    this.img = Array(normal, hover, down, down);
    this.w = this.img[0].Width;
    this.h = this.img[0].Height;
    this.state = ButtonStates.normal;
    this.hide = false;
	this.active = true;
	this.cursor = IDC_ARROW;
	this.name = name;
	this.tooltip_text = tooltip_text ? tooltip_text : '';
	this.tooltip_activated = false;
    this.update = function (normal, hover, down) {
        this.img = Array(normal, hover, down, down);
        this.w = this.img[0].Width;
        this.h = this.img[0].Height;
    };
    this.draw = function (gr, x, y, alpha) {
        this.x = x;
        this.y = y;
		if(this.state==ButtonStates.hide) return false;
        this.img[this.state] && gr.DrawImage(this.img[this.state], this.x, this.y, this.w, this.h, 0, 0, this.w, this.h, 0, alpha);
    };
    this.repaint = function () {
        window.RepaintRect(this.x, this.y, this.w, this.h);
    };
    this.changeState = function (state) {
        var old_state = this.state;
        this.state = state;
		if(this.state==ButtonStates.hover && this.cursor != IDC_HAND) {
			g_cursor.setCursor(IDC_HAND,this.text);
			this.cursor = IDC_HAND;
		} else if(this.cursor != IDC_ARROW && this.state!=ButtonStates.hover && this.state!=ButtonStates.down){
			g_cursor.setCursor(IDC_ARROW,26);
			this.cursor = IDC_ARROW;
		}
        return old_state;
    };
    this.checkstate = function (event, x, y) {
        this.ishover = (x > this.x && x < this.x + this.w - 1 && y > this.y && y < this.y + this.h - 1);
        this.old = this.state;
        switch (event) {
         case "down":
            switch(this.state) {
             case ButtonStates.normal:
                this.state = ButtonStates.normal;
                break;
             case ButtonStates.hover:
                this.state = this.ishover ? ButtonStates.down : ButtonStates.normal;
				this.isdown = true;
                break;
            };
			if(this.tooltip_activated){
				this.tooltip_activated = false;
				g_tooltip.Deactivate();
			}
            break;
         case "up":
            this.state = this.ishover ? ButtonStates.hover : ButtonStates.normal;
			this.isdown = false;
            break;
         case "right":
             break;
         case "move":
            switch(this.state) {
             case ButtonStates.normal:
             case ButtonStates.hover:
                this.state = this.ishover ? ButtonStates.hover : ButtonStates.normal;
                break;
            };

			if(this.state == ButtonStates.hover && this.tooltip_text!='' && g_tooltip.activeZone != this.name){
				g_tooltip.ActivateDelay(this.tooltip_text, x+10, y+20, globalProperties.tooltip_button_delay, 1200, false, this.name);
				this.tooltip_activated = true;
			} else if(this.tooltip_activated && this.state!=ButtonStates.hover && g_tooltip.activeZone == this.name){
				this.tooltip_activated = false;
				g_tooltip.Deactivate();
			}
            break;
         case "leave":
            this.state = this.isdown ? ButtonStates.down : ButtonStates.normal;
			if(this.tooltip_activated){
				this.tooltip_activated = false;
				g_tooltip.Deactivate();
			}
            break;
         case "hover":
            break;
        };
		if(this.state==ButtonStates.hover && !this.ishover) this.state = ButtonStates.normal;
        if(this.state!=this.old) this.repaint();

		if(g_cursor.getActiveZone()!=this.name && (this.state==ButtonStates.hover || this.state==ButtonStates.down)) {
			g_cursor.setCursor(IDC_HAND,this.name);
			this.cursor = IDC_HAND;
		} else if((this.old==ButtonStates.hover || this.old==ButtonStates.down) && this.state!=ButtonStates.hover && this.state!=ButtonStates.down && this.cursor!=IDC_ARROW && g_cursor.getActiveZone()==this.name) {
			g_cursor.setCursor(IDC_ARROW,4);
			this.cursor = IDC_ARROW;
		}
		if(event=="hover") return this.ishover;
        return this.state;
    };
};

function DrawPolyStar(gr, x, y, out_radius, in_radius, points, line_thickness, line_color, fill_color, angle, opacity){
    if(!opacity && opacity != 0) opacity = 255;
    if(!angle && angle != 0) angle = 0;

    //---> Create points
    var point_arr = [];
    for (var i = 0; i != points; i++) {
        i % 2 ? r = Math.round((out_radius-line_thickness*4)/2) / in_radius : r = Math.round((out_radius-line_thickness*4)/2);
        var x_point = Math.floor(r * Math.cos(Math.PI * i / points * 2 - Math.PI / 2));
        var y_point = Math.ceil(r * Math.sin(Math.PI * i / points * 2 - Math.PI / 2));
        point_arr.push(x_point + out_radius/2);
        point_arr.push(y_point + out_radius/2);
    };

    //---> Crate poligon image
    var img = gdi.CreateImage(out_radius, out_radius);
    var _gr = img.GetGraphics();
    _gr.SetSmoothingMode(2);
    _gr.FillPolygon(fill_color, 1, point_arr);
    if(line_thickness > 0)
    _gr.DrawPolygon(line_color, line_thickness, point_arr);
    img.ReleaseGraphics(_gr);

    //---> Draw image
    gr.DrawImage(img, x, y, out_radius, out_radius, 0, 0, out_radius, out_radius, angle, opacity);
};

function zoom(value, factor) {
    return Math.ceil(value * factor / 100);
};
Number.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (minutes < 10 && hours>0) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    if (hours   == 0) {hours   = "";}
	else hours+=':'
    return hours+minutes+':'+seconds;
}
String.prototype.toHHMMSS = function () {
	if(this=='ON AIR') return this;
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (minutes < 10 && hours>0) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    if (hours   == 0) {hours   = "";}
	else hours+=':'
    return hours+minutes+':'+seconds;
}
String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}
String.prototype.repeat = function(num) {
    if(num>=0 && num<=5) {
        var g = Math.round(num);
    } else {
        return "";
    };
    return new Array(g+1).join(this);
};
var defaultDiacriticsRemovalap = [
	{'base':'A', 'letters':'\u0041\u24B6\uFF21\u00C0\u00C1\u00C2\u1EA6\u1EA4\u1EAA\u1EA8\u00C3\u0100\u0102\u1EB0\u1EAE\u1EB4\u1EB2\u0226\u01E0\u00C4\u01DE\u1EA2\u00C5\u01FA\u01CD\u0200\u0202\u1EA0\u1EAC\u1EB6\u1E00\u0104\u023A\u2C6F'},
	{'base':'AA','letters':'\uA732'},
	{'base':'AE','letters':'\u00C6\u01FC\u01E2'},
	{'base':'AO','letters':'\uA734'},
	{'base':'AU','letters':'\uA736'},
	{'base':'AV','letters':'\uA738\uA73A'},
	{'base':'AY','letters':'\uA73C'},
	{'base':'B', 'letters':'\u0042\u24B7\uFF22\u1E02\u1E04\u1E06\u0243\u0182\u0181'},
	{'base':'C', 'letters':'\u0043\u24B8\uFF23\u0106\u0108\u010A\u010C\u00C7\u1E08\u0187\u023B\uA73E'},
	{'base':'D', 'letters':'\u0044\u24B9\uFF24\u1E0A\u010E\u1E0C\u1E10\u1E12\u1E0E\u0110\u018B\u018A\u0189\uA779'},
	{'base':'DZ','letters':'\u01F1\u01C4'},
	{'base':'Dz','letters':'\u01F2\u01C5'},
	{'base':'E', 'letters':'\u0045\u24BA\uFF25\u00C8\u00C9\u00CA\u1EC0\u1EBE\u1EC4\u1EC2\u1EBC\u0112\u1E14\u1E16\u0114\u0116\u00CB\u1EBA\u011A\u0204\u0206\u1EB8\u1EC6\u0228\u1E1C\u0118\u1E18\u1E1A\u0190\u018E'},
	{'base':'F', 'letters':'\u0046\u24BB\uFF26\u1E1E\u0191\uA77B'},
	{'base':'G', 'letters':'\u0047\u24BC\uFF27\u01F4\u011C\u1E20\u011E\u0120\u01E6\u0122\u01E4\u0193\uA7A0\uA77D\uA77E'},
	{'base':'H', 'letters':'\u0048\u24BD\uFF28\u0124\u1E22\u1E26\u021E\u1E24\u1E28\u1E2A\u0126\u2C67\u2C75\uA78D'},
	{'base':'I', 'letters':'\u0049\u24BE\uFF29\u00CC\u00CD\u00CE\u0128\u012A\u012C\u0130\u00CF\u1E2E\u1EC8\u01CF\u0208\u020A\u1ECA\u012E\u1E2C\u0197'},
	{'base':'J', 'letters':'\u004A\u24BF\uFF2A\u0134\u0248'},
	{'base':'K', 'letters':'\u004B\u24C0\uFF2B\u1E30\u01E8\u1E32\u0136\u1E34\u0198\u2C69\uA740\uA742\uA744\uA7A2'},
	{'base':'L', 'letters':'\u004C\u24C1\uFF2C\u013F\u0139\u013D\u1E36\u1E38\u013B\u1E3C\u1E3A\u0141\u023D\u2C62\u2C60\uA748\uA746\uA780'},
	{'base':'LJ','letters':'\u01C7'},
	{'base':'Lj','letters':'\u01C8'},
	{'base':'M', 'letters':'\u004D\u24C2\uFF2D\u1E3E\u1E40\u1E42\u2C6E\u019C'},
	{'base':'N', 'letters':'\u004E\u24C3\uFF2E\u01F8\u0143\u00D1\u1E44\u0147\u1E46\u0145\u1E4A\u1E48\u0220\u019D\uA790\uA7A4'},
	{'base':'NJ','letters':'\u01CA'},
	{'base':'Nj','letters':'\u01CB'},
	{'base':'O', 'letters':'\u004F\u24C4\uFF2F\u00D2\u00D3\u00D4\u1ED2\u1ED0\u1ED6\u1ED4\u00D5\u1E4C\u022C\u1E4E\u014C\u1E50\u1E52\u014E\u022E\u0230\u00D6\u022A\u1ECE\u0150\u01D1\u020C\u020E\u01A0\u1EDC\u1EDA\u1EE0\u1EDE\u1EE2\u1ECC\u1ED8\u01EA\u01EC\u00D8\u01FE\u0186\u019F\uA74A\uA74C'},
	{'base':'OI','letters':'\u01A2'},
	{'base':'OO','letters':'\uA74E'},
	{'base':'OU','letters':'\u0222'},
	{'base':'OE','letters':'\u008C\u0152'},
	{'base':'oe','letters':'\u009C\u0153'},
	{'base':'P', 'letters':'\u0050\u24C5\uFF30\u1E54\u1E56\u01A4\u2C63\uA750\uA752\uA754'},
	{'base':'Q', 'letters':'\u0051\u24C6\uFF31\uA756\uA758\u024A'},
	{'base':'R', 'letters':'\u0052\u24C7\uFF32\u0154\u1E58\u0158\u0210\u0212\u1E5A\u1E5C\u0156\u1E5E\u024C\u2C64\uA75A\uA7A6\uA782'},
	{'base':'S', 'letters':'\u0053\u24C8\uFF33\u1E9E\u015A\u1E64\u015C\u1E60\u0160\u1E66\u1E62\u1E68\u0218\u015E\u2C7E\uA7A8\uA784'},
	{'base':'T', 'letters':'\u0054\u24C9\uFF34\u1E6A\u0164\u1E6C\u021A\u0162\u1E70\u1E6E\u0166\u01AC\u01AE\u023E\uA786'},
	{'base':'TZ','letters':'\uA728'},
	{'base':'U', 'letters':'\u0055\u24CA\uFF35\u00D9\u00DA\u00DB\u0168\u1E78\u016A\u1E7A\u016C\u00DC\u01DB\u01D7\u01D5\u01D9\u1EE6\u016E\u0170\u01D3\u0214\u0216\u01AF\u1EEA\u1EE8\u1EEE\u1EEC\u1EF0\u1EE4\u1E72\u0172\u1E76\u1E74\u0244'},
	{'base':'V', 'letters':'\u0056\u24CB\uFF36\u1E7C\u1E7E\u01B2\uA75E\u0245'},
	{'base':'VY','letters':'\uA760'},
	{'base':'W', 'letters':'\u0057\u24CC\uFF37\u1E80\u1E82\u0174\u1E86\u1E84\u1E88\u2C72'},
	{'base':'X', 'letters':'\u0058\u24CD\uFF38\u1E8A\u1E8C'},
	{'base':'Y', 'letters':'\u0059\u24CE\uFF39\u1EF2\u00DD\u0176\u1EF8\u0232\u1E8E\u0178\u1EF6\u1EF4\u01B3\u024E\u1EFE'},
	{'base':'Z', 'letters':'\u005A\u24CF\uFF3A\u0179\u1E90\u017B\u017D\u1E92\u1E94\u01B5\u0224\u2C7F\u2C6B\uA762'},
	{'base':'a', 'letters':'\u0061\u24D0\uFF41\u1E9A\u00E0\u00E1\u00E2\u1EA7\u1EA5\u1EAB\u1EA9\u00E3\u0101\u0103\u1EB1\u1EAF\u1EB5\u1EB3\u0227\u01E1\u00E4\u01DF\u1EA3\u00E5\u01FB\u01CE\u0201\u0203\u1EA1\u1EAD\u1EB7\u1E01\u0105\u2C65\u0250'},
	{'base':'aa','letters':'\uA733'},
	{'base':'ae','letters':'\u00E6\u01FD\u01E3'},
	{'base':'ao','letters':'\uA735'},
	{'base':'au','letters':'\uA737'},
	{'base':'av','letters':'\uA739\uA73B'},
	{'base':'ay','letters':'\uA73D'},
	{'base':'b', 'letters':'\u0062\u24D1\uFF42\u1E03\u1E05\u1E07\u0180\u0183\u0253'},
	{'base':'c', 'letters':'\u0063\u24D2\uFF43\u0107\u0109\u010B\u010D\u00E7\u1E09\u0188\u023C\uA73F\u2184'},
	{'base':'d', 'letters':'\u0064\u24D3\uFF44\u1E0B\u010F\u1E0D\u1E11\u1E13\u1E0F\u0111\u018C\u0256\u0257\uA77A'},
	{'base':'dz','letters':'\u01F3\u01C6'},
	{'base':'e', 'letters':'\u0065\u24D4\uFF45\u00E8\u00E9\u00EA\u1EC1\u1EBF\u1EC5\u1EC3\u1EBD\u0113\u1E15\u1E17\u0115\u0117\u00EB\u1EBB\u011B\u0205\u0207\u1EB9\u1EC7\u0229\u1E1D\u0119\u1E19\u1E1B\u0247\u025B\u01DD'},
	{'base':'f', 'letters':'\u0066\u24D5\uFF46\u1E1F\u0192\uA77C'},
	{'base':'g', 'letters':'\u0067\u24D6\uFF47\u01F5\u011D\u1E21\u011F\u0121\u01E7\u0123\u01E5\u0260\uA7A1\u1D79\uA77F'},
	{'base':'h', 'letters':'\u0068\u24D7\uFF48\u0125\u1E23\u1E27\u021F\u1E25\u1E29\u1E2B\u1E96\u0127\u2C68\u2C76\u0265'},
	{'base':'hv','letters':'\u0195'},
	{'base':'i', 'letters':'\u0069\u24D8\uFF49\u00EC\u00ED\u00EE\u0129\u012B\u012D\u00EF\u1E2F\u1EC9\u01D0\u0209\u020B\u1ECB\u012F\u1E2D\u0268\u0131'},
	{'base':'j', 'letters':'\u006A\u24D9\uFF4A\u0135\u01F0\u0249'},
	{'base':'k', 'letters':'\u006B\u24DA\uFF4B\u1E31\u01E9\u1E33\u0137\u1E35\u0199\u2C6A\uA741\uA743\uA745\uA7A3'},
	{'base':'l', 'letters':'\u006C\u24DB\uFF4C\u0140\u013A\u013E\u1E37\u1E39\u013C\u1E3D\u1E3B\u017F\u0142\u019A\u026B\u2C61\uA749\uA781\uA747'},
	{'base':'lj','letters':'\u01C9'},
	{'base':'m', 'letters':'\u006D\u24DC\uFF4D\u1E3F\u1E41\u1E43\u0271\u026F'},
	{'base':'n', 'letters':'\u006E\u24DD\uFF4E\u01F9\u0144\u00F1\u1E45\u0148\u1E47\u0146\u1E4B\u1E49\u019E\u0272\u0149\uA791\uA7A5'},
	{'base':'nj','letters':'\u01CC'},
	{'base':'o', 'letters':'\u006F\u24DE\uFF4F\u00F2\u00F3\u00F4\u1ED3\u1ED1\u1ED7\u1ED5\u00F5\u1E4D\u022D\u1E4F\u014D\u1E51\u1E53\u014F\u022F\u0231\u00F6\u022B\u1ECF\u0151\u01D2\u020D\u020F\u01A1\u1EDD\u1EDB\u1EE1\u1EDF\u1EE3\u1ECD\u1ED9\u01EB\u01ED\u00F8\u01FF\u0254\uA74B\uA74D\u0275'},
	{'base':'oi','letters':'\u01A3'},
	{'base':'ou','letters':'\u0223'},
	{'base':'oo','letters':'\uA74F'},
	{'base':'p','letters':'\u0070\u24DF\uFF50\u1E55\u1E57\u01A5\u1D7D\uA751\uA753\uA755'},
	{'base':'q','letters':'\u0071\u24E0\uFF51\u024B\uA757\uA759'},
	{'base':'r','letters':'\u0072\u24E1\uFF52\u0155\u1E59\u0159\u0211\u0213\u1E5B\u1E5D\u0157\u1E5F\u024D\u027D\uA75B\uA7A7\uA783'},
	{'base':'s','letters':'\u0073\u24E2\uFF53\u00DF\u015B\u1E65\u015D\u1E61\u0161\u1E67\u1E63\u1E69\u0219\u015F\u023F\uA7A9\uA785\u1E9B'},
	{'base':'t','letters':'\u0074\u24E3\uFF54\u1E6B\u1E97\u0165\u1E6D\u021B\u0163\u1E71\u1E6F\u0167\u01AD\u0288\u2C66\uA787'},
	{'base':'tz','letters':'\uA729'},
	{'base':'u','letters': '\u0075\u24E4\uFF55\u00F9\u00FA\u00FB\u0169\u1E79\u016B\u1E7B\u016D\u00FC\u01DC\u01D8\u01D6\u01DA\u1EE7\u016F\u0171\u01D4\u0215\u0217\u01B0\u1EEB\u1EE9\u1EEF\u1EED\u1EF1\u1EE5\u1E73\u0173\u1E77\u1E75\u0289'},
	{'base':'v','letters':'\u0076\u24E5\uFF56\u1E7D\u1E7F\u028B\uA75F\u028C'},
	{'base':'vy','letters':'\uA761'},
	{'base':'w','letters':'\u0077\u24E6\uFF57\u1E81\u1E83\u0175\u1E87\u1E85\u1E98\u1E89\u2C73'},
	{'base':'x','letters':'\u0078\u24E7\uFF58\u1E8B\u1E8D'},
	{'base':'y','letters':'\u0079\u24E8\uFF59\u1EF3\u00FD\u0177\u1EF9\u0233\u1E8F\u00FF\u1EF7\u1E99\u1EF5\u01B4\u024F\u1EFF'},
	{'base':'z','letters':'\u007A\u24E9\uFF5A\u017A\u1E91\u017C\u017E\u1E93\u1E95\u01B6\u0225\u0240\u2C6C\uA763'}
];

var diacriticsMap = {};
for (var i=0; i < defaultDiacriticsRemovalap.length; i++){
	var letters = defaultDiacriticsRemovalap[i].letters;
	for (var j=0; j < letters.length ; j++){
		diacriticsMap[letters[j]] = defaultDiacriticsRemovalap[i].base;
	}
}
String.prototype.removeAccents = function() {
	return this.replace(/[^\u0000-\u007E]/g, function(a){
	   return diacriticsMap[a] || a;
	});
}

var g_instancetype = window.InstanceType;

var g_hires_display = false;
var g_hires_checked = false;
var g_hires_mode = 0;
function InitHiResDisplay() {
    var hires_dpi = 96;
    if (!g_hires_checked) {
        g_hires_checked = true;
        g_hires_mode = 0;
        try {
            g_hires_mode = parseInt(window.GetProperty("全局·高分屏适配模式", 0));
            window.SetProperty("全局·高分屏适配模式", (isNaN(g_hires_mode)?0:g_hires_mode));
        } catch(e) { g_hires_mode = 0; }
        if (isNaN(g_hires_mode)) g_hires_mode = 0;
        if (g_hires_mode == 1) {
            g_hires_display = true;
        } else if (g_hires_mode == 2) {
            g_hires_display = false;
        } else {
            try { hires_dpi = Number(window.DPI); } catch(e) { hires_dpi = 96; }
            if (!hires_dpi || isNaN(hires_dpi) || hires_dpi <= 0) hires_dpi = 96;
            g_hires_display = (hires_dpi >= 144);
        }
        g_hires_dpi = hires_dpi;
    }
    if (!g_hires_display) return;
    try {
        if (typeof compact_titlebar !== "undefined" && compact_titlebar && compact_titlebar.value != 2) {
            compact_titlebar.value = 2;
        }
    } catch(e) {}
    try {
        if (typeof mini_controlbar !== "undefined" && mini_controlbar && mini_controlbar.value != 0) {
            mini_controlbar.value = 0;
        }
    } catch(e) {}
}
var g_hires_dpi = 96;
InitHiResDisplay();

var g_font = {};
var g_font_cache = {};

/* Lazy font cache: previously get_font() created all 46 gdi.Font objects in
   every panel at startup, although each panel only uses a handful of them.
   Each slot is now a getter that builds the font on first access and caches
   it until get_font() runs again (font size / zoom changed). */
var g_font_specs = [];
(function () {
    function add(name, family, offset, style) {
        g_font_specs.push({ name: name, family: family, offset: offset, style: style });
    }
    add('normal', 'normal', 0, 'normal');
    add('min1', 'normal', -1, 'normal');
    add('min2', 'normal', -2, 'normal');
    for (var i = 1; i <= 7; i++) add('plus' + i, 'normal', i, 'normal');
    add('plus10', 'normal', 10, 'normal');
    add('bold', 'semibold', 0, 'bold');
    add('boldplus1', 'semibold', 1, 'bold');
})();

function g_font_family(kind) {
    if (kind === 'semibold') return g_fname_semibold;
    return g_fname;
}
function g_font_style(kind) {
    if (kind === 'bold') return g_fstyle_bold;
    return g_fstyle;
}
function g_font_build(spec) {
    if (!g_fname || typeof g_fsize !== 'number' || isNaN(g_fsize)) return null;
    return gdi.Font(g_font_family(spec.family), g_fsize + spec.offset, g_font_style(spec.style));
}
(function () {
    for (var i = 0; i < g_font_specs.length; i++) {
        (function (spec) {
            Object.defineProperty(g_font, spec.name, {
                enumerable: true,
                configurable: true,
                get: function () {
                    if (!Object.prototype.hasOwnProperty.call(g_font_cache, spec.name)) {
                        g_font_cache[spec.name] = g_font_build(spec);
                    }
                    return g_font_cache[spec.name];
                }
            });
        })(g_font_specs[i]);
    }
})();
function get_font() {
    var font_error = false;
    var default_font = null;

	if (g_instancetype == 0) {
		default_font = window.GetFontCUI(FontTypeCUI.items);
		g_font_headers = window.GetFontCUI(FontTypeCUI.labels);
	} else if (g_instancetype == 1) {
		default_font = window.GetFontDUI(FontTypeDUI.playlists);
		g_font_headers = window.GetFontDUI(FontTypeDUI.tabs);
	};
    // tweaks to fix a problem with WSH Panel Mod on Font object Name property
    try {
		g_fname = "Microsoft YaHei UI";
		g_fname_light = "Microsoft YaHei UI Light";
		g_fname_semibold = "Microsoft YaHei UI Bold";
		g_fsize = default_font.Size;
		g_fstyle = 0;
		g_fstyle_light = 0;
		g_fstyle_bold = 1;
    } catch(e) {
        console.log("SMP Panel Error: Unable to use the default font. Using Arial font instead. "+e);
        g_fname = "arial";
        g_fname_light = "arial";
        g_fname_semibold = "arial";
        g_fsize = 14;
        g_fstyle = 0;
        g_fstyle_light = 0;
        g_fstyle_bold = 0;
        font_error = true;
    };
    // adjust font size if extra zoom activated
	globalProperties.fontAdjustement = Math.min(globalProperties.fontAdjustement_max,Math.max(globalProperties.fontAdjustement_min,globalProperties.fontAdjustement));
    g_fsize += globalProperties.fontAdjustement+properties.panelFontAdjustement;
	g_font_cache = {};
	if(properties.darklayout) {
		g_font_light = gdi.Font(g_fname_light, g_fsize, g_fstyle_light);
		g_font_lightmin1 = gdi.Font(g_fname_light, g_fsize-1, g_fstyle_light);
	} else {
		g_font_light = g_font.normal;
		g_font_lightmin1 = gdi.Font(g_fname, g_fsize-1, g_fstyle_light);		
    }
};

// ========================================= IMAGES =========================================
function FormatCover(image, w, h, rawBitmap, callID, keepratio, resize_qlty) {
	var keepratio = typeof keepratio !== 'undefined' ? keepratio : false;		
	var resize_qlty = typeof resize_qlty !== 'undefined' ? resize_qlty : globalProperties.ResizeQLY;		
	if(!image || w<=0 || h<=0) return image;
	if(rawBitmap) {
		return image.Resize(w, h, resize_qlty).CreateRawBitmap();
	} else if(!keepratio){
		return image.Resize(w, h, resize_qlty);
	} else {	
		if(image.Height>=image.Width) {
			var ratio = image.Width / image.Height;
			var pw = w * ratio;
			var ph = h;
		} else {
			var ratio = image.Height / image.Width;
			var pw = w;
			var ph = h * ratio;
		};		
		return image.Resize(pw, ph, resize_qlty);
	}
};
function isImage(variable){
	return (typeof variable == 'object' && variable!=null)
}
function isValidHandle(variable){
	try{
		return (typeof variable.RawPath=='string');
	} catch(e){
		return false;
	}
}
function eoleCleanArtistName(s, max) {
	var t = String(s == null ? '' : s)
		.replace(/[\\\/:*?"<>|]/g, ' ')
		.replace(/[\x00-\x1F]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim()
		.replace(/[. ]+$/, '');
	max = max || 40;
	if (t.length > max) t = t.slice(0, max).replace(/[. ]+$/, '');
	if (/^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i.test(t)) t = '_' + t;
	return t;
}
function process_cachekey(metadb, titleformat, str){
	var titleformat = typeof titleformat !== 'undefined' ? titleformat : globalProperties.tf_crc;
	try{
		var str = typeof str !== 'undefined' ? str : titleformat.EvalWithMetadb(metadb);
	} catch(e){var str = "";}

    var str_return = "";
    str = str.toLowerCase();
    var len = str.length;
    for(var i  = 0;i < len; i++){
        var charcode = str.charCodeAt(i);
        if(charcode > 96 && charcode < 123)
            str_return += str.charAt(i);
        else if(charcode > 47 && charcode < 58)
            str_return += str.charAt(i);
    };
    return str;
};
function check_cache(metadb, albumIndex, crc){
	var crc = typeof crc !== 'undefined' ? crc : brw.groups[albumIndex].cachekey;
	var filename = cover_img_cache+"\\"+crc+"."+globalProperties.ImageCacheExt;
	if(crc=="undefined") return false;
    if(g_files.FileExists(filename)) {
        return filename;
    };
    return false;
};
function delete_file_cache(metadb, albumIndex, crc, delete_at_startup){
	var crc = typeof crc !== 'undefined' ? crc : brw.groups[albumIndex].cachekey;
	var filename = cover_img_cache+"\\"+crc+"."+globalProperties.ImageCacheExt;
    if(g_files.FileExists(filename)) {
		try {
			g_files.DeleteFile(filename);
		} catch(e) {
			already_asked_to_delete = false;
			crc_array = properties.deleteSpecificImageCache.split("|");
			for(var i = 0; i < crc_array.length; i++) {
				if(crc==crc_array[i]) already_asked_to_delete = true;
			}
			if(!already_asked_to_delete){
				if(properties.deleteSpecificImageCache!="")	properties.deleteSpecificImageCache=properties.deleteSpecificImageCache+"|";
				properties.deleteSpecificImageCache = properties.deleteSpecificImageCache + crc;
				window.SetProperty("封面·待删除缓存的键(下次启动)", properties.deleteSpecificImageCache);
			}
			if(delete_at_startup && delete_at_startup==true)
				HtmlMsg("无法删除此文件", "无法删除该缓存封面。\n请关闭 foobar 后手动删除以下文件：\n\n"+cover_img_cache + "\\" + crc, "确定");
			else
				HtmlMsg("无法删除此文件", "该缓存封面当前无法从 foobar 刷新（文件被占用），foobar 会在下次启动时尝试刷新", "确定");
		};
        return true;
    };
    return false;
};

function delete_full_cache(){
	if(globalProperties.deleteDiskCache) {
		g_files.DeleteFolder(cover_img_cache,true);
		timer_create_folder = setTimeout(function(){
			if(!g_files.FolderExists(cover_img_cache))
			g_files.CreateFolder(cover_img_cache);
			clearTimeout(timer_create_folder);
			timer_create_folder = false;
		},150);
		globalProperties.deleteDiskCache=false;
		window.SetProperty("封面·下次启动时删除缓存", false);
	} else {
		function delete_confirmation(status, confirmed) {
			if(confirmed){
				window.SetProperty("封面·下次启动时删除缓存", true);
				fb.Exit();
			}
		}
		var QuestionString = "确定要完全重置图像缓存吗？\n确认后，图像缓存将在下次启动时重新建立。foobar 将退出，请手动重新启动。";
		HtmlDialog("请确认", QuestionString, '是', '否', delete_confirmation);
	}
}
function load_image_from_cache(filename){
	try{
        var tdi = gdi.LoadImageAsync(window.ID, filename);
        return tdi;
	} catch(e){
		return -1;
	}
};
function load_image_from_cache_direct(filename){
	try{
        var img = gdi.Image(filename);
        return img;
	} catch(e){
		return -1;
	}
};
function get_albumArt(metadb,cachekey){
	var cachekey = typeof cachekey !== 'undefined' ? cachekey : process_cachekey(metadb);
	try{var artwork_img = g_image_cache.cachelist[cachekey];}catch(e){}
	if ((typeof(artwork_img) == "undefined" || artwork_img == null) && globalProperties.enableDiskCache) {
		var cache_filename = check_cache(metadb, 0, cachekey);
		// load img from cache
		if(cache_filename) {
			artwork_img = load_image_from_cache_direct(cache_filename);
		} else {
			artwork_img = utils.GetAlbumArtV2(metadb, AlbumArtId.front);
			if(!isImage(artwork_img)) {
				artwork_img = get_fallbackCover(metadb);
			}
		}
	}
	return artwork_img;
}
function get_fallbackCover(metadb, tracktype){
	var tracktype = typeof tracktype !== 'undefined' ? tracktype : TrackType(metadb);
	if(tracktype < 2) {
		return globalProperties.nocover_img;
	} else {
		return globalProperties.stream_img;
	}
}
const get_albumArt_async = async(metadb, albumIndex, cachekey, need_stub, only_embed, no_load, addArgs) =>
{
	need_stub = true;
	only_embed = false;
	no_load = false;
    if (!metadb || g_image_cache.loadCounter>2 || window.TotalMemoryUsage>window.MemoryLimit*0.8) {
		if(g_image_cache.loadCounter>2 && !timers.loadCounterReset){
			timers.loadCounterReset = setTimeout(function() {
				if(g_image_cache.loadCounter!=0){
					g_image_cache.loadCounter = 0;
					window.Repaint();
				}
				clearTimeout(timers.loadCounterReset);
				timers.loadCounterReset = false;
			}, 3000);
		}
		freeCacheMemory();
        return;
    }
	g_image_cache.loadCounter++;			
    let result = await utils.GetAlbumArtAsyncV2(0, metadb, AlbumArtId.front, need_stub, only_embed, no_load);
	try {
		if(isImage(result.image)) {
			if(properties.disableCoverCache !== true) save_image_to_cache(result.image, albumIndex, cachekey, metadb);
			if (typeof g_cover == "object") {
				if(addArgs && addArgs.isplaying) g_cover.setArtwork(result.image,true,false,addArgs.isplaying,metadb,cachekey);
				else g_cover.setArtwork(result.image,true,false,false,metadb,cachekey);
				window.Repaint();
			}
		} else if (typeof brw == "object" && albumIndex>=0) {
			if(typeof brw.groups[albumIndex] == "undefined" || (brw.groups[albumIndex].cachekey!= cachekey && brw.groups[albumIndex].cachekey_album!= cachekey)){
				var img = get_fallbackCover(metadb,undefined);
				g_image_cache.addToCache(img,cachekey);
			} else {
				brw.groups[albumIndex].cover_img = get_fallbackCover(metadb,(brw.groups[albumIndex].tracktype<0?undefined:brw.groups[albumIndex].tracktype));
				brw.groups[albumIndex].is_fallback = true;
				if(properties.panelName=="WSHgraphicbrowser") brw.groups[albumIndex].cover_img_full = brw.groups[albumIndex].cover_img;
				brw.groups[albumIndex].load_requested = 2;
				brw.repaint();
			}
		} else if (typeof g_cover == "object") {
			img = get_fallbackCover(metadb,undefined);
			g_cover.setArtwork(img,true,false,addArgs.isplaying,metadb,cachekey);
			window.Repaint();
		}
	} catch(e){
	}
	g_image_cache.loadCounter--;
};

function save_image_to_cache(image, albumIndex, cachekey, metadb){
	cachekey = typeof cachekey !== 'undefined' ? cachekey : false;
	if(!cachekey && typeof(brw) !== "undefined") var crc = brw.groups[albumIndex].cachekey;
	else var crc = cachekey;
	var save2cache = true;
	if(cachekey == "undefined") {
		var save2cache = false;
		cachekey = metadb.RawPath;
	}
	var filename = cover_img_cache+"\\"+crc+"."+globalProperties.ImageCacheExt;
    if(freeCacheMemory()) return;
	try {
		if(image.Width>globalProperties.coverCacheWidthMax || image.Height>globalProperties.coverCacheWidthMax) {
			image = FormatCover(image, globalProperties.coverCacheWidthMax, globalProperties.coverCacheWidthMax, false, "save_image_to_cache", true, 3);
		}		
		if(!g_files.FileExists(filename) && save2cache){
			image.SaveAs(cover_img_cache+"\\"+crc+"."+globalProperties.ImageCacheExt, globalProperties.ImageCacheFileType);
		}
		if (typeof brw == "object" && albumIndex>=0) {
			brw.groups[albumIndex].cover_img = image;			
			brw.groups[albumIndex].load_requested = 2;
			brw.groups[albumIndex].mask_applied = false;
			brw.groups[albumIndex].cover_formated = false;
			g_image_cache.addToCache(image,cachekey);
			brw.repaint();
		}
	} catch(e){}
	if (typeof brw == "object") brw.repaint();
}
function createDragText(line1, line2, cover_size){
	var drag_img = gdi.CreateImage(cover_size, cover_size);

    var gb = drag_img.GetGraphics();
	gb.SetTextRenderingHint(2);
	gb.SetSmoothingMode(1);
	var text1_width = gb.CalcTextWidth(line1, g_font.boldplus1);
	var text2_width = gb.CalcTextWidth(line2, g_font.min1);
	var rectangle_width = Math.min(Math.max(text1_width,text2_width),cover_size-40);

	var sep_width = Math.min(text1_width,text2_width)+10;
	gb.FillSolidRect(Math.round((cover_size-rectangle_width-40)/2),cover_size-75,rectangle_width+40,30,colors.dragimage_bg);
	gb.FillSolidRect(Math.round((cover_size-rectangle_width-40)/2),cover_size-45,rectangle_width+40,30,colors.dragimage_bg);

	gb.FillGradRect(Math.round((cover_size-rectangle_width-40)/2)+Math.round((rectangle_width+40-sep_width)/2),cover_size-45,sep_width, 1, 0, colors.dragimage_gradline1, colors.dragimage_gradline2, 0.5);
	gb.DrawRect(Math.round((cover_size-rectangle_width-40)/2),cover_size-75,rectangle_width+39,59,1,colors.dragimage_border);

	gb.GdiDrawText(line1, g_font.boldplus1,  colors.dragimage_text, 10, cover_size-75, cover_size-20, 30, DT_CENTER | DT_CALCRECT | DT_VCENTER | DT_END_ELLIPSIS | DT_NOPREFIX);
	gb.GdiDrawText(line2, g_font.min1,  colors.dragimage_text, 10, cover_size-45, cover_size-20, 30, DT_CENTER | DT_CALCRECT | DT_VCENTER | DT_END_ELLIPSIS | DT_NOPREFIX);
	drag_img.ReleaseGraphics(gb);

	return drag_img;
};
function createDragImg(img, cover_size, count){
	var drag_zone_size = 220;
	var drag_img = gdi.CreateImage(drag_zone_size, drag_zone_size);
	var left_padding = top_padding = Math.round((drag_zone_size - cover_size)/2);
	var top_padding = drag_zone_size - cover_size-15;
	var text_height = 25;
    var gb = drag_img.GetGraphics();
	gb.SetTextRenderingHint(2);
	gb.SetSmoothingMode(0);
	if(isImage(img)) gb.DrawImage(img, left_padding, top_padding, cover_size, cover_size, 0, 0, img.Width, img.Height);
    gb.FillSolidRect(left_padding, top_padding, cover_size, cover_size, colors.dragcover_overlay);
	gb.FillSolidRect(left_padding,top_padding+cover_size-text_height,cover_size,text_height,colors.dragimage_bg);
	gb.DrawRect(left_padding, top_padding, cover_size-1, cover_size-1, 1.0,colors.dragimage_border);
	gb.GdiDrawText(count+" tracks", g_font.min1,  colors.dragimage_text, left_padding, top_padding+cover_size-text_height, cover_size, text_height, DT_CENTER | DT_CALCRECT | DT_VCENTER | DT_END_ELLIPSIS | DT_NOPREFIX);
	drag_img.ReleaseGraphics(gb);

	return drag_img;
};
function freeCacheMemory(force){
	force = typeof force !== 'undefined' ? force : false;	
	if(window.TotalMemoryUsage>window.MemoryLimit*0.8 || force) {
		g_image_cache.resetCache();
		if(typeof brw !== 'undefined') brw.freeMemory();
		window.NotifyOthers("resetCache",true);
		return true;
	}
	return false;
}
oImageCache = function () {
    this.cachelist = Array();
	this.loadCounter = 0;
	this.coverCacheWidthMax = -1;
    this.addToCache = function (image, cachekey, resize_width, resize_height) {
		if(!globalProperties.loaded_covers2memory || freeCacheMemory()) return;
		var resize_height = typeof resize_height !== 'undefined' ? resize_height : resize_width;
		if(cachekey!="undefined") {
			if(this.coverCacheWidthMax>0) this.cachelist[cachekey] = FormatCover(image, this.coverCacheWidthMax, this.coverCacheWidthMax, false, "addToCache", globalProperties.keepProportion);
			else this.cachelist[cachekey] = image;
		}
	}
	this.setMaxWidth = function(maxWidth){		
		this.coverCacheWidthMax = maxWidth;
	}
    this.resetCache = function () {
		this.cachelist = Array();
	}
	this.load_image_from_cache_async = async(albumIndex, cachekey, filename, save, metadb) =>
	{
		var save = typeof save !== 'undefined' ? save : false;		
		if(brw.groups[albumIndex].load_requested == 0){
			brw.groups[albumIndex].load_requested = 1;
			try {
				if(properties.load_image_from_cache_direct) {
					var img = await gdi.LoadImageAsyncV2(window.ID, filename);
					this.addToCache(img,cachekey);
					brw.groups[albumIndex].load_requested = 2;
					brw.groups[albumIndex].cover_type = 1;
					brw.groups[albumIndex].cover_img = img;
					brw.groups[albumIndex].cover_img_mask = false;
					brw.groups[albumIndex].cover_formated = false;
					brw.repaint();
					if(save){
						save_image_to_cache(img, albumIndex, cachekey, metadb);
					}
				} else {
					brw.groups[albumIndex].tid = load_image_from_cache(filename);
					brw.groups[albumIndex].load_requested = 1;
				}
			} catch(e) {
				brw.groups[albumIndex].load_requested = 0;
			};
			brw.repaint();
		}
	};
    this.hit = function (metadb, albumIndex, direct_return, cachekey, artist_name, async_ok) {
		var cachekey = typeof cachekey !== 'undefined' ? cachekey : brw.groups[albumIndex].cachekey;
		var artist_name = typeof artist_name !== 'undefined' ? artist_name : '';
		var img = this.cachelist[cachekey];
        if (typeof img == "undefined" || img==null) { // if image not in cache, we load it asynchronously
			if(globalProperties.enableDiskCache && albumIndex>-1) brw.groups[albumIndex].cover_filename = check_cache(metadb, albumIndex, cachekey);
			if(brw.groups[albumIndex].cover_filename && brw.groups[albumIndex].load_requested == 0) {
					//Dont save as its already in the cache
					brw.groups[albumIndex].save_requested=true;
					// load img from cache
					if(!isScrolling && !async_ok){
						img = load_image_from_cache_direct(brw.groups[albumIndex].cover_filename);
						this.addToCache(img,cachekey);
						brw.groups[albumIndex].cover_type = 1;
						brw.groups[albumIndex].cover_img = img;
						brw.groups[albumIndex].cover_img_mask = false;
						brw.groups[albumIndex].cover_formated = false;
						brw.groups[albumIndex].load_requested = 2;
						brw.repaint();
					} else if(!direct_return || async_ok){
						this.load_image_from_cache_async(albumIndex, cachekey, brw.groups[albumIndex].cover_filename);
						return "loading";
					} else {
						img = load_image_from_cache_direct(brw.groups[albumIndex].cover_filename)
						if(img) {
							this.addToCache(img,cachekey);
						} else this.addToCache(globalProperties.nocover_img,cachekey);
						brw.groups[albumIndex].load_requested = 2;
					}
			} else {
				if(artist_name!=''){
					var artist_name_raw = artist_name;
					var artist_name = artist_name.sanitise();
					var filepath = '';
					var lx_dir = globalProperties.lx_artist_cache_dir || '';
					if (lx_dir) {
						var lx_file = lx_dir + "\\" + eoleCleanArtistName(artist_name_raw, 40) + ".jpg";
						if (g_files.FileExists(lx_file)) filepath = lx_file;
					}
					if (!filepath) {
						var path = ProfilePath+"\yttm\\biography-cache\\art_img\\"+artist_name.toLowerCase().charAt(0)+"\\"+artist_name;
						var all_files = utils.Glob(path + "\\*");
						for (var j = 0; j < all_files.length; j++) {
							if ((/(?:jpe?g|gif|png|bmp)$/i).test(g_files.GetExtensionName(all_files[j]))) {
								filepath = all_files[j];
								break;
							}
						}
					}
					if(g_files.FileExists(filepath)) {
						this.load_image_from_cache_async(albumIndex, cachekey, filepath, true, metadb);
						return "loading";						
					} else if(properties.AlbumArtFallback){
						brw.groups[albumIndex].cover_img = g_image_cache.hit(metadb, albumIndex, false, brw.groups[albumIndex].cachekey_album);
						if(brw.groups[albumIndex].cover_img=='loading') {
							brw.groups[albumIndex].load_requested = 2;
							brw.groups[albumIndex].cover_type = 1;						
							brw.groups[albumIndex].cover_img_mask = false;
							brw.groups[albumIndex].cover_formated = false;
							return 'loading';
						}
					}
				} else if(!direct_return){
					try{
						get_albumArt_async(metadb,(albumIndex<0)?-1:albumIndex, cachekey);
						return 'loading';
					} catch (e) {
					}
				} else {
					img = utils.GetAlbumArtV2(metadb, 0, false);
					if(img) {
						if(!timers.saveCover && globalProperties.enableDiskCache) {
							save_image_to_cache(img, 0,cachekey, metadb);
							timers.saveCover = setTimeout(function() {
								clearTimeout(timers.saveCover);
								timers.saveCover = false;
							}, 100);
						};
					} else this.addToCache(globalProperties.nocover_img,cachekey); //this.cachelist[cachekey] = globalProperties.nocover_img
				}
			}
        };
        return img;
    };
    this.reset = function(key) {
        this.cachelist[key] = null;
    };
    this.resetMetadb = function(metadb) {
        this.cachelist[process_cachekey(metadb)] = null;
    };
	this.resetAll = function(){
		this.cachelist = Array();
	};
    this.getit = function (metadb, albumId, image, cw) {
		var cw = typeof cw !== 'undefined' ? cw : globalProperties.thumbnailWidthMax;
        var ch = cw;
        var img = null;
        var cover_type = null;

        if(!isImage(image)) {
            if(brw.groups[albumId].tracktype != 3) {
                cover_type = 0;
            } else {
                cover_type = 3;
            };
        } else {
            if(cover.keepaspectratio) {
                if(image.Height>=image.Width) {
                    var ratio = image.Width / image.Height;
                    var pw = cw * ratio;
                    var ph = ch;
                } else {
                    var ratio = image.Height / image.Width;
                    var pw = cw;
                    var ph = ch * ratio;
                };
            } else {
                var pw = cw;
                var ph = ch;
            };
            // cover.type : 0 = nocover, 1 = external cover, 2 = embedded cover, 3 = stream
            if(brw.groups[albumId].tracktype != 3) {
                if(metadb) {
                    img = FormatCover(image, pw, ph, false);
                    cover_type = 1;
                };
            } else {
                cover_type = 3;
            };

        };

        brw.groups[albumId].cover_type = cover_type;
        return img;
    };
};

function openCoverFullscreen(metadb, displayedImage){
	var img = null;
	if(isValidHandle(metadb)) {
		try { img = utils.GetAlbumArtV2(metadb, 0, false); } catch(e) {}
	}
	// The panel may show cached/downloaded art that is absent from the track.
	if(!isImage(img)) img = displayedImage;
	if(!isImage(img) || typeof img.SaveAs !== 'function') return false;
	try {
		if(!g_files.FolderExists(cover_img_cache)) g_files.CreateFolder(cover_img_cache);
		var filepath = cover_img_cache+"\\original_size."+globalProperties.ImageCacheExt;
		if(!img.SaveAs(filepath, globalProperties.ImageCacheFileType)) return false;
		var WshShell = new ActiveXObject("WScript.Shell");
		WshShell.Run("\"" + filepath + "\"");
		return true;
	} catch(e) {
		console.log("Eole: could not open cover image: " + e);
		return false;
	}
}
// Debugger functions

var FW_PROP_ENABLED = "显示·全屏壁纸";
var FW_PROP_SOURCE  = "显示·全屏壁纸来源(0=封面 1=指定图片 2=优先图片)";
var FW_PROP_IMAGE   = "显示·全屏壁纸图片路径";
var FW_PROP_BLUR    = "显示·全屏壁纸模糊强度(0-90)";
var FW_PROP_BLUR_LT = "显示·全屏壁纸模糊强度·浅色(0-90)";
var FW_PROP_MASK    = "显示·全屏壁纸蒙版浓度(0-255)";
var FW_PROP_MASK_LT = "显示·全屏壁纸蒙版浓度·浅色(0-255)";
var FW_PROP_QUALITY = "显示·全屏壁纸质量(1=已缩放 2=1.5x 3=2x)";
var FW_PROP_LXB     = "Lxbox·全屏透明";

/* 全屏壁纸的深 / 浅：第一个是显式覆盖（-1 跟随 / 0 浅 / 1 深），
   第二项是写入覆盖那一刻 fb2k 背景的深浅，用来判断"之后用户在 fb2k 里是不是
   换过界面主题"——一旦对不上，覆盖自动作废，壁纸回到跟随 fb2k 的老行为。 */
var FW_PROP_DARK     = "显示·全屏壁纸深色(-1=跟随 0=浅 1=深)";
var FW_PROP_DARK_REF = "显示·全屏壁纸深色·fb2k基准";

var g_fw_lastHasRealImg = null;
var g_fw_lastSrcCover = false;

var FW_ID_ON          = 7100;
var FW_ID_OFF         = 7101;
var FW_ID_SRC0        = 7102;
var FW_ID_SRC1        = 7103;
var FW_ID_SRC2        = 7104;
var FW_ID_PICK        = 7105;
var FW_ID_CLEAR       = 7106;
var FW_ID_BLUR_INC    = 7110;
var FW_ID_BLUR_DEC    = 7111;
var FW_ID_BLUR_0      = 7112;
var FW_ID_BLUR_30     = 7113;
var FW_ID_BLUR_60     = 7114;
var FW_ID_BLUR_90     = 7115;
var FW_ID_MASK_INC    = 7120;
var FW_ID_MASK_DEC    = 7121;
var FW_ID_MASK_0      = 7122;
var FW_ID_MASK_120    = 7123;
var FW_ID_MASK_180    = 7124;
var FW_ID_MASK_230    = 7125;
var FW_ID_Q1          = 7130;
var FW_ID_Q2          = 7131;
var FW_ID_Q3          = 7132;
var FW_ID_REFRESH     = 7133;

var g_fwDarkV = null, g_fwDarkAt = 0;

function fw_isDark(force) {
    var now = (new Date()).getTime();
    if (!force && g_fwDarkV !== null && (now - g_fwDarkAt) < 250) return g_fwDarkV;
    var v = false;
    try { v = fw_themeDark(); } catch (e) { v = false; }
    g_fwDarkV = v;
    g_fwDarkAt = now;
    return v;
}

/* 壁纸当前应当用深色还是浅色。
   显式覆盖有效就用覆盖，否则完全沿用原来的 fw_isDarkRaw()——也就是说
   "全屏壁纸跟随 foobar2000 深浅自动切换"这条老能力一行没动。 */
function fw_themeDark() {
    var v = -1;
    try { v = Number(window.GetProperty(FW_PROP_DARK, -1)); } catch (e) { v = -1; }
    if (v !== 0 && v !== 1) return fw_isDarkRaw();
    if (fw_themeStale()) return fw_isDarkRaw();
    return v === 1;
}

/* 覆盖是不是已经过期：写入覆盖时 fb2k 是深（浅），现在反过来了，
   说明用户在这期间换过 fb2k 的界面深浅主题，覆盖该让位。 */
function fw_themeStale() {
    var ref = -1;
    try { ref = Number(window.GetProperty(FW_PROP_DARK_REF, -1)); } catch (e) { return false; }
    if (ref !== 0 && ref !== 1) return false;
    var cur = 0;
    try { cur = fw_bgIsDark() ? 1 : 0; } catch (e2) { return false; }
    return cur !== ref;
}

function fw_setThemeDark(dark) {
    dark = !!dark;
    try { window.SetProperty(FW_PROP_DARK, dark ? 1 : 0); } catch (e) {}
    try { window.SetProperty(FW_PROP_DARK_REF, fw_bgIsDark() ? 1 : 0); } catch (e1) {}
    g_fwDarkV = dark;
    g_fwDarkAt = (new Date()).getTime();
    return dark;
}

function fw_clearThemeDark() {
    try { window.SetProperty(FW_PROP_DARK, -1); } catch (e) {}
    try { window.SetProperty(FW_PROP_DARK_REF, -1); } catch (e1) {}
    g_fwDarkV = null;
    g_fwDarkAt = 0;
    return false;
}

function fw_isDarkRaw() {
    try {
        if (window.GetProperty("显示·深色布局", false)) return true;
        if (window.GetProperty("显示·固定深色布局", false)) return true;
        if (window.GetProperty("显示·强制深色布局", false)) return true;
    } catch (e0) {}
    try {
        if (window.GetProperty("媒体库·深色主题", false)) return true;
        if (window.GetProperty("播放列表·深色主题", false)) return true;
        if (window.GetProperty("艺术家简介·深色主题", false)) return true;
        if (window.GetProperty("可视化·深色主题", false)) return true;
        if (window.GetProperty("迷你模式·深色主题", false)) return true;
    } catch (e01) {}
    try {
        if (window.GetProperty("显示·深色布局跟随CUI", false)) {
            return fw_bgIsDark();
        }
    } catch (e1) {}
    return fw_bgIsDark();
}

function fw_bgIsDark() {
    var c = 0;
    try {
        c = (window.InstanceType === 1) ? window.GetColourDUI(1) : window.GetColourCUI(3);
    } catch (e) { return false; }
    try { c = Number(c) & 0xffffff; } catch (e2) { return false; }
    if (!c) return false;
    var r = (c >> 16) & 0xff, g = (c >> 8) & 0xff, b = c & 0xff;
    var lum = 0.299 * r + 0.587 * g + 0.114 * b;
    return lum < 0x80;
}

function fw_enabled() {
    try { return !!window.GetProperty(FW_PROP_ENABLED, false); } catch (e) { return false; }
}

var FW_SHARED_KEY = 'FULLSCREENWALLPAPER';

function fw_sharedRoot() {
    return fb.ProfilePath + 'wsh-data\\eole-settings\\';
}

function fw_sharedSet(on) {
    var root = fw_sharedRoot();
    var target = root + FW_SHARED_KEY + '_' + (on ? '1' : '0');
    try {
        var files = utils.Glob(root + FW_SHARED_KEY + '_*');
        if (files) {
            for (var i = 0; i < files.length; ++i) {
                if (String(files[i]) === target) continue;
                try { g_files.DeleteFile(files[i]); } catch (e1) {}
            }
        }
        if (utils.FileTest(target, 'e')) return true;
        var ts = g_files.CreateTextFile(target);
        if (ts) {
            try { ts.Write('1'); } catch (e2) {}
            try { ts.Close(); } catch (e3) {}
        }
        return true;
    } catch (e) {
        try { console.log('[FW] 写共享开关失败: ' + e); } catch (x) {}
        return false;
    }
}

/* 广播里带来的开关值。绘制路径优先用它 —— 文件那边有 500ms 缓存，
   光靠它的话，收到 fullscreenWallpaper 后还得等缓存过期再重绘一次才生效。 */
var g_fw_live = null;
var g_fw_sharedRaw = null, g_fw_sharedRawAt = 0;
function fw_sharedState(force) {
    var now = (new Date()).getTime();
    if (!force && g_fw_sharedRaw !== null && (now - g_fw_sharedRawAt) < 500) return g_fw_sharedRaw;
    var v = null;
    try {
        var files = utils.Glob(fw_sharedRoot() + FW_SHARED_KEY + '_*');
        if (files && files.length) {
            var name = String(files[0]);
            v = (name.substring(name.lastIndexOf('_') + 1) === '1');
        }
    } catch (e) { v = null; }
    g_fw_sharedRaw = v;
    g_fw_sharedRawAt = now;
    /* force 是「请以磁盘为准」的意思：这时候顺便把内存值校正回来，免得广播丢了以后永远停在旧值 */
    if (force && typeof v === 'boolean') g_fw_live = v;
    return v;
}

function fw_sharedOn(force) {
    if (!force && typeof g_fw_live === 'boolean') return g_fw_live;
    return fw_sharedState(force) === true;
}

/* 不要删：这不是本主题 js 目录内部用的函数。
   biography\scripts\interface.js 的 UserInterface.draw() 通过
   typeof fw_transparent === 'function' 探测它，决定要不要给面板铺不透明底色：
   本面板勾了「背景壁纸·透明」且全局全屏壁纸开着时不铺，让宿主壁纸透下来。
   SMP 的简介面板把 JStheme_common.js 与 SMPbiography.js 装在同一个脚本上下文里，
   所以它能直接读到这里的顶层符号。删掉这个函数 → 简介面板背景变成不透明纯色块。 */
function fw_transparent(localOn) {
    if (!localOn) return false;
    return fw_sharedOn();
}

function fw_source() {
    var v = 0;
    try { v = Number(window.GetProperty(FW_PROP_SOURCE, 0)); } catch (e) { v = 0; }
    return (v === 1 || v === 2) ? v : 0;
}

function fw_imagePath() {
    var p = "";
    try { p = String(window.GetProperty(FW_PROP_IMAGE, "") || ""); } catch (e) { p = ""; }
    return p;
}
function fw_setImagePath(p) {
    try { window.SetProperty(FW_PROP_IMAGE, String(p || "")); } catch (e) {}
}

/* 把「显示·全屏壁纸图片路径」里存的字符串规整成真正能加载的绝对路径。
   三种写法都认：① 绝对路径 ② %profile%\ / %foobar%\ 前缀 ③ 相对写法（相对
   profile 目录、再相对 foobar2000 目录各试一次）。都找不到返回 ""。
   说明：SMP / JSplitter 的 gdi.Image 对相对路径的基准随宿主和启动目录变，
   所以统一在入口处折算成绝对路径，别再让相对路径流到 gdi.Image。 */
function fw_absImagePath(p) {
    p = String(p == null ? "" : p).replace(/^\s+|\s+$/g, "").replace(/^"|"$/g, "");
    if (!p) return "";
    var prof = String(typeof fb.ProfilePath === "string" ? fb.ProfilePath : "").replace(/[\\\/]+$/, "");
    var fbr = String(typeof fb.FoobarPath === "string" ? fb.FoobarPath : "").replace(/[\\\/]+$/, "");

    var cands = [];
    if (/^%profile%[\\\/]?/i.test(p)) cands.push(prof + "\\" + p.replace(/^%profile%[\\\/]?/i, ""));
    if (/^%foobar%[\\\/]?/i.test(p)) cands.push(fbr + "\\" + p.replace(/^%foobar%[\\\/]?/i, ""));
    cands.push(p);
    if (!/^[a-z]:[\\\/]/i.test(p) && !/^\\\\/.test(p)) {
        if (prof) cands.push(prof + "\\" + p);
        if (fbr) cands.push(fbr + "\\" + p);
    }

    for (var i = 0; i < cands.length; i++) {
        var c = cands[i];
        var ok = false;
        try { ok = (typeof utils !== "undefined" && utils.IsFile) ? !!utils.IsFile(c) : false; } catch (e1) { ok = false; }
        if (!ok) {
            try {
                var im = gdi.Image(c);
                ok = !!(im && im.Width > 0 && im.Height > 0);
            } catch (e2) { ok = false; }
        }
        if (ok) return c;
    }
    return "";
}

/* ===== 预置背景（img\Background）=====
   把图片丢进 themes\eole\img\Background，标题栏右键「全屏壁纸 → 壁纸来源 →
   预置背景」里就会直接列出来，点一下即设为固定图片。
   只认图片扩展名；子目录不递归；文件多了只列前 FW_PRESET_MAX 张。 */
var FW_PRESET_SUBDIR = "Background";
var FW_ID_PRESET_BASE = 7300;
var FW_PRESET_MAX = 40;
var fw_presetCache = [];

function fw_presetDir() {
    var base = (typeof theme_img_path === "string" && theme_img_path)
        ? theme_img_path
        : (String(typeof fb.ProfilePath === "string" ? fb.ProfilePath : "").replace(/[\\\/]+$/, "") + "\\themes\\eole\\img");
    return base + "\\" + FW_PRESET_SUBDIR;
}

function fw_presetFiles() {
    var out = [];
    var list = null;
    try { list = utils.Glob(fw_presetDir() + "\\*.*"); } catch (e) { list = null; }
    if (!list || !list.length) return out;
    var seen = {};
    for (var i = 0; i < list.length; i++) {
        var fp = String(list[i] || "");
        if (!fp) continue;
        if (!/\.(jpe?g|png|bmp|gif|webp|tif|tiff)$/i.test(fp)) continue;   /* 说明.txt 之类直接跳过 */
        var low = fp.toLowerCase();
        if (seen[low]) continue;
        seen[low] = 1;
        var base = fp.split("\\").pop();
        out.push({ name: base.replace(/\.[^.]+$/, ""), file: base, path: fp });
    }
    out.sort(function (a, b) {
        var x = a.name.toLowerCase(), y = b.name.toLowerCase();
        return x < y ? -1 : (x > y ? 1 : 0);
    });
    return out;
}

function fw_blurValue() {
    var key = fw_isDark() ? FW_PROP_BLUR : FW_PROP_BLUR_LT;
    var def = fw_isDark() ? 30 : 20;
    var v = def;
    try { v = Number(window.GetProperty(key, def)); } catch (e) { v = def; }
    if (!isFinite(v)) v = def;
    return Math.max(0, Math.min(90, v));
}

function fw_maskAlpha() {
    var key = fw_isDark() ? FW_PROP_MASK : FW_PROP_MASK_LT;
    var def = fw_isDark() ? 180 : 210;
    var v = def;
    try { v = Number(window.GetProperty(key, def)); } catch (e) { v = def; }
    if (!isFinite(v)) v = def;
    v = Math.max(0, Math.min(255, Math.round(v)));
    if (g_fw_lastHasRealImg === false) v = Math.round(v / 3);
    return v;
}

function fw_maskColor() {
    if (fw_isDark()) return GetGrey(25, fw_maskAlpha());
    return GetGrey(255, fw_maskAlpha());
}

function fw_setBlur(v) {
    v = Math.max(0, Math.min(90, Math.round(Number(v) || 0)));
    try { window.SetProperty(fw_isDark() ? FW_PROP_BLUR : FW_PROP_BLUR_LT, v); } catch (e) {}
}
function fw_setMask(v) {
    v = Math.max(0, Math.min(255, Math.round(Number(v) || 0)));
    try { window.SetProperty(fw_isDark() ? FW_PROP_MASK : FW_PROP_MASK_LT, v); } catch (e) {}
}

function fw_quality() {
    var v = 1;
    try { v = Number(window.GetProperty(FW_PROP_QUALITY, 1)); } catch (e) { v = 1; }
    return (v === 2 || v === 3) ? v : 1;
}

function fw_pickSource() {
    var src = fw_source(), p = fw_imagePath();
    if (src === 1 || src === 2) {
        if (p) {
            /* 属性里可能是相对写法或带 %profile%，先折算成绝对路径再交给 gdi.Image；
               折算不出来就退回原值，行为和以前一致 */
            var pa = "";
            try { pa = fw_absImagePath(p); } catch (e0) { pa = ""; }
            if (!pa) pa = p;
            try {
                var im = gdi.Image(pa);
                if (isImage(im)) return { img: im, path: pa };
            } catch (e) {}
            p = pa;
        }
        if (src === 1) return { img: null, path: p };
    }
    return { img: null, path: "" };
}

function fw_coverArt(metadb) {
    if (!metadb) return null;
    try {
        var im = utils.GetAlbumArtV2(metadb, 0, false);
        if (isImage(im) && im.Width > 1 && im.Height > 1) return im;
    } catch (e1) {}
    try {
        var im2 = utils.GetAlbumArtV2(metadb, AlbumArtId.front);
        if (isImage(im2) && im2.Width > 1 && im2.Height > 1) return im2;
    } catch (e2) {}
    try {
        var im3 = get_albumArt(metadb);
        if (isImage(im3) && im3.Width > 1 && im3.Height > 1) return im3;
    } catch (e3) {}
    return null;
}

// -----------------------------------------------------------------------------------
// fw_buildWallpaper(w, h, metadb)
// -----------------------------------------------------------------------------------
function fw_buildWallpaper(w, h, metadb, qOverride) {
    if (!(w > 0 && h > 0)) return null;
    var q = (typeof qOverride === 'number' && qOverride > 0) ? qOverride : fw_quality();
    var bw = Math.round(w * q), bh = Math.round(h * q);
    if (bw < 8) bw = 8;
    if (bh < 8) bh = 8;

    var srcMode = fw_source();
    var img = null, fromCover = false;

    /* 外部面板（Lxbox）推过来的流播封面优先。
       流播是 http 直链，fb2k 的 album art 对 stream handle 不一定会返回
       面板 AttachImage 挂上去的图，直接读文件路径最稳。
       g_fwExtCover 由 Eole_x64_layout.js 收到 lx_cover_path 后写入；
       其它面板 include 本文件时没有这个变量，typeof 判断会直接跳过。 */
    if (srcMode !== 1) {
        try {
            if (typeof g_fwExtCover === 'string' && g_fwExtCover) {
                var extMd = metadb;
                if (!extMd) { try { extMd = fb.GetNowPlaying(); } catch (eM) { extMd = null; } }
                var extStream = false;
                if (extMd) { try { extStream = /^https?:\/\//i.test(String(extMd.Path || '')); } catch (eP) {} }
                if (extStream) {
                    var extIm = gdi.Image(g_fwExtCover);
                    if (isImage(extIm) && extIm.Width > 1) { img = extIm; fromCover = true; }
                }
            }
        } catch (eExt) {}
    }

    if (!isImage(img) && (srcMode === 0 || srcMode === 2)) {
        if (!metadb) { try { metadb = fb.GetNowPlaying(); } catch (e0) { metadb = null; } }
        var cov = fw_coverArt(metadb);
        if (isImage(cov)) { img = cov; fromCover = true; }
    }
    if (!isImage(img) && srcMode !== 1) {
        var pick = fw_pickSource();
        if (isImage(pick.img)) img = pick.img;
    }
    if (!isImage(img) && srcMode === 1) {
        var pick1 = fw_pickSource();
        if (isImage(pick1.img)) img = pick1.img;
    }
    if (!isImage(img)) {
        try {
            var def = globalProperties.default_wallpaper;
            if (def) {
                var imd = gdi.Image(def);
                if (isImage(imd) && imd.Width > 1) img = imd;
            }
        } catch (e4) {}
    }
    if (!isImage(img)) {
        try {
            var nc = globalProperties.nocover_img;
            if (isImage(nc) && nc.Width > 1) img = nc;
        } catch (e5) {}
    }
    g_fw_lastSrcCover = fromCover;
    g_fw_lastHasRealImg = isImage(img);
    if (!isImage(img)) {
        try {
            img = gdi.CreateImage(Math.max(2, Math.round(bw / 8)), Math.max(2, Math.round(bh / 8)));
            var fg = img.GetGraphics();
            fg.FillSolidRect(0, 0, img.Width, img.Height, fw_isDark() ? GetGrey(52) : GetGrey(224));
            img.ReleaseGraphics(fg);
        } catch (e6) { img = null; }
    }
    if (!isImage(img)) return null;

    var iw = img.Width, ih = img.Height;
    var dstRatio = bw / bh;
    var srcRatio = iw / ih;
    var cx = 0, cy = 0, cw = iw, ch = ih;
    if (srcRatio > dstRatio) {
        cw = Math.round(ih * dstRatio);
        cx = Math.round((iw - cw) / 2);
    } else if (srcRatio < dstRatio) {
        ch = Math.round(iw / dstRatio);
        cy = Math.round((ih - ch) / 2);
    }
    if (cw < 1) cw = iw;
    if (ch < 1) ch = ih;

    var blur = fw_blurValue();
    var tmp = null;
    if (blur > 0) {
        try {
            var div = 1 + blur / 6;
            var sw = Math.max(24, Math.round(bw / div));
            var sh = Math.max(24, Math.round(bh / div));
            var small = gdi.CreateImage(sw, sh);
            var sg = small.GetGraphics();
            sg.SetInterpolationMode(1);
            sg.DrawImage(img, 0, 0, sw, sh, cx, cy, cw, ch, 0, 255);
            small.ReleaseGraphics(sg);
            small.StackBlur(Math.max(1, Math.round(blur / 2)));
            tmp = fw_scaleClean(small, bw, bh);
        } catch (e) { tmp = null; }
    }
    if (!isImage(tmp)) {
        try {
            tmp = fw_scaleClean(img, bw, bh, cx, cy, cw, ch);
        } catch (e2) { tmp = null; }
    }
    if (!isImage(tmp)) tmp = img;
    return tmp;
}

/* GDI+ 缩放（尤其是放大）时，目标位图右、下边缘的最后几个像素会采样到源图之外，
   变成半透明像素。壁纸铺满窗口后，这些半透明像素会透出窗口本身的底色，看起来
   就是右边、下边一条白色渐变高光边（左边和顶部不受影响，所以只在右/下可见）。
   处理办法：先把内容画到比目标大一圈的画布上，让半透明边落在多出来的那一圈，
   再按 1:1 只取中间的 w × h（1:1 绘制不会再产生渐变边），输出图四边就完全不透明。
   那一圈的宽度约等于放大倍数（放大 7.6 倍 ≈ 7 像素），所以按倍数留边再抛一点余量。 */
function fw_scaleClean(src, w, h, sx, sy, sw, sh) {
    var rw = (sx === undefined) ? src.Width : sw;
    var rh = (sx === undefined) ? src.Height : sh;
    var ratio = Math.max(w / Math.max(1, rw), h / Math.max(1, rh));
    var pad = Math.max(8, Math.ceil(ratio) + 4);
    var cw = w + pad * 2, ch = h + pad * 2;
    var big = gdi.CreateImage(cw, ch);
    var bg = big.GetGraphics();
    bg.SetInterpolationMode(1);
    if (sx === undefined) bg.DrawImage(src, 0, 0, cw, ch, 0, 0, src.Width, src.Height, 0, 255);
    else bg.DrawImage(src, 0, 0, cw, ch, sx, sy, sw, sh, 0, 255);
    big.ReleaseGraphics(bg);
    var out = gdi.CreateImage(w, h);
    var og = out.GetGraphics();
    og.DrawImage(big, 0, 0, w, h, pad, pad, w, h, 0, 255);
    out.ReleaseGraphics(og);
    return out;
}

function fw_drawWallpaper(gr, w, h, wallImg) {
    if (!gr) return false;
    if (isImage(wallImg) && wallImg.Width > 0) {
        if (wallImg.Width === w && wallImg.Height === h) {
            /* 尺寸正好一致：1:1 绘制，不会再产生半透明边 */
            gr.DrawImage(wallImg, 0, 0, w, h, 0, 0, w, h, 0, 255);
        } else {
            /* 缓存图比窗口小（刚改完尺寸、低清图还没换掉）时会放大绘制，
               右/下照样会出现半透明边。往外多画一圈，让半透明边落进面板外被裁掉。 */
            var ov = 8;
            gr.DrawImage(wallImg, -ov, -ov, w + ov * 2, h + ov * 2, 0, 0, wallImg.Width, wallImg.Height, 0, 255);
        }
    } else {
        gr.FillSolidRect(0, 0, w, h, fw_isDark() ? GetGrey(30) : GetGrey(255));
        return false;
    }
    var a = fw_maskAlpha();
    if (a > 0) gr.FillSolidRect(0, 0, w, h, fw_maskColor());
    return true;
}

var g_fw_on = null;
function fw_on() {
    if (g_fw_on === null) g_fw_on = fw_enabled();
    return g_fw_on;
}
function fw_setOn(v) {
    g_fw_on = !!v;
    /* 各面板收到 fullscreenWallpaper / …Repaint 时都会走这里 */
    g_fw_live = !!v;
}

function fw_glass() {
    return fw_on();
}

function fw_cfgPath() {
    return fb.ProfilePath + 'wsh-data\\eole-settings\\FULLSCREENWALLPAPER.cfg';
}

function fw_rawNum(key, def) {
    var v = def;
    try { v = Number(window.GetProperty(key, def)); } catch (e) { v = def; }
    return isFinite(v) ? v : def;
}

function fw_cfgWrite() {
    var c = {
        on:  fw_enabled(),
        src: fw_source(),
        img: fw_imagePath(),
        bd:  fw_rawNum(FW_PROP_BLUR, 30),
        bl:  fw_rawNum(FW_PROP_BLUR_LT, 20),
        md:  fw_rawNum(FW_PROP_MASK, 180),
        ml:  fw_rawNum(FW_PROP_MASK_LT, 210),
        q:   fw_quality()
    };
    try {
        utils.WriteTextFile(fw_cfgPath(), JSON.stringify(c));
        return true;
    } catch (e) {
        try { console.log('[FW] 写配置文件失败: ' + e); } catch (x) {}
        return false;
    }
}

function fw_cfgRead() {
    try {
        var t = utils.ReadTextFile(fw_cfgPath());
        if (!t) return null;
        var c = JSON.parse(t);
        return (c && typeof c === 'object') ? c : null;
    } catch (e) { return null; }
}

function fw_broadcast(on) {
    var v = (typeof on === "boolean") ? on : fw_enabled();
    try { window.SetProperty(FW_PROP_ENABLED, v); } catch (e) {}
    try { fw_sharedSet(v); } catch (eS) {}
    try { fw_cfgWrite(); } catch (eW) {}
    try { g_fw_sharedRaw = null; } catch (eC) {}
    try { g_fw_live = v; } catch (eL) {}
    try { window.NotifyOthers("fullscreenWallpaper", v); } catch (e) {}
    try { window.NotifyOthers("wallpaper", { enabled: v }); } catch (e2) {}
    try { window.Repaint(); } catch (e3) {}
}

//JSON wrappers
function JSON_parse(info) {
	try {
	   return JSON.parse(info);
	} catch (e) {
		fb.ShowPopupMessage('Oupppppsssss, it look like an error\n\n'+"JSON_parse "+info, "Error");
		console.log(e)
	}
	return JSON.parse(info);
}
function JSON_stringify(info) {
	try {
	   return JSON.stringify(info);
	} catch (e) {
		fb.ShowPopupMessage('Oupppppsssss, it look like an error\n\n'+"JSON_stringify "+info, "Error");
		console.log(e)
	}
}
function CreatePlaylist(pl_place, pl_name) {
	try {
		result = utils.InputBox(window.ID, "为播放列表命名", "新建播放列表", "新播放列表", true);
		if (result){
			if (result == "") {
				plman.CreatePlaylist(pl_place, "新播放列表");
			} else plman.CreatePlaylist(pl_place, result);
			return true;
		} else return false;
	} catch(e) {
	}
}

/* ===========================================================================
 * 洛雪音源广播接收（lx_now_*）
 *
 * 在线流播的播放项在 fb2k 里没有标签：%artist% 恒空、%title% 只是 URL 末段。
 * Lxbox 面板会广播歌手 / 歌名，并且固定写一份
 *     <profile>\Lxbox\nowplaying\info.json
 * 这里统一接住，各面板只调 lxInfoOf() / lxFillFormat() 两个函数：
 *     g_lx_now    当前曲目
 *     g_lx_items  按播放项路径(小写)索引的 {artist,title,album,cover}
 * 面板侧约定：在自己脚本里定义 lxRefresh()，广播一到就会被调用一次，
 * 用来把已经算好的字符串（标题、行文本）重算。
 * =========================================================================== */
var g_lx_now = null;
var g_lx_items = null;
var g_lx_file = '';

function lxInfoPaths() {
	var out = [];
	if (g_lx_file) out.push(g_lx_file);
	try {
		if (fb.ProfilePath) out.push(String(fb.ProfilePath).replace(/[\\\/]+$/, "") + "\\Lxbox\\nowplaying\\info.json");
	} catch (e) { }
	return out;
}

function lxLoadItems(force) {
	if (!g_lx_items) g_lx_items = {};
	if (!force) return g_lx_items;
	if (typeof utils.ReadTextFile !== 'function') return g_lx_items;
	var paths = lxInfoPaths();
	for (var i = 0; i < paths.length; i++) {
		try {
			var txt = String(utils.ReadTextFile(paths[i], 65001) || "");
			if (!txt) continue;
			var j = JSON.parse(txt.replace(/^\uFEFF/, ""));
			if (j && j.items && typeof j.items === 'object') {
				for (var k in j.items) {
					var v = j.items[k];
					if (v && (v.title || v.artist)) g_lx_items[k.toLowerCase()] = v;
				}
			}
		} catch (e) { }
	}
	return g_lx_items;
}

/* 播放项 -> {artist,title,album}；没有就返回 null，调用方按老逻辑走 */
function lxInfoOf(metadb) {
	if (!metadb) return null;
	var p = '';
	try { p = String(metadb.Path || '').toLowerCase(); } catch (e) { return null; }
	if (!p) return null;
	if (!g_lx_items) lxLoadItems(true);
	if (!g_lx_items[p]) lxLoadItems(true);
	return g_lx_items[p] || null;
}

function lxTfLit(v) {
	return "'" + String(v == null ? "" : v).replace(/'/g, "''").replace(/\r?\n/g, " ") + "'";
}

/* 把格式串里的 %artist% / %title% / %album% 换成广播来的值。
   用 titleformat 的单引号字面量，格式里的 $crlf()、[...] 条件段照常生效。 */
function lxFillFormat(fmt) {
	if (!g_lx_now || !fmt) return fmt;
	var map = { artist: g_lx_now.artist, title: g_lx_now.title, album: g_lx_now.album };
	var out = String(fmt);
	for (var k in map) {
		if (map[k] == null || map[k] === "") continue;
		out = out.replace(new RegExp("%" + k + "%", "gi"), lxTfLit(map[k]));
	}
	return out;
}

function lxApplyNow(info) {
	if (!info || (!info.title && !info.artist)) {
		g_lx_now = null;
	} else {
		g_lx_now = info;
		if (info.file) g_lx_file = String(info.file);
		if (info.url) {
			if (!g_lx_items) g_lx_items = {};
			g_lx_items[String(info.url).toLowerCase()] =
				{ artist: info.artist || "", title: info.title || "", album: info.album || "", cover: info.cover || "", ts: info.ts || 0 };
		}
	}
	if (typeof lxRefresh === 'function') { try { lxRefresh(); } catch (e) { } }
	try { window.Repaint(); } catch (e2) { }
}

/* 各面板的 on_notify_data 里第一句写：if (lxNotify(name, info)) return; */
function lxNotify(name, info) {
	switch (name) {
		case "lx_cache_dir":
			globalProperties.lx_artist_cache_dir = (typeof info === 'string') ? info : '';
			return true;
		case "lx_now_info":
			lxApplyNow(info);
			return true;
		case "lx_now_json":
			try { lxApplyNow(JSON.parse(String(info))); } catch (e) { }
			return true;
		case "lx_now_text":
			if (typeof info === 'string' && info) {
				var p = info.split(' - ');
				lxApplyNow((p.length > 1) ? { artist: p[0], title: p.slice(1).join(' - ') } : { artist: '', title: info });
			}
			return true;
		case "lx_now_clear":
			lxApplyNow(null);
			return true;
	}
	return false;
}

/* 面板比 Lxbox 晚加载时，问一句「现在在放什么」 */
setTimeout(function () { try { window.NotifyOthers('lx_now_request', true); } catch (e) { } }, 1500);
/* 同样问一次 Lxbox 的艺术家缓存目录（自定义外部目录时尤其需要） */
setTimeout(function () { try { window.NotifyOthers('lx_cache_dir_request', true); } catch (e) { } }, 1800);
setTimeout(function () { try { window.NotifyOthers('lx_cache_dir_request', true); } catch (e) { } }, 4500);

