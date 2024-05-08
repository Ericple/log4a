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
  private _loggerMap: Map<any, AbstractLogger> = new Map();
  private _logPath: string = '';
  private consoleBundle = {
    log: console.log
  }

  getLogger(context: any): Logger {
    if (this._loggerMap.has(context)) {
      return this._loggerMap.get(context);
    }
    this._loggerMap.set(context, new Logger(context));
    return this._loggerMap.get(context);
  }

  anonymous(): Logger {
    if (this._loggerMap.has(anonymousContext)) {
      return this._loggerMap.get(anonymousContext);
    }
    this._loggerMap.set(anonymousContext, new Logger(anonymousContext));
    return this._loggerMap.get(anonymousContext);
  }

  terminate() {
    for (let logger of this._loggerMap.values()) {
      logger.terminate();
    }
    WorkerManager.terminate();
  }

  private console(): Logger {
    if (this._loggerMap.has(consoleContext)) {
      return this._loggerMap.get(consoleContext);
    }
    this._loggerMap.set(consoleContext, new Logger(consoleContext));
    return this._loggerMap.get(consoleContext);
  }

  setLogFilePath(path: string): void {
    if (!fs.accessSync(path)) {
      fs.mkdirSync(path);
    }
    this._logPath = path;
  }

  getLogFilePath(): string {
    return this._logPath;
  }

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