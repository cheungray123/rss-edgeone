
import { createRequire as __createRequire } from 'module';
import { fileURLToPath as __fileURLToPath } from 'url';
import { dirname as __pathDirname } from 'path';

// Global variables
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __pathDirname(__filename);
const require = __createRequire(import.meta.url);

// Global require function
globalThis.require = require;
globalThis.__filename = __filename;
globalThis.__dirname = __dirname;

// Dynamic require handler
globalThis.__dynamicRequire = function(id) {
  try {
    return require(id);
  } catch (err) {
    if (err.code === 'ERR_REQUIRE_ESM') {
      // If the module is ESM, try using import()
      return import(id);
    }
    throw err;
  }
};

// Fix Buffer
if (typeof Buffer === 'undefined') {
  globalThis.Buffer = require('buffer').Buffer;
}

// Fix process
if (typeof process === 'undefined') {
  globalThis.process = require('process');
}

// Fix util.promisify
if (!Symbol.for('nodejs.util.promisify.custom')) {
  Symbol.for('nodejs.util.promisify.custom');
}


  
  
// ===== Fetch Proxy Injection (Production Mode Only) =====
// Inject fetch-proxy to intercept fetch calls
import __fetchProxyCrypto from 'node:crypto';

(function() {
  const __originalFetch = globalThis.fetch;

const uuid = '{{PAGES_PROXY_UUID}}';
const proxyHost = '{{PAGES_PROXY_HOST}}';

// Domains that must bypass the proxy and always use direct fetch.
// These are internal EdgeOne infrastructure services whose requests
// break when routed through openedge-proxy (e.g. STS credential
// issuance for @edgeone/pages-blob, blob CDN read/write domains).
const __proxyBypassHosts = new Set([
  'blob-sts.edgeone.site',
]);
const __proxyBypassSuffixes = [
  '.blob.edgeone.site',
  '.blob-nocache.edgeone.site',
];

function __shouldBypassProxy(host) {
  if (__proxyBypassHosts.has(host)) return true;
  for (let i = 0; i < __proxyBypassSuffixes.length; i++) {
    if (host.endsWith(__proxyBypassSuffixes[i])) return true;
  }
  return false;
}

function _fetch(
  request,
  requestInit = {},
) {
  const { host } = getUrl(request);
  // Never proxy internal EdgeOne blob infrastructure domains
  if (__shouldBypassProxy(host)) {
    return __originalFetch(request, requestInit);
  }
  const cache = getHostCache(host);
  if (cache && cache.needProxy && cache.expires > Date.now()) {
    setHostCache(host);
    return fetchByProxy(request, requestInit);
  }
  return fetchByOrigin(request, requestInit);
}

function getUrl(request) {
  // 直接从 request.url 获取 URL，避免消费 request body
  const urlString = request instanceof Request ? request.url : request;
  return new URL(urlString);
}

function getHostCache(host) {
  return new Map(globalThis._FETCHCACHES || []).get(host);
}

function setHostCache(host) {
  const value = {
    needProxy: true,
    expires: Date.now() + 1000 * 60 * 60,
  };
  if (globalThis._FETCHCACHES) {
    globalThis._FETCHCACHES.set(host, value);
  } else {
    const cache = new Map([[host, value]]);
    Object.defineProperty(globalThis, '_FETCHCACHES', {
      value: cache,
      writable: false,
      enumerable: false,
      configurable: false,
    });
  }
}

function bufferToHex(arr) {
  return Array.prototype.map
    .call(arr, (x) => (x >= 16 ? x.toString(16) : '0' + x.toString(16)))
    .join('');
}

function generateSign({ pathname, oeTimestamp }) {
  return md5(oeTimestamp+'-'+pathname+'-'+uuid);
}

async function generateHeaders(request) {
  const { host, pathname } = getUrl(request);
  const timestamp = Date.now().toString();
  const sign = generateSign({ pathname, oeTimestamp: timestamp });
  return {
    host,
    timestamp,
    sign,
  };
}

// MD5 hash function for Node.js environment
// Node.js crypto.subtle.digest doesn't support MD5, so we use crypto.createHash instead
// Note: __fetchProxyCrypto is imported at the top level using ESM import
function md5(text) {
  const hash = __fetchProxyCrypto.createHash('md5');
  hash.update(text, 'utf8');
  return hash.digest('hex');
}

/**
 * Try to request using the native fetch; if it fails, request via the proxy
 * @returns
 */
async function fetchByOrigin(
  request,
  requestInit = {},
) {
  try {
    const res = await __originalFetch(request, {
      eo: {
        timeoutSetting: {
          connectTimeout: 500,
        },
      },
      ...requestInit,
    });
    if (res.status > 300 || res.status < 200) throw new Error('need proxy');
    return res;
  } catch (error) {
    const { host } = getUrl(request);
    setHostCache(host);
    return fetchByProxy(request, requestInit);
  }
}

/**
 * Request via AI proxy
 * @returns
 */
async function fetchByProxy(
  request,
  requestInit,
) {
  const options = {};
  if (requestInit) {
    Object.assign(options, requestInit || {});
  }
  options.headers = new Headers(options.headers || {});
  const { host, timestamp, sign } = await generateHeaders(request);
  options.headers.append('oe-host', host);
  options.headers.append('oe-timestamp', timestamp);
  options.headers.append('oe-sign', sign);
  
  let clonedRequest;
  if (request instanceof Request && typeof request.clone === 'function') {
    clonedRequest = request.clone();
  } else {
    // If request is not a Request object (e.g., URL string), create a new Request
    clonedRequest = new Request(request);
  }
  
  // Create a new request with the proxy host, preserving all properties including body
  const req = new Request(clonedRequest.url.replace(host, proxyHost), {
    method: clonedRequest.method,
    headers: clonedRequest.headers,
    body: clonedRequest.body,
  });
  
  return __originalFetch(req, options);
}
// Replace global fetch with _fetch from fetch-proxy
  if (typeof _fetch === 'function') {
    globalThis.fetch = _fetch;
    // Store original fetch for internal use
    globalThis.__originalFetch = __originalFetch;
  } else {
    console.warn('[runtime-shim] _fetch function not found, using original fetch');
  }
})();


  


var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var require_stdin = __commonJS({
  "<stdin>"(exports, module) {
    var _e, _t, _a;
    var hs = Object.create;
    var he = Object.defineProperty;
    var us = Object.getOwnPropertyDescriptor;
    var ds = Object.getOwnPropertyNames;
    var ps = Object.getPrototypeOf, gs = Object.prototype.hasOwnProperty;
    var b = (t, e) => () => (e || t((e = { exports: {} }).exports, e), e.exports), _s = (t, e) => {
      for (var s in e)
        he(t, s, { get: e[s], enumerable: true });
    }, Je = (t, e, s, r) => {
      if (e && typeof e == "object" || typeof e == "function")
        for (let n of ds(e))
          !gs.call(t, n) && n !== s && he(t, n, { get: () => e[n], enumerable: !(r = us(e, n)) || r.enumerable });
      return t;
    };
    var Y = (t, e, s) => (s = t != null ? hs(ps(t)) : {}, Je(e || !t || !t.__esModule ? he(s, "default", { value: t, enumerable: true }) : s, t)), ms = (t) => Je(he({}, "__esModule", { value: true }), t);
    var P = b((fn, et) => {
      "use strict";
      var Ze = ["nodebuffer", "arraybuffer", "fragments"], Qe = typeof Blob < "u";
      Qe && Ze.push("blob");
      et.exports = { BINARY_TYPES: Ze, EMPTY_BUFFER: Buffer.alloc(0), GUID: "258EAFA5-E914-47DA-95CA-C5AB0DC85B11", hasBlob: Qe, kForOnEventAttribute: Symbol("kIsForOnEventAttribute"), kListener: Symbol("kListener"), kStatusCode: Symbol("status-code"), kWebSocket: Symbol("websocket"), NOOP: () => {
      } };
    });
    var re = b((hn, ue) => {
      "use strict";
      var { EMPTY_BUFFER: ys } = P(), Ce = Buffer[Symbol.species];
      function Ss(t, e) {
        if (t.length === 0)
          return ys;
        if (t.length === 1)
          return t[0];
        let s = Buffer.allocUnsafe(e), r = 0;
        for (let n = 0; n < t.length; n++) {
          let i = t[n];
          s.set(i, r), r += i.length;
        }
        return r < e ? new Ce(s.buffer, s.byteOffset, r) : s;
      }
      function tt(t, e, s, r, n) {
        for (let i = 0; i < n; i++)
          s[r + i] = t[i] ^ e[i & 3];
      }
      function st(t, e) {
        for (let s = 0; s < t.length; s++)
          t[s] ^= e[s & 3];
      }
      function Es(t) {
        return t.length === t.buffer.byteLength ? t.buffer : t.buffer.slice(t.byteOffset, t.byteOffset + t.length);
      }
      function Pe(t) {
        if (Pe.readOnly = true, Buffer.isBuffer(t))
          return t;
        let e;
        return t instanceof ArrayBuffer ? e = new Ce(t) : ArrayBuffer.isView(t) ? e = new Ce(t.buffer, t.byteOffset, t.byteLength) : (e = Buffer.from(t), Pe.readOnly = false), e;
      }
      ue.exports = { concat: Ss, mask: tt, toArrayBuffer: Es, toBuffer: Pe, unmask: st };
      if (!process.env.WS_NO_BUFFER_UTIL)
        try {
          let t = require("bufferutil");
          ue.exports.mask = function(e, s, r, n, i) {
            i < 48 ? tt(e, s, r, n, i) : t.mask(e, s, r, n, i);
          }, ue.exports.unmask = function(e, s) {
            e.length < 32 ? st(e, s) : t.unmask(e, s);
          };
        } catch {
        }
    });
    var it = b((un, nt) => {
      "use strict";
      var rt = Symbol("kDone"), Ne = Symbol("kRun"), Ae = class {
        constructor(e) {
          this[rt] = () => {
            this.pending--, this[Ne]();
          }, this.concurrency = e || 1 / 0, this.jobs = [], this.pending = 0;
        }
        add(e) {
          this.jobs.push(e), this[Ne]();
        }
        [Ne]() {
          if (this.pending !== this.concurrency && this.jobs.length) {
            let e = this.jobs.shift();
            this.pending++, e(this[rt]);
          }
        }
      };
      nt.exports = Ae;
    });
    var ie = b((dn, ct) => {
      "use strict";
      var ne = require("zlib"), ot = re(), xs = it(), { kStatusCode: at } = P(), bs = Buffer[Symbol.species], ws = Buffer.from([0, 0, 255, 255]), pe = Symbol("permessage-deflate"), N = Symbol("total-length"), K = Symbol("callback"), R = Symbol("buffers"), X = Symbol("error"), de, Ie = class {
        constructor(e, s, r) {
          if (this._maxPayload = r | 0, this._options = e || {}, this._threshold = this._options.threshold !== void 0 ? this._options.threshold : 1024, this._isServer = !!s, this._deflate = null, this._inflate = null, this.params = null, !de) {
            let n = this._options.concurrencyLimit !== void 0 ? this._options.concurrencyLimit : 10;
            de = new xs(n);
          }
        }
        static get extensionName() {
          return "permessage-deflate";
        }
        offer() {
          let e = {};
          return this._options.serverNoContextTakeover && (e.server_no_context_takeover = true), this._options.clientNoContextTakeover && (e.client_no_context_takeover = true), this._options.serverMaxWindowBits && (e.server_max_window_bits = this._options.serverMaxWindowBits), this._options.clientMaxWindowBits ? e.client_max_window_bits = this._options.clientMaxWindowBits : this._options.clientMaxWindowBits == null && (e.client_max_window_bits = true), e;
        }
        accept(e) {
          return e = this.normalizeParams(e), this.params = this._isServer ? this.acceptAsServer(e) : this.acceptAsClient(e), this.params;
        }
        cleanup() {
          if (this._inflate && (this._inflate.close(), this._inflate = null), this._deflate) {
            let e = this._deflate[K];
            this._deflate.close(), this._deflate = null, e && e(new Error("The deflate stream was closed while data was being processed"));
          }
        }
        acceptAsServer(e) {
          let s = this._options, r = e.find((n) => !(s.serverNoContextTakeover === false && n.server_no_context_takeover || n.server_max_window_bits && (s.serverMaxWindowBits === false || typeof s.serverMaxWindowBits == "number" && s.serverMaxWindowBits > n.server_max_window_bits) || typeof s.clientMaxWindowBits == "number" && !n.client_max_window_bits));
          if (!r)
            throw new Error("None of the extension offers can be accepted");
          return s.serverNoContextTakeover && (r.server_no_context_takeover = true), s.clientNoContextTakeover && (r.client_no_context_takeover = true), typeof s.serverMaxWindowBits == "number" && (r.server_max_window_bits = s.serverMaxWindowBits), typeof s.clientMaxWindowBits == "number" ? r.client_max_window_bits = s.clientMaxWindowBits : (r.client_max_window_bits === true || s.clientMaxWindowBits === false) && delete r.client_max_window_bits, r;
        }
        acceptAsClient(e) {
          let s = e[0];
          if (this._options.clientNoContextTakeover === false && s.client_no_context_takeover)
            throw new Error('Unexpected parameter "client_no_context_takeover"');
          if (!s.client_max_window_bits)
            typeof this._options.clientMaxWindowBits == "number" && (s.client_max_window_bits = this._options.clientMaxWindowBits);
          else if (this._options.clientMaxWindowBits === false || typeof this._options.clientMaxWindowBits == "number" && s.client_max_window_bits > this._options.clientMaxWindowBits)
            throw new Error('Unexpected or invalid parameter "client_max_window_bits"');
          return s;
        }
        normalizeParams(e) {
          return e.forEach((s) => {
            Object.keys(s).forEach((r) => {
              let n = s[r];
              if (n.length > 1)
                throw new Error(`Parameter "${r}" must have only a single value`);
              if (n = n[0], r === "client_max_window_bits") {
                if (n !== true) {
                  let i = +n;
                  if (!Number.isInteger(i) || i < 8 || i > 15)
                    throw new TypeError(`Invalid value for parameter "${r}": ${n}`);
                  n = i;
                } else if (!this._isServer)
                  throw new TypeError(`Invalid value for parameter "${r}": ${n}`);
              } else if (r === "server_max_window_bits") {
                let i = +n;
                if (!Number.isInteger(i) || i < 8 || i > 15)
                  throw new TypeError(`Invalid value for parameter "${r}": ${n}`);
                n = i;
              } else if (r === "client_no_context_takeover" || r === "server_no_context_takeover") {
                if (n !== true)
                  throw new TypeError(`Invalid value for parameter "${r}": ${n}`);
              } else
                throw new Error(`Unknown parameter "${r}"`);
              s[r] = n;
            });
          }), e;
        }
        decompress(e, s, r) {
          de.add((n) => {
            this._decompress(e, s, (i, o) => {
              n(), r(i, o);
            });
          });
        }
        compress(e, s, r) {
          de.add((n) => {
            this._compress(e, s, (i, o) => {
              n(), r(i, o);
            });
          });
        }
        _decompress(e, s, r) {
          let n = this._isServer ? "client" : "server";
          if (!this._inflate) {
            let i = `${n}_max_window_bits`, o = typeof this.params[i] != "number" ? ne.Z_DEFAULT_WINDOWBITS : this.params[i];
            this._inflate = ne.createInflateRaw({ ...this._options.zlibInflateOptions, windowBits: o }), this._inflate[pe] = this, this._inflate[N] = 0, this._inflate[R] = [], this._inflate.on("error", Ts), this._inflate.on("data", lt);
          }
          this._inflate[K] = r, this._inflate.write(e), s && this._inflate.write(ws), this._inflate.flush(() => {
            let i = this._inflate[X];
            if (i) {
              this._inflate.close(), this._inflate = null, r(i);
              return;
            }
            let o = ot.concat(this._inflate[R], this._inflate[N]);
            this._inflate._readableState.endEmitted ? (this._inflate.close(), this._inflate = null) : (this._inflate[N] = 0, this._inflate[R] = [], s && this.params[`${n}_no_context_takeover`] && this._inflate.reset()), r(null, o);
          });
        }
        _compress(e, s, r) {
          let n = this._isServer ? "server" : "client";
          if (!this._deflate) {
            let i = `${n}_max_window_bits`, o = typeof this.params[i] != "number" ? ne.Z_DEFAULT_WINDOWBITS : this.params[i];
            this._deflate = ne.createDeflateRaw({ ...this._options.zlibDeflateOptions, windowBits: o }), this._deflate[N] = 0, this._deflate[R] = [], this._deflate.on("data", vs);
          }
          this._deflate[K] = r, this._deflate.write(e), this._deflate.flush(ne.Z_SYNC_FLUSH, () => {
            if (!this._deflate)
              return;
            let i = ot.concat(this._deflate[R], this._deflate[N]);
            s && (i = new bs(i.buffer, i.byteOffset, i.length - 4)), this._deflate[K] = null, this._deflate[N] = 0, this._deflate[R] = [], s && this.params[`${n}_no_context_takeover`] && this._deflate.reset(), r(null, i);
          });
        }
      };
      ct.exports = Ie;
      function vs(t) {
        this[R].push(t), this[N] += t.length;
      }
      function lt(t) {
        if (this[N] += t.length, this[pe]._maxPayload < 1 || this[N] <= this[pe]._maxPayload) {
          this[R].push(t);
          return;
        }
        this[X] = new RangeError("Max payload size exceeded"), this[X].code = "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH", this[X][at] = 1009, this.removeListener("data", lt), this.reset();
      }
      function Ts(t) {
        if (this[pe]._inflate = null, this[X]) {
          this[K](this[X]);
          return;
        }
        t[at] = 1007, this[K](t);
      }
    });
    var J = b((pn, ge) => {
      "use strict";
      var { isUtf8: ft } = require("buffer"), { hasBlob: ks } = P(), Os = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0];
      function Ls(t) {
        return t >= 1e3 && t <= 1014 && t !== 1004 && t !== 1005 && t !== 1006 || t >= 3e3 && t <= 4999;
      }
      function Be(t) {
        let e = t.length, s = 0;
        for (; s < e; )
          if (!(t[s] & 128))
            s++;
          else if ((t[s] & 224) === 192) {
            if (s + 1 === e || (t[s + 1] & 192) !== 128 || (t[s] & 254) === 192)
              return false;
            s += 2;
          } else if ((t[s] & 240) === 224) {
            if (s + 2 >= e || (t[s + 1] & 192) !== 128 || (t[s + 2] & 192) !== 128 || t[s] === 224 && (t[s + 1] & 224) === 128 || t[s] === 237 && (t[s + 1] & 224) === 160)
              return false;
            s += 3;
          } else if ((t[s] & 248) === 240) {
            if (s + 3 >= e || (t[s + 1] & 192) !== 128 || (t[s + 2] & 192) !== 128 || (t[s + 3] & 192) !== 128 || t[s] === 240 && (t[s + 1] & 240) === 128 || t[s] === 244 && t[s + 1] > 143 || t[s] > 244)
              return false;
            s += 4;
          } else
            return false;
        return true;
      }
      function Cs(t) {
        return ks && typeof t == "object" && typeof t.arrayBuffer == "function" && typeof t.type == "string" && typeof t.stream == "function" && (t[Symbol.toStringTag] === "Blob" || t[Symbol.toStringTag] === "File");
      }
      ge.exports = { isBlob: Cs, isValidStatusCode: Ls, isValidUTF8: Be, tokenChars: Os };
      if (ft)
        ge.exports.isValidUTF8 = function(t) {
          return t.length < 24 ? Be(t) : ft(t);
        };
      else if (!process.env.WS_NO_UTF_8_VALIDATE)
        try {
          let t = require("utf-8-validate");
          ge.exports.isValidUTF8 = function(e) {
            return e.length < 32 ? Be(e) : t(e);
          };
        } catch {
        }
    });
    var qe = b((gn, mt) => {
      "use strict";
      var { Writable: Ps } = require("stream"), ht = ie(), { BINARY_TYPES: Ns, EMPTY_BUFFER: ut, kStatusCode: As, kWebSocket: Is } = P(), { concat: Re, toArrayBuffer: Bs, unmask: Rs } = re(), { isValidStatusCode: Ds, isValidUTF8: dt } = J(), _e2 = Buffer[Symbol.species], v = 0, pt = 1, gt = 2, _t2 = 3, De = 4, Me = 5, me = 6, Ue = class extends Ps {
        constructor(e = {}) {
          super(), this._allowSynchronousEvents = e.allowSynchronousEvents !== void 0 ? e.allowSynchronousEvents : true, this._binaryType = e.binaryType || Ns[0], this._extensions = e.extensions || {}, this._isServer = !!e.isServer, this._maxPayload = e.maxPayload | 0, this._skipUTF8Validation = !!e.skipUTF8Validation, this[Is] = void 0, this._bufferedBytes = 0, this._buffers = [], this._compressed = false, this._payloadLength = 0, this._mask = void 0, this._fragmented = 0, this._masked = false, this._fin = false, this._opcode = 0, this._totalPayloadLength = 0, this._messageLength = 0, this._fragments = [], this._errored = false, this._loop = false, this._state = v;
        }
        _write(e, s, r) {
          if (this._opcode === 8 && this._state == v)
            return r();
          this._bufferedBytes += e.length, this._buffers.push(e), this.startLoop(r);
        }
        consume(e) {
          if (this._bufferedBytes -= e, e === this._buffers[0].length)
            return this._buffers.shift();
          if (e < this._buffers[0].length) {
            let r = this._buffers[0];
            return this._buffers[0] = new _e2(r.buffer, r.byteOffset + e, r.length - e), new _e2(r.buffer, r.byteOffset, e);
          }
          let s = Buffer.allocUnsafe(e);
          do {
            let r = this._buffers[0], n = s.length - e;
            e >= r.length ? s.set(this._buffers.shift(), n) : (s.set(new Uint8Array(r.buffer, r.byteOffset, e), n), this._buffers[0] = new _e2(r.buffer, r.byteOffset + e, r.length - e)), e -= r.length;
          } while (e > 0);
          return s;
        }
        startLoop(e) {
          this._loop = true;
          do
            switch (this._state) {
              case v:
                this.getInfo(e);
                break;
              case pt:
                this.getPayloadLength16(e);
                break;
              case gt:
                this.getPayloadLength64(e);
                break;
              case _t2:
                this.getMask();
                break;
              case De:
                this.getData(e);
                break;
              case Me:
              case me:
                this._loop = false;
                return;
            }
          while (this._loop);
          this._errored || e();
        }
        getInfo(e) {
          if (this._bufferedBytes < 2) {
            this._loop = false;
            return;
          }
          let s = this.consume(2);
          if (s[0] & 48) {
            let n = this.createError(RangeError, "RSV2 and RSV3 must be clear", true, 1002, "WS_ERR_UNEXPECTED_RSV_2_3");
            e(n);
            return;
          }
          let r = (s[0] & 64) === 64;
          if (r && !this._extensions[ht.extensionName]) {
            let n = this.createError(RangeError, "RSV1 must be clear", true, 1002, "WS_ERR_UNEXPECTED_RSV_1");
            e(n);
            return;
          }
          if (this._fin = (s[0] & 128) === 128, this._opcode = s[0] & 15, this._payloadLength = s[1] & 127, this._opcode === 0) {
            if (r) {
              let n = this.createError(RangeError, "RSV1 must be clear", true, 1002, "WS_ERR_UNEXPECTED_RSV_1");
              e(n);
              return;
            }
            if (!this._fragmented) {
              let n = this.createError(RangeError, "invalid opcode 0", true, 1002, "WS_ERR_INVALID_OPCODE");
              e(n);
              return;
            }
            this._opcode = this._fragmented;
          } else if (this._opcode === 1 || this._opcode === 2) {
            if (this._fragmented) {
              let n = this.createError(RangeError, `invalid opcode ${this._opcode}`, true, 1002, "WS_ERR_INVALID_OPCODE");
              e(n);
              return;
            }
            this._compressed = r;
          } else if (this._opcode > 7 && this._opcode < 11) {
            if (!this._fin) {
              let n = this.createError(RangeError, "FIN must be set", true, 1002, "WS_ERR_EXPECTED_FIN");
              e(n);
              return;
            }
            if (r) {
              let n = this.createError(RangeError, "RSV1 must be clear", true, 1002, "WS_ERR_UNEXPECTED_RSV_1");
              e(n);
              return;
            }
            if (this._payloadLength > 125 || this._opcode === 8 && this._payloadLength === 1) {
              let n = this.createError(RangeError, `invalid payload length ${this._payloadLength}`, true, 1002, "WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH");
              e(n);
              return;
            }
          } else {
            let n = this.createError(RangeError, `invalid opcode ${this._opcode}`, true, 1002, "WS_ERR_INVALID_OPCODE");
            e(n);
            return;
          }
          if (!this._fin && !this._fragmented && (this._fragmented = this._opcode), this._masked = (s[1] & 128) === 128, this._isServer) {
            if (!this._masked) {
              let n = this.createError(RangeError, "MASK must be set", true, 1002, "WS_ERR_EXPECTED_MASK");
              e(n);
              return;
            }
          } else if (this._masked) {
            let n = this.createError(RangeError, "MASK must be clear", true, 1002, "WS_ERR_UNEXPECTED_MASK");
            e(n);
            return;
          }
          this._payloadLength === 126 ? this._state = pt : this._payloadLength === 127 ? this._state = gt : this.haveLength(e);
        }
        getPayloadLength16(e) {
          if (this._bufferedBytes < 2) {
            this._loop = false;
            return;
          }
          this._payloadLength = this.consume(2).readUInt16BE(0), this.haveLength(e);
        }
        getPayloadLength64(e) {
          if (this._bufferedBytes < 8) {
            this._loop = false;
            return;
          }
          let s = this.consume(8), r = s.readUInt32BE(0);
          if (r > Math.pow(2, 21) - 1) {
            let n = this.createError(RangeError, "Unsupported WebSocket frame: payload length > 2^53 - 1", false, 1009, "WS_ERR_UNSUPPORTED_DATA_PAYLOAD_LENGTH");
            e(n);
            return;
          }
          this._payloadLength = r * Math.pow(2, 32) + s.readUInt32BE(4), this.haveLength(e);
        }
        haveLength(e) {
          if (this._payloadLength && this._opcode < 8 && (this._totalPayloadLength += this._payloadLength, this._totalPayloadLength > this._maxPayload && this._maxPayload > 0)) {
            let s = this.createError(RangeError, "Max payload size exceeded", false, 1009, "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH");
            e(s);
            return;
          }
          this._masked ? this._state = _t2 : this._state = De;
        }
        getMask() {
          if (this._bufferedBytes < 4) {
            this._loop = false;
            return;
          }
          this._mask = this.consume(4), this._state = De;
        }
        getData(e) {
          let s = ut;
          if (this._payloadLength) {
            if (this._bufferedBytes < this._payloadLength) {
              this._loop = false;
              return;
            }
            s = this.consume(this._payloadLength), this._masked && this._mask[0] | this._mask[1] | this._mask[2] | this._mask[3] && Rs(s, this._mask);
          }
          if (this._opcode > 7) {
            this.controlMessage(s, e);
            return;
          }
          if (this._compressed) {
            this._state = Me, this.decompress(s, e);
            return;
          }
          s.length && (this._messageLength = this._totalPayloadLength, this._fragments.push(s)), this.dataMessage(e);
        }
        decompress(e, s) {
          this._extensions[ht.extensionName].decompress(e, this._fin, (n, i) => {
            if (n)
              return s(n);
            if (i.length) {
              if (this._messageLength += i.length, this._messageLength > this._maxPayload && this._maxPayload > 0) {
                let o = this.createError(RangeError, "Max payload size exceeded", false, 1009, "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH");
                s(o);
                return;
              }
              this._fragments.push(i);
            }
            this.dataMessage(s), this._state === v && this.startLoop(s);
          });
        }
        dataMessage(e) {
          if (!this._fin) {
            this._state = v;
            return;
          }
          let s = this._messageLength, r = this._fragments;
          if (this._totalPayloadLength = 0, this._messageLength = 0, this._fragmented = 0, this._fragments = [], this._opcode === 2) {
            let n;
            this._binaryType === "nodebuffer" ? n = Re(r, s) : this._binaryType === "arraybuffer" ? n = Bs(Re(r, s)) : this._binaryType === "blob" ? n = new Blob(r) : n = r, this._allowSynchronousEvents ? (this.emit("message", n, true), this._state = v) : (this._state = me, setImmediate(() => {
              this.emit("message", n, true), this._state = v, this.startLoop(e);
            }));
          } else {
            let n = Re(r, s);
            if (!this._skipUTF8Validation && !dt(n)) {
              let i = this.createError(Error, "invalid UTF-8 sequence", true, 1007, "WS_ERR_INVALID_UTF8");
              e(i);
              return;
            }
            this._state === Me || this._allowSynchronousEvents ? (this.emit("message", n, false), this._state = v) : (this._state = me, setImmediate(() => {
              this.emit("message", n, false), this._state = v, this.startLoop(e);
            }));
          }
        }
        controlMessage(e, s) {
          if (this._opcode === 8) {
            if (e.length === 0)
              this._loop = false, this.emit("conclude", 1005, ut), this.end();
            else {
              let r = e.readUInt16BE(0);
              if (!Ds(r)) {
                let i = this.createError(RangeError, `invalid status code ${r}`, true, 1002, "WS_ERR_INVALID_CLOSE_CODE");
                s(i);
                return;
              }
              let n = new _e2(e.buffer, e.byteOffset + 2, e.length - 2);
              if (!this._skipUTF8Validation && !dt(n)) {
                let i = this.createError(Error, "invalid UTF-8 sequence", true, 1007, "WS_ERR_INVALID_UTF8");
                s(i);
                return;
              }
              this._loop = false, this.emit("conclude", r, n), this.end();
            }
            this._state = v;
            return;
          }
          this._allowSynchronousEvents ? (this.emit(this._opcode === 9 ? "ping" : "pong", e), this._state = v) : (this._state = me, setImmediate(() => {
            this.emit(this._opcode === 9 ? "ping" : "pong", e), this._state = v, this.startLoop(s);
          }));
        }
        createError(e, s, r, n, i) {
          this._loop = false, this._errored = true;
          let o = new e(r ? `Invalid WebSocket frame: ${s}` : s);
          return Error.captureStackTrace(o, this.createError), o.code = i, o[As] = n, o;
        }
      };
      mt.exports = Ue;
    });
    var $e = b((mn, Et) => {
      "use strict";
      var { Duplex: _n } = require("stream"), { randomFillSync: Ms } = require("crypto"), yt = ie(), { EMPTY_BUFFER: Us, kWebSocket: qs, NOOP: Ws } = P(), { isBlob: Z, isValidStatusCode: Fs } = J(), { mask: St, toBuffer: W } = re(), T = Symbol("kByteLength"), $s = Buffer.alloc(4), ye = 8 * 1024, F, Q = ye, O = 0, js = 1, Gs = 2, We = class t {
        constructor(e, s, r) {
          this._extensions = s || {}, r && (this._generateMask = r, this._maskBuffer = Buffer.alloc(4)), this._socket = e, this._firstFragment = true, this._compress = false, this._bufferedBytes = 0, this._queue = [], this._state = O, this.onerror = Ws, this[qs] = void 0;
        }
        static frame(e, s) {
          let r, n = false, i = 2, o = false;
          s.mask && (r = s.maskBuffer || $s, s.generateMask ? s.generateMask(r) : (Q === ye && (F === void 0 && (F = Buffer.alloc(ye)), Ms(F, 0, ye), Q = 0), r[0] = F[Q++], r[1] = F[Q++], r[2] = F[Q++], r[3] = F[Q++]), o = (r[0] | r[1] | r[2] | r[3]) === 0, i = 6);
          let l;
          typeof e == "string" ? (!s.mask || o) && s[T] !== void 0 ? l = s[T] : (e = Buffer.from(e), l = e.length) : (l = e.length, n = s.mask && s.readOnly && !o);
          let c = l;
          l >= 65536 ? (i += 8, c = 127) : l > 125 && (i += 2, c = 126);
          let a = Buffer.allocUnsafe(n ? l + i : i);
          return a[0] = s.fin ? s.opcode | 128 : s.opcode, s.rsv1 && (a[0] |= 64), a[1] = c, c === 126 ? a.writeUInt16BE(l, 2) : c === 127 && (a[2] = a[3] = 0, a.writeUIntBE(l, 4, 6)), s.mask ? (a[1] |= 128, a[i - 4] = r[0], a[i - 3] = r[1], a[i - 2] = r[2], a[i - 1] = r[3], o ? [a, e] : n ? (St(e, r, a, i, l), [a]) : (St(e, r, e, 0, l), [a, e])) : [a, e];
        }
        close(e, s, r, n) {
          let i;
          if (e === void 0)
            i = Us;
          else {
            if (typeof e != "number" || !Fs(e))
              throw new TypeError("First argument must be a valid error code number");
            if (s === void 0 || !s.length)
              i = Buffer.allocUnsafe(2), i.writeUInt16BE(e, 0);
            else {
              let l = Buffer.byteLength(s);
              if (l > 123)
                throw new RangeError("The message must not be greater than 123 bytes");
              i = Buffer.allocUnsafe(2 + l), i.writeUInt16BE(e, 0), typeof s == "string" ? i.write(s, 2) : i.set(s, 2);
            }
          }
          let o = { [T]: i.length, fin: true, generateMask: this._generateMask, mask: r, maskBuffer: this._maskBuffer, opcode: 8, readOnly: false, rsv1: false };
          this._state !== O ? this.enqueue([this.dispatch, i, false, o, n]) : this.sendFrame(t.frame(i, o), n);
        }
        ping(e, s, r) {
          let n, i;
          if (typeof e == "string" ? (n = Buffer.byteLength(e), i = false) : Z(e) ? (n = e.size, i = false) : (e = W(e), n = e.length, i = W.readOnly), n > 125)
            throw new RangeError("The data size must not be greater than 125 bytes");
          let o = { [T]: n, fin: true, generateMask: this._generateMask, mask: s, maskBuffer: this._maskBuffer, opcode: 9, readOnly: i, rsv1: false };
          Z(e) ? this._state !== O ? this.enqueue([this.getBlobData, e, false, o, r]) : this.getBlobData(e, false, o, r) : this._state !== O ? this.enqueue([this.dispatch, e, false, o, r]) : this.sendFrame(t.frame(e, o), r);
        }
        pong(e, s, r) {
          let n, i;
          if (typeof e == "string" ? (n = Buffer.byteLength(e), i = false) : Z(e) ? (n = e.size, i = false) : (e = W(e), n = e.length, i = W.readOnly), n > 125)
            throw new RangeError("The data size must not be greater than 125 bytes");
          let o = { [T]: n, fin: true, generateMask: this._generateMask, mask: s, maskBuffer: this._maskBuffer, opcode: 10, readOnly: i, rsv1: false };
          Z(e) ? this._state !== O ? this.enqueue([this.getBlobData, e, false, o, r]) : this.getBlobData(e, false, o, r) : this._state !== O ? this.enqueue([this.dispatch, e, false, o, r]) : this.sendFrame(t.frame(e, o), r);
        }
        send(e, s, r) {
          let n = this._extensions[yt.extensionName], i = s.binary ? 2 : 1, o = s.compress, l, c;
          typeof e == "string" ? (l = Buffer.byteLength(e), c = false) : Z(e) ? (l = e.size, c = false) : (e = W(e), l = e.length, c = W.readOnly), this._firstFragment ? (this._firstFragment = false, o && n && n.params[n._isServer ? "server_no_context_takeover" : "client_no_context_takeover"] && (o = l >= n._threshold), this._compress = o) : (o = false, i = 0), s.fin && (this._firstFragment = true);
          let a = { [T]: l, fin: s.fin, generateMask: this._generateMask, mask: s.mask, maskBuffer: this._maskBuffer, opcode: i, readOnly: c, rsv1: o };
          Z(e) ? this._state !== O ? this.enqueue([this.getBlobData, e, this._compress, a, r]) : this.getBlobData(e, this._compress, a, r) : this._state !== O ? this.enqueue([this.dispatch, e, this._compress, a, r]) : this.dispatch(e, this._compress, a, r);
        }
        getBlobData(e, s, r, n) {
          this._bufferedBytes += r[T], this._state = Gs, e.arrayBuffer().then((i) => {
            if (this._socket.destroyed) {
              let l = new Error("The socket was closed while the blob was being read");
              process.nextTick(Fe, this, l, n);
              return;
            }
            this._bufferedBytes -= r[T];
            let o = W(i);
            s ? this.dispatch(o, s, r, n) : (this._state = O, this.sendFrame(t.frame(o, r), n), this.dequeue());
          }).catch((i) => {
            process.nextTick(Vs, this, i, n);
          });
        }
        dispatch(e, s, r, n) {
          if (!s) {
            this.sendFrame(t.frame(e, r), n);
            return;
          }
          let i = this._extensions[yt.extensionName];
          this._bufferedBytes += r[T], this._state = js, i.compress(e, r.fin, (o, l) => {
            if (this._socket.destroyed) {
              let c = new Error("The socket was closed while data was being compressed");
              Fe(this, c, n);
              return;
            }
            this._bufferedBytes -= r[T], this._state = O, r.readOnly = false, this.sendFrame(t.frame(l, r), n), this.dequeue();
          });
        }
        dequeue() {
          for (; this._state === O && this._queue.length; ) {
            let e = this._queue.shift();
            this._bufferedBytes -= e[3][T], Reflect.apply(e[0], this, e.slice(1));
          }
        }
        enqueue(e) {
          this._bufferedBytes += e[3][T], this._queue.push(e);
        }
        sendFrame(e, s) {
          e.length === 2 ? (this._socket.cork(), this._socket.write(e[0]), this._socket.write(e[1], s), this._socket.uncork()) : this._socket.write(e[0], s);
        }
      };
      Et.exports = We;
      function Fe(t, e, s) {
        typeof s == "function" && s(e);
        for (let r = 0; r < t._queue.length; r++) {
          let n = t._queue[r], i = n[n.length - 1];
          typeof i == "function" && i(e);
        }
      }
      function Vs(t, e, s) {
        Fe(t, e, s), t.onerror(e);
      }
    });
    var Ct = b((yn, Lt) => {
      "use strict";
      var { kForOnEventAttribute: oe, kListener: je } = P(), xt = Symbol("kCode"), bt = Symbol("kData"), wt = Symbol("kError"), vt = Symbol("kMessage"), Tt = Symbol("kReason"), ee = Symbol("kTarget"), kt = Symbol("kType"), Ot = Symbol("kWasClean"), A = class {
        constructor(e) {
          this[ee] = null, this[kt] = e;
        }
        get target() {
          return this[ee];
        }
        get type() {
          return this[kt];
        }
      };
      Object.defineProperty(A.prototype, "target", { enumerable: true });
      Object.defineProperty(A.prototype, "type", { enumerable: true });
      var $ = class extends A {
        constructor(e, s = {}) {
          super(e), this[xt] = s.code === void 0 ? 0 : s.code, this[Tt] = s.reason === void 0 ? "" : s.reason, this[Ot] = s.wasClean === void 0 ? false : s.wasClean;
        }
        get code() {
          return this[xt];
        }
        get reason() {
          return this[Tt];
        }
        get wasClean() {
          return this[Ot];
        }
      };
      Object.defineProperty($.prototype, "code", { enumerable: true });
      Object.defineProperty($.prototype, "reason", { enumerable: true });
      Object.defineProperty($.prototype, "wasClean", { enumerable: true });
      var te = class extends A {
        constructor(e, s = {}) {
          super(e), this[wt] = s.error === void 0 ? null : s.error, this[vt] = s.message === void 0 ? "" : s.message;
        }
        get error() {
          return this[wt];
        }
        get message() {
          return this[vt];
        }
      };
      Object.defineProperty(te.prototype, "error", { enumerable: true });
      Object.defineProperty(te.prototype, "message", { enumerable: true });
      var ae = class extends A {
        constructor(e, s = {}) {
          super(e), this[bt] = s.data === void 0 ? null : s.data;
        }
        get data() {
          return this[bt];
        }
      };
      Object.defineProperty(ae.prototype, "data", { enumerable: true });
      var zs = { addEventListener(t, e, s = {}) {
        for (let n of this.listeners(t))
          if (!s[oe] && n[je] === e && !n[oe])
            return;
        let r;
        if (t === "message")
          r = function(i, o) {
            let l = new ae("message", { data: o ? i : i.toString() });
            l[ee] = this, Se(e, this, l);
          };
        else if (t === "close")
          r = function(i, o) {
            let l = new $("close", { code: i, reason: o.toString(), wasClean: this._closeFrameReceived && this._closeFrameSent });
            l[ee] = this, Se(e, this, l);
          };
        else if (t === "error")
          r = function(i) {
            let o = new te("error", { error: i, message: i.message });
            o[ee] = this, Se(e, this, o);
          };
        else if (t === "open")
          r = function() {
            let i = new A("open");
            i[ee] = this, Se(e, this, i);
          };
        else
          return;
        r[oe] = !!s[oe], r[je] = e, s.once ? this.once(t, r) : this.on(t, r);
      }, removeEventListener(t, e) {
        for (let s of this.listeners(t))
          if (s[je] === e && !s[oe]) {
            this.removeListener(t, s);
            break;
          }
      } };
      Lt.exports = { CloseEvent: $, ErrorEvent: te, Event: A, EventTarget: zs, MessageEvent: ae };
      function Se(t, e, s) {
        typeof t == "object" && t.handleEvent ? t.handleEvent.call(t, s) : t.call(e, s);
      }
    });
    var Ge = b((Sn, Pt) => {
      "use strict";
      var { tokenChars: le } = J();
      function L(t, e, s) {
        t[e] === void 0 ? t[e] = [s] : t[e].push(s);
      }
      function Hs(t) {
        let e = /* @__PURE__ */ Object.create(null), s = /* @__PURE__ */ Object.create(null), r = false, n = false, i = false, o, l, c = -1, a = -1, f = -1, h = 0;
        for (; h < t.length; h++)
          if (a = t.charCodeAt(h), o === void 0)
            if (f === -1 && le[a] === 1)
              c === -1 && (c = h);
            else if (h !== 0 && (a === 32 || a === 9))
              f === -1 && c !== -1 && (f = h);
            else if (a === 59 || a === 44) {
              if (c === -1)
                throw new SyntaxError(`Unexpected character at index ${h}`);
              f === -1 && (f = h);
              let _ = t.slice(c, f);
              a === 44 ? (L(e, _, s), s = /* @__PURE__ */ Object.create(null)) : o = _, c = f = -1;
            } else
              throw new SyntaxError(`Unexpected character at index ${h}`);
          else if (l === void 0)
            if (f === -1 && le[a] === 1)
              c === -1 && (c = h);
            else if (a === 32 || a === 9)
              f === -1 && c !== -1 && (f = h);
            else if (a === 59 || a === 44) {
              if (c === -1)
                throw new SyntaxError(`Unexpected character at index ${h}`);
              f === -1 && (f = h), L(s, t.slice(c, f), true), a === 44 && (L(e, o, s), s = /* @__PURE__ */ Object.create(null), o = void 0), c = f = -1;
            } else if (a === 61 && c !== -1 && f === -1)
              l = t.slice(c, h), c = f = -1;
            else
              throw new SyntaxError(`Unexpected character at index ${h}`);
          else if (n) {
            if (le[a] !== 1)
              throw new SyntaxError(`Unexpected character at index ${h}`);
            c === -1 ? c = h : r || (r = true), n = false;
          } else if (i)
            if (le[a] === 1)
              c === -1 && (c = h);
            else if (a === 34 && c !== -1)
              i = false, f = h;
            else if (a === 92)
              n = true;
            else
              throw new SyntaxError(`Unexpected character at index ${h}`);
          else if (a === 34 && t.charCodeAt(h - 1) === 61)
            i = true;
          else if (f === -1 && le[a] === 1)
            c === -1 && (c = h);
          else if (c !== -1 && (a === 32 || a === 9))
            f === -1 && (f = h);
          else if (a === 59 || a === 44) {
            if (c === -1)
              throw new SyntaxError(`Unexpected character at index ${h}`);
            f === -1 && (f = h);
            let _ = t.slice(c, f);
            r && (_ = _.replace(/\\/g, ""), r = false), L(s, l, _), a === 44 && (L(e, o, s), s = /* @__PURE__ */ Object.create(null), o = void 0), l = void 0, c = f = -1;
          } else
            throw new SyntaxError(`Unexpected character at index ${h}`);
        if (c === -1 || i || a === 32 || a === 9)
          throw new SyntaxError("Unexpected end of input");
        f === -1 && (f = h);
        let p = t.slice(c, f);
        return o === void 0 ? L(e, p, s) : (l === void 0 ? L(s, p, true) : r ? L(s, l, p.replace(/\\/g, "")) : L(s, l, p), L(e, o, s)), e;
      }
      function Ys(t) {
        return Object.keys(t).map((e) => {
          let s = t[e];
          return Array.isArray(s) || (s = [s]), s.map((r) => [e].concat(Object.keys(r).map((n) => {
            let i = r[n];
            return Array.isArray(i) || (i = [i]), i.map((o) => o === true ? n : `${n}=${o}`).join("; ");
          })).join("; ")).join(", ");
        }).join(", ");
      }
      Pt.exports = { format: Ys, parse: Hs };
    });
    var we = b((bn, $t) => {
      "use strict";
      var Ks = require("events"), Xs = require("https"), Js = require("http"), It = require("net"), Zs = require("tls"), { randomBytes: Qs, createHash: er } = require("crypto"), { Duplex: En, Readable: xn } = require("stream"), { URL: Ve } = require("url"), D = ie(), tr = qe(), sr = $e(), { isBlob: rr } = J(), { BINARY_TYPES: Nt, EMPTY_BUFFER: Ee, GUID: nr, kForOnEventAttribute: ze, kListener: ir, kStatusCode: or, kWebSocket: S, NOOP: Bt } = P(), { EventTarget: { addEventListener: ar, removeEventListener: lr } } = Ct(), { format: cr, parse: fr } = Ge(), { toBuffer: hr } = re(), ur = 30 * 1e3, Rt = Symbol("kAborted"), He = [8, 13], I = ["CONNECTING", "OPEN", "CLOSING", "CLOSED"], dr = /^[!#$%&'*+\-.0-9A-Z^_`|a-z~]+$/, g = class t extends Ks {
        constructor(e, s, r) {
          super(), this._binaryType = Nt[0], this._closeCode = 1006, this._closeFrameReceived = false, this._closeFrameSent = false, this._closeMessage = Ee, this._closeTimer = null, this._errorEmitted = false, this._extensions = {}, this._paused = false, this._protocol = "", this._readyState = t.CONNECTING, this._receiver = null, this._sender = null, this._socket = null, e !== null ? (this._bufferedAmount = 0, this._isServer = false, this._redirects = 0, s === void 0 ? s = [] : Array.isArray(s) || (typeof s == "object" && s !== null ? (r = s, s = []) : s = [s]), Dt(this, e, s, r)) : (this._autoPong = r.autoPong, this._isServer = true);
        }
        get binaryType() {
          return this._binaryType;
        }
        set binaryType(e) {
          Nt.includes(e) && (this._binaryType = e, this._receiver && (this._receiver._binaryType = e));
        }
        get bufferedAmount() {
          return this._socket ? this._socket._writableState.length + this._sender._bufferedBytes : this._bufferedAmount;
        }
        get extensions() {
          return Object.keys(this._extensions).join();
        }
        get isPaused() {
          return this._paused;
        }
        get onclose() {
          return null;
        }
        get onerror() {
          return null;
        }
        get onopen() {
          return null;
        }
        get onmessage() {
          return null;
        }
        get protocol() {
          return this._protocol;
        }
        get readyState() {
          return this._readyState;
        }
        get url() {
          return this._url;
        }
        setSocket(e, s, r) {
          let n = new tr({ allowSynchronousEvents: r.allowSynchronousEvents, binaryType: this.binaryType, extensions: this._extensions, isServer: this._isServer, maxPayload: r.maxPayload, skipUTF8Validation: r.skipUTF8Validation }), i = new sr(e, this._extensions, r.generateMask);
          this._receiver = n, this._sender = i, this._socket = e, n[S] = this, i[S] = this, e[S] = this, n.on("conclude", _r), n.on("drain", mr), n.on("error", yr), n.on("message", Sr), n.on("ping", Er), n.on("pong", xr), i.onerror = br, e.setTimeout && e.setTimeout(0), e.setNoDelay && e.setNoDelay(), s.length > 0 && e.unshift(s), e.on("close", qt), e.on("data", be), e.on("end", Wt), e.on("error", Ft), this._readyState = t.OPEN, this.emit("open");
        }
        emitClose() {
          if (!this._socket) {
            this._readyState = t.CLOSED, this.emit("close", this._closeCode, this._closeMessage);
            return;
          }
          this._extensions[D.extensionName] && this._extensions[D.extensionName].cleanup(), this._receiver.removeAllListeners(), this._readyState = t.CLOSED, this.emit("close", this._closeCode, this._closeMessage);
        }
        close(e, s) {
          if (this.readyState !== t.CLOSED) {
            if (this.readyState === t.CONNECTING) {
              w(this, this._req, "WebSocket was closed before the connection was established");
              return;
            }
            if (this.readyState === t.CLOSING) {
              this._closeFrameSent && (this._closeFrameReceived || this._receiver._writableState.errorEmitted) && this._socket.end();
              return;
            }
            this._readyState = t.CLOSING, this._sender.close(e, s, !this._isServer, (r) => {
              r || (this._closeFrameSent = true, (this._closeFrameReceived || this._receiver._writableState.errorEmitted) && this._socket.end());
            }), Ut(this);
          }
        }
        pause() {
          this.readyState === t.CONNECTING || this.readyState === t.CLOSED || (this._paused = true, this._socket.pause());
        }
        ping(e, s, r) {
          if (this.readyState === t.CONNECTING)
            throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
          if (typeof e == "function" ? (r = e, e = s = void 0) : typeof s == "function" && (r = s, s = void 0), typeof e == "number" && (e = e.toString()), this.readyState !== t.OPEN) {
            Ye(this, e, r);
            return;
          }
          s === void 0 && (s = !this._isServer), this._sender.ping(e || Ee, s, r);
        }
        pong(e, s, r) {
          if (this.readyState === t.CONNECTING)
            throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
          if (typeof e == "function" ? (r = e, e = s = void 0) : typeof s == "function" && (r = s, s = void 0), typeof e == "number" && (e = e.toString()), this.readyState !== t.OPEN) {
            Ye(this, e, r);
            return;
          }
          s === void 0 && (s = !this._isServer), this._sender.pong(e || Ee, s, r);
        }
        resume() {
          this.readyState === t.CONNECTING || this.readyState === t.CLOSED || (this._paused = false, this._receiver._writableState.needDrain || this._socket.resume());
        }
        send(e, s, r) {
          if (this.readyState === t.CONNECTING)
            throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
          if (typeof s == "function" && (r = s, s = {}), typeof e == "number" && (e = e.toString()), this.readyState !== t.OPEN) {
            Ye(this, e, r);
            return;
          }
          let n = { binary: typeof e != "string", mask: !this._isServer, compress: true, fin: true, ...s };
          this._extensions[D.extensionName] || (n.compress = false), this._sender.send(e || Ee, n, r);
        }
        terminate() {
          if (this.readyState !== t.CLOSED) {
            if (this.readyState === t.CONNECTING) {
              w(this, this._req, "WebSocket was closed before the connection was established");
              return;
            }
            this._socket && (this._readyState = t.CLOSING, this._socket.destroy());
          }
        }
      };
      Object.defineProperty(g, "CONNECTING", { enumerable: true, value: I.indexOf("CONNECTING") });
      Object.defineProperty(g.prototype, "CONNECTING", { enumerable: true, value: I.indexOf("CONNECTING") });
      Object.defineProperty(g, "OPEN", { enumerable: true, value: I.indexOf("OPEN") });
      Object.defineProperty(g.prototype, "OPEN", { enumerable: true, value: I.indexOf("OPEN") });
      Object.defineProperty(g, "CLOSING", { enumerable: true, value: I.indexOf("CLOSING") });
      Object.defineProperty(g.prototype, "CLOSING", { enumerable: true, value: I.indexOf("CLOSING") });
      Object.defineProperty(g, "CLOSED", { enumerable: true, value: I.indexOf("CLOSED") });
      Object.defineProperty(g.prototype, "CLOSED", { enumerable: true, value: I.indexOf("CLOSED") });
      ["binaryType", "bufferedAmount", "extensions", "isPaused", "protocol", "readyState", "url"].forEach((t) => {
        Object.defineProperty(g.prototype, t, { enumerable: true });
      });
      ["open", "error", "close", "message"].forEach((t) => {
        Object.defineProperty(g.prototype, `on${t}`, { enumerable: true, get() {
          for (let e of this.listeners(t))
            if (e[ze])
              return e[ir];
          return null;
        }, set(e) {
          for (let s of this.listeners(t))
            if (s[ze]) {
              this.removeListener(t, s);
              break;
            }
          typeof e == "function" && this.addEventListener(t, e, { [ze]: true });
        } });
      });
      g.prototype.addEventListener = ar;
      g.prototype.removeEventListener = lr;
      $t.exports = g;
      function Dt(t, e, s, r) {
        let n = { allowSynchronousEvents: true, autoPong: true, protocolVersion: He[1], maxPayload: 104857600, skipUTF8Validation: false, perMessageDeflate: true, followRedirects: false, maxRedirects: 10, ...r, socketPath: void 0, hostname: void 0, protocol: void 0, timeout: void 0, method: "GET", host: void 0, path: void 0, port: void 0 };
        if (t._autoPong = n.autoPong, !He.includes(n.protocolVersion))
          throw new RangeError(`Unsupported protocol version: ${n.protocolVersion} (supported versions: ${He.join(", ")})`);
        let i;
        if (e instanceof Ve)
          i = e;
        else
          try {
            i = new Ve(e);
          } catch {
            throw new SyntaxError(`Invalid URL: ${e}`);
          }
        i.protocol === "http:" ? i.protocol = "ws:" : i.protocol === "https:" && (i.protocol = "wss:"), t._url = i.href;
        let o = i.protocol === "wss:", l = i.protocol === "ws+unix:", c;
        if (i.protocol !== "ws:" && !o && !l ? c = `The URL's protocol must be one of "ws:", "wss:", "http:", "https:", or "ws+unix:"` : l && !i.pathname ? c = "The URL's pathname is empty" : i.hash && (c = "The URL contains a fragment identifier"), c) {
          let u = new SyntaxError(c);
          if (t._redirects === 0)
            throw u;
          xe(t, u);
          return;
        }
        let a = o ? 443 : 80, f = Qs(16).toString("base64"), h = o ? Xs.request : Js.request, p = /* @__PURE__ */ new Set(), _;
        if (n.createConnection = n.createConnection || (o ? gr : pr), n.defaultPort = n.defaultPort || a, n.port = i.port || a, n.host = i.hostname.startsWith("[") ? i.hostname.slice(1, -1) : i.hostname, n.headers = { ...n.headers, "Sec-WebSocket-Version": n.protocolVersion, "Sec-WebSocket-Key": f, Connection: "Upgrade", Upgrade: "websocket" }, n.path = i.pathname + i.search, n.timeout = n.handshakeTimeout, n.perMessageDeflate && (_ = new D(n.perMessageDeflate !== true ? n.perMessageDeflate : {}, false, n.maxPayload), n.headers["Sec-WebSocket-Extensions"] = cr({ [D.extensionName]: _.offer() })), s.length) {
          for (let u of s) {
            if (typeof u != "string" || !dr.test(u) || p.has(u))
              throw new SyntaxError("An invalid or duplicated subprotocol was specified");
            p.add(u);
          }
          n.headers["Sec-WebSocket-Protocol"] = s.join(",");
        }
        if (n.origin && (n.protocolVersion < 13 ? n.headers["Sec-WebSocket-Origin"] = n.origin : n.headers.Origin = n.origin), (i.username || i.password) && (n.auth = `${i.username}:${i.password}`), l) {
          let u = n.path.split(":");
          n.socketPath = u[0], n.path = u[1];
        }
        let m;
        if (n.followRedirects) {
          if (t._redirects === 0) {
            t._originalIpc = l, t._originalSecure = o, t._originalHostOrSocketPath = l ? n.socketPath : i.host;
            let u = r && r.headers;
            if (r = { ...r, headers: {} }, u)
              for (let [y, B] of Object.entries(u))
                r.headers[y.toLowerCase()] = B;
          } else if (t.listenerCount("redirect") === 0) {
            let u = l ? t._originalIpc ? n.socketPath === t._originalHostOrSocketPath : false : t._originalIpc ? false : i.host === t._originalHostOrSocketPath;
            (!u || t._originalSecure && !o) && (delete n.headers.authorization, delete n.headers.cookie, u || delete n.headers.host, n.auth = void 0);
          }
          n.auth && !r.headers.authorization && (r.headers.authorization = "Basic " + Buffer.from(n.auth).toString("base64")), m = t._req = h(n), t._redirects && t.emit("redirect", t.url, m);
        } else
          m = t._req = h(n);
        n.timeout && m.on("timeout", () => {
          w(t, m, "Opening handshake has timed out");
        }), m.on("error", (u) => {
          m === null || m[Rt] || (m = t._req = null, xe(t, u));
        }), m.on("response", (u) => {
          let y = u.headers.location, B = u.statusCode;
          if (y && n.followRedirects && B >= 300 && B < 400) {
            if (++t._redirects > n.maxRedirects) {
              w(t, m, "Maximum redirects exceeded");
              return;
            }
            m.abort();
            let d;
            try {
              d = new Ve(y, e);
            } catch {
              let q = new SyntaxError(`Invalid URL: ${y}`);
              xe(t, q);
              return;
            }
            Dt(t, d, s, r);
          } else
            t.emit("unexpected-response", m, u) || w(t, m, `Unexpected server response: ${u.statusCode}`);
        }), m.on("upgrade", (u, y, B) => {
          if (t.emit("upgrade", u), t.readyState !== g.CONNECTING)
            return;
          m = t._req = null;
          let d = u.headers.upgrade;
          if (d === void 0 || d.toLowerCase() !== "websocket") {
            w(t, y, "Invalid Upgrade header");
            return;
          }
          let Le = er("sha1").update(f + nr).digest("base64");
          if (u.headers["sec-websocket-accept"] !== Le) {
            w(t, y, "Invalid Sec-WebSocket-Accept header");
            return;
          }
          let q = u.headers["sec-websocket-protocol"], C;
          if (q !== void 0 ? p.size ? p.has(q) || (C = "Server sent an invalid subprotocol") : C = "Server sent a subprotocol but none was requested" : p.size && (C = "Server sent no subprotocol"), C) {
            w(t, y, C);
            return;
          }
          q && (t._protocol = q);
          let E = u.headers["sec-websocket-extensions"];
          if (E !== void 0) {
            if (!_) {
              w(t, y, "Server sent a Sec-WebSocket-Extensions header but no extension was requested");
              return;
            }
            let x;
            try {
              x = fr(E);
            } catch {
              w(t, y, "Invalid Sec-WebSocket-Extensions header");
              return;
            }
            let z = Object.keys(x);
            if (z.length !== 1 || z[0] !== D.extensionName) {
              w(t, y, "Server indicated an extension that was not requested");
              return;
            }
            try {
              _.accept(x[D.extensionName]);
            } catch {
              w(t, y, "Invalid Sec-WebSocket-Extensions header");
              return;
            }
            t._extensions[D.extensionName] = _;
          }
          t.setSocket(y, B, { allowSynchronousEvents: n.allowSynchronousEvents, generateMask: n.generateMask, maxPayload: n.maxPayload, skipUTF8Validation: n.skipUTF8Validation });
        }), n.finishRequest ? n.finishRequest(m, t) : m.end();
      }
      function xe(t, e) {
        t._readyState = g.CLOSING, t._errorEmitted = true, t.emit("error", e), t.emitClose();
      }
      function pr(t) {
        return t.path = t.socketPath, It.connect(t);
      }
      function gr(t) {
        return t.path = void 0, !t.servername && t.servername !== "" && (t.servername = It.isIP(t.host) ? "" : t.host), Zs.connect(t);
      }
      function w(t, e, s) {
        t._readyState = g.CLOSING;
        let r = new Error(s);
        Error.captureStackTrace(r, w), e.setHeader ? (e[Rt] = true, e.abort(), e.socket && !e.socket.destroyed && e.socket.destroy(), process.nextTick(xe, t, r)) : (e.destroy(r), e.once("error", t.emit.bind(t, "error")), e.once("close", t.emitClose.bind(t)));
      }
      function Ye(t, e, s) {
        if (e) {
          let r = rr(e) ? e.size : hr(e).length;
          t._socket ? t._sender._bufferedBytes += r : t._bufferedAmount += r;
        }
        if (s) {
          let r = new Error(`WebSocket is not open: readyState ${t.readyState} (${I[t.readyState]})`);
          process.nextTick(s, r);
        }
      }
      function _r(t, e) {
        let s = this[S];
        s._closeFrameReceived = true, s._closeMessage = e, s._closeCode = t, s._socket[S] !== void 0 && (s._socket.removeListener("data", be), process.nextTick(Mt, s._socket), t === 1005 ? s.close() : s.close(t, e));
      }
      function mr() {
        let t = this[S];
        t.isPaused || t._socket.resume();
      }
      function yr(t) {
        let e = this[S];
        e._socket[S] !== void 0 && (e._socket.removeListener("data", be), process.nextTick(Mt, e._socket), e.close(t[or])), e._errorEmitted || (e._errorEmitted = true, e.emit("error", t));
      }
      function At() {
        this[S].emitClose();
      }
      function Sr(t, e) {
        this[S].emit("message", t, e);
      }
      function Er(t) {
        let e = this[S];
        e._autoPong && e.pong(t, !this._isServer, Bt), e.emit("ping", t);
      }
      function xr(t) {
        this[S].emit("pong", t);
      }
      function Mt(t) {
        t.resume();
      }
      function br(t) {
        let e = this[S];
        e.readyState !== g.CLOSED && (e.readyState === g.OPEN && (e._readyState = g.CLOSING, Ut(e)), this._socket.end(), e._errorEmitted || (e._errorEmitted = true, e.emit("error", t)));
      }
      function Ut(t) {
        t._closeTimer = setTimeout(t._socket.destroy.bind(t._socket), ur);
      }
      function qt() {
        let t = this[S];
        this.removeListener("close", qt), this.removeListener("data", be), this.removeListener("end", Wt), t._readyState = g.CLOSING;
        let e;
        !this._readableState.endEmitted && !t._closeFrameReceived && !t._receiver._writableState.errorEmitted && (e = t._socket.read()) !== null && t._receiver.write(e), t._receiver.end(), this[S] = void 0, clearTimeout(t._closeTimer), t._receiver._writableState.finished || t._receiver._writableState.errorEmitted ? t.emitClose() : (t._receiver.on("error", At), t._receiver.on("finish", At));
      }
      function be(t) {
        this[S]._receiver.write(t) || this.pause();
      }
      function Wt() {
        let t = this[S];
        t._readyState = g.CLOSING, t._receiver.end(), this.end();
      }
      function Ft() {
        let t = this[S];
        this.removeListener("error", Ft), this.on("error", Bt), t && (t._readyState = g.CLOSING, this.destroy());
      }
    });
    var zt = b((vn, Vt) => {
      "use strict";
      var wn = we(), { Duplex: wr } = require("stream");
      function jt(t) {
        t.emit("close");
      }
      function vr() {
        !this.destroyed && this._writableState.finished && this.destroy();
      }
      function Gt(t) {
        this.removeListener("error", Gt), this.destroy(), this.listenerCount("error") === 0 && this.emit("error", t);
      }
      function Tr(t, e) {
        let s = true, r = new wr({ ...e, autoDestroy: false, emitClose: false, objectMode: false, writableObjectMode: false });
        return t.on("message", function(i, o) {
          let l = !o && r._readableState.objectMode ? i.toString() : i;
          r.push(l) || t.pause();
        }), t.once("error", function(i) {
          r.destroyed || (s = false, r.destroy(i));
        }), t.once("close", function() {
          r.destroyed || r.push(null);
        }), r._destroy = function(n, i) {
          if (t.readyState === t.CLOSED) {
            i(n), process.nextTick(jt, r);
            return;
          }
          let o = false;
          t.once("error", function(c) {
            o = true, i(c);
          }), t.once("close", function() {
            o || i(n), process.nextTick(jt, r);
          }), s && t.terminate();
        }, r._final = function(n) {
          if (t.readyState === t.CONNECTING) {
            t.once("open", function() {
              r._final(n);
            });
            return;
          }
          t._socket !== null && (t._socket._writableState.finished ? (n(), r._readableState.endEmitted && r.destroy()) : (t._socket.once("finish", function() {
            n();
          }), t.close()));
        }, r._read = function() {
          t.isPaused && t.resume();
        }, r._write = function(n, i, o) {
          if (t.readyState === t.CONNECTING) {
            t.once("open", function() {
              r._write(n, i, o);
            });
            return;
          }
          t.send(n, o);
        }, r.on("end", vr), r.on("error", Gt), r;
      }
      Vt.exports = Tr;
    });
    var Yt = b((Tn, Ht) => {
      "use strict";
      var { tokenChars: kr } = J();
      function Or(t) {
        let e = /* @__PURE__ */ new Set(), s = -1, r = -1, n = 0;
        for (n; n < t.length; n++) {
          let o = t.charCodeAt(n);
          if (r === -1 && kr[o] === 1)
            s === -1 && (s = n);
          else if (n !== 0 && (o === 32 || o === 9))
            r === -1 && s !== -1 && (r = n);
          else if (o === 44) {
            if (s === -1)
              throw new SyntaxError(`Unexpected character at index ${n}`);
            r === -1 && (r = n);
            let l = t.slice(s, r);
            if (e.has(l))
              throw new SyntaxError(`The "${l}" subprotocol is duplicated`);
            e.add(l), s = r = -1;
          } else
            throw new SyntaxError(`Unexpected character at index ${n}`);
        }
        if (s === -1 || r !== -1)
          throw new SyntaxError("Unexpected end of input");
        let i = t.slice(s, n);
        if (e.has(i))
          throw new SyntaxError(`The "${i}" subprotocol is duplicated`);
        return e.add(i), e;
      }
      Ht.exports = { parse: Or };
    });
    var ts = b((On, es) => {
      "use strict";
      var Lr = require("events"), ve = require("http"), { Duplex: kn } = require("stream"), { createHash: Cr } = require("crypto"), Kt = Ge(), j = ie(), Pr = Yt(), Nr = we(), { GUID: Ar, kWebSocket: Ir } = P(), Br = /^[+/0-9A-Za-z]{22}==$/, Xt = 0, Jt = 1, Qt = 2, Ke = class extends Lr {
        constructor(e, s) {
          if (super(), e = { allowSynchronousEvents: true, autoPong: true, maxPayload: 100 * 1024 * 1024, skipUTF8Validation: false, perMessageDeflate: false, handleProtocols: null, clientTracking: true, verifyClient: null, noServer: false, backlog: null, server: null, host: null, path: null, port: null, WebSocket: Nr, ...e }, e.port == null && !e.server && !e.noServer || e.port != null && (e.server || e.noServer) || e.server && e.noServer)
            throw new TypeError('One and only one of the "port", "server", or "noServer" options must be specified');
          if (e.port != null ? (this._server = ve.createServer((r, n) => {
            let i = ve.STATUS_CODES[426];
            n.writeHead(426, { "Content-Length": i.length, "Content-Type": "text/plain" }), n.end(i);
          }), this._server.listen(e.port, e.host, e.backlog, s)) : e.server && (this._server = e.server), this._server) {
            let r = this.emit.bind(this, "connection");
            this._removeListeners = Rr(this._server, { listening: this.emit.bind(this, "listening"), error: this.emit.bind(this, "error"), upgrade: (n, i, o) => {
              this.handleUpgrade(n, i, o, r);
            } });
          }
          e.perMessageDeflate === true && (e.perMessageDeflate = {}), e.clientTracking && (this.clients = /* @__PURE__ */ new Set(), this._shouldEmitClose = false), this.options = e, this._state = Xt;
        }
        address() {
          if (this.options.noServer)
            throw new Error('The server is operating in "noServer" mode');
          return this._server ? this._server.address() : null;
        }
        close(e) {
          if (this._state === Qt) {
            e && this.once("close", () => {
              e(new Error("The server is not running"));
            }), process.nextTick(ce, this);
            return;
          }
          if (e && this.once("close", e), this._state !== Jt)
            if (this._state = Jt, this.options.noServer || this.options.server)
              this._server && (this._removeListeners(), this._removeListeners = this._server = null), this.clients ? this.clients.size ? this._shouldEmitClose = true : process.nextTick(ce, this) : process.nextTick(ce, this);
            else {
              let s = this._server;
              this._removeListeners(), this._removeListeners = this._server = null, s.close(() => {
                ce(this);
              });
            }
        }
        shouldHandle(e) {
          if (this.options.path) {
            let s = e.url.indexOf("?");
            if ((s !== -1 ? e.url.slice(0, s) : e.url) !== this.options.path)
              return false;
          }
          return true;
        }
        handleUpgrade(e, s, r, n) {
          s.on("error", Zt);
          let i = e.headers["sec-websocket-key"], o = e.headers.upgrade, l = +e.headers["sec-websocket-version"];
          if (e.method !== "GET") {
            G(this, e, s, 405, "Invalid HTTP method");
            return;
          }
          if (o === void 0 || o.toLowerCase() !== "websocket") {
            G(this, e, s, 400, "Invalid Upgrade header");
            return;
          }
          if (i === void 0 || !Br.test(i)) {
            G(this, e, s, 400, "Missing or invalid Sec-WebSocket-Key header");
            return;
          }
          if (l !== 13 && l !== 8) {
            G(this, e, s, 400, "Missing or invalid Sec-WebSocket-Version header", { "Sec-WebSocket-Version": "13, 8" });
            return;
          }
          if (!this.shouldHandle(e)) {
            fe(s, 400);
            return;
          }
          let c = e.headers["sec-websocket-protocol"], a = /* @__PURE__ */ new Set();
          if (c !== void 0)
            try {
              a = Pr.parse(c);
            } catch {
              G(this, e, s, 400, "Invalid Sec-WebSocket-Protocol header");
              return;
            }
          let f = e.headers["sec-websocket-extensions"], h = {};
          if (this.options.perMessageDeflate && f !== void 0) {
            let p = new j(this.options.perMessageDeflate, true, this.options.maxPayload);
            try {
              let _ = Kt.parse(f);
              _[j.extensionName] && (p.accept(_[j.extensionName]), h[j.extensionName] = p);
            } catch {
              G(this, e, s, 400, "Invalid or unacceptable Sec-WebSocket-Extensions header");
              return;
            }
          }
          if (this.options.verifyClient) {
            let p = { origin: e.headers[`${l === 8 ? "sec-websocket-origin" : "origin"}`], secure: !!(e.socket.authorized || e.socket.encrypted), req: e };
            if (this.options.verifyClient.length === 2) {
              this.options.verifyClient(p, (_, m, u, y) => {
                if (!_)
                  return fe(s, m || 401, u, y);
                this.completeUpgrade(h, i, a, e, s, r, n);
              });
              return;
            }
            if (!this.options.verifyClient(p))
              return fe(s, 401);
          }
          this.completeUpgrade(h, i, a, e, s, r, n);
        }
        completeUpgrade(e, s, r, n, i, o, l) {
          if (!i.readable || !i.writable)
            return i.destroy();
          if (i[Ir])
            throw new Error("server.handleUpgrade() was called more than once with the same socket, possibly due to a misconfiguration");
          if (this._state > Xt)
            return fe(i, 503);
          let a = ["HTTP/1.1 101 Switching Protocols", "Upgrade: websocket", "Connection: Upgrade", `Sec-WebSocket-Accept: ${Cr("sha1").update(s + Ar).digest("base64")}`], f = new this.options.WebSocket(null, void 0, this.options);
          if (r.size) {
            let h = this.options.handleProtocols ? this.options.handleProtocols(r, n) : r.values().next().value;
            h && (a.push(`Sec-WebSocket-Protocol: ${h}`), f._protocol = h);
          }
          if (e[j.extensionName]) {
            let h = e[j.extensionName].params, p = Kt.format({ [j.extensionName]: [h] });
            a.push(`Sec-WebSocket-Extensions: ${p}`), f._extensions = e;
          }
          this.emit("headers", a, n), i.write(a.concat(`\r
`).join(`\r
`)), i.removeListener("error", Zt), f.setSocket(i, o, { allowSynchronousEvents: this.options.allowSynchronousEvents, maxPayload: this.options.maxPayload, skipUTF8Validation: this.options.skipUTF8Validation }), this.clients && (this.clients.add(f), f.on("close", () => {
            this.clients.delete(f), this._shouldEmitClose && !this.clients.size && process.nextTick(ce, this);
          })), l(f, n);
        }
      };
      es.exports = Ke;
      function Rr(t, e) {
        for (let s of Object.keys(e))
          t.on(s, e[s]);
        return function() {
          for (let r of Object.keys(e))
            t.removeListener(r, e[r]);
        };
      }
      function ce(t) {
        t._state = Qt, t.emit("close");
      }
      function Zt() {
        this.destroy();
      }
      function fe(t, e, s, r) {
        s = s || ve.STATUS_CODES[e], r = { Connection: "close", "Content-Type": "text/html", "Content-Length": Buffer.byteLength(s), ...r }, t.once("finish", t.destroy), t.end(`HTTP/1.1 ${e} ${ve.STATUS_CODES[e]}\r
` + Object.keys(r).map((n) => `${n}: ${r[n]}`).join(`\r
`) + `\r
\r
` + s);
      }
      function G(t, e, s, r, n, i) {
        if (t.listenerCount("wsClientError")) {
          let o = new Error(n);
          Error.captureStackTrace(o, G), t.emit("wsClientError", o, s, e);
        } else
          fe(s, r, n, i);
      }
    });
    var ln = {};
    _s(ln, { PagesAI: () => Oe, buildApiMeta: () => en });
    module.exports = ms(ln);
    var Dr = Y(zt(), 1), Mr = Y(qe(), 1), Ur = Y($e(), 1), ss = Y(we(), 1), qr = Y(ts(), 1);
    var rs = ss.default;
    var Wr = "https://pages-api.cloud.tencent.com", Fr = "https://pages-api.edgeone.ai", $r = [Wr, Fr], Te = "/v1", ke = class {
      baseUrl;
      baseSelectionPromise;
      apiToken;
      defaultEngineModelType;
      defaultTtsVoiceId;
      appId;
      requestMeta;
      baseCandidates;
      debugLog;
      constructor(e) {
        if (!e.apiToken)
          throw new Error("PAGES_API_TOKEN is required");
        this.baseUrl = null, this.baseSelectionPromise = null, this.apiToken = e.apiToken.trim(), this.defaultEngineModelType = e.defaultEngineModelType, this.defaultTtsVoiceId = e.defaultTtsVoiceId, this.appId = e.appId, this.requestMeta = e.requestMeta || {}, this.baseCandidates = Vr(e.baseUrls), this.debugLog = typeof e.debugLog == "function" ? e.debugLog : null;
      }
      async signAsr(e = {}) {
        var _a2;
        let s = await this.request(Te, { Action: "SignPagesAiAsr", EngineModelType: e.engineModelType || this.defaultEngineModelType, VoiceId: e.voiceId, ApiToken: this.apiToken, ...this.requestMeta, ...this.appId !== void 0 ? { AppId: this.appId } : {} });
        if (!((_a2 = s == null ? void 0 : s.Asr) == null ? void 0 : _a2.websocketUrl)) {
          let r = is(s);
          throw new Error(`ASR signature response is invalid${r ? `: ${r}` : ""}`);
        }
        return s.Asr;
      }
      async signTts(e, s = {}) {
        var _a2, _b, _c;
        let r = (e || "").trim();
        if (!r)
          throw new Error("TTS text is empty");
        let n = await this.request(Te, { Action: "SignPagesAiTts", ApiToken: this.apiToken, VoiceId: s.voiceId || this.defaultTtsVoiceId, Text: r, ...this.requestMeta, ...this.appId !== void 0 ? { AppId: this.appId } : {} });
        if (!((_a2 = n.Tts) == null ? void 0 : _a2.headers) || !((_b = n.Tts) == null ? void 0 : _b.endpoint) || !((_c = n.Tts) == null ? void 0 : _c.payload)) {
          let i = is(n);
          throw new Error(`TTS signature response is invalid${i ? `: ${i}` : ""}`);
        }
        return n.Tts;
      }
      async completeLlm(e) {
        var _a2;
        let r = (_a2 = await this.callLlmEndpoint({ ApiToken: this.apiToken, ...this.requestMeta, ...this.appId !== void 0 ? { AppId: this.appId } : {}, Messages: e })) == null ? void 0 : _a2.Content;
        if (typeof r != "string" || !r.trim())
          throw new Error("LLM response missing content");
        return r;
      }
      async callLlmEndpoint(e) {
        return this.request(Te, { ...e, Action: "CompletePagesAiLlm" });
      }
      async request(e, s) {
        let r = await this.ensureBaseUrl(), n = new URL(e, r), i;
        M(this.debugLog, "pages-ai:http:request", { url: n.toString(), payload: s, headers: { "Content-Type": "application/json", Authorization: zr(`Bearer ${this.apiToken}`) } });
        try {
          i = await fetch(n.toString(), { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.apiToken}` }, body: JSON.stringify(s) });
        } catch (a) {
          throw M(this.debugLog, "pages-ai:http:error", { url: n.toString(), error: (a == null ? void 0 : a.message) || String(a) }), new Error((a == null ? void 0 : a.message) || String(a));
        }
        let o = await i.text();
        M(this.debugLog, "pages-ai:http:response", { url: n.toString(), status: i.status, statusText: i.statusText, headers: os(i.headers), body: o });
        let l = {};
        try {
          l = o ? JSON.parse(o) : {};
        } catch {
          l = {};
        }
        let c = jr(l);
        if (!i.ok) {
          let a = Gr(c) || i.statusText || "Request failed";
          throw new Error(`[${i.status}] ${a}`);
        }
        return c || {};
      }
      async ensureBaseUrl() {
        if (this.baseUrl)
          return this.baseUrl;
        if (this.baseSelectionPromise)
          return this.baseSelectionPromise;
        this.baseSelectionPromise = this.detectBaseUrl();
        try {
          let e = await this.baseSelectionPromise;
          return this.baseUrl = e, e;
        } finally {
          this.baseSelectionPromise = null;
        }
      }
      async detectBaseUrl() {
        M(this.debugLog, "pages-ai:http:detect-base", { candidates: this.baseCandidates });
        let e = await Promise.all(this.baseCandidates.map((n) => this.probeBase(n))), s = e.find((n) => n.ok);
        if (M(this.debugLog, "pages-ai:http:detect-base:result", { probes: e, winner: (s == null ? void 0 : s.base) || null }), s == null ? void 0 : s.base)
          return s.base;
        let r = e.map((n) => `${n.base}: ${n.reason || "Unknown error"}`).join("; ");
        throw new Error(`All endpoints failed: ${r}`);
      }
      async probeBase(e) {
        let s = new URL(Te, e);
        M(this.debugLog, "pages-ai:http:probe:request", { base: e, url: s.toString() });
        try {
          let r = await fetch(s.toString(), { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.apiToken}` }, body: JSON.stringify({ Action: "TokenPing" }) }), n = await r.text();
          M(this.debugLog, "pages-ai:http:probe:response", { base: e, status: r.status, statusText: r.statusText, headers: os(r.headers), body: n });
          let i = {};
          try {
            i = n ? JSON.parse(n) : {};
          } catch {
            i = {};
          }
          if (!r.ok)
            return { base: e, ok: false, reason: `[${r.status}] ${r.statusText || "Request failed"}` };
          let o = (i == null ? void 0 : i.Code) ?? (i == null ? void 0 : i.code), l = (i == null ? void 0 : i.Message) ?? (i == null ? void 0 : i.message) ?? "";
          if (o === 109 || typeof l == "string" && l.toLowerCase().includes("region")) {
            let a = [o, l].filter(Boolean).join(": ");
            return { base: e, ok: false, reason: a || "Token not allowed for this region" };
          }
          return { base: e, ok: true };
        } catch (r) {
          return M(this.debugLog, "pages-ai:http:probe:error", { base: e, url: s.toString(), error: (r == null ? void 0 : r.message) || String(r) }), { base: e, ok: false, reason: (r == null ? void 0 : r.message) || String(r) };
        }
      }
    };
    function ns(t) {
      let e = (t || "").trim(), s = e && /^[a-z]+:\/\//i.test(e) ? e : `https://${e}`;
      return s.endsWith("/") ? s : `${s}/`;
    }
    function jr(t) {
      if (t && typeof t == "object") {
        if (t.Data && typeof t.Data == "object")
          return t.Data.Response && typeof t.Data.Response == "object" ? t.Data.Response : t.Data;
        if (t.Response && typeof t.Response == "object")
          return t.Response;
      }
      return t || {};
    }
    function Gr(t) {
      if (!t || typeof t != "object")
        return "";
      let e = t.Error || t.error;
      return (e == null ? void 0 : e.Message) ? e.Message : typeof e == "string" ? e : t.message || t.Message || "";
    }
    function is(t) {
      try {
        return JSON.stringify(t);
      } catch {
        return "";
      }
    }
    function Vr(t) {
      let e = $r.map(ns), s = (t || []).map(ns).filter((i) => !!i), r = /* @__PURE__ */ new Set(), n = [];
      return [...s, ...e].forEach((i) => {
        !i || r.has(i) || (r.add(i), n.push(i));
      }), n.length ? n : e;
    }
    function M(t, e, s) {
      if (t)
        try {
          t(e, s);
        } catch {
        }
    }
    function zr(t) {
      if (!t)
        return t;
      let e = Math.min(6, Math.floor(t.length / 3));
      return `${t.slice(0, e)}***${t.slice(-e)}`;
    }
    function os(t) {
      if (!t)
        return {};
      if (typeof t.entries == "function")
        return Array.from(t.entries()).reduce((r, [n, i]) => (r[n] = i, r), {});
      let e = {};
      return Object.entries(t).forEach(([s, r]) => {
        e[s.toLowerCase()] = r;
      }), e;
    }
    var Xe = Y(require("https")), Hr = Xe.default.request.bind(Xe.default);
    function as(t, e = {}, s = null) {
      let { endpoint: r, payload: n, headers: i } = t;
      if (!n)
        throw new Error("TTS payload missing");
      let { signal: o } = e;
      if (o == null ? void 0 : o.aborted)
        throw new Error("Aborted");
      let l = { ...i, "Content-Length": (i == null ? void 0 : i["Content-Length"]) ?? Buffer.byteLength(n) };
      U(s, "pages-ai:tts:sse:request", { endpoint: r, headers: l, payload: n });
      let c = null, a = false, f = null, h = [], p = null, _ = () => {
        p && (p(), p = null);
      }, m = (d) => {
        a || (h.push(d), _());
      }, u = () => {
        a || (a = true, _());
      }, y = (d) => {
        a || (f = d instanceof Error ? d : new Error(String(d)), a = true, _());
      }, B = { async next() {
        if (h.length)
          return { value: h.shift(), done: false };
        if (f)
          throw f;
        if (a)
          return { value: void 0, done: true };
        if (await new Promise((d) => {
          p = d;
        }), h.length)
          return { value: h.shift(), done: false };
        if (f)
          throw f;
        return { value: void 0, done: true };
      }, async return() {
        if (u(), c)
          try {
            c.destroy();
          } catch {
          }
        return { value: void 0, done: true };
      }, [Symbol.asyncIterator]() {
        return this;
      } };
      return c = Hr({ hostname: r, port: 443, path: "/", method: "POST", signal: o, headers: l }, (d) => {
        if (U(s, "pages-ai:tts:sse:response", { endpoint: r, statusCode: d.statusCode, statusMessage: d.statusMessage, headers: d.headers }), !(d.headers["content-type"] || "").toLowerCase().includes("text/event-stream")) {
          let E = "";
          d.on("data", (x) => {
            E += x.toString();
          }), d.on("end", () => {
            var _a2, _b;
            let x = `TTS request failed with status ${d.statusCode ?? ""}`.trim();
            if (E)
              try {
                let k = (_b = (_a2 = JSON.parse(E)) == null ? void 0 : _a2.Response) == null ? void 0 : _b.Error;
                (k == null ? void 0 : k.Message) ? x = `${k.Code || "Error"}: ${k.Message}` : x = `${x}: ${E.slice(0, 200)}`;
              } catch {
                x = `${x}: ${E.slice(0, 200)}`;
              }
            U(s, "pages-ai:tts:sse:error-response", { endpoint: r, statusCode: d.statusCode, statusMessage: d.statusMessage, headers: d.headers, body: E }), y(new Error(x));
          }), d.on("error", y);
          return;
        }
        let C = "";
        d.on("data", (E) => {
          C += E.toString();
          let x = C.split(`
`);
          C = x.pop() || "";
          for (let z of x)
            if (z.startsWith("data:")) {
              let k = z.slice(5).trim();
              if (k)
                try {
                  m({ data: k }), U(s, "pages-ai:tts:sse:event", { endpoint: r, data: Yr(k) });
                } catch (H) {
                  let fs = H instanceof Error ? H.message : String(H);
                  console.error("\u89E3\u6790 SSE \u6570\u636E\u5931\u8D25:", fs);
                }
            }
        }), d.on("end", () => {
          U(s, "pages-ai:tts:sse:end", { endpoint: r }), u();
        }), d.on("error", (E) => {
          U(s, "pages-ai:tts:sse:error", { endpoint: r, message: E instanceof Error ? E.message : String(E) }), y(E);
        });
      }), c.on("error", (d) => {
        U(s, "pages-ai:tts:sse:request-error", { endpoint: r, message: d instanceof Error ? d.message : String(d) }), y(d);
      }), o && o.addEventListener("abort", () => {
        U(s, "pages-ai:tts:sse:aborted", { endpoint: r }), y(new Error("Aborted")), c == null ? void 0 : c.destroy(new Error("Aborted"));
      }, { once: true }), c.write(n), c.end(), B;
    }
    function U(t, e, s) {
      if (t)
        try {
          t(e, s);
        } catch {
        }
    }
    function Yr(t) {
      return !t || t.length <= 200 ? t : { preview: t.slice(0, 200), length: t.length };
    }
    var Kr = 251195406, Xr = "16k_zh_en", Jr = void 0, Zr = ["https://pages-api.cloud.tencent.com", "https://pages-api.edgeone.ai"], ls = { Version: "2022-09-01", Region: "ch", Language: "zh", RequestId: "111", ClientIp: "1.1.1.1", ApiModule: "teo", RequestSource: "API", CamContext: "hall", AccountArea: "0", Uin: "100000043181", SubAccountUin: "100000043181", Timestamp: "111" }, cs = false, Oe = (_a = class {
      constructor(e) {
        __publicField(this, "asr");
        __publicField(this, "llm");
        __publicField(this, "tts");
        __privateAdd(this, _e, void 0);
        __privateAdd(this, _t, void 0);
        if (!(e == null ? void 0 : e.apiToken))
          throw new Error("apiToken is required to initialize PagesAI");
        let s = Qr(e), r = nn(s.debugLogger);
        __privateSet(this, _t, r), __privateSet(this, _e, new ke({ apiToken: s.apiToken, defaultEngineModelType: s.engineModelType, defaultTtsVoiceId: s.ttsVoiceId, appId: s.appId, baseUrls: s.apiBaseUrls, requestMeta: s.apiMeta, debugLog: r })), this.asr = se(tn(__privateGet(this, _e), r)), this.llm = se(sn(__privateGet(this, _e), r)), this.tts = se(rn(__privateGet(this, _e), r)), se(this);
      }
    }, _e = new WeakMap(), _t = new WeakMap(), _a);
    function Qr(t) {
      return { apiToken: t.apiToken, engineModelType: Xr, ttsVoiceId: Jr, appId: Kr, apiBaseUrls: Zr, apiMeta: ls, debugLogger: cs ? t.debugLogger : null };
    }
    function en() {
      return { ...ls };
    }
    function tn(t, e) {
      return { async createSocket() {
        try {
          let s = await t.signAsr();
          V(e, "pages-ai:asr:sign", s);
          let r = new rs(s.websocketUrl, { perMessageDeflate: false, headers: s.headers });
          return r.on("open", () => V(e, "pages-ai:asr:socket:open", { url: s.websocketUrl })), r.on("close", (n, i) => {
            var _a2;
            return V(e, "pages-ai:asr:socket:close", { url: s.websocketUrl, code: n, reason: (_a2 = i == null ? void 0 : i.toString) == null ? void 0 : _a2.call(i) });
          }), r.on("error", (n) => V(e, "pages-ai:asr:socket:error", { url: s.websocketUrl, message: (n == null ? void 0 : n.message) || String(n) })), r.on("message", (n) => V(e, "pages-ai:asr:socket:message", { url: s.websocketUrl, message: on(n) })), se({ socket: r, engineModelType: s.engineModelType, voiceId: s.voiceId });
        } catch (s) {
          let r = s instanceof Error ? s.message : String(s);
          throw new Error(`ASR runtime not configured: ${r}`);
        }
      } };
    }
    function sn(t, e) {
      return { async complete(s) {
        if (!Array.isArray(s) || !s.length)
          throw new Error("LLM messages are empty");
        return V(e, "pages-ai:llm:complete", { messages: s }), t.completeLlm(s);
      } };
    }
    function rn(t, e) {
      return { async synthesize(s, r = {}) {
        let n = (s || "").trim();
        if (!n)
          throw new Error("TTS text is empty");
        V(e, "pages-ai:tts:synthesize", { text: n });
        let i = await t.signTts(n);
        return as(i, { signal: r == null ? void 0 : r.signal }, e);
      } };
    }
    function se(t) {
      if (!t || typeof t != "object" || Object.isFrozen(t))
        return t;
      let e = Object.getPrototypeOf(t);
      return !(e === Object.prototype || e === null) && !Array.isArray(t) || (Object.freeze(t), Object.getOwnPropertyNames(t).forEach((r) => {
        let n = t[r];
        n && typeof n == "object" && !Object.isFrozen(n) && se(n);
      })), t;
    }
    function nn(t) {
      return cs && typeof t == "function" ? (e, s) => {
        try {
          t(e, s);
        } catch {
        }
      } : null;
    }
    function V(t, e, s) {
      t && t(e, s);
    }
    function on(t) {
      return t == null || typeof t == "string" ? t : Buffer.isBuffer(t) ? { type: "buffer", length: t.length, preview: t.toString("utf8", 0, Math.min(128, t.length)) } : typeof t.toString == "function" ? t.toString() : t;
    }
    function an() {
      if (typeof globalThis > "u")
        return;
      let t = globalThis;
      t.PagesAI || Object.defineProperty(t, "PagesAI", { configurable: false, enumerable: false, writable: false, value: Oe });
    }
    an();
  }
});
export default require_stdin();

var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined")
    return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// <stdin>
import http from "http";
import crypto2 from "crypto";
import crypto3 from "crypto";
(async function() {
  var kvModule = { exports: {} };
  (function(module, exports) {
    var O = Object.create;
    var v = Object.defineProperty;
    var Y = Object.getOwnPropertyDescriptor;
    var F = Object.getOwnPropertyNames;
    var Z = Object.getPrototypeOf, X = Object.prototype.hasOwnProperty;
    var J = (r, e) => {
      for (var t in e)
        v(r, t, { get: e[t], enumerable: true });
    }, x = (r, e, t, n) => {
      if (e && typeof e == "object" || typeof e == "function")
        for (let o of F(e))
          !X.call(r, o) && o !== t && v(r, o, { get: () => e[o], enumerable: !(n = Y(e, o)) || n.enumerable });
      return r;
    };
    var W = (r, e, t) => (t = r != null ? O(Z(r)) : {}, x(e || !r || !r.__esModule ? v(t, "default", { value: r, enumerable: true }) : t, r)), q = (r) => x(v({}, "__esModule", { value: true }), r);
    var ne = {};
    J(ne, { bootstrap: () => re, createKVClient: () => S, getConfigs: () => M, initKVBindings: () => z });
    module.exports = q(ne);
    var k = W(__require("net"));
    var K = class {
      static encodeCommand(e) {
        let t = [];
        t.push(`*${e.length}\r
`);
        for (let n of e) {
          let o = Buffer.byteLength(n, "utf8");
          t.push("$" + o + `\r
` + n + `\r
`);
        }
        return t.join("");
      }
      static encodeCommandBuffer(e) {
        let t = [];
        t.push(Buffer.from(`*${e.length}\r
`));
        for (let n of e) {
          let o = typeof n == "string" ? Buffer.from(n, "utf8") : n;
          t.push(Buffer.from("$" + o.length + `\r
`)), t.push(o), t.push(Buffer.from(`\r
`));
        }
        return Buffer.concat(t);
      }
    }, w = class {
      buffer = "";
      append(e) {
        Buffer.isBuffer(e) ? this.buffer += e.toString("utf8") : this.buffer += e;
      }
      get bufferLength() {
        return this.buffer.length;
      }
      clear() {
        this.buffer = "";
      }
      parse() {
        var o;
        if (this.buffer.length === 0)
          return null;
        let e = this.buffer[0], t = this.buffer.indexOf(`\r
`);
        if (t === -1)
          return null;
        let n = this.buffer.substring(1, t);
        switch (e) {
          case "+":
            return this.buffer = this.buffer.substring(t + 2), { type: "simple_string", value: n };
          case "-":
            return this.buffer = this.buffer.substring(t + 2), { type: "error", value: n };
          case ":":
            return this.buffer = this.buffer.substring(t + 2), { type: "integer", value: parseInt(n, 10) };
          case "$":
            return this.parseBulkString(n, t);
          case "*":
            return this.parseArray(n, t);
          default: {
            let f = e.charCodeAt(0), a = this.buffer.substring(0, 100).replace(/\r/g, "\\r").replace(/\n/g, "\\n").replace(/\t/g, "\\t"), u = ((o = Buffer.from(this.buffer.substring(0, 20)).toString("hex").match(/.{1,2}/g)) == null ? void 0 : o.join(" ")) || "";
            throw new Error(`Unknown RESP type: '${e}' (char code: ${f}, hex: 0x${f.toString(16)})
Buffer length: ${this.buffer.length}
Buffer preview (first 100 chars): ${a}
Buffer hex (first 20 bytes): ${u}`);
          }
        }
      }
      parseBulkString(e, t) {
        let n = parseInt(e, 10);
        if (n === -1)
          return this.buffer = this.buffer.substring(t + 2), { type: "null", value: null };
        let o = t + 2, f = o + n, a = f + 2;
        if (this.buffer.length < a)
          return null;
        let u = this.buffer.substring(o, f);
        return this.buffer = this.buffer.substring(a), { type: "bulk_string", value: u };
      }
      parseArray(e, t) {
        let n = parseInt(e, 10);
        if (n === -1)
          return this.buffer = this.buffer.substring(t + 2), { type: "null", value: null };
        if (n === 0)
          return this.buffer = this.buffer.substring(t + 2), { type: "array", value: [] };
        let o = this.buffer;
        this.buffer = this.buffer.substring(t + 2);
        let f = [];
        for (let a = 0; a < n; a++) {
          let u = this.parse();
          if (u === null)
            return this.buffer = o, null;
          f.push(u);
        }
        return { type: "array", value: f };
      }
    };
    var R = "EO_KV_BINDINGS";
    var A = /^[a-zA-Z0-9_]+$/;
    var V = class {
      socket = null;
      decoder = new w();
      responseQueue = [];
      host;
      port;
      timeout;
      debug;
      connected = false;
      constructor(e) {
        this.host = e.host, this.port = e.port, this.timeout = e.timeout ?? 1e4, this.debug = e.debug ?? false;
      }
      log(e, ...t) {
        this.debug && console.log(`[RespConnection] ${e}`, ...t);
      }
      connect() {
        return new Promise((e, t) => {
          this.log("Connecting to KV service..."), this.socket = k.createConnection({ host: this.host, port: this.port }), this.socket.on("connect", () => {
            this.log("TCP connection established"), this.connected = true, e();
          }), this.socket.on("data", (n) => {
            this.decoder.append(n), this.processResponses();
          }), this.socket.on("error", (n) => {
            this.log(`Socket error: ${n.message}`), t(new Error("KV connection failed"));
          }), this.socket.on("close", (n) => {
            for (this.log(`Connection closed (hadError: ${n}, pending: ${this.responseQueue.length})`), this.connected = false; this.responseQueue.length > 0; ) {
              let { reject: o } = this.responseQueue.shift();
              o(new Error("Connection closed by server"));
            }
          }), this.socket.setTimeout(this.timeout, () => {
            this.log(`Connection timeout after ${this.timeout}ms`), t(new Error("KV connection timeout"));
          });
        });
      }
      processResponses() {
        let e;
        for (; (e = this.decoder.parse()) !== null; )
          if (this.responseQueue.length > 0) {
            let { resolve: t, reject: n } = this.responseQueue.shift();
            e.type === "error" ? n(new Error(e.value)) : t(e);
          }
      }
      sendCommand(e) {
        return new Promise((t, n) => {
          if (!this.socket || !this.connected) {
            n(new Error("Not connected"));
            return;
          }
          let o = K.encodeCommand(e);
          this.log(`Sending command: ${e[0]} (${o.length} bytes)`), this.responseQueue.push({ resolve: t, reject: n }), this.socket.write(o, (f) => {
            f && this.log(`Write error: ${f.message}`);
          });
        });
      }
      close() {
        this.socket && (this.socket.end(), this.socket = null), this.connected = false;
      }
    };
    function I(r) {
      if (!r || typeof r != "string")
        throw new Error("Key must be a non-empty string");
      let e = Buffer.byteLength(r, "utf-8");
      if (e > 512)
        throw new Error(`Key size exceeds maximum limit of ${512} bytes (got ${e} bytes)`);
      if (!A.test(r))
        throw new Error("Key can only contain letters, numbers, and underscores");
    }
    function L(r) {
      if (r.length > 26214400)
        throw new Error(`Value size exceeds maximum limit of ${26214400} bytes (${Math.round(26214400 / 1024 / 1024)} MB), got ${r.length} bytes`);
    }
    async function N(r) {
      if (typeof r == "string")
        return Buffer.from(r, "utf-8");
      if (r instanceof ArrayBuffer)
        return Buffer.from(r);
      if (ArrayBuffer.isView(r))
        return Buffer.from(r.buffer, r.byteOffset, r.byteLength);
      if (typeof ReadableStream < "u" && r instanceof ReadableStream) {
        let e = [], t = r.getReader();
        try {
          for (; ; ) {
            let { done: a, value: u } = await t.read();
            if (a)
              break;
            e.push(u);
          }
        } finally {
          t.releaseLock();
        }
        let n = e.reduce((a, u) => a + u.length, 0), o = new Uint8Array(n), f = 0;
        for (let a of e)
          o.set(a, f), f += a.length;
        return Buffer.from(o);
      }
      throw new Error(`Unsupported value type: ${typeof r}`);
    }
    function U(r, e) {
      switch (e) {
        case "json":
          try {
            return JSON.parse(r.toString("utf-8"));
          } catch {
            return r.toString("utf-8");
          }
        case "arrayBuffer":
          return r.buffer.slice(r.byteOffset, r.byteOffset + r.byteLength);
        case "stream": {
          let t = r;
          return new ReadableStream({ start(n) {
            n.enqueue(new Uint8Array(t)), n.close();
          } });
        }
        case "text":
        default:
          return r.toString("utf-8");
      }
    }
    function S(r, e) {
      let t = null, n = null, o = (e == null ? void 0 : e.debug) ?? false, f = `${r.userId}@${r.userKey}`, a = `/${r.namespace}/`, u = (s, ...i) => {
        o && console.log(`[KVClient] ${s}`, ...i);
      }, m = (s) => a + s, C = (s) => s.startsWith(a) ? s.substring(a.length) : s, D = async (s) => {
        u("Authenticating...");
        let i = await s.sendCommand(["AUTH", f]);
        if (i.type === "simple_string" && i.value === "OK")
          u("Authentication successful");
        else
          throw new Error("Authentication failed");
      }, Q = async (s) => {
        u("Selecting namespace...");
        let i = await s.sendCommand(["SELECT", r.namespace]);
        if (i.type === "simple_string" && i.value === "OK")
          u("Namespace selected");
        else
          throw new Error("Namespace selection failed");
      }, b = async () => {
        if (t && !t.connected && (t = null, n = null), t && t.connected)
          return t;
        if (n) {
          if (await n, t && t.connected)
            return t;
          t = null, n = null;
        }
        let s = typeof r.servicePort == "string" ? parseInt(r.servicePort, 10) : r.servicePort;
        return t = new V({ host: r.serviceName, port: s, timeout: e == null ? void 0 : e.timeout, debug: o }), n = (async () => {
          try {
            await t.connect(), await D(t), await Q(t);
          } catch (i) {
            throw t == null || t.close(), t = null, n = null, i;
          }
        })(), await n, t;
      }, j = (s) => {
        if (s.type === "null")
          return null;
        if (s.type === "array" && Array.isArray(s.value)) {
          let i = s.value;
          if (i.length > 0) {
            let l = i[0];
            return l.type === "null" ? null : Buffer.from(l.value, "utf-8");
          }
          return null;
        }
        return s.type === "bulk_string" ? Buffer.from(s.value, "utf-8") : null;
      };
      return { async get(s, i) {
        let l = await b(), c = m(s);
        u(`GET: ${c}`);
        let h = await l.sendCommand(["oget", c]), p = j(h);
        if (p === null)
          return null;
        let g = typeof i == "string" ? i : (i == null ? void 0 : i.type) ?? "text";
        return U(p, g);
      }, async put(s, i) {
        I(s);
        let l = await b(), c = m(s), h = await N(i);
        L(h);
        let p = h.toString("utf-8");
        u(`PUT: ${c} = ${p.substring(0, 100)}${p.length > 100 ? "..." : ""}`);
        let g = ["oset", c, p], d = await l.sendCommand(g);
        if (d.type !== "simple_string" || d.value !== "OK")
          throw new Error("PUT operation failed");
      }, async delete(s) {
        let i = await b(), l = m(s);
        u(`DELETE: ${l}`);
        let c = await i.sendCommand(["odel", l]);
        if (c.type === "error")
          throw new Error(`DELETE failed: ${c.value}`);
        u(`DELETE response: type=${c.type}, value=${c.value}`);
      }, async list(s) {
        var d, $, T;
        let i = await b(), l = (s == null ? void 0 : s.prefix) ?? "", c = (s == null ? void 0 : s.limit) ?? 10, h = m(l);
        u(`LIST: ${h}, limit: ${c}`);
        let p = ["list", h, "count", c.toString()];
        s != null && s.cursor && p.push("cursor", m(s.cursor));
        let g = await i.sendCommand(p);
        if (g.type === "array" && Array.isArray(g.value)) {
          let y = g.value;
          if (y.length >= 2) {
            let _ = { cursor: C(((d = y[0]) == null ? void 0 : d.value) || "") || void 0, complete: ((($ = y[1]) == null ? void 0 : $.value) || "").toLowerCase() === "true", keys: [] };
            for (let E = 2; E + 3 <= y.length; E += 3) {
              let G = { key: C(((T = y[E]) == null ? void 0 : T.value) || "") };
              _.keys.push(G);
            }
            return _;
          }
        }
        return { keys: [], complete: true };
      } };
    }
    function M() {
      let r = process.env[R];
      if (!r)
        return [];
      delete process.env[R];
      try {
        return JSON.parse(r);
      } catch {
        try {
          let e = Buffer.from(r, "base64").toString("utf-8");
          return JSON.parse(e);
        } catch {
          return [];
        }
      }
    }
    function z(r) {
      for (let e of r)
        globalThis[e.name] = S(e);
    }
    function re() {
      try {
        let r = M();
        r && r.length > 0 && (z(r), console.log(`[cli] Initialized ${r.length} KV binding(s)`));
      } catch {
        console.error("[cli] Initialization failed");
      }
    }
  })(kvModule, kvModule.exports);
  if (kvModule.exports.bootstrap) {
    await kvModule.exports.bootstrap();
  }
})();
var env = {
  "AI_AGENT": "claude-code_2-1-144_agent",
  "ALLUSERSPROFILE": "C:\\ProgramData",
  "ANTHROPIC_AUTH_TOKEN": "sk-sp-RuO2K1JmVaUhl8Gs2yALj8N1qCNaxomI",
  "ANTHROPIC_BASE_URL": "https://aigw-gzgy2.cucloud.cn:8443",
  "ANTHROPIC_DEFAULT_HAIKU_MODEL": "glm-5.1",
  "ANTHROPIC_DEFAULT_OPUS_MODEL": "glm-5.1",
  "ANTHROPIC_DEFAULT_SONNET_MODEL": "glm-5.1",
  "ANTHROPIC_MODEL": "glm-5.1",
  "ANTHROPIC_REASONING_MODEL": "glm-5.1",
  "API_KEY": "12345678",
  "APPDATA": "C:\\Users\\Ray\\AppData\\Roaming",
  "CHROME_CRASHPAD_PIPE_NAME": "\\\\.\\pipe\\crashpad_10204_WWKYNJRMOYBGAMFV",
  "CLAUDECODE": "1",
  "CLAUDE_CODE_ENABLE_SDK_FILE_CHECKPOINTING": "true",
  "CLAUDE_CODE_ENABLE_TASKS": "0",
  "CLAUDE_CODE_ENTRYPOINT": "claude-vscode",
  "CLAUDE_CODE_EXECPATH": "C:\\Users\\Ray\\.vscode\\extensions\\anthropic.claude-code-2.1.144-win32-x64\\resources\\native-binary\\claude.exe",
  "CLAUDE_CODE_SESSION_ID": "d24521f1-0c60-4a76-a1f1-487d5ef87513",
  "CLAUDE_EFFORT": "high",
  "COLOR": "0",
  "COMMONPROGRAMFILES": "C:\\Program Files\\Common Files",
  "CommonProgramFiles(x86)": "C:\\Program Files (x86)\\Common Files",
  "CommonProgramW6432": "C:\\Program Files\\Common Files",
  "COMPUTERNAME": "DESKTOP-MQSDFTJ",
  "COMSPEC": "C:\\Windows\\system32\\cmd.exe",
  "COREPACK_ENABLE_AUTO_PIN": "0",
  "DriverData": "C:\\Windows\\System32\\Drivers\\DriverData",
  "EDITOR": "C:\\Windows\\notepad.exe",
  "ELECTRON_RUN_AS_NODE": "1",
  "EXEPATH": "D:\\soft\\Git\\bin",
  "GIT_EDITOR": "true",
  "hermes": "HERMES_GIT_BASH_PATH=D:\\soft\\Git\\bin\\bash.exe",
  "HERMES_GIT_BASH_PATH": "D:\\soft\\Git\\bin\\bash.exe",
  "HERMES_HOME": "C:\\Users\\Ray\\AppData\\Local\\hermes",
  "HOME": "C:\\Users\\Ray",
  "HOMEDRIVE": "C:",
  "HOMEPATH": "\\Users\\Ray",
  "INIT_CWD": "D:\\rss-edgeone-main",
  "LOCALAPPDATA": "C:\\Users\\Ray\\AppData\\Local",
  "LOGONSERVER": "\\\\DESKTOP-MQSDFTJ",
  "MCP_CONNECTION_NONBLOCKING": "true",
  "MSYSTEM": "MINGW64",
  "NODE": "C:\\Program Files\\nodejs\\node.exe",
  "NoDefaultCurrentDirectoryInExePath": "1",
  "npm_command": "exec",
  "npm_config_cache": "D:\\npm-cache",
  "npm_config_globalconfig": "C:\\Users\\Ray\\AppData\\Roaming\\npm\\etc\\npmrc",
  "npm_config_global_prefix": "C:\\Users\\Ray\\AppData\\Roaming\\npm",
  "npm_config_init_module": "C:\\Users\\Ray\\.npm-init.js",
  "npm_config_local_prefix": "D:\\rss-edgeone-main",
  "npm_config_node_gyp": "C:\\Users\\Ray\\AppData\\Roaming\\npm\\node_modules\\npm\\node_modules\\node-gyp\\bin\\node-gyp.js",
  "npm_config_noproxy": "",
  "npm_config_npm_version": "11.7.0",
  "npm_config_prefix": "C:\\Users\\Ray\\AppData\\Roaming\\npm",
  "npm_config_registry": "https://registry.npmmirror.com",
  "npm_config_userconfig": "C:\\Users\\Ray\\.npmrc",
  "npm_config_user_agent": "npm/11.7.0 node/v24.14.1 win32 x64 workspaces/false",
  "npm_execpath": "C:\\Users\\Ray\\AppData\\Roaming\\npm\\node_modules\\npm\\bin\\npm-cli.js",
  "npm_lifecycle_event": "npx",
  "npm_lifecycle_script": "edgeone",
  "npm_node_execpath": "C:\\Program Files\\nodejs\\node.exe",
  "npm_package_json": "D:\\rss-edgeone-main\\package.json",
  "npm_package_name": "rss-edgeone",
  "npm_package_version": "4.0.0",
  "NUMBER_OF_PROCESSORS": "8",
  "OLDPWD": "D:/rss-edgeone-main",
  "OS": "Windows_NT",
  "PATH": "C:\\Users\\Ray\\AppData\\Roaming\\npm;D:\\rss-edgeone-main\\node_modules\\.bin;D:\\node_modules\\.bin;C:\\Users\\Ray\\AppData\\Roaming\\npm\\node_modules\\npm\\node_modules\\@npmcli\\run-script\\lib\\node-gyp-bin;C:\\Users\\Ray\\.bun\\bin;C:\\Users\\Ray\\bin;D:\\soft\\Git\\mingw64\\bin;D:\\soft\\Git\\usr\\local\\bin;D:\\soft\\Git\\usr\\bin;D:\\soft\\Git\\usr\\bin;D:\\soft\\Git\\mingw64\\bin;D:\\soft\\Git\\usr\\bin;C:\\Users\\Ray\\bin;C:\\Users\\Ray\\AppData\\Local\\Programs\\Python\\Python39\\Scripts;D:\\soft\\Microsoft VS Code;C:\\Windows\\system32;C:\\Windows;C:\\Windows\\System32\\Wbem;C:\\Windows\\System32\\WindowsPowerShell\\v1.0;C:\\Windows\\System32\\OpenSSH;C:\\Program Files\\nodejs;D:\\soft\\Git\\cmd;D:\\cc\\bin;C:\\Users\\Ray\\.bun\\bin;C:\\Users\\Ray\\AppData\\Local\\hermes\\hermes-agent\\venv\\Scripts;C:\\Users\\Ray\\.local\\bin;D:\\soft\\cursor\\resources\\app\\codeBin;C:\\Users\\Ray\\AppData\\Local\\Microsoft\\WindowsApps;D:\\soft\\Microsoft VS Code\\bin;C:\\Users\\Ray\\AppData\\Roaming\\npm;D:\\soft\\Git\\usr\\bin\\vendor_perl;D:\\soft\\Git\\usr\\bin\\core_perl",
  "PATHEXT": ".COM;.EXE;.BAT;.CMD;.VBS;.VBE;.JS;.JSE;.WSF;.WSH;.MSC",
  "PLINK_PROTOCOL": "ssh",
  "PROCESSOR_ARCHITECTURE": "AMD64",
  "PROCESSOR_IDENTIFIER": "Intel64 Family 6 Model 142 Stepping 11, GenuineIntel",
  "PROCESSOR_LEVEL": "6",
  "PROCESSOR_REVISION": "8e0b",
  "ProgramData": "C:\\ProgramData",
  "PROGRAMFILES": "C:\\Program Files",
  "ProgramFiles(x86)": "C:\\Program Files (x86)",
  "ProgramW6432": "C:\\Program Files",
  "PROMPT": "$P$G",
  "PSModulePath": "C:\\Program Files\\WindowsPowerShell\\Modules;C:\\Windows\\system32\\WindowsPowerShell\\v1.0\\Modules",
  "PUBLIC": "C:\\Users\\Public",
  "PWD": "D:/rss-edgeone-main",
  "SESSIONNAME": "Console",
  "SHELL": "D:\\soft\\Git\\usr\\bin\\bash.exe",
  "SHLVL": "2",
  "SYSTEMDRIVE": "C:",
  "SYSTEMROOT": "C:\\Windows",
  "TEMP": "C:\\Users\\Ray\\AppData\\Local\\Temp",
  "TERM": "xterm-256color",
  "TMP": "C:\\Users\\Ray\\AppData\\Local\\Temp",
  "USERDOMAIN": "DESKTOP-MQSDFTJ",
  "USERDOMAIN_ROAMINGPROFILE": "DESKTOP-MQSDFTJ",
  "USERNAME": "Ray",
  "USERPROFILE": "C:\\Users\\Ray",
  "VIRTUAL_ENV": "C:\\Users\\Ray\\AppData\\Local\\Programs\\Python\\Python39",
  "VSCODE_CODE_CACHE_PATH": "C:\\Users\\Ray\\AppData\\Roaming\\Code\\CachedData\\0958016b2af9f09bb4257e0df4a95e2f90590f9f",
  "VSCODE_CRASH_REPORTER_PROCESS_TYPE": "extensionHost",
  "VSCODE_CWD": "D:\\rss-edgeone-main",
  "VSCODE_ESM_ENTRYPOINT": "vs/workbench/api/node/extensionHostProcess",
  "VSCODE_HANDLES_UNCAUGHT_ERRORS": "true",
  "VSCODE_IPC_HOOK": "\\\\.\\pipe\\f4d50ee8-1.120.0-main-sock",
  "VSCODE_NLS_CONFIG": '{"userLocale":"zh-cn","osLocale":"zh-cn","resolvedLanguage":"zh-cn","defaultMessagesFile":"D:\\\\soft\\\\Microsoft VS Code\\\\0958016b2a\\\\resources\\\\app\\\\out\\\\nls.messages.json","languagePack":{"translationsConfigFile":"C:\\\\Users\\\\Ray\\\\AppData\\\\Roaming\\\\Code\\\\clp\\\\87788cb759b3faab7fe87de19549c933.zh-cn\\\\tcf.json","messagesFile":"C:\\\\Users\\\\Ray\\\\AppData\\\\Roaming\\\\Code\\\\clp\\\\87788cb759b3faab7fe87de19549c933.zh-cn\\\\0958016b2af9f09bb4257e0df4a95e2f90590f9f\\\\nls.messages.json","corruptMarkerFile":"C:\\\\Users\\\\Ray\\\\AppData\\\\Roaming\\\\Code\\\\clp\\\\87788cb759b3faab7fe87de19549c933.zh-cn\\\\corrupted.info"},"locale":"zh-cn","availableLanguages":{"*":"zh-cn"},"_languagePackId":"87788cb759b3faab7fe87de19549c933.zh-cn","_languagePackSupport":true,"_translationsConfigFile":"C:\\\\Users\\\\Ray\\\\AppData\\\\Roaming\\\\Code\\\\clp\\\\87788cb759b3faab7fe87de19549c933.zh-cn\\\\tcf.json","_cacheRoot":"C:\\\\Users\\\\Ray\\\\AppData\\\\Roaming\\\\Code\\\\clp\\\\87788cb759b3faab7fe87de19549c933.zh-cn","_resolvedLanguagePackCoreLocation":"C:\\\\Users\\\\Ray\\\\AppData\\\\Roaming\\\\Code\\\\clp\\\\87788cb759b3faab7fe87de19549c933.zh-cn\\\\0958016b2af9f09bb4257e0df4a95e2f90590f9f","_corruptedFile":"C:\\\\Users\\\\Ray\\\\AppData\\\\Roaming\\\\Code\\\\clp\\\\87788cb759b3faab7fe87de19549c933.zh-cn\\\\corrupted.info"}',
  "VSCODE_PID": "10204",
  "WINDIR": "C:\\Windows",
  "ZES_ENABLE_SYSMAN": "1",
  "_": "C:/Program Files/nodejs/node.exe"
};
Object.assign(env, process.env || {});
delete env.TENCENTCLOUD_UIN;
delete env.TENCENTCLOUD_APPID;
try {
  process.removeAllListeners("uncaughtException");
  process.removeAllListeners("unhandledRejection");
  process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception:", error);
  });
  process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection:", reason);
  });
} catch (error) {
  console.error("Uncaught Exception:", error);
}
var port = 9e3;
var EdgeoneBodyParser = class {
  /**
   * Parse request body according to Content-Type, strictly following Edgeone rules
   * @param {Buffer} buffer Raw request body data
   * @param {string} contentType Content-Type header
   * @returns Parsed data
   */
  static parseBodyByContentType(buffer, contentType = "") {
    if (!buffer || buffer.length === 0) {
      return void 0;
    }
    const normalizedContentType = contentType.split(";")[0].trim().toLowerCase();
    switch (normalizedContentType) {
      case "application/json":
        try {
          const text = buffer.toString("utf-8");
          return JSON.parse(text);
        } catch (error) {
          throw new Error(`Invalid JSON in request body: ${error.message}`);
        }
      case "application/x-www-form-urlencoded":
        const formText = buffer.toString("utf-8");
        const params = new URLSearchParams(formText);
        const result = {};
        for (const [key, value] of params) {
          result[key] = value;
        }
        return result;
      case "text/plain":
        return buffer.toString("utf-8");
      case "application/octet-stream":
        return buffer;
      default:
        return buffer;
    }
  }
  /**
   * Parse URL query parameters
   * @param {string} url Full URL or query string
   * @returns {Object} Parsed query parameters object
   */
  static parseQuery(url) {
    if (!url)
      return {};
    const queryStart = url.indexOf("?");
    const queryString = queryStart >= 0 ? url.substring(queryStart + 1) : url;
    if (!queryString)
      return {};
    const params = {};
    const pairs = queryString.split("&");
    for (const pair of pairs) {
      if (!pair)
        continue;
      const equalIndex = pair.indexOf("=");
      let key, value;
      if (equalIndex === -1) {
        key = pair;
        value = true;
      } else if (equalIndex === 0) {
        continue;
      } else {
        key = pair.substring(0, equalIndex);
        value = pair.substring(equalIndex + 1);
        if (value === "") {
          value = "";
        }
      }
      if (key) {
        try {
          const decodedKey = decodeURIComponent(key);
          let decodedValue;
          if (typeof value === "boolean") {
            decodedValue = value;
          } else {
            decodedValue = decodeURIComponent(value);
            if (decodedValue === "true") {
              decodedValue = true;
            } else if (decodedValue === "false") {
              decodedValue = false;
            } else if (decodedValue === "null") {
              decodedValue = null;
            } else if (decodedValue === "undefined") {
              decodedValue = void 0;
            } else if (/^-?d+$/.test(decodedValue)) {
              const num = parseInt(decodedValue, 10);
              if (!isNaN(num) && num.toString() === decodedValue) {
                decodedValue = num;
              }
            } else if (/^-?d*.d+$/.test(decodedValue)) {
              const num = parseFloat(decodedValue);
              if (!isNaN(num) && num.toString() === decodedValue) {
                decodedValue = num;
              }
            }
          }
          if (params[decodedKey] !== void 0) {
            if (Array.isArray(params[decodedKey])) {
              params[decodedKey].push(decodedValue);
            } else {
              params[decodedKey] = [params[decodedKey], decodedValue];
            }
          } else {
            params[decodedKey] = decodedValue;
          }
        } catch (error) {
          if (typeof value === "boolean") {
            params[key] = value;
          } else {
            params[key] = value || "";
          }
        }
      }
    }
    return params;
  }
  /**
   * Parse Cookie header
   * @param {string} cookieHeader Cookie header string
   * @returns {Object} Parsed cookies object
   */
  static parseCookies(cookieHeader) {
    const cookies = {};
    if (!cookieHeader || typeof cookieHeader !== "string") {
      return cookies;
    }
    cookieHeader.split(";").forEach((cookie) => {
      const trimmed = cookie.trim();
      const equalIndex = trimmed.indexOf("=");
      if (equalIndex > 0) {
        const name = trimmed.substring(0, equalIndex).trim();
        let value = trimmed.substring(equalIndex + 1).trim();
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }
        try {
          cookies[name] = decodeURIComponent(value);
        } catch (error) {
          cookies[name] = value;
        }
      }
    });
    return cookies;
  }
  /**
   * Read the full request body data from the stream
   */
  static async readBodyFromStream(req, maxSize = 50 * 1024 * 1024) {
    return new Promise((resolve, reject) => {
      if (req.readableEnded || req.destroyed) {
        resolve(Buffer.alloc(0));
        return;
      }
      if (req._bodyBuffer !== void 0) {
        resolve(req._bodyBuffer);
        return;
      }
      const chunks = [];
      let totalSize = 0;
      const cleanup = () => {
        req.removeListener("data", onData);
        req.removeListener("end", onEnd);
        req.removeListener("error", onError);
      };
      const onData = (chunk) => {
        totalSize += chunk.length;
        if (totalSize > maxSize) {
          cleanup();
          reject(new Error(`Request body too large. Max size: ${maxSize} bytes`));
          return;
        }
        chunks.push(chunk);
      };
      const onEnd = () => {
        cleanup();
        const buffer = Buffer.concat(chunks);
        req._bodyBuffer = buffer;
        resolve(buffer);
      };
      const onError = (error) => {
        cleanup();
        reject(error);
      };
      req.on("data", onData);
      req.on("end", onEnd);
      req.on("error", onError);
      if (req.readable && !req.readableFlowing) {
        req.resume();
      }
    });
  }
};
function createEdgeoneCompatibleRequest(originalReq, isFramework = false) {
  const method = (originalReq.method || "GET").toUpperCase();
  const protocol = originalReq.headers["x-forwarded-proto"] || "http";
  const host = originalReq.headers.host || "localhost";
  const url = protocol + "://" + host + (originalReq.url || "/");
  const headerPairs = [];
  for (const key in originalReq.headers) {
    const v = originalReq.headers[key];
    if (typeof v === "string") {
      headerPairs.push([key, v]);
    } else if (Array.isArray(v)) {
      headerPairs.push([key, v.join(", ")]);
    } else if (v != null) {
      headerPairs.push([key, String(v)]);
    }
  }
  const init = {
    method,
    headers: new Headers(headerPairs)
  };
  if (method !== "GET" && method !== "HEAD") {
    init.duplex = "half";
    init.body = originalReq;
  }
  const request = new Request(url, init);
  let parsedBodyCache = void 0;
  let parsedBodyReady = false;
  let parsedBodyError = null;
  const contentType = request.headers.get("content-type") || "";
  const preloadBody = async () => {
    if (method === "GET" || method === "HEAD") {
      parsedBodyCache = void 0;
      parsedBodyReady = true;
      return;
    }
    try {
      const clone = request.clone();
      const ab = await clone.arrayBuffer();
      const buf = Buffer.from(ab);
      request._rawBodyBuffer = buf;
      parsedBodyCache = EdgeoneBodyParser.parseBodyByContentType(buf, contentType);
      parsedBodyReady = true;
    } catch (err) {
      parsedBodyError = err;
      parsedBodyReady = true;
    }
  };
  request._bodyPreloadPromise = preloadBody();
  if (!("cookies" in request)) {
    Object.defineProperty(request, "cookies", {
      get() {
        return EdgeoneBodyParser.parseCookies(request.headers.get("cookie") || "");
      },
      configurable: true,
      enumerable: true
    });
  }
  if (!("query" in request)) {
    Object.defineProperty(request, "query", {
      get() {
        return EdgeoneBodyParser.parseQuery(request.url || "");
      },
      configurable: true,
      enumerable: true
    });
  }
  Object.defineProperty(request, "body", {
    get() {
      if (parsedBodyReady) {
        if (parsedBodyError)
          throw parsedBodyError;
        return parsedBodyCache;
      }
      return new Promise((resolve, reject) => {
        (async () => {
          try {
            await request._bodyPreloadPromise;
            if (parsedBodyError)
              return reject(parsedBodyError);
            resolve(parsedBodyCache);
          } catch (e) {
            reject(e);
          }
        })();
      });
    },
    configurable: true,
    enumerable: true
  });
  return request;
}
async function handleResponse(res, response, passHeaders = {}) {
  var _a, _b, _c;
  const startTime = Date.now();
  if (!response) {
    const requestId = passHeaders["functions-request-id"] || "";
    res.writeHead(404, {
      "Functions-Request-Id": requestId,
      "eo-pages-inner-scf-status": "404",
      "eo-pages-inner-status-intercept": "true"
    });
    res.end(JSON.stringify({
      error: "Not Found",
      message: "The requested path does not exist"
    }));
    const endTime = Date.now();
    console.log(`Pages response status: 404`);
    return;
  }
  try {
    if (response instanceof Response) {
      let validateCacheControlHeader = function(headers2) {
        const cacheControl = headers2["cache-control"];
        if (cacheControl) {
          const directives = cacheControl.split(",").map((directive) => directive.trim());
          const validatedDirectives = [];
          for (const directive of directives) {
            if (!directive)
              continue;
            const [key, value] = directive.split("=");
            const standardDirectives = ["max-age", "public", "private", "s-maxage", "no-cache", "no-store", "no-transform", "must-revalidate", "proxy-revalidate", "must-understand", "stale-while-revalidate", "stale-if-error", "immutable"];
            if (!standardDirectives.includes(key)) {
              continue;
            }
            if (key === "stale-while-revalidate" || key === "stale-if-error") {
              if (!value) {
                const defaultValue = "31536000";
                validatedDirectives.push(key + "=" + defaultValue);
                continue;
              }
            }
            validatedDirectives.push(directive);
          }
          headers2["cache-control"] = validatedDirectives.join(", ");
        }
      };
      const requestId = passHeaders["functions-request-id"] || "";
      const responseStatus = response.status;
      const headers = Object.fromEntries(response.headers);
      validateCacheControlHeader(headers);
      headers["Functions-Request-Id"] = requestId;
      if (!headers["eo-pages-inner-scf-status"]) {
        headers["eo-pages-inner-scf-status"] = String(responseStatus);
      }
      if (!headers["eo-pages-inner-status-intercept"]) {
        headers["eo-pages-inner-status-intercept"] = "false";
      }
      if (response.headers.get("eop-client-geo")) {
        response.headers.delete("eop-client-geo");
      }
      const isStream = response.body && (((_a = response.headers.get("content-type")) == null ? void 0 : _a.includes("text/event-stream")) || ((_b = response.headers.get("transfer-encoding")) == null ? void 0 : _b.includes("chunked")) || response.body instanceof ReadableStream || typeof response.body.pipe === "function" || response.headers.get("x-content-type-stream") === "true");
      if (isStream) {
        const streamHeaders = {
          ...headers
        };
        if ((_c = response.headers.get("content-type")) == null ? void 0 : _c.includes("text/event-stream")) {
          streamHeaders["Content-Type"] = "text/event-stream";
        }
        res.writeHead(response.status, streamHeaders);
        if (typeof response.body.pipe === "function") {
          response.body.pipe(res);
        } else {
          const reader = response.body.getReader();
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done)
                break;
              if (value instanceof Uint8Array || Buffer.isBuffer(value)) {
                res.write(value);
              } else {
                const chunk = new TextDecoder().decode(value);
                res.write(chunk);
              }
            }
          } finally {
            reader.releaseLock();
            res.end();
          }
        }
      } else {
        res.writeHead(response.status, headers);
        const body = await response.text();
        res.end(body);
      }
    } else {
      const requestId = passHeaders["functions-request-id"] || "";
      res.writeHead(200, {
        "Content-Type": "application/json",
        "Functions-Request-Id": requestId,
        "eo-pages-inner-scf-status": "200",
        "eo-pages-inner-status-intercept": "false"
      });
      res.end(JSON.stringify(response));
    }
  } catch (error) {
    const requestId = passHeaders["functions-request-id"] || "";
    res.writeHead(502, {
      "Functions-Request-Id": requestId,
      "eo-pages-inner-scf-status": "502",
      "eo-pages-inner-status-intercept": "true"
    });
    res.end(JSON.stringify({
      error: "Internal Server Error",
      message: error.message
    }));
  } finally {
    const endTime = Date.now();
    console.log(`Pages response status: ${(response == null ? void 0 : response.status) || "unknown"}`);
  }
}
var server = http.createServer(async (req, res) => {
  try {
    const requestStartTime = Date.now();
    const geoStr = decodeURIComponent(req.headers["eo-connecting-geo"]) || "";
    const geo = geoStr ? (() => {
      const result = {};
      const matches = geoStr.match(/[a-z_]+="[^"]*"|[a-z_]+=[A-Za-z0-9.-]+/g) || [];
      matches.forEach((match) => {
        const [key, value] = match.split("=", 2);
        result[key] = value.replace(/^"|"$/g, "");
      });
      return result;
    })() : {};
    const newGeo = {
      asn: geo.asn,
      countryName: geo.nation_name,
      countryCodeAlpha2: geo.region_code && geo.region_code.split("-")[0],
      countryCodeNumeric: geo.nation_numeric,
      regionName: geo.region_name,
      regionCode: geo.region_code,
      cityName: geo.city_name,
      latitude: geo.latitude,
      longitude: geo.longitude,
      cisp: geo.network_operator
    };
    const safeGeo = {};
    for (const [key, value] of Object.entries(newGeo)) {
      if (value !== void 0 && value !== null) {
        if (typeof value === "string" && /[\u4e00-\u9fff]/.test(value)) {
          safeGeo[key] = Buffer.from(value, "utf8").toString("utf8");
        } else {
          safeGeo[key] = value;
        }
      }
    }
    req.headers["eo-connecting-geo"] = safeGeo;
    let context = {};
    let enhancedRequest = {};
    req.headers["functions-request-id"] = req.headers["x-scf-request-id"] || "";
    const url = new URL(req.url, `http://${req.headers.host}`);
    let pathname = url.pathname;
    if (pathname !== "/" && pathname.endsWith("/")) {
      pathname = pathname.slice(0, -1);
    }
    let fullPath = "";
    if (req.headers.host === "localhost:9000") {
      fullPath = pathname;
    } else {
      const host = req.headers["eo-pages-host"];
      const xForwardedProto = req.headers["x-forwarded-proto"];
      fullPath = (xForwardedProto || "https") + "://" + host + req.url;
      if (fullPath.endsWith("?")) {
        fullPath = fullPath.slice(0, -1);
      }
    }
    console.log(`Pages request path: ${fullPath}`);
    let response = null;
    if (pathname.startsWith("/")) {
      enhancedRequest = createEdgeoneCompatibleRequest(req, false);
      if (enhancedRequest._bodyPreloadPromise) {
        try {
          await enhancedRequest._bodyPreloadPromise;
        } catch (error) {
          console.warn("Body preload failed:", error.message);
        }
      }
      context = {
        request: enhancedRequest,
        env,
        // Use injected environment variables
        params: {},
        uuid: req.headers["eo-log-uuid"] || "",
        server: {
          region: req.headers["x-scf-region"] || "",
          requestId: req.headers["x-scf-request-id"] || ""
        },
        clientIp: req.headers["eo-connecting-ip"] || "",
        geo: safeGeo
      };
      for (const key in req.headers) {
        if (key.startsWith("x-scf-")) {
          delete req.headers[key];
        }
        if (key.startsWith("x-cube-")) {
          delete req.headers[key];
        }
      }
      const routeMatch = pathname.slice("/".length);
      const cleanPath = routeMatch.startsWith("/") ? routeMatch.slice(1) : routeMatch;
      if (cleanPath) {
        const params = {};
        params["default"] = cleanPath.split("/");
        context.params = params;
        const mod_0 = (() => {
          var __create = Object.create;
          var __defProp = Object.defineProperty;
          var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
          var __getOwnPropNames = Object.getOwnPropertyNames;
          var __getProtoOf = Object.getPrototypeOf;
          var __hasOwnProp = Object.prototype.hasOwnProperty;
          var __require2 = /* @__PURE__ */ ((x) => typeof __require !== "undefined" ? __require : typeof Proxy !== "undefined" ? new Proxy(x, {
            get: (a, b) => (typeof __require !== "undefined" ? __require : a)[b]
          }) : x)(function(x) {
            if (typeof __require !== "undefined")
              return __require.apply(this, arguments);
            throw Error('Dynamic require of "' + x + '" is not supported');
          });
          var __commonJS = (cb, mod) => function __require22() {
            return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
          };
          var __copyProps = (to, from, except, desc) => {
            if (from && typeof from === "object" || typeof from === "function") {
              for (let key of __getOwnPropNames(from))
                if (!__hasOwnProp.call(to, key) && key !== except)
                  __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
            }
            return to;
          };
          var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
            // If the importer is in node compatibility mode or this is not an ESM
            // file that has been converted to a CommonJS file using a Babel-
            // compatible transform (i.e. "__esModule" has not been set), then set
            // "default" to the CommonJS "module.exports" for node compatibility.
            isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
            mod
          ));
          var require_defaults = __commonJS({
            "node_modules/.pnpm/xml2js@0.5.0/node_modules/xml2js/lib/defaults.js"(exports) {
              (function() {
                exports.defaults = {
                  "0.1": {
                    explicitCharkey: false,
                    trim: true,
                    normalize: true,
                    normalizeTags: false,
                    attrkey: "@",
                    charkey: "#",
                    explicitArray: false,
                    ignoreAttrs: false,
                    mergeAttrs: false,
                    explicitRoot: false,
                    validator: null,
                    xmlns: false,
                    explicitChildren: false,
                    childkey: "@@",
                    charsAsChildren: false,
                    includeWhiteChars: false,
                    async: false,
                    strict: true,
                    attrNameProcessors: null,
                    attrValueProcessors: null,
                    tagNameProcessors: null,
                    valueProcessors: null,
                    emptyTag: ""
                  },
                  "0.2": {
                    explicitCharkey: false,
                    trim: false,
                    normalize: false,
                    normalizeTags: false,
                    attrkey: "$",
                    charkey: "_",
                    explicitArray: true,
                    ignoreAttrs: false,
                    mergeAttrs: false,
                    explicitRoot: true,
                    validator: null,
                    xmlns: false,
                    explicitChildren: false,
                    preserveChildrenOrder: false,
                    childkey: "$$",
                    charsAsChildren: false,
                    includeWhiteChars: false,
                    async: false,
                    strict: true,
                    attrNameProcessors: null,
                    attrValueProcessors: null,
                    tagNameProcessors: null,
                    valueProcessors: null,
                    rootName: "root",
                    xmldec: {
                      "version": "1.0",
                      "encoding": "UTF-8",
                      "standalone": true
                    },
                    doctype: null,
                    renderOpts: {
                      "pretty": true,
                      "indent": "  ",
                      "newline": "\n"
                    },
                    headless: false,
                    chunkSize: 1e4,
                    emptyTag: "",
                    cdata: false
                  }
                };
              }).call(exports);
            }
          });
          var require_Utility = __commonJS({
            "node_modules/.pnpm/xmlbuilder@11.0.1/node_modules/xmlbuilder/lib/Utility.js"(exports, module) {
              (function() {
                var assign, getValue, isArray, isEmpty, isFunction, isObject, isPlainObject, slice = [].slice, hasProp = {}.hasOwnProperty;
                assign = function() {
                  var i, key, len, source, sources, target;
                  target = arguments[0], sources = 2 <= arguments.length ? slice.call(arguments, 1) : [];
                  if (isFunction(Object.assign)) {
                    Object.assign.apply(null, arguments);
                  } else {
                    for (i = 0, len = sources.length; i < len; i++) {
                      source = sources[i];
                      if (source != null) {
                        for (key in source) {
                          if (!hasProp.call(source, key))
                            continue;
                          target[key] = source[key];
                        }
                      }
                    }
                  }
                  return target;
                };
                isFunction = function(val) {
                  return !!val && Object.prototype.toString.call(val) === "[object Function]";
                };
                isObject = function(val) {
                  var ref;
                  return !!val && ((ref = typeof val) === "function" || ref === "object");
                };
                isArray = function(val) {
                  if (isFunction(Array.isArray)) {
                    return Array.isArray(val);
                  } else {
                    return Object.prototype.toString.call(val) === "[object Array]";
                  }
                };
                isEmpty = function(val) {
                  var key;
                  if (isArray(val)) {
                    return !val.length;
                  } else {
                    for (key in val) {
                      if (!hasProp.call(val, key))
                        continue;
                      return false;
                    }
                    return true;
                  }
                };
                isPlainObject = function(val) {
                  var ctor, proto;
                  return isObject(val) && (proto = Object.getPrototypeOf(val)) && (ctor = proto.constructor) && typeof ctor === "function" && ctor instanceof ctor && Function.prototype.toString.call(ctor) === Function.prototype.toString.call(Object);
                };
                getValue = function(obj) {
                  if (isFunction(obj.valueOf)) {
                    return obj.valueOf();
                  } else {
                    return obj;
                  }
                };
                module.exports.assign = assign;
                module.exports.isFunction = isFunction;
                module.exports.isObject = isObject;
                module.exports.isArray = isArray;
                module.exports.isEmpty = isEmpty;
                module.exports.isPlainObject = isPlainObject;
                module.exports.getValue = getValue;
              }).call(exports);
            }
          });
          var require_XMLDOMImplementation = __commonJS({
            "node_modules/.pnpm/xmlbuilder@11.0.1/node_modules/xmlbuilder/lib/XMLDOMImplementation.js"(exports, module) {
              (function() {
                var XMLDOMImplementation;
                module.exports = XMLDOMImplementation = function() {
                  function XMLDOMImplementation2() {
                  }
                  XMLDOMImplementation2.prototype.hasFeature = function(feature, version) {
                    return true;
                  };
                  XMLDOMImplementation2.prototype.createDocumentType = function(qualifiedName, publicId, systemId) {
                    throw new Error("This DOM method is not implemented.");
                  };
                  XMLDOMImplementation2.prototype.createDocument = function(namespaceURI, qualifiedName, doctype) {
                    throw new Error("This DOM method is not implemented.");
                  };
                  XMLDOMImplementation2.prototype.createHTMLDocument = function(title) {
                    throw new Error("This DOM method is not implemented.");
                  };
                  XMLDOMImplementation2.prototype.getFeature = function(feature, version) {
                    throw new Error("This DOM method is not implemented.");
                  };
                  return XMLDOMImplementation2;
                }();
              }).call(exports);
            }
          });
          var require_XMLDOMErrorHandler = __commonJS({
            "node_modules/.pnpm/xmlbuilder@11.0.1/node_modules/xmlbuilder/lib/XMLDOMErrorHandler.js"(exports, module) {
              (function() {
                var XMLDOMErrorHandler;
                module.exports = XMLDOMErrorHandler = function() {
                  function XMLDOMErrorHandler2() {
                  }
                  XMLDOMErrorHandler2.prototype.handleError = function(error) {
                    throw new Error(error);
                  };
                  return XMLDOMErrorHandler2;
                }();
              }).call(exports);
            }
          });
          var require_XMLDOMStringList = __commonJS({
            "node_modules/.pnpm/xmlbuilder@11.0.1/node_modules/xmlbuilder/lib/XMLDOMStringList.js"(exports, module) {
              (function() {
                var XMLDOMStringList;
                module.exports = XMLDOMStringList = function() {
                  function XMLDOMStringList2(arr) {
                    this.arr = arr || [];
                  }
                  Object.defineProperty(XMLDOMStringList2.prototype, "length", {
                    get: function() {
                      return this.arr.length;
                    }
                  });
                  XMLDOMStringList2.prototype.item = function(index) {
                    return this.arr[index] || null;
                  };
                  XMLDOMStringList2.prototype.contains = function(str) {
                    return this.arr.indexOf(str) !== -1;
                  };
                  return XMLDOMStringList2;
                }();
              }).call(exports);
            }
          });
          var require_XMLDOMConfiguration = __commonJS({
            "node_modules/.pnpm/xmlbuilder@11.0.1/node_modules/xmlbuilder/lib/XMLDOMConfiguration.js"(exports, module) {
              (function() {
                var XMLDOMConfiguration, XMLDOMErrorHandler, XMLDOMStringList;
                XMLDOMErrorHandler = require_XMLDOMErrorHandler();
                XMLDOMStringList = require_XMLDOMStringList();
                module.exports = XMLDOMConfiguration = function() {
                  function XMLDOMConfiguration2() {
                    var clonedSelf;
                    this.defaultParams = {
                      "canonical-form": false,
                      "cdata-sections": false,
                      "comments": false,
                      "datatype-normalization": false,
                      "element-content-whitespace": true,
                      "entities": true,
                      "error-handler": new XMLDOMErrorHandler(),
                      "infoset": true,
                      "validate-if-schema": false,
                      "namespaces": true,
                      "namespace-declarations": true,
                      "normalize-characters": false,
                      "schema-location": "",
                      "schema-type": "",
                      "split-cdata-sections": true,
                      "validate": false,
                      "well-formed": true
                    };
                    this.params = clonedSelf = Object.create(this.defaultParams);
                  }
                  Object.defineProperty(XMLDOMConfiguration2.prototype, "parameterNames", {
                    get: function() {
                      return new XMLDOMStringList(Object.keys(this.defaultParams));
                    }
                  });
                  XMLDOMConfiguration2.prototype.getParameter = function(name) {
                    if (this.params.hasOwnProperty(name)) {
                      return this.params[name];
                    } else {
                      return null;
                    }
                  };
                  XMLDOMConfiguration2.prototype.canSetParameter = function(name, value) {
                    return true;
                  };
                  XMLDOMConfiguration2.prototype.setParameter = function(name, value) {
                    if (value != null) {
                      return this.params[name] = value;
                    } else {
                      return delete this.params[name];
                    }
                  };
                  return XMLDOMConfiguration2;
                }();
              }).call(exports);
            }
          });
          var require_NodeType = __commonJS({
            "node_modules/.pnpm/xmlbuilder@11.0.1/node_modules/xmlbuilder/lib/NodeType.js"(exports, module) {
              (function() {
                module.exports = {
                  Element: 1,
                  Attribute: 2,
                  Text: 3,
                  CData: 4,
                  EntityReference: 5,
                  EntityDeclaration: 6,
                  ProcessingInstruction: 7,
                  Comment: 8,
                  Document: 9,
                  DocType: 10,
                  DocumentFragment: 11,
                  NotationDeclaration: 12,
                  Declaration: 201,
                  Raw: 202,
                  AttributeDeclaration: 203,
                  ElementDeclaration: 204,
                  Dummy: 205
                };
              }).call(exports);
            }
          });
          var require_XMLAttribute = __commonJS({
            "node_modules/.pnpm/xmlbuilder@11.0.1/node_modules/xmlbuilder/lib/XMLAttribute.js"(exports, module) {
              (function() {
                var NodeType, XMLAttribute, XMLNode;
                NodeType = require_NodeType();
                XMLNode = require_XMLNode();
                module.exports = XMLAttribute = function() {
                  function XMLAttribute2(parent, name, value) {
                    this.parent = parent;
                    if (this.parent) {
                      this.options = this.parent.options;
                      this.stringify = this.parent.stringify;
                    }
                    if (name == null) {
                      throw new Error("Missing attribute name. " + this.debugInfo(name));
                    }
                    this.name = this.stringify.name(name);
                    this.value = this.stringify.attValue(value);
                    this.type = NodeType.Attribute;
                    this.isId = false;
                    this.schemaTypeInfo = null;
                  }
                  Object.defineProperty(XMLAttribute2.prototype, "nodeType", {
                    get: function() {
                      return this.type;
                    }
                  });
                  Object.defineProperty(XMLAttribute2.prototype, "ownerElement", {
                    get: function() {
                      return this.parent;
                    }
                  });
                  Object.defineProperty(XMLAttribute2.prototype, "textContent", {
                    get: function() {
                      return this.value;
                    },
                    set: function(value) {
                      return this.value = value || "";
                    }
                  });
                  Object.defineProperty(XMLAttribute2.prototype, "namespaceURI", {
                    get: function() {
                      return "";
                    }
                  });
                  Object.defineProperty(XMLAttribute2.prototype, "prefix", {
                    get: function() {
                      return "";
                    }
                  });
                  Object.defineProperty(XMLAttribute2.prototype, "localName", {
                    get: function() {
                      return this.name;
                    }
                  });
                  Object.defineProperty(XMLAttribute2.prototype, "specified", {
                    get: function() {
                      return true;
                    }
                  });
                  XMLAttribute2.prototype.clone = function() {
                    return Object.create(this);
                  };
                  XMLAttribute2.prototype.toString = function(options) {
                    return this.options.writer.attribute(this, this.options.writer.filterOptions(options));
                  };
                  XMLAttribute2.prototype.debugInfo = function(name) {
                    name = name || this.name;
                    if (name == null) {
                      return "parent: <" + this.parent.name + ">";
                    } else {
                      return "attribute: {" + name + "}, parent: <" + this.parent.name + ">";
                    }
                  };
                  XMLAttribute2.prototype.isEqualNode = function(node) {
                    if (node.namespaceURI !== this.namespaceURI) {
                      return false;
                    }
                    if (node.prefix !== this.prefix) {
                      return false;
                    }
                    if (node.localName !== this.localName) {
                      return false;
                    }
                    if (node.value !== this.value) {
                      return false;
                    }
                    return true;
                  };
                  return XMLAttribute2;
                }();
              }).call(exports);
            }
          });
          var require_XMLNamedNodeMap = __commonJS({
            "node_modules/.pnpm/xmlbuilder@11.0.1/node_modules/xmlbuilder/lib/XMLNamedNodeMap.js"(exports, module) {
              (function() {
                var XMLNamedNodeMap;
                module.exports = XMLNamedNodeMap = function() {
                  function XMLNamedNodeMap2(nodes) {
                    this.nodes = nodes;
                  }
                  Object.defineProperty(XMLNamedNodeMap2.prototype, "length", {
                    get: function() {
                      return Object.keys(this.nodes).length || 0;
                    }
                  });
                  XMLNamedNodeMap2.prototype.clone = function() {
                    return this.nodes = null;
                  };
                  XMLNamedNodeMap2.prototype.getNamedItem = function(name) {
                    return this.nodes[name];
                  };
                  XMLNamedNodeMap2.prototype.setNamedItem = function(node) {
                    var oldNode;
                    oldNode = this.nodes[node.nodeName];
                    this.nodes[node.nodeName] = node;
                    return oldNode || null;
                  };
                  XMLNamedNodeMap2.prototype.removeNamedItem = function(name) {
                    var oldNode;
                    oldNode = this.nodes[name];
                    delete this.nodes[name];
                    return oldNode || null;
                  };
                  XMLNamedNodeMap2.prototype.item = function(index) {
                    return this.nodes[Object.keys(this.nodes)[index]] || null;
                  };
                  XMLNamedNodeMap2.prototype.getNamedItemNS = function(namespaceURI, localName) {
                    throw new Error("This DOM method is not implemented.");
                  };
                  XMLNamedNodeMap2.prototype.setNamedItemNS = function(node) {
                    throw new Error("This DOM method is not implemented.");
                  };
                  XMLNamedNodeMap2.prototype.removeNamedItemNS = function(namespaceURI, localName) {
                    throw new Error("This DOM method is not implemented.");
                  };
                  return XMLNamedNodeMap2;
                }();
              }).call(exports);
            }
          });
          var require_XMLElement = __commonJS({
            "node_modules/.pnpm/xmlbuilder@11.0.1/node_modules/xmlbuilder/lib/XMLElement.js"(exports, module) {
              (function() {
                var NodeType, XMLAttribute, XMLElement, XMLNamedNodeMap, XMLNode, getValue, isFunction, isObject, ref, extend = function(child, parent) {
                  for (var key in parent) {
                    if (hasProp.call(parent, key))
                      child[key] = parent[key];
                  }
                  function ctor() {
                    this.constructor = child;
                  }
                  ctor.prototype = parent.prototype;
                  child.prototype = new ctor();
                  child.__super__ = parent.prototype;
                  return child;
                }, hasProp = {}.hasOwnProperty;
                ref = require_Utility(), isObject = ref.isObject, isFunction = ref.isFunction, getValue = ref.getValue;
                XMLNode = require_XMLNode();
                NodeType = require_NodeType();
                XMLAttribute = require_XMLAttribute();
                XMLNamedNodeMap = require_XMLNamedNodeMap();
                module.exports = XMLElement = function(superClass) {
                  extend(XMLElement2, superClass);
                  function XMLElement2(parent, name, attributes) {
                    var child, j, len, ref1;
                    XMLElement2.__super__.constructor.call(this, parent);
                    if (name == null) {
                      throw new Error("Missing element name. " + this.debugInfo());
                    }
                    this.name = this.stringify.name(name);
                    this.type = NodeType.Element;
                    this.attribs = {};
                    this.schemaTypeInfo = null;
                    if (attributes != null) {
                      this.attribute(attributes);
                    }
                    if (parent.type === NodeType.Document) {
                      this.isRoot = true;
                      this.documentObject = parent;
                      parent.rootObject = this;
                      if (parent.children) {
                        ref1 = parent.children;
                        for (j = 0, len = ref1.length; j < len; j++) {
                          child = ref1[j];
                          if (child.type === NodeType.DocType) {
                            child.name = this.name;
                            break;
                          }
                        }
                      }
                    }
                  }
                  Object.defineProperty(XMLElement2.prototype, "tagName", {
                    get: function() {
                      return this.name;
                    }
                  });
                  Object.defineProperty(XMLElement2.prototype, "namespaceURI", {
                    get: function() {
                      return "";
                    }
                  });
                  Object.defineProperty(XMLElement2.prototype, "prefix", {
                    get: function() {
                      return "";
                    }
                  });
                  Object.defineProperty(XMLElement2.prototype, "localName", {
                    get: function() {
                      return this.name;
                    }
                  });
                  Object.defineProperty(XMLElement2.prototype, "id", {
                    get: function() {
                      throw new Error("This DOM method is not implemented." + this.debugInfo());
                    }
                  });
                  Object.defineProperty(XMLElement2.prototype, "className", {
                    get: function() {
                      throw new Error("This DOM method is not implemented." + this.debugInfo());
                    }
                  });
                  Object.defineProperty(XMLElement2.prototype, "classList", {
                    get: function() {
                      throw new Error("This DOM method is not implemented." + this.debugInfo());
                    }
                  });
                  Object.defineProperty(XMLElement2.prototype, "attributes", {
                    get: function() {
                      if (!this.attributeMap || !this.attributeMap.nodes) {
                        this.attributeMap = new XMLNamedNodeMap(this.attribs);
                      }
                      return this.attributeMap;
                    }
                  });
                  XMLElement2.prototype.clone = function() {
                    var att, attName, clonedSelf, ref1;
                    clonedSelf = Object.create(this);
                    if (clonedSelf.isRoot) {
                      clonedSelf.documentObject = null;
                    }
                    clonedSelf.attribs = {};
                    ref1 = this.attribs;
                    for (attName in ref1) {
                      if (!hasProp.call(ref1, attName))
                        continue;
                      att = ref1[attName];
                      clonedSelf.attribs[attName] = att.clone();
                    }
                    clonedSelf.children = [];
                    this.children.forEach(function(child) {
                      var clonedChild;
                      clonedChild = child.clone();
                      clonedChild.parent = clonedSelf;
                      return clonedSelf.children.push(clonedChild);
                    });
                    return clonedSelf;
                  };
                  XMLElement2.prototype.attribute = function(name, value) {
                    var attName, attValue;
                    if (name != null) {
                      name = getValue(name);
                    }
                    if (isObject(name)) {
                      for (attName in name) {
                        if (!hasProp.call(name, attName))
                          continue;
                        attValue = name[attName];
                        this.attribute(attName, attValue);
                      }
                    } else {
                      if (isFunction(value)) {
                        value = value.apply();
                      }
                      if (this.options.keepNullAttributes && value == null) {
                        this.attribs[name] = new XMLAttribute(this, name, "");
                      } else if (value != null) {
                        this.attribs[name] = new XMLAttribute(this, name, value);
                      }
                    }
                    return this;
                  };
                  XMLElement2.prototype.removeAttribute = function(name) {
                    var attName, j, len;
                    if (name == null) {
                      throw new Error("Missing attribute name. " + this.debugInfo());
                    }
                    name = getValue(name);
                    if (Array.isArray(name)) {
                      for (j = 0, len = name.length; j < len; j++) {
                        attName = name[j];
                        delete this.attribs[attName];
                      }
                    } else {
                      delete this.attribs[name];
                    }
                    return this;
                  };
                  XMLElement2.prototype.toString = function(options) {
                    return this.options.writer.element(this, this.options.writer.filterOptions(options));
                  };
                  XMLElement2.prototype.att = function(name, value) {
                    return this.attribute(name, value);
                  };
                  XMLElement2.prototype.a = function(name, value) {
                    return this.attribute(name, value);
                  };
                  XMLElement2.prototype.getAttribute = function(name) {
                    if (this.attribs.hasOwnProperty(name)) {
                      return this.attribs[name].value;
                    } else {
                      return null;
                    }
                  };
                  XMLElement2.prototype.setAttribute = function(name, value) {
                    throw new Error("This DOM method is not implemented." + this.debugInfo());
                  };
                  XMLElement2.prototype.getAttributeNode = function(name) {
                    if (this.attribs.hasOwnProperty(name)) {
                      return this.attribs[name];
                    } else {
                      return null;
                    }
                  };
                  XMLElement2.prototype.setAttributeNode = function(newAttr) {
                    throw new Error("This DOM method is not implemented." + this.debugInfo());
                  };
                  XMLElement2.prototype.removeAttributeNode = function(oldAttr) {
                    throw new Error("This DOM method is not implemented." + this.debugInfo());
                  };
                  XMLElement2.prototype.getElementsByTagName = function(name) {
                    throw new Error("This DOM method is not implemented." + this.debugInfo());
                  };
                  XMLElement2.prototype.getAttributeNS = function(namespaceURI, localName) {
                    throw new Error("This DOM method is not implemented." + this.debugInfo());
                  };
                  XMLElement2.prototype.setAttributeNS = function(namespaceURI, qualifiedName, value) {
                    throw new Error("This DOM method is not implemented." + this.debugInfo());
                  };
                  XMLElement2.prototype.removeAttributeNS = function(namespaceURI, localName) {
                    throw new Error("This DOM method is not implemented." + this.debugInfo());
                  };
                  XMLElement2.prototype.getAttributeNodeNS = function(namespaceURI, localName) {
                    throw new Error("This DOM method is not implemented." + this.debugInfo());
                  };
                  XMLElement2.prototype.setAttributeNodeNS = function(newAttr) {
                    throw new Error("This DOM method is not implemented." + this.debugInfo());
                  };
                  XMLElement2.prototype.getElementsByTagNameNS = function(namespaceURI, localName) {
                    throw new Error("This DOM method is not implemented." + this.debugInfo());
                  };
                  XMLElement2.prototype.hasAttribute = function(name) {
                    return this.attribs.hasOwnProperty(name);
                  };
                  XMLElement2.prototype.hasAttributeNS = function(namespaceURI, localName) {
                    throw new Error("This DOM method is not implemented." + this.debugInfo());
                  };
                  XMLElement2.prototype.setIdAttribute = function(name, isId) {
                    if (this.attribs.hasOwnProperty(name)) {
                      return this.attribs[name].isId;
                    } else {
                      return isId;
                    }
                  };
                  XMLElement2.prototype.setIdAttributeNS = function(namespaceURI, localName, isId) {
                    throw new Error("This DOM method is not implemented." + this.debugInfo());
                  };
                  XMLElement2.prototype.setIdAttributeNode = function(idAttr, isId) {
                    throw new Error("This DOM method is not implemented." + this.debugInfo());
                  };
                  XMLElement2.prototype.getElementsByTagName = function(tagname) {
                    throw new Error("This DOM method is not implemented." + this.debugInfo());
                  };
                  XMLElement2.prototype.getElementsByTagNameNS = function(namespaceURI, localName) {
                    throw new Error("This DOM method is not implemented." + this.debugInfo());
                  };
                  XMLElement2.prototype.getElementsByClassName = function(classNames) {
                    throw new Error("This DOM method is not implemented." + this.debugInfo());
                  };
                  XMLElement2.prototype.isEqualNode = function(node) {
                    var i, j, ref1;
                    if (!XMLElement2.__super__.isEqualNode.apply(this, arguments).isEqualNode(node)) {
                      return false;
                    }
                    if (node.namespaceURI !== this.namespaceURI) {
                      return false;
                    }
                    if (node.prefix !== this.prefix) {
                      return false;
                    }
                    if (node.localName !== this.localName) {
                      return false;
                    }
                    if (node.attribs.length !== this.attribs.length) {
                      return false;
                    }
                    for (i = j = 0, ref1 = this.attribs.length - 1; 0 <= ref1 ? j <= ref1 : j >= ref1; i = 0 <= ref1 ? ++j : --j) {
                      if (!this.attribs[i].isEqualNode(node.attribs[i])) {
                        return false;
                      }
                    }
                    return true;
                  };
                  return XMLElement2;
                }(XMLNode);
              }).call(exports);
            }
          });
          var require_XMLCharacterData = __commonJS({
            "node_modules/.pnpm/xmlbuilder@11.0.1/node_modules/xmlbuilder/lib/XMLCharacterData.js"(exports, module) {
              (function() {
                var XMLCharacterData, XMLNode, extend = function(child, parent) {
                  for (var key in parent) {
                    if (hasProp.call(parent, key))
                      child[key] = parent[key];
                  }
                  function ctor() {
                    this.constructor = child;
                  }
                  ctor.prototype = parent.prototype;
                  child.prototype = new ctor();
                  child.__super__ = parent.prototype;
                  return child;
                }, hasProp = {}.hasOwnProperty;
                XMLNode = require_XMLNode();
                module.exports = XMLCharacterData = function(superClass) {
                  extend(XMLCharacterData2, superClass);
                  function XMLCharacterData2(parent) {
                    XMLCharacterData2.__super__.constructor.call(this, parent);
                    this.value = "";
                  }
                  Object.defineProperty(XMLCharacterData2.prototype, "data", {
                    get: function() {
                      return this.value;
                    },
                    set: function(value) {
                      return this.value = value || "";
                    }
                  });
                  Object.defineProperty(XMLCharacterData2.prototype, "length", {
                    get: function() {
                      return this.value.length;
                    }
                  });
                  Object.defineProperty(XMLCharacterData2.prototype, "textContent", {
                    get: function() {
                      return this.value;
                    },
                    set: function(value) {
                      return this.value = value || "";
                    }
                  });
                  XMLCharacterData2.prototype.clone = function() {
                    return Object.create(this);
                  };
                  XMLCharacterData2.prototype.substringData = function(offset, count) {
                    throw new Error("This DOM method is not implemented." + this.debugInfo());
                  };
                  XMLCharacterData2.prototype.appendData = function(arg) {
                    throw new Error("This DOM method is not implemented." + this.debugInfo());
                  };
                  XMLCharacterData2.prototype.insertData = function(offset, arg) {
                    throw new Error("This DOM method is not implemented." + this.debugInfo());
                  };
                  XMLCharacterData2.prototype.deleteData = function(offset, count) {
                    throw new Error("This DOM method is not implemented." + this.debugInfo());
                  };
                  XMLCharacterData2.prototype.replaceData = function(offset, count, arg) {
                    throw new Error("This DOM method is not implemented." + this.debugInfo());
                  };
                  XMLCharacterData2.prototype.isEqualNode = function(node) {
                    if (!XMLCharacterData2.__super__.isEqualNode.apply(this, arguments).isEqualNode(node)) {
                      return false;
                    }
                    if (node.data !== this.data) {
                      return false;
                    }
                    return true;
                  };
                  return XMLCharacterData2;
                }(XMLNode);
              }).call(exports);
            }
          });
          var require_XMLCData = __commonJS({
            "node_modules/.pnpm/xmlbuilder@11.0.1/node_modules/xmlbuilder/lib/XMLCData.js"(exports, module) {
              (function() {
                var NodeType, XMLCData, XMLCharacterData, extend = function(child, parent) {
                  for (var key in parent) {
                    if (hasProp.call(parent, key))
                      child[key] = parent[key];
                  }
                  function ctor() {
                    this.constructor = child;
                  }
                  ctor.prototype = parent.prototype;
                  child.prototype = new ctor();
                  child.__super__ = parent.prototype;
                  return child;
                }, hasProp = {}.hasOwnProperty;
                NodeType = require_NodeType();
                XMLCharacterData = require_XMLCharacterData();
                module.exports = XMLCData = function(superClass) {
                  extend(XMLCData2, superClass);
                  function XMLCData2(parent, text) {
                    XMLCData2.__super__.constructor.call(this, parent);
                    if (text == null) {
                      throw new Error("Missing CDATA text. " + this.debugInfo());
                    }
                    this.name = "#cdata-section";
                    this.type = NodeType.CData;
                    this.value = this.stringify.cdata(text);
                  }
                  XMLCData2.prototype.clone = function() {
                    return Object.create(this);
                  };
                  XMLCData2.prototype.toString = function(options) {
                    return this.options.writer.cdata(this, this.options.writer.filterOptions(options));
                  };
                  return XMLCData2;
                }(XMLCharacterData);
              }).call(exports);
            }
          });
          var require_XMLComment = __commonJS({
            "node_modules/.pnpm/xmlbuilder@11.0.1/node_modules/xmlbuilder/lib/XMLComment.js"(exports, module) {
              (function() {
                var NodeType, XMLCharacterData, XMLComment, extend = function(child, parent) {
                  for (var key in parent) {
                    if (hasProp.call(parent, key))
                      child[key] = parent[key];
                  }
                  function ctor() {
                    this.constructor = child;
                  }
                  ctor.prototype = parent.prototype;
                  child.prototype = new ctor();
                  child.__super__ = parent.prototype;
                  return child;
                }, hasProp = {}.hasOwnProperty;
                NodeType = require_NodeType();
                XMLCharacterData = require_XMLCharacterData();
                module.exports = XMLComment = function(superClass) {
                  extend(XMLComment2, superClass);
                  function XMLComment2(parent, text) {
                    XMLComment2.__super__.constructor.call(this, parent);
                    if (text == null) {
                      throw new Error("Missing comment text. " + this.debugInfo());
                    }
                    this.name = "#comment";
                    this.type = NodeType.Comment;
                    this.value = this.stringify.comment(text);
                  }
                  XMLComment2.prototype.clone = function() {
                    return Object.create(this);
                  };
                  XMLComment2.prototype.toString = function(options) {
                    return this.options.writer.comment(this, this.options.writer.filterOptions(options));
                  };
                  return XMLComment2;
                }(XMLCharacterData);
              }).call(exports);
            }
          });
          var require_XMLDeclaration = __commonJS({
            "node_modules/.pnpm/xmlbuilder@11.0.1/node_modules/xmlbuilder/lib/XMLDeclaration.js"(exports, module) {
              (function() {
                var NodeType, XMLDeclaration, XMLNode, isObject, extend = function(child, parent) {
                  for (var key in parent) {
                    if (hasProp.call(parent, key))
                      child[key] = parent[key];
                  }
                  function ctor() {
                    this.constructor = child;
                  }
                  ctor.prototype = parent.prototype;
                  child.prototype = new ctor();
                  child.__super__ = parent.prototype;
                  return child;
                }, hasProp = {}.hasOwnProperty;
                isObject = require_Utility().isObject;
                XMLNode = require_XMLNode();
                NodeType = require_NodeType();
                module.exports = XMLDeclaration = function(superClass) {
                  extend(XMLDeclaration2, superClass);
                  function XMLDeclaration2(parent, version, encoding, standalone) {
                    var ref;
                    XMLDeclaration2.__super__.constructor.call(this, parent);
                    if (isObject(version)) {
                      ref = version, version = ref.version, encoding = ref.encoding, standalone = ref.standalone;
                    }
                    if (!version) {
                      version = "1.0";
                    }
                    this.type = NodeType.Declaration;
                    this.version = this.stringify.xmlVersion(version);
                    if (encoding != null) {
                      this.encoding = this.stringify.xmlEncoding(encoding);
                    }
                    if (standalone != null) {
                      this.standalone = this.stringify.xmlStandalone(standalone);
                    }
                  }
                  XMLDeclaration2.prototype.toString = function(options) {
                    return this.options.writer.declaration(this, this.options.writer.filterOptions(options));
                  };
                  return XMLDeclaration2;
                }(XMLNode);
              }).call(exports);
            }
          });
          var require_XMLDTDAttList = __commonJS({
            "node_modules/.pnpm/xmlbuilder@11.0.1/node_modules/xmlbuilder/lib/XMLDTDAttList.js"(exports, module) {
              (function() {
                var NodeType, XMLDTDAttList, XMLNode, extend = function(child, parent) {
                  for (var key in parent) {
                    if (hasProp.call(parent, key))
                      child[key] = parent[key];
                  }
                  function ctor() {
                    this.constructor = child;
                  }
                  ctor.prototype = parent.prototype;
                  child.prototype = new ctor();
                  child.__super__ = parent.prototype;
                  return child;
                }, hasProp = {}.hasOwnProperty;
                XMLNode = require_XMLNode();
                NodeType = require_NodeType();
                module.exports = XMLDTDAttList = function(superClass) {
                  extend(XMLDTDAttList2, superClass);
                  function XMLDTDAttList2(parent, elementName, attributeName, attributeType, defaultValueType, defaultValue) {
                    XMLDTDAttList2.__super__.constructor.call(this, parent);
                    if (elementName == null) {
                      throw new Error("Missing DTD element name. " + this.debugInfo());
                    }
                    if (attributeName == null) {
                      throw new Error("Missing DTD attribute name. " + this.debugInfo(elementName));
                    }
                    if (!attributeType) {
                      throw new Error("Missing DTD attribute type. " + this.debugInfo(elementName));
                    }
                    if (!defaultValueType) {
                      throw new Error("Missing DTD attribute default. " + this.debugInfo(elementName));
                    }
                    if (defaultValueType.indexOf("#") !== 0) {
                      defaultValueType = "#" + defaultValueType;
                    }
                    if (!defaultValueType.match(/^(#REQUIRED|#IMPLIED|#FIXED|#DEFAULT)$/)) {
                      throw new Error("Invalid default value type; expected: #REQUIRED, #IMPLIED, #FIXED or #DEFAULT. " + this.debugInfo(elementName));
                    }
                    if (defaultValue && !defaultValueType.match(/^(#FIXED|#DEFAULT)$/)) {
                      throw new Error("Default value only applies to #FIXED or #DEFAULT. " + this.debugInfo(elementName));
                    }
                    this.elementName = this.stringify.name(elementName);
                    this.type = NodeType.AttributeDeclaration;
                    this.attributeName = this.stringify.name(attributeName);
                    this.attributeType = this.stringify.dtdAttType(attributeType);
                    if (defaultValue) {
                      this.defaultValue = this.stringify.dtdAttDefault(defaultValue);
                    }
                    this.defaultValueType = defaultValueType;
                  }
                  XMLDTDAttList2.prototype.toString = function(options) {
                    return this.options.writer.dtdAttList(this, this.options.writer.filterOptions(options));
                  };
                  return XMLDTDAttList2;
                }(XMLNode);
              }).call(exports);
            }
          });
          var require_XMLDTDEntity = __commonJS({
            "node_modules/.pnpm/xmlbuilder@11.0.1/node_modules/xmlbuilder/lib/XMLDTDEntity.js"(exports, module) {
              (function() {
                var NodeType, XMLDTDEntity, XMLNode, isObject, extend = function(child, parent) {
                  for (var key in parent) {
                    if (hasProp.call(parent, key))
                      child[key] = parent[key];
                  }
                  function ctor() {
                    this.constructor = child;
                  }
                  ctor.prototype = parent.prototype;
                  child.prototype = new ctor();
                  child.__super__ = parent.prototype;
                  return child;
                }, hasProp = {}.hasOwnProperty;
                isObject = require_Utility().isObject;
                XMLNode = require_XMLNode();
                NodeType = require_NodeType();
                module.exports = XMLDTDEntity = function(superClass) {
                  extend(XMLDTDEntity2, superClass);
                  function XMLDTDEntity2(parent, pe, name, value) {
                    XMLDTDEntity2.__super__.constructor.call(this, parent);
                    if (name == null) {
                      throw new Error("Missing DTD entity name. " + this.debugInfo(name));
                    }
                    if (value == null) {
                      throw new Error("Missing DTD entity value. " + this.debugInfo(name));
                    }
                    this.pe = !!pe;
                    this.name = this.stringify.name(name);
                    this.type = NodeType.EntityDeclaration;
                    if (!isObject(value)) {
                      this.value = this.stringify.dtdEntityValue(value);
                      this.internal = true;
                    } else {
                      if (!value.pubID && !value.sysID) {
                        throw new Error("Public and/or system identifiers are required for an external entity. " + this.debugInfo(name));
                      }
                      if (value.pubID && !value.sysID) {
                        throw new Error("System identifier is required for a public external entity. " + this.debugInfo(name));
                      }
                      this.internal = false;
                      if (value.pubID != null) {
                        this.pubID = this.stringify.dtdPubID(value.pubID);
                      }
                      if (value.sysID != null) {
                        this.sysID = this.stringify.dtdSysID(value.sysID);
                      }
                      if (value.nData != null) {
                        this.nData = this.stringify.dtdNData(value.nData);
                      }
                      if (this.pe && this.nData) {
                        throw new Error("Notation declaration is not allowed in a parameter entity. " + this.debugInfo(name));
                      }
                    }
                  }
                  Object.defineProperty(XMLDTDEntity2.prototype, "publicId", {
                    get: function() {
                      return this.pubID;
                    }
                  });
                  Object.defineProperty(XMLDTDEntity2.prototype, "systemId", {
                    get: function() {
                      return this.sysID;
                    }
                  });
                  Object.defineProperty(XMLDTDEntity2.prototype, "notationName", {
                    get: function() {
                      return this.nData || null;
                    }
                  });
                  Object.defineProperty(XMLDTDEntity2.prototype, "inputEncoding", {
                    get: function() {
                      return null;
                    }
                  });
                  Object.defineProperty(XMLDTDEntity2.prototype, "xmlEncoding", {
                    get: function() {
                      return null;
                    }
                  });
                  Object.defineProperty(XMLDTDEntity2.prototype, "xmlVersion", {
                    get: function() {
                      return null;
                    }
                  });
                  XMLDTDEntity2.prototype.toString = function(options) {
                    return this.options.writer.dtdEntity(this, this.options.writer.filterOptions(options));
                  };
                  return XMLDTDEntity2;
                }(XMLNode);
              }).call(exports);
            }
          });
          var require_XMLDTDElement = __commonJS({
            "node_modules/.pnpm/xmlbuilder@11.0.1/node_modules/xmlbuilder/lib/XMLDTDElement.js"(exports, module) {
              (function() {
                var NodeType, XMLDTDElement, XMLNode, extend = function(child, parent) {
                  for (var key in parent) {
                    if (hasProp.call(parent, key))
                      child[key] = parent[key];
                  }
                  function ctor() {
                    this.constructor = child;
                  }
                  ctor.prototype = parent.prototype;
                  child.prototype = new ctor();
                  child.__super__ = parent.prototype;
                  return child;
                }, hasProp = {}.hasOwnProperty;
                XMLNode = require_XMLNode();
                NodeType = require_NodeType();
                module.exports = XMLDTDElement = function(superClass) {
                  extend(XMLDTDElement2, superClass);
                  function XMLDTDElement2(parent, name, value) {
                    XMLDTDElement2.__super__.constructor.call(this, parent);
                    if (name == null) {
                      throw new Error("Missing DTD element name. " + this.debugInfo());
                    }
                    if (!value) {
                      value = "(#PCDATA)";
                    }
                    if (Array.isArray(value)) {
                      value = "(" + value.join(",") + ")";
                    }
                    this.name = this.stringify.name(name);
                    this.type = NodeType.ElementDeclaration;
                    this.value = this.stringify.dtdElementValue(value);
                  }
                  XMLDTDElement2.prototype.toString = function(options) {
                    return this.options.writer.dtdElement(this, this.options.writer.filterOptions(options));
                  };
                  return XMLDTDElement2;
                }(XMLNode);
              }).call(exports);
            }
          });
          var require_XMLDTDNotation = __commonJS({
            "node_modules/.pnpm/xmlbuilder@11.0.1/node_modules/xmlbuilder/lib/XMLDTDNotation.js"(exports, module) {
              (function() {
                var NodeType, XMLDTDNotation, XMLNode, extend = function(child, parent) {
                  for (var key in parent) {
                    if (hasProp.call(parent, key))
                      child[key] = parent[key];
                  }
                  function ctor() {
                    this.constructor = child;
                  }
                  ctor.prototype = parent.prototype;
                  child.prototype = new ctor();
                  child.__super__ = parent.prototype;
                  return child;
                }, hasProp = {}.hasOwnProperty;
                XMLNode = require_XMLNode();
                NodeType = require_NodeType();
                module.exports = XMLDTDNotation = function(superClass) {
                  extend(XMLDTDNotation2, superClass);
                  function XMLDTDNotation2(parent, name, value) {
                    XMLDTDNotation2.__super__.constructor.call(this, parent);
                    if (name == null) {
                      throw new Error("Missing DTD notation name. " + this.debugInfo(name));
                    }
                    if (!value.pubID && !value.sysID) {
                      throw new Error("Public or system identifiers are required for an external entity. " + this.debugInfo(name));
                    }
                    this.name = this.stringify.name(name);
                    this.type = NodeType.NotationDeclaration;
                    if (value.pubID != null) {
                      this.pubID = this.stringify.dtdPubID(value.pubID);
                    }
                    if (value.sysID != null) {
                      this.sysID = this.stringify.dtdSysID(value.sysID);
                    }
                  }
                  Object.defineProperty(XMLDTDNotation2.prototype, "publicId", {
                    get: function() {
                      return this.pubID;
                    }
                  });
                  Object.defineProperty(XMLDTDNotation2.prototype, "systemId", {
                    get: function() {
                      return this.sysID;
                    }
                  });
                  XMLDTDNotation2.prototype.toString = function(options) {
                    return this.options.writer.dtdNotation(this, this.options.writer.filterOptions(options));
                  };
                  return XMLDTDNotation2;
                }(XMLNode);
              }).call(exports);
            }
          });
          var require_XMLDocType = __commonJS({
            "node_modules/.pnpm/xmlbuilder@11.0.1/node_modules/xmlbuilder/lib/XMLDocType.js"(exports, module) {
              (function() {
                var NodeType, XMLDTDAttList, XMLDTDElement, XMLDTDEntity, XMLDTDNotation, XMLDocType, XMLNamedNodeMap, XMLNode, isObject, extend = function(child, parent) {
                  for (var key in parent) {
                    if (hasProp.call(parent, key))
                      child[key] = parent[key];
                  }
                  function ctor() {
                    this.constructor = child;
                  }
                  ctor.prototype = parent.prototype;
                  child.prototype = new ctor();
                  child.__super__ = parent.prototype;
                  return child;
                }, hasProp = {}.hasOwnProperty;
                isObject = require_Utility().isObject;
                XMLNode = require_XMLNode();
                NodeType = require_NodeType();
                XMLDTDAttList = require_XMLDTDAttList();
                XMLDTDEntity = require_XMLDTDEntity();
                XMLDTDElement = require_XMLDTDElement();
                XMLDTDNotation = require_XMLDTDNotation();
                XMLNamedNodeMap = require_XMLNamedNodeMap();
                module.exports = XMLDocType = function(superClass) {
                  extend(XMLDocType2, superClass);
                  function XMLDocType2(parent, pubID, sysID) {
                    var child, i, len, ref, ref1, ref2;
                    XMLDocType2.__super__.constructor.call(this, parent);
                    this.type = NodeType.DocType;
                    if (parent.children) {
                      ref = parent.children;
                      for (i = 0, len = ref.length; i < len; i++) {
                        child = ref[i];
                        if (child.type === NodeType.Element) {
                          this.name = child.name;
                          break;
                        }
                      }
                    }
                    this.documentObject = parent;
                    if (isObject(pubID)) {
                      ref1 = pubID, pubID = ref1.pubID, sysID = ref1.sysID;
                    }
                    if (sysID == null) {
                      ref2 = [pubID, sysID], sysID = ref2[0], pubID = ref2[1];
                    }
                    if (pubID != null) {
                      this.pubID = this.stringify.dtdPubID(pubID);
                    }
                    if (sysID != null) {
                      this.sysID = this.stringify.dtdSysID(sysID);
                    }
                  }
                  Object.defineProperty(XMLDocType2.prototype, "entities", {
                    get: function() {
                      var child, i, len, nodes, ref;
                      nodes = {};
                      ref = this.children;
                      for (i = 0, len = ref.length; i < len; i++) {
                        child = ref[i];
                        if (child.type === NodeType.EntityDeclaration && !child.pe) {
                          nodes[child.name] = child;
                        }
                      }
                      return new XMLNamedNodeMap(nodes);
                    }
                  });
                  Object.defineProperty(XMLDocType2.prototype, "notations", {
                    get: function() {
                      var child, i, len, nodes, ref;
                      nodes = {};
                      ref = this.children;
                      for (i = 0, len = ref.length; i < len; i++) {
                        child = ref[i];
                        if (child.type === NodeType.NotationDeclaration) {
                          nodes[child.name] = child;
                        }
                      }
                      return new XMLNamedNodeMap(nodes);
                    }
                  });
                  Object.defineProperty(XMLDocType2.prototype, "publicId", {
                    get: function() {
                      return this.pubID;
                    }
                  });
                  Object.defineProperty(XMLDocType2.prototype, "systemId", {
                    get: function() {
                      return this.sysID;
                    }
                  });
                  Object.defineProperty(XMLDocType2.prototype, "internalSubset", {
                    get: function() {
                      throw new Error("This DOM method is not implemented." + this.debugInfo());
                    }
                  });
                  XMLDocType2.prototype.element = function(name, value) {
                    var child;
                    child = new XMLDTDElement(this, name, value);
                    this.children.push(child);
                    return this;
                  };
                  XMLDocType2.prototype.attList = function(elementName, attributeName, attributeType, defaultValueType, defaultValue) {
                    var child;
                    child = new XMLDTDAttList(this, elementName, attributeName, attributeType, defaultValueType, defaultValue);
                    this.children.push(child);
                    return this;
                  };
                  XMLDocType2.prototype.entity = function(name, value) {
                    var child;
                    child = new XMLDTDEntity(this, false, name, value);
                    this.children.push(child);
                    return this;
                  };
                  XMLDocType2.prototype.pEntity = function(name, value) {
                    var child;
                    child = new XMLDTDEntity(this, true, name, value);
                    this.children.push(child);
                    return this;
                  };
                  XMLDocType2.prototype.notation = function(name, value) {
                    var child;
                    child = new XMLDTDNotation(this, name, value);
                    this.children.push(child);
                    return this;
                  };
                  XMLDocType2.prototype.toString = function(options) {
                    return this.options.writer.docType(this, this.options.writer.filterOptions(options));
                  };
                  XMLDocType2.prototype.ele = function(name, value) {
                    return this.element(name, value);
                  };
                  XMLDocType2.prototype.att = function(elementName, attributeName, attributeType, defaultValueType, defaultValue) {
                    return this.attList(elementName, attributeName, attributeType, defaultValueType, defaultValue);
                  };
                  XMLDocType2.prototype.ent = function(name, value) {
                    return this.entity(name, value);
                  };
                  XMLDocType2.prototype.pent = function(name, value) {
                    return this.pEntity(name, value);
                  };
                  XMLDocType2.prototype.not = function(name, value) {
                    return this.notation(name, value);
                  };
                  XMLDocType2.prototype.up = function() {
                    return this.root() || this.documentObject;
                  };
                  XMLDocType2.prototype.isEqualNode = function(node) {
                    if (!XMLDocType2.__super__.isEqualNode.apply(this, arguments).isEqualNode(node)) {
                      return false;
                    }
                    if (node.name !== this.name) {
                      return false;
                    }
                    if (node.publicId !== this.publicId) {
                      return false;
                    }
                    if (node.systemId !== this.systemId) {
                      return false;
                    }
                    return true;
                  };
                  return XMLDocType2;
                }(XMLNode);
              }).call(exports);
            }
          });
          var require_XMLRaw = __commonJS({
            "node_modules/.pnpm/xmlbuilder@11.0.1/node_modules/xmlbuilder/lib/XMLRaw.js"(exports, module) {
              (function() {
                var NodeType, XMLNode, XMLRaw, extend = function(child, parent) {
                  for (var key in parent) {
                    if (hasProp.call(parent, key))
                      child[key] = parent[key];
                  }
                  function ctor() {
                    this.constructor = child;
                  }
                  ctor.prototype = parent.prototype;
                  child.prototype = new ctor();
                  child.__super__ = parent.prototype;
                  return child;
                }, hasProp = {}.hasOwnProperty;
                NodeType = require_NodeType();
                XMLNode = require_XMLNode();
                module.exports = XMLRaw = function(superClass) {
                  extend(XMLRaw2, superClass);
                  function XMLRaw2(parent, text) {
                    XMLRaw2.__super__.constructor.call(this, parent);
                    if (text == null) {
                      throw new Error("Missing raw text. " + this.debugInfo());
                    }
                    this.type = NodeType.Raw;
                    this.value = this.stringify.raw(text);
                  }
                  XMLRaw2.prototype.clone = function() {
                    return Object.create(this);
                  };
                  XMLRaw2.prototype.toString = function(options) {
                    return this.options.writer.raw(this, this.options.writer.filterOptions(options));
                  };
                  return XMLRaw2;
                }(XMLNode);
              }).call(exports);
            }
          });
          var require_XMLText = __commonJS({
            "node_modules/.pnpm/xmlbuilder@11.0.1/node_modules/xmlbuilder/lib/XMLText.js"(exports, module) {
              (function() {
                var NodeType, XMLCharacterData, XMLText, extend = function(child, parent) {
                  for (var key in parent) {
                    if (hasProp.call(parent, key))
                      child[key] = parent[key];
                  }
                  function ctor() {
                    this.constructor = child;
                  }
                  ctor.prototype = parent.prototype;
                  child.prototype = new ctor();
                  child.__super__ = parent.prototype;
                  return child;
                }, hasProp = {}.hasOwnProperty;
                NodeType = require_NodeType();
                XMLCharacterData = require_XMLCharacterData();
                module.exports = XMLText = function(superClass) {
                  extend(XMLText2, superClass);
                  function XMLText2(parent, text) {
                    XMLText2.__super__.constructor.call(this, parent);
                    if (text == null) {
                      throw new Error("Missing element text. " + this.debugInfo());
                    }
                    this.name = "#text";
                    this.type = NodeType.Text;
                    this.value = this.stringify.text(text);
                  }
                  Object.defineProperty(XMLText2.prototype, "isElementContentWhitespace", {
                    get: function() {
                      throw new Error("This DOM method is not implemented." + this.debugInfo());
                    }
                  });
                  Object.defineProperty(XMLText2.prototype, "wholeText", {
                    get: function() {
                      var next, prev, str;
                      str = "";
                      prev = this.previousSibling;
                      while (prev) {
                        str = prev.data + str;
                        prev = prev.previousSibling;
                      }
                      str += this.data;
                      next = this.nextSibling;
                      while (next) {
                        str = str + next.data;
                        next = next.nextSibling;
                      }
                      return str;
                    }
                  });
                  XMLText2.prototype.clone = function() {
                    return Object.create(this);
                  };
                  XMLText2.prototype.toString = function(options) {
                    return this.options.writer.text(this, this.options.writer.filterOptions(options));
                  };
                  XMLText2.prototype.splitText = function(offset) {
                    throw new Error("This DOM method is not implemented." + this.debugInfo());
                  };
                  XMLText2.prototype.replaceWholeText = function(content) {
                    throw new Error("This DOM method is not implemented." + this.debugInfo());
                  };
                  return XMLText2;
                }(XMLCharacterData);
              }).call(exports);
            }
          });
          var require_XMLProcessingInstruction = __commonJS({
            "node_modules/.pnpm/xmlbuilder@11.0.1/node_modules/xmlbuilder/lib/XMLProcessingInstruction.js"(exports, module) {
              (function() {
                var NodeType, XMLCharacterData, XMLProcessingInstruction, extend = function(child, parent) {
                  for (var key in parent) {
                    if (hasProp.call(parent, key))
                      child[key] = parent[key];
                  }
                  function ctor() {
                    this.constructor = child;
                  }
                  ctor.prototype = parent.prototype;
                  child.prototype = new ctor();
                  child.__super__ = parent.prototype;
                  return child;
                }, hasProp = {}.hasOwnProperty;
                NodeType = require_NodeType();
                XMLCharacterData = require_XMLCharacterData();
                module.exports = XMLProcessingInstruction = function(superClass) {
                  extend(XMLProcessingInstruction2, superClass);
                  function XMLProcessingInstruction2(parent, target, value) {
                    XMLProcessingInstruction2.__super__.constructor.call(this, parent);
                    if (target == null) {
                      throw new Error("Missing instruction target. " + this.debugInfo());
                    }
                    this.type = NodeType.ProcessingInstruction;
                    this.target = this.stringify.insTarget(target);
                    this.name = this.target;
                    if (value) {
                      this.value = this.stringify.insValue(value);
                    }
                  }
                  XMLProcessingInstruction2.prototype.clone = function() {
                    return Object.create(this);
                  };
                  XMLProcessingInstruction2.prototype.toString = function(options) {
                    return this.options.writer.processingInstruction(this, this.options.writer.filterOptions(options));
                  };
                  XMLProcessingInstruction2.prototype.isEqualNode = function(node) {
                    if (!XMLProcessingInstruction2.__super__.isEqualNode.apply(this, arguments).isEqualNode(node)) {
                      return false;
                    }
                    if (node.target !== this.target) {
                      return false;
                    }
                    return true;
                  };
                  return XMLProcessingInstruction2;
                }(XMLCharacterData);
              }).call(exports);
            }
          });
          var require_XMLDummy = __commonJS({
            "node_modules/.pnpm/xmlbuilder@11.0.1/node_modules/xmlbuilder/lib/XMLDummy.js"(exports, module) {
              (function() {
                var NodeType, XMLDummy, XMLNode, extend = function(child, parent) {
                  for (var key in parent) {
                    if (hasProp.call(parent, key))
                      child[key] = parent[key];
                  }
                  function ctor() {
                    this.constructor = child;
                  }
                  ctor.prototype = parent.prototype;
                  child.prototype = new ctor();
                  child.__super__ = parent.prototype;
                  return child;
                }, hasProp = {}.hasOwnProperty;
                XMLNode = require_XMLNode();
                NodeType = require_NodeType();
                module.exports = XMLDummy = function(superClass) {
                  extend(XMLDummy2, superClass);
                  function XMLDummy2(parent) {
                    XMLDummy2.__super__.constructor.call(this, parent);
                    this.type = NodeType.Dummy;
                  }
                  XMLDummy2.prototype.clone = function() {
                    return Object.create(this);
                  };
                  XMLDummy2.prototype.toString = function(options) {
                    return "";
                  };
                  return XMLDummy2;
                }(XMLNode);
              }).call(exports);
            }
          });
          var require_XMLNodeList = __commonJS({
            "node_modules/.pnpm/xmlbuilder@11.0.1/node_modules/xmlbuilder/lib/XMLNodeList.js"(exports, module) {
              (function() {
                var XMLNodeList;
                module.exports = XMLNodeList = function() {
                  function XMLNodeList2(nodes) {
                    this.nodes = nodes;
                  }
                  Object.defineProperty(XMLNodeList2.prototype, "length", {
                    get: function() {
                      return this.nodes.length || 0;
                    }
                  });
                  XMLNodeList2.prototype.clone = function() {
                    return this.nodes = null;
                  };
                  XMLNodeList2.prototype.item = function(index) {
                    return this.nodes[index] || null;
                  };
                  return XMLNodeList2;
                }();
              }).call(exports);
            }
          });
          var require_DocumentPosition = __commonJS({
            "node_modules/.pnpm/xmlbuilder@11.0.1/node_modules/xmlbuilder/lib/DocumentPosition.js"(exports, module) {
              (function() {
                module.exports = {
                  Disconnected: 1,
                  Preceding: 2,
                  Following: 4,
                  Contains: 8,
                  ContainedBy: 16,
                  ImplementationSpecific: 32
                };
              }).call(exports);
            }
          });
          var require_XMLNode = __commonJS({
            "node_modules/.pnpm/xmlbuilder@11.0.1/node_modules/xmlbuilder/lib/XMLNode.js"(exports, module) {
              (function() {
                var DocumentPosition, NodeType, XMLCData, XMLComment, XMLDeclaration, XMLDocType, XMLDummy, XMLElement, XMLNamedNodeMap, XMLNode, XMLNodeList, XMLProcessingInstruction, XMLRaw, XMLText, getValue, isEmpty, isFunction, isObject, ref1, hasProp = {}.hasOwnProperty;
                ref1 = require_Utility(), isObject = ref1.isObject, isFunction = ref1.isFunction, isEmpty = ref1.isEmpty, getValue = ref1.getValue;
                XMLElement = null;
                XMLCData = null;
                XMLComment = null;
                XMLDeclaration = null;
                XMLDocType = null;
                XMLRaw = null;
                XMLText = null;
                XMLProcessingInstruction = null;
                XMLDummy = null;
                NodeType = null;
                XMLNodeList = null;
                XMLNamedNodeMap = null;
                DocumentPosition = null;
                module.exports = XMLNode = function() {
                  function XMLNode2(parent1) {
                    this.parent = parent1;
                    if (this.parent) {
                      this.options = this.parent.options;
                      this.stringify = this.parent.stringify;
                    }
                    this.value = null;
                    this.children = [];
                    this.baseURI = null;
                    if (!XMLElement) {
                      XMLElement = require_XMLElement();
                      XMLCData = require_XMLCData();
                      XMLComment = require_XMLComment();
                      XMLDeclaration = require_XMLDeclaration();
                      XMLDocType = require_XMLDocType();
                      XMLRaw = require_XMLRaw();
                      XMLText = require_XMLText();
                      XMLProcessingInstruction = require_XMLProcessingInstruction();
                      XMLDummy = require_XMLDummy();
                      NodeType = require_NodeType();
                      XMLNodeList = require_XMLNodeList();
                      XMLNamedNodeMap = require_XMLNamedNodeMap();
                      DocumentPosition = require_DocumentPosition();
                    }
                  }
                  Object.defineProperty(XMLNode2.prototype, "nodeName", {
                    get: function() {
                      return this.name;
                    }
                  });
                  Object.defineProperty(XMLNode2.prototype, "nodeType", {
                    get: function() {
                      return this.type;
                    }
                  });
                  Object.defineProperty(XMLNode2.prototype, "nodeValue", {
                    get: function() {
                      return this.value;
                    }
                  });
                  Object.defineProperty(XMLNode2.prototype, "parentNode", {
                    get: function() {
                      return this.parent;
                    }
                  });
                  Object.defineProperty(XMLNode2.prototype, "childNodes", {
                    get: function() {
                      if (!this.childNodeList || !this.childNodeList.nodes) {
                        this.childNodeList = new XMLNodeList(this.children);
                      }
                      return this.childNodeList;
                    }
                  });
                  Object.defineProperty(XMLNode2.prototype, "firstChild", {
                    get: function() {
                      return this.children[0] || null;
                    }
                  });
                  Object.defineProperty(XMLNode2.prototype, "lastChild", {
                    get: function() {
                      return this.children[this.children.length - 1] || null;
                    }
                  });
                  Object.defineProperty(XMLNode2.prototype, "previousSibling", {
                    get: function() {
                      var i;
                      i = this.parent.children.indexOf(this);
                      return this.parent.children[i - 1] || null;
                    }
                  });
                  Object.defineProperty(XMLNode2.prototype, "nextSibling", {
                    get: function() {
                      var i;
                      i = this.parent.children.indexOf(this);
                      return this.parent.children[i + 1] || null;
                    }
                  });
                  Object.defineProperty(XMLNode2.prototype, "ownerDocument", {
                    get: function() {
                      return this.document() || null;
                    }
                  });
                  Object.defineProperty(XMLNode2.prototype, "textContent", {
                    get: function() {
                      var child, j, len, ref2, str;
                      if (this.nodeType === NodeType.Element || this.nodeType === NodeType.DocumentFragment) {
                        str = "";
                        ref2 = this.children;
                        for (j = 0, len = ref2.length; j < len; j++) {
                          child = ref2[j];
                          if (child.textContent) {
                            str += child.textContent;
                          }
                        }
                        return str;
                      } else {
                        return null;
                      }
                    },
                    set: function(value) {
                      throw new Error("This DOM method is not implemented." + this.debugInfo());
                    }
                  });
                  XMLNode2.prototype.setParent = function(parent) {
                    var child, j, len, ref2, results;
                    this.parent = parent;
                    if (parent) {
                      this.options = parent.options;
                      this.stringify = parent.stringify;
                    }
                    ref2 = this.children;
                    results = [];
                    for (j = 0, len = ref2.length; j < len; j++) {
                      child = ref2[j];
                      results.push(child.setParent(this));
                    }
                    return results;
                  };
                  XMLNode2.prototype.element = function(name, attributes, text) {
                    var childNode, item, j, k, key, lastChild, len, len1, ref2, ref3, val;
                    lastChild = null;
                    if (attributes === null && text == null) {
                      ref2 = [{}, null], attributes = ref2[0], text = ref2[1];
                    }
                    if (attributes == null) {
                      attributes = {};
                    }
                    attributes = getValue(attributes);
                    if (!isObject(attributes)) {
                      ref3 = [attributes, text], text = ref3[0], attributes = ref3[1];
                    }
                    if (name != null) {
                      name = getValue(name);
                    }
                    if (Array.isArray(name)) {
                      for (j = 0, len = name.length; j < len; j++) {
                        item = name[j];
                        lastChild = this.element(item);
                      }
                    } else if (isFunction(name)) {
                      lastChild = this.element(name.apply());
                    } else if (isObject(name)) {
                      for (key in name) {
                        if (!hasProp.call(name, key))
                          continue;
                        val = name[key];
                        if (isFunction(val)) {
                          val = val.apply();
                        }
                        if (!this.options.ignoreDecorators && this.stringify.convertAttKey && key.indexOf(this.stringify.convertAttKey) === 0) {
                          lastChild = this.attribute(key.substr(this.stringify.convertAttKey.length), val);
                        } else if (!this.options.separateArrayItems && Array.isArray(val) && isEmpty(val)) {
                          lastChild = this.dummy();
                        } else if (isObject(val) && isEmpty(val)) {
                          lastChild = this.element(key);
                        } else if (!this.options.keepNullNodes && val == null) {
                          lastChild = this.dummy();
                        } else if (!this.options.separateArrayItems && Array.isArray(val)) {
                          for (k = 0, len1 = val.length; k < len1; k++) {
                            item = val[k];
                            childNode = {};
                            childNode[key] = item;
                            lastChild = this.element(childNode);
                          }
                        } else if (isObject(val)) {
                          if (!this.options.ignoreDecorators && this.stringify.convertTextKey && key.indexOf(this.stringify.convertTextKey) === 0) {
                            lastChild = this.element(val);
                          } else {
                            lastChild = this.element(key);
                            lastChild.element(val);
                          }
                        } else {
                          lastChild = this.element(key, val);
                        }
                      }
                    } else if (!this.options.keepNullNodes && text === null) {
                      lastChild = this.dummy();
                    } else {
                      if (!this.options.ignoreDecorators && this.stringify.convertTextKey && name.indexOf(this.stringify.convertTextKey) === 0) {
                        lastChild = this.text(text);
                      } else if (!this.options.ignoreDecorators && this.stringify.convertCDataKey && name.indexOf(this.stringify.convertCDataKey) === 0) {
                        lastChild = this.cdata(text);
                      } else if (!this.options.ignoreDecorators && this.stringify.convertCommentKey && name.indexOf(this.stringify.convertCommentKey) === 0) {
                        lastChild = this.comment(text);
                      } else if (!this.options.ignoreDecorators && this.stringify.convertRawKey && name.indexOf(this.stringify.convertRawKey) === 0) {
                        lastChild = this.raw(text);
                      } else if (!this.options.ignoreDecorators && this.stringify.convertPIKey && name.indexOf(this.stringify.convertPIKey) === 0) {
                        lastChild = this.instruction(name.substr(this.stringify.convertPIKey.length), text);
                      } else {
                        lastChild = this.node(name, attributes, text);
                      }
                    }
                    if (lastChild == null) {
                      throw new Error("Could not create any elements with: " + name + ". " + this.debugInfo());
                    }
                    return lastChild;
                  };
                  XMLNode2.prototype.insertBefore = function(name, attributes, text) {
                    var child, i, newChild, refChild, removed;
                    if (name != null ? name.type : void 0) {
                      newChild = name;
                      refChild = attributes;
                      newChild.setParent(this);
                      if (refChild) {
                        i = children.indexOf(refChild);
                        removed = children.splice(i);
                        children.push(newChild);
                        Array.prototype.push.apply(children, removed);
                      } else {
                        children.push(newChild);
                      }
                      return newChild;
                    } else {
                      if (this.isRoot) {
                        throw new Error("Cannot insert elements at root level. " + this.debugInfo(name));
                      }
                      i = this.parent.children.indexOf(this);
                      removed = this.parent.children.splice(i);
                      child = this.parent.element(name, attributes, text);
                      Array.prototype.push.apply(this.parent.children, removed);
                      return child;
                    }
                  };
                  XMLNode2.prototype.insertAfter = function(name, attributes, text) {
                    var child, i, removed;
                    if (this.isRoot) {
                      throw new Error("Cannot insert elements at root level. " + this.debugInfo(name));
                    }
                    i = this.parent.children.indexOf(this);
                    removed = this.parent.children.splice(i + 1);
                    child = this.parent.element(name, attributes, text);
                    Array.prototype.push.apply(this.parent.children, removed);
                    return child;
                  };
                  XMLNode2.prototype.remove = function() {
                    var i, ref2;
                    if (this.isRoot) {
                      throw new Error("Cannot remove the root element. " + this.debugInfo());
                    }
                    i = this.parent.children.indexOf(this);
                    [].splice.apply(this.parent.children, [i, i - i + 1].concat(ref2 = [])), ref2;
                    return this.parent;
                  };
                  XMLNode2.prototype.node = function(name, attributes, text) {
                    var child, ref2;
                    if (name != null) {
                      name = getValue(name);
                    }
                    attributes || (attributes = {});
                    attributes = getValue(attributes);
                    if (!isObject(attributes)) {
                      ref2 = [attributes, text], text = ref2[0], attributes = ref2[1];
                    }
                    child = new XMLElement(this, name, attributes);
                    if (text != null) {
                      child.text(text);
                    }
                    this.children.push(child);
                    return child;
                  };
                  XMLNode2.prototype.text = function(value) {
                    var child;
                    if (isObject(value)) {
                      this.element(value);
                    }
                    child = new XMLText(this, value);
                    this.children.push(child);
                    return this;
                  };
                  XMLNode2.prototype.cdata = function(value) {
                    var child;
                    child = new XMLCData(this, value);
                    this.children.push(child);
                    return this;
                  };
                  XMLNode2.prototype.comment = function(value) {
                    var child;
                    child = new XMLComment(this, value);
                    this.children.push(child);
                    return this;
                  };
                  XMLNode2.prototype.commentBefore = function(value) {
                    var child, i, removed;
                    i = this.parent.children.indexOf(this);
                    removed = this.parent.children.splice(i);
                    child = this.parent.comment(value);
                    Array.prototype.push.apply(this.parent.children, removed);
                    return this;
                  };
                  XMLNode2.prototype.commentAfter = function(value) {
                    var child, i, removed;
                    i = this.parent.children.indexOf(this);
                    removed = this.parent.children.splice(i + 1);
                    child = this.parent.comment(value);
                    Array.prototype.push.apply(this.parent.children, removed);
                    return this;
                  };
                  XMLNode2.prototype.raw = function(value) {
                    var child;
                    child = new XMLRaw(this, value);
                    this.children.push(child);
                    return this;
                  };
                  XMLNode2.prototype.dummy = function() {
                    var child;
                    child = new XMLDummy(this);
                    return child;
                  };
                  XMLNode2.prototype.instruction = function(target, value) {
                    var insTarget, insValue, instruction, j, len;
                    if (target != null) {
                      target = getValue(target);
                    }
                    if (value != null) {
                      value = getValue(value);
                    }
                    if (Array.isArray(target)) {
                      for (j = 0, len = target.length; j < len; j++) {
                        insTarget = target[j];
                        this.instruction(insTarget);
                      }
                    } else if (isObject(target)) {
                      for (insTarget in target) {
                        if (!hasProp.call(target, insTarget))
                          continue;
                        insValue = target[insTarget];
                        this.instruction(insTarget, insValue);
                      }
                    } else {
                      if (isFunction(value)) {
                        value = value.apply();
                      }
                      instruction = new XMLProcessingInstruction(this, target, value);
                      this.children.push(instruction);
                    }
                    return this;
                  };
                  XMLNode2.prototype.instructionBefore = function(target, value) {
                    var child, i, removed;
                    i = this.parent.children.indexOf(this);
                    removed = this.parent.children.splice(i);
                    child = this.parent.instruction(target, value);
                    Array.prototype.push.apply(this.parent.children, removed);
                    return this;
                  };
                  XMLNode2.prototype.instructionAfter = function(target, value) {
                    var child, i, removed;
                    i = this.parent.children.indexOf(this);
                    removed = this.parent.children.splice(i + 1);
                    child = this.parent.instruction(target, value);
                    Array.prototype.push.apply(this.parent.children, removed);
                    return this;
                  };
                  XMLNode2.prototype.declaration = function(version, encoding, standalone) {
                    var doc, xmldec;
                    doc = this.document();
                    xmldec = new XMLDeclaration(doc, version, encoding, standalone);
                    if (doc.children.length === 0) {
                      doc.children.unshift(xmldec);
                    } else if (doc.children[0].type === NodeType.Declaration) {
                      doc.children[0] = xmldec;
                    } else {
                      doc.children.unshift(xmldec);
                    }
                    return doc.root() || doc;
                  };
                  XMLNode2.prototype.dtd = function(pubID, sysID) {
                    var child, doc, doctype, i, j, k, len, len1, ref2, ref3;
                    doc = this.document();
                    doctype = new XMLDocType(doc, pubID, sysID);
                    ref2 = doc.children;
                    for (i = j = 0, len = ref2.length; j < len; i = ++j) {
                      child = ref2[i];
                      if (child.type === NodeType.DocType) {
                        doc.children[i] = doctype;
                        return doctype;
                      }
                    }
                    ref3 = doc.children;
                    for (i = k = 0, len1 = ref3.length; k < len1; i = ++k) {
                      child = ref3[i];
                      if (child.isRoot) {
                        doc.children.splice(i, 0, doctype);
                        return doctype;
                      }
                    }
                    doc.children.push(doctype);
                    return doctype;
                  };
                  XMLNode2.prototype.up = function() {
                    if (this.isRoot) {
                      throw new Error("The root node has no parent. Use doc() if you need to get the document object.");
                    }
                    return this.parent;
                  };
                  XMLNode2.prototype.root = function() {
                    var node;
                    node = this;
                    while (node) {
                      if (node.type === NodeType.Document) {
                        return node.rootObject;
                      } else if (node.isRoot) {
                        return node;
                      } else {
                        node = node.parent;
                      }
                    }
                  };
                  XMLNode2.prototype.document = function() {
                    var node;
                    node = this;
                    while (node) {
                      if (node.type === NodeType.Document) {
                        return node;
                      } else {
                        node = node.parent;
                      }
                    }
                  };
                  XMLNode2.prototype.end = function(options) {
                    return this.document().end(options);
                  };
                  XMLNode2.prototype.prev = function() {
                    var i;
                    i = this.parent.children.indexOf(this);
                    if (i < 1) {
                      throw new Error("Already at the first node. " + this.debugInfo());
                    }
                    return this.parent.children[i - 1];
                  };
                  XMLNode2.prototype.next = function() {
                    var i;
                    i = this.parent.children.indexOf(this);
                    if (i === -1 || i === this.parent.children.length - 1) {
                      throw new Error("Already at the last node. " + this.debugInfo());
                    }
                    return this.parent.children[i + 1];
                  };
                  XMLNode2.prototype.importDocument = function(doc) {
                    var clonedRoot;
                    clonedRoot = doc.root().clone();
                    clonedRoot.parent = this;
                    clonedRoot.isRoot = false;
                    this.children.push(clonedRoot);
                    return this;
                  };
                  XMLNode2.prototype.debugInfo = function(name) {
                    var ref2, ref3;
                    name = name || this.name;
                    if (name == null && !((ref2 = this.parent) != null ? ref2.name : void 0)) {
                      return "";
                    } else if (name == null) {
                      return "parent: <" + this.parent.name + ">";
                    } else if (!((ref3 = this.parent) != null ? ref3.name : void 0)) {
                      return "node: <" + name + ">";
                    } else {
                      return "node: <" + name + ">, parent: <" + this.parent.name + ">";
                    }
                  };
                  XMLNode2.prototype.ele = function(name, attributes, text) {
                    return this.element(name, attributes, text);
                  };
                  XMLNode2.prototype.nod = function(name, attributes, text) {
                    return this.node(name, attributes, text);
                  };
                  XMLNode2.prototype.txt = function(value) {
                    return this.text(value);
                  };
                  XMLNode2.prototype.dat = function(value) {
                    return this.cdata(value);
                  };
                  XMLNode2.prototype.com = function(value) {
                    return this.comment(value);
                  };
                  XMLNode2.prototype.ins = function(target, value) {
                    return this.instruction(target, value);
                  };
                  XMLNode2.prototype.doc = function() {
                    return this.document();
                  };
                  XMLNode2.prototype.dec = function(version, encoding, standalone) {
                    return this.declaration(version, encoding, standalone);
                  };
                  XMLNode2.prototype.e = function(name, attributes, text) {
                    return this.element(name, attributes, text);
                  };
                  XMLNode2.prototype.n = function(name, attributes, text) {
                    return this.node(name, attributes, text);
                  };
                  XMLNode2.prototype.t = function(value) {
                    return this.text(value);
                  };
                  XMLNode2.prototype.d = function(value) {
                    return this.cdata(value);
                  };
                  XMLNode2.prototype.c = function(value) {
                    return this.comment(value);
                  };
                  XMLNode2.prototype.r = function(value) {
                    return this.raw(value);
                  };
                  XMLNode2.prototype.i = function(target, value) {
                    return this.instruction(target, value);
                  };
                  XMLNode2.prototype.u = function() {
                    return this.up();
                  };
                  XMLNode2.prototype.importXMLBuilder = function(doc) {
                    return this.importDocument(doc);
                  };
                  XMLNode2.prototype.replaceChild = function(newChild, oldChild) {
                    throw new Error("This DOM method is not implemented." + this.debugInfo());
                  };
                  XMLNode2.prototype.removeChild = function(oldChild) {
                    throw new Error("This DOM method is not implemented." + this.debugInfo());
                  };
                  XMLNode2.prototype.appendChild = function(newChild) {
                    throw new Error("This DOM method is not implemented." + this.debugInfo());
                  };
                  XMLNode2.prototype.hasChildNodes = function() {
                    return this.children.length !== 0;
                  };
                  XMLNode2.prototype.cloneNode = function(deep) {
                    throw new Error("This DOM method is not implemented." + this.debugInfo());
                  };
                  XMLNode2.prototype.normalize = function() {
                    throw new Error("This DOM method is not implemented." + this.debugInfo());
                  };
                  XMLNode2.prototype.isSupported = function(feature, version) {
                    return true;
                  };
                  XMLNode2.prototype.hasAttributes = function() {
                    return this.attribs.length !== 0;
                  };
                  XMLNode2.prototype.compareDocumentPosition = function(other) {
                    var ref, res2;
                    ref = this;
                    if (ref === other) {
                      return 0;
                    } else if (this.document() !== other.document()) {
                      res2 = DocumentPosition.Disconnected | DocumentPosition.ImplementationSpecific;
                      if (Math.random() < 0.5) {
                        res2 |= DocumentPosition.Preceding;
                      } else {
                        res2 |= DocumentPosition.Following;
                      }
                      return res2;
                    } else if (ref.isAncestor(other)) {
                      return DocumentPosition.Contains | DocumentPosition.Preceding;
                    } else if (ref.isDescendant(other)) {
                      return DocumentPosition.Contains | DocumentPosition.Following;
                    } else if (ref.isPreceding(other)) {
                      return DocumentPosition.Preceding;
                    } else {
                      return DocumentPosition.Following;
                    }
                  };
                  XMLNode2.prototype.isSameNode = function(other) {
                    throw new Error("This DOM method is not implemented." + this.debugInfo());
                  };
                  XMLNode2.prototype.lookupPrefix = function(namespaceURI) {
                    throw new Error("This DOM method is not implemented." + this.debugInfo());
                  };
                  XMLNode2.prototype.isDefaultNamespace = function(namespaceURI) {
                    throw new Error("This DOM method is not implemented." + this.debugInfo());
                  };
                  XMLNode2.prototype.lookupNamespaceURI = function(prefix) {
                    throw new Error("This DOM method is not implemented." + this.debugInfo());
                  };
                  XMLNode2.prototype.isEqualNode = function(node) {
                    var i, j, ref2;
                    if (node.nodeType !== this.nodeType) {
                      return false;
                    }
                    if (node.children.length !== this.children.length) {
                      return false;
                    }
                    for (i = j = 0, ref2 = this.children.length - 1; 0 <= ref2 ? j <= ref2 : j >= ref2; i = 0 <= ref2 ? ++j : --j) {
                      if (!this.children[i].isEqualNode(node.children[i])) {
                        return false;
                      }
                    }
                    return true;
                  };
                  XMLNode2.prototype.getFeature = function(feature, version) {
                    throw new Error("This DOM method is not implemented." + this.debugInfo());
                  };
                  XMLNode2.prototype.setUserData = function(key, data, handler) {
                    throw new Error("This DOM method is not implemented." + this.debugInfo());
                  };
                  XMLNode2.prototype.getUserData = function(key) {
                    throw new Error("This DOM method is not implemented." + this.debugInfo());
                  };
                  XMLNode2.prototype.contains = function(other) {
                    if (!other) {
                      return false;
                    }
                    return other === this || this.isDescendant(other);
                  };
                  XMLNode2.prototype.isDescendant = function(node) {
                    var child, isDescendantChild, j, len, ref2;
                    ref2 = this.children;
                    for (j = 0, len = ref2.length; j < len; j++) {
                      child = ref2[j];
                      if (node === child) {
                        return true;
                      }
                      isDescendantChild = child.isDescendant(node);
                      if (isDescendantChild) {
                        return true;
                      }
                    }
                    return false;
                  };
                  XMLNode2.prototype.isAncestor = function(node) {
                    return node.isDescendant(this);
                  };
                  XMLNode2.prototype.isPreceding = function(node) {
                    var nodePos, thisPos;
                    nodePos = this.treePosition(node);
                    thisPos = this.treePosition(this);
                    if (nodePos === -1 || thisPos === -1) {
                      return false;
                    } else {
                      return nodePos < thisPos;
                    }
                  };
                  XMLNode2.prototype.isFollowing = function(node) {
                    var nodePos, thisPos;
                    nodePos = this.treePosition(node);
                    thisPos = this.treePosition(this);
                    if (nodePos === -1 || thisPos === -1) {
                      return false;
                    } else {
                      return nodePos > thisPos;
                    }
                  };
                  XMLNode2.prototype.treePosition = function(node) {
                    var found, pos;
                    pos = 0;
                    found = false;
                    this.foreachTreeNode(this.document(), function(childNode) {
                      pos++;
                      if (!found && childNode === node) {
                        return found = true;
                      }
                    });
                    if (found) {
                      return pos;
                    } else {
                      return -1;
                    }
                  };
                  XMLNode2.prototype.foreachTreeNode = function(node, func) {
                    var child, j, len, ref2, res2;
                    node || (node = this.document());
                    ref2 = node.children;
                    for (j = 0, len = ref2.length; j < len; j++) {
                      child = ref2[j];
                      if (res2 = func(child)) {
                        return res2;
                      } else {
                        res2 = this.foreachTreeNode(child, func);
                        if (res2) {
                          return res2;
                        }
                      }
                    }
                  };
                  return XMLNode2;
                }();
              }).call(exports);
            }
          });
          var require_XMLStringifier = __commonJS({
            "node_modules/.pnpm/xmlbuilder@11.0.1/node_modules/xmlbuilder/lib/XMLStringifier.js"(exports, module) {
              (function() {
                var XMLStringifier, bind = function(fn, me) {
                  return function() {
                    return fn.apply(me, arguments);
                  };
                }, hasProp = {}.hasOwnProperty;
                module.exports = XMLStringifier = function() {
                  function XMLStringifier2(options) {
                    this.assertLegalName = bind(this.assertLegalName, this);
                    this.assertLegalChar = bind(this.assertLegalChar, this);
                    var key, ref, value;
                    options || (options = {});
                    this.options = options;
                    if (!this.options.version) {
                      this.options.version = "1.0";
                    }
                    ref = options.stringify || {};
                    for (key in ref) {
                      if (!hasProp.call(ref, key))
                        continue;
                      value = ref[key];
                      this[key] = value;
                    }
                  }
                  XMLStringifier2.prototype.name = function(val) {
                    if (this.options.noValidation) {
                      return val;
                    }
                    return this.assertLegalName("" + val || "");
                  };
                  XMLStringifier2.prototype.text = function(val) {
                    if (this.options.noValidation) {
                      return val;
                    }
                    return this.assertLegalChar(this.textEscape("" + val || ""));
                  };
                  XMLStringifier2.prototype.cdata = function(val) {
                    if (this.options.noValidation) {
                      return val;
                    }
                    val = "" + val || "";
                    val = val.replace("]]>", "]]]]><![CDATA[>");
                    return this.assertLegalChar(val);
                  };
                  XMLStringifier2.prototype.comment = function(val) {
                    if (this.options.noValidation) {
                      return val;
                    }
                    val = "" + val || "";
                    if (val.match(/--/)) {
                      throw new Error("Comment text cannot contain double-hypen: " + val);
                    }
                    return this.assertLegalChar(val);
                  };
                  XMLStringifier2.prototype.raw = function(val) {
                    if (this.options.noValidation) {
                      return val;
                    }
                    return "" + val || "";
                  };
                  XMLStringifier2.prototype.attValue = function(val) {
                    if (this.options.noValidation) {
                      return val;
                    }
                    return this.assertLegalChar(this.attEscape(val = "" + val || ""));
                  };
                  XMLStringifier2.prototype.insTarget = function(val) {
                    if (this.options.noValidation) {
                      return val;
                    }
                    return this.assertLegalChar("" + val || "");
                  };
                  XMLStringifier2.prototype.insValue = function(val) {
                    if (this.options.noValidation) {
                      return val;
                    }
                    val = "" + val || "";
                    if (val.match(/\?>/)) {
                      throw new Error("Invalid processing instruction value: " + val);
                    }
                    return this.assertLegalChar(val);
                  };
                  XMLStringifier2.prototype.xmlVersion = function(val) {
                    if (this.options.noValidation) {
                      return val;
                    }
                    val = "" + val || "";
                    if (!val.match(/1\.[0-9]+/)) {
                      throw new Error("Invalid version number: " + val);
                    }
                    return val;
                  };
                  XMLStringifier2.prototype.xmlEncoding = function(val) {
                    if (this.options.noValidation) {
                      return val;
                    }
                    val = "" + val || "";
                    if (!val.match(/^[A-Za-z](?:[A-Za-z0-9._-])*$/)) {
                      throw new Error("Invalid encoding: " + val);
                    }
                    return this.assertLegalChar(val);
                  };
                  XMLStringifier2.prototype.xmlStandalone = function(val) {
                    if (this.options.noValidation) {
                      return val;
                    }
                    if (val) {
                      return "yes";
                    } else {
                      return "no";
                    }
                  };
                  XMLStringifier2.prototype.dtdPubID = function(val) {
                    if (this.options.noValidation) {
                      return val;
                    }
                    return this.assertLegalChar("" + val || "");
                  };
                  XMLStringifier2.prototype.dtdSysID = function(val) {
                    if (this.options.noValidation) {
                      return val;
                    }
                    return this.assertLegalChar("" + val || "");
                  };
                  XMLStringifier2.prototype.dtdElementValue = function(val) {
                    if (this.options.noValidation) {
                      return val;
                    }
                    return this.assertLegalChar("" + val || "");
                  };
                  XMLStringifier2.prototype.dtdAttType = function(val) {
                    if (this.options.noValidation) {
                      return val;
                    }
                    return this.assertLegalChar("" + val || "");
                  };
                  XMLStringifier2.prototype.dtdAttDefault = function(val) {
                    if (this.options.noValidation) {
                      return val;
                    }
                    return this.assertLegalChar("" + val || "");
                  };
                  XMLStringifier2.prototype.dtdEntityValue = function(val) {
                    if (this.options.noValidation) {
                      return val;
                    }
                    return this.assertLegalChar("" + val || "");
                  };
                  XMLStringifier2.prototype.dtdNData = function(val) {
                    if (this.options.noValidation) {
                      return val;
                    }
                    return this.assertLegalChar("" + val || "");
                  };
                  XMLStringifier2.prototype.convertAttKey = "@";
                  XMLStringifier2.prototype.convertPIKey = "?";
                  XMLStringifier2.prototype.convertTextKey = "#text";
                  XMLStringifier2.prototype.convertCDataKey = "#cdata";
                  XMLStringifier2.prototype.convertCommentKey = "#comment";
                  XMLStringifier2.prototype.convertRawKey = "#raw";
                  XMLStringifier2.prototype.assertLegalChar = function(str) {
                    var regex, res2;
                    if (this.options.noValidation) {
                      return str;
                    }
                    regex = "";
                    if (this.options.version === "1.0") {
                      regex = /[\0-\x08\x0B\f\x0E-\x1F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
                      if (res2 = str.match(regex)) {
                        throw new Error("Invalid character in string: " + str + " at index " + res2.index);
                      }
                    } else if (this.options.version === "1.1") {
                      regex = /[\0\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
                      if (res2 = str.match(regex)) {
                        throw new Error("Invalid character in string: " + str + " at index " + res2.index);
                      }
                    }
                    return str;
                  };
                  XMLStringifier2.prototype.assertLegalName = function(str) {
                    var regex;
                    if (this.options.noValidation) {
                      return str;
                    }
                    this.assertLegalChar(str);
                    regex = /^([:A-Z_a-z\xC0-\xD6\xD8-\xF6\xF8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])([\x2D\.0-:A-Z_a-z\xB7\xC0-\xD6\xD8-\xF6\xF8-\u037D\u037F-\u1FFF\u200C\u200D\u203F\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])*$/;
                    if (!str.match(regex)) {
                      throw new Error("Invalid character in name");
                    }
                    return str;
                  };
                  XMLStringifier2.prototype.textEscape = function(str) {
                    var ampregex;
                    if (this.options.noValidation) {
                      return str;
                    }
                    ampregex = this.options.noDoubleEncoding ? /(?!&\S+;)&/g : /&/g;
                    return str.replace(ampregex, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\r/g, "&#xD;");
                  };
                  XMLStringifier2.prototype.attEscape = function(str) {
                    var ampregex;
                    if (this.options.noValidation) {
                      return str;
                    }
                    ampregex = this.options.noDoubleEncoding ? /(?!&\S+;)&/g : /&/g;
                    return str.replace(ampregex, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;").replace(/\t/g, "&#x9;").replace(/\n/g, "&#xA;").replace(/\r/g, "&#xD;");
                  };
                  return XMLStringifier2;
                }();
              }).call(exports);
            }
          });
          var require_WriterState = __commonJS({
            "node_modules/.pnpm/xmlbuilder@11.0.1/node_modules/xmlbuilder/lib/WriterState.js"(exports, module) {
              (function() {
                module.exports = {
                  None: 0,
                  OpenTag: 1,
                  InsideTag: 2,
                  CloseTag: 3
                };
              }).call(exports);
            }
          });
          var require_XMLWriterBase = __commonJS({
            "node_modules/.pnpm/xmlbuilder@11.0.1/node_modules/xmlbuilder/lib/XMLWriterBase.js"(exports, module) {
              (function() {
                var NodeType, WriterState, XMLCData, XMLComment, XMLDTDAttList, XMLDTDElement, XMLDTDEntity, XMLDTDNotation, XMLDeclaration, XMLDocType, XMLDummy, XMLElement, XMLProcessingInstruction, XMLRaw, XMLText, XMLWriterBase, assign, hasProp = {}.hasOwnProperty;
                assign = require_Utility().assign;
                NodeType = require_NodeType();
                XMLDeclaration = require_XMLDeclaration();
                XMLDocType = require_XMLDocType();
                XMLCData = require_XMLCData();
                XMLComment = require_XMLComment();
                XMLElement = require_XMLElement();
                XMLRaw = require_XMLRaw();
                XMLText = require_XMLText();
                XMLProcessingInstruction = require_XMLProcessingInstruction();
                XMLDummy = require_XMLDummy();
                XMLDTDAttList = require_XMLDTDAttList();
                XMLDTDElement = require_XMLDTDElement();
                XMLDTDEntity = require_XMLDTDEntity();
                XMLDTDNotation = require_XMLDTDNotation();
                WriterState = require_WriterState();
                module.exports = XMLWriterBase = function() {
                  function XMLWriterBase2(options) {
                    var key, ref, value;
                    options || (options = {});
                    this.options = options;
                    ref = options.writer || {};
                    for (key in ref) {
                      if (!hasProp.call(ref, key))
                        continue;
                      value = ref[key];
                      this["_" + key] = this[key];
                      this[key] = value;
                    }
                  }
                  XMLWriterBase2.prototype.filterOptions = function(options) {
                    var filteredOptions, ref, ref1, ref2, ref3, ref4, ref5, ref6;
                    options || (options = {});
                    options = assign({}, this.options, options);
                    filteredOptions = {
                      writer: this
                    };
                    filteredOptions.pretty = options.pretty || false;
                    filteredOptions.allowEmpty = options.allowEmpty || false;
                    filteredOptions.indent = (ref = options.indent) != null ? ref : "  ";
                    filteredOptions.newline = (ref1 = options.newline) != null ? ref1 : "\n";
                    filteredOptions.offset = (ref2 = options.offset) != null ? ref2 : 0;
                    filteredOptions.dontPrettyTextNodes = (ref3 = (ref4 = options.dontPrettyTextNodes) != null ? ref4 : options.dontprettytextnodes) != null ? ref3 : 0;
                    filteredOptions.spaceBeforeSlash = (ref5 = (ref6 = options.spaceBeforeSlash) != null ? ref6 : options.spacebeforeslash) != null ? ref5 : "";
                    if (filteredOptions.spaceBeforeSlash === true) {
                      filteredOptions.spaceBeforeSlash = " ";
                    }
                    filteredOptions.suppressPrettyCount = 0;
                    filteredOptions.user = {};
                    filteredOptions.state = WriterState.None;
                    return filteredOptions;
                  };
                  XMLWriterBase2.prototype.indent = function(node, options, level) {
                    var indentLevel;
                    if (!options.pretty || options.suppressPrettyCount) {
                      return "";
                    } else if (options.pretty) {
                      indentLevel = (level || 0) + options.offset + 1;
                      if (indentLevel > 0) {
                        return new Array(indentLevel).join(options.indent);
                      }
                    }
                    return "";
                  };
                  XMLWriterBase2.prototype.endline = function(node, options, level) {
                    if (!options.pretty || options.suppressPrettyCount) {
                      return "";
                    } else {
                      return options.newline;
                    }
                  };
                  XMLWriterBase2.prototype.attribute = function(att, options, level) {
                    var r;
                    this.openAttribute(att, options, level);
                    r = " " + att.name + '="' + att.value + '"';
                    this.closeAttribute(att, options, level);
                    return r;
                  };
                  XMLWriterBase2.prototype.cdata = function(node, options, level) {
                    var r;
                    this.openNode(node, options, level);
                    options.state = WriterState.OpenTag;
                    r = this.indent(node, options, level) + "<![CDATA[";
                    options.state = WriterState.InsideTag;
                    r += node.value;
                    options.state = WriterState.CloseTag;
                    r += "]]>" + this.endline(node, options, level);
                    options.state = WriterState.None;
                    this.closeNode(node, options, level);
                    return r;
                  };
                  XMLWriterBase2.prototype.comment = function(node, options, level) {
                    var r;
                    this.openNode(node, options, level);
                    options.state = WriterState.OpenTag;
                    r = this.indent(node, options, level) + "<!-- ";
                    options.state = WriterState.InsideTag;
                    r += node.value;
                    options.state = WriterState.CloseTag;
                    r += " -->" + this.endline(node, options, level);
                    options.state = WriterState.None;
                    this.closeNode(node, options, level);
                    return r;
                  };
                  XMLWriterBase2.prototype.declaration = function(node, options, level) {
                    var r;
                    this.openNode(node, options, level);
                    options.state = WriterState.OpenTag;
                    r = this.indent(node, options, level) + "<?xml";
                    options.state = WriterState.InsideTag;
                    r += ' version="' + node.version + '"';
                    if (node.encoding != null) {
                      r += ' encoding="' + node.encoding + '"';
                    }
                    if (node.standalone != null) {
                      r += ' standalone="' + node.standalone + '"';
                    }
                    options.state = WriterState.CloseTag;
                    r += options.spaceBeforeSlash + "?>";
                    r += this.endline(node, options, level);
                    options.state = WriterState.None;
                    this.closeNode(node, options, level);
                    return r;
                  };
                  XMLWriterBase2.prototype.docType = function(node, options, level) {
                    var child, i, len, r, ref;
                    level || (level = 0);
                    this.openNode(node, options, level);
                    options.state = WriterState.OpenTag;
                    r = this.indent(node, options, level);
                    r += "<!DOCTYPE " + node.root().name;
                    if (node.pubID && node.sysID) {
                      r += ' PUBLIC "' + node.pubID + '" "' + node.sysID + '"';
                    } else if (node.sysID) {
                      r += ' SYSTEM "' + node.sysID + '"';
                    }
                    if (node.children.length > 0) {
                      r += " [";
                      r += this.endline(node, options, level);
                      options.state = WriterState.InsideTag;
                      ref = node.children;
                      for (i = 0, len = ref.length; i < len; i++) {
                        child = ref[i];
                        r += this.writeChildNode(child, options, level + 1);
                      }
                      options.state = WriterState.CloseTag;
                      r += "]";
                    }
                    options.state = WriterState.CloseTag;
                    r += options.spaceBeforeSlash + ">";
                    r += this.endline(node, options, level);
                    options.state = WriterState.None;
                    this.closeNode(node, options, level);
                    return r;
                  };
                  XMLWriterBase2.prototype.element = function(node, options, level) {
                    var att, child, childNodeCount, firstChildNode, i, j, len, len1, name, prettySuppressed, r, ref, ref1, ref2;
                    level || (level = 0);
                    prettySuppressed = false;
                    r = "";
                    this.openNode(node, options, level);
                    options.state = WriterState.OpenTag;
                    r += this.indent(node, options, level) + "<" + node.name;
                    ref = node.attribs;
                    for (name in ref) {
                      if (!hasProp.call(ref, name))
                        continue;
                      att = ref[name];
                      r += this.attribute(att, options, level);
                    }
                    childNodeCount = node.children.length;
                    firstChildNode = childNodeCount === 0 ? null : node.children[0];
                    if (childNodeCount === 0 || node.children.every(function(e) {
                      return (e.type === NodeType.Text || e.type === NodeType.Raw) && e.value === "";
                    })) {
                      if (options.allowEmpty) {
                        r += ">";
                        options.state = WriterState.CloseTag;
                        r += "</" + node.name + ">" + this.endline(node, options, level);
                      } else {
                        options.state = WriterState.CloseTag;
                        r += options.spaceBeforeSlash + "/>" + this.endline(node, options, level);
                      }
                    } else if (options.pretty && childNodeCount === 1 && (firstChildNode.type === NodeType.Text || firstChildNode.type === NodeType.Raw) && firstChildNode.value != null) {
                      r += ">";
                      options.state = WriterState.InsideTag;
                      options.suppressPrettyCount++;
                      prettySuppressed = true;
                      r += this.writeChildNode(firstChildNode, options, level + 1);
                      options.suppressPrettyCount--;
                      prettySuppressed = false;
                      options.state = WriterState.CloseTag;
                      r += "</" + node.name + ">" + this.endline(node, options, level);
                    } else {
                      if (options.dontPrettyTextNodes) {
                        ref1 = node.children;
                        for (i = 0, len = ref1.length; i < len; i++) {
                          child = ref1[i];
                          if ((child.type === NodeType.Text || child.type === NodeType.Raw) && child.value != null) {
                            options.suppressPrettyCount++;
                            prettySuppressed = true;
                            break;
                          }
                        }
                      }
                      r += ">" + this.endline(node, options, level);
                      options.state = WriterState.InsideTag;
                      ref2 = node.children;
                      for (j = 0, len1 = ref2.length; j < len1; j++) {
                        child = ref2[j];
                        r += this.writeChildNode(child, options, level + 1);
                      }
                      options.state = WriterState.CloseTag;
                      r += this.indent(node, options, level) + "</" + node.name + ">";
                      if (prettySuppressed) {
                        options.suppressPrettyCount--;
                      }
                      r += this.endline(node, options, level);
                      options.state = WriterState.None;
                    }
                    this.closeNode(node, options, level);
                    return r;
                  };
                  XMLWriterBase2.prototype.writeChildNode = function(node, options, level) {
                    switch (node.type) {
                      case NodeType.CData:
                        return this.cdata(node, options, level);
                      case NodeType.Comment:
                        return this.comment(node, options, level);
                      case NodeType.Element:
                        return this.element(node, options, level);
                      case NodeType.Raw:
                        return this.raw(node, options, level);
                      case NodeType.Text:
                        return this.text(node, options, level);
                      case NodeType.ProcessingInstruction:
                        return this.processingInstruction(node, options, level);
                      case NodeType.Dummy:
                        return "";
                      case NodeType.Declaration:
                        return this.declaration(node, options, level);
                      case NodeType.DocType:
                        return this.docType(node, options, level);
                      case NodeType.AttributeDeclaration:
                        return this.dtdAttList(node, options, level);
                      case NodeType.ElementDeclaration:
                        return this.dtdElement(node, options, level);
                      case NodeType.EntityDeclaration:
                        return this.dtdEntity(node, options, level);
                      case NodeType.NotationDeclaration:
                        return this.dtdNotation(node, options, level);
                      default:
                        throw new Error("Unknown XML node type: " + node.constructor.name);
                    }
                  };
                  XMLWriterBase2.prototype.processingInstruction = function(node, options, level) {
                    var r;
                    this.openNode(node, options, level);
                    options.state = WriterState.OpenTag;
                    r = this.indent(node, options, level) + "<?";
                    options.state = WriterState.InsideTag;
                    r += node.target;
                    if (node.value) {
                      r += " " + node.value;
                    }
                    options.state = WriterState.CloseTag;
                    r += options.spaceBeforeSlash + "?>";
                    r += this.endline(node, options, level);
                    options.state = WriterState.None;
                    this.closeNode(node, options, level);
                    return r;
                  };
                  XMLWriterBase2.prototype.raw = function(node, options, level) {
                    var r;
                    this.openNode(node, options, level);
                    options.state = WriterState.OpenTag;
                    r = this.indent(node, options, level);
                    options.state = WriterState.InsideTag;
                    r += node.value;
                    options.state = WriterState.CloseTag;
                    r += this.endline(node, options, level);
                    options.state = WriterState.None;
                    this.closeNode(node, options, level);
                    return r;
                  };
                  XMLWriterBase2.prototype.text = function(node, options, level) {
                    var r;
                    this.openNode(node, options, level);
                    options.state = WriterState.OpenTag;
                    r = this.indent(node, options, level);
                    options.state = WriterState.InsideTag;
                    r += node.value;
                    options.state = WriterState.CloseTag;
                    r += this.endline(node, options, level);
                    options.state = WriterState.None;
                    this.closeNode(node, options, level);
                    return r;
                  };
                  XMLWriterBase2.prototype.dtdAttList = function(node, options, level) {
                    var r;
                    this.openNode(node, options, level);
                    options.state = WriterState.OpenTag;
                    r = this.indent(node, options, level) + "<!ATTLIST";
                    options.state = WriterState.InsideTag;
                    r += " " + node.elementName + " " + node.attributeName + " " + node.attributeType;
                    if (node.defaultValueType !== "#DEFAULT") {
                      r += " " + node.defaultValueType;
                    }
                    if (node.defaultValue) {
                      r += ' "' + node.defaultValue + '"';
                    }
                    options.state = WriterState.CloseTag;
                    r += options.spaceBeforeSlash + ">" + this.endline(node, options, level);
                    options.state = WriterState.None;
                    this.closeNode(node, options, level);
                    return r;
                  };
                  XMLWriterBase2.prototype.dtdElement = function(node, options, level) {
                    var r;
                    this.openNode(node, options, level);
                    options.state = WriterState.OpenTag;
                    r = this.indent(node, options, level) + "<!ELEMENT";
                    options.state = WriterState.InsideTag;
                    r += " " + node.name + " " + node.value;
                    options.state = WriterState.CloseTag;
                    r += options.spaceBeforeSlash + ">" + this.endline(node, options, level);
                    options.state = WriterState.None;
                    this.closeNode(node, options, level);
                    return r;
                  };
                  XMLWriterBase2.prototype.dtdEntity = function(node, options, level) {
                    var r;
                    this.openNode(node, options, level);
                    options.state = WriterState.OpenTag;
                    r = this.indent(node, options, level) + "<!ENTITY";
                    options.state = WriterState.InsideTag;
                    if (node.pe) {
                      r += " %";
                    }
                    r += " " + node.name;
                    if (node.value) {
                      r += ' "' + node.value + '"';
                    } else {
                      if (node.pubID && node.sysID) {
                        r += ' PUBLIC "' + node.pubID + '" "' + node.sysID + '"';
                      } else if (node.sysID) {
                        r += ' SYSTEM "' + node.sysID + '"';
                      }
                      if (node.nData) {
                        r += " NDATA " + node.nData;
                      }
                    }
                    options.state = WriterState.CloseTag;
                    r += options.spaceBeforeSlash + ">" + this.endline(node, options, level);
                    options.state = WriterState.None;
                    this.closeNode(node, options, level);
                    return r;
                  };
                  XMLWriterBase2.prototype.dtdNotation = function(node, options, level) {
                    var r;
                    this.openNode(node, options, level);
                    options.state = WriterState.OpenTag;
                    r = this.indent(node, options, level) + "<!NOTATION";
                    options.state = WriterState.InsideTag;
                    r += " " + node.name;
                    if (node.pubID && node.sysID) {
                      r += ' PUBLIC "' + node.pubID + '" "' + node.sysID + '"';
                    } else if (node.pubID) {
                      r += ' PUBLIC "' + node.pubID + '"';
                    } else if (node.sysID) {
                      r += ' SYSTEM "' + node.sysID + '"';
                    }
                    options.state = WriterState.CloseTag;
                    r += options.spaceBeforeSlash + ">" + this.endline(node, options, level);
                    options.state = WriterState.None;
                    this.closeNode(node, options, level);
                    return r;
                  };
                  XMLWriterBase2.prototype.openNode = function(node, options, level) {
                  };
                  XMLWriterBase2.prototype.closeNode = function(node, options, level) {
                  };
                  XMLWriterBase2.prototype.openAttribute = function(att, options, level) {
                  };
                  XMLWriterBase2.prototype.closeAttribute = function(att, options, level) {
                  };
                  return XMLWriterBase2;
                }();
              }).call(exports);
            }
          });
          var require_XMLStringWriter = __commonJS({
            "node_modules/.pnpm/xmlbuilder@11.0.1/node_modules/xmlbuilder/lib/XMLStringWriter.js"(exports, module) {
              (function() {
                var XMLStringWriter, XMLWriterBase, extend = function(child, parent) {
                  for (var key in parent) {
                    if (hasProp.call(parent, key))
                      child[key] = parent[key];
                  }
                  function ctor() {
                    this.constructor = child;
                  }
                  ctor.prototype = parent.prototype;
                  child.prototype = new ctor();
                  child.__super__ = parent.prototype;
                  return child;
                }, hasProp = {}.hasOwnProperty;
                XMLWriterBase = require_XMLWriterBase();
                module.exports = XMLStringWriter = function(superClass) {
                  extend(XMLStringWriter2, superClass);
                  function XMLStringWriter2(options) {
                    XMLStringWriter2.__super__.constructor.call(this, options);
                  }
                  XMLStringWriter2.prototype.document = function(doc, options) {
                    var child, i, len, r, ref;
                    options = this.filterOptions(options);
                    r = "";
                    ref = doc.children;
                    for (i = 0, len = ref.length; i < len; i++) {
                      child = ref[i];
                      r += this.writeChildNode(child, options, 0);
                    }
                    if (options.pretty && r.slice(-options.newline.length) === options.newline) {
                      r = r.slice(0, -options.newline.length);
                    }
                    return r;
                  };
                  return XMLStringWriter2;
                }(XMLWriterBase);
              }).call(exports);
            }
          });
          var require_XMLDocument = __commonJS({
            "node_modules/.pnpm/xmlbuilder@11.0.1/node_modules/xmlbuilder/lib/XMLDocument.js"(exports, module) {
              (function() {
                var NodeType, XMLDOMConfiguration, XMLDOMImplementation, XMLDocument, XMLNode, XMLStringWriter, XMLStringifier, isPlainObject, extend = function(child, parent) {
                  for (var key in parent) {
                    if (hasProp.call(parent, key))
                      child[key] = parent[key];
                  }
                  function ctor() {
                    this.constructor = child;
                  }
                  ctor.prototype = parent.prototype;
                  child.prototype = new ctor();
                  child.__super__ = parent.prototype;
                  return child;
                }, hasProp = {}.hasOwnProperty;
                isPlainObject = require_Utility().isPlainObject;
                XMLDOMImplementation = require_XMLDOMImplementation();
                XMLDOMConfiguration = require_XMLDOMConfiguration();
                XMLNode = require_XMLNode();
                NodeType = require_NodeType();
                XMLStringifier = require_XMLStringifier();
                XMLStringWriter = require_XMLStringWriter();
                module.exports = XMLDocument = function(superClass) {
                  extend(XMLDocument2, superClass);
                  function XMLDocument2(options) {
                    XMLDocument2.__super__.constructor.call(this, null);
                    this.name = "#document";
                    this.type = NodeType.Document;
                    this.documentURI = null;
                    this.domConfig = new XMLDOMConfiguration();
                    options || (options = {});
                    if (!options.writer) {
                      options.writer = new XMLStringWriter();
                    }
                    this.options = options;
                    this.stringify = new XMLStringifier(options);
                  }
                  Object.defineProperty(XMLDocument2.prototype, "implementation", {
                    value: new XMLDOMImplementation()
                  });
                  Object.defineProperty(XMLDocument2.prototype, "doctype", {
                    get: function() {
                      var child, i, len, ref;
                      ref = this.children;
                      for (i = 0, len = ref.length; i < len; i++) {
                        child = ref[i];
                        if (child.type === NodeType.DocType) {
                          return child;
                        }
                      }
                      return null;
                    }
                  });
                  Object.defineProperty(XMLDocument2.prototype, "documentElement", {
                    get: function() {
                      return this.rootObject || null;
                    }
                  });
                  Object.defineProperty(XMLDocument2.prototype, "inputEncoding", {
                    get: function() {
                      return null;
                    }
                  });
                  Object.defineProperty(XMLDocument2.prototype, "strictErrorChecking", {
                    get: function() {
                      return false;
                    }
                  });
                  Object.defineProperty(XMLDocument2.prototype, "xmlEncoding", {
                    get: function() {
                      if (this.children.length !== 0 && this.children[0].type === NodeType.Declaration) {
                        return this.children[0].encoding;
                      } else {
                        return null;
                      }
                    }
                  });
                  Object.defineProperty(XMLDocument2.prototype, "xmlStandalone", {
                    get: function() {
                      if (this.children.length !== 0 && this.children[0].type === NodeType.Declaration) {
                        return this.children[0].standalone === "yes";
                      } else {
                        return false;
                      }
                    }
                  });
                  Object.defineProperty(XMLDocument2.prototype, "xmlVersion", {
                    get: function() {
                      if (this.children.length !== 0 && this.children[0].type === NodeType.Declaration) {
                        return this.children[0].version;
                      } else {
                        return "1.0";
                      }
                    }
                  });
                  Object.defineProperty(XMLDocument2.prototype, "URL", {
                    get: function() {
                      return this.documentURI;
                    }
                  });
                  Object.defineProperty(XMLDocument2.prototype, "origin", {
                    get: function() {
                      return null;
                    }
                  });
                  Object.defineProperty(XMLDocument2.prototype, "compatMode", {
                    get: function() {
                      return null;
                    }
                  });
                  Object.defineProperty(XMLDocument2.prototype, "characterSet", {
                    get: function() {
                      return null;
                    }
                  });
                  Object.defineProperty(XMLDocument2.prototype, "contentType", {
                    get: function() {
                      return null;
                    }
                  });
                  XMLDocument2.prototype.end = function(writer) {
                    var writerOptions;
                    writerOptions = {};
                    if (!writer) {
                      writer = this.options.writer;
                    } else if (isPlainObject(writer)) {
                      writerOptions = writer;
                      writer = this.options.writer;
                    }
                    return writer.document(this, writer.filterOptions(writerOptions));
                  };
                  XMLDocument2.prototype.toString = function(options) {
                    return this.options.writer.document(this, this.options.writer.filterOptions(options));
                  };
                  XMLDocument2.prototype.createElement = function(tagName) {
                    throw new Error("This DOM method is not implemented." + this.debugInfo());
                  };
                  XMLDocument2.prototype.createDocumentFragment = function() {
                    throw new Error("This DOM method is not implemented." + this.debugInfo());
                  };
                  XMLDocument2.prototype.createTextNode = function(data) {
                    throw new Error("This DOM method is not implemented." + this.debugInfo());
                  };
                  XMLDocument2.prototype.createComment = function(data) {
                    throw new Error("This DOM method is not implemented." + this.debugInfo());
                  };
                  XMLDocument2.prototype.createCDATASection = function(data) {
                    throw new Error("This DOM method is not implemented." + this.debugInfo());
                  };
                  XMLDocument2.prototype.createProcessingInstruction = function(target, data) {
                    throw new Error("This DOM method is not implemented." + this.debugInfo());
                  };
                  XMLDocument2.prototype.createAttribute = function(name) {
                    throw new Error("This DOM method is not implemented." + this.debugInfo());
                  };
                  XMLDocument2.prototype.createEntityReference = function(name) {
                    throw new Error("This DOM method is not implemented." + this.debugInfo());
                  };
                  XMLDocument2.prototype.getElementsByTagName = function(tagname) {
                    throw new Error("This DOM method is not implemented." + this.debugInfo());
                  };
                  XMLDocument2.prototype.importNode = function(importedNode, deep) {
                    throw new Error("This DOM method is not implemented." + this.debugInfo());
                  };
                  XMLDocument2.prototype.createElementNS = function(namespaceURI, qualifiedName) {
                    throw new Error("This DOM method is not implemented." + this.debugInfo());
                  };
                  XMLDocument2.prototype.createAttributeNS = function(namespaceURI, qualifiedName) {
                    throw new Error("This DOM method is not implemented." + this.debugInfo());
                  };
                  XMLDocument2.prototype.getElementsByTagNameNS = function(namespaceURI, localName) {
                    throw new Error("This DOM method is not implemented." + this.debugInfo());
                  };
                  XMLDocument2.prototype.getElementById = function(elementId) {
                    throw new Error("This DOM method is not implemented." + this.debugInfo());
                  };
                  XMLDocument2.prototype.adoptNode = function(source) {
                    throw new Error("This DOM method is not implemented." + this.debugInfo());
                  };
                  XMLDocument2.prototype.normalizeDocument = function() {
                    throw new Error("This DOM method is not implemented." + this.debugInfo());
                  };
                  XMLDocument2.prototype.renameNode = function(node, namespaceURI, qualifiedName) {
                    throw new Error("This DOM method is not implemented." + this.debugInfo());
                  };
                  XMLDocument2.prototype.getElementsByClassName = function(classNames) {
                    throw new Error("This DOM method is not implemented." + this.debugInfo());
                  };
                  XMLDocument2.prototype.createEvent = function(eventInterface) {
                    throw new Error("This DOM method is not implemented." + this.debugInfo());
                  };
                  XMLDocument2.prototype.createRange = function() {
                    throw new Error("This DOM method is not implemented." + this.debugInfo());
                  };
                  XMLDocument2.prototype.createNodeIterator = function(root, whatToShow, filter) {
                    throw new Error("This DOM method is not implemented." + this.debugInfo());
                  };
                  XMLDocument2.prototype.createTreeWalker = function(root, whatToShow, filter) {
                    throw new Error("This DOM method is not implemented." + this.debugInfo());
                  };
                  return XMLDocument2;
                }(XMLNode);
              }).call(exports);
            }
          });
          var require_XMLDocumentCB = __commonJS({
            "node_modules/.pnpm/xmlbuilder@11.0.1/node_modules/xmlbuilder/lib/XMLDocumentCB.js"(exports, module) {
              (function() {
                var NodeType, WriterState, XMLAttribute, XMLCData, XMLComment, XMLDTDAttList, XMLDTDElement, XMLDTDEntity, XMLDTDNotation, XMLDeclaration, XMLDocType, XMLDocument, XMLDocumentCB, XMLElement, XMLProcessingInstruction, XMLRaw, XMLStringWriter, XMLStringifier, XMLText, getValue, isFunction, isObject, isPlainObject, ref, hasProp = {}.hasOwnProperty;
                ref = require_Utility(), isObject = ref.isObject, isFunction = ref.isFunction, isPlainObject = ref.isPlainObject, getValue = ref.getValue;
                NodeType = require_NodeType();
                XMLDocument = require_XMLDocument();
                XMLElement = require_XMLElement();
                XMLCData = require_XMLCData();
                XMLComment = require_XMLComment();
                XMLRaw = require_XMLRaw();
                XMLText = require_XMLText();
                XMLProcessingInstruction = require_XMLProcessingInstruction();
                XMLDeclaration = require_XMLDeclaration();
                XMLDocType = require_XMLDocType();
                XMLDTDAttList = require_XMLDTDAttList();
                XMLDTDEntity = require_XMLDTDEntity();
                XMLDTDElement = require_XMLDTDElement();
                XMLDTDNotation = require_XMLDTDNotation();
                XMLAttribute = require_XMLAttribute();
                XMLStringifier = require_XMLStringifier();
                XMLStringWriter = require_XMLStringWriter();
                WriterState = require_WriterState();
                module.exports = XMLDocumentCB = function() {
                  function XMLDocumentCB2(options, onData, onEnd) {
                    var writerOptions;
                    this.name = "?xml";
                    this.type = NodeType.Document;
                    options || (options = {});
                    writerOptions = {};
                    if (!options.writer) {
                      options.writer = new XMLStringWriter();
                    } else if (isPlainObject(options.writer)) {
                      writerOptions = options.writer;
                      options.writer = new XMLStringWriter();
                    }
                    this.options = options;
                    this.writer = options.writer;
                    this.writerOptions = this.writer.filterOptions(writerOptions);
                    this.stringify = new XMLStringifier(options);
                    this.onDataCallback = onData || function() {
                    };
                    this.onEndCallback = onEnd || function() {
                    };
                    this.currentNode = null;
                    this.currentLevel = -1;
                    this.openTags = {};
                    this.documentStarted = false;
                    this.documentCompleted = false;
                    this.root = null;
                  }
                  XMLDocumentCB2.prototype.createChildNode = function(node) {
                    var att, attName, attributes, child, i, len, ref1, ref2;
                    switch (node.type) {
                      case NodeType.CData:
                        this.cdata(node.value);
                        break;
                      case NodeType.Comment:
                        this.comment(node.value);
                        break;
                      case NodeType.Element:
                        attributes = {};
                        ref1 = node.attribs;
                        for (attName in ref1) {
                          if (!hasProp.call(ref1, attName))
                            continue;
                          att = ref1[attName];
                          attributes[attName] = att.value;
                        }
                        this.node(node.name, attributes);
                        break;
                      case NodeType.Dummy:
                        this.dummy();
                        break;
                      case NodeType.Raw:
                        this.raw(node.value);
                        break;
                      case NodeType.Text:
                        this.text(node.value);
                        break;
                      case NodeType.ProcessingInstruction:
                        this.instruction(node.target, node.value);
                        break;
                      default:
                        throw new Error("This XML node type is not supported in a JS object: " + node.constructor.name);
                    }
                    ref2 = node.children;
                    for (i = 0, len = ref2.length; i < len; i++) {
                      child = ref2[i];
                      this.createChildNode(child);
                      if (child.type === NodeType.Element) {
                        this.up();
                      }
                    }
                    return this;
                  };
                  XMLDocumentCB2.prototype.dummy = function() {
                    return this;
                  };
                  XMLDocumentCB2.prototype.node = function(name, attributes, text) {
                    var ref1;
                    if (name == null) {
                      throw new Error("Missing node name.");
                    }
                    if (this.root && this.currentLevel === -1) {
                      throw new Error("Document can only have one root node. " + this.debugInfo(name));
                    }
                    this.openCurrent();
                    name = getValue(name);
                    if (attributes == null) {
                      attributes = {};
                    }
                    attributes = getValue(attributes);
                    if (!isObject(attributes)) {
                      ref1 = [attributes, text], text = ref1[0], attributes = ref1[1];
                    }
                    this.currentNode = new XMLElement(this, name, attributes);
                    this.currentNode.children = false;
                    this.currentLevel++;
                    this.openTags[this.currentLevel] = this.currentNode;
                    if (text != null) {
                      this.text(text);
                    }
                    return this;
                  };
                  XMLDocumentCB2.prototype.element = function(name, attributes, text) {
                    var child, i, len, oldValidationFlag, ref1, root;
                    if (this.currentNode && this.currentNode.type === NodeType.DocType) {
                      this.dtdElement.apply(this, arguments);
                    } else {
                      if (Array.isArray(name) || isObject(name) || isFunction(name)) {
                        oldValidationFlag = this.options.noValidation;
                        this.options.noValidation = true;
                        root = new XMLDocument(this.options).element("TEMP_ROOT");
                        root.element(name);
                        this.options.noValidation = oldValidationFlag;
                        ref1 = root.children;
                        for (i = 0, len = ref1.length; i < len; i++) {
                          child = ref1[i];
                          this.createChildNode(child);
                          if (child.type === NodeType.Element) {
                            this.up();
                          }
                        }
                      } else {
                        this.node(name, attributes, text);
                      }
                    }
                    return this;
                  };
                  XMLDocumentCB2.prototype.attribute = function(name, value) {
                    var attName, attValue;
                    if (!this.currentNode || this.currentNode.children) {
                      throw new Error("att() can only be used immediately after an ele() call in callback mode. " + this.debugInfo(name));
                    }
                    if (name != null) {
                      name = getValue(name);
                    }
                    if (isObject(name)) {
                      for (attName in name) {
                        if (!hasProp.call(name, attName))
                          continue;
                        attValue = name[attName];
                        this.attribute(attName, attValue);
                      }
                    } else {
                      if (isFunction(value)) {
                        value = value.apply();
                      }
                      if (this.options.keepNullAttributes && value == null) {
                        this.currentNode.attribs[name] = new XMLAttribute(this, name, "");
                      } else if (value != null) {
                        this.currentNode.attribs[name] = new XMLAttribute(this, name, value);
                      }
                    }
                    return this;
                  };
                  XMLDocumentCB2.prototype.text = function(value) {
                    var node;
                    this.openCurrent();
                    node = new XMLText(this, value);
                    this.onData(this.writer.text(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1);
                    return this;
                  };
                  XMLDocumentCB2.prototype.cdata = function(value) {
                    var node;
                    this.openCurrent();
                    node = new XMLCData(this, value);
                    this.onData(this.writer.cdata(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1);
                    return this;
                  };
                  XMLDocumentCB2.prototype.comment = function(value) {
                    var node;
                    this.openCurrent();
                    node = new XMLComment(this, value);
                    this.onData(this.writer.comment(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1);
                    return this;
                  };
                  XMLDocumentCB2.prototype.raw = function(value) {
                    var node;
                    this.openCurrent();
                    node = new XMLRaw(this, value);
                    this.onData(this.writer.raw(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1);
                    return this;
                  };
                  XMLDocumentCB2.prototype.instruction = function(target, value) {
                    var i, insTarget, insValue, len, node;
                    this.openCurrent();
                    if (target != null) {
                      target = getValue(target);
                    }
                    if (value != null) {
                      value = getValue(value);
                    }
                    if (Array.isArray(target)) {
                      for (i = 0, len = target.length; i < len; i++) {
                        insTarget = target[i];
                        this.instruction(insTarget);
                      }
                    } else if (isObject(target)) {
                      for (insTarget in target) {
                        if (!hasProp.call(target, insTarget))
                          continue;
                        insValue = target[insTarget];
                        this.instruction(insTarget, insValue);
                      }
                    } else {
                      if (isFunction(value)) {
                        value = value.apply();
                      }
                      node = new XMLProcessingInstruction(this, target, value);
                      this.onData(this.writer.processingInstruction(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1);
                    }
                    return this;
                  };
                  XMLDocumentCB2.prototype.declaration = function(version, encoding, standalone) {
                    var node;
                    this.openCurrent();
                    if (this.documentStarted) {
                      throw new Error("declaration() must be the first node.");
                    }
                    node = new XMLDeclaration(this, version, encoding, standalone);
                    this.onData(this.writer.declaration(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1);
                    return this;
                  };
                  XMLDocumentCB2.prototype.doctype = function(root, pubID, sysID) {
                    this.openCurrent();
                    if (root == null) {
                      throw new Error("Missing root node name.");
                    }
                    if (this.root) {
                      throw new Error("dtd() must come before the root node.");
                    }
                    this.currentNode = new XMLDocType(this, pubID, sysID);
                    this.currentNode.rootNodeName = root;
                    this.currentNode.children = false;
                    this.currentLevel++;
                    this.openTags[this.currentLevel] = this.currentNode;
                    return this;
                  };
                  XMLDocumentCB2.prototype.dtdElement = function(name, value) {
                    var node;
                    this.openCurrent();
                    node = new XMLDTDElement(this, name, value);
                    this.onData(this.writer.dtdElement(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1);
                    return this;
                  };
                  XMLDocumentCB2.prototype.attList = function(elementName, attributeName, attributeType, defaultValueType, defaultValue) {
                    var node;
                    this.openCurrent();
                    node = new XMLDTDAttList(this, elementName, attributeName, attributeType, defaultValueType, defaultValue);
                    this.onData(this.writer.dtdAttList(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1);
                    return this;
                  };
                  XMLDocumentCB2.prototype.entity = function(name, value) {
                    var node;
                    this.openCurrent();
                    node = new XMLDTDEntity(this, false, name, value);
                    this.onData(this.writer.dtdEntity(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1);
                    return this;
                  };
                  XMLDocumentCB2.prototype.pEntity = function(name, value) {
                    var node;
                    this.openCurrent();
                    node = new XMLDTDEntity(this, true, name, value);
                    this.onData(this.writer.dtdEntity(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1);
                    return this;
                  };
                  XMLDocumentCB2.prototype.notation = function(name, value) {
                    var node;
                    this.openCurrent();
                    node = new XMLDTDNotation(this, name, value);
                    this.onData(this.writer.dtdNotation(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1);
                    return this;
                  };
                  XMLDocumentCB2.prototype.up = function() {
                    if (this.currentLevel < 0) {
                      throw new Error("The document node has no parent.");
                    }
                    if (this.currentNode) {
                      if (this.currentNode.children) {
                        this.closeNode(this.currentNode);
                      } else {
                        this.openNode(this.currentNode);
                      }
                      this.currentNode = null;
                    } else {
                      this.closeNode(this.openTags[this.currentLevel]);
                    }
                    delete this.openTags[this.currentLevel];
                    this.currentLevel--;
                    return this;
                  };
                  XMLDocumentCB2.prototype.end = function() {
                    while (this.currentLevel >= 0) {
                      this.up();
                    }
                    return this.onEnd();
                  };
                  XMLDocumentCB2.prototype.openCurrent = function() {
                    if (this.currentNode) {
                      this.currentNode.children = true;
                      return this.openNode(this.currentNode);
                    }
                  };
                  XMLDocumentCB2.prototype.openNode = function(node) {
                    var att, chunk, name, ref1;
                    if (!node.isOpen) {
                      if (!this.root && this.currentLevel === 0 && node.type === NodeType.Element) {
                        this.root = node;
                      }
                      chunk = "";
                      if (node.type === NodeType.Element) {
                        this.writerOptions.state = WriterState.OpenTag;
                        chunk = this.writer.indent(node, this.writerOptions, this.currentLevel) + "<" + node.name;
                        ref1 = node.attribs;
                        for (name in ref1) {
                          if (!hasProp.call(ref1, name))
                            continue;
                          att = ref1[name];
                          chunk += this.writer.attribute(att, this.writerOptions, this.currentLevel);
                        }
                        chunk += (node.children ? ">" : "/>") + this.writer.endline(node, this.writerOptions, this.currentLevel);
                        this.writerOptions.state = WriterState.InsideTag;
                      } else {
                        this.writerOptions.state = WriterState.OpenTag;
                        chunk = this.writer.indent(node, this.writerOptions, this.currentLevel) + "<!DOCTYPE " + node.rootNodeName;
                        if (node.pubID && node.sysID) {
                          chunk += ' PUBLIC "' + node.pubID + '" "' + node.sysID + '"';
                        } else if (node.sysID) {
                          chunk += ' SYSTEM "' + node.sysID + '"';
                        }
                        if (node.children) {
                          chunk += " [";
                          this.writerOptions.state = WriterState.InsideTag;
                        } else {
                          this.writerOptions.state = WriterState.CloseTag;
                          chunk += ">";
                        }
                        chunk += this.writer.endline(node, this.writerOptions, this.currentLevel);
                      }
                      this.onData(chunk, this.currentLevel);
                      return node.isOpen = true;
                    }
                  };
                  XMLDocumentCB2.prototype.closeNode = function(node) {
                    var chunk;
                    if (!node.isClosed) {
                      chunk = "";
                      this.writerOptions.state = WriterState.CloseTag;
                      if (node.type === NodeType.Element) {
                        chunk = this.writer.indent(node, this.writerOptions, this.currentLevel) + "</" + node.name + ">" + this.writer.endline(node, this.writerOptions, this.currentLevel);
                      } else {
                        chunk = this.writer.indent(node, this.writerOptions, this.currentLevel) + "]>" + this.writer.endline(node, this.writerOptions, this.currentLevel);
                      }
                      this.writerOptions.state = WriterState.None;
                      this.onData(chunk, this.currentLevel);
                      return node.isClosed = true;
                    }
                  };
                  XMLDocumentCB2.prototype.onData = function(chunk, level) {
                    this.documentStarted = true;
                    return this.onDataCallback(chunk, level + 1);
                  };
                  XMLDocumentCB2.prototype.onEnd = function() {
                    this.documentCompleted = true;
                    return this.onEndCallback();
                  };
                  XMLDocumentCB2.prototype.debugInfo = function(name) {
                    if (name == null) {
                      return "";
                    } else {
                      return "node: <" + name + ">";
                    }
                  };
                  XMLDocumentCB2.prototype.ele = function() {
                    return this.element.apply(this, arguments);
                  };
                  XMLDocumentCB2.prototype.nod = function(name, attributes, text) {
                    return this.node(name, attributes, text);
                  };
                  XMLDocumentCB2.prototype.txt = function(value) {
                    return this.text(value);
                  };
                  XMLDocumentCB2.prototype.dat = function(value) {
                    return this.cdata(value);
                  };
                  XMLDocumentCB2.prototype.com = function(value) {
                    return this.comment(value);
                  };
                  XMLDocumentCB2.prototype.ins = function(target, value) {
                    return this.instruction(target, value);
                  };
                  XMLDocumentCB2.prototype.dec = function(version, encoding, standalone) {
                    return this.declaration(version, encoding, standalone);
                  };
                  XMLDocumentCB2.prototype.dtd = function(root, pubID, sysID) {
                    return this.doctype(root, pubID, sysID);
                  };
                  XMLDocumentCB2.prototype.e = function(name, attributes, text) {
                    return this.element(name, attributes, text);
                  };
                  XMLDocumentCB2.prototype.n = function(name, attributes, text) {
                    return this.node(name, attributes, text);
                  };
                  XMLDocumentCB2.prototype.t = function(value) {
                    return this.text(value);
                  };
                  XMLDocumentCB2.prototype.d = function(value) {
                    return this.cdata(value);
                  };
                  XMLDocumentCB2.prototype.c = function(value) {
                    return this.comment(value);
                  };
                  XMLDocumentCB2.prototype.r = function(value) {
                    return this.raw(value);
                  };
                  XMLDocumentCB2.prototype.i = function(target, value) {
                    return this.instruction(target, value);
                  };
                  XMLDocumentCB2.prototype.att = function() {
                    if (this.currentNode && this.currentNode.type === NodeType.DocType) {
                      return this.attList.apply(this, arguments);
                    } else {
                      return this.attribute.apply(this, arguments);
                    }
                  };
                  XMLDocumentCB2.prototype.a = function() {
                    if (this.currentNode && this.currentNode.type === NodeType.DocType) {
                      return this.attList.apply(this, arguments);
                    } else {
                      return this.attribute.apply(this, arguments);
                    }
                  };
                  XMLDocumentCB2.prototype.ent = function(name, value) {
                    return this.entity(name, value);
                  };
                  XMLDocumentCB2.prototype.pent = function(name, value) {
                    return this.pEntity(name, value);
                  };
                  XMLDocumentCB2.prototype.not = function(name, value) {
                    return this.notation(name, value);
                  };
                  return XMLDocumentCB2;
                }();
              }).call(exports);
            }
          });
          var require_XMLStreamWriter = __commonJS({
            "node_modules/.pnpm/xmlbuilder@11.0.1/node_modules/xmlbuilder/lib/XMLStreamWriter.js"(exports, module) {
              (function() {
                var NodeType, WriterState, XMLStreamWriter, XMLWriterBase, extend = function(child, parent) {
                  for (var key in parent) {
                    if (hasProp.call(parent, key))
                      child[key] = parent[key];
                  }
                  function ctor() {
                    this.constructor = child;
                  }
                  ctor.prototype = parent.prototype;
                  child.prototype = new ctor();
                  child.__super__ = parent.prototype;
                  return child;
                }, hasProp = {}.hasOwnProperty;
                NodeType = require_NodeType();
                XMLWriterBase = require_XMLWriterBase();
                WriterState = require_WriterState();
                module.exports = XMLStreamWriter = function(superClass) {
                  extend(XMLStreamWriter2, superClass);
                  function XMLStreamWriter2(stream, options) {
                    this.stream = stream;
                    XMLStreamWriter2.__super__.constructor.call(this, options);
                  }
                  XMLStreamWriter2.prototype.endline = function(node, options, level) {
                    if (node.isLastRootNode && options.state === WriterState.CloseTag) {
                      return "";
                    } else {
                      return XMLStreamWriter2.__super__.endline.call(this, node, options, level);
                    }
                  };
                  XMLStreamWriter2.prototype.document = function(doc, options) {
                    var child, i, j, k, len, len1, ref, ref1, results;
                    ref = doc.children;
                    for (i = j = 0, len = ref.length; j < len; i = ++j) {
                      child = ref[i];
                      child.isLastRootNode = i === doc.children.length - 1;
                    }
                    options = this.filterOptions(options);
                    ref1 = doc.children;
                    results = [];
                    for (k = 0, len1 = ref1.length; k < len1; k++) {
                      child = ref1[k];
                      results.push(this.writeChildNode(child, options, 0));
                    }
                    return results;
                  };
                  XMLStreamWriter2.prototype.attribute = function(att, options, level) {
                    return this.stream.write(XMLStreamWriter2.__super__.attribute.call(this, att, options, level));
                  };
                  XMLStreamWriter2.prototype.cdata = function(node, options, level) {
                    return this.stream.write(XMLStreamWriter2.__super__.cdata.call(this, node, options, level));
                  };
                  XMLStreamWriter2.prototype.comment = function(node, options, level) {
                    return this.stream.write(XMLStreamWriter2.__super__.comment.call(this, node, options, level));
                  };
                  XMLStreamWriter2.prototype.declaration = function(node, options, level) {
                    return this.stream.write(XMLStreamWriter2.__super__.declaration.call(this, node, options, level));
                  };
                  XMLStreamWriter2.prototype.docType = function(node, options, level) {
                    var child, j, len, ref;
                    level || (level = 0);
                    this.openNode(node, options, level);
                    options.state = WriterState.OpenTag;
                    this.stream.write(this.indent(node, options, level));
                    this.stream.write("<!DOCTYPE " + node.root().name);
                    if (node.pubID && node.sysID) {
                      this.stream.write(' PUBLIC "' + node.pubID + '" "' + node.sysID + '"');
                    } else if (node.sysID) {
                      this.stream.write(' SYSTEM "' + node.sysID + '"');
                    }
                    if (node.children.length > 0) {
                      this.stream.write(" [");
                      this.stream.write(this.endline(node, options, level));
                      options.state = WriterState.InsideTag;
                      ref = node.children;
                      for (j = 0, len = ref.length; j < len; j++) {
                        child = ref[j];
                        this.writeChildNode(child, options, level + 1);
                      }
                      options.state = WriterState.CloseTag;
                      this.stream.write("]");
                    }
                    options.state = WriterState.CloseTag;
                    this.stream.write(options.spaceBeforeSlash + ">");
                    this.stream.write(this.endline(node, options, level));
                    options.state = WriterState.None;
                    return this.closeNode(node, options, level);
                  };
                  XMLStreamWriter2.prototype.element = function(node, options, level) {
                    var att, child, childNodeCount, firstChildNode, j, len, name, prettySuppressed, ref, ref1;
                    level || (level = 0);
                    this.openNode(node, options, level);
                    options.state = WriterState.OpenTag;
                    this.stream.write(this.indent(node, options, level) + "<" + node.name);
                    ref = node.attribs;
                    for (name in ref) {
                      if (!hasProp.call(ref, name))
                        continue;
                      att = ref[name];
                      this.attribute(att, options, level);
                    }
                    childNodeCount = node.children.length;
                    firstChildNode = childNodeCount === 0 ? null : node.children[0];
                    if (childNodeCount === 0 || node.children.every(function(e) {
                      return (e.type === NodeType.Text || e.type === NodeType.Raw) && e.value === "";
                    })) {
                      if (options.allowEmpty) {
                        this.stream.write(">");
                        options.state = WriterState.CloseTag;
                        this.stream.write("</" + node.name + ">");
                      } else {
                        options.state = WriterState.CloseTag;
                        this.stream.write(options.spaceBeforeSlash + "/>");
                      }
                    } else if (options.pretty && childNodeCount === 1 && (firstChildNode.type === NodeType.Text || firstChildNode.type === NodeType.Raw) && firstChildNode.value != null) {
                      this.stream.write(">");
                      options.state = WriterState.InsideTag;
                      options.suppressPrettyCount++;
                      prettySuppressed = true;
                      this.writeChildNode(firstChildNode, options, level + 1);
                      options.suppressPrettyCount--;
                      prettySuppressed = false;
                      options.state = WriterState.CloseTag;
                      this.stream.write("</" + node.name + ">");
                    } else {
                      this.stream.write(">" + this.endline(node, options, level));
                      options.state = WriterState.InsideTag;
                      ref1 = node.children;
                      for (j = 0, len = ref1.length; j < len; j++) {
                        child = ref1[j];
                        this.writeChildNode(child, options, level + 1);
                      }
                      options.state = WriterState.CloseTag;
                      this.stream.write(this.indent(node, options, level) + "</" + node.name + ">");
                    }
                    this.stream.write(this.endline(node, options, level));
                    options.state = WriterState.None;
                    return this.closeNode(node, options, level);
                  };
                  XMLStreamWriter2.prototype.processingInstruction = function(node, options, level) {
                    return this.stream.write(XMLStreamWriter2.__super__.processingInstruction.call(this, node, options, level));
                  };
                  XMLStreamWriter2.prototype.raw = function(node, options, level) {
                    return this.stream.write(XMLStreamWriter2.__super__.raw.call(this, node, options, level));
                  };
                  XMLStreamWriter2.prototype.text = function(node, options, level) {
                    return this.stream.write(XMLStreamWriter2.__super__.text.call(this, node, options, level));
                  };
                  XMLStreamWriter2.prototype.dtdAttList = function(node, options, level) {
                    return this.stream.write(XMLStreamWriter2.__super__.dtdAttList.call(this, node, options, level));
                  };
                  XMLStreamWriter2.prototype.dtdElement = function(node, options, level) {
                    return this.stream.write(XMLStreamWriter2.__super__.dtdElement.call(this, node, options, level));
                  };
                  XMLStreamWriter2.prototype.dtdEntity = function(node, options, level) {
                    return this.stream.write(XMLStreamWriter2.__super__.dtdEntity.call(this, node, options, level));
                  };
                  XMLStreamWriter2.prototype.dtdNotation = function(node, options, level) {
                    return this.stream.write(XMLStreamWriter2.__super__.dtdNotation.call(this, node, options, level));
                  };
                  return XMLStreamWriter2;
                }(XMLWriterBase);
              }).call(exports);
            }
          });
          var require_lib = __commonJS({
            "node_modules/.pnpm/xmlbuilder@11.0.1/node_modules/xmlbuilder/lib/index.js"(exports, module) {
              (function() {
                var NodeType, WriterState, XMLDOMImplementation, XMLDocument, XMLDocumentCB, XMLStreamWriter, XMLStringWriter, assign, isFunction, ref;
                ref = require_Utility(), assign = ref.assign, isFunction = ref.isFunction;
                XMLDOMImplementation = require_XMLDOMImplementation();
                XMLDocument = require_XMLDocument();
                XMLDocumentCB = require_XMLDocumentCB();
                XMLStringWriter = require_XMLStringWriter();
                XMLStreamWriter = require_XMLStreamWriter();
                NodeType = require_NodeType();
                WriterState = require_WriterState();
                module.exports.create = function(name, xmldec, doctype, options) {
                  var doc, root;
                  if (name == null) {
                    throw new Error("Root element needs a name.");
                  }
                  options = assign({}, xmldec, doctype, options);
                  doc = new XMLDocument(options);
                  root = doc.element(name);
                  if (!options.headless) {
                    doc.declaration(options);
                    if (options.pubID != null || options.sysID != null) {
                      doc.dtd(options);
                    }
                  }
                  return root;
                };
                module.exports.begin = function(options, onData, onEnd) {
                  var ref1;
                  if (isFunction(options)) {
                    ref1 = [options, onData], onData = ref1[0], onEnd = ref1[1];
                    options = {};
                  }
                  if (onData) {
                    return new XMLDocumentCB(options, onData, onEnd);
                  } else {
                    return new XMLDocument(options);
                  }
                };
                module.exports.stringWriter = function(options) {
                  return new XMLStringWriter(options);
                };
                module.exports.streamWriter = function(stream, options) {
                  return new XMLStreamWriter(stream, options);
                };
                module.exports.implementation = new XMLDOMImplementation();
                module.exports.nodeType = NodeType;
                module.exports.writerState = WriterState;
              }).call(exports);
            }
          });
          var require_builder = __commonJS({
            "node_modules/.pnpm/xml2js@0.5.0/node_modules/xml2js/lib/builder.js"(exports) {
              (function() {
                "use strict";
                var builder, defaults, escapeCDATA, requiresCDATA, wrapCDATA, hasProp = {}.hasOwnProperty;
                builder = require_lib();
                defaults = require_defaults().defaults;
                requiresCDATA = function(entry) {
                  return typeof entry === "string" && (entry.indexOf("&") >= 0 || entry.indexOf(">") >= 0 || entry.indexOf("<") >= 0);
                };
                wrapCDATA = function(entry) {
                  return "<![CDATA[" + escapeCDATA(entry) + "]]>";
                };
                escapeCDATA = function(entry) {
                  return entry.replace("]]>", "]]]]><![CDATA[>");
                };
                exports.Builder = function() {
                  function Builder(opts) {
                    var key, ref, value;
                    this.options = {};
                    ref = defaults["0.2"];
                    for (key in ref) {
                      if (!hasProp.call(ref, key))
                        continue;
                      value = ref[key];
                      this.options[key] = value;
                    }
                    for (key in opts) {
                      if (!hasProp.call(opts, key))
                        continue;
                      value = opts[key];
                      this.options[key] = value;
                    }
                  }
                  Builder.prototype.buildObject = function(rootObj) {
                    var attrkey, charkey, render, rootElement, rootName;
                    attrkey = this.options.attrkey;
                    charkey = this.options.charkey;
                    if (Object.keys(rootObj).length === 1 && this.options.rootName === defaults["0.2"].rootName) {
                      rootName = Object.keys(rootObj)[0];
                      rootObj = rootObj[rootName];
                    } else {
                      rootName = this.options.rootName;
                    }
                    render = /* @__PURE__ */ function(_this) {
                      return function(element, obj) {
                        var attr, child, entry, index, key, value;
                        if (typeof obj !== "object") {
                          if (_this.options.cdata && requiresCDATA(obj)) {
                            element.raw(wrapCDATA(obj));
                          } else {
                            element.txt(obj);
                          }
                        } else if (Array.isArray(obj)) {
                          for (index in obj) {
                            if (!hasProp.call(obj, index))
                              continue;
                            child = obj[index];
                            for (key in child) {
                              entry = child[key];
                              element = render(element.ele(key), entry).up();
                            }
                          }
                        } else {
                          for (key in obj) {
                            if (!hasProp.call(obj, key))
                              continue;
                            child = obj[key];
                            if (key === attrkey) {
                              if (typeof child === "object") {
                                for (attr in child) {
                                  value = child[attr];
                                  element = element.att(attr, value);
                                }
                              }
                            } else if (key === charkey) {
                              if (_this.options.cdata && requiresCDATA(child)) {
                                element = element.raw(wrapCDATA(child));
                              } else {
                                element = element.txt(child);
                              }
                            } else if (Array.isArray(child)) {
                              for (index in child) {
                                if (!hasProp.call(child, index))
                                  continue;
                                entry = child[index];
                                if (typeof entry === "string") {
                                  if (_this.options.cdata && requiresCDATA(entry)) {
                                    element = element.ele(key).raw(wrapCDATA(entry)).up();
                                  } else {
                                    element = element.ele(key, entry).up();
                                  }
                                } else {
                                  element = render(element.ele(key), entry).up();
                                }
                              }
                            } else if (typeof child === "object") {
                              element = render(element.ele(key), child).up();
                            } else {
                              if (typeof child === "string" && _this.options.cdata && requiresCDATA(child)) {
                                element = element.ele(key).raw(wrapCDATA(child)).up();
                              } else {
                                if (child == null) {
                                  child = "";
                                }
                                element = element.ele(key, child.toString()).up();
                              }
                            }
                          }
                        }
                        return element;
                      };
                    }(this);
                    rootElement = builder.create(rootName, this.options.xmldec, this.options.doctype, {
                      headless: this.options.headless,
                      allowSurrogateChars: this.options.allowSurrogateChars
                    });
                    return render(rootElement, rootObj).end(this.options.renderOpts);
                  };
                  return Builder;
                }();
              }).call(exports);
            }
          });
          var require_sax = __commonJS({
            "node_modules/.pnpm/sax@1.6.0/node_modules/sax/lib/sax.js"(exports) {
              (function(sax) {
                sax.parser = function(strict, opt) {
                  return new SAXParser(strict, opt);
                };
                sax.SAXParser = SAXParser;
                sax.SAXStream = SAXStream;
                sax.createStream = createStream;
                sax.MAX_BUFFER_LENGTH = 64 * 1024;
                var buffers = [
                  "comment",
                  "sgmlDecl",
                  "textNode",
                  "tagName",
                  "doctype",
                  "procInstName",
                  "procInstBody",
                  "entity",
                  "attribName",
                  "attribValue",
                  "cdata",
                  "script"
                ];
                sax.EVENTS = [
                  "text",
                  "processinginstruction",
                  "sgmldeclaration",
                  "doctype",
                  "comment",
                  "opentagstart",
                  "attribute",
                  "opentag",
                  "closetag",
                  "opencdata",
                  "cdata",
                  "closecdata",
                  "error",
                  "end",
                  "ready",
                  "script",
                  "opennamespace",
                  "closenamespace"
                ];
                function SAXParser(strict, opt) {
                  if (!(this instanceof SAXParser)) {
                    return new SAXParser(strict, opt);
                  }
                  var parser2 = this;
                  clearBuffers(parser2);
                  parser2.q = parser2.c = "";
                  parser2.bufferCheckPosition = sax.MAX_BUFFER_LENGTH;
                  parser2.encoding = null;
                  parser2.opt = opt || {};
                  parser2.opt.lowercase = parser2.opt.lowercase || parser2.opt.lowercasetags;
                  parser2.looseCase = parser2.opt.lowercase ? "toLowerCase" : "toUpperCase";
                  parser2.opt.maxEntityCount = parser2.opt.maxEntityCount || 512;
                  parser2.opt.maxEntityDepth = parser2.opt.maxEntityDepth || 4;
                  parser2.entityCount = parser2.entityDepth = 0;
                  parser2.tags = [];
                  parser2.closed = parser2.closedRoot = parser2.sawRoot = false;
                  parser2.tag = parser2.error = null;
                  parser2.strict = !!strict;
                  parser2.noscript = !!(strict || parser2.opt.noscript);
                  parser2.state = S.BEGIN;
                  parser2.strictEntities = parser2.opt.strictEntities;
                  parser2.ENTITIES = parser2.strictEntities ? Object.create(sax.XML_ENTITIES) : Object.create(sax.ENTITIES);
                  parser2.attribList = [];
                  if (parser2.opt.xmlns) {
                    parser2.ns = Object.create(rootNS);
                  }
                  if (parser2.opt.unquotedAttributeValues === void 0) {
                    parser2.opt.unquotedAttributeValues = !strict;
                  }
                  parser2.trackPosition = parser2.opt.position !== false;
                  if (parser2.trackPosition) {
                    parser2.position = parser2.line = parser2.column = 0;
                  }
                  emit(parser2, "onready");
                }
                if (!Object.create) {
                  Object.create = function(o) {
                    function F() {
                    }
                    F.prototype = o;
                    var newf = new F();
                    return newf;
                  };
                }
                if (!Object.keys) {
                  Object.keys = function(o) {
                    var a = [];
                    for (var i in o)
                      if (o.hasOwnProperty(i))
                        a.push(i);
                    return a;
                  };
                }
                function checkBufferLength(parser2) {
                  var maxAllowed = Math.max(sax.MAX_BUFFER_LENGTH, 10);
                  var maxActual = 0;
                  for (var i = 0, l = buffers.length; i < l; i++) {
                    var len = parser2[buffers[i]].length;
                    if (len > maxAllowed) {
                      switch (buffers[i]) {
                        case "textNode":
                          closeText(parser2);
                          break;
                        case "cdata":
                          emitNode(parser2, "oncdata", parser2.cdata);
                          parser2.cdata = "";
                          break;
                        case "script":
                          emitNode(parser2, "onscript", parser2.script);
                          parser2.script = "";
                          break;
                        default:
                          error(parser2, "Max buffer length exceeded: " + buffers[i]);
                      }
                    }
                    maxActual = Math.max(maxActual, len);
                  }
                  var m = sax.MAX_BUFFER_LENGTH - maxActual;
                  parser2.bufferCheckPosition = m + parser2.position;
                }
                function clearBuffers(parser2) {
                  for (var i = 0, l = buffers.length; i < l; i++) {
                    parser2[buffers[i]] = "";
                  }
                }
                function flushBuffers(parser2) {
                  closeText(parser2);
                  if (parser2.cdata !== "") {
                    emitNode(parser2, "oncdata", parser2.cdata);
                    parser2.cdata = "";
                  }
                  if (parser2.script !== "") {
                    emitNode(parser2, "onscript", parser2.script);
                    parser2.script = "";
                  }
                }
                SAXParser.prototype = {
                  end: function() {
                    end(this);
                  },
                  write,
                  resume: function() {
                    this.error = null;
                    return this;
                  },
                  close: function() {
                    return this.write(null);
                  },
                  flush: function() {
                    flushBuffers(this);
                  }
                };
                var Stream;
                try {
                  Stream = __require2("stream").Stream;
                } catch (ex) {
                  Stream = function() {
                  };
                }
                if (!Stream)
                  Stream = function() {
                  };
                var streamWraps = sax.EVENTS.filter(function(ev) {
                  return ev !== "error" && ev !== "end";
                });
                function createStream(strict, opt) {
                  return new SAXStream(strict, opt);
                }
                function determineBufferEncoding(data, isEnd) {
                  if (data.length >= 2) {
                    if (data[0] === 255 && data[1] === 254) {
                      return "utf-16le";
                    }
                    if (data[0] === 254 && data[1] === 255) {
                      return "utf-16be";
                    }
                  }
                  if (data.length >= 3 && data[0] === 239 && data[1] === 187 && data[2] === 191) {
                    return "utf8";
                  }
                  if (data.length >= 4) {
                    if (data[0] === 60 && data[1] === 0 && data[2] === 63 && data[3] === 0) {
                      return "utf-16le";
                    }
                    if (data[0] === 0 && data[1] === 60 && data[2] === 0 && data[3] === 63) {
                      return "utf-16be";
                    }
                    return "utf8";
                  }
                  return isEnd ? "utf8" : null;
                }
                function SAXStream(strict, opt) {
                  if (!(this instanceof SAXStream)) {
                    return new SAXStream(strict, opt);
                  }
                  Stream.apply(this);
                  this._parser = new SAXParser(strict, opt);
                  this.writable = true;
                  this.readable = true;
                  var me = this;
                  this._parser.onend = function() {
                    me.emit("end");
                  };
                  this._parser.onerror = function(er) {
                    me.emit("error", er);
                    me._parser.error = null;
                  };
                  this._decoder = null;
                  this._decoderBuffer = null;
                  streamWraps.forEach(function(ev) {
                    Object.defineProperty(me, "on" + ev, {
                      get: function() {
                        return me._parser["on" + ev];
                      },
                      set: function(h) {
                        if (!h) {
                          me.removeAllListeners(ev);
                          me._parser["on" + ev] = h;
                          return h;
                        }
                        me.on(ev, h);
                      },
                      enumerable: true,
                      configurable: false
                    });
                  });
                }
                SAXStream.prototype = Object.create(Stream.prototype, {
                  constructor: {
                    value: SAXStream
                  }
                });
                SAXStream.prototype._decodeBuffer = function(data, isEnd) {
                  if (this._decoderBuffer) {
                    data = Buffer.concat([this._decoderBuffer, data]);
                    this._decoderBuffer = null;
                  }
                  if (!this._decoder) {
                    var encoding = determineBufferEncoding(data, isEnd);
                    if (!encoding) {
                      this._decoderBuffer = data;
                      return "";
                    }
                    this._parser.encoding = encoding;
                    this._decoder = new TextDecoder(encoding);
                  }
                  return this._decoder.decode(data, { stream: !isEnd });
                };
                SAXStream.prototype.write = function(data) {
                  if (typeof Buffer === "function" && typeof Buffer.isBuffer === "function" && Buffer.isBuffer(data)) {
                    data = this._decodeBuffer(data, false);
                  } else if (this._decoderBuffer) {
                    var remaining = this._decodeBuffer(Buffer.alloc(0), true);
                    if (remaining) {
                      this._parser.write(remaining);
                      this.emit("data", remaining);
                    }
                  }
                  this._parser.write(data.toString());
                  this.emit("data", data);
                  return true;
                };
                SAXStream.prototype.end = function(chunk) {
                  if (chunk && chunk.length) {
                    this.write(chunk);
                  }
                  if (this._decoderBuffer) {
                    var finalChunk = this._decodeBuffer(Buffer.alloc(0), true);
                    if (finalChunk) {
                      this._parser.write(finalChunk);
                      this.emit("data", finalChunk);
                    }
                  } else if (this._decoder) {
                    var remaining = this._decoder.decode();
                    if (remaining) {
                      this._parser.write(remaining);
                      this.emit("data", remaining);
                    }
                  }
                  this._parser.end();
                  return true;
                };
                SAXStream.prototype.on = function(ev, handler) {
                  var me = this;
                  if (!me._parser["on" + ev] && streamWraps.indexOf(ev) !== -1) {
                    me._parser["on" + ev] = function() {
                      var args = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments);
                      args.splice(0, 0, ev);
                      me.emit.apply(me, args);
                    };
                  }
                  return Stream.prototype.on.call(me, ev, handler);
                };
                var CDATA = "[CDATA[";
                var DOCTYPE = "DOCTYPE";
                var XML_NAMESPACE = "http://www.w3.org/XML/1998/namespace";
                var XMLNS_NAMESPACE = "http://www.w3.org/2000/xmlns/";
                var rootNS = { xml: XML_NAMESPACE, xmlns: XMLNS_NAMESPACE };
                var nameStart = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/;
                var nameBody = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/;
                var entityStart = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/;
                var entityBody = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/;
                function isWhitespace(c) {
                  return c === " " || c === "\n" || c === "\r" || c === "	";
                }
                function isQuote(c) {
                  return c === '"' || c === "'";
                }
                function isAttribEnd(c) {
                  return c === ">" || isWhitespace(c);
                }
                function isMatch(regex, c) {
                  return regex.test(c);
                }
                function notMatch(regex, c) {
                  return !isMatch(regex, c);
                }
                var S = 0;
                sax.STATE = {
                  BEGIN: S++,
                  // leading byte order mark or whitespace
                  BEGIN_WHITESPACE: S++,
                  // leading whitespace
                  TEXT: S++,
                  // general stuff
                  TEXT_ENTITY: S++,
                  // &amp and such.
                  OPEN_WAKA: S++,
                  // <
                  SGML_DECL: S++,
                  // <!BLARG
                  SGML_DECL_QUOTED: S++,
                  // <!BLARG foo "bar
                  DOCTYPE: S++,
                  // <!DOCTYPE
                  DOCTYPE_QUOTED: S++,
                  // <!DOCTYPE "//blah
                  DOCTYPE_DTD: S++,
                  // <!DOCTYPE "//blah" [ ...
                  DOCTYPE_DTD_QUOTED: S++,
                  // <!DOCTYPE "//blah" [ "foo
                  COMMENT_STARTING: S++,
                  // <!-
                  COMMENT: S++,
                  // <!--
                  COMMENT_ENDING: S++,
                  // <!-- blah -
                  COMMENT_ENDED: S++,
                  // <!-- blah --
                  CDATA: S++,
                  // <![CDATA[ something
                  CDATA_ENDING: S++,
                  // ]
                  CDATA_ENDING_2: S++,
                  // ]]
                  PROC_INST: S++,
                  // <?hi
                  PROC_INST_BODY: S++,
                  // <?hi there
                  PROC_INST_ENDING: S++,
                  // <?hi "there" ?
                  OPEN_TAG: S++,
                  // <strong
                  OPEN_TAG_SLASH: S++,
                  // <strong /
                  ATTRIB: S++,
                  // <a
                  ATTRIB_NAME: S++,
                  // <a foo
                  ATTRIB_NAME_SAW_WHITE: S++,
                  // <a foo _
                  ATTRIB_VALUE: S++,
                  // <a foo=
                  ATTRIB_VALUE_QUOTED: S++,
                  // <a foo="bar
                  ATTRIB_VALUE_CLOSED: S++,
                  // <a foo="bar"
                  ATTRIB_VALUE_UNQUOTED: S++,
                  // <a foo=bar
                  ATTRIB_VALUE_ENTITY_Q: S++,
                  // <foo bar="&quot;"
                  ATTRIB_VALUE_ENTITY_U: S++,
                  // <foo bar=&quot
                  CLOSE_TAG: S++,
                  // </a
                  CLOSE_TAG_SAW_WHITE: S++,
                  // </a   >
                  SCRIPT: S++,
                  // <script> ...
                  SCRIPT_ENDING: S++
                  // <script> ... <
                };
                sax.XML_ENTITIES = {
                  amp: "&",
                  gt: ">",
                  lt: "<",
                  quot: '"',
                  apos: "'"
                };
                sax.ENTITIES = {
                  amp: "&",
                  gt: ">",
                  lt: "<",
                  quot: '"',
                  apos: "'",
                  AElig: 198,
                  Aacute: 193,
                  Acirc: 194,
                  Agrave: 192,
                  Aring: 197,
                  Atilde: 195,
                  Auml: 196,
                  Ccedil: 199,
                  ETH: 208,
                  Eacute: 201,
                  Ecirc: 202,
                  Egrave: 200,
                  Euml: 203,
                  Iacute: 205,
                  Icirc: 206,
                  Igrave: 204,
                  Iuml: 207,
                  Ntilde: 209,
                  Oacute: 211,
                  Ocirc: 212,
                  Ograve: 210,
                  Oslash: 216,
                  Otilde: 213,
                  Ouml: 214,
                  THORN: 222,
                  Uacute: 218,
                  Ucirc: 219,
                  Ugrave: 217,
                  Uuml: 220,
                  Yacute: 221,
                  aacute: 225,
                  acirc: 226,
                  aelig: 230,
                  agrave: 224,
                  aring: 229,
                  atilde: 227,
                  auml: 228,
                  ccedil: 231,
                  eacute: 233,
                  ecirc: 234,
                  egrave: 232,
                  eth: 240,
                  euml: 235,
                  iacute: 237,
                  icirc: 238,
                  igrave: 236,
                  iuml: 239,
                  ntilde: 241,
                  oacute: 243,
                  ocirc: 244,
                  ograve: 242,
                  oslash: 248,
                  otilde: 245,
                  ouml: 246,
                  szlig: 223,
                  thorn: 254,
                  uacute: 250,
                  ucirc: 251,
                  ugrave: 249,
                  uuml: 252,
                  yacute: 253,
                  yuml: 255,
                  copy: 169,
                  reg: 174,
                  nbsp: 160,
                  iexcl: 161,
                  cent: 162,
                  pound: 163,
                  curren: 164,
                  yen: 165,
                  brvbar: 166,
                  sect: 167,
                  uml: 168,
                  ordf: 170,
                  laquo: 171,
                  not: 172,
                  shy: 173,
                  macr: 175,
                  deg: 176,
                  plusmn: 177,
                  sup1: 185,
                  sup2: 178,
                  sup3: 179,
                  acute: 180,
                  micro: 181,
                  para: 182,
                  middot: 183,
                  cedil: 184,
                  ordm: 186,
                  raquo: 187,
                  frac14: 188,
                  frac12: 189,
                  frac34: 190,
                  iquest: 191,
                  times: 215,
                  divide: 247,
                  OElig: 338,
                  oelig: 339,
                  Scaron: 352,
                  scaron: 353,
                  Yuml: 376,
                  fnof: 402,
                  circ: 710,
                  tilde: 732,
                  Alpha: 913,
                  Beta: 914,
                  Gamma: 915,
                  Delta: 916,
                  Epsilon: 917,
                  Zeta: 918,
                  Eta: 919,
                  Theta: 920,
                  Iota: 921,
                  Kappa: 922,
                  Lambda: 923,
                  Mu: 924,
                  Nu: 925,
                  Xi: 926,
                  Omicron: 927,
                  Pi: 928,
                  Rho: 929,
                  Sigma: 931,
                  Tau: 932,
                  Upsilon: 933,
                  Phi: 934,
                  Chi: 935,
                  Psi: 936,
                  Omega: 937,
                  alpha: 945,
                  beta: 946,
                  gamma: 947,
                  delta: 948,
                  epsilon: 949,
                  zeta: 950,
                  eta: 951,
                  theta: 952,
                  iota: 953,
                  kappa: 954,
                  lambda: 955,
                  mu: 956,
                  nu: 957,
                  xi: 958,
                  omicron: 959,
                  pi: 960,
                  rho: 961,
                  sigmaf: 962,
                  sigma: 963,
                  tau: 964,
                  upsilon: 965,
                  phi: 966,
                  chi: 967,
                  psi: 968,
                  omega: 969,
                  thetasym: 977,
                  upsih: 978,
                  piv: 982,
                  ensp: 8194,
                  emsp: 8195,
                  thinsp: 8201,
                  zwnj: 8204,
                  zwj: 8205,
                  lrm: 8206,
                  rlm: 8207,
                  ndash: 8211,
                  mdash: 8212,
                  lsquo: 8216,
                  rsquo: 8217,
                  sbquo: 8218,
                  ldquo: 8220,
                  rdquo: 8221,
                  bdquo: 8222,
                  dagger: 8224,
                  Dagger: 8225,
                  bull: 8226,
                  hellip: 8230,
                  permil: 8240,
                  prime: 8242,
                  Prime: 8243,
                  lsaquo: 8249,
                  rsaquo: 8250,
                  oline: 8254,
                  frasl: 8260,
                  euro: 8364,
                  image: 8465,
                  weierp: 8472,
                  real: 8476,
                  trade: 8482,
                  alefsym: 8501,
                  larr: 8592,
                  uarr: 8593,
                  rarr: 8594,
                  darr: 8595,
                  harr: 8596,
                  crarr: 8629,
                  lArr: 8656,
                  uArr: 8657,
                  rArr: 8658,
                  dArr: 8659,
                  hArr: 8660,
                  forall: 8704,
                  part: 8706,
                  exist: 8707,
                  empty: 8709,
                  nabla: 8711,
                  isin: 8712,
                  notin: 8713,
                  ni: 8715,
                  prod: 8719,
                  sum: 8721,
                  minus: 8722,
                  lowast: 8727,
                  radic: 8730,
                  prop: 8733,
                  infin: 8734,
                  ang: 8736,
                  and: 8743,
                  or: 8744,
                  cap: 8745,
                  cup: 8746,
                  int: 8747,
                  there4: 8756,
                  sim: 8764,
                  cong: 8773,
                  asymp: 8776,
                  ne: 8800,
                  equiv: 8801,
                  le: 8804,
                  ge: 8805,
                  sub: 8834,
                  sup: 8835,
                  nsub: 8836,
                  sube: 8838,
                  supe: 8839,
                  oplus: 8853,
                  otimes: 8855,
                  perp: 8869,
                  sdot: 8901,
                  lceil: 8968,
                  rceil: 8969,
                  lfloor: 8970,
                  rfloor: 8971,
                  lang: 9001,
                  rang: 9002,
                  loz: 9674,
                  spades: 9824,
                  clubs: 9827,
                  hearts: 9829,
                  diams: 9830
                };
                Object.keys(sax.ENTITIES).forEach(function(key) {
                  var e = sax.ENTITIES[key];
                  var s2 = typeof e === "number" ? String.fromCharCode(e) : e;
                  sax.ENTITIES[key] = s2;
                });
                for (var s in sax.STATE) {
                  sax.STATE[sax.STATE[s]] = s;
                }
                S = sax.STATE;
                function emit(parser2, event, data) {
                  parser2[event] && parser2[event](data);
                }
                function getDeclaredEncoding(body) {
                  var match = body && body.match(/(?:^|\s)encoding\s*=\s*(['"])([^'"]+)\1/i);
                  return match ? match[2] : null;
                }
                function normalizeEncodingName(encoding) {
                  if (!encoding) {
                    return null;
                  }
                  return encoding.toLowerCase().replace(/[^a-z0-9]/g, "");
                }
                function encodingsMatch(detectedEncoding, declaredEncoding) {
                  const detected = normalizeEncodingName(detectedEncoding);
                  const declared = normalizeEncodingName(declaredEncoding);
                  if (!detected || !declared) {
                    return true;
                  }
                  if (declared === "utf16") {
                    return detected === "utf16le" || detected === "utf16be";
                  }
                  return detected === declared;
                }
                function validateXmlDeclarationEncoding(parser2, data) {
                  if (!parser2.strict || !parser2.encoding || !data || data.name !== "xml") {
                    return;
                  }
                  var declaredEncoding = getDeclaredEncoding(data.body);
                  if (declaredEncoding && !encodingsMatch(parser2.encoding, declaredEncoding)) {
                    strictFail(
                      parser2,
                      "XML declaration encoding " + declaredEncoding + " does not match detected stream encoding " + parser2.encoding.toUpperCase()
                    );
                  }
                }
                function emitNode(parser2, nodeType, data) {
                  if (parser2.textNode)
                    closeText(parser2);
                  emit(parser2, nodeType, data);
                }
                function closeText(parser2) {
                  parser2.textNode = textopts(parser2.opt, parser2.textNode);
                  if (parser2.textNode)
                    emit(parser2, "ontext", parser2.textNode);
                  parser2.textNode = "";
                }
                function textopts(opt, text) {
                  if (opt.trim)
                    text = text.trim();
                  if (opt.normalize)
                    text = text.replace(/\s+/g, " ");
                  return text;
                }
                function error(parser2, er) {
                  closeText(parser2);
                  if (parser2.trackPosition) {
                    er += "\nLine: " + parser2.line + "\nColumn: " + parser2.column + "\nChar: " + parser2.c;
                  }
                  er = new Error(er);
                  parser2.error = er;
                  emit(parser2, "onerror", er);
                  return parser2;
                }
                function end(parser2) {
                  if (parser2.sawRoot && !parser2.closedRoot)
                    strictFail(parser2, "Unclosed root tag");
                  if (parser2.state !== S.BEGIN && parser2.state !== S.BEGIN_WHITESPACE && parser2.state !== S.TEXT) {
                    error(parser2, "Unexpected end");
                  }
                  closeText(parser2);
                  parser2.c = "";
                  parser2.closed = true;
                  emit(parser2, "onend");
                  SAXParser.call(parser2, parser2.strict, parser2.opt);
                  return parser2;
                }
                function strictFail(parser2, message) {
                  if (typeof parser2 !== "object" || !(parser2 instanceof SAXParser)) {
                    throw new Error("bad call to strictFail");
                  }
                  if (parser2.strict) {
                    error(parser2, message);
                  }
                }
                function newTag(parser2) {
                  if (!parser2.strict)
                    parser2.tagName = parser2.tagName[parser2.looseCase]();
                  var parent = parser2.tags[parser2.tags.length - 1] || parser2;
                  var tag = parser2.tag = { name: parser2.tagName, attributes: {} };
                  if (parser2.opt.xmlns) {
                    tag.ns = parent.ns;
                  }
                  parser2.attribList.length = 0;
                  emitNode(parser2, "onopentagstart", tag);
                }
                function qname(name, attribute) {
                  var i = name.indexOf(":");
                  var qualName = i < 0 ? ["", name] : name.split(":");
                  var prefix = qualName[0];
                  var local = qualName[1];
                  if (attribute && name === "xmlns") {
                    prefix = "xmlns";
                    local = "";
                  }
                  return { prefix, local };
                }
                function attrib(parser2) {
                  if (!parser2.strict) {
                    parser2.attribName = parser2.attribName[parser2.looseCase]();
                  }
                  if (parser2.attribList.indexOf(parser2.attribName) !== -1 || parser2.tag.attributes.hasOwnProperty(parser2.attribName)) {
                    parser2.attribName = parser2.attribValue = "";
                    return;
                  }
                  if (parser2.opt.xmlns) {
                    var qn = qname(parser2.attribName, true);
                    var prefix = qn.prefix;
                    var local = qn.local;
                    if (prefix === "xmlns") {
                      if (local === "xml" && parser2.attribValue !== XML_NAMESPACE) {
                        strictFail(
                          parser2,
                          "xml: prefix must be bound to " + XML_NAMESPACE + "\nActual: " + parser2.attribValue
                        );
                      } else if (local === "xmlns" && parser2.attribValue !== XMLNS_NAMESPACE) {
                        strictFail(
                          parser2,
                          "xmlns: prefix must be bound to " + XMLNS_NAMESPACE + "\nActual: " + parser2.attribValue
                        );
                      } else {
                        var tag = parser2.tag;
                        var parent = parser2.tags[parser2.tags.length - 1] || parser2;
                        if (tag.ns === parent.ns) {
                          tag.ns = Object.create(parent.ns);
                        }
                        tag.ns[local] = parser2.attribValue;
                      }
                    }
                    parser2.attribList.push([parser2.attribName, parser2.attribValue]);
                  } else {
                    parser2.tag.attributes[parser2.attribName] = parser2.attribValue;
                    emitNode(parser2, "onattribute", {
                      name: parser2.attribName,
                      value: parser2.attribValue
                    });
                  }
                  parser2.attribName = parser2.attribValue = "";
                }
                function openTag(parser2, selfClosing) {
                  if (parser2.opt.xmlns) {
                    var tag = parser2.tag;
                    var qn = qname(parser2.tagName);
                    tag.prefix = qn.prefix;
                    tag.local = qn.local;
                    tag.uri = tag.ns[qn.prefix] || "";
                    if (tag.prefix && !tag.uri) {
                      strictFail(
                        parser2,
                        "Unbound namespace prefix: " + JSON.stringify(parser2.tagName)
                      );
                      tag.uri = qn.prefix;
                    }
                    var parent = parser2.tags[parser2.tags.length - 1] || parser2;
                    if (tag.ns && parent.ns !== tag.ns) {
                      Object.keys(tag.ns).forEach(function(p) {
                        emitNode(parser2, "onopennamespace", {
                          prefix: p,
                          uri: tag.ns[p]
                        });
                      });
                    }
                    for (var i = 0, l = parser2.attribList.length; i < l; i++) {
                      var nv = parser2.attribList[i];
                      var name = nv[0];
                      var value = nv[1];
                      var qualName = qname(name, true);
                      var prefix = qualName.prefix;
                      var local = qualName.local;
                      var uri = prefix === "" ? "" : tag.ns[prefix] || "";
                      var a = {
                        name,
                        value,
                        prefix,
                        local,
                        uri
                      };
                      if (prefix && prefix !== "xmlns" && !uri) {
                        strictFail(
                          parser2,
                          "Unbound namespace prefix: " + JSON.stringify(prefix)
                        );
                        a.uri = prefix;
                      }
                      parser2.tag.attributes[name] = a;
                      emitNode(parser2, "onattribute", a);
                    }
                    parser2.attribList.length = 0;
                  }
                  parser2.tag.isSelfClosing = !!selfClosing;
                  parser2.sawRoot = true;
                  parser2.tags.push(parser2.tag);
                  emitNode(parser2, "onopentag", parser2.tag);
                  if (!selfClosing) {
                    if (!parser2.noscript && parser2.tagName.toLowerCase() === "script") {
                      parser2.state = S.SCRIPT;
                    } else {
                      parser2.state = S.TEXT;
                    }
                    parser2.tag = null;
                    parser2.tagName = "";
                  }
                  parser2.attribName = parser2.attribValue = "";
                  parser2.attribList.length = 0;
                }
                function closeTag(parser2) {
                  if (!parser2.tagName) {
                    strictFail(parser2, "Weird empty close tag.");
                    parser2.textNode += "</>";
                    parser2.state = S.TEXT;
                    return;
                  }
                  if (parser2.script) {
                    if (parser2.tagName !== "script") {
                      parser2.script += "</" + parser2.tagName + ">";
                      parser2.tagName = "";
                      parser2.state = S.SCRIPT;
                      return;
                    }
                    emitNode(parser2, "onscript", parser2.script);
                    parser2.script = "";
                  }
                  var t = parser2.tags.length;
                  var tagName = parser2.tagName;
                  if (!parser2.strict) {
                    tagName = tagName[parser2.looseCase]();
                  }
                  var closeTo = tagName;
                  while (t--) {
                    var close = parser2.tags[t];
                    if (close.name !== closeTo) {
                      strictFail(parser2, "Unexpected close tag");
                    } else {
                      break;
                    }
                  }
                  if (t < 0) {
                    strictFail(parser2, "Unmatched closing tag: " + parser2.tagName);
                    parser2.textNode += "</" + parser2.tagName + ">";
                    parser2.state = S.TEXT;
                    return;
                  }
                  parser2.tagName = tagName;
                  var s2 = parser2.tags.length;
                  while (s2-- > t) {
                    var tag = parser2.tag = parser2.tags.pop();
                    parser2.tagName = parser2.tag.name;
                    emitNode(parser2, "onclosetag", parser2.tagName);
                    var x = {};
                    for (var i in tag.ns) {
                      x[i] = tag.ns[i];
                    }
                    var parent = parser2.tags[parser2.tags.length - 1] || parser2;
                    if (parser2.opt.xmlns && tag.ns !== parent.ns) {
                      Object.keys(tag.ns).forEach(function(p) {
                        var n = tag.ns[p];
                        emitNode(parser2, "onclosenamespace", { prefix: p, uri: n });
                      });
                    }
                  }
                  if (t === 0)
                    parser2.closedRoot = true;
                  parser2.tagName = parser2.attribValue = parser2.attribName = "";
                  parser2.attribList.length = 0;
                  parser2.state = S.TEXT;
                }
                function parseEntity(parser2) {
                  var entity = parser2.entity;
                  var entityLC = entity.toLowerCase();
                  var num;
                  var numStr = "";
                  if (parser2.ENTITIES[entity]) {
                    return parser2.ENTITIES[entity];
                  }
                  if (parser2.ENTITIES[entityLC]) {
                    return parser2.ENTITIES[entityLC];
                  }
                  entity = entityLC;
                  if (entity.charAt(0) === "#") {
                    if (entity.charAt(1) === "x") {
                      entity = entity.slice(2);
                      num = parseInt(entity, 16);
                      numStr = num.toString(16);
                    } else {
                      entity = entity.slice(1);
                      num = parseInt(entity, 10);
                      numStr = num.toString(10);
                    }
                  }
                  entity = entity.replace(/^0+/, "");
                  if (isNaN(num) || numStr.toLowerCase() !== entity || num < 0 || num > 1114111) {
                    strictFail(parser2, "Invalid character entity");
                    return "&" + parser2.entity + ";";
                  }
                  return String.fromCodePoint(num);
                }
                function beginWhiteSpace(parser2, c) {
                  if (c === "<") {
                    parser2.state = S.OPEN_WAKA;
                    parser2.startTagPosition = parser2.position;
                  } else if (!isWhitespace(c)) {
                    strictFail(parser2, "Non-whitespace before first tag.");
                    parser2.textNode = c;
                    parser2.state = S.TEXT;
                  }
                }
                function charAt(chunk, i) {
                  var result = "";
                  if (i < chunk.length) {
                    result = chunk.charAt(i);
                  }
                  return result;
                }
                function write(chunk) {
                  var parser2 = this;
                  if (this.error) {
                    throw this.error;
                  }
                  if (parser2.closed) {
                    return error(
                      parser2,
                      "Cannot write after close. Assign an onready handler."
                    );
                  }
                  if (chunk === null) {
                    return end(parser2);
                  }
                  if (typeof chunk === "object") {
                    chunk = chunk.toString();
                  }
                  var i = 0;
                  var c = "";
                  while (true) {
                    c = charAt(chunk, i++);
                    parser2.c = c;
                    if (!c) {
                      break;
                    }
                    if (parser2.trackPosition) {
                      parser2.position++;
                      if (c === "\n") {
                        parser2.line++;
                        parser2.column = 0;
                      } else {
                        parser2.column++;
                      }
                    }
                    switch (parser2.state) {
                      case S.BEGIN:
                        parser2.state = S.BEGIN_WHITESPACE;
                        if (c === "\uFEFF") {
                          continue;
                        }
                        beginWhiteSpace(parser2, c);
                        continue;
                      case S.BEGIN_WHITESPACE:
                        beginWhiteSpace(parser2, c);
                        continue;
                      case S.TEXT:
                        if (parser2.sawRoot && !parser2.closedRoot) {
                          var starti = i - 1;
                          while (c && c !== "<" && c !== "&") {
                            c = charAt(chunk, i++);
                            if (c && parser2.trackPosition) {
                              parser2.position++;
                              if (c === "\n") {
                                parser2.line++;
                                parser2.column = 0;
                              } else {
                                parser2.column++;
                              }
                            }
                          }
                          parser2.textNode += chunk.substring(starti, i - 1);
                        }
                        if (c === "<" && !(parser2.sawRoot && parser2.closedRoot && !parser2.strict)) {
                          parser2.state = S.OPEN_WAKA;
                          parser2.startTagPosition = parser2.position;
                        } else {
                          if (!isWhitespace(c) && (!parser2.sawRoot || parser2.closedRoot)) {
                            strictFail(parser2, "Text data outside of root node.");
                          }
                          if (c === "&") {
                            parser2.state = S.TEXT_ENTITY;
                          } else {
                            parser2.textNode += c;
                          }
                        }
                        continue;
                      case S.SCRIPT:
                        if (c === "<") {
                          parser2.state = S.SCRIPT_ENDING;
                        } else {
                          parser2.script += c;
                        }
                        continue;
                      case S.SCRIPT_ENDING:
                        if (c === "/") {
                          parser2.state = S.CLOSE_TAG;
                        } else {
                          parser2.script += "<" + c;
                          parser2.state = S.SCRIPT;
                        }
                        continue;
                      case S.OPEN_WAKA:
                        if (c === "!") {
                          parser2.state = S.SGML_DECL;
                          parser2.sgmlDecl = "";
                        } else if (isWhitespace(c)) {
                        } else if (isMatch(nameStart, c)) {
                          parser2.state = S.OPEN_TAG;
                          parser2.tagName = c;
                        } else if (c === "/") {
                          parser2.state = S.CLOSE_TAG;
                          parser2.tagName = "";
                        } else if (c === "?") {
                          parser2.state = S.PROC_INST;
                          parser2.procInstName = parser2.procInstBody = "";
                        } else {
                          strictFail(parser2, "Unencoded <");
                          if (parser2.startTagPosition + 1 < parser2.position) {
                            var pad = parser2.position - parser2.startTagPosition;
                            c = new Array(pad).join(" ") + c;
                          }
                          parser2.textNode += "<" + c;
                          parser2.state = S.TEXT;
                        }
                        continue;
                      case S.SGML_DECL:
                        if (parser2.sgmlDecl + c === "--") {
                          parser2.state = S.COMMENT;
                          parser2.comment = "";
                          parser2.sgmlDecl = "";
                          continue;
                        }
                        if (parser2.doctype && parser2.doctype !== true && parser2.sgmlDecl) {
                          parser2.state = S.DOCTYPE_DTD;
                          parser2.doctype += "<!" + parser2.sgmlDecl + c;
                          parser2.sgmlDecl = "";
                        } else if ((parser2.sgmlDecl + c).toUpperCase() === CDATA) {
                          emitNode(parser2, "onopencdata");
                          parser2.state = S.CDATA;
                          parser2.sgmlDecl = "";
                          parser2.cdata = "";
                        } else if ((parser2.sgmlDecl + c).toUpperCase() === DOCTYPE) {
                          parser2.state = S.DOCTYPE;
                          if (parser2.doctype || parser2.sawRoot) {
                            strictFail(
                              parser2,
                              "Inappropriately located doctype declaration"
                            );
                          }
                          parser2.doctype = "";
                          parser2.sgmlDecl = "";
                        } else if (c === ">") {
                          emitNode(parser2, "onsgmldeclaration", parser2.sgmlDecl);
                          parser2.sgmlDecl = "";
                          parser2.state = S.TEXT;
                        } else if (isQuote(c)) {
                          parser2.state = S.SGML_DECL_QUOTED;
                          parser2.sgmlDecl += c;
                        } else {
                          parser2.sgmlDecl += c;
                        }
                        continue;
                      case S.SGML_DECL_QUOTED:
                        if (c === parser2.q) {
                          parser2.state = S.SGML_DECL;
                          parser2.q = "";
                        }
                        parser2.sgmlDecl += c;
                        continue;
                      case S.DOCTYPE:
                        if (c === ">") {
                          parser2.state = S.TEXT;
                          emitNode(parser2, "ondoctype", parser2.doctype);
                          parser2.doctype = true;
                        } else {
                          parser2.doctype += c;
                          if (c === "[") {
                            parser2.state = S.DOCTYPE_DTD;
                          } else if (isQuote(c)) {
                            parser2.state = S.DOCTYPE_QUOTED;
                            parser2.q = c;
                          }
                        }
                        continue;
                      case S.DOCTYPE_QUOTED:
                        parser2.doctype += c;
                        if (c === parser2.q) {
                          parser2.q = "";
                          parser2.state = S.DOCTYPE;
                        }
                        continue;
                      case S.DOCTYPE_DTD:
                        if (c === "]") {
                          parser2.doctype += c;
                          parser2.state = S.DOCTYPE;
                        } else if (c === "<") {
                          parser2.state = S.OPEN_WAKA;
                          parser2.startTagPosition = parser2.position;
                        } else if (isQuote(c)) {
                          parser2.doctype += c;
                          parser2.state = S.DOCTYPE_DTD_QUOTED;
                          parser2.q = c;
                        } else {
                          parser2.doctype += c;
                        }
                        continue;
                      case S.DOCTYPE_DTD_QUOTED:
                        parser2.doctype += c;
                        if (c === parser2.q) {
                          parser2.state = S.DOCTYPE_DTD;
                          parser2.q = "";
                        }
                        continue;
                      case S.COMMENT:
                        if (c === "-") {
                          parser2.state = S.COMMENT_ENDING;
                        } else {
                          parser2.comment += c;
                        }
                        continue;
                      case S.COMMENT_ENDING:
                        if (c === "-") {
                          parser2.state = S.COMMENT_ENDED;
                          parser2.comment = textopts(parser2.opt, parser2.comment);
                          if (parser2.comment) {
                            emitNode(parser2, "oncomment", parser2.comment);
                          }
                          parser2.comment = "";
                        } else {
                          parser2.comment += "-" + c;
                          parser2.state = S.COMMENT;
                        }
                        continue;
                      case S.COMMENT_ENDED:
                        if (c !== ">") {
                          strictFail(parser2, "Malformed comment");
                          parser2.comment += "--" + c;
                          parser2.state = S.COMMENT;
                        } else if (parser2.doctype && parser2.doctype !== true) {
                          parser2.state = S.DOCTYPE_DTD;
                        } else {
                          parser2.state = S.TEXT;
                        }
                        continue;
                      case S.CDATA:
                        var starti = i - 1;
                        while (c && c !== "]") {
                          c = charAt(chunk, i++);
                          if (c && parser2.trackPosition) {
                            parser2.position++;
                            if (c === "\n") {
                              parser2.line++;
                              parser2.column = 0;
                            } else {
                              parser2.column++;
                            }
                          }
                        }
                        parser2.cdata += chunk.substring(starti, i - 1);
                        if (c === "]") {
                          parser2.state = S.CDATA_ENDING;
                        }
                        continue;
                      case S.CDATA_ENDING:
                        if (c === "]") {
                          parser2.state = S.CDATA_ENDING_2;
                        } else {
                          parser2.cdata += "]" + c;
                          parser2.state = S.CDATA;
                        }
                        continue;
                      case S.CDATA_ENDING_2:
                        if (c === ">") {
                          if (parser2.cdata) {
                            emitNode(parser2, "oncdata", parser2.cdata);
                          }
                          emitNode(parser2, "onclosecdata");
                          parser2.cdata = "";
                          parser2.state = S.TEXT;
                        } else if (c === "]") {
                          parser2.cdata += "]";
                        } else {
                          parser2.cdata += "]]" + c;
                          parser2.state = S.CDATA;
                        }
                        continue;
                      case S.PROC_INST:
                        if (c === "?") {
                          parser2.state = S.PROC_INST_ENDING;
                        } else if (isWhitespace(c)) {
                          parser2.state = S.PROC_INST_BODY;
                        } else {
                          parser2.procInstName += c;
                        }
                        continue;
                      case S.PROC_INST_BODY:
                        if (!parser2.procInstBody && isWhitespace(c)) {
                          continue;
                        } else if (c === "?") {
                          parser2.state = S.PROC_INST_ENDING;
                        } else {
                          parser2.procInstBody += c;
                        }
                        continue;
                      case S.PROC_INST_ENDING:
                        if (c === ">") {
                          const procInstEndData = {
                            name: parser2.procInstName,
                            body: parser2.procInstBody
                          };
                          validateXmlDeclarationEncoding(parser2, procInstEndData);
                          emitNode(parser2, "onprocessinginstruction", procInstEndData);
                          parser2.procInstName = parser2.procInstBody = "";
                          parser2.state = S.TEXT;
                        } else {
                          parser2.procInstBody += "?" + c;
                          parser2.state = S.PROC_INST_BODY;
                        }
                        continue;
                      case S.OPEN_TAG:
                        if (isMatch(nameBody, c)) {
                          parser2.tagName += c;
                        } else {
                          newTag(parser2);
                          if (c === ">") {
                            openTag(parser2);
                          } else if (c === "/") {
                            parser2.state = S.OPEN_TAG_SLASH;
                          } else {
                            if (!isWhitespace(c)) {
                              strictFail(parser2, "Invalid character in tag name");
                            }
                            parser2.state = S.ATTRIB;
                          }
                        }
                        continue;
                      case S.OPEN_TAG_SLASH:
                        if (c === ">") {
                          openTag(parser2, true);
                          closeTag(parser2);
                        } else {
                          strictFail(
                            parser2,
                            "Forward-slash in opening tag not followed by >"
                          );
                          parser2.state = S.ATTRIB;
                        }
                        continue;
                      case S.ATTRIB:
                        if (isWhitespace(c)) {
                          continue;
                        } else if (c === ">") {
                          openTag(parser2);
                        } else if (c === "/") {
                          parser2.state = S.OPEN_TAG_SLASH;
                        } else if (isMatch(nameStart, c)) {
                          parser2.attribName = c;
                          parser2.attribValue = "";
                          parser2.state = S.ATTRIB_NAME;
                        } else {
                          strictFail(parser2, "Invalid attribute name");
                        }
                        continue;
                      case S.ATTRIB_NAME:
                        if (c === "=") {
                          parser2.state = S.ATTRIB_VALUE;
                        } else if (c === ">") {
                          strictFail(parser2, "Attribute without value");
                          parser2.attribValue = parser2.attribName;
                          attrib(parser2);
                          openTag(parser2);
                        } else if (isWhitespace(c)) {
                          parser2.state = S.ATTRIB_NAME_SAW_WHITE;
                        } else if (isMatch(nameBody, c)) {
                          parser2.attribName += c;
                        } else {
                          strictFail(parser2, "Invalid attribute name");
                        }
                        continue;
                      case S.ATTRIB_NAME_SAW_WHITE:
                        if (c === "=") {
                          parser2.state = S.ATTRIB_VALUE;
                        } else if (isWhitespace(c)) {
                          continue;
                        } else {
                          strictFail(parser2, "Attribute without value");
                          parser2.tag.attributes[parser2.attribName] = "";
                          parser2.attribValue = "";
                          emitNode(parser2, "onattribute", {
                            name: parser2.attribName,
                            value: ""
                          });
                          parser2.attribName = "";
                          if (c === ">") {
                            openTag(parser2);
                          } else if (isMatch(nameStart, c)) {
                            parser2.attribName = c;
                            parser2.state = S.ATTRIB_NAME;
                          } else {
                            strictFail(parser2, "Invalid attribute name");
                            parser2.state = S.ATTRIB;
                          }
                        }
                        continue;
                      case S.ATTRIB_VALUE:
                        if (isWhitespace(c)) {
                          continue;
                        } else if (isQuote(c)) {
                          parser2.q = c;
                          parser2.state = S.ATTRIB_VALUE_QUOTED;
                        } else {
                          if (!parser2.opt.unquotedAttributeValues) {
                            error(parser2, "Unquoted attribute value");
                          }
                          parser2.state = S.ATTRIB_VALUE_UNQUOTED;
                          parser2.attribValue = c;
                        }
                        continue;
                      case S.ATTRIB_VALUE_QUOTED:
                        if (c !== parser2.q) {
                          if (c === "&") {
                            parser2.state = S.ATTRIB_VALUE_ENTITY_Q;
                          } else {
                            parser2.attribValue += c;
                          }
                          continue;
                        }
                        attrib(parser2);
                        parser2.q = "";
                        parser2.state = S.ATTRIB_VALUE_CLOSED;
                        continue;
                      case S.ATTRIB_VALUE_CLOSED:
                        if (isWhitespace(c)) {
                          parser2.state = S.ATTRIB;
                        } else if (c === ">") {
                          openTag(parser2);
                        } else if (c === "/") {
                          parser2.state = S.OPEN_TAG_SLASH;
                        } else if (isMatch(nameStart, c)) {
                          strictFail(parser2, "No whitespace between attributes");
                          parser2.attribName = c;
                          parser2.attribValue = "";
                          parser2.state = S.ATTRIB_NAME;
                        } else {
                          strictFail(parser2, "Invalid attribute name");
                        }
                        continue;
                      case S.ATTRIB_VALUE_UNQUOTED:
                        if (!isAttribEnd(c)) {
                          if (c === "&") {
                            parser2.state = S.ATTRIB_VALUE_ENTITY_U;
                          } else {
                            parser2.attribValue += c;
                          }
                          continue;
                        }
                        attrib(parser2);
                        if (c === ">") {
                          openTag(parser2);
                        } else {
                          parser2.state = S.ATTRIB;
                        }
                        continue;
                      case S.CLOSE_TAG:
                        if (!parser2.tagName) {
                          if (isWhitespace(c)) {
                            continue;
                          } else if (notMatch(nameStart, c)) {
                            if (parser2.script) {
                              parser2.script += "</" + c;
                              parser2.state = S.SCRIPT;
                            } else {
                              strictFail(parser2, "Invalid tagname in closing tag.");
                            }
                          } else {
                            parser2.tagName = c;
                          }
                        } else if (c === ">") {
                          closeTag(parser2);
                        } else if (isMatch(nameBody, c)) {
                          parser2.tagName += c;
                        } else if (parser2.script) {
                          parser2.script += "</" + parser2.tagName + c;
                          parser2.tagName = "";
                          parser2.state = S.SCRIPT;
                        } else {
                          if (!isWhitespace(c)) {
                            strictFail(parser2, "Invalid tagname in closing tag");
                          }
                          parser2.state = S.CLOSE_TAG_SAW_WHITE;
                        }
                        continue;
                      case S.CLOSE_TAG_SAW_WHITE:
                        if (isWhitespace(c)) {
                          continue;
                        }
                        if (c === ">") {
                          closeTag(parser2);
                        } else {
                          strictFail(parser2, "Invalid characters in closing tag");
                        }
                        continue;
                      case S.TEXT_ENTITY:
                      case S.ATTRIB_VALUE_ENTITY_Q:
                      case S.ATTRIB_VALUE_ENTITY_U:
                        var returnState;
                        var buffer;
                        switch (parser2.state) {
                          case S.TEXT_ENTITY:
                            returnState = S.TEXT;
                            buffer = "textNode";
                            break;
                          case S.ATTRIB_VALUE_ENTITY_Q:
                            returnState = S.ATTRIB_VALUE_QUOTED;
                            buffer = "attribValue";
                            break;
                          case S.ATTRIB_VALUE_ENTITY_U:
                            returnState = S.ATTRIB_VALUE_UNQUOTED;
                            buffer = "attribValue";
                            break;
                        }
                        if (c === ";") {
                          var parsedEntity = parseEntity(parser2);
                          if (parser2.opt.unparsedEntities && !Object.values(sax.XML_ENTITIES).includes(parsedEntity)) {
                            if ((parser2.entityCount += 1) > parser2.opt.maxEntityCount) {
                              error(
                                parser2,
                                "Parsed entity count exceeds max entity count"
                              );
                            }
                            if ((parser2.entityDepth += 1) > parser2.opt.maxEntityDepth) {
                              error(
                                parser2,
                                "Parsed entity depth exceeds max entity depth"
                              );
                            }
                            parser2.entity = "";
                            parser2.state = returnState;
                            parser2.write(parsedEntity);
                            parser2.entityDepth -= 1;
                          } else {
                            parser2[buffer] += parsedEntity;
                            parser2.entity = "";
                            parser2.state = returnState;
                          }
                        } else if (isMatch(parser2.entity.length ? entityBody : entityStart, c)) {
                          parser2.entity += c;
                        } else {
                          strictFail(parser2, "Invalid character in entity name");
                          parser2[buffer] += "&" + parser2.entity + c;
                          parser2.entity = "";
                          parser2.state = returnState;
                        }
                        continue;
                      default: {
                        throw new Error(parser2, "Unknown state: " + parser2.state);
                      }
                    }
                  }
                  if (parser2.position >= parser2.bufferCheckPosition) {
                    checkBufferLength(parser2);
                  }
                  return parser2;
                }
                if (!String.fromCodePoint) {
                  ;
                  (function() {
                    var stringFromCharCode = String.fromCharCode;
                    var floor = Math.floor;
                    var fromCodePoint = function() {
                      var MAX_SIZE = 16384;
                      var codeUnits = [];
                      var highSurrogate;
                      var lowSurrogate;
                      var index = -1;
                      var length = arguments.length;
                      if (!length) {
                        return "";
                      }
                      var result = "";
                      while (++index < length) {
                        var codePoint = Number(arguments[index]);
                        if (!isFinite(codePoint) || // `NaN`, `+Infinity`, or `-Infinity`
                        codePoint < 0 || // not a valid Unicode code point
                        codePoint > 1114111 || // not a valid Unicode code point
                        floor(codePoint) !== codePoint) {
                          throw RangeError("Invalid code point: " + codePoint);
                        }
                        if (codePoint <= 65535) {
                          codeUnits.push(codePoint);
                        } else {
                          codePoint -= 65536;
                          highSurrogate = (codePoint >> 10) + 55296;
                          lowSurrogate = codePoint % 1024 + 56320;
                          codeUnits.push(highSurrogate, lowSurrogate);
                        }
                        if (index + 1 === length || codeUnits.length > MAX_SIZE) {
                          result += stringFromCharCode.apply(null, codeUnits);
                          codeUnits.length = 0;
                        }
                      }
                      return result;
                    };
                    if (Object.defineProperty) {
                      Object.defineProperty(String, "fromCodePoint", {
                        value: fromCodePoint,
                        configurable: true,
                        writable: true
                      });
                    } else {
                      String.fromCodePoint = fromCodePoint;
                    }
                  })();
                }
              })(typeof exports === "undefined" ? exports.sax = {} : exports);
            }
          });
          var require_bom = __commonJS({
            "node_modules/.pnpm/xml2js@0.5.0/node_modules/xml2js/lib/bom.js"(exports) {
              (function() {
                "use strict";
                exports.stripBOM = function(str) {
                  if (str[0] === "\uFEFF") {
                    return str.substring(1);
                  } else {
                    return str;
                  }
                };
              }).call(exports);
            }
          });
          var require_processors = __commonJS({
            "node_modules/.pnpm/xml2js@0.5.0/node_modules/xml2js/lib/processors.js"(exports) {
              (function() {
                "use strict";
                var prefixMatch;
                prefixMatch = new RegExp(/(?!xmlns)^.*:/);
                exports.normalize = function(str) {
                  return str.toLowerCase();
                };
                exports.firstCharLowerCase = function(str) {
                  return str.charAt(0).toLowerCase() + str.slice(1);
                };
                exports.stripPrefix = function(str) {
                  return str.replace(prefixMatch, "");
                };
                exports.parseNumbers = function(str) {
                  if (!isNaN(str)) {
                    str = str % 1 === 0 ? parseInt(str, 10) : parseFloat(str);
                  }
                  return str;
                };
                exports.parseBooleans = function(str) {
                  if (/^(?:true|false)$/i.test(str)) {
                    str = str.toLowerCase() === "true";
                  }
                  return str;
                };
              }).call(exports);
            }
          });
          var require_parser = __commonJS({
            "node_modules/.pnpm/xml2js@0.5.0/node_modules/xml2js/lib/parser.js"(exports) {
              (function() {
                "use strict";
                var bom, defaults, events, isEmpty, processItem, processors, sax, setImmediate, bind = function(fn, me) {
                  return function() {
                    return fn.apply(me, arguments);
                  };
                }, extend = function(child, parent) {
                  for (var key in parent) {
                    if (hasProp.call(parent, key))
                      child[key] = parent[key];
                  }
                  function ctor() {
                    this.constructor = child;
                  }
                  ctor.prototype = parent.prototype;
                  child.prototype = new ctor();
                  child.__super__ = parent.prototype;
                  return child;
                }, hasProp = {}.hasOwnProperty;
                sax = require_sax();
                events = __require2("events");
                bom = require_bom();
                processors = require_processors();
                setImmediate = __require2("timers").setImmediate;
                defaults = require_defaults().defaults;
                isEmpty = function(thing) {
                  return typeof thing === "object" && thing != null && Object.keys(thing).length === 0;
                };
                processItem = function(processors2, item, key) {
                  var i, len, process2;
                  for (i = 0, len = processors2.length; i < len; i++) {
                    process2 = processors2[i];
                    item = process2(item, key);
                  }
                  return item;
                };
                exports.Parser = function(superClass) {
                  extend(Parser2, superClass);
                  function Parser2(opts) {
                    this.parseStringPromise = bind(this.parseStringPromise, this);
                    this.parseString = bind(this.parseString, this);
                    this.reset = bind(this.reset, this);
                    this.assignOrPush = bind(this.assignOrPush, this);
                    this.processAsync = bind(this.processAsync, this);
                    var key, ref, value;
                    if (!(this instanceof exports.Parser)) {
                      return new exports.Parser(opts);
                    }
                    this.options = {};
                    ref = defaults["0.2"];
                    for (key in ref) {
                      if (!hasProp.call(ref, key))
                        continue;
                      value = ref[key];
                      this.options[key] = value;
                    }
                    for (key in opts) {
                      if (!hasProp.call(opts, key))
                        continue;
                      value = opts[key];
                      this.options[key] = value;
                    }
                    if (this.options.xmlns) {
                      this.options.xmlnskey = this.options.attrkey + "ns";
                    }
                    if (this.options.normalizeTags) {
                      if (!this.options.tagNameProcessors) {
                        this.options.tagNameProcessors = [];
                      }
                      this.options.tagNameProcessors.unshift(processors.normalize);
                    }
                    this.reset();
                  }
                  Parser2.prototype.processAsync = function() {
                    var chunk, err;
                    try {
                      if (this.remaining.length <= this.options.chunkSize) {
                        chunk = this.remaining;
                        this.remaining = "";
                        this.saxParser = this.saxParser.write(chunk);
                        return this.saxParser.close();
                      } else {
                        chunk = this.remaining.substr(0, this.options.chunkSize);
                        this.remaining = this.remaining.substr(this.options.chunkSize, this.remaining.length);
                        this.saxParser = this.saxParser.write(chunk);
                        return setImmediate(this.processAsync);
                      }
                    } catch (error1) {
                      err = error1;
                      if (!this.saxParser.errThrown) {
                        this.saxParser.errThrown = true;
                        return this.emit(err);
                      }
                    }
                  };
                  Parser2.prototype.assignOrPush = function(obj, key, newValue) {
                    if (!(key in obj)) {
                      if (!this.options.explicitArray) {
                        return obj[key] = newValue;
                      } else {
                        return obj[key] = [newValue];
                      }
                    } else {
                      if (!(obj[key] instanceof Array)) {
                        obj[key] = [obj[key]];
                      }
                      return obj[key].push(newValue);
                    }
                  };
                  Parser2.prototype.reset = function() {
                    var attrkey, charkey, ontext, stack;
                    this.removeAllListeners();
                    this.saxParser = sax.parser(this.options.strict, {
                      trim: false,
                      normalize: false,
                      xmlns: this.options.xmlns
                    });
                    this.saxParser.errThrown = false;
                    this.saxParser.onerror = /* @__PURE__ */ function(_this) {
                      return function(error) {
                        _this.saxParser.resume();
                        if (!_this.saxParser.errThrown) {
                          _this.saxParser.errThrown = true;
                          return _this.emit("error", error);
                        }
                      };
                    }(this);
                    this.saxParser.onend = /* @__PURE__ */ function(_this) {
                      return function() {
                        if (!_this.saxParser.ended) {
                          _this.saxParser.ended = true;
                          return _this.emit("end", _this.resultObject);
                        }
                      };
                    }(this);
                    this.saxParser.ended = false;
                    this.EXPLICIT_CHARKEY = this.options.explicitCharkey;
                    this.resultObject = null;
                    stack = [];
                    attrkey = this.options.attrkey;
                    charkey = this.options.charkey;
                    this.saxParser.onopentag = /* @__PURE__ */ function(_this) {
                      return function(node) {
                        var key, newValue, obj, processedKey, ref;
                        obj = /* @__PURE__ */ Object.create(null);
                        obj[charkey] = "";
                        if (!_this.options.ignoreAttrs) {
                          ref = node.attributes;
                          for (key in ref) {
                            if (!hasProp.call(ref, key))
                              continue;
                            if (!(attrkey in obj) && !_this.options.mergeAttrs) {
                              obj[attrkey] = /* @__PURE__ */ Object.create(null);
                            }
                            newValue = _this.options.attrValueProcessors ? processItem(_this.options.attrValueProcessors, node.attributes[key], key) : node.attributes[key];
                            processedKey = _this.options.attrNameProcessors ? processItem(_this.options.attrNameProcessors, key) : key;
                            if (_this.options.mergeAttrs) {
                              _this.assignOrPush(obj, processedKey, newValue);
                            } else {
                              obj[attrkey][processedKey] = newValue;
                            }
                          }
                        }
                        obj["#name"] = _this.options.tagNameProcessors ? processItem(_this.options.tagNameProcessors, node.name) : node.name;
                        if (_this.options.xmlns) {
                          obj[_this.options.xmlnskey] = {
                            uri: node.uri,
                            local: node.local
                          };
                        }
                        return stack.push(obj);
                      };
                    }(this);
                    this.saxParser.onclosetag = /* @__PURE__ */ function(_this) {
                      return function() {
                        var cdata, emptyStr, key, node, nodeName, obj, objClone, old, s, xpath;
                        obj = stack.pop();
                        nodeName = obj["#name"];
                        if (!_this.options.explicitChildren || !_this.options.preserveChildrenOrder) {
                          delete obj["#name"];
                        }
                        if (obj.cdata === true) {
                          cdata = obj.cdata;
                          delete obj.cdata;
                        }
                        s = stack[stack.length - 1];
                        if (obj[charkey].match(/^\s*$/) && !cdata) {
                          emptyStr = obj[charkey];
                          delete obj[charkey];
                        } else {
                          if (_this.options.trim) {
                            obj[charkey] = obj[charkey].trim();
                          }
                          if (_this.options.normalize) {
                            obj[charkey] = obj[charkey].replace(/\s{2,}/g, " ").trim();
                          }
                          obj[charkey] = _this.options.valueProcessors ? processItem(_this.options.valueProcessors, obj[charkey], nodeName) : obj[charkey];
                          if (Object.keys(obj).length === 1 && charkey in obj && !_this.EXPLICIT_CHARKEY) {
                            obj = obj[charkey];
                          }
                        }
                        if (isEmpty(obj)) {
                          if (typeof _this.options.emptyTag === "function") {
                            obj = _this.options.emptyTag();
                          } else {
                            obj = _this.options.emptyTag !== "" ? _this.options.emptyTag : emptyStr;
                          }
                        }
                        if (_this.options.validator != null) {
                          xpath = "/" + function() {
                            var i, len, results;
                            results = [];
                            for (i = 0, len = stack.length; i < len; i++) {
                              node = stack[i];
                              results.push(node["#name"]);
                            }
                            return results;
                          }().concat(nodeName).join("/");
                          (function() {
                            var err;
                            try {
                              return obj = _this.options.validator(xpath, s && s[nodeName], obj);
                            } catch (error1) {
                              err = error1;
                              return _this.emit("error", err);
                            }
                          })();
                        }
                        if (_this.options.explicitChildren && !_this.options.mergeAttrs && typeof obj === "object") {
                          if (!_this.options.preserveChildrenOrder) {
                            node = /* @__PURE__ */ Object.create(null);
                            if (_this.options.attrkey in obj) {
                              node[_this.options.attrkey] = obj[_this.options.attrkey];
                              delete obj[_this.options.attrkey];
                            }
                            if (!_this.options.charsAsChildren && _this.options.charkey in obj) {
                              node[_this.options.charkey] = obj[_this.options.charkey];
                              delete obj[_this.options.charkey];
                            }
                            if (Object.getOwnPropertyNames(obj).length > 0) {
                              node[_this.options.childkey] = obj;
                            }
                            obj = node;
                          } else if (s) {
                            s[_this.options.childkey] = s[_this.options.childkey] || [];
                            objClone = /* @__PURE__ */ Object.create(null);
                            for (key in obj) {
                              if (!hasProp.call(obj, key))
                                continue;
                              objClone[key] = obj[key];
                            }
                            s[_this.options.childkey].push(objClone);
                            delete obj["#name"];
                            if (Object.keys(obj).length === 1 && charkey in obj && !_this.EXPLICIT_CHARKEY) {
                              obj = obj[charkey];
                            }
                          }
                        }
                        if (stack.length > 0) {
                          return _this.assignOrPush(s, nodeName, obj);
                        } else {
                          if (_this.options.explicitRoot) {
                            old = obj;
                            obj = /* @__PURE__ */ Object.create(null);
                            obj[nodeName] = old;
                          }
                          _this.resultObject = obj;
                          _this.saxParser.ended = true;
                          return _this.emit("end", _this.resultObject);
                        }
                      };
                    }(this);
                    ontext = /* @__PURE__ */ function(_this) {
                      return function(text) {
                        var charChild, s;
                        s = stack[stack.length - 1];
                        if (s) {
                          s[charkey] += text;
                          if (_this.options.explicitChildren && _this.options.preserveChildrenOrder && _this.options.charsAsChildren && (_this.options.includeWhiteChars || text.replace(/\\n/g, "").trim() !== "")) {
                            s[_this.options.childkey] = s[_this.options.childkey] || [];
                            charChild = {
                              "#name": "__text__"
                            };
                            charChild[charkey] = text;
                            if (_this.options.normalize) {
                              charChild[charkey] = charChild[charkey].replace(/\s{2,}/g, " ").trim();
                            }
                            s[_this.options.childkey].push(charChild);
                          }
                          return s;
                        }
                      };
                    }(this);
                    this.saxParser.ontext = ontext;
                    return this.saxParser.oncdata = /* @__PURE__ */ function(_this) {
                      return function(text) {
                        var s;
                        s = ontext(text);
                        if (s) {
                          return s.cdata = true;
                        }
                      };
                    }(this);
                  };
                  Parser2.prototype.parseString = function(str, cb) {
                    var err;
                    if (cb != null && typeof cb === "function") {
                      this.on("end", function(result) {
                        this.reset();
                        return cb(null, result);
                      });
                      this.on("error", function(err2) {
                        this.reset();
                        return cb(err2);
                      });
                    }
                    try {
                      str = str.toString();
                      if (str.trim() === "") {
                        this.emit("end", null);
                        return true;
                      }
                      str = bom.stripBOM(str);
                      if (this.options.async) {
                        this.remaining = str;
                        setImmediate(this.processAsync);
                        return this.saxParser;
                      }
                      return this.saxParser.write(str).close();
                    } catch (error1) {
                      err = error1;
                      if (!(this.saxParser.errThrown || this.saxParser.ended)) {
                        this.emit("error", err);
                        return this.saxParser.errThrown = true;
                      } else if (this.saxParser.ended) {
                        throw err;
                      }
                    }
                  };
                  Parser2.prototype.parseStringPromise = function(str) {
                    return new Promise(/* @__PURE__ */ function(_this) {
                      return function(resolve, reject) {
                        return _this.parseString(str, function(err, value) {
                          if (err) {
                            return reject(err);
                          } else {
                            return resolve(value);
                          }
                        });
                      };
                    }(this));
                  };
                  return Parser2;
                }(events);
                exports.parseString = function(str, a, b) {
                  var cb, options, parser2;
                  if (b != null) {
                    if (typeof b === "function") {
                      cb = b;
                    }
                    if (typeof a === "object") {
                      options = a;
                    }
                  } else {
                    if (typeof a === "function") {
                      cb = a;
                    }
                    options = {};
                  }
                  parser2 = new exports.Parser(options);
                  return parser2.parseString(str, cb);
                };
                exports.parseStringPromise = function(str, a) {
                  var options, parser2;
                  if (typeof a === "object") {
                    options = a;
                  }
                  parser2 = new exports.Parser(options);
                  return parser2.parseStringPromise(str);
                };
              }).call(exports);
            }
          });
          var require_xml2js = __commonJS({
            "node_modules/.pnpm/xml2js@0.5.0/node_modules/xml2js/lib/xml2js.js"(exports) {
              (function() {
                "use strict";
                var builder, defaults, parser2, processors, extend = function(child, parent) {
                  for (var key in parent) {
                    if (hasProp.call(parent, key))
                      child[key] = parent[key];
                  }
                  function ctor() {
                    this.constructor = child;
                  }
                  ctor.prototype = parent.prototype;
                  child.prototype = new ctor();
                  child.__super__ = parent.prototype;
                  return child;
                }, hasProp = {}.hasOwnProperty;
                defaults = require_defaults();
                builder = require_builder();
                parser2 = require_parser();
                processors = require_processors();
                exports.defaults = defaults.defaults;
                exports.processors = processors;
                exports.ValidationError = function(superClass) {
                  extend(ValidationError, superClass);
                  function ValidationError(message) {
                    this.message = message;
                  }
                  return ValidationError;
                }(Error);
                exports.Builder = builder.Builder;
                exports.Parser = parser2.Parser;
                exports.parseString = parser2.parseString;
                exports.parseStringPromise = parser2.parseStringPromise;
              }).call(exports);
            }
          });
          var require_fields = __commonJS({
            "node_modules/.pnpm/rss-parser@3.13.0/node_modules/rss-parser/lib/fields.js"(exports, module) {
              var fields = module.exports = {};
              fields.feed = [
                ["author", "creator"],
                ["dc:publisher", "publisher"],
                ["dc:creator", "creator"],
                ["dc:source", "source"],
                ["dc:title", "title"],
                ["dc:type", "type"],
                "title",
                "description",
                "author",
                "pubDate",
                "webMaster",
                "managingEditor",
                "generator",
                "link",
                "language",
                "copyright",
                "lastBuildDate",
                "docs",
                "generator",
                "ttl",
                "rating",
                "skipHours",
                "skipDays"
              ];
              fields.item = [
                ["author", "creator"],
                ["dc:creator", "creator"],
                ["dc:date", "date"],
                ["dc:language", "language"],
                ["dc:rights", "rights"],
                ["dc:source", "source"],
                ["dc:title", "title"],
                "title",
                "link",
                "pubDate",
                "author",
                "summary",
                ["content:encoded", "content:encoded", { includeSnippet: true }],
                "enclosure",
                "dc:creator",
                "dc:date",
                "comments"
              ];
              var mapItunesField = function(f) {
                return ["itunes:" + f, f];
              };
              fields.podcastFeed = [
                "author",
                "subtitle",
                "summary",
                "explicit"
              ].map(mapItunesField);
              fields.podcastItem = [
                "author",
                "subtitle",
                "summary",
                "explicit",
                "duration",
                "image",
                "episode",
                "image",
                "season",
                "keywords",
                "episodeType"
              ].map(mapItunesField);
            }
          });
          var require_entities = __commonJS({
            "node_modules/.pnpm/entities@2.2.0/node_modules/entities/lib/maps/entities.json"(exports, module) {
              module.exports = { Aacute: "\xC1", aacute: "\xE1", Abreve: "\u0102", abreve: "\u0103", ac: "\u223E", acd: "\u223F", acE: "\u223E\u0333", Acirc: "\xC2", acirc: "\xE2", acute: "\xB4", Acy: "\u0410", acy: "\u0430", AElig: "\xC6", aelig: "\xE6", af: "\u2061", Afr: "\u{1D504}", afr: "\u{1D51E}", Agrave: "\xC0", agrave: "\xE0", alefsym: "\u2135", aleph: "\u2135", Alpha: "\u0391", alpha: "\u03B1", Amacr: "\u0100", amacr: "\u0101", amalg: "\u2A3F", amp: "&", AMP: "&", andand: "\u2A55", And: "\u2A53", and: "\u2227", andd: "\u2A5C", andslope: "\u2A58", andv: "\u2A5A", ang: "\u2220", ange: "\u29A4", angle: "\u2220", angmsdaa: "\u29A8", angmsdab: "\u29A9", angmsdac: "\u29AA", angmsdad: "\u29AB", angmsdae: "\u29AC", angmsdaf: "\u29AD", angmsdag: "\u29AE", angmsdah: "\u29AF", angmsd: "\u2221", angrt: "\u221F", angrtvb: "\u22BE", angrtvbd: "\u299D", angsph: "\u2222", angst: "\xC5", angzarr: "\u237C", Aogon: "\u0104", aogon: "\u0105", Aopf: "\u{1D538}", aopf: "\u{1D552}", apacir: "\u2A6F", ap: "\u2248", apE: "\u2A70", ape: "\u224A", apid: "\u224B", apos: "'", ApplyFunction: "\u2061", approx: "\u2248", approxeq: "\u224A", Aring: "\xC5", aring: "\xE5", Ascr: "\u{1D49C}", ascr: "\u{1D4B6}", Assign: "\u2254", ast: "*", asymp: "\u2248", asympeq: "\u224D", Atilde: "\xC3", atilde: "\xE3", Auml: "\xC4", auml: "\xE4", awconint: "\u2233", awint: "\u2A11", backcong: "\u224C", backepsilon: "\u03F6", backprime: "\u2035", backsim: "\u223D", backsimeq: "\u22CD", Backslash: "\u2216", Barv: "\u2AE7", barvee: "\u22BD", barwed: "\u2305", Barwed: "\u2306", barwedge: "\u2305", bbrk: "\u23B5", bbrktbrk: "\u23B6", bcong: "\u224C", Bcy: "\u0411", bcy: "\u0431", bdquo: "\u201E", becaus: "\u2235", because: "\u2235", Because: "\u2235", bemptyv: "\u29B0", bepsi: "\u03F6", bernou: "\u212C", Bernoullis: "\u212C", Beta: "\u0392", beta: "\u03B2", beth: "\u2136", between: "\u226C", Bfr: "\u{1D505}", bfr: "\u{1D51F}", bigcap: "\u22C2", bigcirc: "\u25EF", bigcup: "\u22C3", bigodot: "\u2A00", bigoplus: "\u2A01", bigotimes: "\u2A02", bigsqcup: "\u2A06", bigstar: "\u2605", bigtriangledown: "\u25BD", bigtriangleup: "\u25B3", biguplus: "\u2A04", bigvee: "\u22C1", bigwedge: "\u22C0", bkarow: "\u290D", blacklozenge: "\u29EB", blacksquare: "\u25AA", blacktriangle: "\u25B4", blacktriangledown: "\u25BE", blacktriangleleft: "\u25C2", blacktriangleright: "\u25B8", blank: "\u2423", blk12: "\u2592", blk14: "\u2591", blk34: "\u2593", block: "\u2588", bne: "=\u20E5", bnequiv: "\u2261\u20E5", bNot: "\u2AED", bnot: "\u2310", Bopf: "\u{1D539}", bopf: "\u{1D553}", bot: "\u22A5", bottom: "\u22A5", bowtie: "\u22C8", boxbox: "\u29C9", boxdl: "\u2510", boxdL: "\u2555", boxDl: "\u2556", boxDL: "\u2557", boxdr: "\u250C", boxdR: "\u2552", boxDr: "\u2553", boxDR: "\u2554", boxh: "\u2500", boxH: "\u2550", boxhd: "\u252C", boxHd: "\u2564", boxhD: "\u2565", boxHD: "\u2566", boxhu: "\u2534", boxHu: "\u2567", boxhU: "\u2568", boxHU: "\u2569", boxminus: "\u229F", boxplus: "\u229E", boxtimes: "\u22A0", boxul: "\u2518", boxuL: "\u255B", boxUl: "\u255C", boxUL: "\u255D", boxur: "\u2514", boxuR: "\u2558", boxUr: "\u2559", boxUR: "\u255A", boxv: "\u2502", boxV: "\u2551", boxvh: "\u253C", boxvH: "\u256A", boxVh: "\u256B", boxVH: "\u256C", boxvl: "\u2524", boxvL: "\u2561", boxVl: "\u2562", boxVL: "\u2563", boxvr: "\u251C", boxvR: "\u255E", boxVr: "\u255F", boxVR: "\u2560", bprime: "\u2035", breve: "\u02D8", Breve: "\u02D8", brvbar: "\xA6", bscr: "\u{1D4B7}", Bscr: "\u212C", bsemi: "\u204F", bsim: "\u223D", bsime: "\u22CD", bsolb: "\u29C5", bsol: "\\", bsolhsub: "\u27C8", bull: "\u2022", bullet: "\u2022", bump: "\u224E", bumpE: "\u2AAE", bumpe: "\u224F", Bumpeq: "\u224E", bumpeq: "\u224F", Cacute: "\u0106", cacute: "\u0107", capand: "\u2A44", capbrcup: "\u2A49", capcap: "\u2A4B", cap: "\u2229", Cap: "\u22D2", capcup: "\u2A47", capdot: "\u2A40", CapitalDifferentialD: "\u2145", caps: "\u2229\uFE00", caret: "\u2041", caron: "\u02C7", Cayleys: "\u212D", ccaps: "\u2A4D", Ccaron: "\u010C", ccaron: "\u010D", Ccedil: "\xC7", ccedil: "\xE7", Ccirc: "\u0108", ccirc: "\u0109", Cconint: "\u2230", ccups: "\u2A4C", ccupssm: "\u2A50", Cdot: "\u010A", cdot: "\u010B", cedil: "\xB8", Cedilla: "\xB8", cemptyv: "\u29B2", cent: "\xA2", centerdot: "\xB7", CenterDot: "\xB7", cfr: "\u{1D520}", Cfr: "\u212D", CHcy: "\u0427", chcy: "\u0447", check: "\u2713", checkmark: "\u2713", Chi: "\u03A7", chi: "\u03C7", circ: "\u02C6", circeq: "\u2257", circlearrowleft: "\u21BA", circlearrowright: "\u21BB", circledast: "\u229B", circledcirc: "\u229A", circleddash: "\u229D", CircleDot: "\u2299", circledR: "\xAE", circledS: "\u24C8", CircleMinus: "\u2296", CirclePlus: "\u2295", CircleTimes: "\u2297", cir: "\u25CB", cirE: "\u29C3", cire: "\u2257", cirfnint: "\u2A10", cirmid: "\u2AEF", cirscir: "\u29C2", ClockwiseContourIntegral: "\u2232", CloseCurlyDoubleQuote: "\u201D", CloseCurlyQuote: "\u2019", clubs: "\u2663", clubsuit: "\u2663", colon: ":", Colon: "\u2237", Colone: "\u2A74", colone: "\u2254", coloneq: "\u2254", comma: ",", commat: "@", comp: "\u2201", compfn: "\u2218", complement: "\u2201", complexes: "\u2102", cong: "\u2245", congdot: "\u2A6D", Congruent: "\u2261", conint: "\u222E", Conint: "\u222F", ContourIntegral: "\u222E", copf: "\u{1D554}", Copf: "\u2102", coprod: "\u2210", Coproduct: "\u2210", copy: "\xA9", COPY: "\xA9", copysr: "\u2117", CounterClockwiseContourIntegral: "\u2233", crarr: "\u21B5", cross: "\u2717", Cross: "\u2A2F", Cscr: "\u{1D49E}", cscr: "\u{1D4B8}", csub: "\u2ACF", csube: "\u2AD1", csup: "\u2AD0", csupe: "\u2AD2", ctdot: "\u22EF", cudarrl: "\u2938", cudarrr: "\u2935", cuepr: "\u22DE", cuesc: "\u22DF", cularr: "\u21B6", cularrp: "\u293D", cupbrcap: "\u2A48", cupcap: "\u2A46", CupCap: "\u224D", cup: "\u222A", Cup: "\u22D3", cupcup: "\u2A4A", cupdot: "\u228D", cupor: "\u2A45", cups: "\u222A\uFE00", curarr: "\u21B7", curarrm: "\u293C", curlyeqprec: "\u22DE", curlyeqsucc: "\u22DF", curlyvee: "\u22CE", curlywedge: "\u22CF", curren: "\xA4", curvearrowleft: "\u21B6", curvearrowright: "\u21B7", cuvee: "\u22CE", cuwed: "\u22CF", cwconint: "\u2232", cwint: "\u2231", cylcty: "\u232D", dagger: "\u2020", Dagger: "\u2021", daleth: "\u2138", darr: "\u2193", Darr: "\u21A1", dArr: "\u21D3", dash: "\u2010", Dashv: "\u2AE4", dashv: "\u22A3", dbkarow: "\u290F", dblac: "\u02DD", Dcaron: "\u010E", dcaron: "\u010F", Dcy: "\u0414", dcy: "\u0434", ddagger: "\u2021", ddarr: "\u21CA", DD: "\u2145", dd: "\u2146", DDotrahd: "\u2911", ddotseq: "\u2A77", deg: "\xB0", Del: "\u2207", Delta: "\u0394", delta: "\u03B4", demptyv: "\u29B1", dfisht: "\u297F", Dfr: "\u{1D507}", dfr: "\u{1D521}", dHar: "\u2965", dharl: "\u21C3", dharr: "\u21C2", DiacriticalAcute: "\xB4", DiacriticalDot: "\u02D9", DiacriticalDoubleAcute: "\u02DD", DiacriticalGrave: "`", DiacriticalTilde: "\u02DC", diam: "\u22C4", diamond: "\u22C4", Diamond: "\u22C4", diamondsuit: "\u2666", diams: "\u2666", die: "\xA8", DifferentialD: "\u2146", digamma: "\u03DD", disin: "\u22F2", div: "\xF7", divide: "\xF7", divideontimes: "\u22C7", divonx: "\u22C7", DJcy: "\u0402", djcy: "\u0452", dlcorn: "\u231E", dlcrop: "\u230D", dollar: "$", Dopf: "\u{1D53B}", dopf: "\u{1D555}", Dot: "\xA8", dot: "\u02D9", DotDot: "\u20DC", doteq: "\u2250", doteqdot: "\u2251", DotEqual: "\u2250", dotminus: "\u2238", dotplus: "\u2214", dotsquare: "\u22A1", doublebarwedge: "\u2306", DoubleContourIntegral: "\u222F", DoubleDot: "\xA8", DoubleDownArrow: "\u21D3", DoubleLeftArrow: "\u21D0", DoubleLeftRightArrow: "\u21D4", DoubleLeftTee: "\u2AE4", DoubleLongLeftArrow: "\u27F8", DoubleLongLeftRightArrow: "\u27FA", DoubleLongRightArrow: "\u27F9", DoubleRightArrow: "\u21D2", DoubleRightTee: "\u22A8", DoubleUpArrow: "\u21D1", DoubleUpDownArrow: "\u21D5", DoubleVerticalBar: "\u2225", DownArrowBar: "\u2913", downarrow: "\u2193", DownArrow: "\u2193", Downarrow: "\u21D3", DownArrowUpArrow: "\u21F5", DownBreve: "\u0311", downdownarrows: "\u21CA", downharpoonleft: "\u21C3", downharpoonright: "\u21C2", DownLeftRightVector: "\u2950", DownLeftTeeVector: "\u295E", DownLeftVectorBar: "\u2956", DownLeftVector: "\u21BD", DownRightTeeVector: "\u295F", DownRightVectorBar: "\u2957", DownRightVector: "\u21C1", DownTeeArrow: "\u21A7", DownTee: "\u22A4", drbkarow: "\u2910", drcorn: "\u231F", drcrop: "\u230C", Dscr: "\u{1D49F}", dscr: "\u{1D4B9}", DScy: "\u0405", dscy: "\u0455", dsol: "\u29F6", Dstrok: "\u0110", dstrok: "\u0111", dtdot: "\u22F1", dtri: "\u25BF", dtrif: "\u25BE", duarr: "\u21F5", duhar: "\u296F", dwangle: "\u29A6", DZcy: "\u040F", dzcy: "\u045F", dzigrarr: "\u27FF", Eacute: "\xC9", eacute: "\xE9", easter: "\u2A6E", Ecaron: "\u011A", ecaron: "\u011B", Ecirc: "\xCA", ecirc: "\xEA", ecir: "\u2256", ecolon: "\u2255", Ecy: "\u042D", ecy: "\u044D", eDDot: "\u2A77", Edot: "\u0116", edot: "\u0117", eDot: "\u2251", ee: "\u2147", efDot: "\u2252", Efr: "\u{1D508}", efr: "\u{1D522}", eg: "\u2A9A", Egrave: "\xC8", egrave: "\xE8", egs: "\u2A96", egsdot: "\u2A98", el: "\u2A99", Element: "\u2208", elinters: "\u23E7", ell: "\u2113", els: "\u2A95", elsdot: "\u2A97", Emacr: "\u0112", emacr: "\u0113", empty: "\u2205", emptyset: "\u2205", EmptySmallSquare: "\u25FB", emptyv: "\u2205", EmptyVerySmallSquare: "\u25AB", emsp13: "\u2004", emsp14: "\u2005", emsp: "\u2003", ENG: "\u014A", eng: "\u014B", ensp: "\u2002", Eogon: "\u0118", eogon: "\u0119", Eopf: "\u{1D53C}", eopf: "\u{1D556}", epar: "\u22D5", eparsl: "\u29E3", eplus: "\u2A71", epsi: "\u03B5", Epsilon: "\u0395", epsilon: "\u03B5", epsiv: "\u03F5", eqcirc: "\u2256", eqcolon: "\u2255", eqsim: "\u2242", eqslantgtr: "\u2A96", eqslantless: "\u2A95", Equal: "\u2A75", equals: "=", EqualTilde: "\u2242", equest: "\u225F", Equilibrium: "\u21CC", equiv: "\u2261", equivDD: "\u2A78", eqvparsl: "\u29E5", erarr: "\u2971", erDot: "\u2253", escr: "\u212F", Escr: "\u2130", esdot: "\u2250", Esim: "\u2A73", esim: "\u2242", Eta: "\u0397", eta: "\u03B7", ETH: "\xD0", eth: "\xF0", Euml: "\xCB", euml: "\xEB", euro: "\u20AC", excl: "!", exist: "\u2203", Exists: "\u2203", expectation: "\u2130", exponentiale: "\u2147", ExponentialE: "\u2147", fallingdotseq: "\u2252", Fcy: "\u0424", fcy: "\u0444", female: "\u2640", ffilig: "\uFB03", fflig: "\uFB00", ffllig: "\uFB04", Ffr: "\u{1D509}", ffr: "\u{1D523}", filig: "\uFB01", FilledSmallSquare: "\u25FC", FilledVerySmallSquare: "\u25AA", fjlig: "fj", flat: "\u266D", fllig: "\uFB02", fltns: "\u25B1", fnof: "\u0192", Fopf: "\u{1D53D}", fopf: "\u{1D557}", forall: "\u2200", ForAll: "\u2200", fork: "\u22D4", forkv: "\u2AD9", Fouriertrf: "\u2131", fpartint: "\u2A0D", frac12: "\xBD", frac13: "\u2153", frac14: "\xBC", frac15: "\u2155", frac16: "\u2159", frac18: "\u215B", frac23: "\u2154", frac25: "\u2156", frac34: "\xBE", frac35: "\u2157", frac38: "\u215C", frac45: "\u2158", frac56: "\u215A", frac58: "\u215D", frac78: "\u215E", frasl: "\u2044", frown: "\u2322", fscr: "\u{1D4BB}", Fscr: "\u2131", gacute: "\u01F5", Gamma: "\u0393", gamma: "\u03B3", Gammad: "\u03DC", gammad: "\u03DD", gap: "\u2A86", Gbreve: "\u011E", gbreve: "\u011F", Gcedil: "\u0122", Gcirc: "\u011C", gcirc: "\u011D", Gcy: "\u0413", gcy: "\u0433", Gdot: "\u0120", gdot: "\u0121", ge: "\u2265", gE: "\u2267", gEl: "\u2A8C", gel: "\u22DB", geq: "\u2265", geqq: "\u2267", geqslant: "\u2A7E", gescc: "\u2AA9", ges: "\u2A7E", gesdot: "\u2A80", gesdoto: "\u2A82", gesdotol: "\u2A84", gesl: "\u22DB\uFE00", gesles: "\u2A94", Gfr: "\u{1D50A}", gfr: "\u{1D524}", gg: "\u226B", Gg: "\u22D9", ggg: "\u22D9", gimel: "\u2137", GJcy: "\u0403", gjcy: "\u0453", gla: "\u2AA5", gl: "\u2277", glE: "\u2A92", glj: "\u2AA4", gnap: "\u2A8A", gnapprox: "\u2A8A", gne: "\u2A88", gnE: "\u2269", gneq: "\u2A88", gneqq: "\u2269", gnsim: "\u22E7", Gopf: "\u{1D53E}", gopf: "\u{1D558}", grave: "`", GreaterEqual: "\u2265", GreaterEqualLess: "\u22DB", GreaterFullEqual: "\u2267", GreaterGreater: "\u2AA2", GreaterLess: "\u2277", GreaterSlantEqual: "\u2A7E", GreaterTilde: "\u2273", Gscr: "\u{1D4A2}", gscr: "\u210A", gsim: "\u2273", gsime: "\u2A8E", gsiml: "\u2A90", gtcc: "\u2AA7", gtcir: "\u2A7A", gt: ">", GT: ">", Gt: "\u226B", gtdot: "\u22D7", gtlPar: "\u2995", gtquest: "\u2A7C", gtrapprox: "\u2A86", gtrarr: "\u2978", gtrdot: "\u22D7", gtreqless: "\u22DB", gtreqqless: "\u2A8C", gtrless: "\u2277", gtrsim: "\u2273", gvertneqq: "\u2269\uFE00", gvnE: "\u2269\uFE00", Hacek: "\u02C7", hairsp: "\u200A", half: "\xBD", hamilt: "\u210B", HARDcy: "\u042A", hardcy: "\u044A", harrcir: "\u2948", harr: "\u2194", hArr: "\u21D4", harrw: "\u21AD", Hat: "^", hbar: "\u210F", Hcirc: "\u0124", hcirc: "\u0125", hearts: "\u2665", heartsuit: "\u2665", hellip: "\u2026", hercon: "\u22B9", hfr: "\u{1D525}", Hfr: "\u210C", HilbertSpace: "\u210B", hksearow: "\u2925", hkswarow: "\u2926", hoarr: "\u21FF", homtht: "\u223B", hookleftarrow: "\u21A9", hookrightarrow: "\u21AA", hopf: "\u{1D559}", Hopf: "\u210D", horbar: "\u2015", HorizontalLine: "\u2500", hscr: "\u{1D4BD}", Hscr: "\u210B", hslash: "\u210F", Hstrok: "\u0126", hstrok: "\u0127", HumpDownHump: "\u224E", HumpEqual: "\u224F", hybull: "\u2043", hyphen: "\u2010", Iacute: "\xCD", iacute: "\xED", ic: "\u2063", Icirc: "\xCE", icirc: "\xEE", Icy: "\u0418", icy: "\u0438", Idot: "\u0130", IEcy: "\u0415", iecy: "\u0435", iexcl: "\xA1", iff: "\u21D4", ifr: "\u{1D526}", Ifr: "\u2111", Igrave: "\xCC", igrave: "\xEC", ii: "\u2148", iiiint: "\u2A0C", iiint: "\u222D", iinfin: "\u29DC", iiota: "\u2129", IJlig: "\u0132", ijlig: "\u0133", Imacr: "\u012A", imacr: "\u012B", image: "\u2111", ImaginaryI: "\u2148", imagline: "\u2110", imagpart: "\u2111", imath: "\u0131", Im: "\u2111", imof: "\u22B7", imped: "\u01B5", Implies: "\u21D2", incare: "\u2105", in: "\u2208", infin: "\u221E", infintie: "\u29DD", inodot: "\u0131", intcal: "\u22BA", int: "\u222B", Int: "\u222C", integers: "\u2124", Integral: "\u222B", intercal: "\u22BA", Intersection: "\u22C2", intlarhk: "\u2A17", intprod: "\u2A3C", InvisibleComma: "\u2063", InvisibleTimes: "\u2062", IOcy: "\u0401", iocy: "\u0451", Iogon: "\u012E", iogon: "\u012F", Iopf: "\u{1D540}", iopf: "\u{1D55A}", Iota: "\u0399", iota: "\u03B9", iprod: "\u2A3C", iquest: "\xBF", iscr: "\u{1D4BE}", Iscr: "\u2110", isin: "\u2208", isindot: "\u22F5", isinE: "\u22F9", isins: "\u22F4", isinsv: "\u22F3", isinv: "\u2208", it: "\u2062", Itilde: "\u0128", itilde: "\u0129", Iukcy: "\u0406", iukcy: "\u0456", Iuml: "\xCF", iuml: "\xEF", Jcirc: "\u0134", jcirc: "\u0135", Jcy: "\u0419", jcy: "\u0439", Jfr: "\u{1D50D}", jfr: "\u{1D527}", jmath: "\u0237", Jopf: "\u{1D541}", jopf: "\u{1D55B}", Jscr: "\u{1D4A5}", jscr: "\u{1D4BF}", Jsercy: "\u0408", jsercy: "\u0458", Jukcy: "\u0404", jukcy: "\u0454", Kappa: "\u039A", kappa: "\u03BA", kappav: "\u03F0", Kcedil: "\u0136", kcedil: "\u0137", Kcy: "\u041A", kcy: "\u043A", Kfr: "\u{1D50E}", kfr: "\u{1D528}", kgreen: "\u0138", KHcy: "\u0425", khcy: "\u0445", KJcy: "\u040C", kjcy: "\u045C", Kopf: "\u{1D542}", kopf: "\u{1D55C}", Kscr: "\u{1D4A6}", kscr: "\u{1D4C0}", lAarr: "\u21DA", Lacute: "\u0139", lacute: "\u013A", laemptyv: "\u29B4", lagran: "\u2112", Lambda: "\u039B", lambda: "\u03BB", lang: "\u27E8", Lang: "\u27EA", langd: "\u2991", langle: "\u27E8", lap: "\u2A85", Laplacetrf: "\u2112", laquo: "\xAB", larrb: "\u21E4", larrbfs: "\u291F", larr: "\u2190", Larr: "\u219E", lArr: "\u21D0", larrfs: "\u291D", larrhk: "\u21A9", larrlp: "\u21AB", larrpl: "\u2939", larrsim: "\u2973", larrtl: "\u21A2", latail: "\u2919", lAtail: "\u291B", lat: "\u2AAB", late: "\u2AAD", lates: "\u2AAD\uFE00", lbarr: "\u290C", lBarr: "\u290E", lbbrk: "\u2772", lbrace: "{", lbrack: "[", lbrke: "\u298B", lbrksld: "\u298F", lbrkslu: "\u298D", Lcaron: "\u013D", lcaron: "\u013E", Lcedil: "\u013B", lcedil: "\u013C", lceil: "\u2308", lcub: "{", Lcy: "\u041B", lcy: "\u043B", ldca: "\u2936", ldquo: "\u201C", ldquor: "\u201E", ldrdhar: "\u2967", ldrushar: "\u294B", ldsh: "\u21B2", le: "\u2264", lE: "\u2266", LeftAngleBracket: "\u27E8", LeftArrowBar: "\u21E4", leftarrow: "\u2190", LeftArrow: "\u2190", Leftarrow: "\u21D0", LeftArrowRightArrow: "\u21C6", leftarrowtail: "\u21A2", LeftCeiling: "\u2308", LeftDoubleBracket: "\u27E6", LeftDownTeeVector: "\u2961", LeftDownVectorBar: "\u2959", LeftDownVector: "\u21C3", LeftFloor: "\u230A", leftharpoondown: "\u21BD", leftharpoonup: "\u21BC", leftleftarrows: "\u21C7", leftrightarrow: "\u2194", LeftRightArrow: "\u2194", Leftrightarrow: "\u21D4", leftrightarrows: "\u21C6", leftrightharpoons: "\u21CB", leftrightsquigarrow: "\u21AD", LeftRightVector: "\u294E", LeftTeeArrow: "\u21A4", LeftTee: "\u22A3", LeftTeeVector: "\u295A", leftthreetimes: "\u22CB", LeftTriangleBar: "\u29CF", LeftTriangle: "\u22B2", LeftTriangleEqual: "\u22B4", LeftUpDownVector: "\u2951", LeftUpTeeVector: "\u2960", LeftUpVectorBar: "\u2958", LeftUpVector: "\u21BF", LeftVectorBar: "\u2952", LeftVector: "\u21BC", lEg: "\u2A8B", leg: "\u22DA", leq: "\u2264", leqq: "\u2266", leqslant: "\u2A7D", lescc: "\u2AA8", les: "\u2A7D", lesdot: "\u2A7F", lesdoto: "\u2A81", lesdotor: "\u2A83", lesg: "\u22DA\uFE00", lesges: "\u2A93", lessapprox: "\u2A85", lessdot: "\u22D6", lesseqgtr: "\u22DA", lesseqqgtr: "\u2A8B", LessEqualGreater: "\u22DA", LessFullEqual: "\u2266", LessGreater: "\u2276", lessgtr: "\u2276", LessLess: "\u2AA1", lesssim: "\u2272", LessSlantEqual: "\u2A7D", LessTilde: "\u2272", lfisht: "\u297C", lfloor: "\u230A", Lfr: "\u{1D50F}", lfr: "\u{1D529}", lg: "\u2276", lgE: "\u2A91", lHar: "\u2962", lhard: "\u21BD", lharu: "\u21BC", lharul: "\u296A", lhblk: "\u2584", LJcy: "\u0409", ljcy: "\u0459", llarr: "\u21C7", ll: "\u226A", Ll: "\u22D8", llcorner: "\u231E", Lleftarrow: "\u21DA", llhard: "\u296B", lltri: "\u25FA", Lmidot: "\u013F", lmidot: "\u0140", lmoustache: "\u23B0", lmoust: "\u23B0", lnap: "\u2A89", lnapprox: "\u2A89", lne: "\u2A87", lnE: "\u2268", lneq: "\u2A87", lneqq: "\u2268", lnsim: "\u22E6", loang: "\u27EC", loarr: "\u21FD", lobrk: "\u27E6", longleftarrow: "\u27F5", LongLeftArrow: "\u27F5", Longleftarrow: "\u27F8", longleftrightarrow: "\u27F7", LongLeftRightArrow: "\u27F7", Longleftrightarrow: "\u27FA", longmapsto: "\u27FC", longrightarrow: "\u27F6", LongRightArrow: "\u27F6", Longrightarrow: "\u27F9", looparrowleft: "\u21AB", looparrowright: "\u21AC", lopar: "\u2985", Lopf: "\u{1D543}", lopf: "\u{1D55D}", loplus: "\u2A2D", lotimes: "\u2A34", lowast: "\u2217", lowbar: "_", LowerLeftArrow: "\u2199", LowerRightArrow: "\u2198", loz: "\u25CA", lozenge: "\u25CA", lozf: "\u29EB", lpar: "(", lparlt: "\u2993", lrarr: "\u21C6", lrcorner: "\u231F", lrhar: "\u21CB", lrhard: "\u296D", lrm: "\u200E", lrtri: "\u22BF", lsaquo: "\u2039", lscr: "\u{1D4C1}", Lscr: "\u2112", lsh: "\u21B0", Lsh: "\u21B0", lsim: "\u2272", lsime: "\u2A8D", lsimg: "\u2A8F", lsqb: "[", lsquo: "\u2018", lsquor: "\u201A", Lstrok: "\u0141", lstrok: "\u0142", ltcc: "\u2AA6", ltcir: "\u2A79", lt: "<", LT: "<", Lt: "\u226A", ltdot: "\u22D6", lthree: "\u22CB", ltimes: "\u22C9", ltlarr: "\u2976", ltquest: "\u2A7B", ltri: "\u25C3", ltrie: "\u22B4", ltrif: "\u25C2", ltrPar: "\u2996", lurdshar: "\u294A", luruhar: "\u2966", lvertneqq: "\u2268\uFE00", lvnE: "\u2268\uFE00", macr: "\xAF", male: "\u2642", malt: "\u2720", maltese: "\u2720", Map: "\u2905", map: "\u21A6", mapsto: "\u21A6", mapstodown: "\u21A7", mapstoleft: "\u21A4", mapstoup: "\u21A5", marker: "\u25AE", mcomma: "\u2A29", Mcy: "\u041C", mcy: "\u043C", mdash: "\u2014", mDDot: "\u223A", measuredangle: "\u2221", MediumSpace: "\u205F", Mellintrf: "\u2133", Mfr: "\u{1D510}", mfr: "\u{1D52A}", mho: "\u2127", micro: "\xB5", midast: "*", midcir: "\u2AF0", mid: "\u2223", middot: "\xB7", minusb: "\u229F", minus: "\u2212", minusd: "\u2238", minusdu: "\u2A2A", MinusPlus: "\u2213", mlcp: "\u2ADB", mldr: "\u2026", mnplus: "\u2213", models: "\u22A7", Mopf: "\u{1D544}", mopf: "\u{1D55E}", mp: "\u2213", mscr: "\u{1D4C2}", Mscr: "\u2133", mstpos: "\u223E", Mu: "\u039C", mu: "\u03BC", multimap: "\u22B8", mumap: "\u22B8", nabla: "\u2207", Nacute: "\u0143", nacute: "\u0144", nang: "\u2220\u20D2", nap: "\u2249", napE: "\u2A70\u0338", napid: "\u224B\u0338", napos: "\u0149", napprox: "\u2249", natural: "\u266E", naturals: "\u2115", natur: "\u266E", nbsp: "\xA0", nbump: "\u224E\u0338", nbumpe: "\u224F\u0338", ncap: "\u2A43", Ncaron: "\u0147", ncaron: "\u0148", Ncedil: "\u0145", ncedil: "\u0146", ncong: "\u2247", ncongdot: "\u2A6D\u0338", ncup: "\u2A42", Ncy: "\u041D", ncy: "\u043D", ndash: "\u2013", nearhk: "\u2924", nearr: "\u2197", neArr: "\u21D7", nearrow: "\u2197", ne: "\u2260", nedot: "\u2250\u0338", NegativeMediumSpace: "\u200B", NegativeThickSpace: "\u200B", NegativeThinSpace: "\u200B", NegativeVeryThinSpace: "\u200B", nequiv: "\u2262", nesear: "\u2928", nesim: "\u2242\u0338", NestedGreaterGreater: "\u226B", NestedLessLess: "\u226A", NewLine: "\n", nexist: "\u2204", nexists: "\u2204", Nfr: "\u{1D511}", nfr: "\u{1D52B}", ngE: "\u2267\u0338", nge: "\u2271", ngeq: "\u2271", ngeqq: "\u2267\u0338", ngeqslant: "\u2A7E\u0338", nges: "\u2A7E\u0338", nGg: "\u22D9\u0338", ngsim: "\u2275", nGt: "\u226B\u20D2", ngt: "\u226F", ngtr: "\u226F", nGtv: "\u226B\u0338", nharr: "\u21AE", nhArr: "\u21CE", nhpar: "\u2AF2", ni: "\u220B", nis: "\u22FC", nisd: "\u22FA", niv: "\u220B", NJcy: "\u040A", njcy: "\u045A", nlarr: "\u219A", nlArr: "\u21CD", nldr: "\u2025", nlE: "\u2266\u0338", nle: "\u2270", nleftarrow: "\u219A", nLeftarrow: "\u21CD", nleftrightarrow: "\u21AE", nLeftrightarrow: "\u21CE", nleq: "\u2270", nleqq: "\u2266\u0338", nleqslant: "\u2A7D\u0338", nles: "\u2A7D\u0338", nless: "\u226E", nLl: "\u22D8\u0338", nlsim: "\u2274", nLt: "\u226A\u20D2", nlt: "\u226E", nltri: "\u22EA", nltrie: "\u22EC", nLtv: "\u226A\u0338", nmid: "\u2224", NoBreak: "\u2060", NonBreakingSpace: "\xA0", nopf: "\u{1D55F}", Nopf: "\u2115", Not: "\u2AEC", not: "\xAC", NotCongruent: "\u2262", NotCupCap: "\u226D", NotDoubleVerticalBar: "\u2226", NotElement: "\u2209", NotEqual: "\u2260", NotEqualTilde: "\u2242\u0338", NotExists: "\u2204", NotGreater: "\u226F", NotGreaterEqual: "\u2271", NotGreaterFullEqual: "\u2267\u0338", NotGreaterGreater: "\u226B\u0338", NotGreaterLess: "\u2279", NotGreaterSlantEqual: "\u2A7E\u0338", NotGreaterTilde: "\u2275", NotHumpDownHump: "\u224E\u0338", NotHumpEqual: "\u224F\u0338", notin: "\u2209", notindot: "\u22F5\u0338", notinE: "\u22F9\u0338", notinva: "\u2209", notinvb: "\u22F7", notinvc: "\u22F6", NotLeftTriangleBar: "\u29CF\u0338", NotLeftTriangle: "\u22EA", NotLeftTriangleEqual: "\u22EC", NotLess: "\u226E", NotLessEqual: "\u2270", NotLessGreater: "\u2278", NotLessLess: "\u226A\u0338", NotLessSlantEqual: "\u2A7D\u0338", NotLessTilde: "\u2274", NotNestedGreaterGreater: "\u2AA2\u0338", NotNestedLessLess: "\u2AA1\u0338", notni: "\u220C", notniva: "\u220C", notnivb: "\u22FE", notnivc: "\u22FD", NotPrecedes: "\u2280", NotPrecedesEqual: "\u2AAF\u0338", NotPrecedesSlantEqual: "\u22E0", NotReverseElement: "\u220C", NotRightTriangleBar: "\u29D0\u0338", NotRightTriangle: "\u22EB", NotRightTriangleEqual: "\u22ED", NotSquareSubset: "\u228F\u0338", NotSquareSubsetEqual: "\u22E2", NotSquareSuperset: "\u2290\u0338", NotSquareSupersetEqual: "\u22E3", NotSubset: "\u2282\u20D2", NotSubsetEqual: "\u2288", NotSucceeds: "\u2281", NotSucceedsEqual: "\u2AB0\u0338", NotSucceedsSlantEqual: "\u22E1", NotSucceedsTilde: "\u227F\u0338", NotSuperset: "\u2283\u20D2", NotSupersetEqual: "\u2289", NotTilde: "\u2241", NotTildeEqual: "\u2244", NotTildeFullEqual: "\u2247", NotTildeTilde: "\u2249", NotVerticalBar: "\u2224", nparallel: "\u2226", npar: "\u2226", nparsl: "\u2AFD\u20E5", npart: "\u2202\u0338", npolint: "\u2A14", npr: "\u2280", nprcue: "\u22E0", nprec: "\u2280", npreceq: "\u2AAF\u0338", npre: "\u2AAF\u0338", nrarrc: "\u2933\u0338", nrarr: "\u219B", nrArr: "\u21CF", nrarrw: "\u219D\u0338", nrightarrow: "\u219B", nRightarrow: "\u21CF", nrtri: "\u22EB", nrtrie: "\u22ED", nsc: "\u2281", nsccue: "\u22E1", nsce: "\u2AB0\u0338", Nscr: "\u{1D4A9}", nscr: "\u{1D4C3}", nshortmid: "\u2224", nshortparallel: "\u2226", nsim: "\u2241", nsime: "\u2244", nsimeq: "\u2244", nsmid: "\u2224", nspar: "\u2226", nsqsube: "\u22E2", nsqsupe: "\u22E3", nsub: "\u2284", nsubE: "\u2AC5\u0338", nsube: "\u2288", nsubset: "\u2282\u20D2", nsubseteq: "\u2288", nsubseteqq: "\u2AC5\u0338", nsucc: "\u2281", nsucceq: "\u2AB0\u0338", nsup: "\u2285", nsupE: "\u2AC6\u0338", nsupe: "\u2289", nsupset: "\u2283\u20D2", nsupseteq: "\u2289", nsupseteqq: "\u2AC6\u0338", ntgl: "\u2279", Ntilde: "\xD1", ntilde: "\xF1", ntlg: "\u2278", ntriangleleft: "\u22EA", ntrianglelefteq: "\u22EC", ntriangleright: "\u22EB", ntrianglerighteq: "\u22ED", Nu: "\u039D", nu: "\u03BD", num: "#", numero: "\u2116", numsp: "\u2007", nvap: "\u224D\u20D2", nvdash: "\u22AC", nvDash: "\u22AD", nVdash: "\u22AE", nVDash: "\u22AF", nvge: "\u2265\u20D2", nvgt: ">\u20D2", nvHarr: "\u2904", nvinfin: "\u29DE", nvlArr: "\u2902", nvle: "\u2264\u20D2", nvlt: "<\u20D2", nvltrie: "\u22B4\u20D2", nvrArr: "\u2903", nvrtrie: "\u22B5\u20D2", nvsim: "\u223C\u20D2", nwarhk: "\u2923", nwarr: "\u2196", nwArr: "\u21D6", nwarrow: "\u2196", nwnear: "\u2927", Oacute: "\xD3", oacute: "\xF3", oast: "\u229B", Ocirc: "\xD4", ocirc: "\xF4", ocir: "\u229A", Ocy: "\u041E", ocy: "\u043E", odash: "\u229D", Odblac: "\u0150", odblac: "\u0151", odiv: "\u2A38", odot: "\u2299", odsold: "\u29BC", OElig: "\u0152", oelig: "\u0153", ofcir: "\u29BF", Ofr: "\u{1D512}", ofr: "\u{1D52C}", ogon: "\u02DB", Ograve: "\xD2", ograve: "\xF2", ogt: "\u29C1", ohbar: "\u29B5", ohm: "\u03A9", oint: "\u222E", olarr: "\u21BA", olcir: "\u29BE", olcross: "\u29BB", oline: "\u203E", olt: "\u29C0", Omacr: "\u014C", omacr: "\u014D", Omega: "\u03A9", omega: "\u03C9", Omicron: "\u039F", omicron: "\u03BF", omid: "\u29B6", ominus: "\u2296", Oopf: "\u{1D546}", oopf: "\u{1D560}", opar: "\u29B7", OpenCurlyDoubleQuote: "\u201C", OpenCurlyQuote: "\u2018", operp: "\u29B9", oplus: "\u2295", orarr: "\u21BB", Or: "\u2A54", or: "\u2228", ord: "\u2A5D", order: "\u2134", orderof: "\u2134", ordf: "\xAA", ordm: "\xBA", origof: "\u22B6", oror: "\u2A56", orslope: "\u2A57", orv: "\u2A5B", oS: "\u24C8", Oscr: "\u{1D4AA}", oscr: "\u2134", Oslash: "\xD8", oslash: "\xF8", osol: "\u2298", Otilde: "\xD5", otilde: "\xF5", otimesas: "\u2A36", Otimes: "\u2A37", otimes: "\u2297", Ouml: "\xD6", ouml: "\xF6", ovbar: "\u233D", OverBar: "\u203E", OverBrace: "\u23DE", OverBracket: "\u23B4", OverParenthesis: "\u23DC", para: "\xB6", parallel: "\u2225", par: "\u2225", parsim: "\u2AF3", parsl: "\u2AFD", part: "\u2202", PartialD: "\u2202", Pcy: "\u041F", pcy: "\u043F", percnt: "%", period: ".", permil: "\u2030", perp: "\u22A5", pertenk: "\u2031", Pfr: "\u{1D513}", pfr: "\u{1D52D}", Phi: "\u03A6", phi: "\u03C6", phiv: "\u03D5", phmmat: "\u2133", phone: "\u260E", Pi: "\u03A0", pi: "\u03C0", pitchfork: "\u22D4", piv: "\u03D6", planck: "\u210F", planckh: "\u210E", plankv: "\u210F", plusacir: "\u2A23", plusb: "\u229E", pluscir: "\u2A22", plus: "+", plusdo: "\u2214", plusdu: "\u2A25", pluse: "\u2A72", PlusMinus: "\xB1", plusmn: "\xB1", plussim: "\u2A26", plustwo: "\u2A27", pm: "\xB1", Poincareplane: "\u210C", pointint: "\u2A15", popf: "\u{1D561}", Popf: "\u2119", pound: "\xA3", prap: "\u2AB7", Pr: "\u2ABB", pr: "\u227A", prcue: "\u227C", precapprox: "\u2AB7", prec: "\u227A", preccurlyeq: "\u227C", Precedes: "\u227A", PrecedesEqual: "\u2AAF", PrecedesSlantEqual: "\u227C", PrecedesTilde: "\u227E", preceq: "\u2AAF", precnapprox: "\u2AB9", precneqq: "\u2AB5", precnsim: "\u22E8", pre: "\u2AAF", prE: "\u2AB3", precsim: "\u227E", prime: "\u2032", Prime: "\u2033", primes: "\u2119", prnap: "\u2AB9", prnE: "\u2AB5", prnsim: "\u22E8", prod: "\u220F", Product: "\u220F", profalar: "\u232E", profline: "\u2312", profsurf: "\u2313", prop: "\u221D", Proportional: "\u221D", Proportion: "\u2237", propto: "\u221D", prsim: "\u227E", prurel: "\u22B0", Pscr: "\u{1D4AB}", pscr: "\u{1D4C5}", Psi: "\u03A8", psi: "\u03C8", puncsp: "\u2008", Qfr: "\u{1D514}", qfr: "\u{1D52E}", qint: "\u2A0C", qopf: "\u{1D562}", Qopf: "\u211A", qprime: "\u2057", Qscr: "\u{1D4AC}", qscr: "\u{1D4C6}", quaternions: "\u210D", quatint: "\u2A16", quest: "?", questeq: "\u225F", quot: '"', QUOT: '"', rAarr: "\u21DB", race: "\u223D\u0331", Racute: "\u0154", racute: "\u0155", radic: "\u221A", raemptyv: "\u29B3", rang: "\u27E9", Rang: "\u27EB", rangd: "\u2992", range: "\u29A5", rangle: "\u27E9", raquo: "\xBB", rarrap: "\u2975", rarrb: "\u21E5", rarrbfs: "\u2920", rarrc: "\u2933", rarr: "\u2192", Rarr: "\u21A0", rArr: "\u21D2", rarrfs: "\u291E", rarrhk: "\u21AA", rarrlp: "\u21AC", rarrpl: "\u2945", rarrsim: "\u2974", Rarrtl: "\u2916", rarrtl: "\u21A3", rarrw: "\u219D", ratail: "\u291A", rAtail: "\u291C", ratio: "\u2236", rationals: "\u211A", rbarr: "\u290D", rBarr: "\u290F", RBarr: "\u2910", rbbrk: "\u2773", rbrace: "}", rbrack: "]", rbrke: "\u298C", rbrksld: "\u298E", rbrkslu: "\u2990", Rcaron: "\u0158", rcaron: "\u0159", Rcedil: "\u0156", rcedil: "\u0157", rceil: "\u2309", rcub: "}", Rcy: "\u0420", rcy: "\u0440", rdca: "\u2937", rdldhar: "\u2969", rdquo: "\u201D", rdquor: "\u201D", rdsh: "\u21B3", real: "\u211C", realine: "\u211B", realpart: "\u211C", reals: "\u211D", Re: "\u211C", rect: "\u25AD", reg: "\xAE", REG: "\xAE", ReverseElement: "\u220B", ReverseEquilibrium: "\u21CB", ReverseUpEquilibrium: "\u296F", rfisht: "\u297D", rfloor: "\u230B", rfr: "\u{1D52F}", Rfr: "\u211C", rHar: "\u2964", rhard: "\u21C1", rharu: "\u21C0", rharul: "\u296C", Rho: "\u03A1", rho: "\u03C1", rhov: "\u03F1", RightAngleBracket: "\u27E9", RightArrowBar: "\u21E5", rightarrow: "\u2192", RightArrow: "\u2192", Rightarrow: "\u21D2", RightArrowLeftArrow: "\u21C4", rightarrowtail: "\u21A3", RightCeiling: "\u2309", RightDoubleBracket: "\u27E7", RightDownTeeVector: "\u295D", RightDownVectorBar: "\u2955", RightDownVector: "\u21C2", RightFloor: "\u230B", rightharpoondown: "\u21C1", rightharpoonup: "\u21C0", rightleftarrows: "\u21C4", rightleftharpoons: "\u21CC", rightrightarrows: "\u21C9", rightsquigarrow: "\u219D", RightTeeArrow: "\u21A6", RightTee: "\u22A2", RightTeeVector: "\u295B", rightthreetimes: "\u22CC", RightTriangleBar: "\u29D0", RightTriangle: "\u22B3", RightTriangleEqual: "\u22B5", RightUpDownVector: "\u294F", RightUpTeeVector: "\u295C", RightUpVectorBar: "\u2954", RightUpVector: "\u21BE", RightVectorBar: "\u2953", RightVector: "\u21C0", ring: "\u02DA", risingdotseq: "\u2253", rlarr: "\u21C4", rlhar: "\u21CC", rlm: "\u200F", rmoustache: "\u23B1", rmoust: "\u23B1", rnmid: "\u2AEE", roang: "\u27ED", roarr: "\u21FE", robrk: "\u27E7", ropar: "\u2986", ropf: "\u{1D563}", Ropf: "\u211D", roplus: "\u2A2E", rotimes: "\u2A35", RoundImplies: "\u2970", rpar: ")", rpargt: "\u2994", rppolint: "\u2A12", rrarr: "\u21C9", Rrightarrow: "\u21DB", rsaquo: "\u203A", rscr: "\u{1D4C7}", Rscr: "\u211B", rsh: "\u21B1", Rsh: "\u21B1", rsqb: "]", rsquo: "\u2019", rsquor: "\u2019", rthree: "\u22CC", rtimes: "\u22CA", rtri: "\u25B9", rtrie: "\u22B5", rtrif: "\u25B8", rtriltri: "\u29CE", RuleDelayed: "\u29F4", ruluhar: "\u2968", rx: "\u211E", Sacute: "\u015A", sacute: "\u015B", sbquo: "\u201A", scap: "\u2AB8", Scaron: "\u0160", scaron: "\u0161", Sc: "\u2ABC", sc: "\u227B", sccue: "\u227D", sce: "\u2AB0", scE: "\u2AB4", Scedil: "\u015E", scedil: "\u015F", Scirc: "\u015C", scirc: "\u015D", scnap: "\u2ABA", scnE: "\u2AB6", scnsim: "\u22E9", scpolint: "\u2A13", scsim: "\u227F", Scy: "\u0421", scy: "\u0441", sdotb: "\u22A1", sdot: "\u22C5", sdote: "\u2A66", searhk: "\u2925", searr: "\u2198", seArr: "\u21D8", searrow: "\u2198", sect: "\xA7", semi: ";", seswar: "\u2929", setminus: "\u2216", setmn: "\u2216", sext: "\u2736", Sfr: "\u{1D516}", sfr: "\u{1D530}", sfrown: "\u2322", sharp: "\u266F", SHCHcy: "\u0429", shchcy: "\u0449", SHcy: "\u0428", shcy: "\u0448", ShortDownArrow: "\u2193", ShortLeftArrow: "\u2190", shortmid: "\u2223", shortparallel: "\u2225", ShortRightArrow: "\u2192", ShortUpArrow: "\u2191", shy: "\xAD", Sigma: "\u03A3", sigma: "\u03C3", sigmaf: "\u03C2", sigmav: "\u03C2", sim: "\u223C", simdot: "\u2A6A", sime: "\u2243", simeq: "\u2243", simg: "\u2A9E", simgE: "\u2AA0", siml: "\u2A9D", simlE: "\u2A9F", simne: "\u2246", simplus: "\u2A24", simrarr: "\u2972", slarr: "\u2190", SmallCircle: "\u2218", smallsetminus: "\u2216", smashp: "\u2A33", smeparsl: "\u29E4", smid: "\u2223", smile: "\u2323", smt: "\u2AAA", smte: "\u2AAC", smtes: "\u2AAC\uFE00", SOFTcy: "\u042C", softcy: "\u044C", solbar: "\u233F", solb: "\u29C4", sol: "/", Sopf: "\u{1D54A}", sopf: "\u{1D564}", spades: "\u2660", spadesuit: "\u2660", spar: "\u2225", sqcap: "\u2293", sqcaps: "\u2293\uFE00", sqcup: "\u2294", sqcups: "\u2294\uFE00", Sqrt: "\u221A", sqsub: "\u228F", sqsube: "\u2291", sqsubset: "\u228F", sqsubseteq: "\u2291", sqsup: "\u2290", sqsupe: "\u2292", sqsupset: "\u2290", sqsupseteq: "\u2292", square: "\u25A1", Square: "\u25A1", SquareIntersection: "\u2293", SquareSubset: "\u228F", SquareSubsetEqual: "\u2291", SquareSuperset: "\u2290", SquareSupersetEqual: "\u2292", SquareUnion: "\u2294", squarf: "\u25AA", squ: "\u25A1", squf: "\u25AA", srarr: "\u2192", Sscr: "\u{1D4AE}", sscr: "\u{1D4C8}", ssetmn: "\u2216", ssmile: "\u2323", sstarf: "\u22C6", Star: "\u22C6", star: "\u2606", starf: "\u2605", straightepsilon: "\u03F5", straightphi: "\u03D5", strns: "\xAF", sub: "\u2282", Sub: "\u22D0", subdot: "\u2ABD", subE: "\u2AC5", sube: "\u2286", subedot: "\u2AC3", submult: "\u2AC1", subnE: "\u2ACB", subne: "\u228A", subplus: "\u2ABF", subrarr: "\u2979", subset: "\u2282", Subset: "\u22D0", subseteq: "\u2286", subseteqq: "\u2AC5", SubsetEqual: "\u2286", subsetneq: "\u228A", subsetneqq: "\u2ACB", subsim: "\u2AC7", subsub: "\u2AD5", subsup: "\u2AD3", succapprox: "\u2AB8", succ: "\u227B", succcurlyeq: "\u227D", Succeeds: "\u227B", SucceedsEqual: "\u2AB0", SucceedsSlantEqual: "\u227D", SucceedsTilde: "\u227F", succeq: "\u2AB0", succnapprox: "\u2ABA", succneqq: "\u2AB6", succnsim: "\u22E9", succsim: "\u227F", SuchThat: "\u220B", sum: "\u2211", Sum: "\u2211", sung: "\u266A", sup1: "\xB9", sup2: "\xB2", sup3: "\xB3", sup: "\u2283", Sup: "\u22D1", supdot: "\u2ABE", supdsub: "\u2AD8", supE: "\u2AC6", supe: "\u2287", supedot: "\u2AC4", Superset: "\u2283", SupersetEqual: "\u2287", suphsol: "\u27C9", suphsub: "\u2AD7", suplarr: "\u297B", supmult: "\u2AC2", supnE: "\u2ACC", supne: "\u228B", supplus: "\u2AC0", supset: "\u2283", Supset: "\u22D1", supseteq: "\u2287", supseteqq: "\u2AC6", supsetneq: "\u228B", supsetneqq: "\u2ACC", supsim: "\u2AC8", supsub: "\u2AD4", supsup: "\u2AD6", swarhk: "\u2926", swarr: "\u2199", swArr: "\u21D9", swarrow: "\u2199", swnwar: "\u292A", szlig: "\xDF", Tab: "	", target: "\u2316", Tau: "\u03A4", tau: "\u03C4", tbrk: "\u23B4", Tcaron: "\u0164", tcaron: "\u0165", Tcedil: "\u0162", tcedil: "\u0163", Tcy: "\u0422", tcy: "\u0442", tdot: "\u20DB", telrec: "\u2315", Tfr: "\u{1D517}", tfr: "\u{1D531}", there4: "\u2234", therefore: "\u2234", Therefore: "\u2234", Theta: "\u0398", theta: "\u03B8", thetasym: "\u03D1", thetav: "\u03D1", thickapprox: "\u2248", thicksim: "\u223C", ThickSpace: "\u205F\u200A", ThinSpace: "\u2009", thinsp: "\u2009", thkap: "\u2248", thksim: "\u223C", THORN: "\xDE", thorn: "\xFE", tilde: "\u02DC", Tilde: "\u223C", TildeEqual: "\u2243", TildeFullEqual: "\u2245", TildeTilde: "\u2248", timesbar: "\u2A31", timesb: "\u22A0", times: "\xD7", timesd: "\u2A30", tint: "\u222D", toea: "\u2928", topbot: "\u2336", topcir: "\u2AF1", top: "\u22A4", Topf: "\u{1D54B}", topf: "\u{1D565}", topfork: "\u2ADA", tosa: "\u2929", tprime: "\u2034", trade: "\u2122", TRADE: "\u2122", triangle: "\u25B5", triangledown: "\u25BF", triangleleft: "\u25C3", trianglelefteq: "\u22B4", triangleq: "\u225C", triangleright: "\u25B9", trianglerighteq: "\u22B5", tridot: "\u25EC", trie: "\u225C", triminus: "\u2A3A", TripleDot: "\u20DB", triplus: "\u2A39", trisb: "\u29CD", tritime: "\u2A3B", trpezium: "\u23E2", Tscr: "\u{1D4AF}", tscr: "\u{1D4C9}", TScy: "\u0426", tscy: "\u0446", TSHcy: "\u040B", tshcy: "\u045B", Tstrok: "\u0166", tstrok: "\u0167", twixt: "\u226C", twoheadleftarrow: "\u219E", twoheadrightarrow: "\u21A0", Uacute: "\xDA", uacute: "\xFA", uarr: "\u2191", Uarr: "\u219F", uArr: "\u21D1", Uarrocir: "\u2949", Ubrcy: "\u040E", ubrcy: "\u045E", Ubreve: "\u016C", ubreve: "\u016D", Ucirc: "\xDB", ucirc: "\xFB", Ucy: "\u0423", ucy: "\u0443", udarr: "\u21C5", Udblac: "\u0170", udblac: "\u0171", udhar: "\u296E", ufisht: "\u297E", Ufr: "\u{1D518}", ufr: "\u{1D532}", Ugrave: "\xD9", ugrave: "\xF9", uHar: "\u2963", uharl: "\u21BF", uharr: "\u21BE", uhblk: "\u2580", ulcorn: "\u231C", ulcorner: "\u231C", ulcrop: "\u230F", ultri: "\u25F8", Umacr: "\u016A", umacr: "\u016B", uml: "\xA8", UnderBar: "_", UnderBrace: "\u23DF", UnderBracket: "\u23B5", UnderParenthesis: "\u23DD", Union: "\u22C3", UnionPlus: "\u228E", Uogon: "\u0172", uogon: "\u0173", Uopf: "\u{1D54C}", uopf: "\u{1D566}", UpArrowBar: "\u2912", uparrow: "\u2191", UpArrow: "\u2191", Uparrow: "\u21D1", UpArrowDownArrow: "\u21C5", updownarrow: "\u2195", UpDownArrow: "\u2195", Updownarrow: "\u21D5", UpEquilibrium: "\u296E", upharpoonleft: "\u21BF", upharpoonright: "\u21BE", uplus: "\u228E", UpperLeftArrow: "\u2196", UpperRightArrow: "\u2197", upsi: "\u03C5", Upsi: "\u03D2", upsih: "\u03D2", Upsilon: "\u03A5", upsilon: "\u03C5", UpTeeArrow: "\u21A5", UpTee: "\u22A5", upuparrows: "\u21C8", urcorn: "\u231D", urcorner: "\u231D", urcrop: "\u230E", Uring: "\u016E", uring: "\u016F", urtri: "\u25F9", Uscr: "\u{1D4B0}", uscr: "\u{1D4CA}", utdot: "\u22F0", Utilde: "\u0168", utilde: "\u0169", utri: "\u25B5", utrif: "\u25B4", uuarr: "\u21C8", Uuml: "\xDC", uuml: "\xFC", uwangle: "\u29A7", vangrt: "\u299C", varepsilon: "\u03F5", varkappa: "\u03F0", varnothing: "\u2205", varphi: "\u03D5", varpi: "\u03D6", varpropto: "\u221D", varr: "\u2195", vArr: "\u21D5", varrho: "\u03F1", varsigma: "\u03C2", varsubsetneq: "\u228A\uFE00", varsubsetneqq: "\u2ACB\uFE00", varsupsetneq: "\u228B\uFE00", varsupsetneqq: "\u2ACC\uFE00", vartheta: "\u03D1", vartriangleleft: "\u22B2", vartriangleright: "\u22B3", vBar: "\u2AE8", Vbar: "\u2AEB", vBarv: "\u2AE9", Vcy: "\u0412", vcy: "\u0432", vdash: "\u22A2", vDash: "\u22A8", Vdash: "\u22A9", VDash: "\u22AB", Vdashl: "\u2AE6", veebar: "\u22BB", vee: "\u2228", Vee: "\u22C1", veeeq: "\u225A", vellip: "\u22EE", verbar: "|", Verbar: "\u2016", vert: "|", Vert: "\u2016", VerticalBar: "\u2223", VerticalLine: "|", VerticalSeparator: "\u2758", VerticalTilde: "\u2240", VeryThinSpace: "\u200A", Vfr: "\u{1D519}", vfr: "\u{1D533}", vltri: "\u22B2", vnsub: "\u2282\u20D2", vnsup: "\u2283\u20D2", Vopf: "\u{1D54D}", vopf: "\u{1D567}", vprop: "\u221D", vrtri: "\u22B3", Vscr: "\u{1D4B1}", vscr: "\u{1D4CB}", vsubnE: "\u2ACB\uFE00", vsubne: "\u228A\uFE00", vsupnE: "\u2ACC\uFE00", vsupne: "\u228B\uFE00", Vvdash: "\u22AA", vzigzag: "\u299A", Wcirc: "\u0174", wcirc: "\u0175", wedbar: "\u2A5F", wedge: "\u2227", Wedge: "\u22C0", wedgeq: "\u2259", weierp: "\u2118", Wfr: "\u{1D51A}", wfr: "\u{1D534}", Wopf: "\u{1D54E}", wopf: "\u{1D568}", wp: "\u2118", wr: "\u2240", wreath: "\u2240", Wscr: "\u{1D4B2}", wscr: "\u{1D4CC}", xcap: "\u22C2", xcirc: "\u25EF", xcup: "\u22C3", xdtri: "\u25BD", Xfr: "\u{1D51B}", xfr: "\u{1D535}", xharr: "\u27F7", xhArr: "\u27FA", Xi: "\u039E", xi: "\u03BE", xlarr: "\u27F5", xlArr: "\u27F8", xmap: "\u27FC", xnis: "\u22FB", xodot: "\u2A00", Xopf: "\u{1D54F}", xopf: "\u{1D569}", xoplus: "\u2A01", xotime: "\u2A02", xrarr: "\u27F6", xrArr: "\u27F9", Xscr: "\u{1D4B3}", xscr: "\u{1D4CD}", xsqcup: "\u2A06", xuplus: "\u2A04", xutri: "\u25B3", xvee: "\u22C1", xwedge: "\u22C0", Yacute: "\xDD", yacute: "\xFD", YAcy: "\u042F", yacy: "\u044F", Ycirc: "\u0176", ycirc: "\u0177", Ycy: "\u042B", ycy: "\u044B", yen: "\xA5", Yfr: "\u{1D51C}", yfr: "\u{1D536}", YIcy: "\u0407", yicy: "\u0457", Yopf: "\u{1D550}", yopf: "\u{1D56A}", Yscr: "\u{1D4B4}", yscr: "\u{1D4CE}", YUcy: "\u042E", yucy: "\u044E", yuml: "\xFF", Yuml: "\u0178", Zacute: "\u0179", zacute: "\u017A", Zcaron: "\u017D", zcaron: "\u017E", Zcy: "\u0417", zcy: "\u0437", Zdot: "\u017B", zdot: "\u017C", zeetrf: "\u2128", ZeroWidthSpace: "\u200B", Zeta: "\u0396", zeta: "\u03B6", zfr: "\u{1D537}", Zfr: "\u2128", ZHcy: "\u0416", zhcy: "\u0436", zigrarr: "\u21DD", zopf: "\u{1D56B}", Zopf: "\u2124", Zscr: "\u{1D4B5}", zscr: "\u{1D4CF}", zwj: "\u200D", zwnj: "\u200C" };
            }
          });
          var require_legacy = __commonJS({
            "node_modules/.pnpm/entities@2.2.0/node_modules/entities/lib/maps/legacy.json"(exports, module) {
              module.exports = { Aacute: "\xC1", aacute: "\xE1", Acirc: "\xC2", acirc: "\xE2", acute: "\xB4", AElig: "\xC6", aelig: "\xE6", Agrave: "\xC0", agrave: "\xE0", amp: "&", AMP: "&", Aring: "\xC5", aring: "\xE5", Atilde: "\xC3", atilde: "\xE3", Auml: "\xC4", auml: "\xE4", brvbar: "\xA6", Ccedil: "\xC7", ccedil: "\xE7", cedil: "\xB8", cent: "\xA2", copy: "\xA9", COPY: "\xA9", curren: "\xA4", deg: "\xB0", divide: "\xF7", Eacute: "\xC9", eacute: "\xE9", Ecirc: "\xCA", ecirc: "\xEA", Egrave: "\xC8", egrave: "\xE8", ETH: "\xD0", eth: "\xF0", Euml: "\xCB", euml: "\xEB", frac12: "\xBD", frac14: "\xBC", frac34: "\xBE", gt: ">", GT: ">", Iacute: "\xCD", iacute: "\xED", Icirc: "\xCE", icirc: "\xEE", iexcl: "\xA1", Igrave: "\xCC", igrave: "\xEC", iquest: "\xBF", Iuml: "\xCF", iuml: "\xEF", laquo: "\xAB", lt: "<", LT: "<", macr: "\xAF", micro: "\xB5", middot: "\xB7", nbsp: "\xA0", not: "\xAC", Ntilde: "\xD1", ntilde: "\xF1", Oacute: "\xD3", oacute: "\xF3", Ocirc: "\xD4", ocirc: "\xF4", Ograve: "\xD2", ograve: "\xF2", ordf: "\xAA", ordm: "\xBA", Oslash: "\xD8", oslash: "\xF8", Otilde: "\xD5", otilde: "\xF5", Ouml: "\xD6", ouml: "\xF6", para: "\xB6", plusmn: "\xB1", pound: "\xA3", quot: '"', QUOT: '"', raquo: "\xBB", reg: "\xAE", REG: "\xAE", sect: "\xA7", shy: "\xAD", sup1: "\xB9", sup2: "\xB2", sup3: "\xB3", szlig: "\xDF", THORN: "\xDE", thorn: "\xFE", times: "\xD7", Uacute: "\xDA", uacute: "\xFA", Ucirc: "\xDB", ucirc: "\xFB", Ugrave: "\xD9", ugrave: "\xF9", uml: "\xA8", Uuml: "\xDC", uuml: "\xFC", Yacute: "\xDD", yacute: "\xFD", yen: "\xA5", yuml: "\xFF" };
            }
          });
          var require_xml = __commonJS({
            "node_modules/.pnpm/entities@2.2.0/node_modules/entities/lib/maps/xml.json"(exports, module) {
              module.exports = { amp: "&", apos: "'", gt: ">", lt: "<", quot: '"' };
            }
          });
          var require_decode = __commonJS({
            "node_modules/.pnpm/entities@2.2.0/node_modules/entities/lib/maps/decode.json"(exports, module) {
              module.exports = { "0": 65533, "128": 8364, "130": 8218, "131": 402, "132": 8222, "133": 8230, "134": 8224, "135": 8225, "136": 710, "137": 8240, "138": 352, "139": 8249, "140": 338, "142": 381, "145": 8216, "146": 8217, "147": 8220, "148": 8221, "149": 8226, "150": 8211, "151": 8212, "152": 732, "153": 8482, "154": 353, "155": 8250, "156": 339, "158": 382, "159": 376 };
            }
          });
          var require_decode_codepoint = __commonJS({
            "node_modules/.pnpm/entities@2.2.0/node_modules/entities/lib/decode_codepoint.js"(exports) {
              "use strict";
              var __importDefault = exports && exports.__importDefault || function(mod) {
                return mod && mod.__esModule ? mod : { "default": mod };
              };
              Object.defineProperty(exports, "__esModule", { value: true });
              var decode_json_1 = __importDefault(require_decode());
              var fromCodePoint = (
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                String.fromCodePoint || function(codePoint) {
                  var output = "";
                  if (codePoint > 65535) {
                    codePoint -= 65536;
                    output += String.fromCharCode(codePoint >>> 10 & 1023 | 55296);
                    codePoint = 56320 | codePoint & 1023;
                  }
                  output += String.fromCharCode(codePoint);
                  return output;
                }
              );
              function decodeCodePoint(codePoint) {
                if (codePoint >= 55296 && codePoint <= 57343 || codePoint > 1114111) {
                  return "\uFFFD";
                }
                if (codePoint in decode_json_1.default) {
                  codePoint = decode_json_1.default[codePoint];
                }
                return fromCodePoint(codePoint);
              }
              exports.default = decodeCodePoint;
            }
          });
          var require_decode2 = __commonJS({
            "node_modules/.pnpm/entities@2.2.0/node_modules/entities/lib/decode.js"(exports) {
              "use strict";
              var __importDefault = exports && exports.__importDefault || function(mod) {
                return mod && mod.__esModule ? mod : { "default": mod };
              };
              Object.defineProperty(exports, "__esModule", { value: true });
              exports.decodeHTML = exports.decodeHTMLStrict = exports.decodeXML = void 0;
              var entities_json_1 = __importDefault(require_entities());
              var legacy_json_1 = __importDefault(require_legacy());
              var xml_json_1 = __importDefault(require_xml());
              var decode_codepoint_1 = __importDefault(require_decode_codepoint());
              var strictEntityRe = /&(?:[a-zA-Z0-9]+|#[xX][\da-fA-F]+|#\d+);/g;
              exports.decodeXML = getStrictDecoder(xml_json_1.default);
              exports.decodeHTMLStrict = getStrictDecoder(entities_json_1.default);
              function getStrictDecoder(map) {
                var replace = getReplacer(map);
                return function(str) {
                  return String(str).replace(strictEntityRe, replace);
                };
              }
              var sorter = function(a, b) {
                return a < b ? 1 : -1;
              };
              exports.decodeHTML = function() {
                var legacy = Object.keys(legacy_json_1.default).sort(sorter);
                var keys = Object.keys(entities_json_1.default).sort(sorter);
                for (var i = 0, j = 0; i < keys.length; i++) {
                  if (legacy[j] === keys[i]) {
                    keys[i] += ";?";
                    j++;
                  } else {
                    keys[i] += ";";
                  }
                }
                var re = new RegExp("&(?:" + keys.join("|") + "|#[xX][\\da-fA-F]+;?|#\\d+;?)", "g");
                var replace = getReplacer(entities_json_1.default);
                function replacer(str) {
                  if (str.substr(-1) !== ";")
                    str += ";";
                  return replace(str);
                }
                return function(str) {
                  return String(str).replace(re, replacer);
                };
              }();
              function getReplacer(map) {
                return function replace(str) {
                  if (str.charAt(1) === "#") {
                    var secondChar = str.charAt(2);
                    if (secondChar === "X" || secondChar === "x") {
                      return decode_codepoint_1.default(parseInt(str.substr(3), 16));
                    }
                    return decode_codepoint_1.default(parseInt(str.substr(2), 10));
                  }
                  return map[str.slice(1, -1)] || str;
                };
              }
            }
          });
          var require_encode = __commonJS({
            "node_modules/.pnpm/entities@2.2.0/node_modules/entities/lib/encode.js"(exports) {
              "use strict";
              var __importDefault = exports && exports.__importDefault || function(mod) {
                return mod && mod.__esModule ? mod : { "default": mod };
              };
              Object.defineProperty(exports, "__esModule", { value: true });
              exports.escapeUTF8 = exports.escape = exports.encodeNonAsciiHTML = exports.encodeHTML = exports.encodeXML = void 0;
              var xml_json_1 = __importDefault(require_xml());
              var inverseXML = getInverseObj(xml_json_1.default);
              var xmlReplacer = getInverseReplacer(inverseXML);
              exports.encodeXML = getASCIIEncoder(inverseXML);
              var entities_json_1 = __importDefault(require_entities());
              var inverseHTML = getInverseObj(entities_json_1.default);
              var htmlReplacer = getInverseReplacer(inverseHTML);
              exports.encodeHTML = getInverse(inverseHTML, htmlReplacer);
              exports.encodeNonAsciiHTML = getASCIIEncoder(inverseHTML);
              function getInverseObj(obj) {
                return Object.keys(obj).sort().reduce(function(inverse, name) {
                  inverse[obj[name]] = "&" + name + ";";
                  return inverse;
                }, {});
              }
              function getInverseReplacer(inverse) {
                var single = [];
                var multiple = [];
                for (var _i = 0, _a = Object.keys(inverse); _i < _a.length; _i++) {
                  var k = _a[_i];
                  if (k.length === 1) {
                    single.push("\\" + k);
                  } else {
                    multiple.push(k);
                  }
                }
                single.sort();
                for (var start = 0; start < single.length - 1; start++) {
                  var end = start;
                  while (end < single.length - 1 && single[end].charCodeAt(1) + 1 === single[end + 1].charCodeAt(1)) {
                    end += 1;
                  }
                  var count = 1 + end - start;
                  if (count < 3)
                    continue;
                  single.splice(start, count, single[start] + "-" + single[end]);
                }
                multiple.unshift("[" + single.join("") + "]");
                return new RegExp(multiple.join("|"), "g");
              }
              var reNonASCII = /(?:[\x80-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])/g;
              var getCodePoint = (
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                String.prototype.codePointAt != null ? (
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  function(str) {
                    return str.codePointAt(0);
                  }
                ) : (
                  // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
                  function(c) {
                    return (c.charCodeAt(0) - 55296) * 1024 + c.charCodeAt(1) - 56320 + 65536;
                  }
                )
              );
              function singleCharReplacer(c) {
                return "&#x" + (c.length > 1 ? getCodePoint(c) : c.charCodeAt(0)).toString(16).toUpperCase() + ";";
              }
              function getInverse(inverse, re) {
                return function(data) {
                  return data.replace(re, function(name) {
                    return inverse[name];
                  }).replace(reNonASCII, singleCharReplacer);
                };
              }
              var reEscapeChars = new RegExp(xmlReplacer.source + "|" + reNonASCII.source, "g");
              function escape(data) {
                return data.replace(reEscapeChars, singleCharReplacer);
              }
              exports.escape = escape;
              function escapeUTF8(data) {
                return data.replace(xmlReplacer, singleCharReplacer);
              }
              exports.escapeUTF8 = escapeUTF8;
              function getASCIIEncoder(obj) {
                return function(data) {
                  return data.replace(reEscapeChars, function(c) {
                    return obj[c] || singleCharReplacer(c);
                  });
                };
              }
            }
          });
          var require_lib2 = __commonJS({
            "node_modules/.pnpm/entities@2.2.0/node_modules/entities/lib/index.js"(exports) {
              "use strict";
              Object.defineProperty(exports, "__esModule", { value: true });
              exports.decodeXMLStrict = exports.decodeHTML5Strict = exports.decodeHTML4Strict = exports.decodeHTML5 = exports.decodeHTML4 = exports.decodeHTMLStrict = exports.decodeHTML = exports.decodeXML = exports.encodeHTML5 = exports.encodeHTML4 = exports.escapeUTF8 = exports.escape = exports.encodeNonAsciiHTML = exports.encodeHTML = exports.encodeXML = exports.encode = exports.decodeStrict = exports.decode = void 0;
              var decode_1 = require_decode2();
              var encode_1 = require_encode();
              function decode(data, level) {
                return (!level || level <= 0 ? decode_1.decodeXML : decode_1.decodeHTML)(data);
              }
              exports.decode = decode;
              function decodeStrict(data, level) {
                return (!level || level <= 0 ? decode_1.decodeXML : decode_1.decodeHTMLStrict)(data);
              }
              exports.decodeStrict = decodeStrict;
              function encode(data, level) {
                return (!level || level <= 0 ? encode_1.encodeXML : encode_1.encodeHTML)(data);
              }
              exports.encode = encode;
              var encode_2 = require_encode();
              Object.defineProperty(exports, "encodeXML", { enumerable: true, get: function() {
                return encode_2.encodeXML;
              } });
              Object.defineProperty(exports, "encodeHTML", { enumerable: true, get: function() {
                return encode_2.encodeHTML;
              } });
              Object.defineProperty(exports, "encodeNonAsciiHTML", { enumerable: true, get: function() {
                return encode_2.encodeNonAsciiHTML;
              } });
              Object.defineProperty(exports, "escape", { enumerable: true, get: function() {
                return encode_2.escape;
              } });
              Object.defineProperty(exports, "escapeUTF8", { enumerable: true, get: function() {
                return encode_2.escapeUTF8;
              } });
              Object.defineProperty(exports, "encodeHTML4", { enumerable: true, get: function() {
                return encode_2.encodeHTML;
              } });
              Object.defineProperty(exports, "encodeHTML5", { enumerable: true, get: function() {
                return encode_2.encodeHTML;
              } });
              var decode_2 = require_decode2();
              Object.defineProperty(exports, "decodeXML", { enumerable: true, get: function() {
                return decode_2.decodeXML;
              } });
              Object.defineProperty(exports, "decodeHTML", { enumerable: true, get: function() {
                return decode_2.decodeHTML;
              } });
              Object.defineProperty(exports, "decodeHTMLStrict", { enumerable: true, get: function() {
                return decode_2.decodeHTMLStrict;
              } });
              Object.defineProperty(exports, "decodeHTML4", { enumerable: true, get: function() {
                return decode_2.decodeHTML;
              } });
              Object.defineProperty(exports, "decodeHTML5", { enumerable: true, get: function() {
                return decode_2.decodeHTML;
              } });
              Object.defineProperty(exports, "decodeHTML4Strict", { enumerable: true, get: function() {
                return decode_2.decodeHTMLStrict;
              } });
              Object.defineProperty(exports, "decodeHTML5Strict", { enumerable: true, get: function() {
                return decode_2.decodeHTMLStrict;
              } });
              Object.defineProperty(exports, "decodeXMLStrict", { enumerable: true, get: function() {
                return decode_2.decodeXML;
              } });
            }
          });
          var require_utils = __commonJS({
            "node_modules/.pnpm/rss-parser@3.13.0/node_modules/rss-parser/lib/utils.js"(exports, module) {
              var utils = module.exports = {};
              var entities = require_lib2();
              var xml2js = require_xml2js();
              utils.stripHtml = function(str) {
                str = str.replace(/([^\n])<\/?(h|br|p|ul|ol|li|blockquote|section|table|tr|div)(?:.|\n)*?>([^\n])/gm, "$1\n$3");
                str = str.replace(/<(?:.|\n)*?>/gm, "");
                return str;
              };
              utils.getSnippet = function(str) {
                return entities.decodeHTML(utils.stripHtml(str)).trim();
              };
              utils.getLink = function(links, rel, fallbackIdx) {
                if (!links)
                  return;
                for (let i = 0; i < links.length; ++i) {
                  if (links[i].$.rel === rel)
                    return links[i].$.href;
                }
                if (links[fallbackIdx])
                  return links[fallbackIdx].$.href;
              };
              utils.getContent = function(content) {
                if (typeof content._ === "string") {
                  return content._;
                } else if (typeof content === "object") {
                  let builder = new xml2js.Builder({ headless: true, explicitRoot: true, rootName: "div", renderOpts: { pretty: false } });
                  return builder.buildObject(content);
                } else {
                  return content;
                }
              };
              utils.copyFromXML = function(xml, dest, fields) {
                fields.forEach(function(f) {
                  let from = f;
                  let to = f;
                  let options = {};
                  if (Array.isArray(f)) {
                    from = f[0];
                    to = f[1];
                    if (f.length > 2) {
                      options = f[2];
                    }
                  }
                  const { keepArray, includeSnippet } = options;
                  if (xml[from] !== void 0) {
                    dest[to] = keepArray ? xml[from] : xml[from][0];
                  }
                  if (dest[to] && typeof dest[to]._ === "string") {
                    dest[to] = dest[to]._;
                  }
                  if (includeSnippet && dest[to] && typeof dest[to] === "string") {
                    dest[to + "Snippet"] = utils.getSnippet(dest[to]);
                  }
                });
              };
              utils.maybePromisify = function(callback, promise) {
                if (!callback)
                  return promise;
                return promise.then(
                  (data) => setTimeout(() => callback(null, data)),
                  (err) => setTimeout(() => callback(err))
                );
              };
              var DEFAULT_ENCODING = "utf8";
              var ENCODING_REGEX = /(encoding|charset)\s*=\s*(\S+)/;
              var SUPPORTED_ENCODINGS = ["ascii", "utf8", "utf16le", "ucs2", "base64", "latin1", "binary", "hex"];
              var ENCODING_ALIASES = {
                "utf-8": "utf8",
                "iso-8859-1": "latin1"
              };
              utils.getEncodingFromContentType = function(contentType) {
                contentType = contentType || "";
                let match = contentType.match(ENCODING_REGEX);
                let encoding = (match || [])[2] || "";
                encoding = encoding.toLowerCase();
                encoding = ENCODING_ALIASES[encoding] || encoding;
                if (!encoding || SUPPORTED_ENCODINGS.indexOf(encoding) === -1) {
                  encoding = DEFAULT_ENCODING;
                }
                return encoding;
              };
            }
          });
          var require_parser2 = __commonJS({
            "node_modules/.pnpm/rss-parser@3.13.0/node_modules/rss-parser/lib/parser.js"(exports, module) {
              "use strict";
              var http2 = __require2("http");
              var https = __require2("https");
              var xml2js = require_xml2js();
              var url2 = __require2("url");
              var fields = require_fields();
              var utils = require_utils();
              var DEFAULT_HEADERS = {
                "User-Agent": "rss-parser",
                "Accept": "application/rss+xml"
              };
              var DEFAULT_MAX_REDIRECTS = 5;
              var DEFAULT_TIMEOUT = 6e4;
              var Parser2 = class {
                constructor(options = {}) {
                  options.headers = options.headers || {};
                  options.xml2js = options.xml2js || {};
                  options.customFields = options.customFields || {};
                  options.customFields.item = options.customFields.item || [];
                  options.customFields.feed = options.customFields.feed || [];
                  options.requestOptions = options.requestOptions || {};
                  if (!options.maxRedirects)
                    options.maxRedirects = DEFAULT_MAX_REDIRECTS;
                  if (!options.timeout)
                    options.timeout = DEFAULT_TIMEOUT;
                  this.options = options;
                  this.xmlParser = new xml2js.Parser(this.options.xml2js);
                }
                parseString(xml, callback) {
                  let prom = new Promise((resolve, reject) => {
                    this.xmlParser.parseString(xml, (err, result) => {
                      if (err)
                        return reject(err);
                      if (!result) {
                        return reject(new Error("Unable to parse XML."));
                      }
                      let feed = null;
                      if (result.feed) {
                        feed = this.buildAtomFeed(result);
                      } else if (result.rss && result.rss.$ && result.rss.$.version && result.rss.$.version.match(/^2/)) {
                        feed = this.buildRSS2(result);
                      } else if (result["rdf:RDF"]) {
                        feed = this.buildRSS1(result);
                      } else if (result.rss && result.rss.$ && result.rss.$.version && result.rss.$.version.match(/0\.9/)) {
                        feed = this.buildRSS0_9(result);
                      } else if (result.rss && this.options.defaultRSS) {
                        switch (this.options.defaultRSS) {
                          case 0.9:
                            feed = this.buildRSS0_9(result);
                            break;
                          case 1:
                            feed = this.buildRSS1(result);
                            break;
                          case 2:
                            feed = this.buildRSS2(result);
                            break;
                          default:
                            return reject(new Error("default RSS version not recognized."));
                        }
                      } else {
                        return reject(new Error("Feed not recognized as RSS 1 or 2."));
                      }
                      resolve(feed);
                    });
                  });
                  prom = utils.maybePromisify(callback, prom);
                  return prom;
                }
                parseURL(feedUrl, callback, redirectCount = 0) {
                  let xml = "";
                  let get = feedUrl.indexOf("https") === 0 ? https.get : http2.get;
                  let urlParts = url2.parse(feedUrl);
                  let headers = Object.assign({}, DEFAULT_HEADERS, this.options.headers);
                  let timeout = null;
                  let prom = new Promise((resolve, reject) => {
                    const requestOpts = Object.assign({ headers }, urlParts, this.options.requestOptions);
                    let req2 = get(requestOpts, (res2) => {
                      if (this.options.maxRedirects && res2.statusCode >= 300 && res2.statusCode < 400 && res2.headers["location"]) {
                        if (redirectCount === this.options.maxRedirects) {
                          return reject(new Error("Too many redirects"));
                        } else {
                          const newLocation = url2.resolve(feedUrl, res2.headers["location"]);
                          return this.parseURL(newLocation, null, redirectCount + 1).then(resolve, reject);
                        }
                      } else if (res2.statusCode >= 300) {
                        return reject(new Error("Status code " + res2.statusCode));
                      }
                      let encoding = utils.getEncodingFromContentType(res2.headers["content-type"]);
                      res2.setEncoding(encoding);
                      res2.on("data", (chunk) => {
                        xml += chunk;
                      });
                      res2.on("end", () => {
                        return this.parseString(xml).then(resolve, reject);
                      });
                    });
                    req2.on("error", reject);
                    timeout = setTimeout(() => {
                      return reject(new Error("Request timed out after " + this.options.timeout + "ms"));
                    }, this.options.timeout);
                  }).then((data) => {
                    clearTimeout(timeout);
                    return Promise.resolve(data);
                  }, (e) => {
                    clearTimeout(timeout);
                    return Promise.reject(e);
                  });
                  prom = utils.maybePromisify(callback, prom);
                  return prom;
                }
                buildAtomFeed(xmlObj) {
                  let feed = { items: [] };
                  utils.copyFromXML(xmlObj.feed, feed, this.options.customFields.feed);
                  if (xmlObj.feed.link) {
                    feed.link = utils.getLink(xmlObj.feed.link, "alternate", 0);
                    feed.feedUrl = utils.getLink(xmlObj.feed.link, "self", 1);
                  }
                  if (xmlObj.feed.title) {
                    let title = xmlObj.feed.title[0] || "";
                    if (title._)
                      title = title._;
                    if (title)
                      feed.title = title;
                  }
                  if (xmlObj.feed.updated) {
                    feed.lastBuildDate = xmlObj.feed.updated[0];
                  }
                  feed.items = (xmlObj.feed.entry || []).map((entry) => this.parseItemAtom(entry));
                  return feed;
                }
                parseItemAtom(entry) {
                  let item = {};
                  utils.copyFromXML(entry, item, this.options.customFields.item);
                  if (entry.title) {
                    let title = entry.title[0] || "";
                    if (title._)
                      title = title._;
                    if (title)
                      item.title = title;
                  }
                  if (entry.link && entry.link.length) {
                    item.link = utils.getLink(entry.link, "alternate", 0);
                  }
                  if (entry.published && entry.published.length && entry.published[0].length)
                    item.pubDate = new Date(entry.published[0]).toISOString();
                  if (!item.pubDate && entry.updated && entry.updated.length && entry.updated[0].length)
                    item.pubDate = new Date(entry.updated[0]).toISOString();
                  if (entry.author && entry.author.length && entry.author[0].name && entry.author[0].name.length)
                    item.author = entry.author[0].name[0];
                  if (entry.content && entry.content.length) {
                    item.content = utils.getContent(entry.content[0]);
                    item.contentSnippet = utils.getSnippet(item.content);
                  }
                  if (entry.summary && entry.summary.length) {
                    item.summary = utils.getContent(entry.summary[0]);
                  }
                  if (entry.id) {
                    item.id = entry.id[0];
                  }
                  this.setISODate(item);
                  return item;
                }
                buildRSS0_9(xmlObj) {
                  var channel = xmlObj.rss.channel[0];
                  var items = channel.item;
                  return this.buildRSS(channel, items);
                }
                buildRSS1(xmlObj) {
                  xmlObj = xmlObj["rdf:RDF"];
                  let channel = xmlObj.channel[0];
                  let items = xmlObj.item;
                  return this.buildRSS(channel, items);
                }
                buildRSS2(xmlObj) {
                  let channel = xmlObj.rss.channel[0];
                  let items = channel.item;
                  let feed = this.buildRSS(channel, items);
                  if (xmlObj.rss.$ && xmlObj.rss.$["xmlns:itunes"]) {
                    this.decorateItunes(feed, channel);
                  }
                  return feed;
                }
                buildRSS(channel, items) {
                  items = items || [];
                  let feed = { items: [] };
                  let feedFields = fields.feed.concat(this.options.customFields.feed);
                  let itemFields = fields.item.concat(this.options.customFields.item);
                  if (channel["atom:link"] && channel["atom:link"][0] && channel["atom:link"][0].$) {
                    feed.feedUrl = channel["atom:link"][0].$.href;
                  }
                  if (channel.image && channel.image[0] && channel.image[0].url) {
                    feed.image = {};
                    let image = channel.image[0];
                    if (image.link)
                      feed.image.link = image.link[0];
                    if (image.url)
                      feed.image.url = image.url[0];
                    if (image.title)
                      feed.image.title = image.title[0];
                    if (image.width)
                      feed.image.width = image.width[0];
                    if (image.height)
                      feed.image.height = image.height[0];
                  }
                  const paginationLinks = this.generatePaginationLinks(channel);
                  if (Object.keys(paginationLinks).length) {
                    feed.paginationLinks = paginationLinks;
                  }
                  utils.copyFromXML(channel, feed, feedFields);
                  feed.items = items.map((xmlItem) => this.parseItemRss(xmlItem, itemFields));
                  return feed;
                }
                parseItemRss(xmlItem, itemFields) {
                  let item = {};
                  utils.copyFromXML(xmlItem, item, itemFields);
                  if (xmlItem.enclosure) {
                    item.enclosure = xmlItem.enclosure[0].$;
                  }
                  if (xmlItem.description) {
                    item.content = utils.getContent(xmlItem.description[0]);
                    item.contentSnippet = utils.getSnippet(item.content);
                  }
                  if (xmlItem.guid) {
                    item.guid = xmlItem.guid[0];
                    if (item.guid._)
                      item.guid = item.guid._;
                  }
                  if (xmlItem.$ && xmlItem.$["rdf:about"]) {
                    item["rdf:about"] = xmlItem.$["rdf:about"];
                  }
                  if (xmlItem.category)
                    item.categories = xmlItem.category;
                  this.setISODate(item);
                  return item;
                }
                /**
                 * Add iTunes specific fields from XML to extracted JSON
                 *
                 * @access public
                 * @param {object} feed extracted
                 * @param {object} channel parsed XML
                 */
                decorateItunes(feed, channel) {
                  let items = channel.item || [];
                  let categories = [];
                  feed.itunes = {};
                  if (channel["itunes:owner"]) {
                    let owner = {};
                    if (channel["itunes:owner"][0]["itunes:name"]) {
                      owner.name = channel["itunes:owner"][0]["itunes:name"][0];
                    }
                    if (channel["itunes:owner"][0]["itunes:email"]) {
                      owner.email = channel["itunes:owner"][0]["itunes:email"][0];
                    }
                    feed.itunes.owner = owner;
                  }
                  if (channel["itunes:image"]) {
                    let image;
                    let hasImageHref = channel["itunes:image"][0] && channel["itunes:image"][0].$ && channel["itunes:image"][0].$.href;
                    image = hasImageHref ? channel["itunes:image"][0].$.href : null;
                    if (image) {
                      feed.itunes.image = image;
                    }
                  }
                  if (channel["itunes:category"]) {
                    const categoriesWithSubs = channel["itunes:category"].map((category) => {
                      return {
                        name: category && category.$ && category.$.text,
                        subs: category["itunes:category"] ? category["itunes:category"].map((subcategory) => ({
                          name: subcategory && subcategory.$ && subcategory.$.text
                        })) : null
                      };
                    });
                    feed.itunes.categories = categoriesWithSubs.map((category) => category.name);
                    feed.itunes.categoriesWithSubs = categoriesWithSubs;
                  }
                  if (channel["itunes:keywords"]) {
                    if (channel["itunes:keywords"].length > 1) {
                      feed.itunes.keywords = channel["itunes:keywords"].map(
                        (keyword) => keyword && keyword.$ && keyword.$.text
                      );
                    } else {
                      let keywords = channel["itunes:keywords"][0];
                      if (keywords && typeof keywords._ === "string") {
                        keywords = keywords._;
                      }
                      if (keywords && keywords.$ && keywords.$.text) {
                        feed.itunes.keywords = keywords.$.text.split(",");
                      } else if (typeof keywords === "string") {
                        feed.itunes.keywords = keywords.split(",");
                      }
                    }
                  }
                  utils.copyFromXML(channel, feed.itunes, fields.podcastFeed);
                  items.forEach((item, index) => {
                    let entry = feed.items[index];
                    entry.itunes = {};
                    utils.copyFromXML(item, entry.itunes, fields.podcastItem);
                    let image = item["itunes:image"];
                    if (image && image[0] && image[0].$ && image[0].$.href) {
                      entry.itunes.image = image[0].$.href;
                    }
                  });
                }
                setISODate(item) {
                  let date = item.pubDate || item.date;
                  if (date) {
                    try {
                      item.isoDate = new Date(date.trim()).toISOString();
                    } catch (e) {
                    }
                  }
                }
                /**
                 * Generates a pagination object where the rel attribute is the key and href attribute is the value
                 *  { self: 'self-url', first: 'first-url', ...  }
                 *
                 * @access private
                 * @param {Object} channel parsed XML
                 * @returns {Object}
                 */
                generatePaginationLinks(channel) {
                  if (!channel["atom:link"]) {
                    return {};
                  }
                  const paginationRelAttributes = ["self", "first", "next", "prev", "last"];
                  return channel["atom:link"].reduce((paginationLinks, link) => {
                    if (!link.$ || !paginationRelAttributes.includes(link.$.rel)) {
                      return paginationLinks;
                    }
                    paginationLinks[link.$.rel] = link.$.href;
                    return paginationLinks;
                  }, {});
                }
              };
              module.exports = Parser2;
            }
          });
          var require_rss_parser = __commonJS({
            "node_modules/.pnpm/rss-parser@3.13.0/node_modules/rss-parser/index.js"(exports, module) {
              "use strict";
              module.exports = require_parser2();
            }
          });
          var require_dist = __commonJS({
            "node_modules/.pnpm/@edgeone+pages-blob@0.0.8/node_modules/@edgeone/pages-blob/dist/index.js"(exports, module) {
              "use strict";
              var j = Object.defineProperty;
              var ie = Object.getOwnPropertyDescriptor;
              var ae = Object.getOwnPropertyNames;
              var ce = Object.prototype.hasOwnProperty;
              var de = (t, e) => {
                for (var n in e)
                  j(t, n, { get: e[n], enumerable: true });
              };
              var le = (t, e, n, r) => {
                if (e && typeof e == "object" || typeof e == "function")
                  for (let o of ae(e))
                    !ce.call(t, o) && o !== n && j(t, o, { get: () => e[o], enumerable: !(r = ie(e, o)) || r.enumerable });
                return t;
              };
              var ue = (t) => le(j({}, "__esModule", { value: true }), t);
              var Ae = {};
              de(Ae, { InvalidKeyError: () => p, InvalidStoreNameError: () => y, MissingProjectIdError: () => x, PagesBlobError: () => h, PreconditionFailedError: () => C, QuotaExceededError: () => v, RateLimitedError: () => A, Store: () => b, getStore: () => Re, listStores: () => ve });
              module.exports = ue(Ae);
              var h = class extends Error {
                code;
                constructor(e, n) {
                  super(`PagesBlob: ${n}`), this.name = "PagesBlobError", this.code = e;
                }
              };
              var p = class extends h {
                constructor(e) {
                  super("INVALID_KEY", e);
                }
              };
              var y = class extends h {
                constructor(e) {
                  super("INVALID_STORE_NAME", e);
                }
              };
              var T = class extends h {
                constructor(e) {
                  super("MISSING_ENVIRONMENT", `Environment not configured for Pages Blob. Missing: ${e.join(", ")}. Supply these properties when creating a store, or ensure the function is running in a Pages environment.`);
                }
              };
              var v = class extends h {
                constructor() {
                  super("QUOTA_EXCEEDED", "storage quota exceeded");
                }
              };
              var A = class extends h {
                constructor() {
                  super("RATE_LIMITED", "request rate limited, please retry later");
                }
              };
              var x = class extends h {
                constructor() {
                  super("MISSING_PROJECT_ID", "projectId is required when using API token mode. Please supply { name, projectId, token } to getStore() / listStores().");
                }
              };
              var m = class extends h {
                constructor(e) {
                  super("CREDENTIAL_ERROR", e);
                }
              };
              var g = class extends h {
                constructor(e, n) {
                  super("COS_ERROR", `COS returned ${e}: ${n}`);
                }
              };
              var C = class extends h {
                constructor() {
                  super("PRECONDITION_FAILED", "conditional write failed (key already exists)");
                }
              };
              function w(t) {
                if (t === "")
                  throw new p("Blob key must not be empty.");
                if (t.startsWith("/") || t.startsWith("%2F"))
                  throw new p("Blob key must not start with forward slash (/).");
                if (new TextEncoder().encode(t).length > 600)
                  throw new p("Blob key must be a sequence of Unicode characters whose UTF-8 encoding is at most 600 bytes long.");
              }
              function L(t) {
                if (t === "")
                  throw new y("Store name must not be empty.");
                if (t.includes("/") || t.includes(":"))
                  throw new y("Store name must not contain forward slashes (/) or colons (:).");
                if (!/^[a-zA-Z0-9_-]+$/.test(t))
                  throw new y("Store name must only contain letters, digits, underscores, and hyphens.");
                if (new TextEncoder().encode(t).length > 64)
                  throw new y("Store name must be a sequence of Unicode characters whose UTF-8 encoding is at most 64 bytes long.");
              }
              var b = class {
                cosClient;
                storeName;
                defaultConsistency;
                constructor(e, n, r = "eventual") {
                  this.cosClient = e, this.storeName = n, this.defaultConsistency = r;
                }
                resolveConsistency(e) {
                  return e ?? this.defaultConsistency;
                }
                async set(e, n, r) {
                  w(e);
                  let o = await this.cosClient.putObject(this.storeName, e, n, { onlyIfNew: r == null ? void 0 : r.onlyIfNew, cacheControl: r == null ? void 0 : r.cacheControl });
                  if ((r == null ? void 0 : r.onlyIfNew) && o.statusCode === 412)
                    throw new C();
                }
                async setJSON(e, n, r) {
                  w(e);
                  let o = JSON.stringify(n), s = await this.cosClient.putObject(this.storeName, e, o, { onlyIfNew: r == null ? void 0 : r.onlyIfNew, contentType: "application/json", cacheControl: r == null ? void 0 : r.cacheControl });
                  if ((r == null ? void 0 : r.onlyIfNew) && s.statusCode === 412)
                    throw new C();
                }
                async createUploadUrl(e, n) {
                  w(e);
                  let { url: r, expiresAt: o } = await this.cosClient.createPresignedPutUrl(this.storeName, e, { expireSeconds: n == null ? void 0 : n.expireSeconds, contentType: n == null ? void 0 : n.contentType });
                  return { url: r, key: e, expiresAt: o };
                }
                async get(e, n) {
                  w(e);
                  let r = this.resolveConsistency(n == null ? void 0 : n.consistency), o = await this.cosClient.getObject(this.storeName, e, r);
                  if (o === null)
                    return null;
                  let { body: s } = o, a = (n == null ? void 0 : n.type) ?? "text", i = new TextDecoder("utf-8");
                  switch (a) {
                    case "text":
                      return i.decode(s);
                    case "json":
                      return JSON.parse(i.decode(s));
                    case "arrayBuffer":
                      return s.buffer.slice(s.byteOffset, s.byteOffset + s.byteLength);
                    case "blob":
                      return new Blob([s]);
                    case "stream":
                      return new ReadableStream({ start(c) {
                        c.enqueue(s), c.close();
                      } });
                    default:
                      return i.decode(s);
                  }
                }
                async getMetadata(e, n) {
                  w(e);
                  let r = this.resolveConsistency(n == null ? void 0 : n.consistency);
                  return this.cosClient.headObject(this.storeName, e, r);
                }
                async getWithHeaders(e, n) {
                  w(e);
                  let r = this.resolveConsistency(n == null ? void 0 : n.consistency), o = await this.cosClient.getObject(this.storeName, e, r);
                  return o ? { body: new TextDecoder("utf-8").decode(o.body), headers: o.headers || {} } : null;
                }
                async delete(e) {
                  w(e), await this.cosClient.deleteObject(this.storeName, e);
                }
                async list(e) {
                  let n = (e == null ? void 0 : e.paginate) !== false, r = [], o = [], s = this.resolveConsistency(e == null ? void 0 : e.consistency), a = (e == null ? void 0 : e.cursor) || "", i = true;
                  for (; i; ) {
                    let c = await this.cosClient.listObjects(this.storeName, { prefix: e == null ? void 0 : e.prefix, delimiter: (e == null ? void 0 : e.directories) ? "/" : void 0, marker: a || void 0, maxKeys: 1e3, consistency: s });
                    for (let d of c.contents)
                      r.push({ key: d.key, etag: d.etag });
                    o.push(...c.commonPrefixes), !n || !c.isTruncated ? i = false : a = c.nextMarker;
                  }
                  return { blobs: r, directories: o };
                }
              };
              var ge = new TextEncoder();
              function N(t) {
                let e = ge.encode(t), n = new ArrayBuffer(e.byteLength), r = new Uint8Array(n);
                return r.set(e), r;
              }
              function H(t) {
                let e = t instanceof Uint8Array ? t : new Uint8Array(t), n = "";
                for (let r = 0; r < e.length; r++)
                  n += e[r].toString(16).padStart(2, "0");
                return n;
              }
              async function _(t, e) {
                let n = await crypto.subtle.importKey("raw", N(t), { name: "HMAC", hash: "SHA-1" }, false, ["sign"]), r = await crypto.subtle.sign("HMAC", n, N(e));
                return H(r);
              }
              async function fe(t) {
                let e = await crypto.subtle.digest("SHA-1", N(t));
                return H(e);
              }
              function M(t) {
                return encodeURIComponent(t).replace(/[!'()*]/g, (e) => "%" + e.charCodeAt(0).toString(16).toUpperCase());
              }
              function D(t) {
                try {
                  return decodeURIComponent(t);
                } catch {
                  return t;
                }
              }
              function Y(t) {
                return t.split("/").map((e) => D(e)).join("/");
              }
              function X(t) {
                return t.split("/").map((e) => M(D(e))).join("/");
              }
              var he = /* @__PURE__ */ new Set(["cache-control", "content-disposition", "content-encoding", "content-length", "content-md5", "content-type", "expect", "expires", "if-match", "if-modified-since", "if-none-match", "if-unmodified-since", "origin", "range", "transfer-encoding"]);
              function me(t) {
                return t === "host" || t === "x-cos-security-token" ? false : !!(he.has(t) || t.startsWith("x-cos-"));
              }
              function K(t) {
                if (!t)
                  return [];
                let e = [];
                for (let [n, r] of Object.entries(t))
                  r != null && e.push([n.toLowerCase(), String(r)]);
                return e.sort(([n], [r]) => n < r ? -1 : n > r ? 1 : 0), e;
              }
              function q(t) {
                return t.map(([e, n]) => `${M(e)}=${M(n)}`).join("&");
              }
              function z(t) {
                return t.map(([e]) => M(e)).join(";");
              }
              async function F(t) {
                let e = t.method.toLowerCase(), n = t.pathname.startsWith("/") ? t.pathname : `/${t.pathname}`, r = Math.floor(Date.now() / 1e3), o = r + (t.expireSeconds ?? 3600), s = `${r};${o}`, i = K(t.headers).filter(([B]) => me(B)), c = z(i), d = q(i), u = K(t.query), l = z(u), f = q(u), E = `${e}
${n}
${f}
${d}
`, te = `sha1
${s}
${await fe(E)}
`, ne = await _(t.secretKey, s), re = await _(ne, te), se = ["q-sign-algorithm=sha1", `q-ak=${t.secretId}`, `q-sign-time=${s}`, `q-key-time=${s}`, `q-header-list=${c}`, `q-url-param-list=${l}`, `q-signature=${re}`].join("&"), U = {};
                for (let [B, oe] of i)
                  U[B] = oe;
                return { authorization: se, signedHeaders: U };
              }
              async function G(t) {
                let e = new URL(t.domain), n = D(t.key), r = `/${Y(n)}`, o = `/${X(n)}`;
                e.pathname = o;
                let { authorization: s } = await F({ method: t.method, pathname: r, query: t.query, headers: t.headers, secretId: t.credential.secretId, secretKey: t.credential.secretKey, expireSeconds: t.expireSeconds });
                if (t.query)
                  for (let [a, i] of Object.entries(t.query))
                    i != null && e.searchParams.set(a, String(i));
                for (let a of s.split("&")) {
                  let i = a.indexOf("=");
                  if (i === -1)
                    continue;
                  let c = a.slice(0, i), d = a.slice(i + 1);
                  e.searchParams.set(c, d);
                }
                return t.credential.sessionToken && e.searchParams.set("x-cos-security-token", t.credential.sessionToken), e.toString();
              }
              async function S(t) {
                let e = new URL(t.domain), n = t.key ? D(t.key) : "", r = n ? `/${Y(n)}` : "/", o = n ? `/${X(n)}` : "/";
                if (e.pathname = o, t.query)
                  for (let [l, f] of Object.entries(t.query))
                    f != null && e.searchParams.set(l, String(f));
                let { authorization: s } = await F({ method: t.method, pathname: r, query: t.query, headers: t.headers, secretId: t.credential.secretId, secretKey: t.credential.secretKey }), a = new Headers();
                if (t.headers)
                  for (let [l, f] of Object.entries(t.headers))
                    f != null && a.set(l, String(f));
                a.set("Authorization", s), t.credential.sessionToken && a.set("x-cos-security-token", t.credential.sessionToken);
                let i = e.toString(), c = { method: t.method, headers: a, body: t.body ?? void 0, signal: t.signal }, d = 2, u;
                for (let l = 0; l <= d; l++)
                  try {
                    return await fetch(i, c);
                  } catch (f) {
                    if (u = f, f instanceof DOMException && f.name === "AbortError")
                      throw f;
                    l < d && await new Promise((E) => setTimeout(E, 1e3 * (l + 1)));
                  }
                throw u;
              }
              var ye = "blob.edgeone.site";
              var pe = "blob-nocache.edgeone.site";
              var k = class t {
                credentialManager;
                bucket = "";
                region = "";
                keyPrefix = "";
                cachedDomain = "";
                uncachedDomain = "";
                initialized = false;
                static buildErrorDetail(e, n, r, o) {
                  let s = r ? `${n}/${r}` : n;
                  return `${e} ${s} - ${we(o)}`;
                }
                constructor(e) {
                  this.credentialManager = e;
                }
                computeSubdomain(e) {
                  let n = [];
                  if (e.appId && n.push(e.appId), e.zoneId && n.push(e.zoneId), e.projectId && n.push(e.projectId), n.length >= 2)
                    return n.join("-");
                  if (e.resourcePrefix) {
                    let o = e.resourcePrefix.replace(/\/?\*$/, "").split("/").filter(Boolean);
                    if (o.length >= 2)
                      return o.slice(0, Math.min(o.length, 3)).join("-");
                  }
                  return "";
                }
                async ensureInitialized() {
                  if (this.initialized)
                    return;
                  let e = await this.credentialManager.getCredential();
                  !this.keyPrefix && e.resourcePrefix && (this.keyPrefix = e.resourcePrefix.replace(/\/?\*$/, ""));
                  let n = e.edgeRegion === "CN", r = e.cosMainland, o = e.cosOverseas, s = n ? r || o : o || r;
                  !this.bucket && s && (this.bucket = s.bucket, this.region = s.region);
                  let a = this.computeSubdomain(e);
                  if (!a)
                    throw new g(0, "unable to derive tenant subdomain from credential; missing appId/zoneId/projectId or resourcePrefix");
                  this.cachedDomain = `https://${a}.${ye}`, this.uncachedDomain = `https://${a}.${pe}`, this.initialized = true;
                }
                async resolveDomain(e) {
                  return await this.ensureInitialized(), e === "strong" ? this.uncachedDomain : this.cachedDomain;
                }
                async resolveCredential() {
                  let e = await this.credentialManager.getCredential();
                  return { secretId: e.tmpSecretId, secretKey: e.tmpSecretKey, sessionToken: e.sessionToken };
                }
                buildCosKey(e, n) {
                  return `${this.keyPrefix}/${e}/${n}`;
                }
                async getDomains() {
                  return await this.ensureInitialized(), { cached: this.cachedDomain, uncached: this.uncachedDomain };
                }
                async putObject(e, n, r, o) {
                  let s = await this.resolveDomain("eventual"), a = await this.resolveCredential(), i = this.buildCosKey(e, n), d = (o == null ? void 0 : o.cacheControl) === null ? void 0 : (o == null ? void 0 : o.cacheControl) ?? "max-age=0, stale-while-revalidate=60", u = {};
                  (o == null ? void 0 : o.onlyIfNew) && (u["If-None-Match"] = "*"), d && (u["Cache-Control"] = d), (o == null ? void 0 : o.contentType) && (u["Content-Type"] = o.contentType);
                  try {
                    let l = await S({ domain: s, method: "PUT", key: i, headers: u, body: r, credential: a });
                    if (l.status === 412)
                      return await l.arrayBuffer().catch(() => {
                      }), { etag: "", statusCode: 412 };
                    if (!l.ok) {
                      let E = await P(l);
                      throw new g(l.status, t.buildErrorDetail("PUT", s, i, E || `status ${l.status}`));
                    }
                    let f = l.headers.get("etag") || "";
                    return await l.arrayBuffer().catch(() => {
                    }), { etag: f, statusCode: l.status };
                  } catch (l) {
                    throw l instanceof g ? l : new g(0, t.buildErrorDetail("PUT", s, i, l.message || String(l)));
                  }
                }
                async createPresignedPutUrl(e, n, r) {
                  let o = await this.resolveDomain("eventual"), s = await this.resolveCredential(), a = this.buildCosKey(e, n), i = {};
                  (r == null ? void 0 : r.contentType) && (i["Content-Type"] = r.contentType);
                  let c = (r == null ? void 0 : r.expireSeconds) ?? 3600, d = await G({ domain: o, method: "PUT", key: a, headers: i, credential: s, expireSeconds: c }), u = Math.floor(Date.now() / 1e3) + c;
                  return { url: d, expiresAt: u };
                }
                async getObject(e, n, r) {
                  let o = await this.resolveDomain(r), s = await this.resolveCredential(), a = this.buildCosKey(e, n);
                  try {
                    let i = await S({ domain: o, method: "GET", key: a, credential: s });
                    if (i.status === 404)
                      return await i.arrayBuffer().catch(() => {
                      }), null;
                    if (!i.ok) {
                      let u = await P(i);
                      throw new g(i.status, t.buildErrorDetail("GET", o, a, u || `status ${i.status}`));
                    }
                    let c = new Uint8Array(await i.arrayBuffer()), d = W(i.headers);
                    return { body: c, contentType: d["content-type"], headers: d };
                  } catch (i) {
                    throw i instanceof g ? i : new g(0, t.buildErrorDetail("GET", o, a, i.message || String(i)));
                  }
                }
                async headObject(e, n, r) {
                  let o = await this.resolveDomain(r), s = await this.resolveCredential(), a = this.buildCosKey(e, n);
                  try {
                    let i = await S({ domain: o, method: "HEAD", key: a, credential: s });
                    if (i.status === 404)
                      return null;
                    if (!i.ok) {
                      let d = await P(i);
                      throw new g(i.status, t.buildErrorDetail("HEAD", o, a, d || `status ${i.status}`));
                    }
                    let c = W(i.headers);
                    return { cacheControl: c["cache-control"], contentType: c["content-type"], etag: c.etag, headers: c };
                  } catch (i) {
                    throw i instanceof g ? i : new g(0, t.buildErrorDetail("HEAD", o, a, i.message || String(i)));
                  }
                }
                async deleteObject(e, n) {
                  let r = await this.resolveDomain("eventual"), o = await this.resolveCredential(), s = this.buildCosKey(e, n);
                  try {
                    let a = await S({ domain: r, method: "DELETE", key: s, credential: o });
                    if (a.status === 204 || a.status === 404 || a.ok) {
                      await a.arrayBuffer().catch(() => {
                      });
                      return;
                    }
                    let i = await P(a);
                    throw new g(a.status, t.buildErrorDetail("DELETE", r, s, i || `status ${a.status}`));
                  } catch (a) {
                    throw a instanceof g ? a : new g(0, t.buildErrorDetail("DELETE", r, s, a.message || String(a)));
                  }
                }
                async listObjects(e, n) {
                  await this.ensureInitialized();
                  let r = `${this.keyPrefix}/${e}/`, o = (n == null ? void 0 : n.prefix) ? r + n.prefix : r, s = await this.getBucketRaw({ prefix: o, delimiter: n == null ? void 0 : n.delimiter, marker: n == null ? void 0 : n.marker, maxKeys: n == null ? void 0 : n.maxKeys, consistency: n == null ? void 0 : n.consistency }), a = s.contents.map((c) => {
                    let d = c.key, u = d.startsWith(r) ? d.slice(r.length) : d;
                    return u ? { key: u, etag: c.etag } : null;
                  }).filter((c) => c !== null), i = s.commonPrefixes.map((c) => c.startsWith(r) ? c.slice(r.length) : c).filter((c) => !!c);
                  return { contents: a, commonPrefixes: i, isTruncated: s.isTruncated, nextMarker: s.nextMarker };
                }
                async listStores(e) {
                  let n = [], r = "", o = true;
                  for (; o; ) {
                    await this.ensureInitialized();
                    let s = `${this.keyPrefix}/`, a = await this.getBucketRaw({ prefix: s, delimiter: "/", maxKeys: 1e3, marker: r || void 0, consistency: e });
                    for (let i of a.commonPrefixes) {
                      let c = i.startsWith(s) ? i.slice(s.length, -1) : i.slice(0, -1);
                      c && n.push(c);
                    }
                    if (o = a.isTruncated, r = a.nextMarker, !o || !r)
                      break;
                  }
                  return n;
                }
                async getBucketRaw(e) {
                  let n = await this.resolveDomain(e.consistency), r = await this.resolveCredential(), o = { prefix: e.prefix };
                  e.delimiter && (o.delimiter = e.delimiter), e.marker && (o.marker = e.marker), e.maxKeys && (o["max-keys"] = e.maxKeys);
                  try {
                    let s = await S({ domain: n, method: "GET", query: o, credential: r });
                    if (!s.ok) {
                      let i = await P(s);
                      throw new g(s.status, t.buildErrorDetail("LIST", n, e.prefix, i || `status ${s.status}`));
                    }
                    let a = await s.text();
                    return Ce(a);
                  } catch (s) {
                    throw s instanceof g ? s : new g(0, t.buildErrorDetail("LIST", n, e.prefix, s.message || String(s)));
                  }
                }
              };
              function we(t) {
                return t.replace(/[a-zA-Z0-9\-]+\.cos\.[a-zA-Z0-9\-.]+\.myqcloud\.com/gi, "[cos-origin]").replace(/[a-zA-Z0-9\-]+\.cos\.[a-zA-Z0-9\-.]+\.tencentcos\.cn/gi, "[cos-origin]");
              }
              async function P(t) {
                try {
                  return await t.text();
                } catch {
                  return "";
                }
              }
              function W(t) {
                let e = {};
                return t.forEach((n, r) => {
                  e[r.toLowerCase()] = n;
                }), e;
              }
              function Ce(t) {
                let e = [], n = /<Contents>([\s\S]*?)<\/Contents>/g, r;
                for (; (r = n.exec(t)) !== null; ) {
                  let d = r[1], u = I(d, "Key"), l = I(d, "ETag");
                  u !== null && e.push({ key: $(u), etag: l || "" });
                }
                let o = [], s = /<CommonPrefixes>([\s\S]*?)<\/CommonPrefixes>/g;
                for (; (r = s.exec(t)) !== null; ) {
                  let d = r[1], u = I(d, "Prefix");
                  u !== null && o.push($(u));
                }
                let i = I(t, "IsTruncated") === "true", c = I(t, "NextMarker") || "";
                return { contents: e, commonPrefixes: o, isTruncated: i, nextMarker: $(c) };
              }
              function I(t, e) {
                let r = new RegExp(`<${e}>([\\s\\S]*?)<\\/${e}>`).exec(t);
                return r ? r[1] : null;
              }
              function $(t) {
                return t.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&");
              }
              var xe = "X-RateLimit-Reset";
              async function O(t, e, n = 5) {
                var _a, _b;
                (_b = (_a = e.signal) == null ? void 0 : _a.throwIfAborted) == null ? void 0 : _b.call(_a);
                try {
                  let r = await fetch(t, e);
                  if (n > 0 && (r.status === 429 || r.status >= 500)) {
                    let o = V(r.headers.get(xe));
                    return await J(o, e.signal), O(t, e, n - 1);
                  }
                  return r;
                } catch (r) {
                  if (n === 0 || r instanceof DOMException && r.name === "AbortError")
                    throw r;
                  let o = V();
                  return await J(o, e.signal), O(t, e, n - 1);
                }
              }
              function V(t) {
                return t ? Math.max(Number(t) * 1e3 - Date.now(), 1e3) : 5e3;
              }
              function J(t, e) {
                return new Promise((n, r) => {
                  if (e == null ? void 0 : e.aborted)
                    return r(e.reason);
                  let o = setTimeout(() => {
                    e == null ? void 0 : e.removeEventListener("abort", s), n();
                  }, t), s = () => {
                    clearTimeout(o), r(e.reason);
                  };
                  e == null ? void 0 : e.addEventListener("abort", s, { once: true });
                });
              }
              var be = "prod";
              function Z() {
                let t = typeof process < "u" ? process.env.PAGES_BLOB_STS_ENV : void 0;
                return t === "test" || t === "prod" ? t : be;
              }
              var Se = 300;
              var Ee = "https://blob-sts.edgeone.site/";
              var R = class {
                authToken;
                projectId;
                cached = null;
                constructor(e, n) {
                  this.authToken = e, this.projectId = n;
                }
                async getCredential() {
                  if (this.cached && !this.isExpired(this.cached))
                    return this.cached;
                  let e = await this.fetchCredential();
                  return this.cached = e, e;
                }
                clearCache() {
                  this.cached = null;
                }
                isExpired(e) {
                  let n = Math.floor(Date.now() / 1e3);
                  return e.expiredTime - n < Se;
                }
                async fetchCredential() {
                  for (let n = 1; n <= 3; n++) {
                    let r = await O(Ee, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.authToken}`, "X-Env": Z() }, body: JSON.stringify(this.projectId ? { ProjectId: this.projectId } : {}) });
                    if (r.status === 413)
                      throw new m("storage quota exceeded");
                    if (r.status === 429)
                      throw new m("rate limited, please retry later");
                    if (!r.ok) {
                      let a = await r.text().catch(() => "unknown error");
                      throw new m(`failed to obtain STS credential: ${r.status} ${a}`);
                    }
                    let o = await r.json(), s = o.data && typeof o.data == "object" ? o.data : o;
                    if (s.tmpSecretId && s.tmpSecretKey && s.sessionToken && s.expiredTime) {
                      let a = s.cosMainland, i = s.cosOverseas, c = r.headers.get("X-Edge-Region") || void 0;
                      return { tmpSecretId: s.tmpSecretId, tmpSecretKey: s.tmpSecretKey, sessionToken: s.sessionToken, expiredTime: s.expiredTime, appId: s.appId || void 0, zoneId: s.zoneId || void 0, projectId: s.projectId || void 0, resourcePrefix: s.resourcePrefix || void 0, cosMainland: a || void 0, cosOverseas: i || void 0, edgeRegion: c };
                    }
                    if (s.code !== void 0 && s.code !== 0) {
                      let a = s.msg || s.message || "unknown error";
                      throw new m(`credential exchange failed (code=${s.code}): ${a}`);
                    }
                    if (o.code !== void 0 && o.code !== 0) {
                      let a = o.msg || o.message || "unknown error";
                      throw new m(`credential exchange failed (code=${o.code}): ${a}`);
                    }
                    if (n < 3) {
                      await Te(1e3 * n);
                      continue;
                    }
                    throw new m("invalid STS credential response");
                  }
                  throw new m("invalid STS credential response");
                }
              };
              function Te(t) {
                return new Promise((e) => setTimeout(e, t));
              }
              var Pe = "{{PAGES_BLOB_DEPLOY_CREDENTIAL}}";
              function Q() {
                let t = Ie();
                if (t)
                  return { deployCredential: t };
                let e = ke("PAGES_BLOB_DEPLOY_CREDENTIAL");
                return e ? { deployCredential: e } : {};
              }
              function Ie() {
                let t = Pe;
                if (!(t.startsWith("{{") && t.endsWith("}}")))
                  return t || void 0;
              }
              function ke(t) {
                if (typeof process < "u" && process.env)
                  return process.env[t];
              }
              function Re(t) {
                let e = typeof t == "string" ? t : t.name;
                L(e);
                let n = ee(typeof t == "string" ? void 0 : t), r = new R(n.authToken, n.projectId), o = new k(r);
                return new b(o, e, n.consistency ?? "eventual");
              }
              async function ve(t) {
                let e = ee(t ? { name: "__list__", projectId: t.projectId, token: t.token, consistency: t.consistency } : void 0), n = new R(e.authToken, e.projectId);
                return { stores: (await new k(n).listStores(e.consistency)).map((s) => ({ name: s })) };
              }
              function ee(t) {
                if (t == null ? void 0 : t.token) {
                  if (!t.projectId)
                    throw new x();
                  return { authToken: t.token, projectId: t.projectId, consistency: t.consistency };
                }
                if ((t == null ? void 0 : t.projectId) && !t.token)
                  throw new T(["token"]);
                let e = Q();
                if (!e.deployCredential)
                  throw new T(["deployCredential"]);
                return { authToken: e.deployCredential, consistency: t == null ? void 0 : t.consistency };
              }
            }
          });
          var import_rss_parser = __toESM(require_rss_parser());
          var rnds8Pool = new Uint8Array(256);
          var poolPtr = rnds8Pool.length;
          function rng() {
            if (poolPtr > rnds8Pool.length - 16) {
              crypto2.randomFillSync(rnds8Pool);
              poolPtr = 0;
            }
            return rnds8Pool.slice(poolPtr, poolPtr += 16);
          }
          var byteToHex = [];
          for (let i = 0; i < 256; ++i) {
            byteToHex.push((i + 256).toString(16).slice(1));
          }
          function unsafeStringify(arr, offset = 0) {
            return byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]];
          }
          var native_default = {
            randomUUID: crypto3.randomUUID
          };
          function v4(options, buf, offset) {
            if (native_default.randomUUID && !buf && !options) {
              return native_default.randomUUID();
            }
            options = options || {};
            const rnds = options.random || (options.rng || rng)();
            rnds[6] = rnds[6] & 15 | 64;
            rnds[8] = rnds[8] & 63 | 128;
            if (buf) {
              offset = offset || 0;
              for (let i = 0; i < 16; ++i) {
                buf[offset + i] = rnds[i];
              }
              return buf;
            }
            return unsafeStringify(rnds);
          }
          var v4_default = v4;
          var import_pages_blob = __toESM(require_dist());
          var parser = new import_rss_parser.default({
            timeout: 1e4,
            headers: {
              "User-Agent": "RSS-EdgeOne/1.0"
            }
          });
          var STORE_NAME = "rss-data";
          var blobStore = null;
          var sseClients = /* @__PURE__ */ new Set();
          async function getBlobStore() {
            if (!blobStore) {
              blobStore = (0, import_pages_blob.getStore)(STORE_NAME);
            }
            return blobStore;
          }
          function addSSEClient(writer) {
            sseClients.add(writer);
          }
          function removeSSEClient(writer) {
            sseClients.delete(writer);
          }
          async function broadcastToClients(data, eventType = "message") {
            const encoder = new TextEncoder();
            const message = `event: ${eventType}
data: ${JSON.stringify(data)}

`;
            const encoded = encoder.encode(message);
            for (const writer of sseClients) {
              try {
                await writer.write(encoded);
              } catch {
                sseClients.delete(writer);
              }
            }
          }
          async function getFeeds() {
            try {
              const store = await getBlobStore();
              const data = await store.get("feeds.json", {
                type: "json"
              });
              return data || [];
            } catch {
              return [];
            }
          }
          async function saveFeeds(feeds) {
            const store = await getBlobStore();
            await store.setJSON("feeds.json", feeds);
          }
          async function getLastCheck() {
            try {
              const store = await getBlobStore();
              return await store.get("last-check.json", {
                type: "json"
              });
            } catch {
              return null;
            }
          }
          async function saveLastCheck(data) {
            const store = await getBlobStore();
            await store.setJSON("last-check.json", data);
          }
          async function getSettings() {
            try {
              const store = await getBlobStore();
              return await store.get("settings.json", {
                type: "json"
              }) || {
                timeRangeHours: 24
              };
            } catch {
              return {
                timeRangeHours: 24
              };
            }
          }
          async function saveSettings(settings) {
            const store = await getBlobStore();
            await store.setJSON("settings.json", settings);
          }
          async function fetchFeed(feed) {
            try {
              const feedData = await parser.parseURL(feed.url);
              return {
                feed,
                items: feedData.items || [],
                title: feedData.title,
                error: null
              };
            } catch (err) {
              console.error(`\u6293\u53D6\u5931\u8D25: ${feed.url}`, err.message);
              return {
                feed,
                items: [],
                title: null,
                error: err.message
              };
            }
          }
          async function fetchAllFeeds() {
            const feeds = await getFeeds();
            const settings = await getSettings();
            const newArticles = [];
            const errors = [];
            const now = /* @__PURE__ */ new Date();
            const timeRangeHours = settings.timeRangeHours || 24;
            const rangeStart = new Date(now.getTime() - timeRangeHours * 60 * 60 * 1e3);
            const CONCURRENCY = 5;
            const results = [];
            for (let i = 0; i < feeds.length; i += CONCURRENCY) {
              const batch = feeds.slice(i, i + CONCURRENCY);
              const batchResults = await Promise.all(batch.map((feed) => fetchFeed(feed)));
              results.push(...batchResults);
            }
            for (const result of results) {
              if (result.error) {
                errors.push({
                  url: result.feed.url,
                  error: result.error
                });
                continue;
              }
              for (const item of result.items) {
                if (!item.link)
                  continue;
                const pubDate = item.pubDate ? new Date(item.pubDate) : /* @__PURE__ */ new Date();
                if (pubDate < rangeStart)
                  continue;
                newArticles.push({
                  title: item.title || "\u65E0\u6807\u9898",
                  link: item.link,
                  pubDate: pubDate.toISOString(),
                  author: item.creator || item.author || "",
                  feedTitle: result.feed.title || result.title || result.feed.url
                });
              }
            }
            newArticles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
            const lastCheck = await getLastCheck();
            const existingLinks = new Set(((lastCheck == null ? void 0 : lastCheck.articles) || []).map((a) => a.link));
            const trulyNewArticles = newArticles.filter((a) => !existingLinks.has(a.link));
            const checkResult = {
              timestamp: now.toISOString(),
              totalArticles: newArticles.length,
              timeRangeHours,
              articles: newArticles,
              errors: errors.length > 0 ? errors : void 0
            };
            await saveLastCheck(checkResult);
            if (trulyNewArticles.length > 0) {
              await broadcastToClients({
                type: "new-articles",
                count: trulyNewArticles.length,
                articles: trulyNewArticles
              }, "new-articles");
            }
            return checkResult;
          }
          function isValidUrl(str) {
            try {
              const url2 = new URL(str);
              return url2.protocol === "http:" || url2.protocol === "https:";
            } catch {
              return false;
            }
          }
          function isValidDate(date) {
            return date instanceof Date && !isNaN(date.getTime());
          }
          function getCorsHeaders(origin, allowedOrigins) {
            if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
              return {
                "Access-Control-Allow-Origin": origin || "*"
              };
            }
            return {
              "Access-Control-Allow-Origin": "*"
            };
          }
          async function onRequest(context2) {
            const url2 = new URL(context2.request.url);
            const path = url2.pathname;
            const method = context2.request.method;
            const origin = context2.request.headers.get("origin");
            const ADMIN_API_KEY = context2.env.API_KEY || "";
            const allowedOrigins = (context2.env.ALLOWED_ORIGINS || "*").split(",").map((o) => o.trim());
            const corsHeaders = getCorsHeaders(origin, allowedOrigins);
            if (method === "OPTIONS") {
              return new Response(null, {
                status: 204,
                headers: {
                  "Access-Control-Allow-Origin": "*",
                  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                  "Access-Control-Allow-Headers": "Content-Type, X-API-Key"
                }
              });
            }
            let body = {};
            if (method === "POST" || method === "PUT") {
              try {
                const text = await context2.request.text();
                body = text ? JSON.parse(text) : {};
              } catch {
                body = {};
              }
            }
            try {
              if (path === "/" && method === "GET") {
                const accept = context2.request.headers.get("Accept") || "";
                if (accept.includes("text/html")) {
                  return new Response(null, {
                    status: 404
                  });
                }
                return new Response(JSON.stringify({
                  name: "RSS EdgeOne API",
                  version: "4.0.0",
                  storage: "Blob Storage",
                  realtime: "SSE \u5B9E\u65F6\u63A8\u9001 /ws",
                  endpoints: ["GET  /                 - API \u4FE1\u606F", "GET  /api/feeds        - \u83B7\u53D6\u8BA2\u9605\u6E90\u5217\u8868", "POST /api/feeds       - \u6DFB\u52A0\u8BA2\u9605\u6E90 (\u9700\u8BA4\u8BC1)", "DELETE /api/feeds/:id - \u5220\u9664\u8BA2\u9605\u6E90 (\u9700\u8BA4\u8BC1)", "GET  /api/articles    - \u83B7\u53D6\u6240\u6709\u6587\u7AE0", "GET  /api/latest      - \u83B7\u53D6\u6700\u65B0\u6587\u7AE0", "POST /api/check       - \u89E6\u53D1\u68C0\u67E5 (\u9700\u8BA4\u8BC1)", "GET  /api/settings    - \u83B7\u53D6\u8BBE\u7F6E", "PUT  /api/settings    - \u66F4\u65B0\u8BBE\u7F6E (\u9700\u8BA4\u8BC1)", "GET  /ws              - SSE \u5B9E\u65F6\u63A8\u9001"]
                }), {
                  headers: {
                    "Content-Type": "application/json",
                    ...corsHeaders
                  }
                });
              }
              if (path === "/api/health" && method === "GET") {
                const settings = await getSettings();
                return new Response(JSON.stringify({
                  status: "ok",
                  timestamp: (/* @__PURE__ */ new Date()).toISOString(),
                  settings,
                  storage: "blob"
                }), {
                  headers: {
                    "Content-Type": "application/json",
                    ...corsHeaders
                  }
                });
              }
              if (path === "/api/feeds" && method === "GET") {
                const feeds = await getFeeds();
                return new Response(JSON.stringify(feeds), {
                  headers: {
                    "Content-Type": "application/json",
                    ...corsHeaders
                  }
                });
              }
              if (path === "/api/feeds" && method === "POST") {
                const providedKey = context2.request.headers.get("x-api-key") || new URL(context2.request.url).searchParams.get("api_key");
                if (!ADMIN_API_KEY) {
                  return new Response(JSON.stringify({
                    error: "\u670D\u52A1\u914D\u7F6E\u9519\u8BEF"
                  }), {
                    status: 500,
                    headers: {
                      "Content-Type": "application/json",
                      ...corsHeaders
                    }
                  });
                }
                if (!providedKey)
                  return new Response(JSON.stringify({
                    error: "\u7F3A\u5C11 API Key"
                  }), {
                    status: 401,
                    headers: {
                      "Content-Type": "application/json",
                      ...corsHeaders
                    }
                  });
                if (providedKey !== ADMIN_API_KEY)
                  return new Response(JSON.stringify({
                    error: "API Key \u65E0\u6548"
                  }), {
                    status: 403,
                    headers: {
                      "Content-Type": "application/json",
                      ...corsHeaders
                    }
                  });
                const {
                  url: feedUrl,
                  title
                } = body;
                if (!feedUrl || typeof feedUrl !== "string") {
                  return new Response(JSON.stringify({
                    error: "\u7F3A\u5C11 url \u53C2\u6570"
                  }), {
                    status: 400,
                    headers: {
                      "Content-Type": "application/json",
                      ...corsHeaders
                    }
                  });
                }
                if (feedUrl.length > 2048) {
                  return new Response(JSON.stringify({
                    error: "URL \u8FC7\u957F"
                  }), {
                    status: 400,
                    headers: {
                      "Content-Type": "application/json",
                      ...corsHeaders
                    }
                  });
                }
                if (!isValidUrl(feedUrl)) {
                  return new Response(JSON.stringify({
                    error: "\u65E0\u6548\u7684 URL \u683C\u5F0F"
                  }), {
                    status: 400,
                    headers: {
                      "Content-Type": "application/json",
                      ...corsHeaders
                    }
                  });
                }
                const feeds = await getFeeds();
                if (feeds.some((f) => f.url === feedUrl)) {
                  return new Response(JSON.stringify({
                    error: "\u8BE5\u8BA2\u9605\u6E90\u5DF2\u5B58\u5728"
                  }), {
                    status: 409,
                    headers: {
                      "Content-Type": "application/json",
                      ...corsHeaders
                    }
                  });
                }
                const newFeed = {
                  id: v4_default(),
                  url: feedUrl,
                  title: (title == null ? void 0 : title.trim()) || "",
                  createdAt: (/* @__PURE__ */ new Date()).toISOString()
                };
                feeds.push(newFeed);
                await saveFeeds(feeds);
                return new Response(JSON.stringify(newFeed), {
                  status: 201,
                  headers: {
                    "Content-Type": "application/json",
                    ...corsHeaders
                  }
                });
              }
              if (path.startsWith("/api/feeds/") && method === "DELETE") {
                const providedKey = context2.request.headers.get("x-api-key") || new URL(context2.request.url).searchParams.get("api_key");
                if (!ADMIN_API_KEY) {
                  return new Response(JSON.stringify({
                    error: "\u670D\u52A1\u914D\u7F6E\u9519\u8BEF"
                  }), {
                    status: 500,
                    headers: {
                      "Content-Type": "application/json",
                      ...corsHeaders
                    }
                  });
                }
                if (!providedKey)
                  return new Response(JSON.stringify({
                    error: "\u7F3A\u5C11 API Key"
                  }), {
                    status: 401,
                    headers: {
                      "Content-Type": "application/json",
                      ...corsHeaders
                    }
                  });
                if (providedKey !== ADMIN_API_KEY)
                  return new Response(JSON.stringify({
                    error: "API Key \u65E0\u6548"
                  }), {
                    status: 403,
                    headers: {
                      "Content-Type": "application/json",
                      ...corsHeaders
                    }
                  });
                const id = path.split("/").pop();
                const feeds = await getFeeds();
                const filtered = feeds.filter((f) => f.id !== id);
                if (filtered.length === feeds.length) {
                  return new Response(JSON.stringify({
                    error: "\u8BA2\u9605\u6E90\u4E0D\u5B58\u5728"
                  }), {
                    status: 404,
                    headers: {
                      "Content-Type": "application/json",
                      ...corsHeaders
                    }
                  });
                }
                await saveFeeds(filtered);
                return new Response(JSON.stringify({
                  success: true
                }), {
                  headers: {
                    "Content-Type": "application/json",
                    ...corsHeaders
                  }
                });
              }
              if (path === "/api/articles" && method === "GET") {
                const lastCheck = await getLastCheck();
                return new Response(JSON.stringify((lastCheck == null ? void 0 : lastCheck.articles) || []), {
                  headers: {
                    "Content-Type": "application/json",
                    ...corsHeaders
                  }
                });
              }
              if (path === "/api/latest" && method === "GET") {
                const lastCheck = await getLastCheck();
                const since = url2.searchParams.get("since");
                if (!since) {
                  return new Response(JSON.stringify((lastCheck == null ? void 0 : lastCheck.articles) || []), {
                    headers: {
                      "Content-Type": "application/json",
                      ...corsHeaders
                    }
                  });
                }
                const sinceDate = new Date(since);
                if (!isValidDate(sinceDate)) {
                  return new Response(JSON.stringify({
                    error: "\u65E0\u6548\u7684 since \u53C2\u6570"
                  }), {
                    status: 400,
                    headers: {
                      "Content-Type": "application/json",
                      ...corsHeaders
                    }
                  });
                }
                const newArticles = ((lastCheck == null ? void 0 : lastCheck.articles) || []).filter((a) => new Date(a.pubDate) > sinceDate);
                return new Response(JSON.stringify(newArticles), {
                  headers: {
                    "Content-Type": "application/json",
                    ...corsHeaders
                  }
                });
              }
              if (path === "/api/check" && method === "POST") {
                const providedKey = context2.request.headers.get("x-api-key") || new URL(context2.request.url).searchParams.get("api_key");
                if (!ADMIN_API_KEY) {
                  return new Response(JSON.stringify({
                    error: "\u670D\u52A1\u914D\u7F6E\u9519\u8BEF"
                  }), {
                    status: 500,
                    headers: {
                      "Content-Type": "application/json",
                      ...corsHeaders
                    }
                  });
                }
                if (!providedKey)
                  return new Response(JSON.stringify({
                    error: "\u7F3A\u5C11 API Key"
                  }), {
                    status: 401,
                    headers: {
                      "Content-Type": "application/json",
                      ...corsHeaders
                    }
                  });
                if (providedKey !== ADMIN_API_KEY)
                  return new Response(JSON.stringify({
                    error: "API Key \u65E0\u6548"
                  }), {
                    status: 403,
                    headers: {
                      "Content-Type": "application/json",
                      ...corsHeaders
                    }
                  });
                const result = await fetchAllFeeds();
                return new Response(JSON.stringify({
                  success: true,
                  ...result
                }), {
                  headers: {
                    "Content-Type": "application/json",
                    ...corsHeaders
                  }
                });
              }
              if (path === "/api/settings" && method === "GET") {
                const settings = await getSettings();
                return new Response(JSON.stringify(settings), {
                  headers: {
                    "Content-Type": "application/json",
                    ...corsHeaders
                  }
                });
              }
              if (path === "/api/settings" && method === "PUT") {
                const providedKey = context2.request.headers.get("x-api-key") || new URL(context2.request.url).searchParams.get("api_key");
                if (!ADMIN_API_KEY) {
                  return new Response(JSON.stringify({
                    error: "\u670D\u52A1\u914D\u7F6E\u9519\u8BEF"
                  }), {
                    status: 500,
                    headers: {
                      "Content-Type": "application/json",
                      ...corsHeaders
                    }
                  });
                }
                if (!providedKey)
                  return new Response(JSON.stringify({
                    error: "\u7F3A\u5C11 API Key"
                  }), {
                    status: 401,
                    headers: {
                      "Content-Type": "application/json",
                      ...corsHeaders
                    }
                  });
                if (providedKey !== ADMIN_API_KEY)
                  return new Response(JSON.stringify({
                    error: "API Key \u65E0\u6548"
                  }), {
                    status: 403,
                    headers: {
                      "Content-Type": "application/json",
                      ...corsHeaders
                    }
                  });
                const {
                  timeRangeHours
                } = body;
                const settings = await getSettings();
                if (timeRangeHours !== void 0) {
                  const hours = Number(timeRangeHours);
                  if (!Number.isInteger(hours) || hours < 1 || hours > 168) {
                    return new Response(JSON.stringify({
                      error: "timeRangeHours \u5FC5\u987B\u662F 1-168 \u4E4B\u95F4\u7684\u6574\u6570"
                    }), {
                      status: 400,
                      headers: {
                        "Content-Type": "application/json",
                        ...corsHeaders
                      }
                    });
                  }
                  settings.timeRangeHours = hours;
                }
                await saveSettings(settings);
                return new Response(JSON.stringify(settings), {
                  headers: {
                    "Content-Type": "application/json",
                    ...corsHeaders
                  }
                });
              }
              if ((path === "/ws" || path === "/sse") && method === "GET") {
                const accept = context2.request.headers.get("Accept") || "";
                if (!accept.includes("text/event-stream") && !accept.includes("*/*")) {
                  return new Response("Expected text/event-stream", {
                    status: 406
                  });
                }
                const encoder = new TextEncoder();
                let writer;
                const stream = new ReadableStream({
                  async start(controller) {
                    var _a;
                    writer = controller;
                    addSSEClient(writer);
                    const lastCheck = await getLastCheck();
                    const connectMsg = `event: connected
data: ${JSON.stringify({
                      type: "connected",
                      message: "RSS SSE connected",
                      articles: (lastCheck == null ? void 0 : lastCheck.articles) || [],
                      timestamp: lastCheck == null ? void 0 : lastCheck.timestamp
                    })}

`;
                    controller.enqueue(encoder.encode(connectMsg));
                    if (((_a = lastCheck == null ? void 0 : lastCheck.articles) == null ? void 0 : _a.length) > 0) {
                      const initMsg = `event: init
data: ${JSON.stringify({
                        articles: lastCheck.articles,
                        total: lastCheck.totalArticles
                      })}

`;
                      controller.enqueue(encoder.encode(initMsg));
                    }
                    const heartbeat = setInterval(() => {
                      try {
                        controller.enqueue(encoder.encode(": heartbeat\n\n"));
                      } catch {
                        clearInterval(heartbeat);
                      }
                    }, 3e4);
                    context2.waitUntil((async () => {
                      try {
                        await context2.request.signal.aborted;
                      } catch {
                      }
                    })().finally(() => {
                      clearInterval(heartbeat);
                      removeSSEClient(writer);
                      try {
                        controller.close();
                      } catch {
                      }
                    }));
                  }
                });
                return new Response(stream, {
                  status: 200,
                  headers: {
                    "Content-Type": "text/event-stream",
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                    "Access-Control-Allow-Origin": "*",
                    "X-Accel-Buffering": "no"
                  }
                });
              }
              return new Response(JSON.stringify({
                error: "\u7AEF\u70B9\u4E0D\u5B58\u5728"
              }), {
                status: 404,
                headers: {
                  "Content-Type": "application/json",
                  ...corsHeaders
                }
              });
            } catch (err) {
              const errorMsg = err.message || "\u670D\u52A1\u5668\u5185\u90E8\u9519\u8BEF";
              return new Response(JSON.stringify({
                error: errorMsg
              }), {
                status: 500,
                headers: {
                  "Content-Type": "application/json",
                  ...corsHeaders
                }
              });
            }
          }
          return {
            onRequest: typeof onRequest !== "undefined" ? onRequest : void 0,
            onRequestGet: typeof onRequestGet !== "undefined" ? onRequestGet : void 0,
            onRequestPost: typeof onRequestPost !== "undefined" ? onRequestPost : void 0,
            onRequestPut: typeof onRequestPut !== "undefined" ? onRequestPut : void 0,
            onRequestDelete: typeof onRequestDelete !== "undefined" ? onRequestDelete : void 0,
            onRequestPatch: typeof onRequestPatch !== "undefined" ? onRequestPatch : void 0,
            onRequestHead: typeof onRequestHead !== "undefined" ? onRequestHead : void 0,
            onRequestOptions: typeof onRequestOptions !== "undefined" ? onRequestOptions : void 0
          };
        })();
        try {
          const handler = (() => {
            const method = req.method;
            if (method === "GET" && mod_0.onRequestGet) {
              return mod_0.onRequestGet;
            } else if (method === "POST" && mod_0.onRequestPost) {
              return mod_0.onRequestPost;
            } else if (method === "PUT" && mod_0.onRequestPut) {
              return mod_0.onRequestPut;
            } else if (method === "DELETE" && mod_0.onRequestDelete) {
              return mod_0.onRequestDelete;
            } else if (method === "PATCH" && mod_0.onRequestPatch) {
              return mod_0.onRequestPatch;
            } else if (method === "HEAD" && mod_0.onRequestHead) {
              return mod_0.onRequestHead;
            } else if (method === "OPTIONS" && mod_0.onRequestOptions) {
              return mod_0.onRequestOptions;
            } else {
              return mod_0.onRequest;
            }
          })();
          if (handler) {
            response = await handler(context);
            if (response && typeof response === "object" && response.websocket) {
              console.log("[WebSocket] WebSocket configuration detected for:", pathname);
              const upgradeHeader = req.headers["upgrade"];
              if (upgradeHeader && upgradeHeader.toLowerCase() === "websocket") {
                console.log("[WebSocket] Executing WebSocket handshake...");
                try {
                  const { WebSocketServer } = __require("ws");
                  const wss = new WebSocketServer({ noServer: true });
                  wss.on("connection", (ws, request) => {
                    console.log("[WebSocket] Connection established");
                    if (response.websocket.onopen) {
                      try {
                        response.websocket.onopen(ws, request);
                      } catch (error) {
                        console.error("[WebSocket] Error in onopen:", error);
                      }
                    }
                    ws.on("message", (data, isBinary) => {
                      if (response.websocket.onmessage) {
                        try {
                          response.websocket.onmessage(ws, data, isBinary);
                        } catch (error) {
                          console.error("[WebSocket] Error in onmessage:", error);
                          ws.close(1011, "Internal error");
                        }
                      }
                    });
                    ws.on("close", (code, reason) => {
                      if (response.websocket.onclose) {
                        try {
                          response.websocket.onclose(ws, code, reason);
                        } catch (error) {
                          console.error("[WebSocket] Error in onclose:", error);
                        }
                      }
                    });
                    ws.on("error", (error) => {
                      if (response.websocket.onerror) {
                        try {
                          response.websocket.onerror(ws, error);
                        } catch (err) {
                          console.error("[WebSocket] Error in onerror:", err);
                        }
                      } else {
                        console.error("[WebSocket] Connection error:", error);
                      }
                    });
                  });
                  wss.handleUpgrade(req, req.socket, Buffer.alloc(0), (ws) => {
                    wss.emit("connection", ws, req);
                  });
                  console.log("[WebSocket] Handshake complete, connection established");
                  return;
                } catch (wsError) {
                  console.error("[WebSocket] Handshake error:", wsError);
                  response = new Response(JSON.stringify({
                    error: "WebSocket Handshake Failed",
                    message: wsError.message
                  }), {
                    status: 500,
                    headers: {
                      "Content-Type": "application/json"
                    }
                  });
                }
              } else {
                response = new Response("WebSocket endpoint. Use ws:// protocol to connect.", {
                  status: 426,
                  headers: {
                    "Content-Type": "text/plain",
                    "Upgrade": "websocket"
                  }
                });
              }
            }
          }
        } catch (handlerError) {
          console.log("Pages response status: ", 502);
          response = new Response(JSON.stringify({
            error: "Internal Server Error",
            message: handlerError.message
          }), {
            status: 502,
            headers: {
              "Content-Type": "application/json",
              // 'Functions-Request-Id': context.server ? context.server.requestId : '',
              "eo-pages-inner-scf-status": "502",
              "eo-pages-inner-status-intercept": "true"
            }
          });
        }
        const requestEndTime2 = Date.now();
        await handleResponse(res, response, {
          "functions-request-id": context.server ? context.server.requestId : ""
        });
        return;
      }
    }
    if (!response) {
      response = new Response(JSON.stringify({
        error: "Not Found",
        message: "The requested path does not exist"
      }), {
        status: 404,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    const requestEndTime = Date.now();
    if (!res.headers) {
      res.headers = {};
    }
    await handleResponse(res, response, {
      "functions-request-id": context.server ? context.server.requestId : ""
    });
  } catch (error) {
    console.error("server error", error);
    res.writeHead(502, {
      "Content-Type": "application/json",
      "Functions-Request-Id": req.headers["x-scf-request-id"] || "",
      "eo-pages-inner-scf-status": "502",
      "eo-pages-inner-status-intercept": "true"
    });
    res.end(JSON.stringify({
      error: "Internal Server Error",
      code: "FUNCTION_INVOCATION_FAILED",
      message: error.message,
      trace: error.stack
    }));
  }
});
server.headersTimeout = 0;
server.requestTimeout = 0;
server.listen(port, () => {
});
export {
  server
};
/*! Bundled license information:

sax/lib/sax.js:
  (*! http://mths.be/fromcodepoint v0.1.0 by @mathias *)
*/
