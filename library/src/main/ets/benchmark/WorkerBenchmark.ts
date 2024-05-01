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