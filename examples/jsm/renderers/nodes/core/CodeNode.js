import Node from './Node.js';

class CodeNode extends Node {

	constructor( code = '', type = 'code' ) {

		super( type );
		
		this.code = code;
		
		this._includes = [];
		
		Object.defineProperty( this, 'isCodeNode', { value: true } );

	}
	
	setIncludes( includes ) {
		
		this._includes = includes;
		
		return this;
		
	}
	
	getIncludes( /*builder*/ ) {
		
		return this._includes;
		
	}

	generate( builder, output ) {

		const includes = this.getIncludes( builder );

		for (const include of includes) { 
		
			include.build( builder );
		
		}
		
		const type = this.getType( builder );
		const nodeCode = builder.getCodeFromNode( this, type );
		
		nodeCode.code = this.code;
		console.log(nodeCode.code);
		return nodeCode.code;
		
	}

}

export default CodeNode;
