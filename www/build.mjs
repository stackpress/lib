import { copyFile, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, extname, join, relative } from 'node:path';
import renderTemplate from '@stackpress/lib/Template';

const root = new URL('..', import.meta.url).pathname;
const specsDir = join(root, 'specs');
const outDir = join(root, 'docs');
const wwwDir = join(root, 'www');
const templates = new Map();

const site = {
  title: '@stackpress/lib',
  description: 'Shared low-level TypeScript primitives for Stackpress projects.',
  repo: 'https://github.com/stackpress/lib',
  npm: 'https://www.npmjs.com/package/@stackpress/lib'
};

const groups = [
  {
    id: 'events',
    title: 'Events',
    description: 'Priority-aware async listeners, route-style matching, and queue-backed execution.',
    pages: ['api/events/EventEmitter.md', 'api/events/ExpressEmitter.md', 'api/events/RouteEmitter.md']
  },
  {
    id: 'system',
    title: 'System',
    description: 'Filesystem and module-loading primitives for explicit runtime boundaries.',
    pages: ['api/system/FileLoader.md', 'api/system/NodeFS.md']
  },
  {
    id: 'data',
    title: 'Data',
    description: 'Nested object access, readonly wrappers, collection helpers, parsers, and cookies.',
    pages: ['api/data/Nest.md', 'api/data/Map.md', 'api/data/Set.md', 'api/data/Parsers.md', 'api/data/Cookie.md']
  },
  {
    id: 'routing',
    title: 'Routing',
    description: 'Route-aware request handling with typed request, response, and session wrappers.',
    pages: ['api/router/Router.md', 'api/router/Request.md', 'api/router/Response.md', 'api/router/Session.md']
  },
  {
    id: 'queue',
    title: 'Queue',
    description: 'Ordered execution primitives for items and async tasks.',
    pages: ['api/queue/ItemQueue.md', 'api/queue/TaskQueue.md'],
    secondary: true
  },
  {
    id: 'runtime',
    title: 'Runtime',
    description: 'Exception, reflection, status, template, and terminal helpers.',
    pages: [
      'api/runtime/Exception.md',
      'api/runtime/Reflection.md',
      'api/runtime/Status.md',
      'api/runtime/Template.md',
      'api/runtime/Terminal.md'
    ],
    secondary: true
  },
  {
    id: 'types',
    title: 'Types',
    description: 'Public type families from @stackpress/lib/types.',
    pages: ['api/types/README.md'],
    secondary: true
  }
];

const allGroupPages = new Set(groups.flatMap(group => group.pages));

function renderSiteTemplate(template, props = {}) {
  return renderTemplate(template, props, { delimiters: ['[[', ']]'] });
}

function renderTemplateFile(type, name, props = {}) {
  const key = `${type}/${name}.html`;
  const template = templates.get(key);
  if (!template) throw new Error(`Missing template file: www/${key}`);
  return renderSiteTemplate(template, props);
}

function renderPage(name, props = {}) {
  return renderTemplateFile('template', name, props);
}

function renderFragment(name, props = {}) {
  return renderTemplateFile('fragments', name, props);
}

async function loadTemplatesFrom(dir, type) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      await loadTemplatesFrom(full, `${type}/${entry.name}`);
    } else if (extname(entry.name) === '.html') {
      templates.set(`${type}/${entry.name}`, await readFile(full, 'utf8'));
    }
  }
}

