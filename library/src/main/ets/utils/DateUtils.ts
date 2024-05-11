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
class DateUtilsClass {
  TIMESTAMP_ONE_DAY: number = 24 * 60 * 60 * 1000;
  TIMESTAMP_ONE_WEEK: number = this.TIMESTAMP_ONE_DAY * 7;
  private AvailableFormatStr = ['y', 'M', 'd', 'H', 'm', 's', 'd', 'S']

  getTotalDayCountOfMonth(date: Date): number {
    const month = date.getMonth() + 1;
    if (month == 2) {
      if (date.getFullYear() % 4 == 0) {
        return 29;
      } else {
        return 28;
      }
    }
    if (month < 8) {
      return month % 2 == 0 ? 30 : 31;
    } else {
      return month % 2 == 0 ? 31 : 30;
    }
  }

  /**
   * 获取最近的月份数据
   * @param count - 需要获取的月份数量
   * @returns - 返回一个二维数组，每个子数组包含指定数量的日期对象或null
   */
  getRecentMonth(count: number = 1): (Date | null)[][] {
    // 创建一个空的二维数组
    const tmp: (Date | null)[][] = [];

    let date = new Date();
    // 循环获取指定数量的月份数据
    for (let i = count; i > 0; i--) {
      // 获取当前月份的日期数组
      tmp.push(DateUtils.getMonthArray(date));
      date = new Date(date.getTime() + DateUtils.getTotalDayCountOfMonth(date) * 24 * 60 * 60 * 1000);
    }

    // 返回包含指定数量月份数据的二维数组
    return tmp;
  }

  getDateFromMonthArray(arr: (Date | null)[]) {
    let i = 0;
    while (arr[i] == null) {
      i++;
    }
    if (i == arr.length - 1) {
      return new Date();
    }
    return arr[i];
  }

  setDateToStartOfMonth(date: Date) {
    date.setDate(1);
    this.setToStartOfDay(date);
  }

  getNextMonthOf(date: Date) {
    const days = DateUtils.getTotalDayCountOfMonth(date);
    const last = new Date(date.getTime() + days * this.TIMESTAMP_ONE_DAY);
    last.setDate(1);
    this.setToStartOfDay(last);
    return last;
  }

  getLastMonthOf(date: Date) {
    const days = DateUtils.getTotalDayCountOfMonth(date) - 1;
    const last = new Date(date.getTime() - days * this.TIMESTAMP_ONE_DAY);
    last.setDate(1);
    this.setToStartOfDay(last);
    return last;
  }

  getLastMonthArrayOf(date: Date, count: number) {
    const last = this.getLastMonthOf(date);
    let arr: Date[] = [last];
    while (count--) {
      arr = [this.getLastMonthOf(arr[0])].concat(arr);
    }
    return arr;
  }

  /**
   * 获取指定月份的日期数组
   * @param date - 可选参数，指定的日期对象，默认为当前日期
   * @returns - 返回一个包含日期对象或null的数组
   */
  getMonthArray(date: Date = new Date()): (Date | null)[] {
    // 创建一个空的日期数组
    let tmp: (Date | null)[] = [];

    // 设置日期为指定月份的第一天
    date.setDate(1);
    date.setMinutes(0);
    date.setSeconds(0);

    // 获取当前月份的第一天是星期几
    let week = date.getDay();

    // 在数组前面添加相应数量的null
    for (let i = week - 1; i > 0; i--) {
      tmp.push(null);
    }
    let restrictMonth = date.getMonth();
    // 循环获取指定月份的日期对象
    while (date.getMonth() == restrictMonth) {
      tmp.push(date);
      date = new Date(date.getTime() + 24 * 60 * 60 * 1000)
    }

    // 返回包含日期对象或null的数组
    return tmp;
  }

  monthPlaceHolder: string[] = [
    'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August'
  ];

