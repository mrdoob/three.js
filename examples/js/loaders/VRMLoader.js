/**
 * @author Takahiro / https://github.com/takahirox
 */

// VRM Specification: https://dwango.github.io/vrm/vrm_spec/
//
// VRM is based on glTF 2.0 and VRM extension is defined
// in top-level json.extensions.VRM

THREE.VRMLoader = ( function () {

	function VRMLoader( manager ) {

		if ( THREE.GLTFLoader === undefined ) {

			throw new Error( 'THREE.VRMLoader: Import THREE.GLTFLoader.' );

		}

		THREE.Loader.call( this, manager );

		this.gltfLoader = new THREE.GLTFLoader( this.manager );

	}

	VRMLoader.prototype = Object.assign( Object.create( THREE.Loader.prototype ), {

		constructor: VRMLoader,

		load: function ( url, onLoad, onProgress, onError ) {

			var scope = this;

			this.gltfLoader.load( url, function ( gltf ) {

				scope.parse( gltf, onLoad );

			}, onProgress, onError );

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

	} );

	return VRMLoader;

} )();
