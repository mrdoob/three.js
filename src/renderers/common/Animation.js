class Animation {

	constructor( nodes, info ) {

		this.nodes = nodes;
		this.info = info;

		this._context = self;
		this._animationLoop = null;
		this._requestId = null;

	}

	start() {

		const update = ( time, frame ) => {

			this._requestId = this._context.requestAnimationFrame( update );

			if ( this.info.autoReset === true ) this.info.reset();

			this.nodes.nodeFrame.update();

			this.info.frame = this.nodes.nodeFrame.frameId;

			if ( this._animationLoop !== null ) this._animationLoop( time, frame );

		};

		update();

	}

	stop() {

		this._context.cancelAnimationFrame( this._requestId );

		this._requestId = null;

	}

	setAnimationLoop( callback ) {

		this._animationLoop = callback;

	}

	setContext( context ) {

		this._context = context;

	}

	dispose() {

		this.stop();

	}

}

export default Animation;
