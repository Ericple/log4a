# LogManager

> [!INFO]
> Manage the Global Logger

## Method

`LogManager` has the following methods

## `getLogger(context)`

- `context` Object | string - If called in a struct or class, pass `this`; otherwise pass the class name

Obtain the corresponding Logger according to the context. From version 1.3.4, `context` can be a `string` class name.

## `anonymous()`

Get anonymous Logger

## `terminate(type?)`

- `type` number? - Appender type to terminate. Multiple types can be joined with `|`; if omitted, all appenders are terminated.

Reclaim all loggers. When this method is called, Log4a clears all appenders, or if the Appender is multithreaded, the thread is terminated. The developer should call this method when the application exits.

## `setLogFilePath(path: string): void` <Badge type="tip" text="1.3.1 +" />

- `path` string - Sandbox path to store logs

Set the root directory for log storage (multi-level directories are supported since 1.5.6). If you want to use a concise path when creating a FileAppender, call this method in advance.

## `getLogFilePath(): string` <Badge type="tip" text="1.3.1 +" />

Get the log storage root directory

## `interceptConsole(): void` <Badge type="tip" text="1.3.1 +" />

Intercept console logs

## `getOriginalConsole()`

After interception is enabled, you can get the original console object through this method

## `bindAppenderGlobally<T extends AbstractAppender>(appender: T): LogManagerClass` <Badge type="tip" text="1.5.4 +" />

- `appender` - Appender to bind

Bind an appender to all registered Loggers

## `registerLogger<T extends Object>(context: T | string): LogManagerClass` <Badge type="tip" text="1.5.4 +" />

- `context` Object | string - If called in a struct or class, pass `this`; otherwise pass the class name

## `registerLoggers<T extends Object>(...contexts: (T | string)[]): LogManagerClass` <Badge type="tip" text="1.5.4 +" />

- `contexts` (Object | string)[] - If called in a struct or class, pass `this`; otherwise pass the class name

## `preBindAppender<T extends AbstractAppender>(appender: T): LogManagerClass` <Badge type="tip" text="1.5.6 +" />

- `appender` T extends AbstractAppender - Appender to pre-bind

Register a pre-bound appender. Newly created Loggers will automatically bind this appender. Supports chain calls.

## `removePreBindAppender<T extends AbstractAppender>(appender: T): LogManagerClass` <Badge type="tip" text="1.5.6 +" />

- `appender` T extends AbstractAppender - Pre-bound appender to remove

Remove a pre-bound appender. Supports chain calls.
