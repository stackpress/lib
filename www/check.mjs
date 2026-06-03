import { readdir, readFile, stat } from 'node:fs/promises';
import { dirname, extname, join, normalize, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const docsDir = join(root, 'docs');
const specsDir = join(root, 'specs');

const requiredPages = [
  'index.html',
  'events.html',
  'system.html',
  'data.html',
  'routing.html',
  'queue.html',
  'runtime.html',
  'types.html',
  'api/events/EventEmitter.html',
  'api/system/FileLoader.html',
  'api/data/Nest.html',
  'api/router/Router.html',
  'api/queue/TaskQueue.html',
  'api/types/index.html'
];

async function listFiles(dir, base = dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listFiles(full, base));
    } else {
      files.push(relative(base, full).replaceAll('\\', '/'));
    }
  }
  return files.sort((a, b) => a.localeCompare(b));
}

function isExternalLink(href) {
  return /^(https?:|mailto:|tel:|#)/.test(href);
}

function normalizeInternalHref(fromFile, href) {
  const [path] = href.split('#');
  if (!path) return null;
  let target = resolve(docsDir, dirname(fromFile), decodeURIComponent(path));
  if (!target.startsWith(`${docsDir}${sep}`) && target !== docsDir) return false;
  if (path.endsWith('/')) target = join(target, 'index.html');
  if (!extname(target)) target = `${target}.html`;
  return relative(docsDir, normalize(target)).replaceAll('\\', '/');
}

function findLinks(html) {
  return [...html.matchAll(/\shref="([^"]+)"/g)].map(match => match[1]);
}

function checkPageShape(file, html, failures) {
  if (!html.includes('<!doctype html>')) failures.push(`${file}: missing doctype`);
  if (!html.includes('<meta content="width=device-width, initial-scale=1" name="viewport">')) {
    failures.push(`${file}: missing responsive viewport`);
  }
  if (!html.includes('assets/styles/site.css')) failures.push(`${file}: missing stylesheet`);
  if (!html.includes('assets/scripts/site.js')) failures.push(`${file}: missing script`);
  if (/href="[^"]+\.md(?:#|")/.test(html)) failures.push(`${file}: contains Markdown href`);
}

async function main() {
  const failures = [];
  const specFiles = await listFiles(specsDir);
  const docsFiles = await listFiles(docsDir);
  const docsSet = new Set(docsFiles);

  if (!specFiles.some(file => file.endsWith('.md'))) {
    failures.push('specs: no Markdown source files found');
  }

  for (const page of requiredPages) {
    if (!docsSet.has(page)) failures.push(`docs: missing ${page}`);
  }

  for (const file of docsFiles) {
    if (file.endsWith('.md')) failures.push(`docs: generated output contains Markdown file ${file}`);
  }

  if (!docsSet.has('assets/styles/site.css')) failures.push('docs: missing CSS asset');
  if (!docsSet.has('assets/scripts/site.js')) failures.push('docs: missing JS asset');

  const htmlFiles = docsFiles.filter(file => file.endsWith('.html'));
  for (const file of htmlFiles) {
    const html = await readFile(join(docsDir, file), 'utf8');
    checkPageShape(file, html, failures);
    for (const href of findLinks(html)) {
      if (isExternalLink(href)) continue;
      const target = normalizeInternalHref(file, href);
      if (!target) continue;
      if (target === false || !docsSet.has(target)) {
        failures.push(`${file}: broken internal link ${href}`);
      }
    }
  }

  const script = await readFile(join(docsDir, 'assets/scripts/site.js'), 'utf8');
  if (!script.includes('mobile-menu')) failures.push('site.js: mobile menu behavior missing');
  if (!script.includes('theme-toggle')) failures.push('site.js: theme toggle behavior missing');
  if (!script.includes('copy-code')) failures.push('site.js: copy button behavior missing');

  if (failures.length) {
    console.error(failures.map(failure => `- ${failure}`).join('\n'));
    process.exitCode = 1;
    return;
  }

  console.log(`Validated ${htmlFiles.length} HTML pages from ${specFiles.length} Markdown specs.`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
