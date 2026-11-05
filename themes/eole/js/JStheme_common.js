var theme_name = "eole";

var ProfilePath = fb.ProfilePath;
var FoobarPath = fb.FoobarPath;

var skin_global_path = ProfilePath + "themes\\"+theme_name;
var theme_img_path = skin_global_path + "\\img";
var theme_scripts_path = skin_global_path + "\\js";
var search_results_order = fb.TitleFormat("%album artist%|%date%|%album%|%discnumber%|%tracknumber%");
var sort_by_default = "%album artist%|%date%|%album%|%discnumber%|%tracknumber%";
var sort_by_album_artist = "%album artist%|%date%|%album%|%discnumber%|%tracknumber%";
var sort_by_album = "%album%|%date%|%discnumber%|%tracknumber%";
var sort_by_path = "%path%|%album%|%date%|%discnumber%|%tracknumber%";
var sort_by_title = "%title%|%tracknumber%";
var sort_by_tracknumber = "%tracknumber%|%album artist%";
var sort_by_date = "%date%|%album artist%|%album%";
var sort_by_date_added = "$sub(9999,$year(%added%))-$sub(9999,$month(%added%))-$sub(9999,$day_of_month(%added%))|%album artist%|%date%|%album%|%tracknumber%";
var sort_by_rating = "$sub(10,%rating%)|%album artist%|%album%";
var sort_by_time = "%length%|%album artist%|%date%|%album%";
var randomBtnTimer = false;

var last_mouse_move_notified = (new Date).getTime();
var foo_playcount = utils.CheckComponent("foo_playcount", true);
var timers = [];
(function MigrateLegacyProperties() {
    var KEYPAIRS = [
    "Eole 标题栏控制项 v1\u0001Eole x64 header controls v1", "主面板·专辑排序依据\u0001MAINPANEL Sort albums by", "主面板·允许拖拽到播放列表\u0001MAINPANEL Enable dragging to a playlist", "主面板·右侧面板跟随光标\u0001_MAINPANEL: right_panel_follow_cursor",
    "主面板·始终显示整个媒体库\u0001MAINPANEL Always display full library", "主面板·媒体库分组标题格式\u0001MAINPANEL Library Group TitleFormat", "主面板·媒体库排序格式\u0001MAINPANEL Library Sort TitleFormat", "主面板·媒体库自定义分组第一行\u0001MAINPANEL Library Custom Group First Row",
    "主面板·媒体库自定义分组第一行格式\u0001MAINPANEL Library Custom Group First Row TitleFormat", "主面板·媒体库自定义分组第二行\u0001MAINPANEL Library Custom Group Second Row", "主面板·媒体库自定义分组第二行格式\u0001MAINPANEL Library Custom Group Second Row TitleFormat", "主面板·媒体库默认排序格式\u0001MAINPANEL Default library Sort TitleFormat",
    "主面板·媒体库默认排序格式(备用)\u0001MAINPANEL Library Default Sort TitleFormat", "主面板·左侧筛选面板状态\u0001MAINPANEL Left filter state", "主面板·平滑滚动强度(0=关闭)\u0001MAINPANEL Smooth Scroll value (0 to disable)", "主面板·播放列表排序格式\u0001MAINPANEL Playlist Sort TitleFormat",
    "主面板·显示工具提示\u0001MAINPANEL Show tooltips", "主面板·显示标题栏\u0001MAINPANEL Show Header Bar", "主面板·显示筛选框\u0001MAINPANEL Show filter box", "主面板·显示筛选框(筛选停用时)\u0001MAINPANEL Show filter box (filter inactive)",
    "主面板·显示筛选框(筛选启用时)\u0001MAINPANEL Show filter box (filter active)", "主面板·正在播放适配(右播放列表关)\u0001MAINPANEL adapt now playing to left menu righ playlist off", "主面板·正在播放适配(右播放列表开)\u0001MAINPANEL adapt now playing to left menu righ playlist on", "主面板·滚动条可见\u0001MAINPANEL Scrollbar - Visible",
    "主面板·禁用媒体库分组标题\u0001MAINPANEL Library Group Header Disable", "主面板·筛选曲目\u0001MAINPANEL filter tracks", "主面板·自动切换显示的播放列表\u0001MAINPANEL Automatically change displayed playlist", "主面板·跟随正在播放的播放列表\u0001MAINPANEL Follow playing playlist",
    "主面板·跟随活动播放列表\u0001MAINPANEL Follow active playlist", "主面板·锁定指定播放列表名称\u0001MAINPANEL lock on specific playlist name", "主面板·降序排列\u0001MAINPANEL sort descending", "主面板·面板字体调整\u0001MAINPANEL: Panel font Adjustement",
    "信息·圆形倒计时(3000-60000毫秒)\u0001Info: Circle time, 3000~60000ms", "全局·主面板配色\u0001GLOBAL colorsMainPanel", "全局·保持比例\u0001GLOBAL keepProportion", "全局·内存占用策略\u0001GLOBAL memory solicitation",
    "全局·启用可调整边框\u0001GLOBAL enableResizableBorders", "全局·启用屏保\u0001GLOBAL enable screensaver", "全局·字体调整\u0001GLOBAL Font Adjustement", "全局·封面缓存最大宽度\u0001GLOBAL cover cache width max",
    "全局·屏保激活等待毫秒\u0001GLOBAL screensaver mseconds before activation", "全局·控制栏配色\u0001GLOBAL colorsControls", "全局·播放与随机\u0001GLOBAL play and random", "全局·移动鼠标退出屏保\u0001GLOBAL screensaver escape on mouse move",
    "全局·缩略图最大宽度\u0001GLOBAL thumbnail width max", "全局·评级存入文件标签\u0001GLOBAL use ratings in file tags", "全局·迷你播放器配色\u0001GLOBAL colorsMiniPlayer", "全局·通用\u0001GLOBAL ",
    "全局·高分屏适配模式\u0001GLOBAL HiRes display mode", "双击动作(0=资源管理器 1=播放)\u0001Double-Click Action: ExplorerStyle-0 Play-1", "可视化·深色主题\u0001VISUALIZATION dark theme", "启动时恢复面板状态(可视化页除外)\u0001Resume panel state on startup, except on visualization tab",
    "壁纸(0=填充 1=适应 2=拉伸)\u0001Wallpaper 0=Filling 1=Adjust 2=Stretch", "大面板·专辑封面进度条\u0001BIG:AlbumArtProgressbar", "大面板·交替行背景\u0001BIG:drawAlternateBG", "大面板·停止播放时仍显示活动项\u0001BIG:displayActiveOnPlaybackStopped",
    "大面板·分组标题行数\u0001BIG:groupHeaderRowsNumber", "大面板·分组标题行数(双行)\u0001BIG:groupHeaderRowsNumberDouble", "大面板·单击展开\u0001BIG:expandBySingleClick", "大面板·双行文本\u0001BIG:doubleRowText",
    "大面板·双行显示封面\u0001BIG:doubleRowShowCover", "大面板·可拖入播放列表\u0001BIG:DropInplaylist", "大面板·可视化深色主题\u0001BIG:visualization_dark_theme", "大面板·启用触摸控制\u0001BIG:enableTouchControl",
    "大面板·圆形模式\u0001BIG:circleMode", "大面板·壁纸显示方式\u0001BIG:wallpaperdisplay", "大面板·壁纸模式\u0001BIG:wallpapermode", "大面板·壁纸模糊\u0001BIG:wallpaperblurred",
    "大面板·壁纸模糊强度\u0001BIG:wallpaperblurvalue", "大面板·始终显示艺术家\u0001BIG:showArtistAlways", "大面板·媒体库深色主题\u0001BIG:library_dark_theme", "大面板·播放列表深色主题\u0001BIG:playlists_dark_theme",
    "大面板·播放列表默认点击动作\u0001BIG:defaultPlaylistItemAction", "大面板·显示上下滚动按钮\u0001BIG:drawUpAndDownScrollbar", "大面板·显示分组标题\u0001BIG:showGroupHeaders", "大面板·显示壁纸\u0001BIG:showwallpaper",
    "大面板·显示工具提示\u0001BIG:showToolTip", "大面板·显示情绪\u0001BIG:showMood", "大面板·显示播放次数\u0001BIG:showPlaycount", "大面板·显示标题栏\u0001BIG:showHeaderBar",
    "大面板·显示标题栏(曲目信息关)\u0001BIG:showHeaderBarTrackInfosOff", "大面板·显示标题栏(曲目信息开)\u0001BIG:showHeaderBarTrackInfosOn", "大面板·显示比特率\u0001BIG:showBitrate", "大面板·显示筛选框\u0001BIG:showFilterBox",
    "大面板·显示编码\u0001BIG:showCodec", "大面板·显示设置菜单\u0001BIG:showSettingsMenu", "大面板·显示评级\u0001BIG:showRating", "大面板·显示评级(已评级行)\u0001BIG:showRatingRated",
    "大面板·显示评级(选中行)\u0001BIG:showRatingSelected", "大面板·末尾空行数\u0001BIG:addedRows_end_default", "大面板·每组最少行数\u0001BIG:minimumRowsNumberPerGroup", "大面板·深色布局\u0001BIG:darklayout",
    "大面板·父面板名称\u0001BIG:ParentName", "大面板·绘制进度条\u0001BIG:drawProgressBar", "大面板·缩略图宽度\u0001BIG:thumbnailWidth", "大面板·缩略图最小宽度\u0001BIG:thumbnailWidthMin",
    "大面板·自动切换播放列表模式\u0001BIG:enableAutoSwitchPlaylistMode", "大面板·自动折叠\u0001BIG:autocollapse", "大面板·艺术家简介深色主题\u0001BIG:bio_dark_theme", "大面板·艺术家简介跟随深色布局\u0001BIG:bio_stick2darklayout",
    "大面板·跟随正在播放\u0001BIG:FollowNowPlaying", "大面板·迷你模式深色主题\u0001BIG:minimode_dark_theme", "大面板·通用\u0001BIG:", "大面板·锁定指定播放列表\u0001BIG:lockOnPlaylistNamed",
    "大面板·锁定正在播放\u0001BIG:lockOnNowPlaying", "大面板·额外行数\u0001BIG:extraRowsNumber", "大面板·默认行高\u0001BIG:defaultRowHeight", "媒体库·深色主题\u0001LIBRARY dark theme",
    "媒体库同步(0=自动 1=仅初始化)\u0001Library Sync: Auto-0, Initialisation Only-1", "完整模式·保存宽度\u0001Full mode saved width", "完整模式·播放列表管理器保存高度\u0001Full mode pmanager saved height", "封面·下次启动时删除缓存\u0001COVER delete cover cache on next startup",
    "封面·从日期提取年份\u0001COVER extract year from date", "封面·切到正在播放时动画\u0001COVER animate on show now playing", "封面·启动时全部加载\u0001COVER Load all at startup", "封面·回退到专辑封面\u0001COVER Fallback to album art",
    "封面·回退到专辑封面(标签模式1)\u0001COVER Fallback to album art for tag mode 1", "封面·回退到专辑封面(标签模式2)\u0001COVER Fallback to album art for tag mode 2", "封面·回退到专辑封面(标签模式3)\u0001COVER Fallback to album art for tag mode 3", "封面·回退到专辑封面(标签模式全选)\u0001COVER Fallback to album art for tag mode ",
    "封面·圆形封面\u0001COVER Circle artwork", "封面·外边距\u0001Margin", "封面·宽度\u0001COVER Width", "封面·宽度(标签模式1)\u0001COVER Width for tag mode 1",
    "封面·宽度(标签模式2)\u0001COVER Width for tag mode 2", "封面·宽度(标签模式3)\u0001COVER Width for tag mode 3", "封面·宽度(标签模式全选)\u0001COVER Width for tag mode ", "封面·封面上显示日期\u0001COVER Show Date over album art",
    "封面·封面上显示碟号\u0001COVER Show Disc number over album art", "封面·封面蒙版(磁盘缓存用)\u0001COVER album art masks (for disk cache)", "封面·小激活区域\u0001COVER Small active zone", "封面·已加载封面保留在内存\u0001COVER keep loaded covers in memory",
    "封面·待删除缓存的键(下次启动)\u0001COVER cachekey of covers to delete on next startup", "封面·文字居中\u0001COVER Center text", "封面·无留白无文字\u0001COVER no padding, no texts", "封面·显示加载进度\u0001COVER Show loading progress",
    "封面·显示阴影\u0001COVER show shadow", "封面·最小侧边距\u0001COVER Side margin min", "封面·最小宽度\u0001COVER Width Minimal", "封面·最少列数\u0001COVER Minimum number of columns",
    "封面·磁盘缓存\u0001COVER Disk Cache", "封面·自动适应\u0001Auto Fit", "封面·阴影不透明度\u0001COVER Shadow Opacity", "属性·专辑格式\u0001_PROPERTY Album TitleFormat",
    "属性·交替行背景\u0001PROPERTY: Alternate row background", "属性·交替行背景(备用)\u0001_PROPERTY: Alternate row background", "属性·从活动播放列表填充\u0001_PROPERTY: populate from active playlist", "属性·分组内显示条目数量\u0001_PROPERTY: Show numbers of items in group",
    "属性·单击动作\u0001PROPERTY single_click_action", "属性·双击动作\u0001PROPERTY double click action", "属性·右侧绘制分隔线\u0001_PROPERTY: Draw a line on the right side", "属性·启用滚动触摸控制\u0001_PROPERTY: Enable Scroll Touch Control",
    "属性·启用筛选框\u0001PROPERTY: Enable Filter Box", "属性·启用筛选框(备用)\u0001_PROPERTY: Enable Filter Box", "属性·圆形模式\u0001_PROPERTY: Circle Mode", "属性·圆形模式(标签1)\u0001_PROPERTY: Circle Mode for tag mode 1",
    "属性·圆形模式(标签2)\u0001_PROPERTY: Circle Mode for tag mode 2", "属性·圆形模式(标签3)\u0001_PROPERTY: Circle Mode for tag mode 3", "属性·圆形模式(标签全选)\u0001_PROPERTY: Circle Mode for tag mode ", "属性·封面蒙版(磁盘缓存用)\u0001_PROPERTY: Cover art masks (for disk cache)",
    "属性·已保存的筛选状态\u0001_PROPERTY: Saved filter state", "属性·忽略前缀\u0001_PROPERTY: ignore prefix", "属性·忽略前缀(标签1)\u0001_PROPERTY: ignore prefix for tag mode 1", "属性·忽略前缀(标签2)\u0001_PROPERTY: ignore prefix for tag mode 2",
    "属性·忽略前缀(标签3)\u0001_PROPERTY: ignore prefix for tag mode 3", "属性·忽略前缀(标签全选)\u0001_PROPERTY: ignore prefix for tag mode ", "属性·播放列表名前显示图标\u0001_PROPERTY: show an icon before the playlist name", "属性·播放列表按字母排序\u0001_PROPERTY: sort playlist alphabetically",
    "属性·播放列表管理器显示总数\u0001_PROPERTY.PlaylistManager.ShowTotalItems", "属性·显示上下滚动按钮\u0001PROPERTY: Draw Up and Down Scrollbar Buttons", "属性·显示上下滚动按钮(备用)\u0001_PROPERTY: Draw Up and Down Scrollbar Buttons", "属性·显示全部项\u0001_PROPERTY: Show ALL item",
    "属性·显示全部项(标签1)\u0001_PROPERTY: Show ALL item for tag mode 1", "属性·显示全部项(标签2)\u0001_PROPERTY: Show ALL item for tag mode 2", "属性·显示全部项(标签3)\u0001_PROPERTY: Show ALL item for tag mode 3", "属性·显示全部项(标签全选)\u0001_PROPERTY: Show ALL item for tag mode ",
    "属性·显示可视化标签页\u0001_PROPERTY show visualization tab", "属性·显示媒体库树切换\u0001_PROPERTY: Show library tree switch", "属性·显示工具提示\u0001_PROPERTY: Show tooltips", "属性·显示条目数量\u0001PROPERTY: Show numbers of items",
    "属性·显示条目数量(标签1)\u0001_PROPERTY: Show numbers of items for tag mode 1", "属性·显示条目数量(标签2)\u0001_PROPERTY: Show numbers of items for tag mode 2", "属性·显示条目数量(标签3)\u0001_PROPERTY: Show numbers of items for tag mode 3", "属性·显示条目数量(标签全选)\u0001_PROPERTY: Show numbers of items for tag mode ",
    "属性·显示模式\u0001_PROPERTY: Display Mode", "属性·显示模式(标签1)\u0001_PROPERTY: Display Mode for tag mode 1", "属性·显示模式(标签2)\u0001_PROPERTY: Display Mode for tag mode 2", "属性·显示模式(标签3)\u0001_PROPERTY: Display Mode for tag mode 3",
    "属性·显示模式(标签全选)\u0001_PROPERTY: Display Mode for tag mode ", "属性·显示模式(网格无文字)\u0001_PROPERTY: Display Mode Grid No Text", "属性·显示筛选切换按钮\u0001_PROPERTY: show filters toggler btn", "属性·显示面板切换按钮\u0001_PROPERTY: showPanelToggleButtons",
    "属性·显示顶栏(标签1)\u0001_PROPERTY: Show Top Bar for tag mode 1", "属性·显示顶栏(标签2)\u0001_PROPERTY: Show Top Bar for tag mode 2", "属性·显示顶栏(标签3)\u0001_PROPERTY: Show Top Bar for tag mode 3", "属性·显示顶栏(标签全选)\u0001_PROPERTY: Show Top Bar for tag mode ",
    "属性·末尾空行\u0001_PROPERTY: empty rows at the end", "属性·来源播放列表\u0001_PROPERTY: Source Playlist", "属性·来源模式\u0001_PROPERTY: Source Mode", "属性·标签模式\u0001_PROPERTY: Tag Mode",
    "属性·流派格式\u0001_PROPERTY Genre TitleFormat", "属性·父面板\u0001_PROPERTY: Parent Panel", "属性·筛选结果播放列表索引\u0001_PROPERTY: filtred playlist idx", "属性·筛选顺序\u0001_PROPERTY: filter Order",
    "属性·精简面板按钮\u0001_PROPERTY: Compactify panels buttons", "属性·自定义颜色\u0001_PROPERTY: Custom Colors", "属性·艺术家格式\u0001_PROPERTY Artist TitleFormat", "属性·行高\u0001PROPERTY: Row Height",
    "属性·触摸控制\u0001PROPERTY: Touch control", "属性·跟随焦点变化\u0001_PROPERTY: Follow focus change", "属性·选择的播放列表\u0001_PROPERTY: Selection Playlist", "属性·顶栏启用播放列表筛选框\u0001PROPERTY: Enable Playlist Filterbox in Top Bar",
    "属性·顶部显示来源标签按钮\u0001_PROPERTY: show buttons on top to change the source tag", "工具提示\u0001Tooltips", "按文件夹结构视图·名称 // 规则\u0001View by Folder Structure: Name // Pattern", "排序·专辑格式\u0001Sort Order - Album TitleFormat",
    "排序·流派格式\u0001Sort Order - Genre TitleFormat", "排序·艺术家格式\u0001Sort Order - Artist TitleFormat", "搜索历史最大条数\u0001Max items in search history", "搜索栏(0=隐藏 1=仅搜索 2=搜索+筛选)\u0001Search: Hide-0, SearchOnly-1, Search+Filter-2",
    "搜索栏·线条颜色(0=灰 1=混合 2=文字)\u0001Search: Line Colour: Grey-0 Blend-1 Text-2", "搜索样式(0=渐隐 1=混合 2=常规 3=高亮)\u0001Search Style: Fade-0 Blend-1 Norm-2 Highlight-3", "播放列表·从菜单发送时播放\u0001Playlist: Play On Send From Menu", "播放列表·深色主题\u0001PLAYLISTS dark theme",
    "播放列表·自定义排序\u0001Playlist: Custom Sort", "播放列表使用(0 或 1)\u0001Playlist Use: 0 or 1", "显示·专辑自定义分组名称\u0001_DISPLAY: album customGroup name", "显示·主布局深色\u0001_DISPLAY: Main layout:Dark",
    "显示·信息显示两行\u0001_DISPLAY details on two lines", "显示·信息格式化\u0001_DISPLAY: infos titleformat", "显示·停止按钮\u0001_DISPLAY stop btn", "显示·全局明暗切换按钮\u0001_DISPLAY: light switch btn global",
    "显示·切换按钮\u0001_DISPLAY: Toggle buttons", "显示·双行文本\u0001_DISPLAY: doubleRowText", "显示·固定深色布局\u0001_DISPLAY: stick to Dark layout", "显示·圆形模式\u0001_DISPLAY: circle mode",
    "显示·均衡器\u0001_DISPLAY equalizer", "显示·壁纸(0=填充 1=适应 2=拉伸)\u0001_DISPLAY: Wallpaper 0=Filling 1=Adjust 2=Stretch", "显示·壁纸模糊\u0001_DISPLAY: Wallpaper Blurred", "显示·壁纸模糊强度\u0001_DISPLAY: Wallpaper Blur Value",
    "显示·始终显示搜索框\u0001_DISPLAY: always show search box", "显示·始终显示音量条\u0001_DISPLAY always show volume bar", "显示·定时关机\u0001_DISPLAY scheduler", "显示·封面无留白\u0001_DISPLAY: cover no padding",
    "显示·封面调整器\u0001_DISPLAY: Cover resizer", "显示·封面跟随光标\u0001_DISPLAY: cover follow cursor", "显示·强制深色布局\u0001_DISPLAY: force dark layout", "显示·总时长\u0001_DISPLAY: Total time",
    "显示·打开按钮\u0001_DISPLAY open btn", "显示·显示全屏按钮\u0001_DISPLAY: show fullscreen btn", "显示·显示右侧栏按钮\u0001_DISPLAY: show right sidebar btn", "显示·显示壁纸\u0001_DISPLAY: Show Wallpaper",
    "显示·显示布局配置按钮\u0001_DISPLAY: show configure layout btn", "显示·显示明暗切换按钮\u0001_DISPLAY: show light switch btn", "显示·显示正在播放按钮\u0001_DISPLAY: show now playing btn", "显示·显示滚动条\u0001_DISPLAY: Show Scrollbar",
    "显示·显示评级\u0001_DISPLAY: showRating", "显示·显示面板按钮文字\u0001_DISPLAY: show panels btn text", "显示·显示顶栏\u0001_DISPLAY: Show Top Bar", "显示·曲目标题\u0001_DISPLAY: Track title",
    "显示·曲目标题前缀\u0001_DISPLAY show track title prefix", "显示·曲目标题格式\u0001_DISPLAY: Track title format", "显示·流派自定义分组名称\u0001_DISPLAY: genre customGroup name", "显示·深色布局\u0001_DISPLAY: Dark layout",
    "显示·深色布局跟随CUI\u0001_DISPLAY: Dark layout follow CUI", "显示·滑块样式\u0001_DISPLAY slider cursor style", "显示·禁用封面缓存\u0001_DISPLAY: disable cover cache", "显示·网格模式按钮\u0001_DISPLAY: grid mode button",
    "显示·自动搜索\u0001_DISPLAY: autosearch", "显示·自定义第一行\u0001_DISPLAY: custom first row", "显示·自定义第二行\u0001_DISPLAY: custom second row", "显示·艺术家自定义分组名称\u0001_DISPLAY: artist customGroup name",
    "显示·评级\u0001_DISPLAY rating", "显示·输出设备\u0001_DISPLAY device", "显示·迷你主菜单按钮\u0001_DISPLAY: mini main menu button", "显示·迷你布局深色\u0001_DISPLAY: Mini layout:Dark",
    "显示·重复按钮\u0001_DISPLAY repeat btn", "显示·随机切换按钮\u0001_DISPLAY shuffle btn", "显示·随机播放按钮\u0001_DISPLAY play random btn", "显示·面板按钮文字大写\u0001_DISPLAY: panels btn text to uppercase",
    "显示·首项顶部边距\u0001_DISPLAY first item top margin", "显示内圈\u0001Show Inner Cirle", "显示剩余时间\u0001Show remaining time", "显示可视化\u0001Show Visualization",
    "显示曲目信息\u0001Show track info", "显示项·显示新建播放列表按钮\u0001DISPLAY: Show new playlist button", "显示项·显示滚动条\u0001DISPLAY: Show Scrollbar", "显示项·显示顶栏\u0001DISPLAY: Show Top Bar",
    "曲目列表·两行曲目信息(自定义标签)\u0001TRACKLIST track details on 2 rows - custom tag", "曲目列表·单列\u0001TRACKLIST one column", "曲目列表·原地展开\u0001TRACKLIST Expand in place", "曲目列表·原地展开(旧)\u0001TRACKLIST expand in place",
    "曲目列表·始终跟随正在播放\u0001TRACKLIST Always Follow Now Playing", "曲目列表·已评级行显示评级\u0001TRACKLIST Show rating in Rated Track Row", "曲目列表·平滑展开强度(0=关闭)\u0001TRACKLIST Smooth Expand value (0 to disable)", "曲目列表·悬停展开\u0001TRACKLIST Expand on hover",
    "曲目列表·悬停展开(旧)\u0001TRACKLIST expand on hover", "曲目列表·按封面取色\u0001TRACKLIST Color according to albumart", "曲目列表·按封面取色(主色)\u0001TRACKLIST Color according to albumart (main color)", "曲目列表·按封面取色(模糊)\u0001TRACKLIST Color according to albumart (blurred)",
    "曲目列表·按封面取色(混合)\u0001TRACKLIST Color according to albumart (mix of both)", "曲目列表·显示封面\u0001TRACKLIST Show cover", "曲目列表·显示播放次数\u0001TRACKLIST Show playcount", "曲目列表·显示比特率\u0001TRACKLIST Show bitrate",
    "曲目列表·显示编码\u0001TRACKLIST Show codec", "曲目列表·显示艺术家\u0001TRACKLIST Show artist name", "曲目列表·曲目信息显示两行\u0001TRACKLIST Show track details on 2 rows", "曲目列表·标题下绘制进度条\u0001TRACKLIST Draw a progress bar under song title",
    "曲目列表·模糊封面进度条\u0001TRACKLIST Blurred album art progress bar", "曲目列表·水平滚动条\u0001TRACKLIST horizontal scrollbar", "曲目列表·行内显示评级\u0001TRACKLIST Show rating in Track Row", "曲目列表·选中行显示评级\u0001TRACKLIST Show rating in Selected Track Row",
    "标签切换条\u0001Tag switcher bar", "树缩进\u0001Tree Indent", "树节点·字号\u0001Node: Size", "树节点·显示全部音乐项\u0001Node: Show All Music",
    "树节点·显示曲目\u0001Node: Show Tracks", "树节点·显示条目数量\u0001Node: Show Item Counts", "树节点·显示汇总项\u0001Node: Show Aggregate Item", "树节点·自动展开唯一子项\u0001Node: Auto Expand Single Childs",
    "树节点·自动折叠\u0001Node: Auto Collapse", "树节点·自定义符号(0=细 1=粗 2=其它)\u0001Node: Custom Symbols-0 Soft-1 Bold-2", "树节点·自定义符号(折叠|展开)\u0001Node: Custom Symbols: Collapse|Expand", "树节点·跟随主题配色\u0001Node: Themed nodes",
    "树节点·连接线(0=隐藏 1=灰线 2=混合 3=文字)\u0001Node: Lines: Hide-0 Grey-1 Blend-2 Text-3", "滚动·平滑滚动\u0001Scroll: Smooth Scroll", "滚动·平滑滚动级别(0-1)\u0001Scroll: Smooth Scroll Level 0-1", "滚动·滚轮翻页\u0001Scroll - Mouse Wheel: Page Scroll",
    "滚动条·宽度\u0001Scrollbar Width", "滚动条·显示\u0001Scrollbar Show", "系统·允许拖入播放列表\u0001_SYSTEM: Allow to drag items into a playlist", "系统·壁纸模式\u0001_SYSTEM: Wallpaper Mode",
    "系统·多碟合用一个缩略图\u0001_SYSTEM: Display one thumbnail for multi discs", "系统·字号\u0001SYSTEM.Font Size", "系统·播放列表已勾选\u0001SYSTEM.Playlist Checked", "系统·显示专辑评论\u0001_SYSTEM: Display album review",
    "系统·最小行高\u0001SYSTEM Minimal Line Height", "系统·最小行高(标签模式1)\u0001SYSTEM Minimal Line Height for tag mode 1", "系统·最小行高(标签模式2)\u0001SYSTEM Minimal Line Height for tag mode 2", "系统·最小行高(标签模式3)\u0001SYSTEM Minimal Line Height for tag mode 3",
    "系统·最小行高(标签模式全选)\u0001SYSTEM Minimal Line Height for tag mode ", "系统·查看依据\u0001SYSTEM.View By", "系统·滚动行分隔线\u0001SYSTEM Scroll Row Divider", "系统·筛选依据\u0001SYSTEM.Filter By",
    "系统·重置树\u0001SYSTEM.Reset Tree", "背景颜色\u0001Background color", "自定义颜色·使用自定义\u0001_CUSTOM COLOURS: USE", "自定义颜色·启用\u0001CUSTOM COLOR: enable",
    "自定义颜色·搜索名称\u0001_Custom.Colour Search Name", "自定义颜色·普通文字\u0001CUSTOM COLOR: text normal", "自定义颜色·普通背景\u0001CUSTOM COLOR: background normal", "自定义颜色·树连接线\u0001_Custom.Colour Node Lines",
    "自定义颜色·留空即默认\u0001_CUSTOM COLOURS: EMPTY = DEFAULT", "自定义颜色·选中文字\u0001CUSTOM COLOR: text selected", "自定义颜色·选中背景\u0001CUSTOM COLOR: background selected", "自定义颜色·透明填充\u0001_Custom.Colour Transparent Fill",
    "自定义颜色·高亮\u0001CUSTOM COLOR: highlight", "艺术家图片·启动时全部加载\u0001ARTIST IMG Load all at startup", "艺术家简介·深色主题\u0001BIO dark theme", "艺术家简介·跟随深色主题\u0001BIO stick to dark theme",
    "艺术家简介·跟随深色布局\u0001BIO stick to Dark layout", "行内垂直留白\u0001Row Vertical Item Padding", "行条纹\u0001Row Stripes", "视图\u0001View ",
    "视图01·名称 // 规则\u0001View 01: Name // Pattern", "视图02·名称 // 规则\u0001View 02: Name // Pattern", "视图03·名称 // 规则\u0001View 03: Name // Pattern", "视图04·名称 // 规则\u0001View 04: Name // Pattern",
    "视图05·名称 // 规则\u0001View 05: Name // Pattern", "视图06·名称 // 规则\u0001View 06: Name // Pattern", "视图·已初始化\u0001View: View Is Inited", "视图筛选\u0001View Filter ",
    "视图筛选01·名称 // 查询\u0001View Filter 01: Name // Query", "视图筛选02·名称 // 查询\u0001View Filter 02: Name // Query", "视图筛选03·名称 // 查询\u0001View Filter 03: Name // Query", "视图筛选04·名称 // 查询\u0001View Filter 04: Name // Query",
    "视图筛选05·名称 // 查询\u0001View Filter 05: Name // Query", "视图筛选06·名称 // 查询\u0001View Filter 06: Name // Query", "视图筛选07·名称 // 查询\u0001View Filter 07: Name // Query", "视图筛选08·名称 // 查询\u0001View Filter 08: Name // Query",
    "视图筛选09·名称 // 查询\u0001View Filter 09: Name // Query", "迷你·专辑封面进度条\u0001MINI:AlbumArtProgressbar", "迷你·交替行背景\u0001MINI:drawAlternateBG", "迷你·停止播放时仍显示活动项\u0001MINI:displayActiveOnPlaybackStopped",
    "迷你·分组标题行数\u0001MINI:groupHeaderRowsNumber", "迷你·分组标题行数(双行)\u0001MINI:groupHeaderRowsNumberDouble", "迷你·单击展开\u0001MINI:expandBySingleClick", "迷你·双行文本\u0001MINI:doubleRowText",
    "迷你·双行显示封面\u0001MINI:doubleRowShowCover", "迷你·可拖入播放列表\u0001MINI:DropInplaylist", "迷你·可视化深色主题\u0001MINI:visualization_dark_theme", "迷你·启用触摸控制\u0001MINI:enableTouchControl",
    "迷你·圆形模式\u0001MINI:circleMode", "迷你·壁纸显示方式\u0001MINI:wallpaperdisplay", "迷你·壁纸模式\u0001MINI:wallpapermode", "迷你·壁纸模糊\u0001MINI:wallpaperblurred",
    "迷你·壁纸模糊强度\u0001MINI:wallpaperblurvalue", "迷你·始终显示艺术家\u0001MINI:showArtistAlways", "迷你·媒体库深色主题\u0001MINI:library_dark_theme", "迷你·播放列表深色主题\u0001MINI:playlists_dark_theme",
    "迷你·播放列表默认点击动作\u0001MINI:defaultPlaylistItemAction", "迷你·显示上下滚动按钮\u0001MINI:drawUpAndDownScrollbar", "迷你·显示分组标题\u0001MINI:showGroupHeaders", "迷你·显示壁纸\u0001MINI:showwallpaper",
    "迷你·显示工具提示\u0001MINI:showToolTip", "迷你·显示情绪\u0001MINI:showMood", "迷你·显示播放次数\u0001MINI:showPlaycount", "迷你·显示标题栏\u0001MINI:showHeaderBar",
    "迷你·显示标题栏(曲目信息关)\u0001MINI:showHeaderBarTrackInfosOff", "迷你·显示标题栏(曲目信息开)\u0001MINI:showHeaderBarTrackInfosOn", "迷你·显示比特率\u0001MINI:showBitrate", "迷你·显示筛选框\u0001MINI:showFilterBox",
    "迷你·显示编码\u0001MINI:showCodec", "迷你·显示设置菜单\u0001MINI:showSettingsMenu", "迷你·显示评级\u0001MINI:showRating", "迷你·显示评级(已评级行)\u0001MINI:showRatingRated",
    "迷你·显示评级(选中行)\u0001MINI:showRatingSelected", "迷你·末尾空行数\u0001MINI:addedRows_end_default", "迷你·每组最少行数\u0001MINI:minimumRowsNumberPerGroup", "迷你·深色布局\u0001MINI:darklayout",
    "迷你·父面板名称\u0001MINI:ParentName", "迷你·绘制进度条\u0001MINI:drawProgressBar", "迷你·缩略图宽度\u0001MINI:thumbnailWidth", "迷你·缩略图最小宽度\u0001MINI:thumbnailWidthMin",
    "迷你·自动切换播放列表模式\u0001MINI:enableAutoSwitchPlaylistMode", "迷你·自动折叠\u0001MINI:autocollapse", "迷你·艺术家简介深色主题\u0001MINI:bio_dark_theme", "迷你·艺术家简介跟随深色布局\u0001MINI:bio_stick2darklayout",
    "迷你·跟随正在播放\u0001MINI:FollowNowPlaying", "迷你·迷你模式深色主题\u0001MINI:minimode_dark_theme", "迷你·通用\u0001MINI:", "迷你·锁定指定播放列表\u0001MINI:lockOnPlaylistNamed",
    "迷你·锁定正在播放\u0001MINI:lockOnNowPlaying", "迷你·额外行数\u0001MINI:extraRowsNumber", "迷你·默认行高\u0001MINI:defaultRowHeight", "迷你模式·保存宽度\u0001Mini mode saved width",
    "迷你模式·播放列表保存高度\u0001Mini mode playlist saved height", "迷你模式·深色主题\u0001MINIMODE dark theme", "随机函数\u0001Random function",
    ];
    function readProp(k) {
        return window.GetProperty(k);
    }
    function isJunk(v) {
        return v !== undefined && v !== null && String(v).indexOf("eole_none") >= 0;
    }
    try {
        if (!readProp("_哨兵属性已清理")) {
            for (var c = 0; c < KEYPAIRS.length; c++) {
                var cp = KEYPAIRS[c].split("\u0001");
                if (isJunk(readProp(cp[0]))) window.SetProperty(cp[0], null);
                if (isJunk(readProp(cp[1]))) window.SetProperty(cp[1], null);
            }
            window.SetProperty("_哨兵属性已清理", true);
        }

        for (var i = 0; i < KEYPAIRS.length; i++) {
            var p = KEYPAIRS[i].split("\u0001");
            var nk = p[0], ok = p[1];
            var old_val = readProp(ok);
            if (old_val === undefined || old_val === null) continue;
            var cur = readProp(nk);
            if (cur === undefined || cur === null) {
                window.SetProperty(nk, old_val);
            }
            window.SetProperty(ok, null);
        }
        if (readProp("_属性名已汉化迁移") !== undefined) window.SetProperty("_属性名已汉化迁移", null);
    } catch (e) {
    }
})();

