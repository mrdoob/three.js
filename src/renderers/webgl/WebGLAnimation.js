class WebGLAnimation {

	constructor() {

		this._context = null;
		this._isAnimating = false;
		this._animationLoop = null;
		this._requestId = null;

		// Re-bind the prototype function so that `this` can be used with rAF:
		this._onAnimationFrame = this._onAnimationFrame.bind( this );

	}

	_onAnimationFrame( time, frame ) {

		this._animationLoop( time, frame );

		this._requestId = this._context.requestAnimationFrame( this._onAnimationFrame );

	}

	start() {

		if ( this._isAnimating === true ) return;
		if ( this._animationLoop === null ) return;

		this._requestId = this._context.requestAnimationFrame( this._onAnimationFrame );

		this._isAnimating = true;

	}

	stop() {

		this._context.cancelAnimationFrame( this._requestId );

		this._isAnimating = false;

	}

	setAnimationLoop( callback ) {

		this._animationLoop = callback;

	}

	setContext( value ) {

		this._context = value;

	}

}

export { WebGLAnimation };
