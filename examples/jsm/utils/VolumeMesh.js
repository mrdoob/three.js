import { Mesh, BoxGeometry, Data3DTexture, RGBAFormat, FloatType, LinearFilter, Matrix4, Vector3, Vector2, Quaternion, Ray, DoubleSide, Triangle } from 'three';
import { RayMarchSDFMaterial } from './RayMarchSDFMaterial.js';

export class VolumeMesh extends Mesh {

	constructor( params = {} ) {

		const geometry = new BoxGeometry( 1, 1, 1 );
		const material = new RayMarchSDFMaterial( {
			roughness: params.roughness !== undefined ? params.roughness : 1.0,
			metalness: params.metalness !== undefined ? params.metalness : 1.0
		} );

		super( geometry, material );

		this.resolution = params.resolution !== undefined ? params.resolution : 100;
		this.margin = params.margin !== undefined ? params.margin : 0.05;
		this.surface = params.surface !== undefined ? params.surface : 0.0;

		this.sdfTexture = null;
		this.inverseBoundsMatrix = new Matrix4();

	}

	async generate( sourceMesh ) {

		const dim = this.resolution;
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
		scale.x += 2 * this.margin;
		scale.y += 2 * this.margin;
		scale.z += 2 * this.margin;
		matrix.compose( center, quat, scale );
		this.inverseBoundsMatrix.copy( matrix ).invert();

		// Dispose of the existing SDF texture
		if ( this.sdfTexture ) {

			this.sdfTexture.dispose();

		}

		const pxWidth = 1 / dim;
		const halfWidth = 0.5 * pxWidth;

		console.log( `Generating ${dim}x${dim}x${dim} SDF texture...` );

		// Create a new 3D data texture
		this.sdfTexture = new Data3DTexture( new Float32Array( dim ** 3 * 4 ), dim, dim, dim );
		this.sdfTexture.format = RGBAFormat;
		this.sdfTexture.type = FloatType;
		this.sdfTexture.minFilter = LinearFilter;
		this.sdfTexture.magFilter = LinearFilter;

		const point = new Vector3();
		const target = {
			point: new Vector3(),
			distance: 0,
			faceIndex: -1
		};
		const uvAttr = geometry.attributes.uv;

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
					bvh.closestPointToPoint( point, target );
					const dist = target.distance;

					// Check if the point is inside or outside by raycasting
					// If we hit a back face then we're inside
					let insideCount = 0;
					const ray = new Ray( point );
					const directions = [
						new Vector3( 1, 0, 0 ),
						new Vector3( -1, 0, 0 ),
						new Vector3( 0, 1, 0 ),
						new Vector3( 0, -1, 0 ),
						new Vector3( 0, 0, 1 ),
						new Vector3( 0, 0, -1 )
					];

					for( let i = 0; i < 6; i ++ ) {
						ray.direction.copy( directions[ i ] );
						const hit = bvh.raycastFirst( ray, DoubleSide );
						if ( hit && hit.face.normal.dot( ray.direction ) > 0.0 ) {
							insideCount ++;
						}
					}

					const isInside = insideCount > 3;

					// Set the distance in the texture data
					this.sdfTexture.image.data[ index + 0 ] = isInside ? - dist : dist;

					// Get UV from closest point
					let u = 0, v = 0;

					if ( uvAttr && target.faceIndex !== undefined ) {

						const faceIndex = target.faceIndex;
						const indexAttr = geometry.index;
						const i0 = indexAttr.getX( faceIndex * 3 + 0 );
						const i1 = indexAttr.getX( faceIndex * 3 + 1 );
						const i2 = indexAttr.getX( faceIndex * 3 + 2 );

						const v0 = new Vector3().fromBufferAttribute( geometry.attributes.position, i0 );
						const v1 = new Vector3().fromBufferAttribute( geometry.attributes.position, i1 );
						const v2 = new Vector3().fromBufferAttribute( geometry.attributes.position, i2 );

						const barycoord = new Vector3();
						Triangle.getBarycoord( target.point, v0, v1, v2, barycoord );

						const uv0 = new Vector2().fromBufferAttribute( uvAttr, i0 );
						const uv1 = new Vector2().fromBufferAttribute( uvAttr, i1 );
						const uv2 = new Vector2().fromBufferAttribute( uvAttr, i2 );

						u = uv0.x * barycoord.x + uv1.x * barycoord.y + uv2.x * barycoord.z;
						v = uv0.y * barycoord.x + uv1.y * barycoord.y + uv2.y * barycoord.z;

					}

					// Store UV in G and B channels
					this.sdfTexture.image.data[ index + 1 ] = u;
					this.sdfTexture.image.data[ index + 2 ] = v;
					this.sdfTexture.image.data[ index + 3 ] = 0; // Alpha unused

				}

			}

		}

		this.sdfTexture.needsUpdate = true;

		console.log( 'SDF generation completed' );

		// Copy textures from source mesh material if available
		if ( sourceMesh.material ) {

			const mat = sourceMesh.material;
			if ( mat.map ) this.material.map = mat.map;
			if ( mat.normalMap ) this.material.normalMap = mat.normalMap;
			if ( mat.metalnessMap ) this.material.metalnessMap = mat.metalnessMap;
			if ( mat.roughnessMap ) this.material.roughnessMap = mat.roughnessMap;
			if ( mat.aoMap ) this.material.aoMap = mat.aoMap;
			if ( mat.envMap ) this.material.envMap = mat.envMap;
			this.material.needsUpdate = true;

		}

		// Set the mesh's scale to match SDF bounds
		const sdfBoundsMatrix = this.inverseBoundsMatrix.clone().invert();
		const boundsCenter = new Vector3();
		const boundsQuat = new Quaternion();
		const boundsScale = new Vector3();
		sdfBoundsMatrix.decompose( boundsCenter, boundsQuat, boundsScale );

		// Apply scale and position
		this.scale.copy( boundsScale );
		this.position.copy( boundsCenter );
		this.updateMatrixWorld();

	}

	onBeforeRender( renderer, scene, camera ) {

		if ( ! this.sdfTexture ) return;

		// Update matrices
		camera.updateMatrixWorld();
		this.updateMatrixWorld();

		const depth = 1 / this.resolution;

		// Update custom uniforms
		this.material.uniforms.sdfTex.value = this.sdfTexture;
		this.material.uniforms.normalStep.value.set( depth, depth, depth );
		this.material.uniforms.surface.value = this.surface;

		// Automatically use scene.environment if available
		if ( scene.environment && ! this.material.envMap ) {

			this.material.envMap = scene.environment;
			this.material.needsUpdate = true;

		}

		// Compute normal matrix: normalMatrix = transpose(inverse(modelViewMatrix))
		// For transforming normals from local space to view space
		const normalMatrix = new Matrix4();
		normalMatrix.copy( this.modelViewMatrix ).invert().transpose();
		this.material.uniforms.sdfNormalMatrix.value.copy( normalMatrix );

	}

	dispose() {

		if ( this.sdfTexture ) {

			this.sdfTexture.dispose();
			this.sdfTexture = null;

		}

		this.geometry.dispose();
		this.material.dispose();

	}

}
