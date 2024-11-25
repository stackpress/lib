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
    } catch (e) {
      expect(e.name).to.equal('Exception');
      expect(e.message).to.equal('Something good is bad');
      expect(e.code).to.equal(500);
    }

    try {
      throw Exception.for('Something good is bad', 'good', 'bad')
    } catch (e) {
      expect(e.name).to.equal('Exception');
      expect(e.message).to.equal('Something good is bad');
      expect(e.code).to.equal(500);
    }

    try {
      throw Exception.for('Something %s is %s', 'good', 'bad')
    } catch (e) {
      expect(e.name).to.equal('Exception');
      expect(e.message).to.equal('Something good is bad');
      expect(e.code).to.equal(500);
    }
  });

  it('Should throw errors found', () => {
    try {
      throw Exception.forErrors({ key: 'value' })
    } catch (e) {
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
    } catch (e) {
      expect(e.name).to.equal('Exception');
      expect(e.message).to.equal('Count 0 should be more than 1');
      expect(e.code).to.equal(500);
    }
  });

  it('Should throw with code', () => {
    try {
      throw Exception.for('Something good is bad').withCode(400)
    } catch (e) {
      expect(e.name).to.equal('Exception');
      expect(e.message).to.equal('Something good is bad');
      expect(e.code).to.equal(400);
    }
  });

  it('Should throw with position', () => {
    try {
      throw Exception.for('Something good is bad').withPosition(1, 2)
    } catch (e) {
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
    } catch (e) {
      const json = e.toResponse();
      expect(json.code).to.equal(500)
      expect(json.status).to.equal('Internal Server Error')
      expect(json.error).to.equal('Something good is bad')
    }
  });

  it('Should throw with stack', () => {
    try {
      func1(1);
    } catch (e) {
      const trace = e.trace();
      expect(trace[0]).to.have.property('method');
      expect(trace[0]).to.have.property('file');
      expect(trace[0]).to.have.property('line');
      expect(trace[0]).to.have.property('char');
      expect(typeof trace[0].line).to.equal('number');
      expect(typeof trace[0].char).to.equal('number');
    }
  });

  it('Should try', () => {
    const actual = Exception
      .try<string>(() => 'Something good')
      .catch(() => 'Something good is bad');

    expect(actual).to.equal('Something good');
  });

  it('Should catch', () => {
    const actual = Exception.try<string>(() => {
      throw Exception.for('Something good is bad');
    }).catch(e => e.message);
    expect(actual).to.equal('Something good is bad');
  });

  // <!------------------------------- NEW TEST ------------------------------->
  it('Should correctly serialize to JSON', () => {
    try {
      throw Exception.for('Something good is bad');
    } catch (e) {
      const json = e.toJSON();
      const expected = JSON.stringify({
        code: 500,
        status: 'Internal Server Error',
        error: 'Something good is bad',
        start: 0,
        end: 0,
        stack: e.trace(0, 0)
      }, null, 2);
      expect(json).to.equal(expected);
    }
  });

  it('Should handle non-Exception errors in try-catch', () => {
    const actual = Exception
      .try<string>(() => {
        throw new Error('Some random error');
      })
      .catch((e) => e.message);
    expect(actual).to.equal('Some random error');
  });


  it('Should handle non-string errors gracefully', () => {
    const actual = Exception.try<string>(() => {
      throw { some: 'object' }; // Throws a non-Exception object
    }).catch((e, kind) => {
      if (typeof e === 'object' && e !== null && 'some' in e) {
        return String((e as any).some); // Ensure return is string
      }
      return `Unknown error of kind: ${kind}`;
    });
    expect(actual).to.equal('object');
  });

  it('Should handle string error in try', () => {
    const result = Exception.try<string>(() => {
      throw 'This is a string error';
    }).catch((e, kind) => {
      expect(e).to.be.instanceOf(Exception);
      expect(e.message).to.equal('This is a string error');
      expect(kind).to.equal('Exception');
      return 'Handled';
    });
    expect(result).to.equal('Handled');
  });


  it('Should handle invalid stack trace entry', () => {
    try {
      const err = new Exception('Test error');
      err.stack = 'Invalid stack entry';
      throw err;
    } catch (e) {
      const trace = e.trace();
      expect(trace).to.be.an('array').that.is.empty;
    }
  });


  it('Should handle unknown error types gracefully', () => {
    const actual = Exception.try<string>(() => {
      throw 42; // Throwing a non-standard error (number)
    }).catch((e, kind) => {
      expect(e).to.not.be.instanceOf(Exception);
      expect(kind).to.equal('unknown');
      return `Unknown error of kind: ${kind}`;
    });
    expect(actual).to.equal('Unknown error of kind: unknown');
  });

  it('Should handle undefined status codes', () => {
    const exception = new Exception('Undefined status test', 9999); // Invalid status code
    const response = exception.toResponse();
    expect(response.status).to.equal('Unknown');
  });

  it('Should handle trace with malformed stack entry', () => {
    try {
      const err = new Exception('Malformed stack test');
      err.stack = 'Some non-standard stack entry';
      throw err;
    } catch (e) {
      const trace = e.trace();
      expect(trace).to.be.an('array').that.is.empty;
    }
  });


  /*
  * ADD ANOTHER UNIT TEST
  */

  it('Should handle undefined status codes', () => {
    const exception = new Exception('Undefined status test', 9999);
    const response = exception.toResponse();
    expect(response.status).to.equal('Unknown');
  });

});