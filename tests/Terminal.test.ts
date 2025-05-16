import { describe, it } from 'mocha';
import { expect } from 'chai';
//NOTE: no extensions in tests because it's excluded in tsconfig.json and
//we are testing in a typescript environment via `ts-mocha -r tsx` (esm)
import Terminal from '../src/router/Terminal';

describe('Terminal Tests', () => {
  it('Should get args', async () => {
    const terminal = new Terminal(['command', '--i', 'value']);
    expect(terminal.args[0]).to.equal('--i');
    expect(terminal.args[1]).to.equal('value');
  })
  it('Should get brand', async () => {
    const terminal = new Terminal([], '[test]');
    expect(terminal.brand).to.equal('[test]');
  })
  it('Should configure controls', async () => {
    const terminal = new Terminal(['command', '--i', 'value'], '[test]');
    const control = terminal.control;
    expect(control.brand).to.equal('[test]');
    expect(typeof control.error).to.equal('function');
    expect(typeof control.success).to.equal('function');
    expect(typeof control.warning).to.equal('function');
    expect(typeof control.info).to.equal('function');
    expect(typeof control.output).to.equal('function');
    expect(typeof control.input).to.equal('function');
  })
  it('Should parse data', async () => {
    const terminal = new Terminal(['command', '--i', 'value']);
    expect(terminal.data.i).to.equal('value');
  })
  it('Should expect arguments', async () => {
    const terminal = new Terminal(['command', '--i', 'value']);
    const input = terminal.expect(['i', 'input'], 'default');
    expect(input).to.equal('value');
  })
  it('Should run command successfully', async () => {
    const terminal = new Terminal(['command', '--i', 'value']);
    terminal.on('command', (req, res) => {
      res.setResults(req.data());
    })
    const response = await terminal.run<{ i: string }>();
    expect(response.code).to.equal(200);
    expect(response.status).to.equal('OK');
    expect(response.total).to.equal(1);
    expect(response.results?.i).to.equal('value');
  })
  it('Should run command then error', async () => {
    const terminal = new Terminal(['command', '--i', 'value']);
    terminal.on('command', (req, res) => {
      res.setError('error message');
    })
    const response = await terminal.run<{ i: string }>();
    expect(response.code).to.equal(400);
    expect(response.status).to.equal('Bad Request');
    expect(response.error).to.equal('error message');
  })
})