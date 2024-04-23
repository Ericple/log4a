import { AbstractAppender } from '../abstract/AbstractAppender';
import { Level } from '../Level';
import { AppenderTypeEnum } from '../spi/AppenderTypeEnum';

export class ConsoleAppender extends AbstractAppender {
  log(lvl: Level, message: string): this {
    if (lvl.intLevel() > this.level.intLevel()) return this;
    this.getLogFunction(lvl)(message);
    return this;
  }

  constructor(level: Level = Level.ALL) {
    super('', level, AppenderTypeEnum.CONSOLE);
  }

  private getLogFunction(lvl: Level): Function {
    if (lvl == Level.FATAL || lvl == Level.ERROR) {
      return console.error;
    } else if (lvl == Level.TRACE) {
      return console.warn;
    } else if (lvl == Level.DEBUG) {
      return console.debug;
    }
    return console.info;
  }
}