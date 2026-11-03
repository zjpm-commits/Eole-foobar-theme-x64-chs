// JSplitter 示例：Worker.RunAsync + 流式文本 I/O
//
// 演示 Worker.RunAsync()、utils.OpenTextReader() 和
// utils.OpenTextWriter() 的配合使用。TextReader/TextWriter 是同步的，
// 但整个文件任务运行在临时 Worker 中，因此面板 UI 保持响应。
// 文件是增量处理的，而不是作为一整个大字符串保存在内存中。

const sourcePath = fb.ProfilePath + 'streaming-io-source.jsonl';
const resultPath = fb.ProfilePath + 'streaming-io-filtered.txt';

async function runExample() {
    try {
        const result = await Worker.RunAsync((sourcePath, resultPath) => {
            const started = performance.now();
            const recordCount = 10000;

            // 增量创建 JSON Lines 源文件。
            // false = 无 BOM 的 UTF-8。
            const sourceWriter = utils.OpenTextWriter(sourcePath, false);
            if (!sourceWriter) {
                throw new Error(`无法创建 ${sourcePath}`);
            }

            try {
                for (let i = 0; i < recordCount; ++i) {
                    if (!sourceWriter.WriteLine(JSON.stringify({
                        id: i,
                        value: `项目 ${i}`
                    }))) {
                        throw new Error('写入源文件失败');
                    }
                }
            }
            finally {
                sourceWriter.Close();
            }

            // 逐行读取源文件，并写入一个小的过滤文件。
            const reader = utils.OpenTextReader(sourcePath);
            if (!reader) {
                throw new Error(`无法打开 ${sourcePath}`);
            }

            const writer = utils.OpenTextWriter(resultPath, false);
            if (!writer) {
                reader.Close();
                throw new Error(`无法创建 ${resultPath}`);
            }

            let read = 0;
            let written = 0;

            try {
                for (;;) {
                    const line = reader.ReadLine();
                    if (line === null) {
                        if (!reader.EOF) {
                            throw new Error('读取或解码源文件失败');
                        }
                        break;
                    }
                    if (!line.length) {
                        continue;
                    }

                    const item = JSON.parse(line);
                    ++read;

                    // 保留每第 1000 条记录作为可见结果。
                    if (item.id % 1000 === 0) {
                        if (!writer.WriteLine(`${item.id}\t${item.value}`)) {
                            throw new Error('写入结果文件失败');
                        }
                        ++written;
                    }
                }
            }
            finally {
                reader.Close();
                writer.Close();
            }

            return {
                read,
                written,
                elapsedMs: performance.now() - started
            };
        }, sourcePath, resultPath);

        console.log(
            `Worker.RunAsync 完成：读取 ${result.read} 条、写入 ${result.written} ` +
            `条记录，耗时 ${result.elapsedMs.toFixed(1)} 毫秒`
        );
        console.log(`输出：${resultPath}`);
    }
    catch (error) {
        console.log(`Worker.RunAsync 失败：${error.name}: ${error.message}`);
    }
}

runExample();
