import Node, { addNodeClass } from '../core/Node.js';
import { instancedBufferAttribute, instancedDynamicBufferAttribute } from './BufferAttributeNode.js';
import { normalLocal } from './NormalNode.js';
import { positionLocal } from './PositionNode.js';
import { nodeProxy, vec3, mat3, mat4 } from '../shadernode/ShaderNode.js';
import { DynamicDrawUsage, InstancedInterleavedBuffer } from 'three';

class InstanceNode extends Node {

	constructor( instanceMesh ) {

		super( 'void' );

		this.instanceMesh = instanceMesh;

		this.instanceMatrixNode = null;

	}

	construct( builder ) {

		let instanceMatrixNode = this.instanceMatrixNode;

		if ( instanceMatrixNode === null ) {

			const instanceMesh = this.instanceMesh;
			const instanceAttribute = instanceMesh.instanceMatrix;
			const buffer = new InstancedInterleavedBuffer( instanceAttribute.array, 16, 1 );

			const bufferFn = instanceAttribute.usage === DynamicDrawUsage ? instancedDynamicBufferAttribute : instancedBufferAttribute;

			const instanceBuffers = [
				// F.Signature -> bufferAttribute( array, type, stride, offset )
				bufferFn( buffer, 'vec4', 16, 0 ),
				bufferFn( buffer, 'vec4', 16, 4 ),
				bufferFn( buffer, 'vec4', 16, 8 ),
				bufferFn( buffer, 'vec4', 16, 12 )
			];

			instanceMatrixNode = mat4( ...instanceBuffers );

			this.instanceMatrixNode = instanceMatrixNode;

		}

		// POSITION

		const instancePosition = instanceMatrixNode.mul( positionLocal ).xyz;

		// NORMAL

		const m = mat3( instanceMatrixNode[ 0 ].xyz, instanceMatrixNode[ 1 ].xyz, instanceMatrixNode[ 2 ].xyz );

		const transformedNormal = normalLocal.div( vec3( m[ 0 ].dot( m[ 0 ] ), m[ 1 ].dot( m[ 1 ] ), m[ 2 ].dot( m[ 2 ] ) ) );

		const instanceNormal = m.mul( transformedNormal ).xyz;

		// ASSIGNS

		builder.stack.assign( positionLocal, instancePosition );
		builder.stack.assign( normalLocal, instanceNormal );

	}

}

export default InstanceNode;

export const instance = nodeProxy( InstanceNode );

addNodeClass( InstanceNode );
