import { Data3DTexture, DataUtils, RGBAFormat, RGFormat, FloatType, HalfFloatType, LinearFilter, LinearMipmapLinearFilter, Matrix4, Vector3, Vector2, Quaternion, Ray, DoubleSide, Triangle, BoxGeometry } from 'three';
import { ConvexGeometry } from '../geometries/ConvexGeometry.js';

export class VolumeGenerator {

	// Convex hull of the mesh expanded by the margin, in the unit box space of the volume.
	// Rasterizing it instead of the box skips most rays that would miss the surface.
	static generateProxy( geometry, inverseBoundsMatrix, margin ) {

		const position = geometry.attributes.position;
		const points = [];

		for ( let i = 0; i < position.count; i ++ ) {

			points.push( new Vector3().fromBufferAttribute( position, i ) );

		}

		const hull = new ConvexGeometry( points );
		const center = new Vector3().setFromMatrixPosition( new Matrix4().copy( inverseBoundsMatrix ).invert() );

		// Scale about the center so every face moves outward by at least the margin
		const hullPosition = hull.attributes.position;
		const hullNormal = hull.attributes.normal;
		const vertex = new Vector3();
		const normal = new Vector3();
		let minDistance = Infinity;

		for ( let i = 0; i < hullPosition.count; i += 3 ) {

			vertex.fromBufferAttribute( hullPosition, i ).sub( center );
			normal.fromBufferAttribute( hullNormal, i );
			minDistance = Math.min( minDistance, Math.abs( normal.dot( vertex ) ) );

		}

		if ( ! ( minDistance > 1e-6 ) ) return new BoxGeometry( 1, 1, 1 );

		const factor = 1 + margin / minDistance;
		hull.translate( - center.x, - center.y, - center.z ).scale( factor, factor, factor ).translate( center.x, center.y, center.z );
		hull.applyMatrix4( inverseBoundsMatrix );

		return hull;

	}

