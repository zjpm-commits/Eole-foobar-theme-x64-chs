window.DefineScript('主菜单管理器（整合）', { author: 'YBStone / T.P Wang / marc2003' });
include('docs/Flags.js');
include('docs/Helpers.js');

const img = gdi.Image(`${fb.ComponentPath}samples/basic/images/cog.png`);

function on_paint(gr) {
    gr.DrawImage(img, 0, 0, img.Width, img.Height, 0, 0, img.Width, img.Height);
}

function on_mouse_lbtn_up(x, y) {
    if (x > 0 && x < img.Width && y > 0 && y < img.Height) {
        menu();
    }
}

function menu() {
    let basemenu = window.CreatePopupMenu();
    let contextman = fb.CreateContextMenuManager();
    contextman.InitNowPlaying();
    
    let child1 = window.CreatePopupMenu(); //文件
    let child2 = window.CreatePopupMenu(); //编辑
    let child3 = window.CreatePopupMenu(); //视图
    let child4 = window.CreatePopupMenu(); //播放
    let child5 = window.CreatePopupMenu(); //媒体库
    let child6 = window.CreatePopupMenu(); //帮助
    let child7 = window.CreatePopupMenu(); //正在播放
    
    let menuman1 = fb.CreateMainMenuManager();
    let menuman2 = fb.CreateMainMenuManager();
    let menuman3 = fb.CreateMainMenuManager();
    let menuman4 = fb.CreateMainMenuManager();
    let menuman5 = fb.CreateMainMenuManager();
    let menuman6 = fb.CreateMainMenuManager();
    
    // MF_STRING 定义在 docs/Flags.js 中
    child1.AppendTo(basemenu, MF_STRING, '文件');
    child2.AppendTo(basemenu, MF_STRING, '编辑');
    child3.AppendTo(basemenu, MF_STRING, '视图');
    child4.AppendTo(basemenu, MF_STRING, '播放');
    child5.AppendTo(basemenu, MF_STRING, '媒体库');
    child6.AppendTo(basemenu, MF_STRING, '帮助');
    basemenu.AppendMenuSeparator();
    child7.AppendTo(basemenu, MF_STRING, '正在播放');
    
    menuman1.Init('file');
    menuman2.Init('edit');
    menuman3.Init('View');
    menuman4.Init('playback');
    menuman5.Init('library');
    menuman6.Init('help');
    
    menuman1.BuildMenu(child1, 1, 200);
    menuman2.BuildMenu(child2, 201, 200);
    menuman3.BuildMenu(child3, 401, 200);
    menuman4.BuildMenu(child4, 601, 300);
    menuman5.BuildMenu(child5, 901, 300);
    menuman6.BuildMenu(child6, 1201, 100);
    
    contextman.InitNowPlaying();
    contextman.BuildMenu(child7, 1301);
    const ret = basemenu.TrackPopupMenu(0, 0);

    if (ret >= 1 && ret < 201) {
        menuman1.ExecuteByID(ret - 1);
    }
    else if (ret >= 201 && ret < 401) {
        menuman2.ExecuteByID(ret - 201);
    }
    else if (ret >= 401 && ret < 601) {
        menuman3.ExecuteByID(ret - 401);
    }
    else if (ret >= 601 && ret < 901) {
        menuman4.ExecuteByID(ret - 601);
    }
    else if (ret >= 901 && ret < 1201) {
        menuman5.ExecuteByID(ret - 901);
    }
    else if (ret >= 1201 && ret < 1301) {
        menuman6.ExecuteByID(ret - 1201);
    }
    else if (ret >= 1301) {
        contextman.ExecuteByID(ret - 1301);
    }
}
