//node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

//modules
import { expect } from 'chai';
import { afterEach, describe, it } from 'mocha';

//client
import NodeFS from '../src/system/NodeFS.js';

const tempDirectories: string[] = [];

async function makeTempDir() {
  const directory = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), 'stackpress-nodefs-')
  );
  tempDirectories.push(directory);
  return directory;
}

afterEach(async () => {
  await Promise.all(
    tempDirectories.splice(0).map(directory => {
      return fs.promises.rm(directory, { force: true, recursive: true });
    })
  );
});

describe('NodeFS Tests', () => {
  it('should use the provided filesystem boundary', () => {
    const filesystem = new NodeFS(fs);

    expect(filesystem.fs).to.equal(fs);
  });

  it('should write, read, stat and delete files', async () => {
    const filesystem = new NodeFS();
    const directory = await makeTempDir();
    const file = path.join(directory, 'sample.txt');

    //Create a file through the public boundary first.
    await filesystem.writeFile(file, 'hello world');

    //Confirm each public read path observes the same file.
    expect(await filesystem.exists(file)).to.equal(true);
    expect(await filesystem.readFile(file, 'utf8')).to.equal('hello world');
    expect(await filesystem.realpath(file)).to.equal(
      await fs.promises.realpath(file)
    );
    expect((await filesystem.stat(file)).isFile()).to.equal(true);

    //Delete the file through the wrapper and confirm the cleanup path.
    await filesystem.unlink(file);
    expect(await filesystem.exists(file)).to.equal(false);
  });

  it('should create directories and expose readable streams', async () => {
    const filesystem = new NodeFS();
    const root = await makeTempDir();
    const directory = path.join(root, 'nested', 'path');
    const file = path.join(directory, 'stream.txt');

    //Exercise mkdir on a recursive path instead of assuming the parent exists.
    await filesystem.mkdir(directory, { recursive: true });
    await filesystem.writeFile(file, 'streamed data');

    //Read the contents back through the stream boundary.
    const stream = filesystem.createReadStream(file);
    const chunks: string[] = [];

    stream.setEncoding('utf8');
    await new Promise<void>((resolve, reject) => {
      stream.on('data', chunk => {
        chunks.push(chunk);
      });
      stream.on('end', () => resolve());
      stream.on('error', error => reject(error));
    });

    expect(await filesystem.exists(directory)).to.equal(true);
    expect((await filesystem.stat(directory)).isDirectory()).to.equal(true);
    expect(chunks.join('')).to.equal('streamed data');
  });
});
