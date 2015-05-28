/**
 * @author miibond
 * Generate a texture that represents the luminosity of the current scene, adapted over time
 * to simulate the optic nerve responding to the amount of light it is receiving.
 * Based on a GDC2007 presentation by Wolfgang Engel titled "Post-Processing Pipeline"
 *
 * Full-screen tone-mapping shader based on http://www.graphics.cornell.edu/~jaf/publications/sig02_paper.pdf
 */

THREE.AdaptiveToneMappingPass = function ( adaptive, resolution ) {

	this.resolution = ( resolution !== undefined ) ? resolution : 256;
	this.needsInit = true;
	this.adaptive = adaptive !== undefined ? !!adaptive : true;
	this.needsManualDownSample = false;

	this.luminanceRT = null;
	this.previousLuminanceRT = null;
	this.currentLuminanceRTDownSampled = [];
	this.currentLuminanceRT = null;

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

		uniforms: THREE.UniformsUtils.clone( THREE.LuminosityShader.uniforms ),
		vertexShader: THREE.LuminosityShader.vertexShader,
		fragmentShader: THREE.LuminosityShader.fragmentShader,
		blending: THREE.NoBlending,
		name: "Luminance",
		defines: {"MAX_LUMINANCE": ""}
	} );

	this.adaptLuminanceShader = {
		defines: {
			"MIP_LEVEL_1X1" : ( Math.log( this.resolution ) / Math.log( 2.0 ) ).toFixed(1),
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
				
				"#if defined( HDR_INPUT ) && defined( HDR_INPUT_TYPE )",
					"#if ( HDR_INPUT_TYPE == HDR_TYPE_LOGLUV )",
						"float fLastLum = HDRDecodeLOGLUV( lastLum ).r;",
						"float fCurrentLum = HDRDecodeLOGLUV( currentLum ).r;",
					"#elif ( HDR_INPUT_TYPE == HDR_TYPE_RGBM )",
						"float fLastLum = HDRDecodeRGBM( lastLum ).r;",
						"float fCurrentLum = HDRDecodeRGBM( currentLum ).r;",
					"#elif ( HDR_INPUT_TYPE == HDR_TYPE_RGBD )",
						"float fLastLum = HDRDecodeRGBD( lastLum ).r;",
						"float fCurrentLum = HDRDecodeRGBD( currentLum ).r;",
					"#elif ( HDR_INPUT_TYPE == HDR_TYPE_RGBE )",
						"float fLastLum = HDRDecodeRGBE( lastLum ).r;",
						"float fCurrentLum = HDRDecodeRGBE( currentLum ).r;",
					"#else",
						"float fLastLum = lastLum.r;",
						"float fCurrentLum = currentLum.r;",
					"#endif",
				"#else",
						"float fLastLum = lastLum.r;",
						"float fCurrentLum = currentLum.r;",
				"#endif",
				
				//The adaption seems to work better in extreme lighting differences
				//if the input luminance is squared.
				// "fCurrentLum = pow( fCurrentLum, 2.0 );",

				// Adapt the luminance using Pattanaik's technique
				"float fAdaptedLum = fLastLum + (fCurrentLum - fLastLum) * (1.0 - exp(-delta * tau));",
				// "fAdaptedLum = sqrt(fAdaptedLum);",
				"gl_FragColor = vec4( vec3( fAdaptedLum ), 1.0 );",
				THREE.ShaderChunk[ "hdr_encode_fragment" ],
			"}",
		].join('\n')
	};

	this.materialAdaptiveLum = new THREE.ShaderMaterial( {

		uniforms: THREE.UniformsUtils.clone( this.adaptLuminanceShader.uniforms ),
		vertexShader: this.adaptLuminanceShader.vertexShader,
		fragmentShader: this.adaptLuminanceShader.fragmentShader,
		defines: this.adaptLuminanceShader.defines,
		blending: THREE.NoBlending,
		name: "Adaptive Luminance"
	} );

	if ( THREE.ToneMapShader === undefined )
		console.error( "THREE.AdaptiveToneMappingPass relies on THREE.ToneMapShader" );

	this.materialToneMap = new THREE.ShaderMaterial( {

		uniforms: THREE.UniformsUtils.clone( THREE.ToneMapShader.uniforms ),
		vertexShader: THREE.ToneMapShader.vertexShader,
		fragmentShader: THREE.ToneMapShader.fragmentShader,
		blending: THREE.NoBlending,
		name: "Tone Map"
	} );

	this.downSampleShader = {
		// defines: {
		// 	"RESOLUTION" : this.resolution.toFixed(1),
		// },
		uniforms: {
			"tDiffuse": { type: "t", value: null },
			"resolution": { type: "v2", value: new THREE.Vector2() },
			"encode": { type: 'i', value: 1 },
			// "tau": { type: 'f', value: 1.0 }
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
			"uniform sampler2D tDiffuse;",
			"uniform vec2 resolution;",
			THREE.ShaderChunk[ "hdr_decode_pars_fragment" ],
			THREE.ShaderChunk[ "hdr_encode_pars_fragment" ],
			
			"void main() {",
				"vec2 offset = 0.5 / resolution;",
				"vec4 luminosity;",
				"vec4 samples[ 4 ];",

        "samples[0] = texture2D( tDiffuse, vUv + vec2( -offset.x, -offset.x ) );",
        "samples[1] = texture2D( tDiffuse, vUv + vec2( offset.x, -offset.x ) );",
        "samples[2] = texture2D( tDiffuse, vUv + vec2( offset.x, offset.y ) );",
        "samples[3] = texture2D( tDiffuse, vUv + vec2( -offset.x, offset.y ) );",

				"for ( int i = 0; i < 4; i++ ) {",
					"#if defined( HDR_INPUT ) && defined( HDR_INPUT_TYPE )",
						"#if ( HDR_INPUT_TYPE == HDR_TYPE_LOGLUV )",
							"luminosity[ i ] = HDRDecodeLOGLUV( samples[i] ).r;",
						"#elif ( HDR_INPUT_TYPE == HDR_TYPE_RGBM )",
							"luminosity[ i ] = HDRDecodeRGBM( samples[i] ).r;",
						"#elif ( HDR_INPUT_TYPE == HDR_TYPE_RGBD )",
							"luminosity[ i ] = HDRDecodeRGBD( samples[i] ).r;",
						"#elif ( HDR_INPUT_TYPE == HDR_TYPE_RGBE )",
							"luminosity[ i ] = HDRDecodeRGBE( samples[i] ).r;",
						"#else",
							"luminosity[ i ] = samples[i].r;",
						"#endif",
					"#else",
							"luminosity[ i ] = samples[i].r;",
					"#endif",
				"}",

				"float newLum = dot(luminosity, vec4(0.25));",
				
				"gl_FragColor = vec4( vec3( newLum ), 1.0 );",
				THREE.ShaderChunk[ "hdr_encode_fragment" ],
				
			"}",
		].join('\n')
	};
	this.materialDownSample = new THREE.ShaderMaterial( {
		uniforms: this.downSampleShader.uniforms,
		vertexShader: this.downSampleShader.vertexShader,
		fragmentShader: this.downSampleShader.fragmentShader,
		blending: THREE.NoBlending,
		name: "down-sample"
	});

	this.enabled = true;
	this.needsSwap = true;
	this.clear = false;

	this.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
	this.scene  = new THREE.Scene();

	this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
	this.scene.add( this.quad );

};

