
import { vec3, mat4, Fn } from '../tsl/TSLBase.js';
import { OnFrameUpdate, OnObjectUpdate } from '../utils/EventNode.js';
import { normalLocal, transformNormal } from './Normal.js';
import { positionLocal, positionPrevious } from './Position.js';
import { varyingProperty } from '../core/PropertyNode.js';
import { instancedBufferAttribute, instancedDynamicBufferAttribute } from './BufferAttributeNode.js';
import { buffer } from './BufferNode.js';
import { storage } from './StorageBufferNode.js';
import { instanceIndex } from '../core/IndexNode.js';

import { InstancedInterleavedBuffer } from '../../core/InstancedInterleavedBuffer.js';
import { InstancedBufferAttribute } from '../../core/InstancedBufferAttribute.js';
import { DynamicDrawUsage } from '../../constants.js';

const _matrixBuffers = /*@__PURE__*/ new WeakMap();
const _colorBuffers = /*@__PURE__*/ new WeakMap();
const _previousInstanceMatrices = /*@__PURE__*/ new WeakMap();

/**
 * Creates the appropriate node for instanced matrix transformations.
 * Depending on buffer limits and storage capability, returns either a storage, buffer, or instanced interleaved attribute node.
 *
 * @param {NodeBuilder} builder - The current node builder.
 * @param {InstancedBufferAttribute|StorageInstancedBufferAttribute} instanceMatrix - The matrix buffer attribute.
 * @returns {Node} The matrix node.
 */
