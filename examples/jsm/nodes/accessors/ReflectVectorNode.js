import Node, { addNodeClass } from '../core/Node.js';
import { cameraViewMatrix } from './CameraNode.js';
import { transformedNormalView } from './NormalNode.js';
import { positionViewDirection } from './PositionNode.js';
import { nodeImmutable } from '../shadernode/ShaderNode.js';

class ReflectVectorNode extends Node {

	constructor() {

		super( 'vec3' );

	}

	getHash( /*builder*/ ) {

		return 'reflectVector';

	}

	construct() {

		const reflectView = positionViewDirection.negate().reflect( transformedNormalView );

		return reflectView.transformDirection( cameraViewMatrix );

	}

}

export default ReflectVectorNode;

export const reflectVector = nodeImmutable( ReflectVectorNode );

addNodeClass( ReflectVectorNode );
