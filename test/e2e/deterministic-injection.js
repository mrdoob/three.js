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
	let lastFrameRealTime = 0;
	const maxFrameId = 2;

	const now = () => frameId * 1000 / 60;
	window.Date.now = now;
	window.Date.prototype.getTime = now;
	window.performance.now = now;

	/* Deterministic RAF */

	const ST = window.setTimeout;
	const RAF = window.requestAnimationFrame;

	window._renderStarted = false;
	window._renderFinished = false;

	window.requestAnimationFrame = function ( cb ) {

		if ( ! window._renderStarted ) {

			ST( () => requestAnimationFrame( cb ), 10 );

		} else {

			RAF( () => {

				if ( frameId < maxFrameId ) {

					cb( now() );

				} else {

					window._renderFinished = true;

				}

				if ( performance._now() > lastFrameRealTime + 1000 / 120 ) {

					lastFrameRealTime = performance._now();
					frameId ++;

				}

			} );

		}

	};

	const handles = [];
	window.setTimeout = function ( func, ms, ...args ) {

		const i = handles.length;
		handles[ i ] = true;

		if ( ms < 1000 / 120 ) {

			func( ...args );

		} else {

			const then = now();
			requestAnimationFrame( now => handles[ i ] ? setTimeout( func, ms - now + then, ...args ) : null );

		}

		return i;

	};

	window.setInterval = function ( func, ms, ...args ) {

		const i = handles.length;
		handles[ i ] = true;

		const wrap = () => {
			if ( ! handles[ i ] ) return;
			func( ...args );
			setTimeout( wrap, ms );
		};
		setTimeout( wrap, ms );

		return i;

	};

	window.clearTimeout = window.clearInterval = ( i ) => { handles[ i ] = false; };

	/* Semi-deterministic video */
	// TODO: Fix this

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
	// TODO: Remove this

	window.TESTING = true;

}() );
