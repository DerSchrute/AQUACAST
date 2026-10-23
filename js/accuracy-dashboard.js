/* AQUACAST v3.8 — transparent, browser-local one-step-ahead backtest viewer. */
(()=>{'use strict';
const $=id=>document.getElementById(id), esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const methods={naive:a=>a.at(-1),movingAverage:a=>a.slice(-3).reduce((x,y)=>x+y,0)/Math.min(3,a.length),ses:a=>a.reduce((level,v,i)=>i===0?v:.3*v+.7*level,0),drift:a=>a.length<2?a.at(-1):a.at(-1)+(a.at(-1)-a[0])/(a.length-1),linearTrend:a=>{const n=a.length,x=(n-1)/2,y=a.reduce((s,v)=>s+v,0)/n;let top=0,bot=0;for(let i=0;i<n;i++){top+=(i-x)*(a[i]-y);bot+=(i-x)**2;}return y+(bot?top/bot:0)*(n-x);}};
const monthNames=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const periodKey=s=>{const m=/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{4})$/.exec(s);return m?`${m[2]}-${String(monthNames.indexOf(m[1])+1).padStart(2,'0')}`:s;};
const appRows=()=>window.AQUACAST_DATA.records.map(r=>({station:r.station,period:periodKey(r.period),consumption:Number(r.consumption)}));
function rows(){return $('v38Source').value==='research'?(window.AQUACAST_EVALUATION?.getCurrent().records||[]):appRows();}
function stations(){const sel=$('v38Station'),old=sel.value,ids=[...new Set(rows().map(r=>r.station))].sort();sel.innerHTML=ids.map(id=>{const st=window.AQUACAST_DATA.stations.find(x=>x.id===id);return `<option value="${esc(id)}">${esc(st?.name||id)} (${esc(id)})</option>`;}).join('');if(ids.includes(old))sel.value=old;}
function draw(pred){const host=$('v38Plot');if(!pred.length){host.innerHTML='';return;}
 const width=760,height=250,left=54,right=18,top=24,bottom=42,all=pred.flatMap(p=>[p.actual,p.forecast]),min=Math.max(0,Math.min(...all)*.9),max=Math.max(...all)*1.1+1,xx=i=>left+(width-left-right)*(pred.length===1?.5:i/(pred.length-1)),yy=v=>top+(height-top-bottom)*(1-(v-min)/(max-min));
 const points=k=>pred.map((p,i)=>`${xx(i).toFixed(1)},${yy(p[k]).toFixed(1)}`).join(' ');
 const labels=[0,.25,.5,.75,1].map(t=>{const v=min+(max-min)*t,y=yy(v);return `<line x1="${left}" x2="${width-right}" y1="${y}" y2="${y}" stroke="#e1e8eb"/><text x="${left-8}" y="${y+4}" text-anchor="end" font-size="12" fill="#596d76">${v.toFixed(0)}</text>`;}).join('');
 const step=Math.max(1,Math.ceil(pred.length/6)),ticks=pred.map((p,i)=>i%step===0||i===pred.length-1?`<text x="${xx(i)}" y="${height-12}" text-anchor="middle" font-size="11" fill="#596d76">${esc(p.period.slice(2))}</text>`:'').join('');
 host.innerHTML=`<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Actual readings and one-step-ahead predictions">${labels}<polyline points="${points('actual')}" fill="none" stroke="#147e92" stroke-width="3" stroke-linejoin="round"/><polyline points="${points('forecast')}" fill="none" stroke="#e18a42" stroke-width="3" stroke-dasharray="7 5" stroke-linejoin="round"/>${ticks}<line x1="${left}" y1="${height-bottom}" x2="${width-right}" y2="${height-bottom}" stroke="#869da7"/><text x="${left}" y="15" font-size="12" fill="#147e92">━━ Actual</text><text x="${left+112}" y="15" font-size="12" fill="#b96d2d">┄┄ Predicted</text></svg>`;
}
function render(){const status=$('v38Status');if(!status)return;stations();const id=$('v38Station').value,series=rows().filter(r=>r.station===id).sort((a,b)=>a.period.localeCompare(b.period));const clear=message=>{status.textContent=message;$('v38Metrics').innerHTML='';$('v38Predictions').innerHTML='';$('v38Plot').innerHTML='';};
 if(!id){clear('No records available for this data source.');return;}
 if(series.length<7){clear(`Only ${series.length} months for this station. At least 7 consecutive months are required for a 6-month initial training window.`);return;}
 const seen=new Set(),gaps=[];for(let i=0;i<series.length;i++){if(seen.has(series[i].period))gaps.push('duplicate '+series[i].period);seen.add(series[i].period);if(i){const [y,m]=series[i-1].period.split('-').map(Number),next=`${y+(m===12?1:0)}-${String(m===12?1:m+1).padStart(2,'0')}`;if(series[i].period!==next)gaps.push(`${next} → ${series[i].period}`);}}
 if(gaps.length){clear('Backtest unavailable: missing or duplicate months: '+gaps.slice(0,4).join(', '));return;}
 const model=$('v38Model').value,fn=methods[model];if(!fn)return;
 const predictions=[];for(let i=6;i<series.length;i++){const hist=series.slice(0,i).map(r=>r.consumption),actual=series[i].consumption,forecast=Math.max(0,fn(hist));predictions.push({period:series[i].period,actual,forecast,error:Math.abs(actual-forecast)});}
 const mae=predictions.reduce((s,r)=>s+r.error,0)/predictions.length,rmse=Math.sqrt(predictions.reduce((s,r)=>s+(r.actual-r.forecast)**2,0)/predictions.length);
 const baseline=predictions.map((r,i)=>Math.abs(r.actual-series[i+5].consumption)),baselineMae=baseline.reduce((s,v)=>s+v,0)/baseline.length;
 status.textContent=`${$('v38Source').value==='app'?'Current fictional / locally imported Consumption Records':'Separately loaded Model evaluation CSV'} · ${series.length} months · ${predictions.length} test months · rolling one-step-ahead backtest`;
 const metric=(label,value)=>`<div class="v38-metric"><span>${label}</span><strong>${value}</strong></div>`;
 $('v38Metrics').innerHTML=metric('MAE',mae.toFixed(2)+' m³')+metric('RMSE',rmse.toFixed(2)+' m³')+metric('Naïve baseline MAE',baselineMae.toFixed(2)+' m³');
 $('v38Predictions').innerHTML=predictions.map(r=>`<tr><td>${esc(r.period)}</td><td>${r.actual.toFixed(2)}</td><td>${r.forecast.toFixed(2)}</td><td>${r.error.toFixed(2)}</td></tr>`).join('');draw(predictions);
}
function init(){if(!$('v38Source'))return;['v38Source','v38Station','v38Model'].forEach(id=>$(id).addEventListener('change',render));document.addEventListener('aquacast:records-updated',render);document.addEventListener('aquacast:evaluation-updated',render);document.addEventListener('aquacast:page',e=>{if(e.detail?.page==='evaluation')render();});render();}
document.addEventListener('DOMContentLoaded',init);
})();
