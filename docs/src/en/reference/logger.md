# Logger

> [!INFO]
> is used to output logs and inherits `AbstractLogger`

## Constructor

## `constructor(context)`

- `context` any - A class instance or class name

Creates a `Logger`. It usually binds a default `ConsoleAppender`. Developers normally obtain a Logger through `LogManager.getLogger`.

## Method

`Logger` has the following methods

## `registerLogListener(listener): this` <Badge type="tip" text="1.3.0-rc.1 +" />

- `listener` (level: Level, content: string) => void

Register a listener, call when a log is recorded, support chain calls

## `triggerMail(...appenderIdentifiers: string[]): this`

- `appenderIdentifiers` string[] - Names of SMTPAppender to trigger manually

Manually trigger the specified `SMTPAppender` to send the currently queued logs, supporting chain calls

## `getAppender<T extends AbstractAppender>(predicates): T | undefined`

- `predicates` string | AppenderTypeEnum - Can be the name or type of an Appender

Get a bound appender. If multiple appenders meet the condition, the first matching appender is returned

## `configureAppender(predicates, configCallback): this`

- `predicates` string | AppenderTypeEnum - Can be the name or type of an Appender
- `configCallback` (appender?: AbstractAppender) => AbstractAppender - Configuration callback

Reconfigure a bound appender; all Loggers bound to this appender are affected, supporting chain calls

## `getHistoryOfAppender(predicates)` <Badge type="tip" text="1.1.0 +" />

- `predicates` string | AppenderTypeEnum - Can be the name or type of an Appender

Gets the logs generated between the time the application is started and when it is called (history must be enabled on the corresponding appender)

## `getAllHistoryOfAppender(predicates)` <Badge type="tip" text="1.1.0 +" />

- `predicates` string - Searches for a named FileAppender

Gets the history log contents of the named file-type Appender. This usually includes rolled cache files (`DailyRollingFileAppender` also includes the current session; the current session part requires history to be enabled)

## `setLevel(level): this`

- `level` Level - Log level to be set

To set the new log level, this method returns the instance itself and supports chain calls

## `withMarker(marker): this`

- `marker` Marker | string - The label to be added. It can be obtained through `MarkerManager.getMarker` or passed as a string directly

Add a label for the next log to be written, which will be attached to the end of the log content, supporting chain calls

## `addAppender(appender)` `deprecated`

- `appender` T extends AbstractAppender - Appender

Bind appender to the Logger. appender can be any add-on built into log4a, or it can be implemented by the developer.

> [!WARNING]
> This method is deprecated. Use `Logger.bindAppender` instead.

## `bindAppender(appender)`

- `appender` T extends AbstractAppender - Appender to bind

Bind appender to the Logger. appender can be any built-in appender or a custom appender extending `AbstractAppender`.

## `addFileAppender(path, name?, level?, options?)` `deprecated`

- `path` string - File path to write out
- `name` string? - Name of the FileAppender, used as an index to delete; defaults to an empty string
- `level` Level? - Output log level, default `Level.ALL`
- `options`
  - `useWorker` boolean? - Whether to enable multithreading
  - `maxFileSize` number? - The maximum log file usage, in KB
  - `maxCacheCount` number? - Maximum number of log caches
  - `encryptor` ((level: Level, originalLog: string | ArrayBuffer) => string | ArrayBuffer)? - Encryption function
  - `filter` ((level: Level, content: string | ArrayBuffer) => boolean)? - Additional log filtering function
  - `expireTime` number? - Log cache expiration time in seconds

Adds a new FileAppender to Logger that supports chain calls. Note: when `useWorker` is `true`, `encryptor` does not take effect.

> [!WARNING]
> This method is deprecated. Use `Logger.bindAppender(new FileAppender(...))` instead.

## `addConsoleAppender(level?): this` `deprecated`

- `level` Level? - Output log level, default `Level.ALL`

Adds a new ConsoleAppender to this Logger, supporting chain calls

> [!WARNING]
> This method is deprecated. Use `Logger.bindAppender(new ConsoleAppender(...))` instead.

## `clearAppender(): this`

Delete all the appenders bound to this Logger and support chain calls

## `removeTypedAppender(type): this` `deprecated`

- `type` AppenderTypeEnum - Type of Appender to be removed

Removes all appenders of type `type` and supports chain calls

> [!WARNING]
> This method is deprecated. Use `Logger.removeAppenderByType` instead.

## `removeAppenderByType(appenderType: AppenderTypeEnum): this`

- `appenderType` AppenderTypeEnum - Type of Appender to be removed

Removes all appenders of type `appenderType` and supports chain calls

## `removeNamedAppender(name): this` `deprecated`

- `name` string - Name of an Appender to be removed

Delete the Appender named `name`, supporting chain calls

> [!WARNING]
> This method is deprecated. Use `Logger.removeAppenderByName` instead.

## `removeAppenderByName(name): this`

- `name` string - Name of an Appender to be removed

Delete the Appender named `name`, supporting chain calls

## `debug(format, ...args)`

- `format` string - Indicates the output format
- `args` any - Output variable

Output a log whose Level is DEBUG

## `warn(format, ...args)` <Badge type="tip" text="1.5.4 +" />

- `format` string - Indicates the output format
- `args` any - Output variable

Output a log whose Level is WARN

## `error(format, ...args)`

- `format` string - Indicates the output format
- `args` any - Output variable

Output a log whose Level is ERROR

## `info(format, ...args)`

- `format` string - Indicates the output format
- `args` any - Output variable

Output a log whose Level is INFO

## `fatal(format, ...args)`

- `format` string - Indicates the output format
- `args` any - Output variable

Output a log whose Level is FATAL

## `trace(format, ...args)`

- `format` string - Indicates the output format
- `args` any - Output variable

Output a log whose Level is TRACE

## `log(format, ...args)`

- `format` string - Indicates the output format
- `args` any - Output variable

Output a log whose Level is INFO

## `terminate(type?)` <Badge type="tip" text="1.5.14 +" />

- `type` number? - Appender type to terminate. Multiple types can be joined with `|`; if omitted, all appenders are terminated.

Terminates all appenders and ends the Logger's running