var globalProperties = {
	theme_version: '1.2.3b25',
	lastest_breaking_version: '1.2.3b24',
    thumbnailWidthMax: window.GetProperty("全局·缩略图最大宽度", 200),
    coverCacheWidthMax: window.GetProperty("全局·封面缓存最大宽度", 400),
	TextRendering: 4,
    ImageCacheExt: "jpg",
    ImageCacheFileType: "image/jpeg",
	fullMode_minwidth: 250,
	fullMode_minheight:250,
	miniMode_minwidth: 150,
	minMode_minheight:200,
	tooltip_delay:500,
	tooltip_button_delay:500,
	fontAdjustement_min:-5,
	fontAdjustement_max:5,
    fontAdjustement: window.GetProperty("全局·字体调整", 0),
	mem_solicitation:window.GetProperty("全局·内存占用策略", 0),
	loaded_covers2memory:window.GetProperty("封面·已加载封面保留在内存", false),
    load_covers_at_startup: window.GetProperty("封面·启动时全部加载", true),
    load_artist_img_at_startup: window.GetProperty("艺术家图片·启动时全部加载", true),
	enableDiskCache: window.GetProperty("封面·磁盘缓存",true),
	deleteDiskCache: window.GetProperty("封面·下次启动时删除缓存",false),
	enableResizableBorders: window.GetProperty("全局·启用可调整边框",true),
	colorsMainPanel: window.GetProperty("全局·主面板配色",0),
	colorsControls: window.GetProperty("全局·控制栏配色",0),
	colorsMiniPlayer: window.GetProperty("全局·迷你播放器配色",0),
	keepProportion: window.GetProperty("全局·保持比例", false),	
	record_move_every_x_ms:3000,
	refreshRate:40,
	crc: "$if(%album artist%,$if(%album%,$crc32(%album artist%##%album%),undefined),undefined)",
	crc_artist: "$crc32('artists'$meta(artist))",
	create_playlist : "创建播放列表",
	selection_playlist : "媒体库选择",
	playing_playlist : "媒体库播放",
	filter_playlist : "筛选结果",	
	whole_library : "整个媒体库",
	media_library : "媒体库",
	default_wallpaper : theme_img_path+"\\nothing_played_full.png",
    nocover_img: gdi.Image(theme_img_path+"\\no_cover.png"),
    stream_img: gdi.Image(theme_img_path+"\\stream_icon.png"),
	ResizeQLY: 0,
	use_ratings_file_tags: window.GetProperty("全局·评级存入文件标签", false),
	enable_screensaver: window.GetProperty("全局·启用屏保", false),
	escape_on_mouse_move: window.GetProperty("全局·移动鼠标退出屏保", false),
	mseconds_before_screensaver: window.GetProperty("全局·屏保激活等待毫秒", 60000),
}
var PlaylistExclude = Array(globalProperties.whole_library,globalProperties.filter_playlist);
globalProperties.tf_crc = fb.TitleFormat(globalProperties.crc);
globalProperties.tf_genre = fb.TitleFormat("%genre%");
globalProperties.tf_album = fb.TitleFormat("%album%");
globalProperties.tf_date = fb.TitleFormat("%date%");
globalProperties.tf_time = fb.TitleFormat("%time%");
globalProperties.tf_artist = fb.TitleFormat("%artist%");
globalProperties.tf_albumartist = fb.TitleFormat("$if2($meta(album artist),$meta(artist))");
globalProperties.tf_title = fb.TitleFormat("%title%");
globalProperties.tf_order = fb.TitleFormat("%album artist%|%date%|%album%|%discnumber%|%tracknumber%");
globalProperties.coverCacheWidthMax = Math.max(50,Math.min(2000,Number(globalProperties.coverCacheWidthMax)));
if(isNaN(globalProperties.coverCacheWidthMax)) globalProperties.coverCacheWidthMax = 200;
globalProperties.thumbnailWidthMax = Math.max(50,globalProperties.coverCacheWidthMax);
function versionCompare(v1, v2, options) {
    var lexicographical = options && options.lexicographical,
        zeroExtend = options && options.zeroExtend,
        v1parts = v1.replace('a','').replace('b','').split('.'),
        v2parts = v2.replace('a','').replace('b','').split('.');
    function isValidPart(x) {
        return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);
    }
    if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
        return NaN;
    }
    if (zeroExtend) {
        while (v1parts.length < v2parts.length) v1parts.push("0");
        while (v2parts.length < v1parts.length) v2parts.push("0");
    }
    if (!lexicographical) {
        v1parts = v1parts.map(Number);
        v2parts = v2parts.map(Number);
    }
    for (var i = 0; i < v1parts.length; ++i) {
        if (v2parts.length == i) return 1;
        if (v1parts[i] == v2parts[i]) continue;
        else if (v1parts[i] > v2parts[i]) return 1;
        else return -1;
    }
    if (v1parts.length != v2parts.length) return -1;
    return 0;
}
function setMemoryParameters(){
	switch(true) {
		case (globalProperties.mem_solicitation==0):
			globalProperties.loaded_covers2memory = false;
			globalProperties.load_covers_at_startup = false;
			globalProperties.load_artist_img_at_startup = false;
		break;
		case (globalProperties.mem_solicitation==1):
			globalProperties.loaded_covers2memory = true;
			globalProperties.load_covers_at_startup = false;
			globalProperties.load_artist_img_at_startup = false;
		break;
		case (globalProperties.mem_solicitation==2):
			globalProperties.loaded_covers2memory = true;
			globalProperties.load_covers_at_startup = true;
			globalProperties.load_artist_img_at_startup = false;
		break;
		case (globalProperties.mem_solicitation==3):
			globalProperties.loaded_covers2memory = true;
			globalProperties.load_covers_at_startup = true;
			globalProperties.load_artist_img_at_startup = true;
		break;
	}
}
setMemoryParameters();
var GLOBAL_PARAM_KEY = {
	"keepProportion": "全局·保持比例",
	"Font Adjustement": "全局·字体调整",
	"colorsMainPanel": "全局·主面板配色",
	"colorsControls": "全局·控制栏配色",
	"colorsMiniPlayer": "全局·迷你播放器配色",
	"mem_solicitation": "全局·内存占用策略",
	"thumbnailWidthMax": "全局·缩略图最大宽度",
	"coverCacheWidthMax": "全局·封面缓存最大宽度",
	"use_ratings_file_tags": "全局·评级存入文件标签",
	"enableResizableBorders": "全局·启用可调整边框",
	"enableDiskCache": "封面·磁盘缓存",
	"loaded_covers2memory": "封面·已加载封面保留在内存",
	"load_covers_at_startup": "封面·启动时全部加载",
	"load_artist_img_at_startup": "艺术家图片·启动时全部加载"
};
function setGlobalParameter(parameter_name, parameter_value, notify_others){
	var notify_others = typeof notify_others !== 'undefined' ? notify_others : false;	
	window.SetProperty(GLOBAL_PARAM_KEY[parameter_name] || ("全局·通用" + parameter_name), parameter_value);
	eval("globalProperties."+parameter_name+" = "+parameter_value);
	if(notify_others) window.NotifyOthers("setGlobalParameter",Array(parameter_name,parameter_value));
	if(parameter_name=="keepProportion") {
		setImageCachePath();
		g_image_cache.resetCache();
	}
}
var cScrollBar = {
    enabled: window.GetProperty("显示·显示滚动条", true),
    visible: true,
    themed: false,
    defaultWidth: 10,
	width: 10,
	normalWidth: 4,
	hoverWidth: 10,
	activeWidth: 20,
	minHeight: 60,
	downWidth: 10,
	marginTop: 3,
	marginBottom: 3,
	ButtonType: {cursor: 0, up: 1, down: 2},
    defaultMinCursorHeight: 40,
    minCursorHeight: 40,
    maxCursorHeight: 1000000,
    timerID: false,
	timerCounter: -1
};

var WindowState = {
    Normal: 0,
    Minimized: 1,
    Maximized: 2
}

var g_drop_effect = {
    none: 0,
    copy: 1,
    move: 2,
    link: 4,
    scroll: 0x80000000
};

var oCursor = function () {
	this.x = -10;
	this.y = -10;
	this.first_x = -10;
	this.first_y = -10;
	this.active_zone = "";
	this.timer = false;
	this.cursor = IDC_ARROW;
    this.onMouse = function (state, x, y, m) {
		switch(state){
			case 'lbtn_down':
				this.down_x = x;
				this.down_y = y;
			break;
			case 'lbtn_up':
				this.up_x = x;
				this.up_y = y;
			break;
			case 'dble_click':
				this.down_x = x;
				this.down_y = y;
			break;
			case 'move':
				if(this.x==-10) this.first_x = x;
				if(this.y==-10) this.first_y = y;
				this.x = x;
				this.y = y;
			break;
			case 'leave':
				this.x = -10;
				this.y = -10;
				this.first_x = -10;
				this.first_y = -10;
				this.active_zone = "";
				this.cursor = IDC_ARROW;
			break;
		}
    }
	this.setCursor = function(cursor_code,active_zone,numberOfTry){
		var active_zone = typeof active_zone !== 'undefined' ? active_zone : "";
		var numberOfTry = typeof numberOfTry !== 'undefined' ? numberOfTry : 1;

		if(window.Name!='ArtistBio' && (this.x<0 || this.y<0 || this.x>ww || this.y>wh))
			return;

		this.cursor = cursor_code;
		this.active_zone = active_zone;
		if(numberOfTry>1 && !this.timer){
			this.timerExecution = 0;
			this.timer = setInterval(function(numberOfTry, cursor_code) {
				g_cursor.timerExecution++;
				window.SetCursor(g_cursor.cursor);
				if(g_cursor.timerExecution >= numberOfTry) {
					window.ClearInterval(g_cursor.timer);
					g_cursor.timer = false;
				};
			}, 2, numberOfTry, cursor_code);
		} else {
			window.SetCursor(cursor_code);
		}
	}
	this.getCursor = function(){
		return this.cursor;
	}
	this.getActiveZone = function(){
		return this.active_zone;
	}
}
function SetPlaylistFocusItemByHandle(playlist_id,metadb){
	plman.ActivePlaylist = playlist_id;
	plman.SetPlaylistFocusItem(playlist_id, metadb);
}
// HTML dialogs ---------------------------------------------------------------------
function get_windows_version() {
    let version = '';
	var WshShell = new ActiveXObject("WScript.Shell");
    try {
        version = (WshShell.RegRead('HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\CurrentMajorVersionNumber')).toString();
        version += '.';
        version += (WshShell.RegRead('HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\CurrentMinorVersionNumber')).toString();

        return version;
    }
    catch (e) {
    }

    try {
        version = WshShell.RegRead('HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\CurrentVersion');

        return version;
    }
    catch (e) {
    }

    return '6.1';
}
function htmlCode(directory,filename) {
    let htmlCode = utils.ReadTextFile(directory+"\\"+filename);

    let cssPath = directory;
    if ( get_windows_version() === '6.1' ) {
        cssPath += "\\styles7.css";
    }
    else {
        cssPath += "\\styles10.css";
    }
    htmlCode = htmlCode.replace(/href="styles10.css"/i, `href="${cssPath}"`);
    return htmlCode;
};
function HtmlMsg(msg_title, msg_content, btn_label){
	utils.ShowHtmlDialog(window.ID, htmlCode(skin_global_path+"\\html","MsgBox.html"), {
		data: [msg_title, msg_content, btn_label, null],
	});
}
function NoticeBox(msg_title, msg_content, btn_yes_label, btn_no_label, action){
	function ok_callback(status, action) {
		if(status=="ok"){
			theme_version.setValue(globalProperties.theme_version);
			eval(action);
		}
		else if(status=="never"){
			theme_version.setValue(globalProperties.theme_version);
			eval(action);
		}
	}
	utils.ShowHtmlDialog(window.ID, htmlCode(skin_global_path+"\\html","Notice.html"), {
		data: [msg_title, msg_content, btn_yes_label, btn_no_label, ok_callback, action],
	});
}

function HtmlDialog(msg_title, msg_content, btn_yes_label, btn_no_label, confirm_callback){
	utils.ShowHtmlDialog(window.ID, htmlCode(skin_global_path+"\\html","ConfirmDialog.html"), {
		data: [msg_title, msg_content, btn_yes_label, btn_no_label, confirm_callback],
	});
}
function chooseMemorySettings(title, top_msg, bottom_msg, dialog_name, inter_text){
	function ok_callback(status, mem_solicitation, covercache_max_width) {
		panels_reload = false;
		if(status!="cancel"){
			if(covercache_max_width!=globalProperties.coverCacheWidthMax){
				setCoverCacheMaxWidthGlobally(Number(covercache_max_width));
				panels_reload = true;
				globalProperties.deleteDiskCache = true;
				delete_full_cache();
			}
			if(mem_solicitation>=0 && mem_solicitation<=3 && mem_solicitation!=globalProperties.mem_solicitation && status!="cancel") {
				setMemoryUsageGlobally(Number(mem_solicitation));
			}
			if(panels_reload){
				window.NotifyOthers("WSH_panels_reload",true);
			}
		}
	}
	utils.ShowHtmlDialog(window.ID, htmlCode(skin_global_path+"\\html",dialog_name+".html"), {
		data: [title, top_msg, '取消', ok_callback,'0 - 最小占用##1 - 已加载封面保留在内存##2 - 启动时加载所有封面##3 - 启动时加载所有封面及艺术家缩略图',globalProperties.mem_solicitation,bottom_msg,globalProperties.coverCacheWidthMax,inter_text],
	});
}

