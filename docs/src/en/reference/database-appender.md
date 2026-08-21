# DatabaseAppender

> Provides the ability to output logs to a database

## `constructor(options)`

- `options` IDatabaseAppenderOption
  - `ctx` common.BaseContext - Application context
  - `name` string - Appender name
  - `level` Level - Log output level
  - `storeConfig` relationalStore.StoreConfig | undefined - Database configuration

Creates a `DatabaseAppender`

## `getLogs(filter)`

- `filter` DbLogFilter | undefined - Log filter

Gets logs from the database and returns `Array<ILogInfo>`. Note: currently `DbLogFilter` requires `tag`, `maxLevel`, and `minLevel` to be set together; otherwise all logs are returned.

## `clear()`

Clears the log database

## `deleteLog(configureCallback)`

- `configureCallback` (predicates: relationalStore.RdbPredicates) => void - Configure deletion conditions in the callback

Deletes logs from the database according to the given predicates

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

### Example

```typescript
import { LogManager, DatabaseAppender, DbLogFilter, Level, ILogInfo } from '@pie/log4a';

const logger = LogManager.getLogger('Index');
const appender = logger.getAppender<DatabaseAppender>('mainDbAppender');
if (appender) {
  const result: Array<ILogInfo> =
    appender.getLogs(DbLogFilter.create().maxLevel(Level.WARN).minLevel(Level.ERROR).tag('ExampleTag'));
  for (let logInfo of result) {
    console.log(logInfo.message);
  }
}
```
