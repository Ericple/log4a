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
import { AbstractLayout } from '../abstract/AbstractLayout';
import { PatternParser } from '../pattern/PatternParser';
import { TemporaryLoggerContext } from '../TemporaryLoggerContext';

export class PatternLayout implements AbstractLayout {
  private pattern: string = '[%-5p]\t%d\t[%C:%r]\t%m';
  readonly layoutFQCN: string = "PatternLayout";

  constructor(pattern?: string) {
    if (pattern) {
      this.pattern = pattern;
    }
  }

  setPattern(newPattern: string): this {
    this.pattern = newPattern;
    return this;
  }

  makeMessage(level: Level, tag: string, timestamp: number, logCount: number, message: string, stackInfo: string,
    tempContext: TemporaryLoggerContext): string {
    return PatternParser.parse(this.pattern, {
      logLevel: level,
      logMessage: message,
      timestamp,
      logCount,
      className: tag,
      stackInfo,
      tempContext
    });
  }
}