/*
 * Copyright (C) 2022 Huawei Device Co., Ltd.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0, which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the
 * Eclipse Public License v. 2.0 are satisfied: GNU General Public License,
 * version 2 with the GNU Classpath Exception, which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 *
 * Based on TransPort.java written by
 * Copyright (c) 1997, 2023 Oracle and/or its affiliates.
 *
 */

import { MimeMessage } from '../mail/MimeMessage';
import { Constant } from '../Constant';
import { Properties } from '../mail/Properties'
import { Util } from '../Util'
import { MailLogger } from '../MailLogger';
import { SocketUtil } from './SocketUtil';
import net_socket from '@ohos.net.socket';


/**
 * 发送邮件
 */
export class TransPort {
    private socket
    private properties: Properties
    private timeout: number = 6000
    private host: string
    private sendMessageEvent: (err?: string) => void
    private authenticationEvent: (err?: string) => void
    private isSSL: boolean = false
    private expectCode = "220"
    private serverIsReady = false
    private isConnect = false
    private timeOutMillisecond: number
    private timerId = -1

    /**
     * 设置连接服务器超时时长
     * @param timeout
     */
    public setTimeOut(timeout) {
        this.timeout = timeout
    }

    /**
     * 连接登陆服务器
     * @param properties
     */
    public connect(properties: Properties, loginEvent: (success, err?) => void) {
        if (!!!properties) {
            loginEvent(false, 'properties is null')
            return
        }
        this.timeOutMillisecond = properties.getTimeOutMillisecond()
        this.properties = properties
        this.host = this.properties.getHost()
        let port = this.properties.getPort()
        this.isSSL = this.properties.isSSL()
        let ca: string[]

        if (this.isSSL) {
            if (!!this.socket) {
                this.socket.off("message", (value) => {
                    MailLogger.info("ohos_mail-- off message")
                })
            }
            this.socket = net_socket.constructTLSSocketInstance()
            ca = this.properties.getCa()
        } else {
            this.socket = net_socket.constructTCPSocketInstance()
        }

        let socketUtil = new SocketUtil();
        socketUtil.connect(this.socket, this.host, port, this.isSSL, ca, this.timeout, (success, err) => {
            if (!success) {
                loginEvent(false, err)
            }
        }, (value) => {
            let asciiToStr = ""
            let decodeNum = new Uint8Array(value.message)
            asciiToStr = String.fromCharCode.apply(null, decodeNum);
            MailLogger.info("ohos_mail-- server response :" + asciiToStr)
            //服务器响应220 表示服务器就绪
            if (!this.serverIsReady && asciiToStr.startsWith(this.expectCode)) {
                this.serverIsReady = true
                this.login()
                return
            } else if (asciiToStr.startsWith(this.expectCode)) {
                if (this.timerId != -1) {
                    MailLogger.info("ohos_mail OK clear request timeout")
                    clearTimeout(this.timerId)
                }
                if (this.expectCode.startsWith("221")) {
                    //socket.off('message');
                    this.serverIsReady = false
                    this.isConnect = false
                    if (!!this.socket) {
                        this.socket.close(err => {
                            if (err) {
                                MailLogger.error('ohos_mail  socket close fail ' + JSON.stringify(err));
                                this.authenticationEvent( JSON.stringify(err))
                                return;
                            }
                            this.authenticationEvent(null)
                            MailLogger.info('ohos_mail  socket close success');
                        })
                    }
                    return
                }

                this.authenticationEvent(null)
                if (this.expectCode.startsWith("235")) { //鉴权完成
                    this.isConnect = true
                    loginEvent(true, '')
                }
            } else {
                if (this.timerId != -1) {
                    MailLogger.info("ohos_mail ERR clear request timeout")
                    clearTimeout(this.timerId)
                }
                this.authenticationEvent(asciiToStr)
                if (this.isConnect) {
                    this.sendMessageEvent(asciiToStr)
                } else {
                    loginEvent(false, asciiToStr)
                }
                this.serverIsReady = false
                this.isConnect = false
            }
            asciiToStr = ""
        })
    }

