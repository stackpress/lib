//node
import { clearLine, cursorTo, moveCursor } from 'node:readline';
//local
import type { 
  TerminalInputConfig, 
  TerminalInputContext, 
  TerminalTTYInput, 
  TerminalTTYOutput, 
  TerminalPromptState 
} from '../types.js';

//--------------------------------------------------------------------//
// Functions

//Build a local prompt abort error so callers can catch the same error
//shape whether the prompt was cancelled by a signal or by Ctrl+C.
export function createAbortError(message = 'Prompt was aborted') {
  const error = new Error(message);
  error.name = 'AbortPromptError';
  return error;
}

//Normalize all validation rules into one pass so Enter handling only
//needs to wait for one answer before deciding whether it can finish.
export async function validateInput(
  config: TerminalInputConfig,
  value: string
) {
  if (config.required && !value) {
    return 'You must provide a value';
  }

  if (config.pattern) {
    config.pattern.lastIndex = 0;
  }

  if (config.pattern && !config.pattern.test(value)) {
    return config.patternError || 'Invalid input';
  }

  if (typeof config.validate === 'function') {
    const result = await config.validate(value);
    return result || 'You must provide a valid value';
  }

  return true;
}

//Resolve the string that should be painted back to the terminal so the
//interactive render path and the final render path stay in sync.
export function formatValue(
  config: TerminalInputConfig,
  value: string,
  isFinal: boolean
) {
  if (typeof config.transformer === 'function') {
    return config.transformer(value, { isFinal });
  }

  return value;
}

//Build the prompt text in one place so every state transition can
//redraw with the same shape.
export function renderPrompt(
  config: TerminalInputConfig,
  state: TerminalPromptState
) {
  const value = state.currentValue || (!state.isFinal ? state.defaultValue : '');
  const parts = [
    '?',
    config.message,
    formatValue(config, value, state.isFinal)
  ].filter(part => part.length > 0);

  return {
    prompt: parts.join(' '),
    error: state.errorMessage
  };
}

//Clear the previously rendered lines before writing the next prompt so
//validation errors and updated values do not leave stale output behind.
export function clearRender(output: TerminalTTYOutput, lines: number) {
  if (!output.isTTY || lines < 1) {
    return;
  }

  for (let index = 0; index < lines; index++) {
    cursorTo(output, 0);
    clearLine(output, 0);
    if (index < lines - 1) {
      moveCursor(output, 0, -1);
    }
  }

  cursorTo(output, 0);
}

/**
 * Prompts for terminal input without depending on `@inquirer/prompts`.
 */
