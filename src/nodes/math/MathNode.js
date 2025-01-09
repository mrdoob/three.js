import TempNode from '../core/TempNode.js';
import { sub, mul, div } from './OperatorNode.js';
import { addMethodChaining, nodeObject, nodeProxy, float, vec2, vec3, vec4, Fn } from '../tsl/TSLCore.js';
import { WebGLCoordinateSystem, WebGPUCoordinateSystem } from '../../constants.js';

/** @module MathNode **/

/**
 * This node represents a variety of mathematical methods available in shaders.
 * They are divided into three categories:
 *
 * - Methods with one input like `sin`, `cos` or `normalize`.
 * - Methods with two inputs like `dot`, `cross` or `pow`.
 * - Methods with three inputs like `mix`, `clamp` or `smoothstep`.
 *
 * @augments TempNode
 */
class MathNode extends TempNode {

	static get type() {

		return 'MathNode';

	}

	/**
	 * Constructs a new math node.
	 *
	 * @param {String} method - The method name.
	 * @param {Node} aNode - The first input.
	 * @param {Node?} [bNode=null] - The second input.
	 * @param {Node?} [cNode=null] - The third input.
	 */
	constructor( method, aNode, bNode = null, cNode = null ) {

		super();

		/**
		 * The method name.
		 *
		 * @type {String}
		 */
		this.method = method;

		/**
		 * The first input.
		 *
		 * @type {Node}
		 */
		this.aNode = aNode;

		/**
		 * The second input.
		 *
		 * @type {Node?}
		 * @default null
		 */
		this.bNode = bNode;

		/**
		 * The third input.
		 *
		 * @type {Node?}
		 * @default null
		 */
		this.cNode = cNode;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {Boolean}
		 * @readonly
		 * @default true
		 */
		this.isMathNode = true;

	}

	/**
	 * The input type is inferred from the node types of the input nodes.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {String} The input type.
	 */
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

	/**
	 * The selected method as well as the input type determine the node type of this node.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {String} The node type.
	 */
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

		let method = this.method;

		const type = this.getNodeType( builder );
		const inputType = this.getInputType( builder );

		const a = this.aNode;
		const b = this.bNode;
		const c = this.cNode;

