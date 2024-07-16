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
 * Based on Store.java written by
 * Copyright (c) 1997, 2023 Oracle and/or its affiliates.
 *
 */

import { Constant } from '../Constant';
import { Properties } from '../mail/Properties'
import { Util } from '../Util'
import { MailLogger } from '../MailLogger';
import { Folder } from '../mail/Folder';
import { Flag } from '../mail/Flag';
import { SocketUtil } from './SocketUtil';
import net_socket from '@ohos.net.socket';
import { imapEncode } from '../Utf7Util';
import util from '@ohos.util';
/**
 * 接收邮件、邮箱管理
 */
export class Store {
    private socket
    private properties: Properties
    private responseDecode: string = ''
    private currFolder: Folder
    private isStartWrite: boolean = false
    private connectTimeOut: number = 6000
    private infoEvent: Function
    private listEvent: Function
    private uidEvent: Function
    private msgNumEvent: Function
    private topLinesContent: Function
    private createMailBoxEvent: Function
    private deleteMailBoxEvent: Function
    private renameMailBoxEvent: Function
    private deleteMsgCountEvent: Function
    private expungeEvent: Function
    private existsEvent: Function
    private moveEvent: Function
    private copyEvent: Function
    private headerEvent: Function
    private allHeaderEvent: Function
    private flagsEvent: Function
    private setFlagEvent: Function
    private sizeEvent: Function
    private contentEvent: Function
    private pop3Event: Function
    private quitEvent: Function
    private appendEvent: Function
    private connectCallback
    private currentCmd = "LOGIN"
    private isSSL
    private isConnect: boolean = false
    private idMap: Map<string, string>
    private defaultFolder: Folder
    private folderList: Array<Folder>
    private timeOutMillisecond: number
    private timerId = -1
    private isAttachment = false
    private isAttachmentFirstLine = true
    private receivedDataSize = 0
    private attachmentSize
    private contentArrayBufferList: Array<string> = new Array()
    private perResponse: string

    constructor(properties: Properties) {
        this.properties = properties
        this.timeOutMillisecond = properties.getTimeOutMillisecond()
    }

    public setConnectTimeOut(timeout) {
        this.connectTimeOut = timeout
    }

    public id(id: Map<string, string>) {
        this.idMap = id
    }

    private receiveData(nextBuffer) {
        if (this.receivedDataSize >= this.attachmentSize) { //传输结束
            if (this.timerId != -1) {
                clearTimeout(this.timerId)
                MailLogger.info("ohos_mail getAttachment timeout clear")
            }
            // 如果超过指定的数据大小，截取指定大小数据，存储到文件中
            var truncatedBuffer = nextBuffer.slice(0, this.attachmentSize - (this.receivedDataSize - nextBuffer.length));
            this.isAttachment = false;

            this.contentEvent(true, truncatedBuffer.buffer);
            //插入结束符
            const endOfFile = new Uint8Array([10]);
            this.contentEvent(true, endOfFile.buffer);
            this.currentCmd = "";
        } else {
            // 持续传输数据到文件中
            this.contentEvent(true, nextBuffer.buffer);
            if (this.timerId != -1) {
                MailLogger.info("ohos_mail getAttachment timeout continue clear")
                clearTimeout(this.timerId)
            }
            this.timerId = setTimeout(() => {
                this.contentEvent(false, "ohos_mail getAttachment continue timeout")
            }, this.timeOutMillisecond)
        }
    }

    private getSecondLineAndAfter(currentMessage) {
        const decoder = util.TextDecoder.create('utf-8');
        const utfStr = decoder.decodeWithStream(currentMessage);

        const regex = /.*?BODY\[.*?\]\<.*?\>/;
        let secondLineAndAfter = utfStr.replace(regex, "").trim();
        secondLineAndAfter = secondLineAndAfter.replace(/^\{\d+\}/, "");
        secondLineAndAfter = secondLineAndAfter.replace(Constant.LINEFEED, "");
        return secondLineAndAfter;
    }

