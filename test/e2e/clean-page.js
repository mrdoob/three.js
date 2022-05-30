( function () {

	/* Remove start screen ( or press some button ) */

	document.getElementById( 'startButton' )?.click();

	/* Remove stats.js, gui and fonts */

	const style = document.createElement( 'style' );
	style.type = 'text/css';
	style.innerHTML = `body { font-size: 0 !important; }
      #info, button, input, body > div.lil-gui, body > div.lbl { display: none !important; }
	  canvas:not( [ data-engine^=three.js ] ) { display: none !important; }`;

	document.querySelector( 'head' ).appendChild( style );

}() );
