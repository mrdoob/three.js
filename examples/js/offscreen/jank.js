var interval = null;

var button = document.getElementById( 'button' );
button.addEventListener( 'click', function () {

	if ( interval === null ) {

		interval = setInterval( jank, 1000 / 60 );

		button.textContent = 'STOP JANK';

	} else {

		clearInterval( interval );
		interval = null;

		button.textContent = 'START JANK';
		result.textContent = '';

	}

} );

var result = document.getElementById( 'result' );

function jank() {

	var number = 0;

	for ( var i = 0; i < 10000000; i ++ ) {

		number += Math.random();

	}

	result.textContent = number;

}
