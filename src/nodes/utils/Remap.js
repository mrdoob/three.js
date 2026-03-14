import { float, addMethodChaining, Fn, bool, defined } from '../tsl/TSLCore.js';

/**
 * This node allows to remap a node value from one range into another. E.g a value of
 * `0.4` in the range `[ 0.3, 0.5 ]` should be remapped into the normalized range `[ 0, 1 ]`.
 * `remap` takes care of that and converts the original value of `0.4` to `0.5`.
 *
 * @tsl
 * @function
 * @param {Node} node - The node that should be remapped.
 * @param {Node} inLowNode - The source or current lower bound of the range.
 * @param {Node} inHighNode - The source or current upper bound of the range.
 * @param {?Node} [outLowNode=float(0)] - The target lower bound of the range.
 * @param {?Node} [outHighNode=float(1)] - The target upper bound of the range.
 * @returns {Node}
 */
export const remap = /*@__PURE__*/ Fn( ( [ node, inLowNode, inHighNode, outLowNode = float( 0 ), outHighNode = float( 1 ), doClamp = bool( false ) ] ) => {

	let t = node.sub( inLowNode ).div( inHighNode.sub( inLowNode ) );

	if ( defined( doClamp ) ) t = t.clamp();

	return t.mul( outHighNode.sub( outLowNode ) ).add( outLowNode );

} );

/**
 * This node allows to remap a node value from one range into another but with enabled clamping. E.g a value of
 * `0.4` in the range `[ 0.3, 0.5 ]` should be remapped into the normalized range `[ 0, 1 ]`.
 * `remapClamp` takes care of that and converts the original value of `0.4` to `0.5`.
 *
 * @tsl
 * @function
 * @param {Node} node - The node that should be remapped.
 * @param {Node} inLowNode - The source or current lower bound of the range.
 * @param {Node} inHighNode - The source or current upper bound of the range.
 * @param {?Node} [outLowNode=float(0)] - The target lower bound of the range.
 * @param {?Node} [outHighNode=float(1)] - The target upper bound of the range.
 * @returns {Node}
 */
export function remapClamp( node, inLowNode, inHighNode, outLowNode = float( 0 ), outHighNode = float( 1 ) ) {

	return remap( node, inLowNode, inHighNode, outLowNode, outHighNode, true );

}

addMethodChaining( 'remap', remap );
addMethodChaining( 'remapClamp', remapClamp );
