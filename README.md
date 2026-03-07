# 1BRC: The Polyglot One Billion Row Challenge

This repository contains various implementations of [**The 1 Billion Row Challenge**](https://github.com/gunnarmorling/1brc). Originally a Java focused benchmark, this project explores the performance limits of different runtimes—starting with **Node.js**, **Go**, and **Rust** to process 1,000,000,000 rows of temperature data as efficiently as possible without external libraries.

## Motivation

The goal is to discover what modern runtimes can achieve out of the box without making the implementation unmaintainable or relying on native extensions (like `node-gyp` for Node.js). This project also serves as an experiment in building utilities such as loggers and command-line parsers using the standard libraries.

### Roadmap

- Languages
    - [x] TypeScript (Node.js)
    - [ ] Go (WIP)
    - [ ] Rust
- Monorepo
    - [ ] add tasks to build and run every implementation

## Structure

```
.
├── data                 # Dataset dictory
├── generator            # 1BRC data generator
├── mise.toml            # Tooling and task management
├── nodejs               # Node.js implementation
└── README.md
```

## Prerequisites

This project uses [**`mise`**](https://mise.jdx.dev/) to manage all tools and tasks. You do not need to manually install Java, Maven, or Node.js.

1. **Install mise:**
    ```sh
    curl [https://mise.jdx.dev/install.sh](https://mise.jdx.dev/install.sh) | sh
    ```

```sh
# Initialise the project
mise run init

> [!WARNING]
> This repo uses has the 1 billion row challenges repo as a submodule. `mise run init` takes care of the proper initialisation.
```

## Dataset

The data is generated into the `./data` directory. You can generate the full billion rows or a smaller sample for testing.

```sh
# Generate the dataset
mise run generate 1000000000 # or some other smaller number
```

# Node.js

## Running

Build the solution with `Nodejs 24`

```sh
cd nodejs
npm run build
```

Run the solution

```sh
time node dist/index.js --file path/to/measurements.txt # probably ../data/1000000000_measurements.txt

```

## Usage

```sh
Usage: node dist/index.js --file measurements.txt [--silent] [--threads <number>] [--help]
 -f, --file             specificy the weather station file
 -s, --silent           only display the output
 -t, --threads <number> number of threads (will be overriden if there are not enough lines)
 -h, --help             display this help and exit
```
