
import { vec3, mat4, Fn } from '../tsl/TSLBase.js';
import { OnAfterObjectUpdate, OnBeforeFrameUpdate } from '../utils/EventNode.js';
import { normalLocal, transformNormal } from './Normal.js';
import { positionLocal, positionPrevious } from './Position.js';
import { varyingProperty } from '../core/PropertyNode.js';
import { instancedBufferAttribute, instancedDynamicBufferAttribute } from './BufferAttributeNode.js';
import ReferenceAttributeNode, { referenceAttribute } from './ReferenceAttributeNode.js';
import { buffer } from './BufferNode.js';
import { storage } from './StorageBufferNode.js';
import { instanceIndex } from '../core/IndexNode.js';

import { InstancedInterleavedBuffer } from '../../core/InstancedInterleavedBuffer.js';
import { InstancedBufferAttribute } from '../../core/InstancedBufferAttribute.js';
import { DynamicDrawUsage } from '../../constants.js';

const _matrixBuffers = /*@__PURE__*/ new WeakMap();
const _colorBuffers = /*@__PURE__*/ new WeakMap();
const _previousInstanceMatrices = /*@__PURE__*/ new WeakMap();
const _previousMatrices = /*@__PURE__*/ new WeakMap();

// The default limit of vertex buffers in WebGPU.
const MAX_VERTEX_BUFFERS = 8;

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
 * Returns the instance matrices of the previous frame of the given mesh, for motion vectors.
 *
 * @param {InstancedMesh} object - The instanced mesh.
 * @returns {InstancedBufferAttribute} The matrices of the previous frame.
 */
function getPreviousMatrix( object ) {

	const matrices = object.instanceMatrix;

	let previous = _previousMatrices.get( object );

	if ( previous === undefined || previous.count !== matrices.count ) {

		if ( previous === undefined ) {

			object.addEventListener( 'dispose', onPreviousMatrixDispose );

		} else {

			previous.dispose();

		}

		previous = matrices.clone();

		_previousMatrices.set( object, previous );

	}

	return previous;

}

/**
 * Disposes the instance matrices of the previous frame when the mesh is disposed.
 *
 * @param {Object} event - The dispose event.
 */
function onPreviousMatrixDispose( { target: object } ) {

	object.removeEventListener( 'dispose', onPreviousMatrixDispose );

	_previousMatrices.get( object ).dispose();
	_previousMatrices.delete( object );

}

/**
 * Binds the instance matrices of the previous frame of the rendered mesh.
 *
 * @private
 * @augments ReferenceAttributeNode
 */
class PreviousInstanceMatrixNode extends ReferenceAttributeNode {

	static get type() {

		return 'PreviousInstanceMatrixNode';

	}

	/**
	 * Constructs a new previous instance matrix node.
	 */
	constructor() {

		super( 'previousInstanceMatrix', 'mat4' );

	}

	/**
	 * Returns the instance matrices of the previous frame of the given mesh.
	 *
	 * @param {InstancedMesh} object - The instanced mesh.
	 * @return {InstancedBufferAttribute} The matrices of the previous frame.
	 */
	getValueFromReference( object ) {

		return getPreviousMatrix( object );

	}

}

/**
 * Returns `true` if the build can bind the instance data of the rendered mesh, so it can
 * be shared between instanced meshes.
 *
 * @param {InstancedMesh} object - The instanced mesh.
 * @param {NodeBuilder} builder - The current node builder.
 * @returns {boolean} Whether the build can bind the instance data of the rendered mesh.
 */
function canReferenceInstanceData( object, builder ) {

	// only render objects bind attributes per object

	if ( builder.renderer.isRenderer !== true ) return false;

	// the instance data take up to three vertex buffers next to the ones of the geometry

	const instanceBuffers = 1 + ( object.instanceColor !== null ? 1 : 0 ) + ( builder.needsPreviousData() ? 1 : 0 );

	return Object.keys( object.geometry.attributes ).length + instanceBuffers <= MAX_VERTEX_BUFFERS;

}

/**
 * Transforms the position, the previous position and the normal with the given instance matrices.
 *
 * @param {NodeBuilder} builder - The current node builder.
 * @param {Node<mat4>} instanceMatrixNode - The instance matrix.
 * @param {?Node<mat4>} previousMatrixNode - The instance matrix of the previous frame, if motion vectors are needed.
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

	// Synchronization of dynamic buffer updates per frame.
	if ( interleavedMatrix !== null || interleavedColor !== null ) {

		OnBeforeFrameUpdate( () => {

			if ( interleavedMatrix !== null && interleavedMatrix.version !== matrices.version ) {

				interleavedMatrix.clearUpdateRanges();
				interleavedMatrix.updateRanges.push( ...matrices.updateRanges );
				matrices.clearUpdateRanges(); // "matrices" as the source is never uploaded directly. clear to avoid update range accumulation

				interleavedMatrix.version = matrices.version;

			}

			if ( colors && interleavedColor !== null && interleavedColor.version !== colors.version ) {

				interleavedColor.clearUpdateRanges();
				interleavedColor.updateRanges.push( ...colors.updateRanges );
				colors.clearUpdateRanges();

				interleavedColor.version = colors.version;

			}

		} );

	}

	let previousInstanceMatrixNode = null;

	if ( builder.needsPreviousData() ) {

		const instancedMesh = builder.object;

		OnAfterObjectUpdate( ( { object } ) => {

			const { previousInstanceMatrix } = _previousInstanceMatrices.get( object );

			previousInstanceMatrix.array.set( matrices.array );
			previousInstanceMatrix.version = matrices.version;

			// handle interleaved path

			const previousInterleavedMatrix = _matrixBuffers.get( previousInstanceMatrix );

			if ( previousInterleavedMatrix !== undefined ) previousInterleavedMatrix.version = matrices.version;

		} );

		previousInstanceMatrixNode = getPreviousInstance( instancedMesh, matrices, builder );

	}

	transformInstance( builder, instanceMatrixNode, previousInstanceMatrixNode );

	// COLOR

	if ( instanceColorNode !== null ) {

		instanceColor.assign( instanceColorNode );

	}

}, 'void' );

/**
 * TSL wrapper for applying instanced mesh rendering setup.
 *
 * The instance data of the rendered mesh are bound per object via {@link ReferenceAttributeNode},
 * so instanced meshes share builds.
 *
 * @tsl
 * @function
 * @param {InstancedMesh} instancedMesh - The instanced mesh.
 */
export const instancedMesh = /*@__PURE__*/ Fn( ( [ instancedMesh ], builder ) => {

	if ( canReferenceInstanceData( instancedMesh, builder ) ) {

		let previousInstanceMatrixNode = null;

		if ( builder.needsPreviousData() ) {

			OnAfterObjectUpdate( ( { object } ) => {

				const previous = getPreviousMatrix( object );

				previous.array.set( object.instanceMatrix.array );
				previous.version = object.instanceMatrix.version;

			} );

			previousInstanceMatrixNode = new PreviousInstanceMatrixNode();

		}

		transformInstance( builder, referenceAttribute( 'instanceMatrix', 'mat4' ), previousInstanceMatrixNode );

		if ( instancedMesh.instanceColor !== null ) {

			instanceColor.assign( referenceAttribute( 'instanceColor', 'vec3' ) );

		}

	} else {

		builder.objectSpecific = true;

		instance( instancedMesh.instanceMatrix, instancedMesh.instanceColor );

	}

}, 'void' );
