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
import { AbstractAppender } from '../abstract/AbstractAppender';
import { Level } from '../Level';
import { LogManager } from '../LogManager';
import { AppenderTypeEnum } from '../spi/AppenderTypeEnum';
import { TemporaryLoggerContext } from '../TemporaryLoggerContext';

export class ConsoleAppender extends AbstractAppender {
  onLog(lvl: Level, tag: string, time: number, count: number, message: string, tempContext: TemporaryLoggerContext): this {
    if (lvl.intLevel() > this.level.intLevel()) return this;
    this.getLogFunction(lvl)(this.makeMessage(lvl, tag, time, count, message, tempContext));
    return this;
  }

  constructor(level: Level = Level.ALL) {
    super('console', level, AppenderTypeEnum.CONSOLE);
  }

  private getLogFunction(lvl: Level): Function {
    if (lvl == Level.FATAL || lvl == Level.ERROR) {
      return LogManager.getOriginalConsole().error;
    } else if (lvl == Level.TRACE) {
      return LogManager.getOriginalConsole().warn;
    } else if (lvl == Level.DEBUG) {
      return LogManager.getOriginalConsole().debug;
    }
    return LogManager.getOriginalConsole().info;
  }
}