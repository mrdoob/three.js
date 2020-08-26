import { UIElement } from './libs/ui.js';

function Resizer( editor ) {

	const signals = editor.signals;

	const dom = document.createElement( 'div' );
	dom.id = 'resizer';

	let isPointerDown = false;

	dom.addEventListener( 'pointerdown', function ( event ) {

		if ( event.isPrimary ) isPointerDown = true;

	} );

	dom.ownerDocument.addEventListener( 'pointermove', function ( event ) {

		if ( event.isPrimary && isPointerDown ) {

			const rect = dom.getBoundingClientRect();
			const x = ( document.body.offsetWidth - rect.right ) - event.movementX;

			dom.style.right = x + 'px';

			document.getElementById( 'sidebar' ).style.width = ( x + rect.width ) + 'px';
			document.getElementById( 'viewport' ).style.right = ( x + rect.width ) + 'px';

			signals.windowResize.dispatch();

		}

	} );

	dom.ownerDocument.addEventListener( 'pointerup', function ( event ) {

		if ( event.isPrimary ) isPointerDown = false;

	} );

	return new UIElement( dom );

}

export { Resizer };
