/* ES Module Shims 1.8.0 */
(function () {

  const hasWindow = typeof window !== 'undefined';
  const hasDocument = typeof document !== 'undefined';

  const noop = () => {};

  const optionsScript = hasDocument ? document.querySelector('script[type=esms-options]') : undefined;

  const esmsInitOptions = optionsScript ? JSON.parse(optionsScript.innerHTML) : {};
  Object.assign(esmsInitOptions, self.esmsInitOptions || {});

  let shimMode = hasDocument ? !!esmsInitOptions.shimMode : true;

  const importHook = globalHook(shimMode && esmsInitOptions.onimport);
  const resolveHook = globalHook(shimMode && esmsInitOptions.resolve);
  let fetchHook = esmsInitOptions.fetch ? globalHook(esmsInitOptions.fetch) : fetch;
  const metaHook = esmsInitOptions.meta ? globalHook(shimMode && esmsInitOptions.meta) : noop;

  const mapOverrides = esmsInitOptions.mapOverrides;

  let nonce = esmsInitOptions.nonce;
  if (!nonce && hasDocument) {
    const nonceElement = document.querySelector('script[nonce]');
    if (nonceElement)
      nonce = nonceElement.nonce || nonceElement.getAttribute('nonce');
  }

  const onerror = globalHook(esmsInitOptions.onerror || noop);
  const onpolyfill = esmsInitOptions.onpolyfill ? globalHook(esmsInitOptions.onpolyfill) : () => {
    console.log('%c^^ Module TypeError above is polyfilled and can be ignored ^^', 'font-weight:900;color:#391');
  };

  const { revokeBlobURLs, noLoadEventRetriggers, enforceIntegrity } = esmsInitOptions;

  function globalHook (name) {
    return typeof name === 'string' ? self[name] : name;
  }

  const enable = Array.isArray(esmsInitOptions.polyfillEnable) ? esmsInitOptions.polyfillEnable : [];
  const cssModulesEnabled = enable.includes('css-modules');
  const jsonModulesEnabled = enable.includes('json-modules');

  const edge = !navigator.userAgentData && !!navigator.userAgent.match(/Edge\/\d+\.\d+/);

  const baseUrl = hasDocument
    ? document.baseURI
    : `${location.protocol}//${location.host}${location.pathname.includes('/') 
    ? location.pathname.slice(0, location.pathname.lastIndexOf('/') + 1) 
    : location.pathname}`;

  const createBlob = (source, type = 'text/javascript') => URL.createObjectURL(new Blob([source], { type }));
  let { skip } = esmsInitOptions;
  if (Array.isArray(skip)) {
    const l = skip.map(s => new URL(s, baseUrl).href);
    skip = s => l.some(i => i[i.length - 1] === '/' && s.startsWith(i) || s === i);
  }
  else if (typeof skip === 'string') {
    const r = new RegExp(skip);
    skip = s => r.test(s);
  }

  const eoop = err => setTimeout(() => { throw err });

  const throwError = err => { (self.reportError || hasWindow && window.safari && console.error || eoop)(err), void onerror(err); };

  function fromParent (parent) {
    return parent ? ` imported from ${parent}` : '';
  }

  let importMapSrcOrLazy = false;

  function setImportMapSrcOrLazy () {
    importMapSrcOrLazy = true;
  }

  // shim mode is determined on initialization, no late shim mode
  if (!shimMode) {
    if (document.querySelectorAll('script[type=module-shim],script[type=importmap-shim],link[rel=modulepreload-shim]').length) {
      shimMode = true;
    }
    else {
      let seenScript = false;
      for (const script of document.querySelectorAll('script[type=module],script[type=importmap]')) {
        if (!seenScript) {
          if (script.type === 'module' && !script.ep)
            seenScript = true;
        }
        else if (script.type === 'importmap' && seenScript) {
          importMapSrcOrLazy = true;
          break;
        }
      }
    }
  }

  const backslashRegEx = /\\/g;

  function isURL (url) {
    if (url.indexOf(':') === -1) return false;
    try {
      new URL(url);
      return true;
    }
    catch (_) {
      return false;
    }
  }

  function resolveUrl (relUrl, parentUrl) {
    return resolveIfNotPlainOrUrl(relUrl, parentUrl) || (isURL(relUrl) ? relUrl : resolveIfNotPlainOrUrl('./' + relUrl, parentUrl));
  }

  function resolveIfNotPlainOrUrl (relUrl, parentUrl) {
    const hIdx = parentUrl.indexOf('#'), qIdx = parentUrl.indexOf('?');
    if (hIdx + qIdx > -2)
      parentUrl = parentUrl.slice(0, hIdx === -1 ? qIdx : qIdx === -1 || qIdx > hIdx ? hIdx : qIdx);
    if (relUrl.indexOf('\\') !== -1)
      relUrl = relUrl.replace(backslashRegEx, '/');
    // protocol-relative
    if (relUrl[0] === '/' && relUrl[1] === '/') {
      return parentUrl.slice(0, parentUrl.indexOf(':') + 1) + relUrl;
    }
    // relative-url
    else if (relUrl[0] === '.' && (relUrl[1] === '/' || relUrl[1] === '.' && (relUrl[2] === '/' || relUrl.length === 2 && (relUrl += '/')) ||
        relUrl.length === 1  && (relUrl += '/')) ||
        relUrl[0] === '/') {
      const parentProtocol = parentUrl.slice(0, parentUrl.indexOf(':') + 1);
      // Disabled, but these cases will give inconsistent results for deep backtracking
      //if (parentUrl[parentProtocol.length] !== '/')
      //  throw new Error('Cannot resolve');
      // read pathname from parent URL
      // pathname taken to be part after leading "/"
      let pathname;
      if (parentUrl[parentProtocol.length + 1] === '/') {
        // resolving to a :// so we need to read out the auth and host
        if (parentProtocol !== 'file:') {
          pathname = parentUrl.slice(parentProtocol.length + 2);
          pathname = pathname.slice(pathname.indexOf('/') + 1);
        }
        else {
          pathname = parentUrl.slice(8);
        }
      }
      else {
        // resolving to :/ so pathname is the /... part
        pathname = parentUrl.slice(parentProtocol.length + (parentUrl[parentProtocol.length] === '/'));
      }

      if (relUrl[0] === '/')
        return parentUrl.slice(0, parentUrl.length - pathname.length - 1) + relUrl;

      // join together and split for removal of .. and . segments
      // looping the string instead of anything fancy for perf reasons
      // '../../../../../z' resolved to 'x/y' is just 'z'
      const segmented = pathname.slice(0, pathname.lastIndexOf('/') + 1) + relUrl;

      const output = [];
      let segmentIndex = -1;
      for (let i = 0; i < segmented.length; i++) {
        // busy reading a segment - only terminate on '/'
        if (segmentIndex !== -1) {
          if (segmented[i] === '/') {
            output.push(segmented.slice(segmentIndex, i + 1));
            segmentIndex = -1;
          }
          continue;
        }
        // new segment - check if it is relative
        else if (segmented[i] === '.') {
          // ../ segment
          if (segmented[i + 1] === '.' && (segmented[i + 2] === '/' || i + 2 === segmented.length)) {
            output.pop();
            i += 2;
            continue;
          }
          // ./ segment
          else if (segmented[i + 1] === '/' || i + 1 === segmented.length) {
            i += 1;
            continue;
          }
        }
        // it is the start of a new segment
        while (segmented[i] === '/') i++;
        segmentIndex = i; 
      }
      // finish reading out the last segment
      if (segmentIndex !== -1)
        output.push(segmented.slice(segmentIndex));
      return parentUrl.slice(0, parentUrl.length - pathname.length) + output.join('');
    }
  }

  function resolveAndComposeImportMap (json, baseUrl, parentMap) {
    const outMap = { imports: Object.assign({}, parentMap.imports), scopes: Object.assign({}, parentMap.scopes) };

    if (json.imports)
      resolveAndComposePackages(json.imports, outMap.imports, baseUrl, parentMap);

    if (json.scopes)
      for (let s in json.scopes) {
        const resolvedScope = resolveUrl(s, baseUrl);
        resolveAndComposePackages(json.scopes[s], outMap.scopes[resolvedScope] || (outMap.scopes[resolvedScope] = {}), baseUrl, parentMap);
      }

    return outMap;
  }

  function getMatch (path, matchObj) {
    if (matchObj[path])
      return path;
    let sepIndex = path.length;
    do {
      const segment = path.slice(0, sepIndex + 1);
      if (segment in matchObj)
        return segment;
    } while ((sepIndex = path.lastIndexOf('/', sepIndex - 1)) !== -1)
  }

  function applyPackages (id, packages) {
    const pkgName = getMatch(id, packages);
    if (pkgName) {
      const pkg = packages[pkgName];
      if (pkg === null) return;
      return pkg + id.slice(pkgName.length);
    }
  }


  function resolveImportMap (importMap, resolvedOrPlain, parentUrl) {
    let scopeUrl = parentUrl && getMatch(parentUrl, importMap.scopes);
    while (scopeUrl) {
      const packageResolution = applyPackages(resolvedOrPlain, importMap.scopes[scopeUrl]);
      if (packageResolution)
        return packageResolution;
      scopeUrl = getMatch(scopeUrl.slice(0, scopeUrl.lastIndexOf('/')), importMap.scopes);
    }
    return applyPackages(resolvedOrPlain, importMap.imports) || resolvedOrPlain.indexOf(':') !== -1 && resolvedOrPlain;
  }

  function resolveAndComposePackages (packages, outPackages, baseUrl, parentMap) {
    for (let p in packages) {
      const resolvedLhs = resolveIfNotPlainOrUrl(p, baseUrl) || p;
      if ((!shimMode || !mapOverrides) && outPackages[resolvedLhs] && (outPackages[resolvedLhs] !== packages[resolvedLhs])) {
        throw Error(`Rejected map override "${resolvedLhs}" from ${outPackages[resolvedLhs]} to ${packages[resolvedLhs]}.`);
      }
      let target = packages[p];
      if (typeof target !== 'string')
        continue;
      const mapped = resolveImportMap(parentMap, resolveIfNotPlainOrUrl(target, baseUrl) || target, baseUrl);
      if (mapped) {
        outPackages[resolvedLhs] = mapped;
        continue;
      }
      console.warn(`Mapping "${p}" -> "${packages[p]}" does not resolve`);
    }
  }

  let dynamicImport = !hasDocument && (0, eval)('u=>import(u)');

  let supportsDynamicImport;

  const dynamicImportCheck = hasDocument && new Promise(resolve => {
    const s = Object.assign(document.createElement('script'), {
      src: createBlob('self._d=u=>import(u)'),
      ep: true
    });
    s.setAttribute('nonce', nonce);
    s.addEventListener('load', () => {
      if (!(supportsDynamicImport = !!(dynamicImport = self._d))) {
        let err;
        window.addEventListener('error', _err => err = _err);
        dynamicImport = (url, opts) => new Promise((resolve, reject) => {
          const s = Object.assign(document.createElement('script'), {
            type: 'module',
            src: createBlob(`import*as m from'${url}';self._esmsi=m`)
          });
          err = undefined;
          s.ep = true;
          if (nonce)
            s.setAttribute('nonce', nonce);
          // Safari is unique in supporting module script error events
          s.addEventListener('error', cb);
          s.addEventListener('load', cb);
          function cb (_err) {
            document.head.removeChild(s);
            if (self._esmsi) {
              resolve(self._esmsi, baseUrl);
              self._esmsi = undefined;
            }
            else {
              reject(!(_err instanceof Event) && _err || err && err.error || new Error(`Error loading ${opts && opts.errUrl || url} (${s.src}).`));
              err = undefined;
            }
          }
          document.head.appendChild(s);
        });
      }
      document.head.removeChild(s);
      delete self._d;
      resolve();
    });
    document.head.appendChild(s);
  });

  // support browsers without dynamic import support (eg Firefox 6x)
  let supportsJsonAssertions = false;
  let supportsCssAssertions = false;

  const supports = hasDocument && HTMLScriptElement.supports;

  let supportsImportMaps = supports && supports.name === 'supports' && supports('importmap');
  let supportsImportMeta = supportsDynamicImport;

  const importMetaCheck = 'import.meta';
  const cssModulesCheck = `import"x"assert{type:"css"}`;
  const jsonModulesCheck = `import"x"assert{type:"json"}`;

  let featureDetectionPromise = Promise.resolve(dynamicImportCheck).then(() => {
    if (!supportsDynamicImport)
      return;

    if (!hasDocument)
      return Promise.all([
        supportsImportMaps || dynamicImport(createBlob(importMetaCheck)).then(() => supportsImportMeta = true, noop),
        cssModulesEnabled && dynamicImport(createBlob(cssModulesCheck.replace('x', createBlob('', 'text/css')))).then(() => supportsCssAssertions = true, noop),
        jsonModulesEnabled && dynamicImport(createBlob(jsonModulescheck.replace('x', createBlob('{}', 'text/json')))).then(() => supportsJsonAssertions = true, noop),
      ]);

    return new Promise(resolve => {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.setAttribute('nonce', nonce);
      function cb ({ data }) {
        const isFeatureDetectionMessage = Array.isArray(data) && data[0] === 'esms';
        if (!isFeatureDetectionMessage) {
          return;
        }
        supportsImportMaps = data[1];
        supportsImportMeta = data[2];
        supportsCssAssertions = data[3];
        supportsJsonAssertions = data[4];
        resolve();
        document.head.removeChild(iframe);
        window.removeEventListener('message', cb, false);
      }
      window.addEventListener('message', cb, false);

      const importMapTest = `<script nonce=${nonce || ''}>b=(s,type='text/javascript')=>URL.createObjectURL(new Blob([s],{type}));document.head.appendChild(Object.assign(document.createElement('script'),{type:'importmap',nonce:"${nonce}",innerText:\`{"imports":{"x":"\${b('')}"}}\`}));Promise.all([${
      supportsImportMaps ? 'true,true' : `'x',b('${importMetaCheck}')`}, ${cssModulesEnabled ? `b('${cssModulesCheck}'.replace('x',b('','text/css')))` : 'false'}, ${
      jsonModulesEnabled ? `b('${jsonModulesCheck}'.replace('x',b('{}','text/json')))` : 'false'}].map(x =>typeof x==='string'?import(x).then(x =>!!x,()=>false):x)).then(a=>parent.postMessage(['esms'].concat(a),'*'))<${''}/script>`;

      // Safari will call onload eagerly on head injection, but we don't want the Wechat
      // path to trigger before setting srcdoc, therefore we track the timing
      let readyForOnload = false, onloadCalledWhileNotReady = false;
      function doOnload () {
        if (!readyForOnload) {
          onloadCalledWhileNotReady = true;
          return;
        }
        // WeChat browser doesn't support setting srcdoc scripts
        // But iframe sandboxes don't support contentDocument so we do this as a fallback
        const doc = iframe.contentDocument;
        if (doc && doc.head.childNodes.length === 0) {
          const s = doc.createElement('script');
          if (nonce)
            s.setAttribute('nonce', nonce);
          s.innerHTML = importMapTest.slice(15 + (nonce ? nonce.length : 0), -9);
          doc.head.appendChild(s);
        }
      }

      iframe.onload = doOnload;
      // WeChat browser requires append before setting srcdoc
      document.head.appendChild(iframe);

      // setting srcdoc is not supported in React native webviews on iOS
      // setting src to a blob URL results in a navigation event in webviews
      // document.write gives usability warnings
      readyForOnload = true;
      if ('srcdoc' in iframe)
        iframe.srcdoc = importMapTest;
      else
        iframe.contentDocument.write(importMapTest);
      // retrigger onload for Safari only if necessary
      if (onloadCalledWhileNotReady) doOnload();
    });
  });

  /* es-module-lexer 1.2.1 */
  let e,a,r,i=2<<19;const s=1===new Uint8Array(new Uint16Array([1]).buffer)[0]?function(e,a){const r=e.length;let i=0;for(;i<r;)a[i]=e.charCodeAt(i++);}:function(e,a){const r=e.length;let i=0;for(;i<r;){const r=e.charCodeAt(i);a[i++]=(255&r)<<8|r>>>8;}},t="xportmportlassetaromsyncunctionssertvoyiedelecontininstantybreareturdebuggeawaithrwhileforifcatcfinallels";let c$1,f,n;function parse(l,k="@"){c$1=l,f=k;const u=2*c$1.length+(2<<18);if(u>i||!e){for(;u>i;)i*=2;a=new ArrayBuffer(i),s(t,new Uint16Array(a,16,105)),e=function(e,a,r){"use asm";var i=new e.Int8Array(r),s=new e.Int16Array(r),t=new e.Int32Array(r),c=new e.Uint8Array(r),f=new e.Uint16Array(r),n=1024;function b(){var e=0,a=0,r=0,c=0,b=0,u=0,w=0;w=n;n=n+10240|0;i[795]=1;s[395]=0;s[396]=0;t[67]=t[2];i[796]=0;t[66]=0;i[794]=0;t[68]=w+2048;t[69]=w;i[797]=0;e=(t[3]|0)+-2|0;t[70]=e;a=e+(t[64]<<1)|0;t[71]=a;e:while(1){r=e+2|0;t[70]=r;if(e>>>0>=a>>>0){b=18;break}a:do{switch(s[r>>1]|0){case 9:case 10:case 11:case 12:case 13:case 32:break;case 101:{if((((s[396]|0)==0?H(r)|0:0)?(m(e+4|0,16,10)|0)==0:0)?(l(),(i[795]|0)==0):0){b=9;break e}else b=17;break}case 105:{if(H(r)|0?(m(e+4|0,26,10)|0)==0:0){k();b=17;}else b=17;break}case 59:{b=17;break}case 47:switch(s[e+4>>1]|0){case 47:{P();break a}case 42:{y(1);break a}default:{b=16;break e}}default:{b=16;break e}}}while(0);if((b|0)==17){b=0;t[67]=t[70];}e=t[70]|0;a=t[71]|0;}if((b|0)==9){e=t[70]|0;t[67]=e;b=19;}else if((b|0)==16){i[795]=0;t[70]=e;b=19;}else if((b|0)==18)if(!(i[794]|0)){e=r;b=19;}else e=0;do{if((b|0)==19){e:while(1){a=e+2|0;t[70]=a;c=a;if(e>>>0>=(t[71]|0)>>>0){b=82;break}a:do{switch(s[a>>1]|0){case 9:case 10:case 11:case 12:case 13:case 32:break;case 101:{if(((s[396]|0)==0?H(a)|0:0)?(m(e+4|0,16,10)|0)==0:0){l();b=81;}else b=81;break}case 105:{if(H(a)|0?(m(e+4|0,26,10)|0)==0:0){k();b=81;}else b=81;break}case 99:{if((H(a)|0?(m(e+4|0,36,8)|0)==0:0)?V(s[e+12>>1]|0)|0:0){i[797]=1;b=81;}else b=81;break}case 40:{c=t[68]|0;a=s[396]|0;b=a&65535;t[c+(b<<3)>>2]=1;r=t[67]|0;s[396]=a+1<<16>>16;t[c+(b<<3)+4>>2]=r;b=81;break}case 41:{a=s[396]|0;if(!(a<<16>>16)){b=36;break e}a=a+-1<<16>>16;s[396]=a;r=s[395]|0;if(r<<16>>16!=0?(u=t[(t[69]|0)+((r&65535)+-1<<2)>>2]|0,(t[u+20>>2]|0)==(t[(t[68]|0)+((a&65535)<<3)+4>>2]|0)):0){a=u+4|0;if(!(t[a>>2]|0))t[a>>2]=c;t[u+12>>2]=e+4;s[395]=r+-1<<16>>16;b=81;}else b=81;break}case 123:{b=t[67]|0;c=t[61]|0;e=b;do{if((s[b>>1]|0)==41&(c|0)!=0?(t[c+4>>2]|0)==(b|0):0){a=t[62]|0;t[61]=a;if(!a){t[57]=0;break}else {t[a+28>>2]=0;break}}}while(0);c=t[68]|0;r=s[396]|0;b=r&65535;t[c+(b<<3)>>2]=(i[797]|0)==0?2:6;s[396]=r+1<<16>>16;t[c+(b<<3)+4>>2]=e;i[797]=0;b=81;break}case 125:{e=s[396]|0;if(!(e<<16>>16)){b=49;break e}c=t[68]|0;b=e+-1<<16>>16;s[396]=b;if((t[c+((b&65535)<<3)>>2]|0)==4){h();b=81;}else b=81;break}case 39:{d(39);b=81;break}case 34:{d(34);b=81;break}case 47:switch(s[e+4>>1]|0){case 47:{P();break a}case 42:{y(1);break a}default:{e=t[67]|0;c=s[e>>1]|0;r:do{if(!(U(c)|0)){switch(c<<16>>16){case 41:if(D(t[(t[68]|0)+(f[396]<<3)+4>>2]|0)|0){b=69;break r}else {b=66;break r}case 125:break;default:{b=66;break r}}a=t[68]|0;r=f[396]|0;if(!(p(t[a+(r<<3)+4>>2]|0)|0)?(t[a+(r<<3)>>2]|0)!=6:0)b=66;else b=69;}else switch(c<<16>>16){case 46:if(((s[e+-2>>1]|0)+-48&65535)<10){b=66;break r}else {b=69;break r}case 43:if((s[e+-2>>1]|0)==43){b=66;break r}else {b=69;break r}case 45:if((s[e+-2>>1]|0)==45){b=66;break r}else {b=69;break r}default:{b=69;break r}}}while(0);r:do{if((b|0)==66){b=0;if(!(o(e)|0)){switch(c<<16>>16){case 0:{b=69;break r}case 47:{if(i[796]|0){b=69;break r}break}default:{}}r=t[3]|0;a=c;do{if(e>>>0<=r>>>0)break;e=e+-2|0;t[67]=e;a=s[e>>1]|0;}while(!(E(a)|0));if(F(a)|0){do{if(e>>>0<=r>>>0)break;e=e+-2|0;t[67]=e;}while(F(s[e>>1]|0)|0);if(j(e)|0){g();i[796]=0;b=81;break a}else e=1;}else e=1;}else b=69;}}while(0);if((b|0)==69){g();e=0;}i[796]=e;b=81;break a}}case 96:{c=t[68]|0;r=s[396]|0;b=r&65535;t[c+(b<<3)+4>>2]=t[67];s[396]=r+1<<16>>16;t[c+(b<<3)>>2]=3;h();b=81;break}default:b=81;}}while(0);if((b|0)==81){b=0;t[67]=t[70];}e=t[70]|0;}if((b|0)==36){T();e=0;break}else if((b|0)==49){T();e=0;break}else if((b|0)==82){e=(i[794]|0)==0?(s[395]|s[396])<<16>>16==0:0;break}}}while(0);n=w;return e|0}function l(){var e=0,a=0,r=0,c=0,f=0,n=0,b=0,l=0,k=0,o=0,h=0,A=0,C=0,g=0;l=t[70]|0;k=t[63]|0;g=l+12|0;t[70]=g;r=w(1)|0;e=t[70]|0;if(!((e|0)==(g|0)?!(I(r)|0):0))C=3;e:do{if((C|0)==3){a:do{switch(r<<16>>16){case 123:{t[70]=e+2;e=w(1)|0;r=t[70]|0;while(1){if(W(e)|0){d(e);e=(t[70]|0)+2|0;t[70]=e;}else {q(e)|0;e=t[70]|0;}w(1)|0;e=v(r,e)|0;if(e<<16>>16==44){t[70]=(t[70]|0)+2;e=w(1)|0;}a=r;r=t[70]|0;if(e<<16>>16==125){C=15;break}if((r|0)==(a|0)){C=12;break}if(r>>>0>(t[71]|0)>>>0){C=14;break}}if((C|0)==12){T();break e}else if((C|0)==14){T();break e}else if((C|0)==15){t[70]=r+2;break a}break}case 42:{t[70]=e+2;w(1)|0;g=t[70]|0;v(g,g)|0;break}default:{i[795]=0;switch(r<<16>>16){case 100:{l=e+14|0;t[70]=l;switch((w(1)|0)<<16>>16){case 97:{a=t[70]|0;if((m(a+2|0,56,8)|0)==0?(f=a+10|0,F(s[f>>1]|0)|0):0){t[70]=f;w(0)|0;C=22;}break}case 102:{C=22;break}case 99:{a=t[70]|0;if(((m(a+2|0,36,8)|0)==0?(c=a+10|0,g=s[c>>1]|0,V(g)|0|g<<16>>16==123):0)?(t[70]=c,n=w(1)|0,n<<16>>16!=123):0){A=n;C=31;}break}default:{}}r:do{if((C|0)==22?(b=t[70]|0,(m(b+2|0,64,14)|0)==0):0){r=b+16|0;a=s[r>>1]|0;if(!(V(a)|0))switch(a<<16>>16){case 40:case 42:break;default:break r}t[70]=r;a=w(1)|0;if(a<<16>>16==42){t[70]=(t[70]|0)+2;a=w(1)|0;}if(a<<16>>16!=40){A=a;C=31;}}}while(0);if((C|0)==31?(o=t[70]|0,q(A)|0,h=t[70]|0,h>>>0>o>>>0):0){$(e,l,o,h);t[70]=(t[70]|0)+-2;break e}$(e,l,0,0);t[70]=e+12;break e}case 97:{t[70]=e+10;w(0)|0;e=t[70]|0;C=35;break}case 102:{C=35;break}case 99:{if((m(e+2|0,36,8)|0)==0?(a=e+10|0,E(s[a>>1]|0)|0):0){t[70]=a;g=w(1)|0;C=t[70]|0;q(g)|0;g=t[70]|0;$(C,g,C,g);t[70]=(t[70]|0)+-2;break e}e=e+4|0;t[70]=e;break}case 108:case 118:break;default:break e}if((C|0)==35){t[70]=e+16;e=w(1)|0;if(e<<16>>16==42){t[70]=(t[70]|0)+2;e=w(1)|0;}C=t[70]|0;q(e)|0;g=t[70]|0;$(C,g,C,g);t[70]=(t[70]|0)+-2;break e}e=e+4|0;t[70]=e;i[795]=0;r:while(1){t[70]=e+2;g=w(1)|0;e=t[70]|0;switch((q(g)|0)<<16>>16){case 91:case 123:break r;default:{}}a=t[70]|0;if((a|0)==(e|0))break e;$(e,a,e,a);if((w(1)|0)<<16>>16!=44)break;e=t[70]|0;}t[70]=(t[70]|0)+-2;break e}}}while(0);g=(w(1)|0)<<16>>16==102;e=t[70]|0;if(g?(m(e+2|0,50,6)|0)==0:0){t[70]=e+8;u(l,w(1)|0);e=(k|0)==0?232:k+16|0;while(1){e=t[e>>2]|0;if(!e)break e;t[e+12>>2]=0;t[e+8>>2]=0;e=e+16|0;}}t[70]=e+-2;}}while(0);return}function k(){var e=0,a=0,r=0,c=0,f=0,n=0;f=t[70]|0;e=f+12|0;t[70]=e;e:do{switch((w(1)|0)<<16>>16){case 40:{a=t[68]|0;n=s[396]|0;r=n&65535;t[a+(r<<3)>>2]=5;e=t[70]|0;s[396]=n+1<<16>>16;t[a+(r<<3)+4>>2]=e;if((s[t[67]>>1]|0)!=46){t[70]=e+2;n=w(1)|0;A(f,t[70]|0,0,e);a=t[61]|0;r=t[69]|0;f=s[395]|0;s[395]=f+1<<16>>16;t[r+((f&65535)<<2)>>2]=a;switch(n<<16>>16){case 39:{d(39);break}case 34:{d(34);break}default:{t[70]=(t[70]|0)+-2;break e}}e=(t[70]|0)+2|0;t[70]=e;switch((w(1)|0)<<16>>16){case 44:{t[70]=(t[70]|0)+2;w(1)|0;f=t[61]|0;t[f+4>>2]=e;n=t[70]|0;t[f+16>>2]=n;i[f+24>>0]=1;t[70]=n+-2;break e}case 41:{s[396]=(s[396]|0)+-1<<16>>16;n=t[61]|0;t[n+4>>2]=e;t[n+12>>2]=(t[70]|0)+2;i[n+24>>0]=1;s[395]=(s[395]|0)+-1<<16>>16;break e}default:{t[70]=(t[70]|0)+-2;break e}}}break}case 46:{t[70]=(t[70]|0)+2;if((w(1)|0)<<16>>16==109?(a=t[70]|0,(m(a+2|0,44,6)|0)==0):0){e=t[67]|0;if(!(G(e)|0)?(s[e>>1]|0)==46:0)break e;A(f,f,a+8|0,2);}break}case 42:case 39:case 34:{c=18;break}case 123:{e=t[70]|0;if(s[396]|0){t[70]=e+-2;break e}while(1){if(e>>>0>=(t[71]|0)>>>0)break;e=w(1)|0;if(!(W(e)|0)){if(e<<16>>16==125){c=33;break}}else d(e);e=(t[70]|0)+2|0;t[70]=e;}if((c|0)==33)t[70]=(t[70]|0)+2;n=(w(1)|0)<<16>>16==102;e=t[70]|0;if(n?m(e+2|0,50,6)|0:0){T();break e}t[70]=e+8;e=w(1)|0;if(W(e)|0){u(f,e);break e}else {T();break e}}default:if((t[70]|0)==(e|0))t[70]=f+10;else c=18;}}while(0);do{if((c|0)==18){if(s[396]|0){t[70]=(t[70]|0)+-2;break}e=t[71]|0;a=t[70]|0;while(1){if(a>>>0>=e>>>0){c=25;break}r=s[a>>1]|0;if(W(r)|0){c=23;break}n=a+2|0;t[70]=n;a=n;}if((c|0)==23){u(f,r);break}else if((c|0)==25){T();break}}}while(0);return}function u(e,a){e=e|0;a=a|0;var r=0,i=0;r=(t[70]|0)+2|0;switch(a<<16>>16){case 39:{d(39);i=5;break}case 34:{d(34);i=5;break}default:T();}do{if((i|0)==5){A(e,r,t[70]|0,1);t[70]=(t[70]|0)+2;a=w(0)|0;e=a<<16>>16==97;if(e){r=t[70]|0;if(m(r+2|0,78,10)|0)i=11;}else {r=t[70]|0;if(!(((a<<16>>16==119?(s[r+2>>1]|0)==105:0)?(s[r+4>>1]|0)==116:0)?(s[r+6>>1]|0)==104:0))i=11;}if((i|0)==11){t[70]=r+-2;break}t[70]=r+((e?6:4)<<1);if((w(1)|0)<<16>>16!=123){t[70]=r;break}e=t[70]|0;a=e;e:while(1){t[70]=a+2;a=w(1)|0;switch(a<<16>>16){case 39:{d(39);t[70]=(t[70]|0)+2;a=w(1)|0;break}case 34:{d(34);t[70]=(t[70]|0)+2;a=w(1)|0;break}default:a=q(a)|0;}if(a<<16>>16!=58){i=20;break}t[70]=(t[70]|0)+2;switch((w(1)|0)<<16>>16){case 39:{d(39);break}case 34:{d(34);break}default:{i=24;break e}}t[70]=(t[70]|0)+2;switch((w(1)|0)<<16>>16){case 125:{i=29;break e}case 44:break;default:{i=28;break e}}t[70]=(t[70]|0)+2;if((w(1)|0)<<16>>16==125){i=29;break}a=t[70]|0;}if((i|0)==20){t[70]=r;break}else if((i|0)==24){t[70]=r;break}else if((i|0)==28){t[70]=r;break}else if((i|0)==29){i=t[61]|0;t[i+16>>2]=e;t[i+12>>2]=(t[70]|0)+2;break}}}while(0);return}function o(e){e=e|0;e:do{switch(s[e>>1]|0){case 100:switch(s[e+-2>>1]|0){case 105:{e=O(e+-4|0,88,2)|0;break e}case 108:{e=O(e+-4|0,92,3)|0;break e}default:{e=0;break e}}case 101:switch(s[e+-2>>1]|0){case 115:switch(s[e+-4>>1]|0){case 108:{e=B(e+-6|0,101)|0;break e}case 97:{e=B(e+-6|0,99)|0;break e}default:{e=0;break e}}case 116:{e=O(e+-4|0,98,4)|0;break e}case 117:{e=O(e+-4|0,106,6)|0;break e}default:{e=0;break e}}case 102:{if((s[e+-2>>1]|0)==111?(s[e+-4>>1]|0)==101:0)switch(s[e+-6>>1]|0){case 99:{e=O(e+-8|0,118,6)|0;break e}case 112:{e=O(e+-8|0,130,2)|0;break e}default:{e=0;break e}}else e=0;break}case 107:{e=O(e+-2|0,134,4)|0;break}case 110:{e=e+-2|0;if(B(e,105)|0)e=1;else e=O(e,142,5)|0;break}case 111:{e=B(e+-2|0,100)|0;break}case 114:{e=O(e+-2|0,152,7)|0;break}case 116:{e=O(e+-2|0,166,4)|0;break}case 119:switch(s[e+-2>>1]|0){case 101:{e=B(e+-4|0,110)|0;break e}case 111:{e=O(e+-4|0,174,3)|0;break e}default:{e=0;break e}}default:e=0;}}while(0);return e|0}function h(){var e=0,a=0,r=0,i=0;a=t[71]|0;r=t[70]|0;e:while(1){e=r+2|0;if(r>>>0>=a>>>0){a=10;break}switch(s[e>>1]|0){case 96:{a=7;break e}case 36:{if((s[r+4>>1]|0)==123){a=6;break e}break}case 92:{e=r+4|0;break}default:{}}r=e;}if((a|0)==6){e=r+4|0;t[70]=e;a=t[68]|0;i=s[396]|0;r=i&65535;t[a+(r<<3)>>2]=4;s[396]=i+1<<16>>16;t[a+(r<<3)+4>>2]=e;}else if((a|0)==7){t[70]=e;r=t[68]|0;i=(s[396]|0)+-1<<16>>16;s[396]=i;if((t[r+((i&65535)<<3)>>2]|0)!=3)T();}else if((a|0)==10){t[70]=e;T();}return}function w(e){e=e|0;var a=0,r=0,i=0;r=t[70]|0;e:do{a=s[r>>1]|0;a:do{if(a<<16>>16!=47)if(e)if(V(a)|0)break;else break e;else if(F(a)|0)break;else break e;else switch(s[r+2>>1]|0){case 47:{P();break a}case 42:{y(e);break a}default:{a=47;break e}}}while(0);i=t[70]|0;r=i+2|0;t[70]=r;}while(i>>>0<(t[71]|0)>>>0);return a|0}function d(e){e=e|0;var a=0,r=0,i=0,c=0;c=t[71]|0;a=t[70]|0;while(1){i=a+2|0;if(a>>>0>=c>>>0){a=9;break}r=s[i>>1]|0;if(r<<16>>16==e<<16>>16){a=10;break}if(r<<16>>16==92){r=a+4|0;if((s[r>>1]|0)==13){a=a+6|0;a=(s[a>>1]|0)==10?a:r;}else a=r;}else if(Z(r)|0){a=9;break}else a=i;}if((a|0)==9){t[70]=i;T();}else if((a|0)==10)t[70]=i;return}function v(e,a){e=e|0;a=a|0;var r=0,i=0,c=0,f=0;r=t[70]|0;i=s[r>>1]|0;f=(e|0)==(a|0);c=f?0:e;f=f?0:a;if(i<<16>>16==97){t[70]=r+4;r=w(1)|0;e=t[70]|0;if(W(r)|0){d(r);a=(t[70]|0)+2|0;t[70]=a;}else {q(r)|0;a=t[70]|0;}i=w(1)|0;r=t[70]|0;}if((r|0)!=(e|0))$(e,a,c,f);return i|0}function A(e,a,r,s){e=e|0;a=a|0;r=r|0;s=s|0;var c=0,f=0;c=t[65]|0;t[65]=c+32;f=t[61]|0;t[((f|0)==0?228:f+28|0)>>2]=c;t[62]=f;t[61]=c;t[c+8>>2]=e;if(2==(s|0))e=r;else e=1==(s|0)?r+2|0:0;t[c+12>>2]=e;t[c>>2]=a;t[c+4>>2]=r;t[c+16>>2]=0;t[c+20>>2]=s;i[c+24>>0]=1==(s|0)&1;t[c+28>>2]=0;return}function C(){var e=0,a=0,r=0;r=t[71]|0;a=t[70]|0;e:while(1){e=a+2|0;if(a>>>0>=r>>>0){a=6;break}switch(s[e>>1]|0){case 13:case 10:{a=6;break e}case 93:{a=7;break e}case 92:{e=a+4|0;break}default:{}}a=e;}if((a|0)==6){t[70]=e;T();e=0;}else if((a|0)==7){t[70]=e;e=93;}return e|0}function g(){var e=0,a=0,r=0;e:while(1){e=t[70]|0;a=e+2|0;t[70]=a;if(e>>>0>=(t[71]|0)>>>0){r=7;break}switch(s[a>>1]|0){case 13:case 10:{r=7;break e}case 47:break e;case 91:{C()|0;break}case 92:{t[70]=e+4;break}default:{}}}if((r|0)==7)T();return}function p(e){e=e|0;switch(s[e>>1]|0){case 62:{e=(s[e+-2>>1]|0)==61;break}case 41:case 59:{e=1;break}case 104:{e=O(e+-2|0,200,4)|0;break}case 121:{e=O(e+-2|0,208,6)|0;break}case 101:{e=O(e+-2|0,220,3)|0;break}default:e=0;}return e|0}function y(e){e=e|0;var a=0,r=0,i=0,c=0,f=0;c=(t[70]|0)+2|0;t[70]=c;r=t[71]|0;while(1){a=c+2|0;if(c>>>0>=r>>>0)break;i=s[a>>1]|0;if(!e?Z(i)|0:0)break;if(i<<16>>16==42?(s[c+4>>1]|0)==47:0){f=8;break}c=a;}if((f|0)==8){t[70]=a;a=c+4|0;}t[70]=a;return}function m(e,a,r){e=e|0;a=a|0;r=r|0;var s=0,t=0;e:do{if(!r)e=0;else {while(1){s=i[e>>0]|0;t=i[a>>0]|0;if(s<<24>>24!=t<<24>>24)break;r=r+-1|0;if(!r){e=0;break e}else {e=e+1|0;a=a+1|0;}}e=(s&255)-(t&255)|0;}}while(0);return e|0}function I(e){e=e|0;e:do{switch(e<<16>>16){case 38:case 37:case 33:{e=1;break}default:if((e&-8)<<16>>16==40|(e+-58&65535)<6)e=1;else {switch(e<<16>>16){case 91:case 93:case 94:{e=1;break e}default:{}}e=(e+-123&65535)<4;}}}while(0);return e|0}function U(e){e=e|0;e:do{switch(e<<16>>16){case 38:case 37:case 33:break;default:if(!((e+-58&65535)<6|(e+-40&65535)<7&e<<16>>16!=41)){switch(e<<16>>16){case 91:case 94:break e;default:{}}return e<<16>>16!=125&(e+-123&65535)<4|0}}}while(0);return 1}function x(e){e=e|0;var a=0;a=s[e>>1]|0;e:do{if((a+-9&65535)>=5){switch(a<<16>>16){case 160:case 32:{a=1;break e}default:{}}if(I(a)|0)return a<<16>>16!=46|(G(e)|0)|0;else a=0;}else a=1;}while(0);return a|0}function S(e){e=e|0;var a=0,r=0,i=0,c=0;r=n;n=n+16|0;i=r;t[i>>2]=0;t[64]=e;a=t[3]|0;c=a+(e<<1)|0;e=c+2|0;s[c>>1]=0;t[i>>2]=e;t[65]=e;t[57]=0;t[61]=0;t[59]=0;t[58]=0;t[63]=0;t[60]=0;n=r;return a|0}function O(e,a,r){e=e|0;a=a|0;r=r|0;var i=0,s=0;i=e+(0-r<<1)|0;s=i+2|0;e=t[3]|0;if(s>>>0>=e>>>0?(m(s,a,r<<1)|0)==0:0)if((s|0)==(e|0))e=1;else e=x(i)|0;else e=0;return e|0}function $(e,a,r,i){e=e|0;a=a|0;r=r|0;i=i|0;var s=0,c=0;s=t[65]|0;t[65]=s+20;c=t[63]|0;t[((c|0)==0?232:c+16|0)>>2]=s;t[63]=s;t[s>>2]=e;t[s+4>>2]=a;t[s+8>>2]=r;t[s+12>>2]=i;t[s+16>>2]=0;return}function j(e){e=e|0;switch(s[e>>1]|0){case 107:{e=O(e+-2|0,134,4)|0;break}case 101:{if((s[e+-2>>1]|0)==117)e=O(e+-4|0,106,6)|0;else e=0;break}default:e=0;}return e|0}function B(e,a){e=e|0;a=a|0;var r=0;r=t[3]|0;if(r>>>0<=e>>>0?(s[e>>1]|0)==a<<16>>16:0)if((r|0)==(e|0))r=1;else r=E(s[e+-2>>1]|0)|0;else r=0;return r|0}function E(e){e=e|0;e:do{if((e+-9&65535)<5)e=1;else {switch(e<<16>>16){case 32:case 160:{e=1;break e}default:{}}e=e<<16>>16!=46&(I(e)|0);}}while(0);return e|0}function P(){var e=0,a=0,r=0;e=t[71]|0;r=t[70]|0;e:while(1){a=r+2|0;if(r>>>0>=e>>>0)break;switch(s[a>>1]|0){case 13:case 10:break e;default:r=a;}}t[70]=a;return}function q(e){e=e|0;while(1){if(V(e)|0)break;if(I(e)|0)break;e=(t[70]|0)+2|0;t[70]=e;e=s[e>>1]|0;if(!(e<<16>>16)){e=0;break}}return e|0}function z(){var e=0;e=t[(t[59]|0)+20>>2]|0;switch(e|0){case 1:{e=-1;break}case 2:{e=-2;break}default:e=e-(t[3]|0)>>1;}return e|0}function D(e){e=e|0;if(!(O(e,180,5)|0)?!(O(e,190,3)|0):0)e=O(e,196,2)|0;else e=1;return e|0}function F(e){e=e|0;switch(e<<16>>16){case 160:case 32:case 12:case 11:case 9:{e=1;break}default:e=0;}return e|0}function G(e){e=e|0;if((s[e>>1]|0)==46?(s[e+-2>>1]|0)==46:0)e=(s[e+-4>>1]|0)==46;else e=0;return e|0}function H(e){e=e|0;if((t[3]|0)==(e|0))e=1;else e=x(e+-2|0)|0;return e|0}function J(){var e=0;e=t[(t[60]|0)+12>>2]|0;if(!e)e=-1;else e=e-(t[3]|0)>>1;return e|0}function K(){var e=0;e=t[(t[59]|0)+12>>2]|0;if(!e)e=-1;else e=e-(t[3]|0)>>1;return e|0}function L(){var e=0;e=t[(t[60]|0)+8>>2]|0;if(!e)e=-1;else e=e-(t[3]|0)>>1;return e|0}function M(){var e=0;e=t[(t[59]|0)+16>>2]|0;if(!e)e=-1;else e=e-(t[3]|0)>>1;return e|0}function N(){var e=0;e=t[(t[59]|0)+4>>2]|0;if(!e)e=-1;else e=e-(t[3]|0)>>1;return e|0}function Q(){var e=0;e=t[59]|0;e=t[((e|0)==0?228:e+28|0)>>2]|0;t[59]=e;return (e|0)!=0|0}function R(){var e=0;e=t[60]|0;e=t[((e|0)==0?232:e+16|0)>>2]|0;t[60]=e;return (e|0)!=0|0}function T(){i[794]=1;t[66]=(t[70]|0)-(t[3]|0)>>1;t[70]=(t[71]|0)+2;return}function V(e){e=e|0;return (e|128)<<16>>16==160|(e+-9&65535)<5|0}function W(e){e=e|0;return e<<16>>16==39|e<<16>>16==34|0}function X(){return (t[(t[59]|0)+8>>2]|0)-(t[3]|0)>>1|0}function Y(){return (t[(t[60]|0)+4>>2]|0)-(t[3]|0)>>1|0}function Z(e){e=e|0;return e<<16>>16==13|e<<16>>16==10|0}function _(){return (t[t[59]>>2]|0)-(t[3]|0)>>1|0}function ee(){return (t[t[60]>>2]|0)-(t[3]|0)>>1|0}function ae(){return c[(t[59]|0)+24>>0]|0|0}function re(e){e=e|0;t[3]=e;return}function ie(){return (i[795]|0)!=0|0}function se(){return t[66]|0}function te(e){e=e|0;n=e+992+15&-16;return 992}return {su:te,ai:M,e:se,ee:Y,ele:J,els:L,es:ee,f:ie,id:z,ie:N,ip:ae,is:_,p:b,re:R,ri:Q,sa:S,se:K,ses:re,ss:X}}("undefined"!=typeof self?self:global,{},a),r=e.su(i-(2<<17));}const h=c$1.length+1;e.ses(r),e.sa(h-1),s(c$1,new Uint16Array(a,r,h)),e.p()||(n=e.e(),o());const w=[],d=[];for(;e.ri();){const a=e.is(),r=e.ie(),i=e.ai(),s=e.id(),t=e.ss(),f=e.se();let n;e.ip()&&(n=b(-1===s?a:a+1,c$1.charCodeAt(-1===s?a-1:a))),w.push({n:n,s:a,e:r,ss:t,se:f,d:s,a:i});}for(;e.re();){const a=e.es(),r=e.ee(),i=e.els(),s=e.ele(),t=c$1.charCodeAt(a),f=i>=0?c$1.charCodeAt(i):-1;d.push({s:a,e:r,ls:i,le:s,n:34===t||39===t?b(a+1,t):c$1.slice(a,r),ln:i<0?void 0:34===f||39===f?b(i+1,f):c$1.slice(i,s)});}return [w,d,!!e.f()]}function b(e,a){n=e;let r="",i=n;for(;;){n>=c$1.length&&o();const e=c$1.charCodeAt(n);if(e===a)break;92===e?(r+=c$1.slice(i,n),r+=l(),i=n):(8232===e||8233===e||u(e)&&o(),++n);}return r+=c$1.slice(i,n++),r}function l(){let e=c$1.charCodeAt(++n);switch(++n,e){case 110:return "\n";case 114:return "\r";case 120:return String.fromCharCode(k(2));case 117:return function(){const e=c$1.charCodeAt(n);let a;123===e?(++n,a=k(c$1.indexOf("}",n)-n),++n,a>1114111&&o()):a=k(4);return a<=65535?String.fromCharCode(a):(a-=65536,String.fromCharCode(55296+(a>>10),56320+(1023&a)))}();case 116:return "\t";case 98:return "\b";case 118:return "\v";case 102:return "\f";case 13:10===c$1.charCodeAt(n)&&++n;case 10:return "";case 56:case 57:o();default:if(e>=48&&e<=55){let a=c$1.substr(n-1,3).match(/^[0-7]+/)[0],r=parseInt(a,8);return r>255&&(a=a.slice(0,-1),r=parseInt(a,8)),n+=a.length-1,e=c$1.charCodeAt(n),"0"===a&&56!==e&&57!==e||o(),String.fromCharCode(r)}return u(e)?"":String.fromCharCode(e)}}function k(e){const a=n;let r=0,i=0;for(let a=0;a<e;++a,++n){let e,s=c$1.charCodeAt(n);if(95!==s){if(s>=97)e=s-97+10;else if(s>=65)e=s-65+10;else {if(!(s>=48&&s<=57))break;e=s-48;}if(e>=16)break;i=s,r=16*r+e;}else 95!==i&&0!==a||o(),i=s;}return 95!==i&&n-a===e||o(),r}function u(e){return 13===e||10===e}function o(){throw Object.assign(Error(`Parse error ${f}:${c$1.slice(0,n).split("\n").length}:${n-c$1.lastIndexOf("\n",n-1)}`),{idx:n})}

  async function _resolve (id, parentUrl) {
    const urlResolved = resolveIfNotPlainOrUrl(id, parentUrl);
    return {
      r: resolveImportMap(importMap, urlResolved || id, parentUrl) || throwUnresolved(id, parentUrl),
      // b = bare specifier
      b: !urlResolved && !isURL(id)
    };
  }

  const resolve = resolveHook ? async (id, parentUrl) => {
    let result = resolveHook(id, parentUrl, defaultResolve);
    // will be deprecated in next major
    if (result && result.then)
      result = await result;
    return result ? { r: result, b: !resolveIfNotPlainOrUrl(id, parentUrl) && !isURL(id) } : _resolve(id, parentUrl);
  } : _resolve;

  // importShim('mod');
  // importShim('mod', { opts });
  // importShim('mod', { opts }, parentUrl);
  // importShim('mod', parentUrl);
  async function importShim (id, ...args) {
    // parentUrl if present will be the last argument
    let parentUrl = args[args.length - 1];
    if (typeof parentUrl !== 'string')
      parentUrl = baseUrl;
    // needed for shim check
    await initPromise;
    if (importHook) await importHook(id, typeof args[1] !== 'string' ? args[1] : {}, parentUrl);
    if (acceptingImportMaps || shimMode || !baselinePassthrough) {
      if (hasDocument)
        processScriptsAndPreloads(true);
      if (!shimMode)
        acceptingImportMaps = false;
    }
    await importMapPromise;
    return topLevelLoad((await resolve(id, parentUrl)).r, { credentials: 'same-origin' });
  }

  self.importShim = importShim;

  function defaultResolve (id, parentUrl) {
    return resolveImportMap(importMap, resolveIfNotPlainOrUrl(id, parentUrl) || id, parentUrl) || throwUnresolved(id, parentUrl);
  }

  function throwUnresolved (id, parentUrl) {
    throw Error(`Unable to resolve specifier '${id}'${fromParent(parentUrl)}`);
  }

  const resolveSync = (id, parentUrl = baseUrl) => {
    parentUrl = `${parentUrl}`;
    const result = resolveHook && resolveHook(id, parentUrl, defaultResolve);
    return result && !result.then ? result : defaultResolve(id, parentUrl);
  };

  function metaResolve (id, parentUrl = this.url) {
    return resolveSync(id, parentUrl);
  }

  importShim.resolve = resolveSync;
  importShim.getImportMap = () => JSON.parse(JSON.stringify(importMap));
  importShim.addImportMap = importMapIn => {
    if (!shimMode) throw new Error('Unsupported in polyfill mode.');
    importMap = resolveAndComposeImportMap(importMapIn, baseUrl, importMap);
  };

  const registry = importShim._r = {};
  importShim._w = {};

  async function loadAll (load, seen) {
    if (load.b || seen[load.u])
      return;
    seen[load.u] = 1;
    await load.L;
    await Promise.all(load.d.map(dep => loadAll(dep, seen)));
    if (!load.n)
      load.n = load.d.some(dep => dep.n);
  }

  let importMap = { imports: {}, scopes: {} };
  let baselinePassthrough;

  const initPromise = featureDetectionPromise.then(() => {
    baselinePassthrough = esmsInitOptions.polyfillEnable !== true && supportsDynamicImport && supportsImportMeta && supportsImportMaps && (!jsonModulesEnabled || supportsJsonAssertions) && (!cssModulesEnabled || supportsCssAssertions) && !importMapSrcOrLazy;
    if (hasDocument) {
      if (!supportsImportMaps) {
        const supports = HTMLScriptElement.supports || (type => type === 'classic' || type === 'module');
        HTMLScriptElement.supports = type => type === 'importmap' || supports(type);
      }
      if (shimMode || !baselinePassthrough) {
        new MutationObserver(mutations => {
          for (const mutation of mutations) {
            if (mutation.type !== 'childList') continue;
            for (const node of mutation.addedNodes) {
              if (node.tagName === 'SCRIPT') {
                if (node.type === (shimMode ? 'module-shim' : 'module'))
                  processScript(node, true);
                if (node.type === (shimMode ? 'importmap-shim' : 'importmap'))
                  processImportMap(node, true);
              }
              else if (node.tagName === 'LINK' && node.rel === (shimMode ? 'modulepreload-shim' : 'modulepreload')) {
                processPreload(node);
              }
            }
          }
        }).observe(document, {childList: true, subtree: true});
        processScriptsAndPreloads();
        if (document.readyState === 'complete') {
          readyStateCompleteCheck();
        }
        else {
          async function readyListener() {
            await initPromise;
            processScriptsAndPreloads();
            if (document.readyState === 'complete') {
              readyStateCompleteCheck();
              document.removeEventListener('readystatechange', readyListener);
            }
          }
          document.addEventListener('readystatechange', readyListener);
        }
      }
    }
    return undefined;
  });
  let importMapPromise = initPromise;
  let firstPolyfillLoad = true;
  let acceptingImportMaps = true;

  async function topLevelLoad (url, fetchOpts, source, nativelyLoaded, lastStaticLoadPromise) {
    if (!shimMode)
      acceptingImportMaps = false;
    await initPromise;
    await importMapPromise;
    if (importHook) await importHook(url, typeof fetchOpts !== 'string' ? fetchOpts : {}, '');
    // early analysis opt-out - no need to even fetch if we have feature support
    if (!shimMode && baselinePassthrough) {
      // for polyfill case, only dynamic import needs a return value here, and dynamic import will never pass nativelyLoaded
      if (nativelyLoaded)
        return null;
      await lastStaticLoadPromise;
      return dynamicImport(source ? createBlob(source) : url, { errUrl: url || source });
    }
    const load = getOrCreateLoad(url, fetchOpts, null, source);
    const seen = {};
    await loadAll(load, seen);
    lastLoad = undefined;
    resolveDeps(load, seen);
    await lastStaticLoadPromise;
    if (source && !shimMode && !load.n) {
      if (nativelyLoaded) return;
      if (revokeBlobURLs) revokeObjectURLs(Object.keys(seen));
      return await dynamicImport(createBlob(source), { errUrl: source });
    }
    if (firstPolyfillLoad && !shimMode && load.n && nativelyLoaded) {
      onpolyfill();
      firstPolyfillLoad = false;
    }
    const module = await dynamicImport(!shimMode && !load.n && nativelyLoaded ? load.u : load.b, { errUrl: load.u });
    // if the top-level load is a shell, run its update function
    if (load.s)
      (await dynamicImport(load.s)).u$_(module);
    if (revokeBlobURLs) revokeObjectURLs(Object.keys(seen));
    // when tla is supported, this should return the tla promise as an actual handle
    // so readystate can still correspond to the sync subgraph exec completions
    return module;
  }

  function revokeObjectURLs(registryKeys) {
    let batch = 0;
    const keysLength = registryKeys.length;
    const schedule = self.requestIdleCallback ? self.requestIdleCallback : self.requestAnimationFrame;
    schedule(cleanup);
    function cleanup() {
      const batchStartIndex = batch * 100;
      if (batchStartIndex > keysLength) return
      for (const key of registryKeys.slice(batchStartIndex, batchStartIndex + 100)) {
        const load = registry[key];
        if (load) URL.revokeObjectURL(load.b);
      }
      batch++;
      schedule(cleanup);
    }
  }

  function urlJsString (url) {
    return `'${url.replace(/'/g, "\\'")}'`;
  }

  let lastLoad;
  function resolveDeps (load, seen) {
    if (load.b || !seen[load.u])
      return;
    seen[load.u] = 0;

    for (const dep of load.d)
      resolveDeps(dep, seen);

    const [imports, exports] = load.a;

    // "execution"
    const source = load.S;

    // edge doesnt execute sibling in order, so we fix this up by ensuring all previous executions are explicit dependencies
    let resolvedSource = edge && lastLoad ? `import '${lastLoad}';` : '';

    // once all deps have loaded we can inline the dependency resolution blobs
    // and define this blob
    let lastIndex = 0, depIndex = 0, dynamicImportEndStack = [];
    function pushStringTo (originalIndex) {
      while (dynamicImportEndStack[dynamicImportEndStack.length - 1] < originalIndex) {
        const dynamicImportEnd = dynamicImportEndStack.pop();
        resolvedSource += `${source.slice(lastIndex, dynamicImportEnd)}, ${urlJsString(load.r)}`;
        lastIndex = dynamicImportEnd;
      }
      resolvedSource += source.slice(lastIndex, originalIndex);
      lastIndex = originalIndex;
    }

    for (const { s: start, ss: statementStart, se: statementEnd, d: dynamicImportIndex } of imports) {
      // dependency source replacements
      if (dynamicImportIndex === -1) {
        let depLoad = load.d[depIndex++], blobUrl = depLoad.b, cycleShell = !blobUrl;
        if (cycleShell) {
          // circular shell creation
          if (!(blobUrl = depLoad.s)) {
            blobUrl = depLoad.s = createBlob(`export function u$_(m){${
            depLoad.a[1].map(({ s, e }, i) => {
              const q = depLoad.S[s] === '"' || depLoad.S[s] === "'";
              return `e$_${i}=m${q ? `[` : '.'}${depLoad.S.slice(s, e)}${q ? `]` : ''}`;
            }).join(',')
          }}${
            depLoad.a[1].length ? `let ${depLoad.a[1].map((_, i) => `e$_${i}`).join(',')};` : ''
          }export {${
            depLoad.a[1].map(({ s, e }, i) => `e$_${i} as ${depLoad.S.slice(s, e)}`).join(',')
          }}\n//# sourceURL=${depLoad.r}?cycle`);
          }
        }

        pushStringTo(start - 1);
        resolvedSource += `/*${source.slice(start - 1, statementEnd)}*/${urlJsString(blobUrl)}`;

        // circular shell execution
        if (!cycleShell && depLoad.s) {
          resolvedSource += `;import*as m$_${depIndex} from'${depLoad.b}';import{u$_ as u$_${depIndex}}from'${depLoad.s}';u$_${depIndex}(m$_${depIndex})`;
          depLoad.s = undefined;
        }
        lastIndex = statementEnd;
      }
      // import.meta
      else if (dynamicImportIndex === -2) {
        load.m = { url: load.r, resolve: metaResolve };
        metaHook(load.m, load.u);
        pushStringTo(start);
        resolvedSource += `importShim._r[${urlJsString(load.u)}].m`;
        lastIndex = statementEnd;
      }
      // dynamic import
      else {
        pushStringTo(statementStart + 6);
        resolvedSource += `Shim(`;
        dynamicImportEndStack.push(statementEnd - 1);
        lastIndex = start;
      }
    }

    // support progressive cycle binding updates (try statement avoids tdz errors)
    if (load.s)
      resolvedSource += `\n;import{u$_}from'${load.s}';try{u$_({${exports.filter(e => e.ln).map(({ s, e, ln }) => `${source.slice(s, e)}:${ln}`).join(',')}})}catch(_){};\n`;

    function pushSourceURL (commentPrefix, commentStart) {
      const urlStart = commentStart + commentPrefix.length;
      const commentEnd = source.indexOf('\n', urlStart);
      const urlEnd = commentEnd !== -1 ? commentEnd : source.length;
      pushStringTo(urlStart);
      resolvedSource += new URL(source.slice(urlStart, urlEnd), load.r).href;
      lastIndex = urlEnd;
    }

    let sourceURLCommentStart = source.lastIndexOf(sourceURLCommentPrefix);
    let sourceMapURLCommentStart = source.lastIndexOf(sourceMapURLCommentPrefix);

    // ignore sourceMap comments before already spliced code
    if (sourceURLCommentStart < lastIndex) sourceURLCommentStart = -1;
    if (sourceMapURLCommentStart < lastIndex) sourceMapURLCommentStart = -1;

    // sourceURL first / only
    if (sourceURLCommentStart !== -1 && (sourceMapURLCommentStart === -1 || sourceMapURLCommentStart > sourceURLCommentStart)) {
      pushSourceURL(sourceURLCommentPrefix, sourceURLCommentStart);
    }
    // sourceMappingURL
    if (sourceMapURLCommentStart !== -1) {
      pushSourceURL(sourceMapURLCommentPrefix, sourceMapURLCommentStart);
      // sourceURL last
      if (sourceURLCommentStart !== -1 && (sourceURLCommentStart > sourceMapURLCommentStart))
        pushSourceURL(sourceURLCommentPrefix, sourceURLCommentStart);
    }

    pushStringTo(source.length);

    if (sourceURLCommentStart === -1)
      resolvedSource += sourceURLCommentPrefix + load.r;

    load.b = lastLoad = createBlob(resolvedSource);
    load.S = undefined;
  }

  const sourceURLCommentPrefix = '\n//# sourceURL=';
  const sourceMapURLCommentPrefix = '\n//# sourceMappingURL=';

  const jsContentType = /^(text|application)\/(x-)?javascript(;|$)/;
  const wasmContentType = /^(application)\/wasm(;|$)/;
  const jsonContentType = /^(text|application)\/json(;|$)/;
  const cssContentType = /^(text|application)\/css(;|$)/;

  const cssUrlRegEx = /url\(\s*(?:(["'])((?:\\.|[^\n\\"'])+)\1|((?:\\.|[^\s,"'()\\])+))\s*\)/g;

  // restrict in-flight fetches to a pool of 100
  let p = [];
  let c = 0;
  function pushFetchPool () {
    if (++c > 100)
      return new Promise(r => p.push(r));
  }
  function popFetchPool () {
    c--;
    if (p.length)
      p.shift()();
  }

  async function doFetch (url, fetchOpts, parent) {
    if (enforceIntegrity && !fetchOpts.integrity)
      throw Error(`No integrity for ${url}${fromParent(parent)}.`);
    const poolQueue = pushFetchPool();
    if (poolQueue) await poolQueue;
    try {
      var res = await fetchHook(url, fetchOpts);
    }
    catch (e) {
      e.message = `Unable to fetch ${url}${fromParent(parent)} - see network log for details.\n` + e.message;
      throw e;
    }
    finally {
      popFetchPool();
    }
    if (!res.ok)
      throw Error(`${res.status} ${res.statusText} ${res.url}${fromParent(parent)}`);
    return res;
  }

  async function fetchModule (url, fetchOpts, parent) {
    const res = await doFetch(url, fetchOpts, parent);
    const contentType = res.headers.get('content-type');
    if (jsContentType.test(contentType))
      return { r: res.url, s: await res.text(), t: 'js' };
    else if (wasmContentType.test(contentType)) {
      const module = importShim._w[url] = await WebAssembly.compileStreaming(res);
      let s = '', i = 0, importObj = '';
      for (const impt of WebAssembly.Module.imports(module)) {
        s += `import * as impt${i} from '${impt.module}';\n`;
        importObj += `'${impt.module}':impt${i++},`;
      }
      i = 0;
      s += `const instance = await WebAssembly.instantiate(importShim._w['${url}'], {${importObj}});\n`;
      for (const expt of WebAssembly.Module.exports(module)) {
        s += `const expt${i} = instance['${expt.name}'];\n`;
        s += `export { expt${i++} as "${expt.name}" };\n`;
      }
      return { r: res.url, s, t: 'wasm' };
    }
    else if (jsonContentType.test(contentType))
      return { r: res.url, s: `export default ${await res.text()}`, t: 'json' };
    else if (cssContentType.test(contentType)) {
      return { r: res.url, s: `var s=new CSSStyleSheet();s.replaceSync(${
        JSON.stringify((await res.text()).replace(cssUrlRegEx, (_match, quotes = '', relUrl1, relUrl2) => `url(${quotes}${resolveUrl(relUrl1 || relUrl2, url)}${quotes})`))
      });export default s;`, t: 'css' };
    }
    else
      throw Error(`Unsupported Content-Type "${contentType}" loading ${url}${fromParent(parent)}. Modules must be served with a valid MIME type like application/javascript.`);
  }

  function getOrCreateLoad (url, fetchOpts, parent, source) {
    let load = registry[url];
    if (load && !source)
      return load;

    load = {
      // url
      u: url,
      // response url
      r: source ? url : undefined,
      // fetchPromise
      f: undefined,
      // source
      S: undefined,
      // linkPromise
      L: undefined,
      // analysis
      a: undefined,
      // deps
      d: undefined,
      // blobUrl
      b: undefined,
      // shellUrl
      s: undefined,
      // needsShim
      n: false,
      // type
      t: null,
      // meta
      m: null
    };
    if (registry[url]) {
      let i = 0;
      while (registry[load.u + ++i]);
      load.u += i;
    }
    registry[load.u] = load;

    load.f = (async () => {
      if (!source) {
        // preload fetch options override fetch options (race)
        let t;
        ({ r: load.r, s: source, t } = await (fetchCache[url] || fetchModule(url, fetchOpts, parent)));
        if (t && !shimMode) {
          if (t === 'css' && !cssModulesEnabled || t === 'json' && !jsonModulesEnabled)
            throw Error(`${t}-modules require <script type="esms-options">{ "polyfillEnable": ["${t}-modules"] }<${''}/script>`);
          if (t === 'css' && !supportsCssAssertions || t === 'json' && !supportsJsonAssertions)
            load.n = true;
        }
      }
      try {
        load.a = parse(source, load.u);
      }
      catch (e) {
        throwError(e);
        load.a = [[], [], false];
      }
      load.S = source;
      return load;
    })();

    load.L = load.f.then(async () => {
      let childFetchOpts = fetchOpts;
      load.d = (await Promise.all(load.a[0].map(async ({ n, d }) => {
        if (d >= 0 && !supportsDynamicImport || d === -2 && !supportsImportMeta)
          load.n = true;
        if (d !== -1 || !n) return;
        const { r, b } = await resolve(n, load.r || load.u);
        if (b && (!supportsImportMaps || importMapSrcOrLazy))
          load.n = true;
        if (d !== -1) return;
        if (skip && skip(r)) return { b: r };
        if (childFetchOpts.integrity)
          childFetchOpts = Object.assign({}, childFetchOpts, { integrity: undefined });
        return getOrCreateLoad(r, childFetchOpts, load.r).f;
      }))).filter(l => l);
    });

    return load;
  }

  function processScriptsAndPreloads (mapsOnly = false) {
    if (!mapsOnly)
      for (const link of document.querySelectorAll(shimMode ? 'link[rel=modulepreload-shim]' : 'link[rel=modulepreload]'))
        processPreload(link);
    for (const script of document.querySelectorAll(shimMode ? 'script[type=importmap-shim]' : 'script[type=importmap]'))
      processImportMap(script);
    if (!mapsOnly)
      for (const script of document.querySelectorAll(shimMode ? 'script[type=module-shim]' : 'script[type=module]'))
        processScript(script);
  }

  function getFetchOpts (script) {
    const fetchOpts = {};
    if (script.integrity)
      fetchOpts.integrity = script.integrity;
    if (script.referrerPolicy)
      fetchOpts.referrerPolicy = script.referrerPolicy;
    if (script.crossOrigin === 'use-credentials')
      fetchOpts.credentials = 'include';
    else if (script.crossOrigin === 'anonymous')
      fetchOpts.credentials = 'omit';
    else
      fetchOpts.credentials = 'same-origin';
    return fetchOpts;
  }

  let lastStaticLoadPromise = Promise.resolve();

  let domContentLoadedCnt = 1;
  function domContentLoadedCheck () {
    if (--domContentLoadedCnt === 0 && !noLoadEventRetriggers && (shimMode || !baselinePassthrough)) {
      document.dispatchEvent(new Event('DOMContentLoaded'));
    }
  }
  // this should always trigger because we assume es-module-shims is itself a domcontentloaded requirement
  if (hasDocument) {
    document.addEventListener('DOMContentLoaded', async () => {
      await initPromise;
      domContentLoadedCheck();
    });
  }

  let readyStateCompleteCnt = 1;
  function readyStateCompleteCheck () {
    if (--readyStateCompleteCnt === 0 && !noLoadEventRetriggers && (shimMode || !baselinePassthrough)) {
      document.dispatchEvent(new Event('readystatechange'));
    }
  }

  const hasNext = script => script.nextSibling || script.parentNode && hasNext(script.parentNode);
  const epCheck = (script, ready) => script.ep || !ready && (!script.src && !script.innerHTML || !hasNext(script)) || script.getAttribute('noshim') !== null || !(script.ep = true);

  function processImportMap (script, ready = readyStateCompleteCnt > 0) {
    if (epCheck(script, ready)) return;
    // we dont currently support multiple, external or dynamic imports maps in polyfill mode to match native
    if (script.src) {
      if (!shimMode)
        return;
      setImportMapSrcOrLazy();
    }
    if (acceptingImportMaps) {
      importMapPromise = importMapPromise
        .then(async () => {
          importMap = resolveAndComposeImportMap(script.src ? await (await doFetch(script.src, getFetchOpts(script))).json() : JSON.parse(script.innerHTML), script.src || baseUrl, importMap);
        })
        .catch(e => {
          console.log(e);
          if (e instanceof SyntaxError)
            e = new Error(`Unable to parse import map ${e.message} in: ${script.src || script.innerHTML}`);
          throwError(e);
        });
      if (!shimMode)
        acceptingImportMaps = false;
    }
  }

  function processScript (script, ready = readyStateCompleteCnt > 0) {
    if (epCheck(script, ready)) return;
    // does this load block readystate complete
    const isBlockingReadyScript = script.getAttribute('async') === null && readyStateCompleteCnt > 0;
    // does this load block DOMContentLoaded
    const isDomContentLoadedScript = domContentLoadedCnt > 0;
    if (isBlockingReadyScript) readyStateCompleteCnt++;
    if (isDomContentLoadedScript) domContentLoadedCnt++;
    const loadPromise = topLevelLoad(script.src || baseUrl, getFetchOpts(script), !script.src && script.innerHTML, !shimMode, isBlockingReadyScript && lastStaticLoadPromise)
      .then(() => {
        // if the type of the script tag "module-shim", browser does not dispatch a "load" event
        // see https://github.com/guybedford/es-module-shims/issues/346
        if (shimMode) {
          script.dispatchEvent(new Event('load'));
        }
      })
      .catch(throwError);
    if (isBlockingReadyScript)
      lastStaticLoadPromise = loadPromise.then(readyStateCompleteCheck);
    if (isDomContentLoadedScript)
      loadPromise.then(domContentLoadedCheck);
  }

  const fetchCache = {};
  function processPreload (link) {
    if (link.ep) return;
    link.ep = true;
    if (fetchCache[link.href])
      return;
    fetchCache[link.href] = fetchModule(link.href, getFetchOpts(link));
  }

})();
