import { sub, mul, div, add } from './OperatorNode.js';
import { PI, pow, sin } from './MathNode.js';
import { mat3, vec3, vec4 } from '../tsl/TSLCore.js';

/**
 * Builds a symmetric covariance matrix from the packed upper-triangle representation
 * used by Gaussian covariance data.
 *
 * @tsl
 * @function
 * @param {Node<vec4>} covA - The packed values `( c00, c01, c02, c11 )`.
 * @param {Node<vec4>} covB - The packed values `( c12, c22, unused, unused )`.
 * @return {Node<mat3>} The covariance matrix.
 */
export const covarianceToMatrix = ( covA, covB ) => mat3(
	vec3( covA.x, covA.y, covA.z ),
	vec3( covA.y, covA.w, covB.x ),
	vec3( covA.z, covB.x, covB.y )
);

/**
 * Packs a symmetric covariance matrix into two `vec4` nodes.
 *
 * @tsl
 * @function
 * @param {Node<mat3>} covariance - The covariance matrix.
 * @return {{covA: Node<vec4>, covB: Node<vec4>}} The packed covariance.
 */
export const covarianceFromMatrix = ( covariance ) => ( {
	covA: vec4(
		covariance[ 0 ].x,
		covariance[ 0 ].y,
		covariance[ 0 ].z,
		covariance[ 1 ].y
	),
	covB: vec4(
		covariance[ 1 ].z,
		covariance[ 2 ].z,
		0,
		0
	)
} );

/**
 * Transforms a covariance matrix by the given linear transform.
 *
 * @tsl
 * @function
 * @param {Node<mat3>} covariance - The covariance matrix.
 * @param {Node<mat3>} matrix - The linear transform.
 * @return {Node<mat3>} The transformed covariance matrix.
 */
export const transformCovariance = ( covariance, matrix ) => matrix.mul( covariance ).mul( matrix.transpose() );

/**
 * A function that remaps the `[0,1]` interval into the `[0,1]` interval.
 * The corners are mapped to `0` and the center to `1`.
 * Reference: {@link https://iquilezles.org/articles/functions/}.
 *
 * @tsl
 * @function
 * @param {Node<float>} x - The value to remap.
 * @param {Node<float>} k - Allows to control the remapping functions shape by rising the parabola to a power `k`.
 * @return {Node<float>} The remapped value.
 */
export const parabola = ( x, k ) => pow( mul( 4.0, x.mul( sub( 1.0, x ) ) ), k );

/**
 * A function that remaps the `[0,1]` interval into the `[0,1]` interval.
 * Expands the sides and compresses the center, and keeps `0.5` mapped to `0.5`.
 * Reference: {@link https://iquilezles.org/articles/functions/}.
 *
 * @tsl
 * @function
 * @param {Node<float>} x - The value to remap.
 * @param {Node<float>} k - `k=1` is the identity curve,`k<1` produces the classic `gain()` shape, and `k>1` produces "s" shaped curves.
 * @return {Node<float>} The remapped value.
 */
export const gain = ( x, k ) => x.lessThan( 0.5 ) ? parabola( x.mul( 2.0 ), k ).div( 2.0 ) : sub( 1.0, parabola( mul( sub( 1.0, x ), 2.0 ), k ).div( 2.0 ) );

/**
 * A function that remaps the `[0,1]` interval into the `[0,1]` interval.
 * A generalization of the `parabola()`. Keeps the corners mapped to 0 but allows the control of the shape one either side of the curve.
 * Reference: {@link https://iquilezles.org/articles/functions/}.
 *
 * @tsl
 * @function
 * @param {Node<float>} x - The value to remap.
 * @param {Node<float>} a - First control parameter.
 * @param {Node<float>} b - Second control parameter.
 * @return {Node<float>} The remapped value.
 */
export const pcurve = ( x, a, b ) => pow( div( pow( x, a ), add( pow( x, a ), pow( sub( 1.0, x ), b ) ) ), 1.0 / a );

/**
 * A phase shifted sinus curve that starts at zero and ends at zero, with bouncing behavior.
 * Reference: {@link https://iquilezles.org/articles/functions/}.
 *
 * @tsl
 * @function
 * @param {Node<float>} x - The value to compute the sin for.
 * @param {Node<float>} k - Controls the amount of bounces.
 * @return {Node<float>} The result value.
 */
export const sinc = ( x, k ) => sin( PI.mul( k.mul( x ).sub( 1.0 ) ) ).div( PI.mul( k.mul( x ).sub( 1.0 ) ) );
