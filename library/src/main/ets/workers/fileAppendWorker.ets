import { ErrorEvent, MessageEvents, ThreadWorkerGlobalScope, worker } from '@kit.ArkTS';
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
    const options: FileAppenderOptions = e.data.options;
    appender = new FileAppender(path, name, level, options);
  }
  if (e.data.message) {
    console.log(e.data.level)
    appender.onLog(e.data.level, e.data.message);
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