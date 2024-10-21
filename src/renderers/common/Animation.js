class Animation {

	constructor( nodes, info ) {

		this.nodes = nodes;
		this.info = info;

		this.isAnimating = false;
		this.animationLoop = null;
		this.requestId = null;

	}

	onAnimationFrame( time, frame ) {

		if ( this.info.autoReset === true ) this.info.reset();

		this.nodes.nodeFrame.update();

		this.info.frame = this.nodes.nodeFrame.frameId;

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
