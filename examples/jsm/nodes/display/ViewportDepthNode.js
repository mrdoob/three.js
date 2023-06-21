import Node, { addNodeClass } from '../core/Node.js';
import { nodeImmutable, nodeProxy } from '../shadernode/ShaderNode.js';
import { cameraNear, cameraFar } from '../accessors/CameraNode.js';
import { positionView } from '../accessors/PositionNode.js';
import { viewportDepthTexture } from './ViewportDepthTextureNode.js';

class ViewportDepthNode extends Node {

	constructor( scope, textureNode = null ) {

		super( 'float' );

		this.scope = scope;
		this.textureNode = textureNode;

		this.isViewportDepthNode = true;

	}

	construct( /*builder*/ ) {

		const { scope } = this;

		let node = null;

		if ( scope === ViewportDepthNode.DEPTH ) {

			node = viewZToOrthographicDepth( positionView.z, cameraNear, cameraFar );

		} else if ( scope === ViewportDepthNode.DEPTH_TEXTURE ) {

			const texture = this.textureNode || viewportDepthTexture();

			const viewZ = perspectiveDepthToViewZ( texture, cameraNear, cameraFar );
			node = viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );

		}

		return node;

	}

}

// NOTE: viewZ, the z-coordinate in camera space, is negative for points in front of the camera

// -near maps to 0; -far maps to 1
export const viewZToOrthographicDepth = ( viewZ, near, far ) => viewZ.add( near ).div( near.sub( far ) );

// maps orthographic depth in [ 0, 1 ] to viewZ
export const orthographicDepthToViewZ = ( depth, near, far ) => near.sub( far ).mul( depth ).sub( near );

// NOTE: https://twitter.com/gonnavis/status/1377183786949959682

// -near maps to 0; -far maps to 1
export const viewZToPerspectiveDepth = ( viewZ, near, far ) => near.add( viewZ ).mul( far ).div( near.sub( far ).mul( viewZ ) );

// maps perspective depth in [ 0, 1 ] to viewZ
export const perspectiveDepthToViewZ = ( depth, near, far ) => near.mul( far ).div( far.sub( near ).mul( depth ).sub( far ) );

ViewportDepthNode.DEPTH = 'depth';
ViewportDepthNode.DEPTH_TEXTURE = 'depthTexture';

export default ViewportDepthNode;

export const depth = nodeImmutable( ViewportDepthNode, ViewportDepthNode.DEPTH );
export const depthTexture = nodeProxy( ViewportDepthNode, ViewportDepthNode.DEPTH_TEXTURE );

addNodeClass( ViewportDepthNode );
