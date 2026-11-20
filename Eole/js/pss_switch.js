var settings_file_not_found = false;
var g_settings_file_index = null;

/* 状态注册表：本面板声明的每个 oPanelSetting 都登记在这里。
   NotifyOthers 不回送自身，所以别的面板改了状态时，本面板只能靠
   on_notify_data 把新值写回这些对象的 .value；按名字查表比逐个 if 稳妥。
   （见 theme_settings.js 的 tsStateByName / tsSyncState） */
var g_panelSettings = [];
function panelSetting(name) {
	for (var i = 0; i < g_panelSettings.length; ++i) {
		if (g_panelSettings[i].name === name) return g_panelSettings[i];
	}
	return null;
}

/* All 34 settings of a panel used to run utils.Glob(prefix + "*") once each,
   i.e. one directory scan per setting. Build one snapshot of SettingsPath and
   filter it in memory instead; every setting still behaves the same. */
function getSettingsFilesForPrefix(prefix) {
	if (g_settings_file_index === null) {
		try { g_settings_file_index = utils.Glob(SettingsPath + "*"); }
		catch (e) { g_settings_file_index = []; }
		if (!g_settings_file_index) g_settings_file_index = [];
	}
	var result = [];
	for (var i = 0; i < g_settings_file_index.length; i++) {
		var path = g_settings_file_index[i];
		var slash = path.lastIndexOf('\\');
		if (slash < 0) slash = path.lastIndexOf('/');
		var name = path.substring(slash + 1);
		if (name.substring(0, prefix.length) === prefix) result.push(path);
	}
	result.sort();
	return result;
}
	
oPanelSetting = function (name, file_prefix, default_value, min_value, max_value, int_value, update_settings_file_not_found) {
	this.name = name;	
	this.file_prefix = file_prefix;
	this.default_value = default_value;
	this.max_value = max_value;
	this.min_value = min_value;	
	this.int_value = typeof int_value !== 'undefined' ? int_value : true;	
	this.update_settings_file_not_found = typeof update_settings_file_not_found !== 'undefined' ? update_settings_file_not_found : true;	
	this.getFileValue = function () {		
		var setting_file = getSettingsFilesForPrefix(this.file_prefix);
		if(setting_file.length>=1){
			var last_underscore = setting_file[0].lastIndexOf('_');
			this.value = setting_file[0].substring(last_underscore + 1);
			if(this.int_value) this.value = parseInt(this.value);
			if(setting_file.length>1){
				for(var i=1;i<setting_file.length;i++) {
					g_files.DeleteFile(setting_file[i]);
				}
				g_settings_file_index = null;
			}
		} else {
			this.value = this.default_value;
			var new_path = SettingsPath+this.file_prefix+this.value;
			g_files.CreateTextFile(new_path, true).Close();
			if (g_settings_file_index) g_settings_file_index.push(new_path);
			if(this.update_settings_file_not_found) {
				settings_file_not_found = true;	
			}
		}
		return this.value;
    };
	this.getValue = function () {		
		return this.value;
	}	
	this.getNumberOfState = function () {
		return (this.max_value-this.min_value);
	}	
	this.setValue = function (new_value, refresh_panel) {	
		refresh_panel = typeof refresh_panel !== 'undefined' ? refresh_panel : true;	
		if(new_value==this.value) return;
		if(new_value>this.max_value) new_value = this.max_value;
		else if(new_value<this.min_value) new_value = this.min_value;		
		if(g_files.FileExists(SettingsPath+this.file_prefix+new_value)) g_files.DeleteFile(SettingsPath+this.file_prefix+new_value);
		if(!g_files.FileExists(SettingsPath+this.file_prefix+this.value)) g_files.CreateTextFile(SettingsPath+this.file_prefix+this.value, true).Close();	
		g_files.MoveFile(SettingsPath + this.file_prefix + this.value,SettingsPath + this.file_prefix + new_value);
		g_settings_file_index = null;
		g_avoid_on_metadb_changed = true;
		this.value = new_value;
		/* 值变更钩子：给上层一个"用户手动改了某个状态"的观察点。
		   NotifyOthers 不回送自身，同面板内改值只能靠这个钩子。 */
		if (typeof onPanelSettingChanged === 'function') {
			try { onPanelSettingChanged(this.name, this.value); } catch(eHook) {}
		}
		window.NotifyOthers("g_avoid_on_metadb_changed",true);			
		window.NotifyOthers(this.name,this.value);	
		if(refresh_panel!==false) RefreshPSS();
	}
	this.setDefault = function () {
		this.setValue(this.default_value);
	}	
	this.toggleValue = function (refresh_panel) {
		if(this.value==0) this.setValue(1, refresh_panel);
		else this.setValue(0, refresh_panel);
	}
	this.isEqual = function (test_value) {
		return (this.value==test_value);
	}		
	this.isActive = function () {
		return (this.value>0);
	}	
	this.isMaximumValue = function () {
		return (this.value==this.max_value);
	}
	this.isMinimumValue = function () {
		return (this.value==this.min_value);
	}	
	this.decrement = function (decrement_value) {
		this.setValue(parseInt(this.value)-decrement_value);		
	}	
	this.increment = function (increment_value) {
		this.setValue(parseInt(this.value)+increment_value);		
	}	
	this.cycleIncrement = function (increment_value, refresh_panel) {
		var new_value = parseInt(this.value)+increment_value;
		if(new_value>this.max_value) new_value = this.min_value;
		this.setValue(new_value, refresh_panel);		
	}	
	this.cycleDecrement = function (decrement_value, refresh_panel) {
		var new_value = parseInt(this.value)-decrement_value;
		if(new_value<this.min_value) new_value = this.max_value;
		this.setValue(new_value, refresh_panel);		
	}	
	this.userInputValue = function (msg,title) {
		try {
			new_value = utils.InputBox(window.ID, msg, title, this.value, true);
			if (!(new_value == "" || typeof new_value == 'undefined')) {
				this.setValue(new_value);
			}			   
		} catch(e) {
		}				
	}		
	this.getFileValue();
	g_panelSettings.push(this);
}
/* 布局重排的唯一通知名。Eole_layout.js 只认 "eole_layout"，不设兜底，
   所以任何"面板尺寸/可见性变了"的地方都必须发这个名字。 */
