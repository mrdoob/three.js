import { WebGLRenderer } from "../renderers/WebGLRenderer.js";

Object.defineProperties( WebGLRenderer.prototype, {

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

			console.warn( 'THREE.WebGLRenderer: .shadowMapCullFace has been removed. Set Material.shadowSide instead.' );
			return undefined;

		},
		set: function ( /* value */ ) {

			console.warn( 'THREE.WebGLRenderer: .shadowMapCullFace has been removed. Set Material.shadowSide instead.' );

		}
	},
	context: {
		get: function () {

			console.warn( 'THREE.WebGLRenderer: .context has been removed. Use .getContext() instead.' );
			return this.getContext();

		}
	}

} );

Object.assign( WebGLRenderer.prototype, {

	clearTarget: function ( renderTarget, color, depth, stencil ) {

		console.warn( 'THREE.WebGLRenderer: .clearTarget() has been deprecated. Use .setRenderTarget() and .clear() instead.' );
		this.setRenderTarget( renderTarget );
		this.clear( color, depth, stencil );

	},
	animate: function ( callback ) {

		console.warn( 'THREE.WebGLRenderer: .animate() is now .setAnimationLoop().' );
		this.setAnimationLoop( callback );

	},
	getCurrentRenderTarget: function () {

		console.warn( 'THREE.WebGLRenderer: .getCurrentRenderTarget() is now .getRenderTarget().' );
		return this.getRenderTarget();

	},
	getMaxAnisotropy: function () {

		console.warn( 'THREE.WebGLRenderer: .getMaxAnisotropy() is now .capabilities.getMaxAnisotropy().' );
		return this.capabilities.getMaxAnisotropy();

	},
	getPrecision: function () {

		console.warn( 'THREE.WebGLRenderer: .getPrecision() is now .capabilities.precision.' );
		return this.capabilities.precision;

	},
	resetGLState: function () {

		console.warn( 'THREE.WebGLRenderer: .resetGLState() is now .state.reset().' );
		return this.state.reset();

	},
	supportsFloatTextures: function () {

		console.warn( 'THREE.WebGLRenderer: .supportsFloatTextures() is now .extensions.get( \'OES_texture_float\' ).' );
		return this.extensions.get( 'OES_texture_float' );

	},
	supportsHalfFloatTextures: function () {

		console.warn( 'THREE.WebGLRenderer: .supportsHalfFloatTextures() is now .extensions.get( \'OES_texture_half_float\' ).' );
		return this.extensions.get( 'OES_texture_half_float' );

	},
	supportsStandardDerivatives: function () {

		console.warn( 'THREE.WebGLRenderer: .supportsStandardDerivatives() is now .extensions.get( \'OES_standard_derivatives\' ).' );
		return this.extensions.get( 'OES_standard_derivatives' );

	},
	supportsCompressedTextureS3TC: function () {

		console.warn( 'THREE.WebGLRenderer: .supportsCompressedTextureS3TC() is now .extensions.get( \'WEBGL_compressed_texture_s3tc\' ).' );
		return this.extensions.get( 'WEBGL_compressed_texture_s3tc' );

	},
	supportsCompressedTexturePVRTC: function () {

		console.warn( 'THREE.WebGLRenderer: .supportsCompressedTexturePVRTC() is now .extensions.get( \'WEBGL_compressed_texture_pvrtc\' ).' );
		return this.extensions.get( 'WEBGL_compressed_texture_pvrtc' );

	},
	supportsBlendMinMax: function () {

		console.warn( 'THREE.WebGLRenderer: .supportsBlendMinMax() is now .extensions.get( \'EXT_blend_minmax\' ).' );
		return this.extensions.get( 'EXT_blend_minmax' );

	},
	supportsVertexTextures: function () {

		console.warn( 'THREE.WebGLRenderer: .supportsVertexTextures() is now .capabilities.vertexTextures.' );
		return this.capabilities.vertexTextures;

	},
	supportsInstancedArrays: function () {

		console.warn( 'THREE.WebGLRenderer: .supportsInstancedArrays() is now .extensions.get( \'ANGLE_instanced_arrays\' ).' );
		return this.extensions.get( 'ANGLE_instanced_arrays' );

	},
	enableScissorTest: function ( boolean ) {

		console.warn( 'THREE.WebGLRenderer: .enableScissorTest() is now .setScissorTest().' );
		this.setScissorTest( boolean );

	},
	initMaterial: function () {

		console.warn( 'THREE.WebGLRenderer: .initMaterial() has been removed.' );

	},
	addPrePlugin: function () {

		console.warn( 'THREE.WebGLRenderer: .addPrePlugin() has been removed.' );

	},
	addPostPlugin: function () {

		console.warn( 'THREE.WebGLRenderer: .addPostPlugin() has been removed.' );

	},
	updateShadowMap: function () {

		console.warn( 'THREE.WebGLRenderer: .updateShadowMap() has been removed.' );

	},
	setFaceCulling: function () {

		console.warn( 'THREE.WebGLRenderer: .setFaceCulling() has been removed.' );

	},
	allocTextureUnit: function () {

		console.warn( 'THREE.WebGLRenderer: .allocTextureUnit() has been removed.' );

	},
	setTexture: function () {

		console.warn( 'THREE.WebGLRenderer: .setTexture() has been removed.' );

	},
	setTexture2D: function () {

		console.warn( 'THREE.WebGLRenderer: .setTexture2D() has been removed.' );

	},
	setTextureCube: function () {

		console.warn( 'THREE.WebGLRenderer: .setTextureCube() has been removed.' );

	},
	getActiveMipMapLevel: function () {

		console.warn( 'THREE.WebGLRenderer: .getActiveMipMapLevel() is now .getActiveMipmapLevel().' );
		return this.getActiveMipmapLevel();

	}

} );
