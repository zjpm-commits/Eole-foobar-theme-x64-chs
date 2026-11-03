var g_script_version = "2.1.0";
var g_LDT = DT_LEFT | DT_VCENTER | DT_CALCRECT | DT_NOPREFIX | DT_END_ELLIPSIS;
var g_middle_clicked = false;
var g_middle_click_timer = false;
var g_textbox_tabbed = false;
var g_leave = false;
var g_init_on_size = false;
var g_left_click_hold = false;
var g_selHolder = fb.AcquireUiSelectionHolder();
g_selHolder.SetPlaylistSelectionTracking();
var g_repaint = 0;
var g_seconds = 0;
var g_timer1 = false, need_repaint = false;
var g_mouse_wheel_timer = false;
// 从 Windows 系统拖放
var g_dragndrop_status = false;
var g_dragndrop_x = -1;
var g_dragndrop_y = -1;
var g_dragndrop_bottom = false;
var g_dragndrop_timer = false;
var g_dragndrop_trackId = -1;
var g_dragndrop_rowId = -1;
var g_dragndrop_targetPlaylistId = -1;
var g_dragndrop_total_before = 0;
// 字体变量
var g_fname, g_fsize, g_fstyle;
var g_font = null;
var g_font_headers = null;
var g_font_group1 = null;
var g_font_group2 = null;
var g_font_guifx_found = utils.CheckFont("guifx v2 transports");
var g_font_playicon, g_font_pauseicon, g_font_checkbox, g_font_queue_idx, g_font_rating, g_font_mood;
var g_font_wd1, g_font_wd2, g_font_wd3;
// 颜色变量
var g_color_normal_bg = 0;
var g_color_selected_bg = 0;
var g_color_normal_txt = 0;
var g_color_selected_txt = 0;
var g_color_highlight = 0;
var g_syscolor_window_bg = 0;
var g_syscolor_highlight = 0;
var g_syscolor_button_bg = 0;
var g_syscolor_button_txt = 0;
// 主窗口变量
var g_avoid_on_playlists_changed = false;
var g_avoid_on_playlist_items_reordered = false;
var g_avoid_on_item_focus_change = false;
var g_avoid_on_playlist_items_added = false;
var g_avoid_on_playlist_items_removed = false;
var g_first_launch = true;
var g_instancetype = window.InstanceType;

var g_dpi_percent = 0;
var g_forced_percent = 0;
var g_dpi = (g_forced_percent == 0 ? g_dpi_percent : g_forced_percent);
var g_z2 = 0;
var g_z3 = 0;
var g_z4 = 0;
var g_z5 = 0;
var g_z6 = 0;
var g_z8 = 0;
var g_z10 = 0;
var g_z16 = 0;
var ww = 0, wh = 0;
var mouse_x = 0, mouse_y = 0;
var g_metadb;
var foo_playcount = utils.CheckComponent("foo_playcount", true);
clipboard = {
	selection: null
};
// 壁纸信息
var wpp_img_info = {
	orient: 0,
	cut: 0,
	cut_offset: 0,
	ratio: 0,
	x: 0,
	y: 0,
	w: 0,
	h: 0
};
// WSH 统计全局变量
var tf_path = fb.TitleFormat("$left(%_path_raw%,4)");
var g_path, g_track_type;
var opt_stats = window.GetProperty("自定义.启用统计（写入文件）", false);
var wsh_time_elaps;
var wsh_delay_stats;
var wsh_limit_stats;
var tf_length_seconds = fb.TitleFormat("%length_seconds_fp%");
var first_played = fb.TitleFormat("%first_played%");
var last_played = fb.TitleFormat("%last_played%");
var play_counter = fb.TitleFormat("%play_counter%");
var play_count = fb.TitleFormat("%play_count%");
cStats = {
	handle: null,
	waiting_for_writing: false
};

//=================================================// 主属性/参数
properties = {
	showDPI: window.GetProperty("系统.显示DPI", false),
	enableTouchControl: window.GetProperty("系统.启用触摸滚动", false),
	collapseGroupsByDefault: window.GetProperty("系统.默认折叠分组", false),
	enablePlaylistFilter: window.GetProperty("系统.启用播放列表筛选", false),
	enableCustomColors: window.GetProperty("系统.启用自定义颜色", false),
	defaultPlaylistItemAction: window.GetProperty("系统.默认播放列表操作", "Play"), //"Add to playback queue",
	autocollapse: window.GetProperty("系统.自动折叠", false),
	showgroupheaders: window.GetProperty("*分组: 显示分组标题", true),
	showscrollbar: window.GetProperty("自定义 显示滚动条", true),
	showwallpaper: window.GetProperty("自定义 显示壁纸", false),
	wallpaperalpha: window.GetProperty("自定义 壁纸透明度", 192),
	wallpaperblurred: window.GetProperty("自定义 壁纸模糊", true),
	wallpaperblurvalue: window.GetProperty("自定义 壁纸模糊值", 1.05),
	wallpapermode: window.GetProperty("自定义 壁纸类型", 0),
	wallpaperpath: window.GetProperty("自定义 默认壁纸路径", ".\\user-components\\foo_uie_jsplitter\\samples\\jsplaylist-mod\\images\\default.jpg"),
	oddevenrowshighlight: window.GetProperty("自定义 高亮奇/偶行", true),
	settingspanel: false,
	smoothscrolling: window.GetProperty("自定义 启用平滑滚动", true),
	max_columns: 24,
	max_patterns: 25,
	focus_rect_alpha: window.GetProperty("自定义 焦点框透明度", 75),
	selection_rect_alpha: window.GetProperty("自定义 选中实心框透明度", 60)
};

// =================================================================== // 图像单例
images = {
	path: fb.ComponentPath + "\\samples\\jsplaylist-mod\\images\\",
	sortdirection: null,
	glass_reflect: null,
	nocover: null,
	noartist: null,
	stream: null,
	logo: null,
	beam: null,
	noresult: null,
	loading: null,
	loading_angle: 0
};

// =================================================================== // 字体 / Dpi / 颜色 / 图像初始化
function system_init() {
	get_font();
	get_colors();
};
system_init();

// =================================================================== // Titleformat 字段
var tf_group_key = null;
// 增量搜索功能中使用的 tf 字段
var tf_artist = fb.TitleFormat("$if(%length%,%artist%,'Stream')");
var tf_albumartist = fb.TitleFormat("$if(%length%,%album artist%,'Stream')");
var tf_bitrate = fb.TitleFormat("$if(%__bitrate_dynamic%,$if(%el_isplaying%,%__bitrate_dynamic%'K',$if($stricmp($left(%codec_profile%,3),'VBR'),%codec_profile%,%__bitrate%'K')),$if($stricmp($left(%codec_profile%,3),'VBR'),%codec_profile%,%__bitrate%'K'))");
var tf_bitrate_playing = fb.TitleFormat("$if(%__bitrate_dynamic%,$if(%_isplaying%,$select($add($mod(%_time_elapsed_seconds%,2),1),%__bitrate_dynamic%,%__bitrate_dynamic%),%__bitrate_dynamic%),%__bitrate%)'K'");

// =================================================================== // 单例
cRow = { // 行高引用（缩放 100%）
	default_playlist_h: window.GetProperty("系统.播放列表行高（像素）", 28),
	playlist_h: 29,
	extra_line_h: 6,
	playlistManager_h: 28,
	headerBar_h: 26,
	settings_h: 30
};

p = {
	wallpaperImg: null,
	topbar: null,
	headerBar: null,
	list: null,
	playlistManager: null,
	settings: null,
	timer_onKey: false
};

cTouch = {
	down: false,
	y_start: 0,
	y_end: 0,
	down_id: 0,
	up_id: 0
};

cSettings = {
	visible: false,
	topBarHeight: zoom(50, g_dpi),
	tabPaddingWidth: Math.ceil(30 * g_dpi / 100 / 14),
	rowHeight: zoom(cRow.settings_h, g_dpi),
	wheel_timer: false
};

cPlaylistManager = {
	mediaLibraryPlaylist: window.GetProperty("系统.媒体库播放列表", false),
	enableHistoricPlaylist: window.GetProperty("自定义 历史播放列表已启用", false),
	width: zoom(220, g_dpi),
	rowHeight: zoom(cRow.playlistManager_h, g_dpi),
	showStatusBar: true,
	statusBarHeight: zoom(18, g_dpi),
	step: zoom(50, g_dpi),
	visible: window.GetProperty("系统.播放列表管理器.可见", false),
	visible_on_launch: false,
	drag_move_timer: false,
	hscroll_timer: false,
	vscroll_timer_loop: false,
	vscroll_timer: false,
	blink_timer: false,
	blink_counter: -1,
	blink_id: null,
	blink_totaltracks: 0,
	showTotalItems: window.GetProperty("系统.播放列表管理器.显示总项数", true),
	playlist_switch_pending: false,
	drag_clicked: false,
	drag_moved: false,
	drag_target_id: -1,
	drag_source_id: -1,
	drag_x: -1,
	drag_y: -1,
	drag_droped: false,
	rightClickedId: null,
	init_timer: false,
	inputbox_timer: false,
	sortPlaylists_timer: false
};

cTopBar = {
	height: zoom(54, g_dpi),
	txtHeight: zoom(19, g_dpi),
	visible: window.GetProperty("系统.顶栏.可见", true)
};

cHeaderBar = {
	height: zoom(cRow.headerBar_h, g_dpi),
	txtHeight: zoom(12, g_dpi),
	borderWidth: Math.ceil(cRow.headerBar_h * g_dpi / 100 / 14),
	locked: window.GetProperty("系统.标题栏.已锁定", true),
	timerAutoHide: false,
	sortRequested: false
};

cScrollBar = {
	width: (g_dpi != g_dpi_percent ? zoom(get_system_scrollbar_width(), g_dpi) : get_system_scrollbar_width()),
	buttonType: {
		cursor: 0,
		up: 1,
		down: 2
	},
	timerID: false,
	parentObjectScrolling: null,
	timerID1: false,
	timerID2: false,
	timerCounter: 0,
	timer_repaint: false,
	themed: window.GetProperty("自定义.主题滚动条", false)
};

cTrack = {
	height: zoom(cRow.playlist_h, g_dpi),
	parity: ((zoom(cRow.playlist_h, g_dpi) / 2) == Math.floor(zoom(cRow.playlist_h, g_dpi) / 2) ? 0 : 1)
};

cGroup = {
	show: window.GetProperty("*分组: 显示分组标题", true),
	default_collapsed_height: 3,
	default_expanded_height: 3,
	collapsed_height: 3,
	expanded_height: 3,
	default_count_minimum: window.GetProperty("*分组: 每组最少行数", 0),
	count_minimum: window.GetProperty("*分组: 每组最少行数", 0),
	extra_rows: 0,
	type: 0,
	pattern_idx: window.GetProperty("系统.分组.模式索引", 0)
};

cover = {
	show: true,
	column: false,
	draw_glass_reflect: window.GetProperty("自定义.封面绘制倒影", false),
	keepaspectratio: window.GetProperty("自定义.封面保持纵横比", true),
	load_timer: false,
	repaint_timer: false,
	margin: 7,
	w: 0,
	max_w: cGroup.default_collapsed_height > cGroup.default_expanded_height ? cGroup.default_collapsed_height * cTrack.height : cGroup.default_expanded_height * cTrack.height,
	h: 0,
	max_h: cGroup.default_collapsed_height > cGroup.default_expanded_height ? cGroup.default_collapsed_height * cTrack.height : cGroup.default_expanded_height * cTrack.height,
	previous_max_size: -1,
	resized: false
};

cList = {
	search_string: "",
	incsearch_font: gdi_font("lucida console", zoom(9, g_dpi), 0),
	incsearch_font_big: gdi_font("lucida console", zoom(20, g_dpi), 1),
	inc_search_noresult: false,
	clear_incsearch_timer: false,
	incsearch_timer: false,
	repaint_timer: false,
	scrollstep: window.GetProperty("系统.播放列表滚动步长", 3),
	touchstep: window.GetProperty("系统.播放列表触摸步长", 2),
	scroll_timer: false,
	scroll_delta: cTrack.height,
	scroll_direction: 1,
	scroll_step: Math.floor(cTrack.height / 3),
	scroll_div: 2,
	borderWidth: Math.ceil(cRow.headerBar_h * g_dpi / 100 / 14),
	beam_timer: false,
	enableExtraLine: window.GetProperty("系统.启用额外行", true)
};

dragndrop = {
	enabled: true,
	contigus_sel: null,
	x: 0,
	y: 0,
	drag_id: -1,
	drop_id: -1,
	timerID: false,
	drag_in: false,
	drag_out: false,
	clicked: false,
	moved: false
};

columns = {
	rating: false,
	rating_x: 0,
	rating_w: 0,
	rating_drag: false,
	mood: false,
	mood_x: 0,
	mood_w: 0,
	mood_drag: false
};

//=================================================// 播放列表平滑滚动
function set_scroll_delta() {
	var maxOffset = (p.list.totalRows > p.list.totalRowVisible ? p.list.totalRows - p.list.totalRowVisible : 0);
	if (p.list.offset > 0 && p.list.offset < maxOffset) {
		if (!cList.scroll_timer) {
			cList.scroll_delta = cTrack.height;
			if (!(cList.scroll_direction > 0 && p.list.offset == 0) && !(cList.scroll_direction < 0 && p.list.offset >= p.list.totalRows - p.list.totalRowVisible)) {
				cList.scroll_timer = window.SetInterval(function () {
						cList.scroll_step = Math.round(cList.scroll_delta / cList.scroll_div);
						cList.scroll_delta -= cList.scroll_step;
						if (cList.scroll_delta <= 1) {
							window.ClearTimeout(cList.scroll_timer);
							cList.scroll_timer = false;
							cList.scroll_delta = 0;
						};
						full_repaint();
					}, 30);
			};
		} else {
			cList.scroll_delta = cTrack.height;
		};
	};
};

//=================================================// 播放列表管理器面板的额外函数
function renamePlaylist() {
	if (!p.playlistManager.inputbox.text || p.playlistManager.inputbox.text == "" || p.playlistManager.inputboxID == -1)
		p.playlistManager.inputbox.text = p.playlistManager.playlists[p.playlistManager.inputboxID].name;
	if (p.playlistManager.inputbox.text.length > 1 || (p.playlistManager.inputbox.text.length == 1 && (p.playlistManager.inputbox.text >= "a" && p.playlistManager.inputbox.text <= "z") || (p.playlistManager.inputbox.text >= "A" && p.playlistManager.inputbox.text <= "Z") || (p.playlistManager.inputbox.text >= "0" && p.playlistManager.inputbox.text <= "9"))) {
		p.playlistManager.playlists[p.playlistManager.inputboxID].name = p.playlistManager.inputbox.text;
		plman.RenamePlaylist(p.playlistManager.playlists[p.playlistManager.inputboxID].idx, p.playlistManager.inputbox.text);
		full_repaint();
	};
	p.playlistManager.inputboxID = -1;
};

