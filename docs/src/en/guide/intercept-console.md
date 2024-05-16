# log intercept <Badge type="tip" text="1.3.3 +" />

If you already use console.log for logging output in your application, you can intercept it through the Log4a API and redirect it to the Log4a ConsoleAppender.

Developers only in onCreate EntryAbility call ` that the LogManager. InterceptConsole ` ().

> [!WARNING]
> At present, this function only supports intercepting console.log and does not support error/warn/debug output

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
    LogManager.interceptConsole();//enable console intercept
  }

  onDestroy(): void {
    hilog.info(0x0000, 'testTag', '%{public}s', 'Ability onDestroy');
    LogManager.terminate();
  }
  //...other code
}
```

## Have a try

<script setup>
import {defineAsyncComponent} from 'vue';
import {inBrowser} from 'vitepress';

const DemoEditor = inBrowser ? defineAsyncComponent(()=>import('../components/DemoEditor.vue')):()=>null;
</script>

<DemoEditor code="
LogManager.interceptConsole();
console.log('Hello World!');" />