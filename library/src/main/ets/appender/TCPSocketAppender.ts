/*
 * Copyright 2024 Tingjin Guo
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { CSocketAppender } from '../abstract/CSocketAppender';
import { socket } from '@kit.NetworkKit';
import { AppenderTypeEnum } from '../spi/AppenderTypeEnum';
import { Level } from '../Level';
import { SocketAppenderOptions } from '../spi/AppenderOptions';
import { Logger } from '../Logger';
import { LogManager } from '../LogManager';
import { TemporaryLoggerContext } from '../TemporaryLoggerContext';

export interface TCPSocketAppenderOptions extends SocketAppenderOptions {
  address: string;
  port: number;
  encoding?: 'utf-8' | 'utf-16' | 'utf-16be' | 'utf-16le' | 'us-aecii' | 'iso-8859-1';
}

export class TCPSocketAppender extends CSocketAppender {
  private _socket: socket.TCPSocket;
  private _config: TCPSocketAppenderOptions;
  private _messageQueue: string[] = [];
  logger: Logger = LogManager.getLogger(this);

  constructor(config: TCPSocketAppenderOptions) {
    super(config.name, config.level, AppenderTypeEnum.SOCKET);
    this._socket = socket.constructTCPSocketInstance();
    this._config = config;
    this._socket.bind({ address: '0.0.0.0' })
      .then(() => {
        this._socket.connect({
          address: {
            address: this._config.address,
            port: this._config.port
          },
          timeout: 5000
        }).then(() => {
          this.logger.info('TCPSocketAppender connected.');
          this.handleMessageQueue();
        }).catch((err) => {
          this.logger.error('error connecting to remote address: {}', err);
        });
      }).catch((err) => {
      this.logger.error('error binding socket: {}', err);
    })
  }

  private handleMessageQueue() {
    while (this._messageQueue.length > 0) {
      this.send(this._messageQueue.pop());
    }
  }

  onLog(level: Level, tag: string, time: number, count: number, message: string, tempContext:TemporaryLoggerContext): this {
    if (this._terminated) return this;
    if (this._config.filter) {
      if (!this._config.filter(level, message)) return this;
    }
    message = this.makeMessage(level, tag, time, count, message, tempContext);
    this._socket.getState().then(state => {
      if (state.isConnected) {
        this.send(message);
        this.handleMessageQueue();
      } else {
        this._messageQueue.push(message);
      }
    })
    return this;
  }

  private send(data: string | ArrayBuffer): void {
    this._socket.send({
      data,
      encoding: this._config.encoding
    }).then(() => {
      this.logger.info('Message sent to server.')
    }).catch((err) => {
      this.logger.trace('Failed to send message to server via tcp: {}', err);
    });
  }

  onTerminate(): void {
    this._socket.close();
    this._terminated = true;
  }
}