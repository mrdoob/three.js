import Node from '../core/Node.js';
import {
	transformedNormalView, positionViewDirection, cameraViewMatrix
} from '../shadernode/ShaderNodeBaseElements.js';

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
