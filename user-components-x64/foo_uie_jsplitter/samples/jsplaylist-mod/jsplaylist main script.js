window.DefinePanel('JSPlaylist', {author: 'Br3tt', version: 'SMP-Mod', features: {drag_n_drop: true}});

['WSHcommon.js',
'WSHinputbox.js',
'WSHtopbar.js',
'WSHscrollbar.js',
'WSHheaderbar.js',
'WSHplaylist.js',
'WSHplaylistmanager.js',
'WSHsettings.js',
'main.js'].forEach(function (item) {
	include(fb.ComponentPath + 'samples\\jsplaylist-mod\\js\\' + item);
});

/*
[功能]
 * 分组（折叠或展开、添加额外行……）
 * 自定义分组依据模式，附带类似 ELPlaylist 的播放列表筛选功能
 * 自定义面板颜色
 * 平滑滚动
 * 按你的需要排列列，用 titleformatting 创建自定义列并指定颜色
 * 顶部播放列表表头（可禁用）
 * 支持壁纸作为背景（含全新的模糊效果）
 * 可折叠的播放列表管理器面板
 * 内置设置面板（仍有少量参数需在面板属性中编辑）
 * 点击列头排序
 * 兼容 Windows 缩放（dpi）
 * 播放统计引擎（更新文件标签，现于曲目结束时异步执行）
 * ……以及更多！

[提示]
 * 按住 SHIFT 键 + 右键点击工具栏，可显示"配置脚本"和"面板属性"项
 * 在 foobar2000 首选项 > DefaultUI 或 ColumnsUI 中更改颜色和字体
 * 部分次要设置可在窗口属性中更改（右键点击播放列表项 > 设置...），请谨慎使用！主要设置现已内置在面板中，带图形界面
 * 左键点击列头，按该字段对播放列表排序
 * 右键点击列工具栏，编辑列与分组的布局和功能
 * 使用键盘在播放列表中搜索艺术家（类似 ELPlaylist 的增量搜索功能），或在播放列表中导航
 * 右键点击项目，显示针对所选内容的上下文菜单
 * TAB 键或中键点击，切换播放列表管理器
 * CTRL+T 切换列工具栏
 * CTRL+I 切换顶部信息面板
 * CTRL+C、CTRL+X、CTRL+V 使用 Windows 剪贴板复制/剪切/粘贴。剪贴板内容现可粘贴到 Windows 资源管理器中。
 * 按住 CTRL + 鼠标滚轮缩放元素（对"视网膜"屏幕有用）
 * F2 键在播放列表管理器面板中重命名活动播放列表
 * F5 键刷新封面
 * 列 TF 中处理的特殊字段：%list_index%、%list_total%、%isplaying%
 * 特殊 TF 函数，为其后的文本指定颜色：$rgb(r,g,b)，其中 r,g,b 为十进制值 [0;255]
   不要在测试条件比较中使用 $rgb(,r,g,b)，而应始终用于结果部分（then 或 else）：
   ==> 避免这样：$if($rgb(0,0,0)%title%,%title%,,)
   ==> 而应这样：$if(%title%,$rgb(0,0,0)%title%,,)
 * 播放列表筛选分组模式：通过"分组"设置选项卡，或右键点击播放列表管理器项，为播放列表设置分组依据模式
 * ……等等
*/
