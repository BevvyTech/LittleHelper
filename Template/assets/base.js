(() => {
  const root = document.documentElement;
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const stored = localStorage.getItem('lh-theme');
  const initial = stored || (prefersDark ? 'dark' : 'light');

  const applyTheme = (mode) => {
    if (mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('lh-theme', mode);
  };

  applyTheme(initial);

  const toggleTheme = () => {
    const next = root.classList.contains('dark') ? 'light' : 'dark';
    applyTheme(next);
  };

  document.querySelectorAll('[data-action="toggle-theme"]').forEach((btn) => {
    btn.addEventListener('click', toggleTheme);
  });

  // Basic drawer toggle (e.g., mobile nav or comment panel)
  document.querySelectorAll('[data-action="toggle-drawer"]').forEach((btn) => {
    const targetId = btn.dataset.target;
    btn.addEventListener('click', () => {
      const drawer = document.getElementById(targetId);
      if (!drawer) return;
      const isHidden = drawer.classList.contains('hidden') || drawer.classList.contains('translate-x-full');
      if (isHidden) {
        drawer.classList.remove('hidden');
        drawer.classList.remove('translate-x-full');
      } else {
        drawer.classList.add('translate-x-full');
        drawer.classList.add('hidden');
      }
    });
  });

  // Sidebar collapse for admin shell
  document.querySelectorAll('[data-action="toggle-sidebar"]').forEach((btn) => {
    const targetId = btn.dataset.target || 'admin-sidebar';
    btn.addEventListener('click', () => {
      const sidebar = document.getElementById(targetId);
      if (!sidebar) return;
      sidebar.classList.toggle('-translate-x-full');
    });
  });

  const toastStack = document.getElementById('toast-stack');

  const statusColors = {
    info: 'border-blue-400/60 bg-blue-500/10 text-blue-100',
    success: 'border-emerald-400/60 bg-emerald-500/10 text-emerald-100',
    warning: 'border-amber-400/60 bg-amber-500/10 text-amber-100',
    danger: 'border-rose-400/60 bg-rose-500/10 text-rose-100',
  };

  const showToast = (type = 'info', message = 'Example notification') => {
    if (!toastStack) return;
    const el = document.createElement('div');
    el.className = `toast-card border ${statusColors[type] || statusColors.info}`;
    el.innerHTML = `
      <div class="flex items-start gap-3">
        <span class="text-lg">${type === 'success' ? '✅' : type === 'danger' ? '⛔' : type === 'warning' ? '⚠️' : 'ℹ️'}</span>
        <div class="flex-1 text-sm leading-relaxed">${message}</div>
        <button class="text-slate-200/80 hover:text-white" aria-label="Dismiss">✕</button>
      </div>
    `;
    el.querySelector('button')?.addEventListener('click', () => el.remove());
    toastStack.appendChild(el);
    setTimeout(() => el.remove(), 5200);
  };

  document.querySelectorAll('[data-demo-toast]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.demoToast;
      const msg = btn.dataset.message || 'Interactive toast preview';
      showToast(type, msg);
    });
  });

  // Modal helpers
  document.querySelectorAll('[data-action="open-modal"]').forEach((btn) => {
    const targetId = btn.dataset.target;
    btn.addEventListener('click', () => {
      const modal = document.getElementById(targetId);
      if (modal) modal.classList.remove('hidden');
    });
  });

  document.querySelectorAll('[data-action="close-modal"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('[data-component="modal"]');
      if (modal) modal.classList.add('hidden');
    });
  });

  // Tab switcher for settings pages
  document.querySelectorAll('[data-tab-group]').forEach((group) => {
    const tabs = group.querySelectorAll('[data-tab-target]');
    const panels = group.querySelectorAll('[data-tab-panel]');
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.tabTarget;
        tabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        panels.forEach((panel) => {
          panel.classList.toggle('hidden', panel.dataset.tabPanel !== target);
        });
      });
    });
  });

  // Demo toast on load for visibility
  if (toastStack) {
    showToast('info', 'Mock: Connected to GitHub (branch main)');
    showToast('success', 'Mock: Synced Markdown and anchors updated');
  }
})();
