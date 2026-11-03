"use strict";

include(`${fb.ComponentPath}\\docs\\Flags.js`);

let ww = 0;
let wh = 0;

function on_size(width, height) {
    ww = width;
    wh = height;
}

let result = DialogResult.None;
const msg = "你点击了 ";
let str = msg + "无";

function on_paint(gr) {
	gr.GdiDrawText(
		str, 
		gdi.Font("Segoe UI", 48, 1), 
		window.InstanceType == UIInstanceType.DefaultUI ?
			window.GetColourDUI(ColourTypeDUI.text) : 
			window.GetColourCUI(ColourTypeCUI.text), 
		0, 0, ww, wh, 
		DT_CENTER | DT_VCENTER | DT_CALCRECT
	);
}

function on_mouse_lbtn_down(x, y) {
		
	let result = utils.MessageBox(
		"想来点乐趣吗？", "提问", 
		MessageBoxButtons.YesNo, 
		MessageBoxIcon.Question);
	
	if(result == DialogResult.No) {
		utils.MessageBox(
			"你真没劲……好吧，再见。", 
			"信息", 
			MessageBoxButtons.OK, 
			MessageBoxIcon.Information);
		str = "再见！";
	}
	else {
		result = utils.MessageBox(
			"好的，选择你的图腾动物：\n\n是 - 一头牛\n否 - 一条狗\n取消 - 我不玩这个游戏！\n\n或者你需要一些帮助？（按帮助）", 
			"提问", 
			MessageBoxButtons.YesNoCancel, 
			MessageBoxIcon.Warning,
			MessageBoxDefaultButton.Button3, 
			"https://google.com");
		switch(result)
		{
		case DialogResult.Yes:
			str = msg + "是！";
			break;
		case DialogResult.No:
			str = msg + "否！";
			break;
		default:
			str = msg + "取消！";
			break;
		}	
	}
	
	window.Repaint();
}
