'use strict';

window.DefineScript('播放按钮', {author:'marc2003', options:{grab_focus:false}});
include(fb.ComponentPath + 'samples\\complete\\js\\lodash.min.js');
include(fb.ComponentPath + 'samples\\complete\\js\\helpers.js');
include(fb.ComponentPath + 'samples\\complete\\js\\panel.js');

let panel = new _panel(true);
let buttons = new _buttons();
let bs = _scale(24);

buttons.update = () => {
	buttons.buttons.stop = new _button(0, 0, bs, bs, {normal : 'buttons\\stop.png'}, (x, y) => { fb.Stop(); }, '停止');
	buttons.buttons.play = new _button(bs, 0, bs, bs, {normal : !fb.IsPlaying || fb.IsPaused ? 'buttons\\play.png' : 'buttons\\pause.png'}, (x, y) => { fb.PlayOrPause(); }, !fb.IsPlaying || fb.IsPaused ? '播放' : '暂停');
	buttons.buttons.previous = new _button(bs * 2, 0, bs, bs, {normal : 'buttons\\previous.png'}, (x, y) => { fb.Prev(); }, '上一首');
	buttons.buttons.next = new _button(bs * 3, 0, bs, bs, {normal : 'buttons\\next.png'}, (x, y) => { fb.Next(); }, '下一首');
}

function on_size() {
	panel.size();
	buttons.update();
}

function on_paint(gr) {
	panel.paint(gr);
	buttons.paint(gr);
}

function on_playback_stop() {
	buttons.update();
	window.Repaint();
}

function on_playback_pause() {
	buttons.update();
	window.Repaint();
}

function on_playback_starting() {
	buttons.update();
	window.Repaint();
}

function on_mouse_move(x, y) {
	buttons.move(x, y);
}

function on_mouse_leave() {
	buttons.leave();
}

function on_mouse_lbtn_up(x, y, mask) {
	buttons.lbtn_up(x, y, mask);
}

function on_mouse_rbtn_up(x, y) {
	return panel.rbtn_up(x, y);
}

function on_colours_changed() {
	panel.colours_changed();
	window.Repaint();
}
