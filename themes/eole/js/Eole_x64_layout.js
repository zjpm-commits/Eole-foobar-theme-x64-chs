// ============================================================================
// Eole 布局脚本 —— JSplitter x64 版
// ----------------------------------------------------------------------------
// 这个面板本身什么都不画，它只干一件事：按当前窗口尺寸和皮肤里的各种开关，
// 把同一个窗口里的其它子面板（标题栏、封面、播放控制、筛选器、媒体库、
// 播放列表、右侧栏……）摆到该在的位置、给该有的尺寸。所有面板都是
// 「绝对坐标 + Move」，没有用到 splitter 的自动分割。
//
// 数据来源：Eole 的各个面板把设置写成文件，路径形如
//     <foobar2000 配置目录>\wsh-data\eole-settings\<键名>_<值>
// 例如 RIGHTPLAYLISTWIDTH_240 就表示右侧栏宽 240。所以本脚本不去问面板
// 要设置，而是直接枚举这个目录里的文件名——这也是后面必须用 utils.Glob
// 的原因。目录里同一个键只会存在一个文件（换值时先删旧的再写新的）。
// ============================================================================
// 原始面板脚本作者：Ottodix 及贡献者，这里是本地适配版。
window.DefinePanel('Eole x64 layout', {author: 'Eole contributors / local adaptation'});

// 设置文件目录。结尾的反斜杠是有意的，后面直接拼键名前缀。
var settingRoot = fb.ProfilePath + 'wsh-data\\eole-settings\\';

// ----------------------------------------------------------------------------
// setting(prefix, fallback)
// 读一个 Eole 设置项。目录里同一个键只会有一个文件，名字是 "<prefix>_<数值>"，
// 所以用 Glob 匹配 "<prefix>_*" 拿到文件后，把最后一个下划线之后的字符串转成
// 数字就是值。读不到文件、文件名被改坏、或者值不是数字时，返回 fallback。
// ----------------------------------------------------------------------------
function setting(prefix, fallback) {
    try {
        var files = utils.Glob(settingRoot + prefix + '_*');
        if (!files.length) return fallback;                       // 这个键没被写过 → 用默认值
        var value = Number(files[0].substring(files[0].lastIndexOf('_') + 1));
        return isFinite(value) ? value : fallback;                // NaN / Infinity 一律当没读到
    } catch (e) { return fallback; }                              // Glob 本身不可用时也别让布局崩掉
}

// ----------------------------------------------------------------------------
// getPanel(names) —— 按名字取子面板，取不到返回 null
// ----------------------------------------------------------------------------
// 为什么不直接写 window.GetPanel(name)：
//   1) 名字不存在时，不同 JSplitter 版本行为不一致（有的返回 null，有的直接
//      抛异常）。抛异常会把整个 arrange() 打断，后面的面板就一个都不归位了，
//      所以这里一律包 try/catch，取不到就当"这块地没人"。
//   2) GetPanel 只认精确名字，所以允许传候选名数组，按顺序返回第一个找到的。
//      用于"这个位置放哪种面板都行"的场景，例如播放列表那个槽位可能装的是
//      BottomPlaylist，也可能装的是 NowPlayingPlaylist。
//
// 注意：这里不再做"猜名字"（原先有个 unknownPanel()，靠"不属于标准面板集合"
// 这个特征去认领第三方面板）。第三方面板的名字已经确定是 Lxbox，直接按名字
// 取就行；留着猜名字反而危险——以后要是再多装一个非标准面板，可能会被抢过来
// 塞进 Lxbox 的位置。
function getPanel(names) {
    if (typeof names === 'string') names = [names];
    for (var i = 0; i < names.length; ++i) {
        try {
            var p = window.GetPanel(names[i]);
            if (p) return p;
        } catch (e) {}                                            // 这个名字不存在 / 取失败，试下一个
    }
    return null;
}

// 上一次排好的布局指纹（宽:高:关键设置）。相同就直接 return，避免每次
// 定时器触发都无谓地 Move 一遍所有面板（会引起闪烁和额外重绘）。
var previousLayout = "";

// "曲目详情"（封面面板里的文字条 + 评级）占的高度。右侧栏宽度就是封面边长，
// 详情关掉时面板要比"宽"再高出这一截，才不至于把封面压成扁的。
// 想换成别的比例就改这一个数：0 = 开关都保持正方形面板；97 = 85 文字 + 12 评级。
var INFO_EXTRA_HEIGHT = 41;

