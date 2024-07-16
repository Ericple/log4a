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
import { FileManager } from '../FileManager';
import { Level } from '../Level';
import { LogManager } from '../LogManager';
import fs from '@ohos.file.fs';
import { FileAppender } from './FileAppender';

export class DailyRollingFileAppender extends FileAppender {
  constructor(name: string, level: Level, useWorker: boolean) {
    super(DailyRollingFileAppender.getDailyFileName(), name, level, {
      useWorker
    });
  }

  private static getDailyFileName(): string {
    const d = new Date();
    const y = d.getFullYear().toString();
    const m = d.getMonth() + 1;
    const da = d.getDate();
    return y + '-' + m + '-' + da + '.daily.log';
  }

  getAllHistory(count: number = 3): string {
    let tmp = '';
    let caches = FileManager.getDailyCachedFiles();
    while (caches.length > 0 && count > 0) {
      let cache = caches.shift()!;
      if (fs.accessSync(cache)) {
        tmp += fs.readTextSync(cache);
        count--;
      }
    }
    return tmp + this._history;
  }
}