    public connect(connectCallback: (success, err?) => void) {
        this.connectCallback = connectCallback
        if (!!!this.properties) {
            connectCallback(false, ' properties is null')
            return
        }
        let host = this.properties.getHost()
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
        socketUtil.connect(this.socket, host, port, this.isSSL, ca, this.connectTimeOut, (success, err) => {
            if (!success) {
                connectCallback(success, err)
            }
        }, (value) => {
            //服务端响应监听
            this.resetTimeOut()
            if (this.isAttachment) {
                //获取附件第一行
                if (this.isAttachmentFirstLine) {
                    this.isAttachmentFirstLine = false;
                    let currentMessage = new Uint8Array(value.message);
                    let secondLineAndAfter = this.getSecondLineAndAfter(currentMessage);
                    // 使用字符串方法includes()来判断是否包含"A22 OK"
                    if (secondLineAndAfter.includes("A22 OK")) {
                        // 如果包含，使用字符串方法lastIndexOf()获取"A22 OK"在字符串中的最后一个索引位置
                        let index = secondLineAndAfter.lastIndexOf("A22 OK");
                        // 使用字符串方法substring()来删除"A22 OK"以及之后的所有内容
                        secondLineAndAfter = secondLineAndAfter.substring(0, index).replace(/\r\n$/, "");
                    }
                    if (secondLineAndAfter === "") {
                        this.isAttachmentFirstLine = true;
                        return;
                    }
                    let encoder = new util.TextEncoder();
                    let nextBuffer = encoder.encode(secondLineAndAfter);
                    this.receivedDataSize += nextBuffer.length;
                    this.receiveData(nextBuffer)
                }
                else {
                    const currentMessage = new Uint8Array(value.message);
                    this.receivedDataSize += currentMessage.length;
                    this.receiveData(currentMessage);
                }
                MailLogger.info("ohos_mail-- server response-- :" + value.message);
                return;
            }
            let decodeNum = new Uint8Array(value.message)
            let asciiToStr = Util.decodeByUTF8OrGBK(decodeNum);

            if (this.currentCmd != "RETR") {
                let resArr = asciiToStr.split("\r\n")
                for (let i = 0; i < resArr.length; i++) {
                    MailLogger.info("ohos_mail-- server response//:" + JSON.stringify(resArr[i]))
                }
            }

            if (this.currentCmd == "RETR") {
                MailLogger.info("ohos_mail RETR response//:" + asciiToStr.length)
                this.contentArrayBufferList.push(asciiToStr)
                if (!!this.perResponse) {
                    let res = this.perResponse + asciiToStr
                    if (res.includes("\r\n.\r\n")) {
                        if (this.timerId != -1) {
                            clearTimeout(this.timerId)
                            MailLogger.info("ohos_mail RETR timeout clear")
                        }

                        let resArr = asciiToStr.split("\r\n")
                        for (let i = 0; i < resArr.length; i++) {
                            MailLogger.info("ohos_mail-- server response//:" + JSON.stringify(resArr[i]))
                        }

                        this.isStartWrite = false
                        this.perResponse = ""
                        this.contentEvent(true, this.contentArrayBufferList.join(""))
                        this.contentArrayBufferList.length = 0
                        this.currentCmd = ""
                        return
                    }
                } else {
                    if (asciiToStr.includes("\r\n.\r\n")) {
                        if (this.timerId != -1) {
                            clearTimeout(this.timerId)
                            MailLogger.info("ohos_mail RETR timeout clear")
                        }
                        this.isStartWrite = false
                        this.perResponse = ""
                        this.contentEvent(true, asciiToStr)
                        this.contentArrayBufferList.length = 0
                        this.currentCmd = ""
                        return
                    }
                }
                this.perResponse = asciiToStr
                return
            }

            let lines
            if (this.isStartWrite) {
                this.responseDecode += asciiToStr
            } else {
                this.responseDecode = asciiToStr
            }

            if (this.properties.getProtocol() == "imap") {
                lines = this.responseDecode.split(Constant.LINEFEED)
            }

            if (asciiToStr.startsWith("* BYE")) {
                this.isConnect = false
                return
            }

            let lastLine
            //获取服务器响应的最后一行内容(最后一行内容是服务器对本次操作的状态)
            if (this.properties.getProtocol() == "imap") {
                if (this.properties.getProtocol() == "imap" && this.properties.getPort() == 993) {
                    if (asciiToStr.startsWith("A01 OK")) {
                        lastLine = lines.length > 1 ? lines[0] : lines[lines.length-1]
                    } else {
                        lastLine = lines.length > 1 ? lines[lines.length-2] : lines[lines.length-1]
                    }
                } else {
                    lastLine = lines.length > 1 ? lines[lines.length-2] : lines[lines.length-1]
                }
                MailLogger.info("ohos_mail last line-------" + lastLine)
            }


            if (this.properties.getProtocol() == "pop3") {
                MailLogger.info("ohos_mail pop3  currentCmd-----" + this.currentCmd)
                if (this.currentCmd == "LOGIN") {
                    if (asciiToStr.startsWith("+OK")) {
                        this.loginPop3Server()
                        return
                    }
                }

                if (this.currentCmd == "RETR") {
                    if (!this.isStartWrite) {
                        if (this.timerId != -1) {
                            clearTimeout(this.timerId)
                            MailLogger.info("ohos_mail RETR timeout clear")
                        }
                        this.contentEvent(true, this.responseDecode)
                        this.responseDecode = ""
                        this.currentCmd = ""
                    }
                    return
                }

                if (this.currentCmd == "TOP") {
                    if (asciiToStr.includes(".\r\n")) {
                        if (this.timerId != -1) {
                            clearTimeout(this.timerId)
                            MailLogger.info("ohos_mail TOP timeout clear")
                        }
                        this.isStartWrite = false
                        this.allHeaderEvent(true, this.responseDecode)
                        this.responseDecode = ""
                        this.currentCmd = ""
                    }
                    return
                }

                if (this.currentCmd == "TOPLINE") {
                    if (asciiToStr.includes(".\r\n")) {
                        if (this.timerId != -1) {
                            clearTimeout(this.timerId)
                            MailLogger.info("ohos_mail TOPLINE timeout clear")
                        }
                        this.isStartWrite = false
                        this.topLinesContent(true, this.responseDecode)
                        this.responseDecode = ""
                        this.currentCmd = ""
                    }
                    return
                }

                if (asciiToStr.startsWith("+OK")) {
                    if (this.timerId != -1) {
                        clearTimeout(this.timerId)
                    }

                    if (this.currentCmd == "USER") {
                        this.pop3Event(null)
                        this.currentCmd = ""
                        return
                    }

                    if (this.currentCmd == "PASS") {
                        this.pop3Event(null)
                        connectCallback(true, asciiToStr)
                        this.currentCmd = ""
                        return
                    }

                    if (this.currentCmd == "STAT") {
                        let info = asciiToStr.split(" ")
                        this.currFolder.setMessageCount(Number.parseInt(info[1]))
                        this.currFolder.setUnreadMessageCount(Number.parseInt(info[1]))
                        this.infoEvent(null)
                        this.currentCmd = ""
                        return
                    }

                    if (this.currentCmd == "LIST") {
                        let info = asciiToStr.split(" ")
                        this.sizeEvent(true, Number.parseInt(info[2]))
                        this.currentCmd = ""
                        return
                    }

                    if (this.currentCmd == "UIDL") {
                        let uidResponse = asciiToStr.split("\r\n")[0]
                        let info = uidResponse.split(" ")
                        this.uidEvent(true, info[2])
                        this.currentCmd = ""
                        return
                    }

                    if (this.currentCmd == "DELE") {
                        this.setFlagEvent(null)
                        this.currentCmd = ""
                        return
                    }

                    if (this.currentCmd == "QUIT") {
                        if (this.quitEvent) {
                            this.isConnect = false
                            this.quitEvent(null)
                        }
                        this.currentCmd = ""
                        return
                    }

                    if (!!this.pop3Event) {
                        this.pop3Event(null)
                    }
                }

                if (asciiToStr.startsWith("-ERR")) {
                    if (this.timerId != -1) {
                        clearTimeout(this.timerId)
                    }

                    if (this.currentCmd == "USER" || this.currentCmd == "PASS") {
                        connectCallback(false, asciiToStr)
                        this.pop3Event(asciiToStr)
                        this.currentCmd = ""
                    }

                    if (this.currentCmd == "STAT") {
                        this.infoEvent(asciiToStr)
                        this.currentCmd = ""
                        return
                    }

                    if (this.currentCmd == "QUIT") {
                        if (this.quitEvent) {
                            this.quitEvent(asciiToStr)
                        }
                        this.currentCmd = ""
                        return
                    }

                    if (this.currentCmd == "LIST") {
                        this.sizeEvent(false, asciiToStr)
                        this.currentCmd = ""
                        return
                    }

                    if (this.currentCmd == "UIDL") {
                        this.uidEvent(false, asciiToStr)
                        this.currentCmd = ""
                        return
                    }

                    if (this.currentCmd == "DELE") {
                        this.setFlagEvent(asciiToStr)
                        this.currentCmd = ""
                        return
                    }
                }
                return
            }

            if (asciiToStr.startsWith("* OK") && !this.isConnect) {
                this.loginIMAPServer()
            }

            //登录
            if (lastLine.startsWith("A01")) {
                if (this.timerId != -1) {
                    clearTimeout(this.timerId)
                    MailLogger.info("ohos_mail connect imap server clear")
                }
                if (lastLine.startsWith("A01 OK")) {
                    if (this.idMap) {
                        this.sendID()
                        return
                    }
                    this.isConnect = true
                    connectCallback(true, null)
                } else {
                    connectCallback(false, asciiToStr)
                }
                this.currentCmd = ""
                return
            }

            //获取所有邮箱
            if (lastLine.startsWith("A02")) {
                if (this.timerId != -1) {
                    clearTimeout(this.timerId)
                    MailLogger.info("ohos_mail getFolderList timeout clear")
                }
                this.isStartWrite = false
                if (lastLine.startsWith("A02 OK")) {
                    this.listEvent(true, Util.parserFolderList(this.responseDecode))
                    this.responseDecode = ""
                } else {
                    this.listEvent(false, asciiToStr)
                }
                this.currentCmd = ""
            }

            //获取邮箱信息
            if (lastLine.startsWith("A03")) {
                if (this.timerId != -1) {
                    clearTimeout(this.timerId)
                    MailLogger.info("ohos_mail open folder timeout clear")
                }
                this.isStartWrite = false
                if (lastLine.startsWith("A03 OK")) {
                    let info = Util.getInboxInfo(this.responseDecode)
                    this.currFolder.setFolderInfo(info)
                    this.infoEvent(null)
                    this.responseDecode = ""
                } else {
                    this.infoEvent(asciiToStr)
                }
                this.responseDecode = ""
                this.currentCmd = ""
                return
            }

            //获取邮箱信息
            if (lastLine.startsWith("A04")) {
                if (this.timerId != -1) {
                    clearTimeout(this.timerId)
                    MailLogger.info("ohos_mail expunge timeout clear")
                }
                if (lastLine.startsWith("A04 OK")) {
                    this.expungeEvent(null)
                } else {
                    this.expungeEvent(asciiToStr)
                }
                this.currentCmd = ""
                return
            }

            //获取邮件UID
            if (lastLine.startsWith("A07")) {
                if (this.timerId != -1) {
                    clearTimeout(this.timerId)
                    MailLogger.info("ohos_mail uid timeout clear")
                }
                this.isStartWrite = false
                if (lastLine.startsWith("A07 OK")) {
                    let uid = Util.parseMailUID(this.responseDecode)
                    if (typeof uid === "undefined") {
                        let response = lastLine.substring(6)
                        this.uidEvent(false, response)
                    } else {
                        this.uidEvent(true, uid)
                    }
                    this.responseDecode = ""
                } else {
                    this.uidEvent(false, asciiToStr)
                }
                this.currentCmd = ""
                return
            }

            //创建邮箱
            if (lastLine.startsWith("A08")) {
                if (this.timerId != -1) {
                    clearTimeout(this.timerId)
                    MailLogger.info("ohos_mail createMailBox timeout clear")
                }
                if (lastLine.startsWith("A08 OK")) {
                    this.createMailBoxEvent(true)
                } else {
                    this.createMailBoxEvent(false, asciiToStr)
                }
                this.currentCmd = ""
                return
            }

            //删除邮箱
            if (lastLine.startsWith("A09")) {
                if (this.timerId != -1) {
                    clearTimeout(this.timerId)
                    MailLogger.info("ohos_mail deleteMailBox timeout clear")
                }
                if (lastLine.startsWith("A09 OK")) {
                    this.deleteMailBoxEvent(true)
                } else {
                    this.deleteMailBoxEvent(false, asciiToStr)
                }
                this.currentCmd = ""
                return
            }

            //重命名邮箱
            if (lastLine.startsWith("A10")) {
                if (this.timerId != -1) {
                    clearTimeout(this.timerId)
                    MailLogger.info("ohos_mail renameMailBox timeout clear")
                }
                if (lastLine.startsWith("A10 OK")) {
                    this.renameMailBoxEvent(true)
                } else {
                    this.renameMailBoxEvent(false, asciiToStr)
                }
                this.currentCmd = ""
                return
            }

            //获取已删除邮件个数
            if (lastLine.startsWith("A11")) {
                if (this.timerId != -1) {
                    clearTimeout(this.timerId)
                    MailLogger.info("ohos_mail deleteMsgCount timeout clear")
                }
                if (lastLine.startsWith("A11 OK")) {
                    this.deleteMsgCountEvent(true, Util.parseDeleteCount(asciiToStr))
                } else {
                    this.deleteMsgCountEvent(false, asciiToStr)
                }
                this.currentCmd = ""
            }

            //判断一个邮箱是否存在
            if (lastLine.startsWith("A12")) {
                if (this.timerId != -1) {
                    clearTimeout(this.timerId)
                    MailLogger.info("ohos_mail exists timeout clear")
                }
                if (lastLine.startsWith("A12 OK")) {
                    let lines = asciiToStr.split(Constant.LINEFEED)
                    this.existsEvent(lines[0].includes("* LIST"))
                } else {
                    this.existsEvent(false, asciiToStr)
                }
                this.currentCmd = ""
            }

            //移动邮件
            if (lastLine.startsWith("A13")) {
                if (this.timerId != -1) {
                    clearTimeout(this.timerId)
                    MailLogger.info("ohos_mail move timeout clear")
                }
                if (lastLine.startsWith("A13 OK")) {
                    this.moveEvent(true, '')
                } else {
                    this.moveEvent(false, asciiToStr)
                }
                this.currentCmd = ""
            }

            //获取header
            if (lastLine.startsWith("A14")) {
                if (this.timerId != -1) {
                    clearTimeout(this.timerId)
                    MailLogger.info("ohos_mail getHeader timeout clear")
                }
                if (lastLine.startsWith("A14 OK")) {
                    this.headerEvent(true, Util.parserHeader(asciiToStr))
                } else {
                    this.headerEvent(false, asciiToStr)
                }
                this.currentCmd = ""
            }

            //获取全部header
            if (lastLine.startsWith("A15")) {
                if (this.timerId != -1) {
                    clearTimeout(this.timerId)
                    MailLogger.info("ohos_mail getAllHeader timeout clear")
                }
                if (lastLine.startsWith("A15 OK")) {
                    this.isStartWrite = false
                    this.allHeaderEvent(true, this.responseDecode)
                    this.responseDecode = ''
                } else {
                    this.allHeaderEvent(false, asciiToStr)
                }
                this.currentCmd = ""
            }

            //获取Flags
            if (lastLine.startsWith("A16")) {
                if (this.timerId != -1) {
                    clearTimeout(this.timerId)
                    MailLogger.info("ohos_mail getFlag timeout clear")
                }
                if (lastLine.startsWith("A16 OK")) {
                    this.isStartWrite = false
                    this.flagsEvent(true, Util.parserFlags(this.responseDecode))
                    this.responseDecode = ""
                } else {
                    this.flagsEvent(false, asciiToStr)
                }
                this.currentCmd = ""
            }

            //设置Flag
            if (lastLine.startsWith("A17")) {
                if (this.timerId != -1) {
                    clearTimeout(this.timerId)
                    MailLogger.info("ohos_mail setFlag timeout clear")
                }
                if (lastLine.startsWith("A17 OK")) {
                    this.setFlagEvent(null)
                } else {
                    this.setFlagEvent(asciiToStr)
                }
                this.currentCmd = ""
            }

            //获取邮件大小
            if (lastLine.startsWith("A18")) {
                if (this.timerId != -1) {
                    clearTimeout(this.timerId)
                    MailLogger.info("ohos_mail size timeout clear")
                }
                if (lastLine.startsWith("A18 OK")) {
                    this.sizeEvent(true, Util.parserSize(asciiToStr))
                } else {
                    this.sizeEvent(false, asciiToStr)
                }
                this.currentCmd = ""
            }

            //获取邮件内容
            if (lastLine.startsWith("A19")) {
                if (this.timerId != -1) {
                    clearTimeout(this.timerId)
                    MailLogger.info("ohos_mail getContent timeout clear")
                }
                if (lastLine.startsWith("A19 OK")) {
                    this.isStartWrite = false
                    let index = this.responseDecode.indexOf("BODYSTRUCTURE")
                    let response = this.responseDecode.substring(index + 14, this.responseDecode.lastIndexOf(")"))
                    this.contentEvent(true, response)
                    this.responseDecode = ""
                } else {
                    this.contentEvent(false, asciiToStr)
                }
                this.currentCmd = ""
            }

            //获取邮件内容
            if (lastLine.startsWith("A22")) {
                if (this.timerId != -1) {
                    clearTimeout(this.timerId)
                    MailLogger.info("ohos_mail getBodyPart timeout clear")
                }
                if (lastLine.startsWith("A22 OK")) {
                    this.isStartWrite = false
                    let originString = this.responseDecode
                    const regex = /.*?BODY\[.*?\]\<.*?\>/;
                    let secondLineAndAfter = originString.replace(regex, "").trim();
                    secondLineAndAfter = secondLineAndAfter.replace(/^\{\d+\}/, "");
                    let normalContent = ""
                    if (secondLineAndAfter.startsWith("--")) {
                        normalContent = secondLineAndAfter.substring(secondLineAndAfter.indexOf("\r\n\r\n") + 2)
                    } else {
                        normalContent = secondLineAndAfter
                    }
                    let response: string = normalContent.substring(0, normalContent.lastIndexOf(")")).trim();
                    this.contentEvent(true, response)
                    this.responseDecode = ""
                } else {
                    this.contentEvent(false, asciiToStr)
                }
                this.currentCmd = ""
            }

            //设置ID
            if (lastLine.startsWith("A21")) {
                if (this.timerId != -1) {
                    clearTimeout(this.timerId)
                    MailLogger.info("ohos_mail id timeout clear")
                }
                if (lastLine.startsWith("A21 OK")) {
                    connectCallback(true, null)
                } else {
                    this.contentEvent(false, asciiToStr)
                }
                this.currentCmd = ""
            }

            if (lastLine.startsWith("A23")) {
                if (this.timerId != -1) {
                    clearTimeout(this.timerId)
                    MailLogger.info("ohos_mail copy timeout clear")
                }
                if (lastLine.startsWith("A23 OK")) {
                    let contentArr = asciiToStr.split(" ")
                    if (!!contentArr && contentArr.length > 5) {
                        let range = contentArr[5].substring(0, contentArr[5].length - 1).split(":")
                        try {
                            if (range.length > 1) {
                                let start = Number.parseInt(range[0])
                                let end = Number.parseInt(range[1])
                                let uidArr = new Array()
                                for (let i = start; i <= end; i++) {
                                    uidArr.push(i)
                                }
                                this.copyEvent(true, uidArr)
                            } else if (range.length == 1) {
                                this.copyEvent(true, [Number.parseInt(range[0])])
                            } else {
                                this.copyEvent(false, "copy uid response exception")
                            }
                        } catch (e) {
                            this.copyEvent(false, JSON.stringify(e))
                        }
                        return
                    }
                    this.copyEvent(true, null)
                } else {
                    this.copyEvent(false, lastLine)
                }
                this.currentCmd = ""
            }

            if (lastLine.startsWith("A24")) {
                if (this.timerId != -1) {
                    clearTimeout(this.timerId)
                    MailLogger.info("ohos_mail on message: connect server clear")
                }
                if (lastLine.startsWith("A24 OK")) {
                    this.isStartWrite = false
                    let msgNumLines: string[] = this.responseDecode.split("\r\n")
                    for (const msgNumLine of msgNumLines) {
                        if (msgNumLine.startsWith("*")) {
                            let msgNum = Number.parseInt(msgNumLine.split(" ")[1])
                            this.msgNumEvent(true, msgNum)
                            this.responseDecode = ""
                            return
                        }
                    }
                    this.msgNumEvent(false, "mail not exits")
                    this.responseDecode = ""
                } else {
                    this.msgNumEvent(false, asciiToStr)
                }
                this.currentCmd = ""
            }

            if (this.currentCmd == "A25") {
                if (lastLine.startsWith("A25 OK")) {
                    if (this.timerId != -1) {
                        clearTimeout(this.timerId)
                        MailLogger.info("ohos_mail on message: append data clear")
                    }
                    this.appendEvent(null)
                    this.currentCmd = ""
                } else if (lastLine.startsWith("+ Ready")) {
                    this.appendEvent(null)
                } else {
                    this.appendEvent(asciiToStr)
                    this.currentCmd = ""
                }
            }
        })
    }

