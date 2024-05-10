# FileAppender

> 提供

## `constructor(path, name, level, options)`

- `path` string - 日志文件路径或名称
- `name` string - 此文件追加器名称
- `level` Level - 此追加器对应日志等级
- `options` FileAppenderOptions - 追加器配置
  - `useWorker` boolean? - 是否开启多线程
  - `maxFileSize` number? - 最大日志文件大小
  - `maxCacheCount` number? - 最大日志文件数量
  - `encryptor` (level: Level, originalLog: string | ArrayBuffer) => string | ArrayBuffer - 加密函数
  - `filter` (level: Level, content: string | ArrayBuffer) => boolean - 额外的日志过滤函数

新建一个`FileAppender`

## `matchOptions(options)`

- `options` FileAppenderOptions - 要对比的追加器配置

判断当前追加器配置和给出配置是否完全吻合

## `onLog(level, message)`

- `level` Level - 日志等级
- `message` string - 日志内容

当被绑定的宿主Logger记录日志时会调用此方法

## `onTerminate()`

终止此Appender的所有日志记录活动