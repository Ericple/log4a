# 拦截console.log <Badge type="tip" text="1.3.3 +" />

如果开发者已经在应用中使用了console.log进行日志输出，可以通过Log4a的API对其进行拦截，并重定向至Log4a的ConsoleAppender。

开发者仅需在EntryAbility的onCreate中调用`LogManager.interceptConsole()`即可。

> [!WARNING]
> 该功能目前仅支持拦截console.log，不支持error/warn/debug等输出

```ts
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
    LogManager.interceptConsole();//开启console拦截
  }

  onDestroy(): void {
    hilog.info(0x0000, 'testTag', '%{public}s', 'Ability onDestroy');
    LogManager.terminate();
  }
  //...其他代码
}
```

## 尝试一下

<script setup>
import DemoEditor from '../components/DemoEditor.vue';
</script>

<DemoEditor code="
LogManager.interceptConsole();
console.log('Hello World!');" />