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
import { Logger } from '../Logger';
import { randomString } from '../spi/randomString';

export interface IBenchmark {
  benchmark(): void;
}

export abstract class BenchmarkBase {
  protected data: any[] = [];

  constructor() {
    for (let i = 0; i < 100; i++) {
      this.data.push(randomString(Math.random() * 100));
    }
  }

  start(logger: Logger): void {
    let i = 0;
    let end = this.data.length;
    console.time(this.constructor.name);
    for (i; i < end; i++) {
      logger.info('{}', this.data[i]);
    }
    console.timeEnd(this.constructor.name);
  }
}