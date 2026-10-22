/* AQUACAST adaptive chart controller: Chart.js online, local canvas offline. */
(function () {
  'use strict';
  const native = window.AQUACAST_NATIVE_CHARTS;
  const CDN = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.8/dist/chart.umd.min.js';
  const instances = {};
  const latest = {};
  let preference = 'auto';
  let active = 'offline';
  let loading = null;
  const status = () => document.getElementById('chartModeStatus');
  function updateStatus(message) {
    const el = status();
    if (el) el.textContent = message || ('Charts: ' + (active === 'online' ? 'Online · Chart.js' : 'Offline · Canvas'));
  }
  function destroy(id) {
    if (instances[id]) { instances[id].destroy(); delete instances[id]; }
  }
  function destroyAll() { Object.keys(instances).forEach(destroy); }
  function loadChartJs() {
    if (window.Chart) return Promise.resolve(true);
    if (loading) return loading;
    loading = new Promise(resolve => {
      const script = document.createElement('script');
      script.src = CDN;
      script.async = true;
      let settled = false;
      const finish = ok => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        if (!ok) script.remove();
        resolve(ok && !!window.Chart);
      };
      const timer = setTimeout(() => finish(false), 3500);
      script.onload = () => finish(true);
      script.onerror = () => finish(false);
      document.head.appendChild(script);
    }).finally(() => { loading = null; });
    return loading;
  }
  function drawNative() {
    destroyAll();
    active = 'offline';
    if (latest.dashboard) native.renderDashboard(...latest.dashboard);
    if (latest.forecast) native.renderFutureForecast(...latest.forecast);
    updateStatus();
  }
  function drawOnline() {
    if (!window.Chart) return drawNative();
    active = 'online';
    const baseOptions = {
      responsive:true, maintainAspectRatio:false, animation:false,
      plugins:{legend:{display:false},tooltip:{enabled:true}},
      scales:{x:{grid:{display:false},ticks:{autoSkip:true,maxTicksLimit:7}},
              y:{min:0,grid:{color:'#edf0f3'},ticks:{precision:2}}}
    };
    const specs = [
      ['consumptionChart',latest.dashboard,'#2a8585',false],
      ['forecastChart',latest.forecast,'#7c91b8',true]
    ];
    specs.forEach(([id,values,color,dashed]) => {
      destroy(id);
      if (!values) return;
      const canvas=document.getElementById(id);
      if (!canvas || !canvas.getBoundingClientRect().width) return;
      const axis = window.AQUACAST_CHART_SCALE(values[1]);
      const options = {
        ...baseOptions,
        scales: {...baseOptions.scales, y:{...baseOptions.scales.y, min:axis.min, max:axis.max,
          ticks:{stepSize:axis.step, precision:2}}}
      };
      instances[id] = new window.Chart(canvas,{
        type:'line',
        data:{labels:values[0],datasets:[{data:values[1],borderColor:color,backgroundColor:'rgba(42,133,133,.10)',fill:!dashed,tension:0,borderWidth:2.5,pointRadius:3,pointBackgroundColor:'#ffffff',pointBorderColor:color,pointBorderWidth:2,borderDash:dashed?[6,4]:[]}]},
        options
      });
    });
    updateStatus();
  }
  let version = 0;
  async function selectMode() {
    const request = ++version;
    if (preference === 'offline') return drawNative();
    updateStatus('Charts: Checking online renderer…');
    const available = await loadChartJs();
    if (request !== version) return;
    if (available) drawOnline();
    else {
      drawNative();
      updateStatus(preference === 'online' ? 'Charts: CDN unavailable · Offline fallback' : 'Charts: Offline fallback');
    }
  }
  function renderCurrent() {
    if (active === 'online') drawOnline();
    else drawNative();
  }
  window.AQUACAST_CHARTS = {
    renderDashboard(labels,values) { latest.dashboard=[labels.slice(),values.slice()]; renderCurrent(); },
    renderFutureForecast(labels,values) { latest.forecast=[labels.slice(),values.slice()]; renderCurrent(); },
    setMode(mode) { if (!['auto','online','offline'].includes(mode)) return; preference=mode; selectMode(); },
    redraw:renderCurrent
  };
  window.addEventListener('online', () => { if(preference==='auto') selectMode(); });
  window.addEventListener('offline', () => { if(preference==='auto') { version++; drawNative(); } });
  window.addEventListener('resize', () => requestAnimationFrame(renderCurrent));
  document.addEventListener('DOMContentLoaded', () => {
    const select=document.getElementById('chartMode');
    if(select) select.addEventListener('change', e=>window.AQUACAST_CHARTS.setMode(e.target.value));
    selectMode();
  });
})();
