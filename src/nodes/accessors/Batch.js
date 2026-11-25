
import { normalLocal } from './Normal.js';
import { positionLocal, positionPrevious } from './Position.js';
import { vec3, mat3, mat4, int, ivec2, float, Fn } from '../tsl/TSLBase.js';
import { textureLoad } from './TextureNode.js';
import { textureSize } from './TextureSizeNode.js';
import { tangentLocal } from './Tangent.js';
import { instanceIndex, drawIndex } from '../core/IndexNode.js';
import { varyingProperty } from '../core/PropertyNode.js';
import { OnObjectUpdate, OnAfterObjectUpdate } from '../utils/EventNode.js';
import { DataTexture } from '../../textures/DataTexture.js';

/**
 * TSL function that retrieves the batching color for a given instance ID from a colors texture.
 *
 * @param {Node<texture>} colorsTexture - The colors texture.
 * @param {Node<int>} id - The instance or batch ID.
 * @returns {Node<vec4>} The retrieved color.
 */
const getBatchingColor = /*@__PURE__*/ Fn( ( [ colorsTexture, id ] ) => {

	const size = int( textureSize( textureLoad( colorsTexture ), 0 ).x ).toConst();
	const j = int( id );
	const x = j.mod( size ).toConst();
	const y = j.div( size ).toConst();
	return textureLoad( colorsTexture, ivec2( x, y ) );

} );

/**
 * TSL function that retrieves the indirect index for a given batch ID.
 *
 * @param {TextureNode} indirectTextureNode - The indirect texture node.
 * @param {Node<int>} id - The draw or instance ID.
 * @returns {Node<uint>} The indirect index.
 */
const getIndirectIndex = /*@__PURE__*/ Fn( ( [ indirectTextureNode, id ] ) => {

	const size = int( textureSize( indirectTextureNode, 0 ).x ).toConst();
	const x = int( id ).mod( size ).toConst();
	const y = int( id ).div( size ).toConst();
	return textureLoad( indirectTextureNode, ivec2( x, y ) ).x;

} );

/**
 * Creates the node that reads a batching matrix from the given matrices texture.
 *
 * @param {Texture} matricesTexture - The matrices texture.
 * @param {Node<uint>} id - The indirect instance ID.
 * @returns {Node<mat4>} The matrix node.
 */
function createBatchingMatrixNode( matricesTexture, id ) {

	const size = int( textureSize( textureLoad( matricesTexture ), 0 ).x ).toConst();
	const j = float( id ).mul( 4 ).toInt().toConst();

	const x = j.mod( size ).toConst();
	const y = j.div( size ).toConst();

	return mat4(
		textureLoad( matricesTexture, ivec2( x, y ) ),
		textureLoad( matricesTexture, ivec2( x.add( 1 ), y ) ),
		textureLoad( matricesTexture, ivec2( x.add( 2 ), y ) ),
		textureLoad( matricesTexture, ivec2( x.add( 3 ), y ) )
	);

}

/**
 * Returns the batching matrices texture of the previous frame for motion vectors.
 * It is created on first use and again after the batched mesh released it.
 *
 * @param {BatchedMesh} batchMesh - The batched mesh.
 * @returns {DataTexture} The previous frame matrices texture.
 */
function getPreviousMatricesTexture( batchMesh ) {

	let previousMatricesTexture = batchMesh._previousMatricesTexture;

	if ( previousMatricesTexture === null ) {

		const { image, format, type, version } = batchMesh._matricesTexture;

		previousMatricesTexture = new DataTexture( image.data.slice(), image.width, image.height, format, type );
		previousMatricesTexture.version = version;

		batchMesh._previousMatricesTexture = previousMatricesTexture;

	}

	return previousMatricesTexture;

}