// 参与"布局指纹"的设置键。只有这些键变化才需要重排；其余设置（颜色、字体、
// 滚动条等等）不影响位置，不必触发。
var FINGERPRINT_KEYS = ['MAINPANEL', 'LAYOUT', 'COMPACTTITLEBAR', 'LIBRARYFILTER', 'LIBRARYFILTERWIDTH',
    'LIBRARYTREE', 'PLAYLISTPANELWIDTH', 'FILTERSPANEL', 'FILTER1', 'FILTER2', 'FILTER3', 'LYRICS',
    'NOWPLAYINGLIB', 'NOWPLAYINGPLAYLIST', 'NOWPLAYINGBIO', 'NOWPLAYINGVISU', 'RIGHTPLAYLISTWIDTH',
    'COVERPANELBIG', 'COVERPANELMINI', 'MINICONTROLBAR', 'SHOWTRACKINFOBIG', 'SHOWTRACKINFOSMALL',
    'TRACKINFOSLIB', 'TRACKINFOSPLAYLIST', 'TRACKINFOSBIO', 'TRACKINFOSVISU', 'TRACKINFOSTEXT'];

// ----------------------------------------------------------------------------
// snapshot()
// 生成"布局指纹"。只做一次 Glob 枚举，把上面这些键的当前值按固定顺序拼成
// 一个字符串。这样每个 tick 只花一次目录枚举，而不是 28 次 setting()。
// Glob 不可用时返回 null——调用方会退化成"每次都重排"，宁可多算也不漏排。
// ----------------------------------------------------------------------------
function snapshot() {
    var files = null;
    try { files = utils.Glob(settingRoot + "*"); } catch (e) { files = null; }
    if (!files) return null;
    var map = {};
    for (var i = 0; i < files.length; ++i) {
        var path = String(files[i]);
        // 从完整路径里切出"键名"和"值"：
        //   ...\eole-settings\RIGHTPLAYLISTWIDTH_240
        //   us = 最后一个下划线位置，sl = 最后一个路径分隔符位置
        // us > sl 保证下划线属于文件名而不是目录名。
        var us = path.lastIndexOf('_'), sl = Math.max(path.lastIndexOf('\\'), path.lastIndexOf('/'));
        if (us > sl && us > 0) map[path.substring(sl + 1, us)] = path.substring(us + 1);
    }
    var out = [];
    // 固定顺序输出，缺失的键用空串占位，保证不同键的组合一定得到不同字符串。
    for (var k = 0; k < FINGERPRINT_KEYS.length; ++k) out.push(map[FINGERPRINT_KEYS[k]] || '');
    return out.join(',');
}

