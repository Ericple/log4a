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