function RefreshPSS() { window.NotifyOthers("eole_layout", true); }

/* 收到别的面板发来的状态广播时，把本地这份 oPanelSetting 的 .value 同步过来。
   只改本地副本，绝不调 setValue —— setValue 会再移动一次状态文件、再广播一轮。
   返回 true 表示"这个通知确实是一个状态变化"，调用方可以据此补自己的重绘/重排。 */
function syncStateFromNotify(name, info) {
	var ps = panelSetting(name);
	if (!ps) return false;
	var v;
	if (typeof info === 'number') { v = info; }
	else if (typeof info === 'boolean') { v = info ? 1 : 0; }
	else if (typeof info === 'string') { v = parseInt(info, 10); if (!isFinite(v)) v = (info === 'true' ? 1 : 0); }
	else return false;
	if (!isFinite(v)) return false;
	if (v < ps.min_value) v = ps.min_value;
	if (v > ps.max_value) v = ps.max_value;
	if (v === ps.value) return false;
	ps.value = v;
	if (typeof onPanelSettingChanged === 'function') {
		try { onPanelSettingChanged(name, v); } catch (eHookSync) {}
	}
	return true;
}

/* 0 媒体库 / 1 播放列表 / 2 简介歌词 / 3 洛雪音源 / 4 MilkDrop / 5 MPV 视频（无插件时为 ESL 歌词） / 6 主题设置 */
var main_panel_state = new oPanelSetting("main_panel_state", "MAINPANEL_", 0, 0, 6);
var layout_state = new oPanelSetting("layout_state", "LAYOUT_", 0, 0, 1);