    //登录Imap服务器
    private loginIMAPServer() {
        this.currentCmd = "A01"

        let cmd = this.isSSL ? "A01 LOGIN " + this.properties.getFrom() + " " + this.properties.getAuthorizationCode() + Constant.LINEFEED :
            {
                data: "A01 LOGIN " + this.properties.getFrom() + " " + this.properties.getAuthorizationCode() + Constant.LINEFEED,
                encoding: "UTF-8"
            }

        this.socket.send(cmd).then(() => {
            if (this.timerId != -1) {
                clearTimeout(this.timerId)
            }
            this.timerId = setTimeout(() => {
                this.connectCallback(false, " send message : connect server timeout")
            }, this.timeOutMillisecond)
            MailLogger.info('ohos_mail ' + JSON.stringify(cmd));
        }).catch(err => {
            this.connectCallback(false, "send login fail: " + JSON.stringify(err))
            MailLogger.error('ohos_mail send login fail :' + JSON.stringify(err));
        })
    }

    //发送ID
    private sendID() {
        let id = "("
        for (let entry of this.idMap.entries()) {
            id += "\"" + entry[0] + "\"" + " " + "\"" + entry[1] + "\" "
        }
        id = id.trim()
        id += ")"

        let cmd = this.isSSL ? "A21 ID " + id + Constant.LINEFEED :
            { data: "A21 ID " + id + Constant.LINEFEED,
                encoding: "UTF-8"
            }
        this.socket.send(cmd).then(() => {
            MailLogger.info('ohos_mail send id success');
        }).catch(err => {
            MailLogger.error('ohos_mail send id fail :' + JSON.stringify(err));
        })
    }

