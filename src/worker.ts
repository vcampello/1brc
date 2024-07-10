import { createReadStream } from 'node:fs';
import {
    isMainThread,
    workerData,
    threadId,
    parentPort,
} from 'node:worker_threads';
import { taskHelper } from './task';
import { createLogger, generatePerformanceLog, LoggerColor } from './logger';
import { config } from './config';
import { aggregatorHelper } from './aggregator';
import { stationHelper } from './station';

if (isMainThread) {
    throw new Error('Do not run or require this file directly');
}

// Entrypoint
runTask();

async function runTask() {
    // Process
    const task = workerData;

    if (!taskHelper.isTask(task)) {
        throw new Error('Worker data is not a Task:', task);
    }
    const log = createLogger(
        `worker ${threadId.toString().padStart(2, '0')}`,
        LoggerColor.fgYellow,
    );

    // Let's stop  right away instead of waiting for the end
    if (!parentPort) {
        throw new Error(`Missing parent port on worker ${threadId}`);
    }

    // Start
    log('Running task:', task);

    const readStream = createReadStream(task.filepath, {
        start: task.readStart,
        end: task.readEnd,
        highWaterMark: Math.pow(2, 20),
    });

    let processedLines = 0;

    const line = Buffer.alloc(config.maxLineLength);
    let tempStart = 0;
    let lineEnd = 0;
    const aggregator = aggregatorHelper.createAggregator();

    for await (const chunk of readStream) {
        // log('chunk length:', chunk.length);
        // this would be less confusing with 2 loops
        for (let i = 0, len = chunk.length; i < len; i++) {
            const c = chunk[i];
            line[lineEnd] = c;

            if (c === config.asciiCode.newline) {
                /*
                log('line', processedLines, {
                    tempStart,
                    lineEnd,
                    content: line.toString('utf-8', 0, lineEnd),
                    city: line.toString('utf-8', 0, tempStart - 1),
                    temp: line.toString('utf-8', tempStart, lineEnd),
                });
                */
                const city = line.toString('utf-8', 0, tempStart - 1);
                const temp = line.toString('utf-8', tempStart, lineEnd);
                aggregatorHelper.recordTemperature(
                    aggregator,
                    city,
                    stationHelper.parseTemp(temp),
                );

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

    log('Shutting down:', {
        processedLines,
        perf: generatePerformanceLog(),
    });

    taskHelper.postTaskResult({ processedLines, aggregator });
}
