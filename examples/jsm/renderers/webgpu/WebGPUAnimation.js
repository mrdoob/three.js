class WebGPUAnimation {

	constructor() {

		this.nodes = null;

		this.animationLoop = null;
		this.requestId = null;

		this.isAnimating = false;

		this.context = self;

	}

	start() {

		if ( this.isAnimating === true || this.animationLoop === null || this.nodes === null ) return;

		this.isAnimating = true;

		const update = ( time, frame ) => {

			this.requestId = self.requestAnimationFrame( update );

			this.animationLoop( time, frame );

			this.nodes.updateFrame();

		};

		this.requestId = self.requestAnimationFrame( update );

	}

	stop() {

		self.cancelAnimationFrame( this.requestId );

		this.isAnimating = false;

	}

	setAnimationLoop( callback ) {

		this.animationLoop = callback;

	}

	setNodes( nodes ) {

		this.nodes = nodes;

	}

}

export default WebGPUAnimation;
