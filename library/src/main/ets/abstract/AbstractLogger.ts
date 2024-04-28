import { AbstractAppender } from './AbstractAppender';
import { Level } from '../Level';
import { Marker } from '../MarkerManager';
import { TemporaryLoggerContext } from '../TemporaryLoggerContext';
import { AppenderTypeEnum } from '../spi/AppenderTypeEnum';
import { ConsoleAppender } from '../appender/ConsoleAppender';
import { FileAppender, FileAppenderOptions } from '../appender/FileAppender';

export abstract class AbstractLogger {
  protected context: any;
  protected count: number = 0;
  protected appenderArray: Array<AbstractAppender> = [];
  protected temporaryContext: TemporaryLoggerContext = new TemporaryLoggerContext;
  protected level: Level = Level.ALL;
  protected history: string = '';

  constructor(context: any) {
    this.context = context;
    this.addAppender(new ConsoleAppender());
  }

  getHistoryOfAppender(predicates: string): string;

  getHistoryOfAppender(predicates: AppenderTypeEnum): string;

  getHistoryOfAppender(predicates: string | AppenderTypeEnum): string;

  getHistoryOfAppender(predicates: string | AppenderTypeEnum): string {
    const appender = this.appenderArray.find(appender => {
      if (typeof predicates === 'string') {
        return appender.getName() == predicates;
      } else {
        return appender.getType() == predicates;
      }
    });
    if (appender) return appender.getCurrentHistory();
    return '';
  }

  /**
   * 获取具名FileAppender的历史日志
   * @param predicates FileAppender名称
   * @returns this
   */
  getAllHistoryOfAppender(predicates: string): string {
    let appender = this.appenderArray.find(
      appender => (appender.getName() == predicates && appender.getType() == AppenderTypeEnum.FILE)
    );
    if (appender) {
      return (appender as FileAppender).getAllHistory();
    }
    return '';
  }

  setLevel(level: Level): this {
    this.level = level;
    return this;
  }

  withMarker(marker: Marker): this {
    this.temporaryContext.setMarker(marker);
    return this;
  }

  private addAppender<T extends AbstractAppender>(appender: T): this {
    if (this.appenderArray.some(v => v === appender)) {
      return this;
    }
    if (this.appenderArray.some(v => v.getType() === AppenderTypeEnum.CONSOLE) && appender.getType() == AppenderTypeEnum.CONSOLE) {
      return this;
    }
    appender.setId(this.appenderArray.length);
    this.appenderArray.push(appender);
    return this;
  }

  /**
   * 向Logger添加一个新的FileAppender
   * @param path 输出文件路径
   * @param name Appender名称，可以用于获取Appender信息
   * @param level 输出的最低日志等级
   * @returns this
   */
  addFileAppender(path: string, name: string = '', level: Level = Level.ALL, options?: FileAppenderOptions): this {
    return this.addAppender(new FileAppender(path, name, level, options));
  }

  /**
   * 向Logger添加一个新的ConsoleAppender
   * @param level 输出的最低日志等级
   * @returns this
   */
  addConsoleAppender(level: Level = Level.ALL): this {
    return this.addAppender(new ConsoleAppender(level));
  }

  /**
   * 删除所有Appender
   * @returns this
   */
  clearAppender(): this {
    this.appenderArray.forEach(appender => {
      appender.terminate();
    });
    this.appenderArray = [];
    return this;
  }

  /**
   * 删除所有对应类型的appender
   * @param appenderType appender类型
   * @returns
   */
  removeTypedAppender(appenderType: AppenderTypeEnum): this {
    this.appenderArray = this.appenderArray.filter(appender => appender.getType() !== appenderType);
    return this;
  }

  /**
   * 删除所有具名appender
   * @param name appender名称
   * @returns
   */
  removeNamedAppender(name: string): this {
    this.appenderArray = this.appenderArray.filter(appender => appender.getName() !== name);
    return this;
  }

  debug(format: string, ...args: any[]) {
    this.print(Level.DEBUG, format, args);
  }

  error(format: string, ...args: any[]) {
    this.print(Level.ERROR, format, args);
  }

  info(format: string, ...args: any[]) {
    this.print(Level.INFO, format, args);
  }

  fatal(format: string, ...args: any[]) {
    this.print(Level.FATAL, format, args);
  }

  trace(format: string, ...args: any[]) {
    this.print(Level.TRACE, format, args);
  }

  private print(level: Level, format: string, args: any[]) {
    if (level.intLevel() <= this.level.intLevel()) {
      const message = this.makeMessage(level, format, args);
      this.appenderArray.forEach(appender => {
        appender.log(level, message);
      });
    }
    this.temporaryContext.clear();
  }

  protected makeMessage(level: Level, format: string, messages: Object[]): string {
    const msgArr = messages.map(v => {
      if (typeof v == 'object') {
        try {
          const parsed = '\n' + JSON.stringify(v, null, 2).replace(/\n/g, "\n") + '\n';
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
    if (level.intLevel() <= Level.ERROR.intLevel()) {
      let rawStack = new Error().stack ?? '';
      rawStack = rawStack.split('\n').slice(3).join('\n');
      return result + '\n' + rawStack;
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

  terminate() {
    this.appenderArray.forEach(appender => {
      appender.terminate();
    });
  }
}