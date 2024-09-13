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
import { SMTPAppender } from '../appender/SMTPAppender';

export abstract class AbstractLogger {
  protected context: any;
  protected count: number = 0;
  protected appenderMap: Map<string, AbstractAppender> = new Map();
  protected temporaryContext: TemporaryLoggerContext = new TemporaryLoggerContext;
  protected level: Level = Level.ALL;
  protected history: string = '';
  protected logListeners: ((level: Level, content: string) => void)[] = [];

  constructor(context: any) {
    this.context = context;
    this.bindAppender(new ConsoleAppender());
  }

  /**
   * 手动触发SMTPAppender邮件发送
   * @param appenderIdentifiers 要发送邮件的追加器名称
   * @returns this
   */
  triggerMail(...appenderIdentifiers: string[]): this {
    let now = Date.now();
    this.appenderMap.forEach(appender => {
      if (appenderIdentifiers.includes(appender.getName()) && appender instanceof SMTPAppender) {
        (appender as SMTPAppender).triggerMail(now);
      }
    });
    return this;
  }

  /**
   * 添加日志监听器
   * @param listener 监听回调
   * @returns this
   */
  registerLogListener(listener: (level: Level, content: string) => void): this {
    if (this.logListeners.indexOf(listener) < 0) {
      this.logListeners.push(listener);
    }
    return this;
  }

  /**
   * 获取已绑定的追加器，当有多个追加器满足所给条件时，按迭代器访问顺序返回其中满足条件的第一个追加器
   * @param predicates 追加器名称
   * @returns AbstractAppender
   */
  getAppender(predicates: string): AbstractAppender | undefined;

  /**
   * 获取已绑定的追加器，当有多个追加器满足所给条件时，按迭代器访问顺序返回其中满足条件的第一个追加器
   * @param predicates 追加器类型
   * @returns AbstractAppender
   */
  getAppender(predicates: AppenderTypeEnum): AbstractAppender | undefined;

  /**
   * 获取已绑定的追加器，当有多个追加器满足所给条件时，按迭代器访问顺序返回其中满足条件的第一个追加器
   * @param predicates 追加器名称或追加器类型
   * @returns AbstractAppender
   */
  getAppender(predicates: string | AppenderTypeEnum): AbstractAppender | undefined;

  /**
   * 获取已绑定的追加器，当有多个追加器满足所给条件时，按迭代器访问顺序返回其中满足条件的第一个追加器
   * @param predicates 追加器名称或追加器类型
   * @returns AbstractAppender
   */
  getAppender(predicates: string | AppenderTypeEnum): AbstractAppender | undefined {
    if (typeof predicates == 'string') {
      return this.appenderMap.get(predicates);
    }
    for (let appender of this.appenderMap) {
      if (appender[1].getType() == predicates) {
        return appender[1];
      }
    }
  }

  /**
   * 重新配置已绑定的追加器，所有绑定了该追加器的Logger均会受影响
   * @param predicates 追加器名称
   * @param configCallback 配置回调，在回调中重新配置追加器
   * @returns this
   */
  configureAppender(predicates: string, configCallback: (appender?: AbstractAppender) => AbstractAppender): this;

  /**
   * 重新配置已绑定的追加器，所有绑定了该追加器的Logger均会受影响
   * @param predicates 追加器类型
   * @param configCallback 配置回调，在回调中重新配置追加器
   * @returns this
   */
  configureAppender(predicates: AppenderTypeEnum,
    configCallback: (appender?: AbstractAppender) => AbstractAppender): this;

  /**
   * 重新配置已绑定的追加器，所有绑定了该追加器的Logger均会受影响
   * @param predicates 追加器名称或追加器类型
   * @param configCallback 配置回调，在回调中重新配置追加器
   * @returns this
   */
  configureAppender(predicates: string | AppenderTypeEnum,
    configCallback: (appender?: AbstractAppender) => AbstractAppender): this;

