( function () {

	const STORAGE_KEY = 'threejs_devtools_enabled_v1';

	function getEnabled() {

		if ( typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local ) {

			return new Promise( ( resolve ) => {

				chrome.storage.local.get( [ STORAGE_KEY ], ( items ) => {

					resolve( items && items[ STORAGE_KEY ] !== undefined ? items[ STORAGE_KEY ] : true );

				} );

			} );

		}

		try {

			const raw = window.localStorage.getItem( STORAGE_KEY );
			return Promise.resolve( raw === null ? true : raw === 'true' );

		} catch ( e ) {

			return Promise.resolve( true );

		}

	}

	function initializeThreeDevTools() {

		console.log( 'initializeThreeDevTools() called.' );

	}

	getEnabled().then( ( enabled ) => {

		if ( ! enabled ) {

			try {

				if ( typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage ) {

					chrome.runtime.onMessage.addListener( ( msg, sender, reply ) => {

						if ( msg && msg.type === 'THREEJS_TOOL_ENABLED' && msg.enabled ) {

							location.reload();

						}

					} );

				}

			} catch ( e ) {
				// ignore
			}

			return;

		}

		initializeThreeDevTools();

	} );

} )();
