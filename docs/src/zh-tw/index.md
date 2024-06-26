---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Log4a"
  text: "優雅、易用的HarmonyOS日誌庫"
  tagline: "Designed for HarmonyOS"
  image:
    src: log4a_banner@1x.svg
    alt: Log4a
  actions:
    - theme: brand
      text: 什麼是Log4a?
      link: /guide/what-is-log4a
    - theme: alt
      text: 快速開始
      link: /guide/getting-started
    - theme: alt
      text: Gitee
      link: https://gitee.com/ericple/log4a

features:
  - title: 使用裝飾器和標籤
    details: 使用@TraceEntry、@TraceExit等裝飾器，在不需要自行編寫log代碼的情況下追蹤函數運行情況
  - title: 支持調用堆棧打印
    details: 當輸出Error/Fatal級別日誌時，支持打印調用堆棧，分析日誌更加清晰，幫助定位問題根源
  - title: 多線程文件輸出
    details: 對輸出線程進行統一管理，提供高性能日誌輸出體驗
  - title: 日誌加密
    details: 通過自定義加密函數，將輸出到文件的日誌流加密，保護日誌安全
---


