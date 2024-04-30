# LogManager

> [!INFO]
> 管理全局Logger

## 方法

`LogManager`具有以下方法

## `getLogger(context)`

- `context` Object 必须传入`this`

根据上下文获取对应Logger，参数需传入this

## `anonymous()`

获取匿名Logger

## `terminate()`

回收所有Logger。调用该方法的同时，Log4a会清除所有Appender，如果Appender存在多线程，则线程会被终止。开发者应在应用退出时调用此方法。