import assert from 'node:assert';
import { describe, test } from 'node:test';
import { parseTempToInt } from '../src/task';

describe(parseTempToInt.name, () => {
    const cases: { actual: string; expected: number }[] = [
        {
            actual: '0.0',
            expected: 0,
        },
        {
            actual: '99.9',
            expected: 999,
        },
        {
            actual: '-99.9',
            expected: -999,
        },
    ];

    for (const { expected, actual } of cases) {
        test(`parses ${actual} as ${expected}`, () => {
            assert.strictEqual(parseTempToInt(actual), expected);
        });
    }
});
