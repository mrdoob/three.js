import TempNode from '../core/TempNode.js';
import { sub, mul, div } from './OperatorNode.js';
import { addNodeClass } from '../core/Node.js';
import { addNodeElement, nodeObject, nodeProxy, float, vec3, vec4 } from '../shadernode/ShaderNode.js';

class MathNode extends TempNode {

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

		if ( method === MathNode.TRANSFORM_DIRECTION ) {

			// dir can be either a direction vector or a normal vector
			// upper-left 3x3 of matrix is assumed to be orthogonal

			let tA = a;
			let tB = b;

			if ( builder.isMatrix( tA.getNodeType( builder ) ) ) {

				tB = vec4( vec3( tB ), 0.0 );

			} else {

				tA = vec4( vec3( tA ), 0.0 );

			}

			const mulNode = mul( tA, tB ).xyz;

			return normalize( mulNode ).build( builder, output );

		} else if ( method === MathNode.NEGATE ) {

			return builder.format( '( - ' + a.build( builder, inputType ) + ' )', type, output );

		} else if ( method === MathNode.ONE_MINUS ) {

			return sub( 1.0, a ).build( builder, output );

		} else if ( method === MathNode.RECIPROCAL ) {

			return div( 1.0, a ).build( builder, output );

		} else if ( method === MathNode.DIFFERENCE ) {

			return abs( sub( a, b ) ).build( builder, output );

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
				if ( b !== null ) params.push( b.build( builder, inputType ) );
				if ( c !== null ) params.push( c.build( builder, inputType ) );

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

// 1 input

MathNode.RADIANS = 'radians';
MathNode.DEGREES = 'degrees';
MathNode.EXP = 'exp';
MathNode.EXP2 = 'exp2';
MathNode.LOG = 'log';
MathNode.LOG2 = 'log2';
MathNode.SQRT = 'sqrt';
MathNode.INVERSE_SQRT = 'inversesqrt';
MathNode.FLOOR = 'floor';
MathNode.CEIL = 'ceil';
MathNode.NORMALIZE = 'normalize';
MathNode.FRACT = 'fract';
MathNode.SIN = 'sin';
MathNode.COS = 'cos';
MathNode.TAN = 'tan';
MathNode.ASIN = 'asin';
MathNode.ACOS = 'acos';
MathNode.ATAN = 'atan';
MathNode.ABS = 'abs';
MathNode.SIGN = 'sign';
MathNode.LENGTH = 'length';
MathNode.NEGATE = 'negate';
MathNode.ONE_MINUS = 'oneMinus';
MathNode.DFDX = 'dFdx';
MathNode.DFDY = 'dFdy';
MathNode.ROUND = 'round';
MathNode.RECIPROCAL = 'reciprocal';
MathNode.TRUNC = 'trunc';
MathNode.FWIDTH = 'fwidth';

// 2 inputs

MathNode.ATAN2 = 'atan2';
MathNode.MIN = 'min';
MathNode.MAX = 'max';
MathNode.MOD = 'mod';
MathNode.STEP = 'step';
MathNode.REFLECT = 'reflect';
MathNode.DISTANCE = 'distance';
MathNode.DIFFERENCE = 'difference';
MathNode.DOT = 'dot';
MathNode.CROSS = 'cross';
MathNode.POW = 'pow';
MathNode.TRANSFORM_DIRECTION = 'transformDirection';

// 3 inputs

MathNode.MIX = 'mix';
MathNode.CLAMP = 'clamp';
MathNode.REFRACT = 'refract';
MathNode.SMOOTHSTEP = 'smoothstep';
MathNode.FACEFORWARD = 'faceforward';

export default MathNode;

export const EPSILON = float( 1e-6 );
export const INFINITY = float( 1e6 );

export const radians = nodeProxy( MathNode, MathNode.RADIANS );
export const degrees = nodeProxy( MathNode, MathNode.DEGREES );
export const exp = nodeProxy( MathNode, MathNode.EXP );
export const exp2 = nodeProxy( MathNode, MathNode.EXP2 );
export const log = nodeProxy( MathNode, MathNode.LOG );
export const log2 = nodeProxy( MathNode, MathNode.LOG2 );
export const sqrt = nodeProxy( MathNode, MathNode.SQRT );
export const inverseSqrt = nodeProxy( MathNode, MathNode.INVERSE_SQRT );
export const floor = nodeProxy( MathNode, MathNode.FLOOR );
export const ceil = nodeProxy( MathNode, MathNode.CEIL );
export const normalize = nodeProxy( MathNode, MathNode.NORMALIZE );
export const fract = nodeProxy( MathNode, MathNode.FRACT );
export const sin = nodeProxy( MathNode, MathNode.SIN );
export const cos = nodeProxy( MathNode, MathNode.COS );
export const tan = nodeProxy( MathNode, MathNode.TAN );
export const asin = nodeProxy( MathNode, MathNode.ASIN );
export const acos = nodeProxy( MathNode, MathNode.ACOS );
export const atan = nodeProxy( MathNode, MathNode.ATAN );
export const abs = nodeProxy( MathNode, MathNode.ABS );
export const sign = nodeProxy( MathNode, MathNode.SIGN );
export const length = nodeProxy( MathNode, MathNode.LENGTH );
export const negate = nodeProxy( MathNode, MathNode.NEGATE );
export const oneMinus = nodeProxy( MathNode, MathNode.ONE_MINUS );
export const dFdx = nodeProxy( MathNode, MathNode.DFDX );
export const dFdy = nodeProxy( MathNode, MathNode.DFDY );
export const round = nodeProxy( MathNode, MathNode.ROUND );
export const reciprocal = nodeProxy( MathNode, MathNode.RECIPROCAL );
export const trunc = nodeProxy( MathNode, MathNode.TRUNC );
export const fwidth = nodeProxy( MathNode, MathNode.FWIDTH );

export const atan2 = nodeProxy( MathNode, MathNode.ATAN2 );
export const min = nodeProxy( MathNode, MathNode.MIN );
export const max = nodeProxy( MathNode, MathNode.MAX );
export const mod = nodeProxy( MathNode, MathNode.MOD );
export const step = nodeProxy( MathNode, MathNode.STEP );
export const reflect = nodeProxy( MathNode, MathNode.REFLECT );
export const distance = nodeProxy( MathNode, MathNode.DISTANCE );
export const difference = nodeProxy( MathNode, MathNode.DIFFERENCE );
export const dot = nodeProxy( MathNode, MathNode.DOT );
export const cross = nodeProxy( MathNode, MathNode.CROSS );
export const pow = nodeProxy( MathNode, MathNode.POW );
export const pow2 = nodeProxy( MathNode, MathNode.POW, 2 );
export const pow3 = nodeProxy( MathNode, MathNode.POW, 3 );
export const pow4 = nodeProxy( MathNode, MathNode.POW, 4 );
export const transformDirection = nodeProxy( MathNode, MathNode.TRANSFORM_DIRECTION );

export const mix = nodeProxy( MathNode, MathNode.MIX );
export const clamp = ( value, low = 0, high = 1 ) => nodeObject( new MathNode( MathNode.CLAMP, nodeObject( value ), nodeObject( low ), nodeObject( high ) ) );
export const saturate = ( value ) => clamp( value );
export const refract = nodeProxy( MathNode, MathNode.REFRACT );
export const smoothstep = nodeProxy( MathNode, MathNode.SMOOTHSTEP );
export const faceForward = nodeProxy( MathNode, MathNode.FACEFORWARD );

export const mixElement = ( t, e1, e2 ) => mix( e1, e2, t );
export const smoothstepElement = ( x, low, high ) => smoothstep( low, high, x );

addNodeElement( 'radians', radians );
addNodeElement( 'degrees', degrees );
addNodeElement( 'exp', exp );
addNodeElement( 'exp2', exp2 );
addNodeElement( 'log', log );
addNodeElement( 'log2', log2 );
addNodeElement( 'sqrt', sqrt );
addNodeElement( 'inverseSqrt', inverseSqrt );
addNodeElement( 'floor', floor );
addNodeElement( 'ceil', ceil );
addNodeElement( 'normalize', normalize );
addNodeElement( 'fract', fract );
addNodeElement( 'sin', sin );
addNodeElement( 'cos', cos );
addNodeElement( 'tan', tan );
addNodeElement( 'asin', asin );
addNodeElement( 'acos', acos );
addNodeElement( 'atan', atan );
addNodeElement( 'abs', abs );
addNodeElement( 'sign', sign );
addNodeElement( 'length', length );
addNodeElement( 'negate', negate );
addNodeElement( 'oneMinus', oneMinus );
addNodeElement( 'dFdx', dFdx );
addNodeElement( 'dFdy', dFdy );
addNodeElement( 'round', round );
addNodeElement( 'reciprocal', reciprocal );
addNodeElement( 'trunc', trunc );
addNodeElement( 'fwidth', fwidth );
addNodeElement( 'atan2', atan2 );
addNodeElement( 'min', min );
addNodeElement( 'max', max );
addNodeElement( 'mod', mod );
addNodeElement( 'step', step );
addNodeElement( 'reflect', reflect );
addNodeElement( 'distance', distance );
addNodeElement( 'dot', dot );
addNodeElement( 'cross', cross );
addNodeElement( 'pow', pow );
addNodeElement( 'pow2', pow2 );
addNodeElement( 'pow3', pow3 );
addNodeElement( 'pow4', pow4 );
addNodeElement( 'transformDirection', transformDirection );
addNodeElement( 'mix', mixElement );
addNodeElement( 'clamp', clamp );
addNodeElement( 'refract', refract );
addNodeElement( 'smoothstep', smoothstepElement );
addNodeElement( 'faceForward', faceForward );
addNodeElement( 'difference', difference );
addNodeElement( 'saturate', saturate );

addNodeClass( 'MathNode', MathNode );
