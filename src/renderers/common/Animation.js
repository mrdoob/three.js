class Animation {

	constructor() {

		this.isAnimating = false;
		this.animationLoop = null;
		this.requestId = null;

	}

	onAnimationFrame( time, frame ) {

		this.animationLoop( time, frame );

		this.requestId = self.requestAnimationFrame( this.onAnimationFrame.bind( this ) );

	}

	start() {

		if ( this.isAnimating === true ) return;
		if ( this.animationLoop === null ) return;

		this.requestId = self.requestAnimationFrame( this.onAnimationFrame.bind( this ) );

		this.isAnimating = true;

	}

	stop() {

		self.cancelAnimationFrame( this.requestId );

		this.isAnimating = false;

	}

	dispose() {

		this.stop();
		this.requestId = null;

	}

	setAnimationLoop( callback ) {

		this.animationLoop = callback;

	}

}

export default Animation;
