/* Importação de faturas em PDF e prints (imagens) — processamento 100% local. */
(function () {
  const abs = (p) => new URL(p, location.href).href;
  const loaded = {};
  function loadScript(src) {
    if (!loaded[src]) loaded[src] = new Promise((res, rej) => {
      const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error('Falha ao carregar ' + src));
      document.head.appendChild(s);
    });
    return loaded[src];
  }

  // ---------------- PDF (pdf.js) ----------------
  async function pdfToText(file, askPassword) {
    await loadScript('vendor/pdfjs/pdf.min.js');
    const lib = window.pdfjsLib;
    lib.GlobalWorkerOptions.workerSrc = abs('vendor/pdfjs/pdf.worker.min.js');
    const data = new Uint8Array(await file.arrayBuffer());
    const task = lib.getDocument({ data });
    task.onPassword = async (update, reason) => {
      const pw = await askPassword(file.name, reason === lib.PasswordResponses.INCORRECT_PASSWORD);
      if (pw == null) task.destroy(); else update(pw);
    };
    const doc = await task.promise;
    const lines = [];
    for (let p = 1; p <= doc.numPages; p++) {
      const page = await doc.getPage(p);
      const content = await page.getTextContent();
      // agrupa os pedaços de texto por linha (coordenada Y) e ordena por X
      const rows = new Map();
      for (const it of content.items) {
        if (!it.str || !it.str.trim()) continue;
        const y = Math.round(it.transform[5] / 2) * 2;
        if (!rows.has(y)) rows.set(y, []);
        rows.get(y).push({ x: it.transform[4], s: it.str, w: it.width || 0 });
      }
      [...rows.entries()].sort((a, b) => b[0] - a[0]).forEach(([, parts]) => {
        parts.sort((a, b) => a.x - b.x);
        let out = '', end = null;
        for (const pt of parts) {
          if (end != null) out += pt.x - end > 18 ? '   ' : (pt.x - end > 1 ? ' ' : '');
          out += pt.s; end = pt.x + pt.w;
        }
        lines.push(out);
      });
    }
    return lines.join('\n');
  }

  // ---------------- Imagem (Tesseract OCR) ----------------
  let ocrWorker = null;
  async function imageToText(file, onProgress) {
    await loadScript('vendor/tesseract/tesseract.min.js');
    if (!ocrWorker) {
      ocrWorker = await Tesseract.createWorker('por', 1, {
        workerPath: abs('vendor/tesseract/worker.min.js'),
        corePath: abs('vendor/tesseract/core'),
        langPath: abs('vendor/tesseract/lang'),
        gzip: true, workerBlobURL: false,
        logger: (m) => { if (m.status === 'recognizing text' && onProgress) onProgress(m.progress); }
      });
    }
    const { data } = await ocrWorker.recognize(file);
    return data.text;
  }
  async function releaseOcr() { if (ocrWorker) { await ocrWorker.terminate(); ocrWorker = null; } }

  // ---------------- Planilhas: XLSX (leitor próprio) e CSV ----------------
  /** Lê as entradas de um arquivo ZIP (formato do .xlsx). */
  async function unzip(buf) {
    const dv = new DataView(buf), u8 = new Uint8Array(buf);
    let eocd = -1;
    for (let i = buf.byteLength - 22; i >= Math.max(0, buf.byteLength - 66000); i--) if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
    if (eocd < 0) throw new Error('Arquivo não é uma planilha .xlsx válida.');
    const count = dv.getUint16(eocd + 10, true);
    let p = dv.getUint32(eocd + 16, true);
    const dec = new TextDecoder();
    const entries = {};
    for (let k = 0; k < count; k++) {
      if (dv.getUint32(p, true) !== 0x02014b50) break;
      const method = dv.getUint16(p + 10, true), csize = dv.getUint32(p + 20, true);
      const nlen = dv.getUint16(p + 28, true), elen = dv.getUint16(p + 30, true), clen = dv.getUint16(p + 32, true);
      const off = dv.getUint32(p + 42, true);
      const name = dec.decode(u8.subarray(p + 46, p + 46 + nlen));
      entries[name] = { method, csize, off };
      p += 46 + nlen + elen + clen;
    }
    return {
      has: (n) => !!entries[n],
      async text(n) {
        const e = entries[n]; if (!e) return null;
        const start = e.off + 30 + dv.getUint16(e.off + 26, true) + dv.getUint16(e.off + 28, true);
        const data = u8.subarray(start, start + e.csize);
        if (e.method === 0) return dec.decode(data);
        if (e.method !== 8) throw new Error('Compressão não suportada na planilha.');
        const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
        return await new Response(stream).text();
      }
    };
  }

  const xml = (s) => new DOMParser().parseFromString(s, 'application/xml');
  const byTag = (node, tag) => Array.from(node.getElementsByTagNameNS('*', tag));
  const DATE_FMT_IDS = new Set([14, 15, 16, 17, 18, 19, 20, 21, 22, 27, 30, 36, 45, 46, 47, 50, 57]);

  /** Lê um .xlsx e devolve [{ name, rows: [[célula…]] }]. Datas viram objetos Date (UTC). */
  async function readXlsx(file) {
    const zip = await unzip(await file.arrayBuffer());
    const wb = xml(await zip.text('xl/workbook.xml'));
    const date1904 = byTag(wb, 'workbookPr').some((n) => /^(1|true)$/.test(n.getAttribute('date1904') || ''));
    const rels = {};
    const relsXml = await zip.text('xl/_rels/workbook.xml.rels');
    if (relsXml) byTag(xml(relsXml), 'Relationship').forEach((r) => { rels[r.getAttribute('Id')] = r.getAttribute('Target'); });
    // textos compartilhados
    const shared = [];
    const ssXml = await zip.text('xl/sharedStrings.xml');
    if (ssXml) byTag(xml(ssXml), 'si').forEach((si) => shared.push(byTag(si, 't').map((t) => t.textContent).join('')));
    // estilos de data
    const dateStyle = [];
    const stXml = await zip.text('xl/styles.xml');
    if (stXml) {
      const st = xml(stXml), custom = {};
      byTag(st, 'numFmt').forEach((f) => { custom[f.getAttribute('numFmtId')] = f.getAttribute('formatCode') || ''; });
      const cellXfs = byTag(st, 'cellXfs')[0];
      if (cellXfs) byTag(cellXfs, 'xf').forEach((xf, i) => {
        const id = +xf.getAttribute('numFmtId');
        const code = (custom[id] || '').replace(/\[[^\]]*\]|"[^"]*"|\\./g, '');
        dateStyle[i] = DATE_FMT_IDS.has(id) || (!!custom[id] && /[dy]/i.test(code)); // ex.: dd/mm/yyyy, mmm-yy
      });
    }
    const toDate = (serial) => new Date(Date.UTC(date1904 ? 1904 : 1899, date1904 ? 0 : 11, date1904 ? 1 : 30) + Math.round(serial * 86400) * 1000);
    const colIdx = (ref) => { let n = 0; for (const ch of ref.replace(/\d+/g, '')) n = n * 26 + (ch.charCodeAt(0) - 64); return n - 1; };

    const sheets = [];
    for (const s of byTag(wb, 'sheet')) {
      const rid = s.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id') || s.getAttribute('r:id');
      let target = rels[rid] || '';
      target = target.startsWith('/') ? target.slice(1) : 'xl/' + target.replace(/^\.?\//, '');
      const sx = await zip.text(target);
      if (!sx) continue;
      const rows = [];
      byTag(xml(sx), 'row').forEach((row) => {
        const r = (+row.getAttribute('r') || rows.length + 1) - 1;
        const out = [];
        byTag(row, 'c').forEach((c, k) => {
          const ref = c.getAttribute('r'); const ci = ref ? colIdx(ref) : k;
          const t = c.getAttribute('t'), sIdx = +(c.getAttribute('s') || 0);
          const v = byTag(c, 'v')[0];
          let val = null;
          if (t === 's') val = v ? shared[+v.textContent] ?? '' : '';
          else if (t === 'inlineStr') val = byTag(c, 't').map((x) => x.textContent).join('');
          else if (t === 'str' || t === 'e') val = v ? v.textContent : '';
          else if (t === 'b') val = v ? v.textContent === '1' : null;
          else if (t === 'd') val = v ? new Date(v.textContent) : null;
          else if (v) { const n = +v.textContent; val = dateStyle[sIdx] && n > 0 && n < 2958466 ? toDate(n) : n; }
          out[ci] = val;
        });
        rows[r] = out;
      });
      sheets.push({ name: s.getAttribute('name') || 'Planilha', rows: Array.from(rows, (r) => r || []) });
    }
    if (!sheets.length) throw new Error('Nenhuma aba encontrada na planilha.');
    return sheets;
  }

  async function readSpreadsheet(file) {
    if (/\.csv$/i.test(file.name) || file.type === 'text/csv') {
      const buf = await file.arrayBuffer();
      let text = new TextDecoder('utf-8').decode(buf);
      if (text.includes('�')) text = new TextDecoder('windows-1252').decode(buf); // Excel BR costuma salvar em ANSI
      return [{ name: file.name, rows: Parsers.parseCSV(text) }];
    }
    if (/\.xls$/i.test(file.name)) throw new Error('Formato .xls antigo não é suportado. No Excel, use "Salvar como" → Pasta de Trabalho do Excel (.xlsx) ou CSV.');
    return readXlsx(file);
  }

  /** Modelo de planilha (CSV com ; — abre direto no Excel em português). */
  function downloadTemplate() {
    const csv = '﻿Data;Descrição;Valor;Parcela;Categoria\n13/11/2026;Supermercado;250,90;;Alimentação\n14/11/2026;Loja de eletrônicos;199,90;1/10;Eletrônicos\n15/11/2026;Farmácia;45,50;;Saúde\n';
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = 'modelo-lancamentos.csv'; a.click(); URL.revokeObjectURL(a.href);
  }

  // ---------------- Detecção do cartão ----------------
  const norm = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  function detectCard(text, cards) {
    const t = norm(text);
    let best = null, bestScore = 0;
    for (const c of cards) {
      const words = norm(c.name + ' ' + (c.brand || '')).split(/[^a-z0-9]+/).filter((w) => w.length >= 4);
      const score = words.reduce((a, w) => a + (t.includes(w) ? 1 : 0), 0);
      if (score > bestScore) { bestScore = score; best = c.id; }
    }
    return best;
  }

  window.Importer = { readSpreadsheet, readXlsx, downloadTemplate, pdfToText, imageToText, releaseOcr, detectCard, loadScript };
})();
