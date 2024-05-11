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
import { router } from '@kit.ArkUI';
import { Logger, LogManager } from '@log/log4a';

@Entry
@Component
struct SecondPage {
  @State message: string = 'Hello World';
  logger: Logger = LogManager.getLogger(this);

  build() {
    Row() {
      Column() {
        Text(this.message)
          .fontSize(50)
          .fontWeight(FontWeight.Bold)
        Button('back')
          .onClick(() => {
            router.back({ url: 'pages/Index' })
          })
      }
      .width('100%')
    }
    .height('100%')
  }
}