// ============================================================================
// arrange() —— 核心：按当前窗口尺寸 + 设置，重新摆放所有子面板
// ----------------------------------------------------------------------------
// 流程：算尺寸 → 取指纹（没变就退出）→ 全部隐藏 → 按模式逐个 Move/Show →
//       重绘。先全隐藏是为了让"这次不该出现"的面板不会残留上一次的位置。
// ============================================================================
function arrange() {
    var w = window.Width, h = window.Height;
    if (w < 1 || h < 1) return;                                  // 窗口最小化/还没初始化的尺寸，跳过

    // —— 变化检测：宽、高、以及 28 个关键设置任一变化才继续往下走 ——
    var fp = snapshot();
    if (fp !== null) {
        var layoutKey = w + ":" + h + ":" + fp;
        if (layoutKey === previousLayout) return;                // 什么都没变，直接省掉整轮 Move
        previousLayout = layoutKey;
    }
    // 指纹取不到（Glob 异常）时不 return，每次都老实重排一遍。

    // —— 顶栏 / 底栏高度 ——
    var mode = setting('MAINPANEL', 0), mini = setting('LAYOUT', 0);   // mode: 主面板布局 0~3；mini: 迷你模式
    var compact = setting('COMPACTTITLEBAR', 0);                       // 紧凑标题栏：0 普通 / 1 紧凑 / 其它 介于两者
    var top = compact === 0 || mini ? 64 : compact === 1 ? 36 : 50;
    // 底部播放控制栏：迷你模式 43 或 51（显示曲目信息时更高）；
    // 普通模式：迷你控制栏关闭 72，否则看是否显示曲目信息 54/47。
    var bottom = mini ? (setting('SHOWTRACKINFOSMALL', 0) ? 51 : 43) :
        !setting('MINICONTROLBAR', 1) ? 72 : setting('SHOWTRACKINFOBIG', 1) ? 54 : 47;
    var bodyHeight = Math.max(1, h - top - bottom);                    // 中间主体区高度（至少 1px，防负数）

    // —— 右侧栏宽度 ——
    // suffix 跟着主面板模式走：0=媒体库、1=播放列表、2=传记、3=可视化。
    // 右侧栏的开关和曲目信息开关都是"每个模式各存一份"的。
    var suffix = ['LIB', 'PLAYLIST', 'BIO', 'VISU'][mode] || 'LIB';
    // 迷你模式没有主区，右侧栏直接铺满整个宽度；否则看当前模式的开关，
    // 宽度取设置值与窗口 40% 中较小的那个，防止把主区挤没。
    var right = mini ? w : setting('NOWPLAYING' + suffix, 1) ?
        Math.min(setting('RIGHTPLAYLISTWIDTH', 210), Math.floor(w * 0.4)) : 0;
    var mainWidth = w - right;

    // —— 先把所有子面板藏起来 ——
    // 按索引遍历（和原版一致），这样连名字不规范的面板也一起藏掉，
    // 上一轮摆过、这一轮不该出现的位置就不会留下残影。
    var panelCount = 0;
    try { panelCount = window.GetPanelCount(); } catch (e) { panelCount = 0; }
    for (var i = 0; i < panelCount; ++i) {
        try { window.GetPanelByIndex(i).Show(false); } catch (e) {}   // 单个面板取失败不影响其它
    }

    // —— 摆一个面板的小工具 ——
    // names 可以是单个名字或候选名数组；width/height <= 0 视为"这块地不存在"，直接不摆。
    // Move → Show → Move：某些宿主会忽略"面板还处于隐藏状态"时下发的 Move，
    // 显示之后补一刀更稳。返回面板对象，方便外面用 `A || B` 写"优先 A，没有就退回 B"。
    function panel(names, x, y, width, height) {
        if (width <= 0 || height <= 0) return null;
        var p = getPanel(names);
        if (!p) return null;
        try {
            var px = Math.round(x), py = Math.round(y);
            var pw = Math.max(1, Math.round(width)), ph = Math.max(1, Math.round(height));
            p.Move(px, py, pw, ph);
            p.Show(true);
            p.Move(px, py, pw, ph);
        } catch (e) { return null; }
        return p;
    }

    // —— 顶栏：永远占满宽度，高度按上面的 top ——
    panel('TitleBar', 0, 0, w, top);

    // —— 底栏：左边封面（正方形，边长 = 底栏高度），右边播放控制 ——
    var cover = mini ? setting('COVERPANELMINI', 1) : setting('COVERPANELBIG', 1);
    var coverWidth = cover ? bottom : 0;                          // 封面宽 = 高，保持正方形
    panel('CoverPanel', 0, h - bottom, coverWidth, bottom);
    panel('Controls', coverWidth, h - bottom, w - coverWidth, bottom);

    // ================= 中间主体区：四种布局模式 =================
    if (!mini) {                                                  // 迷你模式没有主体区，跳过
        if (mode === 0) {
            // 模式 0：左边筛选器（或媒体库树）+ 右边专辑封面墙
            var left = setting('LIBRARYFILTER', 1) ? Math.min(setting('LIBRARYFILTERWIDTH', 210), mainWidth * 0.4) : 0;
            // 用户可以选择这一列显示"媒体库树"还是"筛选器"，另一个作为备选
            panel(setting('LIBRARYTREE', 0) ? ['LibraryTree', 'LibraryFilter'] : ['LibraryFilter', 'LibraryTree'],
                0, top, left, bodyHeight);
            panel('GraphicBrowser', left, top, mainWidth - left, bodyHeight);

        } else if (mode === 1) {
            // 模式 1：播放列表管理器 + 上方筛选器 + 列表头 + 播放列表
            var manager = Math.min(setting('PLAYLISTPANELWIDTH', 180), mainWidth * 0.35);
            panel('SmoothPlaylistManager', 0, top, manager, bodyHeight);
            var area = mainWidth - manager, filterMode = setting('FILTERSPANEL', 1);
            // 筛选区高度按比例的预设：0 / 20% / 30% / 40% / 60% / 100%
            var filterHeight = bodyHeight * ([0, .2, .3, .4, .6, 1][filterMode] || 0);
            // 三个筛选器可以有开关，只摆启用中的，并且按启用个数平分宽度
            var enabled = [1, 2, 3].filter(function(n) { return setting('FILTER' + n, 1); });
            if (enabled.length && filterHeight) enabled.forEach(function(n, i) {
                panel('PlaylistFilter' + n, manager + area * i / enabled.length, top,
                    area / enabled.length, filterHeight);
            });
            // filterMode = 5 是"筛选器占满整个高度"，此时不需要列表头
            var headerHeight = filterMode === 5 ? 0 : 32;
            panel('PlaylistHeader', manager, top + filterHeight, area, headerHeight);
            // 播放列表占剩下的高度；BottomPlaylist 和 NowPlayingPlaylist 两种都可
            panel(['BottomPlaylist', 'NowPlayingPlaylist'], manager, top + filterHeight + headerHeight, area,
                bodyHeight - filterHeight - headerHeight);

        } else if (mode === 2) {
            // 模式 2：左边传记 / 右边歌词（歌词宽度按比例，11 表示占满）
            var lyrics = setting('LYRICS', 1);
            var lyricsWidth = lyrics === 11 ? mainWidth : mainWidth * lyrics / 10;
            if (!getPanel('Lyrics')) lyricsWidth = 0;             // 没装歌词面板就别留空白
            panel('Biography', 0, top, mainWidth - lyricsWidth, bodyHeight);
            if (lyricsWidth > 0) {
                panel('LyricsTitle', mainWidth - lyricsWidth, top, lyricsWidth, 28);   // 歌词标题条固定 28px
                panel('Lyrics', mainWidth - lyricsWidth, top + 28, lyricsWidth, bodyHeight - 28);
            }

        } else {
            // 模式 3：给第三方面板占位。名字已经确定是 Lxbox（洛雪音源那个槽位）。
            // 用 || 短路：panel() 成功返回面板对象（真值），就不执行后半句；
            // 万一 Lxbox 被从 CUI 里删掉或加载失败，退回专辑墙 / 播放列表，
            // 免得留着整块空白。
            panel('Lxbox', 0, top, mainWidth, bodyHeight) ||
                panel(['GraphicBrowser', 'BottomPlaylist', 'NowPlayingPlaylist'], 0, top, mainWidth, bodyHeight);
        }
    }

    // ================= 右侧栏（正在播放） =================
    if (right) {
        // 曲目信息块：迷你模式没有；普通模式看当前布局模式的开关。
        // 另外必须确认 TrackInfo 面板真的存在，否则 info 强制归零。
        var info = mini ? 0 : setting('TRACKINFOS' + suffix, mode >= 2 ? 1 : 0);
        if (info && !getPanel('TrackInfo')) info = 0;

        // 高度：宽度即封面边长，曲目详情开着时再多给 INFO_EXTRA_HEIGHT
        // （面板内的文字条高度），上限是主体区的一半，免得把播放列表挤死。
        var infoText = setting('TRACKINFOSTEXT', 1);              // 1=面板内显示曲目详情，0=已关掉
        var infoHeight = info ? Math.min(right + (infoText ? INFO_EXTRA_HEIGHT : 0), bodyHeight / 2) : 0;
        if (info && infoHeight < right * 0.5) infoHeight = Math.min(right * 0.5, bodyHeight / 2);   // 下限保护

        var rx = mini ? 0 : mainWidth;                            // 右侧栏的 x：迷你模式从 0 开始
        // info === 2 表示曲目信息放在右侧栏底部，否则放顶部
        if (info) panel('TrackInfo', rx, info === 2 ? top + bodyHeight - infoHeight : top, right, infoHeight);
        // 正在播放列表占右侧栏剩下的部分
        panel(['NowPlayingPlaylist', 'BottomPlaylist'], rx, info === 1 ? top + infoHeight : top, right, bodyHeight - infoHeight);
    }
    window.Repaint();                                             // 位置都改完了，通知重绘一次
}

// 窗口尺寸变化：CUI 拖拽边框、最大化、切布局都会走这里。
// 包 try/catch 是因为 on_size 里抛异常会让整个面板卡死。
function on_size() { try { arrange(); } catch (e) {} }

// 其它面板通过 window.NotifyOthers 广播设置变化（切主题、开关面板等）时触发。
// 用 SetTimeout(..., 0) 把重排推到当前回调之后，避免在别人发通知的过程中
// 改窗口布局（容易递归或半状态）。
function on_notify_data(name, info) { window.SetTimeout(arrange, 0); }

// 布局面板自己也要铺个底色：万一面板没摆满，露出来的是这个颜色而不是白底。
function on_paint(gr) { gr.FillSolidRect(0, 0, window.Width, window.Height, 0xff1e1e1e); }

// 启动后 100ms 先排一次：等其它面板脚本都加载、注册完名字，不然找不到它们。
window.SetTimeout(arrange, 100);

// 兜底轮询：每 600ms 排一次。
// 因为有些变化不会发通知（子面板自己被 CUI 拖动/新增、某个设置文件被改写），
// 靠 arrange() 开头的指纹比对，没有变化时这一趟几乎不花时间。
window.SetInterval(function () { try { arrange(); } catch (e) {} }, 600);
