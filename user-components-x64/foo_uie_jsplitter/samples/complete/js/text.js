'use strict';
//29/10/24

function _text(mode, x, y, w, h) {
	this.size = () => {
		this.rows = Math.floor((this.h - _scale(24)) / panel.row_height);
		this.up_btn.x = this.x + Math.round((this.w - _scale(12)) / 2);
		this.down_btn.x = this.up_btn.x;
		this.up_btn.y = this.y;
		this.down_btn.y = this.y + this.h - _scale(12);
		this.update();
	}

	this.paint = (gr) => {
		if (this.mode === 'lastfm_bio' && !lastfm.api_key.value.length) {
			gr.GdiDrawText('未找到 API 密钥。使用右键点击添加。', panel.fonts.normal, panel.colours.text, this.x, this.y + _scale(12), this.w, panel.row_height, LEFT);
			return;
		}

		for (let i = 0; i < Math.min(this.rows, this.lines.length); i++) {
			if (this.mode == 'text_reader' && this.properties.fixed.enabled) {
				gr.GdiDrawText(this.lines[i + this.offset], panel.fonts.fixed, panel.colours.text, this.x, this.y + _scale(12) + (i * panel.row_height) + Math.floor(panel.row_height / 2), this.w, panel.row_height, LEFT);
			} else {
				gr.GdiDrawText(this.lines[i + this.offset], panel.fonts.normal, panel.colours.text, this.x, this.y + _scale(12) + (i * panel.row_height), this.w, panel.row_height, LEFT);
			}
		}
		this.up_btn.paint(gr, panel.colours.text);
		this.down_btn.paint(gr, panel.colours.text);
	}

	this.metadb_changed = () => {
		let temp_artist;
		if (panel.metadb) {
			switch (this.mode) {
			case 'allmusic':
				temp_artist = panel.tf('%album artist%');
				const temp_album = panel.tf('%album%');
				if (this.artist == temp_artist && this.album == temp_album) {
					return;
				}
				this.artist = temp_artist;
				this.album = temp_album;
				this.filename = _artistFolder(this.artist) + 'allmusic.' + _fbSanitise(this.album) + '.txt';
				this.content = '';
				this.allmusic_url = false;
				if (_isFile(this.filename)) {
					this.content = _.trim(_open(this.filename));
					// 内容是静态的，因此仅在之前未找到评论时才检查更新
					if (!this.content.length && _fileExpired(this.filename, ONE_DAY)) {
						this.get();
					}
				} else {
					this.get();
				}
				break;
			case 'lastfm_bio':
				temp_artist = panel.tf(DEFAULT_ARTIST);
				if (this.artist == temp_artist) {
					return;
				}
				this.artist = temp_artist;
				this.content = '';
				this.filename = _artistFolder(this.artist) + 'lastfm.artist.getInfo.' + this.langs[this.properties.lang.value] + '.json';
				if (_isFile(this.filename)) {
					this.content = _stripTags(_.get(_jsonParseFile(this.filename), 'artist.bio.content', '')).replace('Read more on Last.fm. User-contributed text is available under the Creative Commons By-SA License; additional terms may apply.', '');
					if (_fileExpired(this.filename, ONE_DAY)) {
						this.get();
					}
				} else {
					this.get();
				}
				break;
			case 'text_reader':
				const temp_filename = panel.tf(this.properties.filename_tf.value);
				if (this.filename == temp_filename) {
					return;
				}
				this.filename = temp_filename;
				if (_isFolder(this.filename)) { // 如果是文件夹，使用第一个 txt/log 文件
					this.content = _open(_.first(_getFiles(this.filename, this.exts)));
				} else {
					this.content = _open(this.filename);
				}
				this.content = this.content.replace(/\t/g, '    ');
				break;
			}
		} else {
			this.artist = '';
			this.filename = '';
			this.content = '';
		}
		this.update();
		window.Repaint();
	}

	this.trace = (x, y) => {
		return x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.h;
	}

	this.wheel = (s) => {
		if (this.trace(this.mx, this.my)) {
			if (this.lines.length > this.rows) {
				let offset = this.offset - (s * 3);
				if (offset < 0) {
					offset = 0;
				}
				if (offset + this.rows > this.lines.length) {
					offset = this.lines.length - this.rows;
				}
				if (this.offset != offset) {
					this.offset = offset;
					window.RepaintRect(this.x, this.y, this.w, this.h);
				}
			}
			return true;
		} else {
			return false;
		}
	}

	this.move = (x, y) => {
		this.mx = x;
		this.my = y;
		window.SetCursor(IDC_ARROW);
		if (this.trace(x, y)) {
			this.up_btn.move(x, y);
			this.down_btn.move(x, y);
			return true;
		} else {
			return false;
		}
	}

	this.lbtn_up = (x, y) => {
		if (this.trace(x, y)) {
			this.up_btn.lbtn_up(x, y);
			this.down_btn.lbtn_up(x, y);
			return true;
		} else {
			return false;
		}
	}

	this.rbtn_up = (x, y) => {
		switch (this.mode) {
		case 'allmusic':
			this.cb = _getClipboardData();
			panel.m.AppendMenuItem(panel.metadb && _.isString(this.cb) && _tagged(this.artist) && _tagged(this.album) ? MF_STRING : MF_GRAYED, 1000, '从剪贴板粘贴文本');
			panel.m.AppendMenuSeparator();
			break;
		case 'lastfm_bio':
			panel.m.AppendMenuItem(panel.metadb ? MF_STRING : MF_GRAYED, 1100, '强制更新');
			panel.m.AppendMenuSeparator();
			_.forEach(this.langs, (item, i) => {
				panel.s10.AppendMenuItem(MF_STRING, i + 1110, item);
			});
			panel.s10.CheckMenuRadioItem(1110, 1121, this.properties.lang.value + 1110);
			panel.s10.AppendTo(panel.m, MF_STRING, 'Last.fm 语言');
			panel.m.AppendMenuSeparator();
			panel.m.AppendMenuItem(MF_STRING, 1199, 'Last.fm API 密钥');
			panel.m.AppendMenuSeparator();
			break;
		case 'text_reader':
			panel.m.AppendMenuItem(MF_STRING, 1200, '刷新');
			panel.m.AppendMenuSeparator();
			panel.m.AppendMenuItem(MF_STRING, 1210, '自定义标题...');
			panel.m.AppendMenuItem(MF_STRING, 1220, '自定义路径...');
			panel.m.AppendMenuSeparator();
			panel.m.AppendMenuItem(MF_STRING, 1230, '等宽字体');
			panel.m.CheckMenuItem(1230, this.properties.fixed.enabled);
			panel.m.AppendMenuSeparator();
			break;
		}
		panel.m.AppendMenuItem(_isFile(this.filename) || _isFolder(this.filename) ? MF_STRING : MF_GRAYED, 1999, '打开所在文件夹');
		panel.m.AppendMenuSeparator();
	}

	this.rbtn_up_done = (idx) => {
		switch (idx) {
		case 1000:
			_save(this.filename, this.cb);
			this.artist = '';
			panel.item_focus_change();
			break;
		case 1100:
			this.get();
			break;
		case 1110:
		case 1111:
		case 1112:
		case 1113:
		case 1114:
		case 1115:
		case 1116:
		case 1117:
		case 1118:
		case 1119:
		case 1120:
		case 1121:
			this.properties.lang.value = idx - 1110;
			this.artist = '';
			panel.item_focus_change();
			break;
		case 1199:
			lastfm.api_key.value = utils.InputBox(window.ID, '自 2024 年 8 月 31 日起，多年来一直使用的 Last.fm API 密钥因使用过度而被封禁。\n您可以从此链接获取：\n\nhttps://www.last.fm/api/account/create\n\n请输入您自己的 API 密钥：', 'Last.fm API 密钥', lastfm.api_key.value, false);
			window.Reload();
			break;
		case 1200:
			this.filename = '';
			panel.item_focus_change();
			break;
		case 1210:
			this.properties.title_tf.value = utils.InputBox(window.ID, '此处可使用完整标题格式。', window.ScriptInfo.Name, this.properties.title_tf.value);
			window.Repaint();
			break;
		case 1220:
			this.properties.filename_tf.value = utils.InputBox(window.ID, 'Use title formatting to specify a path to a text file. eg: $directory_path(%path%)\\info.txt\n\nIf you prefer, you can specify just the path to a folder and the first txt or log file will be used.', window.ScriptInfo.Name, this.properties.filename_tf.value);
			panel.item_focus_change();
			break;
		case 1230:
			this.properties.fixed.toggle();
			this.update();
			window.RepaintRect(this.x, this.y, this.w, this.h);
			break;
		case 1999:
			if (_isFile(this.filename)) {
				_explorer(this.filename);
			} else {
				_run(this.filename);
			}
			break;
		}
	}

	this.key_down = (k) => {
		switch (k) {
		case VK_UP:
			this.wheel(1);
			return true;
		case VK_DOWN:
			this.wheel(-1);
			return true;
		default:
			return false;
		}
	}

	this.update = () => {
		this.offset = 0;
		switch (true) {
		case this.w < 100 || !this.content.length:
			this.lines = [];
			break;
		case this.mode == 'text_reader' && this.properties.fixed.enabled:
			this.lines = this.content.split('\n');
			break;
		default:
			this.lines = _lineWrap(this.content, panel.fonts.normal, this.w);
			break;
		}
	}

	this.header_text = () => {
		switch (this.mode) {
		case 'allmusic':
			return panel.tf('%album artist%[ - %album%]');
		case 'lastfm_bio':
			return this.artist;
		case 'text_reader':
			return panel.tf(this.properties.title_tf.value);
		}
	}

	this.reset = function () {
		this.text = this.artist = this.album = this.filename = '';
	}

	this.init = () => {
		switch (this.mode) {
		case 'allmusic':
			this.get = function () {
				var url;

				if (this.review_url.length) {
					url = this.review_url;
				} else {
					if (!_tagged(this.artist) || !_tagged(this.album))
						return;

					if (this.artist.toLowerCase() == 'various artists') {
						url = this.search_base + encodeURIComponent(this.album);
					} else {
						url = this.search_base + encodeURIComponent(this.artist + ' ' + this.album);
					}

					if (this.history[url])
						return;

					this.history[url] = true;
				}

				var task_id = utils.HTTPRequestAsync(0, url, this.headers);
				this.filenames[task_id] = this.filename;
			}

			this.http_request_done = function (id, success, response_text) {
				var filename = this.filenames[id];

				if (!filename)
					return;

				if (!success) {
					console.log(N, response_text);
					return;
				}

				if (this.review_url.length) {
					this.review_url = '';
					var content = this.parse_review(response_text);

					if (content.length) {
						console.log(N, '已找到并保存评论。');
						_save(filename, content);
						this.reset();
						this.metadb_changed();
					} else {
						console.log(N, '未在此专辑页面上找到评论。');
					}
				} else {
					this.parse_search_results(response_text);
				}
			}

			this.parse_review = function (response_text) {
				if (response_text.length == 0)
					return '';

				var p = _.first(_getElementsByTagName(response_text, 'p'));

				if (typeof p == 'object')
					return p.innerText;

				return '';
			}

			this.parse_search_results = function (response_text) {
				try {
					this.review_url = '';

					_(_getElementsByTagName(response_text, 'div'))
						.filter({className : 'info'})
						.forEach((info_div) => {
							var artist, album, url;
							var divs = info_div.getElementsByTagName('div');

							for (var i = 0; i < divs.length; i++) {
								var div = divs[i];
								var className = div.className;
								var a = _firstElement(div, 'a');

								if (typeof a == 'object') {
									if (className == 'artist') {
										artist = a.innerText;
									} else if (className == 'title') {
										album = a.innerText;
										url = a.href + '/reviewAjax';
									}
								} else if (className == 'artist') {
									artist = 'Various Artists';
								}
							}

							if (this.is_match(artist, album)) {
								this.review_url = url;
								return false;
							}
						}, this);

					if (this.review_url.length) {
						console.log(N, '已找到 ' + _q(this.album) + ' 的页面。正在检查评论...');
						this.get();
					} else {
						console.log(N, '无法为 ' + _q(this.album) + ' 找到匹配项。');
					}
				} catch (e) {
					console.log(N, '无法解析 Allmusic 服务器响应。');
				}
			}

			this.is_match = (artist, album) => {
				if (!panel.metadb)
					return false;

				return this.tidy(artist) == this.tidy(this.artist) && this.tidy(album) == this.tidy(this.album);
			}

			this.tidy = (value) => {
				return fb.TitleFormat('$replace($lower($ascii(' + _fbEscape(value) + ')), & ,, and ,)').EvalWithMetadb(panel.metadb);
			}

			this.headers = JSON.stringify({
				'User-Agent' : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
				'Referer' : 'https://allmusic.com',
			});

			this.filenames = {};
			this.review_url = '';
			this.search_base = 'https://www.allmusic.com/search/albums/';
			this.history = {};

			_createFolder(folders.data);
			_createFolder(folders.artists);
			break;
		case 'lastfm_bio':
			this.get = function () {
				if (lastfm.api_key.value.length == 0 || !_tagged(this.artist))
					return;

				var url = lastfm.get_base_url() + '&method=artist.getInfo&autocorrect=1&lang=' + this.langs[this.properties.lang.value] + '&artist=' + encodeURIComponent(this.artist);
				utils.DownloadFileAsync(url, this.filename);
			}

			this.download_file_done = function (path, success, error_text) {
				if (success) {
					this.reset();
					this.metadb_changed();
				} else {
					console.log(N, error_text);
				}
			}

			this.headers = JSON.stringify({
				'User-Agent' : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
				'Referer' : 'https://www.last.fm',
			});

			this.langs = ['en', 'de', 'es', 'fr', 'it', 'ja', 'pl', 'pt', 'ru', 'sv', 'tr', 'zh'];
			this.properties.lang = new _p('2K3.TEXT.BIO.LANG', 0);

			_createFolder(folders.data);
			_createFolder(folders.artists);
			break;
		case 'text_reader':
			this.properties.filename_tf = new _p('2K3.TEXT.FILENAME.TF', '$directory_path(%path%)');
			this.properties.title_tf = new _p('2K3.TEXT.TITLE.TF', '$directory_path(%path%)');
			this.properties.fixed = new _p('2K3.TEXT.FONTS.FIXED', true);
			this.exts = ['txt', 'log'];
			break;
		}
	}

	panel.text_objects.push(this);
	this.mode = mode;
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.mx = 0;
	this.my = 0;
	this.offset = 0;
	this.content = '';
	this.artist = '';
	this.album = '';
	this.filename = '';

	this.up_btn = new _sb(chars.up, this.x, this.y, _scale(12), _scale(12), () => { return this.offset > 0; }, () => { this.wheel(1); });
	this.down_btn = new _sb(chars.down, this.x, this.y, _scale(12), _scale(12), () => { return this.offset < this.lines.length - this.rows; }, () => { this.wheel(-1); });
	this.properties = {};
	this.init();
}
