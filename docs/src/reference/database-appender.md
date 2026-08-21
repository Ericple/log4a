# DatabaseAppender

> 提供日志输出到数据库的能力

## `constructor(options)`

- `options` IDatabaseAppenderOption
    - `ctx` common.BaseContext - 应用上下文
    - `name` string - 追加器名称
    - `level` Level - 日志输出等级
    - `storeConfig` relationalStore.StoreConfig | undefined - 数据库配置

新建一个`DatabaseAppender`

## `getLogs(filter)`

- `filter` DbLogFilter | undefined - 日志过滤器

获取数据库中的日志，返回`Array<ILogInfo>`，可传入filter以对要获取的日志进行约束。注意：当前`DbLogFilter`需同时设置`tag`、`maxLevel`、`minLevel`才会应用过滤条件，否则返回全部日志。

## `clear()`

清空日志数据库

## `deleteLog(configureCallback)`

- `configureCallback` (predicates: relationalStore.RdbPredicates) => void - 在回调中配置删除条件

按给定的predicates删除数据库中的日志

## `onLog(level, tag, time, count, message, tempContext)`

- `level` Level - 日志等级
- `tag` string - 日志标签
- `time` number - 日志时间戳
- `count` number - 日志序号
- `message` string - 日志内容
- `tempContext` TemporaryLoggerContext - 日志临时上下文

当被绑定的宿主Logger记录日志时会调用此方法

## `onTerminate()`

终止此Appender的所有日志记录活动


### 用例

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