//modules
import * as fs from 'node:fs';
//common
import type { FileSystem, FileRecursiveOption } from '../types';

export default class NodeFS implements FileSystem {
  protected _fs: typeof fs;
  public get fs() {
    return this._fs;
  }
  constructor(filesystem?: typeof fs) {
    this._fs = filesystem || fs;
  }
  async exists(path: string) {
    return await this._fs.promises.access(path)
      .then(() => true)
      .catch(() => false);
  }
  readFile(path: string, encoding: BufferEncoding) {
    return this._fs.promises.readFile(path, encoding);
  }
  realpath(path: string) {
    return this._fs.promises.realpath(path);
  }
  stat(path: string) {
    return this._fs.promises.lstat(path);
  }
  writeFile(path: string, data: string) {
    return this._fs.promises.writeFile(path, data);
  }
  async mkdir(path: string, options?: FileRecursiveOption) {
    await this._fs.promises.mkdir(path, options);
  }
  createReadStream(path: string) {
    return this._fs.createReadStream(path);
  }
  unlink(path: string) {
    return this._fs.promises.unlink(path);
  }
}