    /**
     * 登录服务器(鉴权)
     */
    private async login() {
        await new Promise((resolve, reject) => {
            this.sendEHLO((err) => {
                if (!err) {
                    resolve("")
                    return
                }
                MailLogger.info('ohos_mail-- ehlo err:' + err);
                reject(err)
            }, "250")
        }).then((result) => {
            return new Promise((resolve, reject) => {
                this.sendAuthLogin((err) => {
                    if (!err) {
                        resolve("")
                        return
                    }
                    MailLogger.info('ohos_mail-- auth err:' + err);
                    reject(err)
                }, "334")
            })
        }).then((result) => {
            return new Promise((resolve, reject) => {
                this.sendUser((err) => {
                    if (!err) {
                        resolve("")
                        return
                    }
                    MailLogger.info('ohos_mail-- user err:' + err);
                    reject(err)
                }, "334")

            })
        }).then((result) => {
            return new Promise((resolve, reject) => {
                this.sendPassword((err) => {
                    if (!err) {
                        resolve("")
                        return
                    }
                    MailLogger.info('ohos_mail-- password err:' + err);
                    reject(err)
                }, "235")
            })
        })
    }

    /**
     * 向服务器打招呼
     * @param event
     */
    private sendEHLO(event: (err?) => void, expectCode) {
        this.authenticationEvent = event

        let cmd = this.isSSL ? "EHLO " + this.host + Constant.LINEFEED :
            { data: "EHLO " + this.host + Constant.LINEFEED,
                encoding: "UTF-8" }

        this.socket.send(cmd).then(() => {
            if (this.timerId != -1) {
                clearTimeout(this.timerId)
            }
            this.timerId = setTimeout(() => {
                this.authenticationEvent("ehlo response timeout")
            }, this.timeOutMillisecond)
            this.expectCode = expectCode
            MailLogger.info('ohos_mail-- send EHLO success ');
        }).catch(err => {
            MailLogger.error('ohos_mail-- send EHLO fail ' + JSON.stringify(err));
            this.authenticationEvent(JSON.stringify(err))
        })
    }

    /**
     *
     * 发送登陆鉴权请求
     */
    private sendAuthLogin(event: (err?) => void, expectCode) {
        this.authenticationEvent = event

        let cmd = this.isSSL ? "AUTH LOGIN" + Constant.LINEFEED :
            { data: "AUTH LOGIN" + Constant.LINEFEED,
                encoding: "UTF-8" }

        this.socket.send(cmd).then(() => {
            if (this.timerId != -1) {
                clearTimeout(this.timerId)
            }
            this.timerId = setTimeout(() => {
                this.authenticationEvent("AUTH LOGIN response timeout")
            }, this.timeOutMillisecond)
            this.expectCode = expectCode
            MailLogger.info('ohos_mail-- send AUTH LOGIN success');
        }).catch(err => {
            MailLogger.error('ohos_mail-- send  AUTH LOGIN fail ' + JSON.stringify(err));
            this.authenticationEvent(JSON.stringify(err))
        })
    }

    /**
     * 发送用户名
     */
    private sendUser(event: (err?) => void, expectCode) {
        this.authenticationEvent = event
        let user = Util.encodeString(this.properties.getFrom()) + Constant.LINEFEED

        let cmd = this.isSSL ? user :
            { data: user,
                encoding: "UTF-8" }

        this.socket.send(cmd).then(() => {
            if (this.timerId != -1) {
                clearTimeout(this.timerId)
            }
            this.timerId = setTimeout(() => {
                this.authenticationEvent("user response timeout")
            }, this.timeOutMillisecond)
            this.expectCode = expectCode
            MailLogger.info('ohos_mail-- send user success');
        }).catch(err => {
            MailLogger.error('ohos_mail-- send  fail ' + JSON.stringify(err));
            this.authenticationEvent(JSON.stringify(err))
        })
    }

