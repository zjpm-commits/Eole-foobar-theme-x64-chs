// bridge.js —— Lxbox 在线桥（精简版，系统 Node 运行，无第三方依赖）
// 职责：加载 profile\Lxbox\resources 下的洛雪音源脚本，播放时现场取直链并 302 重定向。
// 显示靠 m3u8 的 #EXTINF（面板生成），不再注入 ID3。
//
//   GET  /lx/status?k=KEY                      探活
//   POST /lx/register?k=KEY                    登记曲目 {tracks:[{key,source,musicInfo}]}
//   GET  /lx/play/<key>?k=KEY&q=QUALITY        取链并 302 重定向到直链
//   GET  /lx/shutdown?k=KEY                    退出
//
'use strict'
const http = require('http')
const https = require('https')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

let DATA = '', SOURCES = '', KEY = '', PORT = 38518
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i]
  if (a === '--data') DATA = process.argv[++i]
  else if (a === '--key') KEY = process.argv[++i]
  else if (a === '--sources') SOURCES = process.argv[++i]
  else if (a === '--port') PORT = parseInt(process.argv[++i], 10) || 38518
}
if (!DATA || !KEY || !SOURCES) { console.error('usage: bridge.js --data <dir> --key <key> --sources <dir> --port <port>'); process.exit(2) }

function log(level, msg) {
  const line = '[' + new Date().toISOString() + '] [' + level + '] ' + msg
  try { fs.appendFileSync(path.join(DATA, 'bridge.log'), line + '\n') } catch (e) {}
  if (level === 'err') console.error(line)
}

/* ============ lx 宿主 shim（按音源脚本实际用到的 API 面） ============ */
const HANDLERS = {}
let INITED = false

function bufFrom(data, enc) {
  if (Buffer.isBuffer(data)) return data
  try { return enc ? Buffer.from(String(data), enc) : Buffer.from(String(data)) } catch (e) { return Buffer.alloc(0) }
}
function bufToString(buf, enc) {
  if (!Buffer.isBuffer(buf)) buf = bufFrom(buf)
  return buf.toString(enc || 'utf8')
}
function md5(data) { return crypto.createHash('md5').update(bufFrom(data)).digest('hex') }
function aesEn(data, mode, key, iv, outEnc) {
  const k = Buffer.isBuffer(key) ? key : Buffer.from(String(key), 'hex')
  const v = iv == null ? null : (Buffer.isBuffer(iv) ? iv : Buffer.from(String(iv), 'hex'))
  const c = crypto.createCipheriv(String(mode).toLowerCase(), k, v)
  const b = Buffer.concat([c.update(bufFrom(data)), c.final()])
  return outEnc ? b.toString(outEnc) : b
}
function aesDe(data, mode, key, iv, outEnc) {
  const k = Buffer.isBuffer(key) ? key : Buffer.from(String(key), 'hex')
  const v = iv == null ? null : (Buffer.isBuffer(iv) ? iv : Buffer.from(String(iv), 'hex'))
  const input = Buffer.isBuffer(data) ? data : Buffer.from(String(data), 'base64')
  const c = crypto.createDecipheriv(String(mode).toLowerCase(), k, v)
  const b = Buffer.concat([c.update(input), c.final()])
  return outEnc ? b.toString(outEnc) : b
}
function rsaEncrypt(data, key) {
  let pem = String(key)
  if (!pem.includes('-----BEGIN')) pem = '-----BEGIN PUBLIC KEY-----\n' + pem + '\n-----END PUBLIC KEY-----'
  return crypto.publicEncrypt({ key: pem, padding: crypto.constants.RSA_PKCS1_PADDING }, bufFrom(data))
}
function httpRequest(url, opt, cb) {
  if (typeof url === 'object') { cb = opt; opt = url; url = opt.url }
  opt = opt || {}
  const done = (err, resp) => { try { cb(err, resp) } catch (e) {} }
  try {
    const mod = url.startsWith('https') ? https : http
    const headers = Object.assign({}, opt.headers || {})
    let body = null
    if (opt.body != null) body = Buffer.isBuffer(opt.body) ? opt.body
      : (typeof opt.body === 'string' ? opt.body : JSON.stringify(opt.body))
    if (opt.form) {
      body = Object.keys(opt.form).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(opt.form[k])).join('&')
      headers['Content-Type'] = headers['Content-Type'] || 'application/x-www-form-urlencoded'
    }
    if (body && !headers['Content-Length']) headers['Content-Length'] = Buffer.byteLength(body)
    const req = mod.request(url, {
      method: (opt.method || 'GET').toUpperCase(), headers,
      timeout: opt.timeout || 15000
    }, res => {
      const parts = []
      res.on('data', c => parts.push(c))
      res.on('end', () => done(null, { statusCode: res.statusCode, headers: res.headers, body: Buffer.concat(parts).toString('utf8') }))
    })
    req.on('timeout', () => req.destroy(new Error('请求超时')))
    req.on('error', e => done(e, { statusCode: 0, headers: {}, body: '' }))
    if (body) req.write(body)
    req.end()
    return req
  } catch (e) { done(e, { statusCode: 0, headers: {}, body: '' }); return null }
}

