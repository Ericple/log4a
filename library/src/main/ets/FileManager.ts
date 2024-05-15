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
import fs from '@ohos.file.fs';
import { LogManager } from './LogManager';

class ManagedFile {
  file: fs.File;
  cachedCount: number;
  cachedFiles: string[];

  constructor(file: fs.File, cf: string[]) {
    this.file = file;
    this.cachedFiles = cf;
  }
}

class FileManagerClass {
  private _fileMap: Map<string, ManagedFile> = new Map();

  getFile(path: string): fs.File {
    if (this._fileMap.has(path)) {
      return this._fileMap.get(path)?.file;
    }
    const f = fs.openSync(path, fs.OpenMode.READ_WRITE | fs.OpenMode.CREATE | fs.OpenMode.APPEND);
    this._fileMap.set(path, new ManagedFile(f, this.getCachedFiles(path)));
    return this._fileMap.get(path)?.file;
  }

  unlink(path: string): void {
    if (fs.accessSync(path)) {
      fs.unlinkSync(path);
      if (this._fileMap.delete(path)) {
        const f = fs.openSync(path, fs.OpenMode.READ_WRITE | fs.OpenMode.CREATE | fs.OpenMode.APPEND);
        this._fileMap.set(path, new ManagedFile(f, this.getCachedFiles(path)));
      }
    }
  }

  close(path: string): void {
    if (this._fileMap.has(path)) {
      const f = this._fileMap.get(path);
      fs.closeSync(f?.file);
      this._fileMap.delete(path);
    }
  }

  getCachedFiles(path: string): string[] {
    const cachePath = path.substring(0, path.lastIndexOf('/'));
    const files = fs.listFileSync(cachePath);
    const fileName = path.substring(path.lastIndexOf('/') + 1);
    const result = files.map(v => cachePath + '/' + v).filter(file => (file.includes(fileName) && file != path)).sort((a, b) =>
    Number(a.replace(path + '.', '')) - Number(b.replace(path + '.', ''))
    );
    return result;
  }

  getDailyCachedFiles(): string[] {
    const cachePath = LogManager.getLogFilePath();
    const files = fs.listFileSync(cachePath);
    const reg = new RegExp("\\d{4,5}-\\d{1,2}-\\d{1,2}.daily.log", 'g');
    return files.filter(fileName => reg.test(fileName)).sort((a, b) => (new Date(a.split('.')[0])).getTime() - (new Date(b.split('.')[0])).getTime());
  }

  getManaged(path: string): ManagedFile {
    if (this._fileMap.has(path)) {
      return this._fileMap.get(path);
    }
    const f = fs.openSync(path, fs.OpenMode.READ_WRITE | fs.OpenMode.CREATE | fs.OpenMode.APPEND);
    this._fileMap.set(path, new ManagedFile(f, this.getCachedFiles(path)));
    return this._fileMap.get(path);
  }

  backup(path: string, limitCount: number, cached: string[]): void {
    const backupName = path + '.' + Date.now()
    if (fs.accessSync(path)) {
      fs.moveFileSync(path, backupName);
      cached.push(backupName);
      if (this._fileMap.delete(path)) {
        const f = fs.openSync(path, fs.OpenMode.READ_WRITE | fs.OpenMode.CREATE);
        this._fileMap.set(path, new ManagedFile(f, cached));
        if (limitCount > 0) {
          while (cached.length > limitCount) {
            let c = cached.shift();
            if (fs.accessSync(c)) {
              fs.unlinkSync(c);
            }
          }
        }
      }
    }
  }
}

export const FileManager = new FileManagerClass;