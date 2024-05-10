import { FileAppender, Level, TCPSocketAppender } from '@log/log4a';

export const socketAppender = new TCPSocketAppender({
  address: '114.115.170.226',
  port: 4721,
  name: 'socket',
  level: Level.ALL
});

export const fileAppender_a = new FileAppender('log.txt', 'main', Level.ALL, {
  useWorker: true,
  maxFileSize: 1,
  maxCacheCount: 2
});