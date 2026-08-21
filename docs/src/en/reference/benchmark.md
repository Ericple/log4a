# Benchmark

A benchmark class for quickly comparing multithreaded file output with single-threaded file output.

## `constructor(path)`

- `path` string - Log file output path

Creates a `Benchmark` instance. It prepares two groups of loggers, writing to the same path with single-threaded and multithreaded file appenders respectively.

## `start(logger): void`

- `logger` Logger - Logger used to run the benchmark

Runs the benchmark with the specified Logger.

## `withWorker(): void`

Runs the multithreaded file output benchmark.

## `withoutWorker(): void`

Runs the single-threaded file output benchmark.
