import Node, { addNodeClass } from '../core/Node.js';
import { bufferAttribute } from './BufferAttributeNode.js';
import { normalLocal } from './NormalNode.js';
import { positionLocal } from './PositionNode.js';
import { nodeProxy, vec3, mat3, mat4 } from '../shadernode/ShaderNode.js';

class InstanceNode extends Node {

	constructor( instanceMesh ) {

		super( 'void' );

		this.instanceMesh = instanceMesh;

		//

		const instanceBuffers = [
			// F.Signature -> bufferAttribute( array, type, stride, offset )
			bufferAttribute( instanceMesh.instanceMatrix.array, 'vec4', 16, 0 ),
			bufferAttribute( instanceMesh.instanceMatrix.array, 'vec4', 16, 4 ),
			bufferAttribute( instanceMesh.instanceMatrix.array, 'vec4', 16, 8 ),
			bufferAttribute( instanceMesh.instanceMatrix.array, 'vec4', 16, 12 )
		];

		this.instanceMatrixNode = mat4( ...instanceBuffers );

	}

	construct( builder ) {

		const { instanceMatrixNode } = this;

		// POSITION

		const instancePosition = instanceMatrixNode.mul( positionLocal ).xyz;

		// NORMAL

		const m = mat3( instanceMatrixNode[ 0 ].xyz, instanceMatrixNode[ 1 ].xyz, instanceMatrixNode[ 2 ].xyz );

		const transformedNormal = normalLocal.div( vec3( m[ 0 ].dot( m[ 0 ] ), m[ 1 ].dot( m[ 1 ] ), m[ 2 ].dot( m[ 2 ] ) ) );

		const instanceNormal = m.mul( transformedNormal ).xyz;

		// ASSIGNS

		builder.stack.assign( positionLocal, instancePosition );
		builder.stack.assign( normalLocal, instanceNormal );

		return builder.stack;

	}

}

export default InstanceNode;

export const instance = nodeProxy( InstanceNode );

addNodeClass( InstanceNode );
