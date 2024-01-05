import TempNode from '../core/TempNode.js';
import { addNodeClass } from '../core/Node.js';
import { NodeUpdateType } from '../core/constants.js';
import { uniform } from '../core/UniformNode.js';
import { nodeImmutable, vec2 } from '../shadernode/ShaderNode.js';

import { Vector2, Vector4 } from 'three';

let resolution, viewportResult;

class ViewportNode extends TempNode {

	constructor( scope ) {

		super();

		this.scope = scope;

		this.isViewportNode = true;

	}

	getNodeType() {

		return this.scope === ViewportNode.COORDINATE || this.scope === ViewportNode.VIEWPORT ? 'vec4' : 'vec2';

	}

	getUpdateType() {

		let updateType = NodeUpdateType.NONE;

		if ( this.scope === ViewportNode.RESOLUTION || this.scope === ViewportNode.VIEWPORT ) {

			updateType = NodeUpdateType.FRAME;

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

	setup( builder ) {

		const scope = this.scope;

		if ( scope === ViewportNode.COORDINATE ) return;

		let output = null;

		if ( scope === ViewportNode.RESOLUTION ) {

			output = uniform( resolution || ( resolution = new Vector2() ) );

		} else if ( scope === ViewportNode.VIEWPORT ) {

			output = uniform( viewportResult || ( viewportResult = new Vector4() ) );

		} else {

			output = vec2( viewportCoordinate ).div( viewportResolution );

			if ( /right/i.test( scope ) === true ) output.x = output.x.oneMinus();
			if ( /top/i.test( scope ) === builder.isFlipY() ) output.y = output.y.oneMinus();

		}

		return output;

	}

	generate( builder ) {

		if ( this.scope === ViewportNode.COORDINATE ) {

			return builder.getFragCoord();

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
