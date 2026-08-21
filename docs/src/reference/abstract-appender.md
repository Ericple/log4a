# AbstractAppender

AbstractAppender是所有Appender的基类，所有列出的方法均可在其他Appender中调用。

## `constructor(name, level, type)`

- `name` string - 追加器名称
- `level` Level - 追加器日志等级
- `type` AppenderTypeEnum - 追加器类型

创建自定义追加器时，子类构造函数应调用`super(name, level, type)`。

## `getName()`

获取Appender名称

## `getCurrentHistory()`

获取当前会话产生的所有日志（需先通过`setEnableHistory(true)`启用历史记录）

## `setLayout(layout)`  <Badge type="tip" text="1.4.0 +" />

- `layout` T extends AbstractLayout - 日志布局

设置该Appender的日志布局

## `makeMessage(level, tag, time, count, message, tempContext)`

- `level` Level - 日志等级
- `tag` string - 日志标记
- `time` number - 日志触发时间
- `count` number - 日志序号
- `message` string | ArrayBuffer - 日志消息
- `tempContext` TemporaryLoggerContext - 日志临时上下文

使用当前Appender的Layout将日志参数格式化为最终输出内容

## `onLog(level, tag, time, count, message, tempContext)`

- `level` Level - 日志等级
- `tag` string - 日志标记
- `time` number - 日志触发时间
- `count` number - 此日志为被绑定的Logger打印的第count条日志
- `message` string - 日志消息
- `tempContext` TemporaryLoggerContext - 日志临时上下文

当有日志被记录时，由被绑定至的Logger触发

## `getType()`

获取当前Appender类型

## `getId()`

获取当前appender的id

## `setId(id)`

- `id` number - 要设置的id

设置当前Appender的id

## `setLevel(level)`

- `level` Level - 要设置的日志等级

重设当前appender日志等级

## `addHistory(...message): this`

- `message` string[] - 要加入历史记录的日志

向当前Appender的历史记录中添加日志。仅在启用历史记录功能时生效。

## `clearHistory(): this`

清空当前Appender的历史记录

## `setEnableHistory(enable): this` <Badge type="tip" text="1.6 +" />

- `enable` boolean - 是否启用历史记录

设置是否启用Appender历史记录功能

## `setMaximumHistoryCount(count): this` <Badge type="tip" text="1.6 +" />

- `count` number - 最大历史记录条数

设置历史记录最大条数，超出时自动清除最早的一条历史记录

## `onTerminate()`

终止当前Appender的输出，并清理内存垃圾