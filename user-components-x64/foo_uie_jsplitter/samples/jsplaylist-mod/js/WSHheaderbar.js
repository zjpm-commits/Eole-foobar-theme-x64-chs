// *****************************************************************************************************************************************
// headerBar 对象，作者 Br3tt aka Falstaff (c)2015
// *****************************************************************************************************************************************

oBorder = function () {
	this.leftId = arguments[0];
	this.rightId = arguments[1];
	this.percent = arguments[2];

	this.isHover = function (x, y) {
		return (x >= this.x - 3 && x <= this.x + this.w + 2 && y >= this.y && y <= this.y + this.h);
	};

	this.on_mouse = function (event, x, y) {
		this.ishover = (x >= this.x - 3 && x <= this.x + this.w + 2 && y >= this.y && y <= this.y + this.h);
		switch (event) {
		case "down":
			if (this.ishover) {
				this.sourceX = x;
				this.drag = true;
			};
			break;
		case "up":
			this.drag = false;
			break;
		case "move":
			if (this.drag) {
				this.delta = x - this.sourceX;
			};
			break;
		};
	};
};

oColumn = function () {
	this.label = arguments[0];
	this.tf = arguments[1];
	this.tf2 = arguments[2];
	this.percent = arguments[3];
	this.ref = arguments[4];
	this.align = Math.round(arguments[5]);
	this.sortOrder = arguments[6];
	this.DT_align = (this.align == 0 ? DT_LEFT : (this.align == 2 ? DT_RIGHT : DT_CENTER));
	this.minWidth = zoom(32, g_dpi);
	this.drag = false;

	this.isHover = function (x, y) {
		return (x > this.x && x < this.x + this.w && y >= this.y && y <= this.y + this.h);
	};

	this.on_mouse = function (event, x, y) {
		this.ishover = (x > this.x + 2 && x < this.x + this.w - 2 && y >= this.y && y <= this.y + this.h);
		switch (event) {
		case "down":
			if (this.ishover && this.percent > 0) {
				this.drag = true;
			};
			break;
		case "up":
			this.drag = false;
			break;
		};
	};
};

