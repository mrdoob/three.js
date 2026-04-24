( function () {

	/* Remove start screen (or press some button ) */

	const button = document.getElementById( 'startButton' );
	if ( button ) button.click();

	/* Remove gui and fonts */

	const style = document.createElement( 'style' );
	style.type = 'text/css';
	style.innerHTML = '#info, #profiler-shell, button, input, body > div.lil-gui, body > div.lbl { display: none !important; }';

	document.querySelector( 'head' ).appendChild( style );

	/* Remove Stats.js */

	for ( const element of document.querySelectorAll( 'div' ) ) {

		if ( getComputedStyle( element ).zIndex === '10000' ) {

			element.remove();
			break;

		}

	}

}() );
