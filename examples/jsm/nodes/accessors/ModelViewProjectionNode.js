import Node, { addNodeClass } from '../core/Node.js';
import { cameraProjectionMatrix } from './CameraNode.js';
import { modelViewMatrix } from './ModelNode.js';
import { positionLocal } from './PositionNode.js';
import { nodeProxy } from '../shadernode/ShaderNode.js';

class ModelViewProjectionNode extends Node {

	constructor( position = positionLocal ) {

		super( 'vec4' );

		this.position = position;

	}

	generate( builder ) {

		const position = this.position;

		const mvpMatrix = cameraProjectionMatrix.mul( modelViewMatrix );
		const mvpNode = mvpMatrix.mul( position );

		return mvpNode.build( builder );

	}

}

export default ModelViewProjectionNode;

export const modelViewProjection = nodeProxy( ModelViewProjectionNode );

addNodeClass( ModelViewProjectionNode );
