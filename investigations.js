/* AQUACAST v2.6: browser-local investigation request workflow; no external email delivery. */
(()=>{'use strict';
 const KEY='aquacast-v26-investigation-requests';
 const THREAD='aquacast-v28-flag-correspondence';
 const $=id=>document.getElementById(id);
 const data=window.AQUACAST_DATA;
 const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let session=null,current=null,threadFlag=null;
 function all(){try{const v=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(v)?v:[];}catch{return [];}}
 function requestsFor(station){return all().filter(r=>r.station===station&&data.anomalies.some(a=>a.id===r.flagId&&a.station===station));}
 function latestRequest(id,station){return requestsFor(station).filter(r=>r.flagId===id).at(-1)||null;}
 function hasRequest(id,station){return !!latestRequest(id,station);}
 function replies(){try{const v=JSON.parse(localStorage.getItem(THREAD)||'[]');return Array.isArray(v)?v:[];}catch{return [];}}
 function messagesFor(id){return replies().filter(m=>m.flagId===id);}
 function flagById(id){return data.anomalies.find(a=>a.id===id);}
 function openThread(id){
  const flag=flagById(id);if(!flag||!session)return;
  if(session.role==='user'&&(flag.station!==session.station||!hasRequest(id,session.station)))return;
  if(session.role!=='admin'&&session.role!=='user')return;
  threadFlag=flag;
  const station=data.stations.find(st=>st.id===flag.station);
  $('flagCorrespondenceHeading').textContent=session.role==='admin'?'Station flag correspondence':'Send follow-up about flagged reading';
  $('flagCorrespondenceContext').textContent=`${station?.name||flag.station} · ${flag.period} · Flag ${flag.id} · ${window.AQUACAST_ANOMALY_STATUS?.(id)||'Open'}`;
  $('flagCorrespondenceLabel').querySelector('span').textContent=session.role==='admin'?'Reply to station':'Follow up to Administration';
  $('flagCorrespondenceSend').textContent=session.role==='admin'?'Send reply':'Send follow-up';
  $('flagGoToCase').classList.toggle('hidden',session.role!=='admin');
  $('flagCorrespondenceText').value='';$('flagCorrespondenceCounter').textContent='0 / 8000 characters';$('flagCorrespondenceFeedback').textContent='';
  const archived=['Reviewed','Dismissed'].includes(window.AQUACAST_ANOMALY_STATUS?.(id));
  $('flagCorrespondenceForm').classList.toggle('hidden',archived);
  $('flagCorrespondenceHeading').textContent=archived?'Archived flag correspondence':$('flagCorrespondenceHeading').textContent;
  renderThread();$('flagCorrespondenceModal').classList.remove('hidden');
  if(!archived)$('flagCorrespondenceText').focus();
 }
 function renderThread(){
  if(!threadFlag)return;
  const initial=requestsFor(threadFlag.station).filter(r=>r.flagId===threadFlag.id).map(r=>({from:'admin',body:r.body,subject:r.subject,at:r.sentAt,evidence:r.evidence}));
  const thread=[...initial,...messagesFor(threadFlag.id).map(r=>({from:r.from,body:r.body,at:r.sentAt}))].sort((a,b)=>String(a.at).localeCompare(String(b.at)));
  $('flagCorrespondenceHistory').innerHTML=thread.map(m=>`<article class="flag-thread-message ${m.from==='admin'?'from-admin':'from-station'}"><p class="small-muted"><strong>${m.from==='admin'?'Administration':'Station'}</strong> · ${esc(m.at)}</p>${m.subject?`<strong>${esc(m.subject)}</strong>`:''}<p class="investigation-message">${esc(m.body)}</p>${m.evidence?evidenceHTML(m.evidence):''}</article>`).join('')||'<p>No messages in this case.</p>';
 }
 function closeThread(){$('flagCorrespondenceModal').classList.add('hidden');threadFlag=null;}
 function sendReply(e){
  e.preventDefault();if(!threadFlag||!session)return;
  if(session.role==='user'&&(threadFlag.station!==session.station||!hasRequest(threadFlag.id,session.station)))return;
  if(window.AQUACAST_ANOMALY_STATUS?.(threadFlag.id)!=='Open'){$('flagCorrespondenceFeedback').textContent='This case is closed. Reopen it before sending another message.';return;}
  const body=$('flagCorrespondenceText').value.trim();if(!body)return;
  const item={id:'flagmsg-'+Date.now()+'-'+Math.random().toString(36).slice(2,8),flagId:threadFlag.id,station:threadFlag.station,from:session.role,body,sentAt:new Date().toISOString()};
  const list=replies();list.push(item);
  try{localStorage.setItem(THREAD,JSON.stringify(list));}catch(err){$('flagCorrespondenceFeedback').textContent='Could not save message. Check browser storage.';return;}
  $('flagCorrespondenceText').value='';$('flagCorrespondenceCounter').textContent='0 / 8000 characters';$('flagCorrespondenceFeedback').textContent='Message saved locally.';renderThread();refresh();window.AQUACAST_NOTIFY?.refresh();
 }
 // Deep-link from a flag correspondence notification to its case and open the reply window.
 function openCaseFromNotification(id){
  const flag=flagById(id);
  if(!flag||!session)return;
  if(session.role==='user'&&(flag.station!==session.station||!hasRequest(id,session.station)))return;
  if(session.role!=='admin'&&session.role!=='user')return;
  // Switch to Anomaly Monitoring before displaying the case correspondence modal.
  document.querySelector('[data-page="anomalies"]')?.click();
  if(session.role==='admin'){
   const stationSelect=$('globalStation');
   if(stationSelect&&stationSelect.value!==flag.station){
    stationSelect.value=flag.station;
    stationSelect.dispatchEvent(new Event('change',{bubbles:true}));
   }
   // Province tabs can hide a matching flag even with the correct station selected.
   document.querySelector('[data-region="all"]')?.click();
  }
  const status=window.AQUACAST_ANOMALY_STATUS?.(id);
  const tabId=status==='Open'?(session.role==='admin'?'anomalyReviewTab':'anomalyActiveTab'):'anomalyArchiveTab';
  $(tabId)?.click();
  window.AQUACAST_REFRESH_ANOMALIES?.();
  const card=[...document.querySelectorAll('[data-flag-card]')].find(el=>el.dataset.flagCard===id);
  card?.classList.add('anomaly-notification-focus');
  // Keep the case visible in the background; avoid scrolling after opening the modal.
  card?.scrollIntoView({block:'center'});
  openThread(id);
 }
 function goToCase(id){
  const flag=flagById(id);if(session?.role!=='admin'||!flag)return;
  closeThread();document.querySelector('[data-page="anomalies"]')?.click();
  const status=window.AQUACAST_ANOMALY_STATUS?.(id);
  document.getElementById(status==='Open'?'anomalyReviewTab':'anomalyArchiveTab')?.click();
  const stationSelect=document.getElementById('globalStation');
  if(stationSelect&&stationSelect.value!==flag.station){stationSelect.value=flag.station;stationSelect.dispatchEvent(new Event('change',{bubbles:true}));}
  window.AQUACAST_REFRESH_ANOMALIES?.();
  document.querySelector(`[data-flag-card="${CSS.escape(id)}"]`)?.scrollIntoView({behavior:'smooth',block:'center'});
 }
 function evidenceHTML(records){
  if(!records.length)return '<p class="small-muted">No historical records are available for this station.</p>';
  return `<div class="table-scroll"><table class="investigation-table"><thead><tr><th>Reporting period</th><th>Consumption (m³)</th></tr></thead><tbody>${records.map(r=>`<tr class="${r.flagged?'investigation-flagged-row':''}"><td>${esc(r.period)}${r.flagged?' <strong class="investigation-flag-label">FLAGGED</strong>':''}</td><td>${esc(r.consumption)}</td></tr>`).join('')}</tbody></table></div>`;
 }
 function close(){$('investigationComposer').classList.add('hidden');current=null;}
 function open(id){
  if(session?.role!=='admin')return;
  const a=data.anomalies.find(x=>x.id===id);if(!a||window.AQUACAST_ANOMALY_STATUS?.(id)!=='Open')return;
  current=a;
  const station=data.stations.find(s=>s.id===a.station);
  $('investigationRecipient').textContent=`To: ${station?.name||a.station} (${a.station}) · Flag ${a.id} · ${a.period}`;
  const followUp=hasRequest(a.id,a.station);
  $('investigationHeading').textContent=followUp?'Request follow-up from station':'Request information from station';
  $('investigationSubject').value=followUp?`Follow-up: unusual water consumption (${a.period})`:`Request for clarification — unusual water consumption (${a.period})`;
  $('investigationText').value=followUp?`Good day,\n\nWe are following up on the information request concerning the unusual water consumption reading for ${station?.name||a.station} during ${a.period} (${a.value} m³).\n\nPlease provide an update or any additional explanation and supporting information through the appropriate official channels. The relevant consumption history, including the flagged month, is attached below for reference.\n\nThank you,\nAQUACAST Administration`:`Good day,\n\nAQUACAST has flagged an unusual water consumption reading for ${station?.name||a.station} during ${a.period}: ${a.value} m³.\n\nPlease review the attached historical consumption records and provide an explanation for the variation. Kindly indicate whether there were leaks, maintenance activities, meter-reading adjustments, increased operational demand, or other relevant circumstances. If applicable, please provide supporting information through the established official communication channels.\n\nThis is a request for verification and does not establish that any irregularity has occurred.\n\nThank you,\nAQUACAST Administration`;
  $('investigationEvidence').innerHTML=evidenceHTML(evidence(a));
  $('investigationFeedback').textContent='';
  $('investigationComposer').classList.remove('hidden');$('investigationSubject').focus();
 }
 function evidence(a){
  const ix=data.periods.indexOf(a.period);
  const previous=data.records.filter(r=>r.station===a.station&&(ix<0||data.periods.indexOf(r.period)<ix))
   .sort((x,y)=>data.periods.indexOf(x.period)-data.periods.indexOf(y.period)).slice(-6)
   .map(r=>({period:r.period,consumption:r.consumption,flagged:false}));
  const actual=data.records.find(r=>r.station===a.station&&r.period===a.period);
  // Include the flagged reading even if the sample record itself is missing.
  previous.push({period:a.period,consumption:actual?.consumption??a.value,flagged:true});
  return previous;
 }
 function setSession(v){session=v;if(!v){close();closeThread();}}
 function refresh(){window.AQUACAST_REFRESH_ANOMALIES?.();}
 function refreshThread(){if(threadFlag&&!$('flagCorrespondenceModal').classList.contains('hidden')){renderThread();$('flagCorrespondenceContext').textContent=`${data.stations.find(st=>st.id===threadFlag.station)?.name||threadFlag.station} · ${threadFlag.period} · Flag ${threadFlag.id} · ${window.AQUACAST_ANOMALY_STATUS?.(threadFlag.id)||'Open'}`;}}
 document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('[data-investigation-close]').forEach(b=>b.addEventListener('click',close));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('investigationComposer').classList.contains('hidden'))close();});
  document.querySelectorAll('[data-flag-close]').forEach(b=>b.addEventListener('click',closeThread));
  $('flagCorrespondenceForm').addEventListener('submit',sendReply);
  $('flagCorrespondenceText').addEventListener('input',e=>{$('flagCorrespondenceCounter').textContent=`${e.target.value.length} / 8000 characters`;});
  $('flagGoToCase').addEventListener('click',()=>{if(threadFlag)goToCase(threadFlag.id);});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('flagCorrespondenceModal').classList.contains('hidden'))closeThread();});
  $('investigationForm').addEventListener('submit',e=>{
   e.preventDefault();if(session?.role!=='admin'||!current)return;
   const subject=$('investigationSubject').value.trim(),body=$('investigationText').value.trim();
   if(!subject||!body)return;
   const record={id:'ir-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),flagId:current.id,station:current.station,subject,body,evidence:evidence(current),sentAt:new Date().toISOString()};
   const list=all();list.push(record);
   try{localStorage.setItem(KEY,JSON.stringify(list));}catch(err){$('investigationFeedback').textContent='Unable to save the request. Check browser storage.';return;}
   close();refresh();
  });
 });
 window.AQUACAST_INVESTIGATIONS={setSession,open,hasRequest,latestRequest,requestsFor,evidenceHTML,refresh,refreshThread,openThread,goToCase,openCaseFromNotification,messagesFor};
})();