/* AQUACAST local-only research sandbox: no uploaded CSV leaves this browser. */
(function(){
'use strict';
const models={
  naive:(a)=>a[a.length-1],
  movingAverage:(a)=>a.slice(-Math.min(3,a.length)).reduce((s,v)=>s+v,0)/Math.min(3,a.length),
  ses:(a)=>{let level=a[0];for(let i=1;i<a.length;i++)level=.3*a[i]+.7*level;return level;},
  drift:(a)=>a.length<2?a[a.length-1]:a[a.length-1]+(a[a.length-1]-a[0])/(a.length-1),
  linearTrend:(a)=>{const n=a.length;if(n<3)return a[n-1];const xm=(n-1)/2,ym=a.reduce((x,y)=>x+y,0)/n;let numerator=0,denominator=0;for(let i=0;i<n;i++){numerator+=(i-xm)*(a[i]-ym);denominator+=(i-xm)**2;}return ym+(numerator/denominator)*(n-xm);}
};
const names={naive:'Naïve (last observation)',movingAverage:'3-period moving average',ses:'Exponential smoothing (α = 0.30)',drift:'Naïve with drift',linearTrend:'Linear trend (least squares)'};
function parseCSV(text){
  const rows=[];let row=[],cell='',quoted=false;
  text=text.replace(/^\uFEFF/,'');
  for(let i=0;i<text.length;i++){const c=text[i];if(quoted){if(c==='"'&&text[i+1]==='"'){cell+='"';i++;}else if(c==='"')quoted=false;else cell+=c;}else if(c==='"')quoted=true;else if(c===','){row.push(cell.trim());cell='';}else if(c==='\n'){row.push(cell.trim());rows.push(row);row=[];cell='';}else if(c!=='\r')cell+=c;}
  if(quoted)throw Error('Unclosed CSV quote.');
  if(cell.length||row.length){row.push(cell.trim());rows.push(row);}
  if(!rows.length)throw Error('CSV file is empty.');
  const head=rows.shift().map(x=>x.toLowerCase().replace(/\s+/g,'_'));
  const cols=['station','period','consumption'];for(const c of cols)if(!head.includes(c))throw Error('Required CSV headers: station,period,consumption');
  const out=[],seen=new Set(),errors=[];
  rows.forEach((r,i)=>{if(r.length===1&&!r[0])return;const item=Object.fromEntries(head.map((k,j)=>[k,r[j]||'']));const st=item.station,period=item.period,v=Number(item.consumption);
    if(!st||! /^\d{4}-(0[1-9]|1[0-2])$/.test(period)||!item.consumption||!Number.isFinite(v)||v<0){errors.push('Row '+(i+2)+': invalid station, YYYY-MM period, or nonnegative consumption.');return;}
    const key=st+'|'+period;if(seen.has(key)){errors.push('Row '+(i+2)+': duplicate station and month.');return;}seen.add(key);
    out.push({station:st,period,consumption:v});
  });
  if(errors.length)throw Error(errors.slice(0,8).join('\n')+(errors.length>8?'\n…and '+(errors.length-8)+' more errors.':''));
  if(!out.length)throw Error('No valid records found.');
  return out;
}
function analyze(records,minTrain=6){
  const grouped={};records.forEach(r=>(grouped[r.station]??=[]).push(r));
  const results=[];
  for(const [station,items] of Object.entries(grouped)){
    items.sort((a,b)=>a.period.localeCompare(b.period));
    const gaps=[];for(let i=1;i<items.length;i++){const [y,m]=items[i-1].period.split('-').map(Number);const next=`${y+(m===12?1:0)}-${String(m===12?1:m+1).padStart(2,'0')}`;if(items[i].period!==next)gaps.push(next+' → '+items[i].period);}
    const row={station,observations:items.length,gaps,methods:[],best:null};
    if(items.length>minTrain&&!gaps.length){
      for(const [key,fn] of Object.entries(models)){
        const errors=[],predictions=[];
        for(let i=minTrain;i<items.length;i++){const actual=items[i].consumption,forecast=Math.max(0,fn(items.slice(0,i).map(r=>r.consumption)));errors.push(actual-forecast);predictions.push({period:items[i].period,actual,forecast});}
        const mae=errors.reduce((s,e)=>s+Math.abs(e),0)/errors.length;
        const rmse=Math.sqrt(errors.reduce((s,e)=>s+e*e,0)/errors.length);
        const naiveScale=items.slice(1,minTrain).reduce((s,r,i)=>s+Math.abs(r.consumption-items[i].consumption),0)/(minTrain-1);
        const mase=naiveScale>0?mae/naiveScale:null;
        row.methods.push({key,name:names[key],mae,rmse,mase,count:errors.length,predictions,next:Math.max(0,fn(items.map(r=>r.consumption)))});
      }
      row.methods.sort((a,b)=>a.mae-b.mae||a.rmse-b.rmse||a.key.localeCompare(b.key));
      // Conservative selection: keep the naïve model unless a challenger improves MAE by >= 5%.
      // This is a heuristic, not a statistical guarantee or independent holdout.
      const baseline=row.methods.find(m=>m.key==='naive');
      const leader=row.methods[0];
      row.best=leader.key==='naive'||(baseline.mae>0&&leader.mae<=baseline.mae*0.95)?leader:baseline;
      row.baseline=baseline;
      row.improvement=baseline.mae>0?100*(baseline.mae-row.best.mae)/baseline.mae:0;
    }
    results.push(row);
  }
  return results.sort((a,b)=>a.station.localeCompare(b.station));
}
function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
const fmt=n=>n==null?'N/A':Number(n).toFixed(2);
let current=[],provenance='none';
function render(){
  if(document.getElementById('globalStation')?.disabled)return;
  const status=document.getElementById('evaluationStatus'),summary=document.getElementById('evaluationResults');if(!status||!summary)return;
  if(!current.length){status.textContent='No dataset loaded.';summary.innerHTML='';return;}
  const results=analyze(current),eligible=results.filter(r=>r.best),ineligible=results.filter(r=>!r.best);
  status.textContent=`${provenance} · ${current.length} observations · ${results.length} station(s) · ${eligible.length} evaluable · ${ineligible.length} insufficient/gapped.`;
  summary.innerHTML='<p class="small-muted">Research sandbox only. These are walk-forward, one-month-ahead backtests. Each model is fitted using past observations only. A challenger replaces the naïve baseline only with at least 5% lower MAE. Selection still uses the same backtest and is <strong>not an independent final test</strong>. No production accuracy claim is supported.</p>'+
    results.map(r=>`<article class="panel" style="margin-top:12px"><h3>${escapeHTML(r.station)}</h3><p class="small-muted">${r.observations} observations${r.gaps.length?' · Missing month(s): '+escapeHTML(r.gaps.join(', ')):''}</p>`+
      (r.best?`<p><strong>Conservatively selected model:</strong> ${escapeHTML(r.best.name)} · next-month estimate ${fmt(r.best.next)} m³ (research demonstration) · backtest MAE improvement over naïve: ${fmt(r.improvement)}%</p><div class="table-scroll"><table><thead><tr><th>Model</th><th>MAE (m³)</th><th>RMSE (m³)</th><th>MASE</th><th>Test months</th></tr></thead><tbody>${r.methods.map(m=>`<tr><td>${escapeHTML(m.name)}</td><td>${fmt(m.mae)}</td><td>${fmt(m.rmse)}</td><td>${fmt(m.mase)}</td><td>${m.count}</td></tr>`).join('')}</tbody></table></div>`:
      '<p class="small-muted">Not evaluated: at least 7 consecutive monthly observations required (first 6 for training). No missing months may occur.</p>')+'</article>').join('');
}
function sample(){
 const rows=window.AQUACAST_DATA.records,periods=window.AQUACAST_DATA.periods;
 return rows.map(r=>({station:r.station,period:`2026-${String(periods.indexOf(r.period)+1).padStart(2,'0')}`,consumption:r.consumption})).filter(r=>!r.period.endsWith('-00'));
}
function download(filename,content,type){
 const blob=new Blob([content],{type});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000);
}
function init(){
 const file=document.getElementById('evaluationCSV'),error=document.getElementById('evaluationError');
 document.getElementById('loadSampleEvaluation').addEventListener('click',()=>{current=sample();provenance='FICTIONAL SAMPLE — NOT REAL ACCURACY';error.textContent='';render();document.dispatchEvent(new Event('aquacast:evaluation-updated'));});
 file.addEventListener('change',async()=>{if(!file.files[0])return;try{if(file.files[0].size>3e6)throw Error('File too large (maximum 3 MB).');const rows=parseCSV(await file.files[0].text());current=rows;provenance='LOCAL CSV — provenance must be independently verified';error.textContent='';render();document.dispatchEvent(new Event('aquacast:evaluation-updated'));}catch(e){error.textContent=e.message;current=[];render();}});
 document.getElementById('exportEvaluation').addEventListener('click',()=>{if(!current.length){error.textContent='Load a dataset first.';return;}const results=analyze(current);const csv=['station,model,mae_m3,rmse_m3,mase,test_months,observations,gap_count,selected_on_backtest,improvement_vs_naive_percent,provenance'];for(const r of results)for(const m of r.methods)csv.push([JSON.stringify(r.station),JSON.stringify(m.name),fmt(m.mae),fmt(m.rmse),fmt(m.mase),m.count,r.observations,r.gaps.length,m===r.best?'yes':'no',fmt(r.improvement||0),JSON.stringify(provenance)].join(','));download('aquacast-backtest-results.csv',csv.join('\r\n'),'text/csv');});
 document.getElementById('downloadCSVTemplate').addEventListener('click',()=>download('aquacast-import-template.csv','station,period,consumption\nEXAMPLE-STATION,2025-01,120\nEXAMPLE-STATION,2025-02,125\n','text/csv'));
}
document.addEventListener('DOMContentLoaded',init);
window.AQUACAST_EVALUATION={parseCSV,analyze,sample,getCurrent:()=>({records:current.slice(),provenance})};
 document.addEventListener('aquacast:evaluation-updated',()=>{});
})();
