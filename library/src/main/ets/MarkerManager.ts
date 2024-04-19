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