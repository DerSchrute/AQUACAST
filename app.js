/* AQUACAST v0.9: offline static prototype. Client-side demo login is not security. */
(() => {
  'use strict';
  const data = window.AQUACAST_DATA;
  window.AQUACAST_IMPORTS?.restore(data);
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const state = {
    page:'dashboard', role:'user', station:'all', userStation:null, sortBy:'period', sortDirection:-1,
    region:'all', anomalyView:'active', anomalyStatuses:Object.fromEntries(data.anomalies.map(a=>[a.id,a.status])),
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
  const MANUAL_FLAGS_KEY='aquacast-v32-manual-flags';
  function manualFlagId(station,period){return `MANUAL-${station}-${period.replace(/[^a-zA-Z0-9]/g,'-')}`;}
  function loadManualFlags(){
    let saved=[];
    try{const parsed=JSON.parse(localStorage.getItem(MANUAL_FLAGS_KEY)||'[]');if(Array.isArray(parsed))saved=parsed;}catch(err){console.warn('Could not load manual flags',err);}
    for(const item of saved){
      const record=data.records.find(r=>r.station===item.station&&r.period===item.period);
      if(!record||data.anomalies.some(a=>a.station===item.station&&a.period===item.period))continue;
      data.anomalies.push({id:manualFlagId(item.station,item.period),station:item.station,period:item.period,value:record.consumption,reason:typeof item.reason==='string'&&item.reason.trim()?item.reason.trim().slice(0,500):'Manually flagged by Administration for investigation.',status:'Open',region:data.stations.find(x=>x.id===item.station)?.province||''});
    }
  }
  function flagForRecord(r){return data.anomalies.find(a=>a.station===r.station&&a.period===r.period);}
  function recordFlagged(r){return Boolean(flagForRecord(r));}
  loadManualFlags();
  for(const a of data.anomalies)if(!(a.id in state.anomalyStatuses))state.anomalyStatuses[a.id]=a.status;
  const totalFor = records => records.reduce((sum,r)=>sum+r.consumption,0);
  const tariffFromSelection = selection => {
    const schedule=data.baciwaTariffSchedule;
    const classification=schedule.classifications[selection.classification] || schedule.classifications.residential;
    return {classification:selection.classification,size:selection.size,minimum:classification.minimumBySize[selection.size] ?? classification.minimumBySize['1/2'],tier1:classification.rates[0],tier2:classification.rates[1],tier3:classification.rates[2],tier4:classification.rates[3],tier5:classification.rates[4],tier6:classification.rates[5],effective:selection.effective||'2026-01-01'};
  };
  const tariffAt = (station, period) => {
    const versions = (state.tariffVersions[station]||[]).slice().sort((a,b)=>a.effective.localeCompare(b.effective));
    const parsed=new Date(`${period} 01`);
    const monthDate=Number.isNaN(parsed.getTime())?'2026-01-01':`${parsed.getFullYear()}-${String(parsed.getMonth()+1).padStart(2,'0')}-01`;
    const selected=versions.filter(v=>v.effective<=monthDate).at(-1) || data.defaultTariffs[station];
    return tariffFromSelection(selected);
  };
  function estimateBill(q,t) {
    if (!t) return 0;
    return t.minimum + Math.min(Math.max(q-10,0),10)*t.tier1 + Math.min(Math.max(q-20,0),10)*t.tier2 + Math.min(Math.max(q-30,0),20)*t.tier3 + Math.min(Math.max(q-50,0),20)*t.tier4 + Math.min(Math.max(q-70,0),30)*t.tier5 + Math.max(q-100,0)*t.tier6;
  }
  function closeMobileNav(){const side=$('#sidebar');side.classList.remove('open');$('#mobileScrim')?.classList.remove('open');document.body.classList.remove('mobile-nav-open');$('#mobileMenu')?.setAttribute('aria-expanded','false');$('#mobileMenu')?.setAttribute('aria-label','Open navigation');}
  function toggleMobileNav(){const open=!$('#sidebar').classList.contains('open');$('#sidebar').classList.toggle('open',open);$('#mobileScrim').classList.toggle('open',open);document.body.classList.toggle('mobile-nav-open',open);$('#mobileMenu').setAttribute('aria-expanded',String(open));$('#mobileMenu').setAttribute('aria-label',open?'Close navigation':'Open navigation');if(open)$('#sidebar').querySelector('.nav-item:not(.hidden)')?.focus();}
  function setPage(page) {
    if (!$(`#page-${page}`)) return;
    if (['admin','evaluation','notices'].includes(page) && state.role!=='admin') return;
    if(page==='contact-admin' && state.role!=='user')return;
    state.page=page;
    closeAccountMenu();
    $$('.page-section').forEach(el=>el.classList.toggle('active',el.id===`page-${page}`));
    $$('.nav-item').forEach(el=>el.classList.toggle('active',el.dataset.page===page));
    $('#breadcrumbCurrent').textContent=$(`#page-${page}`).dataset.title;
    document.title=`AQUACAST | ${$(`#page-${page}`).dataset.title}`;
    closeMobileNav();
    document.querySelectorAll('[data-mobile-page]').forEach(el=>{const active=el.dataset.mobilePage===page;el.classList.toggle('active',active);if(active)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');});
    document.dispatchEvent(new CustomEvent('aquacast:page',{detail:{page,station:activeStation(),role:state.role}}));
    if(page==='notices') window.AQUACAST_NOTIFY?.renderAdmin();
    if(page==='contact-admin') window.AQUACAST_NOTIFY?.renderSent();
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
  const RECORD_MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
  function recordDateParts(period){
    const raw=String(period||'').trim();
    const iso=raw.match(/^(\d{4})-(\d{1,2})$/);
    if(iso)return {year:iso[1],month:Number(iso[2])};
    const label=raw.match(/^([A-Za-z]+)\s+(\d{4})$/);
    if(label){const month=RECORD_MONTHS.findIndex(m=>m.toLowerCase().startsWith(label[1].toLowerCase()));return {year:label[2],month:month+1};}
    return {year:'',month:0};
  }
  function refreshPeriodFilters(){
    const year=$('#recordYear'),month=$('#recordMonth'),station=$('#recordStation');
    const years=[...new Set(data.records.map(r=>recordDateParts(r.period).year).filter(Boolean))].sort((a,b)=>b.localeCompare(a));
    const oldYear=year.value,oldMonth=month.value,oldStation=station.value;
    year.innerHTML='<option value="all">All years</option>'+years.map(y=>`<option value="${esc(y)}">${esc(y)}</option>`).join('');
    year.value=years.includes(oldYear)?oldYear:'all';
    const months=[...new Set(data.records.filter(r=>year.value==='all'||recordDateParts(r.period).year===year.value).map(r=>recordDateParts(r.period).month).filter(n=>n>=1&&n<=12))].sort((a,b)=>a-b);
    month.innerHTML='<option value="all">All months</option>'+months.map(n=>`<option value="${n}">${RECORD_MONTHS[n-1]}</option>`).join('');
    month.value=months.map(String).includes(oldMonth)?oldMonth:'all';
    const stations=[...new Set(data.records.map(r=>r.station))].sort((a,b)=>stationName(a).localeCompare(stationName(b)));
    station.innerHTML='<option value="all">All stations</option>'+stations.map(id=>`<option value="${esc(id)}">${esc(stationName(id))} (${esc(id)})</option>`).join('');
    station.value=stations.includes(oldStation)?oldStation:'all';
    initReportCalendar();
  }
  function syncFlagValues(){
    data.anomalies.forEach(a=>{const r=data.records.find(x=>x.station===a.station&&x.period===a.period);if(r)a.value=r.consumption;});
  }
  function initRecordFilters(){refreshPeriodFilters();}
  function filteredRecords(){
    const search=$('#recordSearch').value.trim().toLowerCase();
    const year=$('#recordYear').value,month=$('#recordMonth').value,station=$('#recordStation').value,status=$('#recordStatus').value;
    return scopedRecords().filter(r=>{
      const date=recordDateParts(r.period);
      return (!search||`${r.station} ${stationName(r.station)} ${r.period} ${date.year} ${RECORD_MONTHS[date.month-1]||''}`.toLowerCase().includes(search))
        &&(year==='all'||date.year===year)&&(month==='all'||String(date.month)===month)
        &&(station==='all'||r.station===station)
        &&(status==='all'||(recordFlagged(r)?'Flagged':'Normal')===status);
    }).sort((a,b)=>{
      let cmp=0;
      if(state.sortBy==='period'){
        const da=recordDateParts(a.period),db=recordDateParts(b.period);
        cmp=(Number(da.year)*12+da.month)-(Number(db.year)*12+db.month);
      }else if(state.sortBy==='station')cmp=stationName(a.station).localeCompare(stationName(b.station));
      else cmp=a.consumption-b.consumption;
      return cmp*state.sortDirection||a.station.localeCompare(b.station)||a.period.localeCompare(b.period);
    });
  }
  function syncRecordSortSelect(){
    const select=$('#recordSort');if(select)select.value=state.sortBy+'-'+(state.sortDirection===-1?'desc':'asc');
    $$('[data-sort]').forEach(button=>{
      const active=button.dataset.sort===state.sortBy;
      button.setAttribute('aria-sort',active?(state.sortDirection===1?'ascending':'descending'):'none');
      button.textContent=button.dataset.sort==='period'?'Period '+(active?(state.sortDirection===1?'↑':'↓'):'↕'):button.dataset.sort==='station'?'Station ID '+(active?(state.sortDirection===1?'↑':'↓'):'↕'):'Consumption '+(active?(state.sortDirection===1?'↑':'↓'):'↕');
    });
  }
  function renderRecords() {
    syncRecordSortSelect();
    const records=filteredRecords(); $('#recordCount').textContent=`Showing ${records.length} of ${scopedRecords().length} records in the current station scope`;
    $('#recordsTableBody').innerHTML=records.map(r=>{
      const flagged=recordFlagged(r), flag=flagForRecord(r);
      const action=state.role==='admin'?(flagged?`<button type="button" class="secondary-button record-flag-action" data-view-record-flag="${esc(flag.id)}">View flag</button>`:`<button type="button" class="secondary-button record-flag-action" data-manual-flag="${esc(r.station)}|${esc(r.period)}">Flag reading</button>`):'<span class="small-muted">—</span>';
      return `<tr><td>${esc(r.period)}</td><td><span class="record-id">${esc(r.station)}</span><small class="station-subname">${esc(stationName(r.station))}</small></td><td>${number(r.consumption)}</td><td>m³</td><td><span class="table-status ${flagged?'flagged':'normal'}">${flagged?'Flagged':'Normal'}</span></td>${state.role==='admin'?`<td>${action}</td>`:''}</tr>`;
    }).join('');
    $('#recordActionHeader').classList.toggle('hidden',state.role!=='admin');
    $('#recordsEmpty').classList.toggle('hidden',!records.length);
  }
  function renderForecast() {
    const entries=Object.entries(data.illustrativeForecast).slice(0,Number($('#forecastHorizon').value||3));
    let scale=1;
    if(activeStation()!=='all'){ const sample=data.records.filter(r=>r.station===activeStation()); const avg=sample.reduce((a,r)=>a+r.consumption,0)/Math.max(sample.length,1); scale=avg/112; }
    const vals=entries.map(([,v])=>Math.round(v*scale));
    if(window.AQUACAST_CHARTS) window.AQUACAST_CHARTS.renderFutureForecast(entries.map(([p])=>p),vals);
  }
  const ANOMALY_STATUS_KEY='aquacast-v25-anomaly-statuses';
  window.AQUACAST_ANOMALY_STATUS=id=>state.anomalyStatuses[id]||'Open';
  window.AQUACAST_REFRESH_ANOMALIES=()=>{renderAnomalies();window.AQUACAST_NOTIFY?.refresh();};
  // Same-origin, same-browser tab synchronization. Not a cross-device transport.
  const SYNC_KEYS=new Set(['aquacast-v37-imported-records',MANUAL_FLAGS_KEY,ANOMALY_STATUS_KEY,'aquacast-v26-investigation-requests','aquacast-v28-flag-correspondence','aquacast-v36-audit-events']);
  const tabId='tab-'+Math.random().toString(36).slice(2);
  let syncChannel=null;
  function applySharedAnomalyState(){
    let saved={};
    try{const parsed=JSON.parse(localStorage.getItem(ANOMALY_STATUS_KEY)||'{}');if(parsed&&typeof parsed==='object'&&!Array.isArray(parsed))saved=parsed;}
    catch(err){console.warn('Could not read synchronized anomaly statuses',err);return;}
    for(const anomaly of data.anomalies){
      state.anomalyStatuses[anomaly.id]=['Open','Reviewed','Dismissed'].includes(saved[anomaly.id])?saved[anomaly.id]:anomaly.status;
    }
  }
  function redrawSharedInvestigation(){
    renderAnomalies();renderDashboard();renderRecords();renderReport();
    window.AQUACAST_NOTIFY?.refresh();
    window.AQUACAST_INVESTIGATIONS?.refreshThread?.();
  }
  function onSharedChange(key){
    if(!SYNC_KEYS.has(key))return;
    if(key==='aquacast-v37-imported-records'){window.AQUACAST_IMPORTS?.restore(data);refreshPeriodFilters();syncFlagValues();}
    if(key===MANUAL_FLAGS_KEY){loadManualFlags();applySharedAnomalyState();}
    if(key===ANOMALY_STATUS_KEY)applySharedAnomalyState();
    redrawSharedInvestigation();
  }
  function publishSharedChange(key){
    if(syncChannel)try{syncChannel.postMessage({sender:tabId,key});}catch(err){console.warn('Tab broadcast unavailable',err);}
  }
  function setupTabSync(){
    window.addEventListener('storage',event=>{
      if(event.storageArea!==localStorage)return;
      if(event.key===null){applySharedAnomalyState();redrawSharedInvestigation();return;}
      onSharedChange(event.key);
    });
    if('BroadcastChannel' in window){
      try{syncChannel=new BroadcastChannel('aquacast-v31-tab-sync');syncChannel.onmessage=event=>{
        const msg=event.data;
        if(msg&&msg.sender!==tabId&&SYNC_KEYS.has(msg.key))onSharedChange(msg.key);
      };}catch(err){console.warn('BroadcastChannel unavailable; storage events will be used',err);}
    }
  }
  function saveAnomalyStatuses(){try{localStorage.setItem(ANOMALY_STATUS_KEY,JSON.stringify(state.anomalyStatuses));publishSharedChange(ANOMALY_STATUS_KEY);}catch(err){console.warn('Unable to persist anomaly statuses',err);}}
  function updateAnomalyStatus(id,status){
    if(state.role!=='admin'||!data.anomalies.some(a=>a.id===id)||!['Open','Reviewed','Dismissed'].includes(status))return;
    const previous=state.anomalyStatuses[id];
    if(previous===status)return;
    state.anomalyStatuses[id]=status;
    window.AQUACAST_TRACE?.record(id,'Administration',status==='Open'?'Case reopened':`Case ${status.toLowerCase()}`,`Previous status: ${previous}`);
    saveAnomalyStatuses();
    renderAnomalies();renderDashboard();renderRecords();renderReport();
    window.AQUACAST_NOTIFY?.refresh();
    window.AQUACAST_INVESTIGATIONS?.refresh();
  }
  function renderAnomalies() {
    if(state.role==='user')state.region='all';
    const investigation=window.AQUACAST_INVESTIGATIONS;
    const all=scopedAnomalies().filter(a=>state.role==='admin'||investigation?.hasRequest(a.id,a.station));
    const open=all.filter(a=>state.anomalyStatuses[a.id]==='Open');
    const pending=open.filter(a=>investigation?.hasRequest(a.id,a.station));
    const uncontacted=open.filter(a=>!investigation?.hasRequest(a.id,a.station));
    const archived=all.filter(a=>['Reviewed','Dismissed'].includes(state.anomalyStatuses[a.id]));
    // Admin separates uncontacted and contacted flags. Station users see only their requests.
    const view=state.role==='user'&&state.anomalyView==='review'?'active':state.anomalyView;
    if(state.role==='user'&&state.anomalyView==='review')state.anomalyView='active';
    const shown=view==='archive'?archived:state.role==='user'?open:view==='review'?pending:uncontacted;
    $('#anomalyOpenCount').textContent=`${open.length} open item${open.length===1?'':'s'}`;
    $('#anomalyNavCount').textContent=String(open.length);
    $('#anomalyActiveTabCount').textContent=`(${state.role==='admin'?uncontacted.length:open.length})`;
    $('#anomalyReviewTabCount').textContent=`(${pending.length})`;
    $('#anomalyArchiveTabCount').textContent=`(${archived.length})`;
    $('#anomalyReviewTab').classList.toggle('hidden',state.role!=='admin');
    for(const [id,v] of [['anomalyActiveTab','active'],['anomalyReviewTab','review'],['anomalyArchiveTab','archive']]){
      $('#'+id).classList.toggle('active',view===v);
      $('#'+id).setAttribute('aria-pressed',String(view===v));
    }
    $('#anomalyViewHint').textContent=state.role==='user'?(view==='archive'?'Requests closed by Administration remain here for reference.':'Information requests from Administration remain here until the flag is Reviewed or Dismissed.'):(view==='archive'?'Archived flags are retained for reference; reopen a flag to investigate it again.':view==='review'?'Stations contacted about an open flag are listed here. Send a follow-up if more information is needed.':'These open flags have not yet been sent to their stations. Use Contact station to begin the investigation.');
    $$('.region-tab').forEach(b=>b.classList.toggle('active',b.dataset.region===state.region));
    $('#anomalyList').innerHTML=shown.length?shown.map(a=>{
      const status=state.anomalyStatuses[a.id],cls=status==='Reviewed'?'success':status==='Dismissed'?'neutral':'warning';
      const req=investigation?.latestRequest(a.id,a.station);
      const stationBody=state.role==='user'?`<div class="investigation-request"><strong>Request from Administration</strong><p class="small-muted">${esc(req?.sentAt||'')} · Reference: ${esc(a.id)}</p><h4>${esc(req?.subject||'Information request')}</h4><p class="investigation-message">${esc(req?.body||'')}</p>${investigation?.evidenceHTML(req?.evidence||[])||''}${view==='archive'?`<button type="button" class="secondary-button" data-flag-thread="${esc(a.id)}">View correspondence</button>`:`<button type="button" class="secondary-button" data-flag-thread="${esc(a.id)}">Send follow-up</button>`}</div>`:'';
      const adminHistory=state.role==='admin'&&req?`<p class="small-muted">Last information request sent: ${esc(req.sentAt)}</p>`:'';
      return `<article class="anomaly-card" data-flag-card="${esc(a.id)}"><div class="anomaly-indicator">${view==='archive'?'✓':'!'}</div><div class="anomaly-content"><div class="anomaly-title-row"><h3>${esc(stationName(a.station))} · ${esc(a.period)}</h3><span class="status-pill ${cls}">${esc(status)}</span></div>${state.role==='admin'?`<p>${esc(a.reason)} This flag is illustrative and requires station verification.</p><div class="anomaly-meta"><span>ID: ${esc(a.id)}</span><span>${esc(a.region)}</span><span>Value: ${number(a.value)} m³</span></div>${adminHistory}`:stationBody}${window.AQUACAST_TRACE?.explanation(a)||''}${window.AQUACAST_TRACE?.history(a)||''}</div><div class="anomaly-actions">${state.role==='admin'?(view==='archive'?`<button type="button" data-flag-thread="${esc(a.id)}" class="secondary-button">View correspondence</button><button type="button" data-reopen-anomaly="${esc(a.id)}" class="secondary-button">Reopen flag</button>`:`<button type="button" data-contact-anomaly="${esc(a.id)}" class="secondary-button">${req?'Request follow-up':'Contact station'}</button>${req?`<button type="button" class="secondary-button" data-flag-thread="${esc(a.id)}">View / reply</button>`:''}<label class="sr-only" for="status-${esc(a.id)}">Review status for ${esc(a.id)}</label><select id="status-${esc(a.id)}" data-anomaly-status="${esc(a.id)}"><option value="Open" selected>Open</option><option value="Reviewed">Reviewed</option><option value="Dismissed">Dismissed</option></select>`):''}</div></article>`;
    }).join(''):`<article class="panel"><p>${view==='archive'?'No archived flags for this selection.':view==='review'?'No contacted flags are awaiting review.':state.role==='admin'?'No uncontacted flags for this selection.':'No active information requests for this station.'}</p></article>`;
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
    const groups=selectedPeriods.map(p=>{const rows=records.filter(r=>r.period===p);return {period:p,count:rows.length,total:totalFor(rows),flags:rows.filter(r=>recordFlagged(r)).length,cost:rows.reduce((sum,r)=>sum+estimateBill(r.consumption,tariffAt(r.station,r.period)),0)};}).filter(g=>g.count);
    const total=totalFor(records),cost=records.reduce((sum,r)=>sum+estimateBill(r.consumption,tariffAt(r.station,r.period)),0);
    const label=view==='year'?`Year ${year}`:(selectedPeriods[0]||month);
    $('#reportYearLabel').classList.toggle('hidden',view!=='year');
    $('#reportMonthLabel').classList.toggle('hidden',view!=='month');
    $('#reportPeriodHint').textContent=view==='year'?`Yearly report · ${year} · ${groups.length} month(s) with records`:`Monthly report · ${label}`;
    $('#reportGenerated').textContent=`Generated from fictional local data · ${activeStation()==='all'?'All stations':stationName(activeStation())} · ${label}`;
    $('#reportMetrics').innerHTML=`<div class="report-stat"><span>Total sample consumption</span><strong>${number(total)} m³</strong></div><div class="report-stat"><span>Estimated cost (BACIWA reference tariff)</span><strong>${money(cost)}</strong><small>Tiered tariff estimate · reference schedule</small></div><div class="report-stat"><span>Records included</span><strong>${number(records.length)}</strong></div><div class="report-stat"><span>Flagged records</span><strong>${number(records.filter(r=>recordFlagged(r)).length)}</strong></div>`;
    $('#reportTableBody').innerHTML=groups.length?groups.map(g=>`<tr><td>${esc(g.period)}</td><td>${g.count}</td><td>${number(g.total)} m³</td><td>${money(g.cost)}</td><td>${g.flags}</td></tr>`).join(''):'<tr><td colspan="5" class="empty-state">No records are available for the selected period and station.</td></tr>';
  }
  function renderAdmin() {
    if(state.role!=='admin') return;
    const schedule=data.baciwaTariffSchedule;
    $('#adminTariffGrid').innerHTML=data.stations.filter(s=>state.station==='all'||s.id===state.station).map(s=>{const t=state.tariffs[s.id];const resolved=tariffFromSelection(t);return `<form class="panel tariff-card" data-tariff-form="${s.id}"><div class="panel-heading"><div><h2>${esc(s.name)}</h2><p>${esc(s.id)} · BACIWA reference schedule</p></div></div><label>Customer classification<select name="classification">${Object.entries(schedule.classifications).map(([key,c])=>`<option value="${key}" ${t.classification===key?'selected':''}>${esc(c.label)}</option>`).join('')}</select></label><label>Connection/meter size<select name="size">${schedule.sizes.map(z=>`<option value="${z.value}" ${t.size===z.value?'selected':''}>${esc(z.label)}</option>`).join('')}</select></label><label>Tariff effective date<input name="effective" type="date" value="${esc(t.effective||'2026-01-01')}" required></label><div class="tariff-summary"><div><span>Minimum charge · first 10 m³</span><strong>${money(resolved.minimum)}</strong></div>${[[ '11–20 m³',resolved.tier1],['21–30 m³',resolved.tier2],['31–50 m³',resolved.tier3],['51–70 m³',resolved.tier4],['71–100 m³',resolved.tier5],['Above 100 m³',resolved.tier6]].map(([label,rate])=>`<div><span>${label}</span><strong>${money(rate)}/m³</strong></div>`).join('')}</div><label>Preview usage (m³)<input name="previewUsage" type="number" min="0" step="0.1" value="25"></label><div class="tariff-preview">Estimated cost at 25 m³: <strong>${money(estimateBill(25,resolved))}</strong></div><p class="small-muted">Rates are transcribed from the BACIWA table supplied by the user. This selection is a prototype assumption; verify provider, category, meter size, effective date, and other bill charges. Selections are saved locally in this browser. Rates are reference values only.</p><button class="primary-button" type="submit">Save tariff selection</button> <button class="secondary-button" type="button" data-tariff-reset="${s.id}">Reset station tariff</button></form>`;}).join('');
  }
  function closeAccountMenu(){const menu=$('#accountMenu'),trigger=$('#accountTrigger');menu.classList.add('hidden');trigger.setAttribute('aria-expanded','false');}
  function closeAccountDialog(){const dialog=$('#accountDialog');if(!dialog.classList.contains('hidden')){dialog.classList.add('hidden');$('#accountTrigger').focus();}}
  function showAccountDialog(kind){
    closeAccountMenu();
    const title=$('#accountDialogTitle'),body=$('#accountDialogBody');
    if(kind==='details'){
      title.textContent='Account information';
      const name=$('#accountDisplayName').textContent,role=$('#accountDisplayRole').textContent,id=$('#accountDisplayId').textContent;
      body.innerHTML='<dl class="account-detail-list"><dt>Account</dt><dd>'+esc(name)+'</dd><dt>Access level</dt><dd>'+esc(role)+'</dd><dt>Sign-in</dt><dd>'+esc(id)+'</dd></dl><p>This information is for the current demonstration session.</p>';
    }else if(kind==='privacy'){
      title.textContent='Privacy & security';
      body.innerHTML='<p><strong>Academic demonstration only.</strong> AQUACAST currently uses client-side sample accounts, not verified government authentication.</p><p>Do not enter real passwords or import confidential police records into this prototype. Signing out returns you to the login screen, but is not a server-side session revocation. An approved deployment requires secure authentication, server-side permissions, encrypted transport, and institutional data-handling controls.</p>';
    }else{
      title.textContent='Help & system information';
      body.innerHTML='<p>Use Home to review consumption, Records for monthly entries, Forecast for estimated usage, and Reports for monthly or yearly summaries. Use More for additional pages available to your role.</p><p>All displayed records are fictional. Contact your designated system administrator for access or reporting concerns; no support service is connected in this prototype.</p>';
    }
    $('#accountDialog').classList.remove('hidden');$('#accountDialogClose').focus();
  }
  function initAccountMenu(){
    const trigger=$('#accountTrigger'),menu=$('#accountMenu');
    trigger.addEventListener('click',()=>{const open=menu.classList.contains('hidden');menu.classList.toggle('hidden',!open);trigger.setAttribute('aria-expanded',String(open));if(open)$('#accountDetailsButton').focus();});
    $('#accountDetailsButton').addEventListener('click',()=>showAccountDialog('details'));
    $('#accountPrivacyButton').addEventListener('click',()=>showAccountDialog('privacy'));
    $('#accountHelpButton').addEventListener('click',()=>showAccountDialog('help'));
    $('#accountDialogClose').addEventListener('click',closeAccountDialog);
    $('#accountDialogDone').addEventListener('click',closeAccountDialog);
    $('#accountDialogBackdrop').addEventListener('click',closeAccountDialog);
    document.addEventListener('pointerdown',e=>{if(!$('#accountMenuWrap').contains(e.target))closeAccountMenu();});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!$('#accountDialog').classList.contains('hidden'))closeAccountDialog();else if(!menu.classList.contains('hidden')){closeAccountMenu();trigger.focus();}}});
  }
  function initLogin() {
    const form=$('#loginForm'), username=$('#loginUsername'), password=$('#loginPassword'), error=$('#loginError');
    form.addEventListener('submit',e=>{e.preventDefault();const u=username.value.trim().toLowerCase(),p=password.value;
      const missingUser=!u,missingPassword=!p.trim();
      username.setAttribute('aria-invalid',String(missingUser));
      password.setAttribute('aria-invalid',String(missingPassword));
      if(missingUser||missingPassword){
        error.textContent=missingUser&&missingPassword?'Please enter your username and password.':missingUser?'Please enter your username.':'Please enter your password.';
        error.classList.remove('hidden');
        (missingUser?username:password).focus();
        return;
      }
      let role='',station=null;if(u==='admin'&&p==='admin123')role='admin';else if(u==='evaluator'&&p==='aquacast123')role='admin';else {station=stationAccount(u);if(station&&p===station.password)role='user';else if(u==='user'&&p==='user123'){role='user';station=data.stations[0];}}if(!role){error.textContent='Incorrect username or password. Please try again.';error.classList.remove('hidden');username.setAttribute('aria-invalid','true');password.setAttribute('aria-invalid','true');return;}state.role=role;window.AQUACAST_NOTIFY?.setSession({role,station:station?.id||null});window.AQUACAST_INVESTIGATIONS?.setSession({role,station:station?.id||null});state.userStation=role==='user'?station.id:null;state.station=role==='user'?station.id:'all';$('#globalStation').value=state.station;$('#globalStation').disabled=role==='user';$('#loginScreen').classList.add('hidden');$('#appShell').classList.remove('hidden');error.classList.add('hidden');username.removeAttribute('aria-invalid');password.removeAttribute('aria-invalid');$$('.admin-only').forEach(el=>el.classList.toggle('hidden',role!=='admin'));$$('.user-only').forEach(el=>el.classList.toggle('hidden',role!=='user'));$$('.region-tabs').forEach(el=>el.classList.toggle('hidden',role==='user'));$('#accountAvatar').textContent=role==='admin'?'AD':station.name.slice(0,2).toUpperCase();$('#accountDisplayName').textContent=role==='admin'?'AQUACAST Administration':station.name;$('#accountDisplayRole').textContent=role==='admin'?'Administrator / Evaluator':'Station user';$('#accountDisplayId').textContent='Username: '+u;closeAccountMenu();setPage('dashboard');renderAll();});
    $('#togglePassword').addEventListener('click',e=>{const visible=password.type==='password';password.type=visible?'text':'password';e.currentTarget.textContent=visible?'Hide':'Show';e.currentTarget.setAttribute('aria-label',visible?'Hide password':'Show password');});
    const signOut=()=>{closeAccountMenu();closeAccountDialog();closeMobileNav();$('#appShell').classList.add('hidden');$('#loginScreen').classList.remove('hidden');password.value='';state.userStation=null;state.station='all';state.role='user';window.AQUACAST_NOTIFY?.setSession(null);window.AQUACAST_INVESTIGATIONS?.setSession(null);username.focus();};
    $('#logoutButton').addEventListener('click',signOut);
    $('#accountSignOutButton').addEventListener('click',signOut);
  }
  function renderAll(){renderDashboard();renderRecords();renderAnomalies();renderReport();if(state.role==='admin')renderAdmin();}
  let pendingManualFlag=null;
  function closeManualFlagModal(){
    $('#manualFlagModal').classList.add('hidden');
    pendingManualFlag=null;
  }
  function openManualFlagModal(record){
    if(state.role!=='admin'||flagForRecord(record))return;
    pendingManualFlag={station:record.station,period:record.period};
    $('#manualFlagContext').textContent=`${stationName(record.station)} · ${record.period} · ${number(record.consumption)} m³`;
    $('#manualFlagReason').value='';
    $('#manualFlagCounter').textContent='0 / 500 characters';
    $('#manualFlagFeedback').textContent='';
    $('#manualFlagModal').classList.remove('hidden');
    $('#manualFlagReason').focus();
  }
  function submitManualFlag(e){
    e.preventDefault();
    if(state.role!=='admin'||!pendingManualFlag)return;
    const {station,period}=pendingManualFlag;
    const record=data.records.find(r=>r.station===station&&r.period===period);
    if(!record||flagForRecord(record)){$('#manualFlagFeedback').textContent='This reading has already been flagged. Close this window and refresh the records.';return;}
    const reason=$('#manualFlagReason').value.trim();
    if(!reason){$('#manualFlagFeedback').textContent='Please enter a reason for flagging this reading.';$('#manualFlagReason').focus();return;}
    const item={station,period,reason:reason.slice(0,500)};
    let saved=[];
    try{const parsed=JSON.parse(localStorage.getItem(MANUAL_FLAGS_KEY)||'[]');if(Array.isArray(parsed))saved=parsed;}catch(err){}
    if(saved.some(x=>x.station===station&&x.period===period)){$('#manualFlagFeedback').textContent='This reading has already been manually flagged.';return;}
    saved.push(item);
    try{localStorage.setItem(MANUAL_FLAGS_KEY,JSON.stringify(saved));}catch(err){$('#manualFlagFeedback').textContent='Could not save the manual flag in browser storage.';return;}
    loadManualFlags();
    state.anomalyStatuses[manualFlagId(station,period)]='Open';
    window.AQUACAST_TRACE?.record(manualFlagId(station,period),'Administration','Manual flag created',reason.slice(0,500));
    document.dispatchEvent(new CustomEvent('aquacast:record-activity',{detail:{action:'Manual flag',description:`${station} · ${period}: ${reason.slice(0,120)}`}}));
    publishSharedChange(MANUAL_FLAGS_KEY);
    closeManualFlagModal();
    renderAll();
    const confirmation=$('#manualFlagSuccess');
    confirmation.textContent=`${stationName(station)} · ${period} was flagged. Open Anomaly monitoring to investigate this case.`;
    confirmation.classList.remove('hidden');
  }
  function init() {
    try{const saved=JSON.parse(localStorage.getItem('aquacast-v23-tariffs')||'null');if(saved&&typeof saved==='object'){for(const st of data.stations){const versions=saved[st.id];if(Array.isArray(versions)&&versions.length){const valid=versions.filter(t=>data.baciwaTariffSchedule.classifications[t.classification]&&data.baciwaTariffSchedule.sizes.some(z=>z.value===t.size)&&/^\\d{4}-\\d{2}-\\d{2}$/.test(t.effective));if(valid.length){state.tariffVersions[st.id]=valid;state.tariffs[st.id]=valid.at(-1);}}}}}catch(e){console.warn('Could not load local demo tariffs',e);}
    try{const stored=JSON.parse(localStorage.getItem(ANOMALY_STATUS_KEY)||'{}');if(stored&&typeof stored==='object')for(const a of data.anomalies){if(['Open','Reviewed','Dismissed'].includes(stored[a.id]))state.anomalyStatuses[a.id]=stored[a.id];}}catch(err){console.warn('Could not load archived flag statuses',err);}
    setupTabSync();
    populateStationSelector();initLogin();initAccountMenu();initRecordFilters();
    window.AQUACAST_IMPORTS?.init({data, onCommit:()=>{syncFlagValues();refreshPeriodFilters();renderAll();renderForecast();window.AQUACAST_CHARTS?.redraw?.();publishSharedChange('aquacast-v37-imported-records');}});
    $$('.nav-item').forEach(b=>b.addEventListener('click',()=>setPage(b.dataset.page)));
    $$('[data-goto]').forEach(b=>b.addEventListener('click',()=>setPage(b.dataset.goto)));
    $('#globalStation').addEventListener('change',e=>{if(state.role==='user')return;state.station=e.target.value;renderAll();if(state.page==='forecasting'){renderForecast();document.dispatchEvent(new CustomEvent('aquacast:page',{detail:{page:'forecasting',station:activeStation(),role:state.role}}));}});
    $('#dashboardPeriod').addEventListener('change',renderDashboard);
    ['recordSearch','recordMonth','recordStation','recordStatus'].forEach(id=>$('#'+id).addEventListener(id==='recordSearch'?'input':'change',renderRecords));
    $('#recordYear').addEventListener('change',()=>{refreshPeriodFilters();renderRecords();});
    $('#recordSort').addEventListener('change',e=>{const [by,order]=e.target.value.split('-');state.sortBy=by;state.sortDirection=order==='desc'?-1:1;renderRecords();});
    $('#manualFlagForm').addEventListener('submit',submitManualFlag);
    $('#manualFlagReason').addEventListener('input',e=>{$('#manualFlagCounter').textContent=`${e.target.value.length} / 500 characters`;$('#manualFlagFeedback').textContent='';});
    $$('[data-manual-flag-close]').forEach(el=>el.addEventListener('click',closeManualFlagModal));
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#manualFlagModal').classList.contains('hidden'))closeManualFlagModal();});
    $('#recordsTableBody').addEventListener('click',e=>{
      if(state.role!=='admin')return;
      const flagBtn=e.target.closest('[data-manual-flag]');
      if(flagBtn){
        const [station,period]=flagBtn.dataset.manualFlag.split('|');
        const record=data.records.find(r=>r.station===station&&r.period===period);
        if(!record||flagForRecord(record))return;
        openManualFlagModal(record);
      }
      const view=e.target.closest('[data-view-record-flag]');
      if(view){const id=view.dataset.viewRecordFlag,flag=data.anomalies.find(a=>a.id===id);if(!flag)return;
        // Make the selected station visible regardless of the previous station/region filters.
        state.station=flag.station;
        $('#globalStation').value=flag.station;
        state.region='all';
        state.anomalyView=['Reviewed','Dismissed'].includes(state.anomalyStatuses[id])?'archive':window.AQUACAST_INVESTIGATIONS?.hasRequest(id,flag.station)?'review':'active';
        setPage('anomalies');renderAnomalies();
        const target=[...document.querySelectorAll('[data-flag-card]')].find(card=>card.dataset.flagCard===id);
        if(target){
          document.querySelectorAll('.anomaly-record-focus').forEach(card=>card.classList.remove('anomaly-record-focus'));
          target.classList.add('anomaly-record-focus');
          target.scrollIntoView({behavior:'smooth',block:'center'});
        }
      }
    });
    $('#resetRecordFilters').addEventListener('click',()=>{$('#recordSearch').value='';$('#recordYear').value='all';refreshPeriodFilters();$('#recordMonth').value='all';$('#recordStation').value='all';$('#recordStatus').value='all';state.sortBy='period';state.sortDirection=-1;renderRecords();});
    $$('[data-sort]').forEach(b=>b.addEventListener('click',()=>{const sort=b.dataset.sort;state.sortDirection=state.sortBy===sort?-state.sortDirection:1;state.sortBy=sort;renderRecords();}));
    $('#forecastHorizon').addEventListener('change',renderForecast);
    $$('.region-tab').forEach(b=>b.addEventListener('click',()=>{state.region=b.dataset.region;renderAnomalies();}));
    $('#anomalyActiveTab').addEventListener('click',()=>{state.anomalyView='active';renderAnomalies();});
    $('#anomalyReviewTab').addEventListener('click',()=>{if(state.role==='admin'){state.anomalyView='review';renderAnomalies();}});
    $('#anomalyArchiveTab').addEventListener('click',()=>{state.anomalyView='archive';renderAnomalies();});
    $('#anomalyList').addEventListener('change',e=>{const id=e.target.dataset.anomalyStatus;if(id)updateAnomalyStatus(id,e.target.value);});
    $('#anomalyList').addEventListener('click',e=>{const id=e.target.closest('[data-reopen-anomaly]')?.dataset.reopenAnomaly;if(id&&state.role==='admin')updateAnomalyStatus(id,'Open');const contact=e.target.closest('[data-contact-anomaly]')?.dataset.contactAnomaly;if(contact&&state.role==='admin')window.AQUACAST_INVESTIGATIONS?.open(contact);const thread=e.target.closest('[data-flag-thread]')?.dataset.flagThread;if(thread)window.AQUACAST_INVESTIGATIONS?.openThread(thread);});
    $('#reportView').addEventListener('change',renderReport);
    $('#reportYear').addEventListener('change',renderReport);
    $('#reportMonth').addEventListener('change',renderReport);
    $('#reportReset').addEventListener('click',()=>{initReportCalendar();renderReport();});
    $('#printReport').addEventListener('click',()=>window.print());
    $('#adminTariffGrid').addEventListener('submit',e=>{const form=e.target.closest('[data-tariff-form]');if(!form)return;e.preventDefault();const id=form.dataset.tariffForm,fd=new FormData(form);const t={classification:String(fd.get('classification')),size:String(fd.get('size')),effective:String(fd.get('effective'))};if(!Number.isFinite(Date.parse(t.effective))||!data.baciwaTariffSchedule.classifications[t.classification]||!data.baciwaTariffSchedule.sizes.some(z=>z.value===t.size)){alert('Choose a valid classification, meter size, and effective date.');return;}state.tariffs[id]=t;state.tariffVersions[id]=state.tariffVersions[id].filter(v=>v.effective!==t.effective);state.tariffVersions[id].push({...t});state.tariffVersions[id].sort((a,b)=>a.effective.localeCompare(b.effective));localStorage.setItem('aquacast-v23-tariffs',JSON.stringify(state.tariffVersions));renderAll();renderForecast();renderAdmin();alert(`Saved demo tariff for ${stationName(id)}. Reports have been recalculated. Effective date must be on or before a record's month to affect that record.`);});
    $('#adminTariffGrid').addEventListener('input',e=>{const form=e.target.closest('[data-tariff-form]');if(!form)return;const fd=new FormData(form);const selection={classification:String(fd.get('classification')),size:String(fd.get('size'))};const q=Number(fd.get('previewUsage'));const preview=form.querySelector('.tariff-preview strong');if(preview)preview.textContent=money(estimateBill(Math.max(0,q||0),tariffFromSelection(selection)));});
    $('#adminTariffGrid').addEventListener('click',e=>{const id=e.target.dataset.tariffReset;if(!id)return;state.tariffVersions[id]=[{...data.defaultTariffs[id]}];state.tariffs[id]={...data.defaultTariffs[id]};localStorage.setItem('aquacast-v23-tariffs',JSON.stringify(state.tariffVersions));renderAll();renderAdmin();});
    $('#dismissBanner').addEventListener('click',()=>$('.prototype-banner').classList.add('hidden'));
    $('#mobileMenu').addEventListener('click',()=>toggleMobileNav());
    $('#mobileMore').addEventListener('click',()=>toggleMobileNav());
    $('#mobileScrim').addEventListener('click',closeMobileNav);
    document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMobileNav();});
    window.addEventListener('resize',()=>{if(window.innerWidth>850)closeMobileNav();});
    document.querySelectorAll('[data-mobile-page]').forEach(b=>b.addEventListener('click',()=>setPage(b.dataset.mobilePage)));
    initReportCalendar();
    renderAll();
  }
  document.addEventListener('DOMContentLoaded',init);
})();
