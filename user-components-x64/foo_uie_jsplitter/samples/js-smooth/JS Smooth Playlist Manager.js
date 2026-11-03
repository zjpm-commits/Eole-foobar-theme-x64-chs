window.DefinePanel("JS Smooth 播放列表管理器", { author : "Br3tt aka Falstaff", features : { drag_n_drop : true }});
include(fb.ComponentPath + "samples\\js-smooth\\js\\JScommon.js");
include(fb.ComponentPath + "samples\\js-smooth\\js\\JSinputbox.js");
include(fb.ComponentPath + "samples\\js-smooth\\js\\jsspm.js");


/*
[功能]
 * 用鼠标拖动项目来排列播放列表顺序
 * 可用预定义自动播放列表
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
 * 按住 SHIFT 键 + 右键，可显示"配置脚本"和"面板属性"项
 * 在 foobar2000 首选项 > DefaultUI 或 ColumnsUI 中更改颜色和字体
 * 部分次要设置可在窗口属性中更改（SHIFT + 右键 > 属性），请谨慎使用
 * 右键点击项目，显示针对所选内容的上下文菜单
 * CTRL+T 切换列工具栏
 * CTRL+B 切换滚动条
 * 按住 CTRL + 鼠标滚轮缩放元素（对"视网膜"屏幕有用）
 * 按住 SHIFT + 鼠标滚轮缩放分组标题，从而调整封面大小
 * F2 键重命名所选/活动播放列表
 * ……等等
*/
