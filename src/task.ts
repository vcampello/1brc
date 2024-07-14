import fs from 'node:fs/promises';
import os from 'node:os';
import { parentPort, threadId, Worker } from 'node:worker_threads';
import { Aggregator } from './aggregator';
import { logger } from './logger';
import { config } from './config';

export type Task = {
    readStart: number;
    readEnd: number;
    filepath: string;
};

export type TaskResult = {
    threadId: number;
    processedLines: number;
    aggregator: Aggregator;
};

function isTask(task: unknown): task is Task {
    if (!task || typeof task !== 'object') {
        return false;
    }

    const has_readStart =
        'readStart' in task && typeof task.readStart === 'number';
    const has_readEnd = 'readEnd' in task && typeof task.readEnd === 'number';
    const has_filename =
        'filepath' in task && typeof task.filepath === 'string';

    return has_readStart && has_readEnd && has_filename;
}

function createTaskRunner(task: Task, filename: string) {
    return new Promise<TaskResult>((resolve, reject) => {
        return new Worker(filename, {
            workerData: task,
        })
            .on('message', resolve)
            .on('error', reject);
    });
}

function postTaskResult(taskResult: TaskResult) {
    if (!parentPort) {
        throw new Error(`Missing parent port on worker ${threadId}`);
    }
    void parentPort.postMessage(taskResult);
}

/**
 * Calculate max number of threads and chunk size depending on the size of the input. It prevents starting the threads by supplying incomplete lines.
 */
function calculateThreadPoolAndChunkSize(args: {
    fileSizeInBytes: number;
    minChunkSize: number;
}): { threadCount: number; chunkSize: number } {
    const { minChunkSize, fileSizeInBytes } = args;
    const cpus = os.cpus().length;
    const potentialThreads = Math.floor(
        args.fileSizeInBytes / args.minChunkSize,
    );

    const threadCount = potentialThreads >= cpus ? cpus : potentialThreads;
    const chunkSize = Math.floor(args.fileSizeInBytes / threadCount);

    logger.info('Thread pool and chunk size:', {
        cpus,
        fileSizeInBytes,
        minChunkSize,
        potentialThreads,
        threadCount,
        chunkSize,
    });

    return {
        chunkSize,
        threadCount,
    };
}

async function planTasks(filepath: string): Promise<Task[]> {
    const fd = await fs.open(filepath, 'r');
    const fStats = await fd.stat();

    logger.info('File stats:', {
        filepath,
        size: fStats.size,
    });

    const { threadCount, chunkSize } =
        taskHelper.calculateThreadPoolAndChunkSize({
            fileSizeInBytes: fStats.size,
            minChunkSize: config.maxLineLength,
        });

    const tasks: Task[] = [];

    // Plan tasks
    for (let i = 0, prevEnv = 0; i < threadCount; i++) {
        const task: Task = {
            filepath,
            readStart: prevEnv,
            readEnd: prevEnv + chunkSize,
        };

        // push it here and mutate below
        tasks.push(task);

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

export const taskHelper = {
    isTask,
    createTaskRunner,
    postTaskResult,
    planTasks,
    calculateThreadPoolAndChunkSize,
};
