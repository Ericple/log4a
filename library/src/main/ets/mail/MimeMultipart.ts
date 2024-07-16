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
 * Based on MimeMultipart.java written by
 * Copyright (c) 1997, 2023 Oracle and/or its affiliates.
 *
 */

import { Store } from './Store';
import { Util } from '../Util';
import { AttachmentBody } from './AttachmentBody';
import { MimeBodyPart } from './MimeBodyPart';

export class MimeMultipart {
    private count: number
    private msgNum: number
    private store: Store

    private textCharset = ""
    private textEncoding = ""
    private textSize = 0

    private htmlCharset = ""
    private htmlEncoding = ""
    private htmlSize = 0

    private calendarCharset = ""
    private calendarEncoding = ""
    private calendarSize = 0

    private textIndex = "1"
    private htmlIndex = "2"
    private calendarIndex
    private files: Array<AttachmentBody>
    private inlineFiles: Array<AttachmentBody>

    constructor(msgNum: number, store: Store) {
        this.msgNum = msgNum
        this.store = store
    }

    public setCount(count: number) {
        this.count = count
    }

    public getCount(): number {
        return this.count
    }

    public setAttachmentFiles(files: Array<AttachmentBody>) {
        this.files = files
    }

    public setInlineAttachmentFiles(inlineFiles: Array<AttachmentBody>) {
        this.inlineFiles = inlineFiles
    }

    public getAttachmentFilesDigest(): Array<AttachmentBody> {
        return this.files
    }

    public getAttachmentSize(): number {
        if (!!this.files) {
            return this.files.length
        } else {
            return 0
        }
    }

    public getInlineAttachmentFilesDigest(): Array<AttachmentBody> {
        return this.inlineFiles
    }

    public getInlineAttachmentSize(): number {
        if (!!this.inlineFiles) {
            return this.inlineFiles.length
        } else {
            return 0
        }
    }

    public isIncludeAttachment(): boolean {
        if (!!this.files) {
            return true
        } else {
            return false
        }
    }

    public isIncludeInlineAttachment(): boolean {
        if (!!this.inlineFiles) {
            return true
        } else {
            return false
        }
    }

    public setTextCharset(textCharset) {
        this.textCharset = textCharset
    }

    public setTextEncoding(textEncoding) {
        this.textEncoding = textEncoding
    }

    public setTextSize(textSize) {
        this.textSize = textSize
    }

    public getTextSize(): number {
        return this.textSize
    }

    public setTextIndex(textIndex) {
        this.textIndex = textIndex
    }

    public getTextIndex(): string {
        return this.textIndex
    }

    public setHtmlCharset(htmlCharset) {
        this.htmlCharset = htmlCharset
    }

    public setHtmlEncoding(htmlEncoding) {
        this.htmlEncoding = htmlEncoding
    }

    public setHtmlSize(htmlSize) {
        this.htmlSize = htmlSize
    }

    public getHtmlSize(): number {
        return this.htmlSize
    }


    public setHtmlIndex(htmlIndex) {
        this.htmlIndex = htmlIndex
    }

    public gethtmlIndex(): string {
        return this.htmlIndex
    }

    public setCalendarCharset(calendarCharset) {
        this.calendarCharset = calendarCharset
    }

    public setCalendarEncoding(calendarEncoding) {
        this.calendarEncoding = calendarEncoding
    }

    public setCalendarSize(calendarSize) {
        this.calendarSize = calendarSize
    }

    public setCalendarIndex(calendarIndex) {
        this.calendarIndex = calendarIndex
    }

    public getCalendarSize() {
        return this.calendarSize
    }

    /**
     * 获取附件，不包括附件内容数据
     * @param index
     */
    public getAttachment(index) {
        let attachmentFile: AttachmentBody = this.files[index]
        return attachmentFile;
    }

    /**
     * 获取内联附件，不包括附件内容数据
     * @param index
     */
    public getInlineAttachment(index) {
        let attachmentFile: AttachmentBody = this.inlineFiles[index]
        return attachmentFile;
    }

    /**
     * 获取完整text (promise形式)
     */
    public syncGetText(): Promise<MimeBodyPart> {
        return new Promise((resolve, reject) => {
            this.getPartText(this.textSize, (success, mimeBody) => {
                if (success) {
                    resolve(mimeBody)
                } else {
                    reject(mimeBody)
                }
            })
        })
    }

    /**
     * 获取部分text (promise形式)
     * @param number 需要获取的长度
     */
    public syncGetPartText(number: number): Promise<MimeBodyPart> {
        return new Promise((resolve, reject) => {
            this.getPartText(number, (success, mimeBody) => {
                if (success) {
                    resolve(mimeBody)
                } else {
                    reject(mimeBody)
                }
            })
        })
    }

    /**
     * 获取完整text (callback形式)
     * @param callback
     */
    public getText(callback) {
        this.getPartText(this.textSize, callback)
    }

