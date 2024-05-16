# Appender

The function of the append is to print the log to a specified place. Log4a implements many kinds of appends, the most basic of which are

- `ConsoleAppender`
- `FileAppender`

## `ConsoleAppender`

Log4a automatically allocates a ConsoleAppender to the Logger when it is acquired. Therefore, you do not need to configure ConsoleAppender unless you do not want logs to be stored on the console appear

## Disable console output

To disable console output, do this:

```typescript
// Remove the ConsoleAppender attached to the logger
this.logger.removeTypedAppender(AppenderTypeEnum.CONSOLE);
```

## Enable console output again

If in some cases you remove ConsoleAppender but then need to print logs in the console, you can do this:

```typescript
// 向logger添加一个ConsoleAppender
this.logger.addConsoleAppender();
```

> [!WARNING]
> Each logger has at most one ConsoleAppender attached to it. If the logger has ConsoleAppender attached to it, calling addConsoleAppender overwrites the existing ConsoleAppender. (Before 1.4.3 Nothing happens when you call this method).

## `FileAppender`

The FileAppender module provides the ability to output logs to files. You need to manually bind it to the Logger. When creating a FileAppender, you can set the maximum number of log caches, the maximum log file usage, whether to use multiple threads, and the encryption function.

> [!TIP]
> For a file, a FileAppender is globally unique. Multiple loggers can be configured with the same FileAppender, which means that a FileAppender can be bound to multiple Logger instances. This is an internal implementation of log4a, and developers do not need to worry about this when they are actually developing.

Adding a FileAppender requires two mandatory parameters:

- File path
- FileAppender Name

> [!TIP]
> Name is used as an index to delete a FileAppender that is bound to the Logger
> 
> Since 1.3.1 version, can that the LogManager. SetLogFilePath to specify all of the log file storage paths, rather than in every when additional device to create a new file from the context for a file path. However, you must ensure that only the file name is provided when you create the append.

## Add a FileAppender

To add a FileAppender, do this:

```typescript:line-numbers
this.logger.addFileAppender(getContext(this).filesDir + '/fileName.log', 'mainLog');
```

This code adds a named FileAppender to logger named `mainLog`, specifying the file path to `fileName.log` in the application file sandbox path.

## Add a multi thread FileAppender <Badge type="tip" text="1.3.0-rc.1 +" />

To add a FileAppender with multithreading capabilities, you can do the following:

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
> In order to minimize the concurrency needs of the application itself, Log4a will only occupy one thread, no matter how many multithreaded FileAppenders the developer sets up.

## Configuration file cache <Badge type="tip" text="1.3.0-rc.1 +" />

To configure the maximum number and usage of log files, enter related parameters in options

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

- `maxFileSize` Specifies the maximum log file usage in KB. When the log file size exceeds the limit, a cache file is generated and a new log file is created to continue writing logs.
- `maxCacheCount` Specifies the maximum number of log file caches. If the number of log caches exceeds this value, the earliest generated log caches are deleted.

## Configuring log encryption

FileAppender allows developers to encrypt logs by passing in an encryption function that takes two parameters and returns the encrypted content:

- Log level
- Log content

Such a design allows developers to encrypt only some or a certain log level of logs, to achieve partial encryption or overall encryption, but also allows developers to write encryption algorithms more freely.

Configure encryption:

```typescript:line-numbers{10-15}
const encryptFunction = (origin: string | ArrayBuffer): string | ArrayBuffer => {
    // Take advantage of custom encryption algorithms for origin
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
            return log; // If encryption is not required, the original log must be returned
        }
    }
);
```