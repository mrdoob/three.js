import { sub, mul, div, add } from './OperatorNode.js';
import { PI, pow, sin, abs } from './MathNode.js';
import { select } from './ConditionalNode.js';

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
export const gain = ( x, k ) => select(
	x.lessThan( 0.5 ),
	pow( mul( 2.0, x ), k ).mul( 0.5 ),
	sub( 1.0, pow( mul( 2.0, sub( 1.0, x ) ), k ).mul( 0.5 ) )
);

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
export const pcurve = ( x, a, b ) => pow( div( pow( x, a ), add( pow( x, a ), pow( sub( 1.0, x ), b ) ) ), div( 1.0, a ) );

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
export const sinc = ( x, k ) => {

	const arg = abs( PI.mul( k.mul( x ).sub( 1.0 ) ) ).max( 1e-6 ).toConst();

	return sin( arg ).div( arg );

};
