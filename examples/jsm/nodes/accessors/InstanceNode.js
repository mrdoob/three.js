import Node from '../core/Node.js';
import {
	vec3,
	mat3,
	mul,
	assign,
	buffer,
	element,
	dot,
	div,
	temp,
	instanceIndex,
	positionLocal,
	normalLocal
} from '../shadernode/ShaderNodeElements.js';

class InstanceNode extends Node {

	constructor( instanceMesh ) {

		super( 'void' );

		this.instanceMesh = instanceMesh;

		//

		const instanceBufferNode = buffer( instanceMesh.instanceMatrix.array, 'mat4', instanceMesh.count );

		this.instanceMatrixNode = temp( element( instanceBufferNode, instanceIndex ) );

	}

	generate( builder ) {

		const { instanceMatrixNode } = this;

		// POSITION

		const instancePosition = mul( instanceMatrixNode, positionLocal ).xyz;

		// NORMAL

		const m = mat3( instanceMatrixNode[ 0 ].xyz, instanceMatrixNode[ 1 ].xyz, instanceMatrixNode[ 2 ].xyz );

		const transformedNormal = div( normalLocal, vec3( dot( m[ 0 ], m[ 0 ] ), dot( m[ 1 ], m[ 1 ] ), dot( m[ 2 ], m[ 2 ] ) ) );

		const instanceNormal = mul( m, transformedNormal ).xyz;

		// ASSIGNS

		assign( positionLocal, instancePosition ).build( builder );
		assign( normalLocal, instanceNormal ).build( builder );

	}

}

export default InstanceNode;