var darklib_state = new oPanelSetting("darklib_state", "DARKLIB_", 0, 0, 1);
var darkplaylist_state = new oPanelSetting("darkplaylist_state", "DARKPLAYLIST_", 0, 0, 1);
var darkbio_state = new oPanelSetting("darkbio_state", "DARKBIO_", 0, 0, 1);
var darkbiostick_state = new oPanelSetting("darkbiostick_state", "DARKBIOSTICK_", 0, 0, 1);
var darklxbox_state = new oPanelSetting("darklxbox_state", "DARKLXBOX_", 0, 0, 1);
var darkmini_state = new oPanelSetting("darkmini_state", "DARKMINI_", 0, 0, 1);

var showtrackinfo_big = new oPanelSetting("showtrackinfo_big", "SHOWTRACKINFOBIG_", 1, 0, 1);
var showtrackinfo_small = new oPanelSetting("showtrackinfo_small", "SHOWTRACKINFOSMALL_", 0, 0, 1);

var coverpanel_state_mini = new oPanelSetting("coverpanel_state_mini", "COVERPANELMINI_", 1, 0, 1);
var coverpanel_state_big = new oPanelSetting("coverpanel_state_big", "COVERPANELBIG_", 1, 0, 1);
var filters_panel_state = new oPanelSetting("filters_panel_state", "FILTERSPANEL_", 1, 0, 5);
var libraryfilter_state = new oPanelSetting("libraryfilter_state", "LIBRARYFILTER_", 1, 0, 1);
var lyrics_state = new oPanelSetting("lyrics_state", "LYRICS_", 5, 0, 11);
var librarytree = new oPanelSetting("librarytree", "LIBRARYTREE_", 0, 0, 1);
var mini_controlbar = new oPanelSetting("mini_controlbar", "MINICONTROLBAR_", 1, 0, 1);
var compact_titlebar = new oPanelSetting("compacttitlebar", "COMPACTTITLEBAR_", 0, 0, 2);

/* 高分屏适配方案已废弃（用户明确否决），InitHiResDisplay 已删除 */

//Individual Filter state
var filter1_state = new oPanelSetting("filter1_state", "FILTER1_", 1, 0, 1);
var filter2_state = new oPanelSetting("filter2_state", "FILTER2_", 1, 0, 1);
var filter3_state = new oPanelSetting("filter3_state", "FILTER3_", 1, 0, 1);

//Now playing switch for each main panels
var nowplayinglib_state = new oPanelSetting("nowplayinglib_state", "NOWPLAYINGLIB_", 1, 0, 1);
var nowplayingplaylist_state = new oPanelSetting("nowplayingplaylist_state", "NOWPLAYINGPLAYLIST_", 1, 0, 1);
var nowplayingbio_state = new oPanelSetting("nowplayingbio_state", "NOWPLAYINGBIO_", 1, 0, 1);
var nowplayinglxbox_state = new oPanelSetting("nowplayinglxbox_state", "NOWPLAYINGLXBOX_", 1, 0, 1);
var nowplayingmdrop_state = new oPanelSetting("nowplayingmdrop_state", "NOWPLAYINGMDROP_", 1, 0, 1);
/* 模式 5（MPV 视频）：右栏开关与曲目信息开关独立一份，和模式 3/4 同款 */
var nowplayingmpv_state = new oPanelSetting("nowplayingmpv_state", "NOWPLAYINGMPV_", 1, 0, 1);
/* 模式 6（主题设置）：主区是设置页，右栏照常保留 */
var nowplayingtheme_state = new oPanelSetting("nowplayingtheme_state", "NOWPLAYINGTHEME_", 1, 0, 1);

//Track infos switch for each main panels
var trackinfoslib_state = new oPanelSetting("trackinfoslib_state", "TRACKINFOSLIB_", 0, 0, 2);
var trackinfosplaylist_state = new oPanelSetting("trackinfosplaylist_state", "TRACKINFOSPLAYLIST_", 0, 0, 2);
var trackinfosbio_state = new oPanelSetting("trackinfosbio_state", "TRACKINFOSBIO_", 1, 0, 2);
var trackinfoslxbox_state = new oPanelSetting("trackinfoslxbox_state", "TRACKINFOSLXBOX_", 1, 0, 2);
var trackinfosmdrop_state = new oPanelSetting("trackinfosmdrop_state", "TRACKINFOSMDROP_", 1, 0, 2);
var trackinfosmpv_state = new oPanelSetting("trackinfosmpv_state", "TRACKINFOSMPV_", 1, 0, 2);
var trackinfostheme_state = new oPanelSetting("trackinfostheme_state", "TRACKINFOSTHEME_", 1, 0, 2);
var trackinfostext_state = new oPanelSetting("trackinfostext_state", "TRACKINFOSTEXT_", 1, 0, 1);

