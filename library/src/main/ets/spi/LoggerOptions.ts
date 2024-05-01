import { Level } from '../Level';

export interface LoggerOptions {
  encryptor?: (level: Level, originalLog: string | ArrayBuffer) => string | ArrayBuffer;
  filter?: (level: Level, content: string | ArrayBuffer) => boolean;
}