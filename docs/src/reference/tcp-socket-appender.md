# TCPSocketAppender

> 提供通过TCP协议连接服务器并将日志实时推送到服务端的能力，需要开发者自行申请`ohos.permission.INTERNET`权限

## `constructor(config)`

- `config` TCPSocketAppenderOptions
    - `address` string - 服务器地址
    - `port` number - 服务器端口号
    - `encoding` string? - 编码方式

新建一个`TCPSocketAppender`