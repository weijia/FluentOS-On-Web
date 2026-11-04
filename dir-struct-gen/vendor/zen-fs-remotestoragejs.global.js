"use strict";
var ZenFSRemoteStorage = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });
  var __commonJS = (cb, mod) => function __require2() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from2, except, desc) => {
    if (from2 && typeof from2 === "object" || typeof from2 === "function") {
      for (let key of __getOwnPropNames(from2))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from2[key], enumerable: !(desc = __getOwnPropDesc(from2, key)) || desc.enumerable });
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
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // node_modules/eventemitter3/index.js
  var require_eventemitter3 = __commonJS({
    "node_modules/eventemitter3/index.js"(exports, module) {
      "use strict";
      var has = Object.prototype.hasOwnProperty;
      var prefix = "~";
      function Events() {
      }
      if (Object.create) {
        Events.prototype = /* @__PURE__ */ Object.create(null);
        if (!new Events().__proto__) prefix = false;
      }
      function EE(fn, context, once) {
        this.fn = fn;
        this.context = context;
        this.once = once || false;
      }
      function addListener(emitter, event, fn, context, once) {
        if (typeof fn !== "function") {
          throw new TypeError("The listener must be a function");
        }
        var listener = new EE(fn, context || emitter, once), evt = prefix ? prefix + event : event;
        if (!emitter._events[evt]) emitter._events[evt] = listener, emitter._eventsCount++;
        else if (!emitter._events[evt].fn) emitter._events[evt].push(listener);
        else emitter._events[evt] = [emitter._events[evt], listener];
        return emitter;
      }
      function clearEvent(emitter, evt) {
        if (--emitter._eventsCount === 0) emitter._events = new Events();
        else delete emitter._events[evt];
      }
      function EventEmitter2() {
        this._events = new Events();
        this._eventsCount = 0;
      }
      EventEmitter2.prototype.eventNames = function eventNames() {
        var names = [], events, name;
        if (this._eventsCount === 0) return names;
        for (name in events = this._events) {
          if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
        }
        if (Object.getOwnPropertySymbols) {
          return names.concat(Object.getOwnPropertySymbols(events));
        }
        return names;
      };
      EventEmitter2.prototype.listeners = function listeners(event) {
        var evt = prefix ? prefix + event : event, handlers = this._events[evt];
        if (!handlers) return [];
        if (handlers.fn) return [handlers.fn];
        for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) {
          ee[i] = handlers[i].fn;
        }
        return ee;
      };
      EventEmitter2.prototype.listenerCount = function listenerCount(event) {
        var evt = prefix ? prefix + event : event, listeners = this._events[evt];
        if (!listeners) return 0;
        if (listeners.fn) return 1;
        return listeners.length;
      };
      EventEmitter2.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
        var evt = prefix ? prefix + event : event;
        if (!this._events[evt]) return false;
        var listeners = this._events[evt], len = arguments.length, args, i;
        if (listeners.fn) {
          if (listeners.once) this.removeListener(event, listeners.fn, void 0, true);
          switch (len) {
            case 1:
              return listeners.fn.call(listeners.context), true;
            case 2:
              return listeners.fn.call(listeners.context, a1), true;
            case 3:
              return listeners.fn.call(listeners.context, a1, a2), true;
            case 4:
              return listeners.fn.call(listeners.context, a1, a2, a3), true;
            case 5:
              return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
            case 6:
              return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
          }
          for (i = 1, args = new Array(len - 1); i < len; i++) {
            args[i - 1] = arguments[i];
          }
          listeners.fn.apply(listeners.context, args);
        } else {
          var length = listeners.length, j;
          for (i = 0; i < length; i++) {
            if (listeners[i].once) this.removeListener(event, listeners[i].fn, void 0, true);
            switch (len) {
              case 1:
                listeners[i].fn.call(listeners[i].context);
                break;
              case 2:
                listeners[i].fn.call(listeners[i].context, a1);
                break;
              case 3:
                listeners[i].fn.call(listeners[i].context, a1, a2);
                break;
              case 4:
                listeners[i].fn.call(listeners[i].context, a1, a2, a3);
                break;
              default:
                if (!args) for (j = 1, args = new Array(len - 1); j < len; j++) {
                  args[j - 1] = arguments[j];
                }
                listeners[i].fn.apply(listeners[i].context, args);
            }
          }
        }
        return true;
      };
      EventEmitter2.prototype.on = function on(event, fn, context) {
        return addListener(this, event, fn, context, false);
      };
      EventEmitter2.prototype.once = function once(event, fn, context) {
        return addListener(this, event, fn, context, true);
      };
      EventEmitter2.prototype.removeListener = function removeListener(event, fn, context, once) {
        var evt = prefix ? prefix + event : event;
        if (!this._events[evt]) return this;
        if (!fn) {
          clearEvent(this, evt);
          return this;
        }
        var listeners = this._events[evt];
        if (listeners.fn) {
          if (listeners.fn === fn && (!once || listeners.once) && (!context || listeners.context === context)) {
            clearEvent(this, evt);
          }
        } else {
          for (var i = 0, events = [], length = listeners.length; i < length; i++) {
            if (listeners[i].fn !== fn || once && !listeners[i].once || context && listeners[i].context !== context) {
              events.push(listeners[i]);
            }
          }
          if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;
          else clearEvent(this, evt);
        }
        return this;
      };
      EventEmitter2.prototype.removeAllListeners = function removeAllListeners(event) {
        var evt;
        if (event) {
          evt = prefix ? prefix + event : event;
          if (this._events[evt]) clearEvent(this, evt);
        } else {
          this._events = new Events();
          this._eventsCount = 0;
        }
        return this;
      };
      EventEmitter2.prototype.off = EventEmitter2.prototype.removeListener;
      EventEmitter2.prototype.addListener = EventEmitter2.prototype.on;
      EventEmitter2.prefixed = prefix;
      EventEmitter2.EventEmitter = EventEmitter2;
      if ("undefined" !== typeof module) {
        module.exports = EventEmitter2;
      }
    }
  });

  // node_modules/base64-js/index.js
  var require_base64_js = __commonJS({
    "node_modules/base64-js/index.js"(exports) {
      "use strict";
      exports.byteLength = byteLength;
      exports.toByteArray = toByteArray;
      exports.fromByteArray = fromByteArray;
      var lookup = [];
      var revLookup = [];
      var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
      var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
      for (i = 0, len = code.length; i < len; ++i) {
        lookup[i] = code[i];
        revLookup[code.charCodeAt(i)] = i;
      }
      var i;
      var len;
      revLookup["-".charCodeAt(0)] = 62;
      revLookup["_".charCodeAt(0)] = 63;
      function getLens(b64) {
        var len2 = b64.length;
        if (len2 % 4 > 0) {
          throw new Error("Invalid string. Length must be a multiple of 4");
        }
        var validLen = b64.indexOf("=");
        if (validLen === -1) validLen = len2;
        var placeHoldersLen = validLen === len2 ? 0 : 4 - validLen % 4;
        return [validLen, placeHoldersLen];
      }
      function byteLength(b64) {
        var lens = getLens(b64);
        var validLen = lens[0];
        var placeHoldersLen = lens[1];
        return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
      }
      function _byteLength(b64, validLen, placeHoldersLen) {
        return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
      }
      function toByteArray(b64) {
        var tmp;
        var lens = getLens(b64);
        var validLen = lens[0];
        var placeHoldersLen = lens[1];
        var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));
        var curByte = 0;
        var len2 = placeHoldersLen > 0 ? validLen - 4 : validLen;
        var i2;
        for (i2 = 0; i2 < len2; i2 += 4) {
          tmp = revLookup[b64.charCodeAt(i2)] << 18 | revLookup[b64.charCodeAt(i2 + 1)] << 12 | revLookup[b64.charCodeAt(i2 + 2)] << 6 | revLookup[b64.charCodeAt(i2 + 3)];
          arr[curByte++] = tmp >> 16 & 255;
          arr[curByte++] = tmp >> 8 & 255;
          arr[curByte++] = tmp & 255;
        }
        if (placeHoldersLen === 2) {
          tmp = revLookup[b64.charCodeAt(i2)] << 2 | revLookup[b64.charCodeAt(i2 + 1)] >> 4;
          arr[curByte++] = tmp & 255;
        }
        if (placeHoldersLen === 1) {
          tmp = revLookup[b64.charCodeAt(i2)] << 10 | revLookup[b64.charCodeAt(i2 + 1)] << 4 | revLookup[b64.charCodeAt(i2 + 2)] >> 2;
          arr[curByte++] = tmp >> 8 & 255;
          arr[curByte++] = tmp & 255;
        }
        return arr;
      }
      function tripletToBase64(num) {
        return lookup[num >> 18 & 63] + lookup[num >> 12 & 63] + lookup[num >> 6 & 63] + lookup[num & 63];
      }
      function encodeChunk(uint8, start, end) {
        var tmp;
        var output2 = [];
        for (var i2 = start; i2 < end; i2 += 3) {
          tmp = (uint8[i2] << 16 & 16711680) + (uint8[i2 + 1] << 8 & 65280) + (uint8[i2 + 2] & 255);
          output2.push(tripletToBase64(tmp));
        }
        return output2.join("");
      }
      function fromByteArray(uint8) {
        var tmp;
        var len2 = uint8.length;
        var extraBytes = len2 % 3;
        var parts = [];
        var maxChunkLength = 16383;
        for (var i2 = 0, len22 = len2 - extraBytes; i2 < len22; i2 += maxChunkLength) {
          parts.push(encodeChunk(uint8, i2, i2 + maxChunkLength > len22 ? len22 : i2 + maxChunkLength));
        }
        if (extraBytes === 1) {
          tmp = uint8[len2 - 1];
          parts.push(
            lookup[tmp >> 2] + lookup[tmp << 4 & 63] + "=="
          );
        } else if (extraBytes === 2) {
          tmp = (uint8[len2 - 2] << 8) + uint8[len2 - 1];
          parts.push(
            lookup[tmp >> 10] + lookup[tmp >> 4 & 63] + lookup[tmp << 2 & 63] + "="
          );
        }
        return parts.join("");
      }
    }
  });

  // node_modules/ieee754/index.js
  var require_ieee754 = __commonJS({
    "node_modules/ieee754/index.js"(exports) {
      "use strict";
      exports.read = function(buffer, offset, isLE, mLen, nBytes) {
        var e, m;
        var eLen = nBytes * 8 - mLen - 1;
        var eMax = (1 << eLen) - 1;
        var eBias = eMax >> 1;
        var nBits = -7;
        var i = isLE ? nBytes - 1 : 0;
        var d = isLE ? -1 : 1;
        var s = buffer[offset + i];
        i += d;
        e = s & (1 << -nBits) - 1;
        s >>= -nBits;
        nBits += eLen;
        for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {
        }
        m = e & (1 << -nBits) - 1;
        e >>= -nBits;
        nBits += mLen;
        for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {
        }
        if (e === 0) {
          e = 1 - eBias;
        } else if (e === eMax) {
          return m ? NaN : (s ? -1 : 1) * Infinity;
        } else {
          m = m + Math.pow(2, mLen);
          e = e - eBias;
        }
        return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
      };
      exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
        var e, m, c;
        var eLen = nBytes * 8 - mLen - 1;
        var eMax = (1 << eLen) - 1;
        var eBias = eMax >> 1;
        var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
        var i = isLE ? 0 : nBytes - 1;
        var d = isLE ? 1 : -1;
        var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
        value = Math.abs(value);
        if (isNaN(value) || value === Infinity) {
          m = isNaN(value) ? 1 : 0;
          e = eMax;
        } else {
          e = Math.floor(Math.log(value) / Math.LN2);
          if (value * (c = Math.pow(2, -e)) < 1) {
            e--;
            c *= 2;
          }
          if (e + eBias >= 1) {
            value += rt / c;
          } else {
            value += rt * Math.pow(2, 1 - eBias);
          }
          if (value * c >= 2) {
            e++;
            c /= 2;
          }
          if (e + eBias >= eMax) {
            m = 0;
            e = eMax;
          } else if (e + eBias >= 1) {
            m = (value * c - 1) * Math.pow(2, mLen);
            e = e + eBias;
          } else {
            m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
            e = 0;
          }
        }
        for (; mLen >= 8; buffer[offset + i] = m & 255, i += d, m /= 256, mLen -= 8) {
        }
        e = e << mLen | m;
        eLen += mLen;
        for (; eLen > 0; buffer[offset + i] = e & 255, i += d, e /= 256, eLen -= 8) {
        }
        buffer[offset + i - d] |= s * 128;
      };
    }
  });

  // node_modules/buffer/index.js
  var require_buffer = __commonJS({
    "node_modules/buffer/index.js"(exports) {
      "use strict";
      var base64 = require_base64_js();
      var ieee754 = require_ieee754();
      var customInspectSymbol = typeof Symbol === "function" && typeof Symbol["for"] === "function" ? Symbol["for"]("nodejs.util.inspect.custom") : null;
      exports.Buffer = Buffer7;
      exports.SlowBuffer = SlowBuffer;
      exports.INSPECT_MAX_BYTES = 50;
      var K_MAX_LENGTH = 2147483647;
      exports.kMaxLength = K_MAX_LENGTH;
      Buffer7.TYPED_ARRAY_SUPPORT = typedArraySupport();
      if (!Buffer7.TYPED_ARRAY_SUPPORT && typeof console !== "undefined" && typeof console.error === "function") {
        console.error(
          "This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support."
        );
      }
      function typedArraySupport() {
        try {
          const arr = new Uint8Array(1);
          const proto = { foo: function() {
            return 42;
          } };
          Object.setPrototypeOf(proto, Uint8Array.prototype);
          Object.setPrototypeOf(arr, proto);
          return arr.foo() === 42;
        } catch (e) {
          return false;
        }
      }
      Object.defineProperty(Buffer7.prototype, "parent", {
        enumerable: true,
        get: function() {
          if (!Buffer7.isBuffer(this)) return void 0;
          return this.buffer;
        }
      });
      Object.defineProperty(Buffer7.prototype, "offset", {
        enumerable: true,
        get: function() {
          if (!Buffer7.isBuffer(this)) return void 0;
          return this.byteOffset;
        }
      });
      function createBuffer(length) {
        if (length > K_MAX_LENGTH) {
          throw new RangeError('The value "' + length + '" is invalid for option "size"');
        }
        const buf = new Uint8Array(length);
        Object.setPrototypeOf(buf, Buffer7.prototype);
        return buf;
      }
      function Buffer7(arg, encodingOrOffset, length) {
        if (typeof arg === "number") {
          if (typeof encodingOrOffset === "string") {
            throw new TypeError(
              'The "string" argument must be of type string. Received type number'
            );
          }
          return allocUnsafe(arg);
        }
        return from2(arg, encodingOrOffset, length);
      }
      Buffer7.poolSize = 8192;
      function from2(value, encodingOrOffset, length) {
        if (typeof value === "string") {
          return fromString(value, encodingOrOffset);
        }
        if (ArrayBuffer.isView(value)) {
          return fromArrayView(value);
        }
        if (value == null) {
          throw new TypeError(
            "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value
          );
        }
        if (isInstance2(value, ArrayBuffer) || value && isInstance2(value.buffer, ArrayBuffer)) {
          return fromArrayBuffer(value, encodingOrOffset, length);
        }
        if (typeof SharedArrayBuffer !== "undefined" && (isInstance2(value, SharedArrayBuffer) || value && isInstance2(value.buffer, SharedArrayBuffer))) {
          return fromArrayBuffer(value, encodingOrOffset, length);
        }
        if (typeof value === "number") {
          throw new TypeError(
            'The "value" argument must not be of type number. Received type number'
          );
        }
        const valueOf = value.valueOf && value.valueOf();
        if (valueOf != null && valueOf !== value) {
          return Buffer7.from(valueOf, encodingOrOffset, length);
        }
        const b = fromObject(value);
        if (b) return b;
        if (typeof Symbol !== "undefined" && Symbol.toPrimitive != null && typeof value[Symbol.toPrimitive] === "function") {
          return Buffer7.from(value[Symbol.toPrimitive]("string"), encodingOrOffset, length);
        }
        throw new TypeError(
          "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value
        );
      }
      Buffer7.from = function(value, encodingOrOffset, length) {
        return from2(value, encodingOrOffset, length);
      };
      Object.setPrototypeOf(Buffer7.prototype, Uint8Array.prototype);
      Object.setPrototypeOf(Buffer7, Uint8Array);
      function assertSize(size) {
        if (typeof size !== "number") {
          throw new TypeError('"size" argument must be of type number');
        } else if (size < 0) {
          throw new RangeError('The value "' + size + '" is invalid for option "size"');
        }
      }
      function alloc(size, fill, encoding) {
        assertSize(size);
        if (size <= 0) {
          return createBuffer(size);
        }
        if (fill !== void 0) {
          return typeof encoding === "string" ? createBuffer(size).fill(fill, encoding) : createBuffer(size).fill(fill);
        }
        return createBuffer(size);
      }
      Buffer7.alloc = function(size, fill, encoding) {
        return alloc(size, fill, encoding);
      };
      function allocUnsafe(size) {
        assertSize(size);
        return createBuffer(size < 0 ? 0 : checked(size) | 0);
      }
      Buffer7.allocUnsafe = function(size) {
        return allocUnsafe(size);
      };
      Buffer7.allocUnsafeSlow = function(size) {
        return allocUnsafe(size);
      };
      function fromString(string, encoding) {
        if (typeof encoding !== "string" || encoding === "") {
          encoding = "utf8";
        }
        if (!Buffer7.isEncoding(encoding)) {
          throw new TypeError("Unknown encoding: " + encoding);
        }
        const length = byteLength(string, encoding) | 0;
        let buf = createBuffer(length);
        const actual = buf.write(string, encoding);
        if (actual !== length) {
          buf = buf.slice(0, actual);
        }
        return buf;
      }
      function fromArrayLike(array) {
        const length = array.length < 0 ? 0 : checked(array.length) | 0;
        const buf = createBuffer(length);
        for (let i = 0; i < length; i += 1) {
          buf[i] = array[i] & 255;
        }
        return buf;
      }
      function fromArrayView(arrayView) {
        if (isInstance2(arrayView, Uint8Array)) {
          const copy = new Uint8Array(arrayView);
          return fromArrayBuffer(copy.buffer, copy.byteOffset, copy.byteLength);
        }
        return fromArrayLike(arrayView);
      }
      function fromArrayBuffer(array, byteOffset, length) {
        if (byteOffset < 0 || array.byteLength < byteOffset) {
          throw new RangeError('"offset" is outside of buffer bounds');
        }
        if (array.byteLength < byteOffset + (length || 0)) {
          throw new RangeError('"length" is outside of buffer bounds');
        }
        let buf;
        if (byteOffset === void 0 && length === void 0) {
          buf = new Uint8Array(array);
        } else if (length === void 0) {
          buf = new Uint8Array(array, byteOffset);
        } else {
          buf = new Uint8Array(array, byteOffset, length);
        }
        Object.setPrototypeOf(buf, Buffer7.prototype);
        return buf;
      }
      function fromObject(obj) {
        if (Buffer7.isBuffer(obj)) {
          const len = checked(obj.length) | 0;
          const buf = createBuffer(len);
          if (buf.length === 0) {
            return buf;
          }
          obj.copy(buf, 0, 0, len);
          return buf;
        }
        if (obj.length !== void 0) {
          if (typeof obj.length !== "number" || numberIsNaN(obj.length)) {
            return createBuffer(0);
          }
          return fromArrayLike(obj);
        }
        if (obj.type === "Buffer" && Array.isArray(obj.data)) {
          return fromArrayLike(obj.data);
        }
      }
      function checked(length) {
        if (length >= K_MAX_LENGTH) {
          throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + K_MAX_LENGTH.toString(16) + " bytes");
        }
        return length | 0;
      }
      function SlowBuffer(length) {
        if (+length != length) {
          length = 0;
        }
        return Buffer7.alloc(+length);
      }
      Buffer7.isBuffer = function isBuffer(b) {
        return b != null && b._isBuffer === true && b !== Buffer7.prototype;
      };
      Buffer7.compare = function compare(a, b) {
        if (isInstance2(a, Uint8Array)) a = Buffer7.from(a, a.offset, a.byteLength);
        if (isInstance2(b, Uint8Array)) b = Buffer7.from(b, b.offset, b.byteLength);
        if (!Buffer7.isBuffer(a) || !Buffer7.isBuffer(b)) {
          throw new TypeError(
            'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
          );
        }
        if (a === b) return 0;
        let x = a.length;
        let y = b.length;
        for (let i = 0, len = Math.min(x, y); i < len; ++i) {
          if (a[i] !== b[i]) {
            x = a[i];
            y = b[i];
            break;
          }
        }
        if (x < y) return -1;
        if (y < x) return 1;
        return 0;
      };
      Buffer7.isEncoding = function isEncoding(encoding) {
        switch (String(encoding).toLowerCase()) {
          case "hex":
          case "utf8":
          case "utf-8":
          case "ascii":
          case "latin1":
          case "binary":
          case "base64":
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return true;
          default:
            return false;
        }
      };
      Buffer7.concat = function concat(list2, length) {
        if (!Array.isArray(list2)) {
          throw new TypeError('"list" argument must be an Array of Buffers');
        }
        if (list2.length === 0) {
          return Buffer7.alloc(0);
        }
        let i;
        if (length === void 0) {
          length = 0;
          for (i = 0; i < list2.length; ++i) {
            length += list2[i].length;
          }
        }
        const buffer = Buffer7.allocUnsafe(length);
        let pos = 0;
        for (i = 0; i < list2.length; ++i) {
          let buf = list2[i];
          if (isInstance2(buf, Uint8Array)) {
            if (pos + buf.length > buffer.length) {
              if (!Buffer7.isBuffer(buf)) buf = Buffer7.from(buf);
              buf.copy(buffer, pos);
            } else {
              Uint8Array.prototype.set.call(
                buffer,
                buf,
                pos
              );
            }
          } else if (!Buffer7.isBuffer(buf)) {
            throw new TypeError('"list" argument must be an Array of Buffers');
          } else {
            buf.copy(buffer, pos);
          }
          pos += buf.length;
        }
        return buffer;
      };
      function byteLength(string, encoding) {
        if (Buffer7.isBuffer(string)) {
          return string.length;
        }
        if (ArrayBuffer.isView(string) || isInstance2(string, ArrayBuffer)) {
          return string.byteLength;
        }
        if (typeof string !== "string") {
          throw new TypeError(
            'The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof string
          );
        }
        const len = string.length;
        const mustMatch = arguments.length > 2 && arguments[2] === true;
        if (!mustMatch && len === 0) return 0;
        let loweredCase = false;
        for (; ; ) {
          switch (encoding) {
            case "ascii":
            case "latin1":
            case "binary":
              return len;
            case "utf8":
            case "utf-8":
              return utf8ToBytes(string).length;
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              return len * 2;
            case "hex":
              return len >>> 1;
            case "base64":
              return base64ToBytes(string).length;
            default:
              if (loweredCase) {
                return mustMatch ? -1 : utf8ToBytes(string).length;
              }
              encoding = ("" + encoding).toLowerCase();
              loweredCase = true;
          }
        }
      }
      Buffer7.byteLength = byteLength;
      function slowToString(encoding, start, end) {
        let loweredCase = false;
        if (start === void 0 || start < 0) {
          start = 0;
        }
        if (start > this.length) {
          return "";
        }
        if (end === void 0 || end > this.length) {
          end = this.length;
        }
        if (end <= 0) {
          return "";
        }
        end >>>= 0;
        start >>>= 0;
        if (end <= start) {
          return "";
        }
        if (!encoding) encoding = "utf8";
        while (true) {
          switch (encoding) {
            case "hex":
              return hexSlice(this, start, end);
            case "utf8":
            case "utf-8":
              return utf8Slice(this, start, end);
            case "ascii":
              return asciiSlice(this, start, end);
            case "latin1":
            case "binary":
              return latin1Slice(this, start, end);
            case "base64":
              return base64Slice(this, start, end);
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              return utf16leSlice(this, start, end);
            default:
              if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
              encoding = (encoding + "").toLowerCase();
              loweredCase = true;
          }
        }
      }
      Buffer7.prototype._isBuffer = true;
      function swap(b, n, m) {
        const i = b[n];
        b[n] = b[m];
        b[m] = i;
      }
      Buffer7.prototype.swap16 = function swap16() {
        const len = this.length;
        if (len % 2 !== 0) {
          throw new RangeError("Buffer size must be a multiple of 16-bits");
        }
        for (let i = 0; i < len; i += 2) {
          swap(this, i, i + 1);
        }
        return this;
      };
      Buffer7.prototype.swap32 = function swap32() {
        const len = this.length;
        if (len % 4 !== 0) {
          throw new RangeError("Buffer size must be a multiple of 32-bits");
        }
        for (let i = 0; i < len; i += 4) {
          swap(this, i, i + 3);
          swap(this, i + 1, i + 2);
        }
        return this;
      };
      Buffer7.prototype.swap64 = function swap64() {
        const len = this.length;
        if (len % 8 !== 0) {
          throw new RangeError("Buffer size must be a multiple of 64-bits");
        }
        for (let i = 0; i < len; i += 8) {
          swap(this, i, i + 7);
          swap(this, i + 1, i + 6);
          swap(this, i + 2, i + 5);
          swap(this, i + 3, i + 4);
        }
        return this;
      };
      Buffer7.prototype.toString = function toString() {
        const length = this.length;
        if (length === 0) return "";
        if (arguments.length === 0) return utf8Slice(this, 0, length);
        return slowToString.apply(this, arguments);
      };
      Buffer7.prototype.toLocaleString = Buffer7.prototype.toString;
      Buffer7.prototype.equals = function equals(b) {
        if (!Buffer7.isBuffer(b)) throw new TypeError("Argument must be a Buffer");
        if (this === b) return true;
        return Buffer7.compare(this, b) === 0;
      };
      Buffer7.prototype.inspect = function inspect() {
        let str = "";
        const max = exports.INSPECT_MAX_BYTES;
        str = this.toString("hex", 0, max).replace(/(.{2})/g, "$1 ").trim();
        if (this.length > max) str += " ... ";
        return "<Buffer " + str + ">";
      };
      if (customInspectSymbol) {
        Buffer7.prototype[customInspectSymbol] = Buffer7.prototype.inspect;
      }
      Buffer7.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
        if (isInstance2(target, Uint8Array)) {
          target = Buffer7.from(target, target.offset, target.byteLength);
        }
        if (!Buffer7.isBuffer(target)) {
          throw new TypeError(
            'The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof target
          );
        }
        if (start === void 0) {
          start = 0;
        }
        if (end === void 0) {
          end = target ? target.length : 0;
        }
        if (thisStart === void 0) {
          thisStart = 0;
        }
        if (thisEnd === void 0) {
          thisEnd = this.length;
        }
        if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
          throw new RangeError("out of range index");
        }
        if (thisStart >= thisEnd && start >= end) {
          return 0;
        }
        if (thisStart >= thisEnd) {
          return -1;
        }
        if (start >= end) {
          return 1;
        }
        start >>>= 0;
        end >>>= 0;
        thisStart >>>= 0;
        thisEnd >>>= 0;
        if (this === target) return 0;
        let x = thisEnd - thisStart;
        let y = end - start;
        const len = Math.min(x, y);
        const thisCopy = this.slice(thisStart, thisEnd);
        const targetCopy = target.slice(start, end);
        for (let i = 0; i < len; ++i) {
          if (thisCopy[i] !== targetCopy[i]) {
            x = thisCopy[i];
            y = targetCopy[i];
            break;
          }
        }
        if (x < y) return -1;
        if (y < x) return 1;
        return 0;
      };
      function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
        if (buffer.length === 0) return -1;
        if (typeof byteOffset === "string") {
          encoding = byteOffset;
          byteOffset = 0;
        } else if (byteOffset > 2147483647) {
          byteOffset = 2147483647;
        } else if (byteOffset < -2147483648) {
          byteOffset = -2147483648;
        }
        byteOffset = +byteOffset;
        if (numberIsNaN(byteOffset)) {
          byteOffset = dir ? 0 : buffer.length - 1;
        }
        if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
        if (byteOffset >= buffer.length) {
          if (dir) return -1;
          else byteOffset = buffer.length - 1;
        } else if (byteOffset < 0) {
          if (dir) byteOffset = 0;
          else return -1;
        }
        if (typeof val === "string") {
          val = Buffer7.from(val, encoding);
        }
        if (Buffer7.isBuffer(val)) {
          if (val.length === 0) {
            return -1;
          }
          return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
        } else if (typeof val === "number") {
          val = val & 255;
          if (typeof Uint8Array.prototype.indexOf === "function") {
            if (dir) {
              return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset);
            } else {
              return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
            }
          }
          return arrayIndexOf(buffer, [val], byteOffset, encoding, dir);
        }
        throw new TypeError("val must be string, number or Buffer");
      }
      function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
        let indexSize = 1;
        let arrLength = arr.length;
        let valLength = val.length;
        if (encoding !== void 0) {
          encoding = String(encoding).toLowerCase();
          if (encoding === "ucs2" || encoding === "ucs-2" || encoding === "utf16le" || encoding === "utf-16le") {
            if (arr.length < 2 || val.length < 2) {
              return -1;
            }
            indexSize = 2;
            arrLength /= 2;
            valLength /= 2;
            byteOffset /= 2;
          }
        }
        function read2(buf, i2) {
          if (indexSize === 1) {
            return buf[i2];
          } else {
            return buf.readUInt16BE(i2 * indexSize);
          }
        }
        let i;
        if (dir) {
          let foundIndex = -1;
          for (i = byteOffset; i < arrLength; i++) {
            if (read2(arr, i) === read2(val, foundIndex === -1 ? 0 : i - foundIndex)) {
              if (foundIndex === -1) foundIndex = i;
              if (i - foundIndex + 1 === valLength) return foundIndex * indexSize;
            } else {
              if (foundIndex !== -1) i -= i - foundIndex;
              foundIndex = -1;
            }
          }
        } else {
          if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
          for (i = byteOffset; i >= 0; i--) {
            let found = true;
            for (let j = 0; j < valLength; j++) {
              if (read2(arr, i + j) !== read2(val, j)) {
                found = false;
                break;
              }
            }
            if (found) return i;
          }
        }
        return -1;
      }
      Buffer7.prototype.includes = function includes(val, byteOffset, encoding) {
        return this.indexOf(val, byteOffset, encoding) !== -1;
      };
      Buffer7.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
        return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
      };
      Buffer7.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
        return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
      };
      function hexWrite(buf, string, offset, length) {
        offset = Number(offset) || 0;
        const remaining = buf.length - offset;
        if (!length) {
          length = remaining;
        } else {
          length = Number(length);
          if (length > remaining) {
            length = remaining;
          }
        }
        const strLen = string.length;
        if (length > strLen / 2) {
          length = strLen / 2;
        }
        let i;
        for (i = 0; i < length; ++i) {
          const parsed = parseInt(string.substr(i * 2, 2), 16);
          if (numberIsNaN(parsed)) return i;
          buf[offset + i] = parsed;
        }
        return i;
      }
      function utf8Write(buf, string, offset, length) {
        return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
      }
      function asciiWrite(buf, string, offset, length) {
        return blitBuffer(asciiToBytes(string), buf, offset, length);
      }
      function base64Write(buf, string, offset, length) {
        return blitBuffer(base64ToBytes(string), buf, offset, length);
      }
      function ucs2Write(buf, string, offset, length) {
        return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
      }
      Buffer7.prototype.write = function write2(string, offset, length, encoding) {
        if (offset === void 0) {
          encoding = "utf8";
          length = this.length;
          offset = 0;
        } else if (length === void 0 && typeof offset === "string") {
          encoding = offset;
          length = this.length;
          offset = 0;
        } else if (isFinite(offset)) {
          offset = offset >>> 0;
          if (isFinite(length)) {
            length = length >>> 0;
            if (encoding === void 0) encoding = "utf8";
          } else {
            encoding = length;
            length = void 0;
          }
        } else {
          throw new Error(
            "Buffer.write(string, encoding, offset[, length]) is no longer supported"
          );
        }
        const remaining = this.length - offset;
        if (length === void 0 || length > remaining) length = remaining;
        if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) {
          throw new RangeError("Attempt to write outside buffer bounds");
        }
        if (!encoding) encoding = "utf8";
        let loweredCase = false;
        for (; ; ) {
          switch (encoding) {
            case "hex":
              return hexWrite(this, string, offset, length);
            case "utf8":
            case "utf-8":
              return utf8Write(this, string, offset, length);
            case "ascii":
            case "latin1":
            case "binary":
              return asciiWrite(this, string, offset, length);
            case "base64":
              return base64Write(this, string, offset, length);
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              return ucs2Write(this, string, offset, length);
            default:
              if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
              encoding = ("" + encoding).toLowerCase();
              loweredCase = true;
          }
        }
      };
      Buffer7.prototype.toJSON = function toJSON() {
        return {
          type: "Buffer",
          data: Array.prototype.slice.call(this._arr || this, 0)
        };
      };
      function base64Slice(buf, start, end) {
        if (start === 0 && end === buf.length) {
          return base64.fromByteArray(buf);
        } else {
          return base64.fromByteArray(buf.slice(start, end));
        }
      }
      function utf8Slice(buf, start, end) {
        end = Math.min(buf.length, end);
        const res = [];
        let i = start;
        while (i < end) {
          const firstByte = buf[i];
          let codePoint = null;
          let bytesPerSequence = firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1;
          if (i + bytesPerSequence <= end) {
            let secondByte, thirdByte, fourthByte, tempCodePoint;
            switch (bytesPerSequence) {
              case 1:
                if (firstByte < 128) {
                  codePoint = firstByte;
                }
                break;
              case 2:
                secondByte = buf[i + 1];
                if ((secondByte & 192) === 128) {
                  tempCodePoint = (firstByte & 31) << 6 | secondByte & 63;
                  if (tempCodePoint > 127) {
                    codePoint = tempCodePoint;
                  }
                }
                break;
              case 3:
                secondByte = buf[i + 1];
                thirdByte = buf[i + 2];
                if ((secondByte & 192) === 128 && (thirdByte & 192) === 128) {
                  tempCodePoint = (firstByte & 15) << 12 | (secondByte & 63) << 6 | thirdByte & 63;
                  if (tempCodePoint > 2047 && (tempCodePoint < 55296 || tempCodePoint > 57343)) {
                    codePoint = tempCodePoint;
                  }
                }
                break;
              case 4:
                secondByte = buf[i + 1];
                thirdByte = buf[i + 2];
                fourthByte = buf[i + 3];
                if ((secondByte & 192) === 128 && (thirdByte & 192) === 128 && (fourthByte & 192) === 128) {
                  tempCodePoint = (firstByte & 15) << 18 | (secondByte & 63) << 12 | (thirdByte & 63) << 6 | fourthByte & 63;
                  if (tempCodePoint > 65535 && tempCodePoint < 1114112) {
                    codePoint = tempCodePoint;
                  }
                }
            }
          }
          if (codePoint === null) {
            codePoint = 65533;
            bytesPerSequence = 1;
          } else if (codePoint > 65535) {
            codePoint -= 65536;
            res.push(codePoint >>> 10 & 1023 | 55296);
            codePoint = 56320 | codePoint & 1023;
          }
          res.push(codePoint);
          i += bytesPerSequence;
        }
        return decodeCodePointsArray(res);
      }
      var MAX_ARGUMENTS_LENGTH = 4096;
      function decodeCodePointsArray(codePoints) {
        const len = codePoints.length;
        if (len <= MAX_ARGUMENTS_LENGTH) {
          return String.fromCharCode.apply(String, codePoints);
        }
        let res = "";
        let i = 0;
        while (i < len) {
          res += String.fromCharCode.apply(
            String,
            codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
          );
        }
        return res;
      }
      function asciiSlice(buf, start, end) {
        let ret = "";
        end = Math.min(buf.length, end);
        for (let i = start; i < end; ++i) {
          ret += String.fromCharCode(buf[i] & 127);
        }
        return ret;
      }
      function latin1Slice(buf, start, end) {
        let ret = "";
        end = Math.min(buf.length, end);
        for (let i = start; i < end; ++i) {
          ret += String.fromCharCode(buf[i]);
        }
        return ret;
      }
      function hexSlice(buf, start, end) {
        const len = buf.length;
        if (!start || start < 0) start = 0;
        if (!end || end < 0 || end > len) end = len;
        let out = "";
        for (let i = start; i < end; ++i) {
          out += hexSliceLookupTable[buf[i]];
        }
        return out;
      }
      function utf16leSlice(buf, start, end) {
        const bytes = buf.slice(start, end);
        let res = "";
        for (let i = 0; i < bytes.length - 1; i += 2) {
          res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
        }
        return res;
      }
      Buffer7.prototype.slice = function slice(start, end) {
        const len = this.length;
        start = ~~start;
        end = end === void 0 ? len : ~~end;
        if (start < 0) {
          start += len;
          if (start < 0) start = 0;
        } else if (start > len) {
          start = len;
        }
        if (end < 0) {
          end += len;
          if (end < 0) end = 0;
        } else if (end > len) {
          end = len;
        }
        if (end < start) end = start;
        const newBuf = this.subarray(start, end);
        Object.setPrototypeOf(newBuf, Buffer7.prototype);
        return newBuf;
      };
      function checkOffset(offset, ext, length) {
        if (offset % 1 !== 0 || offset < 0) throw new RangeError("offset is not uint");
        if (offset + ext > length) throw new RangeError("Trying to access beyond buffer length");
      }
      Buffer7.prototype.readUintLE = Buffer7.prototype.readUIntLE = function readUIntLE(offset, byteLength2, noAssert) {
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) checkOffset(offset, byteLength2, this.length);
        let val = this[offset];
        let mul = 1;
        let i = 0;
        while (++i < byteLength2 && (mul *= 256)) {
          val += this[offset + i] * mul;
        }
        return val;
      };
      Buffer7.prototype.readUintBE = Buffer7.prototype.readUIntBE = function readUIntBE(offset, byteLength2, noAssert) {
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) {
          checkOffset(offset, byteLength2, this.length);
        }
        let val = this[offset + --byteLength2];
        let mul = 1;
        while (byteLength2 > 0 && (mul *= 256)) {
          val += this[offset + --byteLength2] * mul;
        }
        return val;
      };
      Buffer7.prototype.readUint8 = Buffer7.prototype.readUInt8 = function readUInt8(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 1, this.length);
        return this[offset];
      };
      Buffer7.prototype.readUint16LE = Buffer7.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 2, this.length);
        return this[offset] | this[offset + 1] << 8;
      };
      Buffer7.prototype.readUint16BE = Buffer7.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 2, this.length);
        return this[offset] << 8 | this[offset + 1];
      };
      Buffer7.prototype.readUint32LE = Buffer7.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 16777216;
      };
      Buffer7.prototype.readUint32BE = Buffer7.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return this[offset] * 16777216 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
      };
      Buffer7.prototype.readBigUInt64LE = defineBigIntMethod(function readBigUInt64LE(offset) {
        offset = offset >>> 0;
        validateNumber(offset, "offset");
        const first = this[offset];
        const last = this[offset + 7];
        if (first === void 0 || last === void 0) {
          boundsError(offset, this.length - 8);
        }
        const lo = first + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 24;
        const hi = this[++offset] + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + last * 2 ** 24;
        return BigInt(lo) + (BigInt(hi) << BigInt(32));
      });
      Buffer7.prototype.readBigUInt64BE = defineBigIntMethod(function readBigUInt64BE(offset) {
        offset = offset >>> 0;
        validateNumber(offset, "offset");
        const first = this[offset];
        const last = this[offset + 7];
        if (first === void 0 || last === void 0) {
          boundsError(offset, this.length - 8);
        }
        const hi = first * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + this[++offset];
        const lo = this[++offset] * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + last;
        return (BigInt(hi) << BigInt(32)) + BigInt(lo);
      });
      Buffer7.prototype.readIntLE = function readIntLE(offset, byteLength2, noAssert) {
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) checkOffset(offset, byteLength2, this.length);
        let val = this[offset];
        let mul = 1;
        let i = 0;
        while (++i < byteLength2 && (mul *= 256)) {
          val += this[offset + i] * mul;
        }
        mul *= 128;
        if (val >= mul) val -= Math.pow(2, 8 * byteLength2);
        return val;
      };
      Buffer7.prototype.readIntBE = function readIntBE(offset, byteLength2, noAssert) {
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) checkOffset(offset, byteLength2, this.length);
        let i = byteLength2;
        let mul = 1;
        let val = this[offset + --i];
        while (i > 0 && (mul *= 256)) {
          val += this[offset + --i] * mul;
        }
        mul *= 128;
        if (val >= mul) val -= Math.pow(2, 8 * byteLength2);
        return val;
      };
      Buffer7.prototype.readInt8 = function readInt8(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 1, this.length);
        if (!(this[offset] & 128)) return this[offset];
        return (255 - this[offset] + 1) * -1;
      };
      Buffer7.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 2, this.length);
        const val = this[offset] | this[offset + 1] << 8;
        return val & 32768 ? val | 4294901760 : val;
      };
      Buffer7.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 2, this.length);
        const val = this[offset + 1] | this[offset] << 8;
        return val & 32768 ? val | 4294901760 : val;
      };
      Buffer7.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
      };
      Buffer7.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
      };
      Buffer7.prototype.readBigInt64LE = defineBigIntMethod(function readBigInt64LE(offset) {
        offset = offset >>> 0;
        validateNumber(offset, "offset");
        const first = this[offset];
        const last = this[offset + 7];
        if (first === void 0 || last === void 0) {
          boundsError(offset, this.length - 8);
        }
        const val = this[offset + 4] + this[offset + 5] * 2 ** 8 + this[offset + 6] * 2 ** 16 + (last << 24);
        return (BigInt(val) << BigInt(32)) + BigInt(first + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 24);
      });
      Buffer7.prototype.readBigInt64BE = defineBigIntMethod(function readBigInt64BE(offset) {
        offset = offset >>> 0;
        validateNumber(offset, "offset");
        const first = this[offset];
        const last = this[offset + 7];
        if (first === void 0 || last === void 0) {
          boundsError(offset, this.length - 8);
        }
        const val = (first << 24) + // Overflow
        this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + this[++offset];
        return (BigInt(val) << BigInt(32)) + BigInt(this[++offset] * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + last);
      });
      Buffer7.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return ieee754.read(this, offset, true, 23, 4);
      };
      Buffer7.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return ieee754.read(this, offset, false, 23, 4);
      };
      Buffer7.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 8, this.length);
        return ieee754.read(this, offset, true, 52, 8);
      };
      Buffer7.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 8, this.length);
        return ieee754.read(this, offset, false, 52, 8);
      };
      function checkInt(buf, value, offset, ext, max, min) {
        if (!Buffer7.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance');
        if (value > max || value < min) throw new RangeError('"value" argument is out of bounds');
        if (offset + ext > buf.length) throw new RangeError("Index out of range");
      }
      Buffer7.prototype.writeUintLE = Buffer7.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength2, noAssert) {
        value = +value;
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) {
          const maxBytes = Math.pow(2, 8 * byteLength2) - 1;
          checkInt(this, value, offset, byteLength2, maxBytes, 0);
        }
        let mul = 1;
        let i = 0;
        this[offset] = value & 255;
        while (++i < byteLength2 && (mul *= 256)) {
          this[offset + i] = value / mul & 255;
        }
        return offset + byteLength2;
      };
      Buffer7.prototype.writeUintBE = Buffer7.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength2, noAssert) {
        value = +value;
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) {
          const maxBytes = Math.pow(2, 8 * byteLength2) - 1;
          checkInt(this, value, offset, byteLength2, maxBytes, 0);
        }
        let i = byteLength2 - 1;
        let mul = 1;
        this[offset + i] = value & 255;
        while (--i >= 0 && (mul *= 256)) {
          this[offset + i] = value / mul & 255;
        }
        return offset + byteLength2;
      };
      Buffer7.prototype.writeUint8 = Buffer7.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 1, 255, 0);
        this[offset] = value & 255;
        return offset + 1;
      };
      Buffer7.prototype.writeUint16LE = Buffer7.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 2, 65535, 0);
        this[offset] = value & 255;
        this[offset + 1] = value >>> 8;
        return offset + 2;
      };
      Buffer7.prototype.writeUint16BE = Buffer7.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 2, 65535, 0);
        this[offset] = value >>> 8;
        this[offset + 1] = value & 255;
        return offset + 2;
      };
      Buffer7.prototype.writeUint32LE = Buffer7.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 4, 4294967295, 0);
        this[offset + 3] = value >>> 24;
        this[offset + 2] = value >>> 16;
        this[offset + 1] = value >>> 8;
        this[offset] = value & 255;
        return offset + 4;
      };
      Buffer7.prototype.writeUint32BE = Buffer7.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 4, 4294967295, 0);
        this[offset] = value >>> 24;
        this[offset + 1] = value >>> 16;
        this[offset + 2] = value >>> 8;
        this[offset + 3] = value & 255;
        return offset + 4;
      };
      function wrtBigUInt64LE(buf, value, offset, min, max) {
        checkIntBI(value, min, max, buf, offset, 7);
        let lo = Number(value & BigInt(4294967295));
        buf[offset++] = lo;
        lo = lo >> 8;
        buf[offset++] = lo;
        lo = lo >> 8;
        buf[offset++] = lo;
        lo = lo >> 8;
        buf[offset++] = lo;
        let hi = Number(value >> BigInt(32) & BigInt(4294967295));
        buf[offset++] = hi;
        hi = hi >> 8;
        buf[offset++] = hi;
        hi = hi >> 8;
        buf[offset++] = hi;
        hi = hi >> 8;
        buf[offset++] = hi;
        return offset;
      }
      function wrtBigUInt64BE(buf, value, offset, min, max) {
        checkIntBI(value, min, max, buf, offset, 7);
        let lo = Number(value & BigInt(4294967295));
        buf[offset + 7] = lo;
        lo = lo >> 8;
        buf[offset + 6] = lo;
        lo = lo >> 8;
        buf[offset + 5] = lo;
        lo = lo >> 8;
        buf[offset + 4] = lo;
        let hi = Number(value >> BigInt(32) & BigInt(4294967295));
        buf[offset + 3] = hi;
        hi = hi >> 8;
        buf[offset + 2] = hi;
        hi = hi >> 8;
        buf[offset + 1] = hi;
        hi = hi >> 8;
        buf[offset] = hi;
        return offset + 8;
      }
      Buffer7.prototype.writeBigUInt64LE = defineBigIntMethod(function writeBigUInt64LE(value, offset = 0) {
        return wrtBigUInt64LE(this, value, offset, BigInt(0), BigInt("0xffffffffffffffff"));
      });
      Buffer7.prototype.writeBigUInt64BE = defineBigIntMethod(function writeBigUInt64BE(value, offset = 0) {
        return wrtBigUInt64BE(this, value, offset, BigInt(0), BigInt("0xffffffffffffffff"));
      });
      Buffer7.prototype.writeIntLE = function writeIntLE(value, offset, byteLength2, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) {
          const limit = Math.pow(2, 8 * byteLength2 - 1);
          checkInt(this, value, offset, byteLength2, limit - 1, -limit);
        }
        let i = 0;
        let mul = 1;
        let sub = 0;
        this[offset] = value & 255;
        while (++i < byteLength2 && (mul *= 256)) {
          if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
            sub = 1;
          }
          this[offset + i] = (value / mul >> 0) - sub & 255;
        }
        return offset + byteLength2;
      };
      Buffer7.prototype.writeIntBE = function writeIntBE(value, offset, byteLength2, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) {
          const limit = Math.pow(2, 8 * byteLength2 - 1);
          checkInt(this, value, offset, byteLength2, limit - 1, -limit);
        }
        let i = byteLength2 - 1;
        let mul = 1;
        let sub = 0;
        this[offset + i] = value & 255;
        while (--i >= 0 && (mul *= 256)) {
          if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
            sub = 1;
          }
          this[offset + i] = (value / mul >> 0) - sub & 255;
        }
        return offset + byteLength2;
      };
      Buffer7.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 1, 127, -128);
        if (value < 0) value = 255 + value + 1;
        this[offset] = value & 255;
        return offset + 1;
      };
      Buffer7.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 2, 32767, -32768);
        this[offset] = value & 255;
        this[offset + 1] = value >>> 8;
        return offset + 2;
      };
      Buffer7.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 2, 32767, -32768);
        this[offset] = value >>> 8;
        this[offset + 1] = value & 255;
        return offset + 2;
      };
      Buffer7.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 4, 2147483647, -2147483648);
        this[offset] = value & 255;
        this[offset + 1] = value >>> 8;
        this[offset + 2] = value >>> 16;
        this[offset + 3] = value >>> 24;
        return offset + 4;
      };
      Buffer7.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 4, 2147483647, -2147483648);
        if (value < 0) value = 4294967295 + value + 1;
        this[offset] = value >>> 24;
        this[offset + 1] = value >>> 16;
        this[offset + 2] = value >>> 8;
        this[offset + 3] = value & 255;
        return offset + 4;
      };
      Buffer7.prototype.writeBigInt64LE = defineBigIntMethod(function writeBigInt64LE(value, offset = 0) {
        return wrtBigUInt64LE(this, value, offset, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
      });
      Buffer7.prototype.writeBigInt64BE = defineBigIntMethod(function writeBigInt64BE(value, offset = 0) {
        return wrtBigUInt64BE(this, value, offset, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
      });
      function checkIEEE754(buf, value, offset, ext, max, min) {
        if (offset + ext > buf.length) throw new RangeError("Index out of range");
        if (offset < 0) throw new RangeError("Index out of range");
      }
      function writeFloat(buf, value, offset, littleEndian, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) {
          checkIEEE754(buf, value, offset, 4, 34028234663852886e22, -34028234663852886e22);
        }
        ieee754.write(buf, value, offset, littleEndian, 23, 4);
        return offset + 4;
      }
      Buffer7.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
        return writeFloat(this, value, offset, true, noAssert);
      };
      Buffer7.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
        return writeFloat(this, value, offset, false, noAssert);
      };
      function writeDouble(buf, value, offset, littleEndian, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) {
          checkIEEE754(buf, value, offset, 8, 17976931348623157e292, -17976931348623157e292);
        }
        ieee754.write(buf, value, offset, littleEndian, 52, 8);
        return offset + 8;
      }
      Buffer7.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
        return writeDouble(this, value, offset, true, noAssert);
      };
      Buffer7.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
        return writeDouble(this, value, offset, false, noAssert);
      };
      Buffer7.prototype.copy = function copy(target, targetStart, start, end) {
        if (!Buffer7.isBuffer(target)) throw new TypeError("argument should be a Buffer");
        if (!start) start = 0;
        if (!end && end !== 0) end = this.length;
        if (targetStart >= target.length) targetStart = target.length;
        if (!targetStart) targetStart = 0;
        if (end > 0 && end < start) end = start;
        if (end === start) return 0;
        if (target.length === 0 || this.length === 0) return 0;
        if (targetStart < 0) {
          throw new RangeError("targetStart out of bounds");
        }
        if (start < 0 || start >= this.length) throw new RangeError("Index out of range");
        if (end < 0) throw new RangeError("sourceEnd out of bounds");
        if (end > this.length) end = this.length;
        if (target.length - targetStart < end - start) {
          end = target.length - targetStart + start;
        }
        const len = end - start;
        if (this === target && typeof Uint8Array.prototype.copyWithin === "function") {
          this.copyWithin(targetStart, start, end);
        } else {
          Uint8Array.prototype.set.call(
            target,
            this.subarray(start, end),
            targetStart
          );
        }
        return len;
      };
      Buffer7.prototype.fill = function fill(val, start, end, encoding) {
        if (typeof val === "string") {
          if (typeof start === "string") {
            encoding = start;
            start = 0;
            end = this.length;
          } else if (typeof end === "string") {
            encoding = end;
            end = this.length;
          }
          if (encoding !== void 0 && typeof encoding !== "string") {
            throw new TypeError("encoding must be a string");
          }
          if (typeof encoding === "string" && !Buffer7.isEncoding(encoding)) {
            throw new TypeError("Unknown encoding: " + encoding);
          }
          if (val.length === 1) {
            const code = val.charCodeAt(0);
            if (encoding === "utf8" && code < 128 || encoding === "latin1") {
              val = code;
            }
          }
        } else if (typeof val === "number") {
          val = val & 255;
        } else if (typeof val === "boolean") {
          val = Number(val);
        }
        if (start < 0 || this.length < start || this.length < end) {
          throw new RangeError("Out of range index");
        }
        if (end <= start) {
          return this;
        }
        start = start >>> 0;
        end = end === void 0 ? this.length : end >>> 0;
        if (!val) val = 0;
        let i;
        if (typeof val === "number") {
          for (i = start; i < end; ++i) {
            this[i] = val;
          }
        } else {
          const bytes = Buffer7.isBuffer(val) ? val : Buffer7.from(val, encoding);
          const len = bytes.length;
          if (len === 0) {
            throw new TypeError('The value "' + val + '" is invalid for argument "value"');
          }
          for (i = 0; i < end - start; ++i) {
            this[i + start] = bytes[i % len];
          }
        }
        return this;
      };
      var errors = {};
      function E(sym, getMessage, Base) {
        errors[sym] = class NodeError extends Base {
          constructor() {
            super();
            Object.defineProperty(this, "message", {
              value: getMessage.apply(this, arguments),
              writable: true,
              configurable: true
            });
            this.name = `${this.name} [${sym}]`;
            this.stack;
            delete this.name;
          }
          get code() {
            return sym;
          }
          set code(value) {
            Object.defineProperty(this, "code", {
              configurable: true,
              enumerable: true,
              value,
              writable: true
            });
          }
          toString() {
            return `${this.name} [${sym}]: ${this.message}`;
          }
        };
      }
      E(
        "ERR_BUFFER_OUT_OF_BOUNDS",
        function(name) {
          if (name) {
            return `${name} is outside of buffer bounds`;
          }
          return "Attempt to access memory outside buffer bounds";
        },
        RangeError
      );
      E(
        "ERR_INVALID_ARG_TYPE",
        function(name, actual) {
          return `The "${name}" argument must be of type number. Received type ${typeof actual}`;
        },
        TypeError
      );
      E(
        "ERR_OUT_OF_RANGE",
        function(str, range, input) {
          let msg = `The value of "${str}" is out of range.`;
          let received = input;
          if (Number.isInteger(input) && Math.abs(input) > 2 ** 32) {
            received = addNumericalSeparator(String(input));
          } else if (typeof input === "bigint") {
            received = String(input);
            if (input > BigInt(2) ** BigInt(32) || input < -(BigInt(2) ** BigInt(32))) {
              received = addNumericalSeparator(received);
            }
            received += "n";
          }
          msg += ` It must be ${range}. Received ${received}`;
          return msg;
        },
        RangeError
      );
      function addNumericalSeparator(val) {
        let res = "";
        let i = val.length;
        const start = val[0] === "-" ? 1 : 0;
        for (; i >= start + 4; i -= 3) {
          res = `_${val.slice(i - 3, i)}${res}`;
        }
        return `${val.slice(0, i)}${res}`;
      }
      function checkBounds(buf, offset, byteLength2) {
        validateNumber(offset, "offset");
        if (buf[offset] === void 0 || buf[offset + byteLength2] === void 0) {
          boundsError(offset, buf.length - (byteLength2 + 1));
        }
      }
      function checkIntBI(value, min, max, buf, offset, byteLength2) {
        if (value > max || value < min) {
          const n = typeof min === "bigint" ? "n" : "";
          let range;
          if (byteLength2 > 3) {
            if (min === 0 || min === BigInt(0)) {
              range = `>= 0${n} and < 2${n} ** ${(byteLength2 + 1) * 8}${n}`;
            } else {
              range = `>= -(2${n} ** ${(byteLength2 + 1) * 8 - 1}${n}) and < 2 ** ${(byteLength2 + 1) * 8 - 1}${n}`;
            }
          } else {
            range = `>= ${min}${n} and <= ${max}${n}`;
          }
          throw new errors.ERR_OUT_OF_RANGE("value", range, value);
        }
        checkBounds(buf, offset, byteLength2);
      }
      function validateNumber(value, name) {
        if (typeof value !== "number") {
          throw new errors.ERR_INVALID_ARG_TYPE(name, "number", value);
        }
      }
      function boundsError(value, length, type) {
        if (Math.floor(value) !== value) {
          validateNumber(value, type);
          throw new errors.ERR_OUT_OF_RANGE(type || "offset", "an integer", value);
        }
        if (length < 0) {
          throw new errors.ERR_BUFFER_OUT_OF_BOUNDS();
        }
        throw new errors.ERR_OUT_OF_RANGE(
          type || "offset",
          `>= ${type ? 1 : 0} and <= ${length}`,
          value
        );
      }
      var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g;
      function base64clean(str) {
        str = str.split("=")[0];
        str = str.trim().replace(INVALID_BASE64_RE, "");
        if (str.length < 2) return "";
        while (str.length % 4 !== 0) {
          str = str + "=";
        }
        return str;
      }
      function utf8ToBytes(string, units) {
        units = units || Infinity;
        let codePoint;
        const length = string.length;
        let leadSurrogate = null;
        const bytes = [];
        for (let i = 0; i < length; ++i) {
          codePoint = string.charCodeAt(i);
          if (codePoint > 55295 && codePoint < 57344) {
            if (!leadSurrogate) {
              if (codePoint > 56319) {
                if ((units -= 3) > -1) bytes.push(239, 191, 189);
                continue;
              } else if (i + 1 === length) {
                if ((units -= 3) > -1) bytes.push(239, 191, 189);
                continue;
              }
              leadSurrogate = codePoint;
              continue;
            }
            if (codePoint < 56320) {
              if ((units -= 3) > -1) bytes.push(239, 191, 189);
              leadSurrogate = codePoint;
              continue;
            }
            codePoint = (leadSurrogate - 55296 << 10 | codePoint - 56320) + 65536;
          } else if (leadSurrogate) {
            if ((units -= 3) > -1) bytes.push(239, 191, 189);
          }
          leadSurrogate = null;
          if (codePoint < 128) {
            if ((units -= 1) < 0) break;
            bytes.push(codePoint);
          } else if (codePoint < 2048) {
            if ((units -= 2) < 0) break;
            bytes.push(
              codePoint >> 6 | 192,
              codePoint & 63 | 128
            );
          } else if (codePoint < 65536) {
            if ((units -= 3) < 0) break;
            bytes.push(
              codePoint >> 12 | 224,
              codePoint >> 6 & 63 | 128,
              codePoint & 63 | 128
            );
          } else if (codePoint < 1114112) {
            if ((units -= 4) < 0) break;
            bytes.push(
              codePoint >> 18 | 240,
              codePoint >> 12 & 63 | 128,
              codePoint >> 6 & 63 | 128,
              codePoint & 63 | 128
            );
          } else {
            throw new Error("Invalid code point");
          }
        }
        return bytes;
      }
      function asciiToBytes(str) {
        const byteArray = [];
        for (let i = 0; i < str.length; ++i) {
          byteArray.push(str.charCodeAt(i) & 255);
        }
        return byteArray;
      }
      function utf16leToBytes(str, units) {
        let c, hi, lo;
        const byteArray = [];
        for (let i = 0; i < str.length; ++i) {
          if ((units -= 2) < 0) break;
          c = str.charCodeAt(i);
          hi = c >> 8;
          lo = c % 256;
          byteArray.push(lo);
          byteArray.push(hi);
        }
        return byteArray;
      }
      function base64ToBytes(str) {
        return base64.toByteArray(base64clean(str));
      }
      function blitBuffer(src, dst, offset, length) {
        let i;
        for (i = 0; i < length; ++i) {
          if (i + offset >= dst.length || i >= src.length) break;
          dst[i + offset] = src[i];
        }
        return i;
      }
      function isInstance2(obj, type) {
        return obj instanceof type || obj != null && obj.constructor != null && obj.constructor.name != null && obj.constructor.name === type.name;
      }
      function numberIsNaN(obj) {
        return obj !== obj;
      }
      var hexSliceLookupTable = function() {
        const alphabet = "0123456789abcdef";
        const table = new Array(256);
        for (let i = 0; i < 16; ++i) {
          const i16 = i * 16;
          for (let j = 0; j < 16; ++j) {
            table[i16 + j] = alphabet[i] + alphabet[j];
          }
        }
        return table;
      }();
      function defineBigIntMethod(fn) {
        return typeof BigInt === "undefined" ? BufferBigIntNotDefined : fn;
      }
      function BufferBigIntNotDefined() {
        throw new Error("BigInt not supported");
      }
    }
  });

  // node_modules/readable-stream/lib/ours/primordials.js
  var require_primordials = __commonJS({
    "node_modules/readable-stream/lib/ours/primordials.js"(exports, module) {
      "use strict";
      var AggregateError = class extends Error {
        constructor(errors) {
          if (!Array.isArray(errors)) {
            throw new TypeError(`Expected input to be an Array, got ${typeof errors}`);
          }
          let message = "";
          for (let i = 0; i < errors.length; i++) {
            message += `    ${errors[i].stack}
`;
          }
          super(message);
          this.name = "AggregateError";
          this.errors = errors;
        }
      };
      module.exports = {
        AggregateError,
        ArrayIsArray(self2) {
          return Array.isArray(self2);
        },
        ArrayPrototypeIncludes(self2, el) {
          return self2.includes(el);
        },
        ArrayPrototypeIndexOf(self2, el) {
          return self2.indexOf(el);
        },
        ArrayPrototypeJoin(self2, sep) {
          return self2.join(sep);
        },
        ArrayPrototypeMap(self2, fn) {
          return self2.map(fn);
        },
        ArrayPrototypePop(self2, el) {
          return self2.pop(el);
        },
        ArrayPrototypePush(self2, el) {
          return self2.push(el);
        },
        ArrayPrototypeSlice(self2, start, end) {
          return self2.slice(start, end);
        },
        Error,
        FunctionPrototypeCall(fn, thisArgs, ...args) {
          return fn.call(thisArgs, ...args);
        },
        FunctionPrototypeSymbolHasInstance(self2, instance) {
          return Function.prototype[Symbol.hasInstance].call(self2, instance);
        },
        MathFloor: Math.floor,
        Number,
        NumberIsInteger: Number.isInteger,
        NumberIsNaN: Number.isNaN,
        NumberMAX_SAFE_INTEGER: Number.MAX_SAFE_INTEGER,
        NumberMIN_SAFE_INTEGER: Number.MIN_SAFE_INTEGER,
        NumberParseInt: Number.parseInt,
        ObjectDefineProperties(self2, props) {
          return Object.defineProperties(self2, props);
        },
        ObjectDefineProperty(self2, name, prop) {
          return Object.defineProperty(self2, name, prop);
        },
        ObjectGetOwnPropertyDescriptor(self2, name) {
          return Object.getOwnPropertyDescriptor(self2, name);
        },
        ObjectKeys(obj) {
          return Object.keys(obj);
        },
        ObjectSetPrototypeOf(target, proto) {
          return Object.setPrototypeOf(target, proto);
        },
        Promise,
        PromisePrototypeCatch(self2, fn) {
          return self2.catch(fn);
        },
        PromisePrototypeThen(self2, thenFn, catchFn) {
          return self2.then(thenFn, catchFn);
        },
        PromiseReject(err2) {
          return Promise.reject(err2);
        },
        PromiseResolve(val) {
          return Promise.resolve(val);
        },
        ReflectApply: Reflect.apply,
        RegExpPrototypeTest(self2, value) {
          return self2.test(value);
        },
        SafeSet: Set,
        String,
        StringPrototypeSlice(self2, start, end) {
          return self2.slice(start, end);
        },
        StringPrototypeToLowerCase(self2) {
          return self2.toLowerCase();
        },
        StringPrototypeToUpperCase(self2) {
          return self2.toUpperCase();
        },
        StringPrototypeTrim(self2) {
          return self2.trim();
        },
        Symbol,
        SymbolFor: Symbol.for,
        SymbolAsyncIterator: Symbol.asyncIterator,
        SymbolHasInstance: Symbol.hasInstance,
        SymbolIterator: Symbol.iterator,
        SymbolDispose: Symbol.dispose || Symbol("Symbol.dispose"),
        SymbolAsyncDispose: Symbol.asyncDispose || Symbol("Symbol.asyncDispose"),
        TypedArrayPrototypeSet(self2, buf, len) {
          return self2.set(buf, len);
        },
        Boolean,
        Uint8Array
      };
    }
  });

  // node_modules/readable-stream/lib/ours/util/inspect.js
  var require_inspect = __commonJS({
    "node_modules/readable-stream/lib/ours/util/inspect.js"(exports, module) {
      "use strict";
      module.exports = {
        format(format3, ...args) {
          return format3.replace(/%([sdifj])/g, function(...[_unused, type]) {
            const replacement = args.shift();
            if (type === "f") {
              return replacement.toFixed(6);
            } else if (type === "j") {
              return JSON.stringify(replacement);
            } else if (type === "s" && typeof replacement === "object") {
              const ctor = replacement.constructor !== Object ? replacement.constructor.name : "";
              return `${ctor} {}`.trim();
            } else {
              return replacement.toString();
            }
          });
        },
        inspect(value) {
          switch (typeof value) {
            case "string":
              if (value.includes("'")) {
                if (!value.includes('"')) {
                  return `"${value}"`;
                } else if (!value.includes("`") && !value.includes("${")) {
                  return `\`${value}\``;
                }
              }
              return `'${value}'`;
            case "number":
              if (isNaN(value)) {
                return "NaN";
              } else if (Object.is(value, -0)) {
                return String(value);
              }
              return value;
            case "bigint":
              return `${String(value)}n`;
            case "boolean":
            case "undefined":
              return String(value);
            case "object":
              return "{}";
          }
        }
      };
    }
  });

  // node_modules/readable-stream/lib/ours/errors.js
  var require_errors = __commonJS({
    "node_modules/readable-stream/lib/ours/errors.js"(exports, module) {
      "use strict";
      var { format: format3, inspect } = require_inspect();
      var { AggregateError: CustomAggregateError } = require_primordials();
      var AggregateError = globalThis.AggregateError || CustomAggregateError;
      var kIsNodeError = Symbol("kIsNodeError");
      var kTypes = [
        "string",
        "function",
        "number",
        "object",
        // Accept 'Function' and 'Object' as alternative to the lower cased version.
        "Function",
        "Object",
        "boolean",
        "bigint",
        "symbol"
      ];
      var classRegExp = /^([A-Z][a-z0-9]*)+$/;
      var nodeInternalPrefix = "__node_internal_";
      var codes = {};
      function assert(value, message) {
        if (!value) {
          throw new codes.ERR_INTERNAL_ASSERTION(message);
        }
      }
      function addNumericalSeparator(val) {
        let res = "";
        let i = val.length;
        const start = val[0] === "-" ? 1 : 0;
        for (; i >= start + 4; i -= 3) {
          res = `_${val.slice(i - 3, i)}${res}`;
        }
        return `${val.slice(0, i)}${res}`;
      }
      function getMessage(key, msg, args) {
        if (typeof msg === "function") {
          assert(
            msg.length <= args.length,
            // Default options do not count.
            `Code: ${key}; The provided arguments length (${args.length}) does not match the required ones (${msg.length}).`
          );
          return msg(...args);
        }
        const expectedLength = (msg.match(/%[dfijoOs]/g) || []).length;
        assert(
          expectedLength === args.length,
          `Code: ${key}; The provided arguments length (${args.length}) does not match the required ones (${expectedLength}).`
        );
        if (args.length === 0) {
          return msg;
        }
        return format3(msg, ...args);
      }
      function E(code, message, Base) {
        if (!Base) {
          Base = Error;
        }
        class NodeError extends Base {
          constructor(...args) {
            super(getMessage(code, message, args));
          }
          toString() {
            return `${this.name} [${code}]: ${this.message}`;
          }
        }
        Object.defineProperties(NodeError.prototype, {
          name: {
            value: Base.name,
            writable: true,
            enumerable: false,
            configurable: true
          },
          toString: {
            value() {
              return `${this.name} [${code}]: ${this.message}`;
            },
            writable: true,
            enumerable: false,
            configurable: true
          }
        });
        NodeError.prototype.code = code;
        NodeError.prototype[kIsNodeError] = true;
        codes[code] = NodeError;
      }
      function hideStackFrames(fn) {
        const hidden = nodeInternalPrefix + fn.name;
        Object.defineProperty(fn, "name", {
          value: hidden
        });
        return fn;
      }
      function aggregateTwoErrors(innerError, outerError) {
        if (innerError && outerError && innerError !== outerError) {
          if (Array.isArray(outerError.errors)) {
            outerError.errors.push(innerError);
            return outerError;
          }
          const err2 = new AggregateError([outerError, innerError], outerError.message);
          err2.code = outerError.code;
          return err2;
        }
        return innerError || outerError;
      }
      var AbortError = class extends Error {
        constructor(message = "The operation was aborted", options = void 0) {
          if (options !== void 0 && typeof options !== "object") {
            throw new codes.ERR_INVALID_ARG_TYPE("options", "Object", options);
          }
          super(message, options);
          this.code = "ABORT_ERR";
          this.name = "AbortError";
        }
      };
      E("ERR_ASSERTION", "%s", Error);
      E(
        "ERR_INVALID_ARG_TYPE",
        (name, expected, actual) => {
          assert(typeof name === "string", "'name' must be a string");
          if (!Array.isArray(expected)) {
            expected = [expected];
          }
          let msg = "The ";
          if (name.endsWith(" argument")) {
            msg += `${name} `;
          } else {
            msg += `"${name}" ${name.includes(".") ? "property" : "argument"} `;
          }
          msg += "must be ";
          const types3 = [];
          const instances = [];
          const other = [];
          for (const value of expected) {
            assert(typeof value === "string", "All expected entries have to be of type string");
            if (kTypes.includes(value)) {
              types3.push(value.toLowerCase());
            } else if (classRegExp.test(value)) {
              instances.push(value);
            } else {
              assert(value !== "object", 'The value "object" should be written as "Object"');
              other.push(value);
            }
          }
          if (instances.length > 0) {
            const pos = types3.indexOf("object");
            if (pos !== -1) {
              types3.splice(types3, pos, 1);
              instances.push("Object");
            }
          }
          if (types3.length > 0) {
            switch (types3.length) {
              case 1:
                msg += `of type ${types3[0]}`;
                break;
              case 2:
                msg += `one of type ${types3[0]} or ${types3[1]}`;
                break;
              default: {
                const last = types3.pop();
                msg += `one of type ${types3.join(", ")}, or ${last}`;
              }
            }
            if (instances.length > 0 || other.length > 0) {
              msg += " or ";
            }
          }
          if (instances.length > 0) {
            switch (instances.length) {
              case 1:
                msg += `an instance of ${instances[0]}`;
                break;
              case 2:
                msg += `an instance of ${instances[0]} or ${instances[1]}`;
                break;
              default: {
                const last = instances.pop();
                msg += `an instance of ${instances.join(", ")}, or ${last}`;
              }
            }
            if (other.length > 0) {
              msg += " or ";
            }
          }
          switch (other.length) {
            case 0:
              break;
            case 1:
              if (other[0].toLowerCase() !== other[0]) {
                msg += "an ";
              }
              msg += `${other[0]}`;
              break;
            case 2:
              msg += `one of ${other[0]} or ${other[1]}`;
              break;
            default: {
              const last = other.pop();
              msg += `one of ${other.join(", ")}, or ${last}`;
            }
          }
          if (actual == null) {
            msg += `. Received ${actual}`;
          } else if (typeof actual === "function" && actual.name) {
            msg += `. Received function ${actual.name}`;
          } else if (typeof actual === "object") {
            var _actual$constructor;
            if ((_actual$constructor = actual.constructor) !== null && _actual$constructor !== void 0 && _actual$constructor.name) {
              msg += `. Received an instance of ${actual.constructor.name}`;
            } else {
              const inspected = inspect(actual, {
                depth: -1
              });
              msg += `. Received ${inspected}`;
            }
          } else {
            let inspected = inspect(actual, {
              colors: false
            });
            if (inspected.length > 25) {
              inspected = `${inspected.slice(0, 25)}...`;
            }
            msg += `. Received type ${typeof actual} (${inspected})`;
          }
          return msg;
        },
        TypeError
      );
      E(
        "ERR_INVALID_ARG_VALUE",
        (name, value, reason = "is invalid") => {
          let inspected = inspect(value);
          if (inspected.length > 128) {
            inspected = inspected.slice(0, 128) + "...";
          }
          const type = name.includes(".") ? "property" : "argument";
          return `The ${type} '${name}' ${reason}. Received ${inspected}`;
        },
        TypeError
      );
      E(
        "ERR_INVALID_RETURN_VALUE",
        (input, name, value) => {
          var _value$constructor;
          const type = value !== null && value !== void 0 && (_value$constructor = value.constructor) !== null && _value$constructor !== void 0 && _value$constructor.name ? `instance of ${value.constructor.name}` : `type ${typeof value}`;
          return `Expected ${input} to be returned from the "${name}" function but got ${type}.`;
        },
        TypeError
      );
      E(
        "ERR_MISSING_ARGS",
        (...args) => {
          assert(args.length > 0, "At least one arg needs to be specified");
          let msg;
          const len = args.length;
          args = (Array.isArray(args) ? args : [args]).map((a) => `"${a}"`).join(" or ");
          switch (len) {
            case 1:
              msg += `The ${args[0]} argument`;
              break;
            case 2:
              msg += `The ${args[0]} and ${args[1]} arguments`;
              break;
            default:
              {
                const last = args.pop();
                msg += `The ${args.join(", ")}, and ${last} arguments`;
              }
              break;
          }
          return `${msg} must be specified`;
        },
        TypeError
      );
      E(
        "ERR_OUT_OF_RANGE",
        (str, range, input) => {
          assert(range, 'Missing "range" argument');
          let received;
          if (Number.isInteger(input) && Math.abs(input) > 2 ** 32) {
            received = addNumericalSeparator(String(input));
          } else if (typeof input === "bigint") {
            received = String(input);
            const limit = BigInt(2) ** BigInt(32);
            if (input > limit || input < -limit) {
              received = addNumericalSeparator(received);
            }
            received += "n";
          } else {
            received = inspect(input);
          }
          return `The value of "${str}" is out of range. It must be ${range}. Received ${received}`;
        },
        RangeError
      );
      E("ERR_MULTIPLE_CALLBACK", "Callback called multiple times", Error);
      E("ERR_METHOD_NOT_IMPLEMENTED", "The %s method is not implemented", Error);
      E("ERR_STREAM_ALREADY_FINISHED", "Cannot call %s after a stream was finished", Error);
      E("ERR_STREAM_CANNOT_PIPE", "Cannot pipe, not readable", Error);
      E("ERR_STREAM_DESTROYED", "Cannot call %s after a stream was destroyed", Error);
      E("ERR_STREAM_NULL_VALUES", "May not write null values to stream", TypeError);
      E("ERR_STREAM_PREMATURE_CLOSE", "Premature close", Error);
      E("ERR_STREAM_PUSH_AFTER_EOF", "stream.push() after EOF", Error);
      E("ERR_STREAM_UNSHIFT_AFTER_END_EVENT", "stream.unshift() after end event", Error);
      E("ERR_STREAM_WRITE_AFTER_END", "write after end", Error);
      E("ERR_UNKNOWN_ENCODING", "Unknown encoding: %s", TypeError);
      module.exports = {
        AbortError,
        aggregateTwoErrors: hideStackFrames(aggregateTwoErrors),
        hideStackFrames,
        codes
      };
    }
  });

  // node_modules/abort-controller/browser.js
  var require_browser = __commonJS({
    "node_modules/abort-controller/browser.js"(exports, module) {
      "use strict";
      var { AbortController: AbortController2, AbortSignal } = typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : (
        /* otherwise */
        void 0
      );
      module.exports = AbortController2;
      module.exports.AbortSignal = AbortSignal;
      module.exports.default = AbortController2;
    }
  });

  // node_modules/events/events.js
  var require_events = __commonJS({
    "node_modules/events/events.js"(exports, module) {
      "use strict";
      var R = typeof Reflect === "object" ? Reflect : null;
      var ReflectApply = R && typeof R.apply === "function" ? R.apply : function ReflectApply2(target, receiver, args) {
        return Function.prototype.apply.call(target, receiver, args);
      };
      var ReflectOwnKeys;
      if (R && typeof R.ownKeys === "function") {
        ReflectOwnKeys = R.ownKeys;
      } else if (Object.getOwnPropertySymbols) {
        ReflectOwnKeys = function ReflectOwnKeys2(target) {
          return Object.getOwnPropertyNames(target).concat(Object.getOwnPropertySymbols(target));
        };
      } else {
        ReflectOwnKeys = function ReflectOwnKeys2(target) {
          return Object.getOwnPropertyNames(target);
        };
      }
      function ProcessEmitWarning(warning) {
        if (console && console.warn) console.warn(warning);
      }
      var NumberIsNaN = Number.isNaN || function NumberIsNaN2(value) {
        return value !== value;
      };
      function EventEmitter2() {
        EventEmitter2.init.call(this);
      }
      module.exports = EventEmitter2;
      module.exports.once = once;
      EventEmitter2.EventEmitter = EventEmitter2;
      EventEmitter2.prototype._events = void 0;
      EventEmitter2.prototype._eventsCount = 0;
      EventEmitter2.prototype._maxListeners = void 0;
      var defaultMaxListeners = 10;
      function checkListener(listener) {
        if (typeof listener !== "function") {
          throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
        }
      }
      Object.defineProperty(EventEmitter2, "defaultMaxListeners", {
        enumerable: true,
        get: function() {
          return defaultMaxListeners;
        },
        set: function(arg) {
          if (typeof arg !== "number" || arg < 0 || NumberIsNaN(arg)) {
            throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + ".");
          }
          defaultMaxListeners = arg;
        }
      });
      EventEmitter2.init = function() {
        if (this._events === void 0 || this._events === Object.getPrototypeOf(this)._events) {
          this._events = /* @__PURE__ */ Object.create(null);
          this._eventsCount = 0;
        }
        this._maxListeners = this._maxListeners || void 0;
      };
      EventEmitter2.prototype.setMaxListeners = function setMaxListeners(n) {
        if (typeof n !== "number" || n < 0 || NumberIsNaN(n)) {
          throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + ".");
        }
        this._maxListeners = n;
        return this;
      };
      function _getMaxListeners(that) {
        if (that._maxListeners === void 0)
          return EventEmitter2.defaultMaxListeners;
        return that._maxListeners;
      }
      EventEmitter2.prototype.getMaxListeners = function getMaxListeners() {
        return _getMaxListeners(this);
      };
      EventEmitter2.prototype.emit = function emit(type) {
        var args = [];
        for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
        var doError = type === "error";
        var events = this._events;
        if (events !== void 0)
          doError = doError && events.error === void 0;
        else if (!doError)
          return false;
        if (doError) {
          var er;
          if (args.length > 0)
            er = args[0];
          if (er instanceof Error) {
            throw er;
          }
          var err2 = new Error("Unhandled error." + (er ? " (" + er.message + ")" : ""));
          err2.context = er;
          throw err2;
        }
        var handler = events[type];
        if (handler === void 0)
          return false;
        if (typeof handler === "function") {
          ReflectApply(handler, this, args);
        } else {
          var len = handler.length;
          var listeners = arrayClone(handler, len);
          for (var i = 0; i < len; ++i)
            ReflectApply(listeners[i], this, args);
        }
        return true;
      };
      function _addListener(target, type, listener, prepend) {
        var m;
        var events;
        var existing;
        checkListener(listener);
        events = target._events;
        if (events === void 0) {
          events = target._events = /* @__PURE__ */ Object.create(null);
          target._eventsCount = 0;
        } else {
          if (events.newListener !== void 0) {
            target.emit(
              "newListener",
              type,
              listener.listener ? listener.listener : listener
            );
            events = target._events;
          }
          existing = events[type];
        }
        if (existing === void 0) {
          existing = events[type] = listener;
          ++target._eventsCount;
        } else {
          if (typeof existing === "function") {
            existing = events[type] = prepend ? [listener, existing] : [existing, listener];
          } else if (prepend) {
            existing.unshift(listener);
          } else {
            existing.push(listener);
          }
          m = _getMaxListeners(target);
          if (m > 0 && existing.length > m && !existing.warned) {
            existing.warned = true;
            var w = new Error("Possible EventEmitter memory leak detected. " + existing.length + " " + String(type) + " listeners added. Use emitter.setMaxListeners() to increase limit");
            w.name = "MaxListenersExceededWarning";
            w.emitter = target;
            w.type = type;
            w.count = existing.length;
            ProcessEmitWarning(w);
          }
        }
        return target;
      }
      EventEmitter2.prototype.addListener = function addListener(type, listener) {
        return _addListener(this, type, listener, false);
      };
      EventEmitter2.prototype.on = EventEmitter2.prototype.addListener;
      EventEmitter2.prototype.prependListener = function prependListener(type, listener) {
        return _addListener(this, type, listener, true);
      };
      function onceWrapper() {
        if (!this.fired) {
          this.target.removeListener(this.type, this.wrapFn);
          this.fired = true;
          if (arguments.length === 0)
            return this.listener.call(this.target);
          return this.listener.apply(this.target, arguments);
        }
      }
      function _onceWrap(target, type, listener) {
        var state = { fired: false, wrapFn: void 0, target, type, listener };
        var wrapped = onceWrapper.bind(state);
        wrapped.listener = listener;
        state.wrapFn = wrapped;
        return wrapped;
      }
      EventEmitter2.prototype.once = function once2(type, listener) {
        checkListener(listener);
        this.on(type, _onceWrap(this, type, listener));
        return this;
      };
      EventEmitter2.prototype.prependOnceListener = function prependOnceListener(type, listener) {
        checkListener(listener);
        this.prependListener(type, _onceWrap(this, type, listener));
        return this;
      };
      EventEmitter2.prototype.removeListener = function removeListener(type, listener) {
        var list2, events, position, i, originalListener;
        checkListener(listener);
        events = this._events;
        if (events === void 0)
          return this;
        list2 = events[type];
        if (list2 === void 0)
          return this;
        if (list2 === listener || list2.listener === listener) {
          if (--this._eventsCount === 0)
            this._events = /* @__PURE__ */ Object.create(null);
          else {
            delete events[type];
            if (events.removeListener)
              this.emit("removeListener", type, list2.listener || listener);
          }
        } else if (typeof list2 !== "function") {
          position = -1;
          for (i = list2.length - 1; i >= 0; i--) {
            if (list2[i] === listener || list2[i].listener === listener) {
              originalListener = list2[i].listener;
              position = i;
              break;
            }
          }
          if (position < 0)
            return this;
          if (position === 0)
            list2.shift();
          else {
            spliceOne(list2, position);
          }
          if (list2.length === 1)
            events[type] = list2[0];
          if (events.removeListener !== void 0)
            this.emit("removeListener", type, originalListener || listener);
        }
        return this;
      };
      EventEmitter2.prototype.off = EventEmitter2.prototype.removeListener;
      EventEmitter2.prototype.removeAllListeners = function removeAllListeners(type) {
        var listeners, events, i;
        events = this._events;
        if (events === void 0)
          return this;
        if (events.removeListener === void 0) {
          if (arguments.length === 0) {
            this._events = /* @__PURE__ */ Object.create(null);
            this._eventsCount = 0;
          } else if (events[type] !== void 0) {
            if (--this._eventsCount === 0)
              this._events = /* @__PURE__ */ Object.create(null);
            else
              delete events[type];
          }
          return this;
        }
        if (arguments.length === 0) {
          var keys = Object.keys(events);
          var key;
          for (i = 0; i < keys.length; ++i) {
            key = keys[i];
            if (key === "removeListener") continue;
            this.removeAllListeners(key);
          }
          this.removeAllListeners("removeListener");
          this._events = /* @__PURE__ */ Object.create(null);
          this._eventsCount = 0;
          return this;
        }
        listeners = events[type];
        if (typeof listeners === "function") {
          this.removeListener(type, listeners);
        } else if (listeners !== void 0) {
          for (i = listeners.length - 1; i >= 0; i--) {
            this.removeListener(type, listeners[i]);
          }
        }
        return this;
      };
      function _listeners(target, type, unwrap) {
        var events = target._events;
        if (events === void 0)
          return [];
        var evlistener = events[type];
        if (evlistener === void 0)
          return [];
        if (typeof evlistener === "function")
          return unwrap ? [evlistener.listener || evlistener] : [evlistener];
        return unwrap ? unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
      }
      EventEmitter2.prototype.listeners = function listeners(type) {
        return _listeners(this, type, true);
      };
      EventEmitter2.prototype.rawListeners = function rawListeners(type) {
        return _listeners(this, type, false);
      };
      EventEmitter2.listenerCount = function(emitter, type) {
        if (typeof emitter.listenerCount === "function") {
          return emitter.listenerCount(type);
        } else {
          return listenerCount.call(emitter, type);
        }
      };
      EventEmitter2.prototype.listenerCount = listenerCount;
      function listenerCount(type) {
        var events = this._events;
        if (events !== void 0) {
          var evlistener = events[type];
          if (typeof evlistener === "function") {
            return 1;
          } else if (evlistener !== void 0) {
            return evlistener.length;
          }
        }
        return 0;
      }
      EventEmitter2.prototype.eventNames = function eventNames() {
        return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
      };
      function arrayClone(arr, n) {
        var copy = new Array(n);
        for (var i = 0; i < n; ++i)
          copy[i] = arr[i];
        return copy;
      }
      function spliceOne(list2, index) {
        for (; index + 1 < list2.length; index++)
          list2[index] = list2[index + 1];
        list2.pop();
      }
      function unwrapListeners(arr) {
        var ret = new Array(arr.length);
        for (var i = 0; i < ret.length; ++i) {
          ret[i] = arr[i].listener || arr[i];
        }
        return ret;
      }
      function once(emitter, name) {
        return new Promise(function(resolve2, reject) {
          function errorListener(err2) {
            emitter.removeListener(name, resolver);
            reject(err2);
          }
          function resolver() {
            if (typeof emitter.removeListener === "function") {
              emitter.removeListener("error", errorListener);
            }
            resolve2([].slice.call(arguments));
          }
          ;
          eventTargetAgnosticAddListener(emitter, name, resolver, { once: true });
          if (name !== "error") {
            addErrorHandlerIfEventEmitter(emitter, errorListener, { once: true });
          }
        });
      }
      function addErrorHandlerIfEventEmitter(emitter, handler, flags) {
        if (typeof emitter.on === "function") {
          eventTargetAgnosticAddListener(emitter, "error", handler, flags);
        }
      }
      function eventTargetAgnosticAddListener(emitter, name, listener, flags) {
        if (typeof emitter.on === "function") {
          if (flags.once) {
            emitter.once(name, listener);
          } else {
            emitter.on(name, listener);
          }
        } else if (typeof emitter.addEventListener === "function") {
          emitter.addEventListener(name, function wrapListener(arg) {
            if (flags.once) {
              emitter.removeEventListener(name, wrapListener);
            }
            listener(arg);
          });
        } else {
          throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof emitter);
        }
      }
    }
  });

  // node_modules/readable-stream/lib/ours/util.js
  var require_util = __commonJS({
    "node_modules/readable-stream/lib/ours/util.js"(exports, module) {
      "use strict";
      var bufferModule = require_buffer();
      var { format: format3, inspect } = require_inspect();
      var {
        codes: { ERR_INVALID_ARG_TYPE }
      } = require_errors();
      var { kResistStopPropagation, AggregateError, SymbolDispose } = require_primordials();
      var AbortSignal = globalThis.AbortSignal || require_browser().AbortSignal;
      var AbortController2 = globalThis.AbortController || require_browser().AbortController;
      var AsyncFunction = Object.getPrototypeOf(async function() {
      }).constructor;
      var Blob2 = globalThis.Blob || bufferModule.Blob;
      var isBlob = typeof Blob2 !== "undefined" ? function isBlob2(b) {
        return b instanceof Blob2;
      } : function isBlob2(b) {
        return false;
      };
      var validateAbortSignal = (signal, name) => {
        if (signal !== void 0 && (signal === null || typeof signal !== "object" || !("aborted" in signal))) {
          throw new ERR_INVALID_ARG_TYPE(name, "AbortSignal", signal);
        }
      };
      var validateFunction = (value, name) => {
        if (typeof value !== "function") {
          throw new ERR_INVALID_ARG_TYPE(name, "Function", value);
        }
      };
      module.exports = {
        AggregateError,
        kEmptyObject: Object.freeze({}),
        once(callback) {
          let called = false;
          return function(...args) {
            if (called) {
              return;
            }
            called = true;
            callback.apply(this, args);
          };
        },
        createDeferredPromise: function() {
          let resolve2;
          let reject;
          const promise = new Promise((res, rej) => {
            resolve2 = res;
            reject = rej;
          });
          return {
            promise,
            resolve: resolve2,
            reject
          };
        },
        promisify(fn) {
          return new Promise((resolve2, reject) => {
            fn((err2, ...args) => {
              if (err2) {
                return reject(err2);
              }
              return resolve2(...args);
            });
          });
        },
        debuglog() {
          return function() {
          };
        },
        format: format3,
        inspect,
        types: {
          isAsyncFunction(fn) {
            return fn instanceof AsyncFunction;
          },
          isArrayBufferView(arr) {
            return ArrayBuffer.isView(arr);
          }
        },
        isBlob,
        deprecate(fn, message) {
          return fn;
        },
        addAbortListener: require_events().addAbortListener || function addAbortListener(signal, listener) {
          if (signal === void 0) {
            throw new ERR_INVALID_ARG_TYPE("signal", "AbortSignal", signal);
          }
          validateAbortSignal(signal, "signal");
          validateFunction(listener, "listener");
          let removeEventListener;
          if (signal.aborted) {
            queueMicrotask(() => listener());
          } else {
            signal.addEventListener("abort", listener, {
              __proto__: null,
              once: true,
              [kResistStopPropagation]: true
            });
            removeEventListener = () => {
              signal.removeEventListener("abort", listener);
            };
          }
          return {
            __proto__: null,
            [SymbolDispose]() {
              var _removeEventListener;
              (_removeEventListener = removeEventListener) === null || _removeEventListener === void 0 ? void 0 : _removeEventListener();
            }
          };
        },
        AbortSignalAny: AbortSignal.any || function AbortSignalAny(signals) {
          if (signals.length === 1) {
            return signals[0];
          }
          const ac = new AbortController2();
          const abort = () => ac.abort();
          signals.forEach((signal) => {
            validateAbortSignal(signal, "signals");
            signal.addEventListener("abort", abort, {
              once: true
            });
          });
          ac.signal.addEventListener(
            "abort",
            () => {
              signals.forEach((signal) => signal.removeEventListener("abort", abort));
            },
            {
              once: true
            }
          );
          return ac.signal;
        }
      };
      module.exports.promisify.custom = Symbol.for("nodejs.util.promisify.custom");
    }
  });

  // node_modules/readable-stream/lib/internal/validators.js
  var require_validators = __commonJS({
    "node_modules/readable-stream/lib/internal/validators.js"(exports, module) {
      "use strict";
      var {
        ArrayIsArray,
        ArrayPrototypeIncludes,
        ArrayPrototypeJoin,
        ArrayPrototypeMap,
        NumberIsInteger,
        NumberIsNaN,
        NumberMAX_SAFE_INTEGER,
        NumberMIN_SAFE_INTEGER,
        NumberParseInt,
        ObjectPrototypeHasOwnProperty,
        RegExpPrototypeExec,
        String: String2,
        StringPrototypeToUpperCase,
        StringPrototypeTrim
      } = require_primordials();
      var {
        hideStackFrames,
        codes: { ERR_SOCKET_BAD_PORT, ERR_INVALID_ARG_TYPE, ERR_INVALID_ARG_VALUE, ERR_OUT_OF_RANGE, ERR_UNKNOWN_SIGNAL }
      } = require_errors();
      var { normalizeEncoding } = require_util();
      var { isAsyncFunction, isArrayBufferView } = require_util().types;
      var signals = {};
      function isInt32(value) {
        return value === (value | 0);
      }
      function isUint32(value) {
        return value === value >>> 0;
      }
      var octalReg = /^[0-7]+$/;
      var modeDesc = "must be a 32-bit unsigned integer or an octal string";
      function parseFileMode(value, name, def) {
        if (typeof value === "undefined") {
          value = def;
        }
        if (typeof value === "string") {
          if (RegExpPrototypeExec(octalReg, value) === null) {
            throw new ERR_INVALID_ARG_VALUE(name, value, modeDesc);
          }
          value = NumberParseInt(value, 8);
        }
        validateUint32(value, name);
        return value;
      }
      var validateInteger = hideStackFrames((value, name, min = NumberMIN_SAFE_INTEGER, max = NumberMAX_SAFE_INTEGER) => {
        if (typeof value !== "number") throw new ERR_INVALID_ARG_TYPE(name, "number", value);
        if (!NumberIsInteger(value)) throw new ERR_OUT_OF_RANGE(name, "an integer", value);
        if (value < min || value > max) throw new ERR_OUT_OF_RANGE(name, `>= ${min} && <= ${max}`, value);
      });
      var validateInt32 = hideStackFrames((value, name, min = -2147483648, max = 2147483647) => {
        if (typeof value !== "number") {
          throw new ERR_INVALID_ARG_TYPE(name, "number", value);
        }
        if (!NumberIsInteger(value)) {
          throw new ERR_OUT_OF_RANGE(name, "an integer", value);
        }
        if (value < min || value > max) {
          throw new ERR_OUT_OF_RANGE(name, `>= ${min} && <= ${max}`, value);
        }
      });
      var validateUint32 = hideStackFrames((value, name, positive = false) => {
        if (typeof value !== "number") {
          throw new ERR_INVALID_ARG_TYPE(name, "number", value);
        }
        if (!NumberIsInteger(value)) {
          throw new ERR_OUT_OF_RANGE(name, "an integer", value);
        }
        const min = positive ? 1 : 0;
        const max = 4294967295;
        if (value < min || value > max) {
          throw new ERR_OUT_OF_RANGE(name, `>= ${min} && <= ${max}`, value);
        }
      });
      function validateString(value, name) {
        if (typeof value !== "string") throw new ERR_INVALID_ARG_TYPE(name, "string", value);
      }
      function validateNumber(value, name, min = void 0, max) {
        if (typeof value !== "number") throw new ERR_INVALID_ARG_TYPE(name, "number", value);
        if (min != null && value < min || max != null && value > max || (min != null || max != null) && NumberIsNaN(value)) {
          throw new ERR_OUT_OF_RANGE(
            name,
            `${min != null ? `>= ${min}` : ""}${min != null && max != null ? " && " : ""}${max != null ? `<= ${max}` : ""}`,
            value
          );
        }
      }
      var validateOneOf = hideStackFrames((value, name, oneOf) => {
        if (!ArrayPrototypeIncludes(oneOf, value)) {
          const allowed = ArrayPrototypeJoin(
            ArrayPrototypeMap(oneOf, (v) => typeof v === "string" ? `'${v}'` : String2(v)),
            ", "
          );
          const reason = "must be one of: " + allowed;
          throw new ERR_INVALID_ARG_VALUE(name, value, reason);
        }
      });
      function validateBoolean(value, name) {
        if (typeof value !== "boolean") throw new ERR_INVALID_ARG_TYPE(name, "boolean", value);
      }
      function getOwnPropertyValueOrDefault(options, key, defaultValue) {
        return options == null || !ObjectPrototypeHasOwnProperty(options, key) ? defaultValue : options[key];
      }
      var validateObject = hideStackFrames((value, name, options = null) => {
        const allowArray = getOwnPropertyValueOrDefault(options, "allowArray", false);
        const allowFunction = getOwnPropertyValueOrDefault(options, "allowFunction", false);
        const nullable = getOwnPropertyValueOrDefault(options, "nullable", false);
        if (!nullable && value === null || !allowArray && ArrayIsArray(value) || typeof value !== "object" && (!allowFunction || typeof value !== "function")) {
          throw new ERR_INVALID_ARG_TYPE(name, "Object", value);
        }
      });
      var validateDictionary = hideStackFrames((value, name) => {
        if (value != null && typeof value !== "object" && typeof value !== "function") {
          throw new ERR_INVALID_ARG_TYPE(name, "a dictionary", value);
        }
      });
      var validateArray = hideStackFrames((value, name, minLength = 0) => {
        if (!ArrayIsArray(value)) {
          throw new ERR_INVALID_ARG_TYPE(name, "Array", value);
        }
        if (value.length < minLength) {
          const reason = `must be longer than ${minLength}`;
          throw new ERR_INVALID_ARG_VALUE(name, value, reason);
        }
      });
      function validateStringArray(value, name) {
        validateArray(value, name);
        for (let i = 0; i < value.length; i++) {
          validateString(value[i], `${name}[${i}]`);
        }
      }
      function validateBooleanArray(value, name) {
        validateArray(value, name);
        for (let i = 0; i < value.length; i++) {
          validateBoolean(value[i], `${name}[${i}]`);
        }
      }
      function validateAbortSignalArray(value, name) {
        validateArray(value, name);
        for (let i = 0; i < value.length; i++) {
          const signal = value[i];
          const indexedName = `${name}[${i}]`;
          if (signal == null) {
            throw new ERR_INVALID_ARG_TYPE(indexedName, "AbortSignal", signal);
          }
          validateAbortSignal(signal, indexedName);
        }
      }
      function validateSignalName(signal, name = "signal") {
        validateString(signal, name);
        if (signals[signal] === void 0) {
          if (signals[StringPrototypeToUpperCase(signal)] !== void 0) {
            throw new ERR_UNKNOWN_SIGNAL(signal + " (signals must use all capital letters)");
          }
          throw new ERR_UNKNOWN_SIGNAL(signal);
        }
      }
      var validateBuffer = hideStackFrames((buffer, name = "buffer") => {
        if (!isArrayBufferView(buffer)) {
          throw new ERR_INVALID_ARG_TYPE(name, ["Buffer", "TypedArray", "DataView"], buffer);
        }
      });
      function validateEncoding(data, encoding) {
        const normalizedEncoding = normalizeEncoding(encoding);
        const length = data.length;
        if (normalizedEncoding === "hex" && length % 2 !== 0) {
          throw new ERR_INVALID_ARG_VALUE("encoding", encoding, `is invalid for data of length ${length}`);
        }
      }
      function validatePort(port, name = "Port", allowZero = true) {
        if (typeof port !== "number" && typeof port !== "string" || typeof port === "string" && StringPrototypeTrim(port).length === 0 || +port !== +port >>> 0 || port > 65535 || port === 0 && !allowZero) {
          throw new ERR_SOCKET_BAD_PORT(name, port, allowZero);
        }
        return port | 0;
      }
      var validateAbortSignal = hideStackFrames((signal, name) => {
        if (signal !== void 0 && (signal === null || typeof signal !== "object" || !("aborted" in signal))) {
          throw new ERR_INVALID_ARG_TYPE(name, "AbortSignal", signal);
        }
      });
      var validateFunction = hideStackFrames((value, name) => {
        if (typeof value !== "function") throw new ERR_INVALID_ARG_TYPE(name, "Function", value);
      });
      var validatePlainFunction = hideStackFrames((value, name) => {
        if (typeof value !== "function" || isAsyncFunction(value)) throw new ERR_INVALID_ARG_TYPE(name, "Function", value);
      });
      var validateUndefined = hideStackFrames((value, name) => {
        if (value !== void 0) throw new ERR_INVALID_ARG_TYPE(name, "undefined", value);
      });
      function validateUnion(value, name, union) {
        if (!ArrayPrototypeIncludes(union, value)) {
          throw new ERR_INVALID_ARG_TYPE(name, `('${ArrayPrototypeJoin(union, "|")}')`, value);
        }
      }
      var linkValueRegExp = /^(?:<[^>]*>)(?:\s*;\s*[^;"\s]+(?:=(")?[^;"\s]*\1)?)*$/;
      function validateLinkHeaderFormat(value, name) {
        if (typeof value === "undefined" || !RegExpPrototypeExec(linkValueRegExp, value)) {
          throw new ERR_INVALID_ARG_VALUE(
            name,
            value,
            'must be an array or string of format "</styles.css>; rel=preload; as=style"'
          );
        }
      }
      function validateLinkHeaderValue(hints) {
        if (typeof hints === "string") {
          validateLinkHeaderFormat(hints, "hints");
          return hints;
        } else if (ArrayIsArray(hints)) {
          const hintsLength = hints.length;
          let result = "";
          if (hintsLength === 0) {
            return result;
          }
          for (let i = 0; i < hintsLength; i++) {
            const link3 = hints[i];
            validateLinkHeaderFormat(link3, "hints");
            result += link3;
            if (i !== hintsLength - 1) {
              result += ", ";
            }
          }
          return result;
        }
        throw new ERR_INVALID_ARG_VALUE(
          "hints",
          hints,
          'must be an array or string of format "</styles.css>; rel=preload; as=style"'
        );
      }
      module.exports = {
        isInt32,
        isUint32,
        parseFileMode,
        validateArray,
        validateStringArray,
        validateBooleanArray,
        validateAbortSignalArray,
        validateBoolean,
        validateBuffer,
        validateDictionary,
        validateEncoding,
        validateFunction,
        validateInt32,
        validateInteger,
        validateNumber,
        validateObject,
        validateOneOf,
        validatePlainFunction,
        validatePort,
        validateSignalName,
        validateString,
        validateUint32,
        validateUndefined,
        validateUnion,
        validateAbortSignal,
        validateLinkHeaderValue
      };
    }
  });

  // node_modules/process/browser.js
  var require_browser2 = __commonJS({
    "node_modules/process/browser.js"(exports, module) {
      "use strict";
      var process2 = module.exports = {};
      var cachedSetTimeout;
      var cachedClearTimeout;
      function defaultSetTimout() {
        throw new Error("setTimeout has not been defined");
      }
      function defaultClearTimeout() {
        throw new Error("clearTimeout has not been defined");
      }
      (function() {
        try {
          if (typeof setTimeout === "function") {
            cachedSetTimeout = setTimeout;
          } else {
            cachedSetTimeout = defaultSetTimout;
          }
        } catch (e) {
          cachedSetTimeout = defaultSetTimout;
        }
        try {
          if (typeof clearTimeout === "function") {
            cachedClearTimeout = clearTimeout;
          } else {
            cachedClearTimeout = defaultClearTimeout;
          }
        } catch (e) {
          cachedClearTimeout = defaultClearTimeout;
        }
      })();
      function runTimeout(fun) {
        if (cachedSetTimeout === setTimeout) {
          return setTimeout(fun, 0);
        }
        if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
          cachedSetTimeout = setTimeout;
          return setTimeout(fun, 0);
        }
        try {
          return cachedSetTimeout(fun, 0);
        } catch (e) {
          try {
            return cachedSetTimeout.call(null, fun, 0);
          } catch (e2) {
            return cachedSetTimeout.call(this, fun, 0);
          }
        }
      }
      function runClearTimeout(marker) {
        if (cachedClearTimeout === clearTimeout) {
          return clearTimeout(marker);
        }
        if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
          cachedClearTimeout = clearTimeout;
          return clearTimeout(marker);
        }
        try {
          return cachedClearTimeout(marker);
        } catch (e) {
          try {
            return cachedClearTimeout.call(null, marker);
          } catch (e2) {
            return cachedClearTimeout.call(this, marker);
          }
        }
      }
      var queue = [];
      var draining = false;
      var currentQueue;
      var queueIndex = -1;
      function cleanUpNextTick() {
        if (!draining || !currentQueue) {
          return;
        }
        draining = false;
        if (currentQueue.length) {
          queue = currentQueue.concat(queue);
        } else {
          queueIndex = -1;
        }
        if (queue.length) {
          drainQueue();
        }
      }
      function drainQueue() {
        if (draining) {
          return;
        }
        var timeout = runTimeout(cleanUpNextTick);
        draining = true;
        var len = queue.length;
        while (len) {
          currentQueue = queue;
          queue = [];
          while (++queueIndex < len) {
            if (currentQueue) {
              currentQueue[queueIndex].run();
            }
          }
          queueIndex = -1;
          len = queue.length;
        }
        currentQueue = null;
        draining = false;
        runClearTimeout(timeout);
      }
      process2.nextTick = function(fun) {
        var args = new Array(arguments.length - 1);
        if (arguments.length > 1) {
          for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
          }
        }
        queue.push(new Item(fun, args));
        if (queue.length === 1 && !draining) {
          runTimeout(drainQueue);
        }
      };
      function Item(fun, array) {
        this.fun = fun;
        this.array = array;
      }
      Item.prototype.run = function() {
        this.fun.apply(null, this.array);
      };
      process2.title = "browser";
      process2.browser = true;
      process2.env = {};
      process2.argv = [];
      process2.version = "";
      process2.versions = {};
      function noop() {
      }
      process2.on = noop;
      process2.addListener = noop;
      process2.once = noop;
      process2.off = noop;
      process2.removeListener = noop;
      process2.removeAllListeners = noop;
      process2.emit = noop;
      process2.prependListener = noop;
      process2.prependOnceListener = noop;
      process2.listeners = function(name) {
        return [];
      };
      process2.binding = function(name) {
        throw new Error("process.binding is not supported");
      };
      process2.cwd = function() {
        return "/";
      };
      process2.chdir = function(dir) {
        throw new Error("process.chdir is not supported");
      };
      process2.umask = function() {
        return 0;
      };
    }
  });

  // node_modules/readable-stream/lib/internal/streams/utils.js
  var require_utils = __commonJS({
    "node_modules/readable-stream/lib/internal/streams/utils.js"(exports, module) {
      "use strict";
      var { SymbolAsyncIterator, SymbolIterator, SymbolFor } = require_primordials();
      var kIsDestroyed = SymbolFor("nodejs.stream.destroyed");
      var kIsErrored = SymbolFor("nodejs.stream.errored");
      var kIsReadable = SymbolFor("nodejs.stream.readable");
      var kIsWritable = SymbolFor("nodejs.stream.writable");
      var kIsDisturbed = SymbolFor("nodejs.stream.disturbed");
      var kIsClosedPromise = SymbolFor("nodejs.webstream.isClosedPromise");
      var kControllerErrorFunction = SymbolFor("nodejs.webstream.controllerErrorFunction");
      function isReadableNodeStream(obj, strict = false) {
        var _obj$_readableState;
        return !!(obj && typeof obj.pipe === "function" && typeof obj.on === "function" && (!strict || typeof obj.pause === "function" && typeof obj.resume === "function") && (!obj._writableState || ((_obj$_readableState = obj._readableState) === null || _obj$_readableState === void 0 ? void 0 : _obj$_readableState.readable) !== false) && // Duplex
        (!obj._writableState || obj._readableState));
      }
      function isWritableNodeStream(obj) {
        var _obj$_writableState;
        return !!(obj && typeof obj.write === "function" && typeof obj.on === "function" && (!obj._readableState || ((_obj$_writableState = obj._writableState) === null || _obj$_writableState === void 0 ? void 0 : _obj$_writableState.writable) !== false));
      }
      function isDuplexNodeStream(obj) {
        return !!(obj && typeof obj.pipe === "function" && obj._readableState && typeof obj.on === "function" && typeof obj.write === "function");
      }
      function isNodeStream(obj) {
        return obj && (obj._readableState || obj._writableState || typeof obj.write === "function" && typeof obj.on === "function" || typeof obj.pipe === "function" && typeof obj.on === "function");
      }
      function isReadableStream(obj) {
        return !!(obj && !isNodeStream(obj) && typeof obj.pipeThrough === "function" && typeof obj.getReader === "function" && typeof obj.cancel === "function");
      }
      function isWritableStream(obj) {
        return !!(obj && !isNodeStream(obj) && typeof obj.getWriter === "function" && typeof obj.abort === "function");
      }
      function isTransformStream(obj) {
        return !!(obj && !isNodeStream(obj) && typeof obj.readable === "object" && typeof obj.writable === "object");
      }
      function isWebStream(obj) {
        return isReadableStream(obj) || isWritableStream(obj) || isTransformStream(obj);
      }
      function isIterable(obj, isAsync) {
        if (obj == null) return false;
        if (isAsync === true) return typeof obj[SymbolAsyncIterator] === "function";
        if (isAsync === false) return typeof obj[SymbolIterator] === "function";
        return typeof obj[SymbolAsyncIterator] === "function" || typeof obj[SymbolIterator] === "function";
      }
      function isDestroyed(stream) {
        if (!isNodeStream(stream)) return null;
        const wState = stream._writableState;
        const rState = stream._readableState;
        const state = wState || rState;
        return !!(stream.destroyed || stream[kIsDestroyed] || state !== null && state !== void 0 && state.destroyed);
      }
      function isWritableEnded(stream) {
        if (!isWritableNodeStream(stream)) return null;
        if (stream.writableEnded === true) return true;
        const wState = stream._writableState;
        if (wState !== null && wState !== void 0 && wState.errored) return false;
        if (typeof (wState === null || wState === void 0 ? void 0 : wState.ended) !== "boolean") return null;
        return wState.ended;
      }
      function isWritableFinished(stream, strict) {
        if (!isWritableNodeStream(stream)) return null;
        if (stream.writableFinished === true) return true;
        const wState = stream._writableState;
        if (wState !== null && wState !== void 0 && wState.errored) return false;
        if (typeof (wState === null || wState === void 0 ? void 0 : wState.finished) !== "boolean") return null;
        return !!(wState.finished || strict === false && wState.ended === true && wState.length === 0);
      }
      function isReadableEnded(stream) {
        if (!isReadableNodeStream(stream)) return null;
        if (stream.readableEnded === true) return true;
        const rState = stream._readableState;
        if (!rState || rState.errored) return false;
        if (typeof (rState === null || rState === void 0 ? void 0 : rState.ended) !== "boolean") return null;
        return rState.ended;
      }
      function isReadableFinished(stream, strict) {
        if (!isReadableNodeStream(stream)) return null;
        const rState = stream._readableState;
        if (rState !== null && rState !== void 0 && rState.errored) return false;
        if (typeof (rState === null || rState === void 0 ? void 0 : rState.endEmitted) !== "boolean") return null;
        return !!(rState.endEmitted || strict === false && rState.ended === true && rState.length === 0);
      }
      function isReadable(stream) {
        if (stream && stream[kIsReadable] != null) return stream[kIsReadable];
        if (typeof (stream === null || stream === void 0 ? void 0 : stream.readable) !== "boolean") return null;
        if (isDestroyed(stream)) return false;
        return isReadableNodeStream(stream) && stream.readable && !isReadableFinished(stream);
      }
      function isWritable(stream) {
        if (stream && stream[kIsWritable] != null) return stream[kIsWritable];
        if (typeof (stream === null || stream === void 0 ? void 0 : stream.writable) !== "boolean") return null;
        if (isDestroyed(stream)) return false;
        return isWritableNodeStream(stream) && stream.writable && !isWritableEnded(stream);
      }
      function isFinished(stream, opts) {
        if (!isNodeStream(stream)) {
          return null;
        }
        if (isDestroyed(stream)) {
          return true;
        }
        if ((opts === null || opts === void 0 ? void 0 : opts.readable) !== false && isReadable(stream)) {
          return false;
        }
        if ((opts === null || opts === void 0 ? void 0 : opts.writable) !== false && isWritable(stream)) {
          return false;
        }
        return true;
      }
      function isWritableErrored(stream) {
        var _stream$_writableStat, _stream$_writableStat2;
        if (!isNodeStream(stream)) {
          return null;
        }
        if (stream.writableErrored) {
          return stream.writableErrored;
        }
        return (_stream$_writableStat = (_stream$_writableStat2 = stream._writableState) === null || _stream$_writableStat2 === void 0 ? void 0 : _stream$_writableStat2.errored) !== null && _stream$_writableStat !== void 0 ? _stream$_writableStat : null;
      }
      function isReadableErrored(stream) {
        var _stream$_readableStat, _stream$_readableStat2;
        if (!isNodeStream(stream)) {
          return null;
        }
        if (stream.readableErrored) {
          return stream.readableErrored;
        }
        return (_stream$_readableStat = (_stream$_readableStat2 = stream._readableState) === null || _stream$_readableStat2 === void 0 ? void 0 : _stream$_readableStat2.errored) !== null && _stream$_readableStat !== void 0 ? _stream$_readableStat : null;
      }
      function isClosed(stream) {
        if (!isNodeStream(stream)) {
          return null;
        }
        if (typeof stream.closed === "boolean") {
          return stream.closed;
        }
        const wState = stream._writableState;
        const rState = stream._readableState;
        if (typeof (wState === null || wState === void 0 ? void 0 : wState.closed) === "boolean" || typeof (rState === null || rState === void 0 ? void 0 : rState.closed) === "boolean") {
          return (wState === null || wState === void 0 ? void 0 : wState.closed) || (rState === null || rState === void 0 ? void 0 : rState.closed);
        }
        if (typeof stream._closed === "boolean" && isOutgoingMessage(stream)) {
          return stream._closed;
        }
        return null;
      }
      function isOutgoingMessage(stream) {
        return typeof stream._closed === "boolean" && typeof stream._defaultKeepAlive === "boolean" && typeof stream._removedConnection === "boolean" && typeof stream._removedContLen === "boolean";
      }
      function isServerResponse(stream) {
        return typeof stream._sent100 === "boolean" && isOutgoingMessage(stream);
      }
      function isServerRequest(stream) {
        var _stream$req;
        return typeof stream._consuming === "boolean" && typeof stream._dumped === "boolean" && ((_stream$req = stream.req) === null || _stream$req === void 0 ? void 0 : _stream$req.upgradeOrConnect) === void 0;
      }
      function willEmitClose(stream) {
        if (!isNodeStream(stream)) return null;
        const wState = stream._writableState;
        const rState = stream._readableState;
        const state = wState || rState;
        return !state && isServerResponse(stream) || !!(state && state.autoDestroy && state.emitClose && state.closed === false);
      }
      function isDisturbed(stream) {
        var _stream$kIsDisturbed;
        return !!(stream && ((_stream$kIsDisturbed = stream[kIsDisturbed]) !== null && _stream$kIsDisturbed !== void 0 ? _stream$kIsDisturbed : stream.readableDidRead || stream.readableAborted));
      }
      function isErrored(stream) {
        var _ref, _ref2, _ref3, _ref4, _ref5, _stream$kIsErrored, _stream$_readableStat3, _stream$_writableStat3, _stream$_readableStat4, _stream$_writableStat4;
        return !!(stream && ((_ref = (_ref2 = (_ref3 = (_ref4 = (_ref5 = (_stream$kIsErrored = stream[kIsErrored]) !== null && _stream$kIsErrored !== void 0 ? _stream$kIsErrored : stream.readableErrored) !== null && _ref5 !== void 0 ? _ref5 : stream.writableErrored) !== null && _ref4 !== void 0 ? _ref4 : (_stream$_readableStat3 = stream._readableState) === null || _stream$_readableStat3 === void 0 ? void 0 : _stream$_readableStat3.errorEmitted) !== null && _ref3 !== void 0 ? _ref3 : (_stream$_writableStat3 = stream._writableState) === null || _stream$_writableStat3 === void 0 ? void 0 : _stream$_writableStat3.errorEmitted) !== null && _ref2 !== void 0 ? _ref2 : (_stream$_readableStat4 = stream._readableState) === null || _stream$_readableStat4 === void 0 ? void 0 : _stream$_readableStat4.errored) !== null && _ref !== void 0 ? _ref : (_stream$_writableStat4 = stream._writableState) === null || _stream$_writableStat4 === void 0 ? void 0 : _stream$_writableStat4.errored));
      }
      module.exports = {
        isDestroyed,
        kIsDestroyed,
        isDisturbed,
        kIsDisturbed,
        isErrored,
        kIsErrored,
        isReadable,
        kIsReadable,
        kIsClosedPromise,
        kControllerErrorFunction,
        kIsWritable,
        isClosed,
        isDuplexNodeStream,
        isFinished,
        isIterable,
        isReadableNodeStream,
        isReadableStream,
        isReadableEnded,
        isReadableFinished,
        isReadableErrored,
        isNodeStream,
        isWebStream,
        isWritable,
        isWritableNodeStream,
        isWritableStream,
        isWritableEnded,
        isWritableFinished,
        isWritableErrored,
        isServerRequest,
        isServerResponse,
        willEmitClose,
        isTransformStream
      };
    }
  });

  // node_modules/readable-stream/lib/internal/streams/end-of-stream.js
  var require_end_of_stream = __commonJS({
    "node_modules/readable-stream/lib/internal/streams/end-of-stream.js"(exports, module) {
      "use strict";
      var process2 = require_browser2();
      var { AbortError, codes } = require_errors();
      var { ERR_INVALID_ARG_TYPE, ERR_STREAM_PREMATURE_CLOSE } = codes;
      var { kEmptyObject, once } = require_util();
      var { validateAbortSignal, validateFunction, validateObject, validateBoolean } = require_validators();
      var { Promise: Promise2, PromisePrototypeThen, SymbolDispose } = require_primordials();
      var {
        isClosed,
        isReadable,
        isReadableNodeStream,
        isReadableStream,
        isReadableFinished,
        isReadableErrored,
        isWritable,
        isWritableNodeStream,
        isWritableStream,
        isWritableFinished,
        isWritableErrored,
        isNodeStream,
        willEmitClose: _willEmitClose,
        kIsClosedPromise
      } = require_utils();
      var addAbortListener;
      function isRequest(stream) {
        return stream.setHeader && typeof stream.abort === "function";
      }
      var nop2 = () => {
      };
      function eos(stream, options, callback) {
        var _options$readable, _options$writable;
        if (arguments.length === 2) {
          callback = options;
          options = kEmptyObject;
        } else if (options == null) {
          options = kEmptyObject;
        } else {
          validateObject(options, "options");
        }
        validateFunction(callback, "callback");
        validateAbortSignal(options.signal, "options.signal");
        callback = once(callback);
        if (isReadableStream(stream) || isWritableStream(stream)) {
          return eosWeb(stream, options, callback);
        }
        if (!isNodeStream(stream)) {
          throw new ERR_INVALID_ARG_TYPE("stream", ["ReadableStream", "WritableStream", "Stream"], stream);
        }
        const readable = (_options$readable = options.readable) !== null && _options$readable !== void 0 ? _options$readable : isReadableNodeStream(stream);
        const writable = (_options$writable = options.writable) !== null && _options$writable !== void 0 ? _options$writable : isWritableNodeStream(stream);
        const wState = stream._writableState;
        const rState = stream._readableState;
        const onlegacyfinish = () => {
          if (!stream.writable) {
            onfinish();
          }
        };
        let willEmitClose = _willEmitClose(stream) && isReadableNodeStream(stream) === readable && isWritableNodeStream(stream) === writable;
        let writableFinished = isWritableFinished(stream, false);
        const onfinish = () => {
          writableFinished = true;
          if (stream.destroyed) {
            willEmitClose = false;
          }
          if (willEmitClose && (!stream.readable || readable)) {
            return;
          }
          if (!readable || readableFinished) {
            callback.call(stream);
          }
        };
        let readableFinished = isReadableFinished(stream, false);
        const onend = () => {
          readableFinished = true;
          if (stream.destroyed) {
            willEmitClose = false;
          }
          if (willEmitClose && (!stream.writable || writable)) {
            return;
          }
          if (!writable || writableFinished) {
            callback.call(stream);
          }
        };
        const onerror = (err2) => {
          callback.call(stream, err2);
        };
        let closed = isClosed(stream);
        const onclose = () => {
          closed = true;
          const errored = isWritableErrored(stream) || isReadableErrored(stream);
          if (errored && typeof errored !== "boolean") {
            return callback.call(stream, errored);
          }
          if (readable && !readableFinished && isReadableNodeStream(stream, true)) {
            if (!isReadableFinished(stream, false)) return callback.call(stream, new ERR_STREAM_PREMATURE_CLOSE());
          }
          if (writable && !writableFinished) {
            if (!isWritableFinished(stream, false)) return callback.call(stream, new ERR_STREAM_PREMATURE_CLOSE());
          }
          callback.call(stream);
        };
        const onclosed = () => {
          closed = true;
          const errored = isWritableErrored(stream) || isReadableErrored(stream);
          if (errored && typeof errored !== "boolean") {
            return callback.call(stream, errored);
          }
          callback.call(stream);
        };
        const onrequest = () => {
          stream.req.on("finish", onfinish);
        };
        if (isRequest(stream)) {
          stream.on("complete", onfinish);
          if (!willEmitClose) {
            stream.on("abort", onclose);
          }
          if (stream.req) {
            onrequest();
          } else {
            stream.on("request", onrequest);
          }
        } else if (writable && !wState) {
          stream.on("end", onlegacyfinish);
          stream.on("close", onlegacyfinish);
        }
        if (!willEmitClose && typeof stream.aborted === "boolean") {
          stream.on("aborted", onclose);
        }
        stream.on("end", onend);
        stream.on("finish", onfinish);
        if (options.error !== false) {
          stream.on("error", onerror);
        }
        stream.on("close", onclose);
        if (closed) {
          process2.nextTick(onclose);
        } else if (wState !== null && wState !== void 0 && wState.errorEmitted || rState !== null && rState !== void 0 && rState.errorEmitted) {
          if (!willEmitClose) {
            process2.nextTick(onclosed);
          }
        } else if (!readable && (!willEmitClose || isReadable(stream)) && (writableFinished || isWritable(stream) === false)) {
          process2.nextTick(onclosed);
        } else if (!writable && (!willEmitClose || isWritable(stream)) && (readableFinished || isReadable(stream) === false)) {
          process2.nextTick(onclosed);
        } else if (rState && stream.req && stream.aborted) {
          process2.nextTick(onclosed);
        }
        const cleanup = () => {
          callback = nop2;
          stream.removeListener("aborted", onclose);
          stream.removeListener("complete", onfinish);
          stream.removeListener("abort", onclose);
          stream.removeListener("request", onrequest);
          if (stream.req) stream.req.removeListener("finish", onfinish);
          stream.removeListener("end", onlegacyfinish);
          stream.removeListener("close", onlegacyfinish);
          stream.removeListener("finish", onfinish);
          stream.removeListener("end", onend);
          stream.removeListener("error", onerror);
          stream.removeListener("close", onclose);
        };
        if (options.signal && !closed) {
          const abort = () => {
            const endCallback = callback;
            cleanup();
            endCallback.call(
              stream,
              new AbortError(void 0, {
                cause: options.signal.reason
              })
            );
          };
          if (options.signal.aborted) {
            process2.nextTick(abort);
          } else {
            addAbortListener = addAbortListener || require_util().addAbortListener;
            const disposable = addAbortListener(options.signal, abort);
            const originalCallback = callback;
            callback = once((...args) => {
              disposable[SymbolDispose]();
              originalCallback.apply(stream, args);
            });
          }
        }
        return cleanup;
      }
      function eosWeb(stream, options, callback) {
        let isAborted = false;
        let abort = nop2;
        if (options.signal) {
          abort = () => {
            isAborted = true;
            callback.call(
              stream,
              new AbortError(void 0, {
                cause: options.signal.reason
              })
            );
          };
          if (options.signal.aborted) {
            process2.nextTick(abort);
          } else {
            addAbortListener = addAbortListener || require_util().addAbortListener;
            const disposable = addAbortListener(options.signal, abort);
            const originalCallback = callback;
            callback = once((...args) => {
              disposable[SymbolDispose]();
              originalCallback.apply(stream, args);
            });
          }
        }
        const resolverFn = (...args) => {
          if (!isAborted) {
            process2.nextTick(() => callback.apply(stream, args));
          }
        };
        PromisePrototypeThen(stream[kIsClosedPromise].promise, resolverFn, resolverFn);
        return nop2;
      }
      function finished(stream, opts) {
        var _opts;
        let autoCleanup = false;
        if (opts === null) {
          opts = kEmptyObject;
        }
        if ((_opts = opts) !== null && _opts !== void 0 && _opts.cleanup) {
          validateBoolean(opts.cleanup, "cleanup");
          autoCleanup = opts.cleanup;
        }
        return new Promise2((resolve2, reject) => {
          const cleanup = eos(stream, opts, (err2) => {
            if (autoCleanup) {
              cleanup();
            }
            if (err2) {
              reject(err2);
            } else {
              resolve2();
            }
          });
        });
      }
      module.exports = eos;
      module.exports.finished = finished;
    }
  });

  // node_modules/readable-stream/lib/internal/streams/destroy.js
  var require_destroy = __commonJS({
    "node_modules/readable-stream/lib/internal/streams/destroy.js"(exports, module) {
      "use strict";
      var process2 = require_browser2();
      var {
        aggregateTwoErrors,
        codes: { ERR_MULTIPLE_CALLBACK },
        AbortError
      } = require_errors();
      var { Symbol: Symbol2 } = require_primordials();
      var { kIsDestroyed, isDestroyed, isFinished, isServerRequest } = require_utils();
      var kDestroy = Symbol2("kDestroy");
      var kConstruct = Symbol2("kConstruct");
      function checkError(err2, w, r) {
        if (err2) {
          err2.stack;
          if (w && !w.errored) {
            w.errored = err2;
          }
          if (r && !r.errored) {
            r.errored = err2;
          }
        }
      }
      function destroy(err2, cb) {
        const r = this._readableState;
        const w = this._writableState;
        const s = w || r;
        if (w !== null && w !== void 0 && w.destroyed || r !== null && r !== void 0 && r.destroyed) {
          if (typeof cb === "function") {
            cb();
          }
          return this;
        }
        checkError(err2, w, r);
        if (w) {
          w.destroyed = true;
        }
        if (r) {
          r.destroyed = true;
        }
        if (!s.constructed) {
          this.once(kDestroy, function(er) {
            _destroy(this, aggregateTwoErrors(er, err2), cb);
          });
        } else {
          _destroy(this, err2, cb);
        }
        return this;
      }
      function _destroy(self2, err2, cb) {
        let called = false;
        function onDestroy(err3) {
          if (called) {
            return;
          }
          called = true;
          const r = self2._readableState;
          const w = self2._writableState;
          checkError(err3, w, r);
          if (w) {
            w.closed = true;
          }
          if (r) {
            r.closed = true;
          }
          if (typeof cb === "function") {
            cb(err3);
          }
          if (err3) {
            process2.nextTick(emitErrorCloseNT, self2, err3);
          } else {
            process2.nextTick(emitCloseNT, self2);
          }
        }
        try {
          self2._destroy(err2 || null, onDestroy);
        } catch (err3) {
          onDestroy(err3);
        }
      }
      function emitErrorCloseNT(self2, err2) {
        emitErrorNT(self2, err2);
        emitCloseNT(self2);
      }
      function emitCloseNT(self2) {
        const r = self2._readableState;
        const w = self2._writableState;
        if (w) {
          w.closeEmitted = true;
        }
        if (r) {
          r.closeEmitted = true;
        }
        if (w !== null && w !== void 0 && w.emitClose || r !== null && r !== void 0 && r.emitClose) {
          self2.emit("close");
        }
      }
      function emitErrorNT(self2, err2) {
        const r = self2._readableState;
        const w = self2._writableState;
        if (w !== null && w !== void 0 && w.errorEmitted || r !== null && r !== void 0 && r.errorEmitted) {
          return;
        }
        if (w) {
          w.errorEmitted = true;
        }
        if (r) {
          r.errorEmitted = true;
        }
        self2.emit("error", err2);
      }
      function undestroy() {
        const r = this._readableState;
        const w = this._writableState;
        if (r) {
          r.constructed = true;
          r.closed = false;
          r.closeEmitted = false;
          r.destroyed = false;
          r.errored = null;
          r.errorEmitted = false;
          r.reading = false;
          r.ended = r.readable === false;
          r.endEmitted = r.readable === false;
        }
        if (w) {
          w.constructed = true;
          w.destroyed = false;
          w.closed = false;
          w.closeEmitted = false;
          w.errored = null;
          w.errorEmitted = false;
          w.finalCalled = false;
          w.prefinished = false;
          w.ended = w.writable === false;
          w.ending = w.writable === false;
          w.finished = w.writable === false;
        }
      }
      function errorOrDestroy(stream, err2, sync) {
        const r = stream._readableState;
        const w = stream._writableState;
        if (w !== null && w !== void 0 && w.destroyed || r !== null && r !== void 0 && r.destroyed) {
          return this;
        }
        if (r !== null && r !== void 0 && r.autoDestroy || w !== null && w !== void 0 && w.autoDestroy)
          stream.destroy(err2);
        else if (err2) {
          err2.stack;
          if (w && !w.errored) {
            w.errored = err2;
          }
          if (r && !r.errored) {
            r.errored = err2;
          }
          if (sync) {
            process2.nextTick(emitErrorNT, stream, err2);
          } else {
            emitErrorNT(stream, err2);
          }
        }
      }
      function construct(stream, cb) {
        if (typeof stream._construct !== "function") {
          return;
        }
        const r = stream._readableState;
        const w = stream._writableState;
        if (r) {
          r.constructed = false;
        }
        if (w) {
          w.constructed = false;
        }
        stream.once(kConstruct, cb);
        if (stream.listenerCount(kConstruct) > 1) {
          return;
        }
        process2.nextTick(constructNT, stream);
      }
      function constructNT(stream) {
        let called = false;
        function onConstruct(err2) {
          if (called) {
            errorOrDestroy(stream, err2 !== null && err2 !== void 0 ? err2 : new ERR_MULTIPLE_CALLBACK());
            return;
          }
          called = true;
          const r = stream._readableState;
          const w = stream._writableState;
          const s = w || r;
          if (r) {
            r.constructed = true;
          }
          if (w) {
            w.constructed = true;
          }
          if (s.destroyed) {
            stream.emit(kDestroy, err2);
          } else if (err2) {
            errorOrDestroy(stream, err2, true);
          } else {
            process2.nextTick(emitConstructNT, stream);
          }
        }
        try {
          stream._construct((err2) => {
            process2.nextTick(onConstruct, err2);
          });
        } catch (err2) {
          process2.nextTick(onConstruct, err2);
        }
      }
      function emitConstructNT(stream) {
        stream.emit(kConstruct);
      }
      function isRequest(stream) {
        return (stream === null || stream === void 0 ? void 0 : stream.setHeader) && typeof stream.abort === "function";
      }
      function emitCloseLegacy(stream) {
        stream.emit("close");
      }
      function emitErrorCloseLegacy(stream, err2) {
        stream.emit("error", err2);
        process2.nextTick(emitCloseLegacy, stream);
      }
      function destroyer(stream, err2) {
        if (!stream || isDestroyed(stream)) {
          return;
        }
        if (!err2 && !isFinished(stream)) {
          err2 = new AbortError();
        }
        if (isServerRequest(stream)) {
          stream.socket = null;
          stream.destroy(err2);
        } else if (isRequest(stream)) {
          stream.abort();
        } else if (isRequest(stream.req)) {
          stream.req.abort();
        } else if (typeof stream.destroy === "function") {
          stream.destroy(err2);
        } else if (typeof stream.close === "function") {
          stream.close();
        } else if (err2) {
          process2.nextTick(emitErrorCloseLegacy, stream, err2);
        } else {
          process2.nextTick(emitCloseLegacy, stream);
        }
        if (!stream.destroyed) {
          stream[kIsDestroyed] = true;
        }
      }
      module.exports = {
        construct,
        destroyer,
        destroy,
        undestroy,
        errorOrDestroy
      };
    }
  });

  // node_modules/readable-stream/lib/internal/streams/legacy.js
  var require_legacy = __commonJS({
    "node_modules/readable-stream/lib/internal/streams/legacy.js"(exports, module) {
      "use strict";
      var { ArrayIsArray, ObjectSetPrototypeOf } = require_primordials();
      var { EventEmitter: EE } = require_events();
      function Stream(opts) {
        EE.call(this, opts);
      }
      ObjectSetPrototypeOf(Stream.prototype, EE.prototype);
      ObjectSetPrototypeOf(Stream, EE);
      Stream.prototype.pipe = function(dest, options) {
        const source = this;
        function ondata(chunk) {
          if (dest.writable && dest.write(chunk) === false && source.pause) {
            source.pause();
          }
        }
        source.on("data", ondata);
        function ondrain() {
          if (source.readable && source.resume) {
            source.resume();
          }
        }
        dest.on("drain", ondrain);
        if (!dest._isStdio && (!options || options.end !== false)) {
          source.on("end", onend);
          source.on("close", onclose);
        }
        let didOnEnd = false;
        function onend() {
          if (didOnEnd) return;
          didOnEnd = true;
          dest.end();
        }
        function onclose() {
          if (didOnEnd) return;
          didOnEnd = true;
          if (typeof dest.destroy === "function") dest.destroy();
        }
        function onerror(er) {
          cleanup();
          if (EE.listenerCount(this, "error") === 0) {
            this.emit("error", er);
          }
        }
        prependListener(source, "error", onerror);
        prependListener(dest, "error", onerror);
        function cleanup() {
          source.removeListener("data", ondata);
          dest.removeListener("drain", ondrain);
          source.removeListener("end", onend);
          source.removeListener("close", onclose);
          source.removeListener("error", onerror);
          dest.removeListener("error", onerror);
          source.removeListener("end", cleanup);
          source.removeListener("close", cleanup);
          dest.removeListener("close", cleanup);
        }
        source.on("end", cleanup);
        source.on("close", cleanup);
        dest.on("close", cleanup);
        dest.emit("pipe", source);
        return dest;
      };
      function prependListener(emitter, event, fn) {
        if (typeof emitter.prependListener === "function") return emitter.prependListener(event, fn);
        if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);
        else if (ArrayIsArray(emitter._events[event])) emitter._events[event].unshift(fn);
        else emitter._events[event] = [fn, emitter._events[event]];
      }
      module.exports = {
        Stream,
        prependListener
      };
    }
  });

  // node_modules/readable-stream/lib/internal/streams/add-abort-signal.js
  var require_add_abort_signal = __commonJS({
    "node_modules/readable-stream/lib/internal/streams/add-abort-signal.js"(exports, module) {
      "use strict";
      var { SymbolDispose } = require_primordials();
      var { AbortError, codes } = require_errors();
      var { isNodeStream, isWebStream, kControllerErrorFunction } = require_utils();
      var eos = require_end_of_stream();
      var { ERR_INVALID_ARG_TYPE } = codes;
      var addAbortListener;
      var validateAbortSignal = (signal, name) => {
        if (typeof signal !== "object" || !("aborted" in signal)) {
          throw new ERR_INVALID_ARG_TYPE(name, "AbortSignal", signal);
        }
      };
      module.exports.addAbortSignal = function addAbortSignal(signal, stream) {
        validateAbortSignal(signal, "signal");
        if (!isNodeStream(stream) && !isWebStream(stream)) {
          throw new ERR_INVALID_ARG_TYPE("stream", ["ReadableStream", "WritableStream", "Stream"], stream);
        }
        return module.exports.addAbortSignalNoValidate(signal, stream);
      };
      module.exports.addAbortSignalNoValidate = function(signal, stream) {
        if (typeof signal !== "object" || !("aborted" in signal)) {
          return stream;
        }
        const onAbort = isNodeStream(stream) ? () => {
          stream.destroy(
            new AbortError(void 0, {
              cause: signal.reason
            })
          );
        } : () => {
          stream[kControllerErrorFunction](
            new AbortError(void 0, {
              cause: signal.reason
            })
          );
        };
        if (signal.aborted) {
          onAbort();
        } else {
          addAbortListener = addAbortListener || require_util().addAbortListener;
          const disposable = addAbortListener(signal, onAbort);
          eos(stream, disposable[SymbolDispose]);
        }
        return stream;
      };
    }
  });

  // node_modules/readable-stream/lib/internal/streams/buffer_list.js
  var require_buffer_list = __commonJS({
    "node_modules/readable-stream/lib/internal/streams/buffer_list.js"(exports, module) {
      "use strict";
      var { StringPrototypeSlice, SymbolIterator, TypedArrayPrototypeSet, Uint8Array: Uint8Array2 } = require_primordials();
      var { Buffer: Buffer7 } = require_buffer();
      var { inspect } = require_util();
      module.exports = class BufferList {
        constructor() {
          this.head = null;
          this.tail = null;
          this.length = 0;
        }
        push(v) {
          const entry = {
            data: v,
            next: null
          };
          if (this.length > 0) this.tail.next = entry;
          else this.head = entry;
          this.tail = entry;
          ++this.length;
        }
        unshift(v) {
          const entry = {
            data: v,
            next: this.head
          };
          if (this.length === 0) this.tail = entry;
          this.head = entry;
          ++this.length;
        }
        shift() {
          if (this.length === 0) return;
          const ret = this.head.data;
          if (this.length === 1) this.head = this.tail = null;
          else this.head = this.head.next;
          --this.length;
          return ret;
        }
        clear() {
          this.head = this.tail = null;
          this.length = 0;
        }
        join(s) {
          if (this.length === 0) return "";
          let p = this.head;
          let ret = "" + p.data;
          while ((p = p.next) !== null) ret += s + p.data;
          return ret;
        }
        concat(n) {
          if (this.length === 0) return Buffer7.alloc(0);
          const ret = Buffer7.allocUnsafe(n >>> 0);
          let p = this.head;
          let i = 0;
          while (p) {
            TypedArrayPrototypeSet(ret, p.data, i);
            i += p.data.length;
            p = p.next;
          }
          return ret;
        }
        // Consumes a specified amount of bytes or characters from the buffered data.
        consume(n, hasStrings) {
          const data = this.head.data;
          if (n < data.length) {
            const slice = data.slice(0, n);
            this.head.data = data.slice(n);
            return slice;
          }
          if (n === data.length) {
            return this.shift();
          }
          return hasStrings ? this._getString(n) : this._getBuffer(n);
        }
        first() {
          return this.head.data;
        }
        *[SymbolIterator]() {
          for (let p = this.head; p; p = p.next) {
            yield p.data;
          }
        }
        // Consumes a specified amount of characters from the buffered data.
        _getString(n) {
          let ret = "";
          let p = this.head;
          let c = 0;
          do {
            const str = p.data;
            if (n > str.length) {
              ret += str;
              n -= str.length;
            } else {
              if (n === str.length) {
                ret += str;
                ++c;
                if (p.next) this.head = p.next;
                else this.head = this.tail = null;
              } else {
                ret += StringPrototypeSlice(str, 0, n);
                this.head = p;
                p.data = StringPrototypeSlice(str, n);
              }
              break;
            }
            ++c;
          } while ((p = p.next) !== null);
          this.length -= c;
          return ret;
        }
        // Consumes a specified amount of bytes from the buffered data.
        _getBuffer(n) {
          const ret = Buffer7.allocUnsafe(n);
          const retLen = n;
          let p = this.head;
          let c = 0;
          do {
            const buf = p.data;
            if (n > buf.length) {
              TypedArrayPrototypeSet(ret, buf, retLen - n);
              n -= buf.length;
            } else {
              if (n === buf.length) {
                TypedArrayPrototypeSet(ret, buf, retLen - n);
                ++c;
                if (p.next) this.head = p.next;
                else this.head = this.tail = null;
              } else {
                TypedArrayPrototypeSet(ret, new Uint8Array2(buf.buffer, buf.byteOffset, n), retLen - n);
                this.head = p;
                p.data = buf.slice(n);
              }
              break;
            }
            ++c;
          } while ((p = p.next) !== null);
          this.length -= c;
          return ret;
        }
        // Make sure the linked list only shows the minimal necessary information.
        [Symbol.for("nodejs.util.inspect.custom")](_, options) {
          return inspect(this, {
            ...options,
            // Only inspect one level.
            depth: 0,
            // It should not recurse.
            customInspect: false
          });
        }
      };
    }
  });

  // node_modules/readable-stream/lib/internal/streams/state.js
  var require_state = __commonJS({
    "node_modules/readable-stream/lib/internal/streams/state.js"(exports, module) {
      "use strict";
      var { MathFloor, NumberIsInteger } = require_primordials();
      var { validateInteger } = require_validators();
      var { ERR_INVALID_ARG_VALUE } = require_errors().codes;
      var defaultHighWaterMarkBytes = 16 * 1024;
      var defaultHighWaterMarkObjectMode = 16;
      function highWaterMarkFrom(options, isDuplex, duplexKey) {
        return options.highWaterMark != null ? options.highWaterMark : isDuplex ? options[duplexKey] : null;
      }
      function getDefaultHighWaterMark(objectMode) {
        return objectMode ? defaultHighWaterMarkObjectMode : defaultHighWaterMarkBytes;
      }
      function setDefaultHighWaterMark(objectMode, value) {
        validateInteger(value, "value", 0);
        if (objectMode) {
          defaultHighWaterMarkObjectMode = value;
        } else {
          defaultHighWaterMarkBytes = value;
        }
      }
      function getHighWaterMark(state, options, duplexKey, isDuplex) {
        const hwm = highWaterMarkFrom(options, isDuplex, duplexKey);
        if (hwm != null) {
          if (!NumberIsInteger(hwm) || hwm < 0) {
            const name = isDuplex ? `options.${duplexKey}` : "options.highWaterMark";
            throw new ERR_INVALID_ARG_VALUE(name, hwm);
          }
          return MathFloor(hwm);
        }
        return getDefaultHighWaterMark(state.objectMode);
      }
      module.exports = {
        getHighWaterMark,
        getDefaultHighWaterMark,
        setDefaultHighWaterMark
      };
    }
  });

  // node_modules/safe-buffer/index.js
  var require_safe_buffer = __commonJS({
    "node_modules/safe-buffer/index.js"(exports, module) {
      "use strict";
      var buffer = require_buffer();
      var Buffer7 = buffer.Buffer;
      function copyProps(src, dst) {
        for (var key in src) {
          dst[key] = src[key];
        }
      }
      if (Buffer7.from && Buffer7.alloc && Buffer7.allocUnsafe && Buffer7.allocUnsafeSlow) {
        module.exports = buffer;
      } else {
        copyProps(buffer, exports);
        exports.Buffer = SafeBuffer;
      }
      function SafeBuffer(arg, encodingOrOffset, length) {
        return Buffer7(arg, encodingOrOffset, length);
      }
      SafeBuffer.prototype = Object.create(Buffer7.prototype);
      copyProps(Buffer7, SafeBuffer);
      SafeBuffer.from = function(arg, encodingOrOffset, length) {
        if (typeof arg === "number") {
          throw new TypeError("Argument must not be a number");
        }
        return Buffer7(arg, encodingOrOffset, length);
      };
      SafeBuffer.alloc = function(size, fill, encoding) {
        if (typeof size !== "number") {
          throw new TypeError("Argument must be a number");
        }
        var buf = Buffer7(size);
        if (fill !== void 0) {
          if (typeof encoding === "string") {
            buf.fill(fill, encoding);
          } else {
            buf.fill(fill);
          }
        } else {
          buf.fill(0);
        }
        return buf;
      };
      SafeBuffer.allocUnsafe = function(size) {
        if (typeof size !== "number") {
          throw new TypeError("Argument must be a number");
        }
        return Buffer7(size);
      };
      SafeBuffer.allocUnsafeSlow = function(size) {
        if (typeof size !== "number") {
          throw new TypeError("Argument must be a number");
        }
        return buffer.SlowBuffer(size);
      };
    }
  });

  // node_modules/string_decoder/lib/string_decoder.js
  var require_string_decoder = __commonJS({
    "node_modules/string_decoder/lib/string_decoder.js"(exports) {
      "use strict";
      var Buffer7 = require_safe_buffer().Buffer;
      var isEncoding = Buffer7.isEncoding || function(encoding) {
        encoding = "" + encoding;
        switch (encoding && encoding.toLowerCase()) {
          case "hex":
          case "utf8":
          case "utf-8":
          case "ascii":
          case "binary":
          case "base64":
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
          case "raw":
            return true;
          default:
            return false;
        }
      };
      function _normalizeEncoding(enc) {
        if (!enc) return "utf8";
        var retried;
        while (true) {
          switch (enc) {
            case "utf8":
            case "utf-8":
              return "utf8";
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              return "utf16le";
            case "latin1":
            case "binary":
              return "latin1";
            case "base64":
            case "ascii":
            case "hex":
              return enc;
            default:
              if (retried) return;
              enc = ("" + enc).toLowerCase();
              retried = true;
          }
        }
      }
      function normalizeEncoding(enc) {
        var nenc = _normalizeEncoding(enc);
        if (typeof nenc !== "string" && (Buffer7.isEncoding === isEncoding || !isEncoding(enc))) throw new Error("Unknown encoding: " + enc);
        return nenc || enc;
      }
      exports.StringDecoder = StringDecoder;
      function StringDecoder(encoding) {
        this.encoding = normalizeEncoding(encoding);
        var nb;
        switch (this.encoding) {
          case "utf16le":
            this.text = utf16Text;
            this.end = utf16End;
            nb = 4;
            break;
          case "utf8":
            this.fillLast = utf8FillLast;
            nb = 4;
            break;
          case "base64":
            this.text = base64Text;
            this.end = base64End;
            nb = 3;
            break;
          default:
            this.write = simpleWrite;
            this.end = simpleEnd;
            return;
        }
        this.lastNeed = 0;
        this.lastTotal = 0;
        this.lastChar = Buffer7.allocUnsafe(nb);
      }
      StringDecoder.prototype.write = function(buf) {
        if (buf.length === 0) return "";
        var r;
        var i;
        if (this.lastNeed) {
          r = this.fillLast(buf);
          if (r === void 0) return "";
          i = this.lastNeed;
          this.lastNeed = 0;
        } else {
          i = 0;
        }
        if (i < buf.length) return r ? r + this.text(buf, i) : this.text(buf, i);
        return r || "";
      };
      StringDecoder.prototype.end = utf8End;
      StringDecoder.prototype.text = utf8Text;
      StringDecoder.prototype.fillLast = function(buf) {
        if (this.lastNeed <= buf.length) {
          buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
          return this.lastChar.toString(this.encoding, 0, this.lastTotal);
        }
        buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
        this.lastNeed -= buf.length;
      };
      function utf8CheckByte(byte) {
        if (byte <= 127) return 0;
        else if (byte >> 5 === 6) return 2;
        else if (byte >> 4 === 14) return 3;
        else if (byte >> 3 === 30) return 4;
        return byte >> 6 === 2 ? -1 : -2;
      }
      function utf8CheckIncomplete(self2, buf, i) {
        var j = buf.length - 1;
        if (j < i) return 0;
        var nb = utf8CheckByte(buf[j]);
        if (nb >= 0) {
          if (nb > 0) self2.lastNeed = nb - 1;
          return nb;
        }
        if (--j < i || nb === -2) return 0;
        nb = utf8CheckByte(buf[j]);
        if (nb >= 0) {
          if (nb > 0) self2.lastNeed = nb - 2;
          return nb;
        }
        if (--j < i || nb === -2) return 0;
        nb = utf8CheckByte(buf[j]);
        if (nb >= 0) {
          if (nb > 0) {
            if (nb === 2) nb = 0;
            else self2.lastNeed = nb - 3;
          }
          return nb;
        }
        return 0;
      }
      function utf8CheckExtraBytes(self2, buf, p) {
        if ((buf[0] & 192) !== 128) {
          self2.lastNeed = 0;
          return "\uFFFD";
        }
        if (self2.lastNeed > 1 && buf.length > 1) {
          if ((buf[1] & 192) !== 128) {
            self2.lastNeed = 1;
            return "\uFFFD";
          }
          if (self2.lastNeed > 2 && buf.length > 2) {
            if ((buf[2] & 192) !== 128) {
              self2.lastNeed = 2;
              return "\uFFFD";
            }
          }
        }
      }
      function utf8FillLast(buf) {
        var p = this.lastTotal - this.lastNeed;
        var r = utf8CheckExtraBytes(this, buf, p);
        if (r !== void 0) return r;
        if (this.lastNeed <= buf.length) {
          buf.copy(this.lastChar, p, 0, this.lastNeed);
          return this.lastChar.toString(this.encoding, 0, this.lastTotal);
        }
        buf.copy(this.lastChar, p, 0, buf.length);
        this.lastNeed -= buf.length;
      }
      function utf8Text(buf, i) {
        var total = utf8CheckIncomplete(this, buf, i);
        if (!this.lastNeed) return buf.toString("utf8", i);
        this.lastTotal = total;
        var end = buf.length - (total - this.lastNeed);
        buf.copy(this.lastChar, 0, end);
        return buf.toString("utf8", i, end);
      }
      function utf8End(buf) {
        var r = buf && buf.length ? this.write(buf) : "";
        if (this.lastNeed) return r + "\uFFFD";
        return r;
      }
      function utf16Text(buf, i) {
        if ((buf.length - i) % 2 === 0) {
          var r = buf.toString("utf16le", i);
          if (r) {
            var c = r.charCodeAt(r.length - 1);
            if (c >= 55296 && c <= 56319) {
              this.lastNeed = 2;
              this.lastTotal = 4;
              this.lastChar[0] = buf[buf.length - 2];
              this.lastChar[1] = buf[buf.length - 1];
              return r.slice(0, -1);
            }
          }
          return r;
        }
        this.lastNeed = 1;
        this.lastTotal = 2;
        this.lastChar[0] = buf[buf.length - 1];
        return buf.toString("utf16le", i, buf.length - 1);
      }
      function utf16End(buf) {
        var r = buf && buf.length ? this.write(buf) : "";
        if (this.lastNeed) {
          var end = this.lastTotal - this.lastNeed;
          return r + this.lastChar.toString("utf16le", 0, end);
        }
        return r;
      }
      function base64Text(buf, i) {
        var n = (buf.length - i) % 3;
        if (n === 0) return buf.toString("base64", i);
        this.lastNeed = 3 - n;
        this.lastTotal = 3;
        if (n === 1) {
          this.lastChar[0] = buf[buf.length - 1];
        } else {
          this.lastChar[0] = buf[buf.length - 2];
          this.lastChar[1] = buf[buf.length - 1];
        }
        return buf.toString("base64", i, buf.length - n);
      }
      function base64End(buf) {
        var r = buf && buf.length ? this.write(buf) : "";
        if (this.lastNeed) return r + this.lastChar.toString("base64", 0, 3 - this.lastNeed);
        return r;
      }
      function simpleWrite(buf) {
        return buf.toString(this.encoding);
      }
      function simpleEnd(buf) {
        return buf && buf.length ? this.write(buf) : "";
      }
    }
  });

  // node_modules/readable-stream/lib/internal/streams/from.js
  var require_from = __commonJS({
    "node_modules/readable-stream/lib/internal/streams/from.js"(exports, module) {
      "use strict";
      var process2 = require_browser2();
      var { PromisePrototypeThen, SymbolAsyncIterator, SymbolIterator } = require_primordials();
      var { Buffer: Buffer7 } = require_buffer();
      var { ERR_INVALID_ARG_TYPE, ERR_STREAM_NULL_VALUES } = require_errors().codes;
      function from2(Readable2, iterable, opts) {
        let iterator;
        if (typeof iterable === "string" || iterable instanceof Buffer7) {
          return new Readable2({
            objectMode: true,
            ...opts,
            read() {
              this.push(iterable);
              this.push(null);
            }
          });
        }
        let isAsync;
        if (iterable && iterable[SymbolAsyncIterator]) {
          isAsync = true;
          iterator = iterable[SymbolAsyncIterator]();
        } else if (iterable && iterable[SymbolIterator]) {
          isAsync = false;
          iterator = iterable[SymbolIterator]();
        } else {
          throw new ERR_INVALID_ARG_TYPE("iterable", ["Iterable"], iterable);
        }
        const readable = new Readable2({
          objectMode: true,
          highWaterMark: 1,
          // TODO(ronag): What options should be allowed?
          ...opts
        });
        let reading = false;
        readable._read = function() {
          if (!reading) {
            reading = true;
            next();
          }
        };
        readable._destroy = function(error, cb) {
          PromisePrototypeThen(
            close2(error),
            () => process2.nextTick(cb, error),
            // nextTick is here in case cb throws
            (e) => process2.nextTick(cb, e || error)
          );
        };
        async function close2(error) {
          const hadError = error !== void 0 && error !== null;
          const hasThrow = typeof iterator.throw === "function";
          if (hadError && hasThrow) {
            const { value, done } = await iterator.throw(error);
            await value;
            if (done) {
              return;
            }
          }
          if (typeof iterator.return === "function") {
            const { value } = await iterator.return();
            await value;
          }
        }
        async function next() {
          for (; ; ) {
            try {
              const { value, done } = isAsync ? await iterator.next() : iterator.next();
              if (done) {
                readable.push(null);
              } else {
                const res = value && typeof value.then === "function" ? await value : value;
                if (res === null) {
                  reading = false;
                  throw new ERR_STREAM_NULL_VALUES();
                } else if (readable.push(res)) {
                  continue;
                } else {
                  reading = false;
                }
              }
            } catch (err2) {
              readable.destroy(err2);
            }
            break;
          }
        }
        return readable;
      }
      module.exports = from2;
    }
  });

  // node_modules/readable-stream/lib/internal/streams/readable.js
  var require_readable = __commonJS({
    "node_modules/readable-stream/lib/internal/streams/readable.js"(exports, module) {
      "use strict";
      var process2 = require_browser2();
      var {
        ArrayPrototypeIndexOf,
        NumberIsInteger,
        NumberIsNaN,
        NumberParseInt,
        ObjectDefineProperties,
        ObjectKeys,
        ObjectSetPrototypeOf,
        Promise: Promise2,
        SafeSet,
        SymbolAsyncDispose,
        SymbolAsyncIterator,
        Symbol: Symbol2
      } = require_primordials();
      module.exports = Readable2;
      Readable2.ReadableState = ReadableState;
      var { EventEmitter: EE } = require_events();
      var { Stream, prependListener } = require_legacy();
      var { Buffer: Buffer7 } = require_buffer();
      var { addAbortSignal } = require_add_abort_signal();
      var eos = require_end_of_stream();
      var debug2 = require_util().debuglog("stream", (fn) => {
        debug2 = fn;
      });
      var BufferList = require_buffer_list();
      var destroyImpl = require_destroy();
      var { getHighWaterMark, getDefaultHighWaterMark } = require_state();
      var {
        aggregateTwoErrors,
        codes: {
          ERR_INVALID_ARG_TYPE,
          ERR_METHOD_NOT_IMPLEMENTED,
          ERR_OUT_OF_RANGE,
          ERR_STREAM_PUSH_AFTER_EOF,
          ERR_STREAM_UNSHIFT_AFTER_END_EVENT
        },
        AbortError
      } = require_errors();
      var { validateObject } = require_validators();
      var kPaused = Symbol2("kPaused");
      var { StringDecoder } = require_string_decoder();
      var from2 = require_from();
      ObjectSetPrototypeOf(Readable2.prototype, Stream.prototype);
      ObjectSetPrototypeOf(Readable2, Stream);
      var nop2 = () => {
      };
      var { errorOrDestroy } = destroyImpl;
      var kObjectMode = 1 << 0;
      var kEnded = 1 << 1;
      var kEndEmitted = 1 << 2;
      var kReading = 1 << 3;
      var kConstructed = 1 << 4;
      var kSync = 1 << 5;
      var kNeedReadable = 1 << 6;
      var kEmittedReadable = 1 << 7;
      var kReadableListening = 1 << 8;
      var kResumeScheduled = 1 << 9;
      var kErrorEmitted = 1 << 10;
      var kEmitClose = 1 << 11;
      var kAutoDestroy = 1 << 12;
      var kDestroyed = 1 << 13;
      var kClosed = 1 << 14;
      var kCloseEmitted = 1 << 15;
      var kMultiAwaitDrain = 1 << 16;
      var kReadingMore = 1 << 17;
      var kDataEmitted = 1 << 18;
      function makeBitMapDescriptor(bit) {
        return {
          enumerable: false,
          get() {
            return (this.state & bit) !== 0;
          },
          set(value) {
            if (value) this.state |= bit;
            else this.state &= ~bit;
          }
        };
      }
      ObjectDefineProperties(ReadableState.prototype, {
        objectMode: makeBitMapDescriptor(kObjectMode),
        ended: makeBitMapDescriptor(kEnded),
        endEmitted: makeBitMapDescriptor(kEndEmitted),
        reading: makeBitMapDescriptor(kReading),
        // Stream is still being constructed and cannot be
        // destroyed until construction finished or failed.
        // Async construction is opt in, therefore we start as
        // constructed.
        constructed: makeBitMapDescriptor(kConstructed),
        // A flag to be able to tell if the event 'readable'/'data' is emitted
        // immediately, or on a later tick.  We set this to true at first, because
        // any actions that shouldn't happen until "later" should generally also
        // not happen before the first read call.
        sync: makeBitMapDescriptor(kSync),
        // Whenever we return null, then we set a flag to say
        // that we're awaiting a 'readable' event emission.
        needReadable: makeBitMapDescriptor(kNeedReadable),
        emittedReadable: makeBitMapDescriptor(kEmittedReadable),
        readableListening: makeBitMapDescriptor(kReadableListening),
        resumeScheduled: makeBitMapDescriptor(kResumeScheduled),
        // True if the error was already emitted and should not be thrown again.
        errorEmitted: makeBitMapDescriptor(kErrorEmitted),
        emitClose: makeBitMapDescriptor(kEmitClose),
        autoDestroy: makeBitMapDescriptor(kAutoDestroy),
        // Has it been destroyed.
        destroyed: makeBitMapDescriptor(kDestroyed),
        // Indicates whether the stream has finished destroying.
        closed: makeBitMapDescriptor(kClosed),
        // True if close has been emitted or would have been emitted
        // depending on emitClose.
        closeEmitted: makeBitMapDescriptor(kCloseEmitted),
        multiAwaitDrain: makeBitMapDescriptor(kMultiAwaitDrain),
        // If true, a maybeReadMore has been scheduled.
        readingMore: makeBitMapDescriptor(kReadingMore),
        dataEmitted: makeBitMapDescriptor(kDataEmitted)
      });
      function ReadableState(options, stream, isDuplex) {
        if (typeof isDuplex !== "boolean") isDuplex = stream instanceof require_duplex();
        this.state = kEmitClose | kAutoDestroy | kConstructed | kSync;
        if (options && options.objectMode) this.state |= kObjectMode;
        if (isDuplex && options && options.readableObjectMode) this.state |= kObjectMode;
        this.highWaterMark = options ? getHighWaterMark(this, options, "readableHighWaterMark", isDuplex) : getDefaultHighWaterMark(false);
        this.buffer = new BufferList();
        this.length = 0;
        this.pipes = [];
        this.flowing = null;
        this[kPaused] = null;
        if (options && options.emitClose === false) this.state &= ~kEmitClose;
        if (options && options.autoDestroy === false) this.state &= ~kAutoDestroy;
        this.errored = null;
        this.defaultEncoding = options && options.defaultEncoding || "utf8";
        this.awaitDrainWriters = null;
        this.decoder = null;
        this.encoding = null;
        if (options && options.encoding) {
          this.decoder = new StringDecoder(options.encoding);
          this.encoding = options.encoding;
        }
      }
      function Readable2(options) {
        if (!(this instanceof Readable2)) return new Readable2(options);
        const isDuplex = this instanceof require_duplex();
        this._readableState = new ReadableState(options, this, isDuplex);
        if (options) {
          if (typeof options.read === "function") this._read = options.read;
          if (typeof options.destroy === "function") this._destroy = options.destroy;
          if (typeof options.construct === "function") this._construct = options.construct;
          if (options.signal && !isDuplex) addAbortSignal(options.signal, this);
        }
        Stream.call(this, options);
        destroyImpl.construct(this, () => {
          if (this._readableState.needReadable) {
            maybeReadMore(this, this._readableState);
          }
        });
      }
      Readable2.prototype.destroy = destroyImpl.destroy;
      Readable2.prototype._undestroy = destroyImpl.undestroy;
      Readable2.prototype._destroy = function(err2, cb) {
        cb(err2);
      };
      Readable2.prototype[EE.captureRejectionSymbol] = function(err2) {
        this.destroy(err2);
      };
      Readable2.prototype[SymbolAsyncDispose] = function() {
        let error;
        if (!this.destroyed) {
          error = this.readableEnded ? null : new AbortError();
          this.destroy(error);
        }
        return new Promise2((resolve2, reject) => eos(this, (err2) => err2 && err2 !== error ? reject(err2) : resolve2(null)));
      };
      Readable2.prototype.push = function(chunk, encoding) {
        return readableAddChunk(this, chunk, encoding, false);
      };
      Readable2.prototype.unshift = function(chunk, encoding) {
        return readableAddChunk(this, chunk, encoding, true);
      };
      function readableAddChunk(stream, chunk, encoding, addToFront) {
        debug2("readableAddChunk", chunk);
        const state = stream._readableState;
        let err2;
        if ((state.state & kObjectMode) === 0) {
          if (typeof chunk === "string") {
            encoding = encoding || state.defaultEncoding;
            if (state.encoding !== encoding) {
              if (addToFront && state.encoding) {
                chunk = Buffer7.from(chunk, encoding).toString(state.encoding);
              } else {
                chunk = Buffer7.from(chunk, encoding);
                encoding = "";
              }
            }
          } else if (chunk instanceof Buffer7) {
            encoding = "";
          } else if (Stream._isUint8Array(chunk)) {
            chunk = Stream._uint8ArrayToBuffer(chunk);
            encoding = "";
          } else if (chunk != null) {
            err2 = new ERR_INVALID_ARG_TYPE("chunk", ["string", "Buffer", "Uint8Array"], chunk);
          }
        }
        if (err2) {
          errorOrDestroy(stream, err2);
        } else if (chunk === null) {
          state.state &= ~kReading;
          onEofChunk(stream, state);
        } else if ((state.state & kObjectMode) !== 0 || chunk && chunk.length > 0) {
          if (addToFront) {
            if ((state.state & kEndEmitted) !== 0) errorOrDestroy(stream, new ERR_STREAM_UNSHIFT_AFTER_END_EVENT());
            else if (state.destroyed || state.errored) return false;
            else addChunk(stream, state, chunk, true);
          } else if (state.ended) {
            errorOrDestroy(stream, new ERR_STREAM_PUSH_AFTER_EOF());
          } else if (state.destroyed || state.errored) {
            return false;
          } else {
            state.state &= ~kReading;
            if (state.decoder && !encoding) {
              chunk = state.decoder.write(chunk);
              if (state.objectMode || chunk.length !== 0) addChunk(stream, state, chunk, false);
              else maybeReadMore(stream, state);
            } else {
              addChunk(stream, state, chunk, false);
            }
          }
        } else if (!addToFront) {
          state.state &= ~kReading;
          maybeReadMore(stream, state);
        }
        return !state.ended && (state.length < state.highWaterMark || state.length === 0);
      }
      function addChunk(stream, state, chunk, addToFront) {
        if (state.flowing && state.length === 0 && !state.sync && stream.listenerCount("data") > 0) {
          if ((state.state & kMultiAwaitDrain) !== 0) {
            state.awaitDrainWriters.clear();
          } else {
            state.awaitDrainWriters = null;
          }
          state.dataEmitted = true;
          stream.emit("data", chunk);
        } else {
          state.length += state.objectMode ? 1 : chunk.length;
          if (addToFront) state.buffer.unshift(chunk);
          else state.buffer.push(chunk);
          if ((state.state & kNeedReadable) !== 0) emitReadable(stream);
        }
        maybeReadMore(stream, state);
      }
      Readable2.prototype.isPaused = function() {
        const state = this._readableState;
        return state[kPaused] === true || state.flowing === false;
      };
      Readable2.prototype.setEncoding = function(enc) {
        const decoder2 = new StringDecoder(enc);
        this._readableState.decoder = decoder2;
        this._readableState.encoding = this._readableState.decoder.encoding;
        const buffer = this._readableState.buffer;
        let content = "";
        for (const data of buffer) {
          content += decoder2.write(data);
        }
        buffer.clear();
        if (content !== "") buffer.push(content);
        this._readableState.length = content.length;
        return this;
      };
      var MAX_HWM = 1073741824;
      function computeNewHighWaterMark(n) {
        if (n > MAX_HWM) {
          throw new ERR_OUT_OF_RANGE("size", "<= 1GiB", n);
        } else {
          n--;
          n |= n >>> 1;
          n |= n >>> 2;
          n |= n >>> 4;
          n |= n >>> 8;
          n |= n >>> 16;
          n++;
        }
        return n;
      }
      function howMuchToRead(n, state) {
        if (n <= 0 || state.length === 0 && state.ended) return 0;
        if ((state.state & kObjectMode) !== 0) return 1;
        if (NumberIsNaN(n)) {
          if (state.flowing && state.length) return state.buffer.first().length;
          return state.length;
        }
        if (n <= state.length) return n;
        return state.ended ? state.length : 0;
      }
      Readable2.prototype.read = function(n) {
        debug2("read", n);
        if (n === void 0) {
          n = NaN;
        } else if (!NumberIsInteger(n)) {
          n = NumberParseInt(n, 10);
        }
        const state = this._readableState;
        const nOrig = n;
        if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
        if (n !== 0) state.state &= ~kEmittedReadable;
        if (n === 0 && state.needReadable && ((state.highWaterMark !== 0 ? state.length >= state.highWaterMark : state.length > 0) || state.ended)) {
          debug2("read: emitReadable", state.length, state.ended);
          if (state.length === 0 && state.ended) endReadable(this);
          else emitReadable(this);
          return null;
        }
        n = howMuchToRead(n, state);
        if (n === 0 && state.ended) {
          if (state.length === 0) endReadable(this);
          return null;
        }
        let doRead = (state.state & kNeedReadable) !== 0;
        debug2("need readable", doRead);
        if (state.length === 0 || state.length - n < state.highWaterMark) {
          doRead = true;
          debug2("length less than watermark", doRead);
        }
        if (state.ended || state.reading || state.destroyed || state.errored || !state.constructed) {
          doRead = false;
          debug2("reading, ended or constructing", doRead);
        } else if (doRead) {
          debug2("do read");
          state.state |= kReading | kSync;
          if (state.length === 0) state.state |= kNeedReadable;
          try {
            this._read(state.highWaterMark);
          } catch (err2) {
            errorOrDestroy(this, err2);
          }
          state.state &= ~kSync;
          if (!state.reading) n = howMuchToRead(nOrig, state);
        }
        let ret;
        if (n > 0) ret = fromList(n, state);
        else ret = null;
        if (ret === null) {
          state.needReadable = state.length <= state.highWaterMark;
          n = 0;
        } else {
          state.length -= n;
          if (state.multiAwaitDrain) {
            state.awaitDrainWriters.clear();
          } else {
            state.awaitDrainWriters = null;
          }
        }
        if (state.length === 0) {
          if (!state.ended) state.needReadable = true;
          if (nOrig !== n && state.ended) endReadable(this);
        }
        if (ret !== null && !state.errorEmitted && !state.closeEmitted) {
          state.dataEmitted = true;
          this.emit("data", ret);
        }
        return ret;
      };
      function onEofChunk(stream, state) {
        debug2("onEofChunk");
        if (state.ended) return;
        if (state.decoder) {
          const chunk = state.decoder.end();
          if (chunk && chunk.length) {
            state.buffer.push(chunk);
            state.length += state.objectMode ? 1 : chunk.length;
          }
        }
        state.ended = true;
        if (state.sync) {
          emitReadable(stream);
        } else {
          state.needReadable = false;
          state.emittedReadable = true;
          emitReadable_(stream);
        }
      }
      function emitReadable(stream) {
        const state = stream._readableState;
        debug2("emitReadable", state.needReadable, state.emittedReadable);
        state.needReadable = false;
        if (!state.emittedReadable) {
          debug2("emitReadable", state.flowing);
          state.emittedReadable = true;
          process2.nextTick(emitReadable_, stream);
        }
      }
      function emitReadable_(stream) {
        const state = stream._readableState;
        debug2("emitReadable_", state.destroyed, state.length, state.ended);
        if (!state.destroyed && !state.errored && (state.length || state.ended)) {
          stream.emit("readable");
          state.emittedReadable = false;
        }
        state.needReadable = !state.flowing && !state.ended && state.length <= state.highWaterMark;
        flow(stream);
      }
      function maybeReadMore(stream, state) {
        if (!state.readingMore && state.constructed) {
          state.readingMore = true;
          process2.nextTick(maybeReadMore_, stream, state);
        }
      }
      function maybeReadMore_(stream, state) {
        while (!state.reading && !state.ended && (state.length < state.highWaterMark || state.flowing && state.length === 0)) {
          const len = state.length;
          debug2("maybeReadMore read 0");
          stream.read(0);
          if (len === state.length)
            break;
        }
        state.readingMore = false;
      }
      Readable2.prototype._read = function(n) {
        throw new ERR_METHOD_NOT_IMPLEMENTED("_read()");
      };
      Readable2.prototype.pipe = function(dest, pipeOpts) {
        const src = this;
        const state = this._readableState;
        if (state.pipes.length === 1) {
          if (!state.multiAwaitDrain) {
            state.multiAwaitDrain = true;
            state.awaitDrainWriters = new SafeSet(state.awaitDrainWriters ? [state.awaitDrainWriters] : []);
          }
        }
        state.pipes.push(dest);
        debug2("pipe count=%d opts=%j", state.pipes.length, pipeOpts);
        const doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process2.stdout && dest !== process2.stderr;
        const endFn = doEnd ? onend : unpipe;
        if (state.endEmitted) process2.nextTick(endFn);
        else src.once("end", endFn);
        dest.on("unpipe", onunpipe);
        function onunpipe(readable, unpipeInfo) {
          debug2("onunpipe");
          if (readable === src) {
            if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
              unpipeInfo.hasUnpiped = true;
              cleanup();
            }
          }
        }
        function onend() {
          debug2("onend");
          dest.end();
        }
        let ondrain;
        let cleanedUp = false;
        function cleanup() {
          debug2("cleanup");
          dest.removeListener("close", onclose);
          dest.removeListener("finish", onfinish);
          if (ondrain) {
            dest.removeListener("drain", ondrain);
          }
          dest.removeListener("error", onerror);
          dest.removeListener("unpipe", onunpipe);
          src.removeListener("end", onend);
          src.removeListener("end", unpipe);
          src.removeListener("data", ondata);
          cleanedUp = true;
          if (ondrain && state.awaitDrainWriters && (!dest._writableState || dest._writableState.needDrain)) ondrain();
        }
        function pause() {
          if (!cleanedUp) {
            if (state.pipes.length === 1 && state.pipes[0] === dest) {
              debug2("false write response, pause", 0);
              state.awaitDrainWriters = dest;
              state.multiAwaitDrain = false;
            } else if (state.pipes.length > 1 && state.pipes.includes(dest)) {
              debug2("false write response, pause", state.awaitDrainWriters.size);
              state.awaitDrainWriters.add(dest);
            }
            src.pause();
          }
          if (!ondrain) {
            ondrain = pipeOnDrain(src, dest);
            dest.on("drain", ondrain);
          }
        }
        src.on("data", ondata);
        function ondata(chunk) {
          debug2("ondata");
          const ret = dest.write(chunk);
          debug2("dest.write", ret);
          if (ret === false) {
            pause();
          }
        }
        function onerror(er) {
          debug2("onerror", er);
          unpipe();
          dest.removeListener("error", onerror);
          if (dest.listenerCount("error") === 0) {
            const s = dest._writableState || dest._readableState;
            if (s && !s.errorEmitted) {
              errorOrDestroy(dest, er);
            } else {
              dest.emit("error", er);
            }
          }
        }
        prependListener(dest, "error", onerror);
        function onclose() {
          dest.removeListener("finish", onfinish);
          unpipe();
        }
        dest.once("close", onclose);
        function onfinish() {
          debug2("onfinish");
          dest.removeListener("close", onclose);
          unpipe();
        }
        dest.once("finish", onfinish);
        function unpipe() {
          debug2("unpipe");
          src.unpipe(dest);
        }
        dest.emit("pipe", src);
        if (dest.writableNeedDrain === true) {
          pause();
        } else if (!state.flowing) {
          debug2("pipe resume");
          src.resume();
        }
        return dest;
      };
      function pipeOnDrain(src, dest) {
        return function pipeOnDrainFunctionResult() {
          const state = src._readableState;
          if (state.awaitDrainWriters === dest) {
            debug2("pipeOnDrain", 1);
            state.awaitDrainWriters = null;
          } else if (state.multiAwaitDrain) {
            debug2("pipeOnDrain", state.awaitDrainWriters.size);
            state.awaitDrainWriters.delete(dest);
          }
          if ((!state.awaitDrainWriters || state.awaitDrainWriters.size === 0) && src.listenerCount("data")) {
            src.resume();
          }
        };
      }
      Readable2.prototype.unpipe = function(dest) {
        const state = this._readableState;
        const unpipeInfo = {
          hasUnpiped: false
        };
        if (state.pipes.length === 0) return this;
        if (!dest) {
          const dests = state.pipes;
          state.pipes = [];
          this.pause();
          for (let i = 0; i < dests.length; i++)
            dests[i].emit("unpipe", this, {
              hasUnpiped: false
            });
          return this;
        }
        const index = ArrayPrototypeIndexOf(state.pipes, dest);
        if (index === -1) return this;
        state.pipes.splice(index, 1);
        if (state.pipes.length === 0) this.pause();
        dest.emit("unpipe", this, unpipeInfo);
        return this;
      };
      Readable2.prototype.on = function(ev, fn) {
        const res = Stream.prototype.on.call(this, ev, fn);
        const state = this._readableState;
        if (ev === "data") {
          state.readableListening = this.listenerCount("readable") > 0;
          if (state.flowing !== false) this.resume();
        } else if (ev === "readable") {
          if (!state.endEmitted && !state.readableListening) {
            state.readableListening = state.needReadable = true;
            state.flowing = false;
            state.emittedReadable = false;
            debug2("on readable", state.length, state.reading);
            if (state.length) {
              emitReadable(this);
            } else if (!state.reading) {
              process2.nextTick(nReadingNextTick, this);
            }
          }
        }
        return res;
      };
      Readable2.prototype.addListener = Readable2.prototype.on;
      Readable2.prototype.removeListener = function(ev, fn) {
        const res = Stream.prototype.removeListener.call(this, ev, fn);
        if (ev === "readable") {
          process2.nextTick(updateReadableListening, this);
        }
        return res;
      };
      Readable2.prototype.off = Readable2.prototype.removeListener;
      Readable2.prototype.removeAllListeners = function(ev) {
        const res = Stream.prototype.removeAllListeners.apply(this, arguments);
        if (ev === "readable" || ev === void 0) {
          process2.nextTick(updateReadableListening, this);
        }
        return res;
      };
      function updateReadableListening(self2) {
        const state = self2._readableState;
        state.readableListening = self2.listenerCount("readable") > 0;
        if (state.resumeScheduled && state[kPaused] === false) {
          state.flowing = true;
        } else if (self2.listenerCount("data") > 0) {
          self2.resume();
        } else if (!state.readableListening) {
          state.flowing = null;
        }
      }
      function nReadingNextTick(self2) {
        debug2("readable nexttick read 0");
        self2.read(0);
      }
      Readable2.prototype.resume = function() {
        const state = this._readableState;
        if (!state.flowing) {
          debug2("resume");
          state.flowing = !state.readableListening;
          resume(this, state);
        }
        state[kPaused] = false;
        return this;
      };
      function resume(stream, state) {
        if (!state.resumeScheduled) {
          state.resumeScheduled = true;
          process2.nextTick(resume_, stream, state);
        }
      }
      function resume_(stream, state) {
        debug2("resume", state.reading);
        if (!state.reading) {
          stream.read(0);
        }
        state.resumeScheduled = false;
        stream.emit("resume");
        flow(stream);
        if (state.flowing && !state.reading) stream.read(0);
      }
      Readable2.prototype.pause = function() {
        debug2("call pause flowing=%j", this._readableState.flowing);
        if (this._readableState.flowing !== false) {
          debug2("pause");
          this._readableState.flowing = false;
          this.emit("pause");
        }
        this._readableState[kPaused] = true;
        return this;
      };
      function flow(stream) {
        const state = stream._readableState;
        debug2("flow", state.flowing);
        while (state.flowing && stream.read() !== null) ;
      }
      Readable2.prototype.wrap = function(stream) {
        let paused = false;
        stream.on("data", (chunk) => {
          if (!this.push(chunk) && stream.pause) {
            paused = true;
            stream.pause();
          }
        });
        stream.on("end", () => {
          this.push(null);
        });
        stream.on("error", (err2) => {
          errorOrDestroy(this, err2);
        });
        stream.on("close", () => {
          this.destroy();
        });
        stream.on("destroy", () => {
          this.destroy();
        });
        this._read = () => {
          if (paused && stream.resume) {
            paused = false;
            stream.resume();
          }
        };
        const streamKeys = ObjectKeys(stream);
        for (let j = 1; j < streamKeys.length; j++) {
          const i = streamKeys[j];
          if (this[i] === void 0 && typeof stream[i] === "function") {
            this[i] = stream[i].bind(stream);
          }
        }
        return this;
      };
      Readable2.prototype[SymbolAsyncIterator] = function() {
        return streamToAsyncIterator(this);
      };
      Readable2.prototype.iterator = function(options) {
        if (options !== void 0) {
          validateObject(options, "options");
        }
        return streamToAsyncIterator(this, options);
      };
      function streamToAsyncIterator(stream, options) {
        if (typeof stream.read !== "function") {
          stream = Readable2.wrap(stream, {
            objectMode: true
          });
        }
        const iter = createAsyncIterator(stream, options);
        iter.stream = stream;
        return iter;
      }
      async function* createAsyncIterator(stream, options) {
        let callback = nop2;
        function next(resolve2) {
          if (this === stream) {
            callback();
            callback = nop2;
          } else {
            callback = resolve2;
          }
        }
        stream.on("readable", next);
        let error;
        const cleanup = eos(
          stream,
          {
            writable: false
          },
          (err2) => {
            error = err2 ? aggregateTwoErrors(error, err2) : null;
            callback();
            callback = nop2;
          }
        );
        try {
          while (true) {
            const chunk = stream.destroyed ? null : stream.read();
            if (chunk !== null) {
              yield chunk;
            } else if (error) {
              throw error;
            } else if (error === null) {
              return;
            } else {
              await new Promise2(next);
            }
          }
        } catch (err2) {
          error = aggregateTwoErrors(error, err2);
          throw error;
        } finally {
          if ((error || (options === null || options === void 0 ? void 0 : options.destroyOnReturn) !== false) && (error === void 0 || stream._readableState.autoDestroy)) {
            destroyImpl.destroyer(stream, null);
          } else {
            stream.off("readable", next);
            cleanup();
          }
        }
      }
      ObjectDefineProperties(Readable2.prototype, {
        readable: {
          __proto__: null,
          get() {
            const r = this._readableState;
            return !!r && r.readable !== false && !r.destroyed && !r.errorEmitted && !r.endEmitted;
          },
          set(val) {
            if (this._readableState) {
              this._readableState.readable = !!val;
            }
          }
        },
        readableDidRead: {
          __proto__: null,
          enumerable: false,
          get: function() {
            return this._readableState.dataEmitted;
          }
        },
        readableAborted: {
          __proto__: null,
          enumerable: false,
          get: function() {
            return !!(this._readableState.readable !== false && (this._readableState.destroyed || this._readableState.errored) && !this._readableState.endEmitted);
          }
        },
        readableHighWaterMark: {
          __proto__: null,
          enumerable: false,
          get: function() {
            return this._readableState.highWaterMark;
          }
        },
        readableBuffer: {
          __proto__: null,
          enumerable: false,
          get: function() {
            return this._readableState && this._readableState.buffer;
          }
        },
        readableFlowing: {
          __proto__: null,
          enumerable: false,
          get: function() {
            return this._readableState.flowing;
          },
          set: function(state) {
            if (this._readableState) {
              this._readableState.flowing = state;
            }
          }
        },
        readableLength: {
          __proto__: null,
          enumerable: false,
          get() {
            return this._readableState.length;
          }
        },
        readableObjectMode: {
          __proto__: null,
          enumerable: false,
          get() {
            return this._readableState ? this._readableState.objectMode : false;
          }
        },
        readableEncoding: {
          __proto__: null,
          enumerable: false,
          get() {
            return this._readableState ? this._readableState.encoding : null;
          }
        },
        errored: {
          __proto__: null,
          enumerable: false,
          get() {
            return this._readableState ? this._readableState.errored : null;
          }
        },
        closed: {
          __proto__: null,
          get() {
            return this._readableState ? this._readableState.closed : false;
          }
        },
        destroyed: {
          __proto__: null,
          enumerable: false,
          get() {
            return this._readableState ? this._readableState.destroyed : false;
          },
          set(value) {
            if (!this._readableState) {
              return;
            }
            this._readableState.destroyed = value;
          }
        },
        readableEnded: {
          __proto__: null,
          enumerable: false,
          get() {
            return this._readableState ? this._readableState.endEmitted : false;
          }
        }
      });
      ObjectDefineProperties(ReadableState.prototype, {
        // Legacy getter for `pipesCount`.
        pipesCount: {
          __proto__: null,
          get() {
            return this.pipes.length;
          }
        },
        // Legacy property for `paused`.
        paused: {
          __proto__: null,
          get() {
            return this[kPaused] !== false;
          },
          set(value) {
            this[kPaused] = !!value;
          }
        }
      });
      Readable2._fromList = fromList;
      function fromList(n, state) {
        if (state.length === 0) return null;
        let ret;
        if (state.objectMode) ret = state.buffer.shift();
        else if (!n || n >= state.length) {
          if (state.decoder) ret = state.buffer.join("");
          else if (state.buffer.length === 1) ret = state.buffer.first();
          else ret = state.buffer.concat(state.length);
          state.buffer.clear();
        } else {
          ret = state.buffer.consume(n, state.decoder);
        }
        return ret;
      }
      function endReadable(stream) {
        const state = stream._readableState;
        debug2("endReadable", state.endEmitted);
        if (!state.endEmitted) {
          state.ended = true;
          process2.nextTick(endReadableNT, state, stream);
        }
      }
      function endReadableNT(state, stream) {
        debug2("endReadableNT", state.endEmitted, state.length);
        if (!state.errored && !state.closeEmitted && !state.endEmitted && state.length === 0) {
          state.endEmitted = true;
          stream.emit("end");
          if (stream.writable && stream.allowHalfOpen === false) {
            process2.nextTick(endWritableNT, stream);
          } else if (state.autoDestroy) {
            const wState = stream._writableState;
            const autoDestroy = !wState || wState.autoDestroy && // We don't expect the writable to ever 'finish'
            // if writable is explicitly set to false.
            (wState.finished || wState.writable === false);
            if (autoDestroy) {
              stream.destroy();
            }
          }
        }
      }
      function endWritableNT(stream) {
        const writable = stream.writable && !stream.writableEnded && !stream.destroyed;
        if (writable) {
          stream.end();
        }
      }
      Readable2.from = function(iterable, opts) {
        return from2(Readable2, iterable, opts);
      };
      var webStreamsAdapters;
      function lazyWebStreams() {
        if (webStreamsAdapters === void 0) webStreamsAdapters = {};
        return webStreamsAdapters;
      }
      Readable2.fromWeb = function(readableStream, options) {
        return lazyWebStreams().newStreamReadableFromReadableStream(readableStream, options);
      };
      Readable2.toWeb = function(streamReadable, options) {
        return lazyWebStreams().newReadableStreamFromStreamReadable(streamReadable, options);
      };
      Readable2.wrap = function(src, options) {
        var _ref, _src$readableObjectMo;
        return new Readable2({
          objectMode: (_ref = (_src$readableObjectMo = src.readableObjectMode) !== null && _src$readableObjectMo !== void 0 ? _src$readableObjectMo : src.objectMode) !== null && _ref !== void 0 ? _ref : true,
          ...options,
          destroy(err2, callback) {
            destroyImpl.destroyer(src, err2);
            callback(err2);
          }
        }).wrap(src);
      };
    }
  });

  // node_modules/readable-stream/lib/internal/streams/writable.js
  var require_writable = __commonJS({
    "node_modules/readable-stream/lib/internal/streams/writable.js"(exports, module) {
      "use strict";
      var process2 = require_browser2();
      var {
        ArrayPrototypeSlice,
        Error: Error2,
        FunctionPrototypeSymbolHasInstance,
        ObjectDefineProperty,
        ObjectDefineProperties,
        ObjectSetPrototypeOf,
        StringPrototypeToLowerCase,
        Symbol: Symbol2,
        SymbolHasInstance
      } = require_primordials();
      module.exports = Writable2;
      Writable2.WritableState = WritableState;
      var { EventEmitter: EE } = require_events();
      var Stream = require_legacy().Stream;
      var { Buffer: Buffer7 } = require_buffer();
      var destroyImpl = require_destroy();
      var { addAbortSignal } = require_add_abort_signal();
      var { getHighWaterMark, getDefaultHighWaterMark } = require_state();
      var {
        ERR_INVALID_ARG_TYPE,
        ERR_METHOD_NOT_IMPLEMENTED,
        ERR_MULTIPLE_CALLBACK,
        ERR_STREAM_CANNOT_PIPE,
        ERR_STREAM_DESTROYED,
        ERR_STREAM_ALREADY_FINISHED,
        ERR_STREAM_NULL_VALUES,
        ERR_STREAM_WRITE_AFTER_END,
        ERR_UNKNOWN_ENCODING
      } = require_errors().codes;
      var { errorOrDestroy } = destroyImpl;
      ObjectSetPrototypeOf(Writable2.prototype, Stream.prototype);
      ObjectSetPrototypeOf(Writable2, Stream);
      function nop2() {
      }
      var kOnFinished = Symbol2("kOnFinished");
      function WritableState(options, stream, isDuplex) {
        if (typeof isDuplex !== "boolean") isDuplex = stream instanceof require_duplex();
        this.objectMode = !!(options && options.objectMode);
        if (isDuplex) this.objectMode = this.objectMode || !!(options && options.writableObjectMode);
        this.highWaterMark = options ? getHighWaterMark(this, options, "writableHighWaterMark", isDuplex) : getDefaultHighWaterMark(false);
        this.finalCalled = false;
        this.needDrain = false;
        this.ending = false;
        this.ended = false;
        this.finished = false;
        this.destroyed = false;
        const noDecode = !!(options && options.decodeStrings === false);
        this.decodeStrings = !noDecode;
        this.defaultEncoding = options && options.defaultEncoding || "utf8";
        this.length = 0;
        this.writing = false;
        this.corked = 0;
        this.sync = true;
        this.bufferProcessing = false;
        this.onwrite = onwrite.bind(void 0, stream);
        this.writecb = null;
        this.writelen = 0;
        this.afterWriteTickInfo = null;
        resetBuffer(this);
        this.pendingcb = 0;
        this.constructed = true;
        this.prefinished = false;
        this.errorEmitted = false;
        this.emitClose = !options || options.emitClose !== false;
        this.autoDestroy = !options || options.autoDestroy !== false;
        this.errored = null;
        this.closed = false;
        this.closeEmitted = false;
        this[kOnFinished] = [];
      }
      function resetBuffer(state) {
        state.buffered = [];
        state.bufferedIndex = 0;
        state.allBuffers = true;
        state.allNoop = true;
      }
      WritableState.prototype.getBuffer = function getBuffer() {
        return ArrayPrototypeSlice(this.buffered, this.bufferedIndex);
      };
      ObjectDefineProperty(WritableState.prototype, "bufferedRequestCount", {
        __proto__: null,
        get() {
          return this.buffered.length - this.bufferedIndex;
        }
      });
      function Writable2(options) {
        const isDuplex = this instanceof require_duplex();
        if (!isDuplex && !FunctionPrototypeSymbolHasInstance(Writable2, this)) return new Writable2(options);
        this._writableState = new WritableState(options, this, isDuplex);
        if (options) {
          if (typeof options.write === "function") this._write = options.write;
          if (typeof options.writev === "function") this._writev = options.writev;
          if (typeof options.destroy === "function") this._destroy = options.destroy;
          if (typeof options.final === "function") this._final = options.final;
          if (typeof options.construct === "function") this._construct = options.construct;
          if (options.signal) addAbortSignal(options.signal, this);
        }
        Stream.call(this, options);
        destroyImpl.construct(this, () => {
          const state = this._writableState;
          if (!state.writing) {
            clearBuffer(this, state);
          }
          finishMaybe(this, state);
        });
      }
      ObjectDefineProperty(Writable2, SymbolHasInstance, {
        __proto__: null,
        value: function(object) {
          if (FunctionPrototypeSymbolHasInstance(this, object)) return true;
          if (this !== Writable2) return false;
          return object && object._writableState instanceof WritableState;
        }
      });
      Writable2.prototype.pipe = function() {
        errorOrDestroy(this, new ERR_STREAM_CANNOT_PIPE());
      };
      function _write(stream, chunk, encoding, cb) {
        const state = stream._writableState;
        if (typeof encoding === "function") {
          cb = encoding;
          encoding = state.defaultEncoding;
        } else {
          if (!encoding) encoding = state.defaultEncoding;
          else if (encoding !== "buffer" && !Buffer7.isEncoding(encoding)) throw new ERR_UNKNOWN_ENCODING(encoding);
          if (typeof cb !== "function") cb = nop2;
        }
        if (chunk === null) {
          throw new ERR_STREAM_NULL_VALUES();
        } else if (!state.objectMode) {
          if (typeof chunk === "string") {
            if (state.decodeStrings !== false) {
              chunk = Buffer7.from(chunk, encoding);
              encoding = "buffer";
            }
          } else if (chunk instanceof Buffer7) {
            encoding = "buffer";
          } else if (Stream._isUint8Array(chunk)) {
            chunk = Stream._uint8ArrayToBuffer(chunk);
            encoding = "buffer";
          } else {
            throw new ERR_INVALID_ARG_TYPE("chunk", ["string", "Buffer", "Uint8Array"], chunk);
          }
        }
        let err2;
        if (state.ending) {
          err2 = new ERR_STREAM_WRITE_AFTER_END();
        } else if (state.destroyed) {
          err2 = new ERR_STREAM_DESTROYED("write");
        }
        if (err2) {
          process2.nextTick(cb, err2);
          errorOrDestroy(stream, err2, true);
          return err2;
        }
        state.pendingcb++;
        return writeOrBuffer(stream, state, chunk, encoding, cb);
      }
      Writable2.prototype.write = function(chunk, encoding, cb) {
        return _write(this, chunk, encoding, cb) === true;
      };
      Writable2.prototype.cork = function() {
        this._writableState.corked++;
      };
      Writable2.prototype.uncork = function() {
        const state = this._writableState;
        if (state.corked) {
          state.corked--;
          if (!state.writing) clearBuffer(this, state);
        }
      };
      Writable2.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
        if (typeof encoding === "string") encoding = StringPrototypeToLowerCase(encoding);
        if (!Buffer7.isEncoding(encoding)) throw new ERR_UNKNOWN_ENCODING(encoding);
        this._writableState.defaultEncoding = encoding;
        return this;
      };
      function writeOrBuffer(stream, state, chunk, encoding, callback) {
        const len = state.objectMode ? 1 : chunk.length;
        state.length += len;
        const ret = state.length < state.highWaterMark;
        if (!ret) state.needDrain = true;
        if (state.writing || state.corked || state.errored || !state.constructed) {
          state.buffered.push({
            chunk,
            encoding,
            callback
          });
          if (state.allBuffers && encoding !== "buffer") {
            state.allBuffers = false;
          }
          if (state.allNoop && callback !== nop2) {
            state.allNoop = false;
          }
        } else {
          state.writelen = len;
          state.writecb = callback;
          state.writing = true;
          state.sync = true;
          stream._write(chunk, encoding, state.onwrite);
          state.sync = false;
        }
        return ret && !state.errored && !state.destroyed;
      }
      function doWrite(stream, state, writev2, len, chunk, encoding, cb) {
        state.writelen = len;
        state.writecb = cb;
        state.writing = true;
        state.sync = true;
        if (state.destroyed) state.onwrite(new ERR_STREAM_DESTROYED("write"));
        else if (writev2) stream._writev(chunk, state.onwrite);
        else stream._write(chunk, encoding, state.onwrite);
        state.sync = false;
      }
      function onwriteError(stream, state, er, cb) {
        --state.pendingcb;
        cb(er);
        errorBuffer(state);
        errorOrDestroy(stream, er);
      }
      function onwrite(stream, er) {
        const state = stream._writableState;
        const sync = state.sync;
        const cb = state.writecb;
        if (typeof cb !== "function") {
          errorOrDestroy(stream, new ERR_MULTIPLE_CALLBACK());
          return;
        }
        state.writing = false;
        state.writecb = null;
        state.length -= state.writelen;
        state.writelen = 0;
        if (er) {
          er.stack;
          if (!state.errored) {
            state.errored = er;
          }
          if (stream._readableState && !stream._readableState.errored) {
            stream._readableState.errored = er;
          }
          if (sync) {
            process2.nextTick(onwriteError, stream, state, er, cb);
          } else {
            onwriteError(stream, state, er, cb);
          }
        } else {
          if (state.buffered.length > state.bufferedIndex) {
            clearBuffer(stream, state);
          }
          if (sync) {
            if (state.afterWriteTickInfo !== null && state.afterWriteTickInfo.cb === cb) {
              state.afterWriteTickInfo.count++;
            } else {
              state.afterWriteTickInfo = {
                count: 1,
                cb,
                stream,
                state
              };
              process2.nextTick(afterWriteTick, state.afterWriteTickInfo);
            }
          } else {
            afterWrite(stream, state, 1, cb);
          }
        }
      }
      function afterWriteTick({ stream, state, count, cb }) {
        state.afterWriteTickInfo = null;
        return afterWrite(stream, state, count, cb);
      }
      function afterWrite(stream, state, count, cb) {
        const needDrain = !state.ending && !stream.destroyed && state.length === 0 && state.needDrain;
        if (needDrain) {
          state.needDrain = false;
          stream.emit("drain");
        }
        while (count-- > 0) {
          state.pendingcb--;
          cb();
        }
        if (state.destroyed) {
          errorBuffer(state);
        }
        finishMaybe(stream, state);
      }
      function errorBuffer(state) {
        if (state.writing) {
          return;
        }
        for (let n = state.bufferedIndex; n < state.buffered.length; ++n) {
          var _state$errored;
          const { chunk, callback } = state.buffered[n];
          const len = state.objectMode ? 1 : chunk.length;
          state.length -= len;
          callback(
            (_state$errored = state.errored) !== null && _state$errored !== void 0 ? _state$errored : new ERR_STREAM_DESTROYED("write")
          );
        }
        const onfinishCallbacks = state[kOnFinished].splice(0);
        for (let i = 0; i < onfinishCallbacks.length; i++) {
          var _state$errored2;
          onfinishCallbacks[i](
            (_state$errored2 = state.errored) !== null && _state$errored2 !== void 0 ? _state$errored2 : new ERR_STREAM_DESTROYED("end")
          );
        }
        resetBuffer(state);
      }
      function clearBuffer(stream, state) {
        if (state.corked || state.bufferProcessing || state.destroyed || !state.constructed) {
          return;
        }
        const { buffered, bufferedIndex, objectMode } = state;
        const bufferedLength = buffered.length - bufferedIndex;
        if (!bufferedLength) {
          return;
        }
        let i = bufferedIndex;
        state.bufferProcessing = true;
        if (bufferedLength > 1 && stream._writev) {
          state.pendingcb -= bufferedLength - 1;
          const callback = state.allNoop ? nop2 : (err2) => {
            for (let n = i; n < buffered.length; ++n) {
              buffered[n].callback(err2);
            }
          };
          const chunks = state.allNoop && i === 0 ? buffered : ArrayPrototypeSlice(buffered, i);
          chunks.allBuffers = state.allBuffers;
          doWrite(stream, state, true, state.length, chunks, "", callback);
          resetBuffer(state);
        } else {
          do {
            const { chunk, encoding, callback } = buffered[i];
            buffered[i++] = null;
            const len = objectMode ? 1 : chunk.length;
            doWrite(stream, state, false, len, chunk, encoding, callback);
          } while (i < buffered.length && !state.writing);
          if (i === buffered.length) {
            resetBuffer(state);
          } else if (i > 256) {
            buffered.splice(0, i);
            state.bufferedIndex = 0;
          } else {
            state.bufferedIndex = i;
          }
        }
        state.bufferProcessing = false;
      }
      Writable2.prototype._write = function(chunk, encoding, cb) {
        if (this._writev) {
          this._writev(
            [
              {
                chunk,
                encoding
              }
            ],
            cb
          );
        } else {
          throw new ERR_METHOD_NOT_IMPLEMENTED("_write()");
        }
      };
      Writable2.prototype._writev = null;
      Writable2.prototype.end = function(chunk, encoding, cb) {
        const state = this._writableState;
        if (typeof chunk === "function") {
          cb = chunk;
          chunk = null;
          encoding = null;
        } else if (typeof encoding === "function") {
          cb = encoding;
          encoding = null;
        }
        let err2;
        if (chunk !== null && chunk !== void 0) {
          const ret = _write(this, chunk, encoding);
          if (ret instanceof Error2) {
            err2 = ret;
          }
        }
        if (state.corked) {
          state.corked = 1;
          this.uncork();
        }
        if (err2) {
        } else if (!state.errored && !state.ending) {
          state.ending = true;
          finishMaybe(this, state, true);
          state.ended = true;
        } else if (state.finished) {
          err2 = new ERR_STREAM_ALREADY_FINISHED("end");
        } else if (state.destroyed) {
          err2 = new ERR_STREAM_DESTROYED("end");
        }
        if (typeof cb === "function") {
          if (err2 || state.finished) {
            process2.nextTick(cb, err2);
          } else {
            state[kOnFinished].push(cb);
          }
        }
        return this;
      };
      function needFinish(state) {
        return state.ending && !state.destroyed && state.constructed && state.length === 0 && !state.errored && state.buffered.length === 0 && !state.finished && !state.writing && !state.errorEmitted && !state.closeEmitted;
      }
      function callFinal(stream, state) {
        let called = false;
        function onFinish(err2) {
          if (called) {
            errorOrDestroy(stream, err2 !== null && err2 !== void 0 ? err2 : ERR_MULTIPLE_CALLBACK());
            return;
          }
          called = true;
          state.pendingcb--;
          if (err2) {
            const onfinishCallbacks = state[kOnFinished].splice(0);
            for (let i = 0; i < onfinishCallbacks.length; i++) {
              onfinishCallbacks[i](err2);
            }
            errorOrDestroy(stream, err2, state.sync);
          } else if (needFinish(state)) {
            state.prefinished = true;
            stream.emit("prefinish");
            state.pendingcb++;
            process2.nextTick(finish, stream, state);
          }
        }
        state.sync = true;
        state.pendingcb++;
        try {
          stream._final(onFinish);
        } catch (err2) {
          onFinish(err2);
        }
        state.sync = false;
      }
      function prefinish(stream, state) {
        if (!state.prefinished && !state.finalCalled) {
          if (typeof stream._final === "function" && !state.destroyed) {
            state.finalCalled = true;
            callFinal(stream, state);
          } else {
            state.prefinished = true;
            stream.emit("prefinish");
          }
        }
      }
      function finishMaybe(stream, state, sync) {
        if (needFinish(state)) {
          prefinish(stream, state);
          if (state.pendingcb === 0) {
            if (sync) {
              state.pendingcb++;
              process2.nextTick(
                (stream2, state2) => {
                  if (needFinish(state2)) {
                    finish(stream2, state2);
                  } else {
                    state2.pendingcb--;
                  }
                },
                stream,
                state
              );
            } else if (needFinish(state)) {
              state.pendingcb++;
              finish(stream, state);
            }
          }
        }
      }
      function finish(stream, state) {
        state.pendingcb--;
        state.finished = true;
        const onfinishCallbacks = state[kOnFinished].splice(0);
        for (let i = 0; i < onfinishCallbacks.length; i++) {
          onfinishCallbacks[i]();
        }
        stream.emit("finish");
        if (state.autoDestroy) {
          const rState = stream._readableState;
          const autoDestroy = !rState || rState.autoDestroy && // We don't expect the readable to ever 'end'
          // if readable is explicitly set to false.
          (rState.endEmitted || rState.readable === false);
          if (autoDestroy) {
            stream.destroy();
          }
        }
      }
      ObjectDefineProperties(Writable2.prototype, {
        closed: {
          __proto__: null,
          get() {
            return this._writableState ? this._writableState.closed : false;
          }
        },
        destroyed: {
          __proto__: null,
          get() {
            return this._writableState ? this._writableState.destroyed : false;
          },
          set(value) {
            if (this._writableState) {
              this._writableState.destroyed = value;
            }
          }
        },
        writable: {
          __proto__: null,
          get() {
            const w = this._writableState;
            return !!w && w.writable !== false && !w.destroyed && !w.errored && !w.ending && !w.ended;
          },
          set(val) {
            if (this._writableState) {
              this._writableState.writable = !!val;
            }
          }
        },
        writableFinished: {
          __proto__: null,
          get() {
            return this._writableState ? this._writableState.finished : false;
          }
        },
        writableObjectMode: {
          __proto__: null,
          get() {
            return this._writableState ? this._writableState.objectMode : false;
          }
        },
        writableBuffer: {
          __proto__: null,
          get() {
            return this._writableState && this._writableState.getBuffer();
          }
        },
        writableEnded: {
          __proto__: null,
          get() {
            return this._writableState ? this._writableState.ending : false;
          }
        },
        writableNeedDrain: {
          __proto__: null,
          get() {
            const wState = this._writableState;
            if (!wState) return false;
            return !wState.destroyed && !wState.ending && wState.needDrain;
          }
        },
        writableHighWaterMark: {
          __proto__: null,
          get() {
            return this._writableState && this._writableState.highWaterMark;
          }
        },
        writableCorked: {
          __proto__: null,
          get() {
            return this._writableState ? this._writableState.corked : 0;
          }
        },
        writableLength: {
          __proto__: null,
          get() {
            return this._writableState && this._writableState.length;
          }
        },
        errored: {
          __proto__: null,
          enumerable: false,
          get() {
            return this._writableState ? this._writableState.errored : null;
          }
        },
        writableAborted: {
          __proto__: null,
          enumerable: false,
          get: function() {
            return !!(this._writableState.writable !== false && (this._writableState.destroyed || this._writableState.errored) && !this._writableState.finished);
          }
        }
      });
      var destroy = destroyImpl.destroy;
      Writable2.prototype.destroy = function(err2, cb) {
        const state = this._writableState;
        if (!state.destroyed && (state.bufferedIndex < state.buffered.length || state[kOnFinished].length)) {
          process2.nextTick(errorBuffer, state);
        }
        destroy.call(this, err2, cb);
        return this;
      };
      Writable2.prototype._undestroy = destroyImpl.undestroy;
      Writable2.prototype._destroy = function(err2, cb) {
        cb(err2);
      };
      Writable2.prototype[EE.captureRejectionSymbol] = function(err2) {
        this.destroy(err2);
      };
      var webStreamsAdapters;
      function lazyWebStreams() {
        if (webStreamsAdapters === void 0) webStreamsAdapters = {};
        return webStreamsAdapters;
      }
      Writable2.fromWeb = function(writableStream, options) {
        return lazyWebStreams().newStreamWritableFromWritableStream(writableStream, options);
      };
      Writable2.toWeb = function(streamWritable) {
        return lazyWebStreams().newWritableStreamFromStreamWritable(streamWritable);
      };
    }
  });

  // node_modules/readable-stream/lib/internal/streams/duplexify.js
  var require_duplexify = __commonJS({
    "node_modules/readable-stream/lib/internal/streams/duplexify.js"(exports, module) {
      "use strict";
      var process2 = require_browser2();
      var bufferModule = require_buffer();
      var {
        isReadable,
        isWritable,
        isIterable,
        isNodeStream,
        isReadableNodeStream,
        isWritableNodeStream,
        isDuplexNodeStream,
        isReadableStream,
        isWritableStream
      } = require_utils();
      var eos = require_end_of_stream();
      var {
        AbortError,
        codes: { ERR_INVALID_ARG_TYPE, ERR_INVALID_RETURN_VALUE }
      } = require_errors();
      var { destroyer } = require_destroy();
      var Duplex = require_duplex();
      var Readable2 = require_readable();
      var Writable2 = require_writable();
      var { createDeferredPromise } = require_util();
      var from2 = require_from();
      var Blob2 = globalThis.Blob || bufferModule.Blob;
      var isBlob = typeof Blob2 !== "undefined" ? function isBlob2(b) {
        return b instanceof Blob2;
      } : function isBlob2(b) {
        return false;
      };
      var AbortController2 = globalThis.AbortController || require_browser().AbortController;
      var { FunctionPrototypeCall } = require_primordials();
      var Duplexify = class extends Duplex {
        constructor(options) {
          super(options);
          if ((options === null || options === void 0 ? void 0 : options.readable) === false) {
            this._readableState.readable = false;
            this._readableState.ended = true;
            this._readableState.endEmitted = true;
          }
          if ((options === null || options === void 0 ? void 0 : options.writable) === false) {
            this._writableState.writable = false;
            this._writableState.ending = true;
            this._writableState.ended = true;
            this._writableState.finished = true;
          }
        }
      };
      module.exports = function duplexify(body, name) {
        if (isDuplexNodeStream(body)) {
          return body;
        }
        if (isReadableNodeStream(body)) {
          return _duplexify({
            readable: body
          });
        }
        if (isWritableNodeStream(body)) {
          return _duplexify({
            writable: body
          });
        }
        if (isNodeStream(body)) {
          return _duplexify({
            writable: false,
            readable: false
          });
        }
        if (isReadableStream(body)) {
          return _duplexify({
            readable: Readable2.fromWeb(body)
          });
        }
        if (isWritableStream(body)) {
          return _duplexify({
            writable: Writable2.fromWeb(body)
          });
        }
        if (typeof body === "function") {
          const { value, write: write2, final, destroy } = fromAsyncGen(body);
          if (isIterable(value)) {
            return from2(Duplexify, value, {
              // TODO (ronag): highWaterMark?
              objectMode: true,
              write: write2,
              final,
              destroy
            });
          }
          const then2 = value === null || value === void 0 ? void 0 : value.then;
          if (typeof then2 === "function") {
            let d;
            const promise = FunctionPrototypeCall(
              then2,
              value,
              (val) => {
                if (val != null) {
                  throw new ERR_INVALID_RETURN_VALUE("nully", "body", val);
                }
              },
              (err2) => {
                destroyer(d, err2);
              }
            );
            return d = new Duplexify({
              // TODO (ronag): highWaterMark?
              objectMode: true,
              readable: false,
              write: write2,
              final(cb) {
                final(async () => {
                  try {
                    await promise;
                    process2.nextTick(cb, null);
                  } catch (err2) {
                    process2.nextTick(cb, err2);
                  }
                });
              },
              destroy
            });
          }
          throw new ERR_INVALID_RETURN_VALUE("Iterable, AsyncIterable or AsyncFunction", name, value);
        }
        if (isBlob(body)) {
          return duplexify(body.arrayBuffer());
        }
        if (isIterable(body)) {
          return from2(Duplexify, body, {
            // TODO (ronag): highWaterMark?
            objectMode: true,
            writable: false
          });
        }
        if (isReadableStream(body === null || body === void 0 ? void 0 : body.readable) && isWritableStream(body === null || body === void 0 ? void 0 : body.writable)) {
          return Duplexify.fromWeb(body);
        }
        if (typeof (body === null || body === void 0 ? void 0 : body.writable) === "object" || typeof (body === null || body === void 0 ? void 0 : body.readable) === "object") {
          const readable = body !== null && body !== void 0 && body.readable ? isReadableNodeStream(body === null || body === void 0 ? void 0 : body.readable) ? body === null || body === void 0 ? void 0 : body.readable : duplexify(body.readable) : void 0;
          const writable = body !== null && body !== void 0 && body.writable ? isWritableNodeStream(body === null || body === void 0 ? void 0 : body.writable) ? body === null || body === void 0 ? void 0 : body.writable : duplexify(body.writable) : void 0;
          return _duplexify({
            readable,
            writable
          });
        }
        const then = body === null || body === void 0 ? void 0 : body.then;
        if (typeof then === "function") {
          let d;
          FunctionPrototypeCall(
            then,
            body,
            (val) => {
              if (val != null) {
                d.push(val);
              }
              d.push(null);
            },
            (err2) => {
              destroyer(d, err2);
            }
          );
          return d = new Duplexify({
            objectMode: true,
            writable: false,
            read() {
            }
          });
        }
        throw new ERR_INVALID_ARG_TYPE(
          name,
          [
            "Blob",
            "ReadableStream",
            "WritableStream",
            "Stream",
            "Iterable",
            "AsyncIterable",
            "Function",
            "{ readable, writable } pair",
            "Promise"
          ],
          body
        );
      };
      function fromAsyncGen(fn) {
        let { promise, resolve: resolve2 } = createDeferredPromise();
        const ac = new AbortController2();
        const signal = ac.signal;
        const value = fn(
          async function* () {
            while (true) {
              const _promise = promise;
              promise = null;
              const { chunk, done, cb } = await _promise;
              process2.nextTick(cb);
              if (done) return;
              if (signal.aborted)
                throw new AbortError(void 0, {
                  cause: signal.reason
                });
              ({ promise, resolve: resolve2 } = createDeferredPromise());
              yield chunk;
            }
          }(),
          {
            signal
          }
        );
        return {
          value,
          write(chunk, encoding, cb) {
            const _resolve2 = resolve2;
            resolve2 = null;
            _resolve2({
              chunk,
              done: false,
              cb
            });
          },
          final(cb) {
            const _resolve2 = resolve2;
            resolve2 = null;
            _resolve2({
              done: true,
              cb
            });
          },
          destroy(err2, cb) {
            ac.abort();
            cb(err2);
          }
        };
      }
      function _duplexify(pair) {
        const r = pair.readable && typeof pair.readable.read !== "function" ? Readable2.wrap(pair.readable) : pair.readable;
        const w = pair.writable;
        let readable = !!isReadable(r);
        let writable = !!isWritable(w);
        let ondrain;
        let onfinish;
        let onreadable;
        let onclose;
        let d;
        function onfinished(err2) {
          const cb = onclose;
          onclose = null;
          if (cb) {
            cb(err2);
          } else if (err2) {
            d.destroy(err2);
          }
        }
        d = new Duplexify({
          // TODO (ronag): highWaterMark?
          readableObjectMode: !!(r !== null && r !== void 0 && r.readableObjectMode),
          writableObjectMode: !!(w !== null && w !== void 0 && w.writableObjectMode),
          readable,
          writable
        });
        if (writable) {
          eos(w, (err2) => {
            writable = false;
            if (err2) {
              destroyer(r, err2);
            }
            onfinished(err2);
          });
          d._write = function(chunk, encoding, callback) {
            if (w.write(chunk, encoding)) {
              callback();
            } else {
              ondrain = callback;
            }
          };
          d._final = function(callback) {
            w.end();
            onfinish = callback;
          };
          w.on("drain", function() {
            if (ondrain) {
              const cb = ondrain;
              ondrain = null;
              cb();
            }
          });
          w.on("finish", function() {
            if (onfinish) {
              const cb = onfinish;
              onfinish = null;
              cb();
            }
          });
        }
        if (readable) {
          eos(r, (err2) => {
            readable = false;
            if (err2) {
              destroyer(r, err2);
            }
            onfinished(err2);
          });
          r.on("readable", function() {
            if (onreadable) {
              const cb = onreadable;
              onreadable = null;
              cb();
            }
          });
          r.on("end", function() {
            d.push(null);
          });
          d._read = function() {
            while (true) {
              const buf = r.read();
              if (buf === null) {
                onreadable = d._read;
                return;
              }
              if (!d.push(buf)) {
                return;
              }
            }
          };
        }
        d._destroy = function(err2, callback) {
          if (!err2 && onclose !== null) {
            err2 = new AbortError();
          }
          onreadable = null;
          ondrain = null;
          onfinish = null;
          if (onclose === null) {
            callback(err2);
          } else {
            onclose = callback;
            destroyer(w, err2);
            destroyer(r, err2);
          }
        };
        return d;
      }
    }
  });

  // node_modules/readable-stream/lib/internal/streams/duplex.js
  var require_duplex = __commonJS({
    "node_modules/readable-stream/lib/internal/streams/duplex.js"(exports, module) {
      "use strict";
      var {
        ObjectDefineProperties,
        ObjectGetOwnPropertyDescriptor,
        ObjectKeys,
        ObjectSetPrototypeOf
      } = require_primordials();
      module.exports = Duplex;
      var Readable2 = require_readable();
      var Writable2 = require_writable();
      ObjectSetPrototypeOf(Duplex.prototype, Readable2.prototype);
      ObjectSetPrototypeOf(Duplex, Readable2);
      {
        const keys = ObjectKeys(Writable2.prototype);
        for (let i = 0; i < keys.length; i++) {
          const method = keys[i];
          if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable2.prototype[method];
        }
      }
      function Duplex(options) {
        if (!(this instanceof Duplex)) return new Duplex(options);
        Readable2.call(this, options);
        Writable2.call(this, options);
        if (options) {
          this.allowHalfOpen = options.allowHalfOpen !== false;
          if (options.readable === false) {
            this._readableState.readable = false;
            this._readableState.ended = true;
            this._readableState.endEmitted = true;
          }
          if (options.writable === false) {
            this._writableState.writable = false;
            this._writableState.ending = true;
            this._writableState.ended = true;
            this._writableState.finished = true;
          }
        } else {
          this.allowHalfOpen = true;
        }
      }
      ObjectDefineProperties(Duplex.prototype, {
        writable: {
          __proto__: null,
          ...ObjectGetOwnPropertyDescriptor(Writable2.prototype, "writable")
        },
        writableHighWaterMark: {
          __proto__: null,
          ...ObjectGetOwnPropertyDescriptor(Writable2.prototype, "writableHighWaterMark")
        },
        writableObjectMode: {
          __proto__: null,
          ...ObjectGetOwnPropertyDescriptor(Writable2.prototype, "writableObjectMode")
        },
        writableBuffer: {
          __proto__: null,
          ...ObjectGetOwnPropertyDescriptor(Writable2.prototype, "writableBuffer")
        },
        writableLength: {
          __proto__: null,
          ...ObjectGetOwnPropertyDescriptor(Writable2.prototype, "writableLength")
        },
        writableFinished: {
          __proto__: null,
          ...ObjectGetOwnPropertyDescriptor(Writable2.prototype, "writableFinished")
        },
        writableCorked: {
          __proto__: null,
          ...ObjectGetOwnPropertyDescriptor(Writable2.prototype, "writableCorked")
        },
        writableEnded: {
          __proto__: null,
          ...ObjectGetOwnPropertyDescriptor(Writable2.prototype, "writableEnded")
        },
        writableNeedDrain: {
          __proto__: null,
          ...ObjectGetOwnPropertyDescriptor(Writable2.prototype, "writableNeedDrain")
        },
        destroyed: {
          __proto__: null,
          get() {
            if (this._readableState === void 0 || this._writableState === void 0) {
              return false;
            }
            return this._readableState.destroyed && this._writableState.destroyed;
          },
          set(value) {
            if (this._readableState && this._writableState) {
              this._readableState.destroyed = value;
              this._writableState.destroyed = value;
            }
          }
        }
      });
      var webStreamsAdapters;
      function lazyWebStreams() {
        if (webStreamsAdapters === void 0) webStreamsAdapters = {};
        return webStreamsAdapters;
      }
      Duplex.fromWeb = function(pair, options) {
        return lazyWebStreams().newStreamDuplexFromReadableWritablePair(pair, options);
      };
      Duplex.toWeb = function(duplex) {
        return lazyWebStreams().newReadableWritablePairFromDuplex(duplex);
      };
      var duplexify;
      Duplex.from = function(body) {
        if (!duplexify) {
          duplexify = require_duplexify();
        }
        return duplexify(body, "body");
      };
    }
  });

  // node_modules/readable-stream/lib/internal/streams/transform.js
  var require_transform = __commonJS({
    "node_modules/readable-stream/lib/internal/streams/transform.js"(exports, module) {
      "use strict";
      var { ObjectSetPrototypeOf, Symbol: Symbol2 } = require_primordials();
      module.exports = Transform;
      var { ERR_METHOD_NOT_IMPLEMENTED } = require_errors().codes;
      var Duplex = require_duplex();
      var { getHighWaterMark } = require_state();
      ObjectSetPrototypeOf(Transform.prototype, Duplex.prototype);
      ObjectSetPrototypeOf(Transform, Duplex);
      var kCallback = Symbol2("kCallback");
      function Transform(options) {
        if (!(this instanceof Transform)) return new Transform(options);
        const readableHighWaterMark = options ? getHighWaterMark(this, options, "readableHighWaterMark", true) : null;
        if (readableHighWaterMark === 0) {
          options = {
            ...options,
            highWaterMark: null,
            readableHighWaterMark,
            // TODO (ronag): 0 is not optimal since we have
            // a "bug" where we check needDrain before calling _write and not after.
            // Refs: https://github.com/nodejs/node/pull/32887
            // Refs: https://github.com/nodejs/node/pull/35941
            writableHighWaterMark: options.writableHighWaterMark || 0
          };
        }
        Duplex.call(this, options);
        this._readableState.sync = false;
        this[kCallback] = null;
        if (options) {
          if (typeof options.transform === "function") this._transform = options.transform;
          if (typeof options.flush === "function") this._flush = options.flush;
        }
        this.on("prefinish", prefinish);
      }
      function final(cb) {
        if (typeof this._flush === "function" && !this.destroyed) {
          this._flush((er, data) => {
            if (er) {
              if (cb) {
                cb(er);
              } else {
                this.destroy(er);
              }
              return;
            }
            if (data != null) {
              this.push(data);
            }
            this.push(null);
            if (cb) {
              cb();
            }
          });
        } else {
          this.push(null);
          if (cb) {
            cb();
          }
        }
      }
      function prefinish() {
        if (this._final !== final) {
          final.call(this);
        }
      }
      Transform.prototype._final = final;
      Transform.prototype._transform = function(chunk, encoding, callback) {
        throw new ERR_METHOD_NOT_IMPLEMENTED("_transform()");
      };
      Transform.prototype._write = function(chunk, encoding, callback) {
        const rState = this._readableState;
        const wState = this._writableState;
        const length = rState.length;
        this._transform(chunk, encoding, (err2, val) => {
          if (err2) {
            callback(err2);
            return;
          }
          if (val != null) {
            this.push(val);
          }
          if (wState.ended || // Backwards compat.
          length === rState.length || // Backwards compat.
          rState.length < rState.highWaterMark) {
            callback();
          } else {
            this[kCallback] = callback;
          }
        });
      };
      Transform.prototype._read = function() {
        if (this[kCallback]) {
          const callback = this[kCallback];
          this[kCallback] = null;
          callback();
        }
      };
    }
  });

  // node_modules/readable-stream/lib/internal/streams/passthrough.js
  var require_passthrough = __commonJS({
    "node_modules/readable-stream/lib/internal/streams/passthrough.js"(exports, module) {
      "use strict";
      var { ObjectSetPrototypeOf } = require_primordials();
      module.exports = PassThrough;
      var Transform = require_transform();
      ObjectSetPrototypeOf(PassThrough.prototype, Transform.prototype);
      ObjectSetPrototypeOf(PassThrough, Transform);
      function PassThrough(options) {
        if (!(this instanceof PassThrough)) return new PassThrough(options);
        Transform.call(this, options);
      }
      PassThrough.prototype._transform = function(chunk, encoding, cb) {
        cb(null, chunk);
      };
    }
  });

  // node_modules/readable-stream/lib/internal/streams/pipeline.js
  var require_pipeline = __commonJS({
    "node_modules/readable-stream/lib/internal/streams/pipeline.js"(exports, module) {
      "use strict";
      var process2 = require_browser2();
      var { ArrayIsArray, Promise: Promise2, SymbolAsyncIterator, SymbolDispose } = require_primordials();
      var eos = require_end_of_stream();
      var { once } = require_util();
      var destroyImpl = require_destroy();
      var Duplex = require_duplex();
      var {
        aggregateTwoErrors,
        codes: {
          ERR_INVALID_ARG_TYPE,
          ERR_INVALID_RETURN_VALUE,
          ERR_MISSING_ARGS,
          ERR_STREAM_DESTROYED,
          ERR_STREAM_PREMATURE_CLOSE
        },
        AbortError
      } = require_errors();
      var { validateFunction, validateAbortSignal } = require_validators();
      var {
        isIterable,
        isReadable,
        isReadableNodeStream,
        isNodeStream,
        isTransformStream,
        isWebStream,
        isReadableStream,
        isReadableFinished
      } = require_utils();
      var AbortController2 = globalThis.AbortController || require_browser().AbortController;
      var PassThrough;
      var Readable2;
      var addAbortListener;
      function destroyer(stream, reading, writing) {
        let finished = false;
        stream.on("close", () => {
          finished = true;
        });
        const cleanup = eos(
          stream,
          {
            readable: reading,
            writable: writing
          },
          (err2) => {
            finished = !err2;
          }
        );
        return {
          destroy: (err2) => {
            if (finished) return;
            finished = true;
            destroyImpl.destroyer(stream, err2 || new ERR_STREAM_DESTROYED("pipe"));
          },
          cleanup
        };
      }
      function popCallback(streams) {
        validateFunction(streams[streams.length - 1], "streams[stream.length - 1]");
        return streams.pop();
      }
      function makeAsyncIterable(val) {
        if (isIterable(val)) {
          return val;
        } else if (isReadableNodeStream(val)) {
          return fromReadable(val);
        }
        throw new ERR_INVALID_ARG_TYPE("val", ["Readable", "Iterable", "AsyncIterable"], val);
      }
      async function* fromReadable(val) {
        if (!Readable2) {
          Readable2 = require_readable();
        }
        yield* Readable2.prototype[SymbolAsyncIterator].call(val);
      }
      async function pumpToNode(iterable, writable, finish, { end }) {
        let error;
        let onresolve = null;
        const resume = (err2) => {
          if (err2) {
            error = err2;
          }
          if (onresolve) {
            const callback = onresolve;
            onresolve = null;
            callback();
          }
        };
        const wait = () => new Promise2((resolve2, reject) => {
          if (error) {
            reject(error);
          } else {
            onresolve = () => {
              if (error) {
                reject(error);
              } else {
                resolve2();
              }
            };
          }
        });
        writable.on("drain", resume);
        const cleanup = eos(
          writable,
          {
            readable: false
          },
          resume
        );
        try {
          if (writable.writableNeedDrain) {
            await wait();
          }
          for await (const chunk of iterable) {
            if (!writable.write(chunk)) {
              await wait();
            }
          }
          if (end) {
            writable.end();
            await wait();
          }
          finish();
        } catch (err2) {
          finish(error !== err2 ? aggregateTwoErrors(error, err2) : err2);
        } finally {
          cleanup();
          writable.off("drain", resume);
        }
      }
      async function pumpToWeb(readable, writable, finish, { end }) {
        if (isTransformStream(writable)) {
          writable = writable.writable;
        }
        const writer = writable.getWriter();
        try {
          for await (const chunk of readable) {
            await writer.ready;
            writer.write(chunk).catch(() => {
            });
          }
          await writer.ready;
          if (end) {
            await writer.close();
          }
          finish();
        } catch (err2) {
          try {
            await writer.abort(err2);
            finish(err2);
          } catch (err3) {
            finish(err3);
          }
        }
      }
      function pipeline(...streams) {
        return pipelineImpl(streams, once(popCallback(streams)));
      }
      function pipelineImpl(streams, callback, opts) {
        if (streams.length === 1 && ArrayIsArray(streams[0])) {
          streams = streams[0];
        }
        if (streams.length < 2) {
          throw new ERR_MISSING_ARGS("streams");
        }
        const ac = new AbortController2();
        const signal = ac.signal;
        const outerSignal = opts === null || opts === void 0 ? void 0 : opts.signal;
        const lastStreamCleanup = [];
        validateAbortSignal(outerSignal, "options.signal");
        function abort() {
          finishImpl(new AbortError());
        }
        addAbortListener = addAbortListener || require_util().addAbortListener;
        let disposable;
        if (outerSignal) {
          disposable = addAbortListener(outerSignal, abort);
        }
        let error;
        let value;
        const destroys = [];
        let finishCount = 0;
        function finish(err2) {
          finishImpl(err2, --finishCount === 0);
        }
        function finishImpl(err2, final) {
          var _disposable;
          if (err2 && (!error || error.code === "ERR_STREAM_PREMATURE_CLOSE")) {
            error = err2;
          }
          if (!error && !final) {
            return;
          }
          while (destroys.length) {
            destroys.shift()(error);
          }
          ;
          (_disposable = disposable) === null || _disposable === void 0 ? void 0 : _disposable[SymbolDispose]();
          ac.abort();
          if (final) {
            if (!error) {
              lastStreamCleanup.forEach((fn) => fn());
            }
            process2.nextTick(callback, error, value);
          }
        }
        let ret;
        for (let i = 0; i < streams.length; i++) {
          const stream = streams[i];
          const reading = i < streams.length - 1;
          const writing = i > 0;
          const end = reading || (opts === null || opts === void 0 ? void 0 : opts.end) !== false;
          const isLastStream = i === streams.length - 1;
          if (isNodeStream(stream)) {
            let onError2 = function(err2) {
              if (err2 && err2.name !== "AbortError" && err2.code !== "ERR_STREAM_PREMATURE_CLOSE") {
                finish(err2);
              }
            };
            var onError = onError2;
            if (end) {
              const { destroy, cleanup } = destroyer(stream, reading, writing);
              destroys.push(destroy);
              if (isReadable(stream) && isLastStream) {
                lastStreamCleanup.push(cleanup);
              }
            }
            stream.on("error", onError2);
            if (isReadable(stream) && isLastStream) {
              lastStreamCleanup.push(() => {
                stream.removeListener("error", onError2);
              });
            }
          }
          if (i === 0) {
            if (typeof stream === "function") {
              ret = stream({
                signal
              });
              if (!isIterable(ret)) {
                throw new ERR_INVALID_RETURN_VALUE("Iterable, AsyncIterable or Stream", "source", ret);
              }
            } else if (isIterable(stream) || isReadableNodeStream(stream) || isTransformStream(stream)) {
              ret = stream;
            } else {
              ret = Duplex.from(stream);
            }
          } else if (typeof stream === "function") {
            if (isTransformStream(ret)) {
              var _ret;
              ret = makeAsyncIterable((_ret = ret) === null || _ret === void 0 ? void 0 : _ret.readable);
            } else {
              ret = makeAsyncIterable(ret);
            }
            ret = stream(ret, {
              signal
            });
            if (reading) {
              if (!isIterable(ret, true)) {
                throw new ERR_INVALID_RETURN_VALUE("AsyncIterable", `transform[${i - 1}]`, ret);
              }
            } else {
              var _ret2;
              if (!PassThrough) {
                PassThrough = require_passthrough();
              }
              const pt = new PassThrough({
                objectMode: true
              });
              const then = (_ret2 = ret) === null || _ret2 === void 0 ? void 0 : _ret2.then;
              if (typeof then === "function") {
                finishCount++;
                then.call(
                  ret,
                  (val) => {
                    value = val;
                    if (val != null) {
                      pt.write(val);
                    }
                    if (end) {
                      pt.end();
                    }
                    process2.nextTick(finish);
                  },
                  (err2) => {
                    pt.destroy(err2);
                    process2.nextTick(finish, err2);
                  }
                );
              } else if (isIterable(ret, true)) {
                finishCount++;
                pumpToNode(ret, pt, finish, {
                  end
                });
              } else if (isReadableStream(ret) || isTransformStream(ret)) {
                const toRead = ret.readable || ret;
                finishCount++;
                pumpToNode(toRead, pt, finish, {
                  end
                });
              } else {
                throw new ERR_INVALID_RETURN_VALUE("AsyncIterable or Promise", "destination", ret);
              }
              ret = pt;
              const { destroy, cleanup } = destroyer(ret, false, true);
              destroys.push(destroy);
              if (isLastStream) {
                lastStreamCleanup.push(cleanup);
              }
            }
          } else if (isNodeStream(stream)) {
            if (isReadableNodeStream(ret)) {
              finishCount += 2;
              const cleanup = pipe(ret, stream, finish, {
                end
              });
              if (isReadable(stream) && isLastStream) {
                lastStreamCleanup.push(cleanup);
              }
            } else if (isTransformStream(ret) || isReadableStream(ret)) {
              const toRead = ret.readable || ret;
              finishCount++;
              pumpToNode(toRead, stream, finish, {
                end
              });
            } else if (isIterable(ret)) {
              finishCount++;
              pumpToNode(ret, stream, finish, {
                end
              });
            } else {
              throw new ERR_INVALID_ARG_TYPE(
                "val",
                ["Readable", "Iterable", "AsyncIterable", "ReadableStream", "TransformStream"],
                ret
              );
            }
            ret = stream;
          } else if (isWebStream(stream)) {
            if (isReadableNodeStream(ret)) {
              finishCount++;
              pumpToWeb(makeAsyncIterable(ret), stream, finish, {
                end
              });
            } else if (isReadableStream(ret) || isIterable(ret)) {
              finishCount++;
              pumpToWeb(ret, stream, finish, {
                end
              });
            } else if (isTransformStream(ret)) {
              finishCount++;
              pumpToWeb(ret.readable, stream, finish, {
                end
              });
            } else {
              throw new ERR_INVALID_ARG_TYPE(
                "val",
                ["Readable", "Iterable", "AsyncIterable", "ReadableStream", "TransformStream"],
                ret
              );
            }
            ret = stream;
          } else {
            ret = Duplex.from(stream);
          }
        }
        if (signal !== null && signal !== void 0 && signal.aborted || outerSignal !== null && outerSignal !== void 0 && outerSignal.aborted) {
          process2.nextTick(abort);
        }
        return ret;
      }
      function pipe(src, dst, finish, { end }) {
        let ended = false;
        dst.on("close", () => {
          if (!ended) {
            finish(new ERR_STREAM_PREMATURE_CLOSE());
          }
        });
        src.pipe(dst, {
          end: false
        });
        if (end) {
          let endFn2 = function() {
            ended = true;
            dst.end();
          };
          var endFn = endFn2;
          if (isReadableFinished(src)) {
            process2.nextTick(endFn2);
          } else {
            src.once("end", endFn2);
          }
        } else {
          finish();
        }
        eos(
          src,
          {
            readable: true,
            writable: false
          },
          (err2) => {
            const rState = src._readableState;
            if (err2 && err2.code === "ERR_STREAM_PREMATURE_CLOSE" && rState && rState.ended && !rState.errored && !rState.errorEmitted) {
              src.once("end", finish).once("error", finish);
            } else {
              finish(err2);
            }
          }
        );
        return eos(
          dst,
          {
            readable: false,
            writable: true
          },
          finish
        );
      }
      module.exports = {
        pipelineImpl,
        pipeline
      };
    }
  });

  // node_modules/readable-stream/lib/internal/streams/compose.js
  var require_compose = __commonJS({
    "node_modules/readable-stream/lib/internal/streams/compose.js"(exports, module) {
      "use strict";
      var { pipeline } = require_pipeline();
      var Duplex = require_duplex();
      var { destroyer } = require_destroy();
      var {
        isNodeStream,
        isReadable,
        isWritable,
        isWebStream,
        isTransformStream,
        isWritableStream,
        isReadableStream
      } = require_utils();
      var {
        AbortError,
        codes: { ERR_INVALID_ARG_VALUE, ERR_MISSING_ARGS }
      } = require_errors();
      var eos = require_end_of_stream();
      module.exports = function compose(...streams) {
        if (streams.length === 0) {
          throw new ERR_MISSING_ARGS("streams");
        }
        if (streams.length === 1) {
          return Duplex.from(streams[0]);
        }
        const orgStreams = [...streams];
        if (typeof streams[0] === "function") {
          streams[0] = Duplex.from(streams[0]);
        }
        if (typeof streams[streams.length - 1] === "function") {
          const idx = streams.length - 1;
          streams[idx] = Duplex.from(streams[idx]);
        }
        for (let n = 0; n < streams.length; ++n) {
          if (!isNodeStream(streams[n]) && !isWebStream(streams[n])) {
            continue;
          }
          if (n < streams.length - 1 && !(isReadable(streams[n]) || isReadableStream(streams[n]) || isTransformStream(streams[n]))) {
            throw new ERR_INVALID_ARG_VALUE(`streams[${n}]`, orgStreams[n], "must be readable");
          }
          if (n > 0 && !(isWritable(streams[n]) || isWritableStream(streams[n]) || isTransformStream(streams[n]))) {
            throw new ERR_INVALID_ARG_VALUE(`streams[${n}]`, orgStreams[n], "must be writable");
          }
        }
        let ondrain;
        let onfinish;
        let onreadable;
        let onclose;
        let d;
        function onfinished(err2) {
          const cb = onclose;
          onclose = null;
          if (cb) {
            cb(err2);
          } else if (err2) {
            d.destroy(err2);
          } else if (!readable && !writable) {
            d.destroy();
          }
        }
        const head = streams[0];
        const tail = pipeline(streams, onfinished);
        const writable = !!(isWritable(head) || isWritableStream(head) || isTransformStream(head));
        const readable = !!(isReadable(tail) || isReadableStream(tail) || isTransformStream(tail));
        d = new Duplex({
          // TODO (ronag): highWaterMark?
          writableObjectMode: !!(head !== null && head !== void 0 && head.writableObjectMode),
          readableObjectMode: !!(tail !== null && tail !== void 0 && tail.readableObjectMode),
          writable,
          readable
        });
        if (writable) {
          if (isNodeStream(head)) {
            d._write = function(chunk, encoding, callback) {
              if (head.write(chunk, encoding)) {
                callback();
              } else {
                ondrain = callback;
              }
            };
            d._final = function(callback) {
              head.end();
              onfinish = callback;
            };
            head.on("drain", function() {
              if (ondrain) {
                const cb = ondrain;
                ondrain = null;
                cb();
              }
            });
          } else if (isWebStream(head)) {
            const writable2 = isTransformStream(head) ? head.writable : head;
            const writer = writable2.getWriter();
            d._write = async function(chunk, encoding, callback) {
              try {
                await writer.ready;
                writer.write(chunk).catch(() => {
                });
                callback();
              } catch (err2) {
                callback(err2);
              }
            };
            d._final = async function(callback) {
              try {
                await writer.ready;
                writer.close().catch(() => {
                });
                onfinish = callback;
              } catch (err2) {
                callback(err2);
              }
            };
          }
          const toRead = isTransformStream(tail) ? tail.readable : tail;
          eos(toRead, () => {
            if (onfinish) {
              const cb = onfinish;
              onfinish = null;
              cb();
            }
          });
        }
        if (readable) {
          if (isNodeStream(tail)) {
            tail.on("readable", function() {
              if (onreadable) {
                const cb = onreadable;
                onreadable = null;
                cb();
              }
            });
            tail.on("end", function() {
              d.push(null);
            });
            d._read = function() {
              while (true) {
                const buf = tail.read();
                if (buf === null) {
                  onreadable = d._read;
                  return;
                }
                if (!d.push(buf)) {
                  return;
                }
              }
            };
          } else if (isWebStream(tail)) {
            const readable2 = isTransformStream(tail) ? tail.readable : tail;
            const reader = readable2.getReader();
            d._read = async function() {
              while (true) {
                try {
                  const { value, done } = await reader.read();
                  if (!d.push(value)) {
                    return;
                  }
                  if (done) {
                    d.push(null);
                    return;
                  }
                } catch {
                  return;
                }
              }
            };
          }
        }
        d._destroy = function(err2, callback) {
          if (!err2 && onclose !== null) {
            err2 = new AbortError();
          }
          onreadable = null;
          ondrain = null;
          onfinish = null;
          if (onclose === null) {
            callback(err2);
          } else {
            onclose = callback;
            if (isNodeStream(tail)) {
              destroyer(tail, err2);
            }
          }
        };
        return d;
      };
    }
  });

  // node_modules/readable-stream/lib/internal/streams/operators.js
  var require_operators = __commonJS({
    "node_modules/readable-stream/lib/internal/streams/operators.js"(exports, module) {
      "use strict";
      var AbortController2 = globalThis.AbortController || require_browser().AbortController;
      var {
        codes: { ERR_INVALID_ARG_VALUE, ERR_INVALID_ARG_TYPE, ERR_MISSING_ARGS, ERR_OUT_OF_RANGE },
        AbortError
      } = require_errors();
      var { validateAbortSignal, validateInteger, validateObject } = require_validators();
      var kWeakHandler = require_primordials().Symbol("kWeak");
      var kResistStopPropagation = require_primordials().Symbol("kResistStopPropagation");
      var { finished } = require_end_of_stream();
      var staticCompose = require_compose();
      var { addAbortSignalNoValidate } = require_add_abort_signal();
      var { isWritable, isNodeStream } = require_utils();
      var { deprecate } = require_util();
      var {
        ArrayPrototypePush,
        Boolean: Boolean2,
        MathFloor,
        Number: Number2,
        NumberIsNaN,
        Promise: Promise2,
        PromiseReject,
        PromiseResolve,
        PromisePrototypeThen,
        Symbol: Symbol2
      } = require_primordials();
      var kEmpty = Symbol2("kEmpty");
      var kEof = Symbol2("kEof");
      function compose(stream, options) {
        if (options != null) {
          validateObject(options, "options");
        }
        if ((options === null || options === void 0 ? void 0 : options.signal) != null) {
          validateAbortSignal(options.signal, "options.signal");
        }
        if (isNodeStream(stream) && !isWritable(stream)) {
          throw new ERR_INVALID_ARG_VALUE("stream", stream, "must be writable");
        }
        const composedStream = staticCompose(this, stream);
        if (options !== null && options !== void 0 && options.signal) {
          addAbortSignalNoValidate(options.signal, composedStream);
        }
        return composedStream;
      }
      function map(fn, options) {
        if (typeof fn !== "function") {
          throw new ERR_INVALID_ARG_TYPE("fn", ["Function", "AsyncFunction"], fn);
        }
        if (options != null) {
          validateObject(options, "options");
        }
        if ((options === null || options === void 0 ? void 0 : options.signal) != null) {
          validateAbortSignal(options.signal, "options.signal");
        }
        let concurrency = 1;
        if ((options === null || options === void 0 ? void 0 : options.concurrency) != null) {
          concurrency = MathFloor(options.concurrency);
        }
        let highWaterMark = concurrency - 1;
        if ((options === null || options === void 0 ? void 0 : options.highWaterMark) != null) {
          highWaterMark = MathFloor(options.highWaterMark);
        }
        validateInteger(concurrency, "options.concurrency", 1);
        validateInteger(highWaterMark, "options.highWaterMark", 0);
        highWaterMark += concurrency;
        return async function* map2() {
          const signal = require_util().AbortSignalAny(
            [options === null || options === void 0 ? void 0 : options.signal].filter(Boolean2)
          );
          const stream = this;
          const queue = [];
          const signalOpt = {
            signal
          };
          let next;
          let resume;
          let done = false;
          let cnt = 0;
          function onCatch() {
            done = true;
            afterItemProcessed();
          }
          function afterItemProcessed() {
            cnt -= 1;
            maybeResume();
          }
          function maybeResume() {
            if (resume && !done && cnt < concurrency && queue.length < highWaterMark) {
              resume();
              resume = null;
            }
          }
          async function pump() {
            try {
              for await (let val of stream) {
                if (done) {
                  return;
                }
                if (signal.aborted) {
                  throw new AbortError();
                }
                try {
                  val = fn(val, signalOpt);
                  if (val === kEmpty) {
                    continue;
                  }
                  val = PromiseResolve(val);
                } catch (err2) {
                  val = PromiseReject(err2);
                }
                cnt += 1;
                PromisePrototypeThen(val, afterItemProcessed, onCatch);
                queue.push(val);
                if (next) {
                  next();
                  next = null;
                }
                if (!done && (queue.length >= highWaterMark || cnt >= concurrency)) {
                  await new Promise2((resolve2) => {
                    resume = resolve2;
                  });
                }
              }
              queue.push(kEof);
            } catch (err2) {
              const val = PromiseReject(err2);
              PromisePrototypeThen(val, afterItemProcessed, onCatch);
              queue.push(val);
            } finally {
              done = true;
              if (next) {
                next();
                next = null;
              }
            }
          }
          pump();
          try {
            while (true) {
              while (queue.length > 0) {
                const val = await queue[0];
                if (val === kEof) {
                  return;
                }
                if (signal.aborted) {
                  throw new AbortError();
                }
                if (val !== kEmpty) {
                  yield val;
                }
                queue.shift();
                maybeResume();
              }
              await new Promise2((resolve2) => {
                next = resolve2;
              });
            }
          } finally {
            done = true;
            if (resume) {
              resume();
              resume = null;
            }
          }
        }.call(this);
      }
      function asIndexedPairs(options = void 0) {
        if (options != null) {
          validateObject(options, "options");
        }
        if ((options === null || options === void 0 ? void 0 : options.signal) != null) {
          validateAbortSignal(options.signal, "options.signal");
        }
        return async function* asIndexedPairs2() {
          let index = 0;
          for await (const val of this) {
            var _options$signal;
            if (options !== null && options !== void 0 && (_options$signal = options.signal) !== null && _options$signal !== void 0 && _options$signal.aborted) {
              throw new AbortError({
                cause: options.signal.reason
              });
            }
            yield [index++, val];
          }
        }.call(this);
      }
      async function some(fn, options = void 0) {
        for await (const unused of filter.call(this, fn, options)) {
          return true;
        }
        return false;
      }
      async function every(fn, options = void 0) {
        if (typeof fn !== "function") {
          throw new ERR_INVALID_ARG_TYPE("fn", ["Function", "AsyncFunction"], fn);
        }
        return !await some.call(
          this,
          async (...args) => {
            return !await fn(...args);
          },
          options
        );
      }
      async function find(fn, options) {
        for await (const result of filter.call(this, fn, options)) {
          return result;
        }
        return void 0;
      }
      async function forEach(fn, options) {
        if (typeof fn !== "function") {
          throw new ERR_INVALID_ARG_TYPE("fn", ["Function", "AsyncFunction"], fn);
        }
        async function forEachFn(value, options2) {
          await fn(value, options2);
          return kEmpty;
        }
        for await (const unused of map.call(this, forEachFn, options)) ;
      }
      function filter(fn, options) {
        if (typeof fn !== "function") {
          throw new ERR_INVALID_ARG_TYPE("fn", ["Function", "AsyncFunction"], fn);
        }
        async function filterFn(value, options2) {
          if (await fn(value, options2)) {
            return value;
          }
          return kEmpty;
        }
        return map.call(this, filterFn, options);
      }
      var ReduceAwareErrMissingArgs = class extends ERR_MISSING_ARGS {
        constructor() {
          super("reduce");
          this.message = "Reduce of an empty stream requires an initial value";
        }
      };
      async function reduce(reducer, initialValue, options) {
        var _options$signal2;
        if (typeof reducer !== "function") {
          throw new ERR_INVALID_ARG_TYPE("reducer", ["Function", "AsyncFunction"], reducer);
        }
        if (options != null) {
          validateObject(options, "options");
        }
        if ((options === null || options === void 0 ? void 0 : options.signal) != null) {
          validateAbortSignal(options.signal, "options.signal");
        }
        let hasInitialValue = arguments.length > 1;
        if (options !== null && options !== void 0 && (_options$signal2 = options.signal) !== null && _options$signal2 !== void 0 && _options$signal2.aborted) {
          const err2 = new AbortError(void 0, {
            cause: options.signal.reason
          });
          this.once("error", () => {
          });
          await finished(this.destroy(err2));
          throw err2;
        }
        const ac = new AbortController2();
        const signal = ac.signal;
        if (options !== null && options !== void 0 && options.signal) {
          const opts = {
            once: true,
            [kWeakHandler]: this,
            [kResistStopPropagation]: true
          };
          options.signal.addEventListener("abort", () => ac.abort(), opts);
        }
        let gotAnyItemFromStream = false;
        try {
          for await (const value of this) {
            var _options$signal3;
            gotAnyItemFromStream = true;
            if (options !== null && options !== void 0 && (_options$signal3 = options.signal) !== null && _options$signal3 !== void 0 && _options$signal3.aborted) {
              throw new AbortError();
            }
            if (!hasInitialValue) {
              initialValue = value;
              hasInitialValue = true;
            } else {
              initialValue = await reducer(initialValue, value, {
                signal
              });
            }
          }
          if (!gotAnyItemFromStream && !hasInitialValue) {
            throw new ReduceAwareErrMissingArgs();
          }
        } finally {
          ac.abort();
        }
        return initialValue;
      }
      async function toArray(options) {
        if (options != null) {
          validateObject(options, "options");
        }
        if ((options === null || options === void 0 ? void 0 : options.signal) != null) {
          validateAbortSignal(options.signal, "options.signal");
        }
        const result = [];
        for await (const val of this) {
          var _options$signal4;
          if (options !== null && options !== void 0 && (_options$signal4 = options.signal) !== null && _options$signal4 !== void 0 && _options$signal4.aborted) {
            throw new AbortError(void 0, {
              cause: options.signal.reason
            });
          }
          ArrayPrototypePush(result, val);
        }
        return result;
      }
      function flatMap(fn, options) {
        const values = map.call(this, fn, options);
        return async function* flatMap2() {
          for await (const val of values) {
            yield* val;
          }
        }.call(this);
      }
      function toIntegerOrInfinity(number) {
        number = Number2(number);
        if (NumberIsNaN(number)) {
          return 0;
        }
        if (number < 0) {
          throw new ERR_OUT_OF_RANGE("number", ">= 0", number);
        }
        return number;
      }
      function drop(number, options = void 0) {
        if (options != null) {
          validateObject(options, "options");
        }
        if ((options === null || options === void 0 ? void 0 : options.signal) != null) {
          validateAbortSignal(options.signal, "options.signal");
        }
        number = toIntegerOrInfinity(number);
        return async function* drop2() {
          var _options$signal5;
          if (options !== null && options !== void 0 && (_options$signal5 = options.signal) !== null && _options$signal5 !== void 0 && _options$signal5.aborted) {
            throw new AbortError();
          }
          for await (const val of this) {
            var _options$signal6;
            if (options !== null && options !== void 0 && (_options$signal6 = options.signal) !== null && _options$signal6 !== void 0 && _options$signal6.aborted) {
              throw new AbortError();
            }
            if (number-- <= 0) {
              yield val;
            }
          }
        }.call(this);
      }
      function take(number, options = void 0) {
        if (options != null) {
          validateObject(options, "options");
        }
        if ((options === null || options === void 0 ? void 0 : options.signal) != null) {
          validateAbortSignal(options.signal, "options.signal");
        }
        number = toIntegerOrInfinity(number);
        return async function* take2() {
          var _options$signal7;
          if (options !== null && options !== void 0 && (_options$signal7 = options.signal) !== null && _options$signal7 !== void 0 && _options$signal7.aborted) {
            throw new AbortError();
          }
          for await (const val of this) {
            var _options$signal8;
            if (options !== null && options !== void 0 && (_options$signal8 = options.signal) !== null && _options$signal8 !== void 0 && _options$signal8.aborted) {
              throw new AbortError();
            }
            if (number-- > 0) {
              yield val;
            }
            if (number <= 0) {
              return;
            }
          }
        }.call(this);
      }
      module.exports.streamReturningOperators = {
        asIndexedPairs: deprecate(asIndexedPairs, "readable.asIndexedPairs will be removed in a future version."),
        drop,
        filter,
        flatMap,
        map,
        take,
        compose
      };
      module.exports.promiseReturningOperators = {
        every,
        forEach,
        reduce,
        toArray,
        some,
        find
      };
    }
  });

  // node_modules/readable-stream/lib/stream/promises.js
  var require_promises = __commonJS({
    "node_modules/readable-stream/lib/stream/promises.js"(exports, module) {
      "use strict";
      var { ArrayPrototypePop, Promise: Promise2 } = require_primordials();
      var { isIterable, isNodeStream, isWebStream } = require_utils();
      var { pipelineImpl: pl } = require_pipeline();
      var { finished } = require_end_of_stream();
      require_stream();
      function pipeline(...streams) {
        return new Promise2((resolve2, reject) => {
          let signal;
          let end;
          const lastArg = streams[streams.length - 1];
          if (lastArg && typeof lastArg === "object" && !isNodeStream(lastArg) && !isIterable(lastArg) && !isWebStream(lastArg)) {
            const options = ArrayPrototypePop(streams);
            signal = options.signal;
            end = options.end;
          }
          pl(
            streams,
            (err2, value) => {
              if (err2) {
                reject(err2);
              } else {
                resolve2(value);
              }
            },
            {
              signal,
              end
            }
          );
        });
      }
      module.exports = {
        finished,
        pipeline
      };
    }
  });

  // node_modules/readable-stream/lib/stream.js
  var require_stream = __commonJS({
    "node_modules/readable-stream/lib/stream.js"(exports, module) {
      "use strict";
      var { Buffer: Buffer7 } = require_buffer();
      var { ObjectDefineProperty, ObjectKeys, ReflectApply } = require_primordials();
      var {
        promisify: { custom: customPromisify }
      } = require_util();
      var { streamReturningOperators, promiseReturningOperators } = require_operators();
      var {
        codes: { ERR_ILLEGAL_CONSTRUCTOR }
      } = require_errors();
      var compose = require_compose();
      var { setDefaultHighWaterMark, getDefaultHighWaterMark } = require_state();
      var { pipeline } = require_pipeline();
      var { destroyer } = require_destroy();
      var eos = require_end_of_stream();
      var promises = require_promises();
      var utils = require_utils();
      var Stream = module.exports = require_legacy().Stream;
      Stream.isDestroyed = utils.isDestroyed;
      Stream.isDisturbed = utils.isDisturbed;
      Stream.isErrored = utils.isErrored;
      Stream.isReadable = utils.isReadable;
      Stream.isWritable = utils.isWritable;
      Stream.Readable = require_readable();
      for (const key of ObjectKeys(streamReturningOperators)) {
        let fn = function(...args) {
          if (new.target) {
            throw ERR_ILLEGAL_CONSTRUCTOR();
          }
          return Stream.Readable.from(ReflectApply(op, this, args));
        };
        const op = streamReturningOperators[key];
        ObjectDefineProperty(fn, "name", {
          __proto__: null,
          value: op.name
        });
        ObjectDefineProperty(fn, "length", {
          __proto__: null,
          value: op.length
        });
        ObjectDefineProperty(Stream.Readable.prototype, key, {
          __proto__: null,
          value: fn,
          enumerable: false,
          configurable: true,
          writable: true
        });
      }
      for (const key of ObjectKeys(promiseReturningOperators)) {
        let fn = function(...args) {
          if (new.target) {
            throw ERR_ILLEGAL_CONSTRUCTOR();
          }
          return ReflectApply(op, this, args);
        };
        const op = promiseReturningOperators[key];
        ObjectDefineProperty(fn, "name", {
          __proto__: null,
          value: op.name
        });
        ObjectDefineProperty(fn, "length", {
          __proto__: null,
          value: op.length
        });
        ObjectDefineProperty(Stream.Readable.prototype, key, {
          __proto__: null,
          value: fn,
          enumerable: false,
          configurable: true,
          writable: true
        });
      }
      Stream.Writable = require_writable();
      Stream.Duplex = require_duplex();
      Stream.Transform = require_transform();
      Stream.PassThrough = require_passthrough();
      Stream.pipeline = pipeline;
      var { addAbortSignal } = require_add_abort_signal();
      Stream.addAbortSignal = addAbortSignal;
      Stream.finished = eos;
      Stream.destroy = destroyer;
      Stream.compose = compose;
      Stream.setDefaultHighWaterMark = setDefaultHighWaterMark;
      Stream.getDefaultHighWaterMark = getDefaultHighWaterMark;
      ObjectDefineProperty(Stream, "promises", {
        __proto__: null,
        configurable: true,
        enumerable: true,
        get() {
          return promises;
        }
      });
      ObjectDefineProperty(pipeline, customPromisify, {
        __proto__: null,
        enumerable: true,
        get() {
          return promises.pipeline;
        }
      });
      ObjectDefineProperty(eos, customPromisify, {
        __proto__: null,
        enumerable: true,
        get() {
          return promises.finished;
        }
      });
      Stream.Stream = Stream;
      Stream._isUint8Array = function isUint8Array(value) {
        return value instanceof Uint8Array;
      };
      Stream._uint8ArrayToBuffer = function _uint8ArrayToBuffer(chunk) {
        return Buffer7.from(chunk.buffer, chunk.byteOffset, chunk.byteLength);
      };
    }
  });

  // node_modules/readable-stream/lib/ours/browser.js
  var require_browser3 = __commonJS({
    "node_modules/readable-stream/lib/ours/browser.js"(exports, module) {
      "use strict";
      var CustomStream = require_stream();
      var promises = require_promises();
      var originalDestroy = CustomStream.Readable.destroy;
      module.exports = CustomStream.Readable;
      module.exports._uint8ArrayToBuffer = CustomStream._uint8ArrayToBuffer;
      module.exports._isUint8Array = CustomStream._isUint8Array;
      module.exports.isDisturbed = CustomStream.isDisturbed;
      module.exports.isErrored = CustomStream.isErrored;
      module.exports.isReadable = CustomStream.isReadable;
      module.exports.Readable = CustomStream.Readable;
      module.exports.Writable = CustomStream.Writable;
      module.exports.Duplex = CustomStream.Duplex;
      module.exports.Transform = CustomStream.Transform;
      module.exports.PassThrough = CustomStream.PassThrough;
      module.exports.addAbortSignal = CustomStream.addAbortSignal;
      module.exports.finished = CustomStream.finished;
      module.exports.destroy = CustomStream.destroy;
      module.exports.destroy = originalDestroy;
      module.exports.pipeline = CustomStream.pipeline;
      module.exports.compose = CustomStream.compose;
      Object.defineProperty(CustomStream, "promises", {
        configurable: true,
        enumerable: true,
        get() {
          return promises;
        }
      });
      module.exports.Stream = CustomStream.Stream;
      module.exports.default = module.exports;
    }
  });

  // src/index.ts
  var src_exports = {};
  __export(src_exports, {
    AuthenticationError: () => AuthenticationError,
    DirectoryNotFoundError: () => DirectoryNotFoundError,
    FileExistsError: () => FileExistsError,
    FileNotFoundError: () => FileNotFoundError,
    PermissionDeniedError: () => PermissionDeniedError,
    RemoteStorageError: () => RemoteStorageError,
    RemoteStorageFileSystem: () => RemoteStorageFileSystem,
    adaptFileSystem: () => adaptFileSystem,
    arrayBufferToUint8Array: () => arrayBufferToUint8Array,
    createRemoteStorageFileSystem: () => createRemoteStorageFileSystem,
    createUniversalSyncFileSystem: () => createUniversalSyncFileSystem,
    default: () => src_default,
    ensureDirectoryPath: () => ensureDirectoryPath,
    getBasename: () => getBasename,
    getCurrentTimestamp: () => getCurrentTimestamp,
    getParentPath: () => getParentPath,
    isBinaryContentType: () => isBinaryContentType,
    isDirectoryPath: () => isDirectoryPath,
    isMtimeSidecar: () => isMtimeSidecar,
    isValidPath: () => isValidPath,
    joinPath: () => joinPath,
    mtimePathFor: () => mtimePathFor,
    normalizePath: () => normalizePath2,
    stringToUint8Array: () => stringToUint8Array,
    toUint8Array: () => toUint8Array,
    uint8ArrayToString: () => uint8ArrayToString
  });

  // node_modules/eventemitter3/index.mjs
  var import_index = __toESM(require_eventemitter3(), 1);

  // node_modules/utilium/dist/list.js
  var List = class extends import_index.default {
    [Symbol.toStringTag] = "List";
    constructor(values) {
      super();
      if (values) {
        this.push(...values);
      }
    }
    data = /* @__PURE__ */ new Set();
    toSet() {
      return new Set(this.data);
    }
    toArray() {
      return Array.from(this.data);
    }
    toJSON() {
      return Array.from(this.data);
    }
    toString() {
      return this.join(",");
    }
    _set(index, value, _delete = false) {
      if (Math.abs(index) > this.data.size) {
        throw new ReferenceError("Can not set an element outside the bounds of the list");
      }
      const data = Array.from(this.data);
      data.splice(index, +_delete, value);
      this.data = new Set(data);
      this.emit("update");
    }
    set(index, value) {
      this._set(index, value, true);
    }
    deleteAt(index) {
      if (Math.abs(index) > this.data.size) {
        throw new ReferenceError("Can not delete an element outside the bounds of the list");
      }
      this.delete(Array.from(this.data).at(index));
    }
    insert(value, index = this.data.size) {
      this._set(index, value, false);
    }
    // Array methods
    at(index) {
      if (Math.abs(index) > this.data.size) {
        throw new ReferenceError("Can not access an element outside the bounds of the list");
      }
      return Array.from(this.data).at(index);
    }
    pop() {
      const item = Array.from(this.data).pop();
      if (item !== void 0) {
        this.delete(item);
      }
      return item;
    }
    push(...items) {
      for (const item of items) {
        this.add(item);
      }
      return this.data.size;
    }
    join(separator) {
      return Array.from(this.data).join(separator);
    }
    splice(start, deleteCount, ...items) {
      if (Math.abs(start) > this.data.size) {
        throw new ReferenceError("Can not splice elements outside the bounds of the list");
      }
      const data = Array.from(this.data);
      const deleted = data.splice(start, deleteCount, ...items);
      this.data = new Set(data);
      this.emit("update");
      return deleted;
    }
    // Set methods
    add(value) {
      this.data.add(value);
      this.emit("update");
      this.emit("add", value);
      return this;
    }
    clear() {
      this.data.clear();
      this.emit("update");
    }
    delete(value) {
      const success = this.data.delete(value);
      this.emit("update");
      return success;
    }
    has(value) {
      return this.data.has(value);
    }
    get size() {
      return this.data.size;
    }
    // Iteration
    entries() {
      return this.toArray().entries();
    }
    keys() {
      return this.toArray().keys();
    }
    values() {
      return this.data.values();
    }
    [Symbol.iterator]() {
      return this.data[Symbol.iterator]();
    }
  };

  // node_modules/utilium/dist/objects.js
  function filterObject(object, predicate) {
    const entries2 = Object.entries(object);
    return Object.fromEntries(entries2.filter(([key, value]) => predicate(key, value)));
  }
  function pick(object, ...keys) {
    const picked = {};
    for (const key of keys.flat()) {
      picked[key] = object[key];
    }
    return picked;
  }
  function omit(object, ...keys) {
    return filterObject(object, (key) => !keys.flat().includes(key));
  }
  function isJSON(str) {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  }
  function resolveConstructors(object) {
    const constructors = [];
    for (let prototype = object; prototype && !["Function", "Object"].includes(prototype.constructor.name); prototype = Object.getPrototypeOf(prototype)) {
      constructors.push(prototype.constructor.name);
    }
    return constructors;
  }

  // node_modules/utilium/dist/misc.js
  function canary(error = new Error()) {
    const timeout = setTimeout(() => {
      throw error;
    }, 5e3);
    return () => clearTimeout(timeout);
  }
  function _throw(e) {
    if (e && typeof e == "object" && resolveConstructors(e).includes("Error"))
      Error?.captureStackTrace(e, _throw);
    throw e;
  }

  // node_modules/utilium/dist/numbers.js
  var __formatter = Intl.NumberFormat("en", { notation: "compact" });
  var formatCompact = __formatter.format.bind(__formatter);

  // node_modules/utilium/dist/random.js
  function randomInt(min = 0, max = 1) {
    return Math.round(Math.random() * (max - min) + min);
  }

  // node_modules/utilium/dist/string.js
  function capitalize(value) {
    return value.at(0).toUpperCase() + value.slice(1);
  }
  var encoder = new TextEncoder();
  function encodeUTF8(input) {
    return encoder.encode(input);
  }
  var decoder = new TextDecoder();
  function decodeUTF8(input) {
    if (!input)
      return "";
    if (input.buffer instanceof ArrayBuffer && !input.buffer.resizable)
      return decoder.decode(input);
    const buffer = new Uint8Array(input.byteLength);
    buffer.set(input);
    return decoder.decode(buffer);
  }
  function encodeUUID(uuid) {
    const hex = uuid.replace(/-/g, "");
    const data = new Uint8Array(16);
    for (let i = 0; i < 16; i++) {
      data[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    }
    return data;
  }

  // node_modules/kerium/dist/error.js
  var Errno;
  (function(Errno2) {
    Errno2[Errno2["EPERM"] = 1] = "EPERM";
    Errno2[Errno2["ENOENT"] = 2] = "ENOENT";
    Errno2[Errno2["ESRCH"] = 3] = "ESRCH";
    Errno2[Errno2["EINTR"] = 4] = "EINTR";
    Errno2[Errno2["EIO"] = 5] = "EIO";
    Errno2[Errno2["ENXIO"] = 6] = "ENXIO";
    Errno2[Errno2["E2BIG"] = 7] = "E2BIG";
    Errno2[Errno2["ENOEXEC"] = 8] = "ENOEXEC";
    Errno2[Errno2["EBADF"] = 9] = "EBADF";
    Errno2[Errno2["ECHILD"] = 10] = "ECHILD";
    Errno2[Errno2["EAGAIN"] = 11] = "EAGAIN";
    Errno2[Errno2["ENOMEM"] = 12] = "ENOMEM";
    Errno2[Errno2["EACCES"] = 13] = "EACCES";
    Errno2[Errno2["EFAULT"] = 14] = "EFAULT";
    Errno2[Errno2["ENOTBLK"] = 15] = "ENOTBLK";
    Errno2[Errno2["EBUSY"] = 16] = "EBUSY";
    Errno2[Errno2["EEXIST"] = 17] = "EEXIST";
    Errno2[Errno2["EXDEV"] = 18] = "EXDEV";
    Errno2[Errno2["ENODEV"] = 19] = "ENODEV";
    Errno2[Errno2["ENOTDIR"] = 20] = "ENOTDIR";
    Errno2[Errno2["EISDIR"] = 21] = "EISDIR";
    Errno2[Errno2["EINVAL"] = 22] = "EINVAL";
    Errno2[Errno2["ENFILE"] = 23] = "ENFILE";
    Errno2[Errno2["EMFILE"] = 24] = "EMFILE";
    Errno2[Errno2["ETXTBSY"] = 26] = "ETXTBSY";
    Errno2[Errno2["EFBIG"] = 27] = "EFBIG";
    Errno2[Errno2["ENOSPC"] = 28] = "ENOSPC";
    Errno2[Errno2["ESPIPE"] = 29] = "ESPIPE";
    Errno2[Errno2["EROFS"] = 30] = "EROFS";
    Errno2[Errno2["EMLINK"] = 31] = "EMLINK";
    Errno2[Errno2["EPIPE"] = 32] = "EPIPE";
    Errno2[Errno2["EDOM"] = 33] = "EDOM";
    Errno2[Errno2["ERANGE"] = 34] = "ERANGE";
    Errno2[Errno2["EDEADLK"] = 35] = "EDEADLK";
    Errno2[Errno2["ENAMETOOLONG"] = 36] = "ENAMETOOLONG";
    Errno2[Errno2["ENOLCK"] = 37] = "ENOLCK";
    Errno2[Errno2["ENOSYS"] = 38] = "ENOSYS";
    Errno2[Errno2["ENOTEMPTY"] = 39] = "ENOTEMPTY";
    Errno2[Errno2["ELOOP"] = 40] = "ELOOP";
    Errno2[Errno2["ENOMSG"] = 42] = "ENOMSG";
    Errno2[Errno2["EIDRM"] = 43] = "EIDRM";
    Errno2[Errno2["ECHRNG"] = 44] = "ECHRNG";
    Errno2[Errno2["EL2NSYNC"] = 45] = "EL2NSYNC";
    Errno2[Errno2["EL3HLT"] = 46] = "EL3HLT";
    Errno2[Errno2["EL3RST"] = 47] = "EL3RST";
    Errno2[Errno2["ENRNG"] = 48] = "ENRNG";
    Errno2[Errno2["EUNATCH"] = 49] = "EUNATCH";
    Errno2[Errno2["ECSI"] = 50] = "ECSI";
    Errno2[Errno2["EL2HLT"] = 51] = "EL2HLT";
    Errno2[Errno2["EBADE"] = 52] = "EBADE";
    Errno2[Errno2["EBADR"] = 53] = "EBADR";
    Errno2[Errno2["EXFULL"] = 54] = "EXFULL";
    Errno2[Errno2["ENOANO"] = 55] = "ENOANO";
    Errno2[Errno2["EBADRQC"] = 56] = "EBADRQC";
    Errno2[Errno2["EBADSLT"] = 57] = "EBADSLT";
    Errno2[Errno2["EBFONT"] = 59] = "EBFONT";
    Errno2[Errno2["ENOSTR"] = 60] = "ENOSTR";
    Errno2[Errno2["ENODATA"] = 61] = "ENODATA";
    Errno2[Errno2["ETIME"] = 62] = "ETIME";
    Errno2[Errno2["ENOSR"] = 63] = "ENOSR";
    Errno2[Errno2["ENONET"] = 64] = "ENONET";
    Errno2[Errno2["ENOPKG"] = 65] = "ENOPKG";
    Errno2[Errno2["EREMOTE"] = 66] = "EREMOTE";
    Errno2[Errno2["ENOLINK"] = 67] = "ENOLINK";
    Errno2[Errno2["EADV"] = 68] = "EADV";
    Errno2[Errno2["ESRMNT"] = 69] = "ESRMNT";
    Errno2[Errno2["ECOMM"] = 70] = "ECOMM";
    Errno2[Errno2["EPROTO"] = 71] = "EPROTO";
    Errno2[Errno2["EMULTIHOP"] = 72] = "EMULTIHOP";
    Errno2[Errno2["EDOTDOT"] = 73] = "EDOTDOT";
    Errno2[Errno2["EBADMSG"] = 74] = "EBADMSG";
    Errno2[Errno2["EOVERFLOW"] = 75] = "EOVERFLOW";
    Errno2[Errno2["ENOTUNIQ"] = 76] = "ENOTUNIQ";
    Errno2[Errno2["EBADFD"] = 77] = "EBADFD";
    Errno2[Errno2["EREMCHG"] = 78] = "EREMCHG";
    Errno2[Errno2["ELIBACC"] = 79] = "ELIBACC";
    Errno2[Errno2["ELIBBAD"] = 80] = "ELIBBAD";
    Errno2[Errno2["ELIBSCN"] = 81] = "ELIBSCN";
    Errno2[Errno2["ELIBMAX"] = 82] = "ELIBMAX";
    Errno2[Errno2["ELIBEXEC"] = 83] = "ELIBEXEC";
    Errno2[Errno2["EILSEQ"] = 84] = "EILSEQ";
    Errno2[Errno2["ERESTART"] = 85] = "ERESTART";
    Errno2[Errno2["ESTRPIPE"] = 86] = "ESTRPIPE";
    Errno2[Errno2["EUSERS"] = 87] = "EUSERS";
    Errno2[Errno2["ENOTSOCK"] = 88] = "ENOTSOCK";
    Errno2[Errno2["EDESTADDRREQ"] = 89] = "EDESTADDRREQ";
    Errno2[Errno2["EMSGSIZE"] = 90] = "EMSGSIZE";
    Errno2[Errno2["EPROTOTYPE"] = 91] = "EPROTOTYPE";
    Errno2[Errno2["ENOPROTOOPT"] = 92] = "ENOPROTOOPT";
    Errno2[Errno2["EPROTONOSUPPORT"] = 93] = "EPROTONOSUPPORT";
    Errno2[Errno2["ESOCKTNOSUPPORT"] = 94] = "ESOCKTNOSUPPORT";
    Errno2[Errno2["ENOTSUP"] = 95] = "ENOTSUP";
    Errno2[Errno2["EPFNOSUPPORT"] = 96] = "EPFNOSUPPORT";
    Errno2[Errno2["EAFNOSUPPORT"] = 97] = "EAFNOSUPPORT";
    Errno2[Errno2["EADDRINUSE"] = 98] = "EADDRINUSE";
    Errno2[Errno2["EADDRNOTAVAIL"] = 99] = "EADDRNOTAVAIL";
    Errno2[Errno2["ENETDOWN"] = 100] = "ENETDOWN";
    Errno2[Errno2["ENETUNREACH"] = 101] = "ENETUNREACH";
    Errno2[Errno2["ENETRESET"] = 102] = "ENETRESET";
    Errno2[Errno2["ECONNABORTED"] = 103] = "ECONNABORTED";
    Errno2[Errno2["ECONNRESET"] = 104] = "ECONNRESET";
    Errno2[Errno2["ENOBUFS"] = 105] = "ENOBUFS";
    Errno2[Errno2["EISCONN"] = 106] = "EISCONN";
    Errno2[Errno2["ENOTCONN"] = 107] = "ENOTCONN";
    Errno2[Errno2["ESHUTDOWN"] = 108] = "ESHUTDOWN";
    Errno2[Errno2["ETOOMANYREFS"] = 109] = "ETOOMANYREFS";
    Errno2[Errno2["ETIMEDOUT"] = 110] = "ETIMEDOUT";
    Errno2[Errno2["ECONNREFUSED"] = 111] = "ECONNREFUSED";
    Errno2[Errno2["EHOSTDOWN"] = 112] = "EHOSTDOWN";
    Errno2[Errno2["EHOSTUNREACH"] = 113] = "EHOSTUNREACH";
    Errno2[Errno2["EALREADY"] = 114] = "EALREADY";
    Errno2[Errno2["EINPROGRESS"] = 115] = "EINPROGRESS";
    Errno2[Errno2["ESTALE"] = 116] = "ESTALE";
    Errno2[Errno2["EEUCLEAN"] = 117] = "EEUCLEAN";
    Errno2[Errno2["ENOTNAM"] = 118] = "ENOTNAM";
    Errno2[Errno2["ENAVAIL"] = 119] = "ENAVAIL";
    Errno2[Errno2["EISNAM"] = 120] = "EISNAM";
    Errno2[Errno2["EREMOTEIO"] = 121] = "EREMOTEIO";
    Errno2[Errno2["EDQUOT"] = 122] = "EDQUOT";
    Errno2[Errno2["ENOMEDIUM"] = 123] = "ENOMEDIUM";
    Errno2[Errno2["EMEDIUMTYPE"] = 124] = "EMEDIUMTYPE";
    Errno2[Errno2["ECANCELED"] = 125] = "ECANCELED";
    Errno2[Errno2["ENOKEY"] = 126] = "ENOKEY";
    Errno2[Errno2["EKEYEXPIRED"] = 127] = "EKEYEXPIRED";
    Errno2[Errno2["EKEYREVOKED"] = 128] = "EKEYREVOKED";
    Errno2[Errno2["EKEYREJECTED"] = 129] = "EKEYREJECTED";
    Errno2[Errno2["EOWNERDEAD"] = 130] = "EOWNERDEAD";
    Errno2[Errno2["ENOTRECOVERABLE"] = 131] = "ENOTRECOVERABLE";
    Errno2[Errno2["ERFKILL"] = 132] = "ERFKILL";
    Errno2[Errno2["EHWPOISON"] = 133] = "EHWPOISON";
  })(Errno || (Errno = {}));
  var errnoMessages = {
    [Errno.EPERM]: "Operation not permitted",
    [Errno.ENOENT]: "No such file or directory",
    [Errno.ESRCH]: "No such process",
    [Errno.EINTR]: "Interrupted system call",
    [Errno.EIO]: "Input/output error",
    [Errno.ENXIO]: "No such device or address",
    [Errno.E2BIG]: "Argument list too long",
    [Errno.ENOEXEC]: "Exec format error",
    [Errno.EBADF]: "Bad file descriptor",
    [Errno.ECHILD]: "No child processes",
    [Errno.EAGAIN]: "Resource temporarily unavailable",
    [Errno.ENOMEM]: "Out of memory",
    [Errno.EACCES]: "Permission denied",
    [Errno.EFAULT]: "Bad address",
    [Errno.ENOTBLK]: "Block device required",
    [Errno.EBUSY]: "Resource busy or locked",
    [Errno.EEXIST]: "File exists",
    [Errno.EXDEV]: "Invalid cross-device link",
    [Errno.ENODEV]: "No such device",
    [Errno.ENOTDIR]: "File is not a directory",
    [Errno.EISDIR]: "File is a directory",
    [Errno.EINVAL]: "Invalid argument",
    [Errno.ENFILE]: "Too many open files in system",
    [Errno.EMFILE]: "Too many open files",
    [Errno.ETXTBSY]: "Text file busy",
    [Errno.EFBIG]: "File is too big",
    [Errno.ENOSPC]: "No space left on disk",
    [Errno.ESPIPE]: "Illegal seek",
    [Errno.EROFS]: "Cannot modify a read-only file system",
    [Errno.EMLINK]: "Too many links",
    [Errno.EPIPE]: "Broken pipe",
    [Errno.EDOM]: "Numerical argument out of domain",
    [Errno.ERANGE]: "Numerical result out of range",
    [Errno.EDEADLK]: "Resource deadlock would occur",
    [Errno.ENAMETOOLONG]: "File name too long",
    [Errno.ENOLCK]: "No locks available",
    [Errno.ENOSYS]: "Function not implemented",
    [Errno.ENOTEMPTY]: "Directory is not empty",
    [Errno.ELOOP]: "Too many levels of symbolic links",
    [Errno.ENOMSG]: "No message of desired type",
    [Errno.EIDRM]: "Identifier removed",
    [Errno.ECHRNG]: "Channel number out of range",
    [Errno.EL2NSYNC]: "Level 2 not synchronized",
    [Errno.EL3HLT]: "Level 3 halted",
    [Errno.EL3RST]: "Level 3 reset",
    [Errno.ENRNG]: "Link number out of range",
    [Errno.EUNATCH]: "Protocol driver not attached",
    [Errno.ECSI]: "No CSI structure available",
    [Errno.EL2HLT]: "Level 2 halted",
    [Errno.EBADE]: "Invalid exchange",
    [Errno.EBADR]: "Invalid request descriptor",
    [Errno.EXFULL]: "Exchange full",
    [Errno.ENOANO]: "No anode",
    [Errno.EBADRQC]: "Invalid request code",
    [Errno.EBADSLT]: "Invalid slot",
    [Errno.EBFONT]: "Bad font file format",
    [Errno.ENOSTR]: "Device not a stream",
    [Errno.ENODATA]: "No data available",
    [Errno.ETIME]: "Timer expired",
    [Errno.ENOSR]: "Out of streams resources",
    [Errno.ENONET]: "Machine is not on the network",
    [Errno.ENOPKG]: "Package not installed",
    [Errno.EREMOTE]: "Object is remote",
    [Errno.ENOLINK]: "Link has been severed",
    [Errno.EADV]: "Advertise error",
    [Errno.ESRMNT]: "Srmount error",
    [Errno.ECOMM]: "Communication error on send",
    [Errno.EPROTO]: "Protocol error",
    [Errno.EMULTIHOP]: "Multihop attempted",
    [Errno.EDOTDOT]: "RFS specific error",
    [Errno.EBADMSG]: "Bad message",
    [Errno.EOVERFLOW]: "Value too large for defined data type",
    [Errno.ENOTUNIQ]: "Name not unique on network",
    [Errno.EBADFD]: "File descriptor in bad state",
    [Errno.EREMCHG]: "Remote address changed",
    [Errno.ELIBACC]: "Can not access a needed shared library",
    [Errno.ELIBBAD]: "Accessing a corrupted shared library",
    [Errno.ELIBSCN]: ".lib section in a.out corrupted",
    [Errno.ELIBMAX]: "Attempting to link in too many shared libraries",
    [Errno.ELIBEXEC]: "Cannot exec a shared library directly",
    [Errno.EILSEQ]: "Invalid or incomplete multibyte or wide character",
    [Errno.ERESTART]: "Interrupted system call should be restarted",
    [Errno.ESTRPIPE]: "Streams pipe error",
    [Errno.EUSERS]: "Too many users",
    [Errno.ENOTSOCK]: "Socket operation on non-socket",
    [Errno.EDESTADDRREQ]: "Destination address required",
    [Errno.EMSGSIZE]: "Message too long",
    [Errno.EPROTOTYPE]: "Protocol wrong type for socket",
    [Errno.ENOPROTOOPT]: "Protocol not available",
    [Errno.EPROTONOSUPPORT]: "Protocol not supported",
    [Errno.ESOCKTNOSUPPORT]: "Socket type not supported",
    [Errno.ENOTSUP]: "Operation is not supported",
    [Errno.EPFNOSUPPORT]: "Protocol family not supported",
    [Errno.EAFNOSUPPORT]: "Address family not supported by protocol",
    [Errno.EADDRINUSE]: "Address already in use",
    [Errno.EADDRNOTAVAIL]: "Cannot assign requested address",
    [Errno.ENETDOWN]: "Network is down",
    [Errno.ENETUNREACH]: "Network is unreachable",
    [Errno.ENETRESET]: "Network dropped connection on reset",
    [Errno.ECONNABORTED]: "Software caused connection abort",
    [Errno.ECONNRESET]: "Connection reset by peer",
    [Errno.ENOBUFS]: "No buffer space available",
    [Errno.EISCONN]: "Transport endpoint is already connected",
    [Errno.ENOTCONN]: "Transport endpoint is not connected",
    [Errno.ESHUTDOWN]: "Cannot send after transport endpoint shutdown",
    [Errno.ETOOMANYREFS]: "Too many references: cannot splice",
    [Errno.ETIMEDOUT]: "Connection timed out",
    [Errno.ECONNREFUSED]: "Connection refused",
    [Errno.EHOSTDOWN]: "Host is down",
    [Errno.EHOSTUNREACH]: "No route to host",
    [Errno.EALREADY]: "Operation already in progress",
    [Errno.EINPROGRESS]: "Operation now in progress",
    [Errno.ESTALE]: "Stale file handle",
    [Errno.EEUCLEAN]: "Structure needs cleaning",
    [Errno.ENOTNAM]: "Not a XENIX named type file",
    [Errno.ENAVAIL]: "No XENIX semaphores available",
    [Errno.EISNAM]: "Is a named type file",
    [Errno.EREMOTEIO]: "Remote I/O error",
    [Errno.EDQUOT]: "Disk quota exceeded",
    [Errno.ENOMEDIUM]: "No medium found",
    [Errno.EMEDIUMTYPE]: "Wrong medium type",
    [Errno.ECANCELED]: "Operation canceled",
    [Errno.ENOKEY]: "Required key not available",
    [Errno.EKEYEXPIRED]: "Key has expired",
    [Errno.EKEYREVOKED]: "Key has been revoked",
    [Errno.EKEYREJECTED]: "Key was rejected by service",
    [Errno.EOWNERDEAD]: "Owner died",
    [Errno.ENOTRECOVERABLE]: "State not recoverable",
    [Errno.ERFKILL]: "Operation not possible due to RF-kill",
    [Errno.EHWPOISON]: "Memory page has hardware error"
  };
  function setUVMessage(ex) {
    let message = `${ex.code}: ${errnoMessages[ex.errno]}, ${ex.syscall}`;
    if (ex.path)
      message += ` '${ex.path}'`;
    if (ex.dest)
      message += ` -> '${ex.dest}'`;
    if (ex.message && !ex.message.startsWith(errnoMessages[ex.errno]))
      message += ` (${ex.message})`;
    ex.message = message;
    return ex;
  }
  var Exception = class _Exception extends Error {
    errno;
    code;
    path;
    dest;
    syscall;
    constructor(errno, message, ctx = {}) {
      const code = Errno[errno];
      super(message || "");
      this.errno = errno;
      this.code = code;
      Object.assign(this, omit(ctx, "message"));
      if (!message)
        setUVMessage(this);
      Error.captureStackTrace?.(this, this.constructor);
    }
    toString() {
      return this.message;
    }
    toJSON() {
      const json = {
        errno: this.errno,
        code: this.code,
        stack: this.stack,
        message: this.message
      };
      if (this.path)
        json.path = this.path;
      if (this.dest)
        json.dest = this.dest;
      if (this.syscall)
        json.syscall = this.syscall;
      return json;
    }
    static fromJSON(json) {
      const err2 = json.syscall ? new _Exception(json.errno, false, json) : new _Exception(json.errno, json.message);
      err2.stack = json.stack;
      return err2;
    }
  };
  function UV(code, context, path, dest) {
    if (typeof context === "string")
      context = { syscall: context, path, dest };
    const err2 = new Exception(Errno[code], false, context ?? {});
    Error.captureStackTrace?.(err2, UV);
    return err2;
  }
  function withErrno(code, message) {
    const err2 = new Exception(Errno[code], message ?? errnoMessages[Errno[code]]);
    Error.captureStackTrace?.(err2, withErrno);
    return err2;
  }
  function rethrow(extra, path, dest) {
    const ctx = typeof extra === "string" ? { syscall: extra } : extra;
    if (path)
      ctx.path = path;
    if (dest)
      ctx.dest = dest;
    return function(e) {
      Object.assign(e, ctx);
      setUVMessage(e);
      throw e;
    };
  }

  // node_modules/kerium/dist/log.js
  var Level;
  (function(Level2) {
    Level2[Level2["EMERG"] = 0] = "EMERG";
    Level2[Level2["ALERT"] = 1] = "ALERT";
    Level2[Level2["CRIT"] = 2] = "CRIT";
    Level2[Level2["ERR"] = 3] = "ERR";
    Level2[Level2["WARN"] = 4] = "WARN";
    Level2[Level2["NOTICE"] = 5] = "NOTICE";
    Level2[Level2["INFO"] = 6] = "INFO";
    Level2[Level2["DEBUG"] = 7] = "DEBUG";
  })(Level || (Level = {}));
  var entries = new List();
  function log(level, message) {
    if (!isEnabled)
      return;
    const entry = {
      level,
      message,
      timestamp: /* @__PURE__ */ new Date(),
      elapsedMs: performance.now()
    };
    entries.add(entry);
    output(entry);
  }
  function _shortcut(level) {
    return function(message) {
      log(level, message.toString());
      return message;
    };
  }
  var emerg = _shortcut(Level.EMERG);
  var alert = _shortcut(Level.ALERT);
  var crit = _shortcut(Level.CRIT);
  var err = _shortcut(Level.ERR);
  var warn = _shortcut(Level.WARN);
  var notice = _shortcut(Level.NOTICE);
  var info = _shortcut(Level.INFO);
  var debug = _shortcut(Level.DEBUG);
  function ansi(text, format3) {
    return `\x1B[${format3}m${text}\x1B[0m`;
  }
  function _prettyMs(entry, style) {
    const text = "[" + (entry.elapsedMs / 1e3).toFixed(3).padStart(10) + "] ";
    switch (style) {
      case "ansi":
        return [ansi(text, "2;37")];
      case "css":
        return ["%c" + text, "opacity: 0.8; color: white;"];
      default:
        return [text];
    }
  }
  var levelColor = {
    ansi: {
      [Level.EMERG]: "1;4;37;41",
      [Level.ALERT]: "1;37;41",
      [Level.CRIT]: "1;35",
      [Level.ERR]: "1;31",
      [Level.WARN]: "1;33",
      [Level.NOTICE]: "1;36",
      [Level.INFO]: "1;37",
      [Level.DEBUG]: "0;2;37"
    },
    css: {
      [Level.EMERG]: "font-weight: bold; text-decoration: underline; color: white; background-color: red;",
      [Level.ALERT]: "font-weight: bold; color: white; background-color: red;",
      [Level.CRIT]: "font-weight: bold; color: magenta;",
      [Level.ERR]: "font-weight: bold; color: red;",
      [Level.WARN]: "font-weight: bold; color: yellow;",
      [Level.NOTICE]: "font-weight: bold; color: cyan;",
      [Level.INFO]: "font-weight: bold; color: white;",
      [Level.DEBUG]: "opacity: 0.8; color: white;"
    }
  };
  var messageColor = {
    ansi: {
      [Level.EMERG]: "1;31",
      [Level.ALERT]: "1;31",
      [Level.CRIT]: "1;31",
      [Level.ERR]: "31",
      [Level.WARN]: "33",
      [Level.NOTICE]: "1;37",
      [Level.INFO]: "37",
      [Level.DEBUG]: "2;37"
    },
    css: {
      [Level.EMERG]: "font-weight: bold; color: red;",
      [Level.ALERT]: "font-weight: bold; color: red;",
      [Level.CRIT]: "font-weight: bold; color: red;",
      [Level.ERR]: "color: red;",
      [Level.WARN]: "color: yellow;",
      [Level.NOTICE]: "font-weight: bold; color: white;",
      [Level.INFO]: "color: white;",
      [Level.DEBUG]: "opacity: 0.8; color: white;"
    }
  };
  var _format = (entry) => [..._prettyMs(entry), entry.message];
  function format(entry) {
    const formatted = _format(entry);
    return typeof formatted == "string" ? [formatted] : Array.from(formatted);
  }
  var _output = console.error;
  function output(entry) {
    if (entry.level > minLevel)
      return;
    _output(...format(entry));
  }
  var minLevel = Level.ALERT;
  var isEnabled = true;

  // node_modules/@zenfs/core/dist/internal/credentials.js
  function createCredentials(source) {
    return {
      suid: source.uid,
      sgid: source.gid,
      euid: source.uid,
      egid: source.gid,
      groups: [],
      ...source
    };
  }
  function credentialsAllowRoot(cred) {
    if (!cred)
      return false;
    return !cred.uid || !cred.gid || !cred.euid || !cred.egid || cred.groups.some((gid) => !gid);
  }

  // node_modules/@zenfs/core/dist/internal/contexts.js
  var defaultContext = {
    id: 0,
    root: "/",
    pwd: "/",
    credentials: createCredentials({ uid: 0, gid: 0 }),
    descriptors: /* @__PURE__ */ new Map(),
    parent: null,
    children: []
  };

  // node_modules/@zenfs/core/dist/vfs/constants.js
  var constants_exports = {};
  __export(constants_exports, {
    COPYFILE_EXCL: () => COPYFILE_EXCL,
    COPYFILE_FICLONE: () => COPYFILE_FICLONE,
    COPYFILE_FICLONE_FORCE: () => COPYFILE_FICLONE_FORCE,
    F_OK: () => F_OK,
    O_APPEND: () => O_APPEND,
    O_CREAT: () => O_CREAT,
    O_DIRECT: () => O_DIRECT,
    O_DIRECTORY: () => O_DIRECTORY,
    O_DSYNC: () => O_DSYNC,
    O_EXCL: () => O_EXCL,
    O_NOATIME: () => O_NOATIME,
    O_NOCTTY: () => O_NOCTTY,
    O_NOFOLLOW: () => O_NOFOLLOW,
    O_NONBLOCK: () => O_NONBLOCK,
    O_RDONLY: () => O_RDONLY,
    O_RDWR: () => O_RDWR,
    O_SYMLINK: () => O_SYMLINK,
    O_SYNC: () => O_SYNC,
    O_TRUNC: () => O_TRUNC,
    O_WRONLY: () => O_WRONLY,
    R_OK: () => R_OK,
    S_IFBLK: () => S_IFBLK,
    S_IFCHR: () => S_IFCHR,
    S_IFDIR: () => S_IFDIR,
    S_IFIFO: () => S_IFIFO,
    S_IFLNK: () => S_IFLNK,
    S_IFMT: () => S_IFMT,
    S_IFREG: () => S_IFREG,
    S_IFSOCK: () => S_IFSOCK,
    S_IRGRP: () => S_IRGRP,
    S_IROTH: () => S_IROTH,
    S_IRUSR: () => S_IRUSR,
    S_IRWXG: () => S_IRWXG,
    S_IRWXO: () => S_IRWXO,
    S_IRWXU: () => S_IRWXU,
    S_ISGID: () => S_ISGID,
    S_ISUID: () => S_ISUID,
    S_ISVTX: () => S_ISVTX,
    S_IWGRP: () => S_IWGRP,
    S_IWOTH: () => S_IWOTH,
    S_IWUSR: () => S_IWUSR,
    S_IXGRP: () => S_IXGRP,
    S_IXOTH: () => S_IXOTH,
    S_IXUSR: () => S_IXUSR,
    UV_FS_O_FILEMAP: () => UV_FS_O_FILEMAP,
    W_OK: () => W_OK,
    X_OK: () => X_OK,
    size_max: () => size_max
  });
  var F_OK = 0;
  var R_OK = 4;
  var W_OK = 2;
  var X_OK = 1;
  var COPYFILE_EXCL = 1;
  var COPYFILE_FICLONE = 2;
  var COPYFILE_FICLONE_FORCE = 4;
  var O_RDONLY = 0;
  var O_WRONLY = 1;
  var O_RDWR = 2;
  var O_CREAT = 64;
  var O_EXCL = 128;
  var O_NOCTTY = 256;
  var O_TRUNC = 512;
  var O_APPEND = 1024;
  var O_DIRECTORY = 65536;
  var O_NOATIME = 262144;
  var O_NOFOLLOW = 131072;
  var O_SYNC = 1052672;
  var O_DSYNC = 4096;
  var O_SYMLINK = 32768;
  var O_DIRECT = 16384;
  var O_NONBLOCK = 2048;
  var S_IFMT = 61440;
  var S_IFSOCK = 49152;
  var S_IFLNK = 40960;
  var S_IFREG = 32768;
  var S_IFBLK = 24576;
  var S_IFDIR = 16384;
  var S_IFCHR = 8192;
  var S_IFIFO = 4096;
  var S_ISUID = 2048;
  var S_ISGID = 1024;
  var S_ISVTX = 512;
  var S_IRWXU = 448;
  var S_IRUSR = 256;
  var S_IWUSR = 128;
  var S_IXUSR = 64;
  var S_IRWXG = 56;
  var S_IRGRP = 32;
  var S_IWGRP = 16;
  var S_IXGRP = 8;
  var S_IRWXO = 7;
  var S_IROTH = 4;
  var S_IWOTH = 2;
  var S_IXOTH = 1;
  var UV_FS_O_FILEMAP = 0;
  var size_max = 4294967295;

  // node_modules/memium/dist/internal.js
  Symbol.metadata ??= Symbol.for("Symbol.metadata");
  function initMetadata(context) {
    context.metadata ??= {};
    const existing = context.metadata.structInit ?? {};
    context.metadata.structInit = {
      fields: [...existing.fields ?? []]
    };
    return context.metadata.structInit;
  }
  function isValidMetadata(arg) {
    return arg != null && typeof arg == "object" && "struct" in arg;
  }
  function isStatic(arg) {
    return typeof arg == "function" && Symbol.metadata in arg && isValidMetadata(arg[Symbol.metadata]);
  }
  function isInstance(arg) {
    return arg != null && typeof arg == "object" && isStatic(arg.constructor);
  }
  function isStruct(arg) {
    return isInstance(arg) || isStatic(arg);
  }
  function checkStruct(arg) {
    if (isStruct(arg))
      return;
    throw new TypeError((typeof arg == "function" ? arg.name : typeof arg == "object" && arg ? arg.constructor.name : arg) + " is not a struct");
  }

  // node_modules/memium/dist/types.js
  function isType(type) {
    return (typeof type == "object" || typeof type == "function") && type != null && "name" in type && "size" in type && "get" in type && "set" in type && typeof type.name == "string" && typeof type.size == "number" && typeof type.get == "function" && typeof type.set == "function" && typeRegistry.has(type.name) && typeRegistry.get(type.name)?.name === type.name;
  }
  var typeRegistry = /* @__PURE__ */ new Map();
  function registerType(t) {
    if (typeRegistry.has(t.name))
      throw new ReferenceError(`Type is already registered: ${t.name}`);
    typeRegistry.set(t.name, t);
  }

  // node_modules/memium/dist/primitives.js
  var __view__ = Symbol("DataView");
  function view(buffer) {
    buffer[__view__] ??= new DataView(buffer);
    return buffer[__view__];
  }
  var types = {
    int8: {
      name: "int8",
      size: 1,
      array: Int8Array,
      get: (buffer, offset) => view(buffer).getInt8(offset),
      set: (buffer, offset, value) => view(buffer).setInt8(offset, value)
    },
    uint8: {
      name: "uint8",
      size: 1,
      array: Uint8Array,
      get: (buffer, offset) => view(buffer).getUint8(offset),
      set: (buffer, offset, value) => view(buffer).setUint8(offset, value)
    },
    int16: {
      name: "int16",
      size: 2,
      array: Int16Array,
      get: (buffer, offset) => view(buffer).getInt16(offset, true),
      set: (buffer, offset, value) => view(buffer).setInt16(offset, value, true)
    },
    uint16: {
      name: "uint16",
      size: 2,
      array: Uint16Array,
      get: (buffer, offset) => view(buffer).getUint16(offset, true),
      set: (buffer, offset, value) => view(buffer).setUint16(offset, value, true)
    },
    int32: {
      name: "int32",
      size: 4,
      array: Int32Array,
      get: (buffer, offset) => view(buffer).getInt32(offset, true),
      set: (buffer, offset, value) => view(buffer).setInt32(offset, value, true)
    },
    uint32: {
      name: "uint32",
      size: 4,
      array: Uint32Array,
      get: (buffer, offset) => view(buffer).getUint32(offset, true),
      set: (buffer, offset, value) => view(buffer).setUint32(offset, value, true)
    },
    int64: {
      name: "int64",
      size: 8,
      array: BigInt64Array,
      get: (buffer, offset) => view(buffer).getBigInt64(offset, true),
      set: (buffer, offset, value) => view(buffer).setBigInt64(offset, value, true)
    },
    uint64: {
      name: "uint64",
      size: 8,
      array: BigUint64Array,
      get: (buffer, offset) => view(buffer).getBigUint64(offset, true),
      set: (buffer, offset, value) => view(buffer).setBigUint64(offset, value, true)
    },
    float32: {
      name: "float32",
      size: 4,
      array: Float32Array,
      get: (buffer, offset) => view(buffer).getFloat32(offset, true),
      set: (buffer, offset, value) => view(buffer).setFloat32(offset, value, true)
    },
    float64: {
      name: "float64",
      size: 8,
      array: Float64Array,
      get: (buffer, offset) => view(buffer).getFloat64(offset, true),
      set: (buffer, offset, value) => view(buffer).setFloat64(offset, value, true)
    }
  };
  var typeNames = Object.keys(types);
  for (const t of Object.values(types))
    registerType(t);
  var validNames = [...typeNames, ...typeNames.map((t) => capitalize(t)), "char"];
  function isValid(type) {
    return validNames.includes(type.toString());
  }
  function checkValid(type) {
    if (!isValid(type))
      throw withErrno("EINVAL", "Not a valid primitive type: " + type);
  }
  function normalize(type) {
    return type == "char" ? "uint8" : type.toLowerCase();
  }

  // node_modules/memium/dist/misc.js
  function sizeof(type) {
    if (isType(type))
      return type.size;
    if (type === void 0 || type === null)
      return 0;
    if (typeof type == "object" && isType(type.constructor))
      return type.constructor.size;
    if (Array.isArray(type)) {
      let size = 0;
      for (let i = 0; i < type.length; i++)
        size += sizeof(type[i]);
      return size;
    }
    if (typeof type == "string") {
      checkValid(type);
      return types[normalize(type)].size;
    }
    throw new TypeError(`Unable to resolve size of \`${type.toString()}\``);
  }
  function offsetof(type, fieldName) {
    checkStruct(type);
    const constructor = isStatic(type) ? type : type.constructor;
    const { fields } = constructor[Symbol.metadata].struct;
    if (!(fieldName in fields))
      throw withErrno("EINVAL", "Struct does not have field: " + fieldName);
    return fields[fieldName].offset;
  }

  // node_modules/memium/dist/struct.js
  var packed = { isPacked: true };
  function struct(...options) {
    return function __decorateStruct(target, context) {
      const opts = options.reduce((acc, opt) => ({ ...acc, ...opt }), {});
      const init = initMetadata(context);
      let fieldAlignment = 1;
      const fields = {};
      let size = 0;
      const align = (to) => {
        size = Math.ceil(size / to) * to;
      };
      for (const field2 of init.fields) {
        if (!opts.isPacked)
          align(field2.alignment);
        if (opts.isUnion)
          size = Math.max(size, field2.size);
        else {
          field2.offset = size;
          size += field2.size * (field2.length ?? 1);
        }
        fields[field2.name] = field2;
        fieldAlignment = Math.max(fieldAlignment, field2.alignment);
      }
      opts.alignment ??= fieldAlignment;
      if (!opts.isPacked)
        align(opts.alignment);
      context.metadata.struct = {
        fields,
        size,
        alignment: opts.isPacked ? 1 : opts.alignment,
        isUnion: opts.isUnion ?? false
      };
      class _struct extends target {
        static name = target.name;
        constructor(...args) {
          if (!args.length)
            args = [new ArrayBuffer(size), 0, size];
          super(...args);
        }
      }
      const fix = (value) => ({
        writable: false,
        enumerable: false,
        configurable: false,
        value
      });
      Object.defineProperties(_struct, {
        size: fix(size),
        // @ts-expect-error 2511 : Please don't try to create an instance of an abstract struct
        get: fix((buffer, offset) => new _struct(buffer, offset)),
        set: fix((buffer, offset, value) => {
          const source = new Uint8Array(value.buffer, value.byteOffset, size);
          const target2 = new Uint8Array(buffer, offset, size);
          if (value.buffer === buffer && value.byteOffset === offset)
            return;
          for (let i = 0; i < size; i++)
            target2[i] = source[i];
        })
      });
      if (opts.name)
        Object.defineProperty(_struct, "name", { value: opts.name });
      registerType(_struct);
      return _struct;
    };
  }
  function field(type, opt = {}) {
    return function __decorateField(value, context) {
      if (context.kind != "accessor")
        throw withErrno("EINVAL", "Field must be an accessor");
      const init = initMetadata(context);
      let name = context.name;
      if (typeof name == "symbol") {
        console.warn("Symbol used for struct field name will be coerced to string: " + name.toString());
        name = name.toString();
      }
      if (!name)
        throw withErrno("EINVAL", "Invalid name for struct field");
      if (!isType(type))
        throw withErrno("EINVAL", "Not a valid type: " + type.name);
      if (opt.countedBy)
        opt.length ??= 0;
      const field2 = {
        name,
        offset: 0,
        // set when `@struct` is run
        type,
        length: opt.length,
        countedBy: opt.countedBy,
        size: type.size,
        alignment: opt.align ?? type.size,
        decl: `${opt.typeName ?? type.name} ${name}${typeof opt.length === "number" ? `[${opt.length}]` : opt.countedBy ? `[${opt.countedBy}]` : ""}`,
        littleEndian: !opt.bigEndian
      };
      init.fields.push(field2);
      return {
        get() {
          return _get(this, field2);
        },
        set(value2) {
          _set(this, field2, value2);
        }
      };
    };
  }
  function _fieldLength(instance, length, countedBy) {
    if (length === void 0)
      return -1;
    if (typeof countedBy == "string")
      length = Math.min(length, instance[countedBy]);
    return Number.isSafeInteger(length) && length >= 0 ? length : _throw(withErrno("EINVAL", "Array lengths must be natural numbers"));
  }
  function _set(instance, field2, value, index) {
    const { type, length: maxLength, countedBy } = field2;
    const length = _fieldLength(instance, maxLength, countedBy);
    if (length === -1 || typeof index === "number") {
      if (typeof value == "string")
        value = value.charCodeAt(0);
      type.set(instance.buffer, instance.byteOffset + field2.offset + (index ?? 0) * type.size, value);
      return;
    }
    for (let i = 0; i < Math.min(length, value.length); i++) {
      const offset = field2.offset + i * type.size;
      type.set(instance.buffer, instance.byteOffset + offset, value[i]);
    }
  }
  function _get(instance, field2, index) {
    const { type, length: maxLength, countedBy } = field2;
    const length = _fieldLength(instance, maxLength, countedBy);
    const offset = instance.byteOffset + field2.offset + (index ?? 0) * field2.size;
    if (length === -1 || typeof index === "number") {
      return type.get(instance.buffer, offset);
    }
    if (length !== 0 && type.array) {
      return new type.array(instance.buffer, offset, length * type.size);
    }
    return new Proxy({
      get length() {
        return _fieldLength(instance, field2.length, field2.countedBy);
      },
      *[Symbol.iterator]() {
        for (let i = 0; i < this.length; i++)
          yield this[i];
      }
    }, {
      get(target, index2) {
        if (Object.hasOwn(target, index2))
          return target[index2];
        const i = parseInt(index2.toString());
        if (!Number.isSafeInteger(i))
          throw withErrno("EINVAL", "Invalid index: " + index2.toString());
        return _get(instance, field2, i);
      },
      set(target, index2, value) {
        const i = parseInt(index2.toString());
        if (!Number.isSafeInteger(i))
          throw withErrno("EINVAL", "Invalid index: " + index2.toString());
        _set(instance, field2, i, value);
        return true;
      }
    });
  }
  function _shortcut2(typeName) {
    const type = types[normalize(typeName)];
    function __decoratePrimitiveField(valueOrLength, context) {
      return typeof valueOrLength == "number" ? field(type, { typeName, length: valueOrLength, ...context }) : field(type, { typeName })(valueOrLength, context && "name" in context ? context : _throw(withErrno("EINVAL", "Invalid decorator context object")));
    }
    return __decoratePrimitiveField;
  }
  var types2 = Object.fromEntries(validNames.map((t) => [t, _shortcut2(t)]));

  // node_modules/utilium/dist/buffer.js
  function extendBuffer(buffer, newByteLength) {
    if (buffer.byteLength >= newByteLength)
      return buffer;
    if (ArrayBuffer.isView(buffer)) {
      const newBuffer = extendBuffer(buffer.buffer, newByteLength);
      return new buffer.constructor(newBuffer, buffer.byteOffset, newByteLength);
    }
    const isShared = typeof SharedArrayBuffer !== "undefined" && buffer instanceof SharedArrayBuffer;
    if (buffer.maxByteLength > newByteLength) {
      isShared ? buffer.grow(newByteLength) : buffer.resize(newByteLength);
      return buffer;
    }
    if (isShared) {
      const newBuffer = new SharedArrayBuffer(newByteLength);
      new Uint8Array(newBuffer).set(new Uint8Array(buffer));
      return newBuffer;
    }
    try {
      return buffer.transfer(newByteLength);
    } catch {
      const newBuffer = new ArrayBuffer(newByteLength);
      new Uint8Array(newBuffer).set(new Uint8Array(buffer));
      return newBuffer;
    }
  }
  var BufferView = class extends DataView {
    constructor(_buffer, _byteOffset, _byteLength) {
      const { buffer, byteOffset, byteLength } = new Uint8Array(_buffer, _byteOffset, _byteLength);
      super(buffer, byteOffset, byteLength);
    }
  };
  for (const key of Object.getOwnPropertyNames(DataView.prototype)) {
    if (!key.startsWith("get") && !key.startsWith("set"))
      continue;
    Object.defineProperty(BufferView.prototype, key, {
      value: () => {
        throw new ReferenceError("Do not use DataView methods on a BufferView.");
      },
      writable: false,
      enumerable: false,
      configurable: false
    });
  }

  // node_modules/@zenfs/core/dist/utils.js
  function decodeDirListing(data) {
    return JSON.parse(decodeUTF8(data), (k, v) => k == "" ? v : typeof v == "string" ? BigInt(v).toString(16).slice(0, Math.min(v.length, 8)) : v);
  }
  function encodeDirListing(data) {
    return encodeUTF8(JSON.stringify(data));
  }
  function normalizeMode(mode, def) {
    if (typeof mode == "number")
      return mode;
    if (typeof mode == "string") {
      const parsed = parseInt(mode, 8);
      if (!isNaN(parsed)) {
        return parsed;
      }
    }
    if (typeof def == "number")
      return def;
    throw withErrno("EINVAL", "Invalid mode: " + mode?.toString());
  }
  function normalizeTime(time) {
    if (time instanceof Date)
      return time.getTime();
    try {
      return Number(time);
    } catch {
      throw withErrno("EINVAL", "Invalid time.");
    }
  }
  function __assertType(value) {
  }
  function normalizePath(p, noResolve = false) {
    if (p instanceof URL) {
      if (p.protocol != "file:")
        throw withErrno("EINVAL", "URLs must use the file: protocol");
      p = p.pathname;
    }
    p = p.toString();
    if (p.startsWith("file://"))
      p = p.slice("file://".length);
    if (p.includes("\0"))
      throw withErrno("EINVAL", "Path can not contain null character");
    if (p.length == 0)
      throw withErrno("EINVAL", "Path can not be empty");
    p = p.replaceAll(/[/\\]+/g, "/");
    return noResolve ? p : resolve(p);
  }
  function normalizeOptions(options, encoding = "utf8", flag, mode = 0) {
    if (typeof options != "object" || options === null) {
      return {
        encoding: typeof options == "string" ? options : encoding ?? null,
        flag,
        mode
      };
    }
    return {
      encoding: typeof options?.encoding == "string" ? options.encoding : encoding ?? null,
      flag: typeof options?.flag == "string" ? options.flag : flag,
      mode: normalizeMode("mode" in options ? options?.mode : null, mode)
    };
  }
  function globToRegex(pattern2) {
    pattern2 = pattern2.replace(/([.?+^$(){}|[\]/])/g, "$1").replace(/\*\*/g, ".*").replace(/\*/g, "[^/]*").replace(/\?/g, ".");
    return new RegExp(`^${pattern2}$`);
  }

  // node_modules/@zenfs/core/dist/path.js
  function normalizeString(path, allowAboveRoot) {
    let res = "";
    let lastSegmentLength = 0;
    let lastSlash = -1;
    let dots = 0;
    let char = "\0";
    for (let i = 0; i <= path.length; ++i) {
      if (i < path.length) {
        char = path[i];
      } else if (char == "/") {
        break;
      } else {
        char = "/";
      }
      if (char == "/") {
        if (lastSlash === i - 1 || dots === 1) {
        } else if (dots === 2) {
          if (res.length < 2 || lastSegmentLength !== 2 || res.at(-1) !== "." || res.at(-2) !== ".") {
            if (res.length > 2) {
              const lastSlashIndex = res.lastIndexOf("/");
              if (lastSlashIndex === -1) {
                res = "";
                lastSegmentLength = 0;
              } else {
                res = res.slice(0, lastSlashIndex);
                lastSegmentLength = res.length - 1 - res.lastIndexOf("/");
              }
              lastSlash = i;
              dots = 0;
              continue;
            } else if (res.length !== 0) {
              res = "";
              lastSegmentLength = 0;
              lastSlash = i;
              dots = 0;
              continue;
            }
          }
          if (allowAboveRoot) {
            res += res.length > 0 ? "/.." : "..";
            lastSegmentLength = 2;
          }
        } else {
          if (res.length > 0)
            res += "/" + path.slice(lastSlash + 1, i);
          else
            res = path.slice(lastSlash + 1, i);
          lastSegmentLength = i - lastSlash - 1;
        }
        lastSlash = i;
        dots = 0;
      } else if (char === "." && dots !== -1) {
        ++dots;
      } else {
        dots = -1;
      }
    }
    return res;
  }
  function resolve(...parts) {
    let resolved = "";
    for (const part of [...parts.reverse(), this?.pwd ?? defaultContext.pwd]) {
      if (!part?.length)
        continue;
      resolved = `${part}/${resolved}`;
      if (part.startsWith("/")) {
        break;
      }
    }
    const absolute = resolved.startsWith("/");
    resolved = normalizeString(resolved, !absolute);
    if (absolute) {
      return `/${resolved}`;
    }
    return resolved.length ? resolved : "/";
  }
  function normalize2(path) {
    if (!path.length)
      return ".";
    const isAbsolute = path.startsWith("/");
    const trailingSeparator = path.endsWith("/");
    path = normalizeString(path, !isAbsolute);
    if (!path.length) {
      if (isAbsolute)
        return "/";
      return trailingSeparator ? "./" : ".";
    }
    if (trailingSeparator)
      path += "/";
    return isAbsolute ? `/${path}` : path;
  }
  function join(...parts) {
    if (!parts.length)
      return ".";
    const joined = parts.join("/");
    if (!joined?.length)
      return ".";
    return normalize2(joined);
  }
  function relative(from2, to) {
    if (from2 === to)
      return "";
    from2 = resolve.call(this, from2);
    to = resolve.call(this, to);
    if (from2 === to)
      return "";
    const fromStart = 1;
    const fromEnd = from2.length;
    const fromLen = fromEnd - fromStart;
    const toStart = 1;
    const toLen = to.length - toStart;
    const length = fromLen < toLen ? fromLen : toLen;
    let lastCommonSep = -1;
    let i = 0;
    for (; i < length; i++) {
      const fromCode = from2[fromStart + i];
      if (fromCode !== to[toStart + i])
        break;
      else if (fromCode === "/")
        lastCommonSep = i;
    }
    if (i === length) {
      if (toLen > length) {
        if (to[toStart + i] === "/") {
          return to.slice(toStart + i + 1);
        }
        if (i === 0) {
          return to.slice(toStart + i);
        }
      } else if (fromLen > length) {
        if (from2[fromStart + i] === "/") {
          lastCommonSep = i;
        } else if (i === 0) {
          lastCommonSep = 0;
        }
      }
    }
    let out = "";
    for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
      if (i === fromEnd || from2[i] === "/") {
        out += out.length === 0 ? ".." : "/..";
      }
    }
    return `${out}${to.slice(toStart + lastCommonSep)}`;
  }
  function dirname(path) {
    if (path.length === 0)
      return ".";
    const hasRoot = path[0] === "/";
    let end = -1;
    let matchedSlash = true;
    for (let i = path.length - 1; i >= 1; --i) {
      if (path[i] === "/") {
        if (!matchedSlash) {
          end = i;
          break;
        }
      } else {
        matchedSlash = false;
      }
    }
    if (end === -1)
      return hasRoot ? "/" : ".";
    if (hasRoot && end === 1)
      return "//";
    return path.slice(0, end);
  }
  function basename(path, suffix) {
    let start = 0;
    let end = -1;
    let matchedSlash = true;
    if (suffix !== void 0 && suffix.length > 0 && suffix.length <= path.length) {
      if (suffix === path)
        return "";
      let extIdx = suffix.length - 1;
      let firstNonSlashEnd = -1;
      for (let i = path.length - 1; i >= 0; --i) {
        if (path[i] === "/") {
          if (!matchedSlash) {
            start = i + 1;
            break;
          }
        } else {
          if (firstNonSlashEnd === -1) {
            matchedSlash = false;
            firstNonSlashEnd = i + 1;
          }
          if (extIdx >= 0) {
            if (path[i] === suffix[extIdx]) {
              if (--extIdx === -1) {
                end = i;
              }
            } else {
              extIdx = -1;
              end = firstNonSlashEnd;
            }
          }
        }
      }
      if (start === end)
        end = firstNonSlashEnd;
      else if (end === -1)
        end = path.length;
      return path.slice(start, end);
    }
    for (let i = path.length - 1; i >= 0; --i) {
      if (path[i] === "/") {
        if (!matchedSlash) {
          start = i + 1;
          break;
        }
      } else if (end === -1) {
        matchedSlash = false;
        end = i + 1;
      }
    }
    if (end === -1)
      return "";
    return path.slice(start, end);
  }
  function parse(path) {
    const isAbsolute = path.startsWith("/");
    const ret = { root: isAbsolute ? "/" : "", dir: "", base: "", ext: "", name: "" };
    if (path.length === 0)
      return ret;
    const start = isAbsolute ? 1 : 0;
    let startDot = -1;
    let startPart = 0;
    let end = -1;
    let matchedSlash = true;
    let i = path.length - 1;
    let preDotState = 0;
    for (; i >= start; --i) {
      if (path[i] === "/") {
        if (!matchedSlash) {
          startPart = i + 1;
          break;
        }
        continue;
      }
      if (end === -1) {
        matchedSlash = false;
        end = i + 1;
      }
      if (path[i] === ".") {
        if (startDot === -1)
          startDot = i;
        else if (preDotState !== 1)
          preDotState = 1;
      } else if (startDot !== -1) {
        preDotState = -1;
      }
    }
    if (end !== -1) {
      const start2 = startPart === 0 && isAbsolute ? 1 : startPart;
      if (startDot === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        ret.base = ret.name = path.slice(start2, end);
      } else {
        ret.name = path.slice(start2, startDot);
        ret.base = path.slice(start2, end);
        ret.ext = path.slice(startDot, end);
      }
    }
    if (startPart > 0)
      ret.dir = path.slice(0, startPart - 1);
    else if (isAbsolute)
      ret.dir = "/";
    return ret;
  }
  function matchesGlob(pattern2, str) {
    return globToRegex(pattern2).test(str);
  }

  // node_modules/@zenfs/core/dist/vfs/stats.js
  var n1000 = BigInt(1e3);
  var StatsCommon = class {
    _convert(arg) {
      return this._isBigint ? BigInt(arg) : Number(arg);
    }
    get blocks() {
      return this._convert(Math.ceil(Number(this.size) / 512));
    }
    set blocks(value) {
    }
    /**
     * Unix-style file mode (e.g. 0o644) that includes the type of the item.
     */
    mode;
    /**
     * ID of device containing file
     */
    dev = this._convert(0);
    /**
     * Inode number
     */
    ino = this._convert(0);
    /**
     * Device ID (if special file)
     */
    rdev = this._convert(0);
    /**
     * Number of hard links
     */
    nlink = this._convert(1);
    /**
     * Block size for file system I/O
     */
    blksize = this._convert(4096);
    /**
     * User ID of owner
     */
    uid = this._convert(0);
    /**
     * Group ID of owner
     */
    gid = this._convert(0);
    /**
     * Time of last access, since epoch
     */
    atimeMs;
    get atime() {
      return new Date(Number(this.atimeMs));
    }
    set atime(value) {
      this.atimeMs = this._convert(value.getTime());
    }
    /**
     * Time of last modification, since epoch
     */
    mtimeMs;
    get mtime() {
      return new Date(Number(this.mtimeMs));
    }
    set mtime(value) {
      this.mtimeMs = this._convert(value.getTime());
    }
    /**
     * Time of last time file status was changed, since epoch
     */
    ctimeMs;
    get ctime() {
      return new Date(Number(this.ctimeMs));
    }
    set ctime(value) {
      this.ctimeMs = this._convert(value.getTime());
    }
    /**
     * Time of file creation, since epoch
     */
    birthtimeMs;
    get birthtime() {
      return new Date(Number(this.birthtimeMs));
    }
    set birthtime(value) {
      this.birthtimeMs = this._convert(value.getTime());
    }
    /**
     * Size of the item in bytes.
     * For directories/symlinks, this is normally the size of the struct that represents the item.
     */
    size;
    /**
     * @internal Used by inodes
     */
    data;
    /**
     * @internal Used by inodes
     */
    flags;
    /**
     * @internal Used by inodes
     */
    version;
    /**
     * Creates a new stats instance from a stats-like object. Can be used to copy stats (note)
     */
    constructor({ atimeMs, mtimeMs, ctimeMs, birthtimeMs, uid, gid, size, mode, ino, ...rest } = {}) {
      const now = Date.now();
      this.atimeMs = this._convert(atimeMs ?? now);
      this.mtimeMs = this._convert(mtimeMs ?? now);
      this.ctimeMs = this._convert(ctimeMs ?? now);
      this.birthtimeMs = this._convert(birthtimeMs ?? now);
      this.uid = this._convert(uid ?? 0);
      this.gid = this._convert(gid ?? 0);
      this.size = this._convert(size ?? 0);
      this.ino = this._convert(ino ?? 0);
      this.mode = this._convert(mode ?? 420 & S_IFREG);
      if ((this.mode & S_IFMT) == 0) {
        this.mode = this.mode | this._convert(S_IFREG);
      }
      Object.assign(this, rest);
    }
    isFile() {
      return (this.mode & S_IFMT) === S_IFREG;
    }
    isDirectory() {
      return (this.mode & S_IFMT) === S_IFDIR;
    }
    isSymbolicLink() {
      return (this.mode & S_IFMT) === S_IFLNK;
    }
    isSocket() {
      return (this.mode & S_IFMT) === S_IFSOCK;
    }
    isBlockDevice() {
      return (this.mode & S_IFMT) === S_IFBLK;
    }
    isCharacterDevice() {
      return (this.mode & S_IFMT) === S_IFCHR;
    }
    isFIFO() {
      return (this.mode & S_IFMT) === S_IFIFO;
    }
    toJSON() {
      return pick(this, _inode_fields);
    }
    /**
     * Checks if a given user/group has access to this item
     * @param mode The requested access, combination of W_OK, R_OK, and X_OK
     * @returns True if the request has access, false if the request does not
     * @internal
     */
    hasAccess(mode, context) {
      return hasAccess(context, this._isBigint ? new Stats(this) : this, mode);
    }
    get atimeNs() {
      return BigInt(this.atimeMs) * n1000;
    }
    get mtimeNs() {
      return BigInt(this.mtimeMs) * n1000;
    }
    get ctimeNs() {
      return BigInt(this.ctimeMs) * n1000;
    }
    get birthtimeNs() {
      return BigInt(this.birthtimeMs) * n1000;
    }
  };
  function _chown(stats, uid, gid) {
    let valid = true;
    if (!isNaN(uid) && uid >= 0 && uid < size_max)
      stats.uid = uid;
    else
      valid = false;
    if (!isNaN(gid) && gid >= 0 && gid < size_max)
      stats.gid = gid;
    else
      valid = false;
    return valid;
  }
  var Stats = class extends StatsCommon {
    _isBigint = false;
  };
  var BigIntStats = class extends StatsCommon {
    _isBigint = true;
  };
  function isStatsEqual(left, right) {
    return left.size == right.size && +left.atime == +right.atime && +left.mtime == +right.mtime && +left.ctime == +right.ctime && left.mode == right.mode;
  }
  var StatsFs = class {
    /** Type of file system. */
    type = 525687744115;
    /**  Optimal transfer block size. */
    bsize = 4096;
    /**  Total data blocks in file system. */
    blocks = 0;
    /** Free blocks in file system. */
    bfree = 0;
    /** Available blocks for unprivileged users */
    bavail = 0;
    /** Total file nodes in file system. */
    files = size_max;
    /** Free file nodes in file system. */
    ffree = size_max;
  };
  var BigIntStatsFs = class {
    /** Type of file system. */
    type = BigInt("0x7a656e6673");
    /**  Optimal transfer block size. */
    bsize = BigInt(4096);
    /**  Total data blocks in file system. */
    blocks = BigInt(0);
    /** Free blocks in file system. */
    bfree = BigInt(0);
    /** Available blocks for unprivileged users */
    bavail = BigInt(0);
    /** Total file nodes in file system. */
    files = BigInt(size_max);
    /** Free file nodes in file system. */
    ffree = BigInt(size_max);
  };

  // node_modules/@zenfs/core/dist/internal/inode.js
  var __esDecorate = function(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) {
      if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected");
      return f;
    }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
      var context = {};
      for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
      for (var p in contextIn.access) context.access[p] = contextIn.access[p];
      context.addInitializer = function(f) {
        if (done) throw new TypeError("Cannot add initializers after decoration has completed");
        extraInitializers.push(accept(f || null));
      };
      var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
      if (kind === "accessor") {
        if (result === void 0) continue;
        if (result === null || typeof result !== "object") throw new TypeError("Object expected");
        if (_ = accept(result.get)) descriptor.get = _;
        if (_ = accept(result.set)) descriptor.set = _;
        if (_ = accept(result.init)) initializers.unshift(_);
      } else if (_ = accept(result)) {
        if (kind === "field") initializers.unshift(_);
        else descriptor[key] = _;
      }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
  };
  var __runInitializers = function(thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
      value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
  };
  var rootIno = 0;
  var maxDynamicData = 3968;
  var Attribute = (() => {
    var _a, _b;
    let _classDecorators = [struct(packed, { name: "Attribute" })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = Uint8Array;
    let _keySize_decorators;
    let _keySize_initializers = [];
    let _keySize_extraInitializers = [];
    let _valueSize_decorators;
    let _valueSize_initializers = [];
    let _valueSize_extraInitializers = [];
    var Attribute2 = class extends _classSuper {
      static {
        _classThis = this;
      }
      static {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        _keySize_decorators = [(_a = types2).uint32.bind(_a)];
        _valueSize_decorators = [(_b = types2).uint32.bind(_b)];
        __esDecorate(this, null, _keySize_decorators, { kind: "accessor", name: "keySize", static: false, private: false, access: { has: (obj) => "keySize" in obj, get: (obj) => obj.keySize, set: (obj, value) => {
          obj.keySize = value;
        } }, metadata: _metadata }, _keySize_initializers, _keySize_extraInitializers);
        __esDecorate(this, null, _valueSize_decorators, { kind: "accessor", name: "valueSize", static: false, private: false, access: { has: (obj) => "valueSize" in obj, get: (obj) => obj.valueSize, set: (obj, value) => {
          obj.valueSize = value;
        } }, metadata: _metadata }, _valueSize_initializers, _valueSize_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Attribute2 = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
      }
      #keySize_accessor_storage = __runInitializers(this, _keySize_initializers, void 0);
      get keySize() {
        return this.#keySize_accessor_storage;
      }
      set keySize(value) {
        this.#keySize_accessor_storage = value;
      }
      #valueSize_accessor_storage = (__runInitializers(this, _keySize_extraInitializers), __runInitializers(this, _valueSize_initializers, void 0));
      get valueSize() {
        return this.#valueSize_accessor_storage;
      }
      set valueSize(value) {
        this.#valueSize_accessor_storage = value;
      }
      get name() {
        return decodeUTF8(this.subarray(8, 8 + this.keySize));
      }
      /**
       * Note that this does not handle moving the data.
       * Changing the name after setting the value is undefined behavior and will lead to corruption.
       * This should only be used when creating a new attribute.
       */
      set name(value) {
        const buf = encodeUTF8(value);
        if (8 + buf.length + this.valueSize > maxDynamicData)
          throw withErrno("EOVERFLOW");
        this.set(buf, 8);
        this.keySize = buf.length;
      }
      get value() {
        return this.subarray(8 + this.keySize, this.size);
      }
      set value(value) {
        if (8 + this.keySize + value.length > maxDynamicData)
          throw withErrno("EOVERFLOW");
        this.valueSize = value.length;
        this.set(value, 8 + this.keySize);
      }
      get size() {
        return 8 + this.keySize + this.valueSize;
      }
      constructor() {
        super(...arguments);
        __runInitializers(this, _valueSize_extraInitializers);
      }
    };
    return Attribute2 = _classThis;
  })();
  var Attributes = (() => {
    var _a;
    let _classDecorators = [struct(packed, { name: "Attributes" })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BufferView;
    let _size_decorators;
    let _size_initializers = [];
    let _size_extraInitializers = [];
    var Attributes2 = class extends _classSuper {
      static {
        _classThis = this;
      }
      static {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        _size_decorators = [(_a = types2).uint32.bind(_a)];
        __esDecorate(this, null, _size_decorators, { kind: "accessor", name: "size", static: false, private: false, access: { has: (obj) => "size" in obj, get: (obj) => obj.size, set: (obj, value) => {
          obj.size = value;
        } }, metadata: _metadata }, _size_initializers, _size_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Attributes2 = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
      }
      #size_accessor_storage = __runInitializers(this, _size_initializers, void 0);
      get size() {
        return this.#size_accessor_storage;
      }
      set size(value) {
        this.#size_accessor_storage = value;
      }
      get byteSize() {
        let offset = this.byteOffset + sizeof(this);
        for (let i = 0; i < this.size; i++) {
          const entry = new Attribute(this.buffer, offset);
          offset += entry.size;
        }
        return offset;
      }
      has(name) {
        let offset = this.byteOffset + sizeof(this);
        for (let i = 0; i < this.size; i++) {
          const entry = new Attribute(this.buffer, offset);
          if (entry.name == name)
            return true;
          offset += entry.size;
        }
        return false;
      }
      get(name) {
        let offset = this.byteOffset + sizeof(this);
        for (let i = 0; i < this.size; i++) {
          const entry = new Attribute(this.buffer, offset);
          if (entry.name == name)
            return entry.value;
          offset += entry.size;
        }
      }
      set(name, value) {
        let offset = this.byteOffset + sizeof(this);
        let remove3;
        for (let i = 0; i < this.size; i++) {
          const entry = new Attribute(this.buffer, offset);
          if (entry.name == name)
            remove3 = [offset, entry.size];
          offset += entry.size;
        }
        const buf = new Uint8Array(this.buffer);
        if (remove3) {
          const [start, size] = remove3;
          offset -= size;
          buf.copyWithin(start, start + size, offset + size);
          buf.fill(0, offset, offset + size);
          this.size--;
        }
        const attr = new Attribute(this.buffer, offset);
        attr.name = name;
        attr.value = value;
        this.size++;
      }
      remove(name) {
        let offset = this.byteOffset + sizeof(this);
        let remove3;
        for (let i = 0; i < this.size; i++) {
          const entry = new Attribute(this.buffer, offset);
          if (entry.name == name)
            remove3 = [offset, entry.size];
          offset += entry.size;
        }
        if (!remove3)
          return false;
        const [start, size] = remove3;
        const buf = new Uint8Array(this.buffer);
        buf.copyWithin(start, start + size, offset);
        buf.fill(0, offset - size, offset);
        this.size--;
        return true;
      }
      copyFrom(other) {
        const { byteSize } = other;
        new Uint8Array(this.buffer, this.byteOffset, byteSize).set(new Uint8Array(other.buffer, other.byteOffset, byteSize));
      }
      *keys() {
        let offset = this.byteOffset + sizeof(this);
        for (let i = 0; i < this.size; i++) {
          const entry = new Attribute(this.buffer, offset);
          yield entry.name;
          offset += entry.size;
        }
      }
      *values() {
        let offset = this.byteOffset + sizeof(this);
        for (let i = 0; i < this.size; i++) {
          const entry = new Attribute(this.buffer, offset);
          yield entry.value;
          offset += entry.size;
        }
      }
      *entries() {
        let offset = this.byteOffset + sizeof(this);
        for (let i = 0; i < this.size; i++) {
          const entry = new Attribute(this.buffer, offset);
          yield [entry.name, entry.value];
          offset += entry.size;
        }
      }
      constructor() {
        super(...arguments);
        __runInitializers(this, _size_extraInitializers);
      }
    };
    return Attributes2 = _classThis;
  })();
  var _inode_fields = [
    "ino",
    "data",
    "size",
    "mode",
    "flags",
    "nlink",
    "uid",
    "gid",
    "atimeMs",
    "birthtimeMs",
    "mtimeMs",
    "ctimeMs",
    "version"
  ];
  var _inode_version = 5;
  var InodeFlags;
  (function(InodeFlags2) {
    InodeFlags2[InodeFlags2["Sync"] = 1] = "Sync";
    InodeFlags2[InodeFlags2["NoAtime"] = 2] = "NoAtime";
    InodeFlags2[InodeFlags2["Append"] = 4] = "Append";
    InodeFlags2[InodeFlags2["Immutable"] = 8] = "Immutable";
    InodeFlags2[InodeFlags2["Dead"] = 16] = "Dead";
    InodeFlags2[InodeFlags2["NoQuota"] = 32] = "NoQuota";
    InodeFlags2[InodeFlags2["Dirsync"] = 64] = "Dirsync";
    InodeFlags2[InodeFlags2["NoCMtime"] = 128] = "NoCMtime";
    InodeFlags2[InodeFlags2["SwapFile"] = 256] = "SwapFile";
    InodeFlags2[InodeFlags2["Private"] = 512] = "Private";
    InodeFlags2[InodeFlags2["IMA"] = 1024] = "IMA";
    InodeFlags2[InodeFlags2["AutoMount"] = 2048] = "AutoMount";
    InodeFlags2[InodeFlags2["NoSec"] = 4096] = "NoSec";
    InodeFlags2[InodeFlags2["DAX"] = 8192] = "DAX";
    InodeFlags2[InodeFlags2["Encrypted"] = 16384] = "Encrypted";
    InodeFlags2[InodeFlags2["CaseFold"] = 32768] = "CaseFold";
    InodeFlags2[InodeFlags2["Verity"] = 65536] = "Verity";
    InodeFlags2[InodeFlags2["KernelFile"] = 131072] = "KernelFile";
  })(InodeFlags || (InodeFlags = {}));
  var Inode = (() => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
    let _classDecorators = [struct(packed, { name: "Inode" })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BufferView;
    let _data_decorators;
    let _data_initializers = [];
    let _data_extraInitializers = [];
    let ___data_old_decorators;
    let ___data_old_initializers = [];
    let ___data_old_extraInitializers = [];
    let _size_decorators;
    let _size_initializers = [];
    let _size_extraInitializers = [];
    let _mode_decorators;
    let _mode_initializers = [];
    let _mode_extraInitializers = [];
    let _nlink_decorators;
    let _nlink_initializers = [];
    let _nlink_extraInitializers = [];
    let _uid_decorators;
    let _uid_initializers = [];
    let _uid_extraInitializers = [];
    let _gid_decorators;
    let _gid_initializers = [];
    let _gid_extraInitializers = [];
    let _atimeMs_decorators;
    let _atimeMs_initializers = [];
    let _atimeMs_extraInitializers = [];
    let _birthtimeMs_decorators;
    let _birthtimeMs_initializers = [];
    let _birthtimeMs_extraInitializers = [];
    let _mtimeMs_decorators;
    let _mtimeMs_initializers = [];
    let _mtimeMs_extraInitializers = [];
    let _ctimeMs_decorators;
    let _ctimeMs_initializers = [];
    let _ctimeMs_extraInitializers = [];
    let _ino_decorators;
    let _ino_initializers = [];
    let _ino_extraInitializers = [];
    let ___ino_old_decorators;
    let ___ino_old_initializers = [];
    let ___ino_old_extraInitializers = [];
    let _flags_decorators;
    let _flags_initializers = [];
    let _flags_extraInitializers = [];
    let ___after_flags_decorators;
    let ___after_flags_initializers = [];
    let ___after_flags_extraInitializers = [];
    let _version_decorators;
    let _version_initializers = [];
    let _version_extraInitializers = [];
    let ___padding_decorators;
    let ___padding_initializers = [];
    let ___padding_extraInitializers = [];
    let _attributes_decorators;
    let _attributes_initializers = [];
    let _attributes_extraInitializers = [];
    let ___data_decorators;
    let ___data_initializers = [];
    let ___data_extraInitializers = [];
    var Inode2 = class extends _classSuper {
      static {
        _classThis = this;
      }
      static {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        _data_decorators = [(_a = types2).uint32.bind(_a)];
        ___data_old_decorators = [(_b = types2).uint32.bind(_b)];
        _size_decorators = [(_c = types2).uint32.bind(_c)];
        _mode_decorators = [(_d = types2).uint16.bind(_d)];
        _nlink_decorators = [(_e = types2).uint32.bind(_e)];
        _uid_decorators = [(_f = types2).uint32.bind(_f)];
        _gid_decorators = [(_g = types2).uint32.bind(_g)];
        _atimeMs_decorators = [(_h = types2).float64.bind(_h)];
        _birthtimeMs_decorators = [(_j = types2).float64.bind(_j)];
        _mtimeMs_decorators = [(_k = types2).float64.bind(_k)];
        _ctimeMs_decorators = [(_l = types2).float64.bind(_l)];
        _ino_decorators = [(_m = types2).uint32.bind(_m)];
        ___ino_old_decorators = [(_o = types2).uint32.bind(_o)];
        _flags_decorators = [(_p = types2).uint32.bind(_p)];
        ___after_flags_decorators = [(_q = types2).uint16.bind(_q)];
        _version_decorators = [(_r = types2).uint32.bind(_r)];
        ___padding_decorators = [types2.uint8(48)];
        _attributes_decorators = [field(Attributes)];
        ___data_decorators = [types2.uint8(maxDynamicData)];
        __esDecorate(this, null, _data_decorators, { kind: "accessor", name: "data", static: false, private: false, access: { has: (obj) => "data" in obj, get: (obj) => obj.data, set: (obj, value) => {
          obj.data = value;
        } }, metadata: _metadata }, _data_initializers, _data_extraInitializers);
        __esDecorate(this, null, ___data_old_decorators, { kind: "accessor", name: "__data_old", static: false, private: false, access: { has: (obj) => "__data_old" in obj, get: (obj) => obj.__data_old, set: (obj, value) => {
          obj.__data_old = value;
        } }, metadata: _metadata }, ___data_old_initializers, ___data_old_extraInitializers);
        __esDecorate(this, null, _size_decorators, { kind: "accessor", name: "size", static: false, private: false, access: { has: (obj) => "size" in obj, get: (obj) => obj.size, set: (obj, value) => {
          obj.size = value;
        } }, metadata: _metadata }, _size_initializers, _size_extraInitializers);
        __esDecorate(this, null, _mode_decorators, { kind: "accessor", name: "mode", static: false, private: false, access: { has: (obj) => "mode" in obj, get: (obj) => obj.mode, set: (obj, value) => {
          obj.mode = value;
        } }, metadata: _metadata }, _mode_initializers, _mode_extraInitializers);
        __esDecorate(this, null, _nlink_decorators, { kind: "accessor", name: "nlink", static: false, private: false, access: { has: (obj) => "nlink" in obj, get: (obj) => obj.nlink, set: (obj, value) => {
          obj.nlink = value;
        } }, metadata: _metadata }, _nlink_initializers, _nlink_extraInitializers);
        __esDecorate(this, null, _uid_decorators, { kind: "accessor", name: "uid", static: false, private: false, access: { has: (obj) => "uid" in obj, get: (obj) => obj.uid, set: (obj, value) => {
          obj.uid = value;
        } }, metadata: _metadata }, _uid_initializers, _uid_extraInitializers);
        __esDecorate(this, null, _gid_decorators, { kind: "accessor", name: "gid", static: false, private: false, access: { has: (obj) => "gid" in obj, get: (obj) => obj.gid, set: (obj, value) => {
          obj.gid = value;
        } }, metadata: _metadata }, _gid_initializers, _gid_extraInitializers);
        __esDecorate(this, null, _atimeMs_decorators, { kind: "accessor", name: "atimeMs", static: false, private: false, access: { has: (obj) => "atimeMs" in obj, get: (obj) => obj.atimeMs, set: (obj, value) => {
          obj.atimeMs = value;
        } }, metadata: _metadata }, _atimeMs_initializers, _atimeMs_extraInitializers);
        __esDecorate(this, null, _birthtimeMs_decorators, { kind: "accessor", name: "birthtimeMs", static: false, private: false, access: { has: (obj) => "birthtimeMs" in obj, get: (obj) => obj.birthtimeMs, set: (obj, value) => {
          obj.birthtimeMs = value;
        } }, metadata: _metadata }, _birthtimeMs_initializers, _birthtimeMs_extraInitializers);
        __esDecorate(this, null, _mtimeMs_decorators, { kind: "accessor", name: "mtimeMs", static: false, private: false, access: { has: (obj) => "mtimeMs" in obj, get: (obj) => obj.mtimeMs, set: (obj, value) => {
          obj.mtimeMs = value;
        } }, metadata: _metadata }, _mtimeMs_initializers, _mtimeMs_extraInitializers);
        __esDecorate(this, null, _ctimeMs_decorators, { kind: "accessor", name: "ctimeMs", static: false, private: false, access: { has: (obj) => "ctimeMs" in obj, get: (obj) => obj.ctimeMs, set: (obj, value) => {
          obj.ctimeMs = value;
        } }, metadata: _metadata }, _ctimeMs_initializers, _ctimeMs_extraInitializers);
        __esDecorate(this, null, _ino_decorators, { kind: "accessor", name: "ino", static: false, private: false, access: { has: (obj) => "ino" in obj, get: (obj) => obj.ino, set: (obj, value) => {
          obj.ino = value;
        } }, metadata: _metadata }, _ino_initializers, _ino_extraInitializers);
        __esDecorate(this, null, ___ino_old_decorators, { kind: "accessor", name: "__ino_old", static: false, private: false, access: { has: (obj) => "__ino_old" in obj, get: (obj) => obj.__ino_old, set: (obj, value) => {
          obj.__ino_old = value;
        } }, metadata: _metadata }, ___ino_old_initializers, ___ino_old_extraInitializers);
        __esDecorate(this, null, _flags_decorators, { kind: "accessor", name: "flags", static: false, private: false, access: { has: (obj) => "flags" in obj, get: (obj) => obj.flags, set: (obj, value) => {
          obj.flags = value;
        } }, metadata: _metadata }, _flags_initializers, _flags_extraInitializers);
        __esDecorate(this, null, ___after_flags_decorators, { kind: "accessor", name: "__after_flags", static: false, private: false, access: { has: (obj) => "__after_flags" in obj, get: (obj) => obj.__after_flags, set: (obj, value) => {
          obj.__after_flags = value;
        } }, metadata: _metadata }, ___after_flags_initializers, ___after_flags_extraInitializers);
        __esDecorate(this, null, _version_decorators, { kind: "accessor", name: "version", static: false, private: false, access: { has: (obj) => "version" in obj, get: (obj) => obj.version, set: (obj, value) => {
          obj.version = value;
        } }, metadata: _metadata }, _version_initializers, _version_extraInitializers);
        __esDecorate(this, null, ___padding_decorators, { kind: "accessor", name: "__padding", static: false, private: false, access: { has: (obj) => "__padding" in obj, get: (obj) => obj.__padding, set: (obj, value) => {
          obj.__padding = value;
        } }, metadata: _metadata }, ___padding_initializers, ___padding_extraInitializers);
        __esDecorate(this, null, _attributes_decorators, { kind: "accessor", name: "attributes", static: false, private: false, access: { has: (obj) => "attributes" in obj, get: (obj) => obj.attributes, set: (obj, value) => {
          obj.attributes = value;
        } }, metadata: _metadata }, _attributes_initializers, _attributes_extraInitializers);
        __esDecorate(this, null, ___data_decorators, { kind: "accessor", name: "__data", static: false, private: false, access: { has: (obj) => "__data" in obj, get: (obj) => obj.__data, set: (obj, value) => {
          obj.__data = value;
        } }, metadata: _metadata }, ___data_initializers, ___data_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Inode2 = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
      }
      constructor(...args) {
        let data = {};
        if (typeof args[0] === "object" && args[0] !== null && !ArrayBuffer.isView(args[0])) {
          data = args[0];
          args = [sizeof(Inode2)];
        }
        super(...args);
        __runInitializers(this, ___data_extraInitializers);
        if (this.byteLength < sizeof(Inode2)) {
          throw crit(withErrno("EIO", `Buffer is too small to create an inode (${this.byteLength} bytes)`));
        }
        Object.assign(this, data);
        this.atimeMs ||= Date.now();
        this.mtimeMs ||= Date.now();
        this.ctimeMs ||= Date.now();
        this.birthtimeMs ||= Date.now();
        if (this.ino && !this.nlink) {
          warn(`Inode ${this.ino} has an nlink of 0`);
        }
      }
      #data_accessor_storage = __runInitializers(this, _data_initializers, void 0);
      get data() {
        return this.#data_accessor_storage;
      }
      set data(value) {
        this.#data_accessor_storage = value;
      }
      #__data_old_accessor_storage = (__runInitializers(this, _data_extraInitializers), __runInitializers(this, ___data_old_initializers, void 0));
      /** For future use */
      get __data_old() {
        return this.#__data_old_accessor_storage;
      }
      set __data_old(value) {
        this.#__data_old_accessor_storage = value;
      }
      #size_accessor_storage = (__runInitializers(this, ___data_old_extraInitializers), __runInitializers(this, _size_initializers, void 0));
      get size() {
        return this.#size_accessor_storage;
      }
      set size(value) {
        this.#size_accessor_storage = value;
      }
      #mode_accessor_storage = (__runInitializers(this, _size_extraInitializers), __runInitializers(this, _mode_initializers, void 0));
      get mode() {
        return this.#mode_accessor_storage;
      }
      set mode(value) {
        this.#mode_accessor_storage = value;
      }
      #nlink_accessor_storage = (__runInitializers(this, _mode_extraInitializers), __runInitializers(this, _nlink_initializers, void 0));
      get nlink() {
        return this.#nlink_accessor_storage;
      }
      set nlink(value) {
        this.#nlink_accessor_storage = value;
      }
      #uid_accessor_storage = (__runInitializers(this, _nlink_extraInitializers), __runInitializers(this, _uid_initializers, void 0));
      get uid() {
        return this.#uid_accessor_storage;
      }
      set uid(value) {
        this.#uid_accessor_storage = value;
      }
      #gid_accessor_storage = (__runInitializers(this, _uid_extraInitializers), __runInitializers(this, _gid_initializers, void 0));
      get gid() {
        return this.#gid_accessor_storage;
      }
      set gid(value) {
        this.#gid_accessor_storage = value;
      }
      #atimeMs_accessor_storage = (__runInitializers(this, _gid_extraInitializers), __runInitializers(this, _atimeMs_initializers, void 0));
      get atimeMs() {
        return this.#atimeMs_accessor_storage;
      }
      set atimeMs(value) {
        this.#atimeMs_accessor_storage = value;
      }
      #birthtimeMs_accessor_storage = (__runInitializers(this, _atimeMs_extraInitializers), __runInitializers(this, _birthtimeMs_initializers, void 0));
      get birthtimeMs() {
        return this.#birthtimeMs_accessor_storage;
      }
      set birthtimeMs(value) {
        this.#birthtimeMs_accessor_storage = value;
      }
      #mtimeMs_accessor_storage = (__runInitializers(this, _birthtimeMs_extraInitializers), __runInitializers(this, _mtimeMs_initializers, void 0));
      get mtimeMs() {
        return this.#mtimeMs_accessor_storage;
      }
      set mtimeMs(value) {
        this.#mtimeMs_accessor_storage = value;
      }
      #ctimeMs_accessor_storage = (__runInitializers(this, _mtimeMs_extraInitializers), __runInitializers(this, _ctimeMs_initializers, void 0));
      /**
       * The time the inode was changed.
       *
       * This is automatically updated whenever changed are made using `update()`.
       */
      get ctimeMs() {
        return this.#ctimeMs_accessor_storage;
      }
      set ctimeMs(value) {
        this.#ctimeMs_accessor_storage = value;
      }
      #ino_accessor_storage = (__runInitializers(this, _ctimeMs_extraInitializers), __runInitializers(this, _ino_initializers, void 0));
      get ino() {
        return this.#ino_accessor_storage;
      }
      set ino(value) {
        this.#ino_accessor_storage = value;
      }
      #__ino_old_accessor_storage = (__runInitializers(this, _ino_extraInitializers), __runInitializers(this, ___ino_old_initializers, void 0));
      /** For future use */
      get __ino_old() {
        return this.#__ino_old_accessor_storage;
      }
      set __ino_old(value) {
        this.#__ino_old_accessor_storage = value;
      }
      #flags_accessor_storage = (__runInitializers(this, ___ino_old_extraInitializers), __runInitializers(this, _flags_initializers, void 0));
      get flags() {
        return this.#flags_accessor_storage;
      }
      set flags(value) {
        this.#flags_accessor_storage = value;
      }
      #__after_flags_accessor_storage = (__runInitializers(this, _flags_extraInitializers), __runInitializers(this, ___after_flags_initializers, void 0));
      /** For future use */
      get __after_flags() {
        return this.#__after_flags_accessor_storage;
      }
      set __after_flags(value) {
        this.#__after_flags_accessor_storage = value;
      }
      #version_accessor_storage = (__runInitializers(this, ___after_flags_extraInitializers), __runInitializers(this, _version_initializers, void 0));
      /**
       * The "version" of the inode/data.
       * Unrelated to the inode format!
       */
      get version() {
        return this.#version_accessor_storage;
      }
      set version(value) {
        this.#version_accessor_storage = value;
      }
      #__padding_accessor_storage = (__runInitializers(this, _version_extraInitializers), __runInitializers(this, ___padding_initializers, void 0));
      /**
       * Padding up to 128 bytes.
       * This ensures there is enough room for expansion without breaking the ABI.
       * @internal
       */
      get __padding() {
        return this.#__padding_accessor_storage;
      }
      set __padding(value) {
        this.#__padding_accessor_storage = value;
      }
      #attributes_accessor_storage = (__runInitializers(this, ___padding_extraInitializers), __runInitializers(this, _attributes_initializers, void 0));
      get attributes() {
        return this.#attributes_accessor_storage;
      }
      set attributes(value) {
        this.#attributes_accessor_storage = value;
      }
      #__data_accessor_storage = (__runInitializers(this, _attributes_extraInitializers), __runInitializers(this, ___data_initializers, void 0));
      /**
       * Since the attribute data uses dynamic arrays,
       * it is necessary to add this so attributes can be added.
       * @internal @hidden
       */
      get __data() {
        return this.#__data_accessor_storage;
      }
      set __data(value) {
        this.#__data_accessor_storage = value;
      }
      toString() {
        return `<Inode ${this.ino}>`;
      }
      toJSON() {
        return {
          ...pick(this, _inode_fields),
          attributes: this.attributes
        };
      }
      /**
       * Handy function that converts the Inode to a Node Stats object.
       */
      toStats() {
        return new Stats(this);
      }
      /**
       * Updates the Inode using information from the stats object. Used by file
       * systems at sync time, e.g.:
       * - Program opens file and gets a File object.
       * - Program mutates file. File object is responsible for maintaining
       *   metadata changes locally -- typically in a Stats object.
       * - Program closes file. File object's metadata changes are synced with the
       *   file system.
       * @returns whether any changes have occurred.
       */
      update(data) {
        if (!data)
          return false;
        let hasChanged = false;
        for (const key of _inode_fields) {
          if (data[key] === void 0)
            continue;
          if (key == "ino" || key == "data")
            continue;
          if (this[key] === data[key])
            continue;
          if (key == "atimeMs" && this.flags & InodeFlags.NoAtime)
            continue;
          this[key] = data[key];
          hasChanged = true;
        }
        if (data.attributes) {
          this.attributes.copyFrom(data.attributes);
          hasChanged = true;
        }
        if (hasChanged)
          this.ctimeMs = Date.now();
        return hasChanged;
      }
    };
    return Inode2 = _classThis;
  })();
  function isDirectory(metadata) {
    return (metadata.mode & S_IFMT) === S_IFDIR;
  }
  function isSymbolicLink(metadata) {
    return (metadata.mode & S_IFMT) === S_IFLNK;
  }
  function isBlockDevice(metadata) {
    return (metadata.mode & S_IFMT) === S_IFBLK;
  }
  function isCharacterDevice(metadata) {
    return (metadata.mode & S_IFMT) === S_IFCHR;
  }
  function hasAccess($, inode, access3) {
    const credentials = $?.credentials || defaultContext.credentials;
    if (isSymbolicLink(inode) || credentials.euid === 0 || credentials.egid === 0)
      return true;
    let perm = 0;
    if (credentials.uid === inode.uid) {
      if (inode.mode & S_IRUSR)
        perm |= R_OK;
      if (inode.mode & S_IWUSR)
        perm |= W_OK;
      if (inode.mode & S_IXUSR)
        perm |= X_OK;
    }
    if (credentials.gid === inode.gid || credentials.groups.includes(Number(inode.gid))) {
      if (inode.mode & S_IRGRP)
        perm |= R_OK;
      if (inode.mode & S_IWGRP)
        perm |= W_OK;
      if (inode.mode & S_IXGRP)
        perm |= X_OK;
    }
    if (inode.mode & S_IROTH)
      perm |= R_OK;
    if (inode.mode & S_IWOTH)
      perm |= W_OK;
    if (inode.mode & S_IXOTH)
      perm |= X_OK;
    return (perm & access3) === access3;
  }

  // node_modules/@zenfs/core/dist/internal/file_index.js
  var version = 1;
  var Index = class _Index extends Map {
    maxSize = size_max;
    /**
     * Converts the index to JSON
     */
    toJSON() {
      return {
        version,
        maxSize: this.maxSize,
        entries: Object.fromEntries([...this].map(([k, v]) => [k, v.toJSON()]))
      };
    }
    /**
     * Converts the index to a string
     */
    toString() {
      return JSON.stringify(this.toJSON());
    }
    /**
     * Get the size in bytes of the index (including the size reported for each entry)
     */
    get byteSize() {
      let size = this.size * sizeof(Inode);
      for (const entry of this.values())
        size += entry.size;
      return size;
    }
    usage() {
      return {
        totalSpace: this.maxSize,
        freeSpace: this.maxSize - this.byteSize
      };
    }
    pathOf(id) {
      for (const [path, inode] of this) {
        if (inode.ino == id || inode.data == id)
          return path;
      }
    }
    getByID(id) {
      return this.entryByID(id)?.inode;
    }
    entryByID(id) {
      for (const [path, inode] of this) {
        if (inode.ino == id || inode.data == id)
          return { path, inode };
      }
    }
    directoryEntries(path) {
      const node = this.get(path);
      if (!node)
        throw withErrno("ENOENT");
      if ((node.mode & S_IFMT) != S_IFDIR)
        throw withErrno("ENOTDIR");
      const entries2 = {};
      for (const entry of this.keys()) {
        if (dirname(entry) == path && entry != path) {
          entries2[basename(entry)] = this.get(entry).ino;
        }
      }
      return entries2;
    }
    /**
     * Get the next available ID in the index
     * @internal
     */
    _alloc() {
      return Math.max(...[...this.values()].flatMap((i) => [i.ino, i.data])) + 1;
    }
    /**
     * Gets a list of entries for each directory in the index.
     * Use
     */
    directories() {
      const dirs = /* @__PURE__ */ new Map();
      for (const [path, node] of this) {
        if ((node.mode & S_IFMT) != S_IFDIR)
          continue;
        const entries2 = {};
        for (const entry of this.keys()) {
          if (dirname(entry) == path && entry != path)
            entries2[basename(entry)] = this.get(entry).ino;
        }
        dirs.set(path, entries2);
      }
      return dirs;
    }
    /**
     * Loads the index from JSON data
     */
    fromJSON(json) {
      if (json.version != version)
        throw withErrno("EINVAL", "Index version mismatch");
      this.clear();
      for (const [path, node] of Object.entries(json.entries)) {
        node.data ??= randomInt(1, size_max);
        if (path == "/")
          node.ino = 0;
        this.set(path, new Inode(node));
      }
      return this;
    }
    /**
     * Parses an index from a string
     */
    static parse(data) {
      if (!isJSON(data))
        throw withErrno("EINVAL", "Invalid JSON");
      const json = JSON.parse(data);
      const index = new _Index();
      index.fromJSON(json);
      return index;
    }
  };

  // node_modules/@zenfs/core/dist/internal/filesystem.js
  var _chunkSize = 4096;
  var FileSystem = class _FileSystem {
    type;
    name;
    label;
    /**
     * The last place this file system was mounted
     * @internal @protected
     */
    _mountPoint;
    /**
     * The UUID of the file system.
     * @privateRemarks This is only used by `ioctl`
     * @internal @protected
     */
    _uuid = crypto.randomUUID();
    get uuid() {
      return this._uuid;
    }
    /**
     * @see FileSystemAttributes
     */
    attributes = /* @__PURE__ */ new Map();
    constructor(type, name) {
      this.type = type;
      this.name = name;
      if (this.streamRead === _FileSystem.prototype.streamRead)
        this.attributes.set("default_stream_read");
      if (this.streamWrite === _FileSystem.prototype.streamWrite)
        this.attributes.set("default_stream_write");
    }
    toString() {
      return `${this.name} ${this.label ? JSON.stringify(this.label) : ""} (${this._mountPoint ? "mounted on " + this._mountPoint : "unmounted"})`;
    }
    /**
     * Default implementation.
     * @todo Implement
     * @experimental
     */
    usage() {
      return {
        totalSpace: 0,
        freeSpace: 0
      };
    }
    async ready() {
    }
    /**
     * Test whether or not `path` exists.
     */
    async exists(path) {
      try {
        await this.stat(path);
        return true;
      } catch (e) {
        return e.code != "ENOENT";
      }
    }
    /**
     * Test whether or not `path` exists.
     */
    existsSync(path) {
      try {
        this.statSync(path);
        return true;
      } catch (e) {
        return e.code != "ENOENT";
      }
    }
    /**
     * Read a file using a stream.
     * @privateRemarks The default implementation of `streamRead` uses "chunked" `read`s
     */
    streamRead(path, options) {
      return new ReadableStream({
        start: async (controller) => {
          const { size } = await this.stat(path);
          const { start = 0, end = size } = options;
          for (let offset = start; offset < end; offset += _chunkSize) {
            const bytesRead = offset + _chunkSize > end ? end - offset : _chunkSize;
            const buffer = new Uint8Array(bytesRead);
            await this.read(path, buffer, offset, offset + bytesRead).catch(controller.error.bind(controller));
            controller.enqueue(buffer);
          }
          controller.close();
        },
        type: "bytes"
      });
    }
    /**
     * Write a file using stream.
     * @privateRemarks The default implementation of `streamWrite` uses "chunked" `write`s
     */
    streamWrite(path, options) {
      let position = options.start ?? 0;
      return new WritableStream({
        write: async (chunk, controller) => {
          let err2 = false;
          const _err = (ex) => {
            err2 = true;
            controller.error(ex);
          };
          const { size } = await this.stat(path);
          await this.write(path, chunk, position).catch(_err);
          if (err2)
            return;
          position += chunk.byteLength;
          await this.touch(path, { mtimeMs: Date.now(), size: Math.max(size, position) }).catch(_err);
        }
      });
    }
  };

  // node_modules/utilium/dist/cache.js
  var Resource = class {
    id;
    _size;
    options;
    /** Regions used to reduce unneeded allocations. Think of sparse arrays. */
    regions = [];
    /** The full size of the resource */
    get size() {
      return this._size;
    }
    set size(value) {
      if (value >= this._size) {
        this._size = value;
        return;
      }
      this._size = value;
      for (let i = this.regions.length - 1; i >= 0; i--) {
        const region = this.regions[i];
        if (region.offset >= value) {
          this.regions.splice(i, 1);
          continue;
        }
        const maxLength = value - region.offset;
        if (region.data.byteLength > maxLength) {
          region.data = region.data.subarray(0, maxLength);
        }
        region.ranges = region.ranges.filter((range) => range.start < value).map((range) => {
          if (range.end > value) {
            return { start: range.start, end: value };
          }
          return range;
        });
      }
    }
    constructor(id, _size, options, resources) {
      this.id = id;
      this._size = _size;
      this.options = options;
      options.sparse ??= true;
      if (!options.sparse)
        this.regions.push({ offset: 0, data: new Uint8Array(_size), ranges: [] });
      resources?.set(id, this);
    }
    /** Combines adjacent regions and combines adjacent ranges within a region */
    collect() {
      if (!this.options.sparse)
        return;
      const { regionGapThreshold = 4095 } = this.options;
      for (let i = 0; i < this.regions.length - 1; ) {
        const current = this.regions[i];
        const next = this.regions[i + 1];
        if (next.offset - (current.offset + current.data.byteLength) > regionGapThreshold) {
          i++;
          continue;
        }
        current.ranges.push(...next.ranges);
        current.ranges.sort((a, b) => a.start - b.start);
        current.ranges = current.ranges.reduce((acc, range) => {
          if (!acc.length || acc.at(-1).end < range.start) {
            acc.push(range);
          } else {
            acc.at(-1).end = Math.max(acc.at(-1).end, range.end);
          }
          return acc;
        }, []);
        current.data = extendBuffer(current.data, next.offset + next.data.byteLength);
        current.data.set(next.data, next.offset - current.offset);
        this.regions.splice(i + 1, 1);
      }
    }
    /** Takes an initial range and finds the sub-ranges that are not in the cache */
    missing(start, end) {
      const missingRanges = [];
      for (const region of this.regions) {
        if (region.offset >= end)
          break;
        for (const range of region.ranges) {
          if (range.end <= start)
            continue;
          if (range.start >= end)
            break;
          if (range.start > start) {
            missingRanges.push({ start, end: Math.min(range.start, end) });
          }
          if (range.end > start)
            start = Math.max(start, range.end);
          if (start >= end)
            break;
        }
        if (start >= end)
          break;
      }
      if (start < end)
        missingRanges.push({ start, end });
      return missingRanges;
    }
    /**
     * Get the cached sub-ranges of an initial range.
     * This is conceptually the inverse of `missing`.
     */
    cached(start, end) {
      const cachedRanges = [];
      for (const region of this.regions) {
        if (region.offset >= end)
          break;
        for (const range of region.ranges) {
          if (range.end <= start)
            continue;
          if (range.start >= end)
            break;
          cachedRanges.push({
            start: Math.max(start, range.start),
            end: Math.min(end, range.end)
          });
        }
      }
      cachedRanges.sort((a, b) => a.start - b.start);
      const merged = [];
      for (const curr of cachedRanges) {
        const last = merged.at(-1);
        if (last && curr.start <= last.end) {
          last.end = Math.max(last.end, curr.end);
        } else {
          merged.push(curr);
        }
      }
      return merged;
    }
    /** Get the region who's ranges include an offset */
    regionAt(offset) {
      if (!this.regions.length)
        return;
      for (const region of this.regions) {
        if (region.offset > offset)
          break;
        if (offset >= region.offset && offset < region.offset + region.data.byteLength)
          return region;
      }
    }
    /** Add new data to the cache at given specified offset */
    add(data, offset) {
      const end = offset + data.byteLength;
      const region = this.regionAt(offset);
      if (region) {
        region.data = extendBuffer(region.data, end);
        region.data.set(data, offset);
        region.ranges.push({ start: offset, end });
        region.ranges.sort((a, b) => a.start - b.start);
        this.collect();
        return this;
      }
      const newRegion = { data, offset, ranges: [{ start: offset, end }] };
      const insertIndex = this.regions.findIndex((region2) => region2.offset > offset);
      if (insertIndex == -1) {
        this.regions.push(newRegion);
      } else {
        this.regions.splice(insertIndex, 0, newRegion);
      }
      this.collect();
      return this;
    }
  };

  // node_modules/@zenfs/core/dist/polyfills.js
  Promise.withResolvers ??= (warn("Using a polyfill of Promise.withResolvers"), function() {
    let _resolve2, _reject;
    const promise = new Promise((resolve2, reject) => {
      _resolve2 = resolve2;
      _reject = reject;
    });
    return { promise, resolve: _resolve2, reject: _reject };
  });
  Symbol["dispose"] ??= (warn("Using a polyfill of Symbol.dispose"), Symbol("Symbol.dispose"));
  Symbol["asyncDispose"] ??= (warn("Using a polyfill of Symbol.asyncDispose"), Symbol("Symbol.asyncDispose"));
  globalThis.crypto.randomUUID ??= (warn("Using a polyfill of crypto.randomUUID"), function randomUUID() {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = bytes[6] & 15 | 64;
    bytes[8] = bytes[8] & 63 | 128;
    const hex = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  });
  Uint8Array.prototype.toBase64 ??= (warn("Using a polyfill of Uint8Array.prototype.toBase64"), function toBase64() {
    return btoa(String.fromCharCode(...this));
  });
  Uint8Array.fromBase64 ??= (warn("Using a polyfill of Uint8Array.fromBase64"), function fromBase64(base64) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  });
  Uint8Array.prototype.toHex ??= (warn("Using a polyfill of Uint8Array.prototype.toHex"), function toHex() {
    return [...this].map((b) => b.toString(16).padStart(2, "0")).join("");
  });
  Uint8Array.fromHex ??= (warn("Using a polyfill of Uint8Array.fromHex"), function fromHex(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
    }
    return bytes;
  });

  // node_modules/@zenfs/core/dist/backends/store/store.js
  var Transaction = class {
    store;
    constructor(store) {
      this.store = store;
    }
  };
  var SyncTransaction = class extends Transaction {
    /* eslint-disable @typescript-eslint/require-await */
    async get(id, offset, end) {
      return this.getSync(id, offset, end);
    }
    async set(id, data, offset) {
      return this.setSync(id, data, offset);
    }
    async remove(id) {
      return this.removeSync(id);
    }
  };
  var AsyncTransaction = class extends Transaction {
    asyncDone = Promise.resolve();
    /**
     * Run a asynchronous operation from a sync context. Not magic and subject to (race) conditions.
     * @internal
     */
    async(promise) {
      this.asyncDone = this.asyncDone.then(() => promise);
    }
    /**
     * Gets a cache resource
     * If `info` is set and the resource doesn't exist, it will be created
     * @internal
     */
    _cached(id, info2) {
      this.store.cache ??= /* @__PURE__ */ new Map();
      const resource = this.store.cache.get(id);
      if (!resource)
        return !info2 ? void 0 : new Resource(id, info2.size, {}, this.store.cache);
      if (info2)
        resource.size = info2.size;
      return resource;
    }
    getSync(id, offset, end) {
      const resource = this._cached(id);
      if (!resource)
        return;
      end ??= resource.size;
      const missing = resource.missing(offset, end);
      for (const { start, end: end2 } of missing) {
        this.async(this.get(id, start, end2));
      }
      if (missing.length)
        throw withErrno("EAGAIN");
      const region = resource.regionAt(offset);
      if (!region) {
        warn("Missing cache region for " + id);
        return;
      }
      return region.data.subarray(offset - region.offset, end - region.offset);
    }
    setSync(id, data, offset) {
      this.async(this.set(id, data, offset));
    }
    removeSync(id) {
      this.async(this.remove(id));
      this.store.cache?.delete(id);
    }
  };
  var WrappedTransaction = class {
    raw;
    fs;
    /**
     * Whether the transaction was committed or aborted
     */
    done = false;
    flag(flag) {
      return this.raw.store.flags?.includes(flag) ?? false;
    }
    constructor(raw, fs) {
      this.raw = raw;
      this.fs = fs;
    }
    /**
     * Stores data in the keys we modify prior to modifying them.
     * Allows us to roll back commits.
     */
    originalData = /* @__PURE__ */ new Map();
    /**TransactionEntry
     * List of keys modified in this transaction, if any.
     */
    modifiedKeys = /* @__PURE__ */ new Set();
    keys() {
      return this.raw.keys();
    }
    async get(id, offset = 0, end) {
      const data = await this.raw.get(id, offset, end);
      this.stash(id);
      return data;
    }
    getSync(id, offset = 0, end) {
      const data = this.raw.getSync(id, offset, end);
      this.stash(id);
      return data;
    }
    async set(id, view2, offset = 0) {
      await this.markModified(id, offset, view2.byteLength);
      const buffer = view2 instanceof Uint8Array ? view2 : new Uint8Array(view2.buffer, view2.byteOffset, view2.byteLength);
      await this.raw.set(id, buffer, offset);
    }
    setSync(id, view2, offset = 0) {
      this.markModifiedSync(id, offset, view2.byteLength);
      const buffer = view2 instanceof Uint8Array ? view2 : new Uint8Array(view2.buffer, view2.byteOffset, view2.byteLength);
      this.raw.setSync(id, buffer, offset);
    }
    async remove(id) {
      await this.markModified(id, 0, void 0);
      await this.raw.remove(id);
    }
    removeSync(id) {
      this.markModifiedSync(id, 0, void 0);
      this.raw.removeSync(id);
    }
    commit() {
      this.done = true;
      return Promise.resolve();
    }
    commitSync() {
      this.done = true;
    }
    async abort() {
      if (this.done)
        return;
      for (const [id, entries2] of this.originalData) {
        if (!this.modifiedKeys.has(id))
          continue;
        if (entries2.some((ent) => !ent.data)) {
          await this.raw.remove(id);
          this.fs._remove(id);
          continue;
        }
        for (const entry of entries2.reverse()) {
          await this.raw.set(id, entry.data, entry.offset);
        }
      }
      this.done = true;
    }
    abortSync() {
      if (this.done)
        return;
      for (const [id, entries2] of this.originalData) {
        if (!this.modifiedKeys.has(id))
          continue;
        if (entries2.some((ent) => !ent.data)) {
          this.raw.removeSync(id);
          this.fs._remove(id);
          continue;
        }
        for (const entry of entries2.reverse()) {
          this.raw.setSync(id, entry.data, entry.offset);
        }
      }
      this.done = true;
    }
    async [Symbol.asyncDispose]() {
      if (this.done)
        return;
      await this.abort();
    }
    [Symbol.dispose]() {
      if (this.done)
        return;
      this.abortSync();
    }
    /**
     * Stashes given key value pair into `originalData` if it doesn't already exist.
     * Allows us to stash values the program is requesting anyway to
     * prevent needless `get` requests if the program modifies the data later
     * on during the transaction.
     */
    stash(id, data, offset = 0) {
      if (!this.originalData.has(id))
        this.originalData.set(id, []);
      this.originalData.get(id).push({ data, offset });
    }
    /**
     * Marks an id as modified, and stashes its value if it has not been stashed already.
     */
    async markModified(id, offset, length) {
      this.modifiedKeys.add(id);
      const end = length ? offset + length : void 0;
      try {
        this.stash(id, await this.raw.get(id, offset, end), offset);
      } catch (e) {
        if (!(this.raw instanceof AsyncTransaction))
          throw e;
        const tx = this.raw;
        const resource = tx._cached(id);
        if (!resource)
          throw e;
        for (const range of resource.cached(offset, end ?? offset)) {
          this.stash(id, await this.raw.get(id, range.start, range.end), range.start);
        }
      }
    }
    /**
     * Marks an id as modified, and stashes its value if it has not been stashed already.
     */
    markModifiedSync(id, offset, length) {
      this.modifiedKeys.add(id);
      const end = length ? offset + length : void 0;
      try {
        this.stash(id, this.raw.getSync(id, offset, end), offset);
      } catch (e) {
        if (!(this.raw instanceof AsyncTransaction))
          throw e;
        const tx = this.raw;
        const resource = tx._cached(id);
        if (!resource)
          throw e;
        for (const range of resource.cached(offset, end ?? offset)) {
          this.stash(id, this.raw.getSync(id, range.start, range.end), range.start);
        }
      }
    }
  };

  // node_modules/@zenfs/core/dist/backends/store/fs.js
  var __addDisposableResource = function(env, value, async) {
    if (value !== null && value !== void 0) {
      if (typeof value !== "object" && typeof value !== "function") throw new TypeError("Object expected.");
      var dispose, inner;
      if (async) {
        if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
        dispose = value[Symbol.asyncDispose];
      }
      if (dispose === void 0) {
        if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
        dispose = value[Symbol.dispose];
        if (async) inner = dispose;
      }
      if (typeof dispose !== "function") throw new TypeError("Object not disposable.");
      if (inner) dispose = function() {
        try {
          inner.call(this);
        } catch (e) {
          return Promise.reject(e);
        }
      };
      env.stack.push({ value, dispose, async });
    } else if (async) {
      env.stack.push({ async: true });
    }
    return value;
  };
  var __disposeResources = /* @__PURE__ */ function(SuppressedError2) {
    return function(env) {
      function fail(e) {
        env.error = env.hasError ? new SuppressedError2(e, env.error, "An error was suppressed during disposal.") : e;
        env.hasError = true;
      }
      var r, s = 0;
      function next() {
        while (r = env.stack.pop()) {
          try {
            if (!r.async && s === 1) return s = 0, env.stack.push(r), Promise.resolve().then(next);
            if (r.dispose) {
              var result = r.dispose.call(r.value);
              if (r.async) return s |= 2, Promise.resolve(result).then(next, function(e) {
                fail(e);
                return next();
              });
            } else s |= 1;
          } catch (e) {
            fail(e);
          }
        }
        if (s === 1) return env.hasError ? Promise.reject(env.error) : Promise.resolve();
        if (env.hasError) throw env.error;
      }
      return next();
    };
  }(typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
  });
  var StoreFS = class extends FileSystem {
    store;
    /**
     * A map of paths to inode IDs
     * @internal @hidden
     */
    _ids = /* @__PURE__ */ new Map([["/", 0]]);
    /**
     * A map of inode IDs to paths
     * @internal @hidden
     */
    _paths = /* @__PURE__ */ new Map([[0, new Set("/")]]);
    /**
     * Gets the first path associated with an inode
     */
    _path(id) {
      const [path] = this._paths.get(id) ?? [];
      return path;
    }
    /**
     * Add a inode/path pair
     */
    _add(ino, path) {
      if (!this._paths.has(ino))
        this._paths.set(ino, /* @__PURE__ */ new Set());
      this._paths.get(ino).add(path);
      this._ids.set(path, ino);
    }
    /**
     * Remove a inode/path pair
     */
    _remove(ino) {
      for (const path of this._paths.get(ino) ?? []) {
        this._ids.delete(path);
      }
      this._paths.delete(ino);
    }
    /**
     * Move paths in the tables
     */
    _move(from2, to) {
      const toMove = [];
      for (const [path, ino] of this._ids) {
        const rel = relative(from2, path);
        if (rel.startsWith(".."))
          continue;
        let newKey = join(to, rel);
        if (newKey.endsWith("/"))
          newKey = newKey.slice(0, -1);
        toMove.push({ oldKey: path, newKey, ino });
      }
      for (const { oldKey, newKey, ino } of toMove) {
        this._ids.delete(oldKey);
        this._ids.set(newKey, ino);
        const p = this._paths.get(ino);
        if (!p) {
          warn("Missing paths in table for ino " + ino);
          continue;
        }
        p.delete(oldKey);
        p.add(newKey);
      }
    }
    _initialized = false;
    async ready() {
      if (this._initialized)
        return;
      this.checkRootSync();
      await this.checkRoot();
      await this._populate();
      this._initialized = true;
    }
    constructor(store) {
      super(store.type ?? 1802921587, store.name);
      this.store = store;
      store.fs = this;
      this._uuid = store.uuid ?? this.uuid;
      this.label = store.label;
      debug(this.name + ": supports features: " + this.store.flags?.join(", "));
    }
    /**
     * @experimental
     */
    usage() {
      return this.store.usage?.() || {
        totalSpace: 0,
        freeSpace: 0
      };
    }
    /**
     * Load an index into the StoreFS.
     * You *must* manually add non-directory files
     */
    async loadIndex(index) {
      const env_1 = { stack: [], error: void 0, hasError: false };
      try {
        const tx = __addDisposableResource(env_1, this.transaction(), true);
        const dirs = index.directories();
        for (const [path, inode] of index) {
          this._add(inode.ino, path);
          await tx.set(inode.ino, inode);
          if (dirs.has(path))
            await tx.set(inode.data, encodeDirListing(dirs.get(path)));
        }
        await tx.commit();
      } catch (e_1) {
        env_1.error = e_1;
        env_1.hasError = true;
      } finally {
        const result_1 = __disposeResources(env_1);
        if (result_1)
          await result_1;
      }
    }
    /**
     * Load an index into the StoreFS.
     * You *must* manually add non-directory files
     */
    loadIndexSync(index) {
      const env_2 = { stack: [], error: void 0, hasError: false };
      try {
        const tx = __addDisposableResource(env_2, this.transaction(), false);
        const dirs = index.directories();
        for (const [path, inode] of index) {
          this._add(inode.ino, path);
          tx.setSync(inode.ino, inode);
          if (dirs.has(path))
            tx.setSync(inode.data, encodeDirListing(dirs.get(path)));
        }
        tx.commitSync();
      } catch (e_2) {
        env_2.error = e_2;
        env_2.hasError = true;
      } finally {
        __disposeResources(env_2);
      }
    }
    async createIndex() {
      const env_3 = { stack: [], error: void 0, hasError: false };
      try {
        const index = new Index();
        const tx = __addDisposableResource(env_3, this.transaction(), true);
        const queue = [["/", 0]];
        const silence = canary(withErrno("EDEADLK"));
        while (queue.length) {
          const [path, ino] = queue.shift();
          const inode = new Inode(await tx.get(ino));
          index.set(path, inode);
          if (inode.mode & S_IFDIR) {
            const dir = decodeDirListing(await tx.get(inode.data) ?? _throw(withErrno("ENODATA")));
            for (const [name, id] of Object.entries(dir)) {
              queue.push([join(path, name), id]);
            }
          }
        }
        silence();
        return index;
      } catch (e_3) {
        env_3.error = e_3;
        env_3.hasError = true;
      } finally {
        const result_2 = __disposeResources(env_3);
        if (result_2)
          await result_2;
      }
    }
    createIndexSync() {
      const env_4 = { stack: [], error: void 0, hasError: false };
      try {
        const index = new Index();
        const tx = __addDisposableResource(env_4, this.transaction(), false);
        const queue = [["/", 0]];
        const silence = canary(withErrno("EDEADLK"));
        while (queue.length) {
          const [path, ino] = queue.shift();
          const inode = new Inode(tx.getSync(ino));
          index.set(path, inode);
          if (inode.mode & S_IFDIR) {
            const dir = decodeDirListing(tx.getSync(inode.data) ?? _throw(withErrno("ENODATA")));
            for (const [name, id] of Object.entries(dir)) {
              queue.push([join(path, name), id]);
            }
          }
        }
        silence();
        return index;
      } catch (e_4) {
        env_4.error = e_4;
        env_4.hasError = true;
      } finally {
        __disposeResources(env_4);
      }
    }
    /**
     * @todo Make rename compatible with the cache.
     */
    async rename(oldPath, newPath) {
      const env_5 = { stack: [], error: void 0, hasError: false };
      try {
        const tx = __addDisposableResource(env_5, this.transaction(), true);
        const _old = parse(oldPath), _new = parse(newPath), oldDirNode = await this.findInode(tx, _old.dir), oldDirList = decodeDirListing(await tx.get(oldDirNode.data) ?? _throw(withErrno("ENODATA")));
        if (!oldDirList[_old.base])
          throw withErrno("ENOENT");
        const ino = oldDirList[_old.base];
        if (ino != this._ids.get(oldPath))
          err(`Ino mismatch while renaming ${oldPath} to ${newPath}`);
        delete oldDirList[_old.base];
        if ((_new.dir + "/").startsWith(oldPath + "/"))
          throw withErrno("EBUSY");
        const sameParent = _new.dir == _old.dir;
        const newDirNode = sameParent ? oldDirNode : await this.findInode(tx, _new.dir);
        const newDirList = sameParent ? oldDirList : decodeDirListing(await tx.get(newDirNode.data) ?? _throw(withErrno("ENODATA")));
        if (newDirList[_new.base]) {
          const existing = new Inode(await tx.get(newDirList[_new.base]) ?? _throw(withErrno("ENOENT")));
          if (!existing.toStats().isFile())
            throw withErrno("EISDIR");
          await tx.remove(existing.data);
          await tx.remove(newDirList[_new.base]);
        }
        newDirList[_new.base] = ino;
        await tx.set(oldDirNode.data, encodeDirListing(oldDirList));
        await tx.set(newDirNode.data, encodeDirListing(newDirList));
        await tx.commit();
        this._move(oldPath, newPath);
      } catch (e_5) {
        env_5.error = e_5;
        env_5.hasError = true;
      } finally {
        const result_3 = __disposeResources(env_5);
        if (result_3)
          await result_3;
      }
    }
    renameSync(oldPath, newPath) {
      const env_6 = { stack: [], error: void 0, hasError: false };
      try {
        const tx = __addDisposableResource(env_6, this.transaction(), false);
        const _old = parse(oldPath), _new = parse(newPath), oldDirNode = this.findInodeSync(tx, _old.dir), oldDirList = decodeDirListing(tx.getSync(oldDirNode.data) ?? _throw(withErrno("ENODATA")));
        if (!oldDirList[_old.base])
          throw withErrno("ENOENT");
        const ino = oldDirList[_old.base];
        if (ino != this._ids.get(oldPath))
          err(`Ino mismatch while renaming ${oldPath} to ${newPath}`);
        delete oldDirList[_old.base];
        if ((_new.dir + "/").startsWith(oldPath + "/"))
          throw withErrno("EBUSY");
        const sameParent = _new.dir === _old.dir;
        const newDirNode = sameParent ? oldDirNode : this.findInodeSync(tx, _new.dir);
        const newDirList = sameParent ? oldDirList : decodeDirListing(tx.getSync(newDirNode.data) ?? _throw(withErrno("ENODATA")));
        if (newDirList[_new.base]) {
          const existing = new Inode(tx.getSync(newDirList[_new.base]) ?? _throw(withErrno("ENOENT")));
          if (!existing.toStats().isFile())
            throw withErrno("EISDIR");
          tx.removeSync(existing.data);
          tx.removeSync(newDirList[_new.base]);
        }
        newDirList[_new.base] = ino;
        tx.setSync(oldDirNode.data, encodeDirListing(oldDirList));
        tx.setSync(newDirNode.data, encodeDirListing(newDirList));
        tx.commitSync();
        this._move(oldPath, newPath);
      } catch (e_6) {
        env_6.error = e_6;
        env_6.hasError = true;
      } finally {
        __disposeResources(env_6);
      }
    }
    async stat(path) {
      const env_7 = { stack: [], error: void 0, hasError: false };
      try {
        const tx = __addDisposableResource(env_7, this.transaction(), true);
        return await this.findInode(tx, path);
      } catch (e_7) {
        env_7.error = e_7;
        env_7.hasError = true;
      } finally {
        const result_4 = __disposeResources(env_7);
        if (result_4)
          await result_4;
      }
    }
    statSync(path) {
      const env_8 = { stack: [], error: void 0, hasError: false };
      try {
        const tx = __addDisposableResource(env_8, this.transaction(), false);
        return this.findInodeSync(tx, path);
      } catch (e_8) {
        env_8.error = e_8;
        env_8.hasError = true;
      } finally {
        __disposeResources(env_8);
      }
    }
    async touch(path, metadata) {
      const env_9 = { stack: [], error: void 0, hasError: false };
      try {
        const tx = __addDisposableResource(env_9, this.transaction(), true);
        const inode = await this.findInode(tx, path);
        if (inode.update(metadata)) {
          this._add(inode.ino, path);
          tx.setSync(inode.ino, inode);
        }
        await tx.commit();
      } catch (e_9) {
        env_9.error = e_9;
        env_9.hasError = true;
      } finally {
        const result_5 = __disposeResources(env_9);
        if (result_5)
          await result_5;
      }
    }
    touchSync(path, metadata) {
      const env_10 = { stack: [], error: void 0, hasError: false };
      try {
        const tx = __addDisposableResource(env_10, this.transaction(), false);
        const inode = this.findInodeSync(tx, path);
        if (inode.update(metadata)) {
          this._add(inode.ino, path);
          tx.setSync(inode.ino, inode);
        }
        tx.commitSync();
      } catch (e_10) {
        env_10.error = e_10;
        env_10.hasError = true;
      } finally {
        __disposeResources(env_10);
      }
    }
    async createFile(path, options) {
      options.mode |= S_IFREG;
      return await this.commitNew(path, options, new Uint8Array());
    }
    createFileSync(path, options) {
      options.mode |= S_IFREG;
      return this.commitNewSync(path, options, new Uint8Array());
    }
    async unlink(path) {
      return this.remove(path, false);
    }
    unlinkSync(path) {
      this.removeSync(path, false);
    }
    async rmdir(path) {
      if ((await this.readdir(path)).length)
        throw withErrno("ENOTEMPTY");
      await this.remove(path, true);
    }
    rmdirSync(path) {
      if (this.readdirSync(path).length)
        throw withErrno("ENOTEMPTY");
      this.removeSync(path, true);
    }
    async mkdir(path, options) {
      options.mode |= S_IFDIR;
      return await this.commitNew(path, options, encodeUTF8("{}"));
    }
    mkdirSync(path, options) {
      options.mode |= S_IFDIR;
      return this.commitNewSync(path, options, encodeUTF8("{}"));
    }
    async readdir(path) {
      const env_11 = { stack: [], error: void 0, hasError: false };
      try {
        const tx = __addDisposableResource(env_11, this.transaction(), true);
        const node = await this.findInode(tx, path);
        return Object.keys(decodeDirListing(await tx.get(node.data) ?? _throw(withErrno("ENOENT"))));
      } catch (e_11) {
        env_11.error = e_11;
        env_11.hasError = true;
      } finally {
        const result_6 = __disposeResources(env_11);
        if (result_6)
          await result_6;
      }
    }
    readdirSync(path) {
      const env_12 = { stack: [], error: void 0, hasError: false };
      try {
        const tx = __addDisposableResource(env_12, this.transaction(), false);
        const node = this.findInodeSync(tx, path);
        return Object.keys(decodeDirListing(tx.getSync(node.data) ?? _throw(withErrno("ENOENT"))));
      } catch (e_12) {
        env_12.error = e_12;
        env_12.hasError = true;
      } finally {
        __disposeResources(env_12);
      }
    }
    /**
     * Updated the inode and data node at `path`
     */
    async sync() {
    }
    /**
     * Updated the inode and data node at `path`
     */
    syncSync() {
    }
    async link(target, link3) {
      const env_13 = { stack: [], error: void 0, hasError: false };
      try {
        const tx = __addDisposableResource(env_13, this.transaction(), true);
        const newDir = dirname(link3), newDirNode = await this.findInode(tx, newDir), listing = decodeDirListing(await tx.get(newDirNode.data) ?? _throw(withErrno("ENOENT")));
        const inode = await this.findInode(tx, target);
        inode.nlink++;
        listing[basename(link3)] = inode.ino;
        this._add(inode.ino, link3);
        await tx.set(inode.ino, inode);
        await tx.set(newDirNode.data, encodeDirListing(listing));
        await tx.commit();
      } catch (e_13) {
        env_13.error = e_13;
        env_13.hasError = true;
      } finally {
        const result_7 = __disposeResources(env_13);
        if (result_7)
          await result_7;
      }
    }
    linkSync(target, link3) {
      const env_14 = { stack: [], error: void 0, hasError: false };
      try {
        const tx = __addDisposableResource(env_14, this.transaction(), false);
        const newDir = dirname(link3), newDirNode = this.findInodeSync(tx, newDir), listing = decodeDirListing(tx.getSync(newDirNode.data) ?? _throw(withErrno("ENOENT")));
        const inode = this.findInodeSync(tx, target);
        inode.nlink++;
        listing[basename(link3)] = inode.ino;
        this._add(inode.ino, link3);
        tx.setSync(inode.ino, inode);
        tx.setSync(newDirNode.data, encodeDirListing(listing));
        tx.commitSync();
      } catch (e_14) {
        env_14.error = e_14;
        env_14.hasError = true;
      } finally {
        __disposeResources(env_14);
      }
    }
    async read(path, buffer, offset, end) {
      const env_15 = { stack: [], error: void 0, hasError: false };
      try {
        const tx = __addDisposableResource(env_15, this.transaction(), true);
        const inode = await this.findInode(tx, path);
        if (inode.size == 0)
          return;
        const data = await tx.get(inode.data, offset, end) ?? _throw(withErrno("ENODATA"));
        const _ = tx.flag("partial") ? data : data.subarray(offset, end);
        if (_.byteLength > buffer.byteLength)
          err(`Trying to place ${_.byteLength} bytes into a ${buffer.byteLength} byte buffer on read`);
        buffer.set(_);
      } catch (e_15) {
        env_15.error = e_15;
        env_15.hasError = true;
      } finally {
        const result_8 = __disposeResources(env_15);
        if (result_8)
          await result_8;
      }
    }
    readSync(path, buffer, offset, end) {
      const env_16 = { stack: [], error: void 0, hasError: false };
      try {
        const tx = __addDisposableResource(env_16, this.transaction(), false);
        const inode = this.findInodeSync(tx, path);
        if (inode.size == 0)
          return;
        const data = tx.getSync(inode.data, offset, end) ?? _throw(withErrno("ENODATA"));
        const _ = tx.flag("partial") ? data : data.subarray(offset, end);
        if (_.byteLength > buffer.byteLength)
          err(`Trying to place ${_.byteLength} bytes into a ${buffer.byteLength} byte buffer on read`);
        buffer.set(_);
      } catch (e_16) {
        env_16.error = e_16;
        env_16.hasError = true;
      } finally {
        __disposeResources(env_16);
      }
    }
    async write(path, data, offset) {
      const env_17 = { stack: [], error: void 0, hasError: false };
      try {
        const tx = __addDisposableResource(env_17, this.transaction(), true);
        const inode = await this.findInode(tx, path);
        let buffer = data;
        if (!tx.flag("partial")) {
          buffer = extendBuffer(await tx.get(inode.data) ?? new Uint8Array(), offset + data.byteLength);
          buffer.set(data, offset);
          offset = 0;
        }
        await tx.set(inode.data, buffer, offset);
        this._add(inode.ino, path);
        await tx.commit();
      } catch (e_17) {
        env_17.error = e_17;
        env_17.hasError = true;
      } finally {
        const result_9 = __disposeResources(env_17);
        if (result_9)
          await result_9;
      }
    }
    writeSync(path, data, offset) {
      const env_18 = { stack: [], error: void 0, hasError: false };
      try {
        const tx = __addDisposableResource(env_18, this.transaction(), false);
        const inode = this.findInodeSync(tx, path);
        let buffer = data;
        if (!tx.flag("partial")) {
          buffer = extendBuffer(tx.getSync(inode.data) ?? new Uint8Array(), offset + data.byteLength);
          buffer.set(data, offset);
          offset = 0;
        }
        tx.setSync(inode.data, buffer, offset);
        this._add(inode.ino, path);
        tx.commitSync();
      } catch (e_18) {
        env_18.error = e_18;
        env_18.hasError = true;
      } finally {
        __disposeResources(env_18);
      }
    }
    /**
     * Wraps a transaction
     * @internal @hidden
     */
    transaction() {
      return new WrappedTransaction(this.store.transaction(), this);
    }
    /**
     * Checks if the root directory exists. Creates it if it doesn't.
     */
    async checkRoot() {
      const env_19 = { stack: [], error: void 0, hasError: false };
      try {
        const tx = __addDisposableResource(env_19, this.transaction(), true);
        if (await tx.get(rootIno))
          return;
        const inode = new Inode({ ino: rootIno, data: 1, mode: 511 | S_IFDIR });
        await tx.set(inode.data, encodeUTF8("{}"));
        this._add(rootIno, "/");
        await tx.set(rootIno, inode);
        await tx.commit();
      } catch (e_19) {
        env_19.error = e_19;
        env_19.hasError = true;
      } finally {
        const result_10 = __disposeResources(env_19);
        if (result_10)
          await result_10;
      }
    }
    /**
     * Checks if the root directory exists. Creates it if it doesn't.
     */
    checkRootSync() {
      const env_20 = { stack: [], error: void 0, hasError: false };
      try {
        const tx = __addDisposableResource(env_20, this.transaction(), false);
        if (tx.getSync(rootIno))
          return;
        const inode = new Inode({ ino: rootIno, data: 1, mode: 511 | S_IFDIR });
        tx.setSync(inode.data, encodeUTF8("{}"));
        this._add(rootIno, "/");
        tx.setSync(rootIno, inode);
        tx.commitSync();
      } catch (e_20) {
        env_20.error = e_20;
        env_20.hasError = true;
      } finally {
        __disposeResources(env_20);
      }
    }
    /**
     * Populates the `_ids` and `_paths` maps with all existing files stored in the underlying `Store`.
     */
    async _populate() {
      const env_21 = { stack: [], error: void 0, hasError: false };
      try {
        if (this._initialized) {
          warn("Attempted to populate tables after initialization");
          return;
        }
        debug("Populating tables with existing store metadata");
        const tx = __addDisposableResource(env_21, this.transaction(), true);
        const rootData = await tx.get(rootIno);
        if (!rootData) {
          notice("Store does not have a root inode");
          const inode = new Inode({ ino: rootIno, data: 1, mode: 511 | S_IFDIR });
          await tx.set(inode.data, encodeUTF8("{}"));
          this._add(rootIno, "/");
          await tx.set(rootIno, inode);
          await tx.commit();
          return;
        }
        if (rootData.length < sizeof(Inode)) {
          crit("Store contains an invalid root inode. Refusing to populate tables");
          return;
        }
        const visitedDirectories = /* @__PURE__ */ new Set();
        let i = 0;
        const queue = [["/", rootIno]];
        while (queue.length > 0) {
          i++;
          const [path, ino] = queue.shift();
          this._add(ino, path);
          const inodeData = await tx.get(ino);
          if (!inodeData) {
            warn("Store is missing data for inode: " + ino);
            continue;
          }
          if (inodeData.length < sizeof(Inode)) {
            warn(`Invalid inode size for ino ${ino}: ${inodeData.length}`);
            continue;
          }
          const inode = new Inode(inodeData);
          if ((inode.mode & S_IFDIR) != S_IFDIR || visitedDirectories.has(ino)) {
            continue;
          }
          visitedDirectories.add(ino);
          const dirData = await tx.get(inode.data);
          if (!dirData) {
            warn("Store is missing directory data: " + inode.data);
            continue;
          }
          const dirListing = decodeDirListing(dirData);
          for (const [entryName, childIno] of Object.entries(dirListing)) {
            queue.push([join(path, entryName), childIno]);
          }
        }
        debug(`Added ${i} existing inode(s) from store`);
      } catch (e_21) {
        env_21.error = e_21;
        env_21.hasError = true;
      } finally {
        const result_11 = __disposeResources(env_21);
        if (result_11)
          await result_11;
      }
    }
    /**
     * Find an inode without using the ID tables
     */
    async _findInode(tx, path, visited = /* @__PURE__ */ new Set()) {
      if (visited.has(path))
        throw crit(withErrno("EIO", "Infinite loop detected while finding inode"));
      visited.add(path);
      if (path == "/")
        return new Inode(await tx.get(rootIno) ?? _throw(withErrno("ENODATA")));
      const { dir: parent, base: filename } = parse(path);
      const inode = await this._findInode(tx, parent, visited);
      const dirList = decodeDirListing(await tx.get(inode.data) ?? _throw(withErrno("ENODATA")));
      if (!(filename in dirList))
        throw withErrno("ENOENT");
      return new Inode(await tx.get(dirList[filename]) ?? _throw(withErrno("ENODATA")));
    }
    /**
     * Find an inode without using the ID tables
     */
    _findInodeSync(tx, path, visited = /* @__PURE__ */ new Set()) {
      if (visited.has(path))
        throw crit(withErrno("EIO", "Infinite loop detected while finding inode"));
      visited.add(path);
      if (path == "/")
        return new Inode(tx.getSync(rootIno) ?? _throw(withErrno("ENOENT")));
      const { dir: parent, base: filename } = parse(path);
      const inode = this._findInodeSync(tx, parent, visited);
      const dir = decodeDirListing(tx.getSync(inode.data) ?? _throw(withErrno("ENODATA")));
      if (!(filename in dir))
        throw withErrno("ENOENT");
      return new Inode(tx.getSync(dir[filename]) ?? _throw(withErrno("ENODATA")));
    }
    /**
     * Finds the Inode of `path`.
     * @param path The path to look up.
     * @todo memoize/cache
     */
    async findInode(tx, path) {
      if (this.attributes.has("no_id_tables"))
        return await this._findInode(tx, path);
      const ino = this._ids.get(path);
      if (ino === void 0)
        throw withErrno("ENOENT");
      return new Inode(await tx.get(ino) ?? _throw(withErrno("ENOENT")));
    }
    /**
     * Finds the Inode of `path`.
     * @param path The path to look up.
     * @return The Inode of the path p.
     * @todo memoize/cache
     */
    findInodeSync(tx, path) {
      if (this.attributes.has("no_id_tables"))
        return this._findInodeSync(tx, path);
      const ino = this._ids.get(path);
      if (ino === void 0)
        throw withErrno("ENOENT");
      return new Inode(tx.getSync(ino) ?? _throw(withErrno("ENOENT")));
    }
    _lastID;
    /** Allocates a new ID and adds the ID/path */
    allocNew(path) {
      this._lastID ??= Math.max(...this._paths.keys());
      this._lastID += 2;
      const id = this._lastID;
      if (id > size_max)
        throw err(withErrno("ENOSPC", "No IDs available"));
      this._add(id, path);
      return id;
    }
    /**
     * Commits a new file (well, a FILE or a DIRECTORY) to the file system with `mode`.
     * Note: This will commit the transaction.
     * @param path The path to the new file.
     * @param options The options to create the new file with.
     * @param data The data to store at the file's data node.
     */
    async commitNew(path, options, data) {
      const env_22 = { stack: [], error: void 0, hasError: false };
      try {
        if (path == "/")
          throw withErrno("EEXIST");
        const tx = __addDisposableResource(env_22, this.transaction(), true);
        const { dir: parentPath, base: fname } = parse(path);
        const parent = await this.findInode(tx, parentPath);
        const listing = decodeDirListing(await tx.get(parent.data) ?? _throw(withErrno("ENOENT")));
        if (listing[fname])
          throw withErrno("EEXIST");
        const id = this.allocNew(path);
        const inode = new Inode({
          ...options,
          ino: id,
          data: id + 1,
          size: data.byteLength,
          nlink: 1
        });
        await tx.set(inode.ino, inode);
        await tx.set(inode.data, data);
        listing[fname] = inode.ino;
        await tx.set(parent.data, encodeDirListing(listing));
        await tx.commit();
        return inode;
      } catch (e_22) {
        env_22.error = e_22;
        env_22.hasError = true;
      } finally {
        const result_12 = __disposeResources(env_22);
        if (result_12)
          await result_12;
      }
    }
    /**
     * Commits a new file (well, a FILE or a DIRECTORY) to the file system with `mode`.
     * Note: This will commit the transaction.
     * @param path The path to the new file.
     * @param options The options to create the new file with.
     * @param data The data to store at the file's data node.
     * @return The Inode for the new file.
     */
    commitNewSync(path, options, data) {
      const env_23 = { stack: [], error: void 0, hasError: false };
      try {
        if (path == "/")
          throw withErrno("EEXIST");
        const tx = __addDisposableResource(env_23, this.transaction(), false);
        const { dir: parentPath, base: fname } = parse(path);
        const parent = this.findInodeSync(tx, parentPath);
        const listing = decodeDirListing(tx.getSync(parent.data) ?? _throw(withErrno("ENOENT")));
        if (listing[fname])
          throw withErrno("EEXIST");
        const id = this.allocNew(path);
        const inode = new Inode({
          ...options,
          ino: id,
          data: id + 1,
          size: data.byteLength,
          nlink: 1
        });
        tx.setSync(inode.ino, inode);
        tx.setSync(inode.data, data);
        listing[fname] = inode.ino;
        tx.setSync(parent.data, encodeDirListing(listing));
        tx.commitSync();
        return inode;
      } catch (e_23) {
        env_23.error = e_23;
        env_23.hasError = true;
      } finally {
        __disposeResources(env_23);
      }
    }
    /**
     * Remove all traces of `path` from the file system.
     * @param path The path to remove from the file system.
     * @param isDir Does the path belong to a directory, or a file?
     */
    async remove(path, isDir) {
      const env_24 = { stack: [], error: void 0, hasError: false };
      try {
        const tx = __addDisposableResource(env_24, this.transaction(), true);
        const { dir: parent, base: fileName } = parse(path), parentNode = await this.findInode(tx, parent), listing = decodeDirListing(await tx.get(parentNode.data) ?? _throw(withErrno("ENOENT")));
        if (!listing[fileName])
          throw withErrno("ENOENT");
        const ino = listing[fileName];
        const inode = new Inode(await tx.get(ino) ?? _throw(withErrno("ENOENT")));
        delete listing[fileName];
        if (!isDir && isDirectory(inode))
          throw withErrno("EISDIR");
        await tx.set(parentNode.data, encodeDirListing(listing));
        if (inode.nlink > 1) {
          inode.update({ nlink: inode.nlink - 1 });
          await tx.set(inode.ino, inode);
        } else {
          await tx.remove(inode.data);
          await tx.remove(ino);
          this._remove(ino);
        }
        await tx.commit();
      } catch (e_24) {
        env_24.error = e_24;
        env_24.hasError = true;
      } finally {
        const result_13 = __disposeResources(env_24);
        if (result_13)
          await result_13;
      }
    }
    /**
     * Remove all traces of `path` from the file system.
     * @param path The path to remove from the file system.
     * @param isDir Does the path belong to a directory, or a file?
     */
    removeSync(path, isDir) {
      const env_25 = { stack: [], error: void 0, hasError: false };
      try {
        const tx = __addDisposableResource(env_25, this.transaction(), false);
        const { dir: parent, base: fileName } = parse(path), parentNode = this.findInodeSync(tx, parent), listing = decodeDirListing(tx.getSync(parentNode.data) ?? _throw(withErrno("ENOENT"))), ino = listing[fileName];
        if (!ino)
          throw withErrno("ENOENT");
        const inode = new Inode(tx.getSync(ino) ?? _throw(withErrno("ENOENT")));
        delete listing[fileName];
        if (!isDir && isDirectory(inode))
          throw withErrno("EISDIR");
        tx.setSync(parentNode.data, encodeDirListing(listing));
        if (inode.nlink > 1) {
          inode.update({ nlink: inode.nlink - 1 });
          tx.setSync(inode.ino, inode);
        } else {
          tx.removeSync(inode.data);
          tx.removeSync(ino);
          this._remove(ino);
        }
        tx.commitSync();
      } catch (e_25) {
        env_25.error = e_25;
        env_25.hasError = true;
      } finally {
        __disposeResources(env_25);
      }
    }
  };

  // node_modules/@zenfs/core/dist/backends/store/map.js
  var SyncMapTransaction = class extends SyncTransaction {
    // eslint-disable-next-line @typescript-eslint/require-await
    async keys() {
      return this.store.keys();
    }
    async get(id) {
      return await (this.store.getAsync?.(id) ?? this.store.get(id));
    }
    getSync(id) {
      return this.store.get(id);
    }
    setSync(id, data) {
      this.store.set(id, data);
    }
    removeSync(id) {
      this.store.delete(id);
    }
  };

  // node_modules/@zenfs/core/dist/backends/memory.js
  var InMemoryStore = class extends Map {
    maxSize;
    label;
    flags = [];
    name = "tmpfs";
    constructor(maxSize = size_max, label) {
      super();
      this.maxSize = maxSize;
      this.label = label;
    }
    async sync() {
    }
    transaction() {
      return new SyncMapTransaction(this);
    }
    get bytes() {
      let size = this.size * 4;
      for (const data of this.values())
        size += data.byteLength;
      return size;
    }
    usage() {
      return {
        totalSpace: this.maxSize,
        freeSpace: this.maxSize - this.bytes
      };
    }
  };
  var _InMemory = {
    name: "InMemory",
    options: {
      maxSize: { type: "number", required: false },
      label: { type: "string", required: false }
    },
    create({ maxSize, label }) {
      const fs = new StoreFS(new InMemoryStore(maxSize, label));
      fs.checkRootSync();
      return fs;
    }
  };
  var InMemory = _InMemory;

  // node_modules/@zenfs/core/dist/internal/devices.js
  var emptyBuffer = new Uint8Array();

  // node_modules/@zenfs/core/dist/vfs/config.js
  var checkAccess = true;

  // node_modules/@zenfs/core/dist/vfs/index.js
  var vfs_exports = {};
  __export(vfs_exports, {
    BigIntStatsFs: () => BigIntStatsFs,
    Dir: () => Dir,
    DirType: () => DirType,
    Dirent: () => Dirent,
    IOC: () => IOC,
    IOC32: () => IOC32,
    ReadStream: () => ReadStream,
    Stats: () => Stats,
    StatsFs: () => StatsFs,
    WriteStream: () => WriteStream,
    access: () => access2,
    accessSync: () => accessSync,
    appendFile: () => appendFile2,
    appendFileSync: () => appendFileSync,
    chmod: () => chmod2,
    chmodSync: () => chmodSync,
    chown: () => chown2,
    chownSync: () => chownSync,
    chroot: () => chroot,
    close: () => close,
    closeSync: () => closeSync,
    constants: () => constants_exports,
    copyFile: () => copyFile2,
    copyFileSync: () => copyFileSync,
    cp: () => cp2,
    cpSync: () => cpSync,
    createReadStream: () => createReadStream,
    createWriteStream: () => createWriteStream,
    dtToIf: () => dtToIf,
    exists: () => exists2,
    existsSync: () => existsSync,
    fchmod: () => fchmod,
    fchmodSync: () => fchmodSync,
    fchown: () => fchown,
    fchownSync: () => fchownSync,
    fdatasync: () => fdatasync,
    fdatasyncSync: () => fdatasyncSync,
    fstat: () => fstat,
    fstatSync: () => fstatSync,
    fsync: () => fsync,
    fsyncSync: () => fsyncSync,
    ftruncate: () => ftruncate,
    ftruncateSync: () => ftruncateSync,
    futimes: () => futimes,
    futimesSync: () => futimesSync,
    glob: () => glob2,
    globSync: () => globSync,
    ifToDt: () => ifToDt,
    ioctl: () => ioctl,
    ioctlSync: () => ioctlSync,
    lchmod: () => lchmod2,
    lchmodSync: () => lchmodSync,
    lchown: () => lchown2,
    lchownSync: () => lchownSync,
    link: () => link2,
    linkSync: () => linkSync,
    lopenSync: () => lopenSync,
    lstat: () => lstat2,
    lstatSync: () => lstatSync,
    lutimes: () => lutimes2,
    lutimesSync: () => lutimesSync,
    mkdir: () => mkdir2,
    mkdirSync: () => mkdirSync,
    mkdtemp: () => mkdtemp2,
    mkdtempSync: () => mkdtempSync,
    mount: () => mount,
    open: () => open2,
    openAsBlob: () => openAsBlob,
    openSync: () => openSync,
    opendir: () => opendir2,
    opendirSync: () => opendirSync,
    promises: () => promises_exports,
    read: () => read,
    readFile: () => readFile2,
    readFileSync: () => readFileSync,
    readSync: () => readSync,
    readdir: () => readdir2,
    readdirSync: () => readdirSync,
    readlink: () => readlink2,
    readlinkSync: () => readlinkSync,
    readv: () => readv,
    readvSync: () => readvSync,
    realpath: () => realpath2,
    realpathSync: () => realpathSync,
    rename: () => rename2,
    renameSync: () => renameSync,
    rm: () => rm2,
    rmSync: () => rmSync,
    rmdir: () => rmdir2,
    rmdirSync: () => rmdirSync,
    stat: () => stat2,
    statSync: () => statSync,
    statfs: () => statfs2,
    statfsSync: () => statfsSync,
    symlink: () => symlink2,
    symlinkSync: () => symlinkSync,
    truncate: () => truncate2,
    truncateSync: () => truncateSync,
    umount: () => umount,
    unlink: () => unlink2,
    unlinkSync: () => unlinkSync,
    unwatchFile: () => unwatchFile,
    utimes: () => utimes2,
    utimesSync: () => utimesSync,
    watch: () => watch2,
    watchFile: () => watchFile,
    write: () => write,
    writeFile: () => writeFile2,
    writeFileSync: () => writeFileSync,
    writeSync: () => writeSync,
    writev: () => writev,
    writevSync: () => writevSync,
    xattr: () => xattr_exports
  });

  // node_modules/@zenfs/core/dist/vfs/async.js
  var import_buffer8 = __toESM(require_buffer(), 1);

  // node_modules/@zenfs/core/dist/vfs/promises.js
  var promises_exports = {};
  __export(promises_exports, {
    FileHandle: () => FileHandle,
    access: () => access,
    appendFile: () => appendFile,
    chmod: () => chmod,
    chown: () => chown,
    constants: () => constants_exports,
    copyFile: () => copyFile,
    cp: () => cp,
    exists: () => exists,
    glob: () => glob,
    lchmod: () => lchmod,
    lchown: () => lchown,
    link: () => link,
    lstat: () => lstat,
    lutimes: () => lutimes,
    mkdir: () => mkdir,
    mkdtemp: () => mkdtemp,
    open: () => open,
    opendir: () => opendir,
    readFile: () => readFile,
    readdir: () => readdir,
    readlink: () => readlink,
    realpath: () => realpath,
    rename: () => rename,
    rm: () => rm,
    rmdir: () => rmdir,
    stat: () => stat,
    statfs: () => statfs,
    symlink: () => symlink,
    truncate: () => truncate,
    unlink: () => unlink,
    utimes: () => utimes,
    watch: () => watch,
    writeFile: () => writeFile
  });
  var import_buffer7 = __toESM(require_buffer(), 1);

  // node_modules/@zenfs/core/dist/readline.js
  var Interface = class extends import_index.default {
    input;
    output;
    terminal;
    line = "";
    _cursor = 0;
    get cursor() {
      return this._cursor;
    }
    _buffer = "";
    _closed = false;
    _paused = false;
    _prompt = "";
    _history = [];
    _historyIndex = -1;
    _currentLine = "";
    constructor(input, output2, completer, terminal = false) {
      super();
      this.input = input;
      this.output = output2;
      this.terminal = terminal;
      this.input.on("data", this._onData);
      this.input.on("end", this.close.bind(this));
      this.input.on("close", this.close.bind(this));
    }
    _onData = (data) => {
      if (this._paused || this._closed)
        return;
      this._buffer += typeof data === "string" ? data : data.toString("utf8");
      for (let lineEnd = this._buffer.indexOf("\n"); lineEnd >= 0; lineEnd = this._buffer.indexOf("\n")) {
        let line = this._buffer.substring(0, lineEnd);
        if (line.endsWith("\r")) {
          line = line.substring(0, line.length - 1);
        }
        this._buffer = this._buffer.substring(lineEnd + 1);
        this.line = line;
        if (line.trim() && !line.trim().match(/^\s*$/) && this._history.at(-1) != line) {
          this._history.push(line);
          this._historyIndex = this._history.length;
          this.emit("history", this._history);
        }
        this.emit("line", line);
      }
    };
    /**
     * Closes the interface and removes all event listeners
     */
    close() {
      if (this._closed)
        return;
      this._closed = true;
      this.input?.removeAllListeners?.();
      if (this._buffer.length) {
        const line = this._buffer;
        this._buffer = "";
        this.line = line;
        this.emit("line", line);
      }
      this.emit("history", this._history);
      this.emit("close");
      this.removeAllListeners();
    }
    /**
     * Pauses the input stream
     */
    pause() {
      if (this._paused)
        return this;
      this._paused = true;
      if ("pause" in this.input)
        this.input.pause();
      this.emit("pause");
      return this;
    }
    /**
     * Resumes the input stream
     */
    resume() {
      if (!this._paused)
        return this;
      this._paused = false;
      if ("resume" in this.input)
        this.input.resume();
      this.emit("resume");
      return this;
    }
    /**
     * Sets the prompt text
     */
    setPrompt(prompt) {
      this._prompt = prompt;
    }
    /**
     * Gets the current prompt text
     */
    getPrompt() {
      return this._prompt;
    }
    /**
     * Displays the prompt to the user
     */
    prompt(preserveCursor) {
      if (!this.output)
        return;
      if (!preserveCursor) {
        this.output.write(this._prompt);
        return;
      }
      const { cols } = this.getCursorPos();
      this.output.write(this._prompt);
      this._cursor = cols;
    }
    /**
     * Writes data to the interface and handles key events
     */
    write(data, key) {
      if (this._closed)
        return;
      if (data) {
        const str = typeof data === "string" ? data : data.toString("utf8");
        this._onData(str);
      }
      if (!key || !this.terminal)
        return;
      switch ((key.ctrl ? "^" : "") + key.name) {
        case "^c":
          this.emit("SIGINT");
          break;
        case "^z":
          this.emit("SIGTSTP");
          break;
        case "^q":
          this.emit("SIGCONT");
          break;
        case "home":
        case "^a":
          if (!this.output)
            return;
          moveCursor(this.output, -this._cursor, 0);
          this._cursor = 0;
          this._cursor = 0;
          break;
        case "^e":
        case "end": {
          if (!this.output)
            return;
          const dx = this.line.length - this._cursor;
          if (!dx)
            return;
          moveCursor(this.output, dx, 0);
          this._cursor = this.line.length;
          this._cursor = this.line.length;
          break;
        }
        case "^k": {
          if (!this.output)
            return;
          if (this._cursor >= this.line.length)
            return;
          const newLine = this.line.slice(0, this._cursor);
          clearLine(this.output, 1);
          this.line = newLine;
          break;
        }
        case "^u": {
          if (!this.output || !this._cursor)
            return;
          const newLine = this.line.slice(this._cursor);
          clearLine(this.output, 0);
          moveCursor(this.output, 0, 0);
          this.output.write(this._prompt + newLine);
          this.line = newLine;
          this._cursor = 0;
          this._cursor = 0;
          break;
        }
        case "^w": {
          if (!this.output || !this._cursor)
            return;
          let i = this._cursor - 1;
          while (i >= 0 && this.line[i] === " ")
            i--;
          while (i >= 0 && this.line[i] !== " ")
            i--;
          const newLine = this.line.slice(0, i + 1) + this.line.slice(this._cursor);
          const newCursorPos = i + 1;
          this._renderLine(newLine);
          this._cursor = newCursorPos;
          this._cursor = newCursorPos;
          moveCursor(this.output, -newLine.length, 0);
          moveCursor(this.output, newCursorPos, 0);
          break;
        }
        case "^return":
        case "^enter":
          this._onData("\n");
          break;
        case "return":
        case "enter":
          this._onData((!data ? "" : typeof data == "string" ? data : data.toString("utf8")) + "\n");
          break;
        case "up":
        case "down": {
          if (!this.output || !this._history.length)
            return;
          if (this._historyIndex === this._history.length) {
            this._currentLine = this.line || "";
          }
          if (key.name == "up" && this._historyIndex > 0) {
            this._historyIndex--;
          } else if (key.name == "down" && this._historyIndex < this._history.length - 1) {
            this._historyIndex++;
          } else if (key.name == "down" && this._historyIndex == this._history.length - 1) {
            this._historyIndex = this._history.length;
            this._renderLine(this._currentLine);
            return;
          } else {
            return;
          }
          const historyItem = this._history[this._historyIndex];
          this._renderLine(historyItem);
          break;
        }
        case "left":
        case "right": {
          const dx = key.name == "left" ? -1 : 1;
          if (!this.output)
            return;
          const newPos = Math.max(0, Math.min(this.line.length, this._cursor + dx));
          if (newPos == this._cursor)
            return;
          moveCursor(this.output, dx, 0);
          this._cursor = newPos;
          this._cursor = newPos;
          break;
        }
        case "backspace": {
          if (!this.output || !this._cursor)
            return;
          const newLine = this.line.slice(0, this._cursor - 1) + this.line.slice(this._cursor);
          this._renderLine(newLine);
          this._cursor = --this._cursor;
          if (this._cursor > 0) {
            moveCursor(this.output, -this._cursor, 0);
            moveCursor(this.output, this._cursor, 0);
          }
          break;
        }
        case "delete": {
          if (!this.output)
            return;
          if (this._cursor >= this.line.length)
            return;
          const newLine = this.line.slice(0, this._cursor) + this.line.slice(this._cursor + 1);
          clearLine(this.output, 0);
          moveCursor(this.output, 0, 0);
          this.output.write(this._prompt + newLine);
          this.line = newLine;
          moveCursor(this.output, -newLine.length, 0);
          moveCursor(this.output, this._cursor, 0);
          break;
        }
      }
    }
    _renderLine(text) {
      if (!this.output)
        return;
      clearLine(this.output, 0);
      moveCursor(this.output, 0, 0);
      this.output.write(this._prompt + text);
      this.line = text;
      this._cursor = text.length;
      this._cursor = text.length;
    }
    question(query, optionsOrCallback, maybeCallback) {
      const callback = typeof optionsOrCallback === "function" ? optionsOrCallback : maybeCallback;
      if (this._closed || !this.output) {
        callback("");
        return;
      }
      this.output.write(query);
      this.once("line", callback);
    }
    /**
     * Gets the current cursor position
     */
    getCursorPos() {
      return { rows: 0, cols: this.cursor };
    }
    /**
     * Prepends a listener for the specified event
     */
    prependListener(event, listener) {
      const listeners = this.listeners(event);
      this.removeAllListeners(event);
      this.on(event, listener);
      listeners.forEach(this.on.bind(this, event));
      return this;
    }
    /**
     * Prepends a one-time listener for the specified event
     */
    prependOnceListener(event, listener) {
      const listeners = this.listeners(event);
      this.removeAllListeners(event);
      this.once(event, listener);
      listeners.forEach(this.on.bind(this, event));
      return this;
    }
    /**
     * Sets the maximum number of listeners
     */
    setMaxListeners() {
      warn("Interface.prototype.setMaxListeners is not supported");
      return this;
    }
    /**
     * Gets the maximum number of listeners
     */
    getMaxListeners() {
      warn("Interface.prototype.getMaxListeners is not supported");
      return 10;
    }
    [Symbol.asyncIterator]() {
      let done = false;
      return {
        next: async () => {
          if (done)
            return { done, value: void 0 };
          const { resolve: resolve2, promise } = Promise.withResolvers();
          this.once("line", (line) => resolve2({ value: line, done: false }));
          this.once("close", () => {
            done = true;
            resolve2({ value: void 0, done });
          });
          return promise;
        },
        return: async (value) => {
          if (done)
            return { done, value };
          done = true;
          this.close();
          return { done, value };
        },
        throw: async (error) => {
          if (!done) {
            done = true;
            this.close();
          }
          throw error;
        },
        [Symbol.asyncIterator]() {
          return this;
        },
        [Symbol.asyncDispose]: async () => {
          if (done)
            return;
          done = true;
          this.close();
        }
      };
    }
    [Symbol.dispose]() {
      this.close();
    }
    async [Symbol.asyncDispose]() {
      if (this._closed)
        return;
      const { resolve: resolve2, promise } = Promise.withResolvers();
      this.once("close", () => resolve2());
      this.close();
      await promise;
    }
    rawListeners(event) {
      return this.listeners(event);
    }
  };
  function createInterface(input, output2, completer, terminal) {
    return "input" in input ? new Interface(input.input, input.output, input.completer, input.terminal) : new Interface(input, output2, completer, terminal);
  }
  function clearLine(stream, dir) {
    stream.write(dir >= 0 ? "\r\x1B[K" : "\x1B[K");
    return true;
  }
  function moveCursor(stream, dx, dy) {
    if (!stream.write)
      return false;
    let cmd = "";
    if (dx < 0) {
      cmd += `\x1B[${-dx}D`;
    } else if (dx > 0) {
      cmd += `\x1B[${dx}C`;
    }
    if (dy < 0) {
      cmd += `\x1B[${-dy}A`;
    } else if (dy > 0) {
      cmd += `\x1B[${dy}B`;
    }
    if (cmd)
      stream.write(cmd);
    return true;
  }

  // node_modules/@zenfs/core/dist/vfs/dir.js
  var import_buffer5 = __toESM(require_buffer(), 1);

  // node_modules/@zenfs/core/dist/vfs/sync.js
  var import_buffer4 = __toESM(require_buffer(), 1);

  // node_modules/@zenfs/core/dist/internal/error.js
  function wrap(fs, prop, path, dest) {
    const fn = fs[prop];
    if (typeof fn !== "function")
      throw new TypeError(`${prop} is not a function`);
    return function(...args) {
      try {
        return fn.call(fs, ...args);
      } catch (e) {
        throw setUVMessage(Object.assign(e, { path, dest, syscall: prop.endsWith("Sync") ? prop.slice(0, -4) : prop }));
      }
    };
  }

  // node_modules/@zenfs/core/dist/vfs/file.js
  var SyncHandle = class {
    context;
    path;
    fs;
    internalPath;
    flag;
    inode;
    _buffer;
    /**
     * Current position
     */
    _position = 0;
    /**
     * Get the current file position.
     *
     * We emulate the following bug mentioned in the Node documentation:
     *
     * On Linux, positional writes don't work when the file is opened in append mode.
     * The kernel ignores the position argument and always appends the data to the end of the file.
     * @returns The current file position.
     */
    get position() {
      return this.flag & O_APPEND ? this.inode.size : this._position;
    }
    set position(value) {
      this._position = value;
    }
    /**
     * Whether the file has changes which have not been written to the FS
     */
    dirty = false;
    /**
     * Whether the file is open or closed
     */
    closed = false;
    /**
     * Creates a file with `path` and, optionally, the given contents.
     * Note that, if contents is specified, it will be mutated by the file.
     */
    constructor(context, path, fs, internalPath, flag, inode) {
      this.context = context;
      this.path = path;
      this.fs = fs;
      this.internalPath = internalPath;
      this.flag = flag;
      this.inode = inode;
    }
    [Symbol.dispose]() {
      this.close();
    }
    get _isSync() {
      return !!(this.flag & O_SYNC || this.inode.flags & InodeFlags.Sync || this.fs.attributes.has("sync"));
    }
    sync() {
      if (this.closed)
        throw UV("EBADF", "sync", this.path);
      if (!this.dirty)
        return;
      if (!this.fs.attributes.has("no_write"))
        this.fs.touchSync(this.internalPath, this.inode);
      this.dirty = false;
    }
    /**
     * Default implementation maps to `syncSync`.
     */
    datasync() {
      return this.sync();
    }
    close() {
      if (this.closed)
        throw UV("EBADF", "close", this.path);
      this.sync();
      this.dispose();
    }
    /**
     * Cleans up. This will *not* sync the file data to the FS
     */
    dispose(force) {
      if (this.closed)
        throw UV("EBADF", "close", this.path);
      if (this.dirty && !force)
        throw UV("EBUSY", "close", this.path);
      this.closed = true;
    }
    stat() {
      if (this.closed)
        throw UV("EBADF", "stat", this.path);
      return this.inode;
    }
    truncate(length) {
      if (length < 0)
        throw UV("EINVAL", "truncate", this.path);
      if (this.closed)
        throw UV("EBADF", "truncate", this.path);
      if (!(this.flag & O_WRONLY || this.flag & O_RDWR))
        throw UV("EBADF", "truncate", this.path);
      if (this.fs.attributes.has("readonly"))
        throw UV("EROFS", "truncate", this.path);
      if (this.inode.flags & InodeFlags.Immutable)
        throw UV("EPERM", "truncate", this.path);
      this.dirty = true;
      this.inode.mtimeMs = Date.now();
      this.inode.size = length;
      this.inode.ctimeMs = Date.now();
      if (this._isSync)
        this.sync();
    }
    /**
     * Write buffer to the file.
     * @param buffer Uint8Array containing the data to write to the file.
     * @param offset Offset in the buffer to start reading data from.
     * @param length The amount of bytes to write to the file.
     * @param position Offset from the beginning of the file where this data should be written.
     * If position is null, the data will be written at  the current position.
     * @returns bytes written
     */
    write(buffer, offset = 0, length = buffer.byteLength - offset, position = this.position) {
      if (this.closed)
        throw UV("EBADF", "write", this.path);
      if (!(this.flag & O_WRONLY || this.flag & O_RDWR))
        throw UV("EBADF", "write", this.path);
      if (this.fs.attributes.has("readonly"))
        throw UV("EROFS", "write", this.path);
      if (this.inode.flags & InodeFlags.Immutable)
        throw UV("EPERM", "write", this.path);
      this.dirty = true;
      const end = position + length;
      const slice = buffer.subarray(offset, offset + length);
      if (!isCharacterDevice(this.inode) && !isBlockDevice(this.inode) && end > this.inode.size)
        this.inode.size = end;
      this.inode.mtimeMs = Date.now();
      this.inode.ctimeMs = Date.now();
      this._position = position + slice.byteLength;
      this.fs.writeSync(this.internalPath, slice, position);
      if (this._isSync)
        this.sync();
      return slice.byteLength;
    }
    /**
     * Read data from the file.
     * @param buffer The buffer that the data will be written to.
     * @param offset The offset within the buffer where writing will start.
     * @param length An integer specifying the number of bytes to read.
     * @param position An integer specifying where to begin reading from in the file.
     * If position is null, data will be read from the current file position.
     * @returns number of bytes written
     */
    read(buffer, offset = 0, length = buffer.byteLength - offset, position = this.position) {
      if (this.closed)
        throw UV("EBADF", "read", this.path);
      if (this.flag & O_WRONLY)
        throw UV("EBADF", "read", this.path);
      if (!(this.inode.flags & InodeFlags.NoAtime) && !this.fs.attributes.has("no_atime")) {
        this.dirty = true;
        this.inode.atimeMs = Date.now();
      }
      let end = position + length;
      if (!isCharacterDevice(this.inode) && !isBlockDevice(this.inode) && end > this.inode.size) {
        end = position + Math.max(this.inode.size - position, 0);
      }
      this._position = end;
      const uint8 = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
      this.fs.readSync(this.internalPath, uint8.subarray(offset, offset + length), position, end);
      if (this._isSync)
        this.sync();
      return end - position;
    }
    chmod(mode) {
      if (this.closed)
        throw UV("EBADF", "chmod", this.path);
      this.dirty = true;
      this.inode.mode = this.inode.mode & (mode > S_IFMT ? ~S_IFMT : S_IFMT) | mode;
      if (this._isSync || mode > S_IFMT)
        this.sync();
    }
    chown(uid, gid) {
      if (this.closed)
        throw UV("EBADF", "chmod", this.path);
      this.dirty = true;
      _chown(this.inode, uid, gid);
      if (this._isSync)
        this.sync();
    }
    /**
     * Change the file timestamps of the file.
     */
    utimes(atime, mtime) {
      if (this.closed)
        throw UV("EBADF", "utimes", this.path);
      this.dirty = true;
      this.inode.atimeMs = atime;
      this.inode.mtimeMs = mtime;
      if (this._isSync)
        this.sync();
    }
    /**
     * Create a stream for reading the file.
     */
    streamRead(options) {
      if (this.closed)
        throw UV("EBADF", "streamRead", this.path);
      return this.fs.streamRead(this.internalPath, options);
    }
    /**
     * Create a stream for writing the file.
     */
    streamWrite(options) {
      if (this.closed)
        throw UV("EBADF", "write", this.path);
      if (this.inode.flags & InodeFlags.Immutable)
        throw UV("EPERM", "write", this.path);
      if (this.fs.attributes.has("readonly"))
        throw UV("EROFS", "write", this.path);
      return this.fs.streamWrite(this.internalPath, options);
    }
  };
  function toFD(file) {
    const map = file.context?.descriptors ?? defaultContext.descriptors;
    const fd = Math.max(map.size ? Math.max(...map.keys()) + 1 : 0, 4);
    map.set(fd, file);
    return fd;
  }
  function fromFD($, fd) {
    const map = $?.descriptors ?? defaultContext.descriptors;
    const value = map.get(fd);
    if (!value)
      throw withErrno("EBADF");
    return value;
  }
  function deleteFD($, fd) {
    return ($?.descriptors ?? defaultContext.descriptors).delete(fd);
  }

  // node_modules/@zenfs/core/dist/vfs/flags.js
  var pattern = /[rwasx]{1,2}\+?/;
  function parse2(flag) {
    if (typeof flag == "number")
      return flag;
    if (!pattern.test(flag)) {
      throw withErrno("EINVAL", "Invalid flag string: " + flag);
    }
    return toNumber(flag);
  }
  function toNumber(flag) {
    if (!flag.includes("r") && !flag.includes("w") && !flag.includes("a")) {
      throw withErrno("EINVAL", "Invalid flag string: " + flag);
    }
    let n = flag.includes("r") ? O_RDONLY : O_CREAT;
    if (flag.includes("w"))
      n |= O_TRUNC;
    if (flag.includes("a"))
      n |= O_APPEND;
    if (flag.includes("+"))
      n |= O_RDWR;
    else if (!flag.includes("r"))
      n |= O_WRONLY;
    if (flag.includes("s"))
      n |= O_SYNC;
    if (flag.includes("x"))
      n |= O_EXCL;
    return n;
  }
  function toMode(flag) {
    let mode = 0;
    if (!(flag & O_WRONLY))
      mode |= R_OK;
    if (flag & O_WRONLY || flag & O_RDWR)
      mode |= W_OK;
    return mode;
  }

  // node_modules/@zenfs/core/dist/vfs/shared.js
  var mounts = /* @__PURE__ */ new Map();
  mount("/", InMemory.create({ label: "root" }));
  function mount(mountPoint, fs) {
    if (mountPoint[0] != "/")
      mountPoint = "/" + mountPoint;
    mountPoint = resolve.call(this, mountPoint);
    if (mounts.has(mountPoint))
      throw err(withErrno("EINVAL", "Mount point is already in use: " + mountPoint));
    fs._mountPoint = mountPoint;
    mounts.set(mountPoint, fs);
    info(`Mounted ${fs.name} on ${mountPoint}`);
    debug(`${fs.name} attributes: ${[...fs.attributes].map(([k, v]) => v !== void 0 && v !== null ? k + "=" + v : k).join(", ")}`);
  }
  function umount(mountPoint) {
    if (mountPoint[0] != "/")
      mountPoint = "/" + mountPoint;
    mountPoint = resolve.call(this, mountPoint);
    if (!mounts.has(mountPoint)) {
      warn(mountPoint + " is already unmounted");
      return;
    }
    mounts.delete(mountPoint);
    notice("Unmounted " + mountPoint);
  }
  function resolveMount(path, ctx) {
    const root = ctx?.root || defaultContext.root;
    path = normalizePath(join(root, path));
    const sortedMounts = [...mounts].sort((a, b) => a[0].length > b[0].length ? -1 : 1);
    for (const [mountPoint, fs] of sortedMounts) {
      if (!_isParentOf(mountPoint, path))
        continue;
      path = path.slice(mountPoint.length > 1 ? mountPoint.length : 0);
      if (path === "")
        path = "/";
      const case_fold = fs.attributes.get("case_fold");
      if (case_fold === "lower")
        path = path.toLowerCase();
      if (case_fold === "upper")
        path = path.toUpperCase();
      return { fs, path, mountPoint, root };
    }
    throw alert(new Exception(Errno.EIO, "No file system for " + path));
  }
  function _statfs(fs, bigint) {
    const md = fs.usage();
    const bs = md.blockSize || 4096;
    return {
      type: (bigint ? BigInt : Number)(fs.type),
      bsize: (bigint ? BigInt : Number)(bs),
      ffree: (bigint ? BigInt : Number)(md.freeNodes || size_max),
      files: (bigint ? BigInt : Number)(md.totalNodes || size_max),
      bavail: (bigint ? BigInt : Number)(md.freeSpace / bs),
      bfree: (bigint ? BigInt : Number)(md.freeSpace / bs),
      blocks: (bigint ? BigInt : Number)(md.totalSpace / bs)
    };
  }
  function chroot(path) {
    const $ = this ?? defaultContext;
    if (!credentialsAllowRoot($.credentials))
      throw withErrno("EPERM", "Can not chroot() as non-root user");
    $.root ??= "/";
    const newRoot = join($.root, path);
    for (const handle of $.descriptors?.values() ?? []) {
      if (!handle.path.startsWith($.root))
        throw UV("EBUSY", "chroot", handle.path);
      handle.path = handle.path.slice($.root.length);
    }
    if (newRoot.length > $.root.length)
      throw withErrno("EPERM", "Can not chroot() outside of current root");
    $.root = newRoot;
  }
  function _isParentOf(parent, child) {
    if (parent === "/" || parent === child)
      return true;
    if (!parent.endsWith("/"))
      parent += "/";
    return child.startsWith(parent);
  }

  // node_modules/@zenfs/core/dist/vfs/watchers.js
  var Watcher = class extends import_index.default {
    _context;
    path;
    /* eslint-disable @typescript-eslint/no-explicit-any */
    off(event, fn, context, once) {
      return super.off(event, fn, context, once);
    }
    removeListener(event, fn, context, once) {
      return super.removeListener(event, fn, context, once);
    }
    /* eslint-enable @typescript-eslint/no-explicit-any */
    constructor(_context, path) {
      super();
      this._context = _context;
      this.path = path;
    }
    setMaxListeners() {
      throw UV("ENOSYS", "Watcher.setMaxListeners");
    }
    getMaxListeners() {
      throw UV("ENOSYS", "Watcher.getMaxListeners");
    }
    prependListener() {
      throw UV("ENOSYS", "Watcher.prependListener");
    }
    prependOnceListener() {
      throw UV("ENOSYS", "Watcher.prependOnceListener");
    }
    rawListeners() {
      throw UV("ENOSYS", "Watcher.rawListeners");
    }
    ref() {
      return this;
    }
    unref() {
      return this;
    }
  };
  var FSWatcher = class extends Watcher {
    options;
    realpath;
    constructor(context, path, options) {
      super(context, path);
      this.options = options;
      this.realpath = context?.root ? join(context.root, path) : path;
      addWatcher(this.realpath, this);
    }
    close() {
      super.emit("close");
      removeWatcher(this.realpath, this);
    }
    [Symbol.dispose]() {
      this.close();
    }
  };
  var StatWatcher = class extends Watcher {
    options;
    intervalId;
    previous;
    constructor(context, path, options) {
      super(context, path);
      this.options = options;
      this.start();
    }
    onInterval() {
      try {
        const current = statSync(this.path);
        if (!isStatsEqual(this.previous, current)) {
          this.emit("change", current, this.previous);
          this.previous = current;
        }
      } catch (e) {
        this.emit("error", e);
      }
    }
    start() {
      const interval = this.options.interval || 5e3;
      try {
        this.previous = statSync(this.path);
      } catch (e) {
        this.emit("error", e);
        return;
      }
      this.intervalId = setInterval(this.onInterval.bind(this), interval);
      if (!this.options.persistent && typeof this.intervalId == "object") {
        this.intervalId.unref();
      }
    }
    /**
     * @internal
     */
    stop() {
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = void 0;
      }
      this.removeAllListeners();
    }
  };
  var watchers = /* @__PURE__ */ new Map();
  function addWatcher(path, watcher) {
    const normalizedPath = normalizePath(path);
    if (!watchers.has(normalizedPath)) {
      watchers.set(normalizedPath, /* @__PURE__ */ new Set());
    }
    watchers.get(normalizedPath).add(watcher);
  }
  function removeWatcher(path, watcher) {
    const normalizedPath = normalizePath(path);
    if (watchers.has(normalizedPath)) {
      watchers.get(normalizedPath).delete(watcher);
      if (watchers.get(normalizedPath).size === 0) {
        watchers.delete(normalizedPath);
      }
    }
  }
  function emitChange($, eventType, filename) {
    if ($)
      filename = join($.root ?? "/", filename);
    filename = normalizePath(filename);
    for (let path = filename; path != "/"; path = dirname(path)) {
      const watchersForPath = watchers.get(path);
      if (!watchersForPath)
        continue;
      for (const watcher of watchersForPath) {
        watcher.emit("change", eventType, relative.call(watcher._context, path, filename) || basename(filename));
      }
    }
  }

  // node_modules/@zenfs/core/dist/vfs/sync.js
  var __addDisposableResource2 = function(env, value, async) {
    if (value !== null && value !== void 0) {
      if (typeof value !== "object" && typeof value !== "function") throw new TypeError("Object expected.");
      var dispose, inner;
      if (async) {
        if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
        dispose = value[Symbol.asyncDispose];
      }
      if (dispose === void 0) {
        if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
        dispose = value[Symbol.dispose];
        if (async) inner = dispose;
      }
      if (typeof dispose !== "function") throw new TypeError("Object not disposable.");
      if (inner) dispose = function() {
        try {
          inner.call(this);
        } catch (e) {
          return Promise.reject(e);
        }
      };
      env.stack.push({ value, dispose, async });
    } else if (async) {
      env.stack.push({ async: true });
    }
    return value;
  };
  var __disposeResources2 = /* @__PURE__ */ function(SuppressedError2) {
    return function(env) {
      function fail(e) {
        env.error = env.hasError ? new SuppressedError2(e, env.error, "An error was suppressed during disposal.") : e;
        env.hasError = true;
      }
      var r, s = 0;
      function next() {
        while (r = env.stack.pop()) {
          try {
            if (!r.async && s === 1) return s = 0, env.stack.push(r), Promise.resolve().then(next);
            if (r.dispose) {
              var result = r.dispose.call(r.value);
              if (r.async) return s |= 2, Promise.resolve(result).then(next, function(e) {
                fail(e);
                return next();
              });
            } else s |= 1;
          } catch (e) {
            fail(e);
          }
        }
        if (s === 1) return env.hasError ? Promise.reject(env.error) : Promise.resolve();
        if (env.hasError) throw env.error;
      }
      return next();
    };
  }(typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
  });
  function renameSync(oldPath, newPath) {
    oldPath = normalizePath(oldPath);
    __assertType(oldPath);
    newPath = normalizePath(newPath);
    __assertType(newPath);
    const src = resolveMount(oldPath, this);
    const dst = resolveMount(newPath, this);
    const $ex = { syscall: "rename", path: oldPath, dest: newPath };
    if (src.fs !== dst.fs)
      throw UV("EXDEV", $ex);
    if (dst.path.startsWith(src.path + "/"))
      throw UV("EBUSY", $ex);
    const oldStats = statSync.call(this, oldPath);
    const oldParent = statSync.call(this, dirname(oldPath));
    const newParent = statSync.call(this, dirname(newPath));
    let newStats;
    try {
      newStats = statSync.call(this, newPath);
    } catch (e) {
      setUVMessage(Object.assign(e, $ex));
      if (e.code != "ENOENT")
        throw e;
    }
    if (checkAccess && (!oldParent.hasAccess(R_OK, this) || !newParent.hasAccess(W_OK, this)))
      throw UV("EACCES", $ex);
    if (newStats && !isDirectory(oldStats) && isDirectory(newStats))
      throw UV("EISDIR", $ex);
    if (newStats && isDirectory(oldStats) && !isDirectory(newStats))
      throw UV("ENOTDIR", $ex);
    try {
      src.fs.renameSync(src.path, dst.path);
    } catch (e) {
      throw setUVMessage(Object.assign(e, $ex));
    }
    emitChange(this, "rename", oldPath);
    emitChange(this, "change", newPath);
  }
  function existsSync(path) {
    path = normalizePath(path);
    try {
      const { fs, path: resolvedPath } = resolveMount(realpathSync.call(this, path), this);
      return fs.existsSync(resolvedPath);
    } catch (e) {
      if (e.errno == Errno.ENOENT)
        return false;
      throw e;
    }
  }
  function statSync(path, options) {
    path = normalizePath(path);
    const { fs, path: resolved } = resolveMount(realpathSync.call(this, path), this);
    let stats;
    try {
      stats = fs.statSync(resolved);
    } catch (e) {
      throw setUVMessage(Object.assign(e, { path }));
    }
    if (checkAccess && !hasAccess(this, stats, R_OK))
      throw UV("EACCES", { syscall: "stat", path });
    return options?.bigint ? new BigIntStats(stats) : new Stats(stats);
  }
  function lstatSync(path, options) {
    path = normalizePath(path);
    const real = join(realpathSync.call(this, dirname(path)), basename(path));
    const { fs, path: resolved } = resolveMount(real, this);
    const stats = wrap(fs, "statSync", path)(resolved);
    if (checkAccess && !hasAccess(this, stats, R_OK))
      throw UV("EACCES", { syscall: "lstat", path });
    return options?.bigint ? new BigIntStats(stats) : new Stats(stats);
  }
  function truncateSync(path, len = 0) {
    const env_1 = { stack: [], error: void 0, hasError: false };
    try {
      const file = __addDisposableResource2(env_1, _openSync.call(this, path, { flag: "r+" }), false);
      len ||= 0;
      if (len < 0)
        throw UV("EINVAL", "truncate", path.toString());
      file.truncate(len);
    } catch (e_1) {
      env_1.error = e_1;
      env_1.hasError = true;
    } finally {
      __disposeResources2(env_1);
    }
  }
  function unlinkSync(path) {
    path = normalizePath(path);
    const { fs, path: resolved } = resolveMount(path, this);
    try {
      if (checkAccess && !hasAccess(this, fs.statSync(resolved), W_OK)) {
        throw UV("EACCES", "unlink");
      }
      fs.unlinkSync(resolved);
    } catch (e) {
      throw setUVMessage(Object.assign(e, { path }));
    }
    emitChange(this, "rename", path.toString());
  }
  function _openSync(path, opt) {
    path = normalizePath(path);
    const mode = normalizeMode(opt.mode, 420), flag = parse2(opt.flag);
    path = opt.preserveSymlinks ? path : realpathSync.call(this, path);
    const { fs, path: resolved } = resolveMount(path, this);
    let stats;
    try {
      stats = fs.statSync(resolved);
    } catch {
    }
    if (!stats) {
      if (!(flag & O_CREAT)) {
        throw UV("ENOENT", "open", path);
      }
      const parentStats = fs.statSync(dirname(resolved));
      if (checkAccess && !hasAccess(this, parentStats, W_OK)) {
        throw UV("EACCES", "open", path);
      }
      if (!isDirectory(parentStats)) {
        throw UV("ENOTDIR", "open", path);
      }
      if (!opt.allowDirectory && mode & S_IFDIR)
        throw UV("EISDIR", "open", path);
      if (checkAccess && !hasAccess(this, parentStats, W_OK)) {
        throw UV("EACCES", "open", path);
      }
      const { euid: uid, egid: gid } = this?.credentials ?? defaultContext.credentials;
      const inode = fs.createFileSync(resolved, {
        mode,
        uid: parentStats.mode & S_ISUID ? parentStats.uid : uid,
        gid: parentStats.mode & S_ISGID ? parentStats.gid : gid
      });
      return new SyncHandle(this, path, fs, resolved, flag, inode);
    }
    if (checkAccess && (!hasAccess(this, stats, mode) || !hasAccess(this, stats, toMode(flag)))) {
      throw UV("EACCES", "open", path);
    }
    if (flag & O_EXCL)
      throw UV("EEXIST", "open", path);
    const file = new SyncHandle(this, path, fs, resolved, flag, stats);
    if (!opt.allowDirectory && stats.mode & S_IFDIR)
      throw UV("EISDIR", "open", path);
    if (flag & O_TRUNC)
      file.truncate(0);
    return file;
  }
  function openSync(path, flag, mode = F_OK) {
    return toFD(_openSync.call(this, path, { flag, mode }));
  }
  function lopenSync(path, flag, mode) {
    return toFD(_openSync.call(this, path, { flag, mode, preserveSymlinks: true }));
  }
  function readFileSync(path, _options = {}) {
    const env_2 = { stack: [], error: void 0, hasError: false };
    try {
      const options = normalizeOptions(_options, null, "r", 420);
      const flag = parse2(options.flag);
      if (flag & O_WRONLY)
        throw UV("EBADF", "read", path.toString());
      const file = __addDisposableResource2(env_2, typeof path == "number" ? fromFD(this, path) : _openSync.call(this, path.toString(), { flag: options.flag, mode: 420, preserveSymlinks: false }), false);
      const { size } = file.stat();
      const data = import_buffer4.Buffer.alloc(size);
      file.read(data, 0, size, 0);
      return options.encoding ? data.toString(options.encoding) : data;
    } catch (e_2) {
      env_2.error = e_2;
      env_2.hasError = true;
    } finally {
      __disposeResources2(env_2);
    }
  }
  function writeFileSync(path, data, _options = {}) {
    const env_3 = { stack: [], error: void 0, hasError: false };
    try {
      const options = normalizeOptions(_options, "utf8", "w+", 420);
      const flag = parse2(options.flag);
      if (!(flag & O_WRONLY || flag & O_RDWR)) {
        throw new Exception(Errno.EINVAL, "Flag passed to writeFile must allow for writing");
      }
      if (typeof data != "string" && !options.encoding) {
        throw new Exception(Errno.EINVAL, "Encoding not specified");
      }
      const encodedData = typeof data == "string" ? import_buffer4.Buffer.from(data, options.encoding) : new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
      if (!encodedData) {
        throw new Exception(Errno.EINVAL, "Data not specified");
      }
      const file = __addDisposableResource2(env_3, typeof path == "number" ? fromFD(this, path) : _openSync.call(this, path.toString(), {
        flag,
        mode: options.mode,
        preserveSymlinks: true
      }), false);
      file.write(encodedData, 0, encodedData.byteLength, 0);
      emitChange(this, "change", path.toString());
    } catch (e_3) {
      env_3.error = e_3;
      env_3.hasError = true;
    } finally {
      __disposeResources2(env_3);
    }
  }
  function appendFileSync(filename, data, _options = {}) {
    const env_4 = { stack: [], error: void 0, hasError: false };
    try {
      const options = normalizeOptions(_options, "utf8", "a+", 420);
      const flag = parse2(options.flag);
      if (!(flag & O_APPEND)) {
        throw new Exception(Errno.EINVAL, "Flag passed to appendFile must allow for appending");
      }
      if (typeof data != "string" && !options.encoding) {
        throw new Exception(Errno.EINVAL, "Encoding not specified");
      }
      const encodedData = typeof data == "string" ? import_buffer4.Buffer.from(data, options.encoding) : new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
      const file = __addDisposableResource2(env_4, _openSync.call(this, typeof filename == "number" ? fromFD(this, filename).path : filename.toString(), {
        flag,
        mode: options.mode,
        preserveSymlinks: true
      }), false);
      file.write(encodedData, 0, encodedData.byteLength);
    } catch (e_4) {
      env_4.error = e_4;
      env_4.hasError = true;
    } finally {
      __disposeResources2(env_4);
    }
  }
  function fstatSync(fd, options) {
    const stats = fromFD(this, fd).stat();
    return options?.bigint ? new BigIntStats(stats) : new Stats(stats);
  }
  function closeSync(fd) {
    fromFD(this, fd).close();
    deleteFD(this, fd);
  }
  function ftruncateSync(fd, len = 0) {
    len ||= 0;
    if (len < 0) {
      throw new Exception(Errno.EINVAL);
    }
    fromFD(this, fd).truncate(len);
  }
  function fsyncSync(fd) {
    fromFD(this, fd).sync();
  }
  function fdatasyncSync(fd) {
    fromFD(this, fd).datasync();
  }
  function writeSync(fd, data, posOrOff, lenOrEnc, pos) {
    let buffer, offset, length, position;
    if (typeof data === "string") {
      position = typeof posOrOff === "number" ? posOrOff : null;
      const encoding = typeof lenOrEnc === "string" ? lenOrEnc : "utf8";
      offset = 0;
      buffer = import_buffer4.Buffer.from(data, encoding);
      length = buffer.byteLength;
    } else {
      buffer = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
      offset = posOrOff;
      length = lenOrEnc;
      position = typeof pos === "number" ? pos : null;
    }
    const file = fromFD(this, fd);
    position ??= file.position;
    const bytesWritten = file.write(buffer, offset, length, position);
    emitChange(this, "change", file.path);
    return bytesWritten;
  }
  function readSync(fd, buffer, options, length, position) {
    const file = fromFD(this, fd);
    const offset = typeof options == "object" ? options.offset : options;
    if (typeof options == "object") {
      length = options.length;
      position = options.position;
    }
    position = Number(position);
    if (isNaN(position)) {
      position = file.position;
    }
    return file.read(buffer, offset, length, position);
  }
  function fchownSync(fd, uid, gid) {
    fromFD(this, fd).chown(uid, gid);
  }
  function fchmodSync(fd, mode) {
    const numMode = normalizeMode(mode, -1);
    if (numMode < 0) {
      throw new Exception(Errno.EINVAL, `Invalid mode.`);
    }
    fromFD(this, fd).chmod(numMode);
  }
  function futimesSync(fd, atime, mtime) {
    fromFD(this, fd).utimes(normalizeTime(atime), normalizeTime(mtime));
  }
  function rmdirSync(path) {
    path = normalizePath(path);
    const { fs, path: resolved } = resolveMount(realpathSync.call(this, path), this);
    const stats = wrap(fs, "statSync", path)(resolved);
    if (!isDirectory(stats))
      throw UV("ENOTDIR", "rmdir", path);
    if (checkAccess && !hasAccess(this, stats, W_OK))
      throw UV("EACCES", "rmdir", path);
    wrap(fs, "rmdirSync", path)(resolved);
    emitChange(this, "rename", path.toString());
  }
  function mkdirSync(path, options) {
    const { euid: uid, egid: gid } = this?.credentials ?? defaultContext.credentials;
    options = typeof options === "object" ? options : { mode: options };
    const mode = normalizeMode(options?.mode, 511);
    path = realpathSync.call(this, path);
    const { fs, path: resolved } = resolveMount(path, this);
    const __create2 = (path2, resolved2, parent) => {
      if (checkAccess && !hasAccess(this, parent, W_OK))
        throw UV("EACCES", "mkdir", dirname(path2));
      const inode = wrap(fs, "mkdirSync", path2)(resolved2, {
        mode,
        uid: parent.mode & S_ISUID ? parent.uid : uid,
        gid: parent.mode & S_ISGID ? parent.gid : gid
      });
      emitChange(this, "rename", path2);
      return inode;
    };
    if (!options?.recursive) {
      __create2(path, resolved, wrap(fs, "statSync", dirname(path))(dirname(resolved)));
      return;
    }
    const dirs = [];
    for (let dir = resolved, original = path; !wrap(fs, "existsSync", original)(dir); dir = dirname(dir), original = dirname(original)) {
      dirs.unshift({ resolved: dir, original });
    }
    if (!dirs.length)
      return;
    const stats = [wrap(fs, "statSync", dirname(dirs[0].original))(dirname(dirs[0].resolved))];
    for (const [i, dir] of dirs.entries()) {
      stats.push(__create2(dir.original, dir.resolved, stats[i]));
    }
    return dirs[0].original;
  }
  function readdirSync(path, options) {
    options = typeof options === "object" ? options : { encoding: options };
    path = normalizePath(path);
    const { fs, path: resolved } = resolveMount(realpathSync.call(this, path), this);
    const stats = wrap(fs, "statSync", path)(resolved);
    if (checkAccess && !hasAccess(this, stats, R_OK))
      throw UV("EACCES", "readdir", path);
    if (!isDirectory(stats))
      throw UV("ENOTDIR", "readdir", path);
    const entries2 = wrap(fs, "readdirSync", path)(resolved);
    const values = [];
    const addEntry = (entry) => {
      let entryStat;
      try {
        entryStat = fs.statSync(join(resolved, entry));
      } catch (e) {
        if (e.code == "ENOENT")
          return;
        throw setUVMessage(Object.assign(e, { syscall: "stat", path: join(path, entry) }));
      }
      if (options?.withFileTypes) {
        values.push(Dirent.from(entry, entryStat, options.encoding));
      } else if (options?.encoding == "buffer") {
        values.push(import_buffer4.Buffer.from(entry));
      } else {
        values.push(entry);
      }
      if (!isDirectory(entryStat) || !options?.recursive)
        return;
      const children = wrap(fs, "readdirSync", join(path, entry))(join(resolved, entry));
      for (const child of children)
        addEntry(join(entry, child));
    };
    for (const entry of entries2)
      addEntry(entry);
    return values;
  }
  function linkSync(targetPath, linkPath) {
    targetPath = normalizePath(targetPath);
    if (checkAccess && !statSync(dirname(targetPath)).hasAccess(R_OK, this)) {
      throw UV("EACCES", "link", dirname(targetPath));
    }
    linkPath = normalizePath(linkPath);
    if (checkAccess && !statSync(dirname(linkPath)).hasAccess(W_OK, this)) {
      throw UV("EACCES", "link", dirname(linkPath));
    }
    const { fs, path } = resolveMount(targetPath, this);
    const link3 = resolveMount(linkPath, this);
    if (fs != link3.fs) {
      throw UV("EXDEV", "link", linkPath);
    }
    const stats = wrap(fs, "statSync", targetPath)(path);
    if (checkAccess && !hasAccess(this, stats, R_OK))
      throw UV("EACCES", "link", path);
    return wrap(fs, "linkSync", targetPath, linkPath)(path, link3.path);
  }
  function symlinkSync(target, path, type = "file") {
    const env_5 = { stack: [], error: void 0, hasError: false };
    try {
      if (!["file", "dir", "junction"].includes(type))
        throw new TypeError("Invalid symlink type: " + type);
      path = normalizePath(path);
      const file = __addDisposableResource2(env_5, _openSync.call(this, path, { flag: "wx", mode: 420 }), false);
      file.write(encodeUTF8(normalizePath(target, true)));
      file.chmod(S_IFLNK);
    } catch (e_5) {
      env_5.error = e_5;
      env_5.hasError = true;
    } finally {
      __disposeResources2(env_5);
    }
  }
  function readlinkSync(path, options) {
    const env_6 = { stack: [], error: void 0, hasError: false };
    try {
      const handle = __addDisposableResource2(env_6, _openSync.call(this, normalizePath(path), { flag: "r", mode: 420, preserveSymlinks: true }), false);
      if (!isSymbolicLink(handle.inode))
        throw new Exception(Errno.EINVAL, "Not a symbolic link: " + path);
      const size = handle.inode.size;
      const data = import_buffer4.Buffer.alloc(size);
      handle.read(data, 0, size, 0);
      const encoding = typeof options == "object" ? options?.encoding : options;
      if (encoding == "buffer") {
        return data;
      }
      return data.toString(encoding ?? "utf-8");
    } catch (e_6) {
      env_6.error = e_6;
      env_6.hasError = true;
    } finally {
      __disposeResources2(env_6);
    }
  }
  function chownSync(path, uid, gid) {
    const fd = openSync.call(this, path, "r+");
    fchownSync.call(this, fd, uid, gid);
    closeSync.call(this, fd);
  }
  function lchownSync(path, uid, gid) {
    const fd = lopenSync.call(this, path, "r+");
    fchownSync.call(this, fd, uid, gid);
    closeSync.call(this, fd);
  }
  function chmodSync(path, mode) {
    const fd = openSync.call(this, path, "r+");
    fchmodSync.call(this, fd, mode);
    closeSync.call(this, fd);
  }
  function lchmodSync(path, mode) {
    const fd = lopenSync.call(this, path, "r+");
    fchmodSync.call(this, fd, mode);
    closeSync.call(this, fd);
  }
  function utimesSync(path, atime, mtime) {
    const fd = openSync.call(this, path, "r+");
    futimesSync.call(this, fd, atime, mtime);
    closeSync.call(this, fd);
  }
  function lutimesSync(path, atime, mtime) {
    const fd = lopenSync.call(this, path, "r+");
    futimesSync.call(this, fd, atime, mtime);
    closeSync.call(this, fd);
  }
  function _resolveSync($, path, preserveSymlinks) {
    if (preserveSymlinks) {
      const resolved2 = resolveMount(path, $);
      const stats2 = resolved2.fs.statSync(resolved2.path);
      return { ...resolved2, fullPath: path, stats: stats2 };
    }
    try {
      const resolved2 = resolveMount(path, $);
      const stats2 = resolved2.fs.statSync(resolved2.path);
      if (!isSymbolicLink(stats2)) {
        return { ...resolved2, fullPath: path, stats: stats2 };
      }
      const target2 = resolve.call($, dirname(path), readlinkSync.call($, path).toString());
      return _resolveSync($, target2);
    } catch {
    }
    const { base, dir } = parse(path);
    const realDir = dir == "/" ? "/" : realpathSync.call($, dir);
    const maybePath = join(realDir, base);
    const resolved = resolveMount(maybePath, $);
    let stats;
    try {
      stats = resolved.fs.statSync(resolved.path);
    } catch (e) {
      if (e.code === "ENOENT")
        return { ...resolved, fullPath: path };
      throw setUVMessage(Object.assign(e, { syscall: "stat", path: maybePath }));
    }
    if (!isSymbolicLink(stats)) {
      return { ...resolved, fullPath: maybePath, stats };
    }
    const target = resolve.call($, realDir, readlinkSync.call($, maybePath).toString());
    return _resolveSync($, target);
  }
  function realpathSync(path, options) {
    const encoding = typeof options == "string" ? options : options?.encoding ?? "utf8";
    path = normalizePath(path);
    const { fullPath } = _resolveSync(this, path);
    if (encoding == "utf8" || encoding == "utf-8")
      return fullPath;
    const buf = import_buffer4.Buffer.from(fullPath, "utf-8");
    if (encoding == "buffer")
      return buf;
    return buf.toString(encoding);
  }
  function accessSync(path, mode = 384) {
    if (!checkAccess)
      return;
    if (!hasAccess(this, statSync.call(this, path), mode)) {
      throw new Exception(Errno.EACCES);
    }
  }
  function rmSync(path, options) {
    path = normalizePath(path);
    let stats;
    try {
      stats = lstatSync.bind(this)(path);
    } catch (error) {
      if (error.code != "ENOENT" || !options?.force)
        throw error;
    }
    if (!stats)
      return;
    switch (stats.mode & S_IFMT) {
      case S_IFDIR:
        if (options?.recursive) {
          for (const entry of readdirSync.call(this, path)) {
            rmSync.call(this, join(path, entry), options);
          }
        }
        rmdirSync.call(this, path);
        break;
      case S_IFREG:
      case S_IFLNK:
      case S_IFBLK:
      case S_IFCHR:
        unlinkSync.call(this, path);
        break;
      case S_IFIFO:
      case S_IFSOCK:
      default:
        throw UV("ENOSYS", "rm", path);
    }
  }
  function mkdtempSync(prefix, options) {
    const encoding = typeof options === "object" ? options?.encoding : options || "utf8";
    const fsName = `${prefix}${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const resolvedPath = "/tmp/" + fsName;
    mkdirSync.call(this, resolvedPath);
    return encoding == "buffer" ? import_buffer4.Buffer.from(resolvedPath) : resolvedPath;
  }
  function copyFileSync(source, destination, flags) {
    source = normalizePath(source);
    destination = normalizePath(destination);
    if (flags && flags & COPYFILE_EXCL && existsSync(destination))
      throw UV("EEXIST", "copyFile", destination);
    writeFileSync.call(this, destination, readFileSync(source));
    emitChange(this, "rename", destination.toString());
  }
  function readvSync(fd, buffers, position) {
    const file = fromFD(this, fd);
    let bytesRead = 0;
    for (const buffer of buffers) {
      bytesRead += file.read(buffer, 0, buffer.byteLength, position + bytesRead);
    }
    return bytesRead;
  }
  function writevSync(fd, buffers, position) {
    const file = fromFD(this, fd);
    let bytesWritten = 0;
    for (const buffer of buffers) {
      bytesWritten += file.write(new Uint8Array(buffer.buffer), 0, buffer.byteLength, position + bytesWritten);
    }
    return bytesWritten;
  }
  function opendirSync(path, options) {
    path = normalizePath(path);
    return new Dir(path, this);
  }
  function cpSync(source, destination, opts) {
    source = normalizePath(source);
    destination = normalizePath(destination);
    const srcStats = lstatSync.call(this, source);
    if (opts?.errorOnExist && existsSync.call(this, destination))
      throw UV("EEXIST", "cp", destination);
    switch (srcStats.mode & S_IFMT) {
      case S_IFDIR:
        if (!opts?.recursive)
          throw UV("EISDIR", "cp", source);
        mkdirSync.call(this, destination, { recursive: true });
        for (const dirent of readdirSync.call(this, source, { withFileTypes: true })) {
          if (opts.filter && !opts.filter(join(source, dirent.name), join(destination, dirent.name))) {
            continue;
          }
          cpSync.call(this, join(source, dirent.name), join(destination, dirent.name), opts);
        }
        break;
      case S_IFREG:
      case S_IFLNK:
        copyFileSync.call(this, source, destination);
        break;
      case S_IFBLK:
      case S_IFCHR:
      case S_IFIFO:
      case S_IFSOCK:
      default:
        throw UV("ENOSYS", "cp", source);
    }
    if (opts?.preserveTimestamps) {
      utimesSync.call(this, destination, srcStats.atime, srcStats.mtime);
    }
  }
  function statfsSync(path, options) {
    path = normalizePath(path);
    const { fs } = resolveMount(path, this);
    return _statfs(fs, options?.bigint);
  }
  function globSync(pattern2, options = {}) {
    pattern2 = Array.isArray(pattern2) ? pattern2 : [pattern2];
    const { cwd = "/", withFileTypes = false, exclude = () => false } = options;
    const regexPatterns = pattern2.map(globToRegex);
    const results = [];
    function recursiveList(dir) {
      const entries2 = readdirSync(dir, { withFileTypes, encoding: "utf8" });
      for (const entry of entries2) {
        const fullPath = withFileTypes ? join(entry.parentPath, entry.name) : dir + "/" + entry;
        if (typeof exclude != "function" ? exclude.some((p) => matchesGlob(p, fullPath)) : exclude(withFileTypes ? entry : fullPath))
          continue;
        if (statSync(fullPath).isDirectory() && regexPatterns.some((pattern3) => pattern3.source.includes(".*"))) {
          recursiveList(fullPath);
        }
        if (regexPatterns.some((pattern3) => pattern3.test(fullPath.replace(/^\/+/g, "")))) {
          results.push(withFileTypes ? entry : fullPath.replace(/^\/+/g, ""));
        }
      }
    }
    recursiveList(cwd);
    return results;
  }

  // node_modules/@zenfs/core/dist/vfs/dir.js
  var __esDecorate2 = function(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) {
      if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected");
      return f;
    }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
      var context = {};
      for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
      for (var p in contextIn.access) context.access[p] = contextIn.access[p];
      context.addInitializer = function(f) {
        if (done) throw new TypeError("Cannot add initializers after decoration has completed");
        extraInitializers.push(accept(f || null));
      };
      var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
      if (kind === "accessor") {
        if (result === void 0) continue;
        if (result === null || typeof result !== "object") throw new TypeError("Object expected");
        if (_ = accept(result.get)) descriptor.get = _;
        if (_ = accept(result.set)) descriptor.set = _;
        if (_ = accept(result.init)) initializers.unshift(_);
      } else if (_ = accept(result)) {
        if (kind === "field") initializers.unshift(_);
        else descriptor[key] = _;
      }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
  };
  var __runInitializers2 = function(thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
      value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
  };
  var DirType;
  (function(DirType2) {
    DirType2[DirType2["UNKNOWN"] = 0] = "UNKNOWN";
    DirType2[DirType2["FIFO"] = 1] = "FIFO";
    DirType2[DirType2["CHR"] = 2] = "CHR";
    DirType2[DirType2["DIR"] = 4] = "DIR";
    DirType2[DirType2["BLK"] = 6] = "BLK";
    DirType2[DirType2["REG"] = 8] = "REG";
    DirType2[DirType2["LNK"] = 10] = "LNK";
    DirType2[DirType2["SOCK"] = 12] = "SOCK";
    DirType2[DirType2["WHT"] = 14] = "WHT";
  })(DirType || (DirType = {}));
  function ifToDt(mode) {
    return (mode & 61440) >> 12;
  }
  function dtToIf(dt) {
    return dt << 12;
  }
  var Dirent = (() => {
    var _a, _b, _c;
    let _classDecorators = [struct(packed, { name: "Dirent" })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BufferView;
    let _ino_decorators;
    let _ino_initializers = [];
    let _ino_extraInitializers = [];
    let __ino_decorators;
    let __ino_initializers = [];
    let __ino_extraInitializers = [];
    let _type_decorators;
    let _type_initializers = [];
    let _type_extraInitializers = [];
    let __name_decorators;
    let __name_initializers = [];
    let __name_extraInitializers = [];
    var Dirent2 = class extends _classSuper {
      static {
        _classThis = this;
      }
      static {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        _ino_decorators = [(_a = types2).uint32.bind(_a)];
        __ino_decorators = [(_b = types2).uint32.bind(_b)];
        _type_decorators = [(_c = types2).uint8.bind(_c)];
        __name_decorators = [types2.char(256)];
        __esDecorate2(this, null, _ino_decorators, { kind: "accessor", name: "ino", static: false, private: false, access: { has: (obj) => "ino" in obj, get: (obj) => obj.ino, set: (obj, value) => {
          obj.ino = value;
        } }, metadata: _metadata }, _ino_initializers, _ino_extraInitializers);
        __esDecorate2(this, null, __ino_decorators, { kind: "accessor", name: "_ino", static: false, private: false, access: { has: (obj) => "_ino" in obj, get: (obj) => obj._ino, set: (obj, value) => {
          obj._ino = value;
        } }, metadata: _metadata }, __ino_initializers, __ino_extraInitializers);
        __esDecorate2(this, null, _type_decorators, { kind: "accessor", name: "type", static: false, private: false, access: { has: (obj) => "type" in obj, get: (obj) => obj.type, set: (obj, value) => {
          obj.type = value;
        } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
        __esDecorate2(this, null, __name_decorators, { kind: "accessor", name: "_name", static: false, private: false, access: { has: (obj) => "_name" in obj, get: (obj) => obj._name, set: (obj, value) => {
          obj._name = value;
        } }, metadata: _metadata }, __name_initializers, __name_extraInitializers);
        __esDecorate2(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Dirent2 = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers2(_classThis, _classExtraInitializers);
      }
      #ino_accessor_storage = __runInitializers2(this, _ino_initializers, void 0);
      get ino() {
        return this.#ino_accessor_storage;
      }
      set ino(value) {
        this.#ino_accessor_storage = value;
      }
      #_ino_accessor_storage = (__runInitializers2(this, _ino_extraInitializers), __runInitializers2(this, __ino_initializers, void 0));
      /** Reserved for 64-bit inodes */
      get _ino() {
        return this.#_ino_accessor_storage;
      }
      set _ino(value) {
        this.#_ino_accessor_storage = value;
      }
      #type_accessor_storage = (__runInitializers2(this, __ino_extraInitializers), __runInitializers2(this, _type_initializers, void 0));
      get type() {
        return this.#type_accessor_storage;
      }
      set type(value) {
        this.#type_accessor_storage = value;
      }
      #_name_accessor_storage = (__runInitializers2(this, _type_extraInitializers), __runInitializers2(this, __name_initializers, void 0));
      get _name() {
        return this.#_name_accessor_storage;
      }
      set _name(value) {
        this.#_name_accessor_storage = value;
      }
      get name() {
        const end = (this._name.indexOf(0) + 1 || 256) - 1;
        const name = import_buffer5.Buffer.from(this._name.subarray(0, end));
        return this._encoding == "buffer" ? name : name.toString(this._encoding);
      }
      /**
       * @internal @protected
       */
      _encoding = __runInitializers2(this, __name_extraInitializers);
      /**
       * @internal @protected
       */
      _parentPath;
      get parentPath() {
        return this._parentPath;
      }
      /**
       * @deprecated Removed in Node v24, use `parentPath` instead.
       */
      get path() {
        warn("Dirent.path was removed in Node v24, use parentPath instead");
        return this._parentPath;
      }
      /**
       * @internal
       */
      static from(path, stats, encoding) {
        const dirent = new Dirent2(new ArrayBuffer(sizeof(Dirent2) + 1));
        dirent._parentPath = dirname(path);
        dirent._name = encodeUTF8(basename(path));
        dirent.ino = stats.ino;
        dirent.type = ifToDt(stats.mode);
        dirent._encoding = encoding;
        return dirent;
      }
      isFile() {
        return this.type === DirType.REG;
      }
      isDirectory() {
        return this.type === DirType.DIR;
      }
      isBlockDevice() {
        return this.type === DirType.BLK;
      }
      isCharacterDevice() {
        return this.type === DirType.CHR;
      }
      isSymbolicLink() {
        return this.type === DirType.LNK;
      }
      isFIFO() {
        return this.type === DirType.FIFO;
      }
      isSocket() {
        return this.type === DirType.SOCK;
      }
    };
    return Dirent2 = _classThis;
  })();
  var Dir = class {
    path;
    context;
    closed = false;
    checkClosed() {
      if (this.closed)
        throw withErrno("EBADF", "Can not use closed Dir");
    }
    _entries;
    constructor(path, context) {
      this.path = path;
      this.context = context;
    }
    close(cb) {
      this.closed = true;
      if (!cb) {
        return Promise.resolve();
      }
      cb();
    }
    /**
     * Synchronously close the directory's underlying resource handle.
     * Subsequent reads will result in errors.
     */
    closeSync() {
      this.closed = true;
    }
    async _read() {
      this.checkClosed();
      this._entries ??= await readdir.call(this.context, this.path, {
        withFileTypes: true
      });
      if (!this._entries.length)
        return null;
      return this._entries.shift() ?? null;
    }
    read(cb) {
      if (!cb) {
        return this._read();
      }
      void this._read().then((value) => cb(void 0, value));
    }
    /**
     * Synchronously read the next directory entry via `readdir(3)` as a `Dirent`.
     * If there are no more directory entries to read, null will be returned.
     * Directory entries returned by this function are in no particular order as provided by the operating system's underlying directory mechanisms.
     */
    readSync() {
      this.checkClosed();
      this._entries ??= readdirSync.call(this.context, this.path, { withFileTypes: true });
      if (!this._entries.length)
        return null;
      return this._entries.shift() ?? null;
    }
    async next() {
      const value = await this._read();
      if (value) {
        return { done: false, value };
      }
      await this.close();
      return { done: true, value: void 0 };
    }
    /**
     * Asynchronously iterates over the directory via `readdir(3)` until all entries have been read.
     */
    [Symbol.asyncIterator]() {
      return this;
    }
    [Symbol.asyncDispose]() {
      return Promise.resolve();
    }
  };

  // node_modules/@zenfs/core/dist/vfs/streams.js
  var import_readable_stream = __toESM(require_browser3(), 1);
  var ReadStream = class extends import_readable_stream.Readable {
    pending = true;
    _path = "<unknown>";
    _bytesRead = 0;
    reader;
    ready;
    constructor(opts = {}, handleOrPromise) {
      super({ ...opts, encoding: opts.encoding ?? void 0 });
      this.ready = Promise.resolve(handleOrPromise).then((handle) => {
        this._path = handle.path;
        const internal = handle.readableWebStream({ start: opts.start, end: opts.end });
        this.reader = internal.getReader();
        this.pending = false;
      }).catch((err2) => {
        this.destroy(err2);
      });
    }
    async _read() {
      try {
        await this.ready;
        if (!this.reader)
          return;
        const { done, value } = await this.reader.read();
        if (done) {
          this.push(null);
          return;
        }
        this._bytesRead += value.byteLength;
        this.push(value);
      } catch (err2) {
        this.destroy(new Exception(Errno.EIO, err2.toString()));
      }
    }
    close(callback = () => null) {
      try {
        this.destroy();
        this.emit("close");
        callback(null);
      } catch (err2) {
        callback(new Exception(Errno.EIO, err2.toString()));
      }
    }
    get path() {
      return this._path;
    }
    get bytesRead() {
      return this._bytesRead;
    }
    wrap(oldStream) {
      super.wrap(oldStream);
      return this;
    }
  };
  var WriteStream = class extends import_readable_stream.Writable {
    pending = true;
    _path = "<unknown>";
    _bytesWritten = 0;
    writer;
    ready;
    constructor(opts = {}, handleOrPromise) {
      super(opts);
      this.ready = Promise.resolve(handleOrPromise).then((handle) => {
        this._path = handle.path;
        const internal = handle.writableWebStream({ start: opts.start });
        this.writer = internal.getWriter();
        this.pending = false;
      }).catch((err2) => this.destroy(err2));
    }
    async _write(chunk, encoding, callback) {
      await this.ready;
      if (!this.writer)
        return callback(warn(UV("EAGAIN", "write", this._path)));
      if (encoding != "buffer")
        return callback(warn(UV("ENOTSUP", "write", this._path)));
      const data = new Uint8Array(chunk.buffer, chunk.byteOffset, chunk.byteLength);
      try {
        await this.writer.write(data);
        this._bytesWritten += chunk.byteLength;
        callback();
      } catch (error) {
        callback(new Exception(Errno.EIO, error.toString()));
      }
    }
    async _final(callback) {
      await this.ready;
      if (!this.writer)
        return callback();
      try {
        await this.writer.close();
        callback();
      } catch (error) {
        callback(new Exception(Errno.EIO, error.toString()));
      }
    }
    close(callback = () => null) {
      try {
        this.destroy();
        this.emit("close");
        callback(null);
      } catch (error) {
        callback(new Exception(Errno.EIO, error.toString()));
      }
    }
    get path() {
      return this._path;
    }
    get bytesWritten() {
      return this._bytesWritten;
    }
  };

  // node_modules/@zenfs/core/dist/vfs/promises.js
  var __addDisposableResource3 = function(env, value, async) {
    if (value !== null && value !== void 0) {
      if (typeof value !== "object" && typeof value !== "function") throw new TypeError("Object expected.");
      var dispose, inner;
      if (async) {
        if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
        dispose = value[Symbol.asyncDispose];
      }
      if (dispose === void 0) {
        if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
        dispose = value[Symbol.dispose];
        if (async) inner = dispose;
      }
      if (typeof dispose !== "function") throw new TypeError("Object not disposable.");
      if (inner) dispose = function() {
        try {
          inner.call(this);
        } catch (e) {
          return Promise.reject(e);
        }
      };
      env.stack.push({ value, dispose, async });
    } else if (async) {
      env.stack.push({ async: true });
    }
    return value;
  };
  var __disposeResources3 = /* @__PURE__ */ function(SuppressedError2) {
    return function(env) {
      function fail(e) {
        env.error = env.hasError ? new SuppressedError2(e, env.error, "An error was suppressed during disposal.") : e;
        env.hasError = true;
      }
      var r, s = 0;
      function next() {
        while (r = env.stack.pop()) {
          try {
            if (!r.async && s === 1) return s = 0, env.stack.push(r), Promise.resolve().then(next);
            if (r.dispose) {
              var result = r.dispose.call(r.value);
              if (r.async) return s |= 2, Promise.resolve(result).then(next, function(e) {
                fail(e);
                return next();
              });
            } else s |= 1;
          } catch (e) {
            fail(e);
          }
        }
        if (s === 1) return env.hasError ? Promise.reject(env.error) : Promise.resolve();
        if (env.hasError) throw env.error;
      }
      return next();
    };
  }(typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
  });
  var FileHandle = class {
    context;
    fd;
    _buffer;
    /**
     * Get the current file position.
     *
     * We emulate the following bug mentioned in the Node documentation:
     *
     * On Linux, positional writes don't work when the file is opened in append mode.
     * The kernel ignores the position argument and always appends the data to the end of the file.
     * @returns The current file position.
     */
    get position() {
      return this._sync.position;
    }
    set position(value) {
      this._sync.position = value;
    }
    /**
     * Whether the file has changes which have not been written to the FS
     */
    dirty = false;
    /**
     * Whether the file is open or closed
     */
    closed = false;
    /** The path relative to the context's root */
    get path() {
      return this._sync.path;
    }
    /** The internal FS associated with the handle */
    get fs() {
      return this._sync.fs;
    }
    /** The path relative to the `FileSystem`'s root */
    get internalPath() {
      return this._sync.internalPath;
    }
    /** The flag the handle was opened with */
    get flag() {
      return this._sync.flag;
    }
    /** Stats for the handle */
    get inode() {
      return this._sync.inode;
    }
    _sync;
    constructor(context, fd) {
      this.context = context;
      this.fd = fd;
      this._sync = fromFD(context, fd);
    }
    get _isSync() {
      return !!(this.flag & O_SYNC || this.inode.flags & InodeFlags.Sync);
    }
    _emitChange() {
      emitChange(this.context, "change", this.path);
    }
    /**
     * Asynchronous fchown(2) - Change ownership of a file.
     */
    async chown(uid, gid) {
      if (this.closed)
        throw UV("EBADF", "chown", this.path);
      this.dirty = true;
      _chown(this.inode, uid, gid);
      if (this._isSync)
        await this.sync();
      this._emitChange();
    }
    /**
     * Asynchronous fchmod(2) - Change permissions of a file.
     * @param mode A file mode. If a string is passed, it is parsed as an octal integer.
     */
    async chmod(mode) {
      const numMode = normalizeMode(mode, -1);
      if (numMode < 0)
        throw UV("EINVAL", "chmod", this.path);
      if (this.closed)
        throw UV("EBADF", "chmod", this.path);
      this.dirty = true;
      this.inode.mode = this.inode.mode & (numMode > S_IFMT ? ~S_IFMT : S_IFMT) | numMode;
      if (this._isSync || numMode > S_IFMT)
        await this.sync();
      this._emitChange();
    }
    /**
     * Asynchronous fdatasync(2) - synchronize a file's in-core state with storage device.
     */
    datasync() {
      return this.sync();
    }
    /**
     * Asynchronous fsync(2) - synchronize a file's in-core state with the underlying storage device.
     */
    async sync() {
      if (this.closed)
        throw UV("EBADF", "sync", this.path);
      if (!this.dirty)
        return;
      if (!this.fs.attributes.has("no_write"))
        await this.fs.touch(this.internalPath, this.inode);
      this.dirty = false;
    }
    /**
     * Asynchronous ftruncate(2) - Truncate a file to a specified length.
     * @param length If not specified, defaults to `0`.
     */
    async truncate(length = 0) {
      if (this.closed)
        throw UV("EBADF", "truncate", this.path);
      if (length < 0)
        throw UV("EINVAL", "truncate", this.path);
      if (!(this.flag & O_WRONLY || this.flag & O_RDWR))
        throw UV("EBADF", "truncate", this.path);
      if (this.fs.attributes.has("readonly"))
        throw UV("EROFS", "truncate", this.path);
      if (this.inode.flags & InodeFlags.Immutable)
        throw UV("EPERM", "truncate", this.path);
      this.dirty = true;
      if (!(this.flag & O_WRONLY || this.flag & O_RDWR))
        throw UV("EBADF", "truncate", this.path);
      this.inode.mtimeMs = Date.now();
      this.inode.size = length;
      if (this._isSync)
        await this.sync();
      this._emitChange();
    }
    /**
     * Asynchronously change file timestamps of the file.
     * @param atime The last access time. If a string is provided, it will be coerced to number.
     * @param mtime The last modified time. If a string is provided, it will be coerced to number.
     */
    async utimes(atime, mtime) {
      if (this.closed)
        throw UV("EBADF", "utimes", this.path);
      this.dirty = true;
      this.inode.atimeMs = normalizeTime(atime);
      this.inode.mtimeMs = normalizeTime(mtime);
      if (this._isSync)
        await this.sync();
      this._emitChange();
    }
    /**
     * Asynchronously append data to a file, creating the file if it does not exist. The underlying file will _not_ be closed automatically.
     * The `FileHandle` must have been opened for appending.
     * @param data The data to write. If something other than a `Buffer` or `Uint8Array` is provided, the value is coerced to a string.
     * @param _options Either the encoding for the file, or an object optionally specifying the encoding, file mode, and flag.
     * - `encoding` defaults to `'utf8'`.
     * - `mode` defaults to `0o666`.
     * - `flag` defaults to `'a'`.
     */
    async appendFile(data, _options = {}) {
      const options = normalizeOptions(_options, "utf8", "a", 420);
      const flag = parse2(options.flag);
      if (!(flag & O_APPEND))
        throw UV("EBADF", "write", this.path);
      const encodedData = typeof data == "string" ? import_buffer7.Buffer.from(data, options.encoding) : data;
      await this._write(encodedData, 0, encodedData.length);
      this._emitChange();
    }
    /**
     * Read data from the file.
     * @param buffer The buffer that the data will be written to.
     * @param offset The offset within the buffer where writing will start.
     * @param length An integer specifying the number of bytes to read.
     * @param position An integer specifying where to begin reading from in the file.
     * If position is unset, data will be read from the current file position.
     */
    async _read(buffer, offset = 0, length = buffer.byteLength - offset, position = this.position) {
      if (this.closed)
        throw UV("EBADF", "read", this.path);
      if (this.flag & O_WRONLY)
        throw UV("EBADF", "read", this.path);
      if (!(this.inode.flags & InodeFlags.NoAtime) && !this.fs.attributes.has("no_atime")) {
        this.dirty = true;
        this.inode.atimeMs = Date.now();
      }
      let end = position + length;
      if (!isCharacterDevice(this.inode) && !isBlockDevice(this.inode) && end > this.inode.size) {
        end = position + Math.max(this.inode.size - position, 0);
      }
      this._sync.position = end;
      const uint8 = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
      await this.fs.read(this.internalPath, uint8.subarray(offset, offset + length), position, end);
      if (this._isSync)
        await this.sync();
      return { bytesRead: end - position, buffer };
    }
    async read(buffer, offset, length, position) {
      if (typeof offset == "object" && offset != null) {
        position = offset.position;
        length = offset.length;
        offset = offset.offset;
      }
      if (!ArrayBuffer.isView(buffer) && typeof buffer == "object") {
        position = buffer.position;
        length = buffer.length;
        offset = buffer.offset;
        buffer = buffer.buffer;
      }
      const pos = Number.isSafeInteger(position) ? position : this.position;
      buffer ||= new Uint8Array(this.inode.size);
      offset ??= 0;
      return this._read(buffer, offset, length ?? buffer.byteLength - offset, pos);
    }
    async readFile(_options) {
      const options = normalizeOptions(_options, null, "r", 292);
      const flag = parse2(options.flag);
      if (flag & O_WRONLY)
        throw UV("EBADF", "read", this.path);
      const { size } = await this.stat();
      const data = new Uint8Array(size);
      await this._read(data, 0, size, 0);
      const buffer = import_buffer7.Buffer.from(data);
      return options.encoding ? buffer.toString(options.encoding) : buffer;
    }
    /**
     * Read file data using a `ReadableStream`.
     * The handle will not be closed automatically.
     */
    readableWebStream(options = {}) {
      if (this.closed)
        throw UV("EBADF", "readableWebStream", this.path);
      return this.fs.streamRead(this.internalPath, options);
    }
    /**
     * Not part of the Node.js API!
     *
     * Write file data using a `WritableStream`.
     * The handle will not be closed automatically.
     * @internal
     */
    writableWebStream(options = {}) {
      if (this.closed)
        throw UV("EBADF", "writableWebStream", this.path);
      if (this.inode.flags & InodeFlags.Immutable)
        throw UV("EPERM", "writableWebStream", this.path);
      return this.fs.streamWrite(this.internalPath, options);
    }
    /**
     * Creates a readline Interface object that allows reading the file line by line
     * @param options Options for creating a read stream
     * @returns A readline interface for reading the file line by line
     */
    readLines(options) {
      if (this.closed || this.flag & O_WRONLY)
        throw UV("EBADF", "read", this.path);
      return createInterface({ input: this.createReadStream(options), crlfDelay: Infinity });
    }
    [Symbol.asyncDispose]() {
      return this.close();
    }
    async stat(opts) {
      if (this.closed)
        throw UV("EBADF", "stat", this.path);
      if (checkAccess && !hasAccess(this.context, this.inode, R_OK))
        throw UV("EACCES", "stat", this.path);
      return opts?.bigint ? new BigIntStats(this.inode) : new Stats(this.inode);
    }
    /**
     * Write buffer to the file.
     * @param buffer Uint8Array containing the data to write to the file.
     * @param offset Offset in the buffer to start reading data from.
     * @param length The amount of bytes to write to the file.
     * @param position Offset from the beginning of the file where this data should be written.
     * If position is null, the data will be written at  the current position.
     */
    async _write(buffer, offset = 0, length = buffer.byteLength - offset, position = this.position) {
      if (this.closed)
        throw UV("EBADF", "write", this.path);
      if (this.inode.flags & InodeFlags.Immutable)
        throw UV("EPERM", "write", this.path);
      if (!(this.flag & O_WRONLY || this.flag & O_RDWR))
        throw UV("EBADF", "write", this.path);
      if (this.fs.attributes.has("readonly"))
        throw UV("EROFS", "write", this.path);
      this.dirty = true;
      const end = position + length;
      const slice = buffer.subarray(offset, offset + length);
      if (!isCharacterDevice(this.inode) && !isBlockDevice(this.inode) && end > this.inode.size)
        this.inode.size = end;
      this.inode.mtimeMs = Date.now();
      this.inode.ctimeMs = Date.now();
      this._sync.position = position + slice.byteLength;
      await this.fs.write(this.internalPath, slice, position);
      if (this._isSync)
        await this.sync();
      return slice.byteLength;
    }
    /**
     * Asynchronously writes `string` to the file.
     * The `FileHandle` must have been opened for writing.
     * It is unsafe to call `write()` multiple times on the same file without waiting for the `Promise`
     * to be resolved (or rejected). For this scenario, `createWriteStream` is strongly recommended.
     */
    async write(data, options, lenOrEnc, position) {
      let buffer, offset, length;
      if (typeof options == "object" && options != null) {
        lenOrEnc = options.length;
        position = options.position;
        options = options.offset;
      }
      if (typeof data === "string") {
        position = typeof options === "number" ? options : null;
        offset = 0;
        buffer = import_buffer7.Buffer.from(data, typeof lenOrEnc === "string" ? lenOrEnc : "utf8");
        length = buffer.length;
      } else {
        buffer = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
        offset = options ?? 0;
        length = typeof lenOrEnc == "number" ? lenOrEnc : buffer.byteLength;
        position = typeof position === "number" ? position : null;
      }
      position ??= this.position;
      const bytesWritten = await this._write(buffer, offset, length, position);
      this._emitChange();
      return { buffer: data, bytesWritten };
    }
    /**
     * Asynchronously writes data to a file, replacing the file if it already exists. The underlying file will _not_ be closed automatically.
     * The `FileHandle` must have been opened for writing.
     * It is unsafe to call `writeFile()` multiple times on the same file without waiting for the `Promise` to be resolved (or rejected).
     * @param data The data to write. If something other than a `Buffer` or `Uint8Array` is provided, the value is coerced to a string.
     * @param _options Either the encoding for the file, or an object optionally specifying the encoding, file mode, and flag.
     * - `encoding` defaults to `'utf8'`.
     * - `mode` defaults to `0o666`.
     * - `flag` defaults to `'w'`.
     */
    async writeFile(data, _options = {}) {
      const options = normalizeOptions(_options, "utf8", "w", 420);
      const flag = parse2(options.flag);
      if (!(flag & O_WRONLY || flag & O_RDWR))
        throw UV("EBADF", "writeFile", this.path);
      const encodedData = typeof data == "string" ? import_buffer7.Buffer.from(data, options.encoding) : data;
      await this._write(encodedData, 0, encodedData.length, 0);
      this._emitChange();
    }
    /**
     * Asynchronous close(2) - close a `FileHandle`.
     */
    async close() {
      if (this.closed)
        throw UV("EBADF", "close", this.path);
      await this.sync();
      this.dispose();
      deleteFD(this.context, this.fd);
    }
    /**
     * Cleans up. This will *not* sync the file data to the FS
     */
    dispose(force) {
      if (this.closed)
        throw UV("EBADF", "close", this.path);
      if (this.dirty && !force)
        throw UV("EBUSY", "close", this.path);
      this.closed = true;
    }
    /**
     * Asynchronous `writev`. Writes from multiple buffers.
     * @param buffers An array of Uint8Array buffers.
     * @param position The position in the file where to begin writing.
     * @returns The number of bytes written.
     */
    async writev(buffers, position) {
      if (typeof position == "number")
        this.position = position;
      let bytesWritten = 0;
      for (const buffer of buffers) {
        bytesWritten += (await this.write(buffer)).bytesWritten;
      }
      return { bytesWritten, buffers };
    }
    /**
     * Asynchronous `readv`. Reads into multiple buffers.
     * @param buffers An array of Uint8Array buffers.
     * @param position The position in the file where to begin reading.
     * @returns The number of bytes read.
     */
    async readv(buffers, position) {
      if (typeof position == "number")
        this.position = position;
      let bytesRead = 0;
      for (const buffer of buffers) {
        bytesRead += (await this.read(buffer)).bytesRead;
      }
      return { bytesRead, buffers };
    }
    /**
     * Creates a stream for reading from the file.
     * @param options Options for the readable stream
     */
    createReadStream(options = {}) {
      if (this.closed || this.flag & O_WRONLY)
        throw UV("EBADF", "createReadStream", this.path);
      return new ReadStream(options, this);
    }
    /**
     * Creates a stream for writing to the file.
     * @param options Options for the writeable stream.
     */
    createWriteStream(options = {}) {
      if (this.closed)
        throw UV("EBADF", "createWriteStream", this.path);
      if (this.inode.flags & InodeFlags.Immutable)
        throw UV("EPERM", "createWriteStream", this.path);
      if (this.fs.attributes.has("readonly"))
        throw UV("EROFS", "createWriteStream", this.path);
      return new WriteStream(options, this);
    }
  };
  async function rename(oldPath, newPath) {
    oldPath = normalizePath(oldPath);
    __assertType(oldPath);
    newPath = normalizePath(newPath);
    __assertType(newPath);
    const $ex = { syscall: "rename", path: oldPath, dest: newPath };
    const src = resolveMount(oldPath, this);
    const dst = resolveMount(newPath, this);
    if (src.fs !== dst.fs)
      throw UV("EXDEV", $ex);
    if (dst.path.startsWith(src.path + "/"))
      throw UV("EBUSY", $ex);
    const parent = await stat.call(this, dirname(oldPath)).catch(rethrow($ex));
    const stats = await stat.call(this, oldPath).catch(rethrow($ex));
    const newParent = await stat.call(this, dirname(newPath)).catch(rethrow($ex));
    const newStats = await stat.call(this, newPath).catch((e) => {
      if (e.code == "ENOENT")
        return null;
      throw setUVMessage(Object.assign(e, $ex));
    });
    if (checkAccess && (!parent.hasAccess(R_OK, this) || !newParent.hasAccess(W_OK, this)))
      throw UV("EACCES", $ex);
    if (newStats && !isDirectory(stats) && isDirectory(newStats))
      throw UV("EISDIR", $ex);
    if (newStats && isDirectory(stats) && !isDirectory(newStats))
      throw UV("ENOTDIR", $ex);
    await src.fs.rename(src.path, dst.path).catch(rethrow($ex));
    emitChange(this, "rename", oldPath);
    emitChange(this, "change", newPath);
  }
  async function exists(path) {
    try {
      const { fs, path: resolved } = resolveMount(await realpath.call(this, path), this);
      return await fs.exists(resolved);
    } catch (e) {
      if (e instanceof Exception && e.code == "ENOENT") {
        return false;
      }
      throw e;
    }
  }
  async function stat(path, options) {
    path = normalizePath(path);
    const { fs, path: resolved } = resolveMount(await realpath.call(this, path), this);
    const $ex = { syscall: "stat", path };
    const stats = await fs.stat(resolved).catch(rethrow($ex));
    if (checkAccess && !hasAccess(this, stats, R_OK))
      throw UV("EACCES", $ex);
    return options?.bigint ? new BigIntStats(stats) : new Stats(stats);
  }
  async function lstat(path, options) {
    path = normalizePath(path);
    const $ex = { syscall: "lstat", path };
    path = join(await realpath.call(this, dirname(path)), basename(path));
    const { fs, path: resolved } = resolveMount(path, this);
    const stats = await fs.stat(resolved).catch(rethrow($ex));
    if (checkAccess && !hasAccess(this, stats, R_OK))
      throw UV("EACCES", $ex);
    return options?.bigint ? new BigIntStats(stats) : new Stats(stats);
  }
  async function truncate(path, len = 0) {
    const env_1 = { stack: [], error: void 0, hasError: false };
    try {
      const handle = __addDisposableResource3(env_1, await open.call(this, path, "r+"), true);
      await handle.truncate(len);
    } catch (e_1) {
      env_1.error = e_1;
      env_1.hasError = true;
    } finally {
      const result_1 = __disposeResources3(env_1);
      if (result_1)
        await result_1;
    }
  }
  async function unlink(path) {
    path = normalizePath(path);
    const { fs, path: resolved } = resolveMount(path, this);
    const $ex = { syscall: "unlink", path };
    const stats = await fs.stat(resolved).catch(rethrow($ex));
    if (checkAccess && !hasAccess(this, stats, W_OK))
      throw UV("EACCES", $ex);
    await fs.unlink(resolved).catch(rethrow($ex));
    emitChange(this, "rename", path.toString());
  }
  async function _open($, path, opt) {
    path = normalizePath(path);
    const mode = normalizeMode(opt.mode, 420), flag = parse2(opt.flag);
    const $ex = { syscall: "open", path };
    const { fs, path: resolved, stats } = await _resolve($, path.toString(), opt.preserveSymlinks);
    if (!stats) {
      if (!(flag & O_CREAT))
        throw UV("ENOENT", $ex);
      const parentStats = await fs.stat(dirname(resolved));
      if (checkAccess && !hasAccess($, parentStats, W_OK))
        throw UV("EACCES", "open", dirname(path));
      if (!isDirectory(parentStats))
        throw UV("ENOTDIR", "open", dirname(path));
      if (!opt.allowDirectory && mode & S_IFDIR)
        throw UV("EISDIR", "open", path);
      const { euid: uid, egid: gid } = $?.credentials ?? defaultContext.credentials;
      const inode = await fs.createFile(resolved, {
        mode,
        uid: parentStats.mode & S_ISUID ? parentStats.uid : uid,
        gid: parentStats.mode & S_ISGID ? parentStats.gid : gid
      });
      return new FileHandle($, toFD(new SyncHandle($, path, fs, resolved, flag, inode)));
    }
    if (checkAccess && !hasAccess($, stats, toMode(flag)))
      throw UV("EACCES", $ex);
    if (flag & O_EXCL)
      throw UV("EEXIST", $ex);
    const handle = new FileHandle($, toFD(new SyncHandle($, path, fs, resolved, flag, stats)));
    if (!opt.allowDirectory && mode & S_IFDIR)
      throw UV("EISDIR", "open", path);
    if (flag & O_TRUNC)
      await handle.truncate(0);
    return handle;
  }
  async function open(path, flag = "r", mode = 420) {
    return await _open(this, path, { flag, mode });
  }
  async function readFile(path, _options) {
    const env_2 = { stack: [], error: void 0, hasError: false };
    try {
      const options = normalizeOptions(_options, null, "r", 292);
      const handle = __addDisposableResource3(env_2, typeof path == "object" && "fd" in path ? path : await open.call(this, path, options.flag, options.mode), true);
      return await handle.readFile(options);
    } catch (e_2) {
      env_2.error = e_2;
      env_2.hasError = true;
    } finally {
      const result_2 = __disposeResources3(env_2);
      if (result_2)
        await result_2;
    }
  }
  async function writeFile(path, data, _options) {
    const env_3 = { stack: [], error: void 0, hasError: false };
    try {
      const options = normalizeOptions(_options, "utf8", "w+", 420);
      const handle = __addDisposableResource3(env_3, path instanceof FileHandle ? path : await open.call(this, path.toString(), options.flag, options.mode), true);
      const _data = typeof data == "string" ? data : data instanceof DataView ? new Uint8Array(data.buffer, data.byteOffset, data.byteLength) : data;
      if (typeof _data != "string" && !(_data instanceof Uint8Array))
        throw new TypeError('The "data" argument must be of type string or an instance of Buffer, TypedArray, or DataView. Received ' + typeof data);
      await handle.writeFile(_data, options);
    } catch (e_3) {
      env_3.error = e_3;
      env_3.hasError = true;
    } finally {
      const result_3 = __disposeResources3(env_3);
      if (result_3)
        await result_3;
    }
  }
  async function appendFile(path, data, _options) {
    const env_4 = { stack: [], error: void 0, hasError: false };
    try {
      const options = normalizeOptions(_options, "utf8", "a", 420);
      const flag = parse2(options.flag);
      const $ex = { syscall: "write", path: path instanceof FileHandle ? path.path : path.toString() };
      if (!(flag & O_APPEND))
        throw UV("EBADF", $ex);
      const encodedData = typeof data == "string" ? import_buffer7.Buffer.from(data, options.encoding) : new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
      const handle = __addDisposableResource3(env_4, typeof path == "object" && "fd" in path ? path : await open.call(this, path, options.flag, options.mode), true);
      await handle.appendFile(encodedData, options);
    } catch (e_4) {
      env_4.error = e_4;
      env_4.hasError = true;
    } finally {
      const result_4 = __disposeResources3(env_4);
      if (result_4)
        await result_4;
    }
  }
  async function rmdir(path) {
    path = await realpath.call(this, path);
    const { fs, path: resolved } = resolveMount(path, this);
    const $ex = { syscall: "rmdir", path };
    const stats = await fs.stat(resolved).catch(rethrow($ex));
    if (!stats)
      throw UV("ENOENT", $ex);
    if (!isDirectory(stats))
      throw UV("ENOTDIR", $ex);
    if (checkAccess && !hasAccess(this, stats, W_OK))
      throw UV("EACCES", $ex);
    await fs.rmdir(resolved).catch(rethrow($ex));
    emitChange(this, "rename", path.toString());
  }
  async function mkdir(path, options) {
    const { euid: uid, egid: gid } = this?.credentials ?? defaultContext.credentials;
    options = typeof options === "object" ? options : { mode: options };
    const mode = normalizeMode(options?.mode, 511);
    path = await realpath.call(this, path);
    const { fs, path: resolved } = resolveMount(path, this);
    const __create2 = async (path2, resolved2, parent) => {
      if (checkAccess && !hasAccess(this, parent, W_OK))
        throw UV("EACCES", "mkdir", dirname(path2));
      const inode = await fs.mkdir(resolved2, {
        mode,
        uid: parent.mode & S_ISUID ? parent.uid : uid,
        gid: parent.mode & S_ISGID ? parent.gid : gid
      }).catch(rethrow({ syscall: "mkdir", path: path2 }));
      emitChange(this, "rename", path2);
      return inode;
    };
    if (!options?.recursive) {
      await __create2(path, resolved, await fs.stat(dirname(resolved)).catch(rethrow({ path: dirname(path) })));
      return;
    }
    const dirs = [];
    let origDir = path;
    for (let dir = resolved; !await fs.exists(dir).catch(rethrow({ syscall: "exists", path: origDir })); dir = dirname(dir), origDir = dirname(origDir)) {
      dirs.unshift([origDir, dir]);
    }
    if (!dirs.length)
      return;
    const stats = [await fs.stat(dirname(dirs[0][1])).catch(rethrow({ syscall: "stat", path: dirname(dirs[0][0]) }))];
    for (const [i, [path2, resolved2]] of dirs.entries()) {
      stats.push(await __create2(path2, resolved2, stats[i]));
    }
    return dirs[0][0];
  }
  async function readdir(_path, options) {
    const opt = typeof options === "object" && options != null ? options : { encoding: options, withFileTypes: false, recursive: false };
    const path = await realpath.call(this, _path);
    const { fs, path: resolved } = resolveMount(path, this);
    const $ex = { syscall: "readdir", path };
    const stats = await fs.stat(resolved).catch(rethrow({ syscall: "stat", path }));
    if (!stats)
      throw UV("ENOENT", $ex);
    if (checkAccess && !hasAccess(this, stats, R_OK))
      throw UV("EACCES", $ex);
    if (!isDirectory(stats))
      throw UV("ENOTDIR", $ex);
    const entries2 = await fs.readdir(resolved).catch(rethrow($ex));
    const values = [];
    const addEntry = async (entry) => {
      let entryStats;
      if (opt.recursive || opt.withFileTypes) {
        entryStats = await fs.stat(join(resolved, entry)).catch((e) => {
          if (e.code == "ENOENT")
            return;
          throw setUVMessage(Object.assign(e, { syscall: "stat", path: join(path, entry) }));
        });
        if (!entryStats)
          return;
      }
      if (opt.withFileTypes) {
        values.push(Dirent.from(join(_path.toString(), entry), entryStats, opt.encoding));
      } else if (opt.encoding == "buffer") {
        values.push(import_buffer7.Buffer.from(entry));
      } else {
        values.push(entry);
      }
      if (!opt.recursive || !isDirectory(entryStats))
        return;
      const children = await fs.readdir(join(resolved, entry)).catch(rethrow({ syscall: "readdir", path: join(path, entry) }));
      for (const child of children)
        await addEntry(join(entry, child));
    };
    await Promise.all(entries2.map(addEntry));
    return values;
  }
  async function link(path, dest) {
    path = normalizePath(path);
    dest = normalizePath(dest);
    const { fs, path: resolved } = resolveMount(path, this);
    const dst = resolveMount(dest, this);
    const $ex = { syscall: "link", path };
    if (fs != dst.fs)
      throw UV("EXDEV", $ex);
    const stats = await fs.stat(dirname(resolved)).catch(rethrow({ syscall: "stat", path: dirname(path) }));
    if (checkAccess && !hasAccess(this, stats, R_OK))
      throw UV("EACCES", "link", dirname(path));
    if (checkAccess && !(await stat.call(this, dirname(dest))).hasAccess(W_OK, this))
      throw UV("EACCES", "link", dirname(dest));
    if (checkAccess && !hasAccess(this, await fs.stat(resolved).catch(rethrow($ex)), R_OK))
      throw UV("EACCES", $ex);
    return await fs.link(resolved, dst.path).catch(rethrow($ex));
  }
  async function symlink(dest, path, type = "file") {
    const env_5 = { stack: [], error: void 0, hasError: false };
    try {
      if (!["file", "dir", "junction"].includes(type))
        throw new TypeError("Invalid symlink type: " + type);
      path = normalizePath(path);
      if (await exists.call(this, path))
        throw UV("EEXIST", "symlink", path);
      const handle = __addDisposableResource3(env_5, await _open(this, path, { flag: "w+", mode: 420, preserveSymlinks: true }), true);
      await handle.writeFile(normalizePath(dest, true));
      await handle.chmod(S_IFLNK);
    } catch (e_5) {
      env_5.error = e_5;
      env_5.hasError = true;
    } finally {
      const result_5 = __disposeResources3(env_5);
      if (result_5)
        await result_5;
    }
  }
  async function readlink(path, options) {
    const env_6 = { stack: [], error: void 0, hasError: false };
    try {
      path = normalizePath(path);
      __assertType(path);
      const handle = __addDisposableResource3(env_6, await _open(this, path, { flag: "r", mode: 420, preserveSymlinks: true }), true);
      if (!isSymbolicLink(handle.inode))
        throw UV("EINVAL", "readlink", path);
      const value = await handle.readFile();
      const encoding = typeof options == "object" ? options?.encoding : options;
      return encoding == "buffer" ? value : value.toString(encoding ?? "utf-8");
    } catch (e_6) {
      env_6.error = e_6;
      env_6.hasError = true;
    } finally {
      const result_6 = __disposeResources3(env_6);
      if (result_6)
        await result_6;
    }
  }
  async function chown(path, uid, gid) {
    const env_7 = { stack: [], error: void 0, hasError: false };
    try {
      const handle = __addDisposableResource3(env_7, await open.call(this, path, "r+"), true);
      await handle.chown(uid, gid);
    } catch (e_7) {
      env_7.error = e_7;
      env_7.hasError = true;
    } finally {
      const result_7 = __disposeResources3(env_7);
      if (result_7)
        await result_7;
    }
  }
  async function lchown(path, uid, gid) {
    const env_8 = { stack: [], error: void 0, hasError: false };
    try {
      const handle = __addDisposableResource3(env_8, await _open(this, path, {
        flag: "r+",
        mode: 420,
        preserveSymlinks: true,
        allowDirectory: true
      }), true);
      await handle.chown(uid, gid);
    } catch (e_8) {
      env_8.error = e_8;
      env_8.hasError = true;
    } finally {
      const result_8 = __disposeResources3(env_8);
      if (result_8)
        await result_8;
    }
  }
  async function chmod(path, mode) {
    const env_9 = { stack: [], error: void 0, hasError: false };
    try {
      const handle = __addDisposableResource3(env_9, await open.call(this, path, "r+"), true);
      await handle.chmod(mode);
    } catch (e_9) {
      env_9.error = e_9;
      env_9.hasError = true;
    } finally {
      const result_9 = __disposeResources3(env_9);
      if (result_9)
        await result_9;
    }
  }
  async function lchmod(path, mode) {
    const env_10 = { stack: [], error: void 0, hasError: false };
    try {
      const handle = __addDisposableResource3(env_10, await _open(this, path, {
        flag: "r+",
        mode: 420,
        preserveSymlinks: true,
        allowDirectory: true
      }), true);
      await handle.chmod(mode);
    } catch (e_10) {
      env_10.error = e_10;
      env_10.hasError = true;
    } finally {
      const result_10 = __disposeResources3(env_10);
      if (result_10)
        await result_10;
    }
  }
  async function utimes(path, atime, mtime) {
    const env_11 = { stack: [], error: void 0, hasError: false };
    try {
      const handle = __addDisposableResource3(env_11, await open.call(this, path, "r+"), true);
      await handle.utimes(atime, mtime);
    } catch (e_11) {
      env_11.error = e_11;
      env_11.hasError = true;
    } finally {
      const result_11 = __disposeResources3(env_11);
      if (result_11)
        await result_11;
    }
  }
  async function lutimes(path, atime, mtime) {
    const env_12 = { stack: [], error: void 0, hasError: false };
    try {
      const handle = __addDisposableResource3(env_12, await _open(this, path, {
        flag: "r+",
        mode: 420,
        preserveSymlinks: true,
        allowDirectory: true
      }), true);
      await handle.utimes(new Date(atime), new Date(mtime));
    } catch (e_12) {
      env_12.error = e_12;
      env_12.hasError = true;
    } finally {
      const result_12 = __disposeResources3(env_12);
      if (result_12)
        await result_12;
    }
  }
  async function _resolve($, path, preserveSymlinks) {
    if (preserveSymlinks) {
      const resolved2 = resolveMount(path, $);
      const stats2 = await resolved2.fs.stat(resolved2.path).catch(() => void 0);
      return { ...resolved2, fullPath: path, stats: stats2 };
    }
    try {
      const resolved2 = resolveMount(path, $);
      const stats2 = await resolved2.fs.stat(resolved2.path);
      if (!isSymbolicLink(stats2)) {
        return { ...resolved2, fullPath: path, stats: stats2 };
      }
      const target2 = resolve.call($, dirname(path), (await readlink.call($, path)).toString());
      return await _resolve($, target2);
    } catch {
    }
    const { base, dir } = parse(path);
    const realDir = dir == "/" ? "/" : await realpath.call($, dir);
    const maybePath = join(realDir, base);
    const resolved = resolveMount(maybePath, $);
    const stats = await resolved.fs.stat(resolved.path).catch((e) => {
      if (e.code == "ENOENT")
        return;
      throw setUVMessage(Object.assign(e, { syscall: "stat", path: maybePath }));
    });
    if (!stats)
      return { ...resolved, fullPath: path };
    if (!isSymbolicLink(stats)) {
      return { ...resolved, fullPath: maybePath, stats };
    }
    const target = resolve.call($, realDir, (await readlink.call($, maybePath)).toString());
    return await _resolve($, target);
  }
  async function realpath(path, options) {
    const encoding = typeof options == "string" ? options : options?.encoding ?? "utf8";
    path = normalizePath(path);
    const { fullPath } = await _resolve(this, path);
    if (encoding == "utf8" || encoding == "utf-8")
      return fullPath;
    const buf = import_buffer7.Buffer.from(fullPath, "utf-8");
    if (encoding == "buffer")
      return buf;
    return buf.toString(encoding);
  }
  function watch(filename, options = {}) {
    const watcher = new FSWatcher(this, filename.toString(), typeof options !== "string" ? options : { encoding: options });
    const eventQueue = [];
    let done = false;
    watcher.on("change", (eventType, filename2) => {
      eventQueue.shift()?.({ value: { eventType, filename: filename2 }, done: false });
    });
    function cleanup() {
      done = true;
      watcher.close();
      for (const resolve2 of eventQueue) {
        resolve2({ value: null, done });
      }
      eventQueue.length = 0;
      return Promise.resolve({ value: null, done: true });
    }
    return {
      async next() {
        if (done)
          return Promise.resolve({ value: null, done });
        const { promise, resolve: resolve2 } = Promise.withResolvers();
        eventQueue.push(resolve2);
        return promise;
      },
      return: cleanup,
      throw: cleanup,
      async [Symbol.asyncDispose]() {
        await cleanup();
      },
      [Symbol.asyncIterator]() {
        return this;
      }
    };
  }
  async function access(path, mode = F_OK) {
    if (!checkAccess)
      return;
    const stats = await stat.call(this, path);
    if (!stats.hasAccess(mode, this))
      throw UV("EACCES", "access", path.toString());
  }
  async function rm(path, options) {
    path = normalizePath(path);
    const stats = await lstat.call(this, path).catch((error) => {
      if (error.code == "ENOENT" && options?.force)
        return void 0;
      throw error;
    });
    if (!stats)
      return;
    switch (stats.mode & S_IFMT) {
      case S_IFDIR:
        if (options?.recursive) {
          for (const entry of await readdir.call(this, path)) {
            await rm.call(this, join(path, entry), options);
          }
        }
        await rmdir.call(this, path);
        break;
      case S_IFREG:
      case S_IFLNK:
      case S_IFBLK:
      case S_IFCHR:
        await unlink.call(this, path);
        break;
      case S_IFIFO:
      case S_IFSOCK:
      default:
        throw UV("ENOSYS", "rm", path);
    }
  }
  async function mkdtemp(prefix, options) {
    const encoding = typeof options === "object" ? options?.encoding : options || "utf8";
    const fsName = `${prefix}${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const resolvedPath = "/tmp/" + fsName;
    await mkdir.call(this, resolvedPath);
    return encoding == "buffer" ? import_buffer7.Buffer.from(resolvedPath) : resolvedPath;
  }
  async function copyFile(src, dest, mode) {
    src = normalizePath(src);
    dest = normalizePath(dest);
    if (mode && mode & COPYFILE_EXCL && await exists.call(this, dest))
      throw UV("EEXIST", "copyFile", dest);
    await writeFile.call(this, dest, await readFile.call(this, src));
    emitChange(this, "rename", dest.toString());
  }
  function opendir(path, options) {
    path = normalizePath(path);
    return Promise.resolve(new Dir(path, this));
  }
  async function cp(source, destination, opts) {
    source = normalizePath(source);
    destination = normalizePath(destination);
    const srcStats = await lstat.call(this, source);
    if (opts?.errorOnExist && await exists.call(this, destination))
      throw UV("EEXIST", "cp", destination);
    switch (srcStats.mode & S_IFMT) {
      case S_IFDIR: {
        if (!opts?.recursive)
          throw UV("EISDIR", "cp", source);
        const [entries2] = await Promise.all(
          [
            readdir.call(this, source, { withFileTypes: true }),
            mkdir.call(this, destination, { recursive: true })
          ]
          // Ensure the destination directory exists
        );
        const _cp = async (dirent) => {
          if (opts.filter && !opts.filter(join(source, dirent.name), join(destination, dirent.name))) {
            return;
          }
          await cp.call(this, join(source, dirent.name), join(destination, dirent.name), opts);
        };
        await Promise.all(entries2.map(_cp));
        break;
      }
      case S_IFREG:
      case S_IFLNK:
        await copyFile.call(this, source, destination);
        break;
      case S_IFBLK:
      case S_IFCHR:
      case S_IFIFO:
      case S_IFSOCK:
      default:
        throw UV("ENOSYS", "cp", source);
    }
    if (opts?.preserveTimestamps) {
      await utimes.call(this, destination, srcStats.atime, srcStats.mtime);
    }
  }
  async function statfs(path, opts) {
    path = normalizePath(path);
    const { fs } = resolveMount(path, this);
    return Promise.resolve(_statfs(fs, opts?.bigint));
  }
  function glob(pattern2, opt) {
    pattern2 = Array.isArray(pattern2) ? pattern2 : [pattern2];
    const { cwd = "/", withFileTypes = false, exclude = () => false } = opt || {};
    const regexPatterns = pattern2.map(globToRegex);
    async function* recursiveList(dir) {
      const entries2 = await readdir(dir, { withFileTypes, encoding: "utf8" });
      for (const entry of entries2) {
        const fullPath = withFileTypes ? join(entry.parentPath, entry.name) : dir + "/" + entry;
        if (typeof exclude != "function" ? exclude.some((p) => matchesGlob(p, fullPath)) : exclude(withFileTypes ? entry : fullPath))
          continue;
        if ((await stat(fullPath)).isDirectory() && regexPatterns.some((pattern3) => pattern3.source.includes(".*"))) {
          yield* recursiveList(fullPath);
        }
        if (regexPatterns.some((pattern3) => pattern3.test(fullPath.replace(/^\/+/g, "")))) {
          yield withFileTypes ? entry : fullPath.replace(/^\/+/g, "");
        }
      }
    }
    return recursiveList(cwd);
  }

  // node_modules/@zenfs/core/dist/vfs/async.js
  var nop = () => {
  };
  async function collectAsyncIterator(it) {
    const results = [];
    for await (const result of it) {
      results.push(result);
    }
    return results;
  }
  function rename2(oldPath, newPath, cb = nop) {
    rename.call(this, oldPath, newPath).then(() => cb()).catch(cb);
  }
  function exists2(path, cb = nop) {
    exists.call(this, path).then(cb).catch(() => cb(false));
  }
  function stat2(path, options, callback = nop) {
    callback = typeof options == "function" ? options : callback;
    stat.call(this, path, typeof options != "function" ? options : {}).then((stats) => callback(void 0, stats)).catch(callback);
  }
  function lstat2(path, options, callback = nop) {
    callback = typeof options == "function" ? options : callback;
    lstat.call(this, path, typeof options != "function" ? options : {}).then((stats) => callback(void 0, stats)).catch(callback);
  }
  function truncate2(path, cbLen = 0, cb = nop) {
    cb = typeof cbLen === "function" ? cbLen : cb;
    const len = typeof cbLen === "number" ? cbLen : 0;
    truncate.call(this, path, len).then(() => cb()).catch(cb);
  }
  function unlink2(path, cb = nop) {
    unlink.call(this, path).then(() => cb()).catch(cb);
  }
  function open2(path, flag, cbMode, cb = nop) {
    const mode = normalizeMode(cbMode, 420);
    cb = typeof cbMode === "function" ? cbMode : cb;
    open.call(this, path, flag, mode).then((handle) => cb(void 0, handle.fd)).catch(cb);
  }
  function readFile2(filename, options, cb = nop) {
    cb = typeof options === "function" ? options : cb;
    readFile.call(this, filename, typeof options === "function" ? null : options).then((data) => cb(void 0, data)).catch(cb);
  }
  function writeFile2(filename, data, cbEncOpts, cb = nop) {
    cb = typeof cbEncOpts === "function" ? cbEncOpts : cb;
    writeFile.call(this, filename, data, typeof cbEncOpts != "function" ? cbEncOpts : null).then(() => cb(void 0)).catch(cb);
  }
  function appendFile2(filename, data, cbEncOpts, cb = nop) {
    const optionsOrEncoding = typeof cbEncOpts != "function" ? cbEncOpts : void 0;
    cb = typeof cbEncOpts === "function" ? cbEncOpts : cb;
    appendFile.call(this, filename, data, optionsOrEncoding).then(() => cb()).catch(cb);
  }
  function fstat(fd, options, cb = nop) {
    cb = typeof options == "function" ? options : cb;
    new FileHandle(this, fd).stat().then((stats) => cb(void 0, typeof options == "object" && options?.bigint ? new BigIntStats(stats) : stats)).catch(cb);
  }
  function close(fd, cb = nop) {
    new FileHandle(this, fd).close().then(() => cb()).catch(cb);
  }
  function ftruncate(fd, lenOrCB, cb = nop) {
    const length = typeof lenOrCB === "number" ? lenOrCB : 0;
    cb = typeof lenOrCB === "function" ? lenOrCB : cb;
    const file = new FileHandle(this, fd);
    if (length < 0)
      throw withErrno("EINVAL");
    file.truncate(length).then(() => cb()).catch(cb);
  }
  function fsync(fd, cb = nop) {
    new FileHandle(this, fd).sync().then(() => cb()).catch(cb);
  }
  function fdatasync(fd, cb = nop) {
    new FileHandle(this, fd).datasync().then(() => cb()).catch(cb);
  }
  function write(fd, data, cbPosOff, cbLenEnc, cbPosEnc, cb = nop) {
    let buffer, offset, length, position, encoding;
    const handle = new FileHandle(this, fd);
    if (typeof data === "string") {
      encoding = "utf8";
      switch (typeof cbPosOff) {
        case "function":
          cb = cbPosOff;
          break;
        case "number":
          position = cbPosOff;
          encoding = typeof cbLenEnc === "string" ? cbLenEnc : "utf8";
          cb = typeof cbPosEnc === "function" ? cbPosEnc : cb;
          break;
        default:
          cb = typeof cbLenEnc === "function" ? cbLenEnc : typeof cbPosEnc === "function" ? cbPosEnc : cb;
          cb(withErrno("EINVAL"));
          return;
      }
      buffer = import_buffer8.Buffer.from(data);
      offset = 0;
      length = buffer.length;
      const _cb = cb;
      handle.write(buffer, offset, length, position).then(({ bytesWritten }) => _cb(void 0, bytesWritten, buffer.toString(encoding))).catch(_cb);
    } else {
      buffer = import_buffer8.Buffer.from(data.buffer);
      offset = cbPosOff;
      length = cbLenEnc;
      position = typeof cbPosEnc === "number" ? cbPosEnc : null;
      const _cb = typeof cbPosEnc === "function" ? cbPosEnc : cb;
      void handle.write(buffer, offset, length, position).then(({ bytesWritten }) => _cb(void 0, bytesWritten, buffer)).catch(_cb);
    }
  }
  function read(fd, buffer, offset, length, position, cb = nop) {
    new FileHandle(this, fd).read(buffer, offset, length, position).then(({ bytesRead, buffer: buffer2 }) => cb(void 0, bytesRead, buffer2)).catch(cb);
  }
  function fchown(fd, uid, gid, cb = nop) {
    new FileHandle(this, fd).chown(uid, gid).then(() => cb()).catch(cb);
  }
  function fchmod(fd, mode, cb) {
    new FileHandle(this, fd).chmod(mode).then(() => cb()).catch(cb);
  }
  function futimes(fd, atime, mtime, cb = nop) {
    new FileHandle(this, fd).utimes(atime, mtime).then(() => cb()).catch(cb);
  }
  function rmdir2(path, cb = nop) {
    rmdir.call(this, path).then(() => cb()).catch(cb);
  }
  function mkdir2(path, mode, cb = nop) {
    mkdir.call(this, path, mode).then(() => cb()).catch(cb);
  }
  function readdir2(path, _options, cb = nop) {
    cb = typeof _options == "function" ? _options : cb;
    const options = typeof _options != "function" ? _options : {};
    readdir.call(this, path, options).then((entries2) => cb(void 0, entries2)).catch(cb);
  }
  function link2(existing, newpath, cb = nop) {
    link.call(this, existing, newpath).then(() => cb()).catch(cb);
  }
  function symlink2(target, path, typeOrCB, cb = nop) {
    const type = typeof typeOrCB === "string" ? typeOrCB : "file";
    cb = typeof typeOrCB === "function" ? typeOrCB : cb;
    symlink.call(this, target, path, type).then(() => cb()).catch(cb);
  }
  function readlink2(path, options, callback = nop) {
    callback = typeof options == "function" ? options : callback;
    readlink.call(this, path).then((result) => callback(void 0, result)).catch(callback);
  }
  function chown2(path, uid, gid, cb = nop) {
    chown.call(this, path, uid, gid).then(() => cb()).catch(cb);
  }
  function lchown2(path, uid, gid, cb = nop) {
    lchown.call(this, path, uid, gid).then(() => cb()).catch(cb);
  }
  function chmod2(path, mode, cb = nop) {
    chmod.call(this, path, mode).then(() => cb()).catch(cb);
  }
  function lchmod2(path, mode, cb = nop) {
    lchmod.call(this, path, mode).then(() => cb()).catch(cb);
  }
  function utimes2(path, atime, mtime, cb = nop) {
    utimes.call(this, path, atime, mtime).then(() => cb()).catch(cb);
  }
  function lutimes2(path, atime, mtime, cb = nop) {
    lutimes.call(this, path, atime, mtime).then(() => cb()).catch(cb);
  }
  function realpath2(path, arg2, cb = nop) {
    cb = typeof arg2 === "function" ? arg2 : cb;
    realpath.call(this, path, typeof arg2 === "function" ? null : arg2).then((result) => cb(void 0, result)).catch(cb);
  }
  function access2(path, cbMode, cb = nop) {
    const mode = typeof cbMode === "number" ? cbMode : R_OK;
    cb = typeof cbMode === "function" ? cbMode : cb;
    access.call(this, path, mode).then(() => cb()).catch(cb);
  }
  var statWatchers = /* @__PURE__ */ new Map();
  function watchFile(path, options, listener) {
    const normalizedPath = normalizePath(path);
    const opts = typeof options != "function" ? options : {};
    if (typeof options == "function") {
      listener = options;
    }
    if (!listener)
      throw UV("EINVAL", "watch", path.toString());
    if (statWatchers.has(normalizedPath)) {
      const entry = statWatchers.get(normalizedPath);
      if (entry) {
        entry.listeners.add(listener);
      }
      return;
    }
    const watcher = new StatWatcher(this, normalizedPath, opts);
    watcher.on("change", (curr, prev) => {
      const entry = statWatchers.get(normalizedPath);
      if (!entry) {
        return;
      }
      for (const listener2 of entry.listeners) {
        listener2(curr, prev);
      }
    });
    statWatchers.set(normalizedPath, { watcher, listeners: /* @__PURE__ */ new Set() });
  }
  function unwatchFile(path, listener = nop) {
    const normalizedPath = normalizePath(path);
    const entry = statWatchers.get(normalizedPath);
    if (entry) {
      if (listener && listener !== nop) {
        entry.listeners.delete(listener);
      } else {
        entry.listeners.clear();
      }
      if (entry.listeners.size === 0) {
        entry.watcher.stop();
        statWatchers.delete(normalizedPath);
      }
    }
  }
  function watch2(path, options, listener) {
    const watcher = new FSWatcher(this, normalizePath(path), typeof options == "object" ? options : {});
    listener = typeof options == "function" ? options : listener;
    watcher.on("change", listener || nop);
    return watcher;
  }
  function createReadStream(path, options) {
    options = typeof options == "object" ? options : { encoding: options };
    const _handle = open.call(this, path, "r", options?.mode);
    return new ReadStream({ ...options, autoClose: true }, _handle);
  }
  function createWriteStream(path, options) {
    options = typeof options == "object" ? options : { encoding: options };
    const _handle = open.call(this, path, "w", options?.mode);
    return new WriteStream(options, _handle);
  }
  function rm2(path, options, callback = nop) {
    callback = typeof options === "function" ? options : callback;
    rm.call(this, path, typeof options === "function" ? void 0 : options).then(() => callback(void 0)).catch(callback);
  }
  function mkdtemp2(prefix, options, callback = nop) {
    callback = typeof options === "function" ? options : callback;
    mkdtemp.call(this, prefix, typeof options != "function" ? options : null).then((result) => callback(void 0, result)).catch(callback);
  }
  function copyFile2(src, dest, flags, callback = nop) {
    callback = typeof flags === "function" ? flags : callback;
    copyFile.call(this, src, dest, typeof flags === "function" ? void 0 : flags).then(() => callback(void 0)).catch(callback);
  }
  function readv(fd, buffers, position, cb = nop) {
    cb = typeof position === "function" ? position : cb;
    new FileHandle(this, fd).readv(buffers, typeof position === "function" ? void 0 : position).then(({ buffers: buffers2, bytesRead }) => cb(void 0, bytesRead, buffers2)).catch(cb);
  }
  function writev(fd, buffers, position, cb = nop) {
    cb = typeof position === "function" ? position : cb;
    new FileHandle(this, fd).writev(buffers, typeof position === "function" ? void 0 : position).then(({ buffers: buffers2, bytesWritten }) => cb(void 0, bytesWritten, buffers2)).catch(cb);
  }
  function opendir2(path, options, cb = nop) {
    cb = typeof options === "function" ? options : cb;
    opendir.call(this, path, typeof options === "function" ? void 0 : options).then((result) => cb(void 0, result)).catch(cb);
  }
  function cp2(source, destination, opts, callback = nop) {
    callback = typeof opts === "function" ? opts : callback;
    cp.call(this, source, destination, typeof opts === "function" ? void 0 : opts).then(() => callback(void 0)).catch(callback);
  }
  function statfs2(path, options, callback = nop) {
    callback = typeof options === "function" ? options : callback;
    statfs.call(this, path, typeof options === "function" ? void 0 : options).then((result) => callback(void 0, result)).catch(callback);
  }
  async function openAsBlob(path, options) {
    const handle = await open.call(this, path.toString(), "r");
    const buffer = await handle.readFile();
    await handle.close();
    return new Blob([buffer], options);
  }
  function glob2(pattern2, options, callback = nop) {
    callback = typeof options == "function" ? options : callback;
    const it = glob.call(this, pattern2, typeof options === "function" ? void 0 : options);
    collectAsyncIterator(it).then((results) => callback(null, results ?? [])).catch((e) => callback(e));
  }

  // node_modules/@zenfs/core/dist/vfs/ioctl.js
  var __esDecorate3 = function(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) {
      if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected");
      return f;
    }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
      var context = {};
      for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
      for (var p in contextIn.access) context.access[p] = contextIn.access[p];
      context.addInitializer = function(f) {
        if (done) throw new TypeError("Cannot add initializers after decoration has completed");
        extraInitializers.push(accept(f || null));
      };
      var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
      if (kind === "accessor") {
        if (result === void 0) continue;
        if (result === null || typeof result !== "object") throw new TypeError("Object expected");
        if (_ = accept(result.get)) descriptor.get = _;
        if (_ = accept(result.set)) descriptor.set = _;
        if (_ = accept(result.init)) initializers.unshift(_);
      } else if (_ = accept(result)) {
        if (kind === "field") initializers.unshift(_);
        else descriptor[key] = _;
      }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
  };
  var __runInitializers3 = function(thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
      value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
  };
  var XFlag;
  (function(XFlag2) {
    XFlag2[XFlag2["RealTime"] = 1] = "RealTime";
    XFlag2[XFlag2["PreAlloc"] = 2] = "PreAlloc";
    XFlag2[XFlag2["Immutable"] = 8] = "Immutable";
    XFlag2[XFlag2["Append"] = 16] = "Append";
    XFlag2[XFlag2["Sync"] = 32] = "Sync";
    XFlag2[XFlag2["NoAtime"] = 64] = "NoAtime";
    XFlag2[XFlag2["NoDump"] = 128] = "NoDump";
    XFlag2[XFlag2["RtInherit"] = 256] = "RtInherit";
    XFlag2[XFlag2["ProjInherit"] = 512] = "ProjInherit";
    XFlag2[XFlag2["NoSymlinks"] = 1024] = "NoSymlinks";
    XFlag2[XFlag2["ExtSize"] = 2048] = "ExtSize";
    XFlag2[XFlag2["ExtSzInherit"] = 4096] = "ExtSzInherit";
    XFlag2[XFlag2["NoDefrag"] = 8192] = "NoDefrag";
    XFlag2[XFlag2["FileStream"] = 16384] = "FileStream";
    XFlag2[XFlag2["Dax"] = 32768] = "Dax";
    XFlag2[XFlag2["CowExtSize"] = 65536] = "CowExtSize";
    XFlag2[XFlag2["HasAttr"] = 2147483648] = "HasAttr";
  })(XFlag || (XFlag = {}));
  var fsxattr = (() => {
    var _a, _b, _c, _d, _e;
    let _classDecorators = [struct({ name: "fsxattr" })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BufferView;
    let _xflags_decorators;
    let _xflags_initializers = [];
    let _xflags_extraInitializers = [];
    let _extsize_decorators;
    let _extsize_initializers = [];
    let _extsize_extraInitializers = [];
    let _nextents_decorators;
    let _nextents_initializers = [];
    let _nextents_extraInitializers = [];
    let _projid_decorators;
    let _projid_initializers = [];
    let _projid_extraInitializers = [];
    let _cowextsize_decorators;
    let _cowextsize_initializers = [];
    let _cowextsize_extraInitializers = [];
    let _pad_decorators;
    let _pad_initializers = [];
    let _pad_extraInitializers = [];
    var fsxattr2 = class extends _classSuper {
      static {
        _classThis = this;
      }
      static {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        _xflags_decorators = [(_a = types2).uint32.bind(_a)];
        _extsize_decorators = [(_b = types2).uint32.bind(_b)];
        _nextents_decorators = [(_c = types2).uint32.bind(_c)];
        _projid_decorators = [(_d = types2).uint32.bind(_d)];
        _cowextsize_decorators = [(_e = types2).uint32.bind(_e)];
        _pad_decorators = [types2.char(8)];
        __esDecorate3(this, null, _xflags_decorators, { kind: "accessor", name: "xflags", static: false, private: false, access: { has: (obj) => "xflags" in obj, get: (obj) => obj.xflags, set: (obj, value) => {
          obj.xflags = value;
        } }, metadata: _metadata }, _xflags_initializers, _xflags_extraInitializers);
        __esDecorate3(this, null, _extsize_decorators, { kind: "accessor", name: "extsize", static: false, private: false, access: { has: (obj) => "extsize" in obj, get: (obj) => obj.extsize, set: (obj, value) => {
          obj.extsize = value;
        } }, metadata: _metadata }, _extsize_initializers, _extsize_extraInitializers);
        __esDecorate3(this, null, _nextents_decorators, { kind: "accessor", name: "nextents", static: false, private: false, access: { has: (obj) => "nextents" in obj, get: (obj) => obj.nextents, set: (obj, value) => {
          obj.nextents = value;
        } }, metadata: _metadata }, _nextents_initializers, _nextents_extraInitializers);
        __esDecorate3(this, null, _projid_decorators, { kind: "accessor", name: "projid", static: false, private: false, access: { has: (obj) => "projid" in obj, get: (obj) => obj.projid, set: (obj, value) => {
          obj.projid = value;
        } }, metadata: _metadata }, _projid_initializers, _projid_extraInitializers);
        __esDecorate3(this, null, _cowextsize_decorators, { kind: "accessor", name: "cowextsize", static: false, private: false, access: { has: (obj) => "cowextsize" in obj, get: (obj) => obj.cowextsize, set: (obj, value) => {
          obj.cowextsize = value;
        } }, metadata: _metadata }, _cowextsize_initializers, _cowextsize_extraInitializers);
        __esDecorate3(this, null, _pad_decorators, { kind: "accessor", name: "pad", static: false, private: false, access: { has: (obj) => "pad" in obj, get: (obj) => obj.pad, set: (obj, value) => {
          obj.pad = value;
        } }, metadata: _metadata }, _pad_initializers, _pad_extraInitializers);
        __esDecorate3(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        fsxattr2 = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers3(_classThis, _classExtraInitializers);
      }
      #xflags_accessor_storage = __runInitializers3(this, _xflags_initializers, void 0);
      /** xflags field value */
      get xflags() {
        return this.#xflags_accessor_storage;
      }
      set xflags(value) {
        this.#xflags_accessor_storage = value;
      }
      #extsize_accessor_storage = (__runInitializers3(this, _xflags_extraInitializers), __runInitializers3(this, _extsize_initializers, void 0));
      /** extsize field value */
      get extsize() {
        return this.#extsize_accessor_storage;
      }
      set extsize(value) {
        this.#extsize_accessor_storage = value;
      }
      #nextents_accessor_storage = (__runInitializers3(this, _extsize_extraInitializers), __runInitializers3(this, _nextents_initializers, void 0));
      /** nextents field value */
      get nextents() {
        return this.#nextents_accessor_storage;
      }
      set nextents(value) {
        this.#nextents_accessor_storage = value;
      }
      #projid_accessor_storage = (__runInitializers3(this, _nextents_extraInitializers), __runInitializers3(this, _projid_initializers, void 0));
      /** project identifier */
      get projid() {
        return this.#projid_accessor_storage;
      }
      set projid(value) {
        this.#projid_accessor_storage = value;
      }
      #cowextsize_accessor_storage = (__runInitializers3(this, _projid_extraInitializers), __runInitializers3(this, _cowextsize_initializers, void 0));
      /** CoW extsize field value */
      get cowextsize() {
        return this.#cowextsize_accessor_storage;
      }
      set cowextsize(value) {
        this.#cowextsize_accessor_storage = value;
      }
      #pad_accessor_storage = (__runInitializers3(this, _cowextsize_extraInitializers), __runInitializers3(this, _pad_initializers, []));
      get pad() {
        return this.#pad_accessor_storage;
      }
      set pad(value) {
        this.#pad_accessor_storage = value;
      }
      constructor(inode = _throw(new Exception(Errno.EINVAL, "fsxattr must be initialized with an inode"))) {
        super(new ArrayBuffer(sizeof(fsxattr2)));
        __runInitializers3(this, _pad_extraInitializers);
        this.extsize = inode.size;
        this.nextents = 1;
        this.projid = inode.uid;
        this.cowextsize = inode.size;
        for (const name of Object.keys(InodeFlags)) {
          if (!(inode.flags & InodeFlags[name]))
            continue;
          if (name in XFlag)
            this.xflags |= XFlag[name];
        }
      }
    };
    return fsxattr2 = _classThis;
  })();
  var FileFlag;
  (function(FileFlag2) {
    FileFlag2[FileFlag2["SecureRm"] = 1] = "SecureRm";
    FileFlag2[FileFlag2["Undelete"] = 2] = "Undelete";
    FileFlag2[FileFlag2["Compress"] = 4] = "Compress";
    FileFlag2[FileFlag2["Sync"] = 8] = "Sync";
    FileFlag2[FileFlag2["Immutable"] = 16] = "Immutable";
    FileFlag2[FileFlag2["Append"] = 32] = "Append";
    FileFlag2[FileFlag2["NoDump"] = 64] = "NoDump";
    FileFlag2[FileFlag2["NoAtime"] = 128] = "NoAtime";
    FileFlag2[FileFlag2["Dirty"] = 256] = "Dirty";
    FileFlag2[FileFlag2["CompressBlk"] = 512] = "CompressBlk";
    FileFlag2[FileFlag2["NoCompress"] = 1024] = "NoCompress";
    FileFlag2[FileFlag2["Encrypt"] = 2048] = "Encrypt";
    FileFlag2[FileFlag2["Btree"] = 4096] = "Btree";
    FileFlag2[FileFlag2["Index"] = 4096] = "Index";
    FileFlag2[FileFlag2["IMagic"] = 8192] = "IMagic";
    FileFlag2[FileFlag2["JournalData"] = 16384] = "JournalData";
    FileFlag2[FileFlag2["NoTail"] = 32768] = "NoTail";
    FileFlag2[FileFlag2["DirSync"] = 65536] = "DirSync";
    FileFlag2[FileFlag2["TopDir"] = 131072] = "TopDir";
    FileFlag2[FileFlag2["HugeFile"] = 262144] = "HugeFile";
    FileFlag2[FileFlag2["Extent"] = 524288] = "Extent";
    FileFlag2[FileFlag2["Verity"] = 1048576] = "Verity";
    FileFlag2[FileFlag2["EaInode"] = 2097152] = "EaInode";
    FileFlag2[FileFlag2["EofBlocks"] = 4194304] = "EofBlocks";
    FileFlag2[FileFlag2["NoCow"] = 8388608] = "NoCow";
    FileFlag2[FileFlag2["Dax"] = 33554432] = "Dax";
    FileFlag2[FileFlag2["InlineData"] = 268435456] = "InlineData";
    FileFlag2[FileFlag2["ProjInherit"] = 536870912] = "ProjInherit";
    FileFlag2[FileFlag2["CaseFold"] = 1073741824] = "CaseFold";
    FileFlag2[FileFlag2["Reserved"] = 2147483648] = "Reserved";
  })(FileFlag || (FileFlag = {}));
  var IOC;
  (function(IOC2) {
    IOC2[IOC2["GetFlags"] = 2148034049] = "GetFlags";
    IOC2[IOC2["SetFlags"] = 1074292226] = "SetFlags";
    IOC2[IOC2["GetVersion"] = 2148038145] = "GetVersion";
    IOC2[IOC2["SetVersion"] = 1074296322] = "SetVersion";
    IOC2[IOC2["Fiemap"] = 3223348747] = "Fiemap";
    IOC2[IOC2["GetXattr"] = 2149341215] = "GetXattr";
    IOC2[IOC2["SetXattr"] = 1075599392] = "SetXattr";
    IOC2[IOC2["GetLabel"] = 2164298801] = "GetLabel";
    IOC2[IOC2["SetLabel"] = 1090556978] = "SetLabel";
    IOC2[IOC2["GetUUID"] = 2148603136] = "GetUUID";
    IOC2[IOC2["GetSysfsPath"] = 2155943169] = "GetSysfsPath";
  })(IOC || (IOC = {}));
  var IOC32;
  (function(IOC322) {
    IOC322[IOC322["GetFlags"] = 2147771905] = "GetFlags";
    IOC322[IOC322["SetFlags"] = 1074030082] = "SetFlags";
    IOC322[IOC322["GetVersion"] = 2147776001] = "GetVersion";
    IOC322[IOC322["SetVersion"] = 1074034178] = "SetVersion";
  })(IOC32 || (IOC32 = {}));
  async function ioctl(path, command, ...args) {
    path = normalizePath(path);
    const { fs, path: resolved } = resolveMount(path, this);
    try {
      const inode = new Inode(await fs.stat(resolved));
      switch (command) {
        case IOC.GetFlags:
        case IOC32.GetFlags:
          return inode.flags;
        case IOC.SetFlags:
        case IOC32.SetFlags:
          inode.flags = args[0];
          await fs.touch(resolved, inode);
          return void 0;
        case IOC.GetVersion:
        case IOC32.GetVersion:
          return inode.version;
        case IOC.SetVersion:
        case IOC32.SetVersion:
          inode.version = args[0];
          await fs.touch(resolved, inode);
          return void 0;
        case IOC.Fiemap:
          break;
        case IOC.GetXattr:
          return new fsxattr(inode);
        case IOC.SetXattr:
          break;
        case IOC.GetLabel:
          return fs.label;
        case IOC.SetLabel:
          fs.label = args[0];
          return void 0;
        case IOC.GetUUID:
          return fs.uuid;
        case IOC.GetSysfsPath:
          return `/sys/fs/${fs.name}/${fs.uuid}`;
      }
    } catch (e) {
      throw setUVMessage(Object.assign(e, { syscall: "ioctl", path }));
    }
    throw UV("ENOTSUP", "ioctl", path);
  }
  function ioctlSync(path, command, ...args) {
    path = normalizePath(path);
    const { fs, path: resolved } = resolveMount(path, this);
    try {
      const inode = new Inode(fs.statSync(resolved));
      switch (command) {
        case IOC.GetFlags:
        case IOC32.GetFlags:
          return inode.flags;
        case IOC.SetFlags:
        case IOC32.SetFlags:
          inode.flags = args[0];
          fs.touchSync(resolved, inode);
          return void 0;
        case IOC.GetVersion:
        case IOC32.GetVersion:
          return inode.version;
        case IOC.SetVersion:
        case IOC32.SetVersion:
          inode.version = args[0];
          fs.touchSync(resolved, inode);
          return void 0;
        case IOC.Fiemap:
          break;
        case IOC.GetXattr:
          return new fsxattr(inode);
        case IOC.SetXattr:
          break;
        case IOC.GetLabel:
          return fs.label;
        case IOC.SetLabel:
          fs.label = args[0];
          return void 0;
        case IOC.GetUUID:
          return fs.uuid;
        case IOC.GetSysfsPath:
          return `/sys/fs/${fs.name}/${fs.uuid}`;
      }
    } catch (e) {
      throw setUVMessage(Object.assign(e, { syscall: "ioctl", path }));
    }
    throw UV("ENOTSUP", "ioctl", path);
  }

  // node_modules/@zenfs/core/dist/vfs/xattr.js
  var xattr_exports = {};
  __export(xattr_exports, {
    get: () => get,
    getSync: () => getSync,
    list: () => list,
    listSync: () => listSync,
    remove: () => remove,
    removeSync: () => removeSync,
    set: () => set,
    setSync: () => setSync
  });
  var import_buffer10 = __toESM(require_buffer(), 1);
  var _allowedRestrictedNames = [];
  function checkName($, name, path, syscall) {
    if (!name.startsWith("user.") && !_allowedRestrictedNames.includes(name))
      throw UV("ENOTSUP", syscall, path);
  }
  async function get(path, name, opt = {}) {
    path = normalizePath(path);
    const { fs, path: resolved } = resolveMount(path, this);
    checkName(this, name, path, "xattr.get");
    const inode = await fs.stat(resolved).catch(rethrow("xattr.get", path));
    if (checkAccess && !hasAccess(this, inode, R_OK))
      throw UV("EACCES", "xattr.get", path);
    inode.attributes ??= new Attributes();
    const value = inode.attributes.get(name);
    if (!value)
      throw UV("ENODATA", "xattr.get", path);
    const buffer = import_buffer10.Buffer.from(value);
    return opt.encoding == "buffer" || !opt.encoding ? buffer : buffer.toString(opt.encoding);
  }
  function getSync(path, name, opt = {}) {
    path = normalizePath(path);
    checkName(this, name, path, "xattr.get");
    const { fs, path: resolved } = resolveMount(path, this);
    let inode;
    try {
      inode = fs.statSync(resolved);
    } catch (e) {
      throw setUVMessage(Object.assign(e, { path }));
    }
    if (checkAccess && !hasAccess(this, inode, R_OK))
      throw UV("EACCES", "xattr.get", path);
    inode.attributes ??= new Attributes();
    const value = inode.attributes.get(name);
    if (!value)
      throw UV("ENODATA", "xattr.get", path);
    const buffer = import_buffer10.Buffer.from(value);
    return opt.encoding == "buffer" || !opt.encoding ? buffer : buffer.toString(opt.encoding);
  }
  async function set(path, name, value, opt = {}) {
    path = normalizePath(path);
    const { fs, path: resolved } = resolveMount(path, this);
    checkName(this, name, path, "xattr.set");
    const inode = await fs.stat(resolved).catch(rethrow("xattr.set", path));
    if (checkAccess && !hasAccess(this, inode, W_OK))
      throw UV("EACCES", "xattr.set", path);
    inode.attributes ??= new Attributes();
    const attr = inode.attributes.get(name);
    if (opt.create && attr)
      throw UV("EEXIST", "xattr.set", path);
    if (opt.replace && !attr)
      throw UV("ENODATA", "xattr.set", path);
    inode.attributes.set(name, import_buffer10.Buffer.from(value));
    await fs.touch(resolved, inode).catch(rethrow("xattr.set", path));
  }
  function setSync(path, name, value, opt = {}) {
    path = normalizePath(path);
    const { fs, path: resolved } = resolveMount(path, this);
    checkName(this, name, path, "xattr.set");
    let inode;
    try {
      inode = fs.statSync(resolved);
    } catch (e) {
      throw setUVMessage(Object.assign(e, { path }));
    }
    if (checkAccess && !hasAccess(this, inode, W_OK))
      throw UV("EACCES", "xattr.set", path);
    inode.attributes ??= new Attributes();
    const attr = inode.attributes.get(name);
    if (opt.create && attr)
      throw UV("EEXIST", "xattr.set", path);
    if (opt.replace && !attr)
      throw UV("ENODATA", "xattr.set", path);
    inode.attributes.set(name, import_buffer10.Buffer.from(value));
    try {
      fs.touchSync(resolved, inode);
    } catch (e) {
      throw setUVMessage(Object.assign(e, { path }));
    }
  }
  async function remove(path, name) {
    path = normalizePath(path);
    const { fs, path: resolved } = resolveMount(path, this);
    checkName(this, name, path, "xattr.remove");
    const inode = await fs.stat(resolved).catch(rethrow("xattr.remove", path));
    if (checkAccess && !hasAccess(this, inode, W_OK))
      throw UV("EACCES", "xattr.remove", path);
    inode.attributes ??= new Attributes();
    const attr = inode.attributes.get(name);
    if (!attr)
      throw UV("ENODATA", "xattr.remove", path);
    inode.attributes.remove(name);
    await fs.touch(resolved, inode);
  }
  function removeSync(path, name) {
    path = normalizePath(path);
    const { fs, path: resolved } = resolveMount(path, this);
    checkName(this, name, path, "xattr.remove");
    let inode;
    try {
      inode = fs.statSync(resolved);
    } catch (e) {
      throw setUVMessage(Object.assign(e, { path }));
    }
    if (checkAccess && !hasAccess(this, inode, W_OK))
      throw UV("EACCES", "xattr.remove", path);
    inode.attributes ??= new Attributes();
    const attr = inode.attributes.get(name);
    if (!attr)
      throw UV("ENODATA", "xattr.remove", path);
    inode.attributes.remove(name);
    try {
      fs.touchSync(resolved, inode);
    } catch (e) {
      throw setUVMessage(Object.assign(e, { path }));
    }
  }
  async function list(path) {
    path = normalizePath(path);
    const { fs, path: resolved } = resolveMount(path, this);
    const inode = await fs.stat(resolved).catch(rethrow("xattr.list", path));
    if (!inode.attributes)
      return [];
    return inode.attributes.keys().toArray();
  }
  function listSync(path) {
    path = normalizePath(path);
    const { fs, path: resolved } = resolveMount(path, this);
    let inode;
    try {
      inode = fs.statSync(resolved);
    } catch (e) {
      throw setUVMessage(Object.assign(e, { path }));
    }
    if (!inode.attributes)
      return [];
    return inode.attributes.keys().toArray();
  }

  // node_modules/@zenfs/core/dist/backends/cow.js
  var journalOperations = ["delete"];
  var maxOpLength = Math.max(...journalOperations.map((op) => op.length));

  // node_modules/@zenfs/core/dist/internal/rpc.js
  function isPort(port) {
    return port != null && typeof port == "object" && "channel" in port && "send" in port && "addHandler" in port && "removeHandler" in port;
  }
  function fromWeb(port) {
    return {
      channel: port,
      send: port.postMessage.bind(port),
      addHandler(handler) {
        port.addEventListener("message", (event) => handler(event.data));
      },
      removeHandler(handler) {
        port.removeEventListener("message", (event) => handler(event.data));
      }
    };
  }
  function fromNode(port) {
    return {
      channel: port,
      send: port.postMessage.bind(port),
      addHandler: port.on.bind(port, "message"),
      removeHandler: port.off.bind(port, "message")
    };
  }
  function fromWebSocket(ws) {
    return {
      channel: ws,
      send(message) {
        ws.send(encodeMessage(message));
      },
      addHandler(handler) {
        ws.addEventListener("message", (event) => {
          handler(decodeMessage(event.data));
        });
      },
      removeHandler(handler) {
        ws.removeEventListener("message", (event) => {
          handler(decodeMessage(event.data));
        });
      }
    };
  }
  function from(port) {
    if (isPort(port))
      return port;
    if (port instanceof WebSocket)
      return fromWebSocket(port);
    if ("on" in port)
      return fromNode(port);
    if ("addEventListener" in port)
      return fromWeb(port);
    throw err(withErrno("EINVAL", "Invalid port type"));
  }
  var encodingVersion = 1;
  function encodeMessage(message) {
    return `Z${encodingVersion}${JSON.stringify(message, (key, value) => {
      if (key == "_zenfs")
        return;
      return value instanceof Uint8Array ? "$" + value.toBase64() : value;
    })}`;
  }
  function decodeMessage(message) {
    if (!message.startsWith("Z"))
      return {};
    message = message.slice(1);
    const v = parseInt(message);
    if (isNaN(v)) {
      warn("Ignoring encoded message with missing version");
      return {};
    }
    message = message.slice(v.toString().length);
    if (!isJSON(message)) {
      warn("Ignoring encoded message with invalid JSON");
      return {};
    }
    if (v != encodingVersion)
      throw err(withErrno("EPROTONOSUPPORT", `Version mismatch in RPC message encoding (got ${v}, expected ${encodingVersion})`));
    return {
      ...JSON.parse(message, (key, value) => typeof value == "string" && value.startsWith("$") ? Uint8Array.fromBase64(value.slice(1)) : value),
      _zenfs: true
    };
  }
  function isMessage(arg) {
    return typeof arg == "object" && arg != null && "_zenfs" in arg && !!arg._zenfs;
  }
  function disposeExecutors(id) {
    const executor = executors.get(id);
    if (!executor)
      return;
    if (executor.timeout) {
      clearTimeout(executor.timeout);
      if (typeof executor.timeout == "object")
        executor.timeout.unref();
    }
    executor.fs._executors.delete(id);
    executors.delete(id);
  }
  var executors = /* @__PURE__ */ new Map();
  function request(request2, { port, timeout: ms = 1e3, fs }) {
    const stack = "\n" + new Error().stack.slice("Error:".length);
    if (!port)
      throw err(withErrno("EINVAL", "Can not make an RPC request without a port"));
    const { resolve: resolve2, reject, promise } = Promise.withResolvers();
    const id = Math.random().toString(16).slice(10);
    const timeout = setTimeout(() => {
      const error = err(withErrno("EIO", "RPC Failed"));
      error.stack += stack;
      disposeExecutors(id);
      reject(error);
    }, ms);
    const executor = { resolve: resolve2, reject, promise, fs, timeout };
    fs._executors.set(id, executor);
    executors.set(id, executor);
    port.send({ ...request2, _zenfs: true, id, stack });
    return promise;
  }
  function __responseMethod(res, ...t) {
    return t.includes(res.method);
  }
  function handleResponse(response) {
    if (!isMessage(response))
      return;
    if (!executors.has(response.id)) {
      const error = err(withErrno("EIO", "Invalid RPC id: " + response.id));
      error.stack += response.stack;
      throw error;
    }
    const { resolve: resolve2, reject } = executors.get(response.id);
    if (response.error) {
      const e = Exception.fromJSON({ code: "EIO", errno: Errno.EIO, ...response.error });
      e.stack += response.stack;
      disposeExecutors(response.id);
      reject(e);
      return;
    }
    disposeExecutors(response.id);
    resolve2(__responseMethod(response, "stat", "createFile", "mkdir") ? new Inode(response.value) : response.value);
    return;
  }
  function attach(port, handler) {
    if (!port)
      throw err(withErrno("EINVAL", "Cannot attach to non-existent port"));
    info("Attached handler to port: " + handler.name);
    port.addHandler(handler);
  }

  // node_modules/@zenfs/core/dist/mixins/shared.js
  var _asyncFSKeys = [
    "rename",
    "stat",
    "touch",
    "createFile",
    "unlink",
    "rmdir",
    "mkdir",
    "readdir",
    "exists",
    "link",
    "sync",
    "read",
    "write"
  ];

  // node_modules/@zenfs/core/dist/mixins/async.js
  function Async(FS) {
    class AsyncFS extends FS {
      /**
       * @deprecated Use {@link sync | `sync`} instead
       */
      async done() {
        return this.sync();
      }
      /**
       * @deprecated Use {@link sync | `sync`} instead
       */
      queueDone() {
        return this.sync();
      }
      _promise = Promise.resolve();
      _async(promise) {
        this._promise = this._promise.then(() => promise);
      }
      _isInitialized = false;
      /** Tracks how many updates to the sync. cache we skipped during initialization */
      _skippedCacheUpdates = 0;
      constructor(...args) {
        super(...args);
        this._patchAsync();
      }
      async ready() {
        await super.ready();
        await this._promise;
        if (this._isInitialized || this.attributes.has("no_async_preload"))
          return;
        this.checkSync();
        await this._sync.ready();
        if (this._sync instanceof StoreFS && this instanceof StoreFS) {
          const sync = this._sync.transaction();
          const async = this.transaction();
          const promises = [];
          for (const key of await async.keys()) {
            promises.push(async.get(key).then((data) => sync.setSync(key, data)));
          }
          await Promise.all(promises);
          this._isInitialized = true;
          return;
        }
        try {
          await this.crossCopy("/");
          debug(`Skipped ${this._skippedCacheUpdates} updates to the sync cache during initialization`);
          this._isInitialized = true;
        } catch (e) {
          this._isInitialized = false;
          throw crit(e);
        }
      }
      checkSync() {
        if (this.attributes.has("no_async_preload")) {
          throw withErrno("ENOTSUP", "Sync preloading has been disabled for this async file system");
        }
        if (!this._sync) {
          throw crit(withErrno("ENOTSUP", "No sync cache is attached to this async file system"));
        }
      }
      renameSync(oldPath, newPath) {
        this.checkSync();
        this._sync.renameSync(oldPath, newPath);
        this._async(this.rename(oldPath, newPath));
      }
      statSync(path) {
        this.checkSync();
        return this._sync.statSync(path);
      }
      touchSync(path, metadata) {
        this.checkSync();
        this._sync.touchSync(path, metadata);
        this._async(this.touch(path, metadata));
      }
      createFileSync(path, options) {
        this.checkSync();
        this._async(this.createFile(path, options));
        return this._sync.createFileSync(path, options);
      }
      unlinkSync(path) {
        this.checkSync();
        this._async(this.unlink(path));
        this._sync.unlinkSync(path);
      }
      rmdirSync(path) {
        this.checkSync();
        this._sync.rmdirSync(path);
        this._async(this.rmdir(path));
      }
      mkdirSync(path, options) {
        this.checkSync();
        this._async(this.mkdir(path, options));
        return this._sync.mkdirSync(path, options);
      }
      readdirSync(path) {
        this.checkSync();
        return this._sync.readdirSync(path);
      }
      linkSync(srcpath, dstpath) {
        this.checkSync();
        this._sync.linkSync(srcpath, dstpath);
        this._async(this.link(srcpath, dstpath));
      }
      async sync() {
        if (!this.attributes.has("no_async_preload") && this._sync)
          this._sync.syncSync();
        await this._promise;
      }
      syncSync() {
        this.checkSync();
        this._sync.syncSync();
      }
      existsSync(path) {
        this.checkSync();
        return this._sync.existsSync(path);
      }
      readSync(path, buffer, offset, end) {
        this.checkSync();
        this._sync.readSync(path, buffer, offset, end);
      }
      writeSync(path, buffer, offset) {
        this.checkSync();
        this._sync.writeSync(path, buffer, offset);
        this._async(this.write(path, buffer, offset));
      }
      streamWrite(path, options) {
        this.checkSync();
        const sync = this._sync.streamWrite(path, options).getWriter();
        const async = super.streamWrite(path, options).getWriter();
        return new WritableStream({
          async write(chunk, controller) {
            await Promise.all([sync.write(chunk), async.write(chunk)]).catch(controller.error.bind(controller));
          },
          async close() {
            await Promise.all([sync.close(), async.close()]);
          },
          async abort(reason) {
            await Promise.all([sync.abort(reason), async.abort(reason)]);
          }
        });
      }
      /**
       * @internal
       */
      async crossCopy(path) {
        this.checkSync();
        const stats = await this.stat(path);
        if (!isDirectory(stats)) {
          this._sync.createFileSync(path, stats);
          const buffer = new Uint8Array(stats.size);
          await this.read(path, buffer, 0, stats.size);
          this._sync.writeSync(path, buffer, 0);
          this._sync.touchSync(path, stats);
          return;
        }
        if (path !== "/") {
          this._sync.mkdirSync(path, stats);
          this._sync.touchSync(path, stats);
        }
        const promises = [];
        for (const file of await this.readdir(path)) {
          promises.push(this.crossCopy(join(path, file)));
        }
        await Promise.all(promises);
      }
      /**
       * @internal
       * Patch all async methods to also call their synchronous counterparts unless called from themselves (either sync or async)
       */
      _patchAsync() {
        debug(`Async: patched ${_asyncFSKeys.length} methods`);
        for (const key of _asyncFSKeys) {
          const originalMethod = this[key].bind(this);
          this[key] = async (...args) => {
            const result = await originalMethod(...args);
            const stack = new Error().stack.split("\n").slice(2).join("\n");
            if (!stack || stack.includes(`at <computed> [as ${key}]`) || stack.includes(`at async <computed> [as ${key}]`) || stack.includes(`${key}Sync `))
              return result;
            if (!this._isInitialized) {
              this._skippedCacheUpdates++;
              return result;
            }
            try {
              this._sync?.[`${key}Sync`]?.(...args);
            } catch (e) {
              const stack2 = e.stack.split("\n").slice(3).join("\n");
              if (stack2.includes(`at <computed> [as ${key}]`) || stack2.includes(`at async <computed> [as ${key}]`) || stack2.includes(`${key}Sync `))
                return result;
              e.message += " (Out of sync!)";
              throw err(e);
            }
            return result;
          };
        }
      }
    }
    return AsyncFS;
  }

  // node_modules/@zenfs/core/dist/backends/port.js
  var PortFS = class extends Async(FileSystem) {
    channel;
    timeout;
    port;
    /**
     * A map of outstanding RPC requests
     * @internal @hidden
     */
    _executors = /* @__PURE__ */ new Map();
    /**
     * @hidden
     */
    _sync = InMemory.create({ label: "tmpfs:port" });
    /**
     * Constructs a new PortFS instance that connects with the FS running on `options.port`.
     */
    constructor(channel, timeout = 250) {
      super(1886351988, "portfs");
      this.channel = channel;
      this.timeout = timeout;
      this.port = from(channel);
      attach(this.port, handleResponse);
    }
    rpc(method, ...args) {
      return request({ method, args }, {
        port: this.port,
        timeout: this.timeout,
        fs: this
      });
    }
    async ready() {
      await this.rpc("ready");
      await super.ready();
    }
    rename(oldPath, newPath) {
      return this.rpc("rename", oldPath, newPath);
    }
    async stat(path) {
      const result = await this.rpc("stat", path);
      return result instanceof Inode ? result : new Inode(result);
    }
    async touch(path, metadata) {
      const inode = metadata instanceof Inode ? metadata : new Inode(metadata);
      await this.rpc("touch", path, new Uint8Array(inode.buffer, inode.byteOffset, inode.byteLength));
    }
    async sync() {
      await this.rpc("sync");
      for (const executor of this._executors.values()) {
        await executor.promise.catch(() => {
        });
      }
    }
    async createFile(path, options) {
      if (options instanceof Inode)
        options = options.toJSON();
      const result = await this.rpc("createFile", path, options);
      return result instanceof Inode ? result : new Inode(result);
    }
    unlink(path) {
      return this.rpc("unlink", path);
    }
    rmdir(path) {
      return this.rpc("rmdir", path);
    }
    async mkdir(path, options) {
      if (options instanceof Inode)
        options = options.toJSON();
      const result = await this.rpc("mkdir", path, options);
      return result instanceof Inode ? result : new Inode(result);
    }
    readdir(path) {
      return this.rpc("readdir", path);
    }
    exists(path) {
      return this.rpc("exists", path);
    }
    link(srcpath, dstpath) {
      return this.rpc("link", srcpath, dstpath);
    }
    async read(path, buffer, start, end) {
      buffer.set(await this.rpc("read", path, buffer, start, end));
    }
    write(path, buffer, offset) {
      return this.rpc("write", path, buffer, offset);
    }
  };

  // node_modules/utilium/dist/checksum.js
  var crc32cTable = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let value = i;
    for (let j = 0; j < 8; j++) {
      value = value & 1 ? 2197175160 ^ value >>> 1 : value >>> 1;
    }
    crc32cTable[i] = value;
  }
  function crc32c(data) {
    let crc = 4294967295;
    for (let i = 0; i < data.length; i++) {
      crc = crc >>> 8 ^ crc32cTable[(crc ^ data[i]) & 255];
    }
    return (crc ^ 4294967295) >>> 0;
  }

  // node_modules/@zenfs/core/dist/backends/single_buffer.js
  var __esDecorate4 = function(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) {
      if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected");
      return f;
    }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
      var context = {};
      for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
      for (var p in contextIn.access) context.access[p] = contextIn.access[p];
      context.addInitializer = function(f) {
        if (done) throw new TypeError("Cannot add initializers after decoration has completed");
        extraInitializers.push(accept(f || null));
      };
      var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
      if (kind === "accessor") {
        if (result === void 0) continue;
        if (result === null || typeof result !== "object") throw new TypeError("Object expected");
        if (_ = accept(result.get)) descriptor.get = _;
        if (_ = accept(result.set)) descriptor.set = _;
        if (_ = accept(result.init)) initializers.unshift(_);
      } else if (_ = accept(result)) {
        if (kind === "field") initializers.unshift(_);
        else descriptor[key] = _;
      }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
  };
  var __runInitializers4 = function(thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
      value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
  };
  var { format: format2 } = new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
    unit: "byte",
    unitDisplay: "narrow"
  });
  var MetadataEntry = (() => {
    var _a, _b, _c, _d;
    let _classDecorators = [struct(packed, { name: "MetadataEntry" })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BufferView;
    let _id_decorators;
    let _id_initializers = [];
    let _id_extraInitializers = [];
    let _offset__decorators;
    let _offset__initializers = [];
    let _offset__extraInitializers = [];
    let _offset_decorators;
    let _offset_initializers = [];
    let _offset_extraInitializers = [];
    let _size_decorators;
    let _size_initializers = [];
    let _size_extraInitializers = [];
    var MetadataEntry2 = class extends _classSuper {
      static {
        _classThis = this;
      }
      static {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        _id_decorators = [(_a = types2).uint32.bind(_a)];
        _offset__decorators = [(_b = types2).uint32.bind(_b)];
        _offset_decorators = [(_c = types2).uint32.bind(_c)];
        _size_decorators = [(_d = types2).uint32.bind(_d)];
        __esDecorate4(this, null, _id_decorators, { kind: "accessor", name: "id", static: false, private: false, access: { has: (obj) => "id" in obj, get: (obj) => obj.id, set: (obj, value) => {
          obj.id = value;
        } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate4(this, null, _offset__decorators, { kind: "accessor", name: "offset_", static: false, private: false, access: { has: (obj) => "offset_" in obj, get: (obj) => obj.offset_, set: (obj, value) => {
          obj.offset_ = value;
        } }, metadata: _metadata }, _offset__initializers, _offset__extraInitializers);
        __esDecorate4(this, null, _offset_decorators, { kind: "accessor", name: "offset", static: false, private: false, access: { has: (obj) => "offset" in obj, get: (obj) => obj.offset, set: (obj, value) => {
          obj.offset = value;
        } }, metadata: _metadata }, _offset_initializers, _offset_extraInitializers);
        __esDecorate4(this, null, _size_decorators, { kind: "accessor", name: "size", static: false, private: false, access: { has: (obj) => "size" in obj, get: (obj) => obj.size, set: (obj, value) => {
          obj.size = value;
        } }, metadata: _metadata }, _size_initializers, _size_extraInitializers);
        __esDecorate4(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        MetadataEntry2 = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers4(_classThis, _classExtraInitializers);
      }
      #id_accessor_storage = __runInitializers4(this, _id_initializers, void 0);
      /** Inode or data ID */
      get id() {
        return this.#id_accessor_storage;
      }
      set id(value) {
        this.#id_accessor_storage = value;
      }
      #offset__accessor_storage = (__runInitializers4(this, _id_extraInitializers), __runInitializers4(this, _offset__initializers, void 0));
      /** Reserved for 64-bit offset expansion */
      get offset_() {
        return this.#offset__accessor_storage;
      }
      set offset_(value) {
        this.#offset__accessor_storage = value;
      }
      #offset_accessor_storage = (__runInitializers4(this, _offset__extraInitializers), __runInitializers4(this, _offset_initializers, void 0));
      /** Offset into the buffer the data is stored at. */
      get offset() {
        return this.#offset_accessor_storage;
      }
      set offset(value) {
        this.#offset_accessor_storage = value;
      }
      #size_accessor_storage = (__runInitializers4(this, _offset_extraInitializers), __runInitializers4(this, _size_initializers, void 0));
      /** The size of the data */
      get size() {
        return this.#size_accessor_storage;
      }
      set size(value) {
        this.#size_accessor_storage = value;
      }
      toString() {
        return `<MetadataEntry @ 0x${this.byteOffset.toString(16).padStart(8, "0")}>`;
      }
      constructor() {
        super(...arguments);
        __runInitializers4(this, _size_extraInitializers);
      }
    };
    return MetadataEntry2 = _classThis;
  })();
  var entries_per_block = 255;
  var max_lock_attempts = 5;
  var MetadataBlock = (() => {
    var _a, _b, _c, _d;
    let _classDecorators = [struct(packed, { name: "MetadataBlock" })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = Int32Array;
    let _checksum_decorators;
    let _checksum_initializers = [];
    let _checksum_extraInitializers = [];
    let _timestamp_decorators;
    let _timestamp_initializers = [];
    let _timestamp_extraInitializers = [];
    let _previous_offset_decorators;
    let _previous_offset_initializers = [];
    let _previous_offset_extraInitializers = [];
    let _items_decorators;
    let _items_initializers = [];
    let _items_extraInitializers = [];
    let _locked_decorators;
    let _locked_initializers = [];
    let _locked_extraInitializers = [];
    var MetadataBlock2 = class extends _classSuper {
      static {
        _classThis = this;
      }
      static {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        _checksum_decorators = [(_a = types2).uint32.bind(_a)];
        _timestamp_decorators = [(_b = types2).uint64.bind(_b)];
        _previous_offset_decorators = [(_c = types2).uint32.bind(_c)];
        _items_decorators = [field(MetadataEntry, { length: entries_per_block })];
        _locked_decorators = [(_d = types2).int32.bind(_d)];
        __esDecorate4(this, null, _checksum_decorators, { kind: "accessor", name: "checksum", static: false, private: false, access: { has: (obj) => "checksum" in obj, get: (obj) => obj.checksum, set: (obj, value) => {
          obj.checksum = value;
        } }, metadata: _metadata }, _checksum_initializers, _checksum_extraInitializers);
        __esDecorate4(this, null, _timestamp_decorators, { kind: "accessor", name: "timestamp", static: false, private: false, access: { has: (obj) => "timestamp" in obj, get: (obj) => obj.timestamp, set: (obj, value) => {
          obj.timestamp = value;
        } }, metadata: _metadata }, _timestamp_initializers, _timestamp_extraInitializers);
        __esDecorate4(this, null, _previous_offset_decorators, { kind: "accessor", name: "previous_offset", static: false, private: false, access: { has: (obj) => "previous_offset" in obj, get: (obj) => obj.previous_offset, set: (obj, value) => {
          obj.previous_offset = value;
        } }, metadata: _metadata }, _previous_offset_initializers, _previous_offset_extraInitializers);
        __esDecorate4(this, null, _items_decorators, { kind: "accessor", name: "items", static: false, private: false, access: { has: (obj) => "items" in obj, get: (obj) => obj.items, set: (obj, value) => {
          obj.items = value;
        } }, metadata: _metadata }, _items_initializers, _items_extraInitializers);
        __esDecorate4(this, null, _locked_decorators, { kind: "accessor", name: "locked", static: false, private: false, access: { has: (obj) => "locked" in obj, get: (obj) => obj.locked, set: (obj, value) => {
          obj.locked = value;
        } }, metadata: _metadata }, _locked_initializers, _locked_extraInitializers);
        __esDecorate4(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        MetadataBlock2 = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers4(_classThis, _classExtraInitializers);
      }
      #checksum_accessor_storage = __runInitializers4(this, _checksum_initializers, void 0);
      /**
       * The crc32c checksum for the metadata block.
       * @privateRemarks Keep this first!
       */
      get checksum() {
        return this.#checksum_accessor_storage;
      }
      set checksum(value) {
        this.#checksum_accessor_storage = value;
      }
      #timestamp_accessor_storage = (__runInitializers4(this, _checksum_extraInitializers), __runInitializers4(this, _timestamp_initializers, BigInt(Date.now())));
      /** The (last) time this metadata block was updated */
      get timestamp() {
        return this.#timestamp_accessor_storage;
      }
      set timestamp(value) {
        this.#timestamp_accessor_storage = value;
      }
      #previous_offset_accessor_storage = (__runInitializers4(this, _timestamp_extraInitializers), __runInitializers4(this, _previous_offset_initializers, void 0));
      /** Offset to the previous metadata block */
      get previous_offset() {
        return this.#previous_offset_accessor_storage;
      }
      set previous_offset(value) {
        this.#previous_offset_accessor_storage = value;
      }
      _previous = __runInitializers4(this, _previous_offset_extraInitializers);
      get previous() {
        if (!this.previous_offset)
          return;
        this._previous ??= new MetadataBlock2(this.buffer, this.previous_offset);
        return this._previous;
      }
      get offsetHex() {
        return "0x" + this.byteOffset.toString(16).padStart(8, "0");
      }
      #items_accessor_storage = __runInitializers4(this, _items_initializers, void 0);
      /** Metadata entries. */
      get items() {
        return this.#items_accessor_storage;
      }
      set items(value) {
        this.#items_accessor_storage = value;
      }
      toString(long = false) {
        if (!long)
          return `<MetadataBlock @ ${this.offsetHex}>`;
        let text = [
          `---- Metadata block at ${this.offsetHex} ----`,
          `Checksum: 0x${this.checksum.toString(16).padStart(8, "0")}`,
          `Last updated: ${new Date(Number(this.timestamp)).toLocaleString()}`,
          `Previous block: 0x${this.previous_offset.toString(16).padStart(8, "0")}`,
          "Entries:"
        ].join("\n");
        for (const entry of this.items) {
          if (!entry.offset)
            continue;
          text += `
	0x${entry.id.toString(16).padStart(8, "0")}: ${format2(entry.size).padStart(5)} at 0x${entry.offset.toString(16).padStart(8, "0")}`;
        }
        return text;
      }
      #locked_accessor_storage = (__runInitializers4(this, _items_extraInitializers), __runInitializers4(this, _locked_initializers, void 0));
      /**
       * If non-zero, this block is locked for writing.
       * Note a int32 is used for `Atomics.wait`
       */
      get locked() {
        return this.#locked_accessor_storage;
      }
      set locked(value) {
        this.#locked_accessor_storage = value;
      }
      /**
       * Wait for the block to be unlocked.
       */
      waitUnlocked(depth = 0) {
        if (depth > max_lock_attempts)
          throw crit(withErrno("EBUSY", `sbfs: exceeded max attempts waiting for metadata block at ${this.offsetHex} to be unlocked`));
        const i = this.length - 1;
        if (!Atomics.load(this, i))
          return;
        switch (Atomics.wait(this, i, 1)) {
          case "ok":
            break;
          case "not-equal":
            depth++;
            err(`sbfs: waiting for metadata block at ${this.offsetHex} to be unlocked (${depth}/${max_lock_attempts})`);
            return this.waitUnlocked(depth);
          case "timed-out":
            throw crit(withErrno("EBUSY", `sbfs: timed out waiting for metadata block at ${this.offsetHex} to be unlocked`));
        }
      }
      lock() {
        this.waitUnlocked();
        const i = offsetof(this, "locked");
        Atomics.store(this, i, 1);
        const release = () => {
          Atomics.store(this, i, 0);
          Atomics.notify(this, i, 1);
        };
        release[Symbol.dispose] = release;
        return release;
      }
      constructor() {
        super(...arguments);
        __runInitializers4(this, _locked_extraInitializers);
      }
    };
    return MetadataBlock2 = _classThis;
  })();
  var sb_magic = 1651715706;
  var usedBytes = 2;
  var SuperBlock = (() => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    let _classDecorators = [struct(packed, { name: "SuperBlock" })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BigUint64Array;
    let _checksum_decorators;
    let _checksum_initializers = [];
    let _checksum_extraInitializers = [];
    let _magic_decorators;
    let _magic_initializers = [];
    let _magic_extraInitializers = [];
    let _version_decorators;
    let _version_initializers = [];
    let _version_extraInitializers = [];
    let _inode_format_decorators;
    let _inode_format_initializers = [];
    let _inode_format_extraInitializers = [];
    let _flags_decorators;
    let _flags_initializers = [];
    let _flags_extraInitializers = [];
    let _used_bytes_decorators;
    let _used_bytes_initializers = [];
    let _used_bytes_extraInitializers = [];
    let _total_bytes_decorators;
    let _total_bytes_initializers = [];
    let _total_bytes_extraInitializers = [];
    let _uuid_decorators;
    let _uuid_initializers = [];
    let _uuid_extraInitializers = [];
    let _metadata_block_size_decorators;
    let _metadata_block_size_initializers = [];
    let _metadata_block_size_extraInitializers = [];
    let _metadata_offset__decorators;
    let _metadata_offset__initializers = [];
    let _metadata_offset__extraInitializers = [];
    let _metadata_offset_decorators;
    let _metadata_offset_initializers = [];
    let _metadata_offset_extraInitializers = [];
    let _label_decorators;
    let _label_initializers = [];
    let _label_extraInitializers = [];
    let __padding_decorators;
    let __padding_initializers = [];
    let __padding_extraInitializers = [];
    var SuperBlock2 = class extends _classSuper {
      static {
        _classThis = this;
      }
      static {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        _checksum_decorators = [(_a = types2).uint32.bind(_a)];
        _magic_decorators = [(_b = types2).uint32.bind(_b)];
        _version_decorators = [(_c = types2).uint16.bind(_c)];
        _inode_format_decorators = [(_d = types2).uint16.bind(_d)];
        _flags_decorators = [(_e = types2).uint32.bind(_e)];
        _used_bytes_decorators = [(_f = types2).uint64.bind(_f)];
        _total_bytes_decorators = [(_g = types2).uint64.bind(_g)];
        _uuid_decorators = [types2.uint8(16)];
        _metadata_block_size_decorators = [(_h = types2).uint32.bind(_h)];
        _metadata_offset__decorators = [(_j = types2).uint32.bind(_j)];
        _metadata_offset_decorators = [(_k = types2).uint32.bind(_k)];
        _label_decorators = [types2.char(64)];
        __padding_decorators = [types2.char(132)];
        __esDecorate4(this, null, _checksum_decorators, { kind: "accessor", name: "checksum", static: false, private: false, access: { has: (obj) => "checksum" in obj, get: (obj) => obj.checksum, set: (obj, value) => {
          obj.checksum = value;
        } }, metadata: _metadata }, _checksum_initializers, _checksum_extraInitializers);
        __esDecorate4(this, null, _magic_decorators, { kind: "accessor", name: "magic", static: false, private: false, access: { has: (obj) => "magic" in obj, get: (obj) => obj.magic, set: (obj, value) => {
          obj.magic = value;
        } }, metadata: _metadata }, _magic_initializers, _magic_extraInitializers);
        __esDecorate4(this, null, _version_decorators, { kind: "accessor", name: "version", static: false, private: false, access: { has: (obj) => "version" in obj, get: (obj) => obj.version, set: (obj, value) => {
          obj.version = value;
        } }, metadata: _metadata }, _version_initializers, _version_extraInitializers);
        __esDecorate4(this, null, _inode_format_decorators, { kind: "accessor", name: "inode_format", static: false, private: false, access: { has: (obj) => "inode_format" in obj, get: (obj) => obj.inode_format, set: (obj, value) => {
          obj.inode_format = value;
        } }, metadata: _metadata }, _inode_format_initializers, _inode_format_extraInitializers);
        __esDecorate4(this, null, _flags_decorators, { kind: "accessor", name: "flags", static: false, private: false, access: { has: (obj) => "flags" in obj, get: (obj) => obj.flags, set: (obj, value) => {
          obj.flags = value;
        } }, metadata: _metadata }, _flags_initializers, _flags_extraInitializers);
        __esDecorate4(this, null, _used_bytes_decorators, { kind: "accessor", name: "used_bytes", static: false, private: false, access: { has: (obj) => "used_bytes" in obj, get: (obj) => obj.used_bytes, set: (obj, value) => {
          obj.used_bytes = value;
        } }, metadata: _metadata }, _used_bytes_initializers, _used_bytes_extraInitializers);
        __esDecorate4(this, null, _total_bytes_decorators, { kind: "accessor", name: "total_bytes", static: false, private: false, access: { has: (obj) => "total_bytes" in obj, get: (obj) => obj.total_bytes, set: (obj, value) => {
          obj.total_bytes = value;
        } }, metadata: _metadata }, _total_bytes_initializers, _total_bytes_extraInitializers);
        __esDecorate4(this, null, _uuid_decorators, { kind: "accessor", name: "uuid", static: false, private: false, access: { has: (obj) => "uuid" in obj, get: (obj) => obj.uuid, set: (obj, value) => {
          obj.uuid = value;
        } }, metadata: _metadata }, _uuid_initializers, _uuid_extraInitializers);
        __esDecorate4(this, null, _metadata_block_size_decorators, { kind: "accessor", name: "metadata_block_size", static: false, private: false, access: { has: (obj) => "metadata_block_size" in obj, get: (obj) => obj.metadata_block_size, set: (obj, value) => {
          obj.metadata_block_size = value;
        } }, metadata: _metadata }, _metadata_block_size_initializers, _metadata_block_size_extraInitializers);
        __esDecorate4(this, null, _metadata_offset__decorators, { kind: "accessor", name: "metadata_offset_", static: false, private: false, access: { has: (obj) => "metadata_offset_" in obj, get: (obj) => obj.metadata_offset_, set: (obj, value) => {
          obj.metadata_offset_ = value;
        } }, metadata: _metadata }, _metadata_offset__initializers, _metadata_offset__extraInitializers);
        __esDecorate4(this, null, _metadata_offset_decorators, { kind: "accessor", name: "metadata_offset", static: false, private: false, access: { has: (obj) => "metadata_offset" in obj, get: (obj) => obj.metadata_offset, set: (obj, value) => {
          obj.metadata_offset = value;
        } }, metadata: _metadata }, _metadata_offset_initializers, _metadata_offset_extraInitializers);
        __esDecorate4(this, null, _label_decorators, { kind: "accessor", name: "label", static: false, private: false, access: { has: (obj) => "label" in obj, get: (obj) => obj.label, set: (obj, value) => {
          obj.label = value;
        } }, metadata: _metadata }, _label_initializers, _label_extraInitializers);
        __esDecorate4(this, null, __padding_decorators, { kind: "accessor", name: "_padding", static: false, private: false, access: { has: (obj) => "_padding" in obj, get: (obj) => obj._padding, set: (obj, value) => {
          obj._padding = value;
        } }, metadata: _metadata }, __padding_initializers, __padding_extraInitializers);
        __esDecorate4(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        SuperBlock2 = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers4(_classThis, _classExtraInitializers);
      }
      constructor(...args) {
        super(...args);
        __runInitializers4(this, __padding_extraInitializers);
        if (this.magic != sb_magic) {
          warn("sbfs: Invalid magic value, assuming this is a fresh super block");
          const md = new MetadataBlock(this.buffer, sizeof(SuperBlock2));
          Object.assign(this, {
            metadata: md,
            metadata_offset: md.byteOffset,
            used_bytes: BigInt(sizeof(SuperBlock2) + sizeof(MetadataBlock)),
            total_bytes: BigInt(this.buffer.byteLength),
            magic: sb_magic,
            version: 1,
            inode_format: _inode_version,
            metadata_block_size: sizeof(MetadataBlock),
            uuid: encodeUUID(crypto.randomUUID())
          });
          _update(this);
          _update(md);
          return;
        }
        if (this.checksum !== checksum(this))
          throw crit(withErrno("EIO", "sbfs: checksum mismatch for super block"));
        this.metadata = new MetadataBlock(this.buffer, this.metadata_offset);
        if (this.metadata.checksum !== checksum(this.metadata))
          throw crit(withErrno("EIO", `sbfs: checksum mismatch for metadata block (saved ${this.metadata.checksum.toString(16).padStart(8, "0")}, computed ${checksum(this.metadata).toString(16).padStart(8, "0")})`));
        if (this.inode_format != _inode_version)
          throw crit(withErrno("EIO", "sbfs: inode format mismatch"));
        if (this.metadata_block_size != sizeof(MetadataBlock))
          throw crit(withErrno("EIO", "sbfs: metadata block size mismatch"));
      }
      #checksum_accessor_storage = __runInitializers4(this, _checksum_initializers, void 0);
      /**
       * The crc32c checksum for the super block.
       * @privateRemarks Keep this first!
       */
      get checksum() {
        return this.#checksum_accessor_storage;
      }
      set checksum(value) {
        this.#checksum_accessor_storage = value;
      }
      #magic_accessor_storage = (__runInitializers4(this, _checksum_extraInitializers), __runInitializers4(this, _magic_initializers, void 0));
      /** Signature for the superblock. */
      get magic() {
        return this.#magic_accessor_storage;
      }
      set magic(value) {
        this.#magic_accessor_storage = value;
      }
      #version_accessor_storage = (__runInitializers4(this, _magic_extraInitializers), __runInitializers4(this, _version_initializers, void 0));
      /** The version of the on-disk format */
      get version() {
        return this.#version_accessor_storage;
      }
      set version(value) {
        this.#version_accessor_storage = value;
      }
      #inode_format_accessor_storage = (__runInitializers4(this, _version_extraInitializers), __runInitializers4(this, _inode_format_initializers, void 0));
      /** Which format of `Inode` is used */
      get inode_format() {
        return this.#inode_format_accessor_storage;
      }
      set inode_format(value) {
        this.#inode_format_accessor_storage = value;
      }
      #flags_accessor_storage = (__runInitializers4(this, _inode_format_extraInitializers), __runInitializers4(this, _flags_initializers, void 0));
      /** Flags for the file system. Currently unused */
      get flags() {
        return this.#flags_accessor_storage;
      }
      set flags(value) {
        this.#flags_accessor_storage = value;
      }
      #used_bytes_accessor_storage = (__runInitializers4(this, _flags_extraInitializers), __runInitializers4(this, _used_bytes_initializers, void 0));
      /** The number of used bytes, including the super block and metadata */
      get used_bytes() {
        return this.#used_bytes_accessor_storage;
      }
      set used_bytes(value) {
        this.#used_bytes_accessor_storage = value;
      }
      #total_bytes_accessor_storage = (__runInitializers4(this, _used_bytes_extraInitializers), __runInitializers4(this, _total_bytes_initializers, void 0));
      /** The total size of the entire file system, including the super block and metadata */
      get total_bytes() {
        return this.#total_bytes_accessor_storage;
      }
      set total_bytes(value) {
        this.#total_bytes_accessor_storage = value;
      }
      #uuid_accessor_storage = (__runInitializers4(this, _total_bytes_extraInitializers), __runInitializers4(this, _uuid_initializers, void 0));
      /** A UUID for this file system */
      get uuid() {
        return this.#uuid_accessor_storage;
      }
      set uuid(value) {
        this.#uuid_accessor_storage = value;
      }
      #metadata_block_size_accessor_storage = (__runInitializers4(this, _uuid_extraInitializers), __runInitializers4(this, _metadata_block_size_initializers, void 0));
      /**
       * The size in bytes of a metadata block.
       * Not currently configurable.
       */
      get metadata_block_size() {
        return this.#metadata_block_size_accessor_storage;
      }
      set metadata_block_size(value) {
        this.#metadata_block_size_accessor_storage = value;
      }
      #metadata_offset__accessor_storage = (__runInitializers4(this, _metadata_block_size_extraInitializers), __runInitializers4(this, _metadata_offset__initializers, void 0));
      /** Reserved for 64-bit offset expansion */
      get metadata_offset_() {
        return this.#metadata_offset__accessor_storage;
      }
      set metadata_offset_(value) {
        this.#metadata_offset__accessor_storage = value;
      }
      #metadata_offset_accessor_storage = (__runInitializers4(this, _metadata_offset__extraInitializers), __runInitializers4(this, _metadata_offset_initializers, void 0));
      /** Offset of the current metadata block */
      get metadata_offset() {
        return this.#metadata_offset_accessor_storage;
      }
      set metadata_offset(value) {
        this.#metadata_offset_accessor_storage = value;
      }
      metadata = __runInitializers4(this, _metadata_offset_extraInitializers);
      #label_accessor_storage = __runInitializers4(this, _label_initializers, void 0);
      /** An optional label for the file system */
      get label() {
        return this.#label_accessor_storage;
      }
      set label(value) {
        this.#label_accessor_storage = value;
      }
      #_padding_accessor_storage = (__runInitializers4(this, _label_extraInitializers), __runInitializers4(this, __padding_initializers, void 0));
      /** Padded to 256 bytes */
      get _padding() {
        return this.#_padding_accessor_storage;
      }
      set _padding(value) {
        this.#_padding_accessor_storage = value;
      }
      /**
       * Rotate out the current metadata block.
       * Allocates a new metadata block, moves the current one to backup,
       * and updates used_bytes accordingly.
       * @returns the new metadata block
       */
      rotateMetadata() {
        const padding = this.used_bytes % BigInt(4);
        Atomics.add(this, usedBytes, padding);
        const offset = Number(Atomics.add(this, usedBytes, BigInt(sizeof(MetadataBlock))));
        const metadata = new MetadataBlock(this.buffer, offset);
        metadata.previous_offset = this.metadata_offset;
        this.metadata = metadata;
        this.metadata_offset = metadata.byteOffset;
        _update(metadata);
        _update(this);
        return metadata;
      }
      /**
       * Checks to see if `length` bytes are unused, starting at `offset`.
       * @internal Not for external use!
       */
      isUnused(offset, length) {
        if (!length)
          return true;
        if (offset + length > this.total_bytes || offset < sizeof(SuperBlock2))
          return false;
        for (let block = this.metadata; block; block = block.previous) {
          if (offset < block.byteOffset + sizeof(MetadataBlock) && offset + length > block.byteOffset)
            return false;
          for (const entry of block.items) {
            if (!entry.offset)
              continue;
            if (offset >= entry.offset && offset < entry.offset + entry.size || offset + length > entry.offset && offset + length <= entry.offset + entry.size || offset <= entry.offset && offset + length >= entry.offset + entry.size) {
              return false;
            }
          }
        }
        return true;
      }
    };
    return SuperBlock2 = _classThis;
  })();
  function checksum(value) {
    return crc32c(new Uint8Array(value.buffer, value.byteOffset + 4, sizeof(value) - 4));
  }
  function _update(value) {
    if (value instanceof MetadataBlock)
      value.timestamp = BigInt(Date.now());
    value.checksum = checksum(value);
  }

  // node_modules/@zenfs/core/package.json
  var package_default = {
    name: "@zenfs/core",
    version: "2.3.3",
    description: "A filesystem, anywhere",
    funding: {
      type: "individual",
      url: "https://github.com/sponsors/james-pre"
    },
    main: "dist/index.js",
    types: "dist/index.d.ts",
    keywords: [
      "filesystem",
      "node",
      "storage"
    ],
    bin: {
      "make-index": "scripts/make-index.js",
      "zenfs-test": "scripts/test.js",
      zci: "scripts/ci-cli.js"
    },
    files: [
      "dist",
      "tests",
      "types",
      "license.md",
      "eslint.shared.js"
    ],
    type: "module",
    homepage: "https://github.com/zen-fs/core",
    author: "James Prevett <jp@jamespre.dev> (https://jamespre.dev)",
    contributors: [
      "John Vilk <jvilk@cs.umass.edu>"
    ],
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/zen-fs/core.git"
    },
    bugs: {
      url: "https://github.com/zen-fs/core/issues"
    },
    engines: {
      node: ">= 18"
    },
    exports: {
      ".": "./dist/index.js",
      "./*": "./dist/*",
      "./emulation/*": "./dist/vfs/*",
      "./promises": "./dist/vfs/promises.js",
      "./path": "./dist/path.js",
      "./eslint": "./eslint.shared.js",
      "./tests/*": "./tests/*",
      "./types/*": "./types/*"
    },
    publishConfig: {
      access: "public",
      provenance: true
    },
    scripts: {
      format: "prettier --write .",
      "format:check": "prettier --check .",
      lint: "eslint src tests",
      test: "npx zenfs-test --clean; npx zenfs-test -abcfp; tests/fetch/run.sh; npx zenfs-test --report",
      build: "tsc -p tsconfig.json",
      "build:docs": "typedoc",
      dev: "npm run build -- --watch",
      prepublishOnly: "npm run build"
    },
    dependencies: {
      "@types/node": "^22.15.2",
      buffer: "^6.0.3",
      eventemitter3: "^5.0.1",
      kerium: "^1.3.4",
      memium: "^0.2.3",
      "readable-stream": "^4.5.2",
      utilium: "^2.3.3"
    },
    devDependencies: {
      "@eslint/js": "^9.8.0",
      "@octokit/action": "^7.0.0",
      "@types/eslint__js": "^8.42.3",
      c8: "^10.1.2",
      eslint: "^9.15.0",
      globals: "^16.0.0",
      prettier: "^3.2.5",
      tsx: "^4.19.1",
      typedoc: "^0.28.0",
      typescript: "^5.7.2",
      "typescript-eslint": "^8.16.0"
    }
  };

  // node_modules/@zenfs/core/dist/index.js
  globalThis.__zenfs__ = Object.assign(Object.create(vfs_exports), { _version: package_default.version });

  // src/types.ts
  var RemoteStorageError = class extends Error {
    constructor(message, code, status) {
      super(message);
      this.code = code;
      this.status = status;
      this.name = "RemoteStorageError";
    }
  };
  var FileNotFoundError = class extends RemoteStorageError {
    constructor(path) {
      super(`File not found: ${path}`, "ENOENT", 404);
      this.name = "FileNotFoundError";
    }
  };
  var DirectoryNotFoundError = class extends RemoteStorageError {
    constructor(path) {
      super(`Directory not found: ${path}`, "ENOENT", 404);
      this.name = "DirectoryNotFoundError";
    }
  };
  var FileExistsError = class extends RemoteStorageError {
    constructor(path) {
      super(`File already exists: ${path}`, "EEXIST", 409);
      this.name = "FileExistsError";
    }
  };
  var AuthenticationError = class extends RemoteStorageError {
    constructor(message = "Authentication failed") {
      super(message, "EAUTH", 401);
      this.name = "AuthenticationError";
    }
  };
  var PermissionDeniedError = class extends RemoteStorageError {
    constructor(path) {
      super(`Permission denied: ${path}`, "EACCES", 403);
      this.name = "PermissionDeniedError";
    }
  };

  // src/utils.ts
  function normalizePath2(path) {
    if (!path || path === "/") {
      return "";
    }
    if (path.startsWith("/")) {
      path = path.slice(1);
    }
    if (path.endsWith("/")) {
      path = path.slice(0, -1);
    }
    return path;
  }
  function getParentPath(path) {
    const normalized = normalizePath2(path);
    if (!normalized) {
      return "";
    }
    const lastSlash = normalized.lastIndexOf("/");
    if (lastSlash === -1) {
      return "";
    }
    return normalized.slice(0, lastSlash);
  }
  function getBasename(path) {
    const normalized = normalizePath2(path);
    if (!normalized) {
      return "";
    }
    const lastSlash = normalized.lastIndexOf("/");
    if (lastSlash === -1) {
      return normalized;
    }
    return normalized.slice(lastSlash + 1);
  }
  function isDirectoryPath(path) {
    return path.endsWith("/");
  }
  function ensureDirectoryPath(path) {
    if (!path) {
      return "/";
    }
    return path.endsWith("/") ? path : path + "/";
  }
  function arrayBufferToUint8Array(buffer) {
    return new Uint8Array(buffer);
  }
  function stringToUint8Array(str) {
    return new TextEncoder().encode(str);
  }
  function uint8ArrayToString(arr) {
    return new TextDecoder().decode(arr);
  }
  function toUint8Array(data) {
    if (typeof data === "string") {
      return stringToUint8Array(data);
    } else if (data instanceof ArrayBuffer) {
      return arrayBufferToUint8Array(data);
    } else if (data instanceof Uint8Array) {
      return data;
    } else {
      throw new Error("Unsupported data type");
    }
  }
  function isBinaryContentType(contentType) {
    if (!contentType) {
      return false;
    }
    const textTypes = [
      "text/",
      "application/json",
      "application/xml",
      "application/javascript",
      "application/x-javascript",
      "application/typescript"
    ];
    return !textTypes.some((type) => contentType.startsWith(type));
  }
  function getCurrentTimestamp() {
    return (/* @__PURE__ */ new Date()).toISOString();
  }
  function isValidPath(path) {
    if (typeof path !== "string") {
      return false;
    }
    const invalidChars = /[<>:"|?*\x00-\x1f]/;
    if (invalidChars.test(path)) {
      return false;
    }
    return true;
  }
  function joinPath(...segments) {
    const joined = segments.filter((segment) => segment && segment.length > 0).map((segment) => segment.replace(/^\/+|\/+$/g, "")).join("/");
    return joined || "";
  }
  function mtimePathFor(filePath) {
    if (filePath.endsWith(".mtime")) {
      console.warn(
        `[zen-fs-remotestoragejs] mtimePathFor received a path that already ends with ".mtime" (${filePath}); returning it unchanged to avoid a nested sidecar. Pass the data file path instead.`
      );
      return filePath;
    }
    const lastSlash = filePath.lastIndexOf("/");
    const dir = lastSlash >= 0 ? filePath.slice(0, lastSlash) : "";
    const fileName = lastSlash >= 0 ? filePath.slice(lastSlash + 1) : filePath;
    const mtimeFileName = `${fileName}.mtime`;
    return dir ? `${dir}/${mtimeFileName}` : mtimeFileName;
  }
  function isMtimeSidecar(name) {
    return name.endsWith(".mtime") && name.length > 6;
  }
  function sidecarToDataPath(sidecarPath) {
    const lastSlash = sidecarPath.lastIndexOf("/");
    const dir = lastSlash >= 0 ? sidecarPath.slice(0, lastSlash) : "";
    const fileName = lastSlash >= 0 ? sidecarPath.slice(lastSlash + 1) : sidecarPath;
    if (!fileName.endsWith(".mtime")) return null;
    const dataFilename = fileName.slice(0, -6);
    if (dataFilename === "") return null;
    return dir ? `${dir}/${dataFilename}` : dataFilename;
  }
  var DOT_META_SUFFIXES = [".mtime", ".version"];
  function isDotMetaSidecar(name) {
    if (!name.startsWith(".")) return false;
    return DOT_META_SUFFIXES.some((s) => name.includes(s));
  }
  function isDoubleDotFile(name) {
    return name.startsWith("..");
  }
  function isMetadataSidecarToDelete(name) {
    return isDotMetaSidecar(name) || isDoubleDotFile(name);
  }

  // node_modules/@richard432/localstorage-logger/dist/index.mjs
  var PREFIX = "debug:";
  function hasLocalStorage() {
    try {
      return typeof localStorage !== "undefined" && localStorage !== null;
    } catch {
      return false;
    }
  }
  function getProcessEnv() {
    try {
      if (typeof process !== "undefined" && process.env !== void 0) {
        return process.env;
      }
    } catch {
    }
    return null;
  }
  function moduleToEnvKey(module) {
    return "DEBUG_" + module.replace(/[:-]/g, "_").toUpperCase();
  }
  function isEnabled2(module) {
    const key = `${PREFIX}${module}`;
    if (hasLocalStorage()) {
      const val = localStorage.getItem(key);
      if (val === null) {
        localStorage.setItem(key, "1");
        return true;
      }
      return val === "1";
    }
    const env = getProcessEnv();
    if (env) {
      const envKey = moduleToEnvKey(module);
      const val = env[envKey];
      if (val === void 0) return true;
      return val === "1";
    }
    return true;
  }
  function createLogger(module) {
    return {
      log(...args) {
        if (isEnabled2(module)) {
          console.log(`[${module}]`, ...args);
        }
      },
      warn(...args) {
        if (isEnabled2(module)) {
          console.warn(`[${module}]`, ...args);
        }
      },
      error(...args) {
        if (isEnabled2(module)) {
          console.error(`[${module}]`, ...args);
        }
      }
    };
  }

  // src/debug.ts
  var loggers = {
    /** HTTP-level request/response logging (buildUrl, makeRequest) */
    http: createLogger("rs:http"),
    /** File existence checks + existence cache */
    exists: createLogger("rs:exists"),
    /** File read operations (readFile, readFileMeta, read) */
    read: createLogger("rs:read"),
    /** File write operations (writeFile, writeFileWithMtime, write, createFile) */
    write: createLogger("rs:write"),
    /** stat() / metadata probing (HEAD requests, dir probes) */
    stat: createLogger("rs:stat"),
    /** Directory listing + cache + patch (ensureDirListing, patchDirListingEntry, readdir, mkdir, rmdir) */
    dir: createLogger("rs:dir"),
    /** File/directory deletion (unlink, rmdir) */
    delete: createLogger("rs:delete"),
    /** Cache persistence (load/save dirListingCache to IndexedDB) */
    cache: createLogger("rs:cache"),
    /** Sync status (shouldSync, buildSnapshot, sync, disconnect) */
    sync: createLogger("rs:sync"),
    /** mtime sidecar operations (writeMtimeSidecar, deleteMtimeSidecar, getRevision, touch, link) */
    mtime: createLogger("rs:mtime"),
    /** Rename operations */
    rename: createLogger("rs:rename"),
    /** Metadata operations not covered by other areas */
    meta: createLogger("rs:meta")
  };
  function truncate3(data, max = 200) {
    let s;
    try {
      s = typeof data === "string" ? data : JSON.stringify(data);
    } catch {
      s = String(data);
    }
    if (s === void 0) s = "undefined";
    if (s.length > max) return s.slice(0, max) + "...";
    return s;
  }
  var methodToArea = {
    buildUrl: "http",
    makeRequest: "http",
    exists: "exists",
    readFile: "read",
    readFileMeta: "read",
    read: "read",
    writeFile: "write",
    writeFileWithMtime: "write",
    write: "write",
    createFile: "write",
    stat: "stat",
    readdir: "dir",
    mkdir: "dir",
    rmdir: "dir",
    ensureDirListing: "dir",
    patchDirListingEntry: "dir",
    unlink: "delete",
    rename: "rename",
    cache: "cache",
    shouldSync: "sync",
    buildSnapshot: "sync",
    sync: "sync",
    disconnect: "sync",
    writeMtimeSidecar: "mtime",
    deleteMtimeSidecar: "mtime",
    getRevision: "mtime",
    touch: "mtime",
    link: "mtime"
  };
  function createLogger2(backendName) {
    const log2 = (method, path, detail) => {
      const area = methodToArea[method] ?? "meta";
      const logger = loggers[area];
      const parts = [`[RS:${backendName}] ${method} path=${path}`];
      if (detail) {
        for (const [k, v] of Object.entries(detail)) {
          parts.push(`${k}=${truncate3(v)}`);
        }
      }
      logger.log(parts.join(" "));
    };
    const logResult = (method, path, result, ok = true) => {
      const area = methodToArea[method] ?? "meta";
      const logger = loggers[area];
      const status = ok ? "OK" : "ERR";
      logger.log(`[RS:${backendName}] ${method} path=${path} \u2192 ${status} ${truncate3(result)}`);
    };
    return { log: log2, logResult };
  }

  // node_modules/zen-fs-cache/dist/index.js
  var IdbKVStore = class {
    /**
     * @param dbName    IndexedDB database name. Use a unique name per
     *                  backend/connection to avoid collisions.
     * @param storeName Object store name within the database.
     */
    constructor(dbName = "zen-fs-kv", storeName = "kv") {
      this.dbName = dbName;
      this.storeName = storeName;
      this.failed = false;
    }
    open() {
      if (this.failed) return Promise.reject(new Error("IndexedDB unavailable"));
      if (this.dbPromise) return this.dbPromise;
      if (!idbAvailable2()) {
        this.failed = true;
        return Promise.reject(new Error("IndexedDB unavailable"));
      }
      this.dbPromise = new Promise((resolve2, reject) => {
        const req = indexedDB.open(this.dbName, 1);
        req.onupgradeneeded = () => {
          const db = req.result;
          if (!db.objectStoreNames.contains(this.storeName)) {
            db.createObjectStore(this.storeName);
          }
        };
        req.onsuccess = () => resolve2(req.result);
        req.onerror = () => reject(req.error);
      });
      return this.dbPromise;
    }
    /**
     * Retrieve a value by key, or `undefined` if not found.
     */
    async get(key) {
      try {
        const db = await this.open();
        return await new Promise((resolve2, reject) => {
          const tx = db.transaction(this.storeName, "readonly");
          const req = tx.objectStore(this.storeName).get(key);
          req.onsuccess = () => resolve2(req.result ?? void 0);
          req.onerror = () => reject(req.error);
        });
      } catch {
        return void 0;
      }
    }
    /**
     * Store a value under the given key. Overwrites existing entries.
     */
    async set(key, value) {
      try {
        const db = await this.open();
        await new Promise((resolve2, reject) => {
          const tx = db.transaction(this.storeName, "readwrite");
          tx.objectStore(this.storeName).put(value, key);
          tx.oncomplete = () => resolve2();
          tx.onerror = () => reject(tx.error);
        });
      } catch {
      }
    }
    /**
     * Delete a single key. No-op if the key does not exist.
     */
    async delete(key) {
      try {
        const db = await this.open();
        await new Promise((resolve2, reject) => {
          const tx = db.transaction(this.storeName, "readwrite");
          tx.objectStore(this.storeName).delete(key);
          tx.oncomplete = () => resolve2();
          tx.onerror = () => reject(tx.error);
        });
      } catch {
      }
    }
    /**
     * Remove all entries from this object store.
     */
    async clear() {
      try {
        const db = await this.open();
        await new Promise((resolve2, reject) => {
          const tx = db.transaction(this.storeName, "readwrite");
          tx.objectStore(this.storeName).clear();
          tx.oncomplete = () => resolve2();
          tx.onerror = () => reject(tx.error);
        });
      } catch {
      }
    }
    /**
     * Return all keys in this store. Useful for bulk operations.
     */
    async keys() {
      try {
        const db = await this.open();
        return await new Promise((resolve2, reject) => {
          const tx = db.transaction(this.storeName, "readonly");
          const req = tx.objectStore(this.storeName).getAllKeys();
          req.onsuccess = () => resolve2(req.result ?? []);
          req.onerror = () => reject(req.error);
        });
      } catch {
        return [];
      }
    }
    /**
     * Return all key-value pairs as an array of `[key, value]` tuples.
     * Useful for bulk-loading an entire cache into memory on startup.
     */
    async entries() {
      try {
        const db = await this.open();
        return await new Promise((resolve2, reject) => {
          const tx = db.transaction(this.storeName, "readonly");
          const store = tx.objectStore(this.storeName);
          const result = [];
          const cursorReq = store.openCursor();
          cursorReq.onsuccess = () => {
            const cursor = cursorReq.result;
            if (cursor) {
              result.push([cursor.key, cursor.value]);
              cursor.continue();
            } else {
              resolve2(result);
            }
          };
          cursorReq.onerror = () => reject(cursorReq.error);
        });
      } catch {
        return [];
      }
    }
    /**
     * Bulk-set multiple key-value pairs in a single transaction.
     * More efficient than calling `set()` in a loop.
     */
    async setMany(entries2) {
      if (entries2.length === 0) return;
      try {
        const db = await this.open();
        await new Promise((resolve2, reject) => {
          const tx = db.transaction(this.storeName, "readwrite");
          const store = tx.objectStore(this.storeName);
          for (const [key, value] of entries2) {
            store.put(value, key);
          }
          tx.oncomplete = () => resolve2();
          tx.onerror = () => reject(tx.error);
        });
      } catch {
      }
    }
  };
  function idbAvailable2() {
    try {
      return typeof indexedDB !== "undefined" && indexedDB !== null;
    } catch {
      return false;
    }
  }

  // src/persistence.ts
  function isBrowserLike() {
    return typeof globalThis !== "undefined" && typeof globalThis.localStorage !== "undefined" && typeof globalThis.window !== "undefined";
  }
  function idbAvailable() {
    try {
      return typeof indexedDB !== "undefined" && indexedDB !== null;
    } catch {
      return false;
    }
  }
  var IdbCacheStorage = class {
    constructor(storageKey) {
      this.store = new IdbKVStore(storageKey, "cache");
    }
    async load() {
      try {
        const entries2 = await this.store.entries();
        const result = {};
        for (const [key, value] of entries2) {
          result[key] = value;
        }
        return result;
      } catch {
        return {};
      }
    }
    async save(data) {
      try {
        const entries2 = Object.entries(data).map(([k, v]) => [k, v]);
        await this.store.setMany(entries2);
      } catch {
      }
    }
  };
  var LocalStorageCache = class {
    constructor(key) {
      this.key = key;
    }
    async load() {
      try {
        const raw = globalThis.localStorage.getItem(this.key);
        if (!raw) return {};
        return JSON.parse(raw);
      } catch {
        return {};
      }
    }
    async save(data) {
      try {
        globalThis.localStorage.setItem(this.key, JSON.stringify(data));
      } catch {
      }
    }
  };
  var FileCache = class {
    constructor(filePath) {
      this.filePath = filePath;
    }
    async readFile() {
      try {
        const { readFile: readFile3 } = await import("fs/promises");
        return await readFile3(this.filePath, "utf-8");
      } catch (err2) {
        if (err2 && err2.code === "ENOENT") return null;
        return null;
      }
    }
    async load() {
      const raw = await this.readFile();
      if (!raw) return {};
      try {
        return JSON.parse(raw);
      } catch {
        return {};
      }
    }
    async save(data) {
      try {
        const { writeFile: writeFile3, mkdir: mkdir3 } = await import("fs/promises");
        const { dirname: dirname2 } = await import("path");
        await mkdir3(dirname2(this.filePath), { recursive: true });
        await writeFile3(this.filePath, JSON.stringify(data), "utf-8");
      } catch {
      }
    }
  };
  var MemoryCache = class {
    constructor() {
      this.map = {};
    }
    async load() {
      return this.map;
    }
    async save(data) {
      this.map = data;
    }
  };
  function createCacheStorage(storageKey, fileOption) {
    if (isBrowserLike() && idbAvailable()) {
      return new IdbCacheStorage(storageKey);
    }
    if (isBrowserLike()) {
      return new LocalStorageCache(storageKey);
    }
    try {
      const filePath = fileOption || (typeof process !== "undefined" && process.cwd ? `${process.cwd()}/.zen-fs-remotestorage-cache.json` : ".zen-fs-remotestorage-cache.json");
      return new FileCache(filePath);
    } catch {
      return new MemoryCache();
    }
  }

  // src/RemoteStorageFileSystem.ts
  var RemoteStorageFileSystem = class _RemoteStorageFileSystem extends FileSystem {
    constructor(config) {
      super(0, 0);
      this.config = config;
      /**
       * Existence cache to avoid repeated GET requests for the same path.
       * - `true`  = confirmed to exist (valid until invalidated by mutations)
       * - `false` = confirmed missing (with TTL to allow re-checking after writes)
       * - `undefined` = unknown, needs network check
       */
      this.existenceCache = /* @__PURE__ */ new Map();
      // 5 min — aligned with DIR_LISTING_TTL
      /**
       * Directory listing cache — caches readdir() results (with per-entry
       * metadata: isDir, etag, size, lastModified) so that stat() can return
       * without a network request, and multiple stat() calls in a directory share
       * one network request.
       *
       * Invalidation is ETag-based (precise): a directory entry is refreshed only
       * when its ETag changes. A long TTL acts as a fallback for servers that do
       * not return directory ETags.
       */
      this.dirListingCache = /* @__PURE__ */ new Map();
      /** In-memory cache of sidecar mtime values to avoid repeated GETs */
      this.mtimeCache = /* @__PURE__ */ new Map();
      // --- Snapshot (ETag baseline for shouldSync) ---
      /** In-memory map of path → ETag, used by shouldSync() to detect remote changes */
      this.snapshot = null;
      /** Root folder's ETag, used as a quick "anything changed?" check */
      this.rootEtag = null;
      /** Whether we've already attempted to restore snapshot from IndexedDB */
      this.snapshotLoaded = false;
      /** Storage backend (localStorage / file / memory). */
      this.storage = null;
      /** Memoized promise resolving once the cache has been loaded from storage. */
      this.loadPromise = null;
      /** Debounced save handle. */
      this.saveTimer = null;
      this.backendName = `RemoteStorage@${config.href.replace(/^https?:\/\//, "")}`;
      this.logger = createLogger2(this.backendName);
      this.baseUrl = config.href.endsWith("/") ? config.href.slice(0, -1) : config.href;
      let bp = config.basePath || "";
      if (bp && !bp.startsWith("/")) bp = "/" + bp;
      if (bp && !bp.endsWith("/")) bp = bp + "/";
      this.config = { ...config, basePath: bp };
      const srp = bp ? "/" : "app_data/";
      this.syncRootPath = srp.endsWith("/") ? srp : srp + "/";
      this.headers = new Headers({
        "Authorization": `Bearer ${config.token}`,
        "Content-Type": "application/json",
        ...config.headers
      });
      this.timeout = config.timeout || 3e4;
      this.usePreciseMtime = config.preciseMtime !== false;
      this.persistCache = config.persistCache !== false;
      this.cacheNamespace = `${this.baseUrl}${this.config.basePath}`;
      if (this.persistCache) {
        this.storage = createCacheStorage(
          "zen-fs-remotestorage-cache",
          config.cacheFile
        );
        this.loadPromise = this.ensureCacheLoaded();
      }
      const idbDbBase = `zen-fs-remotestorage:${this.cacheNamespace}`;
      this.snapshotStore = new IdbKVStore(`${idbDbBase}:snapshot`, "cache");
      this.mtimeStore = new IdbKVStore(`${idbDbBase}:mtime`, "cache");
    }
    /**
     * 校验并标准化路径，抛出异常或返回标准化后的路径
     */
    validateAndNormalizePath(path, ensureDir = false) {
      if (!isValidPath(path)) {
        throw new RemoteStorageError("Invalid path format");
      }
      let p = normalizePath2(path);
      if (ensureDir) {
        p = ensureDirectoryPath(p);
      }
      return p;
    }
    /**
     * 获取目录下的所有条目，返回标准化后的绝对路径数组
     */
    async getDirectoryEntries(path) {
      const entries2 = await this.readdir(path);
      return entries2.map((entry) => joinPath(path, entry));
    }
    static {
      this.NEGATIVE_CACHE_TTL = 6e4;
    }
    static {
      // 1 min for negative results
      this.POSITIVE_CACHE_TTL = 3e5;
    }
    static {
      this.DIR_LISTING_TTL = 3e5;
    }
    static {
      // 5 minutes (fallback)
      /** One cached directory entry (a child of some directory). */
      this.EMPTY_DIR = {
        name: "",
        isDir: true,
        etag: null,
        size: 0,
        lastModified: void 0
      };
    }
    /**
     * Build full URL for a path
     */
    buildUrl(path) {
      const basePath = this.config.basePath || "";
      const normalizedPath = normalizePath2(path);
      const isDir = path === "/" || path.endsWith("/");
      const suffix = normalizedPath ? "/" + normalizedPath + (isDir ? "/" : "") : isDir ? "/" : "";
      const fullPath = basePath.endsWith("/") && suffix.startsWith("/") ? basePath + suffix.slice(1) : basePath + suffix;
      const url = this.baseUrl + fullPath;
      this.logger.log("buildUrl", path, { isDir, url });
      return url;
    }
    /**
     * Make HTTP request with timeout
     */
    async makeRequest(url, options = {}) {
      const method = options.method || "GET";
      this.logger.log("makeRequest", url, { method, attempt: "start" });
      const maxRetries = 3;
      let lastError = null;
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        try {
          const response = await fetch(url, {
            ...options,
            credentials: "omit",
            headers: {
              "Authorization": `Bearer ${this.config.token}`,
              "Content-Type": "application/json",
              ...this.config.headers,
              ...options.headers
            },
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          this.logger.logResult("makeRequest", url, `${method} status=${response.status}`);
          return response;
        } catch (error) {
          clearTimeout(timeoutId);
          lastError = error;
          this.logger.logResult("makeRequest", url, `${method} attempt=${attempt + 1} error=${error instanceof Error ? error.message : String(error)}`, false);
          if (error instanceof Error && (error.name === "AbortError" || error.name === "FetchError" || error.message?.includes("network"))) {
            if (attempt < maxRetries - 1) {
              await new Promise((res) => setTimeout(res, 200 * (attempt + 1)));
              continue;
            }
          }
          if (error instanceof Error && error.name === "AbortError") {
            throw new RemoteStorageError("Request timeout");
          }
          throw error;
        }
      }
      throw lastError || new RemoteStorageError("Unknown HTTP request error");
    }
    /**
     * Handle HTTP response errors
     */
    handleHttpError(response, path, operation) {
      if (response.status === 404) {
        throw new FileNotFoundError(path);
      } else if (response.status === 401) {
        throw new AuthenticationError("Invalid or expired token");
      } else if (response.status === 403) {
        throw new PermissionDeniedError(path);
      } else if (response.status === 409) {
        throw new FileExistsError(path);
      } else if (!response.ok) {
        throw new RemoteStorageError(
          `${operation} failed for ${path}: ${response.status} ${response.statusText}`
        );
      }
    }
    /**
     * Check if path is a directory by trying to list it
     */
    async isDirectory(path) {
      try {
        const dirPath = path.endsWith("/") ? path : path + "/";
        const dirUrl = this.buildUrl(dirPath);
        const response = await this.makeRequest(dirUrl, { method: "GET" });
        if (response.ok) {
          const contentType = response.headers.get("content-type") || "";
          return contentType.includes("application/ld+json") || contentType.includes("text/html");
        }
        return false;
      } catch {
        return false;
      }
    }
    /**
     * Check if file/directory exists
     */
    async exists(path) {
      this.logger.log("exists", path);
      const normalized = normalizePath2(path);
      await this.ensureCacheLoaded();
      loggers.exists.log(`[RS-EXISTS] exists(${path}) backend=${this.backendName}`);
      loggers.exists.log(`[RS-EXISTS]   cache state: ${this.dumpCacheState(path)}`);
      const cached = this.existenceCache.get(normalized);
      if (cached) {
        if (cached.exists) {
          if (Date.now() - cached.ts < _RemoteStorageFileSystem.POSITIVE_CACHE_TTL) {
            loggers.exists.log(`[RS-EXISTS]   \u2192 true (existenceCache HIT: positive, age=${Date.now() - cached.ts}ms < ${_RemoteStorageFileSystem.POSITIVE_CACHE_TTL}ms)`);
            this.logger.logResult("exists", path, true, true);
            return true;
          }
          loggers.exists.log(`[RS-EXISTS]   existenceCache positive EXPIRED (age=${Date.now() - cached.ts}ms), falling through to stat()`);
        } else {
          if (Date.now() - cached.ts < _RemoteStorageFileSystem.NEGATIVE_CACHE_TTL) {
            loggers.exists.log(`[RS-EXISTS]   \u2192 false (existenceCache HIT: negative, age=${Date.now() - cached.ts}ms < ${_RemoteStorageFileSystem.NEGATIVE_CACHE_TTL}ms)`);
            this.logger.logResult("exists", path, false, true);
            return false;
          }
          loggers.exists.log(`[RS-EXISTS]   existenceCache negative EXPIRED (age=${Date.now() - cached.ts}ms), falling through to stat()`);
        }
      } else {
        loggers.exists.log(`[RS-EXISTS]   existenceCache MISS for ${normalized}, calling stat()`);
      }
      try {
        loggers.exists.log(`[RS-EXISTS]   calling stat(${path})...`);
        await this.stat(path);
        this.existenceCache.set(normalized, { exists: true, ts: Date.now() });
        loggers.exists.log(`[RS-EXISTS]   \u2192 true (stat() succeeded, existenceCache updated)`);
        this.logger.logResult("exists", path, true);
        return true;
      } catch (error) {
        if (error instanceof FileNotFoundError) {
          this.existenceCache.set(normalized, { exists: false, ts: Date.now() });
          loggers.exists.log(`[RS-EXISTS]   \u2192 false (stat() threw FileNotFoundError, existenceCache updated)`);
          this.logger.logResult("exists", path, false);
          return false;
        }
        loggers.exists.log(`[RS-EXISTS]   \u2192 ERROR: ${error instanceof Error ? error.message : String(error)}`);
        this.logger.logResult("exists", path, error, false);
        throw error;
      }
    }
    /**
     * Read file contents
     */
    async readFile(path) {
      this.logger.log("readFile", path);
      path = this.validateAndNormalizePath(path);
      const url = this.buildUrl(path);
      try {
        const response = await this.makeRequest(url, { method: "GET" });
        if (!response.ok) {
          this.handleHttpError(response, path, "readFile");
        }
        const arrayBuffer = await response.arrayBuffer();
        const data = new Uint8Array(arrayBuffer);
        this.logger.logResult("readFile", path, `size=${data.byteLength}`);
        return data;
      } catch (error) {
        this.logger.logResult("readFile", path, error, false);
        if (error instanceof FileNotFoundError || error instanceof RemoteStorageError) {
          throw error;
        }
        throw new RemoteStorageError(
          `Failed to read file ${path}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
    /**
     * Write file contents
     */
    async writeFile(path, data, options) {
      const size = typeof data === "string" ? data.length : data.byteLength;
      this.logger.log("writeFile", path, { flag: options?.flag, size });
      path = this.validateAndNormalizePath(path);
      const flag = options?.flag;
      if (flag === "x" || flag === "wx") {
        const exists3 = await this.exists(path);
        if (exists3) {
          this.logger.logResult("writeFile", path, "FileExistsError", false);
          throw new FileExistsError(path);
        }
      }
      const url = this.buildUrl(path);
      try {
        let body;
        let contentType;
        if (typeof data === "string") {
          body = data;
          contentType = "text/plain; charset=utf-8";
        } else if (data instanceof Uint8Array) {
          body = data;
          contentType = "application/octet-stream";
        } else if (data instanceof ArrayBuffer) {
          body = data;
          contentType = "application/octet-stream";
        } else {
          throw new RemoteStorageError("Unsupported data type for writing");
        }
        const headers = new Headers(this.headers);
        headers.set("Content-Type", contentType);
        const response = await this.makeRequest(url, {
          method: "PUT",
          body,
          headers
        });
        if (!response.ok) {
          this.handleHttpError(response, path, "writeFile");
        }
        this.logger.logResult("writeFile", path, `status=${response.status}`);
        this.invalidateExistenceCache(path);
        if (this.usePreciseMtime) {
          const mtime = options?.mtime ?? Date.now();
          await this.writeMtimeSidecar(path, mtime);
        }
        const newEtag = response.headers.get("ETag") ?? void 0;
        const parentPath = getParentPath(path);
        const parentDir = parentPath ? `/${parentPath}/` : "/";
        await this.patchDirListingEntry(parentDir, getBasename(path), {
          name: getBasename(path),
          isDir: false,
          etag: newEtag,
          size,
          lastModified: response.headers.get("Last-Modified") ?? void 0
        });
        this.updateSnapshotForPath(path, newEtag ?? null);
      } catch (error) {
        this.logger.logResult("writeFile", path, error, false);
        if (error instanceof FileExistsError || error instanceof RemoteStorageError) {
          throw error;
        }
        throw new RemoteStorageError(
          `Failed to write file ${path}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
    /**
     * Write file with precise mtime — implements SyncableFS.writeFileWithMtime.
     *
     * Delegates to writeFile() with { mtime } option. When preciseMtime is
     * enabled, a .mtime sidecar is written preserving the exact mtime.
     */
    async writeFileWithMtime(path, data, mtime) {
      this.logger.log("writeFileWithMtime", path, { mtime });
      await this.writeFile(path, data, { mtime });
    }
    /**
     * Delete file.
     *
     * Pre-DELETE existence check:
     * 1. Check existence cache and cached directory listing (zero network cost).
     *    If either definitively says the file doesn't exist, skip the DELETE
     *    entirely — avoids 404 errors on remote backends.
     * 2. If cache is inconclusive, send the DELETE. A 404 response is treated
     *    as success (DELETE is idempotent in REST semantics — the resource is
     *    already gone, which is the desired end state).
     */
    async unlink(path) {
      this.logger.log("unlink", path);
      path = this.validateAndNormalizePath(path);
      const normalized = normalizePath2(path);
      const existCached = this.existenceCache.get(normalized);
      loggers.delete.log(`[RS-UNLINK] unlink(${path}) backend=${this.backendName} normalized=${normalized} existenceCache \u2192 ${existCached ? `exists=${existCached.exists} age=${Date.now() - existCached.ts}ms` : "MISS"}`);
      loggers.delete.log(`[RS-UNLINK]   cache state: ${this.dumpCacheState(path)}`);
      if (existCached && !existCached.exists) {
        if (Date.now() - existCached.ts < _RemoteStorageFileSystem.NEGATIVE_CACHE_TTL) {
          loggers.delete.log(`[RS-UNLINK] unlink(${path}): SKIPPED (existence cache: not found, within TTL)`);
          this.logger.logResult("unlink", path, "skipped (existence cache: not found)");
          return;
        }
        loggers.delete.log(`[RS-UNLINK] unlink(${path}): negative cache expired, proceeding to DELETE`);
      }
      loggers.delete.log(`[RS-UNLINK] unlink(${path}): sending DELETE`);
      try {
        const url = this.buildUrl(path);
        const response = await this.makeRequest(url, { method: "DELETE" });
        loggers.delete.log(`[RS-UNLINK] unlink(${path}): DELETE response status=${response.status}`);
        if (response.status === 404) {
          loggers.delete.log(`[RS-UNLINK] unlink(${path}): 404 \u2014 already deleted, treating as success`);
          this.logger.logResult("unlink", path, "404 \u2014 already deleted, treating as success");
          this.removeFromExistenceCache(path);
          const parentPath2 = getParentPath(path);
          const parentDir2 = parentPath2 ? `/${parentPath2}/` : "/";
          await this.patchDirListingEntry(parentDir2, getBasename(path), null);
          await this.flushSaveNow();
          if (this.usePreciseMtime && !isMtimeSidecar(path)) {
            await this.deleteMtimeSidecar(path);
          }
          this.updateSnapshotForPath(path, null);
          return;
        }
        if (!response.ok) {
          this.handleHttpError(response, path, "unlink");
        }
        this.logger.logResult("unlink", path, `status=${response.status}`);
        this.removeFromExistenceCache(path);
        const parentPath = getParentPath(path);
        const parentDir = parentPath ? `/${parentPath}/` : "/";
        await this.patchDirListingEntry(parentDir, getBasename(path), null);
        await this.flushSaveNow();
        if (this.usePreciseMtime && !isMtimeSidecar(path)) {
          await this.deleteMtimeSidecar(path);
        }
        this.updateSnapshotForPath(path, null);
      } catch (error) {
        this.logger.logResult("unlink", path, error, false);
        if (error instanceof FileNotFoundError || error instanceof RemoteStorageError) {
          throw error;
        }
        throw new RemoteStorageError(
          `Failed to unlink ${path}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
    /**
     * Read directory contents
     */
    async readdir(path) {
      this.logger.log("readdir", path);
      path = this.validateAndNormalizePath(path, true);
      try {
        const entries2 = await this.ensureDirListing(path);
        if (!entries2) {
          this.logger.logResult("readdir", path, "DirectoryNotFoundError", false);
          throw new DirectoryNotFoundError(path);
        }
        const entryNames = new Set(entries2.keys());
        const names = [];
        for (const [name] of entries2) {
          if (name === ".keep") continue;
          if (isMtimeSidecar(name)) {
            const dataName = sidecarToDataPath(name);
            const orphaned = name.endsWith(".mtime.mtime") || // pathological nested sidecar
            !dataName || !entryNames.has(dataName);
            if (orphaned) {
              const full = `${path}${name}`;
              loggers.dir.log(`[RS-READDIR] pruning orphaned mtime sidecar: ${full}`);
              void this.unlink(full).catch(() => {
              });
            }
            continue;
          }
          names.push(name);
        }
        loggers.dir.log(`[RS-READDIR] readdir(${path}) backend=${this.backendName}: ${entries2.size} entries, returning ${names.length} visible names`);
        this.logger.logResult("readdir", path, `count=${names.length} [${names.join(", ")}]`);
        this.existenceCache.set(normalizePath2(path), { exists: true, ts: Date.now() });
        return names;
      } catch (error) {
        this.logger.logResult("readdir", path, error, false);
        if (error instanceof DirectoryNotFoundError || error instanceof RemoteStorageError) {
          throw error;
        }
        throw new RemoteStorageError(
          `Failed to read directory ${path}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
    /**
     * Recursively delete `.mtime` sidecar files whose data file no longer
     * exists in remote storage (orphaned sidecars). Returns the number of
     * sidecars removed. Safe to call at any time; each deletion is best-effort.
     *
     * NOTE: `readdir()` and the snapshot builder already prune orphans on the
     * fly during normal operation; this method forces a full walk for an
     * explicit, on-demand cleanup (e.g. from a maintenance task).
     */
    async pruneOrphanedMtimeSidecars(root = "/") {
      let removed = 0;
      const stack = [root];
      while (stack.length) {
        const dir = stack.pop();
        let entries2;
        try {
          entries2 = await this.ensureDirListing(dir);
        } catch {
          continue;
        }
        if (!entries2) continue;
        const entryNames = new Set(entries2.keys());
        for (const [name, entry] of entries2) {
          if (entry.isDir) {
            stack.push(joinPath(dir, name));
            continue;
          }
          if (isMetadataSidecarToDelete(name)) {
            const full = joinPath(dir, name);
            try {
              await this.unlink(full);
              removed++;
            } catch {
            }
            continue;
          }
          if (!isMtimeSidecar(name)) continue;
          const dataName = sidecarToDataPath(name);
          const orphaned = name.endsWith(".mtime.mtime") || !dataName || !entryNames.has(dataName);
          if (orphaned) {
            const full = joinPath(dir, name);
            try {
              await this.unlink(full);
              removed++;
            } catch {
            }
          }
        }
      }
      return removed;
    }
    /**
     * Parse HTML directory listing (fallback)
     */
    parseHtmlDirectoryListing(html) {
      const items = [];
      const linkRegex = /<a[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/gi;
      let match;
      while ((match = linkRegex.exec(html)) !== null) {
        const href = match[1];
        const name = match[2];
        if (href !== "../" && href !== "./" && name !== ".." && name !== ".") {
          const cleanName = href.endsWith("/") ? href.slice(0, -1) : href;
          if (cleanName) {
            items.push(cleanName);
          }
        }
      }
      return items;
    }
    /**
     * Create directory
     */
    async mkdir(path, options) {
      this.logger.log("mkdir", path);
      path = this.validateAndNormalizePath(path, true);
      try {
        try {
          const keepFilePath = joinPath(path, ".keep");
          await this.writeFile(keepFilePath, "");
        } catch (e) {
        }
        const result = {
          ino: 0,
          mode: options?.mode || 16877,
          uid: options?.uid || 0,
          gid: options?.gid || 0,
          size: 0,
          mtimeMs: Date.now(),
          ctimeMs: Date.now(),
          atimeMs: Date.now(),
          birthtimeMs: Date.now(),
          nlink: 1
        };
        this.logger.logResult("mkdir", path, `mode=${result.mode.toString(8)}`);
        this.invalidateExistenceCache(path);
        const parentPath = getParentPath(path);
        const parentDir = parentPath ? `/${parentPath}/` : "/";
        await this.patchDirListingEntry(parentDir, getBasename(path), {
          name: getBasename(path),
          isDir: true,
          etag: void 0
        });
        return result;
      } catch (error) {
        this.logger.logResult("mkdir", path, error, false);
        if (error instanceof FileExistsError || error instanceof RemoteStorageError) {
          throw error;
        }
        throw new RemoteStorageError(
          `Failed to create directory ${path}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
    /**
     * Remove directory
     */
    async rmdir(path) {
      this.logger.log("rmdir", path);
      path = this.validateAndNormalizePath(path, true);
      try {
        const stats = await this.stat(path);
        if (!this.isDirectoryMode(stats.mode)) {
          this.logger.logResult("rmdir", path, "Not a directory", false);
          throw new RemoteStorageError(`Not a directory: ${path}`);
        }
        const entries2 = await this.readdir(path);
        if (entries2.length > 0) {
          this.logger.logResult("rmdir", path, `Directory not empty: [${entries2.join(", ")}]`, false);
          throw new RemoteStorageError(`Directory not empty: ${path}`);
        }
        try {
          await this.unlink(joinPath(path, ".keep"));
        } catch {
        }
        this.logger.logResult("rmdir", path, "OK");
        this.removeFromExistenceCache(path);
        const parentPath = getParentPath(path);
        const parentDir = parentPath ? `/${parentPath}/` : "/";
        await this.patchDirListingEntry(parentDir, getBasename(path), null);
        this.dirListingCache.delete(normalizePath2(path));
        await this.flushSaveNow();
      } catch (error) {
        this.logger.logResult("rmdir", path, error, false);
        if (error instanceof FileNotFoundError || error instanceof DirectoryNotFoundError || error instanceof RemoteStorageError) {
          throw error;
        }
        throw new RemoteStorageError(
          `Failed to remove directory ${path}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
    /**
     * Remove directory recursively (helper method)
     */
    async rmdirRecursive(path) {
      const entries2 = await this.readdir(path);
      for (const entry of entries2) {
        const entryPath = joinPath(path, entry);
        const stats = await this.stat(entryPath);
        if (this.isDirectoryMode(stats.mode)) {
          await this.rmdirRecursive(entryPath);
          await this.rmdir(entryPath);
        } else {
          await this.unlink(entryPath);
        }
      }
      await this.rmdir(path);
    }
    /**
     * Rename/move file or directory
     */
    async rename(oldPath, newPath) {
      this.logger.log("rename", oldPath, { to: newPath });
      if (!isValidPath(oldPath) || !isValidPath(newPath)) {
        this.logger.logResult("rename", oldPath, "Invalid path format", false);
        throw new RemoteStorageError("Invalid path format");
      }
      try {
        const stats = await this.stat(oldPath);
        const destExists = await this.exists(newPath);
        if (destExists) {
          this.logger.logResult("rename", oldPath, `FileExistsError: ${newPath}`, false);
          throw new FileExistsError(newPath);
        }
        if (this.isFileMode(stats.mode)) {
          const content = await this.readFile(oldPath);
          await this.writeFile(newPath, content);
          await this.unlink(oldPath);
        } else {
          await this.copyDirectoryRecursive(oldPath, newPath);
          await this.rmdirRecursive(oldPath);
        }
        this.logger.logResult("rename", oldPath, `\u2192 ${newPath}`);
      } catch (error) {
        this.logger.logResult("rename", oldPath, error, false);
        if (error instanceof FileNotFoundError || error instanceof FileExistsError || error instanceof RemoteStorageError) {
          throw error;
        }
        throw new RemoteStorageError(
          `Failed to rename ${oldPath} to ${newPath}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
    /**
     * Helper method to ensure directory exists
     */
    async ensureDirectoryExists(path) {
      const exists3 = await this.exists(path);
      if (!exists3) {
        await this.mkdir(path, {
          recursive: true,
          uid: 0,
          gid: 0,
          mode: 16877
        });
      }
    }
    /**
     * Helper method to copy directory recursively
     */
    async copyDirectoryRecursive(srcPath, destPath) {
      await this.mkdir(destPath, {
        recursive: true,
        uid: 0,
        gid: 0,
        mode: 16877
      });
      const entries2 = await this.readdir(srcPath);
      for (const entry of entries2) {
        const srcEntryPath = joinPath(srcPath, entry);
        const destEntryPath = joinPath(destPath, entry);
        const stats = await this.stat(srcEntryPath);
        if (this.isDirectoryMode(stats.mode)) {
          await this.copyDirectoryRecursive(srcEntryPath, destEntryPath);
        } else {
          const content = await this.readFile(srcEntryPath);
          await this.writeFile(destEntryPath, content);
        }
      }
    }
    /**
     * Get filesystem metadata
     */
    metadata() {
      return {
        name: "RemoteStorageFileSystem",
        readonly: false,
        totalSpace: 0,
        freeSpace: 0
      };
    }
    /**
     * Sync filesystem (no-op for RemoteStorage as it's always synced)
     */
    async sync() {
      this.logger.log("sync", "(root)");
    }
    /**
     * Disconnect and cleanup
     */
    async disconnect() {
      this.logger.log("disconnect", "(root)");
    }
    // zen-fs required sync methods (throwing not implemented errors)
    statSync() {
      throw new Error("Synchronous operations not supported by RemoteStorage");
    }
    readdirSync() {
      throw new Error("Synchronous operations not supported by RemoteStorage");
    }
    readFileSync() {
      throw new Error("Synchronous operations not supported by RemoteStorage");
    }
    writeFileSync() {
      throw new Error("Synchronous operations not supported by RemoteStorage");
    }
    unlinkSync() {
      throw new Error("Synchronous operations not supported by RemoteStorage");
    }
    rmdirSync() {
      throw new Error("Synchronous operations not supported by RemoteStorage");
    }
    mkdirSync() {
      throw new Error("Synchronous operations not supported by RemoteStorage");
    }
    renameSync() {
      throw new Error("Synchronous operations not supported by RemoteStorage");
    }
    createFileSync() {
      throw new Error("createFileSync operation not supported by RemoteStorage");
    }
    linkSync() {
      throw new Error("linkSync operation not supported by RemoteStorage");
    }
    symlink() {
      return Promise.reject(new Error("symlink operation not supported by RemoteStorage"));
    }
    symlinkSync() {
      throw new Error("symlinkSync operation not supported by RemoteStorage");
    }
    readlink() {
      return Promise.reject(new Error("readlink operation not supported by RemoteStorage"));
    }
    readlinkSync() {
      throw new Error("readlinkSync operation not supported by RemoteStorage");
    }
    lstat() {
      return Promise.reject(new Error("lstat operation not supported by RemoteStorage"));
    }
    lstatSync() {
      throw new Error("lstatSync operation not supported by RemoteStorage");
    }
    /**
     * Modify metadata (touch).
     *
     * With precise mtime enabled, writing `mtimeMs` via the `.mtime` sidecar
     * is supported. Other metadata fields are ignored (RemoteStorage protocol
     * does not support them). If precise mtime is disabled, this is a no-op.
     */
    async touch(path, metadata) {
      this.logger.log("touch", path, metadata);
      if (this.usePreciseMtime && metadata.mtimeMs !== void 0) {
        path = this.validateAndNormalizePath(path);
        await this.writeMtimeSidecar(path, metadata.mtimeMs);
        this.logger.logResult("touch", path, `mtimeMs=${metadata.mtimeMs}`);
        return;
      }
      this.logger.logResult("touch", path, "no-op (preciseMtime disabled or no mtimeMs)");
    }
    /**
     * Create the file at path with the given options
     */
    async createFile(path, options) {
      this.logger.log("createFile", path);
      await this.writeFile(path, new Uint8Array(0));
      const result = {
        ino: 0,
        mode: options.mode || 33188,
        uid: options.uid || 0,
        gid: options.gid || 0,
        size: 0,
        mtimeMs: Date.now(),
        ctimeMs: Date.now(),
        atimeMs: Date.now(),
        birthtimeMs: Date.now(),
        nlink: 1
      };
      this.logger.logResult("createFile", path, `mode=${result.mode.toString(8)}`);
      this.invalidateExistenceCache(path);
      return result;
    }
    /**
     * Get file/directory stat information
     */
    async stat(path) {
      this.logger.log("stat", path);
      if (!isValidPath(path)) {
        this.logger.logResult("stat", path, "Invalid path format", false);
        throw new RemoteStorageError("Invalid path format");
      }
      await this.ensureCacheLoaded();
      const callerSaysDir = path.endsWith("/");
      const baseName = getBasename(path);
      loggers.stat.log(`[RS-STAT] stat ENTER(${path}) backend=${this.backendName} baseName=${baseName} callerSaysDir=${callerSaysDir}`);
      loggers.stat.log(`[RS-STAT]   cache state: ${this.dumpCacheState(path)}`);
      let existsViaDir = false;
      let isDirViaDir = false;
      let dirListingAvailable = false;
      let cachedEntry;
      if (baseName) {
        const parentPath = getParentPath(path);
        const parentDir = parentPath ? `/${parentPath}/` : "/";
        let entries2 = null;
        try {
          entries2 = await this.ensureDirListing(parentDir);
          const listingAge = this.getDirListingAge(parentDir);
          loggers.stat.log(`[RS-STAT] stat(${path}): ensureDirListing(${parentDir}) \u2192 ${entries2 ? `${entries2.size} entries, age=${listingAge}ms` : "null (dir not found)"}`);
        } catch (err2) {
          loggers.stat.log(`[RS-STAT] stat(${path}): ensureDirListing(${parentDir}) FAILED: ${err2}`);
          entries2 = null;
        }
        if (entries2) {
          dirListingAvailable = true;
          cachedEntry = entries2.get(baseName);
          if (cachedEntry) {
            existsViaDir = true;
            isDirViaDir = cachedEntry.isDir;
            loggers.stat.log(`[RS-STAT] stat(${path}): FOUND in dir listing (isDir=${isDirViaDir}, size=${cachedEntry.size ?? "undefined"})`);
          } else {
            loggers.stat.log(`[RS-STAT] stat(${path}): NOT in dir listing (entries: ${[...entries2.keys()].join(", ")})`);
          }
        }
      }
      if (dirListingAvailable && !existsViaDir && !callerSaysDir) {
        const parentPath = getParentPath(path);
        const parentDir = parentPath ? `/${parentPath}/` : "/";
        const listingAge = this.getDirListingAge(parentDir);
        if (listingAge !== null && listingAge < _RemoteStorageFileSystem.DIR_LISTING_TTL) {
          loggers.stat.log(`[RS-STAT] stat(${path}): \u2192 FileNotFoundError (not in dir listing, age=${listingAge}ms < ${_RemoteStorageFileSystem.DIR_LISTING_TTL}ms)`);
          this.logger.logResult("stat", path, "FileNotFoundError (not in dir listing)", false);
          throw new FileNotFoundError(path);
        }
        loggers.stat.log(`[RS-STAT] stat(${path}): not in STALE dir listing (age=${listingAge}ms >= ${_RemoteStorageFileSystem.POSITIVE_CACHE_TTL}ms), falling through to file GET probe`);
      }
      if (dirListingAvailable && !existsViaDir && !callerSaysDir) {
        const listingAge = this.getDirListingAge(
          getParentPath(path) ? `/${getParentPath(path)}/` : "/"
        );
        const stale = listingAge === null || listingAge >= _RemoteStorageFileSystem.DIR_LISTING_TTL;
        if (stale) {
          loggers.stat.log(`[RS-STAT] stat(${path}): stale listing \u2014 probing file via GET ${this.buildUrl(path)}`);
          try {
            const fileResp = await this.makeRequest(this.buildUrl(path), { method: "GET" });
            if (fileResp.ok) {
              const contentType = fileResp.headers.get("content-type") || "";
              if (!contentType.includes("application/ld+json") && !contentType.includes("text/html")) {
                const contentLength = fileResp.headers.get("content-length");
                const lastModified = fileResp.headers.get("last-modified");
                const size = contentLength ? parseInt(contentLength, 10) : 0;
                let mtime = lastModified ? new Date(lastModified).getTime() : Date.now();
                if (this.usePreciseMtime) {
                  const preciseMtime = await this.readMtimeSidecar(path);
                  if (preciseMtime !== void 0) mtime = preciseMtime;
                }
                loggers.stat.log(`[RS-STAT] stat(${path}): returning via file GET (size=${size}), setting existenceCache=true`);
                this.existenceCache.set(normalizePath2(path), { exists: true, ts: Date.now() });
                return {
                  ino: 0,
                  mode: 33188,
                  uid: 0,
                  gid: 0,
                  size,
                  mtimeMs: mtime,
                  ctimeMs: mtime,
                  atimeMs: mtime,
                  birthtimeMs: mtime,
                  nlink: 1
                };
              }
            } else if (fileResp.status === 401 || fileResp.status === 403) {
              this.handleHttpError(fileResp, path, "stat");
            } else if (fileResp.status === 404) {
              loggers.stat.log(`[RS-STAT] stat(${path}): file GET 404 \u2014 confirmed not found, setting existenceCache=false`);
              this.existenceCache.set(normalizePath2(path), { exists: false, ts: Date.now() });
              throw new FileNotFoundError(path);
            }
          } catch (error) {
            if (error instanceof AuthenticationError || error instanceof PermissionDeniedError) throw error;
            if (error instanceof FileNotFoundError) throw error;
          }
        }
      }
      if (existsViaDir && isDirViaDir) {
        this.logger.logResult("stat", path, `DIR mode=40755 (via dir listing)`);
        loggers.stat.log(`[RS-STAT] stat(${path}): returning via dir listing (isDir), setting existenceCache=true`);
        this.existenceCache.set(normalizePath2(path), { exists: true, ts: Date.now() });
        return {
          ino: 0,
          mode: 16877,
          uid: 0,
          gid: 0,
          size: 0,
          mtimeMs: Date.now(),
          ctimeMs: Date.now(),
          atimeMs: Date.now(),
          birthtimeMs: Date.now(),
          nlink: 1
        };
      }
      if (existsViaDir && !isDirViaDir) {
        const size = cachedEntry?.size ?? 0;
        let mtime = cachedEntry?.lastModified ? new Date(cachedEntry.lastModified).getTime() : Date.now();
        if (this.usePreciseMtime) {
          const preciseMtime = await this.readMtimeSidecar(path);
          if (preciseMtime !== void 0) {
            mtime = preciseMtime;
          }
        }
        this.logger.logResult("stat", path, `FILE mode=100644 (via dir listing, size=${size})`);
        loggers.stat.log(`[RS-STAT] stat(${path}): returning via dir listing (file, size=${size}), setting existenceCache=true`);
        this.existenceCache.set(normalizePath2(path), { exists: true, ts: Date.now() });
        return {
          ino: 0,
          mode: 33188,
          uid: 0,
          gid: 0,
          size,
          mtimeMs: mtime,
          ctimeMs: mtime,
          atimeMs: mtime,
          birthtimeMs: mtime,
          nlink: 1
        };
      }
      const dirPath = path.endsWith("/") ? path : path + "/";
      const dirUrl = this.buildUrl(dirPath);
      loggers.stat.log(`[RS-STAT] stat(${path}): trying dir probe GET ${dirUrl}`);
      try {
        const response = await this.makeRequest(dirUrl, {
          method: "GET",
          headers: { "Accept": "application/ld+json" }
        });
        loggers.stat.log(`[RS-STAT] stat(${path}): dir probe response status=${response.status}`);
        if (response.ok) {
          const contentType = response.headers.get("content-type") || "";
          if (contentType.includes("application/ld+json") || contentType.includes("text/html")) {
            this.logger.logResult("stat", path, `DIR mode=40755 (via dir probe)`);
            loggers.stat.log(`[RS-STAT] stat(${path}): returning via dir probe, setting existenceCache=true`);
            this.existenceCache.set(normalizePath2(path), { exists: true, ts: Date.now() });
            return {
              ino: 0,
              mode: 16877,
              uid: 0,
              gid: 0,
              size: 0,
              mtimeMs: Date.now(),
              ctimeMs: Date.now(),
              atimeMs: Date.now(),
              birthtimeMs: Date.now(),
              nlink: 1
            };
          }
        }
        if (response.status === 401 || response.status === 403) {
          this.handleHttpError(response, path, "stat");
        }
      } catch (error) {
        if (error instanceof AuthenticationError || error instanceof PermissionDeniedError) {
          throw error;
        }
      }
      this.logger.logResult("stat", path, "FileNotFoundError", false);
      loggers.stat.log(`[RS-STAT] stat(${path}): \u2192 FileNotFoundError (all paths exhausted)`);
      throw new FileNotFoundError(path);
    }
    /**
     * Freshness-aware file read used by `zen-fs-cache`.
     *
     * Performs a conditional `GET` when validators are supplied, returning
     * `304` (no body) when the content is unchanged so the cache can serve the
     * previously stored bytes. The response's `ETag` / `Last-Modified` are
     * surfaced so the cache can re-validate on the next read.
     */
    async readFileMeta(path, opts) {
      this.logger.log("readFileMeta", path, opts);
      path = this.validateAndNormalizePath(path);
      const url = this.buildUrl(path);
      const headers = {};
      if (opts?.ifNoneMatch) headers["If-None-Match"] = opts.ifNoneMatch;
      else if (opts?.ifModifiedSince) headers["If-Modified-Since"] = opts.ifModifiedSince;
      try {
        const response = await this.makeRequest(url, { method: "GET", headers });
        if (response.status === 304) {
          this.logger.logResult("readFileMeta", path, "304 Not Modified");
          return {
            status: 304,
            etag: response.headers.get("ETag") ?? opts?.ifNoneMatch,
            lastModified: response.headers.get("Last-Modified") ?? opts?.ifModifiedSince
          };
        }
        if (!response.ok) {
          this.handleHttpError(response, path, "readFileMeta");
        }
        const data = new Uint8Array(await response.arrayBuffer());
        this.logger.logResult("readFileMeta", path, `200 size=${data.byteLength}`);
        let preciseMtime;
        if (this.usePreciseMtime) {
          preciseMtime = await this.readMtimeSidecar(path);
        }
        return {
          status: 200,
          data,
          etag: response.headers.get("ETag") ?? void 0,
          lastModified: response.headers.get("Last-Modified") ?? void 0,
          preciseMtime,
          contentType: response.headers.get("Content-Type") ?? void 0
        };
      } catch (error) {
        this.logger.logResult("readFileMeta", path, error, false);
        if (error instanceof FileNotFoundError || error instanceof RemoteStorageError) {
          throw error;
        }
        throw new RemoteStorageError(
          `Failed to read file meta ${path}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
    /**
     * Return a revision token for any path (file or directory). Used by
     * `zen-fs-cache` for cheap revalidation of `readdir` / `stat` and as a
     * fallback for `readFile`. Prefers the `ETag`, falling back to
     * `Last-Modified` (HTTP-date string).
     *
     * RemoteStorage servers require a trailing '/' for directory URLs; a GET
     * on a directory path without the slash returns 404.  To avoid this we:
     *   1. Check the cached parent-dir listing — if it says the path is a
     *      directory, append '/' before building the URL.
     *   2. If no listing is cached, try the URL as-is first; on 404 retry
     *      with a trailing '/' (covers the case where the caller passes a
     *      directory path without a slash).
     */
    /**
     * Get the cached ETag of a directory itself (distinct from the ETags of its
     * children). Returns `null` if the directory isn't cached or has no ETag.
     */
    getCachedDirEtag(dirPath) {
      const key = normalizePath2(dirPath);
      const cached = this.dirListingCache.get(key);
      return cached ? cached.etag ?? null : null;
    }
    async getRevision(path) {
      this.logger.log("getRevision", path);
      path = this.validateAndNormalizePath(path);
      let isDir = path === "/" || path.endsWith("/");
      if (isDir) {
        const selfDir = path.endsWith("/") ? path : `${path}/`;
        try {
          const entries2 = await this.ensureDirListing(selfDir);
          if (entries2 === null) {
            this.logger.logResult("getRevision", path, "directory not found (null listing)");
            return void 0;
          }
          const rev = this.getCachedDirEtag(selfDir) ?? void 0;
          this.logger.logResult("getRevision", path, rev ?? "no-dir-etag", rev !== void 0);
          return rev;
        } catch (err2) {
          this.logger.logResult("getRevision", path, err2, false);
          return void 0;
        }
      }
      const baseName = getBasename(path);
      const parentPath = getParentPath(path);
      const parentDir = parentPath ? `/${parentPath}/` : "/";
      try {
        const entries2 = await this.ensureDirListing(parentDir);
        this.logger.log("getRevision", path, {
          dirCheck: "ensureDirListing",
          parentDir,
          hasCache: entries2 !== null,
          cacheKeys: entries2 ? [...entries2.keys()] : null
        });
        if (entries2) {
          const entry = entries2.get(baseName);
          this.logger.log("getRevision", path, {
            dirCheck: "parent-listing-hit",
            baseName,
            found: !!entry,
            isDir: entry?.isDir,
            etag: entry?.etag
          });
          if (!entry) {
            this.logger.logResult("getRevision", path, "not in parent listing");
            return void 0;
          }
          if (entry.isDir) {
            isDir = true;
            const rev = this.getCachedDirEtag(`${parentDir}${baseName}/`) ?? void 0;
            this.logger.logResult("getRevision", path, rev ?? "no-dir-etag", rev !== void 0);
            return rev;
          }
          if (entry.etag) {
            this.logger.logResult("getRevision", path, `etag=${entry.etag} (from dir listing)`);
            return entry.etag;
          }
        } else {
          this.logger.log("getRevision", path, { dirCheck: "parent-dir-not-found" });
        }
      } catch (err2) {
        this.logger.log("getRevision", path, { dirCheck: "ensureDirListing-error", error: String(err2) });
      }
      const url = this.buildUrl(path);
      this.logger.log("getRevision", path, { fallback: "GET", url });
      try {
        const response = await this.makeRequest(url, { method: "GET" });
        this.logger.log("getRevision", path, { getStatus: response.status });
        if (!response.ok) {
          this.logger.logResult("getRevision", path, `status=${response.status}`);
          return void 0;
        }
        const rev = response.headers.get("ETag") ?? response.headers.get("Last-Modified") ?? void 0;
        this.logger.logResult("getRevision", path, rev);
        return rev;
      } catch (err2) {
        this.logger.logResult("getRevision", path, err2, false);
        return void 0;
      }
    }
    /**
     * Hard link operation (not supported)
     */
    async link(target, link3) {
      this.logger.log("link", target, { link: link3 });
      throw new Error("Link operation not supported by RemoteStorage");
    }
    /**
     * Read into a buffer
     */
    async read(path, buffer, start, end) {
      this.logger.log("read", path, { start, end, bufLen: buffer.length });
      const data = await this.readFile(path);
      const slice = data.slice(start, end);
      buffer.set(slice, 0);
      this.logger.logResult("read", path, `copied=${slice.length}`);
    }
    /**
     * Write a buffer to a file
     */
    async write(path, buffer, offset) {
      this.logger.log("write", path, { offset, len: buffer.length });
      let existingData;
      try {
        existingData = await this.readFile(path);
      } catch (error) {
        if (error instanceof FileNotFoundError) {
          existingData = new Uint8Array(0);
        } else {
          throw error;
        }
      }
      const newSize = Math.max(existingData.length, offset + buffer.length);
      const newData = new Uint8Array(newSize);
      newData.set(existingData);
      newData.set(buffer, offset);
      await this.writeFile(path, newData);
      this.logger.logResult("write", path, `newSize=${newSize}`);
    }
    /**
     * Check if mode indicates a directory
     */
    isDirectoryMode(mode) {
      return (mode & 16384) === 16384;
    }
    /**
     * Check if mode indicates a regular file
     */
    isFileMode(mode) {
      return (mode & 32768) === 32768;
    }
    // Additional required sync methods
    touchSync() {
      throw new Error("Synchronous operations not supported by RemoteStorage");
    }
    syncSync() {
      throw new Error("Synchronous operations not supported by RemoteStorage");
    }
    readSync() {
      throw new Error("Synchronous operations not supported by RemoteStorage");
    }
    writeSync() {
      throw new Error("Synchronous operations not supported by RemoteStorage");
    }
    /**
     * Invalidate existence cache for a path and all its ancestors.
     * Called after writes, creates, and deletes.
     */
    invalidateExistenceCache(path) {
      const normalized = normalizePath2(path);
      this.existenceCache.delete(normalized);
      this.existenceCache.delete(ensureDirectoryPath(getParentPath(normalized)));
      this.existenceCache.set(normalized, { exists: true, ts: Date.now() });
    }
    /**
     * Remove a path from the existence cache (after deletion).
     */
    removeFromExistenceCache(path) {
      const normalized = normalizePath2(path);
      this.existenceCache.delete(normalized);
      this.existenceCache.delete(ensureDirectoryPath(getParentPath(normalized)));
    }
    // -------------------------------------------------------------------------
    // Directory listing cache management
    // -------------------------------------------------------------------------
    /**
     * Debug helper: dump all cache state relevant to a given path.
     * Returns a compact string for logging.
     */
    dumpCacheState(path) {
      const normalized = normalizePath2(path);
      const parentPath = getParentPath(path);
      const parentDir = parentPath ? `/${parentPath}/` : "/";
      const parentKey = normalizePath2(parentDir);
      const exEntry = this.existenceCache.get(normalized);
      const exStr = exEntry ? `{exists=${exEntry.exists}, age=${Date.now() - exEntry.ts}ms}` : "MISS";
      const dirEntry = this.dirListingCache.get(parentKey);
      let dirStr;
      if (dirEntry) {
        const entryNames = [...dirEntry.entries.keys()];
        const baseName = getBasename(path);
        const hasFile = dirEntry.entries.has(baseName);
        dirStr = `{age=${Date.now() - dirEntry.ts}ms, ${entryNames.length} entries=[${entryNames.join(",")}], hasFile=${hasFile}}`;
      } else {
        dirStr = "MISS";
      }
      const exParent = this.existenceCache.get(parentKey);
      const exParentStr = exParent ? `{exists=${exParent.exists}, age=${Date.now() - exParent.ts}ms}` : "MISS";
      return `existenceCache[${normalized}]=${exStr} | dirListingCache[${parentKey}]=${dirStr} | existenceCache[${parentKey}]=${exParentStr}`;
    }
    /**
     * Get the cached directory listing for a directory path, or null if
     * not cached / expired. Does NOT make any network requests.
     *
     * ETag-based invalidation: a cached entry is considered stale only when its
     * directory ETag differs from `currentDirEtag` (when provided) — not on every
     * write. A long TTL acts as a fallback for servers that don't return ETags.
     */
    getCachedDirListing(dirPath) {
      const key = normalizePath2(dirPath);
      const cached = this.dirListingCache.get(key);
      if (!cached) {
        loggers.dir.log(`[RS-TTL] getCachedDirListing(${dirPath}) key=${key}: CACHE MISS (no entry)`);
        return null;
      }
      const age = Date.now() - cached.ts;
      const ttl = _RemoteStorageFileSystem.DIR_LISTING_TTL;
      if (age >= ttl) {
        loggers.dir.log(`[RS-TTL] getCachedDirListing(${dirPath}) key=${key}: EXPIRED (age=${age}ms >= TTL=${ttl}ms, ts=${cached.ts}, now=${Date.now()}) \u2192 deleting cache entry, will trigger network fetch`);
        this.dirListingCache.delete(key);
        return null;
      }
      loggers.dir.log(`[RS-TTL] getCachedDirListing(${dirPath}) key=${key}: FRESH (age=${age}ms < TTL=${ttl}ms, ts=${cached.ts}, now=${Date.now()}) \u2192 returning ${cached.entries.size} entries`);
      return cached.entries;
    }
    /**
     * Get the age (in ms) of a cached directory listing, or `null` if the
     * directory is not cached / expired. Used by `stat()` to decide whether
     * a "file not in listing" result is trustworthy or needs a file GET probe.
     */
    getDirListingAge(dirPath) {
      const key = normalizePath2(dirPath);
      const cached = this.dirListingCache.get(key);
      if (!cached) return null;
      if (Date.now() - cached.ts >= _RemoteStorageFileSystem.DIR_LISTING_TTL) {
        return null;
      }
      return Date.now() - cached.ts;
    }
    /**
     * Cache a directory listing result (with per-entry metadata) and the
     * directory's own ETag. Replaces any previous listing for this directory.
     */
    cacheDirListing(dirPath, entries2, dirEtag) {
      const key = normalizePath2(dirPath);
      const map = /* @__PURE__ */ new Map();
      for (const e of entries2) {
        map.set(e.name, e);
      }
      this.dirListingCache.set(key, { etag: dirEtag, ts: Date.now(), entries: map });
      this.scheduleSave();
    }
    /**
     * Ensure a directory listing is in the cache, fetching from the network if
     * necessary. This is the single shared entry point used by readdir(),
     * stat(), and getRevision() to obtain directory entries.
     *
     * @param dirPath Directory path (with or without trailing slash)
     * @returns The cached entries map, or `null` if the directory doesn't exist (404)
     */
    async ensureDirListing(dirPath) {
      await this.ensureCacheLoaded();
      const normalized = normalizePath2(dirPath);
      if (!normalized && !this.config.basePath && this.syncRootPath !== "/") {
        loggers.dir.log(`[RS-DIR] ensureDirListing('${dirPath}') \u2192 redirect to syncRootPath '${this.syncRootPath}'`);
        return this.ensureDirListing(this.syncRootPath);
      }
      const cached = this.getCachedDirListing(dirPath);
      if (cached) {
        loggers.dir.log(`[RS-DIR] ensureDirListing(${dirPath}) backend=${this.backendName}: cache HIT (${cached.size} entries)`);
        return cached;
      }
      const parentPath = getParentPath(normalized);
      if (parentPath) {
        const parentDir = `/${parentPath}/`;
        const parentListing = await this.ensureDirListing(parentDir);
        if (parentListing) {
          const baseName = getBasename(normalized);
          const entry = parentListing.get(baseName);
          if (entry && !entry.isDir) {
            loggers.dir.log(`[RS-DIR] ensureDirListing(${dirPath}) backend=${this.backendName}: parent listing says "${baseName}" is a file (isDir=false), skipping fetch`);
            return null;
          }
          if (!entry) {
            loggers.dir.log(`[RS-DIR] ensureDirListing(${dirPath}) backend=${this.backendName}: "${baseName}" not in parent listing, skipping fetch`);
            return null;
          }
          loggers.dir.log(`[RS-DIR] ensureDirListing(${dirPath}) backend=${this.backendName}: parent listing confirms "${baseName}" is a directory, proceeding to fetch`);
        }
        if (parentListing === null) {
          loggers.dir.log(`[RS-DIR] ensureDirListing(${dirPath}) backend=${this.backendName}: parent directory "${parentDir}" does not exist, skipping fetch`);
          return null;
        }
      }
      const dirUrl = this.buildUrl(ensureDirectoryPath(normalized));
      const previousEtag = this.getCachedDirEtag(normalized);
      loggers.dir.log(`[RS-DIR] ensureDirListing(${dirPath}) backend=${this.backendName}: CACHE MISS (expired or not cached), fetching ${dirUrl} \u2014 previousEtag=${previousEtag ?? "null"}`);
      loggers.sync.log(`[RS-SYNC] ensureDirListing NETWORK REQUEST: ${dirUrl} (dirPath=${dirPath}, previousEtag=${previousEtag ?? "null"})`);
      const response = await this.makeRequest(dirUrl, {
        method: "GET",
        headers: { "Accept": "application/ld+json" }
      });
      loggers.dir.log(`[RS-DIR] ensureDirListing(${dirPath}) backend=${this.backendName}: network response status=${response.status} etag=${response.headers.get("ETag") ?? "null"}`);
      if (!response.ok) {
        if (response.status === 404) {
          loggers.dir.log(`[RS-DIR] ensureDirListing(${dirPath}) backend=${this.backendName}: 404 \u2014 directory not found`);
          return null;
        }
        this.handleHttpError(response, normalized, "ensureDirListing");
      }
      const contentType = response.headers.get("content-type") || "";
      let entries2;
      if (contentType.includes("application/ld+json")) {
        const listing = await response.json();
        entries2 = [];
        if (listing["@graph"]) {
          for (const item of listing["@graph"]) {
            if (item["@id"] && item["@id"] !== "./") {
              const rawName = item["@id"];
              const isDir = rawName.endsWith("/");
              const name = rawName.replace(/\/$/, "");
              if (name) {
                entries2.push({
                  name,
                  isDir,
                  etag: item["ETag"] ?? item["etag"],
                  size: item["Content-Length"] != null ? Number(item["Content-Length"]) : void 0,
                  lastModified: item["Last-Modified"] ?? item["last-modified"]
                });
              }
            }
          }
        } else if (listing["items"] && typeof listing["items"] === "object") {
          for (const entryKey of Object.keys(listing["items"])) {
            if (entryKey && entryKey !== "./") {
              const isDir = entryKey.endsWith("/");
              const name = entryKey.replace(/\/$/, "");
              const item = listing["items"][entryKey];
              entries2.push({
                name,
                isDir,
                etag: item?.ETag ?? item?.etag,
                size: item?.["Content-Length"] != null ? Number(item["Content-Length"]) : void 0,
                lastModified: item?.["Last-Modified"] ?? item?.["last-modified"]
              });
            }
          }
        }
      } else {
        const html = await response.text();
        const names = this.parseHtmlDirectoryListing(html);
        entries2 = names.map((name) => ({ name, isDir: name.endsWith("/"), etag: void 0 }));
      }
      this.cacheDirListing(normalized, entries2, response.headers.get("ETag"));
      const result = this.getCachedDirListing(normalized);
      loggers.dir.log(`[RS-DIR] ensureDirListing(${dirPath}) backend=${this.backendName}: fetched and cached ${entries2.length} entries (etag=${response.headers.get("ETag") ?? "null"})`);
      return result;
    }
    /**
     * Precisely patch a single child entry inside a parent directory's cached
     * listing — used after a local write/delete so siblings stay valid. This is
     * the ETag-based fine-grained invalidation (no whole-directory drop).
     */
    async patchDirListingEntry(parentDir, name, entry) {
      await this.ensureCacheLoaded();
      const key = normalizePath2(parentDir);
      const cached = this.dirListingCache.get(key);
      if (!cached) {
        loggers.dir.log(`[RS-PATCH] patchDirListingEntry(${parentDir}, ${name}, ${entry ? "add" : "delete"}) backend=${this.backendName}: dir NOT in cache, nothing to patch`);
        return;
      }
      if (entry === null) {
        const had = cached.entries.has(name);
        cached.entries.delete(name);
        loggers.dir.log(`[RS-PATCH] patchDirListingEntry(${parentDir}, ${name}, DELETE) backend=${this.backendName}: hadEntry=${had}, remaining entries=[${[...cached.entries.keys()].join(",")}], scheduling save`);
      } else {
        cached.entries.set(name, entry);
        loggers.dir.log(`[RS-PATCH] patchDirListingEntry(${parentDir}, ${name}, ADD) backend=${this.backendName}: entries now=[${[...cached.entries.keys()].join(",")}], scheduling save`);
      }
      cached.ts = Date.now();
      this.scheduleSave();
    }
    /**
     * Ensure the persisted cache has been loaded from storage at least once.
     * Memoized — the actual load runs a single time per instance.
     */
    ensureCacheLoaded() {
      if (!this.persistCache || !this.storage) return Promise.resolve();
      if (!this.loadPromise) {
        this.loadPromise = (async () => {
          try {
            const blob = await this.storage.load();
            const data = blob[this.cacheNamespace];
            if (data && typeof data === "object") {
              const parsed = data;
              loggers.cache.log(`[RS-CACHE-LOAD] backend=${this.backendName} loading persisted dirListingCache from storage...`);
              const now = Date.now();
              for (const [k, v] of Object.entries(parsed)) {
                const m = /* @__PURE__ */ new Map();
                for (const [name, e] of Object.entries(v.entries)) {
                  m.set(name, e);
                }
                this.dirListingCache.set(k, { etag: v.etag, ts: v.ts, entries: m });
                const age = now - v.ts;
                loggers.cache.log(`[RS-CACHE-LOAD]   restored dir[${k}]: ${m.size} entries=[${[...m.keys()].join(",")}] originalAge=${age}ms (ts preserved) etag=${v.etag ?? "null"}`);
              }
              this.logger.logResult("cache", "load", `restored ${this.dirListingCache.size} dirs`);
              loggers.cache.log(`[RS-CACHE-LOAD] backend=${this.backendName} total ${this.dirListingCache.size} dirs restored`);
            } else {
              loggers.cache.log(`[RS-CACHE-LOAD] backend=${this.backendName} no persisted cache data found`);
            }
          } catch (err2) {
            this.logger.logResult("cache", "load", err2, false);
            loggers.cache.log(`[RS-CACHE-LOAD] backend=${this.backendName} FAILED to load: ${err2}`);
          }
        })();
      }
      return this.loadPromise;
    }
    /**
     * Debounced persistence of the whole directory cache blob.
     */
    scheduleSave() {
      if (!this.persistCache || !this.storage) return;
      if (this.saveTimer) {
        loggers.cache.log(`[RS-CACHE-SAVE] scheduleSave backend=${this.backendName}: timer already pending (debounce), skipping`);
        return;
      }
      loggers.cache.log(`[RS-CACHE-SAVE] scheduleSave backend=${this.backendName}: scheduling flushSave in 500ms`);
      this.saveTimer = setTimeout(() => {
        this.saveTimer = null;
        void this.flushSave();
      }, 500);
    }
    /**
     * Immediately persist the directory cache, bypassing the debounce timer.
     * Used after deletions so that a page refresh cannot lose the cache update.
     */
    async flushSaveNow() {
      if (!this.persistCache || !this.storage) return;
      if (this.saveTimer) {
        clearTimeout(this.saveTimer);
        this.saveTimer = null;
        loggers.cache.log(`[RS-CACHE-SAVE] flushSaveNow backend=${this.backendName}: cancelled pending debounce timer`);
      }
      await this.flushSave();
    }
    async flushSave() {
      try {
        const blob = await this.storage.load();
        const out = {};
        for (const [k, v] of this.dirListingCache.entries()) {
          const entries2 = {};
          for (const [name, e] of v.entries.entries()) {
            entries2[name] = e;
          }
          out[k] = { etag: v.etag, ts: v.ts, entries: entries2 };
        }
        blob[this.cacheNamespace] = out;
        await this.storage.save(blob);
        const dirSummary = Object.entries(out).map(([k, v]) => `${k}:[${Object.keys(v.entries).join(",")}]`).join(" ");
        loggers.cache.log(`[RS-CACHE-SAVE] flushSave backend=${this.backendName}: persisted ${this.dirListingCache.size} dirs \u2014 ${dirSummary}`);
        this.logger.logResult("cache", "save", `persisted ${this.dirListingCache.size} dirs`);
      } catch (err2) {
        loggers.cache.log(`[RS-CACHE-SAVE] flushSave backend=${this.backendName}: FAILED: ${err2}`);
        this.logger.logResult("cache", "save", err2, false);
      }
    }
    /**
     * Clear the entire existence cache.
     */
    clearExistenceCache() {
      this.existenceCache.clear();
      this.dirListingCache.clear();
      this.scheduleSave();
    }
    // ===========================================================================
    // Precise mtime — .mtime sidecar file management
    // ===========================================================================
    /**
     * Write (or overwrite) the `.mtime` sidecar file for `filePath`.
     *
     * The sidecar stores `{ "mtime": <ms> }` and is invisible to upper layers
     * (filtered from readdir, excluded from sync).
     */
    async writeMtimeSidecar(filePath, mtime) {
      if (isMtimeSidecar(getBasename(filePath))) return;
      const sidecarPath = mtimePathFor(filePath);
      const sidecarUrl = this.buildUrl(sidecarPath);
      const body = JSON.stringify({ mtime });
      try {
        const headers = new Headers(this.headers);
        headers.set("Content-Type", "application/json");
        const response = await this.makeRequest(sidecarUrl, {
          method: "PUT",
          body,
          headers
        });
        if (!response.ok) {
          this.logger.logResult("writeMtimeSidecar", filePath, `status=${response.status}`, false);
        } else {
          const normalized = normalizePath2(filePath);
          this.mtimeCache.set(normalized, mtime);
          this.mtimeStore.set(normalized, mtime).catch(() => {
          });
          this.logger.logResult("writeMtimeSidecar", filePath, `mtime=${mtime}`);
        }
      } catch (error) {
        this.logger.logResult("writeMtimeSidecar", filePath, error, false);
      }
    }
    /**
     * Read the `.mtime` sidecar for `filePath` and return the precise mtime
     * in milliseconds, or `undefined` if the sidecar does not exist / cannot
     * be parsed.
     *
     * Checks in-memory cache first, then IndexedDB (for cross-session
     * persistence), then falls back to a network GET.
     */
    async readMtimeSidecar(filePath) {
      const normalized = normalizePath2(filePath);
      const cached = this.mtimeCache.get(normalized);
      if (cached !== void 0) {
        return cached;
      }
      const idbCached = await this.mtimeStore.get(normalized);
      if (idbCached !== void 0) {
        this.mtimeCache.set(normalized, idbCached);
        return idbCached;
      }
      const sidecarPath = mtimePathFor(filePath);
      const lastSlash = sidecarPath.lastIndexOf("/");
      const sidecarDir = lastSlash >= 0 ? sidecarPath.slice(0, lastSlash) : "";
      const sidecarName = lastSlash >= 0 ? sidecarPath.slice(lastSlash + 1) : sidecarPath;
      if (sidecarDir) {
        const dirEntries = this.getCachedDirListing(sidecarDir);
        if (dirEntries !== null && !dirEntries.has(sidecarName)) {
          return void 0;
        }
      }
      const sidecarUrl = this.buildUrl(sidecarPath);
      try {
        const response = await this.makeRequest(sidecarUrl, { method: "GET" });
        if (!response.ok) {
          return void 0;
        }
        const text = await response.text();
        const parsed = JSON.parse(text);
        if (typeof parsed.mtime === "number") {
          this.mtimeCache.set(normalized, parsed.mtime);
          this.mtimeStore.set(normalized, parsed.mtime).catch(() => {
          });
          return parsed.mtime;
        }
        return void 0;
      } catch {
        return void 0;
      }
    }
    /**
     * Delete the `.mtime` sidecar for `filePath`. Called from `unlink()`.
     * Failure is non-fatal — a stale sidecar just means stat() will return
     * the server's Last-Modified instead.
     */
    async deleteMtimeSidecar(filePath) {
      const sidecarPath = mtimePathFor(filePath);
      const normalized = normalizePath2(filePath);
      const lastSlash = sidecarPath.lastIndexOf("/");
      const sidecarDir = lastSlash >= 0 ? sidecarPath.slice(0, lastSlash) : "";
      const sidecarName = lastSlash >= 0 ? sidecarPath.slice(lastSlash + 1) : sidecarPath;
      if (sidecarDir) {
        const dirEntries = this.getCachedDirListing(sidecarDir);
        if (dirEntries !== null && !dirEntries.has(sidecarName)) {
          this.mtimeCache.delete(normalized);
          this.mtimeStore.delete(normalized).catch(() => {
          });
          this.logger.logResult("deleteMtimeSidecar", filePath, "skipped (not in dir listing)");
          return;
        }
      }
      const memCached = this.mtimeCache.get(normalized);
      const idbCached = await this.mtimeStore.get(normalized);
      if (memCached === void 0 && idbCached === void 0) {
        if (sidecarDir) {
          this.mtimeCache.delete(normalized);
          this.mtimeStore.delete(normalized).catch(() => {
          });
          this.logger.logResult("deleteMtimeSidecar", filePath, "skipped (no cache, dir listing unavailable)");
          return;
        }
      }
      const sidecarUrl = this.buildUrl(sidecarPath);
      try {
        const response = await this.makeRequest(sidecarUrl, { method: "DELETE" });
        if (response.ok || response.status === 404) {
          this.mtimeCache.delete(normalized);
          this.mtimeStore.delete(normalized).catch(() => {
          });
          this.logger.logResult("deleteMtimeSidecar", filePath, "OK");
        }
      } catch {
      }
    }
    // ===========================================================================
    // Snapshot — ETag baseline for shouldSync()
    // ===========================================================================
    /**
     * Implement `zen-fs-sync`'s `SyncableFS.shouldSync()` interface.
     *
     * Compares the in-memory ETag baseline (snapshot) with the actual remote
     * state. Returns `true` when remote changes are detected (or on first call
     * when no baseline exists). The snapshot is rebuilt as a side effect.
     *
     * On first call, attempts to restore the snapshot from IndexedDB. If the
     * persisted rootEtag still matches the remote root, returns `false` —
     * skipping the expensive full tree walk.
     */
    async shouldSync() {
      loggers.sync.log(`[RS-SYNC] shouldSync() called (snapshot=${this.snapshot === null ? "null" : `${this.snapshot.size} entries`}, rootEtag=${this.rootEtag ?? "null"})`);
      this.logger.log("shouldSync", "(snapshot check)");
      if (this.snapshot === null) {
        await this.loadSnapshotFromIDB();
        const snap = this.snapshot;
        loggers.sync.log(`[RS-SYNC] shouldSync: after IDB restore \u2192 snapshot=${snap === null ? "null" : `${snap.size} entries`}, rootEtag=${this.rootEtag ?? "null"}`);
        if (this.snapshot !== null && this.rootEtag !== null) {
          loggers.sync.log(`[RS-SYNC] shouldSync: snapshot restored, fetching current root ETag to compare with stored rootEtag='${this.rootEtag}'`);
          const currentRootEtag2 = await this.fetchRootEtag();
          loggers.sync.log(`[RS-SYNC] shouldSync: currentRootEtag='${currentRootEtag2 ?? "null"}' vs stored rootEtag='${this.rootEtag}' \u2192 ${currentRootEtag2 === this.rootEtag ? "SAME (no sync)" : "DIFFERENT (will sync)"}`);
          if (currentRootEtag2 !== null && currentRootEtag2 === this.rootEtag) {
            this.logger.logResult("shouldSync", "", "false (snapshot restored from IDB, root ETag unchanged)");
            return false;
          }
          await this.buildSnapshot();
          this.logger.logResult("shouldSync", "", "true (snapshot restored but root ETag changed)");
          return true;
        }
        loggers.sync.log(`[RS-SYNC] shouldSync: no persisted snapshot, building from scratch`);
        await this.buildSnapshot();
        this.logger.logResult("shouldSync", "", "true (first call, baseline built)");
        return true;
      }
      loggers.sync.log(`[RS-SYNC] shouldSync: existing snapshot (${this.snapshot.size} entries), fetching current root ETag...`);
      const currentRootEtag = await this.fetchRootEtag();
      if (currentRootEtag === null) {
        loggers.sync.log(`[RS-SYNC] shouldSync: currentRootEtag=null (unavailable) \u2192 returning true (sync)`);
        this.logger.logResult("shouldSync", "", "true (root ETag unavailable)");
        return true;
      }
      loggers.sync.log(`[RS-SYNC] shouldSync: currentRootEtag='${currentRootEtag}' vs stored rootEtag='${this.rootEtag}' \u2192 ${currentRootEtag === this.rootEtag ? "SAME (no sync)" : "DIFFERENT (will sync)"}`);
      if (currentRootEtag === this.rootEtag) {
        this.logger.logResult("shouldSync", "", "false (root ETag unchanged)");
        return false;
      }
      loggers.sync.log(`[RS-SYNC] shouldSync: root ETag changed, rebuilding snapshot...`);
      await this.buildSnapshot();
      this.logger.logResult("shouldSync", "", "true (root ETag changed)");
      return true;
    }
    /**
     * Fetch the sync-baseline folder's ETag via a GET request.
     * Returns `null` if the request fails or no ETag is present.
     *
     * We probe `syncRootPath` (default 'app_data/') instead of the account root,
     * because a RemoteStorage Bearer token is scoped to the modules declared via
     * claimAccess(); the account root (e.g. `/username/`) is NOT in any scope and
     * returns 401. Probing an authorized module root keeps the request inside the
     * token's scope while still serving as a reliable "did anything change?" check.
     */
    async fetchRootEtag() {
      loggers.sync.log(`[RS-SYNC] fetchRootEtag() called for syncRootPath='${this.syncRootPath}'`);
      const cacheKey = normalizePath2(this.syncRootPath);
      const preCached = this.dirListingCache.get(cacheKey);
      if (preCached) {
        const age = Date.now() - preCached.ts;
        const expired = age >= _RemoteStorageFileSystem.DIR_LISTING_TTL;
        loggers.sync.log(`[RS-SYNC] fetchRootEtag: cache BEFORE ensureDirListing \u2192 key=${cacheKey} age=${age}ms TTL=${_RemoteStorageFileSystem.DIR_LISTING_TTL}ms expired=${expired} etag=${preCached.etag ?? "null"}`);
      } else {
        loggers.sync.log(`[RS-SYNC] fetchRootEtag: cache BEFORE ensureDirListing \u2192 key=${cacheKey} NOT IN CACHE (will trigger network fetch)`);
      }
      try {
        await this.ensureDirListing(this.syncRootPath);
        const etag = this.getCachedDirEtag(this.syncRootPath);
        const postCached = this.dirListingCache.get(cacheKey);
        if (postCached && preCached) {
          const wasRefreshed = postCached.ts !== preCached.ts;
          loggers.sync.log(`[RS-SYNC] fetchRootEtag: cache AFTER ensureDirListing \u2192 ts_changed=${wasRefreshed} (pre=${preCached.ts} post=${postCached.ts}) \u2192 ${wasRefreshed ? "NETWORK FETCH occurred" : "CACHE HIT (no network request)"}`);
        }
        loggers.sync.log(`[RS-SYNC] fetchRootEtag: returning etag=${etag ?? "null"}`);
        return etag;
      } catch (e) {
        loggers.sync.log(`[RS-SYNC] fetchRootEtag: FAILED: ${e}`);
        this.logger.log("fetchRootEtag", this.syncRootPath, { error: String(e) });
        return null;
      }
    }
    /**
     * Build (or rebuild) the in-memory snapshot by walking the remote folder
     * tree and recording ETags for every document and folder.
     *
     * Uses subtree pruning: if a subfolder's ETag hasn't changed since the
     * previous snapshot, its subtree is skipped entirely.
     *
     * After building, persists the snapshot and rootEtag to IndexedDB so that
     * the next session can skip the full tree walk if the root ETag is unchanged.
     */
    async buildSnapshot() {
      this.logger.log("buildSnapshot", "(building ETag baseline)");
      const previousSnapshot = this.snapshot;
      const previousRootEtag = this.rootEtag;
      this.snapshot = /* @__PURE__ */ new Map();
      const rootEtag = await this.fetchRootEtag();
      this.rootEtag = rootEtag;
      await this.buildSnapshotRecursive(this.syncRootPath, previousSnapshot);
      this.logger.logResult("buildSnapshot", "", `entries=${this.snapshot.size}`);
      this.persistSnapshotToIDB();
    }
    /**
     * Load the ETag snapshot and rootEtag from IndexedDB into memory.
     * Called once on the first shouldSync() call to enable a warm start.
     * Sets `snapshotLoaded` to true regardless of whether data was found.
     */
    async loadSnapshotFromIDB() {
      if (this.snapshotLoaded) return;
      this.snapshotLoaded = true;
      try {
        const [entries2, rootEtag] = await Promise.all([
          this.snapshotStore.entries(),
          this.snapshotStore.get("__rootEtag__")
        ]);
        if (entries2.length > 0) {
          this.snapshot = /* @__PURE__ */ new Map();
          for (const [path, etag] of entries2) {
            if (path !== "__rootEtag__") {
              this.snapshot.set(path, etag);
            }
          }
          this.rootEtag = rootEtag ?? null;
          this.logger.logResult("shouldSync", "", `restored snapshot from IDB: ${this.snapshot.size} entries, rootEtag=${this.rootEtag}`);
        }
      } catch {
      }
    }
    /**
     * Persist the current snapshot and rootEtag to IndexedDB (fire-and-forget).
     * Called after buildSnapshot() and updateSnapshotForPath().
     */
    persistSnapshotToIDB() {
      if (this.snapshot === null) return;
      const entries2 = [["__rootEtag__", this.rootEtag ?? ""]];
      for (const [path, etag] of this.snapshot) {
        entries2.push([path, etag]);
      }
      this.snapshotStore.setMany(entries2).catch(() => {
      });
    }
    /**
     * Recursive helper for `buildSnapshot()`. Walks a folder, stores ETags for
     * all items, and prunes subtrees whose ETag is unchanged from the previous
     * snapshot.
     */
    async buildSnapshotRecursive(dirPath, previousSnapshot) {
      const dirUrl = this.buildUrl(ensureDirectoryPath(dirPath));
      try {
        const response = await this.makeRequest(dirUrl, {
          method: "GET",
          headers: { Accept: "application/ld+json" }
        });
        if (!response.ok) {
          return;
        }
        const contentType = response.headers.get("content-type") || "";
        if (!contentType.includes("application/ld+json")) {
          return;
        }
        const listing = await response.json();
        const items = [];
        if (listing["@graph"]) {
          for (const item of listing["@graph"]) {
            if (item["@id"] && item["@id"] !== "./") {
              const rawName = item["@id"];
              const isDir = rawName.endsWith("/");
              const name = isDir ? rawName.slice(0, -1) : rawName;
              if (name) {
                items.push({ name, etag: item["ETag"] ?? item["etag"], isDir });
              }
            }
          }
        } else if (listing["items"] && typeof listing["items"] === "object") {
          for (const entryKey of Object.keys(listing["items"])) {
            if (entryKey && entryKey !== "./") {
              const isDir = entryKey.endsWith("/");
              const name = isDir ? entryKey.slice(0, -1) : entryKey;
              const item = listing["items"][entryKey];
              if (name) {
                items.push({ name, etag: item?.ETag ?? item?.etag, isDir });
              }
            }
          }
        }
        const itemNames = new Set(items.map((i) => i.name));
        for (const item of items) {
          const itemPath = dirPath === "/" ? item.name : `${dirPath}/${item.name}`;
          if (isMetadataSidecarToDelete(item.name)) {
            loggers.dir.log(`[RS-SNAPSHOT] deleting stale dotfile: ${itemPath}`);
            void this.unlink(itemPath).catch(() => {
            });
            continue;
          }
          if (isMtimeSidecar(item.name)) {
            const dataName = sidecarToDataPath(item.name);
            const orphaned = item.name.endsWith(".mtime.mtime") || !dataName || !itemNames.has(dataName);
            if (orphaned) {
              loggers.dir.log(`[RS-SNAPSHOT] pruning orphaned mtime sidecar: ${itemPath}`);
              void this.unlink(itemPath).catch(() => {
              });
            }
            continue;
          }
          if (item.etag) {
            this.snapshot.set(itemPath, item.etag);
          }
          if (item.isDir) {
            const prevEtag = previousSnapshot?.get(itemPath);
            if (prevEtag && item.etag && prevEtag === item.etag) {
              const prefix = itemPath + "/";
              for (const [prevPath, prevVal] of previousSnapshot) {
                if (prevPath.startsWith(prefix) || prevPath === itemPath) {
                  this.snapshot.set(prevPath, prevVal);
                }
              }
              continue;
            }
            await this.buildSnapshotRecursive(itemPath, previousSnapshot);
          }
        }
      } catch {
      }
    }
    /**
     * Update the in-memory snapshot after a local write or delete.
     * Called internally by `writeFile()` and `unlink()`.
     *
     * Persists the change to IndexedDB so the snapshot stays consistent across
     * page reloads.
     */
    updateSnapshotForPath(path, etag) {
      if (this.snapshot === null) {
        return;
      }
      const normalized = normalizePath2(path);
      if (etag === null) {
        this.snapshot.delete(normalized);
        this.snapshotStore.delete(normalized).catch(() => {
        });
      } else {
        this.snapshot.set(normalized, etag);
        this.snapshotStore.set(normalized, etag).catch(() => {
        });
      }
      this.rootEtag = null;
      this.snapshotStore.set("__rootEtag__", "").catch(() => {
      });
    }
  };

  // src/universal-sync.ts
  function adaptFileSystem(fs) {
    return {
      async readFile(path, encoding) {
        const bytes = await fs.readFile(path);
        void encoding;
        return uint8ArrayToString(bytes);
      },
      async writeFile(path, data) {
        await fs.writeFile(path, data);
      },
      async readdir(path) {
        return fs.readdir(path);
      },
      async mkdir(path, _options) {
        await fs.mkdir(path, { mode: 16877 });
      },
      async stat(path) {
        const st = await fs.stat(path);
        const isDir = (st.mode & 16384) === 16384;
        return {
          isFile: () => !isDir,
          isDirectory: () => isDir,
          mtime: new Date(st.mtimeMs)
        };
      },
      async unlink(path) {
        await fs.unlink(path);
      },
      async rename(oldPath, newPath) {
        const content = await fs.readFile(oldPath);
        await fs.writeFile(newPath, uint8ArrayToString(content));
        await fs.unlink(oldPath);
      },
      async exists(path) {
        return fs.exists(path);
      }
    };
  }
  function createUniversalSyncFileSystem(config) {
    return adaptFileSystem(new RemoteStorageFileSystem(config));
  }

  // src/index.ts
  function createRemoteStorageFileSystem(config) {
    return new RemoteStorageFileSystem(config);
  }
  var src_default = RemoteStorageFileSystem;
  return __toCommonJS(src_exports);
})();
/*! Bundled license information:

ieee754/index.js:
  (*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> *)

buffer/index.js:
  (*!
   * The buffer module from node.js, for the browser.
   *
   * @author   Feross Aboukhadijeh <https://feross.org>
   * @license  MIT
   *)

safe-buffer/index.js:
  (*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> *)
*/
//# sourceMappingURL=zen-fs-remotestoragejs.global.js.map