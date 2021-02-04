import Node from '../core/Node.js';

class OperatorNode extends Node {

	constructor( op, a, b ) {

		super();

		this.op = op;

		this.a = a;
		this.b = b;

	}

	getType( builder ) {

		const typeA = this.a.getType( builder );
		const typeB = this.b.getType( builder );

		// use the greater length vector

		if ( builder.getTypeLength( typeB ) > builder.getTypeLength( typeA ) ) {

			return typeB;

		}

		return typeA;

	}

	generate( builder, output ) {

		const type = this.getType( builder );

		const a = this.a.build( builder, type );
		const b = this.b.build( builder, type );

		return builder.format( `( ${a} ${this.op} ${b} )`, type, output );

	}

}

export default OperatorNode;
