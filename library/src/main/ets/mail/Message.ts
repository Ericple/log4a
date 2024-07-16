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
 * Based on Message.java written by
 * Copyright (c) 1997, 2023 Oracle and/or its affiliates.
 *
 */

import { AttachmentBody } from './AttachmentBody'
import { RecipientType } from './RecipientType';
import { Folder } from './Folder';
import { EmlFormat } from '../emlformat/EmlFormat';
import Result from '../emlformat/Result';
import { Util } from '../Util';
import { Flag } from './Flag';
import { MimeMultipart } from './MimeMultipart';
import { MailLogger } from '../MailLogger';

/**
 * 邮件实体类以及邮件相关操作
 */
export class Message {
    private date: string
    private subject: string
    private fromArray: string[]
    private to: string[]
    private Cc: string[]
    private Bcc: string[]
    private text: string = ""
    private files: Array<AttachmentBody>;
    private inlineFiles: Array<AttachmentBody>;
    private mimeVersion: string;
    private contentType: string;
    private html: string = ""
    private lineCount: number
    private size: number
    private expunged: boolean
    private msgnum: number
    private replayTo: string[]
    private folder: Folder
    public result: Result = {}

    private textCharset = ""
    private textEncoding = ""
    private textSize = 0

    private htmlCharset = ""
    private htmlEncoding = ""
    private htmlSize = 0

    private calendarCharset = ""
    private calendarEncoding = ""
    private calendarSize = 0

    private calendarIndex = "0"
    private textIndex = "0"
    private htmlIndex = "0"

    constructor(folder?: Folder, msgnum?: number) {
        this.folder = folder
        this.msgnum = msgnum
    }

    /**
     * pop3协议  获取是否含有附件(包括内联图片)
     */
    public isIncludeAttachment(): boolean {
        if (this.contentType.includes("multipart/mixed")) {
            return true
        } else if (this.contentType.includes("multipart/alternative") || this.contentType.includes("multipart/related")) {
            return false
        } else {
            return false
        }
    }

    /**
     * 获取当前邮件所属邮箱
     */
    public getFolder(): Folder {
        return this.folder;
    }

    public setContentType(contentType: string) {
        return this.contentType = contentType
    }

    public getContentType() {
        return this.contentType
    }

