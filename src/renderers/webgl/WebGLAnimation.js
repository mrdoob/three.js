function WebGLAnimation() {

	let context = null;
	let isAnimating = false;
	let animationLoop = null;
	let requestId = null;

	function onAnimationFrame( time, frame ) {

		animationLoop( time, frame );

		requestId = _requestAnimationFrame();

	}

	function _requestAnimationFrame() {

		return context
			? context.requestAnimationFrame( onAnimationFrame )
			: requestAnimationFrame( onAnimationFrame );

	}

	return {

		start: function () {

			if ( isAnimating === true ) return;
			if ( animationLoop === null ) return;

			requestId = _requestAnimationFrame();

			isAnimating = true;

		},

		stop: function () {

			context
				? context.cancelAnimationFrame( requestId )
				: cancelAnimationFrame( requestId );

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
