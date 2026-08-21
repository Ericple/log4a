# RollingFileAppender

> Provide the ability to scroll log output files

## `constructor(path, name, level, maxFileSize, maxCacheCount, useWorker)`

- `path` string - Path or name of the log file
- `name` string - Name of the file append
- `level` Level - This append corresponds to the log level
- `maxFileSize` number - Maximum log file size
- `maxCacheCount` number - Maximum number of log files
- `useWorker` boolean? - Whether to enable multithreading, default false

Create a `RollingFileAppender`

## `matchOptions(options?)`

- `options` FileAppenderOptions? - Appender options to compare

Check whether the current appender matches the given core configuration (`useWorker`, `maxFileSize`, `maxCacheCount`, `encryptor`)

## `onLog(level, tag, time, count, message, tempContext)`

- `level` Level - Log level
- `tag` string - Log tag
- `time` number - Log timestamp
- `count` number - Log sequence number
- `message` string | ArrayBuffer - Log content
- `tempContext` TemporaryLoggerContext - Log temporary context

This method is called when the bound host Logger logs

## `onTerminate()`

Terminates all logging activities for this Appender


## `clearAllHistory()` <Badge type="tip" text="1.5.7 +" />

Deletes all history logs (including rolled cache files) and clears the current history

## `getAllHistory()`

Gets history logs from rolled cache files

## `clearCurrentHistory()`

Delete the current log file (does not delete rolled cache files)