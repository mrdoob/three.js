export function createValueSpan() {

	const span = document.createElement( 'span' );
	span.className = 'value';

	return span;

}

export function setText( element, text ) {

	if ( element && element.textContent !== text ) {

		element.textContent = text;

	}

}

export function getText( element ) {

	return element ? element.textContent : null;

}

export function splitPath( fullPath ) {

	const lastSlash = fullPath.lastIndexOf( '/' );

	if ( lastSlash === - 1 ) {

		return {
			path: '',
			name: fullPath.trim()
		};

	}

	const path = fullPath.substring( 0, lastSlash ).trim();
	const name = fullPath.substring( lastSlash + 1 ).trim();

	return { path, name };

}

export function splitCamelCase( str ) {

	return str.replace( /([a-z0-9])([A-Z])/g, '$1 $2' ).trim();

}

export function formatBytes( bytes, decimals = 2 ) {

	if ( bytes === 0 ) return '0 Bytes';

	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = [ 'Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB' ];
	const i = Math.floor( Math.log( bytes ) / Math.log( k ) );

	return parseFloat( ( bytes / Math.pow( k, i ) ).toFixed( dm ) ) + ' ' + sizes[ i ];

}
