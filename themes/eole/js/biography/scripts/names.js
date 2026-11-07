'use strict';

/* 洛雪音源广播：按播放项取 artist / title / album（没有就返回 null） */
function namesLxInfo(focus, ignoreLock) {
	try {
		if (typeof lxInfoOf !== 'function') return null;
		let h = null;
		try { h = $.handle(focus, ignoreLock); } catch (e) { h = null; }
		if (!h && fb.IsPlaying) h = fb.GetNowPlaying();
		const r = h ? lxInfoOf(h) : null;
		if (!r && fb.IsPlaying) { const n = lxInfoOf(fb.GetNowPlaying()); if (n) return n; }
		return r || null;
	} catch (e) { return null; }
}

class Names {
	constructor() {
		this.cur_artist = '';
		this.lfmUID = '_[a-f0-9]{32}\\.jpg$';
	}

	// Methods

	alb(focus) {
		return $.eval('[$trim(' + cfg.tf.album + ')]', focus);
	}

	albID(focus, n) {
		if (!this.alb(focus)) return $.eval(cfg.tf.artist + cfg.tf.albumArtist + '%path%', focus);
		else switch (n) {
			case 'simple':
				return $.eval(cfg.tf.artist + cfg.tf.albumArtist + cfg.tf.album, focus);
			case 'stnd':
				return $.eval(cfg.tf.albumArtist + cfg.tf.album + '%discnumber%%date%', focus);
			case 'full':
				return $.eval(cfg.tf.artist + cfg.tf.albumArtist + cfg.tf.album + '%discnumber%%date%', focus);
		}
	}

	albm(focus, ignoreLock) {
		return this.albumTidy($.eval('[' + cfg.tf.album + ']', focus, ignoreLock));
	}

	album(focus, ignoreLock) {
		if (!cfg.albStrip) return this.albm(focus);
		return this.albumClean($.eval('[' + cfg.tf.album + ']', focus, ignoreLock));

	}

	albumArtist(focus, ignoreLock) {
		const lx = namesLxInfo(focus, ignoreLock);
		if (lx && (lx.artist || lx.album)) return lx.artist || lx.album;
		let albumArtist = $.eval('[$trim(' + cfg.tf.albumArtist + ')]', focus, ignoreLock);
		const radioTrackArtist = !isRadioStreamParser || !panel.isRadio(focus) ? '' : radioStreamParser.getStreamInfo(focus, ignoreLock).artist;
		return radioTrackArtist || albumArtist;
	}

	albumClean(n) {
		return n.replace(/CD(\s*\d|\.0\d)|CD\s*(One|Two|Three)|Dis(c|k)\s*\d|Dis(c|k)\s*(III|II|I|One|Two|Three)\b|(Bonus\s*Track|Collector's|(Digital\s*|Super\s*|)Deluxe|Digital|Expanded|Limited|Platinum|Reissue|Special)\s*(Edition|Version)|(Bonus\s*(CD|Disc))|\d\d\w\w\s*Anniversary\s*(Expanded\s*|Re(-|)master\s*|)(Edition|Re(-|)master|Version)|((19|20)\d\d(\s*|\s*-\s*)|)(Digital(ly|)\s*|)(Re(-|)master(ed|)|Re(-|)recorded)(\s*Edition|\s*Version|)|\(Deluxe\)|\(Mono\)|\(Reissue\)|\(Revisited\)|\(Stereo\)|\(Web\)|\[Deluxe\]|\[Mono\]|\[Reissue\]|\[Revisited\]|\[Stereo\]|\[Web\]/gi, '').replace(/\(\s*\)|\[\s*\]/g, ' ').replace(/\s\s+/g, ' ').replace(/-\s*$/g, ' ').trim();
	}

	albumTidy(n) {
		return n.replace(/CD(\s*\d|\.0\d)|CD\s*(One|Two|Three)|Dis(c|k)\s*\d|Dis(c|k)\s*(III|II|I|One|Two|Three)\b/gi, '').replace(/\(\s*\)|\[\s*\]/g, ' ').replace(/\s\s+/g, ' ').replace(/-\s*$/g, ' ').trim();
	}

	/* 洛雪广播优先：流播项没有标签，直接给歌手名 */
	artist(focus, ignoreLock) {
		const lx = namesLxInfo(focus, ignoreLock);
		if (lx && lx.artist) return lx.artist;
		let artist = $.eval('[$trim(' + cfg.tf.artist + ')]', focus, ignoreLock);
		const radioTrackArtist = !isRadioStreamParser || !panel.isRadio(focus) ? '' : radioStreamParser.getStreamInfo(focus, ignoreLock).artist;
		return radioTrackArtist || artist;
	}

	composition(focus, ignoreLock) {
		return $.eval('[' + cfg.tf.composition + ']', focus, ignoreLock);
	}

	isLfmImg(fn, artist) {
		if (artist) {
			if (artist != this.cur_artist) {
				artist = $.regexEscape($.clean(artist));
				this.cur_artist = artist;
			}
			return RegExp(`^${artist + this.lfmUID}`, 'i').test(fn);
		} else return RegExp(this.lfmUID, 'i').test(fn);
	}

	title(focus, ignoreLock) {
		const lx = namesLxInfo(focus, ignoreLock);
		if (lx && lx.title) return lx.title;
		let title = $.eval('[$trim(' + cfg.tf.title + ')]', focus, ignoreLock);
		const radioTrackTitle = !isRadioStreamParser || !panel.isRadio(focus) ? '' : radioStreamParser.getStreamInfo(focus, ignoreLock).title;
		return radioTrackTitle || title;
	}

	trackID(focus) {
		return $.eval(cfg.tf.artist + cfg.tf.title, focus);
	}
}