function customFilterGrouping(title, top_msg, bottom_msg, input_default_values, input_labels){
	function ok_callback(status, input_values) {
		if(status!="cancel"){
			var input_values = input_values.split('##');
			var refresh_filters = false;
			switch(properties.tagMode) {
				case 1:
					if (!(typeof input_values[0] == 'undefined' || g_tagswitcherbar.items_txt[1]==input_values[0])) {
						properties.album_customGroup_label = input_values[0].substring(0, 20);
						window.SetProperty("显示·专辑自定义分组名称", properties.album_customGroup_label);
						window.NotifyOthers("album_customGroup_label",properties.album_customGroup_label);
						refresh_filters = true;
					}
					if (!(typeof input_values[1] == 'undefined' || properties.tf_groupkey_album==input_values[1])) {
						if(input_values[1] == "") properties.tf_groupkey_album = properties.tf_groupkey_album_default;
						else properties.tf_groupkey_album = input_values[1];
						window.SetProperty("属性·专辑格式", properties.tf_groupkey_album);
						refresh_filters = true;
					}
					if (!(typeof input_values[2] == 'undefined' || properties.tf_sort_album==input_values[2])) {
						properties.tf_sort_album = input_values[2];
						window.SetProperty("排序·专辑格式", properties.tf_sort_album);
						refresh_filters = true;
					}					
				break;
				case 2:
					if (!(typeof input_values[0] == 'undefined' || g_tagswitcherbar.items_txt[2]==input_values[0])) {
						properties.artist_customGroup_label = input_values[0].substring(0, 20);
						window.SetProperty("显示·艺术家自定义分组名称", properties.artist_customGroup_label);
						window.NotifyOthers("artist_customGroup_label",properties.artist_customGroup_label);
						refresh_filters = true;
					}
					if (!(typeof input_values[1] == 'undefined' || properties.tf_groupkey_artist==input_values[1])) {
						if(input_values[1] == "") properties.tf_groupkey_artist = properties.tf_groupkey_artist_default;
						else properties.tf_groupkey_artist = input_values[1];
						window.SetProperty("属性·艺术家格式", properties.tf_groupkey_artist);
						refresh_filters = true;
					}
					if (!(typeof input_values[2] == 'undefined' || properties.tf_sort_artist==input_values[2])) {
						properties.tf_sort_artist = input_values[2];
						window.SetProperty("排序·艺术家格式", properties.tf_sort_artist);
						refresh_filters = true;
					}					
				break;
				case 3:
					if (!(typeof input_values[0] == 'undefined' || g_tagswitcherbar.items_txt[3]==input_values[0])) {
						properties.genre_customGroup_label = input_values[0].substring(0, 20);
						window.SetProperty("显示·流派自定义分组名称", properties.genre_customGroup_label);
						window.NotifyOthers("genre_customGroup_label",properties.genre_customGroup_label);
						refresh_filters = true;
					}
					if (!(typeof input_values[1] == 'undefined' || properties.tf_groupkey_genre==input_values[1])) {
						if(input_values[1] == "") properties.tf_groupkey_genre = properties.tf_groupkey_genre_default;
						else properties.tf_groupkey_genre = input_values[1];
						window.SetProperty("属性·流派格式", properties.tf_groupkey_genre);
						refresh_filters = true;
					}
					if (!(typeof input_values[2] == 'undefined' || properties.tf_sort_genre==input_values[2])) {
						properties.tf_sort_genre = input_values[2];
						window.SetProperty("排序·流派格式", properties.tf_sort_genre);
						refresh_filters = true;
					}
				break;
			}
			if(refresh_filters){
				properties.albumArtId = 0;
				g_tagswitcherbar.on_init();
				g_filterbox.reset_layout();
				brw.populate(true,1);
			}
		}
	}
	utils.ShowHtmlDialog(window.ID, htmlCode(skin_global_path+"\\html","InputDialog.html"), {
		data: [title, top_msg, '取消', ok_callback,bottom_msg,input_default_values,input_labels],
	});
}
function customGraphicBrowserGrouping(title, top_msg, bottom_msg, input_default_values, input_labels){
	function ok_callback(status, input_values) {
		if(status!="cancel"){
			var input_values = input_values.split('##');
			if (!(input_values[0] == "" || typeof input_values[0] == 'undefined' || properties.TFgrouping==input_values[0]+" ^^ "+input_values[1])) {						
				properties.TFgrouping = input_values[0]+" ^^ "+input_values[1];
				TF.grouping = fb.TitleFormat(properties.TFgrouping);
				window.SetProperty("主面板·媒体库分组标题格式", properties.TFgrouping);
				g_showlist.close();
				brw.populate(5,false);
			}
		}
	}
	utils.ShowHtmlDialog(window.ID, htmlCode(skin_global_path+"\\html","InputDialog.html"), {
		data: [title, top_msg, '取消', ok_callback,bottom_msg,input_default_values,input_labels],
	});
}
function customNowPlayingInfos(title, top_msg, bottom_msg, input_default_values, input_labels){
	function ok_callback(status, input_values) {
		if(status!="cancel"){
			var input_values = input_values.split('##');
			if (!(properties.customInfos==input_values[0]+" ^^ "+input_values[1])) {
				if((input_values[0] == "" || typeof input_values[0] == 'undefined') && (input_values[1] == "" || typeof input_values[1] == 'undefined')) properties.customInfos = "";				
				else properties.customInfos = input_values[0]+" ^^ "+input_values[1];
				setCustominfos();
				window.SetProperty("显示·信息格式化", properties.customInfos);
				g_infos.getTrackInfos();
			}
		}
	}
	utils.ShowHtmlDialog(window.ID, htmlCode(skin_global_path+"\\html","InputDialog.html"), {
		data: [title, top_msg, '取消', ok_callback,bottom_msg,input_default_values,input_labels],
	});
}
function customControlDetails(title, top_msg, bottom_msg, input_default_values, input_labels){
	function ok_callback(status, input_values) {
		if(status!="cancel"){
			var input_values = input_values.split('##');
			if (!(typeof input_values[0] == 'undefined' || properties.custom_firstRow==input_values[0])) {
				properties.custom_firstRow = input_values[0];
				window.SetProperty("显示·自定义第一行", properties.custom_firstRow);
				get_text(fb.GetNowPlaying());
			}
			if (!(typeof input_values[1] == 'undefined' || properties.custom_secondRow==input_values[1])) {
				properties.custom_secondRow = input_values[1];
				window.SetProperty("显示·自定义第二行", properties.custom_secondRow);
				get_text(fb.GetNowPlaying());
			}
		}
	}
	utils.ShowHtmlDialog(window.ID, htmlCode(skin_global_path+"\\html","InputDialog.html"), {
		data: [title, top_msg, '取消', ok_callback,bottom_msg,input_default_values,input_labels],
	});
}
function customTracklistDetails(title, top_msg, bottom_msg, input_default_values, input_labels){
	function ok_callback(status, input_values) {
		if(status!="cancel"){
			var input_values = input_values.split('##');
			if (!(typeof input_values[0] == 'undefined' || properties.show2linesCustomTag==input_values[0])) {
				properties.show2linesCustomTag = input_values[0];
				window.SetProperty("曲目列表·两行曲目信息(自定义标签)", properties.show2linesCustomTag);
			}
		}
	}
	utils.ShowHtmlDialog(window.ID, htmlCode(skin_global_path+"\\html","InputDialog.html"), {
		data: [title, top_msg, '取消', ok_callback,bottom_msg,input_default_values,input_labels],
	});
}

var colors = {};
var darkcolors = {};

var _list_clip_state = false;

function rowHeightForSnap() {
    try {
        if (typeof brw !== 'undefined' && brw && brw.rowHeight > 0) return brw.rowHeight;
    } catch (e) {}
    try {
        if (properties.rowHeight > 0) return properties.rowHeight;
    } catch (e2) {}
    return 0;
}

function snapScrollToRow(v, rowHeight) {
    var rh = rowHeight;
    if (!(rh > 0)) rh = rowHeightForSnap();
    if (!(rh > 0) || !isFinite(v)) return v;
    return Math.round(v / rh) * rh;
}

function stepScrollToRow(cur, target, rowHeight, smoothness) {
    var rh = rowHeight;
    if (!(rh > 0)) rh = rowHeightForSnap();
    if (!(rh > 0) || !isFinite(cur) || !isFinite(target)) return target;
    if (target == cur) return target;
    var sm = (smoothness > 1 ? smoothness : 1);
    var next = Math.round((cur + (target - cur) / sm) / rh) * rh;
    if (next == cur) next = cur + (target > cur ? rh : -rh);
    if ((target > cur && next >= target) || (target < cur && next <= target)) next = target;
    return next;
}

function clipListArea(gr, top) {
    _list_clip_state = false;
    if (!(top > 0)) return;
    try {
        gr.SetClip(0, top, Math.max(1, ww), Math.max(1, wh - top));
        _list_clip_state = true;
    } catch (e) {
        _list_clip_state = false;
    }
}

function unclipListArea(gr) {
    if (!_list_clip_state) return;
    try { gr.ResetClip(); } catch (e) {}
    _list_clip_state = false;
}

function get_colors_global(){
	darkcolors.normal_txt = GetGrey(240);
	if(properties.darklayout || properties.stick2darklayout){
		colors.normal_bg = GetGrey(30);
		if(globalProperties.colorsMainPanel==0 || globalProperties.colorsMainPanel==1){
			colors.lightgrey_bg = GetGrey(30);
			colors.alternate_row = GetGrey(0,0);
			colors.selected_item_bg = GetGrey(255,0);
			colors.selected_item_line = GetGrey(255,35);
			colors.selected_item_line_off = GetGrey(255,0);
			colors.track_gradient_size = 20;
			colors.padding_gradient = 10;
		} else if(globalProperties.colorsMainPanel==2){
			colors.lightgrey_bg = GetGrey(27);
			colors.alternate_row = GetGrey(0,30);
			colors.selected_item_bg = GetGrey(255,15);
			colors.selected_item_line = GetGrey(255,18);
			colors.selected_item_line_off = GetGrey(255,0);
			colors.track_gradient_size = 0;
			colors.padding_gradient = 0;
		}

		colors.wallpaper_overlay = GetGrey(25,180);
		colors.wallpaper_overlay_blurred = GetGrey(25,160);

		colors.normal_txt = darkcolors.normal_txt;
		colors.faded_txt = GetGrey(165);
		colors.superfaded_txt = GetGrey(105);
		colors.full_txt = GetGrey(255);

		colors.selected_bg = RGBA(015,177,255,160);
		colors.highlight = RGB(255,175,050);

		colors.headerbar_bg = RGBA(0, 0, 0, 0);
		colors.headerbar_line = GetGrey(255,38);

		colors.scrollbar_normal_cursor = GetGrey(255,60);
		colors.scrollbar_hover_cursor = GetGrey(225);
		colors.scrollbar_down_cursor = colors.scrollbar_hover_cursor;
		colors.scrollbar_cursor_outline = GetGrey(0,60);

		colors.pm_overlay = GetGrey(0,200);
		colors.pm_bg = GetGrey(0);
		colors.pm_shadow_on = GetGrey(0,35);
		colors.pm_shadow_off = GetGrey(0,0);
		colors.pm_border = GetGrey(255,55);
		colors.pm_txt = GetGrey(255);
		colors.pm_bg2 = GetGrey(0,120);
		colors.pm_bg3 = GetGrey(0,150);
		colors.pm_bg4 = GetGrey(255,40);
		colors.pm_item_separator_line = GetGrey(255,45);
		colors.pm_item_bg1 = GetGrey(0,130);
		colors.pm_item_bg2 = GetGrey(255,20);
		colors.pm_hover_row_bg = GetGrey(255,40);
		colors.pm_blink = GetGrey(255,15);
		colors.pm_blink_rectline = GetGrey(70);
		colors.pm_scrollbar = GetGrey(240);
		colors.dragimage_border = GetGrey(255,75);
		colors.dragimage_bg = GetGrey(0);
		colors.dragimage_text = GetGrey(255);
		colors.dragimage_gradline1 = GetGrey(255,100);
		colors.dragimage_gradline2 = GetGrey(255,200);
		colors.dragcover_overlay = GetGrey(0,85);
		colors.dragcover_rectline = GetGrey(255,40);

		colors.rating_icon_on = GetGrey(255);
		colors.rating_icon_off = GetGrey(255,60);
		colors.rating_icon_border = GetGrey(255,0);

		colors.reseticon_down = RGB(255,50,50);
		colors.keyboard_search_bg = GetGrey(0,205);
		colors.keyboard_search_txt = GetGrey(255,245);
		colors.keyboard_search_txtred = RGB(255,80,80);

		colors.sidesline = GetGrey(255,25);
		colors.border = GetGrey(255,50);
		colors.border_dark = GetGrey(0,40);
		colors.border_light = colors.border;
		colors.border_0 = GetGrey(255,50);

		colors.marker_hover_item = GetGrey(255);
		colors.width_marker_hover_item = 2;
		colors.dragdrop_marker_line = GetGrey(255,205);
	} else {
		if(globalProperties.colorsMainPanel==0 || globalProperties.colorsMainPanel==1){
			colors.normal_bg = GetGrey(255);
			colors.lightgrey_bg = GetGrey(255);
			colors.alternate_row = GetGrey(0,0);
			colors.selected_item_bg = GetGrey(0,0);
			colors.selected_item_line = GetGrey(0,37);
			colors.selected_item_line_off = GetGrey(0,0);
			colors.track_gradient_size = 20;
			colors.padding_gradient = 10;
		} else if(globalProperties.colorsMainPanel==2){
			colors.normal_bg = GetGrey(255);
			colors.lightgrey_bg = GetGrey(245);
			colors.alternate_row = GetGrey(0,3);
			colors.selected_item_bg = GetGrey(0,15);
			colors.selected_item_line = GetGrey(0,10);
			colors.track_gradient_size = 0;
			colors.padding_gradient = 0;
		}

		colors.wallpaper_overlay = GetGrey(255,210);
		colors.wallpaper_overlay_blurred = GetGrey(255,210);

		colors.normal_txt = GetGrey(0);
		colors.faded_txt = GetGrey(140);
		colors.superfaded_txt = GetGrey(200);
        colors.full_txt = GetGrey(0);
		colors.selected_bg = RGBA(015,177,255,100);
		colors.highlight = RGB(255,175,050);

		colors.headerbar_bg = RGBA(0, 0, 0, 0);
		colors.headerbar_line = GetGrey(0,36);

		colors.scrollbar_normal_cursor = GetGrey(0,120);
		colors.scrollbar_hover_cursor = GetGrey(0);
		colors.scrollbar_down_cursor = colors.scrollbar_hover_cursor;
		colors.scrollbar_cursor_outline = GetGrey(255,60);

		colors.pm_overlay = GetGrey(255,200);
		colors.pm_bg = GetGrey(255);
		colors.pm_shadow_on = GetGrey(0,5);
		colors.pm_shadow_off = GetGrey(0,0);
		colors.pm_border = GetGrey(0,40);
		colors.pm_txt = GetGrey(0);
		colors.pm_bg2 = GetGrey(0,120);
		colors.pm_bg3 = GetGrey(0,150);
		colors.pm_bg4 = GetGrey(255,40);
		colors.pm_item_separator_line = GetGrey(0,20);
		colors.pm_item_bg1 = GetGrey(0,130);
		colors.pm_item_bg2 = GetGrey(255,20);
		colors.pm_hover_row_bg = GetGrey(0,20);
		colors.pm_blink = GetGrey(0,10);
		colors.pm_blink_rectline = GetGrey(211);
		colors.pm_scrollbar = GetGrey(30);
		colors.dragimage_border = GetGrey(0);
		colors.dragimage_bg = GetGrey(0);
		colors.dragimage_text = GetGrey(255);
		colors.dragimage_gradline1 = GetGrey(255,100);
		colors.dragimage_gradline2 = GetGrey(255,200);

		colors.rating_icon_on = GetGrey(0);
		colors.rating_icon_off = GetGrey(0,30);
		colors.rating_icon_border = GetGrey(0,0);

		colors.dragcover_overlay = GetGrey(0,85);
		colors.dragcover_rectline = GetGrey(0,105);

		colors.reseticon_down = RGB(255,50,50);
		colors.keyboard_search_bg = GetGrey(0,205);
		colors.keyboard_search_txt = GetGrey(255,205);
		colors.keyboard_search_txtred = RGB(255,80,80);

		colors.sidesline = GetGrey(0,37);
		colors.border = GetGrey(0,50);
		colors.border_dark = GetGrey(0,40);
		colors.border_light = GetGrey(255,50);
		colors.border_0 = GetGrey(0,0);

		colors.marker_hover_item = GetGrey(30);
		colors.width_marker_hover_item = 2;
		colors.dragdrop_marker_line = GetGrey(20);
	}
}
//Files, Folders, FileSystemObject ----------------------------------------------------
oFileSystObject = function () {
    this.fileObject = new ActiveXObject("Scripting.FileSystemObject");
    this.CreateTextFile = function (path) {
		try {
           return this.fileObject.CreateTextFile(path);
        } catch (e) {
			fb.ShowPopupMessage('Oupppppsssss, it look like an error\n\n'+"CreateTextFile call, "+path, "Error");
            console.log(e)
        }
    };
    this.FileExists = function (path) {
		try {
           return utils.FileTest(path, "e")
        } catch (e) {
			fb.ShowPopupMessage('Oupppppsssss, it look like an error\n\n'+"FileExists call, "+path, "Error");
			console.log(e);
		}
    };
    this.MoveFile = function (target,dest) {
		try {
           return this.fileObject.MoveFile(target,dest);
        } catch (e) {
			fb.ShowPopupMessage('Oupppppsssss, it look like an error\n\n'+"MoveFile call, from "+target+" to "+dest, "Error");
			console.log(e);
		}
    };
    this.DeleteFile = function (path) {
        return this.fileObject.DeleteFile(path);
    };
    this.FolderExists = function (path) {
        try {
           return this.fileObject.FolderExists(path);
        } catch (e) {
			fb.ShowPopupMessage('Oupppppsssss, it look like an error\n\n'+"FolderExists call, "+path, "Error");
			console.log(e);
		}
    };
    this.CreateFolder = function (path) {
        try {
           return this.fileObject.CreateFolder(path);
        } catch (e) {
			fb.ShowPopupMessage('Oupppppsssss, it look like an error\n\n'+"CreateFolder call, "+path, "Error");
			console.log(e);
		}
    };
    this.DeleteFolder = function (path,force) {
        try {
           return this.fileObject.DeleteFolder(path,force);
        } catch (e) {
			fb.ShowPopupMessage('Oupppppsssss, it look like an error\n\n'+"DeleteFolder call, "+path+" force:"+force, "Error");
			console.log(e);
		}
    };
    this.GetFolder = function (path) {
        try {
           return this.fileObject.GetFolder(path);
        } catch (e) {
			fb.ShowPopupMessage('Oupppppsssss, it look like an error\n\n'+"GetFolder call, "+path, "Error");
			console.log(e);
		}
    };
    this.GetExtensionName = function (path) {
        try {
            return this.fileObject.GetExtensionName(path);
        } catch (e) {
			fb.ShowPopupMessage('Oupppppsssss, it look like an error\n\n'+"GetExtensionName call, "+path, "Error");
			console.log(e);
		}
    };
    this.OpenTextFile = function (path, openMode) {
        try {
           return this.fileObject.OpenTextFile(path, openMode);
        } catch (e) {
			fb.ShowPopupMessage('Oupppppsssss, it look like an error\n\n'+"OpenTextFile call, "+path, "Error");
			console.log(e);
		}
    };
}
g_files = new oFileSystObject();

var data_global_path = ProfilePath + "wsh-data";
if(!g_files.FolderExists(data_global_path))
g_files.CreateFolder(data_global_path);

var cover_img_cache = data_global_path+"\\"+theme_name+"-img-cache";
if(!g_files.FolderExists(cover_img_cache))
g_files.CreateFolder(cover_img_cache);

function setImageCachePath(){
}
setImageCachePath();

var SettingsPath = data_global_path+"\\"+theme_name+"-settings\\";
if (!g_files.FolderExists(SettingsPath))
g_files.CreateFolder(SettingsPath);

// Foobar commands -------------------------------------------------------
let playing_item_location = false;
let playing_item_location_old_index = false;
let ignore_playback_queue = false;
let timer_ignore_queue = false;
function fb_play_from_playing(offset){
	if(offset<0){
		fb.Prev();
	} else {
		if(fb.IsPaused || fb.IsPlaying) fb.Next();
		else fb.Play();
	}
}

// Tooltips ---------------------------------------------------------------
oTooltip = function (varName) {
	this.tooltip  = window.CreateTooltip();
	this.tooltip.TrackActivate = true;
	this.showTimer = false;
	this.activated = false;
	this.toolTipText = false;
	this.varName = varName;
	this.followMouse = false;
	this.x = -1;
	this.y = -1;
	this.activeZone = '';
	this.setText = function (new_text) {
		this.tooltip.Text = new_text;
	};
	this.getText = function () {
		return this.tooltip.Text;
	}
	this.getActiveZone = function () {
		return this.activeZone;
	}
    this.ActivateDelay = function(new_text, x, y, delay, maxWith, followMouse, activeZone) {
		this.activeZone = activeZone;
		if((!this.showTimer && !this.activated) || new_text!=this.tooltip.Text){
			this.offset_x = x - g_cursor.x;
			this.offset_y = y - g_cursor.y;
			followMouse = typeof followMouse !== 'undefined' ? followMouse : false;
			maxWith = typeof maxWith !== 'undefined' ? maxWith : 0;
			this.showTimer && clearTimeout(this.showTimer);
			this.showTimer = setTimeout(function (activeTooltip) {
				activeTooltip.Activate(new_text, g_cursor.x + activeTooltip.offset_x, g_cursor.y + activeTooltip.offset_y, maxWith, followMouse, activeZone);
				window.ClearInterval(this.showTimer);
				activeTooltip.showTimer = false;
			}, delay, this);
		}
    };
    this.Activate = function(new_text, x, y, maxWith, followMouse, activeZone) {
		maxWith = typeof maxWith !== 'undefined' ? maxWith : 0;
		this.activeZone = activeZone;
		this.followMouse = typeof followMouse !== 'undefined' ? followMouse : false;
		if(x != this.x || y != this.y){
			this.tooltip.TrackActivate = true;
			this.tooltip.TrackPosition(x, y);
		}
		if(this.tooltip.Text != new_text || !this.activated){
			this.offset_x = x - g_cursor.x;
			this.offset_y = y - g_cursor.y;
			if(maxWith>0) this.tooltip.SetMaxWidth(maxWith);
			this.tooltip.Text = new_text;
			this.tooltip.Activate();
			this.activated = true;
		}
		if(x != this.x || y != this.y){
			this.tooltip.TrackActivate = true;
			this.tooltip.TrackPosition(x, y);
		}
		this.x = x;
		this.y = y;
    };
    this.Deactivate = function() {
		this.activeZone = '';
		this.followMouse = false;
		if(this.activated){
			this.tooltip.Deactivate();
			this.activated = false;
			clearTimeout(this.showTimer);
			this.showTimer = false;
		} else if(this.showTimer)	{
			clearTimeout(this.showTimer);
			this.showTimer = false;
		}
		this.x = -1;
		this.y = -1;
    };
    this.onMouse = function (state, x, y, m) {
		switch(state){
			case 'lbtn_down':
			break;
			case 'lbtn_up':
			break;
			case 'dble_click':
			break;
			case 'move':
				if(this.followMouse && (x != this.x || y != this.y)){
					this.tooltip.TrackPosition(x+this.offset_x, y+this.offset_y);
					this.x = x;
					this.y = y;
				}
			break;
			case 'leave':
				this.Deactivate();
			break;
		}
    }
};

oUIHacks = function () {
    this.useNative = (typeof fb !== 'undefined' && typeof fb.Window !== 'undefined');
    this.activeXObject = null;
    
    if (!this.useNative) {
        try {
            this.activeXObject = new ActiveXObject("OpenHacks");
        } catch (e) {
            try { this.activeXObject = new ActiveXObject("OpenHacksMod"); } catch (e2) {}
        }
    }

    this.EnableSizing = function () {};
    this.DisableSizing = function () {};
    
    this.SetPseudoCaption = function (x, y, w, h) {
        if (this.useNative) {
            try {
                fb.Window.FrameStyle = 2; // NoBorder
                fb.Window.SetPseudoCaption(x, y - 2, w, h, true); 
            } catch(e) { console.log("Native PseudoCaption Err: " + e); }
        } else if (this.activeXObject) {
            var oh = this.activeXObject;
            oh.PseudoCaptionLeftEnabled = true; oh.PseudoCaptionTopEnabled = true;
            oh.PseudoCaptionRightEnabled = false; oh.PseudoCaptionBottomEnabled = false;
            oh.PseudoCaptionLeft = x; oh.PseudoCaptionTop = y;
            oh.PseudoCaptionWidth = Math.max(0, w); oh.PseudoCaptionHeight = Math.max(0, h);
        }
    };
    
    this.getFullscreenState = function () { 
        if (this.useNative) return fb.Window.Fullscreen;
        return this.activeXObject ? this.activeXObject.Fullscreen : false; 
    };
    
    this.setFullscreenState = function (v) { 
        if (this.useNative) fb.Window.Fullscreen = v;
        else if (this.activeXObject) this.activeXObject.Fullscreen = v;
    };
    
    this.toggleFullscreen = function () { 
        if (this.useNative) fb.Window.Fullscreen = !fb.Window.Fullscreen;
        else if (this.activeXObject) this.activeXObject.ToggleFullscreen();
    };
    
    this.getMainWindowState = function () { 
        if (this.useNative) {
            if (fb.Window.IsMaximized) return 2; // Maximized
            if (fb.Window.IsMinimized) return 1; // Minimized
            return 0; // Normal
        }
        return this.activeXObject ? this.activeXObject.WindowState : 0; 
    };
    
    this.setMainWindowState = function (v) { 
        if (this.useNative) {
            if (v === 2) fb.Window.Maximize();
            else if (v === 1) fb.Window.Minimize();
            else fb.Window.Restore();
        } else if (this.activeXObject) {
            this.activeXObject.WindowState = v;
        }
    };

    this.enableMinSize = function () {}; this.disableMinSize = function () {};
    this.setMinWidth = function () {}; this.setMinHeight = function () {};
    this.enableMaxSize = function () {}; this.disableMaxSize = function () {};
    this.setMaxWidth = function () {}; this.setMaxHeight = function () {};
    this.setAero = function () {}; this.setAeroEffect = function () {};
    
    this.setFrameStyle = function (v) { 
        if (this.useNative) fb.Window.FrameStyle = (v === 3 ? 2 : 0);
        else if (this.activeXObject) this.activeXObject.WindowFrameStyle = (v === 3 ? 1 : 0); 
    };
};

var g_uihacks = new oUIHacks();

// ═══════════════════════════════════════════════════════════════════════
// -----------------------------------------------------------------------
// ═══════════════════════════════════════════════════════════════════════
var g_dui_bar_hack = null;

function hideDuiBars() {
    if (window.InstanceType !== 1) return;

    var done = false;
    try {
        if (fb.Window) {
            fb.Window.MainMenuHidden = true;
            fb.Window.StatusBarHidden = true;
            done = (fb.Window.MainMenuHidden === true);
        }
    } catch (e) { done = false; }

    if (!done) {
        try {
            if (!g_dui_bar_hack) {
                if (utils.CheckComponent("foo_openhacks_mod")) g_dui_bar_hack = new ActiveXObject("OpenHacksMod");
                else if (utils.CheckComponent("foo_openhacks")) g_dui_bar_hack = new ActiveXObject("OpenHacks");
            }
            if (g_dui_bar_hack) {
                g_dui_bar_hack.MenuBarVisible = false;
                g_dui_bar_hack.StatusBarVisible = false;
            }
        } catch (e) {}
    }
}

hideDuiBars();
window.SetTimeout(hideDuiBars, 300);
window.SetTimeout(hideDuiBars, 1500);