  /**
   * 重新配置已绑定的追加器，所有绑定了该追加器的Logger均会受影响
   * @param predicates 追加器名称或追加器类型
   * @param configCallback 配置回调，在回调中重新配置追加器
   * @returns this
   */
  configureAppender(predicates: string | AppenderTypeEnum,
    configCallback: (appender?: AbstractAppender) => AbstractAppender): this {
    let o = configCallback(this.getAppender(predicates));
    return this.bindAppender(o);
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

  withMarker(marker: Marker | string): this {
    this.temporaryContext.setMarker(marker);
    return this;
  }

  /**
   * 添加一个追加器
   * @param appender 要添加的追加器
   * @returns this
   * @deprecated 使用 bindAppender 替代此方法
   */
  addAppender<T extends AbstractAppender>(appender: T): this {
    if (appender == this.appenderMap.get(appender.getName())) {
      return this;
    }
    appender.setId(this.appenderMap.size);
    this.appenderMap.set(appender.getName(), appender);
    return this;
  }

  /**
   * 绑定一个追加器
   * @param appender 要绑定的追加器
   * @returns this
   */
  bindAppender<T extends AbstractAppender>(appender: T): this {
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
   * @deprecated 使用 bindAppender 替代此方法
   */
  addFileAppender(path: string, name: string = '', level: Level = Level.ALL, options?: FileAppenderOptions): this {
    return this.addAppender(FileAppenderManager.getFileAppender(path, name, level, options));
  }

  /**
   * 向Logger添加一个新的ConsoleAppender
   * @param level 输出的最低日志等级
   * @returns this
   * @deprecated 使用 bindAppender 替代此方法
   */
  addConsoleAppender(level: Level = Level.ALL): this {
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
   * @deprecated 使用 removeAppenderByType 替代此方法
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
      }
    }
    return this;
  }

  /**
   * 删除指定名称的appender
   * @param name appender名称
   * @deprecated 使用 removeAppenderByName 替代此方法
   * @returns
   */
  removeNamedAppender(name: string): this {
    return this.removeAppenderByName(name);
  }

  /**
   * 删除指定名称的appender
   * @param name appender名称
   * @returns this
   */
  removeAppenderByName(name: string): this {
    this.appenderMap.delete(name);
    return this;
  }

  /**
   * 打印一条DEBUG级别的日志
   * @param format 日志格式
   * @param args 日志参数
   */
  debug(format: string, ...args: any[]) {
    this.print(Level.DEBUG, format, args);
  }

  /**
   * 打印一条ERROR级别的日志
   * @param format 日志格式
   * @param args 日志参数
   */
  error(format: string, ...args: any[]) {
    this.print(Level.ERROR, format, args);
  }

  /**
   * 打印一条WARN级别的日志
   * @param format 日志格式
   * @param args 日志参数
   * @since 1.5.4
   */
  warn(format: string, ...args: any[]) {
    this.print(Level.WARN, format, args);
  }

  /**
   * 打印一条INFO级别的日志
   * @param format 日志格式
   * @param args 日志参数
   */
  info(format: string, ...args: any[]) {
    this.print(Level.INFO, format, args);
  }

  /**
   * 打印一条FATAL级别的日志
   * @param format 日志格式
   * @param args 日志参数
   */
  fatal(format: string, ...args: any[]) {
    this.print(Level.FATAL, format, args);
  }

  /**
   * 打印一条TRACE级别的日志
   * @param format 日志格式
   * @param args 日志参数
   */
  trace(format: string, ...args: any[]) {
    this.print(Level.TRACE, format, args);
  }

  /**
   * 打印一条日志，INFO级
   * @param format 日志格式
   * @param args 日志参数
   */
  log(format: string, ...args: any[]) {
    this.print(Level.INFO, format, args);
  }

  private print(level: Level, format: string, args: any[]) {
    if (level.intLevel() <= this.level.intLevel()) {
      const message = this.makeMessage(level, format, args);
      this.appenderMap.forEach(appender => {
        appender.onLog(level, this.getTag(), Date.now(), this.count, message, this.temporaryContext);
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
    return `${d.getFullYear()}-${this.padNum(d.getMonth() +
      1)}-${this.padNum(d.getDate())} ${this.padNum(d.getHours())}:${this.padNum(d.getMinutes())}:${this.padNum(d.getSeconds())}.${d.getMilliseconds()}`
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