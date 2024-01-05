import TempNode from '../core/TempNode.js';
import { addNodeClass } from '../core/Node.js';
import { cameraProjectionMatrix } from './CameraNode.js';
import { modelViewMatrix } from './ModelNode.js';
import { position } from '../core/PropertyNode.js';
import { positionView } from './PositionNode.js';
import { nodeProxy } from '../shadernode/ShaderNode.js';

class ModelViewProjectionNode extends TempNode {

	constructor( positionNode = position ) {

		super( 'vec4' );

		this.positionNode = positionNode;

	}

	setup() {

		let view = modelViewMatrix.mul( this.positionNode );

		if ( this.positionNode === position ) view = positionView; // caching

		return cameraProjectionMatrix.mul( view );

	}

}

export default ModelViewProjectionNode;

export const modelViewProjection = nodeProxy( ModelViewProjectionNode );

addNodeClass( 'ModelViewProjectionNode', ModelViewProjectionNode );
