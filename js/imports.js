/* AQUACAST v3.7 CSV import demo. Client-side, not an authorized data ingestion service. */
(() => {
 'use strict';
 const KEY='aquacast-v37-imported-records';
 const HISTORY_KEY='aquacast-v39-record-history';
 const HISTORY_LIMIT=10;
 let activeSnapshot=null;
 const $=id=>document.getElementById(id);
 const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
 const periodLabel=s=>{const [y,m]=s.split('-').map(Number);return `${months[m-1]} ${y}`;};
 const periodKey=s=>{const m=/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{4})$/.exec(s);return m?`${m[2]}-${String(months.indexOf(m[1])+1).padStart(2,'0')}`:'';};
 const key=r=>`${r.station}|${r.period}`;
 let pending=null,model=null,commitCallback=()=>{},pendingFileName='';
 let selectionToken=0;
 function parseCSV(text){
   text=text.replace(/^\uFEFF/,'');let cells=[],rows=[],cell='',quoted=false;
   for(let i=0;i<text.length;i++){
     const c=text[i];
     if(quoted){if(c==='"'&&text[i+1]==='"'){cell+='"';i++;}else if(c==='"')quoted=false;else cell+=c;}
     else if(c==='"'){if(cell.trim())throw Error('Invalid quote in CSV.');quoted=true;}
     else if(c===','){cells.push(cell);cell='';}
     else if(c==='\n'||c==='\r'){if(c==='\r'&&text[i+1]==='\n')i++;cells.push(cell);if(cells.some(x=>x.trim()))rows.push(cells);cells=[];cell='';}
     else cell+=c;
   }
   if(quoted)throw Error('Unclosed quote in CSV.');
   cells.push(cell);if(cells.some(x=>x.trim()))rows.push(cells);
   return rows;
 }
 function restore(data){
   if(!data._v37Original) data._v37Original=data.records.map(r=>({...r}));
   let saved=[];
   try{saved=JSON.parse(localStorage.getItem(KEY)||'[]');if(!Array.isArray(saved))saved=[];}catch(e){saved=[];}
   const map=new Map(data._v37Original.map(r=>[key(r),{...r}]));
   const stationSet=new Set(data.stations.map(s=>s.id));
   for(const row of saved){if(!row||!stationSet.has(row.station)||!/^\w{3} \d{4}$/.test(row.period)||!Number.isFinite(row.consumption)||row.consumption<0)continue;
     map.set(key(row),{station:row.station,period:row.period,consumption:row.consumption,status:'Normal'});
   }
   data.records.splice(0,data.records.length,...map.values());
   const periods=[...new Set(data.records.map(r=>r.period))].sort((a,b)=>periodKey(a).localeCompare(periodKey(b)));
   data.periods.splice(0,data.periods.length,...periods);
 }
 function showStatus(s){$('recordImportStatus').textContent=s;}
 function clearPreview(){selectionToken++;pending=null;$('recordImportPreview').classList.add('hidden');$('recordImportErrors').textContent='';$('recordImportFile').value='';}
 function validate(rows,data){
   const errors=[];
   if(!rows.length)return {errors:['CSV file is empty.'],items:[]};
   if(rows[0].map(x=>x.trim().toLowerCase()).join(',')!=='station,period,consumption')return {errors:['Expected exactly three headers in order: station,period,consumption.'],items:[]};
   const ids=new Set(data.stations.map(s=>s.id)),seen=new Set(),items=[];
   const existing=new Map(data.records.map(r=>[key(r),r]));
   for(let i=1;i<rows.length;i++){
     const cols=rows[i];if(cols.length!==3){errors.push(`Row ${i+1}: expected 3 columns.`);continue;}
     const [station,period,raw]=cols.map(x=>x.trim());
     if(!ids.has(station)){errors.push(`Row ${i+1}: unknown station ID ${station||'(blank)'}.`);continue;}
     if(!/^(19|20)\d{2}-(0[1-9]|1[0-2])$/.test(period)){errors.push(`Row ${i+1}: period must be YYYY-MM.`);continue;}
     if(raw===''||!/^\d+(?:\.\d+)?$/.test(raw)||!Number.isFinite(Number(raw))){errors.push(`Row ${i+1}: consumption must be a nonnegative number (m³).`);continue;}
     const label=periodLabel(period),id=station+'|'+label;
     if(seen.has(id)){errors.push(`Row ${i+1}: duplicate station-month ${station} ${period}.`);continue;}
     seen.add(id);const consumption=Number(raw),prev=existing.get(id);
     items.push({station,period:label,consumption,change:prev?(prev.consumption===consumption?'Unchanged':'Update'):'New'});
   }
   if(items.length===0)errors.push('No valid data rows found.');
   return {errors,items};
 }
 function preview(file,data){
   if(!file)return;
   const token=++selectionToken;
   pending=null;pendingFileName=file.name;$('recordImportPreview').classList.add('hidden');
   showStatus(`Checking ${file.name}…`);
   if(file.size>2*1024*1024){showStatus('File too large for this demonstration (maximum 2 MB).');return;}
   if(!/\.csv$/i.test(file.name)){showStatus('Please export the Excel Import_Data sheet as CSV UTF-8 first.');return;}
   file.text().then(text=>{
     if(token!==selectionToken)return;
     const rows=parseCSV(text);pending=validate(rows,data);
     const {items,errors}=pending;
     $('recordImportPreview').classList.remove('hidden');
     const counts={New:0,Update:0,Unchanged:0};items.forEach(r=>counts[r.change]++);
     $('recordImportSummary').textContent=`${items.length} valid rows · ${counts.New} new · ${counts.Update} updates · ${counts.Unchanged} unchanged · ${errors.length} error(s).`;
     $('recordImportErrors').textContent=errors.slice(0,25).join('\n')+(errors.length>25?`\n…and ${errors.length-25} additional errors.`:'');
     $('recordImportRows').innerHTML=items.slice(0,12).map(r=>`<tr><td>${esc(r.station)}</td><td>${esc(r.period)}</td><td>${r.consumption}</td><td>${r.change}</td></tr>`).join('');
     $('confirmRecordImport').disabled=errors.length>0;
     showStatus(errors.length?'Import blocked. Correct the CSV errors and try again.':'Validated. Review the preview, then confirm to update AQUACAST.');
   }).catch(e=>{if(token!==selectionToken)return;pending=null;$('recordImportPreview').classList.add('hidden');showStatus(`Unable to read file: ${e.message}`);});
 }
 function readHistory(){try{const v=JSON.parse(localStorage.getItem(HISTORY_KEY)||'[]');return Array.isArray(v)?v:[];}catch{return [];}}
 function writeHistory(history){let snapshots=0;localStorage.setItem(HISTORY_KEY,JSON.stringify(history.filter(item=>!item.rows||++snapshots<=HISTORY_LIMIT).slice(0,40)));}
 function snapshotRows(data){return data.records.map(r=>({station:r.station,period:r.period,consumption:Number(r.consumption),status:r.status||'Normal'}));}
 function recordHistory(action,description,rows){const now=new Date();const item={id:now.getTime()+'-'+Math.random().toString(36).slice(2,8),at:now.toISOString(),action,description,rows};const prev=readHistory();writeHistory([item,...prev]);return prev;}
 function announceChange(data){restore(data);commitCallback();document.dispatchEvent(new Event('aquacast:records-updated'));renderHistory();}
 function openConfirmation(){if(!pending||pending.errors.length)return;const counts={New:0,Update:0,Unchanged:0};pending.items.forEach(r=>counts[r.change]++);$('recordImportConfirmDetails').textContent=`${pendingFileName} · ${counts.New} new · ${counts.Update} updates · ${counts.Unchanged} unchanged. Previous data will be preserved in Dataset history.`;$('recordImportConfirmModal').classList.remove('hidden');$('recordImportConfirmFinal').focus();}
 function closeConfirmation(){$('recordImportConfirmModal').classList.add('hidden');}
 function commit(data){
   if(!pending||pending.errors.length)return;
   let stored=[];try{stored=JSON.parse(localStorage.getItem(KEY)||'[]');if(!Array.isArray(stored))stored=[];}catch{stored=[];}
   const map=new Map(stored.map(r=>[key(r),r]));pending.items.forEach(r=>map.set(key(r),{station:r.station,period:r.period,consumption:r.consumption}));
   const before=localStorage.getItem(KEY),prevHistory=localStorage.getItem(HISTORY_KEY);
   try{
     recordHistory('Import',`${pendingFileName}: ${pending.items.length} validated rows`,snapshotRows(data));
     localStorage.setItem(KEY,JSON.stringify([...map.values()]));
   }catch(e){try{if(prevHistory===null)localStorage.removeItem(HISTORY_KEY);else localStorage.setItem(HISTORY_KEY,prevHistory);}catch{};showStatus('Import canceled: not enough browser storage to safely save the dataset and recovery snapshot.');closeConfirmation();return;}
   const count=pending.items.length;closeConfirmation();clearPreview();announceChange(data);showStatus(`${count} readings imported. Previous dataset saved in activity & dataset history. Charts, reports, and evaluation can now use the updated records.`);
 }
 function logActivity(action,description){try{recordHistory(action,description,null);renderHistory();}catch(e){console.warn('Local activity history unavailable',e);}}
 function restoreSnapshot(id,data){const item=readHistory().find(x=>x.id===id);if(!item)return;const beforeHistory=localStorage.getItem(HISTORY_KEY),beforeData=localStorage.getItem(KEY);
   if(!confirm(`Restore dataset from ${new Date(item.at).toLocaleString()}? Current records will first be saved as a new recoverable version. Flags and messages are unchanged.`))return;
   const originals=new Map(data._v37Original.map(r=>[key(r),r]));const imported=item.rows.filter(r=>!originals.has(key(r))||Number(originals.get(key(r)).consumption)!==Number(r.consumption)).map(r=>({station:r.station,period:r.period,consumption:r.consumption}));
   try{recordHistory('Restore',`Before restoring ${item.description}`,snapshotRows(data));localStorage.setItem(KEY,JSON.stringify(imported));}catch(e){try{if(beforeHistory===null)localStorage.removeItem(HISTORY_KEY);else localStorage.setItem(HISTORY_KEY,beforeHistory);if(beforeData===null)localStorage.removeItem(KEY);else localStorage.setItem(KEY,beforeData);}catch{};$('recordHistoryStatus').textContent='Restore failed: insufficient browser storage.';return;}
   activeSnapshot=null;$('recordHistoryOverview').classList.add('hidden');announceChange(data);showStatus('Previous dataset restored. The replaced version is available in history.');$('recordHistoryStatus').textContent='Restoration completed.';
 }
 function renderHistory(){const query=($('recordHistorySearch')?.value||'').trim().toLowerCase();const history=readHistory();$('recordHistoryList').innerHTML=history.filter(item=>[item.action,item.description,item.at,new Date(item.at).toLocaleString(),(item.rows?.length||'')].join(' ').toLowerCase().includes(query)).map(item=>`<div class="history-entry"><div><strong>${esc(item.action)}</strong><p>${esc(item.description)}</p><small>${esc(new Date(item.at).toLocaleString())} · ${item.rows?item.rows.length+' records':'Activity only'}</small></div>${item.rows?`<button type="button" class="secondary-button" data-history-id="${esc(item.id)}">Overview</button>`:''}</div>`).join('')||'<p class="small-muted">No saved activity matches your search. The first import creates the first recovery snapshot.</p>';
   if(activeSnapshot)renderSnapshotRows();
 }
 function renderSnapshotRows(){const item=readHistory().find(x=>x.id===activeSnapshot);if(!item){$('recordHistoryOverview').classList.add('hidden');return;}const q=$('recordHistoryRowsSearch').value.toLowerCase().trim(),rows=item.rows.filter(r=>(r.station+' '+r.period+' '+r.consumption).toLowerCase().includes(q));$('recordHistoryTitle').textContent=`${item.action} — ${new Date(item.at).toLocaleString()}`;$('recordHistoryStats').textContent=`${item.rows.length} records · ${new Set(item.rows.map(r=>r.station)).size} stations · snapshot saved before: ${item.description}`;$('recordHistoryRows').innerHTML=rows.slice(0,150).map(r=>`<tr><td>${esc(r.station)}</td><td>${esc(r.period)}</td><td>${esc(r.consumption)}</td></tr>`).join('');$('recordHistoryRowsCount').textContent=`Showing ${Math.min(rows.length,150)} of ${rows.length} matching records. Download CSV for the complete snapshot.`;}
 function exportSnapshot(){const item=readHistory().find(x=>x.id===activeSnapshot);if(!item)return;downloadRows(item.rows,'AQUACAST_previous_dataset_'+item.at.slice(0,10)+'.csv');}
 function downloadRows(rows,name){const csv='\uFEFFstation,period,consumption\r\n'+rows.map(r=>[r.station,periodKey(r.period),r.consumption].map(csvCell).join(',')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 function csvCell(x){const s=String(x);return /[",\n\r]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;}
 function download(data){
   const csv='\uFEFFstation,period,consumption\r\n'+data.records.map(r=>[r.station,periodKey(r.period),r.consumption].map(csvCell).join(',')).join('\r\n');
   const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='AQUACAST_current_records.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
 }
 function init({data,onCommit}){
   model=data;commitCallback=onCommit;
   const dropzone=$('recordImportDropzone'),fileInput=$('recordImportFile');
   fileInput.addEventListener('change',e=>preview(e.target.files[0],data));
   dropzone.addEventListener('click',e=>{if(e.target.closest('label,input'))return;fileInput.click();});
   dropzone.addEventListener('keydown',e=>{if(e.target!==dropzone)return;if(e.key==='Enter'||e.key===' '){e.preventDefault();fileInput.click();}});
   let dragDepth=0;
   dropzone.addEventListener('dragenter',e=>{e.preventDefault();dragDepth++;dropzone.classList.add('drag-over');});
   dropzone.addEventListener('dragover',e=>{e.preventDefault();e.dataTransfer.dropEffect='copy';dropzone.classList.add('drag-over');});
   dropzone.addEventListener('dragleave',e=>{e.preventDefault();dragDepth=Math.max(0,dragDepth-1);if(!dragDepth)dropzone.classList.remove('drag-over');});
   dropzone.addEventListener('drop',e=>{e.preventDefault();dragDepth=0;dropzone.classList.remove('drag-over');const files=e.dataTransfer?.files;if(!files?.length)return;if(files.length!==1){clearPreview();showStatus('Please drop one CSV file at a time.');return;}preview(files[0],data);});
   $('confirmRecordImport').addEventListener('click',openConfirmation);
   $('recordImportConfirmFinal').addEventListener('click',()=>commit(data));
   document.querySelectorAll('[data-record-confirm-close]').forEach(el=>el.addEventListener('click',closeConfirmation));
   $('recordImportConfirmModal').addEventListener('keydown',e=>{if(e.key==='Escape')closeConfirmation();});
   $('recordHistorySearch').addEventListener('input',renderHistory);
   $('recordHistoryRowsSearch').addEventListener('input',renderSnapshotRows);
   $('recordHistoryList').addEventListener('click',e=>{const b=e.target.closest('[data-history-id]');if(!b)return;activeSnapshot=b.dataset.historyId;$('recordHistoryRowsSearch').value='';$('recordHistoryOverview').classList.remove('hidden');renderSnapshotRows();$('recordHistoryOverview').scrollIntoView({behavior:'smooth',block:'nearest'});});
   $('recordHistoryExport').addEventListener('click',exportSnapshot);
   $('recordHistoryRestore').addEventListener('click',()=>restoreSnapshot(activeSnapshot,data));
   $('recordHistoryClose').addEventListener('click',()=>{activeSnapshot=null;$('recordHistoryOverview').classList.add('hidden');});
   renderHistory();
   $('cancelRecordImport').addEventListener('click',()=>{clearPreview();showStatus('Import canceled; records unchanged.');});
   $('downloadRecordsCSV').addEventListener('click',()=>{download(data);logActivity('Export','Downloaded current Consumption Records CSV');});
   $('resetImportedRecords').addEventListener('click',()=>{
     if(!confirm('Restore the original fictional dataset? The current records will be saved as a recoverable snapshot first. Manual flags and correspondence remain.'))return;
     const old=localStorage.getItem(HISTORY_KEY);try{recordHistory('Reset','Before restoring original fictional data',snapshotRows(data));localStorage.removeItem(KEY);}catch(e){try{if(old===null)localStorage.removeItem(HISTORY_KEY);else localStorage.setItem(HISTORY_KEY,old);}catch{}showStatus('Reset failed: unable to save a recovery snapshot.');return;}
     clearPreview();announceChange(data);showStatus('Original fictional records restored; previous dataset retained in history.');
   });
 }
 window.AQUACAST_IMPORTS={init,restore};
})();
