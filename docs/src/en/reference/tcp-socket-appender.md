# TCPSocketAppender

> To provide the ability to connect to the server through the TCP protocol and push logs to the server in real time, the developer needs to apply for the `ohos.permission.INTERNET` permission

## `constructor(config)`

- `config` TCPSocketAppenderOptions
- `address` string - Server address
- `port` number - Indicates the server port number
- `encoding` string?  - Coding mode

Create a new TCPSocketAppender

## `onLog(level, message)`

- `level` Level - Log level
- `message` string - Log content

This method is called when the bound host Logger logs

## `onTerminate()`

Terminates all logging activities for this Appender