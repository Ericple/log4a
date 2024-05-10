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
import { Level } from '../Level';
import { Logger } from '../Logger';
import { LogManager } from '../LogManager';
import { BenchmarkBase, IBenchmark } from './BenchmarkBase';

export class BenchmarkWithWorker extends BenchmarkBase implements IBenchmark {
  private logger: Logger;

  constructor(path: string) {
    super();
    this.logger = LogManager.getLogger(this).addFileAppender(path, 'main', Level.ALL, {
      useWorker: true
    });
  }

  benchmark(): void {
    this.start(this.logger);
  }
}

export class BenchmarkWithoutWorker extends BenchmarkBase implements IBenchmark {
  private logger: Logger;

  constructor(path: string) {
    super();
    this.logger = LogManager.getLogger(this).addFileAppender(path, 'main', Level.ALL, {
      useWorker: false
    });
  }

  benchmark(): void {
    this.start(this.logger);
  }
}