const LX = {
  EVENT_NAMES: { request: 'request', inited: 'inited', updateAlert: 'updateAlert' },
  env: 'desktop',
  version: '2.0.0',
  currentScriptInfo: { name: '', version: '', author: '', description: '', homepage: '', rawScript: '' },
  on(name, fn) { HANDLERS[name] = fn },
  send(name, data) { if (name === LX.EVENT_NAMES.inited) INITED = data },
  request: httpRequest,
  utils: {
    buffer: { from: bufFrom, bufToString },
    crypto: {
      md5,
      randomBytes: n => crypto.randomBytes(n),
      aesEn, aesDe, rsaEncrypt,
      rsaDecrypt(data, key) { return null },
      misc: {}
    }
  },
  str2b64(s) { return Buffer.from(String(s), 'utf8').toString('base64') },
  b64str2buf(s) { return Buffer.from(String(s), 'base64') }
}
globalThis.lx = LX
globalThis.window = globalThis
globalThis.document = { currentScript: { textContent: '' }, createElement: () => ({ style: {} }), addEventListener() {} }
try { if (!globalThis.navigator) globalThis.navigator = { userAgent: 'lx-bridge' } } catch (e) { /* Node>=21 navigator 只读，跳过 */ }

/* ============ 音源脚本加载 ============ */
const runtimes = []
function loadSources() {
  let files = []
  try { files = fs.readdirSync(SOURCES).filter(f => f.toLowerCase().endsWith('.js')) } catch (e) { log('err', '音源目录读取失败：' + e.message); return }
  files.forEach(f => {
    const file = path.join(SOURCES, f)
    if (/bridge|install/i.test(f)) return
    try {
      const code = fs.readFileSync(file, 'utf8')
      const rt = { name: f.replace(/\.js$/i, ''), file, status: 'init', error: '', sources: {}, failCount: 0, coolUntil: 0 }
      LX.currentScriptInfo.name = rt.name
      LX.currentScriptInfo.rawScript = code
      HANDLERS[LX.EVENT_NAMES.request] = null
      // 每个脚本隔离执行：request handler 逐个登记
      const localHandlers = {}
      const lxForScript = Object.create(LX)
      lxForScript.on = (n, fn) => { localHandlers[n] = fn }
      lxForScript.currentScriptInfo = Object.assign({}, LX.currentScriptInfo)
      globalThis.lx = lxForScript
      new Function('window', 'document', 'navigator', 'globalThis', code)(globalThis, globalThis.document, globalThis.navigator, globalThis)
      globalThis.lx = LX
      if (localHandlers[LX.EVENT_NAMES.request]) {
        rt.handler = localHandlers[LX.EVENT_NAMES.request]
        rt.sources = (INITED && typeof INITED === 'object' && INITED.info) ? {} : {}
        const info = INITED
        if (info && info.sources) rt.sources = info.sources
        rt.status = 'ok'
      } else {
        rt.status = 'no-handler'
        rt.error = '脚本未注册 request 处理器'
      }
      log('info', `音源 ${rt.name}：${rt.status}${rt.sources && Object.keys(rt.sources).length ? '（' + Object.keys(rt.sources).join(',') + '）' : ''}`)
      runtimes.push(rt)
    } catch (e) {
      log('err', `音源 ${f} 加载失败：${e.message}`)
      runtimes.push({ name: f.replace(/\.js$/i, ''), file, status: 'error', error: e.message, sources: {}, failCount: 0, coolUntil: 0 })
    }
  })
}
loadSources()

