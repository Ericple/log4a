<script setup>
import {defineAsyncComponent} from 'vue';
import {inBrowser} from 'vitepress';

const DemoEditor = inBrowser ? defineAsyncComponent(()=>import('../../components/DemoEditor.vue')):()=>null;
</script>
# Playground

## Experience Log4a

Open the browser console and see the results of the code run

<DemoEditor height='700px' code="const logger = LogManager.getLogger('Index');
logger.info('Hello world!')" runBtnStr='Run in browser (Please, open your browser console manually)' />