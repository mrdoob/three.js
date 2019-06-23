/**
 * @author Takahiro / https://github.com/takahirox
 */

import {
	DefaultLoadingManager
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

		this.manager = ( manager !== undefined ) ? manager : DefaultLoadingManager;
		this.gltfLoader = new GLTFLoader( this.manager );

	}

	VRMLoader.prototype = {

		constructor: VRMLoader,

		crossOrigin: 'anonymous',

		load: function ( url, onLoad, onProgress, onError ) {

			var scope = this;

			this.gltfLoader.load( url, function ( gltf ) {

				scope.parse( gltf, onLoad );

			}, onProgress, onError );

		},

		setCrossOrigin: function ( value ) {

			this.glTFLoader.setCrossOrigin( value );
			return this;

		},

		setPath: function ( value ) {

			this.glTFLoader.setPath( value );
			return this;

		},

		setResourcePath: function ( value ) {

			this.glTFLoader.setResourcePath( value );
			return this;

		},

		setDRACOLoader: function ( dracoLoader ) {

			this.glTFLoader.setDRACOLoader( dracoLoader );
			return this;

		},

		parse: function ( gltf, onLoad ) {

			// var gltfParser = gltf.parser;
			// var gltfExtensions = gltf.userData.gltfExtensions || {};
			// var vrmExtension = gltfExtensions.VRM || {};

			// handle VRM Extension here

			onLoad( gltf );

		}

	};

	return VRMLoader;

} )();

export { VRMLoader };
