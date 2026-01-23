let interval = null;
let result = null;

function initJank() {

	const button = document.getElementById( 'button' );
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

	result = document.getElementById( 'result' );

}

function jank() {

	let number = 0;

	for ( let i = 0; i < 10000000; i ++ ) {

		number += Math.random();

	}

	result.textContent = number;

}

export default initJank;
