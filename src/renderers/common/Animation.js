class Animation {

	constructor( nodes, info ) {

		this.nodes = nodes;
		this.info = info;

		this.animationLoop = null;
		this.requestId = null;

		this._init();

	}

	_init() {

		const update = ( time, frame ) => {

			this.requestId = self.requestAnimationFrame( update );

			if ( this.info.autoReset === true ) this.info.reset();

			this.nodes.nodeFrame.update();

			this.info.frame = this.nodes.nodeFrame.frameId;

			if ( this.animationLoop !== null ) this.animationLoop( time, frame );

		};

		update();

	}

	dispose() {

		self.cancelAnimationFrame( this.requestId );
		this.requestId = null;

	}

	setAnimationLoop( callback ) {

		this.animationLoop = callback;

	}

}

export default Animation;
