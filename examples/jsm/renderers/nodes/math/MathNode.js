import Node from '../core/Node.js';

class MathNode extends Node {

	static NORMALIZE = 'normalize';
	static INVERSE_TRANSFORM_DIRETION = 'inverseTransformDirection';

	constructor( method, a, b = null ) {

		super();

		this.method = method;

		this.a = a;
		this.b = b;

	}

	getType( builder ) {

		const method = this.method;

		if ( method === MathNode.INVERSE_TRANSFORM_DIRETION ) {

			return 'vec3';

		} else {

			const typeA = this.a.getType( builder );

			if ( this.b !== null ) {

				if ( builder.getTypeLength( typeB ) > builder.getTypeLength( typeA ) ) {

					// anytype x anytype: use the greater length vector

					return typeB;

				}

			}

			return typeA;

		}

	}

	generate( builder, output ) {

		const method = this.method;
		const type = this.getType( builder );

		let a = null, b = null;

		if ( method === MathNode.INVERSE_TRANSFORM_DIRETION ) {

			a = this.a.build( builder, 'vec3' );
			b = this.b.build( builder, 'mat4' );

			// add in FunctionNode later
			return `normalize( ( vec4( ${a}, 0.0 ) * ${b} ).xyz )`;

		} else {

			a = this.a.build( builder, type );

			if ( this.b !== null ) {

				b = this.b.build( builder, type );

			}

		}

		if ( b !== null ) {

			return builder.format( `${method}( ${a}, ${b} )`, type, output );

		} else {

			return builder.format( `${method}( ${a} )`, type, output );

		}

	}

}

export default MathNode;
