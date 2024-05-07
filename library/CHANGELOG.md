# 1.3.1 (2024-05-07)

- 新增：`DailyRollingFileAppender` - 提供每日滚动日志记录能力
- 新增：`RollingFileAppender` - 提供滚动文件日志记录能力
- 新增：`TCPSocketAppender` - 提供TCP协议服务器日志记录能力
- 优化：修改了部分变量名称以更易阅读
- 优化：现在开发者可以实例化Appender

# 1.3.0 (2024-05-01)

- 修复了使用多线程导致性能下降的意外错误
- 文档已发布，[点此查看](https://ericple.github.io/log4a/)

# 1.3.0-rc.1

- 新增日志文件最大占用配置，超过占用则创建备份，并创建新日志文件
- 新增日志文件最大备份数量配置，超过则删除最早的备份文件
- 新增LogView组件，提供日志格式化展示能力
- 新增日志输出文件时加密，提高日志文件安全性
- 支持自定义日志等级
- 优化：在执行LogManager.terminate()后，FileAppender线程将终止
- 优化：现在一个日志文件绑定一个FileAppender，不再有多个FileAppender同时绑定同一日志文件的情况

# 1.2.1

- 调用error或fatal输出时，支持打印堆栈
- 新增Level导出，优化导入语句

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