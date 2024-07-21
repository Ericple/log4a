# AbstractAppender

AbstractAppender是所有Appender的基类，所有列出的方法均可在其他Appender中调用

## `getName()`

获取Appender名称

## `getCurrentHistory()`

获取当前会话产生的所有日志

## `setLayout(layout)`  <Badge type="tip" text="1.4.0 +" />

- `layout` T extends AbstractLayout - 日志布局

设置该Appender的日志布局

## `onLog(level, tag, time, count, message, tempContext)`

- `level` Level - 日志等级
- `tag` string - 日志标记
- `time` number - 日志触发时间
- `count` numer - 此日志为被绑定的Logger打印的第count条日志
- `message` string - 日志消息
- `tempContext` TemporaryLoggerContext - 日志临时上下文

当有日志被记录时，由被绑定至的Logger触发

## `getType()`

获取当前Appender类型

## `getId()`

获取当前appender的id

## `setId(id)`

- `id` number - 要设置的id

## `setLevel(level)`

- `level` Level - 要设置的日志等级

重设当前appender日志等级

设置当前appender的id

## `onTerminate()`

终止当前Appender的输出，并清理内存垃圾