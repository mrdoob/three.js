import { NodeUpdateType } from './constants.js';

class Node {

	constructor( type = null ) {

		this.type = type;

		this.updateType = NodeUpdateType.None;

		Object.defineProperty( this, 'isNode', { value: true } );

	}

	getUpdateType( /*builder*/ ) {

		return this.updateType;

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

	buildStage( builder, shaderStage, output = null ) {
		
		const oldShaderStage = builder.shaderStage;
		
		builder.shaderStage = shaderStage;
		
		const snippet = this.build( builder, output );
		
		builder.shaderStage = oldShaderStage;
		
		return snippet;
		
	}

	build( builder, output = null ) {

		builder.addNode( this );

		return this.generate( builder, output );

	}

}

export default Node;
