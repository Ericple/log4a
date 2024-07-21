<script setup>
import {defineAsyncComponent} from 'vue';
import {inBrowser} from 'vitepress';

const DemoEditor = inBrowser ? defineAsyncComponent(()=>import('../components/DemoEditor.vue')):()=>null;
</script>

# Playground

## 体验Log4a

> [!WARNING]
> 受部分dependencies限制，浏览器演练场无法反映HarmonyOS或OpenHarmony的实际表现，仅能作为开发者提供基本使用方法的训练使用。

打开浏览器控制台，并查看代码运行结果
<DemoEditor height='700px' code="const logger = LogManager.getLogger('Index');
logger.info('Hello world!')" />