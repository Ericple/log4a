# PatternLayout

以给定的格式输出日志各项信息

## `constructor(pattern)`

- `pattern` string | undefined - 初始格式，默认值: `[%-5p]\t%d\t[%C:%r]\t%m`

创建一个新的PatternLayout

## `setPattern(newPattern): this`

- `newPattern` string - 新格式

重新设置PatternLayout中的格式

## `makeMessage(level, tag, time, count, message): string`

- `level` Level - 日志等级
- `tag` string - 日志标签
- `time` number - 日志时间戳
- `count` number - 日志排序
- `message` string | ArrayBuffer - 日志消息

按照参数输出格式化后的消息