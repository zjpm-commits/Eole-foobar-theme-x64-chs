'use strict';
window.DefineScript('简介 v1.4.2', {author:'WilB（汉化:always beta）', features:{drag_n_drop:true}});

let renderMode = window.GetProperty("界面·渲染模式", 1);
window.DrawMode = renderMode;
// 主题颜色模式
let colorMode = window.GetProperty("主题·颜色模式 (0=默认, 1=封面取色)", 1);
let coverThemeColors = null;
// 封面取色颜色变量（默认值，由 coverTheme 通知更新）
let bgColor = window.GetColourDUI(1);
let textColor = window.GetColourDUI(0);
let hlColor = window.GetColourDUI(2);
let stColor = window.GetColourDUI(3);

if (typeof my_utils === 'undefined') include(fb.FoobarPath + 'themes\\foorab\\JavaScript\\Biography\\scripts\\utils.js');

let isRadioStreamParser = false;
const loadAsync = false; // window.GetProperty('Load Biography Asynchronously', true); // changed to false: issue on loading fth with many panels

async function readFiles(files) {
		for (const file of files) {
		if (window.ID) { // fix pss issue
			await include(my_utils.getScriptPath + file);
		}
	}
}

const files = [
	'helpers.js',
	'properties.js',
	'settings.js',
	'interface.js',
	'language.js',
	'panel.js',
	'server.js',
	'allmusic.js',
	'lastfm.js',
	'wikipedia.js',
	'names.js',
	'scrollbar.js',
	'buttons.js',
	'menu.js',
	'text.js',
	'lyrics.js',
	'tagger.js',
	'resize.js',
	'library.js',
	'images.js',
	'filmstrip.js',
	'timers.js',
	'popupbox.js',
	'initialise.js',
	'callbacks.js'
];

if (loadAsync) {
	readFiles(files).then(() => {
		if (!window.ID) return; // fix pss issue
		on_size();
		window.Repaint();
	});
} else {
	files.forEach(v => include(my_utils.getScriptPath + v));
}