function inputboxPlaylistManager_activate() {
	window.ClearTimeout(cPlaylistManager.inputbox_timer);
	cPlaylistManager.inputbox_timer = false;
	//
	p.playlistManager.inputbox.on_focus(true);
	p.playlistManager.inputbox.edit = true;
	p.playlistManager.inputbox.Cpos = p.playlistManager.inputbox.text.length;
	p.playlistManager.inputbox.anchor = p.playlistManager.inputbox.Cpos;
	p.playlistManager.inputbox.SelBegin = p.playlistManager.inputbox.Cpos;
	p.playlistManager.inputbox.SelEnd = p.playlistManager.inputbox.Cpos;
	if (!cInputbox.timer_cursor) {
		p.playlistManager.inputbox.resetCursorTimer();
	};
	p.playlistManager.inputbox.dblclk = true;
	p.playlistManager.inputbox.SelBegin = 0;
	p.playlistManager.inputbox.SelEnd = p.playlistManager.inputbox.text.length;
	p.playlistManager.inputbox.text_selected = p.playlistManager.inputbox.text;
	p.playlistManager.inputbox.select = true;
	full_repaint();
};

function addToHistoricPlaylist(handle) {

	if (handle == null || plman.GetPlaylistName(plman.PlayingPlaylist) == "Historic")
		return;

	g_avoid_on_playlists_changed = true;
	var historicIndex = plman.FindOrCreatePlaylist("Historic", true);
	var handles = new FbMetadbHandleList(handle);
	plman.InsertPlaylistItems(historicIndex, plman.PlaylistItemCount(historicIndex), handles, false);
	g_avoid_on_playlists_changed = false;

	if (cPlaylistManager.visible)
		full_repaint();
};

function checkMediaLibrayPlaylist() {
	g_avoid_on_playlists_changed = true;
	var idx = plman.FindPlaylist("Media Library");
	if (idx == -1) {
		plman.CreateAutoPlaylist(0, "Media Library", "ALL", "%album artist% | $if(%album%,%date%,'9999') | %album% | %discnumber% | %tracknumber% | %title%", 0);
	} else if (idx > 0) {
		plman.MovePlaylist(idx, 0);
	};

	g_avoid_on_playlists_changed = false;
};

function togglePlaylistManager() {
	if (!cPlaylistManager.hscroll_timer) {
		if (cPlaylistManager.visible) {
			cPlaylistManager.hscroll_timer = window.SetInterval(function () {
					p.playlistManager.repaint();
					p.playlistManager.woffset -= cPlaylistManager.step;
					if (p.playlistManager.woffset <= 0) {
						p.playlistManager.woffset = 0;
						cPlaylistManager.hscroll_timer && window.ClearTimeout(cPlaylistManager.hscroll_timer);
						cPlaylistManager.hscroll_timer = false;
						cPlaylistManager.visible = false;
						window.SetProperty("系统.播放列表管理器.可见", cPlaylistManager.visible);
						p.headerBar.button.update(p.headerBar.slide_open_normal, p.headerBar.slide_open_hover, p.headerBar.slide_open_down);
						full_repaint();
					};
				}, 16);
		} else {
			p.playlistManager.refresh("", false, false);
			cPlaylistManager.hscroll_timer = window.SetInterval(function () {
					p.playlistManager.woffset += cPlaylistManager.step;
					if (p.playlistManager.woffset >= cPlaylistManager.width) {
						p.playlistManager.woffset = cPlaylistManager.width;
						cPlaylistManager.hscroll_timer && window.ClearTimeout(cPlaylistManager.hscroll_timer);
						cPlaylistManager.hscroll_timer = false;
						cPlaylistManager.visible = true;
						window.SetProperty("系统.播放列表管理器.可见", cPlaylistManager.visible);
						p.headerBar.button.update(p.headerBar.slide_close_normal, p.headerBar.slide_close_hover, p.headerBar.slide_close_down);
						full_repaint();
					} else {
						p.playlistManager.repaint();
					};
				}, 16);
		};
	};
};

function adjustMetrics(origin) {
	cSettings.topBarHeight = zoom(50, g_dpi);
	cSettings.tabPaddingWidth = Math.ceil(30 * g_dpi / 100 / 14);
	cSettings.columnOffset = 0;
	cSettings.rowHeight = zoom(cRow.settings_h, g_dpi);
	cTopBar.height = zoom(54, g_dpi);
	cTopBar.txtHeight = zoom(19, g_dpi);
	cHeaderBar.height = zoom(cRow.headerBar_h, g_dpi);
	cHeaderBar.txtHeight = zoom(12, g_dpi);
	cHeaderBar.borderWidth = Math.ceil(cRow.headerBar_h * g_dpi / 100 / 14);
	var fin = p.headerBar.columns.length;
	for (var i = 0; i < fin; i++) {
		p.headerBar.columns[i].minWidth = zoom(32, g_dpi);
	};
	if (p.headerBar.columns[0].percent > 0)
		cover.resized = true;
	cScrollBar.width = (g_dpi != g_dpi_percent ? Math.ceil(get_system_scrollbar_width() * g_dpi / 100) : get_system_scrollbar_width());
	cTrack.height = zoom(cRow.playlist_h, g_dpi);
	cPlaylistManager.width = zoom(220, g_dpi);
	cPlaylistManager.rowHeight = zoom(cRow.playlistManager_h, g_dpi);
	cPlaylistManager.statusBarHeight = zoom(16, g_dpi);
	cPlaylistManager.step = zoom(50, g_dpi);
	get_font();
	p.playlistManager.setButtons();
	p.playlistManager.refresh("", false, false, false);
	cList.incsearch_font = gdi_font("lucida console", zoom(9, g_dpi), 0);
	cList.incsearch_font_big = gdi_font("lucida console", zoom(20, g_dpi), 1);
	cList.borderWidth = Math.ceil(cRow.headerBar_h * g_dpi / 100 / 14);

	//
	g_z2 = zoom(2, g_dpi);
	g_z3 = zoom(3, g_dpi);
	g_z4 = zoom(4, g_dpi);
	g_z5 = zoom(5, g_dpi);
	g_z6 = zoom(6, g_dpi);
	g_z8 = zoom(8, g_dpi);
	g_z10 = zoom(10, g_dpi);
	g_z16 = zoom(16, g_dpi);
	//

	if (origin == 1) {
		// 缩放/调整大小时重置封面缓存
		cover.max_w = (cGroup.default_collapsed_height > cGroup.default_expanded_height ? cGroup.default_collapsed_height * cTrack.height : cGroup.default_expanded_height * cTrack.height);
		g_image_cache = new image_cache;
	};
};

//=================================================// 图像缓存
function on_get_album_art_done(metadb, art_id, image, image_path) {
	var cover_metadb = null;
	var fin = p.list.items.length;
	for (var i = 0; i < fin; i++) {
		if (p.list.items[i].metadb) {
			if (cover.column) {
				cover_metadb = p.list.handleList[p.list.groups[p.list.items[i].group_index].start];
			} else {
				cover_metadb = p.list.items[i].metadb;
			};
			if (cover_metadb.Compare(metadb)) {
				p.list.items[i].cover_img = g_image_cache.getit(metadb, image);
				if (!g_mouse_wheel_timer && !cScrollBar.timerID2 && !cList.repaint_timer) {
					if (!cover.repaint_timer) {
						cover.repaint_timer = window.SetTimeout(function () {
							if (!g_mouse_wheel_timer && !cScrollBar.timerID2 && !cList.repaint_timer)
								full_repaint();
							cover.repaint_timer && window.ClearTimeout(cover.repaint_timer);
							cover.repaint_timer = false;
						}, 75);
					};
				};
				break;
			};
		};
	};
};

image_cache = function () {
	this._cachelist = {};
	this.hit = function (metadb) {
		var d = (properties.showgroupheaders ? metadb.Path : fb.TitleFormat("$replace(%path%,%filename_ext%,)").EvalWithMetadb(metadb));
		var img = this._cachelist[d];
		if (typeof img == "undefined") { // 若图像不在缓存中，我们异步加载它
			if (!cover.load_timer) {
				cover.load_timer = window.SetTimeout(function () {
						utils.GetAlbumArtAsync(window.ID, metadb, AlbumArtId.front);
						cover.load_timer && window.ClearTimeout(cover.load_timer);
						cover.load_timer = false;
					}, (g_mouse_wheel_timer || cScrollBar.timerID2 ? 20 : 10));
			};
		};
		return img;
	};
	this.getit = function (metadb, image) {
 		var cw = cover.column ? ((p.headerBar.columns[0].w <= cover.max_w) ? cover.max_w : p.headerBar.columns[0].w) : cover.max_w;
		var ch = cw;
		var img;
		if (image) {
			if (image.Height >= image.Width) {
				var ratio = image.Width / image.Height;
				var pw = (cw + cover.margin * 2) * ratio;
				var ph = ch + cover.margin * 2;
			} else {
				var ratio = image.Height / image.Width;
				var pw = cw + cover.margin * 2;
				var ph = (ch + cover.margin * 2) * ratio;
			}
		} else {
			var pw = cw + cover.margin * 2;
			var ph = ch + cover.margin * 2;
		};
		if (metadb) {
			img = FormatCover(image, pw, ph, cover.draw_glass_reflect, false);
			if (!img) {
				img = null;
				cover.type = 0;
			} else {
				cover.type = 1;
			}
		}
		var d = (properties.showgroupheaders ? metadb.Path : fb.TitleFormat("$replace(%path%,%filename_ext%,)").EvalWithMetadb(metadb));
		this._cachelist[d] = img;
		return img;
	}
}
var g_image_cache = new image_cache;

//=================================================// 封面工具
function FormatCover(image, w, h, reflect, rawBitmap) {
	if (!image || w <= 0 || h <= 0)
		return image;
	if (reflect) {
		var new_img = image.Resize(w, h, 2);
		var gb = new_img.GetGraphics();
		if (h > w) {
			gb.DrawImage(images.glass_reflect, Math.floor((h - w) / 2) * -1 + 1, 1, h - 2, h - 2, 0, 0, images.glass_reflect.Width, images.glass_reflect.Height, 0, 150);
		} else {
			gb.DrawImage(images.glass_reflect, 1, Math.floor((w - h) / 2) * -1 + 1, w - 2, w - 2, 0, 0, images.glass_reflect.Width, images.glass_reflect.Height, 0, 150);
		};
		new_img.ReleaseGraphics(gb);
		if (rawBitmap) {
			return new_img.CreateRawBitmap();
		} else {
			return new_img;
		};
	} else {
		if (rawBitmap) {
			return image.Resize(w, h, 2).CreateRawBitmap();
		} else {
			return image.Resize(w, h, 2);
		};
	};

};

function reset_cover_timers() {
	cover.load_timer && window.ClearTimeout(cover.load_timer);
	cover.load_timer = false;
};

//=================================================// WSH 统计更新函数
function update_statistics() {
	if (opt_stats && !foo_playcount && cStats.waiting_for_writing && cStats.handle) {
		var d;
		var timestamp;
		var s1,
		s2,
		s3,
		hh,
		min,
		sec;
		var new_playcounter;
		var p_count,
		p_counter;

		p_count = play_count.EvalWithMetadb(cStats.handle);
		p_counter = play_counter.EvalWithMetadb(cStats.handle);

		d = new Date();
		s1 = d.getFullYear();
		s2 = (d.getMonth() + 1);
		s3 = d.getDate();
		hh = d.getHours();
		min = d.getMinutes();
		sec = d.getSeconds();
		if (s3.length == 1)
			s3 = "0" + s3;
		timestamp = s1 + ((s2 < 10) ? "-0" : "-") + s2 + ((s3 < 10) ? "-0" : "-") + s3 + ((hh < 10) ? " 0" : " ") + hh + ((min < 10) ? ":0" : ":") + min + ((sec < 10) ? ":0" : ":") + sec;

		if (p_count >= 0 && p_counter == "?") {
			new_playcounter = Math.floor(p_count) + 1;
		} else if (p_counter == "?") {
			new_playcounter = 1;
		} else {
			new_playcounter = Math.floor(p_counter) + 1;
		};

		var firstplayed_ts = first_played.EvalWithMetadb(cStats.handle);

		var handles = new FbMetadbHandleList(cStats.handle);
		
		var obj = {
			"LAST_PLAYED" : timestamp,
			"PLAYCOUNTER" : new_playcounter,
			"PLAY_COUNT" : ""
		};
		
		if (firstplayed_ts == "?") {
			obj["FIRST_PLAYED"] = timestamp;
		}
		handles.UpdateFileInfoFromJSON(JSON.stringify(obj));
		cStats.waiting_for_writing = false;
		// 报告到控制台
		console.log("--- WSH 统计 ---");
		console.log("--- 曲目已更新：\"" + cStats.handle.Path + "\"");
	};
};

// ================================================================================================== //

function full_repaint() {
	need_repaint = true;
};

function resize_panels() {

	// 列表行高
	if (cList.enableExtraLine) {
		cRow.playlist_h = cRow.default_playlist_h + cRow.extra_line_h;
	} else {
		cRow.playlist_h = cRow.default_playlist_h;
	};
	cTrack.height = zoom(cRow.playlist_h, g_dpi);
	cTrack.parity = ((zoom(cRow.playlist_h, g_dpi) / 2) == Math.floor(zoom(cRow.playlist_h, g_dpi) / 2) ? 0 : 1);

	// 顶栏默认高度？
	if (cTopBar.visible) {
		var topbar_h = cTopBar.height + cHeaderBar.borderWidth;
	} else {
		var topbar_h = 0;
	};

	if (cHeaderBar.locked) {
		var headerbar_h = cHeaderBar.height;
		p.headerBar.visible = true;
	} else {
		var headerbar_h = (topbar_h == 0) ? 0 : 1;
		p.headerBar.visible = false;
	};

	// 播放列表管理器默认宽度/高度？
	var playlistManager_h = wh - topbar_h;
	cPlaylistManager.visible_on_launch = cPlaylistManager.visible;
	if (cPlaylistManager.visible) {
		if (g_init_on_size) { // 从设置返回时再次显示面板！
			cPlaylistManager.visible = true;
			p.playlistManager.woffset = 0;
			/*
			if(cPlaylistManager.visible_on_launch) {
			if(!cPlaylistManager.init_timer) {
			cPlaylistManager.init_timer = window.SetTimeout(function() {
			togglePlaylistManager();
			window.ClearTimeout(cPlaylistManager.init_timer);
			cPlaylistManager.init_timer = false;
			}, 150);
			};
			};
			*/
		} else {
			cPlaylistManager.visible = false;
			p.playlistManager.woffset = cPlaylistManager.width;
		};
	};

	// 列表默认高度？
	var list_h = wh - topbar_h - headerbar_h - (p.headerBar.visible ? cHeaderBar.borderWidth : 0);

	// 设置顶栏大小
	p.topBar.setSize(0, 0, ww, topbar_h);

	// 设置标题栏大小
	p.headerBar && p.headerBar.setSize(0, topbar_h, ww, cHeaderBar.height);
	p.headerBar.calculateColumns();

	// 设置列表大小
	p.list.setSize(0, (wh - list_h), ww, list_h);
	if (g_init_on_size) {
		p.list.setItems(true);
	};

	// 设置滚动条大小
	p.scrollbar.setSize(p.list.x + p.list.w - cScrollBar.width, p.list.y, cScrollBar.width, p.list.h);
	p.scrollbar.setCursor(p.list.totalRowVisible, p.list.totalRows, p.list.offset);

	// 设置设置面板大小
	p.settings.setSize(0, 0, ww, wh);

	// 设置播放列表管理器大小
	p.playlistManager.setSize(ww, p.list.y, cPlaylistManager.width, p.list.h);
	if (cPlaylistManager.visible) {
		p.playlistManager.refresh("", false, false);
	} else {
		p.playlistManager.refresh("", true, true);
	};
};

