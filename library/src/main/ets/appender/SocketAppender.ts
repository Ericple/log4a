import { AbstractAppender } from '../abstract/AbstractAppender';
import { socket } from '@kit.NetworkKit';
import { Level } from '../Level';
import { AppenderTypeEnum } from '../spi/AppenderTypeEnum';

interface SocketAppenderOptions {
  encryptor?: (level: Level, originalLog: string | ArrayBuffer) => string | ArrayBuffer;
  filter?: (level: Level, content: string | ArrayBuffer) => boolean;
  name: string;
  level: Level;
  localAddress: socket.NetAddress;
}

interface TCPSocketAppenderOptions extends SocketAppenderOptions {
  onConnect?: (timestamp: number) => void;
  type: 'tcp';
  onMessage?: (msg: socket.SocketMessageInfo) => void;
  timeout?: number;
  connectOptions: socket.TCPConnectOptions;
  onClose?: (timestamp: number) => void;
  encoding?: 'utf-8' | 'utf-16' | 'utf-16be' | 'utf-16le' | 'us-aecii' | 'iso-8859-1';
}

interface UDPSocketAppenderOptions extends SocketAppenderOptions {
  type: 'udp';
  remoteAddress: socket.NetAddress;
}

interface TLSSocketAppenderOptions extends SocketAppenderOptions {
  type: 'tls';
  secureOptions: socket.TLSSecureOptions;
  connectOptions: socket.TLSConnectOptions;
  onMessage?: (msg: socket.SocketMessageInfo) => void;
  onConnect?: (timestamp: number) => void;
  onClose?: (timestamp: number) => void;
}

export class SocketAppender extends AbstractAppender {
  private udpSocket: socket.UDPSocket;
  private tcpSocket: socket.TCPSocket;
  private tlsSocket: socket.TLSSocket;
  private options: TCPSocketAppenderOptions | UDPSocketAppenderOptions | TLSSocketAppenderOptions;

  private getAvailableSocket() {
    if (this.options.type == 'udp') return this.udpSocket;
    if (this.options.type == 'tcp') return this.tcpSocket;
    if (this.options.type == 'tls') return this.tlsSocket;
  }

  constructor(options: TCPSocketAppenderOptions | UDPSocketAppenderOptions | TLSSocketAppenderOptions) {
    super(options.name, options.level, AppenderTypeEnum.SOCKET);
    this.options = options;
    if (this.options.type == 'udp') {
      this.udpSocket = socket.constructUDPSocketInstance();
      this.udpSocket.bind(this.options.localAddress);
    } else if (this.options.type == 'tcp') {
      this.tcpSocket = socket.constructTCPSocketInstance();
      this.tcpSocket.bind(this.options.localAddress).then(() => {
        let o = options as TCPSocketAppenderOptions;
        this.tcpSocket.on('connect', () => {
          if (o.onConnect) o.onConnect(Date.now());
        });
        this.tcpSocket.on('message', (data) => {
          if (o.onMessage) o.onMessage(data);
        });
        this.tcpSocket.on('close', () => {
          if (o.onClose) o.onClose(Date.now());
        });
        this.tcpSocket.connect(o.connectOptions);
      })
    } else if (this.options.type == 'tls') {
      let o = options as TLSSocketAppenderOptions;
      this.tlsSocket = socket.constructTLSSocketInstance();
      this.tlsSocket.on('connect', () => {
        if (o.onConnect) o.onConnect(Date.now());
      });
      this.tlsSocket.on('message', (data) => {
        if (o.onMessage) o.onMessage(data);
      });
      this.tcpSocket.on('close', () => {
        if (o.onClose) o.onClose(Date.now());
      });
      this.tlsSocket.bind(o.localAddress).then(() => {
        this.tlsSocket.connect(o.connectOptions);
      })
    }
  }

  onTerminate(): void {
    this.getAvailableSocket()?.close();
  }

  onLog(_: Level, __: string): this {
    if (this.udpSocket) {
      this.udpSocket.send({
        data: __,
        address: (this.options as UDPSocketAppenderOptions).remoteAddress
      });
    }
    if (this.tcpSocket) {
      this.tcpSocket.send({
        data: __,
        encoding: (this.options as TCPSocketAppenderOptions).encoding
      })
    }
    if (this.tcpSocket)
      return this;
  }
}