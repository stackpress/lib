//modules
import fs from 'node:fs';
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
  existsSync(path: string) {
    return this._fs.existsSync(path);
  }
  readFileSync(path: string, encoding: BufferEncoding) {
    return this._fs.readFileSync(path, encoding);
  }
  realpathSync(path: string) {
    return this._fs.realpathSync(path);
  }
  lstatSync(path: string) {
    return this._fs.lstatSync(path);
  }
  writeFileSync(path: string, data: string) {
    this._fs.writeFileSync(path, data);
  }
  mkdirSync(path: string, options?: FileRecursiveOption) {
    this._fs.mkdirSync(path, options);
  }
  createReadStream(path: string) {
    return this._fs.createReadStream(path);
  }
  unlinkSync(path: string): void {
    this._fs.unlinkSync(path);
  }
}