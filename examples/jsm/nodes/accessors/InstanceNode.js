import Node, { addNodeClass } from '../core/Node.js';
import { varyingProperty } from '../core/PropertyNode.js';
import { instancedBufferAttribute, instancedDynamicBufferAttribute } from './BufferAttributeNode.js';
import { normalLocal } from './NormalNode.js';
import { positionLocal } from './PositionNode.js';
import { nodeProxy, vec3, mat3, mat4 } from '../shadernode/ShaderNode.js';
import { DynamicDrawUsage, InstancedInterleavedBuffer, InstancedBufferAttribute } from 'three';
import { NodeUpdateType } from '../core/constants.js';
import { buffer } from '../accessors/BufferNode.js';
import { instanceIndex } from '../core/IndexNode.js';

class InstanceNode extends Node {

	constructor( instanceMesh ) {

		super( 'void' );

		this.instanceMesh = instanceMesh;

		this.instanceMatrixNode = null;

		this.instanceColorNode = null;

		this.updateType = NodeUpdateType.FRAME;

		this.buffer = null;
		this.bufferColor = null;

	}

	setup( /*builder*/ ) {

		let instanceMatrixNode = this.instanceMatrixNode;
		let instanceColorNode = this.instanceColorNode;

		const instanceMesh = this.instanceMesh;

		if ( instanceMatrixNode === null ) {

			const instanceAttribute = instanceMesh.instanceMatrix;

			// Compatilbe with WebGL backend, WebGL2 limits UBO to 64kb. Matrix count number bigger than 1000 ( 16 * 4 * 1000 = 64kb ) will fallback to attribute.
			if ( instanceMesh.count <= 1000 ) {

				instanceMatrixNode = buffer( instanceAttribute.array, 'mat4', instanceMesh.count ).element( instanceIndex );

			} else {

				const buffer = new InstancedInterleavedBuffer( instanceAttribute.array, 16, 1 );

				this.buffer = buffer;
				const bufferFn = instanceAttribute.usage === DynamicDrawUsage ? instancedDynamicBufferAttribute : instancedBufferAttribute;

				const instanceBuffers = [
					// F.Signature -> bufferAttribute( array, type, stride, offset )
					bufferFn( buffer, 'vec4', 16, 0 ),
					bufferFn( buffer, 'vec4', 16, 4 ),
					bufferFn( buffer, 'vec4', 16, 8 ),
					bufferFn( buffer, 'vec4', 16, 12 )
				];

				instanceMatrixNode = mat4( ...instanceBuffers );

			}

			this.instanceMatrixNode = instanceMatrixNode;

		}

		const instanceColorAttribute = instanceMesh.instanceColor;

		if ( instanceColorAttribute && instanceColorNode === null ) {

			// Compatilbe with WebGL backend, WebGL2 limits UBO to 64kb. Color count number bigger than 5333 ( 3 * 4 * 5333 < 64kb ) will fallback to attribute.
			if ( instanceMesh.count < 5333 ) {

				instanceColorNode = buffer( instanceColorAttribute.array, 'vec3', instanceMesh.count ).element( instanceIndex );

			} else {

				const buffer = new InstancedBufferAttribute( instanceColorAttribute.array, 3 );
				const bufferFn = instanceColorAttribute.usage === DynamicDrawUsage ? instancedDynamicBufferAttribute : instancedBufferAttribute;

				this.bufferColor = buffer;

				instanceColorNode = vec3( bufferFn( buffer, 'vec3', 3, 0 ) );

			}

			this.instanceColorNode = instanceColorNode;

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

	update( /*frame*/ ) {

		if ( this.instanceMesh.instanceMatrix.usage !== DynamicDrawUsage && this.buffer != null && this.instanceMesh.instanceMatrix.version !== this.buffer.version ) {

			this.buffer.version = this.instanceMesh.instanceMatrix.version;

		}

		if ( this.instanceMesh.instanceColor && this.instanceMesh.instanceColor.usage !== DynamicDrawUsage && this.bufferColor != null && this.instanceMesh.instanceColor.version !== this.bufferColor.version ) {

			this.bufferColor.version = this.instanceMesh.instanceColor.version;

		}

	}

}

export default InstanceNode;

export const instance = nodeProxy( InstanceNode );

addNodeClass( 'InstanceNode', InstanceNode );