    /**
     * 发送授权码
     */
    private sendPassword(event: (err?) => void, expectCode) {
        this.authenticationEvent = event
        let pass = Util.encodeString(this.properties.getAuthorizationCode()) + Constant.LINEFEED

        let cmd = this.isSSL ? pass :
            { data: pass,
                encoding: "UTF-8" }

        this.socket.send(cmd).then(() => {
            if (this.timerId != -1) {
                clearTimeout(this.timerId)
            }
            this.timerId = setTimeout(() => {
                this.authenticationEvent("pass response timeout")
            }, this.timeOutMillisecond)
            this.expectCode = expectCode
            MailLogger.info('ohos_mail-- send pass success');
        }).catch(err => {
            MailLogger.error('ohos_mail-- send  fail ' + JSON.stringify(err));
            this.authenticationEvent(JSON.stringify(err))
        })
    }

    /**
     * 发送送邮件
     * @param mimeMessage
     * @param callback
     */
    public async sendMessage(mimeMessage: MimeMessage, event: (err) => void) {
        this.sendMessageEvent = event
        await new Promise((resolve, reject) => {
            this.sendFrom(mimeMessage, (err) => {
                if (!err) {
                    resolve("")
                    return
                }
                MailLogger.info('ohos_mail-- from err:' + err);
                event(err)
                reject(err)
            }, "250")
        }).then((result) => {
            return new Promise((resolve, reject) => {
                this.sendRCPTs(mimeMessage, (err) => {
                    if (!err) {
                        resolve("")
                        return
                    }
                    MailLogger.info('ohos_mail-- rcpts err:' + err);
                    event(err)
                    reject(err)
                })
            })
        }).then((result) => {
            return new Promise((resolve, reject) => {
                this.sendDATA((err) => {
                    if (!err) {
                        resolve("")
                        return
                    }
                    MailLogger.info('ohos_mail--  data err:' + err);
                    event(err)
                    reject(err)
                }, "354")
            })
        }).then((result) => {
            return new Promise((resolve, reject) => {
                this.sendMsgData(mimeMessage, (err) => {
                    if (!err) {
                        this.sendMessageEvent(null)
                        resolve("")
                        return
                    }
                    MailLogger.info('ohos_mail--  msg data  err:' + err);
                    event(err)
                    reject(err)
                }, "250")
            })
        })
    }

    private sendFrom(mimeMessage: MimeMessage, event: (err?) => void, expectCode) {
        this.authenticationEvent = event

        let cmd = this.isSSL ? "MAIL FROM: <" + mimeMessage.getFrom() + ">" + Constant.LINEFEED :
            { data: "MAIL FROM: <" + mimeMessage.getFrom() + ">" + Constant.LINEFEED,
                encoding: "UTF-8" }

        this.socket.send(cmd).then(() => {
            if (this.timerId != -1) {
                clearTimeout(this.timerId)
            }
            this.timerId = setTimeout(() => {
                this.authenticationEvent("MAIL FROM response timeout")
            }, this.timeOutMillisecond)
            this.expectCode = expectCode
            MailLogger.info('ohos_mail-- send MAIL FROM success');
        }).catch(err => {
            MailLogger.error('ohos_mail-- send  fail ' + JSON.stringify(err));
            this.authenticationEvent(JSON.stringify(err))
        })
    }

    private async sendRCPTs(mimeMessage: MimeMessage, event: (success) => void) {
        let recipients = mimeMessage.getAllRecipients()
        for (let i = 0; i < recipients.length; i++) {
            await new Promise((resolve, reject) => {
                this.sendRCPT(recipients[i], (err) => {
                    if (!err) {
                        resolve("")
                    } else {
                        reject(err)
                        event(err)
                        return
                    }
                }, "250")
            })
        }
        event(null)
    }

