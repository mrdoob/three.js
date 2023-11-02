class Animation {

	constructor( nodes ) {

		this.nodes = nodes;

		this.animationLoop = null;
		this.requestId = null;

		this._init();

	}

	_init() {

		const update = ( time, frame ) => {

			this.requestId = self.requestAnimationFrame( update );

			this.nodes.nodeFrame.update();

			if ( this.animationLoop !== null ) this.animationLoop( time, frame );

		};

		update();

	}

	dispose() {

		self.cancelAnimationFrame( this.requestId );

	}

	setAnimationLoop( callback ) {

		this.animationLoop = callback;

	}

}

export default Animation;
