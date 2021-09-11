class NodeFrame {

	constructor( time ) {

		this.time = time !== undefined ? time : 0;

		this.id = 0;

	}

	update( delta ) {

		++ this.id;

		this.time += delta;
		this.delta = delta;

		return this;

	}

	setRenderer( renderer ) {

		this.renderer = renderer;

		return this;

	}

	setRenderTexture( renderTexture ) {

		this.renderTexture = renderTexture;

		return this;

	}

	updateNode( node ) {

		if ( node.frameId === this.id ) return this;

		node.updateFrame( this );

		node.frameId = this.id;

		return this;

	}

}

export { NodeFrame };
