import { ACESFilmicToneMapping } from '../../../../src/constants.js';
import { PerspectiveCamera } from '../../../../src/cameras/PerspectiveCamera.js';
import { DirectionalLight } from '../../../../src/lights/DirectionalLight.js';
import { BoxGeometry } from '../../../../src/geometries/BoxGeometry.js';
import { SphereGeometry } from '../../../../src/geometries/SphereGeometry.js';
import { Mesh } from '../../../../src/objects/Mesh.js';
import { MeshPhysicalMaterial } from '../../../../src/materials/MeshPhysicalMaterial.js';
import { MeshStandardMaterial } from '../../../../src/materials/MeshStandardMaterial.js';
import { Scene } from '../../../../src/scenes/Scene.js';
import { WebGLRenderer } from '../../../../src/renderers/WebGLRenderer.js';


function createTransmissionScene() {

	// one opaque and one transmissive object: the transmission pass draws the opaque
	// object into a render target (working color space, no tone mapping) before the
	// main pass draws it with the renderer's output settings

	const scene = new Scene();

	const material = new MeshStandardMaterial();

	// getParameters() runs material.customProgramCacheKey() once per program lookup
	const customProgramCacheKey = material.customProgramCacheKey;
	let programLookups = 0;

	material.customProgramCacheKey = function () {

		programLookups ++;
		return customProgramCacheKey.call( this );

	};

	const mesh = new Mesh( new BoxGeometry( 1, 1, 1 ), material );
	mesh.position.z = - 2;
	scene.add( mesh );

	const transmissiveMesh = new Mesh( new SphereGeometry( 0.5, 16, 8 ), new MeshPhysicalMaterial( { transmission: 1 } ) );
	transmissiveMesh.position.z = - 2;
	scene.add( transmissiveMesh );

	return {
		scene,
		countProgramLookups: function () {

			return programLookups;

		},
		resetProgramLookups: function () {

			programLookups = 0;

		}
	};

}

function createRenderer() {

	const canvas = document.createElement( 'canvas' );

	const renderer = new WebGLRenderer( { canvas } );
	renderer.setSize( 64, 64, false );
	renderer.toneMapping = ACESFilmicToneMapping;

	return renderer;

}

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'WebGLRenderer', () => {

		QUnit.test( 'no repeated program lookups with a transmissive object in view', ( assert ) => {

			const setup = createTransmissionScene();
			const renderer = createRenderer();
			const camera = new PerspectiveCamera();

			// warm up until both output variants of the opaque material have their programs
			// (render target pass and canvas pass)

			renderer.render( setup.scene, camera );
			renderer.render( setup.scene, camera );
			renderer.render( setup.scene, camera );
			renderer.render( setup.scene, camera );

			setup.resetProgramLookups();

			// steady frame: the opaque material is drawn once with the render target's
			// output settings and once with the canvas' output settings

			renderer.render( setup.scene, camera );

			assert.equal( setup.countProgramLookups(), 0, 'no program lookups in a steady frame' );

			renderer.dispose();

		} );

		QUnit.test( 'changing the lights state runs program lookups again', ( assert ) => {

			const setup = createTransmissionScene();
			const renderer = createRenderer();
			const camera = new PerspectiveCamera();

			renderer.render( setup.scene, camera );
			renderer.render( setup.scene, camera );
			renderer.render( setup.scene, camera );
			renderer.render( setup.scene, camera );

			// a lights state change must not keep serving remembered programs

			setup.scene.add( new DirectionalLight( 0xffffff, 1 ) );

			setup.resetProgramLookups();
			renderer.render( setup.scene, camera );

			assert.ok( setup.countProgramLookups() > 0, 'program lookups after a lights change' );

			// each output variant re-runs one lookup for the new lights state; let the
			// state settle, then a steady frame has no lookups again

			setup.resetProgramLookups();
			renderer.render( setup.scene, camera );
			renderer.render( setup.scene, camera );
			renderer.render( setup.scene, camera );

			setup.resetProgramLookups();
			renderer.render( setup.scene, camera );

			assert.equal( setup.countProgramLookups(), 0, 'no program lookups once the new state settled' );

			renderer.dispose();

		} );

	} );

} );