//=================================================// 初始化
function on_init() {
	plman.SetActivePlaylistContext();
	// 检测属性
	if (!properties.showgroupheaders) {
		cGroup.collapsed_height = 0;
		cGroup.expanded_height = 0;
	};

	p.list = new oList("p.list", plman.ActivePlaylist);
	p.topBar = new oTopBar();
	p.headerBar = new oHeaderBar();
	p.headerBar.initColumns();
	p.scrollbar = new oScrollbar(cScrollBar.themed);

	if (cPlaylistManager.mediaLibraryPlaylist)
		checkMediaLibrayPlaylist();

 	p.playlistManager = new oPlaylistManager("p.playlistManager");
	p.settings = new oSettings();

	g_timer1 = window.SetInterval(function () {
		images.loading_angle = (images.loading_angle < 360 ? images.loading_angle + 36 : 36);

		if (!window.IsVisible) {
			need_repaint = true;
			return;
		};

		if (need_repaint) {
			need_repaint = false;
			window.Repaint();
		};
	}, 40);
};
on_init();

//=================================================// OnSize
function on_size() {
	if (!window.Width || !window.Height)
		return;
	window.DlgCode = DLGC_WANTALLKEYS;

	if (g_instancetype == 0) { // CUI
		window.MinWidth = 360;
		window.MinHeight = 200;
	} else if (g_instancetype == 1) { // DUI
		window.MinWidth = zoom(360, g_dpi);
		window.MinHeight = zoom(200, g_dpi);
	};

	ww = window.Width;
	wh = window.Height;

	resize_panels();

	// 设置壁纸
	if (fb.IsPlaying) {
		p.wallpaperImg = setWallpaperImg(properties.wallpaperpath, fb.GetNowPlaying());
	} else {
		p.wallpaperImg = null;
	};

	// 在播放列表设置中为封面列大小设置空行数！
	if (p.headerBar.columns[0].percent > 0) {
		//cover.resized = true;
		cover.column = true;
		cGroup.count_minimum = Math.ceil((p.headerBar.columns[0].w) / cTrack.height);
		if (cGroup.count_minimum < cGroup.default_count_minimum)
			cGroup.count_minimum = cGroup.default_count_minimum;
	} else {
		cover.column = false;
		cGroup.count_minimum = cGroup.default_count_minimum;
	};
	cover.previous_max_size = p.headerBar.columns[0].w;

	if (!g_init_on_size) {
		properties.collapseGroupsByDefault = (p.list.groupby[cGroup.pattern_idx].collapseGroupsByDefault == 0 ? false : true);
		update_playlist(properties.collapseGroupsByDefault);
		if (cPlaylistManager.visible_on_launch) {
			if (!cPlaylistManager.init_timer) {
				cPlaylistManager.init_timer = window.SetTimeout(function () {
						togglePlaylistManager();
						window.ClearTimeout(cPlaylistManager.init_timer);
						cPlaylistManager.init_timer = false;
					}, 150);
			};
		};
		g_init_on_size = true;
	};
};

//=================================================// OnPaint
function on_paint(gr) {

	if (!ww)
		return true;

 	if (!cSettings.visible) {

		// 绘制播放列表下方背景
		if (fb.IsPlaying && p.wallpaperImg && properties.showwallpaper) {
			gr.GdiDrawBitmap(p.wallpaperImg, 0, p.list.y, ww, wh - p.list.y, 0, p.list.y, p.wallpaperImg.Width, p.wallpaperImg.Height - p.list.y);
			gr.FillSolidRect(0, p.list.y, ww, wh - p.list.y, g_color_normal_bg & RGBA(255, 255, 255, properties.wallpaperalpha));
		} else {
			gr.FillSolidRect(0, p.list.y, ww, wh - p.list.y, g_color_normal_bg);
		};

		// 列表
		if (p.list) {
			if (p.list.count > 0) {
				// 在绘制行内容前计算列尺寸！
				p.headerBar.calculateColumns();

				// 滚动条
				if (properties.showscrollbar && p.scrollbar && p.list.totalRows > 0 && (p.list.totalRows > p.list.totalRowVisible)) {
					p.scrollbar.visible = true;
					p.scrollbar.draw(gr);
				} else {
					p.scrollbar.visible = false;
				};

				// 绘制播放列表的行
				p.list && p.list.draw(gr);

				// 鼠标滚轮滚动到极限时绘制闪烁光束！（类似 android 效果）
				if (p.list.beam > 0) {
					var r = getRed(g_color_highlight);
					var g = getGreen(g_color_highlight);
					var b = getBlue(g_color_highlight);
					var a = Math.floor((p.list.beam_alpha <= 250 ? p.list.beam_alpha : 250) / 12);
					var beam_h = Math.floor(cTrack.height * 7 / 4);
					var alpha = (p.list.beam_alpha <= 255 ? p.list.beam_alpha : 255);
					switch (p.list.beam) {
					case 1: // 顶部光束
						gr.DrawImage(images.beam, p.list.x, p.list.y - cHeaderBar.borderWidth * 10, p.list.w, beam_h - cHeaderBar.borderWidth, 0, 0, images.beam.Width, images.beam.Height, 180, alpha);
						break;
					case 2: // 底部光束
						gr.DrawImage(images.beam, p.list.x, p.list.y + p.list.h - beam_h + cHeaderBar.borderWidth * 10, p.list.w, beam_h, 0, 0, images.beam.Width, images.beam.Height, 0, alpha);
						break;
					};
				};

			} else {

				if (plman.PlaylistCount > 0) {
					var text_top = plman.GetPlaylistName(plman.ActivePlaylist);
					var text_bot = "此播放列表为空";
				} else {
					var text_top = "JSPlaylist " + g_script_version + " 由 Br3tt 编写 - 2015";
					var text_bot = "创建一个播放列表开始吧！";
				};
				// 若为搜索播放列表，绘制"无结果"图像
				if (text_top.substr(0, 8) == "Search [") {
					gr.SetTextRenderingHint(3);
					var search_text = text_top.substr(8, text_top.length - 9);
					gr.DrawString("未找到 \"" + search_text + "\"", gdi_font(g_fname, g_fsize + 7, 0), g_color_normal_txt & 0x40ffffff, 0, 0 - zoom(20, g_dpi), ww, wh, cc_stringformat);
					gr.DrawString(text_bot, gdi_font(g_fname, g_fsize + 2, 0), g_color_normal_txt & 0x40ffffff, 0, 0 + zoom(20, g_dpi), ww, wh, cc_stringformat);
					gr.FillGradRect(40, Math.floor(wh / 2), ww - 80, Math.floor(zoom(1, g_dpi)), 0, 0, g_color_normal_txt & 0x40ffffff, 0.5);
				} else {
					// 若播放列表为空，显示文本信息
					gr.SetTextRenderingHint(3);
					gr.DrawString(text_top, gdi_font(g_fname, g_fsize + 7, 0), g_color_normal_txt & 0x40ffffff, 0, 0 - zoom(20, g_dpi), ww, wh, cc_stringformat);
					gr.DrawString(text_bot, gdi_font(g_fname, g_fsize + 2, 0), g_color_normal_txt & 0x40ffffff, 0, 0 + zoom(20, g_dpi), ww, wh, cc_stringformat);
					gr.FillGradRect(40, Math.floor(wh / 2), ww - 80, Math.floor(zoom(1, g_dpi)), 0, 0, g_color_normal_txt & 0x40ffffff, 0.5);
				};
			};
		};

		// 绘制播放列表上方背景部分（顶栏 + 标题栏）
		if (cTopBar.visible || p.headerBar.visible) {
			if (fb.IsPlaying && p.wallpaperImg && properties.showwallpaper) {
				gr.GdiDrawBitmap(p.wallpaperImg, 0, 0, ww, p.list.y, 0, 0, p.wallpaperImg.Width, p.list.y);
				gr.FillSolidRect(0, 0, ww, p.list.y, g_color_normal_bg & RGBA(255, 255, 255, properties.wallpaperalpha));
			} else {
				gr.FillSolidRect(0, 0, ww, p.list.y, g_color_normal_bg);
			};
		};

		// 顶栏
		if (cTopBar.visible) {
			p.topBar && p.topBar.draw(gr);
		}

		// 标题栏
		if (p.headerBar.visible) {
			p.headerBar && p.headerBar.drawColumns(gr);
			if (p.headerBar.borderDragged && p.headerBar.borderDraggedId >= 0) {
				// 所有边框
				var fin = p.headerBar.borders.length;
				for (var b = 0; b < fin; b++) {
					var lg_x = p.headerBar.borders[b].x - 2;
					var lg_w = p.headerBar.borders[b].w;
					var segment_h = zoom(5, g_dpi);
					var gap_h = zoom(5, g_dpi);
					if (b == p.headerBar.borderDraggedId) {
						var d = ((mouse_x / zoom(10, g_dpi)) - Math.floor(mouse_x / zoom(10, g_dpi))) * zoom(10, g_dpi); // 给出 [0;9] 之间的值
					} else {
						d = 5;
					};
					var ty = 0;
					for (var lg_y = p.list.y; lg_y < p.list.y + p.list.h + segment_h; lg_y += segment_h + gap_h) {
						ty = lg_y - segment_h + d;
						th = segment_h;
						if (ty < p.list.y) {
							th = th - Math.abs(p.list.y - ty);
							ty = p.list.y;
						}
						if (b == p.headerBar.borderDraggedId) {
							gr.FillSolidRect(lg_x, ty, lg_w, th, g_color_normal_txt & 0x32ffffff);
						} else {
							gr.FillSolidRect(lg_x, ty, lg_w, th, g_color_normal_txt & 0x16ffffff);
						};
					};
				};
			};
		} else {
			p.headerBar && p.headerBar.drawHiddenPanel(gr);
		};

		// 播放列表管理器
		p.playlistManager && p.playlistManager.draw(gr);

		// 增量搜索显示
		if (cList.search_string.length > 0) {
			gr.SetSmoothingMode(2);
			p.list.tt_x = Math.floor(((p.list.w) / 2) - (((cList.search_string.length * zoom(13, g_dpi)) + (zoom(10, g_dpi) * 2)) / 2));
			p.list.tt_y = p.list.y + Math.floor((p.list.h / 2) - zoom(30, g_dpi));
			p.list.tt_w = Math.round((cList.search_string.length * zoom(13, g_dpi)) + (zoom(10, g_dpi) * 2));
			p.list.tt_h = zoom(60, g_dpi);
			gr.FillRoundRect(p.list.tt_x, p.list.tt_y, p.list.tt_w, p.list.tt_h, 5, 5, RGBA(0, 0, 0, 150));
			gr.DrawRoundRect(p.list.tt_x, p.list.tt_y, p.list.tt_w, p.list.tt_h, 5, 5, 1.0, RGBA(0, 0, 0, 100));
			gr.DrawRoundRect(p.list.tt_x + 1, p.list.tt_y + 1, p.list.tt_w - 2, p.list.tt_h - 2, 4, 4, 1.0, RGBA(255, 255, 255, 050));
			try {
				gr.GdiDrawText(cList.search_string, cList.incsearch_font_big, RGB(0, 0, 0), p.list.tt_x + 1, p.list.tt_y + 1, p.list.tt_w, p.list.tt_h, DT_CENTER | DT_NOPREFIX | DT_CALCRECT | DT_VCENTER);
				gr.GdiDrawText(cList.search_string, cList.incsearch_font_big, cList.inc_search_noresult ? RGB(255, 70, 70) : RGB(250, 250, 250), p.list.tt_x, p.list.tt_y, p.list.tt_w, p.list.tt_h, DT_CENTER | DT_NOPREFIX | DT_CALCRECT | DT_VCENTER);
			} catch (e) {};
		};

	} else {
		// 设置...
		p.settings && p.settings.draw(gr);
	};

	if (properties.showDPI) {
		gr.FillSolidRect(ww - 33, 5, 30, 15, g_color_normal_bg);
		gr.GdiDrawText(g_dpi, gdi_font("segoe ui", 15, 1), RGB(75, 255, 75), 0, 2, ww - 5, wh - 5, DT_RIGHT | DT_TOP);
	};
};

