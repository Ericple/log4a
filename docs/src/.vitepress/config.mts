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
    //       { text: 'Guide', link: '/guide/getting-started' },
    //       { text: 'Reference', link: '/reference' }
    //     ],
    //     footer: {
    //       message: 'Released under Apache License 2.0.',
    //       copyright: 'Copyright ©️ 2024-present Ericple Garrison'
    //     },
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
    //           text: 'API参考',
    //           link: '/reference/log-manager'
    //         }
    //       ],
    //       '/reference/': [
    //         {
    //           text: 'API参考',
    //           items: [
    //             { text: 'LogManager', link: '/reference/log-manager' },
    //             { text: 'Logger', link: '/reference/logger' },
    //             { text: 'MarkerManager', link: '/reference/marker-manager' }
    //           ],
    //           collapsed: false
    //         },
    //         {
    //           text: '装饰器和标签',
    //           items: [
    //             {
    //               text: '装饰器',
    //               link: '/reference/decorators'
    //             },
    //             {
    //               text: '标签',
    //               link: '/reference/tags',
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
      { text: 'Playground', link: '/playground/index' },
      {
        text: '1.4.2',
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
            { text: 'MarkerManager', link: '/reference/marker-manager' },
            { text: 'Level', link: '/reference/level' },
            {
              text: '追加器',
              items: [
                { text: 'AbstractAppender', link: '/reference/abstract-appender' },
                { text: 'FileAppender', link: '/reference/file-appender' },
                { text: 'RollingFileAppender', link: '/reference/rolling-file-appender' },
                { text: 'DailyRollingFileAppender', link: '/reference/daily-rolling-file-appender' },
                { text: 'TCPSocketAppender', link: '/reference/tcp-socket-appender' },
                { text: 'UDPSocketAppender', link: '/reference/udp-socket-appender' }
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
      copyright: 'Copyright ©️ 2024-至今 郭挺劲'
    },

    search: {
      provider: 'local'
    },

    logo: {
      src: '/log4a@1x.svg'
    }
  },
  vite:{
  }
})
