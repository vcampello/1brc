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
} as const;

export type LoggerColor = (typeof LoggerColor)[keyof typeof LoggerColor];

type ConsoleLog = Parameters<typeof console.log>;

export class Logger {
    #prefix: string | number | undefined;
    #prefixColor: LoggerColor;
    silent: boolean;

    constructor(args?: {
        prefix?: string | number;
        prefixColor?: LoggerColor;
        silent?: boolean;
    }) {
        this.#prefix = args?.prefix;
        this.#prefixColor = args?.prefixColor ?? LoggerColor.reset;
        this.silent = args?.silent ?? false;
    }

    /** Format prefix and message */
    #format(args: ConsoleLog): ConsoleLog {
        // prevent leading empty space if there is no prefix
        if (this.#prefix) {
            const formattedPrefix = [
                // LoggerColor.bright,
                this.#prefixColor,
                '[',
                this.#prefix,
                ']',
                LoggerColor.reset,
            ].join('');
            args.unshift(formattedPrefix);
        }

        return args;
    }

    info(...args: ConsoleLog) {
        if (this.silent) {
            return;
        }
        console.log(...this.#format(args));
    }

    static inlineFlatObject<Obj extends Record<PropertyKey, unknown>>(
        obj: Obj,
        removeKeys: (keyof Obj)[] = [],
    ): string {
        const components: string[] = [];

        Object.entries(obj).forEach(([key, value]) => {
            if (!removeKeys.includes(key)) {
                components.push(`${key}=${value}`);
            }
        });
        return components.join(', ');
    }
}

/** Default logger */
export const logger = new Logger({
    prefix: 'info',
    prefixColor: LoggerColor.fgGreen,
});
