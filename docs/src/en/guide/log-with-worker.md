# Use Worker to output logs

Log4a allows developers to use multiple threads to output logs to files for optimal performance

> [!WARNING]
> Due to design flaws, if you are using a version of Log4a below '1.3.0', avoid using multithreading, which can cause performance degradation.

## Worker brings improved performance

In the Log4a Benchmark test, the log output efficiency using multiple threads is about 2-7 times higher than using a single thread

![](/multiThread-logging-compare.svg)