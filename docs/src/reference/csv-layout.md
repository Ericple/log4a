# CSVLayout

以csv格式输出日志各项信息

## `makeMessage(level, tag, time, count, message): string`

- `level` Level - 日志等级
- `tag` string - 日志标签
- `time` number - 日志时间戳
- `count` number - 日志排序
- `message` string | ArrayBuffer - 日志消息

按照参数输出格式化后的消息