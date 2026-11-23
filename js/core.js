/* Núcleo: persistência (localStorage), datas, formatação e cálculos. */
(function () {
  const KEY = 'controle-despesas:v1';

  // ---------- Formatação ----------
  const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const MONTHS_LONG = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

  const fmt = {
    money: (v) => brl.format(Math.round((v || 0) * 100) / 100),
    moneyShort: (v) => {
      const a = Math.abs(v);
      if (a >= 1000) return 'R$ ' + (v / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' mil';
      return 'R$ ' + Math.round(v).toLocaleString('pt-BR');
    },
    month: (ym) => { const [y, m] = ym.split('-'); return MONTHS[+m - 1] + '/' + y.slice(2); },
    monthLong: (ym) => { const [y, m] = ym.split('-'); return MONTHS_LONG[+m - 1] + ' de ' + y; },
    date: (iso) => { if (!iso) return ''; const [y, m, d] = iso.split('-'); return d + '/' + m + '/' + y; },
    pct: (v) => (v * 100).toLocaleString('pt-BR', { maximumFractionDigits: 0 }) + '%'
  };

  // ---------- Datas (mês = "AAAA-MM") ----------
  const ym = {
    of: (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'),
    add: (s, n) => { const [y, m] = s.split('-').map(Number); const d = new Date(y, m - 1 + n, 1); return ym.of(d); },
    diff: (a, b) => { const [ya, ma] = a.split('-').map(Number); const [yb, mb] = b.split('-').map(Number); return (yb - ya) * 12 + (mb - ma); },
    today: () => ym.of(new Date()),
    range: (start, n) => Array.from({ length: n }, (_, i) => ym.add(start, i))
  };

  // ---------- Persistência ----------
  const clone = (o) => JSON.parse(JSON.stringify(o));
  let state;

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      state = raw ? JSON.parse(raw) : clone(window.SEED);
    } catch (e) { state = clone(window.SEED); }
    // garante chaves novas
    const seed = window.SEED;
    for (const k of Object.keys(seed)) if (state[k] === undefined) state[k] = clone(seed[k]);
    for (const k of Object.keys(seed.settings)) if (state.settings[k] === undefined) state.settings[k] = seed.settings[k];
    return state;
  }
  const listeners = [];
  /** Salva no navegador e avisa os ouvintes (ex.: gravação na pasta de dados). */
  function save(opts = {}) {
    if (!opts.keepTimestamp) state.updatedAt = new Date().toISOString();
    localStorage.setItem(KEY, JSON.stringify(state));
    if (!opts.silent) listeners.forEach((fn) => fn(state));
  }
  function onSave(fn) { listeners.push(fn); }
  function reset() { state = clone(window.SEED); save(); }
  /** Substitui todos os dados. `fromFolder` evita regravar o que acabou de ser lido da pasta. */
  function replace(obj, opts = {}) {
    localStorage.setItem(KEY, JSON.stringify(obj)); load();
    save(opts.fromFolder ? { silent: true, keepTimestamp: true } : {});
  }
  const uid = () => Math.random().toString(36).slice(2, 10);

  // ---------- Cálculos ----------
  const accountName = (id) => {
    if (id === 'conta') return 'Débito / Pix';
    const c = state.cards.find((c) => c.id === id); return c ? c.name : id;
  };

  /** Parcela de uma transação que cai no mês `m` (ou null). */
  function installmentIn(tx, m) {
    const idx = ym.diff(tx.firstMonth, m); // 0-based
    if (idx < 0 || idx >= tx.installments) return null;
    return { n: idx + 1, of: tx.installments, amount: tx.amount, tx };
  }

  /** Itens (parcelas) de uma fatura de cartão em um mês. */
  function invoiceItems(cardId, m) {
    return state.transactions
      .filter((t) => t.account === cardId)
      .map((t) => installmentIn(t, m))
      .filter(Boolean)
      .sort((a, b) => (b.tx.date || '').localeCompare(a.tx.date || ''));
  }

  function invoice(cardId, m) {
    const items = invoiceItems(cardId, m);
    const computed = items.reduce((s, i) => s + i.amount, 0);
    const key = cardId + '|' + m;
    const override = state.invoiceOverrides[key];
    const total = override != null ? override : computed;
    return { cardId, month: m, items, computed, override, total, paid: !!state.invoicePaid[key], key };
  }

  const fixedActive = (f, m) => (!f.start || f.start <= m) && (!f.end || f.end >= m);

  /** Saídas de conta (débito/pix) no mês. */
  const accountItems = (m) => state.transactions.filter((t) => t.account === 'conta')
    .map((t) => installmentIn(t, m)).filter(Boolean);

  /** Resumo financeiro de um mês (regime de caixa: o que vence/sai no mês). */
  function monthSummary(m) {
    const s = state.settings;
    const income = +s.income || 0;
    const savings = income * (+s.savingsGoal || 0) / 100;
    const fixed = state.fixed.filter((f) => fixedActive(f, m));
    const fixedTotal = fixed.reduce((a, f) => a + (+f.amount || 0), 0);
    const fixedPaid = fixed.filter((f) => state.fixedPaid[f.id + '|' + m]).reduce((a, f) => a + (+f.amount || 0), 0);
    const invoices = state.cards.map((c) => invoice(c.id, m));
    const cardsTotal = invoices.reduce((a, i) => a + i.total, 0);
    const cardsPaid = invoices.filter((i) => i.paid).reduce((a, i) => a + i.total, 0);
    const account = accountItems(m);
    const accountTotal = account.reduce((a, i) => a + i.amount, 0);
    const committed = fixedTotal + cardsTotal + accountTotal;
    const spent = fixedPaid + cardsPaid + accountTotal; // já saiu do bolso
    const available = income - savings - committed;
    // Compras feitas no mês (competência), independentemente de quando vencem
    const purchases = state.transactions.filter((t) => t.date && t.date.slice(0, 7) === m && t.amount > 0)
      .reduce((a, t) => a + t.amount * t.installments, 0);
    return { month: m, income, savings, fixed, fixedTotal, fixedPaid, invoices, cardsTotal, cardsPaid, account, accountTotal, committed, spent, available, purchases };
  }

  /** Saldo devedor restante de uma transação a partir do mês m (inclusive). */
  function remainingFrom(tx, m) {
    const idx = Math.max(0, ym.diff(tx.firstMonth, m));
    const left = Math.max(0, tx.installments - idx);
    return { left, value: left * tx.amount, lastMonth: ym.add(tx.firstMonth, tx.installments - 1) };
  }

  window.Core = { fmt, ym, load, save, onSave, reset, replace, uid, get state() { return state; }, set state(v) { state = v; },
    accountName, installmentIn, invoiceItems, invoice, fixedActive, monthSummary, remainingFrom, KEY };
})();
