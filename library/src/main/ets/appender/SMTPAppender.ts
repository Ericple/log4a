import { CSocketAppender } from '../abstract/CSocketAppender';
import { Level } from '../Level';
import { TemporaryLoggerContext } from '../TemporaryLoggerContext';
import { AppenderTypeEnum } from '../spi/AppenderTypeEnum';
import { PatternLayout } from '../layout/PatternLayout';
import { TransPort } from '../mail/TransPort';
import { Properties } from '../mail/Properties';
import { MimeMessage } from '../mail/MimeMessage';
import { RecipientType } from '../mail/RecipientType';
import { Logger } from '../Logger';
import { LogManager } from '../LogManager';

export interface ConnectProperties {
  protocol?: string;
  host: string;
  port: number;
  from: string;
  authorizationCode: string;
  isSsl?: boolean;
  caData?: string[]
  timeOutMillisecond?: number;
}

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

export interface MailLayout {
  subject: string;
  bodyPattern: PatternLayout;
}

export class SMTPAppender extends CSocketAppender {
  private tmpLogArray: string[] = [];
  private config: SMTPAppenderConfig;
  private lastSendTimestamp: number = 0;
  private mailLayout: MailLayout = {
    subject: 'Log4a Report',
    bodyPattern: new PatternLayout('Your app has generated these logs from user: \r\n%m')
  }
  private transport: TransPort;
  private recipients: string[] = [];
  private ccRecipients: string[] = [];
  private bccRecipients: string[] = [];
  private logger: Logger = LogManager.getLogger(this);

  constructor(config: SMTPAppenderConfig) {
    super(config.name, config.level, AppenderTypeEnum.SOCKET);
    this.config = config;
    this.recipients = this.config.recipients;
    this.ccRecipients = this.config.ccRecipients ?? [];
    this.bccRecipients = this.config.bccRecipients ?? [];
    this.transport = new TransPort();
  }

  setRecipients(recipients: string[]) {
    this.recipients = recipients;
  }

  setCCRecipients(recipients: string[]) {
    this.ccRecipients = recipients;
  }

  setBCCRecipients(recipients: string[]) {
    this.bccRecipients = recipients;
  }

  setMailLayout(newLayout: MailLayout): this {
    this.mailLayout = newLayout;
    return this;
  }

  onLog(level: Level, tag: string, time: number, count: number, message: string, tempContext: TemporaryLoggerContext): this {
    if (this._terminated) return this;
    this.tmpLogArray.push(this.makeMessage(level, tag, time, count, message, tempContext));
    this.checkAndHandle(time);
    return this;
  }

  private checkAndHandle(time: number) {
    let tc = this.config.minimumCount ?? 1;
    let ti = this.config.sendInterval ?? 0;
    let tNow = Date.now();
    if (this.tmpLogArray.length >= tc && tNow - this.lastSendTimestamp >= ti) {
      // Send log
      this.triggerMail(time);
    }
  }

  triggerMail(time?: number) {
    time = time ?? Date.now();
    this.sendLog(time);
  }

  private sendLog(time: number) {
    if (this.tmpLogArray.length == 0) return;
    let mimeMsg = new MimeMessage();
    mimeMsg.setFrom(this.config.connectOptions.from);
    mimeMsg.setText(this.mailLayout.bodyPattern.makeMessage(Level.ALL, '', time, 0, this.tmpLogArray.join('\r\n'), '', new TemporaryLoggerContext()));
    mimeMsg.setSubject(this.mailLayout.subject);
    mimeMsg.setRecipients(RecipientType.TO, this.recipients);
    mimeMsg.setRecipients(RecipientType.CC, this.ccRecipients);
    mimeMsg.setRecipients(RecipientType.BCC, this.bccRecipients);
    mimeMsg.setMIMEVersion("1.0");
    const properties = new Properties();
    properties.setHost(this.config.connectOptions.host);
    properties.setPort(this.config.connectOptions.port);
    properties.setTimeOutMillisecond(this.config.connectOptions.timeOutMillisecond ?? 6000);
    properties.setFrom(this.config.connectOptions.from);
    properties.setAuthorizationCode(this.config.connectOptions.authorizationCode);
    properties.isSsl = this.config.connectOptions.isSsl;
    properties.ca(this.config.connectOptions.caData);
    this.transport.connect(properties, (success, err) => {
      if (success) {
        this.transport.sendMessage(mimeMsg, (err) => {
          if (!err) {
            this.tmpLogArray = [];
            this.transport.close(() => undefined);
          } else if (this.config.debug) {
            this.logger.error('Cannot send mail due to {}', err)
          }
        });
      } else if (err) {
        if (this.config.debug) {
          this.logger.error('Cannot connect to server with given properties: {}, error: {}', properties, err);
        }
      }
    })
    this.lastSendTimestamp = Date.now();
  }

  onTerminate(): void {
    this._terminated = true;
    this.transport.close(() => undefined);
  }
}