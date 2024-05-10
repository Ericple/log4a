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
import { Level } from '../Level';
import { AppenderTypeEnum } from '../spi/AppenderTypeEnum';
import { NotImplementedError } from '../spi/NotImplementError';

export abstract class AbstractAppender {
  protected _type: AppenderTypeEnum;
  protected _id: number;
  protected _terminated: boolean = false;
  protected _history: string = '';
  protected _name: string = '';
  protected level: Level;
  protected layout: string = '%tag\t%time\t%src\t%msg'

  constructor(name: string, level: Level, type: AppenderTypeEnum) {
    this._type = type;
    this._name = name;
    this.level = level;
  }

  getName(): string {
    return this._name;
  }

  getCurrentHistory(): string {
    return this._history;
  }

  onLog(_: Level, __: string): this {
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

  protected onStop(): this {
    return this;
  }

  onTerminate(): void {
    return;
  }
}