    //登录pop3服务器
    private async loginPop3Server() {
        await new Promise((resolve, reject) => {
            this.sendUser((err) => {
                if (!err) {
                    resolve("")
                } else {
                    reject(JSON.stringify(err))
                }
            })
        }).then((result) => {
            return new Promise((resolve, reject) => {
                this.sendPass((err) => {
                    if (!err) {
                        this.isConnect = true
                        resolve("")
                    } else {
                        reject(JSON.stringify(err))
                    }
                })
            })
        })
    }

    /**
     * 发送用户名(pop3)
     * @param event
     */
    private sendUser(event: (err) => void) {
        this.pop3Event = event
        let cmd = this.isSSL ? "USER " + this.properties.getFrom() + Constant.LINEFEED :
            { data: "USER " + this.properties.getFrom() + Constant.LINEFEED,
                encoding: "UTF-8" }

        this.socket.send(cmd).then(() => {
            this.currentCmd = "USER"
            if (this.timerId != -1) {
                clearTimeout(this.timerId)
            }
            this.timerId = setTimeout(() => {
                this.pop3Event("send USER timeout")
            }, this.timeOutMillisecond)
            MailLogger.info('ohos_mail-- send user success');
        }).catch(err => {
            this.pop3Event("send USER fail: " + JSON.stringify(err))
            MailLogger.info('ohos_mail-- send suer fail --' + JSON.stringify(err));
        })
    }

    /**
     * 发送验证码(pop3)
     * @param event
     */
    private sendPass(event: (err) => void) {
        this.pop3Event = event
        let cmd = this.isSSL ? "PASS " + this.properties.getAuthorizationCode() + Constant.LINEFEED :
            { data: "PASS " + this.properties.getAuthorizationCode() + Constant.LINEFEED,
                encoding: "UTF-8" }

        this.socket.send(cmd).then(() => {
            this.currentCmd = "PASS"
            if (this.timerId != -1) {
                clearTimeout(this.timerId)
            }
            this.timerId = setTimeout(() => {
                this.pop3Event("send PASS timeout")
            }, this.timeOutMillisecond)
            MailLogger.info('ohos_mail-- send pass success');
        }).catch(err => {
            this.pop3Event("send PASS fail: " + JSON.stringify(err))
            MailLogger.info('ohos_mail-- send pass fail --' + JSON.stringify(err));
        })
    }

    private sendStat(infoEvent) {
        let cmd = this.isSSL ? "STAT" + Constant.LINEFEED :
            { data: "STAT" + Constant.LINEFEED,
                encoding: "UTF-8" }

        this.infoEvent = infoEvent
        this.socket.send(cmd).then(() => {
            this.currentCmd = "STAT"
            if (this.timerId != -1) {
                clearTimeout(this.timerId)
            }
            this.timerId = setTimeout(() => {
                this.infoEvent("send STAT timeout")
            }, this.timeOutMillisecond)
            MailLogger.info('ohos_mail-- send stat success');
        }).catch(err => {
            this.infoEvent("send STAT fail: " + JSON.stringify(err))
            MailLogger.info('ohos_mail-- send stat fail--' + JSON.stringify(err));
        })
    }

    public noopPop3() {
        let cmd = this.isSSL ? "NOOP" + Constant.LINEFEED :
            { data: "NOOP" + Constant.LINEFEED,
                encoding: "UTF-8" }

        this.socket.send(cmd).then(() => {
            MailLogger.info('ohos_mail-- send noop');
        }).catch(err => {
            MailLogger.info('ohos_mail-- send noop fail --' + JSON.stringify(err));
        })
    }

    public getDefaultFolder(): Folder {
        if (!!!this.defaultFolder) {
            this.defaultFolder = new Folder("", this.properties.getProtocol())
            this.defaultFolder.setStore(this)
        }
        return this.defaultFolder
    }

    //获取邮箱
    public syncGetFolder(name: string): Promise<Folder> {
        return new Promise((resolve, reject) => {
            this.getFolder(name, (success, result) => {
                if (success) {
                    resolve(result)
                } else {
                    reject(result)
                }
            })
        })
    }

    //获取邮箱
    public getFolder(name: string, callback) {
        if (this.properties.protocol == "pop3") {
            if (name != "INBOX") {
                callback(false, "folder is not INBOX")
            } else {
                if (!!!this.folderList) {
                    this.folderList = new Array()
                    let folder = new Folder("INBOX", this.properties.getProtocol())
                    folder.setStore(this)
                    this.folderList.push(folder)
                    this.currFolder = folder
                }
                callback(true, this.folderList[0])
            }
            return
        }

        let nameIndex = -1
        if (!!this.folderList) {
            for (let i = 0; i < this.folderList.length; i++) {
                if (this.folderList[i].getName() == name) {
                    nameIndex = i
                }
            }

            if (nameIndex != -1) {
                this.currFolder = this.folderList[nameIndex]
                callback(true, this.folderList[nameIndex])
            } else {
                callback(false, name + " not found")
            }
            return
        }

        this.getFolderList((success, result) => {
            if (success) {
                if (!!result && result.length > 0) {
                    if (!!!this.folderList) {
                        this.folderList = new Array()
                        for (let i = 0; i < result.length; i++) {
                            let folder = new Folder(result[i], this.properties.getProtocol())
                            folder.setStore(this)
                            this.folderList.push(folder)
                            if (result[i] == name) {
                                nameIndex = i
                            }
                        }
                    }

                    if (nameIndex != -1) {
                        this.currFolder = this.folderList[nameIndex]
                        callback(true, this.folderList[nameIndex])
                    } else {
                        callback(false, name + " not found")
                    }
                }
            } else {
                callback(false, result)
            }
        })
    }

    //获取邮箱列表
    public getFolderList(event: (success, result) => void) {
        if (this.properties.getProtocol() == "pop3") {
            event(false, "pop3 not support")
            return
        }

        this.currentCmd = "A02"
        this.listEvent = event
        let cmd = this.isSSL ? "A02 LIST " + "\"" + "\" " + "\"*" + "\"" + Constant.LINEFEED :
            { data: "A02 LIST " + "\"" + "\" " + "\"*" + "\"" + Constant.LINEFEED,
                encoding: "UTF-8" }

        this.socket.send(cmd).then(() => {
            if (this.timerId != -1) {
                clearTimeout(this.timerId)
            }
            this.timerId = setTimeout(() => {
                this.listEvent(false, "send get mail box timeout")
            }, this.timeOutMillisecond)

            this.isStartWrite = true
            MailLogger.info('ohos_mail send get mail box list success');
        }).catch(err => {
            this.listEvent(false, "send LIST fail: " + JSON.stringify(err))
            MailLogger.info('ohos_mail send  list fail :' + JSON.stringify(err));
        })
    }

    //同步获取邮箱列表
    public syncGetFolderList(): Promise<Array<string>> {
        return new Promise((resolve, reject) => {
            this.getFolderList((success, result) => {
                if (success) {
                    resolve(result)
                } else {
                    reject()
                }
            })
        })
    }

    //打开邮箱
    public open(cmd: string, name: string, event: (err) => void) {
        this.infoEvent = event
        if (this.properties.getProtocol() == "pop3") {
            if (name != "INBOX") {
                return new Error("folder is not INBOX")
            } else {
                this.sendStat(event)
            }
            return
        }

        this.currentCmd = "A03"
        if (Util.isChinese(name)) {
            name = imapEncode(name)
        }

        let protocolCmd = this.isSSL ? "A03 " + cmd + " \"" + name + "\"" + Constant.LINEFEED :
            { data: "A03 " + cmd + " \"" + name + "\"" + Constant.LINEFEED,
                encoding: "UTF-8" }

        this.socket.send(protocolCmd).then(() => {
            if (this.timerId != -1) {
                clearTimeout(this.timerId)
            }
            this.timerId = setTimeout(() => {
                this.infoEvent("send select folder timeout")
            }, this.timeOutMillisecond)
            this.isStartWrite = true
            MailLogger.info('ohos_mail send select folder success' + JSON.stringify(protocolCmd));
        }).catch(err => {
            this.infoEvent("send select folder fail: " + JSON.stringify(err))
            MailLogger.error('ohos_mail send select folder fail :' + JSON.stringify(err));
        })
    }

