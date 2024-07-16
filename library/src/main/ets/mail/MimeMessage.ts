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
 * Based on MimeMessage.java written by
 * Copyright (c) 1997, 2023 Oracle and/or its affiliates.
 *
 */

import { AttachmentBody } from './AttachmentBody';
import fs from '@ohos.file.fs';
import { MimeTypeDetector } from "../mime_types/MimeTypeDetector"
import util from '@ohos.util';
import { Util } from '../Util';
import { MailLogger } from '../MailLogger';
import { MimeBodyPart } from '../mail/MimeBodyPart';
import { RecipientType } from '../mail/RecipientType';
import { Constant } from '../Constant';

/**
 * 邮件消息体
 */
export class MimeMessage {
    //日期
    private date: string;
    //摘要
    private subject: string;
    //发件人
    private from: string;
    //收件人
    private to: string[];
    //抄送
    private Cc: string[];
    //密送
    private Bc: string[];
    //mimeVersion
    private mIMEVersion: string = "1.0";
    //附件
    private attachmentBody: Array<AttachmentBody> = new Array<AttachmentBody>()
    //邮件内容
    private text: string = "";
    //Html
    private html: string
    //图片mimeType
    private imgMimeType: string;
    //html内嵌图片
    private imgInside: Array<MimeBodyPart> = new Array<MimeBodyPart>()

    public addImgInside(imgInside: MimeBodyPart) {
        if (!!imgInside) {
            this.imgInside.push(imgInside)
        }
    }

    public getImgInside() {
        return this.imgInside
    }

    public setText(text: string) {
        this.text = text
    }

    public getText(): string {
        return this.text
    }

    public getRecipients(addressType: RecipientType): string[] {
        switch (addressType) {
            case RecipientType.TO:
                return this.to
                break;
            case RecipientType.CC:
                return this.Cc
                break;
            case RecipientType.BCC:
                return this.Bc
                break;
            default:
                break;
        }
    }

    public getAllRecipients(): string[] {
        let recipients = new Array()
        if (!!this.to && this.to.length > 0) {
            recipients = recipients.concat(this.to)
        }

        if (!!this.Cc && this.Cc.length > 0) {
            recipients = recipients.concat(this.Cc)
        }

        if (!!this.Bc && this.Bc.length > 0) {
            recipients = recipients.concat(this.Bc)
        }
        return recipients
    }

