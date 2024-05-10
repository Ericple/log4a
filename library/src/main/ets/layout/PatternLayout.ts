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
import { Level } from 'ets/Level';
import { AbstractLayout } from '../abstract/AbstractLayout';

export class PatternLayout implements AbstractLayout {
  private pattern: string = '[%-5p]\t%d{YYYY-MM-DD HH:mm:ss.SSS}\t[%c:%r]\t%m';

  constructor(pattern?: string) {
    if (pattern) {
      this.pattern = pattern;
    }
  }

  makeMessage(level: Level, tag: string, time: string, count: number, format: string, args: Object[]): string {
    throw new Error('Method not implemented.');
  }
}