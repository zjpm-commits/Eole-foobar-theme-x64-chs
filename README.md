# Eole-foobar-theme-x64-chs

> 基于 [Ottodix/Eole](https://github.com/Ottodix/Eole-foobar-theme) 深度定制的 foobar2000 x64 中文本地化修改版。
> 专为 **foobar2000 x64** 与 **JSplitter** 插件适配，优化了中文显示效果，并修复了原版在现代 x64 环境下存在的诸多兼容性问题。

## 📖 项目简介

Eole 是一款极其优雅、高度可定制的 foobar2000 主题。原版主要基于 32 位环境和旧版 WSH Panel Mod 构建。

随着 foobar2000 x64 和 JSplitter 的普及，原版主题在部分 API 调用上出现了不兼容现象（如窗口拖拽失效、最大化留白、字体渲染异常等）。本项目在原版基础上进行了针对性的重构与汉化，使其在 64 位环境下能够完美运行。

## 📖 截图展示

<img width="979" height="603" alt="image" src="https://github.com/user-attachments/assets/0ef274d2-270c-4a53-8e1f-9a015de93f26" />

<img width="979" height="603" alt="image" src="https://github.com/user-attachments/assets/4e35bd77-935e-4f4f-994e-0d8a081e7aca" />


## ✨ 主要特性

- **原生无边框窗口 (NoBorder) 适配**：彻底摆脱了对第三方 `foo_openhacks` 的强依赖，利用 foobar2000 原生的 `fb.Window` API 实现完美的拖拽、最小化和最大化。
- **UI 细节修复**：
  - 移除了面板之间的 1px 分割线，视觉更统一。
  - 修复了标题栏顶部默认多出的几像素留白。
  - 全局禁用了斜体字体，大幅提升中文标题和标签的阅读清晰度。
- **深度中文化**：所有右键菜单、设置项、错误提示、属性面板均已汉化。
- **兼容性增强**：修复了因 JSplitter 异步加载导致的面板错位、状态丢失等常见 Bug。

## 🛠️ 依赖环境

运行此主题需要以下组件：
- **foobar2000** (x64 版本)
- **Columns UI** (CUI 界面组件)
- **JSplitter** (推荐 v4.x 及以上版本，用于替代旧版 WSH Panel Mod)
- *注意：无需再安装 `foo_openhacks` 或 `foo_openhacks_mod`，已通过原生 API 替代。*

## 🚀 安装与使用

1. 确保你已经安装了上述依赖组件。
2. 将仓库中的 `themes` 文件夹完整复制到你的 foobar2000 配置目录下（通常是 `profile\`）。
3. 在 foobar2000 中导入 `columnsUI_eole_x64.fcl` 配置文件（位于 `themes/eole/` 目录下）。
4. 重启 foobar2000。
5. *(可选)* 如果默认字体偏小，可在 foobar2000 设置中调整 CUI 的默认字体大小，或者在主题面板上按住 `Ctrl + 鼠标滚轮` 进行全局缩放。
6. 字体的行间距或者播放列表的间距可以通过 `shift+ 鼠标滚轮` 进行全局调整。
7. 【如果你还觉得安装比较复杂，最简单的方式就是复制所有文件到 `profile\`文件夹下，然后执行第3步即可。】

## 🔧 核心修改说明（开发者参考）

本项目对原版 JS 脚本进行了诸多针对性修复，主要集中在以下文件：

### 1. `JStheme_common.js` (全局公共库)
- **重构了 `oUIHacks` 类**：移除了对外部 ActiveX 插件的依赖，全面拥抱 `fb.Window`。
- **修复了窗口状态判断**：通过 `fb.Window.IsMaximized` 等布尔值结合 `Maximize()` / `Minimize()` 方法，解决了 x64 环境下按钮失效的问题。
- **强制去除了全局斜体**：将 `g_fstyle_light` 设为 `0`，并将所有 `g_font.italicxxx` 替换为正常字体。

### 2. `Eole_x64_layout.js` (布局控制器)
- **消除留白**：通过 `TITLEBAR_SHIFT` 对 TitleBar 进行负向偏移（向上提），并配合 `FrameStyle = 2` (NoBorder) 裁掉顶部系统空隙。
- **消除分割线**：引入 `PANEL_OVERLAP` 机制，让相邻面板在坐标上产生 2px 的重叠，利用后加载的面板遮挡前者绘制的边线。

### 3. `WSHsmoothplaylist_trackinfos.js` 等子面板
- **修复 JSplitter 滚动卡顿**：优化了 `getlimits()` 的边界计算。
- **字体硬化**：独立剥离了原本写死的斜体，保证播放列表和曲目信息完美对齐。

## ❓ 常见问题 (FAQ)

**Q: 为什么窗口右上角的最大化/最小化按钮点击没反应？**
A: 请确保你使用的是 JSplitter v4.x。如果是旧版组件，请更新组件。本项目已弃用 OpenHacks 插件，依赖新版原生 API。

**Q: 为什么标题栏没法拖拽了？**
A: 请检查是否安装了原版的 `foo_openhacks.dll`。如果存在，请将其移除，因为新旧 API 冲突会导致伪标题栏（Pseudo Caption）失效。

**Q: 想恢复默认的斜体怎么办？**
A: 请使用 Git 回退 `JStheme_common.js` 中 `get_font()` 函数相关的更改，将字体样式参数的 `0` 改回 `2`。

## 🙏 致谢
- 感谢 **Ottodix** 及所有贡献者开发了如此精美的 Eole 主题。
- 感谢 foobar2000 社区提供 x64 环境下的 JS 宿主 API 支持。

---
*本项目仅作学习与个人定制分享，原主题版权归原作者所有。*
