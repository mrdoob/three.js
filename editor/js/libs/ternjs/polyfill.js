// Shims to fill in enough of ECMAScript 5 to make Tern run. Does not
// supply standard-compliant methods, in that some functionality is
// left out (such as second argument to Object.create, self args in
// array methods, etc). WILL clash with other ECMA5 polyfills in a
// probably disruptive way.

(function() {
  Object.create = Object.create || (function() {
    if (!({__proto__: null} instanceof Object))
      return function(base) { return {__proto__: base}; };
    function ctor() {}
    var frame = document.body.appendChild(document.createElement("iframe"));
    frame.src = "javascript:";
    var empty = frame.contentWindow.Object.prototype;
    delete empty.hasOwnProperty;
    delete empty.isPrototypeOf;
    delete empty.propertyIsEnumerable;
    delete empty.valueOf;
    delete empty.toString;
    delete empty.toLocaleString;
    delete empty.constructor;
    return function(base) { ctor.prototype = base || empty; return new ctor(); };
  })();

  // Array methods

  var AP = Array.prototype;

  AP.some = AP.some || function(pred) {
    for (var i = 0; i < this.length; ++i) if (pred(this[i], i)) return true;
  };

  AP.forEach = AP.forEach || function(f) {
    for (var i = 0; i < this.length; ++i) f(this[i], i);
  };

  AP.indexOf = AP.indexOf || function(x, start) {
    for (var i = start || 0; i < this.length; ++i) if (this[i] === x) return i;
    return -1;
  };

  AP.lastIndexOf = AP.lastIndexOf || function(x, start) {
    for (var i = start == null ? this.length - 1 : start; i >= 0; ++i) if (this[i] === x) return i;
    return -1;
  };

  AP.map = AP.map || function(f) {
    for (var r = [], i = 0; i < this.length; ++i) r.push(f(this[i], i));
    return r;
  };

  Array.isArray = Array.isArray || function(v) {
    return Object.prototype.toString.call(v) == "[object Array]";
  };

  String.prototype.trim = String.prototype.trim || function() {
    var from = 0, to = this.length;
    while (/\s/.test(this.charAt(from))) ++from;
    while (/\s/.test(this.charAt(to - 1))) --to;
    return this.slice(from, to);
  };

/*! JSON v3.2.4 | http://bestiejs.github.com/json3 | Copyright 2012, Kit Cambridge | http://kit.mit-license.org */
if (!window.JSON) (function(){var e=void 0,i=!0,k=null,l={}.toString,m,n,p="function"===typeof define&&define.c,q=!p&&"object"==typeof exports&&exports;q||p?"object"==typeof JSON&&JSON?p?q=JSON:(q.stringify=JSON.stringify,q.parse=JSON.parse):p&&(q=this.JSON={}):q=this.JSON||(this.JSON={});var r,t,u,x,z,B,C,D,E,F,G,H,I,J=new Date(-3509827334573292),K,O,P;try{J=-109252==J.getUTCFullYear()&&0===J.getUTCMonth()&&1==J.getUTCDate()&&10==J.getUTCHours()&&37==J.getUTCMinutes()&&6==J.getUTCSeconds()&&708==J.getUTCMilliseconds()}catch(Q){}
function R(b){var c,a,d,j=b=="json";if(j||b=="json-stringify"||b=="json-parse"){if(b=="json-stringify"||j){if(c=typeof q.stringify=="function"&&J){(d=function(){return 1}).toJSON=d;try{c=q.stringify(0)==="0"&&q.stringify(new Number)==="0"&&q.stringify(new String)=='""'&&q.stringify(l)===e&&q.stringify(e)===e&&q.stringify()===e&&q.stringify(d)==="1"&&q.stringify([d])=="[1]"&&q.stringify([e])=="[null]"&&q.stringify(k)=="null"&&q.stringify([e,l,k])=="[null,null,null]"&&q.stringify({A:[d,i,false,k,"\x00\u0008\n\u000c\r\t"]})==
'{"A":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}'&&q.stringify(k,d)==="1"&&q.stringify([1,2],k,1)=="[\n 1,\n 2\n]"&&q.stringify(new Date(-864E13))=='"-271821-04-20T00:00:00.000Z"'&&q.stringify(new Date(864E13))=='"+275760-09-13T00:00:00.000Z"'&&q.stringify(new Date(-621987552E5))=='"-000001-01-01T00:00:00.000Z"'&&q.stringify(new Date(-1))=='"1969-12-31T23:59:59.999Z"'}catch(f){c=false}}if(!j)return c}if(b=="json-parse"||j){if(typeof q.parse=="function")try{if(q.parse("0")===0&&!q.parse(false)){d=
q.parse('{"A":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}');if(a=d.a.length==5&&d.a[0]==1){try{a=!q.parse('"\t"')}catch(o){}if(a)try{a=q.parse("01")!=1}catch(g){}}}}catch(h){a=false}if(!j)return a}return c&&a}}
if(!R("json")){J||(K=Math.floor,O=[0,31,59,90,120,151,181,212,243,273,304,334],P=function(b,c){return O[c]+365*(b-1970)+K((b-1969+(c=+(c>1)))/4)-K((b-1901+c)/100)+K((b-1601+c)/400)});if(!(m={}.hasOwnProperty))m=function(b){var c={},a;if((c.__proto__=k,c.__proto__={toString:1},c).toString!=l)m=function(a){var b=this.__proto__,a=a in(this.__proto__=k,this);this.__proto__=b;return a};else{a=c.constructor;m=function(b){var c=(this.constructor||a).prototype;return b in this&&!(b in c&&this[b]===c[b])}}c=
k;return m.call(this,b)};n=function(b,c){var a=0,d,j,f;(d=function(){this.valueOf=0}).prototype.valueOf=0;j=new d;for(f in j)m.call(j,f)&&a++;d=j=k;if(a)a=a==2?function(a,b){var c={},d=l.call(a)=="[object Function]",f;for(f in a)!(d&&f=="prototype")&&!m.call(c,f)&&(c[f]=1)&&m.call(a,f)&&b(f)}:function(a,b){var c=l.call(a)=="[object Function]",d,f;for(d in a)!(c&&d=="prototype")&&m.call(a,d)&&!(f=d==="constructor")&&b(d);(f||m.call(a,d="constructor"))&&b(d)};else{j=["valueOf","toString","toLocaleString",
"propertyIsEnumerable","isPrototypeOf","hasOwnProperty","constructor"];a=function(a,b){var c=l.call(a)=="[object Function]",d;for(d in a)!(c&&d=="prototype")&&m.call(a,d)&&b(d);for(c=j.length;d=j[--c];m.call(a,d)&&b(d));}}a(b,c)};R("json-stringify")||(r={"\\":"\\\\",'"':'\\"',"\u0008":"\\b","\u000c":"\\f","\n":"\\n","\r":"\\r","\t":"\\t"},t=function(b,c){return("000000"+(c||0)).slice(-b)},u=function(b){for(var c='"',a=0,d;d=b.charAt(a);a++)c=c+('\\"\u0008\u000c\n\r\t'.indexOf(d)>-1?r[d]:r[d]=d<" "?
"\\u00"+t(2,d.charCodeAt(0).toString(16)):d);return c+'"'},x=function(b,c,a,d,j,f,o){var g=c[b],h,s,v,w,L,M,N,y,A;if(typeof g=="object"&&g){h=l.call(g);if(h=="[object Date]"&&!m.call(g,"toJSON"))if(g>-1/0&&g<1/0){if(P){v=K(g/864E5);for(h=K(v/365.2425)+1970-1;P(h+1,0)<=v;h++);for(s=K((v-P(h,0))/30.42);P(h,s+1)<=v;s++);v=1+v-P(h,s);w=(g%864E5+864E5)%864E5;L=K(w/36E5)%24;M=K(w/6E4)%60;N=K(w/1E3)%60;w=w%1E3}else{h=g.getUTCFullYear();s=g.getUTCMonth();v=g.getUTCDate();L=g.getUTCHours();M=g.getUTCMinutes();
N=g.getUTCSeconds();w=g.getUTCMilliseconds()}g=(h<=0||h>=1E4?(h<0?"-":"+")+t(6,h<0?-h:h):t(4,h))+"-"+t(2,s+1)+"-"+t(2,v)+"T"+t(2,L)+":"+t(2,M)+":"+t(2,N)+"."+t(3,w)+"Z"}else g=k;else if(typeof g.toJSON=="function"&&(h!="[object Number]"&&h!="[object String]"&&h!="[object Array]"||m.call(g,"toJSON")))g=g.toJSON(b)}a&&(g=a.call(c,b,g));if(g===k)return"null";h=l.call(g);if(h=="[object Boolean]")return""+g;if(h=="[object Number]")return g>-1/0&&g<1/0?""+g:"null";if(h=="[object String]")return u(g);if(typeof g==
"object"){for(b=o.length;b--;)if(o[b]===g)throw TypeError();o.push(g);y=[];c=f;f=f+j;if(h=="[object Array]"){s=0;for(b=g.length;s<b;A||(A=i),s++){h=x(s,g,a,d,j,f,o);y.push(h===e?"null":h)}b=A?j?"[\n"+f+y.join(",\n"+f)+"\n"+c+"]":"["+y.join(",")+"]":"[]"}else{n(d||g,function(b){var c=x(b,g,a,d,j,f,o);c!==e&&y.push(u(b)+":"+(j?" ":"")+c);A||(A=i)});b=A?j?"{\n"+f+y.join(",\n"+f)+"\n"+c+"}":"{"+y.join(",")+"}":"{}"}o.pop();return b}},q.stringify=function(b,c,a){var d,j,f,o,g,h;if(typeof c=="function"||
typeof c=="object"&&c)if(l.call(c)=="[object Function]")j=c;else if(l.call(c)=="[object Array]"){f={};o=0;for(g=c.length;o<g;h=c[o++],(l.call(h)=="[object String]"||l.call(h)=="[object Number]")&&(f[h]=1));}if(a)if(l.call(a)=="[object Number]"){if((a=a-a%1)>0){d="";for(a>10&&(a=10);d.length<a;d=d+" ");}}else l.call(a)=="[object String]"&&(d=a.length<=10?a:a.slice(0,10));return x("",(h={},h[""]=b,h),j,f,d,"",[])});R("json-parse")||(z=String.fromCharCode,B={"\\":"\\",'"':'"',"/":"/",b:"\u0008",t:"\t",
n:"\n",f:"\u000c",r:"\r"},C=function(){H=I=k;throw SyntaxError();},D=function(){for(var b=I,c=b.length,a,d,j,f,o;H<c;){a=b.charAt(H);if("\t\r\n ".indexOf(a)>-1)H++;else{if("{}[]:,".indexOf(a)>-1){H++;return a}if(a=='"'){d="@";for(H++;H<c;){a=b.charAt(H);if(a<" ")C();else if(a=="\\"){a=b.charAt(++H);if('\\"/btnfr'.indexOf(a)>-1){d=d+B[a];H++}else if(a=="u"){j=++H;for(f=H+4;H<f;H++){a=b.charAt(H);a>="0"&&a<="9"||a>="a"&&a<="f"||a>="A"&&a<="F"||C()}d=d+z("0x"+b.slice(j,H))}else C()}else{if(a=='"')break;
d=d+a;H++}}if(b.charAt(H)=='"'){H++;return d}}else{j=H;if(a=="-"){o=i;a=b.charAt(++H)}if(a>="0"&&a<="9"){for(a=="0"&&(a=b.charAt(H+1),a>="0"&&a<="9")&&C();H<c&&(a=b.charAt(H),a>="0"&&a<="9");H++);if(b.charAt(H)=="."){for(f=++H;f<c&&(a=b.charAt(f),a>="0"&&a<="9");f++);f==H&&C();H=f}a=b.charAt(H);if(a=="e"||a=="E"){a=b.charAt(++H);(a=="+"||a=="-")&&H++;for(f=H;f<c&&(a=b.charAt(f),a>="0"&&a<="9");f++);f==H&&C();H=f}return+b.slice(j,H)}o&&C();if(b.slice(H,H+4)=="true"){H=H+4;return i}if(b.slice(H,H+5)==
"false"){H=H+5;return false}if(b.slice(H,H+4)=="null"){H=H+4;return k}}C()}}return"$"},E=function(b){var c,a;b=="$"&&C();if(typeof b=="string"){if(b.charAt(0)=="@")return b.slice(1);if(b=="["){for(c=[];;a||(a=i)){b=D();if(b=="]")break;if(a)if(b==","){b=D();b=="]"&&C()}else C();b==","&&C();c.push(E(b))}return c}if(b=="{"){for(c={};;a||(a=i)){b=D();if(b=="}")break;if(a)if(b==","){b=D();b=="}"&&C()}else C();(b==","||typeof b!="string"||b.charAt(0)!="@"||D()!=":")&&C();c[b.slice(1)]=E(D())}return c}C()}return b},
G=function(b,c,a){a=F(b,c,a);a===e?delete b[c]:b[c]=a},F=function(b,c,a){var d=b[c],j;if(typeof d=="object"&&d)if(l.call(d)=="[object Array]")for(j=d.length;j--;)G(d,j,a);else n(d,function(b){G(d,b,a)});return a.call(b,c,d)},q.parse=function(b,c){var a,d;H=0;I=b;a=E(D());D()!="$"&&C();H=I=k;return c&&l.call(c)=="[object Function]"?F((d={},d[""]=a,d),"",c):a})}p&&define(function(){return q});
}());
})();
