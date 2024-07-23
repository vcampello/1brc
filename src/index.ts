import path from 'node:path';
import { taskHelper } from './task';
import { Aggregator, IAggregator } from './aggregator';
import { logger, Logger } from './logger';
import { cli } from './cli';

(async () => {
    const options = await cli.parseOptions();

    logger.silent = options.silent;
    logger.info('Options:', options);

    const tasks = await taskHelper.planTasks(
        options.filepath,
        options.silent,
        options.threads,
    );
    const workerFilepath = path.join(__dirname, './worker');
    const result = await Promise.all(
        tasks.map((t) => taskHelper.createTaskRunner(t, workerFilepath)),
    );

    const { processedLines, aggregators } = result.reduce<{
        aggregators: IAggregator[];
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

    const combinedData = Aggregator.mergeIntoNewAggregator(...aggregators);

    // Always log the output
    new Logger().info(Aggregator.toString(combinedData));

    logger.info(
        `Processed ${processedLines.toLocaleString()} in ${(performance.now() / 1000).toFixed(3)} seconds`,
    );
})();
