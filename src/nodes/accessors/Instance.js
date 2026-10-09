
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
import { isSharedInstancing } from '../../renderers/common/RenderObject.js';

const _colorBuffers = /*@__PURE__*/ new WeakMap();
const _previousInstanceMatrices = /*@__PURE__*/ new WeakMap();
const _matrixColumns = /*@__PURE__*/ new WeakMap();

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

			const columns = getMatrixColumns( instanceMatrix ).map( column => instancedBufferAttribute( column ) );

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
 * Creates a matrix node that binds the matrices of the rendered object, so the program can be shared between objects.
 *
 * @param {Function} getColumns - Returns the matrix columns of the rendered object.
 * @returns {Node} The matrix node.
 */
function createSharedMatrixNode( getColumns ) {

	// Placeholder columns only provide the layout, each object binds its own columns.
	const columns = createMatrixColumns( new Float32Array( 16 ) ).map( ( column, i ) => {

		return instancedBufferAttribute( column ).setAttributeCallback( object => getColumns( object )[ i ] );

	} );

	return mat4( ...columns );

}

/**
 * Transforms the local position, the previous position and the normal with the given instance matrices.
 *
 * @param {NodeBuilder} builder - The current node builder.
 * @param {Node} instanceMatrixNode - The instance matrix node.
 * @param {?Node} previousMatrixNode - The previous-frame instance matrix node, if motion vectors are needed.
 */
function transformInstance( builder, instanceMatrixNode, previousMatrixNode ) {

	// POSITION

	const instancePosition = instanceMatrixNode.mul( positionLocal ).xyz;
	positionLocal.assign( instancePosition );

	if ( previousMatrixNode !== null ) {

		positionPrevious.assign( previousMatrixNode.mul( positionPrevious ).xyz );

	}

	// NORMAL

	if ( builder.hasGeometryAttribute( 'normal' ) ) {

		const instanceNormal = transformNormal( normalLocal, instanceMatrixNode );
		normalLocal.assign( instanceNormal );

	}

}

/**
 * Sets up instancing with the matrices of the rendered object, so the program can be shared between instanced meshes.
 *
 * @param {NodeBuilder} builder - The current node builder.
 */
function setupSharedInstance( builder ) {

	OnBeforeObjectUpdate( ( { object } ) => syncInterleavedMatrix( object.instanceMatrix, object ) );

	let previousMatrixNode = null;

	if ( builder.needsPreviousData() ) {

		OnAfterObjectUpdate( ( { object } ) => updatePreviousMatrix( object, object.instanceMatrix ) );

		previousMatrixNode = createSharedMatrixNode( object => getMatrixColumns( getPreviousMatrix( object ) ) );

	}

	transformInstance( builder, createSharedMatrixNode( object => getMatrixColumns( object.instanceMatrix, object ) ), previousMatrixNode );

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

	const isStorageColor = colors && colors.isStorageInstancedBufferAttribute === true;

	const instanceMatrixNode = createInstanceMatrixNode( builder, matrices );

	const hasInterleavedMatrix = _matrixColumns.has( matrices );

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

	let previousMatrixNode = null;

	if ( builder.needsPreviousData() ) {

		OnAfterObjectUpdate( ( { object } ) => updatePreviousMatrix( object, matrices ) );

		previousMatrixNode = createInstanceMatrixNode( builder, getPreviousMatrix( builder.object, matrices ) );

	}

	transformInstance( builder, instanceMatrixNode, previousMatrixNode );

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
export const instancedMesh = /*@__PURE__*/ Fn( ( [ instancedMesh ], builder ) => {

	if ( isSharedInstancing( instancedMesh, builder.renderer ) ) {

		setupSharedInstance( builder );

	} else {

		instance( instancedMesh.instanceMatrix, instancedMesh.instanceColor );

	}

}, 'void' );
