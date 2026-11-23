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

  window.Importer = { pdfToText, imageToText, releaseOcr, detectCard, loadScript };
})();
