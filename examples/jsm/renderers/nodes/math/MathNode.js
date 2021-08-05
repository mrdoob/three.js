import Node from '../core/Node.js';

class MathNode extends Node {

	static NORMALIZE = 'normalize';
	static NEGATE = 'negate';
	static LENGTH = 'length';

	constructor( method, a, b = null ) {

		super();

		this.method = method;

		this.a = a;
		this.b = b;

	}

	getInputType( builder ) {

		const typeA = this.a.getType( builder );

		if ( this.b !== null ) {

			const typeB = this.b.getType( builder );

			if ( builder.getTypeLength( typeB ) > builder.getTypeLength( typeA ) ) {

				// anytype x anytype: use the greater length vector

				return typeB;

			}

		}

		return typeA;

	}

	getType( builder ) {

		const method = this.method;

		if ( method === MathNode.LENGTH ) {

			return 'float';

		} else if (
			method === MathNode.TRANSFORM_DIRETION ||
			method === MathNode.INVERSE_TRANSFORM_DIRETION
		) {

			return 'vec3';

		} else {

			return this.getInputType( builder );

		}

	}

	generate( builder, output ) {

		const method = this.method;
		const type = this.getInputType( builder );

		const a = this.a.build( builder, type );
		let b = null;

		if ( this.b !== null ) {

			b = this.b.build( builder, type );

		}

		if ( b !== null ) {

			return builder.format( `${method}( ${a}, ${b} )`, type, output );

		} else {

			if ( method === MathNode.NEGATE ) {

				return builder.format( `( -${a} )`, type, output );

			} else {

				return builder.format( `${method}( ${a} )`, type, output );

			}

		}

	}

}

export default MathNode;
