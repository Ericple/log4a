import { Level } from '../Level';

export interface SocketAppenderOptions {
  encryptor?: (level: Level, originalLog: string | ArrayBuffer) => string | ArrayBuffer;
  filter?: (level: Level, content: string | ArrayBuffer) => boolean;
  name: string;
  level: Level;
}