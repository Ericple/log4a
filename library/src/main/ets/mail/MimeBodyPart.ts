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
 * Based on MimeBodyPart.java written by
 * Copyright (c) 1997, 2023 Oracle and/or its affiliates.
 *
 */

export class MimeBodyPart {
    private fileName: string
    private contentId: string
    private data: Uint8Array
    private mimeType: string;
    private path: string
    private transferEncoding: string = "base64";
    private charSet
    private content

    constructor(path: string, fileName: string, contentId: string) {
        this.fileName = fileName
        this.contentId = contentId
        this.path = path
    }

    public setCharSet(charSet) {
        this.charSet = charSet
    }

    public getCharSet() {
        return this.charSet
    }

    public getPath() {
        return this.path
    }

    public getFileName() {
        return this.fileName
    }

    public setFileName(fileName: string) {
        this.fileName = fileName
    }

    public setMimeType(mimeType: string) {
        this.mimeType = mimeType
    }

    public getMimeType() {
        return this.mimeType
    }

    public getData() {
        return this.data
    }

    public setData(data: Uint8Array) {
        this.data = data
    }

    public getContent() {
        return this.content
    }

    public setContent(content: string) {
        this.content = content
    }

    public getContentId() {
        return this.contentId
    }

    public setContentId(contentId: string) {
        this.contentId = contentId
    }

    public setTransferEncoding(transferEncoding: string) {
        this.transferEncoding = transferEncoding
    }

    public getTransferEncoding() {
        return this.transferEncoding
    }
}