import { Station, stationHelper } from './station';

export type Aggregator = Map<string, Station>;

function createAggregator(): Aggregator {
    return new Map<string, Station>();
}

function stationList(aggregator: Aggregator): Station[] {
    return [...aggregator.values()];
}

/**
 * Record temperature for a station. Creates a new one if it doesn't exist
 **/
function recordTemperature(
    aggregator: Aggregator,
    name: string,
    temp: number,
): Station {
    let station = aggregator.get(name);

    if (!station) {
        station = stationHelper.createStation(name, temp);
        aggregator.set(name, station);
    } else {
        stationHelper.updateStation(station, temp);
    }

    return station;
}

/**
 * Merge station object into the aggregator.
 * Creates a clone of the supplied station if it doesn't exist.
 **/
function mergeStation(aggregator: Aggregator, station: Station): void {
    const existingStation = aggregator.get(station.name);

    if (existingStation) {
        stationHelper.mergeIntoTarget(existingStation, station);
    } else {
        aggregator.set(station.name, { ...station });
    }
}

function mergeIntoNewAggregator(...aggregators: Aggregator[]): Aggregator {
    const accumulator = createAggregator();

    for (const aggregator of aggregators) {
        for (const station of stationList(aggregator)) {
            mergeStation(accumulator, station);
        }
    }

    return accumulator;
}

function toString(aggregator: Aggregator): string {
    const names = stationList(aggregator)
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(stationHelper.toString)
        .join(', ');

    return `{${names}}`;
}
export const aggregatorHelper = {
    createAggregator,
    mergeStation,
    recordTemperature,
    stationList,
    toString,
    mergeIntoNewAggregator,
};
