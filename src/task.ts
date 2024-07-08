import { Worker } from 'node:worker_threads';
import { Aggregator } from './station';

export type Task = {
    readStart: number;
    readEnd: number;
    filepath: string;
};

export type TaskResult = {
    processedLines: number;
    stations: Aggregator;
};

export function isTask(task: unknown): task is Task {
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

export function parseTempToInt(temp: string) {
    // WARN: optmise
    // const sign = temp[0] === CHAR_MINUS ? -1 : 1;

    return Number.parseFloat(temp) * 10;
}

export function createTaskRunner(task: Task, filename: string) {
    return new Promise<TaskResult>((resolve, reject) => {
        return new Worker(filename, {
            workerData: task,
        })
            .on('message', resolve)
            .on('error', reject);
    });
}
