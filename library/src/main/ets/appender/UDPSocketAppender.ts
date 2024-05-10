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
import { SocketAppenderOptions } from '../spi/AppenderOptions';
import { AppenderTypeEnum } from '../spi/AppenderTypeEnum';
import { Level } from '../Level';
import { Logger } from '../Logger';
import { LogManager } from '../LogManager';

export interface UDPSocketAppenderOptions extends SocketAppenderOptions {
  address: string;
  port: number;
}

export class UDPSocketAppender extends CSocketAppender {
  private _socket: socket.UDPSocket;
  private _config: UDPSocketAppenderOptions;
  private _messageQueue: string[] = [];
  logger: Logger = LogManager.getLogger(this);

  constructor(config: UDPSocketAppenderOptions) {
    super(config.name, config.level, AppenderTypeEnum.SOCKET);
    this._socket = socket.constructUDPSocketInstance();
    this._config = config;
    this._socket.bind({ address: '0.0.0.0' });
  }

  onLog(level: Level, message: string): this {
    if (this._terminated) return this;
    if (this._config.filter) {
      if (!this._config.filter(level, message)) return this;
    }
    this._socket.getState().then(state => {
      if (state.isBound) {
        this.send(message);
        this.handleMessageQueue();
      } else {
        this._messageQueue.push(message);
      }
    })
    return this;
  }

  private handleMessageQueue() {
    while (this._messageQueue.length > 0) {
      this.send(this._messageQueue.pop());
    }
  }

  private send(data: string | ArrayBuffer): void {
    this._socket.send({
      address: {
        address: this._config.address,
        port: this._config.port
      },
      data
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