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
  private _loggerMap: WeakMap<Object, AbstractLogger> = new WeakMap();
  private _logPath: string = '';
  private consoleBundle = {
    log: console.log
  }

  /**
   * 获取CLass或Struct的Logger
   * @param context
   * @returns Logger
   * @since 1.0.0
   */
  getLogger<T extends Object>(context: T): Logger {
    let key = 'Anonymous';
    if (context && context.constructor) {
      key = context.constructor.name ?? 'Anonymous';
    }
    if (this._loggerMap.has(key)) {
      return this._loggerMap.get(key);
    }
    this._loggerMap.set(context, new Logger(context));
    return this._loggerMap.get(context);
  }

  /**
   * 获取匿名Logger
   * @returns Logger
   * @since 1.0.0
   */
  anonymous(): Logger {
    if (this._loggerMap.has(anonymousContext)) {
      return this._loggerMap.get(anonymousContext);
    }
    this._loggerMap.set(anonymousContext, new Logger(anonymousContext));
    return this._loggerMap.get(anonymousContext);
  }

  terminate() {
    WorkerManager.terminate();
  }

  private console(): Logger {
    if (this._loggerMap.has(consoleContext)) {
      return this._loggerMap.get(consoleContext);
    }
    this._loggerMap.set(consoleContext, new Logger(consoleContext));
    return this._loggerMap.get(consoleContext);
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