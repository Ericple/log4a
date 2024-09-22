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
import { AbstractAppender } from '../abstract/AbstractAppender';
import common from '@ohos.app.ability.common';
import { Level } from '../Level';
import { AppenderTypeEnum } from '../spi/AppenderTypeEnum';
import relationalStore from '@ohos.data.relationalStore';
import { TemporaryLoggerContext } from '../TemporaryLoggerContext';
import { ILogInfo } from '../spi/LogInfo';
import { RdbStoreManager } from '../RdbStoreManager';
import { Logger } from '../Logger';
import { LogManager } from '../LogManager';

export interface IDatabaseAppenderOption {
  ctx: common.BaseContext;
  name: string;
  level: Level;
  storeConfig?: relationalStore.StoreConfig;
}

export class DbLogFilter {
  private _tag?: string;
  private _maxLevel?: Level;
  private _minLevel?: Level;

  private constructor() {
  }

  static create() {
    return new DbLogFilter;
  }

  /**
   * 设置最高日志等级
   * @param level
   * @returns
   */
  maxLevel(level: Level) {
    this._maxLevel = level;
    return this;
  }

  /**
   * 设置最低日志等级
   * @param level
   * @returns
   */
  minLevel(level: Level) {
    this._minLevel = level;
    return this;
  }

  /**
   * 设置标签
   * @param tag
   * @returns
   */
  tag(tag: string) {
    this._tag = tag;
    return this;
  }

  build() {
    if (this._tag == undefined || this._maxLevel == undefined || this._minLevel == undefined) {
      return '';
    }
    const t: Array<string> = new Array;
    if (this._tag) {
      t.push(`TAG = ${this._tag}`);
    }
    if (this._maxLevel) {
      t.push(`LEVEL_INT <= ${this._maxLevel._intLevel}`);
    }
    if (this._minLevel) {
      t.push(`LEVEL_INT >= ${this._minLevel._intLevel}`);
    }
    return ` WHERE ${t.join(' AND ')}`
  }
}

enum DatabaseFetchingStatus {
  INVALID,
  FETCHING,
  DONE
}

export class DatabaseAppender extends AbstractAppender {
  private _options: IDatabaseAppenderOption;
  private _db?: relationalStore.RdbStore;
  private _temp: Array<ILogInfo> = new Array;
  private _dbStatus: DatabaseFetchingStatus = DatabaseFetchingStatus.INVALID;
  private _logger: Logger = LogManager.getLogger(this);

  constructor(options: IDatabaseAppenderOption) {
    super(options.name, options.level, AppenderTypeEnum.DATABASE);
    this._options = options;
    this._getDB();
  }

  private async _getDB() {
    this._dbStatus = DatabaseFetchingStatus.FETCHING;
    try {
      this._db = await RdbStoreManager.getStore(this._options);
      this._dbStatus = DatabaseFetchingStatus.DONE;
      this._handleTemp();
    } catch (err) {
      this._logger.error('Cannot get database to append from config: {}. Error: {}', this._options.storeConfig, err);
      this._dbStatus = DatabaseFetchingStatus.INVALID;
    }
  }

  onLog(level: Level, tag: string, time: number, count: number, message: string,
    tempContext: TemporaryLoggerContext): this {
    if (!this.loggable(level)) {
      return this;
    }
    if (this._db && this._dbStatus == DatabaseFetchingStatus.DONE) {
      this._db.insertSync(this._options.name, {
        'LEVEL': level.name,
        'TAG': tag,
        'TIME': time,
        'COUNT': count,
        'MESSAGE': message,
        'LEVEL_INT': level._intLevel
      });
      return this;
    }
    this._temp.push({
      level,
      tag,
      time,
      count,
      message,
      tempContext
    });
    return this;
  }

  getLogs(filter?: DbLogFilter): Array<ILogInfo> {
    const condition = filter?.build() ?? '';
    const result: Array<ILogInfo> = new Array;
    if (this._db) {
      const resultSet = this._db.querySqlSync(`SELECT * FROM ${this._options.name}${condition}`);
      if (!resultSet.goToFirstRow()) {
        return result;
      }
      do {
        const levelName = resultSet.getString(resultSet.getColumnIndex('LEVEL'));
        const tag = resultSet.getString(resultSet.getColumnIndex('TAG'));
        const time = resultSet.getDouble(resultSet.getColumnIndex('TIME'));
        const count = resultSet.getDouble(resultSet.getColumnIndex('COUNT'));
        const message = resultSet.getString(resultSet.getColumnIndex('MESSAGE'));
        result.push({
          level: Level.getLevel(levelName),
          tag,
          time,
          count,
          message
        })
      } while (resultSet.goToNextRow())
      resultSet.close();
    }
    return result;
  }

  private _handleTemp() {
    while (this._temp.length > 0) {
      const info = this._temp.pop();
      this.onLog(info.level, info.tag, info.time, info.count, info.message, info.tempContext);
    }
  }
}