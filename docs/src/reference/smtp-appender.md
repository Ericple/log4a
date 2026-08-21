# SMTPAppender

> 提供通SMTP协议连接服务器并将日志以邮件形式推送到指定邮箱的追加器，需要开发者自行申请`ohos.permission.INTERNET`
> 及`ohos.permission.GET_WIFI_INFO`权限

## `constructor(config)`

- `config` SMTPAppenderConfig
    - `name` string - 追加器名称
    - `level` Level - 日志等级
    - `connectOptions` ConnectProperties - 服务器连接信息
        - `host` string - SMTP服务器地址
        - `port` number - SMTP服务器端口
        - `from` string - 发件人邮箱
        - `authorizationCode` string - 授权码
        - `protocol` string? - 协议
        - `isSsl` boolean? - 是否使用SSL连接
        - `caData` string[]? - CA数据
        - `timeOutMillisecond` number? - 连接超时时间
    - `minimumCount` number? - 一次发送的最少日志条数
    - `sendInterval` number? - 最短发送间隔
    - `debug` boolean? - 是否打印调试信息，默认不打印
    - `recipients` string[] - 收件人邮箱地址
    - `ccRecipients` string[]? - 抄送人邮箱地址
    - `bccRecipients` string[]? - 密送人邮箱地址

```ts
export interface SMTPAppenderConfig {
  name: string;
  level: Level;
  connectOptions: ConnectProperties;

  /**
   * 单次发送最少错误日志数量
   */
  minimumCount?: number;

  /**
   * 单次发送最短间隔
   */
  sendInterval?: number;

  /**
   * 打印错误日志
   */
  debug?: boolean;
  recipients: string[];
  ccRecipients?: string[];
  bccRecipients?: string[];
}
```

新建一个`SMTPAppender`

## `triggerMail(time)`

- `time` number? - 当前时间戳

手动强制发送当前暂存队列中的日志，发送成功后会清空当前暂存日志队列

## `setRecipients(recipients)`

- `recipients` string[] - 收件人

设置此追加器收件人

## `setCCRecipients(recipients)`

- `recipients` string[] - 收件人

设置此追加器抄送人

## `setBCCRecipients(recipients)`

- `recipients` string[] - 收件人

设置此追加器密送人

## `setMailLayout(newLayout)`

- `newLayout` MailLayout - 邮件格式
    - `subject` string - 邮件主题
    - `bodyPattern` PatternLayout - 邮件正文格式

## `onLog(level, tag, time, count, message, tempContext)`

- `level` Level - 日志等级
- `tag` string - 日志标签
- `time` number - 日志时间戳
- `count` number - 日志序号
- `message` string - 日志内容
- `tempContext` TemporaryLoggerContext - 日志临时上下文

当被绑定的宿主Logger记录日志时会调用此方法

## `onTerminate()`

终止此Appender的所有日志记录活动
