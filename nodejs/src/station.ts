import { config } from './config';

export type IStation = {
    count: number;
    max: number;
    min: number;
    name: string;
    sum: number;
};

/**
 * Parses temperature string in the format '-99.9' to -99.9
 */
function parseTempWithDecimals(temp: string): number {
    return Number.parseFloat(temp);
}

/**
 * Parses temperature without decimal from buffer in the format '-99.9' to -999
 */
function parseTempWithoutDecimals(buffer: Buffer, start: number): number {
    let parsed = 0;
    let cursor = start;
    let signature = 1;

    // parse negative sign if applicable
    if (buffer[cursor] === config.asciiCode.minus) {
        signature = -1;
        cursor++;
    }

    // parse first digit
    // @ts-expect-error: this is a specialised parser
    parsed += buffer[cursor] - config.asciiCode.zero;
    cursor++;

    // if not a period then parse second digit
    if (buffer[cursor] !== config.asciiCode.period) {
        // @ts-expect-error: this is a specialised parser
        parsed = parsed * 10 + (buffer[cursor] - config.asciiCode.zero);
        cursor++;
    }

    // skip period
    cursor++;

    // parse decimal
    // @ts-expect-error: this is a specialised parser
    parsed = parsed * 10 + (buffer[cursor] - config.asciiCode.zero);

    return signature * parsed;
}

/** Convert station to string.
 * E.g.:  Zürich=-40.3/9.3/57.3
 */
function toString(station: IStation) {
    const min = (station.min / 10).toFixed(1);
    const max = (station.max / 10).toFixed(1);
    const mean = (station.sum / station.count / 10).toFixed(1);

    return `${station.name}=${min}/${mean}/${max}` as const;
}

function createStation(name: string, temp: number): IStation {
    return {
        count: 1,
        max: temp,
        min: temp,
        name,
        sum: temp,
    };
}

/** Record station temperature */
function recordTemperature(station: IStation, temp: number): void {
    station.min = Math.min(station.min, temp);
    station.max = Math.max(station.max, temp);
    station.sum += temp;
    station.count++;
}

/** Merge another station object data into the target */
function mergeIntoTarget(target: IStation, other: IStation) {
    if (other.name !== target.name) {
        throw new Error(
            `Cannot merge stations with different names. Expected ${target.name} but received ${other.name}`,
        );
    }

    target.min = Math.min(target.min, other.min);
    target.max = Math.max(target.max, other.max);
    target.sum += other.sum;
    target.count += other.count;
}

export const Station = {
    createStation,
    mergeIntoTarget,
    parseTempWithDecimals,
    parseTempWithoutDecimals,
    toString,
    recordTemperature,
};
