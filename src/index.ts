import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createTaskRunner, Task } from './task';
import { createLogger } from './logger';

import { config } from './config';

const fileVersion = {
    x_1b: path.join(__dirname, '../data/measurements.txt'),
    x_20: path.join(__dirname, '../data/measurements-x20.txt'),
    x_1k: path.join(__dirname, '../data/measurements-x1k.txt'),
    x_50k: path.join(__dirname, '../data/measurements-x50k.txt'),
    x_50m: path.join(__dirname, '../data/measurements-x50m.txt'),
} as const;

const log = createLogger('main');

async function createTasks(): Promise<Task[]> {
    const filepath = fileVersion.x_1b;
    const fd = await fs.open(filepath, 'r');
    const fStats = await fd.stat();
    const threadCount = os.cpus().length;
    // const threadCount = 2;
    // const threadCount = 1;
    const chunkSize = Math.floor(fStats.size / threadCount);

    log('stats:', {
        filepath,
        size: fStats.size,
        threadCount,
        chunkSize,
    });

    const tasks: Task[] = [];

    for (let i = 0, prevEnv = 0; i < threadCount; i++) {
        const task: Task = {
            filepath,
            readStart: prevEnv,
            readEnd: prevEnv + chunkSize,
        };
        tasks.push(task); // push it here and mutate below

        const lookahead = await fd.read(
            Buffer.alloc(config.maxLineLength),
            0,
            config.maxCityLength,
            task.readEnd,
        );

        // Last chunk
        if (task.readEnd > fStats.size) {
            task.readEnd = fStats.size - 1;
            break;
        }

        // Adjust last index so it ends on a newline
        task.readEnd += lookahead.buffer.indexOf('\n');

        // Start the next task on the next byte
        prevEnv = task.readEnd + 1;
    }

    // for (const task of tasks) {
    //     const length = task.readEnd - task.readStart;
    //     const data = await fd.read(
    //         Buffer.alloc(length),
    //         0,
    //         task.readEnd - task.readStart,
    //         task.readStart,
    //     );
    //     log('thread', task.threadIdx, '\n' + data.buffer.toString());
    // }

    await fd.close();
    return tasks;
}

async function main() {
    const tasks = await createTasks();
    const workerFilepath = path.join(__dirname, './worker');
    const result = await Promise.all(
        tasks.map((t) => createTaskRunner(t, workerFilepath)),
    );

    const aggregated = result.reduce(
        (acc, cur) => {
            // log(cur.stations.stations);
            acc.newlines += cur.processedLines;
            return acc;
        },
        { newlines: 0 },
    );

    log(
        `processed ${aggregated.newlines} lines in ${(performance.now() / 1000).toFixed(3)} seconds`,
    );
}

main();
