# Getting started

## Installation

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- [Huawei DevEco Studio](https://gitee.com/openharmony/docs/blob/master/zh-cn/release-notes/OpenHarmony-v4.1-release.md#%E9%85%8D%E5%A5%97%E5%85%B3%E7%B3%BB) 4.1 Release or later
- OpenHarmony/ HarmonyOS SDK

It is recommended to use ohpm to install the latest release of log4a directly from the OpenHarmony repository

::: code-group

```bash [ohpm]
ohpm install @pie/log4a
```

:::

## Print your first log with Log4a

Log4a is easy to use in many ways, the most prominent feature is the automatic formatting of logs, to take advantage of this feature, you only need to do this:

```typescript:line-numbers {6,9}
import { LogManager, Logger } from '@pie/log4a';

@Entry
@Component
struct MainPage {
    logger: Logger = LogManager.getLogger(this);
    world: string = 'world'
    aboutToAppear() {
        this.logger.info('Hello {}!', this.world);
    }
    build() {
        // ... Your code here
    }
}
```

**Output**

```
[INFO ]	2024-04-30 15:27:29.809	[MainPage:1]	Hello world!
```

> [!TIP]
> We simplified the output information into the following, and explained each content separately:
>
> ```
> [a] b [c:d] e
> ```
>
> - a log level
> - b log print timestamp
> - c log context name
> - d This log is item d of the context to which the log belongs
> - e log content