export function createValueSpan( id = null ) {

	const span = document.createElement( 'span' );
	span.className = 'value';

	if ( id !== null ) span.id = id;

	return span;

}

export function setText( element, text ) {

	const el = element instanceof HTMLElement ? element : document.getElementById( element );

	if ( el && el.textContent !== text ) {

		el.textContent = text;

	}

}

export function getText( element ) {

	const el = element instanceof HTMLElement ? element : document.getElementById( element );

	return el ? el.textContent : null;

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