    //获取邮件UID
    public getMailUID(index: number, callBack) {
        this.uidEvent = callBack
        if (this.properties.getProtocol() == "pop3") {

            let cmd = this.isSSL ? "UIDL " + index + Constant.LINEFEED :
                { data: "UIDL " + index + Constant.LINEFEED,
                    encoding: "UTF-8" }

            this.socket.send(cmd).then(() => {
                this.currentCmd = "UIDL"
                if (this.timerId != -1) {
                    clearTimeout(this.timerId)
                }
                this.timerId = setTimeout(() => {
                    this.uidEvent(false, "send UIDL timeout")
                }, this.timeOutMillisecond)
                MailLogger.info('ohos_mail send get mail uid success ');
            }).catch(err => {
                this.uidEvent(false, "send UIDL fail: " + JSON.stringify(err))
                MailLogger.error('ohos_mail send get mail uid fail :' + JSON.stringify(err));
            })
            return
        }

        this.currentCmd = "A07"

        let cmd = this.isSSL ? "A07 Fetch " + index + " (UID)" + Constant.LINEFEED :
            { data: "A07 Fetch " + index + " (UID)" + Constant.LINEFEED,
                encoding: "UTF-8" }

        this.socket.send(cmd).then(() => {
            if (this.timerId != -1) {
                clearTimeout(this.timerId)
            }
            this.timerId = setTimeout(() => {
                this.uidEvent(false, "send get mail uid timeout")
            }, this.timeOutMillisecond)
            this.isStartWrite = true
            MailLogger.info('ohos_mail send get mail uid success ');
        }).catch(err => {
            this.uidEvent(false, "send fetch uid fail: " + JSON.stringify(err))
            MailLogger.error('ohos_mail send fetch uid fail :' + JSON.stringify(err));
        })
    }

    public getMsgNumByUid(uid, callback) {
        if (this.properties.getProtocol() == "pop3") {
            return callback(false, "pop3 not support")
        }

        this.currentCmd = "A24"
        this.msgNumEvent = callback
        let cmd = this.isSSL ? "A24 UID Fetch " + uid + " (UID)" + Constant.LINEFEED :
            { data: "A24 UID Fetch " + uid + " (UID)" + Constant.LINEFEED,
                encoding: "UTF-8" }

        this.socket.send(cmd).then(() => {
            if (this.timerId != -1) {
                clearTimeout(this.timerId)
            }
            this.timerId = setTimeout(() => {
                this.msgNumEvent(false, "send get msgNum timeout")
            }, this.timeOutMillisecond)
            this.isStartWrite = true
            MailLogger.info('ohos_mail send get msgNum success ' + JSON.stringify(cmd));
        }).catch(err => {
            this.msgNumEvent(false, "send get msgNum fail: " + JSON.stringify(err))
            MailLogger.error('ohos_mail send get msgNum fail :' + JSON.stringify(err));
        })
    }

    /**
     * 新建文件夹（promise形式）
     * @param name 新建文件夹的名字
     */
    public syncCreateFolder(name: string): Promise<string> {
        return new Promise((resolve, reject) => {
            this.createFolder(name, (success, result) => {
                if (success) {
                    resolve(result)
                } else {
                    reject(result)
                }
            })
        })
    }

    //新建邮箱
    public createFolder(name: string, callback) {
        if (this.properties.getProtocol() == "pop3") {
            callback(false, "pop3 not support")
            return
        }

        this.currentCmd = "A08"

        this.createMailBoxEvent = callback
        let cmd = this.isSSL ? "A08 CREATE " + name + Constant.LINEFEED :
            { data: "A08 CREATE " + name + Constant.LINEFEED,
                encoding: "UTF-8" }

        this.socket.send(cmd).then(() => {
            if (this.timerId != -1) {
                clearTimeout(this.timerId)
            }
            this.timerId = setTimeout(() => {
                this.createMailBoxEvent(false, "send create mailbox timeout")
            }, this.timeOutMillisecond)
            MailLogger.info('ohos_mail send create mailbox success ');
        }).catch(err => {
            this.createMailBoxEvent(false, "send CREATE fail: " + JSON.stringify(err))
            MailLogger.error('ohos_mail send  CREATE fail :' + JSON.stringify(err));
        })
    }

    /**
     * 删除邮箱（promise形式）
     * @param name 删除邮箱的名字
     */
    public syncDeleteFolder(name: string): Promise<string> {
        return new Promise((resolve, reject) => {
            this.deleteFolder(name, (success, result) => {
                if (success) {
                    resolve(result)
                } else {
                    reject(result)
                }
            })
        })
    }

    //删除邮箱
    public deleteFolder(name: string, callback) {
        if (this.properties.getProtocol() == "pop3") {
            callback(false, "pop3 not support")
            return
        }

        this.currentCmd = "A09"
        this.deleteMailBoxEvent = callback
        let cmd = this.isSSL ? "A09 DELETE " + name + Constant.LINEFEED :
            { data: "A09 DELETE " + name + Constant.LINEFEED,
                encoding: "UTF-8" }

        this.socket.send(cmd).then(() => {
            if (this.timerId != -1) {
                clearTimeout(this.timerId)
            }
            this.timerId = setTimeout(() => {
                this.deleteMailBoxEvent(false, "send delete mailbox timeout")
            }, this.timeOutMillisecond)
            MailLogger.info('ohos_mail send delete mailbox success ');
        }).catch(err => {
            this.deleteMailBoxEvent(false, "send DELETE fail: " + JSON.stringify(err))
            MailLogger.error('ohos_mail send DELETE fail :' + JSON.stringify(err));
        })
    }

    /**
     * 重命名邮箱（promise形式）
     * @param oldName 原名
     * @param newName 新名字
     */
    public syncRenameFolder(oldName: string, newName: string): Promise<string> {
        return new Promise((resolve, reject) => {
            this.renameFolder(oldName, newName, (success, result) => {
                if (success) {
                    resolve(result)
                } else {
                    reject(result)
                }
            })
        })
    }

    //邮箱重命名
    public renameFolder(oldName: string, newName: string, callback) {
        if (this.properties.getProtocol() == "pop3") {
            callback(false, "pop3 not support")
            return
        }

        this.currentCmd = "A10"
        this.renameMailBoxEvent = callback

        let cmd = this.isSSL ? "A10 RENAME " + oldName + " " + newName + Constant.LINEFEED :
            { data: "A10 RENAME " + oldName + " " + newName + Constant.LINEFEED,
                encoding: "UTF-8" }

        this.socket.send(cmd).then(() => {
            if (this.timerId != -1) {
                clearTimeout(this.timerId)
            }
            this.timerId = setTimeout(() => {
                this.renameMailBoxEvent(false, "send rename mailBox timeout")
            }, this.timeOutMillisecond)
            MailLogger.info('ohos_mail send rename mailBox success ');
        }).catch(err => {
            this.renameMailBoxEvent(false, "send RENAME fail: " + JSON.stringify(err))
            MailLogger.error('ohos_mail send RENAME fail :' + JSON.stringify(err));
        })
    }

    //获取删除邮件
    public getDeletedMessageCount(callback) {
        if (this.properties.getProtocol() == "pop3") {
            callback(false, "pop3 not support")
            return
        }


        this.currentCmd = "A11"
        this.deleteMsgCountEvent = callback
        let cmd = this.isSSL ? "A11 SEARCH DELETED ALL" + Constant.LINEFEED :
            { data: "A11 SEARCH DELETED ALL" + Constant.LINEFEED,
                encoding: "UTF-8" }

        this.socket.send(cmd).then(() => {
            if (this.timerId != -1) {
                clearTimeout(this.timerId)
            }
            this.timerId = setTimeout(() => {
                this.deleteMsgCountEvent(false, "send get deleted message count timeout")
            }, this.timeOutMillisecond)
            MailLogger.info('ohos_mail send get deleted message count success');
        }).catch(err => {
            this.deleteMsgCountEvent(false, "send get deleted message count fail: " + JSON.stringify(err))
            MailLogger.error('ohos_mail send get deleted message count fail :' + JSON.stringify(err));
        })
    }