async function loadTemplates() {
  await loadTemplatesFrom(join(wwwDir, 'template'), 'template');
  await loadTemplatesFrom(join(wwwDir, 'fragments'), 'fragments');
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/`([^`]+)`/g, '$1')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function titleFromMarkdown(markdown, fallback) {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match ? stripInlineMarkdown(match[1]) : fallback;
}

function stripInlineMarkdown(value) {
  return value
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1');
}

function outputPathForSpec(specPath) {
  if (specPath === 'README.md') return 'index.html';
  if (specPath.endsWith('/README.md')) {
    return specPath.replace(/README\.md$/, 'index.html');
  }
  return specPath.replace(/\.md$/, '.html');
}

function relativeLink(fromPath, toPath) {
  let href = relative(dirname(fromPath), toPath).replaceAll('\\', '/');
  if (!href.startsWith('.')) href = `./${href}`;
  return href;
}

function hrefFromSpec(specPath, fromPath = 'index.html') {
  return relativeLink(fromPath, outputPathForSpec(specPath));
}

function assetPath(fromPath, asset) {
  return relativeLink(fromPath, asset);
}

function rewriteMarkdownHref(href, currentSpecPath) {
  if (/^(https?:|mailto:|#)/.test(href)) return href;
  const [path, hash = ''] = href.split('#');
  if (!path) return hash ? `#${hash}` : href;
  let resolved = join(dirname(currentSpecPath), path).replaceAll('\\', '/');
  while (resolved.startsWith('../')) resolved = resolved.slice(3);
  const html = outputPathForSpec(resolved);
  const from = outputPathForSpec(currentSpecPath);
  let next = relative(dirname(from), html).replaceAll('\\', '/');
  if (!next.startsWith('.')) next = `./${next}`;
  return hash ? `${next}#${hash}` : next;
}

function renderInline(value, currentSpecPath) {
  let text = escapeHtml(value);
  text = text.replace(/`([^`]+)`/g, (_match, html) => {
    return renderFragment('markdown-inline-code', { html });
  });
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, href) => {
    return renderFragment('markdown-link', {
      href: escapeHtml(rewriteMarkdownHref(href, currentSpecPath)),
      html: label,
      title: escapeHtml(stripInlineMarkdown(label))
    });
  });
  text = text.replace(/\*\*([^*]+)\*\*/g, (_match, html) => {
    return renderFragment('markdown-strong', { html });
  });
  text = text.replace(/\*([^*]+)\*/g, (_match, html) => {
    return renderFragment('markdown-emphasis', { html });
  });
  return text;
}

function renderMarkdown(markdown, currentSpecPath) {
  const lines = markdown.split(/\r?\n/);
  const html = [];
  const toc = [];
  let paragraph = [];
  let list = [];
  let table = [];
  let code = null;

  const flushParagraph = () => {
    if (!paragraph.length) return;
    html.push(renderFragment('markdown-paragraph', {
      html: renderInline(paragraph.join(' '), currentSpecPath)
    }));
    paragraph = [];
  };

  const flushList = () => {
    if (!list.length) return;
    html.push(renderFragment('markdown-list', {
      items: list.map(item => ({
        html: renderInline(item, currentSpecPath)
      }))
    }));
    list = [];
  };

  const flushTable = () => {
    if (!table.length) return;
    const rows = [];
    for (let index = 0; index < table.length; index++) {
      const cells = table[index].split('|').slice(1, -1).map(cell => cell.trim());
      if (index === 1 && cells.every(cell => /^:?-{3,}:?$/.test(cell))) continue;
      const tag = index === 0 ? 'th' : 'td';
      rows.push({
        cells: cells.map(cell => ({
          html: renderFragment('markdown-table-cell', {
            html: renderInline(cell, currentSpecPath),
            tag
          })
        }))
      });
    }
    html.push(renderFragment('markdown-table', { rows }));
    table = [];
  };

  for (const line of lines) {
    const fence = line.match(/^```(\w+)?/);
    if (fence && !code) {
      flushParagraph();
      flushList();
      flushTable();
      code = { lang: fence[1] || '', lines: [] };
      continue;
    }
    if (fence && code) {
      const langClass = code.lang ? ` language-${escapeHtml(code.lang)}` : '';
      html.push(renderFragment('markdown-code-block', {
        code: escapeHtml(code.lines.join('\n')),
        langClass: langClass.trim()
      }));
      code = null;
      continue;
    }
    if (code) {
      code.lines.push(line);
      continue;
    }
    if (!line.trim()) {
      flushParagraph();
      flushList();
      flushTable();
      continue;
    }
    if (/^\|.+\|$/.test(line.trim())) {
      flushParagraph();
      flushList();
      table.push(line.trim());
      continue;
    }
    flushTable();
    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1].length;
      const title = stripInlineMarkdown(heading[2]);
      const id = slugify(title);
      if (level > 1) toc.push({ id, level, title });
      html.push(renderFragment('markdown-heading', {
        html: renderInline(heading[2], currentSpecPath),
        id,
        level
      }));
      continue;
    }
    const bullet = line.match(/^\s*-\s+(.+)$/);
    if (bullet) {
      flushParagraph();
      list.push(bullet[1]);
      continue;
    }
    paragraph.push(line.trim());
  }

  flushParagraph();
  flushList();
  flushTable();

  return { html: html.join('\n'), toc };
}

