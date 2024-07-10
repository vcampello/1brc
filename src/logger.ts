export const LoggerColor = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    underscore: '\x1b[4m',
    blink: '\x1b[5m',
    reverse: '\x1b[7m',
    hidden: '\x1b[8m',
    fgBlack: '\x1b[30m',
    fgRed: '\x1b[31m',
    fgGreen: '\x1b[32m',
    fgYellow: '\x1b[33m',
    fgBlue: '\x1b[34m',
    fgMagenta: '\x1b[35m',
    fgCyan: '\x1b[36m',
    fgWhite: '\x1b[37m',
    fgGray: '\x1b[90m',
    bgBlack: '\x1b[40m',
    bgRed: '\x1b[41m',
    bgGreen: '\x1b[42m',
    bgYellow: '\x1b[43m',
    bgBlue: '\x1b[44m',
    bgMagenta: '\x1b[45m',
    bgCyan: '\x1b[46m',
    bgWhite: '\x1b[47m',
    bgGray: '\x1b[100m',
} as const;

export type LoggerColor = (typeof LoggerColor)[keyof typeof LoggerColor];

export const createLogger =
    (id?: string | number, color?: LoggerColor) =>
    (...args: Parameters<typeof console.log>) => {
        const prefix = id !== undefined ? `[${id}]` : '';
        const prefixColor = color ?? LoggerColor.fgGreen;
        if (prefix) {
            // prevent leading empty space if there is no prefix
            args.unshift(
                `${LoggerColor.bright}${prefixColor}${prefix}${LoggerColor.reset}`,
            );
        }

        console.log(...args);
    };

/** Default logger */
export const log = createLogger('main');

export const generatePerformanceLog = () => {
    return `${(performance.now() / 1000).toFixed(3)} seconds.` as const;
};