//MilkDrop 主面板（模式 4）：选中预设的编号与帧率档位。
//编号存四位数字本身（14），不存列表下标 —— 往 MilkDrop 目录增删预设时，
//已选的样式不会串位。0 表示"还没选过"，加载时按默认 0014 处理。
var milkdropvis_state = new oPanelSetting("milkdropvis_state", "MILKDROPVIS_", 14, 0, 9999);
//帧率档位：0=30 帧 / 1=60 帧 / 2=120 帧
var milkdropfps_state = new oPanelSetting("milkdropfps_state", "MILKDROPFPS_", 1, 0, 2);

//Panels width
var libraryfilter_width = new oPanelSetting("libraryfilter_width", "LIBRARYFILTERWIDTH_", 210, 100, 900);
var playlistpanel_width = new oPanelSetting("playlistpanel_width", "PLAYLISTPANELWIDTH_", 180, 100, 900);
var rightplaylist_width = new oPanelSetting("rightplaylist_width", "RIGHTPLAYLISTWIDTH_", 210, 100, 900);

//Theme version
var theme_version = new oPanelSetting("theme_version", "THEMEVERSION_", "0", 0, 0, false, false);

//Get Now playing state according to main panel
function getNowPlayingState(){
	switch(main_panel_state.value){
		case 0:
			return nowplayinglib_state.value;
		break;
		case 1:
			return nowplayingplaylist_state.value;
		break;
		case 2:
			return nowplayingbio_state.value;
		break;
		case 3:
			return nowplayinglxbox_state.value;
		break;
		case 4:
			return nowplayingmdrop_state.value;
		break;		
		case 5:
			return nowplayingmpv_state.value;
		break;
		case 6:
			return nowplayingtheme_state.value;
		break;
	}	
}
//Get Track Infos state according to main panel
function getTrackInfosState(){
	switch(main_panel_state.value){
		case 0:
			return trackinfoslib_state.value;
		break;
		case 1:
			return trackinfosplaylist_state.value;
		break;
		case 2:
			return trackinfosbio_state.value;
		break;
		case 3:
			return trackinfoslxbox_state.value;
		break;
		case 4:
			return trackinfosmdrop_state.value;
		break;		
		case 5:
			return trackinfosmpv_state.value;
		break;
		case 6:
			return trackinfostheme_state.value;
		break;
	}	
}
function getTrackInfosVisibility(){
	switch(main_panel_state.value){
		case 0:
			return (trackinfoslib_state.value>=1 && nowplayinglib_state.value==1);
		break;
		case 1:
			return (trackinfosplaylist_state.value>=1 && nowplayingplaylist_state.value==1);
		break;
		case 2:
			return (trackinfosbio_state.value>=1 && nowplayingbio_state.value==1);
		break;
		case 3:
			return (trackinfoslxbox_state.value>=1 && nowplayinglxbox_state.value==1);
		break;
		case 4:
			return (trackinfosmdrop_state.value>=1 && nowplayingmdrop_state.value==1);
		break;		
		case 5:
			return (trackinfosmpv_state.value>=1 && nowplayingmpv_state.value==1);
		break;
		case 6:
			return (trackinfostheme_state.value>=1 && nowplayingtheme_state.value==1);
		break;
	}	
}
function getRightPlaylistState(){
	return (nowplayinglib_state.isActive());
}

// Example of use in a PSS :
// The first line set a panel stack global variable according to the panel current state, the second line switch the visibility of a panel named library, it show the panel when the current state is 3
