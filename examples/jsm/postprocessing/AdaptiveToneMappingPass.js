/**
 * @author miibond
 * Generate a texture that represents the luminosity of the current scene, adapted over time
 * to simulate the optic nerve responding to the amount of light it is receiving.
 * Based on a GDC2007 presentation by Wolfgang Engel titled "Post-Processing Pipeline"
 *
 * Full-screen tone-mapping shader based on http://www.graphics.cornell.edu/~jaf/publications/sig02_paper.pdf
 */

import {
	LinearFilter,
	LinearMipmapLinearFilter,
	MeshBasicMaterial,
	NoBlending,
	RGBAFormat,
	ShaderMaterial,
	UniformsUtils,
	WebGLRenderTarget
} from "../../../build/three.module.js";
import { Pass } from "../postprocessing/Pass.js";
import { CopyShader } from "../shaders/CopyShader.js";
import { LuminosityShader } from "../shaders/LuminosityShader.js";
import { ToneMapShader } from "../shaders/ToneMapShader.js";

var AdaptiveToneMappingPass = function ( adaptive, resolution ) {

	Pass.call( this );

	this.resolution = ( resolution !== undefined ) ? resolution : 256;
	this.needsInit = true;
	this.adaptive = adaptive !== undefined ? !! adaptive : true;

	this.luminanceRT = null;
	this.previousLuminanceRT = null;
	this.currentLuminanceRT = null;

	if ( CopyShader === undefined )
		console.error( "AdaptiveToneMappingPass relies on CopyShader" );

	var copyShader = CopyShader;

	this.copyUniforms = UniformsUtils.clone( copyShader.uniforms );

	this.materialCopy = new ShaderMaterial( {

		uniforms: this.copyUniforms,
		vertexShader: copyShader.vertexShader,
		fragmentShader: copyShader.fragmentShader,
		blending: NoBlending,
		depthTest: false

	} );

	if ( LuminosityShader === undefined )
		console.error( "AdaptiveToneMappingPass relies on LuminosityShader" );

	this.materialLuminance = new ShaderMaterial( {

		uniforms: UniformsUtils.clone( LuminosityShader.uniforms ),
		vertexShader: LuminosityShader.vertexShader,
		fragmentShader: LuminosityShader.fragmentShader,
		blending: NoBlending
	} );

	this.adaptLuminanceShader = {
		defines: {
			"MIP_LEVEL_1X1": ( Math.log( this.resolution ) / Math.log( 2.0 ) ).toFixed( 1 )
		},
		uniforms: {
			"lastLum": { value: null },
			"currentLum": { value: null },
			"minLuminance": { value: 0.01 },
			"delta": { value: 0.016 },
			"tau": { value: 1.0 }
		},
		vertexShader: [
			"varying vec2 vUv;",

			"void main() {",

			"	vUv = uv;",
			"	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"
		].join( '\n' ),
		fragmentShader: [
			"varying vec2 vUv;",

			"uniform sampler2D lastLum;",
			"uniform sampler2D currentLum;",
			"uniform float minLuminance;",
			"uniform float delta;",
			"uniform float tau;",

			"void main() {",

			"	vec4 lastLum = texture2D( lastLum, vUv, MIP_LEVEL_1X1 );",
			"	vec4 currentLum = texture2D( currentLum, vUv, MIP_LEVEL_1X1 );",

			"	float fLastLum = max( minLuminance, lastLum.r );",
			"	float fCurrentLum = max( minLuminance, currentLum.r );",

			//The adaption seems to work better in extreme lighting differences
			//if the input luminance is squared.
			"	fCurrentLum *= fCurrentLum;",

			// Adapt the luminance using Pattanaik's technique
			"	float fAdaptedLum = fLastLum + (fCurrentLum - fLastLum) * (1.0 - exp(-delta * tau));",
			// "fAdaptedLum = sqrt(fAdaptedLum);",
			"	gl_FragColor.r = fAdaptedLum;",
			"}"
		].join( '\n' )
	};

	this.materialAdaptiveLum = new ShaderMaterial( {

		uniforms: UniformsUtils.clone( this.adaptLuminanceShader.uniforms ),
		vertexShader: this.adaptLuminanceShader.vertexShader,
		fragmentShader: this.adaptLuminanceShader.fragmentShader,
		defines: Object.assign( {}, this.adaptLuminanceShader.defines ),
		blending: NoBlending
	} );

	if ( ToneMapShader === undefined )
		console.error( "AdaptiveToneMappingPass relies on ToneMapShader" );

	this.materialToneMap = new ShaderMaterial( {

		uniforms: UniformsUtils.clone( ToneMapShader.uniforms ),
		vertexShader: ToneMapShader.vertexShader,
		fragmentShader: ToneMapShader.fragmentShader,
		blending: NoBlending
	} );

	this.fsQuad = new Pass.FullScreenQuad( null );

};

