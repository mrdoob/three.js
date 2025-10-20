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

	const maxFrameId = 5;
	window.requestAnimationFrame = function ( cb ) {

		if ( ! window._renderStarted ) {

			setTimeout( function () {

				RAF( cb );

			}, 50 );

		} else {

			RAF( function () {

				if ( frameId < maxFrameId ) {

					frameId ++;
					cb( now() );

				} else {

					window._renderFinished = true;

				}

			} );

		}

	};

	/* Semi-deterministic video */

	const play = HTMLVideoElement.prototype.play;

	HTMLVideoElement.prototype.play = async function () {

		const video = this;

		play.call( video );
		video.addEventListener( 'timeupdate', () => video.pause() );

		function renew() {

			video.load();
			play.call( video );
			RAF( renew );

		}

		RAF( renew );

	};

	/* Additional variable for ~5 examples */

	window.TESTING = true;

}() );
