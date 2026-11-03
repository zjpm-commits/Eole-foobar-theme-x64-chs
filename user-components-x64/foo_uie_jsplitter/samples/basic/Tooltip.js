window.DefineScript('提示气泡', { author: 'T.P Wang' });
include('docs/Helpers.js');

const g_font = gdi.Font('Segoe UI', 14, 1);
const g_tooltip = window.Tooltip;

let g_down = false;
let SampleButtons = undefined;

let btn_down = null;
let cur_btn = null;

let ww, wh;

function SampleButton(x, y, w, h, caption, func, tiptext) {
    // '构造函数'内容
    this.left = x;
    this.top = y;
    this.w = w;
    this.h = h;
    this.right = x + w;
    this.bottom = y + h;
    this.caption = caption;
    this.func = func;
    this.tiptext = tiptext;

    // 判断坐标是否位于该按钮内
    this.traceMouse = function(x, y) {
        return (this.left < x) && (x < this.right) && (this.top < y) && (y < this.bottom);
    };

    this.draw = function(gr) {
        // 绘制边框
        // RGB 函数定义在 docs/Helpers.js 中
        gr.FillRoundRect(this.left, this.top, this.w, this.h, 3, 3, RGB(19, 30, 38));
        gr.DrawRoundRect(this.left, this.top, this.w, this.h, 3, 3, 1, RGB(151, 180, 202));
        // 绘制标题
        gr.DrawString(this.caption, g_font, RGB(0xc0, 0xc0, 0xc0), this.left, this.top, this.w, this.h, 0x11005000);
    };

    this.onClick = function() {
        this.func && this.func(x, y);
    };

    this.onMouseIn = function() {
        // 更新提示文本
        g_tooltip.Text = this.tiptext;
        g_tooltip.Activate();
    };

    this.onMouseOut = function() {
        // 隐藏提示
        g_tooltip.Deactivate();
    }
}

function buttonsDraw(gr) {
    for (let i in SampleButtons) {
        SampleButtons[i].draw(gr);
    }
}

function buttonsTraceMouse(x, y) {
    let btn = null;

    for (let i in SampleButtons) {
        if (SampleButtons[i].traceMouse(x, y) && !btn) btn = SampleButtons[i];
    }

    return btn;
}

function on_mouse_move(x, y) {
    let btn = buttonsTraceMouse(x, y);

    if (btn !== cur_btn) {
        cur_btn && cur_btn.onMouseOut();
        btn && btn.onMouseIn();
    }

    if (btn !== btn_down) {
        btn_down = null;
    }

    cur_btn = btn;
}

function on_mouse_lbtn_down(x, y) {
    g_down = true;
    btn_down = cur_btn;
}

function on_mouse_lbtn_up(x, y) {
    if (cur_btn) {
        if (btn_down === cur_btn) cur_btn.onClick(x, y);
    }

    g_down = false;
}

function on_paint(gr) {
    gr.SetTextRenderingHint(5); // clear type
    gr.SetSmoothingMode(4); // Anti-Alias 抗锯齿
    gr.FillSolidRect(0, 0, ww, wh, utils.GetSysColour(15));
    buttonsDraw(gr);
}

function on_size() {
    ww = window.Width;
    wh = window.Height;

    let buttonY = 5;

    SampleButtons = {
        stop: new SampleButton(5, buttonY, 70, 30, '停止', function() {
            fb.Stop();
        },
        '停止'),
        prev: new SampleButton(80, buttonY, 70, 30, '上一首', function() {
            fb.Prev();
        },
        '上一首'),
        play: new SampleButton(155, buttonY, 70, 30, '播放', function() {
            fb.Play();
        },
        '播放'),
        pause: new SampleButton(230, buttonY, 70, 30, '暂停', function() {
            fb.Pause();
        },
        '暂停'),
        next: new SampleButton(305, buttonY, 70, 30, '下一首', function() {
            fb.Next();
        },
        '下一首'),
        rand: new SampleButton(380, buttonY, 70, 30, '随机', function() {
            fb.Random();
        },
        '随机')
    };
}
