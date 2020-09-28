import Node from './Node.js';

class InputNode extends Node {

	constructor( type ) {
		
		super( type );
		
		this.isInputNode = true;
		
		// force constant for now
		this.constant = true;
		
	}
	
	generateConst( builder, output ) {
		
		console.warn("Abstract function");
		
	}
	
	generate( builder, output ) {
		
		if ( this.constant ) {
		
			return builder.format( this.generateConst( builder, output ), output );
			
		} else {
			
			builder.createUniformFromNode( node );
			
		}
		
	}
	
}

export default InputNode;
