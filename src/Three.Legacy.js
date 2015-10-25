/**
 * @author mrdoob / http://mrdoob.com/
 */

Object.defineProperties( THREE.Light.prototype, {
	onlyShadow: {
		set: function ( value ) {
			console.warn( 'THREE.Light: .onlyShadow has been removed.' );
		}
	},
	shadowCameraFov: {
		set: function ( value ) {
			this.shadow.camera.fov = value;
		}
	},
	shadowCameraLeft: {
		set: function ( value ) {
			this.shadow.camera.left = value;
		}
	},
	shadowCameraRight: {
		set: function ( value ) {
			this.shadow.camera.right = value;
		}
	},
	shadowCameraTop: {
		set: function ( value ) {
			this.shadow.camera.top = value;
		}
	},
	shadowCameraBottom: {
		set: function ( value ) {
			this.shadow.camera.bottom = value;
		}
	},
	shadowCameraNear: {
		set: function ( value ) {
			this.shadow.camera.near = value;
		}
	},
	shadowCameraFar: {
		set: function ( value ) {
			this.shadow.camera.far = value;
		}
	},
	shadowCameraVisible: {
		set: function ( value ) {
			console.warn( 'THREE.Light: .shadowCameraVisible has been removed. Use new THREE.CameraHelper( light.shadow ) instead.' );
		}
	},
	shadowBias: {
		set: function ( value ) {
			this.shadow.bias = value;
		}
	},
	shadowDarkness: {
		set: function ( value ) {
			this.shadow.darkness = value;
		}
	},
	shadowMapWidth: {
		set: function ( value ) {
			this.shadow.mapSize.width = value;
		}
	},
	shadowMapHeight: {
		set: function ( value ) {
			this.shadow.mapSize.height = value;
		}
	}
} );

//

Object.defineProperties( THREE.WebGLRenderer.prototype, {
	supportsFloatTextures: {
		value: function () {
			console.warn( 'THREE.WebGLRenderer: .supportsFloatTextures() is now .extensions.get( \'OES_texture_float\' ).' );
			return this.extensions.get( 'OES_texture_float' );
		}
	},
	supportsHalfFloatTextures: {
		value: function () {
			console.warn( 'THREE.WebGLRenderer: .supportsHalfFloatTextures() is now .extensions.get( \'OES_texture_half_float\' ).' );
			return this.extensions.get( 'OES_texture_half_float' );
		}
	},
	supportsStandardDerivatives: {
		value: function () {
			console.warn( 'THREE.WebGLRenderer: .supportsStandardDerivatives() is now .extensions.get( \'OES_standard_derivatives\' ).' );
			return this.extensions.get( 'OES_standard_derivatives' );
		}
	},
	supportsCompressedTextureS3TC: {
		value: function () {
			console.warn( 'THREE.WebGLRenderer: .supportsCompressedTextureS3TC() is now .extensions.get( \'WEBGL_compressed_texture_s3tc\' ).' );
			return this.extensions.get( 'WEBGL_compressed_texture_s3tc' );
		}
	},
	supportsCompressedTexturePVRTC: {
		value: function () {
			console.warn( 'THREE.WebGLRenderer: .supportsCompressedTexturePVRTC() is now .extensions.get( \'WEBGL_compressed_texture_pvrtc\' ).' );
			return this.extensions.get( 'WEBGL_compressed_texture_pvrtc' );
		}
	},
	supportsBlendMinMax: {
		value: function () {
			console.warn( 'THREE.WebGLRenderer: .supportsBlendMinMax() is now .extensions.get( \'EXT_blend_minmax\' ).' );
			return this.extensions.get( 'EXT_blend_minmax' );
		}
	},
	supportsVertexTextures: {
		value: function () {
			return this.capabilities.vertexTextures;
		}
	},
	supportsInstancedArrays: {
		value: function () {
			console.warn( 'THREE.WebGLRenderer: .supportsInstancedArrays() is now .extensions.get( \'ANGLE_instanced_arrays\' ).' );
			return this.extensions.get( 'ANGLE_instanced_arrays' );
		}
	},
	initMaterial: {
		value: function () {
			console.warn( 'THREE.WebGLRenderer: .initMaterial() has been removed.' );
		}
	},
	addPrePlugin: {
		value: function () {
			console.warn( 'THREE.WebGLRenderer: .addPrePlugin() has been removed.' );
		}
	},
	addPostPlugin: {
		value: function () {
			console.warn( 'THREE.WebGLRenderer: .addPostPlugin() has been removed.' );
		}
	},
	updateShadowMap: {
		value: function () {
			console.warn( 'THREE.WebGLRenderer: .updateShadowMap() has been removed.' );
		}
	},
	shadowMapEnabled: {
		get: function () {
			return this.shadowMap.enabled;
		},
		set: function ( value ) {
			console.warn( 'THREE.WebGLRenderer: .shadowMapEnabled is now .shadowMap.enabled.' );
			this.shadowMap.enabled = value;
		}
	},
	shadowMapType: {
		get: function () {
			return this.shadowMap.type;
		},
		set: function ( value ) {
			console.warn( 'THREE.WebGLRenderer: .shadowMapType is now .shadowMap.type.' );
			this.shadowMap.type = value;
		}
	},
	shadowMapCullFace: {
		get: function () {
			return this.shadowMap.cullFace;
		},
		set: function ( value ) {
			console.warn( 'THREE.WebGLRenderer: .shadowMapCullFace is now .shadowMap.cullFace.' );
			this.shadowMap.cullFace = value;
		}
	},
	shadowMapDebug: {
		get: function () {
			return this.shadowMap.debug;
		},
		set: function ( value ) {
			console.warn( 'THREE.WebGLRenderer: .shadowMapDebug is now .shadowMap.debug.' );
			this.shadowMap.debug = value;
		}
	}
} );

//

THREE.Projector = function () {

	console.error( 'THREE.Projector has been moved to /examples/js/renderers/Projector.js.' );

	this.projectVector = function ( vector, camera ) {

		console.warn( 'THREE.Projector: .projectVector() is now vector.project().' );
		vector.project( camera );

	};

	this.unprojectVector = function ( vector, camera ) {

		console.warn( 'THREE.Projector: .unprojectVector() is now vector.unproject().' );
		vector.unproject( camera );

	};

	this.pickingRay = function ( vector, camera ) {

		console.error( 'THREE.Projector: .pickingRay() is now raycaster.setFromCamera().' );

	};

};

//

THREE.CanvasRenderer = function () {

	console.error( 'THREE.CanvasRenderer has been moved to /examples/js/renderers/CanvasRenderer.js' );

	this.domElement = document.createElement( 'canvas' );
	this.clear = function () {};
	this.render = function () {};
	this.setClearColor = function () {};
	this.setSize = function () {};

};
