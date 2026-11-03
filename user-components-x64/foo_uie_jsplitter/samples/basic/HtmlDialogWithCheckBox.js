window.DefineScript('显示HTML对话框示例', { author: 'TheQwertiest / LUR' });

include(`${fb.ComponentPath}docs/Flags.js`);
include(`${fb.ComponentPath}docs/Helpers.js`);

const htmlCode = utils.ReadTextFile(
    `${fb.ComponentPath}samples/basic/html/PopupWithCheckBox.html`
);

let ww = 0;
let wh = 0;
let text = '点击以打开 ShowHtmlDialog';
const font = gdi.Font('Segoe UI Semibold', 11);

function on_paint(gr) {
    gr.SetTextRenderingHint(TextRenderingHint.ClearTypeGridFit);
    gr.DrawString(
        text,
        font,
        0xFF202020,
        0,
        0,
        ww,
        wh,
        StringFormat(StringAlignment.Center, StringAlignment.Center)
    );
}

function on_size(w, h) {
    ww = w;
    wh = h;
}

function on_mouse_lbtn_up() {
    utils.ShowHtmlDialog(0, htmlCode, {
        width: 460,
        height: 290,
        data: [
            '显示HTML对话框示例',
            '向 HTML 传递数据并回调面板 JavaScript。',
            '来自面板 JavaScript 的问候',
            '记住此选择',
            show_native_dialog,
            dialog_closed
        ]
    });
}

function show_native_dialog(dialogWindow) {
    utils.MessageBox(
        'window.external.dialogWindow 已被回传给面板 JavaScript，并用作此 MessageBox 的所有者。',
        '原生对话框',
        MessageBoxButtons.OK,
        MessageBoxIcon.Information,
        MessageBoxDefaultButton.Button1,
        '',
        dialogWindow
    );
}

function dialog_closed(status, value, checked) {
    text =
        `结果：${status}\n` +
        `文本：${value}\n` +
        `已勾选：${checked}\n\n` +
        '再次点击以打开 ShowHtmlDialog';

    window.Repaint();
}
