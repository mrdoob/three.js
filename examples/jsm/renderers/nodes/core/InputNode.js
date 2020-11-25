import Node from './Node.js';

class InputNode extends Node {

	constructor( type ) {
		
		super( type );

		this.constant = false;
		
		Object.defineProperty( this, 'isInputNode', { value: true } );
		
	}
	
	setConst( value ) {
		
		this.constant = value;
		
		return this;
		
	}
	
	getConst() {
		
		return this.constant;
		
	}
	
	generateConst( /*builder*/ ) {
		
		console.warn("Abstract function");
		
	}
	
	generate( builder, output ) {
		
		const type = this.getType( builder );
		
		if ( this.constant === true ) {
		
			return builder.format( this.generateConst( builder ), type, output );
			
		} else {
			
			const nodeUniform = builder.getUniformFromNode( this, builder.shaderStage, this.getType( builder ) );
			const nsName = builder.getUniformNSName( nodeUniform );
			
			return builder.format( nsName, type, output );
			
		}
		
	}
	
}

export default InputNode;
