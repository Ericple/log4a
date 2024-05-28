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
import worker, { ErrorEvent, MessageEvents, ThreadWorkerGlobalScope } from '@ohos.worker';
import { FileAppender, FileAppenderOptions } from '../appender/FileAppender';
import { Level } from '../Level';

const workerPort: ThreadWorkerGlobalScope = worker.workerPort;
const appenderArray: Map<string, FileAppender> = new Map();
/**
 * Defines the event handler to be called when the worker thread receives a message sent by the host thread.
 * The event handler is executed in the worker thread.
 *
 * @param e message data
 */
workerPort.onmessage = (e: MessageEvents) => {
  const path: string = e.data.path;
  let appender: FileAppender;
  if (appenderArray.has(path)) {
    appender = appenderArray.get(path)!;
  } else {
    const name: string = e.data.name;
    const level: Level = e.data.level ?? Level.ALL;
    let options: FileAppenderOptions = e.data.options;
    options.useWorker = false;
    appender = new FileAppender(path, name, level, options);
    appenderArray.set(path, appender);
  }
  if (e.data.message) {
    appender.onLog(e.data.level, e.data.tag, e.data.time, e.data.count, e.data.message, e.data.tempContext);
  }
}

/**
 * Defines the event handler to be called when the worker receives a message that cannot be deserialized.
 * The event handler is executed in the worker thread.
 *
 * @param e message data
 */
workerPort.onmessageerror = (e: MessageEvents) => {
}

/**
 * Defines the event handler to be called when an exception occurs during worker execution.
 * The event handler is executed in the worker thread.
 *
 * @param e error message
 */
workerPort.onerror = (e: ErrorEvent) => {
}