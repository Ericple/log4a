import { ErrorEvent, MessageEvents, ThreadWorkerGlobalScope, worker } from '@kit.ArkTS';
import fs from '@ohos.file.fs';

const workerPort: ThreadWorkerGlobalScope = worker.workerPort;
/**
 * Defines the event handler to be called when the worker thread receives a message sent by the host thread.
 * The event handler is executed in the worker thread.
 *
 * @param e message data
 */
workerPort.onmessage = (e: MessageEvents) => {
  fs.write(e.data.fd, e.data.message);
  if (fs.accessSync(e.data.path)) {
    const size = fs.statSync(e.data.path).size
    if (e.data.maxSize != undefined && e.data.maxCache != undefined) {
      if (size > e.data.maxSize * 1000) {
        workerPort.postMessage({
          type: 'overflow',
          path: e.data.path,
          limitCount: e.data.maxCache,
          msgLen: e.data.message.length
        });
      }
    }
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