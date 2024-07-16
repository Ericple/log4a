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
 * smtp 服务器响应码
 */
export class ResponseCode {
    public static readonly AUTHENTICATION_SUCCESS: string = "235"
    public static readonly AUTHENTICATION_FAIL: string = "535"
    public static readonly COMMAND_ERR: string = "502"
    public static readonly SERVICE_READY: string = "220"
    public static readonly SERVICE_SHUTDOWN: string = "221"
    public static readonly ERROR_COMMAND_SEQUENCE: string = "503"
    public static readonly MAIL_OPERATE_COMPLETE: string = "250"
    public static readonly PARAMETER_FORMAT_ERROR: string = "501"
    public static readonly WAIT_USER_SEND_AUTH_INFO_USERNAME: string = "334"
    public static readonly WAIT_USER_SEND_AUTH_INFO_PASSWORD: string = "334"
    public static readonly WAIT_USER_SEND_MESSAGE_BODY: string = "354"
    public static readonly ABANDON_OPERATE: string = "451"
}