"use strict";

include(`${fb.ComponentPath}\\docs\\Flags.js`);

// JSplitter 的 utils.Run 示例
//
// 演示内容：
// - 通过 Windows shell 运行可执行文件；
// - 打开 URL 和文件夹；
// - 使用 shell 动词；
// - 检查 RunResult；
// - 等待进程退出代码；
// - 使用参数数组；
// - 使用工作目录；
// - 启动 FFmpeg 等真实工具。
//
// 重要提示：
// utils.Run 使用 ShellExecuteEx。
// 它不会捕获 stdout 或 stderr。
// 如果需要 stdout/stderr、超时或异步完成回调，
// 请改用 utils.RunCmdAsync。
//
// 同样重要：
// RunResult.OK 只表示 ShellExecuteEx 接受了请求。
// 它并不一定意味着已启动的进程成功完成。
// 如果 wait=true，请单独检查 ExitCode。

"use strict";

function combinePath(base, name) {
    if (base.length > 0 && base.charAt(base.length - 1) !== "\\" && base.charAt(base.length - 1) !== "/") {
        return base + "\\" + name;
    }

    return base + name;
}

function logRunResult(name, result) {
    console.log("[utils.Run] " + name);
    console.log("  OK: " + result.OK);
    console.log("  ExitCode: " + result.ExitCode);
    console.log("  Win32Error: " + result.Win32Error);
    console.log("  ShellCode: " + result.ShellCode);

    if (result.OK) {
        console.log("  结果: 正常");
    } else if (result.Win32Error !== 0) {
        console.log("  结果: shell 请求失败");
    } else if (result.ExitCode !== 0) {
        console.log("  结果: 进程返回了非零退出代码");
    } else {
        console.log("  结果: 失败");
    }
}

function runShell(name, target, args, options) {
    options = options || {};

    const workingDir = options.workingDir || "";
    const verb = options.verb || "";
    const show = options.show !== undefined ? options.show : ShowWindow.Hide;
    const wait = options.wait === true;

    const result = utils.Run(
        target,
        args,
        workingDir,
        verb,
        show,
        wait
    );

    logRunResult(name, result);

    return result;
}

// 示例 1。
// 使用默认浏览器打开一个 URL。
//
// wait=false 时，OK 只表示 shell 接受了请求。
// 它并不能说明浏览器是否成功加载了页面。

runShell(
    "打开 URL",
    "https://www.foobar2000.org",
    undefined,
    {
        show: ShowWindow.Show
    }
);

// 示例 2。
// 使用默认 shell 操作打开 foobar2000 配置文件文件夹。

runShell(
    "打开配置文件文件夹",
    fb.ProfilePath,
    undefined,
    {
        verb: "open",
        show: ShowWindow.Show
    }
);

// 示例 3。
// 运行一条命令并等待其进程退出代码。
//
// OK=true 表示 ShellExecuteEx 启动了进程。
// 因为使用了 wait=true，ExitCode 包含进程退出代码。

runShell(
    "cmd.exe 退出 0",
    "cmd.exe",
    '/c "exit /b 0"',
    {
        wait: true
    }
);

// 示例 4。
// 非零的进程退出代码不会让 OK 变为 false。
//
// 预期输出：
//   OK=true
//   ExitCode=7

runShell(
    "cmd.exe 退出 7",
    "cmd.exe",
    '/c "exit /b 7"',
    {
        wait: true
    }
);

// 示例 5。
// 工作目录。
//
// utils.Run 不捕获 stdout，因此本示例把 "cd" 的结果
// 写入 fb.ProfilePath 内的一个文件。

runShell(
    "将当前目录写入配置文件",
    "cmd.exe",
    '/c "cd > run_current_directory.txt"',
    {
        workingDir: fb.ProfilePath,
        wait: true
    }
);

// 示例 6。
// 参数数组。
//
// 传入数组时，每个参数会在需要时自动加引号。
// 这最适合带独立参数的常规可执行文件。
//
// 对于带重定向、管道、&、&& 等的复杂 cmd.exe 命令，
// 原始字符串通常更自然。

runShell(
    "ping 本地主机一次",
    "ping.exe",
    ["127.0.0.1", "-n", "1"],
    {
        wait: true
    }
);

// 示例 7。
// 无效目标。
//
// utils.Run 会通过 RunResult 报告这一点，而不是抛出异常。
// 预期输出：
//   OK=false
//   Win32Error=87
//
// 87 是 ERROR_INVALID_PARAMETER。

runShell(
    "空目标",
    "",
    undefined,
    {
        wait: true
    }
);

// 示例 8。
// 通过 utils.Run 使用 FFmpeg。
//
// 本示例使用 fb.ProfilePath 而不是硬编码的绝对路径。
// 运行本示例前，请将名为 "run_cmd_input.flac" 的测试文件
// 放入 foobar2000 配置文件文件夹。
//
// 如果 PATH 中没有 ffmpeg.exe，请使用完整的可执行文件路径。
//
// 注意：
// FFmpeg 通常会把进度和诊断信息写到 stderr。
// utils.Run 不捕获 stdout/stderr。如果需要 FFmpeg 日志、
// 超时处理或异步完成通知，请使用 utils.RunCmdAsync。

const ffmpegExe = "ffmpeg.exe";
const sourceAudio = combinePath(fb.ProfilePath, "run_cmd_input.flac");
const mp3Output = combinePath(fb.ProfilePath, "run_output.mp3");

runShell(
    "FFmpeg 转码 FLAC 为 MP3",
    ffmpegExe,
    [
        "-hide_banner",
        "-y",
        "-i", sourceAudio,
        "-vn",
        "-codec:a", "libmp3lame",
        "-q:a", "2",
        mp3Output
    ],
    {
        wait: true
    }
);

// 示例 9。
// 通过 "runas" 动词提升权限。
//
// 因为会显示 UAC 提示，本示例故意不自动执行。
// 如果想测试它，请取消注释。

/*
runShell(
    "以提升权限运行记事本",
    "notepad.exe",
    undefined,
    {
        verb: "runas",
        show: ShowWindow.Show,
        wait: false
    }
);
*/
