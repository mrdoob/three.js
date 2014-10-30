/**
 * @author miibond
 * Generate a texture that represents the luminosity of the current scene, adapted over time
 * to simulate the optic nerve responding to the amount of light it is receiving.
 * Based on a GDC2007 presentation by Wolfgang Engel titled "Post-Processing Pipeline"
 */

THREE.AdaptiveLuminancePass = function ( resolution ) {

	resolution = ( resolution !== undefined ) ? resolution : 256;
	this.needsInit = true;

	// render targets
	var pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat };

	this.luminanceRT = new THREE.WebGLRenderTarget( resolution, resolution, pars );
	this.luminanceRT.generateMipmaps = false;
	//We only need mipmapping for the current luminosity because we want a down-sampled version to sample in our adaptive shader
	this.currentLuminanceRT = new THREE.WebGLRenderTarget( resolution, resolution, { minFilter: THREE.LinearMipMapLinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat } );
	this.previousLuminanceRT = new THREE.WebGLRenderTarget( resolution, resolution, pars );
	this.previousLuminanceRT.generateMipmaps = false;
	
	if ( THREE.CopyShader === undefined )
		console.error( "THREE.AdaptiveLuminancePass relies on THREE.CopyShader" );

	var copyShader = THREE.CopyShader;

	this.copyUniforms = THREE.UniformsUtils.clone( copyShader.uniforms );

	this.materialCopy = new THREE.ShaderMaterial( {

		uniforms: this.copyUniforms,
		vertexShader: copyShader.vertexShader,
		fragmentShader: copyShader.fragmentShader,
		blending: THREE.NoBlending,
		depthTest: false

	} );

	if ( THREE.LuminosityShader === undefined )
		console.error( "THREE.AdaptiveLuminancePass relies on THREE.LuminosityShader" );

	this.materialLuminance = new THREE.ShaderMaterial( {

		uniforms: THREE.LuminosityShader.uniforms,
		vertexShader: THREE.LuminosityShader.vertexShader,
		fragmentShader: THREE.LuminosityShader.fragmentShader,
		blending: THREE.NoBlending,
	} );

	this.adaptLuminanceShader = {
		defines: {
			"MIP_LEVEL_1X1" : Math.log2( resolution ).toFixed(1),
		},
		uniforms: {
			"lastLum": { type: "t", value: null },
			"currentLum": { type: "t", value: null },
			"delta": { type: 'f', value: 0.016 }
		},
		vertexShader: [
			"varying vec2 vUv;",

			"void main() {",

				"vUv = uv;",
				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"
		].join('\n'),
		fragmentShader: [
			"varying vec2 vUv;",

			"uniform sampler2D lastLum;",
			"uniform sampler2D currentLum;",
			"uniform float delta;",
			
			"void main() {",
				"float fLastLum = (texture2D( lastLum, vec2( 0.5 ), MIP_LEVEL_1X1 )).r;",
				"float fCurrentLum = (texture2D( currentLum, vUv, MIP_LEVEL_1X1 )).r;",
				// Adapt the luminance using Pattanaik's technique
				"const float fTau = 8.0;",
				"float fAdaptedLum = fLastLum + (fCurrentLum - fLastLum) * (1.0 - exp(-delta * fTau));",
				"gl_FragColor = vec4( vec3( fAdaptedLum ), 1.0 );",
			"}",
		].join('\n')
	};

	this.materialAdaptiveLum = new THREE.ShaderMaterial( {

		uniforms: this.adaptLuminanceShader.uniforms,
		vertexShader: this.adaptLuminanceShader.vertexShader,
		fragmentShader: this.adaptLuminanceShader.fragmentShader,
		defines: this.adaptLuminanceShader.defines,
		blending: THREE.NoBlending
	} );

	
	this.enabled = true;
	this.needsSwap = false;
	this.clear = false;


	this.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
	this.scene  = new THREE.Scene();

	this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
	this.scene.add( this.quad );

};

THREE.AdaptiveLuminancePass.prototype = {

	render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

		//Put something in the adaptive luminance texture so that the scene can render initially
		// if ( this.needsInit ) {
		// 	this.quad.material = new THREE.MeshBasicMaterial( {color: 0xffffff });
			// renderer.render( this.scene, this.camera, this.luminanceRT );
		// 	this.needsInit = false;
		// }

		//Render the luminance of the current scene into a render target with mipmapping enabled
		this.quad.material = this.materialLuminance;
		this.materialLuminance.uniforms.tDiffuse.value = readBuffer;
		renderer.render( this.scene, this.camera, this.currentLuminanceRT );

		//Use the new luminance values, the previous luminance and the frame delta to
		//adapt the luminance over time.
		this.quad.material = this.materialAdaptiveLum;
		this.materialAdaptiveLum.uniforms.delta.value = delta;
		this.materialAdaptiveLum.uniforms.lastLum.value = this.previousLuminanceRT;
		this.materialAdaptiveLum.uniforms.currentLum.value = this.currentLuminanceRT;
		renderer.render( this.scene, this.camera, this.luminanceRT, true );

		//Copy the new adapted luminance value so that it can be used by the next frame.
		this.quad.material = this.materialCopy;
		this.copyUniforms.tDiffuse.value = this.luminanceRT;
		renderer.render( this.scene, this.camera, this.previousLuminanceRT, this.clear );

		
	},

	dispose: function() {
		if ( this.luminanceRT ) {
			this.luminanceRT.dispose();
		}
		if ( this.previousLuminanceRT ) {
			this.previousLuminanceRT.dispose();
		}
		if ( this.currentLuminanceRT ) {
			this.currentLuminanceRT.dispose();
		}
		if ( this.materialLuminance ) {
			this.materialLuminance.dispose();
		}
		if ( this.materialAdaptiveLum ) {
			this.materialAdaptiveLum.dispose();
		}
		if ( this.materialCopy ) {
			this.materialCopy.dispose();
		}
	}

};
