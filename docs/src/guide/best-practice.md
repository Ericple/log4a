# 最佳实践

## 在UI代码之外的地方定义Logger <Badge type="tip" text="1.3.4 +" />

在UI代码中定义一个Logger是一个糟糕的做法，尤其是当这些日志需要被发送到许多不同的地方时，这会让代码显得非常混乱，因此我推荐您在一个单独的文件中配置将要用到的所有Logger。

这个功能基于1.3.4版本之后，您可以通过向LogManager.getLogger传入相同的类名来获取与传入类相同的Logger来完成，以下的例子展示了如何利用这一点特性使您的代码看起来更加优雅。

```ts:line-numbers
// LoggerConfig.ets
import { LogManager, Level, TCPSocketAppender } from '@pie/log4a';

export function InitializeAllLoggers(logFilePath: string) {
  // 必须在创建Appender实例前先调用LogManager.setLogFilePath，否则添加Appender时不可以直接指定文件名。
  LogManager.setLogFilePath(logFilePath);
  const socketAppender = new TCPSocketAppender({
    address: '114.xxx.xxx.xxx',
    port: 1234,
    name: 'socket',
    level: Level.ALL
  });
  LogManager.getLogger('Index')//传入的名称必须与类名一致
    .addFileAppender('logFile.log', 'mainLoggerOfIndex', Level.ALL, {
      useWorker: true
    })
    .addAppender(socketAppender);
  LogManager.getLogger('LoginPage')
    .addFileAppender('logFile.log', 'mainLoggerOfLoginPage', Level.ALL, {
      useWorker: true
    });
}
```

```ts:line-numbers{11}
// EntryAbility.ets
import { InitializeAllLoggers } from '../xxx/LoggerConfig';
import { AbilityConstant, UIAbility, Want } from '@kit.AbilityKit';
import { hilog } from '@kit.PerformanceAnalysisKit';
import { window } from '@kit.ArkUI';
import { LogManager } from '@log/log4a';

export default class EntryAbility extends UIAbility {
  onCreate(want: Want, launchParam: AbilityConstant.LaunchParam): void {
    hilog.info(0x0000, 'testTag', '%{public}s', 'Ability onCreate');
    InitializeAllLoggers(this.context.filesDir);
  }

  onDestroy(): void {
    hilog.info(0x0000, 'testTag', '%{public}s', 'Ability onDestroy');
    LogManager.terminate();
  }
  //...其他代码
}
```

```typescript:line-numbers
// Index.ets
@Entry
@Component
struct Index {
  @State message: string = 'Hello World';
  @State logger: Logger = LogManager.getLogger(this);// 此处直接获取Logger即可
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
```

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
>
由于文件路径需要在Context中获取，如果您希望统一定义所有文件追加器，请务必在EntryAbility的onCreate生命周期中调用LogManager.setLogFilePath来预先指定日志文件存放目录，随后在定义文件追加器时，只将文件名传入`path`
参数。

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

## 更加便捷地同时配置多个Logger <Badge type="tip" text="1.5.4 +" />

由于log4a的设计是多Logger的，当出现多个不同的Logger需要绑定同一个追加器时，为了避免重复代码，
从1.5.4版本开始，支持通过调用LogManager下的`bindAppenderGlobally`来一次性向所有Logger绑定追加器。

以下是一个实例，它先调用registerLogger向LogManager中注册了某Logger实例，
随后链式调用bindAppenderGlobally向所有Logger同时添加了多个appender

```typescript:line-numbers
export function InitializeAllLoggers(logFilePath: string) {
  LogManager.setLogFilePath(logFilePath);
  const socketAppender = new TCPSocketAppender({
    address: '114.xxx.xxx.xxx',
    port: 1234,
    name: 'socket',
    level: Level.ALL
  });
  const fileAppender_a = new FileAppender('log.txt', 'main', Level.ALL, {
    useWorker: true,
    maxFileSize: 1,
    maxCacheCount: 2
  });
  const consoleAppender = new ConsoleAppender(Level.ALL)
    .setLayout(new PatternLayout('%d%5L%5l%5p%r %C %% %m'))
  const fAppender = new FileAppender('Xlog.log', 'mainAppender', Level.ALL, {
    useWorker: true
  }).setLayout(new PatternLayout('layout changed %m'))
  // 在此处注册所有Logger并绑定追加器
  LogManager
    .registerLogger('Index')
    .registerLogger('SplashPage')
    .registerLoggers('SettingPage', 'AccountPage')
    .bindAppenderGlobally(fAppender)
    .bindAppenderGlobally(fileAppender_a)
    .bindAppenderGlobally(consoleAppender)
    .bindAppenderGlobally(socketAppender)
}
```