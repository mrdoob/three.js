import TempNode from '../core/TempNode.js';
import ExpressionNode from '../core/ExpressionNode.js';
import SplitNode from '../utils/SplitNode.js';
import OperatorNode from './OperatorNode.js';

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
	static DFDX = 'dFdx';
	static DFDY = 'dFdy';
	static SATURATE = 'saturate'

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
	static TRANSFORM_DIRECTION = 'transformDirection';

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

			return this.a.getNodeType( builder );

		} else if ( bLen > cLen ) {

			return this.b.getNodeType( builder );

		} else if ( cLen > aLen ) {

			this.c.getNodeType( builder )

		}

		return this.a.getNodeType( builder );

	}

	getNodeType( builder ) {

		const method = this.method;

		if ( method === MathNode.LENGTH || method === MathNode.DISTANCE || method === MathNode.DOT ) {

			return 'float';

		} else if (method === MathNode.CROSS) {

			return 'vec3';

		} else {

			return this.getInputType( builder );

		}

	}

	generate( builder ) {

		const method = this.method;

		const type = this.getNodeType( builder );
		const inputType = this.getInputType( builder );

		const a = this.a;
		const b = this.b;
		const c = this.c;

		if ( method === MathNode.TRANSFORM_DIRECTION ) {

			// dir can be either a direction vector or a normal vector
			// upper-left 3x3 of matrix is assumed to be orthogonal

			let tA = a;
			let tB = b;

			if ( builder.isMatrix( tA.getNodeType( builder ) ) ) {

				tB = new ExpressionNode( `${ builder.getType( 'vec4' ) }( ${ tB.build( builder, 'vec3' ) }, 0.0 )`, 'vec4' );

			} else {

				tA = new ExpressionNode( `${ builder.getType( 'vec4' ) }( ${ tA.build( builder, 'vec3' ) }, 0.0 )`, 'vec4' );

			}

			const mulNode = new SplitNode( new OperatorNode( '*', tA, tB ), 'xyz' );

			return new MathNode( MathNode.NORMALIZE, mulNode ).build( builder );

		} else if ( method === MathNode.SATURATE ) {

			return `clamp( ${ a.build( builder, inputType ) }, 0.0, 1.0 )`;

		} else if ( method === MathNode.NEGATE ) {

			return '( -' + a.build( builder, inputType ) + ' )';

		} else if ( method === MathNode.INVERT ) {

			return '( 1.0 - ' + a.build( builder, inputType ) + ' )';

		} else {

			const params = [];

			if ( method === MathNode.CROSS ) {

				params.push(
					a.build( builder, type ),
					b.build( builder, type )
				);

			} else if ( method === MathNode.STEP ) {

				params.push(
					b.build( builder, a.getTypeLength( builder ) === 1 ? 'float' : inputType ),
					b.build( builder, inputType )
				);

			} else if ( method === MathNode.MIN || method === MathNode.MAX || method === MathNode.MOD ) {

				params.push(
					a.build( builder, inputType ),
					b.build( builder, b.getTypeLength( builder ) === 1 ? 'float' : inputType )
				);

			} else if ( method === MathNode.REFRACT ) {

				params.push(
					a.build( builder, inputType ),
					b.build( builder, inputType ),
					c.build( builder, 'float' )
				);

			} else if ( method === MathNode.MIX ) {

				params.push(
					a.build( builder, inputType ),
					b.build( builder, inputType ),
					c.build( builder, c.getTypeLength( builder ) === 1 ? 'float' : inputType )
				);

			} else {

				params.push( a.build( builder, inputType ) );

				if ( c !== null ) {

					params.push( b.build( builder, inputType ), c.build( builder, inputType ) );

				} else if ( this.b !== null ) {

					params.push( b.build( builder, inputType ) );

				}

			}

			return `${method}( ${params.join(', ')} )`;

		}

	}

}

export default MathNode;