//=================================================// 鼠标回调
function on_mouse_lbtn_down(x, y) {

	if (properties.enableTouchControl) {
		cTouch.up_id = -1;
		if (cSettings.visible) {
			cTouch.down = true;
			cTouch.y_start = y;
		} else {
			if (p.list.isHoverObject(x, y) && !p.scrollbar.isHoverObject(x, y)) {
				cTouch.down = true;
				cTouch.y_start = y;
			};
		};
	};

	g_left_click_hold = true;

	// 检测设置
	if (cSettings.visible) {
		p.settings.on_mouse("down", x, y);
	} else {

		cover.previous_max_size = p.headerBar.columns[0].w;

		// 检测列表
		p.list.check("down", x, y);

		// 检测滚动条
		if (!cPlaylistManager.visible) {
			if (p.playlistManager.woffset == 0 && properties.showscrollbar && p.scrollbar && p.list.totalRows > 0 && (p.list.totalRows > p.list.totalRowVisible)) {
				p.scrollbar.check("down", x, y);
			};

			// 检测点击光标上方或下方时的滚动条滚动
			if (p.scrollbar.hover && !p.scrollbar.cursorDrag) {
				var scrollstep = p.list.totalRowVisible;
				if (y < p.scrollbar.cursorPos) {
					if (!p.list.buttonclicked && !cScrollBar.timerID1) {
						p.list.buttonclicked = true;
						p.list.scrollItems(1, scrollstep);
						cScrollBar.timerID1 = window.SetTimeout(function () {
								p.list.scrollItems(1, scrollstep);
								cScrollBar.timerID1 && window.ClearTimeout(cScrollBar.timerID1);
								cScrollBar.timerID1 = false;
								cScrollBar.timerID2 && window.ClearInterval(cScrollBar.timerID2);
								cScrollBar.timerID2 = window.SetInterval(function () {
										if (p.scrollbar.hover) {
											if (mouse_x > p.scrollbar.x && p.scrollbar.cursorPos > mouse_y) {
												p.list.scrollItems(1, scrollstep);
											};
										};
									}, 60);
							}, 400);
					};
				} else {
					if (!p.list.buttonclicked && !cScrollBar.timerID1) {
						p.list.buttonclicked = true;
						p.list.scrollItems(-1, scrollstep);
						cScrollBar.timerID1 = window.SetTimeout(function () {
								p.list.scrollItems(-1, scrollstep);
								cScrollBar.timerID1 && window.ClearTimeout(cScrollBar.timerID1);
								cScrollBar.timerID1 = false;
								cScrollBar.timerID2 && window.ClearInterval(cScrollBar.timerID2);
								cScrollBar.timerID2 = window.SetInterval(function () {
										if (p.scrollbar.hover) {
											if (mouse_x > p.scrollbar.x && p.scrollbar.cursorPos + p.scrollbar.cursorHeight < mouse_y) {
												p.list.scrollItems(-1, scrollstep);
											};
										};
									}, 60);
							}, 400)
					};
				};
			};
		} else {
			p.playlistManager.check("down", x, y);
		};

		// 检测顶栏
		if (cTopBar.visible)
			p.topBar.check("down", x, y);
		// 检测标题栏
		if (p.headerBar.visible)
			p.headerBar.on_mouse("down", x, y);
	};
};

function on_mouse_lbtn_dblclk(x, y, mask) {

	g_left_click_hold = true;

	// 检测设置
	if (cSettings.visible) {
		p.settings.on_mouse("dblclk", x, y);
	} else {
		// 检测列表
		p.list.check("dblclk", x, y);
		// 检测标题栏
		if (p.headerBar.visible)
			p.headerBar.on_mouse("dblclk", x, y);

		// 检测滚动条
		if (!cPlaylistManager.visible) {
			if (properties.showscrollbar && p.scrollbar && p.list.totalRows > 0 && (p.list.totalRows > p.list.totalRowVisible)) {
				p.scrollbar.check("dblclk", x, y);
				if (p.scrollbar.hover) {
					on_mouse_lbtn_down(x, y); // ……以便双击光标上方或下方的滚动条区域时产生滚动响应！
				};
			};
		} else {
			p.playlistManager.check("dblclk", x, y);
		};
	};
};

function on_mouse_lbtn_up(x, y) {

	// 检测设置
	if (cSettings.visible) {
		p.settings.on_mouse("up", x, y);
	} else {

		// 滚动条上下滚动重置
		p.list.buttonclicked = false;
		cScrollBar.timerID1 && window.ClearTimeout(cScrollBar.timerID1);
		cScrollBar.timerID1 = false;
		cScrollBar.timerID2 && window.ClearTimeout(cScrollBar.timerID2);
		cScrollBar.timerID2 = false;

		// 封面列调整大小后，更新封面图像缓存
		if (cover.resized == true) {
			cover.resized = false;
			// 重置缓存
			if (!g_first_launch) {
				cover.max_w = (cGroup.default_collapsed_height > cGroup.default_expanded_height ? cGroup.default_collapsed_height * cTrack.height : cGroup.default_expanded_height * cTrack.height);
				g_image_cache = new image_cache;
			} else {
				g_first_launch = false;
			};
			update_playlist(properties.collapseGroupsByDefault);
		};

		// 检测列表
		p.list.check("up", x, y);

		// 播放列表管理器（若可见）
		if (p.playlistManager.woffset > 0 || cPlaylistManager.visible) {
			p.playlistManager.check("up", x, y);
		};

		// 检测滚动条
		if (properties.showscrollbar && p.scrollbar && p.list.totalRows > 0 && (p.list.totalRows > p.list.totalRowVisible)) {
			p.scrollbar.check("up", x, y);
		};

		// 在播放列表内部拖放后放置项目
		if (!properties.enableTouchControl) {
			if (p.list.ishover && dragndrop.drag_in) {
				if (dragndrop.drag_id >= 0 && dragndrop.drop_id >= 0) {
					var save_focus_handle = fb.GetFocusItem();
					var drop_handle = p.list.handleList[dragndrop.drop_id];
					var nb_selected_items = p.list.metadblist_selection.Count;

					if (dragndrop.contigus_sel && nb_selected_items > 0) {
						if (dragndrop.drop_id > dragndrop.drag_id) {
							// 向下移动时指向选区的最后一个项目
							var new_drag_pos = p.list.handleList.Find(p.list.metadblist_selection[nb_selected_items - 1]);
							var move_delta = dragndrop.drop_id - new_drag_pos;
						} else {
							// 向上移动时指向选区的第一个项目
							var new_drag_pos = p.list.handleList.Find(p.list.metadblist_selection[0]);
							var move_delta = dragndrop.drop_id - new_drag_pos;
						};

						plman.UndoBackup(p.list.playlist);
						plman.MovePlaylistSelection(p.list.playlist, move_delta);

					} else {

						// 1：将所选项目移到播放列表末尾，使其连续
						g_avoid_on_item_focus_change = true;
						g_avoid_on_playlist_items_reordered = true;
						plman.UndoBackup(p.list.playlist);
						plman.MovePlaylistSelection(p.list.playlist, plman.PlaylistItemCount(p.list.playlist));
						// 2：将底部选区移到新的 drop_id 位置（先重新定义……）
						plman.SetPlaylistFocusItemByHandle(p.list.playlist, drop_handle);
						var drop_id_new = plman.GetPlaylistFocusItemIndex(p.list.playlist);
						plman.SetPlaylistFocusItemByHandle(p.list.playlist, save_focus_handle);
						if (dragndrop.drag_id > drop_id_new) {
							var mdelta = p.list.count - nb_selected_items - drop_id_new;
						} else {
							var mdelta = p.list.count - nb_selected_items - drop_id_new - 1;
						};
						plman.MovePlaylistSelection(p.list.playlist, mdelta * -1);
						g_avoid_on_playlist_items_reordered = false;
						g_avoid_on_item_focus_change = false;
					};
				};
			};
		};

		dragndrop.drag_id = -1;
		dragndrop.drop_id = -1;
		dragndrop.drag_in = false;
		dragndrop.moved = false;
		dragndrop.clicked = false;
		dragndrop.moved = false;
		dragndrop.x = 0;
		dragndrop.y = 0;
		dragndrop.timerID && window.ClearTimeout(dragndrop.timerID);
		dragndrop.timerID = false;
		//window.SetCursor(IDC_ARROW);

		// 检测顶栏
		if (cTopBar.visible)
			p.topBar.check("up", x, y);

		// 检测标题栏
		if (p.headerBar.visible)
			p.headerBar.on_mouse("up", x, y);

		// 鼠标抬起时重绘，以刷新刚加载的封面
		full_repaint();
	};

	if (cTouch.down) {
		cTouch.down = false;
		cTouch.y_start = y;
		cTouch.down_id = cTouch.up_id;
	};

	g_left_click_hold = false;
};

function on_mouse_rbtn_up(x, y) {
	if (cSettings.visible) {
		p.settings.on_mouse("right", x, y);
	} else {
		// 检测列表
		p.list.check("right", x, y);
		// 检测顶栏
		if (cTopBar.visible)
			p.topBar.check("right", x, y);
		// 检测标题栏
		if (p.headerBar.visible)
			p.headerBar.on_mouse("right", x, y);
		// 播放列表管理器
		if (p.playlistManager.ishoverItem || p.playlistManager.ishoverHeader) {
			p.playlistManager.check("right", x, y);
		};
	};
	return true;
};

function on_mouse_move(x, y) {

	if (x == mouse_x && y == mouse_y)
		return true;

	if (x >= 0 && x < ww && y >= 0 && y < wh)
		g_leave = false;

	// 检测设置
	if (cSettings.visible) {

		if (cTouch.down) {
			cTouch.y_end = y;
			var y_delta = (cTouch.y_end - cTouch.y_start);
			if (x < p.list.w) {
				if (y_delta > p.settings.h / cSettings.rowHeight) {
					on_mouse_wheel(1); // 向上滚动
					cTouch.y_start = cTouch.y_end;
				};
				if (y_delta < -p.settings.h / cSettings.rowHeight) {
					on_mouse_wheel(-1); // 向下滚动
					cTouch.y_start = cTouch.y_end;
				};
			};
		};
		p.settings.on_mouse("move", x, y);

	} else {

		if (cTouch.down) {

			if (p.headerBar.columnDragged < 1 && !p.headerBar.borderDragged) {
				cTouch.y_end = y;
				var y_delta = (cTouch.y_end - cTouch.y_start);
				if (x < p.list.w) {
					if (y_delta > p.list.h / cTrack.height) {
						on_mouse_wheel(1); // 向上滚动
						cTouch.y_start = cTouch.y_end;
					};
					if (y_delta < -p.list.h / cTrack.height) {
						on_mouse_wheel(-1); // 向下滚动
						cTouch.y_start = cTouch.y_end;
					};
				};
			};

		} else {

			// 播放列表管理器（若可见）
			if (p.playlistManager.woffset > 0) {
				if (!cPlaylistManager.blink_timer) {
					p.playlistManager.check("move", x, y);
				};
			};

			// 检测列表
			p.list.check("move", x, y);

			// 检测滚动条
			if (!cPlaylistManager.visible) {
				if (properties.showscrollbar && p.scrollbar && p.list.totalRows > 0 && (p.list.totalRows > p.list.totalRowVisible)) {
					p.scrollbar.check("move", x, y);
				};
			};

			// 检测顶栏
			if (cTopBar.visible)
				p.topBar.check("move", x, y);

			// 检测标题栏
			if (p.headerBar.visible)
				p.headerBar.on_mouse("move", x, y);

			// 若封面列调整了大小（或初始化），刷新列封面、最小数量……以及播放列表
			if (cover.previous_max_size != p.headerBar.columns[0].w) {
				cover.resized = true;
				if (p.headerBar.columns[0].w > 0) {
					cover.column = true;
					cGroup.count_minimum = Math.ceil((p.headerBar.columns[0].w) / cTrack.height);
					if (cGroup.count_minimum < cGroup.default_count_minimum)
						cGroup.count_minimum = cGroup.default_count_minimum;
				} else {
					cover.column = false;
					cGroup.count_minimum = cGroup.default_count_minimum;
				};
				cover.previous_max_size = p.headerBar.columns[0].w;
			};

			// 检测工具栏的鼠标图标拖动模式 ***
			if (p.list.mclicked && !p.headerBar.borderDragged && !p.headerBar.columnDragged) {
				if (p.list.ishover || p.playlistManager.ishover || p.playlistManager.ishoverHeader) {
					if (dragndrop.enabled && (dragndrop.drag_in || dragndrop.moved)) {
						if ((p.playlistManager.ishover && p.playlistManager.hoverId == -1) || p.playlistManager.scrollbar.isHoverScrollbar) {
							if (!p.playlistManager.ishoverHeader) {
								window.SetCursor(IDC_NO);
							} else {
								window.SetCursor(IDC_HELP);
							};
						} else {
							if (p.playlistManager.ishover && (p.playlistManager.playlists[p.playlistManager.hoverId].isAutoPlaylist || p.playlistManager.playlists[p.playlistManager.hoverId].isReservedPlaylist || p.playlistManager.playlists[p.playlistManager.hoverId].idx == plman.ActivePlaylist)) {
								window.SetCursor(IDC_NO);
							} else {
								window.SetCursor(IDC_HELP);
							};
						};
					} else {
						window.SetCursor(IDC_ARROW);
					};
				} else {
					if (dragndrop.enabled && (dragndrop.drag_in || dragndrop.moved)) {
						window.SetCursor(IDC_NO);
					} else {
						window.SetCursor(IDC_ARROW);
					};
				};
			};
			if (cPlaylistManager.drag_moved) {
				if (p.playlistManager.ishoverItem) {
					window.SetCursor(IDC_HELP);
				} else {
					window.SetCursor(IDC_NO);
				};
			};

			// 若在播放列表上拖动音轨，必要时滚动播放列表
			if (dragndrop.drag_in) {
				// 拖放
				if (p.playlistManager.woffset == 0 || (cPlaylistManager.visible && x < p.playlistManager.x - p.playlistManager.woffset)) {
					if (y < p.list.y) {
						if (!p.list.buttonclicked) {
							p.list.buttonclicked = true;
							//
							var scroll_speed_ms = 5;
							//
							if (!cScrollBar.timerID1) {
								cScrollBar.timerID1 = window.SetInterval(function () {
										on_mouse_wheel(1);
									}, scroll_speed_ms);
							};
						} else {
							full_repaint();
						};
					} else if (y > p.list.y + p.list.h) {
						if (!p.list.buttonclicked) {
							p.list.buttonclicked = true;
							//
							var scroll_speed_ms = 5;
							//
							if (!cScrollBar.timerID1) {
								cScrollBar.timerID1 = window.SetInterval(function () {
										on_mouse_wheel(-1);
									}, scroll_speed_ms);
							};
						} else {
							full_repaint();
						};
					} else {
						cScrollBar.timerID1 && window.ClearInterval(cScrollBar.timerID1);
						cScrollBar.timerID1 = false;
						p.list.buttonclicked = false;
						if (!dragndrop.timerID) {
							dragndrop.timerID = window.SetTimeout(function () {
									full_repaint();
									dragndrop.timerID && window.ClearTimeout(dragndrop.timerID);
									dragndrop.timerID = false;
								}, 75);
						};
					};
				} else {
					cScrollBar.timerID1 && window.ClearInterval(cScrollBar.timerID1);
					cScrollBar.timerID1 = false;
				};
			};
		};
	};

	// 保存坐标
	mouse_x = x;
	mouse_y = y;
};

