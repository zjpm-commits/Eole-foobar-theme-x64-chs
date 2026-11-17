# Eole-foobar-theme-x64-chs

> 基于 [Ottodix/Eole](https://github.com/Ottodix/Eole-foobar-theme) 深度定制的 foobar2000 x64 中文本地化修改版。
> 专为 **foobar2000 x64** 与 **JSplitter** 插件适配，优化了中文显示效果，并修复了原版在现代 x64 环境下存在的诸多兼容性问题。

## 📖 项目简介

Eole 是一款极其优雅、高度可定制的 foobar2000 主题。原版主要基于 32 位环境和旧版 WSH Panel Mod、foo_ui_columns 、 foo spider monkey panel构建。
随着 foobar2000 x64 和 JSplitter 的普及，原版主题在部分 API 调用上出现了不兼容现象。本项目在原版基础上进行了针对性的重构与汉化。

## 🖼️ 截图展示

<img width="1006" height="636" alt="image" src="https://github.com/user-attachments/assets/ec2ff86e-b030-40ec-a59a-3b0c10bfc472" />

<img width="1006" height="636" alt="image" src="https://github.com/user-attachments/assets/54c0e338-e2f9-4112-a5a3-38f2e8de55e1" />


## 🛠️ 依赖环境

运行此主题需要以下组件：
- foobar2000 x64  [Asion 汉化版](https://pan.baidu.com/s/1FommvFX5Ias7P462XyQ6TA?pwd=fb2k)
- foo_uie_jsplitter [智享阁汉化版](https://pan.baidu.com/s/1ZNeh03ZOwYPRruC2K45Ckw?pwd=shmu)

运行此主题的可选组件：
- foo_openhacks v0.1.5_[汉化修复Snap版](https://github.com/zjpm-commits/foo_openhacks/releases)
- 说明：jsplitter的无边框模式暂时会导致模块加载露出底色的问题未修复，暂时亦不支持“贴靠窗口”自动分屏功能，推荐暂用openhacks体验更好；标题栏右键菜单可选择用jsplitter隐藏边框或是openhacks隐藏边框。未安装 foo_openhacks 插件时，自动回退采用foo_uie_jsplitter的去边框接口接管。
- 无需再安装：foo_ui_columns、foo_ui_hacks、foo_uie_panel_splitter、foo_spider_monkey_panel、foo_Shpeck。
- Lxbox（ [洛雪音源](https://github.com/zjpm-commits/foobar-Lxbox-for-jsplitter/releases)）脚本，附件中已包含。

## 🚀 安装说明

- 确保你已经安装了上述依赖组件。
- 将仓库中的 `themes` 、 `Lxbox` 、`user-components-x64`文件夹完整覆盖到你的配置目录下（通常是 `profile/`文件夹）。
- 在 foobar2000 中导入 `DUI_eole_x64_chs.fth` 配置文件（位于 `Eole/` 目录下）。
- 如果默认字体偏小，按住 `Ctrl + 鼠标滚轮` 进行全局缩放（ `shift+ 鼠标滚轮` 实时调整文字行间距）。
- eole-settings和yttm为我个人的设置配置文件，如果喜欢可以覆盖使用。

## 🔧 修改说明

本项目对原版 JS 脚本进行了诸多针对性修改，主要集中在以下文件：

- 原来的可视化界面改为洛雪音源；
- 修复歌词界面不跟随主题设置问题；
- 优化标题栏鼠标拖放区域覆盖面；
- 修复面板滚动卡顿，优化边界计算；
- 简化和丢弃部分未使用的代码；
- 增加4K屏适配，标题栏右键—设置—高分屏自动适配；
- 字体调整为更利于中文显示的Microsoft YaHei UI；
- 面板属性改为中文以便自行个性化设置；
- 将原来模块化壁纸替换为全屏壁纸伪透明的样式； 
- 减少文件夹层级，配置文件同主题目录便于管理
- 增加第5模式：MilkDrop，标题栏右键菜单启动。

## 🙏 致谢
- 感谢 **Ottodix** 及所有贡献者开发了如此精美的Eole主题。
- 感谢 foobar2000 社区提供 x64 环境下的 JS 宿主 API 支持。
---
*本项目仅作学习与个人定制分享，原主题版权归原作者所有。*
