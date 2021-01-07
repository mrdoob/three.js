import Node from '../core/Node.js';

class UVNode extends Node {

	constructor( index = 0 ) {

		super( 'vec2' );

		this.index = index;

	}

	generate( builder, output ) {
		
		return builder.format( builder.getUV( this.index ), this.getType( builder ), output );
		
	}

}

export default UVNode;
