
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
import { DynamicDrawUsage, StaticDrawUsage } from '../../constants.js';

const _colorBuffers = /*@__PURE__*/ new WeakMap();
const _previousInstanceMatrices = /*@__PURE__*/ new WeakMap();
const _matrixColumns = /*@__PURE__*/ new WeakMap();

/**
 * Returns `true` if the instanced mesh can share its node builder state with
 * other instanced meshes. Shared programs read the instance matrices of the
 * object being rendered instead of embedding the buffers of a specific mesh.
 * Storage buffers, instance colors, morph targets and geometries with many
 * attributes remain per object, as does instancing outside WebGPURenderer.
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

	const geometry = object.geometry;

	// Shared programs bind the matrices as one more vertex buffer, two with velocity.
	// Leave room for them within the default limit of eight vertex buffers.
	if ( Object.keys( geometry.attributes ).length > 6 ) return false;

	// Morph target influences are bound per mesh.
	const morphAttributes = geometry.morphAttributes;

	return ! ( morphAttributes.position || morphAttributes.normal || morphAttributes.color );

}

/**
 * Copies pending matrix updates into the interleaved buffer used for rendering.
 *
 * @param {InstancedBufferAttribute} matrices - The source matrix attribute.
 * @param {Object} [owner=matrices] - The owner of the interleaved buffer.
 */
function syncInterleavedMatrix( matrices, owner = matrices ) {

	const interleavedMatrix = getMatrixColumns( matrices, owner )[ 0 ].data;

	if ( interleavedMatrix.version !== matrices.version ) {

		interleavedMatrix.clearUpdateRanges();
		interleavedMatrix.updateRanges.push( ...matrices.updateRanges );
		matrices.clearUpdateRanges(); // "matrices" as the source is never uploaded directly. clear to avoid update range accumulation

		interleavedMatrix.version = matrices.version;

	}

}

/**
 * Creates four column attributes that read the given array as an instanced vertex buffer of matrices.
 *
 * @param {Float32Array} array - The matrix data.
 * @param {number} [usage=StaticDrawUsage] - The buffer usage.
 * @returns {Array<InterleavedBufferAttribute>} The column attributes.
 */
function createMatrixColumns( array, usage = StaticDrawUsage ) {

	const interleaved = new InstancedInterleavedBuffer( array, 16, 1 ).setUsage( usage );

	return [ 0, 4, 8, 12 ].map( offset => new InterleavedBufferAttribute( interleaved, 4, offset ) );

}

/**
 * Returns the four column attributes that bind the given matrices as an instanced vertex buffer.
 *
 * @param {InstancedBufferAttribute} matrices - The matrix buffer attribute.
 * @param {Object} [owner=matrices] - The owner of the vertex buffer. Shared programs use the rendered object, so the buffer is released with it.
 * @returns {Array<InterleavedBufferAttribute>} The column attributes.
 */
function getMatrixColumns( matrices, owner = matrices ) {

	let columns = _matrixColumns.get( owner );

	if ( columns === undefined || columns[ 0 ].data.array !== matrices.array ) {

		columns = createMatrixColumns( matrices.array, matrices.usage );

		_matrixColumns.set( owner, columns );

	}

	return columns;

}

const getObjectColumns = object => getMatrixColumns( object.instanceMatrix, object );
const getPreviousColumns = object => getMatrixColumns( getPreviousMatrix( object ) );

// Callbacks of shared programs are declared here, so they don't retain the matrices of the mesh the program was built from.
const syncObjectMatrix = ( { object } ) => syncInterleavedMatrix( object.instanceMatrix, object );
const updateObjectPreviousMatrix = ( { object } ) => updatePreviousMatrix( object, object.instanceMatrix );

/**
 * Creates the appropriate node for instanced matrix transformations.
 * Depending on buffer limits and storage capability, returns either a storage, buffer, or instanced interleaved attribute node.
 *
 * @param {NodeBuilder} builder - The current node builder.
 * @param {InstancedBufferAttribute|StorageInstancedBufferAttribute} instanceMatrix - The matrix buffer attribute.
 * @param {?Function} [getObjectColumns=null] - Optional callback returning the matrix columns of the rendered object.
 * @returns {Node} The matrix node.
 */
function createInstanceMatrixNode( builder, instanceMatrix, getObjectColumns = null ) {

	let instanceMatrixNode;
	const matrixCount = Math.max( instanceMatrix.count, 1 );

	const isStorageMatrix = instanceMatrix.isStorageInstancedBufferAttribute === true;

	if ( isStorageMatrix ) {

		instanceMatrixNode = storage( instanceMatrix, 'mat4', matrixCount ).element( instanceIndex );

	} else {

		const uniformBufferSize = matrixCount * 16 * 4;

		if ( getObjectColumns === null && uniformBufferSize <= builder.getUniformBufferLimit() ) {

			instanceMatrixNode = buffer( instanceMatrix.array, 'mat4', matrixCount ).element( instanceIndex );

		} else {

			// Shared programs bind the columns of the rendered object, placeholder columns only provide the layout.
			const layout = getObjectColumns === null ? getMatrixColumns( instanceMatrix ) : createMatrixColumns( new Float32Array( 16 ) );

			const columns = layout.map( ( column, i ) => {

				const node = instancedBufferAttribute( column );

				if ( getObjectColumns !== null ) node.setObjectAttribute( object => getObjectColumns( object )[ i ] );

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
 * Copies the current matrices into the previous-frame matrices of the given object.
 *
 * @param {Object3D} object - The rendered object.
 * @param {InstancedBufferAttribute|StorageInstancedBufferAttribute} matrices - The current matrix buffer attribute.
 */
function updatePreviousMatrix( object, matrices ) {

	const previous = getPreviousMatrix( object, matrices );

	previous.array.set( matrices.array );
	previous.version = matrices.version;

	// handle interleaved path

	const previousColumns = _matrixColumns.get( previous );

	if ( previousColumns !== undefined ) previousColumns[ 0 ].data.version = matrices.version;

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

	const instanceMatrixNode = createInstanceMatrixNode( builder, matrices, shared ? getObjectColumns : null );

	if ( shared ) OnBeforeObjectUpdate( syncObjectMatrix );

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

		OnAfterObjectUpdate( shared ? updateObjectPreviousMatrix : ( { object } ) => updatePreviousMatrix( object, matrices ) );

		const previousMatrix = getPreviousMatrix( builder.object, matrices );
		const previousMatrixNode = createInstanceMatrixNode( builder, previousMatrix, shared ? getPreviousColumns : null );
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
