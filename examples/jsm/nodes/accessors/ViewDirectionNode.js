import Node, { addNodeClass } from '../core/Node.js';
import { positionLocal, positionWorld } from './PositionNode.js';
import { cameraPosition } from './CameraNode.js';
import { nodeProxy } from '../shadernode/ShaderNode.js';

class ViewDirectionNode extends Node {

	constructor( positionNode ) {

		super( 'vec3' );

		this.positionNode = positionNode;

	}

	setup() {

		return this.positionNode.sub( cameraPosition ).normalize();

	}

}

export default ViewDirectionNode;

export const viewDirection = nodeProxy( ViewDirectionNode );
export const viewDirectionLocal = viewDirection( positionLocal );
export const viewDirectionWorld = viewDirection( positionWorld );

addNodeClass( 'ViewDirectionNode', ViewDirectionNode );
