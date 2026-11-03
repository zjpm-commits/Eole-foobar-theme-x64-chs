"use strict";

include(`${fb.ComponentPath}\\docs\\Flags.js`);

// JSplitter 的 RunCmdAsync 示例
//
// 演示内容：
// - 异步启动外部命令；
// - 按 task_id 匹配回调；
// - 处理 stdout/stderr；
// - 处理非零退出代码；
// - 处理超时；
// - 使用参数数组进行安全引用；
// - 使用工作目录；
// - 使用 FFmpeg 和 Essentia 等真实工具。
//
// 重要提示：
// 完成回调是异步的，到达顺序可能与 RunCmdAsync 的调用顺序不同。
// 务必始终使用 task_id 匹配结果。

const TIMEOUT_EXIT_CODE = 0xFFFFFFFF;

const pendingCommands = new Map();

function runCommand(name, app, args, options) {
    options = options || {};

    const workingDir = options.workingDir || "";
    const show = options.show !== undefined ? options.show : ShowWindow.Hide;
    const timeoutMs = options.timeoutMs || 0;

    let taskId;

    try {
        taskId = utils.RunCmdAsync(app, args, workingDir, show, timeoutMs);
    } catch (e) {
        // 同步异常保留给 API 使用错误，
        // 例如参数无效，或在初始化期间过早调用。
        console.log("[RunCmdAsync] 无法启动 '" + name + "': " + e);
        return 0;
    }

    pendingCommands.set(taskId, {
        name: name,
        startedAt: Date.now()
    });

    console.log("[RunCmdAsync] 已启动 #" + taskId + ": " + name);

    return taskId;
}

function on_run_cmd_async_done(task_id, success, exit_code, stdout, stderr) {
    const command = pendingCommands.get(task_id);

    if (!command) {
        // 如果另一个脚本部分也使用了 RunCmdAsync，
        // 或者该 task_id 未由本示例注册，就可能发生这种情况。
        console.log("[RunCmdAsync] 完成未知任务 #" + task_id);
        return;
    }

    pendingCommands.delete(task_id);

    const elapsedMs = Date.now() - command.startedAt;

    console.log("[RunCmdAsync] 完成 #" + task_id + ": " + command.name);
    console.log("  耗时: " + elapsedMs + " 毫秒");
    console.log("  成功: " + success);
    console.log("  退出代码: " + exit_code);

    if (stdout.length > 0) {
        console.log("  stdout:");
        console.log(stdout.trim());
    }

    if (stderr.length > 0) {
        // 某些工具（包括 FFmpeg）即使成功完成，也会把正常的
        // 进度/日志输出写到 stderr。
        // 非空 stderr 不一定意味着失败。
        console.log("  stderr:");
        console.log(stderr.trim());
    }

    if (exit_code === TIMEOUT_EXIT_CODE) {
        // 超时时，RunCmdAsync 会终止整个进程树。
        console.log("  结果: 超时");
    } else if (!success) {
        // success=false 也涵盖正常的非零进程退出代码。
        // 例如 "exit /b 7" 会得到 success=false、exit_code=7。
        console.log("  结果: 进程失败、超时，或返回了非零退出代码");
    }	 else {
        console.log("  结果: 正常");
    }
}

// 示例 1。
// 尽量优先使用参数数组。
// 每个参数会在需要时自动加引号。
runCommand(
    "回显文本",
    "cmd.exe",
    ["/c", "echo", "hello"]
);

// 示例 2。
// stdout 和 stderr 会被分开捕获。
runCommand(
    "捕获 stdout 和 stderr",
    "cmd.exe",
    '/c "echo stdout text & echo stderr text 1>&2"'
);

// 示例 3。
// 非零退出代码不是传输/API 失败。
// 回调会收到 success=false 和实际的进程退出代码。
runCommand(
    "返回退出代码 7",
    "cmd.exe",
    '/c "exit /b 7"'
);

// 示例 4。
// 工作目录会传递给 CreateProcess。
// 此命令应打印 C:\Windows。
runCommand(
    "在 C:\\Windows 中运行",
    "cmd.exe",
    '/c "cd"',
    {
        workingDir: "C:\\Windows"
    }
);

// 示例 5。
// 超时以毫秒为单位指定。
// 超时值为 0 表示无限等待。
// 超时时，回调会收到：
//   success=false
//   exit_code=0xFFFFFFFF
//   stderr 包含超时消息
runCommand(
    "5 秒后超时",
    "cmd.exe",
    '/c "ping 127.0.0.1 -n 11 >nul"',
    {
        timeoutMs: 5000
    }
);

// 示例 6。
// 空 app 会通过回调异步报告，
// 而不是作为同步异常抛出。
runCommand(
    "空应用示例",
    "",
    ""
);

// 下方真实示例用到的路径。
//
// 本示例使用 fb.ProfilePath 而不是硬编码的绝对路径，
// 因此不依赖某个特定的驱动器或用户配置文件。
//
// 运行 FFmpeg/Essentia 示例前，请将名为 "run_cmd_input.flac"
// 的测试音频文件放入 foobar2000 配置文件文件夹。

function combinePath(base, name) {
    if (base.length > 0 && base.charAt(base.length - 1) !== "\\" && base.charAt(base.length - 1) !== "/") {
        return base + "\\" + name;
    }

    return base + name;
}

const sampleInputAudio = combinePath(fb.ProfilePath, "run_cmd_input.flac");
const sampleMp3Output = combinePath(fb.ProfilePath, "run_cmd_output.mp3");
const sampleCoverOutput = combinePath(fb.ProfilePath, "run_cmd_cover.jpg");
const sampleFeaturesOutput = combinePath(fb.ProfilePath, "run_cmd_features.json");

// 如果工具不在 PATH 中，请使用完整的可执行文件路径。
const ffmpegExe = "ffmpeg.exe";
const essentiaExe = "essentia_streaming_extractor_music.exe";

// 示例 7。
// FFmpeg：转码一个音频文件。
//
// FFmpeg 即使成功，也会把进度和诊断信息写到 stderr。
// 请检查 success 和 exit_code，而不要把非空 stderr 当作失败。

runCommand(
    "FFmpeg 转码 FLAC 为 MP3",
    ffmpegExe,
    [
        "-hide_banner",
        "-y",
        "-i", sampleInputAudio,
        "-vn",
        "-codec:a", "libmp3lame",
        "-q:a", "2",
        sampleMp3Output
    ]
);

// 示例 8。
// FFmpeg：从音频文件提取内嵌封面。
//
// 这是为什么优先使用参数数组的很好的例子：
// 文件路径可能包含空格，每个参数都会被自动加引号。

runCommand(
    "FFmpeg 提取内嵌封面",
    ffmpegExe,
    [
        "-hide_banner",
        "-y",
        "-i", sampleInputAudio,
        "-an",
        "-vcodec", "copy",
        sampleCoverOutput
    ],
    {
        timeoutMs: 30000
    }
);

// 示例 9。
// Essentia：提取音频特征。
//
// 可执行文件的名称/路径取决于 Essentia 的安装或打包方式。
// 常见名称是 "streaming_extractor_music.exe" 或
// "essentia_streaming_extractor_music.exe"。
//
// 请根据你的 Essentia 构建/配置调整可执行文件名称和参数。

runCommand(
    "Essentia 提取音乐特征",
    essentiaExe,
    [
        sampleInputAudio,
        sampleFeaturesOutput
    ],
    {
        timeoutMs: 120000
    }
);