/* ============ 取链（排队 + 并发合并 + 故障冷却） ============ */
const RESOLVE_MAX = 4
const resolveQueue = []
let resolveActive = 0
function resolveSlot(task) {
  return new Promise((done, fail) => { resolveQueue.push({ task, done, fail }); pump() })
}
function pump() {
  while (resolveActive < RESOLVE_MAX && resolveQueue.length) {
    const job = resolveQueue.shift()
    resolveActive++
    job.task().then(job.done, job.fail).finally(() => { resolveActive--; pump() })
  }
}
const sleep = ms => new Promise(r => setTimeout(r, ms))
const withTimeout = (p, ms, tag) => Promise.race([
  p,
  new Promise((_, rej) => setTimeout(() => rej(new Error(tag + ' 请求超时(' + ms + 'ms)')), ms))
])
const resolveCache = new Map()   // rkey -> {url, q, script, at}
const inflight = new Map()       // rkey -> Promise

function scriptSources(rt, source) {
  const s = rt.sources && rt.sources[source]
  return s && typeof s === 'object' ? s : null
}
function orderedRuntimes(source) {
  return runtimes.filter(rt => rt.status === 'ok' && scriptSources(rt, source))
}
function buildChain(rt, source, wanted) {
  const s = scriptSources(rt, source)
  const qs = Object.keys(s || {})
  const chain = []
  if (wanted && qs.includes(wanted)) chain.push(wanted)
  // 降级链：从高到低，排除已加的
  const order = ['flac24bit', 'hires', 'flac', '320k', '128k']
  for (const q of order) if (!chain.includes(q) && qs.includes(q)) chain.push(q)
  if (!chain.length && qs.length) chain.push(qs[0])
  return chain
}
async function invokeMusicUrl(rt, source, musicInfo, q) {
  const p = rt.handler({ source, action: 'musicUrl', info: { musicInfo, type: q } })
  return Promise.resolve(p)
}
const encryptedExt = u => (/\.(\w{3,6})$/i.exec((u.split('?')[0])) || [])[1]
  ? ((/^(flac|mp3|m4a|aac|wav|ape|ogg|wma)$/i.test(RegExp.$1)) ? '' : RegExp.$1.toLowerCase())
  : ''

/* 网易官方兜底：不依赖第三方音源脚本。
   fee=8 的免费/限免曲目可直接拿到 320k 直链；fee=1 的数字专辑/会员曲目
   官方接口也会返回 url:null，此时再交给脚本换源。 */
function nativeWyUrl(musicInfo, wanted) {
  const id = musicInfo && (musicInfo.songmid || musicInfo.id || musicInfo.songId || musicInfo.musicId || '')
  if (!id || !/^\d+$/.test(String(id))) return Promise.resolve(null)
  const q = wanted || 'auto'
  const br = q === '128k' ? 128000 : (q === '192k' ? 192000 : 320000)
  const label = q === '128k' ? '128k' : (q === '192k' ? '192k' : '320k')
  const url = 'https://music.163.com/api/song/enhance/player/url?ids=%5B' + encodeURIComponent(String(id)) + '%5D&br=' + br
  return new Promise(ok => {
    httpRequest(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
        'Referer': 'https://music.163.com/',
        'Cookie': 'appver=2.0.2; os=pc'
      },
      timeout: 8000
    }, (err, resp) => {
      if (err || !resp || resp.statusCode !== 200) return ok(null)
      try {
        const j = JSON.parse(resp.body)
        const d = (j && j.data && j.data[0]) || null
        if (d && d.code === 200 && typeof d.url === 'string' && /^https?:/i.test(d.url) && !d.freeTrialInfo) {
          return ok({ url: d.url, q: label, script: '网易官方', at: Date.now() })
        }
      } catch (e) { /* 非 JSON，按无直链处理 */ }
      ok(null)
    })
  })
}