function createInstanceMatrixNode( builder, instanceMatrix ) {

	let instanceMatrixNode;
	const matrixCount = Math.max( instanceMatrix.count, 1 );

	const isStorageMatrix = instanceMatrix.isStorageInstancedBufferAttribute === true;

	if ( isStorageMatrix ) {

		instanceMatrixNode = storage( instanceMatrix, 'mat4', matrixCount ).element( instanceIndex );

	} else {

		const uniformBufferSize = matrixCount * 16 * 4;

		if ( uniformBufferSize <= builder.getUniformBufferLimit() ) {

			instanceMatrixNode = buffer( instanceMatrix.array, 'mat4', matrixCount ).element( instanceIndex );

		} else {

			let interleaved = _matrixBuffers.get( instanceMatrix );

			if ( ! interleaved ) {

				interleaved = new InstancedInterleavedBuffer( instanceMatrix.array, 16, 1 );
				_matrixBuffers.set( instanceMatrix, interleaved );

			}

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

/**
 * Retrieves or initializes the previous frame instance matrix node for motion vectors.
 * Uses a WeakMap to cache previous frame instance matrices and their TSL nodes.
 *
 * @param {InstancedMesh} instancedMesh - The instanced mesh object.
 * @param {InstancedBufferAttribute|StorageInstancedBufferAttribute} instanceMatrix - The current matrix buffer attribute.
 * @param {NodeBuilder} builder - The current node builder.
 * @returns {Node} The previous frame instance matrix node.
 */
function getPreviousInstance( instancedMesh, instanceMatrix, builder ) {

	let data = _previousInstanceMatrices.get( instancedMesh );

	if ( data === undefined ) {

		const previousInstanceMatrix = instanceMatrix.clone();

		data = {
			previousInstanceMatrix,
			node: createInstanceMatrixNode( builder, previousInstanceMatrix )
		};

		_previousInstanceMatrices.set( instancedMesh, data );

	}

	return data.node;

}

/**
 * TSL object representing a varying property for the instanced color vector.
 *
 * @type {VaryingNode<vec3>}
 */
export const instanceColor = /*@__PURE__*/ varyingProperty( 'vec3', 'vInstanceColor' );

/**
 * TSL function representing the standard instancing vertex shader setup.
 * Transforms positionLocal and normalLocal, and assigns varying color in-place.
 *
 * @tsl
 * @function
 * @param {InstancedBufferAttribute|StorageInstancedBufferAttribute} matrices - The instanced transformation matrices.
 * @param {?InstancedBufferAttribute|StorageInstancedBufferAttribute} [colors=null] - The optional instanced colors.
 */
export const instance = /*@__PURE__*/ Fn( ( [ matrices, colors = null ], builder ) => {

	const isStorageMatrix = matrices.isStorageInstancedBufferAttribute === true;
	const isStorageColor = colors && colors.isStorageInstancedBufferAttribute === true;

	const instanceMatrixNode = createInstanceMatrixNode( builder, matrices );

	// interleaved buffer tracking for matrix
	let interleavedMatrix = null;

	if ( ! isStorageMatrix ) {

		const uniformBufferSize = Math.max( matrices.count, 1 ) * 16 * 4;

		if ( uniformBufferSize > builder.getUniformBufferLimit() ) {

			interleavedMatrix = _matrixBuffers.get( matrices );

		}

	}

	let instanceColorNode = null;
	let interleavedColor = null;

	if ( colors ) {

		if ( isStorageColor ) {

			instanceColorNode = storage( colors, 'vec3', Math.max( colors.count, 1 ) ).element( instanceIndex );

		} else {

			let bufferAttribute = _colorBuffers.get( colors );

			if ( ! bufferAttribute ) {

				bufferAttribute = new InstancedBufferAttribute( colors.array, 3 );
				_colorBuffers.set( colors, bufferAttribute );

			}

			interleavedColor = bufferAttribute;

			const bufferFn = colors.usage === DynamicDrawUsage ? instancedDynamicBufferAttribute : instancedBufferAttribute;

			instanceColorNode = vec3( bufferFn( bufferAttribute, 'vec3', 3, 0 ) );

		}

	}

	// Synchronization of dynamic buffer updates per frame
	if ( interleavedMatrix !== null || interleavedColor !== null ) {

		OnFrameUpdate( () => {

			if ( interleavedMatrix !== null ) {

				interleavedMatrix.clearUpdateRanges();
				interleavedMatrix.updateRanges.push( ...matrices.updateRanges );

				if ( matrices.version !== interleavedMatrix.version ) {

					interleavedMatrix.version = matrices.version;

				}

			}

			if ( colors && interleavedColor !== null ) {

				interleavedColor.clearUpdateRanges();
				interleavedColor.updateRanges.push( ...colors.updateRanges );

				if ( colors.version !== interleavedColor.version ) {

					interleavedColor.version = colors.version;

				}

			}

		} );

	}

	// POSITION

	const instancePosition = instanceMatrixNode.mul( positionLocal ).xyz;
	positionLocal.assign( instancePosition );

	if ( builder.needsPreviousData() ) {

		const instancedMesh = builder.object;

		OnObjectUpdate( ( { object } ) => {

			const previousInstanceData = _previousInstanceMatrices.get( object );

			previousInstanceData.previousInstanceMatrix.array.set( matrices.array );

		} );

		const previousInstanceMatrixNode = getPreviousInstance( instancedMesh, matrices, builder );
		positionPrevious.assign( previousInstanceMatrixNode.mul( positionPrevious ).xyz );

	}

	// NORMAL

	if ( builder.hasGeometryAttribute( 'normal' ) ) {

		const instanceNormal = transformNormal( normalLocal, instanceMatrixNode );
		normalLocal.assign( instanceNormal );

	}

	// COLOR

	if ( instanceColorNode !== null ) {

		instanceColor.assign( instanceColorNode );

	}

}, 'void' );

/**
 * TSL wrapper for applying instanced mesh rendering setup.
 *
 * @tsl
 * @function
 * @param {InstancedMesh} instancedMesh - The instanced mesh.
 */
export const instancedMesh = /*@__PURE__*/ Fn( ( [ instancedMesh ] ) => {

	const { instanceMatrix, instanceColor } = instancedMesh;

	instance( instanceMatrix, instanceColor );

}, 'void' );
