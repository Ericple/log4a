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
  LogManager,
  Logger,
  MarkerManager,
  Benchmark,
  AppenderTypeEnum,
  ConsoleAppender,
  PatternLayout,
  Level,
  FileAppender
} from '@log/log4a';

import { LogView, LogViewMode, LogViewColorConfig } from '@log/log4a/src/main/ets/components/LogView';
import fs from '@ohos.file.fs';
import { FileManager } from '@log/log4a/src/main/ets/FileManager';

@Entry
@Component
struct Index {
  @State logger: Logger = LogManager.getLogger(this)
  @State history:string = '';

  build() {
    Row() {
      Column() {
        Image($r('app.media.sd'))
          .width(48)
        // Text(this.history)
        // Button('log')
        //   .onClick(()=>{
        //     this.logger.info('this is a test log')
        //   })
        // Button('get history')
        //   .onClick(()=>{
        //     this.history = this.logger.getHistoryOfAppender('main');
        //   })
        // Button('clear')
        //   .onClick(()=>{
        //     this.history=(this.logger.getAppender('main') as FileAppender).clearAllHistory().getCurrentHistory()
        //   })
      }
      .width('100%')
    }
    .height('100%')
  }
}