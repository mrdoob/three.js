( function () {

	if ( globalThis._e2eInjected === true ) return;
	globalThis._e2eInjected = true;

	/* Deterministic random */

	Math._random = Math.random;

	let seed = Math.PI / 4;
	Math.random = function () {

		const x = Math.sin( seed ++ ) * 10000;
		return x - Math.floor( x );

	};

	/* Deterministic timer */

	performance._now = performance.now;

	const now = () => 0; // frameId * 16;
	Date.now = now;
	Date.prototype.getTime = now;
	performance.now = now;

	// Workers keep their render loops running against the frozen clock.
	if ( typeof window === 'undefined' ) return;

	/* Deterministic RAF */

	window._renderStarted = false;
	window._renderFinished = false;

	window.requestAnimationFrame = function ( cb ) {

		if ( window._renderFinished === true ) return;

		const intervalId = setInterval( function () {

			if ( window._renderStarted === true ) {

				clearInterval( intervalId );
				window._renderFinished = true;
				cb( now() );

			}

		}, 100 );

	};

	/* Deterministic video */

	const play = HTMLVideoElement.prototype.play;
	const videos = new Set();
	let pendingVideos = 0;
	let pendingFrames = 0;
	let videoError = null;

	HTMLVideoElement.prototype.play = function () {

		// Reload preloaded frames so video textures receive a frame callback.
		if ( videos.has( this ) === false ) {

			const time = this.currentTime;
			this.load();
			this.currentTime = time;

			if ( 'requestVideoFrameCallback' in this ) {

				pendingFrames ++;
				this.requestVideoFrameCallback( () => pendingFrames -- );

			}

		}

		this.playbackRate = 0;
		videos.add( this );

		const promise = play.call( this );
		pendingVideos ++;

		promise.then( () => {

			this.pause();
			pendingVideos --;

		}, error => {

			pendingVideos --;
			videoError = error;

		} );

		return promise;

	};

	window._videosReady = function () {

		if ( videoError !== null ) throw videoError;
		if ( pendingVideos !== 0 || pendingFrames !== 0 ) return false;

		for ( const video of videos ) {

			if ( video.error !== null ) throw new Error( video.error.message );
			if ( video.seeking || video.readyState < video.HAVE_CURRENT_DATA ) return false;

		}

		return true;

	};

	/* Additional variable for ~5 examples */

	window.TESTING = true;

}() );
