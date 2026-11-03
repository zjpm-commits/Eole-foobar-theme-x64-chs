'use strict';

window.DefineScript('广播频道演示', {
    author: 'LUR',
    features: { drag_n_drop: true }
});
include('docs/Flags.js');
include('docs/Helpers.js');

/*
    如何使用本示例
    --------------
    1. 将同一个脚本添加到两个（或更多）JSplitter 面板中。
    2. 在其中一个面板的上部区域点击，即可广播一条简单的结构化消息。
    3. 将一个或多个曲目拖放到下部区域，即可广播一个 FbMetadbHandleList。
       频道中的每个面板都会显示第一个曲目的元数据，并从克隆的句柄在本地加载其封面。
       发送方会直接更新自己的视图，因为 BroadcastChannel 永远不会接收到自己的消息。
    4. 若想使用独立的频道组，请在所有副本中修改 CHANNEL_NAME。

    BroadcastChannel 是异步的并使用结构化克隆，因此接收方会获得消息数据
    和宿主包装对象的独立副本。它没有转移列表：广播消息会克隆数据，绝不会
    分离发送方的对象。当某个可转移资源的所有权应转移到特定的 Worker 时，
    请使用 Worker.postMessage()。
*/

const CHANNEL_NAME = 'jsplitter.broadcast-channel.demo';
const INSTANCE_ID = Math.random().toString(36).slice(2, 8);

const DROP_EFFECT = Object.freeze({
    none: 0,
    copy: 1,
    link: 4
});

const titleFont = gdi.Font('Segoe UI', 15, 1);
const headingFont = gdi.Font('Segoe UI', 12, 1);
const textFont = gdi.Font('Segoe UI', 11, 0);

const tfArtist = fb.TitleFormat('$if2(%artist%,(未知艺术家))');
const tfTitle = fb.TitleFormat('$if2(%title%,%filename%)');
const tfAlbum = fb.TitleFormat("$if2(%album%,(无专辑)) $if2('('%date%')',)");

const channel = new BroadcastChannel(CHANNEL_NAME);
let sentCount = 0;
let receivedCount = 0;
let statusText = '请在另一个 JSplitter 面板中打开此示例。';
let dragOverDropZone = false;

let currentHandles = null;
let currentTrack = null;
let currentArtwork = null;
let currentArtist = '';
let currentTitle = '';
let currentAlbum = '';
let currentTrackCount = 0;
let currentSourceText = '请在此拖入一个或多个曲目。';
let artworkGeneration = 0;

function layout() {
    const w = window.Width;
    const h = window.Height;
    const margin = 16;
    const clickY = 48;
    const clickH = 92;
    const gap = 12;
    const dropY = clickY + clickH + gap;

    return {
        click: {
            x: margin,
            y: clickY,
            w: Math.max(0, w - margin * 2),
            h: clickH
        },
        drop: {
            x: margin,
            y: dropY,
            w: Math.max(0, w - margin * 2),
            h: Math.max(0, h - dropY - margin)
        }
    };
}

function contains(rect, x, y) {
    return x >= rect.x && y >= rect.y && x < rect.x + rect.w && y < rect.y + rect.h;
}

function chooseDropEffect(action, accepted) {
    if (!accepted) {
        action.Effect = DROP_EFFECT.none;
        return;
    }

    const allowed = action.Effect;
    if (allowed & DROP_EFFECT.copy) {
        action.Effect = DROP_EFFECT.copy;
    } else if (allowed & DROP_EFFECT.link) {
        action.Effect = DROP_EFFECT.link;
    } else {
        action.Effect = DROP_EFFECT.none;
    }
}

function readTrackInfo(handle) {
    currentArtist = tfArtist.EvalWithMetadb(handle);
    currentTitle = tfTitle.EvalWithMetadb(handle);
    currentAlbum = tfAlbum.EvalWithMetadb(handle);
}

function showTracks(handles, sourceText) {
    if (!handles || !handles.Count) {
        return;
    }

    currentHandles = handles;
    currentTrack = handles[0];
    currentTrackCount = handles.Count;
    currentSourceText = sourceText;
    currentArtwork = null;
    readTrackInfo(currentTrack);

    const generation = ++artworkGeneration;
    window.Repaint();

    utils.GetAlbumArtAsyncV2(0, currentTrack, AlbumArtId.front, true, false, false).then(function (result) {
        if (generation !== artworkGeneration) {
            return;
        }

        currentArtwork = result && result.image ? result.image : null;
        window.Repaint();
    }, function (error) {
        if (generation !== artworkGeneration) {
            return;
        }

        currentArtwork = null;
        console.log('广播频道演示 封面加载错误', String(error));
        window.Repaint();
    });
}

