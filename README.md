# Eole-foobar-theme-x64-chs

> 基于 [Ottodix/Eole](https://github.com/Ottodix/Eole-foobar-theme) 深度定制的 foobar2000 x64 中文本地化修改版。
> 专为 **foobar2000 x64** 与 **JSplitter** 插件适配，优化了中文显示效果，并修复了原版在现代 x64 环境下存在的诸多兼容性问题。

## 📖 项目简介

Eole 是一款极其优雅、高度可定制的 foobar2000 主题。原版主要基于 32 位环境和旧版 WSH Panel Mod、foo_ui_columns 、 foo spider monkey panel构建。
随着 foobar2000 x64 和 JSplitter 的普及，原版主题在部分 API 调用上出现了不兼容现象。本项目在原版基础上进行了针对性的重构与汉化。

## 📖 截图展示

<img width="1127" height="683" alt="image" src="https://github.com/user-attachments/assets/31e287cb-3ffe-49fe-99be-9db1fbfb32b7" />

<img width="1127" height="683" alt="image" src="https://github.com/user-attachments/assets/801bf967-2dba-46aa-8cc8-e1378262dfad" />

## 🛠️ 依赖环境

运行此主题需要以下组件：
- foobar2000 x64 v2.25.10（Asion 汉化版）
- foo_uie_jsplitter v4.3.4版（智享阁汉化版）
- 无需再安装：foo_ui_columns、foo_ui_hacks、foo_uie_panel_splitter、foo_spider_monkey_panel、foo_Shpeck。

其他运行所需脚本或程序：
- Lxbox（洛雪在线音源）脚本，附件中已包含。
- tools为去除win11主题边框强调色边框的程序。

## 🚀 安装说明

- 确保你已经安装了上述依赖组件。
- 将仓库中的 `themes` 、 `Lxbox` 文件夹完整复制到你的 foobar2000 配置目录下（通常是 `profile/`）。
- 在 foobar2000 中导入 `DUI_eole_x64_chs.fth` 配置文件（位于 `themes/eole/` 目录下）。
- 如果默认字体偏小，按住 `Ctrl + 鼠标滚轮` 进行全局缩放（ `shift+ 鼠标滚轮` 实时调整文字行间距）。
- eole-settings为我个人的设置配置文件，如果喜欢可以覆盖使用。

## 🔧 修改说明

本项目对原版 JS 脚本进行了诸多针对性修改，主要集中在以下文件：

- 原来的可视化界面改为洛雪在线音源；
- 修复歌词界面不跟随主题设置问题；
- 优化标题栏鼠标拖放区域覆盖面；
- 修复面板滚动卡顿，优化边界计算；
- 简化和丢弃部分未使用的代码；
- 增加4K屏适配，标题栏右键—设置—高分屏自动适配；
- 字体调整为更利于中文显示的Microsoft YaHei UI；
- 面板属性改为中文以便个性化设置看不懂；

## 🙏 致谢
- 感谢 **Ottodix** 及所有贡献者开发了如此精美的 Eole 主题。
- 感谢 foobar2000 社区提供 x64 环境下的 JS 宿主 API 支持。
---
*本项目仅作学习与个人定制分享，原主题版权归原作者所有。*
