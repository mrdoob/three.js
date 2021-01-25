
var Module = (function() {
  var _scriptDir = typeof document !== 'undefined' && document.currentScript ? document.currentScript.src : undefined;
  
  return (
function(Module) {
  Module = Module || {};

var c;c||(c=typeof Module !== 'undefined' ? Module : {});
c.compileGLSLZeroCopy=function(a,b,d,e){d=!!d;switch(b){case "vertex":var g=0;break;case "fragment":g=4;break;case "compute":g=5;break;default:throw Error("shader_stage must be 'vertex', 'fragment', or 'compute'.");}switch(e||"1.0"){case "1.0":var f=65536;break;case "1.1":f=65792;break;case "1.2":f=66048;break;case "1.3":f=66304;break;case "1.4":f=66560;break;case "1.5":f=66816;break;default:throw Error("spirv_version must be '1.0' ~ '1.5'.");}e=c._malloc(4);b=c._malloc(4);var h=aa([a,g,d,f,e,b]);
d=k(e);a=k(b);c._free(e);c._free(b);if(0===h)throw Error("GLSL compilation failed");e={};d/=4;e.data=c.HEAPU32.subarray(d,d+a);e.free=function(){c._destroy_output_buffer(h)};return e};c.compileGLSL=function(a,b,d,e){a=c.compileGLSLZeroCopy(a,b,d,e);b=a.data.slice();a.free();return b};var p={},q;for(q in c)c.hasOwnProperty(q)&&(p[q]=c[q]);var r="./this.program",t=!1,u=!1;t="object"===typeof window;u="function"===typeof importScripts;var v="",w;
if(t||u)u?v=self.location.href:document.currentScript&&(v=document.currentScript.src),_scriptDir&&(v=_scriptDir),0!==v.indexOf("blob:")?v=v.substr(0,v.lastIndexOf("/")+1):v="",u&&(w=function(a){var b=new XMLHttpRequest;b.open("GET",a,!1);b.responseType="arraybuffer";b.send(null);return new Uint8Array(b.response)});var x=c.print||console.log.bind(console),y=c.printErr||console.warn.bind(console);for(q in p)p.hasOwnProperty(q)&&(c[q]=p[q]);p=null;c.thisProgram&&(r=c.thisProgram);var A;
c.wasmBinary&&(A=c.wasmBinary);"object"!==typeof WebAssembly&&y("no native wasm support detected");function k(a){var b="i32";"*"===b.charAt(b.length-1)&&(b="i32");switch(b){case "i1":return B[a>>0];case "i8":return B[a>>0];case "i16":return ba[a>>1];case "i32":return C[a>>2];case "i64":return C[a>>2];case "float":return ca[a>>2];case "double":return da[a>>3];default:D("invalid type for getValue: "+b)}return null}var E,ea=new WebAssembly.Table({initial:859,maximum:859,element:"anyfunc"}),fa=!1;
function ha(){var a=c._convert_glsl_to_spirv;a||D("Assertion failed: Cannot call unknown function convert_glsl_to_spirv, make sure it is exported");return a}
function aa(a){var b="string number boolean number number number".split(" "),d={string:function(a){var b=0;if(null!==a&&void 0!==a&&0!==a){var d=(a.length<<2)+1;b=G(d);ia(a,H,b,d)}return b},array:function(a){var b=G(a.length);B.set(a,b);return b}},e=ha(),g=[],f=0;if(a)for(var h=0;h<a.length;h++){var n=d[b[h]];n?(0===f&&(f=ja()),g[h]=n(a[h])):g[h]=a[h]}a=e.apply(null,g);0!==f&&ka(f);return a}var la="undefined"!==typeof TextDecoder?new TextDecoder("utf8"):void 0;
function I(a,b,d){var e=b+d;for(d=b;a[d]&&!(d>=e);)++d;if(16<d-b&&a.subarray&&la)return la.decode(a.subarray(b,d));for(e="";b<d;){var g=a[b++];if(g&128){var f=a[b++]&63;if(192==(g&224))e+=String.fromCharCode((g&31)<<6|f);else{var h=a[b++]&63;g=224==(g&240)?(g&15)<<12|f<<6|h:(g&7)<<18|f<<12|h<<6|a[b++]&63;65536>g?e+=String.fromCharCode(g):(g-=65536,e+=String.fromCharCode(55296|g>>10,56320|g&1023))}}else e+=String.fromCharCode(g)}return e}
function ia(a,b,d,e){if(0<e){e=d+e-1;for(var g=0;g<a.length;++g){var f=a.charCodeAt(g);if(55296<=f&&57343>=f){var h=a.charCodeAt(++g);f=65536+((f&1023)<<10)|h&1023}if(127>=f){if(d>=e)break;b[d++]=f}else{if(2047>=f){if(d+1>=e)break;b[d++]=192|f>>6}else{if(65535>=f){if(d+2>=e)break;b[d++]=224|f>>12}else{if(d+3>=e)break;b[d++]=240|f>>18;b[d++]=128|f>>12&63}b[d++]=128|f>>6&63}b[d++]=128|f&63}}b[d]=0}}"undefined"!==typeof TextDecoder&&new TextDecoder("utf-16le");var J,B,H,ba,C,ca,da;
function ma(a){J=a;c.HEAP8=B=new Int8Array(a);c.HEAP16=ba=new Int16Array(a);c.HEAP32=C=new Int32Array(a);c.HEAPU8=H=new Uint8Array(a);c.HEAPU16=new Uint16Array(a);c.HEAPU32=new Uint32Array(a);c.HEAPF32=ca=new Float32Array(a);c.HEAPF64=da=new Float64Array(a)}var na=c.TOTAL_MEMORY||16777216;c.wasmMemory?E=c.wasmMemory:E=new WebAssembly.Memory({initial:na/65536});E&&(J=E.buffer);na=J.byteLength;ma(J);C[84916]=5582704;
function K(a){for(;0<a.length;){var b=a.shift();if("function"==typeof b)b();else{var d=b.J;"number"===typeof d?void 0===b.H?c.dynCall_v(d):c.dynCall_vi(d,b.H):d(void 0===b.H?null:b.H)}}}var oa=[],pa=[],qa=[],ra=[];function sa(){var a=c.preRun.shift();oa.unshift(a)}var L=0,M=null,N=null;c.preloadedImages={};c.preloadedAudios={};function D(a){if(c.onAbort)c.onAbort(a);x(a);y(a);fa=!0;throw new WebAssembly.RuntimeError("abort("+a+"). Build with -s ASSERTIONS=1 for more info.");}
function ta(){var a=O;return String.prototype.startsWith?a.startsWith("data:application/octet-stream;base64,"):0===a.indexOf("data:application/octet-stream;base64,")}var O="glslang.wasm";if(!ta()){var ua=O;O=c.locateFile?c.locateFile(ua,v):v+ua}function wa(){try{if(A)return new Uint8Array(A);if(w)return w(O);throw"both async and sync fetching of the wasm failed";}catch(a){D(a)}}
function xa(){return A||!t&&!u||"function"!==typeof fetch?new Promise(function(a){a(wa())}):fetch(O,{credentials:"same-origin"}).then(function(a){if(!a.ok)throw"failed to load wasm binary file at '"+O+"'";return a.arrayBuffer()}).catch(function(){return wa()})}pa.push({J:function(){ya()}});var za=[null,[],[]],P=0;function Aa(){P+=4;return C[P-4>>2]}var Q={},Ba={};
function Ca(){if(!R){var a={USER:"web_user",LOGNAME:"web_user",PATH:"/",PWD:"/",HOME:"/home/web_user",LANG:("object"===typeof navigator&&navigator.languages&&navigator.languages[0]||"C").replace("-","_")+".UTF-8",_:r},b;for(b in Ba)a[b]=Ba[b];var d=[];for(b in a)d.push(b+"="+a[b]);R=d}return R}var R;function S(a){return 0===a%4&&(0!==a%100||0===a%400)}function T(a,b){for(var d=0,e=0;e<=b;d+=a[e++]);return d}var U=[31,29,31,30,31,30,31,31,30,31,30,31],W=[31,28,31,30,31,30,31,31,30,31,30,31];
function X(a,b){for(a=new Date(a.getTime());0<b;){var d=a.getMonth(),e=(S(a.getFullYear())?U:W)[d];if(b>e-a.getDate())b-=e-a.getDate()+1,a.setDate(1),11>d?a.setMonth(d+1):(a.setMonth(0),a.setFullYear(a.getFullYear()+1));else{a.setDate(a.getDate()+b);break}}return a}
function Da(a,b,d,e){function g(a,b,d){for(a="number"===typeof a?a.toString():a||"";a.length<b;)a=d[0]+a;return a}function f(a,b){return g(a,b,"0")}function h(a,b){function V(a){return 0>a?-1:0<a?1:0}var d;0===(d=V(a.getFullYear()-b.getFullYear()))&&0===(d=V(a.getMonth()-b.getMonth()))&&(d=V(a.getDate()-b.getDate()));return d}function n(a){switch(a.getDay()){case 0:return new Date(a.getFullYear()-1,11,29);case 1:return a;case 2:return new Date(a.getFullYear(),0,3);case 3:return new Date(a.getFullYear(),
0,2);case 4:return new Date(a.getFullYear(),0,1);case 5:return new Date(a.getFullYear()-1,11,31);case 6:return new Date(a.getFullYear()-1,11,30)}}function z(a){a=X(new Date(a.A+1900,0,1),a.G);var b=n(new Date(a.getFullYear()+1,0,4));return 0>=h(n(new Date(a.getFullYear(),0,4)),a)?0>=h(b,a)?a.getFullYear()+1:a.getFullYear():a.getFullYear()-1}var m=C[e+40>>2];e={N:C[e>>2],M:C[e+4>>2],D:C[e+8>>2],C:C[e+12>>2],B:C[e+16>>2],A:C[e+20>>2],F:C[e+24>>2],G:C[e+28>>2],X:C[e+32>>2],L:C[e+36>>2],O:m?m?I(H,m,void 0):
"":""};d=d?I(H,d,void 0):"";m={"%c":"%a %b %d %H:%M:%S %Y","%D":"%m/%d/%y","%F":"%Y-%m-%d","%h":"%b","%r":"%I:%M:%S %p","%R":"%H:%M","%T":"%H:%M:%S","%x":"%m/%d/%y","%X":"%H:%M:%S","%Ec":"%c","%EC":"%C","%Ex":"%m/%d/%y","%EX":"%H:%M:%S","%Ey":"%y","%EY":"%Y","%Od":"%d","%Oe":"%e","%OH":"%H","%OI":"%I","%Om":"%m","%OM":"%M","%OS":"%S","%Ou":"%u","%OU":"%U","%OV":"%V","%Ow":"%w","%OW":"%W","%Oy":"%y"};for(var l in m)d=d.replace(new RegExp(l,"g"),m[l]);var F="Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "),
va="January February March April May June July August September October November December".split(" ");m={"%a":function(a){return F[a.F].substring(0,3)},"%A":function(a){return F[a.F]},"%b":function(a){return va[a.B].substring(0,3)},"%B":function(a){return va[a.B]},"%C":function(a){return f((a.A+1900)/100|0,2)},"%d":function(a){return f(a.C,2)},"%e":function(a){return g(a.C,2," ")},"%g":function(a){return z(a).toString().substring(2)},"%G":function(a){return z(a)},"%H":function(a){return f(a.D,2)},
"%I":function(a){a=a.D;0==a?a=12:12<a&&(a-=12);return f(a,2)},"%j":function(a){return f(a.C+T(S(a.A+1900)?U:W,a.B-1),3)},"%m":function(a){return f(a.B+1,2)},"%M":function(a){return f(a.M,2)},"%n":function(){return"\n"},"%p":function(a){return 0<=a.D&&12>a.D?"AM":"PM"},"%S":function(a){return f(a.N,2)},"%t":function(){return"\t"},"%u":function(a){return a.F||7},"%U":function(a){var b=new Date(a.A+1900,0,1),d=0===b.getDay()?b:X(b,7-b.getDay());a=new Date(a.A+1900,a.B,a.C);return 0>h(d,a)?f(Math.ceil((31-
d.getDate()+(T(S(a.getFullYear())?U:W,a.getMonth()-1)-31)+a.getDate())/7),2):0===h(d,b)?"01":"00"},"%V":function(a){var b=n(new Date(a.A+1900,0,4)),d=n(new Date(a.A+1901,0,4)),e=X(new Date(a.A+1900,0,1),a.G);return 0>h(e,b)?"53":0>=h(d,e)?"01":f(Math.ceil((b.getFullYear()<a.A+1900?a.G+32-b.getDate():a.G+1-b.getDate())/7),2)},"%w":function(a){return a.F},"%W":function(a){var b=new Date(a.A,0,1),d=1===b.getDay()?b:X(b,0===b.getDay()?1:7-b.getDay()+1);a=new Date(a.A+1900,a.B,a.C);return 0>h(d,a)?f(Math.ceil((31-
d.getDate()+(T(S(a.getFullYear())?U:W,a.getMonth()-1)-31)+a.getDate())/7),2):0===h(d,b)?"01":"00"},"%y":function(a){return(a.A+1900).toString().substring(2)},"%Y":function(a){return a.A+1900},"%z":function(a){a=a.L;var b=0<=a;a=Math.abs(a)/60;return(b?"+":"-")+String("0000"+(a/60*100+a%60)).slice(-4)},"%Z":function(a){return a.O},"%%":function(){return"%"}};for(l in m)0<=d.indexOf(l)&&(d=d.replace(new RegExp(l,"g"),m[l](e)));l=Ea(d);if(l.length>b)return 0;B.set(l,a);return l.length-1}
function Ea(a){for(var b=0,d=0;d<a.length;++d){var e=a.charCodeAt(d);55296<=e&&57343>=e&&(e=65536+((e&1023)<<10)|a.charCodeAt(++d)&1023);127>=e?++b:b=2047>=e?b+2:65535>=e?b+3:b+4}b=Array(b+1);ia(a,b,0,b.length);return b}
var Ga={f:function(){},c:function(){c.___errno_location&&(C[c.___errno_location()>>2]=63);return-1},n:function(a,b){P=b;try{var d=Aa();var e=Aa();if(-1===d||0===e)var g=-28;else{var f=Q.K[d];if(f&&e===f.U){var h=(void 0).T(f.S);Q.R(d,h,e,f.flags,f.offset);(void 0).W(h);Q.K[d]=null;f.P&&Fa(f.V)}g=0}return g}catch(n){return D(n),-n.I}},a:function(){},b:function(){D()},k:function(a,b,d){H.set(H.subarray(b,b+d),a)},l:function(a){var b=B.length;if(2147418112<a)return!1;for(var d=1;4>=d;d*=2){var e=b*(1+
.2/d);e=Math.min(e,a+100663296);e=Math.max(16777216,a,e);0<e%65536&&(e+=65536-e%65536);a:{try{E.grow(Math.min(2147418112,e)-J.byteLength+65535>>16);ma(E.buffer);var g=1;break a}catch(f){}g=void 0}if(g)return!0}return!1},d:function(a,b){var d=0;Ca().forEach(function(e,g){var f=b+d;g=C[a+4*g>>2]=f;for(f=0;f<e.length;++f)B[g++>>0]=e.charCodeAt(f);B[g>>0]=0;d+=e.length+1});return 0},e:function(a,b){var d=Ca();C[a>>2]=d.length;var e=0;d.forEach(function(a){e+=a.length+1});C[b>>2]=e;return 0},h:function(){return 0},
j:function(){return 0},g:function(a,b,d,e){try{for(var g=0,f=0;f<d;f++){for(var h=C[b+8*f>>2],n=C[b+(8*f+4)>>2],z=0;z<n;z++){var m=H[h+z],l=za[a];0===m||10===m?((1===a?x:y)(I(l,0)),l.length=0):l.push(m)}g+=n}C[e>>2]=g;return 0}catch(F){return D(F),F.I}},memory:E,o:function(){},i:function(){},m:function(a,b,d,e){return Da(a,b,d,e)},table:ea},Ha=function(){function a(a){c.asm=a.exports;L--;c.monitorRunDependencies&&c.monitorRunDependencies(L);0==L&&(null!==M&&(clearInterval(M),M=null),N&&(a=N,N=null,
a()))}function b(b){a(b.instance)}function d(a){return xa().then(function(a){return WebAssembly.instantiate(a,e)}).then(a,function(a){y("failed to asynchronously prepare wasm: "+a);D(a)})}var e={env:Ga,wasi_snapshot_preview1:Ga};L++;c.monitorRunDependencies&&c.monitorRunDependencies(L);if(c.instantiateWasm)try{return c.instantiateWasm(e,a)}catch(g){return y("Module.instantiateWasm callback failed with error: "+g),!1}(function(){if(A||"function"!==typeof WebAssembly.instantiateStreaming||ta()||"function"!==
typeof fetch)return d(b);fetch(O,{credentials:"same-origin"}).then(function(a){return WebAssembly.instantiateStreaming(a,e).then(b,function(a){y("wasm streaming compile failed: "+a);y("falling back to ArrayBuffer instantiation");d(b)})})})();return{}}();c.asm=Ha;var ya=c.___wasm_call_ctors=function(){return(ya=c.___wasm_call_ctors=c.asm.p).apply(null,arguments)};c._convert_glsl_to_spirv=function(){return(c._convert_glsl_to_spirv=c.asm.q).apply(null,arguments)};
c._destroy_output_buffer=function(){return(c._destroy_output_buffer=c.asm.r).apply(null,arguments)};c._malloc=function(){return(c._malloc=c.asm.s).apply(null,arguments)};var Fa=c._free=function(){return(Fa=c._free=c.asm.t).apply(null,arguments)},ja=c.stackSave=function(){return(ja=c.stackSave=c.asm.u).apply(null,arguments)},G=c.stackAlloc=function(){return(G=c.stackAlloc=c.asm.v).apply(null,arguments)},ka=c.stackRestore=function(){return(ka=c.stackRestore=c.asm.w).apply(null,arguments)};
c.dynCall_vi=function(){return(c.dynCall_vi=c.asm.x).apply(null,arguments)};c.dynCall_v=function(){return(c.dynCall_v=c.asm.y).apply(null,arguments)};c.asm=Ha;var Y;c.then=function(a){if(Y)a(c);else{var b=c.onRuntimeInitialized;c.onRuntimeInitialized=function(){b&&b();a(c)}}return c};N=function Ia(){Y||Z();Y||(N=Ia)};
function Z(){function a(){if(!Y&&(Y=!0,!fa)){K(pa);K(qa);if(c.onRuntimeInitialized)c.onRuntimeInitialized();if(c.postRun)for("function"==typeof c.postRun&&(c.postRun=[c.postRun]);c.postRun.length;){var a=c.postRun.shift();ra.unshift(a)}K(ra)}}if(!(0<L)){if(c.preRun)for("function"==typeof c.preRun&&(c.preRun=[c.preRun]);c.preRun.length;)sa();K(oa);0<L||(c.setStatus?(c.setStatus("Running..."),setTimeout(function(){setTimeout(function(){c.setStatus("")},1);a()},1)):a())}}c.run=Z;
if(c.preInit)for("function"==typeof c.preInit&&(c.preInit=[c.preInit]);0<c.preInit.length;)c.preInit.pop()();Z();


  return Module
}
);
})();
if (typeof exports === 'object' && typeof module === 'object')
      module.exports = Module;
    else if (typeof define === 'function' && define['amd'])
      define([], function() { return Module; });
    else if (typeof exports === 'object')
      exports["Module"] = Module;
    export default (() => {
    const initialize = () => {
        return new Promise(resolve => {
            Module({
                locateFile() {
                    const i = import.meta.url.lastIndexOf('/')
                    return import.meta.url.substring(0, i) + '/glslang.wasm';
                },
                onRuntimeInitialized() {
                    resolve({
                        compileGLSLZeroCopy: this.compileGLSLZeroCopy,
                        compileGLSL: this.compileGLSL,
                    });
                },
            });
        });
    };

    let instance;
    return () => {
        if (!instance) {
            instance = initialize();
        }
        return instance;
    };
})();
