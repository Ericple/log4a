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
import { FormattingContext } from '../layout/FormattingContext';
import { FormattingInfo } from '../layout/FormattingInfo';
import { Level } from '../Level';
import { DateUtils } from '../utils/DateUtils';

class PatternParserClass {
  private reg = new RegExp(`(%[-+]?\\d*[.]?\\d*[CdlLmprt%]{1}(?:{.*})?)`, 'g');
  private dateReg = new RegExp(`%[-+]?\\d*[.]?\\d*[d]{1}({.*}){0,1}`);
  private classReg = new RegExp(`%[-+]?\\d*[.]?\\d*[C]{1}({.*}){0,1}`);
  private locationReg = new RegExp(`%[-+]?\\d*[.]?\\d*[l]{1}({.*}){0,1}`);
  private messageReg = new RegExp(`%[-+]?\\d*[.]?\\d*[m]{1}({.*}){0,1}`);
  private priorityReg = new RegExp(`%[-+]?\\d*[.]?\\d*[p]{1}({.*}){0,1}`);
  private lineNumReg = new RegExp(`%[-+]?\\d*[.]?\\d*[L]{1}({.*}){0,1}`);
  private countReg = new RegExp(`%[-+]?\\d*[.]?\\d*[r]{1}({.*}){0,1}`);

  parse(pattern: string, context: FormattingContext) {
    let result = '';
    const comp = pattern.split(this.reg);
    for (let v of comp) {
      if (!v) continue;
      if (v.startsWith('%')) {
        result += this.handlePatternUnit(v, context);
      } else {
        result += v;
      }
    }
    if (context.logLevel._intLevel < Level.INFO._intLevel && !pattern.match(this.locationReg)) {
      result += this.getStackInfo(context.stackInfo);
    }
    return result;
  }

  handlePatternUnit(pattern: string, context: FormattingContext): string {
    if (pattern == '%%') {
      return '%';
    } else if (this.dateReg.test(pattern)) {
      return this.getDate(pattern, context.timestamp);
    } else if (this.classReg.test(pattern)) {
      return this.getClassName(pattern, context.className);
    } else if (this.locationReg.test(pattern)) {
      return this.getStackInfo(context.stackInfo);
    } else if (this.messageReg.test(pattern)) {
      return context.logMessage;
    } else if (this.priorityReg.test(pattern)) {
      return this.getPriority(pattern, context.logLevel.name)
    } else if (this.lineNumReg.test(pattern)) {
      return this.getLineCount(pattern, context.stackInfo);
    } else if (this.countReg.test(pattern)) {
      return this.getCount(pattern, context.logCount);
    }
    return pattern;
  }

  getStackInfo(stackInfo: string) {
    let stackArr = stackInfo.split('\n');
    return '\n' + stackArr.slice(5).join('\n')
  }

  getCount(pattern: string, count: number) {
    const fi = this.getFormatInfo(pattern, 'p');
    let val = count.toString();
    return this.padStr(val, fi);
  }

  getFormatInfo(pattern: string, key: string): FormattingInfo {
    let result = new FormattingInfo();
    let dp = pattern.split('%');
    if (dp.length < 2) return result;
    let padInfo = dp[1].split(key)[0];
    let tn = new Number(padInfo).valueOf();
    if (!Number.isNaN(tn)) {
      if (tn < 0) {
        result.justifyLeft = true;
      }
      result.minLength = Math.abs(Math.floor(tn));
    }
    let decimal = padInfo.split('.');
    if (decimal.length > 1) {
      result.maxLength = Math.floor(new Number(decimal[1]).valueOf());
    }
    if (pattern.lastIndexOf('{') == -1) return result;
    let t = pattern.split('{');
    if (t.length > 1) {
      result.extraFormat = t[1].split('}')[0];
    }
    return result;
  }

  getPriority(pattern: string, val: string) {
    const fi = this.getFormatInfo(pattern, 'p');
    return this.padStr(val, fi);
  }

  getClassName(pattern: string, val: string) {
    const fi = this.getFormatInfo(pattern, 'C');
    return this.padStr(val, fi);
  }

  getDate(pattern: string, timestamp: number) {
    const fi = this.getFormatInfo(pattern, 'd');
    const d = new Date(timestamp);
    let val = '';
    if (fi.extraFormat == 'ISO8601') {
      val = DateUtils.toString(d, 'yyyy-MM-dd HH:mm:ss,SSS');
    } else if (fi.extraFormat == 'ABSOLUTE') {
      val = DateUtils.toString(d, 'HH:mm:ss,SSS');
    } else if (fi.extraFormat == 'DATE') {
      val = DateUtils.toString(d, 'dd MMM yyyy HH:mm:ss,SSS');
    } else if (fi.extraFormat == '') {
      val = DateUtils.toString(d, 'yyyy-MM-dd HH:mm:ss,SSS');
    } else {
      val = DateUtils.toString(d, fi.extraFormat);
    }
    return this.padStr(val, fi);
  }

  getLineCount(pattern: string, stackInfo: string): string {
    if (!stackInfo) return 'null';
    const a = stackInfo.split(':');
    let val = a.length >= 2 ? a[a.length - 2] : 'null';
    const fi = this.getFormatInfo(pattern, 'L');
    return this.padStr(val, fi);
  }

  padStr(val: string, fi: FormattingInfo) {
    if (val.length > fi.maxLength) {
      val = val.substring(0, fi.maxLength);
    }
    if (val.length < fi.minLength) {
      if (fi.justifyLeft) {
        while (val.length < fi.minLength) {
          val += ' ';
        }
      } else {
        while (val.length < fi.minLength) {
          val = ' ' + val;
        }
      }
    }
    return val;
  }
}

export const PatternParser = new PatternParserClass();