export default async function input(
  config: TerminalInputConfig,
  context: TerminalInputContext = {}
) {
  const source = (context.input || process.stdin) as TerminalTTYInput;
  const target = (context.output || process.stdout) as TerminalTTYOutput;
  const prefill = config.prefill || 'tab';
  const theme = {
    validationFailureMode: config.theme?.validationFailureMode || 'keep'
  };

  //Coerce the default early so every later render can treat it as text.
  const state: TerminalPromptState = {
    currentValue: '',
    defaultValue: String(config.default ?? ''),
    errorMessage: '',
    isFinal: false
  };

  if (prefill === 'editable' && state.defaultValue) {
    state.currentValue = state.defaultValue;
  }

  if (typeof source.setEncoding === 'function') {
    source.setEncoding('utf8');
  }

  const shouldToggleRawMode = Boolean(
    source.isTTY && typeof source.setRawMode === 'function'
  );
  if (shouldToggleRawMode && source.setRawMode) {
    source.setRawMode(true);
  }

  let renderLines = 0;
  let settled = false;
  let processing = Promise.resolve();
  let rejectPromise: (reason?: unknown) => void = () => undefined;
  let onData: ((buffer: string|Buffer) => void)|undefined;

  const paint = () => {
    const { prompt, error } = renderPrompt(config, state);

    if (target.isTTY) {
      clearRender(target, renderLines);
      target.write(prompt);
      renderLines = 1;

      if (error) {
        target.write(`\n${error}`);
        renderLines = 2;
      }

      return;
    }

    if (!renderLines) {
      target.write(`${prompt}\n`);
      renderLines = error ? 2 : 1;
      if (error) {
        target.write(`${error}\n`);
      }
      return;
    }

    if (error) {
      target.write(`${error}\n`);
    }
  };

  const teardown = () => {
    if (context.signal) {
      context.signal.removeEventListener('abort', onAbort);
    }

    if (onData) {
      source.off('data', onData);
    }
    if (shouldToggleRawMode && source.setRawMode) {
      source.setRawMode(false);
    }
  };

  const finish = (value: string, resolve: (value: string) => void) => {
    if (settled) {
      return;
    }

    settled = true;
    state.currentValue = value;
    state.errorMessage = '';
    state.isFinal = true;

    if (context.clearPromptOnDone && target.isTTY) {
      clearRender(target, renderLines);
      renderLines = 0;
    } else {
      paint();
      target.write('\n');
    }

    teardown();
    resolve(value);
  };

  const fail = (error: Error, reject: (reason?: unknown) => void) => {
    if (settled) {
      return;
    }

    settled = true;
    teardown();
    reject(error);
  };

  const onAbort = () => fail(createAbortError(), rejectPromise);

  const submit = async (
    resolve: (value: string) => void
  ) => {
    const answer = state.currentValue || state.defaultValue;
    const valid = await validateInput(config, answer);

    if (valid === true) {
      finish(answer, resolve);
      return;
    }

    state.errorMessage = valid;
    state.currentValue = theme.validationFailureMode === 'clear' ? '' : answer;
    if (theme.validationFailureMode === 'clear') {
      state.defaultValue = '';
    }
    paint();
  };

  const handleChunk = async (
    chunk: string,
    resolve: (value: string) => void,
    reject: (reason?: unknown) => void
  ) => {
    for (const character of chunk) {
      if (settled) {
        return;
      }

      //Allow Ctrl+C to stop the prompt immediately instead of leaving the
      //caller waiting on a promise that will never resolve.
      if (character === '\u0003') {
        fail(createAbortError('Prompt was cancelled'), reject);
        return;
      }

      //Handle Enter the same way for raw and piped streams so tests can
      //drive the prompt without a real terminal.
      if (character === '\r' || character === '\n') {
        await submit(resolve);
        continue;
      }

      //Let tab inject the default value when the prompt is still empty.
      if (
        source.isTTY
        && prefill === 'tab'
        && character === '\t'
        && !state.currentValue
        && state.defaultValue
      ) {
        state.currentValue = state.defaultValue;
        state.errorMessage = '';
        paint();
        continue;
      }

      //Backspace should edit the live value first, then fall back to
      //clearing the default preview once the live value is empty.
      if (character === '\u007f' || character === '\b') {
        if (state.currentValue) {
          state.currentValue = state.currentValue.slice(0, -1);
        } else if (state.defaultValue) {
          state.defaultValue = '';
        }
        state.errorMessage = '';
        paint();
        continue;
      }

      state.currentValue += character;
      state.errorMessage = '';
      paint();
    }
  };

  return await new Promise<string>((resolve, reject) => {
    rejectPromise = reject;

    if (context.signal?.aborted) {
      fail(createAbortError(), reject);
      return;
    }

    if (context.signal) {
      context.signal.addEventListener('abort', onAbort, { once: true });
    }

    onData = (buffer: string|Buffer) => {
      const chunk = typeof buffer === 'string'
        ? buffer
        : buffer.toString('utf8');

      processing = processing
        .then(async () => await handleChunk(chunk, resolve, reject))
        .catch(error => fail(error as Error, reject));
    };

    source.on('data', onData);
    paint();
  });
}
