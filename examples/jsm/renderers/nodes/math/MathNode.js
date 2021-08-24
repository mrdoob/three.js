import TempNode from '../core/Node.js';

class MathNode extends TempNode {

	// 1 input

	static RAD = 'radians';
	static DEG = 'degrees';
	static EXP = 'exp';
	static EXP2 = 'exp2';
	static LOG = 'log';
	static LOG2 = 'log2';
	static SQRT = 'sqrt';
	static INV_SQRT = 'inversesqrt';
	static FLOOR = 'floor';
	static CEIL = 'ceil';
	static NORMALIZE = 'normalize';
	static FRACT = 'fract';
	static SATURATE = 'saturate';
	static SIN = 'sin';
	static COS = 'cos';
	static TAN = 'tan';
	static ASIN = 'asin';
	static ACOS = 'acos';
	static ATAN = 'atan';
	static ABS = 'abs';
	static SIGN = 'sign';
	static LENGTH = 'length';
	static NEGATE = 'negate';
	static INVERT = 'invert';

	// 2 inputs

	static MIN = 'min';
	static MAX = 'max';
	static MOD = 'mod';
	static STEP = 'step';
	static REFLECT = 'reflect';
	static DISTANCE = 'distance';
	static DOT = 'dot';
	static CROSS = 'cross';
	static POW = 'pow';

	// 3 inputs

	static MIX = 'mix';
	static CLAMP = 'clamp';
	static REFRACT = 'refract';
	static SMOOTHSTEP = 'smoothstep';
	static FACEFORWARD = 'faceforward';

	constructor( method, a, b = null, c = null ) {

		super();

		this.method = method;

		this.a = a;
		this.b = b;
		this.c = c;

	}

	getInputType( builder ) {

		const aLen = this.a.getTypeLength( builder );
		const bLen = this.b ? this.b.getTypeLength( builder ) : 0;
		const cLen = this.c ? this.c.getTypeLength( builder ) : 0;

		if ( aLen > bLen && aLen > cLen ) {

			return this.a.getType( builder );

		} else if ( bLen > cLen ) {

			return this.b.getType( builder );

		} else if ( cLen > aLen ) {

			this.c.getType( builder )

		}

		return this.a.getType( builder );

	}

	getType( builder ) {

		const method = this.method;

		if ( method === MathNode.LENGTH || method === MathNode.DISTANCE || method === MathNode.DOT ) {

			return 'float';

		} else if (method === MathNode.CROSS) {

			return 'vec3';

		} else {

			return this.getInputType( builder );

		}

	}

	generate( builder, output ) {

		const method = this.method;

		const type = this.getType( builder );
		const inputType = this.getInputType( builder );

		if ( method === MathNode.NEGATE ) {

			return builder.format( '( -' + this.a.build( builder, inputType ) + ' )', type, output );

		} else if ( method === MathNode.INVERT ) {

			return builder.format( '( 1.0 - ' + this.a.build( builder, inputType ) + ' )', type, output );

		} else {

			const params = [];

			if ( method === MathNode.CROSS ) {

				params.push(
					this.a.build( builder, type ),
					this.b.build( builder, type )
				);

			} else if ( method === MathNode.STEP ) {

				params.push(
					this.b.build( builder, this.a.getTypeLength( builder ) === 1 ? 'float' : inputType ),
					this.b.build( builder, inputType )
				);

			} else if ( method === MathNode.MIN || method === MathNode.MAX || method === MathNode.MOD ) {

				params.push(
					this.a.build( builder, inputType ),
					this.b.build( builder, this.b.getTypeLength( builder ) === 1 ? 'float' : inputType )
				);

			} else if ( method === MathNode.REFRACT ) {

				params.push(
					this.a.build( builder, inputType ),
					this.b.build( builder, inputType ),
					this.c.build( builder, 'float' )
				);

			} else if ( method === MathNode.MIX ) {

				params.push(
					this.a.build( builder, inputType ),
					this.b.build( builder, inputType ),
					this.c.build( builder, this.c.getTypeLength( builder ) === 1 ? 'float' : inputType )
				);

			} else {

				params.push( this.a.build( builder, inputType ) );

				if ( this.c !== null ) {

					params.push( this.b.build( builder, inputType ), this.c.build( builder, inputType ) );

				} else if ( this.b !== null ) {

					params.push( this.b.build( builder, inputType ) );

				}

			}

			return builder.format( `${method}( ${params.join(', ')} )`, type, output );

		}

	}

}

export default MathNode;
