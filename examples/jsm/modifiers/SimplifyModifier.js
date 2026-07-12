import {
	BufferAttribute,
	BufferGeometry
} from 'three';
import { MeshoptSimplifier } from '../libs/meshopt_simplifier.module.js';
import { mergeVertices } from '../utils/BufferGeometryUtils.js';

/**
 * This class can be used to modify a geometry by simplifying it. A typical use
 * case for such a modifier is automatic LOD generation.
 *
 * The implementation is based on [meshoptimizer]{@link https://github.com/zeux/meshoptimizer}.
 * If you only need a simplified index buffer, use {@link MeshoptSimplifier} directly.
 *
 * ```js
 * const modifier = new SimplifyModifier();
 * geometry = await modifier.modify( geometry, count );
 * ```
 *
 * @three_import import { SimplifyModifier } from 'three/addons/modifiers/SimplifyModifier.js';
 */
class SimplifyModifier {

	/**
	 * Returns a new, simplified version of the given geometry. The vertex buffers
	 * of the result only contain vertices referenced by the simplified index.
	 *
	 * @param {BufferGeometry} geometry - The geometry to modify.
	 * @param {number} count - The approximate number of vertices to remove.
	 * @return {Promise<BufferGeometry>} A promise that resolves with the new, modified geometry.
	 */
	async modify( geometry, count ) {

		await MeshoptSimplifier.ready;

		// non-indexed geometries must be welded so the simplifier can collapse edges

		if ( geometry.getIndex() === null ) geometry = mergeVertices( geometry );

		const index = geometry.getIndex();
		const positionAttribute = geometry.getAttribute( 'position' );

		// the simplifier requires tightly packed positions

		const positions = new Float32Array( positionAttribute.count * 3 );

		for ( let i = 0; i < positionAttribute.count; i ++ ) {

			positions[ i * 3 + 0 ] = positionAttribute.getX( i );
			positions[ i * 3 + 1 ] = positionAttribute.getY( i );
			positions[ i * 3 + 2 ] = positionAttribute.getZ( i );

		}

		const ratio = Math.min( 1, Math.max( 0, 1 - count / positionAttribute.count ) );
		const targetIndexCount = Math.max( 3, Math.floor( index.count * ratio / 3 ) * 3 );

		// normals and uvs, when present, contribute to the error metric so collapses
		// that would distort shading or texture seams are penalized

		const normalAttribute = geometry.getAttribute( 'normal' );
		const uvAttribute = geometry.getAttribute( 'uv' );
		const attributeStride = ( normalAttribute ? 3 : 0 ) + ( uvAttribute ? 2 : 0 );

		let indices;

		if ( attributeStride > 0 ) {

			const vertexAttributes = new Float32Array( positionAttribute.count * attributeStride );
			const attributeWeights = [];

			if ( normalAttribute ) attributeWeights.push( 0.25, 0.25, 0.25 );
			if ( uvAttribute ) attributeWeights.push( 0.5, 0.5 );

			for ( let i = 0, o = 0; i < positionAttribute.count; i ++ ) {

				if ( normalAttribute ) {

					vertexAttributes[ o ++ ] = normalAttribute.getX( i );
					vertexAttributes[ o ++ ] = normalAttribute.getY( i );
					vertexAttributes[ o ++ ] = normalAttribute.getZ( i );

				}

				if ( uvAttribute ) {

					vertexAttributes[ o ++ ] = uvAttribute.getX( i );
					vertexAttributes[ o ++ ] = uvAttribute.getY( i );

				}

			}

			indices = MeshoptSimplifier.simplifyWithAttributes( index.array, positions, 3, vertexAttributes, attributeStride, attributeWeights, null, targetIndexCount, 1 )[ 0 ];

		} else {

			indices = MeshoptSimplifier.simplify( index.array, positions, 3, targetIndexCount, 1 )[ 0 ];

		}

		// drop vertices that are no longer referenced and rebuild the attributes

		const [ remap, unique ] = MeshoptSimplifier.compactMesh( indices ); // rewrites indices in place

		const simplifiedGeometry = new BufferGeometry();

		for ( const name in geometry.attributes ) {

			const attribute = geometry.getAttribute( name );
			const itemSize = attribute.itemSize;
			const newAttribute = new BufferAttribute( new attribute.array.constructor( unique * itemSize ), itemSize, attribute.normalized );

			// scatter each vertex to its new slot; 0xffffffff marks unreferenced vertices

			for ( let i = 0; i < remap.length; i ++ ) {

				const target = remap[ i ];

				if ( target === 0xffffffff ) continue;

				for ( let k = 0; k < itemSize; k ++ ) newAttribute.setComponent( target, k, attribute.getComponent( i, k ) );

			}

			simplifiedGeometry.setAttribute( name, newAttribute );

		}

		simplifiedGeometry.setIndex( new BufferAttribute( indices, 1 ) );

		return simplifiedGeometry;

	}

}

export { SimplifyModifier };
