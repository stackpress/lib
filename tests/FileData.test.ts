import { describe, it } from 'mocha';
import { expect } from 'chai';
//NOTE: no extensions in tests because it's excluded in tsconfig.json and
//we are testing in a typescript environment via `ts-mocha -r tsx` (esm)
import FileData from '../src/data/processors/FileData';
import { FileMeta } from '../src/types';

describe('FileData Tests', () => {
  it('Should correctly instantiate with FileMeta', () => {
    const fileMeta: FileMeta = {
      data: Buffer.from('file data'),
      name: 'testfile.txt',
      type: 'text/plain',
    };

    const file = new FileData(fileMeta);

    expect(file.data).to.be.instanceOf(Buffer);
    expect(file.data.toString()).to.equal('file data');
    expect(file.name).to.equal('testfile.txt');
    expect(file.type).to.equal('text/plain');
  });

  it('Should handle empty data', () => {
    const fileMeta: FileMeta = {
      data: Buffer.from(''),
      name: 'emptyfile.txt',
      type: 'text/plain',
    };

    const file = new FileData(fileMeta);

    expect(file.data).to.be.instanceOf(Buffer);
    expect(file.data.toString()).to.equal('');
    expect(file.name).to.equal('emptyfile.txt');
    expect(file.type).to.equal('text/plain');
  });

  it('Should correctly handle string data', () => {
    const fileMeta: FileMeta = {
      data: 'This is a string data',
      name: 'stringfile.txt',
      type: 'text/plain',
    };

    const file = new FileData(fileMeta);

    expect(file.data).to.be.a('string');
    expect(file.data).to.equal('This is a string data');
    expect(file.name).to.equal('stringfile.txt');
    expect(file.type).to.equal('text/plain');
  });
});
