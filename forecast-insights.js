/* AQUACAST v1.6: read-only forecasting research view; no server requests. */
(function(){'use strict';
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=v=>v==null?'N/A':Number(v).toFixed(2);
let source='sample',station='',selectedModel='selected';
function context(){const g=$('globalStation');return {id:g?.value||'all',restricted:!!g?.disabled};}
function records(){const api=window.AQUACAST_EVALUATION;if(!api)return [];return source==='import'?api.getCurrent().records:api.sample();}
function refreshStations(){const rows=records(),allowed=context(),ids=[...new Set(rows.map(r=>r.station))].sort();const permitted=allowed.restricted?ids.filter(id=>id===allowed.id):ids;const sel=$('forecastLabStation');if(!sel)return;
 if(!permitted.includes(station))station=permitted[0]||'';
 sel.innerHTML=permitted.map(id=>{const found=window.AQUACAST_DATA.stations.find(s=>s.id===id);return `<option value="${esc(id)}">${esc(found?found.name+' · '+id:id)}</option>`;}).join('');sel.value=station;
}
function draw(points){const canvas=$('forecastLabChart');if(!canvas)return;const box=canvas.getBoundingClientRect();if(!box.width||!box.height)return;const dpr=Math.max(1,window.devicePixelRatio||1),w=box.width,h=box.height;canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);const c=canvas.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,w,h);if(!points.length)return;
 const left=54,right=20,top=24,bottom=46,pw=w-left-right,ph=h-top-bottom;const max=Math.max(1,...points.flatMap(p=>[p.actual,p.forecast]))*1.12;const x=i=>left+(points.length===1?pw/2:i*pw/(points.length-1)),y=v=>top+ph-(v/max)*ph;
 c.font='12px Arial';c.lineWidth=1;c.textAlign='right';for(let i=0;i<=4;i++){const val=max*i/4,yy=y(val);c.strokeStyle='#dfe7ea';c.beginPath();c.moveTo(left,yy);c.lineTo(w-right,yy);c.stroke();c.fillStyle='#64748b';c.fillText(val.toFixed(0),left-9,yy+4);}
 const series=[{key:'actual',color:'#2a8585',dash:[]},{key:'forecast',color:'#7c91b8',dash:[6,4]}];for(const line of series){c.beginPath();c.strokeStyle=line.color;c.lineWidth=2.5;c.setLineDash(line.dash);points.forEach((p,i)=>i?c.lineTo(x(i),y(p[line.key])):c.moveTo(x(i),y(p[line.key])));c.stroke();c.setLineDash([]);points.forEach((p,i)=>{c.beginPath();c.arc(x(i),y(p[line.key]),3,0,Math.PI*2);c.fillStyle=line.color;c.fill();});}
 c.fillStyle='#64748b';c.textAlign='center';c.font='11px Arial';const stride=Math.max(1,Math.ceil(points.length/7));points.forEach((p,i)=>{if(i%stride===0||i===points.length-1)c.fillText(p.period,x(i),h-19);});
}
function render(){if(!$('forecastLabStation') || $('globalStation')?.disabled)return;refreshStations();const api=window.AQUACAST_EVALUATION,rows=records(),summary=$('forecastLabSummary'),table=$('forecastLabTable'),warning=$('forecastLabWarning'),label=$('forecastLabSource');
 label.textContent=source==='sample'?'FICTIONAL SAMPLE · This comparison is a functioning algorithm demonstration, not measured NOPPO accuracy.':(api.getCurrent().records.length?api.getCurrent().provenance+' · This browser-only sandbox does not establish data authorization.':'No CSV imported yet. Visit Model evaluation and import a CSV first.');
 const r=api.analyze(rows).find(x=>x.station===station);if(!r||!r.best){summary.innerHTML='';table.innerHTML='<tr><td colspan="6">Not evaluable: select a station with at least 7 consecutive monthly observations and no missing months.</td></tr>';warning.textContent=r?.gaps.length?'Missing months: '+r.gaps.join(', '):'No eligible station records available.';draw([]);return;}
 const chosen=selectedModel==='selected'?r.best:r.methods.find(m=>m.key===selectedModel)||r.best;
 const baseline=r.baseline;const improvement=baseline.mae>0?100*(baseline.mae-r.best.mae)/baseline.mae:0;
 warning.textContent=`${r.observations} historical months · ${chosen.count} walk-forward test months · Best model chosen using these same test months (not an independent holdout).`;
 summary.innerHTML=[['Inspected model',chosen.name],['Next month estimate',fmt(chosen.next)+' m³'],['Backtest MAE',fmt(chosen.mae)+' m³'],['Backtest RMSE',fmt(chosen.rmse)+' m³'],['Backtest MASE',fmt(chosen.mase)],['Selected vs naïve MAE',fmt(improvement)+'% lower']].map(([a,b])=>`<div class="forecast-lab-metric"><span>${esc(a)}</span><strong>${esc(b)}</strong></div>`).join('');
 table.innerHTML=r.methods.map(m=>`<tr${m.key===chosen.key?' class="forecast-lab-highlight"':''}><td>${esc(m.name)}</td><td>${fmt(m.mae)}</td><td>${fmt(m.rmse)}</td><td>${fmt(m.mase)}</td><td>${m.count}</td><td>${m.key===r.best.key?'Selected':''}</td></tr>`).join('');
 requestAnimationFrame(()=>draw(chosen.predictions));
}
function init(){if(!$('forecastLabStation'))return;$('forecastDataSource').addEventListener('change',e=>{source=e.target.value;station='';render();});$('forecastLabStation').addEventListener('change',e=>{station=e.target.value;render();});$('forecastLabModel').addEventListener('change',e=>{selectedModel=e.target.value;render();});document.addEventListener('aquacast:evaluation-updated',()=>{if(source==='import')render();});document.addEventListener('aquacast:page',e=>{if(e.detail.page==='forecasting')render();});window.addEventListener('resize',()=>{if($('page-forecasting')?.classList.contains('active'))render();});render();}
document.addEventListener('DOMContentLoaded',init);
})();