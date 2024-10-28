import { describe, it } from 'mocha';
import { expect } from 'chai';
import Exception from '../src/Exception';

function func1(x: number) {
  func2(x + 1);
}
function func2(y: number) {
  func3(y + 1);
}
function func3(z: number) {
  throw Exception.for('Something good is %s', z);
}

describe('Exception Tests', () => {
  it('Should throw template', () => {
    try {
      throw Exception.for('Something good is bad')
    } catch(e) {
      expect(e.name).to.equal('Exception');
      expect(e.message).to.equal('Something good is bad');
      expect(e.code).to.equal(500);
    }
  
    try {
      throw Exception.for('Something good is bad', 'good', 'bad')
    } catch(e) {
      expect(e.name).to.equal('Exception');
      expect(e.message).to.equal('Something good is bad');
      expect(e.code).to.equal(500);
    }
  
    try {
      throw Exception.for('Something %s is %s', 'good', 'bad')
    } catch(e) {
      expect(e.name).to.equal('Exception');
      expect(e.message).to.equal('Something good is bad');
      expect(e.code).to.equal(500);
    }
  });

  it('Should throw errors found', () => {
    try {
      throw Exception.forErrors({ key: 'value' })
    } catch(e) {
      expect(e.name).to.equal('Exception');
      expect(e.message).to.equal('Invalid Parameters');
      expect(e.errors.key).to.equal('value');
      expect(e.code).to.equal(500);
    }
  });

  it('Should throw required', () => {
    try {
      const count = 0;
      Exception.require(count > 1, 'Count %s should be more than 1', count.toString())
    } catch(e) {
      expect(e.name).to.equal('Exception');
      expect(e.message).to.equal('Count 0 should be more than 1');
      expect(e.code).to.equal(500);
    }
  });

  it('Should throw with code', () => {
    try {
      throw Exception.for('Something good is bad').withCode(400)
    } catch(e) {
      expect(e.name).to.equal('Exception');
      expect(e.message).to.equal('Something good is bad');
      expect(e.code).to.equal(400);
    }
  });

  it('Should throw with position', () => {
    try {
      throw Exception.for('Something good is bad').withPosition(1, 2)
    } catch(e) {
      expect(e.name).to.equal('Exception');
      expect(e.message).to.equal('Something good is bad');
      expect(e.code).to.equal(500);
      expect(e.start).to.equal(1);
      expect(e.end).to.equal(2);
    }
  });

  it('Should return error response', () => {
    try {
      throw Exception.for('Something good is bad')
    } catch(e) {
      const json = e.toResponse();
      expect(json.code).to.equal(500)
      expect(json.status).to.equal('Something good is bad')
    }
  });

  it('Should throw with stack', () => {
    try {
      func1(1);
    } catch(e) {
      const trace = e.trace();
      expect(trace[0]).to.have.property('method');
      expect(trace[0]).to.have.property('file');
      expect(trace[0]).to.have.property('line');
      expect(trace[0]).to.have.property('char');
      expect(typeof trace[0].line).to.equal('number');
      expect(typeof trace[0].char).to.equal('number');
    }
  });
});