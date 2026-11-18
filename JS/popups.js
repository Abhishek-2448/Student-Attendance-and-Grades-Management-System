/* Reusable custom notifications and confirmation dialogs */
(function () {
  const icons = { success: '✓', error: '✕', warning: '!', info: 'i' };

  function ensurePopupStyles() {
    if (document.getElementById('custom-popup-styles')) return;
    const style = document.createElement('style');
    style.id = 'custom-popup-styles';
    style.textContent = `
      .app-toast-container{position:fixed;top:22px;right:22px;z-index:10000;display:flex;flex-direction:column;gap:12px;width:min(380px,calc(100vw - 32px));pointer-events:none}
      .app-toast{display:flex;align-items:center;gap:12px;padding:15px 17px;background:#fff;border:1px solid #e5e7eb;border-left:5px solid #2563eb;border-radius:10px;box-shadow:0 12px 35px rgba(15,23,42,.16);font:14px/1.45 Arial,sans-serif;color:#1f2937;animation:appToastIn .22s ease both;pointer-events:auto}
      .app-toast.success{border-left-color:#16a34a}.app-toast.error{border-left-color:#dc2626}.app-toast.warning{border-left-color:#d97706}
      .app-toast-icon{width:27px;height:27px;flex:0 0 27px;border-radius:50%;display:grid;place-items:center;background:#dbeafe;color:#1d4ed8;font-weight:700;font-size:16px}
      .app-toast.success .app-toast-icon{background:#dcfce7;color:#15803d}.app-toast.error .app-toast-icon{background:#fee2e2;color:#b91c1c}.app-toast.warning .app-toast-icon{background:#fef3c7;color:#b45309}
      .app-toast-message{flex:1}.app-toast-close{border:0;background:transparent;color:#64748b;font-size:20px;cursor:pointer;padding:0 2px}
      .app-modal-backdrop{position:fixed;inset:0;z-index:10001;background:rgba(15,23,42,.52);display:grid;place-items:center;padding:18px;animation:appFadeIn .15s ease}
      .app-confirm-modal{width:min(420px,100%);background:#fff;border-radius:14px;padding:25px;box-shadow:0 22px 60px rgba(0,0,0,.25);font-family:Arial,sans-serif;color:#1f2937}
      .app-confirm-modal h2{font-size:19px;margin:0 0 10px}.app-confirm-modal p{font-size:14px;line-height:1.55;color:#64748b;margin:0 0 24px}
      .app-confirm-actions{display:flex;justify-content:flex-end;gap:10px}.app-confirm-actions button{border:0;border-radius:7px;padding:10px 17px;font-weight:600;cursor:pointer;font-size:14px}
      .app-confirm-cancel{background:#f1f5f9;color:#334155}.app-confirm-delete{background:#dc2626;color:#fff}.app-confirm-delete:hover{background:#b91c1c}
      @keyframes appToastIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}@keyframes appFadeIn{from{opacity:0}to{opacity:1}}
      @media(max-width:480px){.app-toast-container{top:12px;right:12px;width:calc(100vw - 24px)}.app-confirm-modal{padding:21px}}
    `;
    document.head.appendChild(style);
  }

  window.showToast = function (message, type = 'info', duration = 3500) {
    ensurePopupStyles();
    let container = document.querySelector('.app-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'app-toast-container';
      container.setAttribute('aria-live', 'polite');
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `app-toast ${type}`;
    const icon = document.createElement('span');
    icon.className = 'app-toast-icon';
    icon.textContent = icons[type] || icons.info;
    const text = document.createElement('span');
    text.className = 'app-toast-message';
    text.textContent = message;
    const close = document.createElement('button');
    close.className = 'app-toast-close';
    close.type = 'button';
    close.setAttribute('aria-label', 'Close notification');
    close.textContent = '×';
    close.addEventListener('click', () => toast.remove());
    toast.append(icon, text, close);
    container.appendChild(toast);
    window.setTimeout(() => toast.remove(), duration);
  };

  window.confirmPopup = function (message, title = 'Are you sure?', confirmText = 'Delete') {
    ensurePopupStyles();
    return new Promise(resolve => {
      const backdrop = document.createElement('div');
      backdrop.className = 'app-modal-backdrop';
      const modal = document.createElement('section');
      modal.className = 'app-confirm-modal';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      const heading = document.createElement('h2');
      heading.textContent = title;
      const description = document.createElement('p');
      description.textContent = message;
      const actions = document.createElement('div');
      actions.className = 'app-confirm-actions';
      const cancel = document.createElement('button');
      cancel.className = 'app-confirm-cancel';
      cancel.type = 'button';
      cancel.textContent = 'Cancel';
      const confirm = document.createElement('button');
      confirm.className = 'app-confirm-delete';
      confirm.type = 'button';
      confirm.textContent = confirmText;
      const finish = value => { backdrop.remove(); resolve(value); };
      cancel.addEventListener('click', () => finish(false));
      confirm.addEventListener('click', () => finish(true));
      backdrop.addEventListener('click', event => { if (event.target === backdrop) finish(false); });
      const onKey = event => { if (event.key === 'Escape') { finish(false); document.removeEventListener('keydown', onKey); } };
      document.addEventListener('keydown', onKey);
      confirm.addEventListener('click', () => document.removeEventListener('keydown', onKey));
      cancel.addEventListener('click', () => document.removeEventListener('keydown', onKey));
      actions.append(cancel, confirm);
      modal.append(heading, description, actions);
      backdrop.appendChild(modal);
      document.body.appendChild(backdrop);
      confirm.focus();
    });
  };
})();
