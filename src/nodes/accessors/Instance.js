
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
 * Storage buffers, instance colors and morph targets remain per object, as does
 * instancing outside WebGPURenderer.
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

	return ! ( morphAttributes.position || morphAttributes.normal || morphAttributes.color );

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

const getInstanceMatrix = object => object.instanceMatrix;

/**
 * Creates the appropriate node for instanced matrix transformations.
 * Depending on buffer limits and storage capability, returns either a storage, buffer, or instanced interleaved attribute node.
 *
 * @param {NodeBuilder} builder - The current node builder.
 * @param {InstancedBufferAttribute|StorageInstancedBufferAttribute} instanceMatrix - The matrix buffer attribute.
 * @param {?Function} [getObjectMatrices=null] - Optional callback returning the matrix attribute of the rendered object.
 * @returns {Node} The matrix node.
 */
function createInstanceMatrixNode( builder, instanceMatrix, getObjectMatrices = null ) {

	let instanceMatrixNode;
	const matrixCount = Math.max( instanceMatrix.count, 1 );

	const isStorageMatrix = instanceMatrix.isStorageInstancedBufferAttribute === true;

	if ( isStorageMatrix ) {

		instanceMatrixNode = storage( instanceMatrix, 'mat4', matrixCount ).element( instanceIndex );

	} else {

		const uniformBufferSize = matrixCount * 16 * 4;

		if ( getObjectMatrices === null && uniformBufferSize <= builder.getUniformBufferLimit() ) {

			instanceMatrixNode = buffer( instanceMatrix.array, 'mat4', matrixCount ).element( instanceIndex );

		} else {

			const columns = getMatrixColumns( instanceMatrix ).map( ( column, i ) => {

				const node = instancedBufferAttribute( column );

				if ( getObjectMatrices !== null ) node.setObjectAttribute( object => getMatrixColumns( getObjectMatrices( object ) )[ i ] );

				return node;

			} );

			instanceMatrixNode = mat4( ...columns );

		}

	}

	return instanceMatrixNode;

}

/**
 * Retrieves or initializes the previous-frame instance matrix attribute for motion vectors.
 *
 * @param {Object3D} object - The rendered object.
 * @param {InstancedBufferAttribute|StorageInstancedBufferAttribute} [matrices=object.instanceMatrix] - The current matrix buffer attribute.
 * @returns {InstancedBufferAttribute|StorageInstancedBufferAttribute} The previous-frame matrix buffer attribute.
 */
function getPreviousMatrix( object, matrices = object.instanceMatrix ) {

	let previous = _previousInstanceMatrices.get( object );

	if ( previous === undefined || previous.array.length !== matrices.array.length ) {

		previous = matrices.clone();
		_previousInstanceMatrices.set( object, previous );

	}

	return previous;

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

	const isStorageColor = colors && colors.isStorageInstancedBufferAttribute === true;

	const instanceMatrixNode = createInstanceMatrixNode( builder, matrices, shared ? getInstanceMatrix : null );

	if ( shared ) {

		OnBeforeObjectUpdate( ( { object } ) => {

			syncInterleavedMatrix( object.instanceMatrix );

		} );

	}

	const hasInterleavedMatrix = ! shared && _matrixColumns.has( matrices );

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
	if ( hasInterleavedMatrix || interleavedColor !== null ) {

		OnBeforeFrameUpdate( () => {

			if ( hasInterleavedMatrix ) syncInterleavedMatrix( matrices );

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

		OnAfterObjectUpdate( ( { object } ) => {

			const source = shared ? object.instanceMatrix : matrices;
			const previous = getPreviousMatrix( object, source );

			previous.array.set( source.array );
			previous.version = source.version;

			// handle interleaved path

			const previousColumns = _matrixColumns.get( previous );

			if ( previousColumns !== undefined ) previousColumns[ 0 ].data.version = source.version;

		} );

		const previousMatrix = getPreviousMatrix( builder.object, matrices );
		const previousMatrixNode = createInstanceMatrixNode( builder, previousMatrix, shared ? getPreviousMatrix : null );
		positionPrevious.assign( previousMatrixNode.mul( positionPrevious ).xyz );

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
