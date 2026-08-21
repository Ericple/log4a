# AbstractLogger

The abstract base class of `Logger`. All `Logger` methods are defined in `AbstractLogger`. Developers normally use `Logger` directly and do not instantiate `AbstractLogger`.

## `constructor(context, addConsole?)`

- `context` any - A class instance or class name
- `addConsole` boolean? - Whether to bind a default `ConsoleAppender`, default `true`

`AbstractLogger` is an abstract base class. Developers normally obtain instances through `LogManager.getLogger` and do not need to construct it directly.

See [Logger](./logger) for the method list.
