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
import { AbstractAppender } from './AbstractAppender';
import { Level } from '../Level';
import { Marker } from '../MarkerManager';
import { TemporaryLoggerContext } from '../TemporaryLoggerContext';
import { AppenderTypeEnum } from '../spi/AppenderTypeEnum';
import { ConsoleAppender } from '../appender/ConsoleAppender';
import { FileAppender, FileAppenderOptions } from '../appender/FileAppender';
import { FileAppenderManager } from '../FileAppenderManager';

export abstract class AbstractLogger {
  protected context: any;
  protected count: number = 0;
  protected appenderArray: Array<AbstractAppender> = [];
  protected temporaryContext: TemporaryLoggerContext = new TemporaryLoggerContext;
  protected level: Level = Level.ALL;
  protected history: string = '';
  protected logListeners: ((level: Level, content: string) => void)[] = [];

  constructor(context: any) {
    this.context = context;
    this.addAppender(new ConsoleAppender());
  }

  registerLogListener(listener: (level: Level, content: string) => void): this {
    if (this.logListeners.indexOf(listener) < 0) {
      this.logListeners.push(listener);
    }
    return this;
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

  addAppender<T extends AbstractAppender>(appender: T): this {
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
    return this.addAppender(FileAppenderManager.getFileAppender(path, name, level, options));
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
      appender.onTerminate();
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
    setTimeout(() => {
      if (level.intLevel() <= this.level.intLevel()) {
        const message = this.makeMessage(level, format, args);
        this.appenderArray.forEach(appender => {
          appender.onLog(level, message);
        });
        this.logListeners.forEach(listener => {
          listener(level, message);
        });
      }
      this.temporaryContext.clear();
    });
  }

  makeMessage(level: Level, format: string, messages: Object[]): string {
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
    while (format.lastIndexOf('{}') != -1) {
      format = format.replace('{}', msgArr.shift());
    }
    if (msgArr.length > 0) {
      this.fatal('Argument count is more than "{}" in message format, you may not getting what you want to log.')
    }
    this.count++;
    let result = '[' + level.name().padEnd(5, ' ') + ']\t' + this.time() + '\t' + this.getTag() + '\t' + format;
    if (this.temporaryContext.hasMarker()) {
      result += ' ' + this.temporaryContext.getMarker();
    }
    if (level.intLevel() <= Level.ERROR.intLevel()) {
      let rawStack = new Error().stack ?? '';
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
    if (typeof this.context == 'string') {
      return `[${this.context}:${this.count}]`;
    }
    return `[${this.context.constructor.name}:${this.count}]`;
  }

  terminate() {
    this.appenderArray.forEach(appender => {
      appender.onTerminate();
    });
  }
}