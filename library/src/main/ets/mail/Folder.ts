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
 * Based on Folder.java written by
 * Copyright (c) 1997, 2023 Oracle and/or its affiliates.
 *
 */

import { Store } from '../mail/Store';
import { Message } from './Message'
import { Constant } from '../Constant';
import { MimeMessage } from './MimeMessage';
import { Util } from '../Util';
import { imapEncode } from '../Utf7Util';


/**
 * 邮箱管理类
 * @param folderName
 */
export class Folder {
    public static READ_ONLY: number = 1
    public static READ_WRITE: number = 2
    public static HOLDS_MESSAGES: number = 1;
    public static HOLDS_FOLDERS: number = 2;
    public mode: number = -1
    private openStatus: boolean
    private folderName: string
    private folderInfo: Map<string, number>
    private cacheMessages: Message[]
    private uidTable: Map<String, Message>;
    private protocol
    private folderList: Array<Folder>
    private store: Store

    constructor(folderName: string, protocol?: string) {
        this.folderName = folderName
        this.protocol = protocol
    }

    public getProtocol() {
        return this.protocol
    }

    public setStore(sto: Store) {
        this.store = sto
    }

    public getStore(): Store {
        return this.store
    }

    /**
     * 同步获取邮箱列表
     */
    public syncList(): Promise<Array<Folder>> {
        return new Promise((resolve, reject) => {
            this.list((success, result) => {
                if (success) {
                    resolve(result)
                } else {
                    reject(result)
                }
            })
        })
    }

    //获取邮箱列表
    public list(callback) {
        if (this.protocol == "pop3") {
            if (!!!this.folderList) {
                this.folderList = new Array()
                let folder = new Folder("INBOX", "pop3")
                folder.setStore(this.getStore())
                this.folderList.push(folder)
            }
            callback(true, this.folderList)
            return
        }

        if (!!this.store) {
            this.store.getFolderList((success, result) => {
                if (success) {
                    if (!!result && result.length > 0) {
                        if (!!!this.folderList) {
                            this.folderList = new Array()
                            for (let i = 0; i < result.length; i++) {
                                let folder = new Folder(result[i], this.protocol)
                                folder.setStore(this.getStore())
                                this.folderList.push(folder)
                            }
                        }
                        callback(true, this.folderList)
                    }
                } else {
                    callback(false, result)
                }
            })
        }
    }

    public setFolderInfo(folderInfo: Map<string, number>) {
        if (!!folderInfo) {
            this.folderInfo = folderInfo
        }
    }

