/**
 * @author mrdoob / http://mrdoob.com/
 */

function WebGLAnimation() {

	var context = null;
	var isAnimating = false;
	var animationLoop = null;

	function onAnimationFrame( time, frame ) {

		if ( isAnimating === false ) return;

		animationLoop( time, frame );

		context.requestAnimationFrame( onAnimationFrame );

	}

	return {

		start: function () {

			if ( isAnimating === true ) return;
			if ( animationLoop === null ) return;

			context.requestAnimationFrame( onAnimationFrame );

			isAnimating = true;

		},

		stop: function () {

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
