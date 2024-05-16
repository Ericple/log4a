# RollingFileAppender

> Provide the ability to scroll log output files

## `constructor(path, name, level, maxFileSize, maxCacheCount, useWorker)`

- `path` string - Path or name of the log file
- `name` string - Name of the file append
- `level` Level - This append corresponds to the log level
- `maxFileSize` number?  - Maximum log file size
- `maxCacheCount` number?  - Maximum number of log files
- `useWorker` boolean?  - Whether to enable multithreading

Create a `RollingFileAppender`

## `matchOptions(options)`

- `options` FileAppenderOptions - Appenderoptions to compare

Check whether the current append configuration matches the given configuration

## `onLog(level, message)`

- `level` Level - Log level
- `message` string - Log content

This method is called when the bound host Logger logs

## `onTerminate()`

Terminates all logging activities for this Appender

## `getAllHistory()`

Gets all the history logs that contain the cache

## `clearCurrentHistory()`

Delete all log caches