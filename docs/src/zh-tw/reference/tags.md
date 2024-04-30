# 标签

为帮助开发者快速获得有效信息，Log4a提供了两种标签用于追踪属性函数运行情况。

## `TracedStr`

置于模板字符串前，用于跟踪模板字符串的构建参数

## `MarkedTracedStr(mark)`

- `mark` string - 标签名

置于模板字符串前，用于跟踪模板字符串的构建参数，输出日志中包含`mark`，利于搜索

> [!IMPORTANT]
> 这两者的区别是，`TracedStr`是标签，可以直接使用，而`MarkedTracedStr`是一个函数，需要传入一个标签名。
