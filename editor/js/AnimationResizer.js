import { UIElement } from './libs/ui.js';

function AnimationResizer( editor ) {

	const signals = editor.signals;

	const dom = document.createElement( 'div' );
	dom.id = 'animation-resizer';

	let panelHeight = 36;
	let startY = 0;
	let startHeight = 0;

	function onPointerDown( event ) {

		if ( event.isPrimary === false ) return;

		startY = event.clientY;
		startHeight = panelHeight;

		dom.ownerDocument.addEventListener( 'pointermove', onPointerMove );
		dom.ownerDocument.addEventListener( 'pointerup', onPointerUp );

	}

	function onPointerUp( event ) {

		if ( event.isPrimary === false ) return;

		dom.ownerDocument.removeEventListener( 'pointermove', onPointerMove );
		dom.ownerDocument.removeEventListener( 'pointerup', onPointerUp );

	}

	function onPointerMove( event ) {

		if ( event.isPrimary === false ) return;

		const deltaY = startY - event.clientY;
		const newHeight = startHeight + deltaY;
		const maxHeight = window.innerHeight / 2;

		// Clamp between 36px (top bar only) and half the window height
		panelHeight = Math.max( 36, Math.min( maxHeight, newHeight ) );

		signals.animationPanelResized.dispatch( panelHeight );

	}

	dom.addEventListener( 'pointerdown', onPointerDown );

	// Show/hide based on animation panel visibility
	signals.animationPanelChanged.add( function ( height ) {

		if ( height === false ) {

			dom.style.display = 'none';

		} else {

			dom.style.display = 'block';
			dom.style.bottom = height + 'px';
			panelHeight = height;

		}

	} );

	return new UIElement( dom );

}

export { AnimationResizer };
