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

/**
 * This node implements the vertex shader logic which is required
 * when rendering 3D objects via instancing. The code makes sure
 * vertex positions, normals and colors can be modified via instanced
 * data.
 *
 * @augments Node
 */
class InstanceNode extends Node {

	static get type() {

		return 'InstanceNode';

	}

	/**
	 * Constructs a new instance node.
	 *
	 * @param {number} count - The number of instances.
	 * @param {InstancedBufferAttribute} instanceMatrix - Instanced buffer attribute representing the instance transformations.
	 * @param {?InstancedBufferAttribute} instanceColor - Instanced buffer attribute representing the instance colors.
	 */
	constructor( count, instanceMatrix, instanceColor = null ) {

		super( 'void' );

		/**
		 * The number of instances.
		 *
		 * @type {number}
		 */
		this.count = count;

		/**
		 * Instanced buffer attribute representing the transformation of instances.
		 *
		 * @type {InstancedBufferAttribute}
		 */
		this.instanceMatrix = instanceMatrix;

		/**
		 * Instanced buffer attribute representing the color of instances.
		 *
		 * @type {InstancedBufferAttribute}
		 */
		this.instanceColor = instanceColor;

		/**
		 * The node that represents the instance matrix data.
		 *
		 * @type {?Node}
		 */
		this.instanceMatrixNode = null;

		/**
		 * The node that represents the instance color data.
		 *
		 * @type {?Node}
		 * @default null
		 */
		this.instanceColorNode = null;

		/**
		 * The update type is set to `frame` since an update
		 * of instanced buffer data must be checked per frame.
		 *
		 * @type {string}
		 * @default 'frame'
		 */
		this.updateType = NodeUpdateType.FRAME;

		/**
		 * A reference to a buffer that is used by `instanceMatrixNode`.
		 *
		 * @type {?InstancedInterleavedBuffer}
		 */
		this.buffer = null;

		/**
		 * A reference to a buffer that is used by `instanceColorNode`.
		 *
		 * @type {?InstancedBufferAttribute}
		 */
		this.bufferColor = null;

	}

	/**
	 * Setups the internal buffers and nodes and assigns the transformed vertex data
	 * to predefined node variables for accumulation. That follows the same patterns
	 * like with morph and skinning nodes.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 */
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

	/**
	 * Checks if the internal buffers required an update.
	 *
	 * @param {NodeFrame} frame - The current node frame.
	 */
	update( /*frame*/ ) {

		if ( this.instanceMatrix.usage !== DynamicDrawUsage && this.buffer !== null && this.instanceMatrix.version !== this.buffer.version ) {

			this.buffer.version = this.instanceMatrix.version;

		}

		if ( this.instanceColor && this.instanceColor.usage !== DynamicDrawUsage && this.bufferColor !== null && this.instanceColor.version !== this.bufferColor.version ) {

			this.bufferColor.version = this.instanceColor.version;

		}

	}

}

export default InstanceNode;

/**
 * TSL function for creating an instance node.
 *
 * @tsl
 * @function
 * @param {number} count - The number of instances.
 * @param {InstancedBufferAttribute} instanceMatrix - Instanced buffer attribute representing the instance transformations.
 * @param {?InstancedBufferAttribute} instanceColor - Instanced buffer attribute representing the instance colors.
 * @returns {InstanceNode}
 */
export const instance = /*@__PURE__*/ nodeProxy( InstanceNode ).setParameterLength( 2, 3 );
