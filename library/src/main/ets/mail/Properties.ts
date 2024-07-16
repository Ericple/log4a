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

/**
 * 初始化连接邮件服务器的会话信息
 */
export class Properties {
    public protocol: string;
    public host: string;
    public port: number;
    public from: string;
    public authorizationCode: string;
    public isSsl: boolean = false
    public caData: string[]
    public timeOutMillisecond: number = 20000

    constructor(protocol?: string) {
        this.protocol = protocol
    }

    public setTimeOutMillisecond(timeout) {
        this.timeOutMillisecond = timeout
    }

    public getTimeOutMillisecond(): number {
        return this.timeOutMillisecond
    }

    public ca(data: string[]) {
        this.caData = data
    }

    public getCa() {
        return this.caData
    }

    public getProtocol() {
        return this.protocol
    }

    public ssl(flag: boolean) {
        this.isSsl = flag
    }

    public isSSL() {
        return this.isSsl
    }

    public setHost(host: string) {
        this.host = host
    }

    public getHost() {
        return this.host
    }

    public setPort(port: number) {
        this.port = port
    }

    public getPort() {
        return this.port
    }

    public setFrom(from: string) {
        this.from = from
    }

    public getFrom() {
        return this.from
    }

    public setAuthorizationCode(authorizationCode: string) {
        if (!!this.from && this.from.endsWith("@189.cn")) {
            this.authorizationCode = "\"" + authorizationCode + "\"";
        } else {
            this.authorizationCode = authorizationCode
        }
    }

    public getAuthorizationCode() {
        return this.authorizationCode
    }
}