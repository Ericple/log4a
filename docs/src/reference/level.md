# 日志等级

日志等级的作用是标记日志消息，使Log4a可以对不同等级的日志进行不同的处理。

## 静态属性

日志等级具有以下静态属性：

## `Level.OFF`

日志等级-关闭：此等级下，所有日志均被忽略。

## `Level.FATAL`

日志等级-致命错误：此等级下，仅致命错误等级日志会被打印

## `Level.ERROR`

日志等级-错误：此等级下，致命错误、错误等级日志会被打印

## `Level.WARN`

日志等级-警告：此等级下，致命错误、错误、警告等级日志会被打印

## `Level.INFO`

日志等级-信息：此等级下，致命错误、错误、警告、信息等级日志会被打印

## `Level.DEBUG`

日志等级-调试：此等级下，致命错误、错误、警告、信息、调试等级日志会被打印

## `Level.TRACE`

日志等级-追踪：此等级下，致命错误、错误、警告、信息、调试、追踪等级日志会被打印

## `Level.ALL`

日志等级-全部：此等级下，所有日志都将被打印

## 方法

日志等级包含以下方法

## `static forName(name, intValue)`

- `name` string - 日志等级名称
- `intValue` number - 日志等级

获取对应名称的日志等级，如果日志等级不存在，则使用给定的名称及等级创建新日志等级，并返回该等级。

## `static getLevel(name, intLevel?)`

- `name` string - 日志等级名称
- `intLevel` number | undefined - 日志等级

获取对应名称的日志等级，如果不存在，则使用给定的等级（默认为`Level.INFO`）创建并返回该等级。

## `static toLevel(name,defaultLevel?)`

- `name` string - 日志等级名称
- `defaultLevel` Level? - 日志等级，默认为`Level.DEBUG`

将给定的名称转换为日志等级，若日志等级未注册，则返回默认等级（默认为`Level.DEBUG`）

## `static values()`

获取所有已注册的日志等级

## `name`

获取日志等级名称（属性）

## `toString()`

将日志等级转化为字符串，返回日志等级名称

## `intLevel()`

获取日志等级

## `equals(other)`

- `other` Level

比较两个日志等级是否一致

## `equalsStrict(other)`

- `other` Level

比较两个日志等级对象是否同源

## `isLessSpecificThan(other)`

- `other` Level

判断当前日志等级是否比给定日志等级更不具体（或相同）

## `isMoreSpecificThan(other)`

- `other` Level

判断当前日志等级是否比给定日志等级更具体（或相同）

## `hashCode()`

计算当前日志等级名称的hash code

## `getStandardLevel()`

将该日志等级转换为等级最接近的标准日志等级

## `isInRange(minLevel, maxLevel)`

- `minLevel` Level
- `maxLevel` Level

判断当前日志等级是否大于等于`minLevel`且小于等于`maxLevel`