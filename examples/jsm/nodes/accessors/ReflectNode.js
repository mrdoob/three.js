import Node from '../core/Node.js';
import { nodeObject, normalWorld, positionWorld, cameraPosition, sub, normalize, join, negate, reflect } from '../ShaderNode.js';

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

			const cameraToFrag = normalize( sub( positionWorld, cameraPosition ) );
			const reflectVec = reflect( cameraToFrag, normalWorld );

			return reflectVec.build( builder );

		} else if ( scope === ReflectNode.CUBE ) {

			const reflectVec = nodeObject( new ReflectNode( ReflectNode.VECTOR ) );
			const cubeUV = join( negate( reflectVec.x ), reflectVec.yz );

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
