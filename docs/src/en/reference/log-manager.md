# LogManager

> [!INFO]
> Manage the Global Logger

## Method

`LogManager` has the following methods

## `getLogger(context)`

- `context` Object must be passed in `this`

Obtain the corresponding Logger according to the context, and pass this as the parameter

## `anonymous()`

Get anonymous Logger

## `terminate()`

Reclaim all loggers. When this method is called, Log4a clears all appenders, or if the Appender is multithreaded, the thread is terminated. The developer should call this method when the application exits.