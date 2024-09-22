# DatabaseAppender

> 提供日志输出到数据库的能力

## `constructor(options)`

- `options` DatabaseAppenderOptions
    - `ctx` common.BaseContext - 应用上下文
    - `name` string - 追加器名称
    - `level` Level - 日志输出等级
    - `storeConfig` relationalStore.StoreConfig | undefined - 数据库配置

新建一个`DatabaseAppender`

## `getLogs(filter)`

- `filter` DbLogFilter | undefined - 日志过滤器

获取数据库中的日志，可传入filter以对要获取的日志进行约束

### 用例

```typescript
const logger = LogManager.getLogger('Index');
const appender = logger.getAppender<DatabaseAppender>('mainDbAppender');
if (appender) {
  const result: Array<ILogInfo> = appender.getLogs(DbLogFilter.create().maxLevel(Level.WARN));
  for (let logInfo of result) {
    console.log(logInfo.message);
  }
}
```