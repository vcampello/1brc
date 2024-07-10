export type Station = {
    count: number;
    max: number;
    min: number;
    name: string;
    sum: number;
};

function calculateMean(station: Station): number {
    return station.sum / station.count;
}

/**
 * Parses temperature string in the format '-99.9' to -99.9
 */
function parseTemp(temp: string): number {
    return Number.parseFloat(temp);
}

function toString(station: Station): string {
    return `${station.name}=${station.min}/${calculateMean(station).toFixed(1)}/${station.max}`;
}

function createStation(name: string, temp: number): Station {
    return {
        count: 1,
        max: temp,
        min: temp,
        name,
        sum: temp,
    };
}

function updateStation(station: Station, temp: number): void {
    station.min = Math.min(station.min, temp);
    station.max = Math.max(station.max, temp);
    station.sum += temp;
    station.count++;
}

function mergeIntoTarget(target: Station, other: Station) {
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

export const stationHelper = {
    calculateMean,
    createStation,
    mergeIntoTarget,
    parseTemp,
    toString,
    updateStation,
};
