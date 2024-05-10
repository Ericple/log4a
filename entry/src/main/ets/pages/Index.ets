import {
  LogManager,
  Logger,
  TraceEntry,
  TraceExit,
  MarkerManager,
  TracedStr,
  MarkedTracedStr,
  Level
} from '@log/log4a';

import { LogView, LogViewMode, LogViewColorConfig } from '@log/log4a/src/main/ets/components/LogView';
import { router } from '@kit.ArkUI';

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
  @State logger: Logger = LogManager.getLogger(this);
  test: TestClass = new TestClass();
  intercepted: boolean = false;

  aboutToAppear(): void {
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
        Button('toggle intercept')
          .onClick(() => {
            LogManager.interceptConsole();
          })
        Button('log')
          .onClick(() => {
            this.logger.error('log into file and console, {}', Level.ALL);
          })
        Button('change page')
          .onClick(() => {
            router.pushUrl({ url: 'pages/SecondPage' })
          })
      }
      .width('100%')
    }
    .height('100%')
  }
}