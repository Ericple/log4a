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
export class Marker {
  private _name: string;

  constructor(name: string) {
    this._name = name;
  }

  getName() {
    return this._name;
  }
}

class MarkerManagerClass {
  map: Map<string, Marker> = new Map();

  getMarker(name: string): Marker {
    if (this.map.has(name)) {
      return this.map.get(name);
    }
    const marker = new Marker(name);
    this.map.set(name, marker);
    return this.map.get(name);
  }
}

export const MarkerManager = new MarkerManagerClass;