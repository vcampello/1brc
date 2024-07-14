import path from 'node:path';
import { taskHelper } from './task';

import { Aggregator, aggregatorHelper } from './aggregator';
import { logger } from './logger';

const fileVersion = {
    x_1b: path.join(__dirname, '../data/measurements.txt'),
    x_20: path.join(__dirname, '../data/measurements-x20.txt'),
    x_1k: path.join(__dirname, '../data/measurements-x1k.txt'),
    x_50k: path.join(__dirname, '../data/measurements-x50k.txt'),
    x_50m: path.join(__dirname, '../data/measurements-x50m.txt'),
} as const;

async function main() {
    const tasks = await taskHelper.planTasks(fileVersion.x_50m);
    const workerFilepath = path.join(__dirname, './worker');
    const result = await Promise.all(
        tasks.map((t) => taskHelper.createTaskRunner(t, workerFilepath)),
    );

    const { processedLines, aggregators } = result.reduce<{
        aggregators: Aggregator[];
        processedLines: number;
    }>(
        (acc, cur) => {
            acc.processedLines += cur.processedLines;
            acc.aggregators.push(cur.aggregator);
            return acc;
        },
        {
            aggregators: [],
            processedLines: 0,
        },
    );

    const combinedData = aggregatorHelper.mergeIntoNewAggregator(
        ...aggregators,
    );

    logger.info(aggregatorHelper.toString(combinedData));
    logger.info(
        `Processed ${processedLines.toLocaleString()} in ${(performance.now() / 1000).toFixed(3)} seconds`,
    );
}

main();
