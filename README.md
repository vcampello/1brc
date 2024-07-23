# The 1 Billion Row Challenge

A typescript implementation of [The 1 Billion Row Challenge](https://github.com/gunnarmorling/1brc)

## Motivation

To find out what Node.js can do out of the box without making the implementation unmaintainable or using node-gyp.

Along the way I also experiment with other things that would normally be implemented using libraries such as logger and command line option parsers.

# Usage

```sh
Usage: node dist/index.js --file measurements.txt [--silent] [--threads <number>]
 -f, --file             specificy the weather station file
 -s, --silent           only display the output
 -t, --threads <number> number of threads (will be overriden if there are not enough lines)
 -h, --help             display this help and exit
```

# Running

1. Generate the source data by following the [instructions](https://github.com/gunnarmorling/1brc) on the original challenge.
2. Optionally run

```sh
head -n 50000000 measurements.txt > sample.txt` to use a smaller line count.
```

3. Build the solution with `Nodejs 22`

```sh
npm run build
```

4. Run the solution (see [Usage](#Usage) for more options)

```sh
time node dist/index.js --file <path/to/measurements.txt>
```
