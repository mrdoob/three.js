class Node {

	constructor( type = null ) {

		this.type = type;

		//this.onBeforeUpdate = function ( /*object, scene, camera, geometry, material, group*/ ) {};

		Object.defineProperty( this, 'isNode', { value: true } );

	}

	getType( /*builder*/ ) {

		return this.type;

	}

	generate( /*builder, output*/ ) {

		console.warn( "Abstract function" );

	}

	build( builder, output ) {

		builder.addNode( this );

		return this.generate( builder, output );

	}

}

export default Node;
