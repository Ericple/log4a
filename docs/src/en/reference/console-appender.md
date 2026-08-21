# ConsoleAppender

> Provides the ability to output logs to the console

## `constructor(level?, useHilog?, domain?)`

- `level` Level - Log level
- `useHilog` boolean | undefined - Whether to use hilog for output, default false
- `domain` number | undefined - Domain used with hilog, default 0x0, maximum 0xFFF

Creates a `ConsoleAppender`

## `onLog(level, tag, time, count, message, tempContext)`

- `level` Level - Log level
- `tag` string - Log tag
- `time` number - Log timestamp
- `count` number - Log sequence number
- `message` string - Log content
- `tempContext` TemporaryLoggerContext - Log temporary context

Called when the bound host Logger records a log

## `onTerminate()`

Terminates all logging activities of this Appender
