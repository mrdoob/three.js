import Node, { registerNode } from '../core/Node.js';
import { nodeImmutable, nodeProxy } from '../tsl/TSLBase.js';
import { cameraNear, cameraFar } from '../accessors/Camera.js';
import { positionView } from '../accessors/Position.js';
import { viewportDepthTexture } from './ViewportDepthTextureNode.js';

class ViewportDepthNode extends Node {

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

ViewportDepthNode.type = /*@__PURE__*/ registerNode( 'ViewportDepth', ViewportDepthNode );

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

const depthBase = /*@__PURE__*/ nodeProxy( ViewportDepthNode, ViewportDepthNode.DEPTH_BASE );

export const depth = /*@__PURE__*/ nodeImmutable( ViewportDepthNode, ViewportDepthNode.DEPTH );
export const linearDepth = /*@__PURE__*/ nodeProxy( ViewportDepthNode, ViewportDepthNode.LINEAR_DEPTH );
export const viewportLinearDepth = /*@__PURE__*/ linearDepth( viewportDepthTexture() );

depth.assign = ( value ) => depthBase( value );
