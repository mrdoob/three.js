import Node, { addNodeClass } from '../core/Node.js';
import { NodeUpdateType } from '../core/constants.js';
import { uniform } from '../core/UniformNode.js';
import { nodeImmutable, vec2 } from '../shadernode/ShaderNode.js';

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
		else if ( this.scope === ViewportNode.COORDINATE ) return 'vec3';
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

			output = viewportCoordinate.div( viewportResolution );

			let outX = output.x;
			let outY = output.y;

			if ( /bottom/i.test( scope ) ) outY = outY.oneMinus();
			if ( /right/i.test( scope ) ) outX = outX.oneMinus();

			output = vec2( outX, outY );

		}

		return output;

	}

	generate( builder ) {

		if ( this.scope === ViewportNode.COORDINATE ) {

			let coord = builder.getFragCoord();

			if ( builder.isFlipY() ) {

				// follow webgpu standards

				const resolution = builder.getNodeProperties( viewportResolution ).outputNode.build( builder );

				coord = `${ builder.getType( 'vec3' ) }( ${ coord }.x, ${ resolution }.y - ${ coord }.y, ${ coord }.z )`;

			}

			return coord;

		}

		return super.generate( builder );

	}

}

ViewportNode.COORDINATE = 'coordinate';
ViewportNode.RESOLUTION = 'resolution';
ViewportNode.VIEWPORT = 'viewport';
ViewportNode.TOP_LEFT = 'topLeft';
ViewportNode.BOTTOM_LEFT = 'bottomLeft';
ViewportNode.TOP_RIGHT = 'topRight';
ViewportNode.BOTTOM_RIGHT = 'bottomRight';

export default ViewportNode;

export const viewportCoordinate = nodeImmutable( ViewportNode, ViewportNode.COORDINATE );
export const viewportResolution = nodeImmutable( ViewportNode, ViewportNode.RESOLUTION );
export const viewport = nodeImmutable( ViewportNode, ViewportNode.VIEWPORT );
export const viewportTopLeft = nodeImmutable( ViewportNode, ViewportNode.TOP_LEFT );
export const viewportBottomLeft = nodeImmutable( ViewportNode, ViewportNode.BOTTOM_LEFT );
export const viewportTopRight = nodeImmutable( ViewportNode, ViewportNode.TOP_RIGHT );
export const viewportBottomRight = nodeImmutable( ViewportNode, ViewportNode.BOTTOM_RIGHT );

addNodeClass( 'ViewportNode', ViewportNode );
