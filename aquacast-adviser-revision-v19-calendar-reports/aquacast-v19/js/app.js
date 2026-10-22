/* AQUACAST v0.9: offline static prototype. Client-side demo login is not security. */
(() => {
  'use strict';
  const data = window.AQUACAST_DATA;
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const state = {
    page:'dashboard', role:'user', station:'all', userStation:null, sortBy:'period', sortDirection:1,
    region:'all', anomalyStatuses:Object.fromEntries(data.anomalies.map(a=>[a.id,a.status])),
    tariffs:JSON.parse(JSON.stringify(data.defaultTariffs)),
    tariffVersions:Object.fromEntries(data.stations.map(s=>[s.id,[{...data.defaultTariffs[s.id], effective:data.defaultTariffs[s.id].effective||'2026-01-01'}]]))
  };
  const number = n => new Intl.NumberFormat('en-PH',{maximumFractionDigits:1}).format(n);
  const money = n => new Intl.NumberFormat('en-PH',{style:'currency',currency:'PHP',minimumFractionDigits:2,maximumFractionDigits:2}).format(n);
  const esc = v => String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const periodIndex = p => data.periods.indexOf(p);
  const stationName = id => data.stations.find(s=>s.id===id)?.name || id;
  const stationAccount = username => data.stations.find(s=>s.username===username);
  function populateStationSelector(){ const sel=$('#globalStation'); sel.innerHTML='<option value="all">All stations</option>'+data.stations.map(s=>`<option value="${s.id}">${s.name} · ${s.province}</option>`).join(''); }
  const activeStation = () => state.role==='user' && state.userStation ? state.userStation : state.station;
  const scopedRecords = () => data.records.filter(r=>activeStation()==='all'||r.station===activeStation());
  const scopedAnomalies = () => data.anomalies.filter(a=>(activeStation()==='all'||a.station===activeStation())&&(state.region==='all'||a.region===state.region));
  const totalFor = records => records.reduce((sum,r)=>sum+r.consumption,0);
  const tariffFromSelection = selection => {
    const schedule=data.baciwaTariffSchedule;
    const classification=schedule.classifications[selection.classification] || schedule.classifications.residential;
    return {classification:selection.classification,size:selection.size,minimum:classification.minimumBySize[selection.size] ?? classification.minimumBySize['1/2'],tier1:classification.rates[0],tier2:classification.rates[1],tier3:classification.rates[2],tier4:classification.rates[3],tier5:classification.rates[4],tier6:classification.rates[5],effective:selection.effective||'2026-01-01'};
  };
  const tariffAt = (station, period) => {
    const versions = (state.tariffVersions[station]||[]).slice().sort((a,b)=>a.effective.localeCompare(b.effective));
    const monthDate = `2026-${String(periodIndex(period)+1).padStart(2,'0')}-01`;
    const selected=versions.filter(v=>v.effective<=monthDate).at(-1) || versions[0] || state.tariffs[station];
    return tariffFromSelection(selected);
  };
  function estimateBill(q,t) {
    if (!t) return 0;
    return t.minimum + Math.min(Math.max(q-10,0),10)*t.tier1 + Math.min(Math.max(q-20,0),10)*t.tier2 + Math.min(Math.max(q-30,0),20)*t.tier3 + Math.min(Math.max(q-50,0),20)*t.tier4 + Math.min(Math.max(q-70,0),30)*t.tier5 + Math.max(q-100,0)*t.tier6;
  }
  function setPage(page) {
    if (!$(`#page-${page}`)) return;
    if (['admin','evaluation'].includes(page) && state.role!=='admin') return;
    state.page=page;
    $$('.page-section').forEach(el=>el.classList.toggle('active',el.id===`page-${page}`));
    $$('.nav-item').forEach(el=>el.classList.toggle('active',el.dataset.page===page));
    $('#breadcrumbCurrent').textContent=$(`#page-${page}`).dataset.title;
    document.title=`AQUACAST | ${$(`#page-${page}`).dataset.title}`;
    $('#sidebar').classList.remove('open');
    document.dispatchEvent(new CustomEvent('aquacast:page',{detail:{page,station:activeStation(),role:state.role}}));
    if(page==='dashboard' && window.AQUACAST_CHARTS) requestAnimationFrame(()=>window.AQUACAST_CHARTS.redraw()); if(page==='forecasting') { renderForecast(); requestAnimationFrame(()=>window.AQUACAST_CHARTS?.redraw()); } if(page==='reports') renderReport(); if(page==='admin') renderAdmin();
  }
  function renderDashboard() {
    const records=scopedRecords();
    const selectedCount=Number($('#dashboardPeriod').value||6);
    const periods=data.periods.filter(p=>records.some(r=>r.period===p)).slice(-selectedCount);
    const selected=records.filter(r=>periods.includes(r.period));
    const monthly=periods.map(p=>({period:p,total:totalFor(selected.filter(r=>r.period===p))}));
    $('#metricTotal').textContent=`${number(totalFor(selected))} m³`;
    $('#metricAverage').textContent=`${number(totalFor(selected)/Math.max(periods.length,1))} m³`;
    $('#metricRecords').textContent=number(selected.length);
    $('#metricFlags').textContent=number(scopedAnomalies().filter(a=>periods.includes(a.period)&&state.anomalyStatuses[a.id]==='Open').length);
    $('#forecastPreviewValue').textContent=`${number(data.illustrativeForecast['Jan 2027'])} m³`;
    const review=scopedAnomalies().filter(a=>state.anomalyStatuses[a.id]==='Open').slice(0,2);
    $('#dashboardReviewList').innerHTML=review.length?review.map(a=>`<div class="review-item"><div class="review-symbol">!</div><div class="review-details"><strong>${esc(a.station)} · ${esc(a.period)}</strong><p>${esc(a.reason)}</p><div class="review-meta">${number(a.value)} m³ · ${esc(state.anomalyStatuses[a.id])}</div></div></div>`).join(''):'<p class="small-muted">No open sample flags for this station filter.</p>';
    if(window.AQUACAST_CHARTS) window.AQUACAST_CHARTS.renderDashboard(monthly.map(x=>x.period),monthly.map(x=>x.total));
  }
  function initRecordFilters() {
    const opts=data.periods.map(p=>`<option value="${esc(p)}">${esc(p)}</option>`).join('');
    $('#recordPeriod').insertAdjacentHTML('beforeend',opts);
  }
  function filteredRecords() {
    const search=$('#recordSearch').value.trim().toLowerCase(), period=$('#recordPeriod').value, status=$('#recordStatus').value;
    return scopedRecords().filter(r=>(!search||`${r.station} ${stationName(r.station)} ${r.period}`.toLowerCase().includes(search))&&(period==='all'||r.period===period)&&(status==='all'||r.status===status))
      .sort((a,b)=>{let cmp;if(state.sortBy==='period')cmp=periodIndex(a.period)-periodIndex(b.period);else if(state.sortBy==='station')cmp=a.station.localeCompare(b.station);else cmp=a.consumption-b.consumption;return cmp*state.sortDirection;});
  }
  function renderRecords() {
    const records=filteredRecords(); $('#recordCount').textContent=`Showing ${records.length} of ${scopedRecords().length} records in the current station scope`;
    $('#recordsTableBody').innerHTML=records.map(r=>`<tr><td>${esc(r.period)}</td><td><span class="record-id">${esc(r.station)}</span><small class="station-subname">${esc(stationName(r.station))}</small></td><td>${number(r.consumption)}</td><td>m³</td><td><span class="table-status ${r.status==='Flagged'?'flagged':'normal'}">${esc(r.status)}</span></td></tr>`).join('');
    $('#recordsEmpty').classList.toggle('hidden',!records.length);
  }
  function renderForecast() {
    const entries=Object.entries(data.illustrativeForecast).slice(0,Number($('#forecastHorizon').value||3));
    let scale=1;
    if(activeStation()!=='all'){ const sample=data.records.filter(r=>r.station===activeStation()); const avg=sample.reduce((a,r)=>a+r.consumption,0)/Math.max(sample.length,1); scale=avg/112; }
    const vals=entries.map(([,v])=>Math.round(v*scale));
    if(window.AQUACAST_CHARTS) window.AQUACAST_CHARTS.renderFutureForecast(entries.map(([p])=>p),vals);
  }
  function renderAnomalies() {
    const all=scopedAnomalies(), open=all.filter(a=>state.anomalyStatuses[a.id]==='Open').length;
    $('#anomalyOpenCount').textContent=`${open} open item${open===1?'':'s'}`;
    $('#anomalyNavCount').textContent=String(all.filter(a=>state.anomalyStatuses[a.id]==='Open').length);
    $$('.region-tab').forEach(b=>b.classList.toggle('active',b.dataset.region===state.region));
    $('#anomalyList').innerHTML=all.length?all.map(a=>{const status=state.anomalyStatuses[a.id],cls=status==='Reviewed'?'success':status==='Dismissed'?'neutral':'warning';return `<article class="anomaly-card"><div class="anomaly-indicator">!</div><div class="anomaly-content"><div class="anomaly-title-row"><h3>${esc(a.station)} · ${esc(a.period)}</h3><span class="status-pill ${cls}">${esc(status)}</span></div><p>${esc(a.reason)} This flag is illustrative and should be checked against operational context before any conclusion is made.</p><div class="anomaly-meta"><span>ID: ${esc(a.id)}</span><span>${esc(a.region)}</span><span>Value: ${number(a.value)} m³</span></div></div><div class="anomaly-actions"><label class="sr-only" for="status-${esc(a.id)}">Review status for ${esc(a.id)}</label><select id="status-${esc(a.id)}" data-anomaly-status="${esc(a.id)}"><option ${status==='Open'?'selected':''}>Open</option><option ${status==='Reviewed'?'selected':''}>Reviewed</option><option ${status==='Dismissed'?'selected':''}>Dismissed</option></select><button data-reset-anomaly="${esc(a.id)}">Reset</button></div></article>`;}).join(''):'<article class="panel"><p>No sample anomaly flags for this region and station selection. This does not imply that real-world anomalies are absent.</p></article>';
  }
  const reportPeriodKey = p => {const d=new Date(`${p} 01`);return Number.isNaN(d.getTime())?null:`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;};
  function initReportCalendar() {
    const keys=data.periods.map(reportPeriodKey).filter(Boolean).sort();
    const first=keys[0],last=keys.at(-1);
    if(!first||!last)return;
    $('#reportYear').min=first.slice(0,4);$('#reportYear').max=last.slice(0,4);$('#reportYear').value=last.slice(0,4);
    $('#reportMonth').min=first;$('#reportMonth').max=last;$('#reportMonth').value=last;
  }
  function renderReport() {
    const view=$('#reportView').value;
    const year=$('#reportYear').value;
    const month=$('#reportMonth').value;
    const selectedPeriods=data.periods.filter(p=>{const key=reportPeriodKey(p);return key && (view==='year'?key.startsWith(`${year}-`):key===month);});
    const records=scopedRecords().filter(r=>selectedPeriods.includes(r.period));
    const groups=selectedPeriods.map(p=>{const rows=records.filter(r=>r.period===p);return {period:p,count:rows.length,total:totalFor(rows),flags:rows.filter(r=>r.status==='Flagged').length,cost:rows.reduce((sum,r)=>sum+estimateBill(r.consumption,tariffAt(r.station,r.period)),0)};}).filter(g=>g.count);
    const total=totalFor(records),cost=records.reduce((sum,r)=>sum+estimateBill(r.consumption,tariffAt(r.station,r.period)),0);
    const label=view==='year'?`Year ${year}`:(selectedPeriods[0]||month);
    $('#reportYearLabel').classList.toggle('hidden',view!=='year');
    $('#reportMonthLabel').classList.toggle('hidden',view!=='month');
    $('#reportPeriodHint').textContent=view==='year'?`Yearly report · ${year} · ${groups.length} month(s) with records`:`Monthly report · ${label}`;
    $('#reportGenerated').textContent=`Generated from fictional local data · ${activeStation()==='all'?'All stations':stationName(activeStation())} · ${label}`;
    $('#reportMetrics').innerHTML=`<div class="report-stat"><span>Total sample consumption</span><strong>${number(total)} m³</strong></div><div class="report-stat"><span>Estimated cost (BACIWA reference tariff)</span><strong>${money(cost)}</strong><small>Tiered tariff estimate · reference schedule</small></div><div class="report-stat"><span>Records included</span><strong>${number(records.length)}</strong></div><div class="report-stat"><span>Flagged records</span><strong>${number(records.filter(r=>r.status==='Flagged').length)}</strong></div>`;
    $('#reportTableBody').innerHTML=groups.length?groups.map(g=>`<tr><td>${esc(g.period)}</td><td>${g.count}</td><td>${number(g.total)} m³</td><td>${money(g.cost)}</td><td>${g.flags}</td></tr>`).join(''):'<tr><td colspan="5" class="empty-state">No records are available for the selected period and station.</td></tr>';
  }
  function renderAdmin() {
    if(state.role!=='admin') return;
    const schedule=data.baciwaTariffSchedule;
    $('#adminTariffGrid').innerHTML=data.stations.filter(s=>state.station==='all'||s.id===state.station).map(s=>{const t=state.tariffs[s.id];const resolved=tariffFromSelection(t);return `<form class="panel tariff-card" data-tariff-form="${s.id}"><div class="panel-heading"><div><h2>${esc(s.name)}</h2><p>${esc(s.id)} · BACIWA reference schedule</p></div></div><label>Customer classification<select name="classification">${Object.entries(schedule.classifications).map(([key,c])=>`<option value="${key}" ${t.classification===key?'selected':''}>${esc(c.label)}</option>`).join('')}</select></label><label>Connection/meter size<select name="size">${schedule.sizes.map(z=>`<option value="${z.value}" ${t.size===z.value?'selected':''}>${esc(z.label)}</option>`).join('')}</select></label><label>Tariff effective date<input name="effective" type="date" value="${esc(t.effective||'2026-01-01')}" required></label><div class="tariff-summary"><div><span>Minimum charge · first 10 m³</span><strong>${money(resolved.minimum)}</strong></div>${[[ '11–20 m³',resolved.tier1],['21–30 m³',resolved.tier2],['31–50 m³',resolved.tier3],['51–70 m³',resolved.tier4],['71–100 m³',resolved.tier5],['Above 100 m³',resolved.tier6]].map(([label,rate])=>`<div><span>${label}</span><strong>${money(rate)}/m³</strong></div>`).join('')}</div><p class="small-muted">Rates are transcribed from the BACIWA table supplied by the user. This selection is a prototype assumption; verify provider, category, meter size, effective date, and other bill charges. Changes are held in memory and reset on refresh.</p><button class="primary-button" type="submit">Save tariff selection</button></form>`;}).join('');
  }
  function initLogin() {
    const form=$('#loginForm'), username=$('#loginUsername'), password=$('#loginPassword'), error=$('#loginError');
    form.addEventListener('submit',e=>{e.preventDefault();const u=username.value.trim().toLowerCase(),p=password.value;let role='',station=null;if(u==='admin'&&p==='admin123')role='admin';else if(u==='evaluator'&&p==='aquacast123')role='admin';else {station=stationAccount(u);if(station&&p===station.password)role='user';else if(u==='user'&&p==='user123'){role='user';station=data.stations[0];}}if(!role){error.classList.remove('hidden');password.setAttribute('aria-invalid','true');return;}state.role=role;state.userStation=role==='user'?station.id:null;state.station=role==='user'?station.id:'all';$('#globalStation').value=state.station;$('#globalStation').disabled=role==='user';$('#loginScreen').classList.add('hidden');$('#appShell').classList.remove('hidden');error.classList.add('hidden');$$('.admin-only').forEach(el=>el.classList.toggle('hidden',role!=='admin'));$$('.user-only').forEach(el=>el.classList.toggle('hidden',role!=='user'));$('.avatar').textContent=role==='admin'?'AD':station.name.slice(0,2).toUpperCase();setPage('dashboard');renderAll();});
    $('#togglePassword').addEventListener('click',e=>{const visible=password.type==='password';password.type=visible?'text':'password';e.currentTarget.textContent=visible?'Hide':'Show';e.currentTarget.setAttribute('aria-label',visible?'Hide password':'Show password');});
    $('#logoutButton').addEventListener('click',()=>{$('#appShell').classList.add('hidden');$('#loginScreen').classList.remove('hidden');password.value='';username.focus();});
  }
  function renderAll(){renderDashboard();renderRecords();renderAnomalies();renderReport();if(state.role==='admin')renderAdmin();}
  function init() {
    populateStationSelector();initLogin();initRecordFilters();
    $$('.nav-item').forEach(b=>b.addEventListener('click',()=>setPage(b.dataset.page)));
    $$('[data-goto]').forEach(b=>b.addEventListener('click',()=>setPage(b.dataset.goto)));
    $('#globalStation').addEventListener('change',e=>{if(state.role==='user')return;state.station=e.target.value;renderAll();if(state.page==='forecasting'){renderForecast();document.dispatchEvent(new CustomEvent('aquacast:page',{detail:{page:'forecasting',station:activeStation(),role:state.role}}));}});
    $('#dashboardPeriod').addEventListener('change',renderDashboard);
    ['recordSearch','recordPeriod','recordStatus'].forEach(id=>$('#'+id).addEventListener(id==='recordSearch'?'input':'change',renderRecords));
    $('#resetRecordFilters').addEventListener('click',()=>{$('#recordSearch').value='';$('#recordPeriod').value='all';$('#recordStatus').value='all';state.sortBy='period';state.sortDirection=1;renderRecords();});
    $$('[data-sort]').forEach(b=>b.addEventListener('click',()=>{const sort=b.dataset.sort;state.sortDirection=state.sortBy===sort?-state.sortDirection:1;state.sortBy=sort;renderRecords();}));
    $('#forecastHorizon').addEventListener('change',renderForecast);
    $$('.region-tab').forEach(b=>b.addEventListener('click',()=>{state.region=b.dataset.region;renderAnomalies();}));
    $('#anomalyList').addEventListener('change',e=>{const id=e.target.dataset.anomalyStatus;if(!id)return;state.anomalyStatuses[id]=e.target.value;renderAnomalies();renderDashboard();});
    $('#anomalyList').addEventListener('click',e=>{const id=e.target.dataset.resetAnomaly;if(!id)return;state.anomalyStatuses[id]='Open';renderAnomalies();renderDashboard();});
    $('#reportView').addEventListener('change',renderReport);
    $('#reportYear').addEventListener('change',renderReport);
    $('#reportMonth').addEventListener('change',renderReport);
    $('#reportReset').addEventListener('click',()=>{initReportCalendar();renderReport();});
    $('#printReport').addEventListener('click',()=>window.print());
    $('#adminTariffGrid').addEventListener('submit',e=>{const form=e.target.closest('[data-tariff-form]');if(!form)return;e.preventDefault();const id=form.dataset.tariffForm,fd=new FormData(form);const t={classification:String(fd.get('classification')),size:String(fd.get('size')),effective:String(fd.get('effective'))};if(!Number.isFinite(Date.parse(t.effective))||!data.baciwaTariffSchedule.classifications[t.classification]||!data.baciwaTariffSchedule.sizes.some(z=>z.value===t.size)){alert('Choose a valid classification, meter size, and effective date.');return;}state.tariffs[id]=t;state.tariffVersions[id].push({...t});state.tariffVersions[id].sort((a,b)=>a.effective.localeCompare(b.effective));renderAdmin();renderReport();alert(`Saved BACIWA reference tariff selection for ${stationName(id)}. It will reset when this page is refreshed.`);});
    $('#dismissBanner').addEventListener('click',()=>$('.prototype-banner').classList.add('hidden'));$('#mobileMenu').addEventListener('click',()=>$('#sidebar').classList.toggle('open'));
    initReportCalendar();
    renderAll();
  }
  document.addEventListener('DOMContentLoaded',init);
})();