THREE.AdaptiveToneMappingPass.prototype = {

	render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

		if ( this.needsUpdate ) {
			this.resetRenderTargets( renderer, readBuffer );
			
			this.needsUpdate = false;
		}

		if ( this.adaptive ) {
			//Render the luminance of the current scene into a render target with mipmapping enabled
			this.quad.material = this.materialLuminance;
			this.materialLuminance.uniforms.tDiffuse.value = readBuffer;
			renderer.render( this.scene, this.camera, this.currentLuminanceRT );

			//If we need to generate a 1x1 texture for sampling luminosity (because filtering isn't supported)
			if ( this.needsManualDownSample ) {
				this.downSampleLuminance( renderer );
				this.materialAdaptiveLum.uniforms.currentLum.value = this.currentLuminanceRTDownSampled[ this.currentLuminanceRTDownSampled.length - 1 ];
			}
			else {
				this.materialAdaptiveLum.uniforms.currentLum.value = this.currentLuminanceRT;
			}

			//Use the new luminance values, the previous luminance and the frame delta to
			//adapt the luminance over time.
			this.quad.material = this.materialAdaptiveLum;
			this.materialAdaptiveLum.uniforms.delta.value = delta;
			this.materialAdaptiveLum.uniforms.lastLum.value = this.previousLuminanceRT;
			
			renderer.render( this.scene, this.camera, this.luminanceRT );

			//Copy the new adapted luminance value so that it can be used by the next frame.
			this.quad.material = this.materialCopy;
			this.copyUniforms.tDiffuse.value = this.luminanceRT;
			renderer.render( this.scene, this.camera, this.previousLuminanceRT );
		}

		this.quad.material = this.materialToneMap;
		this.materialToneMap.uniforms.tDiffuse.value = readBuffer;
		renderer.render( this.scene, this.camera, writeBuffer, this.clear );

	},

	downSampleLuminance: function( renderer ) {
		this.quad.material = this.materialDownSample;
		this.materialDownSample.uniforms.tDiffuse.value = this.currentLuminanceRT;
		for ( var i = 0; i < this.currentLuminanceRTDownSampled.length; i++ ) {
			this.materialDownSample.uniforms.resolution.value.x = Math.pow( 2.0, this.currentLuminanceRTDownSampled.length - i );
			this.materialDownSample.uniforms.resolution.value.y = Math.pow( 2.0, this.currentLuminanceRTDownSampled.length - i );
			renderer.render( this.scene, this.camera, this.currentLuminanceRTDownSampled[ i ], true );
			this.materialDownSample.uniforms.tDiffuse.value = this.currentLuminanceRTDownSampled[ i ];
		}

	},

	resetRenderTargets: function( renderer, renderTarget ) {
		var i, res, pars, extensions;
		// render targets
		if ( this.luminanceRT ) {
			this.luminanceRT.dispose();
		}
		if ( this.currentLuminanceRT ) {
			this.currentLuminanceRT.dispose();
		}
		if ( this.previousLuminanceRT ) {
			this.previousLuminanceRT.dispose();
		}
		if ( this.currentLuminanceRTDownSampled ) {
			for ( i = 0; i < this.currentLuminanceRTDownSampled.length; i++ ) {
				this.currentLuminanceRTDownSampled[ i ].dispose();
			}
			this.currentLuminanceRTDownSampled = [];
		}
		pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: renderTarget.format, type: renderTarget.type };

		//Determine if we will let the mipmaps for currentLuminanceRT to be auto-generated or not.
		//For any compressed HDR formats, we'll have to manually down-sample the RT.
		if ( renderTarget.type === THREE.FloatType ) {
			//If we're using a floating point render target, check if the 
			extensions = new THREE.WebGLExtensions( renderer.getContext() );
			if ( extensions.get('OES_texture_half_float_linear') || extensions.get('OES_texture_float_linear') ) {
				//We only need mipmapping for the current luminosity because we want a down-sampled version to sample in our adaptive shader
				this.needsManualDownSample = false;
			}
			else {
				this.needsManualDownSample = true;
			}
		}
		else if ( renderer.hdrOutputEnabled && renderer.hdrOutputType ) {
			this.needsManualDownSample = true;
		}
		else {
			this.needsManualDownSample = false;
			
		}
		if ( this.needsManualDownSample ) {
			pars.minFilter = THREE.NearestFilter;
			pars.magFilter = THREE.NearestFilter;
		}
		else {
			pars.minFilter = THREE.LinearFilter;
			pars.magFilter = THREE.LinearFilter;
		}
		this.luminanceRT = new THREE.WebGLRenderTarget( this.resolution, this.resolution, pars );
		this.luminanceRT.generateMipmaps = false;
		this.previousLuminanceRT = new THREE.WebGLRenderTarget( this.resolution, this.resolution, pars );
		this.previousLuminanceRT.generateMipmaps = false;

		if ( !this.needsManualDownSample ) {
			pars.minFilter = THREE.LinearMipMapLinearFilter;
		}
		this.currentLuminanceRT = new THREE.WebGLRenderTarget( this.resolution, this.resolution, pars );

		if ( this.adaptive ) {
			this.materialToneMap.defines["SAMPLE_LUMINANCE"] = "";
			this.materialToneMap.uniforms.luminanceMap.value = this.luminanceRT;
		}
		//Put something in the adaptive luminance texture so that the scene can render initially
		this.quad.material = new THREE.MeshBasicMaterial( { color: 0x777777 });
		this.materialLuminance.needsUpdate = true;
		this.materialAdaptiveLum.needsUpdate = true;
		this.materialToneMap.needsUpdate = true;
		this.materialDownSample.needsUpdate = true;

		if ( renderer.hdrOutputEnabled ) {
			this.materialLuminance.hdrOutputType = renderer.hdrOutputType;
			this.materialAdaptiveLum.hdrOutputType = renderer.hdrOutputType;
			this.materialDownSample.hdrOutputType = renderer.hdrOutputType;
			this.materialToneMap.hdrOutputEnabled = false;

			this.materialLuminance.hdrInputEnabled = true;
			this.materialLuminance.defines['HDR_INPUT_TYPE'] = renderer.hdrOutputType;
			this.materialAdaptiveLum.hdrInputEnabled = true;
			this.materialAdaptiveLum.defines['HDR_INPUT_TYPE'] = renderer.hdrOutputType;
			this.materialToneMap.hdrInputEnabled = true;
			this.materialToneMap.defines['HDR_INPUT_TYPE'] = renderer.hdrOutputType;	
			this.materialDownSample.hdrInputEnabled = true;
			this.materialDownSample.defines['HDR_INPUT_TYPE'] = renderer.hdrOutputType;	
		}

		if ( this.needsManualDownSample ) {
			this.currentLuminanceRT.generateMipmaps = false;
			this.currentLuminanceRTDownSampled = new Array( parseInt( Math.log2( this.resolution ) ) );
			for ( i = 1; i <= this.currentLuminanceRTDownSampled.length; i++ ) {
				res = parseInt( this.resolution / Math.pow( 2, i ) );
				this.currentLuminanceRTDownSampled[ i - 1 ] = new THREE.WebGLRenderTarget( res, res, pars );
			}
			this.materialAdaptiveLum.defines['MIP_LEVEL_1X1'] = "0.0";
		}
		else {
			this.materialAdaptiveLum.defines['MIP_LEVEL_1X1'] = Math.log2( this.resolution ).toFixed(1);
		}

		this.seedTargets( renderer );
		
	},

	seedTargets: function( renderer ) {
		//Put something in the adaptive luminance texture so that the scene can render initially
		this.quad.material = new THREE.MeshBasicMaterial( {color: 0x777777, opacity: 0.5 });
		renderer.render( this.scene, this.camera, this.luminanceRT );
		renderer.render( this.scene, this.camera, this.previousLuminanceRT );
		renderer.render( this.scene, this.camera, this.currentLuminanceRT );
	},

	setAdaptive: function( adaptive ) {
		if ( adaptive ) {
			this.adaptive = true;
			this.materialToneMap.defines["SAMPLE_LUMINANCE"] = "";
			this.materialToneMap.uniforms.luminanceMap.value = this.luminanceRT;
		}
		else {
			this.adaptive = false;
			delete this.materialToneMap.defines["SAMPLE_LUMINANCE"];
			this.materialToneMap.uniforms.luminanceMap.value = undefined;
		}
		this.materialToneMap.needsUpdate = true;
	},

	setAdaptionRate: function( rate ) {
		if ( rate ) {
			this.materialAdaptiveLum.uniforms.tau.value = Math.abs( rate );
		}
	},

	setMaxLuminance: function( maxLum ) {
		if ( maxLum ) {
			this.materialToneMap.uniforms.maxLuminance.value = maxLum;
			this.materialLuminance.uniforms.maxLuminance.value = maxLum;
			if ( !this.materialLuminance.defines || !this.materialLuminance.defines["MAX_LUMINANCE"] ) {
				this.materialLuminance.defines["MAX_LUMINANCE"] = "";
				this.materialLuminance.needsUpdate = true;
			}
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
		if ( this.materialToneMap ) {
			this.materialToneMap.dispose();
		}
	}

};