/* 部分 fee=1 数字专辑/会员曲目官方接口不给直链，用公开 Meting 接口做最后兜底。
   只探测前 4 字节，确认返回的是音频再交给 foobar，避免把 503/HTML 当歌播。 */
async function metingWyUrl(musicInfo) {
  const id = musicInfo && (musicInfo.songmid || musicInfo.id || musicInfo.songId || musicInfo.musicId || '')
  if (!id || !/^\d+$/.test(String(id))) return null
  const apis = [
    'https://api.qijieya.cn/meting/?type=url&id=' + encodeURIComponent(String(id)),
    'https://api.injahow.cn/meting/?type=url&id=' + encodeURIComponent(String(id))
  ]
  for (const api of apis) {
    try {
      const pr = await fetchRange(api, 'bytes=0-3')
      const ct = String((pr && pr.headers && pr.headers['content-type']) || '')
      const code = pr && pr.statusCode
      try { if (pr) pr.destroy() } catch (e) {}
      if ((code === 200 || code === 206) && /audio\/|octet-stream/i.test(ct)) return api
      log('warn', 'Meting 未返回音频（' + code + ' ' + ct + '）：' + api)
    } catch (e) {
      log('warn', 'Meting 探测失败：' + ((e && e.message) || e))
    }
  }
  return null
}

