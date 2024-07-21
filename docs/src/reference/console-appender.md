# ConsoleAppender

> 提供输出日志到控制台的能力

## `constructor(level, useHilog, domain)`

- `level` Level - 日志等级
- `useHilog` boolean | undefined - 是否使用hilog输出日志，默认为false
- `domain` number | undefined - 使用hilog输出日志时，使用的domain，默认为0x0，最大值为0xFFF

创建一个`ConsoleAppender`
