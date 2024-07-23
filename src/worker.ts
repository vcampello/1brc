import { createReadStream } from 'node:fs';
import {
    isMainThread,
    workerData,
    threadId,
    parentPort,
} from 'node:worker_threads';
import { taskHelper } from './task';
import { Logger, LoggerColor } from './logger';
import { config } from './config';
import { Aggregator } from './aggregator';
import { Station } from './station';

if (isMainThread) {
    throw new Error('Do not run or require this file directly');
}

const task = workerData;

if (!taskHelper.isTask(task)) {
    throw new Error('Worker data is not a Task:', task);
}

// Let's stop  right away instead of waiting for the end
if (!parentPort) {
    throw new Error(`Missing parent port on worker ${threadId}`);
}

const wkLogger = new Logger({
    prefix: `worker ${threadId.toString().padStart(2, '0')}`,
    prefixColor: LoggerColor.fgYellow,
    silent: task.silent,
});

// Entrypoint
(async () => {
    // Process
    wkLogger.info('Running task:', Logger.inlineFlatObject(task, ['filepath']));

    const readStream = createReadStream(task.filepath, {
        start: task.readStart,
        end: task.readEnd,
        highWaterMark: Math.pow(2, 24),
    });

    let processedLines = 0;

    const line = Buffer.alloc(config.maxLineLength);
    let tempStart = 0;
    let lineEnd = 0;
    const aggregator = Aggregator.createAggregator();

    for await (const chunk of readStream) {
        for (let i = 0, len = chunk.length; i < len; i++) {
            const char = chunk[i];
            line[lineEnd] = char;

            if (char === config.asciiCode.newline) {
                /*
                // Debug logging
                log('line', processedLines, {
                    tempStart,
                    lineEnd,
                    content: line.toString('utf-8', 0, lineEnd),
                    city: line.toString('utf-8', 0, tempStart - 1),
                    temp: line.toString('utf-8', tempStart, lineEnd),
                });
                */

                const city = line.toString('utf-8', 0, tempStart - 1);
                const temp = Station.parseTempWithoutDecimals(line, tempStart);

                // 40s without/48s
                Aggregator.recordTemperature(aggregator, city, temp);

                processedLines++;
                lineEnd = 0;
                tempStart = 0;
                continue;
            }

            if (char === config.asciiCode.semicolon) {
                tempStart = lineEnd + 1;
            }

            lineEnd++;
        }
    }

    readStream.close();

    wkLogger.info(`Processed ${processedLines.toLocaleString()} lines`);

    taskHelper.postTaskResult({
        threadId,
        processedLines,
        aggregator,
    });
})();