async function resolveOne(source, musicInfo, wanted) {
  const id = musicInfo && (musicInfo.songmid || musicInfo.hash || musicInfo.rid || musicInfo.id ||
    musicInfo.songId || musicInfo.musicId || musicInfo.copyrightId || '')
  const rkey = source + '|' + id + '|' + (wanted || 'auto')
  const hit = resolveCache.get(rkey)
  if (hit && Date.now() - hit.at < 600000) return hit
  if (inflight.has(rkey)) return inflight.get(rkey)

  // 网易先用官方接口，成功就不必再等第三方脚本
  if (source === 'wy') {
    try {
      const nat = await nativeWyUrl(musicInfo, wanted)
      if (nat) {
        resolveCache.set(rkey, nat)
        log('ok', `取链成功 网易官方 ${nat.q}：${nat.url.slice(0, 100)}`)
        return nat
      }
      const met = await metingWyUrl(musicInfo)
      if (met) {
        const res = { url: met, q: '320k', script: 'Meting', at: Date.now() }
        resolveCache.set(rkey, res)
        log('ok', '取链成功 Meting 320k：' + met)
        return res
      }
      log('info', '网易官方/Meting 无直链，转音源脚本：' + id)
    } catch (e) {
      log('warn', '网易官方取链失败：' + ((e && e.message) || e))
    }
  }

  let list = orderedRuntimes(source).filter(rt => !(rt.coolUntil > Date.now()))
  if (!list.length) list = orderedRuntimes(source)
  if (!list.length) throw new Error('没有可用音源脚本支持 ' + source)

  const tried = []
  const work = async () => {
    for (const rt of list) {
      for (const q of buildChain(rt, source, wanted)) {
        try {
          const raw = await withTimeout(Promise.resolve(invokeMusicUrl(rt, source, musicInfo, q)).then(r => r), 18000, rt.name)
          const u = typeof raw === 'string' ? raw : (raw && raw.url)
          if (typeof u !== 'string' || !/^https?:\/\//i.test(u)) throw new Error('未返回有效直链')
          const res = { url: u, q, script: rt.name, at: Date.now() }
          resolveCache.set(rkey, res)
          rt.failCount = 0
          log('ok', `取链成功 ${rt.name} ${q}：${u.slice(0, 100)}`)
          return res
        } catch (e) {
          tried.push(rt.name + '[' + q + ']：' + ((e && e.message) || e))
          log('warn', '取链失败 ' + rt.name + ' ' + q + '：' + ((e && e.message) || e))
          rt.failCount = (rt.failCount || 0) + 1
          if (rt.failCount >= 6) { rt.coolUntil = Date.now() + 180000; log('info', rt.name + ' 连续失败 ' + rt.failCount + ' 次，冷却 3 分钟') }
          await sleep(800)
        }
      }
    }
    throw new Error('所有脚本都取链失败。' + tried.join('；'))
  }
  const totalMs = 45000
  const deadline = new Promise((_, rej) => setTimeout(() => rej(new Error('所有脚本都取链失败。' + tried.join('；'))), totalMs))
  const p = resolveSlot(() => Promise.race([deadline, work()])).finally(() => inflight.delete(rkey))
  inflight.set(rkey, p)
  return p
}

/* ============ 曲目登记 ============ */
const known = new Map()   // key -> { source, musicInfo, title, artist, album, pic }
const KNOWN_FILE = path.join(DATA, 'songs.json')
try {
  const j = JSON.parse(fs.readFileSync(KNOWN_FILE, 'utf8'))
  if (j && typeof j === 'object') for (const k of Object.keys(j)) known.set(k, j[k])
  log('info', '登记表载入：' + known.size + ' 条')
} catch (e) { /* 首次运行 */ }
let knownDirty = false
setInterval(() => {
  if (!knownDirty) return
  knownDirty = false
  try {
    const o = {}
    for (const [k, v] of known) o[k] = v
    fs.writeFileSync(KNOWN_FILE, JSON.stringify(o))
  } catch (e) {}
}, 3000).unref()

/* ============ ID3 注入（MP3 流播显示元数据的关键） ============ */
const tagCache = new Map()
function ss(buf, pos, n) { buf[pos] = (n >>> 21) & 0x7f; buf[pos + 1] = (n >>> 14) & 0x7f; buf[pos + 2] = (n >>> 7) & 0x7f; buf[pos + 3] = n & 0x7f }
function id3Text(id, val) {
  if (val == null || String(val).trim() === '') return null
  const b = Buffer.from(String(val), 'utf8')
  const h = Buffer.alloc(10)
  h.write(id, 0, 'latin1')
  h.writeUInt32BE(b.length + 1, 4)
  return Buffer.concat([h, Buffer.from([0x03]), b])
}
async function id3Tag(key) {
  if (tagCache.has(key)) return tagCache.get(key)
  const rec = known.get(key) || {}
  const frames = [id3Text('TIT2', rec.title), id3Text('TPE1', rec.artist), id3Text('TALB', rec.album)].filter(Boolean)
  if (rec.pic) {
    try {
      const jpg = await new Promise((ok, fail) => {
        const mod = rec.pic.startsWith('https') ? https : http
        const rq = mod.get(rec.pic, { headers: { 'User-Agent': 'Mozilla/5.0 (lx-bridge)' }, timeout: 8000 }, rs => {
          const ps = []; rs.on('data', c => ps.push(c)); rs.on('end', () => ok(Buffer.concat(ps))); rs.on('error', fail)
        })
        rq.on('timeout', () => rq.destroy(new Error('timeout')))
        rq.on('error', fail)
      })
      if (jpg.length > 100) {
        const mime = jpg[0] === 0x89 && jpg[1] === 0x50 ? 'image/png' : 'image/jpeg'
        const body = Buffer.concat([Buffer.from([0]), Buffer.from(mime + '\0\x03\0', 'latin1'), jpg])
        const h = Buffer.alloc(10)
        h.write('APIC', 0, 'latin1')
        h.writeUInt32BE(body.length, 4)
        frames.push(Buffer.concat([h, body]))
        try { fs.mkdirSync(path.join(DATA, 'art'), { recursive: true }); fs.writeFileSync(path.join(DATA, 'art', key.replace(/[^\w.-]/g, '_') + '.jpg'), jpg) } catch (e) {}
      }
    } catch (e) { /* 无封面 */ }
  }
  if (!frames.length) return Buffer.alloc(0)
  const body = Buffer.concat(frames)
  const head = Buffer.alloc(10)
  head.write('ID3', 0, 'latin1')
  head[3] = 4; head[4] = 0; head[5] = 0
  ss(head, 6, body.length)
  const tag = Buffer.concat([head, body])
  tagCache.set(key, tag)
  if (tagCache.size > 128) tagCache.delete(tagCache.keys().next().value)
  return tag
}
function fetchRange(url, range, depth) {
  depth = depth || 0
  return new Promise((ok, fail) => {
    const mod = url.startsWith('https') ? https : http
    const req = mod.get(url, { headers: Object.assign({ 'User-Agent': 'Mozilla/5.0 (lx-bridge)' }, range ? { Range: range } : {}) }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && depth < 5) {
        res.resume()
        let next = res.headers.location
        try { next = new URL(next, url).toString() } catch (e) {}
        return ok(fetchRange(next, range, depth + 1))
      }
      ok(res)
    })
    req.on('error', fail)
    req.setTimeout(15000, () => req.destroy(new Error('timeout')))
  })
}
const streamCache = new Map()   // key -> {url,size,kind,at}
async function playReq(key, q, req, res) {
  // 解析：现取直链（resolveOne 内有排队/缓存/换源）
  const rec = known.get(key)
  if (!rec) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end('unknown key'); return }
  let sc = streamCache.get(key)
  if (!sc || Date.now() - sc.at > 600000) {
    try {
      const r = await resolveOne(rec.source, rec.musicInfo, q)
      sc = { url: r.url, size: 0, kind: '', at: Date.now() }
      // 探头：真实类型从字节看
      const pr = await fetchRange(r.url, 'bytes=0-3')
      const head = await new Promise(ok => {
        const c = [], done = () => { try { pr.destroy() } catch (e) {} ; ok(Buffer.concat(c)) }
        pr.on('data', b => { c.push(b); if (Buffer.concat(c).length >= 4) done() })
        pr.on('end', done); pr.on('error', done)
      })
      let sc2 = { url: r.url, size: 0, kind: '', at: Date.now() }
      if (pr.statusCode === 206 || pr.statusCode === 200) {
        const cr = /\/(\d+)$/.exec(pr.headers['content-range'] || '')
        sc2.size = cr ? +cr[1] : pr.statusCode === 200 ? +(pr.headers['content-length'] || 0) : 0
        sc2.kind = head.subarray(0, 4).toString('latin1') === 'fLaC' ? 'flac'
          : head.subarray(0, 3).toString('latin1') === 'ID3' || (head[0] === 0xff && (head[1] & 0xe0) === 0xe0) ? 'mp3' : ''
      } else {
        // 部分上游（如 kwstream）对探头请求回 400，但对真实播放请求（带 Range/UA）是放行的
        // → 不判死，记空探测，落到下面的 302 直连兜底
        log('warn', '上游拒探头 ' + pr.statusCode + '，转直连：' + r.url.slice(0, 100))
      }
      streamCache.set(key, sc2)
      if (streamCache.size > 256) streamCache.delete(streamCache.keys().next().value)
      if (streamCache.size > 256) streamCache.delete(streamCache.keys().next().value)
    } catch (e) {
      log('err', '播放失败 ' + key + '：' + ((e && e.message) || e))
      res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' })
      res.end(JSON.stringify({ error: (e && e.message) || String(e) }))
      return
    }
  }
  // FLAC 等非 MP3：原样 302（fb 会读到流里的真实标签）
  if (sc.kind !== 'mp3' || !sc.size) {
    res.writeHead(302, { Location: sc.url }); res.end(); return
  }
  // MP3：代理流并前置 ID3
  const tag = await id3Tag(key)
  const T = tag.length, N = T + sc.size
  const m = /bytes=(\d*)-(\d*)/.exec(req.headers.range || '')
  let a = 0, b = N - 1
  if (m) {
    if (m[1] === '') a = Math.max(0, N - +m[2])
    else { a = +m[1]; if (m[2]) b = Math.min(+m[2], N - 1) }
  }
  if (a > b || a >= N) { res.writeHead(416, { 'Content-Range': 'bytes */' + N }); res.end(); return }
  res.writeHead(m ? 206 : 200, {
    'Content-Type': 'audio/mpeg',
    'Accept-Ranges': 'bytes', 'Content-Length': b - a + 1,
    ...(m ? { 'Content-Range': `bytes ${a}-${b}/${N}` } : {})
  })
  if (req.method === 'HEAD') { res.end(); return }
  if (a < T) res.write(tag.subarray(a, Math.min(b + 1, T)))
  if (b < T) { res.end(); return }
  const up = await fetchRange(sc.url, `bytes=${Math.max(a, T) - T}-${b - T}`)
  if (up.statusCode !== 206 && up.statusCode !== 200) { up.resume(); streamCache.delete(key); res.destroy(); return }
  up.pipe(res)
  req.on('close', () => { try { up.destroy() } catch (e) {} })
}

