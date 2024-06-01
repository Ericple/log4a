# 输出到邮箱

从`1.5.0`版本开始，Log4a支持SMTPAppender，开发者可以通过配置SMTP追加器实现将日志在给定条件下输出到邮箱。以下用例只展示部分API，要查看所有可配置项，请查看[SMTPAppender](../reference/smtp-appender.md)

## 用法

```ts
// appenderConstants.ts

import {SMTPAppender} from '@pie/log4a';

const smtpAppender = new SMTPAppender({
    connectOptions: {
      host: 'smtp.host.com', // smtp服务器地址
      port: 25, // smtp端口
      isSsl: false, // 是否开启ssl连接
      authorizationCode: 'xxxxxxxxxxxx', // smtp授权码
      from: 'xxxxxxxxx@log4a.com', // 发件人邮箱
      timeOutMillisecond: 10000 // 超时设定
    },
    name: 'main_smtp', // 追加器名称
    level: Level.ALL, // 日志等级
    recipients: ['example@huawei.com'], // 收件人邮箱
    debug: true, // 是否打印追加器内部日志
    minimumCount: 10, // 一次发送的邮件中包含的最少日志数量
    sendInterval: 6000 // 每次发送邮件的最小间隔
});

export default smtpAppender;
```

```ts
// Index.ets

import smtpAppender from './appenderConstants';

@Entry
@Component
struct Index {
    logger:Logger = LogManager.getLogger(this)
        .bindAppender(smtpAppender);

    aboutToAppear(){
        this.logger.info('Index about to appear');
    }
    build(){
        // ... Other code
    }
}
```

