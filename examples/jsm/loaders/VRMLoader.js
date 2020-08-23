import {
	Loader
} from "../../../build/three.module.js";
import { GLTFLoader } from "../loaders/GLTFLoader.js";

// VRM Specification: https://dwango.github.io/vrm/vrm_spec/
//
// VRM is based on glTF 2.0 and VRM extension is defined
// in top-level json.extensions.VRM

var VRMLoader = ( function () {

	function VRMLoader( manager ) {

		if ( GLTFLoader === undefined ) {

			throw new Error( 'THREE.VRMLoader: Import GLTFLoader.' );

		}

		Loader.call( this, manager );

		this.gltfLoader = new GLTFLoader( this.manager );

	}

	VRMLoader.prototype = Object.assign( Object.create( Loader.prototype ), {

		constructor: VRMLoader,

		load: function ( url, onLoad, onProgress, onError ) {

			var scope = this;

			this.gltfLoader.load( url, function ( gltf ) {

				try {

					scope.parse( gltf, onLoad );

				} catch ( e ) {

					if ( onError ) {

						onError( e );

					} else {

						console.error( e );

					}

					scope.manager.itemError( url );

				}

			}, onProgress, onError );

		},

		setDRACOLoader: function ( dracoLoader ) {

			this.gltfLoader.setDRACOLoader( dracoLoader );
			return this;

		},

		parse: function ( gltf, onLoad ) {

			// var gltfParser = gltf.parser;
			// var gltfExtensions = gltf.userData.gltfExtensions || {};
			// var vrmExtension = gltfExtensions.VRM || {};

			// handle VRM Extension here

			onLoad( gltf );

		}

	} );

	return VRMLoader;

} )();

export { VRMLoader };
