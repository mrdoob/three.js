( function () {

	/* Deterministic random */

	window.Math._random = window.Math.random;

	let seed = Math.PI / 4;
	window.Math.random = function () {

		const x = Math.sin( seed ++ ) * 10000;
		return x - Math.floor( x );

	};

	/* Deterministic timer */

	window.performance._now = performance.now;

	let frameId = 0;
	const now = () => 0; // frameId * 16;
	window.Date.now = now;
	window.Date.prototype.getTime = now;
	window.performance.now = now;

	/* Deterministic RAF */

	window._renderStarted = false;
	window._renderFinished = false;

	window.requestAnimationFrame = function ( cb ) {

		if ( window._renderFinished === true ) return

		if ( window._renderStarted === false ) {

			const intervalId = setInterval( function () {

				if ( window._renderStarted === true ) {

					cb( now() );

					clearInterval( intervalId );
					window._renderFinished = true;

				}

			}, 100 );

		}

	};

	/* Semi-deterministic video */

	const play = HTMLVideoElement.prototype.play;

	HTMLVideoElement.prototype.play = async function () {

		play.call( this );
		this.addEventListener( 'timeupdate', () => this.pause() );

		function renew() {

			this.load();
			play.call( this );
			RAF( renew );

		}

		RAF( renew );

	};

	/* Additional variable for ~5 examples */

	window.TESTING = true;

}() );
