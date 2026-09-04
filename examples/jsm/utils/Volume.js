import { Mesh, BoxGeometry, Matrix4, Vector2, Vector3, Quaternion } from 'three';
import { VolumeStandardMaterial } from './VolumeStandardMaterial.js';
import { VolumeGenerator } from './VolumeGenerator.js';

const _boundsMatrix = new Matrix4();
const _size = new Vector2();

export class Volume extends Mesh {

	constructor( params = {} ) {

		const geometry = new BoxGeometry( 1, 1, 1 );
		const material = new VolumeStandardMaterial( {
			roughness: params.roughness !== undefined ? params.roughness : 1.0,
			metalness: params.metalness !== undefined ? params.metalness : 1.0
		} );

		super( geometry, material );

		this.resolution = params.resolution !== undefined ? params.resolution : 100;
		this.margin = params.margin !== undefined ? params.margin : 0.05;
		this.surface = params.surface !== undefined ? params.surface : 0.0;
		this.proxy = params.proxy !== undefined ? params.proxy : 'hull';

		this.sdfTexture = null;
		this.uvTexture = null;
		this.inverseBoundsMatrix = new Matrix4();

	}

	async generate( sourceMesh ) {

		// Dispose of the existing SDF textures
		if ( this.sdfTexture ) this.sdfTexture.dispose();
		if ( this.uvTexture ) this.uvTexture.dispose();

		// Generate the SDF using the shared generator
		const result = await VolumeGenerator.generateSDF( sourceMesh, this.resolution, this.margin );
		this.sdfTexture = result.sdfTexture;
		this.uvTexture = result.uvTexture;
		this.inverseBoundsMatrix = result.inverseBoundsMatrix;

		// Raster geometry the rays start from
		this.geometry.dispose();
		this.geometry = this.proxy === 'hull' ? VolumeGenerator.generateProxy( sourceMesh.geometry, this.inverseBoundsMatrix, this.margin ) : new BoxGeometry( 1, 1, 1 );

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
		this.material.uniforms.uvTex.value = this.uvTexture;
		this.material.uniforms.normalStep.value.set( depth, depth, depth );
		_boundsMatrix.copy( this.inverseBoundsMatrix ).invert();
		this.material.uniforms.boundsScale.value.setFromMatrixScale( _boundsMatrix );
		this.material.uniforms.surface.value = this.surface;

		// World size of a pixel: scale * view distance + offset
		renderer.getDrawingBufferSize( _size );
		const pixel = 2 / ( camera.projectionMatrix.elements[ 5 ] * _size.y );
		this.material.uniforms.pixelScale.value = camera.isOrthographicCamera ? 0 : pixel;
		this.material.uniforms.pixelOffset.value = camera.isOrthographicCamera ? pixel : 0;

		// Automatically use scene.environment if available
		if ( scene.environment && ! this.material.envMap ) {

			this.material.envMap = scene.environment;
			this.material.needsUpdate = true;

		}

	}

	dispose() {

		if ( this.sdfTexture ) {

			this.sdfTexture.dispose();
			this.sdfTexture = null;

		}

		if ( this.uvTexture ) {

			this.uvTexture.dispose();
			this.uvTexture = null;

		}

		this.geometry.dispose();
		this.material.dispose();

	}

}
