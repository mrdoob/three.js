
import { normalLocal } from './Normal.js';
import { positionLocal } from './Position.js';
import { vec3, mat3, mat4, int, ivec2, float, Fn } from '../tsl/TSLBase.js';
import { textureLoad } from './TextureNode.js';
import { textureSize } from './TextureSizeNode.js';
import { tangentLocal } from './Tangent.js';
import { instanceIndex, drawIndex } from '../core/IndexNode.js';
import { varyingProperty } from '../core/PropertyNode.js';

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
 * @param {BatchedMesh} batchMesh - The batched mesh.
 * @param {Node<int>} id - The draw or instance ID.
 * @returns {Node<uint>} The indirect index.
 */
const getIndirectIndex = /*@__PURE__*/ Fn( ( [ indirectTexture, id ] ) => {

	const size = int( textureSize( textureLoad( indirectTexture ), 0 ).x ).toConst();
	const x = int( id ).mod( size ).toConst();
	const y = int( id ).div( size ).toConst();
	return textureLoad( indirectTexture, ivec2( x, y ) ).x;

} );

/**
 * TSL object representing a varying property for the batching color vector.
 *
 * @type {VaryingNode<vec4>}
 */
export const batchColor = /*@__PURE__*/ varyingProperty( 'vec4', 'vBatchColor' );

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

	const indirectId = getIndirectIndex( batchMesh._indirectTexture, int( batchingIdNode ) );

	const matricesTexture = batchMesh._matricesTexture;

	const size = int( textureSize( textureLoad( matricesTexture ), 0 ).x ).toConst();
	const j = float( indirectId ).mul( 4 ).toInt().toConst();

	const x = j.mod( size ).toConst();
	const y = j.div( size ).toConst();
	const batchingMatrix = mat4(
		textureLoad( matricesTexture, ivec2( x, y ) ),
		textureLoad( matricesTexture, ivec2( x.add( 1 ), y ) ),
		textureLoad( matricesTexture, ivec2( x.add( 2 ), y ) ),
		textureLoad( matricesTexture, ivec2( x.add( 3 ), y ) )
	);

	const colorsTexture = batchMesh._colorsTexture;

	if ( colorsTexture !== null ) {

		const color = getBatchingColor( colorsTexture, indirectId );

		batchColor.assign( color );

	}

	const bm = mat3( batchingMatrix );

	positionLocal.assign( batchingMatrix.mul( positionLocal ) );

	const transformedNormal = normalLocal.div( vec3( bm[ 0 ].dot( bm[ 0 ] ), bm[ 1 ].dot( bm[ 1 ] ), bm[ 2 ].dot( bm[ 2 ] ) ) );

	const batchingNormal = bm.mul( transformedNormal ).xyz;

	normalLocal.assign( batchingNormal );

	if ( builder.hasGeometryAttribute( 'tangent' ) ) {

		tangentLocal.mulAssign( bm );

	}

}, 'void' );


