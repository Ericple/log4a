# 参数优先级

## `FileAppender`中options的优先级

## 为什么会有优先级

当开发者添加`FileAppender`时，可能出现多个`FileAppender`绑定到一个`Logger`的情况，此时如果每个`FileAppender`被添加时都需要传入`options`参数，会使代码变得复杂难读，因此，当多个`FileAppender`指向同一文件时开发者可以只设置其中一个`FileAppender`的`options`，而不是每次绑定`FileAppender`时都传入`options`。

## 总结

如果多个`FileAppender`指向同一个日志文件，则只需要设置其中一个的`options`参数

```typescript
class Example1 {
    private logger_a: Logger = LogManager.getLogger(this).addFileAppender('/path/to_file.log', 'main',Level.INFO, {
        useWorker: true
    });
}
class Example2 {
    // 此处不需要传入options，配置将与Example1中的logger_a相同
    private logger_b: Logger = LogManager.getLogger(this).addFileAppender('/path/to_file.log', 'main',Level.INFO);
}
```

## 日志等级的优先级

如果您已经阅读完[快速开始](/guide/getting-started)，您应该注意到了我们可以在`Logger`和Appender中都设置一个日志输出等级，因此我们需要对此进行特别讲解。

## 为什么会有优先级

Log4a的日志消息会在`Logger`中进行构建，在构建日志消息之前，会由`Logger`对日志等级进行过滤，当日志等级高于`Logger`中被设置的等级时，该条日志消息将被忽略，进一步导致Logger绑定的`FileAppender`和`ConsoleAppender`均无法接受到这条日志。

相反地，如果日志等级低于`Logger`日志等级，则这条日志消息会进一步交给`FileAppender`和`ConsoleAppender`进行过滤。

## 总结

日志消息首先被`Logger`过滤后才会交给`Appender`进行过滤，因此`Logger`的日志等级要优先于`Appender`