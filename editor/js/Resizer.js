import { UIElement } from './libs/ui.js';

function Resizer( editor ) {

	const signals = editor.signals;

	const dom = document.createElement( 'div' );
	dom.id = 'resizer';

	function onPointerDown( event ) {

		if ( event.isPrimary === false ) return;

		dom.ownerDocument.addEventListener( 'pointermove', onPointerMove, false );
		dom.ownerDocument.addEventListener( 'pointerup', onPointerUp, false );

	}

	function onPointerUp( event ) {

		if ( event.isPrimary === false ) return;

		dom.ownerDocument.removeEventListener( 'pointermove', onPointerMove );
		dom.ownerDocument.removeEventListener( 'pointerup', onPointerUp );

	}

	function onPointerMove( event ) {

		// PointerEvent's movementX/movementY are 0 in WebKit

		if ( event.isPrimary === false ) return;

		const rect = dom.getBoundingClientRect();
		const x = ( document.body.offsetWidth - rect.right ) - event.movementX;

		dom.style.right = x + 'px';

		document.getElementById( 'sidebar' ).style.width = ( x + rect.width ) + 'px';
		document.getElementById( 'viewport' ).style.right = ( x + rect.width ) + 'px';

		signals.windowResize.dispatch();

	}

	dom.addEventListener( 'pointerdown', onPointerDown, false );

	return new UIElement( dom );

}

export { Resizer };
