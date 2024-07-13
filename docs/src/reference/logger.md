# Logger

> 最后编辑时间：2024-07-13 10:14

> [!INFO]
> 用于输出日志，继承了`AbstractLogger`

## 方法

`Logger`具有以下方法

## `registerLogListener(listener): this` <Badge type="tip" text="1.3.0-rc.1 +" />

- `listener` (level: Level, content: string) => void

注册一个监听器，当有日志被记录时调用，支持链式调用

## `getHistoryOfAppender(predicates)` <Badge type="tip" text="1.1.0 +" />

- `predicates` string | AppenderTypeEnum - 可以是`Appender`名称或类型，返回第一个符合条件的`Appender`

获取本次应用启动至被调用时期间生成的日志

## `getAllHistoryOfAppender(predicates)` <Badge type="tip" text="1.1.0 +" />

- `predicates` string - 用于搜索具名`FileAppender`

获取包括缓存在内的所有日志内容

## `setLevel(level): this`

- `level` Level - 要设置的日志级别

设置新日志级别，该方法会返回实例本身，支持链式调用

## `withMarker(marker): this`

- `marker` Marker - 要添加的标签，通过`MarkerManager.getMarker`获取

为下一条要写出的日志添加一个标签，该标签将随附在日志内容尾部，支持链式调用

## `addAppender(appender)` `deprecated`

- `appender` T extends AbstractAppender - 追加器

将appender绑定至该Logger。appender可以是log4a内置的任何追加器，也可以由开发者自行实现。

> [!WARNING]
> 此方法已被弃用，请改用Logger.bindAppender替代

## `bindAppender(appender)`

- `appender` T extends AbstractAppender - 要绑定的追加器

将appender绑定至该Logger。appender可以是log4a内置的任何追加器，也可以由开发者自行继承`AbstractAppender`实现。

## `addFileAppender(path, name, level?, options?)` `deprecated`

- `path` string - 要写出的文件路径
- `name` string - 该`FileAppender`的名称，用于作为删除索引
- `level` Level - 最高输出日志级别，高于该级别的日志将被忽略
- `options`
  - `useWorker` boolean - 是否启用多线程
  - `maxFileSize` number - 最大日志文件占用，以KB为单位
  - `maxCacheCount` number - 最大日志缓存数量
  - `encryptor` (level: Level, originalLog: string | ArrayBuffer) => string | ArrayBuffer - 加密函数

向`Logger`添加一个新的`FileAppender`，支持链式调用

> [!WARNING]
> 此方法已被弃用，请改用Logger.bindAppender替代

## `addConsoleAppender(level?): this` `deprecated`

- `level` - 输出的最高日志等级，默认Level.ALL

设置该`Logger`的日志输出级别，高于此级别的日志将被忽略，过滤优先度高于`Appender`，支持链式调用

> [!WARNING]
> 此方法已被弃用，请改用Logger.bindAppender替代

## `clearAppender(): this`

删除该`Logger`所有绑定的`Appender`，支持链式调用

## `removeTypedAppender(type): this` `deprecated`

- `type` AppenderTypeEnum - 要移除的`Appender`类型

删除所有类型为`type`的`Appender`，支持链式调用

> [!WARNING]
> 此方法已被弃用，请改用Logger.removeAppenderByType替代

## `removeTypedAppender(appenderType: AppenderTypeEnum): this`

- `type` AppenderTypeEnum - 要移除的`Appender`类型

删除所有类型为`type`的`Appender`，支持链式调用

## `removeNamedAppender(name): this` `deprecated`

- `name` string - 要移除的`Appender`名称

删除名称为`name`的`FileAppender`，支持链式调用

> [!WARNING]
> 此方法已被弃用，请改用Logger.removeAppenderByName替代

## `removeAppenderByName(name): this` `deprecated`

- `name` string - 要移除的`Appender`名称

删除名称为`name`的`FileAppender`，支持链式调用

## `debug(format, ...args)`

- `format` string - 输出格式
- `args` any - 输出变量

输出一条`Level`为`DEBUG`的日志

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

## `terminate()`

终止所有`Appender`，并结束该`Logger`的运行
