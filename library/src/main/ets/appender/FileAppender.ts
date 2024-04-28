import fs from '@ohos.file.fs';
import { AbstractAppender } from '../abstract/AbstractAppender';
import { FileManager } from '../FileManager';
import { Level } from '../Level';
import { Logger } from '../Logger';
import { LogManager } from '../LogManager';
import { MarkerManager } from '../MarkerManager';
import { AppenderTypeEnum } from '../spi/AppenderTypeEnum';
import { WorkerManager } from '../WorkerManager';

export interface FileAppenderOptions {
  useWorker: boolean;
}

export class FileAppender extends AbstractAppender {
  private path: string;
  private logger: Logger = LogManager.getLogger(this);
  private offset: number = 0;
  private useWorker: boolean = false;

  constructor(path: string, name: string, level: Level, options?: FileAppenderOptions) {
    super(name, level, AppenderTypeEnum.FILE);
    this.path = path;
    this.logger.withMarker(MarkerManager.getMarker("INITIALIZE")).info("Creating file appender with path: {}", path);
    if (fs.accessSync(path)) {
      this.offset = fs.readTextSync(path).length;
    }
    if (options) {
      this.useWorker = options.useWorker;
    }
  }

  log(level: Level, message: string): this {
    if (level.intLevel() > this.level.intLevel()) return this;
    if (!this._terminated) {
      if (this.useWorker) {
        let fd = FileManager.getFile(this.path).fd;
        let offset = this.offset;
        WorkerManager.getFileAppendWorker().postMessage({
          level,
          message,
          fd,
          offset
        });
      } else {
        fs.write(FileManager.getFile(this.path).fd, message, { offset: this.offset });
      }
      this.offset += message.length;
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
    return this.path + '.all';
  }

  getAllHistory(): string {
    let tPath = this.path + '.all';
    if (fs.accessSync(tPath)) {
      return fs.readTextSync(this.path + '.all');
    }
    return '';
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