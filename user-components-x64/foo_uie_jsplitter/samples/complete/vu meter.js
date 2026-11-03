'use strict';

window.DefineScript('VU表', {author:'Case + marc2003', options:{grab_focus:false}});
include(fb.ComponentPath + 'samples\\complete\\js\\lodash.min.js');
include(fb.ComponentPath + 'samples\\complete\\js\\helpers.js');
include(fb.ComponentPath + 'samples\\complete\\js\\vu_meter.js');

// 修改版，自动方向，无标签

var vu_meter = new _vu_meter(0, 0, 0, 0);

vu_meter.timer_interval = 1000 / 60; // 单位毫秒（默认：60 fps 刷新率）
vu_meter.rms_window = 50 / 1000; // 单位秒（默认：50 ms）
vu_meter.peak_hold = 20; // 单位帧
vu_meter.peak_fall_mul = 0.99;
vu_meter.peak_bar_width = 1; // 单位像素

vu_meter.init();

function on_mouse_rbtn_up(x, y) {
	return vu_meter.rbtn_up(x, y);
}

function on_paint(gr) {
	gr.FillSolidRect(0, 0, vu_meter.w, vu_meter.h, vu_meter.properties.custom_background.value);
	vu_meter.paint(gr);
}

function on_playback_new_track() {
	vu_meter.playback_new_track();
}

function on_playback_pause(state) {
	vu_meter.playback_pause(state);
}

function on_playback_stop(reason) {
	vu_meter.playback_stop(reason);
}

function on_size() {
	vu_meter.w = window.Width;
	vu_meter.h = window.Height;
}
