# AbstractLogger

`Logger` 的抽象基类，所有 `Logger` 的方法均定义在 `AbstractLogger` 中。开发者通常直接使用 `Logger`，无需直接实例化 `AbstractLogger`。

## `constructor(context, addConsole?)`

- `context` any - 类实例或类名
- `addConsole` boolean? - 是否自动绑定默认`ConsoleAppender`，默认为`true`

`AbstractLogger` 是抽象基类，开发者通常通过 `LogManager.getLogger` 获取实例，无需直接构造。

具体方法请参阅 [Logger](./logger)。
