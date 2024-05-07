import { Level } from '../Level';
import { FileAppender } from './FileAppender';

export class RollingFileAppender extends FileAppender {
  constructor(path: string, name: string, level: Level, maxFileSize: number, maxCacheCount: number) {
    super(path, name, level, {
      maxFileSize,
      maxCacheCount
    });
  }
}