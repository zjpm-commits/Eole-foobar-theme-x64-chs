'use strict';

window.DefineScript('评分', {author:'marc2003', options:{grab_focus:false}});
include(fb.ComponentPath + 'samples\\complete\\js\\lodash.min.js');
include(fb.ComponentPath + 'samples\\complete\\js\\helpers.js');
include(fb.ComponentPath + 'samples\\complete\\js\\panel.js');
include(fb.ComponentPath + 'samples\\complete\\js\\rating.js');

/*
现支持 3 种模式：
1) foo_playcount，限于 5 星，通过 %rating% 访问
2) 文件标签，可配置上限，通过自定义标签访问。使用右键菜单设置。
3) JSplitter '播放统计' 数据库，可配置上限，通过 %jsplitter_rating% 访问。绑定到 '%artist% - %title%'，因此不同专辑中的相同曲目会共享评分。
*/

let panel = new _panel(true);
let rating = new _rating(0, 0, 24, _RGB(255, 128, 0)); // x, y, 尺寸, 颜色

panel.item_focus_change();

function on_size() {
	panel.size();
}
function on_paint(gr) {
	panel.paint(gr);
	rating.paint(gr);
}

function on_metadb_changed() {
	rating.metadb_changed();
}

function on_mouse_move(x, y) {
	rating.move(x, y);
}
function on_mouse_leave() {
	rating.leave();
}

function on_mouse_lbtn_up(x, y) {
	rating.lbtn_up(x, y);
}

function on_mouse_rbtn_up(x, y) {
	return panel.rbtn_up(x, y, rating);
}

function on_colours_changed() {
	panel.colours_changed();
	window.Repaint();
}

function on_item_focus_change() {
	panel.item_focus_change();
}

function on_playback_dynamic_info_track() {
	panel.item_focus_change();
}

function on_playback_new_track() {
	panel.item_focus_change();
}

function on_playback_stop(reason) {
	if (reason != 2) {
		panel.item_focus_change();
	}
}

function on_playlist_switch() {
	panel.item_focus_change();
}

