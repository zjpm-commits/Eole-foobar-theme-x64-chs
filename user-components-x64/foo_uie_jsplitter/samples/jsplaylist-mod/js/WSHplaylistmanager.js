// *****************************************************************************************************************************************
// 播放列表管理器对象，作者 Br3tt aka Falstaff (c)2015
// *****************************************************************************************************************************************

oPlaylist = function (idx, rowId, isAutoPl, parent, filter_type, filter_idx) {
	this.idx = idx;
	this.rowId = rowId;
	this.filter_type = filter_type;
	this.filter_idx = filter_idx;
	this.name = plman.GetPlaylistName(idx);
	this.isAutoPlaylist = isAutoPl;
	this.isReservedPlaylist = false;
	this.bt_remove = new button(parent.bt_remove_normal, parent.bt_remove_hover, parent.bt_remove_down);
	// 若该播放列表是面板的特殊/保留播放列表，则强制将其状态设为 "autoplaylist"
	if (!isAutoPl) {
		if (this.name == "Historic") {
			this.isReservedPlaylist = true;
		};
	};
	this.y = -1;
};

oPlaylistManager = function (obj_name) {
	this.objectName = obj_name;
	this.h = p.list.h;
	this.woffset = 0;
	this.border = 2.0;
	this.playlists = [];
	this.offset = 0;
	this.totalRows = Math.floor(this.area_h / cPlaylistManager.rowHeight);
	this.scrollbar = new oScrollBar(0, this.objectName + ".scrollbar", 0, 0, cScrollBar.width, 0, 0, cPlaylistManager.rowHeight, this.offset, this.objectName, true, 3, false);
	this.scrollbarWidth = 0;
	this.inputbox = null;
	this.inputboxID = -1;

	this.setButtons = function () {
		var color_txt = g_color_normal_txt;
		var color_bg = g_color_normal_bg;
		var bt_w = g_z16;
		var bt_h = g_z16;

		// Az 与 zA 变量
		var Az_h = cPlaylistManager.statusBarHeight;
		var Az_w = Math.floor(Az_h * 1.9);
		var left_padding = g_z2;
		var right_padding = zoom(4, g_dpi);

		// 普通 升序播放列表图像
		this.bt_sortAz_normal = gdi.CreateImage(Az_w, Az_h);
		var gb = this.bt_sortAz_normal.GetGraphics();
		gb.SetTextRenderingHint(3);
		gb.FillSolidRect(0, 0, 1, Az_h, blendColors(color_bg, color_txt, 0.35));
		gb.DrawString(String.fromCharCode(159), gdi_font(g_font_wd3.Name, g_fsize, 1), blendColors(color_bg, color_txt, 0.5), left_padding, 1, Az_w, Az_h, lc_stringformat);
		gb.DrawString("Az", g_font, blendColors(color_bg, color_txt, 0.5), 0, 0, Az_w - right_padding, Az_h, rc_stringformat);
		gb.FillSolidRect(Az_w - 1, 0, 1, Az_h, blendColors(color_bg, color_txt, 0.35));
		this.bt_sortAz_normal.ReleaseGraphics(gb);

		// 悬停 升序播放列表图像
		this.bt_sortAz_hover = gdi.CreateImage(Az_w, Az_h);
		var gb = this.bt_sortAz_hover.GetGraphics();
		gb.SetTextRenderingHint(3);
		gb.FillSolidRect(0, 0, 1, Az_h, blendColors(color_bg, color_txt, 0.35));
		gb.DrawString(String.fromCharCode(159), gdi_font(g_font_wd3.Name, g_fsize, 1), color_txt, left_padding, 1, Az_w, Az_h, lc_stringformat);
		gb.DrawString("Az", g_font, color_txt, 0, 0, Az_w - right_padding, Az_h, rc_stringformat);
		gb.FillSolidRect(Az_w - 1, 0, 1, Az_h, blendColors(color_bg, color_txt, 0.35));
		this.bt_sortAz_hover.ReleaseGraphics(gb);

		this.sortAz_button = new button(this.bt_sortAz_normal, this.bt_sortAz_hover, this.bt_sortAz_hover);

		// 普通 降序播放列表图像
		this.bt_sortZa_normal = gdi.CreateImage(Az_w, Az_h);
		var gb = this.bt_sortZa_normal.GetGraphics();
		gb.SetTextRenderingHint(3);
		gb.DrawString(String.fromCharCode(160), gdi_font(g_font_wd3.Name, g_fsize, 1), blendColors(color_bg, color_txt, 0.5), left_padding, 1, Az_w, Az_h, lc_stringformat);
		gb.DrawString("Za  ", g_font, blendColors(color_bg, color_txt, 0.5), 0, 0, Az_w - right_padding, Az_h, rc_stringformat);
		gb.FillSolidRect(Az_w - 1, 0, 1, Az_h, blendColors(color_bg, color_txt, 0.35));
		this.bt_sortZa_normal.ReleaseGraphics(gb);

		// 悬停 降序播放列表图像
		this.bt_sortZa_hover = gdi.CreateImage(Az_w, Az_h);
		var gb = this.bt_sortZa_hover.GetGraphics();
		gb.SetTextRenderingHint(3);
		gb.DrawString(String.fromCharCode(160), gdi_font(g_font_wd3.Name, g_fsize, 1), color_txt, left_padding, 1, Az_w, Az_h, lc_stringformat);
		gb.DrawString("Za  ", g_font, color_txt, 0, 0, Az_w - right_padding, Az_h, rc_stringformat);
		gb.FillSolidRect(Az_w - 1, 0, 1, Az_h, blendColors(color_bg, color_txt, 0.35));
		this.bt_sortZa_hover.ReleaseGraphics(gb);

		this.sortZa_button = new button(this.bt_sortZa_normal, this.bt_sortZa_hover, this.bt_sortZa_hover);

		// 普通删除播放列表图像
		this.bt_remove_normal = gdi.CreateImage(bt_w, bt_h);
		var gb = this.bt_remove_normal.GetGraphics();
		gb.SetTextRenderingHint(4);
		gb.DrawString(String.fromCharCode(209), gdi_font(g_font_wd2.Name, g_font_wd2.Size - g_z8, 0), blendColors(color_bg, color_txt, 0.5), 0, 0, bt_w, bt_h, cc_stringformat);
		this.bt_remove_normal.ReleaseGraphics(gb);

		// 悬停删除播放列表图像
		this.bt_remove_hover = gdi.CreateImage(bt_w, bt_h);
		gb = this.bt_remove_hover.GetGraphics();
		gb.SetTextRenderingHint(4);
		gb.DrawString(String.fromCharCode(209), gdi_font(g_font_wd2.Name, g_font_wd2.Size - g_z2, 0), RGB(255, 0, 0), 0, 0, bt_w, bt_h, cc_stringformat);
		this.bt_remove_hover.ReleaseGraphics(gb);

		// 按下删除播放列表图像
		this.bt_remove_down = gdi.CreateImage(bt_w, bt_h);
		gb = this.bt_remove_down.GetGraphics();
		gb.SetTextRenderingHint(4);
		gb.DrawString(String.fromCharCode(209), gdi_font(g_font_wd2.Name, g_font_wd2.Size - g_z2, 0), color_txt, 0, 0, bt_w, bt_h, cc_stringformat);
		this.bt_remove_down.ReleaseGraphics(gb);
	};

	this.setColors = function () {
		this.color_txt = g_color_normal_txt;
		this.color_bg = g_color_normal_bg;
		this.color_sel = g_color_selected_bg;
		this.color_high = g_color_highlight;
		this.scrollbar.setDefaultColors();
		this.setButtons();
	};
	this.setColors();

	this.repaint = function () {
		window.RepaintRect(this.x - this.woffset, this.y, this.w, this.h);
	};

	this.setSize = function (x, y, w, h) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;

		if (cPlaylistManager.visible) {
			this.woffset = this.w;
		} else {
			this.woffset = 0;
		};

		this.totalRows = Math.floor((h - cPlaylistManager.rowHeight - (cPlaylistManager.showStatusBar ? cPlaylistManager.statusBarHeight : 0)) / cPlaylistManager.rowHeight);
		this.offset = 0;

		// 滚动条调整大小
		this.scrollbar.reSize(this.x - this.woffset + this.w - cScrollBar.width, this.y + cPlaylistManager.rowHeight, cScrollBar.width, this.h - cPlaylistManager.rowHeight - (cPlaylistManager.showStatusBar ? cPlaylistManager.statusBarHeight : 0), 0, cPlaylistManager.rowHeight, this.offset);
		if (this.scrollbar.visible) {
			this.scrollbarWidth = this.scrollbar.w;
		} else {
			this.scrollbarWidth = 0;
		};
	};

	this.refresh = function (filter, exclude_autoplaylists, exclude_active, reset_offset) {
		this.playlists.splice(0, this.playlists.length);
		this.total = plman.PlaylistCount;
		var rowId = 0;
		var isAutoPl = false;
		var isReserved = false;
		var plname = null;
		for (var idx = 0; idx < this.total; idx++) {
			plname = plman.GetPlaylistName(idx);
			isAutoPl = plman.IsAutoPlaylist(idx);
			isReserved = plname == "Historic";

			// 播放列表是否按 groupBy 模式进行了筛选
			var found = false;
			var default_pattern_index = -1;
			var playlist_pattern_index = -1;
			if (properties.showgroupheaders && properties.enablePlaylistFilter) {
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
							if (arr_pl[n] == plname) {
								found = true;
								playlist_pattern_index = m;
							};
						};
					};
				};
			};
			if (found) {
				var filter_type = 1;
			} else if (default_pattern_index > -1) {
				var filter_type = 2;
			} else {
				var filter_type = 0;
			};

			if (!exclude_autoplaylists || (!isAutoPl && !isReserved)) {
				if (idx == plman.ActivePlaylist) {
					if (!exclude_active) {
						this.playlists.push(new oPlaylist(idx, rowId, isAutoPl, this, filter_type, playlist_pattern_index));
						rowId++;
					};
				} else {
					this.playlists.push(new oPlaylist(idx, rowId, isAutoPl, this, filter_type, playlist_pattern_index));
					rowId++;
				};
			};
		};
		this.rowTotal = rowId;
		// 滚动条设置
		this.max = (this.rowTotal > this.totalRows ? this.totalRows : this.rowTotal);
		// 滚动条重置
		if (reset_offset)
			this.offset = 0;

		this.scrollbar.reSet(this.rowTotal, cPlaylistManager.rowHeight, this.offset);
		if (this.scrollbar.visible) {
			this.scrollbarWidth = this.scrollbar.w;
		} else {
			this.scrollbarWidth = 0;
		};
	};

	this.draw = function (gr) {

		if (cPlaylistManager.playlist_switch_pending) {
			window.SetCursor(IDC_ARROW);
			cPlaylistManager.playlist_switch_pending = false;
		};

		var cx,
		cy,
		cw,
		ch,
		iconw = 0,
		row_idx = 0,
		t = 0,
		tw = 0;
		var txt_color,
		icon_char,
		xoffset;
		var bt_w = this.bt_remove_normal.Width;

		if (this.woffset > 0) {
			// 面板背景
			gr.FillSolidRect(this.x - this.woffset, this.y + this.border, 1.0, this.h - this.border, RGBA(0, 0, 0, 10));
			gr.FillSolidRect(this.x - this.woffset + 1, this.y + this.border, 1.0, this.h - this.border, RGBA(0, 0, 0, 30));
			gr.FillSolidRect(this.x - this.woffset + this.border, this.y, this.w - this.border, this.h, blendColors(this.color_bg, this.color_txt, 0.01) & 0xf0ffffff);
			gr.DrawRect(this.x - this.woffset + this.border, this.y, this.w - this.border, this.h, 1.0, this.color_txt & 0x50ffffff);

			// 尺寸
			cx = this.x - this.woffset + this.border + 5.0;
			cw = this.w - this.border - this.scrollbarWidth - 10.0;
			ch = cPlaylistManager.rowHeight;
			cy = this.y;

			// 面板标题
			if (this.ishoverHeader) {
				if (dragndrop.moved || g_dragndrop_hover_playlistManager) {
					gr.FillSolidRect(this.x - this.woffset + this.border, cy, this.w - this.border, ch - 1, this.color_sel & 0x25ffffff);
					gr.DrawRect(this.x - this.woffset + this.border + 1, cy + 1, this.w - this.border - 2, ch - 1 - 2, 2.0, this.color_sel);
					// 文本
					iconw = gr.CalcTextWidth(String.fromCharCode(201), g_font_wd2);
					gr.GdiDrawText(String.fromCharCode(201), g_font_wd2, blendColors(this.color_txt, this.color_bg, 0.25), cx, cy, iconw, ch, DT_LEFT | DT_CALCRECT | DT_VCENTER | DT_END_ELLIPSIS | DT_NOPREFIX);
					gr.GdiDrawText("拖到新播放列表", g_font, blendColors(this.color_txt, this.color_bg, 0.25), cx + iconw + 5, cy, cw - iconw - 10, ch, DT_LEFT | DT_CALCRECT | DT_VCENTER | DT_END_ELLIPSIS | DT_NOPREFIX);
				} else {
					gr.FillGradRect(this.x - this.woffset + this.border, cy, this.w - this.border, ch - 1, 90, this.color_txt & 0x15ffffff, 0, 0.96);
					// 文本
					gr.GdiDrawText("播放列表", g_font, blendColors(this.color_txt, this.color_bg, 0.25), cx, cy, cw - 5, ch, DT_LEFT | DT_CALCRECT | DT_VCENTER | DT_END_ELLIPSIS | DT_NOPREFIX);
				};
			} else {
				if (dragndrop.moved || g_dragndrop_hover_playlistManager) {
					gr.FillGradRect(this.x - this.woffset + this.border, cy, this.w - this.border, ch - 1, 90, this.color_txt & 0x15ffffff, 0, 0.96);
					// 文本
					iconw = gr.CalcTextWidth(String.fromCharCode(201), g_font_wd2);
					gr.GdiDrawText(String.fromCharCode(201), g_font_wd2, blendColors(this.color_txt, this.color_bg, 0.25), cx, cy, iconw, ch, DT_LEFT | DT_CALCRECT | DT_VCENTER | DT_END_ELLIPSIS | DT_NOPREFIX);
					gr.GdiDrawText("拖到新播放列表", g_font, blendColors(this.color_txt, this.color_bg, 0.25), cx + iconw + 5, cy, cw - iconw - 10, ch, DT_LEFT | DT_CALCRECT | DT_VCENTER | DT_END_ELLIPSIS | DT_NOPREFIX);
				} else {
					gr.FillGradRect(this.x - this.woffset + this.border, cy, this.w - this.border, ch - 1, 90, this.color_txt & 0x15ffffff, 0, 0.96);
					// 文本
					gr.GdiDrawText("播放列表", g_font, blendColors(this.color_txt, this.color_bg, 0.25), cx, cy, cw - 5, ch, DT_LEFT | DT_CALCRECT | DT_VCENTER | DT_END_ELLIPSIS | DT_NOPREFIX);
				};
			};
			gr.FillSolidRect(this.x - this.woffset + this.border, cy + ch - 2, this.w - this.border, 1, g_color_normal_txt & 0x30ffffff);
			// 拖放后在 lbtn_up 时绘制闪烁的标题
			if (cPlaylistManager.blink_counter > -1) {
				if (cPlaylistManager.blink_id == -1) {
					if (cPlaylistManager.blink_counter <= 5 && Math.floor(cPlaylistManager.blink_counter / 2) == Math.ceil(cPlaylistManager.blink_counter / 2)) {
						gr.DrawRect(this.x - this.woffset + this.border + 1, cy + 1, this.w - this.border - 2, ch - 3, 2.0, this.color_sel);
					};
				};
			};

			cx = this.x - this.woffset + this.border;
			for (var i = this.offset; i < this.playlists.length; i++) {
				cy = this.y + cPlaylistManager.rowHeight + row_idx * ch;
				this.playlists[i].y = cy;
				if (cPlaylistManager.visible) {
					if (this.playlists[i].idx == plman.ActivePlaylist) {
						if (g_dragndrop_hover_playlistManager) {
							if (i == this.hoverId && !this.playlists[i].isAutoPlaylist && !this.playlists[i].isReservedPlaylist) { // 可拖放
								gr.FillSolidRect(cx + 1, cy + 1 - 0001, this.w - this.border - this.scrollbarWidth - 2 + 0001, ch - 2 + 0001, this.color_sel & RGBA(255, 255, 255, properties.selection_rect_alpha));
								gr.DrawRect(cx + 1, cy + 000, this.w - this.border - this.scrollbarWidth - 002, ch - 002, 2.0, this.color_sel);
							} else { // 不可拖放（自动播放列表或保留播放列表）
								if (this.playlists[i].isAutoPlaylist || this.playlists[i].isReservedPlaylist || i == plman.ActivePlaylist) {
									// 不可拖放（自动播放列表或保留播放列表）
									//gr.FillSolidRect(cx+1, cy, this.w-this.border-this.scrollbarWidth-2, ch-1, blendColors(this.color_txt, this.color_bg, 0.85));
								};
							};
						} else {
							if (!dragndrop.moved) {
								// 活动播放列表背景（未拖动）
								gr.FillSolidRect(cx + 1, cy - 0001, this.w - this.border - this.scrollbarWidth - 2 + 0001, ch - 1 + 0001, this.color_sel & RGBA(255, 255, 255, properties.selection_rect_alpha));
							} else {
								// 活动播放列表背景（拖动时）
								gr.FillSolidRect(cx + 1, cy, this.w - this.border - this.scrollbarWidth - 2, ch - 1, blendColors(this.color_txt, this.color_bg, 0.85));
							};
						};
					} else if (dragndrop.moved || g_dragndrop_hover_playlistManager) { // 拖动时的其他播放列表
						if (i == this.hoverId && !this.playlists[i].isAutoPlaylist && !this.playlists[i].isReservedPlaylist) { // 可拖放
							gr.FillSolidRect(cx + 1, cy + 1 - 0001, this.w - this.border - this.scrollbarWidth - 2 + 0001, ch - 2 + 0001, this.color_sel & RGBA(255, 255, 255, properties.selection_rect_alpha));
							gr.DrawRect(cx + 1, cy + 000, this.w - this.border - this.scrollbarWidth - 002, ch - 002, 2.0, this.color_sel);
						} else { // 不可拖放（自动播放列表或保留播放列表）
							if (this.playlists[i].isAutoPlaylist || this.playlists[i].isReservedPlaylist || i == plman.ActivePlaylist) {
								// 不可拖放（自动播放列表或保留播放列表）
								gr.FillSolidRect(cx + 1, cy, this.w - this.border - this.scrollbarWidth - 2, ch - 1, blendColors(this.color_txt, this.color_bg, 0.85));
							};
						};
					};
				} else {
					if (i == this.hoverId) {
						if (dragndrop.moved) {
							gr.FillSolidRect(this.x - this.woffset + this.border, cy + 1.0 - 0001, this.w - this.border - this.scrollbarWidth - 1 + 0001, ch - 2.0 + 0001, this.color_sel & RGBA(255, 255, 255, properties.selection_rect_alpha));
							gr.DrawRect(cx + 1, cy + 000, this.w - this.border - this.scrollbarWidth - 002, ch - 002, 2.0, this.color_sel);
						};
					} else {
						gr.FillSolidRect(cx + 1, cy + 1, this.w - this.border - this.scrollbarWidth - 2, ch - 2, this.color_bg & 0x15ffffff);
					};
				};

				// ** 项目背景 **
				if (!(dragndrop.moved && (this.playlists[i].isAutoPlaylist || this.playlists[i].isReservedPlaylist || (i == plman.ActivePlaylist && cPlaylistManager.visible)))) {
					gr.FillSolidRect(cx + 1, cy, this.w - this.border - this.scrollbarWidth - 2, ch - 1, this.color_txt & 0x10ffffff);
					gr.FillSolidRect(this.x - this.woffset + this.border, cy + ch - 2, this.w - this.border - this.scrollbarWidth, 1.0, g_color_normal_txt & 0x20ffffff);
				};

				// 右键点击的项目
				if (cPlaylistManager.rightClickedId == i) {
					gr.DrawRect(cx + 1, cy + 000, this.w - this.border - this.scrollbarWidth - 002, ch - 002, 2.0, this.color_sel);
				};

				// 拖放后在 lbtn_up 时绘制闪烁的项目
				if (cPlaylistManager.blink_counter > -1) {
					if (i == cPlaylistManager.blink_id) {
						if (cPlaylistManager.blink_counter <= 5 && Math.floor(cPlaylistManager.blink_counter / 2) == Math.ceil(cPlaylistManager.blink_counter / 2)) {
							gr.DrawRect(cx + 1, cy + 1, this.w - this.border - this.scrollbarWidth - 3, ch - 3, 2.0, this.color_sel);
						};
					};
				};
				// 若为自动播放列表或活动播放列表 > 项目不可拖放
				if (dragndrop.moved && (this.playlists[i].isAutoPlaylist || this.playlists[i].isReservedPlaylist || (i == plman.ActivePlaylist && cPlaylistManager.visible))) {
					txt_color = blendColors(this.color_txt, this.color_bg, 0.45);
				} else {
					txt_color = this.color_txt;
				};

				// 图标
				var icon_color = null;
				if (this.playlists[i].idx == plman.ActivePlaylist) {
					if (this.playlists[i].idx == plman.PlayingPlaylist) {
						icon_color = blendColors(this.color_high, this.color_bg, 0.1);
					} else {
						icon_color = blendColors(this.color_sel, this.color_txt, 0.1);
					};
				} else {
					if (this.playlists[i].idx == plman.PlayingPlaylist && fb.IsPlaying) {
						icon_color = blendColors(this.color_high, this.color_bg, 0.1);
					} else {
						icon_color = this.color_txt;
					};
				};
				if (cPlaylistManager.mediaLibraryPlaylist && i == 0 && cPlaylistManager.visible) {
					iconw = gr.CalcTextWidth(String.fromCharCode(46), g_font_wd2);
					icon_char = String.fromCharCode(46);
					gr.SetTextRenderingHint(5);
					gr.DrawString(icon_char, g_font_wd2, blendColors(icon_color, this.color_bg, 0.35), cx + 5, cy - 3, iconw, ch, lc_stringformat);
				} else {
					iconw = gr.CalcTextWidth(String.fromCharCode(46), g_font_wd2);
					icon_char = (this.playlists[i].isReservedPlaylist ? String.fromCharCode(45) : (this.playlists[i].isAutoPlaylist ? String.fromCharCode(44) : String.fromCharCode(41)));
					gr.SetTextRenderingHint(5);
					gr.DrawString(icon_char, g_font_wd2, blendColors(icon_color, this.color_bg, 0.35), cx + 5, cy - 1, iconw, ch, lc_stringformat);
				};

				// 若请求重命名则绘制输入框
				if (this.inputboxID == i) {
					this.inputbox.draw(gr, this.x - this.woffset + this.border + 10.0 + iconw, cy + 5);
				} else {
					// 设置文本颜色与字体
					if (this.playlists[i].idx == plman.ActivePlaylist) {
						if (this.playlists[i].idx == plman.PlayingPlaylist) {
							txt_color = blendColors(this.color_high, this.color_bg, 0.1);
						} else {
							txt_color = blendColors(this.color_sel, this.color_txt, 0.1);
						};
					} else {
						if (this.playlists[i].idx == plman.PlayingPlaylist && fb.IsPlaying) {
							txt_color = blendColors(this.color_high, this.color_bg, 0.1);
						} else {
							txt_color = this.color_txt;
						};
					};

					// 播放列表项目总数
					if (cPlaylistManager.showTotalItems) {
						t = plman.PlaylistItemCount(this.playlists[i].idx);
						tw = gr.CalcTextWidth(t, gdi_font(g_fname, g_fsize - 1, 0)) + 5;
						gr.GdiDrawText(t, gdi_font(g_fname, g_fsize - 1, 0), blendColors(txt_color, this.color_bg, 0.35), cx + 5 + iconw + 5, cy, cw - iconw - 5 - bt_w, ch, DT_RIGHT | DT_CALCRECT | DT_VCENTER | DT_END_ELLIPSIS | DT_NOPREFIX);
					} else {
						tw = 0;
					};

					// 绘制播放列表名
					gr.GdiDrawText(this.playlists[i].name, g_font, txt_color, cx + 5 + iconw + 4, cy, cw - iconw - 4 - tw - bt_w, ch, DT_LEFT | DT_CALCRECT | DT_VCENTER | DT_END_ELLIPSIS | DT_NOPREFIX);
					// 若为此播放列表设置了播放列表筛选则添加标记
					if (this.playlists[i].filter_type > 0) {
						gr.GdiDrawText(String.fromCharCode(this.playlists[i].filter_type == 1 ? 162 : 163), gdi_font(g_font_wd2.Name, g_font_wd2.Size - zoom(14, g_dpi), 0), txt_color, cx + 5 + iconw + 5, cy - zoom(4, g_dpi), cw - iconw - zoom(6.0, g_dpi), ch, DT_RIGHT | DT_CALCRECT | DT_BOTTOM | DT_END_ELLIPSIS | DT_NOPREFIX);
					};

					// 绘制删除按钮
					if (!(cPlaylistManager.mediaLibraryPlaylist && i == 0)) {
						this.playlists[i].bt_remove.draw(gr, cx + cw - bt_w + 9, cy + 2, 255);
					};
				};

				// 拖动播放列表项目时绘制"拖放目标条"
				if (this.ishoverItem && !cPlaylistManager.vscroll_timer) {
					if (cPlaylistManager.drag_target_id == this.rowTotal) {
						//gr.DrawRect(cx+1, this.playlists[this.rowTotal-1].y + cPlaylistManager.rowHeight, this.w-this.border-this.scrollbarWidth-3, 1, 2.0, this.color_sel);
					} else if (cPlaylistManager.drag_target_id == i) {
						if (cPlaylistManager.drag_target_id > cPlaylistManager.drag_source_id) {
							gr.DrawRect(cx + 1, cy + cPlaylistManager.rowHeight, this.w - this.border - this.scrollbarWidth - 2, 1, 2.0, this.color_sel);
						} else if (cPlaylistManager.drag_target_id < cPlaylistManager.drag_source_id) {
							gr.DrawRect(cx + 1, cy, this.w - this.border - this.scrollbarWidth - 2, 1, 2.0, this.color_sel);
						};
					};
				} else {
					cPlaylistManager.drag_target_id = -1;
				};

				row_idx++;
			};

			// 面板页脚
			if (cPlaylistManager.showStatusBar) {
				var fx = this.x - this.woffset + this.border;
				var fy = this.y + this.h - cPlaylistManager.statusBarHeight;
				var fw = this.w - this.border;
				var fh = cPlaylistManager.statusBarHeight;
				gr.FillSolidRect(fx, fy, fw, fh, blendColors(this.color_bg, this.color_txt, 0.01) & 0xf0ffffff);
				gr.FillGradRect(fx, fy, fw, fh, 90, this.color_txt & 0x15ffffff, 0, 0.96);
				gr.FillSolidRect(fx, fy, fw, 1.0, this.color_txt & 0x50ffffff);
				var status_txt = this.playlists.length + (this.playlists.length > 1 ? " 个播放列表" : " 个播放列表");
				gr.GdiDrawText(status_txt, gdi_font(g_fname, g_fsize - 2, 0), blendColors(this.color_txt, this.color_bg, 0.25), fx + 5, fy, fw - 10, fh, DT_RIGHT | DT_CALCRECT | DT_VCENTER | DT_END_ELLIPSIS | DT_NOPREFIX);
				// 绘制排序按钮
				this.sortAz_button.draw(gr, fx, fy, 255);
				this.sortZa_button.draw(gr, fx + this.sortAz_button.img[0].Width, fy, 255);
			};

			// 绘制滚动条
			if (this.scrollbarWidth > 0) {
				this.scrollbar.drawXY(gr, this.x - this.woffset + this.w - this.scrollbarWidth, this.y + cPlaylistManager.rowHeight);
			};
		};
	};

	this.isHoverObject = function (x, y) {
		return (x > this.x - this.woffset && x < this.x - this.woffset + this.w - this.scrollbarWidth && y > this.y && y < this.y + this.h);
	};

	this.check = function (event, x, y, delta) {
		this.ishover = this.isHoverObject(x, y);
		this.ishoverHeader = (x > this.x - this.woffset && x < this.x - this.woffset + this.w + this.scrollbarWidth && y > this.y && y <= this.y + cPlaylistManager.rowHeight); //this.ishover && !this.ishoverItem;

		this.ishoverItem = (x > this.x - this.woffset && x < this.x - this.woffset + this.w - this.scrollbarWidth && y > this.y + cPlaylistManager.rowHeight && y < this.y + this.h);
		if (this.ishoverItem) {
			this.hoverId = Math.floor((y - ((this.y + cPlaylistManager.rowHeight) - this.offset * cPlaylistManager.rowHeight)) / cPlaylistManager.rowHeight); // hoverId = 列表中的行 Id
			if (this.hoverId >= this.playlists.length)
				this.hoverId = -1;
		} else {
			this.hoverId = -1;
		};

		if (this.hoverId > -1) {
			if (this.hoverId == this.inputboxID) {
				this.inputbox_ishover = (x > this.inputbox.x - 3 && x < this.inputbox.x + this.inputbox.w + 6 && y > this.inputbox.y && y < this.inputbox.y + this.inputbox.h);
				this.ishover = this.ishover ? (this.inputbox_ishover ? false : true) : false;
			} else {
				this.inputbox_ishover = false;
			};
		};

		switch (event) {
		case "down":
			if (!dragndrop.moved) {

				this.sortAz_button.checkstate(event, x, y);
				this.sortZa_button.checkstate(event, x, y);

				if (this.inputboxID >= 0) {
					this.inputbox.check("down", x, y);
				};
				if (this.hoverId > -1 && this.inputboxID == -1) {

					// 检测删除按钮
					if (!(cPlaylistManager.mediaLibraryPlaylist && this.hoverId == 0) && this.playlists[this.hoverId].bt_remove.checkstate(event, x, y) == ButtonStates.down) {
						//
					} else {
						if (plman.ActivePlaylist != this.hoverId) {
							plman.ActivePlaylist = this.hoverId;
							cPlaylistManager.playlist_switch_pending = true;
							window.SetCursor(IDC_WAIT);
						};
						if (cPlaylistManager.visible) {
							// 准备拖动项目以重新排序列表
							cPlaylistManager.drag_clicked = true;
							cPlaylistManager.drag_x = x;
							cPlaylistManager.drag_y = y;
							cPlaylistManager.drag_source_id = this.hoverId;
						};
					};

				} else if (this.scrollbar.visible) {
					this.scrollbar.check(event, x, y, delta);
				};
			};
			break;
		case "dblclk":
			this.check("down", x, y);
			break;
		case "right":
			if (this.inputboxID >= 0) {
				this.inputbox.check("right", x, y);
			} else {
				if (this.hoverId > -1 && this.inputboxID == -1) {
					cPlaylistManager.rightClickedId = this.hoverId;
					full_repaint();
					if (!utils.IsKeyPressed(VK_SHIFT)) {
						this.contextMenu(x, y, this.playlists[this.hoverId].idx);
					};
				} else if (this.ishover && this.inputboxID == -1) {
					if (!utils.IsKeyPressed(VK_SHIFT)) {
						this.contextMenu(x, y, null);
					};
				};
			};
			break;
		case "up":
			if (this.inputboxID >= 0) {
				this.inputbox.check("up", x, y);
			} else {
				if (this.scrollbar.visible && !dragndrop.moved)
					this.scrollbar.check(event, x, y, delta);
				if (dragndrop.moved) {
					var drop_done = false;
					// 仅当目标不是自动播放列表且不是活动播放列表时才可拖放
					if (this.hoverId > -1 && this.hoverId < this.playlists.length && !this.playlists[this.hoverId].isAutoPlaylist && !this.playlists[this.hoverId].isReservedPlaylist && this.playlists[this.hoverId].idx != plman.ActivePlaylist) {
						drop_done = true;
						plman.UndoBackup(this.playlists[this.hoverId].idx);
						plman.InsertPlaylistItems(this.playlists[this.hoverId].idx, plman.PlaylistItemCount(this.playlists[this.hoverId].idx), p.list.metadblist_selection, false);
					} else if (this.ishoverHeader) {
						drop_done = true;
						var new_playlist_idx = plman.PlaylistCount;
						plman.CreatePlaylist(new_playlist_idx, "");
						plman.InsertPlaylistItems(new_playlist_idx, 0, p.list.metadblist_selection, false);
					};
					if (drop_done) {
						if (!cPlaylistManager.blink_timer) { // 创建计时器，使曲目被拖放到的播放列表项目闪烁！
							cPlaylistManager.blink_x = x;
							cPlaylistManager.blink_y = y;
							cPlaylistManager.blink_totaltracks = p.list.metadblist_selection.Count;
							cPlaylistManager.blink_id = this.hoverId;
							cPlaylistManager.blink_counter = 0;
							cPlaylistManager.blink_timer = window.SetInterval(function () {
									cPlaylistManager.blink_counter++;
									if (cPlaylistManager.blink_counter > (cPlaylistManager.visible ? 5 : 10)) {
										window.ClearInterval(cPlaylistManager.blink_timer);
										cPlaylistManager.blink_timer = false;
										cPlaylistManager.blink_counter = -1;
										cPlaylistManager.blink_id = null;
									};
									full_repaint();
								}, 125);
						};
					};
				} else {
					if (this.sortAz_button.checkstate(event, x, y) == ButtonStates.hover) {
						plman.SortPlaylistsByName(1);
						this.refresh("", false, false, false);
						full_repaint();
					};
					if (this.sortZa_button.checkstate(event, x, y) == ButtonStates.hover) {
						plman.SortPlaylistsByName(-1);
						this.refresh("", false, false, false);
						full_repaint();
					} else {
						// 检测删除按钮
						var deb = (cPlaylistManager.mediaLibraryPlaylist ? 1 : 0);
						for (var pl = deb; pl < this.playlists.length; pl++) {
							if (this.playlists[pl].bt_remove.checkstate(event, x, y) == ButtonStates.hover) {
								plman.RemovePlaylistSwitch(pl);
								if (this.offset > 0 && this.offset >= this.playlists.length - Math.floor((this.h - (cPlaylistManager.showStatusBar ? cPlaylistManager.statusBarHeight : 0)) / cPlaylistManager.rowHeight)) {
									this.offset--;
									this.refresh("", false, false, false);
								};
							};
						};
					};
				};

				// 若默认不可见则隐藏播放列表管理器面板
				if (!cPlaylistManager.visible) {
					if (cPlaylistManager.hscroll_timer) {
						window.ClearTimeout(cPlaylistManager.hscroll_timer);
						cPlaylistManager.hscroll_timer = false;
					};
					if (p.playlistManager.woffset > 0) { // 若面板已打开
						cPlaylistManager.hscroll_timer = window.SetInterval(function () {
								full_repaint();
								if (!cPlaylistManager.blink_timer) { // 我们等待闪烁计时器结束，再将播放列表管理器面板向右折叠
									p.playlistManager.woffset -= cPlaylistManager.step;
								};
								if (p.playlistManager.woffset <= 0) {
									p.playlistManager.woffset = 0;
									cPlaylistManager.hscroll_timer && window.ClearTimeout(cPlaylistManager.hscroll_timer);
									cPlaylistManager.hscroll_timer = false;
									full_repaint();
								};
							}, 16);
					};
				};

				// 拖放项目播放列表
				if (cPlaylistManager.drag_target_id > -1) {
					if (cPlaylistManager.drag_target_id == this.rowTotal) {
						plman.MovePlaylist(this.playlists[cPlaylistManager.drag_source_id].idx, this.playlists[this.rowTotal - 1].idx);
					} else {
						cPlaylistManager.drag_droped = (cPlaylistManager.drag_source_id != cPlaylistManager.drag_target_id);
						if (cPlaylistManager.drag_target_id < cPlaylistManager.drag_source_id) {
							plman.MovePlaylist(this.playlists[cPlaylistManager.drag_source_id].idx, this.playlists[cPlaylistManager.drag_target_id].idx);
						} else if (cPlaylistManager.drag_target_id > cPlaylistManager.drag_source_id) {
							plman.MovePlaylist(this.playlists[cPlaylistManager.drag_source_id].idx, this.playlists[cPlaylistManager.drag_target_id].idx);
						};
					};
				};

			};

			if (cPlaylistManager.drag_moved)
				window.SetCursor(IDC_ARROW);

			cPlaylistManager.drag_clicked = false;
			cPlaylistManager.drag_moved = false;
			cPlaylistManager.drag_source_id = -1;
			cPlaylistManager.drag_target_id = -1;
			cPlaylistManager.drag_x = -1;
			cPlaylistManager.drag_y = -1;
			break;
		case "drag_over":
			g_dragndrop_targetPlaylistId = this.hoverId;
			break;
		case "move":
			if (!dragndrop.moved && !cPlaylistManager.drag_clicked) {
				this.sortAz_button.checkstate(event, x, y);
				this.sortZa_button.checkstate(event, x, y);
			};

			if (this.inputboxID >= 0) {
				this.inputbox.check("move", x, y);
			} else {
				if (this.scrollbar.visible && !dragndrop.moved)
					this.scrollbar.check(event, x, y, delta);
				if (cPlaylistManager.drag_moved) {
					if (!this.ishoverHeader) {
						if (this.hoverId > -1 && this.hoverId != cPlaylistManager.drag_source_id) {
							cPlaylistManager.drag_target_id = this.hoverId;
						} else if (y > this.playlists[this.rowTotal - 1].y + cPlaylistManager.rowHeight && y < this.playlists[this.rowTotal - 1].y + cPlaylistManager.rowHeight * 2) {
							cPlaylistManager.drag_target_id = this.rowTotal;
						} else {
							cPlaylistManager.drag_target_id = -1;
						};
					};
				} else {

					// 检测删除按钮
					if (!dragndrop.moved) {
						var deb = (cPlaylistManager.mediaLibraryPlaylist ? 1 : 0);
						for (var pl = deb; pl < this.playlists.length; pl++) {
							this.playlists[pl].bt_remove.checkstate(event, x, y);
						};
					};

					if (cPlaylistManager.drag_clicked) {
						cPlaylistManager.drag_moved = true;
					} else {
						if (dragndrop.moved) {
							if (!cPlaylistManager.drag_move_timer) {
								full_repaint();
								cPlaylistManager.drag_move_timer = window.SetTimeout(function () {
										full_repaint();
										window.ClearInterval(cPlaylistManager.drag_move_timer);
										cPlaylistManager.drag_move_timer = false;
									}, 50);
							};
						} else {
							if (cPlaylistManager.drag_move_timer) {
								window.ClearInterval(cPlaylistManager.drag_move_timer);
								cPlaylistManager.drag_move_timer = false;
							};
						};
					};
				};
			};
			break;
		case "wheel":
			if (this.scrollbar.visible && !dragndrop.moved)
				this.scrollbar.check(event, x, y, delta);
			break;
		case "leave":
			var fin = this.playlists.length;
			for (var i = 0; i < fin; i++) {
				this.playlists[i].bt_remove.checkstate(event, 0, 0);
			};
			this.sortAz_button.checkstate(event, 0, 0);
			this.sortZa_button.checkstate(event, 0, 0);
			full_repaint();
			break;
		};
	};

	this.contextMenu = function (x, y, id) {
		var MF_SEPARATOR = 0x00000800;
		var MF_STRING = 0x00000000;
		var _menu = window.CreatePopupMenu();
		var _newplaylist = window.CreatePopupMenu();
		var _autoplaylist = window.CreatePopupMenu();
		var _filters = window.CreatePopupMenu();
		var idx;
		var total_area,
		visible_area;
		var bout,
		z;
		var add_mode = (id == null);

		if (!add_mode) {
			_newplaylist.AppendTo(_menu, MF_STRING, "插入 ...");
		} else {
			id = plman.PlaylistCount;
			_newplaylist.AppendTo(_menu, MF_STRING, "添加 ...");
		};
		_newplaylist.AppendMenuItem(MF_STRING, 100, "新建播放列表");
		_newplaylist.AppendMenuItem(MF_STRING, 101, "新建自动播放列表");
		_autoplaylist.AppendTo(_newplaylist, MF_STRING, "预定义自动播放列表");
		_autoplaylist.AppendMenuItem(MF_STRING, 200, "从未播放的曲目");
		_autoplaylist.AppendMenuItem(MF_STRING, 201, "最近5天播放过的曲目");
		_autoplaylist.AppendMenuItem(MF_SEPARATOR, 0, "");
		_autoplaylist.AppendMenuItem(MF_STRING, 210, "未评级的曲目");
		_autoplaylist.AppendMenuItem(MF_STRING, 211, "评级3到5的曲目");
		_autoplaylist.AppendMenuItem(MF_STRING, 212, "评级为4的曲目");
		_autoplaylist.AppendMenuItem(MF_STRING, 213, "评级为5的曲目");
		_autoplaylist.AppendMenuItem(MF_STRING, 214, "喜欢的曲目");
		_menu.AppendMenuItem(MF_SEPARATOR, 0, "");
		_menu.AppendMenuItem(MF_STRING, 2, "加载播放列表");
		if (!add_mode) {
			_menu.AppendMenuItem(MF_STRING, 5, "复制此播放列表");
			if (id > 0 || !cPlaylistManager.mediaLibraryPlaylist) {
				_menu.AppendMenuItem(MF_STRING, 3, "重命名此播放列表");
				_menu.AppendMenuItem(MF_STRING, 8, "删除此播放列表");
			};
			if (id > 0 || !cPlaylistManager.mediaLibraryPlaylist) {
				if (plman.IsAutoPlaylist(id)) {
					_menu.AppendMenuItem(MF_SEPARATOR, 0, "");
					_menu.AppendMenuItem(MF_STRING, 6, "自动播放列表属性...");
					_menu.AppendMenuItem(MF_STRING, 7, "转换为普通播放列表");
				};
			};
		};
		if (!add_mode) {
			if (properties.enablePlaylistFilter) {
				_menu.AppendMenuItem(MF_SEPARATOR, 0, "");
				if (this.playlists[id].filter_type == 1) {
					_filters.AppendTo(_menu, MF_STRING, "更改分组播放列表过滤器");
					_filters.AppendMenuItem(MF_STRING, 799, "移除播放列表过滤器");
					_filters.AppendMenuItem(MF_SEPARATOR, 0, "");
				} else {
					_filters.AppendTo(_menu, MF_STRING, "设置分组播放列表过滤器");
				};
				var groupByMenuIdx = 800;
				var totalGroupBy = p.list.groupby.length;
				for (var i = 0; i < totalGroupBy; i++) {
					_filters.AppendMenuItem(MF_STRING, groupByMenuIdx + i, p.list.groupby[i].label);
				};
				if (this.playlists[id].filter_type == 1) {
					_filters.CheckMenuRadioItem(groupByMenuIdx, groupByMenuIdx + totalGroupBy - 1, this.playlists[id].filter_idx + groupByMenuIdx);
				};
			};
		};

		idx = _menu.TrackPopupMenu(x, y);

		switch (true) {
		case (idx == 100):
			var total = plman.PlaylistCount;
			plman.CreatePlaylist(total, "");
			if (id == 0 && cPlaylistManager.mediaLibraryPlaylist) {
				plman.MovePlaylist(total, id + 1);
				plman.ActivePlaylist = id + 1;
				id++;
			} else {
				plman.MovePlaylist(total, id);
				plman.ActivePlaylist = id;
			};
			// 设置重命名
			this.inputbox = new oInputbox(this.w - this.border - this.scrollbarWidth - 40, cPlaylistManager.rowHeight - 10, plman.GetPlaylistName(id), "", g_color_normal_txt, g_color_normal_bg, RGB(0, 0, 0), g_color_selected_bg & 0xccffffff, "renamePlaylist()", "p.playlistManager", 0, g_fsize, 225);
			this.inputboxID = id;
			// 激活框内容 + 选中激活
			if (cPlaylistManager.inputbox_timer) {
				window.ClearTimeout(cPlaylistManager.inputbox_timer);
				cPlaylistManager.inputbox_timer = false;
			};
			cPlaylistManager.inputbox_timer = window.SetTimeout(inputboxPlaylistManager_activate, 20);
			break;
		case (idx == 101):
			var total = plman.PlaylistCount;
			plman.CreateAutoPlaylist(total, "", "", "", 0);
			if (id == 0 && cPlaylistManager.mediaLibraryPlaylist) {
				plman.MovePlaylist(total, id + 1);
				plman.ActivePlaylist = id + 1;
				plman.ShowAutoPlaylistUI(id + 1);
				id++;
			} else {
				plman.MovePlaylist(total, id);
				plman.ActivePlaylist = id;
				plman.ShowAutoPlaylistUI(id);
			};
			// 设置重命名
			this.inputbox = new oInputbox(this.w - this.border - this.scrollbarWidth - 40, cPlaylistManager.rowHeight - 10, plman.GetPlaylistName(id), "", g_color_normal_txt, g_color_normal_bg, RGB(0, 0, 0), g_color_selected_bg & 0xccffffff, "renamePlaylist()", "p.playlistManager", 0, g_fsize, 225);
			this.inputboxID = id;
			// 激活框内容 + 选中激活
			if (cPlaylistManager.inputbox_timer) {
				window.ClearTimeout(cPlaylistManager.inputbox_timer);
				cPlaylistManager.inputbox_timer = false;
			};
			cPlaylistManager.inputbox_timer = window.SetTimeout(inputboxPlaylistManager_activate, 20);
			break;
		case (idx == 2):
			fb.LoadPlaylist();
			break;
		case (idx == 3):
			// 设置重命名
			this.inputbox = new oInputbox(this.w - this.border - this.scrollbarWidth - 40, cPlaylistManager.rowHeight - 10, plman.GetPlaylistName(id), "", g_color_normal_txt, g_color_normal_bg, RGB(0, 0, 0), g_color_selected_bg & 0xccffffff, "renamePlaylist()", "p.playlistManager", 0, g_fsize, 225);
			this.inputboxID = id;
			// 激活框内容 + 选中激活
			if (cPlaylistManager.inputbox_timer) {
				window.ClearTimeout(cPlaylistManager.inputbox_timer);
				cPlaylistManager.inputbox_timer = false;
			};
			cPlaylistManager.inputbox_timer = window.SetTimeout(inputboxPlaylistManager_activate, 20);
			break;
		case (idx == 5):
			plman.DuplicatePlaylist(id, "副本 " + plman.GetPlaylistName(id));
			plman.ActivePlaylist = id + 1;
			break;
		case (idx == 6):
			plman.ShowAutoPlaylistUI(id);
			break;
		case (idx == 7):
			plman.DuplicatePlaylist(id, plman.GetPlaylistName(id));
			plman.RemovePlaylist(id);
			plman.ActivePlaylist = id;
			break;
		case (idx == 8):
			plman.RemovePlaylistSwitch(id);
			if (this.offset > 0 && this.offset >= this.playlists.length - Math.floor((this.h - (cPlaylistManager.showStatusBar ? cPlaylistManager.statusBarHeight : 0)) / cPlaylistManager.rowHeight)) {
				this.offset--;
				this.refresh("", false, false, false);
			};
			break;
		case (idx == 200):
			var total = plman.PlaylistCount;
			p.playlistManager.inputboxID = -1;
			plman.CreateAutoPlaylist(total, "从未播放的曲目", "%play_counter% MISSING", "%album artist% | $if(%album%,%date%,'9999') | %album% | %discnumber% | %tracknumber% | %title%", 0);
			if (id == 0 && cPlaylistManager.mediaLibraryPlaylist) {
				plman.MovePlaylist(total, id + 1);
				plman.ActivePlaylist = id + 1;
			} else {
				plman.MovePlaylist(total, id);
				plman.ActivePlaylist = id;
			};
			break;
		case (idx == 201):
			var total = plman.PlaylistCount;
			p.playlistManager.inputboxID = -1;
			plman.CreateAutoPlaylist(total, "最近5天播放过的曲目", "%last_played% DURING LAST 5 DAYS", "%last_played%", 0);
			if (id == 0 && cPlaylistManager.mediaLibraryPlaylist) {
				plman.MovePlaylist(total, id + 1);
				plman.ActivePlaylist = id + 1;
			} else {
				plman.MovePlaylist(total, id);
				plman.ActivePlaylist = id;
			};
			break;
		case (idx == 210):
			var total = plman.PlaylistCount;
			p.playlistManager.inputboxID = -1;
			plman.CreateAutoPlaylist(total, "未评级的曲目", "%rating% MISSING", "%album artist% | $if(%album%,%date%,'9999') | %album% | %discnumber% | %tracknumber% | %title%", 0);
			if (id == 0 && cPlaylistManager.mediaLibraryPlaylist) {
				plman.MovePlaylist(total, id + 1);
				plman.ActivePlaylist = id + 1;
			} else {
				plman.MovePlaylist(total, id);
				plman.ActivePlaylist = id;
			};
			break;
		case (idx == 211):
			var total = plman.PlaylistCount;
			p.playlistManager.inputboxID = -1;
			plman.CreateAutoPlaylist(total, "评级3到5的曲目", "%rating% GREATER 2", "%album artist% | $if(%album%,%date%,'9999') | %album% | %discnumber% | %tracknumber% | %title%", 0);
			if (id == 0 && cPlaylistManager.mediaLibraryPlaylist) {
				plman.MovePlaylist(total, id + 1);
				plman.ActivePlaylist = id + 1;
			} else {
				plman.MovePlaylist(total, id);
				plman.ActivePlaylist = id;
			};
			break;
		case (idx == 212):
			var total = plman.PlaylistCount;
			p.playlistManager.inputboxID = -1;
			plman.CreateAutoPlaylist(total, "评级为4的曲目", "%rating% IS 4", "%album artist% | $if(%album%,%date%,'9999') | %album% | %discnumber% | %tracknumber% | %title%", 0);
			if (id == 0 && cPlaylistManager.mediaLibraryPlaylist) {
				plman.MovePlaylist(total, id + 1);
				plman.ActivePlaylist = id + 1;
			} else {
				plman.MovePlaylist(total, id);
				plman.ActivePlaylist = id;
			};
			break;
		case (idx == 213):
			var total = plman.PlaylistCount;
			p.playlistManager.inputboxID = -1;
			plman.CreateAutoPlaylist(total, "评级为5的曲目", "%rating% IS 5", "%album artist% | $if(%album%,%date%,'9999') | %album% | %discnumber% | %tracknumber% | %title%", 0);
			if (id == 0 && cPlaylistManager.mediaLibraryPlaylist) {
				plman.MovePlaylist(total, id + 1);
				plman.ActivePlaylist = id + 1;
			} else {
				plman.MovePlaylist(total, id);
				plman.ActivePlaylist = id;
			};
			break;
		case (idx == 214):
			var total = plman.PlaylistCount;
			p.playlistManager.inputboxID = -1;
			plman.CreateAutoPlaylist(total, "喜欢的曲目", "%mood% GREATER 0", "%album artist% | $if(%album%,%date%,'9999') | %album% | %discnumber% | %tracknumber% | %title%", 0);
			if (id == 0 && cPlaylistManager.mediaLibraryPlaylist) {
				plman.MovePlaylist(total, id + 1);
				plman.ActivePlaylist = id + 1;
			} else {
				plman.MovePlaylist(total, id);
				plman.ActivePlaylist = id;
			};
			break;
		case (idx == 799):
			var pl_name = plman.GetPlaylistName(id);

			// 更改所影响的模式
			var old_pl_filter = p.list.groupby[this.playlists[id].filter_idx].playlistFilter;
			var arr = old_pl_filter.split(";");
			if (arr.length == 1) {
				var new_pl_filter = "null";
			} else {
				var new_pl_filter = "";
				// 将该播放列表从其当前播放列表筛选中移除
				for (var f = 0; f < arr.length; f++) {
					if (arr[f] != pl_name) {
						// 不是要从播放列表筛选中移除的播放列表，我们保留它
						if (new_pl_filter.length == 0) {
							new_pl_filter = arr[f];
						} else {
							new_pl_filter = new_pl_filter + ";" + arr[f];
						};
					};
				};
			};
			p.list.groupby[this.playlists[id].filter_idx].playlistFilter = new_pl_filter;

			p.list.saveGroupBy();

			// 刷新播放列表
			p.list.updateHandleList(plman.ActivePlaylist, false);
			p.list.setItems(true);
			p.scrollbar.setCursor(p.list.totalRowVisible, p.list.totalRows, p.list.offset);
			p.playlistManager.refresh("", false, false, false);
			break;
		case (idx >= 800 && idx < 830):
			var pl_name = plman.GetPlaylistName(id);
			var pl_filter = p.list.groupby[idx - groupByMenuIdx].playlistFilter;

			if (this.playlists[id].filter_idx != idx - groupByMenuIdx) {
				if (this.playlists[id].filter_type == 1) {
					// 更改所影响的模式
					var old_pl_filter = p.list.groupby[this.playlists[id].filter_idx].playlistFilter;
					var arr = old_pl_filter.split(";");
					if (arr.length == 1) {
						var new_pl_filter = "null";
					} else {
						var new_pl_filter = "";
						// 将该播放列表从其当前播放列表筛选中移除
						for (var f = 0; f < arr.length; f++) {
							if (arr[f] != pl_name) {
								// 不是要从播放列表筛选中移除的播放列表，我们保留它
								if (new_pl_filter.length == 0) {
									new_pl_filter = arr[f];
								} else {
									new_pl_filter = new_pl_filter + ";" + arr[f];
								};
							};
						};
					};
					p.list.groupby[this.playlists[id].filter_idx].playlistFilter = new_pl_filter;
				};

				// 设置模式
				if (pl_filter.toLowerCase() == "null") {
					p.list.groupby[idx - groupByMenuIdx].playlistFilter = pl_name;
				} else {
					p.list.groupby[idx - groupByMenuIdx].playlistFilter = pl_filter + ";" + pl_name;
				};
			};

			p.list.saveGroupBy();

			// 刷新播放列表
			p.list.updateHandleList(plman.ActivePlaylist, false);
			p.list.setItems(true);
			p.scrollbar.setCursor(p.list.totalRowVisible, p.list.totalRows, p.list.offset);
			p.playlistManager.refresh("", false, false, false);
			break;
		};
		cPlaylistManager.rightClickedId = null;
		full_repaint();
		return true;
	};
};
