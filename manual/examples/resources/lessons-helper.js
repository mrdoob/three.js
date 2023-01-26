/*
 * Copyright 2012, Gregg Tavares.
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

/* global define */

(function(root, factory) {  // eslint-disable-line
	if ( typeof define === 'function' && define.amd ) {

		// AMD. Register as an anonymous module.
		define( [], function () {

			return factory.call( root );

		} );

	} else {

		// Browser globals
		root.lessonsHelper = factory.call( root );

	}

}( this, function () {

  'use strict';  // eslint-disable-line

	const lessonSettings = window.lessonSettings || {};
	const topWindow = this;

	/**
   * Check if the page is embedded.
   * @param {Window?) w window to check
   * @return {boolean} True of we are in an iframe
   */
	function isInIFrame( w ) {

		w = w || topWindow;
		return w !== w.top;

	}

	function updateCSSIfInIFrame() {

		if ( isInIFrame() ) {

			try {

				document.getElementsByTagName( 'html' )[ 0 ].className = 'iframe';

			} catch ( e ) {
        // eslint-disable-line
			}

			try {

				document.body.className = 'iframe';

			} catch ( e ) {
        // eslint-disable-line
			}

		}

	}

	function isInEditor() {

		return window.location.href.substring( 0, 4 ) === 'blob';

	}

	/**
   * Creates a webgl context. If creation fails it will
   * change the contents of the container of the <canvas>
   * tag to an error message with the correct links for WebGL.
   * @param {HTMLCanvasElement} canvas. The canvas element to
   *     create a context from.
   * @param {WebGLContextCreationAttributes} opt_attribs Any
   *     creation attributes you want to pass in.
   * @return {WebGLRenderingContext} The created context.
   * @memberOf module:webgl-utils
   */
	function showNeedWebGL( canvas ) {

		const doc = canvas.ownerDocument;
		if ( doc ) {

			const temp = doc.createElement( 'div' );
			temp.innerHTML = `
        <div style="
          position: absolute;
          left: 0;
          top: 0;
          background-color: #DEF;
          width: 100%;
          height: 100%;
          display: flex;
          flex-flow: column;
          justify-content: center;
          align-content: center;
          align-items: center;
        ">
          <div style="text-align: center;">
            It doesn't appear your browser supports WebGL.<br/>
            <a href="http://get.webgl.org" target="_blank">Click here for more information.</a>
          </div>
        </div>
      `;
			const div = temp.querySelector( 'div' );
			doc.body.appendChild( div );

		}

	}

	const origConsole = {};

	function setupConsole() {

		const style = document.createElement( 'style' );
		style.innerText = `
    .console {
      font-family: monospace;
      font-size: medium;
      max-height: 50%;
      position: fixed;
      bottom: 0;
      left: 0;
      width: 100%;
      overflow: auto;
      background: rgba(221, 221, 221, 0.9);
    }
    .console .console-line {
      white-space: pre-line;
    }
    .console .log .warn {
      color: black;
    }
    .console .error {
      color: red;
    }
    `;
		const parent = document.createElement( 'div' );
		parent.className = 'console';
		const toggle = document.createElement( 'div' );
		let show = false;
		Object.assign( toggle.style, {
			position: 'absolute',
			right: 0,
			bottom: 0,
			background: '#EEE',
			'font-size': 'smaller',
			cursor: 'pointer',
		} );
		toggle.addEventListener( 'click', showHideConsole );

		function showHideConsole() {

			show = ! show;
			toggle.textContent = show ? '☒' : '☐';
			parent.style.display = show ? '' : 'none';

		}

		showHideConsole();

		const maxLines = 100;
		const lines = [];
		let added = false;

		function addLine( type, str, prefix ) {

			const div = document.createElement( 'div' );
			div.textContent = ( prefix + str ) || ' ';
			div.className = `console-line ${type}`;
			parent.appendChild( div );
			lines.push( div );
			if ( ! added ) {

				added = true;
				document.body.appendChild( style );
				document.body.appendChild( parent );
				document.body.appendChild( toggle );

			}
			// scrollIntoView only works in Chrome
			// In Firefox and Safari scrollIntoView inside an iframe moves
			// that element into the view. It should arguably only move that
			// element inside the iframe itself, otherwise that's giving
			// any random iframe control to bring itself into view against
			// the parent's wishes.
			//
			// note that even if we used a solution (which is to manually set
			// scrollTop) there's a UI issue that if the user manually scrolls
			// we want to stop scrolling automatically and if they move back
			// to the bottom we want to pick up scrolling automatically.
			// Kind of a PITA so TBD
			//
			// div.scrollIntoView();

		}

		function addLines( type, str, prefix ) {

			while ( lines.length > maxLines ) {

				const div = lines.shift();
				div.parentNode.removeChild( div );

			}

			addLine( type, str, prefix );

		}

		const threePukeRE = /WebGLRenderer.*?extension not supported/;
		function wrapFunc( obj, funcName, prefix ) {

			const oldFn = obj[ funcName ];
			origConsole[ funcName ] = oldFn.bind( obj );
			return function ( ...args ) {

				// three.js pukes all over so filter here
				const src = [ ...args ].join( ' ' );
				if ( ! threePukeRE.test( src ) ) {

					addLines( funcName, src, prefix );

				}

				oldFn.apply( obj, arguments );

			};

		}

		window.console.log = wrapFunc( window.console, 'log', '' );
		window.console.warn = wrapFunc( window.console, 'warn', '⚠' );
		window.console.error = wrapFunc( window.console, 'error', '❌' );

	}

	function reportJSError( url, lineNo, colNo, msg ) {

		try {

			const { origUrl, actualLineNo } = window.parent.getActualLineNumberAndMoveTo( url, lineNo, colNo );
			url = origUrl;
			lineNo = actualLineNo;

		} catch ( ex ) {

			origConsole.error( ex );

		}
    console.error(url, "line:", lineNo, ":", msg);  // eslint-disable-line
	}

	/**
   * @typedef {Object} StackInfo
   * @property {string} url Url of line
   * @property {number} lineNo line number of error
   * @property {number} colNo column number of error
   * @property {string} [funcName] name of function
   */

	/**
   * @parameter {string} stack A stack string as in `(new Error()).stack`
   * @returns {StackInfo}
   */
	const parseStack = function () {

		const browser = getBrowser();
		let lineNdx;
		let matcher;
		if ( ( /chrome|opera/i ).test( browser.name ) ) {

			lineNdx = 3;
			matcher = function ( line ) {

				const m = /at ([^(]*?)\(*(.*?):(\d+):(\d+)/.exec( line );
				if ( m ) {

					let userFnName = m[ 1 ];
					let url = m[ 2 ];
					const lineNo = parseInt( m[ 3 ] );
					const colNo = parseInt( m[ 4 ] );
					if ( url === '' ) {

						url = userFnName;
						userFnName = '';

					}

					return {
						url: url,
						lineNo: lineNo,
						colNo: colNo,
						funcName: userFnName,
					};

				}

				return undefined;

			};

		} else if ( ( /firefox|safari/i ).test( browser.name ) ) {

			lineNdx = 2;
			matcher = function ( line ) {

				const m = /@(.*?):(\d+):(\d+)/.exec( line );
				if ( m ) {

					const url = m[ 1 ];
					const lineNo = parseInt( m[ 2 ] );
					const colNo = parseInt( m[ 3 ] );
					return {
						url: url,
						lineNo: lineNo,
						colNo: colNo,
					};

				}

				return undefined;

			};

		}

		return function stackParser( stack ) {

			if ( matcher ) {

				try {

					const lines = stack.split( '\n' );
					// window.fooLines = lines;
					// lines.forEach(function(line, ndx) {
					//   origConsole.log("#", ndx, line);
					// });
					return matcher( lines[ lineNdx ] );

				} catch ( e ) {
					// do nothing
				}

			}

			return undefined;

		};

	}();

	function setupWorkerSupport() {

		function log( data ) {

			const { logType, msg } = data;
			console[ logType ]( '[Worker]', msg ); /* eslint-disable-line no-console */

		}

		function lostContext( /* data */ ) {

			addContextLostHTML();

		}

		function jsError( data ) {

			const { url, lineNo, colNo, msg } = data;
			reportJSError( url, lineNo, colNo, msg );

		}

		function jsErrorWithStack( data ) {

			const { url, stack, msg } = data;
			const errorInfo = parseStack( stack );
			if ( errorInfo ) {

				reportJSError( errorInfo.url || url, errorInfo.lineNo, errorInfo.colNo, msg );

			} else {

        console.error(errorMsg)  // eslint-disable-line
			}

		}

		const handlers = {
			log,
			lostContext,
			jsError,
			jsErrorWithStack,
		};
		const OrigWorker = self.Worker;
		class WrappedWorker extends OrigWorker {

			constructor( url, ...args ) {

				super( url, ...args );
				let listener;
				this.onmessage = function ( e ) {

					if ( ! e || ! e.data || e.data.type !== '___editor___' ) {

						if ( listener ) {

							listener( e );

						}

						return;

					}

					e.stopImmediatePropagation();
					const data = e.data.data;
					const fn = handlers[ data.type ];
					if ( typeof fn !== 'function' ) {

						origConsole.error( 'unknown editor msg:', data.type );

					} else {

						fn( data );

					}

					return;

				};

				Object.defineProperty( this, 'onmessage', {
					get() {

						return listener;

					},
					set( fn ) {

						listener = fn;

					},
				} );

			}

		}
		self.Worker = WrappedWorker;

	}

	function addContextLostHTML() {

		const div = document.createElement( 'div' );
		div.className = 'contextlost';
		div.innerHTML = '<div>Context Lost: Click To Reload</div>';
		div.addEventListener( 'click', function () {

			window.location.reload();

		} );
		document.body.appendChild( div );

	}

	/**
   * Gets a WebGL context.
   * makes its backing store the size it is displayed.
   * @param {HTMLCanvasElement} canvas a canvas element.
   * @memberOf module:webgl-utils
   */
	let setupLesson = function ( canvas ) {

		// only once
		setupLesson = function () {};

		if ( canvas ) {

			canvas.addEventListener( 'webglcontextlost', function () {

				// the default is to do nothing. Preventing the default
				// means allowing context to be restored
				// e.preventDefault();  // can't do this because firefox bug - https://bugzilla.mozilla.org/show_bug.cgi?id=1633280
				addContextLostHTML();

			} );
			/* can't do this because firefox bug - https://bugzilla.mozilla.org/show_bug.cgi?id=1633280
      canvas.addEventListener('webglcontextrestored', function() {
          // just reload the page. Easiest.
          window.location.reload();
      });
      */

		}

		if ( isInIFrame() ) {

			updateCSSIfInIFrame();

		}

	};

	// Replace requestAnimationFrame and cancelAnimationFrame with one
	// that only executes when the body is visible (we're in an iframe).
	// It's frustrating that th browsers don't do this automatically.
	// It's half of the point of rAF that it shouldn't execute when
	// content is not visible but browsers execute rAF in iframes even
	// if they are not visible.
	if ( topWindow.requestAnimationFrame ) {

		topWindow.requestAnimationFrame = ( function ( oldRAF, oldCancelRAF ) {

			let nextFakeRAFId = 1;
			const fakeRAFIdToCallbackMap = new Map();
			let rafRequestId;
			let isBodyOnScreen;

			function rAFHandler( time ) {

				rafRequestId = undefined;
				const ids = [ ...fakeRAFIdToCallbackMap.keys() ]; // WTF! Map.keys() iterates over live keys!
				for ( const id of ids ) {

					const callback = fakeRAFIdToCallbackMap.get( id );
					fakeRAFIdToCallbackMap.delete( id );
					if ( callback ) {

						callback( time );

					}

				}

			}

			function startRAFIfIntersectingAndNeeded() {

				if ( ! rafRequestId && isBodyOnScreen && fakeRAFIdToCallbackMap.size > 0 ) {

					rafRequestId = oldRAF( rAFHandler );

				}

			}

			function stopRAF() {

				if ( rafRequestId ) {

					oldCancelRAF( rafRequestId );
					rafRequestId = undefined;

				}

			}

			function initIntersectionObserver() {

				const intersectionObserver = new IntersectionObserver( ( entries ) => {

					entries.forEach( entry => {

						isBodyOnScreen = entry.isIntersecting;

					} );
					if ( isBodyOnScreen ) {

						startRAFIfIntersectingAndNeeded();

					} else {

						stopRAF();

					}

				} );
				intersectionObserver.observe( document.body );

			}

			function betterRAF( callback ) {

				const fakeRAFId = nextFakeRAFId ++;
				fakeRAFIdToCallbackMap.set( fakeRAFId, callback );
				startRAFIfIntersectingAndNeeded();
				return fakeRAFId;

			}

			function betterCancelRAF( id ) {

				fakeRAFIdToCallbackMap.delete( id );

			}

			topWindow.cancelAnimationFrame = betterCancelRAF;

			return function ( callback ) {

				// we need to lazy init this because this code gets parsed
				// before body exists. We could fix it by moving lesson-helper.js
				// after <body> but that would require changing 100s of examples
				initIntersectionObserver();
				topWindow.requestAnimationFrame = betterRAF;
				return betterRAF( callback );

			};

		}( topWindow.requestAnimationFrame, topWindow.cancelAnimationFrame ) );

	}

	updateCSSIfInIFrame();

	function captureJSErrors() {

		// capture JavaScript Errors
		window.addEventListener( 'error', function ( e ) {

			const msg = e.message || e.error;
			const url = e.filename;
			const lineNo = e.lineno || 1;
			const colNo = e.colno || 1;
			reportJSError( url, lineNo, colNo, msg );
			origConsole.error( e.error );

		} );

	}

	// adapted from http://stackoverflow.com/a/2401861/128511
	function getBrowser() {

		const userAgent = navigator.userAgent;
		let m = userAgent.match( /(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i ) || [];
		if ( /trident/i.test( m[ 1 ] ) ) {

			m = /\brv[ :]+(\d+)/g.exec( userAgent ) || [];
			return {
				name: 'IE',
				version: m[ 1 ],
			};

		}

		if ( m[ 1 ] === 'Chrome' ) {

			const temp = userAgent.match( /\b(OPR|Edge)\/(\d+)/ );
			if ( temp ) {

				return {
					name: temp[ 1 ].replace( 'OPR', 'Opera' ),
					version: temp[ 2 ],
				};

			}

		}

		m = m[ 2 ] ? [ m[ 1 ], m[ 2 ] ] : [ navigator.appName, navigator.appVersion, '-?' ];
		const version = userAgent.match( /version\/(\d+)/i );
		if ( version ) {

			m.splice( 1, 1, version[ 1 ] );

		}

		return {
			name: m[ 0 ],
			version: m[ 1 ],
		};

	}

	const canvasesToTimeoutMap = new Map();
	const isWebGLRE = /^(webgl|webgl2|experimental-webgl)$/i;
	const isWebGL2RE = /^webgl2$/i;
	function installWebGLLessonSetup() {

		HTMLCanvasElement.prototype.getContext = ( function ( oldFn ) {

			return function () {

				const timeoutId = canvasesToTimeoutMap.get( this );
				if ( timeoutId ) {

					clearTimeout( timeoutId );

				}

				const type = arguments[ 0 ];
				const isWebGL1or2 = isWebGLRE.test( type );
				const isWebGL2 = isWebGL2RE.test( type );
				if ( isWebGL1or2 ) {

					setupLesson( this );

				}

				const args = [].slice.apply( arguments );
				args[ 1 ] = {
					powerPreference: 'low-power',
					...args[ 1 ],
				};
				const ctx = oldFn.apply( this, args );
				if ( ! ctx ) {

					if ( isWebGL2 ) {

						// three tries webgl2 then webgl1
						// so wait 1/2 a second before showing the failure
						// message. If we get success on the same canvas
						// we'll cancel this.
						canvasesToTimeoutMap.set( this, setTimeout( () => {

							canvasesToTimeoutMap.delete( this );
							showNeedWebGL( this );

						}, 500 ) );

					} else {

						showNeedWebGL( this );

					}

				}

				return ctx;

			};

		}( HTMLCanvasElement.prototype.getContext ) );

	}

	function installWebGLDebugContextCreator() {

		if ( ! self.webglDebugHelper ) {

			return;

		}

		const {
			makeDebugContext,
			glFunctionArgToString,
			glEnumToString,
		} = self.webglDebugHelper;

		// capture GL errors
		HTMLCanvasElement.prototype.getContext = ( function ( oldFn ) {

			return function () {

				let ctx = oldFn.apply( this, arguments );
				// Using bindTexture to see if it's WebGL. Could check for instanceof WebGLRenderingContext
				// but that might fail if wrapped by debugging extension
				if ( ctx && ctx.bindTexture ) {

					ctx = makeDebugContext( ctx, {
						maxDrawCalls: 100,
						errorFunc: function ( err, funcName, args ) {

							const numArgs = args.length;
							const enumedArgs = [].map.call( args, function ( arg, ndx ) {

								let str = glFunctionArgToString( funcName, numArgs, ndx, arg );
								// shorten because of long arrays
								if ( str.length > 200 ) {

									str = str.substring( 0, 200 ) + '...';

								}

								return str;

							} );
							const errorMsg = `WebGL error ${glEnumToString( err )} in ${funcName}(${enumedArgs.join( ', ' )})`;
							const errorInfo = parseStack( ( new Error() ).stack );
							if ( errorInfo ) {

								reportJSError( errorInfo.url, errorInfo.lineNo, errorInfo.colNo, errorMsg );

							} else {

                console.error(errorMsg)  // eslint-disable-line
							}

						},
					} );

				}

				return ctx;

			};

		}( HTMLCanvasElement.prototype.getContext ) );

	}

	installWebGLLessonSetup();

	if ( isInEditor() ) {

		setupWorkerSupport();
		setupConsole();
		captureJSErrors();
		if ( lessonSettings.glDebug !== false ) {

			installWebGLDebugContextCreator();

		}

	}

	return {
		setupLesson: setupLesson,
		showNeedWebGL: showNeedWebGL,
	};

} ) );

