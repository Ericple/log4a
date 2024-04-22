import fs from '@ohos.file.fs';

class FileManagerClass {
  private _fileMap: Map<string, fs.File> = new Map();

  getFile(path: string): fs.File {
    if (this._fileMap.has(path)) {
      return this._fileMap.get(path);
    }
    const f = fs.openSync(path, fs.OpenMode.READ_WRITE | fs.OpenMode.CREATE);
    this._fileMap.set(path, f);
    return this._fileMap.get(path);
  }

  close(path: string): void {
    if (this._fileMap.has(path)) {
      const f = this._fileMap.get(path);
      fs.closeSync(f);
      this._fileMap.delete(path);
    }
  }
}

export const FileManager = new FileManagerClass;