    //获取一个邮箱是否存在
    public exists(name: string, callback) {
        if (this.properties.getProtocol() == "pop3") {
            callback(false, "pop3 not support")
            return
        }

        this.currentCmd = "A12"
        this.existsEvent = callback
        let cmd = this.isSSL ? "A12 LIST " + "\"" + "\" " + name + Constant.LINEFEED :
            { data: "A12 LIST " + "\"" + "\" " + name + Constant.LINEFEED,
                encoding: "UTF-8" }

        this.socket.send(cmd).then(() => {
            if (this.timerId != -1) {
                clearTimeout(this.timerId)
            }
            this.timerId = setTimeout(() => {
                this.existsEvent(false, "send exists timeout")
            }, this.timeOutMillisecond)
            MailLogger.info('ohos_mail send exists success');
        }).catch(err => {
            this.existsEvent(false, "send exists fail: " + JSON.stringify(err))
            MailLogger.error('ohos_mail send exists fail :' + JSON.stringify(err));
        })
    }

    //移动邮件
    public moveMessages(msgNum: number[], dstFolderName: string, callback) {
        if (this.properties.getProtocol() == "pop3") {
            callback(false, "pop3 not support")
            return
        }

        this.moveEvent = callback
        let srcMsg = ''
        if (!!!msgNum || msgNum.length == 0) {
            return
        }

        if (msgNum.length == 1) {
            srcMsg = msgNum[0] + ''
        } else {
            for (let i = 0; i < msgNum.length; i++) {
                if (i != msgNum.length - 1) {
                    srcMsg = srcMsg + msgNum[i] + ','
                } else {
                    srcMsg = srcMsg + msgNum[i]
                }
            }
        }

        this.currentCmd = "A13"

        if (Util.isChinese(dstFolderName)) {
            dstFolderName = imapEncode(dstFolderName)
        }

        let cmd = this.isSSL ? 'A13 MOVE ' + srcMsg + " \"" + dstFolderName + "\"" + Constant.LINEFEED :
            { data: 'A13 MOVE ' + srcMsg + " \"" + dstFolderName + "\"" + Constant.LINEFEED,
                encoding: "UTF-8" }

        this.socket.send(cmd).then(() => {
            if (this.timerId != -1) {
                clearTimeout(this.timerId)
            }
            this.timerId = setTimeout(() => {
                this.moveEvent(false, "send move timeout")
            }, this.timeOutMillisecond)
            MailLogger.info('ohos_mail send move success' + JSON.stringify(cmd));
        }).catch(err => {
            this.moveEvent(false, "send move fail: " + JSON.stringify(err))
            MailLogger.error('ohos_mail send move fail :' + JSON.stringify(err));
        })
    }

    //复制邮件
    public copyMessages(msgNum: number[], dstFolderName: string, callback) {
        if (this.properties.getProtocol() == "pop3") {
            callback(false, "pop3 not support")
            return
        }

        this.copyEvent = callback
        let srcMsg = ''
        if (!!!msgNum || msgNum.length == 0) {
            return
        }

        if (msgNum.length == 1) {
            srcMsg = msgNum[0] + ''
        } else {
            for (let i = 0; i < msgNum.length; i++) {
                if (i != msgNum.length - 1) {
                    srcMsg = srcMsg + msgNum[i] + ','
                } else {
                    srcMsg = srcMsg + msgNum[i]
                }
            }
        }
        this.currentCmd = "A23"

        if (Util.isChinese(dstFolderName)) {
            dstFolderName = imapEncode(dstFolderName)
        }

        let cmd = this.isSSL ? 'A23 COPY ' + srcMsg + " \"" + dstFolderName + "\"" + Constant.LINEFEED :
            { data: 'A23 COPY ' + srcMsg + " \"" + dstFolderName + "\"" + Constant.LINEFEED,
                encoding: "UTF-8" }

        this.socket.send(cmd).then(() => {
            if (this.timerId != -1) {
                clearTimeout(this.timerId)
            }
            this.timerId = setTimeout(() => {
                this.copyEvent(false, "send copy timeout")
            }, this.timeOutMillisecond)
            MailLogger.info('ohos_mail send copy success' + JSON.stringify(cmd));
        }).catch(err => {
            this.copyEvent(false, "send copy fail: " + JSON.stringify(err))
            MailLogger.error('ohos_mail send copy fail :' + JSON.stringify(err));
        })
    }

    //获取邮件header
    public getHeader(msgNum: number, headerName, callback) {
        if (this.properties.getProtocol() == "pop3") {
            callback(false, "pop3 not support get the specified header")
            return
        }

        this.currentCmd = "A14"
        this.headerEvent = callback
        let cmd = this.isSSL ? 'A14 FETCH ' + msgNum + " (BODY.PEEK[HEADER.FIELDS (" + headerName + ")]) " + Constant.LINEFEED :
            { data: 'A14 FETCH ' + msgNum + " (BODY.PEEK[HEADER.FIELDS (" + headerName + ")]) " + Constant.LINEFEED,
                encoding: "UTF-8" }

        this.socket.send(cmd).then(() => {
            if (this.timerId != -1) {
                clearTimeout(this.timerId)
            }
            this.timerId = setTimeout(() => {
                this.headerEvent(false, "send getHeader timeout")
            }, this.timeOutMillisecond)
            MailLogger.info('ohos_mail send getHeader success');
        }).catch(err => {
            this.headerEvent(false, "send getHeader fail: " + JSON.stringify(err))
            MailLogger.error('ohos_mail send getHeader fail :' + JSON.stringify(err));
        })
    }

    //获取邮件所有header
    public geAllHeader(msgNum: number, callback) {
        this.allHeaderEvent = callback
        if (this.properties.getProtocol() == "pop3") {
            let cmd = this.isSSL ? 'TOP ' + msgNum + " 0" + Constant.LINEFEED :
                { data: 'TOP ' + msgNum + " 0" + Constant.LINEFEED,
                    encoding: "UTF-8" }

            this.socket.send(cmd).then(() => {
                this.currentCmd = "TOP"
                if (this.timerId != -1) {
                    clearTimeout(this.timerId)
                }
                this.timerId = setTimeout(() => {
                    this.allHeaderEvent(false, "send TOP timeout")
                }, this.timeOutMillisecond)
                this.isStartWrite = true
                MailLogger.info('ohos_mail send TOP success');
            }).catch(err => {
                this.allHeaderEvent(false, "send TOP fail: " + JSON.stringify(err))
                MailLogger.error('ohos_mail send TOP fail :' + JSON.stringify(err));
            })
            return
        }

        this.currentCmd = "A15"

        let cmd = this.isSSL ? 'A15 FETCH ' + msgNum + " (BODY.PEEK[HEADER])" + Constant.LINEFEED :
            { data: 'A15 FETCH ' + msgNum + " (BODY.PEEK[HEADER])" + Constant.LINEFEED,
                encoding: "UTF-8" }

        this.socket.send(cmd).then(() => {
            if (this.timerId != -1) {
                clearTimeout(this.timerId)
            }
            this.timerId = setTimeout(() => {
                this.allHeaderEvent(false, "send geAllHeader timeout")
            }, this.timeOutMillisecond)
            this.isStartWrite = true
            MailLogger.info('ohos_mail send geAllHeader success');
        }).catch(err => {
            this.allHeaderEvent(false, "send geAllHeader fail: " + JSON.stringify(err))
            MailLogger.error('ohos_mail send geAllHeader fail :' + JSON.stringify(err));
        })
    }

    //获取邮件所有flag
    public getFlags(msgNum: number, callback) {
        if (this.properties.getProtocol() == "pop3") {
            callback(false, "pop3 not support")
            return
        }

        this.currentCmd = "A16"

        this.flagsEvent = callback
        let cmd = this.isSSL ? 'A16 FETCH ' + msgNum + " (FLAGS)" + Constant.LINEFEED :
            { data: 'A16 FETCH ' + msgNum + " (FLAGS)" + Constant.LINEFEED,
                encoding: "UTF-8" }

        this.socket.send(cmd).then(() => {
            if (this.timerId != -1) {
                clearTimeout(this.timerId)
            }
            this.timerId = setTimeout(() => {
                this.flagsEvent(false, "send getFlags timeout")
            }, this.timeOutMillisecond)
            this.isStartWrite = true
            MailLogger.info('ohos_mail send getFlags success//:' + JSON.stringify(cmd));
        }).catch(err => {
            this.flagsEvent(false, "send getFlags fail: " + JSON.stringify(err))
            MailLogger.error('ohos_mail send getFlags fail :' + JSON.stringify(err));
        })
    }

