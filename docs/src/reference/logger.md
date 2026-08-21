# Logger

> 最后编辑时间：2024-07-13 10:14

> [!INFO]
> 用于输出日志，继承了`AbstractLogger`

## 构造函数

## `constructor(context)`

- `context` any - 类实例或类名

创建一个`Logger`，通常会绑定一个默认的`ConsoleAppender`。开发者通常应通过`LogManager.getLogger`获取Logger。

## 方法

`Logger`具有以下方法

## `registerLogListener(listener): this` <Badge type="tip" text="1.3.0-rc.1 +" />

- `listener` (level: Level, content: string) => void

注册一个监听器，当有日志被记录时调用，支持链式调用

## `triggerMail(...appenderIdentifiers: string[]): this`

- `appenderIdentifiers` string[] - 需要手动触发邮件发送的SMTPAppender名称

手动触发指定名称的`SMTPAppender`发送当前暂存的日志，支持链式调用

## `getAppender<T extends AbstractAppender>(predicates): T | undefined`

- `predicates` string | AppenderTypeEnum - 可以是`Appender`名称或类型

获取已绑定的追加器，当有多个追加器满足条件时返回第一个符合条件的追加器

## `configureAppender(predicates, configCallback): this`

- `predicates` string | AppenderTypeEnum - 可以是`Appender`名称或类型
- `configCallback` (appender?: AbstractAppender) => AbstractAppender - 配置回调

重新配置已绑定的追加器，所有绑定了该追加器的Logger均会受影响，支持链式调用

## `getHistoryOfAppender(predicates)` <Badge type="tip" text="1.1.0 +" />

- `predicates` string | AppenderTypeEnum - 可以是`Appender`名称或类型

获取本次应用启动至被调用时期间生成的日志（需对应Appender启用历史记录）

## `getAllHistoryOfAppender(predicates)` <Badge type="tip" text="1.1.0 +" />

- `predicates` string - 用于搜索具名`FileAppender`

获取指定具名文件类Appender的历史日志内容，通常包含已滚动生成的缓存文件（`DailyRollingFileAppender`还会包含当前会话）

## `setLevel(level): this`

- `level` Level - 要设置的日志级别

设置新日志级别，该方法会返回实例本身，支持链式调用

## `withMarker(marker): this`

- `marker` Marker | string - 要添加的标签，可通过`MarkerManager.getMarker`获取或直接传入字符串

为下一条要写出的日志添加一个标签，该标签将随附在日志内容尾部，支持链式调用

## `addAppender(appender)` `deprecated`

- `appender` T extends AbstractAppender - 追加器

将appender绑定至该Logger。appender可以是log4a内置的任何追加器，也可以由开发者自行实现。

> [!WARNING]
> 此方法已被弃用，请改用`Logger.bindAppender`替代

## `bindAppender(appender)`

- `appender` T extends AbstractAppender - 要绑定的追加器

将appender绑定至该Logger。appender可以是log4a内置的任何追加器，也可以由开发者自行继承`AbstractAppender`实现。

## `addFileAppender(path, name?, level?, options?)` `deprecated`

- `path` string - 要写出的文件路径
- `name` string? - 该`FileAppender`的名称，用于作为删除索引，默认为空字符串
- `level` Level? - 输出日志等级，默认`Level.ALL`
- `options`
    - `useWorker` boolean? - 是否启用多线程
    - `maxFileSize` number? - 最大日志文件占用，以KB为单位
    - `maxCacheCount` number? - 最大日志缓存数量
    - `encryptor` ((level: Level, originalLog: string | ArrayBuffer) => string | ArrayBuffer)? - 加密函数
    - `filter` ((level: Level, content: string | ArrayBuffer) => boolean)? - 额外的日志过滤函数
    - `expireTime` number? - 日志缓存过期时间，单位：秒

向`Logger`添加一个新的`FileAppender`，支持链式调用。注意：当 `useWorker` 为 `true` 时，`encryptor` 不会生效。

> [!WARNING]
> 此方法已被弃用，请改用`Logger.bindAppender(new FileAppender(...))`替代

## `addConsoleAppender(level?): this` `deprecated`

- `level` Level? - 输出的日志等级，默认`Level.ALL`

向该`Logger`添加一个新的`ConsoleAppender`，支持链式调用

> [!WARNING]
> 此方法已被弃用，请改用`Logger.bindAppender(new ConsoleAppender(...))`替代

## `clearAppender(): this`

删除该`Logger`所有绑定的`Appender`，支持链式调用

## `removeTypedAppender(type): this` `deprecated`

- `type` AppenderTypeEnum - 要移除的`Appender`类型

删除所有类型为`type`的`Appender`，支持链式调用

> [!WARNING]
> 此方法已被弃用，请改用Logger.removeAppenderByType替代

## `removeAppenderByType(appenderType: AppenderTypeEnum): this`

- `appenderType` AppenderTypeEnum - 要移除的`Appender`类型

删除所有类型为`appenderType`的`Appender`，支持链式调用

## `removeNamedAppender(name): this` `deprecated`

- `name` string - 要移除的`Appender`名称

删除名称为`name`的`Appender`，支持链式调用

> [!WARNING]
> 此方法已被弃用，请改用Logger.removeAppenderByName替代

## `removeAppenderByName(name): this`

- `name` string - 要移除的`Appender`名称

删除名称为`name`的`Appender`，支持链式调用

## `debug(format, ...args)`

- `format` string - 输出格式
- `args` any - 输出变量

输出一条`Level`为`DEBUG`的日志

## `warn(format, ...args)` <Badge type="tip" text="1.5.4 +" />

- `format` string - 输出格式
- `args` any - 输出变量

输出一条`Level`为`WARN`的日志

## `error(format, ...args)`

- `format` string - 输出格式
- `args` any - 输出变量

输出一条`Level`为`ERROR`的日志

## `info(format, ...args)`

- `format` string - 输出格式
- `args` any - 输出变量

输出一条`Level`为`INFO`的日志

## `fatal(format, ...args)`

- `format` string - 输出格式
- `args` any - 输出变量

输出一条`Level`为`FATAL`的日志

## `trace(format, ...args)`

- `format` string - 输出格式
- `args` any - 输出变量

输出一条`Level`为`TRACE`的日志

## `log(format, ...args)`

- `format` string - 输出格式
- `args` any - 输出变量

输出一条`Level`为`INFO`的日志

## `terminate(type?)`

- `type` number? - 要终止的Appender类型，多个可用`|`连接；缺省时终止所有Appender

终止所有`Appender`，并结束该`Logger`的运行
