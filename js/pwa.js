/* PWA installation and offline status; never prompts installation automatically. */
(() => {
  'use strict';
  if (!('serviceWorker' in navigator) || !window.isSecureContext) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(error => console.warn('AQUACAST offline setup unavailable:', error));
  });
  let deferredInstall = null;
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredInstall = event;
    const button = document.getElementById('pwaInstall');
    if (button) button.hidden = false;
  });
  document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('pwaInstall');
    if (!button) return;
    button.addEventListener('click', async () => {
      if (!deferredInstall) return;
      const prompt = deferredInstall;
      deferredInstall = null;
      button.hidden = true;
      await prompt.prompt();
    });
  });
  window.addEventListener('appinstalled', () => { deferredInstall = null; });
})();
