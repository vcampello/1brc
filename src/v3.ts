import fs from 'node:fs/promises';
import os from 'node:os';
import { fileVersion, MAX_LINE_LENGTH, createLogger } from './shared';
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
            Buffer.alloc(MAX_LINE_LENGTH),
            0,
            MAX_LINE_LENGTH,
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

import { createTaskRunner, Task } from './task';

async function main() {
    const tasks = await createTasks();
    const result = await Promise.all(tasks.map(createTaskRunner));

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
