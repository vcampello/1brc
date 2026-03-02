import fs from 'node:fs/promises';
import os from 'node:os';
import { LoggerColor } from './logger';

function displayHelpAndExit(message?: string): never {
    const output: string[] = [];

    if (message) {
        output.push(`${LoggerColor.fgRed}${message}${LoggerColor.reset}\n`);
    }

    output.push(
        'Usage: node dist/index.js --file measurements.txt [--silent] [--threads <number>]',
        ' -f, --file\t\tspecificy the weather station file',
        ' -s, --silent\t\tonly display the output',
        ' -t, --threads <number>\tnumber of threads (will be overriden if there are not enough lines)',
        ' -h, --help\t\tdisplay this help and exit',
    );
    console.log(output.join('\n'));

    process.exit(0);
}

type Options = {
    silent: boolean;
    filepath: string;
    threads: number;
};

async function parseOptions(): Promise<Options> {
    const args = process.argv.slice(2);

    const parsedOptions: Options = {
        filepath: '',
        silent: false,
        threads: os.cpus().length,
    };

    if (args.length === 0) {
        displayHelpAndExit();
    }

    for (let i = 0; i < args.length; i++) {
        const opt = args[i];
        const optVal = args[i + 1];

        switch (opt) {
            case '-h':
            case '--help': {
                displayHelpAndExit();
                break;
            }
            case '-f':
            case '--file': {
                if (!optVal) {
                    displayHelpAndExit(`--file requires a filepath`);
                }
                const fileStats = await fs.stat(optVal);

                if (!fileStats.isFile) {
                    displayHelpAndExit(`${optVal} is not a valid file`);
                }

                parsedOptions.filepath = optVal;
                i++; // Skip the next interation
                break;
            }
            case '-t':
            case '--threads': {
                if (!optVal) {
                    displayHelpAndExit(`--threads requires a number`);
                }

                const threads = Number.parseInt(optVal, 10);
                if (Number.isNaN(threads) || threads <= 0) {
                    displayHelpAndExit(
                        `Number of threads must be a positive number. Got ${optVal}`,
                    );
                }

                parsedOptions.threads = threads;
                i++; // Skip the next interation
                break;
            }
            case '-s':
            case '--silent': {
                parsedOptions.silent = true;
                break;
            }
            default: {
                displayHelpAndExit(`Unknown option: ${opt}`);
            }
        }
    }

    if (!parsedOptions.filepath) {
        displayHelpAndExit('No filepath supplied');
    }

    return parsedOptions;
}

export const cli = {
    parseOptions,
};
