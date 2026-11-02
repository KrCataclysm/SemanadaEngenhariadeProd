// Verifica que o QR gerado (e-mail/tela) é lido pelo decodificador do scanner, mesmo reduzido e com ruído leve.
const assert = require('assert'), qrcode = require('../inscricao/vendor/qrcode.js'), jsQR = require('../scanner/vendor/jsQR.js');
const token = require('crypto').randomBytes(16).toString('hex');
const qr = qrcode(0, 'M'); qr.addData(token); qr.make();
for (const px of [3, 5, 8]) {
  const n = qr.getModuleCount(), m = 4, W = (n + 2 * m) * px, data = new Uint8ClampedArray(W * W * 4).fill(255);
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c))
    for (let y = 0; y < px; y++) for (let x = 0; x < px; x++) { const i = (((r + m) * px + y) * W + (c + m) * px + x) * 4; data[i] = data[i + 1] = data[i + 2] = 0; }
  const out = jsQR(data, W, W); assert(out && out.data === token, 'falhou com ' + px + 'px');
}
console.log('decode ok (3, 5 e 8 px por módulo)');
