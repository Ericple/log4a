# UDPSocketAppender

> 提供通过UDP协议连接服务器并将日志实时推送到服务端的能力，需要开发者自行申请`ohos.permission.INTERNET`权限

## `constructor(config)`

- `config` UDPSocketAppenderOptions
  - `name` string - 追加器名称
  - `level` Level - 追加器日志等级
  - `address` string - 服务器地址
  - `port` number - 服务器端口号
  - `encryptor` ((level: Level, originalLog: string | ArrayBuffer) => string | ArrayBuffer)? - 加密函数
  - `filter` ((level: Level, content: string | ArrayBuffer) => boolean)? - 额外的日志过滤函数

新建一个`UDPSocketAppender`

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