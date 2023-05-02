import Object3DNode from './Object3DNode.js';
import { addNodeClass } from '../core/Node.js';
import { nodeImmutable } from '../shadernode/ShaderNode.js';

class ModelNode extends Object3DNode {

	constructor( scope = ModelNode.VIEW_MATRIX ) {

		super( scope );

	}

	update( frame ) {

		this.object3d = frame.object;

		super.update( frame );

	}

}

export default ModelNode;

export const modelDirection = nodeImmutable( ModelNode, ModelNode.DIRECTION );
export const modelViewMatrix = nodeImmutable( ModelNode, ModelNode.VIEW_MATRIX );
export const modelNormalMatrix = nodeImmutable( ModelNode, ModelNode.NORMAL_MATRIX );
export const modelWorldMatrix = nodeImmutable( ModelNode, ModelNode.WORLD_MATRIX );
export const modelPosition = nodeImmutable( ModelNode, ModelNode.POSITION );
export const modelViewPosition = nodeImmutable( ModelNode, ModelNode.VIEW_POSITION );

addNodeClass( ModelNode );