function Resizing(panelName, resizing_left,resizing_right, y_min, y_max) {
	this.resizing_left = typeof resizing_left !== 'undefined' ? resizing_left : false;
	this.resizing_right = typeof resizing_right !== 'undefined' ? resizing_right : false;
	this.panelName = typeof panelName !== 'undefined' ? panelName : "unknown";
	this.y_min = typeof y_min !== 'undefined' ? y_min : 0;
	this.y_max = typeof y_max !== 'undefined' ? y_max : 0;
	this.over_resizing_left = false;
	this.over_resizing_right = false;
	this.resizing_left_active = false;
	this.resizing_right_active = false;
	this.resizing_x = 0;
	this.resizing_activate_x = -1;
	this.show_resize_border = false;
	this.enableWindowSizing = function(m){
		g_uihacks.EnableSizing(m);
	}
	this.draw = function(gr){
	}
	this.isResizing = function(){
		return (this.resizing_left_active || this.resizing_right_active);
	}
	this.showResizeBorder = function(){
		return (this.isResizing() || this.show_resize_border);
	}
	this.disableWindowSizing = function(m){
		g_uihacks.DisableSizing(m);
	}
	this.deactivatePanelSizing = function(){
		if(globalProperties.enableResizableBorders){
			if(this.resizing_left_active) window.NotifyOthers("resizingleft_"+this.panelName,false);
			if(this.resizing_right_active) window.NotifyOthers("resizingright_"+this.panelName,false);
			this.resizing_left_active = false;
			this.resizing_right_active = false;
			this.over_resizing_left = false;
			this.over_resizing_right = false;
			this.resizing_x = 0;
			window.Repaint();
			if(g_cursor.getActiveZone()==this.panelName) g_cursor.setCursor(IDC_ARROW,2);
		}
	}
	this.on_mouse = function(event, x, y, m, resizing){
		var resizing = typeof resizing !== 'undefined' ? resizing : true;
		switch(event){
			case "move":
				if(globalProperties.enableResizableBorders){
					this.over_resizing_right = this.over_resizing_left = false;
					if(resizing){
						if(this.resizing_right && x>ww-10 && y>this.y_min && y<wh-this.y_max){
							this.over_resizing_right = true;
							this.resizing_activate_x = x;
							this.over_resizing_left = false;
							if(g_cursor.getCursor()!=IDC_SIZEWE) g_cursor.setCursor(IDC_SIZEWE,this.panelName,5);
						} else if(this.resizing_left && x<10 && y>this.y_min && y<wh-this.y_max){
							this.over_resizing_left = true;
							this.resizing_activate_x = x;
							this.over_resizing_right = false;
							if(g_cursor.getCursor()!=IDC_SIZEWE) g_cursor.setCursor(IDC_SIZEWE,this.panelName,5);
						} else if(g_cursor.getActiveZone()==this.panelName && !this.resizing_left_active){
							g_cursor.setCursor(IDC_ARROW,'1');
							this.over_resizing_left = false;
							this.resizing_activate_x = -1;
							this.over_resizing_right = false;
						} else {
							this.over_resizing_left = false;
							this.resizing_activate_x = -1;
							this.over_resizing_right = false;
						}
					}
				}
				return (this.resizing_left_active || this.resizing_right_active);
			break;
			case "lbtn_down":
				if(globalProperties.enableResizableBorders && resizing && this.resizing_activate_x==x){
					if(this.over_resizing_left){
						this.resizing_left_active = true;
						window.NotifyOthers("resizingleft_"+this.panelName,true);
						this.resizing_x = x;
						window.Repaint();
					}
					else if(this.over_resizing_right){
						this.resizing_right_active = true;
						window.NotifyOthers("resizingright_"+this.panelName,true);
						this.resizing_x = x;
						window.Repaint();
					}
					if(typeof g_tooltip == 'object') g_tooltip.Deactivate();
				}
				this.disableWindowSizing(m);
				return (this.resizing_left_active || this.resizing_right_active);
			break;
			case "lbtn_up":
				var return_var = (this.resizing_left_active || this.resizing_right_active);
				this.deactivatePanelSizing();
				this.enableWindowSizing(m);
				return return_var;
			break;
			case "leave":
				g_cursor.setCursor(IDC_ARROW,3);
			break;
		}
	}
	this.on_drag = function(event, x, y, m){
		switch(event){
			case "move":
			break;
			case "lbtn_down":
				this.disableWindowSizing(m);
			break;
			case "lbtn_up":
				this.enableWindowSizing(m);
			break;
			case "leave":
				this.on_mouse("lbtn_up", x, y, m);
			break;
		}
	}
}
// Playlists ----------------------------------------------------------------
function ExcludePlaylist(name){
	for (var i = 0; i < PlaylistExclude.length; i++) {
		if(PlaylistExclude[i]==name) return true;
	}
	return false;
}

function check_playlist(name){
    var pl_name = "", pl_idx = -1;
    for(var i=0; i < plman.PlaylistCount; i++) {
        pl_name = plman.GetPlaylistName(i);
        if(pl_name == name) {
            pl_idx = i;
            break;
        };
    };
    return pl_idx;
};
var setPlaybackPlaylist_timer=false;
function renamePlaybackPlaylist(){
	if(fb.IsPlaying && plman.GetPlaylistName(plman.PlayingPlaylist) == globalProperties.selection_playlist) {
		window.NotifyOthers("avoid_on_playlists_changed",true);
		var found_playingPlaylist = false;
		var total = plman.PlaylistCount;
		var pidx_selection = plman.PlayingPlaylist;
		var pidx_playing = -1;
		for(var i = 0; i < total; i++) {
			if(!found_playingPlaylist && plman.GetPlaylistName(i) == globalProperties.playing_playlist) {
				pidx_playing = i;
				found_playingPlaylist = true;
			};
			if(found_playingPlaylist) break;
		};
		plman.RenamePlaylist(pidx_selection, globalProperties.playing_playlist);
		if(found_playingPlaylist) {
			plman.RenamePlaylist(pidx_playing, globalProperties.selection_playlist);
		};
		if(!setPlaybackPlaylist_timer) {
			setPlaybackPlaylist_timer = setTimeout(function() {
				window.NotifyOthers("avoid_on_playlists_changed",false);
				window.NotifyOthers("UpdatePlaylistsManager",true);
				setPlaybackPlaylist_timer && clearTimeout(setPlaybackPlaylist_timer);
				setPlaybackPlaylist_timer = false;
			}, 125);
		};			
		return pidx_playing;
	}
	return false;
}
function sendandplayPlaybackPlaylist(items, play_metadb){
	play_metadb = typeof play_metadb !== 'undefined' ? play_metadb : null;
	window.NotifyOthers("avoid_on_playlists_changed",true);
	var found_playingPlaylist = false;
	var total = plman.PlaylistCount;
	var pidx_selection = plman.PlayingPlaylist;
	var pidx_playing = getPlaybackPlaylist();
	if(pidx_playing>-1) {
		plman.ClearPlaylist(pidx_playing);
		plman.InsertPlaylistItems(pidx_playing, 0, items);

		plman.FlushPlaybackQueue();
		plman.PlayingPlaylist = pidx_playing;
		if(play_metadb)
			plman.SetPlaylistFocusItem(pidx_playing, play_metadb);
		else
			plman.SetPlaylistFocusItem(pidx_playing, 0);
		if(play_metadb)
			runContextCommand("Add to playback queue", play_metadb);
		else
			plman.AddPlaylistItemToPlaybackQueue(pidx_playing, 0);
		if(fb.IsPaused || fb.IsPlaying) fb.Next();
		else fb.Play();

	};
	if(!setPlaybackPlaylist_timer) {
		setPlaybackPlaylist_timer = setTimeout(function() {
			window.NotifyOthers("avoid_on_playlists_changed",false);
			setPlaybackPlaylist_timer && clearTimeout(setPlaybackPlaylist_timer);
			setPlaybackPlaylist_timer = false;
		}, 125);
	};
}
function getPlaybackPlaylist(){
	var total = plman.PlaylistCount;
	var pidx_playing=-1;
	for (i=0; i < total; i++) {
		if(plman.GetPlaylistName(i)==globalProperties.playing_playlist){
			pidx_playing=i;break;
		}
	}
	if(pidx_playing<0){plman.CreatePlaylist(0, globalProperties.playing_playlist);pidx_playing=0}
	return pidx_playing;
}
function findSelectionPlaylist(){
	var total = plman.PlaylistCount;
	var pidx_selection = -1;
	var found_selectionPlaylist = false
	for(var i = 0; i < total; i++) {
		if(!found_selectionPlaylist && plman.GetPlaylistName(i) == globalProperties.selection_playlist) {
			pidx_selection = i;
			found_selectionPlaylist = true;
		};
		if(found_selectionPlaylist) break;
	};
	return pidx_selection;
}
function setMemoryUsageGlobally(mem_solicitation){
	globalProperties.mem_solicitation = mem_solicitation;
	window.SetProperty("全局·内存占用策略", globalProperties.mem_solicitation);
	window.NotifyOthers("MemSolicitation",globalProperties.mem_solicitation);
	window.NotifyOthers("WSH_panels_reload",true);
}
function setCoverCacheMaxWidthGlobally(covercache_max_mwith){
	globalProperties.coverCacheWidthMax = Number(covercache_max_mwith);
	window.SetProperty("全局·封面缓存最大宽度", globalProperties.coverCacheWidthMax);
	window.NotifyOthers("coverCacheWidthMax",globalProperties.coverCacheWidthMax);
}
function enableDiskCacheGlobally(){
	globalProperties.enableDiskCache = !globalProperties.enableDiskCache;
	window.SetProperty("封面·磁盘缓存", globalProperties.enableDiskCache);
	window.NotifyOthers("DiskCacheState",globalProperties.enableDiskCache);
	if(globalProperties.enableDiskCache) HtmlMsg("磁盘图像缓存说明", "磁盘图像缓存是一点一点建立的：显示封面时，如果尚未存入缓存，就会加入缓存。\n\n磁盘图像缓存基于 %album artist% 与 %album% 标签。\n\n更新已有封面后，必须在 foobar 中手动刷新：右键单击需要刷新的封面，会出现相应菜单项。", "确定")
	else  HtmlMsg("磁盘图像缓存说明", "警告：未启用磁盘图像缓存时，foobar 可能会变慢。\n\n要完全停用，请重启 foobar。", "确定");
}
function enableCoversAtStartupGlobally(){
	globalProperties.load_covers_at_startup = !globalProperties.load_covers_at_startup;
	window.SetProperty("封面·启动时全部加载", globalProperties.load_covers_at_startup);
	window.NotifyOthers("LoadAllCoversState",globalProperties.load_covers_at_startup);
	if(globalProperties.load_covers_at_startup) HtmlMsg("磁盘图像缓存说明", ((!globalProperties.enableDiskCache)?"如果磁盘图像缓存已启用并已建立完成，此选项效果更好（请检查下方选项）。\n\n":"")+"启用此选项后 foobar 的内存占用会更高，因为所有封面都会载入内存；如果您的媒体库不是特别庞大，应该没有问题。\n\n如需更新封面，必须在 foobar 中手动刷新：右键单击需要刷新的封面，会出现相应菜单项。\n\n磁盘图像缓存基于 %album artist% 与 %album% 标签。\n\n重启 foobar 后开始加载所有封面。", "确定")
}
function enableArtistImgAtStartupGlobally(){
	globalProperties.load_artist_img_at_startup = !globalProperties.load_artist_img_at_startup;
	window.SetProperty("艺术家图片·启动时全部加载", globalProperties.load_artist_img_at_startup);
	window.NotifyOthers("LoadAllArtistImgState",globalProperties.load_artist_img_at_startup);
	if(globalProperties.load_artist_img_at_startup) HtmlMsg("磁盘图像缓存说明",((!globalProperties.enableDiskCache)?"如果磁盘图像缓存已启用并已建立完成，此选项效果更好（请检查下方选项）。\n\n":"")+"启用此选项后 foobar 的内存占用会更高，因为所有艺术家缩略图都会载入内存；如果您的媒体库不是特别庞大，应该没有问题。\n\n如需更新艺术家图片，必须在 foobar 中手动刷新：右键单击需要刷新的艺术家缩略图，会出现相应菜单项。\n\n磁盘图像缓存基于 %album artist% 标签。\n\n重启 foobar 后开始加载所有封面。", "确定")
}
function hibernate_computer(){
	var WshShell = new ActiveXObject("WScript.Shell");
	WshShell.Run("shutdown.exe /h", 0);
}
function shutdown_computer(){
	var WshShell = new ActiveXObject("WScript.Shell");
	WshShell.Run("shutdown.exe /s /t 00", 0);
}
var MF_SEPARATOR = 0x00000800;
var MF_GRAYED = 0x00000001;
var MF_STRING = 0x00000000;
var MF_DISABLED = 0x00000002;
var MF_CHECKED = 0x00000008;
var MFT_RADIOCHECK = 0x00000200;
var MFS_CHECKED = 0x00000008;
var MF_POPUP = 0x00000010;
var DT_TOP = 0x00000000;
var DT_LEFT = 0x00000000;
var DT_CENTER = 0x00000001;
var DT_RIGHT = 0x00000002;
var DT_VCENTER = 0x00000004;
var DT_BOTTOM = 0x00000008;
var DT_WORDBREAK = 0x00000010;
var DT_SINGLELINE = 0x00000020;
var DT_NOCLIP = 0x00000100;
var DT_CALCRECT = 0x00000400;  // [1.2.1] Handles well
var DT_NOPREFIX = 0x00000800;  // NOTE: Please use this flag, or a '&' character will become an underline '_'
var DT_END_ELLIPSIS = 0x00008000;
var DT_WORD_ELLIPSIS = 0x00040000;
var VK_F2 = 0x71;
var VK_F3 = 0x72;
var VK_F5 = 0x74;
var VK_F6 = 0x75;
var VK_BACK = 0x08;
var VK_TAB = 0x09;
var VK_RETURN = 0x0D;
var VK_SHIFT = 0x10;
var VK_CONTROL = 0x11;
var VK_ALT = 0x12;
var VK_ESCAPE = 0x1B;
var VK_PGUP = 0x21;
var VK_PGDN = 0x22;
var VK_END = 0x23;
var VK_HOME = 0x24;
var VK_LEFT = 0x25;
var VK_UP = 0x26;
var VK_RIGHT = 0x27;
var VK_DOWN = 0x28;
var VK_DELETE = 0x2E;

// Used in window.SetCursor()
var IDC_ARROW = 32512;
var IDC_IBEAM = 32513;
var IDC_SIZEWE = 32644;
var IDC_SIZEALL = 32646;
var IDC_HAND = 32649;
var IDC_HELP = 32651;

var vb = {};
vb.Function = function (func) {
    return function () {
        return vb.Function.eval.call(this, func, arguments);
    };
};

