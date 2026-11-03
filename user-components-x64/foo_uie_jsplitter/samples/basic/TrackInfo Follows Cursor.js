window.DefineScript('曲目信息跟随光标');
include('docs/Flags.js');
include('docs/Helpers.js');

const font = gdi.Font('Segoe UI', 14, 0);
const tfo = fb.TitleFormat('%title%[ - %artist%]');
let handle = fb.GetFocusItem();

function on_item_focus_change() {
    handle = fb.GetFocusItem();
    window.Repaint();
}

function on_playlist_switch() {
    //因为切换播放列表时不会调用 on_item_focus_change
    //我们必须在此回调内手动调用它
    on_item_focus_change();
}

function on_paint(gr) {
    if (handle) {
        gr.GdiDrawText(tfo.EvalWithMetadb(handle), font, RGB(0, 0, 0), 0, 0, window.Width, window.Height, DT_VCENTER | DT_CENTER | DT_END_ELLIPSIS | DT_CALCRECT | DT_NOPREFIX);
    }
}
