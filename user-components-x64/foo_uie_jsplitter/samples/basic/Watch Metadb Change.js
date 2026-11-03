window.DefineScript('监视元数据变化', { author: 'T.P Wang' });

// 回调
function on_metadb_changed(handle_list) {
    let count = handle_list.Count;
    // 显示有多少个文件被更改
    fb.ShowPopupMessage(count + ' 个文件已被更改。');
}
