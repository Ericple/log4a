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
  protected appenderMap: Map<string, AbstractAppender> = new Map();
  protected temporaryContext: TemporaryLoggerContext = new TemporaryLoggerContext;
  protected level: Level = Level.ALL;
  protected history: string = '';
  protected logListeners: ((level: Level, content: string) => void)[] = [];
  protected hasConsoleAppender: boolean = false;

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
    for (let [name, appender] of this.appenderMap) {
      if (typeof predicates == 'string') {
        if (name == predicates) {
          return appender.getCurrentHistory();
        }
      } else {
        if (appender.getType() == predicates) {
          return appender.getCurrentHistory();
        }
      }
    }
    return '';
  }

  /**
   * 获取具名FileAppender的历史日志
   * @param predicates FileAppender名称
   * @returns this
   */
  getAllHistoryOfAppender(predicates: string): string {

    let appender = this.appenderMap.get(predicates);
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
    if (appender == this.appenderMap.get(appender.getName())) {
      return this;
    }
    appender.setId(this.appenderMap.size);
    this.appenderMap.set(appender.getName(), appender);
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
    this.hasConsoleAppender = true;
    return this.addAppender(new ConsoleAppender(level));
  }

  /**
   * 删除所有Appender
   * @returns this
   */
  clearAppender(): this {
    this.appenderMap.forEach(appender => {
      appender.onTerminate();
    });
    this.appenderMap.clear();
    return this;
  }

  /**
   * 删除所有对应类型的appender
   * @param appenderType appender类型
   * @deprecated 请使用removeAppenderByType
   * @returns this
   */
  removeTypedAppender(appenderType: AppenderTypeEnum): this {
    return this.removeAppenderByType(appenderType);
  }

  /**
   * 删除所有对应类型的appender
   * @param appenderType appender类型
   * @returns this
   */
  removeAppenderByType(appenderType: AppenderTypeEnum): this {
    for (let [key, appender] of this.appenderMap) {
      if (appender.getType() == appenderType) {
        this.appenderMap.delete(key);
        if (appenderType == AppenderTypeEnum.CONSOLE) this.hasConsoleAppender = false;
      }
    }
    return this;
  }

  /**
   * 删除指定名称的appender
   * @param name appender名称
   * @deprecated 推荐使用removeAppenderByName
   * @returns
   */
  removeNamedAppender(name: string): this {
    return this.removeAppenderByName(name);
  }

  /**
   * 删除指定名称的appender
   * @param name appender名称
   * @returns
   */
  removeAppenderByName(name: string): this {
    this.appenderMap.delete(name);
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
      this.appenderMap.forEach(appender => {
        appender.onLog(level, this.getTag(), Date.now(), this.count, message);
      })
      this.logListeners.forEach(listener => {
        listener(level, message);
      });
    }
    this.temporaryContext.clear();
  }

  makeMessage(_: Level, format: string, messages: Object[]): string {
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
    return format;
  }

  protected time() {
    const d = new Date();
    return `${d.getFullYear()}-${this.padNum(d.getMonth() + 1)}-${this.padNum(d.getDate())} ${this.padNum(d.getHours())}:${this.padNum(d.getMinutes())}:${this.padNum(d.getSeconds())}.${d.getMilliseconds()}`
  }

  protected padNum(num: number, len: number = 2) {
    return num.toString().padStart(len, '0');
  }

  private getTag() {
    if (!this.context) {
      return `Anonymous`;
    }
    if (typeof this.context == 'string') {
      return `${this.context}`;
    }
    return `${this.context.constructor.name}`;
  }

  terminate() {
    this.appenderMap.forEach(appender => {
      appender.onTerminate();
    });
    this.appenderMap.clear();
  }
}