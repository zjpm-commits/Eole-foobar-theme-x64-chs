window.DefineScript('StackBlur（文本）', {author: 'T.P Wang / marc2003'});
include('docs/Flags.js');
include('docs/Helpers.js');

const g_font = gdi.Font('Segoe UI', 32, FontStyle.Bold);
const text = '\'堆叠模糊\' 示例';

let ww = 0, wh = 0;
let img_to_blur;

function on_paint(gr) {
    img_to_blur && gr.DrawImage(img_to_blur, 0, 0, ww, wh, 0, 0, ww, wh);
    gr.SetTextRenderingHint(TextRenderingHint.ClearTypeGridFit);
    gr.DrawString(text, g_font, RGB(0, 0, 255), 0, 0, ww, wh, StringFormat(StringAlignment.Center, StringAlignment.Center));
}

function on_size() {
    ww = window.Width;
    wh = window.Height;
    if (ww <= 0 || wh <= 0) {
        return;
    }
    img_to_blur = gdi.CreateImage(ww, wh);
    let g = img_to_blur.GetGraphics();
    g.SetTextRenderingHint(TextRenderingHint.AntiAlias);
    g.DrawString(text, g_font, RGB(0, 0, 255), 0, 0, ww, wh, StringFormat(StringAlignment.Center, StringAlignment.Center));
    img_to_blur.ReleaseGraphics(g);
    // 进行堆叠模糊，半径值可以介于 2 和 254 之间
    img_to_blur.StackBlur(30);
}
