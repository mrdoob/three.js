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

		this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;
		this.gltfLoader = new THREE.GLTFLoader( this.manager );

	}

	VRMLoader.prototype = {

		constructor: VRMLoader,

		crossOrigin: 'Anonymous',

		load: function ( url, onLoad, onProgress, onError ) {

			this.gltfLoader.load( url, onLoad, onProgress, onError );

		},

		setCrossOrigin: function ( value ) {

			this.glTFLoader.setCrossOrigin( value );
			return this;

		},

		setPath: function ( value ) {

			this.glTFLoader.setPath( value );
			return this;

		},

		setDRACOLoader: function ( dracoLoader ) {

			this.glTFLoader.setDRACOLoader( dracoLoader );
			return this;

		}

	};

	return VRMLoader;

} )();
