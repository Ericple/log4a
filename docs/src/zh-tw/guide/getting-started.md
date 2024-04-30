# 快速开始

## 安装

## 前置准备

- [Node.js](https://nodejs.org/) 18及以上版本
- [Huawei DevEco Studio](https://gitee.com/openharmony/docs/blob/master/zh-cn/release-notes/OpenHarmony-v4.1-release.md#%E9%85%8D%E5%A5%97%E5%85%B3%E7%B3%BB) 4.1 Release及以上版本
- OpenHarmony/ HarmonyOS SDK

推荐使用ohpm，从OpenHarmony三方库中心仓直接安装log4a的最新发行版本

::: code-group

```bash [ohpm]
ohpm install @pie/log4a
```

:::

## 打印第一行日志

Log4a的易用体现在很多方面，最突出的一个特点就是自动格式化日志，要利用这个特点，你只需要这么做：

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

**输出**

```
[INFO ]	2024-04-30 15:27:29.809	[MainPage:1]	Hello world!
```

> [!TIP]
> 我们把输出的信息简化成以下内容，并对各个内容分别进行解释：
>
> ```
> [a] b [c:d] e
> ```
>
> - a 日志等级
> - b 日志打印时间
> - c 日志来源（所属上下文）
> - d 该日志为日志所属上下文的第d条日志
> - e 日志内容