import { Marker } from './MarkerManager'

export class TemporaryLoggerContext {
  private marker: Marker;

  setMarker(marker: Marker): this {
    this.marker = marker;
    return this;
  }

  hasMarker(): boolean {
    return this.marker != undefined;
  }

  getMarker(): string {
    return '(' + this.marker.getName() + ')';
  }

  clear() {
    this.marker = undefined;
  }
}