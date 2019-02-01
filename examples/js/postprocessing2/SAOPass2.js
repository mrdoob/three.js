/**
 * @author ludobaka / ludobaka.github.io
 * SAO implementation inspired from bhouston previous SAO work
 * @author Oletus / http://oletus.fi/ - ported to EffectComposer2
 */

THREE.SAOPass2 = function ( scene, camera, depthTexture, useNormals, resolution ) {

	THREE.Pass2.call( this );

	this.colorBufferConfig = new THREE.IntermediateBufferConfig();
	this.colorBufferConfig.isInput = true;

	// TODO: Get depth and normal buffers as inputs instead of rendering them here.
	this.bufferConfigs = [ this.colorBufferConfig ];

	this.scene = scene;
	this.camera = camera;

	this.supportsDepthTextureExtension = ( depthTexture !== undefined ) ? depthTexture : false;
	this.supportsNormalTexture = ( useNormals !== undefined ) ? useNormals : false;

	this.originalClearColor = new THREE.Color();
	this.oldClearColor = new THREE.Color();
	this.oldClearAlpha = 1;

	this.params = {
		output: 0,
		saoBias: 0.5,
		saoIntensity: 0.18,
		saoScale: 1,
		saoKernelRadius: 100,
		saoMinResolution: 0,
		saoBlur: true,
		saoBlurRadius: 8,
		saoBlurStdDev: 4,
		saoBlurDepthCutoff: 0.01
	};

	this.resolution = ( resolution !== undefined ) ? new THREE.Vector2( resolution.x, resolution.y ) : new THREE.Vector2( 256, 256 );

	this.saoRenderTarget = new THREE.WebGLRenderTarget( this.resolution.x, this.resolution.y, {
		minFilter: THREE.LinearFilter,
		magFilter: THREE.LinearFilter,
		format: THREE.RGBAFormat
	} );
	this.blurIntermediateRenderTarget = this.saoRenderTarget.clone();

	this.normalRenderTarget = new THREE.WebGLRenderTarget( this.resolution.x, this.resolution.y, {
		minFilter: THREE.NearestFilter,
		magFilter: THREE.NearestFilter,
		format: THREE.RGBAFormat
	} );
	this.depthRenderTarget = this.normalRenderTarget.clone();

	if ( this.supportsDepthTextureExtension ) {

		var depthTexture = new THREE.DepthTexture();
		depthTexture.type = THREE.UnsignedShortType;
		depthTexture.minFilter = THREE.NearestFilter;
		depthTexture.maxFilter = THREE.NearestFilter;

		this.depthRenderTarget.depthTexture = depthTexture;
		this.depthRenderTarget.depthBuffer = true;

	}

	this.depthMaterial = new THREE.MeshDepthMaterial();
	this.depthMaterial.depthPacking = THREE.RGBADepthPacking;
	this.depthMaterial.blending = THREE.NoBlending;

	this.normalMaterial = new THREE.MeshNormalMaterial();
	this.normalMaterial.blending = THREE.NoBlending;

	if ( THREE.SAOShader === undefined ) {

		console.error( 'THREE.SAOPass2 relies on THREE.SAOShader' );

	}

	this.saoMaterial = new THREE.ShaderMaterial( {
		defines: Object.assign( {}, THREE.SAOShader.defines ),
		fragmentShader: THREE.SAOShader.fragmentShader,
		vertexShader: THREE.SAOShader.vertexShader,
		uniforms: THREE.UniformsUtils.clone( THREE.SAOShader.uniforms )
	} );
	this.saoMaterial.extensions.derivatives = true;
	this.saoMaterial.defines[ 'DEPTH_PACKING' ] = this.supportsDepthTextureExtension ? 0 : 1;
	this.saoMaterial.defines[ 'NORMAL_TEXTURE' ] = this.supportsNormalTexture ? 1 : 0;
	this.saoMaterial.defines[ 'PERSPECTIVE_CAMERA' ] = this.camera.isPerspectiveCamera ? 1 : 0;
	this.saoMaterial.uniforms[ 'tDepth' ].value = ( this.supportsDepthTextureExtension ) ? depthTexture : this.depthRenderTarget.texture;
	this.saoMaterial.uniforms[ 'tNormal' ].value = this.normalRenderTarget.texture;
	this.saoMaterial.uniforms[ 'size' ].value.set( this.resolution.x, this.resolution.y );
	this.saoMaterial.uniforms[ 'cameraInverseProjectionMatrix' ].value.getInverse( this.camera.projectionMatrix );
	this.saoMaterial.uniforms[ 'cameraProjectionMatrix' ].value = this.camera.projectionMatrix;
	this.saoMaterial.blending = THREE.NoBlending;

	if ( THREE.DepthLimitedBlurShader === undefined ) {

		console.error( 'THREE.SAOPass relies on THREE.DepthLimitedBlurShader' );

	}

	this.vBlurMaterial = new THREE.ShaderMaterial( {
		uniforms: THREE.UniformsUtils.clone( THREE.DepthLimitedBlurShader.uniforms ),
		defines: Object.assign( {}, THREE.DepthLimitedBlurShader.defines ),
		vertexShader: THREE.DepthLimitedBlurShader.vertexShader,
		fragmentShader: THREE.DepthLimitedBlurShader.fragmentShader
	} );
	this.vBlurMaterial.defines[ 'DEPTH_PACKING' ] = this.supportsDepthTextureExtension ? 0 : 1;
	this.vBlurMaterial.defines[ 'PERSPECTIVE_CAMERA' ] = this.camera.isPerspectiveCamera ? 1 : 0;
	this.vBlurMaterial.uniforms[ 'tDiffuse' ].value = this.saoRenderTarget.texture;
	this.vBlurMaterial.uniforms[ 'tDepth' ].value = ( this.supportsDepthTextureExtension ) ? depthTexture : this.depthRenderTarget.texture;
	this.vBlurMaterial.uniforms[ 'size' ].value.set( this.resolution.x, this.resolution.y );
	this.vBlurMaterial.blending = THREE.NoBlending;

	this.hBlurMaterial = new THREE.ShaderMaterial( {
		uniforms: THREE.UniformsUtils.clone( THREE.DepthLimitedBlurShader.uniforms ),
		defines: Object.assign( {}, THREE.DepthLimitedBlurShader.defines ),
		vertexShader: THREE.DepthLimitedBlurShader.vertexShader,
		fragmentShader: THREE.DepthLimitedBlurShader.fragmentShader
	} );
	this.hBlurMaterial.defines[ 'DEPTH_PACKING' ] = this.supportsDepthTextureExtension ? 0 : 1;
	this.hBlurMaterial.defines[ 'PERSPECTIVE_CAMERA' ] = this.camera.isPerspectiveCamera ? 1 : 0;
	this.hBlurMaterial.uniforms[ 'tDiffuse' ].value = this.blurIntermediateRenderTarget.texture;
	this.hBlurMaterial.uniforms[ 'tDepth' ].value = ( this.supportsDepthTextureExtension ) ? depthTexture : this.depthRenderTarget.texture;
	this.hBlurMaterial.uniforms[ 'size' ].value.set( this.resolution.x, this.resolution.y );
	this.hBlurMaterial.blending = THREE.NoBlending;

	if ( THREE.CopyShader === undefined ) {

		console.error( 'THREE.SAOPass relies on THREE.CopyShader' );

	}

	this.materialCopy = new THREE.ShaderMaterial( {
		uniforms: THREE.UniformsUtils.clone( THREE.CopyShader.uniforms ),
		vertexShader: THREE.CopyShader.vertexShader,
		fragmentShader: THREE.CopyShader.fragmentShader,
		blending: THREE.NoBlending
	} );
	this.materialCopy.transparent = true;
	this.materialCopy.depthTest = false;
	this.materialCopy.depthWrite = false;
	this.materialCopy.blending = THREE.CustomBlending;
	this.materialCopy.blendSrc = THREE.DstColorFactor;
	this.materialCopy.blendDst = THREE.ZeroFactor;
	this.materialCopy.blendEquation = THREE.AddEquation;
	this.materialCopy.blendSrcAlpha = THREE.DstAlphaFactor;
	this.materialCopy.blendDstAlpha = THREE.ZeroFactor;
	this.materialCopy.blendEquationAlpha = THREE.AddEquation;

	if ( THREE.CopyShader === undefined ) {

		console.error( 'THREE.SAOPass relies on THREE.UnpackDepthRGBAShader' );

	}

	this.depthCopy = new THREE.ShaderMaterial( {
		uniforms: THREE.UniformsUtils.clone( THREE.UnpackDepthRGBAShader.uniforms ),
		vertexShader: THREE.UnpackDepthRGBAShader.vertexShader,
		fragmentShader: THREE.UnpackDepthRGBAShader.fragmentShader,
		blending: THREE.NoBlending
	} );

	this.fillQuad = THREE.Pass2.createFillQuadScene();

};