    //设置邮件flag
    public setFlag(msgNum: number, flags: Flag[], isAdd, callback) {
        this.setFlagEvent = callback

        if (this.properties.getProtocol() == "pop3") {
            if (flags.includes(Flag.DELETED)) {
                let cmd = this.isSSL ? 'DELE ' + msgNum + Constant.LINEFEED :
                    { data: 'DELE ' + msgNum + Constant.LINEFEED,
                        encoding: "UTF-8" }

                this.socket.send(cmd).then(() => {
                    this.currentCmd = "DELE"
                    if (this.timerId != -1) {
                        clearTimeout(this.timerId)
                    }
                    this.timerId = setTimeout(() => {
                        this.setFlagEvent(false, "send DELE timeout")
                    }, this.timeOutMillisecond)
                    MailLogger.info('ohos_mail send setFlag success');
                }).catch(err => {
                    this.setFlagEvent(false, "send DELE fail: " + JSON.stringify(err))
                    MailLogger.error('ohos_mail send DELE fail :' + JSON.stringify(err));
                })
            } else {
                this.setFlagEvent("pop3 only support Flag.DELETED flag")
            }
            return
        }

        this.currentCmd = "A17"

        let flagCmd = ""
        if (!!flags) {
            for (let i = 0; i < flags.length; i++) {
                if (i != flags.length - 1) {
                    flagCmd += flags[i] + " "
                } else {
                    flagCmd += flags[i]
                }
            }
        }

        let flagsCme = isAdd ? " +FLAGS " : " -FLAGS "
        let cmd = this.isSSL ? 'A17 STORE ' + msgNum + flagsCme + '(' + flagCmd + ')' + Constant.LINEFEED :
            { data: 'A17 STORE ' + msgNum + flagsCme + '(' + flagCmd + ')' + Constant.LINEFEED,
                encoding: "UTF-8" }

        this.socket.send(cmd).then(() => {
            if (this.timerId != -1) {
                clearTimeout(this.timerId)
            }
            this.timerId = setTimeout(() => {
                this.setFlagEvent(false, "send setFlag timeout")
            }, this.timeOutMillisecond)
            MailLogger.info('ohos_mail send setFlag success' + 'A17 STORE ' + msgNum + ' +FLAGS ' + '(' + flagCmd + ')' + Constant.LINEFEED);
        }).catch(err => {
            this.setFlagEvent(false, "send setFlag fail: " + JSON.stringify(err))
            MailLogger.error('ohos_mail send setFlag fail :' + JSON.stringify(err));
        })
    }

    //获取邮件大小
    public getSize(msgNum: number, callback) {
        this.sizeEvent = callback
        if (this.properties.getProtocol() == "pop3") {

            let cmd = this.isSSL ? 'LIST ' + msgNum + Constant.LINEFEED :
                { data: 'LIST ' + msgNum + Constant.LINEFEED,
                    encoding: "UTF-8" }

            this.socket.send(cmd).then(() => {
                this.currentCmd = "LIST"
                if (this.timerId != -1) {
                    clearTimeout(this.timerId)
                }
                this.timerId = setTimeout(() => {
                    this.sizeEvent(false, "send LIST timeout")
                }, this.timeOutMillisecond)
                MailLogger.info('ohos_mail send getSize success');
            }).catch(err => {
                this.sizeEvent(false, "send getSize fail: " + JSON.stringify(err))
                MailLogger.error('ohos_mail send getSize fail :' + JSON.stringify(err));
            })
            return
        }

        this.currentCmd = "A18"

        let cmd = this.isSSL ? 'A18 Fetch ' + msgNum + ' RFC822.SIZE' + Constant.LINEFEED :
            { data: 'A18 Fetch ' + msgNum + ' RFC822.SIZE' + Constant.LINEFEED,
                encoding: "UTF-8" }

        this.socket.send(cmd).then(() => {
            if (this.timerId != -1) {
                clearTimeout(this.timerId)
            }
            this.timerId = setTimeout(() => {
                this.sizeEvent(false, "send getSize timeout")
            }, this.timeOutMillisecond)
            MailLogger.info('ohos_mail send getSize success');
        }).catch(err => {
            this.sizeEvent(false, "send getSize fail: " + JSON.stringify(err))
            MailLogger.error('ohos_mail send getSize fail :' + JSON.stringify(err));
        })
    }

    public getBodyPart(isAttachment: boolean, fileSize: number, msgNum: number, section: string, callback) {
        this.isAttachment = isAttachment
        this.isAttachmentFirstLine = true
        this.receivedDataSize = 0
        this.attachmentSize = fileSize
        if (this.properties.getProtocol() == "pop3") {
            return callback(false, "pop3 not support")
        }

        this.currentCmd = "A22"
        this.contentEvent = callback
        let cmd = this.isSSL ? 'A22 Fetch ' + msgNum + section + Constant.LINEFEED :
            { data: 'A22 Fetch ' + msgNum + section + Constant.LINEFEED,
                encoding: "UTF-8" }

        this.socket.send(cmd).then(() => {
            if (this.timerId != -1) {
                clearTimeout(this.timerId)
            }
            this.timerId = setTimeout(() => {
                this.contentEvent(false, "send getBodyPart timeout")
            }, this.timeOutMillisecond)
            this.isStartWrite = true
            MailLogger.info('ohos_mail send getBodyPart success--' + JSON.stringify(cmd));
        }).catch(err => {
            this.contentEvent(false, "send getBodyPart fail: " + JSON.stringify(err))
            MailLogger.error('ohos_mail send getBodyPart fail :' + JSON.stringify(err));
        })
    }

    public getLineText(msgNum, linesCount, callback) {
        if (this.properties.getProtocol() == "imap") {
            return callback(false, "imap not support")
        }

        this.topLinesContent = callback
        this.currentCmd = "TOPLINE"

        let cmd = this.isSSL ? 'TOP ' + msgNum + " " + linesCount + Constant.LINEFEED :
            { data: 'TOP ' + msgNum + " " + linesCount + Constant.LINEFEED,
                encoding: "UTF-8" }

        this.socket.send(cmd).then(() => {
            if (this.timerId != -1) {
                clearTimeout(this.timerId)
            }
            this.timerId = setTimeout(() => {
                this.topLinesContent(false, "send TOPLINE timeout")
            }, this.timeOutMillisecond)
            this.isStartWrite = true
            MailLogger.info('ohos_mail send TOPLINE success');
        }).catch(err => {
            this.topLinesContent(false, "send TOPLINE fail: " + JSON.stringify(err))
            MailLogger.error('ohos_mail send TOPLINE fail :' + JSON.stringify(err));
        })
        return
    }

    //获取邮件完整内容
    public getContent(msgNum: number, callback) {
        this.contentEvent = callback
        if (this.properties.getProtocol() == "pop3") {

            let cmd = this.isSSL ? "RETR " + msgNum + Constant.LINEFEED :
                { data: "RETR " + msgNum + Constant.LINEFEED,
                    encoding: "UTF-8" }

            this.socket.send(cmd).then(() => {
                this.currentCmd = "RETR"
                if (this.timerId != -1) {
                    clearTimeout(this.timerId)
                }
                this.timerId = setTimeout(() => {
                    this.contentEvent(false, "send RETR timeout")
                }, this.timeOutMillisecond)
                this.isStartWrite = true
                MailLogger.info('ohos_mail send RETR success');
            }).catch(err => {
                this.contentEvent(false, "send RETR fail: " + JSON.stringify(err))
                MailLogger.error('ohos_mail send RETR fail :' + JSON.stringify(err));
            })
            return
        }

        this.currentCmd = "A19"

        let cmd = this.isSSL ? 'A19 Fetch ' + msgNum + ' (BODYSTRUCTURE)' + Constant.LINEFEED :
            { data: 'A19 Fetch ' + msgNum + ' (BODYSTRUCTURE)' + Constant.LINEFEED,
                encoding: "UTF-8" }

        this.socket.send(cmd).then(() => {
            if (this.timerId != -1) {
                clearTimeout(this.timerId)
            }
            this.timerId = setTimeout(() => {
                this.contentEvent(false, "send getContent timeout")
            }, this.timeOutMillisecond)
            this.isStartWrite = true
            MailLogger.info('ohos_mail send getContent success' + JSON.stringify(cmd));
        }).catch(err => {
            this.contentEvent(false, "send Fetch msgNum BODYSTRUCTURE fail: " + JSON.stringify(err))
            MailLogger.error('ohos_mail send Fetch msgNum BODYSTRUCTURE fail :' + JSON.stringify(err));
        })
    }

    public async appendMessage(command, msgData, appendEvent) {
        await new Promise((resolve, reject) => {
            this.sendAppend(command, (err) => {
                if (!err) {
                    resolve("")
                } else {
                    appendEvent(JSON.stringify(err))
                    reject(JSON.stringify(err))
                }
            })
        }).then((result) => {
            return new Promise((resolve, reject) => {
                this.appendMsg(msgData, (err) => {
                    if (!err) {
                        appendEvent(null)
                        resolve("")
                    } else {
                        appendEvent(JSON.stringify(err))
                        reject(JSON.stringify(err))
                    }
                })
            })
        })
    }

