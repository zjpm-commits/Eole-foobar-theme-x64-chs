"use strict";

window.DrawMode = 1;

include(`${fb.ComponentPath}\\docs\\Flags.js`);

const BG = 0xFFF5F6F7;
const PANEL = 0xFFFFFFFF;
const BORDER = 0xFFD7DADF;
const TEXT = 0xFF202327;
const MUTED = 0xFF737980;
const ACCENT = 0xFF3169C6;
const GUIDE = 0xFFB8BDC4;

const fontTitle = gdi.Font("Segoe UI", 22, 1);
const fontSection = gdi.Font("Segoe UI", 15, 1);
const fontLabel = gdi.Font("Segoe UI", 12, 0);
const fontSmall = gdi.Font("Segoe UI", 10, 0);

// StrokeStyle 对象是设备无关的资源。只需创建一次并
// 在 on_paint 中复用，而不是每帧都重新构建样式。
const joinStyles = [
    ["斜接", d2d.StrokeStyle({ lineJoin: LineJoin.Miter })],
    ["斜角", d2d.StrokeStyle({ lineJoin: LineJoin.Bevel })],
    ["圆角", d2d.StrokeStyle({ lineJoin: LineJoin.Round })],
    ["斜接或斜角", d2d.StrokeStyle({ lineJoin: LineJoin.MiterOrBevel, miterLimit: 2 })]
];

const capStyles = [
    ["平面", d2d.StrokeStyle({ startCap: CapStyle.Flat, endCap: CapStyle.Flat })],
    ["方形", d2d.StrokeStyle({ startCap: CapStyle.Square, endCap: CapStyle.Square })],
    ["圆形", d2d.StrokeStyle({ startCap: CapStyle.Round, endCap: CapStyle.Round })],
    ["三角形", d2d.StrokeStyle({ startCap: CapStyle.Triangle, endCap: CapStyle.Triangle })]
];

const dashStyles = [ // 预定义点样式在省略 dashCap 时自动使用圆形虚线端点。
    ["实线", d2d.StrokeStyle({ dashStyle: DashStyle.Solid })],
    ["虚线", d2d.StrokeStyle({ dashStyle: DashStyle.Dash })],
    ["点线", d2d.StrokeStyle({ dashStyle: DashStyle.Dot })],
    ["点划线", d2d.StrokeStyle({ dashStyle: DashStyle.DashDot })],
    ["双点划线", d2d.StrokeStyle({ dashStyle: DashStyle.DashDotDot })],
    ["自定义 4,2,1,2", d2d.StrokeStyle({
        dashes: [4, 2, 1, 2],
        dashCap: CapStyle.Round
    })]
];

const shapeStyles = {
    rect: d2d.StrokeStyle({
        dashStyle: DashStyle.Dash,
        dashCap: CapStyle.Round
    }),
    roundRect: d2d.StrokeStyle({
        dashStyle: DashStyle.DashDot,
        lineJoin: LineJoin.Round
    }),
    ellipse: d2d.StrokeStyle({
        dashStyle: DashStyle.Dot
    }),
    polygon: d2d.StrokeStyle({
        lineJoin: LineJoin.Round,
        startCap: CapStyle.Round,
        endCap: CapStyle.Round
    })
};

let ww = 0;
let wh = 0;

function on_size(width, height) {
    ww = width;
    wh = height;
}

function card(gr, x, y, w, h) {
    gr.FillSolidRect(x, y, w, h, PANEL);
    gr.DrawRect(x, y, w, h, 1, BORDER);
}

function label(gr, text, x, y, w, h, small = false) {
    gr.DrawText(text, small ? fontSmall : fontLabel, TEXT, x, y, w, h,
        DT_CENTER | DT_VCENTER | DT_SINGLELINE);
}

function sectionTitle(gr, text, x, y, w) {
    gr.DrawText(text, fontSection, TEXT, x, y, w, 28, DT_LEFT | DT_VCENTER | DT_SINGLELINE);
}

function drawJoinSection(gr, x, y, w, h) {
    sectionTitle(gr, "线条连接", x, y, w);
    y += 32;
    h -= 32;

    const gap = 10;
    const cw = (w - gap * (joinStyles.length - 1)) / joinStyles.length;

    for (let i = 0; i < joinStyles.length; ++i) {
        const cx = x + i * (cw + gap);
        card(gr, cx, y, cw, h);
        label(gr, joinStyles[i][0], cx, y + 5, cw, 22);

        const top = y + 37;
        const bottom = y + h - 18;
        const mid = cx + cw / 2;
        const inset = Math.max(18, cw * 0.18);
        gr.DrawLines(ACCENT, 12, [
            cx + inset, bottom,
            mid, top,
            cx + cw - inset, bottom
        ], joinStyles[i][1]);
    }
}

