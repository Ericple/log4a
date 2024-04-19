import { AbstractAppender } from './AbstractAppender';
import { Level } from '../Level';
import { Marker } from '../MarkerManager';
import { TemporaryLoggerContext } from '../TemporaryLoggerContext';

export abstract class AbstractLogger {
  protected context: any;
  protected count: number = 0;
  protected appender: Array<AbstractAppender>;
  protected temporaryContext: TemporaryLoggerContext = new TemporaryLoggerContext;
  protected level: Level = Level.OFF;

  constructor(context: any) {
    this.context = context;
  }

  setLevel(level: Level): this {
    this.level = level;
    return this;
  }

  withMarker(marker: Marker): this {
    this.temporaryContext.setMarker(marker);
    return this;
  }

  addAppender<T extends AbstractAppender>(appender: T): this {
    this.appender.push(appender);
    return this;
  }

  debug(format: string, ...args: any[]) {
    this.print(console.debug, Level.DEBUG, format, args);
  }

  error(format: string, ...args: any[]) {
    this.print(console.error, Level.ERROR, format, args);
  }

  info(format: string, ...args: any[]) {
    this.print(console.info, Level.INFO, format, args);
  }

  fatal(format: string, ...args: any[]) {
    this.print(console.error, Level.FATAL, format, args);
  }

  trace(format: string, ...args: any[]) {
    this.print(console.warn, Level.TRACE, format, args);
  }

  private print(logger: Function, level: Level, format: string, args: any[]) {
    if (level.intLevel() >= this.level.intLevel()) {
      logger(this.makeMessage(level, format, args));
    }
    this.temporaryContext.clear();
  }

  protected makeMessage(level: Level, format: string, messages: Object[]): string {
    const msgArr = messages.map(v => {
      if (typeof v == 'object') {
        try {
          const parsed = JSON.stringify(v);
          return parsed;
        } catch {
          return v.constructor.name;
        }
      }
      return v;
    });
    for (let i = 0; i < messages.length; i++) {
      format = format.replace('{}', msgArr[i]);
    }
    this.count++;
    let result = '[' + level.name().padEnd(5, ' ') + ']\t' + this.time() + '\t' + this.getTag() + '\t' + format;
    if (this.temporaryContext.hasMarker()) {
      result += ' ' + this.temporaryContext.getMarker();
    }
    return result;
  }

  protected time() {
    const d = new Date();
    return `${d.getFullYear()}-${this.padNum(d.getMonth() + 1)}-${this.padNum(d.getDate())} ${this.padNum(d.getHours())}:${this.padNum(d.getMinutes())}:${this.padNum(d.getSeconds())}.${d.getMilliseconds()}`
  }

  protected padNum(num: number, len: number = 2) {
    return num.toString().padStart(len, '0');
  }

  private getTag() {
    if (!this.context || !this.context.constructor) {
      return `[Anonymous:${this.count}]`;
    }
    return `[${this.context.constructor.name}:${this.count}]`;
  }
}