vb.Function.eval = function (func) {
    var args = Array.prototype.slice.call(arguments[1]);
    for (var i = 0;
    i < args.length;
    i++) {
        if (typeof args[i] != 'string') {
            continue;
        };
        args[i] = args[i].replace(/"/g, '" + Chr(34) + "') ;
		args[i] = '"' + args[i].replace(/\n/g, '" + Chr(13) + "') + '"';
    };
    var vbe = new ActiveXObject('ScriptControl');
    vbe.Language = 'VBScript';
    return vbe.Eval(func + '(' + args.join(', ') + ')');
};

var MsgBox = vb.Function('MsgBox');
vb.OKOnly = 0;
vb.OKCancel = 1;
vb.AbortRetryIgnore = 2;
vb.YesNoCancel = 3;
vb.YesNo = 4;
vb.RetryCancel = 5;
vb.Critical = 16;
vb.Question = 32;
vb.Exclamation = 48;
vb.Information = 64;
vb.DefaultButton1 = 0;
vb.DefaultButton2 = 256;
vb.DefaultButton3 = 512;
vb.DefaultButton4 = 768;
vb.ApplicationModal = 0;
vb.SystemModal = 4096;
vb.OK = 1;
vb.Cancel = 2;
vb.Abort = 3;
vb.Retry = 4;
vb.Ignore = 5;
vb.Yes = 6;
vb.No = 7;

var KMask = {
    none: 0,
    ctrl: 1,
    shift: 2,
    ctrlshift: 3,
    ctrlalt: 4,
    ctrlaltshift: 5,
    alt: 6
};

var ButtonStates = {
    normal: 0,
    hover: 1,
    down: 2,
    hide: 3,
    active: 4,
}
var AlbumArtId = {
	front: 0,
	back: 1,
	disc: 2,
	icon: 3,
	artist: 4
};
// Used in window.GetColourCUI()
ColorTypeCUI = {
    text: 0,
    selection_text: 1,
    inactive_selection_text: 2,
    background: 3,
    selection_background: 4,
    inactive_selection_background: 5,
    active_item_frame: 6
};
// Used in window.GetFontCUI()
FontTypeCUI = {
    items: 0,
    labels: 1
};
// Used in window.GetColourDUI()
ColorTypeCUI = {
    text: 0,
    selection_text: 1,
    inactive_selection_text: 2,
    background: 3,
    selection_background: 4,
    inactive_selection_background: 5,
    active_item_frame: 6
};
// Used in window.GetFontDUI()
FontTypeDUI = {
    defaults: 0,
    tabs: 1,
    lists: 2,
    playlists: 3,
    statusbar: 4,
    console: 5
};
function RGB(r, g, b) {
    return (0xff000000 | (r << 16) | (g << 8) | (b));
};
function RGBA(r, g, b, a) {
    return ((a << 24) | (r << 16) | (g << 8) | (b));
};
var MAIN_MENU_ALIAS = {
	"File/New playlist": "文件/新建播放列表",
	"File/Open...": "文件/打开...",
	"File/Preferences": "文件/首选项",
	"File/Save playlist...": "文件/保存播放列表...",
	"File/Save Playlist...": "文件/保存播放列表...",
	"File/Load Playlist...": "文件/载入播放列表...",
	"Edit/Search": "编辑/搜索",
	"Edit/Undo": "编辑/撤销",
	"Edit/Select all": "编辑/全选",
	"View/Always on Top": "查看/总在最前",
	"View/ElPlaylist/Refresh": "查看/ElPlaylist/刷新",
	"View/ElPlaylist/Show Now Playing": "查看/ElPlaylist/显示正在播放",
	"Library/Configure": "媒体库/配置"
};
var CONTEXT_CMD_ALIAS = {
	"Properties": "属性",
	"Add to playback queue": "添加到播放队列",
	"Open containing folder": "打开所在文件夹"
};
function aliasLookup(table, cmd) {
	for (var k in table) {
		if (k === cmd) return table[k];
		if (table[k] === cmd) return k;
	}
	return null;
}
function runMainMenuCommand(cmd) {
	var ok = false;
	try { ok = fb.RunMainMenuCommand(cmd); } catch (e) { ok = false; }
	if (ok === false) {
		var alt = aliasLookup(MAIN_MENU_ALIAS, cmd);
		if (alt) { try { ok = fb.RunMainMenuCommand(alt); } catch (e) { ok = false; } }
	}
	return ok;
}
function runContextCommand(cmd, handle, flags) {
	var ok = false;
	try {
		ok = (typeof flags === 'undefined')
			? fb.RunContextCommandWithMetadb(cmd, handle)
			: fb.RunContextCommandWithMetadb(cmd, handle, flags);
	} catch (e) { ok = false; }
	if (ok === false) {
		var alt = aliasLookup(CONTEXT_CMD_ALIAS, cmd);
		if (alt) {
			try {
				ok = (typeof flags === 'undefined')
					? fb.RunContextCommandWithMetadb(alt, handle)
					: fb.RunContextCommandWithMetadb(alt, handle, flags);
			} catch (e) { ok = false; }
		}
	}
	return ok;
}

function GetGrey(grey,alpha){
	alpha = typeof alpha !== 'undefined' ? alpha : 255;
	return RGBA(grey,grey,grey,alpha);
}

function HSL2RGB(zH, zS, zL, result) {
    var L = zL / 100;
    var S = zS / 100;
    var H = zH / 100;
    var R, G, B, var_1, var_2;
    if (S==0) {             //HSL from 0 to 1
       R = L * 255;         //RGB results from 0 to 255
       G = L * 255;
       B = L * 255;
    } else {
       if (L<0.5) var_2 = L * (1 + S);
       else var_2 = (L + S) - (S * L);

       var_1 = 2 * L - var_2;

       R = 255 * Hue2RGB(var_1, var_2, H + ( 1 / 3 ));
       G = 255 * Hue2RGB(var_1, var_2, H );
       B = 255 * Hue2RGB(var_1, var_2, H - ( 1 / 3 ));
    }
    switch(result) {
        case "R":
            return Math.round(R);
            break;
        case "G":
            return Math.round(G);
            break;
        case "B":
            return Math.round(B);
            break;
        default:
            return RGB(Math.round(R), Math.round(G), Math.round(B));
    }
};
function Hue2RGB(v1, v2, vH) {
   if (vH < 0) vH += 1;
   if (vH > 1) vH -= 1;
   if ((6 * vH) < 1) return (v1 + ( v2 - v1 ) * 6 * vH);
   if ((2 * vH) < 1) return (v2);
   if ((3 * vH) < 2) return (v1 + ( v2 - v1 ) * ( ( 2 / 3 ) - vH ) * 6);
   return (v1);
};
function RGB2HSL(RGB_colour) {
    var R = (getRed(RGB_colour) / 255);
    var G = (getGreen(RGB_colour) / 255);
    var B = (getBlue(RGB_colour) / 255);
    var HSL_colour = {RGB:0, H:0, S:0, L:0};

    var_Min = Math.min(R, G, B);    //Min. value of RGB
    var_Max = Math.max(R, G, B);    //Max. value of RGB
    del_Max = var_Max - var_Min;    //Delta RGB value

    L = ( var_Max + var_Min ) / 2;

    if ( del_Max == 0 ) {           //This is a gray, no chroma...
       H = 0;                       //HSL results from 0 to 1
       S = 0;
    }
    else {                          //Chromatic data...
       if ( L < 0.5 ) S = del_Max / ( var_Max + var_Min );
       else           S = del_Max / ( 2 - var_Max - var_Min );

       del_R = ( ( ( var_Max - R ) / 6 ) + ( del_Max / 2 ) ) / del_Max;
       del_G = ( ( ( var_Max - G ) / 6 ) + ( del_Max / 2 ) ) / del_Max;
       del_B = ( ( ( var_Max - B ) / 6 ) + ( del_Max / 2 ) ) / del_Max;

       if      ( R == var_Max ) H = del_B - del_G;
       else if ( G == var_Max ) H = ( 1 / 3 ) + del_R - del_B;
       else if ( B == var_Max ) H = ( 2 / 3 ) + del_G - del_R;

       if ( H < 0 ) H += 1;
       if ( H > 1 ) H -= 1;
    }
    HSL_colour.RGB = RGB_colour;
    HSL_colour.H = Math.round(H * 100);
    HSL_colour.S = Math.round(S * 100);
    HSL_colour.L = Math.round(L * 100);
    return HSL_colour;
};
function getRed(color) {
    return ((color >> 16) & 0xff);
};
function getGreen(color) {
    return ((color >> 8) & 0xff);
};

function getBlue(color) {
    return (color & 0xff);
};
function setAlpha(color, alpha) {
	colorRGB = toRGB(color);
    return RGBA(colorRGB[0], colorRGB[1], colorRGB[2],alpha);
};
function toRGB(d){ // convert back to RGB values
	var d = d - 0xff000000;
	var r = d >> 16;
	var g = d >> 8 & 0xFF;
	var b = d & 0xFF;
	return [r,g,b];
};

function blendColors(c1, c2, factor) {
	// When factor is 0, result is 100% color1, when factor is 1, result is 100% color2.
	var c1 = toRGB(c1);
	var c2 = toRGB(c2);
	var r = Math.round(c1[0] + factor * (c2[0] - c1[0]));
	var g = Math.round(c1[1] + factor * (c2[1] - c1[1]));
	var b = Math.round(c1[2] + factor * (c2[2] - c1[2]));
	return (0xff000000 | (r << 16) | (g << 8) | (b));
};
oGenreCache = function () {
    this.genreList = Array();
	this.tf_genre = globalProperties.tf_genre;
    this.initialized = false;
    this.genreExist = function (genre) {
		for (var i = 0; i < this.genreList.length; i++) {
			if(this.genreList[i][0]==genre) return true;
		}
		return false;
    };
    this.add = function (genre) {
		if(!this.genreExist(genre)) {
			this.genreList[this.genreList.length] = Array(genre,"0");
			return true;
		}
		return false;
    };
	this.onFinish = function (genre) {
		this.sort();
		this.setHierarchy();
		this.initialized = true;
		window.NotifyOthers("hereIsGenreList",JSON_stringify(g_genre_cache));
	}
	this.setHierarchy = function () {
		var submenu=false;
		for (var i = 0; i < this.genreList.length; i++) {
			if(this.genreList[i][0].charAt(1)==".") {
				this.genreList[i][1]="2";
				if(submenu) this.genreList[i-1][1]="1";
				submenu=false;
			} else submenu=true;
		}
	}
	this.sort = function (genre) {
		this.genreList.sort(sortNumber);
	}
	this.isEmpty = function () {
		return (this.genreList.length == 0);
	}
    this.trace = function (genre) {
		for (var i = 0; i < this.genreList.length; i++) {
			console.log(this.genreList[i][0]+","+this.genreList[i][1])
		}
    };
    this.on_metadb_changed = function (metadbs, fromhook) {
		if(fromhook) return;
		var previous = "123456789";
		var total = metadbs.Count;
		var item_genre = "";
		var genre_added = false;
		for(var i=0; i < total; i++) {
			item_genre = this.tf_genre.EvalWithMetadb(metadbs[i]);
			if(item_genre!=previous){
				if(this.add(item_genre)) genre_added = true;
				previous=item_genre;
			}
		}
		if(genre_added) this.onFinish();
    };
	this.build_from_library = function () {
		var libraryList = fb.GetLibraryItems();
		libraryList.OrderByFormat(globalProperties.tf_genre, 1);
		var i = 0;
		var previous = "123456789";
		var total = libraryList.Count;
		var item_genre = "";
		while(i < total){
			item_genre = this.tf_genre.EvalWithMetadb(libraryList[i]);
			if(item_genre!=previous){
				this.add(item_genre);
				previous=item_genre;
			}
			i++;
		}
		libraryList = undefined;
		this.onFinish();
	}
}
var_cache = function(){
	this.vars = {};
	this.set = function(name,value){
		this.vars[name] = value;
	};
	this.get = function(name){
		return this.vars[name];
	};
	this.setOnce = function(name,value){
		if(!this.isdefined(name)) this.vars[name] = value;
	};
	this.isdefined = function(name){
		return (typeof this.vars[name] != 'undefined' &&  this.vars[name]!=null);
	}
	this.reset = function(name){
		delete this.vars[name];
	}
	this.resetAll = function(){
		this.vars = {};
	}
}
function isDefined(variable){
	return (typeof variable != 'undefined' && variable!=null);
}
function sortNumber(a,b) {
    if(a[0] < b[0]) return -1;
    if(a[0] > b[0]) return 1;
    return 0;
}
function createGenrePopupMenu(firstFile, checked_item, genrePopupMenu){
	var checked_item = typeof checked_item !== 'undefined' ? checked_item : -1;
	var genrePopupMenu = typeof genrePopupMenu !== 'undefined' ? genrePopupMenu : window.CreatePopupMenu();
	if(checked_item >= 1000 && checked_item < 2001) var checked_name=g_genre_cache.genreList[checked_item-1000][0];
	else checked_name="#";

	//Append first song path
	try {
		if(!g_genre_cache.initialized) g_genre_cache.build_from_library();
	} catch (e) {
		g_genre_cache = new oGenreCache();
		g_genre_cache.build_from_library();
	}
	if(firstFile){
		var firstFileGenre = globalProperties.tf_genre.EvalWithMetadb(firstFile);
		var firstFilePath = firstFile.Path.substring(0,firstFile.Path.lastIndexOf("\\")+1)
		if(firstFilePath.indexOf(firstFileGenre)!=-1) var showBelow=true; else var showBelow=false;

		var DefaultGenreIndex=0;
		for (var i = 0; i < g_genre_cache.genreList.length; i++) {
			if(firstFilePath.indexOf(g_genre_cache.genreList[i][0])!=-1) {DefaultGenreIndex=i+1;break;}
		}
		if (DefaultGenreIndex>0 && !showBelow) {
			genrePopupMenu.AppendMenuItem(MF_STRING, DefaultGenreIndex+999, g_genre_cache.genreList[DefaultGenreIndex-1][0].replace("&","&&")+"（从首个文件路径推断）");
			genrePopupMenu.AppendMenuSeparator();
		}
    }

    var genre1 = window.CreatePopupMenu(); //Main genre 1
    var genre2 = window.CreatePopupMenu(); //Main genre 2
    var genre3 = window.CreatePopupMenu(); //Main genre 3
    var genre4 = window.CreatePopupMenu(); //Main genre 4
    var genre5 = window.CreatePopupMenu(); //Main genre 5
    var genre6 = window.CreatePopupMenu(); //Main genre 6
    var genre7 = window.CreatePopupMenu(); //Main genre 6

	var currentLevel=0;var flags=MF_STRING;
	if(g_genre_cache.genreList.length==0){
		if(g_genre_cache.initialized === false) genrePopupMenu.AppendMenuItem(MF_DISABLED, 0, "流派列表正在构建中，几秒后即可就绪。");
		else {
			genrePopupMenu.AppendMenuItem(MF_DISABLED, 0, "从媒体库生成的列表当前为空。");
			genrePopupMenu.AppendMenuItem(MF_DISABLED, 0, "注意：列表将在下次启动时刷新。");
			genrePopupMenu.AppendMenuSeparator();
			genrePopupMenu.AppendMenuItem(MF_STRING, 10000, "立即刷新");
		}
	} else {
		for (var i = 0; i < g_genre_cache.genreList.length; i++) {
			if(i+1000==checked_item) flags=MF_CHECKED;
			if(g_genre_cache.genreList[i][1]=="0") genrePopupMenu.AppendMenuItem(flags, i+1000, g_genre_cache.genreList[i][0].replace("&","&&"));
			else if(g_genre_cache.genreList[i][1]=="1") {
				currentLevel++;
				try {
					eval('genre'+currentLevel).AppendMenuItem(flags, i+1000, g_genre_cache.genreList[i][0].replace("&","&&"));
					if(checked_name.charAt(0)==g_genre_cache.genreList[i][0].charAt(0)) flags=MF_CHECKED;
					eval('genre'+currentLevel).AppendTo(genrePopupMenu, flags, g_genre_cache.genreList[i][0].replace("&","&&"));
				} catch (e){}
			}
			else {
				try {
					eval('genre'+currentLevel).AppendMenuItem(flags, i+1000, g_genre_cache.genreList[i][0].replace("&","&&"));
				} catch (e){}
			}
			flags=MF_STRING;
		}
	}
	if(firstFile){
		if(firstFileGenre!="") var currentGenre="Current genre: '"+firstFileGenre.replace("&","&&")+"'";

		genrePopupMenu.AppendMenuSeparator();
		genrePopupMenu.AppendMenuItem(MF_GRAYED, 0, currentGenre);
		if(showBelow && firstFileGenre!="") genrePopupMenu.AppendMenuItem(MF_GRAYED, 0, "从路径推断的流派相同");
	}
	return genrePopupMenu;
}
function showNowPlaying(force){
	var force = typeof force !== 'undefined' ? force : false;
	if(layout_state.isEqual(0) && (!main_panel_state.isEqual(1) || (getNowPlayingState()!=1 && !filters_panel_state.isMaximumValue()))){
		if(!force) window.NotifyOthers("FocusOnNowPlaying",fb.GetNowPlaying());
		else window.NotifyOthers("FocusOnNowPlayingForce",fb.GetNowPlaying());
		on_notify_data("FocusOnNowPlaying",fb.GetNowPlaying());
	} else {
		if(!force) window.NotifyOthers("FocusOnNowPlaying",fb.GetNowPlaying());
		else window.NotifyOthers("FocusOnNowPlayingForce",fb.GetNowPlaying());
	}
}
function rateAlbum(new_rating, old_rating, metadbs){
	let arr = [];
		arr.push({
			'rating_album' : new_rating,
		});
	g_avoid_metadb_updated = true;
	metadbs.UpdateFileInfoFromJSON(JSON.stringify(arr));
	window.NotifyOthers('rating_album_updated',metadbs);
	return new_rating;
}
function rateSong(new_rating, old_rating, metadb){
	var new_rating = Number(new_rating);
	var old_rating = Number(old_rating);
	if(!globalProperties.use_ratings_file_tags && foo_playcount) {
		// Rate to database statistics brought by foo_playcount.dll
		if (new_rating != old_rating) {
			if (metadb) {
				window.NotifyOthers('rating_updated',metadb);
				var bool = runContextCommand("Rating/" + ((new_rating == 0) ? "<not set>" : new_rating), metadb,8);
				if(bool) return new_rating;
				else return false;
			};
		} else {
			window.NotifyOthers('rating_updated',metadb);
			var bool = runContextCommand("Rating/<not set>", metadb,8);
			if(bool) return 0;
			else return false;
		};
	} else {
		// Rate to file
		if (new_rating != old_rating) {
			if (metadb) {
				window.NotifyOthers('rating_updated',metadb);
				var metadbList=new FbMetadbHandleList();
				metadbList.Add(metadb);

				var arr = [];
				arr.push({
					"rating" : new_rating,
				});

				metadbList.UpdateFileInfoFromJSON(JSON_stringify(arr));
				metadbList = undefined;
				return new_rating;
			};
		} else {
			window.NotifyOthers('rating_updated',metadb);

			var metadbList=new FbMetadbHandleList();
			metadbList.Add(metadb);

			var arr = [];
			arr.push({
				"rating" : "",
			});

			metadbList.UpdateFileInfoFromJSON(JSON_stringify(arr));
			metadbList = undefined;
			return 0;
		};
	};
}
function SetGenre(GenreNumber, plist_items, max_items, clean_file){
	var max_items = typeof max_items !== 'undefined' ? max_items : 9000;
	var clean_file = typeof clean_file !== 'undefined' ? clean_file : false;
    if(plist_items.Count>max_items) {
         var result = HtmlMsg("错误", "当前播放列表包含超过 "+max_items+" 个文件。请使用标准属性对话框。", "确定");
		 return false;
    } else {
		function update_confirmation(status, confirmed) {
			if(confirmed){
				var arr = [];
				for (var i = 0; i < plist_items.Count; i++) {
					arr.push({
						"genre" : [g_genre_cache.genreList[GenreNumber][0]] // we can use an array here for multiple value tags
					});
				}
				var str = JSON_stringify(arr);
				plist_items.UpdateFileInfoFromJSON(str);
			}
		}
        var QuestionString = "正在更新 "+plist_items.Count+" 个文件的流派为 '"+g_genre_cache.genreList[GenreNumber][0]+"' ?";
		HtmlDialog("请确认", QuestionString, '是', '否', update_confirmation);
    }
	return false;
}
// The items must be selected before calling this function
function removeItems(plist_items, plist_Idx, ask_for_confirmation){
	var ask_for_confirmation = typeof ask_for_confirmation !== 'undefined' ? ask_for_confirmation : true;
	if(!plist_items) {
		function delete_confirmation(status, confirmed) {
			if(confirmed){
				plman.ClearPlaylist(plist_Idx)
			}
		}
        var QuestionString = "删除所有文件（"+plman.PlaylistItemCount(plist_Idx)+"）来自播放列表（"+plman.GetPlaylistName(plist_Idx)+") ?";
		HtmlDialog("请确认", QuestionString, '是', '否', delete_confirmation);
    } else {
		if(ask_for_confirmation){
			function delete_confirmation(status, confirmed) {
				if(confirmed){
					plman.RemovePlaylistSelection(plist_Idx)
				}
			}
			var QuestionString = "删除 "+plist_items.Count+" 个文件来自播放列表（"+plman.GetPlaylistName(plist_Idx)+") ?";
			HtmlDialog("请确认", QuestionString, '是', '否', delete_confirmation);
		} else plman.RemovePlaylistSelection(plist_Idx)
    }
	return false;
}
String.prototype.sanitise = function() {
    return this.replace(/[\/\\|:]/g, "-").replace(/\*/g, "x").replace(/"/g, "''").replace(/[<>]/g, "_").replace(/\?/g, "").replace(/^\./, "_").replace(/\.+$/, "").replace(/^\s+|[\n\s]+$/g, "");
}
String.prototype.extract_year = function() {
	var year = this.match(/[0-9]{4}/);
	if(year) return year[0];
	return this;
}
function trim1(str) {
    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}

function apply_playlist(itemsList, play_results, order_list, undobackup){
	var undobackup = typeof undobackup !== 'undefined' ? undobackup : true;
	var pl_idx=-1;playlist_2remove=-1;
	for (i=0; i < plman.PlaylistCount; i++) {
		if(plman.GetPlaylistName(i)==globalProperties.selection_playlist){
			pl_idx=i;break;
		}
	}
	if(pl_idx<0){plman.CreatePlaylist(0, globalProperties.selection_playlist);pl_idx=0}
	else if(fb.IsPlaying && plman.PlayingPlaylist==pl_idx) {
		for (i=0; i < plman.PlaylistCount; i++) {
			if(plman.GetPlaylistName(i)==globalProperties.playing_playlist) {playlist_2remove = i;break;}
		}
		plman.RenamePlaylist(pl_idx,globalProperties.playing_playlist);
		if(playlist_2remove>-1) plman.RemovePlaylist(playlist_2remove);
		plman.CreatePlaylist(0, globalProperties.selection_playlist);pl_idx=0;
	}
	if(undobackup) plman.UndoBackup(pl_idx);
	plman.ActivePlaylist = pl_idx;
	plman.ClearPlaylist(pl_idx);
	if(order_list) itemsList.OrderByFormat(search_results_order, 1);
	plman.InsertPlaylistItems(pl_idx, 0, itemsList);
    if(play_results) plman.ExecutePlaylistDefaultAction(pl_idx,0);
}
function match(input, str){
    input = input.removeAccents().toLowerCase();
    for(var i in str){
        if(input.indexOf(str[i]) < 0)
            return false;
    }
    return true;
}

function process_string(str){
    var str_ = [];
    var str = str.removeAccents().toLowerCase();
    var str = str.split(" ").sort();
    for(var i in str){
        if(str[i] != "")
            str_.push(str[i]);
    }
    return str_;
}
function quickSearch(start,search_function){
	if(layout_state.isEqual(0) && (main_panel_state.isEqual(2) || main_panel_state.isEqual(3))){
		main_panel_state.setValue(0);
		on_notify_data("main_panel_state_force",main_panel_state.value);
	}
	switch(search_function) {
		case 'artist':
			var arr = globalProperties.tf_albumartist.EvalWithMetadb(start);
			try{
				artist_items = fb.GetQueryItems(fb.GetLibraryItems(), '"*$meta_sep(artist,*)*" HAS *'+trim1(arr)+'*');
				if(artist_items.Count>0){
					artist_items.OrderByFormat(globalProperties.tf_order, 1);
					apply_playlist(artist_items,false,false);
				} else {
					return false;
				}
				artist_items = undefined;
			} catch(e) {return false;}
			break;
		case 'album':
			var arr = globalProperties.tf_album.EvalWithMetadb(start);
			try{
				album_items = fb.GetQueryItems(fb.GetLibraryItems(), "%album% IS "+trim1(arr));
				if(album_items.Count>0){
					album_items.OrderByFormat(globalProperties.tf_order, 1);
					apply_playlist(album_items,false,false);
				} else {
					return false;
				}
				album_items = undefined;
			} catch(e) {return false;}
			break;
		case 'genre':
			var arr = globalProperties.tf_genre.EvalWithMetadb(start);
			try{
				genre_items = fb.GetQueryItems(fb.GetLibraryItems(), "%genre% IS "+trim1(arr));
				if(genre_items.Count>0){
					genre_items.OrderByFormat(globalProperties.tf_order, 1);
					apply_playlist(genre_items,false,false);
				} else {
					return false;
				}
				genre_items = undefined;
			} catch(e) {return false;}
			break;
		case 'date':
			var arr = globalProperties.tf_date.EvalWithMetadb(start);
			try{
				date_items = fb.GetQueryItems(fb.GetLibraryItems(), "%date% IS "+trim1(arr));
				if(date_items.Count>0){
					date_items.OrderByFormat(globalProperties.tf_order, 1);
					apply_playlist(date_items,false,false);
				} else {
					return false;
				}
				date_items = undefined;
			} catch(e) {return false;}
			break;
		case 'title':
			var arr = globalProperties.tf_title.EvalWithMetadb(start);
			try{
				title_items = fb.GetQueryItems(fb.GetLibraryItems(), "%title% IS "+trim1(arr));
				if(title_items.Count>0){
					title_items.OrderByFormat(globalProperties.tf_order, 1);
					apply_playlist(title_items,false,false);
				} else {
					return false;
				}
				title_items = undefined;
			} catch(e) {return false;}
			break;
	}
	return true;
}
function shuffleList(metadb_list) {
  var currentIndex = metadb_list.Count, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = metadb_list[currentIndex];
    metadb_list[currentIndex] = metadb_list[randomIndex];
    metadb_list[randomIndex] = temporaryValue;
  }
}
function pickRandom(metadb_list, nb_of_items){
	var list_count=metadb_list.Count;
	var tracks_list=new FbMetadbHandleList();
	var i=0;
	while(i < nb_of_items && i < list_count) {
		tracks_list.Add(metadb_list[Math.floor(Math.random()*list_count)]);
		i++;
	}
	return tracks_list;
}
function play_random(random_function, addAtTheEnd, current_played_track){
	var random_function = typeof random_function !== 'undefined' ? random_function : '200_tracks';
	var addAtTheEnd = typeof addAtTheEnd !== 'undefined' ? addAtTheEnd : false;
	var current_played_track = typeof current_played_track !== 'undefined' ? current_played_track : false;

	switch(random_function) {
		case '20_albums':
			var number_of_items = addAtTheEnd?1:25;
			break;
		case '1_genre':
		case 'same_genre':
			var number_of_items = addAtTheEnd?25:0;
			if(current_played_track)
				var current_genre = globalProperties.tf_genre.EvalWithMetadb(current_played_track);
			else random_function == '1_genre';
			break;
		case '1_artist':
		case 'same_artist':
			var number_of_items = addAtTheEnd?25:0;
			break;
		case '200_tracks':
			var number_of_items = addAtTheEnd?25:200;
			break;
		default:
			var genreValue=parseInt(random_function);
			if(genreValue >= 1000 && genreValue < 2001){
				var number_of_items = addAtTheEnd?25:0;
			} else {
				var number_of_items = addAtTheEnd?25:200;
			}
			break;
	}

	randomBtnTimer && clearTimeout(randomBtnTimer);
	var playlist_index = getPlaybackPlaylist();
	plman.UndoBackup(playlist_index);
	if(!addAtTheEnd) {
		plman.ClearPlaylist(playlist_index);
		var start_index = 0;
	} else {
		var start_index = plman.PlaylistItemCount(playlist_index);
	}
    plman.PlayingPlaylist=playlist_index;
	if(!g_genre_cache.initialized) g_genre_cache.build_from_library();
	
	var library_items = fb.GetLibraryItems();
	var library_items_number=library_items.Count;
	
	if(library_items_number==0) return;
	switch(random_function) {
		case '20_albums_old':
			var tfo = fb.TitleFormat("%album artist%|%date%|%album%|%discnumber%|%tracknumber%");
			var albums_list=new FbMetadbHandleList();
			var i=0;
			var query = "";
			while(i < number_of_items && i < library_items_number) {
				try {
					var random_item = library_items[Math.floor(Math.random()*library_items_number)];
					var arr = fb.TitleFormat("%album artist% ## %album%").EvalWithMetadb(random_item).split(" ## ");
					album_items = fb.GetQueryItems(library_items, "%album artist% IS "+arr[0]+" AND %album% IS "+arr[1]);
					album_items.OrderByFormat(tfo, 1);
					albums_list.AddRange(album_items);
					album_items = undefined;
				} catch(e) {}
				i++;
			}
			plman.InsertPlaylistItems(playlist_index, start_index, albums_list);
			plman.ExecutePlaylistDefaultAction(playlist_index,start_index);
			albums_list = undefined;
			library_items = undefined;
			break;
		case '20_albums':
			var tfo = fb.TitleFormat("%album artist%|%date%|%album%|%discnumber%|%tracknumber%");
			var albums_list=new FbMetadbHandleList();

			try {
				var random_item = library_items[Math.floor(Math.random()*library_items_number)];
				var arr = fb.TitleFormat("%album artist% ## %album%").EvalWithMetadb(random_item).split(" ## ");
				album_items = fb.GetQueryItems(library_items, "%album artist% IS "+arr[0]+" AND %album% IS "+arr[1]);
				album_items.OrderByFormat(tfo, 1);
			} catch(e) {}
			
			plman.InsertPlaylistItems(playlist_index, start_index, album_items);
			plman.ExecutePlaylistDefaultAction(playlist_index,start_index);
			album_items = undefined;
			library_items = undefined;
			break;		
		case '1_genre':
		case 'same_genre':
				if(random_function=="same_genre"){
					var genre_item_list = fb.GetQueryItems(library_items, "%genre% IS "+current_genre);
				} else
					var genre_item_list = fb.GetQueryItems(library_items, "%genre% IS "+g_genre_cache.genreList[Math.floor(Math.random()*g_genre_cache.genreList.length)][0]);
				if(number_of_items>0) genre_item_list = pickRandom(genre_item_list, number_of_items)
				else shuffleList(genre_item_list)
				plman.InsertPlaylistItems(playlist_index, start_index, genre_item_list);
				plman.ExecutePlaylistDefaultAction(playlist_index,start_index);
				genre_item_list = undefined;
			break;
		case '1_artist':
			var tfo = fb.TitleFormat("%album artist%|%date%|%album%|%discnumber%|%tracknumber%");
			try {
				var random_item = library_items[Math.floor(Math.random()*library_items_number)];
				var artist_name = fb.TitleFormat("%artist%").EvalWithMetadb(random_item);
				var artist_list = fb.GetQueryItems(library_items, "%artist% IS "+artist_name);
				if(number_of_items>0) artist_list = pickRandom(artist_list, number_of_items)
				else shuffleList(artist_list)
				plman.InsertPlaylistItems(playlist_index, start_index, artist_list);
				plman.ExecutePlaylistDefaultAction(playlist_index,start_index);
				artist_list = undefined;
			} catch(e) {}
			library_items = undefined;
			break;
		case '200_tracks':
			var tracks_list=new FbMetadbHandleList();
			var i=0;
			while(i < number_of_items && i < library_items_number) {
				tracks_list.Add(library_items[Math.floor(Math.random()*library_items_number)]);
				i++;
			}
			plman.InsertPlaylistItems(playlist_index, start_index, tracks_list);
			plman.ExecutePlaylistDefaultAction(playlist_index,start_index);
			tracks_list = undefined;
			library_items = undefined;
			break;
		default:
			var genreValue=parseInt(random_function);
			if(genreValue >= 1000 && genreValue < 2001){
				try {
					var genre_item_list = fb.GetQueryItems(library_items, "%genre% IS "+g_genre_cache.genreList[genreValue-1000][0]);
					if(number_of_items>0) genre_item_list = pickRandom(genre_item_list, number_of_items)
					else shuffleList(genre_item_list)
					plman.InsertPlaylistItems(playlist_index, start_index, genre_item_list);
					plman.ExecutePlaylistDefaultAction(playlist_index,start_index);
					genre_item_list = undefined;
				} catch(e) {}
			} else {
				var tracks_list=new FbMetadbHandleList();
				i=0;
				while(i < number_of_items && i < library_items_number) {
					tracks_list.Add(library_items[Math.floor(Math.random()*library_items_number)]);
					i++;
				}
				plman.InsertPlaylistItems(playlist_index, start_index, tracks_list);
				plman.ExecutePlaylistDefaultAction(playlist_index,start_index);
				tracks_list = undefined;
				library_items = undefined;
			}
			break;
	}
	fb.Stop();fb.Play();
    Randomsetfocus=true;
	window.NotifyOthers("Randomsetfocus", Randomsetfocus);
}

function arrayContains(array,name){
	for (var i = 0; i < array.length; i++) {
		if(array[i]==name) return true;
	}
	return false;
}
function delete_tags_except(track_metadb,except_array){
	var track_FileInfo = track_metadb.GetFileInfo();

	for (var i = 0; i <= track_FileInfo.MetaCount; i++) {
		if(!arrayContains(except_array , track_FileInfo.MetaName(i)))
			 track_metadb.UpdateFileInfoSimple(track_FileInfo.MetaName(i), "");
	}
}

// *****************************************************************************************************************************************
// Common functions & flags by Br3tt aka Falstaff (c)2013-2015
// *****************************************************************************************************************************************

//=================================================// General declarations

function GetKeyboardMask() {
    var c = utils.IsKeyPressed(VK_CONTROL) ? true : false;
    var a = utils.IsKeyPressed(VK_ALT) ? true : false;
    var s = utils.IsKeyPressed(VK_SHIFT) ? true : false;
    var ret = KMask.none;
    if (c && !a && !s) ret = KMask.ctrl;
    if (!c && !a && s) ret = KMask.shift;
    if (c && !a && s) ret = KMask.ctrlshift;
    if (c && a && !s) ret = KMask.ctrlalt;
    if (c && a && s) ret = KMask.ctrlaltshift;
    if (!c && a && !s) ret = KMask.alt;
    return ret;
};

// Used everywhere!
function TrackType(metadb) {
    var taggable;
    var type;
	var trackpath = metadb.RawPath.substring(0, 4);
    switch (trackpath) {
        case "file":
        taggable = 1;
        type = 0;
        break;
        case "cdda":
        taggable = 1;
        type = 1;
        break;
        case "FOO_":
        taggable = 0;
        type = 2;
        break;
        case "fy+h":		
        case "http":
        taggable = 0;
        type = 3;
        break;
        case "mms:":
        taggable = 0;
        type = 3;
        break;
        case "unpa":
        taggable = 0;
        type = 4;
        break;
        default:
        taggable = 0;
        type = 5;
    };
    return type;
};
//}}

//=================================================// Buttons objects
button = function (normal, hover, down, name, tooltip_text) {
    this.img = Array(normal, hover, down, down);
    this.w = this.img[0].Width;
    this.h = this.img[0].Height;
    this.state = ButtonStates.normal;
    this.hide = false;
	this.active = true;
	this.cursor = IDC_ARROW;
	this.name = name;
	this.tooltip_text = tooltip_text ? tooltip_text : '';
	this.tooltip_activated = false;
    this.update = function (normal, hover, down) {
        this.img = Array(normal, hover, down, down);
        this.w = this.img[0].Width;
        this.h = this.img[0].Height;
    };
    this.draw = function (gr, x, y, alpha) {
        this.x = x;
        this.y = y;
		if(this.state==ButtonStates.hide) return false;
        this.img[this.state] && gr.DrawImage(this.img[this.state], this.x, this.y, this.w, this.h, 0, 0, this.w, this.h, 0, alpha);
    };
    this.repaint = function () {
        window.RepaintRect(this.x, this.y, this.w, this.h);
    };
    this.changeState = function (state) {
        var old_state = this.state;
        this.state = state;
		if(this.state==ButtonStates.hover && this.cursor != IDC_HAND) {
			g_cursor.setCursor(IDC_HAND,this.text);
			this.cursor = IDC_HAND;
		} else if(this.cursor != IDC_ARROW && this.state!=ButtonStates.hover && this.state!=ButtonStates.down){
			g_cursor.setCursor(IDC_ARROW,26);
			this.cursor = IDC_ARROW;
		}
        return old_state;
    };
    this.checkstate = function (event, x, y) {
        this.ishover = (x > this.x && x < this.x + this.w - 1 && y > this.y && y < this.y + this.h - 1);
        this.old = this.state;
        switch (event) {
         case "down":
            switch(this.state) {
             case ButtonStates.normal:
                this.state = ButtonStates.normal;
                break;
             case ButtonStates.hover:
                this.state = this.ishover ? ButtonStates.down : ButtonStates.normal;
				this.isdown = true;
                break;
            };
			if(this.tooltip_activated){
				this.tooltip_activated = false;
				g_tooltip.Deactivate();
			}
            break;
         case "up":
            this.state = this.ishover ? ButtonStates.hover : ButtonStates.normal;
			this.isdown = false;
            break;
         case "right":
             break;
         case "move":
            switch(this.state) {
             case ButtonStates.normal:
             case ButtonStates.hover:
                this.state = this.ishover ? ButtonStates.hover : ButtonStates.normal;
                break;
            };

			if(this.state == ButtonStates.hover && this.tooltip_text!='' && g_tooltip.activeZone != this.name){
				g_tooltip.ActivateDelay(this.tooltip_text, x+10, y+20, globalProperties.tooltip_button_delay, 1200, false, this.name);
				this.tooltip_activated = true;
			} else if(this.tooltip_activated && this.state!=ButtonStates.hover && g_tooltip.activeZone == this.name){
				this.tooltip_activated = false;
				g_tooltip.Deactivate();
			}
            break;
         case "leave":
            this.state = this.isdown ? ButtonStates.down : ButtonStates.normal;
			if(this.tooltip_activated){
				this.tooltip_activated = false;
				g_tooltip.Deactivate();
			}
            break;
         case "hover":
            break;
        };
		if(this.state==ButtonStates.hover && !this.ishover) this.state = ButtonStates.normal;
        if(this.state!=this.old) this.repaint();

		if(g_cursor.getActiveZone()!=this.name && (this.state==ButtonStates.hover || this.state==ButtonStates.down)) {
			g_cursor.setCursor(IDC_HAND,this.name);
			this.cursor = IDC_HAND;
		} else if((this.old==ButtonStates.hover || this.old==ButtonStates.down) && this.state!=ButtonStates.hover && this.state!=ButtonStates.down && this.cursor!=IDC_ARROW && g_cursor.getActiveZone()==this.name) {
			g_cursor.setCursor(IDC_ARROW,4);
			this.cursor = IDC_ARROW;
		}
		if(event=="hover") return this.ishover;
        return this.state;
    };
};

function DrawPolyStar(gr, x, y, out_radius, in_radius, points, line_thickness, line_color, fill_color, angle, opacity){
    if(!opacity && opacity != 0) opacity = 255;
    if(!angle && angle != 0) angle = 0;

    //---> Create points
    var point_arr = [];
    for (var i = 0; i != points; i++) {
        i % 2 ? r = Math.round((out_radius-line_thickness*4)/2) / in_radius : r = Math.round((out_radius-line_thickness*4)/2);
        var x_point = Math.floor(r * Math.cos(Math.PI * i / points * 2 - Math.PI / 2));
        var y_point = Math.ceil(r * Math.sin(Math.PI * i / points * 2 - Math.PI / 2));
        point_arr.push(x_point + out_radius/2);
        point_arr.push(y_point + out_radius/2);
    };

    //---> Crate poligon image
    var img = gdi.CreateImage(out_radius, out_radius);
    var _gr = img.GetGraphics();
    _gr.SetSmoothingMode(2);
    _gr.FillPolygon(fill_color, 1, point_arr);
    if(line_thickness > 0)
    _gr.DrawPolygon(line_color, line_thickness, point_arr);
    img.ReleaseGraphics(_gr);

    //---> Draw image
    gr.DrawImage(img, x, y, out_radius, out_radius, 0, 0, out_radius, out_radius, angle, opacity);
};

function zoom(value, factor) {
    return Math.ceil(value * factor / 100);
};
Number.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (minutes < 10 && hours>0) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    if (hours   == 0) {hours   = "";}
	else hours+=':'
    return hours+minutes+':'+seconds;
}
String.prototype.toHHMMSS = function () {
	if(this=='ON AIR') return this;
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (minutes < 10 && hours>0) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    if (hours   == 0) {hours   = "";}
	else hours+=':'
    return hours+minutes+':'+seconds;
}
String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}
String.prototype.repeat = function(num) {
    if(num>=0 && num<=5) {
        var g = Math.round(num);
    } else {
        return "";
    };
    return new Array(g+1).join(this);
};
var defaultDiacriticsRemovalap = [
	{'base':'A', 'letters':'\u0041\u24B6\uFF21\u00C0\u00C1\u00C2\u1EA6\u1EA4\u1EAA\u1EA8\u00C3\u0100\u0102\u1EB0\u1EAE\u1EB4\u1EB2\u0226\u01E0\u00C4\u01DE\u1EA2\u00C5\u01FA\u01CD\u0200\u0202\u1EA0\u1EAC\u1EB6\u1E00\u0104\u023A\u2C6F'},
	{'base':'AA','letters':'\uA732'},
	{'base':'AE','letters':'\u00C6\u01FC\u01E2'},
	{'base':'AO','letters':'\uA734'},
	{'base':'AU','letters':'\uA736'},
	{'base':'AV','letters':'\uA738\uA73A'},
	{'base':'AY','letters':'\uA73C'},
	{'base':'B', 'letters':'\u0042\u24B7\uFF22\u1E02\u1E04\u1E06\u0243\u0182\u0181'},
	{'base':'C', 'letters':'\u0043\u24B8\uFF23\u0106\u0108\u010A\u010C\u00C7\u1E08\u0187\u023B\uA73E'},
	{'base':'D', 'letters':'\u0044\u24B9\uFF24\u1E0A\u010E\u1E0C\u1E10\u1E12\u1E0E\u0110\u018B\u018A\u0189\uA779'},
	{'base':'DZ','letters':'\u01F1\u01C4'},
	{'base':'Dz','letters':'\u01F2\u01C5'},
	{'base':'E', 'letters':'\u0045\u24BA\uFF25\u00C8\u00C9\u00CA\u1EC0\u1EBE\u1EC4\u1EC2\u1EBC\u0112\u1E14\u1E16\u0114\u0116\u00CB\u1EBA\u011A\u0204\u0206\u1EB8\u1EC6\u0228\u1E1C\u0118\u1E18\u1E1A\u0190\u018E'},
	{'base':'F', 'letters':'\u0046\u24BB\uFF26\u1E1E\u0191\uA77B'},
	{'base':'G', 'letters':'\u0047\u24BC\uFF27\u01F4\u011C\u1E20\u011E\u0120\u01E6\u0122\u01E4\u0193\uA7A0\uA77D\uA77E'},
	{'base':'H', 'letters':'\u0048\u24BD\uFF28\u0124\u1E22\u1E26\u021E\u1E24\u1E28\u1E2A\u0126\u2C67\u2C75\uA78D'},
	{'base':'I', 'letters':'\u0049\u24BE\uFF29\u00CC\u00CD\u00CE\u0128\u012A\u012C\u0130\u00CF\u1E2E\u1EC8\u01CF\u0208\u020A\u1ECA\u012E\u1E2C\u0197'},
	{'base':'J', 'letters':'\u004A\u24BF\uFF2A\u0134\u0248'},
	{'base':'K', 'letters':'\u004B\u24C0\uFF2B\u1E30\u01E8\u1E32\u0136\u1E34\u0198\u2C69\uA740\uA742\uA744\uA7A2'},
	{'base':'L', 'letters':'\u004C\u24C1\uFF2C\u013F\u0139\u013D\u1E36\u1E38\u013B\u1E3C\u1E3A\u0141\u023D\u2C62\u2C60\uA748\uA746\uA780'},
	{'base':'LJ','letters':'\u01C7'},
	{'base':'Lj','letters':'\u01C8'},
	{'base':'M', 'letters':'\u004D\u24C2\uFF2D\u1E3E\u1E40\u1E42\u2C6E\u019C'},
	{'base':'N', 'letters':'\u004E\u24C3\uFF2E\u01F8\u0143\u00D1\u1E44\u0147\u1E46\u0145\u1E4A\u1E48\u0220\u019D\uA790\uA7A4'},
	{'base':'NJ','letters':'\u01CA'},
	{'base':'Nj','letters':'\u01CB'},
	{'base':'O', 'letters':'\u004F\u24C4\uFF2F\u00D2\u00D3\u00D4\u1ED2\u1ED0\u1ED6\u1ED4\u00D5\u1E4C\u022C\u1E4E\u014C\u1E50\u1E52\u014E\u022E\u0230\u00D6\u022A\u1ECE\u0150\u01D1\u020C\u020E\u01A0\u1EDC\u1EDA\u1EE0\u1EDE\u1EE2\u1ECC\u1ED8\u01EA\u01EC\u00D8\u01FE\u0186\u019F\uA74A\uA74C'},
	{'base':'OI','letters':'\u01A2'},
	{'base':'OO','letters':'\uA74E'},
	{'base':'OU','letters':'\u0222'},
	{'base':'OE','letters':'\u008C\u0152'},
	{'base':'oe','letters':'\u009C\u0153'},
	{'base':'P', 'letters':'\u0050\u24C5\uFF30\u1E54\u1E56\u01A4\u2C63\uA750\uA752\uA754'},
	{'base':'Q', 'letters':'\u0051\u24C6\uFF31\uA756\uA758\u024A'},
	{'base':'R', 'letters':'\u0052\u24C7\uFF32\u0154\u1E58\u0158\u0210\u0212\u1E5A\u1E5C\u0156\u1E5E\u024C\u2C64\uA75A\uA7A6\uA782'},
	{'base':'S', 'letters':'\u0053\u24C8\uFF33\u1E9E\u015A\u1E64\u015C\u1E60\u0160\u1E66\u1E62\u1E68\u0218\u015E\u2C7E\uA7A8\uA784'},
	{'base':'T', 'letters':'\u0054\u24C9\uFF34\u1E6A\u0164\u1E6C\u021A\u0162\u1E70\u1E6E\u0166\u01AC\u01AE\u023E\uA786'},
	{'base':'TZ','letters':'\uA728'},
	{'base':'U', 'letters':'\u0055\u24CA\uFF35\u00D9\u00DA\u00DB\u0168\u1E78\u016A\u1E7A\u016C\u00DC\u01DB\u01D7\u01D5\u01D9\u1EE6\u016E\u0170\u01D3\u0214\u0216\u01AF\u1EEA\u1EE8\u1EEE\u1EEC\u1EF0\u1EE4\u1E72\u0172\u1E76\u1E74\u0244'},
	{'base':'V', 'letters':'\u0056\u24CB\uFF36\u1E7C\u1E7E\u01B2\uA75E\u0245'},
	{'base':'VY','letters':'\uA760'},
	{'base':'W', 'letters':'\u0057\u24CC\uFF37\u1E80\u1E82\u0174\u1E86\u1E84\u1E88\u2C72'},
	{'base':'X', 'letters':'\u0058\u24CD\uFF38\u1E8A\u1E8C'},
	{'base':'Y', 'letters':'\u0059\u24CE\uFF39\u1EF2\u00DD\u0176\u1EF8\u0232\u1E8E\u0178\u1EF6\u1EF4\u01B3\u024E\u1EFE'},
	{'base':'Z', 'letters':'\u005A\u24CF\uFF3A\u0179\u1E90\u017B\u017D\u1E92\u1E94\u01B5\u0224\u2C7F\u2C6B\uA762'},
	{'base':'a', 'letters':'\u0061\u24D0\uFF41\u1E9A\u00E0\u00E1\u00E2\u1EA7\u1EA5\u1EAB\u1EA9\u00E3\u0101\u0103\u1EB1\u1EAF\u1EB5\u1EB3\u0227\u01E1\u00E4\u01DF\u1EA3\u00E5\u01FB\u01CE\u0201\u0203\u1EA1\u1EAD\u1EB7\u1E01\u0105\u2C65\u0250'},
	{'base':'aa','letters':'\uA733'},
	{'base':'ae','letters':'\u00E6\u01FD\u01E3'},
	{'base':'ao','letters':'\uA735'},
	{'base':'au','letters':'\uA737'},
	{'base':'av','letters':'\uA739\uA73B'},
	{'base':'ay','letters':'\uA73D'},
	{'base':'b', 'letters':'\u0062\u24D1\uFF42\u1E03\u1E05\u1E07\u0180\u0183\u0253'},
	{'base':'c', 'letters':'\u0063\u24D2\uFF43\u0107\u0109\u010B\u010D\u00E7\u1E09\u0188\u023C\uA73F\u2184'},
	{'base':'d', 'letters':'\u0064\u24D3\uFF44\u1E0B\u010F\u1E0D\u1E11\u1E13\u1E0F\u0111\u018C\u0256\u0257\uA77A'},
	{'base':'dz','letters':'\u01F3\u01C6'},
	{'base':'e', 'letters':'\u0065\u24D4\uFF45\u00E8\u00E9\u00EA\u1EC1\u1EBF\u1EC5\u1EC3\u1EBD\u0113\u1E15\u1E17\u0115\u0117\u00EB\u1EBB\u011B\u0205\u0207\u1EB9\u1EC7\u0229\u1E1D\u0119\u1E19\u1E1B\u0247\u025B\u01DD'},
	{'base':'f', 'letters':'\u0066\u24D5\uFF46\u1E1F\u0192\uA77C'},
	{'base':'g', 'letters':'\u0067\u24D6\uFF47\u01F5\u011D\u1E21\u011F\u0121\u01E7\u0123\u01E5\u0260\uA7A1\u1D79\uA77F'},
	{'base':'h', 'letters':'\u0068\u24D7\uFF48\u0125\u1E23\u1E27\u021F\u1E25\u1E29\u1E2B\u1E96\u0127\u2C68\u2C76\u0265'},
	{'base':'hv','letters':'\u0195'},
	{'base':'i', 'letters':'\u0069\u24D8\uFF49\u00EC\u00ED\u00EE\u0129\u012B\u012D\u00EF\u1E2F\u1EC9\u01D0\u0209\u020B\u1ECB\u012F\u1E2D\u0268\u0131'},
	{'base':'j', 'letters':'\u006A\u24D9\uFF4A\u0135\u01F0\u0249'},
	{'base':'k', 'letters':'\u006B\u24DA\uFF4B\u1E31\u01E9\u1E33\u0137\u1E35\u0199\u2C6A\uA741\uA743\uA745\uA7A3'},
	{'base':'l', 'letters':'\u006C\u24DB\uFF4C\u0140\u013A\u013E\u1E37\u1E39\u013C\u1E3D\u1E3B\u017F\u0142\u019A\u026B\u2C61\uA749\uA781\uA747'},
	{'base':'lj','letters':'\u01C9'},
	{'base':'m', 'letters':'\u006D\u24DC\uFF4D\u1E3F\u1E41\u1E43\u0271\u026F'},
	{'base':'n', 'letters':'\u006E\u24DD\uFF4E\u01F9\u0144\u00F1\u1E45\u0148\u1E47\u0146\u1E4B\u1E49\u019E\u0272\u0149\uA791\uA7A5'},
	{'base':'nj','letters':'\u01CC'},
	{'base':'o', 'letters':'\u006F\u24DE\uFF4F\u00F2\u00F3\u00F4\u1ED3\u1ED1\u1ED7\u1ED5\u00F5\u1E4D\u022D\u1E4F\u014D\u1E51\u1E53\u014F\u022F\u0231\u00F6\u022B\u1ECF\u0151\u01D2\u020D\u020F\u01A1\u1EDD\u1EDB\u1EE1\u1EDF\u1EE3\u1ECD\u1ED9\u01EB\u01ED\u00F8\u01FF\u0254\uA74B\uA74D\u0275'},
	{'base':'oi','letters':'\u01A3'},
	{'base':'ou','letters':'\u0223'},
	{'base':'oo','letters':'\uA74F'},
	{'base':'p','letters':'\u0070\u24DF\uFF50\u1E55\u1E57\u01A5\u1D7D\uA751\uA753\uA755'},
	{'base':'q','letters':'\u0071\u24E0\uFF51\u024B\uA757\uA759'},
	{'base':'r','letters':'\u0072\u24E1\uFF52\u0155\u1E59\u0159\u0211\u0213\u1E5B\u1E5D\u0157\u1E5F\u024D\u027D\uA75B\uA7A7\uA783'},
	{'base':'s','letters':'\u0073\u24E2\uFF53\u00DF\u015B\u1E65\u015D\u1E61\u0161\u1E67\u1E63\u1E69\u0219\u015F\u023F\uA7A9\uA785\u1E9B'},
	{'base':'t','letters':'\u0074\u24E3\uFF54\u1E6B\u1E97\u0165\u1E6D\u021B\u0163\u1E71\u1E6F\u0167\u01AD\u0288\u2C66\uA787'},
	{'base':'tz','letters':'\uA729'},
	{'base':'u','letters': '\u0075\u24E4\uFF55\u00F9\u00FA\u00FB\u0169\u1E79\u016B\u1E7B\u016D\u00FC\u01DC\u01D8\u01D6\u01DA\u1EE7\u016F\u0171\u01D4\u0215\u0217\u01B0\u1EEB\u1EE9\u1EEF\u1EED\u1EF1\u1EE5\u1E73\u0173\u1E77\u1E75\u0289'},
	{'base':'v','letters':'\u0076\u24E5\uFF56\u1E7D\u1E7F\u028B\uA75F\u028C'},
	{'base':'vy','letters':'\uA761'},
	{'base':'w','letters':'\u0077\u24E6\uFF57\u1E81\u1E83\u0175\u1E87\u1E85\u1E98\u1E89\u2C73'},
	{'base':'x','letters':'\u0078\u24E7\uFF58\u1E8B\u1E8D'},
	{'base':'y','letters':'\u0079\u24E8\uFF59\u1EF3\u00FD\u0177\u1EF9\u0233\u1E8F\u00FF\u1EF7\u1E99\u1EF5\u01B4\u024F\u1EFF'},
	{'base':'z','letters':'\u007A\u24E9\uFF5A\u017A\u1E91\u017C\u017E\u1E93\u1E95\u01B6\u0225\u0240\u2C6C\uA763'}
];

