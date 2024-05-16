---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Log4a"
  text: "Elegant, easy-to-use HarmonyOS log library"
  tagline: "Designed for HarmonyOS"
  image:
    src: ../log4a_banner@1x.svg
    alt: Log4a
  actions:
    - theme: brand
      text: What is Log4a?
      link: /en/guide/what-is-log4a
    - theme: alt
      text: Quick start
      link: /en/guide/getting-started
    - theme: alt
      text: Github
      link: https://github.com/ericple/log4a

features:
  - title: Use decorators and labels
    details: Use decorators like @TraceEntry and @TraceExit to track functions without having to write your own log code
  - title: Support for call stack printing
    details: When logs of the Error/Fatal level are generated, call stacks can be printed to facilitate clear log analysis and help locate faults
  - title: Multithreaded file output
    details: Manage output threads in a unified manner, providing high-performance log output experience
  - title: Log encryption
    details: You can customize the encryption function to encrypt the log flow output to the file to protect log security
---


