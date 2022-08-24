import Node from '../core/Node.js';
import {
	transformedNormalView, positionViewDirection,
	transformDirection, negate, reflect, cameraViewMatrix
} from '../shadernode/ShaderNodeBaseElements.js';

class ReflectVectorNode extends Node {

	constructor() {

		super( 'vec3' );

	}

	getHash( /*builder*/ ) {

		return 'reflectVector';

	}

	construct() {

		const reflectView = reflect( negate( positionViewDirection ), transformedNormalView );

		return transformDirection( reflectView, cameraViewMatrix );

	}

}

export default ReflectVectorNode;