    /**
     * 打开文件夹（promise形式）
     * @param mode
     */
    public syncOpen(mode: number): Promise<any> {
        return new Promise((resolve, reject) => {
            this.open(mode, (err) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(null)
                }
            })
        })
    }

    public open(mode: number, callback) {
        let cmd
        if (mode == Folder.READ_WRITE || mode == Folder.HOLDS_FOLDERS) {
            cmd = "SELECT"
        } else if (mode == Folder.READ_ONLY || mode == Folder.HOLDS_MESSAGES) {
            cmd = "EXAMINE"
        }
        this.store.open(cmd, this.folderName, (err) => {
            if (err) {
                this.openStatus = false
                callback(err)
            } else {
                this.openStatus = true
                callback(null)
            }
        })
    }

    public close() {
        if (!!this.store) {
            this.store.close((success) => {
                if (success) {
                    this.openStatus = false
                } else {
                    this.openStatus = true
                }
            })
        }
    }

    public isOpen(): boolean {
        return this.openStatus
    }

    public getMessage(msgNums: number) {
        let msgCount = this.getMessageCount()
        if (msgNums > msgCount) {
            return new Error("IndexOutOfBoundsException " + msgNums + " > " + msgCount)
        }
        let msg
        if (msgCount > 0) {
            if (!!this.cacheMessages) {
                for (let i = 0; i < this.cacheMessages.length; i++) {
                    if (this.cacheMessages[i].getMessageNumber() == msgNums) {
                        msg = this.cacheMessages[i]
                    }
                }
            } else {
                msg = new Message(this, msgNums)
            }
        }
        return msg
    }

    /**
     * 同步移动邮件（promise形式）
     * @param srcMsg
     * @param folder
     */
    public syncMoveMessages(srcMsg: Message[], folder: Folder): Promise<string> {
        return new Promise((resolve, reject) => {
            this.moveMessages(srcMsg, folder, (success, result) => {
                if (success) {
                    resolve(result)
                } else {
                    reject(result)
                }
            })
        })
    }

    public moveMessages(srcMsg: Message[], folder: Folder, callback) {
        if (this.folderName == folder.getName()) {
            return new Error('src and dst are the same folder!')
        }

        if (!!!srcMsg) {
            return new Error('src message is null')
        }

        let arr = new Array<number>()
        for (let i = 0; i < srcMsg.length; i++) {
            arr.push(srcMsg[i].getMessageNumber())
        }

        if (!!this.store) {
            this.store.moveMessages(arr, folder.getName(), (success, err) => {
                callback(success, err)
            })
        }
    }

    /**
     * 同步移动邮件（promise形式）
     * @param srcMsg
     * @param folder
     */
    public syncCopyMessages(srcMsg: Message[], folder: Folder): Promise<Array<number>> {
        return new Promise((resolve, reject) => {
            this.copyMessages(srcMsg, folder, (success, result) => {
                if (success) {
                    resolve(result)
                } else {
                    reject(result)
                }
            })
        })
    }

    public copyMessages(srcMsg: Message[], folder: Folder, callback) {
        if (this.folderName == folder.getName()) {
            return new Error('src and dst are the same folder!')
        }

        if (!!!srcMsg) {
            return new Error('src message is null')
        }

        let arr = new Array<number>()
        for (let i = 0; i < srcMsg.length; i++) {
            arr.push(srcMsg[i].getMessageNumber())
        }

        if (!!this.store) {
            this.store.copyMessages(arr, folder.getName(), (success, err) => {
                callback(success, err)
            })
        }
    }

    /**
     * 同步获取一个邮件文件夹是否存在（promise形式）
     */
    public syncExists(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.exists((success, result) => {
                if (success) {
                    resolve(result)
                } else {
                    reject(result)
                }
            })
        })
    }

    public exists(callback) {
        this.store.exists(this.folderName, callback)
    }

    public syncAppendMessage(message: MimeMessage): Promise<String> {
        return new Promise((resolve, reject) => {
            this.appendMessage(message, (err) => {
                if (!err) {
                    resolve(err)
                } else {
                    reject(err)
                }
            })
        })
    }

    public appendMessage(message: MimeMessage, callback: (err) => void) {
        if (!!!message) {
            callback("MimeMessage is null")
            return
        }

        let folderName
        if (Util.isChinese(this.folderName)) {
            folderName = imapEncode(this.folderName)
        } else {
            folderName = "\"" + this.folderName + "\""
        }
        let data = message.getMimeMessage()
        let dataSize = data.byteLength - 2
        let cmd = folderName + " () " + "\"" + new Date() + "\" {" + dataSize + "}"
        this.store.appendMessage(cmd, data, callback)
    }

    public syncExpunge(): Promise<String> {
        return new Promise((resolve, reject) => {
            this.expunge((err) => {
                if (!err) {
                    resolve(err)
                } else {
                    reject(err)
                }
            })
        })
    }

    public expunge(callback) {
        if (!!this.store) {
            this.store.expunge((err) => {
                callback(err)
            })
        }
    }

    public getFolder(folderName: string): Folder {
        return new Folder(this.getFullName() + '/' + folderName)
    }

    public setMessageCount(count: number) {
        if (!!!this.folderInfo) {
            this.folderInfo = new Map<string, number>()
        }
        this.folderInfo.set(Constant.MESSAGE_COUNT, count)
    }

    public getMessageCount(): number {
        if (!this.isOpen() || !!!this.folderInfo) {
            return -1
        }

        if (this.folderInfo.has(Constant.MESSAGE_COUNT)) {
            return this.folderInfo.get(Constant.MESSAGE_COUNT)
        } else {
            return 0
        }
    }

    /**
     * 同步获取删除邮件（promise形式）
     */
    public syncGetDeletedMessageCount(): Promise<string> {
        return new Promise((resolve, reject) => {
            this.getDeletedMessageCount((success, result) => {
                if (success) {
                    resolve(result)
                } else {
                    reject(result)
                }
            })
        })
    }

    public getDeletedMessageCount(callback) {
        if (!!this.store) {
            this.store.getDeletedMessageCount(callback)
        }
    }

    public getMode(): number {
        if (this.isOpen()) {
            return this.mode
        }
    }

    public getName(): string {
        return this.folderName
    }

    public getFullName(): string {
        return this.folderName
    }

    public setUnreadMessageCount(count: number) {
        if (!!!this.folderInfo) {
            this.folderInfo = new Map<string, number>()
        }
        this.folderInfo.set(Constant.UNREAD_MESSAGE_COUNT, count)
    }

    public getUnreadMessageCount(): number {
        if (!this.isOpen() || !!!this.folderInfo) {
            return -1
        }
        let unreadMessageCount = 0
        if (this.folderInfo.has(Constant.UNREAD_MESSAGE_COUNT)) {
            unreadMessageCount += this.folderInfo.get(Constant.UNREAD_MESSAGE_COUNT)
        } else if (this.folderInfo.has(Constant.NEW_MESSAGE_COUNT)) {
            unreadMessageCount += this.folderInfo.get(Constant.NEW_MESSAGE_COUNT)
        }
        return unreadMessageCount
    }

    public getNewMessageCount(): number {
        if (!this.isOpen() || !!!this.folderInfo) {
            return -1
        }

        if (this.folderInfo.has(Constant.NEW_MESSAGE_COUNT)) {
            return this.folderInfo.get(Constant.NEW_MESSAGE_COUNT)
        } else {
            return 0
        }
    }

    public getUIDNext(): number {
        if (!this.isOpen() || !!!this.folderInfo) {
            return -1
        }

        if (this.folderInfo.has(Constant.UID_NEXT)) {
            return this.folderInfo.get(Constant.UID_NEXT)
        } else {
            return -1
        }
    }

    public getUIDValidity(): number {
        if (!this.isOpen() || !!!this.folderInfo) {
            return -1
        }

        if (this.folderInfo.has(Constant.UID_VALIDITY)) {
            return this.folderInfo.get(Constant.UID_VALIDITY)
        } else {
            return -1
        }
    }

    public getMessages(): Message[] {
        let total = this.getMessageCount();

        let messages = new  Array<Message>()
        for (let i = 0; i < total; i++) {
            messages.push(new Message(this, i + 1))
        }
        this.cacheMessages = messages
        return messages
    }

    public syncGetUID(message: Message): Promise<String> {
        return new Promise((resolve, reject) => {
            this.getUID(message, (success, result) => {
                if (success) {
                    resolve(result)
                } else {
                    reject(result)
                }
            })
        })
    }

    public getUID(message: Message, callback) {
        if (!!this.store) {
            this.store.getMailUID(message.getMessageNumber(), (success, result) => {
                if (!!!this.uidTable) {
                    this.uidTable = new Map()
                }

                if (!this.uidTable.has(result)) {
                    this.uidTable.set(result, message)
                }
                callback(success, result)
            })
        }
    }

    public syncGetMessageByUID(uid: string): Promise<Message> {
        return new Promise((resolve, reject) => {
            this.getMessageByUID(uid, (success, result) => {
                if (success) {
                    resolve(result)
                } else {
                    reject(result)
                }
            })
        })
    }

    public getMessageByUID(uid: string, callback) {
        if (this.protocol == "pop3") {
            callback(false, "not support pop3")
            return
        }
        if (!!this.uidTable && !!this.uidTable.get(uid)) {
            callback(true, this.uidTable.get(uid))
            return
        }
        this.store.getMsgNumByUid(uid, (success, result) => {
            if (success) {
                let msg = new Message(this, result)
                if (!!!this.uidTable) {
                    this.uidTable = new Map()
                }
                if (!this.uidTable.has(uid)) {
                    this.uidTable.set(uid, msg)
                }
                callback(true, msg)
            } else {
                callback(false, result)
            }
        })
    }
}


