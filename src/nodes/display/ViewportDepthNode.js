import Node from '../core/Node.js';
import { log2, nodeImmutable, nodeProxy } from '../tsl/TSLBase.js';
import { cameraNear, cameraFar } from '../accessors/Camera.js';
import { positionView } from '../accessors/Position.js';
import { viewportDepthTexture } from './ViewportDepthTextureNode.js';

class ViewportDepthNode extends Node {

	static get type() {

		return 'ViewportDepthNode';

	}

	constructor( scope, valueNode = null ) {

		super( 'float' );

		this.scope = scope;
		this.valueNode = valueNode;

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

// -near maps to 0; -far maps to 1
export const viewZToOrthographicDepth = ( viewZ, near, far ) => viewZ.add( near ).div( near.sub( far ) );

// maps orthographic depth in [ 0, 1 ] to viewZ
export const orthographicDepthToViewZ = ( depth, near, far ) => near.sub( far ).mul( depth ).sub( near );

// NOTE: https://twitter.com/gonnavis/status/1377183786949959682

// -near maps to 0; -far maps to 1
export const viewZToPerspectiveDepth = ( viewZ, near, far ) => near.add( viewZ ).mul( far ).div( far.sub( near ).mul( viewZ ) );

// maps perspective depth in [ 0, 1 ] to viewZ
export const perspectiveDepthToViewZ = ( depth, near, far ) => near.mul( far ).div( far.sub( near ).mul( depth ).sub( far ) );

export const perspectiveDepthToLogarithmicDepth = ( perspectiveW, near, far ) => {

	// The final logarithmic depth formula used here is adapted from one described in an article
	// by Thatcher Ulrich (see http://tulrich.com/geekstuff/log_depth_buffer.txt), which was an
	// improvement upon an earlier formula one described in an
	// Outerra article (https://outerra.blogspot.com/2009/08/logarithmic-z-buffer.html).
	// The Outerra article ignored the camera near plane (it always assumed it was 0) and instead
	// opted for a "C-constant" for resolution adjustment of objects near the camera.
	// Outerra states this about their own formula: "Notice that the 'C' variant doesn’t use a near
	// plane distance, it has it set at 0." (quote from https://outerra.blogspot.com/2012/11/maximizing-depth-buffer-range-and.html)
	// It was debated here whether Outerra's "C-constant" version or Ulrich's "near plane" version should
	// be used, and ultimately Ulrich's "near plane" version was chosen for simplicity, since no "C-constant"
	// needs to be worried about.
	// Outerra eventually made another improvement to their original "C-constant" formula, but it still
	// does not incorporate the camera near plane (for this version,
	// see https://outerra.blogspot.com/2013/07/logarithmic-depth-buffer-optimizations.html).
	near = near.max( 1e-6 ); // <-- clamp so we don't divide by 0
	const numerator = log2( perspectiveW.div( near ) );
	const denominator = log2( far.div( near ) );
	// The only modification we make to Ulrich's formula is
	// adding 1 to the final depth value and dividing by 2.
	return numerator.div( denominator ).add( 1 ).div( 2 );

};

const depthBase = /*@__PURE__*/ nodeProxy( ViewportDepthNode, ViewportDepthNode.DEPTH_BASE );

export const depth = /*@__PURE__*/ nodeImmutable( ViewportDepthNode, ViewportDepthNode.DEPTH );
export const linearDepth = /*@__PURE__*/ nodeProxy( ViewportDepthNode, ViewportDepthNode.LINEAR_DEPTH );
export const viewportLinearDepth = /*@__PURE__*/ linearDepth( viewportDepthTexture() );

depth.assign = ( value ) => depthBase( value );
