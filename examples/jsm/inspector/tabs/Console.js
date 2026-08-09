import { Tab } from '../ui/Tab.js';

class Console extends Tab {

	constructor( options = {} ) {

		super( 'Console', options );

		this.filters = { info: true, warn: true, error: true };
		this.filterText = '';

		this.unreadErrors = 0;
		this.unreadWarns = 0;

		this.tabBadgeContainer = document.createElement( 'span' );
		this.tabBadgeContainer.className = 'tab-badge-container';

		this.tabErrorBadge = document.createElement( 'span' );
		this.tabErrorBadge.className = 'tab-badge error';
		this.tabErrorBadge.style.display = 'none';

		this.tabWarnBadge = document.createElement( 'span' );
		this.tabWarnBadge.className = 'tab-badge warn';
		this.tabWarnBadge.style.display = 'none';

		this.tabBadgeContainer.appendChild( this.tabErrorBadge );
		this.tabBadgeContainer.appendChild( this.tabWarnBadge );
		this.button.appendChild( this.tabBadgeContainer );

		this.buildHeader();

		this.logContainer = document.createElement( 'div' );
		this.logContainer.classList.add( 'console-log' );
		this.content.appendChild( this.logContainer );

		this.lastMessage = null;

	}

	buildHeader() {

		const header = document.createElement( 'div' );
		header.className = 'toolbar';

		const filterInput = document.createElement( 'input' );
		filterInput.type = 'text';
		filterInput.className = 'console-filter-input';
		filterInput.placeholder = 'Filter...';
		filterInput.addEventListener( 'input', ( e ) => {

			this.filterText = e.target.value.toLowerCase();
			this.applyFilters();

		} );

		const copyButton = document.createElement( 'button' );
		copyButton.className = 'console-copy-button';
		copyButton.title = 'Copy all';
		copyButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
		copyButton.addEventListener( 'click', () => this.copyAll( copyButton ) );

		const buttonsGroup = document.createElement( 'div' );
		buttonsGroup.className = 'console-buttons-group';

		Object.keys( this.filters ).forEach( type => {

			const label = document.createElement( 'label' );
			label.className = 'custom-checkbox';
			label.style.color = `var(--${type === 'info' ? 'text-primary' : 'color-' + ( type === 'warn' ? 'yellow' : 'red' )})`;

			const checkbox = document.createElement( 'input' );
			checkbox.type = 'checkbox';
			checkbox.checked = this.filters[ type ];
			checkbox.dataset.type = type;

			const checkmark = document.createElement( 'span' );
			checkmark.className = 'checkmark';

			const labelText = document.createElement( 'span' );
			labelText.className = 'checkbox-text';
			labelText.textContent = type.charAt( 0 ).toUpperCase() + type.slice( 1 );

			label.appendChild( checkbox );
			label.appendChild( checkmark );
			label.appendChild( labelText );
			buttonsGroup.appendChild( label );

		} );

		buttonsGroup.addEventListener( 'change', ( e ) => {

			const type = e.target.dataset.type;
			if ( type in this.filters ) {

				this.filters[ type ] = e.target.checked;
				this.applyFilters();

			}

		} );

		buttonsGroup.appendChild( copyButton );

		header.appendChild( filterInput );
		header.appendChild( buttonsGroup );
		this.content.appendChild( header );

	}

	applyFilters() {

		const messages = this.logContainer.querySelectorAll( '.log-message' );
		messages.forEach( msg => {

			const type = msg.dataset.type;
			const text = msg.dataset.rawText.toLowerCase();

			const showByType = this.filters[ type ];
			const showByText = text.includes( this.filterText );

			msg.classList.toggle( 'hidden', ! ( showByType && showByText ) );

		} );

	}

	copyAll( button ) {

		const win = this.logContainer.ownerDocument.defaultView;
		const selection = win.getSelection();
		const selectedText = selection.toString();
		const textInConsole = selectedText && this.logContainer.contains( selection.anchorNode );

		let text;
		if ( textInConsole ) {

			text = selectedText;

		} else {

			const messages = this.logContainer.querySelectorAll( '.log-message:not(.hidden)' );
			text = Array.from( messages ).map( msg => msg.dataset.rawText ).join( '\n' );

		}

		navigator.clipboard.writeText( text );

		button.classList.add( 'copied' );
		setTimeout( () => button.classList.remove( 'copied' ), 350 );

	}

	_getIcon( type, subType ) {

		let icon;

		if ( subType === 'tip' ) {

			icon = '💭';

		} else if ( subType === 'tsl' ) {

			icon = '✨';

		} else if ( subType === 'webgpurenderer' ) {

			icon = '🎨';

		} else if ( type === 'warn' ) {

			icon = '⚠️';

		} else if ( type === 'error' ) {

			icon = '🔴';

		} else if ( type === 'info' ) {

			icon = 'ℹ️';

		}

		return icon;

	}

