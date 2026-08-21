# FileAppender

> 提供日志输出到文件的能力

## `constructor(path, name, level, options?)`

- `path` string - 日志文件路径或名称
- `name` string - 此文件追加器名称
- `level` Level - 此追加器对应日志等级
- `options` FileAppenderOptions - 追加器配置
    - `useWorker` boolean? - 是否开启多线程
    - `maxFileSize` number? - 最大日志文件大小
    - `maxCacheCount` number? - 最大日志文件数量
    - `encryptor` (level: Level, originalLog: string | ArrayBuffer) => string | ArrayBuffer - 加密函数
    - `filter` (level: Level, content: string | ArrayBuffer) => boolean - 额外的日志过滤函数
    - `expireTime` number? - 指定日志过期时间，单位：秒

新建一个`FileAppender`

> [!NOTE]
> 当 `useWorker` 为 `true` 时，`encryptor` 不会生效。

## `matchOptions(options?)`

- `options` FileAppenderOptions? - 要对比的追加器配置

判断当前追加器是否与给出的核心配置（`useWorker`、`maxFileSize`、`maxCacheCount`、`encryptor`）吻合

## `onLog(level, tag, time, count, message, tempContext)`

- `level` Level - 日志等级
- `tag` string - 日志标签
- `time` number - 日志时间戳
- `count` number - 日志序号
- `message` string | ArrayBuffer - 日志内容
- `tempContext` TemporaryLoggerContext - 日志临时上下文

当被绑定的宿主Logger记录日志时会调用此方法

## `onTerminate()`

终止此Appender的所有日志记录活动

## `getAllHistory()`

获取已滚动生成的缓存文件中的历史日志

## `clearAllHistory()`

删除所有历史日志（包括滚动生成的缓存文件），并清空当前历史记录

## `clearCurrentHistory()`

删除当前日志文件（不删除已滚动生成的缓存文件）