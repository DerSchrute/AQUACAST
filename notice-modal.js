/* v3.9.3 notification composer: UI relocation only; publishing remains in notifications.js. */
(()=>{'use strict';
 const $=id=>document.getElementById(id);let lastFocus=null;
 function refresh(){const loggedIn=!$('appShell').classList.contains('hidden');const admin=loggedIn&&$('accountDisplayRole').textContent.includes('Administrator');$('noticeCreatorFab').classList.toggle('hidden',!admin);if(!admin)close();}
 function open(){if($('noticeCreatorFab').classList.contains('hidden'))return;lastFocus=document.activeElement;window.AQUACAST_NOTIFY?.renderAdmin();$('noticeCreatorModal').classList.remove('hidden');document.body.classList.add('notice-modal-open');$('noticeCreatorModal').querySelector('.notice-close').focus();}
 function close(){$('noticeCreatorModal').classList.add('hidden');document.body.classList.remove('notice-modal-open');if(lastFocus?.isConnected)lastFocus.focus();lastFocus=null;}
 document.addEventListener('DOMContentLoaded',()=>{
  $('noticeCreatorFab').addEventListener('click',open);
  $('noticeCreatorModal').querySelectorAll('[data-notice-close]').forEach(el=>el.addEventListener('click',close));
  document.addEventListener('keydown',e=>{if($('noticeCreatorModal').classList.contains('hidden'))return;if(e.key==='Escape'){e.preventDefault();close();}else if(e.key==='Tab'){const els=[...$('noticeCreatorModal').querySelectorAll('button:not([disabled]),input:not([disabled]),select:not([disabled]),[contenteditable="true"]')].filter(el=>el.getClientRects().length);if(!els.length)return;const first=els[0],last=els[els.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
  const observer=new MutationObserver(refresh);observer.observe($('appShell'),{attributes:true,attributeFilter:['class']});observer.observe($('accountDisplayRole'),{childList:true,characterData:true,subtree:true});refresh();
 });
})();