oHeaderBar = function () {
	this.visible = true;
	this.columns = [];
	this.borders = [];
	this.totalColumns = window.GetProperty("系统.标题栏.总列数", 0);
	this.borderDragged = false;
	this.borderDraggedId = -1;
	this.columnDragged = 0;
	this.columnDraggedId = null;
	this.columnRightClicked = -1;
	this.resetSortIndicators = function () {
		this.sortedColumnId = -1;
		this.sortedColumnDirection = 1;
	};
	this.resetSortIndicators();

	this.borderHover = false;
	this.clickX = 0;

	this.setButtons = function () {
		var gfx_font = gdi_font("guifx v2 transports", 15, 0);

		if (properties.themed) {
			var color_txt = g_syscolor_button_txt;
			var color_bg = g_syscolor_button_bg;
		} else {
			var color_txt = g_color_normal_txt;
			var color_bg = g_color_normal_bg;
		};

		// 普通播放列表管理器滑动图像
		this.slide_open_normal = gdi.CreateImage(cScrollBar.width, this.h);
		var gb = this.slide_open_normal.GetGraphics();
		gb.FillSolidRect(0, 0, cScrollBar.width, this.h, g_color_normal_txt & 0x15ffffff);
		gb.SetTextRenderingHint(4);
		gb.DrawString(String.fromCharCode(161), g_font_wd3_headerBar, color_txt, 0, 0, cScrollBar.width, this.h, cc_stringformat);
		this.slide_open_normal.ReleaseGraphics(gb);

		// 悬停播放列表管理器滑动图像
		this.slide_open_hover = gdi.CreateImage(cScrollBar.width, this.h);
		gb = this.slide_open_hover.GetGraphics();
		gb.FillSolidRect(0, 0, cScrollBar.width, this.h, g_color_normal_txt & 0x30ffffff);
		gb.SetTextRenderingHint(4);
		gb.DrawString(String.fromCharCode(161), g_font_wd3_headerBar, color_bg, 0, 0, cScrollBar.width, this.h, cc_stringformat);
		this.slide_open_hover.ReleaseGraphics(gb);

		// 按下播放列表管理器滑动图像
		this.slide_open_down = gdi.CreateImage(cScrollBar.width, this.h);
		gb = this.slide_open_down.GetGraphics();
		gb.FillSolidRect(0, 0, cScrollBar.width, this.h, g_color_normal_txt & 0x30ffffff);
		gb.SetTextRenderingHint(4);
		gb.DrawString(String.fromCharCode(161), g_font_wd3_headerBar, color_txt, 0, 0, cScrollBar.width, this.h, cc_stringformat);
		this.slide_open_down.ReleaseGraphics(gb);

		// 普通播放列表管理器关闭图像
		this.slide_close_normal = gdi.CreateImage(cScrollBar.width, this.h);
		var gb = this.slide_close_normal.GetGraphics();
		gb.FillSolidRect(0, 0, cScrollBar.width, this.h, g_color_normal_txt & 0x15ffffff);
		gb.SetTextRenderingHint(4);
		gb.DrawString(String.fromCharCode(162), g_font_wd3_headerBar, color_txt, 0, 0, cScrollBar.width, this.h, cc_stringformat);
		this.slide_close_normal.ReleaseGraphics(gb);

		// 悬停播放列表管理器关闭图像
		this.slide_close_hover = gdi.CreateImage(cScrollBar.width, this.h);
		gb = this.slide_close_hover.GetGraphics();
		gb.FillSolidRect(0, 0, cScrollBar.width, this.h, g_color_normal_txt & 0x30ffffff);
		gb.SetTextRenderingHint(4);
		gb.DrawString(String.fromCharCode(162), g_font_wd3_headerBar, color_bg, 0, 0, cScrollBar.width, this.h, cc_stringformat);
		this.slide_close_hover.ReleaseGraphics(gb);

		// 按下播放列表管理器关闭图像
		this.slide_close_down = gdi.CreateImage(cScrollBar.width, this.h);
		gb = this.slide_close_down.GetGraphics();
		gb.FillSolidRect(0, 0, cScrollBar.width, this.h, g_color_normal_txt & 0x30ffffff);
		gb.SetTextRenderingHint(4);
		gb.DrawString(String.fromCharCode(162), g_font_wd3_headerBar, color_txt, 0, 0, cScrollBar.width, this.h, cc_stringformat);
		this.slide_close_down.ReleaseGraphics(gb);

		if (cPlaylistManager.visible) {
			this.button = new button(this.slide_close_normal, this.slide_close_hover, this.slide_close_down);
		} else {
			this.button = new button(this.slide_open_normal, this.slide_open_hover, this.slide_open_down);
		};
	};

	this.setSize = function (x, y, w, h) {
		this.x = x;
		this.y = y;
		this.w = w - cScrollBar.width;
		this.h = cHeaderBar.height;
		this.setButtons();
		this.txtHeight = cHeaderBar.txtHeight;
		this.borderWidth = cHeaderBar.borderWidth;
	};

	this.repaint = function () {
		full_repaint();
	};

	this.calculateColumns = function () {
		var tmp = this.x;

		// 计算列尺寸，同时计算边框尺寸
		for (var i = 0; i < this.totalColumns; i++) {
			if (this.columns[i].percent > 0) {
				this.columns[i].x = tmp;
				this.columns[i].y = this.y;
				this.columns[i].w = Math.abs(this.w * this.columns[i].percent / 100000);
				this.columns[i].h = this.h;
				if (i != this.columnDraggedId || (this.columnDragged == 1)) {
					// 开始 >> 处理最后一列，调整最后绘制列的宽度以适配标题栏宽度！
					if (this.columns[i].x + this.columns[i].w >= this.x + this.w) { // 若最后一列宽度超过最大宽度（多 1 像素！），缩小列宽！
						this.columns[i].w = (this.x + this.w) - this.columns[i].x + 1; // 因下方 DrawRect 中每列绘制宽度有 -1，此处 +1 以适配整个标题栏宽度
					};
					if (this.columns[i].x + this.columns[i].w < this.x + this.w && this.columns[i].x + this.columns[i].w > this.x + this.w - 4) { // 若末尾有 1 像素间隙，则填补！
						this.columns[i].w = (this.x + this.w) - this.columns[i].x + 1;
					};
					// 结束 <<
				};
				tmp = this.columns[i].x + this.columns[i].w;
			} else {
				this.columns[i].x = tmp;
				this.columns[i].y = this.y;
				this.columns[i].w = 0;
				this.columns[i].h = this.h;
			};
		};
	};

	this.drawHiddenPanel = function (gr) {
		gr.FillSolidRect(this.x, this.y, this.w + cScrollBar.width, 1, g_color_normal_txt & 0x15ffffff);
	}

	this.drawColumns = function (gr) {
		var j = 0,
		tmp = this.x,
		cx = 0,
		cy = 0,
		cw = 0,
		sx = 0,
		bx = 0;

		// 微调：仅在列排序后将鼠标光标重置为箭头
		if (this.columnDragged_saved == 3 && this.columnDragged == 0) {
			this.columnDragged_saved = 0;
		};

		// 计算列尺寸，同时计算边框尺寸
		this.calculateColumns();

		// 从每个边框绘制边框与左侧列！
		tmp = this.x;
		for (var i = 0; i < this.borders.length; i++) {
			j = this.borders[i].leftId;
			this.borders[i].x = this.columns[j].x + this.columns[j].w - 1;
			this.borders[i].y = this.columns[j].y;
			this.borders[i].w = this.borderWidth;
			this.borders[i].h = this.columns[j].h;
			bx = Math.floor(this.borders[i].x - 1);

			if (this.columns[j].percent > 0) {
				cx = tmp;
				cy = this.y;
				cw = (bx - cx);
				if (j != this.columnDraggedId || (this.columnDragged == 1)) {
					// 绘制列头背景
					if (this.columnRightClicked == j) {
						gr.FillSolidRect(cx, cy, cw, this.h, g_color_normal_txt & 0x30ffffff);
					} else { // 普通框
						if (this.columnDragged == 1 && j == this.columnDraggedId) {
							gr.FillSolidRect(cx, cy, cw, this.h, g_color_normal_txt & 0x30ffffff);
						} else {
							gr.FillSolidRect(cx, cy, cw, this.h, g_color_normal_txt & 0x15ffffff);
						};
					};
					// 绘制列头信息
					if (this.columns[j].tf != "null" || this.columns[j].sortOrder != "null") {
						// 绘制排序指示（方向）
						if (j == this.sortedColumnId) {
							sx = Math.floor(cx + this.columns[j].w / 2 - 3);
							sh = cy + 1;
							images.sortdirection && gr.DrawImage(images.sortdirection, sx, sh, images.sortdirection.Width, images.sortdirection.Height, 0, 0, images.sortdirection.Width, images.sortdirection.Height, (this.sortedColumnDirection > 0 ? 180 : 0), 130);
						};
					};
					gr.GdiDrawText(this.columns[j].label, gdi_font(g_fname, this.txtHeight, 1), g_color_normal_txt, cx + (this.borderWidth * 2), cy + 1, cw - (this.borderWidth * 4) - 1, this.h, this.columns[j].DT_align | DT_VCENTER | DT_CALCRECT | DT_NOPREFIX | DT_END_ELLIPSIS);
				} else if (j == this.columnDraggedId && this.columnDragged == 2) {
					gr.FillGradRect(cx, cy, cw, this.h, 90, RGBA(0, 0, 0, 60), 0, 1.0);
				};
			};

			if (this.borders[i].drag) {
				gr.FillSolidRect(Math.floor(bx - 0), this.y, this.borders[i].w, this.h, g_color_normal_txt);
			};
			tmp = bx + this.borderWidth;
		};

		// 在最后一个边框对象右侧绘制最后一列
		for (j = this.totalColumns - 1; j >= 0; j--) {
			if (this.columns[j].percent > 0) {
				cx = tmp;
				cy = this.y;
				cw = (this.w - this.borderWidth - cx);
				if (j != this.columnDraggedId || (this.columnDragged == 1)) {
					// 绘制最后一列背景
					if (this.columnRightClicked == j) {
						gr.FillSolidRect(cx, cy, cw, this.h, g_color_normal_txt & 0x30ffffff);
					} else { // 普通框
						if (this.columnDragged == 1 && j == this.columnDraggedId) {
							gr.FillSolidRect(cx, cy, cw, this.h, g_color_normal_txt & 0x30ffffff);
						} else {
							gr.FillSolidRect(cx, cy, cw, this.h, g_color_normal_txt & 0x15ffffff);
						};
					};
					// 绘制最后一列列头信息
					if (this.columns[j].tf != "null" || this.columns[j].sortOrder != "null") {
						// 绘制排序指示（方向）
						if (j == this.sortedColumnId) {
							sx = Math.floor(cx + this.columns[j].w / 2 - 3);
							sh = cy + 1;
							images.sortdirection && gr.DrawImage(images.sortdirection, sx, sh, images.sortdirection.Width, images.sortdirection.Height, 0, 0, images.sortdirection.Width, images.sortdirection.Height, (this.sortedColumnDirection > 0 ? 180 : 0), 130);
						};
					};
					gr.GdiDrawText(this.columns[j].label, gdi_font(g_fname, this.txtHeight, 1), g_color_normal_txt, cx + (this.borderWidth * 2), cy + 1, cw - (this.borderWidth * 4) - 1, this.h, this.columns[j].DT_align | DT_VCENTER | DT_CALCRECT | DT_NOPREFIX | DT_END_ELLIPSIS);
				} else if (j == this.columnDraggedId && this.columnDragged == 2) {
					gr.FillGradRect(cx, cy, cw, this.h, 90, RGBA(0, 0, 0, 70), 0, 1.0);
				};
				break;
			};
		};

		// 绘制被拖动的列头（最后绘制以始终在最上层）
		if (this.columnDragged > 1 && this.columnDraggedId != null) {
			cx = Math.floor(mouse_x - this.clickX) + 2;
			cy = this.y + 3;
			// 阴影
			gr.FillSolidRect(cx + 4, cy + 3, Math.floor(this.columns[this.columnDraggedId].w - 2), this.h, RGBA(0, 0, 0, 10));
			gr.FillSolidRect(cx + 3, cy + 2, Math.floor(this.columns[this.columnDraggedId].w - 2), this.h, RGBA(0, 0, 0, 15));
			gr.FillSolidRect(cx + 2, cy + 1, Math.floor(this.columns[this.columnDraggedId].w - 2), this.h, RGBA(0, 0, 0, 30));
			// 列头背景
			gr.FillSolidRect(cx, cy, Math.floor(this.columns[this.columnDraggedId].w - 2), this.h, g_color_normal_txt & 0x66ffffff);
			gr.DrawRect(cx, cy + 1, Math.floor(this.columns[this.columnDraggedId].w - 2), this.h - 2, 2.0, g_color_normal_txt);
			gr.DrawRect(cx + 1, cy + 2, Math.floor(this.columns[this.columnDraggedId].w - 5), this.h - 5, 1.0, blendColors(g_color_normal_txt, g_color_normal_bg, 0.55));
			// 列头文本信息
			gr.GdiDrawText(this.columns[this.columnDraggedId].label, gdi_font(g_fname, this.txtHeight, 1), g_color_normal_bg, cx + (this.borderWidth * 2), cy + 1, this.columns[this.columnDraggedId].w - (this.borderWidth * 4) - 2, this.h, this.columns[this.columnDraggedId].DT_align | DT_VCENTER | DT_CALCRECT | DT_NOPREFIX | DT_END_ELLIPSIS);
		};
		// 绘制设置按钮
		this.button.draw(gr, this.x + this.w, this.y, 255);
	};

	this.saveColumns = function () {
		var tmp;
		for (var j = 0; j < 7; j++) {
			tmp = "";
			for (var i = 0; i < this.columns.length; i++) {
				switch (j) {
				case 0:
					tmp = tmp + this.columns[i].label;
					break;
				case 1:
					tmp = tmp + this.columns[i].tf;
					break;
				case 2:
					tmp = tmp + this.columns[i].tf2;
					break;
				case 3:
					tmp = tmp + this.columns[i].percent;
					break;
				case 4:
					tmp = tmp + this.columns[i].ref;
					break;
				case 5:
					tmp = tmp + this.columns[i].align;
					break;
				case 6:
					tmp = tmp + this.columns[i].sortOrder;
					break;
				};
				// 添加分隔符 ';'
				if (i < this.columns.length - 1) {
					tmp = tmp + "^^";
				};
			};
			switch (j) {
			case 0:
				window.SetProperty("系统.标题栏.标签", tmp);
				break;
			case 1:
				window.SetProperty("系统.标题栏.标题格式", tmp);
				break;
			case 2:
				window.SetProperty("系统.标题栏.标题格式2", tmp);
				break;
			case 3:
				window.SetProperty("系统.标题栏.宽度百分比", tmp);
				break;
			case 4:
				window.SetProperty("系统.标题栏.参考", tmp);
				break;
			case 5:
				window.SetProperty("系统.标题栏.对齐", tmp);
				break;
			case 6:
				window.SetProperty("系统.标题栏.排序", tmp);
				break;
			};
		};
		this.initColumns();
	};

	this.initColumns = function () {
		var borderPercent = 0;
		var previousColumnToDrawId = -1;
		var totalColumnsToDraw = 0;
		this.columns.splice(0, this.columns.length);
		this.borders.splice(0, this.borders.length);
		if (this.totalColumns == 0) {
			// 初始化列与属性
			var fields = [];
			var tmp,
			percent;
			for (var i = 0; i < 7; i++) {
				switch (i) {
				case 0:
					fields.push(new Array("封面", "状态", "序号", "#", "标题", "日期", "艺术家", "专辑", "流派", "喜爱", "等级", "统计", "比特率", "时长"));
					break;
				case 1:
					fields.push(new Array("null", "null", "$num(%list_index%,$len(%list_total%))", "$if2(%tracknumber%,-)", "$if2(%title%,%filename_ext%)", "$if(%date%,$year($replace(%date%,/,-,.,-)),'-')", "$if(%length%,%artist%,'Stream')", "$if2(%album%,$if(%length%,'Single','Web radios'))", "$if2(%genre%,'Other')", "$rgb(255,120,170)$if(%FEEDBACK%,1,0)", "$rgb(255,255,50)$if2(%rating%,0)", "$if2(%play_counter%,$if2(%play_count%,0))", "$if(%__bitrate_dynamic%, $if(%isplaying%,$select($add($mod(%_time_elapsed_seconds%,2),1),%__bitrate_dynamic%,%__bitrate_dynamic%)'K',$if($stricmp($left(%codec_profile%,3),'VBR'),%codec_profile%,%__bitrate%'K')),' '$if($stricmp($left(%codec_profile%,3),'VBR'),%codec_profile%,%__bitrate%'K'))", "$if(%isplaying%,$if(%length%,-%playback_time_remaining%,'0:00'),$if2(%length%,'00:00'))"));
					break;
				case 2:
					fields.push(new Array("null", "null", "null", "null", "$if(%length%,%artist%,)", "null", "null", "$if2(%genre%,'Other')", "null", "null", "null", "null", "null", "%__bitrate% kbps"));
					break;
				case 3:
					fields.push(new Array("0", "5000", "0", "5000", "70000", "0", "0", "0", "0", "0", "10000", "0", "0", "10000"));
					break;
				case 4:
					fields.push(new Array("封面", "状态", "序号", "音轨号", "标题", "日期", "艺术家", "专辑", "流派", "喜爱", "等级", "播放次数", "比特率", "时长"));
					break;
				case 5:
					fields.push(new Array("0", "1", "1", "2", "0", "2", "0", "0", "0", "1", "1", "2", "1", "2"));
					break;
				case 6:
					fields.push(new Array("%album artist% | $if(%album%,%date%,'9999') | %album% | %discnumber% | %tracknumber% | %title%", "%album artist% | $if(%album%,%date%,'9999') | %album% | %discnumber% | %tracknumber% | %title%", "null", "%tracknumber% | %album artist% | $if(%album%,%date%,'9999') | %album% | %discnumber% | %title%", "%title% | %album artist% | $if(%album%,%date%,'9999') | %album% | %discnumber% | %tracknumber%", "%date% | %album artist% | %album% | %discnumber% | %tracknumber% | %title%", "%artist% | $if(%album%,%date%,'9999') | %album% | %discnumber% | %tracknumber% | %title%", "$if2(%album%,%artist%) | $if(%album%,%date%,'9999') | %album artist% | %discnumber% | %tracknumber% | %title%", "%genre% | %album artist% | $if(%album%,%date%,'9999') | %album% | %discnumber% | %tracknumber% | %title%", "%FEEDBACK% | %album artist% | $if(%album%,%date%,'9999') | %album% | %discnumber% | %tracknumber% | %title%", "%rating% | %album artist% | $if(%album%,%date%,'9999') | %album% | %discnumber% | %tracknumber% | %title%", "$if2(%play_counter%,$if2(%play_count%,0)) | %album artist% | $if(%album%,%date%,'9999') | %album% | %discnumber% | %tracknumber% | %title%", "%__bitrate% | %album artist% | $if(%album%,%date%,'9999') | %album% | %discnumber% | %tracknumber% | %title%", "$if2(%length%,' 0:00') | %album artist% | $if(%album%,%date%,'9999') | %album% | %discnumber% | %tracknumber% | %title%"));
					break;
				};
				// 将数组转换为 csv 字符串
				tmp = "";
				for (var j = 0; j < fields[i].length; j++) {
					tmp = tmp + fields[i][j];
					if (j < fields[i].length - 1) {
						tmp = tmp + "^^";
					};
				};
				// 将 CSV 字符串保存到窗口属性
				switch (i) {
				case 0:
					window.SetProperty("系统.标题栏.标签", tmp);
					break;
				case 1:
					window.SetProperty("系统.标题栏.标题格式", tmp);
					break;
				case 2:
					window.SetProperty("系统.标题栏.标题格式2", tmp);
					break;
				case 3:
					window.SetProperty("系统.标题栏.宽度百分比", tmp);
					break;
				case 4:
					window.SetProperty("系统.标题栏.参考", tmp);
					break;
				case 5:
					window.SetProperty("系统.标题栏.对齐", tmp);
					break;
				case 6:
					window.SetProperty("系统.标题栏.排序", tmp);
					break;
				};
			};
			// 创建列对象
			this.totalColumns = fields[0].length;
			window.SetProperty("系统.标题栏.总列数", this.totalColumns);
			for (var k = 0; k < this.totalColumns; k++) {
				this.columns.push(new oColumn(fields[0][k], fields[1][k], fields[2][k], fields[3][k], fields[4][k], fields[5][k], fields[6][k]));
				if (this.columns[k].percent > 0) {
					if (previousColumnToDrawId >= 0) {
						this.borders.push(new oBorder(previousColumnToDrawId, k, borderPercent));
					};
					borderPercent += Math.round(this.columns[k].percent);
					previousColumnToDrawId = k;
				};
			};

		} else {
			var fields = [];
			var tmp;
			// 从属性加载列
			for (var i = 0; i < 7; i++) {
				switch (i) {
				case 0:
					tmp = window.GetProperty("系统.标题栏.标签", "?^^?^^?^^?^^?^^?^^?^^?^^?^^?^^?^^?^^?^^?");
					break;
				case 1:
					tmp = window.GetProperty("系统.标题栏.标题格式", "?^^?^^?^^?^^?^^?^^?^^?^^?^^?^^?^^?^^?^^?");
					break;
				case 2:
					tmp = window.GetProperty("系统.标题栏.标题格式2", "?^^?^^?^^?^^?^^?^^?^^?^^?^^?^^?^^?^^?^^?");
					break;
				case 3:
					tmp = window.GetProperty("系统.标题栏.宽度百分比", "0^^0^^0^^0^^0^^0^^0^^0^^0^^0^^0^^0^^0^^0");
					break;
				case 4:
					tmp = window.GetProperty("系统.标题栏.参考", "?^^?^^?^^?^^?^^?^^?^^?^^?^^?^^?^^?^^?^^?");
					break;
				case 5:
					tmp = window.GetProperty("系统.标题栏.对齐", "0^^0^^0^^0^^0^^0^^0^^0^^0^^0^^0^^0^^0^^0");
					break;
				case 6:
					tmp = window.GetProperty("系统.标题栏.排序", "?^^?^^?^^?^^?^^?^^?^^?^^?^^?^^?^^?^^?^^?");
					break;
				};
				fields.push(tmp.split("^^"));
			};
			for (var k = 0; k < this.totalColumns; k++) {
				this.columns.push(new oColumn(fields[0][k], fields[1][k], fields[2][k], fields[3][k], fields[4][k], fields[5][k], fields[6][k]));
				if (this.columns[k].percent > 0) {
					if (previousColumnToDrawId >= 0) {
						this.borders.push(new oBorder(previousColumnToDrawId, k, borderPercent));
					};
					borderPercent += Math.round(this.columns[k].percent);
					previousColumnToDrawId = k;
				};
			};
			this.calculateColumns();
		};
	};

	this.buttonCheck = function (event, x, y) {
		if (!dragndrop.moved) {
			if (!this.columnDragged && !this.borderDragged) {

				var state = this.button.checkstate(event, x, y);
				switch (event) {
				case "down":
					if (state == ButtonStates.down) {
						this.buttonClicked = true;
					};
					break;
				case "up":
					if (this.buttonClicked && state == ButtonStates.hover) {
						togglePlaylistManager();
						this.button.state = ButtonStates.hover;
					};
					this.buttonClicked = false;
					break;
				case "leave":
					this.button.state = ButtonStates.normal;
					break;
				};
				return state;
			};
		};
	};

	this.on_mouse = function (event, x, y, delta) {
		var tmp = "",
		percents = [];

		if (!p.scrollbar.clicked) {

			this.ishover = (x >= this.x && x <= this.x + this.w && y >= this.y && y <= this.y + this.h);

			// 若按钮未悬停，检测设置按钮 + 工具栏
			if (this.buttonCheck(event, x, y) != ButtonStates.hover) {
				switch (event) {
				case "down":
					if (this.ishover) {
						// 检测边框：
						for (var i = 0; i < this.borders.length; i++) {
							this.borders[i].on_mouse(event, x, y);
							if (this.borders[i].drag) {
								this.borderDragged = true;
								this.borderDraggedId = i;
								full_repaint();
							};
						};
						// 若未点击边框（无边框拖动），检测列：
						if (!this.borderDragged) {
							for (var i = 0; i < this.columns.length; i++) {
								this.columns[i].on_mouse(event, x, y);
								if (this.columns[i].drag) {
									this.clickX = x - this.columns[i].x;
									if (this.columns[i].tf != "null" || this.columns[i].sortOrder != "null") {
										this.columnDragged = 1;
										window.SetCursor(IDC_ARROW);
									} else {
										this.columnDragged = 2;
										window.SetCursor(IDC_SIZEALL);
									};
									this.columnDraggedId = i;
									this.columnDraggedIdHistoric = i;
									this.repaint();
									break;
								};
							};
						};
					};
					break;
				case "up":
					if (this.borderDragged) {
						for (var i = 0; i < this.borders.length; i++) {
							if (this.borders[i].drag) {
								// 保存更新后的左右列 'percent' 属性
								tmp = window.GetProperty("系统.标题栏.宽度百分比", "0^^0^^0^^0^^0^^0^^0^^0^^0^^0^^0^^0^^0^^0");
								percents = tmp.split("^^");
								percents[Math.round(this.borders[i].leftId)] = this.columns[this.borders[i].leftId].percent.toString();
								percents[Math.round(this.borders[i].rightId)] = this.columns[this.borders[i].rightId].percent.toString();
								// 将新的 percent CSV 字符串保存到窗口属性
								tmp = "";
								for (var j = 0; j < percents.length; j++) {
									tmp = tmp + percents[j];
									if (j < percents.length - 1) {
										tmp = tmp + "^^";
									};
								};
								window.SetProperty("系统.标题栏.宽度百分比", tmp);
								// 更新边框对象状态
								this.borders[i].on_mouse(event, x, y);
								this.repaint();
							};
						};
						this.borderDragged = false;
						this.borderDraggedId = -1;
						this.on_mouse("move", x, y); // 调用 "Move" 以在边框悬停时设置鼠标光标
					} else if (this.columnDragged > 0) {
						if (this.columnDragged == 1) {
							if (this.columnDraggedId == 0) {
								this.columns[0].on_mouse(event, x, y);
							};
							if (this.columnDraggedId > 0 || (this.columnDraggedId == 0 && this.columns[this.columnDraggedId].isHover(x, y))) {
								window.SetCursor(IDC_WAIT);
								this.sortedColumnDirection = (this.columnDraggedId == this.sortedColumnId) ? (0 - this.sortedColumnDirection) : 1;
								this.sortedColumnId = this.columnDraggedId;
								this.columns[this.columnDraggedId].drag = false;
								this.columnDragged = 3;
								this.columnDragged_saved = 3;
								cHeaderBar.sortRequested = true;
								plman.UndoBackup(plman.ActivePlaylist);
								if (this.columns[this.columnDraggedId].sortOrder != "null") {
									plman.SortByFormatV2(plman.ActivePlaylist, this.columns[this.columnDraggedId].sortOrder, this.sortedColumnDirection);
								} else {
									plman.SortByFormatV2(plman.ActivePlaylist, this.columns[this.columnDraggedId].tf, this.sortedColumnDirection);
								};
								update_playlist(properties.collapseGroupsByDefault);
							} else {
								this.columns[this.columnDraggedId].drag = false;
								this.columnDragged = 0;
								this.columnDragged_saved = 0;
							};
						} else {
							for (var i = 0; i < this.columns.length; i++) {
								this.columns[i].on_mouse(event, x, y);
							};
							this.columnDragged = 0;
							this.on_mouse("move", x, y); // 调用 "Move" 以在边框悬停时设置鼠标光标
						};
						this.columnDraggedId = null;
						this.repaint();
					};
					break;
				case "right":
					if (this.ishover) {
						this.columnRightClicked = -1;
						for (var i = 0; i < this.columns.length; i++) {
							if (this.columns[i].percent > 0 && this.columns[i].isHover(x, y)) {
								this.columnRightClicked = i;
								this.repaint();
								break;
							};
						};
						if (!utils.IsKeyPressed(VK_SHIFT)) {
							this.contextMenu(x, y, this.columnRightClicked);
						};
					};
					break;
				case "move":
					this.borderHover = false;
					for (var i = 0; i < this.borders.length; i++) {
						if (this.borders[i].isHover(x, y)) {
							this.borderHover = true;
							break;
						};
					};
					if (this.columnDragged < 1) {
						if (this.borderHover || this.borderDragged) {
							window.SetCursor(IDC_SIZEWE);
						} else if (p.playlistManager.inputbox) {
							if (!p.playlistManager.inputbox.ibeam_set)
								window.SetCursor(IDC_ARROW);
						} else {
							window.SetCursor(IDC_ARROW);
						};
					};
					if (this.borderDragged) {
						for (var i = 0; i < this.borders.length; i++) {
							this.borders[i].on_mouse(event, x, y);
							var d = this.borders[i].delta;
							if (this.borders[i].drag) {
								var toDoLeft = (this.columns[this.borders[i].leftId].w + d > this.columns[this.borders[i].leftId].minWidth);
								var toDoRight = (this.columns[this.borders[i].rightId].w - d > this.columns[this.borders[i].rightId].minWidth);
								if (toDoLeft && toDoRight) { // 好，我们可以调整左右两列的大小
									this.columns[this.borders[i].leftId].w += d;
									this.columns[this.borders[i].rightId].w -= d;
									var addedPercent = Math.abs(this.columns[this.borders[i].leftId].percent) + Math.abs(this.columns[this.borders[i].rightId].percent);
									this.columns[this.borders[i].leftId].percent = Math.abs(this.columns[this.borders[i].leftId].w / this.w * 100000);
									this.columns[this.borders[i].rightId].percent = addedPercent - this.columns[this.borders[i].leftId].percent;
									this.borders[i].sourceX = x;
									full_repaint();
								};
							};
						};
					} else if (this.columnDraggedId != 0 && (this.columnDragged == 1 || this.columnDragged == 2)) {
						this.columnDragged = 2;
						window.SetCursor(IDC_SIZEALL);
						for (var i = 1; i < this.columns.length; i++) {
							if (this.columns[i].percent > 0) {
								if (i != this.columnDraggedId) {
									if ((x > mouse_x && x > this.columns[i].x && i > this.columnDraggedId) || (x < mouse_x && x < this.columns[i].x + this.columns[i].w && i < this.columnDraggedId)) {
										var tmpCol = this.columns[this.columnDraggedId];
										this.columns[this.columnDraggedId] = this.columns[i];
										this.columns[i] = tmpCol;
										// 同时移动 sortColumnId！
										if (i == this.sortedColumnId) {
											this.sortedColumnId = this.columnDraggedId;
										} else if (this.columnDraggedId == this.sortedColumnId) {
											this.sortedColumnId = i;
										};
										this.columnDraggedId = i;
										break;
									};
								};
							};
						};
						this.saveColumns();
						full_repaint();
					};
					break;
				case "leave":
					full_repaint();
					break;
				};
			};
		};
	};

	this.contextMenu = function (x, y, column_index) {
		var idx;
		var _menu = window.CreatePopupMenu();
		var _this = window.CreatePopupMenu();
		var _groups = window.CreatePopupMenu();
		var _sorts = window.CreatePopupMenu();
		var _patterns = window.CreatePopupMenu();
		var _collapsed_height = window.CreatePopupMenu();
		var _expanded_height = window.CreatePopupMenu();
		var _columns = window.CreatePopupMenu();
		var tmp = "",
		percents = [];

		// 检测活动播放列表是否按分组模式筛选
		var pl_name = plman.GetPlaylistName(plman.ActivePlaylist);
		var found = false;
		var default_pattern_index = -1;
		var playlist_pattern_index = -1;
		if (properties.enablePlaylistFilter) {
			// 获取筛选后的 groupBy 模式
			for (var m = 0; m < p.list.groupby.length; m++) {
				if (default_pattern_index > -1 && found) {
					break;
				} else if (p.list.groupby[m].playlistFilter.length > 0) {
					var arr_pl = p.list.groupby[m].playlistFilter.split(";");
					for (var n = 0; n < arr_pl.length; n++) {
						if (default_pattern_index < 0 && arr_pl[n] == "*") {
							default_pattern_index = m;
							playlist_pattern_index = (playlist_pattern_index < 0 ? m : playlist_pattern_index);
						};
						if (arr_pl[n] == pl_name) {
							found = true;
							playlist_pattern_index = m;
						};
					};
				};
			};
		};

		// 主菜单项
		if (fb.IsPlaying) {
			_menu.AppendMenuItem(MF_STRING, 10, "显示当前播放曲目");
			_menu.AppendMenuSeparator();
		};
		_menu.AppendMenuItem(MF_STRING, 11, "面板设置...");

		// 分组子菜单项
		_menu.AppendMenuSeparator();
		_menu.AppendMenuItem(MF_STRING, 13, "编辑分组...");
		_groups.AppendTo(_menu, MF_STRING, "分组");
		_groups.AppendMenuItem(MF_STRING, 18, "启用分组");
		_groups.CheckMenuItem(18, properties.showgroupheaders);

		if (properties.showgroupheaders) {
			_groups.AppendMenuItem(MF_STRING, 19, "启用播放列表过滤器");
			_groups.CheckMenuItem(19, properties.enablePlaylistFilter);

			_groups.AppendMenuSeparator();
			_patterns.AppendTo(_groups, MF_STRING, "更改分组模式");
			var groupByMenuIdx = 20;
			var totalGroupBy = p.list.groupby.length;
			for (var i = 0; i < totalGroupBy; i++) {
				_patterns.AppendMenuItem(((!found && default_pattern_index < 0) ? MF_STRING : MF_GRAYED | MF_DISABLED), groupByMenuIdx + i, p.list.groupby[i].label);
			};
			if (!found && default_pattern_index < 0) {
				_patterns.CheckMenuRadioItem(groupByMenuIdx, groupByMenuIdx + totalGroupBy - 1, cGroup.pattern_idx + groupByMenuIdx);
			} else {
				_patterns.CheckMenuRadioItem(groupByMenuIdx, groupByMenuIdx + totalGroupBy - 1, playlist_pattern_index + groupByMenuIdx);
			};

			_sorts.AppendTo(_groups, MF_STRING, "应用分组排序");
			var sortByMenuIdx = 50;
			for (var i = 0; i < totalGroupBy; i++) {
				_sorts.AppendMenuItem((p.list.groupby[i].sortOrder != "null" && ((!found && default_pattern_index < 0) || playlist_pattern_index == i) ? MF_STRING : MF_GRAYED | MF_DISABLED), sortByMenuIdx + i, p.list.groupby[i].label);
			};
			_groups.AppendMenuSeparator();
			_groups.AppendMenuItem(p.list.totalRows > 0 && !properties.autocollapse && cGroup.expanded_height > 0 && cGroup.collapsed_height > 0 ? MF_STRING : MF_GRAYED | MF_DISABLED, 80, "全部折叠");
			_groups.AppendMenuItem(p.list.totalRows > 0 && !properties.autocollapse && cGroup.expanded_height > 0 && cGroup.collapsed_height > 0 ? MF_STRING : MF_GRAYED | MF_DISABLED, 90, "全部展开");

		};

		// 列子菜单项
		var columnMenuIdx = 100;
		_menu.AppendMenuSeparator();
		_menu.AppendMenuItem(MF_STRING, 12, "编辑列...");
		_columns.AppendTo(_menu, MF_STRING, "分栏");
		_columns.AppendMenuItem(MF_STRING, 99, "两行附加信息");
		_columns.CheckMenuItem(99, cList.enableExtraLine ? 1 : 0);
		_columns.AppendMenuSeparator();
		for (var i = 0; i < this.columns.length; i++) {
			if (i == column_index) {
				_columns.AppendMenuItem(MF_STRING, columnMenuIdx + i, "[" + this.columns[i].label + "]");
			} else {
				_columns.AppendMenuItem(MF_STRING, columnMenuIdx + i, this.columns[i].label);
			};
			_columns.CheckMenuItem(columnMenuIdx + i, this.columns[i].w > 0 ? 1 : 0);
		};

		idx = _menu.TrackPopupMenu(x, y);
		switch (true) {
		case (idx == 10):
			p.list.showNowPlaying();
			break;
		case (idx == 11):
			p.settings.currentPageId = 0;
			var arr = [];
			for (var i = 0; i < p.headerBar.columns.length; i++) {
				arr.push(p.headerBar.columns[i].ref);
			};
			for (i = 0; i < p.settings.pages.length; i++) {
				p.settings.pages[i].reSet();
			};
			p.settings.pages[1].elements[0].reSet(arr);
			cSettings.visible = true;
			break;
		case (idx == 12):
			p.settings.currentPageId = 1;
			var arr = [];
			for (var i = 0; i < p.headerBar.columns.length; i++) {
				arr.push(p.headerBar.columns[i].ref);
			};
			for (i = 0; i < p.settings.pages.length; i++) {
				p.settings.pages[i].reSet();
			};
			p.settings.pages[1].elements[0].reSet(arr);
			p.settings.pages[1].elements[0].showSelected(column_index);
			cSettings.visible = true;
			break;
		case (idx == 13):
			p.settings.currentPageId = 2;
			var arr = [];
			for (var i = 0; i < p.list.groupby.length; i++) {
				arr.push(p.list.groupby[i].label);
			};
			for (i = 0; i < p.settings.pages.length; i++) {
				p.settings.pages[i].reSet();
			};
			p.settings.pages[2].elements[0].reSet(arr);
			p.settings.pages[2].elements[0].showSelected(cGroup.pattern_idx);
			cSettings.visible = true;
			break;
		case (idx == 18):
			if (properties.showgroupheaders) {
				properties.showgroupheaders = false;
			} else {
				properties.showgroupheaders = true;
			};
			window.SetProperty("*分组: 显示分组标题", properties.showgroupheaders);

			if (cGroup.collapsed_height > 0) {
				cGroup.collapsed_height = 0;
				cGroup.expanded_height = 0;
				// 无分组时禁用自动折叠！
				properties.autocollapse = false;
				window.SetProperty("系统.自动折叠", properties.autocollapse);
			} else {
				cGroup.collapsed_height = cGroup.default_collapsed_height;
				cGroup.expanded_height = cGroup.default_expanded_height;
			};

			// 刷新播放列表
			p.list.updateHandleList(plman.ActivePlaylist, false);
			p.list.setItems(true);
			p.scrollbar.setCursor(p.list.totalRowVisible, p.list.totalRows, p.list.offset);
			p.playlistManager.refresh("", false, false, false);
			break;
		case (idx == 19):
			properties.enablePlaylistFilter = !properties.enablePlaylistFilter;
			window.SetProperty("系统.启用播放列表筛选", properties.enablePlaylistFilter);
			// 刷新播放列表
			p.list.updateHandleList(plman.ActivePlaylist, false);
			p.list.setItems(true);
			p.scrollbar.setCursor(p.list.totalRowVisible, p.list.totalRows, p.list.offset);
			p.playlistManager.refresh("", false, false, false);
			break;
		case (idx >= 20 && idx < 50):
			cGroup.pattern_idx = idx - groupByMenuIdx;
			window.SetProperty("系统.分组.模式索引", cGroup.pattern_idx);
			// 若活动播放列表（当前）定义了播放列表筛选，请勿尝试更改当前模式！
			if (!found && default_pattern_index < 0) { // 未找到筛选，我们可以应用所选模式并对播放列表排序
				plman.SortByFormatV2(plman.ActivePlaylist, p.list.groupby[cGroup.pattern_idx].sortOrder, 1);
				p.list.updateHandleList(plman.ActivePlaylist, false);
				p.list.setItems(true);
				p.scrollbar.setCursor(p.list.totalRowVisible, p.list.totalRows, p.list.offset);
				full_repaint();
			};
			break;
		case (idx >= 50 && idx < 80):
			if ((!found && default_pattern_index < 0) || playlist_pattern_index == idx - sortByMenuIdx) {
				plman.SortByFormatV2(plman.ActivePlaylist, p.list.groupby[idx - sortByMenuIdx].sortOrder, 1);
			};
			break;
		case (idx == 80):
			resize_panels();
			p.list.updateHandleList(plman.ActivePlaylist, true);
			p.list.setItems(true);
			p.scrollbar.setCursor(p.list.totalRowVisible, p.list.totalRows, p.list.offset);
			break;
		case (idx == 90):
			resize_panels();
			p.list.updateHandleList(plman.ActivePlaylist, false);
			p.list.setItems(true);
			p.scrollbar.setCursor(p.list.totalRowVisible, p.list.totalRows, p.list.offset);
			break;
		case (idx == 99):
			cList.enableExtraLine = !cList.enableExtraLine;
			window.SetProperty("系统.启用额外行", cList.enableExtraLine);
			resize_panels();
			p.list.updateHandleList(plman.ActivePlaylist, false);
			p.list.setItems(true);
			p.scrollbar.setCursor(p.list.totalRowVisible, p.list.totalRows, p.list.offset);
			break;
		case (idx >= 100 && idx <= 200):
			// 所有尺寸更改均以 percent / ww 计
			if (this.columns[idx - 100].percent == 0) {
				var newColumnSize = 8000;
				this.columns[idx - 100].percent = newColumnSize;
				var totalColsToResizeDown = 0;
				var last_idx = 0;
				for (var k = 0; k < this.columns.length; k++) {
					if (k != idx - 100 && this.columns[k].percent > newColumnSize) {
						totalColsToResizeDown++;
						last_idx = k;
					};
				};
				var minus_value = Math.floor(newColumnSize / totalColsToResizeDown);
				var reste = newColumnSize - (minus_value * totalColsToResizeDown);
				for (var k = 0; k < this.columns.length; k++) {
					if (k != idx - 100 && this.columns[k].percent > newColumnSize) {
						this.columns[k].percent = Math.abs(this.columns[k].percent) - minus_value;
						if (reste > 0 && k == last_idx) {
							this.columns[k].percent = Math.abs(this.columns[k].percent) - reste;
						};
					};
					this.columns[k].w = Math.abs(this.w * this.columns[k].percent / 100000);
				};
				this.saveColumns();
			} else {
				// 检测是否不是最后一个可见列，否则我们无法隐藏它！
				var nbvis = 0;
				for (var k = 0; k < this.columns.length; k++) {
					if (this.columns[k].percent > 0) {
						nbvis++;
					};
				};
				if (nbvis > 1) {
					var RemovedColumnSize = Math.abs(this.columns[idx - 100].percent);
					this.columns[idx - 100].percent = 0;
					var totalColsToResizeUp = 0;
					var last_idx = 0;
					for (var k = 0; k < this.columns.length; k++) {
						if (k != idx - 100 && this.columns[k].percent > 0) {
							totalColsToResizeUp++;
							last_idx = k;
						};
					};
					var add_value = Math.floor(RemovedColumnSize / totalColsToResizeUp);
					var reste = RemovedColumnSize - (add_value * totalColsToResizeUp);
					for (var k = 0; k < this.columns.length; k++) {
						if (k != idx - 100 && this.columns[k].percent > 0) {
							this.columns[k].percent = Math.abs(this.columns[k].percent) + add_value;
							if (reste > 0 && k == last_idx) {
								this.columns[k].percent = Math.abs(this.columns[k].percent) + reste;
							};
						};
						this.columns[k].w = Math.abs(this.w * this.columns[k].percent / 100000);
					};
					this.saveColumns();
				};
			};
			this.initColumns();

			// 设置最小行/封面列尺寸
			if (this.columns[0].w > 0) {
				cover.column = true;
				cGroup.count_minimum = Math.ceil((this.columns[0].w) / cTrack.height);
				if (cGroup.count_minimum < cGroup.default_count_minimum)
					cGroup.count_minimum = cGroup.default_count_minimum;

				cover.previous_max_size = this.columns[0].w;
				g_image_cache = new image_cache;
			} else {
				cover.column = false;
				cGroup.count_minimum = cGroup.default_count_minimum;
			};
			update_playlist(properties.collapseGroupsByDefault);
			break;
		};
		this.columnRightClicked = -1;
		full_repaint();
		return true;
	};
};
