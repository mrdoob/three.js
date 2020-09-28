import Node from '../core/Node.js';

 class OperatorNode extends Node {

	constructor( op, a, b ) {

		super();

		this.op = op;
		
		this.a = a;
		this.b = b;
		
	}

	getType( builder ) {
		
		// ignore auto length for now
		
		return this.a.getType( builder );
		
	}

	generate( builder, output ) {

		const nodeType = this.getType( builder );

		const a = this.a.build( builder, nodeType );
		const b = this.b.build( builder, nodeType );

		return builder.format( '( ' + a + ' ' + this.op + ' ' + b + ' )', nodeType, output );

	}
		
 }

export default OperatorNode;
