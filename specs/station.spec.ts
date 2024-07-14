import assert from 'node:assert';
import { describe, test } from 'node:test';
import { stationHelper } from '../src/station';
import { Logger } from '../src/logger';

describe('Station', () => {
    describe('Parses temperature from string correctly', () => {
        const cases: { actual: string; expected: number }[] = [
            {
                actual: '0.0',
                expected: 0,
            },
            {
                actual: '99.9',
                expected: 99.9,
            },
            {
                actual: '-99.9',
                expected: -99.9,
            },
        ];

        for (const { expected, actual } of cases) {
            test(`Parses ${actual} as ${expected}`, () => {
                assert.strictEqual(
                    stationHelper.parseTempWithDecimals(actual),
                    expected,
                );
            });
        }
    });

    describe('Parses temperature from buffer correctly', () => {
        const cases: {
            actual: string;
            expected: number;
            start: number;
        }[] = [
            {
                actual: '0.0',
                expected: 0,
                start: 0,
            },
            {
                actual: '99.9',
                expected: 999,
                start: 0,
            },
            {
                actual: '-99.9',
                expected: -999,
                start: 0,
            },

            {
                actual: 'Brasilia;-99.9\nLondon',
                expected: -999,
                start: 9,
            },
        ];

        for (const args of cases) {
            test(`Parses ${Logger.inlineFlatObject(args)}`, () => {
                const { expected, actual, start } = args;
                assert.strictEqual(
                    stationHelper.parseTempWithoutDecimals(
                        Buffer.from(actual),
                        start,
                    ),
                    expected,
                );
            });
        }
    });

    test('Stations are merged correctly', () => {
        const station1 = stationHelper.createStation('A', 30);
        const sation2 = stationHelper.createStation('A', 40);

        stationHelper.mergeIntoTarget(station1, sation2);

        assert.equal(station1.count, 2);
        assert.equal(station1.max, 40);
        assert.equal(stationHelper.calculateMean(station1), 35);
        assert.equal(station1.min, 30);
        assert.equal(station1.name, 'A');
    });

    test('Correctly converts station to string', () => {
        const station = stationHelper.createStation('A', 50.8);

        assert.strictEqual('A=50.8/50.8/50.8', stationHelper.toString(station));
    });

    test('Throws when attempting to merge stations with different names', () => {
        const station1 = stationHelper.createStation('A', 30);
        const station2 = stationHelper.createStation('B', 40);

        assert.throws(
            () => stationHelper.mergeIntoTarget(station1, station2),
            `Expected ${station1.name}`,
        );
    });
});
