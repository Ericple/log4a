import { FileAppender, FileAppenderOptions } from './appender/FileAppender'
import { Level } from './Level';

class FileAppenderManagerClass {
  private _fileAppenderMap: Map<string, FileAppender> = new Map();

  getFileAppender(path: string, name: string, level: Level, options?: FileAppenderOptions) {
    if (this._fileAppenderMap.has(path)) {
      let exist = this._fileAppenderMap.get(path)!;
      if (options != undefined && !exist.matchOptions(options)) {
        this._fileAppenderMap.delete(path);
      } else {
        return this._fileAppenderMap.get(path);
      }
    }
    this._fileAppenderMap.set(path, new FileAppender(path, name, level, options));
    return this._fileAppenderMap.get(path);
  }
}

export const FileAppenderManager = new FileAppenderManagerClass();