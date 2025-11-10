
( function () {
	const STORAGE_KEY = 'threejs_devtools_enabled_v1';

	function readStorage( cb ) {
		if ( typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local ) {
			
			chrome.storage.local.get( [ STORAGE_KEY ], ( items ) => {
				cb( items && items[ STORAGE_KEY ] !== undefined ? items[ STORAGE_KEY ] : true );
			} );
			return;
			
		}
		try {
			
			const raw = window.localStorage.getItem( STORAGE_KEY );
			cb( raw === null ? true : raw === 'true' );
			
		} catch ( e ) {
			cb( true );
		}
	}

	function writeStorage( value ) {
		if ( typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local ) {
			
			chrome.storage.local.set( { [ STORAGE_KEY ]: Boolean( value ) } );
			try {
				chrome.runtime.sendMessage( { type: 'THREEJS_TOOL_ENABLED', enabled: value } );
			} catch ( e ) {
				// ignore
			}
			return;
			
		}
		try {
			
			window.localStorage.setItem( STORAGE_KEY, Boolean( value ).toString() );
			
		} catch ( e ) {}
	}

	function createHeader( root, initial ) {
		const header = document.createElement( 'div' );
		header.style.display = 'flex';
		header.style.alignItems = 'center';
		header.style.justifyContent = 'space-between';
		header.style.padding = '8px 12px';
		header.style.borderBottom = '1px solid #eee';

		const title = document.createElement( 'div' );
		title.style.fontWeight = '600';
		title.textContent = 'Three.js DevTools';

		const label = document.createElement( 'label' );
		label.style.display = 'flex';
		label.style.alignItems = 'center';
		label.style.gap = '8px';

		const stateText = document.createElement( 'span' );
		stateText.style.fontSize = '12px';
		stateText.textContent = initial ? 'Enabled' : 'Disabled';

		const checkbox = document.createElement( 'input' );
		checkbox.type = 'checkbox';
		checkbox.checked = Boolean( initial );
		checkbox.setAttribute( 'aria-label', 'Enable Three.js DevTools' );

		checkbox.addEventListener( 'change', () => {
			const val = checkbox.checked;
			stateText.textContent = val ? 'Enabled' : 'Disabled';
			writeStorage( val );
		} );

		label.appendChild( stateText );
		label.appendChild( checkbox );

		header.appendChild( title );
		header.appendChild( label );

		root.appendChild( header );
	}

	// mount
	window.addEventListener( 'DOMContentLoaded', () => {
		const root = document.getElementById( 'root' ) || document.body;
		readStorage( ( enabled ) => {
			createHeader( root, enabled );

			const bodyInfo = document.createElement( 'div' );
			bodyInfo.style.padding = '12px';
			bodyInfo.textContent = enabled ? 'Tool is enabled.' : 'Three.js DevTools is currently disabled. Toggle the switch to re-enable.';
			root.appendChild( bodyInfo );
		} );
	} );
} )();