  toString(date: Date, format: string, utc: boolean = false, weekPlaceHolder: string[] = ['Sun', 'Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat']): string {
    let tmp: string[] = [];
    let explodedFormat = format.split('');
    let i = 0;
    for (i; i < explodedFormat.length; i++) {
      let str = explodedFormat[i];
      if (DateUtils.AvailableFormatStr.includes(str)) {
        let count = DateUtils.GetSameWordCount(explodedFormat, i);
        if (str == 'y') {
          let placeHolder = utc ? date.getUTCFullYear() : date.getFullYear();
          tmp.push(placeHolder.toString().padStart(count, '0'));
        } else if (str == 'M') {
          let placeHolder = (utc ? date.getUTCMonth() : date.getMonth()) + 1;
          if (count > 2) {
            tmp.push(this.monthPlaceHolder[placeHolder].substring(0, count))
          } else {
            tmp.push(placeHolder.toString().padStart(count, '0'));
          }
        } else if (str == 'd') {
          let placeHolder = utc ? date.getUTCDate() : date.getDate();
          tmp.push(placeHolder.toString().padStart(count, '0'));
        } else if (str == 'H') {
          let placeHolder = utc ? date.getUTCHours() : date.getHours();
          tmp.push(placeHolder.toString().padStart(count, '0'));
        } else if (str == 'm') {
          let placeHolder = utc ? date.getUTCMinutes() : date.getMinutes();
          tmp.push(placeHolder.toString().padStart(count, '0'));
        } else if (str == 's') {
          let placeHolder = utc ? date.getUTCSeconds() : date.getSeconds();
          tmp.push(placeHolder.toString().padStart(count, '0'));
        } else if (str == 'S') {
          let placeHolder = utc ? date.getUTCMilliseconds() : date.getMilliseconds();
          tmp.push(placeHolder.toString().padStart(count, '0'));
        } else if (str == 'W') {
          let placeHolder = utc ? date.getUTCDay() : date.getDay();
          tmp.push(weekPlaceHolder[placeHolder]);
        }
        i += count - 1;
      }
      else {
        tmp.push(str);
      }
    }
    return tmp.join('');
  }

  /**
   * 返回指定日期开始后指定天数的时间戳数组
   * @param date
   * @param dayCount
   * @returns
   */
  getRecentDays(date: Date, dayCount: number) {
    const tmpArr: number[] = [];
    let tmp = this.cloneDateObject(date);
    while (dayCount > 0) {
      tmpArr.push(tmp.getTime());
      tmp.setTime(tmp.getTime() + this.TIMESTAMP_ONE_DAY);
      dayCount--;
    }
    return tmpArr;
  }

  getRecentMonths(date: Date, monthCount: number) {
    const tmpArr: number[] = [];
    let tmp = this.cloneDateObject(date);
    while (monthCount > 0) {
      tmpArr.push(tmp.getTime());
      tmp.setTime(tmp.getTime() + this.getTotalDayCountOfMonth(tmp) * this.TIMESTAMP_ONE_DAY);
      monthCount--;
    }
    return tmpArr;
  }

  cloneDateObject(src: Date): Date {
    return new Date(src.getTime());
  }

  getMondayOfWeek(date: Date) {
    // 获取今天是周几
    const weekDay = (date.getDay() || 7) - 1;
    const tmpDate = this.cloneDateObject(date);
    tmpDate.setTime(date.getTime() - this.TIMESTAMP_ONE_DAY * weekDay);
    return tmpDate;
  }

  getNextDay(date: Date) {
    const tmp = this.cloneDateObject(date);
    tmp.setTime(tmp.getTime() + this.TIMESTAMP_ONE_DAY);
    return tmp;
  }

  setToStartOfDay(date: Date) {
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
  }

  setToStartOfYear(date: Date) {
    date.setMonth(0, 1);
    this.setToStartOfDay(date);
  }

  private GetSameWordCount(array: string[], index: number) {
    let count = 0;
    let iterator = index;
    let originValue = array[index];
    while (iterator < array.length) {
      if (array[iterator] == originValue) {
        count++;
      }
      iterator++;
    }
    return count;
  }
}

export const DateUtils = new DateUtilsClass();
