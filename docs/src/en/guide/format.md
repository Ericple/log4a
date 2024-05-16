# Log message construction

Developers can insert slots into the log format to implant variables.

## slot

The developer can add '{}' to the log message, and all '{}' will be replaced by a variable passed immediately after format.

Such as:

```ts
import { LogManager } from '@pie/log4a';
const logger = LogManager.anonymous();
let var1 = 'log variable';
let var2 = 'log variable 2'
logger.info('this is a log, and this is a {}, this is also a {}', var1, var2);
```

```bash output
this is a log, and this is a log variable, this is also a log variable 2
```

> [!INFO]
> If there are more variables than slots, Log4a will print an additional row of FATAL logs

## Socket handling of variables

When Log4a deals with slots and variables, it tries to convert all variables to strings. If 'Log4a' cannot convert an object to a string, it is converted to the name attribute under the object constructor.

When an object can be converted to JSON, 'Log4a' will format the converted JSON string of the object, such as:

```ts
class jobj {
    value_a: number = 0;
    value_b: string = 'This is json class';
}

const a = new jobj;

LogManager.anonymous().info('value of a = {}', a);
```

```bash output
value of a = 
{
    value_a: 0,
    value_b: 'This is json class'
}
```

<script setup>
import {defineAsyncComponent} from 'vue';
import {inBrowser} from 'vitepress';

const DemoEditor = inBrowser ? defineAsyncComponent(()=>import('../components/DemoEditor.vue')):()=>null;
</script>

## Have a try

<DemoEditor code='class jobj {
    value_a = 0;
    value_b = "This is json class";
}
const a = new jobj;
LogManager.anonymous().info("value of a = {}", a);' />