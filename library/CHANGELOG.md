# 1.2.0-rc.1

- 优化了对象输出的支持

# 1.2.0

- 修复了新增的FileAppender和ConsoleAppender默认不输出的问题
- 增加了日志文件输出的多线程支持

# 1.1.1

2024-04-23

- 修复了默认ConsoleAppender不输出的问题

# 1.1.0

2024-04-22

- 对文档做出了一些调整
- 新增Appender，支持以下特性
    - 当前session历史日志获取
    - 所有历史日志获取
    - 日志定向输出到文件
- 新增匿名logger获取函数`LogManager.anonymous`
- 新增logger销毁函数，在不必要时可终止log输出

# 1.0.0

2024-04-20

- 初始发布