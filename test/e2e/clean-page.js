
( function () {


	/* Remove start screen ( or press some button ) */

	const button = document.getElementById( 'startButton' );

	if ( button ) {

		button.click();

	}


	/* Remove gui and fonts */

	const style = document.createElement( 'style' );
	style.type = 'text/css';
	style.innerHTML = `body { font size: 0 !important; }
      #info, button, input, body > div.lil-gui, body > div.lbl { display: none !important; }`;

	const head = document.getElementsByTagName( 'head' );

	if ( head.length > 0 ) {

		head[ 0 ].appendChild( style );

	}

	/* Remove stats.js */

	const canvas = document.getElementsByTagName( 'canvas' );

	for ( let i = 0; i < canvas.length; ++ i ) {

		if ( canvas[ i ].height === 48 ) {

			canvas[ i ].style.display = 'none';

		}

	}

}() );
