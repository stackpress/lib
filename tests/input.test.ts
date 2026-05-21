//node
import { PassThrough } from 'node:stream';

//modules
import { expect } from 'chai';
import { describe, it } from 'mocha';

//client
import control from '../src/terminal/control.js';
import input from '../src/terminal/input.js';

type Deferred<T> = {
  promise: Promise<T>,
  resolve: (value: T) => void
};

class MockInput extends PassThrough {
  public isTTY = true;
  public rawMode = false;

  public setRawMode(mode: boolean) {
    this.rawMode = mode;
  }
}

class MockOutput extends PassThrough {
  public isTTY = true;
  public chunks: string[] = [];

  public override write(
    chunk: string|Uint8Array,
    encoding?: BufferEncoding|((error?: Error | null) => void),
    callback?: (error?: Error | null) => void
  ) {
    this.chunks.push(
      typeof chunk === 'string' ? chunk : Buffer.from(chunk).toString('utf8')
    );

    return super.write(chunk, encoding as BufferEncoding, callback);
  }

  public toString() {
    return this.chunks.join('');
  }
}

function deferred<T>(): Deferred<T> {
  let resolve: (value: T) => void = () => undefined;
  const promise = new Promise<T>(next => {
    resolve = next;
  });

  return { promise, resolve };
}

//Swap the process streams for one test at a time so the public control
//helper can keep using its default prompt wiring without extra hooks.
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

