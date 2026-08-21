# SMTPAppender

> Provides the ability to connect to an SMTP server and push logs to specified mailboxes. Developers need to apply for `ohos.permission.INTERNET` and `ohos.permission.GET_WIFI_INFO` permissions.

## `constructor(config)`

- `config` SMTPAppenderConfig
  - `name` string - Appender name
  - `level` Level - Log level
  - `connectOptions` ConnectProperties - Server connection information
    - `host` string - SMTP server address
    - `port` number - SMTP server port
    - `from` string - Sender mailbox
    - `authorizationCode` string - Authorization code
    - `protocol` string? - Protocol
    - `isSsl` boolean? - Whether to use SSL
    - `caData` string[]? - CA data
    - `timeOutMillisecond` number? - Connection timeout
  - `minimumCount` number? - Minimum number of logs to send at once
  - `sendInterval` number? - Minimum interval between sends
  - `debug` boolean? - Whether to print debug information, default false
  - `recipients` string[] - Recipient mailboxes
  - `ccRecipients` string[]? - CC mailboxes
  - `bccRecipients` string[]? - BCC mailboxes

Creates a `SMTPAppender`

## `triggerMail(time)`

- `time` number? - Current timestamp

Manually sends the currently queued logs; the queue is cleared after a successful send

## `setRecipients(recipients)`

- `recipients` string[] - Recipients

Sets the recipients of this appender

## `setCCRecipients(recipients)`

- `recipients` string[] - Recipients

Sets the CC recipients of this appender

## `setBCCRecipients(recipients)`

- `recipients` string[] - Recipients

Sets the BCC recipients of this appender

## `setMailLayout(newLayout)`

- `newLayout` MailLayout - Mail format
  - `subject` string - Mail subject
  - `bodyPattern` PatternLayout - Mail body pattern

## `onLog(level, tag, time, count, message, tempContext)`

- `level` Level - Log level
- `tag` string - Log tag
- `time` number - Log timestamp
- `count` number - Log sequence number
- `message` string - Log content
- `tempContext` TemporaryLoggerContext - Log temporary context

Called when the bound host Logger records a log

## `onTerminate()`

Terminates all logging activities of this Appender
