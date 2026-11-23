(() => {
  const key = 'screening-room-theme';
  const root = document.documentElement;
  const saved = localStorage.getItem(key);
  root.dataset.theme = saved === 'light' ? 'light' : 'dark';

  document.querySelector('.theme-toggle')?.addEventListener('click', () => {
    const next = root.dataset.theme === 'light' ? 'dark' : 'light';
    root.dataset.theme = next;
    localStorage.setItem(key, next);
  });

  const header = document.querySelector('.site-header');
  const updateHeader = () => header?.classList.toggle('scrolled', scrollY > 16);
  updateHeader();
  addEventListener('scroll', updateHeader, { passive: true });
})();
