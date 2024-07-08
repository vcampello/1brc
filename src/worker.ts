import { createReadStream } from 'node:fs';
import {
    isMainThread,
    workerData,
    threadId,
    parentPort,
} from 'node:worker_threads';
import { isTask, parseTempToInt } from './task';
import { createLogger, LoggerColor } from './logger';
import { config } from './config';
import { Aggregator } from './station';

if (!isMainThread) {
    runTask();
} else {
    console.log('is main thread');
}

async function runTask() {
    // Process
    const task = workerData;

    if (!isTask(task)) {
        throw new Error('worker data is not a Task:', task);
    }
    const log = createLogger(
        `thread ${threadId.toString().padStart(2, '0')}`,
        LoggerColor.fgYellow,
    );

    // Let's stop  right away instead of waiting for the end
    if (!parentPort) {
        throw new Error(`Missing parent port on worker ${threadId}`);
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

    const line = Buffer.alloc(config.maxLineLength);
    let tempStart = 0;
    let lineEnd = 0;
    const stations = new Aggregator();

    for await (const chunk of readStream) {
        // log('chunk lenght:', chunk.length);
        // this would be less confusing with 2 loops
        for (let i = 0, len = chunk.length; i < len; i++) {
            const c = chunk[i];
            line[lineEnd] = c;

            if (c === config.asciiCode.newline) {
                log('line', processedLines, {
                    tempStart,
                    lineEnd,
                    content: line.toString('utf-8', 0, lineEnd),
                    city: line.toString('utf-8', 0, tempStart - 1),
                    temp: line.toString('utf-8', tempStart, lineEnd),
                });
                const city = line.toString('utf-8', 0, tempStart - 1);
                const temp = line.toString('utf-8', tempStart, lineEnd);
                stations.update(city, parseTempToInt(temp));

                processedLines++;
                lineEnd = 0;
                tempStart = 0;
                continue;
            }

            if (c === config.asciiCode.semicolon) {
                tempStart = lineEnd + 1;
            }

            lineEnd++;
        }
    }

    readStream.close();
    log(
        `processed ${processedLines} lines in ${(performance.now() / 1000).toFixed(3)} seconds`,
    );
    parentPort.postMessage({ processedLines, stations });
}
