# Best Practices

Define Logger outside the UI code <Badge type="tip" text="1.3.4 +" />

Defining a Logger in your UI code is a bad practice, especially if the logs need to be sent to many different places, which can make the code very confusing, so I recommend that you configure all the loggers you will use in a single file.

Since version 1.3.4, you can get the same Logger as the LogManager.getLogger by passing the same class name to LogManager.getLogger. The following example shows how you can take advantage of this feature to make your code look more elegant.

```ts:line-numbers
// LoggerConfig.ets
import { LogManager, Level, TCPSocketAppender } from '@pie/log4a';

export function InitializeAllLoggers(logFilePath: string) {
  // Must call LogManager.setLogFilePath before creating Appender instances; otherwise appenders cannot directly use a file name as the path.
  LogManager.setLogFilePath(logFilePath);
  const socketAppender = new TCPSocketAppender({
    address: '114.xxx.xxx.xxx',
    port: 1234,
    name: 'socket',
    level: Level.ALL
  });
  LogManager.getLogger('Index')//The passed name must match the class name
    .addFileAppender('logFile.log', 'mainLoggerOfIndex', Level.ALL, {
      useWorker: true
    })
    .bindAppender(socketAppender);
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
import { LogManager } from '@pie/log4a';

export default class EntryAbility extends UIAbility {
  onCreate(want: Want, launchParam: AbilityConstant.LaunchParam): void {
    hilog.info(0x0000, 'testTag', '%{public}s', 'Ability onCreate');
    InitializeAllLoggers(this.context.filesDir);
  }

  onDestroy(): void {
    hilog.info(0x0000, 'testTag', '%{public}s', 'Ability onDestroy');
    LogManager.terminate();
  }
  //...Other code
}
```

```typescript:line-numbers
// Index.ets
import { LogManager, Logger, Level } from '@pie/log4a';
import { LogView, LogViewMode, LogViewColorConfig } from '@pie/log4a/src/main/ets/components/LogView';

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
            appender: 'mainLoggerOfIndex',
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

## Define the append uniformly

Defining the append in a single file and exporting it for use by other modules can improve the maintainability of your code. You can refer to the following code:

This code shows how to specify log file storage folders in the onCreate lifecycle of EntryAbility

```typescript:line-numbers {11,16}
// EntryAbility.ets
import { AbilityConstant, UIAbility, Want } from '@kit.AbilityKit';
import { hilog } from '@kit.PerformanceAnalysisKit';
import { window } from '@kit.ArkUI';

import { LogManager } from '@pie/log4a';

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
> Because the file path needs to be obtained from Context, if you want to define all file appenders in one place, call `LogManager.setLogFilePath` in `EntryAbility.onCreate` to preset the log file directory. Then, when defining file appenders, pass only the file name as the `path` argument.

This code shows how to define all the apenders in one file and export them:

```typescript:line-numbers
import { FileAppender, Level, TCPSocketAppender } from '@pie/log4a';

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

This code shows how to import and use a defined append in a file

```typescript:line-numbers
import {
  LogManager,
  Logger,
  TraceEntry,
  TraceExit,
  MarkerManager,
  TracedStr,
  MarkedTracedStr,
  Level
} from '@pie/log4a';
import { LogView, LogViewMode, LogViewColorConfig } from '@pie/log4a/src/main/ets/components/LogView';
import { fileAppender_a, socketAppender } from './socketAppenderConstants';

@Entry
@Component
struct Index {
  @State message: string = 'Hello World';
  @State logger: Logger = LogManager.getLogger(this)
    .bindAppender(fileAppender_a)
    .bindAppender(socketAppender);
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

## Configure multiple Loggers more conveniently <Badge type="tip" text="1.5.4 +" />

Since log4a is a multi-Logger design, when multiple different Loggers need to bind the same appender, to avoid duplicate code, starting from version 1.5.4 you can use `LogManager.bindAppenderGlobally` to bind an appender to all Loggers at once.

The following example first calls `registerLogger` to register Logger instances, then chains `bindAppenderGlobally` to add multiple appenders to all Loggers.

```typescript:line-numbers
import { LogManager, TCPSocketAppender, FileAppender, ConsoleAppender, PatternLayout, Level } from '@pie/log4a';

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
  // Register all Loggers and bind appenders here
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
