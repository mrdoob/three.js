/**
 * @author miibond
 * Generate a texture that represents the luminosity of the current scene, adapted over time
 * to simulate the optic nerve responding to the amount of light it is receiving.
 * Based on a GDC2007 presentation by Wolfgang Engel titled "Post-Processing Pipeline"
 *
 * Full-screen tone-mapping shader based on http://www.graphics.cornell.edu/~jaf/publications/sig02_paper.pdf
 */

THREE.AdaptiveToneMappingPass = function ( resolution ) {

	resolution = ( resolution !== undefined ) ? resolution : 256;
	this.needsInit = true;

	// render targets
	var pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat };

	this.luminanceRT = new THREE.WebGLRenderTarget( resolution, resolution, pars );
	this.luminanceRT.generateMipmaps = false;
	this.previousLuminanceRT = new THREE.WebGLRenderTarget( resolution, resolution, pars );
	this.previousLuminanceRT.generateMipmaps = false;

	//We only need mipmapping for the current luminosity because we want a down-sampled version to sample in our adaptive shader
	pars.minFilter = THREE.LinearMipMapLinearFilter;
	this.currentLuminanceRT = new THREE.WebGLRenderTarget( resolution, resolution, pars );
	
	if ( THREE.CopyShader === undefined )
		console.error( "THREE.AdaptiveToneMappingPass relies on THREE.CopyShader" );

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
		console.error( "THREE.AdaptiveToneMappingPass relies on THREE.LuminosityShader" );

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
			"delta": { type: 'f', value: 0.016 },
			"tau": { type: 'f', value: 1.0 }
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
			"uniform float tau;",
			THREE.ShaderChunk[ "hdr_decode_pars_fragment" ],
			THREE.ShaderChunk[ "hdr_encode_pars_fragment" ],
			
			"void main() {",
				"vec4 lastLum = texture2D( lastLum, vUv, MIP_LEVEL_1X1 );",
				"vec4 currentLum = texture2D( currentLum, vUv, MIP_LEVEL_1X1 );",
				"#ifdef HDR_INPUT_LOGLUV",
					"float fLastLum = HDRDecodeLOGLUV( lastLum ).r;",
					"float fCurrentLum = HDRDecodeLOGLUV( currentLum ).r;",
				"#elif defined( HDR_INPUT_RGBM )",
					"float fLastLum = HDRDecodeRGBM( lastLum ).r;",
					"float fCurrentLum = HDRDecodeRGBM( currentLum ).r;",
				"#else",
					"float fLastLum = lastLum.r;",
					"float fCurrentLum = currentLum.r;",
				"#endif",
				
				//The adaption seems to work better in extreme lighting differences
				//if the input luminance is squared.
				"fCurrentLum *= fCurrentLum;",

				// Adapt the luminance using Pattanaik's technique
				"float fAdaptedLum = fLastLum + (fCurrentLum - fLastLum) * (1.0 - exp(-delta * tau));",
				"#ifdef HDR_OUTPUT_LOGLUV",
					"gl_FragColor = HDREncodeLOGLUV( vec3( fAdaptedLum ) );",
				"#elif defined( HDR_OUTPUT_RGBM )",
					"gl_FragColor = HDREncodeRGBM( vec3( fAdaptedLum ) );",
				"#else",
					"gl_FragColor = vec4( vec3( fAdaptedLum ), 1.0 );",
				"#endif",
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

	if ( THREE.ToneMapShader === undefined )
		console.error( "THREE.AdaptiveToneMappingPass relies on THREE.ToneMapShader" );

	this.materialToneMap = new THREE.ShaderMaterial( {

		uniforms: THREE.ToneMapShader.uniforms,
		vertexShader: THREE.ToneMapShader.vertexShader,
		fragmentShader: THREE.ToneMapShader.fragmentShader,
		blending: THREE.NoBlending
	} );

	this.materialToneMap.defines["ADAPTED_LUMINANCE"] = "";
	this.materialToneMap.uniforms.luminanceMap.value = this.luminanceRT;

	
	this.enabled = true;
	this.needsSwap = false;
	this.clear = false;

	this.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
	this.scene  = new THREE.Scene();

	this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
	this.scene.add( this.quad );

};

THREE.AdaptiveToneMappingPass.prototype = {

	render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

		if ( this.needsInit ) {
			//If HDR is enabled and the type is full HDR, change the format of the render targets
			if ( renderer.hdrEnabled && renderer.hdrType === THREE.FullHDR ) {
				var extensions = new THREE.WebGLExtensions( renderer.getContext() );
				if ( extensions.get('OES_texture_half_float_linear') ) {
					this.luminanceRT.type = THREE.FloatType;
					this.previousLuminanceRT.type = THREE.FloatType;
					this.currentLuminanceRT.type = THREE.FloatType;
				}
			}
			//Put something in the adaptive luminance texture so that the scene can render initially
			this.quad.material = new THREE.MeshBasicMaterial( {color: 0xffffff });
			renderer.render( this.scene, this.camera, this.luminanceRT );
			renderer.render( this.scene, this.camera, this.previousLuminanceRT );
			// renderer.render( this.scene, this.camera, this.luminanceRT );
			this.needsInit = false;
		}

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
		renderer.render( this.scene, this.camera, this.luminanceRT );

		//Copy the new adapted luminance value so that it can be used by the next frame.
		this.quad.material = this.materialCopy;
		this.copyUniforms.tDiffuse.value = this.luminanceRT;
		renderer.render( this.scene, this.camera, this.previousLuminanceRT );

		this.quad.material = this.materialToneMap;
		this.materialToneMap.uniforms.tDiffuse.value = readBuffer;
		renderer.render( this.scene, this.camera, writeBuffer, this.clear );
		
	},

	setAdaptionRate: function( rate ) {
		if ( rate ) {
			this.materialAdaptiveLum.uniforms.tau.value = Math.abs( rate );
		}
	},

	setMaxLuminance: function( maxLum ) {
		if ( maxLum ) {
			this.materialToneMap.uniforms.maxLuminance.value = maxLum;
		}
	},

	setAverageLuminance: function( avgLum ) {
		if ( avgLum ) {
			this.materialToneMap.uniforms.averageLuminance.value = avgLum;
		}
	},

	setMiddleGrey: function( middleGrey ) {
		if ( middleGrey ) {
			this.materialToneMap.uniforms.middleGrey.value = middleGrey;
		}
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