function on_mouse_wheel(delta) {

	if (g_middle_clicked)
		return;

	if (utils.IsKeyPressed(VK_CONTROL)) {
		var zoomStep = 15;
		if (delta > 0) {
			g_forced_percent = (g_forced_percent < g_dpi_percent ? g_dpi_percent + zoomStep : g_forced_percent + zoomStep);
			if (g_forced_percent > 250)
				g_forced_percent = 250;
		} else {
			g_forced_percent -= zoomStep;
			if (g_forced_percent <= g_dpi_percent)
				g_forced_percent = 0;
		};
		window.SetProperty("系统.DPI（0=默认）", g_forced_percent);
		g_dpi = (g_forced_percent == 0 ? g_dpi_percent : g_forced_percent);
		adjustMetrics(1);
		resize_panels();
		full_repaint();
	} else {
		// 检测设置
		if (cSettings.visible) {
			p.settings.on_mouse("wheel", mouse_x, mouse_y, delta);
			if (cSettings.wheel_timer) {
				window.ClearTimeout(cSettings.wheel_timer);
				cSettings.wheel_timer = false;
			};
			cSettings.wheel_timer = window.SetTimeout(function () {
					on_mouse_move(mouse_x + 1, mouse_y + 1);
					window.ClearTimeout(cSettings.wheel_timer);
					cSettings.wheel_timer = false;
				}, 50);
		} else {

			// 处理 p.list 光束
			var limit_reached = false;
			var maxOffset = (p.list.totalRows > p.list.totalRowVisible ? p.list.totalRows - p.list.totalRowVisible : 0);
			if (maxOffset > 0) {
				if (delta > 0) { // 请求向上滚动
					if (p.list.offset == 0) {
						// 要绘制的顶部光束
						p.list.beam = 1;
						cList.beam_sens = 1;
						limit_reached = true;
					};
				} else { // 请求向下滚动
					if (p.list.offset >= maxOffset) {
						// 要绘制的底部光束
						p.list.beam = 2;
						cList.beam_sens = 1;
						limit_reached = true;
					};
				};
				if (limit_reached) {
					if (!cList.beam_timer) {
						p.list.beam_alpha = 0;
						cList.beam_timer = window.SetInterval(function () {
								if (cList.beam_sens == 1) {
									p.list.beam_alpha = (p.list.beam_alpha <= 275 ? p.list.beam_alpha + 25 : 300);
									if (p.list.beam_alpha >= 300) {
										cList.beam_sens = 2;
									};
								} else {
									p.list.beam_alpha = (p.list.beam_alpha >= 25 ? p.list.beam_alpha - 25 : 0);
									if (p.list.beam_alpha <= 0) {
										p.list.beam = 0;
										window.ClearInterval(cList.beam_timer);
										cList.beam_timer = false;
									};
								};
								full_repaint();
							}, 32);
					};
				};
			};

			reset_cover_timers();

			if (p.list.ishover || cScrollBar.timerID1 || cList.repaint_timer) {
				// 计时器，用于告知其他函数（异步封面加载完成等）重绘已在进行
				if (!g_mouse_wheel_timer) {
					// 设置滚动速度/距面板边界的鼠标 y 偏移
					if (g_dragndrop_status) {
						if (g_dragndrop_y < p.list.y + cTrack.height) {
							var s = Math.abs(g_dragndrop_y - (p.list.y + cTrack.height));
							var h = Math.ceil(cTrack.height / 2);
							if (s > h)
								s = h;
							var t = h - s + 1;
							var r = Math.round(500 / h);
							var scroll_speed_ms = ((t * r) < 10 ? 10 : (t * r));
						} else if (g_dragndrop_y > p.list.y + p.list.h - cTrack.height) {
							var s = Math.abs(g_dragndrop_y - (p.list.y + p.list.h - cTrack.height));
							var h = Math.ceil(cTrack.height / 2);
							if (s > h)
								s = h;
							var t = h - s + 1;
							var r = Math.round(500 / h);
							var scroll_speed_ms = ((t * r) < 10 ? 10 : (t * r));
						} else {
							scroll_speed_ms = 20;
						};
					} else {
						if (mouse_y < p.list.y) {
							var s = Math.abs(mouse_y - p.list.y);
							var h = Math.ceil(cTrack.height / 2);
							if (s > h)
								s = h;
							var t = h - s + 1;
							var r = Math.round(500 / h);
							var scroll_speed_ms = ((t * r) < 10 ? 10 : (t * r));
						} else if (mouse_y > p.list.y + p.list.h) {
							var s = Math.abs(mouse_y - (p.list.y + p.list.h));
							var h = Math.ceil(cTrack.height / 2);
							if (s > h)
								s = h;
							var t = h - s + 1;
							var r = Math.round(500 / h);
							var scroll_speed_ms = ((t * r) < 10 ? 10 : (t * r));
						} else {
							scroll_speed_ms = 20;
						};
					};
					//
					g_mouse_wheel_timer = window.SetTimeout(function () {
							var cw = cover.column ? ((p.headerBar.columns[0].w <= cover.max_w) ? cover.max_w : p.headerBar.columns[0].w) : cover.max_w;
							var ch = cw;
							p.list.scrollItems(delta, properties.enableTouchControl ? cList.touchstep : cList.scrollstep);
							g_mouse_wheel_timer && window.ClearTimeout(g_mouse_wheel_timer);
							g_mouse_wheel_timer = false;
						}, scroll_speed_ms);
				};
			} else {
				if (!dragndrop.moved) {
					p.playlistManager.check("wheel", mouse_x, mouse_y, delta);
				};
			};
		};
	};
};

function on_mouse_mbtn_down(x, y, mask) {
	g_middle_clicked = true;
	togglePlaylistManager();
};

function on_mouse_mbtn_dblclk(x, y, mask) {
	on_mouse_mbtn_down(x, y, mask);
};

function on_mouse_mbtn_up(x, y, mask) {
	if (g_middle_click_timer) {
		window.ClearTimeout(g_middle_click_timer);
		g_middle_click_timer = false;
	};
	g_middle_click_timer = window.SetTimeout(function () {
			g_middle_clicked = false;
			window.ClearTimeout(g_middle_click_timer);
			g_middle_click_timer = false;
		}, 250);
};

function on_mouse_leave() {
	g_leave = true;

	p.list.check("leave", 0, 0);

	if (properties.showscrollbar && p.scrollbar && p.list.totalRows > 0 && (p.list.totalRows > p.list.totalRowVisible)) {
		p.scrollbar.check("leave", 0, 0);
	};

	p.topBar.check("leave", 0, 0);

	p.headerBar.on_mouse("leave", 0, 0);

	p.playlistManager.check("leave", 0, 0);
};

//=================================================// 回调

function update_playlist(iscollapsed) {
	g_group_id_focused = 0;
	p.list.updateHandleList(plman.ActivePlaylist, iscollapsed);

	p.list.setItems(false);
	p.scrollbar.setCursor(p.list.totalRowVisible, p.list.totalRows, p.list.offset);
	// 若请求了按列头点击排序，将鼠标光标重置为默认
	if (cHeaderBar.sortRequested) {
		window.SetCursor(IDC_ARROW);
		cHeaderBar.sortRequested = false;
	};
};

function on_playlist_switch() {
	update_playlist(properties.collapseGroupsByDefault);
	p.topBar.setDatas();
	p.headerBar.resetSortIndicators();
	full_repaint();
};

function on_playlists_changed() {

	if (!g_avoid_on_playlists_changed) {

		if (cPlaylistManager.mediaLibraryPlaylist)
			checkMediaLibrayPlaylist();

		// 若正在拖动音轨则关闭计时器
		if (dragndrop.drag_in || dragndrop.moved) {
			if (dragndrop.timerID) {
				window.ClearTimeout(dragndrop.timerID);
				dragndrop.timerID = false;
			};
			dragndrop.drag_in = false;
			dragndrop.moved = false;
			dragndrop.x = 0;
			dragndrop.y = 0;
			if (!cPlaylistManager.visible) {
				if (cPlaylistManager.hscroll_timer) {
					window.ClearTimeout(cPlaylistManager.hscroll_timer);
					cPlaylistManager.hscroll_timer = false;
				};
				p.playlistManager.woffset = 0;
				if (cPlaylistManager.vscroll_timer) {
					window.ClearTimeout(cPlaylistManager.vscroll_timer);
					cPlaylistManager.vscroll_timer = false;
				};
				p.playlistManager.woffset = 0;
				on_mouse_move(mouse_x + 1, mouse_y); // 将窗口光标样式重置为简单箭头
			};
		};

		p.list.playlist = plman.ActivePlaylist;
		p.topBar.setDatas();
		if (cPlaylistManager.visible) {
			if (cPlaylistManager.drag_droped) { // 若通过拖动移动了播放列表项目，不重置滚动偏移
				window.SetCursor(IDC_ARROW);
				p.playlistManager.refresh("", false, false, false);
			} else {
				p.playlistManager.refresh("", false, false);
			};
		} else {
			p.playlistManager.refresh("", true, true);
		};
		full_repaint();
	};
};

function on_playlist_items_added(playlist_idx) {
	if (!g_avoid_on_playlist_items_added) {
		if (playlist_idx == p.list.playlist) {
			update_playlist(properties.collapseGroupsByDefault);
			p.topBar.setDatas();
			p.headerBar.resetSortIndicators();
			full_repaint();
		};
	};
};

function on_playlist_items_removed(playlist_idx, new_count) {
	if (!g_avoid_on_playlist_items_removed) {
		if (playlist_idx == p.list.playlist) {
			update_playlist(properties.collapseGroupsByDefault);
			p.topBar.setDatas();
			p.headerBar.resetSortIndicators();
			full_repaint();
		};
	};
};

function on_playlist_items_reordered(playlist_idx) {
	if (!g_avoid_on_playlist_items_reordered) {
		if (playlist_idx == p.list.playlist && p.headerBar.columnDragged == 0) {
			update_playlist(properties.collapseGroupsByDefault);
			p.headerBar.resetSortIndicators();
			full_repaint();
		} else {
			p.headerBar.columnDragged = 0;
		};
	};
};

function on_playlist_items_selection_change() {
	full_repaint();
};

function on_selection_changed(metadb) {};

function on_item_focus_change(playlist, from, to) {
	if (!g_avoid_on_item_focus_change) {
		g_metadb = (fb.IsPlaying || fb.IsPaused) ? fb.GetNowPlaying() : plman.PlaylistItemCount(plman.ActivePlaylist) > 0 ? fb.GetFocusItem() : false;
		if (g_metadb) {
			on_metadb_changed();
		} else {
			g_path = "";
			g_track_type = "";
		};
		if (playlist == p.list.playlist) {
			p.list.focusedTrackId = to;
			var center_focus_item = p.list.isFocusedItemVisible();

			if (properties.autocollapse) { // && !center_focus_item
				var grpId = p.list.getGroupIdfromTrackId(to);
				if (grpId >= 0) {
					if (p.list.groups[grpId].collapsed) {
						p.list.updateGroupStatus(grpId);
						p.list.setItems(true);
						center_focus_item = p.list.isFocusedItemVisible();
					} else {
						if ((!center_focus_item && !p.list.drawRectSel) || (center_focus_item && to == 0)) {
							p.list.setItems(true);
						};
					};
				};
			} else {
				if ((!center_focus_item && !p.list.drawRectSel) || (center_focus_item && to == 0)) {
					p.list.setItems(true);
				};
			};
			p.scrollbar.setCursor(p.list.totalRowVisible, p.list.totalRows, p.list.offset);
		};
	};
};

function on_metadb_changed() {
	if (g_metadb) {
		g_path = tf_path.EvalWithMetadb(g_metadb);
		g_track_type = TrackType(g_path);
	};
	// 重建要绘制的列表
	p.list.setItems(false);
	full_repaint();
};

//=================================================// Keyboard Callbacks
function on_key_up(vkey) {
	if (cSettings.visible) {
		var fin = p.settings.pages[p.settings.currentPageId].elements.length;
		for (var j = 0; j < fin; j++) {
			p.settings.pages[p.settings.currentPageId].elements[j].on_key("up", vkey);
		};
	} else {

		// 封面列调整大小后，若分组中音轨数较少，更新封面图像和空行以显示完整封面
		if (cover.resized == true) {
			cover.resized = false;
			update_playlist(properties.collapseGroupsByDefault);
		};

		// 滚动键上下重置（步长与计时器）
		p.list.keypressed = false;
		cScrollBar.timerID1 && window.ClearTimeout(cScrollBar.timerID1);
		cScrollBar.timerID1 = false;
		cScrollBar.timerID2 && window.ClearTimeout(cScrollBar.timerID2);
		cScrollBar.timerID2 = false;
		if (vkey == VK_SHIFT) {
			p.list.SHIFT_start_id = null;
			p.list.SHIFT_count = 0;
		};
	};
};

