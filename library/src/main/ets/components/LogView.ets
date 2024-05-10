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
import { Logger } from '../Logger'
import { AppenderTypeEnum } from '../spi/AppenderTypeEnum';

export enum LogViewMode {
  ALL,
  SESSION
}

export class LogViewColorConfig {
  fatal: ResourceColor = Color.Red;
  error: ResourceColor = Color.Red;
  warn: ResourceColor = Color.Orange;
  info: ResourceColor = Color.Gray;
  debug: ResourceColor = Color.Orange;
  trace: ResourceColor = Color.Orange;
}

export interface LogViewConfig {
  mode: LogViewMode;
  colorConfig: LogViewColorConfig;
}

export interface LogViewConfigAll extends LogViewConfig {
  appender: string;
}

export interface LogViewConfigSession extends LogViewConfig {
  appender: string | AppenderTypeEnum;
}

@Observed
class LazyDataSource <T> implements IDataSource {
  _data: T[] = [];
  _listeners: DataChangeListener[] = [];

  totalCount(): number {
    return this._data.length;
  }

  getData(index: number): T {
    return this._data[index];
  }

  registerDataChangeListener(listener: DataChangeListener): void {
    if (this._listeners.indexOf(listener) < 0) this._listeners.push(listener);
  }

  unregisterDataChangeListener(listener: DataChangeListener): void {
    let index = this._listeners.indexOf(listener);
    if (index > 0) this._listeners.splice(index, 1);
  }

  notifyDataReload(): void {
    this._listeners.forEach(l => {
      l.onDataReloaded();
    });
  }

  notifyDataAdd(index: number): void {
    this._listeners.forEach(l => {
      l.onDataAdd(index);
    });
  }

  notifyDataChange(index: number): void {
    this._listeners.forEach(l => {
      l.onDataChange(index);
    });
  }

  notifyDataDelete(index: number): void {
    this._listeners.forEach(l => {
      l.onDataDelete(index);
    });
  }
}

@Component
export struct LogView {
  @Link src: Logger;
  @Prop @Require config: LogViewConfigAll | LogViewConfigSession;
  @State logs: LazyDataSource<string> = new LazyDataSource();

  refresh() {
    if (this.config.mode === LogViewMode.ALL) {
      this.logs._data = this.src.getAllHistoryOfAppender(this.config.appender as string).split('\n');
    } else {
      this.logs._data = this.src.getHistoryOfAppender(this.config.appender).split('\n');
    }
  }

  aboutToAppear(): void {
    this.refresh();
    this.src.registerLogListener((_, log) => {
      console.log('log listener')
      this.logs._data.push(log);
      this.logs.notifyDataAdd(this.logs.totalCount())
    });
  }

  getLogColor(log: string) {
    if (log.startsWith('[FATAL')) {
      return this.config.colorConfig.fatal;
    }
    if (log.startsWith('[ERROR')) {
      return this.config.colorConfig.error;
    }
    if (log.startsWith('[WARN')) {
      return this.config.colorConfig.warn;
    }
    if (log.startsWith('[INFO')) {
      return this.config.colorConfig.info;
    }
    if (log.startsWith('[DEBUG')) {
      return this.config.colorConfig.debug;
    }
    if (log.startsWith('[TRACE')) {
      return this.config.colorConfig.trace;
    }
    return Color.Gray;
  }

  build() {
    Scroll() {
      Column() {
        LazyForEach(this.logs, (log: string) => {
          Text(log)
            .width('100%')
            .fontSize(12)
            .fontColor(this.getLogColor(log))
        })
      }
      .padding(12)
    }
    .width('100%')
    .height('100%')
  }
}