import Node from '../core/Node.js';
import {
	nodeObject, transformedNormalView, positionViewDirection,
	transformDirection, negate, reflect, vec3, cameraViewMatrix
} from '../shadernode/ShaderNodeBaseElements.js';

class ReflectNode extends Node {

	static VECTOR = 'vector';
	static CUBE = 'cube';

	constructor( scope = ReflectNode.CUBE ) {

		super( 'vec3' );

		this.scope = scope;

	}

	getHash( /*builder*/ ) {

		return `reflect-${this.scope}`;

	}

	construct() {

		const scope = this.scope;

		let outputNode = null;

		if ( scope === ReflectNode.VECTOR ) {

			const reflectView = reflect( negate( positionViewDirection ), transformedNormalView );
			const reflectVec = transformDirection( reflectView, cameraViewMatrix );

			outputNode = reflectVec;

		} else if ( scope === ReflectNode.CUBE ) {

			const reflectVec = nodeObject( new ReflectNode( ReflectNode.VECTOR ) );
			const cubeUV = vec3( negate( reflectVec.x ), reflectVec.yz );

			outputNode = cubeUV;

		}

		return outputNode;

	}

	serialize( data ) {

		super.serialize( data );

		data.scope = this.scope;

	}

	deserialize( data ) {

		super.deserialize( data );

		this.scope = data.scope;

	}

}

export default ReflectNode;
