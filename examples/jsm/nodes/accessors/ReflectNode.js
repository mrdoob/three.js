import Node from '../core/Node.js';
import {
	transformedNormalView, positionViewDirection,
	transformDirection, negate, reflect, cameraViewMatrix
} from '../shadernode/ShaderNodeBaseElements.js';

class ReflectNode extends Node {

	constructor() {

		super( 'vec3' );

	}

	getHash( /*builder*/ ) {

		return `reflect-${this.scope}`;

	}

	construct() {

		const reflectView = reflect( negate( positionViewDirection ), transformedNormalView );

		return transformDirection( reflectView, cameraViewMatrix );

	}

}

export default ReflectNode;
