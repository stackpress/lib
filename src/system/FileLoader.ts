//modules
import * as path from 'node:path';
//common
import type { FileSystem } from '../types';
import Exception from '../Exception';

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
    //ex. @/path/to/file.ext
    if (pathname.startsWith('@/')) {
      return path.resolve(this._cwd, pathname.substring(2));
    //if the source starts with ./ or ../
    } else if (/^\.{1,2}(\/|\\)/.test(pathname)) {
      //get the absolute path
      return path.resolve(pwd, pathname);
    }
    //if the source is not already absolute,
    //the path should start with modules
    if (!path.isAbsolute(pathname)) {
      try { //to resolve the path from node_modules
        return await this.modules(pathname, pwd);
      } catch(e) {
        //set pathname relative to the lib
        const lib = await this.lib(this._cwd);
        const libname = path.resolve(lib, pathname);
        if (await this._fs.exists(libname)) {
          return libname;
        }
      }
    }
    //force pwd + source
    return path
      .resolve(pwd, pathname)
      .replaceAll(path.sep + path.sep, path.sep);
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
  public async modules(source: string, pwd = this._cwd): Promise<string> {
    const module = path.resolve(pwd, 'node_modules', source);
    if (await this._fs.exists(module)) {
      return path.resolve(pwd, 'node_modules');
    }
    const parent = path.dirname(pwd);
    //stops at root dir (C:\ or /)
    if (parent === pwd) { 
      throw Exception.for('Cannot find %s in any node_modules', source);
    }
    return await this.modules(source, parent);
  }

  /**
   * import() json/js/mjs/cjs file
   */
  public async import<T = any>(
    source: string, 
    getDefault = false
  ): Promise<T> {
    const absolute = await this.absolute(source);
    //if JSON, safely require it
    if (path.extname(absolute) === '.json') {
      const contents = await this._fs.readFile(absolute, 'utf8');
      try {
        return JSON.parse(contents) || {};
      } catch(e) {}
      return {} as T;
    }
    
    const imports = await import(absolute);
    if (getDefault) {
      return imports.default as T;
    }
    return imports as T;
  }

  /**
   * Returns the relative path from the source file to the required file
   * Note: This works better if using absolute paths from Loader.aboslute()
   */
  public relative(source: string, require: string, withExtname = false) {
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
    const relative = path.relative(path.dirname(source), require);
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
      let file = absolute + extname;
      if (await this._fileExists(file)) {
        return file;
      }
      file = path.resolve(absolute, 'index' + extname);
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