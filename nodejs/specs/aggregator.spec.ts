import assert from 'node:assert';
import { describe, test } from 'node:test';
import { Aggregator } from '../src/aggregator';

describe('Aggregator', () => {
    test(`Aggregators are merged correctly`, () => {
        const agg1 = Aggregator.createAggregator();
        Aggregator.recordTemperature(agg1, 'A', 50);

        const agg2 = Aggregator.createAggregator();
        Aggregator.recordTemperature(agg2, 'A', -10);
        Aggregator.recordTemperature(agg2, 'B', 20);

        const combined = Aggregator.mergeIntoNewAggregator(agg1, agg2);

        const validate = (args: {
            count: number;
            max: number;
            mean: number;
            min: number;
            name: string;
        }) => {
            const s = Aggregator.stationList(combined).find(
                (s) => s.name === args.name,
            );
            assert.equal(s?.name, args.name);
            assert.equal(s?.count, args.count);
            assert.equal(s?.min, args.min);
            assert.equal(s?.max, args.max);
        };

        validate({
            name: 'A',
            count: 2,
            max: 50,
            mean: 20,
            min: -10,
        });

        validate({
            name: 'B',
            count: 1,
            max: 20,
            mean: 20,
            min: 20,
        });
    });

    test('Correctly converts aggregator to string', () => {
        const agg = Aggregator.createAggregator();
        Aggregator.recordTemperature(agg, 'A', 508);
        Aggregator.recordTemperature(agg, 'A', 492);
        Aggregator.recordTemperature(agg, 'B', -107);

        assert.strictEqual(
            '{A=49.2/50.0/50.8, B=-10.7/-10.7/-10.7}',
            Aggregator.toString(agg),
        );
    });
});
