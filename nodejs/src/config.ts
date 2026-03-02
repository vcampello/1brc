export const config = {
    asciiCode: {
        newline: '\n'.charCodeAt(0),
        semicolon: ';'.charCodeAt(0),
        minus: '-'.charCodeAt(0),
        period: '.'.charCodeAt(0),
        zero: '0'.charCodeAt(0),
    },
    maxCityLength: 100,
    maxTempLength: 5,
    maxLineLength: 107, // City, temp, semicolon and newline;
} as const;
