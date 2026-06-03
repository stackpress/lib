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
    // Theme persistence is review-only; the toggle should still work.
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

themeButtons.forEach(button => {
  button.addEventListener('click', () => {
    setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  });
});

document.querySelectorAll('.mobile-menu').forEach(menuButton => {
  const navId = menuButton.getAttribute('aria-controls');
  const mobileReviewNav = navId ? document.getElementById(navId) : null;
  if (!mobileReviewNav) return;

  menuButton.addEventListener('click', () => {
    const isOpen = mobileReviewNav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
  });

  mobileReviewNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileReviewNav.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
    });
  });
});
