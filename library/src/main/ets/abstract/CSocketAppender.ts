/*
 * Copyright 2024 Tingjin Guo
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { AbstractAppender } from './AbstractAppender';
import { wifiManager } from '@kit.ConnectivityKit';

export abstract class CSocketAppender extends AbstractAppender {
  protected parseInfo2IP(info: number) {
    let ip: string;
    let ta: number[] = [];
    ta[0] = (info >>> 24) >>> 0;
    ta[1] = ((info << 8) >>> 24) >>> 0;
    ta[2] = (info << 16) >>> 24;
    ta[3] = (info << 24) >>> 24;
    ip = String(ta[0]) + "." + String(ta[1]) + "." + String(ta[2]) + "." + String(ta[3]);
    return ip;
  }

  protected getIP() {
    return this.parseInfo2IP(wifiManager.getIpInfo().ipAddress)
  }
}