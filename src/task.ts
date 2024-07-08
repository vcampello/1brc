import wk from 'node:worker_threads';
import {
    createLogger,
    COLOR,
    CHAR_NEWLINE,
    MAX_LINE_LENGTH,
    CHAR_SEMICOLON,
    Aggregator,
} from './shared';
import { createReadStream } from 'node:fs';

export type Task = {
    readStart: number;
    readEnd: number;
    filepath: string;
};

export type TaskResult = {
    processedLines: number;
    stations: Aggregator;
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

export function parseTemp(temp: string) {
    // WARN: optmise
    // const sign = buffer[0] === CHAR_MINUS ? -1 : 1;

    return Number.parseFloat(temp);
}

export function createTaskRunner(task: Task) {
    return new Promise<TaskResult>((resolve, reject) => {
        return new wk.Worker(__filename, {
            workerData: task,
        })
            .on('message', resolve)
            .on('error', reject);
    });
}

async function runTask() {
    // Process
    const task = wk.workerData;

    if (!isTask(task)) {
        throw new Error('worker data is not a Task:', task);
    }
    const log = createLogger(
        `thread ${wk.threadId.toString().padStart(2, '0')}`,
        COLOR.fgYellow,
    );

    // Let's stop  right away instead of waiting for the end
    if (!wk.parentPort) {
        throw new Error(`Missing parent port on worker ${wk.threadId}`);
    }

    // Start
    log(`readStart=${task.readStart}, readEnd=${task.readEnd}`);

    const readStream = createReadStream(task.filepath, {
        start: task.readStart,
        end: task.readEnd,
        // TODO: highwaterMark
        highWaterMark: Math.pow(2, 20),
    });

    let processedLines = 0;

    const line = Buffer.alloc(MAX_LINE_LENGTH);
    let tempStart = 0;
    let lineEnd = 0;
    const stations = new Aggregator();

    for await (const chunk of readStream) {
        // log('chunk lenght:', chunk.length);
        // this would be less confusing with 2 loops
        for (let i = 0, len = chunk.length; i < len; i++) {
            const c = chunk[i];
            line[lineEnd] = c;

            if (c === CHAR_NEWLINE) {
                log('line', processedLines, {
                    content: line.toString('utf-8', 0, lineEnd),
                    city: line.toString('utf-8', 0, tempStart - 1),
                    temp: line.toString('utf-8', tempStart, lineEnd),
                });
                const city = line.toString('utf-8', 0, tempStart - 1);
                const temp = line.toString('utf-8', tempStart, lineEnd);
                stations.update(city, parseTemp(temp));

                processedLines++;
                lineEnd = 0;
                tempStart = 0;
                continue;
            }

            if (c === CHAR_SEMICOLON) {
                tempStart = lineEnd + 1;
            }

            lineEnd++;
        }
    }

    readStream.close();
    log(
        `processed ${processedLines} lines in ${(performance.now() / 1000).toFixed(3)} seconds`,
    );
    wk.parentPort.postMessage({ processedLines, stations });
}

if (!wk.isMainThread) {
    runTask();
} else {
    console.log('is main thread');
}
