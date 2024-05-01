import {
  LogManager,
  Logger,
  TraceEntry,
  TraceExit,
  MarkerManager,
  TracedStr,
  MarkedTracedStr,
  LogView,
  LogViewMode,
  LogViewColorConfig,
  BenchmarkWithWorker,
  BenchmarkWithoutWorker
} from '@log/log4a';
import { Level } from '@log/log4a/src/main/ets/Level';

class TestClass {
  logger: Logger = LogManager.getLogger(this);
  static logger: Logger = LogManager.getLogger(TestClass);
  param1: string = 'param1';
  param2: string = 'param2';
  str: string = TracedStr`build with ${this.param1} and ${this.param2}`;
  str1: string = MarkedTracedStr("StrBuilder")`build with ${this.param1} and ${this.param2}`;

  @TraceEntry
  enter(...args: number[]) {
    this.logger.withMarker(MarkerManager.getMarker('IMPORTANT')).info("args are {}", args);
    this.logger.info("without marker")
    return args;
  }

  @TraceExit
  exit() {
    return "Exit result";
  }

  @TraceEntry
  static entry() {
    TestClass.logger.info("static entry called");
  }
}

@Entry
@Component
struct Index {
  @State message: string = 'Hello World';
  @State logger: Logger = LogManager.getLogger(this)
    .addFileAppender(getContext().filesDir + '/log.txt', 'main', Level.ALL, {
      useWorker: true,
      maxFileSize: 1,
      maxCacheCount: 2,
      // encryptor: () => '1'
    });
  test: TestClass = new TestClass();
  p = getContext().filesDir;
  b = new BenchmarkWithWorker(this.p + '/log.log');
  c = new BenchmarkWithoutWorker(this.p + '/log2.log');

  aboutToAppear(): void {
    this.message = this.logger.getAllHistoryOfAppender('main');
    this.test.logger.addFileAppender(getContext().filesDir + '/log.txt', 'main', Level.ALL, {
      maxFileSize: 1,
      maxCacheCount: 1
    });
    this.logger.info('Hello {}!', 'world');
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
        Button('log')
          .onClick(() => {
            this.logger.debug('log into file and console, {}', Level.ALL);
            this.test.logger.info('test logger into file and console, {}', Level.ALL);
            this.message = this.logger.getAllHistoryOfAppender('main');
          })
        Button('benchmark')
          .onClick(() => {
            this.c.benchmark();
          })
        Button('benchmark worker')
          .onClick(() => {
            this.b.benchmark();
          })
      }
      .width('100%')
    }
    .height('100%')
  }
}