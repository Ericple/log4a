import { Level } from 'ets/Level';
import { AbstractLayout } from '../abstract/AbstractLayout';

export class PatternLayout implements AbstractLayout {
  private pattern: string = '[%-5p]\t%d{YYYY-MM-DD HH:mm:ss.SSS}\t[%c:%r]\t%m';

  constructor(pattern?: string) {
    if (pattern) {
      this.pattern = pattern;
    }
  }

  makeMessage(level: Level, tag: string, time: string, count: number, format: string, args: Object[]): string {
    throw new Error('Method not implemented.');
  }
}