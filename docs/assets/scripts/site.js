const themeButtons = Array.from(document.querySelectorAll('.theme-toggle'));

function readStoredTheme() {
  try {
    return window.localStorage.getItem('stackpress-docs-theme');
  } catch {
    return null;
  }
}

function writeStoredTheme(theme) {
  try {
    window.localStorage.setItem('stackpress-docs-theme', theme);
  } catch {
    // Theme persistence is optional.
  }
}

function setTheme(theme) {
  const isDark = theme === 'dark';
  document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
  writeStoredTheme(document.documentElement.dataset.theme);
  themeButtons.forEach(button => {
    button.textContent = isDark ? 'Light' : 'Dark';
    button.setAttribute('aria-pressed', String(isDark));
  });
}

setTheme(readStoredTheme() === 'dark' ? 'dark' : 'light');

if (window.hljs) {
  window.hljs.highlightAll();
}

themeButtons.forEach(button => {
  button.addEventListener('click', () => {
    setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  });
});

document.querySelectorAll('.mobile-menu').forEach(menuButton => {
  const navId = menuButton.getAttribute('aria-controls');
  const mobileNav = navId ? document.getElementById(navId) : null;
  if (!mobileNav) return;

  menuButton.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
  });

  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
    });
  });
});

document.querySelectorAll('pre.code-block').forEach(block => {
  const button = document.createElement('button');
  button.className = 'copy-code';
  button.type = 'button';
  button.textContent = 'Copy';
  button.addEventListener('click', async () => {
    const code = block.querySelector('code')?.textContent || '';
    try {
      await navigator.clipboard.writeText(code);
      button.textContent = 'Copied';
      window.setTimeout(() => {
        button.textContent = 'Copy';
      }, 1200);
    } catch {
      button.textContent = 'Copy failed';
    }
  });
  block.append(button);
});
