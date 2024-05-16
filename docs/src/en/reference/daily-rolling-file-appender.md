# DailyRollingFileAppender

> Provides the ability to generate log files on a daily rolling basis

## `constructor(path, name, level, useWorker)`

- `path` string - Path or name of the log file
- `name` string - Name of the file append
- `level` Level - This append corresponds to the log level
- `useWorker` boolean?  - Whether to enable multithreading

Create a 'DailyRollingFileAppender'

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