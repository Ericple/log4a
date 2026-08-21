# ConsoleAppender

> 提供输出日志到控制台的能力

## `constructor(level?, useHilog?, domain?)`

- `level` Level - 日志等级
- `useHilog` boolean | undefined - 是否使用hilog输出日志，默认为false
- `domain` number | undefined - 使用hilog输出日志时，使用的domain，默认为0x0，最大值为0xFFF

创建一个`ConsoleAppender`

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
