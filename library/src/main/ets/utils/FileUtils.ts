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

import fs from '@ohos.file.fs';

class CFileUtils {
  ensurePath(path: string): boolean {
    if (fs.accessSync(path)) {
      return true;
    }
    const path2Mk: string[] = [];
    let tmpPath = path.split('/');
    do {
      const p = tmpPath.join('/')
      if (fs.accessSync(p)) {
        break;
      }
      path2Mk.unshift(p);
      tmpPath.pop();
    } while (tmpPath.length > 1);
    while (path2Mk.length > 0) {
      const p2m = path2Mk.shift();
      if (!p2m) {
        break;
      }
      fs.mkdirSync(p2m);
    }
    return false;
  }
}

export const FileUtils = new CFileUtils();