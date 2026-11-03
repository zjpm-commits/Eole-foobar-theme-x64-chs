window.DefineScript('遮罩应用', { author: 'T.P Wang / marc2003' });
include('docs/Flags.js');
include('docs/Helpers.js');

const g_img = gdi.Image(`${fb.ComponentPath}samples/basic/images/post.jpg`);
const g_mask = gdi.Image(`${fb.ComponentPath}samples/basic/images/mask.png`);
const font = gdi.Font('Segoe UI', 16, 1);

let ww = 0, wh = 0;
let applied = false;

function on_size() {
    ww = window.Width;
    wh = window.Height;
}

function on_paint(gr) {
    if (g_img) {
        // 保持宽高比
        let scale_w = ww / g_img.Width;
        let scale_h = wh / g_img.Height;
        let scale = Math.min(scale_w, scale_h);
        let pos_x = 0, pos_y = 0;
        if (scale_w < scale_h)
            pos_y = (wh - g_img.Height * scale) / 2;
        else if (scale_w > scale_h)
            pos_x = (ww - g_img.Width * scale) / 2;
        gr.DrawImage(g_img, pos_x, pos_y, g_img.Width * scale, g_img.Height * scale, 0, 0, g_img.Width, g_img.Height);
    }
    if (!applied) {
        gr.FillSolidRect(0, 0, ww, 24, RGB(0, 0, 0));
        gr.GdiDrawText('双击面板以应用遮罩', font, RGB(255, 255, 255), 0, 0, ww, 24, DT_CENTER);
    }
}

function on_mouse_lbtn_dblclk() {
    if (!applied) {
        apply();
    }
}

function apply() {
    let g_img_mask = g_mask;
    // 遮罩 *必须* 与 g_img 尺寸一致
    let mask = g_img_mask.Resize(g_img.Width, g_img.Height);
    // 将遮罩应用到 g_img
    g_img.ApplyMask(mask);
    applied = true;
    window.Repaint();
}
