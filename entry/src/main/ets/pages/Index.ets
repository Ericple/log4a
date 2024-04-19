import { LogManager, Logger, TraceEntry, TraceExit, MarkerManager, TracedStr, MarkedTracedStr } from '@log/log4a';

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
  private logger: Logger = LogManager.getLogger(this);
  test: TestClass = new TestClass();

  build() {
    Row() {
      Column() {
        Text(this.message)
          .fontSize(50)
          .fontWeight(FontWeight.Bold)
          .onClick(() => {
            this.test.enter(1, 2, 3, 4);
            this.test.exit();
            TestClass.entry();
          })
      }
      .width('100%')
    }
    .height('100%')
  }
}