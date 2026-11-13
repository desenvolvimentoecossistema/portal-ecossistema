(function () {
  let sequence = 0;
  const eye = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>';

  async function refresh() {
    const current = ++sequence;
    if (/^\/(login|auth|aceite)(\/|$)/.test(location.pathname)) return;
    let state;
    try {
      const response = await fetch('/api/view-mode', {credentials: 'same-origin', cache: 'no-store'});
      if (!response.ok) return;
      state = await response.json();
    } catch { return; }
    if (current !== sequence) return;
    document.querySelectorAll('.portal-legal-footer').forEach(footer => {
      footer.querySelector('[data-portal-view]')?.remove();
      if (!state.canSwitch) return;
      const group = document.createElement('div');
      group.className = 'portal-view-controls';
      group.setAttribute('data-portal-view', '');
      if (state.mode === 'visitor') {
        const status = document.createElement('span');
        status.className = 'portal-view-status';
        status.textContent = 'Visualização de visitante';
        group.append(status);
      }
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'portal-view-toggle';
      button.setAttribute('aria-pressed', String(state.mode === 'visitor'));
      button.innerHTML = eye;
      button.append(document.createTextNode(state.mode === 'visitor' ? 'Voltar à visão de administrador' : 'Ver como visitante'));
      button.addEventListener('click', async () => {
        document.querySelectorAll('.portal-view-toggle').forEach(control => { control.disabled = true; });
        group.querySelector('[role="alert"]')?.remove();
        try {
          const response = await fetch('/api/view-mode', {
            method: 'POST', credentials: 'same-origin', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({mode: state.mode === 'visitor' ? 'admin' : 'visitor'}),
          });
          if (!response.ok) throw Error('view mode');
          location.reload();
        } catch {
          document.querySelectorAll('.portal-view-toggle').forEach(control => { control.disabled = false; });
          const error = document.createElement('span');
          error.setAttribute('role', 'alert');
          error.textContent = 'Não foi possível alternar a visualização. Tente novamente.';
          group.append(error);
        }
      });
      group.append(button);
      footer.append(group);
    });
  }
  document.addEventListener('portal:footer-ready', refresh);
  window.addEventListener('pageshow', event => { if (event.persisted) location.reload(); });
  refresh();
})();
