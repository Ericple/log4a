# Pre-bind Appender <Badge type="tip" text="1.5.6 +" />

Since Log4a is a multi-Logger design, in previous versions, if multiple different Loggers needed to bind the same set of appenders, you had to bind them separately for each Logger. After version `1.5.6`, you only need to add pre-bound appenders to `LogManager`.

The following pseudocode shows how to use this feature:

```ts:line-numbers
const exampleAppender = ...

LogManager.preBindAppender(exampleAppender)
```

Note that this code should be called in the `onCreate` lifecycle of `EntryAbility`.
