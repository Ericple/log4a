# DailyRollingFileAppender

> 提供每日滚动生成日志文件的能力

## `constructor(path, name, level, useWorker)`

- `path` string - 日志文件路径或名称
- `name` string - 此文件追加器名称
- `level` Level - 此追加器对应日志等级
- `useWorker` boolean? - 是否开启多线程

新建一个`DailyRollingFileAppender`

## `matchOptions(options)`

- `options` FileAppenderOptions - 要对比的追加器配置

判断当前追加器配置和给出配置是否完全吻合

## `getAllHistory()`

获取包含缓存的所有历史日志

## `clearCurrentHistory()`

删除所有日志缓存