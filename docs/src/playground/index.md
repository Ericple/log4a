<script setup>
import {defineAsyncComponent} from 'vue';
import {inBrowser} from 'vitepress';

const DemoEditor = inBrowser ? defineAsyncComponent(()=>import('../components/DemoEditor.vue')):()=>null;
</script>
# Playground

## 体验Log4a

打开浏览器控制台，并查看代码运行结果
<DemoEditor height='700px' code="const logger = LogManager.getLogger('Index');
logger.info('Hello world!')" />