import { TempNode } from '../core/TempNode.js';

class OperatorNode extends TempNode {

	constructor( a, b, op ) {

		super();

		this.a = a;
		this.b = b;
		this.op = op;

	}

	getType( builder ) {

		const a = this.a.getType( builder ),
			b = this.b.getType( builder );

		if ( builder.isTypeMatrix( a ) ) {

			return 'v4';

		} else if ( builder.getTypeLength( b ) > builder.getTypeLength( a ) ) {

			// use the greater length vector

			return b;

		}

		return a;

	}

	generate( builder, output ) {

		const type = this.getType( builder );

		const a = this.a.build( builder, type ),
			b = this.b.build( builder, type );

		return builder.format( '( ' + a + ' ' + this.op + ' ' + b + ' )', type, output );

	}

	copy( source ) {

		super.copy( source );

		this.a = source.a;
		this.b = source.b;
		this.op = source.op;

		return this;

	}

	toJSON( meta ) {

		let data = this.getJSONNode( meta );

		if ( ! data ) {

			data = this.createJSONNode( meta );

			data.a = this.a.toJSON( meta ).uuid;
			data.b = this.b.toJSON( meta ).uuid;
			data.op = this.op;

		}

		return data;

	}

}

OperatorNode.ADD = '+';
OperatorNode.SUB = '-';
OperatorNode.MUL = '*';
OperatorNode.DIV = '/';

OperatorNode.prototype.nodeType = 'Operator';

export { OperatorNode };
