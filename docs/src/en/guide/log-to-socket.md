# Output to server <Badge type="tip" text="1.3.1 +" />

log4a implements TCPSocketAppender, through which developers can establish a TCP connection with the server and transfer logs to the server in real time.

## TCPSocketAppender

Like FileAppender, the same TCPSocketAppender can be bound to multiple Logger instances, but creating multiple tcpSocketappenders can affect application performance. So Log4a recommends that developers create only one instance of TCPSocketAppender in their application and reuse it in multiple places.

## Usage

## Client

To use TCPSocketAppender on the client side, in addition to the default parameters of the append, you also need to provide the remote server address and port:

```ts
// ServerAppenderConstants.ets
import { TCPSocketAppender } from '@pie/log4a';

export const serverAppender = new TCPSocketAppender({
    address: '114.xxx.xxx.xxx',
    port: 1234,
    name: 'socket',
    level: Level.ALL
});
```

Introduce in the page where you need to bind `TCPSocketAppender` :

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

## Server

The server can be processed using any language that supports network programming, here using nodejs as an example:

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

## Server output schematic

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