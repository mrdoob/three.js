import { REVISION } from 'three/webgpu';

const STORAGE_KEY = 'threejs-inspector';

function getItem( id ) {

	if ( typeof localStorage === 'undefined' ) return {};

	const data = JSON.parse( localStorage.getItem( STORAGE_KEY ) || '{}' );

	if ( data.version !== REVISION ||
		 data.settings && ( data.settings.storage === 'url' && data.settings.url !== location.href ) ) {

		localStorage.removeItem( STORAGE_KEY );

		return {};

	}

	return data[ id ] || {};

}

function setItem( id, state ) {

	if ( typeof localStorage === 'undefined' ) return;

	const data = JSON.parse( localStorage.getItem( STORAGE_KEY ) || '{}' );

	if ( state === null ) {

		delete data[ id ];

	} else {

		data[ id ] = state;

	}

	data.settings = data.settings || {};
	data.settings.url = data.settings.url || location.href;
	data.settings.storage = data.settings.storage || 'url';
	data.version = REVISION;

	localStorage.setItem( STORAGE_KEY, JSON.stringify( data ) );

}

export { getItem, setItem };
