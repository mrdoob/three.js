import TempNode from '../core/TempNode.js';
import ExpressionNode from '../core/ExpressionNode.js';
import JoinNode from '../utils/JoinNode.js';
import SplitNode from '../utils/SplitNode.js';
import OperatorNode from './OperatorNode.js';

class MathNode extends TempNode {

	// 1 input

	static RADIANS = 'radians';
	static DEGREES = 'degrees';
	static EXP = 'exp';
	static EXP2 = 'exp2';
	static LOG = 'log';
	static LOG2 = 'log2';
	static SQRT = 'sqrt';
	static INVERSE_SQRT = 'inversesqrt';
	static FLOOR = 'floor';
	static CEIL = 'ceil';
	static NORMALIZE = 'normalize';
	static FRACT = 'fract';
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
	static SATURATE = 'saturate';
	static ROUND = 'round';

	// 2 inputs

	static ATAN2 = 'atan2';
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

	constructor( method, aNode, bNode = null, cNode = null ) {

		super();

		this.method = method;

		this.aNode = aNode;
		this.bNode = bNode;
		this.cNode = cNode;

	}

	getInputType( builder ) {

		const aType = this.aNode.getNodeType( builder );
		const bType = this.bNode ? this.bNode.getNodeType( builder ) : null;
		const cType = this.cNode ? this.cNode.getNodeType( builder ) : null;

		const aLen = builder.isMatrix( aType ) ? 0 : builder.getTypeLength( aType );
		const bLen = builder.isMatrix( bType ) ? 0 : builder.getTypeLength( bType );
		const cLen = builder.isMatrix( cType ) ? 0 : builder.getTypeLength( cType );

		if ( aLen > bLen && aLen > cLen ) {

			return aType;

		} else if ( bLen > cLen ) {

			return bType;

		} else if ( cLen > aLen ) {

			return cType;

		}

		return aType;

	}

	getNodeType( builder ) {

		const method = this.method;

		if ( method === MathNode.LENGTH || method === MathNode.DISTANCE || method === MathNode.DOT ) {

			return 'float';

		} else if ( method === MathNode.CROSS ) {

			return 'vec3';

		} else {

			return this.getInputType( builder );

		}

	}

	generate( builder, output ) {

		const method = this.method;

		const type = this.getNodeType( builder );
		const inputType = this.getInputType( builder );

		const a = this.aNode;
		const b = this.bNode;
		const c = this.cNode;

		const isWebGL = builder.renderer.isWebGLRenderer === true;

		if ( isWebGL && ( method === MathNode.DFDX || method === MathNode.DFDY ) && output === 'vec3' ) {

			// Workaround for Adreno 3XX dFd*( vec3 ) bug. See #9988

			return new JoinNode( [
				new MathNode( method, new SplitNode( a, 'x' ) ),
				new MathNode( method, new SplitNode( a, 'y' ) ),
				new MathNode( method, new SplitNode( a, 'z' ) )
			] ).build( builder );

		} else if ( method === MathNode.TRANSFORM_DIRECTION ) {

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

			return builder.format( `clamp( ${ a.build( builder, inputType ) }, 0.0, 1.0 )`, type, output );

		} else if ( method === MathNode.NEGATE ) {

			return builder.format( '( -' + a.build( builder, inputType ) + ' )', type, output );

		} else if ( method === MathNode.INVERT ) {

			return builder.format( '( 1.0 - ' + a.build( builder, inputType ) + ' )', type, output );

		} else {

			const params = [];

			if ( method === MathNode.CROSS ) {

				params.push(
					a.build( builder, type ),
					b.build( builder, type )
				);

			} else if ( method === MathNode.STEP ) {

				params.push(
					a.build( builder, builder.getTypeLength( a.getNodeType( builder ) ) === 1 ? 'float' : inputType ),
					b.build( builder, inputType )
				);

			} else if ( ( isWebGL && ( method === MathNode.MIN || method === MathNode.MAX ) ) || method === MathNode.MOD ) {

				params.push(
					a.build( builder, inputType ),
					b.build( builder, builder.getTypeLength( b.getNodeType( builder ) ) === 1 ? 'float' : inputType )
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
					c.build( builder, builder.getTypeLength( c.getNodeType( builder ) ) === 1 ? 'float' : inputType )
				);

			} else {

				params.push( a.build( builder, inputType ) );

				if ( c !== null ) {

					params.push( b.build( builder, inputType ), c.build( builder, inputType ) );

				} else if ( b !== null ) {

					params.push( b.build( builder, inputType ) );

				}

			}

			return builder.format( `${ builder.getMethod( method ) }( ${params.join( ', ' )} )`, type, output );

		}

	}

	serialize( data ) {

		super.serialize( data );

		data.method = this.method;

	}

	deserialize( data ) {

		super.deserialize( data );

		this.method = data.method;

	}

}

export default MathNode;
