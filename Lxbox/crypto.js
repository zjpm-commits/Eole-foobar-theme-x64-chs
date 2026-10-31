/* ==========================================================================
   NetMusic — 纯 JS 密码学与字节工具
   供洛雪音源脚本运行时（lx.utils）使用。全部同步实现：
   脚本里的 md5()/aesEncrypt() 都是同步调用，不能换成 WebCrypto。

   导出：
     NM.crypto.md5 / sha256 / sha1 / randomBytes / aesEncrypt / aesDecrypt
     NM.bytes.utf8Encode / utf8Decode / toHex / fromHex / toBase64 / fromBase64
     NM.buffer.from / bufToString / concat
   ========================================================================== */
(function (global) {
  'use strict';

  var NM = global.NM = global.NM || {};

  /* ------------------------- UTF-8 ------------------------- */
  var _enc = global.TextEncoder ? new global.TextEncoder() : null;
  var _dec = global.TextDecoder ? new global.TextDecoder('utf-8') : null;

  function utf8Encode(str) {
    str = String(str == null ? '' : str);
    if (_enc) return _enc.encode(str);
    // 手写兜底（WebView2 里一定走得到 TextEncoder）
    var out = [];
    for (var i = 0; i < str.length; i++) {
      var c = str.charCodeAt(i);
      if (c < 0x80) out.push(c);
      else if (c < 0x800) out.push(0xc0 | (c >> 6), 0x80 | (c & 63));
      else if (c >= 0xd800 && c <= 0xdbff) {
        var c2 = str.charCodeAt(++i);
        var cp = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);
        out.push(0xf0 | (cp >> 18), 0x80 | ((cp >> 12) & 63), 0x80 | ((cp >> 6) & 63), 0x80 | (cp & 63));
      } else out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
    }
    return new Uint8Array(out);
  }

  function utf8Decode(bytes) {
    bytes = toBytes(bytes);
    if (_dec) return _dec.decode(bytes);
    var s = '';
    for (var i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
    try { return decodeURIComponent(escape(s)); } catch (e) { return s; }
  }

  /* ------------------------- 字节转换 ------------------------- */
  function toBytes(input) {
    if (input == null) return new Uint8Array(0);
    if (input instanceof Uint8Array) return input;
    if (input instanceof ArrayBuffer) return new Uint8Array(input);
    if (ArrayBuffer.isView(input)) return new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
    if (typeof input === 'string') return utf8Encode(input);
    if (Array.isArray(input)) return new Uint8Array(input);
    return utf8Encode(String(input));
  }

  function toHex(bytes) {
    bytes = toBytes(bytes);
    var s = '';
    for (var i = 0; i < bytes.length; i++) s += (bytes[i] < 16 ? '0' : '') + bytes[i].toString(16);
    return s;
  }

  function fromHex(hex) {
    hex = String(hex || '').replace(/[^0-9a-fA-F]/g, '');
    var n = hex.length >> 1;
    var out = new Uint8Array(n);
    for (var i = 0; i < n; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
    return out;
  }

  var B64CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

  function toBase64(bytes) {
    bytes = toBytes(bytes);
    var out = '';
    for (var i = 0; i < bytes.length; i += 3) {
      var b0 = bytes[i], b1 = bytes[i + 1], b2 = bytes[i + 2];
      out += B64CHARS[b0 >> 2];
      out += B64CHARS[((b0 & 3) << 4) | ((b1 || 0) >> 4)];
      out += (i + 1 < bytes.length) ? B64CHARS[((b1 & 15) << 2) | ((b2 || 0) >> 6)] : '=';
      out += (i + 2 < bytes.length) ? B64CHARS[b2 & 63] : '=';
    }
    return out;
  }

  function fromBase64(b64) {
    b64 = String(b64 || '').replace(/[^A-Za-z0-9+/=]/g, '');
    var pad = 0;
    if (b64.slice(-1) === '=') pad++;
    if (b64.slice(-2, -1) === '=') pad++;
    var len = (b64.length >> 2) * 3 - pad;
    var out = new Uint8Array(Math.max(0, len));
    var p = 0;
    for (var i = 0; i < b64.length; i += 4) {
      var n = (B64CHARS.indexOf(b64[i]) << 18) |
              (B64CHARS.indexOf(b64[i + 1]) << 12) |
              ((B64CHARS.indexOf(b64[i + 2]) & 63) << 6) |
              (B64CHARS.indexOf(b64[i + 3]) & 63);
      if (p < out.length) out[p++] = (n >> 16) & 255;
      if (p < out.length) out[p++] = (n >> 8) & 255;
      if (p < out.length) out[p++] = n & 255;
    }
    return out;
  }

  /* ------------------------- MD5 ------------------------- */
  var MD5_K = new Int32Array([
    0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee, 0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
    0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be, 0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
    0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa, 0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
    0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed, 0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
    0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c, 0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
    0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05, 0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
    0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039, 0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
    0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1, 0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391
  ]);
  var MD5_S = [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21];

  function md5Bytes(input) {
    var bytes = toBytes(input);
    var len = bytes.length;
    var blocks = (((len + 8) >> 6) + 1) * 64;
    var buf = new Uint8Array(blocks);
    buf.set(bytes);
    buf[len] = 0x80;
    var dv = new DataView(buf.buffer);
    dv.setUint32(blocks - 8, (len << 3) >>> 0, true);
    dv.setUint32(blocks - 4, Math.floor(len / 0x20000000), true);

    var a0 = 0x67452301, b0 = 0xefcdab89 | 0, c0 = 0x98badcfe | 0, d0 = 0x10325476;

    for (var off = 0; off < blocks; off += 64) {
      var M = new Int32Array(16);
      for (var i = 0; i < 16; i++) M[i] = dv.getInt32(off + i * 4, true);
      var A = a0, B = b0, C = c0, D = d0;
      for (var j = 0; j < 64; j++) {
        var F, g;
        if (j < 16) { F = (B & C) | (~B & D); g = j; }
        else if (j < 32) { F = (D & B) | (~D & C); g = (5 * j + 1) & 15; }
        else if (j < 48) { F = B ^ C ^ D; g = (3 * j + 5) & 15; }
        else { F = C ^ (B | ~D); g = (7 * j) & 15; }
        var tmp = D;
        D = C;
        C = B;
        var sum = (A + F + MD5_K[j] + M[g]) | 0;
        var s = MD5_S[(j >> 4) * 4 + (j & 3)];
        B = (B + ((sum << s) | (sum >>> (32 - s)))) | 0;
        A = tmp;
      }
      a0 = (a0 + A) | 0; b0 = (b0 + B) | 0; c0 = (c0 + C) | 0; d0 = (d0 + D) | 0;
    }

    var out = new Uint8Array(16);
    var odv = new DataView(out.buffer);
    odv.setUint32(0, a0 >>> 0, true);
    odv.setUint32(4, b0 >>> 0, true);
    odv.setUint32(8, c0 >>> 0, true);
    odv.setUint32(12, d0 >>> 0, true);
    return out;
  }

  function md5(input) { return toHex(md5Bytes(input)); }

  /* ------------------------- SHA-256 ------------------------- */
  var SHA256_K = new Int32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ]);

  function rotr(x, n) { return (x >>> n) | (x << (32 - n)); }

  function sha256Bytes(input) {
    var bytes = toBytes(input);
    var len = bytes.length;
    var blocks = Math.ceil((len + 9) / 64) * 64;
    var buf = new Uint8Array(blocks);
    buf.set(bytes);
    buf[len] = 0x80;
    var dv = new DataView(buf.buffer);
    dv.setUint32(blocks - 8, Math.floor(len / 0x20000000), false);
    dv.setUint32(blocks - 4, (len << 3) >>> 0, false);

    var H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    var W = new Int32Array(64);

    for (var off = 0; off < blocks; off += 64) {
      for (var i = 0; i < 16; i++) W[i] = dv.getInt32(off + i * 4, false);
      for (i = 16; i < 64; i++) {
        var s0 = rotr(W[i - 15], 7) ^ rotr(W[i - 15], 18) ^ (W[i - 15] >>> 3);
        var s1 = rotr(W[i - 2], 17) ^ rotr(W[i - 2], 19) ^ (W[i - 2] >>> 10);
        W[i] = (W[i - 16] + s0 + W[i - 7] + s1) | 0;
      }
      var a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
      for (i = 0; i < 64; i++) {
        var S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
        var ch = (e & f) ^ (~e & g);
        var t1 = (h + S1 + ch + SHA256_K[i] + W[i]) | 0;
        var S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
        var maj = (a & b) ^ (a & c) ^ (b & c);
        var t2 = (S0 + maj) | 0;
        h = g; g = f; f = e; e = (d + t1) | 0;
        d = c; c = b; b = a; a = (t1 + t2) | 0;
      }
      H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0;
      H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
    }

    var out = new Uint8Array(32);
    var odv = new DataView(out.buffer);
    for (i = 0; i < 8; i++) odv.setUint32(i * 4, H[i] >>> 0, false);
    return out;
  }

  /* ------------------------- SHA-1 ------------------------- */
  function sha1Bytes(input) {
    var bytes = toBytes(input);
    var len = bytes.length;
    var blocks = Math.ceil((len + 9) / 64) * 64;
    var buf = new Uint8Array(blocks);
    buf.set(bytes);
    buf[len] = 0x80;
    var dv = new DataView(buf.buffer);
    dv.setUint32(blocks - 8, Math.floor(len / 0x20000000), false);
    dv.setUint32(blocks - 4, (len << 3) >>> 0, false);

    var H = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0];
    var W = new Int32Array(80);
    for (var off = 0; off < blocks; off += 64) {
      for (var i = 0; i < 16; i++) W[i] = dv.getInt32(off + i * 4, false);
      for (i = 16; i < 80; i++) {
        var w = W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16];
        W[i] = (w << 1) | (w >>> 31);
      }
      var a = H[0], b = H[1], c = H[2], d = H[3], e = H[4];
      for (i = 0; i < 80; i++) {
        var f, k;
        if (i < 20) { f = (b & c) | (~b & d); k = 0x5a827999; }
        else if (i < 40) { f = b ^ c ^ d; k = 0x6ed9eba1; }
        else if (i < 60) { f = (b & c) | (b & d) | (c & d); k = 0x8f1bbcdc; }
        else { f = b ^ c ^ d; k = 0xca62c1d6; }
        var t = (((a << 5) | (a >>> 27)) + f + e + k + W[i]) | 0;
        e = d; d = c; c = (b << 30) | (b >>> 2); b = a; a = t;
      }
      H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0; H[2] = (H[2] + c) | 0;
      H[3] = (H[3] + d) | 0; H[4] = (H[4] + e) | 0;
    }
    var out = new Uint8Array(20);
    var odv = new DataView(out.buffer);
    for (i = 0; i < 5; i++) odv.setUint32(i * 4, H[i] >>> 0, false);
    return out;
  }

  /* ------------------------- AES ------------------------- */
  function rotl8(x, n) { return ((x << n) | (x >>> (8 - n))) & 0xff; }

  var SBOX = new Uint8Array(256);
  var INV_SBOX = new Uint8Array(256);
  (function buildSBox() {
    var p = 1, q = 1;
    do {
      p = (p ^ ((p << 1) & 0xff) ^ ((p & 0x80) ? 0x1b : 0)) & 0xff;
      q ^= (q << 1) & 0xff;
      q ^= (q << 2) & 0xff;
      q ^= (q << 4) & 0xff;
      if (q & 0x80) q ^= 0x09;
      q &= 0xff;
      var x = (q ^ rotl8(q, 1) ^ rotl8(q, 2) ^ rotl8(q, 3) ^ rotl8(q, 4)) & 0xff;
      SBOX[p] = (x ^ 0x63) & 0xff;
    } while (p !== 1);
    SBOX[0] = 0x63;
    for (var i = 0; i < 256; i++) INV_SBOX[SBOX[i]] = i;
  })();

  function xtime(b) { return ((b << 1) ^ ((b & 0x80) ? 0x1b : 0)) & 0xff; }
  function gmul(a, b) {
    var p = 0;
    for (var i = 0; i < 8; i++) {
      if (b & 1) p ^= a;
      var hi = a & 0x80;
      a = (a << 1) & 0xff;
      if (hi) a ^= 0x1b;
      b >>= 1;
    }
    return p & 0xff;
  }

  function expandKey(key) {
    var Nk = key.length / 4;
    if (Nk !== 4 && Nk !== 6 && Nk !== 8) throw new Error('AES 密钥长度必须是 16/24/32 字节');
    var Nr = Nk + 6;
    var w = new Uint8Array(16 * (Nr + 1));
    w.set(key);
    var rcon = 1;
    for (var i = Nk; i < 4 * (Nr + 1); i++) {
      var t = w.slice((i - 1) * 4, i * 4);
      if (i % Nk === 0) {
        t = new Uint8Array([SBOX[t[1]] ^ rcon, SBOX[t[2]], SBOX[t[3]], SBOX[t[0]]]);
        rcon = xtime(rcon);
      } else if (Nk > 6 && i % Nk === 4) {
        t = new Uint8Array([SBOX[t[0]], SBOX[t[1]], SBOX[t[2]], SBOX[t[3]]]);
      }
      for (var j = 0; j < 4; j++) w[i * 4 + j] = w[(i - Nk) * 4 + j] ^ t[j];
    }
    return { w: w, Nr: Nr };
  }

  function addRoundKey(s, w, round) {
    for (var i = 0; i < 16; i++) s[i] ^= w[round * 16 + i];
  }
  function subBytes(s) { for (var i = 0; i < 16; i++) s[i] = SBOX[s[i]]; }
  function invSubBytes(s) { for (var i = 0; i < 16; i++) s[i] = INV_SBOX[s[i]]; }

  function shiftRows(s) {
    var t = Uint8Array.from(s);
    for (var r = 1; r < 4; r++) {
      for (var c = 0; c < 4; c++) s[r + 4 * c] = t[r + 4 * ((c + r) & 3)];
    }
  }
  function invShiftRows(s) {
    var t = Uint8Array.from(s);
    for (var r = 1; r < 4; r++) {
      for (var c = 0; c < 4; c++) s[r + 4 * ((c + r) & 3)] = t[r + 4 * c];
    }
  }
  function mixColumns(s) {
    for (var c = 0; c < 4; c++) {
      var i = c * 4;
      var a0 = s[i], a1 = s[i + 1], a2 = s[i + 2], a3 = s[i + 3];
      s[i]     = xtime(a0) ^ (xtime(a1) ^ a1) ^ a2 ^ a3;
      s[i + 1] = a0 ^ xtime(a1) ^ (xtime(a2) ^ a2) ^ a3;
      s[i + 2] = a0 ^ a1 ^ xtime(a2) ^ (xtime(a3) ^ a3);
      s[i + 3] = (xtime(a0) ^ a0) ^ a1 ^ a2 ^ xtime(a3);
    }
  }
  function invMixColumns(s) {
    for (var c = 0; c < 4; c++) {
      var i = c * 4;
      var a0 = s[i], a1 = s[i + 1], a2 = s[i + 2], a3 = s[i + 3];
      s[i]     = gmul(a0, 14) ^ gmul(a1, 11) ^ gmul(a2, 13) ^ gmul(a3, 9);
      s[i + 1] = gmul(a0, 9) ^ gmul(a1, 14) ^ gmul(a2, 11) ^ gmul(a3, 13);
      s[i + 2] = gmul(a0, 13) ^ gmul(a1, 9) ^ gmul(a2, 14) ^ gmul(a3, 11);
      s[i + 3] = gmul(a0, 11) ^ gmul(a1, 13) ^ gmul(a2, 9) ^ gmul(a3, 14);
    }
  }

  function encryptBlock(block, ks) {
    var s = Uint8Array.from(block);
    addRoundKey(s, ks.w, 0);
    for (var round = 1; round < ks.Nr; round++) {
      subBytes(s); shiftRows(s); mixColumns(s); addRoundKey(s, ks.w, round);
    }
    subBytes(s); shiftRows(s); addRoundKey(s, ks.w, ks.Nr);
    return s;
  }

  function decryptBlock(block, ks) {
    var s = Uint8Array.from(block);
    addRoundKey(s, ks.w, ks.Nr);
    for (var round = ks.Nr - 1; round > 0; round--) {
      invShiftRows(s); invSubBytes(s); addRoundKey(s, ks.w, round); invMixColumns(s);
    }
    invShiftRows(s); invSubBytes(s); addRoundKey(s, ks.w, 0);
    return s;
  }

  function normalizeKeyLike(key, name) {
    if (key == null) key = '';
    if (typeof key === 'string') {
      if (/^[0-9a-fA-F]{32}$/.test(key)) return fromHex(key);
      if (/^[0-9a-fA-F]{48}$/.test(key)) return fromHex(key);
      if (/^[0-9a-fA-F]{64}$/.test(key)) return fromHex(key);
      return utf8Encode(key);
    }
    return toBytes(key);
  }

  function parseMode(mode) {
    var m = String(mode || 'cbc').toLowerCase();
    if (m.indexOf('ecb') >= 0) return 'ecb';
    return 'cbc';
  }

  function pkcs7Pad(bytes, block) {
    var pad = block - (bytes.length % block);
    var out = new Uint8Array(bytes.length + pad);
    out.set(bytes);
    for (var i = 0; i < pad; i++) out[bytes.length + i] = pad;
    return out;
  }
  function pkcs7Unpad(bytes) {
    if (!bytes.length) return bytes;
    var pad = bytes[bytes.length - 1];
    if (pad < 1 || pad > 16 || pad > bytes.length) return bytes;
    return bytes.subarray(0, bytes.length - pad);
  }

  /**
   * @param {string|Uint8Array} data
   * @param {string} mode  'ecb' | 'cbc'（也接受 'aes-128-ecb' 这类写法）
   * @param {string|Uint8Array} key
   * @param {string|Uint8Array} iv
   * @returns {ArrayBuffer} 密文
   */
  function aesEncrypt(data, mode, key, iv) {
    var m = parseMode(mode);
    var k = normalizeKeyLike(key);
    if (k.length !== 16 && k.length !== 24 && k.length !== 32) {
      // 常见退化：16 字符口令被当成 UTF-8 后长度正确；其余情况补零到 16
      var tmp = new Uint8Array(16);
      tmp.set(k.subarray(0, Math.min(16, k.length)));
      k = tmp;
    }
    var ks = expandKey(k);
    var input = pkcs7Pad(toBytes(data), 16);
    var out = new Uint8Array(input.length);
    var prev = m === 'cbc' ? (iv && toBytes(iv).length ? toBytes(iv) : new Uint8Array(16)) : null;
    if (prev && prev.length !== 16) prev = new Uint8Array(16);
    for (var off = 0; off < input.length; off += 16) {
      var block = input.subarray(off, off + 16);
      if (m === 'cbc') {
        var x = new Uint8Array(16);
        for (var i = 0; i < 16; i++) x[i] = block[i] ^ prev[i];
        var enc = encryptBlock(x, ks);
        out.set(enc, off);
        prev = enc;
      } else {
        out.set(encryptBlock(block, ks), off);
      }
    }
    return out.buffer;
  }

  function aesDecrypt(data, mode, key, iv) {
    var m = parseMode(mode);
    var k = normalizeKeyLike(key);
    if (k.length !== 16 && k.length !== 24 && k.length !== 32) {
      var tmp = new Uint8Array(16);
      tmp.set(k.subarray(0, Math.min(16, k.length)));
      k = tmp;
    }
    var ks = expandKey(k);
    var input = Uint8Array.from(toBytes(data));
    input = input.subarray(0, input.length - (input.length % 16));
    var out = new Uint8Array(input.length);
    var prev = m === 'cbc' ? (iv && toBytes(iv).length ? toBytes(iv) : new Uint8Array(16)) : null;
    if (prev && prev.length !== 16) prev = new Uint8Array(16);
    for (var off = 0; off < input.length; off += 16) {
      var block = input.subarray(off, off + 16);
      var dec = decryptBlock(block, ks);
      if (m === 'cbc') {
        for (var i = 0; i < 16; i++) out[off + i] = dec[i] ^ prev[i];
        prev = block;
      } else {
        out.set(dec, off);
      }
    }
    var unp = pkcs7Unpad(out);
    return unp.buffer.slice(unp.byteOffset, unp.byteOffset + unp.byteLength);
  }

  /* ------------------------- 随机数 ------------------------- */
  function randomBytes(n) {
    var out = new Uint8Array(n | 0);
    if (global.crypto && global.crypto.getRandomValues) global.crypto.getRandomValues(out);
    else for (var i = 0; i < out.length; i++) out[i] = (Math.random() * 256) | 0;
    return asBuffer(out);
  }

  /* 让字节数组看起来像 Node Buffer：脚本里 buf.toString('hex'|'base64') 到处都在用 */
  function asBuffer(bytes) {
    if (!bytes || typeof bytes !== 'object') return bytes;
    if (typeof bytes.toString === 'function' && bytes.__nmBuffer) return bytes;
    try {
      Object.defineProperty(bytes, '__nmBuffer', { value: true, enumerable: false });
      Object.defineProperty(bytes, 'toString', {
        value: function (enc) {
          if (!enc || enc === 'utf8' || enc === 'utf-8') return utf8Decode(bytes);
          return bufToString(bytes, enc);
        },
        enumerable: false
      });
    } catch (e) {}
    return bytes;
  }

  /* ------------------------- buffer 工具 ------------------------- */
  function bufFrom(data, encoding) {
    if (typeof data === 'string') {
      var e = String(encoding || 'utf-8').toLowerCase();
      if (e === 'base64') return asBuffer(fromBase64(data));
      if (e === 'hex') return asBuffer(fromHex(data));
      if (e === 'binary' || e === 'latin1') {
        var b = new Uint8Array(data.length);
        for (var i = 0; i < data.length; i++) b[i] = data.charCodeAt(i) & 0xff;
        return asBuffer(b);
      }
      return asBuffer(utf8Encode(data));
    }
    return asBuffer(toBytes(data));
  }

  function bufToString(buf, format) {
    var f = String(format || 'utf-8').toLowerCase();
    if (f === 'hex') return toHex(buf);
    if (f === 'base64') return toBase64(buf);
    if (f === 'binary' || f === 'latin1') {
      var b = toBytes(buf), s = '';
      for (var i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
      return s;
    }
    return utf8Decode(buf);
  }

  function bufConcat(list) {
    var arrs = (list || []).map(toBytes);
    var total = 0;
    for (var i = 0; i < arrs.length; i++) total += arrs[i].length;
    var out = new Uint8Array(total);
    var off = 0;
    for (i = 0; i < arrs.length; i++) { out.set(arrs[i], off); off += arrs[i].length; }
    return asBuffer(out);
  }

  /* ------------------------- 导出 ------------------------- */
  NM.bytes = {
    utf8Encode: utf8Encode,
    utf8Decode: utf8Decode,
    toBytes: toBytes,
    toHex: toHex,
    fromHex: fromHex,
    toBase64: toBase64,
    fromBase64: fromBase64
  };

  NM.crypto = {
    md5: md5,
    md5Bytes: md5Bytes,
    sha1: function (x) { return toHex(sha1Bytes(x)); },
    sha256: function (x) { return toHex(sha256Bytes(x)); },
    sha256Bytes: sha256Bytes,
    randomBytes: randomBytes,
    aesEncrypt: aesEncrypt,
    aesDecrypt: aesDecrypt
  };

  NM.buffer = {
    from: bufFrom,
    bufToString: bufToString,
    concat: bufConcat
  };
})(window);
