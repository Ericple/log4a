# UDPSocketAppender

> To provide the ability to connect to the server through the UDP protocol and push logs to the server in real time, the developer needs to apply for the `ohos.permisse.internet` permission

## `constructor(config)`

- `config` UDPSocketAppenderOptions
- `address` string - Server address
- `port` number - Indicates the server port number

Create a new `UDPSocketAppender`

## `onLog(level, message)`

- `level` Level - Log level
- `message` string - Log content

This method is called when the bound host Logger logs

## `onTerminate()`

Terminates all logging activities for this Appender