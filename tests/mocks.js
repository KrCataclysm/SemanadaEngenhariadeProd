// Simulação mínima do ambiente Apps Script para testar a lógica em Node.
const vm = require('vm'), fs = require('fs'), path = require('path');

function makeEnv(opts = {}) {
  const sheets = {};
  const sent = [];
  const props = {};
  const state = { triggers: [], quota: opts.quota === undefined ? 100 : opts.quota, failSend: false, failMsg: 'falha', clock: 0 };

  class Range {
    constructor(sh, r, c, nr, nc) { Object.assign(this, { sh, r, c, nr: nr || 1, nc: nc || 1 }); }
    setValues(v) { v.forEach((row, i) => row.forEach((x, j) => this.sh.set(this.r + i, this.c + j, x))); return this; }
    setValue(x) { this.sh.set(this.r, this.c, x); return this; }
    getValue() { return this.sh.get(this.r, this.c); }
    setFormula(f) { this.sh.set(this.r, this.c, f); return this; }
    getRow() { return this.r; } getColumn() { return this.c; } getNumRows() { return this.nr; } getNumColumns() { return this.nc; } getSheet() { return this.sh; }
    clearContent() { for (let i = 0; i < this.nr; i++) for (let j = 0; j < this.nc; j++) this.sh.set(this.r + i, this.c + j, ''); return this; }
    setBackground() { return this; } setFontColor() { return this; } setFontWeight() { return this; }
    setNumberFormat() { return this; } setFontWeight() { return this; } setDataValidation() { return this; }
  }
  class Sheet {
    constructor(name) { this.name = name; this.data = []; }
    set(r, c, x) { while (this.data.length < r) this.data.push([]); const row = this.data[r - 1]; while (row.length < c) row.push(''); row[c - 1] = x; }
    get(r, c) { return (this.data[r - 1] || [])[c - 1] ?? ''; }
    getRange(r, c, nr, nc) { return new Range(this, r, c, nr, nc); }
    getDataRange() { const w = Math.max(0, ...this.data.map(x => x.length)); return { getValues: () => this.data.map(r => { const o = r.slice(); while (o.length < w) o.push(''); return o; }) }; }
    appendRow(row) { this.data.push(row.slice()); }
    getLastRow() { return this.data.length; }
    setFrozenRows() {} getName() { return this.name; } clear() { this.data = []; }
  }
  const SpreadsheetApp = {
    getActiveSpreadsheet: () => ({
      getSheetByName: n => sheets[n] || null,
      insertSheet: n => (sheets[n] = new Sheet(n)),
      toast() {}, copy: n => ({ getUrl: () => 'https://exemplo/' + n })
    }),
    newDataValidation: () => ({ requireValueInList() { return this; }, build() { return {}; } })
  };
  const ctx = {
    SpreadsheetApp, console,
    LockService: { getScriptLock: () => ({ waitLock() { if (state.lockBusy) throw new Error('Lock timeout'); }, releaseLock() {} }) },
    Utilities: {
      getUuid: () => require('crypto').randomUUID(),
      formatDate: (d, tz, f) => { const p = n => String(n).padStart(2, '0'); const x = new Date(d.getTime() + state.clock);
        return f === 'yyyy-MM-dd' ? `${x.getFullYear()}-${p(x.getMonth() + 1)}-${p(x.getDate())}` :
          f === 'HH:mm' ? `${p(x.getHours())}:${p(x.getMinutes())}` :
          `${x.getFullYear()}-${p(x.getMonth() + 1)}-${p(x.getDate())} ${p(x.getHours())}:${p(x.getMinutes())}:${p(x.getSeconds())}`; },
      computeDigest: (alg, s) => Array.from(require('crypto').createHash('sha256').update(String(s), 'utf8').digest()).map(b => (b > 127 ? b - 256 : b)),
      DigestAlgorithm: { SHA_256: 'SHA_256' }, Charset: { UTF_8: 'UTF_8' },
      base64Decode: s => Array.from(Buffer.from(s, 'base64')),
      newBlob: (bytes, type, name) => { const b = { bytes, type, name, copyBlob() { return Object.assign({}, b); }, setName(n) { b.name = n; return b; } }; return b; }
    },
    Session: { getScriptTimeZone: () => 'America/Fortaleza', getEffectiveUser: () => ({ getEmail: () => 'organizador@exemplo.com' }) },
    MailApp: {
      getRemainingDailyQuota: () => state.quota,
      sendEmail: m => {
        if (state.failSend) throw new Error(state.failMsg);
        if (state.quota <= 0) throw new Error('Service invoked too many times for one day: email.');
        state.quota--; sent.push(typeof m === 'string' ? { to: arguments[0] } : m);
      }
    },
    PropertiesService: { getScriptProperties: () => ({ getProperty: k => props[k] ?? null, setProperty: (k, v) => { props[k] = v; } }) },
    ScriptApp: {
      getProjectTriggers: () => state.triggers.map(n => ({ getHandlerFunction: () => n })),
      deleteTrigger(t) { state.triggers = state.triggers.filter(n => n !== t.getHandlerFunction()); },
      newTrigger: n => ({ timeBased() { return this; }, everyMinutes() { return this; }, everyDays() { return this; }, atHour() { return this; }, create() { state.triggers.push(n); } })
    },
    ContentService: { createTextOutput: s => ({ s, setMimeType() { return this; } }), MimeType: { JSON: 'json' } }
  };
  // MailApp.sendEmail aceita (to, subject, body) também
  ctx.MailApp.sendEmail = (function (orig) {
    return function (a, b, c) {
      if (typeof a === 'string') return orig({ to: a, subject: b, body: c });
      return orig(a);
    };
  })(ctx.MailApp.sendEmail);
  vm.createContext(ctx);
  const dir = path.join(__dirname, '..', 'apps-script');
  const files = ['Qrcode.gs', 'Versao.gs', 'Logo.gs', 'Migracao.gs', 'Config.gs', 'Db.gs', 'Setup.gs', 'Inscricao.gs', 'Atividades.gs', 'Email.gs', 'Scanner.gs', 'Painel.gs', 'AdminApi.gs', 'Api.gs', 'Admin.gs'];
  vm.runInContext(files.map(f => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n;\n'), ctx, { filename: 'appscript.js' });
  return { ctx, sheets, sent, state, props, run: code => vm.runInContext(code, ctx) };
}
module.exports = { makeEnv };
