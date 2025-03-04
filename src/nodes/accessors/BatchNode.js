import Node from '../core/Node.js';
import { normalLocal } from './Normal.js';
import { positionLocal } from './Position.js';
import { nodeProxy, vec3, mat3, mat4, int, ivec2, float, Fn } from '../tsl/TSLBase.js';
import { textureLoad } from './TextureNode.js';
import { textureSize } from './TextureSizeNode.js';
import { tangentLocal } from './Tangent.js';
import { instanceIndex, drawIndex } from '../core/IndexNode.js';
import { varyingProperty } from '../core/PropertyNode.js';
import { NodeUpdateType } from '../Nodes.js';
import IndirectStorageBufferAttribute from '../../renderers/common/IndirectStorageBufferAttribute.js';

/**
 * This node implements the vertex shader logic which is required
 * when rendering 3D objects via batching. `BatchNode` must be used
 * with instances of {@link BatchedMesh}.
 *
 * @augments Node
 */
class BatchNode extends Node {

	static get type() {

		return 'BatchNode';

	}

	/**
	 * Constructs a new batch node.
	 *
	 * @param {BatchedMesh} batchMesh - A reference to batched mesh.
	 */
	constructor( batchMesh ) {

		super( 'void' );

		/**
		 * A reference to batched mesh.
		 *
		 * @type {BatchedMesh}
		 */
		this.batchMesh = batchMesh;

		/**
		 * The batching index node.
		 *
		 * @type {?IndexNode}
		 * @default null
		 */
		this.batchingIdNode = null;
		this.updateBeforeType = NodeUpdateType.FRAME;

		/**
		 * A reference of the indirect version to prevent unnecessary updates.
		 * @type {Number}
		 * @default 0
		 */
		this.indirectVersion = 0;

	}

	/**
	 * Setups the internal buffers and nodes and assigns the transformed vertex data
	 * to predefined node variables for accumulation. That follows the same patterns
	 * like with morph and skinning nodes.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 */
	setup( builder ) {

		if ( this.batchingIdNode === null ) {

			if ( builder.getDrawIndex() === null ) {

				this.batchingIdNode = instanceIndex;

			} else {

				this.batchingIdNode = drawIndex;

			}

		}


		if ( builder.isFlipY() === false ) {

			const object = this.batchMesh;
			const geometry = object.geometry;

			const uint32 = new Uint32Array( 5 * object._maxInstanceCount );
			const starts = object._multiDrawStarts;
			const counts = object._multiDrawCounts;
			const drawCount = object._multiDrawCount;
			const drawInstances = object._multiDrawInstances;

			for ( let i = 0; i < drawCount; i ++ ) {

				const count = drawInstances ? drawInstances[ i ] : 1;

				uint32[ i * 5 ] = counts[ i ]; // indexCount
				uint32[ i * 5 + 1 ] = count; // instanceCount
				uint32[ i * 5 + 2 ] = starts[ i ] / object.geometry.index.array.BYTES_PER_ELEMENT; // firstIndex
				uint32[ i * 5 + 3 ] = 0; // baseVertex
				uint32[ i * 5 + 4 ] = i; // firstInstance

			}

			const indirectAttribute = new IndirectStorageBufferAttribute( uint32, 5 );
			geometry.setIndirect( indirectAttribute );

		}

		const getIndirectIndex = Fn( ( [ id ] ) => {

			const size = textureLoad( this.batchMesh._indirectTexture ).size( 0 ).x.toInt().toConst( 'size' );
			const x = int( id ).modInt( size ).toConst( 'x' );
			const y = int( id ).div( size ).toConst( 'y' );
			const index = textureLoad( this.batchMesh._indirectTexture, ivec2( x, y ) ).x.toFloat().toConst( 'index' );

			return index;

		} ).setLayout( {
			name: 'getIndirectIndex',
			type: 'uint',
			inputs: [
				{ name: 'id', type: 'int' }
			]
		} );

		const indirectId = getIndirectIndex( int( this.batchingIdNode ) );

		const matricesTexture = this.batchMesh._matricesTexture;

		const size = textureSize( textureLoad( matricesTexture ), 0 );
		const j = float( indirectId ).mul( 4 ).toInt().toVar();

		const x = j.modInt( size );
		const y = j.div( int( size ) );
		const batchingMatrix = mat4(
			textureLoad( matricesTexture, ivec2( x, y ) ),
			textureLoad( matricesTexture, ivec2( x.add( 1 ), y ) ),
			textureLoad( matricesTexture, ivec2( x.add( 2 ), y ) ),
			textureLoad( matricesTexture, ivec2( x.add( 3 ), y ) )
		);


		const colorsTexture = this.batchMesh._colorsTexture;

		if ( colorsTexture !== null ) {

			const getBatchingColor = Fn( ( [ id ] ) => {

				const size = textureSize( textureLoad( colorsTexture ), 0 ).x;
				const j = id;
				const x = j.modInt( size );
				const y = j.div( size );
				return textureLoad( colorsTexture, ivec2( x, y ) ).rgb;

			} ).setLayout( {
				name: 'getBatchingColor',
				type: 'vec3',
				inputs: [
					{ name: 'id', type: 'int' }
				]
			} );

			const color = getBatchingColor( indirectId );

			varyingProperty( 'vec3', 'vBatchColor' ).assign( color );

		}

		const bm = mat3( batchingMatrix );

		positionLocal.assign( batchingMatrix.mul( positionLocal ) );

		const transformedNormal = normalLocal.div( vec3( bm[ 0 ].dot( bm[ 0 ] ), bm[ 1 ].dot( bm[ 1 ] ), bm[ 2 ].dot( bm[ 2 ] ) ) );

		const batchingNormal = bm.mul( transformedNormal ).xyz;

		normalLocal.assign( batchingNormal );

		if ( builder.hasGeometryAttribute( 'tangent' ) ) {

			tangentLocal.mulAssign( bm );

		}

	}

	updateBefore() {

		const object = this.batchMesh;

		const indirect = object.geometry.getIndirect();

		if ( indirect !== null && object._indirectTexture.version > this.indirectVersion ) {

			const uint32 = new Uint32Array( 5 * object._maxInstanceCount );
			const starts = object._multiDrawStarts;
			const counts = object._multiDrawCounts;
			const drawCount = object._multiDrawCount;
			const drawInstances = object._multiDrawInstances;

			for ( let i = 0; i < drawCount; i ++ ) {

			  const count = drawInstances ? drawInstances[ i ] : 1;

			  uint32[ i * 5 ] = counts[ i ]; // indexCount
			  uint32[ i * 5 + 1 ] = count; // instanceCount
			  uint32[ i * 5 + 2 ] = starts[ i ] / object.geometry.index.array.BYTES_PER_ELEMENT; // firstIndex
			  uint32[ i * 5 + 3 ] = 0; // baseVertex
			  uint32[ i * 5 + 4 ] = i; // firstInstance

			}

			indirect.array = uint32;
			indirect.needsUpdate = true;

			this.indirectVersion = object._indirectTexture.version;

		}

	}

}

export default BatchNode;

/**
 * TSL function for creating a batch node.
 *
 * @tsl
 * @function
 * @param {BatchedMesh} batchMesh - A reference to batched mesh.
 * @returns {BatchNode}
 */
export const batch = /*@__PURE__*/ nodeProxy( BatchNode );
