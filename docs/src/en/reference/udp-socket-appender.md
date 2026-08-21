# UDPSocketAppender

> To provide the ability to connect to the server through the UDP protocol and push logs to the server in real time, the developer needs to apply for the `ohos.permission.INTERNET` permission

## `constructor(config)`

- `config` UDPSocketAppenderOptions
  - `name` string - Appender name
  - `level` Level - Appender log level
  - `address` string - Server address
  - `port` number - Server port number
  - `encryptor` ((level: Level, originalLog: string | ArrayBuffer) => string | ArrayBuffer)? - Encryption function
  - `filter` ((level: Level, content: string | ArrayBuffer) => boolean)? - Additional log filtering function

Create a new `UDPSocketAppender`

## `onLog(level, tag, time, count, message, tempContext)`

- `level` Level - Log level
- `tag` string - Log tag
- `time` number - Log timestamp
- `count` number - Log sequence number
- `message` string - Log content
- `tempContext` TemporaryLoggerContext - Log temporary context

This method is called when the bound host Logger logs

## `onTerminate()`

Terminates all logging activities for this Appender