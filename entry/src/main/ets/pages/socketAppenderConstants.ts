/*
 * Copyright 2024 Tingjin Guo
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {
  ConsoleAppender,
  CSVLayout,
  FileAppender,
  Level,
  LogManager,
  PatternLayout,
  SMTPAppender,
  TCPSocketAppender
} from '@log/log4a';

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
  // const smtpAppender = new SMTPAppender({
  //   connectOptions: {
  //     host: 'smtp.host.com',
  //     port: 25,
  //     isSsl: false,
  //     authorizationCode: 'jjoa93h0f-fch3h8qf',
  //     from: 'one_bill_suggestion@peercat.cn',
  //   },
  //   name: 'main_smtp',
  //   level: Level.ALL,
  //   recipients: ['example@huawei.com'],
  //   debug: true,
  //   minimumCount: 10,
  // });
  const consoleAppender = new ConsoleAppender(Level.ALL)
    .setLayout(new PatternLayout('%d%5L%5l%5p%r %C %% %m'))
  const fAppender = new FileAppender('Xlog.log', 'mainAppender', Level.ALL, {
    useWorker: true
  }).setLayout(new PatternLayout('layout changed %m'))
  LogManager
    .registerLogger('Index')
    .registerLogger('SplashPage')
    .registerLoggers('SettingPage', 'AccountPage')
    .bindAppenderGlobally(fAppender)
    .bindAppenderGlobally(fileAppender_a)
    .bindAppenderGlobally(consoleAppender)
    .bindAppenderGlobally(socketAppender)
}