AdaptiveToneMappingPass.prototype = Object.assign( Object.create( Pass.prototype ), {

	constructor: AdaptiveToneMappingPass,

	render: function ( renderer, writeBuffer, readBuffer, deltaTime/*, maskActive*/ ) {

		if ( this.needsInit ) {

			this.reset( renderer );

			this.luminanceRT.texture.type = readBuffer.texture.type;
			this.previousLuminanceRT.texture.type = readBuffer.texture.type;
			this.currentLuminanceRT.texture.type = readBuffer.texture.type;
			this.needsInit = false;

		}

		if ( this.adaptive ) {

			//Render the luminance of the current scene into a render target with mipmapping enabled
			this.fsQuad.material = this.materialLuminance;
			this.materialLuminance.uniforms.tDiffuse.value = readBuffer.texture;
			renderer.setRenderTarget( this.currentLuminanceRT );
			this.fsQuad.render( renderer );

			//Use the new luminance values, the previous luminance and the frame delta to
			//adapt the luminance over time.
			this.fsQuad.material = this.materialAdaptiveLum;
			this.materialAdaptiveLum.uniforms.delta.value = deltaTime;
			this.materialAdaptiveLum.uniforms.lastLum.value = this.previousLuminanceRT.texture;
			this.materialAdaptiveLum.uniforms.currentLum.value = this.currentLuminanceRT.texture;
			renderer.setRenderTarget( this.luminanceRT );
			this.fsQuad.render( renderer );

			//Copy the new adapted luminance value so that it can be used by the next frame.
			this.fsQuad.material = this.materialCopy;
			this.copyUniforms.tDiffuse.value = this.luminanceRT.texture;
			renderer.setRenderTarget( this.previousLuminanceRT );
			this.fsQuad.render( renderer );

		}

		this.fsQuad.material = this.materialToneMap;
		this.materialToneMap.uniforms.tDiffuse.value = readBuffer.texture;

		if ( this.renderToScreen ) {

			renderer.setRenderTarget( null );
			this.fsQuad.render( renderer );

		} else {

			renderer.setRenderTarget( writeBuffer );

			if ( this.clear ) renderer.clear();

			this.fsQuad.render( renderer );

		}

	},

	reset: function () {

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

		var pars = { minFilter: LinearFilter, magFilter: LinearFilter, format: RGBAFormat }; // was RGB format. changed to RGBA format. see discussion in #8415 / #8450

		this.luminanceRT = new WebGLRenderTarget( this.resolution, this.resolution, pars );
		this.luminanceRT.texture.name = "AdaptiveToneMappingPass.l";
		this.luminanceRT.texture.generateMipmaps = false;

		this.previousLuminanceRT = new WebGLRenderTarget( this.resolution, this.resolution, pars );
		this.previousLuminanceRT.texture.name = "AdaptiveToneMappingPass.pl";
		this.previousLuminanceRT.texture.generateMipmaps = false;

		// We only need mipmapping for the current luminosity because we want a down-sampled version to sample in our adaptive shader
		pars.minFilter = LinearMipmapLinearFilter;
		pars.generateMipmaps = true;
		this.currentLuminanceRT = new WebGLRenderTarget( this.resolution, this.resolution, pars );
		this.currentLuminanceRT.texture.name = "AdaptiveToneMappingPass.cl";

		if ( this.adaptive ) {

			this.materialToneMap.defines[ "ADAPTED_LUMINANCE" ] = "";
			this.materialToneMap.uniforms.luminanceMap.value = this.luminanceRT.texture;

		}

		//Put something in the adaptive luminance texture so that the scene can render initially
		this.fsQuad.material = new MeshBasicMaterial( { color: 0x777777 } );
		this.materialLuminance.needsUpdate = true;
		this.materialAdaptiveLum.needsUpdate = true;
		this.materialToneMap.needsUpdate = true;
		// renderer.render( this.scene, this.camera, this.luminanceRT );
		// renderer.render( this.scene, this.camera, this.previousLuminanceRT );
		// renderer.render( this.scene, this.camera, this.currentLuminanceRT );

	},

	setAdaptive: function ( adaptive ) {

		if ( adaptive ) {

			this.adaptive = true;
			this.materialToneMap.defines[ "ADAPTED_LUMINANCE" ] = "";
			this.materialToneMap.uniforms.luminanceMap.value = this.luminanceRT.texture;

		} else {

			this.adaptive = false;
			delete this.materialToneMap.defines[ "ADAPTED_LUMINANCE" ];
			this.materialToneMap.uniforms.luminanceMap.value = null;

		}

		this.materialToneMap.needsUpdate = true;

	},

	setAdaptionRate: function ( rate ) {

		if ( rate ) {

			this.materialAdaptiveLum.uniforms.tau.value = Math.abs( rate );

		}

	},

	setMinLuminance: function ( minLum ) {

		if ( minLum ) {

			this.materialToneMap.uniforms.minLuminance.value = minLum;
			this.materialAdaptiveLum.uniforms.minLuminance.value = minLum;

		}

	},

	setMaxLuminance: function ( maxLum ) {

		if ( maxLum ) {

			this.materialToneMap.uniforms.maxLuminance.value = maxLum;

		}

	},

	setAverageLuminance: function ( avgLum ) {

		if ( avgLum ) {

			this.materialToneMap.uniforms.averageLuminance.value = avgLum;

		}

	},

	setMiddleGrey: function ( middleGrey ) {

		if ( middleGrey ) {

			this.materialToneMap.uniforms.middleGrey.value = middleGrey;

		}

	},

	dispose: function () {

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

} );

export { AdaptiveToneMappingPass };