	static async generateSDF( sourceMesh, resolution, margin ) {

		const dim = resolution;
		const geometry = sourceMesh.geometry;

		// Ensure BVH is computed
		if ( ! geometry.boundsTree ) {

			throw new Error( 'Source mesh geometry must have a BVH. Call geometry.computeBoundsTree() first.' );

		}

		const bvh = geometry.boundsTree;

		const matrix = new Matrix4();
		const center = new Vector3();
		const quat = new Quaternion();
		const scale = new Vector3();

		// Compute the bounding box of the geometry including the margin
		if ( ! geometry.boundingBox ) geometry.computeBoundingBox();

		geometry.boundingBox.getCenter( center );
		scale.subVectors( geometry.boundingBox.max, geometry.boundingBox.min );
		scale.x += 2 * margin;
		scale.y += 2 * margin;
		scale.z += 2 * margin;
		matrix.compose( center, quat, scale );
		const inverseBoundsMatrix = new Matrix4().copy( matrix ).invert();

		const pxWidth = 1 / dim;
		const halfWidth = 0.5 * pxWidth;

		console.log( `Generating ${dim}x${dim}x${dim} SDF texture...` );

		// Create a new 3D data texture
		// Distance and surface normal, sampled at every raymarch step
		const sdfTexture = new Data3DTexture( new Uint16Array( dim ** 3 * 4 ), dim, dim, dim );
		sdfTexture.format = RGBAFormat;
		sdfTexture.type = HalfFloatType;
		sdfTexture.minFilter = LinearMipmapLinearFilter;
		sdfTexture.magFilter = LinearFilter;
		sdfTexture.generateMipmaps = true;

		// Surface UVs, sampled once at the hit
		const uvTexture = new Data3DTexture( new Float32Array( dim ** 3 * 2 ), dim, dim, dim );
		uvTexture.format = RGFormat;
		uvTexture.type = FloatType;
		uvTexture.minFilter = LinearFilter;
		uvTexture.magFilter = LinearFilter;

		const point = new Vector3();
		const target = {
			point: new Vector3(),
			distance: 0,
			faceIndex: - 1
		};
		const uvAttr = geometry.attributes.uv;
		const normalAttr = geometry.attributes.normal;

		// Reusable objects to avoid allocations in the loop
		const ray = new Ray();
		const directions = [
			new Vector3( 1, 0, 0 ),
			new Vector3( - 1, 0, 0 ),
			new Vector3( 0, 1, 0 ),
			new Vector3( 0, - 1, 0 ),
			new Vector3( 0, 0, 1 ),
			new Vector3( 0, 0, - 1 )
		];
		const v0 = new Vector3();
		const v1 = new Vector3();
		const v2 = new Vector3();
		const barycoord = new Vector3();
		const uv0 = new Vector2();
		const uv1 = new Vector2();
		const uv2 = new Vector2();
		const n0 = new Vector3();
		const n1 = new Vector3();
		const n2 = new Vector3();
		const normal = new Vector3();

		// Coarse grid of exact distances. Every voxel gets a Lipschitz lower bound from its surrounding
		// coarse samples, and only voxels whose bound falls inside the band are queried exactly.
		const coarseStep = 4;
		const coarseDim = Math.floor( ( dim - 1 ) / coarseStep ) + 1;
		const coarseDist = new Float32Array( coarseDim ** 3 );
		const voxelSize = new Vector3().copy( scale ).multiplyScalar( pxWidth );
		const band = margin + 2 * Math.max( voxelSize.x, voxelSize.y, voxelSize.z );

		for ( let cx = 0; cx < coarseDim; cx ++ ) {

			for ( let cy = 0; cy < coarseDim; cy ++ ) {

				for ( let cz = 0; cz < coarseDim; cz ++ ) {

					point.set(
						halfWidth + cx * coarseStep * pxWidth - 0.5,
						halfWidth + cy * coarseStep * pxWidth - 0.5,
						halfWidth + cz * coarseStep * pxWidth - 0.5
					).applyMatrix4( matrix );

					bvh.closestPointToPoint( point, target );
					coarseDist[ cx + coarseDim * ( cy + coarseDim * cz ) ] = target.distance;

				}

			}

		}

		function coarseBound( x, y, z ) {

			const cx0 = Math.floor( x / coarseStep );
			const cy0 = Math.floor( y / coarseStep );
			const cz0 = Math.floor( z / coarseStep );
			const cx1 = Math.min( cx0 + 1, coarseDim - 1 );
			const cy1 = Math.min( cy0 + 1, coarseDim - 1 );
			const cz1 = Math.min( cz0 + 1, coarseDim - 1 );
			let bound = 0;

			for ( let i = 0; i < 8; i ++ ) {

				const cx = ( i & 1 ) ? cx1 : cx0;
				const cy = ( i & 2 ) ? cy1 : cy0;
				const cz = ( i & 4 ) ? cz1 : cz0;
				const dx = ( x - cx * coarseStep ) * voxelSize.x;
				const dy = ( y - cy * coarseStep ) * voxelSize.y;
				const dz = ( z - cz * coarseStep ) * voxelSize.z;
				const d = coarseDist[ cx + coarseDim * ( cy + coarseDim * cz ) ] - Math.sqrt( dx * dx + dy * dy + dz * dz );
				if ( d > bound ) bound = d;

			}

			return bound;

		}

		// Iterate over all pixels and check distance
		for ( let x = 0; x < dim; x ++ ) {

			if ( x % 10 === 0 ) {

				console.log( `Processing slice ${x}/${dim}...` );

			}

			for ( let y = 0; y < dim; y ++ ) {

				for ( let z = 0; z < dim; z ++ ) {

					const index = ( x + dim * ( y + dim * z ) ) * 4;

					// Adjust by half width of the pixel so we sample the pixel center
					// and offset by half the box size
					point.set(
						halfWidth + x * pxWidth - 0.5,
						halfWidth + y * pxWidth - 0.5,
						halfWidth + z * pxWidth - 0.5,
					).applyMatrix4( matrix );

					// Get the distance to the geometry
					// Far voxels keep the lower bound, which is all the raymarch needs there
					const bound = coarseBound( x, y, z );

					if ( bound > band ) {

						target.distance = bound;
						target.faceIndex = undefined;

					} else {

						bvh.closestPointToPoint( point, target );

					}

					const dist = target.distance;

					// Check if the point is inside or outside by raycasting
					// Skip expensive raycasts for points far from surface (definitely outside)
					let isInside = false;

					if ( dist < margin ) {

						// If we hit a back face then we're inside
						let insideCount = 0;
						ray.origin.copy( point );

						for ( let i = 0; i < 6; i ++ ) {

							ray.direction.copy( directions[ i ] );
							const hit = bvh.raycastFirst( ray, DoubleSide );
							if ( hit && hit.face.normal.dot( ray.direction ) > 0.0 ) {

								insideCount ++;

							}

						}

						isInside = insideCount > 3;

					}

					// Surface attributes at the closest point
					let u = 0, v = 0;
					normal.set( 0, 0, 0 );

					if ( target.faceIndex !== undefined ) {

						const faceIndex = target.faceIndex;
						const indexAttr = geometry.index;
						const i0 = indexAttr.getX( faceIndex * 3 + 0 );
						const i1 = indexAttr.getX( faceIndex * 3 + 1 );
						const i2 = indexAttr.getX( faceIndex * 3 + 2 );

						v0.fromBufferAttribute( geometry.attributes.position, i0 );
						v1.fromBufferAttribute( geometry.attributes.position, i1 );
						v2.fromBufferAttribute( geometry.attributes.position, i2 );

						Triangle.getBarycoord( target.point, v0, v1, v2, barycoord );

						if ( normalAttr ) {

							n0.fromBufferAttribute( normalAttr, i0 );
							n1.fromBufferAttribute( normalAttr, i1 );
							n2.fromBufferAttribute( normalAttr, i2 );

							normal.addScaledVector( n0, barycoord.x ).addScaledVector( n1, barycoord.y ).addScaledVector( n2, barycoord.z ).normalize();

						} else {

							Triangle.getNormal( v0, v1, v2, normal );

						}

						if ( uvAttr ) {

							uv0.fromBufferAttribute( uvAttr, i0 );
							uv1.fromBufferAttribute( uvAttr, i1 );
							uv2.fromBufferAttribute( uvAttr, i2 );

							u = uv0.x * barycoord.x + uv1.x * barycoord.y + uv2.x * barycoord.z;
							v = uv0.y * barycoord.x + uv1.y * barycoord.y + uv2.y * barycoord.z;

						}

					}

					const data = sdfTexture.image.data;
					data[ index + 0 ] = DataUtils.toHalfFloat( isInside ? - dist : dist );
					data[ index + 1 ] = DataUtils.toHalfFloat( normal.x );
					data[ index + 2 ] = DataUtils.toHalfFloat( normal.y );
					data[ index + 3 ] = DataUtils.toHalfFloat( normal.z );

					const uvIndex = index / 2;
					uvTexture.image.data[ uvIndex + 0 ] = u;
					uvTexture.image.data[ uvIndex + 1 ] = v;

				}

			}

		}

		sdfTexture.needsUpdate = true;
		uvTexture.needsUpdate = true;

		console.log( 'SDF generation completed' );

		return { sdfTexture, uvTexture, inverseBoundsMatrix };

	}

}
