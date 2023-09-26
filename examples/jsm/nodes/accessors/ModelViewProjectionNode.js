import { addNodeClass } from '../core/Node.js';
import TempNode from '../core/TempNode.js';
import { cameraProjectionMatrix } from './CameraNode.js';
import { modelViewMatrix } from './ModelNode.js';
import { positionLocal } from './PositionNode.js';
import { nodeProxy } from '../shadernode/ShaderNode.js';

class ModelViewProjectionNode extends TempNode {

	constructor( positionNode = positionLocal ) {

		super( 'vec4' );

		this.positionNode = positionNode;

	}

	setup() {

		return cameraProjectionMatrix.mul( modelViewMatrix ).mul( this.positionNode );

	}

}

export default ModelViewProjectionNode;

export const modelViewProjection = nodeProxy( ModelViewProjectionNode );

addNodeClass( 'ModelViewProjectionNode', ModelViewProjectionNode );
