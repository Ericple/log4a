# DailyRollingFileAppender

> 提供每日滚动生成日志文件的能力

## `constructor(name, level, useWorker)`

- `name` string - 此文件追加器名称
- `level` Level - 此追加器对应日志等级
- `useWorker` boolean - 是否开启多线程

新建一个`DailyRollingFileAppender`。文件名由Log4a按日期自动生成，无需传入路径。

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


## `clearAllHistory()` <Badge type="tip" text="1.5.7 +" />

删除所有历史日志（包括滚动生成的缓存文件），并清空当前历史记录

## `getAllHistory(count?)`

- `count` number? - 要读取的历史日志文件数量，默认为3

获取包含历史缓存文件及当前会话在内的历史日志（当前会话部分需要Appender启用历史记录）

## `clearCurrentHistory()`

删除当前日志文件（不删除已滚动生成的缓存文件）