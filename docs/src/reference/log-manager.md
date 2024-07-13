# LogManager

> 最后编辑时间：2024-07-13 10:26

> [!INFO]
> 管理全局Logger

## 方法

`LogManager`具有以下方法

## `getLogger(context)`

- `context` Object 必须传入`this`

> [!INFO] 
> 从1.3.4版本开始，`context`可以传入 `string` 类型的类名。

根据上下文获取对应Logger，参数需传入this

## `anonymous()`

获取匿名Logger

## `terminate()`

回收所有Logger。调用该方法的同时，Log4a会清除所有Appender，如果Appender存在多线程，则线程会被终止。开发者应在应用退出时调用此方法。

## `setLogFilePath(path: string): void` <Badge type="tip" text="1.3.1 +" />

- `path` string - 要存储日志的沙箱路径

设置日志存储的根目录，如果希望在创建fileAppender时使用简洁路径，必须提前调用此方法

## `getLogFilePath(): string` <Badge type="tip" text="1.3.1 +" />

获取日志存储根目录

## `interceptConsole(): void` <Badge type="tip" text="1.3.1 +" />

拦截console日志

## `getOriginalConsole()`

开启拦截后，可以通过此方法获取原console对象