function on_key_down(vkey) {
	var mask = GetKeyboardMask();
	var act_pls = plman.ActivePlaylist;

	if (cSettings.visible) {
		g_textbox_tabbed = false;
		var fin = p.settings.pages[p.settings.currentPageId].elements.length;
		for (var j = 0; j < fin; j++) {
			p.settings.pages[p.settings.currentPageId].elements[j].on_key("down", vkey);
		};
	} else {
		if (dragndrop.drag_in)
			return true;

		if (p.playlistManager.inputboxID >= 0) {
			if (mask == KMask.none) {
				switch (vkey) {
				case VK_ESCAPE:
				case 222:
					p.playlistManager.inputboxID = -1;
					full_repaint();
					break;
				default:
					p.playlistManager.inputbox.on_key_down(vkey);
				};
			} else {
				p.playlistManager.inputbox.on_key_down(vkey);
			};
		} else {
			if (mask == KMask.none) {
				switch (vkey) {
				case VK_F2:
					// 重命名播放列表（播放列表管理器面板可见）
					if (cPlaylistManager.visible) {
						p.playlistManager.inputbox = new oInputbox(p.playlistManager.w - p.playlistManager.border - p.playlistManager.scrollbarWidth - 40, cPlaylistManager.rowHeight - 10, plman.GetPlaylistName(act_pls), "", g_color_normal_txt, g_color_normal_bg, RGB(0, 0, 0), g_color_selected_bg & 0xccffffff, "renamePlaylist()", "p.playlistManager", 0, g_fsize, 225);
						p.playlistManager.inputboxID = act_pls;
						// 激活框内容 + 选中激活
						if (cPlaylistManager.inputbox_timer) {
							window.ClearTimeout(cPlaylistManager.inputbox_timer);
							cPlaylistManager.inputbox_timer = false;
						};
						cPlaylistManager.inputbox_timer = window.SetTimeout(inputboxPlaylistManager_activate, 20);
					}
					break;
				case VK_F5:
					// 刷新封面
					g_image_cache = new image_cache;
					full_repaint();
					break;
				case VK_F6:
					properties.showDPI = !properties.showDPI;
					window.SetProperty("系统.显示DPI", properties.showDPI);
					full_repaint();
					break;
				case VK_TAB:
					togglePlaylistManager();
					break;
				case VK_BACK:
					if (cList.search_string.length > 0) {
						cList.inc_search_noresult = false;
						p.list.tt_x = ((p.list.w) / 2) - (((cList.search_string.length * zoom(13, g_dpi)) + (zoom(10, g_dpi) * 2)) / 2);
						p.list.tt_y = p.list.y + Math.floor((p.list.h / 2) - zoom(30, g_dpi));
						p.list.tt_w = ((cList.search_string.length * zoom(13, g_dpi)) + (zoom(10, g_dpi) * 2));
						p.list.tt_h = zoom(60, g_dpi);
						cList.search_string = cList.search_string.substring(0, cList.search_string.length - 1);
						full_repaint();
						cList.clear_incsearch_timer && window.ClearTimeout(cList.clear_incsearch_timer);
						cList.clear_incsearch_timer = false;
						cList.incsearch_timer && window.ClearTimeout(cList.incsearch_timer);
						cList.incsearch_timer = window.SetTimeout(function () {
							p.list.incrementalSearch();
							window.ClearTimeout(cList.incsearch_timer);
							cList.incsearch_timer = false;
							cList.inc_search_noresult = false;
						}, 400);
					};
					break;
				case VK_ESCAPE:
				case 222:
					p.playlistManager.inputboxID = -1;
					//
					p.list.tt_x = ((p.list.w) / 2) - (((cList.search_string.length * zoom(13, g_dpi)) + (zoom(10, g_dpi) * 2)) / 2);
					p.list.tt_y = p.list.y + Math.floor((p.list.h / 2) - zoom(30, g_dpi));
					p.list.tt_w = ((cList.search_string.length * zoom(13, g_dpi)) + (zoom(10, g_dpi) * 2));
					p.list.tt_h = zoom(60, g_dpi);
					cList.search_string = "";
					window.RepaintRect(0, p.list.tt_y - 2, p.list.w, p.list.tt_h + 4);
					break;
				case VK_UP:
					var scrollstep = 1;
					var new_focus_id = 0;
					if (p.list.count > 0 && !p.list.keypressed && !cScrollBar.timerID1) {
						p.list.keypressed = true;
						reset_cover_timers();

						if (p.list.focusedTrackId < 0) {
							var old_grpId = 0;
						} else {
							var old_grpId = p.list.getGroupIdfromTrackId(p.list.focusedTrackId);
						};
						new_focus_id = (p.list.focusedTrackId > 0) ? p.list.focusedTrackId - scrollstep : 0;
						var grpId = p.list.getGroupIdfromTrackId(new_focus_id);
						if (!properties.autocollapse) {
							if (p.list.groups[old_grpId].collapsed) {
								if (old_grpId > 0 && old_grpId == grpId) {
									new_focus_id = (p.list.groups[grpId].start > 0) ? p.list.groups[grpId].start - scrollstep : 0;
									var grpId = p.list.getGroupIdfromTrackId(new_focus_id);
								};
							};
						};

						//new_focus_id = (p.list.focusedTrackId > 0) ? p.list.focusedTrackId - scrollstep : 0;
						// 若新聚焦的音轨 id 位于折叠分组中，将分组的第一个音轨设为聚焦音轨（= 分组聚焦）
						//var grpId = p.list.getGroupIdfromTrackId(new_focus_id);
						if (p.list.groups[grpId].collapsed) {
							if (properties.autocollapse) {
								new_focus_id = p.list.groups[grpId].start + p.list.groups[grpId].count - 1;
							} else {
								new_focus_id = p.list.groups[grpId].start;
							};
						};
						if (p.list.focusedTrackId == 0 && p.list.offset > 0) {
							p.list.scrollItems(1, scrollstep);
							cScrollBar.timerID1 = window.SetTimeout(function () {
								p.list.scrollItems(1, scrollstep);
								cScrollBar.timerID1 && window.ClearTimeout(cScrollBar.timerID1);
								cScrollBar.timerID1 = false;
								cScrollBar.timerID2 && window.ClearInterval(cScrollBar.timerID2);
								cScrollBar.timerID2 = window.SetInterval(function () {
									p.list.scrollItems(1, scrollstep);
								}, 50);
							}, 400);
						} else {
							plman.SetPlaylistFocusItem(act_pls, new_focus_id);
							plman.ClearPlaylistSelection(act_pls);
							plman.SetPlaylistSelectionSingle(act_pls, new_focus_id, true);
							cScrollBar.timerID1 = window.SetTimeout(function () {
								cScrollBar.timerID1 && window.ClearTimeout(cScrollBar.timerID1);
								cScrollBar.timerID1 = false;
								cScrollBar.timerID2 && window.ClearInterval(cScrollBar.timerID2);
								cScrollBar.timerID2 = window.SetInterval(function () {
									new_focus_id = (p.list.focusedTrackId > 0) ? p.list.focusedTrackId - scrollstep : 0;
									// 若新聚焦的音轨 id 位于折叠分组中，将分组的第一个音轨设为聚焦音轨（= 分组聚焦）
									var grpId = p.list.getGroupIdfromTrackId(new_focus_id);
									if (p.list.groups[grpId].collapsed) {
										if (properties.autocollapse) {
											new_focus_id = p.list.groups[grpId].start + p.list.groups[grpId].count - 1;
										} else {
											new_focus_id = p.list.groups[grpId].start;
										};
									};
									plman.SetPlaylistFocusItem(act_pls, new_focus_id);
									plman.ClearPlaylistSelection(act_pls);
									plman.SetPlaylistSelectionSingle(act_pls, new_focus_id, true);
								}, 50);
							}, 400);
						};
					};
					break;
				case VK_DOWN:
					var new_focus_id = 0;
					if (p.list.count > 0 && !p.list.keypressed && !cScrollBar.timerID1) {
						p.list.keypressed = true;
						reset_cover_timers();

						if (p.list.focusedTrackId < 0) {
							var old_grpId = 0;
						} else {
							var old_grpId = p.list.getGroupIdfromTrackId(p.list.focusedTrackId);
						};
						new_focus_id = (p.list.focusedTrackId < p.list.count - 1) ? p.list.focusedTrackId + 1 : p.list.count - 1;
						var grpId = p.list.getGroupIdfromTrackId(new_focus_id);
						if (!properties.autocollapse) {
							if (p.list.groups[old_grpId].collapsed) {
								if (old_grpId < (p.list.groups.length - 1) && old_grpId == grpId) {
									new_focus_id = ((p.list.groups[grpId].start + p.list.groups[grpId].count - 1) < (p.list.count - 1)) ? (p.list.groups[grpId].start + p.list.groups[grpId].count - 1) + 1 : p.list.count - 1;
									var grpId = p.list.getGroupIdfromTrackId(new_focus_id);
								};
							};
						};

						//new_focus_id = (p.list.focusedTrackId < p.list.count - 1) ? p.list.focusedTrackId + 1 : p.list.count - 1;
						// 若新聚焦的音轨 id 位于折叠分组中，将分组的最后一个音轨设为聚焦音轨（= 分组聚焦）
						//var grpId = p.list.getGroupIdfromTrackId(new_focus_id);
						if (p.list.groups[grpId].collapsed) {
							if (properties.autocollapse) {
								new_focus_id = p.list.groups[grpId].start;
							} else {
								new_focus_id = p.list.groups[grpId].start + p.list.groups[grpId].count - 1;
							};
						};
						plman.SetPlaylistFocusItem(act_pls, new_focus_id);
						plman.ClearPlaylistSelection(act_pls);
						plman.SetPlaylistSelectionSingle(act_pls, new_focus_id, true);
						cScrollBar.timerID1 = window.SetTimeout(function () {
							cScrollBar.timerID1 && window.ClearTimeout(cScrollBar.timerID1);
							cScrollBar.timerID1 = false;
							cScrollBar.timerID2 && window.ClearInterval(cScrollBar.timerID2);
							cScrollBar.timerID2 = window.SetInterval(function () {
								new_focus_id = (p.list.focusedTrackId < p.list.count - 1) ? p.list.focusedTrackId + 1 : p.list.count - 1;
								// 若新聚焦的音轨 id 位于折叠分组中，将分组的最后一个音轨设为聚焦音轨（= 分组聚焦）
								var grpId = p.list.getGroupIdfromTrackId(new_focus_id);
								if (p.list.groups[grpId].collapsed) {
									if (properties.autocollapse) {
										new_focus_id = p.list.groups[grpId].start;
									} else {
										new_focus_id = p.list.groups[grpId].start + p.list.groups[grpId].count - 1;
									};
								};
								plman.SetPlaylistFocusItem(act_pls, new_focus_id);
								plman.ClearPlaylistSelection(act_pls);
								plman.SetPlaylistSelectionSingle(act_pls, new_focus_id, true);
							}, 50);
						}, 400);
					};
					break;
				case VK_PGUP:
					var scrollstep = p.list.totalRowVisible;
					var new_focus_id = 0;
					if (p.list.count > 0 && !p.list.keypressed && !cScrollBar.timerID1) {
						p.list.keypressed = true;
						reset_cover_timers();
						new_focus_id = (p.list.focusedTrackId > scrollstep) ? p.list.focusedTrackId - scrollstep : 0;
						if (p.list.focusedTrackId == 0 && p.list.offset > 0) {
							p.list.scrollItems(1, scrollstep);
							cScrollBar.timerID1 = window.SetTimeout(function () {
								p.list.scrollItems(1, scrollstep);
								cScrollBar.timerID1 && window.ClearTimeout(cScrollBar.timerID1);
								cScrollBar.timerID1 = false;
								cScrollBar.timerID2 && window.ClearInterval(cScrollBar.timerID2);
								cScrollBar.timerID2 = window.SetInterval(function () {
									p.list.scrollItems(1, scrollstep);
								}, 60);
							}, 400);
						} else {
							plman.SetPlaylistFocusItem(act_pls, new_focus_id);
							plman.ClearPlaylistSelection(act_pls);
							plman.SetPlaylistSelectionSingle(act_pls, new_focus_id, true);
							cScrollBar.timerID1 = window.SetTimeout(function () {
								cScrollBar.timerID1 && window.ClearTimeout(cScrollBar.timerID1);
								cScrollBar.timerID1 = false;
								cScrollBar.timerID2 && window.ClearInterval(cScrollBar.timerID2);
								cScrollBar.timerID2 = window.SetInterval(function () {
									new_focus_id = (p.list.focusedTrackId > scrollstep) ? p.list.focusedTrackId - scrollstep : 0;
									plman.SetPlaylistFocusItem(act_pls, new_focus_id);
									plman.ClearPlaylistSelection(act_pls);
									plman.SetPlaylistSelectionSingle(act_pls, new_focus_id, true);
								}, 60);
							}, 400);
						};
					};
					break;
				case VK_PGDN:
					var scrollstep = p.list.totalRowVisible;
					var new_focus_id = 0;
					if (p.list.count > 0 && !p.list.keypressed && !cScrollBar.timerID1) {
						p.list.keypressed = true;
						reset_cover_timers();
						new_focus_id = (p.list.focusedTrackId < p.list.count - scrollstep) ? p.list.focusedTrackId + scrollstep : p.list.count - 1;
						plman.SetPlaylistFocusItem(act_pls, new_focus_id);
						plman.ClearPlaylistSelection(act_pls);
						plman.SetPlaylistSelectionSingle(act_pls, new_focus_id, true);
						cScrollBar.timerID1 = window.SetTimeout(function () {
							cScrollBar.timerID1 && window.ClearTimeout(cScrollBar.timerID1);
							cScrollBar.timerID1 = false;
							cScrollBar.timerID2 && window.ClearInterval(cScrollBar.timerID2);
							cScrollBar.timerID2 = window.SetInterval(function () {
								new_focus_id = (p.list.focusedTrackId < p.list.count - scrollstep) ? p.list.focusedTrackId + scrollstep : p.list.count - 1;
								plman.SetPlaylistFocusItem(act_pls, new_focus_id);
								plman.ClearPlaylistSelection(act_pls);
								plman.SetPlaylistSelectionSingle(act_pls, new_focus_id, true);
							}, 60);
						}, 400);
					};
					break;
				case VK_RETURN:
					var cmd = properties.defaultPlaylistItemAction;
					if (cmd == "Play") {
						plman.ExecutePlaylistDefaultAction(act_pls, p.list.focusedTrackId);
					} else {
						fb.RunContextCommandWithMetadb(cmd, p.list.handleList[p.list.focusedTrackId], 0);
					};
					break;
				case VK_END:
					if (p.list.count > 0) {
						plman.SetPlaylistFocusItem(act_pls, p.list.count - 1);
						plman.ClearPlaylistSelection(act_pls);
						plman.SetPlaylistSelectionSingle(act_pls, p.list.count - 1, true);
					};
					break;
				case VK_HOME:
					if (p.list.count > 0) {
						plman.SetPlaylistFocusItem(act_pls, 0);
						plman.ClearPlaylistSelection(act_pls);
						plman.SetPlaylistSelectionSingle(act_pls, 0, true);
					};
					break;
				case VK_DELETE:
					if (!plman.IsAutoPlaylist(act_pls)) {
						plman.UndoBackup(act_pls);
						plman.RemovePlaylistSelection(act_pls, false);
						plman.SetPlaylistSelectionSingle(act_pls, plman.GetPlaylistFocusItemIndex(act_pls), true);
					};
					break;
				};
			} else {
				switch (mask) {
				case KMask.shift:
					switch (vkey) {
					case VK_SHIFT: // 仅 SHIFT 键
						p.list.SHIFT_count = 0;
						break;
					case VK_UP: // SHIFT + KEY UP
						if (p.list.SHIFT_count == 0) {
							if (p.list.SHIFT_start_id == null) {
								p.list.SHIFT_start_id = p.list.focusedTrackId;
							};
							plman.ClearPlaylistSelection(act_pls);
							plman.SetPlaylistSelectionSingle(act_pls, p.list.focusedTrackId, true);
							if (p.list.focusedTrackId > 0) {
								p.list.SHIFT_count--;
								p.list.focusedTrackId--;
								plman.SetPlaylistSelectionSingle(act_pls, p.list.focusedTrackId, true);
								plman.SetPlaylistFocusItem(act_pls, p.list.focusedTrackId);
							};
						} else if (p.list.SHIFT_count < 0) {
							if (p.list.focusedTrackId > 0) {
								p.list.SHIFT_count--;
								p.list.focusedTrackId--;
								plman.SetPlaylistSelectionSingle(act_pls, p.list.focusedTrackId, true);
								plman.SetPlaylistFocusItem(act_pls, p.list.focusedTrackId);
							};
						} else {
							plman.SetPlaylistSelectionSingle(act_pls, p.list.focusedTrackId, false);
							p.list.SHIFT_count--;
							p.list.focusedTrackId--;
							plman.SetPlaylistFocusItem(act_pls, p.list.focusedTrackId);
						};
						break;
					case VK_DOWN: // SHIFT + KEY DOWN
						if (p.list.SHIFT_count == 0) {
							if (p.list.SHIFT_start_id == null) {
								p.list.SHIFT_start_id = p.list.focusedTrackId;
							};
							plman.ClearPlaylistSelection(act_pls);
							plman.SetPlaylistSelectionSingle(act_pls, p.list.focusedTrackId, true);
							if (p.list.focusedTrackId < p.list.count - 1) {
								p.list.SHIFT_count++;
								p.list.focusedTrackId++;
								plman.SetPlaylistSelectionSingle(act_pls, p.list.focusedTrackId, true);
								plman.SetPlaylistFocusItem(act_pls, p.list.focusedTrackId);
							};
						} else if (p.list.SHIFT_count > 0) {
							if (p.list.focusedTrackId < p.list.count - 1) {
								p.list.SHIFT_count++;
								p.list.focusedTrackId++;
								plman.SetPlaylistSelectionSingle(act_pls, p.list.focusedTrackId, true);
								plman.SetPlaylistFocusItem(act_pls, p.list.focusedTrackId);
							};
						} else {
							plman.SetPlaylistSelectionSingle(act_pls, p.list.focusedTrackId, false);
							p.list.SHIFT_count++;
							p.list.focusedTrackId++;
							plman.SetPlaylistFocusItem(act_pls, p.list.focusedTrackId);
						};
						break;
					};
					break;
				case KMask.ctrl:
					if (vkey == 65) { // CTRL+A
						fb.RunMainMenuCommand("Edit/Select all");
						p.list.metadblist_selection = plman.GetPlaylistSelectedItems(p.list.playlist);
						full_repaint();
					};
					if (vkey == 88) { // CTRL+X
						if (!plman.IsPlaylistLocked(act_pls)) {
							var items = plman.GetPlaylistSelectedItems(act_pls);
							if (fb.CopyHandleListToClipboard(items)) {
								plman.UndoBackup(act_pls);
								plman.RemovePlaylistSelection(act_pls);
							}
						};
					};
					if (vkey == 67) { // CTRL+C
						var items = plman.GetPlaylistSelectedItems(act_pls);
						fb.CopyHandleListToClipboard(items);
					};
					if (vkey == 86) { // CTRL+V
						if (!plman.IsPlaylistLocked(act_pls) && fb.CheckClipboardContents(window.ID)) {
							var items = fb.GetClipboardContents(window.ID);
							plman.UndoBackup(act_pls);
							plman.InsertPlaylistItems(act_pls, p.list.focusedTrackId + 1, items, false);
						}
					};
					if (vkey == 73) { // CTRL+I
						cTopBar.visible = !cTopBar.visible;
						window.SetProperty("系统.顶栏.可见", cTopBar.visible);
						resize_panels();
						full_repaint();
					};
					if (vkey == 84) { // CTRL+T
						// 切换工具栏
						if (!p.timer_onKey) {
							cHeaderBar.locked = !cHeaderBar.locked;
							window.SetProperty("系统.标题栏.已锁定", cHeaderBar.locked);
							if (!cHeaderBar.locked) {
								p.headerBar.visible = false;
							};
							resize_panels();
							full_repaint();
							p.timer_onKey = window.SetTimeout(function () {
									p.timer_onKey && window.ClearTimeout(p.timer_onKey);
									p.timer_onKey = false;
								}, 300);
						};
					};
					if (vkey == 48) { // CTRL + 0
						g_forced_percent = 0;
						window.SetProperty("系统.DPI（0=默认）", g_forced_percent);
						g_dpi = (g_forced_percent == 0 ? g_dpi_percent : g_forced_percent);
						//
						adjustMetrics(0);
						//
						resize_panels();
						full_repaint();
					};
					if (vkey == 89) { // CTRL + Y
						fb.RunMainMenuCommand("Edit/Redo");
					};
					if (vkey == 90) { // CTRL + Z
						fb.RunMainMenuCommand("Edit/Undo");
					};
					break;
				};
			};
		};
	};
};

