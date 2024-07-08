import path from 'path';

export const fileVersion = {
    x_1b: path.join(__dirname, '../data/measurements.txt'),
    x_20: path.join(__dirname, '../data/measurements-x20.txt'),
    x_1k: path.join(__dirname, '../data/measurements-x1k.txt'),
    x_50k: path.join(__dirname, '../data/measurements-x50k.txt'),
    x_50m: path.join(__dirname, '../data/measurements-x50m.txt'),
} as const;

export const CHAR_NEWLINE = '\n'.charCodeAt(0);
export const CHAR_SEMICOLON = ';'.charCodeAt(0); // Buffer.from(';')
export const CHAR_MINUS = '-'.charCodeAt(0); // Buffer.from(';')
export const CHAR_PERIOD = '.'.charCodeAt(0); // Buffer.from(';')

export const MAX_CITY_LENGTH = 100;
export const MAX_TEMP_LENGTH = 5; // temp:  -99.9 (inclusive) and 99.9 (inclusive
export const MAX_LINE_LENGTH = MAX_CITY_LENGTH + MAX_TEMP_LENGTH + 2; // City, temp, semicolon and newline;

export const COLOR = {
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

export type COLOR = (typeof COLOR)[keyof typeof COLOR];

export const createLogger =
    (id?: string | number, color?: COLOR) =>
    (...args: Parameters<typeof console.log>) => {
        const prefix = id !== undefined ? `[${id}]` : '';
        const prefixColor = color ?? COLOR.fgGreen;

        console.log(
            `${COLOR.bright}${prefixColor}${prefix}${COLOR.reset}`,
            ...args,
        );
    };

export class Station {
    name: string;
    count: number;
    max: number;
    min: number;
    total: number;

    set mean(value: void) {
        throw new Error('Mean should not be set');
    }

    get mean(): number {
        return this.total / this.count;
    }

    constructor(name: string) {
        this.name = name;
        this.count = 0;
        this.max = 0;
        this.min = 0;
        this.total = 0;
    }

    recordTemp(temp: number) {
        this.min = Math.min(this.min, temp);
        this.max = Math.max(this.max, temp);
        this.total += temp;
        this.count++;
    }

    toString() {
        return JSON.stringify(this);
    }

    static merge(name: string, ...stations: Station[]): Station {
        const aggregate = stations.reduce(
            (acc, cur) => {
                if (cur.name === name) {
                    acc.min = Math.min(acc.min, cur.min);
                    acc.max = Math.max(acc.max, cur.min);
                    acc.total += cur.total;
                    acc.count += cur.count;
                } else {
                    console.log('Unexpected station name:', cur.name);
                }
                return acc;
            },
            {
                name,
                count: 0,
                min: 0,
                max: 0,
                total: 0,
            },
        );
        const merged = new Station(name);
        merged.count = aggregate.count;
        merged.min = aggregate.min;
        merged.max = aggregate.max;
        merged.total = aggregate.total;

        return merged;
    }
}

export class Aggregator {
    stations: Map<string, Station>;

    constructor() {
        this.stations = new Map();
    }

    update(name: string, temp: number): Station {
        let station = this.stations.get(name);

        if (!station) {
            station = new Station(name);
            this.stations.set(name, station);
        }

        station.recordTemp(temp);
        return station;
    }

    /*
    static merge(...aggregators: Aggregator[]): Map<string, Station[]> {
        const byName = new Map<string, Station[]>();

        for (const agg of aggregators) {
            for (const [name, stationRecord] of agg.stations.entries()) {
                let station = allStations.get(name);
                if (!station) {
                }
            }
        }

        return byName.;
    }
    */
}
