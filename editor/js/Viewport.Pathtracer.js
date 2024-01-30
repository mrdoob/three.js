import * as THREE from 'three';
import { FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass.js';
import {
	PathTracingSceneGenerator,
	PathTracingRenderer,
	PhysicalPathTracingMaterial
} from 'three-gpu-pathtracer';

function ViewportPathtracer( renderer ) {

	let pathtracer = null;
	let quad = null;

	function init( scene, camera ) {

		if ( pathtracer === null ) {

			pathtracer = new PathTracingRenderer( renderer );
			pathtracer.setSize( renderer.domElement.offsetWidth, renderer.domElement.offsetHeight );
			pathtracer.alpha = true;
			pathtracer.camera = camera;
			pathtracer.material = new PhysicalPathTracingMaterial();
			pathtracer.tiles.set( 3, 4 );

			quad = new FullScreenQuad( new THREE.MeshBasicMaterial( {
				map: pathtracer.target.texture,
				blending: THREE.CustomBlending
			} ) );

		}

		pathtracer.material.backgroundBlur = scene.backgroundBlurriness;
		pathtracer.reset();

		const generator = new PathTracingSceneGenerator();
		const { bvh, textures, materials, lights } = generator.generate( scene );

		const ptGeometry = bvh.geometry;
		const ptMaterial = pathtracer.material;

		ptMaterial.bvh.updateFrom( bvh );
		ptMaterial.attributesArray.updateFrom(
			ptGeometry.attributes.normal,
			ptGeometry.attributes.tangent,
			ptGeometry.attributes.uv,
			ptGeometry.attributes.color,
		);
		ptMaterial.materialIndexAttribute.updateFrom( ptGeometry.attributes.materialIndex );
		ptMaterial.textures.setTextures( renderer, 2048, 2048, textures );
		ptMaterial.materials.updateFrom( materials, textures );
		ptMaterial.lights.updateFrom( lights );

		if ( scene.environment && scene.environment.isTexture === true ) {

			ptMaterial.envMapInfo.updateFrom( scene.environment );

		}

	}

	function setSize( width, height ) {

		if ( pathtracer === null ) return;

		pathtracer.setSize( width, height );
		pathtracer.reset();

	}

	function update() {

		if ( pathtracer === null ) return;

		pathtracer.update();

		renderer.autoClear = false;
		quad.render( renderer );
		renderer.autoClear = true;

	}

	function reset() {

		if ( pathtracer === null ) return;

		pathtracer.reset();

	}

	return {
		init: init,
		setSize: setSize,
		update: update,
		reset: reset
	};

}

export { ViewportPathtracer };
