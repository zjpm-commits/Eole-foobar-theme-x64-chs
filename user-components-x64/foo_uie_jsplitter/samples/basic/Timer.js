window.DefineScript('定时器', { author: 'T.P Wang' });

// 本示例创建两个定时器
// 点击窗口以启动定时器，控制台显示后再查看结果。
// 再次点击窗口以终止所有定时器。

let g_timer_started = false;
let g_count = 0;
let g_timer1_ID = 0, g_timer2_ID = 0;

function print_to_console(msg) {
    console.log('定时器测试：', msg);
}

function on_mouse_lbtn_up() {
    if (!g_timer_started) {
        // 在这里创建定时器
        // 2 秒 - 一次性，发生在 2000 毫秒后，仅一次
        g_timer1_ID = setTimeout(() => {
            // 打印并显示控制台
            fb.ShowConsole();
            print_to_console('g_timer1: 现在显示控制台。');
        }, 2000);

        // 500 毫秒 - 周期性，每 500 毫秒发生一次
        g_timer2_ID = setInterval(() => {
            g_count++;
            print_to_console('g_timer2: ' + g_count + ' 次。');
        }, 500);

        g_timer_started = true;
    }
    else {
        // 终止所有定时器
        clearTimeout(g_timer2_ID);
        clearInterval(g_timer1_ID);
        g_timer_started = false;
        g_count = 0;
        print_to_console('定时器已终止。');
    }
}
