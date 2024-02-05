import * as THREE from 'three';
import { FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass.js';
import {
	PathTracingSceneGenerator,
	PathTracingRenderer,
	PhysicalPathTracingMaterial
} from 'three-gpu-pathtracer';

function buildColorTexture( color ) {

	const data = new Uint8Array( [ color.r * 255, color.g * 255, color.b * 255, 255 ] );
	const texture = new THREE.DataTexture( data, 1, 1, THREE.RGBAFormat );
	texture.needsUpdate = true;

	return texture;

}

function ViewportPathtracer( renderer ) {

	let generator = null;
	let pathtracer = null;
	let quad = null;
	let hdr = null;

	function init( scene, camera ) {

		if ( pathtracer === null ) {

			generator = new PathTracingSceneGenerator();

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

		// TOFIX: If the scene is empty the generator crashes so we render a tiny cube (:

		if ( scene.children.length === 0 ) {

			scene = new THREE.Mesh( new THREE.BoxGeometry( 0.0001, 0.0001, 0.0001 ) );

		}

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

		//

		const background = scene.background;

		if ( background ) {

			if ( background.isTexture ) {

				ptMaterial.backgroundMap = background;

			} else if ( background.isColor ) {

				ptMaterial.backgroundMap = buildColorTexture( background );

			}

		} else {

			ptMaterial.backgroundMap = buildColorTexture( new THREE.Color( 0x000000 ) );

		}

		//

		const environment = scene.environment;

		if ( environment && environment.isTexture === true ) {

			// Avoid calling envMapInfo() with the same hdr

			if ( scene.environment !== hdr ) {

				ptMaterial.envMapInfo.updateFrom( scene.environment );
				hdr = scene.environment;

			}

		} else {

			ptMaterial.envMapInfo.updateFrom( buildColorTexture( new THREE.Color( 0xffffff ) ) );

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
