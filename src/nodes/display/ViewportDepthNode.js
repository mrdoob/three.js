import Node from '../core/Node.js';
import { float, log, log2, nodeImmutable, nodeProxy } from '../tsl/TSLBase.js';
import { cameraNear, cameraFar } from '../accessors/Camera.js';
import { positionView } from '../accessors/Position.js';
import { viewportDepthTexture } from './ViewportDepthTextureNode.js';

/** @module ViewportDepthNode **/

/**
 * This node offers a collection of features in context of the depth logic in the fragment shader.
 * Depending on {@link ViewportDepthNode#scope}, it can be used to define a depth value for the current
 * fragment or for depth evaluation purposes.
 *
 * @augments Node
 */
class ViewportDepthNode extends Node {

	static get type() {

		return 'ViewportDepthNode';

	}

	/**
	 * Constructs a new viewport depth node.
	 *
	 * @param {('depth'|'depthBase'|'linearDepth')} scope - The node's scope.
	 * @param {Node?} [valueNode=null] - The value node.
	 */
	constructor( scope, valueNode = null ) {

		super( 'float' );

		/**
		 * The node behaves differently depending on which scope is selected.
		 *
		 * - `ViewportDepthNode.DEPTH_BASE`: Allows to define a value for the current fragment's depth.
		 * - `ViewportDepthNode.DEPTH`: Represents the depth value for the current fragment (`valueNode` is ignored).
		 * - `ViewportDepthNode.LINEAR_DEPTH`: Represents the linear (orthographic) depth value of the current fragment.
		 * If a `valueNode` is set, the scope can be used to convert perspective depth data to linear data.
		 *
		 * @type {('depth'|'depthBase'|'linearDepth')}
		 */
		this.scope = scope;

		/**
		 * Can be used to define a custom depth value.
		 * The property is ignored in the `ViewportDepthNode.DEPTH` scope.
		 *
		 * @type {Node?}
		 * @default null
		 */
		this.valueNode = valueNode;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {Boolean}
		 * @readonly
		 * @default true
		 */
		this.isViewportDepthNode = true;

	}

	generate( builder ) {

		const { scope } = this;

		if ( scope === ViewportDepthNode.DEPTH_BASE ) {

			return builder.getFragDepth();

		}

		return super.generate( builder );

	}

	setup( { camera } ) {

		const { scope } = this;
		const value = this.valueNode;

		let node = null;

		if ( scope === ViewportDepthNode.DEPTH_BASE ) {

			if ( value !== null ) {

 				node = depthBase().assign( value );

			}

		} else if ( scope === ViewportDepthNode.DEPTH ) {

			if ( camera.isPerspectiveCamera ) {

				node = viewZToPerspectiveDepth( positionView.z, cameraNear, cameraFar );

			} else {

				node = viewZToOrthographicDepth( positionView.z, cameraNear, cameraFar );

			}

		} else if ( scope === ViewportDepthNode.LINEAR_DEPTH ) {

			if ( value !== null ) {

				if ( camera.isPerspectiveCamera ) {

					const viewZ = perspectiveDepthToViewZ( value, cameraNear, cameraFar );

					node = viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );

				} else {

					node = value;

				}

			} else {

				node = viewZToOrthographicDepth( positionView.z, cameraNear, cameraFar );

			}

		}

		return node;

	}

}

ViewportDepthNode.DEPTH_BASE = 'depthBase';
ViewportDepthNode.DEPTH = 'depth';
ViewportDepthNode.LINEAR_DEPTH = 'linearDepth';

export default ViewportDepthNode;

// NOTE: viewZ, the z-coordinate in camera space, is negative for points in front of the camera

/**
 * TSL function for converting a viewZ value to an orthographic depth value.
 *
 * @function
 * @param {Node<float>} viewZ - The viewZ node.
 * @param {Node<float>} near - The camera's near value.
 * @param {Node<float>} far - The camera's far value.
 * @returns {Node<float>}
 */
export const viewZToOrthographicDepth = ( viewZ, near, far ) => viewZ.add( near ).div( near.sub( far ) );

/**
 * TSL function for converting an orthographic depth value to a viewZ value.
 *
 * @function
 * @param {Node<float>} depth - The orthographic depth.
 * @param {Node<float>} near - The camera's near value.
 * @param {Node<float>} far - The camera's far value.
 * @returns {Node<float>}
 */
export const orthographicDepthToViewZ = ( depth, near, far ) => near.sub( far ).mul( depth ).sub( near );

/**
 * TSL function for converting a viewZ value to a perspective depth value.
 *
 * Note: {link https://twitter.com/gonnavis/status/1377183786949959682}.
 *
 * @function
 * @param {Node<float>} viewZ - The viewZ node.
 * @param {Node<float>} near - The camera's near value.
 * @param {Node<float>} far - The camera's far value.
 * @returns {Node<float>}
 */
export const viewZToPerspectiveDepth = ( viewZ, near, far ) => near.add( viewZ ).mul( far ).div( far.sub( near ).mul( viewZ ) );

