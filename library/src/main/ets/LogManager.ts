import { AbstractLogger } from './abstract/AbstractLogger';
import { Logger } from './Logger';
import { WorkerManager } from './WorkerManager';
import fs from '@ohos.file.fs';

class Anonymous {
}

const anonymousContext = new Anonymous();

class LogManagerClass {
  private _loggerMap: Map<any, AbstractLogger> = new Map();
  private _logPath: string = '';

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

  setLogFilePath(path: string): void {
    if (!fs.accessSync(path)) {
      fs.mkdirSync(path);
    }
    this._logPath = path;
  }

  getLogFilePath(): string {
    return this._logPath;
  }
}

export const LogManager = new LogManagerClass();