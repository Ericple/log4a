# 日志消息构建

开发者可以向日志format中插入插槽来植入变量。

## 插槽

开发者在日志消息中可添加`{}`，所有的`{}`都会被紧随format传入的变量所替代。

如：

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
> 如果变量数量比插槽多，`Log4a`会额外打印一行FATAL级日志进行提示

## 插槽对变量的处理

当`Log4a`处理插槽和变量时，会尝试把所有变量转换成字符串。如果`Log4a`无法将对象转换为字符串，则会转换为对象构造器下的name属性。

当对象可以被转换为JSON时，`Log4a`将会格式化对象转换后的JSON字符串，如：

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