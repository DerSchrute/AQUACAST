/* v3.6 transparency: explanatory context, not a validated anomaly detector; browser-local audit only. */
(()=>{'use strict';
 const KEY='aquacast-v36-audit-events',data=window.AQUACAST_DATA;
 const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const get=(key,fallback)=>{try{const x=JSON.parse(localStorage.getItem(key)||'null');return x??fallback;}catch{return fallback;}};
 function events(id){
  const stored=get(KEY,[]);const requests=get('aquacast-v26-investigation-requests',[]);const messages=get('aquacast-v28-flag-correspondence',[]);
  return [
   ...(Array.isArray(stored)?stored:[]).filter(x=>x.flagId===id).map(x=>({...x,source:'local action'})),
   ...(Array.isArray(requests)?requests:[]).filter(x=>x.flagId===id).map(x=>({at:x.sentAt,actor:'Administration',label:'Investigation request sent',detail:x.subject||'',source:'correspondence'})),
   ...(Array.isArray(messages)?messages:[]).filter(x=>x.flagId===id).map(x=>({at:x.sentAt,actor:x.from==='admin'?'Administration':'Station',label:'Correspondence message sent',detail:'',source:'correspondence'}))
  ].sort((a,b)=>String(a.at||'').localeCompare(String(b.at||'')));
 }
 function record(flagId,actor,label,detail=''){
  const list=get(KEY,[]);if(!Array.isArray(list))return;
  list.push({flagId,actor,label,detail,at:new Date().toISOString()});
  try{localStorage.setItem(KEY,JSON.stringify(list));window.dispatchEvent(new CustomEvent('aquacast-audit-changed'));}catch(e){console.warn('Audit demo storage unavailable',e);}
 }
 function explanation(a){
  const prior=data.records.filter(r=>r.station===a.station&&data.periods.indexOf(r.period)>=0&&data.periods.indexOf(r.period)<data.periods.indexOf(a.period)).map(r=>r.consumption).filter(Number.isFinite);
  const sample=prior.slice(-6).sort((x,y)=>x-y),n=sample.length;
  const med=n?(n%2?sample[(n-1)/2]:(sample[n/2-1]+sample[n/2])/2):null;
  const diff=med!==null&&med>0?(a.value-med)/med*100:null;
  const manual=String(a.id).startsWith('MANUAL-');
  const origin=manual?'Administrator-initiated flag':'Preloaded demonstration flag';
  const baseline=med===null?'No preceding monthly readings available for this station.':`Previous ${n} month${n===1?'':'s'} median: ${med.toFixed(1)} m³. Observed: ${Number(a.value).toFixed(1)} m³.${diff===null?'':` Deviation: ${diff>=0?'+':''}${diff.toFixed(1)}%.`}`;
  return `<details class="anomaly-explain"><summary>Why was this flagged?</summary><div class="anomaly-detail-body"><p><strong>Source:</strong> ${esc(origin)}</p><p><strong>Recorded reason:</strong> ${esc(a.reason)}</p><p><strong>Historical context:</strong> ${esc(baseline)}</p><p class="small-muted">The rolling median is descriptive context only. It is not the detection threshold or proof of an error. All demonstration flags require human verification; no NOPPO data is used.</p></div></details>`;
 }
 function history(a){
  const list=events(a.id);
  return `<details class="anomaly-audit"><summary>Case history (${list.length})</summary><div class="anomaly-detail-body">${list.length?`<ol class="audit-timeline">${list.map(x=>`<li><strong>${esc(x.label)}</strong><div>${esc(x.actor||'Unknown')} · ${esc(x.at||'Time unavailable')}</div>${x.detail?`<div>${esc(x.detail)}</div>`:''}</li>`).join('')}</ol>`:'<p class="small-muted">No dated case actions recorded yet. Pre-existing demo flags may predate this history feature.</p>'}<p class="small-muted">Browser-local demonstration history; not tamper-proof or a complete institutional audit log.</p></div></details>`;
 }
 window.AQUACAST_TRACE={record,explanation,history};
})();
