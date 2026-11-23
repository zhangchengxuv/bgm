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

  // Interactive aurora spotlight on glass cards
  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReduced) {
    document.querySelectorAll('.bento-card').forEach(card => {
      card.addEventListener('pointermove', e => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
        card.style.setProperty('--my', `${e.clientY - rect.top}px`);
      }, { passive: true });
    });

    // Subtle twinkling starfield canvas
    const canvas = document.querySelector('.starfield-canvas');
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      let width = 0;
      let height = 0;
      let stars = [];
      const paletteDark = ['#e0f2fe', '#c4b5fd', '#fbcfe8', '#ffffff'];
      const paletteLight = ['#60a5fa', '#a78bfa', '#f472b6'];

      const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const count = Math.min(72, Math.max(36, Math.floor((width * height) / 26000)));
        stars = Array.from({ length: count }, () => ({
          x: Math.random() * width,
          y: Math.random() * height,
          r: Math.random() * 1.4 + 0.4,
          phase: Math.random() * Math.PI * 2,
          speed: 0.008 + Math.random() * 0.015,
          driftY: -0.04 - Math.random() * 0.08,
          colorIndex: Math.floor(Math.random() * 4),
        }));
      };

      const render = () => {
        ctx.clearRect(0, 0, width, height);
        const isLight = root.dataset.theme === 'light';
        const palette = isLight ? paletteLight : paletteDark;
        for (const s of stars) {
          s.phase += s.speed;
          s.y += s.driftY;
          if (s.y < -4) {
            s.y = height + 4;
            s.x = Math.random() * width;
          }
          const alpha = (isLight ? 0.16 : 0.25) + Math.abs(Math.sin(s.phase)) * (isLight ? 0.24 : 0.55);
          ctx.globalAlpha = alpha;
          ctx.fillStyle = palette[s.colorIndex % palette.length];
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        requestAnimationFrame(render);
      };

      resize();
      addEventListener('resize', resize, { passive: true });
      requestAnimationFrame(render);
    }
  }
})();
