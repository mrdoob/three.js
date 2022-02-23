import TempNode from '../core/TempNode.js';
import ExpressionNode from '../core/ExpressionNode.js';
import JoinNode from '../utils/JoinNode.js';
import SplitNode from '../utils/SplitNode.js';
import OperatorNode from './OperatorNode.js';

class MathNode extends TempNode {

	// 1 input

	static Radians = 'radians';
	static Degrees = 'degrees';
	static Exp = 'exp';
	static Exp2 = 'exp2';
	static Log = 'log';
	static Log2 = 'log2';
	static Sqrt = 'sqrt';
	static InverseSqrt = 'inversesqrt';
	static Floor = 'floor';
	static Ceil = 'ceil';
	static Normalize = 'normalize';
	static Fract = 'fract';
	static Sin = 'sin';
	static Cos = 'cos';
	static Tan = 'tan';
	static Asin = 'asin';
	static Acos = 'acos';
	static Atan = 'atan';
	static Abs = 'abs';
	static Sign = 'sign';
	static Length = 'length';
	static Negate = 'negate';
	static Invert = 'invert';
	static DFdx = 'dFdx';
	static DFdy = 'dFdy';
	static Saturate = 'saturate';
	static Round = 'round';

	// 2 inputs

	static Min = 'min';
	static Max = 'max';
	static Mod = 'mod';
	static Step = 'step';
	static Reflect = 'reflect';
	static Distance = 'distance';
	static Dot = 'dot';
	static Cross = 'cross';
	static Pow = 'pow';
	static TransformDirection = 'transformDirection';

	// 3 inputs

	static Mix = 'mix';
	static Clamp = 'clamp';
	static Refract = 'refract';
	static Smoothstep = 'smoothstep';
	static Faceforward = 'faceforward';

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

		const aLen = builder.getTypeLength( aType );
		const bLen = builder.getTypeLength( bType );
		const cLen = builder.getTypeLength( cType );

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

		if ( method === MathNode.Length || method === MathNode.Distance || method === MathNode.Dot ) {

			return 'float';

		} else if ( method === MathNode.Cross ) {

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

		if ( isWebGL && ( method === MathNode.DFdx || method === MathNode.DFdy ) && output === 'vec3' ) {

			// Workaround for Adreno 3XX dFd*( vec3 ) bug. See #9988

			return new JoinNode( [
				new MathNode( method, new SplitNode( a, 'x' ) ),
				new MathNode( method, new SplitNode( a, 'y' ) ),
				new MathNode( method, new SplitNode( a, 'z' ) )
			] ).build( builder );

		} else if ( method === MathNode.TransformDirection ) {

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

			return new MathNode( MathNode.Normalize, mulNode ).build( builder );

		} else if ( method === MathNode.Saturate ) {

			return builder.format( `clamp( ${ a.build( builder, inputType ) }, 0.0, 1.0 )`, type, output );

		} else if ( method === MathNode.Negate ) {

			return builder.format( '( -' + a.build( builder, inputType ) + ' )', type, output );

		} else if ( method === MathNode.Invert ) {

			return builder.format( '( 1.0 - ' + a.build( builder, inputType ) + ' )', type, output );

		} else {

			const params = [];

			if ( method === MathNode.Cross ) {

				params.push(
					a.build( builder, type ),
					b.build( builder, type )
				);

			} else if ( method === MathNode.Step ) {

				params.push(
					a.build( builder, builder.getTypeLength( a.getNodeType( builder ) ) === 1 ? 'float' : inputType ),
					b.build( builder, inputType )
				);

			} else if ( ( isWebGL && ( method === MathNode.Min || method === MathNode.Max ) ) || method === MathNode.Mod ) {

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

			} else if ( method === MathNode.Mix ) {

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
