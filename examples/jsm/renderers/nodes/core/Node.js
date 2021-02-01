class Node {

	constructor( type = null ) {

		this.type = type;

		this.needsUpdate = false;

		Object.defineProperty( this, 'isNode', { value: true } );

	}

	getType( /*builder*/ ) {

		return this.type;

	}

	update( /*frame*/ ) {

		console.warn( 'Abstract function.' );

	}

	generate( /*builder, output*/ ) {

		console.warn( 'Abstract function.' );

	}

	build( builder, output ) {

		builder.addNode( this );

		return this.generate( builder, output );

	}

}

export default Node;