var diacriticsMap = {};
for (var i=0; i < defaultDiacriticsRemovalap.length; i++){
	var letters = defaultDiacriticsRemovalap[i].letters;
	for (var j=0; j < letters.length ; j++){
		diacriticsMap[letters[j]] = defaultDiacriticsRemovalap[i].base;
	}
}
String.prototype.removeAccents = function() {
	return this.replace(/[^\u0000-\u007E]/g, function(a){
	   return diacriticsMap[a] || a;
	});
}

var g_instancetype = window.InstanceType;

var g_hires_display = false;
var g_hires_checked = false;
var g_hires_mode = 0;
function InitHiResDisplay() {
    var hires_dpi = 96;
    if (!g_hires_checked) {
        g_hires_checked = true;
        g_hires_mode = 0;
        try {
            g_hires_mode = parseInt(window.GetProperty("全局·高分屏适配模式", 0));
            window.SetProperty("全局·高分屏适配模式", (isNaN(g_hires_mode)?0:g_hires_mode));
        } catch(e) { g_hires_mode = 0; }
        if (isNaN(g_hires_mode)) g_hires_mode = 0;
        if (g_hires_mode == 1) {
            g_hires_display = true;
        } else if (g_hires_mode == 2) {
            g_hires_display = false;
        } else {
            try { hires_dpi = Number(window.DPI); } catch(e) { hires_dpi = 96; }
            if (!hires_dpi || isNaN(hires_dpi) || hires_dpi <= 0) hires_dpi = 96;
            g_hires_display = (hires_dpi >= 144);
        }
        g_hires_dpi = hires_dpi;
    }
    if (!g_hires_display) return;
    try {
        if (typeof compact_titlebar !== "undefined" && compact_titlebar && compact_titlebar.value != 2) {
            compact_titlebar.value = 2;
        }
    } catch(e) {}
    try {
        if (typeof mini_controlbar !== "undefined" && mini_controlbar && mini_controlbar.value != 0) {
            mini_controlbar.value = 0;
        }
    } catch(e) {}
}
var g_hires_dpi = 96;
InitHiResDisplay();

var g_font = {};
function get_font() {
    var font_error = false;
    var default_font = null;

	if (g_instancetype == 0) {
		default_font = window.GetFontCUI(FontTypeCUI.items);
		g_font_headers = window.GetFontCUI(FontTypeCUI.labels);
	} else if (g_instancetype == 1) {
		default_font = window.GetFontDUI(FontTypeDUI.playlists);
		g_font_headers = window.GetFontDUI(FontTypeDUI.tabs);
	};
    // tweaks to fix a problem with WSH Panel Mod on Font object Name property
    try {
		g_fname = "Microsoft YaHei UI";
		g_fname_light = "Microsoft YaHei UI Light";
		g_fname_light_italic = "Microsoft YaHei UI Light";
		g_fname_italic = "Microsoft YaHei UI";
		g_fname_semibold = "Microsoft YaHei UI Bold";
		g_fsize = default_font.Size;
		g_fstyle = 0;
		g_fstyle_light = 0;
		g_fstyle_bold = 1;
		g_fstyle_italic = 0;
    } catch(e) {
        console.log("SMP Panel Error: Unable to use the default font. Using Arial font instead. "+e);
        g_fname = "arial";
        g_fname_light = "arial";
        g_fname_light_italic = "arial";
        g_fname_italic = "arial";
        g_fname_semibold = "arial";
        g_fsize = 14;
        g_fstyle = 0;
        g_fstyle_light = 0;
        g_fstyle_bold = 0;
        g_fstyle_italic = 0;
        font_error = true;
    };
    // adjust font size if extra zoom activated
	globalProperties.fontAdjustement = Math.min(globalProperties.fontAdjustement_max,Math.max(globalProperties.fontAdjustement_min,globalProperties.fontAdjustement));
    g_fsize += globalProperties.fontAdjustement+properties.panelFontAdjustement;

	g_font.normal = gdi.Font(g_fname, g_fsize, g_fstyle);
	g_font.min1 = gdi.Font(g_fname, g_fsize-1, g_fstyle);
	g_font.min2 = gdi.Font(g_fname, g_fsize-2, g_fstyle);
	g_font.min3 = gdi.Font(g_fname, g_fsize-3, g_fstyle);
	g_font.min4 = gdi.Font(g_fname, g_fsize-4, g_fstyle);
	g_font.min5 = gdi.Font(g_fname, g_fsize-5, g_fstyle);
	g_font.plus1 = gdi.Font(g_fname, g_fsize+1, g_fstyle);
	g_font.plus2 = gdi.Font(g_fname, g_fsize+2, g_fstyle);
	g_font.plus3 = gdi.Font(g_fname, g_fsize+3, g_fstyle);
	g_font.plus4 = gdi.Font(g_fname, g_fsize+4, g_fstyle);
	g_font.plus5 = gdi.Font(g_fname, g_fsize+5, g_fstyle);
	g_font.plus6 = gdi.Font(g_fname, g_fsize+6, g_fstyle);
	g_font.plus7 = gdi.Font(g_fname, g_fsize+7, g_fstyle);
	g_font.plus8 = gdi.Font(g_fname, g_fsize+8, g_fstyle);
	g_font.plus9 = gdi.Font(g_fname, g_fsize+9, g_fstyle);
	g_font.plus10 = gdi.Font(g_fname, g_fsize+10, g_fstyle);

	g_font.bold = gdi.Font(g_fname_semibold, g_fsize, g_fstyle_bold);
	g_font.boldmin1 = gdi.Font(g_fname_semibold, g_fsize-1, g_fstyle_bold);
	g_font.boldmin2 = gdi.Font(g_fname_semibold, g_fsize-2, g_fstyle_bold);
	g_font.boldmin3 = gdi.Font(g_fname_semibold, g_fsize-3, g_fstyle_bold);
	g_font.boldmin4 = gdi.Font(g_fname_semibold, g_fsize-4, g_fstyle_bold);
	g_font.boldmin5 = gdi.Font(g_fname_semibold, g_fsize-5, g_fstyle_bold);
	g_font.boldplus1 = gdi.Font(g_fname_semibold, g_fsize+1, g_fstyle_bold);
	g_font.boldplus2 = gdi.Font(g_fname_semibold, g_fsize+2, g_fstyle_bold);
	g_font.boldplus3 = gdi.Font(g_fname_semibold, g_fsize+3, g_fstyle_bold);
	g_font.boldplus4 = gdi.Font(g_fname_semibold, g_fsize+4, g_fstyle_bold);
	g_font.boldplus5 = gdi.Font(g_fname_semibold, g_fsize+5, g_fstyle_bold);
	g_font.boldplus6 = gdi.Font(g_fname_semibold, g_fsize+6, g_fstyle_bold);
	g_font.boldplus7 = gdi.Font(g_fname_semibold, g_fsize+7, g_fstyle_bold);
	g_font.boldplus8 = gdi.Font(g_fname_semibold, g_fsize+8, g_fstyle_bold);

	g_font.italic = gdi.Font(g_fname_italic, g_fsize, g_fstyle_italic);
	g_font.italicmin1 = gdi.Font(g_fname_italic, g_fsize-1, g_fstyle_italic);
	g_font.italicmin2 = gdi.Font(g_fname_italic, g_fsize-2, g_fstyle_italic);
	g_font.italicmin3 = gdi.Font(g_fname_italic, g_fsize-3, g_fstyle_italic);
	g_font.italicmin4 = gdi.Font(g_fname_italic, g_fsize-4, g_fstyle_italic);
	g_font.italicmin5 = gdi.Font(g_fname_italic, g_fsize-5, g_fstyle_italic);
	g_font.italicplus1 = gdi.Font(g_fname_italic, g_fsize+1, g_fstyle_italic);
	g_font.italicplus2 = gdi.Font(g_fname_italic, g_fsize+2, g_fstyle_italic);
	g_font.italicplus3 = gdi.Font(g_fname_italic, g_fsize+3, g_fstyle_italic);
	g_font.italicplus4 = gdi.Font(g_fname_italic, g_fsize+4, g_fstyle_italic);
	g_font.italicplus5 = gdi.Font(g_fname, g_fsize+5, g_fstyle_italic);
	g_font.italicplus6 = gdi.Font(g_fname_italic, g_fsize+6, g_fstyle_italic);
	g_font.italicplus7 = gdi.Font(g_fname_italic, g_fsize+7, g_fstyle_italic);
	g_font.italicplus8 = gdi.Font(g_fname_italic, g_fsize+8, g_fstyle_italic);

	g_font.nowplaying_title = gdi.Font(g_fname_light_italic, g_fsize+14, g_fstyle_italic);
	g_font.nowplaying_subtitle = gdi.Font(g_fname_light_italic, g_fsize+14, g_fstyle_italic);

	if(properties.darklayout) {
		g_font_light = gdi.Font(g_fname_light, g_fsize, g_fstyle_light);
		g_font_lightmin1 = gdi.Font(g_fname_light, g_fsize-1, g_fstyle_light);
	} else {
		g_font_light = g_font.normal;
		g_font_lightmin1 = gdi.Font(g_fname, g_fsize-1, g_fstyle_light);		
    }
};

// ========================================= IMAGES =========================================
function FormatCover(image, w, h, rawBitmap, callID, keepratio, resize_qlty) {
	var keepratio = typeof keepratio !== 'undefined' ? keepratio : false;		
	var resize_qlty = typeof resize_qlty !== 'undefined' ? resize_qlty : globalProperties.ResizeQLY;		
	if(!image || w<=0 || h<=0) return image;
	if(rawBitmap) {
		return image.Resize(w, h, resize_qlty).CreateRawBitmap();
	} else if(!keepratio){
		return image.Resize(w, h, resize_qlty);
	} else {	
		if(image.Height>=image.Width) {
			var ratio = image.Width / image.Height;
			var pw = w * ratio;
			var ph = h;
		} else {
			var ratio = image.Height / image.Width;
			var pw = w;
			var ph = h * ratio;
		};		
		return image.Resize(pw, ph, resize_qlty);
	}
};
function isImage(variable){
	return (typeof variable == 'object' && variable!=null)
}
function isValidHandle(variable){
	try{
		return (typeof variable.RawPath=='string');
	} catch(e){
		return false;
	}
}
function process_cachekey(metadb, titleformat, str){
	var titleformat = typeof titleformat !== 'undefined' ? titleformat : globalProperties.tf_crc;
	try{
		var str = typeof str !== 'undefined' ? str : titleformat.EvalWithMetadb(metadb);
	} catch(e){var str = "";}

    var str_return = "";
    str = str.toLowerCase();
    var len = str.length;
    for(var i  = 0;i < len; i++){
        var charcode = str.charCodeAt(i);
        if(charcode > 96 && charcode < 123)
            str_return += str.charAt(i);
        else if(charcode > 47 && charcode < 58)
            str_return += str.charAt(i);
    };
    return str;
};
function check_cache(metadb, albumIndex, crc){
	var crc = typeof crc !== 'undefined' ? crc : brw.groups[albumIndex].cachekey;
	var filename = cover_img_cache+"\\"+crc+"."+globalProperties.ImageCacheExt;
	if(crc=="undefined") return false;
    if(g_files.FileExists(filename)) {
        return filename;
    };
    return false;
};
function delete_file_cache(metadb, albumIndex, crc, delete_at_startup){
	var crc = typeof crc !== 'undefined' ? crc : brw.groups[albumIndex].cachekey;
	var filename = cover_img_cache+"\\"+crc+"."+globalProperties.ImageCacheExt;
    if(g_files.FileExists(filename)) {
		try {
			g_files.DeleteFile(filename);
		} catch(e) {
			already_asked_to_delete = false;
			crc_array = properties.deleteSpecificImageCache.split("|");
			for(var i = 0; i < crc_array.length; i++) {
				if(crc==crc_array[i]) already_asked_to_delete = true;
			}
			if(!already_asked_to_delete){
				if(properties.deleteSpecificImageCache!="")	properties.deleteSpecificImageCache=properties.deleteSpecificImageCache+"|";
				properties.deleteSpecificImageCache = properties.deleteSpecificImageCache + crc;
				window.SetProperty("封面·待删除缓存的键(下次启动)", properties.deleteSpecificImageCache);
			}
			if(delete_at_startup && delete_at_startup==true)
				HtmlMsg("无法删除此文件", "无法删除该缓存封面。\n请关闭 foobar 后手动删除以下文件：\n\n"+cover_img_cache + "\\" + crc, "确定");
			else
				HtmlMsg("无法删除此文件", "该缓存封面当前无法从 foobar 刷新（文件被占用），foobar 会在下次启动时尝试刷新", "确定");
		};
        return true;
    };
    return false;
};

