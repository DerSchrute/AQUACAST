/* AQUACAST v2.3 local-only demo announcements. Never use for real sensitive records. */
(() => {
'use strict';
const KEY='aquacast-v23-notices';
const READ='aquacast-v23-read';
const MESSAGES='aquacast-v24-station-messages';
const $=id=>document.getElementById(id);
const escapeHTML=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&quot;',"'":'&#39;'}[c]));
const stations=()=>window.AQUACAST_DATA.stations;
let session=null;
function load(key,fallback){try{return JSON.parse(localStorage.getItem(key)||'null')||fallback;}catch{return fallback;}}
function save(key,val){localStorage.setItem(key,JSON.stringify(val));}
function cleanHtml(html){
 const doc=new DOMParser().parseFromString('<div>'+html+'</div>','text/html');
 const allowed=new Set(['B','STRONG','I','EM','U','P','DIV','BR','H3','UL','OL','LI','A']);
 function walk(node){
  for(const child of [...node.childNodes]){
   if(child.nodeType===8){child.remove();continue;}
   if(child.nodeType===3)continue;
   if(child.nodeType!==1){child.remove();continue;}
   if(!allowed.has(child.tagName)){child.remove();continue;}
   for(const attr of [...child.attributes])child.removeAttribute(attr.name);
   if(child.tagName==='A'){
    const original=htmlLinks.get(child);
    if(original && /^https?:\/\//i.test(original)){child.setAttribute('href',original);child.setAttribute('target','_blank');child.setAttribute('rel','noopener noreferrer');}
   }
   walk(child);
  }
 }
 const htmlLinks=new Map();
 for(const a of doc.querySelectorAll('a'))htmlLinks.set(a,a.getAttribute('href'));
 const root=doc.body.firstElementChild;walk(root);
 return root.innerHTML.slice(0,16000);
}
function recipients(notice){return notice.audience==='all'?stations().map(s=>s.id):notice.recipients;}
function relevant(){return load(KEY,[]).filter(n=>session&&session.role==='user'&&recipients(n).includes(session.station));}
function inbox(){return session?.role==='admin'?load(MESSAGES,[]).map(m=>({...m,kind:'message',priority:m.category})):[];}
function anomalies(){
 if(!session||session.role!=='user')return [];
 return (window.AQUACAST_INVESTIGATIONS?.requestsFor(session.station)||[])
  .filter(r=>window.AQUACAST_ANOMALY_STATUS?.(r.flagId)==='Open')
  .map(r=>({id:'request-'+r.id,title:r.subject,priority:'Information request',body:escapeHTML(r.body),created:r.sentAt,kind:'anomaly',station:r.station}));
}
function flagFollowUps(){
 if(!session)return [];
 const inv=window.AQUACAST_INVESTIGATIONS;
 const flags=window.AQUACAST_DATA.anomalies;
 const list=[];
 for(const flag of flags){
  if(session.role==='user'&&flag.station!==session.station)continue;
  for(const m of inv?.messagesFor(flag.id)||[]){
   if(session.role==='admin'&&m.from!=='user')continue;
   if(session.role==='user'&&m.from!=='admin')continue;
   const station=stations().find(st=>st.id===flag.station)?.name||flag.station;
   list.push({id:m.id,kind:'flag-follow-up',flagId:flag.id,station:flag.station,created:m.sentAt,body:m.body,priority:'Flag correspondence',title:session.role==='admin'?`Follow up from ${station} flagged reading`:`Reply from Administration — ${flag.period}`});
  }
 }
 return list;
}
function allItems(){return [...flagFollowUps(),...anomalies(),...inbox(),...relevant().map(n=>({...n,kind:'notice'}))].sort((a,b)=>String(b.created).localeCompare(String(a.created)));}
function readKey(){return session?.role==='admin'?'admin':session?.station||'none';}
function readSet(){return new Set(load(READ,{})[readKey()]||[]);}
function markRead(id){const data=load(READ,{});const key=readKey();data[key]=[...new Set([...(data[key]||[]),id])];save(READ,data);refresh();}
function refresh(){
 const count=$('notificationCount'),items=$('notificationItems');
 if(!count||!items)return;
 if(!session){count.classList.add('hidden');items.innerHTML='';return;}
 const read=readSet(),list=allItems(),unread=list.filter(n=>!read.has(n.id)).length;
 count.textContent=unread>99?'99+':String(unread);count.classList.toggle('hidden',!unread);
 items.innerHTML=list.length?list.map(n=>`<button type="button" class="notification-item ${read.has(n.id)?'':'unread'}" data-notification-id="${escapeHTML(n.id)}"><span class="notice-type">${n.kind==='anomaly'?'⚠ Anomaly alert':n.kind==='message'?'✉ Station correspondence':n.kind==='flag-follow-up'?'↩ Flag follow-up':'✉ Administration'} · ${escapeHTML(n.priority||'Normal')}</span><strong>${escapeHTML(n.title)}</strong><small>${escapeHTML(n.created)}</small></button>`).join(''):'<p class="small-muted" style="padding:16px">No notifications for this account.</p>';
}
function setSession(next){session=next;const bell=$('notificationBell');if(bell)bell.classList.toggle('hidden',!next);$('notificationDropdown')?.classList.add('hidden');refresh();}
function renderAdmin(){
 const target=$('publishedNotices');if(!target||!session||session.role!=='admin')return;
 const list=load(KEY,[]);
 target.innerHTML=list.length?list.slice().reverse().map(n=>`<article class="notice-published"><strong>${escapeHTML(n.title)}</strong><p class="small-muted">${escapeHTML(n.created)} · ${n.audience==='all'?'All stations':n.recipients.length+' station(s)'} · ${escapeHTML(n.priority)}</p><div class="notice-body">${n.body}</div></article>`).join(''):'<p class="small-muted">No announcements have been published in this browser.</p>';
}
function renderSent(){
 const target=$('stationSentMessages');if(!target||session?.role!=='user')return;
 const list=load(MESSAGES,[]).filter(m=>m.station===session.station).slice().reverse();
 target.innerHTML=list.length?list.map(m=>`<article class="notice-published"><strong>${escapeHTML(m.title)}</strong><p class="small-muted">${escapeHTML(m.category)} · ${escapeHTML(m.created)} · Sent locally</p><div class="notice-body">${m.body}</div></article>`).join(''):'<p class="small-muted">No sent messages for this station in this browser.</p>';
}
function init(){
 $('notificationBell').addEventListener('click',()=>{
  const dd=$('notificationDropdown');dd.classList.toggle('hidden');$('notificationBell').setAttribute('aria-expanded',String(!dd.classList.contains('hidden')));refresh();
 });
 document.addEventListener('pointerdown',e=>{if(!$('notificationWrap').contains(e.target))$('notificationDropdown').classList.add('hidden');});
 $('notificationItems').addEventListener('click',e=>{
  const b=e.target.closest('[data-notification-id]');if(!b)return;
  const item=allItems().find(n=>n.id===b.dataset.notificationId);if(!item)return;
  markRead(item.id);$('notificationDropdown').classList.add('hidden');
  if(item.kind==='anomaly'){document.querySelector('[data-page="anomalies"]')?.click();return;}
  if(item.kind==='flag-follow-up'){window.AQUACAST_INVESTIGATIONS?.openCaseFromNotification(item.flagId);return;}
  $('accountDialogTitle').textContent=item.title;
  $('accountDialogBody').innerHTML=`<p class="small-muted">${item.kind==='message'?'From: '+escapeHTML(stations().find(st=>st.id===item.station)?.name||item.station)+' · '+escapeHTML(item.category):'Administration'} · ${escapeHTML(item.created)}</p><div class="notice-body">${item.body}</div>`;
  $('accountDialog').classList.remove('hidden');
 });
 $('notificationMarkAll').addEventListener('click',()=>{const data=load(READ,{});data[readKey()]=[...new Set([...(data[readKey()]||[]),...allItems().map(n=>n.id)])];save(READ,data);refresh();});
 document.querySelectorAll('[data-message-format]').forEach(button=>button.addEventListener('click',()=>{
  $('stationMessageBody').focus();const cmd=button.dataset.messageFormat;
  if(cmd==='createLink'){const url=prompt('Enter a complete HTTPS link:');if(url&&/^https:\/\/\S+$/i.test(url))document.execCommand('createLink',false,url);}
  else document.execCommand(cmd,false,button.dataset.value||null);
 }));
 $('stationMessageForm').addEventListener('submit',e=>{
  e.preventDefault();if(session?.role!=='user'||!session.station)return;
  const title=$('stationMessageSubject').value.trim(),body=cleanHtml($('stationMessageBody').innerHTML);
  if(!title||!$('stationMessageBody').textContent.trim()){$('stationMessageFeedback').textContent='Enter a subject and message.';return;}
  const list=load(MESSAGES,[]);
  list.push({id:'message-'+Date.now()+'-'+Math.random().toString(36).slice(2,8),station:session.station,title,body,category:$('stationMessageCategory').value,created:new Date().toLocaleString('en-PH')});
  save(MESSAGES,list);$('stationMessageSubject').value='';$('stationMessageBody').innerHTML='';
  $('stationMessageFeedback').textContent='Sent locally. Sign in as admin in this browser to see the incoming message.';renderSent();refresh();
 });
 $('noticeStations').innerHTML=stations().map(s=>`<option value="${escapeHTML(s.id)}">${escapeHTML(s.name)} · ${escapeHTML(s.province)}</option>`).join('');
 $('noticeAudience').addEventListener('change',e=>{$('noticeProvinceWrap').classList.toggle('hidden',e.target.value!=='province');$('noticeStationWrap').classList.toggle('hidden',e.target.value!=='stations');});
 document.querySelectorAll('[data-format]').forEach(button=>button.addEventListener('click',()=>{
  $('noticeBody').focus();
  const cmd=button.dataset.format;
  if(cmd==='createLink'){const url=prompt('Enter a complete HTTPS link:');if(url&&/^https:\/\/\S+$/i.test(url))document.execCommand('createLink',false,url);}
  else document.execCommand(cmd,false,button.dataset.value||null);
 }));
 $('noticeForm').addEventListener('submit',e=>{
  e.preventDefault();if(session?.role!=='admin')return;
  const title=$('noticeTitle').value.trim(),body=cleanHtml($('noticeBody').innerHTML);
  if(!title||!$('noticeBody').textContent.trim()){$('noticeFeedback').textContent='Enter a title and message.';return;}
  const audience=$('noticeAudience').value;
  const selected=audience==='all'?stations().map(s=>s.id):audience==='province'?stations().filter(s=>s.province===$('noticeProvince').value).map(s=>s.id):[...$('noticeStations').selectedOptions].map(o=>o.value);
  if(!selected.length){$('noticeFeedback').textContent='Select at least one station.';return;}
  const list=load(KEY,[]);
  const id='notice-'+Date.now()+'-'+Math.random().toString(36).slice(2,8);
  list.push({id,title,body,audience,recipients:selected,priority:$('noticePriority').value,created:new Date().toLocaleString('en-PH')});
  save(KEY,list);$('noticeBody').innerHTML='';$('noticeTitle').value='';$('noticeFeedback').textContent=`Published locally to ${selected.length} station(s). Sign out and sign in to a selected station in this browser to verify.`;renderAdmin();refresh();
 });
}
document.addEventListener('DOMContentLoaded',init);
window.AQUACAST_NOTIFY={setSession,refresh,renderAdmin,renderSent};
})();