async function listMarkdownFiles(dir, base = dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listMarkdownFiles(full, base));
    } else if (extname(entry.name) === '.md') {
      files.push(relative(base, full).replaceAll('\\', '/'));
    }
  }
  return files.sort((a, b) => a.localeCompare(b));
}

function navHtml(currentPath) {
  const links = groups.map(group => {
    const href = `${group.id}.html`;
    const active = currentPath === href ? 'active' : '';
    return { active, href: relativeLink(currentPath, href), title: group.title };
  });
  return renderFragment('sidebar-nav', {
    homeActive: currentPath === 'index.html' ? 'active' : '',
    homeHref: relativeLink(currentPath, 'index.html'),
    links
  });
}

function mobileNavHtml(currentPath) {
  const links = [
    ['Hub', 'index.html'],
    ...groups.map(group => [group.title, `${group.id}.html`])
  ];
  return links
    .map(([label, href]) => ({ href: relativeLink(currentPath, href), label }))
    .map(link => renderFragment('mobile-link', link))
    .join('');
}

function tocHtml(toc) {
  if (!toc.length) return '';
  return renderFragment('toc', {
    toc: toc.map(item => ({
      id: item.id,
      title: escapeHtml(item.title)
    }))
  });
}

function layout({ title, description, currentPath, body, toc = [] }) {
  const pageTitle = `${title} | ${site.title}`;
  return renderPage('layout', {
    body,
    description: escapeHtml(description || site.description),
    hasToc: toc.length > 0,
    homeHref: relativeLink(currentPath, 'index.html'),
    mobileNav: mobileNavHtml(currentPath),
    npm: site.npm,
    pageTitle: escapeHtml(pageTitle),
    repo: site.repo,
    scriptHref: assetPath(currentPath, 'assets/scripts/site.js'),
    sidebar: navHtml(currentPath),
    styleHref: assetPath(currentPath, 'assets/styles/site.css'),
    tocHtml: tocHtml(toc)
  });
}

function groupCard(group, currentPath) {
  return renderFragment('lane-card', {
    description: escapeHtml(group.description),
    href: relativeLink(currentPath, `${group.id}.html`),
    lowerTitle: group.title.toLowerCase(),
    names: escapeHtml(group.pages
      .map(page => page.split('/').pop().replace('.md', '').replace('README', 'Types'))
      .join(', ')),
    title: group.title
  });
}

function renderHomepage() {
  const primary = groups.filter(group => !group.secondary);
  const secondary = groups.filter(group => group.secondary);
  return layout({
    title: 'Reference Hub',
    description: site.description,
    currentPath: 'index.html',
    body: renderPage('home', {
      primaryCards: primary.map(group => groupCard(group, 'index.html')).join('\n'),
      quickLinks: primary.map(group => ({
        description: escapeHtml(group.description),
        href: `./${group.id}.html`,
        title: group.title
      })),
      secondaryLinks: secondary.map(group => ({
        description: escapeHtml(group.description),
        href: `./${group.id}.html`,
        title: group.title
      }))
    })
  });
}

function renderGroupPage(group, pageMeta) {
  const currentPath = `${group.id}.html`;
  const cards = group.pages.map(specPath => {
    const meta = pageMeta.get(specPath);
    return {
      href: hrefFromSpec(specPath, currentPath),
      summary: escapeHtml(meta.summary),
      title: escapeHtml(meta.title)
    };
  });
  const rows = group.pages.map(specPath => {
    const meta = pageMeta.get(specPath);
    return {
      href: hrefFromSpec(specPath, currentPath),
      title: escapeHtml(meta.title),
      useWhen: escapeHtml(meta.useWhen)
    };
  });
  return layout({
    title: group.title,
    description: group.description,
    currentPath,
    body: renderPage('category', {
      cards,
      description: escapeHtml(group.description),
      rows,
      title: escapeHtml(group.title),
      twoColumnClass: group.pages.length <= 2 ? ' two' : ''
    })
  });
}

