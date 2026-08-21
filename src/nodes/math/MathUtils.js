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
export const sinc = ( x, k ) => {

	// `arg` has a removable singularity at `arg == 0` (i.e. `x == 1/k`):
	// mathematically sin(arg)/arg -> 1 as arg -> 0, but naively dividing
	// would compute an actual 0/0 there -- NaN at runtime, and on WGSL
	// backends a hard shader-compile error when `arg` constant-folds to
	// exactly zero. Guard it explicitly with the analytic limit instead of
	// evaluating the division at that point.
	// `.toVar()` also keeps `arg` (and therefore the division below) from
	// being folded into a compile-time constant expression -- WGSL rejects
	// an exact `0.0 / 0.0` constant fold even when it's guarded by a
	// runtime `select()`/`if` that never actually takes that branch.
	const arg = PI.mul( k.mul( x ).sub( 1.0 ) ).toVar();
	return select( abs( arg ).lessThan( 1e-6 ), 1.0, sin( arg ).div( arg ) );

};
