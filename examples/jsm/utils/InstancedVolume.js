import { InstancedMesh, BoxGeometry, Matrix4, Vector3, Quaternion } from 'three';
import { VolumeStandardMaterial } from './VolumeStandardMaterial.js';
import { VolumeGenerator } from './VolumeGenerator.js';

export class InstancedVolume extends InstancedMesh {

	constructor( count, params = {} ) {

		const geometry = new BoxGeometry( 1, 1, 1 );
		const material = new VolumeStandardMaterial( {
			roughness: params.roughness !== undefined ? params.roughness : 1.0,
			metalness: params.metalness !== undefined ? params.metalness : 1.0
		} );

		super( geometry, material, count );

		this.resolution = params.resolution !== undefined ? params.resolution : 100;
		this.margin = params.margin !== undefined ? params.margin : 0.05;
		this.surface = params.surface !== undefined ? params.surface : 0.0;

		this.sdfTexture = null;
		this.inverseBoundsMatrix = new Matrix4();

	}

	async generate( sourceMesh ) {

		// Dispose of the existing SDF texture
		if ( this.sdfTexture ) {

			this.sdfTexture.dispose();

		}

		// Generate the SDF using the shared generator
		const result = await VolumeGenerator.generateSDF( sourceMesh, this.resolution, this.margin );
		this.sdfTexture = result.sdfTexture;
		this.inverseBoundsMatrix = result.inverseBoundsMatrix;

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

		// For instanced mesh, we set the base scale
		// Individual instances can be positioned using setMatrixAt
		this.scale.copy( boundsScale );
		this.position.copy( boundsCenter );
		this.updateMatrix();

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
