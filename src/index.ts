import path from 'node:path';
import { taskHelper } from './task';

import { Aggregator, aggregatorHelper } from './aggregator';
import { generatePerformanceLog, log } from './logger';

const fileVersion = {
    x_1b: path.join(__dirname, '../data/measurements.txt'),
    x_20: path.join(__dirname, '../data/measurements-x20.txt'),
    x_1k: path.join(__dirname, '../data/measurements-x1k.txt'),
    x_50k: path.join(__dirname, '../data/measurements-x50k.txt'),
    x_50m: path.join(__dirname, '../data/measurements-x50m.txt'),
} as const;

async function main() {
    const tasks = await taskHelper.planTasks(fileVersion.x_20);
    const workerFilepath = path.join(__dirname, './worker');
    const result = await Promise.all(
        tasks.map((t) => taskHelper.createTaskRunner(t, workerFilepath)),
    );

    const { processedLines, aggregators } = result.reduce<{
        processedLines: number;
        aggregators: Aggregator[];
    }>(
        (acc, cur) => {
            acc.processedLines += cur.processedLines;
            acc.aggregators.push(cur.aggregator);
            return acc;
        },
        { processedLines: 0, aggregators: [] },
    );

    const combinedData = aggregatorHelper.mergeIntoNewAggregator(
        ...aggregators,
    );
    log(aggregatorHelper.toString(combinedData));
    log('Done:', {
        processedLines,
        perf: generatePerformanceLog(),
    });
}

main();
