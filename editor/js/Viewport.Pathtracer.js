import * as THREE from 'three';
import { FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass.js';
import {
	PathTracingSceneGenerator,
	PathTracingRenderer,
	PhysicalPathTracingMaterial,
	ProceduralEquirectTexture,
} from 'three-gpu-pathtracer';

function buildColorTexture( color ) {

	const texture = new ProceduralEquirectTexture( 4, 4 );
	texture.generationCallback = ( polar, uv, coord, target ) => {

		target.copy( color );

	};

	texture.update();

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

		pathtracer.reset();

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
		ptMaterial.filterGlossyFactor = 0.5;

		//

		setBackground( scene.background, scene.backgroundBlurriness );
		setEnvironment( scene.environment );

	}

	function setSize( width, height ) {

		if ( pathtracer === null ) return;

		pathtracer.setSize( width, height );
		pathtracer.reset();

	}

	function setBackground( background, blurriness ) {

		if ( pathtracer === null ) return;

		const ptMaterial = pathtracer.material;

		if ( background ) {

			if ( background.isTexture ) {

				ptMaterial.backgroundMap = background;
				ptMaterial.backgroundBlur = blurriness;

			} else if ( background.isColor ) {

				ptMaterial.backgroundMap = buildColorTexture( background );
				ptMaterial.backgroundBlur = 0;

			}

		} else {

			ptMaterial.backgroundMap = buildColorTexture( new THREE.Color( 0 ) );
			ptMaterial.backgroundBlur = 0;

		}

		pathtracer.reset();

	}

	function setEnvironment( environment ) {

		if ( pathtracer === null ) return;

		const ptMaterial = pathtracer.material;

		if ( environment && environment.isDataTexture === true ) {

			// Avoid calling envMapInfo() with the same hdr

			if ( environment !== hdr ) {

				ptMaterial.envMapInfo.updateFrom( environment );
				hdr = environment;

			}

		} else {

			ptMaterial.envMapInfo.updateFrom( buildColorTexture( new THREE.Color( 0 ) ) );

		}

		pathtracer.reset();

	}

	function update() {

		if ( pathtracer === null ) return;

		pathtracer.update();

		if ( pathtracer.samples >= 1 ) {

			renderer.autoClear = false;
			quad.render( renderer );
			renderer.autoClear = true;

		}

	}

	function reset() {

		if ( pathtracer === null ) return;

		pathtracer.reset();

	}

	return {
		init: init,
		setSize: setSize,
		setBackground: setBackground,
		setEnvironment: setEnvironment,
		update: update,
		reset: reset
	};

}

export { ViewportPathtracer };
