import * as THREE from '../../../../build/three.module.js';
import { AnimationClipCreator } from '../../animation/AnimationClipCreator.js';
import { GLTFLoader } from '../../loaders/GLTFLoader.js';
import { RGBELoader } from '../../loaders/RGBELoader.js';
import { RoughnessMipmapper } from '../../utils/RoughnessMipmapper.js';

var camera, scene, renderer, mixer, clock;

function init( canvas, width, height, pixelRatio, path ) {

	camera = new THREE.PerspectiveCamera( 45, width / height, .25, 20 );
	camera.position.set( 0, 0, 5 );

	scene = new THREE.Scene();
	mixer = new THREE.AnimationMixer( scene );
	mixer.clipAction( AnimationClipCreator.CreateRotationAnimation( 240, 'y' ) )
		.setLoop( THREE.LoopRepeat )
		.play();
	clock = new THREE.Clock();

	new RGBELoader()
		.setDataType( THREE.UnsignedByteType )
		.setPath( path + 'textures/equirectangular/' )
		.load( 'royal_esplanade_1k.hdr', function ( texture ) {

			var envMap = pmremGenerator.fromEquirectangular( texture ).texture;

			scene.background = envMap;
			scene.environment = envMap;

			texture.dispose();
			pmremGenerator.dispose();

			// model

			// use of RoughnessMipmapper is optional
			var roughnessMipmapper = new RoughnessMipmapper( renderer );

			var loader = new GLTFLoader().setPath( path + 'models/gltf/DamagedHelmet/glTF/' );
			loader.load( 'DamagedHelmet.gltf', function ( gltf ) {

				gltf.scene.traverse( function ( child ) {

					if (child.isMesh) {

						roughnessMipmapper.generateMipmaps( child.material );

					}

				} );

				scene.add( gltf.scene );

				roughnessMipmapper.dispose();

			} );

		} );

	renderer = new THREE.WebGLRenderer( { antialias: true, canvas: canvas } );
	renderer.setPixelRatio( pixelRatio );
	renderer.setSize( width, height, false );

	renderer.toneMapping = THREE.ACESFilmicToneMapping;
	renderer.toneMappingExposure = 0.8;
	renderer.outputEncoding = THREE.sRGBEncoding;

	renderer.setAnimationLoop( render );

	var pmremGenerator = new THREE.PMREMGenerator( renderer );
	pmremGenerator.compileEquirectangularShader();

}

function render() {

	mixer.update( clock.getDelta() );

	renderer.render( scene, camera );

}

export default init;
