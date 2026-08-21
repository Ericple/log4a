# FileAppender

> Provide the ability to output logs to files

## `constructor(path, name, level, options?)`

- `path` string - Path or name of the log file
- `name` string - Name of the file append
- `level` Level - This append corresponds to the log level
- `options` FileAppenderOptions - Append configuration
- `useWorker` boolean?  - Whether to enable multithreading
- `maxFileSize` number?  - Maximum log file size
- `maxCacheCount` number?  - Maximum number of log files
- `encryptor` (level: Level, originalLog: string | ArrayBuffer) => string | ArrayBuffer - Encryption function
- `filter` (level: Level, content: string | ArrayBuffer) => boolean - Additional log filtering function
- `expireTime` number? - Log cache expiration time in seconds

Create a new FileAppender

> [!NOTE]
> When `useWorker` is `true`, `encryptor` does not take effect.

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

## `getAllHistory()`

Gets history logs from rolled cache files

## `clearAllHistory()`

Deletes all history logs (including rolled cache files) and clears the current history

## `clearCurrentHistory()`

Delete the current log file (does not delete rolled cache files)