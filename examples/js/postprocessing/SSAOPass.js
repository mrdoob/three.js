/**
 * @author Mugen87 / https://github.com/Mugen87
 */

THREE.SSAOPass = function ( scene, camera, width, height ) {

	THREE.Pass.call( this );

	this.width = ( width !== undefined ) ? width : 512;
	this.height = ( height !== undefined ) ? height : 512;

	this.clear = true;

	this.camera = camera;
	this.scene = scene;

	this.kernelRadius = 8;
	this.kernelSize = 32;
	this.kernel = [];
	this.noiseTexture = null;
	this.output = 0;

	this.minDistance = 0.005;
	this.maxDistance = 0.1;

	//

	this.generateSampleKernel();
	this.generateRandomKernelRotations();

	// beauty render target with depth buffer

	var depthTexture = new THREE.DepthTexture();
	depthTexture.type = THREE.UnsignedShortType;
	depthTexture.minFilter = THREE.NearestFilter;
	depthTexture.maxFilter = THREE.NearestFilter;

	this.beautyRenderTarget = new THREE.WebGLRenderTarget( this.width, this.height, {
		minFilter: THREE.LinearFilter,
		magFilter: THREE.LinearFilter,
		format: THREE.RGBAFormat,
		depthTexture: depthTexture,
		depthBuffer: true
	} );

	// normal render target

	this.normalRenderTarget = new THREE.WebGLRenderTarget( this.width, this.height, {
		minFilter: THREE.NearestFilter,
		magFilter: THREE.NearestFilter,
		format: THREE.RGBAFormat
	} );

	// ssao render target

	this.ssaoRenderTarget = new THREE.WebGLRenderTarget( this.width, this.height, {
		minFilter: THREE.LinearFilter,
		magFilter: THREE.LinearFilter,
		format: THREE.RGBAFormat
	} );

	this.blurRenderTarget = this.ssaoRenderTarget.clone();

	// ssao material

	if ( THREE.SSAOShader === undefined ) {

		console.error( 'THREE.SSAOPass: The pass relies on THREE.SSAOShader.' );

	}

	this.ssaoMaterial = new THREE.ShaderMaterial( {
		defines: Object.assign( {}, THREE.SSAOShader.defines ),
		uniforms: THREE.UniformsUtils.clone( THREE.SSAOShader.uniforms ),
		vertexShader: THREE.SSAOShader.vertexShader,
		fragmentShader: THREE.SSAOShader.fragmentShader,
		blending: THREE.NoBlending
	} );

	this.ssaoMaterial.uniforms[ 'tDiffuse' ].value = this.beautyRenderTarget.texture;
	this.ssaoMaterial.uniforms[ 'tNormal' ].value = this.normalRenderTarget.texture;
	this.ssaoMaterial.uniforms[ 'tDepth' ].value = this.beautyRenderTarget.depthTexture;
	this.ssaoMaterial.uniforms[ 'tNoise' ].value = this.noiseTexture;
	this.ssaoMaterial.uniforms[ 'kernel' ].value = this.kernel;
	this.ssaoMaterial.uniforms[ 'cameraNear' ].value = this.camera.near;
	this.ssaoMaterial.uniforms[ 'cameraFar' ].value = this.camera.far;
	this.ssaoMaterial.uniforms[ 'resolution' ].value.set( this.width, this.height );
	this.ssaoMaterial.uniforms[ 'cameraProjectionMatrix' ].value.copy( this.camera.projectionMatrix );
	this.ssaoMaterial.uniforms[ 'cameraInverseProjectionMatrix' ].value.getInverse( this.camera.projectionMatrix );

	// normal material

	this.normalMaterial = new THREE.MeshNormalMaterial();
	this.normalMaterial.blending = THREE.NoBlending;

	// blur material

	this.blurMaterial = new THREE.ShaderMaterial( {
		defines: Object.assign( {}, THREE.SSAOBlurShader.defines ),
		uniforms: THREE.UniformsUtils.clone( THREE.SSAOBlurShader.uniforms ),
		vertexShader: THREE.SSAOBlurShader.vertexShader,
		fragmentShader: THREE.SSAOBlurShader.fragmentShader
	} );
	this.blurMaterial.uniforms[ 'tDiffuse' ].value = this.ssaoRenderTarget.texture;
	this.blurMaterial.uniforms[ 'resolution' ].value.set( this.width, this.height );

	// material for rendering the depth

	this.depthRenderMaterial = new THREE.ShaderMaterial( {
		defines: Object.assign( {}, THREE.SSAODepthShader.defines ),
		uniforms: THREE.UniformsUtils.clone( THREE.SSAODepthShader.uniforms ),
		vertexShader: THREE.SSAODepthShader.vertexShader,
		fragmentShader: THREE.SSAODepthShader.fragmentShader,
		blending: THREE.NoBlending
	} );
	this.depthRenderMaterial.uniforms[ 'tDepth' ].value = this.beautyRenderTarget.depthTexture;
	this.depthRenderMaterial.uniforms[ 'cameraNear' ].value = this.camera.near;
	this.depthRenderMaterial.uniforms[ 'cameraFar' ].value = this.camera.far;

	// material for rendering the content of a render target

	this.copyMaterial = new THREE.ShaderMaterial( {
		uniforms: THREE.UniformsUtils.clone( THREE.CopyShader.uniforms ),
		vertexShader: THREE.CopyShader.vertexShader,
		fragmentShader: THREE.CopyShader.fragmentShader,
		transparent: true,
		depthTest: false,
		depthWrite: false,
		blendSrc: THREE.DstColorFactor,
		blendDst: THREE.ZeroFactor,
		blendEquation: THREE.AddEquation,
		blendSrcAlpha: THREE.DstAlphaFactor,
		blendDstAlpha: THREE.ZeroFactor,
		blendEquationAlpha: THREE.AddEquation
	} );

	this.fillQuad = THREE.Pass.createFillQuadScene( null );

	this.originalClearColor = new THREE.Color();

};

