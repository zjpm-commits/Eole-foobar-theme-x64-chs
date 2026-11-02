# Eole-foobar-theme-x64-chs

> 基于 [Ottodix/Eole](https://github.com/Ottodix/Eole-foobar-theme) 深度定制的 foobar2000 x64 中文本地化修改版。
> 专为 **foobar2000 x64** 与 **JSplitter** 插件适配，优化了中文显示效果，并修复了原版在现代 x64 环境下存在的诸多兼容性问题。

## 📖 项目简介

Eole 是一款极其优雅、高度可定制的 foobar2000 主题。原版主要基于 32 位环境和旧版 WSH Panel Mod 和 foo spider monkey panel构建。

随着 foobar2000 x64 和 JSplitter 的普及，原版主题在部分 API 调用上出现了不兼容现象。本项目在原版基础上进行了针对性的重构与汉化，使其在 64 位环境下能够完美运行。

## 📖 截图展示

<img width="1127" height="683" alt="image" src="https://github.com/user-attachments/assets/31e287cb-3ffe-49fe-99be-9db1fbfb32b7" />

<img width="1127" height="683" alt="image" src="https://github.com/user-attachments/assets/801bf967-2dba-46aa-8cc8-e1378262dfad" />

## ✨ 主要特性

- **原生无边框窗口 (NoBorder) 适配**：彻底摆脱了对第三方 `foo_openhacks` 的强依赖。
- **UI 细节修复**：
  - 移除了面板之间的 1px 分割线，视觉更统一。
  - 修复了标题栏顶部默认多出的几像素留白。
  - 全局禁用了斜体字体，大幅提升中文标题和标签的阅读清晰度。
- **深度中文化**：所有右键菜单、设置项、错误提示、属性面板均已汉化。
- **兼容性增强**：修复了因 JSplitter 异步加载导致的面板错位、状态丢失等常见 Bug。

## 🛠️ 依赖环境

运行此主题需要以下组件：
- **foobar2000 x64 Asion汉化版 (x64 版本)
- **foo_ui_columns** (CUI 界面组件)
- **foo_uie_jsplitter** (推荐 v4.6 及以上版本，用于替代旧版 WSH Panel Mod 和 foo spider monkey panel)
- *注意：无需再安装 `foo_openhacks` 或 `foo_openhacks_mod`，已通过原生 API 替代。*

## 🚀 安装与使用

1. 确保你已经安装了上述依赖组件。
2. 将仓库中的 `themes` 文件夹完整复制到你的 foobar2000 配置目录下（通常是 `profile/`）。
3. 在 foobar2000 中导入 `columnsUI_eole_x64.fcl` 配置文件（位于 `themes/eole/` 目录下）。
4. 重启 foobar2000。
5. *(可选)* 如果默认字体偏小，可在 foobar2000 设置中调整 CUI 的默认字体大小，或者在主题面板上按住 `Ctrl + 鼠标滚轮` 进行全局缩放。
6. 字体的行间距或者播放列表的间距可以通过 `shift+ 鼠标滚轮` 进行全局调整。
7. 【如果你还觉得安装比较复杂，最简单的方式就是复制所有文件覆盖到 `profile/`文件夹下，然后执行第3步即可。】

## 🔧 核心修改说明（开发者参考）

本项目对原版 JS 脚本进行了诸多针对性修复，主要集中在以下文件：

### 1. `JStheme_common.js` (全局公共库)
- **重构了 `oUIHacks` 类**：移除了对外部 ActiveX 插件的依赖，全面拥抱 `fb.Window`。
- **修复了窗口状态判断**：通过 `fb.Window.IsMaximized` 等布尔值结合 `Maximize()` / `Minimize()` 方法，解决了 x64 环境下按钮失效的问题。
- **强制去除了全局斜体**：将 `g_fstyle_light` 设为 `0`，并将所有 `g_font.italicxxx` 替换为正常字体。

### 2. `WSHsmoothplaylist_trackinfos.js` 等子面板
- **修复 JSplitter 滚动卡顿**：优化了 `getlimits()` 的边界计算。
- **字体优化**：禁用了原有斜体显示部分，保证播放列表和曲目信息完美对齐。

## 🙏 致谢
- 感谢 **Ottodix** 及所有贡献者开发了如此精美的 Eole 主题。
- 感谢 foobar2000 社区提供 x64 环境下的 JS 宿主 API 支持。

---
*本项目仅作学习与个人定制分享，原主题版权归原作者所有。*