    private sendRCPT(address, event: (err?) => void, expectCode) {
        this.authenticationEvent = event
        let cmd = this.isSSL ? "RCPT TO:<" + address + ">" + Constant.LINEFEED :
            { data: "RCPT TO:<" + address + ">" + Constant.LINEFEED,
                encoding: "UTF-8" }

        this.socket.send(cmd).then(() => {
            if (this.timerId != -1) {
                clearTimeout(this.timerId)
            }
            this.timerId = setTimeout(() => {
                this.authenticationEvent("RCPT response timeout : " + address)
            }, this.timeOutMillisecond)
            this.expectCode = expectCode
            MailLogger.info('ohos_mail-- send RCPT success');
        }).catch(err => {
            MailLogger.error('ohos_mail-- send RCPT fail: ' + JSON.stringify(err));
            this.authenticationEvent(JSON.stringify(err))
        })
    }

    private sendDATA(dataEvent: (err?) => void, expectCode) {
        this.authenticationEvent = dataEvent

        let cmd = this.isSSL ? "DATA" + Constant.LINEFEED :
            { data: "DATA" + Constant.LINEFEED,
                encoding: "UTF-8" }

        this.socket.send(cmd).then(() => {
            if (this.timerId != -1) {
                clearTimeout(this.timerId)
            }
            this.timerId = setTimeout(() => {
                this.authenticationEvent("DATA response timeout")
            }, this.timeOutMillisecond)
            this.expectCode = expectCode
            MailLogger.info('ohos_mail-- send DATA success');
        }).catch(err => {
            MailLogger.error('ohos_mail-- send DATA fail: ' + JSON.stringify(err));
            this.authenticationEvent(JSON.stringify(err))
        })
    }

    /**
     * 发送邮件内容
     */
    private sendMsgData(mimeMessage: MimeMessage, event: (err?) => void, expectCode) {
        this.authenticationEvent = event
        let message = mimeMessage.getMimeMessage()

        let cmd = this.isSSL ? String.fromCharCode.apply(null, new Uint8Array(message)) :
            { data: message,
                encoding: "UTF-8" }

        this.socket.send(cmd).then(() => {
            if (this.timerId != -1) {
                clearTimeout(this.timerId)
            }
            this.timerId = setTimeout(() => {
                this.authenticationEvent("msg body response timeout")
            }, this.timeOutMillisecond)
            this.expectCode = expectCode
            MailLogger.info('ohos_mail-- send msg body success');
        }).catch(err => {
            MailLogger.error('ohos_mail-- send msg body fail: ' + JSON.stringify(err));
            this.authenticationEvent(JSON.stringify(err))
        })
    }

    /**
     * 退出当前登录
     */
    public close(event: (err) => void) {
        this.authenticationEvent = event
        let cmd = this.isSSL ? "QUIT" + Constant.LINEFEED :
            { data: "QUIT" + Constant.LINEFEED,
                encoding: "UTF-8" }

        this.socket.send(cmd).then(() => {
            if (this.timerId != -1) {
                clearTimeout(this.timerId)
            }
            this.timerId = setTimeout(() => {
                this.authenticationEvent("quit response timeout")
                this.socket.close()
            }, this.timeOutMillisecond)
            this.expectCode = "221"
            MailLogger.info('ohos_mail-- send quit success');
        }).catch(err => {
            MailLogger.error('ohos_mail-- send quit fail ' + JSON.stringify(err));
            this.authenticationEvent(JSON.stringify(err))
        })
    }

    /**
     * 发送空消息
     */
    public noop(event: (err) => void) {
        let cmd = this.isSSL ? "NOOP" + Constant.LINEFEED :
            { data: "NOOP" + Constant.LINEFEED,
                encoding: "UTF-8" }

        this.socket.send(cmd).then(() => {
            MailLogger.info('ohos_mail send noop success');
        }).catch(err => {
            MailLogger.error('ohos_mail send noop fail ' + JSON.stringify(err));
            event(JSON.stringify(err))
        })
    }
}

