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
import { AbstractAppender } from './abstract/AbstractAppender';
import ArrayList from '@ohos.util.ArrayList';

class Anonymous {
}

class Console {
}

const anonymousContext = new Anonymous();

const consoleContext = new Console()

class LogManagerClass {
  private _loggerMap: Map<string, AbstractLogger> = new Map();
  private _logPath: string = '';
  private _console_intercept: boolean = false;
  private consoleBundle = {
    log: console.log,
    warn: console.warn,
    info: console.info,
    trace: console.trace,
    error: console.error,
    debug: console.debug
  }

  /**
   * 获取Class或Struct的Logger
   * @param context 类或类名
   * @returns Logger
   * @since 1.0.0
   */
  getLogger<T extends Object>(context: T | string): Logger {
    let key = 'Anonymous';
    if (typeof context == 'string') {
      key = context;
    } else if (context && context.constructor) {
        key = context.constructor.name;
    }
    if (this._loggerMap.has(key)) {
      return this._loggerMap.get(key);
    }
    const l = new Logger(context);
    if (this.preBindAppenderArray.length > 0) {
      for (let appender of this.preBindAppenderArray) {
        l.bindAppender(appender);
      }
    }
    this._loggerMap.set(key, l);
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
    const l = this._preBind(new Logger(anonymousContext));
    this._loggerMap.set(anonymousContext.constructor.name, l);
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
    const l = this._preBind(new Logger(consoleContext));
    this._loggerMap.set(consoleContext.constructor.name, l);
    return this._loggerMap.get(consoleContext.constructor.name);
  }

  private _preBind(logger:Logger):Logger {
    if (this.preBindAppenderArray.length > 0) {
      for (let appender of this.preBindAppenderArray) {
        logger.bindAppender(appender);
      }
    }
    return logger;
  }

  /**
   * 设置日志存储根目录
   * @param path 沙箱路径
   * @since 1.3.1
   */
  /**
   * 设置日志存储根目录
   * @param path 沙箱路径
   * @description 自1.5.6起支持建立多级目录
   * @since 1.5.6
   */
  setLogFilePath(path: string): void {
    const path2Mk: string[] = [];
    let tmpPath = path.split('/');
    do {
      const p = tmpPath.join('/')
      if (fs.accessSync(p)) {
        break;
      }
      path2Mk.unshift(p);
      tmpPath.pop();
    } while (tmpPath.length > 1);
    while (path2Mk.length > 0) {
      const p2m = path2Mk.shift();
      if (!p2m) {
        break;
      }
      fs.mkdirSync(p2m);
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
    if (this._console_intercept) {
      return;
    }
    this._console_intercept = true;
    let types = ['log', 'error', 'debug', 'warn', 'trace', 'info'];
    types.forEach(type => {
      this.consoleBundle[type] = console[type];
      console[type] = (...args: any[]) => {
        let format = '';
        for (let i = 0; i < args.length; i++) {
          format += '{} ';
        }
        let Console = this.console();
        if (type == 'log') {
          type = 'info';
        }
        if (type == 'warn') {
          type = 'trace';
        }
        Console[type](format, ...args)
      }
    });
  }

  getOriginalConsole() {
    return this.consoleBundle;
  }

  /**
   * 同时向已经定义的所有Logger绑定某个追加器
   * @param appender 要绑定的追加器
   * @returns LogManager
   * @since 1.5.4
   */
  bindAppenderGlobally<T extends AbstractAppender>(appender: T): LogManagerClass {
    this._loggerMap.forEach(logger => {
      logger.bindAppender(appender);
    });
    return this;
  }

  /**
   * 向Logger池注册一个Logger，返回LogManager，可链式调用，用于初始化
   * @param context
   * @returns
   */
  registerLogger<T extends Object>(context: T | string): LogManagerClass {
    this.getLogger(context);
    return this;
  }

  /**
   * 向Logger池注册多个Logger，返回LogManager，可链式调用，用于初始化
   * @param contexts
   * @returns
   */
  registerLoggers<T extends Object>(...contexts: (T | string)[]): LogManagerClass {
    contexts.forEach(context => this.getLogger(context));
    return this;
  }

  private preBindAppenderArray: ArrayList<AbstractAppender> = new ArrayList();

  /**
   * 注册一个预绑定追加器，会在新建Logger时自动绑定
   * @param appender
   * @returns
   */
  preBindAppender<T extends AbstractAppender>(appender: T): LogManagerClass {
    this.preBindAppenderArray.add(appender);
    return this;
  }

  /**
   * 移除一个预绑定追加器，会在新建Logger时自动绑定
   * @param appender
   * @returns
   */
  removePreBindAppender<T extends AbstractAppender>(appender: T): LogManagerClass {
    this.preBindAppenderArray.remove(appender);
    return this;
  }
}

export const LogManager = new LogManagerClass();