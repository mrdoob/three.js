import TempNode from '../core/TempNode.js';

class OperatorNode extends TempNode {

	constructor( op, a, b, ...params ) {

		super();

		this.op = op;

		if ( params.length > 0 ) {

			let finalB = b;

			for ( let i = 0; i < params.length; i ++ ) {

				finalB = new OperatorNode( op, finalB, params[ i ] );

			}

			b = finalB;

		}

		this.a = a;
		this.b = b;

	}

	getNodeType( builder ) {

		const op = this.op;

		if ( op === '=' ) {

			return this.a.getNodeType( builder );

		} else if ( op === '==' || op === '>' || op === '&&' ) {

			return 'bool';

		} else {

			const typeA = this.a.getNodeType( builder );
			const typeB = this.b.getNodeType( builder );

			if ( typeA === 'float' && builder.isMatrix( typeB ) ) {

				return typeB;

			} else if ( builder.isMatrix( typeA ) && builder.isVector( typeB ) ) {

				// matrix x vector

				return builder.getVectorFromMatrix( typeA );

			} else if ( builder.isVector( typeA ) && builder.isMatrix( typeB ) ) {

				// vector x matrix

				return builder.getVectorFromMatrix( typeB );

			} else if ( builder.getTypeLength( typeB ) > builder.getTypeLength( typeA ) ) {

				// anytype x anytype: use the greater length vector

				return typeB;

			}

			return typeA;

		}

	}

	generate( builder, output ) {

		const op = this.op;

		let typeA = this.a.getNodeType( builder );
		let typeB = this.b.getNodeType( builder );

		if ( op === '=' ) {

			typeB = typeA;

		} else if ( builder.isMatrix( typeA ) && builder.isVector( typeB ) ) {

			// matrix x vector

			typeB = builder.getVectorFromMatrix( typeA );

		} else if ( builder.isVector( typeA ) && builder.isMatrix( typeB ) ) {

			// vector x matrix

			typeA = builder.getVectorFromMatrix( typeB );

		} else {

			// anytype x anytype

			typeA = typeB = this.getNodeType( builder );

		}

		const a = this.a.build( builder, typeA );
		const b = this.b.build( builder, typeB );

		return `( ${a} ${this.op} ${b} )`;

	}

}

export default OperatorNode;
