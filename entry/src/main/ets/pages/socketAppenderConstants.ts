import { FileAppender, Level, LogManager, TCPSocketAppender } from '@log/log4a';

export function InitializeAllLoggers(logFilePath: string) {
  LogManager.setLogFilePath(logFilePath);
  const socketAppender = new TCPSocketAppender({
    address: '114.xxx.xxx.xxx',
    port: 1234,
    name: 'socket',
    level: Level.ALL
  });
  const fileAppender_a = new FileAppender('log.txt', 'main', Level.ALL, {
    useWorker: true,
    maxFileSize: 1,
    maxCacheCount: 2
  });
  LogManager.getLogger('Index')
    .addAppender(fileAppender_a)
    .addAppender(socketAppender);
}