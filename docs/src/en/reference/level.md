# Log level

Log levels are used to mark log messages so that Log4a can process logs of different levels differently.

## Static attributes

The log level has the following static properties:

## `Level.OFF`

Log level - Off: At this level, all logs are ignored.

## `Level.FATAL`

Log Level - Critical Error: At this level, only critical error level logs are printed

## `Level.ERROR`

Log Level - Error: At this level, fatal errors and error level logs are printed

## `Level.WARN`

Log Level - Warning: At this level, critical error, error, and warning level logs are printed

## `Level.INFO`

Log Level - Message: At this level, critical error, error, warning, and message level logs are printed

## `Level.DEBUG`

Log Level - Debug: At this level, fatal errors, errors, warnings, messages, debug level logs are printed

## `Level.TRACE`

Log Level - Trace: At this level, critical error, error, warning, message, debug, trace level logs are printed

## `Level.ALL`

Log Level - All: At this level, all logs will be printed

## Method

Log levels include the following methods

## `static forName(name, intValue)`

- `name` string - Log level name
- `intValue` number - Log level

Gets the log level of the corresponding name. If the log level does not exist, a new log level is created with the given name and level, and the level is returned.

## `static getLevel(name, intLevel?) `

- `name` string - Log level name
- `intValue` number | undefined - Log level

Gets the log level of the corresponding name, and returns undefined if it does not exist.

## `static toLevel(name,defaultLevel?) `

- `name` string - Log level name
- `defaultLevel` Level - Log level

Converts the given name to the log Level, and returns` level.debug `if the log level is not registered

## `static values()`

Gets all registered log levels

## `name()`

Gets the log level name

## `toString()`

Converts the log level to a string and returns the log level name

## `intLevel()`

Get log level

## `equals(other)`

- `other` Level

Compare the two log levels

## `equalsStrict(other)`

- `other` Level

Compare two log level objects for the same origin

## `isLessSpecificThan(other)`

- `other` Level

Check whether the current log level is higher than the specified log level

## `isMoreSpecificThan(other)`

- `other` Level

Check whether the current log level is lower than the specified log level

## `hashCode()`

Obtain the hash code of the current log level name

## `getStandardLevel()`

Convert this log level to the nearest standard log level

## `isInRange(minLevel, maxLevel)`

- `minLevel` Level
- `maxLevel` Level

Check whether the current log level is greater than minLevel and less than maxLevel