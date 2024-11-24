import type FileSystem from './FileSystem';

import path from 'path';
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
   * Returns the absolute path to the file
   */
  public absolute(source: string, pwd = this._cwd, exists = false) {
    let pathname = source;
    //ex. @/path/to/file.ext
    if (pathname.startsWith('@/')) {
      pathname = path.resolve(this._cwd, pathname.substring(2));
    //if the pathname starts with ./ or ../
    } else if (/^\.{1,2}(\/|\\)/.test(pathname)) {
      //get the absolute path
      pathname = path.resolve(pwd, pathname);
    }
    //if the pathname does not start with /, 
    //the path should start with modules
    if (!pathname.startsWith('/') && !pathname.startsWith('\\')) {
      //NOTE: This resolves to a file in the node_modules directory
      //where as absolute() should resolve to a file or directory
      //require.resolve(pathname, { paths: [ modules ] });
      pathname = path.resolve(this.modules(this._cwd), pathname);
    }
    if (exists && !this._fs.existsSync(pathname)) {
      throw Exception.for(`Cannot find '${source}'`);
    }
    return pathname;
  }

  /**
   * Should locate the node_modules directory 
   * where ink is actually installed
   */
  public modules(cwd = this._cwd): string {
    if (cwd === '/') {
      throw Exception.for('Cannot find node_modules');
    }
    if (this._fs.existsSync(path.resolve(cwd, 'node_modules', '@stackpress', 'types'))) {
      return path.resolve(cwd, 'node_modules');
    }
    return this.modules(path.dirname(cwd));
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
   * require() should be monitored separately from the code
   */
  public require(source: string) {
    //if JSON, safely require it
    if (path.extname(source) === '.json') {
      const contents = this._fs.readFileSync(source, 'utf8');
      try {
        return JSON.parse(contents) || {};
      } catch(e) {}
      return {};
    }
    
    return require(source);
  }

  /**
   * Resolves the path name to a path that can be required
   */
  public resolve(
    pathname: string, 
    pwd = this._cwd, 
    extnames = [ '.js', '.json' ], 
    exists = false
  ) {
    try { //to resolve using require.resolve first...
      return require.resolve(pathname);
    } catch(e) {}
    
    const absolute = this.absolute(pathname, pwd);

    //ex. /plugin/foo
    //it's already absolute...
    //Check if pathname is literally a file
    if (this._fileExists(absolute)) {
      return absolute;
    }

    for (const extname of extnames) {
      let file = absolute + extname;
      if (this._fileExists(file)) {
        return file;
      }
      file = path.resolve(absolute, 'index' + extname);
      if (this._fileExists(file)) {
        return file;
      }
    }

    if (exists) {
      throw Exception.for(`Cannot resolve '${pathname}'`);
    }

    return null;
  }

  /**
   * Returns the absolute path to the file given the source route
   * NOTE: source should be the source file (not source directory)
   */
  public route(source: string, destination: string) {
    const dirname = path.dirname(source);
    return path.resolve(dirname, destination);
  }

  /**
   * Returns true if the file exists
   */
  private _fileExists(source: string) {
    if (!this._fs.existsSync(source)) {
      return false;
    }
    const stats = this._fs.lstatSync(source);
    return stats && stats.isFile();
  }
}