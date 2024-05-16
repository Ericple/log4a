# FileAppender

> Provide the ability to output logs to files

## `constructor(path, name, level, options)`

- `path` string - Path or name of the log file
- `name` string - Name of the file append
- `level` Level - This append corresponds to the log level
- `options` FileAppenderOptions - Append configuration
- `useWorker` boolean?  - Whether to enable multithreading
- `maxFileSize` number?  - Maximum log file size
- `maxCacheCount` number?  - Maximum number of log files
- `encryptor` (level: Level, originalLog: string | ArrayBuffer) => string | ArrayBuffer - Encryption function
- `filter` (level: Level, content: string | ArrayBuffer) => boolean - Additional log filtering function

Create a new FileAppender

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