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
import { hilog } from '@kit.PerformanceAnalysisKit';

export class ConsoleAppender extends AbstractAppender {
  private useHilog: boolean = false;
  private domain: number = 0x0;

  onLog(lvl: Level, tag: string, time: number, count: number, message: string,
    tempContext: TemporaryLoggerContext): this {
    if (lvl.intLevel() > this.level.intLevel()) {
      return this;
    }
    if (!this.useHilog) {
      this.getLogFunction(lvl)(this.makeMessage(lvl, tag, time, count, message, tempContext));
      return this;
    }
    this.getHilogFunction(lvl)(0x0, tag,
      this.makeMessage(lvl, tag, time, count, message, tempContext))
    return this;
  }

  constructor(level: Level = Level.ALL, useHilog: boolean = false, domain: number = 0x0) {
    super('console', level, AppenderTypeEnum.CONSOLE);
    this.useHilog = useHilog;
    this.domain = domain;
  }

  private getHilogFunction(lvl: Level): Function {
    if (lvl == Level.FATAL || lvl == Level.ERROR) {
      return hilog.error;
    } else if (lvl == Level.TRACE || lvl == Level.WARN) {
      return hilog.warn;
    } else if (lvl == Level.DEBUG) {
      return hilog.debug;
    }
    return hilog.info;
  }

  private getLogFunction(lvl: Level): Function {
    if (lvl == Level.FATAL || lvl == Level.ERROR) {
      return LogManager.getOriginalConsole().error;
    } else if (lvl == Level.TRACE || lvl == Level.WARN) {
      return LogManager.getOriginalConsole().warn;
    } else if (lvl == Level.DEBUG) {
      return LogManager.getOriginalConsole().debug;
    }
    return LogManager.getOriginalConsole().info;
  }
}