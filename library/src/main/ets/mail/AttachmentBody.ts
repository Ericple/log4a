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
 */

import { MimeTypeDetector } from '../mime_types/MimeTypeDetector'
import fs from '@ohos.file.fs';
import util from '@ohos.util';
import { MailLogger } from '../MailLogger';

/**
 * 附件
 */
export class AttachmentBody {
    //文件在邮件中的位置
    private index: string;
    //文件名称
    public fileName: string;
    //mimetype
    public mimeType: string;
    //传输编码格式
    public transferEncoding: string = "base64";
    //附件内容
    public uint8ArrayData: Uint8Array;
    private contentType: string;
    private contentId: string;
    private contentDisposition: string
    private path: string
    private size: number
    private charSet: string
    private content: string
    private cid: string
    private data: string
    private cacheContent

    constructor(path: string, fileName: string) {
        this.fileName = fileName
        this.path = path
    }

    public setData(data: string) {
        this.data = data
    }

    public setCacheContent(cacheContent) {
        this.cacheContent = cacheContent
    }

    public getCacheContent() {
        return this.cacheContent
    }

    public getData(): string {
        let data: string
        if (!!this.data) {
            let list: Array<string> = new Array()
            let arr = this.data.split("\r\n")
            let length = arr.length
            if (length > 1) {
                for (let i = 0; i < length; i++) {
                    if (!arr[i].startsWith("--")) {
                        list.push(arr[i])
                    }
                }
                data = list.join("\r\n")
            }
        }
        return data
    }

    public setIndex(index) {
        this.index = index
    }

    public getIndex() {
        return this.index
    }

    public setCid(cid: string) {
        this.cid = cid
    }

    public getCid() {
        return this.cid
    }

    public setCharSet(charSet: string) {
        this.charSet = charSet
    }

    public getCharSet() {
        return this.charSet
    }

    public setContent(content: string) {
        this.content = content
    }

    public getContent() {
        return this.content
    }

    public setSize(size: number) {
        this.size = size
    }

    public getSize() {
        if (!!this.size) {
            return this.size
        }

        if (!!this.data) {
            return this.data.length
        } else {
            return 0
        }
    }

    public getPath() {
        return this.path
    }

    public setDisposition(disposition: string) {
        this.contentDisposition = disposition
    }

    public getDisposition(): string {
        return this.contentDisposition
    }

    public setFileName(fileName: string) {
        this.fileName = fileName
    }

    public getFileName() {
        return this.fileName
    }

    public setMimeType(mimeType: string) {
        this.mimeType = mimeType
    }

    public getMimeType() {
        return this.mimeType
    }

    public setContentType(contentType: string) {
        this.contentType = contentType
    }

    public getContentType(): string {
        return this.contentType
    }

    public setContentID(contentId: string) {
        this.contentId = contentId
    }

    public getContentID(): string {
        return this.contentId
    }

    public setEncoding(transferEncoding: string) {
        this.transferEncoding = transferEncoding
    }

    public getEncoding() {
        return this.transferEncoding
    }

    public setUint8ArrayData(data: Uint8Array) {
        this.uint8ArrayData = data
    }

    public getUint8ArrayData(): Uint8Array {
        if (!!this.uint8ArrayData) {
            if (!!this.cacheContent) {
                this.mimeType = MimeTypeDetector.detectMimeType(this.path + '/' + this.fileName, this.cacheContent)
            } else {
                this.mimeType = MimeTypeDetector.detectMimeType(this.path + '/' + this.fileName)
            }
            return this.uint8ArrayData
        }
        if (this.fileName == "") {
            return null
        }
        try {
            let exist = fs.accessSync(this.path + '/' + this.fileName);
            if (exist) {
                if (!!this.cacheContent) {
                    this.mimeType = MimeTypeDetector.detectMimeType(this.path + '/' + this.fileName, this.cacheContent)
                } else {
                    this.mimeType = MimeTypeDetector.detectMimeType(this.path + '/' + this.fileName)
                }
                MailLogger.info('ohos_mail-- mimeType:' + this.mimeType);
                let fd = fs.openSync(this.path + '/' + this.fileName, fs.OpenMode.READ_ONLY);
                let stat = fs.statSync(this.path + '/' + this.fileName)
                let bufFrame = new ArrayBuffer(stat.size);
                fs.readSync(fd.fd, bufFrame)
                MailLogger.info("ohos_mail-- attach size--" + bufFrame.byteLength)
                this.uint8ArrayData = new util.Base64().encodeSync(new Uint8Array(bufFrame))
            } else {
                this.data = null
                MailLogger.error('ohos_mail-- get attachment data fail:' + JSON.stringify("No such file or directory"))
            }
        } catch (e) {
            this.data = null
            MailLogger.error('ohos_mail-- get attachment data fail:' + e)
        }
        return this.uint8ArrayData
    }
}