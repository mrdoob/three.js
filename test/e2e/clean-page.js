( function () {

	/* Remove start screen (or press some button) */

	const button = document.getElementById( 'startButton' );
	if ( button ) button.click();

	/* Remove GUI and most text
	   Set proper fonts */

	const style = document.createElement( 'style' );
	style.type = 'text/css';
	style.innerHTML = '#info, button, input, body > div.lil-gui, body > div.lbl { display: none !important; }';
	document.querySelector( 'head' ).appendChild( style );

	const font = document.createElement( 'link' );
	font.rel = 'stylesheet';
	font.href = 'https://fonts.googleapis.com/css?family=Ubuntu%20Mono';
	document.querySelector( 'head' ).appendChild( font );

	/* Remove Stats.js */

	for ( const element of document.querySelectorAll( 'div' ) ) {

		if ( getComputedStyle( element ).zIndex === '10000' ) {

			element.remove();
			break;

		}

	}

}() );
