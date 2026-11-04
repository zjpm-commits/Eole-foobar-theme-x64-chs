/* ==========================================================================
   JSplitter — 宿主桥 & 洛雪音源运行时

   本文件是 JSplitter 环境下的实现，要点：
     - HTTP 走 utils.HTTPRequestAsync（组件只提供 GET/POST）
     - 脚本发现/读取走 utils.Glob + utils.ReadTextFile
     - 没有 document / fetch，执行音源脚本时给一个最小 document 影子对象
     - 不做直链字节嗅探（组件拿不到二进制响应），只校验 URL 形状

   仍然保持洛雪（LX Music）脚本协议：
     globalThis.lx = { EVENT_NAMES, request, on, send, utils, env, version }
     on('request', ({ action, source, info }) => Promise<url>)
     send('inited', { status: true, sources: { tx: { qualitys: [...] } } })
   ========================================================================== */
(function (global) {
  'use strict';

  var NM = global.NM = global.NM || {};

  /* JSplitter v4 里 window 是宿主 API 对象，不一定是全局对象本身。
     fb 这类宿主全局要用裸名字取，不能写 global.fb。 */
  var HOST_FB = null;
  try { if (typeof fb !== 'undefined' && fb) HOST_FB = fb; } catch (e) {}
  if (!HOST_FB) { try { if (global.fb) HOST_FB = global.fb; } catch (e) {} }
  if (!HOST_FB) HOST_FB = {};

  var UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
         + '(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

  /* ======================================================================
     1. HTTP：utils.HTTPRequestAsync → Promise
     ====================================================================== */
  var pending = Object.create(null);

  function headersJson(h) {
    var out = {};
    if (h) {
      Object.keys(h).forEach(function (k) {
        if (h[k] != null) out[k] = String(h[k]);
      });
    }
    var lower = Object.keys(out).map(function (k) { return k.toLowerCase(); });
    if (lower.indexOf('user-agent') < 0) out['User-Agent'] = UA;
    return JSON.stringify(out);
  }

  function parseHeaderText(raw) {
    if (!raw) return {};
    if (typeof raw === 'object') return raw;
    try {
      var j = JSON.parse(String(raw));
      return j && typeof j === 'object' ? j : {};
    } catch (e) {
      return {};
    }
  }

  function hostRequest(opt) {
    return new Promise(function (resolve, reject) {
      var method = String(opt.method || 'GET').toUpperCase();
      var type = method === 'POST' ? 1 : 0;
      var body = opt.body;
      if (body != null && typeof body !== 'string') {
        try { body = JSON.stringify(body); } catch (e) { body = String(body); }
      }
      var id;
      try {
        id = utils.HTTPRequestAsync(type, String(opt.url), headersJson(opt.headers),
                                    body == null ? '' : String(body));
      } catch (e) {
        reject(e);
        return;
      }
      var ms = opt.timeout > 0 ? opt.timeout : 20000;
      var timer = setTimeout(function () {
        if (!pending[id]) return;
        delete pending[id];
        reject(new Error('请求超时（' + Math.round(ms / 1000) + 's）'));
      }, ms + 5000);
      pending[id] = {
        resolve: resolve, reject: reject, timer: timer,
        url: String(opt.url),
        range: !!(opt.headers && (opt.headers.Range || opt.headers.range))
      };
    });
  }

  /* JSplitter v4 里 window 是宿主 API 对象，不一定是全局对象本身；
     回调与全局变量要同时挂到 window 和真正的 globalThis 上。 */
  function publish(name, value) {
    try { global[name] = value; } catch (e) {}
    try {
      if (typeof globalThis !== 'undefined' && globalThis !== global) globalThis[name] = value;
    } catch (e) {}
  }

  function onHttpRequestDone(task_id, success, response_text, status, response_headers) {
    var slot = pending[task_id];
    if (!slot) return;
    delete pending[task_id];
    clearTimeout(slot.timer);

    var code = status || 0;
    var text = response_text == null ? '' : String(response_text);
    var ok2xx = code >= 200 && code <= 299;

    /* JSplitter 对 206（Range 分段响应）会把 success 报成 false，但正文其实是好的。
       音源的二进制探测（Range: bytes=0-63）和部分 CDN 直链都走 206，这里按 2xx 放行。 */
    if (!success && !(ok2xx && (text.length > 0 || slot.range))) {
      var extra = slot.url ? '，URL：' + slot.url.slice(0, 160) : '';
      slot.reject(new Error('HTTP 请求失败（状态 ' + code + extra + '）'));
      return;
    }

    slot.resolve({
      status: code,
      headers: parseHeaderText(response_headers),
      body: text,
      range: !!slot.range
    });
  }

  /* 组件回调：必须能按裸名字被宿主找到 */
  publish('on_http_request_done', onHttpRequestDone);

  /* ======================================================================
     1b. 下载：utils.DownloadFileAsync → Promise（先缓存再播放）
     ====================================================================== */
  var downloads = Object.create(null);

  function onDownloadFileDone(file_path, success, error_text) {
    var key = String(file_path || '').toLowerCase();
    var slot = downloads[key];
    if (!slot) return;
    delete downloads[key];
    clearTimeout(slot.timer);
    if (success) {
      slot.resolve(String(file_path));
      return;
    }
    slot.reject(new Error(String(error_text || '下载失败')));
  }

  publish('on_download_file_done', onDownloadFileDone);

  function downloadFile(url, dest, timeout) {
    return new Promise(function (resolve, reject) {
      var key = String(dest || '').toLowerCase();
      if (!key) {
        reject(new Error('缓存路径为空'));
        return;
      }
      if (downloads[key]) {
        clearTimeout(downloads[key].timer);
        downloads[key].reject(new Error('同一路径正在下载'));
        delete downloads[key];
      }

      var ms = timeout > 0 ? timeout : 180000;
      var timer = setTimeout(function () {
        if (!downloads[key]) return;
        delete downloads[key];
        reject(new Error('下载超时（' + Math.round(ms / 1000) + 's）'));
      }, ms + 5000);

      downloads[key] = { resolve: resolve, reject: reject, timer: timer };
      try {
        utils.DownloadFileAsync(String(url), String(dest));
      } catch (e) {
        delete downloads[key];
        clearTimeout(timer);
        reject(e);
      }
    });
  }

  /* ======================================================================
     1c. 二进制探测：curl + ReadBinaryFile
     音源脚本的 guardMedia 要用真实文件头（fLaC / ID3 / MPEG 帧头）判断质量，
     而 HTTPRequestAsync 只返回文本，0xFF 这类高位字节会被替换掉，
     于是报 "guard: unknown magic"。这里用系统自带 curl 取回原始字节。
     ====================================================================== */
  var probeSeq = 0;
  var probeTasks = Object.create(null);

  function probeDir() {
    var base = trimSlash(NM.moduleDir || '');
    if (!base) {
      try { base = trimSlash(HOST_FB.ProfilePath || '') + 'LX-probe'; } catch (e) { base = ''; }
    }
    if (!base) return '';
    var dir = base + '\\.probe';
    try { utils.CreateFolder(dir); } catch (e) {}
    return dir;
  }

  function curlExe() {
    var sys = 'C:\\Windows\\System32\\curl.exe';
    try { if (utils.FileExists(sys)) return sys; } catch (e) {}
    return 'curl.exe';
  }

  /* curl -D 的输出可能有多段（重定向/100 Continue），取最后一段 */
  function parseCurlHeaders(text) {
    var out = { status: 0, headers: {} };
    if (!text) return out;
    var blocks = String(text).replace(/\r\n/g, '\n').split('\n\n');
    for (var i = blocks.length - 1; i >= 0; i--) {
      var lines = blocks[i].split('\n').filter(function (l) { return l.trim() !== ''; });
      if (!lines.length) continue;
      var m = /^HTTP\/\d(?:\.\d)?\s+(\d{3})/.exec(lines[0]);
      if (!m) continue;
      out.status = Number(m[1]);
      for (var j = 1; j < lines.length; j++) {
        var k = lines[j].indexOf(':');
        if (k <= 0) continue;
        out.headers[lines[j].slice(0, k).trim().toLowerCase()] = lines[j].slice(k + 1).trim();
      }
      break;
    }
    return out;
  }

  function encodeUrl(u) {
    u = String(u || '');
    return /[^\x00-\x7F]/.test(u) ? encodeURI(u) : u;
  }

  function binaryProbe(url, headers, timeout) {
    return new Promise(function (resolve, reject) {
      var dir = probeDir();
      if (!dir) {
        reject(new Error('没有可用的探测临时目录'));
        return;
      }

      var stamp = Date.now().toString(36) + '_' + (++probeSeq);
      var bodyPath = dir + '\\p' + stamp + '.bin';
      var headPath = dir + '\\p' + stamp + '.hdr';

      var range = '';
      var extra = [];
      Object.keys(headers || {}).forEach(function (k) {
        var v = headers[k];
        if (v == null) return;
        var lower = String(k).toLowerCase();
        if (lower === 'range') { range = String(v); return; }
        if (lower === 'user-agent') return;
        extra.push('-H');
        extra.push(k + ': ' + v);
      });
      range = String(range || 'bytes=0-63').replace(/^bytes\s*=\s*/i, '');

      var ms = timeout > 0 ? timeout : 15000;
      var args = ['-s', '-L', '--max-time', String(Math.max(5, Math.round(ms / 1000))),
                  '-r', range, '-o', bodyPath, '-D', headPath, '-A', UA]
                 .concat(extra);
      args.push(encodeUrl(url));

      var taskId;
      try {
        taskId = utils.RunCmdAsync(curlExe(), args, '', 0, ms + 5000);
      } catch (e) {
        reject(e);
        return;
      }

      var timer = setTimeout(function () {
        if (!probeTasks[taskId]) return;
        delete probeTasks[taskId];
        reject(new Error('探测超时'));
      }, ms + 8000);

      probeTasks[taskId] = {
        bodyPath: bodyPath, headPath: headPath, resolve: resolve, reject: reject, timer: timer
      };
    });
  }

  function onRunCmdAsyncDone(task_id, success, exit_code, stdout, stderr) {
    /* 通用命令（写标签等）：main.js 通过 NM.sys.run 注册 */
    var cmd = cmdTasks[task_id];
    if (cmd) {
      delete cmdTasks[task_id];
      clearTimeout(cmd.timer);
      cmd.resolve({
        success: !!success,
        exitCode: exit_code,
        stdout: stdout == null ? '' : String(stdout),
        stderr: stderr == null ? '' : String(stderr)
      });
      return;
    }

    var slot = probeTasks[task_id];
    if (!slot) return;
    delete probeTasks[task_id];
    clearTimeout(slot.timer);

    var body = null;
    var headText = '';
    try { body = utils.ReadBinaryFile(slot.bodyPath); } catch (e) {}
    try { headText = utils.ReadTextFile(slot.headPath); } catch (e) {}
    try { utils.RemovePath(slot.bodyPath); } catch (e) {}
    try { utils.RemovePath(slot.headPath); } catch (e) {}

    if (!success) {
      slot.reject(new Error('curl 失败（exit ' + exit_code + '）' +
        (stderr ? '：' + String(stderr).slice(0, 120) : '')));
      return;
    }
    if (!body || !body.length) {
      slot.reject(new Error('curl 没有返回内容'));
      return;
    }

    var head = parseCurlHeaders(headText);
    slot.resolve({
      statusCode: head.status || 200,
      status: head.status || 200,
      headers: head.headers,
      body: body,
      raw: body
    });
  }

  publish('on_run_cmd_async_done', onRunCmdAsyncDone);

  /* ======================================================================
     1d. 通用命令执行：utils.RunCmdAsync → Promise
     写标签用的 tools\lx_tag.ps1 走这里。
     ====================================================================== */
  var cmdTasks = Object.create(null);

  function runCmd(exe, args, timeout) {
    return new Promise(function (resolve, reject) {
      var ms = timeout > 0 ? timeout : 30000;
      var id;
      try {
        id = utils.RunCmdAsync(String(exe), args || [], '', 0, ms);
      } catch (e) {
        reject(e);
        return;
      }
      var timer = setTimeout(function () {
        if (!cmdTasks[id]) return;
        delete cmdTasks[id];
        reject(new Error('命令超时（' + Math.round(ms / 1000) + 's）'));
      }, ms + 8000);
      cmdTasks[id] = { resolve: resolve, reject: reject, timer: timer };
    });
  }

  NM.sys = { run: runCmd };

  /* 宽松 JSON 解析：容忍 JSONP、单引号对象、BOM */
  function singleToJson(src) {
    var out = '', i = 0, inStr = false, q = '';
    while (i < src.length) {
      var c = src[i];
      if (inStr) {
        if (c === '\\') {
          var n = src[i + 1];
          if (n === "'") { out += "'"; i += 2; continue; }
          if (n === '"') { out += '\\"'; i += 2; continue; }
          out += c + (n == null ? '' : n);
          i += 2;
          continue;
        }
        if (c === q) { out += '"'; inStr = false; i++; continue; }
        if (c === '"') { out += '\\"'; i++; continue; }
        if (c === '\n') { out += '\\n'; i++; continue; }
        if (c === '\r') { i++; continue; }
        out += c; i++; continue;
      }
      if (c === "'" || c === '"') { inStr = true; q = c; out += '"'; i++; continue; }
      out += c; i++;
    }
    return out;
  }

  var ENTITIES = { '&nbsp;': ' ', '&amp;': '&', '&quot;': '"', '&#39;': "'", '&apos;': "'", '&lt;': '<', '&gt;': '>' };
  function decodeEntities(s) {
    return String(s == null ? '' : s).replace(/&(nbsp|amp|quot|#39|apos|lt|gt);/g, function (m) {
      return ENTITIES[m] != null ? ENTITIES[m] : m;
    });
  }

  function parseLoose(text, status) {
    var s = String(text == null ? '' : text).replace(/^\uFEFF/, '').trim();
    if (!s) throw new Error('接口返回空内容（HTTP ' + (status || '?') + '）');
    try { return JSON.parse(s); } catch (e) {}
    var m = /^[\w$.]+\s*\(([\s\S]*)\)\s*;?$/.exec(s);
    if (m) { try { return JSON.parse(m[1]); } catch (e) {} }
    if (s.charAt(0) === '{' || s.charAt(0) === '[') {
      try { return JSON.parse(singleToJson(s)); } catch (e) {}
    }
    throw new Error('返回不是 JSON（HTTP ' + (status || '?') + '）');
  }

  function getJson(url, opt) {
    opt = opt || {};
    return hostRequest({
      url: url,
      method: opt.method || 'GET',
      headers: opt.headers,
      body: opt.body,
      timeout: opt.timeout || 15000
    }).then(function (r) {
      return parseLoose(r.body, r.status);
    });
  }

  /* probe：只取前 64 字节（Range），用来判断这个直链到底是不是音频。
     走 curl（二进制安全），不走文本请求 —— 0xFF 这类高位字节会被替换掉。 */
  NM.http = { request: hostRequest, getJson: getJson,
    probe: function (url, ms) { return binaryProbe(url, null, ms); } };
  NM.text = { parseLoose: parseLoose, decodeEntities: decodeEntities };

  /* ======================================================================
     2. lx 运行时
     ====================================================================== */
  var EVENT_NAMES = { request: 'request', inited: 'inited', updateAlert: 'updateAlert' };
  var RUNTIME_VERSION = '2.11.0';

  var lxUtils = {
    crypto: {
      md5: function (x) { return NM.crypto.md5(x); },
      sha1: function (x) { return NM.crypto.sha1(x); },
      sha256: function (x) { return NM.crypto.sha256(x); },
      randomBytes: function (n) { return NM.crypto.randomBytes(n); },
      aesEncrypt: function (data, mode, key, iv) { return NM.crypto.aesEncrypt(data, mode, key, iv); },
      aesDecrypt: function (data, mode, key, iv) { return NM.crypto.aesDecrypt(data, mode, key, iv); }
    },
    buffer: {
      from: function (data, enc) { return NM.buffer.from(data, enc); },
      bufToString: function (buf, fmt) { return NM.buffer.bufToString(buf, fmt); },
      concat: function (list) { return NM.buffer.concat(list); }
    },
    str2b64: function (str) { return NM.bytes.toBase64(NM.bytes.utf8Encode(str)); },
    b64Decode: function (b64) { return NM.bytes.utf8Decode(NM.bytes.fromBase64(b64)); }
  };

  /* 音源脚本偶尔会直接用 Node 的 Buffer；要挂到真正全局，脚本里的裸 Buffer 才找得到 */
  var hasBuffer = false;
  try { hasBuffer = typeof Buffer !== 'undefined'; } catch (e) {}
  if (!hasBuffer) {
    publish('Buffer', {
      from: function (data, enc) { return lxUtils.buffer.from(data, enc); },
      alloc: function (n) { return NM.buffer.from(new Uint8Array(n | 0)); },
      allocUnsafe: function (n) { return NM.buffer.from(new Uint8Array(n | 0)); },
      concat: function (list) { return lxUtils.buffer.concat(list); },
      isBuffer: function (b) { return b instanceof Uint8Array; },
      byteLength: function (s) { return NM.bytes.utf8Encode(String(s)).length; }
    });
  }

  var logs = [];
  var changeHandlers = [];

  function pushLog(kind, text) {
    var item = { t: Date.now(), kind: kind, text: String(text == null ? '' : text) };
    logs.push(item);
    if (logs.length > 200) logs.shift();
    try { console.log('[LX][' + kind + '] ' + item.text); } catch (e) {}
  }

  function notifyChange() {
    changeHandlers.slice().forEach(function (fn) {
      try { fn(); } catch (e) { pushLog('warn', 'change handler 异常：' + (e && e.message)); }
    });
  }

  function onChange(fn) {
    if (typeof fn === 'function') changeHandlers.push(fn);
  }

  function parseHeader(code) {
    var info = { name: '', description: '', version: '', author: '', homepage: '' };
    var m = /^\s*\/\*!?([\s\S]*?)\*\//.exec(String(code || ''));
    if (!m) return info;
    var block = m[1];
    var map = {
      name: /@name\s+(.+)/,
      description: /@description\s+(.+)/,
      version: /@version\s+(.+)/,
      author: /@author\s+(.+)/,
      homepage: /@homepage\s+(.+)|@repository\s+(.+)/
    };
    Object.keys(map).forEach(function (k) {
      var mm = map[k].exec(block);
      if (mm) info[k] = String(mm[1] || mm[2] || '').trim();
    });
    return info;
  }

  function normalizeHeaders(h) {
    var out = {};
    if (!h) return out;
    Object.keys(h).forEach(function (k) {
      if (h[k] != null) out[k] = String(h[k]);
    });
    var lower = Object.keys(out).map(function (k) { return k.toLowerCase(); });
    if (lower.indexOf('user-agent') < 0) out['User-Agent'] = UA;
    return out;
  }

  function encodeForm(obj) {
    return Object.keys(obj).map(function (k) {
      return encodeURIComponent(k) + '=' + encodeURIComponent(obj[k] == null ? '' : obj[k]);
    }).join('&');
  }

  /* lx.request(url, options, callback) —— 同时支持回调和 Promise */
  function lxRequest(url, options, callback) {
    var cb = null;
    var opt = {};
    if (typeof options === 'function') cb = options;
    else if (options && typeof options === 'object') opt = options;
    if (typeof callback === 'function') cb = callback;

    var method = String(opt.method || 'GET').toUpperCase();
    var headers = normalizeHeaders(opt.headers);
    var body = opt.body;

    if (opt.form && typeof opt.form === 'object') {
      body = encodeForm(opt.form);
      if (!headers['Content-Type']) headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }
    if (body && typeof body === 'object') {
      try { body = JSON.stringify(body); } catch (e) {}
      if (!headers['Content-Type']) headers['Content-Type'] = 'application/json';
    }

    var timeout = opt.timeout > 0 ? opt.timeout : 20000;

    var hasRange = Object.keys(headers).some(function (k) {
      return k.toLowerCase() === 'range';
    });
    var binary = opt.responseType === 'arraybuffer' || opt.responseType === 'binary' ||
                 opt.binary === true || hasRange;

    function textRequest() {
      return hostRequest({
        url: url,
        method: method,
        headers: headers,
        body: body,
        timeout: timeout
      }).then(function (r) {
        return {
          statusCode: r.status,
          status: r.status,
          headers: r.headers || {},
          body: r.body,
          raw: r.body
        };
      });
    }

    var p = binary
      ? binaryProbe(url, headers, timeout).catch(function (e) {
          pushLog('warn', '二进制探测失败，回退文本请求：' + ((e && e.message) || e));
          return textRequest();
        })
      : textRequest();

    if (cb) {
      /* 回调按 LX Music 的老签名给三个参数：(err, resp, body)。
         有些脚本写的是 `request(url, opt, (err, resp, body) => {
           resp.body = body; ... })`，只传两个参数时 body 是 undefined，
          resp.body 会被覆盖成 undefined，后面 JSON.parse 直接抛错 ——
          「安妮独家音源 v5」就是这样整个平台取不到链的。 */
      p.then(function (r) {
        try { cb(null, r, r && r.body); } catch (e) { pushLog('err', '回调异常：' + e.message); }
      }, function (e) {
        try { cb(e); } catch (e2) { pushLog('err', '回调异常：' + e2.message); }
      });
    }
    return p;
  }

  function createRuntime(file, code) {
    var head = parseHeader(code);
    var handlers = Object.create(null);
    var runtime = {
      id: file,
      file: file,
      name: head.name || file.replace(/\.js$/i, ''),
      description: head.description || '',
      version: head.version || '',
      author: head.author || '',
      homepage: head.homepage || '',
      status: 'loading',
      error: '',
      sources: null,
      qualitys: {},
      loadedAt: 0
    };

    var lx = {
      EVENT_NAMES: EVENT_NAMES,
      env: { platform: 'win32', os: 'windows', appVersion: RUNTIME_VERSION },
      version: RUNTIME_VERSION,
      currentScriptInfo: {
        name: runtime.name,
        description: runtime.description,
        version: runtime.version,
        author: runtime.author,
        homepage: runtime.homepage,
        rawScript: String(code || '')
      },
      utils: lxUtils,
      request: lxRequest,
      on: function (evt, fn) {
        if (typeof fn !== 'function') return;
        (handlers[evt] || (handlers[evt] = [])).push(fn);
      },
      send: function (evt, data) {
        if (evt === EVENT_NAMES.inited) {
          var ok = data && data.status !== false && data.sources && Object.keys(data.sources).length > 0;
          if (ok) {
            runtime.sources = data.sources;
            runtime.qualitys = {};
            Object.keys(data.sources).forEach(function (k) {
              runtime.qualitys[k] = (data.sources[k].qualitys || []).slice();
            });
            runtime.status = 'ok';
            runtime.error = '';
            pushLog('ok', runtime.name + ' 初始化完成：' + Object.keys(data.sources).join(', '));
            notifyChange();
          } else {
            runtime.status = 'error';
            runtime.error = (data && data.message) || '脚本报告初始化失败';
            pushLog('err', runtime.name + ' 初始化失败：' + runtime.error);
            notifyChange();
          }
          runtime.loadedAt = Date.now();
          return;
        }
        if (evt === EVENT_NAMES.updateAlert) {
          pushLog('info', runtime.name + ' 提示：' + JSON.stringify(data || {}));
        }
      }
    };

    runtime.lx = lx;

    var doc = {
      currentScript: {
        textContent: String(code || ''),
        src: '',
        getAttribute: function () { return null; }
      },
      createElement: function () { return { textContent: '', style: {} }; },
      getElementsByTagName: function () { return []; },
      querySelector: function () { return null; }
    };

    try {
      global.lx = lx;
      /* 每个脚本都换成自己的 document 影子，脚本读 currentScript 时才能拿到自己的源码 */
      global.document = doc;
      var fn = new Function('lx', 'globalThis', 'window', 'document', String(code || ''));
      fn.call(global, lx, global, global, doc);
    } catch (e) {
      runtime.status = 'error';
      runtime.error = (e && e.message) || String(e);
      pushLog('err', runtime.name + ' 执行失败：' + runtime.error);
      notifyChange();
    }

    runtime.dispose = function () { handlers = Object.create(null); };

    runtime.invoke = function (payload) {
      var list = handlers[EVENT_NAMES.request] || [];
      if (!list.length) return Promise.reject(new Error('脚本没有注册 request 处理器'));
      NM.lx.current = runtime;
      global.lx = lx;
      var p;
      try { p = list[0](payload); } catch (e) { return Promise.reject(e); }
      return Promise.resolve(p);
    };

    return runtime;
  }

  /* ======================================================================
     3. 脚本发现与加载
     ====================================================================== */
  /* 面板自己的模块文件：绝不能被当成音源脚本加载。
     和 main.js 的 MODULE_NAMES 必须一致（v1.9.18 起多了 tagwriter.js）。 */
  var MODULE_FILES = ['crypto.js', 'tagwriter.js', 'providers.js', 'lx.js', 'main.js'];

  function trimSlash(p) {
    return String(p || '').replace(/[\\\/]+$/, '');
  }

  function isModuleFile(name) {
    return MODULE_FILES.indexOf(String(name).toLowerCase()) >= 0;
  }

  function listFromManifest(dir) {
    var path = dir + '\\音源列表.json';
    if (!utils.FileExists(path)) return [];
    try {
      var j = JSON.parse(utils.ReadTextFile(path, 65001));
      var arr = Array.isArray(j) ? j : (j && (j.files || j.scripts)) || [];
      var out = [];
      arr.forEach(function (it) {
        var name = typeof it === 'string' ? it : (it && it.file);
        name = String(name || '').trim();
        if (!name || isModuleFile(name)) return;
        if (out.indexOf(name) < 0) out.push(name);
      });
      return out;
    } catch (e) {
      pushLog('warn', '读取音源列表失败：' + ((e && e.message) || e));
      return [];
    }
  }

  function listFromGlob(dir) {
    var paths;
    try { paths = utils.Glob(dir + '\\*.js') || []; } catch (e) { return []; }
    var out = [];
    paths.forEach(function (p) {
      var name = String(p).split(/[\\\/]/).pop();
      if (!/\.js$/i.test(name)) return;
      if (isModuleFile(name)) return;
      if (out.indexOf(name) < 0) out.push(name);
    });
    out.sort(function (a, b) { return a < b ? -1 : (a > b ? 1 : 0); });
    return out;
  }

  function scriptCandidates() {
    var list = [];
    function push(p) {
      p = trimSlash(p);
      if (p && list.indexOf(p) < 0) list.push(p);
    }
    function pushDir(p) {
      p = trimSlash(p);
      if (!p) return;
      push(p + '\\sources');
      push(p);
    }

    /* 模块所在目录（main.js 探测到的）。
       v1.9.9 起音源脚本统一放在 <模块目录>\resources\ 下 —— 和面板自己的
       模块文件分开，目录一眼能看清哪些是「面板」、哪些是「音源」；
       老安装（脚本直接躺在模块目录或 .\sources）继续认，不用搬家。 */
    var mod = trimSlash(NM.moduleDir || window.GetProperty('lx.moduleDir', ''));
    if (mod) {
      push(mod + '\\resources');
      pushDir(mod);
    }

    var base = trimSlash(HOST_FB.ComponentPath ? HOST_FB.ComponentPath + 'net' : '');
    if (base) pushDir(base);

    var profile = trimSlash(HOST_FB.ProfilePath || '');
    if (profile) {
      /* 安装位置固定在 profile\Lxbox（C:\Program Files\foobar2000\profile\Lxbox） */
      pushDir(profile + '\\Lxbox');
      /* 兜底：目录被改过名也能用 —— 扫出 crypto.js 所在目录 */
      ['crypto.js', '*\\crypto.js', '*\\*\\crypto.js', '*\\*\\*\\crypto.js'].forEach(function (pat) {
        try {
          (utils.Glob(profile + '\\' + pat) || []).forEach(function (p) {
            pushDir(String(p).replace(/[\\\/][^\\\/]*$/, ''));
          });
        } catch (e) {}
      });
    }
    return list;
  }

  function resolveScriptDir() {
    var custom = trimSlash(String(window.GetProperty('lx.scriptDir', '') || '').trim());
    if (custom) {
      var cf = listFromManifest(custom);
      if (!cf.length) cf = listFromGlob(custom);
      if (cf.length) return custom;
      pushLog('warn', 'lx.scriptDir 里没有音源脚本：' + custom + '，改为自动查找');
    }

    var cands = scriptCandidates();
    for (var i = 0; i < cands.length; i++) {
      var dir = cands[i];
      if (!dir) continue;
      var files = listFromManifest(dir);
      if (!files.length) files = listFromGlob(dir);
      if (files.length) return dir;
    }
    return cands[0] || '';
  }

  var state = {
    runtimes: [],
    dir: '',
    loaded: false,
    loading: null,
    error: ''
  };

  function waitInited(ms) {
    var deadline = Date.now() + (ms || 1500);
    return new Promise(function (resolve) {
      (function tick() {
        var waiting = state.runtimes.some(function (r) {
          return r.status === 'loading' && !r.sources;
        });
        if (!waiting || Date.now() >= deadline) {
          state.runtimes.forEach(function (r) {
            if (r.status === 'loading' && !r.sources) {
              r.status = 'warn';
              r.error = r.error || '脚本没有声明 inited（可能仍在异步初始化）';
            }
          });
          resolve();
          return;
        }
        setTimeout(tick, 100);
      })();
    });
  }

  function loadAll(opt) {
    opt = opt || {};
    if (state.loading) return state.loading;

    state.loading = new Promise(function (resolve) {
      /* 延后一点，避免 foobar2000 尚未完成初始化时 HTTPRequestAsync 抛错 */
      setTimeout(function () {
        try {
          var dir = resolveScriptDir();
          state.dir = dir;
          state.error = '';

          if (!dir) {
            state.error = '没有配置音源脚本目录';
            resolve([]);
            return;
          }

          var files = listFromManifest(dir);
          if (!files.length) files = listFromGlob(dir);

          if (!files.length) {
            state.error = '目录里没有找到音源脚本：' + dir;
            pushLog('err', state.error);
            resolve([]);
            return;
          }

          state.runtimes.forEach(function (r) {
            try { r.dispose && r.dispose(); } catch (e) {}
          });
          state.runtimes = [];
          pushLog('info', '开始加载 ' + files.length + ' 个音源脚本（' + dir + '）');

          files.forEach(function (file) {
            try {
              var code = utils.ReadTextFile(dir + '\\' + file, 65001);
              state.runtimes.push(createRuntime(file, code));
            } catch (e) {
              var err = (e && e.message) || String(e);
              pushLog('err', '读取脚本失败 ' + file + '：' + err);
              state.runtimes.push({
                id: file, file: file, name: file.replace(/\.js$/i, ''),
                status: 'error', error: '读取失败：' + err,
                sources: null, qualitys: {}, loadedAt: 0
              });
            }
          });

          waitInited(opt.initWait != null ? opt.initWait : 1500).then(function () {
            state.loaded = true;
            var okCount = state.runtimes.filter(function (r) { return r.sources; }).length;
            pushLog('info', '音源加载结束：' + okCount + '/' + state.runtimes.length + ' 个可用');
            notifyChange();
            resolve(state.runtimes);
          });
        } catch (e) {
          state.error = (e && e.message) || String(e);
          pushLog('err', '加载音源失败：' + state.error);
          notifyChange();
          resolve([]);
        }
      }, opt.delay != null ? opt.delay : 80);
    }).then(function (r) {
      state.loading = null;
      return r;
    }, function (e) {
      state.loading = null;
      throw e;
    });

    return state.loading;
  }

  /* ======================================================================
     4. 音质与取链
     ====================================================================== */
  var QUALITY_ORDER = ['128k', '192k', '320k', 'flac', 'flac24bit', 'hires', 'master', 'atmos', 'atmos_plus'];
  var QUALITY_RANK = {};
  QUALITY_ORDER.forEach(function (q, i) { QUALITY_RANK[q] = i; });

  function qualitiesOf(runtime, source) {
    if (!runtime || !runtime.sources || !runtime.sources[source]) return [];
    return (runtime.sources[source].qualitys || []).slice();
  }

  function pickQuality(runtime, source, wanted) {
    var list = qualitiesOf(runtime, source);
    if (!list.length) return wanted || '128k';
    if (!wanted || wanted === 'auto') {
      if (list.indexOf('flac') >= 0) return 'flac';
      if (list.indexOf('320k') >= 0) return '320k';
      var lowest0 = list[0];
      list.forEach(function (q) {
        if ((QUALITY_RANK[q] || 0) < (QUALITY_RANK[lowest0] || 0)) lowest0 = q;
      });
      return lowest0;
    }
    if (list.indexOf(wanted) >= 0) return wanted;
    var target = QUALITY_RANK[wanted];
    var pick = null;
    list.forEach(function (q) {
      var r = QUALITY_RANK[q];
      if (r == null) return;
      if (r <= target && (pick == null || r > QUALITY_RANK[pick])) pick = q;
    });
    if (pick) return pick;
    var lowest = list[0];
    list.forEach(function (q) {
      if ((QUALITY_RANK[q] || 0) < (QUALITY_RANK[lowest] || 0)) lowest = q;
    });
    return lowest || wanted;
  }

  function withTimeout(promise, ms, label) {
    return new Promise(function (resolve, reject) {
      var done = false;
      var timer = setTimeout(function () {
        if (done) return;
        done = true;
        reject(new Error((label || '操作') + '超时（' + Math.round(ms / 1000) + 's）'));
      }, ms);
      Promise.resolve(promise).then(function (v) {
        if (done) return;
        done = true; clearTimeout(timer); resolve(v);
      }, function (e) {
        if (done) return;
        done = true; clearTimeout(timer); reject(e);
      });
    });
  }

  /* 指定的音源脚本：先看「平台专属」的 lx.script.<平台>，再看全局 lx.preferredScript。
     平台专属是面板浮层底部那个下拉框写的 —— 腾讯可以指定 A 脚本、网易指定 B 脚本，
     互不影响。返回脚本 id（就是文件名），没指定返回 ''。 */
  function scriptPrefFor(source) {
    var v = '';
    if (source) {
      try { v = String(window.GetProperty('lx.script.' + source, '') || ''); } catch (e) { v = ''; }
    }
    if (v) return v;
    try { v = String(window.GetProperty('lx.preferredScript', '') || ''); } catch (e2) { v = ''; }
    return v;
  }

  /* 指定过的脚本排在最前，其余按加载顺序排在后面兜底（不是「只用它」：
     指定的脚本取不到链时，别的脚本还能顶上） */
  function orderedRuntimes(source) {
    var list = state.runtimes.filter(function (r) {
      return r.status === 'ok' || r.status === 'warn';
    });
    var prefer = scriptPrefFor(source);
    if (prefer) {
      list.sort(function (a, b) {
        return (a.id === prefer ? -1 : 0) - (b.id === prefer ? -1 : 0);
      });
    }
    return list;
  }

  function sourcesAvailable() {
    var map = {};
    state.runtimes.forEach(function (r) {
      if (!r.sources) return;
      Object.keys(r.sources).forEach(function (k) {
        var it = map[k] || (map[k] = { qualitys: [], scripts: [] });
        (r.sources[k].qualitys || []).forEach(function (q) {
          if (it.qualitys.indexOf(q) < 0) it.qualitys.push(q);
        });
        it.scripts.push(r.name);
      });
    });
    Object.keys(map).forEach(function (k) {
      map[k].qualitys.sort(function (a, b) {
        return (QUALITY_RANK[a] || 0) - (QUALITY_RANK[b] || 0);
      });
    });
    return map;
  }

  function buildPayloadFor(rt, source, musicInfo, quality) {
    return {
      quality: quality,
      payload: {
        source: source,
        action: 'musicUrl',
        info: {
          type: quality,
          quality: quality,
          musicInfo: JSON.parse(JSON.stringify(musicInfo || {}))
        }
      }
    };
  }

  function buildPayload(rt, source, musicInfo, quality) {
    return buildPayloadFor(rt, source, musicInfo, pickQuality(rt, source, quality));
  }

  /* 取链质量回退链：首选质量失败（直链过期、VIP 限制、206 探测被拒等）时逐级降级。
     例如 flac → 320k → 128k，避免整首取链直接失败。 */
  function buildQualityChain(runtime, source, wanted) {
    var list = qualitiesOf(runtime, source);
    var first = pickQuality(runtime, source, wanted);
    var chain = [];

    function push(q) {
      if (q && q !== 'auto' && chain.indexOf(q) < 0) chain.push(q);
    }

    if (!list.length) {
      push(first);
      push('flac'); push('320k'); push('128k');
      return chain;
    }

    push(first);
    var rank = QUALITY_RANK[first];
    var lower = list.filter(function (q) {
      var r = QUALITY_RANK[q];
      return r != null && (rank == null || r < rank);
    });
    lower.sort(function (a, b) { return QUALITY_RANK[b] - QUALITY_RANK[a]; });
    lower.forEach(push);

    /* 脚本没报全质量列表时，补上通用降级档 */
    if (!chain.length) {
      push('flac'); push('320k'); push('128k');
    }
    return chain;
  }

  /* QQ 音乐加密格式（.mflac / .mgg / .qmc*）只有客户端能解，foobar2000 拿到就是
     一坨乱码。取链层直接拒掉，让调用方换脚本 / 换音质，别浪费一次下载。 */
  function encryptedExt(url) {
    var s = String(url || '');
    var cut = s.length;
    var q = s.indexOf('?');
    if (q >= 0 && q < cut) cut = q;
    var h = s.indexOf('#');
    if (h >= 0 && h < cut) cut = h;
    var m = /\.(mflac|mgg|qmcflac|qmcogg|qmc0|qmc2|qmc3|qmc4|qmc6|qmc8|mgg1|mflac0|bkcmp3|bkcflac|tm0|tm2|tm3|tm6)$/i
      .exec(s.slice(0, cut));
    return m ? m[0].toLowerCase() : '';
  }

  function resolveOnce(source, musicInfo, wantedQuality, opt) {
    opt = opt || {};
    var perTry = opt.timeout > 0 ? opt.timeout : 18000;
    var totalMs = opt.totalTimeout > 0 ? opt.totalTimeout : Math.max(perTry * 2 + 6000, 38000);
    var list = orderedRuntimes(source).filter(function (r) {
      return r.sources && r.sources[source] &&
             (r.sources[source].actions || ['musicUrl']).indexOf('musicUrl') >= 0;
    });

    if (!list.length) {
      var names = Object.keys(sourcesAvailable());
      var stateMsg = state.runtimes.length
        ? '已加载 ' + state.runtimes.length + ' 个脚本（' + state.runtimes.map(function (r) {
            return r.name + ':' + r.status;
          }).join('、') + '）'
        : '没有加载到任何音源脚本';
      return Promise.reject(new Error('没有脚本声明支持音源 ' + source +
        '（可用：' + (names.join('/') || '无') + '；' + stateMsg + '；目录：' + (state.dir || '未找到') + '）'));
    }

    var tried = [];
    return new Promise(function (resolveOuter, rejectOuter) {
      var settled = false;
      var left = list.length;

      function aggregate() {
        var msg = tried.map(function (t) {
          var q = t.quality ? '[' + t.quality + ']' : '';
          return t.script + q + (t.error ? '：' + t.error : '');
        }).join('；');
        var err = new Error('所有脚本都取链失败。' + (msg || ''));
        err.tried = tried;
        return err;
      }

      var deadline = setTimeout(function () {
        if (settled) return;
        settled = true;
        rejectOuter(aggregate());
      }, totalMs);

      function finishFail() {
        if (settled) return;
        if (--left > 0) return;
        settled = true;
        clearTimeout(deadline);
        rejectOuter(aggregate());
      }

      /* 同一个脚本内按质量回退：首选失败就降一档再试 */
      function attempt(rt, chain, idx) {
        if (settled) return;
        if (idx >= chain.length) {
          finishFail();
          return;
        }

        var q = chain[idx];
        var built = buildPayloadFor(rt, source, musicInfo, q);
        pushLog('info', '取链 ' + rt.name + ' ← ' + source + '/' + q);

        withTimeout(rt.invoke(built.payload), perTry, rt.name + ' 取链').then(function (raw) {
          var u = typeof raw === 'string' ? raw : (raw && (raw.url || raw.data));
          if (typeof u !== 'string' || !/^https?:\/\//i.test(u)) {
            throw new Error('脚本返回的不是有效直链');
          }
          var enc = encryptedExt(u);
          if (enc) throw new Error('音源返回的是 QQ 音乐加密格式（' + enc + '），foobar2000 无法播放');
          return u;
        }).then(function (u) {
          tried.push({ script: rt.name, quality: q, ok: true });
          pushLog('ok', '取链成功 ' + rt.name + ' ' + q + '：' + u.slice(0, 120));
          if (settled) return;
          settled = true;
          clearTimeout(deadline);
          resolveOuter({ url: u, quality: q, script: rt.name, tried: tried });
        }, function (e) {
          tried.push({ script: rt.name, quality: q, error: (e && e.message) || String(e) });
          pushLog('warn', '取链失败 ' + rt.name + ' ' + q + '：' + ((e && e.message) || e));
          attempt(rt, chain, idx + 1);
        });
      }

      list.forEach(function (rt, i) {
        function start() {
          if (settled) return;
          attempt(rt, buildQualityChain(rt, source, wantedQuality), 0);
        }
        if (i === 0) start();
        else setTimeout(start, i * 160);
      });
    });
  }

  /* ----------------------------------------------------------------------
     音质检测：只按指定那一档取一次链，**不降级**
     ----------------------------------------------------------------------
     resolveOnce 走的是 buildQualityChain（flac → 320k → 128k），那是播放要的
     行为：能出声就行。但拿来检测就废了 —— 只要有 128k，FLAC 一列也会显示可用。
     这里每个脚本只问一次 wanted，问到就返回，问不到就下一个脚本、最后报错。
     ---------------------------------------------------------------------- */
  function probeUrl(source, musicInfo, quality, opt) {
    opt = opt || {};
    var perTry = opt.timeout > 0 ? opt.timeout : 15000;
    /* opt.script = 只测这一个脚本（面板设置里的「检测音源」选择框） */
    var only = opt.script ? String(opt.script) : '';
    var list = orderedRuntimes(source).filter(function (r) {
      if (only && r.id !== only) return false;
      return r.sources && r.sources[source] &&
             (r.sources[source].actions || ['musicUrl']).indexOf('musicUrl') >= 0;
    });

    if (!list.length) {
      return Promise.reject(new Error(only
        ? '选中的脚本（' + only + '）没有声明支持 ' + source
        : '没有脚本声明支持 ' + source));
    }

    var tried = [];
    return new Promise(function (resolveOuter, rejectOuter) {
      var settled = false;

      function next(i) {
        if (settled) return;
        if (i >= list.length) {
          settled = true;
          var err = new Error(tried.join('；') || '所有脚本都取链失败');
          err.tried = tried;
          rejectOuter(err);
          return;
        }

        var rt = list[i];
        var built = buildPayloadFor(rt, source, musicInfo, quality);
        withTimeout(rt.invoke(built.payload), perTry, rt.name + ' 取链').then(function (raw) {
          var u = typeof raw === 'string' ? raw : (raw && (raw.url || raw.data));
          if (typeof u !== 'string' || !/^https?:\/\//i.test(u)) {
            tried.push(rt.name + '：脚本返回的不是有效直链');
            next(i + 1);
            return;
          }
          var enc = encryptedExt(u);
          if (enc) {
            tried.push(rt.name + '：加密格式 ' + enc + '（foobar2000 播不了）');
            next(i + 1);
            return;
          }
          if (settled) return;
          settled = true;
          resolveOuter({ url: u, quality: quality, script: rt.name });
        }, function (e) {
          tried.push(rt.name + '：' + ((e && e.message) || String(e)));
          next(i + 1);
        });
      }

      next(0);
    });
  }

  var resolveCache = Object.create(null);
  var resolveInflight = Object.create(null);

  function resolveKey(source, info, quality) {
    var id = info && (info.songmid || info.hash || info.rid || info.id ||
                      info.songId || info.musicId || info.copyrightId || '');
    return source + '|' + id + '|' + (quality || 'auto');
  }

  function resolve(source, musicInfo, wantedQuality, opt) {
    var key = resolveKey(source, musicInfo, wantedQuality);
    var hit = resolveCache[key];
    if (hit && Date.now() - hit.at < 180000) {
      return Promise.resolve({
        url: hit.url, quality: hit.quality, script: hit.script, tried: [], cached: true
      });
    }
    if (resolveInflight[key]) return resolveInflight[key];

    var p = resolveOnce(source, musicInfo, wantedQuality, opt).then(function (res) {
      delete resolveInflight[key];
      resolveCache[key] = { url: res.url, quality: res.quality, script: res.script, at: Date.now() };
      var now = Date.now();
      Object.keys(resolveCache).forEach(function (k) {
        if (now - resolveCache[k].at > 180000) delete resolveCache[k];
      });
      return res;
    }, function (e) {
      delete resolveInflight[key];
      throw e;
    });
    resolveInflight[key] = p;
    return p;
  }

  /* 换过音源脚本就把取链缓存清掉：缓存的是「这首歌唱从哪个地址取」，
     沿用旧脚本的结果等于没换 */
  function clearResolveCache() {
    Object.keys(resolveCache).forEach(function (k) { delete resolveCache[k]; });
  }

  /* 通用动作（lyric / pic 等）：只用声明了该 action 的脚本，逐个尝试 */
  function requestAction(source, action, musicInfo, opt) {
    var list = orderedRuntimes(source).filter(function (r) {
      return r.sources && r.sources[source] &&
        (r.sources[source].actions || ['musicUrl']).indexOf(action) >= 0;
    });
    if (!list.length) {
      return Promise.reject(new Error('没有脚本声明支持 ' + source + ' 的 ' + action));
    }
    var tried = [];
    function next(i) {
      if (i >= list.length) {
        return Promise.reject(new Error('所有脚本都取不到 ' + action + '（' + tried.join('；') + '）'));
      }
      var rt = list[i];
      var payload = {
        source: source,
        action: action,
        info: { musicInfo: JSON.parse(JSON.stringify(musicInfo || {})) }
      };
      return rt.invoke(payload).then(function (res) {
        if (res == null) throw new Error('空结果');
        return res;
      }, function (e) {
        tried.push(rt.name + '：' + ((e && e.message) || e));
        return next(i + 1);
      });
    }
    return next(0);
  }

  function scriptLyric(source, musicInfo) {
    return requestAction(source, 'lyric', musicInfo).then(function (res) {
      var text = typeof res === 'string' ? res : (res.lyric || res.lrc || '');
      var tr = (res && (res.tlyric || res.translation)) || '';
      if (!String(text || '').trim() && !String(tr || '').trim()) throw new Error('脚本返回空歌词');
      return { lyric: String(text || ''), translation: String(tr || ''), source: 'script' };
    });
  }

  NM.lx = {
    EVENT_NAMES: EVENT_NAMES,
    state: state,
    logs: logs,
    pushLog: pushLog,
    loadAll: loadAll,
    request: lxRequest,
    download: downloadFile,
    resolve: resolve,
    probeUrl: probeUrl,
    encryptedExt: encryptedExt,
    clearResolveCache: clearResolveCache,
    scriptPrefFor: scriptPrefFor,
    requestAction: requestAction,
    lyric: scriptLyric,
    onChange: onChange,
    notifyChange: notifyChange,
    sourcesAvailable: sourcesAvailable,
    pickQuality: pickQuality,
    qualitiesOf: qualitiesOf,
    /* v1.9.18：main.js 里原来有第二份同名实现，统一到这里，别处转调 */
    withTimeout: withTimeout,
    resolveScriptDir: resolveScriptDir,
    current: null
  };
})(window);
