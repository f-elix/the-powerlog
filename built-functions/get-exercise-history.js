!function(e,t){for(var r in t)e[r]=t[r]}(exports,function(e){var t={};function r(o){if(t[o])return t[o].exports;var n=t[o]={i:o,l:!1,exports:{}};return e[o].call(n.exports,n,n.exports,r),n.l=!0,n.exports}return r.m=e,r.c=t,r.d=function(e,t,o){r.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:o})},r.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},r.t=function(e,t){if(1&t&&(e=r(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var o=Object.create(null);if(r.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var n in e)r.d(o,n,function(t){return e[t]}.bind(null,n));return o},r.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return r.d(t,"a",t),t},r.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},r.p="",r(r.s=9)}([function(e,t){e.exports=require("stream")},function(e,t){e.exports=require("zlib")},function(e,t){e.exports=require("url")},function(e,t){e.exports=require("http")},function(e,t){e.exports=require("https")},function(e,t,r){"use strict";r.d(t,"a",(function(){return K}));var o=r(0),n=r(3),s=r(2),i=r(4),u=r(1);const a=o.Readable,c=Symbol("buffer"),l=Symbol("type");class f{constructor(){this[l]="";const e=arguments[0],t=arguments[1],r=[];let o=0;if(e){const t=e,n=Number(t.length);for(let e=0;e<n;e++){const n=t[e];let s;s=n instanceof Buffer?n:ArrayBuffer.isView(n)?Buffer.from(n.buffer,n.byteOffset,n.byteLength):n instanceof ArrayBuffer?Buffer.from(n):n instanceof f?n[c]:Buffer.from("string"==typeof n?n:String(n)),o+=s.length,r.push(s)}}this[c]=Buffer.concat(r);let n=t&&void 0!==t.type&&String(t.type).toLowerCase();n&&!/[^\u0020-\u007E]/.test(n)&&(this[l]=n)}get size(){return this[c].length}get type(){return this[l]}text(){return Promise.resolve(this[c].toString())}arrayBuffer(){const e=this[c],t=e.buffer.slice(e.byteOffset,e.byteOffset+e.byteLength);return Promise.resolve(t)}stream(){const e=new a;return e._read=function(){},e.push(this[c]),e.push(null),e}toString(){return"[object Blob]"}slice(){const e=this.size,t=arguments[0],r=arguments[1];let o,n;o=void 0===t?0:t<0?Math.max(e+t,0):Math.min(t,e),n=void 0===r?e:r<0?Math.max(e+r,0):Math.min(r,e);const s=Math.max(n-o,0),i=this[c].slice(o,o+s),u=new f([],{type:arguments[2]});return u[c]=i,u}}function d(e,t,r){Error.call(this,e),this.message=e,this.type=t,r&&(this.code=this.errno=r.code),Error.captureStackTrace(this,this.constructor)}let p;Object.defineProperties(f.prototype,{size:{enumerable:!0},type:{enumerable:!0},slice:{enumerable:!0}}),Object.defineProperty(f.prototype,Symbol.toStringTag,{value:"Blob",writable:!1,enumerable:!1,configurable:!0}),d.prototype=Object.create(Error.prototype),d.prototype.constructor=d,d.prototype.name="FetchError";try{p=require("encoding").convert}catch(e){}const h=Symbol("Body internals"),y=o.PassThrough;function b(e){var t=this,r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},n=r.size;let s=void 0===n?0:n;var i=r.timeout;let u=void 0===i?0:i;null==e?e=null:g(e)?e=Buffer.from(e.toString()):w(e)||Buffer.isBuffer(e)||("[object ArrayBuffer]"===Object.prototype.toString.call(e)?e=Buffer.from(e):ArrayBuffer.isView(e)?e=Buffer.from(e.buffer,e.byteOffset,e.byteLength):e instanceof o||(e=Buffer.from(String(e)))),this[h]={body:e,disturbed:!1,error:null},this.size=s,this.timeout=u,e instanceof o&&e.on("error",(function(e){const r="AbortError"===e.name?e:new d(`Invalid response body while trying to fetch ${t.url}: ${e.message}`,"system",e);t[h].error=r}))}function m(){var e=this;if(this[h].disturbed)return b.Promise.reject(new TypeError("body used already for: "+this.url));if(this[h].disturbed=!0,this[h].error)return b.Promise.reject(this[h].error);let t=this.body;if(null===t)return b.Promise.resolve(Buffer.alloc(0));if(w(t)&&(t=t.stream()),Buffer.isBuffer(t))return b.Promise.resolve(t);if(!(t instanceof o))return b.Promise.resolve(Buffer.alloc(0));let r=[],n=0,s=!1;return new b.Promise((function(o,i){let u;e.timeout&&(u=setTimeout((function(){s=!0,i(new d(`Response timeout while trying to fetch ${e.url} (over ${e.timeout}ms)`,"body-timeout"))}),e.timeout)),t.on("error",(function(t){"AbortError"===t.name?(s=!0,i(t)):i(new d(`Invalid response body while trying to fetch ${e.url}: ${t.message}`,"system",t))})),t.on("data",(function(t){if(!s&&null!==t){if(e.size&&n+t.length>e.size)return s=!0,void i(new d(`content size at ${e.url} over limit: ${e.size}`,"max-size"));n+=t.length,r.push(t)}})),t.on("end",(function(){if(!s){clearTimeout(u);try{o(Buffer.concat(r,n))}catch(t){i(new d(`Could not create Buffer from response body for ${e.url}: ${t.message}`,"system",t))}}}))}))}function g(e){return"object"==typeof e&&"function"==typeof e.append&&"function"==typeof e.delete&&"function"==typeof e.get&&"function"==typeof e.getAll&&"function"==typeof e.has&&"function"==typeof e.set&&("URLSearchParams"===e.constructor.name||"[object URLSearchParams]"===Object.prototype.toString.call(e)||"function"==typeof e.sort)}function w(e){return"object"==typeof e&&"function"==typeof e.arrayBuffer&&"string"==typeof e.type&&"function"==typeof e.stream&&"function"==typeof e.constructor&&"string"==typeof e.constructor.name&&/^(Blob|File)$/.test(e.constructor.name)&&/^(Blob|File)$/.test(e[Symbol.toStringTag])}function v(e){let t,r,n=e.body;if(e.bodyUsed)throw new Error("cannot clone body after it is used");return n instanceof o&&"function"!=typeof n.getBoundary&&(t=new y,r=new y,n.pipe(t),n.pipe(r),e[h].body=t,n=r),n}function S(e){return null===e?null:"string"==typeof e?"text/plain;charset=UTF-8":g(e)?"application/x-www-form-urlencoded;charset=UTF-8":w(e)?e.type||null:Buffer.isBuffer(e)||"[object ArrayBuffer]"===Object.prototype.toString.call(e)||ArrayBuffer.isView(e)?null:"function"==typeof e.getBoundary?"multipart/form-data;boundary="+e.getBoundary():e instanceof o?null:"text/plain;charset=UTF-8"}function x(e){const t=e.body;return null===t?0:w(t)?t.size:Buffer.isBuffer(t)?t.length:t&&"function"==typeof t.getLengthSync&&(t._lengthRetrievers&&0==t._lengthRetrievers.length||t.hasKnownLength&&t.hasKnownLength())?t.getLengthSync():null}b.prototype={get body(){return this[h].body},get bodyUsed(){return this[h].disturbed},arrayBuffer(){return m.call(this).then((function(e){return e.buffer.slice(e.byteOffset,e.byteOffset+e.byteLength)}))},blob(){let e=this.headers&&this.headers.get("content-type")||"";return m.call(this).then((function(t){return Object.assign(new f([],{type:e.toLowerCase()}),{[c]:t})}))},json(){var e=this;return m.call(this).then((function(t){try{return JSON.parse(t.toString())}catch(t){return b.Promise.reject(new d(`invalid json response body at ${e.url} reason: ${t.message}`,"invalid-json"))}}))},text(){return m.call(this).then((function(e){return e.toString()}))},buffer(){return m.call(this)},textConverted(){var e=this;return m.call(this).then((function(t){return function(e,t){if("function"!=typeof p)throw new Error("The package `encoding` must be installed to use the textConverted() function");const r=t.get("content-type");let o,n,s="utf-8";r&&(o=/charset=([^;]*)/i.exec(r));n=e.slice(0,1024).toString(),!o&&n&&(o=/<meta.+?charset=(['"])(.+?)\1/i.exec(n));!o&&n&&(o=/<meta[\s]+?http-equiv=(['"])content-type\1[\s]+?content=(['"])(.+?)\2/i.exec(n),o||(o=/<meta[\s]+?content=(['"])(.+?)\1[\s]+?http-equiv=(['"])content-type\3/i.exec(n),o&&o.pop()),o&&(o=/charset=(.*)/i.exec(o.pop())));!o&&n&&(o=/<\?xml.+?encoding=(['"])(.+?)\1/i.exec(n));o&&(s=o.pop(),"gb2312"!==s&&"gbk"!==s||(s="gb18030"));return p(e,"UTF-8",s).toString()}(t,e.headers)}))}},Object.defineProperties(b.prototype,{body:{enumerable:!0},bodyUsed:{enumerable:!0},arrayBuffer:{enumerable:!0},blob:{enumerable:!0},json:{enumerable:!0},text:{enumerable:!0}}),b.mixIn=function(e){for(const t of Object.getOwnPropertyNames(b.prototype))if(!(t in e)){const r=Object.getOwnPropertyDescriptor(b.prototype,t);Object.defineProperty(e,t,r)}},b.Promise=global.Promise;const O=/[^\^_`a-zA-Z\-0-9!#$%&'*+.|~]/,T=/[^\t\x20-\x7e\x80-\xff]/;function j(e){if(e=""+e,O.test(e)||""===e)throw new TypeError(e+" is not a legal HTTP header name")}function P(e){if(e=""+e,T.test(e))throw new TypeError(e+" is not a legal HTTP header value")}function E(e,t){t=t.toLowerCase();for(const r in e)if(r.toLowerCase()===t)return r}const B=Symbol("map");class C{constructor(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:void 0;if(this[B]=Object.create(null),e instanceof C){const t=e.raw(),r=Object.keys(t);for(const e of r)for(const r of t[e])this.append(e,r)}else if(null==e);else{if("object"!=typeof e)throw new TypeError("Provided initializer must be an object");{const t=e[Symbol.iterator];if(null!=t){if("function"!=typeof t)throw new TypeError("Header pairs must be iterable");const r=[];for(const t of e){if("object"!=typeof t||"function"!=typeof t[Symbol.iterator])throw new TypeError("Each header pair must be iterable");r.push(Array.from(t))}for(const e of r){if(2!==e.length)throw new TypeError("Each header pair must be a name/value tuple");this.append(e[0],e[1])}}else for(const t of Object.keys(e)){const r=e[t];this.append(t,r)}}}}get(e){j(e=""+e);const t=E(this[B],e);return void 0===t?null:this[B][t].join(", ")}forEach(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:void 0,r=A(this),o=0;for(;o<r.length;){var n=r[o];const s=n[0],i=n[1];e.call(t,i,s,this),r=A(this),o++}}set(e,t){t=""+t,j(e=""+e),P(t);const r=E(this[B],e);this[B][void 0!==r?r:e]=[t]}append(e,t){t=""+t,j(e=""+e),P(t);const r=E(this[B],e);void 0!==r?this[B][r].push(t):this[B][e]=[t]}has(e){return j(e=""+e),void 0!==E(this[B],e)}delete(e){j(e=""+e);const t=E(this[B],e);void 0!==t&&delete this[B][t]}raw(){return this[B]}keys(){return _(this,"key")}values(){return _(this,"value")}[Symbol.iterator](){return _(this,"key+value")}}function A(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"key+value";const r=Object.keys(e[B]).sort();return r.map("key"===t?function(e){return e.toLowerCase()}:"value"===t?function(t){return e[B][t].join(", ")}:function(t){return[t.toLowerCase(),e[B][t].join(", ")]})}C.prototype.entries=C.prototype[Symbol.iterator],Object.defineProperty(C.prototype,Symbol.toStringTag,{value:"Headers",writable:!1,enumerable:!1,configurable:!0}),Object.defineProperties(C.prototype,{get:{enumerable:!0},forEach:{enumerable:!0},set:{enumerable:!0},append:{enumerable:!0},has:{enumerable:!0},delete:{enumerable:!0},keys:{enumerable:!0},values:{enumerable:!0},entries:{enumerable:!0}});const L=Symbol("internal");function _(e,t){const r=Object.create($);return r[L]={target:e,kind:t,index:0},r}const $=Object.setPrototypeOf({next(){if(!this||Object.getPrototypeOf(this)!==$)throw new TypeError("Value of `this` is not a HeadersIterator");var e=this[L];const t=e.target,r=e.kind,o=e.index,n=A(t,r);return o>=n.length?{value:void 0,done:!0}:(this[L].index=o+1,{value:n[o],done:!1})}},Object.getPrototypeOf(Object.getPrototypeOf([][Symbol.iterator]())));function z(e){const t=Object.assign({__proto__:null},e[B]),r=E(e[B],"Host");return void 0!==r&&(t[r]=t[r][0]),t}Object.defineProperty($,Symbol.toStringTag,{value:"HeadersIterator",writable:!1,enumerable:!1,configurable:!0});const q=Symbol("Response internals"),R=n.STATUS_CODES;class k{constructor(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null,t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};b.call(this,e,t);const r=t.status||200,o=new C(t.headers);if(null!=e&&!o.has("Content-Type")){const t=S(e);t&&o.append("Content-Type",t)}this[q]={url:t.url,status:r,statusText:t.statusText||R[r],headers:o,counter:t.counter}}get url(){return this[q].url||""}get status(){return this[q].status}get ok(){return this[q].status>=200&&this[q].status<300}get redirected(){return this[q].counter>0}get statusText(){return this[q].statusText}get headers(){return this[q].headers}clone(){return new k(v(this),{url:this.url,status:this.status,statusText:this.statusText,headers:this.headers,ok:this.ok,redirected:this.redirected})}}b.mixIn(k.prototype),Object.defineProperties(k.prototype,{url:{enumerable:!0},status:{enumerable:!0},ok:{enumerable:!0},redirected:{enumerable:!0},statusText:{enumerable:!0},headers:{enumerable:!0},clone:{enumerable:!0}}),Object.defineProperty(k.prototype,Symbol.toStringTag,{value:"Response",writable:!1,enumerable:!1,configurable:!0});const I=Symbol("Request internals"),U=s.parse,H=s.format,N="destroy"in o.Readable.prototype;function M(e){return"object"==typeof e&&"object"==typeof e[I]}class F{constructor(e){let t,r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};M(e)?t=U(e.url):(t=e&&e.href?U(e.href):U(""+e),e={});let o=r.method||e.method||"GET";if(o=o.toUpperCase(),(null!=r.body||M(e)&&null!==e.body)&&("GET"===o||"HEAD"===o))throw new TypeError("Request with GET/HEAD method cannot have body");let n=null!=r.body?r.body:M(e)&&null!==e.body?v(e):null;b.call(this,n,{timeout:r.timeout||e.timeout||0,size:r.size||e.size||0});const s=new C(r.headers||e.headers||{});if(null!=n&&!s.has("Content-Type")){const e=S(n);e&&s.append("Content-Type",e)}let i=M(e)?e.signal:null;if("signal"in r&&(i=r.signal),null!=i&&!function(e){const t=e&&"object"==typeof e&&Object.getPrototypeOf(e);return!(!t||"AbortSignal"!==t.constructor.name)}(i))throw new TypeError("Expected signal to be an instanceof AbortSignal");this[I]={method:o,redirect:r.redirect||e.redirect||"follow",headers:s,parsedURL:t,signal:i},this.follow=void 0!==r.follow?r.follow:void 0!==e.follow?e.follow:20,this.compress=void 0!==r.compress?r.compress:void 0===e.compress||e.compress,this.counter=r.counter||e.counter||0,this.agent=r.agent||e.agent}get method(){return this[I].method}get url(){return H(this[I].parsedURL)}get headers(){return this[I].headers}get redirect(){return this[I].redirect}get signal(){return this[I].signal}clone(){return new F(this)}}function D(e){Error.call(this,e),this.type="aborted",this.message=e,Error.captureStackTrace(this,this.constructor)}b.mixIn(F.prototype),Object.defineProperty(F.prototype,Symbol.toStringTag,{value:"Request",writable:!1,enumerable:!1,configurable:!0}),Object.defineProperties(F.prototype,{method:{enumerable:!0},url:{enumerable:!0},headers:{enumerable:!0},redirect:{enumerable:!0},clone:{enumerable:!0},signal:{enumerable:!0}}),D.prototype=Object.create(Error.prototype),D.prototype.constructor=D,D.prototype.name="AbortError";const G=o.PassThrough,J=s.resolve;function V(e,t){if(!V.Promise)throw new Error("native promise missing, set fetch.Promise to your favorite alternative");return b.Promise=V.Promise,new V.Promise((function(r,s){const a=new F(e,t),c=function(e){const t=e[I].parsedURL,r=new C(e[I].headers);if(r.has("Accept")||r.set("Accept","*/*"),!t.protocol||!t.hostname)throw new TypeError("Only absolute URLs are supported");if(!/^https?:$/.test(t.protocol))throw new TypeError("Only HTTP(S) protocols are supported");if(e.signal&&e.body instanceof o.Readable&&!N)throw new Error("Cancellation of streamed requests with AbortSignal is not supported in node < 8");let n=null;if(null==e.body&&/^(POST|PUT)$/i.test(e.method)&&(n="0"),null!=e.body){const t=x(e);"number"==typeof t&&(n=String(t))}n&&r.set("Content-Length",n),r.has("User-Agent")||r.set("User-Agent","node-fetch/1.0 (+https://github.com/bitinn/node-fetch)"),e.compress&&!r.has("Accept-Encoding")&&r.set("Accept-Encoding","gzip,deflate");let s=e.agent;return"function"==typeof s&&(s=s(t)),r.has("Connection")||s||r.set("Connection","close"),Object.assign({},t,{method:e.method,headers:z(r),agent:s})}(a),l=("https:"===c.protocol?i:n).request,f=a.signal;let p=null;const h=function(){let e=new D("The user aborted a request.");s(e),a.body&&a.body instanceof o.Readable&&a.body.destroy(e),p&&p.body&&p.body.emit("error",e)};if(f&&f.aborted)return void h();const y=function(){h(),g()},b=l(c);let m;function g(){b.abort(),f&&f.removeEventListener("abort",y),clearTimeout(m)}f&&f.addEventListener("abort",y),a.timeout&&b.once("socket",(function(e){m=setTimeout((function(){s(new d("network timeout at: "+a.url,"request-timeout")),g()}),a.timeout)})),b.on("error",(function(e){s(new d(`request to ${a.url} failed, reason: ${e.message}`,"system",e)),g()})),b.on("response",(function(e){clearTimeout(m);const t=function(e){const t=new C;for(const r of Object.keys(e))if(!O.test(r))if(Array.isArray(e[r]))for(const o of e[r])T.test(o)||(void 0===t[B][r]?t[B][r]=[o]:t[B][r].push(o));else T.test(e[r])||(t[B][r]=[e[r]]);return t}(e.headers);if(V.isRedirect(e.statusCode)){const o=t.get("Location"),n=null===o?null:J(a.url,o);switch(a.redirect){case"error":return s(new d("uri requested responds with a redirect, redirect mode is set to error: "+a.url,"no-redirect")),void g();case"manual":if(null!==n)try{t.set("Location",n)}catch(e){s(e)}break;case"follow":if(null===n)break;if(a.counter>=a.follow)return s(new d("maximum redirect reached at: "+a.url,"max-redirect")),void g();const o={headers:new C(a.headers),follow:a.follow,counter:a.counter+1,agent:a.agent,compress:a.compress,method:a.method,body:a.body,signal:a.signal,timeout:a.timeout,size:a.size};return 303!==e.statusCode&&a.body&&null===x(a)?(s(new d("Cannot follow redirect with body being a readable stream","unsupported-redirect")),void g()):(303!==e.statusCode&&(301!==e.statusCode&&302!==e.statusCode||"POST"!==a.method)||(o.method="GET",o.body=void 0,o.headers.delete("content-length")),r(V(new F(n,o))),void g())}}e.once("end",(function(){f&&f.removeEventListener("abort",y)}));let o=e.pipe(new G);const n={url:a.url,status:e.statusCode,statusText:e.statusMessage,headers:t,size:a.size,timeout:a.timeout,counter:a.counter},i=t.get("Content-Encoding");if(!a.compress||"HEAD"===a.method||null===i||204===e.statusCode||304===e.statusCode)return p=new k(o,n),void r(p);const c={flush:u.Z_SYNC_FLUSH,finishFlush:u.Z_SYNC_FLUSH};if("gzip"==i||"x-gzip"==i)return o=o.pipe(u.createGunzip(c)),p=new k(o,n),void r(p);if("deflate"!=i&&"x-deflate"!=i){if("br"==i&&"function"==typeof u.createBrotliDecompress)return o=o.pipe(u.createBrotliDecompress()),p=new k(o,n),void r(p);p=new k(o,n),r(p)}else{e.pipe(new G).once("data",(function(e){o=8==(15&e[0])?o.pipe(u.createInflate()):o.pipe(u.createInflateRaw()),p=new k(o,n),r(p)}))}})),function(e,t){const r=t.body;null===r?e.end():w(r)?r.stream().pipe(e):Buffer.isBuffer(r)?(e.write(r),e.end()):r.pipe(e)}(b,a)}))}V.isRedirect=function(e){return 301===e||302===e||303===e||307===e||308===e},V.Promise=global.Promise;var Z=V;const K=async({query:e,variables:t})=>{try{const r=await Z(process.env.HASURA_ENDPOINT,{method:"POST",headers:{"x-hasura-admin-secret":process.env.HASURA_GRAPHQL_ADMIN_SECRET},body:JSON.stringify({query:e,variables:t})}),{errors:o,data:n}=await r.json();return o?(console.error(o),{statusCode:500,body:JSON.stringify(o)}):{statusCode:200,body:JSON.stringify(n)}}catch(e){throw console.error(e),e}}},,,,function(e,t,r){"use strict";r.r(t),r.d(t,"handler",(function(){return n}));var o=r(5);const n=async(e,t)=>{const{user:r}=t.clientContext;if(!r)return{statusCode:403};const{exerciseId:n,date:s}=JSON.parse(e.body||"{}");return Object(o.a)({query:"\n\t\tquery getExeciseHistory($id: Int!, $date: timestamptz!, $userId: String!) {\n\t\t\tsessions(limit: 1, where: {userId: {_eq: $userId}, performances: {exerciseInstances: {exerciseId: {_eq: $id}}}, date: {_lt: $date}}, order_by: {date: desc}) {\n\t\t\t  date\n\t\t\t  performances(where: {exerciseInstances: {exerciseId: {_eq: $id}}}) {\n\t\t\t\texerciseInstances(where: {exerciseId: {_eq: $id}}) {\n\t\t\t\t  executions\n\t\t\t\t  exercise {\n\t\t\t\t\tname\n\t\t\t\t\tid\n\t\t\t\t  }\n\t\t\t\t}\n\t\t\t  }\n\t\t\t}\n\t\t  }\n\t\t",variables:{id:n,date:s,userId:r.sub}})}}]));