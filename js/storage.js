/* Pasta de dados no computador (File System Access API — Chrome/Edge).
 * Se a pasta escolhida estiver dentro do OneDrive, Google Drive ou Dropbox,
 * o aplicativo de sincronização leva os dados para a nuvem automaticamente.
 */
(function () {
  const FILE = 'controle-despesas.json';
  const BACKUP_DIR = 'backups';
  const KEEP_BACKUPS = 30;

  // ---- IndexedDB mínimo para guardar o "atalho" da pasta ----
  function idb() {
    return new Promise((res, rej) => {
      const r = indexedDB.open('controle-despesas', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('kv');
      r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
    });
  }
  async function kv(mode, fn) {
    const db = await idb();
    return new Promise((res, rej) => {
      const tx = db.transaction('kv', mode); const st = tx.objectStore('kv');
      const req = fn(st); tx.oncomplete = () => res(req && req.result); tx.onerror = () => rej(tx.error);
    });
  }
  const getKV = (k) => kv('readonly', (s) => s.get(k));
  const setKV = (k, v) => kv('readwrite', (s) => s.put(v, k));
  const delKV = (k) => kv('readwrite', (s) => s.delete(k));

  let handle = null;
  let status = 'none'; // none | connected | needs-permission | unsupported | error
  const supported = typeof window.showDirectoryPicker === 'function';

  async function init() {
    if (!supported) { status = 'unsupported'; return status; }
    try { handle = await getKV('dir'); } catch (e) { handle = null; }
    if (!handle) { status = 'none'; return status; }
    const p = await handle.queryPermission({ mode: 'readwrite' });
    status = p === 'granted' ? 'connected' : 'needs-permission';
    return status;
  }

  async function choose() {
    handle = await window.showDirectoryPicker({ id: 'controle-despesas', mode: 'readwrite', startIn: 'documents' });
    await setKV('dir', handle);
    status = 'connected';
    return handle.name;
  }

  async function reconnect() {
    if (!handle) return false;
    const p = await handle.requestPermission({ mode: 'readwrite' });
    status = p === 'granted' ? 'connected' : 'needs-permission';
    return status === 'connected';
  }

  async function disconnect() { handle = null; status = 'none'; await delKV('dir'); }

  /** Lê o arquivo de dados da pasta. Retorna { data, lastModified } ou null. */
  async function read() {
    if (status !== 'connected') return null;
    try {
      const fh = await handle.getFileHandle(FILE);
      const f = await fh.getFile();
      return { data: JSON.parse(await f.text()), lastModified: f.lastModified };
    } catch (e) {
      if (e.name === 'NotFoundError') return null;
      throw e;
    }
  }

  async function lastModified() {
    if (status !== 'connected') return 0;
    try { return (await (await handle.getFileHandle(FILE)).getFile()).lastModified; } catch (e) { return 0; }
  }

  /** Grava os dados (e, uma vez por dia, guarda uma cópia em /backups). */
  async function write(obj) {
    if (status !== 'connected') return false;
    await dailyBackup();
    const fh = await handle.getFileHandle(FILE, { create: true });
    const w = await fh.createWritable();
    await w.write(JSON.stringify(obj, null, 2));
    await w.close();
    return true;
  }

  async function dailyBackup() {
    const today = new Date().toISOString().slice(0, 10);
    if (localStorage.getItem('cd:lastBackup') === today) return;
    try {
      const src = await (await handle.getFileHandle(FILE)).getFile();
      const dir = await handle.getDirectoryHandle(BACKUP_DIR, { create: true });
      const out = await (await dir.getFileHandle(`controle-despesas-${today}.json`, { create: true })).createWritable();
      await out.write(await src.text()); await out.close();
      // mantém só os últimos N backups
      const names = [];
      for await (const [name] of dir.entries()) if (name.endsWith('.json')) names.push(name);
      names.sort().slice(0, Math.max(0, names.length - KEEP_BACKUPS)).forEach((n) => dir.removeEntry(n).catch(() => {}));
    } catch (e) { /* ainda não existe arquivo — nada a copiar */ }
    localStorage.setItem('cd:lastBackup', today);
  }

  window.Store = {
    FILE, supported, init, choose, reconnect, disconnect, read, write, lastModified,
    get status() { return status; }, get folderName() { return handle ? handle.name : ''; }
  };
})();
