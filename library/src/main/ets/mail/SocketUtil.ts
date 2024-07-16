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

import connection from '@ohos.net.connection'
import wifiManager from '@ohos.wifiManager'
import { Util } from '../Util'
import { MailLogger } from '../MailLogger'
import socket from '@ohos.net.socket'


export class SocketUtil {
    private ALPNProtocols: Array<string> = ["spdy/1", "http/1.1"]
    private secureOptions: socket.TLSSecureOptions = {
        ca: [],
        cert: '',
        key: '',
        protocols: [socket.Protocol.TLSv12],
        useRemoteCipherPrefer: true,
        signatureAlgorithms: '',
        cipherSuite: ''
    }

    constructor() {
    }

    public connect(tcp, host: string, port: number, isSSL: boolean, ca: string[], timeout: number, connectEvent, responseEvent?) {
        MailLogger.info("ohos_mail-- version flag:2.0.0-beta")
        let ipInfo = wifiManager.getIpInfo()
        let ip = Util.intToIP(ipInfo.ipAddress)

        if (isSSL) {
            if (!!!ca) {
                connectEvent(false, "ssl ca is null")
                return
            }
            this.secureOptions.ca = ca
            let promise = tcp.bind({ address: ip, port: 0, family: 1 });
            promise.then(() => {
                tcp.on('message', (value) => {
                    responseEvent(value)
                });

                MailLogger.info('ohos_mail-- bind tls success to:' + ip);
                connection.getAddressesByName(host).then((netAddress) => {
                    let ip
                    for (let i = 0; i < netAddress.length; i++) {
                        if (Util.isIP(netAddress[i].address)) {
                            ip = netAddress[i].address
                            MailLogger.info('ohos_mail-- address = ' + ip)
                            break
                        }
                    }

                    if (!!!ip) {
                        return connectEvent(false, "not available ip")
                    }

                    let options = {
                        ALPNProtocols: this.ALPNProtocols,
                        address: {
                            address: ip,
                            port: port,
                            family: 1
                        },
                        secureOptions: this.secureOptions,
                    }
                    tcp.connect(options, (err, data) => {
                        if (err) {
                            MailLogger.error('ohos_mail-- connect tls server fail ' + JSON.stringify(err));
                            connectEvent(false, err)
                            return
                        }
                        MailLogger.info('ohos_mail-- connect tls server success')
                    });
                }).catch(err => {
                    connectEvent(false, "getAddressesByName fail,please check your host")
                    MailLogger.error('ohos_mail-- getAddressesByName fail ' + JSON.stringify(err));
                });
            }).catch(err => {
                connectEvent(false, err)
                MailLogger.info('ohos_mail-- bind fail ' + JSON.stringify(err))
            });
            return
        }

        let promise = tcp.bind({ address: ip, port: 0, family: 1 });
        promise.then(() => {
            tcp.on('message', (value) => {
                responseEvent(value)
            });
            MailLogger.info('ohos_mail-- bind tcp success to:' + ip);
            connection.getAddressesByName(host).then((netAddress) => {
                var ip
                for (let i = 0; i < netAddress.length; i++) {
                    if (Util.isIP(netAddress[i].address)) {
                        ip = netAddress[i].address
                        MailLogger.info('ohos_mail-- address = ' + ip)
                        break
                    }
                }

                if (!!!ip) {
                    return connectEvent(false, "not available ip")
                }

                tcp.connect({
                    address: { address: ip, port: port },
                    timeout: timeout
                }).then(() => {
                    MailLogger.info('ohos_mail-- connect tcp server success')
                    tcp.setExtraOptions({
                        keepAlive: true,
                        OOBInline: true,
                        TCPNoDelay: true,
                        receiveBufferSize: 1024 * 1024 * 20,
                        reuseAddress: true,
                        socketTimeout: 6000,
                    }, err => {
                        if (err) {
                            MailLogger.info('ohos_mail-- setExtraOptions fail')
                            return;
                        }
                        MailLogger.info('ohos_mail-- setExtraOptions success')
                    });
                }).catch(err => {
                    if (connectEvent) {
                        connectEvent(false, err)
                    }
                    MailLogger.error('ohos_mail-- connect server fail ' + JSON.stringify(err));
                });
            }).catch(err => {
                connectEvent(false, "getAddressesByName fail,please check your host")
                MailLogger.error('ohos_mail-- getAddressesByName fail ' + JSON.stringify(err));
            });
        }).catch(err => {
            connectEvent(false, err)
            MailLogger.error('ohos_mail-- bind tcp fail ' + err);
        });
    }
}