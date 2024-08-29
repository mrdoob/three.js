import { registerNode } from '../core/Node.js';
import TempNode from '../core/TempNode.js';
import { sub, mul, div } from './OperatorNode.js';
import { addMethodChaining, nodeObject, nodeProxy, float, vec2, vec3, vec4, Fn } from '../tsl/TSLCore.js';

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

		} else if ( method === MathNode.ALL ) {

			return 'bool';

		} else if ( method === MathNode.EQUALS ) {

			return builder.changeComponentType( this.aNode.getNodeType( builder ), 'bool' );

		} else if ( method === MathNode.MOD ) {

			return this.aNode.getNodeType( builder );

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

			if ( method === MathNode.CROSS || method === MathNode.MOD ) {

				params.push(
					a.build( builder, type ),
					b.build( builder, type )
				);

			} else if ( isWebGL && method === MathNode.STEP ) {

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

			return builder.format( `${ builder.getMethod( method, type ) }( ${params.join( ', ' )} )`, type, output );

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

MathNode.ALL = 'all';
MathNode.ANY = 'any';
MathNode.EQUALS = 'equals';

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
MathNode.BITCAST = 'bitcast';
MathNode.TRANSPOSE = 'transpose';

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

MathNode.type = /*@__PURE__*/ registerNode( 'Math', MathNode );

export const EPSILON = /*@__PURE__*/ float( 1e-6 );
export const INFINITY = /*@__PURE__*/ float( 1e6 );
export const PI = /*@__PURE__*/ float( Math.PI );
export const PI2 = /*@__PURE__*/ float( Math.PI * 2 );

export const all = /*@__PURE__*/ nodeProxy( MathNode, MathNode.ALL );
export const any = /*@__PURE__*/ nodeProxy( MathNode, MathNode.ANY );
export const equals = /*@__PURE__*/ nodeProxy( MathNode, MathNode.EQUALS );

export const radians = /*@__PURE__*/ nodeProxy( MathNode, MathNode.RADIANS );
export const degrees = /*@__PURE__*/ nodeProxy( MathNode, MathNode.DEGREES );
export const exp = /*@__PURE__*/ nodeProxy( MathNode, MathNode.EXP );
export const exp2 = /*@__PURE__*/ nodeProxy( MathNode, MathNode.EXP2 );
export const log = /*@__PURE__*/ nodeProxy( MathNode, MathNode.LOG );
export const log2 = /*@__PURE__*/ nodeProxy( MathNode, MathNode.LOG2 );
export const sqrt = /*@__PURE__*/ nodeProxy( MathNode, MathNode.SQRT );
export const inverseSqrt = /*@__PURE__*/ nodeProxy( MathNode, MathNode.INVERSE_SQRT );
export const floor = /*@__PURE__*/ nodeProxy( MathNode, MathNode.FLOOR );
export const ceil = /*@__PURE__*/ nodeProxy( MathNode, MathNode.CEIL );
export const normalize = /*@__PURE__*/ nodeProxy( MathNode, MathNode.NORMALIZE );
export const fract = /*@__PURE__*/ nodeProxy( MathNode, MathNode.FRACT );
export const sin = /*@__PURE__*/ nodeProxy( MathNode, MathNode.SIN );
export const cos = /*@__PURE__*/ nodeProxy( MathNode, MathNode.COS );
export const tan = /*@__PURE__*/ nodeProxy( MathNode, MathNode.TAN );
export const asin = /*@__PURE__*/ nodeProxy( MathNode, MathNode.ASIN );
export const acos = /*@__PURE__*/ nodeProxy( MathNode, MathNode.ACOS );
export const atan = /*@__PURE__*/ nodeProxy( MathNode, MathNode.ATAN );
export const abs = /*@__PURE__*/ nodeProxy( MathNode, MathNode.ABS );
export const sign = /*@__PURE__*/ nodeProxy( MathNode, MathNode.SIGN );
export const length = /*@__PURE__*/ nodeProxy( MathNode, MathNode.LENGTH );
export const negate = /*@__PURE__*/ nodeProxy( MathNode, MathNode.NEGATE );
export const oneMinus = /*@__PURE__*/ nodeProxy( MathNode, MathNode.ONE_MINUS );
export const dFdx = /*@__PURE__*/ nodeProxy( MathNode, MathNode.DFDX );
export const dFdy = /*@__PURE__*/ nodeProxy( MathNode, MathNode.DFDY );
export const round = /*@__PURE__*/ nodeProxy( MathNode, MathNode.ROUND );
export const reciprocal = /*@__PURE__*/ nodeProxy( MathNode, MathNode.RECIPROCAL );
export const trunc = /*@__PURE__*/ nodeProxy( MathNode, MathNode.TRUNC );
export const fwidth = /*@__PURE__*/ nodeProxy( MathNode, MathNode.FWIDTH );
export const bitcast = /*@__PURE__*/ nodeProxy( MathNode, MathNode.BITCAST );
export const transpose = /*@__PURE__*/ nodeProxy( MathNode, MathNode.TRANSPOSE );

export const atan2 = /*@__PURE__*/ nodeProxy( MathNode, MathNode.ATAN2 );
export const min = /*@__PURE__*/ nodeProxy( MathNode, MathNode.MIN );
export const max = /*@__PURE__*/ nodeProxy( MathNode, MathNode.MAX );
export const mod = /*@__PURE__*/ nodeProxy( MathNode, MathNode.MOD );
export const step = /*@__PURE__*/ nodeProxy( MathNode, MathNode.STEP );
export const reflect = /*@__PURE__*/ nodeProxy( MathNode, MathNode.REFLECT );
export const distance = /*@__PURE__*/ nodeProxy( MathNode, MathNode.DISTANCE );
export const difference = /*@__PURE__*/ nodeProxy( MathNode, MathNode.DIFFERENCE );
export const dot = /*@__PURE__*/ nodeProxy( MathNode, MathNode.DOT );
export const cross = /*@__PURE__*/ nodeProxy( MathNode, MathNode.CROSS );
export const pow = /*@__PURE__*/ nodeProxy( MathNode, MathNode.POW );
export const pow2 = /*@__PURE__*/ nodeProxy( MathNode, MathNode.POW, 2 );
export const pow3 = /*@__PURE__*/ nodeProxy( MathNode, MathNode.POW, 3 );
export const pow4 = /*@__PURE__*/ nodeProxy( MathNode, MathNode.POW, 4 );
export const transformDirection = /*@__PURE__*/ nodeProxy( MathNode, MathNode.TRANSFORM_DIRECTION );

export const cbrt = ( a ) => mul( sign( a ), pow( abs( a ), 1.0 / 3.0 ) );
export const lengthSq = ( a ) => dot( a, a );
export const mix = /*@__PURE__*/ nodeProxy( MathNode, MathNode.MIX );
export const clamp = ( value, low = 0, high = 1 ) => nodeObject( new MathNode( MathNode.CLAMP, nodeObject( value ), nodeObject( low ), nodeObject( high ) ) );
export const saturate = ( value ) => clamp( value );
export const refract = /*@__PURE__*/ nodeProxy( MathNode, MathNode.REFRACT );
export const smoothstep = /*@__PURE__*/ nodeProxy( MathNode, MathNode.SMOOTHSTEP );
export const faceForward = /*@__PURE__*/ nodeProxy( MathNode, MathNode.FACEFORWARD );

export const rand = /*@__PURE__*/ Fn( ( [ uv ] ) => {

	const a = 12.9898, b = 78.233, c = 43758.5453;
	const dt = dot( uv.xy, vec2( a, b ) ), sn = mod( dt, PI );

	return fract( sin( sn ).mul( c ) );

} );

export const mixElement = ( t, e1, e2 ) => mix( e1, e2, t );
export const smoothstepElement = ( x, low, high ) => smoothstep( low, high, x );

addMethodChaining( 'all', all );
addMethodChaining( 'any', any );
addMethodChaining( 'equals', equals );

addMethodChaining( 'radians', radians );
addMethodChaining( 'degrees', degrees );
addMethodChaining( 'exp', exp );
addMethodChaining( 'exp2', exp2 );
addMethodChaining( 'log', log );
addMethodChaining( 'log2', log2 );
addMethodChaining( 'sqrt', sqrt );
addMethodChaining( 'inverseSqrt', inverseSqrt );
addMethodChaining( 'floor', floor );
addMethodChaining( 'ceil', ceil );
addMethodChaining( 'normalize', normalize );
addMethodChaining( 'fract', fract );
addMethodChaining( 'sin', sin );
addMethodChaining( 'cos', cos );
addMethodChaining( 'tan', tan );
addMethodChaining( 'asin', asin );
addMethodChaining( 'acos', acos );
addMethodChaining( 'atan', atan );
addMethodChaining( 'abs', abs );
addMethodChaining( 'sign', sign );
addMethodChaining( 'length', length );
addMethodChaining( 'lengthSq', lengthSq );
addMethodChaining( 'negate', negate );
addMethodChaining( 'oneMinus', oneMinus );
addMethodChaining( 'dFdx', dFdx );
addMethodChaining( 'dFdy', dFdy );
addMethodChaining( 'round', round );
addMethodChaining( 'reciprocal', reciprocal );
addMethodChaining( 'trunc', trunc );
addMethodChaining( 'fwidth', fwidth );
addMethodChaining( 'atan2', atan2 );
addMethodChaining( 'min', min );
addMethodChaining( 'max', max );
addMethodChaining( 'mod', mod );
addMethodChaining( 'step', step );
addMethodChaining( 'reflect', reflect );
addMethodChaining( 'distance', distance );
addMethodChaining( 'dot', dot );
addMethodChaining( 'cross', cross );
addMethodChaining( 'pow', pow );
addMethodChaining( 'pow2', pow2 );
addMethodChaining( 'pow3', pow3 );
addMethodChaining( 'pow4', pow4 );
addMethodChaining( 'transformDirection', transformDirection );
addMethodChaining( 'mix', mixElement );
addMethodChaining( 'clamp', clamp );
addMethodChaining( 'refract', refract );
addMethodChaining( 'smoothstep', smoothstepElement );
addMethodChaining( 'faceForward', faceForward );
addMethodChaining( 'difference', difference );
addMethodChaining( 'saturate', saturate );
addMethodChaining( 'cbrt', cbrt );
addMethodChaining( 'transpose', transpose );
addMethodChaining( 'rand', rand );
