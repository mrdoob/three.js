
import { vec3, mat4, Fn } from '../tsl/TSLBase.js';
import { OnAfterObjectUpdate, OnBeforeFrameUpdate, OnBeforeObjectUpdate } from '../utils/EventNode.js';
import { normalLocal, transformNormal } from './Normal.js';
import { positionLocal, positionPrevious } from './Position.js';
import { varyingProperty } from '../core/PropertyNode.js';
import { instancedBufferAttribute, instancedDynamicBufferAttribute } from './BufferAttributeNode.js';
import { buffer } from './BufferNode.js';
import { storage } from './StorageBufferNode.js';
import { instanceIndex } from '../core/IndexNode.js';

import { InstancedInterleavedBuffer } from '../../core/InstancedInterleavedBuffer.js';
import { InstancedBufferAttribute } from '../../core/InstancedBufferAttribute.js';
import { InterleavedBufferAttribute } from '../../core/InterleavedBufferAttribute.js';
import { DynamicDrawUsage } from '../../constants.js';

const _colorBuffers = /*@__PURE__*/ new WeakMap();
const _previousInstanceMatrices = /*@__PURE__*/ new WeakMap();
const _matrixColumns = /*@__PURE__*/ new WeakMap();

/**
 * Returns `true` if the instanced mesh can share its node builder state with
 * other instanced meshes. Shared programs read the instance matrices of the
 * object being rendered instead of embedding the buffers of a specific mesh.
 * Storage buffers, instance colors, morph targets and previous-frame data for
 * motion vectors remain per object, as does instancing outside WebGPURenderer.
 *
 * @param {InstancedMesh} object - The instanced mesh.
 * @param {Renderer} renderer - The renderer.
 * @returns {boolean} Whether the instancing setup can be shared.
 */
export function isSharedInstancing( object, renderer ) {

	// Only WebGPURenderer's render objects share node builder states.
	if ( renderer.isWebGPURenderer !== true ) return false;

	if ( object.isInstancedMesh !== true || object.instanceColor !== null ) return false;

	const instanceMatrix = object.instanceMatrix;

	if ( ! instanceMatrix || instanceMatrix.isInstancedBufferAttribute !== true || instanceMatrix.isStorageInstancedBufferAttribute === true ) return false;

	// Morph target influences are bound per mesh.
	const morphAttributes = object.geometry.morphAttributes;

	if ( morphAttributes.position || morphAttributes.normal || morphAttributes.color ) return false;

	// Previous-frame matrices for motion vectors are stored per mesh.
	const mrt = renderer.getMRT();

	return mrt === null || mrt.has( 'velocity' ) === false;

}

/**
 * Copies pending matrix updates into the interleaved buffer used for rendering.
 *
 * @param {InstancedBufferAttribute} matrices - The source matrix attribute.
 */
function syncInterleavedMatrix( matrices ) {

	const interleavedMatrix = getMatrixColumns( matrices )[ 0 ].data;

	if ( interleavedMatrix.version !== matrices.version ) {

		interleavedMatrix.clearUpdateRanges();
		interleavedMatrix.updateRanges.push( ...matrices.updateRanges );
		matrices.clearUpdateRanges(); // "matrices" as the source is never uploaded directly. clear to avoid update range accumulation

		interleavedMatrix.version = matrices.version;

	}

}

/**
 * Returns the four column attributes of the given matrices, which a shared program binds per object.
 *
 * @param {InstancedBufferAttribute} matrices - The matrix buffer attribute.
 * @returns {Array<InterleavedBufferAttribute>} The column attributes.
 */
function getMatrixColumns( matrices ) {

	let columns = _matrixColumns.get( matrices );

	if ( columns === undefined ) {

		const interleaved = new InstancedInterleavedBuffer( matrices.array, 16, 1 ).setUsage( matrices.usage );

		columns = [ 0, 4, 8, 12 ].map( offset => new InterleavedBufferAttribute( interleaved, 4, offset ) );

		_matrixColumns.set( matrices, columns );

	}

	return columns;

}

/**
 * Creates the appropriate node for instanced matrix transformations.
 * Depending on buffer limits and storage capability, returns either a storage, buffer, or instanced interleaved attribute node.
 *
 * @param {NodeBuilder} builder - The current node builder.
 * @param {InstancedBufferAttribute|StorageInstancedBufferAttribute} instanceMatrix - The matrix buffer attribute.
 * @param {boolean} [shared=false] - Whether the matrices are resolved from the rendered object.
 * @returns {Node} The matrix node.
 */
