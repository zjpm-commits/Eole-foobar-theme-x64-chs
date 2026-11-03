"use strict";

window.DrawMode = 1;

include(`${fb.ComponentPath}\\docs\\Flags.js`);
include(`${fb.ComponentPath}\\docs\\Effects.js`);

const img = d2d.Image(`${fb.ComponentPath}\\samples\\d2d\\images\\Flowers.jpg`);
const img2 = d2d.Image(`${fb.ComponentPath}\\samples\\d2d\\images\\Field.jpg`);

const scale = d2d.Effect(Effects.Scale.ID);
scale.SetInput(0, img);
const scale2 = d2d.Effect(Effects.Scale.ID);
scale2.SetInput(0, img2);
const opacity = d2d.Effect(Effects.Opacity.ID);
opacity.SetInputEffect(0, scale);
const opacity2 = d2d.Effect(Effects.Opacity.ID);
opacity2.SetInputEffect(0, scale2);

const blend = d2d.Effect(Effects.Blend.ID);
blend.SetInputEffect(0, opacity);
blend.SetInputEffect(1, opacity2);

let ww = 0, wh = 0;
function on_size(width, height) {
    ww = width;
    wh = height;
	scale.SetValue(Effects.Scale.Scale, new Float32Array([ww / 2 / img.Width, wh / 2 / img.Height]));
	scale2.SetValue(Effects.Scale.Scale, new Float32Array([ww / 2 / img2.Width, wh / 2 / img2.Height]));
}

let font = gdi.Font("Segoe UI", 32, 1);
let g_backcolour = 0xFFFFFFFF;
let mode = 0;
let alpha = 255, alpha2 = 255;
let helpBlend = true, helpAlpha = true, helpAlpha2 = true;
function on_paint(dgr) {
    dgr.FillSolidRect(0, 0, ww, wh, g_backcolour);
		
	opacity.SetValue(Effects.Opacity.Opacity, alpha / 255);	
	dgr.DrawEffect(opacity, 0, wh / 2, 0, 0, ww / 2, wh / 2);
	if(helpAlpha) dgr.DrawText("在此滚动以更改透明度", font, 0xFFFFFFFF, 0, wh / 2, ww / 2, wh / 2, DT_CENTER | DT_VCENTER);
	
	opacity2.SetValue(Effects.Opacity.Opacity, alpha2 / 255);	
	dgr.DrawEffect(opacity2, ww / 2, wh / 2, 0, 0, ww / 2, wh / 2);
	if(helpAlpha2) dgr.DrawText("在此滚动以更改透明度", font, 0xFFFFFFFF, ww / 2, wh / 2, ww / 2, wh / 2, DT_CENTER | DT_VCENTER);
	
	blend.SetValue(Effects.Blend.Mode, mode);
	dgr.DrawEffect(blend, ww / 4, 0, 0, 0, ww / 2, wh / 2);
	if(helpBlend) dgr.DrawText("在此滚动以更改混合模式", font, 0xFFFFFFFF, ww / 4, 0, ww / 2, wh / 2, DT_CENTER | DT_VCENTER);

	dgr.DrawText(`混合模式：${GetModeName(mode)}`, font, 0xFF000000, 0, 0, ww / 4, wh / 2, DT_WORDBREAK);
	dgr.DrawText(`透明度：${alpha}`, font, 0xFF000000, 0, 0, ww / 4, wh / 2, DT_BOTTOM | DT_WORDBREAK);
	dgr.DrawText(`透明度：${alpha2}`, font, 0xFF000000, ww - ww / 4, 0, ww / 4, wh / 2, DT_BOTTOM | DT_RIGHT | DT_WORDBREAK);
}

function GetModeName(mode) {
	switch(mode) {		
		case 0:
			return "正片叠底";
		case 1:
			return "滤色";
		case 2:
			return "变暗";
		case 3:
			return "变亮";
		case 4:
			return "溶解";
		case 5:
			return "颜色加深";
		case 6:
			return "线性加深";
		case 7:
			return "深色";
		case 8:
			return "浅色";
		case 9:
			return "颜色减淡";
		case 10:
			return "线性减淡";
		case 11:
			return "叠加";
		case 12:
			return "柔光";
		case 13:
			return "强光";
		case 14:
			return "亮光";
		case 15:
			return "线性光";
		case 16:
			return "点光";
		case 17:
			return "实色混合";
		case 18:
			return "差值";
		case 19:
			return "排除";
		case 20:
			return "色相";
		case 21:
			return "饱和度";
		case 22:
			return "颜色";
		case 23:
			return "明度";
		case 24:
			return "减去";
		default:
			return "划分";
	}		
}

let lastX = 0, lastY = 0;
function on_mouse_move(x, y, mask) {
	lastX = x;
	lastY = y;	
}

function on_mouse_wheel(step) {
	
	if(lastX > ww / 4 && lastY > 0 && lastX < ww - ww / 4 && lastY < wh / 2)
	{
		helpBlend = false;
		mode += step;
		if(mode == -1) mode = 25;
		if(mode == 26) mode = 0;
	}

	if(lastX > 0 && lastY > wh / 2 && lastX < ww / 2 && lastY < wh)
	{
		helpAlpha = false;
		alpha += step;
		if(alpha == -1) alpha = 255;
		if(alpha == 256) alpha = 0;
	}
		
	if(lastX > ww / 2 && lastY > wh / 2 && lastX < ww && lastY < wh)
	{
		helpAlpha2 = false;
		alpha2 += step;
		if(alpha2 == -1) alpha2 = 255;
		if(alpha2 == 256) alpha2 = 0;
	}
	
	window.Repaint();
}
