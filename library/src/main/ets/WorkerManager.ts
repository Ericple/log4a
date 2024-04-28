import worker from '@ohos.worker'

class WorkerManagerClass {
  private fileAppendWorkerMap: Map<string, worker.ThreadWorker> = new Map();

  getFileAppendWorker(script: string = './workers/fileAppendWorker.ts'): worker.ThreadWorker {
    if (this.fileAppendWorkerMap.has(script)) {
      return this.fileAppendWorkerMap.get(script);
    }
    this.fileAppendWorkerMap.set(script, new worker.ThreadWorker(script));
    return this.fileAppendWorkerMap.get(script);
  }
}

export const WorkerManager = new WorkerManagerClass();