function on_char(code) {
	if (cSettings.visible) {
		var fin = p.settings.pages.length;
		var fin2;
		for (var i = 0; i < fin; i++) {
			fin2 = p.settings.pages[i].elements.length;
			for (var j = 0; j < fin2; j++) {
				p.settings.pages[i].elements[j].on_char(code);
			};
		};
	} else {
		if (p.playlistManager.inputboxID >= 0) {
			p.playlistManager.inputbox.on_char(code);
		} else {
			if (p.list.count > 0) {
				p.list.tt_x = ((p.list.w) / 2) - (((cList.search_string.length * zoom(13, g_dpi)) + (zoom(10, g_dpi) * 2)) / 2);
				p.list.tt_y = p.list.y + Math.floor((p.list.h / 2) - zoom(30, g_dpi));
				p.list.tt_w = ((cList.search_string.length * zoom(13, g_dpi)) + (zoom(10, g_dpi) * 2));
				p.list.tt_h = zoom(60, g_dpi);
				if (code == 32 && cList.search_string.length == 0)
					return true; // 第一个字符不允许使用空格
				if (cList.search_string.length <= 20 && p.list.tt_w <= p.list.w - 20) {
					if (code > 31) {
						cList.search_string = cList.search_string + String.fromCharCode(code).toUpperCase();
						full_repaint();
						cList.clear_incsearch_timer && window.ClearTimeout(cList.clear_incsearch_timer);
						cList.clear_incsearch_timer = false;
						cList.incsearch_timer && window.ClearTimeout(cList.incsearch_timer);
						cList.incsearch_timer = window.SetTimeout(function () {
								p.list.incrementalSearch();
								window.ClearTimeout(cList.incsearch_timer);
								cList.incsearch_timer = false;
							}, 400);
					};
				};
			};
		};
	};
};

//=================================================// 播放回调

function on_playback_starting(cmd, is_paused) {
	// 仅在用户操作（cmd）时调用
};

function on_playback_new_track(metadb) {
	// 更新历史播放列表
	if (cPlaylistManager.enableHistoricPlaylist) {
		addToHistoricPlaylist(metadb);
	};

	// 更新统计（若未停止而切换音轨 <=> 连续播放）
	update_statistics();

	// 更新 g_metadb 和 g_track_type，因为 on_playback_time 会使用它们
	//on_item_focus_change();
	g_metadb = metadb;
	if (g_metadb) {
		g_path = tf_path.EvalWithMetadb(g_metadb);
		g_track_type = TrackType(g_path);
	};

	if (properties.showwallpaper) {
		p.wallpaperImg = setWallpaperImg(properties.wallpaperpath, metadb);
	};

	/*
	if(properties.autocollapse) {
	if(plman.PlayingPlaylist == p.list.playlist) {
	//plman.SetPlaylistFocusItemByHandle(p.list.playlist, metadb);
	var nowplaying = plman.GetPlayingItemLocation();
	p.list.focusedTrackId = plman.GetPlaylistFocusItemIndex(p.list.playlist);
	if(nowplaying.PlaylistItemIndex == p.list.focusedTrackId) {
	var grpId = p.list.getGroupIdfromTrackId(p.list.focusedTrackId);
	if(grpId >= 0) {
	p.list.updateGroupStatus(grpId);
	var center_focus_item = p.list.isFocusedItemVisible();
	if(!center_focus_item) {
	p.list.setItems(!center_focus_item);
	p.scrollbar.setCursor(p.list.totalRowVisible, p.list.totalRows, p.list.offset);
	};
	};
	};
	};
	};
	*/

	full_repaint();
};

function on_playback_stop(reason) { // reason：（整数，从 0 开始）：user、eof、starting_another
	switch (reason) {
	case 0: // 用户停止
	case 1: // eof（例如播放列表结束）
		// 更新壁纸
		if (properties.showwallpaper) {
			p.wallpaperImg = null
		};
		// 更新统计
		update_statistics();
		full_repaint();
		break;
	case 2: // starting_another（仅在用户操作时调用，例如点击下一曲按钮）
		break;
	};

};

function on_playback_pause(state) {
	if (p.list.nowplaying_y + cTrack.height > p.list.y && p.list.nowplaying_y < p.list.y + p.list.h) {
		window.RepaintRect(p.list.x, p.list.nowplaying_y, p.list.w, cTrack.height);
	};
};

function on_playback_seek(time) {};

function on_playback_time(time) {

	g_seconds = time;

	// -------------------------------------------------------------------------------/
	// WSH 统计标签引擎（v0.6，作者 Br3tt）
	// 播放时间达 50% 后更新文件，在音轨结束时更新标签：
	// <FIRST_PLAYED>、<LAST_PLAYED>、<PLAY_COUNTER>（若找到则替换 <PLAY_COUNT>）
	// -------------------------------------------------------------------------------/
	var bool;
	var played_seconds = time;
	if (played_seconds <= 1)
		var total_seconds = tf_length_seconds.Eval();

	if (g_track_type < 2 && fb.IsMetadbInMediaLibrary(g_metadb)) {
		if (played_seconds <= 1) {
			wsh_time_elaps = Math.floor(played_seconds);
			if (total_seconds >= 10) {
				wsh_limit_stats = total_seconds - 5;
				wsh_delay_stats = Math.floor(total_seconds / 2);
			} else {
				wsh_limit_stats = total_seconds - 1;
				wsh_delay_stats = 2;
			};
			if (wsh_delay_stats < 0)
				wsh_delay_stats = 0;

		} else if (wsh_time_elaps > 0) {
			wsh_time_elaps++;
		};

		if (opt_stats && wsh_time_elaps >= wsh_delay_stats && played_seconds <= wsh_limit_stats) {
			wsh_time_elaps = 0;
			cStats.waiting_for_writing = true;
			cStats.handle = g_metadb;
			// 报告到控制台
			console.log("--- WSH 统计 ---");
			console.log("--- 已排入队列的曲目：\"" + cStats.handle.Path + "\"");
		};
	};

	if (!cSettings.visible) {
		if (p.list.nowplaying_y + cTrack.height > p.list.y && p.list.nowplaying_y < p.list.y + p.list.h) {
			//window.RepaintRect(p.list.x, p.list.nowplaying_y, p.list.w, cTrack.height);
			full_repaint();
		};
	};
};

function on_playback_order_changed(new_order_index) {};

function on_focus(is_focused) {
	if (p.playlistManager.inputboxID >= 0) {
		p.playlistManager.inputbox.on_focus(is_focused);
	};
	if (is_focused) {
		plman.SetActivePlaylistContext();
		g_selHolder.SetPlaylistSelectionTracking();
	} else {
		p.playlistManager.inputboxID = -1;
		full_repaint();
	}
};

//=================================================// 颜色 + 字体 + 图像回调
function on_font_changed() {
	get_font();
	full_repaint();
};

function on_colours_changed() {
	get_colors();
	get_images();
	p.topBar.setButtons();
	p.headerBar.setButtons();
	if (p.list) {
		if (p.list.totalRows > p.list.totalRowVisible) {
			p.scrollbar.setButtons();
			p.scrollbar.setCursorButton();
		};
		p.list.setItemColors();
	};
	p.playlistManager.setColors();
	p.playlistManager.setButtons();
	p.playlistManager.refresh("", false, false, false);
	if (cSettings.visible) {
		p.settings.refreshColors();
	};
	full_repaint();
};

function get_font() {
	var font_error = false;

	if (g_instancetype == 0) {
		g_font = window.GetFontCUI(FontTypeCUI.items);
		g_font_headers = window.GetFontCUI(FontTypeCUI.labels);
	} else if (g_instancetype == 1) {
		g_font = window.GetFontDUI(FontTypeDUI.playlists);
		g_font_headers = window.GetFontDUI(FontTypeDUI.tabs);
	};

	// 微调：修复 WSH Panel Mod 1.5.6 及更低版本中 Font 对象 Name 属性的问题
	try {
		g_fname = g_font.Name;
		g_fsize = g_font.Size;
		g_fstyle = g_font.Style;
	} catch (e) {
		console.log("WSH 报告：无法使用默认字体。改用 Segoe UI。");
		g_fname = "segoe ui";
		g_fsize = 12;
		g_fstyle = 0;
		font_error = true;
	};

	g_dpi_percent = Math.floor(g_fsize / 12 * 100);
	g_forced_percent = window.GetProperty("系统.DPI（0=默认）", 0);
	g_dpi = (g_forced_percent == 0 ? g_dpi_percent : g_forced_percent);

	g_z2 = zoom(2, g_dpi);
	g_z3 = zoom(3, g_dpi);
	g_z4 = zoom(4, g_dpi);
	g_z5 = zoom(5, g_dpi);
	g_z6 = zoom(6, g_dpi);
	g_z8 = zoom(8, g_dpi);
	g_z10 = zoom(10, g_dpi);
	g_z16 = zoom(16, g_dpi);

	if (g_forced_percent) {
		g_fsize = Math.ceil(zoom(g_fsize, g_forced_percent));
		g_font = gdi_font(g_fname, g_fsize, g_fstyle);
	} else if (font_error) {
		g_font = gdi_font(g_fname, g_fsize, g_fstyle);
	};

	g_font_playicon = gdi_font("wingdings 3", Math.floor(zoom(17, g_dpi)), 0);
	g_font_pauseicon = gdi_font("wingdings", Math.floor(zoom(17, g_dpi)), 0);
	g_font_checkbox = gdi_font("wingdings 2", Math.floor(zoom(18, g_dpi)), 0);
	g_font_queue_idx = gdi_font("tahoma", Math.floor(zoom(11, g_dpi)), 1);

	if (g_font_guifx_found) {
		g_font_rating = gdi_font("guifx v2 transports", Math.floor(zoom(17, g_dpi)), 0);
		g_font_mood = gdi_font("guifx v2 transports", Math.floor(zoom(16, g_dpi)), 0);
	} else {
		g_font_rating = gdi_font("wingdings 2", Math.floor(zoom(19, g_dpi)), 0);
		g_font_mood = gdi_font("wingdings 2", Math.floor(zoom(24, g_dpi)), 1);
	};
	g_font_wd1 = gdi_font("wingdings", Math.floor(zoom(19, g_dpi)), 0);
	g_font_wd2 = gdi_font("wingdings 2", Math.floor(zoom(19, g_dpi)), 0);
	g_font_wd3 = gdi_font("wingdings 3", Math.floor(zoom(19, g_dpi)), 0);
	g_font_wd3_headerBar = gdi_font("wingdings 3", Math.floor(zoom(12, g_dpi)), 0);
	g_font_wd3_scrollBar = gdi_font("wingdings 3", Math.floor(zoom(10, g_dpi)), 0);

	// 分组字体
	g_font_group1 = gdi_font(g_fname, g_fsize + 4, 0);
	// 第2519行：分组标题第1行（主标题）= 基准字号 + 4
	g_font_group1_bold = gdi_font(g_fname, g_fsize + 3, 1);
	// 第2520行：第1行加粗版 = +3
	g_font_group2 = gdi_font(g_fname, g_fsize + 2, 0);
	// 第2521行：分组标题第2行（副标题）= 基准字号 + 2

};