/* ============ HTTP 服务 ============ */
function readBody(req) {
  return new Promise(ok => {
    const parts = []
    req.on('data', c => parts.push(c))
    req.on('end', () => ok(Buffer.concat(parts).toString('utf8')))
    req.on('error', () => ok(''))
  })
}
function followRedirect(url, depth, cb) {
  depth = depth || 0
  const mod = url.startsWith('https') ? https : http
  const req = mod.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (lx-bridge)' } }, res => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && depth < 5) {
      res.resume()
      let next = res.headers.location
      try { next = new URL(next, url).toString() } catch (e) {}
      return followRedirect(next, depth + 1, cb)
    }
    res.destroy()
    cb(res.statusCode)
  })
  req.on('error', () => cb(0))
  req.setTimeout(15000, () => req.destroy(new Error('timeout')))
}

const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://x')
  try {
    if (u.searchParams.get('k') !== KEY) { res.writeHead(403); res.end('bad key'); return }
    if (u.pathname === '/lx/status') {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
      res.end(JSON.stringify({
        ok: true, port: PORT,
        scripts: runtimes.map(r => ({ name: r.name, status: r.status, error: r.error })),
        known: known.size
      }))
      return
    }
    if (u.pathname === '/lx/register') {
      const body = JSON.parse((await readBody(req)) || '{}')
      const arr = Array.isArray(body.tracks) ? body.tracks : []
      let n = 0
      for (const t of arr) {
        if (!t || !t.key || !t.source || !t.musicInfo) continue
        known.set(t.key, {
          source: t.source, musicInfo: t.musicInfo,
          title: t.title || '', artist: t.artist || '', album: t.album || '', pic: t.pic || ''
        })
        n++
      }
      if (n) knownDirty = true
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
      res.end(JSON.stringify({ ok: true, registered: n }))
      log('info', '登记 ' + n + ' 首')
      return
    }
    const mPlay = /^\/lx\/play\/(.+)$/.exec(u.pathname)
    if (mPlay) {
      await playReq(decodeURIComponent(mPlay[1]), u.searchParams.get('q') || '', req, res)
      return
    }
    if (u.pathname === '/lx/shutdown') {
      res.writeHead(200); res.end('bye')
      log('info', '收到 shutdown，退出')
      setTimeout(() => process.exit(0), 200)
      return
    }
    res.writeHead(404); res.end('not found')
  } catch (e) {
    log('err', u.pathname + '：' + ((e && e.message) || e))
    try { res.writeHead(502); res.end(JSON.stringify({ error: (e && e.message) || String(e) })) } catch (e2) {}
  }
})
process.on('uncaughtException', e => log('err', 'uncaught: ' + ((e && e.stack) || e)))
process.on('unhandledRejection', e => log('err', 'rejection: ' + ((e && e.stack) || e)))
server.listen(PORT, '127.0.0.1', () => {
  log('ok', `bridge on ${PORT}，音源目录 ${SOURCES}`)
  console.log(`bridge on ${PORT}`)
})
server.on('error', e => {
  if (e && e.code === 'EADDRINUSE') { log('info', '端口已被占用：已有实例在运行，本实例退出'); process.exit(0); return }
  log('err', 'listen error: ' + ((e && e.message) || e))
  process.exit(1)
})
