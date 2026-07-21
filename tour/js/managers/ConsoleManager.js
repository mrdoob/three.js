import { setConsoleFunction, getConsoleFunction } from 'three';

class ConsoleManager {

	constructor( tour ) {

		this.tour = tour;
		this.originalConsoleError = console.error;
		this.originalConsoleWarn = console.warn;

		this._initConsoleOverrides();
		this._initRunnerListeners();

	}

	_initConsoleOverrides() {

		const previousConsoleFn = getConsoleFunction();

		setConsoleFunction( ( type, message, ...params ) => {

			if ( previousConsoleFn ) {

				previousConsoleFn( type, message, ...params );

			}

			if ( typeof message === 'string' && message.includes( '%c' ) ) {

				return;

			}

			let line = null;
			let column = null;

			const stackTrace = params.find( arg => arg && arg.isStackTrace );
			if ( stackTrace && stackTrace.stack && stackTrace.stack.length > 0 ) {

				const frame = stackTrace.stack.find( f => f.file === 'playground-eval.js' );
				if ( frame ) {

					line = frame.line - 2;
					column = frame.column;

				}

			}

			const filteredParams = params.filter( arg => ! ( arg && arg.isStackTrace ) );

			let msg = [ message, ...filteredParams ].map( arg => {

				if ( typeof arg === 'object' && arg !== null ) {

					try {

						return JSON.stringify( arg );

					} catch {

						return String( arg );

					}

				}

				return String( arg );

			} ).join( ' ' );

			if ( msg.startsWith( 'THREE.' ) ) {

				msg = msg.substring( 6 );

			}

			let cleanMsg = msg;
			if ( line !== null ) {

				cleanMsg = cleanMsg.replace( /\s+(?:["']?[a-zA-Z0-9_$]+\(\)["']?\s+at\s+)?["']?[^"'\s]+\.js:\d+["']?/, '' );

			}

			const displayMessage = line !== null ? `Line ${line}: ${cleanMsg}` : cleanMsg;

			let eventType = 'log';
			if ( type === 'error' ) eventType = 'error-log';
			else if ( type === 'warn' ) eventType = 'warn-log';

			if ( eventType === 'error-log' || eventType === 'warn-log' ) {

				this.tour.runner.dispatchEvent( {
					type: eventType,
					message: displayMessage,
					line: line,
					column: column,
					errorMsg: cleanMsg
				} );

			} else {

				this.tour.runner.dispatchEvent( { type: eventType, message: msg } );

			}

		} );

		console.error = ( ...args ) => {

			this.originalConsoleError.apply( console, args );

			const firstArg = args[ 0 ];
			if ( typeof firstArg === 'string' && firstArg.includes( '%c' ) ) {

				return;

			}

			const msg = args.map( arg => {

				if ( arg instanceof Error ) {

					return arg.message || String( arg );

				}

				if ( typeof arg === 'object' && arg !== null ) {

					try {

						return JSON.stringify( arg );

					} catch {

						return String( arg );

					}

				}

				return String( arg );

			} ).join( ' ' );

			let line = null;
			let column = null;
			const stack = new Error().stack || '';
			let match = stack.match( /playground-eval\.js:(\d+):(\d+)/ );
			if ( match ) {

				line = parseInt( match[ 1 ] ) - 2;
				column = parseInt( match[ 2 ] );

			} else {

				match = stack.match( /<anonymous>:(\d+):(\d+)/ );
				if ( match ) {

					line = parseInt( match[ 1 ] ) - 2;
					column = parseInt( match[ 2 ] );

				}

			}

			let cleanMsg = msg.split( '\n' )[ 0 ];
			cleanMsg = cleanMsg.replace( /\s+["']?eval\(\)["']?\s+at\s+["']?[^"'\s]+\.js:\d+["']?/, '' );

			const displayMessage = line !== null ? `Line ${line}: ${cleanMsg}` : cleanMsg;

			this.tour.runner.dispatchEvent( {
				type: 'error-log',
				message: displayMessage,
				line: line,
				column: column,
				errorMsg: cleanMsg
			} );

		};

		console.warn = ( ...args ) => {

			this.originalConsoleWarn.apply( console, args );

			const firstArg = args[ 0 ];
			if ( typeof firstArg === 'string' && firstArg.includes( '%c' ) ) {

				return;

			}

			const msg = args.map( arg => {

				if ( arg instanceof Error ) {

					return arg.message || String( arg );

				}

				if ( typeof arg === 'object' && arg !== null ) {

					try {

						return JSON.stringify( arg );

					} catch {

						return String( arg );

					}

				}

				return String( arg );

			} ).join( ' ' );

			this.tour.runner.dispatchEvent( { type: 'warn-log', message: msg } );

		};

	}

	_initRunnerListeners() {

		this.onStart = () => {

			this.tour.dom.consoleErrorMessage.textContent = '';
			if ( this.tour.codeEditor ) {

				this.tour.codeEditor.clearMarkers();

			}

		};

		this.onLog = ( event ) => {

			this.appendConsoleLine( event.message, '#e2e8f0' );
			this.toggleConsole( false );

		};

		this.onWarn = ( event ) => {

			this.appendConsoleLine( event.message, '#fde047', event );
			this.toggleConsole( false );

		};

		this.onErrorLog = ( event ) => {

			this.appendConsoleLine( event.message, '#fca5a5', event );
			this.toggleConsole( false );

			if ( event.line !== null && event.line > 0 && this.tour.codeEditor ) {

				this.tour.codeEditor.setErrorMarker( event.line, event.column, event.errorMsg || event.message );

			}

		};

		this.onSuccess = () => {

			if ( this.tour.isPlaygroundActive ) {

				this.tour.updateDebugWGSL();
				setTimeout( () => this.tour.updateDebugWGSL(), 500 );

			}

			if ( ! this.tour.dom.consoleErrorMessage.hasChildNodes() ) {

				this.toggleConsole( true );

			}

		};

		this.onError = ( event ) => {

			this.appendConsoleLine( event.message, '#fca5a5', event );

			if ( event.line !== null && event.line > 0 && this.tour.codeEditor ) {

				this.tour.codeEditor.setErrorMarker( event.line, event.column, event.error.toString() );

			}

			this.toggleConsole( false );

		};

		this.tour.runner.addEventListener( 'start', this.onStart );
		this.tour.runner.addEventListener( 'log', this.onLog );
		this.tour.runner.addEventListener( 'warn-log', this.onWarn );
		this.tour.runner.addEventListener( 'error-log', this.onErrorLog );
		this.tour.runner.addEventListener( 'success', this.onSuccess );
		this.tour.runner.addEventListener( 'error', this.onError );

	}

	appendConsoleLine( message, color, clickableEvent = null ) {

		const line = document.createElement( 'div' );
		line.style.color = color;
		line.style.padding = '6px 14px';
		line.style.borderBottom = '1px solid rgba(255, 255, 255, 0.05)';
		line.textContent = message;

		if ( clickableEvent && clickableEvent.line !== null && clickableEvent.line > 0 && this.tour.codeEditor ) {

			line.style.cursor = 'pointer';
			line.title = 'Click to jump to error';
			line.onclick = () => {

				this.tour.codeEditor.revealLine( clickableEvent.line, clickableEvent.column || 1 );

			};

			line.addEventListener( 'mouseenter', () => {

				line.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';

			} );

			line.addEventListener( 'mouseleave', () => {

				line.style.backgroundColor = 'transparent';

			} );

		}

		this.tour.dom.consoleErrorMessage.appendChild( line );

		while ( this.tour.dom.consoleErrorMessage.childElementCount > 100 ) {

			this.tour.dom.consoleErrorMessage.removeChild( this.tour.dom.consoleErrorMessage.firstChild );

		}

		this.tour.dom.consoleErrorMessage.scrollTop = this.tour.dom.consoleErrorMessage.scrollHeight;

	}

	toggleConsole( forceState ) {

		const consolePanel = this.tour.dom.editorConsole;
		const toggleIcon = this.tour.dom.consoleToggleIcon;

		const isMinimized = forceState !== undefined ? forceState : ! consolePanel.classList.contains( 'minimized' );

		if ( isMinimized ) {

			consolePanel.classList.add( 'minimized' );
			toggleIcon.setAttribute( 'data-icon', 'chevron-up' );

		} else {

			consolePanel.classList.remove( 'minimized' );
			toggleIcon.setAttribute( 'data-icon', 'chevron-down' );

		}

		this.tour.createIcons( this.tour.dom.consoleToggleBtn );

		if ( this.tour.codeEditor ) {

			this.tour.codeEditor.layout();

		}

	}

	dispose() {

		console.error = this.originalConsoleError;
		console.warn = this.originalConsoleWarn;

		this.tour.runner.removeEventListener( 'start', this.onStart );
		this.tour.runner.removeEventListener( 'log', this.onLog );
		this.tour.runner.removeEventListener( 'warn-log', this.onWarn );
		this.tour.runner.removeEventListener( 'error-log', this.onErrorLog );
		this.tour.runner.removeEventListener( 'success', this.onSuccess );
		this.tour.runner.removeEventListener( 'error', this.onError );

	}

}

export { ConsoleManager };
