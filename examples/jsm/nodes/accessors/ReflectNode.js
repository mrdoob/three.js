import Node from '../core/Node.js';
import {
	nodeObject, transformedNormalView, positionViewDirection,
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

		const scope = this.scope;

		const reflectView = reflect( negate( positionViewDirection ), transformedNormalView );
		const reflectVec = transformDirection( reflectView, cameraViewMatrix );

		return reflectVec;

	}

}

export default ReflectNode;
