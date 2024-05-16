# Implement the Appender

All appenders inherit from the same abstract class AbstractAppender, and developers can implement key methods themselves and bind them to Logger using the addAppender method in Logger.

## Life cycle of Appender

The adder has the following cycles

`onLog(level, tag, time, count, message)`

- `level` Level - Log level
- `tag` string - Name of the class to which the log belongs
- `time` number - Indicates the log printing time stamp
- `count` number - The count log processed by this Appender
- `message` string - Log content

When logs are recorded, the onLog method of the adder is called by the Logger, and the developer can implement the logging function by himself.

`onTerminate()`

When the append is terminated, the onTerminate method is called by the Logger, where the developer should reclaim memory that is no longer in use or unsubscribe from unnecessary events.

## Instance

This example implements a minimal append to output logs to the console

```ts
class SimpleAppenderClass extends AbstractAppender {
    onLog(level: Level, tag: string, time: number, count: number, message: string): void {
        console.log(message);
    }
    onTerminate(): void {
        return;
    }
}
export const SimpleAppender = new SimpleAppenderClass;
```

```ts
import { SimpleAppender } from './file.ets';
import { Logger, LogManager } from '@pie/log4a';

class SomeClass {
    logger: Logger = LogManager.getLogger(this).addAppender(SimpleAppender);
}
```

## Try it

<script setup>
import {defineAsyncComponent} from 'vue';
import {inBrowser} from 'vitepress';

const DemoEditor = inBrowser ?  defineAsyncComponent(()=>import('.. /components/DemoEditor.vue')):()=>null;
</script>

<DemoEditor code="class SimpleAppenderClass extends AbstractAppender {
onLog(level, tag, time, count, message) {
console.log(message);
}
onTerminate() {
return;
}
}
const SimpleAppender = new SimpleAppenderClass;
class SomeClass {
logger = LogManager.getLogger(this).addAppender(SimpleAppender);
hello(){
this.logger.info('Hello, World! ')
}
}
const someClassInstance = new SomeClass;
someClassInstance.hello();"  />