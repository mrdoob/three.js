import Node, { addNodeClass } from '../core/Node.js';
import { bufferAttribute, dynamicBufferAttribute } from './BufferAttributeNode.js';
import { normalLocal } from './NormalNode.js';
import { positionLocal } from './PositionNode.js';
import { nodeProxy, vec3, mat3, mat4 } from '../shadernode/ShaderNode.js';
import { DynamicDrawUsage } from 'three';

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
			const instaceAttribute = instanceMesh.instanceMatrix;
			const array = instaceAttribute.array;

			const bufferFn = instaceAttribute.usage === DynamicDrawUsage ? dynamicBufferAttribute : bufferAttribute;

			const instanceBuffers = [
				// F.Signature -> bufferAttribute( array, type, stride, offset )
				bufferFn( array, 'vec4', 16, 0 ),
				bufferFn( array, 'vec4', 16, 4 ),
				bufferFn( array, 'vec4', 16, 8 ),
				bufferFn( array, 'vec4', 16, 12 )
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

		return builder.stack;

	}

}

export default InstanceNode;

export const instance = nodeProxy( InstanceNode );

addNodeClass( InstanceNode );
