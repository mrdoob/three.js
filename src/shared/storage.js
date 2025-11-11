const STORAGE_KEY = 'threejs_devtools_enabled_v1';

export async function getEnabled() {
	if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
		
		return new Promise( ( resolve ) => {
			
			chrome.storage.local.get( [ STORAGE_KEY ], ( items ) => {
				resolve( items && items[ STORAGE_KEY ] !== undefined ? items[ STORAGE_KEY ] : true );
			} );
			
		} );
		
	}
	try {
		
		const raw = window.localStorage.getItem( STORAGE_KEY );
		return raw === null ? true : raw === 'true';
		
	} catch ( e ) {
		
		return true;
		
	}
}

export function setEnabled( value ) {
	if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
		
		chrome.storage.local.set( { [ STORAGE_KEY ]: Boolean( value ) } );
		return;
		
	}
	try {
		
		window.localStorage.setItem( STORAGE_KEY, Boolean( value ).toString() );
		
	} catch ( e ) {
		console.log(e)
	}
}
