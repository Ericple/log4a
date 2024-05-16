# Logger

> [!INFO]
> is used to output logs and inherits` AbstractLogger `

## Method

`Logger` has the following methods

## `registerLogListener(listener): this` <Badge type="tip" text="1.3.0-rc.1 +" />

- `listener` (level: Level, content: string) => void

Register a listener, call when a log is recorded, support chain calls

getHistoryOfAppender(predicates) <Badge type="tip" text="1.1.0 +" />

- `predicates` string | AppenderTypeEnum - Can be the name or type of an Appender. Returns the first Appender that meets the conditions

Gets the logs generated between the time the application is started and when it is called

getAllHistoryOfAppender(predicates) <Badge type="tip" text="1.1.0 +" />

- `predicates` string - Searches for a named FileAppender

Get all log contents, including cache

## `setLevel(level): this`

- `level` Level - Log level to be set

To set the new log level, this method returns the instance itself and supports chain calls

## `withMarker(marker): this`

- `marker` Marker - The label to be added, obtained by `MarkerManager.getMarker`

Add a label for the next log to be written, which will be attached to the end of the log content, supporting chain calls

## `addAppender(appender)`

- `appender` T extends AbstractAppender - Appends

Bind appender to the Logger. appender can be any add-on built into log4a, or it can be implemented by the developer.

## `addFileAppender(path, name, level? , options?) `

- `path` string - File path to write out
- `name` string - Name of the FileAppender, used as an index to delete
- `level` Level - Indicates the highest level of output logs. Logs higher than this level are ignored
- `options`
- `useWorker` boolean - Specifies whether to enable multithreading
- `maxFileSize` number - The maximum log file usage, in KB
- `maxCacheCount` number - Maximum number of log caches
- `encryptor` (level: Level, originalLog: string | ArrayBuffer) => string | ArrayBuffer - Encryption function

Adds a new FileAppender to Logger that supports chain calls

## `addConsoleAppender(level?) : this`

- `level` - Indicates the highest log Level. The default value is level.all

Set the log output level of this Logger. Logs higher than this level are ignored. The filtering priority is higher than that of Appender

## `clearAppender(): this`

Delete all the appenders bound to this Logger and support chain calls

## `removeTypedAppender(type): this`

- `type` AppenderTypeEnum - Type of Appender to be removed

Removes all appenders of type `type` and supports chain calls

## `removeNamedAppender(name): this`

- `name` string - Name of an Appender to be removed

Delete FileAppender named `name` to support chain calls

## `debug(format, ... args)`

- `format` string - Indicates the output format
- `args` any - Output variable

Output a log whose Level is DEBUG

## `error(format, ... args)`

- `format` string - Indicates the output format
- `args` any - Output variable

Output a log whose Level is ERROR

## `info(format, ... args)`

- `format` string - Indicates the output format
- `args` any - Output variable

Output a log whose Level is INFO

## `fatal(format, ... args)`

- `format` string - Indicates the output format
- `args` any - Output variable

Output a log whose Level is FATAL

## `trace(format, ... args)`

- `format` string - Indicates the output format
- `args` any - Output variable

Output a log whose Level is TRACE

## `terminate()`

Terminates all appenders and ends the Logger`s running