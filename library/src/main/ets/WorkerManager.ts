import worker, { MessageEvents } from '@ohos.worker'

class WorkerManagerClass {
  private fileAppendWorkerMap: Map<string, worker.ThreadWorker> = new Map();
  private listeners: ((e: MessageEvents) => void)[] = [];

  getFileAppendWorker(script: string = './workers/fileAppendWorker.ts'): worker.ThreadWorker {
    if (this.fileAppendWorkerMap.has(script)) {
      return this.fileAppendWorkerMap.get(script);
    }
    const w = new worker.ThreadWorker(script);
    w.onmessage = (e) => {
      this.listeners.forEach(listener => {
        listener(e);
      });
    }
    this.fileAppendWorkerMap.set(script, w);
    return this.fileAppendWorkerMap.get(script);
  }

  registerMessageListener(listener: (e: MessageEvents) => void) {
    if (this.listeners.indexOf(listener) < 0) {
      this.listeners.push(listener);
    }
  }

  terminate() {
    this.listeners = [];
    this.getFileAppendWorker().terminate();
  }
}

export const WorkerManager = new WorkerManagerClass();