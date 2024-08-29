import Node, { registerNode } from '../core/Node.js';
import { NodeUpdateType } from '../core/constants.js';
import { uniform } from '../core/UniformNode.js';
import { Fn, nodeImmutable, vec2 } from '../tsl/TSLBase.js';

import { Vector2 } from '../../math/Vector2.js';
import { Vector4 } from '../../math/Vector4.js';

let resolution, viewportResult;

class ViewportNode extends Node {

	constructor( scope ) {

		super();

		this.scope = scope;

		this.isViewportNode = true;

	}

	getNodeType() {

		if ( this.scope === ViewportNode.VIEWPORT ) return 'vec4';
		else return 'vec2';

	}

	getUpdateType() {

		let updateType = NodeUpdateType.NONE;

		if ( this.scope === ViewportNode.RESOLUTION || this.scope === ViewportNode.VIEWPORT ) {

			updateType = NodeUpdateType.RENDER;

		}

		this.updateType = updateType;

		return updateType;

	}

	update( { renderer } ) {

		if ( this.scope === ViewportNode.VIEWPORT ) {

			renderer.getViewport( viewportResult );

		} else {

			renderer.getDrawingBufferSize( resolution );

		}

	}

	setup( /*builder*/ ) {

		const scope = this.scope;

		let output = null;

		if ( scope === ViewportNode.RESOLUTION ) {

			output = uniform( resolution || ( resolution = new Vector2() ) );

		} else if ( scope === ViewportNode.VIEWPORT ) {

			output = uniform( viewportResult || ( viewportResult = new Vector4() ) );

		} else {

			output = vec2( viewportCoordinate.div( viewportResolution ) );

		}

		return output;

	}

	generate( builder ) {

		if ( this.scope === ViewportNode.COORDINATE ) {

			let coord = builder.getFragCoord();

			if ( builder.isFlipY() ) {

				// follow webgpu standards

				const resolution = builder.getNodeProperties( viewportResolution ).outputNode.build( builder );

				coord = `${ builder.getType( 'vec2' ) }( ${ coord }.x, ${ resolution }.y - ${ coord }.y )`;

			}

			return coord;

		}

		return super.generate( builder );

	}

}

ViewportNode.COORDINATE = 'coordinate';
ViewportNode.RESOLUTION = 'resolution';
ViewportNode.VIEWPORT = 'viewport';
ViewportNode.UV = 'uv';

export default ViewportNode;

ViewportNode.type = /*@__PURE__*/ registerNode( 'Viewport', ViewportNode );

export const viewportCoordinate = /*@__PURE__*/ nodeImmutable( ViewportNode, ViewportNode.COORDINATE );
export const viewportResolution = /*@__PURE__*/ nodeImmutable( ViewportNode, ViewportNode.RESOLUTION );
export const viewport = /*@__PURE__*/ nodeImmutable( ViewportNode, ViewportNode.VIEWPORT );
export const viewportUV = /*@__PURE__*/ nodeImmutable( ViewportNode, ViewportNode.UV );

export const viewportTopLeft = /*@__PURE__*/ ( Fn( () => { // @deprecated, r168

	console.warn( 'TSL.ViewportNode: "viewportTopLeft" is deprecated. Use "viewportUV" instead.' );

	return viewportUV;

}, 'vec2' ).once() )();

export const viewportBottomLeft = /*@__PURE__*/ ( Fn( () => { // @deprecated, r168

	console.warn( 'TSL.ViewportNode: "viewportBottomLeft" is deprecated. Use "viewportUV.flipY()" instead.' );

	return viewportUV.flipY();

}, 'vec2' ).once() )();
