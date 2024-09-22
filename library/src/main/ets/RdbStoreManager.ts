/*
 * Copyright (c) 2024. Guo TingJin
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
import relationalStore from '@ohos.data.relationalStore'
import { DatabaseAppenderOption } from './appender/DatabaseAppender';

class CRdbStoreManager {
  private _storeMap: Map<string, relationalStore.RdbStore> = new Map();

  async getStore(databaseAppenderOptions: DatabaseAppenderOption): Promise<relationalStore.RdbStore> {
    if (this._storeMap.has(databaseAppenderOptions.name)) {
      return this._storeMap.get(databaseAppenderOptions.name);
    }
    const store =
      await relationalStore.getRdbStore(databaseAppenderOptions.ctx, databaseAppenderOptions.storeConfig ?? {
        securityLevel: relationalStore.SecurityLevel.S1,
        name: `log4a_${databaseAppenderOptions.name}_output.db`
      });
    store.executeSync('CREATE TABLE IF NOT EXISTS ' + databaseAppenderOptions.name + ' (' +
      'LEVEL TEXT,' +
      'TAG TEXT,' +
      'TIME INTEGER,' +
      'COUNT INTEGER,' +
      'MESSAGE TEXT,' +
      'LEVEL_INT INTEGER);');
    this._storeMap.set(databaseAppenderOptions.name, store);
    return store;
  }
}

export const RdbStoreManager = new CRdbStoreManager();