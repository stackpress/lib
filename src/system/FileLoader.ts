//modules
import * as path from 'node:path';
//common
import type { FileSystem } from '../types.js';
import Exception from '../Exception.js';
import { pathToFileURL } from 'node:url';

/**
 * Loader
 */
export default class FileLoader {
  //the current working directory
  protected _cwd: string;
  //filesystem to use
  protected _fs: FileSystem;

  /**
   * Returns the current working directory
   */
  public get cwd() {
    return this._cwd;
  }

  /**
   * Gets the filesystem
   */
  public get fs() {
    return this._fs;
  }

  /**
   * Choose the filesystem to use
   */
  constructor(fs: FileSystem, cwd?: string) {
    this._cwd = cwd || process.cwd();
    this._fs = fs;
  }
  
  /**
   * Returns the absolute path to the pathname given
   * NOTE: This is not a resolver, it just returns the path
   */
  public async absolute(pathname: string, pwd = this._cwd) {
    //force pwd + source by default
    let absolute = path
      .resolve(pwd, pathname)
      .replaceAll(path.sep + path.sep, path.sep);
    //ex. @/path/to/file.ext
    if (pathname.startsWith('@/')) {
      absolute = path.resolve(this._cwd, pathname.substring(2));
    //if the source starts with ./ or ../
    } else if (/^\.{1,2}(\/|\\)/.test(pathname)) {
      //get the absolute path
      absolute = path.resolve(pwd, pathname);
    //if the source is not already absolute,
    //the path should start with modules
    } else if (!path.isAbsolute(pathname)) {
      try { //to resolve the path from node_modules
        const modules = await this.modules(pathname, pwd);
        absolute = path.resolve(modules, pathname);
      } catch(e) {
        //onwards...
      }
    }
    try { //to follow symlinks
      return await this._fs.realpath(absolute);
    } catch(e) {}
    return absolute;
  }

  /**
   * Removes the extname from the pathname
   */
  public basepath(pathname: string) {
    const extname = path.extname(pathname);
    if (extname.length) {
      return pathname.substring(0, pathname.length - extname.length);
    }
    return pathname;
  }

  /**
   * Should locate the node_modules directory 
   * where @stackpress/lib is actually installed
   */
  public async lib(pwd = this._cwd): Promise<string> {
    return this.modules(path.join('@stackpress', 'lib'), pwd);
  }

  /**
   * Should locate the node_modules directory where the source is installed
   */
  public async modules(
    pathname: string, 
    pwd = this._cwd, 
    meta = true
  ): Promise<string> {
    if (meta) {
      try {
        //@ts-ignore - require supported in all node versions
        const absolute = require.resolve(pathname);
        if (absolute.includes('/node_modules/')) {
          //get the last index of node_modules
          const end = absolute.lastIndexOf('/node_modules/') + 13;
          //ie. /real/path/to/node_modules
          return absolute.substring(0, end);
        }
      } catch(e) {
        //if resolution fails, try import.meta.resolve
      }
      //@ts-ignore - meta supported after node 20
      if (typeof globalThis.import !== 'undefined') {
        try {
          //@ts-ignore - meta supported after node 20
          //ie. file:///home/user/node_modules/foo/bar.js
          const url = globalThis.import.meta.resolve(pathname, `file://${pwd}/`);
          //ie. /home/user/node_modules/foo/bar.js
          const resolved = (new URL(url)).pathname;
          //resolve symlinks
          //ie. /real/path/to/node_modules/foo/bar.js
          const absolute = await this._fs.realpath(resolved);
          if (absolute.includes('/node_modules/')) {
            //get the last index of node_modules
            const end = absolute.lastIndexOf('/node_modules/') + 13;
            //ie. /real/path/to/node_modules
            return absolute.substring(0, end);
          }
        } catch(e) {
          //if resolution fails, fallback to manual traversal
        }
      }
    }
    //fallback: Manually look for node_modules
    const module = path.resolve(pwd, 'node_modules', pathname);
    if (await this._fs.exists(module)) {
      return path.resolve(pwd, 'node_modules');
    }
    //traverse up until we reach the root directory
    const parent = path.dirname(pwd);
    //stops at root dir (C:\ or /)
    if (parent === pwd) { 
      throw Exception.for('Cannot find %s in any node_modules', pathname);
    }
    return await this.modules(pathname, parent, false);
  }

  /**
   * import() json/js/mjs/cjs file
   */
  public async import<T = any>(
    pathname: string, 
    getDefault = false
  ): Promise<T> {
    const absolute = await this.absolute(pathname);
    //if JSON, safely require it
    if (path.extname(absolute) === '.json') {
      const contents = await this._fs.readFile(absolute, 'utf8');
      try {
        return JSON.parse(contents) || {};
      } catch(e) {}
      return {} as T;
    }
    const imports = await import(pathToFileURL(absolute).href);
    if (getDefault) {
      return imports.default as T;
    }
    return imports as T;
  }

  /**
   * Returns the relative path from the source file to the required file
   * Note: This works better if using absolute paths from Loader.aboslute()
   */
  public relative(pathname: string, require: string, withExtname = false) {
    //if dont include extname
    if (!withExtname) {
      //check for extname
      const extname = path.extname(require);
      //if there is an extname
      if (extname.length) {
        //remove the extname
        require = require.substring(0, require.length - extname.length);
      }
    }
    //get the relative path
    const relative = path.relative(path.dirname(pathname), require);
    //if the relative path is not relative, make it relative
    return relative.startsWith('.') ? relative: `./${relative}`;
  }

  /**
   * Resolves a pathname (file or directory)
   */
  public async resolve(
    pathname: string, 
    pwd = this._cwd, 
    exists = false
  ) {
    //get the absolute path
    const absolute = await this.absolute(pathname, pwd);
    //if absolute exists
    if (await this._fs.exists(absolute)) {
      return absolute;
    //if exists check
    } else if (exists) {
      //throw an exception
      throw Exception.for(`Cannot resolve '${pathname}'`);
    }
    return null;
  }

  /**
   * Resolves a pathname (file)
   */
  public async resolveFile(
    pathname: string, 
    extnames = [ '.js', '.json' ], 
    pwd = this._cwd, 
    exists = false
  ) {
    //get the absolute path
    const absolute = await this.absolute(pathname, pwd);
    //ex. /plugin/foo
    //it's already absolute...
    //Check if pathname is literally a file
    if (await this._fileExists(absolute)) {
      return absolute;
    }
    //we want to try resolving manually using the extnames
    //as prefrenced first...
    for (const extname of extnames) {
      let file = await this.absolute(pathname + extname, pwd);
      if (await this._fileExists(file)) {
        return file;
      }
      const index = path.join(pathname, 'index' + extname);
      file = await this.absolute(index, pwd);
      if (await this._fileExists(file)) {
        return file;
      }
    }

    if (exists) {
      throw Exception.for(`Cannot resolve '${pathname}'`);
    }

    return null;
  }

  /**
   * Returns true if the file exists
   */
  protected async _fileExists(pathname: string) {
    if (!(await this._fs.exists(pathname))) {
      return false;
    }
    const stats = await this._fs.stat(pathname);
    return stats && stats.isFile();
  }
}