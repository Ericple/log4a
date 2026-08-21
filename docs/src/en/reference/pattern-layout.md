# PatternLayout

Outputs log information according to a given pattern

## `constructor(pattern)`

- `pattern` string | undefined - Initial pattern, default: `[%-5p]\t%d\t[%C:%r]\t%m\n`

Creates a new `PatternLayout`

## `setPattern(newPattern): this`

- `newPattern` string - New pattern

Resets the pattern of this `PatternLayout`

## `makeMessage(level, tag, time, count, message, stackInfo, tempContext): string`

- `level` Level - Log level
- `tag` string - Log tag
- `time` number - Log timestamp
- `count` number - Log sequence number
- `message` string | ArrayBuffer - Log message
- `stackInfo` string - Log call stack information
- `tempContext` TemporaryLoggerContext - Log temporary context

Formats the message according to the parameters
