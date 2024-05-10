import { Level } from '../Level';

export interface AbstractLayout {
  makeMessage(level: Level, tag: string, time: string, count: number, format: string, args: Object[]): string;
}