// JSplitter 示例：聚焦曲目波形
//
// 适用于“解码过程中就应显示”的波形的推荐模式：
// 1. 对整个请求范围一次性调用 GetWaveformAsync()。
// 2. 进度分块到达后立即保存。
// 3. 用一个独立的可见前端动画逼近已加载的前端，而不是把每个原生进度分块
//    都绘制成一个可见步骤。
// 4. 当请求已过时时，在进度回调中返回 false；这会取消原生解码。
//
// 这样整个过程中只打开一个解码器，并给出平滑的渐进式渲染，
// 而无需根据曲目时长或编解码器速度来预测完成时间。
//
// GetWaveformAsync 返回 0.0..1.0 的振幅包络。每个值是一个时间区间的
// 幅度，因此同一个值会在中心线上、下方镜像显示。

const WAVEFORM_POINTS = 2048;
const REVEAL_INTERVAL_MS = 16;
const FOLLOW_SETTLE_POINTS = 0.5;

const BG_COLOR       = RGBA(24, 24, 24, 255);
const WAVEFORM_COLOR = RGBA(160, 185, 90, 255);
const CENTER_COLOR   = RGBA(255, 255, 255, 32);
const TEXT_COLOR     = RGBA(220, 220, 220, 255);

const DT_CENTER     = 0x00000001;
const DT_VCENTER    = 0x00000004;
const DT_SINGLELINE = 0x00000020;

const font = gdi.Font('Segoe UI', 13);

let waveform = null;
let loadedPoints = 0;
let visiblePosition = 0;
let visiblePoints = 0;
let followSpeed = 0;
let loading = false;
let loadToken = 0;
let decodeStartedMs = 0;
let revealLastUpdateMs = 0;
let revealTimer = 0;

function RGBA(r, g, b, a) {
    return (a << 24) | (r << 16) | (g << 8) | b;
}

function stopRevealTimer() {
    if (!revealTimer) return;
    clearInterval(revealTimer);
    revealTimer = 0;
}

function updateReveal() {
    if (!waveform) {
        stopRevealTimer();
        return;
    }

    const now = performance.now();
    const last = revealLastUpdateMs || now;
    const elapsed = Math.max(0, now - last);
    revealLastUpdateMs = now;

    const loaded = Math.max(0, Math.min(waveform.length, loadedPoints));
    const gap = loaded - visiblePosition;

    if (gap <= FOLLOW_SETTLE_POINTS) {
        visiblePosition = loaded;
    }
    else if (elapsed > 0 && followSpeed > 0) {
        // 以生产者真实的累计解码速率跟随它。即使原生进度是分块到达的，
        // 可见前端仍能保持平滑。
        visiblePosition = Math.min(
            loaded,
            visiblePosition + followSpeed * elapsed
        );
    }

    visiblePoints = Math.min(loaded, Math.floor(visiblePosition));
    window.Repaint();

    if (!loading && visiblePosition >= waveform.length - FOLLOW_SETTLE_POINTS) {
        visiblePosition = waveform.length;
        visiblePoints = waveform.length;
        stopRevealTimer();
        window.Repaint();
    }
}

function ensureRevealTimer() {
    if (revealTimer || !waveform || loadedPoints <= 0) return;
    revealLastUpdateMs = performance.now();
    revealTimer = setInterval(updateReveal, REVEAL_INTERVAL_MS);
}

