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
import { AbstractLogger } from './abstract/AbstractLogger';
import { Logger } from './Logger';
import { WorkerManager } from './WorkerManager';
import fs from '@ohos.file.fs';
import { Level } from './Level';

class Anonymous {
}

class Console {
}

const anonymousContext = new Anonymous();

const consoleContext = new Console()

class LogManagerClass {
  private _loggerMap: Map<string, AbstractLogger> = new Map();
  private _logPath: string = '';
  private consoleBundle = {
    log: console.log
  }

  /**
   * 获取Class或Struct的Logger
   * @param context
   * @returns Logger
   * @since 1.0.0
   */
  getLogger<T extends Object>(context: T | string): Logger {
    let key = 'Anonymous';
    if (typeof context == 'string') {
      key = context;
    } else {
      if (context && context.constructor) {
        key = context.constructor.name ?? 'Anonymous';
      }
    }
    if (this._loggerMap.has(key)) {
      return this._loggerMap.get(key);
    }
    this._loggerMap.set(key, new Logger(context));
    return this._loggerMap.get(key);
  }

  /**
   * 获取匿名Logger
   * @returns Logger
   * @since 1.0.0
   */
  anonymous(): Logger {
    if (this._loggerMap.has(anonymousContext.constructor.name)) {
      return this._loggerMap.get(anonymousContext.constructor.name);
    }
    this._loggerMap.set(anonymousContext.constructor.name, new Logger(anonymousContext));
    return this._loggerMap.get(anonymousContext.constructor.name);
  }

  terminate() {
    for (let l of this._loggerMap.values()) {
      l.terminate();
    }
    WorkerManager.terminate();
  }

  private console(): Logger {
    if (this._loggerMap.has(consoleContext.constructor.name)) {
      return this._loggerMap.get(consoleContext.constructor.name);
    }
    this._loggerMap.set(consoleContext.constructor.name, new Logger(consoleContext));
    return this._loggerMap.get(consoleContext.constructor.name);
  }

  /**
   * 设置日志存储根目录
   * @param path 沙箱路径
   * @since 1.3.1
   */
  setLogFilePath(path: string): void {
    if (!fs.accessSync(path)) {
      fs.mkdirSync(path);
    }
    this._logPath = path;
  }

  /**
   * 获取日志存储根目录
   * @returns 根目录
   * @since 1.3.1
   */
  getLogFilePath(): string {
    return this._logPath;
  }

  /**
   * 拦截所有console.log日志
   * @since 1.3.1
   */
  interceptConsole(): void {
    Object.defineProperty(console, 'log', {
      value: (...args: any[]) => {
        let format = '';
        for (let i = 0; i < args.length; i++) {
          format += '{} ';
        }
        this.consoleBundle.log(this.console().makeMessage(Level.INFO, format, args))
      }
    });
  }
}

export const LogManager = new LogManagerClass();