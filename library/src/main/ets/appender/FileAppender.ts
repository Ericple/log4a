import fs from '@ohos.file.fs';
import { AbstractAppender } from '../abstract/AbstractAppender';
import { FileManager } from '../FileManager';
import { Level } from '../Level';
import { Logger } from '../Logger';
import { LogManager } from '../LogManager';
import { AppenderTypeEnum } from '../spi/AppenderTypeEnum';
import { WorkerManager } from '../WorkerManager';
import { worker } from '@kit.ArkTS';

export interface FileAppenderOptions {
  useWorker?: boolean;

  /**
   * File size in KB
   */
  maxFileSize?: number;
  maxCacheCount?: number;
  encryptor?: (level: Level, originalLog: string | ArrayBuffer) => string | ArrayBuffer;
}

export class FileAppender extends AbstractAppender {
  private path: string;
  private logger: Logger = LogManager.getLogger(this);
  private options?: FileAppenderOptions;
  private worker: worker.ThreadWorker;

  constructor(path: string, name: string, level: Level, options?: FileAppenderOptions) {
    super(name, level, AppenderTypeEnum.FILE);
    this.path = path;
    if (options) {
      this.options = options;
    }
    this.worker = WorkerManager.getFileAppendWorker();
    WorkerManager.registerMessageListener((e) => {
      if (e.data.type == 'overflow' && e.data.path == this.path) {
        FileManager.backup(e.data.path, e.data.limitCount, FileManager.getManaged(e.data.path).cachedFiles);
        this.logger.info('Log backup file created due to oversize of maximum size: {} KB', this.options.maxFileSize);
      }
    });
  }

  matchOptions(options?: FileAppenderOptions) {
    if (options)
      return options.useWorker == this.options.useWorker && options.maxFileSize == this.options.maxFileSize
        && options.maxCacheCount == this.options.maxCacheCount && options.encryptor == this.options.encryptor;
    return this.options == undefined;
  }

  log(level: Level, message: string | ArrayBuffer): this {
    if (level.intLevel() > this.level.intLevel()) return this;
    if (!this._terminated) {
      if (this.options && this.options.encryptor) {
        message = this.options.encryptor(level, message);
      }
      if (this.options.useWorker) {
        const f = FileManager.getManaged(this.path);
        this.worker.postMessage({
          level,
          message,
          fd: f.file.fd,
          maxSize: this.options.maxFileSize,
          maxCache: this.options.maxCacheCount,
          path: this.path
        });
      } else {
        fs.writeSync(FileManager.getFile(this.path).fd, message);
        if (fs.statSync(this.path).size > this.options.maxFileSize * 1000) {
          FileManager.backup(this.path, this.options.maxCacheCount, FileManager.getManaged(this.path).cachedFiles);
          this.logger.info('Log backup file created due to oversize of maximum size: {} KB', this.options.maxFileSize);
        }
      }
      this._history += message + '\n';
    }
    return this;
  }

  terminate(): void {
    FileManager.close(this.path);
    this._terminated = true;
    const historyFile = FileManager.getFile(this.getAllHistoryPath());
    const historyLength = fs.readTextSync(historyFile.path).length;
    fs.writeSync(historyFile.fd, this._history, { offset: historyLength });
    FileManager.close(this.getAllHistoryPath());
  }

  private getAllHistoryPath() {
    const p = this.path + '.all';
    if (fs.accessSync(p)) {
      if (fs.lstatSync(p).size > 10485760) {
        fs.unlinkSync(p);
      }
    }
    return p;
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