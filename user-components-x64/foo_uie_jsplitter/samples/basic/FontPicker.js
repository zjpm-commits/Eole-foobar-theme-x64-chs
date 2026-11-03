"use strict";

include(`${fb.ComponentPath}\\docs\\Flags.js`);

let font = gdi.Font("Segoe UI", 32);

function on_paint(gr) {
    gr.GdiDrawText("测试文字", font, 0xFF000000, 0, 0, window.Width, window.Height, DT_SINGLELINE | DT_CENTER | DT_VCENTER);
}

function on_mouse_lbtn_down(x, y, mask) {
	const ft = utils.FontPicker(font);
	if(ft == font) 
		fb.ShowPopupMessage("用户取消了对话框", "取消");
	else {
		font = ft;	
		window.Repaint();
	}
}