/**
 * TSL function for converting a perspective depth value to a viewZ value.
 *
 * @function
 * @param {Node<float>} depth - The perspective depth.
 * @param {Node<float>} near - The camera's near value.
 * @param {Node<float>} far - The camera's far value.
 * @returns {Node<float>}
 */
export const perspectiveDepthToViewZ = ( depth, near, far ) => near.mul( far ).div( far.sub( near ).mul( depth ).sub( far ) );

/**
 * TSL function for converting a viewZ value to a logarithmic depth value.
 *
 * @function
 * @param {Node<float>} viewZ - The viewZ node.
 * @param {Node<float>} near - The camera's near value.
 * @param {Node<float>} far - The camera's far value.
 * @returns {Node<float>}
 */
export const viewZToLogarithmicDepth = ( viewZ, near, far ) => {

	// NOTE: viewZ must be negative--see explanation at the end of this comment block.
	// The final logarithmic depth formula used here is adapted from one described in an
	// article by Thatcher Ulrich (see http://tulrich.com/geekstuff/log_depth_buffer.txt),
	// which was an improvement upon an earlier formula one described in an
	// Outerra article (https://outerra.blogspot.com/2009/08/logarithmic-z-buffer.html).
	// Ulrich's formula is the following:
	//     z = K * log( w / cameraNear ) / log( cameraFar / cameraNear )
	//     where K = 2^k - 1, and k is the number of bits in the depth buffer.
	// The Outerra variant ignored the camera near plane (it assumed it was 0) and instead
	// opted for a "C-constant" for resolution adjustment of objects near the camera.
	// Outerra states: "Notice that the 'C' variant doesn’t use a near plane distance, it has it
	// set at 0" (quote from https://outerra.blogspot.com/2012/11/maximizing-depth-buffer-range-and.html).
	// Ulrich's variant has the benefit of constant relative precision over the whole near-far range.
	// It was debated here whether Outerra's "C-constant" or Ulrich's "near plane" variant should
	// be used, and ultimately Ulrich's "near plane" version was chosen.
	// Outerra eventually made another improvement to their original "C-constant" variant,
	// but it still does not incorporate the camera near plane (for this version,
	// see https://outerra.blogspot.com/2013/07/logarithmic-depth-buffer-optimizations.html).
	// Here we make 4 changes to Ulrich's formula:
	// 1. Clamp the camera near plane so we don't divide by 0.
	// 2. Use log2 instead of log to avoid an extra multiply (shaders implement log using log2).
	// 3. Assume K is 1 (K = maximum value in depth buffer; see Ulrich's formula above).
	// 4. To maintain consistency with the functions "viewZToOrthographicDepth" and "viewZToPerspectiveDepth",
	//    we modify the formula here to use 'viewZ' instead of 'w'. The other functions expect a negative viewZ,
	//    so we do the same here, hence the 'viewZ.negate()' call.
	// For visual representation of this depth curve, see https://www.desmos.com/calculator/uyqk0vex1u
	near = near.max( 1e-6 ).toVar();
	const numerator = log2( viewZ.negate().div( near ) );
	const denominator = log2( far.div( near ) );
	return numerator.div( denominator );

};

/**
 * TSL function for converting a logarithmic depth value to a viewZ value.
 *
 * @function
 * @param {Node<float>} depth - The logarithmic depth.
 * @param {Node<float>} near - The camera's near value.
 * @param {Node<float>} far - The camera's far value.
 * @returns {Node<float>}
 */
export const logarithmicDepthToViewZ = ( depth, near, far ) => {

	// NOTE: we add a 'negate()' call to the return value here to maintain consistency with
	// the functions "orthographicDepthToViewZ" and "perspectiveDepthToViewZ" (they return
	// a negative viewZ).
	const exponent = depth.mul( log( far.div( near ) ) );
	return float( Math.E ).pow( exponent ).mul( near ).negate();

};

/**
 * TSL function for defining a value for the current fragment's depth.
 *
 * @function
 * @param {Node<float>} value - The depth value to set.
 * @returns {ViewportDepthNode<float>}
 */
const depthBase = /*@__PURE__*/ nodeProxy( ViewportDepthNode, ViewportDepthNode.DEPTH_BASE );

/**
 * TSL object that represents the depth value for the current fragment.
 *
 * @type {ViewportDepthNode}
 */
export const depth = /*@__PURE__*/ nodeImmutable( ViewportDepthNode, ViewportDepthNode.DEPTH );

/**
 * TSL function for converting a perspective depth value to linear depth.
 *
 * @function
 * @param {Node<float>} value - The perspective depth.
 * @returns {ViewportDepthNode<float>}
 */
export const linearDepth = /*@__PURE__*/ nodeProxy( ViewportDepthNode, ViewportDepthNode.LINEAR_DEPTH );

/**
 * TSL object that represents the linear (orthographic) depth value of the current fragment
 *
 * @type {ViewportDepthNode}
 */
export const viewportLinearDepth = /*@__PURE__*/ linearDepth( viewportDepthTexture() );

depth.assign = ( value ) => depthBase( value );
