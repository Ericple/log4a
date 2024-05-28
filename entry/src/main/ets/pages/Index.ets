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
import { LogManager, Logger, MarkerManager, Benchmark, AppenderTypeEnum } from '@log/log4a';

import { LogView, LogViewMode, LogViewColorConfig } from '@log/log4a/src/main/ets/components/LogView';
import fs from '@ohos.file.fs';
import { FileManager } from '@log/log4a/src/main/ets/FileManager';

@Entry
@Component
struct Index {
  @State message: string = 'Hello World';
  @State logger: Logger = LogManager.getLogger(this);
  intercepted: boolean = false;
  @State caches: string[] = [];
  bench: Benchmark = new Benchmark('benchmark.log')

  aboutToAppear(): void {
    this.logTest()
    LogManager.interceptConsole();
  }

  logTest() {
    let i = 1;
    while (i--) {
      this.logger.withMarker(MarkerManager.getMarker('Test Marker'))
        .info('this is a test log, this is a test log, this is a test log, this is a test log, this is a test log, ');
    }
  }

  getFileSize() {
    this.logTest();
    let url = LogManager.getLogFilePath() + '/' + 'Xlog.log';
    this.logger.info('log file path = {}', url);
    this.caches = FileManager.getCachedFiles(url)
    fs.stat(url).then(stat => {
      this.logger.info('file stat: {}', stat.size / 1000,);
    }).catch((e: Object) => {
      this.logger.error('failed to get file stat: {}', e)
    })
  }

  build() {
    Row() {
      Column() {
        LogView({
          src: $logger,
          config: {
            mode: LogViewMode.ALL,
            appender: 'main',
            colorConfig: new LogViewColorConfig()
          }
        })
          .height('50%')
        List() {
          ForEach(this.caches, (cache: string) => {
            ListItem() {
              Text(cache)
                .fontSize(10)
            }
          })
        }
        .width('100%')
        .height('30%')

        Button('toggle intercept')
          .onClick(() => {
            // console.log('Hello log')
            this.logger.getAppender(AppenderTypeEnum.CONSOLE)
          })
        Button('log')
          .onClick(() => {
            this.logTest();
          })
        Button('file state')
          .onClick(() => {
            this.getFileSize();
          })
        Button('worker benchmark')
          .onClick(() => {
            this.bench.withWorker()
          })
        Button('non worker benchmark')
          .onClick(() => {
            this.bench.withoutWorker()
          })
      }
      .width('100%')
    }
    .height('100%')
  }
}