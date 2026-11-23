/* Gráficos SVG sem dependências (paleta categórica validada para daltonismo). */
(function () {
  const LIGHT = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#6250d6', '#e34948'];
  const DARK  = ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#0ca30c', '#9085e9', '#e66767'];

  const isDark = () => document.documentElement.dataset.mode === 'dark';
  /** Converte uma cor da paleta clara no passo equivalente do modo escuro. */
  function tone(hex) {
    if (!isDark()) return hex;
    const i = LIGHT.indexOf((hex || '').toLowerCase());
    return i >= 0 ? DARK[i] : hex;
  }
  const slot = (i) => LIGHT[i % LIGHT.length];

  const NS = 'http://www.w3.org/2000/svg';
  function el(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  function niceMax(v) {
    if (v <= 0) return 100;
    const p = Math.pow(10, Math.floor(Math.log10(v)));
    for (const m of [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (m * p >= v) return m * p;
    return 10 * p;
  }

  function tooltip(container) {
    let t = container.querySelector('.viz-tip');
    if (!t) { t = document.createElement('div'); t.className = 'viz-tip'; t.hidden = true; container.appendChild(t); }
    return t;
  }

  /**
   * Barras empilhadas por mês.
   * opts: { months:[ym], series:[{name,color,values:[]}], reference:{name,value} , onClick(month) , selected }
   */
  function stackedBars(container, opts) {
    container.innerHTML = '';
    container.classList.add('viz');
    const W = container.clientWidth || 720, H = opts.height || 280;
    const pad = { t: 16, r: 12, b: 28, l: 64 };
    const iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
    const n = opts.months.length;
    const totals = opts.months.map((_, i) => opts.series.reduce((a, s) => a + Math.max(0, s.values[i] || 0), 0));
    const max = niceMax(Math.max(...totals, opts.reference ? opts.reference.value : 0));
    const y = (v) => pad.t + ih - (v / max) * ih;
    const band = iw / n, bw = Math.min(44, band * 0.62);

    const svg = el('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': opts.label || 'Gráfico' }, container);

    // grade
    for (let k = 0; k <= 4; k++) {
      const v = (max / 4) * k, yy = y(v);
      el('line', { x1: pad.l, x2: W - pad.r, y1: yy, y2: yy, class: k === 0 ? 'viz-base' : 'viz-grid' }, svg);
      const tx = el('text', { x: pad.l - 8, y: yy + 4, 'text-anchor': 'end', class: 'viz-axis' }, svg);
      tx.textContent = Core.fmt.moneyShort(v);
    }

    const fmt = Core.fmt;
    const tip = tooltip(container);

    opts.months.forEach((m, i) => {
      const cx = pad.l + band * i + band / 2;
      const g = el('g', { class: 'viz-col' + (opts.selected === m ? ' is-selected' : '') }, svg);
      let acc = 0;
      const segs = opts.series.map((s) => ({ s, v: Math.max(0, s.values[i] || 0) })).filter((x) => x.v > 0);
      segs.forEach((x, j) => {
        const y0 = y(acc), y1 = y(acc + x.v);
        const h = Math.max(0, y0 - y1 - (j > 0 ? 2 : 0)); // 2px de respiro entre segmentos
        const top = j === segs.length - 1;
        const r = top ? Math.min(4, h) : 0;
        const x0 = cx - bw / 2;
        // topo arredondado (4px), base reta
        const d = `M${x0},${y0 - (j > 0 ? 2 : 0)} V${y0 - (j > 0 ? 2 : 0) - h + r} Q${x0},${y0 - (j > 0 ? 2 : 0) - h} ${x0 + r},${y0 - (j > 0 ? 2 : 0) - h} H${x0 + bw - r} Q${x0 + bw},${y0 - (j > 0 ? 2 : 0) - h} ${x0 + bw},${y0 - (j > 0 ? 2 : 0) - h + r} V${y0 - (j > 0 ? 2 : 0)} Z`;
        el('path', { d, fill: tone(x.s.color) }, g);
        acc += x.v;
      });
      const every = Math.ceil(46 / band);
      if (i % every === 0 || opts.selected === m) {
      const lbl = el('text', { x: cx, y: H - 8, 'text-anchor': 'middle', class: 'viz-axis' + (opts.selected === m ? ' is-strong' : '') }, svg);
      lbl.textContent = fmt.month(m);
      }

      // área de toque maior que a barra
      const hit = el('rect', { x: pad.l + band * i, y: pad.t, width: band, height: ih, class: 'viz-hit' }, svg);
      hit.addEventListener('mouseenter', () => g.classList.add('is-hover'));
      hit.addEventListener('mouseleave', () => { g.classList.remove('is-hover'); tip.hidden = true; });
      hit.addEventListener('mousemove', (ev) => {
        const rows = opts.series.filter((s) => (s.values[i] || 0) !== 0).map((s) =>
          `<div class="viz-tip-row"><span class="dot" style="background:${tone(s.color)}"></span><span>${s.name}</span><b>${fmt.money(s.values[i])}</b></div>`).join('');
        const ref = opts.reference && opts.reference.value ? `<div class="viz-tip-row muted"><span class="dash"></span><span>${opts.reference.name}</span><b>${fmt.money(opts.reference.value)}</b></div>` : '';
        tip.innerHTML = `<div class="viz-tip-title">${fmt.monthLong(m)}</div>${rows}<div class="viz-tip-total"><span>Total</span><b>${fmt.money(totals[i])}</b></div>${ref}`;
        tip.hidden = false;
        const rect = container.getBoundingClientRect();
        let lx = ev.clientX - rect.left + 14; const tw = tip.offsetWidth;
        if (lx + tw > rect.width) lx = ev.clientX - rect.left - tw - 14;
        tip.style.left = lx + 'px'; tip.style.top = Math.max(0, ev.clientY - rect.top - 20) + 'px';
      });
      if (opts.onClick) hit.addEventListener('click', () => opts.onClick(m));
    });

    if (opts.reference && opts.reference.value > 0) {
      const ry = y(opts.reference.value);
      el('line', { x1: pad.l, x2: W - pad.r, y1: ry, y2: ry, class: 'viz-ref' }, svg);
      const t = el('text', { x: W - pad.r, y: ry - 6, 'text-anchor': 'end', class: 'viz-ref-label' }, svg);
      t.textContent = opts.reference.name + ' ' + Core.fmt.moneyShort(opts.reference.value);
    }
  }

  /** Rosca simples (participação por categoria). */
  function donut(container, items) {
    container.innerHTML = '';
    const size = 168, r = 70, w = 18, c = size / 2;
    const total = items.reduce((a, i) => a + i.value, 0);
    const svg = el('svg', { width: size, height: size, viewBox: `0 0 ${size} ${size}`, role: 'img', 'aria-label': 'Distribuição por categoria' }, container);
    el('circle', { cx: c, cy: c, r, fill: 'none', class: 'viz-track', 'stroke-width': w }, svg);
    let a0 = -Math.PI / 2;
    const gap = items.length > 1 ? 0.03 : 0;
    items.forEach((it) => {
      const frac = total ? it.value / total : 0;
      const a1 = a0 + frac * Math.PI * 2;
      if (frac > 0) {
        const s = a0 + gap / 2, e = Math.max(s, a1 - gap / 2);
        const large = e - s > Math.PI ? 1 : 0;
        const d = `M${c + r * Math.cos(s)},${c + r * Math.sin(s)} A${r},${r} 0 ${large} 1 ${c + r * Math.cos(e)},${c + r * Math.sin(e)}`;
        const p = el('path', { d, fill: 'none', stroke: tone(it.color), 'stroke-width': w }, svg);
        const ti = el('title', {}, p); ti.textContent = `${it.name}: ${Core.fmt.money(it.value)} (${Core.fmt.pct(frac)})`;
      }
      a0 = a1;
    });
  }

  window.Charts = { stackedBars, donut, tone, slot, LIGHT };
})();
