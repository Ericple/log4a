import { Logger } from './Logger';

class LogManagerClass {
  private _loggerMap: Map<any, Logger> = new Map();

  getLogger(context: any): Logger {
    if (this._loggerMap.has(context)) {
      return this._loggerMap.get(context);
    }
    this._loggerMap.set(context, new Logger(context));
    return this._loggerMap.get(context);
  }
}

export const LogManager = new LogManagerClass();