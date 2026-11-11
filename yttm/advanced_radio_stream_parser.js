/* 电台解析器(RadioStreamParser)是用 javascript 编写的，用户可以小心编辑。
它设计用于包含非标准格式的艺术家姓名和歌曲标题的电台流。
在编辑之前，请备份副本以防出现问题。

1. 要添加新的电台流，请复制其中一个案例实例，包括中断(break)。粘贴在最后一个语句下和 switch 语句内。
2. 对于每一个，改变路径。为此，打开属性复制并粘贴文件路径。保留下面的引号。转义任何反斜杠：将 \ 替换为 \\
3. 从电台流项目中提取艺术家和标题。
	在许多情况下，这可以简单地通过拆分项目来完成，例如 在 -，第一项将是项目 [0]，第二项将是项目 [1] 等。
	在更复杂的情况下，使用 RegExp 或 javascript 字符串操作函数。谷歌语法。
4.调整格式（如果不需要，请注释掉）。这是美学，不会影响搜索。
5. 使用 console.log 跟踪查看正在发生的事情并进行调试，例如取消下面的注释。
6. If fb2K artist name is required, use, e.g. $.eval('[$trim(' + (typeof cfg !== 'undefined' ? cfg.tf.artist : ppt.tfArtist) + ')]', focus, ignoreLock)
7. For info, biography uses cfg.tf.artist and cfg.tf.title; Find & Play uses ppt.tfArtist and ppt.tfTitle.
	
如果简介包 ID {BA9557CE-7B4B-4E0E-9373-99F511E81252} 未更改，则 Find & Play 也使用此解析器。
*/

'use strict';

class radioStreamParser {

	static getStreamInfo(focus, ignoreLock) {
		// don't alter the next 4 lines
		const path = $.eval('%path%', focus, ignoreLock);
		let artist = '';
		let item = $.eval('[$trim(' + (typeof cfg !== 'undefined' ? cfg.tf.title : ppt.tfTitle) + ')]', focus, ignoreLock);
		let title = '';

		switch (path) {

			case 'http://dieneuewelle.cast.addradio.de/dieneuewelle/simulcast/high/stream.mp3':
				//console.log('original item', item);
				item = item.split('-');
				//console.log('split item', item);

				artist = (item[1] || '').trim(); // always return empty string if no match
				//console.log('artist', artist);

				title = (item[2] || '').trim();
				//console.log('title', title);
	
				break;

			case 'http://energyzuerich.ice.infomaniak.ch/energyzuerich-high.mp3': // items requiring same parsing can be grouped as shown
			case 'http://vintageradio.ice.infomaniak.ch/vintageradio-high.mp3':

				//console.log('original item', item);
				item = item.split('˗'); // use correct hyphen(s)!; it's safest to save file as utf-8-BOM especially if there are unicode characters
				//console.log('split item', item);
				
				artist = (item[0] || '').trim();
				//console.log('artist', artist);
				
				title = (item[1] || '').trim();
				//console.log('title', title);

				break;
				
			case 'http://kohina.duckdns.org:8000/stream.ogg':

				//console.log('original item', item);
				item = item.split('-');
				//console.log('split item', item);

				artist = (item[0] || '').trim(); // always return empty string if no match
				//console.log('artist', artist);
				
				title = (item[1] || '').trim();
				if (item[2]) title = (title + ' - ' + item[2].trim());
				//console.log('title', title);

				break;

			case 'http://www.rcgoldserver.eu:8253/': // artist name and song title in standard format except title has year
			case 'http://www.rmgoldserver.eu:8199/':
			
				//console.log('original item', item);
				title = this.removeTrailingYear(item);	// item is the original parsed title; trailing year removed as it interferes with searching
				//console.log('title', title);

				// artist is correct: return will be '': as its empty original parsed artist is used without modification
	
				break;

			case 'https://stream.arrowrockradio.com/arrowrockradio':

				// artist needs stream name and playing removing
				artist = $.eval('[$trim($replace(' + (typeof cfg !== 'undefined' ? cfg.tf.artist : ppt.tfArtist) + ',Arrow Rock Radio:,,PLAYING:,))]', focus, ignoreLock);
				//console.log('artist', artist);

				// title is correct except it's uppercase: including here means it goes through the titlecase converter
				title = (item || '').trim();
				//console.log('title', title);

				break;

			case 'artist and title are switched - a path would need to be put here':

				//console.log('original item', item);
				artist = item; // item is the title, which is the artist as they're swapped
				//console.log('artist', artist);
				
				title = $.eval('[$trim(' + (typeof cfg !== 'undefined' ? cfg.tf.artist : ppt.tfArtist) + ')]', focus, ignoreLock);
				//console.log('title', title);
	
				break;

		}

		// adjust format
		artist = artist.toLowerCase(); // toLowerCase() stops all uppercase being treated as abbreviation by $.titlecase
		artist = $.titlecase(artist); 
		//console.log('formatted artist', artist);

		title = title.toLowerCase();
		title = $.titlecase(title);
		//console.log('formatted title', title);

		// return object containing artist & title: don't alter
		return {
			artist: artist,
			title: title
		}
	}

	static removeTrailingYear(title) {
		const kw = '(-\\s*|\\s+)\\d\\d\\d\\d';
		let ix = -1;
		let yr = title.match(RegExp(kw));
		if (yr) {
			yr = yr[0].toString();
			ix = title.indexOf(yr);
		}
		if (ix != -1) title = title.slice(0, ix).trim();
		return title;
	}
}