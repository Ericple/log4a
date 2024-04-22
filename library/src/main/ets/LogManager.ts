import { AbstractLogger } from './abstract/AbstractLogger';
import { Logger } from './Logger';

class Anonymous {
}

const anonymousContext = new Anonymous();

class LogManagerClass {
  private _loggerMap: Map<any, AbstractLogger> = new Map();

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
  }
}

export const LogManager = new LogManagerClass();