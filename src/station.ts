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