function broadcastHello() {
    sentCount++;

    const message = {
        demo: 'jsplitter-broadcast-channel',
        kind: 'hello',
        from: INSTANCE_ID,
        sequence: sentCount,
        text: '来自另一个 JSplitter 面板的问候',
        sentAt: Date.now()
    };

    channel.postMessage(message);
    statusText = `已发送消息 #${sentCount}。`;

    console.log('广播频道演示 发送', {
        channel: channel.name,
        thisPanel: INSTANCE_ID,
        message: message
    });

    window.Repaint();
}

function broadcastTracks(handles) {
    sentCount++;

    showTracks(
        handles,
        `已在本地拖入，并以消息 #${sentCount} 广播。`
    );

    const message = {
        demo: 'jsplitter-broadcast-channel',
        kind: 'tracks',
        from: INSTANCE_ID,
        sequence: sentCount,
        handles: handles
    };

    channel.postMessage(message);
    statusText = `已将 ${handles.Count} 个曲目作为消息 #${sentCount} 广播。`;

    console.log('广播频道演示 发送曲目', {
        channel: channel.name,
        thisPanel: INSTANCE_ID,
        sequence: sentCount,
        count: handles.Count
    });

    window.Repaint();
}

channel.onmessage = function (event) {
    const message = event.data;
    if (!message || message.demo !== 'jsplitter-broadcast-channel') {
        return;
    }

    receivedCount++;

    if (message.kind === 'tracks' && message.handles && message.handles.Count) {
        showTracks(
            message.handles,
            `已从面板 ${message.from} 收到 ${message.handles.Count} 个曲目。`
        );
        statusText = `已收到来自面板 ${message.from} 的曲目消息 #${message.sequence}。`;
    } else {
        statusText = `已收到来自面板 ${message.from} 的消息 #${message.sequence}：${message.text}`;
    }

    console.log('广播频道演示 接收', {
        channel: channel.name,
        thisPanel: INSTANCE_ID,
        message: message
    });

    window.Repaint();
};

channel.onmessageerror = function (event) {
    statusText = '无法重建收到的消息：' +
        (event.errorMessage || '（无诊断文本）');
    console.log('广播频道演示 消息错误', statusText);
    window.Repaint();
};

function drawArtwork(gr, image, x, y, size) {
    if (!image || size <= 0) {
        gr.FillSolidRect(x, y, size, size, RGB(224, 224, 224));
        gr.DrawRect(x, y, size, size, 1, RGB(185, 185, 185));
        gr.GdiDrawText(
            '无封面',
            textFont,
            RGB(110, 110, 110),
            x + 6, y + 6, Math.max(0, size - 12), Math.max(0, size - 12),
            DT_CENTER | DT_VCENTER | DT_WORDBREAK | DT_NOPREFIX
        );
        return;
    }

    let sx = 0;
    let sy = 0;
    let sw = image.Width;
    let sh = image.Height;

    if (sw > sh) {
        sx = Math.floor((sw - sh) / 2);
        sw = sh;
    } else if (sh > sw) {
        sy = Math.floor((sh - sw) / 2);
        sh = sw;
    }

    gr.DrawImage(image, x, y, size, size, sx, sy, sw, sh);
}

function on_mouse_lbtn_up(x, y) {
    const areas = layout();
    if (contains(areas.click, x, y)) {
        broadcastHello();
    }
}

function on_drag_enter(action, x, y) {
    const inside = contains(layout().drop, x, y);
    dragOverDropZone = inside;
    chooseDropEffect(action, inside);
    window.Repaint();
}

function on_drag_over(action, x, y) {
    const inside = contains(layout().drop, x, y);
    if (inside !== dragOverDropZone) {
        dragOverDropZone = inside;
        window.Repaint();
    }
    chooseDropEffect(action, inside);
}

function on_drag_leave() {
    if (dragOverDropZone) {
        dragOverDropZone = false;
        window.Repaint();
    }
}

function on_drag_drop(action, x, y) {
    const inside = contains(layout().drop, x, y);
    const handles = inside ? action.Handles : null;
    const accepted = !!(handles && handles.Count);

    dragOverDropZone = false;
    chooseDropEffect(action, accepted);

    if (accepted) {
        broadcastTracks(handles);
    } else {
        statusText = inside
            ? '拖放的数据中不包含任何曲目句柄。'
            : '拖放已取消。';
        window.Repaint();
    }
}

