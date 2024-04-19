# Log4a

> 轻量、易集成、易使用，有时甚至可以不需写代码的HarmonyOS log系统，灵感来自log4j。

## 安装

- 使用 `ohpm` 以安装 `@pie/log4a`

```bash
ohpm install @pie/log4a
```

对于其他安装方式, 请参考 [这篇文章](https://ohpm.openharmony.cn/#/cn/help/downloadandinstall).

## 使用

### 通用流程

- 获取logger

使用`LogManager.getLogger(context)`获取当前对象的可用Logger。该方法传入`this`即可。

```typescript
import { LogManager, Logger } from '@pie/log4a';

class LogTestClass {
  private logger: Logger = LogManager.getLogger(this);
  // ... Other code
}
```

- 使用logger

获取logger后，即可开始打印日志：

```typescript
import { LogManager, Logger } from '@pie/log4a';

class LogTestClass {
  private logger: Logger = LogManager.getLogger(this);

  add(a: number, b: number) {
    this.logger.info('calculating {} + {}', a, b);
    return a + b;
  }
}

const adder = new LogTestClass;
adder.add(1, 2);
```

上面这段代码在执行之后，会打印出这样一条日志

```bash
[INFO ] 2024-04-19  23:32:54.746  [LogTestClass:1]  calculating 1 + 2
```

可以看到，log4a打印出的日志中包含了以下信息：

- 日志级别
- 日志时间
- 日志来源
- 日志内容

> ### 日志来源
> 当logger属于class或struct时：
>
> 对于非静态logger，日志来源为class或struct的名称
>
> 对于静态logger，日志来源为Function
> ```typescript
> import { LogManager, Logger } from '@pie/log4a';
> class StaticLogger {
>   private static logger: Logger = LogManager.getLogger(this);
>   static hello() {
>     StaticLogger.logger.info("Hello from static logger");
>   }
> }
> ```
> 这段代码将会打印：
> ```bash
> [INFO ] 2024-04-19  23:32:54.746  [Function:1]  Hello from static logger
> ```

### 追踪器

log4a设计了追踪器，它可以帮你跟踪函数运行参数、函数运行结果、模板字符串的构造。

可用的追踪器：

- `@TraceEntry`：用于跟踪函数运行参数，示例如下：

```typescript
import { TraceEntry } from '@pie/log4a';

class TestClass {
  @TraceEntry
  add(a: number, b: number): number {
    return a + b;
  }
}

const t = new TestClass;
t.add(1, 2);
```

虽然没有写任何的log代码，但这段代码在运行后仍然会出现如下log：

```bash
[TRACE]	2024-04-20 00:19:43.24	[TestClass:1]	Method: [add] called with arguments [1,2]
```

这意味着，使用@TraceEntry装饰的函数将会被追踪，每当它被调用时，log4a都会打印一条日志，该日志包含该函数名称及本次调用传入的参数。

- `@TraceExit`：用于跟踪函数运行结果，示例如下：

```typescript
import { TraceExit } from '@pie/log4a';

class TestClass {
  @TraceExit
  add(a: number, b: number): number {
    return a + b;
  }
}

const t = new TestClass;
t.add(1, 2);
```

虽然没有写任何的log代码，但这段代码在运行后仍然会出现如下log：

```bash
[TRACE]	2024-04-20 00:19:43.24	[TestClass:1]	Method: [add] exited with result: 3
```

这意味着，使用@TraceExit装饰的函数将会被追踪，每当它被调用时，log4a都会打印一条日志，该日志包含该函数名称及本次调用返回的结果。

- `TracedStr`：用于跟踪字符串模板的构建过程，示例如下：

```typescript
import { TracedStr } from '@pie/log4a';

class TestClass {
  param1: string = 'param1';
  param2: string = 'param2';
  str: string = TracedStr`build with ${this.param1} and ${this.param2}`;
}

const t = new TestClass;
```

虽然没有写任何的log代码，但这段代码在运行后仍然会出现如下log：

```bash
[INFO ]	2024-04-20 00:27:51.989	[Anonymous:1]	built with format: ["build with "," and ",""] and args: ["param1","param2"] (Anonymous)
```

注意，TracedStr是标签而不是装饰器，因此不需要`@`前导。

- `MarkedTracedStr`：为了方便使用者追踪特定的模板字符串构建，使用此标签并传入一个字符串作为标记

```typescript
import { MarkedTracedStr } from '@pie/log4a';

class TestClass {
  param1: string = 'param1';
  param2: string = 'param2';
  str: string = MarkedTracedStr("StrBuilder")`build with ${this.param1} and ${this.param2}`;
}

const t = new TestClass;
```

虽然没有写任何的log代码，但这段代码在运行后仍然会出现如下log：

```bash
[INFO ]	2024-04-20 00:33:31.793	[Anonymous:2]	built with format: ["build with "," and ",""] and args: ["param1","param2"] (StrBuilder)
```

注意，`MarkedTracedStr`是函数而不是标签，需要传入一个参数。

### 约束与限制

在下述版本验证通过：DevEco Studio NEXT Developer Preview 2 (4.1.3.700), SDK: API11 (4.1.0(11))
> 本库理论上支持所有API版本

### 贡献代码

- [提交Issue](https://gitee.com/ericple/log4a/issues/new)
- [发起Pull Request](https://gitee.com/ericple/ohos-weather/pull/new)

### 开源协议

本项目使用[Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0.txt)。