    /**
     * 同步设置 flag
     */
    public syncSetFlags(flags: Flag[], isAdd: boolean): Promise<String> {
        return new Promise((resolve, reject) => {
            this.setFlags(flags, isAdd, (err) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(err)
                }
            })
        })
    }

    /**
     * 设置flag
     */
    public setFlags(flags: Flag[], isAdd: boolean, callback) {
        if (!!this.folder && !!this.folder.getStore()) {
            this.folder.getStore().setFlag(this.msgnum, flags, isAdd, (err) => {
                callback(err)
            })
        }
    }

    /**
     * 同步获取 flag
     */
    public syncGetFlags(): Promise<String[]> {
        return new Promise((resolve, reject) => {
            this.getFlags((success, result) => {
                if (success) {
                    resolve(result)
                } else {
                    reject(result)
                }
            })
        })
    }

    /**
     * 获取 flag
     */
    public getFlags(callback) {
        if (!!this.folder && !!this.folder.getStore()) {
            this.folder.getStore().getFlags(this.msgnum, (success, result) => {
                callback(success, result)
            })
        }
    }

    /**
     * 设置邮件发送时间
     */
    public setSentDate(date: string) {
        this.date = date
    }

    /**
     * 获取邮件发送时间
     */
    public getSentDate(): string {
        if (!!this.date) {
            return this.date
        }

        if (!!this.result && this.result.hasOwnProperty('headers')) {
            return this.result.headers.Date
        }
    }

    /**
     * 获取邮件行数
     */
    public getLineCount(): number {
        return this.lineCount
    }

    /**
     * 同步获取邮件大小
     */
    public syncGetSize(): Promise<number> {
        return new Promise((resolve, reject) => {
            this.getSize((success, result) => {
                if (success) {
                    resolve(result)
                } else {
                    reject(result)
                }
            })
        })
    }
    /**
     * 获取邮件大小
     */
    public getSize(callback) {
        if (!!this.folder && !!this.folder.getStore()) {
            this.folder.getStore().getSize(this.msgnum, (success, result) => {
                callback(success, result)
            })
        } else {
            callback(false, "store is undefined")
        }
    }

    /**
     * 同步获取邮件完整内容
     */
    public syncGetContent(): Promise<MimeMultipart | Message> {
        return new Promise((resolve, reject) => {
            this.getContent((success, result) => {
                if (success) {
                    resolve(result)
                } else {
                    reject(result)
                }
            })
        })
    }

    /**
     * 获取邮件完整内容
     */
    public getContent(callback) {
        try {
            if (!!this.folder && !!this.folder.getStore()) {
                this.folder.getStore().getContent(this.msgnum, (success, result) => {
                    if (success) {
                        if (result == "") {
                            callback(false, "mail content is empty")
                            return
                        }

                        if (this.folder.getProtocol() == "imap") {
                            try {
                                let mimeMultipart = this.parserBodyStructure(result)
                                if (!mimeMultipart) {
                                    callback(false, "mail content parse fail")
                                } else {
                                    callback(true, mimeMultipart)
                                }
                            } catch (err) {
                                callback(false, err)
                            }
                            return
                        }

                        if (this.folder.getProtocol() == "pop3") {
                            EmlFormat.parseString(result, (success, result) => {
                                if (success) {
                                    try {
                                        this.result.body = result.body
                                        Util.parserContent(result, this)
                                        callback(true, this)
                                    } catch (err) {
                                        callback(false, err)
                                    }
                                } else {
                                    callback(false, result)
                                }
                            });
                        }
                    } else {
                        callback(false, "get content fail:" + JSON.stringify(result))
                    }
                })
            } else {
                callback(false, "store is undefined")
            }
        } catch (err) {
            callback(false, "mail get content parse fail:" + err)
            MailLogger.error("mail get content parse fail:" + err);
        }
    }

    /**
     * 同步获取邮件Header以及正文的前几行
     */
    public syncGetLineContent(lineCount): Promise<Message> {
        return new Promise((resolve, reject) => {
            this.getLineContent(lineCount, (success, result) => {
                if (success) {
                    resolve(result)
                } else {
                    reject(result)
                }
            })
        })
    }

    /**
     * 获取邮件Header以及正文的前几行
     */
    public getLineContent(lineCount, callback) {
        if (this.folder.getProtocol() != "pop3") {
            callback(false, this.folder.getProtocol() + " not support")
            return
        }
        if (!!this.folder && !!this.folder.getStore()) {
            this.folder.getStore().getLineText(this.msgnum, lineCount, (success, result) => {
                if (success) {
                    if (result == "") {
                        callback(false, "mail content is empty")
                        return
                    }

                    EmlFormat.parseString(result, (success, result) => {
                        if (success) {
                            try {
                                this.result.body = result.body
                                Util.parserContent(result, this)
                                callback(true, this)
                            } catch (err) {
                                callback(false, err)
                            }
                        } else {
                            callback(false, result)
                        }
                    });
                } else {
                    callback(false, "get content fail")
                }
            })
        } else {
            callback(false, "store is undefined")
        }
    }

    /**
     * 设置邮件大小
     */
    public setSize(size: number) {
        this.size = size
    }

    /**
     * 邮件是否已经删除
     */
    public isExpunged(): boolean {
        return this.expunged
    }

    /**
     * 设置是否删除邮件
     */
    public setExpunged(expunged: boolean) {
        return this.expunged = expunged
    }

    /**
     * 获取邮件编号
     */
    public getMessageNumber(): number {
        return this.msgnum
    }

    /**
     * 设置邮件编号
     */
    public setMessageNumber(num: number) {
        this.msgnum = num
    }

    /**
     * 获取接收日期
     */
    public getReceivedDate(): string {
        if (!!this.date) {
            return this.date
        }

        if (!!this.result && this.result.hasOwnProperty('headers')) {
            return this.result.headers.Date
        }
    }

    /**
     * 设置主题
     */
    public setSubject(subject: string) {
        this.subject = subject
    }

    /**
     * 获取主题
     */
    public getSubject(): string {
        if (!!this.subject) {
            return this.subject
        }

        if (!!this.result.headers) {
            if (!!!this.result.headers.Subject) {
                return undefined
            }
            let subject = this.result.headers.Subject
            return Util.decodeMimeStr(subject)
        }
        return undefined
    }

    /**
     *  设置发件人
     */
    public setFrom(from: string[]) {
        this.fromArray = from
    }

    /**
     *  获取发件人
     */
    public getFrom(): string[] {
        if (!!this.fromArray) {
            return this.fromArray
        } else {
            if (!!this.result && this.result.hasOwnProperty('headers') && this.result.headers.hasOwnProperty('From')) {
                this.fromArray = this.result.headers.From.split(', ')
                return this.fromArray
            }
        }
    }

    /**
     *  获取回复人
     */
    public getReplyTo(): string[] {
        if (!!this.replayTo) {
            return this.replayTo
        }

        if (!!this.result && this.result.hasOwnProperty('headers') && this.result.headers.hasOwnProperty('Reply-To')) {
            this.replayTo = this.result.headers['Reply-To'].split(', ')
            return this.replayTo
        }
    }

    /**
     *  设置回复人
     */
    public setReplyTo(address: string[]) {
        this.replayTo = address
    }

    /**
     *  根据收件人类型设置收件人
     */
    public setRecipients(addressType: RecipientType, addresses: string[]) {
        switch (addressType) {
            case RecipientType.TO:
                this.to = addresses
                break;
            case RecipientType.CC:
                this.Cc = addresses
                break;
            case RecipientType.BCC:
                this.Bcc = addresses
                break;
            default:
                break;
        }
    }

    /**
     *  根据收件人类型追加收件人
     */
    public addRecipients(addressType: RecipientType, addresses: string[]) {
        switch (addressType) {
            case RecipientType.TO:
                if (!!this.to) {
                    this.to = this.to.concat(addresses)
                }
                break;
            case RecipientType.CC:
                if (!!this.Cc) {
                    this.Cc = this.Cc.concat(addresses)
                }
                break;
            case RecipientType.BCC:
                if (!!this.Cc) {
                    this.Bcc = this.Bcc.concat(addresses)
                }
                break;
            default:
                break;
        }
    }

    /**
     *  通过收件人类型获取收件人
     */
    public getRecipients(addressType: RecipientType): string[] {
        switch (addressType) {
            case RecipientType.TO:
                if (!!this.to) {
                    return this.to
                }

                if (!!this.result && this.result.hasOwnProperty('headers') && this.result.headers.hasOwnProperty('To')) {
                    this.to = this.result.headers.To.split(', ')
                    return this.to
                }
                break;
            case RecipientType.CC:
                if (!!this.Cc) {
                    return this.Cc
                }

                if (!!this.result && this.result.hasOwnProperty('headers') && this.result.headers.hasOwnProperty('Cc')) {
                    this.Cc = this.result.headers.Cc.split(', ')
                    return this.Cc
                }
                break;
            case RecipientType.BCC:
                if (!!this.Bcc) {
                    return this.Bcc
                }

                if (!!this.result && this.result.hasOwnProperty('headers') && this.result.headers.hasOwnProperty('Bcc')) {
                    this.Bcc = this.result.headers.Bcc.split(', ')
                    return this.Bcc
                }
                break;
            default:
                break;
        }
    }

    /**
     * 获取所有收件人
     */
    public getAllRecipients(): string[] {
        return this.to.concat(this.Cc).concat(this.Bcc)
    }

    /**
     * 设置邮件文本内容
     */
    public setText(text: string) {
        this.text = text
    }

    /**
     * 获取邮件文本内容
     */
    public getText() {
        return this.text
    }

    /**
     * 添加附件
     */
    public addFiles(file: AttachmentBody) {
        if (!!!this.files) {
            this.files = new Array<AttachmentBody>()
        }
        if (!!file) {
            this.files.push(file)
        }
    }

    /**
     * 获取所有附件
     */
    public getFiles() {
        return this.files
    }

    /**
     * 添加内联附件
     */
    public addInlineFiles(inlineFile: AttachmentBody) {
        if (!!!this.inlineFiles) {
            this.inlineFiles = new Array<AttachmentBody>()
        }
        if (!!inlineFile) {
            this.inlineFiles.push(inlineFile)
        }
    }

    /**
     * 获取所有内联附件
     */
    public getInlineFiles() {
        return this.inlineFiles
    }

    /**
     * 设置邮件HTML
     */
    public setHtml(html: string) {
        this.html = html
    }

    /**
     * 获取邮件HTML
     */
    public getHtml() {
        return this.html
    }

    /**
     * 设置邮件MIMEVersion
     */
    public setMIMEVersion(mIMEVersion: string) {
        this.mimeVersion = mIMEVersion
    }

    /**
     * 同步获取MIMEVersion
     */
    public syncGetMIMEVersion(): Promise<string> {
        return new Promise((resolve, reject) => {
            this.getMIMEVersion((success, result) => {
                if (success) {
                    resolve(result)
                } else {
                    reject(result)
                }
            })
        })
    }
    /**
     *  获取邮件MIMEVersion
     */
    public getMIMEVersion(callback) {
        if (!!this.mimeVersion) {
            callback(true, this.mimeVersion)
            return
        }

        this.getHeader('MIME-Version', (success, result) => {
            if (success) {
                this.mimeVersion = result
                callback(success, result)
            } else {
                callback(false, result)
            }
        })
    }

    /**
     * 同步通过header名称获取header
     */
    public syncGetHeader(headerName: string): Promise<string> {
        return new Promise((resolve, reject) => {
            this.getHeader(headerName, (success, result) => {
                if (success) {
                    resolve(result)
                } else {
                    reject(result)
                }
            })
        })
    }

    /**
     *  通过header名称获取header
     */
    public getHeader(headerName: string, callback) {
        if (!!this.folder && !!this.folder.getStore()) {
            this.folder.getStore().getHeader(this.msgnum, headerName, (success, result) => {
                callback(success, result)
            })
        } else {
            callback(false, "store is undefined")
        }
    }

    /**
     * 同步获取所有header
     */
    public syncGetAllHeaders(): Promise<Message> {
        return new Promise((resolve, reject) => {
            this.getAllHeaders((success, result) => {
                if (success) {
                    resolve(result)
                } else {
                    reject(result)
                }
            })
        })
    }

    /**
     *  获取所有header
     */
    public getAllHeaders(callback) {
        if (!!this.result.headers) {
            callback(true, this.result.headers)
            return
        }

        if (!!this.folder && !!this.folder.getStore()) {
            this.folder.getStore().geAllHeader(this.msgnum, (success, result) => {
                if (success) {
                    EmlFormat.parseHeaders(result, (success, result) => {
                        this.result.headers = result.headers
                        if (result.hasOwnProperty('headers')) {
                            if (this.result.headers.hasOwnProperty("From")) {
                                let fromArray = result.headers.From
                                this.setFrom(Util.matchRecipient(fromArray))
                            }

                            if (this.result.headers.hasOwnProperty("Subject")) {
                                let subject = result.headers.Subject
                                this.setSubject(Util.parseSubject(subject))
                            }

                            if (this.result.headers.hasOwnProperty('To')) {
                                let to = result.headers.To
                                this.setRecipients(RecipientType.TO, Util.matchRecipient(to))
                            }

                            if (result.headers.hasOwnProperty("SendTo")) {
                                let to = result.headers.SendTo
                                this.setRecipients(RecipientType.TO, Util.matchRecipient(to))
                            }

                            if (this.result.headers.hasOwnProperty('Cc')) {
                                let cc = result.headers.Cc
                                this.setRecipients(RecipientType.CC, Util.matchRecipient(cc))
                            }

                            if (this.result.headers.hasOwnProperty('Bcc')) {
                                let bcc = result.headers.Bcc
                                this.setRecipients(RecipientType.BCC, Util.matchRecipient(bcc))
                            }

                            if (this.result.headers.hasOwnProperty('Date')) {
                                this.setSentDate(result.headers.Date)
                            }

                            if (this.result.headers.hasOwnProperty('MIME-Version')) {
                                this.setMIMEVersion(result.headers['MIME-Version'])
                            }

                            if (this.result.headers.hasOwnProperty('Reply-To')) {
                                this.setReplyTo(result.headers['Reply-To'].split(', '))
                            }

                            if (this.result.headers.hasOwnProperty('Content-Type')) {
                                this.setContentType(result.headers['Content-Type'].split(', ')[0])
                            }

                            if (this.result.headers.hasOwnProperty("from")) {
                                let fromArray = result.headers.from
                                this.setFrom(Util.matchRecipient(fromArray))
                            }

                            if (this.result.headers.hasOwnProperty("subject")) {
                                let subject = result.headers.subject
                                this.setSubject(Util.parseSubject(subject))
                            }

                            if (this.result.headers.hasOwnProperty("X-QQ-INNER-SUBJECT")) {
                                let qqSubject = result.headers["X-QQ-INNER-SUBJECT"]
                                this.setSubject(Util.parseSubject(qqSubject))
                            }

                            if (this.result.headers.hasOwnProperty('to')) {
                                let to = result.headers.to
                                this.setRecipients(RecipientType.TO, Util.matchRecipient(to))
                            }

                            if (result.headers.hasOwnProperty("sendTo")) {
                                let to = result.headers.sendTo
                                this.setRecipients(RecipientType.TO, Util.matchRecipient(to))
                            }

                            if (this.result.headers.hasOwnProperty('cc')) {
                                let cc = result.headers.cc
                                this.setRecipients(RecipientType.CC, Util.matchRecipient(cc))
                            }

                            if (this.result.headers.hasOwnProperty('bcc')) {
                                let bcc = result.headers.bcc
                                this.setRecipients(RecipientType.BCC, Util.matchRecipient(bcc))
                            }

                            if (this.result.headers.hasOwnProperty('date')) {
                                this.setSentDate(result.headers.date)
                            }
                        }
                        callback(success, this)
                    });
                } else {
                    callback(false, result)
                }
            })
        } else {
            callback(false, "store is undefined")
        }
    }

    private parserBodyStructure(bodyStr: string): MimeMultipart {
        let partCount = 0

        let regex = /{(\d+)}\r\n/; // 匹配 {数字} 的正则表达式
        if (regex.test(bodyStr)) {
            let match;
            while (match = regex.exec(bodyStr)) {
                let strNum = parseInt(match[1]); // 将匹配到的数字字符串转换为整数
                let index = match.index + match[0].length; // 计算右括号 } 的索引位置
                let subStr = bodyStr.substr(index, strNum);
                let result = Util.decodeMimeStr(subStr);
                bodyStr = bodyStr.substring(0, match.index) + "\"" + result + "\"" + bodyStr.substring(index + strNum); // 将子字符串替换为新字符串
            }
        }
        let body = bodyStr.replace(/\(/g, '[')
        body = body.replace(/\)/g, ']')
        body = body.replace(/\]\[/g, '],[')
        body = body.replace(/NIL/g, null)
        body = body.replace(/\[\s+/g, '[')
        body = body.replace(/ /g, ',')

        let bodyArr
        try {
            bodyArr = JSON.parse(body)
            MailLogger.info('ohos_mail-- parserBodyStructure bodyArr success:' + JSON.stringify(bodyArr))
        } catch (e) {
            MailLogger.error('ohos_mail-- parserBodyStructure bodyArr fail:' + e)
            throw new Error('ohos_mail-- parserBodyStructure bodyArr fail:' + e)
            return null
        }

        if (!!bodyArr && bodyArr.length > 0) {
            //首先获取最外层ContentType
            let rootContentType
            let attachmentSectionIndex = 1
            for (let i = 0; i < bodyArr.length; i++) {
                if (!!bodyArr[i] && typeof bodyArr[i] === 'string') {
                    let contentType = bodyArr[i].toUpperCase()
                    if (contentType == 'ALTERNATIVE' || contentType == 'MIXED' || contentType == 'RELATED' || contentType == 'REPORT') {
                        rootContentType = contentType
                    }
                }
            }

            if (!!rootContentType) {
                if (rootContentType == 'ALTERNATIVE') { //只有TEXT和HTML
                    let sectionIndex = 0
                    for (let i = 0; i < bodyArr.length; i++) {
                        if (!!bodyArr[i]) {
                            let contentArray = bodyArr[i]
                            sectionIndex = this.parseText(contentArray, sectionIndex, false, true)
                        }
                    }
                }

                if (rootContentType == 'MIXED' || rootContentType == 'REPORT') { //包含附件
                    let sectionIndex = 0
                    for (let i = 0; i < bodyArr.length; i++) {
                        if (!!bodyArr[i] && bodyArr[i] instanceof Array && bodyArr[i].length > 4) {
                            let contentArray = bodyArr[i]
                            if (i == 0 && contentArray instanceof Array) {
                                let textContentType
                                let textArray = contentArray
                                for (let j = 0; j < textArray.length; j++) {
                                    if (!!textArray[j] && typeof textArray[j] === 'string') {
                                        let contentType = textArray[j].toUpperCase()
                                        if (contentType == 'ALTERNATIVE' || contentType == 'RELATED') {
                                            textContentType = contentType
                                        }
                                    }
                                }

                                if (!!!textContentType) {
                                    this.parseText(textArray, sectionIndex, false, true)
                                } else if (textContentType == 'ALTERNATIVE') { //只有TEXT和HTML
                                    for (let j = 0; j < textArray.length; j++) {
                                        if (!!textArray[j] && (textArray[j] instanceof Array) && textArray[j].length > 4) {
                                            let contentArray = textArray[j]
                                            sectionIndex = this.parseText(contentArray, sectionIndex, false, false)
                                        }
                                    }
                                } else if (textContentType == 'RELATED') { //包含内联图片 不包含附件
                                    for (let i = 0; i < textArray.length; i++) {
                                        if (!!textArray[i] && textArray[i] instanceof Array && textArray[i].length > 4) {
                                            let contentArray = textArray[i]
                                            //解析正文
                                            if (i == 0 && contentArray instanceof Array) {
                                                let textArray = contentArray
                                                if (textArray[0] instanceof Array) {
                                                    for (let j = 0; j < textArray.length; j++) {
                                                        let contentArray = textArray[j]
                                                        if (!!contentArray && (contentArray instanceof Array) && contentArray.length > 4) {
                                                            sectionIndex = this.parseText(contentArray, sectionIndex, true, false)
                                                        }
                                                    }
                                                } else {
                                                    sectionIndex = this.parseText(contentArray, sectionIndex, true, false)
                                                }
                                                sectionIndex = 1
                                            } else {
                                                //解析内联图片
                                                sectionIndex = this.parseAttachment(contentArray, sectionIndex, true, true)
                                            }
                                        }
                                    }
                                }
                            } else {
                                //解析附件
                                attachmentSectionIndex = this.parseAttachment(contentArray, attachmentSectionIndex, false, false)
                            }
                        }
                    }
                }

                if (rootContentType == 'RELATED') { //包含内联图片 不包含附件
                    let sectionIndex = 0
                    for (let i = 0; i < bodyArr.length; i++) {
                        if (!!bodyArr[i] && bodyArr[i] instanceof Array && bodyArr[i].length > 4) {
                            let contentArray = bodyArr[i]
                            let isIncludeText = false
                            //解析正文
                            if (i == 0 && contentArray instanceof Array) {
                                let textArray = contentArray
                                if (typeof textArray[0] === 'string') {
                                    attachmentSectionIndex = 0
                                    attachmentSectionIndex = this.parseAttachment(textArray, attachmentSectionIndex, false, false)
                                } else {
                                    isIncludeText = true
                                    for (let j = 0; j < textArray.length; j++) {
                                        if (!!textArray[j] && (textArray[j] instanceof Array) && textArray[j].length > 4) {
                                            let contentArray = textArray[j]
                                            sectionIndex = this.parseText(contentArray, sectionIndex, false, false)
                                        }
                                    }
                                }
                                continue
                            }

                            //解析内联图片
                            if (contentArray[0].toUpperCase() == "IMAGE" && isIncludeText) {
                                attachmentSectionIndex = this.parseAttachment(contentArray, attachmentSectionIndex, true, false)
                            } else {
                                attachmentSectionIndex = this.parseAttachment(contentArray, attachmentSectionIndex, false, false)
                            }
                        }
                    }
                }
            } else {
                let sectionIndex = 0
                sectionIndex = this.parseText(bodyArr, sectionIndex, false, true)
            }
        }

        let mimeMultipart = new MimeMultipart(this.msgnum, this.folder.getStore())
        mimeMultipart.setCount(partCount)

        mimeMultipart.setTextCharset(this.textCharset)
        mimeMultipart.setTextEncoding(this.textEncoding)
        mimeMultipart.setTextSize(this.textSize)
        mimeMultipart.setTextIndex(this.textIndex)

        mimeMultipart.setHtmlCharset(this.htmlCharset)
        mimeMultipart.setHtmlEncoding(this.htmlEncoding)
        mimeMultipart.setHtmlSize(this.htmlSize)
        mimeMultipart.setHtmlIndex(this.htmlIndex)

        mimeMultipart.setCalendarCharset(this.calendarCharset)
        mimeMultipart.setCalendarEncoding(this.calendarEncoding)
        mimeMultipart.setCalendarSize(this.calendarSize)
        mimeMultipart.setCalendarIndex(this.calendarIndex)

        mimeMultipart.setAttachmentFiles(this.getFiles())
        mimeMultipart.setInlineAttachmentFiles(this.getInlineFiles())

        let bodyStructure = "textCharset:" + this.textCharset
        + "  /textEncoding:" + this.textEncoding
        + "  /textSize:" + this.textSize
        + "  /index:" + this.textIndex
        + "\r\n"
        + "htmlCharset:" + this.htmlCharset
        + "  /htmlSize:" + this.htmlSize
        + "  /htmlEncoding:" + this.htmlEncoding
        + "  /index:" + this.htmlIndex
        + "\r\n"
        + "calendarCharset:" + this.calendarCharset
        + "  /calendarEncoding:" + this.calendarEncoding
        + "  /calendarSize:" + this.calendarSize
        + "  /calendarIndex:" + this.calendarIndex

        bodyStructure += "\r\n"

        let attachFiles = this.getFiles()
        if (!!attachFiles && attachFiles.length > 0) {
            for (let i = 0; i < attachFiles.length; i++) {
                let file = attachFiles[i]
                bodyStructure += "attachment" + i + " Name:" + file.getFileName()
                + "  /Encoding:" + file.getEncoding()
                + "  /Mime:" + file.getMimeType()
                + "  /Size:" + file.getSize()
                + "  /Index:" + file.getIndex()
                bodyStructure += "\r\n"
            }
        }
        let inlineFiles = this.getInlineFiles()
        if (!!inlineFiles && inlineFiles.length > 0) {
            for (let i = 0; i < inlineFiles.length; i++) {
                let inlineFile = inlineFiles[i]
                bodyStructure += "inline" + i + " Name:" + inlineFile.getFileName()
                + "  /Encoding:" + inlineFile.getEncoding()
                + "  /Mime:" + inlineFile.getMimeType()
                + "  /Size:" + inlineFile.getSize()
                + "  /Cid:" + inlineFile.getCid()
                + "  /Index:" + inlineFile.getIndex()
                bodyStructure += "\r\n"
            }
        }

        let result = bodyStructure.split("\r\n")
        for (let i = 0; i < result.length; i++) {
            MailLogger.info("ohos_mail bodyStructure  " + result[i])
        }
        return mimeMultipart
    }

    private parseText(contentArray, sectionIndex, isRelated, isFirstFloor): number {
        if(!(contentArray instanceof Array) || typeof(contentArray[1]) != "string"){
            return;
        }
        let type = contentArray[1].toUpperCase()
        if (type == "PLAIN") {
            if (contentArray[2] instanceof Array && contentArray[2].length > 1) {
                this.textCharset = contentArray[2][1]
            }

            this.textEncoding = contentArray[5]
            this.textSize = contentArray[6]
            sectionIndex = sectionIndex + 1
            if (isFirstFloor) {
                this.textIndex = `${sectionIndex}`
            } else {
                if (isRelated) {
                    this.textIndex = `1.1.${sectionIndex}`
                } else {
                    this.textIndex = `1.${sectionIndex}`
                }
            }

        } else if (type == "HTML") {
            if (contentArray[2] instanceof Array && contentArray[2].length > 1) {
                this.htmlCharset = contentArray[2][1]
            }
            this.htmlEncoding = contentArray[5]
            this.htmlSize = contentArray[6]
            if (isFirstFloor) {
                sectionIndex = sectionIndex + 1
                this.htmlIndex = `${sectionIndex}`
            } else {
                if (isRelated) {
                    sectionIndex = sectionIndex + 1
                    this.htmlIndex = `1.1.${sectionIndex}`
                } else {
                    sectionIndex = sectionIndex + 1
                    this.htmlIndex = `1.${sectionIndex}`
                }
            }
        } else if (type == "CALENDAR") {
            if (contentArray[2] instanceof Array && contentArray[2].length > 1) {
                this.calendarCharset = contentArray[2][1]
            }
            this.calendarEncoding = contentArray[5]
            this.calendarSize = contentArray[6]
            if (isFirstFloor) {
                sectionIndex = sectionIndex + 1
                this.calendarIndex = `${sectionIndex}`
            } else {
                if (isRelated) {
                    sectionIndex = sectionIndex + 1
                    this.calendarIndex = `1.1.${sectionIndex}`
                } else {
                    sectionIndex = sectionIndex + 1
                    this.calendarIndex = `1.${sectionIndex}`
                }
            }
        }
        return sectionIndex
    }

    private parseAttachment(contentArray, attachmentSectionIndex, isInline, isRelated): number {
        let fileName
        let file

        if (!!contentArray[2]) {
            if (!(contentArray[2] instanceof Array)) {
                fileName = contentArray[4]
                file = new AttachmentBody("", Util.matchAndDecode(fileName))
            } else {
                if (contentArray[2].length == 2 && contentArray[2][0].toLowerCase().includes("name")) {
                    fileName = contentArray[2][1]
                    file = new AttachmentBody("", Util.matchAndDecode(fileName))
                } else if (contentArray[2].length == 4) {
                    let charSet = ''
                    for (let i = 0; i < 4; i++) {
                        let arrayBody = contentArray[2][i]
                        if (typeof arrayBody === "string" && arrayBody.toUpperCase() == "NAME") {
                            file = new AttachmentBody("", Util.matchAndDecode(contentArray[2][i+1]))
                            continue
                        }

                        if (typeof arrayBody === "string" && arrayBody.toUpperCase() == "CHARSET") {
                            charSet = contentArray[2][i+1]
                            continue
                        }
                    }

                    if (!!file) {
                        file.setCharSet(charSet)
                    }
                } else {
                    //找到filename
                    for (let i = 0; i < contentArray.length; i++) {
                        if (contentArray[i] instanceof Array && contentArray[i].length > 0) {
                            if (contentArray[i][0] == "attachment" || contentArray[i][0] == "inline") {
                                if (contentArray[i][1] instanceof Array && typeof (contentArray[i][1][0]) == "string" && contentArray[i][1][0].toLowerCase().includes("name")) {
                                    fileName = contentArray[i][1][1]
                                    file = new AttachmentBody("", Util.matchAndDecode(fileName))
                                }
                            }
                        }
                    }
                    //找到charset
                    for (let i = 0; i < contentArray.length; i++) {
                        if (contentArray[i] instanceof Array && contentArray[i].length > 0) {
                            if (contentArray[i][0].toUpperCase() == "CHARSET") {
                                if (!!file) {
                                    file.setCharSet(contentArray[i][1])
                                }
                            }
                        }
                    }
                }
            }
        } else {
            //找到filename
            for (let i = 0; i < contentArray.length; i++) {
                if (contentArray[i] instanceof Array && contentArray[i].length > 0) {
                    if (contentArray[i][0] == "attachment" || contentArray[i][0] == "inline") {
                        if (contentArray[i][1] instanceof Array && typeof (contentArray[i][1][0]) == "string" && contentArray[i][1][0].toLowerCase().includes("name")) {
                            fileName = contentArray[i][1][1]
                            file = new AttachmentBody("", Util.matchAndDecode(fileName))
                        }
                    }
                }
            }

            if (!!!file) {
                file = new AttachmentBody("", "")
            }

            //找到charset
            for (let i = 0; i < contentArray.length; i++) {
                if (contentArray[i] instanceof Array && contentArray[i].length > 0) {
                    if (!!contentArray[i][0] && typeof(contentArray[i][0]) == "string" && contentArray[i][0].toUpperCase() == "CHARSET") {
                        if (!!file) {
                            file.setCharSet(contentArray[i][1])
                        }
                    }
                }
            }
        }


        if (!!!file) {
            return;
        }

        file.setEncoding(contentArray[5])
        file.setMimeType(contentArray[0] + "/" + contentArray[1])
        file.setSize(contentArray[6])
        attachmentSectionIndex = attachmentSectionIndex + 1
        if (isRelated) {
            file.setIndex(`1.${attachmentSectionIndex.toString()}`)
        } else {
            file.setIndex(attachmentSectionIndex.toString())
        }
        if (isInline) {
            file.setCid(contentArray[3])
            this.addInlineFiles(file)
        } else {
            this.addFiles(file)
        }
        return attachmentSectionIndex
    }
}