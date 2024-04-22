import { Level } from '../Level';
import { AppenderTypeEnum } from '../spi/AppenderTypeEnum';
import { NotImplementedError } from '../spi/NotImplementError';

export abstract class AbstractAppender {
  protected _type: AppenderTypeEnum;
  protected _id: number;
  protected _terminated: boolean = false;
  protected _history: string = '';
  protected _name: string = '';
  protected level: Level;

  constructor(name: string, level: Level, type: AppenderTypeEnum) {
    this._type = type;
    this._name = name;
    this.level = level;
  }

  getName(): string {
    return this._name;
  }

  getCurrentHistory(): string {
    return this._history;
  }

  log(_: Level, __: string): this {
    throw new NotImplementedError();
  }

  getType(): AppenderTypeEnum {
    return this._type;
  }

  getId(): number {
    return this._id;
  }

  setId(id: number): this {
    this._id = id;
    return this;
  }

  protected stop(): this {
    return this;
  }

  terminate(): void {
    return;
  }
}