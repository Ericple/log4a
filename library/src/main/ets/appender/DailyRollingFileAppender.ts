import { FileManager } from '../FileManager';
import { Level } from '../Level';
import { LogManager } from '../LogManager';
import fs from '@ohos.file.fs';
import { FileAppender } from './FileAppender';

export class DailyRollingFileAppender extends FileAppender {
  constructor(name: string, level: Level, useWorker: boolean) {
    super(LogManager.getLogFilePath() + '/' + DailyRollingFileAppender.getDailyFileName(), name, level, {
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