THREE.SSAOPass.prototype = Object.assign( Object.create( THREE.Pass.prototype ), {

	constructor: THREE.SSAOPass,

	dispose: function () {

		// dispose render targets

		this.beautyRenderTarget.dispose();
		this.normalRenderTarget.dispose();
		this.ssaoRenderTarget.dispose();
		this.blurRenderTarget.dispose();

		// dispose geometry

		this.quad.geometry.dispose();

		// dispose materials

		this.normalMaterial.dispose();
		this.blurMaterial.dispose();
		this.copyMaterial.dispose();
		this.depthRenderMaterial.dispose();

	},

	render: function ( renderer, writeBuffer /*, readBuffer, deltaTime, maskActive */ ) {

		// render beauty and depth

		renderer.setRenderTarget( this.beautyRenderTarget );
		renderer.clear();
		renderer.render( this.scene, this.camera );

		// render normals

		this.renderOverride( renderer, this.normalMaterial, this.normalRenderTarget, 0x7777ff, 1.0 );

		// render SSAO

		this.ssaoMaterial.uniforms[ 'kernelRadius' ].value = this.kernelRadius;
		this.ssaoMaterial.uniforms[ 'minDistance' ].value = this.minDistance;
		this.ssaoMaterial.uniforms[ 'maxDistance' ].value = this.maxDistance;
		this.renderPass( renderer, this.ssaoMaterial, this.ssaoRenderTarget );

		// render blur

		this.renderPass( renderer, this.blurMaterial, this.blurRenderTarget );

		// output result to screen

		switch ( this.output ) {

			case THREE.SSAOPass.OUTPUT.SSAO:

				this.copyMaterial.uniforms[ 'tDiffuse' ].value = this.ssaoRenderTarget.texture;
				this.copyMaterial.blending = THREE.NoBlending;
				this.renderPass( renderer, this.copyMaterial, null );

				break;

			case THREE.SSAOPass.OUTPUT.Blur:

				this.copyMaterial.uniforms[ 'tDiffuse' ].value = this.blurRenderTarget.texture;
				this.copyMaterial.blending = THREE.NoBlending;
				this.renderPass( renderer, this.copyMaterial, null );

				break;

			case THREE.SSAOPass.OUTPUT.Beauty:

				this.copyMaterial.uniforms[ 'tDiffuse' ].value = this.beautyRenderTarget.texture;
				this.copyMaterial.blending = THREE.NoBlending;
				this.renderPass( renderer, this.copyMaterial, null );

				break;

			case THREE.SSAOPass.OUTPUT.Depth:

				this.renderPass( renderer, this.depthRenderMaterial, null );

				break;

			case THREE.SSAOPass.OUTPUT.Normal:

				this.copyMaterial.uniforms[ 'tDiffuse' ].value = this.normalRenderTarget.texture;
				this.copyMaterial.blending = THREE.NoBlending;
				this.renderPass( renderer, this.copyMaterial, null );

				break;

			case THREE.SSAOPass.OUTPUT.Default:

				this.copyMaterial.uniforms[ 'tDiffuse' ].value = this.beautyRenderTarget.texture;
				this.copyMaterial.blending = THREE.NoBlending;
				this.renderPass( renderer, this.copyMaterial, null );

				this.copyMaterial.uniforms[ 'tDiffuse' ].value = this.blurRenderTarget.texture;
				this.copyMaterial.blending = THREE.CustomBlending;
				this.renderPass( renderer, this.copyMaterial, this.renderToScreen ? null : writeBuffer );

				break;

			default:
				console.warn( 'THREE.SSAOPass: Unknown output type.' );

		}

	},

	renderPass: function ( renderer, passMaterial, renderTarget, clearColor, clearAlpha ) {

		// save original state
		this.originalClearColor.copy( renderer.getClearColor() );
		var originalClearAlpha = renderer.getClearAlpha();
		var originalAutoClear = renderer.autoClear;

		renderer.setRenderTarget( renderTarget );

		// setup pass state
		renderer.autoClear = false;
		if ( ( clearColor !== undefined ) && ( clearColor !== null ) ) {

			renderer.setClearColor( clearColor );
			renderer.setClearAlpha( clearAlpha || 0.0 );
			renderer.clear();

		}

		this.fillQuad.quad.material = passMaterial;
		renderer.render( this.fillQuad.scene, this.fillQuad.camera );

		// restore original state
		renderer.autoClear = originalAutoClear;
		renderer.setClearColor( this.originalClearColor );
		renderer.setClearAlpha( originalClearAlpha );

	},

	renderOverride: function ( renderer, overrideMaterial, renderTarget, clearColor, clearAlpha ) {

		this.originalClearColor.copy( renderer.getClearColor() );
		var originalClearAlpha = renderer.getClearAlpha();
		var originalAutoClear = renderer.autoClear;

		renderer.setRenderTarget( renderTarget );
		renderer.autoClear = false;

		clearColor = overrideMaterial.clearColor || clearColor;
		clearAlpha = overrideMaterial.clearAlpha || clearAlpha;

		if ( ( clearColor !== undefined ) && ( clearColor !== null ) ) {

			renderer.setClearColor( clearColor );
			renderer.setClearAlpha( clearAlpha || 0.0 );
			renderer.clear();

		}

		this.scene.overrideMaterial = overrideMaterial;
		renderer.render( this.scene, this.camera );
		this.scene.overrideMaterial = null;

		// restore original state

		renderer.autoClear = originalAutoClear;
		renderer.setClearColor( this.originalClearColor );
		renderer.setClearAlpha( originalClearAlpha );

	},

	setSize: function ( width, height ) {

		this.width = width;
		this.height = height;

		this.beautyRenderTarget.setSize( width, height );
		this.ssaoRenderTarget.setSize( width, height );
		this.normalRenderTarget.setSize( width, height );
		this.blurRenderTarget.setSize( width, height );

		this.ssaoMaterial.uniforms[ 'resolution' ].value.set( width, height );
		this.ssaoMaterial.uniforms[ 'cameraProjectionMatrix' ].value.copy( this.camera.projectionMatrix );
		this.ssaoMaterial.uniforms[ 'cameraInverseProjectionMatrix' ].value.getInverse( this.camera.projectionMatrix );

		this.blurMaterial.uniforms[ 'resolution' ].value.set( width, height );

	},

	generateSampleKernel: function () {

		var kernelSize = this.kernelSize;
		var kernel = this.kernel;

		for ( var i = 0; i < kernelSize; i ++ ) {

			var sample = new THREE.Vector3();
			sample.x = ( Math.random() * 2 ) - 1;
			sample.y = ( Math.random() * 2 ) - 1;
			sample.z = Math.random();

			sample.normalize();

			var scale = i / kernelSize;
			scale = THREE.Math.lerp( 0.1, 1, scale * scale );
			sample.multiplyScalar( scale );

			kernel.push( sample );

		}

	},

	generateRandomKernelRotations: function () {

		var width = 4, height = 4;

		if ( SimplexNoise === undefined ) {

			console.error( 'THREE.SSAOPass: The pass relies on THREE.SimplexNoise.' );

		}

		var simplex = new SimplexNoise();

		var size = width * height;
		var data = new Float32Array( size * 4 );

		for ( var i = 0; i < size; i ++ ) {

			var stride = i * 4;

			var x = ( Math.random() * 2 ) - 1;
			var y = ( Math.random() * 2 ) - 1;
			var z = 0;

			var noise = simplex.noise3d( x, y, z );

			data[ stride ] = noise;
			data[ stride + 1 ] = noise;
			data[ stride + 2 ] = noise;
			data[ stride + 3 ] = 1;

		}

		this.noiseTexture = new THREE.DataTexture( data, width, height, THREE.RGBAFormat, THREE.FloatType );
		this.noiseTexture.wrapS = THREE.RepeatWrapping;
		this.noiseTexture.wrapT = THREE.RepeatWrapping;
		this.noiseTexture.needsUpdate = true;

	}

} );

THREE.SSAOPass.OUTPUT = {
	'Default': 0,
	'SSAO': 1,
	'Blur': 2,
	'Beauty': 3,
	'Depth': 4,
	'Normal': 5
};
