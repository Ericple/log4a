/*
 * Copyright (c) 2024. Guo TingJin
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
import { PatternLayout } from '../layout/PatternLayout';
import { Level } from '../Level';
import { AppenderTypeEnum } from '../spi/AppenderTypeEnum';
import { NotImplementedError } from '../spi/NotImplementError';
import { TemporaryLoggerContext } from '../TemporaryLoggerContext';
import { AbstractLayout } from './AbstractLayout';

export abstract class AbstractAppender {
  protected _type: AppenderTypeEnum;
  protected _id: number;
  protected _terminated: boolean = false;
  private _history: string[] = [];
  private _maximumHistoryCount: number = 1000;
  protected _enableHistory: boolean = false;
  protected _name: string = '';
  protected level: Level;
  protected layout: AbstractLayout = new PatternLayout();

  constructor(name: string, level: Level, type: AppenderTypeEnum) {
    this._type = type;
    this._name = name;
    this.level = level;
  }

  protected loggable(level: Level) {
    if (this._terminated || level._intLevel > this.level._intLevel) {
      return false;
    }
    return true;
  }

  getName(): string {
    return this._name;
  }

  public addHistory(...message: string[]): this {
    if (this._enableHistory) {
      this._history.push(...message);
      while (this._history.length > this._maximumHistoryCount) {
        this._history.shift();
      }
    }
    return this;
  }

  public clearHistory(): this {
    this._history = [];
    return this;
  }

  getCurrentHistory(): string {
    return this._history.join('\n');
  }

  /**
   * 设置追加器日志布局
   * @param layout 日志布局
   * @returns this
   */
  setLayout<T extends AbstractLayout>(layout: T): this {
    this.layout = layout;
    return this;
  }

  makeMessage(level: Level, tag: string, time: number, count: number, message: string | ArrayBuffer,
    tempContext: TemporaryLoggerContext) {
    return this.layout.makeMessage(level, tag, time, count, message, new Error().stack ?? '', tempContext);
  }

  /**
   * 当有日志被记录时，由被绑定至的Logger触发
   * @param level 日志等级
   * @param tag 日志标记
   * @param time 日志触发时间
   * @param count 此日志为被绑定的Logger打印的第count条日志
   * @param message 日志消息
   * @param tempContext 日志临时上下文
   * @returns
   */
  onLog(level: Level, tag: string, time: number, count: number, message: string,
    tempContext: TemporaryLoggerContext): this {
    throw new NotImplementedError();
  }

  getType(): AppenderTypeEnum {
    return this._type;
  }

  getId(): number {
    return this._id;
  }

  setId(id: number): this {
    this._id = id;
    return this;
  }

  /**
   * 设置追加器等级
   * @param level
   */
  setLevel(level: Level): this {
    this.level = level;
    return this;
  }

  protected onStop(): this {
    return this;
  }

  onTerminate(): void {
    return;
  }

  /**
   * 设置是否启用追加器历史记录功能
   * @param enable true - 启用，反之不启用
   * @returns AbstractAppender
   * @since 1.6
   */
  public setEnableHistory(enable: boolean): this {
    this._enableHistory = enable;
    return this;
  }

  /**
   * 设置历史记录最大条数，当超出时自动清除最早的一条历史记录
   * @param count 最大条数
   * @returns AbstractAppender
   * @since 1.6
   */
  public setMaximumHistoryCount(count: number): this {
    this._maximumHistoryCount = count;
    return this;
  }
}