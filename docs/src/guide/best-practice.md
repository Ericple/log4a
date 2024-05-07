# 最佳实践

## 统一定义追加器

在一个文件里统一定义追加器，并导出供其他模块使用，可以提高代码的可维护性。您可以参考以下代码：

这段代码展示了如何在EntryAbility的onCreate生命周期中指定日志文件存储文件夹

```typescript:line-numbers {11,16}
// EntryAbility.ets
import { AbilityConstant, UIAbility, Want } from '@kit.AbilityKit';
import { hilog } from '@kit.PerformanceAnalysisKit';
import { window } from '@kit.ArkUI';

import { LogManager } from '@log/log4a';

export default class EntryAbility extends UIAbility {
  onCreate(want: Want, launchParam: AbilityConstant.LaunchParam): void {
    hilog.info(0x0000, 'testTag', '%{public}s', 'Ability onCreate');
    LogManager.setLogFilePath(this.context.filesDir);
  }

  onDestroy(): void {
    hilog.info(0x0000, 'testTag', '%{public}s', 'Ability onDestroy');
    LogManager.terminate();
  }
}
```

> [!TIP]
> 由于文件路径需要在Context中获取，如果您希望统一定义所有文件追加器，请务必在EntryAbility的onCreate生命周期中调用LogManager.setLogFilePath来预先指定日志文件存放目录，随后在定义文件追加器时，只将文件名传入`path`参数。

这段代码展示了如何在一个文件中定义所有追加器并导出:

```typescript:line-numbers
import { FileAppender, Level, TCPSocketAppender } from '@log/log4a';

export const socketAppender = new TCPSocketAppender({
  address: '114.xxx.xxx.xxx',
  port: 1234,
  name: 'socket',
  level: Level.ALL
});

export const fileAppender_a = new FileAppender('log.txt', 'main', Level.ALL, {
  useWorker: true,
  maxFileSize: 1,
  maxCacheCount: 2
});
```

这段代码展示了如何在文件中导入并使用已定义的追加器

```typescript:line-numbers
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
  LogViewColorConfig
} from '@log/log4a';
import { Level } from '@log/log4a/src/main/ets/Level';
import { fileAppender_a, socketAppender } from './socketAppenderConstants';

@Entry
@Component
struct Index {
  @State message: string = 'Hello World';
  @State logger: Logger = LogManager.getLogger(this)
    .addAppender(fileAppender_a)
    .addAppender(socketAppender);
  test: TestClass = new TestClass();

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
        Button('log')
          .onClick(() => {
            this.logger.debug('log into file and console, {}', Level.ALL);
          })
      }
      .width('100%')
    }
    .height('100%')
  }
}
```