async function loadWaveform() {
    const token = ++loadToken;
    const handle = fb.GetFocusItem();

    stopRevealTimer();
    waveform = null;
    loadedPoints = 0;
    visiblePosition = 0;
    visiblePoints = 0;
    followSpeed = 0;
    loading = false;

    if (!handle) {
        window.Repaint();
        return;
    }

    waveform = new Float32Array(WAVEFORM_POINTS);
    loading = true;
    decodeStartedMs = performance.now();
    window.Repaint();

    try {
        const complete = await utils.GetWaveformAsync(
            handle,
            WAVEFORM_POINTS,
            0,
            0,
            (values, start) => {
                // 此曲目仍在解码时焦点发生了变化。
                // 返回 false 会取消原生解码。
                if (token !== loadToken) {
                    return false;
                }

                waveform.set(values, start);
                loadedPoints = Math.max(loadedPoints, start + values.length);

                const elapsedMs = Math.max(0, performance.now() - decodeStartedMs);
                if (elapsedMs > 0 && loadedPoints > 0) {
                    followSpeed = loadedPoints / elapsedMs;
                }

                ensureRevealTimer();
                return true;
            }
        );

        if (token !== loadToken) {
            return;
        }

        // 渐进式交付结束后，Promise 仍会返回完整的包络。
        waveform = complete;
        loadedPoints = complete.length;
        loading = false;

        const elapsedMs = Math.max(0, performance.now() - decodeStartedMs);
        if (elapsedMs > 0 && loadedPoints > 0) {
            followSpeed = loadedPoints / elapsedMs;
        }

        ensureRevealTimer();
        window.Repaint();
    }
    catch (e) {
        // 过时请求被取消是预期的行为。
        if (token !== loadToken) {
            return;
        }

        loading = false;
        stopRevealTimer();
        waveform = null;
        loadedPoints = 0;
        visiblePosition = 0;
        visiblePoints = 0;
        console.log(`GetWaveformAsync 失败：${e}`);
        window.Repaint();
    }
}

function displayValueAtColumn(x, width) {
    if (!waveform || width <= 0 || visiblePoints <= 0) return 0;

    const sourceCount = waveform.length;

    if (width <= sourceCount) {
        const from = Math.floor(x * sourceCount / width);
        if (from >= visiblePoints) return 0;

        const to = Math.max(from + 1, Math.ceil((x + 1) * sourceCount / width));
        const limit = Math.min(visiblePoints, to);
        let sum = 0;
        let count = 0;

        for (let i = from; i < limit; ++i) {
            sum += waveform[i] || 0;
            ++count;
        }
        return count ? sum / count : 0;
    }

    const scale = sourceCount > 1 ? (sourceCount - 1) / Math.max(1, width - 1) : 0;
    const at = x * scale;
    if (at >= visiblePoints) return 0;

    const lo = Math.min(visiblePoints - 1, Math.floor(at));
    const hi = Math.min(visiblePoints - 1, lo + 1);
    const t = at - lo;
    return (waveform[lo] || 0) * (1 - t) + (waveform[hi] || 0) * t;
}

function drawWaveform(gr, w, h) {
    if (!waveform || visiblePoints <= 0 || w <= 0 || h <= 0) {
        return;
    }

    const centerY = h * 0.5;
    const maxAmplitude = h * 0.44;
    const visibleColumns = Math.min(
        w,
        Math.ceil(visiblePosition * w / waveform.length)
    );

    gr.DrawLine(0, centerY, w, centerY, 1, CENTER_COLOR);

    // 将原生包络重采样为屏幕列。当多个波形点映射到同一像素时，
    // 进行平均可以让显示保持干净并贴近预期的包络，而不是让瞬态变得
    // 不自然地密集。
    for (let x = 0; x < visibleColumns; ++x) {
        const amplitude = displayValueAtColumn(x, w) * maxAmplitude;
        gr.DrawLine(
            x,
            centerY - amplitude,
            x,
            centerY + amplitude,
            1,
            WAVEFORM_COLOR
        );
    }
}

function drawStatus(gr, w) {
    if (!loading || !waveform) {
        return;
    }

    const percent = Math.floor(loadedPoints * 100 / waveform.length);
    gr.GdiDrawText(
        `正在解码波形… ${percent}%`,
        font,
        TEXT_COLOR,
        0,
        8,
        w,
        24,
        DT_CENTER | DT_VCENTER | DT_SINGLELINE
    );
}

function drawNoTrack(gr, w, h) {
    gr.GdiDrawText(
        '请选择一个曲目',
        font,
        TEXT_COLOR,
        0,
        0,
        w,
        h,
        DT_CENTER | DT_VCENTER | DT_SINGLELINE
    );
}

function on_paint(gr) {
    const w = window.Width;
    const h = window.Height;

    gr.FillSolidRect(0, 0, w, h, BG_COLOR);

    if (waveform) {
        drawWaveform(gr, w, h);
        drawStatus(gr, w);
    }
    else {
        drawNoTrack(gr, w, h);
    }
}

function on_item_focus_change() {
    loadWaveform();
}

function on_script_unload() {
    // 让正在活动的进度回调在再次被调用时返回 false。
    ++loadToken;
    stopRevealTimer();
}

loadWaveform();
