import Node, { registerNode } from '../core/Node.js';
import { varyingProperty } from '../core/PropertyNode.js';
import { instancedBufferAttribute, instancedDynamicBufferAttribute } from './BufferAttributeNode.js';
import { normalLocal } from './Normal.js';
import { positionLocal } from './Position.js';
import { nodeProxy, vec3, mat3, mat4 } from '../tsl/TSLBase.js';
import { NodeUpdateType } from '../core/constants.js';
import { buffer } from '../accessors/BufferNode.js';
import { instanceIndex } from '../core/IndexNode.js';

import { InstancedInterleavedBuffer } from '../../core/InstancedInterleavedBuffer.js';
import { InstancedBufferAttribute } from '../../core/InstancedBufferAttribute.js';
import { DynamicDrawUsage } from '../../constants.js';

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

	setup( builder ) {

		let instanceMatrixNode = this.instanceMatrixNode;
		let instanceColorNode = this.instanceColorNode;

		const instanceMesh = this.instanceMesh;

		if ( instanceMatrixNode === null ) {

			const instanceAttribute = instanceMesh.instanceMatrix;

			// Both WebGPU and WebGL backends have UBO max limited to 64kb. Matrix count number bigger than 1000 ( 16 * 4 * 1000 = 64kb ) will fallback to attribute.

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

			const buffer = new InstancedBufferAttribute( instanceColorAttribute.array, 3 );

			const bufferFn = instanceColorAttribute.usage === DynamicDrawUsage ? instancedDynamicBufferAttribute : instancedBufferAttribute;

			this.bufferColor = buffer;

			instanceColorNode = vec3( bufferFn( buffer, 'vec3', 3, 0 ) );

			this.instanceColorNode = instanceColorNode;

		}

		// POSITION

		const instancePosition = instanceMatrixNode.mul( positionLocal ).xyz;
		positionLocal.assign( instancePosition );

		// NORMAL

		if ( builder.hasGeometryAttribute( 'normal' ) ) {

			const m = mat3( instanceMatrixNode );

			const transformedNormal = normalLocal.div( vec3( m[ 0 ].dot( m[ 0 ] ), m[ 1 ].dot( m[ 1 ] ), m[ 2 ].dot( m[ 2 ] ) ) );

			const instanceNormal = m.mul( transformedNormal ).xyz;

			// ASSIGNS

			normalLocal.assign( instanceNormal );

		}

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

InstanceNode.type = /*@__PURE__*/ registerNode( 'Instance', InstanceNode );

export const instance = /*@__PURE__*/ nodeProxy( InstanceNode );