function createInstanceMatrixNode( builder, instanceMatrix, shared = false ) {

	let instanceMatrixNode;
	const matrixCount = Math.max( instanceMatrix.count, 1 );

	const isStorageMatrix = instanceMatrix.isStorageInstancedBufferAttribute === true;

	if ( isStorageMatrix ) {

		instanceMatrixNode = storage( instanceMatrix, 'mat4', matrixCount ).element( instanceIndex );

	} else {

		const uniformBufferSize = matrixCount * 16 * 4;

		if ( ! shared && uniformBufferSize <= builder.getUniformBufferLimit() ) {

			instanceMatrixNode = buffer( instanceMatrix.array, 'mat4', matrixCount ).element( instanceIndex );

		} else {

			const columns = getMatrixColumns( instanceMatrix ).map( ( column, i ) => {

				const node = instancedBufferAttribute( column );

				if ( shared ) node.setObjectAttribute( object => getMatrixColumns( object.instanceMatrix )[ i ] );

				return node;

			} );

			instanceMatrixNode = mat4( ...columns );

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

	setupInstance( builder, matrices, colors, false );

}, 'void' );

/**
 * Sets up instanced transformations and colors.
 *
 * @private
 * @param {NodeBuilder} builder - The current node builder.
 * @param {InstancedBufferAttribute|StorageInstancedBufferAttribute} matrices - The instanced transformation matrices.
 * @param {?InstancedBufferAttribute|StorageInstancedBufferAttribute} colors - The optional instanced colors.
 * @param {boolean} shared - Whether the matrices are resolved from the rendered object, so the program can be shared.
 */
function setupInstance( builder, matrices, colors, shared ) {

	const isStorageMatrix = matrices.isStorageInstancedBufferAttribute === true;
	const isStorageColor = colors && colors.isStorageInstancedBufferAttribute === true;

	const instanceMatrixNode = createInstanceMatrixNode( builder, matrices, shared );

	if ( shared ) {

		OnBeforeObjectUpdate( ( { object } ) => {

			syncInterleavedMatrix( object.instanceMatrix );

		} );

	}

	// interleaved buffer tracking for matrix
	let interleavedMatrix = null;

	if ( ! isStorageMatrix && ! shared ) {

		const uniformBufferSize = Math.max( matrices.count, 1 ) * 16 * 4;

		if ( uniformBufferSize > builder.getUniformBufferLimit() ) {

			interleavedMatrix = getMatrixColumns( matrices )[ 0 ].data;

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

	// Synchronization of dynamic buffer updates per frame.
	if ( interleavedMatrix !== null || interleavedColor !== null ) {

		OnBeforeFrameUpdate( () => {

			if ( interleavedMatrix !== null ) syncInterleavedMatrix( matrices );

			if ( colors && interleavedColor !== null && interleavedColor.version !== colors.version ) {

				interleavedColor.clearUpdateRanges();
				interleavedColor.updateRanges.push( ...colors.updateRanges );
				colors.clearUpdateRanges();

				interleavedColor.version = colors.version;

			}

		} );

	}

	// POSITION

	const instancePosition = instanceMatrixNode.mul( positionLocal ).xyz;
	positionLocal.assign( instancePosition );

	if ( builder.needsPreviousData() ) {

		const instancedMesh = builder.object;

		OnAfterObjectUpdate( ( { object } ) => {

			const { previousInstanceMatrix } = _previousInstanceMatrices.get( object );

			previousInstanceMatrix.array.set( matrices.array );
			previousInstanceMatrix.version = matrices.version;

			// handle interleaved path

			const previousColumns = _matrixColumns.get( previousInstanceMatrix );

			if ( previousColumns !== undefined ) previousColumns[ 0 ].data.version = matrices.version;

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

}

/**
 * TSL wrapper for applying instanced mesh rendering setup.
 *
 * @tsl
 * @function
 * @param {InstancedMesh} instancedMesh - The instanced mesh.
 */
export const instancedMesh = /*@__PURE__*/ Fn( ( [ instancedMesh ], builder ) => {

	const { instanceMatrix, instanceColor } = instancedMesh;

	setupInstance( builder, instanceMatrix, instanceColor, isSharedInstancing( instancedMesh, builder.renderer ) );

}, 'void' );
