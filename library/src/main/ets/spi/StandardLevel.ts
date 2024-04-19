enum StandardLevelEnum {
  OFF = 8,
  FATAL = 100,
  ERROR = 200,
  WARN = 300,
  INFO = 400,
  DEBUG = 500,
  TRACE = 600,
  ALL = 1.7976931348623157e+308
}

export class StandardLevel {
  static OFF = new StandardLevel(StandardLevelEnum.OFF);
  static FATAL = new StandardLevel(StandardLevelEnum.FATAL);
  static ERROR = new StandardLevel(StandardLevelEnum.ERROR);
  static WARN = new StandardLevel(StandardLevelEnum.WARN);
  static INFO = new StandardLevel(StandardLevelEnum.INFO);
  static DEBUG = new StandardLevel(StandardLevelEnum.DEBUG);
  static TRACE = new StandardLevel(StandardLevelEnum.TRACE);
  static ALL = new StandardLevel(StandardLevelEnum.ALL);
  private static LEVEL_SET = [
    StandardLevel.OFF,
    StandardLevel.FATAL,
    StandardLevel.ERROR,
    StandardLevel.WARN,
    StandardLevel.INFO,
    StandardLevel.DEBUG,
    StandardLevel.TRACE,
    StandardLevel.ALL
  ];
  private _intLevel: number;

  constructor(val: number) {
    this._intLevel = Math.floor(val);
  }

  static getStandardLevel(intLevel: number): StandardLevel {
    let level: StandardLevel = StandardLevel.OFF;
    for (let lvl of StandardLevel.LEVEL_SET) {
      if (lvl.intLevel() > intLevel) {
        break;
      }
      level = lvl;
    }
    return level;
  }

  intLevel() {
    return this._intLevel;
  }
}