function delete_full_cache(){
	if(globalProperties.deleteDiskCache) {
		g_files.DeleteFolder(cover_img_cache,true);
		timer_create_folder = setTimeout(function(){
			if(!g_files.FolderExists(cover_img_cache))
			g_files.CreateFolder(cover_img_cache);
			clearTimeout(timer_create_folder);
			timer_create_folder = false;
		},150);
		globalProperties.deleteDiskCache=false;
		window.SetProperty("封面·下次启动时删除缓存", false);
	} else {
		function delete_confirmation(status, confirmed) {
			if(confirmed){
				window.SetProperty("封面·下次启动时删除缓存", true);
				fb.Exit();
			}
		}
		var QuestionString = "确定要完全重置图像缓存吗？\n确认后，图像缓存将在下次启动时重新建立。foobar 将退出，请手动重新启动。";
		HtmlDialog("请确认", QuestionString, '是', '否', delete_confirmation);
	}
}
function load_image_from_cache(filename){
	try{
        var tdi = gdi.LoadImageAsync(window.ID, filename);
        return tdi;
	} catch(e){
		return -1;
	}
};
function load_image_from_cache_direct(filename){
	try{
        var img = gdi.Image(filename);
        return img;
	} catch(e){
		return -1;
	}
};
function get_albumArt(metadb,cachekey){
	var cachekey = typeof cachekey !== 'undefined' ? cachekey : process_cachekey(metadb);
	try{var artwork_img = g_image_cache.cachelist[cachekey];}catch(e){}
	if ((typeof(artwork_img) == "undefined" || artwork_img == null) && globalProperties.enableDiskCache) {
		var cache_filename = check_cache(metadb, 0, cachekey);
		// load img from cache
		if(cache_filename) {
			artwork_img = load_image_from_cache_direct(cache_filename);
		} else {
			artwork_img = utils.GetAlbumArtV2(metadb, AlbumArtId.front);
			if(!isImage(artwork_img)) {
				artwork_img = get_fallbackCover(metadb);
			}
		}
	}
	return artwork_img;
}
function get_fallbackCover(metadb, tracktype){
	var tracktype = typeof tracktype !== 'undefined' ? tracktype : TrackType(metadb);
	if(tracktype < 2) {
		return globalProperties.nocover_img;
	} else {
		return globalProperties.stream_img;
	}
}
const get_albumArt_async = async(metadb, albumIndex, cachekey, need_stub, only_embed, no_load, addArgs) =>
{
	need_stub = true;
	only_embed = false;
	no_load = false;
    if (!metadb || g_image_cache.loadCounter>2 || window.TotalMemoryUsage>window.MemoryLimit*0.8) {
		if(g_image_cache.loadCounter>2 && !timers.loadCounterReset){
			timers.loadCounterReset = setTimeout(function() {
				if(g_image_cache.loadCounter!=0){
					g_image_cache.loadCounter = 0;
					window.Repaint();
				}
				clearTimeout(timers.loadCounterReset);
				timers.loadCounterReset = false;
			}, 3000);
		}
		freeCacheMemory();
        return;
    }
	g_image_cache.loadCounter++;			
	debugger_hint(window.TotalMemoryUsage+" - "+(window.MemoryLimit-window.TotalMemoryUsage-10000000));
    let result = await utils.GetAlbumArtAsyncV2(0, metadb, AlbumArtId.front, need_stub, only_embed, no_load);
	try {
		if(isImage(result.image)) {
			if(properties.disableCoverCache !== true) save_image_to_cache(result.image, albumIndex, cachekey, metadb);
			if (typeof g_cover == "object") {
				if(addArgs && addArgs.isplaying) g_cover.setArtwork(result.image,true,false,addArgs.isplaying,metadb,cachekey);
				else g_cover.setArtwork(result.image,true,false,false,metadb,cachekey);
				window.Repaint();
			}
		} else if (typeof brw == "object" && albumIndex>=0) {
			if(typeof brw.groups[albumIndex] == "undefined" || (brw.groups[albumIndex].cachekey!= cachekey && brw.groups[albumIndex].cachekey_album!= cachekey)){
				var img = get_fallbackCover(metadb,undefined);
				g_image_cache.addToCache(img,cachekey);
			} else {
				brw.groups[albumIndex].cover_img = get_fallbackCover(metadb,(brw.groups[albumIndex].tracktype<0?undefined:brw.groups[albumIndex].tracktype));
				brw.groups[albumIndex].is_fallback = true;
				if(properties.panelName=="WSHgraphicbrowser") brw.groups[albumIndex].cover_img_full = brw.groups[albumIndex].cover_img;
				brw.groups[albumIndex].load_requested = 2;
				brw.repaint();
			}
		} else if (typeof g_cover == "object") {
			img = get_fallbackCover(metadb,undefined);
			g_cover.setArtwork(img,true,false,addArgs.isplaying,metadb,cachekey);
			window.Repaint();
		}
	} catch(e){
	}
	g_image_cache.loadCounter--;
};

function save_image_to_cache(image, albumIndex, cachekey, metadb){
	cachekey = typeof cachekey !== 'undefined' ? cachekey : false;
	if(!cachekey && typeof(brw) !== "undefined") var crc = brw.groups[albumIndex].cachekey;
	else var crc = cachekey;
	var save2cache = true;
	if(cachekey == "undefined") {
		var save2cache = false;
		cachekey = metadb.RawPath;
	}
	var filename = cover_img_cache+"\\"+crc+"."+globalProperties.ImageCacheExt;
    if(freeCacheMemory()) return;
	try {
		if(image.Width>globalProperties.coverCacheWidthMax || image.Height>globalProperties.coverCacheWidthMax) {
			image = FormatCover(image, globalProperties.coverCacheWidthMax, globalProperties.coverCacheWidthMax, false, "save_image_to_cache", true, 3);
		}		
		if(!g_files.FileExists(filename) && save2cache){
			image.SaveAs(cover_img_cache+"\\"+crc+"."+globalProperties.ImageCacheExt, globalProperties.ImageCacheFileType);
		}
		if (typeof brw == "object" && albumIndex>=0) {
			brw.groups[albumIndex].cover_img = image;			
			brw.groups[albumIndex].load_requested = 2;
			brw.groups[albumIndex].mask_applied = false;
			brw.groups[albumIndex].cover_formated = false;
			g_image_cache.addToCache(image,cachekey);
			debugger_hint("addToCache "+albumIndex+" with"+image.Width)			
			brw.repaint();
		}
	} catch(e){}
	if (typeof brw == "object") brw.repaint();
}
function createDragText(line1, line2, cover_size){
	var drag_img = gdi.CreateImage(cover_size, cover_size);

    var gb = drag_img.GetGraphics();
	gb.SetTextRenderingHint(2);
	gb.SetSmoothingMode(1);
	var text1_width = gb.CalcTextWidth(line1, g_font.boldplus1);
	var text2_width = gb.CalcTextWidth(line2, g_font.italicmin1);
	var rectangle_width = Math.min(Math.max(text1_width,text2_width),cover_size-40);

	var sep_width = Math.min(text1_width,text2_width)+10;
	gb.FillSolidRect(Math.round((cover_size-rectangle_width-40)/2),cover_size-75,rectangle_width+40,30,colors.dragimage_bg);
	gb.FillSolidRect(Math.round((cover_size-rectangle_width-40)/2),cover_size-45,rectangle_width+40,30,colors.dragimage_bg);

	gb.FillGradRect(Math.round((cover_size-rectangle_width-40)/2)+Math.round((rectangle_width+40-sep_width)/2),cover_size-45,sep_width, 1, 0, colors.dragimage_gradline1, colors.dragimage_gradline2, 0.5);
	gb.DrawRect(Math.round((cover_size-rectangle_width-40)/2),cover_size-75,rectangle_width+39,59,1,colors.dragimage_border);

	gb.GdiDrawText(line1, g_font.boldplus1,  colors.dragimage_text, 10, cover_size-75, cover_size-20, 30, DT_CENTER | DT_CALCRECT | DT_VCENTER | DT_END_ELLIPSIS | DT_NOPREFIX);
	gb.GdiDrawText(line2, g_font.italicmin1,  colors.dragimage_text, 10, cover_size-45, cover_size-20, 30, DT_CENTER | DT_CALCRECT | DT_VCENTER | DT_END_ELLIPSIS | DT_NOPREFIX);
	drag_img.ReleaseGraphics(gb);

	return drag_img;
};
function createDragImg(img, cover_size, count){
	var drag_zone_size = 220;
	var drag_img = gdi.CreateImage(drag_zone_size, drag_zone_size);
	var left_padding = top_padding = Math.round((drag_zone_size - cover_size)/2);
	var top_padding = drag_zone_size - cover_size-15;
	var text_height = 25;
    var gb = drag_img.GetGraphics();
	gb.SetTextRenderingHint(2);
	gb.SetSmoothingMode(0);
	if(isImage(img)) gb.DrawImage(img, left_padding, top_padding, cover_size, cover_size, 0, 0, img.Width, img.Height);
    gb.FillSolidRect(left_padding, top_padding, cover_size, cover_size, colors.dragcover_overlay);
	gb.FillSolidRect(left_padding,top_padding+cover_size-text_height,cover_size,text_height,colors.dragimage_bg);
	gb.DrawRect(left_padding, top_padding, cover_size-1, cover_size-1, 1.0,colors.dragimage_border);
	gb.GdiDrawText(count+" tracks", g_font.italicmin1,  colors.dragimage_text, left_padding, top_padding+cover_size-text_height, cover_size, text_height, DT_CENTER | DT_CALCRECT | DT_VCENTER | DT_END_ELLIPSIS | DT_NOPREFIX);
	drag_img.ReleaseGraphics(gb);

	return drag_img;
};
function freeCacheMemory(force){
	force = typeof force !== 'undefined' ? force : false;	
	if(window.TotalMemoryUsage>window.MemoryLimit*0.8 || force) {
		g_image_cache.resetCache();
		if(typeof brw !== 'undefined') brw.freeMemory();
		window.NotifyOthers("resetCache",true);
		return true;
	}
	return false;
}
oImageCache = function () {
    this.cachelist = Array();
	this.loadCounter = 0;
	this.coverCacheWidthMax = -1;
    this.addToCache = function (image, cachekey, resize_width, resize_height) {
		if(!globalProperties.loaded_covers2memory || freeCacheMemory()) return;
		var resize_height = typeof resize_height !== 'undefined' ? resize_height : resize_width;
		if(cachekey!="undefined") {
			if(this.coverCacheWidthMax>0) this.cachelist[cachekey] = FormatCover(image, this.coverCacheWidthMax, this.coverCacheWidthMax, false, "addToCache", globalProperties.keepProportion);
			else this.cachelist[cachekey] = image;
		}
	}
	this.setMaxWidth = function(maxWidth){		
		this.coverCacheWidthMax = maxWidth;
	}
    this.resetCache = function () {
		debugger_hint("-------------- image cache reset --------------");
		debugger_hint(window.TotalMemoryUsage+" > TotalMemoryUsage");
		debugger_hint(window.MemoryLimit+" > MemoryLimit");
		debugger_hint(window.MemoryLimit-window.TotalMemoryUsage+" > MemoryLimit-TotalMemoryUsage");
		this.cachelist = Array();
	}
	this.load_image_from_cache_async = async(albumIndex, cachekey, filename, save, metadb) =>
	{
		var save = typeof save !== 'undefined' ? save : false;		
		if(brw.groups[albumIndex].load_requested == 0){
			try {
				if(properties.load_image_from_cache_direct) {
					img = await gdi.LoadImageAsyncV2(window.ID, filename);
					this.addToCache(img,cachekey);
					brw.groups[albumIndex].load_requested = 2;
					brw.groups[albumIndex].cover_type = 1;
					brw.groups[albumIndex].cover_img = img;
					brw.groups[albumIndex].cover_img_mask = false;
					brw.groups[albumIndex].cover_formated = false;
					brw.repaint();
					if(save){
						save_image_to_cache(img, albumIndex, cachekey, metadb);
					}
				} else {
					brw.groups[albumIndex].tid = load_image_from_cache(filename);
					brw.groups[albumIndex].load_requested = 1;
				}
			} catch(e) {
				console.log("timers.coverLoad line 5133 failed")
			};
			brw.repaint();
		}
	};
    this.hit = function (metadb, albumIndex, direct_return, cachekey, artist_name) {
		var cachekey = typeof cachekey !== 'undefined' ? cachekey : brw.groups[albumIndex].cachekey;
		var artist_name = typeof artist_name !== 'undefined' ? artist_name : '';
		var img = this.cachelist[cachekey];
        if (typeof img == "undefined" || img==null) { // if image not in cache, we load it asynchronously
			if(globalProperties.enableDiskCache && albumIndex>-1) brw.groups[albumIndex].cover_filename = check_cache(metadb, albumIndex, cachekey);
			if(brw.groups[albumIndex].cover_filename && brw.groups[albumIndex].load_requested == 0) {
					//Dont save as its already in the cache
					brw.groups[albumIndex].save_requested=true;
					// load img from cache
					if(!isScrolling){
						img = load_image_from_cache_direct(brw.groups[albumIndex].cover_filename);
						this.addToCache(img,cachekey);
						brw.groups[albumIndex].cover_type = 1;
						brw.groups[albumIndex].cover_img = img;
						brw.groups[albumIndex].cover_img_mask = false;
						brw.groups[albumIndex].cover_formated = false;
						brw.groups[albumIndex].load_requested = 2;
						brw.repaint();
					} else if(!direct_return){
						this.load_image_from_cache_async(albumIndex, cachekey, brw.groups[albumIndex].cover_filename);
						return "loading";
					} else {
						img = load_image_from_cache_direct(brw.groups[albumIndex].cover_filename)
						if(img) {
							this.addToCache(img,cachekey);
						} else this.addToCache(globalProperties.nocover_img,cachekey);
						brw.groups[albumIndex].load_requested = 2;
					}
			} else {
				if(artist_name!=''){
					var artist_name = artist_name.sanitise();
					var path = ProfilePath+"\yttm\\biography-cache\\art_img\\"+artist_name.toLowerCase().charAt(0)+"\\"+artist_name;
					var filepath = '';
					var all_files = utils.Glob(path + "\\*");
					for (var j = 0; j < all_files.length; j++) {
						if ((/(?:jpe?g|gif|png|bmp)$/i).test(g_files.GetExtensionName(all_files[j]))) {
							filepath = all_files[j];
							break;
						}
					}
					if(g_files.FileExists(filepath)) {
						debugger_hint("load_artist");
						this.load_image_from_cache_async(albumIndex, cachekey, filepath, true, metadb);
						return "loading";						
					} else if(properties.AlbumArtFallback){
						debugger_hint("load_fallback");					
						brw.groups[albumIndex].cover_img = g_image_cache.hit(metadb, albumIndex, false, brw.groups[albumIndex].cachekey_album);
						if(brw.groups[albumIndex].cover_img=='loading') {
							brw.groups[albumIndex].load_requested = 2;
							brw.groups[albumIndex].cover_type = 1;						
							brw.groups[albumIndex].cover_img_mask = false;
							brw.groups[albumIndex].cover_formated = false;
							return 'loading';
						}
					}
				} else if(!direct_return){
					debugger_hint("get_albumArt_async"+albumIndex);						
					try{
						get_albumArt_async(metadb,(albumIndex<0)?-1:albumIndex, cachekey);
						return 'loading';
					} catch(e){console.log("timers.coverLoad line 5151 failed")}
				} else {
					img = utils.GetAlbumArtV2(metadb, 0, false);
					if(img) {
						if(!timers.saveCover && globalProperties.enableDiskCache) {
							save_image_to_cache(img, 0,cachekey, metadb);
							timers.saveCover = setTimeout(function() {
								clearTimeout(timers.saveCover);
								timers.saveCover = false;
							}, 100);
						};
					} else this.addToCache(globalProperties.nocover_img,cachekey); //this.cachelist[cachekey] = globalProperties.nocover_img
				}
			}
        };
        return img;
    };
    this.reset = function(key) {
        this.cachelist[key] = null;
    };
    this.resetMetadb = function(metadb) {
        this.cachelist[process_cachekey(metadb)] = null;
    };
	this.resetAll = function(){
		this.cachelist = Array();
	};
    this.getit = function (metadb, albumId, image, cw) {
		var cw = typeof cw !== 'undefined' ? cw : globalProperties.thumbnailWidthMax;
        var ch = cw;
        var img = null;
        var cover_type = null;

        if(!isImage(image)) {
            if(brw.groups[albumId].tracktype != 3) {
                cover_type = 0;
            } else {
                cover_type = 3;
            };
        } else {
            if(cover.keepaspectratio) {
                if(image.Height>=image.Width) {
                    var ratio = image.Width / image.Height;
                    var pw = cw * ratio;
                    var ph = ch;
                } else {
                    var ratio = image.Height / image.Width;
                    var pw = cw;
                    var ph = ch * ratio;
                };
            } else {
                var pw = cw;
                var ph = ch;
            };
            // cover.type : 0 = nocover, 1 = external cover, 2 = embedded cover, 3 = stream
            if(brw.groups[albumId].tracktype != 3) {
                if(metadb) {
                    img = FormatCover(image, pw, ph, false);
                    cover_type = 1;
                };
            } else {
                cover_type = 3;
            };

        };

        brw.groups[albumId].cover_type = cover_type;
        return img;
    };
};

function Utf8Encode(string) {
    string = string.replace(/\r\n/g,"\n");
    var utftext = "";
    for (var n = 0; n < string.length; n++) {
        var c = string.charCodeAt(n);
        if (c < 128) {
            utftext += String.fromCharCode(c);
        } else if((c > 127) && (c < 2048)) {
            utftext += String.fromCharCode((c >> 6) | 192);
            utftext += String.fromCharCode((c & 63) | 128);
        } else {
            utftext += String.fromCharCode((c >> 12) | 224);
            utftext += String.fromCharCode(((c >> 6) & 63) | 128);
            utftext += String.fromCharCode((c & 63) | 128);
        };
    };
    return utftext;
};

function crc32(str) {
//  discuss at: http://phpjs.org/functions/crc32/
// original by: Webtoolkit.info (http://www.webtoolkit.info/)
// improved by: T0bsn
//  depends on: utf8_encode
//   returns 1: 1249991249

  str = Utf8Encode(str);
  var table =
    '00000000 77073096 EE0E612C 990951BA 076DC419 706AF48F E963A535 9E6495A3 0EDB8832 79DCB8A4 E0D5E91E 97D2D988 09B64C2B 7EB17CBD E7B82D07 90BF1D91 1DB71064 6AB020F2 F3B97148 84BE41DE 1ADAD47D 6DDDE4EB F4D4B551 83D385C7 136C9856 646BA8C0 FD62F97A 8A65C9EC 14015C4F 63066CD9 FA0F3D63 8D080DF5 3B6E20C8 4C69105E D56041E4 A2677172 3C03E4D1 4B04D447 D20D85FD A50AB56B 35B5A8FA 42B2986C DBBBC9D6 ACBCF940 32D86CE3 45DF5C75 DCD60DCF ABD13D59 26D930AC 51DE003A C8D75180 BFD06116 21B4F4B5 56B3C423 CFBA9599 B8BDA50F 2802B89E 5F058808 C60CD9B2 B10BE924 2F6F7C87 58684C11 C1611DAB B6662D3D 76DC4190 01DB7106 98D220BC EFD5102A 71B18589 06B6B51F 9FBFE4A5 E8B8D433 7807C9A2 0F00F934 9609A88E E10E9818 7F6A0DBB 086D3D2D 91646C97 E6635C01 6B6B51F4 1C6C6162 856530D8 F262004E 6C0695ED 1B01A57B 8208F4C1 F50FC457 65B0D9C6 12B7E950 8BBEB8EA FCB9887C 62DD1DDF 15DA2D49 8CD37CF3 FBD44C65 4DB26158 3AB551CE A3BC0074 D4BB30E2 4ADFA541 3DD895D7 A4D1C46D D3D6F4FB 4369E96A 346ED9FC AD678846 DA60B8D0 44042D73 33031DE5 AA0A4C5F DD0D7CC9 5005713C 270241AA BE0B1010 C90C2086 5768B525 206F85B3 B966D409 CE61E49F 5EDEF90E 29D9C998 B0D09822 C7D7A8B4 59B33D17 2EB40D81 B7BD5C3B C0BA6CAD EDB88320 9ABFB3B6 03B6E20C 74B1D29A EAD54739 9DD277AF 04DB2615 73DC1683 E3630B12 94643B84 0D6D6A3E 7A6A5AA8 E40ECF0B 9309FF9D 0A00AE27 7D079EB1 F00F9344 8708A3D2 1E01F268 6906C2FE F762575D 806567CB 196C3671 6E6B06E7 FED41B76 89D32BE0 10DA7A5A 67DD4ACC F9B9DF6F 8EBEEFF9 17B7BE43 60B08ED5 D6D6A3E8 A1D1937E 38D8C2C4 4FDFF252 D1BB67F1 A6BC5767 3FB506DD 48B2364B D80D2BDA AF0A1B4C 36034AF6 41047A60 DF60EFC3 A867DF55 316E8EEF 4669BE79 CB61B38C BC66831A 256FD2A0 5268E236 CC0C7795 BB0B4703 220216B9 5505262F C5BA3BBE B2BD0B28 2BB45A92 5CB36A04 C2D7FFA7 B5D0CF31 2CD99E8B 5BDEAE1D 9B64C2B0 EC63F226 756AA39C 026D930A 9C0906A9 EB0E363F 72076785 05005713 95BF4A82 E2B87A14 7BB12BAE 0CB61B38 92D28E9B E5D5BE0D 7CDCEFB7 0BDBDF21 86D3D2D4 F1D4E242 68DDB3F8 1FDA836E 81BE16CD F6B9265B 6FB077E1 18B74777 88085AE6 FF0F6A70 66063BCA 11010B5C 8F659EFF F862AE69 616BFFD3 166CCF45 A00AE278 D70DD2EE 4E048354 3903B3C2 A7672661 D06016F7 4969474D 3E6E77DB AED16A4A D9D65ADC 40DF0B66 37D83BF0 A9BCAE53 DEBB9EC5 47B2CF7F 30B5FFE9 BDBDF21C CABAC28A 53B39330 24B4A3A6 BAD03605 CDD70693 54DE5729 23D967BF B3667A2E C4614AB8 5D681B02 2A6F2B94 B40BBE37 C30C8EA1 5A05DF1B 2D02EF8D';

  var crc = 0;
  var x = 0;
  var y = 0;

  crc = crc ^ (-1);
  for (var i = 0, iTop = str.length; i < iTop; i++) {
    y = (crc ^ str.charCodeAt(i)) & 0xFF;
    x = '0x' + table.substr(y * 9, 8);
    crc = (crc >>> 8) ^ x;
  };

  return crc ^ (-1);
};

