# Log4a

> 轻量、易集成、易使用，有时甚至可以不需写代码的HarmonyOS log系统，灵感来自log4j。

### Log4a文档

> 本README受篇幅限制，新特性将不再在此处介绍，有关Log4a功能详情，请查阅文档。
> 文档网站支持在线体验并运行Log4a(仅限Github站)

- [Github站(推荐)](https://ericple.github.io/log4a/)
- [AtomGit站](https://ericple.atomgit.net/log4a-docs/)

## 特点

- 支持TS工程引入
- 提供日志装饰器，无需自己配置log4a，自动跟踪函数调用情况
- 使用fatal、error输出时，支持打印调用堆栈
- 支持日志输出到文件，利用多线程特性，提高日志输出到文件的性能
- 格式化日志输出，借鉴log4j，贴合使用习惯
- Logger统一管理，降低内存占用
- 支持格式化打印对象
- 通过设置日志级别，提供日志过滤服务
- 支持日志加密写出到文件
- 支持配置日志文件最大容量，溢出后新建日志文件
- 支持配置日志文件备份数量，溢出后滚动删除

>
由于ohpm中心仓库审核需要时间，若您遇到恶性bug但中心仓库未提供更新，请先移步[log4a代码仓库](https://gitee.com/ericple/log4a)
检查是否存在新版本，若没有，您可以[新建issue](https://gitee.com/ericple/log4a/issues/new)
，或[向我发送邮件](mailto:dev@peercat.cn)，我将尽快修复。

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

- 带标记的日志

对于一些匿名输出，可以通过添加标记的方式便于在日志中进行搜索，例如：

```typescript
LogManager.anonymous().withMarker(MarkerManager.getMarker("我是一个Marker")).info('这是带Marker的日志');
```

### 追踪器

log4a设计了追踪器，它可以帮你跟踪函数运行参数、函数运行结果、模板字符串的构造。

可用的追踪器：

#### `@TraceEntry`

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

#### `@TraceExit`

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

#### `TracedStr`

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

#### `MarkedTracedStr`

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

### Appender

Appender为Logger提供日志输出能力，分为两种类型：`FileAppender`、`ConsoleAppender`。
新建Logger时，将自动提供一个ConsoleAppender。Appender无法直接被创建，只能通过调用Logger实例下的`addFileAppender`
或`addConsoleAppender`来创建并绑定到该Logger.

#### ConsoleAppender

`ConsoleAppender`提供向控制台输出日志的能力，每个Logger在创建时，就会带有一个`ConsoleAppender`，无需手动添加。
一个Logger最多只能拥有一个`ConsoleAppender`，当您向Logger添加`ConsoleAppender`时，若已存在，则该appender不会被添加至Logger。

- 添加一个ConsoleAppender

```typescript
// this.logger是一个Logger的实例
this.logger.addConsoleAppender(Level.INFO);
```

- 移除ConsoleAppender

```typescript
this.logger.removeTypedAppender(AppenderTypeEnum.CONSOLE);
```

- 获取当前Session的历史日志

```typescript
this.logger.getHistoryOfAppender(AppenderTypeEnum.CONSOLE);
```

#### FileAppender

`FileAppender`提供向文件输出日志的能力。
一个Logger可以有多个FileAppender，如果有多个FileAppender指向同一个文件，则这些FileAppender将会共用一个文件对象。

##### 添加一个FileAppender

```typescript
this.logger.addFileAppender('/file/log.log', 'mainAppender', Level.INFO);
```

##### 删除一个FileAppender

```typescript
this.logger.removeNamedAppender('mainAppender');
```

##### 获取当前Session的历史日志(从本次开启应用开始)

```typescript
const history = this.logger.getHistoryOfAppender('mainAppender');
```

##### 获取所有历史日志(从首次安装并启动应用开始，每次应用销毁后更新，下次继续累计)

```typescript
const history = this.logger.getAllHistoryOfAppender('mainAppender');
```

##### 开启多线程支持

```typescript
this.logger.addFileAppender('/file/log.log', 'mainAppender', Level.INFO, {
  useWorker: true
});
```

##### 配置最大日志备份文件数量

```typescript
this.logger.addFileAppender('/file/log.log', 'mainAppender', Level.INFO, {
  maxCacheCount: 10
});
```

##### 配置最大日志容量

```typescript
this.logger.addFileAppender('/file/log.log', 'mainAppender', Level.INFO, {
  maxFileSize: 10 // 最大10KB
});
```

### 日志级别

为了帮助使用者更容易地从日志中提取有用的信息，log4a引入了日志级别的概念。
Logger和Appender都可以附带日志级别，log4a对Logger的日志等级的处理优先于对appender的日志等级的处理，举例如下：

```typescript
this.logger.setLevel(Level.ERROR);
this.logger.addFileAppender("/path/to/log.log", "mainFileAppender", Level.INFO);
```

在这个例子中，由于添加的FileAppender日志级别为`INFO`，高于Logger的日志级别`ERROR`，此时`WARN`级别的日志无法送达Appender。

(日志等级排序为：OFF<FATAL<ERROR<WARN<INFO<DEBUG<TRACE<ALL)

### 退出应用时的处理

在退出应用时，使用者应当在Ability的onDestroy生命周期中调用`LogManager.terminate()`来销毁Logger及Appender实例。

### 约束与限制

在下述版本验证通过：DevEco Studio NEXT Developer Preview 2 (4.1.3.700), SDK: API11 (4.1.0(11))
> 本库理论上支持所有API版本

### 贡献代码

- [提交Issue](https://gitee.com/ericple/log4a/issues/new)
- [发起Pull Request](https://gitee.com/ericple/ohos-weather/pull/new)

### 开源协议

本项目使用[Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0.txt)。