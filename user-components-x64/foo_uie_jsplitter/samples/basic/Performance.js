"use strict";

/*
 * 性能 / 用户计时 API 示例
 *
 * 演示内容：
 *   - performance.now()
 *   - performance.mark()
 *   - performance.measure()
 *   - PerformanceObserver
 *   - 重复的 mark/measure 名称
 *   - getEntriesByName()/getEntriesByType()
 *   - clearMarks()/clearMeasures()
 */

function printEntry(entry) {
    console.log(
        entry.entryType + " \"" + entry.name + "\"" +
        "  开始=" + entry.startTime.toFixed(3) + " 毫秒" +
        "  时长=" + entry.duration.toFixed(3) + " 毫秒"
    );
}

// PerformanceObserver 会异步接收新的 mark/measure 条目。
const observer = new PerformanceObserver((list) => {
    console.log("\n观察器：");

    for (const entry of list.getEntries()) {
        printEntry(entry);
    }
});

console.log(
    "支持的条目类型：" +
    PerformanceObserver.supportedEntryTypes.join(", ")
);

observer.observe({
    entryTypes: ["mark", "measure"]
});

function doSomeWork() {
    let value = 0;

    for (let i = 0; i < 100000; ++i) {
        value += Math.sqrt(i);
    }

    return value;
}

// 相同的 mark 名称可以被重复使用。
// measure() 会解析这些名称下最近创建的那些 mark。
for (let pass = 1; pass <= 3; ++pass) {
    performance.mark("work-start");

    doSomeWork();

    performance.mark("work-end");

    const measure = performance.measure(
        "work",
        "work-start",
        "work-end"
    );

    console.log(
        "第 " + pass + " 轮：" +
        measure.duration.toFixed(3) + " 毫秒"
    );
}

// 也可以直接用时间戳创建 measure。
const customMeasure = performance.measure("custom-range", {
    start: 10,
    duration: 25
});

console.log(
    "自定义区间：" +
    customMeasure.startTime.toFixed(3) + " 毫秒 -> " +
    (customMeasure.startTime + customMeasure.duration).toFixed(3) + " 毫秒"
);

// 查询之前记录的条目。
const workMeasures = performance.getEntriesByName("work", "measure");

console.log("\n已记录的工作 measure：");

for (const entry of workMeasures) {
    printEntry(entry);
}

// getEntriesByType() 会按 startTime 排序返回条目。
const allMeasures = performance.getEntriesByType("measure");

console.log("\n所有 measure：");

for (const entry of allMeasures) {
    printEntry(entry);
}

// 当不需要时间线条目时，performance.now() 很有用。
const begin = performance.now();

doSomeWork();

const elapsed = performance.now() - begin;

console.log(
    "\n直接使用 performance.now()：" +
    elapsed.toFixed(3) + " 毫秒"
);

// 在条目不再需要时移除它们。
// 这不会影响已经交付给观察器的条目。
performance.clearMarks("work-start");
performance.clearMarks("work-end");
performance.clearMeasures("work");
performance.clearMeasures("custom-range");

// 停止观察将来的条目。
observer.disconnect();
