import fs from '@ohos.file.fs';
import { AbstractAppender } from '../abstract/AbstractAppender';
import { Logger } from '../Logger';
import { LogManager } from '../LogManager';
import { MarkerManager } from '../MarkerManager';

export class FileAppender extends AbstractAppender {
  private file: fs.File;
  private logger: Logger = LogManager.getLogger(this);

  constructor(path: string) {
    super();
    this.logger.withMarker(MarkerManager.getMarker("INITIALIZE")).info("Creating file appender with path: {}", path);
    this.file = fs.openSync(path, fs.OpenMode.WRITE_ONLY | fs.OpenMode.CREATE);
  }

  append(message: string): void {
    if (this.file) {
      fs.write(this.file.fd, message);
    }
  }
}