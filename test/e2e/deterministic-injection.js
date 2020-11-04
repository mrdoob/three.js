
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
	const now = () => frameId * 16;
	window.Date.now = now;
	window.Date.prototype.getTime = now;
	window.performance.now = now;


	/* Deterministic RAF */

	const RAF = window.requestAnimationFrame;
	window._renderStarted = false;
	window._renderFinished = false;

	const maxFrameId = 2;
	window.requestAnimationFrame = function ( cb ) {

		if ( ! _renderStarted ) {

			setTimeout( function () {

				requestAnimationFrame( cb );

			}, 50 );

		} else {

			RAF( function () {

				if ( frameId ++ < maxFrameId ) {

					cb( now() );

				} else {

					_renderFinished = true;

				}

			} );

		}

	};


	/* Semi-determitistic video */

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
