// First-party progressive enhancement for the information-only static export.
// No framework hydration, requests, tracking, authentication or business data.
(() => {
  const start = () => {
    const root = document.documentElement;
    const themeButton = document.querySelector('.theme-toggle');
    const media = matchMedia('(prefers-color-scheme: dark)');
    const readTheme = () => { try { return localStorage.getItem('lastar.web.theme'); } catch { return null; } };
    let explicit = ['dawn', 'night'].includes(readTheme());
    const paintTheme = theme => {
      if (root.dataset.theme !== theme) root.dataset.theme = theme;
      if (!themeButton) return;
      themeButton.setAttribute('aria-label', theme === 'night' ? '切换到晨雾主题' : '切换到夜航主题');
      themeButton.children[0].textContent = theme === 'night' ? '☀' : '☾';
      themeButton.children[1].textContent = theme === 'night' ? '晨雾' : '夜航';
    };
    const syncTheme = () => {
      const saved = readTheme();
      if (saved === 'dawn' || saved === 'night') paintTheme(saved);
      else if (!explicit) paintTheme(media.matches ? 'night' : 'dawn');
    };
    paintTheme(root.dataset.theme === 'night' ? 'night' : 'dawn');
    syncTheme(); // Closes the bootstrap/listener setup race without waiting for hydration.
    themeButton?.addEventListener('click', () => {
      const next = root.dataset.theme === 'night' ? 'dawn' : 'night';
      explicit = true;
      try { localStorage.setItem('lastar.web.theme', next); } catch { /* Current page still works. */ }
      paintTheme(next);
    });
    media.addEventListener('change', syncTheme);
    addEventListener('storage', () => { explicit = ['dawn', 'night'].includes(readTheme()); syncTheme(); });

    const header = document.querySelector('.site-header');
    const trigger = document.querySelector('.mobile-menu > button');
    const menu = document.querySelector('#mobile-site-nav');
    let open = false;
    let previousOverflow = '';
    const fitMenu = () => {
      if (!open || !menu) return;
      const scale = menu.getBoundingClientRect().width / menu.offsetWidth || 1;
      const right = Math.min(innerWidth - 14, menu.getBoundingClientRect().right);
      menu.style.maxWidth = `${Math.max(0, right - 14) / scale}px`;
      menu.style.maxHeight = `${Math.max(0, innerHeight - menu.getBoundingClientRect().top - 16) / scale}px`;
    };
    const closeMenu = () => {
      if (!open || !menu || !trigger) return;
      open = false;
      menu.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = previousOverflow;
      trigger.focus();
    };
    trigger?.addEventListener('click', () => {
      if (open) { closeMenu(); return; }
      if (!menu) return;
      open = true;
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      menu.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
      fitMenu();
      menu.querySelector('a')?.focus();
    });
    menu?.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
    document.addEventListener('keydown', event => {
      if (!open || !menu) return;
      if (event.key === 'Escape') { event.preventDefault(); closeMenu(); return; }
      if (event.key !== 'Tab') return;
      const links = [...menu.querySelectorAll('a')], first = links[0], last = links.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    });
    addEventListener('resize', () => { if (innerWidth > 860) closeMenu(); else fitMenu(); });
    addEventListener('popstate', closeMenu);
    addEventListener('pageshow', () => { closeMenu(); syncTheme(); scroll(); });
    if (header && 'ResizeObserver' in window) new ResizeObserver(fitMenu).observe(header);
    const scroll = () => {
      if (!header) return;
      const scrolled = String(scrollY > 12);
      if (header.dataset.scrolled !== scrolled) header.dataset.scrolled = scrolled;
    };
    scroll(); addEventListener('scroll', scroll, {passive:true});
    const current = location.pathname.replace(/\/$/, '') || '/';
    document.querySelectorAll('.site-nav a, .mobile-menu a').forEach(link => {
      if ((link.pathname.replace(/\/$/, '') || '/') === current) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });

    document.querySelectorAll('[data-hero-motion]').forEach(hero => {
      const button = hero.querySelector('.motion-toggle');
      let visible = true;
      const visibility = () => { hero.dataset.visible = String(visible && !document.hidden); };
      if ('IntersectionObserver' in window) new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; visibility(); }).observe(hero);
      document.addEventListener('visibilitychange', visibility);
      button?.addEventListener('click', () => {
        const paused = hero.dataset.paused !== 'true';
        hero.dataset.paused = String(paused);
        button.setAttribute('aria-pressed', String(paused));
        button.textContent = paused ? '播放星光动效' : '暂停星光动效';
      });
    });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once:true});
  else start();
})();
