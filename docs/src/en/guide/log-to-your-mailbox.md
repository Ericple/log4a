# Output to mailbox

Starting from version `1.5.0`, Log4a supports `SMTPAppender`. Developers can configure the SMTP appender to push logs to a mailbox under given conditions. The following example only shows part of the API. For all configurable items, see [SMTPAppender](../reference/smtp-appender.md).

## Usage

```ts
// appenderConstants.ts

import { SMTPAppender, Level } from '@pie/log4a';

const smtpAppender = new SMTPAppender({
  connectOptions: {
    host: 'smtp.host.com',
    port: 25,
    isSsl: false,
    authorizationCode: 'xxxxxxxxxxxx',
    from: 'xxxxxxxxx@log4a.com',
    timeOutMillisecond: 10000
  },
  name: 'main_smtp',
  level: Level.ALL,
  recipients: ['example@huawei.com'],
  debug: true,
  minimumCount: 10,
  sendInterval: 6000
});

export default smtpAppender;
```

```ts
// Index.ets

import { LogManager, Logger } from '@pie/log4a';
import smtpAppender from './appenderConstants';

@Entry
@Component
struct Index {
  logger: Logger = LogManager.getLogger(this)
    .bindAppender(smtpAppender);

  aboutToAppear() {
    this.logger.info('Index about to appear');
  }

  build() {
    // ... Other code
  }
}
```
