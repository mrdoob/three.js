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

	generate( builder ) {

		const scope = this.scope;

		if ( scope === ReflectNode.VECTOR ) {

			const reflectView = reflect( negate( positionViewDirection ), transformedNormalView );
			const reflectVec = transformDirection( reflectView, cameraViewMatrix );

			return reflectVec.build( builder );

		} else if ( scope === ReflectNode.CUBE ) {

			const reflectVec = nodeObject( new ReflectNode( ReflectNode.VECTOR ) );
			const cubeUV = vec3( negate( reflectVec.x ), reflectVec.yz );

			return cubeUV.build( builder );

		}

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
