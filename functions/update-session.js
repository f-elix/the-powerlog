!function(e,t){for(var r in t)e[r]=t[r]}(exports,function(e){var t={};function r(n){if(t[n])return t[n].exports;var o=t[n]={i:n,l:!1,exports:{}};return e[n].call(o.exports,o,o.exports,r),o.l=!0,o.exports}return r.m=e,r.c=t,r.d=function(e,t,n){r.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},r.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},r.t=function(e,t){if(1&t&&(e=r(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)r.d(n,o,function(t){return e[t]}.bind(null,o));return n},r.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return r.d(t,"a",t),t},r.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},r.p="",r(r.s=14)}([function(e,t){e.exports=require("stream")},function(e,t){e.exports=require("zlib")},function(e,t){e.exports=require("url")},function(e,t){e.exports=require("http")},function(e,t){e.exports=require("https")},function(e,t,r){"use strict";r.d(t,"a",(function(){return K}));var n=r(0),o=r(3),s=r(2),i=r(4),u=r(1);const a=n.Readable,c=Symbol("buffer"),l=Symbol("type");class f{constructor(){this[l]="";const e=arguments[0],t=arguments[1],r=[];let n=0;if(e){const t=e,o=Number(t.length);for(let e=0;e<o;e++){const o=t[e];let s;s=o instanceof Buffer?o:ArrayBuffer.isView(o)?Buffer.from(o.buffer,o.byteOffset,o.byteLength):o instanceof ArrayBuffer?Buffer.from(o):o instanceof f?o[c]:Buffer.from("string"==typeof o?o:String(o)),n+=s.length,r.push(s)}}this[c]=Buffer.concat(r);let o=t&&void 0!==t.type&&String(t.type).toLowerCase();o&&!/[^\u0020-\u007E]/.test(o)&&(this[l]=o)}get size(){return this[c].length}get type(){return this[l]}text(){return Promise.resolve(this[c].toString())}arrayBuffer(){const e=this[c],t=e.buffer.slice(e.byteOffset,e.byteOffset+e.byteLength);return Promise.resolve(t)}stream(){const e=new a;return e._read=function(){},e.push(this[c]),e.push(null),e}toString(){return"[object Blob]"}slice(){const e=this.size,t=arguments[0],r=arguments[1];let n,o;n=void 0===t?0:t<0?Math.max(e+t,0):Math.min(t,e),o=void 0===r?e:r<0?Math.max(e+r,0):Math.min(r,e);const s=Math.max(o-n,0),i=this[c].slice(n,n+s),u=new f([],{type:arguments[2]});return u[c]=i,u}}function d(e,t,r){Error.call(this,e),this.message=e,this.type=t,r&&(this.code=this.errno=r.code),Error.captureStackTrace(this,this.constructor)}let p;Object.defineProperties(f.prototype,{size:{enumerable:!0},type:{enumerable:!0},slice:{enumerable:!0}}),Object.defineProperty(f.prototype,Symbol.toStringTag,{value:"Blob",writable:!1,enumerable:!1,configurable:!0}),d.prototype=Object.create(Error.prototype),d.prototype.constructor=d,d.prototype.name="FetchError";try{p=require("encoding").convert}catch(e){}const h=Symbol("Body internals"),b=n.PassThrough;function y(e){var t=this,r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},o=r.size;let s=void 0===o?0:o;var i=r.timeout;let u=void 0===i?0:i;null==e?e=null:g(e)?e=Buffer.from(e.toString()):w(e)||Buffer.isBuffer(e)||("[object ArrayBuffer]"===Object.prototype.toString.call(e)?e=Buffer.from(e):ArrayBuffer.isView(e)?e=Buffer.from(e.buffer,e.byteOffset,e.byteLength):e instanceof n||(e=Buffer.from(String(e)))),this[h]={body:e,disturbed:!1,error:null},this.size=s,this.timeout=u,e instanceof n&&e.on("error",(function(e){const r="AbortError"===e.name?e:new d(`Invalid response body while trying to fetch ${t.url}: ${e.message}`,"system",e);t[h].error=r}))}function m(){var e=this;if(this[h].disturbed)return y.Promise.reject(new TypeError("body used already for: "+this.url));if(this[h].disturbed=!0,this[h].error)return y.Promise.reject(this[h].error);let t=this.body;if(null===t)return y.Promise.resolve(Buffer.alloc(0));if(w(t)&&(t=t.stream()),Buffer.isBuffer(t))return y.Promise.resolve(t);if(!(t instanceof n))return y.Promise.resolve(Buffer.alloc(0));let r=[],o=0,s=!1;return new y.Promise((function(n,i){let u;e.timeout&&(u=setTimeout((function(){s=!0,i(new d(`Response timeout while trying to fetch ${e.url} (over ${e.timeout}ms)`,"body-timeout"))}),e.timeout)),t.on("error",(function(t){"AbortError"===t.name?(s=!0,i(t)):i(new d(`Invalid response body while trying to fetch ${e.url}: ${t.message}`,"system",t))})),t.on("data",(function(t){if(!s&&null!==t){if(e.size&&o+t.length>e.size)return s=!0,void i(new d(`content size at ${e.url} over limit: ${e.size}`,"max-size"));o+=t.length,r.push(t)}})),t.on("end",(function(){if(!s){clearTimeout(u);try{n(Buffer.concat(r,o))}catch(t){i(new d(`Could not create Buffer from response body for ${e.url}: ${t.message}`,"system",t))}}}))}))}function g(e){return"object"==typeof e&&"function"==typeof e.append&&"function"==typeof e.delete&&"function"==typeof e.get&&"function"==typeof e.getAll&&"function"==typeof e.has&&"function"==typeof e.set&&("URLSearchParams"===e.constructor.name||"[object URLSearchParams]"===Object.prototype.toString.call(e)||"function"==typeof e.sort)}function w(e){return"object"==typeof e&&"function"==typeof e.arrayBuffer&&"string"==typeof e.type&&"function"==typeof e.stream&&"function"==typeof e.constructor&&"string"==typeof e.constructor.name&&/^(Blob|File)$/.test(e.constructor.name)&&/^(Blob|File)$/.test(e[Symbol.toStringTag])}function v(e){let t,r,o=e.body;if(e.bodyUsed)throw new Error("cannot clone body after it is used");return o instanceof n&&"function"!=typeof o.getBoundary&&(t=new b,r=new b,o.pipe(t),o.pipe(r),e[h].body=t,o=r),o}function O(e){return null===e?null:"string"==typeof e?"text/plain;charset=UTF-8":g(e)?"application/x-www-form-urlencoded;charset=UTF-8":w(e)?e.type||null:Buffer.isBuffer(e)||"[object ArrayBuffer]"===Object.prototype.toString.call(e)||ArrayBuffer.isView(e)?null:"function"==typeof e.getBoundary?"multipart/form-data;boundary="+e.getBoundary():e instanceof n?null:"text/plain;charset=UTF-8"}function j(e){const t=e.body;return null===t?0:w(t)?t.size:Buffer.isBuffer(t)?t.length:t&&"function"==typeof t.getLengthSync&&(t._lengthRetrievers&&0==t._lengthRetrievers.length||t.hasKnownLength&&t.hasKnownLength())?t.getLengthSync():null}y.prototype={get body(){return this[h].body},get bodyUsed(){return this[h].disturbed},arrayBuffer(){return m.call(this).then((function(e){return e.buffer.slice(e.byteOffset,e.byteOffset+e.byteLength)}))},blob(){let e=this.headers&&this.headers.get("content-type")||"";return m.call(this).then((function(t){return Object.assign(new f([],{type:e.toLowerCase()}),{[c]:t})}))},json(){var e=this;return m.call(this).then((function(t){try{return JSON.parse(t.toString())}catch(t){return y.Promise.reject(new d(`invalid json response body at ${e.url} reason: ${t.message}`,"invalid-json"))}}))},text(){return m.call(this).then((function(e){return e.toString()}))},buffer(){return m.call(this)},textConverted(){var e=this;return m.call(this).then((function(t){return function(e,t){if("function"!=typeof p)throw new Error("The package `encoding` must be installed to use the textConverted() function");const r=t.get("content-type");let n,o,s="utf-8";r&&(n=/charset=([^;]*)/i.exec(r));o=e.slice(0,1024).toString(),!n&&o&&(n=/<meta.+?charset=(['"])(.+?)\1/i.exec(o));!n&&o&&(n=/<meta[\s]+?http-equiv=(['"])content-type\1[\s]+?content=(['"])(.+?)\2/i.exec(o),n||(n=/<meta[\s]+?content=(['"])(.+?)\1[\s]+?http-equiv=(['"])content-type\3/i.exec(o),n&&n.pop()),n&&(n=/charset=(.*)/i.exec(n.pop())));!n&&o&&(n=/<\?xml.+?encoding=(['"])(.+?)\1/i.exec(o));n&&(s=n.pop(),"gb2312"!==s&&"gbk"!==s||(s="gb18030"));return p(e,"UTF-8",s).toString()}(t,e.headers)}))}},Object.defineProperties(y.prototype,{body:{enumerable:!0},bodyUsed:{enumerable:!0},arrayBuffer:{enumerable:!0},blob:{enumerable:!0},json:{enumerable:!0},text:{enumerable:!0}}),y.mixIn=function(e){for(const t of Object.getOwnPropertyNames(y.prototype))if(!(t in e)){const r=Object.getOwnPropertyDescriptor(y.prototype,t);Object.defineProperty(e,t,r)}},y.Promise=global.Promise;const S=/[^\^_`a-zA-Z\-0-9!#$%&'*+.|~]/,x=/[^\t\x20-\x7e\x80-\xff]/;function P(e){if(e=""+e,S.test(e)||""===e)throw new TypeError(e+" is not a legal HTTP header name")}function T(e){if(e=""+e,x.test(e))throw new TypeError(e+" is not a legal HTTP header value")}function E(e,t){t=t.toLowerCase();for(const r in e)if(r.toLowerCase()===t)return r}const B=Symbol("map");class _{constructor(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:void 0;if(this[B]=Object.create(null),e instanceof _){const t=e.raw(),r=Object.keys(t);for(const e of r)for(const r of t[e])this.append(e,r)}else if(null==e);else{if("object"!=typeof e)throw new TypeError("Provided initializer must be an object");{const t=e[Symbol.iterator];if(null!=t){if("function"!=typeof t)throw new TypeError("Header pairs must be iterable");const r=[];for(const t of e){if("object"!=typeof t||"function"!=typeof t[Symbol.iterator])throw new TypeError("Each header pair must be iterable");r.push(Array.from(t))}for(const e of r){if(2!==e.length)throw new TypeError("Each header pair must be a name/value tuple");this.append(e[0],e[1])}}else for(const t of Object.keys(e)){const r=e[t];this.append(t,r)}}}}get(e){P(e=""+e);const t=E(this[B],e);return void 0===t?null:this[B][t].join(", ")}forEach(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:void 0,r=A(this),n=0;for(;n<r.length;){var o=r[n];const s=o[0],i=o[1];e.call(t,i,s,this),r=A(this),n++}}set(e,t){t=""+t,P(e=""+e),T(t);const r=E(this[B],e);this[B][void 0!==r?r:e]=[t]}append(e,t){t=""+t,P(e=""+e),T(t);const r=E(this[B],e);void 0!==r?this[B][r].push(t):this[B][e]=[t]}has(e){return P(e=""+e),void 0!==E(this[B],e)}delete(e){P(e=""+e);const t=E(this[B],e);void 0!==t&&delete this[B][t]}raw(){return this[B]}keys(){return $(this,"key")}values(){return $(this,"value")}[Symbol.iterator](){return $(this,"key+value")}}function A(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"key+value";const r=Object.keys(e[B]).sort();return r.map("key"===t?function(e){return e.toLowerCase()}:"value"===t?function(t){return e[B][t].join(", ")}:function(t){return[t.toLowerCase(),e[B][t].join(", ")]})}_.prototype.entries=_.prototype[Symbol.iterator],Object.defineProperty(_.prototype,Symbol.toStringTag,{value:"Headers",writable:!1,enumerable:!1,configurable:!0}),Object.defineProperties(_.prototype,{get:{enumerable:!0},forEach:{enumerable:!0},set:{enumerable:!0},append:{enumerable:!0},has:{enumerable:!0},delete:{enumerable:!0},keys:{enumerable:!0},values:{enumerable:!0},entries:{enumerable:!0}});const C=Symbol("internal");function $(e,t){const r=Object.create(k);return r[C]={target:e,kind:t,index:0},r}const k=Object.setPrototypeOf({next(){if(!this||Object.getPrototypeOf(this)!==k)throw new TypeError("Value of `this` is not a HeadersIterator");var e=this[C];const t=e.target,r=e.kind,n=e.index,o=A(t,r);return n>=o.length?{value:void 0,done:!0}:(this[C].index=n+1,{value:o[n],done:!1})}},Object.getPrototypeOf(Object.getPrototypeOf([][Symbol.iterator]())));function L(e){const t=Object.assign({__proto__:null},e[B]),r=E(e[B],"Host");return void 0!==r&&(t[r]=t[r][0]),t}Object.defineProperty(k,Symbol.toStringTag,{value:"HeadersIterator",writable:!1,enumerable:!1,configurable:!0});const U=Symbol("Response internals"),I=o.STATUS_CODES;class z{constructor(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null,t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};y.call(this,e,t);const r=t.status||200,n=new _(t.headers);if(null!=e&&!n.has("Content-Type")){const t=O(e);t&&n.append("Content-Type",t)}this[U]={url:t.url,status:r,statusText:t.statusText||I[r],headers:n,counter:t.counter}}get url(){return this[U].url||""}get status(){return this[U].status}get ok(){return this[U].status>=200&&this[U].status<300}get redirected(){return this[U].counter>0}get statusText(){return this[U].statusText}get headers(){return this[U].headers}clone(){return new z(v(this),{url:this.url,status:this.status,statusText:this.statusText,headers:this.headers,ok:this.ok,redirected:this.redirected})}}y.mixIn(z.prototype),Object.defineProperties(z.prototype,{url:{enumerable:!0},status:{enumerable:!0},ok:{enumerable:!0},redirected:{enumerable:!0},statusText:{enumerable:!0},headers:{enumerable:!0},clone:{enumerable:!0}}),Object.defineProperty(z.prototype,Symbol.toStringTag,{value:"Response",writable:!1,enumerable:!1,configurable:!0});const R=Symbol("Request internals"),q=s.parse,H=s.format,D="destroy"in n.Readable.prototype;function N(e){return"object"==typeof e&&"object"==typeof e[R]}class M{constructor(e){let t,r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};N(e)?t=q(e.url):(t=e&&e.href?q(e.href):q(""+e),e={});let n=r.method||e.method||"GET";if(n=n.toUpperCase(),(null!=r.body||N(e)&&null!==e.body)&&("GET"===n||"HEAD"===n))throw new TypeError("Request with GET/HEAD method cannot have body");let o=null!=r.body?r.body:N(e)&&null!==e.body?v(e):null;y.call(this,o,{timeout:r.timeout||e.timeout||0,size:r.size||e.size||0});const s=new _(r.headers||e.headers||{});if(null!=o&&!s.has("Content-Type")){const e=O(o);e&&s.append("Content-Type",e)}let i=N(e)?e.signal:null;if("signal"in r&&(i=r.signal),null!=i&&!function(e){const t=e&&"object"==typeof e&&Object.getPrototypeOf(e);return!(!t||"AbortSignal"!==t.constructor.name)}(i))throw new TypeError("Expected signal to be an instanceof AbortSignal");this[R]={method:n,redirect:r.redirect||e.redirect||"follow",headers:s,parsedURL:t,signal:i},this.follow=void 0!==r.follow?r.follow:void 0!==e.follow?e.follow:20,this.compress=void 0!==r.compress?r.compress:void 0===e.compress||e.compress,this.counter=r.counter||e.counter||0,this.agent=r.agent||e.agent}get method(){return this[R].method}get url(){return H(this[R].parsedURL)}get headers(){return this[R].headers}get redirect(){return this[R].redirect}get signal(){return this[R].signal}clone(){return new M(this)}}function F(e){Error.call(this,e),this.type="aborted",this.message=e,Error.captureStackTrace(this,this.constructor)}y.mixIn(M.prototype),Object.defineProperty(M.prototype,Symbol.toStringTag,{value:"Request",writable:!1,enumerable:!1,configurable:!0}),Object.defineProperties(M.prototype,{method:{enumerable:!0},url:{enumerable:!0},headers:{enumerable:!0},redirect:{enumerable:!0},clone:{enumerable:!0},signal:{enumerable:!0}}),F.prototype=Object.create(Error.prototype),F.prototype.constructor=F,F.prototype.name="AbortError";const G=n.PassThrough,J=s.resolve;function V(e,t){if(!V.Promise)throw new Error("native promise missing, set fetch.Promise to your favorite alternative");return y.Promise=V.Promise,new V.Promise((function(r,s){const a=new M(e,t),c=function(e){const t=e[R].parsedURL,r=new _(e[R].headers);if(r.has("Accept")||r.set("Accept","*/*"),!t.protocol||!t.hostname)throw new TypeError("Only absolute URLs are supported");if(!/^https?:$/.test(t.protocol))throw new TypeError("Only HTTP(S) protocols are supported");if(e.signal&&e.body instanceof n.Readable&&!D)throw new Error("Cancellation of streamed requests with AbortSignal is not supported in node < 8");let o=null;if(null==e.body&&/^(POST|PUT)$/i.test(e.method)&&(o="0"),null!=e.body){const t=j(e);"number"==typeof t&&(o=String(t))}o&&r.set("Content-Length",o),r.has("User-Agent")||r.set("User-Agent","node-fetch/1.0 (+https://github.com/bitinn/node-fetch)"),e.compress&&!r.has("Accept-Encoding")&&r.set("Accept-Encoding","gzip,deflate");let s=e.agent;return"function"==typeof s&&(s=s(t)),r.has("Connection")||s||r.set("Connection","close"),Object.assign({},t,{method:e.method,headers:L(r),agent:s})}(a),l=("https:"===c.protocol?i:o).request,f=a.signal;let p=null;const h=function(){let e=new F("The user aborted a request.");s(e),a.body&&a.body instanceof n.Readable&&a.body.destroy(e),p&&p.body&&p.body.emit("error",e)};if(f&&f.aborted)return void h();const b=function(){h(),g()},y=l(c);let m;function g(){y.abort(),f&&f.removeEventListener("abort",b),clearTimeout(m)}f&&f.addEventListener("abort",b),a.timeout&&y.once("socket",(function(e){m=setTimeout((function(){s(new d("network timeout at: "+a.url,"request-timeout")),g()}),a.timeout)})),y.on("error",(function(e){s(new d(`request to ${a.url} failed, reason: ${e.message}`,"system",e)),g()})),y.on("response",(function(e){clearTimeout(m);const t=function(e){const t=new _;for(const r of Object.keys(e))if(!S.test(r))if(Array.isArray(e[r]))for(const n of e[r])x.test(n)||(void 0===t[B][r]?t[B][r]=[n]:t[B][r].push(n));else x.test(e[r])||(t[B][r]=[e[r]]);return t}(e.headers);if(V.isRedirect(e.statusCode)){const n=t.get("Location"),o=null===n?null:J(a.url,n);switch(a.redirect){case"error":return s(new d("uri requested responds with a redirect, redirect mode is set to error: "+a.url,"no-redirect")),void g();case"manual":if(null!==o)try{t.set("Location",o)}catch(e){s(e)}break;case"follow":if(null===o)break;if(a.counter>=a.follow)return s(new d("maximum redirect reached at: "+a.url,"max-redirect")),void g();const n={headers:new _(a.headers),follow:a.follow,counter:a.counter+1,agent:a.agent,compress:a.compress,method:a.method,body:a.body,signal:a.signal,timeout:a.timeout,size:a.size};return 303!==e.statusCode&&a.body&&null===j(a)?(s(new d("Cannot follow redirect with body being a readable stream","unsupported-redirect")),void g()):(303!==e.statusCode&&(301!==e.statusCode&&302!==e.statusCode||"POST"!==a.method)||(n.method="GET",n.body=void 0,n.headers.delete("content-length")),r(V(new M(o,n))),void g())}}e.once("end",(function(){f&&f.removeEventListener("abort",b)}));let n=e.pipe(new G);const o={url:a.url,status:e.statusCode,statusText:e.statusMessage,headers:t,size:a.size,timeout:a.timeout,counter:a.counter},i=t.get("Content-Encoding");if(!a.compress||"HEAD"===a.method||null===i||204===e.statusCode||304===e.statusCode)return p=new z(n,o),void r(p);const c={flush:u.Z_SYNC_FLUSH,finishFlush:u.Z_SYNC_FLUSH};if("gzip"==i||"x-gzip"==i)return n=n.pipe(u.createGunzip(c)),p=new z(n,o),void r(p);if("deflate"!=i&&"x-deflate"!=i){if("br"==i&&"function"==typeof u.createBrotliDecompress)return n=n.pipe(u.createBrotliDecompress()),p=new z(n,o),void r(p);p=new z(n,o),r(p)}else{e.pipe(new G).once("data",(function(e){n=8==(15&e[0])?n.pipe(u.createInflate()):n.pipe(u.createInflateRaw()),p=new z(n,o),r(p)}))}})),function(e,t){const r=t.body;null===r?e.end():w(r)?r.stream().pipe(e):Buffer.isBuffer(r)?(e.write(r),e.end()):r.pipe(e)}(y,a)}))}V.isRedirect=function(e){return 301===e||302===e||303===e||307===e||308===e},V.Promise=global.Promise;var Z=V;const K=async({query:e,variables:t})=>{try{const r=await Z(process.env.HASURA_ENDPOINT,{method:"POST",headers:{"x-hasura-admin-secret":process.env.HASURA_GRAPHQL_ADMIN_SECRET},body:JSON.stringify({query:e,variables:t})}),{errors:n,data:o}=await r.json();return n?(console.error(n),{statusCode:500,body:JSON.stringify(n)}):{statusCode:200,body:JSON.stringify(o)}}catch(e){throw console.error(e),e}}},,,,,,,,,function(e,t,r){"use strict";r.r(t),r.d(t,"handler",(function(){return u}));var n=r(5);function o(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function s(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?o(Object(r),!0).forEach((function(t){i(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):o(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function i(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}const u=async(e,t)=>{const{user:r}=t.clientContext;if(!r)return{statusCode:403};const{session:o}=JSON.parse(e.body||"{}");if(!o)return{statusCode:400};const i=o,u=i.performances.map(e=>{const t=e.exerciseInstances.map(e=>{var t;if(null!==(t=e.exercise)&&void 0!==t&&t.id){return s(s({},e),{},{id:void 0,exerciseId:e.exercise.id,performanceId:void 0,exercise:void 0})}if(e.exercise){const{exercise:t}=e;delete t.id;const r={data:s({},t)};return s(s({},e),{},{id:void 0,performanceId:void 0,exercise:r})}return s(s({},e),{},{id:void 0,performanceId:void 0,exercise:void 0})});return{id:void 0,sessionId:i.id,exerciseInstances:{data:t}}});return Object(n.a)({query:"\n\t\tmutation updateSession($sessionId: Int!, $performances: [performances_insert_input!]!, $sessionPk: sessions_pk_columns_input!, $date: timestamptz!, $title: String!, $bodyweightUnit: String!, $bodyweightAmount: numeric) {\n\t\t\tdelete_exercise_instances(where: {performance: {sessionId: {_eq: $sessionId}}}) {\n\t\t\t\taffected_rows\n\t\t\t}\n\t\t\tdelete_performances(where: {sessionId: {_eq: $sessionId}}) {\n\t\t\t\taffected_rows\n\t\t\t}\n\t\t\tinsert_performances(objects: $performances) {\n\t\t\t\taffected_rows\n\t\t\t}\n\t\t\tupdate_sessions_by_pk(pk_columns: $sessionPk, _set:{date: $date, title: $title, bodyweightAmount: $bodyweightAmount, bodyweightUnit: $bodyweightUnit}) {\n\t\t\t\tid\n\t\t\t\tuserId\n\t\t\t\tdate\n\t\t\t\ttitle\n\t\t\t\tbodyweightAmount\n\t\t\t\tbodyweightUnit\n\t\t\t\tperformances {\n\t\t\t\t\tid\n\t\t\t\t\texerciseInstances {\n\t\t\t\t\t\tid\n\t\t\t\t\t\texecutions\n\t\t\t\t\t\texercise {\n\t\t\t\t\t\t\tid\n\t\t\t\t\t\t\tname\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t }\n\t\t  }\n\t\t",variables:{sessionId:i.id,performances:u,sessionPk:{id:i.id},date:i.date,title:i.title,bodyweightAmount:i.bodyweightAmount||void 0,bodyweightUnit:i.bodyweightUnit}})}}]));