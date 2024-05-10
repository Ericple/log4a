// Copyright 2024 Tingjin Guo
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { LogManager } from './LogManager';
import { MarkerManager } from './MarkerManager';

export const TraceEntry = (target: any, methodName: string, propertyDescriptor: PropertyDescriptor) => {
  const method = propertyDescriptor.value;
  const logger = LogManager.getLogger(target);
  if (method === undefined) {
    logger.error("Cannot access to method: [{}], log failed.", methodName);
  } else {
    propertyDescriptor.value = function (...args: any[]) {
      if (args.length == 0) {
        logger.trace("Method: [{}] called with no arguments", methodName);
      } else {
        logger.trace("Method: [{}] called with arguments {}", methodName, args);
      }
      try {
        return method.apply(this, args);
      } catch (e) {
        logger.error("Method execute failed with error: {}", e);
        throw e;
      }
    }
  }
}

export const TraceExit = (target: any, methodName: string, propertyDescriptor: PropertyDescriptor) => {
  const method = propertyDescriptor.value;
  const logger = LogManager.getLogger(target);
  if (method === undefined) {
    logger.error("Cannot access to method [{}], log failed.", methodName);
  } else {
    propertyDescriptor.value = function (...args: any[]) {
      try {
        const result = method.apply(this, args);
        logger.trace("Method [{}] exited with result: {}", methodName, result);
        return result;
      } catch (e) {
        logger.error("Method [{}] exited with error: {}", methodName, e);
        throw e;
      }
    }
  }
}

export const TraceTime = (target: any, methodName: string, propertyDescriptor: PropertyDescriptor) => {
  const logger = LogManager.getLogger(target);
  const method = propertyDescriptor.value;
  if (method === undefined) {
    logger.error("Cannot access to method [{}], timer terminated.", methodName);
    return;
  }
  propertyDescriptor.value = function (...args: any[]) {
    try {
      console.time('log4a timer for ' + methodName);
      const result = method.apply(this, args);
      console.timeEnd('log4a timer for ' + methodName);
      return result;
    } catch (e) {
      logger.error("Method [{}] exited with error: {}, timer terminated.", methodName, e);
      throw e;
    }
  }
}

export const TracedStr = (strings: TemplateStringsArray, ...args: any[]) => {
  const logger = LogManager.anonymous();
  logger.withMarker(MarkerManager.getMarker("Anonymous")).info("built with format: {} and args: {}", strings, args);
  return strings[0] + args.map((e, i) => `${e}${strings[i+1]}`).join('');
}

export const MarkedTracedStr = (marker: string = "Anonymous") => {
  const logger = LogManager.anonymous();
  return (strings: TemplateStringsArray, ...args: any[]) => {
    logger.withMarker(MarkerManager.getMarker(marker)).info("built with format: {} and args: {}", strings, args);
    return strings[0] + args.map((e, i) => `${e}${strings[i+1]}`).join('');
  }
}