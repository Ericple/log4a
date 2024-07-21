import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Log4a",
  description: "优雅、易用的HarmonyOS日志库",
  base: '/log4a/',
  cleanUrls: true,
  head: [
    ['link', { rel: "icon", type: "image/png", sizes: "16x16", href: "log4a@1x.svg" }]
  ],
  locales: {
    root: {
      label: '简体中文',
      lang: 'zh'
    },
    // en: {
    //   label: 'English',
    //   lang: 'en',
    //   themeConfig: {
    //     nav: [
    //       { text: 'Guide', link: '/en/guide/getting-started' },
    //       { text: 'Reference', link: '/en/reference/log-manager' },
    //       { text: 'Playground', link: '/en/playground/index' },
    //       {
    //         text: '1.5.1',
    //         items: [
    //           {
    //             text: 'CHANGELOG',
    //             link: 'https://gitee.com/ericple/log4a/blob/master/library/CHANGELOG.md'
    //           }
    //         ]
    //       }
    //     ],
    //     footer: {
    //       message: 'Released under Apache License 2.0.',
    //       copyright: 'Copyright ©️ 2024-present Tingjin Guo | Stands with people of Palestine'
    //     },
    //     sidebar: {
    //       '/en/guide/': [
    //         {
    //           text: 'Intro',
    //           items: [
    //             { text: 'What is Log4a?', link: '/en/guide/what-is-log4a' },
    //             { text: 'Getting started', link: '/en/guide/getting-started' },
    //             { text: 'Appender', link: '/en/guide/appender' }
    //           ],
    //           collapsed: false
    //         },
    //         {
    //           text: 'Logging',
    //           items: [
    //             {
    //               text: 'The parameter takes precedence',
    //               link: '/en/guide/parameter-priority'
    //             },
    //             {
    //               text: 'Using multithreaded output',
    //               link: '/en/guide/log-with-worker'
    //             },
    //             {
    //               text: 'Log message construction',
    //               link: '/en/guide/format'
    //             }
    //           ]
    //         },
    //         {
    //           text: 'Advanced usage',
    //           items: [
    //             {
    //               text: 'Customize your appender',
    //               link: '/en/guide/custom-appender'
    //             },
    //             {
    //               text: 'Log to your server',
    //               link: '/en/guide/log-to-socket'
    //             },
    //             {
    //               text: 'Customize log layout',
    //               link: '/en/guide/custom-layout'
    //             },
    //             {
    //               text: 'Console intercept',
    //               link: '/en/guide/intercept-console'
    //             },
    //             {
    //               text: 'Best practice',
    //               link: '/en/guide/best-practice'
    //             },

    //           ]
    //         },
    //         {
    //           text: 'API Reference',
    //           link: '/en/reference/log-manager'
    //         }
    //       ],
    //       '/en/reference/': [
    //         {
    //           text: 'API Reference',
    //           items: [
    //             { text: 'LogManager', link: '/en/reference/log-manager' },
    //             { text: 'Logger', link: '/en/reference/logger' },
    //             { text: 'MarkerManager', link: '/en/reference/marker-manager' },
    //             { text: 'Level', link: '/en/reference/level' },
    //             {
    //               text: 'Appenders',
    //               items: [
    //                 { text: 'AbstractAppender', link: '/en/reference/abstract-appender' },
    //                 { text: 'FileAppender', link: '/en/reference/file-appender' },
    //                 { text: 'RollingFileAppender', link: '/en/reference/rolling-file-appender' },
    //                 { text: 'DailyRollingFileAppender', link: '/en/reference/daily-rolling-file-appender' },
    //                 { text: 'TCPSocketAppender', link: '/en/reference/tcp-socket-appender' },
    //                 { text: 'UDPSocketAppender', link: '/en/reference/udp-socket-appender' }
    //               ]
    //             }
    //           ],
    //           collapsed: false
    //         },
    //         {
    //           text: 'Decorators and labels',
    //           items: [
    //             {
    //               text: 'Decorators',
    //               link: '/en/reference/decorators'
    //             },
    //             {
    //               text: 'Labels',
    //               link: '/en/reference/tags',
    //               collapsed: false
    //             }
    //           ],
    //           collapsed: false
    //         }
    //       ]
    //     },
    //   }
    // },
    // 'zh-tw': {
    //   label: '繁体中文',
    //   lang: 'zh-tw',
    //   themeConfig: {
    //     nav: [
    //       { text: '指南', link: '/guide/getting-started' },
    //       { text: '參考', link: '/reference' }
    //     ],
    //     sidebar: {
    //       '/guide/': [
    //         {
    //           text: '简介',
    //           items: [
    //             { text: '什么是Log4a?', link: '/guide/what-is-log4a' },
    //             { text: '快速开始', link: '/guide/getting-started' },
    //             { text: '追加器', link: '/guide/appender' }
    //           ],
    //           collapsed: false
    //         },
    //         {
    //           text: 'API參考',
    //           link: '/reference/log-manager'
    //         }
    //       ],
    //       '/reference/': [
    //         {
    //           text: 'API參考',
    //           items: [
    //             { text: 'LogManager', link: '/reference/log-manager' },
    //             { text: 'Logger', link: '/reference/logger' },
    //             { text: 'MarkerManager', link: '/reference/marker-manager' }
    //           ],
    //           collapsed: false
    //         },
    //         {
    //           text: '裝飾器和標籤',
    //           items: [
    //             {
    //               text: '裝飾器',
    //               link: '/reference/decorators'
    //             },
    //             {
    //               text: '標籤',
    //               link: '/reference/tags',
    //               collapsed: false
    //             }
    //           ],
    //           collapsed: false
    //         }
    //       ]
    //     },
    //     footer: {
    //       message: '以 Apache License 2.0 許可證發佈',
    //       copyright: 'Copyright ©️ 2024-至今 郭挺劲'
    //     },

    //   }
    // }
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '指南', link: '/guide/getting-started' },
      { text: '参考', link: '/reference/log-manager' },
      { text: '演练场', link: '/playground/index' },
      {
        text: '1.5.3',
        items: [
          {
            text: '更新日志',
            link: 'https://gitee.com/ericple/log4a/blob/master/library/CHANGELOG.md'
          }
        ]
      }
    ],

    sidebar: {
      '/guide/': [
        {
          text: '简介',
          items: [
            { text: '什么是Log4a?', link: '/guide/what-is-log4a' },
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '追加器', link: '/guide/appender' }
          ],
          collapsed: false
        },
        {
          text: '输出日志',
          items: [
            {
              text: '参数作用优先级',
              link: '/guide/parameter-priority'
            },
            {
              text: '使用多线程输出',
              link: '/guide/log-with-worker'
            },
            {
              text: '日志消息构建',
              link: '/guide/format'
            }
          ]
        },
        {
          text: '进阶使用',
          items: [
            {
              text: '自定义追加器',
              link: '/guide/custom-appender'
            },
            {
              text: '输出到服务器',
              link: '/guide/log-to-socket'
            },
            {
              text: '输出到邮箱',
              link: '/guide/log-to-your-mailbox'
            },
            {
              text: '自定义布局',
              link: '/guide/custom-layout'
            },
            {
              text: 'console拦截',
              link: '/guide/intercept-console'
            },
            {
              text: '最佳实践',
              link: '/guide/best-practice'
            },

          ]
        },
        {
          text: 'API参考',
          link: '/reference/log-manager'
        }
      ],
      '/reference/': [
        {
          text: 'API参考',
          items: [
            { text: 'LogManager', link: '/reference/log-manager' },
            { text: 'Logger', link: '/reference/logger' },
            { text: 'Level', link: '/reference/level' },
            { text: 'MarkerManager', link: '/reference/marker-manager' },
            {
              text: '追加器',
              items: [
                { text: 'AbstractAppender', link: '/reference/abstract-appender' },
                { text: 'ConsoleAppender', link: '/reference/console-appender' },
                { text: 'DailyRollingFileAppender', link: '/reference/daily-rolling-file-appender' },
                { text: 'FileAppender', link: '/reference/file-appender' },
                { text: 'RollingFileAppender', link: '/reference/rolling-file-appender' },
                { text: 'TCPSocketAppender', link: '/reference/tcp-socket-appender' },
                { text: 'UDPSocketAppender', link: '/reference/udp-socket-appender' },
                {
                  text: 'SMTPAppender',
                  link: '/reference/smtp-appender'
                }
              ]
            },
            {
              text: '输出格式',
              items: [
                { text: 'PatternLayout', link: '/reference/pattern-layout' },
                { text: 'CSVLayout', link: '/reference/csv-layout' }
              ]
            }
          ],
          collapsed: false
        },
        {
          text: '装饰器和标签',
          items: [
            {
              text: '装饰器',
              link: '/reference/decorators'
            },
            {
              text: '标签',
              link: '/reference/tags',
              collapsed: false
            }
          ],
          collapsed: false
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ericple/log4a' }
    ],

    footer: {
      message: '以 Apache License 2.0 许可证发布',
      copyright: 'Copyright ©️ 2024-至今 郭挺劲 | 与巴勒斯坦人民同在'
    },

    search: {
      provider: 'local'
    },

    logo: {
      src: '/log4a@1x.svg'
    }
  },
  vite: {
  }
})
