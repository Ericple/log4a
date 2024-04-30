# Log4a 是什么?

Log4a是一个ArkTS/TypeScript使用的日志库，为高性能、简单易用为宗旨而设计。

只是想尝试一下？跳到[快速开始](/guide/getting-started)

[![Ericple/log4a](https://gitee.com/ericple/log4a/widgets/widget_card.svg?colors=4183c4,ffffff,ffffff,e3e9ed,666666,9b9b9b)](https://gitee.com/ericple/log4a)

## 使用场景

- ### 开发时debug

开发者可以在开发阶段集成Log4a，通过生成日志、追踪函数运行，帮助获取应用运行信息，并快速定位问题。

- ### 应用上线后进行日志收集

借助Log4a设计精妙的日志输出能力，开发者可以将日志输出到一个或多个文件，并通过一定手段将日志上传到服务器用于分析应用运行情况。

## 性能

- 支持多线程的文件输出

开发者可以在绑定FileAppender时选择是否开启多线程工作模式，开启后，日志写出将会由一个Worker完成，且通过Worker的共享，多个多线程Appender将共用一个ThreadWorker，为应用高并发预留更多可用线程。

- 统一管理的文件，降低内存压力

对于多个Logger绑定的FileAppender指向同一个File的情况，Log4a从设计上避免了重复的对象实例化，FileAppender同一线程下对于同一个文件是唯一的，也就是说，多个Logger如果指向同一个文件，则它们会绑定相同的FileAppender。简单来说，一个FileAppender可以被多个Logger绑定，并执行日志输出任务。