function draw_blurred_image(image,ix,iy,iw,ih,bx,by,bw,bh,blur_value,overlay_color,quality) {
	quality = typeof quality !== 'undefined' ? quality : 1;

	image.StackBlur(130);
	return image;

    var imgA = image.Resize(Math.max(5,iw*blur_value/100),Math.max(5,ih*blur_value/100),quality);
    var imgB = imgA.Resize(iw, ih, quality);

    var bbox = gdi.CreateImage(bw, bh);
    var gb = bbox.GetGraphics();
    var offset = 190-blur_value;
    gb.DrawImage(imgB, 0-offset, 0-(ih-bh)-offset, iw+offset*2, ih+offset*2, 0, 0, imgB.Width, imgB.Height, 0, 255);

    if(overlay_color!=null) {
        gb.FillSolidRect(bx,by,bw,bh,overlay_color);
    };
    bbox.ReleaseGraphics(gb);

    return bbox;
};
function setWallpaperImgV2(image, metadb, progressbar_art, width, height, blur_value, rawBitmap, quality) {
    return null;
	progressbar_art = typeof progressbar_art !== 'undefined' ? progressbar_art : false;
	rawBitmap = typeof rawBitmap !== 'undefined' ? rawBitmap : false;
	quality = typeof quality !== 'undefined' ? quality : 1;
	width = typeof width !== 'undefined' ? width : ww;
	height = typeof height !== 'undefined' ? height : wh;
	blur_value = typeof blur_value !== 'undefined' ? blur_value : properties.wallpaperblurvalue;
    if(isImage(image)) {
		var tmp_img = image;
    } else if(metadb && (properties.wallpapermode == 0 || progressbar_art)) {
		cachekey = process_cachekey(metadb);
		var tmp_img = get_albumArt(metadb, cachekey);
    }

    if(!tmp_img) {
        tmp_img = gdi.Image(globalProperties.default_wallpaper);
    }

    if(!progressbar_art) {
		if(metadb!==null) g_wallpaperImg = null;
		var display = properties.wallpaperdisplay;
	} else {
		var display = 2;
	}
    var img = FormatWallpaper(tmp_img, width, height, 2, display, 0, "", rawBitmap, progressbar_art, blur_value, quality);
    return img;
};
function setWallpaperImg(defaultpath, metadb, progressbar_art, width, height, blur_value, rawBitmap, quality) {
    return null;
	progressbar_art = typeof progressbar_art !== 'undefined' ? progressbar_art : false;
	rawBitmap = typeof rawBitmap !== 'undefined' ? rawBitmap : false;
	quality = typeof quality !== 'undefined' ? quality : 1;
	width = typeof width !== 'undefined' ? width : ww;
	height = typeof height !== 'undefined' ? height : wh;
	blur_value = typeof blur_value !== 'undefined' ? blur_value : properties.wallpaperblurvalue;

    if(metadb && (properties.wallpapermode == 0 || progressbar_art)) {
		cachekey = process_cachekey(metadb);
		var tmp_img = get_albumArt(metadb, cachekey);
    };

    if(!tmp_img) {
        if(defaultpath) {
            tmp_img = gdi.Image(defaultpath);
        } else {
            tmp_img = null;
        };
    };

    if(!progressbar_art) {
		if(metadb!==null) g_wallpaperImg = null;
		var display = properties.wallpaperdisplay;
	} else {
		var display = 2;
	}
    var img = FormatWallpaper(tmp_img, width, height, 2, display, 0, "", rawBitmap, progressbar_art, blur_value, quality);
    return img;
};
function FormatWallpaper(image, iw, ih, interpolation_mode, display_mode, angle, txt, rawBitmap, force_blur, blur_value,quality) {
	force_blur = typeof force_blur !== 'undefined' ? force_blur : false;
	blur_value = typeof blur_value !== 'undefined' ? blur_value : properties.wallpaperblurvalue;
	quality = typeof quality !== 'undefined' ? quality : 1;
	if(!image||!iw||!ih) return image;
    var i, j;

    var panel_ratio = iw / ih;
	var wpp_img_info = {orient: 0, cut: 0, cut_offset: 0, ratio: 0, x: 0, y: 0, w: 0, h: 0};
    wpp_img_info.ratio = image.Width / image.Height;
    wpp_img_info.orient = 0;

    if(wpp_img_info.ratio > panel_ratio) {
        wpp_img_info.orient = 1;
        // 1/3 : default image is in landscape mode
        switch(display_mode) {
            case 0:     // Filling
                wpp_img_info.w = ih * wpp_img_info.ratio;
                wpp_img_info.h = ih;
                wpp_img_info.cut = wpp_img_info.w - iw;
                wpp_img_info.x = 0 - (wpp_img_info.cut / 2);
                wpp_img_info.y = 0;
                break;
            case 1:     // Adjust
                wpp_img_info.w = iw;
                wpp_img_info.h = ih / wpp_img_info.ratio * panel_ratio;
                wpp_img_info.cut = ih - wpp_img_info.h;
                wpp_img_info.x = 0;
                wpp_img_info.y = wpp_img_info.cut / 2;
                break;
            case 2:     // Stretch
                wpp_img_info.w = iw;
                wpp_img_info.h = ih;
                wpp_img_info.cut = 0;
                wpp_img_info.x = 0;
                wpp_img_info.y = 0;
                break;
        };
    } else if(wpp_img_info.ratio < panel_ratio) {
        wpp_img_info.orient = 2;
        // 2/3 : default image is in portrait mode
        switch(display_mode) {
            case 0:     // Filling
                wpp_img_info.w = iw;
                wpp_img_info.h = iw / wpp_img_info.ratio;
                wpp_img_info.cut = wpp_img_info.h - ih;
                wpp_img_info.x = 0;
                wpp_img_info.y = 0 - (wpp_img_info.cut / 4);
                break;
            case 1:     // Adjust
                wpp_img_info.h = ih;
                wpp_img_info.w = iw * wpp_img_info.ratio / panel_ratio;
                wpp_img_info.cut = iw - wpp_img_info.w;
                wpp_img_info.y = 0;
                wpp_img_info.x = wpp_img_info.cut / 2;
                break;
            case 2:     // Stretch
                wpp_img_info.w = iw;
                wpp_img_info.h = ih;
                wpp_img_info.cut = 0;
                wpp_img_info.x = 0;
                wpp_img_info.y = 0;
                break;
        };
    } else {
        // 3/3 : default image is a square picture, ratio = 1
        wpp_img_info.w = iw;
        wpp_img_info.h = ih;
        wpp_img_info.cut = 0;
        wpp_img_info.x = 0;
        wpp_img_info.y = 0;
    };

    var tmp_img = gdi.CreateImage(iw, ih);
    var gp = tmp_img.GetGraphics();
	gp.SetInterpolationMode(interpolation_mode);
    gp.DrawImage(image, wpp_img_info.x, wpp_img_info.y, wpp_img_info.w, wpp_img_info.h, 0, 0, image.Width, image.Height, angle, 255);
	tmp_img.ReleaseGraphics(gp);

    // blur it!
    if(properties.wallpaperblurred || force_blur) {
        var blur_factor = blur_value; // [1-90]
        tmp_img = draw_blurred_image(tmp_img,0,0,tmp_img.Width,tmp_img.Height,0,0,tmp_img.Width,tmp_img.Height,blur_factor,null,quality);
    };

    if(rawBitmap) {
        return tmp_img.CreateRawBitmap();
    } else {
        return tmp_img;
    };
};
function openCoverFullscreen(metadb, displayedImage){
	var img = null;
	if(isValidHandle(metadb)) {
		try { img = utils.GetAlbumArtV2(metadb, 0, false); } catch(e) {}
	}
	// The panel may show cached/downloaded art that is absent from the track.
	if(!isImage(img)) img = displayedImage;
	if(!isImage(img) || typeof img.SaveAs !== 'function') return false;
	try {
		if(!g_files.FolderExists(cover_img_cache)) g_files.CreateFolder(cover_img_cache);
		var filepath = cover_img_cache+"\\original_size."+globalProperties.ImageCacheExt;
		if(!img.SaveAs(filepath, globalProperties.ImageCacheFileType)) return false;
		var WshShell = new ActiveXObject("WScript.Shell");
		WshShell.Run("\"" + filepath + "\"");
		return true;
	} catch(e) {
		console.log("Eole: could not open cover image: " + e);
		return false;
	}
}
// Debugger functions
function debugger_hint(string){
}
var FW_PROP_ENABLED = "显示·全屏壁纸";
var FW_PROP_SOURCE  = "显示·全屏壁纸来源(0=封面 1=指定图片 2=优先图片)";
var FW_PROP_IMAGE   = "显示·全屏壁纸图片路径";
var FW_PROP_BLUR    = "显示·全屏壁纸模糊强度(0-90)";
var FW_PROP_BLUR_LT = "显示·全屏壁纸模糊强度·浅色(0-90)";
var FW_PROP_MASK    = "显示·全屏壁纸蒙版浓度(0-255)";
var FW_PROP_MASK_LT = "显示·全屏壁纸蒙版浓度·浅色(0-255)";
var FW_PROP_QUALITY = "显示·全屏壁纸质量(1=已缩放 2=1.5x 3=2x)";
var FW_PROP_LXB     = "Lxbox·全屏透明";

/* 全屏壁纸的深 / 浅：第一个是显式覆盖（-1 跟随 / 0 浅 / 1 深），
   第二项是写入覆盖那一刻 fb2k 背景的深浅，用来判断"之后用户在 fb2k 里是不是
   换过界面主题"——一旦对不上，覆盖自动作废，壁纸回到跟随 fb2k 的老行为。 */
var FW_PROP_DARK     = "显示·全屏壁纸深色(-1=跟随 0=浅 1=深)";
var FW_PROP_DARK_REF = "显示·全屏壁纸深色·fb2k基准";

var g_fw_lastHasRealImg = null;
var g_fw_lastSrcCover = false;

var FW_ID_ON          = 7100;
var FW_ID_OFF         = 7101;
var FW_ID_SRC0        = 7102;
var FW_ID_SRC1        = 7103;
var FW_ID_SRC2        = 7104;
var FW_ID_PICK        = 7105;
var FW_ID_CLEAR       = 7106;
var FW_ID_BLUR_INC    = 7110;
var FW_ID_BLUR_DEC    = 7111;
var FW_ID_BLUR_0      = 7112;
var FW_ID_BLUR_30     = 7113;
var FW_ID_BLUR_60     = 7114;
var FW_ID_BLUR_90     = 7115;
var FW_ID_MASK_INC    = 7120;
var FW_ID_MASK_DEC    = 7121;
var FW_ID_MASK_0      = 7122;
var FW_ID_MASK_120    = 7123;
var FW_ID_MASK_180    = 7124;
var FW_ID_MASK_230    = 7125;
var FW_ID_Q1          = 7130;
var FW_ID_Q2          = 7131;
var FW_ID_Q3          = 7132;
var FW_ID_REFRESH     = 7133;

var g_fwDarkV = null, g_fwDarkAt = 0;

function fw_isDark(force) {
    var now = (new Date()).getTime();
    if (!force && g_fwDarkV !== null && (now - g_fwDarkAt) < 250) return g_fwDarkV;
    var v = false;
    try { v = fw_themeDark(); } catch (e) { v = false; }
    g_fwDarkV = v;
    g_fwDarkAt = now;
    return v;
}

/* 壁纸当前应当用深色还是浅色。
   显式覆盖有效就用覆盖，否则完全沿用原来的 fw_isDarkRaw()——也就是说
   "全屏壁纸跟随 foobar2000 深浅自动切换"这条老能力一行没动。 */
function fw_themeDark() {
    var v = -1;
    try { v = Number(window.GetProperty(FW_PROP_DARK, -1)); } catch (e) { v = -1; }
    if (v !== 0 && v !== 1) return fw_isDarkRaw();
    if (fw_themeStale()) return fw_isDarkRaw();
    return v === 1;
}

/* 覆盖是不是已经过期：写入覆盖时 fb2k 是深（浅），现在反过来了，
   说明用户在这期间换过 fb2k 的界面深浅主题，覆盖该让位。 */
function fw_themeStale() {
    var ref = -1;
    try { ref = Number(window.GetProperty(FW_PROP_DARK_REF, -1)); } catch (e) { return false; }
    if (ref !== 0 && ref !== 1) return false;
    var cur = 0;
    try { cur = fw_bgIsDark() ? 1 : 0; } catch (e2) { return false; }
    return cur !== ref;
}

function fw_setThemeDark(dark) {
    dark = !!dark;
    try { window.SetProperty(FW_PROP_DARK, dark ? 1 : 0); } catch (e) {}
    try { window.SetProperty(FW_PROP_DARK_REF, fw_bgIsDark() ? 1 : 0); } catch (e1) {}
    g_fwDarkV = dark;
    g_fwDarkAt = (new Date()).getTime();
    return dark;
}

function fw_clearThemeDark() {
    try { window.SetProperty(FW_PROP_DARK, -1); } catch (e) {}
    try { window.SetProperty(FW_PROP_DARK_REF, -1); } catch (e1) {}
    g_fwDarkV = null;
    g_fwDarkAt = 0;
    return false;
}

function fw_isDarkRaw() {
    try {
        if (window.GetProperty("显示·深色布局", false)) return true;
        if (window.GetProperty("显示·固定深色布局", false)) return true;
        if (window.GetProperty("显示·强制深色布局", false)) return true;
    } catch (e0) {}
    try {
        if (window.GetProperty("媒体库·深色主题", false)) return true;
        if (window.GetProperty("播放列表·深色主题", false)) return true;
        if (window.GetProperty("艺术家简介·深色主题", false)) return true;
        if (window.GetProperty("可视化·深色主题", false)) return true;
        if (window.GetProperty("迷你模式·深色主题", false)) return true;
    } catch (e01) {}
    try {
        if (window.GetProperty("显示·深色布局跟随CUI", false)) {
            return fw_bgIsDark();
        }
    } catch (e1) {}
    return fw_bgIsDark();
}

function fw_bgIsDark() {
    var c = 0;
    try {
        c = (window.InstanceType === 1) ? window.GetColourDUI(1) : window.GetColourCUI(3);
    } catch (e) { return false; }
    try { c = Number(c) & 0xffffff; } catch (e2) { return false; }
    if (!c) return false;
    var r = (c >> 16) & 0xff, g = (c >> 8) & 0xff, b = c & 0xff;
    var lum = 0.299 * r + 0.587 * g + 0.114 * b;
    return lum < 0x80;
}

function fw_enabled() {
    try { return !!window.GetProperty(FW_PROP_ENABLED, false); } catch (e) { return false; }
}

var FW_SHARED_KEY = 'FULLSCREENWALLPAPER';

function fw_sharedRoot() {
    return fb.ProfilePath + 'wsh-data\\eole-settings\\';
}

function fw_sharedSet(on) {
    var root = fw_sharedRoot();
    var target = root + FW_SHARED_KEY + '_' + (on ? '1' : '0');
    try {
        var files = utils.Glob(root + FW_SHARED_KEY + '_*');
        if (files) {
            for (var i = 0; i < files.length; ++i) {
                if (String(files[i]) === target) continue;
                try { g_files.DeleteFile(files[i]); } catch (e1) {}
            }
        }
        if (utils.FileTest(target, 'e')) return true;
        var ts = g_files.CreateTextFile(target);
        if (ts) {
            try { ts.Write('1'); } catch (e2) {}
            try { ts.Close(); } catch (e3) {}
        }
        return true;
    } catch (e) {
        try { console.log('[FW] 写共享开关失败: ' + e); } catch (x) {}
        return false;
    }
}

var g_fw_sharedRaw = null, g_fw_sharedRawAt = 0;
function fw_sharedState(force) {
    var now = (new Date()).getTime();
    if (!force && g_fw_sharedRaw !== null && (now - g_fw_sharedRawAt) < 500) return g_fw_sharedRaw;
    var v = null;
    try {
        var files = utils.Glob(fw_sharedRoot() + FW_SHARED_KEY + '_*');
        if (files && files.length) {
            var name = String(files[0]);
            v = (name.substring(name.lastIndexOf('_') + 1) === '1');
        }
    } catch (e) { v = null; }
    g_fw_sharedRaw = v;
    g_fw_sharedRawAt = now;
    return v;
}

function fw_sharedOn(force) {
    return fw_sharedState(force) === true;
}

/* 不要删：这不是本主题 js 目录内部用的函数。
   biography\scripts\interface.js 的 UserInterface.draw() 通过
   typeof fw_transparent === 'function' 探测它，决定要不要给面板铺不透明底色：
   本面板勾了「背景壁纸·透明」且全局全屏壁纸开着时不铺，让宿主壁纸透下来。
   SMP 的简介面板把 JStheme_common.js 与 SMPbiography.js 装在同一个脚本上下文里，
   所以它能直接读到这里的顶层符号。删掉这个函数 → 简介面板背景变成不透明纯色块。 */
function fw_transparent(localOn) {
    if (!localOn) return false;
    return fw_sharedOn();
}

function fw_source() {
    var v = 0;
    try { v = Number(window.GetProperty(FW_PROP_SOURCE, 0)); } catch (e) { v = 0; }
    return (v === 1 || v === 2) ? v : 0;
}

function fw_imagePath() {
    var p = "";
    try { p = String(window.GetProperty(FW_PROP_IMAGE, "") || ""); } catch (e) { p = ""; }
    return p;
}
function fw_setImagePath(p) {
    try { window.SetProperty(FW_PROP_IMAGE, String(p || "")); } catch (e) {}
}

function fw_blurValue() {
    var key = fw_isDark() ? FW_PROP_BLUR : FW_PROP_BLUR_LT;
    var def = fw_isDark() ? 30 : 20;
    var v = def;
    try { v = Number(window.GetProperty(key, def)); } catch (e) { v = def; }
    if (!isFinite(v)) v = def;
    return Math.max(0, Math.min(90, v));
}

function fw_maskAlpha() {
    var key = fw_isDark() ? FW_PROP_MASK : FW_PROP_MASK_LT;
    var def = fw_isDark() ? 180 : 210;
    var v = def;
    try { v = Number(window.GetProperty(key, def)); } catch (e) { v = def; }
    if (!isFinite(v)) v = def;
    v = Math.max(0, Math.min(255, Math.round(v)));
    if (g_fw_lastHasRealImg === false) v = Math.round(v / 3);
    return v;
}

function fw_maskColor() {
    if (fw_isDark()) return GetGrey(25, fw_maskAlpha());
    return GetGrey(255, fw_maskAlpha());
}

function fw_setBlur(v) {
    v = Math.max(0, Math.min(90, Math.round(Number(v) || 0)));
    try { window.SetProperty(fw_isDark() ? FW_PROP_BLUR : FW_PROP_BLUR_LT, v); } catch (e) {}
}
function fw_setMask(v) {
    v = Math.max(0, Math.min(255, Math.round(Number(v) || 0)));
    try { window.SetProperty(fw_isDark() ? FW_PROP_MASK : FW_PROP_MASK_LT, v); } catch (e) {}
}

function fw_quality() {
    var v = 1;
    try { v = Number(window.GetProperty(FW_PROP_QUALITY, 1)); } catch (e) { v = 1; }
    return (v === 2 || v === 3) ? v : 1;
}

function fw_pickSource() {
    var src = fw_source(), p = fw_imagePath();
    if (src === 1 || src === 2) {
        if (p) {
            try {
                var im = gdi.Image(p);
                if (isImage(im)) return { img: im, path: p };
            } catch (e) {}
        }
        if (src === 1) return { img: null, path: p };
    }
    return { img: null, path: "" };
}

function fw_coverArt(metadb) {
    if (!metadb) return null;
    try {
        var im = utils.GetAlbumArtV2(metadb, 0, false);
        if (isImage(im) && im.Width > 1 && im.Height > 1) return im;
    } catch (e1) {}
    try {
        var im2 = utils.GetAlbumArtV2(metadb, AlbumArtId.front);
        if (isImage(im2) && im2.Width > 1 && im2.Height > 1) return im2;
    } catch (e2) {}
    try {
        var im3 = get_albumArt(metadb);
        if (isImage(im3) && im3.Width > 1 && im3.Height > 1) return im3;
    } catch (e3) {}
    return null;
}

// -----------------------------------------------------------------------------------
// fw_buildWallpaper(w, h, metadb)
// -----------------------------------------------------------------------------------
function fw_buildWallpaper(w, h, metadb, qOverride) {
    if (!(w > 0 && h > 0)) return null;
    var q = (typeof qOverride === 'number' && qOverride > 0) ? qOverride : fw_quality();
    var bw = Math.round(w * q), bh = Math.round(h * q);
    if (bw < 8) bw = 8;
    if (bh < 8) bh = 8;

    var srcMode = fw_source();
    var img = null, fromCover = false;

    /* 外部面板（Lxbox）推过来的流播封面优先。
       流播是 http 直链，fb2k 的 album art 对 stream handle 不一定会返回
       面板 AttachImage 挂上去的图，直接读文件路径最稳。
       g_fwExtCover 由 Eole_x64_layout.js 收到 lx_cover_path 后写入；
       其它面板 include 本文件时没有这个变量，typeof 判断会直接跳过。 */
    if (srcMode !== 1) {
        try {
            if (typeof g_fwExtCover === 'string' && g_fwExtCover) {
                var extMd = metadb;
                if (!extMd) { try { extMd = fb.GetNowPlaying(); } catch (eM) { extMd = null; } }
                var extStream = false;
                if (extMd) { try { extStream = /^https?:\/\//i.test(String(extMd.Path || '')); } catch (eP) {} }
                if (extStream) {
                    var extIm = gdi.Image(g_fwExtCover);
                    if (isImage(extIm) && extIm.Width > 1) { img = extIm; fromCover = true; }
                }
            }
        } catch (eExt) {}
    }

    if (!isImage(img) && (srcMode === 0 || srcMode === 2)) {
        if (!metadb) { try { metadb = fb.GetNowPlaying(); } catch (e0) { metadb = null; } }
        var cov = fw_coverArt(metadb);
        if (isImage(cov)) { img = cov; fromCover = true; }
    }
    if (!isImage(img) && srcMode !== 1) {
        var pick = fw_pickSource();
        if (isImage(pick.img)) img = pick.img;
    }
    if (!isImage(img) && srcMode === 1) {
        var pick1 = fw_pickSource();
        if (isImage(pick1.img)) img = pick1.img;
    }
    if (!isImage(img)) {
        try {
            var def = globalProperties.default_wallpaper;
            if (def) {
                var imd = gdi.Image(def);
                if (isImage(imd) && imd.Width > 1) img = imd;
            }
        } catch (e4) {}
    }
    if (!isImage(img)) {
        try {
            var nc = globalProperties.nocover_img;
            if (isImage(nc) && nc.Width > 1) img = nc;
        } catch (e5) {}
    }
    g_fw_lastSrcCover = fromCover;
    g_fw_lastHasRealImg = isImage(img);
    if (!isImage(img)) {
        try {
            img = gdi.CreateImage(Math.max(2, Math.round(bw / 8)), Math.max(2, Math.round(bh / 8)));
            var fg = img.GetGraphics();
            fg.FillSolidRect(0, 0, img.Width, img.Height, fw_isDark() ? GetGrey(52) : GetGrey(224));
            img.ReleaseGraphics(fg);
        } catch (e6) { img = null; }
    }
    if (!isImage(img)) return null;

    var iw = img.Width, ih = img.Height;
    var dstRatio = bw / bh;
    var srcRatio = iw / ih;
    var cx = 0, cy = 0, cw = iw, ch = ih;
    if (srcRatio > dstRatio) {
        cw = Math.round(ih * dstRatio);
        cx = Math.round((iw - cw) / 2);
    } else if (srcRatio < dstRatio) {
        ch = Math.round(iw / dstRatio);
        cy = Math.round((ih - ch) / 2);
    }
    if (cw < 1) cw = iw;
    if (ch < 1) ch = ih;

    var blur = fw_blurValue();
    var tmp = null;
    if (blur > 0) {
        try {
            var div = 1 + blur / 6;
            var sw = Math.max(24, Math.round(bw / div));
            var sh = Math.max(24, Math.round(bh / div));
            var small = gdi.CreateImage(sw, sh);
            var sg = small.GetGraphics();
            sg.SetInterpolationMode(1);
            sg.DrawImage(img, 0, 0, sw, sh, cx, cy, cw, ch, 0, 255);
            small.ReleaseGraphics(sg);
            small.StackBlur(Math.max(1, Math.round(blur / 2)));
            tmp = small.Resize(bw, bh, 1);
        } catch (e) { tmp = null; }
    }
    if (!isImage(tmp)) {
        try {
            tmp = gdi.CreateImage(bw, bh);
            var g2 = tmp.GetGraphics();
            g2.SetInterpolationMode(1);
            g2.DrawImage(img, 0, 0, bw, bh, cx, cy, cw, ch, 0, 255);
            tmp.ReleaseGraphics(g2);
        } catch (e) { tmp = null; }
    }
    if (!isImage(tmp)) tmp = img;
    return tmp;
}

function fw_drawWallpaper(gr, w, h, wallImg) {
    if (!gr) return false;
    if (isImage(wallImg) && wallImg.Width > 0) {
        gr.DrawImage(wallImg, 0, 0, w, h, 0, 0, wallImg.Width, wallImg.Height, 0, 255);
    } else {
        gr.FillSolidRect(0, 0, w, h, fw_isDark() ? GetGrey(30) : GetGrey(255));
        return false;
    }
    var a = fw_maskAlpha();
    if (a > 0) gr.FillSolidRect(0, 0, w, h, fw_maskColor());
    return true;
}

var g_fw_on = null;
function fw_on() {
    if (g_fw_on === null) g_fw_on = fw_enabled();
    return g_fw_on;
}
function fw_setOn(v) {
    g_fw_on = !!v;
}

function fw_glass() {
    return fw_on();
}

function fw_cfgPath() {
    return fb.ProfilePath + 'wsh-data\\eole-settings\\FULLSCREENWALLPAPER.cfg';
}

function fw_rawNum(key, def) {
    var v = def;
    try { v = Number(window.GetProperty(key, def)); } catch (e) { v = def; }
    return isFinite(v) ? v : def;
}

function fw_cfgWrite() {
    var c = {
        on:  fw_enabled(),
        src: fw_source(),
        img: fw_imagePath(),
        bd:  fw_rawNum(FW_PROP_BLUR, 30),
        bl:  fw_rawNum(FW_PROP_BLUR_LT, 20),
        md:  fw_rawNum(FW_PROP_MASK, 180),
        ml:  fw_rawNum(FW_PROP_MASK_LT, 210),
        q:   fw_quality()
    };
    try {
        utils.WriteTextFile(fw_cfgPath(), JSON.stringify(c));
        return true;
    } catch (e) {
        try { console.log('[FW] 写配置文件失败: ' + e); } catch (x) {}
        return false;
    }
}

function fw_cfgRead() {
    try {
        var t = utils.ReadTextFile(fw_cfgPath());
        if (!t) return null;
        var c = JSON.parse(t);
        return (c && typeof c === 'object') ? c : null;
    } catch (e) { return null; }
}

function fw_broadcast(on) {
    var v = (typeof on === "boolean") ? on : fw_enabled();
    try { window.SetProperty(FW_PROP_ENABLED, v); } catch (e) {}
    try { fw_sharedSet(v); } catch (eS) {}
    try { fw_cfgWrite(); } catch (eW) {}
    try { g_fw_sharedRaw = null; } catch (eC) {}
    try { window.NotifyOthers("fullscreenWallpaper", v); } catch (e) {}
    try { window.NotifyOthers("wallpaper", { enabled: v }); } catch (e2) {}
    try { window.Repaint(); } catch (e3) {}
}

//JSON wrappers
function JSON_parse(info) {
	try {
	   return JSON.parse(info);
	} catch (e) {
		fb.ShowPopupMessage('Oupppppsssss, it look like an error\n\n'+"JSON_parse "+info, "Error");
		console.log(e)
	}
	return JSON.parse(info);
}
function JSON_stringify(info) {
	try {
	   return JSON.stringify(info);
	} catch (e) {
		fb.ShowPopupMessage('Oupppppsssss, it look like an error\n\n'+"JSON_stringify "+info, "Error");
		console.log(e)
	}
}
function CreatePlaylist(pl_place, pl_name) {
	try {
		result = utils.InputBox(window.ID, "为播放列表命名", "新建播放列表", "新播放列表", true);
		if (result){
			if (result == "") {
				plman.CreatePlaylist(pl_place, "新播放列表");
			} else plman.CreatePlaylist(pl_place, result);
			return true;
		} else return false;
	} catch(e) {
	}
}
