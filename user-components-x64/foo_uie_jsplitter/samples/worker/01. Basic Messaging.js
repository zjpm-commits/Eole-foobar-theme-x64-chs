'use strict';

// Worker 示例 1：基础消息通信
// 演示：Worker 生命周期、结构化克隆消息、消息/错误处理与关闭。
// 为何使用 Worker：这是较大示例所使用的最小完整模式。

const workerSource = String.raw`
'use strict';

onmessage = function (event) {
    const values = event.data.values;
    const doubled = values.map(value => value * 2);

    postMessage({
        input: values,
        output: doubled,
        workerName: self.name
    });

    // 当前消息任务允许完成，然后此 Worker 退出。
    close();
};

onmessageerror = function (event) {
    console.log('Worker 无法重建传入的消息。');
    console.log('方向：' + event.direction);
    console.log('原因：' + (event.errorMessage || '（无诊断信息）'));
};
`;

const worker = new Worker(workerSource, 'basic-messaging');

worker.onmessage = function (event) {
    console.log(JSON.stringify(event.data));
};

worker.onmessageerror = function (event) {
    console.log('面板无法重建 Worker 消息。');
    console.log(`方向：${event.direction}`);
    console.log(`原因：${event.errorMessage || '（无诊断信息）'}`);
};

worker.onerror = function (event) {
    console.log(`Worker 错误：${event.message}`);
};

worker.postMessage({ values: [1, 2, 3, 4] });

function on_script_unload() {
    // 面板卸载时显式终止是可选的：JSplitter 会自动终止仍由面板拥有的 Worker。
    // 在此处调用 terminate() 也是安全的，包括在本示例 Worker 已调用 close() 之后。
    worker.terminate();
}
