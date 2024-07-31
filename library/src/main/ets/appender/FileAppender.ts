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
import fs from '@ohos.file.fs';
import { AbstractAppender } from '../abstract/AbstractAppender';
import { FileManager } from '../FileManager';
import { Level } from '../Level';
import { AppenderTypeEnum } from '../spi/AppenderTypeEnum';
import { WorkerManager } from '../WorkerManager';
import worker from '@ohos.worker';
import { LogManager } from '../LogManager';
import { TemporaryLoggerContext } from '../TemporaryLoggerContext';
import { AbstractLayout } from '../abstract/AbstractLayout';
import { hilog } from '@kit.PerformanceAnalysisKit';

export interface FileAppenderOptions {
  useWorker?: boolean;

  /**
   * File size in KB
   */
  maxFileSize?: number;
  maxCacheCount?: number;
  encryptor?: (level: Level, originalLog: string | ArrayBuffer) => string | ArrayBuffer;
  filter?: (level: Level, content: string | ArrayBuffer) => boolean;
  expireTime?: number;
}

export class FileAppender extends AbstractAppender {
  private path: string;
  private options?: FileAppenderOptions;
  private worker?: worker.ThreadWorker;
  private _isWorkerAppender: boolean = false;

  constructor(path: string, name: string, level: Level, options?: FileAppenderOptions) {
    super(name, level, AppenderTypeEnum.FILE);
    const lp = LogManager.getLogFilePath();
    if (lp == '') {
      this.path = path;
    } else {
      this.path = lp + '/' + path;
    }
    if (options) {
      this.options = options;
    }
    if (options?.useWorker) {
      this.worker = WorkerManager.getFileAppendWorker();
      this.worker.postMessage({
        path: this.path,
        name,
        level,
        options
      });
    }
  }

  matchOptions(options?: FileAppenderOptions) {
    if (options) {
      return options.useWorker == this.options.useWorker && options.maxFileSize == this.options.maxFileSize
        && options.maxCacheCount == this.options.maxCacheCount && options.encryptor == this.options.encryptor;
    }
    return false;
  }

  onLog(level: Level, tag: string, time: number, count: number, message: string | ArrayBuffer,
    tempContext: TemporaryLoggerContext): this {
    if (this._terminated) {
      return this;
    }
    if (level._intLevel > this.level._intLevel) {
      return this;
    }
    if (!this._isWorkerAppender) {
      message = this.makeMessage(level, tag, time, count, message, tempContext);
    }
    if (this.options && this.options.useWorker) {
      this.worker.postMessage({
        level,
        message,
        tag,
        time,
        count,
        path: this.path,
        tempContext
      });
      return this;
    }
    if (this.options && this.options.filter) {
      if (!this.options.filter(level, message)) {
        return;
      }
    }
    if (this.options && this.options.encryptor) {
      message = this.options.encryptor(level, message);
    }
    const lp = LogManager.getLogFilePath();
    if (!this.path.includes(lp)) {
      this.path = lp + '/' + this.path;
    }
    const f = FileManager.getManaged(this.path);
    if (!f) {
      return this;
    }
    fs.writeSync(f.file.fd, message);
    if (this.options && this.options.maxFileSize) {
      if (fs.statSync(this.path).size > this.options.maxFileSize * 1000) {
        FileManager.backup(this.path, this.options.maxCacheCount, f.cachedFiles, this.options.expireTime);
      }
    }
    this._history += message + '\n';
    return this;
  }

  onTerminate(): void {
    FileManager.close(this.path);
    this._terminated = true;
  }

  getAllHistory(): string {
    let tmp = '';
    let caches = FileManager.getCachedFiles(this.path);
    while (caches.length > 0) {
      let cache = caches.shift()!;
      if (fs.accessSync(cache)) {
        tmp += fs.readTextSync(cache);
      }
    }
    return tmp + this._history;
  }

  /**
   * 删除日志箱
   * @deprecated
   * @returns
   */
  clearAllHistory(): this {
    const allHistoryPath = this.path + '.all';
    if (fs.accessSync(allHistoryPath)) {
      fs.unlink(allHistoryPath);
    }
    return this;
  }

  clearCurrentHistory(): this {
    FileManager.close(this.path);
    fs.unlink(this.path);
    return this;
  }
}