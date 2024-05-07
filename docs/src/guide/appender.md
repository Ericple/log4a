# 追加器

追加器的作用是将日志打印至指定的某处，Log4a实现了两种追加器，分别为

- `ConsoleAppender`
- `FileAppender`

## `ConsoleAppender`

将日志输出到命令行就是通过ConsoleAppender实现的，获取Logger时，Log4a会自动分配一个ConsoleAppender至Logger,因此，正常情况下，你无需配置ConsoleAppender，除非你不希望日志在控制台上出现。

## 禁用控制台输出

要禁用控制台输出，请这么做：

```typescript
// 移除logger绑定的ConsoleAppender
this.logger.removeTypedAppender(AppenderTypeEnum.CONSOLE);
```

## 再次启用控制台输出

如果在某些情况下，你移除了ConsoleAppender，但后续又需要在控制台中打印日志，可以这么做：

```typescript
// 向logger添加一个ConsoleAppender
this.logger.addConsoleAppender();
```

> [!WARNING]
> 每个logger至多绑定一个ConsoleAppender，如果logger已绑定ConsoleAppender，则调用addConsoleAppender不会发生任何事。

## `FileAppender`

FileAppender提供输出日志到文件的能力，需要开发者手动绑定至Logger。创建FileAppender时开发者可以设置日志缓存最大数量、日志文件占用上限、是否使用多线程、加密函数。

> [!TIP]
> 对于同一个文件，FileAppender在全局下是唯一的，多个Logger可以配置相同的FileAppender，这意味着一个FileAppender可以被绑定至多个Logger实例。这是log4a内部的实现，实际开发时，开发者无需操心这一点。

添加一个FileAppender需要提供两个必选参数：

- 文件路径
- FileAppender名称

> [!TIP]
> 名称用于作为索引来删除某已绑定到Logger的FileAppender
> 
> 从1.3.1版本开始，可以通过LogManager.setLogFilePath来指定所有日志文件的存储路径，而不是在每新建一个文件追加器时都从上下文中获取一次文件路径。但必须确保新建追加器时只提供文件名。

## 添加一个FileAppender

要添加一个FileAppender，可以这么做：

```typescript:line-numbers
this.logger.addFileAppender(getContext(this).filesDir + '/fileName.log', 'mainLog');
```

这段代码向logger添加了一个具名FileAppender，名称为`mainLog`，指定了文件路径为应用文件沙箱路径下的`fileName.log`。

## 添加一个多线程FileAppender <Badge type="tip" text="1.3.0-rc.1 +" />

要添加具有多线程能力的FileAppender，可以通过以下方式:

```typescript:line-numbers{6}
this.logger.addFileAppender(
    getContext(this).filesDir + '/fileName.log', 
    'mainLog', 
    Level.ALL, 
    {
        useWorker: true
    }
);
```

> [!TIP]
> 为了尽可能不影响应用本身的并发需要，不论开发者设置多少个多线程FileAppender，Log4a都将只占用一个线程。

## 配置文件缓存 <Badge type="tip" text="1.3.0-rc.1 +" />

如果需要配置日志文件最大缓存个数及最大占用，需要在options中传入相关参数

```typescript:line-numbers{6,7}
this.logger.addFileAppender(
    getContext(this).filesDir + '/fileName.log', 
    'mainLog', 
    Level.ALL, 
    {
        maxFileSize: 10,
        maxCacheCount: 10
    }
);
```

- `maxFileSize` 指定了最大日志文件占用，单位为KB。当日志文件大小超过限制时，将会生成一个缓存文件，并新建一个日志文件以继续写入日志。
- `maxCacheCount` 指定了最大日志文件缓存数量，如果日志缓存数量超过该值，则会删除最早生成的日志缓存。

## 配置日志加密

FileAppender允许开发者传入一个加密函数来进行日志加密，该函数接受两个参数，且需要返回加密后的内容：

- 日志等级
- 日志内容

这样的设计允许开发者只对某些或某个日志等级的日志进行加密，实现局部加密或整体加密，也使得开发者可以更加自由地编写加密算法。

配置加密：

```typescript:line-numbers{10-15}
const encryptFunction = (origin: string | ArrayBuffer): string | ArrayBuffer => {
    // 对origin利用自定义的加密算法
    return origin;
}
this.logger.addFileAppender(
    getContext(this).filesDir + '/fileName.log', 
    'mainLog', 
    Level.ALL, 
    {
        encryptor: (level: Level, log: string | ArrayBuffer) => {
            if(level.name() == 'privateLevel') {
                return encryptFunction(log);
            }
            return log; // 如果不需要加密，必须返回原始log
        }
    }
);
```