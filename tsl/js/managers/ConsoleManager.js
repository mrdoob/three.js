import { setConsoleFunction, getConsoleFunction } from 'three';

class ConsoleManager {

	constructor( guide ) {

		this.guide = guide;
		this.originalConsoleError = console.error;
		this.originalConsoleWarn = console.warn;

		this._initConsoleOverrides();
		this._initRunnerListeners();

	}

	_initConsoleOverrides() {

		const previousConsoleFn = getConsoleFunction();
		const handledMessages = new Set();

		setConsoleFunction( ( type, message, ...params ) => {

			if ( previousConsoleFn ) {

				previousConsoleFn( type, message, ...params );

			}

			handledMessages.add( message );
			queueMicrotask( () => handledMessages.delete( message ) );

			if ( typeof message === 'string' && message.includes( '%c' ) ) {

				return;

			}

			let line = null;
			let column = null;

			const stackTrace = params.find( arg => arg && arg.isStackTrace );
			if ( stackTrace && stackTrace.stack && stackTrace.stack.length > 0 ) {

				const frame = stackTrace.stack.find( f => f.file === 'playground-eval.js' );
				if ( frame && frame.line && frame.line > 2 ) {

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
			if ( line !== null && ! isNaN( line ) && line > 0 ) {

				cleanMsg = cleanMsg.replace( /\s+(?:["']?[a-zA-Z0-9_$]+\(\)["']?\s+at\s+)?["']?[^"'\s]+\.js:\d+["']?/, '' );

			}

			const displayMessage = ( line !== null && ! isNaN( line ) && line > 0 ) ? `Line ${line}: ${cleanMsg}` : cleanMsg;

			let eventType = 'log';
			if ( type === 'error' ) eventType = 'error-log';
			else if ( type === 'warn' ) eventType = 'warn-log';

			if ( eventType === 'error-log' || eventType === 'warn-log' ) {

				this.guide.runner.dispatchEvent( {
					type: eventType,
					message: displayMessage,
					line: line,
					column: column,
					errorMsg: cleanMsg
				} );

			} else {

				this.guide.runner.dispatchEvent( { type: eventType, message: msg } );

			}

		} );

		console.error = ( ...args ) => {

			this.originalConsoleError.apply( console, args );

			const firstArg = args[ 0 ];
			const rawMsg = firstArg instanceof Error ? firstArg.message : firstArg;
			if ( typeof rawMsg === 'string' && ( rawMsg.includes( '%c' ) || handledMessages.has( rawMsg ) ) ) {

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

				const parsedLine = parseInt( match[ 1 ] ) - 2;
				if ( parsedLine > 0 ) {

					line = parsedLine;
					column = parseInt( match[ 2 ] );

				}

			} else {

				match = stack.match( /<anonymous>:(\d+):(\d+)/ );
				if ( match ) {

					const parsedLine = parseInt( match[ 1 ] ) - 2;
					if ( parsedLine > 0 ) {

						line = parsedLine;
						column = parseInt( match[ 2 ] );

					}

				}

			}

			let cleanMsg = msg.split( '\n' )[ 0 ];
			cleanMsg = cleanMsg.replace( /\s+["']?eval\(\)["']?\s+at\s+["']?[^"'\s]+\.js:\d+["']?/, '' );

			const displayMessage = ( typeof line === 'number' && line > 0 ) ? `Line ${line}: ${cleanMsg}` : cleanMsg;

			this.guide.runner.dispatchEvent( {
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
			const rawMsg = firstArg instanceof Error ? firstArg.message : firstArg;
			if ( typeof rawMsg === 'string' && ( rawMsg.includes( '%c' ) || handledMessages.has( rawMsg ) ) ) {

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

			this.guide.runner.dispatchEvent( { type: 'warn-log', message: msg } );

		};

	}

	_initRunnerListeners() {

		this.onStart = () => {

			this.guide.dom.consoleErrorMessage.textContent = '';
			if ( this.guide.codeEditor ) {

				this.guide.codeEditor.clearMarkers();

			}

			this.updateConsoleButtonsState();

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

			if ( event.line !== null && event.line > 0 && this.guide.codeEditor ) {

				this.guide.codeEditor.setErrorMarker( event.line, event.column, event.errorMsg || event.message );

			}

		};

		this.onSuccess = () => {

			if ( this.guide.isPlaygroundActive ) {

				this.guide.updateDebugWGSL();
				setTimeout( () => this.guide.updateDebugWGSL(), 500 );

			}

			if ( ! this.guide.dom.consoleErrorMessage.hasChildNodes() ) {

				this.toggleConsole( true );

			}

		};

		this.onError = ( event ) => {

			this.appendConsoleLine( event.message, '#fca5a5', event );

			if ( event.line !== null && event.line > 0 && this.guide.codeEditor ) {

				this.guide.codeEditor.setErrorMarker( event.line, event.column, event.error.toString() );

			}

			this.toggleConsole( false );

		};

		this.guide.runner.addEventListener( 'start', this.onStart );
		this.guide.runner.addEventListener( 'log', this.onLog );
		this.guide.runner.addEventListener( 'warn-log', this.onWarn );
		this.guide.runner.addEventListener( 'error-log', this.onErrorLog );
		this.guide.runner.addEventListener( 'success', this.onSuccess );
		this.guide.runner.addEventListener( 'error', this.onError );

	}

	log( message ) {

		this.appendConsoleLine( message, '#e2e8f0' );
		this.toggleConsole( false );

	}

	warn( message ) {

		this.appendConsoleLine( message, '#fde047' );
		this.toggleConsole( false );

	}

	error( message ) {

		this.appendConsoleLine( message, '#fca5a5' );
		this.toggleConsole( false );

	}

	appendConsoleLine( message, color, clickableEvent = null ) {

		const line = document.createElement( 'div' );
		line.className = 'console-line';
		line.style.color = color;

		const textSpan = document.createElement( 'span' );
		textSpan.className = 'console-line-text';
		textSpan.textContent = message;
		line.appendChild( textSpan );

		if ( clickableEvent && clickableEvent.line !== null && clickableEvent.line > 0 && this.guide.codeEditor ) {

			const jumpBtn = document.createElement( 'button' );
			jumpBtn.className = 'console-jump-btn';
			jumpBtn.title = 'Click to jump to error';

			const icon = document.createElement( 'i' );
			icon.setAttribute( 'data-icon', 'external-link' );
			jumpBtn.appendChild( icon );

			jumpBtn.onclick = ( e ) => {

				e.stopPropagation();
				this.guide.codeEditor.revealLine( clickableEvent.line, clickableEvent.column || 1 );

			};

			line.appendChild( jumpBtn );

		}

		this.guide.dom.consoleErrorMessage.appendChild( line );

		// Instantiate icons if any were added
		this.guide.createIcons( line );

		while ( this.guide.dom.consoleErrorMessage.childElementCount > 100 ) {

			this.guide.dom.consoleErrorMessage.removeChild( this.guide.dom.consoleErrorMessage.firstChild );

		}

		this.guide.dom.consoleErrorMessage.scrollTop = this.guide.dom.consoleErrorMessage.scrollHeight;

		this.updateConsoleButtonsState();

	}

	toggleConsole( forceState ) {

		const consolePanel = this.guide.dom.editorConsole;
		const toggleIcon = this.guide.dom.consoleToggleIcon;

		const isMinimized = forceState !== undefined ? forceState : ! consolePanel.classList.contains( 'minimized' );

		if ( isMinimized ) {

			consolePanel.classList.add( 'minimized' );
			toggleIcon.setAttribute( 'data-icon', 'chevron-up' );

		} else {

			consolePanel.classList.remove( 'minimized' );
			toggleIcon.setAttribute( 'data-icon', 'chevron-down' );

		}

		this.guide.createIcons( this.guide.dom.consoleToggleBtn );

		if ( this.guide.codeEditor ) {

			this.guide.codeEditor.layout();

		}

	}

	clearConsole() {

		this.guide.dom.consoleErrorMessage.textContent = '';
		this.updateConsoleButtonsState();

	}

	copyConsole() {

		const lines = Array.from( this.guide.dom.consoleErrorMessage.querySelectorAll( '.console-line-text' ) )
			.map( span => span.textContent );
		const text = lines.join( '\n' );
		if ( ! text ) return;

		navigator.clipboard.writeText( text ).then( () => {

			const btn = this.guide.dom.consoleCopyBtn;
			btn.classList.add( 'success' );
			btn.innerHTML = '<i data-icon="check" style="width: 0.95rem; height: 0.95rem;"></i>';
			this.guide.createIcons( btn );

			setTimeout( () => {

				btn.classList.remove( 'success' );
				btn.innerHTML = '<i data-icon="copy" style="width: 0.95rem; height: 0.95rem;"></i>';
				this.guide.createIcons( btn );

			}, 2000 );

		} );

	}

	updateConsoleButtonsState() {

		const hasLogs = this.guide.dom.consoleErrorMessage.childElementCount > 0;
		const clearBtn = this.guide.dom.consoleClearBtn;
		const copyBtn = this.guide.dom.consoleCopyBtn;

		if ( hasLogs ) {

			clearBtn.removeAttribute( 'disabled' );

		} else {

			clearBtn.setAttribute( 'disabled', 'true' );

		}

		if ( hasLogs ) {

			copyBtn.removeAttribute( 'disabled' );

		} else {

			copyBtn.setAttribute( 'disabled', 'true' );

		}

	}

	dispose() {

		console.error = this.originalConsoleError;
		console.warn = this.originalConsoleWarn;

		this.guide.runner.removeEventListener( 'start', this.onStart );
		this.guide.runner.removeEventListener( 'log', this.onLog );
		this.guide.runner.removeEventListener( 'warn-log', this.onWarn );
		this.guide.runner.removeEventListener( 'error-log', this.onErrorLog );
		this.guide.runner.removeEventListener( 'success', this.onSuccess );
		this.guide.runner.removeEventListener( 'error', this.onError );

	}

}

export { ConsoleManager };