function drawCapSection(gr, x, y, w, h) {
    sectionTitle(gr, "线条端点", x, y, w);
    y += 32;
    h -= 32;

    const gap = 10;
    const cw = (w - gap * (capStyles.length - 1)) / capStyles.length;

    for (let i = 0; i < capStyles.length; ++i) {
        const cx = x + i * (cw + gap);
        card(gr, cx, y, cw, h);
        label(gr, capStyles[i][0], cx, y + 5, cw, 22);

        const cy = y + h * 0.63;
        const x1 = cx + Math.max(30, cw * 0.24);
        const x2 = cx + cw - Math.max(30, cw * 0.24);

        // 参考线用于显示每个端点超出线条终点的延伸量。
        gr.DrawLine(x1, cy - 22, x1, cy + 22, 1, GUIDE);
        gr.DrawLine(x2, cy - 22, x2, cy + 22, 1, GUIDE);
        gr.DrawLine(x1, cy, x2, cy, 14, ACCENT, capStyles[i][1]);
    }
}

function drawDashSection(gr, x, y, w, h) {
    sectionTitle(gr, "虚线样式", x, y, w);
    y += 32;
    h -= 32;

    const cols = 3;
    const rows = 2;
    const gapX = 10;
    const gapY = 8;
    const cw = (w - gapX * (cols - 1)) / cols;
    const ch = (h - gapY * (rows - 1)) / rows;

    for (let i = 0; i < dashStyles.length; ++i) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const cx = x + col * (cw + gapX);
        const cy = y + row * (ch + gapY);
        card(gr, cx, cy, cw, ch);
        label(gr, dashStyles[i][0], cx, cy + 2, cw, 20, true);
        gr.DrawLine(cx + 16, cy + ch * 0.65, cx + cw - 16, cy + ch * 0.65,
            6, ACCENT, dashStyles[i][1]);
    }
}

function drawShapeSection(gr, x, y, w, h) {
    sectionTitle(gr, "使用 StrokeStyle 的形状", x, y, w);
    y += 32;
    h -= 32;

    const gap = 10;
    const cw = (w - gap * 3) / 4;

    for (let i = 0; i < 4; ++i) {
        card(gr, x + i * (cw + gap), y, cw, h);
    }

    const inset = 22;
    const sy = y + 36;
    const sh = h - 54;

    let cx = x;
    label(gr, "DrawRect", cx, y + 4, cw, 22);
    gr.DrawRect(cx + inset, sy, cw - inset * 2, sh, 5, ACCENT, shapeStyles.rect);

    cx = x + (cw + gap);
    label(gr, "DrawRoundRect", cx, y + 4, cw, 22);
    gr.DrawRoundRect(cx + inset, sy, cw - inset * 2, sh, 16, 16, 5, ACCENT, shapeStyles.roundRect);

    cx = x + 2 * (cw + gap);
    label(gr, "DrawEllipse", cx, y + 4, cw, 22);
    gr.DrawEllipse(cx + inset, sy, cw - inset * 2, sh, 5, ACCENT, shapeStyles.ellipse);

    cx = x + 3 * (cw + gap);
    label(gr, "DrawPolygon", cx, y + 4, cw, 22);
    gr.DrawPolygon(ACCENT, 7, [
        cx + cw * 0.50, sy,
        cx + cw - inset, sy + sh * 0.38,
        cx + cw * 0.72, sy + sh,
        cx + cw * 0.28, sy + sh,
        cx + inset, sy + sh * 0.38
    ], shapeStyles.polygon);
}

function on_paint(gr) {
    gr.SetSmoothingMode(2);
    gr.FillSolidRect(0, 0, ww, wh, BG);

    const margin = 18;

    // 在面板尺寸较小时保持示例可读：布局可以随面板
    // 增大，但绝不会缩小到此画布以下。如果面板更小，
    // 正常的窗口裁剪会自动隐藏超出视口的部分。
    const contentW = Math.max(900, ww - margin * 2);

    gr.DrawText("Direct2D 线条样式", fontTitle, TEXT,
        margin, 10, contentW, 34, DT_LEFT | DT_VCENTER | DT_SINGLELINE);
    gr.DrawText("可复用的端点、连接和虚线样式，用于 DrawLine / DrawLines / DrawPolygon 及形状轮廓",
        fontSmall, MUTED, margin, 43, contentW, 22, DT_LEFT | DT_VCENTER | DT_SINGLELINE);

    const top = 75;
    const bottom = 18;
    const availableH = Math.max(590, wh - top - bottom);
    const rowGap = 14;
    const row1 = Math.max(170, availableH * 0.29);
    const row2 = Math.max(170, availableH * 0.27);
    const row3 = Math.max(220, availableH - row1 - row2 - rowGap * 2);

    drawJoinSection(gr, margin, top, contentW, row1);

    const halfGap = 14;
    const halfW = (contentW - halfGap) / 2;
    const secondY = top + row1 + rowGap;
    drawCapSection(gr, margin, secondY, halfW, row2);
    drawDashSection(gr, margin + halfW + halfGap, secondY, halfW, row2);

    const thirdY = secondY + row2 + rowGap;
    drawShapeSection(gr, margin, thirdY, contentW, row3);
}