    /**
     * 获取部分text (callback形式)
     * @param number 需要获取的长度
     */
    public getPartText(number: number, callback) {
        if (this.textSize == 0 || number <= 0) {
            return callback(false, "no text")
        }
        let section = ""
        section = ' (BODY[' + this.textIndex + ']<' + '0.' + number + '>)'
        this.store.getBodyPart(false, 0, this.msgNum, section, (success, result) => {
            if (success) {
                let mimeBody = new MimeBodyPart("", "", "")
                mimeBody.setMimeType("text/plain")
                mimeBody.setTransferEncoding(this.textEncoding)
                mimeBody.setCharSet(this.textCharset)
                let content = Util.decodeStr(this.textEncoding, this.textCharset, result)
                if (typeof content === "undefined") {
                    content = result
                }
                mimeBody.setContent(content)
                callback(true, mimeBody)
            } else {
                callback(false, result)
            }
        })
    }

    /**
     * 获取完整html (promise形式)
     */
    public syncGetHtml(): Promise<MimeBodyPart> {
        return new Promise((resolve, reject) => {
            this.getPartHtml(this.htmlSize, (success, mimeBody) => {
                if (success) {
                    resolve(mimeBody)
                } else {
                    reject(mimeBody)
                }
            })
        })
    }

    /**
     * 获取部分html (promise形式)
     * @param number 需要获取的长度
     */
    public syncGetPartHtml(number: number): Promise<MimeBodyPart> {
        return new Promise((resolve, reject) => {
            this.getPartHtml(number, (success, mimeBody) => {
                if (success) {
                    resolve(mimeBody)
                } else {
                    reject(mimeBody)
                }
            })
        })
    }

    /**
     * 获取完整html (callback形式)
     */
    public getHtml(callback) {
        this.getPartHtml(this.htmlSize, callback)
    }

    /**
     * 获取部分html (callback形式)
     * @param number 需要获取的长度
     */
    public getPartHtml(number, callback) {
        if (this.htmlSize == 0 || number <= 0) {
            return callback(false, "no html")
        }
        let section = ""
        section = ' (BODY[' + this.htmlIndex + ']<' + '0.' + number + '>)'

        this.store.getBodyPart(false, 0, this.msgNum, section, (success, result) => {
            if (success) {
                let mimeBody = new MimeBodyPart("", "", "")
                mimeBody.setMimeType("text/html")
                mimeBody.setTransferEncoding(this.htmlEncoding)
                mimeBody.setCharSet(this.htmlCharset)
                let content = Util.decodeHtml(this.htmlEncoding, this.htmlCharset, result)
                mimeBody.setContent(content)
                callback(true, mimeBody)
            } else {
                callback(false, result)
            }
        })
    }

    /**
     * 获取calendar (promise形式)
     */
    public syncGetCalendar(): Promise<MimeBodyPart> {
        return new Promise((resolve, reject) => {
            this.getCalendar((success, mimeBody) => {
                if (success) {
                    resolve(mimeBody)
                } else {
                    reject(mimeBody)
                }
            })
        })
    }

    /**
     * 获取calendar (callback形式)
     * @param number
     * @param callback
     */
    public getCalendar(callback) {
        if (this.calendarSize == 0) {
            return callback(false, "no calendar")
        }
        let section = ""
        section = ' (BODY[' + this.calendarIndex + ']<' + '0.' + this.calendarSize + '>)'

        this.store.getBodyPart(false, 0, this.msgNum, section, (success, result) => {
            if (success) {
                let mimeBody = new MimeBodyPart("", "", "")
                mimeBody.setMimeType("text/calendar")
                mimeBody.setTransferEncoding(this.calendarEncoding)
                mimeBody.setCharSet(this.calendarCharset)
                let content = Util.decodeStr(this.calendarEncoding, this.calendarCharset, result)
                mimeBody.setContent(content)
                callback(true, mimeBody)
            } else {
                callback(false, result)
            }
        })
    }

    public getAttachmentContent(index, callback) {
        if (!!!this.files) {
            return callback(false, "no attachment")
        }
        let section = ""
        let file = this.files[index]
        let fileSize = file.getSize()
        section = ' (BODY[' + file.getIndex() + ']<' + '0.' + fileSize + '>)'

        this.store.getBodyPart(true, fileSize, this.msgNum, section, (success, result) => {
            if (success) {
                callback(true, result)
            } else {
                callback(false, result)
            }
        })
    }

    public getInlineAttachmentContent(index, callback) {
        if (!!!this.inlineFiles) {
            return callback(false, "no attachment")
        }
        let section = ""
        let file = this.inlineFiles[index]
        let fileSize = file.getSize()
        section = ' (BODY[' + file.getIndex() + ']<' + '0.' + file.getSize() + '>)'
        this.store.getBodyPart(true, fileSize, this.msgNum, section, (success, result) => {
            if (success) {
                callback(true, result)
            } else {
                callback(false, result)
            }
        })
    }
}