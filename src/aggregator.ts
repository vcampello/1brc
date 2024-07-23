import { Station, IStation } from './station';

export type IAggregator = Map<string, IStation>;

function createAggregator(): IAggregator {
    return new Map<string, IStation>();
}

/**
 * Convert Aggregator station list to an array
 */
function stationList(aggregator: IAggregator): IStation[] {
    return [...aggregator.values()];
}

/**
 * Record temperature for a station. Creates a new one if it doesn't exist
 */
function recordTemperature(
    aggregator: IAggregator,
    name: string,
    temp: number,
): IStation {
    let station = aggregator.get(name);

    if (!station) {
        station = Station.createStation(name, temp);
        aggregator.set(name, station);
    } else {
        Station.recordTemperature(station, temp);
    }

    return station;
}

/**
 * Merge station object into the aggregator.
 * Creates a clone of the supplied station if it doesn't exist.
 */
function mergeStation(aggregator: IAggregator, station: IStation): void {
    const existingStation = aggregator.get(station.name);

    if (existingStation) {
        Station.mergeIntoTarget(existingStation, station);
    } else {
        aggregator.set(station.name, { ...station });
    }
}

/**
 * Take a series of aggregator and return a new aggregate
 */
function mergeIntoNewAggregator(...aggregators: IAggregator[]): IAggregator {
    const accumulator = createAggregator();

    for (const aggregator of aggregators) {
        for (const station of stationList(aggregator)) {
            mergeStation(accumulator, station);
        }
    }

    return accumulator;
}

/**
 * Convert an aggregator to string.
 * E.g.: {Zanzibar City=-26.7/26.0/76.2, Zürich=-40.3/9.3/57.3}
 */
function toString(aggregator: IAggregator): string {
    const names = stationList(aggregator)
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(Station.toString)
        .join(', ');

    return `{${names}}`;
}

export const Aggregator = {
    createAggregator,
    mergeIntoNewAggregator,
    mergeStation,
    recordTemperature,
    stationList,
    toString,
};
