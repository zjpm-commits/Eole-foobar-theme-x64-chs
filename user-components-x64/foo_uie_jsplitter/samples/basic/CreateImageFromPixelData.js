"use strict";

// 使用真实图片的像素数据作为示例
const example = gdi.Image(`${fb.ComponentPath}\\samples\\d2d\\images\\Field.jpg`).GetPixelData();

// 创建一个临时文件夹
const filePath = "js_data\\temp\\Field.bin";
if (!utils.IsDirectory(fb.ProfilePath + filePath)) { utils.CreateFolder(fb.ProfilePath + 'js_data\\temp\\'); }

// 将数据写入文件，再加载它
utils.WriteBinaryFile(fb.ProfilePath + filePath, example);
const imgPixelData = utils.ReadBinaryFile(fb.ProfilePath + filePath);
const img = gdi.CreateImageFromPixelData(imgPixelData, 2208, 1242);

function on_paint(gr) {
	gr.DrawImage(img, 0, 0, img.Width, img.Height, 0, 0, img.Width, img.Height);
}
