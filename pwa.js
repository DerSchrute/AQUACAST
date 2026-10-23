/* PWA install from Account menu; available only when browser supports an install prompt. */
(()=>{'use strict';let deferredInstall=null;
 if('serviceWorker' in navigator&&window.isSecureContext)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(error=>console.warn('AQUACAST offline setup unavailable:',error)));
 window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();deferredInstall=event;});
 window.addEventListener('appinstalled',()=>{deferredInstall=null;});
 document.addEventListener('DOMContentLoaded',()=>{const button=document.getElementById('pwaInstall');if(!button)return;button.addEventListener('click',async()=>{
  if(!deferredInstall){const title=document.getElementById('accountDialogTitle'),body=document.getElementById('accountDialogBody');title.textContent='Install AQUACAST';body.innerHTML='<p>Installation is not currently offered by this browser. On supported browsers, use the browser menu and select <strong>Install app</strong> or <strong>Add to Home screen</strong>.</p><p class="small-muted">AQUACAST is a demonstration web app. Browser installation does not create a shared database.</p>';document.getElementById('accountDialog').classList.remove('hidden');document.getElementById('accountMenu').classList.add('hidden');document.getElementById('accountTrigger').setAttribute('aria-expanded','false');return;}
  const prompt=deferredInstall;deferredInstall=null;document.getElementById('accountMenu').classList.add('hidden');document.getElementById('accountTrigger').setAttribute('aria-expanded','false');await prompt.prompt();
 });});
})();