THREE.SAOPass2.OUTPUT = {
	'Beauty': 1,
	'Default': 0,
	'SAO': 2,
	'Depth': 3,
	'Normal': 4
};

THREE.SAOPass2.prototype = Object.assign( Object.create( THREE.Pass2.prototype ), {
	constructor: THREE.SAOPass2,

	render: function ( renderer, buffers, deltaTime, maskActive ) {

		var colorBuffer = buffers[0];

		if ( this.params.output === 1 ) {

			return;

		}

		this.oldClearColor.copy( renderer.getClearColor() );
		this.oldClearAlpha = renderer.getClearAlpha();
		var oldAutoClear = renderer.autoClear;
		renderer.autoClear = false;

		this.saoMaterial.uniforms[ 'bias' ].value = this.params.saoBias;
		this.saoMaterial.uniforms[ 'intensity' ].value = this.params.saoIntensity;
		this.saoMaterial.uniforms[ 'scale' ].value = this.params.saoScale;
		this.saoMaterial.uniforms[ 'kernelRadius' ].value = this.params.saoKernelRadius;
		this.saoMaterial.uniforms[ 'minResolution' ].value = this.params.saoMinResolution;
		this.saoMaterial.uniforms[ 'cameraNear' ].value = this.camera.near;
		this.saoMaterial.uniforms[ 'cameraFar' ].value = this.camera.far;
		// this.saoMaterial.uniforms['randomSeed'].value = Math.random();

		var depthCutoff = this.params.saoBlurDepthCutoff * ( this.camera.far - this.camera.near );
		this.vBlurMaterial.uniforms[ 'depthCutoff' ].value = depthCutoff;
		this.hBlurMaterial.uniforms[ 'depthCutoff' ].value = depthCutoff;

		this.vBlurMaterial.uniforms[ 'cameraNear' ].value = this.camera.near;
		this.vBlurMaterial.uniforms[ 'cameraFar' ].value = this.camera.far;
		this.hBlurMaterial.uniforms[ 'cameraNear' ].value = this.camera.near;
		this.hBlurMaterial.uniforms[ 'cameraFar' ].value = this.camera.far;

		this.params.saoBlurRadius = Math.floor( this.params.saoBlurRadius );
		if ( ( this.prevStdDev !== this.params.saoBlurStdDev ) || ( this.prevNumSamples !== this.params.saoBlurRadius ) ) {

			THREE.BlurShaderUtils.configure( this.vBlurMaterial, this.params.saoBlurRadius, this.params.saoBlurStdDev, new THREE.Vector2( 0, 1 ) );
			THREE.BlurShaderUtils.configure( this.hBlurMaterial, this.params.saoBlurRadius, this.params.saoBlurStdDev, new THREE.Vector2( 1, 0 ) );
			this.prevStdDev = this.params.saoBlurStdDev;
			this.prevNumSamples = this.params.saoBlurRadius;

		}

		// Rendering scene to depth texture
		if ( this.supportsDepthTextureExtension ) {

			renderer.setClearColor( 0x000000 );
			renderer.render( this.scene, this.camera, this.depthRenderTarget, true );

		} else {

			// Clear rule : far clipping plane in both RGBA and Basic encoding
			this.renderOverride( renderer, this.depthMaterial, this.depthRenderTarget, 0x000000, 1.0 );

		}

		if ( this.supportsNormalTexture ) {

			// Clear rule : default normal is facing the camera
			this.renderOverride( renderer, this.normalMaterial, this.normalRenderTarget, 0x7777ff, 1.0 );

		}

		// Rendering SAO texture
		this.renderPass( renderer, this.saoMaterial, this.saoRenderTarget, 0xffffff, 1.0 );

		// Blurring SAO texture
		if ( this.params.saoBlur ) {

			this.renderPass( renderer, this.vBlurMaterial, this.blurIntermediateRenderTarget, 0xffffff, 1.0 );
			this.renderPass( renderer, this.hBlurMaterial, this.saoRenderTarget, 0xffffff, 1.0 );

		}

		var outputMaterial = this.materialCopy;
		// Setting up SAO rendering
		if ( this.params.output === 3 ) {

			if ( this.supportsDepthTextureExtension ) {

				this.materialCopy.uniforms[ 'tDiffuse' ].value = this.depthRenderTarget.depthTexture;
				this.materialCopy.needsUpdate = true;

			} else {

				this.depthCopy.uniforms[ 'tDiffuse' ].value = this.depthRenderTarget.texture;
				this.depthCopy.needsUpdate = true;
				outputMaterial = this.depthCopy;

			}

		} else if ( this.params.output === 4 ) {

			this.materialCopy.uniforms[ 'tDiffuse' ].value = this.normalRenderTarget.texture;
			this.materialCopy.needsUpdate = true;

		} else {

			this.materialCopy.uniforms[ 'tDiffuse' ].value = this.saoRenderTarget.texture;
			this.materialCopy.needsUpdate = true;

		}

		// Blending depends on output, only want a CustomBlending when showing SAO
		if ( this.params.output === 0 ) {

			outputMaterial.blending = THREE.CustomBlending;

		} else {

			outputMaterial.blending = THREE.NoBlending;

		}

		// Rendering SAOPass result on top of previous pass
		this.renderPass( renderer, outputMaterial, colorBuffer );

		renderer.setClearColor( this.oldClearColor, this.oldClearAlpha );
		renderer.autoClear = oldAutoClear;

	},

	renderPass: function ( renderer, passMaterial, renderTarget, clearColor, clearAlpha ) {

		// save original state
		this.originalClearColor.copy( renderer.getClearColor() );
		var originalClearAlpha = renderer.getClearAlpha();

		// setup pass state
		var clearNeeded = ( clearColor !== undefined ) && ( clearColor !== null );
		if ( clearNeeded ) {

			renderer.setClearColor( clearColor );
			renderer.setClearAlpha( clearAlpha || 0.0 );

		}

		this.fillQuad.quad.material = passMaterial;
		THREE.Pass2.renderWithClear( renderer, this.fillQuad.scene, this.fillQuad.camera, renderTarget, clearNeeded );

		// restore original state
		renderer.setClearColor( this.originalClearColor );
		renderer.setClearAlpha( originalClearAlpha );

	},

	renderOverride: function ( renderer, overrideMaterial, renderTarget, clearColor, clearAlpha ) {

		this.originalClearColor.copy( renderer.getClearColor() );
		var originalClearAlpha = renderer.getClearAlpha();

		renderer.setClearColor( clearColor );
		renderer.setClearAlpha( clearAlpha || 0.0 );

		this.scene.overrideMaterial = overrideMaterial;
		renderer.render( this.scene, this.camera, renderTarget, true );
		this.scene.overrideMaterial = null;

		// restore original state
		renderer.setClearColor( this.originalClearColor );
		renderer.setClearAlpha( originalClearAlpha );

	},

	setSize: function ( width, height ) {

		this.saoRenderTarget.setSize( width, height );
		this.blurIntermediateRenderTarget.setSize( width, height );
		this.normalRenderTarget.setSize( width, height );
		this.depthRenderTarget.setSize( width, height );

		this.saoMaterial.uniforms[ 'size' ].value.set( width, height );
		this.saoMaterial.uniforms[ 'cameraInverseProjectionMatrix' ].value.getInverse( this.camera.projectionMatrix );
		this.saoMaterial.uniforms[ 'cameraProjectionMatrix' ].value = this.camera.projectionMatrix;
		this.saoMaterial.needsUpdate = true;

		this.vBlurMaterial.uniforms[ 'size' ].value.set( width, height );
		this.vBlurMaterial.needsUpdate = true;

		this.hBlurMaterial.uniforms[ 'size' ].value.set( width, height );
		this.hBlurMaterial.needsUpdate = true;

	}

} );
