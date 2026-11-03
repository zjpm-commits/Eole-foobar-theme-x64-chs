window.DefineScript('LoadImageAsync', { author: 'T.P Wang' });

// 从文件夹获取 jpg 文件列表
const g_image_list = utils.Glob(`${fb.ComponentPath}samples/basic/images/*.jpg`);
let ww = 0, wh = 0;
let g_img = null;
let g_valid_tid = 0;

// 每 5 秒触发一次。
let g_timer = setInterval(function () {
    load_random_image_async();
}, 5000);

load_random_image_async();

function load_random_image_async() {
    // 从列表中加载一张随机图片
    let path = g_image_list[Math.floor(Math.random() * g_image_list.length)];
    // 图片加载完成后将触发 on_load_image_done
    g_valid_tid = gdi.LoadImageAsync(0, path);
}

function on_size() {
    ww = window.Width;
    wh = window.Height;
}

function on_paint(gr) {
    if (!g_img) {
        return;
    }

    let scale_w = ww / g_img.Width;
    let scale_h = wh / g_img.Height;
    let scale = Math.min(scale_w, scale_h);
    let pos_x = 0, pos_y = 0;
    if (scale_w < scale_h) {
        pos_y = (wh - g_img.Height * scale) / 2;
    }
    else if (scale_w > scale_h) {
        pos_x = (ww - g_img.Width * scale) / 2;
    }
    gr.DrawImage(g_img, pos_x, pos_y, g_img.Width * scale, g_img.Height * scale, 0, 0, g_img.Width, g_img.Height);
}

// 图片在后台加载完成后，将调用此回调
function on_load_image_done(tid, image, image_path) {
    if (g_valid_tid === tid) {
        g_img = image;
        window.Repaint();
    }
}
