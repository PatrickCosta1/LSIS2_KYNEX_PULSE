(() => {
  const toggle = document.querySelector('.mode-toggle');
  const btns = document.querySelectorAll('[data-scroll]');
  const root = document.documentElement;

  const setMode = (mode) => {
    root.setAttribute('data-theme', mode);
    localStorage.setItem('kynex-theme', mode);
    toggle.textContent = mode === 'light' ? '☾' : '☼';
  };

  const saved = localStorage.getItem('kynex-theme');
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  setMode(saved || (prefersLight ? 'light' : 'dark'));

  toggle.addEventListener('click', () => {
    const current = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    setMode(current);
  });

  btns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const target = document.querySelector(btn.dataset.scroll);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
})();
