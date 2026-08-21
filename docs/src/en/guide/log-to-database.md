# Output to SQLite database <Badge type="tip" text="1.5.10 +" />

log4a implements `DatabaseAppender`, which can record logs in a HarmonyOS relational database.

## Basic usage

```typescript
import { DatabaseAppender, Level, LogManager } from '@pie/log4a';

const dbAppender = new DatabaseAppender({
  ctx,
  name: 'mainDbAppender',
  level: Level.ALL
})
LogManager.registerLogger('Index').bindAppenderGlobally(dbAppender);
```

When initializing `DatabaseAppender`, you need to pass `IDatabaseAppenderOption`:

```typescript
interface IDatabaseAppenderOption {
  ctx: common.BaseContext; // Application context
  name: string; // Appender name
  level: Level; // Appender log level
  storeConfig?: relationalStore.StoreConfig; // Database configuration
}
```

If `storeConfig` is empty, the default configuration is used:

```typescript
const config = {
  securityLevel: relationalStore.SecurityLevel.S1,
  name: `log4a_${databaseAppenderOptions.name}_output.db`
}
```

## Query history logs

After getting the `DatabaseAppender` from a Logger, you can use `getLogs` to get history logs. `getLogs` accepts 0-1 parameters. When the parameter is omitted, all history logs are returned. The parameter type is `DbLogFilter`.

### DbLogFilter

Database log filter

#### `create()`

Creates a new filter

#### `maxLevel(level)`

- `level` Level - Maximum log level

#### `minLevel(level)`

- `level` Level - Minimum log level

#### `tag(tag)`

- `tag` string - Search tag

> [!NOTE]
> In the current implementation, the filter only takes effect when `maxLevel`, `minLevel`, and `tag` are all set. If any one is missing, `getLogs` returns all logs.

### ILogInfo

```typescript
interface ILogInfo {
  level: Level;
  tag: string;
  time: number;
  count: number;
  message: string;
  tempContext?: TemporaryLoggerContext;
}
```

### Example

```typescript
const appender = this.logger.getAppender<DatabaseAppender>('mainDbAppender');
if (appender) {
  const logs: Array<ILogInfo> =
    appender.getLogs(DbLogFilter.create().maxLevel(Level.ALL).minLevel(Level.WARN).tag('ExampleTag'));
  for (let log of logs) {
    console.log(log.tag, log.level, log.time, log.count, log.message);
  }
}
```
