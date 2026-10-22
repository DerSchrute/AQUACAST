/* AQUACAST native canvas charts — no CDN, package install, or network required. */
(function () {
  const COLORS = {
    teal: '#2a8585',
    tealFill: 'rgba(42,133,133,0.10)',
    blue: '#7c91b8',
    grid: '#edf0f3',
    text: '#8996a3',
    white: '#ffffff'
  };

  // Shared, zero-based scale: both renderers use exactly five labeled ticks.
  function axisFor(values) {
    const finite = values.filter(Number.isFinite);
    const peak = finite.length ? Math.max(0, ...finite) : 0;
    const roughStep = Math.max(peak / 4, 0.25);
    const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
    const step = [1, 2, 2.5, 5, 10].map(n => n * magnitude).find(n => n >= roughStep) || 10 * magnitude;
    return { min: 0, max: 4 * step, step };
  }
  window.AQUACAST_CHART_SCALE = axisFor;

  function getCanvas(id) {
    const canvas = document.getElementById(id);
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const width = Math.round(rect.width * dpr);
    const height = Math.round(rect.height * dpr);
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);
    return { canvas, ctx, width: rect.width, height: rect.height };
  }

  function drawLineChart(canvasId, labels, datasets) {
    const surface = getCanvas(canvasId);
    if (!surface) return;
    const { ctx, width, height } = surface;
    const compact = width < 420;
    const pad = { top: 14, right: 12, bottom: compact ? 31 : 34, left: compact ? 39 : 46 };
    const plotW = Math.max(20, width - pad.left - pad.right);
    const plotH = Math.max(20, height - pad.top - pad.bottom);
    const allValues = datasets.flatMap(ds => ds.values.filter(v => Number.isFinite(v)));
    if (!allValues.length) return;
    const { min, max } = axisFor(allValues);
    const x = i => pad.left + (labels.length <= 1 ? plotW / 2 : i * plotW / (labels.length - 1));
    const y = value => pad.top + (max - value) / (max - min) * plotH;

    ctx.font = `${compact ? 10 : 11}px Arial, Helvetica, sans-serif`;
    ctx.lineWidth = 1;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const value = min + (max - min) * i / 4;
      const yy = y(value);
      ctx.strokeStyle = COLORS.grid;
      ctx.beginPath(); ctx.moveTo(pad.left, yy); ctx.lineTo(width - pad.right, yy); ctx.stroke();
      ctx.fillStyle = COLORS.text;
      ctx.fillText(Number(value.toFixed(2)).toString(), pad.left - 7, yy);
    }

    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const labelStep = labels.length > 8 ? Math.ceil(labels.length / 6) : 1;
    labels.forEach((label, i) => {
      if (i % labelStep !== 0 && i !== labels.length - 1) return;
      const text = String(label);
      ctx.fillStyle = COLORS.text;
      ctx.fillText(text.length > 11 ? text.slice(0, 10) + '…' : text, x(i), height - pad.bottom + 10, Math.max(42, plotW / Math.max(1, labels.length) + 8));
    });

    datasets.forEach(ds => {
      const points = ds.values.map((value, i) => ({ value, i })).filter(point => Number.isFinite(point.value));
      if (!points.length) return;
      if (ds.fill) {
        ctx.beginPath();
        ctx.moveTo(x(points[0].i), y(points[0].value));
        points.slice(1).forEach(point => ctx.lineTo(x(point.i), y(point.value)));
        ctx.lineTo(x(points[points.length - 1].i), pad.top + plotH);
        ctx.lineTo(x(points[0].i), pad.top + plotH);
        ctx.closePath();
        ctx.fillStyle = COLORS.tealFill;
        ctx.fill();
      }
      ctx.beginPath();
      ctx.strokeStyle = ds.color;
      ctx.lineWidth = 2.5;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.setLineDash(ds.dashed ? [6, 4] : []);
      points.forEach((point, index) => {
        if (index === 0) ctx.moveTo(x(point.i), y(point.value));
        else ctx.lineTo(x(point.i), y(point.value));
      });
      ctx.stroke();
      ctx.setLineDash([]);
      points.forEach(point => {
        ctx.beginPath();
        ctx.arc(x(point.i), y(point.value), ds.dashed ? 3 : 2.8, 0, Math.PI * 2);
        ctx.fillStyle = COLORS.white;
        ctx.fill();
        ctx.strokeStyle = ds.color;
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    });
  }

  let latestDashboard = null;
  let latestForecast = null;
  function renderAll() {
    if (latestDashboard) drawLineChart('consumptionChart', latestDashboard.labels, [{ values: latestDashboard.values, color: COLORS.teal, fill: true }]);
    if (latestForecast) {
      if (!latestForecast.historyLabels.length) {
        drawLineChart('forecastChart', latestForecast.forecastLabels, [{ values: latestForecast.forecastValues, color: COLORS.blue, dashed: true, fill: false }]);
        return;
      }
      const labels = latestForecast.historyLabels.concat(latestForecast.forecastLabels);
      const historical = latestForecast.historyValues.concat(Array(latestForecast.forecastLabels.length).fill(null));
      const forecast = Array(Math.max(0, latestForecast.historyLabels.length - 1)).fill(null)
        .concat(latestForecast.historyValues.slice(-1), latestForecast.forecastValues);
      drawLineChart('forecastChart', labels, [
        { values: historical, color: COLORS.teal, fill: false },
        { values: forecast, color: COLORS.blue, dashed: true, fill: false }
      ]);
    }
  }

  window.AQUACAST_NATIVE_CHARTS = {
    renderDashboard(labels, values) {
      latestDashboard = { labels: labels.slice(), values: values.slice() };
      drawLineChart('consumptionChart', labels, [{ values, color: COLORS.teal, fill: true }]);
    },
    renderFutureForecast(labels, values) {
      latestForecast = { historyLabels: [], historyValues: [], forecastLabels: labels.slice(), forecastValues: values.slice() };
      drawLineChart('forecastChart', labels, [{ values: values, color: COLORS.blue, dashed: true, fill: false }]);
    },
    renderForecast(historyLabels, historyValues, forecastLabels, forecastValues) {
      latestForecast = {
        historyLabels: historyLabels.slice(), historyValues: historyValues.slice(),
        forecastLabels: forecastLabels.slice(), forecastValues: forecastValues.slice()
      };
      renderAll();
    }
  };

  window.addEventListener('resize', () => {
    if (window.requestAnimationFrame) window.requestAnimationFrame(renderAll);
    else renderAll();
  });
})();
