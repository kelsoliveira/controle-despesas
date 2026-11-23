/* Interpretação de texto de faturas (PDF) e de prints de apps de banco (OCR).
 * Funções puras — tudo roda no navegador; nada é enviado para servidores.
 */
(function (root) {
  const MONTHS = { jan: 1, fev: 2, mar: 3, abr: 4, mai: 5, jun: 6, jul: 7, ago: 8, set: 9, out: 10, nov: 11, dez: 12 };
  const SKIP = /PAGAMENTO|PAGTO\b|SALDO ANTERIOR|TOTAL D[AEO]|LIMITE|CR[EÉ]DITO ROTATIVO|PARCELAMENTO DA FATURA|VALOR DO DOCUMENTO|ENCARGOS/i;
  const META = /^(cart[aã]o\s+(f[ií]sico|virtual)(\s+adicional)?|compra|reembolso|estorno|pix|d[eé]bito)$/i;

  const toNum = (s) => +String(s).replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
  const pad = (n) => String(n).padStart(2, '0');
  const ymAdd = (ym, n) => { const [y, m] = ym.split('-').map(Number); const d = new Date(y, m - 1 + n, 1); return d.getFullYear() + '-' + pad(d.getMonth() + 1); };
  const ymDiff = (a, b) => { const [ya, ma] = a.split('-').map(Number); const [yb, mb] = b.split('-').map(Number); return (yb - ya) * 12 + (mb - ma); };

  /** Escolhe o ano de uma data dd/mm usando o mês da fatura e o nº da parcela. */
  function inferYear(day, month, invoiceMonth, n) {
    if (!invoiceMonth) { const y = new Date().getFullYear(); return `${y}-${pad(month)}-${pad(day)}`; }
    const fy = +invoiceMonth.slice(0, 4);
    let best = null, bestScore = Infinity;
    for (const y of [fy + 1, fy, fy - 1, fy - 2]) {
      const ym = `${y}-${pad(month)}`;
      const lag = ymDiff(ym, invoiceMonth); // meses entre compra e fatura
      if (lag < 0) continue;
      const score = Math.abs(lag - (n || 1));
      if (score < bestScore) { bestScore = score; best = y; }
    }
    return `${best ?? fy}-${pad(month)}-${pad(day)}`;
  }

  /** Metadados da fatura: vencimento e total. */
  function detectHeader(text) {
    const out = {};
    text = text.replace(/[ \t]+/g, ' ');
    const v = text.match(/Vencimento[\s\S]{0,120}?(\d{2})\/(\d{2})\/(\d{4})/i);
    if (v) { out.dueDate = `${v[3]}-${v[2]}-${v[1]}`; out.invoiceMonth = `${v[3]}-${v[2]}`; }
    const t = text.match(/Total\s+(?:da\s+)?fatura[\s\S]{0,120}?R\s?\$\s*([\d.]+,\d{2})/i);
    if (t) out.total = toNum(t[1]);
    return out;
  }

  /** Estratégia A: linhas no formato de fatura em PDF — "13/11 LOJA (01/04) 39,37". */
  function parseStatementLines(text, invoiceMonth) {
    const items = [];
    const re = /(?:^|\s)(\d{2})\/(\d{2})(?!\/\d)\s+(.+?)\s*(?:(?:PARC(?:ELA)?\.?\s*)?\(?\b(\d{1,2})\s?\/\s?(\d{1,2})\)?)?\s+(-\s?)?(?:R\s?\$\s*)?(\d{1,3}(?:\.\d{3})*,\d{2})(\s?-)?(?=\s|$)/i;
    for (const raw of text.split(/\n/)) {
      const line = raw.replace(/\s+/g, ' ').trim();
      const m = line.match(re);
      if (!m) continue;
      const [, dd, mm, descRaw, pn, pof, neg1, val, neg2] = m;
      if (+mm < 1 || +mm > 12 || +dd < 1 || +dd > 31) continue;
      const desc = descRaw.replace(/\s+/g, ' ').trim();
      if (!desc || SKIP.test(desc)) continue;
      let n = 1, of = 1;
      if (pn && pof && +pof >= +pn && +pof > 1 && +pof <= 72) { n = +pn; of = +pof; }
      const amount = toNum(val) * (neg1 || neg2 ? -1 : 1);
      items.push({ date: inferYear(+dd, +mm, invoiceMonth, n), desc: tidy(desc), amount, n, of });
    }
    return items;
  }

  /** Estratégia B: prints de apps (Itaú, Mercado Pago, Nubank…) lidos por OCR. */
  function parseAppScreens(text, invoiceMonth) {
    const items = [];
    let curDate = null, pendingDesc = '', last = null;
    const amtRe = /([+\-–])?\s*R\s?[\$S]\s?(\d{1,3}(?:\.\d{3})*,\d{2})/gi;
    for (const raw of text.split(/\n/)) {
      const line = raw.replace(/[|]/g, ' ').replace(/\s+/g, ' ').trim();
      if (!line) continue;
      const dh = line.match(/^(\d{1,2})\s*de\s*([a-zç]{3})[a-zç]*\W*$/i);
      if (dh && MONTHS[dh[2].toLowerCase()]) { curDate = { d: +dh[1], m: MONTHS[dh[2].toLowerCase()] }; pendingDesc = ''; continue; }
      const amts = [...line.matchAll(amtRe)];
      const parc = line.match(/Parcela\s+(\d{1,2})\s+de\s+(\d{1,2})/i);
      if (amts.length >= 2) { pendingDesc = ''; continue; } // linha de abas de meses / resumo
      if (amts.length === 1) {
        const a = amts[0];
        let desc = line.slice(0, a.index).replace(/\s+[-–+]$/, '').trim();
        if (!desc || META.test(desc)) desc = pendingDesc;
        if (!desc || SKIP.test(desc) || /fatura|total|limite|dispon/i.test(desc)) { pendingDesc = ''; continue; }
        const credit = a[1] === '+' || /reembolso|estorno/i.test(line);
        last = { desc: tidy(desc), amount: toNum(a[2]) * (credit ? -1 : 1), n: 1, of: 1, date: curDate };
        if (parc) { last.n = +parc[1]; last.of = +parc[2]; }
        items.push(last); pendingDesc = '';
        continue;
      }
      if (parc && last && last.of === 1) { last.n = +parc[1]; last.of = +parc[2]; continue; }
      if (/reembolso|estorno/i.test(line) && last && last.amount > 0 && !pendingDesc) { last.amount = -last.amount; continue; }
      if (META.test(line) || /^\d{1,2}:\d{2}/.test(line) || line.length < 3) continue;
      pendingDesc = line;
    }
    return items.map((it) => ({ ...it, date: it.date ? inferYear(it.date.d, it.date.m, invoiceMonth, it.n) : '' }));
  }

  function tidy(s) {
    s = s.replace(/\s{2,}/g, ' ').trim();
    if (s === s.toUpperCase()) s = s.toLowerCase().replace(/(^|[\s*\-—(/])(\p{L})/gu, (m, a, b) => a + b.toUpperCase());
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  /** Remove itens repetidos (prints que se sobrepõem). */
  function dedupe(items) {
    const seen = new Set();
    return items.filter((it) => {
      const k = [it.date, it.desc.toLowerCase().replace(/\W/g, ''), it.amount.toFixed(2), it.n, it.of].join('|');
      if (seen.has(k)) return false; seen.add(k); return true;
    });
  }

  function parseText(text, invoiceMonth) {
    const header = detectHeader(text);
    const month = invoiceMonth || header.invoiceMonth || '';
    const a = parseStatementLines(text, month);
    const b = parseAppScreens(text, month);
    const items = dedupe(a.length >= b.length ? a : b);
    return { ...header, invoiceMonth: month, items, strategy: a.length >= b.length ? 'pdf' : 'app' };
  }

  /** Sugere a categoria pela descrição. */
  function guessCategory(desc, amount) {
    const d = (desc || '').toLowerCase();
    if (amount < 0) return 'reembolso';
    const rules = [
      ['pets', /pet|bicho|vet|ra[cç][aã]o|cobasi|petz/], ['saude', /drogas|raia|farm|pague menos|hospital|cl[ií]nica|laborat|odonto|unimed|hapvida/],
      ['lazer', /playstation|psn|xbox|steam|nintendo|game|level up|cinema|netflix|spotify|ingresso|ghgames/], ['educacao', /educa|curso|escola|faculd|udemy|alura|livraria/],
      ['transporte', /uber|99\s?(app|pop)|posto|combust|shell|ipiranga|estacion|ped[aá]gio|sem parar/], ['alimentacao', /ifood|restaur|lanch|padaria|supermerc|atacad|assa[ií]|carrefour|burger|pizza|a[cç]ougue/],
      ['eletronicos', /eletr|kabum|pichau|terabyte|samsung|apple|xiaomi/], ['servicos', /claro|vivo|tim\b|oi\b|internet|google|microsoft|icloud|anuidade|seguro/],
      ['compras', /amazon|shopee|mercado ?livre|mercadolivre|magalu|magazine|americanas|shein|aliexpress|itaushop|loja|store/]
    ];
    for (const [cat, re] of rules) if (re.test(d)) return cat;
    return 'outros';
  }

  const api = { parseText, parseStatementLines, parseAppScreens, detectHeader, guessCategory, dedupe, inferYear, ymAdd, ymDiff };
  if (typeof module !== 'undefined') module.exports = api; else root.Parsers = api;
})(typeof window !== 'undefined' ? window : globalThis);