function on_paint(gr) {
    const w = window.Width;
    const h = window.Height;
    const areas = layout();

    const background = RGB(245, 245, 245);
    const card = RGB(255, 255, 255);
    const border = RGB(190, 190, 190);
    const text = RGB(55, 55, 55);
    const secondary = RGB(105, 105, 105);
    const accent = RGB(70, 125, 190);

    gr.FillSolidRect(0, 0, w, h, background);

    gr.GdiDrawText(
        '广播频道演示',
        titleFont,
        RGB(35, 35, 35),
        16, 12, Math.max(0, w - 32), 28,
        DT_LEFT | DT_VCENTER | DT_SINGLELINE | DT_NOPREFIX
    );

    // 上部点击区域：原始的简单结构化消息演示。
    gr.FillSolidRect(areas.click.x, areas.click.y, areas.click.w, areas.click.h, card);
    gr.DrawRect(areas.click.x, areas.click.y, areas.click.w, areas.click.h, 1, border);
    gr.GdiDrawText(
        '点击以广播',
        headingFont,
        accent,
        areas.click.x + 12, areas.click.y + 8, Math.max(0, areas.click.w - 24), 22,
        DT_LEFT | DT_VCENTER | DT_SINGLELINE | DT_NOPREFIX
    );

    const topText =
        `频道：${CHANNEL_NAME}\n` +
        `本面板：${INSTANCE_ID}    已发送：${sentCount}    已接收：${receivedCount}\n` +
        statusText;

    gr.GdiDrawText(
        topText,
        textFont,
        text,
        areas.click.x + 12, areas.click.y + 32,
        Math.max(0, areas.click.w - 24), Math.max(0, areas.click.h - 40),
        DT_LEFT | DT_TOP | DT_WORDBREAK | DT_NOPREFIX
    );

    // 下部拖放区域：广播真实的 foobar2000 曲目句柄。
    const dropFill = dragOverDropZone ? RGB(235, 243, 252) : card;
    const dropBorder = dragOverDropZone ? accent : border;
    gr.FillSolidRect(areas.drop.x, areas.drop.y, areas.drop.w, areas.drop.h, dropFill);
    gr.DrawRect(areas.drop.x, areas.drop.y, areas.drop.w, areas.drop.h, dragOverDropZone ? 2 : 1, dropBorder);

    gr.GdiDrawText(
        dragOverDropZone ? '拖放曲目' : '曲目广播',
        headingFont,
        dragOverDropZone ? accent : text,
        areas.drop.x + 12, areas.drop.y + 8, Math.max(0, areas.drop.w - 24), 22,
        DT_LEFT | DT_VCENTER | DT_SINGLELINE | DT_NOPREFIX
    );

    const contentY = areas.drop.y + 38;
    const contentH = Math.max(0, areas.drop.h - 50);

    if (!currentTrack) {
        gr.GdiDrawText(
            '请在此拖入一个或多个曲目。\n\n' +
            '完整的 FbMetadbHandleList 会通过 BroadcastChannel 发送。\n' +
            '每个已订阅的面板都会读取第一个曲目的元数据，并在本地加载其封面。',
            textFont,
            secondary,
            areas.drop.x + 16, contentY,
            Math.max(0, areas.drop.w - 32), contentH,
            DT_CENTER | DT_VCENTER | DT_WORDBREAK | DT_NOPREFIX
        );
        return;
    }

    const artSize = Math.max(0, Math.min(150, contentH, Math.floor(areas.drop.w * 0.36)));
    const artX = areas.drop.x + 14;
    const artY = contentY + Math.max(0, Math.floor((contentH - artSize) / 2));
    drawArtwork(gr, currentArtwork, artX, artY, artSize);

    const infoX = artX + artSize + 16;
    const infoW = Math.max(0, areas.drop.x + areas.drop.w - 14 - infoX);
    const infoY = contentY + 4;

    const trackCountLine = currentTrackCount > 1
        ? `已收到 ${currentTrackCount} 个曲目 — 正在显示第一个曲目`
        : '1 个曲目';

    const info =
        `${currentArtist}\n` +
        `${currentTitle}\n` +
        `${currentAlbum}\n\n` +
        `${trackCountLine}\n` +
        currentSourceText;

    gr.GdiDrawText(
        info,
        textFont,
        text,
        infoX, infoY, infoW, Math.max(0, contentH - 8),
        DT_LEFT | DT_TOP | DT_WORDBREAK | DT_NOPREFIX
    );
}

function on_script_unload() {
    // 面板重载/卸载时频道会被自动清理，但当活动脚本只是要结束使用它时，
    // 显式调用 close() 才是正确做法。
    channel.close();
}
