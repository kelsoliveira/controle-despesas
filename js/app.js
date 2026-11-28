/* Aplicação: rotas, telas e formulários. */
(function () {
  const { fmt, ym } = Core;
  const S = () => Core.state;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ---------------- Ícones (traço 2px, 24x24) ----------------
  const IC = {
    home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/>',
    trend: '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
    card: '<rect x="2" y="5" width="20" height="14" rx="3"/><path d="M2 10h20"/><path d="M6 15h4"/>',
    layers: '<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/>',
    bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3.5" cy="6" r="1"/><circle cx="3.5" cy="12" r="1"/><circle cx="3.5" cy="18" r="1"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/>',
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    left: '<path d="M15 18l-6-6 6-6"/>', right: '<path d="M9 18l6-6-6-6"/>',
    moon: '<path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/>',
    grip: '<circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/>',
    move: '<path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20"/>',
    up: '<path d="M18 15l-6-6-6 6"/>', down: '<path d="M6 9l6 6 6-6"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z"/>',
    trash: '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/>',
    wallet: '<path d="M20 7H5a2 2 0 010-4h13v4"/><path d="M3 5v14a2 2 0 002 2h15V7"/><circle cx="16" cy="14" r="1.5"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    check: '<path d="M20 6L9 17l-5-5"/>',
    alert: '<path d="M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    download: '<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><path d="M7 10l5 5 5-5M12 15V3"/>',
    upload: '<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><path d="M17 8l-5-5-5 5M12 3v12"/>',
    home2: '<path d="M3 11l9-7 9 7v9a1 1 0 01-1 1H4a1 1 0 01-1-1z"/>',
    wifi: '<path d="M5 12.5a10 10 0 0114 0M8.5 16a5 5 0 017 0M2 9a15 15 0 0120 0"/><circle cx="12" cy="19.5" r="1"/>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 00-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 000-7.8z"/>',
    paw: '<circle cx="5.5" cy="10" r="2"/><circle cx="9" cy="5.5" r="2"/><circle cx="15" cy="5.5" r="2"/><circle cx="18.5" cy="10" r="2"/><path d="M12 12c-3 0-6 4-6 6.5S8 21 12 19.5 18 21 18 18.5 15 12 12 12z"/>',
    bag: '<path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><path d="M3 6h18M16 10a4 4 0 01-8 0"/>',
    game: '<rect x="2" y="7" width="20" height="11" rx="5"/><path d="M7 11v3M5.5 12.5h3"/><circle cx="16" cy="12" r=".8"/><circle cx="18" cy="14" r=".8"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 016.5 17H20V3H6.5A2.5 2.5 0 004 5.5z"/><path d="M4 19.5A2.5 2.5 0 006.5 22H20v-5"/>',
    cpu: '<rect x="5" y="5" width="14" height="14" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/>',
    cart: '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.7 12.4a2 2 0 002 1.6h8.6a2 2 0 002-1.6L22 7H6"/>',
    car: '<path d="M5 17h14v-5l-2-5H7l-2 5z"/><circle cx="7.5" cy="17.5" r="1.5"/><circle cx="16.5" cy="17.5" r="1.5"/><path d="M5 12h14"/>',
    undo: '<path d="M3 7v6h6"/><path d="M21 17a9 9 0 00-15-6.7L3 13"/>',
    dots: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
    drop: '<path d="M12 2.7l5.7 5.7a8 8 0 11-11.4 0z"/>',
    flame: '<path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.4-.5-2-1-3-1.1-2.1-.2-4 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.2.4-2.3 1-3.4.3 1.3 1.2 2.4 2.5 2.9z"/>',
    phone: '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/>',
    piggy: '<path d="M19 9c1 0 2 1 2 2v2h-2l-1 2v3h-3v-2h-4v2H8v-3c-2-1-3-3-3-5a6 6 0 016-6h3c2 0 4 1 5 3z"/><path d="M16 10h.01"/><path d="M2 9a2 2 0 002 2"/>'
  };
  const icon = (name) => `<i data-ic="${name}">${'<svg viewBox="0 0 24 24">' + (IC[name] || IC.dots) + '</svg>'}</i>`;
  const hydrateIcons = (root = document) => $$('i[data-ic]', root).forEach((i) => { if (!i.firstChild) i.innerHTML = '<svg viewBox="0 0 24 24">' + (IC[i.dataset.ic] || IC.dots) + '</svg>'; });

  const CATS = {
    moradia: { name: 'Moradia', ic: 'home2' }, servicos: { name: 'Serviços e contas', ic: 'wifi' },
    alimentacao: { name: 'Alimentação', ic: 'cart' }, transporte: { name: 'Transporte', ic: 'car' },
    saude: { name: 'Saúde e farmácia', ic: 'heart' }, pets: { name: 'Pets', ic: 'paw' },
    compras: { name: 'Compras', ic: 'bag' }, eletronicos: { name: 'Eletrônicos', ic: 'cpu' },
    lazer: { name: 'Lazer e jogos', ic: 'game' }, educacao: { name: 'Educação', ic: 'book' },
    reembolso: { name: 'Reembolso / estorno', ic: 'undo' }, outros: { name: 'Outros', ic: 'dots' }
  };
  const FIXED_ICON = (f) => /água|agua/i.test(f.name) ? 'drop' : /luz|energia/i.test(f.name) ? 'bolt' : /gás|gas/i.test(f.name) ? 'flame'
    : /celular|telefone/i.test(f.name) ? 'phone' : /internet|wi/i.test(f.name) ? 'wifi' : /aluguel|condom/i.test(f.name) ? 'home2' : (CATS[f.category] || CATS.outros).ic;
  const catOptions = (sel) => Object.entries(CATS).map(([k, v]) => `<option value="${k}" ${k === sel ? 'selected' : ''}>${v.name}</option>`).join('');

  // ---------------- Estado de UI ----------------
  const ui = { month: null, cardSel: null, cardMonth: null, txFilter: { account: 'all', q: '', scope: 'month', holder: 'all' }, cardHolder: 'all', sel: new Set(), horizon: 12, showDone: false, sim: null };

  function initMonth() {
    const t = ym.today(), s = S().settings.startMonth;
    ui.month = s && s > t ? s : t;
  }

  // ---------------- Utilidades ----------------
  function toast(msg, action) {
    const t = $('#toast'); t.textContent = msg; t.hidden = false;
    if (action) {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'toast-btn'; b.textContent = action.label;
      b.addEventListener('click', () => { t.hidden = true; action.run(); });
      t.appendChild(b);
    }
    clearTimeout(toast._t); toast._t = setTimeout(() => (t.hidden = true), action ? 12000 : 2200);
  }
  const commit = (msg) => { Core.save(); render(); if (msg) toast(msg); };
  const card = (id) => S().cards.find((c) => c.id === id);
  // ---- Portadores (titular e cartões adicionais) ----
  const holdersOf = (c) => (c && c.holders && c.holders.length ? c.holders : [{ id: 'titular', name: 'Titular' }]);
  const multiHolder = (c) => !!c && holdersOf(c).length > 1;
  const normTxt = (x) => String(x || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  function holderName(t) {
    const c = card(t.account); if (!c) return '';
    const id = t.holder || 'titular';
    const h = holdersOf(c).find((x) => x.id === id);
    return h ? h.name : id === 'adicional' ? 'Adicional' : 'Titular';
  }
  function holderBadge(t) {
    const c = card(t.account);
    if (!c || (!multiHolder(c) && (t.holder || 'titular') === 'titular')) return '';
    const add = (t.holder || 'titular') !== 'titular';
    return `<span class="badge holder ${add ? 'is-add' : ''}">${icon('user')}${esc(holderName(t))}</span>`;
  }
  function ensureHolder(c, id, name) {
    if (!c.holders || !c.holders.length) c.holders = [{ id: 'titular', name: 'Titular' }];
    if (!c.holders.find((h) => h.id === id)) c.holders.push({ id, name });
    return id;
  }
  /** Opções de portador para um cartão; se só houver titular, oferece "Adicional". */
  function holderOptions(c, sel, extra = []) {
    const list = holdersOf(c).slice();
    if (list.length === 1) list.push({ id: 'adicional', name: 'Adicional' });
    extra.forEach((e) => { if (!list.find((h) => h.id === e.id)) list.push(e); });
    return list.map((h) => `<option value="${esc(h.id)}" ${h.id === (sel || 'titular') ? 'selected' : ''}>${esc(h.name)}</option>`).join('');
  }
  const seriesColor = { fixas: Charts.slot(0), conta: Charts.slot(4) };
  const money = (v, cls = '') => `<span class="money ${cls}">${fmt.money(v)}</span>`;
  const daysInMonth = (m) => { const [y, mm] = m.split('-').map(Number); return new Date(y, mm, 0).getDate(); };
  function daysLeft(m) {
    const t = ym.today();
    if (m < t) return 0;
    if (m > t) return daysInMonth(m);
    return daysInMonth(m) - new Date().getDate() + 1;
  }

  /** Séries para o gráfico de projeção. */
  function projectionSeries(months, extra) {
    const sums = months.map((m) => Core.monthSummary(m));
    const series = [{ name: 'Despesas fixas', color: seriesColor.fixas, values: sums.map((s) => s.fixedTotal) }];
    S().cards.forEach((c) => series.push({ name: c.name, color: c.color, values: sums.map((s) => s.invoices.find((i) => i.cardId === c.id).total) }));
    if (sums.some((s) => s.accountTotal)) series.push({ name: 'Débito / Pix', color: seriesColor.conta, values: sums.map((s) => s.accountTotal) });
    if (extra) series.push(extra);
    return { sums, series };
  }

  function legendHTML(series, ref) {
    return `<div class="legend">${series.map((s) => `<span><i class="dot" style="background:${Charts.tone(s.color)}"></i>${esc(s.name)}</span>`).join('')}${ref ? `<span><i class="dash"></i>${esc(ref)}</span>` : ''}</div>`;
  }

  // ======================================================
  // VISÃO GERAL
  // ======================================================
  function viewDashboard() {
    const m = ui.month, st = S().settings;
    const sm = Core.monthSummary(m);
    const months = ym.range(m, 12);
    const { series } = projectionSeries(months);
    const dl = daysLeft(m);
    const usage = sm.income ? Math.min(1, (sm.committed + sm.savings) / sm.income) : 0;
    const pending = sm.committed - sm.spent;
    const assumed = S().transactions.filter((t) => t.note).length + S().fixed.filter((f) => f.estimated && +f.amount > 0).length;

    // vencimentos
    const dues = [
      ...sm.invoices.filter((i) => i.total !== 0).map((i) => ({ kind: 'inv', id: i.cardId, due: i.month, name: 'Fatura ' + card(i.cardId).name, day: card(i.cardId).dueDay, amount: i.total, paid: i.paid, color: card(i.cardId).color, ic: 'card' })),
      ...sm.fixed.filter((f) => +f.amount > 0).map((f) => ({ kind: 'fix', id: f.id, due: f.dueMonth, name: f.name, day: f.dueDay, amount: +f.amount, paid: !!S().fixedPaid[f.id + '|' + f.dueMonth], ic: FIXED_ICON(f), est: f.estimated }))
    ].sort((a, b) => (a.due + String(a.day).padStart(2, '0')).localeCompare(b.due + String(b.day).padStart(2, '0')));
    const shifted = dues.some((d) => d.due !== m);

    // categorias (onde vai o dinheiro)
    const byCat = {};
    sm.invoices.forEach((inv) => inv.items.forEach((it) => { byCat[it.tx.category] = (byCat[it.tx.category] || 0) + it.amount; }));
    sm.account.forEach((it) => { byCat[it.tx.category] = (byCat[it.tx.category] || 0) + it.amount; });
    let cats = Object.entries(byCat).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).map(([k, v]) => ({ name: (CATS[k] || CATS.outros).name, value: v }));
    if (sm.fixedTotal) cats.unshift({ name: 'Despesas fixas', value: sm.fixedTotal });
    cats.sort((a, b) => b.value - a.value);
    if (cats.length > 6) { const rest = cats.slice(5).reduce((a, c) => a + c.value, 0); cats = cats.slice(0, 5).concat([{ name: 'Outras', value: rest }]); }
    cats.forEach((c, i) => (c.color = Charts.slot(i)));
    const catTotal = cats.reduce((a, c) => a + c.value, 0);

    // alívio futuro: parcelamentos terminando
    const ending = S().transactions.filter((t) => t.installments > 1 && t.account !== 'conta')
      .map((t) => ({ t, last: ym.add(t.firstMonth, t.installments - 1) }))
      .filter((x) => x.last >= m && x.last <= ym.add(m, 2))
      .sort((a, b) => a.last.localeCompare(b.last));
    const freed = {};
    ending.forEach((x) => { const nm = ym.add(x.last, 1); freed[nm] = (freed[nm] || 0) + x.t.amount; });

    const alerts = [];
    if (!S().cards.length && !S().transactions.length) alerts.push(`<div class="panel" style="margin-bottom:20px"><div class="panel-head"><h2>Comece por aqui</h2><span class="sub">3 passos</span></div>
      <div class="steps">
        <a class="step" href="#/config"><span class="n">1</span><div><b>Conecte sua pasta de dados</b><span>Escolha uma pasta no OneDrive, Google Drive ou Dropbox. Se já tiver o arquivo <code>controle-despesas.json</code>, ele é carregado.</span></div></a>
        <a class="step" href="#/importar"><span class="n">2</span><div><b>Importe faturas</b><span>Envie o PDF da fatura ou prints do app do banco e confira os lançamentos.</span></div></a>
        <a class="step" href="#/fixas"><span class="n">3</span><div><b>Contas fixas e renda</b><span>Preencha água, luz, internet… e sua renda em Configurações.</span></div></a>
      </div></div>`);
    if (!sm.income) alerts.push(`<div class="alert">${icon('alert')}<div><b>Informe sua renda mensal</b> em <a href="#/config">Configurações</a> para o sistema calcular quanto você ainda pode gastar.</div></div>`);
    if (assumed) alerts.push(`<div class="alert info">${icon('info')}<div>Há <b>${assumed} valores estimados ou presumidos</b> (contas fixas com valor de exemplo e parcelas não totalmente visíveis nos prints). Revise em <a href="#/fixas">Despesas fixas</a> e <a href="#/lancamentos">Lançamentos</a>.</div></div>`);

    return `
      ${alerts.join('')}
      <div class="grid grid-4">
        <div class="panel kpi hero ${sm.available < 0 ? 'negative' : ''}">
          <div class="kpi-label">${icon('wallet')}Posso gastar em ${fmt.month(m)}</div>
          <div class="kpi-value">${fmt.money(sm.available)}</div>
          <div class="kpi-foot">${sm.income ? (dl ? `≈ ${fmt.money(Math.max(0, sm.available) / dl)} por dia · ${dl} dias` : 'mês encerrado') : 'defina sua renda'}</div>
          <div class="progress" title="Renda comprometida"><span style="width:${(usage * 100).toFixed(1)}%"></span></div>
        </div>
        <div class="panel kpi">
          <div class="kpi-label">${icon('trend')}Renda do mês</div>
          <div class="kpi-value">${fmt.money(sm.income)}</div>
          <div class="kpi-foot">${sm.extraTotal ? `Inclui ${sm.extras.map((e) => esc(e.name)).join(' + ')}: <b class="pos">+${fmt.money(sm.extraTotal)}</b> · ` : ''}Reserva de ${st.savingsGoal || 0}%: ${fmt.money(sm.savings)}</div>
        </div>
        <div class="panel kpi">
          <div class="kpi-label">${icon('calendar')}Comprometido</div>
          <div class="kpi-value">${fmt.money(sm.committed)}</div>
          <div class="kpi-foot">Faturas ${fmt.money(sm.cardsTotal)} · Fixas ${fmt.money(sm.fixedTotal)}</div>
        </div>
        <div class="panel kpi">
          <div class="kpi-label">${icon('check')}Já paguei</div>
          <div class="kpi-value">${fmt.money(sm.spent)}</div>
          <div class="kpi-foot">Falta pagar ${fmt.money(pending)}</div>
        </div>
      </div>

      <div class="grid grid-main mt">
        <div class="panel">
          <div class="panel-head"><h2>Compromissos dos próximos 12 meses</h2><span class="spacer"></span><a class="btn btn-sm" href="#/futuro">Ver visão futura ${icon('right')}</a></div>
          ${legendHTML(series, sm.income ? 'Renda' : null)}
          <div id="chartDash"></div>
          <p class="muted" style="margin:8px 0 0;font-size:12.5px">Clique numa barra para abrir o mês. Os valores futuros incluem apenas parcelas já contratadas e despesas fixas.</p>
        </div>
        <div class="panel">
          <div class="panel-head"><h2>${shifted ? `Pagos com a renda de ${fmt.month(m)}` : `Vencimentos de ${fmt.month(m)}`}</h2></div>
          <div class="list">
            ${dues.length ? dues.map((d) => `
              <div class="list-item">
                <div class="avatar" ${d.color ? `style="color:${Charts.tone(d.color)}"` : ''}>${icon(d.ic)}</div>
                <div class="grow"><div class="cell-title">${esc(d.name)}</div><div class="cell-sub">Vence ${d.due !== m ? String(d.day).padStart(2, '0') + '/' + d.due.slice(5) : 'dia ' + d.day}${d.est ? ' · <span class="badge warn">estimado</span>' : ''}</div></div>
                <div style="text-align:right">
                  <div class="amount">${fmt.money(d.amount)}</div>
                  <label class="check" style="font-size:12px"><input type="checkbox" data-pay="${d.kind}|${d.id}|${d.due}" ${d.paid ? 'checked' : ''}/>${d.paid ? 'Pago' : 'Pagar'}</label>
                </div>
              </div>`).join('') : '<div class="empty">Nada a vencer.</div>'}
          </div>
        </div>
      </div>

      <div class="grid grid-2 mt">
        <div class="panel">
          <div class="panel-head"><h2>Para onde vai o dinheiro</h2><span class="sub">${fmt.month(m)}</span></div>
          ${catTotal ? `<div class="donut-wrap"><div id="donut"></div>
            <div class="legend">${cats.map((c) => `<span><i class="dot" style="background:${Charts.tone(c.color)}"></i>${esc(c.name)}<b>${fmt.money(c.value)}</b></span>`).join('')}</div></div>` : '<div class="empty">Sem gastos neste mês.</div>'}
        </div>
        <div class="panel">
          <div class="panel-head"><h2>Alívio no orçamento</h2><span class="sub">parcelas terminando</span></div>
          ${Object.keys(freed).length ? `<div class="list">${Object.entries(freed).map(([fm, v]) => `
            <div class="list-item"><div class="avatar">${icon('piggy')}</div>
              <div class="grow"><div class="cell-title">A partir de ${fmt.monthLong(fm)}</div>
              <div class="cell-sub">${ending.filter((x) => ym.add(x.last, 1) === fm).map((x) => esc(x.t.desc)).slice(0, 4).join(', ')}${ending.filter((x) => ym.add(x.last, 1) === fm).length > 4 ? '…' : ''}</div></div>
              <div class="amount pos">+${fmt.money(v)}/mês</div></div>`).join('')}</div>` : '<div class="empty">Nenhum parcelamento termina nos próximos 3 meses.</div>'}
        </div>
      </div>`;
  }
  function afterDashboard() {
    const m = ui.month, months = ym.range(m, 12);
    const { series } = projectionSeries(months);
    Charts.stackedBars($('#chartDash'), { months, series, selected: m, reference: { name: 'Renda', values: months.map((mm) => Core.monthSummary(mm).income) }, label: 'Compromissos mensais', onClick: (mm) => { ui.month = mm; render(); } });
    const d = $('#donut');
    if (d) {
      // reconstrói os mesmos dados da legenda
      const items = $$('.donut-wrap .legend span').map((s) => ({ name: s.textContent, color: s.querySelector('.dot').style.background, value: parseMoney(s.querySelector('b').textContent) }));
      Charts.donut(d, items);
    }
    $$('[data-pay]').forEach((cb) => cb.addEventListener('change', () => {
      const [kind, id, due] = cb.dataset.pay.split('|');
      const map = kind === 'inv' ? S().invoicePaid : S().fixedPaid;
      const key = id + '|' + (due || m);
      if (cb.checked) map[key] = true; else delete map[key];
      commit(cb.checked ? 'Marcado como pago' : 'Pagamento desmarcado');
    }));
  }
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const parseMoney = (s) => +String(s).replace(/[^\d,-]/g, '').replace(',', '.') || 0;

  // ======================================================
  // VISÃO FUTURA
  // ======================================================
  function viewFuturo() {
    const m = ui.month, months = ym.range(m, ui.horizon);
    const { sums, series } = projectionSeries(months);
    const income = +S().settings.income || 0;
    let acc = 0;
    const rows = sums.map((s) => { acc += s.available; return { s, acc }; });
    const minAvail = Math.min(...sums.map((s) => s.available));
    const totalCommitted = sums.reduce((a, s) => a + s.committed, 0);
    const debt = S().transactions.filter((t) => t.account !== 'conta').reduce((a, t) => a + Core.remainingFrom(t, m).value, 0);
    const sim = ui.sim;

    return `
      <div class="grid grid-3">
        <div class="panel kpi"><div class="kpi-label">${icon('layers')}Parcelas a pagar (todos os cartões)</div><div class="kpi-value">${fmt.money(debt)}</div><div class="kpi-foot">a partir de ${fmt.monthLong(m)}</div></div>
        <div class="panel kpi"><div class="kpi-label">${icon('calendar')}Comprometido em ${ui.horizon} meses</div><div class="kpi-value">${fmt.money(totalCommitted)}</div><div class="kpi-foot">fixas + faturas + débito</div></div>
        <div class="panel kpi"><div class="kpi-label">${icon('target')}Parcela máxima segura</div><div class="kpi-value ${minAvail < 0 ? 'neg' : ''}">${income ? fmt.money(Math.max(0, minAvail)) : '—'}</div><div class="kpi-foot">${income ? 'por mês, sem ficar negativo em nenhum mês do período' : 'informe a renda em Configurações'}</div></div>
      </div>

      <div class="panel mt">
        <div class="panel-head"><h2>Projeção mensal</h2><span class="spacer"></span>
          <div class="segmented" id="horizon">${[6, 12, 18, 24].map((h) => `<button type="button" data-h="${h}" class="${h === ui.horizon ? 'active' : ''}">${h} meses</button>`).join('')}</div>
        </div>
        ${legendHTML(sim ? series.concat([{ name: 'Simulação', color: Charts.slot(6) }]) : series, income ? 'Renda' : null)}
        <div id="chartFut"></div>
      </div>

      <div class="panel mt">
        <div class="panel-head"><h2>Simular nova compra parcelada</h2><span class="sub">veja o impacto antes de comprar</span></div>
        <form id="simForm" class="toolbar" style="margin:0">
          <input type="number" step="0.01" min="0" name="total" placeholder="Valor total (R$)" value="${sim ? sim.total : ''}" style="max-width:180px" required />
          <select name="n">${Array.from({ length: 24 }, (_, i) => `<option value="${i + 1}" ${sim && sim.n === i + 1 ? 'selected' : ''}>${i + 1}x</option>`).join('')}</select>
          <select name="start">${months.map((mm) => `<option value="${mm}" ${sim && sim.start === mm ? 'selected' : ''}>1ª parcela em ${fmt.month(mm)}</option>`).join('')}</select>
          <button class="btn btn-primary" type="submit">Simular</button>
          ${sim ? '<button class="btn btn-ghost" type="button" id="simClear">Limpar</button>' : ''}
        </form>
        ${sim ? simVerdict(sums, sim) : ''}
      </div>

      <div class="panel mt">
        <div class="panel-head"><h2>Tabela da visão futura</h2>${S().settings.payWithPrevIncome ? `<span class="sub">cada mês mostra as contas pagas com a renda dele — faturas que vencem até o dia ${S().settings.prevIncomeDay || 10} do mês seguinte${S().settings.prevIncomeFixed ? ' e despesas fixas' : ''}</span>` : ''}</div>
        <div class="table-wrap"><table>
          <thead><tr><th>Mês</th><th class="r">Renda</th><th class="r">Reserva</th><th class="r">Fixas</th>${S().cards.map((c) => `<th class="r">${esc(c.name)}</th>`).join('')}<th class="r">Débito/Pix</th><th class="r">Comprometido</th><th class="r">Livre p/ gastar</th><th class="r">Acumulado</th></tr></thead>
          <tbody>${rows.map(({ s, acc }) => `<tr ${s.month === m ? 'style="font-weight:600"' : ''}>
            <td><a href="#/" data-goto="${s.month}">${fmt.month(s.month)}</a></td>
            <td class="r">${fmt.money(s.income)}</td><td class="r muted">${fmt.money(s.savings)}</td><td class="r">${fmt.money(s.fixedTotal)}</td>
            ${s.invoices.map((i) => `<td class="r">${fmt.money(i.total)}</td>`).join('')}
            <td class="r">${fmt.money(s.accountTotal)}</td><td class="r"><b>${fmt.money(s.committed)}</b></td>
            <td class="r ${s.available < 0 ? 'neg' : 'pos'}"><b>${fmt.money(s.available)}</b></td>
            <td class="r ${acc < 0 ? 'neg' : ''}">${fmt.money(acc)}</td></tr>`).join('')}</tbody>
        </table></div>
      </div>`;
  }
  function simVerdict(sums, sim) {
    const per = sim.total / sim.n;
    const hit = sums.filter((s) => s.month >= sim.start && s.month < ym.add(sim.start, sim.n));
    const worst = hit.length ? hit.reduce((a, s) => (s.available - per < a.available - per ? s : a)) : null;
    if (!worst) return '';
    const after = worst.available - per;
    const ok = after >= 0;
    return `<div class="alert ${ok ? 'info' : ''}" style="margin:16px 0 0">${icon(ok ? 'check' : 'alert')}<div>
      ${sim.n}x de <b>${fmt.money(per)}</b>. No mês mais apertado (${fmt.month(worst.month)}) sobraria <b class="${ok ? 'pos' : 'neg'}">${fmt.money(after)}</b>.
      ${ok ? 'Cabe no orçamento.' : 'Não cabe — considere mais parcelas, uma entrada maior ou adiar a compra.'}</div></div>`;
  }
  function afterFuturo() {
    const m = ui.month, months = ym.range(m, ui.horizon);
    const sim = ui.sim;
    const extra = sim ? { name: 'Simulação', color: Charts.slot(6), values: months.map((mm) => (mm >= sim.start && mm < ym.add(sim.start, sim.n) ? sim.total / sim.n : 0)) } : null;
    const { series } = projectionSeries(months, extra);
    Charts.stackedBars($('#chartFut'), { months, series, selected: m, height: 300, reference: { name: 'Renda', values: months.map((mm) => Core.monthSummary(mm).income) }, onClick: (mm) => { ui.month = mm; location.hash = '#/'; } });
    $$('#horizon button').forEach((b) => b.addEventListener('click', () => { ui.horizon = +b.dataset.h; render(); }));
    $('#simForm').addEventListener('submit', (e) => {
      e.preventDefault(); const f = new FormData(e.target);
      ui.sim = { total: +f.get('total'), n: +f.get('n'), start: f.get('start') }; render();
    });
    const c = $('#simClear'); if (c) c.addEventListener('click', () => { ui.sim = null; render(); });
    $$('[data-goto]').forEach((a) => a.addEventListener('click', () => { ui.month = a.dataset.goto; }));
  }

  // ======================================================
  // CARTÕES E FATURAS
  // ======================================================
  function viewCartoes() {
    const cards = S().cards;
    if (!cards.length) return `<div class="panel empty">Nenhum cartão cadastrado. <button class="btn btn-primary" data-act="card-new">${icon('plus')}Adicionar cartão</button></div>`;
    if (!card(ui.cardSel)) ui.cardSel = cards[0].id;
    const c = card(ui.cardSel);
    const cm = ui.cardMonth || ui.month;
    const inv = Core.invoice(c.id, cm);
    const chipsMonths = ym.range(ym.add(ui.month, -1), 14);
    const remaining = S().transactions.filter((t) => t.account === c.id).reduce((a, t) => a + Core.remainingFrom(t, cm).value, 0);
    const limitUse = c.limit ? Math.min(1, remaining / c.limit) : 0;

    return `
      <div class="grid grid-3">
        ${cards.map((k) => {
          const iv = Core.invoice(k.id, ui.month);
          return `<div class="ccard ${k.id === c.id ? 'active' : ''}" data-card="${k.id}" style="background:linear-gradient(135deg, ${k.brandColor || k.color}, color-mix(in srgb, ${k.brandColor || k.color} 55%, #000))">
            <div><div class="cc-brand">${esc(k.brand || '')}</div><div class="cc-name">${esc(k.name)}</div></div>
            <div><div style="font-size:12px;opacity:.85">Fatura ${fmt.month(ui.month)}${iv.paid ? ' · paga ✓' : ''}</div><div class="cc-val">${fmt.money(iv.total)}</div></div>
            <div class="cc-foot"><span>Fecha dia ${k.closingDay}</span><span>Vence dia ${k.dueDay}</span></div>
          </div>`;
        }).join('')}
      </div>

      <div class="panel mt">
        <div class="panel-head">
          <span class="dot" style="background:${Charts.tone(c.color)}"></span><h2>${esc(c.name)}</h2>
          <span class="spacer"></span>
          <button class="btn btn-sm" data-act="card-edit">${icon('edit')}Editar cartão</button>
          <button class="btn btn-sm" data-act="card-new">${icon('plus')}Novo cartão</button>
        </div>
        <div class="chips" id="chips">
          ${chipsMonths.map((mm) => { const iv = Core.invoice(c.id, mm); return `<button class="chip ${mm === cm ? 'active' : ''} ${iv.paid ? 'paid' : ''}" data-m="${mm}"><div class="m">${fmt.month(mm)}</div><div class="v">${fmt.money(iv.total)}</div></button>`; }).join('')}
        </div>

        <div class="grid grid-3 mt">
          <div><div class="kpi-label">Total da fatura de ${fmt.monthLong(cm)}</div><div class="kpi-value">${fmt.money(inv.total)}</div>
            <div class="kpi-foot">${inv.override != null ? `Valor informado (lançamentos somam ${fmt.money(inv.computed)})` : `Soma de ${inv.items.length} lançamentos`} · vence ${String(c.dueDay).padStart(2, '0')}/${cm.slice(5)}</div></div>
          <div><div class="kpi-label">Limite comprometido</div>
            ${c.limit ? `<div class="kpi-value">${fmt.money(c.limit - remaining)}</div><div class="kpi-foot">disponível de ${fmt.money(c.limit)} (estimado)</div><div class="progress" style="margin-top:8px"><span style="width:${(limitUse * 100).toFixed(1)}%"></span></div>` : '<div class="kpi-foot mt">Informe o limite em “Editar cartão”.</div>'}</div>
          <div style="display:flex;flex-direction:column;gap:8px;align-items:flex-start">
            <label class="check"><input type="checkbox" id="invPaid" ${inv.paid ? 'checked' : ''}/> Fatura paga</label>
            <button class="btn btn-sm" data-act="inv-override">${icon('edit')}${inv.override != null ? 'Alterar' : 'Informar'} valor oficial</button>
            <button class="btn btn-sm" data-act="tx-new-card">${icon('plus')}Lançar neste cartão</button>
            <button class="btn btn-sm btn-danger" data-act="bulk-del-card">${icon('trash')}Excluir lançamentos desta fatura</button>
          </div>
        </div>

        ${holderSummaryHTML(c, inv)}
        <div class="table-wrap mt"><table>
          ${(() => { const vis = inv.items.filter((it) => ui.cardHolder === 'all' || (it.tx.holder || 'titular') === ui.cardHolder); ui._visIds = vis.map((it) => it.tx.id); return ''; })()}
          ${ui.sel.size ? `<caption class="sel-bar"><span><b>${ui.sel.size}</b> selecionado(s)</span><button class="btn btn-sm btn-primary" type="button" id="selMove">${icon('move')}Mover…</button><button class="btn btn-sm btn-ghost" type="button" id="selClear">Limpar seleção</button></caption>` : ''}
          <thead><tr><th class="sel-col"><input type="checkbox" id="selAll" aria-label="Selecionar todos" ${ui._visIds.length && ui._visIds.every((id) => ui.sel.has(id)) ? 'checked' : ''}/></th><th class="grip-col" title="Arraste para reordenar"></th><th>Data</th><th>Descrição</th><th>Categoria</th><th>Parcela</th><th class="r">Valor</th><th class="r">${inv.items.some((it) => it.tx.sort != null) ? '<button class="btn btn-sm btn-ghost" type="button" id="sortReset" title="Voltar à ordem por data">Ordenar por data</button>' : ''}</th></tr></thead>
          <tbody id="txBody">${inv.items.length ? inv.items.filter((it) => ui.cardHolder === 'all' || (it.tx.holder || 'titular') === ui.cardHolder).map((it) => txRow(it.tx, it, true)).join('') : `<tr><td colspan="8" class="empty">${inv.override != null ? 'Fatura informada apenas pelo total — itens não detalhados.' : 'Sem lançamentos nesta fatura.'}</td></tr>`}</tbody>
          ${inv.items.length ? `<tfoot><tr><td colspan="6">Soma dos lançamentos</td><td class="r">${fmt.money(inv.computed)}</td><td></td></tr></tfoot>` : ''}
        </table></div>
      </div>`;
  }
  function holderSummaryHTML(c, inv) {
    const ids = new Set(holdersOf(c).map((h) => h.id));
    inv.items.forEach((it) => ids.add(it.tx.holder || 'titular'));
    if (ids.size < 2) { ui.cardHolder = 'all'; return ''; }
    if (ui.cardHolder !== 'all' && !ids.has(ui.cardHolder)) ui.cardHolder = 'all';
    const sum = (id) => inv.items.filter((it) => (it.tx.holder || 'titular') === id).reduce((a, it) => a + it.amount, 0);
    const total = inv.computed || 1;
    const name = (id) => holderName({ account: c.id, holder: id });
    const rest = inv.override != null ? inv.override - inv.computed : 0;
    return `<div class="holder-split mt">
      <div class="panel-head" style="margin-bottom:10px">${icon('user')}<h3>Quem gastou nesta fatura</h3><span class="sub">clique para filtrar os lançamentos</span></div>
      <div class="holder-cards">
        <button type="button" class="holder-card ${ui.cardHolder === 'all' ? 'active' : ''}" data-holder="all"><span>Todos</span><b>${fmt.money(inv.computed)}</b><small>${inv.items.length} lançamentos</small></button>
        ${[...ids].map((id) => { const v = sum(id); const n = inv.items.filter((it) => (it.tx.holder || 'titular') === id).length; return `
          <button type="button" class="holder-card ${ui.cardHolder === id ? 'active' : ''}" data-holder="${esc(id)}">
            <span>${icon('user')}${esc(name(id))}</span><b>${fmt.money(v)}</b><small>${n} lançamentos · ${fmt.pct(v / total)}</small>
            <i class="bar"><i style="width:${Math.max(0, Math.min(100, (v / total) * 100)).toFixed(1)}%"></i></i>
          </button>`; }).join('')}
      </div>
      ${Math.abs(rest) >= 0.01 ? `<div class="cell-sub" style="margin-top:8px">O valor oficial da fatura tem ${fmt.money(rest)} não detalhados em lançamentos (sem portador identificado).</div>` : ''}
    </div>`;
  }
  function txRow(t, it, movable) {
    const cat = CATS[t.category] || CATS.outros;
    return `<tr ${movable ? `draggable="true" data-row="${t.id}" class="${ui.sel.has(t.id) ? 'is-sel' : ''}"` : ''}>
      ${movable ? `<td class="sel-col"><input type="checkbox" data-sel="${t.id}" ${ui.sel.has(t.id) ? 'checked' : ''} aria-label="Selecionar"/></td>
      <td class="grip-col"><span class="grip" title="Arraste para reordenar">${icon('grip')}</span><span class="updown"><button class="icon-btn" type="button" data-up="${t.id}" aria-label="Subir">${icon('up')}</button><button class="icon-btn" type="button" data-down="${t.id}" aria-label="Descer">${icon('down')}</button></span></td>` : ''}
      <td class="num">${fmt.date(t.date)}</td>
      <td><div class="cell-title">${esc(t.desc)} ${holderBadge(t)}</div>${t.note ? `<div class="note">${icon('info')}${esc(t.note)}</div>` : ''}</td>
      <td><span class="badge">${esc(cat.name)}</span></td>
      <td>${t.installments > 1 ? `<span class="badge primary">${it ? it.n : ''}${it ? ' de ' : ''}${t.installments}${it ? '' : 'x'}</span>` : '<span class="muted">à vista</span>'}</td>
      <td class="r ${t.amount < 0 ? 'pos' : ''}"><b>${fmt.money(t.amount)}</b></td>
      <td><div class="row-actions">${movable ? `<button class="icon-btn" data-move-tx="${t.id}" aria-label="Mover para outra fatura ou cartão" title="Mover para outra fatura ou cartão">${icon('move')}</button>` : ''}<button class="icon-btn" data-edit-tx="${t.id}" aria-label="Editar">${icon('edit')}</button><button class="icon-btn btn-danger" data-del-tx="${t.id}" aria-label="Excluir">${icon('trash')}</button></div></td>
    </tr>`;
  }

  // ---------------- Reordenar e mover lançamentos ----------------
  /** Grava a nova ordem dos lançamentos visíveis da fatura. */
  function saveOrder(ids) {
    ids.forEach((id, i) => { const t = S().transactions.find((x) => x.id === id); if (t) t.sort = i; });
    commit();
  }
  function bindReorder() {
    const body = $('#txBody'); if (!body) return;
    const ids = () => $$('tr[data-row]', body).map((r) => r.dataset.row);
    let dragged = null;
    $$('tr[data-row]', body).forEach((row) => {
      row.addEventListener('dragstart', (e) => { dragged = row; row.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', row.dataset.row); });
      row.addEventListener('dragend', () => { row.classList.remove('dragging'); $$('.drop-before,.drop-after', body).forEach((r) => r.classList.remove('drop-before', 'drop-after')); });
      row.addEventListener('dragover', (e) => {
        if (!dragged || dragged === row) return; e.preventDefault();
        const after = e.offsetY > row.offsetHeight / 2 || e.clientY > row.getBoundingClientRect().top + row.offsetHeight / 2;
        row.classList.toggle('drop-after', after); row.classList.toggle('drop-before', !after);
      });
      row.addEventListener('dragleave', () => row.classList.remove('drop-before', 'drop-after'));
      row.addEventListener('drop', (e) => {
        e.preventDefault(); if (!dragged || dragged === row) return;
        const after = row.classList.contains('drop-after');
        row.classList.remove('drop-before', 'drop-after');
        if (after) row.after(dragged); else row.before(dragged);
        saveOrder(ids());
      });
    });
    const step = (id, d) => { const list = ids(); const i = list.indexOf(id), j = i + d; if (i < 0 || j < 0 || j >= list.length) return; [list[i], list[j]] = [list[j], list[i]]; saveOrder(list); };
    $$('[data-up]', body).forEach((b) => b.addEventListener('click', () => step(b.dataset.up, -1)));
    $$('[data-down]', body).forEach((b) => b.addEventListener('click', () => step(b.dataset.down, 1)));
    const reset = $('#sortReset'); if (reset) reset.addEventListener('click', () => { const c = card(ui.cardSel), cm = ui.cardMonth || ui.month; Core.invoiceItems(c.id, cm).forEach((it) => { delete it.tx.sort; }); commit('Ordem por data restaurada'); });
    // seleção
    $$('[data-sel]', body).forEach((cb) => cb.addEventListener('change', () => { if (cb.checked) ui.sel.add(cb.dataset.sel); else ui.sel.delete(cb.dataset.sel); render(); }));
    const all = $('#selAll'); if (all) all.addEventListener('change', () => { (ui._visIds || []).forEach((id) => (all.checked ? ui.sel.add(id) : ui.sel.delete(id))); render(); });
    const sm = $('#selMove'); if (sm) sm.addEventListener('click', () => moveForm([...ui.sel]));
    const sc = $('#selClear'); if (sc) sc.addEventListener('click', () => { ui.sel.clear(); render(); });
    $$('[data-move-tx]').forEach((b) => b.addEventListener('click', () => moveForm([b.dataset.moveTx])));
  }

  /** Mover um ou mais lançamentos para outra fatura e/ou outro cartão. */
  function moveForm(ids) {
    const txs = ids.map((id) => S().transactions.find((t) => t.id === id)).filter(Boolean);
    if (!txs.length) return;
    const fromCard = ui.cardSel, fromMonth = ui.cardMonth || ui.month;
    const multi = txs.length > 1, anyParc = txs.some((t) => t.installments > 1);
    const form = openModal(`
      <h2>Mover ${multi ? txs.length + ' lançamentos' : 'lançamento'}</h2>
      <p class="desc">${multi ? txs.slice(0, 5).map((t) => esc(t.desc)).join(', ') + (txs.length > 5 ? '…' : '') : `<b>${esc(txs[0].desc)}</b> · ${fmt.money(txs[0].amount)}${txs[0].installments > 1 ? ' · ' + txs[0].installments + 'x' : ''}`}</p>
      <div class="form-grid">
        <div class="field full"><label>Fatura</label>
          <div class="toolbar" style="margin:0"><button class="btn btn-sm" type="button" data-shift="-1">${icon('left')}Fatura anterior</button>
            <input type="month" name="month" value="${fromMonth}" required style="max-width:200px" />
            <button class="btn btn-sm" type="button" data-shift="1">Próxima fatura${icon('right')}</button></div>
          <span class="hint">Hoje ${multi ? 'estão' : 'está'} na fatura de ${fmt.monthLong(fromMonth)}.${anyParc ? ' Nos parcelados, todas as parcelas andam junto (a 1ª parcela muda de mês na mesma proporção).' : ''}</span></div>
        <div class="field full"><label>Cartão / conta</label><select name="account">${accountOptions(fromCard)}</select>
          <span class="hint">Ao trocar de cartão, o portador volta para o titular se o novo cartão não tiver o mesmo adicional.</span></div>
      </div>
      <div id="movePrev" class="cell-sub" style="margin-top:12px"></div>
      ${actions('Mover')}`, (f) => {
      const target = f.get('month'), acc = f.get('account');
      const delta = ym.diff(fromMonth, target);
      if (!delta && acc === fromCard) return;
      const c = card(acc);
      txs.forEach((t) => {
        if (delta) t.firstMonth = ym.add(t.firstMonth, delta);
        if (acc !== t.account) {
          t.account = acc;
          if (!c) delete t.holder; else if (t.holder && !holdersOf(c).some((h) => h.id === t.holder)) t.holder = 'titular';
          delete t.sort;
        }
      });
      ui.sel.clear();
      if (acc !== fromCard && c) ui.cardSel = acc;
      if (c) ui.cardMonth = target;
      commit(`${txs.length} lançamento(s) movido(s) para ${c ? c.name : 'Débito / Pix'} · ${fmt.month(target)}`);
    });
    const upd = () => {
      const t = form.month.value, acc = form.account.value;
      $('#movePrev', form).innerHTML = t ? `Destino: <b>${esc(Core.accountName(acc))}</b>, ${card(acc) ? 'fatura de' : 'mês de'} <b>${fmt.monthLong(t)}</b>.` : '';
    };
    $$('[data-shift]', form).forEach((b) => b.addEventListener('click', () => { form.month.value = ym.add(form.month.value || fromMonth, +b.dataset.shift); upd(); }));
    form.onchange = upd; form.oninput = upd; upd();
  }

  function afterCartoes() {
    $$('[data-card]').forEach((e) => e.addEventListener('click', () => { ui.cardSel = e.dataset.card; ui.cardMonth = null; ui.cardHolder = 'all'; ui.sel.clear(); render(); }));
    $$('#chips .chip').forEach((e) => e.addEventListener('click', () => { ui.cardMonth = e.dataset.m; ui.sel.clear(); render(); }));
    $$('[data-holder]').forEach((e) => e.addEventListener('click', () => { ui.cardHolder = e.dataset.holder; render(); }));
    const c = card(ui.cardSel); if (!c) return;
    const cm = ui.cardMonth || ui.month, key = c.id + '|' + cm;
    const p = $('#invPaid'); if (p) p.addEventListener('change', () => { if (p.checked) S().invoicePaid[key] = true; else delete S().invoicePaid[key]; commit('Fatura atualizada'); });
    const chip = $('#chips .chip.active'); if (chip) chip.scrollIntoView({ inline: 'center', block: 'nearest' });
    bindReorder();
    bindTxActions();
  }

  // ======================================================
  // PARCELAMENTOS
  // ======================================================
  function viewParcelas() {
    const m = ui.month;
    const f = ui.txFilter;
    let list = S().transactions.filter((t) => t.installments > 1).map((t) => ({ t, r: Core.remainingFrom(t, m), cur: Math.min(t.installments, Math.max(0, ym.diff(t.firstMonth, m) + 1)) }));
    if (!ui.showDone) list = list.filter((x) => x.r.left > 0);
    if (f.account !== 'all') list = list.filter((x) => x.t.account === f.account);
    list.sort((a, b) => b.r.value - a.r.value);
    const totalLeft = list.reduce((a, x) => a + x.r.value, 0);
    const monthly = list.filter((x) => Core.installmentIn(x.t, m)).reduce((a, x) => a + x.t.amount, 0);

    return `
      <div class="grid grid-3">
        <div class="panel kpi"><div class="kpi-label">${icon('layers')}Compras parceladas ativas</div><div class="kpi-value">${list.filter((x) => x.r.left > 0).length}</div></div>
        <div class="panel kpi"><div class="kpi-label">${icon('calendar')}Parcelas em ${fmt.month(m)}</div><div class="kpi-value">${fmt.money(monthly)}</div></div>
        <div class="panel kpi"><div class="kpi-label">${icon('wallet')}Saldo restante a pagar</div><div class="kpi-value">${fmt.money(totalLeft)}</div></div>
      </div>
      <div class="panel mt">
        <div class="toolbar">
          <select id="pAcc"><option value="all">Todas as contas</option>${accountOptions(f.account)}</select>
          <label class="check"><input type="checkbox" id="pDone" ${ui.showDone ? 'checked' : ''}/> Mostrar quitados</label>
        </div>
        <div class="table-wrap"><table>
          <thead><tr><th>Compra</th><th>Cartão</th><th>Andamento</th><th class="r">Parcela</th><th class="r">Restam</th><th class="r">Saldo</th><th>Última</th><th></th></tr></thead>
          <tbody>${list.length ? list.map(({ t, r, cur }) => `<tr>
            <td><div class="cell-title">${esc(t.desc)} ${holderBadge(t)}</div><div class="cell-sub">${fmt.date(t.date)} · total ${fmt.money(t.amount * t.installments)}</div>${t.note ? `<div class="note">${icon('info')}${esc(t.note)}</div>` : ''}</td>
            <td><span class="badge"><i class="dot" style="background:${Charts.tone((card(t.account) || {}).color || seriesColor.conta)}"></i>${esc(Core.accountName(t.account))}</span></td>
            <td style="min-width:140px"><div class="cell-sub">${cur} de ${t.installments}</div><div class="progress"><span style="width:${(cur / t.installments) * 100}%"></span></div></td>
            <td class="r">${fmt.money(t.amount)}</td><td class="r">${r.left}x</td><td class="r"><b>${fmt.money(r.value)}</b></td>
            <td>${r.left ? fmt.month(r.lastMonth) : '<span class="badge good">quitado</span>'}</td>
            <td><div class="row-actions"><button class="icon-btn" data-edit-tx="${t.id}" aria-label="Editar">${icon('edit')}</button><button class="icon-btn btn-danger" data-del-tx="${t.id}" aria-label="Excluir">${icon('trash')}</button></div></td>
          </tr>`).join('') : '<tr><td colspan="8" class="empty">Nenhum parcelamento.</td></tr>'}</tbody>
          ${list.length ? `<tfoot><tr><td colspan="5">Total</td><td class="r">${fmt.money(totalLeft)}</td><td colspan="2"></td></tr></tfoot>` : ''}
        </table></div>
      </div>`;
  }
  function afterParcelas() {
    $('#pAcc').addEventListener('change', (e) => { ui.txFilter.account = e.target.value; render(); });
    $('#pDone').addEventListener('change', (e) => { ui.showDone = e.target.checked; render(); });
    bindTxActions();
  }
  const accountOptions = (sel) => S().cards.map((c) => `<option value="${c.id}" ${sel === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('') + `<option value="conta" ${sel === 'conta' ? 'selected' : ''}>Débito / Pix / Dinheiro</option>`;

  // ======================================================
  // DESPESAS FIXAS
  // ======================================================
  function viewFixas() {
    const m = ui.month;
    const list = S().fixed.slice().sort((a, b) => a.dueDay - b.dueDay);
    const active = list.filter((f) => Core.fixedActive(f, m));
    const total = active.reduce((a, f) => a + (+f.amount || 0), 0);
    const paid = active.filter((f) => S().fixedPaid[f.id + '|' + m]).reduce((a, f) => a + (+f.amount || 0), 0);
    const income = +S().settings.income || 0;
    return `
      <div class="grid grid-3">
        <div class="panel kpi"><div class="kpi-label">${icon('bolt')}Total de fixas em ${fmt.month(m)}</div><div class="kpi-value">${fmt.money(total)}</div><div class="kpi-foot">${income ? fmt.pct(total / income) + ' da renda' : ''}</div></div>
        <div class="panel kpi"><div class="kpi-label">${icon('check')}Pagas</div><div class="kpi-value pos">${fmt.money(paid)}</div></div>
        <div class="panel kpi"><div class="kpi-label">${icon('calendar')}A pagar</div><div class="kpi-value">${fmt.money(total - paid)}</div></div>
      </div>
      <div class="panel mt">
        <div class="panel-head"><h2>Contas fixas</h2><span class="sub">água, luz, internet, aluguel…</span><span class="spacer"></span><button class="btn btn-primary btn-sm" data-act="fix-new">${icon('plus')}Nova despesa fixa</button></div>
        <div class="table-wrap"><table>
          <thead><tr><th>Despesa</th><th>Vencimento</th><th>Vigência</th><th class="r">Valor mensal</th><th>${fmt.month(m)}</th><th></th></tr></thead>
          <tbody>${list.length ? list.map((f) => { const on = Core.fixedActive(f, m); const pd = !!S().fixedPaid[f.id + '|' + m]; return `<tr ${on ? '' : 'style="opacity:.5"'}>
            <td><div style="display:flex;gap:12px;align-items:center"><div class="avatar">${icon(FIXED_ICON(f))}</div><div><div class="cell-title">${esc(f.name)}</div><div class="cell-sub">${esc((CATS[f.category] || CATS.outros).name)}${f.estimated ? ' · <span class="badge warn">valor estimado</span>' : ''}</div></div></div></td>
            <td>Dia ${f.dueDay}</td>
            <td class="cell-sub">${f.start ? 'desde ' + fmt.month(f.start) : ''}${f.end ? ' até ' + fmt.month(f.end) : ' · sem fim'}</td>
            <td class="r"><b>${fmt.money(f.amount)}</b></td>
            <td>${on ? `<label class="check"><input type="checkbox" data-fpaid="${f.id}" ${pd ? 'checked' : ''}/>${pd ? 'Paga' : 'Pendente'}</label>` : '<span class="muted">inativa</span>'}</td>
            <td><div class="row-actions"><button class="icon-btn" data-edit-fix="${f.id}" aria-label="Editar">${icon('edit')}</button><button class="icon-btn btn-danger" data-del-fix="${f.id}" aria-label="Excluir">${icon('trash')}</button></div></td>
          </tr>`; }).join('') : '<tr><td colspan="6" class="empty">Nenhuma despesa fixa.</td></tr>'}</tbody>
          <tfoot><tr><td colspan="3">Total ativo no mês</td><td class="r">${fmt.money(total)}</td><td colspan="2"></td></tr></tfoot>
        </table></div>
      </div>`;
  }
  function afterFixas() {
    const m = ui.month;
    $$('[data-fpaid]').forEach((cb) => cb.addEventListener('change', () => { const k = cb.dataset.fpaid + '|' + m; if (cb.checked) S().fixedPaid[k] = true; else delete S().fixedPaid[k]; commit(); }));
    $$('[data-edit-fix]').forEach((b) => b.addEventListener('click', () => fixedForm(S().fixed.find((f) => f.id === b.dataset.editFix))));
    $$('[data-del-fix]').forEach((b) => b.addEventListener('click', () => {
      const f = S().fixed.find((x) => x.id === b.dataset.delFix);
      if (confirm(`Excluir a despesa fixa “${f.name}”?`)) { S().fixed = S().fixed.filter((x) => x !== f); commit('Despesa excluída'); }
    }));
  }

  // ======================================================
  // LANÇAMENTOS
  // ======================================================
  function viewLancamentos() {
    const m = ui.month, f = ui.txFilter;
    let list = S().transactions.slice();
    if (f.account !== 'all') list = list.filter((t) => t.account === f.account);
    if (f.q) { const q = f.q.toLowerCase(); list = list.filter((t) => t.desc.toLowerCase().includes(q)); }
    const holderNames = [...new Set(S().cards.filter(multiHolder).flatMap((c) => holdersOf(c).map((h) => h.name)))];
    if (f.holder !== 'all' && holderNames.includes(f.holder)) list = list.filter((t) => card(t.account) && holderName(t) === f.holder);
    let rows;
    if (f.scope === 'month') rows = list.map((t) => ({ t, it: Core.installmentIn(t, m) })).filter((x) => x.it);
    else rows = list.map((t) => ({ t, it: null }));
    rows.sort((a, b) => (b.t.date || '').localeCompare(a.t.date || ''));
    const sum = rows.reduce((a, x) => a + (x.it ? x.it.amount : x.t.amount * x.t.installments), 0);
    const groups = duplicateGroups();
    return `
      ${groups.length ? `<div class="panel" style="margin-bottom:20px;border-color:color-mix(in srgb, var(--warn) 45%, var(--border))">
        <div class="panel-head">${icon('alert')}<h2>Possíveis lançamentos duplicados</h2><span class="sub">${groups.length} grupo(s) — mesmo cartão, mesmo valor e datas próximas</span></div>
        ${groups.map((g, gi) => `<div class="dup-group">
          ${g.map((t) => `<div class="list-item">
            <div class="grow"><div class="cell-title">${esc(t.desc)}</div><div class="cell-sub">${fmt.date(t.date) || 'sem data'} · ${esc(Core.accountName(t.account))} · ${t.installments > 1 ? t.installments + 'x de ' : ''}${fmt.money(t.amount)} · 1ª parcela na fatura ${t.firstMonth ? fmt.month(t.firstMonth) : '—'}</div></div>
            <button class="btn btn-sm" data-edit-tx="${t.id}">${icon('edit')}Editar</button>
            <button class="btn btn-sm btn-danger" data-dupdel="${t.id}">${icon('trash')}Excluir este</button>
          </div>`).join('')}
          <div style="text-align:right"><button class="btn btn-sm btn-ghost" data-dupok="${gi}">Não são duplicados</button></div>
        </div>`).join('')}
      </div>` : ''}
      <div class="panel">
        <div class="toolbar">
          <input type="text" id="tq" placeholder="Buscar descrição…" value="${esc(f.q)}" />
          <select id="tAcc"><option value="all">Todas as contas</option>${accountOptions(f.account)}</select>
          ${holderNames.length ? `<select id="tHold"><option value="all">Todos os portadores</option>${holderNames.map((n) => `<option value="${esc(n)}" ${f.holder === n ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select>` : ''}
          <div class="segmented" id="tScope"><button type="button" data-s="month" class="${f.scope === 'month' ? 'active' : ''}">Cobranças de ${fmt.month(m)}</button><button type="button" data-s="all" class="${f.scope === 'all' ? 'active' : ''}">Todas as compras</button></div>
          <span class="spacer" style="flex:1"></span>
          <button class="btn btn-primary btn-sm" data-act="tx-new">${icon('plus')}Novo gasto</button>
        </div>
        <div class="table-wrap"><table>
          <thead><tr><th>Data</th><th>Descrição</th><th>Conta</th><th>Categoria</th><th>Parcelas</th><th class="r">${f.scope === 'month' ? 'Valor no mês' : 'Valor total'}</th><th></th></tr></thead>
          <tbody>${rows.length ? rows.map(({ t, it }) => { const cat = CATS[t.category] || CATS.outros; const v = it ? it.amount : t.amount * t.installments; return `<tr>
            <td class="num">${fmt.date(t.date)}</td>
            <td><div class="cell-title">${esc(t.desc)} ${holderBadge(t)}</div>${t.note ? `<div class="note">${icon('info')}${esc(t.note)}</div>` : ''}</td>
            <td><span class="badge"><i class="dot" style="background:${Charts.tone((card(t.account) || {}).color || seriesColor.conta)}"></i>${esc(Core.accountName(t.account))}</span></td>
            <td>${esc(cat.name)}</td>
            <td>${t.installments > 1 ? `<span class="badge primary">${it ? it.n + ' de ' + t.installments : t.installments + 'x de ' + fmt.money(t.amount)}</span>` : '<span class="muted">à vista</span>'}</td>
            <td class="r ${v < 0 ? 'pos' : ''}"><b>${fmt.money(v)}</b></td>
            <td><div class="row-actions"><button class="icon-btn" data-edit-tx="${t.id}" aria-label="Editar">${icon('edit')}</button><button class="icon-btn btn-danger" data-del-tx="${t.id}" aria-label="Excluir">${icon('trash')}</button></div></td>
          </tr>`; }).join('') : '<tr><td colspan="7" class="empty">Nenhum lançamento encontrado.</td></tr>'}</tbody>
          ${rows.length ? `<tfoot><tr><td colspan="5">${rows.length} lançamentos</td><td class="r">${fmt.money(sum)}</td><td></td></tr></tfoot>` : ''}
        </table></div>
      </div>`;
  }
  function afterLancamentos() {
    const q = $('#tq');
    q.addEventListener('input', () => { ui.txFilter.q = q.value; const pos = q.selectionStart; render(); const n = $('#tq'); n.focus(); n.setSelectionRange(pos, pos); });
    $('#tAcc').addEventListener('change', (e) => { ui.txFilter.account = e.target.value; render(); });
    const th = $('#tHold'); if (th) th.addEventListener('change', () => { ui.txFilter.holder = th.value; render(); });
    $$('#tScope button').forEach((b) => b.addEventListener('click', () => { ui.txFilter.scope = b.dataset.s; render(); }));
    $$('[data-dupdel]').forEach((b) => b.addEventListener('click', () => {
      const t = S().transactions.find((x) => x.id === b.dataset.dupdel);
      if (confirm(`Excluir “${t.desc}” (${t.installments}x de ${fmt.money(t.amount)})?`)) { S().transactions = S().transactions.filter((x) => x !== t); commit('Duplicado excluído'); }
    }));
    $$('[data-dupok]').forEach((b) => b.addEventListener('click', () => {
      const g = duplicateGroups()[+b.dataset.dupok]; S().dupIgnore = S().dupIgnore || {};
      for (let i = 0; i < g.length; i++) for (let j = i + 1; j < g.length; j++) S().dupIgnore[[g[i].id, g[j].id].sort().join('|')] = true;
      commit('Marcado como não duplicado');
    }));
    bindTxActions();
  }
  function bindTxActions() {
    $$('[data-edit-tx]').forEach((b) => b.addEventListener('click', () => txForm(S().transactions.find((t) => t.id === b.dataset.editTx))));
    $$('[data-del-tx]').forEach((b) => b.addEventListener('click', () => {
      const t = S().transactions.find((x) => x.id === b.dataset.delTx);
      if (confirm(`Excluir “${t.desc}”${t.installments > 1 ? ' e todas as suas parcelas' : ''}?`)) { S().transactions = S().transactions.filter((x) => x !== t); commit('Lançamento excluído'); }
    }));
  }

  // ======================================================
  // CONFIGURAÇÕES
  // ======================================================
  function viewConfig() {
    const st = S().settings;
    return `
      <div class="grid grid-2">
        <div class="panel">
          <div class="panel-head"><h2>Orçamento</h2></div>
          <form id="cfgForm" class="form-grid">
            <div class="field"><label for="cInc">Renda líquida mensal (R$)</label><input id="cInc" type="number" step="0.01" min="0" name="income" value="${st.income || ''}" placeholder="Ex.: 8000" /><span class="hint">Salário e outras entradas fixas, já com descontos.</span></div>
            <div class="field"><label for="cSav">Reserva para poupança (%)</label><input id="cSav" type="number" step="1" min="0" max="100" name="savingsGoal" value="${st.savingsGoal || 0}" /><span class="hint">Separada antes de calcular o “posso gastar”.</span></div>
            <div class="field full"><label for="cPrev">Faturas do cartão entram no orçamento de</label>
              <select id="cPrev" name="payWithPrevIncome">
                <option value="1" ${st.payWithPrevIncome ? 'selected' : ''}>Mês anterior ao vencimento — pago com a renda do mês anterior (ex.: recebo em novembro, pago no início de dezembro)</option>
                <option value="0" ${st.payWithPrevIncome ? '' : 'selected'}>Mês do vencimento</option>
              </select></div>
            <div class="field"><label for="cPrevDay">…quando vencem até o dia</label><input id="cPrevDay" type="number" min="1" max="31" name="prevIncomeDay" value="${st.prevIncomeDay || 10}" /><span class="hint">Contas que vencem depois desse dia ficam no próprio mês.</span></div>
            <div class="field"><label class="check" style="margin-top:26px"><input type="checkbox" name="prevIncomeFixed" ${st.prevIncomeFixed ? 'checked' : ''}/> Aplicar também às despesas fixas</label></div>
            <div class="field"><label for="cTheme">Tema</label><select id="cTheme" name="theme"><option value="auto" ${st.theme === 'auto' ? 'selected' : ''}>Automático (sistema)</option><option value="light" ${st.theme === 'light' ? 'selected' : ''}>Claro</option><option value="dark" ${st.theme === 'dark' ? 'selected' : ''}>Escuro</option></select></div>
            <div class="field full"><button class="btn btn-primary" type="submit">Salvar</button></div>
          </form>
        </div>
        ${extrasPanelHTML()}
        <div class="panel">
          <div class="panel-head"><h2>Cartões</h2><span class="spacer"></span><button class="btn btn-sm" data-act="card-new">${icon('plus')}Novo cartão</button></div>
          <div class="list">${S().cards.map((c) => `<div class="list-item"><span class="dot" style="background:${Charts.tone(c.color)}"></span>
            <div class="grow"><div class="cell-title">${esc(c.name)}</div><div class="cell-sub">Fecha dia ${c.closingDay} · vence dia ${c.dueDay}${c.limit ? ' · limite ' + fmt.money(c.limit) : ''}</div></div>
            <button class="icon-btn" data-cedit="${c.id}" aria-label="Editar">${icon('edit')}</button><button class="icon-btn btn-danger" data-cdel="${c.id}" aria-label="Excluir">${icon('trash')}</button></div>`).join('')}</div>
        </div>
      </div>
      ${folderPanelHTML()}
      <div class="panel mt">
        <div class="panel-head"><h2>Seus dados</h2></div>
        <div class="alert info">${icon('lock')}<div>Os dados ficam <b>neste navegador</b> e, se conectada, <b>na sua pasta</b> — nada é enviado para servidores deste site. Você também pode exportar/importar um backup JSON. Não inclua CPF, endereço ou número completo de cartão nos lançamentos (LGPD).</div></div>
        <div class="toolbar">
          <button class="btn" id="exp">${icon('download')}Exportar backup (JSON)</button>
          <label class="btn">${icon('upload')}Importar backup<input type="file" id="imp" accept="application/json" hidden /></label>
          <button class="btn btn-danger" id="clr">${icon('trash')}Apagar tudo</button>
        </div>
      </div>`;
  }
  // ---------------- Rendas extras (férias, 13º…) ----------------
  const EXTRA_KINDS = { '13': '13º salário', ferias: 'Férias', bonus: 'Bônus / PLR', outro: 'Outra renda' };
  function extrasPanelHTML() {
    const list = (S().extraIncome || []).slice().sort((a, b) => (a.month || '').localeCompare(b.month || ''));
    const base = +S().settings.income || 0;
    return `<div class="panel">
      <div class="panel-head"><h2>Rendas extras</h2><span class="sub">somadas à renda no mês em que caem</span><span class="spacer"></span>
        <button class="btn btn-sm" data-act="extra-new">${icon('plus')}Nova renda extra</button></div>
      <div class="toolbar" style="margin-bottom:8px">
        <button class="btn btn-sm" type="button" id="add13">${icon('plus')}13º salário (2 parcelas)</button>
        <button class="btn btn-sm" type="button" id="addFerias">${icon('plus')}Férias</button>
      </div>
      ${list.length ? `<div class="list">${list.map((e) => `<div class="list-item">
        <div class="avatar">${icon(e.kind === 'ferias' ? 'sun' : 'piggy')}</div>
        <div class="grow"><div class="cell-title">${esc(e.name)}</div><div class="cell-sub">${esc(EXTRA_KINDS[e.kind] || 'Renda extra')} · ${e.month ? fmt.monthLong(e.month) : '—'}${e.yearly ? ' · todo ano' : ''}</div></div>
        <div class="amount pos">+${fmt.money(e.amount)}</div>
        <button class="icon-btn" data-xedit="${e.id}" aria-label="Editar">${icon('edit')}</button><button class="icon-btn btn-danger" data-xdel="${e.id}" aria-label="Excluir">${icon('trash')}</button>
      </div>`).join('')}</div>` : `<div class="empty">Nenhuma renda extra. Use os botões acima para incluir o 13º e as férias${base ? '' : ' (informe a renda mensal para sugerir os valores)'}.</div>`}
    </div>`;
  }
  function extraForm(e, preset = {}) {
    const isNew = !e;
    e = e || { name: preset.name || '', kind: preset.kind || 'outro', amount: preset.amount ?? '', month: preset.month || ui.month, yearly: preset.yearly ?? true };
    openModal(`
      <h2>${isNew ? 'Nova renda extra' : 'Editar renda extra'}</h2>
      <p class="desc">Valor líquido que entra na conta. Ele é somado à renda do mês escolhido e aumenta o “posso gastar” daquele mês.</p>
      <div class="form-grid">
        <div class="field full"><label>Descrição</label><input type="text" name="name" required value="${esc(e.name)}" placeholder="Ex.: 13º salário — 1ª parcela" /></div>
        <div class="field"><label>Tipo</label><select name="kind">${Object.entries(EXTRA_KINDS).map(([k, v]) => `<option value="${k}" ${k === e.kind ? 'selected' : ''}>${v}</option>`).join('')}</select></div>
        <div class="field"><label>Valor líquido (R$)</label><input type="number" name="amount" step="0.01" min="0" required value="${e.amount}" /></div>
        <div class="field"><label>Mês do recebimento</label><input type="month" name="month" required value="${e.month}" /></div>
        <div class="field"><label class="check" style="margin-top:26px"><input type="checkbox" name="yearly" ${e.yearly ? 'checked' : ''}/> Repetir todo ano</label></div>
        ${preset.hint ? `<div class="field full"><span class="hint">${preset.hint}</span></div>` : ''}
      </div>${actions()}`, (f) => {
      const data = { name: f.get('name').trim(), kind: f.get('kind'), amount: +f.get('amount') || 0, month: f.get('month'), yearly: !!f.get('yearly') };
      S().extraIncome = S().extraIncome || [];
      if (isNew) S().extraIncome.push({ id: Core.uid(), ...data }); else Object.assign(e, data);
      commit('Renda extra salva');
    });
  }
  function add13() {
    const base = +S().settings.income || 0, y = (ui.month || ym.today()).slice(0, 4);
    const half = Math.round(base / 2 * 100) / 100;
    S().extraIncome = S().extraIncome || [];
    S().extraIncome.push(
      { id: Core.uid(), name: '13º salário — 1ª parcela', kind: '13', amount: half, month: `${y}-11`, yearly: true },
      { id: Core.uid(), name: '13º salário — 2ª parcela', kind: '13', amount: half, month: `${y}-12`, yearly: true }
    );
    commit('13º incluído — confira os valores líquidos');
  }
  function afterExtras() {
    const base = +S().settings.income || 0;
    const b13 = $('#add13'); if (b13) b13.addEventListener('click', () => {
      if ((S().extraIncome || []).some((e) => e.kind === '13') && !confirm('Já existe 13º cadastrado. Incluir outro?')) return;
      add13();
    });
    const bf = $('#addFerias'); if (bf) bf.addEventListener('click', () => extraForm(null, {
      name: 'Férias — 1/3 constitucional', kind: 'ferias', amount: base ? Math.round(base / 3 * 100) / 100 : '', month: ym.add(ui.month, 1), yearly: true,
      hint: 'Sugestão: 1/3 do salário (adicional de férias). Informe só o valor que entra <b>a mais</b> naquele mês — o salário normal já está na renda mensal. Se o salário das férias vier adiantado e o mês seguinte vier menor, ajuste para o valor líquido real.'
    }));
    $$('[data-xedit]').forEach((b) => b.addEventListener('click', () => extraForm(S().extraIncome.find((x) => x.id === b.dataset.xedit))));
    $$('[data-xdel]').forEach((b) => b.addEventListener('click', () => {
      const e = S().extraIncome.find((x) => x.id === b.dataset.xdel);
      if (confirm(`Excluir “${e.name}”?`)) { S().extraIncome = S().extraIncome.filter((x) => x !== e); commit('Renda extra excluída'); }
    }));
  }

  function afterConfig() {
    afterExtras();
    afterFolderPanel();
    $('#cfgForm').addEventListener('submit', (e) => {
      e.preventDefault(); const f = new FormData(e.target);
      Object.assign(S().settings, { income: +f.get('income') || 0, savingsGoal: +f.get('savingsGoal') || 0, theme: f.get('theme'),
        payWithPrevIncome: f.get('payWithPrevIncome') === '1', prevIncomeDay: Math.min(31, Math.max(1, +f.get('prevIncomeDay') || 10)), prevIncomeFixed: !!f.get('prevIncomeFixed') });
      applyTheme(); commit('Configurações salvas');
    });
    $$('[data-cedit]').forEach((b) => b.addEventListener('click', () => cardForm(card(b.dataset.cedit))));
    $$('[data-cdel]').forEach((b) => b.addEventListener('click', () => {
      const c = card(b.dataset.cdel);
      const n = S().transactions.filter((t) => t.account === c.id).length;
      if (confirm(`Excluir o cartão “${c.name}”${n ? ` e seus ${n} lançamentos` : ''}?`)) {
        S().cards = S().cards.filter((x) => x !== c); S().transactions = S().transactions.filter((t) => t.account !== c.id); commit('Cartão excluído');
      }
    }));
    $('#exp').addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(S(), null, 2)], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'controle-despesas-backup-' + new Date().toISOString().slice(0, 10) + '.json'; a.click(); URL.revokeObjectURL(a.href);
    });
    $('#imp').addEventListener('change', async (e) => {
      const file = e.target.files[0]; if (!file) return;
      try { const obj = JSON.parse(await file.text()); if (!obj.transactions || !obj.cards) throw 0; Core.replace(obj); applyTheme(); render(); toast('Backup importado'); }
      catch (err) { alert('Arquivo inválido.'); }
    });
    $('#clr').addEventListener('click', () => {
      if (confirm('Apagar TODOS os dados? Esta ação não pode ser desfeita.')) {
        Core.replace({ version: 1, settings: { ...S().settings, income: 0 }, cards: [], fixed: [], transactions: [], invoiceOverrides: {}, invoicePaid: {}, fixedPaid: {} });
        render(); toast('Dados apagados');
      }
    });
  }

  // ======================================================
  // FORMULÁRIOS (modal)
  // ======================================================
  function openModal(html, onSubmit) {
    const dlg = $('#modal'), form = $('#modalForm');
    form.innerHTML = html; hydrateIcons(form);
    form.onchange = null; form.oninput = null;
    form.onsubmit = (e) => {
      if (e.submitter && e.submitter.value === 'cancel') return;
      e.preventDefault();
      if (onSubmit(new FormData(form), form) !== false) dlg.close();
    };
    dlg.showModal();
    const first = form.querySelector('input:not([type=hidden]),select'); if (first) first.focus();
    return form;
  }
  const actions = (label = 'Salvar') => `<div class="modal-actions"><button class="btn btn-ghost" value="cancel" formnovalidate>Cancelar</button><button class="btn btn-primary" type="submit">${label}</button></div>`;

  /** Mês da fatura em que cai a 1ª parcela de uma compra. */
  function firstInvoiceMonth(accountId, date) {
    const m = date.slice(0, 7);
    const c = card(accountId);
    if (!c) return m;
    const day = +date.slice(8, 10);
    const closeM = day < c.closingDay ? m : ym.add(m, 1);
    return c.dueDay > c.closingDay ? closeM : ym.add(closeM, 1);
  }

  function txForm(t, preset = {}) {
    const isNew = !t;
    t = t || { account: preset.account || (S().cards[0] ? S().cards[0].id : 'conta'), date: new Date().toISOString().slice(0, 10), desc: '', category: 'compras', amount: '', installments: 1, firstMonth: '' };
    const form = openModal(`
      <h2>${isNew ? 'Novo gasto' : 'Editar lançamento'}</h2>
      <p class="desc">Compras no cartão entram na fatura certa automaticamente, conforme o dia de fechamento.</p>
      <div class="form-grid">
        <div class="field full"><label>Descrição</label><input type="text" name="desc" required value="${esc(t.desc)}" placeholder="Ex.: Supermercado" /></div>
        <div class="field"><label>Conta / cartão</label><select name="account">${accountOptions(t.account)}</select></div>
        <div class="field"><label>Categoria</label><select name="category">${catOptions(t.category)}</select></div>
        <div class="field" id="holderField"><label>Portador (quem gastou)</label><select name="holder"></select></div>
        <div class="field"><label>Data da compra</label><input type="date" name="date" required value="${t.date}" /></div>
        <div class="field"><label>Parcelas</label><input type="number" name="installments" min="1" max="72" value="${t.installments}" required /></div>
        <div class="field"><label>Valor</label><input type="number" name="amount" step="0.01" required value="${t.amount === '' ? '' : t.amount}" /><span class="hint">Negativo para estorno/reembolso.</span></div>
        <div class="field"><label>O valor informado é</label><select name="mode"><option value="parcela">da parcela</option><option value="total">total da compra</option></select></div>
        <div class="field full"><label>Fatura da 1ª parcela</label><input type="month" name="firstMonth" value="${t.firstMonth}" /><span class="hint" id="fmHint">Deixe em branco para calcular automaticamente.</span></div>
        <div class="field full"><label>Observação</label><input type="text" name="note" value="${esc(t.note || '')}" /></div>
      </div>${actions()}`, (f) => {
      const n = Math.max(1, +f.get('installments') || 1);
      let amount = +f.get('amount');
      if (f.get('mode') === 'total') amount = Math.round((amount / n) * 100) / 100;
      const data = { account: f.get('account'), desc: f.get('desc').trim(), category: f.get('category'), date: f.get('date'), installments: n, amount, note: f.get('note').trim() };
      const c = card(data.account);
      if (c) { data.holder = f.get('holder') || 'titular'; if (data.holder === 'adicional') ensureHolder(c, 'adicional', 'Adicional'); } else data.holder = undefined;
      data.firstMonth = f.get('firstMonth') || firstInvoiceMonth(data.account, data.date);
      if (isNew) S().transactions.push({ id: Core.uid(), ...data }); else Object.assign(t, data);
      commit(isNew ? 'Gasto lançado' : 'Lançamento atualizado');
    });
    const updHolder = () => {
      const c = card(form.account.value);
      $('#holderField', form).hidden = !c;
      if (c) form.holder.innerHTML = holderOptions(c, form.holder.value || t.holder || preset.holder);
    };
    const upd = () => {
      const acc = form.account.value, d = form.date.value;
      $('#fmHint', form).textContent = d ? `Automático: ${fmt.monthLong(firstInvoiceMonth(acc, d))}.` : '';
    };
    form.account.addEventListener('change', updHolder); updHolder();
    form.account.addEventListener('change', upd); form.date.addEventListener('change', upd); upd();
  }

  function fixedForm(f) {
    const isNew = !f;
    f = f || { name: '', category: 'moradia', amount: '', dueDay: 10, start: ui.month, end: '' };
    openModal(`
      <h2>${isNew ? 'Nova despesa fixa' : 'Editar despesa fixa'}</h2>
      <p class="desc">Contas que se repetem todo mês: água, luz, internet, aluguel, plano de saúde, escola…</p>
      <div class="form-grid">
        <div class="field full"><label>Nome</label><input type="text" name="name" required value="${esc(f.name)}" placeholder="Ex.: Energia elétrica" list="fixSug" />
          <datalist id="fixSug">${['Energia elétrica', 'Água e esgoto', 'Gás de cozinha', 'Internet', 'Celular', 'Aluguel', 'Condomínio', 'IPTU', 'Plano de saúde', 'Academia', 'Escola / faculdade', 'Streaming', 'Seguro do carro', 'Diarista'].map((s) => `<option value="${s}">`).join('')}</datalist></div>
        <div class="field"><label>Valor mensal (R$)</label><input type="number" name="amount" step="0.01" min="0" required value="${f.amount}" /></div>
        <div class="field"><label>Dia do vencimento</label><input type="number" name="dueDay" min="1" max="31" required value="${f.dueDay}" /></div>
        <div class="field"><label>Categoria</label><select name="category">${catOptions(f.category)}</select></div>
        <div class="field"><label class="check" style="margin-top:26px"><input type="checkbox" name="estimated" ${f.estimated ? 'checked' : ''}/> Valor estimado (varia)</label></div>
        <div class="field"><label>Início</label><input type="month" name="start" value="${f.start || ''}" /></div>
        <div class="field"><label>Fim (opcional)</label><input type="month" name="end" value="${f.end || ''}" /></div>
      </div>${actions()}`, (fd) => {
      const data = { name: fd.get('name').trim(), amount: +fd.get('amount'), dueDay: +fd.get('dueDay'), category: fd.get('category'), start: fd.get('start'), end: fd.get('end'), estimated: !!fd.get('estimated') };
      if (isNew) S().fixed.push({ id: Core.uid(), ...data }); else Object.assign(f, data);
      commit('Despesa fixa salva');
    });
  }

  function cardForm(c, onCreated) {
    const isNew = !c;
    const used = S().cards.map((k) => k.color);
    const free = Charts.LIGHT.find((h) => h !== seriesColor.fixas && h !== seriesColor.conta && !used.includes(h)) || Charts.LIGHT[6];
    c = c || { name: '', brand: '', color: free, brandColor: '#334155', closingDay: 1, dueDay: 10, limit: 0 };
    openModal(`
      <h2>${isNew ? 'Novo cartão' : 'Editar cartão'}</h2>
      <p class="desc">Não informe o número do cartão — apenas um apelido.</p>
      <div class="form-grid">
        <div class="field"><label>Apelido</label><input type="text" name="name" required value="${esc(c.name)}" /></div>
        <div class="field"><label>Banco / emissor</label><input type="text" name="brand" value="${esc(c.brand)}" /></div>
        <div class="field"><label>Dia de fechamento</label><input type="number" name="closingDay" min="1" max="31" required value="${c.closingDay}" /></div>
        <div class="field"><label>Dia de vencimento</label><input type="number" name="dueDay" min="1" max="31" required value="${c.dueDay}" /></div>
        <div class="field"><label>Limite (R$)</label><input type="number" name="limit" step="0.01" min="0" value="${c.limit || ''}" /></div>
        <div class="field"><label>Cor do cartão</label><input type="color" name="brandColor" value="${c.brandColor || '#334155'}" style="height:40px;padding:4px" /></div>
        <div class="field"><label>Nome do titular</label><input type="text" name="holderMain" value="${esc(holdersOf(c)[0].name)}" placeholder="Titular" /></div>
        <div class="field"><label>Cartões adicionais</label><input type="text" name="holderAdds" value="${esc(holdersOf(c).slice(1).map((h) => h.name).join(', '))}" placeholder="Ex.: Adicional, Maria" /><span class="hint">Nomes ou apelidos separados por vírgula.</span></div>
      </div>${actions()}`, (f) => {
      const data = { name: f.get('name').trim(), brand: f.get('brand').trim(), closingDay: +f.get('closingDay'), dueDay: +f.get('dueDay'), limit: +f.get('limit') || 0, brandColor: f.get('brandColor') };
      // portadores: mantém os ids existentes pela ordem
      const old = holdersOf(c).slice(1);
      const names = String(f.get('holderAdds') || '').split(',').map((x) => x.trim()).filter(Boolean);
      const adds = names.map((n, i) => ({ id: old[i] ? old[i].id : (normTxt(n) === 'adicional' && !old.find((h) => h.id === 'adicional') ? 'adicional' : Core.uid()), name: n }));
      const removed = old.filter((h) => !adds.find((a) => a.id === h.id));
      if (!isNew && removed.length) {
        const n = S().transactions.filter((t) => t.account === c.id && removed.some((h) => h.id === t.holder)).length;
        if (n && !confirm(`${n} lançamento(s) de ${removed.map((h) => h.name).join(', ')} passarão para o titular. Continuar?`)) return false;
        S().transactions.forEach((t) => { if (t.account === c.id && removed.some((h) => h.id === t.holder)) t.holder = 'titular'; });
      }
      data.holders = [{ id: 'titular', name: String(f.get('holderMain') || '').trim() || 'Titular' }, ...adds];
      let newId = null;
      if (isNew) { newId = Core.uid(); S().cards.push({ id: newId, color: c.color, ...data }); ui.cardSel = newId; } else Object.assign(c, data);
      commit('Cartão salvo');
      if (newId && onCreated) onCreated(newId);
    });
  }

  function overrideForm() {
    const c = card(ui.cardSel), cm = ui.cardMonth || ui.month, key = c.id + '|' + cm;
    const inv = Core.invoice(c.id, cm);
    openModal(`
      <h2>Valor oficial da fatura</h2>
      <p class="desc">${esc(c.name)} · ${fmt.monthLong(cm)}. Use quando a fatura fechada tiver um total diferente da soma dos lançamentos (ex.: compras à vista não cadastradas). Deixe em branco para usar a soma (${fmt.money(inv.computed)}).</p>
      <div class="field"><label>Total da fatura (R$)</label><input type="number" step="0.01" name="v" value="${inv.override ?? ''}" /></div>
      ${actions()}`, (f) => {
      const v = f.get('v');
      if (v === '') delete S().invoiceOverrides[key]; else S().invoiceOverrides[key] = +v;
      commit('Fatura atualizada');
    });
  }

  // ======================================================
  // IMPORTAR (PDF e prints)
  // ======================================================
  const imp = { files: [], texts: [], sheets: [], header: {}, items: [], account: '', invoiceMonth: '', monthMode: 'invoice', useTotal: true, busy: false, progress: '' };

  function viewImportar() {
    const fileProto = location.protocol === 'file:';
    const hasItems = imp.items.length > 0 || imp.sheets.length > 0;
    return `
      ${fileProto ? `<div class="alert">${icon('alert')}<div><b>Abra o sistema pelo endereço do site</b> (GitHub Pages) ou por um servidor local para ler PDF e imagens — o Chrome bloqueia esse recurso em arquivos abertos direto do disco. Planilhas (XLSX/CSV) funcionam normalmente.</div></div>` : ''}
      <div class="panel">
        <div class="panel-head"><h2>Importar fatura, prints ou planilha</h2><span class="sub">PDF, capturas de tela do app do banco, Excel (XLSX) ou CSV</span><span class="spacer"></span><button class="btn btn-sm" type="button" id="impTpl">${icon('download')}Modelo de planilha</button></div>
        <label class="dropzone" id="drop">
          <input type="file" id="impFiles" accept="application/pdf,image/*,.xlsx,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" multiple hidden />
          <div class="dz-icon">${icon('upload')}</div>
          <div><b>Arraste os arquivos aqui</b> ou clique para escolher</div>
          <div class="muted">PDF de fatura (Bradescard, Itaú, Nubank…), prints (PNG/JPG) ou planilha (XLSX/CSV — extrato exportado do banco ou sua própria planilha). Vários de uma vez — repetidos são removidos.</div>
        </label>
        <div class="alert info mt" style="margin-bottom:0">${icon('lock')}<div>Os arquivos são lidos <b>somente no seu navegador</b> — nada é enviado para a internet. Dados como nome, CPF e endereço presentes no PDF são ignorados e não são gravados.</div></div>
        ${imp.busy ? `<div class="mt"><div class="cell-sub" id="impProg">${esc(imp.progress)}</div><div class="progress"><span id="impBar" style="width:5%"></span></div></div>` : ''}
      </div>
      ${hasItems ? reviewHTML() : ''}`;
  }

  /** Portador sugerido para um item importado (pelo print, seção do PDF ou coluna da planilha). */
  function importHolder(it) {
    if (it.holderSel) return it.holderSel;
    const c = card(imp.account); if (!c) return 'titular';
    const hs = holdersOf(c), firstAdd = (hs.find((x) => x.id !== 'titular') || { id: 'adicional' }).id;
    if (it.holderLabel) {
      const n = normTxt(it.holderLabel), h = hs.find((x) => normTxt(x.name) === n);
      if (h) return h.id;
      if (/adicional/.test(n)) return firstAdd;
      if (/titular/.test(n)) return 'titular';
      return 'new:' + it.holderLabel;
    }
    if (it.ref) return (c.refs && c.refs[it.ref]) || (it.ref === imp.firstRef ? 'titular' : firstAdd);
    if (it.holder === 'adicional') return firstAdd;
    return 'titular';
  }

  function firstMonthFor(it) {
    if (imp.account === 'conta') return (it.date || '').slice(0, 7) || imp.invoiceMonth;
    if (imp.monthMode === 'date' && it.date) return firstInvoiceMonth(imp.account, it.date);
    return ym.add(imp.invoiceMonth, -(it.n - 1));
  }
  /** Mesmo valor e (mesma compra pela data ±3 dias OU mesmo parcelamento na mesma fatura). */
  function sameTx(a, b) {
    if (a.account !== b.account || Math.abs(a.amount - b.amount) > 0.015) return false; // 1ª parcela pode variar 1 centavo
    if (a.date && b.date) return Math.abs(new Date(a.date) - new Date(b.date)) <= 3 * 86400000;
    return a.installments === b.installments && a.firstMonth === b.firstMonth;
  }
  function findExisting(it) {
    const cand = { account: imp.account, amount: it.amount, date: it.date, installments: it.of, firstMonth: firstMonthFor(it) };
    return S().transactions.find((t) => sameTx(t, cand) || (t.account === cand.account && Math.abs(t.amount - cand.amount) <= 0.015 && t.installments === cand.installments && t.firstMonth === cand.firstMonth));
  }
  function isDuplicate(it) { it.dupOf = findExisting(it) || null; return !!it.dupOf; }
  const aliasKey = (raw) => String(raw || '').toLowerCase().normalize('NFD').replace(/[^a-z0-9]/g, '');

  /** Grupos de lançamentos gravados que parecem repetidos. */
  function duplicateGroups() {
    const tx = S().transactions, ign = S().dupIgnore || {}, seen = new Set(), groups = [];
    tx.forEach((a, i) => {
      if (seen.has(a.id)) return;
      const g = [a];
      for (let j = i + 1; j < tx.length; j++) { const b = tx[j]; if (!seen.has(b.id) && sameTx(a, b) && !ign[[a.id, b.id].sort().join('|')]) g.push(b); }
      if (g.length > 1) { g.forEach((x) => seen.add(x.id)); groups.push(g); }
    });
    return groups;
  }

  function reviewHTML() {
    const sel = imp.items.filter((i) => i.on);
    const sum = sel.reduce((a, i) => a + i.amount, 0);
    const dups = imp.items.filter((i) => i.dup).length;
    return `
      <div class="panel mt">
        <div class="panel-head"><h2>Conferência</h2><span class="sub">${imp.items.length} lançamentos encontrados — revise antes de importar</span></div>
        <div class="form-grid" style="grid-template-columns:repeat(3,minmax(0,1fr))">
          <div class="field"><label>Cartão / conta</label><select id="impAcc"><option value="">— escolha —</option>${accountOptions(imp.account)}<option value="__new">+ Cadastrar novo cartão…</option></select></div>
          <div class="field"><label>Fatura (mês de vencimento)</label><input type="month" id="impMonth" value="${imp.invoiceMonth}" />
            ${imp.account && imp.account !== 'conta' ? `<select id="impMode" style="margin-top:6px"><option value="invoice" ${imp.monthMode === 'invoice' ? 'selected' : ''}>Todos os lançamentos nesta fatura</option><option value="date" ${imp.monthMode === 'date' ? 'selected' : ''}>Calcular a fatura pela data de cada compra</option></select>` : ''}
            <span class="hint">Usado para calcular parcelas e o ano das datas. Alterar refaz a leitura.</span></div>
          <div class="field">${imp.header.total ? `<label>Total detectado na fatura</label><div class="kpi-value" style="font-size:20px;margin:0">${fmt.money(imp.header.total)}</div>
            <label class="check"><input type="checkbox" id="impUseTotal" ${imp.useTotal ? 'checked' : ''}/> Registrar como valor oficial da fatura</label>` : ''}</div>
        </div>
        ${imp.header.open ? `<div class="alert info mt" style="margin-bottom:0">${icon('info')}<div><b>Extrato em aberto:</b> a fatura ainda não fechou. O total mostrado é parcial e não foi marcado como valor oficial; as parcelas que o banco ainda vai lançar continuam vindo das compras já cadastradas. Fatura sugerida pelo dia de fechamento do cartão — confira.</div></div>` : ''}
        ${imp.fromPrints ? `<div class="alert mt" style="margin-bottom:0">${icon('alert')}<div>
          <b>Prints não mostram qual mês está selecionado no app.</b> Ajuste o campo “Fatura” para o mês da aba destacada no app do banco (ex.: “Jan 27”) — ele define as parcelas e evita lançamentos duplicados. Itens cortados no topo/rodapé do print podem vir sem data ou sem o nº de parcelas: confira.
          <label class="check" style="margin-top:8px;display:flex"><input type="checkbox" id="impMonthOk" ${imp.monthOk ? 'checked' : ''}/> Confirmo que estes prints são da fatura de <b>&nbsp;${fmt.monthLong(imp.invoiceMonth)}</b></label></div></div>` : ''}
        ${imp.sheets.map(sheetMapHTML).join('')}
        ${dups ? `<div class="alert mt" style="margin-bottom:0">${icon('info')}<div><b>${dups} lançamento(s) já existem</b> neste cartão com o mesmo valor e parcelas — vieram desmarcados.</div></div>` : ''}
        <div class="table-wrap mt"><table class="review">
          <thead><tr><th><input type="checkbox" id="impAll" ${sel.length === imp.items.length ? 'checked' : ''} aria-label="Selecionar todos"/></th><th>Data</th><th>Descrição</th><th>Categoria</th>${card(imp.account) ? '<th>Portador</th>' : ''}<th>Parcela</th><th class="r">Valor da parcela</th><th>Situação</th></tr></thead>
          <tbody>${imp.items.map((it, i) => `<tr class="${it.on ? '' : 'off'}">
            <td><input type="checkbox" data-i="${i}" data-f="on" ${it.on ? 'checked' : ''} aria-label="Importar"/></td>
            <td><input type="date" data-i="${i}" data-f="date" value="${it.date}" /></td>
            <td><input type="text" data-i="${i}" data-f="desc" value="${esc(it.desc)}" /></td>
            <td><select data-i="${i}" data-f="category">${catOptions(it.category)}</select></td>
            ${card(imp.account) ? `<td><select data-i="${i}" data-f="holderSel">${(() => { const h = importHolder(it); return holderOptions(card(imp.account), h, h.startsWith('new:') ? [{ id: h, name: h.slice(4) + ' (novo)' }] : []); })()}</select></td>` : ''}
            <td><div class="parc"><input type="number" min="1" max="72" data-i="${i}" data-f="n" value="${it.n}" /><span>de</span><input type="number" min="1" max="72" data-i="${i}" data-f="of" value="${it.of}" /></div></td>
            <td class="r"><input type="number" step="0.01" data-i="${i}" data-f="amount" value="${it.amount}" class="r" /></td>
            <td>${it.dup ? `<span class="badge warn" title="${esc((it.dupOf ? it.dupOf.desc + ' · ' + fmt.date(it.dupOf.date) + ' · ' + it.dupOf.installments + 'x' : ''))}">já existe${it.dupOf ? ': ' + esc(it.dupOf.desc.slice(0, 22)) : ''}</span>` : it.income ? '<span class="badge" title="Entradas não são gastos — a renda é informada em Configurações">entrada</span>' : '<span class="badge good">novo</span>'}</td>
          </tr>`).join('')}</tbody>
        </table></div>
        <div class="toolbar mt" style="margin-bottom:0">
          <span><b>${sel.length}</b> selecionados · ${fmt.money(sum)}${imp.header.total ? ` <span class="muted">(fatura: ${fmt.money(imp.header.total)})</span>` : ''}</span>
          <span style="flex:1"></span>
          ${imp.texts.length ? '' : '<!--'}<details class="raw"><summary>Ver texto lido</summary><pre>${esc(imp.texts.join('\n\n———\n\n')).slice(0, 20000)}</pre></details>${imp.texts.length ? '' : '-->'}
          <button class="btn" id="impCancel">Descartar</button>
          <button class="btn btn-primary" id="impGo" ${sel.length && imp.account && (!imp.fromPrints || imp.monthOk) ? '' : 'disabled'} title="${imp.fromPrints && !imp.monthOk ? 'Confirme o mês da fatura dos prints' : ''}">${icon('check')}Importar ${sel.length} lançamentos</button>
        </div>
      </div>`;
  }

  function sheetMapHTML(sh, k) {
    const rows = sh.sheets[sh.sel].rows, m = sh.map;
    const cols = Parsers.sheetColumns(rows, m);
    const sel = (field, label, optional) => `<div class="field"><label>${label}</label><select data-sh="${k}" data-map="${field}">
      ${optional ? '<option value="-1">— nenhuma —</option>' : ''}${cols.map((c) => `<option value="${c.i}" ${m[field] === c.i ? 'selected' : ''}>${esc(c.label)}</option>`).join('')}</select></div>`;
    const prev = rows.slice(m.headerRow + 1, m.headerRow + 4);
    return `<div class="sheet-map mt">
      <div class="panel-head" style="margin-bottom:10px">${icon('list')}<h3>${esc(sh.file)}</h3>
        ${sh.sheets.length > 1 ? `<select data-sh="${k}" data-sheet style="width:auto">${sh.sheets.map((x, i) => `<option value="${i}" ${i === sh.sel ? 'selected' : ''}>Aba: ${esc(x.name)}</option>`).join('')}</select>` : ''}
        <span class="sub">${m.headerRow >= 0 ? 'cabeçalho na linha ' + (m.headerRow + 1) : 'sem cabeçalho'} · confira as colunas</span></div>
      <div class="map-grid">
        ${sel('date', 'Data', true)}${sel('desc', 'Descrição', true)}${sel('amount', 'Valor', false)}${sel('parcela', 'Parcela (ex.: 2/10)', true)}${sel('category', 'Categoria', true)}${sel('holder', 'Portador', true)}
        <div class="field"><label>Os gastos aparecem como</label><select data-sh="${k}" data-neg><option value="0" ${sh.neg ? '' : 'selected'}>Valores positivos</option><option value="1" ${sh.neg ? 'selected' : ''}>Valores negativos</option></select></div>
      </div>
      ${prev.length ? `<div class="cell-sub" style="margin-top:8px">Primeiras linhas: ${prev.map((r) => esc((r || []).filter((c) => c != null && c !== '').map((c) => c instanceof Date ? c.toISOString().slice(0, 10) : String(c)).join(' · ').slice(0, 120))).join(' &nbsp;|&nbsp; ')}</div>` : ''}
    </div>`;
  }

  /** Converte o rótulo de categoria da planilha na categoria do sistema. */
  function catFromLabel(label, desc, amount) {
    const n = (x) => (x || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
    const l = n(label);
    if (l) {
      const hit = Object.entries(CATS).find(([k, v]) => n(v.name) === l || k === l || n(v.name).startsWith(l) || l.startsWith(n(v.name).split(' ')[0]));
      if (hit) return hit[0];
    }
    return Parsers.guessCategory(desc, amount);
  }

  function reparse() {
    const all = [];
    let header = {};
    imp.texts.forEach((t) => {
      const r = Parsers.parseText(t, imp.invoiceMonth);
      if (r.total && !header.total) header.total = r.total;
      if (r.detectedMonth && !header.invoiceMonth) header.invoiceMonth = r.detectedMonth; // só o vencimento lido do arquivo
      if (r.open) header.open = true;
      all.push(...r.items);
    });
    const textItems = Parsers.dedupe(all.splice(0)); // prints que se sobrepõem
    all.push(...textItems);
    imp.sheets.forEach((sh) => {
      const rows = sh.sheets[sh.sel].rows;
      const due = Parsers.detectSheetInvoice(rows);
      if (due && !header.invoiceMonth) header.invoiceMonth = due;
      all.push(...Parsers.sheetToItems(rows, sh.map, { invoiceMonth: imp.invoiceMonth || due, negativeIsExpense: sh.neg }));
    });
    imp.header = header;
    imp.firstRef = (all.find((x) => x.ref) || {}).ref || '';
    if (!imp.invoiceMonth) {
      imp.invoiceMonth = header.invoiceMonth || ui.month;
      if (!header.invoiceMonth) return reparse(); // refaz com o mês para acertar os anos
    }
    const aliases = S().aliases || {};
    imp.items = all.map((it) => {
      const al = aliases[aliasKey(it.raw)];
      const desc = al ? al.desc : it.desc;
      return { ...it, desc, auto: desc, category: al && al.category ? al.category : catFromLabel(it.catLabel, desc, it.amount), on: true };
    });
    markDups();
  }
  function markDups() {
    imp.items.forEach((it) => {
      it.dup = !!imp.account && isDuplicate(it);
      it.income = imp.account === 'conta' && it.amount < 0; // entrada (salário, Pix recebido) não é gasto
      if (it.dup || it.income) it.on = false;
    });
  }

  async function handleFiles(files) {
    if (!files.length) return;
    imp.busy = true; imp.fromPrints = false; imp.monthOk = false; imp.texts = []; imp.sheets = []; imp.items = []; imp.header = {}; imp.invoiceMonth = ''; imp.monthMode = 'invoice'; imp.files = files.map((f) => f.name);
    const setProg = (msg, frac) => { imp.progress = msg; const p = $('#impProg'), b = $('#impBar'); if (p) p.textContent = msg; if (b && frac != null) b.style.width = Math.max(5, frac * 100) + '%'; };
    render();
    try {
      for (let i = 0; i < files.length; i++) {
        const f = files[i], label = `(${i + 1}/${files.length}) ${f.name}`;
        if (/\.(xlsx|xls|csv)$/i.test(f.name) || /spreadsheet|csv|excel/.test(f.type)) {
          setProg('Lendo planilha ' + label, i / files.length);
          const sheets = await Importer.readSpreadsheet(f);
          // escolhe a aba com mais linhas de valor reconhecidas
          let bestI = 0, bestN = -1;
          sheets.forEach((sh, si) => { const mp = Parsers.detectSheetMapping(sh.rows); const n = Parsers.sheetToItems(sh.rows, mp, {}).length; if (n > bestN) { bestN = n; bestI = si; } });
          const map = Parsers.detectSheetMapping(sheets[bestI].rows);
          imp.sheets.push({ file: f.name, sheets, sel: bestI, map, neg: Parsers.negativesAreExpenses(sheets[bestI].rows, map) });
        } else if (f.type === 'application/pdf' || /\.pdf$/i.test(f.name)) {
          setProg('Lendo PDF ' + label, i / files.length);
          imp.texts.push(await Importer.pdfToText(f, askPdfPassword));
        } else if (f.type.startsWith('image/')) {
          imp.fromPrints = true;
          setProg('Reconhecendo texto do print ' + label + ' — pode levar alguns segundos', i / files.length);
          imp.texts.push(await Importer.imageToText(f, (p) => setProg(`Reconhecendo texto ${label}: ${Math.round(p * 100)}%`, (i + p) / files.length)));
        }
      }
      await Importer.releaseOcr();
      const sheetText = imp.sheets.map((sh) => sh.sheets[sh.sel].rows.slice(0, 12).map((r) => (r || []).join(' ')).join('\n')).join('\n');
      imp.account = Importer.detectCard([...imp.texts, sheetText, ...imp.files].join('\n'), S().cards) || '';
      reparse();
      imp.useTotal = !imp.header.open; // total de extrato em aberto é parcial
      if (imp.header.open && !imp.header.invoiceMonth && card(imp.account)) {
        imp.invoiceMonth = firstInvoiceMonth(imp.account, new Date().toISOString().slice(0, 10)); // fatura que ainda vai fechar
        reparse();
      }
      // planilha com compras de vários meses: calcula a fatura pela data de cada compra
      if (imp.sheets.length && !imp.texts.length) {
        const ds = imp.items.map((i) => i.date).filter(Boolean).sort();
        const hasParcelInfo = imp.items.some((i) => i.n > 1);
        if (ds.length && !imp.header.invoiceMonth && !hasParcelInfo && ym.diff(ds[0].slice(0, 7), ds[ds.length - 1].slice(0, 7)) >= 1) { imp.monthMode = 'date'; markDups(); }
      }
      imp.busy = false;
      render();
      toast(imp.items.length ? `${imp.items.length} lançamentos encontrados` : 'Nenhum lançamento reconhecido');
      if (!imp.items.length && !imp.sheets.length) alert('Não encontrei lançamentos nesses arquivos. Confira em "Ver texto lido" se o texto foi reconhecido; prints nítidos e sem cortes funcionam melhor.');
    } catch (e) {
      imp.busy = false; render();
      alert('Não foi possível ler os arquivos: ' + (e && e.message ? e.message : e));
    }
  }

  function askPdfPassword(name, wrong) {
    return new Promise((resolve) => {
      let answered = false;
      openModal(`<h2>PDF protegido por senha</h2>
        <p class="desc">${wrong ? '<b class="neg">Senha incorreta.</b> ' : ''}O arquivo “${esc(name)}” tem senha (muitos bancos usam parte do CPF). A senha é usada só para abrir o arquivo aqui no navegador e não é guardada.</p>
        <div class="field"><label>Senha do PDF</label><input type="password" name="pw" autocomplete="off" required /></div>${actions('Abrir')}`,
        (f) => { answered = true; resolve(f.get('pw')); });
      $('#modal').addEventListener('close', () => { if (!answered) resolve(null); }, { once: true });
    });
  }

  function afterImportar() {
    const input = $('#impFiles'), drop = $('#drop');
    input.addEventListener('change', () => handleFiles([...input.files]));
    ['dragover', 'dragenter'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('over'); }));
    ['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, () => drop.classList.remove('over')));
    drop.addEventListener('drop', (e) => { e.preventDefault(); handleFiles([...e.dataTransfer.files]); });
    $('#impTpl').addEventListener('click', (e) => { e.preventDefault(); Importer.downloadTemplate(); });
    if (!imp.items.length && !imp.sheets.length) return;
    $$('[data-map]').forEach((sl) => sl.addEventListener('change', () => { const sh = imp.sheets[+sl.dataset.sh]; sh.map[sl.dataset.map] = +sl.value; reparse(); render(); }));
    $$('[data-neg]').forEach((sl) => sl.addEventListener('change', () => { imp.sheets[+sl.dataset.sh].neg = sl.value === '1'; reparse(); render(); }));
    $$('[data-sheet]').forEach((sl) => sl.addEventListener('change', () => {
      const sh = imp.sheets[+sl.dataset.sh]; sh.sel = +sl.value; sh.map = Parsers.detectSheetMapping(sh.sheets[sh.sel].rows); sh.neg = Parsers.negativesAreExpenses(sh.sheets[sh.sel].rows, sh.map); reparse(); render();
    }));
    const mok = $('#impMonthOk'); if (mok) mok.addEventListener('change', () => { imp.monthOk = mok.checked; render(); });
    const mode = $('#impMode'); if (mode) mode.addEventListener('change', () => { imp.monthMode = mode.value; imp.items.forEach((it) => { it.on = true; }); markDups(); render(); });

    $('#impAcc').addEventListener('change', (e) => {
      if (e.target.value === '__new') { e.target.value = imp.account; cardForm(null, (id) => { imp.account = id; markDups(); render(); }); return; }
      imp.account = e.target.value; imp.items.forEach((it) => { if (!it.dup) it.on = true; }); markDups(); render();
    });
    $('#impMonth').addEventListener('change', (e) => { if (!e.target.value) return; imp.invoiceMonth = e.target.value; imp.monthOk = false; reparse(); render(); });
    const ut = $('#impUseTotal'); if (ut) ut.addEventListener('change', () => { imp.useTotal = ut.checked; });
    $('#impAll').addEventListener('change', (e) => { imp.items.forEach((it) => (it.on = e.target.checked)); render(); });
    $$('.review [data-i]').forEach((inp) => inp.addEventListener('change', () => {
      const it = imp.items[+inp.dataset.i], f = inp.dataset.f;
      if (f === 'on') it.on = inp.checked;
      else if (['n', 'of', 'amount'].includes(f)) it[f] = +inp.value;
      else it[f] = inp.value;
      if (f === 'n' || f === 'of' || f === 'amount') { it.dup = !!imp.account && isDuplicate(it); }
      render();
    }));
    $('#impCancel').addEventListener('click', () => { imp.items = []; imp.texts = []; imp.sheets = []; render(); });
    $('#impGo').addEventListener('click', () => {
      const sel = imp.items.filter((i) => i.on);
      // lembra nomes e categorias corrigidos para as próximas importações
      S().aliases = S().aliases || {};
      imp.items.forEach((it) => {
        const k = aliasKey(it.raw);
        if (k && (it.desc.trim() !== it.auto || (S().aliases[k] && S().aliases[k].category !== it.category))) S().aliases[k] = { desc: it.desc.trim(), category: it.category };
      });
      const c = card(imp.account), newIds = {};
      const holderFor = (it) => {
        if (!c) return undefined;
        let h = importHolder(it);
        if (h === 'adicional') ensureHolder(c, 'adicional', 'Adicional');
        if (h.startsWith('new:')) { const name = h.slice(4); h = newIds[name] || (newIds[name] = ensureHolder(c, Core.uid(), name)); }
        if (it.ref) { c.refs = c.refs || {}; c.refs[it.ref] = h; } // lembra qual final é de quem
        return h;
      };
      sel.forEach((it) => S().transactions.push({
        id: Core.uid(), account: imp.account, holder: holderFor(it), date: it.date, desc: it.desc.trim(), category: it.category,
        amount: Math.round(it.amount * 100) / 100, installments: Math.max(1, it.of), firstMonth: firstMonthFor(it), note: ''
      }));
      if (imp.useTotal && imp.header.total && imp.account !== 'conta' && imp.monthMode === 'invoice') S().invoiceOverrides[imp.account + '|' + imp.invoiceMonth] = imp.header.total;
      const n = sel.length, acc = imp.account, mm = imp.invoiceMonth;
      imp.items = []; imp.texts = []; imp.sheets = [];
      commit(`${n} lançamentos importados`);
      if (acc !== 'conta') { ui.cardSel = acc; ui.cardMonth = mm; location.hash = '#/cartoes'; }
    });
  }

  // ======================================================
  // PASTA DE DADOS (OneDrive / Google Drive / Dropbox)
  // ======================================================
  const sync = { lastModified: 0, savedAt: null, saving: false, error: '' };
  const hasData = (s) => s && ((s.transactions || []).length || (s.cards || []).length);

  function folderStatusHTML() {
    if (!Store.supported) return `${icon('lock')}<span>Dados só neste navegador. Use Chrome ou Edge para salvar numa pasta.</span>`;
    if (Store.status === 'connected') return `${icon('check')}<span>Salvo na pasta <b>${esc(Store.folderName)}</b>${sync.savedAt ? ' às ' + sync.savedAt : ''}</span>`;
    if (Store.status === 'needs-permission') return `${icon('alert')}<span>Pasta <b>${esc(Store.folderName)}</b> desconectada. <a href="#/config">Reconectar</a></span>`;
    return `${icon('lock')}<span>Dados só neste navegador. <a href="#/config">Salvar numa pasta</a></span>`;
  }
  function updateFolderStatus() { const el = $('#folderStatus'); if (el) { el.innerHTML = folderStatusHTML(); el.classList.toggle('warn', Store.status === 'needs-permission'); } }

  let writeTimer;
  function scheduleWrite() {
    if (Store.status !== 'connected') return;
    clearTimeout(writeTimer);
    writeTimer = setTimeout(async () => {
      try {
        await Store.write(S());
        sync.lastModified = await Store.lastModified();
        sync.savedAt = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      } catch (e) { toast('Não foi possível salvar na pasta: ' + e.message); }
      updateFolderStatus();
    }, 500);
  }

  /** Compara navegador × pasta e decide o que fazer. `interactive` permite perguntar ao usuário. */
  async function syncWithFolder(interactive) {
    const file = await Store.read();
    if (!file) { await Store.write(S()); sync.lastModified = await Store.lastModified(); updateFolderStatus(); return 'written'; }
    sync.lastModified = file.lastModified;
    const remote = file.data, local = S();
    if (!hasData(local) || (remote.updatedAt || '') > (local.updatedAt || '') && !interactive) {
      Core.replace(remote, { fromFolder: true }); applyTheme(); initMonth(); render(); updateFolderStatus(); return 'loaded';
    }
    if (!interactive) { if ((local.updatedAt || '') > (remote.updatedAt || '')) scheduleWrite(); updateFolderStatus(); return 'kept'; }
    return new Promise((resolve) => {
      const when = (iso) => iso ? new Date(iso).toLocaleString('pt-BR') : 'data desconhecida';
      openModal(`<h2>Já existem dados nesta pasta</h2>
        <p class="desc">Encontrei o arquivo <b>${Store.FILE}</b> (${(remote.transactions || []).length} lançamentos, atualizado em ${when(remote.updatedAt)}).
        Este navegador tem ${(local.transactions || []).length} lançamentos (atualizado em ${when(local.updatedAt)}).</p>
        <div class="modal-actions" style="justify-content:space-between">
          <button class="btn" type="button" id="useLocal">Gravar os dados deste navegador na pasta</button>
          <button class="btn btn-primary" type="submit">Usar os dados da pasta</button>
        </div>`, () => { Core.replace(remote, { fromFolder: true }); applyTheme(); initMonth(); render(); updateFolderStatus(); resolve('loaded'); toast('Dados carregados da pasta'); });
      $('#useLocal').addEventListener('click', async () => { $('#modal').close(); await Store.write(S()); sync.lastModified = await Store.lastModified(); updateFolderStatus(); resolve('written'); toast('Dados gravados na pasta'); });
    });
  }

  async function checkFolderChanged() {
    if (Store.status !== 'connected' || $('#modal').open) return;
    const lm = await Store.lastModified();
    if (lm && lm > sync.lastModified + 1000) {
      const file = await Store.read();
      sync.lastModified = file ? file.lastModified : lm;
      if (file && (file.data.updatedAt || '') > (S().updatedAt || '')) {
        Core.replace(file.data, { fromFolder: true }); render(); toast('Dados atualizados a partir da pasta');
      }
    }
  }

  function folderPanelHTML() {
    const st = Store.status;
    return `
      <div class="panel mt">
        <div class="panel-head"><h2>Pasta de dados</h2><span class="sub">OneDrive, Google Drive ou Dropbox</span></div>
        ${!Store.supported ? `<div class="alert">${icon('alert')}<div>Este navegador não permite salvar em pasta. Use <b>Google Chrome</b> ou <b>Microsoft Edge</b> no computador — ou use Exportar/Importar backup abaixo.</div></div>` : `
        <p class="muted" style="margin-top:0">Escolha uma pasta dentro do <b>OneDrive</b>, <b>Google Drive</b> ou <b>Dropbox</b> no seu computador (ex.: <code>OneDrive\\Finanças</code>). O sistema grava o arquivo <code>${Store.FILE}</code> a cada alteração e guarda uma cópia diária em <code>backups/</code>. Em outro computador, aponte para a mesma pasta sincronizada.</p>
        <div class="toolbar" style="margin-bottom:0">
          <span class="badge ${st === 'connected' ? 'good' : st === 'needs-permission' ? 'warn' : ''}">${st === 'connected' ? 'Conectada: ' + esc(Store.folderName) : st === 'needs-permission' ? 'Aguardando permissão: ' + esc(Store.folderName) : 'Nenhuma pasta conectada'}</span>
          ${st === 'needs-permission' ? `<button class="btn btn-primary" id="fReconnect">${icon('check')}Reconectar</button>` : ''}
          <button class="btn ${st === 'none' ? 'btn-primary' : ''}" id="fChoose">${icon('upload')}${st === 'none' ? 'Escolher pasta' : 'Trocar pasta'}</button>
          ${st === 'connected' ? `<button class="btn" id="fSync">Sincronizar agora</button>` : ''}
          ${st !== 'none' ? `<button class="btn btn-ghost btn-danger" id="fDisc">Desconectar</button>` : ''}
        </div>`}
      </div>`;
  }
  function afterFolderPanel() {
    const on = (id, fn) => { const b = $(id); if (b) b.addEventListener('click', fn); };
    on('#fChoose', async () => {
      try { await Store.choose(); await syncWithFolder(true); render(); toast('Pasta conectada'); }
      catch (e) { if (e.name !== 'AbortError') alert('Não foi possível usar a pasta: ' + e.message); }
    });
    on('#fReconnect', async () => { if (await Store.reconnect()) { await syncWithFolder(false); render(); toast('Pasta reconectada'); } });
    on('#fSync', async () => { await syncWithFolder(true); render(); });
    on('#fDisc', async () => { if (confirm('Desconectar a pasta? Os dados continuam neste navegador e no arquivo da pasta.')) { await Store.disconnect(); render(); updateFolderStatus(); } });
  }

  // ======================================================
  // EXCLUIR LANÇAMENTOS DO MÊS
  // ======================================================
  /** Lançamentos atingidos: 'charge' = com cobrança na fatura/mês; 'purchase' = compra feita no mês. */
  function bulkTargets(month, account, mode) {
    return S().transactions.filter((t) => {
      if (account !== 'all' && t.account !== account) return false;
      if (mode === 'purchase') return (t.date || '').slice(0, 7) === month;
      return !!Core.installmentIn(t, month);
    });
  }

  function bulkDeleteForm(preset = {}) {
    const month = preset.month || ui.month;
    const form = openModal(`
      <h2>Excluir lançamentos do mês</h2>
      <p class="desc">Use para apagar uma fatura ou um mês e carregar de novo. Você poderá desfazer logo em seguida.</p>
      <div class="form-grid">
        <div class="field"><label>Mês</label><input type="month" name="month" value="${month}" required /></div>
        <div class="field"><label>Cartão / conta</label><select name="account"><option value="all">Todos os cartões e contas</option>${accountOptions(preset.account || '')}</select></div>
        <div class="field full"><label>O que excluir</label>
          <label class="check"><input type="radio" name="mode" value="charge" checked /> Tudo que é cobrado neste mês (fatura com vencimento neste mês)</label>
          <label class="check"><input type="radio" name="mode" value="purchase" /> Só as compras feitas neste mês (pela data da compra)</label>
        </div>
        <div class="field full"><label class="check"><input type="checkbox" name="extras" checked /> Também limpar o valor oficial e a marcação de “paga” da fatura</label></div>
      </div>
      <div class="bulk-preview" id="bulkPrev"></div>
      <div class="modal-actions"><button class="btn btn-ghost" value="cancel" formnovalidate>Cancelar</button><button class="btn btn-primary btn-danger-solid" type="submit" id="bulkGo">Excluir</button></div>`,
    (f) => {
      const m = f.get('month'), acc = f.get('account'), mode = f.get('mode');
      const list = bulkTargets(m, acc, mode);
      if (!list.length) return false;
      const ids = new Set(list.map((t) => t.id));
      const snapshot = { tx: list.map((t) => ({ ...t })), overrides: {}, paid: {} };
      S().transactions = S().transactions.filter((t) => !ids.has(t.id));
      if (f.get('extras')) {
        const cards = acc === 'all' ? S().cards.map((c) => c.id) : [acc];
        cards.forEach((c) => {
          const k = c + '|' + m;
          if (k in S().invoiceOverrides) { snapshot.overrides[k] = S().invoiceOverrides[k]; delete S().invoiceOverrides[k]; }
          if (k in S().invoicePaid) { snapshot.paid[k] = S().invoicePaid[k]; delete S().invoicePaid[k]; }
        });
      }
      Core.save(); render();
      toast(`${list.length} lançamentos excluídos`, { label: 'Desfazer', run: () => {
        S().transactions.push(...snapshot.tx);
        Object.assign(S().invoiceOverrides, snapshot.overrides); Object.assign(S().invoicePaid, snapshot.paid);
        commit('Exclusão desfeita');
      } });
    });
    const upd = () => {
      const m = form.month.value, acc = form.account.value, mode = form.mode.value;
      const list = m ? bulkTargets(m, acc, mode) : [];
      const multi = list.filter((t) => t.installments > 1);
      const total = list.reduce((a, t) => a + (mode === 'charge' ? t.amount : t.amount * t.installments), 0);
      $('#bulkPrev', form).innerHTML = !list.length ? `<div class="empty">Nenhum lançamento encontrado para ${m ? fmt.monthLong(m) : 'este mês'}.</div>` : `
        <div class="alert" style="margin:16px 0 0">${icon('alert')}<div>
          <b>${list.length} lançamentos</b> serão excluídos (${mode === 'charge' ? 'cobrança no mês' : 'valor das compras'}: <b>${fmt.money(total)}</b>).
          ${multi.length ? `<br>${multi.length} são parcelados e serão excluídos <b>por inteiro</b> (todas as parcelas) — ao reimportar a fatura, eles voltam com as parcelas corretas.` : ''}
          <div class="cell-sub" style="margin-top:6px">${list.slice(0, 8).map((t) => esc(t.desc)).join(', ')}${list.length > 8 ? ` e mais ${list.length - 8}…` : ''}</div></div></div>`;
      const go = $('#bulkGo', form); go.disabled = !list.length; go.textContent = list.length ? `Excluir ${list.length} lançamentos` : 'Excluir';
    };
    form.onchange = upd; form.oninput = upd; upd(); // limpos ao abrir outro modal
  }

  // ======================================================
  // ROTEAMENTO / RENDER
  // ======================================================
  const ROUTES = {
    dashboard: { title: 'Visão geral', view: viewDashboard, after: afterDashboard },
    futuro: { title: 'Visão futura', view: viewFuturo, after: afterFuturo },
    cartoes: { title: 'Cartões e faturas', view: viewCartoes, after: afterCartoes },
    parcelas: { title: 'Parcelamentos', view: viewParcelas, after: afterParcelas },
    fixas: { title: 'Despesas fixas', view: viewFixas, after: afterFixas },
    lancamentos: { title: 'Lançamentos', view: viewLancamentos, after: afterLancamentos },
    importar: { title: 'Importar faturas', view: viewImportar, after: afterImportar },
    config: { title: 'Configurações', view: viewConfig, after: afterConfig }
  };
  const routeName = () => (location.hash.replace(/^#\/?/, '').split('/')[0] || 'dashboard');

  function render() {
    const name = ROUTES[routeName()] ? routeName() : 'dashboard';
    const r = ROUTES[name];
    $('#pageTitle').textContent = r.title;
    $('#monthLabel').textContent = cap(fmt.monthLong(ui.month));
    $$('#nav a').forEach((a) => a.classList.toggle('active', a.dataset.route === name));
    const view = $('#view');
    view.innerHTML = r.view();
    hydrateIcons(view);
    r.after();
    $$('[data-act]', view).forEach((b) => b.addEventListener('click', () => ACT[b.dataset.act]()));
    updateFolderStatus();
  }
  const ACT = {
    'card-new': () => cardForm(), 'card-edit': () => cardForm(card(ui.cardSel)), 'inv-override': () => overrideForm(),
    'tx-new': () => txForm(), 'tx-new-card': () => txForm(null, { account: ui.cardSel }), 'bulk-del-card': () => bulkDeleteForm({ account: ui.cardSel, month: ui.cardMonth || ui.month }), 'fix-new': () => fixedForm(), 'extra-new': () => extraForm()
  };

  function applyTheme() {
    const t = S().settings.theme;
    const dark = t === 'dark' || (t === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.dataset.mode = dark ? 'dark' : 'light';
    $('#themeBtn').innerHTML = icon(dark ? 'sun' : 'moon');
  }

  async function init() {
    Core.load();
    Core.onSave(scheduleWrite);
    initMonth();
    hydrateIcons();
    applyTheme();
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { applyTheme(); render(); });
    $('#themeBtn').addEventListener('click', () => {
      S().settings.theme = document.documentElement.dataset.mode === 'dark' ? 'light' : 'dark';
      Core.save(); applyTheme(); render();
    });
    $$('#monthPicker [data-step]').forEach((b) => b.addEventListener('click', () => { ui.month = ym.add(ui.month, +b.dataset.step); ui.cardMonth = null; render(); }));
    $('#quickAdd').addEventListener('click', () => txForm());
    $('#bulkDel').addEventListener('click', () => bulkDeleteForm());
    $('#menuBtn').addEventListener('click', () => $('#sidebar').classList.toggle('open'));
    $('#nav').addEventListener('click', () => $('#sidebar').classList.remove('open'));
    window.addEventListener('hashchange', () => { render(); $('#view').focus({ preventScroll: true }); window.scrollTo(0, 0); });
    let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(render, 150); });
    render();
    await Store.init();
    updateFolderStatus();
    if (Store.status === 'connected') { try { await syncWithFolder(false); } catch (e) { toast('Erro ao ler a pasta: ' + e.message); } }
    window.addEventListener('focus', () => checkFolderChanged().catch(() => {}));
    document.addEventListener('visibilitychange', () => { if (!document.hidden) checkFolderChanged().catch(() => {}); });
  }
  document.addEventListener('DOMContentLoaded', init);
})();
