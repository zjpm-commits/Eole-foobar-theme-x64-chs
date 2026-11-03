// 使用可复用的 Uint8Array 缓冲区进行流式二进制 I/O。
// Read() 会填充传入的缓冲区，而不是为每个分块分配新的类型化数组。
// 完整的复制操作运行在临时 Worker 中，因此面板 UI 保持响应。

const sourcePath = `${fb.ProfilePath}streaming-source.bin`;
const copyPath = `${fb.ProfilePath}streaming-copy.bin`;

async function copyFile() {
    try {
        const bytesCopied = await Worker.RunAsync((sourcePath, copyPath) => {
            const buffer = new Uint8Array(1024 * 1024);

            const reader = utils.OpenBinaryReader(sourcePath);
            if (!reader) {
                throw new Error(`无法打开：${sourcePath}`);
            }

            const writer = utils.OpenBinaryWriter(copyPath);
            if (!writer) {
                reader.Close();
                throw new Error(`无法创建：${copyPath}`);
            }

            try {
                while (!reader.EOF) {
                    const bytesRead = reader.Read(buffer);
                    if (!bytesRead) {
                        break;
                    }

                    // 只有前 bytesRead 个字节包含新读取的数据。
                    if (!writer.Write(buffer, 0, bytesRead)) {
                        throw new Error('写入失败');
                    }
                }

                if (!writer.Flush()) {
                    throw new Error('刷新失败');
                }

                return writer.Position;
            }
            finally {
                reader.Close();
                writer.Close();
            }
        }, sourcePath, copyPath);

        console.log(`已复制 ${bytesCopied} 字节`);
    }
    catch (error) {
        console.log(`复制失败：${error.name}: ${error.message}`);
    }
}

copyFile();