	_formatMessage( type, text ) {

		const fragment = document.createDocumentFragment();
		const prefixMatch = text.match( /^([\w\.]+:\s)/ );
		let content = text;

		if ( prefixMatch ) {

			const fullPrefix = prefixMatch[ 0 ];
			const parts = fullPrefix.slice( 0, - 2 ).split( '.' );
			const shortPrefix = ( parts.length > 1 ? parts[ parts.length - 1 ] : parts[ 0 ] ) + ':';

			const prefixSpan = document.createElement( 'span' );
			prefixSpan.className = 'log-prefix';
			prefixSpan.textContent = shortPrefix;
			fragment.appendChild( prefixSpan );
			content = text.substring( fullPrefix.length );

		}

		const parts = content.split( /(".*?"|'.*?'|`.*?`)/g ).map( p => p.trim() ).filter( Boolean );

		parts.forEach( ( part, index ) => {

			if ( /^("|'|`)/.test( part ) ) {

				const codeSpan = document.createElement( 'span' );
				codeSpan.className = 'log-code';
				codeSpan.textContent = part.slice( 1, - 1 );
				fragment.appendChild( codeSpan );

			} else {

				if ( index > 0 ) part = ' ' + part; // add space before parts except the first
				if ( index < parts.length - 1 ) part += ' '; // add space between parts

				fragment.appendChild( document.createTextNode( part ) );

			}

		} );

		return fragment;

	}

	setActive( isActive ) {

		super.setActive( isActive );

		if ( isActive ) {

			this.clearUnread();

		}

	}

	clearUnread() {

		this.unreadErrors = 0;
		this.unreadWarns = 0;
		this.updateBadges();

	}

	updateBadges() {

		if ( ! this.profiler ) return;

		const errorBadge = this.profiler.toggleButton.querySelector( '.console-badge.error' );
		const warnBadge = this.profiler.toggleButton.querySelector( '.console-badge.warn' );

		if ( errorBadge ) {

			if ( this.unreadErrors > 0 ) {

				errorBadge.textContent = this.unreadErrors > 99 ? '+99' : this.unreadErrors;
				errorBadge.style.display = '';

			} else {

				errorBadge.style.display = 'none';

			}

		}

		if ( warnBadge ) {

			if ( this.unreadWarns > 0 ) {

				warnBadge.textContent = this.unreadWarns > 99 ? '+99' : this.unreadWarns;
				warnBadge.style.display = '';

			} else {

				warnBadge.style.display = 'none';

			}

		}

		if ( this.tabErrorBadge ) {

			if ( this.unreadErrors > 0 ) {

				this.tabErrorBadge.textContent = this.unreadErrors > 99 ? '+99' : this.unreadErrors;
				this.tabErrorBadge.style.display = '';

			} else {

				this.tabErrorBadge.style.display = 'none';

			}

		}

		if ( this.tabWarnBadge ) {

			if ( this.unreadWarns > 0 ) {

				this.tabWarnBadge.textContent = this.unreadWarns > 99 ? '+99' : this.unreadWarns;
				this.tabWarnBadge.style.display = '';

			} else {

				this.tabWarnBadge.style.display = 'none';

			}

		}

	}

	addMessage( type, text ) {

		if ( this.lastMessage && this.lastMessage.type === type && this.lastMessage.text === text ) {

			this.lastMessage.count ++;
			this.lastMessage.countBadge.textContent = this.lastMessage.count;
			this.lastMessage.countBadge.style.display = '';

		} else {

			const msg = document.createElement( 'div' );
			msg.className = `log-message ${type}`;
			msg.dataset.type = type;
			msg.dataset.rawText = text;

			const countBadge = document.createElement( 'span' );
			countBadge.className = 'log-count-badge';
			countBadge.style.display = 'none';
			msg.appendChild( countBadge );

			let icon = null;
			const prefixMatch = text.match( /^([\w\.]+:\s)/ );
			if ( prefixMatch ) {

				const fullPrefix = prefixMatch[ 0 ];
				const parts = fullPrefix.slice( 0, - 2 ).split( '.' );
				const shortPrefix = ( parts.length > 1 ? parts[ parts.length - 1 ] : parts[ 0 ] ) + ':';
				icon = this._getIcon( type, shortPrefix.split( ':' )[ 0 ].toLowerCase() );

			}

			if ( icon ) {

				const iconSpan = document.createElement( 'span' );
				iconSpan.className = 'log-icon';
				iconSpan.textContent = icon;
				msg.appendChild( iconSpan );

			}

			const body = document.createElement( 'span' );
			body.className = 'log-body';
			body.appendChild( this._formatMessage( type, text ) );
			msg.appendChild( body );

			const showByType = this.filters[ type ];
			const showByText = text.toLowerCase().includes( this.filterText );
			msg.classList.toggle( 'hidden', ! ( showByType && showByText ) );

			this.logContainer.appendChild( msg );

			if ( this.logContainer.children.length > 200 ) {

				const firstChild = this.logContainer.firstChild;
				this.logContainer.removeChild( firstChild );
				if ( this.lastMessage && this.lastMessage.element === firstChild ) {

					this.lastMessage = null;

				}

			}

			this.lastMessage = {
				type,
				text,
				count: 1,
				element: msg,
				countBadge
			};

		}

		this.logContainer.scrollTop = this.logContainer.scrollHeight;

		// Update unread counts if the console is not active/visible
		const isUnread = ! this.isActive;

		if ( isUnread ) {

			if ( type === 'error' ) {

				this.unreadErrors ++;
				this.updateBadges();

			} else if ( type === 'warn' ) {

				this.unreadWarns ++;
				this.updateBadges();

			}

		}

	}

}

export { Console };