function summaryFromMarkdown(markdown) {
  const match = markdown.match(/## When To Use It\s+([\s\S]*?)(?:\n##|\n#|$)/);
  const text = match ? match[1] : markdown.replace(/^#.+$/m, '');
  return stripInlineMarkdown(text)
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 170);
}

function useWhenFromSummary(summary) {
  const sentence = summary.split(/[.!?]/)[0];
  return sentence || 'lookup';
}

function renderArticle(specPath, rendered, meta, prev, next) {
  const currentPath = outputPathForSpec(specPath);
  return layout({
    title: meta.title,
    description: meta.summary,
    currentPath,
    toc: rendered.toc,
    body: renderPage('article', {
      hasNext: Boolean(next),
      hasPrev: Boolean(prev),
      html: rendered.html,
      nextHref: next ? hrefFromSpec(next.path, currentPath) : '',
      nextTitle: next ? escapeHtml(next.title) : '',
      prevHref: prev ? hrefFromSpec(prev.path, currentPath) : '',
      prevTitle: prev ? escapeHtml(prev.title) : '',
      summary: escapeHtml(meta.summary),
      title: escapeHtml(meta.title)
    })
  });
}

async function copyAssets() {
  await mkdir(join(outDir, 'assets/styles'), { recursive: true });
  await mkdir(join(outDir, 'assets/scripts'), { recursive: true });
  await copyFile(join(wwwDir, 'styles/site.css'), join(outDir, 'assets/styles/site.css'));
  await copyFile(join(wwwDir, 'scripts/site.js'), join(outDir, 'assets/scripts/site.js'));
}

async function main() {
  await loadTemplates();

  const markdownFiles = await listMarkdownFiles(specsDir);
  const articleFiles = markdownFiles.filter(file => file !== 'README.md');
  const pageMeta = new Map();
  const source = new Map();

  for (const file of articleFiles) {
    const markdown = await readFile(join(specsDir, file), 'utf8');
    const title = titleFromMarkdown(markdown, file);
    const summary = summaryFromMarkdown(markdown);
    source.set(file, markdown);
    pageMeta.set(file, {
      title,
      summary,
      useWhen: useWhenFromSummary(summary)
    });
  }

  await rm(outDir, { force: true, recursive: true });
  await mkdir(outDir, { recursive: true });
  await copyAssets();

  await writeFile(join(outDir, 'index.html'), renderHomepage());

  for (const group of groups) {
    await writeFile(join(outDir, `${group.id}.html`), renderGroupPage(group, pageMeta));
  }

  const orderedArticles = articleFiles.sort((a, b) => {
    const groupA = groups.findIndex(group => group.pages.includes(a));
    const groupB = groups.findIndex(group => group.pages.includes(b));
    if (groupA !== groupB) return groupA - groupB;
    return a.localeCompare(b);
  });

  for (let index = 0; index < orderedArticles.length; index++) {
    const file = orderedArticles[index];
    const rendered = renderMarkdown(source.get(file), file);
    const meta = pageMeta.get(file);
    const prevPath = orderedArticles[index - 1];
    const nextPath = orderedArticles[index + 1];
    const prev = prevPath ? { path: prevPath, title: pageMeta.get(prevPath).title } : null;
    const next = nextPath ? { path: nextPath, title: pageMeta.get(nextPath).title } : null;
    const outPath = join(outDir, outputPathForSpec(file));
    await mkdir(dirname(outPath), { recursive: true });
    await writeFile(outPath, renderArticle(file, rendered, meta, prev, next));
  }

  const missing = [...allGroupPages].filter(page => !pageMeta.has(page));
  if (missing.length) {
    throw new Error(`Missing grouped specs: ${missing.join(', ')}`);
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
