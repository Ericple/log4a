# 输出到服务器 <Badge type="tip" text="1.3.1 +" />

log4a实现了`TCPSocketAppender`，开发者可以通过此追加器，与服务器建立TCP连接，并将日志实时传输到服务端。

## TCPSocketAppender

与`FileAppender`相同，同一个`TCPSocketAppender`也可以被绑定到多个不同的`Logger`实例，
但是如果创建多个`TCPSocketAppender`,可能对应用性能造成影响，
所以`Log4a`建议开发者在应用程序中对同一个地址只创建一个`TCPSocketAppender`实例并在多处复用。

## 用法

## 客户端

在客户端使用`TCPSocketAppender`，除追加器默认参数外，还需要提供远端服务器地址及端口：

```ts
// ServerAppenderConstants.ets
import { TCPSocketAppender } from '@pie/log4a';

export const serverAppender = new TCPSocketAppender({
    address: '114.xxx.xxx.xxx', //换成你的服务器ip
    port: 1234, //换成你的服务器对应端口
    name: 'socket',
    level: Level.ALL
});
```

在需要绑定`TCPSocketAppender`的页面引入：

```ts
import { LogManager } from '@pie/log4a';
import { serverAppender } from './ServerAppenderConstants.ets';

@Entry
@Component
struct Index {
    logger: Logger = LogManager.getLogger(this).addAppender(serverAppender);
    build() {
        // ...Your code
    }
}
```

## 服务端

服务端可以使用任何支持网络编程的语言进行处理，这里以nodejs为例：

```js
const net = require('net');
var server = net.createServer();
server.on('connection', (socket) => {
    socket.on('data', (data) => {
        console.log(data.toString());
    })
});
server.listen(1234, '0.0.0.0', () => {
    console.log('server running on 0.0.0.0:1234');
});
```

## 服务端输出示意

```
server running on 0.0.0.0:4721
[INFO ]	2024-05-07 19:52:04.298	[Index:1]	Hello world!
[DEBUG]	2024-05-07 19:52:08.218	[Index:2]	log into file and console, 
{
  "_name": "ALL",
  "_intLevel": 1.7976931348623157e+308,
  "_standardLevel": {
    "_intLevel": 1.7976931348623157e+308
  }
}
```