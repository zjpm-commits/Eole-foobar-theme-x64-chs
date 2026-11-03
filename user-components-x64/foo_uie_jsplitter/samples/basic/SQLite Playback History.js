window.DefineScript('SQLite 播放历史');
include('docs/Flags.js');
include('docs/Helpers.js');

// 一个小型的持久化播放历史面板。
// 数据库存放在 foobar2000 配置文件文件夹中，重启后仍会保留。
// 它演示了建表、参数、可复用的预处理语句、
// 聚合查询、SQLite 异常处理以及显式的清理。

const DB_PATH = fb.ProfilePath + 'jsplitter-playback-history.db';
const RECENT_LIMIT = 12;
const TOP_ARTISTS_LIMIT = 5;
const HISTORY_LIMIT = 1000;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;


const fontTitle = gdi.Font('Segoe UI', 16, 1);
const fontText = gdi.Font('Segoe UI', 12, 0);
const fontSmall = gdi.Font('Segoe UI', 10, 0);

const tfArtist = fb.TitleFormat('$if2(%album artist%,$if2(%artist%,未知艺术家))');
const tfTitle = fb.TitleFormat('$if2(%title%,未知标题)');
const tfAlbum = fb.TitleFormat('[%album%]');

let db = utils.OpenDatabase(DB_PATH);
let insertHistory = null;
let recent = [];
let topArtists = [];
let databaseError = '';

if (db) {
    try {
        db.Exec(`
            CREATE TABLE IF NOT EXISTS playback_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                played_at INTEGER NOT NULL,
                artist TEXT NOT NULL,
                title TEXT NOT NULL,
                album TEXT NOT NULL,
                path TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS playback_history_played_at
                ON playback_history(played_at DESC);
        `);

        insertHistory = db.Prepare(`
            INSERT INTO playback_history(played_at, artist, title, album, path)
            VALUES (?, ?, ?, ?, ?)
        `);

        refreshView();
    } catch (e) {
        reportDatabaseError(e);

        if (insertHistory) {
            insertHistory.Close();
            insertHistory = null;
        }

        db.Close();
        db = null;
    }
}

function reportDatabaseError(error) {
    databaseError = error && error.message ? error.message : String(error);
    console.log(`SQLite 播放历史：${databaseError}`);
    window.Repaint();
}

function addPlayback(metadb) {
    if (!db || !insertHistory || !metadb) return;

    try {
        insertHistory.Run([
            Date.now(),
            tfArtist.EvalWithMetadb(metadb),
            tfTitle.EvalWithMetadb(metadb),
            tfAlbum.EvalWithMetadb(metadb),
            metadb.Path
        ]);

        // 在不重建表的情况下，让演示数据库保持有界。
        db.Exec(`
            DELETE FROM playback_history
            WHERE id <= (
                SELECT id
                FROM playback_history
                ORDER BY id DESC
                LIMIT 1 OFFSET ?
            )
        `, [HISTORY_LIMIT - 1]);

        refreshView();
    } catch (e) {
        reportDatabaseError(e);
    }
}

function refreshView() {
    if (!db) return;

    const newRecent = db.Query(`
        SELECT played_at, artist, title, album
        FROM playback_history
        ORDER BY id DESC
        LIMIT ?
    `, [RECENT_LIMIT]);

    const newTopArtists = db.Query(`
        SELECT artist, COUNT(*) AS plays
        FROM playback_history
        WHERE played_at >= ?
        GROUP BY artist
        ORDER BY plays DESC, artist COLLATE NOCASE
        LIMIT ?
    `, [Date.now() - THIRTY_DAYS_MS, TOP_ARTISTS_LIMIT]);

    recent = newRecent;
    topArtists = newTopArtists;
    databaseError = '';
    window.Repaint();
}

function formatTime(timestamp) {
    return new Date(timestamp).toLocaleString();
}

function drawLine(gr, text, x, y, w, h, font, colour) {
    gr.GdiDrawText(
        text,
        font,
        colour,
        x,
        y,
        w,
        h,
        DT_LEFT | DT_VCENTER | DT_SINGLELINE | DT_END_ELLIPSIS | DT_NOPREFIX
    );
}

function on_playback_new_track(metadb) {
    addPlayback(metadb);
}

function on_paint(gr) {
    const width = window.Width;
    const height = window.Height;
    const margin = 14;
    const text = RGB(230, 230, 230);
    const muted = RGB(155, 155, 155);
    const accent = RGB(110, 190, 255);
    const error = RGB(255, 130, 130);

    gr.FillSolidRect(0, 0, width, height, RGB(28, 30, 34));

    let y = 10;
    drawLine(gr, 'SQLite 播放历史', margin, y, width - margin * 2, 28, fontTitle, text);
    y += 32;

    if (!db) {
        const message = databaseError
            ? `SQLite 错误：${databaseError}`
            : '无法打开播放历史数据库。';
        drawLine(gr, message, margin, y, width - margin * 2, 22, fontText, error);
        return;
    }

    if (databaseError) {
        drawLine(gr, `SQLite 错误：${databaseError}`, margin, y, width - margin * 2, 22, fontSmall, error);
        y += 24;
    }

    drawLine(gr, '热门艺人 — 最近30天', margin, y, width - margin * 2, 20, fontSmall, muted);
    y += 20;

    if (!topArtists.length) {
        drawLine(gr, '播放几首曲目以填充数据库。', margin, y, width - margin * 2, 22, fontText, muted);
        y += 28;
    } else {
        for (const row of topArtists) {
            drawLine(gr, `${row.artist}  —  ${row.plays}`, margin, y, width - margin * 2, 22, fontText, accent);
            y += 22;
        }
        y += 8;
    }

    drawLine(gr, '最近播放', margin, y, width - margin * 2, 20, fontSmall, muted);
    y += 22;

    for (const row of recent) {
        if (y + 38 > height) break;

        drawLine(gr, `${row.artist} — ${row.title}`, margin, y, width - margin * 2, 20, fontText, text);
        y += 19;

        const album = row.album ? ` • ${row.album}` : '';
        drawLine(gr, `${formatTime(row.played_at)}${album}`, margin, y, width - margin * 2, 17, fontSmall, muted);
        y += 23;
    }
}

function on_mouse_rbtn_up(x, y) {
    if (!db) return;

    const menu = window.CreatePopupMenu();
    menu.AppendMenuItem(MF_STRING, 1, '清除历史');

    if (menu.TrackPopupMenu(x, y) === 1) {
        try {
            db.Exec('DELETE FROM playback_history');
            refreshView();
        } catch (e) {
            reportDatabaseError(e);
        }
    }
}

function on_script_unload() {
    if (insertHistory) insertHistory.Close();
    if (db) db.Close();
}
