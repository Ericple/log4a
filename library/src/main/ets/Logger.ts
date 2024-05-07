import { AbstractLogger } from './abstract/AbstractLogger';

export class Logger extends AbstractLogger {
  constructor(context: any) {
    super(context);
  }
}

Logger.prototype.valueOf = function() {
  return this
}