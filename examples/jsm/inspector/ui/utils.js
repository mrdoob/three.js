export function ease( target, current, deltaTime, duration = .1 ) {

	if ( duration <= 0 ) return current;

	const t = Math.min( 1, deltaTime / duration );

	target += ( current - target ) * t;

	return target;

}

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
