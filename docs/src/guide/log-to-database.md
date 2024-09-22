# 输出到SQLite数据库 <Badge type="tip" text="1.5.10 +" />

log4a实现了`DatabaseAppender`，开发者可以通过此追加器，将日志记录在HarmonyOS关系型数据库中

## 基础用法

```typescript
const dbAppender = new DatabaseAppender({
  ctx,
  name: 'mainDbAppender',
  level: Level.ALL
})
LogManager.registerLogger('Index').bindAppenderGlobally(dbAppender);
```

在初始化DatabaseAppender时，需要传入`IDatabaseAppenderOption`

```typescript
interface IDatabaseAppenderOption {
ctx: common.BaseContext; // 应用上下文
name: string; // 追加器名称
level: Level; // 追加器日志等级
storeConfig?: relationalStore.StoreConfig; // 数据库配置
}
```

若初始化配置中的`storeConfig`为空，则使用默认的初始化配置，默认配置如下：

```typescript
const config = {
  securityLevel: relationalStore.SecurityLevel.S1,
  name: `log4a_${databaseAppenderOptions.name}_output.db`
}
```

其中，databaseAppenderOptions.name即IDatabaseAppenderOption中的`name`属性

## 查询历史日志

从Logger中拿到DatabaseAppender后，可通过`getLogs`方法获取历史日志。`getLogs`方法接收0-1个参数，
参数缺省时获取所有历史日志。参数类型为`DbLogFilter`

### DbLogFilter

数据库日志过滤器

#### `create()`

新建一个过滤器

#### `maxLevel(level)`

- `level` Level - 最大日志等级

#### `minLevel(level)`

- `level` Level - 最小日志等级

#### `tag(tag)`

- `tag` string - 搜索标签

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

### 用例

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