		const coordinateSystem = builder.renderer.coordinateSystem;

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

			} else if ( coordinateSystem === WebGLCoordinateSystem && method === MathNode.STEP ) {

				params.push(
					a.build( builder, builder.getTypeLength( a.getNodeType( builder ) ) === 1 ? 'float' : inputType ),
					b.build( builder, inputType )
				);

			} else if ( ( coordinateSystem === WebGLCoordinateSystem && ( method === MathNode.MIN || method === MathNode.MAX ) ) || method === MathNode.MOD ) {

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

				if ( coordinateSystem === WebGPUCoordinateSystem && method === MathNode.ATAN && b !== null ) {

					method = 'atan2';

				}

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
MathNode.TRANSPOSE = 'transpose';

// 2 inputs

MathNode.BITCAST = 'bitcast';
MathNode.EQUALS = 'equals';
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

// 1 inputs

/**
 * A small value used to handle floating-point precision errors.
 *
 * @type {Node<float>}
 */
export const EPSILON = /*@__PURE__*/ float( 1e-6 );

/**
 * Represents infinity.
 *
 * @type {Node<float>}
 */
export const INFINITY = /*@__PURE__*/ float( 1e6 );

/**
 * Represents PI.
 *
 * @type {Node<float>}
 */
export const PI = /*@__PURE__*/ float( Math.PI );

/**
 * Represents PI * 2.
 *
 * @type {Node<float>}
 */
export const PI2 = /*@__PURE__*/ float( Math.PI * 2 );

/**
 * Returns `true` if all components of `x` are `true`.
 *
 * @function
 * @param {Node | Number} x - The parameter.
 * @returns {Node<bool>}
 */
export const all = /*@__PURE__*/ nodeProxy( MathNode, MathNode.ALL );

/**
 * Returns `true` if any components of `x` are `true`.
 *
 * @function
 * @param {Node | Number} x - The parameter.
 * @returns {Node<bool>}
 */
export const any = /*@__PURE__*/ nodeProxy( MathNode, MathNode.ANY );

/**
 * Converts a quantity in degrees to radians.
 *
 * @function
 * @param {Node | Number} x - The input in degrees.
 * @returns {Node}
 */
export const radians = /*@__PURE__*/ nodeProxy( MathNode, MathNode.RADIANS );

/**
 * Convert a quantity in radians to degrees.
 *
 * @function
 * @param {Node | Number} x - The input in radians.
 * @returns {Node}
 */
export const degrees = /*@__PURE__*/ nodeProxy( MathNode, MathNode.DEGREES );

/**
 * Returns the natural exponentiation of the parameter.
 *
 * @function
 * @param {Node | Number} x - The parameter.
 * @returns {Node}
 */
export const exp = /*@__PURE__*/ nodeProxy( MathNode, MathNode.EXP );

/**
 * Returns 2 raised to the power of the parameter.
 *
 * @function
 * @param {Node | Number} x - The parameter.
 * @returns {Node}
 */
export const exp2 = /*@__PURE__*/ nodeProxy( MathNode, MathNode.EXP2 );

/**
 * Returns the natural logarithm of the parameter.
 *
 * @function
 * @param {Node | Number} x - The parameter.
 * @returns {Node}
 */
export const log = /*@__PURE__*/ nodeProxy( MathNode, MathNode.LOG );

/**
 * Returns the base 2 logarithm of the parameter.
 *
 * @function
 * @param {Node | Number} x - The parameter.
 * @returns {Node}
 */
export const log2 = /*@__PURE__*/ nodeProxy( MathNode, MathNode.LOG2 );

/**
 * Returns the square root of the parameter.
 *
 * @function
 * @param {Node | Number} x - The parameter.
 * @returns {Node}
 */
export const sqrt = /*@__PURE__*/ nodeProxy( MathNode, MathNode.SQRT );

/**
 * Returns the inverse of the square root of the parameter.
 *
 * @function
 * @param {Node | Number} x - The parameter.
 * @returns {Node}
 */
export const inverseSqrt = /*@__PURE__*/ nodeProxy( MathNode, MathNode.INVERSE_SQRT );

/**
 * Finds the nearest integer less than or equal to the parameter.
 *
 * @function
 * @param {Node | Number} x - The parameter.
 * @returns {Node}
 */
export const floor = /*@__PURE__*/ nodeProxy( MathNode, MathNode.FLOOR );

/**
 * Finds the nearest integer that is greater than or equal to the parameter.
 *
 * @function
 * @param {Node | Number} x - The parameter.
 * @returns {Node}
 */
export const ceil = /*@__PURE__*/ nodeProxy( MathNode, MathNode.CEIL );

/**
 * Calculates the unit vector in the same direction as the original vector.
 *
 * @function
 * @param {Node} x - The input vector.
 * @returns {Node}
 */
export const normalize = /*@__PURE__*/ nodeProxy( MathNode, MathNode.NORMALIZE );

/**
 * Computes the fractional part of the parameter.
 *
 * @function
 * @param {Node | Number} x - The parameter.
 * @returns {Node}
 */
export const fract = /*@__PURE__*/ nodeProxy( MathNode, MathNode.FRACT );

/**
 * Returns the sine of the parameter.
 *
 * @function
 * @param {Node | Number} x - The parameter.
 * @returns {Node}
 */
export const sin = /*@__PURE__*/ nodeProxy( MathNode, MathNode.SIN );

/**
 * Returns the cosine of the parameter.
 *
 * @function
 * @param {Node | Number} x - The parameter.
 * @returns {Node}
 */
export const cos = /*@__PURE__*/ nodeProxy( MathNode, MathNode.COS );

/**
 * Returns the tangent of the parameter.
 *
 * @function
 * @param {Node | Number} x - The parameter.
 * @returns {Node}
 */
export const tan = /*@__PURE__*/ nodeProxy( MathNode, MathNode.TAN );

/**
 * Returns the arcsine of the parameter.
 *
 * @function
 * @param {Node | Number} x - The parameter.
 * @returns {Node}
 */
export const asin = /*@__PURE__*/ nodeProxy( MathNode, MathNode.ASIN );

/**
 * Returns the arccosine of the parameter.
 *
 * @function
 * @param {Node | Number} x - The parameter.
 * @returns {Node}
 */
export const acos = /*@__PURE__*/ nodeProxy( MathNode, MathNode.ACOS );

/**
 * Returns the arc-tangent of the parameter.
 * If two parameters are provided, the result is `atan2(y/x)`.
 *
 * @function
 * @param {Node | Number} y - The y parameter.
 * @param {(Node | Number)?} x - The x parameter.
 * @returns {Node}
 */
export const atan = /*@__PURE__*/ nodeProxy( MathNode, MathNode.ATAN );

/**
 * Returns the absolute value of the parameter.
 *
 * @function
 * @param {Node | Number} x - The parameter.
 * @returns {Node}
 */
export const abs = /*@__PURE__*/ nodeProxy( MathNode, MathNode.ABS );

/**
 * Extracts the sign of the parameter.
 *
 * @function
 * @param {Node | Number} x - The parameter.
 * @returns {Node}
 */
export const sign = /*@__PURE__*/ nodeProxy( MathNode, MathNode.SIGN );

/**
 * Calculates the length of a vector.
 *
 * @function
 * @param {Node} x - The parameter.
 * @returns {Node<float>}
 */
export const length = /*@__PURE__*/ nodeProxy( MathNode, MathNode.LENGTH );

/**
 * Negates the value of the parameter (-x).
 *
 * @function
 * @param {Node | Number} x - The parameter.
 * @returns {Node}
 */
export const negate = /*@__PURE__*/ nodeProxy( MathNode, MathNode.NEGATE );

/**
 * Return `1` minus the parameter.
 *
 * @function
 * @param {Node | Number} x - The parameter.
 * @returns {Node}
 */
export const oneMinus = /*@__PURE__*/ nodeProxy( MathNode, MathNode.ONE_MINUS );

/**
 * Returns the partial derivative of the parameter with respect to x.
 *
 * @function
 * @param {Node | Number} x - The parameter.
 * @returns {Node}
 */
export const dFdx = /*@__PURE__*/ nodeProxy( MathNode, MathNode.DFDX );

/**
 * Returns the partial derivative of the parameter with respect to y.
 *
 * @function
 * @param {Node | Number} x - The parameter.
 * @returns {Node}
 */
export const dFdy = /*@__PURE__*/ nodeProxy( MathNode, MathNode.DFDY );

/**
 * Rounds the parameter to the nearest integer.
 *
 * @function
 * @param {Node | Number} x - The parameter.
 * @returns {Node}
 */
export const round = /*@__PURE__*/ nodeProxy( MathNode, MathNode.ROUND );

/**
 * Returns the reciprocal of the parameter `(1/x)`.
 *
 * @function
 * @param {Node | Number} x - The parameter.
 * @returns {Node}
 */
export const reciprocal = /*@__PURE__*/ nodeProxy( MathNode, MathNode.RECIPROCAL );

/**
 * Truncates the parameter, removing the fractional part.
 *
 * @function
 * @param {Node | Number} x - The parameter.
 * @returns {Node}
 */
export const trunc = /*@__PURE__*/ nodeProxy( MathNode, MathNode.TRUNC );

/**
 * Returns the sum of the absolute derivatives in x and y.
 *
 * @function
 * @param {Node | Number} x - The parameter.
 * @returns {Node}
 */
export const fwidth = /*@__PURE__*/ nodeProxy( MathNode, MathNode.FWIDTH );

/**
 * Returns the transpose of a matrix.
 *
 * @function
 * @param {Node<mat2|mat3|mat4>} x - The parameter.
 * @returns {Node}
 */
export const transpose = /*@__PURE__*/ nodeProxy( MathNode, MathNode.TRANSPOSE );

// 2 inputs

/**
 * Reinterpret the bit representation of a value in one type as a value in another type.
 *
 * @function
 * @param {Node | Number} x - The parameter.
 * @param {String} y - The new type.
 * @returns {Node}
 */
export const bitcast = /*@__PURE__*/ nodeProxy( MathNode, MathNode.BITCAST );

/**
 * Returns `true` if `x` equals `y`.
 *
 * @function
 * @param {Node | Number} x - The first parameter.
 * @param {Node | Number} y - The second parameter.
 * @returns {Node<bool>}
 */
export const equals = /*@__PURE__*/ nodeProxy( MathNode, MathNode.EQUALS );

/**
 * Returns the lesser of two values.
 *
 * @function
 * @param {Node | Number} x - The y parameter.
 * @param {Node | Number} y - The x parameter.
 * @returns {Node}
 */
export const min = /*@__PURE__*/ nodeProxy( MathNode, MathNode.MIN );

/**
 * Returns the greater of two values.
 *
 * @function
 * @param {Node | Number} x - The y parameter.
 * @param {Node | Number} y - The x parameter.
 * @returns {Node}
 */
export const max = /*@__PURE__*/ nodeProxy( MathNode, MathNode.MAX );

/**
 * Computes the remainder of dividing the first node by the second one.
 *
 * @function
 * @param {Node | Number} x - The y parameter.
 * @param {Node | Number} y - The x parameter.
 * @returns {Node}
 */
export const mod = /*@__PURE__*/ nodeProxy( MathNode, MathNode.MOD );

/**
 * Generate a step function by comparing two values.
 *
 * @function
 * @param {Node | Number} x - The y parameter.
 * @param {Node | Number} y - The x parameter.
 * @returns {Node}
 */
export const step = /*@__PURE__*/ nodeProxy( MathNode, MathNode.STEP );

/**
 * Calculates the reflection direction for an incident vector.
 *
 * @function
 * @param {Node<vec2|vec3|vec4>} I - The incident vector.
 * @param {Node<vec2|vec3|vec4>} N - The normal vector.
 * @returns {Node<vec2|vec3|vec4>}
 */
export const reflect = /*@__PURE__*/ nodeProxy( MathNode, MathNode.REFLECT );

/**
 * Calculates the distance between two points.
 *
 * @function
 * @param {Node<vec2|vec3|vec4>} x - The first point.
 * @param {Node<vec2|vec3|vec4>} y - The second point.
 * @returns {Node<float>}
 */
export const distance = /*@__PURE__*/ nodeProxy( MathNode, MathNode.DISTANCE );

/**
 * Calculates the absolute difference between two values.
 *
 * @function
 * @param {Node | Number} x - The first parameter.
 * @param {Node | Number} y - The second parameter.
 * @returns {Node}
 */
export const difference = /*@__PURE__*/ nodeProxy( MathNode, MathNode.DIFFERENCE );

/**
 * Calculates the dot product of two vectors.
 *
 * @function
 * @param {Node<vec2|vec3|vec4>} x - The first vector.
 * @param {Node<vec2|vec3|vec4>} y - The second vector.
 * @returns {Node<float>}
 */
export const dot = /*@__PURE__*/ nodeProxy( MathNode, MathNode.DOT );

/**
 * Calculates the cross product of two vectors.
 *
 * @function
 * @param {Node<vec2|vec3|vec4>} x - The first vector.
 * @param {Node<vec2|vec3|vec4>} y - The second vector.
 * @returns {Node<vec2|vec3|vec4>}
 */
export const cross = /*@__PURE__*/ nodeProxy( MathNode, MathNode.CROSS );

/**
 * Return the value of the first parameter raised to the power of the second one.
 *
 * @function
 * @param {Node | Number} x - The first parameter.
 * @param {Node | Number} y - The second parameter.
 * @returns {Node}
 */
export const pow = /*@__PURE__*/ nodeProxy( MathNode, MathNode.POW );

/**
 * Returns the square of the parameter.
 *
 * @function
 * @param {Node | Number} x - The first parameter.
 * @returns {Node}
 */
export const pow2 = /*@__PURE__*/ nodeProxy( MathNode, MathNode.POW, 2 );

/**
 * Returns the cube of the parameter.
 *
 * @function
 * @param {Node | Number} x - The first parameter.
 * @returns {Node}
 */
export const pow3 = /*@__PURE__*/ nodeProxy( MathNode, MathNode.POW, 3 );

/**
 * Returns the fourth power of the parameter.
 *
 * @function
 * @param {Node | Number} x - The first parameter.
 * @returns {Node}
 */
export const pow4 = /*@__PURE__*/ nodeProxy( MathNode, MathNode.POW, 4 );

/**
 * Transforms the direction of a vector by a matrix and then normalizes the result.
 *
 * @function
 * @param {Node<vec2|vec3|vec4>} direction - The direction vector.
 * @param {Node<mat2|mat3|mat4>} matrix - The transformation matrix.
 * @returns {Node}
 */
export const transformDirection = /*@__PURE__*/ nodeProxy( MathNode, MathNode.TRANSFORM_DIRECTION );

/**
 * Returns the cube root of a number.
 *
 * @function
 * @param {Node | Number} a - The first parameter.
 * @returns {Node}
 */
export const cbrt = ( a ) => mul( sign( a ), pow( abs( a ), 1.0 / 3.0 ) );

/**
 * Calculate the squared length of a vector.
 *
 * @function
 * @param {Node<vec2|vec3|vec4>} a - The vector.
 * @returns {Node<float>}
 */
export const lengthSq = ( a ) => dot( a, a );

/**
 * Linearly interpolates between two values.
 *
 * @function
 * @param {Node | Number} a - The first parameter.
 * @param {Node | Number} b - The second parameter.
 * @param {Node | Number} t - The interpolation value.
 * @returns {Node}
 */
export const mix = /*@__PURE__*/ nodeProxy( MathNode, MathNode.MIX );

/**
 * Constrains a value to lie between two further values.
 *
 * @function
 * @param {Node | Number} value - The value to constrain.
 * @param {Node | Number} [low=0] - The lower bound.
 * @param {Node | Number} [high=1] - The upper bound.
 * @returns {Node}
 */
export const clamp = ( value, low = 0, high = 1 ) => nodeObject( new MathNode( MathNode.CLAMP, nodeObject( value ), nodeObject( low ), nodeObject( high ) ) );

/**
 * Constrains a value between `0` and `1`.
 *
 * @function
 * @param {Node | Number} value - The value to constrain.
 * @returns {Node}
 */
export const saturate = ( value ) => clamp( value );

/**
 * Calculates the refraction direction for an incident vector.
 *
 * @function
 * @param {Node<vec2|vec3|vec4>} I - The incident vector.
 * @param {Node<vec2|vec3|vec4>} N - The normal vector.
 * @param {Node<float>} eta - The the ratio of indices of refraction.
 * @returns {Node<vec2|vec3|vec4>}
 */
export const refract = /*@__PURE__*/ nodeProxy( MathNode, MathNode.REFRACT );

/**
 * Performs a Hermite interpolation between two values.
 *
 * @function
 * @param {Node | Number} low - The value of the lower edge of the Hermite function.
 * @param {Node | Number} high - The value of the upper edge of the Hermite function.
 * @param {Node | Number} x - The source value for interpolation.
 * @returns {Node}
 */
export const smoothstep = /*@__PURE__*/ nodeProxy( MathNode, MathNode.SMOOTHSTEP );

/**
 * Returns a vector pointing in the same direction as another.
 *
 * @function
 * @param {Node<vec2|vec3|vec4>} N - The vector to orient.
 * @param {Node<vec2|vec3|vec4>} I - The incident vector.
 * @param {Node<vec2|vec3|vec4>} Nref - The reference vector.
 * @returns {Node<vec2|vec3|vec4>}
 */
export const faceForward = /*@__PURE__*/ nodeProxy( MathNode, MathNode.FACEFORWARD );

/**
 * Returns a random value for the given uv.
 *
 * @function
 * @param {Node<vec2>} uv - The uv node.
 * @returns {Node<float>}
 */
export const rand = /*@__PURE__*/ Fn( ( [ uv ] ) => {

	const a = 12.9898, b = 78.233, c = 43758.5453;
	const dt = dot( uv.xy, vec2( a, b ) ), sn = mod( dt, PI );

	return fract( sin( sn ).mul( c ) );

} );

/**
 * Alias for `mix()` with a different parameter order.
 *
 * @function
 * @param {Node | Number} t - The interpolation value.
 * @param {Node | Number} e1 - The first parameter.
 * @param {Node | Number} e2 - The second parameter.
 * @returns {Node}
 */
export const mixElement = ( t, e1, e2 ) => mix( e1, e2, t );

/**
 * Alias for `smoothstep()` with a different parameter order.
 *
 * @function
 * @param {Node | Number} x - The source value for interpolation.
 * @param {Node | Number} low - The value of the lower edge of the Hermite function.
 * @param {Node | Number} high - The value of the upper edge of the Hermite function.
 * @returns {Node}
 */
export const smoothstepElement = ( x, low, high ) => smoothstep( low, high, x );

/**
 * Returns the arc-tangent of the quotient of its parameters.
 *
 * @function
 * @deprecated since r172. Use {@link atan} instead.
 *
 * @param {Node | Number} y - The y parameter.
 * @param {Node | Number} x - The x parameter.
 * @returns {Node}
 */
export const atan2 = ( y, x ) => { // @deprecated, r172

	console.warn( 'THREE.TSL: "atan2" is overloaded. Use "atan" instead.' );
	return atan( y, x );

};

// GLSL alias function

export const faceforward = faceForward;
export const inversesqrt = inverseSqrt;

// Method chaining

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
