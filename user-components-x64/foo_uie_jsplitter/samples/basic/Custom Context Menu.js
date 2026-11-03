window.DefineScript('自定义上下文菜单', { author: 'T.P Wang / marc2003' });
include('docs/Flags.js');

function on_mouse_lbtn_down(x, y) {
    let _context = fb.CreateContextMenuManager();
    let _basemenu = window.CreatePopupMenu();
    let _child = window.CreatePopupMenu();

    // 从索引 1 开始，而不是 0
    _basemenu.AppendMenuItem(MF_STRING, 1, '项目1');
    _basemenu.AppendMenuItem(MF_STRING, 2, '项目2');
    if (fb.GetNowPlaying()) {
        _child.AppendTo(_basemenu, MF_STRING, '正在播放');
    }
    
    _context.InitNowPlaying();
    _context.BuildMenu(_child, 3);

    const idx = _basemenu.TrackPopupMenu(x, y);
    
    switch (idx) {
        case 0: //用户点击其他位置关闭了菜单，因此构建菜单项时不能使用 0
            break;
        case 1:
            fb.ShowPopupMessage('你已选择项目1。');
            break;
        case 2:
            fb.ShowPopupMessage('好的，项目2 被点击了。');
            break;
        default:
            _context.ExecuteByID(idx - 3);
            break;
    }
}
