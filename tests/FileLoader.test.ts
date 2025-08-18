import path from 'node:path';
import { describe, it } from 'mocha';
import { expect } from 'chai';
//NOTE: no extensions in tests because it's excluded in tsconfig.json and
//we are testing in a typescript environment via `ts-mocha -r tsx` (esm)
import FileLoader from '../src/system/FileLoader';
import NodeFS from '../src/system/NodeFS';

function normalize(path: string) {
  return path.replaceAll('\\', '/').replace(/^[A-Za-z]:/, '');
}

describe('FileLoader Tests', () => {
  it('Instantiate File Loader', () => {
    const fs = new NodeFS();
    const loader = new FileLoader(fs, import.meta.dirname);

    expect(fs).to.be.instanceOf(NodeFS);
    expect(loader).to.be.instanceOf(FileLoader);
    expect(loader.fs).to.be.instanceOf(NodeFS);
    expect(loader.cwd).to.equal(import.meta.dirname);
  });

  it('Should get absolute path', async () => {
    const fs = new NodeFS();
    const loader = new FileLoader(fs, import.meta.dirname);

    const actual1 = await loader.absolute('@/foo/bar');
    const expected1 = path.join(import.meta.dirname, 'foo/bar');
    expect(actual1).to.equal(expected1);

    const actual2 = await loader.absolute('@/foo/bar.ts');
    const expected2 = path.join(import.meta.dirname, 'foo/bar.ts');
    expect(actual2).to.equal(expected2);

    const actual3 = normalize(await loader.absolute('/foo/bar'));
    const expected3 = '/foo/bar';
    expect(actual3).to.equal(expected3);

    const actual4 = normalize(await loader.absolute('/foo/bar.ts'));
    const expected4 = '/foo/bar.ts';
    expect(actual4).to.equal(expected4);

    const actual5 = await loader.absolute('@types/node');
    expect(actual5).to.contain('node_modules');

    const actual6 = await loader.absolute('not/sure');
    const expected6 = path.join(import.meta.dirname, 'not/sure');
    expect(actual6).to.equal(expected6);
  });

  it('Should get base path', () => {
    const fs = new NodeFS();
    const loader = new FileLoader(fs, import.meta.dirname);

    const actual = loader.basepath('/foo/bar/zoo.txt');
    expect(actual).to.equal('/foo/bar/zoo');
  });

  it('Should get lib', async () => {
    const fs = new NodeFS();
    const loader = new FileLoader(fs, import.meta.dirname);

    const actual = await loader.lib();
    expect(actual).to.contain('node_modules');
  });

  it('Should get modules', async () => {
    const fs = new NodeFS();
    const loader = new FileLoader(fs, import.meta.dirname);

    const actual = await loader.modules('@types/node');
    expect(actual).to.contain('node_modules');
  });

  it('Should import', async () => {
    const fs = new NodeFS();
    const loader = new FileLoader(fs, import.meta.dirname);
    const num1 = await loader.import('./fixtures/numbercjs.cjs');
    expect(num1.default).to.equal(1);
    const num2 = await loader.import('./fixtures/numberesm');
    expect(num2.default).to.equal(2);
    const num21 = await loader.import('./fixtures/numberesm.js');
    expect(num21.default).to.equal(2);
    const num3 = await loader.import('./fixtures/numberts');
    expect(num3.default).to.equal(3);
  });

  it('Should get relative path', () => {
    const fs = new NodeFS();
    const loader = new FileLoader(fs, import.meta.dirname);

    const actual = loader.relative('/foo/bar/zoo.js', '/foo/zoo/bar.js', true);
    const normalized = normalize(actual);
    expect(normalized).to.equal('../zoo/bar.js')
  });

  it('Should get resolve file/folder', async () => {
    const fs = new NodeFS();
    const loader = new FileLoader(fs, import.meta.dirname);

    const actual1 = await loader.resolve('@/fixtures/file.txt');
    const expected1 = path.join(import.meta.dirname, 'fixtures/file.txt');
    expect(actual1).to.equal(expected1);

    const actual2 = await loader.resolve('@/fixtures');
    const expected2 = path.join(import.meta.dirname, 'fixtures');
    expect(actual2).to.equal(expected2);

    const actual3 = await loader.resolve(path.join(import.meta.dirname, 'fixtures/file.txt'));
    const expected3 = path.join(import.meta.dirname, 'fixtures/file.txt');
    expect(actual3).to.equal(expected3);

    const actual4 = await loader.resolve(path.join(import.meta.dirname, 'fixtures'));
    const expected4 = path.join(import.meta.dirname, 'fixtures');
    expect(actual4).to.equal(expected4);

    const actual5 = await loader.resolve('@types/node');
    expect(actual5).to.contain('node_modules');

    const actual6 = await loader.resolve('not/sure');
    const expected6 = path.join(import.meta.dirname, 'not/sure');
    expect(actual6).to.be.null;
  });

  it('Should get resolve file', async () => {
    const fs = new NodeFS();
    const loader = new FileLoader(fs, import.meta.dirname);

    const actual1 = await loader.resolveFile('@/fixtures/file', ['.txt']);
    const expected1 = path.join(import.meta.dirname, 'fixtures/file.txt');
    expect(actual1).to.equal(expected1);

    const actual2 = await loader.resolveFile('@/fixtures/file', ['.foobar']);
    expect(actual2).to.be.null;
  });
});
