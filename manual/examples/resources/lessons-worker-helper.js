/*
 * Copyright 2019, Gregg Tavares.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Gregg Tavares. nor the names of his
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/* global */

'use strict';  // eslint-disable-line

(function() {

  const lessonSettings = self.lessonSettings || {};

  function isInEditor() {
    return self.location.href.substring(0, 4) === 'blob';
  }

  function sendMessage(data) {
    self.postMessage({
      type: '__editor__',
      data,
    });
  }

  const origConsole = {};

  function setupConsole() {
    function wrapFunc(obj, logType) {
      const origFunc = obj[logType].bind(obj);
      origConsole[logType] = origFunc;
      return function(...args) {
        origFunc(...args);
        sendMessage({
          type: 'log',
          logType,
          msg: [...args].join(' '),
        });
      };
    }
    self.console.log = wrapFunc(self.console, 'log');
    self.console.warn = wrapFunc(self.console, 'warn');
    self.console.error = wrapFunc(self.console, 'error');
  }

  /**
   * Gets a WebGL context.
   * makes its backing store the size it is displayed.
   * @param {OffscreenCanvas} canvas a canvas element.
   * @memberOf module:webgl-utils
   */
  let setupLesson = function(canvas) {
    // only once
    setupLesson = function() {};

    if (canvas) {
      canvas.addEventListener('webglcontextlost', function() {
          // the default is to do nothing. Preventing the default
          // means allowing context to be restored
          // e.preventDefault();  // can't do this because firefox bug - https://bugzilla.mozilla.org/show_bug.cgi?id=1633280
          sendMessage({
            type: 'lostContext',
          });
      });
    }

  };

  function captureJSErrors() {
    // capture JavaScript Errors
    self.addEventListener('error', function(e) {
      const msg = e.message || e.error;
      const url = e.filename;
      const lineNo = e.lineno || 1;
      const colNo = e.colno || 1;
      sendMessage({
        type: 'jsError',
        lineNo,
        colNo,
        url,
        msg,
      });
    });
  }


  const isWebGLRE = /^(webgl|webgl2|experimental-webgl)$/i;
  function installWebGLLessonSetup() {
    OffscreenCanvas.prototype.getContext = (function(oldFn) {
      return function() {
        const type = arguments[0];
        const isWebGL = isWebGLRE.test(type);
        if (isWebGL) {
          setupLesson(this);
        }
        const args = [].slice.apply(arguments);
        args[1] = {
          powerPreference: 'low-power',
          ...args[1],
        };
        return oldFn.apply(this, args);
      };
    }(OffscreenCanvas.prototype.getContext));
  }

  function installWebGLDebugContextCreator() {
    if (!self.webglDebugHelper) {
      return;
    }

    const {
      makeDebugContext,
      glFunctionArgToString,
      glEnumToString,
    } = self.webglDebugHelper;

    // capture GL errors
    OffscreenCanvas.prototype.getContext = (function(oldFn) {
      return function() {
        let ctx = oldFn.apply(this, arguments);
        // Using bindTexture to see if it's WebGL. Could check for instanceof WebGLRenderingContext
        // but that might fail if wrapped by debugging extension
        if (ctx && ctx.bindTexture) {
          ctx = makeDebugContext(ctx, {
            maxDrawCalls: 100,
            errorFunc: function(err, funcName, args) {
              const numArgs = args.length;
              const enumedArgs = [].map.call(args, function(arg, ndx) {
                let str = glFunctionArgToString(funcName, numArgs, ndx, arg);
                // shorten because of long arrays
                if (str.length > 200) {
                  str = str.substring(0, 200) + '...';
                }
                return str;
              });

              {
                const error = new Error();
                sendMessage({
                  type: 'jsErrorWithStack',
                  stack: error.stack,
                  msg: `${glEnumToString(err)} in ${funcName}(${enumedArgs.join(', ')})`,
                });
              }
            },
          });
        }
        return ctx;
      };
    }(OffscreenCanvas.prototype.getContext));
  }

  installWebGLLessonSetup();

  if (isInEditor()) {
    setupConsole();
    captureJSErrors();
    if (lessonSettings.glDebug !== false) {
      installWebGLDebugContextCreator();
    }
  }

}());

