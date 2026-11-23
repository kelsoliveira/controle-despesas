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
      items.push({ date: inferYear(+dd, +mm, invoiceMonth, n), desc: cleanMerchant(desc), raw: desc, amount, n, of });
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
        last = { desc: cleanMerchant(desc), raw: desc, amount: toNum(a[2]) * (credit ? -1 : 1), n: 1, of: 1, date: curDate };
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

  // ======================== Limpeza de nomes de estabelecimentos ========================
  const CITIES = ['sao paulo', 'rio de janeiro', 'manaus', 'curitiba', 'guarulhos', 'cajamar', 'brasilia', 'belo horizonte', 'porto alegre',
    'salvador', 'recife', 'fortaleza', 'florianopolis', 'barueri', 'osasco', 'campinas', 'goiania', 'belem', 'santo andre', 'sao bernardo do campo',
    'sao bernardo', 'jundiai', 'extrema', 'louveira', 'embu das artes', 'embu', 'contagem', 'joinville', 'uberlandia', 'vitoria', 'natal', 'maceio',
    'teresina', 'cuiaba', 'campo grande', 'palmas', 'porto velho', 'boa vista', 'macapa', 'rio branco', 'aracaju', 'joao pessoa', 'sao luis',
    'ribeirao preto', 'sorocaba', 'santos', 'niteroi', 'cotia', 'itapevi', 'taboao da serra', 'diadema', 'mogi das cruzes', 'hortolandia',
    'vinhedo', 'itajai', 'blumenau', 'londrina', 'maringa', 'sao jose dos campos', 'sao jose', 'canoas', 'betim', 'serra', 'vila velha', 'cariacica',
    'duque de caxias', 'nova iguacu', 'sao goncalo', 'osasco', 'carapicuiba', 'santana de parnaiba', 'alphaville', 'paulinia', 'indaiatuba'];
  const CITY_RE = CITIES.map((c) => c.replace(/ /g, '\\s*')).sort((a, b) => b.length - a.length).join('|');
  const GATEWAYS = new Set(['ebn', 'pg', 'pag', 'pagseguro', 'pagbank', 'mp', 'mercadopago', 'pp', 'paypal', 'ec', 'dm', 'ifd', 'iz', 'sumup', 'stone', 'picpay', 'hna', 'ce', 'ton', 'cielo', 'getnet', 'zp', 'pay', 'ppro', 'pix', 'sympla']);
  const BRANDS = [[/amazon\s*mktplc|amazon\s*marketplace|^amazon(\s*br)?$|amazonbr|amazon/, 'Amazon'], [/mercado\s*livre|mercadolivre|^mercado$/, 'Mercado Livre'],
    [/shopee/, 'Shopee'], [/playstation|^psn/, 'PlayStation Store'], [/drogasil|droga\s*raia|^raia\b/, 'Raia Drogasil'], [/ifood/, 'iFood'],
    [/^uber|uber\s*trip|ubereats/, 'Uber'], [/netflix/, 'Netflix'], [/spotify/, 'Spotify'], [/aliexpress/, 'AliExpress'], [/magalu|magazine\s*luiza/, 'Magalu'],
    [/^99\s*(app|pop|tecnologia)/, '99'], [/google/, 'Google'], [/apple\.com|itunes/, 'Apple'], [/steam/, 'Steam'], [/nintendo/, 'Nintendo']];
  const SUFFIX = /\s+(ltda|lt|me|sa|s\/a|eireli|epp|com|br|bra|[a-z])$/i;

  function stripLocation(s) {
    let prev;
    do {
      prev = s;
      s = s.replace(/(\w{3,}?)(bra|br)$/i, (m, a) => (/^(sob|lib|cob|zeb)$/i.test(a) ? m : a)).trim(); // "paulobra" → "paulo"
      s = s.replace(new RegExp('\\s*(' + CITY_RE + ')$', 'i'), (m) => (s.length - m.length >= 3 ? '' : m)).trim();
      const last = s.match(/\s([a-z]{5,})$/i); // cidade truncada (ex.: "Florianop")
      if (last && CITIES.some((c) => c.replace(/ /g, '').startsWith(last[1].toLowerCase()) && c.replace(/ /g, '') !== last[1].toLowerCase())) s = s.slice(0, last.index).trim();
      s = s.replace(SUFFIX, (m) => (s.length - m.length >= 3 ? '' : m)).trim();
      s = s.replace(/[\s\-–*.,]+$/, '');
    } while (s !== prev && s.length > 2);
    return s;
  }
  const brandOf = (s) => { const n = s.toLowerCase().trim(); const b = BRANDS.find(([re]) => re.test(n)); return b ? b[1] : null; };

  /** "Raia drogasil sasao paulobra" → "Raia Drogasil"; "Pg *Manaus Em Dobro Lt Florianop" → "Manaus Em Dobro". */
  function cleanMerchant(raw) {
    let s = String(raw || '').replace(/\s+/g, ' ').trim();
    if (!s) return raw;
    const star = s.indexOf('*');
    if (star > 0) {
      const pre = s.slice(0, star).trim(), post = stripLocation(s.slice(star + 1).trim());
      const preKey = pre.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (GATEWAYS.has(preKey)) s = post || pre;
      else {
        const b = brandOf(pre);
        const pb = post ? brandOf(post) : null;
        if (b && (!post || pb === b || /\d/.test(post) || post.length < 4)) s = b;
        else if (b) return b + ' — ' + tidy(post);
        else s = pre;
      }
    }
    s = stripLocation(s);
    const b = brandOf(s);
    if (b && (s.split(' ').length <= 3 || b === 'Raia Drogasil')) return b;
    return tidy(s);
  }

  /** Remove itens repetidos (prints que se sobrepõem). */
  function dedupe(items) {
    const seen = new Set();
    return items.filter((it) => {
      const k = [it.date, (it.raw || it.desc).toLowerCase().replace(/\W/g, ''), it.amount.toFixed(2), it.n, it.of].join('|');
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

  // ======================== Planilhas (XLSX / CSV) ========================
  const HDR = {
    date: /^(data|dt|dia|date)\b|data\s+d[ae]\s+(compra|lan)/i,
    desc: /descri|estabelec|hist[oó]rico|lan[cç]amento|loja|^item|nome|detalhe|merchant|t[ií]tulo/i,
    amount: /valor|r\$|montante|amount|pre[cç]o|quantia|d[eé]bito/i,
    parcela: /parcela|^parc\b|presta[cç]/i,
    category: /categoria|classifica|^tipo\b/i
  };
  const isDateObj = (v) => v instanceof Date && !isNaN(v);

  /** Converte o conteúdo de uma célula em data ISO (AAAA-MM-DD) ou ''. */
  function cellToDate(v, invoiceMonth) {
    if (v == null || v === '') return '';
    if (isDateObj(v)) return `${v.getUTCFullYear()}-${pad(v.getUTCMonth() + 1)}-${pad(v.getUTCDate())}`;
    if (typeof v === 'number') {
      if (v < 20000 || v > 80000) return ''; // nº de série do Excel plausível
      const d = new Date(Date.UTC(1899, 11, 30) + Math.round(v) * 86400000);
      return cellToDate(d);
    }
    const s = String(v).trim();
    let m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return `${m[1]}-${m[2]}-${m[3]}`;
    m = s.match(/^(\d{1,2})[/.-](\d{1,2})(?:[/.-](\d{2,4}))?$/);
    if (m) {
      const d = +m[1], mo = +m[2];
      if (d < 1 || d > 31 || mo < 1 || mo > 12) return '';
      if (!m[3]) return inferYear(d, mo, invoiceMonth, 1);
      const y = m[3].length === 2 ? 2000 + +m[3] : +m[3];
      return `${y}-${pad(mo)}-${pad(d)}`;
    }
    m = s.match(/^(\d{1,2})\s*de\s*([a-zç]{3})[a-zç]*\.?(?:\s*de\s*(\d{4}))?$/i);
    if (m && MONTHS[m[2].toLowerCase()]) return m[3] ? `${m[3]}-${pad(MONTHS[m[2].toLowerCase()])}-${pad(+m[1])}` : inferYear(+m[1], MONTHS[m[2].toLowerCase()], invoiceMonth, 1);
    return '';
  }

  /** Converte "R$ 1.234,56", "-1234.5", "(10,00)", "10,00-" etc. em número (ou NaN). */
  function cellToNumber(v) {
    if (typeof v === 'number') return v;
    if (v == null) return NaN;
    let s = String(v).trim();
    if (!s) return NaN;
    let neg = false;
    if (/^\(.*\)$/.test(s)) { neg = true; s = s.slice(1, -1); }
    if (/-\s*$/.test(s)) { neg = true; s = s.replace(/-\s*$/, ''); }
    s = s.replace(/R\s?\$|BRL|\s/gi, '');
    if (s.startsWith('-')) { neg = !neg; s = s.slice(1); }
    if (s.startsWith('+')) s = s.slice(1);
    if (!/^[\d.,]+$/.test(s)) return NaN;
    const lc = s.lastIndexOf(','), ld = s.lastIndexOf('.');
    if (lc >= 0 && ld >= 0) s = lc > ld ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '');
    else if (lc >= 0) s = s.replace(/\./g, '').replace(',', '.');
    else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
    const n = parseFloat(s);
    return isNaN(n) ? NaN : (neg ? -n : n);
  }

  /** "2/10", "02 de 10", "Parcela 2 de 10" → {n, of}. */
  function cellToParcela(v) {
    const m = String(v ?? '').match(/(\d{1,2})\s*(?:\/|de)\s*(\d{1,2})/i);
    if (m && +m[2] >= +m[1] && +m[2] > 1 && +m[2] <= 72 && +m[1] >= 1) return { n: +m[1], of: +m[2] };
    return null;
  }
  const colName = (i) => { let s = ''; i++; while (i > 0) { const r = (i - 1) % 26; s = String.fromCharCode(65 + r) + s; i = Math.floor((i - 1) / 26); } return s; };

  /** Descobre a linha de cabeçalho e quais colunas são data, descrição, valor… */
  function detectSheetMapping(rows) {
    const map = { headerRow: -1, date: -1, desc: -1, amount: -1, parcela: -1, category: -1 };
    let best = 0;
    for (let r = 0; r < Math.min(rows.length, 30); r++) {
      const row = rows[r] || [];
      const found = {};
      // cabeçalho só tem textos curtos — linhas com datas ou números são dados
      if (row.some((c) => isDateObj(c) || typeof c === 'number' || (typeof c === 'string' && (cellToDate(c, '2000-01') || /^-?[\d.,]+$/.test(c.trim()))))) continue;
      row.forEach((c, i) => {
        const t = String(c ?? '').trim();
        if (!t || t.length > 40) return;
        if (/valor/i.test(t)) { if (found.amount == null || (/total/i.test(found.amountTxt) && !/total/i.test(t))) { found.amount = i; found.amountTxt = t; } return; }
        for (const k of ['date', 'parcela', 'category', 'desc', 'amount']) {
          if (found[k] == null && HDR[k].test(t)) { found[k] = i; if (k === 'amount') found.amountTxt = t; return; }
        }
      });
      const score = ['date', 'desc', 'amount', 'parcela', 'category'].filter((k) => found[k] != null).length;
      if (score > best && score >= 2 && found.amount != null) { best = score; Object.assign(map, { headerRow: r, date: found.date ?? -1, desc: found.desc ?? -1, amount: found.amount, parcela: found.parcela ?? -1, category: found.category ?? -1 }); }
    }
    // completa pelo conteúdo o que o cabeçalho não indicou
    const body = rows.slice(map.headerRow + 1, map.headerRow + 200);
    const ncols = Math.max(0, ...body.map((r) => (r || []).length));
    const stats = Array.from({ length: ncols }, (_, i) => {
      let dates = 0, nums = 0, texts = 0, len = 0;
      body.forEach((r) => {
        const v = (r || [])[i];
        if (v == null || v === '') return;
        if (isDateObj(v) || (typeof v === 'string' && cellToDate(v, '2000-01'))) dates++;
        else if (!isNaN(cellToNumber(v))) nums++;
        else { texts++; len += String(v).length; }
      });
      return { i, dates, nums, texts, avg: texts ? len / texts : 0 };
    });
    const used = () => [map.date, map.desc, map.amount, map.parcela, map.category];
    const pick = (fn, key) => stats.filter((s) => !used().includes(s.i)).sort((a, b) => fn(b) - fn(a))[0];
    if (map.date < 0) { const s = pick((s) => s.dates); if (s && s.dates) map.date = s.i; }
    if (map.amount < 0) { const s = pick((s) => s.nums); if (s && s.nums) map.amount = s.i; }
    if (map.desc < 0) { const s = pick((s) => s.texts * 10 + s.avg); if (s && s.texts) map.desc = s.i; }
    return map;
  }

  /** Lista as colunas para os seletores de mapeamento. */
  function sheetColumns(rows, map) {
    const head = map.headerRow >= 0 ? rows[map.headerRow] || [] : [];
    const n = Math.max(0, ...rows.slice(0, 60).map((r) => (r || []).length));
    return Array.from({ length: n }, (_, i) => ({ i, label: colName(i) + (head[i] != null && head[i] !== '' ? ' — ' + String(head[i]).slice(0, 30) : '') }));
  }

  /** A maioria dos valores é negativa? (extratos costumam trazer gastos negativos) */
  function negativesAreExpenses(rows, map) {
    let neg = 0, pos = 0;
    rows.slice(map.headerRow + 1).forEach((r) => { const v = cellToNumber((r || [])[map.amount]); if (v < 0) neg++; else if (v > 0) pos++; });
    return neg > pos;
  }

  /** Converte as linhas da planilha em lançamentos. */
  function sheetToItems(rows, map, opts = {}) {
    const items = [];
    if (map.amount < 0) return items;
    for (let r = map.headerRow + 1; r < rows.length; r++) {
      const row = rows[r] || [];
      let amount = cellToNumber(row[map.amount]);
      if (isNaN(amount) || amount === 0) continue;
      let desc = map.desc >= 0 ? String(row[map.desc] ?? '').replace(/\s+/g, ' ').trim() : '';
      if (!desc) desc = 'Lançamento da planilha';
      if (SKIP.test(desc) || /^(total|subtotal|saldo)\b/i.test(desc)) continue;
      if (opts.negativeIsExpense) amount = -amount;
      let p = map.parcela >= 0 ? cellToParcela(row[map.parcela]) : null;
      if (!p) {
        const m = desc.match(/(?:parc(?:ela)?\.?\s*)?\(?\b(\d{1,2})\s?\/\s?(\d{1,2})\)?\s*$/i);
        if (m) { p = cellToParcela(m[1] + '/' + m[2]); if (p) desc = desc.slice(0, m.index).trim() || desc; }
      }
      const n = p ? p.n : 1, of = p ? p.of : 1;
      const date = map.date >= 0 ? cellToDate(row[map.date], opts.invoiceMonth) : '';
      items.push({ date, desc: tidy(desc), raw: desc, amount: Math.round(amount * 100) / 100, n, of, catLabel: map.category >= 0 ? String(row[map.category] ?? '').trim() : '' });
    }
    return items;
  }

  /** Lê CSV (separador ; , ou tab) — retorna matriz de células. */
  function parseCSV(text) {
    text = text.replace(/^﻿/, '');
    const sample = text.split(/\r?\n/).slice(0, 10).join('\n');
    const delim = [';', '\t', ','].map((d) => [d, (sample.match(new RegExp(d === '\t' ? '\t' : '\\' + d, 'g')) || []).length]).sort((a, b) => b[1] - a[1])[0][0];
    const rows = []; let row = [], cell = '', q = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (q) { if (ch === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += ch; }
      else if (ch === '"') q = true;
      else if (ch === delim) { row.push(cell); cell = ''; }
      else if (ch === '\n' || ch === '\r') { if (ch === '\r' && text[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; }
      else cell += ch;
    }
    if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
    return rows.filter((r) => r.some((c) => String(c).trim() !== ''));
  }

  const api = { cleanMerchant, cellToDate, cellToNumber, cellToParcela, detectSheetMapping, sheetColumns, negativesAreExpenses, sheetToItems, parseCSV, parseText, parseStatementLines, parseAppScreens, detectHeader, guessCategory, dedupe, inferYear, ymAdd, ymDiff };
  if (typeof module !== 'undefined') module.exports = api; else root.Parsers = api;
})(typeof window !== 'undefined' ? window : globalThis);
