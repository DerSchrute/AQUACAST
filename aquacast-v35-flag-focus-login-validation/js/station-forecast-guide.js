/* AQUACAST: station-scoped, plain-language forecast explanation. Fictional data only. */
(function(){'use strict';
const $=id=>document.getElementById(id);
const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>Number(n).toLocaleString(undefined,{maximumFractionDigits:1});
const names={naive:'Last month’s usage',movingAverage:'Recent months’ average',ses:'Recent usage pattern',drift:'Longer-term change',linearTrend:'Overall trend'};
function render(){
 const panel=$('stationForecastGuide'),out=$('stationForecastSummary'),global=$('globalStation');
 if(!panel||!out||panel.classList.contains('hidden')||!global?.disabled)return;
 const station=global.value,api=window.AQUACAST_EVALUATION;
 if(!station||!api)return;
 const rows=api.sample().filter(r=>r.station===station).sort((a,b)=>a.period.localeCompare(b.period));
 const result=api.analyze(rows).find(r=>r.station===station);
 if(!result?.best){out.innerHTML='<p>There is not enough continuous sample history to explain this forecast yet.</p>';return;}
 const m=result.best,first=rows[0].consumption,last=rows[rows.length-1].consumption;
 const change=last-first,percent=first>0?Math.abs(change/first*100):null;
 const trend=Math.abs(change)<Math.max(1,first*.05)?'mostly steady':change>0?'generally increasing':'generally decreasing';
 const error=m.mae,usage=Math.max(1,rows.reduce((s,r)=>s+r.consumption,0)/rows.length);
 const rel=error/usage;
 const caution=rel<.1?'Past estimates were fairly close to recorded use in this sample.':rel<.2?'Past estimates sometimes differed noticeably from recorded use.':'Past estimates differed considerably from recorded use, so this forecast needs extra caution.';
 const baseline=result.baseline,improve=baseline.mae>0?(baseline.mae-m.mae)/baseline.mae:null;
 const modelExplanation=improve!=null&&improve>=.05?'This approach performed better than simply repeating last month’s usage in the sample checks.':'A simpler approach was retained because alternatives did not show a clear enough improvement.';
 out.innerHTML=`<div class="station-guide-cards">
 <div class="station-guide-card"><span>Water-use pattern</span><strong>${safe(trend)}</strong><p>Comparing the earliest and latest sample months${percent===null?'':` (${fmt(percent)}% ${change>=0?'higher':'lower'})`}.</p></div>
 <div class="station-guide-card"><span>Next month’s estimate</span><strong>${fmt(m.next)} m³</strong><p>An estimate based on this station’s sample history, not a confirmed reading.</p></div>
 <div class="station-guide-card"><span>Typical past difference</span><strong>About ${fmt(error)} m³</strong><p>On average, earlier one-month estimates differed from actual sample usage by this amount.</p></div>
 </div><div class="station-guide-explanation"><h3>How this estimate was chosen</h3><p><strong>${safe(names[m.key]||'Usage history')}</strong> was used to estimate the next month. ${safe(modelExplanation)}</p><p>${safe(caution)}</p><p><strong>What to look for:</strong> Compare the forecast with the station’s actual usage when the next month’s reading becomes available. A forecast is a planning guide, not a guaranteed amount.</p></div>`;
}
function init(){document.addEventListener('aquacast:page',e=>{if(e.detail?.page==='forecasting')requestAnimationFrame(render);});$('globalStation')?.addEventListener('change',()=>requestAnimationFrame(render));}
document.addEventListener('DOMContentLoaded',init);
})();
