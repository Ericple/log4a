import fs from '@ohos.file.fs';
import { AbstractAppender } from '../abstract/AbstractAppender';
import { FileManager } from '../FileManager';
import { Level } from '../Level';
import { AppenderTypeEnum } from '../spi/AppenderTypeEnum';
import { WorkerManager } from '../WorkerManager';
import { worker } from '@kit.ArkTS';
import { LogManager } from '../LogManager';

export interface FileAppenderOptions {
  useWorker?: boolean;

  /**
   * File size in KB
   */
  maxFileSize?: number;
  maxCacheCount?: number;
  encryptor?: (level: Level, originalLog: string | ArrayBuffer) => string | ArrayBuffer;
  filter?: (level: Level, content: string | ArrayBuffer) => boolean;
}

export class FileAppender extends AbstractAppender {
  private path: string;
  private options?: FileAppenderOptions;
  private worker?: worker.ThreadWorker;

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
        path, name, level, options
      });
    }
    WorkerManager.registerMessageListener((e) => {
      if (e.data.type == 'overflow' && e.data.path == this.path) {
        FileManager.backup(e.data.path, e.data.limitCount, FileManager.getManaged(e.data.path).cachedFiles);
      }
    });
  }

  matchOptions(options?: FileAppenderOptions) {
    if (options)
      return options.useWorker == this.options.useWorker && options.maxFileSize == this.options.maxFileSize
        && options.maxCacheCount == this.options.maxCacheCount && options.encryptor == this.options.encryptor;
    return this.options == undefined;
  }

  onLog(level: Level, message: string | ArrayBuffer): this {
    if (this.options && this.options.useWorker) {
      this.worker.postMessage({
        level,
        message,
        path: this.path
      });
      return this;
    }
    if (!this._terminated) {
      if (level._intLevel > this.level._intLevel) return this;
      if (this.options && this.options.filter) {
        if (!this.options.filter(level, message)) return;
      }
      if (this.options && this.options.encryptor) {
        message = this.options.encryptor(level, message);
      }
      const f = FileManager.getManaged(this.path);
      fs.writeSync(f.file.fd, message);
      if (this.options && this.options.maxFileSize) {
        if (fs.statSync(this.path).size > this.options.maxFileSize * 1000) {
          FileManager.backup(this.path, this.options.maxCacheCount, FileManager.getManaged(this.path).cachedFiles);
        }
      }
      this._history += message + '\n';
    }
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

  clearAllHistory(): this {
    const allHistoryPath = this.path + '.all';
    if (fs.accessSync(allHistoryPath))
      fs.unlink(allHistoryPath);
    return this;
  }

  clearCurrentHistory(): this {
    FileManager.close(this.path);
    fs.unlink(this.path);
    return this;
  }
}