describe('Terminal input Tests', () => {
  it('should resolve typed input', async () => {
    const stdin = new MockInput();
    const stdout = new MockOutput();
    const answer = input({
      message: 'What is your name?'
    }, {
      input: stdin,
      output: stdout
    });

    stdin.write('Chris\r');

    expect(await answer).to.equal('Chris');
    expect(stdin.rawMode).to.equal(false);
  });

  it('should resolve the default value on empty submit', async () => {
    const stdin = new MockInput();
    const answer = input({
      message: 'What is your name?',
      default: 'Chris'
    }, {
      input: stdin,
      output: new MockOutput()
    });

    stdin.write('\r');

    expect(await answer).to.equal('Chris');
  });

  it('should reject empty required input until a value is entered', async () => {
    const stdin = new MockInput();
    const answer = input({
      message: 'What is your name?',
      required: true
    }, {
      input: stdin,
      output: new MockOutput()
    });

    stdin.write('\r');
    stdin.write('Chris\r');

    expect(await answer).to.equal('Chris');
  });

  it('should reject values that do not match the pattern', async () => {
    const stdin = new MockInput();
    const stdout = new MockOutput();
    const answer = input({
      message: 'What is your id?',
      pattern: /^\d+$/,
      patternError: 'Numbers only'
    }, {
      input: stdin,
      output: stdout
    });

    stdin.write('abc\r');
    stdin.write('\u007f\u007f\u007f123\r');

    expect(await answer).to.equal('123');
    expect(stdout.toString()).to.contain('Numbers only');
  });

  it('should support sync validation', async () => {
    const stdin = new MockInput();
    const answer = input({
      message: 'What is your role?',
      validate: value => value === 'admin' || 'Role is invalid'
    }, {
      input: stdin,
      output: new MockOutput()
    });

    stdin.write('user\r');
    stdin.write('\u007f\u007f\u007f\u007fadmin\r');

    expect(await answer).to.equal('admin');
  });

  it('should support async validation', async () => {
    const stdin = new MockInput();
    const validation = deferred<true|string>();
    let settled = false;
    const answer = input({
      message: 'What is your role?',
      validate: value => {
        if (value !== 'admin') {
          return validation.promise;
        }

        return true;
      }
    }, {
      input: stdin,
      output: new MockOutput()
    });

    void answer.then(() => {
      settled = true;
    });

    stdin.write('user\r');
    await Promise.resolve();

    expect(settled).to.equal(false);

    validation.resolve('Role is invalid');
    await Promise.resolve();
    stdin.write('\u007f\u007f\u007f\u007fadmin\r');

    expect(await answer).to.equal('admin');
  });

  it('should clear the invalid value when configured to clear', async () => {
    const stdin = new MockInput();
    const stdout = new MockOutput();
    const answer = input({
      message: 'What is your code?',
      pattern: /^\d+$/,
      theme: { validationFailureMode: 'clear' }
    }, {
      input: stdin,
      output: stdout
    });

    stdin.write('abc\r');
    stdin.write('123\r');

    expect(await answer).to.equal('123');
    expect(stdout.toString()).to.contain('? What is your code? 123');
  });

  it('should abort when the signal is cancelled', async () => {
    const stdin = new MockInput();
    const controller = new AbortController();
    const answer = input({
      message: 'What is your name?'
    }, {
      input: stdin,
      output: new MockOutput(),
      signal: controller.signal
    });

    controller.abort();

    try {
      await answer;
      expect.fail('Expected the prompt to abort');
    } catch (error) {
      expect((error as Error).name).to.equal('AbortPromptError');
    }
  });

  it('should abort immediately when the signal is already cancelled', async () => {
    const controller = new AbortController();
    controller.abort();

    try {
      await input({
        message: 'What is your name?'
      }, {
        input: new MockInput(),
        output: new MockOutput(),
        signal: controller.signal
      });
      expect.fail('Expected the prompt to abort');
    } catch (error) {
      expect((error as Error).name).to.equal('AbortPromptError');
    }
  });

  it('should support editable prefills and backspace edits', async () => {
    const stdin = new MockInput();
    const stdout = new MockOutput();
    const answer = input({
      message: 'What is your name?',
      default: 'Chris',
      prefill: 'editable'
    }, {
      input: stdin,
      output: stdout
    });

    stdin.write('\u007f\u007f\u007fopher\r');

    expect(await answer).to.equal('Chopher');
    expect(stdout.toString()).to.contain('? What is your name? Chris');
  });

  it('should inject the default value when tab prefill is used', async () => {
    const stdin = new MockInput();
    const answer = input({
      message: 'What is your name?',
      default: 'Chris'
    }, {
      input: stdin,
      output: new MockOutput()
    });

    stdin.write('\t\r');

    expect(await answer).to.equal('Chris');
  });

  it('should reject when ctrl-c is pressed during input', async () => {
    const stdin = new MockInput();
    const answer = input({
      message: 'What is your name?'
    }, {
      input: stdin,
      output: new MockOutput()
    });

    stdin.write('\u0003');

    try {
      await answer;
      expect.fail('Expected the prompt to abort');
    } catch (error) {
      expect((error as Error).message).to.equal('Prompt was cancelled');
    }
  });

  it('should clear the prompt on completion when requested', async () => {
    const stdin = new MockInput();
    const stdout = new MockOutput();
    const answer = input({
      message: 'What is your name?'
    }, {
      clearPromptOnDone: true,
      input: stdin,
      output: stdout
    });

    stdin.write('Chris\r');

    expect(await answer).to.equal('Chris');
    expect(stdout.toString()).to.not.contain('Chris\n');
  });

  it('should render errors without tty control sequences on piped output', async () => {
    const stdin = new MockInput();
    const stdout = new MockOutput();
    stdin.isTTY = false;
    stdout.isTTY = false;
    const answer = input({
      message: 'What is your code?',
      pattern: /^\d+$/,
      patternError: 'Numbers only',
      theme: { validationFailureMode: 'clear' }
    }, {
      input: stdin,
      output: stdout
    });

    stdin.write('abc\n');
    stdin.write('123\n');

    expect(await answer).to.equal('123');
    expect(stdout.toString()).to.equal(
      '? What is your code?\nNumbers only\n\n'
    );
  });

  it('should render transformed final values', async () => {
    const stdin = new MockInput();
    const stdout = new MockOutput();
    const answer = input({
      message: 'What is your token?',
      transformer: (value, { isFinal }) => {
        return isFinal ? `[${value}]` : '*'.repeat(value.length);
      }
    }, {
      input: stdin,
      output: stdout
    });

    stdin.write('abc\r');

    expect(await answer).to.equal('abc');
    expect(stdout.toString()).to.contain('? What is your token? [abc]\n');
  });

  it('should keep the public control input wiring intact', async () => {
    await withProcessStreams(async ({ input: stdin }) => {
      const terminal = control('[test]');
      const answer = terminal.input('What is your name?', 'Chris');

      stdin.write('\r');

      expect(await answer).to.equal('Chris');
    });
  });
});
