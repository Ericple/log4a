import { HashCode } from './spi/HashCode';
import { requireNonNull } from './spi/requireNonNull';
import { StandardLevel } from './spi/StandardLevel';

export class Level {
  private static readonly LEVELS: Map<string, Level> = new Map();
  /**
   * No events will be logged.
   */
  static readonly OFF: Level = new Level("OFF", StandardLevel.OFF.intLevel());
  /**
   * A fatal event that will prevent the application from continuing.
   */
  static readonly FATAL: Level = new Level("FATAL", StandardLevel.FATAL.intLevel());
  /**
   * An error in the application, possibly recoverable.
   */
  static readonly ERROR: Level = new Level("ERROR", StandardLevel.ERROR.intLevel());
  /**
   * An event that might possible lead to an error.
   */
  static readonly WARN: Level = new Level("WARN", StandardLevel.WARN.intLevel());
  /**
   * An event for informational purposes.
   */
  static readonly INFO: Level = new Level("INFO", StandardLevel.INFO.intLevel());
  /**
   * A general debugging event.
   */
  static readonly DEBUG: Level = new Level("DEBUG", StandardLevel.DEBUG.intLevel());
  /**
   * A fine-grained debug message, typically capturing the flow through the application.
   */
  static readonly TRACE: Level = new Level("TRACE", StandardLevel.TRACE.intLevel());
  /**
   * All events should be logged.
   */
  static readonly ALL: Level = new Level("ALL", StandardLevel.ALL.intLevel());
  private _name: string;
  _intLevel: number;
  private _standardLevel: StandardLevel;

  private constructor(name: string, intLevel: number) {
    if (name.length == 0) {
      throw new Error("Illegal null or empty Level name.");
    }
    if (intLevel < 0) {
      throw new Error("Illegal Level int less than zero.");
    }
    this._name = name;
    this._intLevel = intLevel;
    this._standardLevel = StandardLevel.getStandardLevel(intLevel);
    if (!Level.LEVELS.has(name.trim().toUpperCase())) {
      Level.LEVELS.set(name.trim().toUpperCase(), this);
    }
  }

  /**
   * Retrieves an existing Level or creates on if it didn't previously exist.
   *
   * @param name The name of the level.
   * @param intValue The integer value for the Level. If the level was previously created this value is ignored.
   * @return The Level.
   * @throws Error if the name is null or intValue is less than zero.
   */
  static forName(name: string, intValue: number): Level {
    if (name.length == 0) {
      throw new Error("Illegal null or empty Level name.");
    }
    const normalizedName = name.trim().toUpperCase();
    const level: Level | undefined = Level.LEVELS.get(normalizedName);
    if (level) {
      return level;
    }
    try {
      return new Level(normalizedName, intValue);
    } catch {
      return Level.LEVELS.get(normalizedName)!;
    }
  }

  /**
   * Return the Level associated with the name or create one if the Level cannot be found.
   *
   * @param name The name of the Level.
   * @return The Level.
   */
  static getLevel(name: string, intLevel: number = Level.INFO.intLevel()): Level | undefined {
    if (this.LEVELS.has(name)) {
      return this.LEVELS.get(name);
    }
    return new Level(name, intLevel);
  }

  static toLevel(level: string): Level;

  static toLevel(name: string, defaultLevel: Level = Level.DEBUG): Level {
    const level: Level | undefined = Level.LEVELS.get(name.trim().toUpperCase());
    return level == undefined ? defaultLevel : level;
  }

  /**
   * Return an array of all the Levels that have been registered.
   *
   * @return An array of Levels.
   */
  static values(): Level[] {
    const tmp: Level[] = [];
    for (let lvl of Level.LEVELS.values()) {
      tmp.push(lvl);
    }
    return tmp;
  }

  static valueOf(name: string): Level {
    requireNonNull(name, "No level name given");
    const levelName: string = name.trim().toUpperCase();
    const level: Level | undefined = Level.LEVELS.get(levelName);
    if (level) {
      return level;
    }
    throw new Error("Unknown level constant [" + levelName + "].");
  }

  name(): string {
    return this._name;
  }

  toString(): string {
    return this._name;
  }

  /**
   * Gets the integral value of this Level.
   *
   * @return the value of this Level.
   */
  intLevel(): number {
    return this._intLevel;
  }

  equals(other: Level): boolean {
    return (other._name == this._name) && (other._intLevel == this._intLevel);
  }

  equalsStrict(other: Level): boolean {
    return other === this;
  }

  /**
   * Compares this level against the level passed as an argument and returns true if this level is the same or is less
   * specific.
   * Concretely, #ALL is less specific than #TRACE, which is less specific than #DEBUG, which
   * is less specific than #INFO, which is less specific than #WARN, which is less specific than
   * #ERROR, which is less specific than #FATAL, and finally #OFF, which is the most specific
   * standard level.
   *
   * @param level
   *            The level to test.
   * @return True if this level Level is less specific or the same as the given Level.
   */
  isLessSpecificThan(level: Level): boolean {
    return this._intLevel >= level._intLevel;
  }

  /**
   * Compares this level against the level passed as an argument and returns true if this level is the same or is more
   * specific.
   * Concretely, #FATAL is more specific than #ERROR, which is more specific than #WARN,
   * etc., until #TRACE, and finally #ALL, which is the least specific standard level.
   * The most specific level is #OFF.
   *
   * @param level The level to test.
   * @return True if this level Level is more specific or the same as the given Level.
   */
  isMoreSpecificThan(level: Level): boolean {
    return this._intLevel <= level._intLevel;
  }

  hashCode() {
    HashCode.fromString(this._name);
  }

  /**
   * Gets the standard Level values as an enum.
   *
   * @return an enum of the standard Levels.
   */
  getStandardLevel() {
    return this._standardLevel;
  }

  /**
   * Compares this level against the levels passed as arguments and returns true if this level is in between the given
   * levels.
   *
   * @param minLevel The minimum level to test.
   * @param maxLevel The maximum level to test.
   * @return True true if this level is in between the given levels
   * @since 2.4
   */
  isInRange(minLevel: Level, maxLevel: Level): boolean {
    return this._intLevel >= minLevel._intLevel && this._intLevel <= maxLevel._intLevel;
  }
}
