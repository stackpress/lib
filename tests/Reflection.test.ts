import { describe, it } from 'mocha';
import { expect } from 'chai';
//NOTE: no extensions in tests because it's excluded in tsconfig.json
//and we are testing in a typescript environment via ts-mocha
import Reflection from '../src/Reflection';

function func1(x: number) {
  return func2(x + 1);
}
function func2(y: number) {
  return func3(y + 1);
}
function func3(z: number) {
  return Reflection.stack();
}

describe('Reflection Tests', () => {
  it('Should reflect', () => {
    const stack = func1(1).map(trace => trace.toObject());
    expect(stack[0].file).to.equal(import.meta.url);
    expect(stack[0].funcName).to.equal('func3');
    expect(stack[1].file).to.equal(import.meta.url);
    expect(stack[1].funcName).to.equal('func2');
    expect(stack[2].file).to.equal(import.meta.url);
    expect(stack[2].funcName).to.equal('func1');
  });
});