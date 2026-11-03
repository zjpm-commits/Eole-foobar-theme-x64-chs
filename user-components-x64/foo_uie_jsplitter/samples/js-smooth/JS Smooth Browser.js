window.DefinePanel("JS Smooth 浏览器", { author : "Br3tt aka Falstaff" });
include(fb.ComponentPath + "samples\\js-smooth\\js\\JScommon.js");
include(fb.ComponentPath + "samples\\js-smooth\\js\\JSinputbox.js");
include(fb.ComponentPath + "samples\\js-smooth\\js\\jssb.js");

/*
[功能]
 * 可有 2 种来源：媒体库或活动播放列表（最初设计为媒体库浏览器）
 * 3 种列模式可用：专辑、艺术家、流派
 * 4 种显示模式可用：列、封面+底部标签、封面+右侧标签、网格封面视图
 * 真正的平滑滚动
 * 支持触屏
 * 顶部标题栏（可用 CTRL+T 隐藏）
 * 垂直滚动条（可用 CTRL+B 隐藏）
 * 筛选框
 * 支持自定义或封面艺术壁纸作为背景（含模糊效果）
 * 兼容 Windows 缩放（可用 CTRL+鼠标滚轮实时调整缩放大小）
 * 自定义面板颜色（在属性窗口中）
 * ……以及更多！

[提示]
 * 对于艺术家列模式，要使磁盘缓存生效，必须在窗口属性中设置艺术家图像路径（SHIFT + 右键 > 属性）
 * 按住 SHIFT 键 + 右键，可显示"配置脚本"和"面板属性"项
 * 在 foobar2000 首选项 > DefaultUI 或 ColumnsUI 中更改颜色和字体
 * 部分次要设置可在窗口属性中更改（SHIFT + 右键 > 属性），请谨慎使用
 * 使用键盘在媒体库视图中"跳转到"某个艺术家/流派（类似 ELPlaylist 的增量搜索功能）
 * 右键点击项目，显示针对所选内容的上下文菜单
 * CTRL+T 切换列工具栏
 * CTRL+B 切换滚动条
 * 按住 CTRL + 鼠标滚轮缩放元素（对"视网膜"屏幕有用）
 * 按住 SHIFT + 鼠标滚轮缩放分组标题，从而调整封面大小
 * F3 键显示正在播放的曲目（若存在于媒体库且未被筛选）
 * F5 键刷新封面
 * ……等等
*/
