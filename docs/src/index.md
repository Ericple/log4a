---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Log4a"
  text: "优雅、易用的HarmonyOS日志库"
  tagline: "Designed for HarmonyOS"
  image:
    src: log4a_banner@1x.svg
    alt: Log4a
  actions:
    - theme: brand
      text: 什么是Log4a?
      link: /guide/what-is-log4a
    - theme: alt
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: Gitee
      link: https://gitee.com/ericple/log4a

features:
  - title: 使用装饰器和标签
    details: 使用@TraceEntry、@TraceExit等装饰器，在不需要自行编写log代码的情况下追踪函数运行情况
  - title: 支持调用堆栈打印
    details: 当输出Error/Fatal级别日志时，支持打印调用堆栈，分析日志更加清晰，帮助定位问题根源
  - title: 多线程文件输出
    details: 对输出线程进行统一管理，提供高性能日志输出体验
  - title: 日志加密
    details: 通过自定义加密函数，将输出到文件的日志流加密，保护日志安全
---


