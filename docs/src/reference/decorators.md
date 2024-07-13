# 装饰器

为帮助开发者快速获得有效信息，Log4a提供了两种装饰器用于追踪属性函数运行情况。

## `@TraceEntry`

用于追踪函数入参

## `@TraceExit`

用于追踪函数运行结果

## `@TraceTime`

用于追踪函数运行时间

## `TracedStr`

用于跟踪字符串模板构造过程

## `MarkedTracedStr(marker:string = "Anonymous")`

用于跟踪字符串模板构造过程，输出日志带标签