/**
 * Returns the indirect texture for the given call depth of the renderer. With the WebGPU backend,
 * nested renders write their draw order into their own texture since the draws of the outer render
 * are executed when its pass is submitted.
 *
 * @param {BatchedMesh} batchMesh - The batched mesh.
 * @param {number} callDepth - The call depth of the renderer.
 * @returns {DataTexture} The indirect texture.
 */
function getIndirectTexture( batchMesh, callDepth ) {

	// without culling and sorting, the draw order is the same for all cameras so the main texture can be shared

	if ( batchMesh.perObjectFrustumCulled === false && batchMesh.sortObjects === false ) return batchMesh._indirectTexture;

	return batchMesh._getIndirectTexture( callDepth );

}

/**
 * TSL object representing a varying property for the batching color vector.
 *
 * @type {VaryingNode<vec4>}
 */
export const batchColor = /*@__PURE__*/ varyingProperty( 'vec4', 'vBatchColor' );

/**
 * TSL object representing a varying property for the batch indirect index (instance ID).
 *
 * @type {VaryingNode<uint>}
 */
export const batchIndirectIndex = /*@__PURE__*/ varyingProperty( 'uint', 'vBatchIndirectId' );

/**
 * TSL function representing the vertex shader batching setup.
 * Applies the batch transformation matrix to positionLocal, normalLocal, and tangentLocal.
 * Also assigns the batch color if a color texture is present.
 *
 * @tsl
 * @function
 * @param {BatchedMesh} batchMesh - The batched mesh.
 */
export const batch = /*@__PURE__*/ Fn( ( [ batchMesh ], builder ) => {

	const batchingIdNode = builder.getDrawIndex() === null ? instanceIndex : drawIndex;

	const indirectTextureNode = textureLoad( batchMesh._indirectTexture );

	const indirectId = getIndirectIndex( indirectTextureNode, int( batchingIdNode ) );

	batchIndirectIndex.assign( indirectId );

	const batchingMatrix = createBatchingMatrixNode( batchMesh._matricesTexture, indirectId );

	const colorsTexture = batchMesh._colorsTexture;

	if ( colorsTexture !== null ) {

		const color = getBatchingColor( colorsTexture, indirectId );

		batchColor.assign( color );

	}

	const bm = mat3( batchingMatrix );

	positionLocal.assign( batchingMatrix.mul( positionLocal ) );

	if ( builder.needsPreviousData() ) {

		OnAfterObjectUpdate( ( { object } ) => {

			const previousMatricesTexture = getPreviousMatricesTexture( object );
			const matricesTexture = object._matricesTexture;

			if ( previousMatricesTexture.version !== matricesTexture.version ) {

				previousMatricesTexture.image.data.set( matricesTexture.image.data );
				previousMatricesTexture.version = matricesTexture.version;

			}

		} );

		const previousBatchingMatrixNode = createBatchingMatrixNode( getPreviousMatricesTexture( batchMesh ), indirectId );
		positionPrevious.assign( previousBatchingMatrixNode.mul( positionPrevious ).xyz );

	}

	const transformedNormal = normalLocal.div( vec3( bm[ 0 ].dot( bm[ 0 ] ), bm[ 1 ].dot( bm[ 1 ] ), bm[ 2 ].dot( bm[ 2 ] ) ) );

	const batchingNormal = bm.mul( transformedNormal ).xyz;

	normalLocal.assign( batchingNormal );

	if ( builder.hasGeometryAttribute( 'tangent' ) ) {

		tangentLocal.assign( bm.mul( tangentLocal ) );

	}

	const drawFormat = builder.renderer.backend.isWebGPUBackend === true ? 'merged' : 'multiDraw';

	OnObjectUpdate( ( { object, camera, material, renderer } ) => {

		const indirectTexture = drawFormat === 'merged' ? getIndirectTexture( object, renderer._callDepth ) : object._indirectTexture;

		indirectTextureNode.value = indirectTexture;

		object._updateDrawParameters( camera, object.geometry, material, drawFormat, indirectTexture );

	} );

}, 'void' );