function get_colors() {
	var arr;
	// 获取一些系统颜色
	g_syscolor_window_bg = utils.GetSysColour(COLOR_WINDOW);
	g_syscolor_highlight = utils.GetSysColour(COLOR_HIGHLIGHT);
	g_syscolor_button_bg = utils.GetSysColour(COLOR_BTNFACE);
	g_syscolor_button_txt = utils.GetSysColour(COLOR_BTNTEXT);

	arr = window.GetProperty("系统.颜色 文本 正常", "180-180-180").split("-");
	g_color_selected_txt = window.GetProperty("系统.颜色 文本 选中", "200-210-255");
	g_color_normal_bg = window.GetProperty("系统.颜色 背景 正常", "25-25-35");
	g_color_selected_bg = window.GetProperty("系统.颜色 背景 选中", "130-150-255");
	g_color_highlight = window.GetProperty("系统.颜色 高亮", "255-175-50");

	arr = window.GetProperty("系统.颜色 文本 正常", "180-180-180").split("-");
	g_color_normal_txt = RGB(arr[0], arr[1], arr[2]);
	arr = window.GetProperty("系统.颜色 文本 选中", "200-210-255").split("-");
	g_color_selected_txt = RGB(arr[0], arr[1], arr[2]);
	arr = window.GetProperty("系统.颜色 背景 正常", "25-25-35").split("-");
	g_color_normal_bg = RGB(arr[0], arr[1], arr[2]);
	arr = window.GetProperty("系统.颜色 背景 选中", "130-150-255").split("-");
	g_color_selected_bg = RGB(arr[0], arr[1], arr[2]);
	arr = window.GetProperty("系统.颜色 高亮", "255-175-50").split("-");
	g_color_highlight = RGB(arr[0], arr[1], arr[2]);

	// 先从窗口属性获取自定义颜色
	if (!properties.enableCustomColors) {
		// 若未设置自定义颜色，则获取 UI 首选项中设置的 UI 颜色
		if (g_instancetype == 0) {
			g_color_normal_txt = window.GetColourCUI(ColorTypeCUI.text);
			g_color_selected_txt = window.GetColourCUI(ColorTypeCUI.selection_text);
			g_color_normal_bg = window.GetColourCUI(ColorTypeCUI.background);
			g_color_selected_bg = window.GetColourCUI(ColorTypeCUI.selection_background);
			g_color_highlight = window.GetColourCUI(ColorTypeCUI.active_item_frame);
		} else if (g_instancetype == 1) {
			g_color_normal_txt = window.GetColourDUI(ColorTypeDUI.text);
			g_color_selected_txt = window.GetColourDUI(ColorTypeDUI.selection);
			g_color_normal_bg = window.GetColourDUI(ColorTypeDUI.background);
			g_color_selected_bg = g_color_selected_txt;
			g_color_highlight = window.GetColourDUI(ColorTypeDUI.highlight);
		};
	};

	get_images();

	if (!g_first_launch) {
		if (p.playlistManager) {
			p.playlistManager.setColors();
		};
	};
};

function get_images() {
	var gb;
	var gui_font = gdi_font("guifx v2 transports", 15, 0);

	images.glass_reflect = draw_glass_reflect(400, 400);

	images.sortdirection = gdi.CreateImage(7, 5);
	gb = images.sortdirection.GetGraphics();
	gb.FillSolidRect(1, 1, 5, 1, g_color_normal_txt);
	gb.FillSolidRect(2, 2, 3, 1, g_color_normal_txt);
	gb.FillSolidRect(3, 3, 1, 1, g_color_normal_txt);
	images.sortdirection.ReleaseGraphics(gb);

	images.nocover = gdi.Image(images.path + "nocover.png");
	images.noartist = gdi.Image(images.path + "noartist.png");
	images.stream = gdi.Image(images.path + "stream.png");
	images.loading = gdi.Image(images.path + "load.png");
	images.logo = gdi.Image(images.path + "logo.png");
	images.beam = draw_beam_image();
	images.noresult = gdi.Image(images.path + "noresult.png");
};

// ===================================================== // 壁纸

function setWallpaperImg(path, metadb) {

	var fmt_path = fb.TitleFormat(path).Eval(true);
	var fmt_path_arr = utils.Glob(fmt_path);
	if (fmt_path_arr.length > 0) {
		var final_path = fmt_path_arr[0];
	} else {
		var final_path = null;
	};

	if (metadb && properties.wallpapermode > -1) {
		var tmp_img = utils.GetAlbumArtV2(metadb, properties.wallpapermode);
	} else {
		if (final_path) {
			tmp_img = gdi.Image(final_path);
		} else {
			tmp_img = null;
		};
	};
	if (!tmp_img) {
		if (final_path) {
			tmp_img = gdi.Image(final_path);
		} else {
			tmp_img = null;
		};
	};

	p.wallpaperImg = null;
	var img = FormatWallpaper(tmp_img, ww, wh, 2, 0, 0, "", true);
	return img;
};

function draw_beam_image() {
	var sbeam = gdi.CreateImage(500, 128);
	// 获取图形接口，如同 on_paint 中的 "gr"
	var gb = sbeam.GetGraphics();
	gb.FillEllipse(-250, 50, 1000, 640, g_color_highlight & 0x60ffffff);
	sbeam.ReleaseGraphics(gb);

	var beamA = sbeam.Resize(500 / 50, 128 / 50, 2);
	var beamB = beamA.Resize(500, 128, 2);
	return beamB;
};

function draw_blurred_image(image, ix, iy, iw, ih, bx, by, bw, bh, blur_value, overlay_color) {
	var blurValue = blur_value;
	var imgA = image.Resize(iw * blurValue / 100, ih * blurValue / 100, 2);
	var imgB = imgA.Resize(iw, ih, 2);

	var bbox = gdi.CreateImage(bw, bh);
	// 获取图形接口，如同 on_paint 中的 "gr"
	var gb = bbox.GetGraphics();
	var offset = 90 - blurValue;
	gb.DrawImage(imgB, 0 - offset, 0 - (ih - bh) - offset, iw + offset * 2, ih + offset * 2, 0, 0, imgB.Width, imgB.Height, 0, 255);
	bbox.ReleaseGraphics(gb);

	var newImg = gdi.CreateImage(iw, ih);
	var gb = newImg.GetGraphics();

	if (ix != bx || iy != by || iw != bw || ih != bh) {
		gb.DrawImage(image, ix, iy, iw, ih, 0, 0, image.Width, image.Height, 0, 255);
		gb.FillSolidRect(bx, by, bw, bh, 0xffffffff);
	};
	gb.DrawImage(bbox, bx, by, bw, bh, 0, 0, bbox.Width, bbox.Height, 0, 255);

	// 叠加层
	if (overlay_color != null) {
		gb.FillSolidRect(bx, by, bw, bh, overlay_color);
	};

	// 模糊区域的顶部边界
	if (ix != bx || iy != by || iw != bw || ih != bh) {
		gb.FillSolidRect(bx, by, bw, 1, 0x22ffffff);
		gb.FillSolidRect(bx, by - 1, bw, 1, 0x22000000);
	};
	newImg.ReleaseGraphics(gb);

	return newImg;
};

function FormatWallpaper(image, iw, ih, interpolation_mode, display_mode, angle, txt, rawBitmap) {
	if (!image || !iw || !ih)
		return image;
	var i,
	j;

	var panel_ratio = iw / ih;
	wpp_img_info.ratio = image.Width / image.Height;
	wpp_img_info.orient = 0;

	if (wpp_img_info.ratio > panel_ratio) {
		wpp_img_info.orient = 1;
		// 1/3：默认图像为横向模式
		switch (display_mode) {
		case 0: // 填充
			//wpp_img_info.w = iw * wpp_img_info.ratio / panel_ratio;
			wpp_img_info.w = ih * wpp_img_info.ratio;
			wpp_img_info.h = ih;
			wpp_img_info.cut = wpp_img_info.w - iw;
			wpp_img_info.x = 0 - (wpp_img_info.cut / 2);
			wpp_img_info.y = 0;
			break;
		case 1: // 调整
			wpp_img_info.w = iw;
			wpp_img_info.h = ih / wpp_img_info.ratio * panel_ratio;
			wpp_img_info.cut = ih - wpp_img_info.h;
			wpp_img_info.x = 0;
			wpp_img_info.y = wpp_img_info.cut / 2;
			break;
		case 2: // 拉伸
			wpp_img_info.w = iw;
			wpp_img_info.h = ih;
			wpp_img_info.cut = 0;
			wpp_img_info.x = 0;
			wpp_img_info.y = 0;
			break;
		};
	} else if (wpp_img_info.ratio < panel_ratio) {
		wpp_img_info.orient = 2;
		// 2/3：默认图像为纵向模式
		switch (display_mode) {
		case 0: // 填充
			wpp_img_info.w = iw;
			//wpp_img_info.h = ih / wpp_img_info.ratio * panel_ratio;
			wpp_img_info.h = iw / wpp_img_info.ratio;
			wpp_img_info.cut = wpp_img_info.h - ih;
			wpp_img_info.x = 0;
			wpp_img_info.y = 0 - (wpp_img_info.cut / 4);
			break;
		case 1: // 调整
			wpp_img_info.h = ih;
			wpp_img_info.w = iw * wpp_img_info.ratio / panel_ratio;
			wpp_img_info.cut = iw - wpp_img_info.w;
			wpp_img_info.y = 0;
			wpp_img_info.x = wpp_img_info.cut / 2;
			break;
		case 2: // 拉伸
			wpp_img_info.w = iw;
			wpp_img_info.h = ih;
			wpp_img_info.cut = 0;
			wpp_img_info.x = 0;
			wpp_img_info.y = 0;
			break;
		};
	} else {
		// 3/3：默认图像为正方形图片，ratio = 1
		wpp_img_info.w = iw;
		wpp_img_info.h = ih;
		wpp_img_info.cut = 0;
		wpp_img_info.x = 0;
		wpp_img_info.y = 0;
	};

	var tmp_img = gdi.CreateImage(iw, ih);
	var gp = tmp_img.GetGraphics();
	gp.SetInterpolationMode(interpolation_mode);
	gp.DrawImage(image, wpp_img_info.x, wpp_img_info.y, wpp_img_info.w, wpp_img_info.h, 0, 0, image.Width, image.Height, angle, 255);
	tmp_img.ReleaseGraphics(gp);

	// 模糊它！
	if (properties.wallpaperblurred) {
		var blur_factor = properties.wallpaperblurvalue; // [1-90]
		tmp_img = draw_blurred_image(tmp_img, 0, 0, tmp_img.Width, tmp_img.Height, 0, 0, tmp_img.Width, tmp_img.Height, blur_factor, 0x00ffffff);
	};

	if (rawBitmap) {
		return tmp_img.CreateRawBitmap();
	} else {
		return tmp_img;
	};
};

//=================================================// 队列播放列表功能
function on_playback_queue_changed(origin) {
	full_repaint();
};

//=================================================// 拖放回调
var g_dragndrop_hover_playlistManager = false;

function on_drag_enter() {
	g_dragndrop_status = true;
};

function on_drag_leave() {
	g_dragndrop_status = false;
	g_dragndrop_hover_playlistManager = false;
	g_dragndrop_trackId = -1;
	g_dragndrop_rowId = -1;
	g_dragndrop_targetPlaylistId = -1;
	p.list.buttonclicked = false;
	cScrollBar.timerID1 && window.ClearInterval(cScrollBar.timerID1);
	cScrollBar.timerID1 = false;
};

function on_drag_over(action, x, y, mask) {
	g_dragndrop_hover_playlistManager = false;
	if (y < p.list.y) {
		action.Effect = 0;
	} else if (cPlaylistManager.visible && p.playlistManager.isHoverObject(x, y)) {
		g_dragndrop_hover_playlistManager = true;
		p.playlistManager.check("drag_over", x, y);
		if (g_dragndrop_targetPlaylistId == -1) {
			action.Effect = p.playlistManager.ishoverHeader ? 1 : 0;
		} else if (plman.IsPlaylistLocked(g_dragndrop_targetPlaylistId)) {
			action.Effect = 0;
		} else {
			action.Effect = 1;
		}
	} else {
		g_dragndrop_trackId = -1;
		g_dragndrop_rowId = -1;
		g_dragndrop_bottom = false;
		p.list.check("drag_over", x, y);
		action.Effect = plman.ActivePlaylist > -1 && plman.IsPlaylistLocked(plman.ActivePlaylist) ? 0 : 1;
	}
	full_repaint();
};

function on_drag_drop(action, x, y, mask) {
	if (y < p.list.y) {
		action.Effect = 0;
	} else if (cPlaylistManager.visible && p.playlistManager.isHoverObject(x, y)) {
		if (g_dragndrop_targetPlaylistId == -1) {
			if (p.playlistManager.ishoverHeader) {
				var count = plman.PlaylistCount;
				plman.CreatePlaylist(count, "拖放的项目");
				action.Playlist = count;
				action.Base = 0;
				action.ToSelect = true;
				action.Effect = 1;
			} else {
				action.Effect = 0;
			}
		} else if (plman.IsPlaylistLocked(g_dragndrop_targetPlaylistId)) {
			action.Effect = 0;
		} else {
			plman.ClearPlaylistSelection(g_dragndrop_targetPlaylistId);
			plman.UndoBackup(g_dragndrop_targetPlaylistId);
			action.Playlist = g_dragndrop_targetPlaylistId;
			action.Base = plman.PlaylistItemCount(g_dragndrop_targetPlaylistId);
			action.ToSelect = false;
			action.Effect = 1;
		}
	} else {
		if (plman.ActivePlaylist > -1 && plman.IsPlaylistLocked(plman.ActivePlaylist)) {
			action.Effect = 0;
		} else if (plman.PlaylistCount == 0 || plman.ActivePlaylist == -1) {
			var count = plman.PlaylistCount;
			plman.CreatePlaylist(count, "拖放的项目");
			action.Playlist = count;
			action.Base = 0;
			action.ToSelect = true;
			action.Effect = 1;
		} else {
			plman.ClearPlaylistSelection(plman.ActivePlaylist);
			plman.UndoBackup(plman.ActivePlaylist);
			action.Playlist = plman.ActivePlaylist;
			action.Base = g_dragndrop_bottom ? plman.PlaylistItemCount(plman.ActivePlaylist) : g_dragndrop_trackId;
			action.ToSelect = true;
			action.Effect = 1;
		}
		
	}
	g_dragndrop_hover_playlistManager = false;
	g_dragndrop_targetPlaylistId = -1;
	g_dragndrop_trackId = -1;
	g_dragndrop_rowId = -1;
	g_dragndrop_bottom = false;
	full_repaint();
};

function on_script_unload() {
	g_timer1 && window.ClearInterval(g_timer1);
	g_timer1 = false;
	update_statistics();
};
