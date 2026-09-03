function WebGLAnimation() {

	let context = null;
	let isAnimating = false;
	let animationLoop = null;
	let requestId = null;

	function onAnimationFrame( time, frame ) {

		// Request the next frame before running the animation loop. An uncaught
		// error in the callback then does not stop the animation, and a stop()
		// call from within the callback cancels the pending request.

		requestId = context.requestAnimationFrame( onAnimationFrame );

		animationLoop( time, frame );

	}

	return {

		start: function () {

			if ( isAnimating === true ) return;
			if ( animationLoop === null ) return;
			if ( context === null ) return;

			requestId = context.requestAnimationFrame( onAnimationFrame );

			isAnimating = true;

		},

		stop: function () {

			if ( context !== null ) context.cancelAnimationFrame( requestId );

			isAnimating = false;

		},

		setAnimationLoop: function ( callback ) {

			animationLoop = callback;

		},

		setContext: function ( value ) {

			context = value;

		}

	};

}

export { WebGLAnimation };
