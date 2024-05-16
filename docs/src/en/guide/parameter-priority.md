# Parameter priority

## Priority of options in FileAppender

Why is there a priority

When the developer adds `FileAppender` , there may be multiple `FileAppender` bound to a `Logger` situation, in this case, if each `FileAppender` is added, you need to pass `options` parameter, which will make the code complicated and difficult to read. When multiple Fileappenders point to the same file, you can set options for only one FileAppender instead of passing options every time you bind a FileAppender.

## Summary

If multiple Fileappenders point to the same log file, you only need to set the options parameter for one of them

```typescript
class Example1 {
    private logger_a: Logger = LogManager.getLogger(this).addFileAppender('/path/to_file.log', 'main',Level.INFO, {
        useWorker: true
    });
}
class Example2 {
    // You do not need to pass in options here; the configuration will be the same as logger_a in Example1
    private logger_b: Logger = LogManager.getLogger(this).addFileAppender('/path/to_file.log', 'main',Level.INFO);
}
```
## Priority of the log level

If you've read through [Quick Start](/guide/geting-started), you've noticed that we can set a log output level in both 'Logger' and Appender, so we need to cover this in particular.

## Why is there a priority

Log messages of Log4a are constructed in Logger. Before building log messages, log levels are filtered by Logger. When the log level is higher than the level set in Logger, this log message will be ignored. The FileAppender and ConsoleAppender bound to the Logger cannot receive the log.

Conversely, if the log level is lower than the Logger log level, the log message is further filtered by the FileAppender and ConsoleAppender.

## Summary

Log messages are filtered by the Logger before being handed over to the Appender for filtering. Therefore, the log level of the Logger takes precedence over that of the Appender