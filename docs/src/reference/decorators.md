# 装饰器

为帮助开发者快速获得有效信息，Log4a提供了多种装饰器与辅助工具，用于追踪函数运行和模板字符串构建情况。

## `@TraceEntry`

用于追踪函数入参

## `@TraceExit`

用于追踪函数运行结果

## `TracedStr`

用于跟踪字符串模板构造过程

## `MarkedTracedStr(marker:string = "Anonymous")`

用于跟踪字符串模板构造过程，输出日志带标签