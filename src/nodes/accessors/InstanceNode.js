import Node from '../core/Node.js';
import { varyingProperty } from '../core/PropertyNode.js';
import { instancedBufferAttribute, instancedDynamicBufferAttribute } from './BufferAttributeNode.js';
import { normalLocal, transformNormal } from './Normal.js';
import { positionLocal, positionPrevious } from './Position.js';
import { nodeProxy, vec3, mat4 } from '../tsl/TSLBase.js';
import { NodeUpdateType } from '../core/constants.js';
import { buffer } from '../accessors/BufferNode.js';
import { storage } from './StorageBufferNode.js';
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
	 * @param {InstancedBufferAttribute|StorageInstancedBufferAttribute} instanceMatrix - Instanced buffer attribute representing the instance transformations.
	 * @param {?InstancedBufferAttribute|StorageInstancedBufferAttribute} instanceColor - Instanced buffer attribute representing the instance colors.
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

		/**
		 * The previous instance matrices. Required for computing motion vectors.
		 *
		 * @type {?Node}
		 * @default null
		 */
		this.previousInstanceMatrixNode = null;

	}

	/**
	 * Tracks whether the matrix data is provided via a storage buffer.
	 *
	 * @type {boolean}
	 */
	get isStorageMatrix() {

		const { instanceMatrix } = this;

		return instanceMatrix && instanceMatrix.isStorageInstancedBufferAttribute === true;

	}

	/**
	 * Tracks whether the color data is provided via a storage buffer.
	 *
	 * @type {boolean}
	 */
	get isStorageColor() {

		const { instanceColor } = this;

		return instanceColor && instanceColor.isStorageInstancedBufferAttribute === true;

	}

	/**
	 * Setups the internal buffers and nodes and assigns the transformed vertex data
	 * to predefined node variables for accumulation. That follows the same patterns
	 * like with morph and skinning nodes.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 */
	setup( builder ) {

		let { instanceMatrixNode, instanceColorNode } = this;

		// instance matrix

		if ( instanceMatrixNode === null ) {

			instanceMatrixNode = this._createInstanceMatrixNode( true, builder );

			this.instanceMatrixNode = instanceMatrixNode;

		}

		// instance color

		const { instanceColor, isStorageColor } = this;

		if ( instanceColor && instanceColorNode === null ) {

			if ( isStorageColor ) {

				instanceColorNode = storage( instanceColor, 'vec3', Math.max( instanceColor.count, 1 ) ).element( instanceIndex );

			} else {

				const bufferAttribute = new InstancedBufferAttribute( instanceColor.array, 3 );

				const bufferFn = instanceColor.usage === DynamicDrawUsage ? instancedDynamicBufferAttribute : instancedBufferAttribute;

				this.bufferColor = bufferAttribute;

				instanceColorNode = vec3( bufferFn( bufferAttribute, 'vec3', 3, 0 ) );

			}

			this.instanceColorNode = instanceColorNode;

		}

		// POSITION

		const instancePosition = instanceMatrixNode.mul( positionLocal ).xyz;
		positionLocal.assign( instancePosition );

		if ( builder.needsPreviousData() ) {

			positionPrevious.assign( this.getPreviousInstancedPosition( builder ) );

		}

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
	 * Checks if the internal buffers require an update.
	 *
	 * @param {NodeFrame} frame - The current node frame.
	 */
	update( frame ) {

		if ( this.buffer !== null && this.isStorageMatrix !== true ) {

			this.buffer.clearUpdateRanges();
			this.buffer.updateRanges.push( ... this.instanceMatrix.updateRanges );

			// update version if necessary

			if ( this.instanceMatrix.version !== this.buffer.version ) {

				this.buffer.version = this.instanceMatrix.version;

			}

		}

		if ( this.instanceColor && this.bufferColor !== null && this.isStorageColor !== true ) {

			this.bufferColor.clearUpdateRanges();
			this.bufferColor.updateRanges.push( ... this.instanceColor.updateRanges );

			if ( this.instanceColor.version !== this.bufferColor.version ) {

				this.bufferColor.version = this.instanceColor.version;

			}

		}

		if ( this.previousInstanceMatrixNode !== null ) {

			frame.object.previousInstanceMatrix.array.set( this.instanceMatrix.array );

		}

	}

	/**
	 * Computes the transformed/instanced vertex position of the previous frame.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {Node<vec3>} The instanced position from the previous frame.
	 */
	getPreviousInstancedPosition( builder ) {

		const instancedMesh = builder.object;

		if ( this.previousInstanceMatrixNode === null ) {

			instancedMesh.previousInstanceMatrix = this.instanceMatrix.clone();

			this.previousInstanceMatrixNode = this._createInstanceMatrixNode( false, builder );

		}

		return this.previousInstanceMatrixNode.mul( positionPrevious ).xyz;

	}

	/**
	 * Creates a node representing the instance matrix data.
	 *
	 * @private
	 * @param {boolean} assignBuffer - Whether the created interleaved buffer should be assigned to the `buffer` member or not.
	 * @param {NodeBuilder} builder - A reference to the current node builder.
	 * @return {Node} The instance matrix node.
	 */
	_createInstanceMatrixNode( assignBuffer, builder ) {

		let instanceMatrixNode;

		const { instanceMatrix } = this;
		const { count } = instanceMatrix;

		if ( this.isStorageMatrix ) {

			instanceMatrixNode = storage( instanceMatrix, 'mat4', Math.max( count, 1 ) ).element( instanceIndex );

		} else {

			const uniformBufferSize = count * 16 * 4; // count * 16 components * 4 bytes (float)

			if ( uniformBufferSize <= builder.getUniformBufferLimit() ) {

				instanceMatrixNode = buffer( instanceMatrix.array, 'mat4', Math.max( count, 1 ) ).element( instanceIndex );

			} else {

				const interleaved = new InstancedInterleavedBuffer( instanceMatrix.array, 16, 1 );

				if ( assignBuffer === true ) this.buffer = interleaved;

				const bufferFn = instanceMatrix.usage === DynamicDrawUsage ? instancedDynamicBufferAttribute : instancedBufferAttribute;

				const instanceBuffers = [
					bufferFn( interleaved, 'vec4', 16, 0 ),
					bufferFn( interleaved, 'vec4', 16, 4 ),
					bufferFn( interleaved, 'vec4', 16, 8 ),
					bufferFn( interleaved, 'vec4', 16, 12 )
				];

				instanceMatrixNode = mat4( ...instanceBuffers );

			}

		}

		return instanceMatrixNode;

	}

}

export default InstanceNode;

/**
 * TSL function for creating an instance node.
 *
 * @tsl
 * @function
 * @param {number} count - The number of instances.
 * @param {InstancedBufferAttribute|StorageInstancedBufferAttribute} instanceMatrix - Instanced buffer attribute representing the instance transformations.
 * @param {?InstancedBufferAttribute|StorageInstancedBufferAttribute} instanceColor - Instanced buffer attribute representing the instance colors.
 * @returns {InstanceNode}
 */
export const instance = /*@__PURE__*/ nodeProxy( InstanceNode ).setParameterLength( 2, 3 );
