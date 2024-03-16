import Node, { addNodeClass } from '../core/Node.js';
import { varyingProperty } from '../core/PropertyNode.js';
import { instancedBufferAttribute, instancedDynamicBufferAttribute } from './BufferAttributeNode.js';
import { normalLocal } from './NormalNode.js';
import { positionLocal } from './PositionNode.js';
import { nodeProxy, vec3, mat3, mat4 } from '../shadernode/ShaderNode.js';
import { DynamicDrawUsage, InstancedInterleavedBuffer, InstancedBufferAttribute } from 'three';

class InstanceNode extends Node {

	constructor( instanceMesh ) {

		super( 'void' );

		this.instanceMesh = instanceMesh;

		this.instanceMatrixNode = null;

		this.instanceColorNode = null;

	}

	setup( /*builder*/ ) {

		let instanceMatrixNode = this.instanceMatrixNode;

		const instanceMesh = this.instanceMesh;

		if ( instanceMatrixNode === null ) {

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

		const instanceColorAttribute = instanceMesh.instanceColor;

		if ( instanceColorAttribute && this.instanceColorNode === null ) {

			const buffer = new InstancedBufferAttribute( instanceColorAttribute.array, 3 );
			const bufferFn = instanceColorAttribute.usage === DynamicDrawUsage ? instancedDynamicBufferAttribute : instancedBufferAttribute;

			this.instanceColorNode = vec3( bufferFn( buffer, 'vec3', 3, 0 ) );

		}

		// POSITION

		const instancePosition = instanceMatrixNode.mul( positionLocal ).xyz;

		// NORMAL

		const m = mat3( instanceMatrixNode[ 0 ].xyz, instanceMatrixNode[ 1 ].xyz, instanceMatrixNode[ 2 ].xyz );

		const transformedNormal = normalLocal.div( vec3( m[ 0 ].dot( m[ 0 ] ), m[ 1 ].dot( m[ 1 ] ), m[ 2 ].dot( m[ 2 ] ) ) );

		const instanceNormal = m.mul( transformedNormal ).xyz;

		// ASSIGNS

		positionLocal.assign( instancePosition );
		normalLocal.assign( instanceNormal );

		// COLOR

		if ( this.instanceColorNode !== null ) {

			varyingProperty( 'vec3', 'vInstanceColor' ).assign( this.instanceColorNode );

		}

	}

}

export default InstanceNode;

export const instance = nodeProxy( InstanceNode );

addNodeClass( 'InstanceNode', InstanceNode );
