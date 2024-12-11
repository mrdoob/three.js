import Node from '../core/Node.js';
import { varyingProperty } from '../core/PropertyNode.js';
import { instancedBufferAttribute, instancedDynamicBufferAttribute } from './BufferAttributeNode.js';
import { normalLocal, transformNormal } from './Normal.js';
import { positionLocal } from './Position.js';
import { nodeProxy, vec3, mat4 } from '../tsl/TSLBase.js';
import { NodeUpdateType } from '../core/constants.js';
import { buffer } from '../accessors/BufferNode.js';
import { instanceIndex } from '../core/IndexNode.js';

import { InstancedInterleavedBuffer } from '../../core/InstancedInterleavedBuffer.js';
import { InstancedBufferAttribute } from '../../core/InstancedBufferAttribute.js';
import { DynamicDrawUsage } from '../../constants.js';

class InstanceNode extends Node {

	static get type() {

		return 'InstanceNode';

	}

	constructor( count, instanceMatrix, instanceColor ) {

		super( 'void' );

		this.count = count;
		this.instanceMatrix = instanceMatrix;
		this.instanceColor = instanceColor;

		this.instanceMatrixNode = null;

		this.instanceColorNode = null;

		this.updateType = NodeUpdateType.FRAME;

		this.buffer = null;
		this.bufferColor = null;

	}

	setup( builder ) {

		const { count, instanceMatrix, instanceColor } = this;

		let { instanceMatrixNode, instanceColorNode } = this;

		if ( instanceMatrixNode === null ) {

			// Both WebGPU and WebGL backends have UBO max limited to 64kb. Matrix count number bigger than 1000 ( 16 * 4 * 1000 = 64kb ) will fallback to attribute.

			if ( count <= 1000 ) {

				instanceMatrixNode = buffer( instanceMatrix.array, 'mat4', Math.max( count, 1 ) ).element( instanceIndex );

			} else {

				const buffer = new InstancedInterleavedBuffer( instanceMatrix.array, 16, 1 );

				this.buffer = buffer;

				const bufferFn = instanceMatrix.usage === DynamicDrawUsage ? instancedDynamicBufferAttribute : instancedBufferAttribute;

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

		if ( instanceColor && instanceColorNode === null ) {

			const buffer = new InstancedBufferAttribute( instanceColor.array, 3 );

			const bufferFn = instanceColor.usage === DynamicDrawUsage ? instancedDynamicBufferAttribute : instancedBufferAttribute;

			this.bufferColor = buffer;

			instanceColorNode = vec3( bufferFn( buffer, 'vec3', 3, 0 ) );

			this.instanceColorNode = instanceColorNode;

		}

		// POSITION

		const instancePosition = instanceMatrixNode.mul( positionLocal ).xyz;
		positionLocal.assign( instancePosition );

		// NORMAL

		if ( builder.hasGeometryAttribute( 'normal' ) ) {

			const instanceNormal = transformNormal( normalLocal, instanceMatrixNode );

			// ASSIGNS

			normalLocal.assign( instanceNormal );

		}

		// COLOR

		if ( this.instanceColorNode !== null ) {

			varyingProperty( 'vec3', 'vInstanceColor' ).assign( this.instanceColorNode );

		}

	}

	update( /*frame*/ ) {

		if ( this.instanceMatrix.usage !== DynamicDrawUsage && this.buffer != null && this.instanceMatrix.version !== this.buffer.version ) {

			this.buffer.version = this.instanceMatrix.version;

		}

		if ( this.instanceColor && this.instanceColor.usage !== DynamicDrawUsage && this.bufferColor != null && this.instanceColor.version !== this.bufferColor.version ) {

			this.bufferColor.version = this.instanceColor.version;

		}

	}

}

export default InstanceNode;

export const instance = /*@__PURE__*/ nodeProxy( InstanceNode );
