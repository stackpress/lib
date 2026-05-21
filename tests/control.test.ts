//node
import { PassThrough } from 'node:stream';

//modules
import { expect } from 'chai';
import { describe, it } from 'mocha';

//client
import control from '../src/terminal/control.js';

class MockInput extends PassThrough {
  public isTTY = true;
  public rawMode = false;

  public setRawMode(mode: boolean) {
    this.rawMode = mode;
  }
}

class MockOutput extends PassThrough {
  public isTTY = true;
}

async function withProcessStreams<T>(
  callback: (streams: { input: MockInput, output: MockOutput }) => Promise<T>
) {
  const stdin = new MockInput();
  const stdout = new MockOutput();
  const stdinDescriptor = Object.getOwnPropertyDescriptor(process, 'stdin');
  const stdoutDescriptor = Object.getOwnPropertyDescriptor(process, 'stdout');

  Object.defineProperty(process, 'stdin', {
    configurable: true,
    value: stdin
  });

  Object.defineProperty(process, 'stdout', {
    configurable: true,
    value: stdout
  });

  try {
    return await callback({ input: stdin, output: stdout });
  } finally {
    if (stdinDescriptor) {
      Object.defineProperty(process, 'stdin', stdinDescriptor);
    }
    if (stdoutDescriptor) {
      Object.defineProperty(process, 'stdout', stdoutDescriptor);
    }
  }
}

describe('Terminal control Tests', () => {
  it('should output a plain branded message', () => {
    const terminal = control('[test]');
    const logs: unknown[][] = [];
    const original = console.log;
    console.log = (...args: unknown[]) => {
      logs.push(args);
    };

    try {
      terminal.output('Hello %s', ['World']);
    } finally {
      console.log = original;
    }

    expect(logs).to.deep.equal([
      ['[test] Hello World']
    ]);
  });

  it('should colorize each helper output', () => {
    const terminal = control('[test]');
    const logs: unknown[][] = [];
    const original = console.log;
    console.log = (...args: unknown[]) => {
      logs.push(args);
    };

    try {
      terminal.error('Error %s', ['message']);
      terminal.info('Info %s', ['message']);
      terminal.success('Success %s', ['message']);
      terminal.system('System %s', ['message']);
      terminal.warning('Warning %s', ['message']);
    } finally {
      console.log = original;
    }

    expect(logs).to.deep.equal([
      ['\x1b[31m%s\x1b[0m', '[test] Error message'],
      ['\x1b[34m%s\x1b[0m', '[test] Info message'],
      ['\x1b[32m%s\x1b[0m', '[test] Success message'],
      ['\x1b[35m%s\x1b[0m', '[test] System message'],
      ['\x1b[33m%s\x1b[0m', '[test] Warning message']
    ]);
  });

  it('should trim empty brands and replace each placeholder in order', () => {
    const terminal = control();
    const logs: unknown[][] = [];
    const original = console.log;
    console.log = (...args: unknown[]) => {
      logs.push(args);
    };

    try {
      terminal.output('%s -> %s', ['alpha', 'beta']);
    } finally {
      console.log = original;
    }

    expect(logs).to.deep.equal([
      ['alpha -> beta']
    ]);
  });

  it('should request required input when no default answer is provided', async () => {
    await withProcessStreams(async ({ input }) => {
      const terminal = control('[test]');
      const answer = terminal.input('What is your name?');

      input.write('Chris\r');

      expect(await answer).to.equal('Chris');
      expect(input.rawMode).to.equal(false);
    });
  });

  it('should use the default answer when input is empty', async () => {
    await withProcessStreams(async ({ input }) => {
      const terminal = control('[test]');
      const answer = terminal.input('What is your name?', 'Chris');

      input.write('\r');

      expect(await answer).to.equal('Chris');
      expect(input.rawMode).to.equal(false);
    });
  });
});
