# Benchmark

用于快速对比多线程文件输出与单线程文件输出性能的基准测试类。

## `constructor(path)`

- `path` string - 日志文件输出路径

创建一个`Benchmark`实例，内部会准备两组Logger，分别使用单线程和多线程写入同一路径下的日志文件。

## `start(logger): void`

- `logger` Logger - 用于运行基准测试的Logger

使用指定Logger运行基准测试。

## `withWorker(): void`

运行多线程文件输出基准测试。

## `withoutWorker(): void`

运行单线程文件输出基准测试。