    public setRecipients(addressType: RecipientType, addresses: string[]) {
        switch (addressType) {
            case RecipientType.TO:
                this.to = addresses
                break;
            case RecipientType.CC:
                this.Cc = addresses
                break;
            case RecipientType.BCC:
                this.Bc = addresses
                break;
            default:
                break;
        }
    }

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
                    this.Bc = this.Bc.concat(addresses)
                }
                break;
            default:
                break;
        }
    }

    public setHtml(html: string) {
        this.html = html
    }

    public getHtml() {
        return this.html
    }

    public getSentDate() {
        return this.date
    }

    public setSentDate(date: Date) {
        this.date = date.toDateString()
    }

    public setSubject(subject: string) {
        this.subject = subject
    }

    public getSubject() {
        return this.subject
    }

    public setFrom(from: string) {
        this.from = from
    }

    public getFrom() {
        return this.from
    }

    public getReceivedDate(): string {
        return null;
    }

    public setMIMEVersion(mIMEVersion: string) {
        this.mIMEVersion = mIMEVersion
    }

    public getMIMEVersion() {
        return this.mIMEVersion
    }

    public addAttachmentBody(attachmentBody: AttachmentBody) {
        if (!!attachmentBody) {
            this.attachmentBody.push(attachmentBody)
        }
    }

    public geAttachmentBody() {
        return this.attachmentBody
    }

    private addNewlines(uint8Array) {
        var encoder = new util.TextEncoder();
        var newline = encoder.encode('\r\n'); // 将换行符转换为字节数组

        var result = [];
        for (var i = 0; i < uint8Array.length; i += 200 * 1024) {
            var chunk = uint8Array.subarray(i, i + 200 * 1024);
            result.push(chunk);
            if (i + 200 * 1024 < uint8Array.length) {
                result.push(newline); // 添加换行符的字节数组
            }
        }
        var length = result.reduce(function (acc, arr) {
            return acc + arr.length;
        }, 0);
        var concatenated = new Uint8Array(length);
        var offset = 0;
        for (var j = 0; j < result.length; j++) {
            concatenated.set(result[j], offset);
            offset += result[j].length;
        }
        return concatenated;
    }

    public getMimeMessage(): ArrayBuffer {
        let guid1 = "62A6FFFF_1040B5C8_3BB6ED08"
        let guid2 = "62A6FFFF_1040B5C8_49B5407E"
        let headerContentType = "multipart/alternative"
        let attachmentDatas = this.getAttachmentsData()
        let imgDatas = this.getInsideImgData()
        if (attachmentDatas.length > 0) {
            headerContentType = "multipart/mixed"
        }

        if (attachmentDatas.length == 0 && imgDatas.length > 0) {
            headerContentType = "multipart/related"
        }

        if (attachmentDatas.length == 0 && imgDatas.length == 0) {
            headerContentType = "multipart/alternative"
        }

        var msg = "From: <" + this.from + ">" + Constant.LINEFEED
        + this.getRecipient(RecipientType.TO)
        + this.getRecipient(RecipientType.CC)
        + this.getRecipient(RecipientType.BCC)
        + "Date: " + new Date() + Constant.LINEFEED
        + "Subject: " + "=?gb2312?B?" + Util.encode64(Util.strUnicode2Ansi(this.subject)) + "?=" + Constant.LINEFEED
        + "Content-Type: " + headerContentType + "; " + Constant.LINEFEED
        + "\tboundary=\"----=_NextPart_" + guid1 + "\"" + Constant.LINEFEED
        + "MIME-Version:" + this.mIMEVersion + Constant.LINEFEED
        + Constant.LINEFEED
        + "This is a multipart message in MIME format." + Constant.LINEFEED
        + Constant.LINEFEED
        if (attachmentDatas.length == 0 && imgDatas.length == 0) {
            //正文 start
            if (!!this.text && this.text.trim() != "") {
                msg += "------=_NextPart_" + guid1 + Constant.LINEFEED
                + "Content-Type: text/plain" + "; \tcharset=\"gb2312\""
                + Constant.LINEFEED
                + "Content-Transfer-Encoding: base64" + Constant.LINEFEED
                + Constant.LINEFEED
                + Util.encode64(Util.strUnicode2Ansi(this.text)) + Constant.LINEFEED
                + Constant.LINEFEED
            }

            if (!!this.html) {
                msg += "------=_NextPart_" + guid1 + Constant.LINEFEED
                + "Content-Type: text/html" + "; \tcharset=\"gb2312\""
                + Constant.LINEFEED
                + "Content-Transfer-Encoding: base64" + Constant.LINEFEED
                + Constant.LINEFEED
                + Util.encode64(Util.strUnicode2Ansi(this.html))
                + Constant.LINEFEED
            }
        } else {
            msg += "------=_NextPart_" + guid1 + Constant.LINEFEED
            + "Content-Type: multipart/alternative;" + Constant.LINEFEED
            + "\tboundary=\"----=_NextPart_" + guid2 + "\"" + Constant.LINEFEED
            + Constant.LINEFEED

            //正文 start
            if (!!this.text && this.text.trim() != "") {
                msg +="------=_NextPart_" + guid2 + Constant.LINEFEED
                + "Content-Type: text/plain" + "; \tcharset=\"gb2312\"" + Constant.LINEFEED
                + "Content-Transfer-Encoding: base64" + Constant.LINEFEED
                + Constant.LINEFEED
                + Util.encode64(Util.strUnicode2Ansi(this.text)) + Constant.LINEFEED
                + Constant.LINEFEED
            }

            if (!!this.html) {
                msg += "------=_NextPart_" + guid2 + Constant.LINEFEED
                + "Content-Type: text/html" + "; \tcharset=\"gb2312\"" + Constant.LINEFEED
                + "Content-Transfer-Encoding: base64" + Constant.LINEFEED
                + Constant.LINEFEED
                + Util.encode64(Util.strUnicode2Ansi(this.html)) + Constant.LINEFEED
            }
            msg += "------=_NextPart_" + guid2 + "--" + Constant.LINEFEED + Constant.LINEFEED
        }

        const textEncoder = new util.TextEncoder()
        let msgUint8Array = textEncoder.encodeInto(msg)
        let imgLength = imgDatas.length
        if (imgLength > 0) {
            //图片
            for (var i = 0; i < imgLength; i++) {
                let mimeType = this.imgInside[i].getMimeType() != undefined ? this.imgInside[i].getMimeType() : this.getMimeType(this.imgInside[i].getPath(), this.imgInside[i].getFileName())

                let nextPart = "------=_NextPart_" + guid1 + Constant.LINEFEED
                + "Content-Type: " + mimeType + "; charset=gb2312" + Constant.LINEFEED
                + "Content-Transfer-Encoding: base64" + Constant.LINEFEED
                + "Content-Disposition: inline; filename=\"" + "=?gb2312?B?" + Util.encode64(Util.strUnicode2Ansi(this.imgInside[i].getFileName())) + "?=" + "\"" + Constant.LINEFEED
                + "Content-ID: <" + this.imgInside[i].getContentId() + ">" + Constant.LINEFEED
                + Constant.LINEFEED


                let nextPartArr = textEncoder.encodeInto(nextPart)
                let lineFeedArr = textEncoder.encodeInto(Constant.LINEFEED + Constant.LINEFEED)

                let msgL = msgUint8Array.length
                let nextPartL = nextPartArr.length
                let lineFeedL = lineFeedArr.length

                let addLineImageData = this.addNewlines(imgDatas[i]);

                let unitArr = new Uint8Array(msgL + nextPartL + addLineImageData.length + lineFeedL)
                unitArr.set(msgUint8Array, 0)
                unitArr.set(nextPartArr, msgL)
                unitArr.set(addLineImageData, msgL + nextPartL)
                unitArr.set(lineFeedArr, msgL + nextPartL + addLineImageData.length)

                msgUint8Array = unitArr
            }
        }

        let attachmentLength = attachmentDatas.length
        if (attachmentLength > 0) {
            //附件 start
            for (let i = 0; i < attachmentLength; i++) {
                let mimeType = this.attachmentBody[i].getMimeType() != undefined ? this.attachmentBody[i].getMimeType() : this.getMimeType(this.attachmentBody[i].getPath(), this.attachmentBody[i].getFileName())

                let nextPart = "------=_NextPart_" + guid1 + Constant.LINEFEED
                + "Content-Type: " + mimeType + "; charset=gb2312" + Constant.LINEFEED
                + "Content-Disposition: attachment; filename=\"" + "=?gb2312?B?" + Util.encode64(Util.strUnicode2Ansi(this.attachmentBody[i].getFileName())) + "?=" + "\"" + Constant.LINEFEED
                + "Content-Transfer-Encoding: " + this.attachmentBody[i].getEncoding() + Constant.LINEFEED
                + Constant.LINEFEED

                let nextPartArr = textEncoder.encodeInto(nextPart)
                let lineFeedArr = textEncoder.encodeInto(Constant.LINEFEED + Constant.LINEFEED)

                let addLineAttachment = this.addNewlines(attachmentDatas[i]);
                let msgL = msgUint8Array.length
                let nextPartL = nextPartArr.length
                let lineFeedL = lineFeedArr.length
                let unitArr = new Uint8Array(msgL + nextPartL + addLineAttachment.length + lineFeedL)
                unitArr.set(msgUint8Array, 0)
                unitArr.set(nextPartArr, msgL)
                unitArr.set(addLineAttachment, msgL + nextPartL)
                unitArr.set(lineFeedArr, msgL + nextPartL + addLineAttachment.length)
                msgUint8Array = unitArr
            }
        }

        let nextPart = Util.toUint8Arr("------=_NextPart_" + guid1 + "--" + Constant.LINEFEED
        + Constant.LINEFEED
        + Constant.LINEFEED
        + Constant.LINEFEED + "." + Constant.LINEFEED)

        let msgL = msgUint8Array.length
        let nextPartL = nextPart.length

        let unitArr = new Uint8Array(msgL + nextPartL)
        unitArr.set(msgUint8Array, 0)
        unitArr.set(nextPart, msgL)
        msgUint8Array = unitArr
        return msgUint8Array.buffer
    }

    public getAllRecipient(): string {
        let recipient = ''

        if (!!this.to) {
            for (let i = 0; i < this.to.length; i++) {
                recipient += "RCPT TO: <" + this.to[i] + ">" + Constant.LINEFEED
            }
        }
        if (!!this.Cc) {
            for (let i = 0; i < this.Cc.length; i++) {
                recipient += "RCPT TO: <" + this.Cc[i] + ">" + Constant.LINEFEED
            }
        }
        if (!!this.Bc) {
            for (let i = 0; i < this.Bc.length; i++) {
                recipient += "RCPT TO: <" + this.Bc[i] + ">" + Constant.LINEFEED
            }
        }
        return recipient
    }

    private getRecipient(type: RecipientType): string {
        let recipient = ''
        if (type == RecipientType.TO) {
            if (!!this.to) {
                recipient = "To: "
                for (let i = 0; i < this.to.length; i++) {
                    if (i != this.to.length - 1) {
                        recipient += "<" + this.to[i] + ">, "
                    } else {
                        recipient += "<" + this.to[i] + ">" + Constant.LINEFEED
                    }
                }
            }
        }

        if (type == RecipientType.CC) {
            if (!!this.Cc && this.Cc.length > 0) {
                recipient = "Cc: "
                for (let i = 0; i < this.Cc.length; i++) {
                    if (i != this.Cc.length - 1) {
                        recipient += "<" + this.Cc[i] + ">, "
                    } else {
                        recipient += "<" + this.Cc[i] + ">" + Constant.LINEFEED
                    }
                }
            }
        }

        if (type == RecipientType.BCC) {
            if (!!this.Bc && this.Bc.length > 0) {
                recipient = "BC: "
                for (let i = 0; i < this.Bc.length; i++) {
                    if (i != this.Bc.length - 1) {
                        recipient += "<" + this.Bc[i] + ">, "
                    } else {
                        recipient += "<" + this.Bc[i] + ">" + Constant.LINEFEED
                    }
                }
            }
        }
        return recipient
    }

    private getImgData(mimeBodyPart: MimeBodyPart): Uint8Array {
        if (!!!mimeBodyPart) {
            return null
        }

        if (!!mimeBodyPart.getData()) {
            return mimeBodyPart.getData()
        }

        var fileName = mimeBodyPart.getFileName()
        if (fileName == "") {
            MailLogger.info('ohos_mail-- image inside file empty');
            return null
        }
        let imgData: Uint8Array
        try {
            let path = mimeBodyPart.getPath()
            let exits = fs.accessSync(path + '/' + fileName);
            if (!exits) {
                MailLogger.info('ohos_mail-- ' + path + '/' + fileName + 'img is not exits');
                return null
            }
            this.imgMimeType = MimeTypeDetector.detectMimeType(path + '/' + fileName)
            MailLogger.info('ohos_mail-- mimeType:' + this.imgMimeType);
            let bytesReadStream = fs.createStreamSync(path + '/' + fileName, 'r+');
            let stat = fs.statSync(path + '/' + fileName)
            let bufFrame = new ArrayBuffer(stat.size);
            let bytesRead = bytesReadStream.readSync(bufFrame)
            MailLogger.info("ohos_mail-- img size--" + bufFrame.byteLength)
            imgData = new util.Base64().encodeSync(new Uint8Array(bufFrame))
        } catch (e) {
            imgData = null
            MailLogger.error('ohos_mail-- get img file data fail:' + e)
        }
        return imgData
    }

    private getMimeType(path: string, fileName: string) {
        return MimeTypeDetector.detectMimeType(path + '/' + fileName)
    }

    private getInsideImgData(): Array<Uint8Array> {
        let imgDatas = new Array<Uint8Array>();
        if (!!this.imgInside) {
            let length = this.imgInside.length
            for (let i = 0; i < length; i++) {
                let data = this.getImgData(this.imgInside[i])
                if (!!data) {
                    imgDatas.push(data)
                }
            }
        }
        return imgDatas
    }

    private getAttachmentsData(): Array<Uint8Array> {
        let attachmentDatas = new Array<Uint8Array>();
        if (!!this.attachmentBody) {
            let length = this.attachmentBody.length
            for (let i = 0; i < length; i++) {
                let data = this.attachmentBody[i].getUint8ArrayData()
                if (data != null) {
                    attachmentDatas.push(data)
                }
            }
        }
        return attachmentDatas
    }
}