    private sendAppend(appendCmd, callback) {
        this.appendEvent = callback
        let cmd = this.isSSL ? 'A25 APPEND ' + appendCmd + Constant.LINEFEED :
            { data: 'A25 APPEND ' + appendCmd + Constant.LINEFEED,
                encoding: "UTF-8" }

        this.socket.send(cmd).then(() => {
            this.currentCmd = "A25"
            if (this.timerId != -1) {
                clearTimeout(this.timerId)
            }
            this.timerId = setTimeout(() => {
                this.appendEvent(false, "send append timeout")
            }, this.timeOutMillisecond)
            MailLogger.info('ohos_mail send append success' + JSON.stringify(cmd));
        }).catch(err => {
            this.appendEvent(false, "send append fail: " + JSON.stringify(err))
            MailLogger.error('ohos_mail send append fail :' + JSON.stringify(err));
        })
    }

    private appendMsg(msgData, callback) {
        this.appendEvent = callback
        let cmd = this.isSSL ? msgData :
            { data: msgData, encoding: "UTF-8" }

        this.socket.send(cmd).then(() => {
            if (this.timerId != -1) {
                clearTimeout(this.timerId)
            }
            this.timerId = setTimeout(() => {
                this.appendEvent(false, "send append data timeout")
            }, this.timeOutMillisecond)
            MailLogger.info('ohos_mail send append data success' + JSON.stringify(cmd));
        }).catch(err => {
            this.appendEvent(false, "send append data fail: " + JSON.stringify(err))
            MailLogger.error('ohos_mail send append data fail :' + JSON.stringify(err));
        })
    }

    //删除所有 标记位delete的邮件
    public expunge(callback: (err) => void) {
        this.expungeEvent = callback
        if (this.properties.getProtocol() == "pop3") {
            this.quit(callback)
            return
        }

        let cmd = this.isSSL ? "A04 Expunge " + Constant.LINEFEED :
            { data: "A04 Expunge " + Constant.LINEFEED,
                encoding: "UTF-8" }

        this.socket.send(cmd).then(() => {
            if (this.timerId != -1) {
                clearTimeout(this.timerId)
            }
            this.timerId = setTimeout(() => {
                this.expungeEvent("send expunge timeout")
            }, this.timeOutMillisecond)
            MailLogger.info('ohos_mail send expunge success');
        }).catch(err => {
            this.expungeEvent("send Expunge fail: " + JSON.stringify(err))
            MailLogger.error('ohos_mail send expunge fail :' + JSON.stringify(err));
        })
    }

    //NOOP命令什么也不做，用来向服务器发送自动命令，防止因长时间处于不活动状态而导致连接中断，服务器对该命令的响应始终为肯定。无参数。
    public noop(): void {
        let cmd = this.isSSL ? "A05 NOOP" :
            { data: "A05 NOOP",
                encoding: "UTF-8" }

        this.socket.send(cmd).then(() => {
            MailLogger.info('ohos_mail send noop success');
        }).catch(err => {
            MailLogger.error('ohos_mail send noop fail :' + JSON.stringify(err));
        })
    }

    //LOGOUT命令使当前登陆用户退出登陆并关闭所有打开的邮箱，任何做了\DELETED标志的邮件都将在这个时候被删除。
    public logout(callback) {
        let cmd = this.isSSL ? "A06 LOGOUT" :
            { data: "A06 LOGOUT",
                encoding: "UTF-8" }

        this.socket.send(cmd).then(() => {
            this.socket.close(err => {
                if (err) {
                    MailLogger.info('ohos_mail send logout socket fail');
                    callback(false)
                    return;
                }
                MailLogger.info('ohos_mail send logout socket success');
                callback(true)
            })
            MailLogger.info('ohos_mail send logout success');
        }).catch(err => {
            MailLogger.error('ohos_mail send logout fail :' + JSON.stringify(err));
            this.socket.close(err => {
                if (err) {
                    MailLogger.info('ohos_mail send logout socket fail');
                    callback(false)
                    return;
                }
                MailLogger.info('ohos_mail send logout socket success');
                callback(true)
            })
        })
    }

    /**
     * 关闭对当前 邮箱/文件夹 的访问（promise形式）
     */
    public syncClose(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.close((success) => {
                if (success) {
                    resolve()
                } else {
                    reject()
                }
            })
        })
    }

    //关闭对当前 邮箱/文件夹 的访问
    public close(callback) {
        if (this.properties.getProtocol() == "pop3") {
            this.quit((err) => {
                if (!err) {
                    this.socket.close(err => {
                        if (err) {
                            MailLogger.info('ohos_mail send logout socket fail');
                            callback(false)
                            return;
                        }
                        callback(true)
                        MailLogger.info('ohos_mail send logout socket success');
                    })
                } else {
                    callback(false)
                }
            })
            return
        }

        let cmd = this.isSSL ? "A20 CLOSE" :
            { data: "A20 CLOSE",
                encoding: "UTF-8" }

        this.socket.send(cmd).then(() => {
            MailLogger.info('ohos_mail send close success');
            this.logout(callback)
            this.isConnect = false
        }).catch(err => {
            callback(false)
            MailLogger.error('ohos_mail send close fail :' + JSON.stringify(err));
        })
    }

    //结束邮件接收过程，pop3接收到此命令后删除所有设置删除标记的邮件，并关闭与pop3客户端程序的网络链接。
    public quit(callback?) {
        this.quitEvent = callback
        let cmd = this.isSSL ? "QUIT" + Constant.LINEFEED :
            { data: "QUIT" + Constant.LINEFEED,
                encoding: "UTF-8" }

        this.socket.send(cmd).then(() => {
            this.currentCmd = "QUIT"
            if (this.timerId != -1) {
                clearTimeout(this.timerId)
            }
            this.timerId = setTimeout(() => {
                this.quitEvent("send QUIT timeout")
            }, this.timeOutMillisecond)
            MailLogger.info('ohos_mail send quit success');
        }).catch(err => {
            this.quitEvent("send QUIT fail: " + JSON.stringify(err))
            MailLogger.error('ohos_mail send quit fail :' + JSON.stringify(err));
        })
    }

    private resetTimeOut() {
        if (this.timerId != -1) {
            clearTimeout(this.timerId)
        }
        this.timerId = setTimeout(() => {
            MailLogger.info("ohos_mail timeout currentCmd-----" + this.currentCmd)
            switch (this.currentCmd) {
                case "A01":
                    this.connectCallback(false, "connect server response timeout")
                    break
                case "A02":
                    this.listEvent(false, "get mail box response timeout")
                    break
                case "A03":
                    this.infoEvent("select folder response timeout")
                    break
                case "A04":
                    this.expungeEvent(false, "expunge timeout")
                    break
                case "A07":
                    this.uidEvent(false, "get mail uid response timeout")
                    break
                case "A08":
                    this.createMailBoxEvent(false, "create mailbox response timeout")
                    break
                case "A09":
                    this.deleteMailBoxEvent(false, "delete mailbox response timeout")
                    break
                case "A10":
                    this.renameMailBoxEvent(false, "rename mailBox response timeout")
                    break
                case "A11":
                    this.deleteMsgCountEvent(false, "get deleted message count response timeout")
                    break
                case "A12":
                    this.existsEvent(false, "exists response timeout")
                    break
                case "A13":
                    this.moveEvent(false, "move response timeout")
                    break
                case "A14":
                    this.headerEvent(false, "getHeader response timeout")
                    break
                case "A15":
                    this.allHeaderEvent(false, "geAllHeader response timeout")
                    break
                case "A16":
                    this.flagsEvent(false, "getFlags response timeout")
                    break
                case "A17":
                    this.setFlagEvent(false, "setFlags response timeout")
                    break
                case "A18":
                    this.sizeEvent(false, "getSize response timeout")
                    break
                case "A19":
                    this.contentEvent(false, "getContent response timeout")
                    break
                case "A21":
                    this.connectCallback(false, "id response timeout")
                    break
                case "A22":
                    this.contentEvent(false, "getBodyPart response timeout")
                    break
                case "A23":
                    this.copyEvent(false, "copy response timeout")
                    break
                case "A24":
                    this.msgNumEvent(false, "get msgNum response timeout")
                    break
                case "USER":
                case "PASS":
                    this.pop3Event("pop3 auth response timeout")
                    break
                case "STAT":
                    this.infoEvent("pop3 STAT response timeout")
                    break
                case "UIDL":
                    this.uidEvent(false, "pop3 uidl response timeout")
                    break
                case "TOP":
                    this.allHeaderEvent(false, "pop3 top response timeout")
                    break
                case "DELE":
                    this.setFlagEvent(false, "pop3 DELE response timeout")
                    break
                case "LIST":
                    this.sizeEvent(false, "pop3 LIST response timeout")
                    break
                case "TOPLINE":
                    this.topLinesContent(false, "pop3 TOPLINE response timeout")
                    break
                case "RETR":
                    this.contentArrayBufferList.length = 0
                    this.perResponse = ""
                    this.contentEvent(false, "pop3 RETR response timeout")
                    break
                case "QUIT":
                    this.quitEvent("pop3 QUIT response timeout")
                    break
            }
        }, this.timeOutMillisecond)
    }
}


