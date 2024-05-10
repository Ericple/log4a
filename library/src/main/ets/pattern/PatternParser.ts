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
import { FormattingInfo } from '../layout/FormattingInfo';
import { ParserState } from './ParserState';

class PatternParserClass {
  private convertStartKeyword: string = '%';
  private patternKeywords: string[] = [
    'p', '-', '.'
  ]

  parse(pattern: string) {
    let parserState: ParserState = ParserState.LITERAL_STATE;
    let result = '';
    let formattingInfo: FormattingInfo = new FormattingInfo();
    let currentPattern: string = 'minLength';
    let editTarget = ''
    let i = 0;
    while (i < pattern.length) {
      if (pattern[i] == this.convertStartKeyword) {
        if (parserState == ParserState.CONVERTER_STATE) {
          result += this.buildFromInfo(formattingInfo);
        } else {
          parserState = ParserState.CONVERTER_STATE;
        }
      } else {
        if (parserState == ParserState.CONVERTER_STATE) {
          if (!this.patternKeywords.includes(pattern[i])) {
            parserState = ParserState.LITERAL_STATE;
          } else {
            // if(pattern[i])
          }
        }
      }
      i++;
    }
    return result;
  }

  buildFromInfo(formattingInfo: FormattingInfo): string {
    return formattingInfo.data;
  }

  getLineCount(): string {
    const stackInfo = new Error().stack;
    if (!stackInfo) return 'null';
    const a = stackInfo.split(':');
    return a[1] ?? 'null';
  }
}

export const PatternParser = new PatternParserClass();