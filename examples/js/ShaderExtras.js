/**
 * @author alteredq / http://alteredqualia.com/
 * @author zz85 / http://www.lab4games.net/zz85/blog
 *
 * ShaderExtras currently contains:
 *
 *	screen
 *	convolution
 *	film
 * 	bokeh
 *  sepia
 *	dotscreen
 *	vignette
 *  bleachbypass
 *	basic
 *  dofmipmap
 *  focus
 *  triangleBlur
 *  horizontalBlur + verticalBlur
 *  horizontalTiltShift + verticalTiltShift
 *  blend
 *  fxaa
 *  luminosity
 *  colorCorrection
 *  normalmap
 *  ssao
 *  colorify
 *  unpackDepthRGBA
 */

THREE.ShaderExtras = {

	/* -------------------------------------------------------------------------
	//	Full-screen textured quad shader
	 ------------------------------------------------------------------------- */

	'screen': {

		uniforms: {

			tDiffuse: { type: "t", value: 0, texture: null },
			opacity:  { type: "f", value: 1.0 }

		},

		vertexShader: [

			"varying vec2 vUv;",

			"void main() {",

				"vUv = vec2( uv.x, 1.0 - uv.y );",
				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

		].join("\n"),

		fragmentShader: [

			"uniform float opacity;",

			"uniform sampler2D tDiffuse;",

			"varying vec2 vUv;",

			"void main() {",

				"vec4 texel = texture2D( tDiffuse, vUv );",
				"gl_FragColor = opacity * texel;",

			"}"

		].join("\n")

	},

	/* ------------------------------------------------------------------------
	//	Convolution shader
	//	  - ported from o3d sample to WebGL / GLSL
	//			http://o3d.googlecode.com/svn/trunk/samples/convolution.html
	------------------------------------------------------------------------ */

	'convolution': {

		uniforms: {

			"tDiffuse" : 		{ type: "t", value: 0, texture: null },
			"uImageIncrement" : { type: "v2", value: new THREE.Vector2( 0.001953125, 0.0 ) },
			"cKernel" : 		{ type: "fv1", value: [] }

		},

		vertexShader: [

			//"#define KERNEL_SIZE 25.0",

			"uniform vec2 uImageIncrement;",

			"varying vec2 vUv;",

			"void main() {",

				"vUv = uv - ( ( KERNEL_SIZE - 1.0 ) / 2.0 ) * uImageIncrement;",
				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

		].join("\n"),

		fragmentShader: [

			//"#define KERNEL_SIZE 25",
			"uniform float cKernel[ KERNEL_SIZE ];",

			"uniform sampler2D tDiffuse;",
			"uniform vec2 uImageIncrement;",

			"varying vec2 vUv;",

			"void main() {",

				"vec2 imageCoord = vUv;",
				"vec4 sum = vec4( 0.0, 0.0, 0.0, 0.0 );",

				"for( int i = 0; i < KERNEL_SIZE; i ++ ) {",

					"sum += texture2D( tDiffuse, imageCoord ) * cKernel[ i ];",
					"imageCoord += uImageIncrement;",

				"}",

				"gl_FragColor = sum;",

			"}"


		].join("\n")

	},

	/* -------------------------------------------------------------------------

	// Film grain & scanlines shader

	//	- ported from HLSL to WebGL / GLSL
	//	  http://www.truevision3d.com/forums/showcase/staticnoise_colorblackwhite_scanline_shaders-t18698.0.html

	// Screen Space Static Postprocessor
	//
	// Produces an analogue noise overlay similar to a film grain / TV static
	//
	// Original implementation and noise algorithm
	// Pat 'Hawthorne' Shearon
	//
	// Optimized scanlines + noise version with intensity scaling
	// Georg 'Leviathan' Steinrohder

	// This version is provided under a Creative Commons Attribution 3.0 License
	// http://creativecommons.org/licenses/by/3.0/
	 ------------------------------------------------------------------------- */

	'film': {

		uniforms: {

			tDiffuse:   { type: "t", value: 0, texture: null },
			time: 	    { type: "f", value: 0.0 },
			nIntensity: { type: "f", value: 0.5 },
			sIntensity: { type: "f", value: 0.05 },
			sCount: 	{ type: "f", value: 4096 },
			grayscale:  { type: "i", value: 1 }

		},

		vertexShader: [

			"varying vec2 vUv;",

			"void main() {",

				"vUv = vec2( uv.x, 1.0 - uv.y );",
				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

		].join("\n"),

		fragmentShader: [

			// control parameter
			"uniform float time;",

			"uniform bool grayscale;",

			// noise effect intensity value (0 = no effect, 1 = full effect)
			"uniform float nIntensity;",

			// scanlines effect intensity value (0 = no effect, 1 = full effect)
			"uniform float sIntensity;",

			// scanlines effect count value (0 = no effect, 4096 = full effect)
			"uniform float sCount;",

			"uniform sampler2D tDiffuse;",

			"varying vec2 vUv;",

			"void main() {",

				// sample the source
				"vec4 cTextureScreen = texture2D( tDiffuse, vUv );",

				// make some noise
				"float x = vUv.x * vUv.y * time *  1000.0;",
				"x = mod( x, 13.0 ) * mod( x, 123.0 );",
				"float dx = mod( x, 0.01 );",

				// add noise
				"vec3 cResult = cTextureScreen.rgb + cTextureScreen.rgb * clamp( 0.1 + dx * 100.0, 0.0, 1.0 );",

				// get us a sine and cosine
				"vec2 sc = vec2( sin( vUv.y * sCount ), cos( vUv.y * sCount ) );",

				// add scanlines
				"cResult += cTextureScreen.rgb * vec3( sc.x, sc.y, sc.x ) * sIntensity;",

				// interpolate between source and result by intensity
				"cResult = cTextureScreen.rgb + clamp( nIntensity, 0.0,1.0 ) * ( cResult - cTextureScreen.rgb );",

				// convert to grayscale if desired
				"if( grayscale ) {",

					"cResult = vec3( cResult.r * 0.3 + cResult.g * 0.59 + cResult.b * 0.11 );",

				"}",

				"gl_FragColor =  vec4( cResult, cTextureScreen.a );",

			"}"

		].join("\n")

	},


	/* -------------------------------------------------------------------------
	//	Depth-of-field shader with bokeh
	//	ported from GLSL shader by Martins Upitis
	//	http://artmartinsh.blogspot.com/2010/02/glsl-lens-blur-filter-with-bokeh.html
	 ------------------------------------------------------------------------- */

	'bokeh'	: {

	uniforms: { tColor:   { type: "t", value: 0, texture: null },
				tDepth:   { type: "t", value: 1, texture: null },
				focus:    { type: "f", value: 1.0 },
				aspect:   { type: "f", value: 1.0 },
				aperture: { type: "f", value: 0.025 },
				maxblur:  { type: "f", value: 1.0 },
			  },

	vertexShader: [

	"varying vec2 vUv;",

	"void main() {",

		"vUv = vec2( uv.x, 1.0 - uv.y );",
		"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

	"}"

	].join("\n"),

	fragmentShader: [

	"varying vec2 vUv;",

	"uniform sampler2D tColor;",
	"uniform sampler2D tDepth;",

	"uniform float maxblur;",  	// max blur amount
	"uniform float aperture;",	// aperture - bigger values for shallower depth of field

	"uniform float focus;",
	"uniform float aspect;",

	"void main() {",

		"vec2 aspectcorrect = vec2( 1.0, aspect );",

		"vec4 depth1 = texture2D( tDepth, vUv );",

		"float factor = depth1.x - focus;",

		"vec2 dofblur = vec2 ( clamp( factor * aperture, -maxblur, maxblur ) );",

		"vec2 dofblur9 = dofblur * 0.9;",
		"vec2 dofblur7 = dofblur * 0.7;",
		"vec2 dofblur4 = dofblur * 0.4;",

		"vec4 col = vec4( 0.0 );",

		"col += texture2D( tColor, vUv.xy );",
		"col += texture2D( tColor, vUv.xy + ( vec2(  0.0,   0.4  ) * aspectcorrect ) * dofblur );",
		"col += texture2D( tColor, vUv.xy + ( vec2(  0.15,  0.37 ) * aspectcorrect ) * dofblur );",
		"col += texture2D( tColor, vUv.xy + ( vec2(  0.29,  0.29 ) * aspectcorrect ) * dofblur );",
		"col += texture2D( tColor, vUv.xy + ( vec2( -0.37,  0.15 ) * aspectcorrect ) * dofblur );",
		"col += texture2D( tColor, vUv.xy + ( vec2(  0.40,  0.0  ) * aspectcorrect ) * dofblur );",
		"col += texture2D( tColor, vUv.xy + ( vec2(  0.37, -0.15 ) * aspectcorrect ) * dofblur );",
		"col += texture2D( tColor, vUv.xy + ( vec2(  0.29, -0.29 ) * aspectcorrect ) * dofblur );",
		"col += texture2D( tColor, vUv.xy + ( vec2( -0.15, -0.37 ) * aspectcorrect ) * dofblur );",
		"col += texture2D( tColor, vUv.xy + ( vec2(  0.0,  -0.4  ) * aspectcorrect ) * dofblur );",
		"col += texture2D( tColor, vUv.xy + ( vec2( -0.15,  0.37 ) * aspectcorrect ) * dofblur );",
		"col += texture2D( tColor, vUv.xy + ( vec2( -0.29,  0.29 ) * aspectcorrect ) * dofblur );",
		"col += texture2D( tColor, vUv.xy + ( vec2(  0.37,  0.15 ) * aspectcorrect ) * dofblur );",
		"col += texture2D( tColor, vUv.xy + ( vec2( -0.4,   0.0  ) * aspectcorrect ) * dofblur );",
		"col += texture2D( tColor, vUv.xy + ( vec2( -0.37, -0.15 ) * aspectcorrect ) * dofblur );",
		"col += texture2D( tColor, vUv.xy + ( vec2( -0.29, -0.29 ) * aspectcorrect ) * dofblur );",
		"col += texture2D( tColor, vUv.xy + ( vec2(  0.15, -0.37 ) * aspectcorrect ) * dofblur );",

		"col += texture2D( tColor, vUv.xy + ( vec2(  0.15,  0.37 ) * aspectcorrect ) * dofblur9 );",
		"col += texture2D( tColor, vUv.xy + ( vec2( -0.37,  0.15 ) * aspectcorrect ) * dofblur9 );",
		"col += texture2D( tColor, vUv.xy + ( vec2(  0.37, -0.15 ) * aspectcorrect ) * dofblur9 );",
		"col += texture2D( tColor, vUv.xy + ( vec2( -0.15, -0.37 ) * aspectcorrect ) * dofblur9 );",
		"col += texture2D( tColor, vUv.xy + ( vec2( -0.15,  0.37 ) * aspectcorrect ) * dofblur9 );",
		"col += texture2D( tColor, vUv.xy + ( vec2(  0.37,  0.15 ) * aspectcorrect ) * dofblur9 );",
		"col += texture2D( tColor, vUv.xy + ( vec2( -0.37, -0.15 ) * aspectcorrect ) * dofblur9 );",
		"col += texture2D( tColor, vUv.xy + ( vec2(  0.15, -0.37 ) * aspectcorrect ) * dofblur9 );",

		"col += texture2D( tColor, vUv.xy + ( vec2(  0.29,  0.29 ) * aspectcorrect ) * dofblur7 );",
		"col += texture2D( tColor, vUv.xy + ( vec2(  0.40,  0.0  ) * aspectcorrect ) * dofblur7 );",
		"col += texture2D( tColor, vUv.xy + ( vec2(  0.29, -0.29 ) * aspectcorrect ) * dofblur7 );",
		"col += texture2D( tColor, vUv.xy + ( vec2(  0.0,  -0.4  ) * aspectcorrect ) * dofblur7 );",
		"col += texture2D( tColor, vUv.xy + ( vec2( -0.29,  0.29 ) * aspectcorrect ) * dofblur7 );",
		"col += texture2D( tColor, vUv.xy + ( vec2( -0.4,   0.0  ) * aspectcorrect ) * dofblur7 );",
		"col += texture2D( tColor, vUv.xy + ( vec2( -0.29, -0.29 ) * aspectcorrect ) * dofblur7 );",
		"col += texture2D( tColor, vUv.xy + ( vec2(  0.0,   0.4  ) * aspectcorrect ) * dofblur7 );",

		"col += texture2D( tColor, vUv.xy + ( vec2(  0.29,  0.29 ) * aspectcorrect ) * dofblur4 );",
		"col += texture2D( tColor, vUv.xy + ( vec2(  0.4,   0.0  ) * aspectcorrect ) * dofblur4 );",
		"col += texture2D( tColor, vUv.xy + ( vec2(  0.29, -0.29 ) * aspectcorrect ) * dofblur4 );",
		"col += texture2D( tColor, vUv.xy + ( vec2(  0.0,  -0.4  ) * aspectcorrect ) * dofblur4 );",
		"col += texture2D( tColor, vUv.xy + ( vec2( -0.29,  0.29 ) * aspectcorrect ) * dofblur4 );",
		"col += texture2D( tColor, vUv.xy + ( vec2( -0.4,   0.0  ) * aspectcorrect ) * dofblur4 );",
		"col += texture2D( tColor, vUv.xy + ( vec2( -0.29, -0.29 ) * aspectcorrect ) * dofblur4 );",
		"col += texture2D( tColor, vUv.xy + ( vec2(  0.0,   0.4  ) * aspectcorrect ) * dofblur4 );",

		"gl_FragColor = col / 41.0;",
		"gl_FragColor.a = 1.0;",

	"}"

	].join("\n")

	},

	/* -------------------------------------------------------------------------
	//	Depth-of-field shader using mipmaps
	//	- from Matt Handley @applmak
	//	- requires power-of-2 sized render target with enabled mipmaps
	 ------------------------------------------------------------------------- */

	'dofmipmap': {

		uniforms: {

			tColor:   { type: "t", value: 0, texture: null },
			tDepth:   { type: "t", value: 1, texture: null },
			focus:    { type: "f", value: 1.0 },
			maxblur:  { type: "f", value: 1.0 }

		},

		vertexShader: [

			"varying vec2 vUv;",

			"void main() {",

				"vUv = vec2( uv.x, 1.0 - uv.y );",
				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

		].join("\n"),

		fragmentShader: [

			"uniform float focus;",
			"uniform float maxblur;",

			"uniform sampler2D tColor;",
			"uniform sampler2D tDepth;",

			"varying vec2 vUv;",

			"void main() {",

				"vec4 depth = texture2D( tDepth, vUv );",

				"float factor = depth.x - focus;",

				"vec4 col = texture2D( tColor, vUv, 2.0 * maxblur * abs( focus - depth.x ) );",

				"gl_FragColor = col;",
				"gl_FragColor.a = 1.0;",

			"}"

		].join("\n")

	},

	/* -------------------------------------------------------------------------
	//	Sepia tone shader
	//  - based on glfx.js sepia shader
	//		https://github.com/evanw/glfx.js
	 ------------------------------------------------------------------------- */

	'sepia': {

		uniforms: {

			tDiffuse: { type: "t", value: 0, texture: null },
			amount:   { type: "f", value: 1.0 }

		},

		vertexShader: [

			"varying vec2 vUv;",

			"void main() {",

				"vUv = vec2( uv.x, 1.0 - uv.y );",
				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

		].join("\n"),

		fragmentShader: [

			"uniform float amount;",

			"uniform sampler2D tDiffuse;",

			"varying vec2 vUv;",

			"void main() {",

				"vec4 color = texture2D( tDiffuse, vUv );",
				"vec3 c = color.rgb;",

				"color.r = dot( c, vec3( 1.0 - 0.607 * amount, 0.769 * amount, 0.189 * amount ) );",
				"color.g = dot( c, vec3( 0.349 * amount, 1.0 - 0.314 * amount, 0.168 * amount ) );",
				"color.b = dot( c, vec3( 0.272 * amount, 0.534 * amount, 1.0 - 0.869 * amount ) );",

				"gl_FragColor = vec4( min( vec3( 1.0 ), color.rgb ), color.a );",

			"}"

		].join("\n")

	},

	/* -------------------------------------------------------------------------
	//	Dot screen shader
	//  - based on glfx.js sepia shader
	//		https://github.com/evanw/glfx.js
	 ------------------------------------------------------------------------- */

	'dotscreen': {

		uniforms: {

			tDiffuse: { type: "t", value: 0, texture: null },
			tSize:    { type: "v2", value: new THREE.Vector2( 256, 256 ) },
			center:   { type: "v2", value: new THREE.Vector2( 0.5, 0.5 ) },
			angle:	  { type: "f", value: 1.57 },
			scale:	  { type: "f", value: 1.0 }

		},

		vertexShader: [

			"varying vec2 vUv;",

			"void main() {",

				"vUv = vec2( uv.x, 1.0 - uv.y );",
				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

		].join("\n"),

		fragmentShader: [

			"uniform vec2 center;",
			"uniform float angle;",
			"uniform float scale;",
			"uniform vec2 tSize;",

			"uniform sampler2D tDiffuse;",

			"varying vec2 vUv;",

			"float pattern() {",

				"float s = sin( angle ), c = cos( angle );",

				"vec2 tex = vUv * tSize - center;",
				"vec2 point = vec2( c * tex.x - s * tex.y, s * tex.x + c * tex.y ) * scale;",

				"return ( sin( point.x ) * sin( point.y ) ) * 4.0;",

			"}",

			"void main() {",

				"vec4 color = texture2D( tDiffuse, vUv );",

				"float average = ( color.r + color.g + color.b ) / 3.0;",

				"gl_FragColor = vec4( vec3( average * 10.0 - 5.0 + pattern() ), color.a );",

			"}"

		].join("\n")

	},

	/* ------------------------------------------------------------------------------------------------
	//	Vignette shader
	//	- based on PaintEffect postprocess from ro.me
	//		http://code.google.com/p/3-dreams-of-black/source/browse/deploy/js/effects/PaintEffect.js
	 ------------------------------------------------------------------------------------------------ */

	'vignette': {

		uniforms: {

			tDiffuse: { type: "t", value: 0, texture: null },
			offset:   { type: "f", value: 1.0 },
			darkness: { type: "f", value: 1.0 }

		},

		vertexShader: [

			"varying vec2 vUv;",

			"void main() {",

				"vUv = vec2( uv.x, 1.0 - uv.y );",
				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

		].join("\n"),

		fragmentShader: [

			"uniform float offset;",
			"uniform float darkness;",

			"uniform sampler2D tDiffuse;",

			"varying vec2 vUv;",

			"void main() {",

				// Eskil's vignette

				"vec4 texel = texture2D( tDiffuse, vUv );",
				"vec2 uv = ( vUv - vec2( 0.5 ) ) * vec2( offset );",
				"gl_FragColor = vec4( mix( texel.rgb, vec3( 1.0 - darkness ), dot( uv, uv ) ), texel.a );",

				/*
				// alternative version from glfx.js
				// this one makes more "dusty" look (as opposed to "burned")

				"vec4 color = texture2D( tDiffuse, vUv );",
				"float dist = distance( vUv, vec2( 0.5 ) );",
				"color.rgb *= smoothstep( 0.8, offset * 0.799, dist *( darkness + offset ) );",
				"gl_FragColor = color;",
				*/

			"}"

		].join("\n")

	},

	/* -------------------------------------------------------------------------
	//	Bleach bypass shader [http://en.wikipedia.org/wiki/Bleach_bypass]
	//	- based on Nvidia example
	//		http://developer.download.nvidia.com/shaderlibrary/webpages/shader_library.html#post_bleach_bypass
	 ------------------------------------------------------------------------- */

	'bleachbypass': {

		uniforms: {

			tDiffuse: { type: "t", value: 0, texture: null },
			opacity:  { type: "f", value: 1.0 }

		},

		vertexShader: [

			"varying vec2 vUv;",

			"void main() {",

				"vUv = vec2( uv.x, 1.0 - uv.y );",
				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

		].join("\n"),

		fragmentShader: [

			"uniform float opacity;",

			"uniform sampler2D tDiffuse;",

			"varying vec2 vUv;",

			"void main() {",

				"vec4 base = texture2D( tDiffuse, vUv );",

				"vec3 lumCoeff = vec3( 0.25, 0.65, 0.1 );",
				"float lum = dot( lumCoeff, base.rgb );",
				"vec3 blend = vec3( lum );",

				"float L = min( 1.0, max( 0.0, 10.0 * ( lum - 0.45 ) ) );",

				"vec3 result1 = 2.0 * base.rgb * blend;",
				"vec3 result2 = 1.0 - 2.0 * ( 1.0 - blend ) * ( 1.0 - base.rgb );",

				"vec3 newColor = mix( result1, result2, L );",

				"float A2 = opacity * base.a;",
				"vec3 mixRGB = A2 * newColor.rgb;",
				"mixRGB += ( ( 1.0 - A2 ) * base.rgb );",

				"gl_FragColor = vec4( mixRGB, base.a );",

			"}"

		].join("\n")

	},

	/* --------------------------------------------------------------------------------------------------
	//	Focus shader
	//	- based on PaintEffect postprocess from ro.me
	//		http://code.google.com/p/3-dreams-of-black/source/browse/deploy/js/effects/PaintEffect.js
	 -------------------------------------------------------------------------------------------------- */

	'focus': {

		uniforms : {

			"tDiffuse": 		{ type: "t", value: 0, texture: null },
			"screenWidth": 		{ type: "f", value: 1024 },
			"screenHeight": 	{ type: "f", value: 1024 },
			"sampleDistance": 	{ type: "f", value: 0.94 },
			"waveFactor": 		{ type: "f", value: 0.00125 }

		},

		vertexShader: [

			"varying vec2 vUv;",

			"void main() {",

				"vUv = vec2( uv.x, 1.0 - uv.y );",
				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

		].join("\n"),

		fragmentShader: [

			"uniform float screenWidth;",
			"uniform float screenHeight;",
			"uniform float sampleDistance;",
			"uniform float waveFactor;",

			"uniform sampler2D tDiffuse;",

			"varying vec2 vUv;",

			"void main() {",

				"vec4 color, org, tmp, add;",
				"float sample_dist, f;",
				"vec2 vin;",
				"vec2 uv = vUv;",

				"add += color = org = texture2D( tDiffuse, uv );",

				"vin = ( uv - vec2( 0.5 ) ) * vec2( 1.4 );",
				"sample_dist = dot( vin, vin ) * 2.0;",

				"f = ( waveFactor * 100.0 + sample_dist ) * sampleDistance * 4.0;",

				"vec2 sampleSize = vec2(  1.0 / screenWidth, 1.0 / screenHeight ) * vec2( f );",

				"add += tmp = texture2D( tDiffuse, uv + vec2( 0.111964, 0.993712 ) * sampleSize );",
				"if( tmp.b < color.b ) color = tmp;",

				"add += tmp = texture2D( tDiffuse, uv + vec2( 0.846724, 0.532032 ) * sampleSize );",
				"if( tmp.b < color.b ) color = tmp;",

				"add += tmp = texture2D( tDiffuse, uv + vec2( 0.943883, -0.330279 ) * sampleSize );",
				"if( tmp.b < color.b ) color = tmp;",

				"add += tmp = texture2D( tDiffuse, uv + vec2( 0.330279, -0.943883 ) * sampleSize );",
				"if( tmp.b < color.b ) color = tmp;",

				"add += tmp = texture2D( tDiffuse, uv + vec2( -0.532032, -0.846724 ) * sampleSize );",
				"if( tmp.b < color.b ) color = tmp;",

				"add += tmp = texture2D( tDiffuse, uv + vec2( -0.993712, -0.111964 ) * sampleSize );",
				"if( tmp.b < color.b ) color = tmp;",

				"add += tmp = texture2D( tDiffuse, uv + vec2( -0.707107, 0.707107 ) * sampleSize );",
				"if( tmp.b < color.b ) color = tmp;",

				"color = color * vec4( 2.0 ) - ( add / vec4( 8.0 ) );",
				"color = color + ( add / vec4( 8.0 ) - color ) * ( vec4( 1.0 ) - vec4( sample_dist * 0.5 ) );",

				"gl_FragColor = vec4( color.rgb * color.rgb * vec3( 0.95 ) + color.rgb, 1.0 );",

			"}"


		].join("\n")
	},

	/* -------------------------------------------------------------------------
	//	Triangle blur shader
	//  - based on glfx.js triangle blur shader
	//		https://github.com/evanw/glfx.js

	// 	A basic blur filter, which convolves the image with a
	// 	pyramid filter. The pyramid filter is separable and is applied as two
	//  perpendicular triangle filters.
	 ------------------------------------------------------------------------- */

	'triangleBlur': {


		uniforms : {

			"texture": 	{ type: "t", value: 0, texture: null },
			"delta": 	{ type: "v2", value:new THREE.Vector2( 1, 1 )  }

		},

		vertexShader: [

			"varying vec2 vUv;",

			"void main() {",

				"vUv = vec2( uv.x, 1.0 - uv.y );",
				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

		].join("\n"),

		fragmentShader: [

		"#define ITERATIONS 10.0",

		"uniform sampler2D texture;",
		"uniform vec2 delta;",

		"varying vec2 vUv;",

		"float random( vec3 scale, float seed ) {",

			// use the fragment position for a different seed per-pixel

			"return fract( sin( dot( gl_FragCoord.xyz + seed, scale ) ) * 43758.5453 + seed );",

		"}",

		"void main() {",

			"vec4 color = vec4( 0.0 );",

			"float total = 0.0;",

			// randomize the lookup values to hide the fixed number of samples

			"float offset = random( vec3( 12.9898, 78.233, 151.7182 ), 0.0 );",

			"for ( float t = -ITERATIONS; t <= ITERATIONS; t ++ ) {",

				"float percent = ( t + offset - 0.5 ) / ITERATIONS;",
				"float weight = 1.0 - abs( percent );",

				"color += texture2D( texture, vUv + delta * percent ) * weight;",
				"total += weight;",

			"}",

			"gl_FragColor = color / total;",

		"}",

		].join("\n")

	},

	/* -------------------------------------------------------------------------
	//	Simple test shader
	 ------------------------------------------------------------------------- */

	'basic': {

		uniforms: {},

		vertexShader: [

			"void main() {",

				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

		].join("\n"),

		fragmentShader: [

			"void main() {",

				"gl_FragColor = vec4( 1.0, 0.0, 0.0, 0.5 );",

			"}"

		].join("\n")

	},

	/* --------------------------------------------------------------------------------------------------
	//	Two pass Gaussian blur filter (horizontal and vertical blur shaders)
	//	- described in http://www.gamerendering.com/2008/10/11/gaussian-blur-filter-shader/
	//	  and used in http://www.cake23.de/traveling-wavefronts-lit-up.html
	//
	//	- 9 samples per pass
	//	- standard deviation 2.7
	//	- "h" and "v" parameters should be set to "1 / width" and "1 / height"
	 -------------------------------------------------------------------------------------------------- */

	'horizontalBlur': {

		uniforms: {

			"tDiffuse": { type: "t", value: 0, texture: null },
			"h": 		{ type: "f", value: 1.0 / 512.0 }

		},

		vertexShader: [

			"varying vec2 vUv;",

			"void main() {",

				"vUv = vec2( uv.x, 1.0 - uv.y );",
				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

		].join("\n"),

		fragmentShader: [

			"uniform sampler2D tDiffuse;",
			"uniform float h;",

			"varying vec2 vUv;",

			"void main() {",

				"vec4 sum = vec4( 0.0 );",

				"sum += texture2D( tDiffuse, vec2( vUv.x - 4.0 * h, vUv.y ) ) * 0.051;",
				"sum += texture2D( tDiffuse, vec2( vUv.x - 3.0 * h, vUv.y ) ) * 0.0918;",
				"sum += texture2D( tDiffuse, vec2( vUv.x - 2.0 * h, vUv.y ) ) * 0.12245;",
				"sum += texture2D( tDiffuse, vec2( vUv.x - 1.0 * h, vUv.y ) ) * 0.1531;",
				"sum += texture2D( tDiffuse, vec2( vUv.x, 		  	vUv.y ) ) * 0.1633;",
				"sum += texture2D( tDiffuse, vec2( vUv.x + 1.0 * h, vUv.y ) ) * 0.1531;",
				"sum += texture2D( tDiffuse, vec2( vUv.x + 2.0 * h, vUv.y ) ) * 0.12245;",
				"sum += texture2D( tDiffuse, vec2( vUv.x + 3.0 * h, vUv.y ) ) * 0.0918;",
				"sum += texture2D( tDiffuse, vec2( vUv.x + 4.0 * h, vUv.y ) ) * 0.051;",

				"gl_FragColor = sum;",

			"}"


		].join("\n")

	},

	'verticalBlur': {

		uniforms: {

			"tDiffuse": { type: "t", value: 0, texture: null },
			"v": 		{ type: "f", value: 1.0 / 512.0 }

		},

		vertexShader: [

			"varying vec2 vUv;",

			"void main() {",

				"vUv = vec2( uv.x, 1.0 - uv.y );",
				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

		].join("\n"),

		fragmentShader: [

			"uniform sampler2D tDiffuse;",
			"uniform float v;",

			"varying vec2 vUv;",

			"void main() {",

				"vec4 sum = vec4( 0.0 );",

				"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 4.0 * v ) ) * 0.051;",
				"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 3.0 * v ) ) * 0.0918;",
				"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 2.0 * v ) ) * 0.12245;",
				"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 1.0 * v ) ) * 0.1531;",
				"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y			  ) ) * 0.1633;",
				"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 1.0 * v ) ) * 0.1531;",
				"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 2.0 * v ) ) * 0.12245;",
				"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 3.0 * v ) ) * 0.0918;",
				"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 4.0 * v ) ) * 0.051;",

				"gl_FragColor = sum;",

			"}"


		].join("\n")

	},

	/* --------------------------------------------------------------------------------------------------
	//	Simple fake tilt-shift effect, modulating two pass Gaussian blur (see above) by vertical position
	//
	//	- 9 samples per pass
	//	- standard deviation 2.7
	//	- "h" and "v" parameters should be set to "1 / width" and "1 / height"
	//	- "r" parameter control where "focused" horizontal line lies
	 -------------------------------------------------------------------------------------------------- */

	'horizontalTiltShift': {

		uniforms: {

			"tDiffuse": { type: "t", value: 0, texture: null },
			"h": 		{ type: "f", value: 1.0 / 512.0 },
			"r": 		{ type: "f", value: 0.35 }

		},

		vertexShader: [

			"varying vec2 vUv;",

			"void main() {",

				"vUv = vec2( uv.x, 1.0 - uv.y );",
				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

		].join("\n"),

		fragmentShader: [

			"uniform sampler2D tDiffuse;",
			"uniform float h;",
			"uniform float r;",

			"varying vec2 vUv;",

			"void main() {",

				"vec4 sum = vec4( 0.0 );",

				"float hh = h * abs( r - vUv.y );",

				"sum += texture2D( tDiffuse, vec2( vUv.x - 4.0 * hh, vUv.y ) ) * 0.051;",
				"sum += texture2D( tDiffuse, vec2( vUv.x - 3.0 * hh, vUv.y ) ) * 0.0918;",
				"sum += texture2D( tDiffuse, vec2( vUv.x - 2.0 * hh, vUv.y ) ) * 0.12245;",
				"sum += texture2D( tDiffuse, vec2( vUv.x - 1.0 * hh, vUv.y ) ) * 0.1531;",
				"sum += texture2D( tDiffuse, vec2( vUv.x, 		  	 vUv.y ) ) * 0.1633;",
				"sum += texture2D( tDiffuse, vec2( vUv.x + 1.0 * hh, vUv.y ) ) * 0.1531;",
				"sum += texture2D( tDiffuse, vec2( vUv.x + 2.0 * hh, vUv.y ) ) * 0.12245;",
				"sum += texture2D( tDiffuse, vec2( vUv.x + 3.0 * hh, vUv.y ) ) * 0.0918;",
				"sum += texture2D( tDiffuse, vec2( vUv.x + 4.0 * hh, vUv.y ) ) * 0.051;",

				"gl_FragColor = sum;",

			"}"


		].join("\n")

	},

	'verticalTiltShift': {

		uniforms: {

			"tDiffuse": { type: "t", value: 0, texture: null },
			"v": 		{ type: "f", value: 1.0 / 512.0 },
			"r": 		{ type: "f", value: 0.35 }

		},

		vertexShader: [

			"varying vec2 vUv;",

			"void main() {",

				"vUv = vec2( uv.x, 1.0 - uv.y );",
				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

		].join("\n"),

		fragmentShader: [

			"uniform sampler2D tDiffuse;",
			"uniform float v;",
			"uniform float r;",

			"varying vec2 vUv;",

			"void main() {",

				"vec4 sum = vec4( 0.0 );",

				"float vv = v * abs( r - vUv.y );",

				"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 4.0 * vv ) ) * 0.051;",
				"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 3.0 * vv ) ) * 0.0918;",
				"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 2.0 * vv ) ) * 0.12245;",
				"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 1.0 * vv ) ) * 0.1531;",
				"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y			   ) ) * 0.1633;",
				"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 1.0 * vv ) ) * 0.1531;",
				"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 2.0 * vv ) ) * 0.12245;",
				"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 3.0 * vv ) ) * 0.0918;",
				"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 4.0 * vv ) ) * 0.051;",

				"gl_FragColor = sum;",

			"}"


		].join("\n")

	},

	/* -------------------------------------------------------------------------
	//	Blend two textures
	 ------------------------------------------------------------------------- */

	'blend': {

		uniforms: {

			tDiffuse1: { type: "t", value: 0, texture: null },
			tDiffuse2: { type: "t", value: 1, texture: null },
			mixRatio:  { type: "f", value: 0.5 },
			opacity:   { type: "f", value: 1.0 }

		},

		vertexShader: [

			"varying vec2 vUv;",

			"void main() {",

				"vUv = vec2( uv.x, 1.0 - uv.y );",
				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

		].join("\n"),

		fragmentShader: [

			"uniform float opacity;",
			"uniform float mixRatio;",

			"uniform sampler2D tDiffuse1;",
			"uniform sampler2D tDiffuse2;",

			"varying vec2 vUv;",

			"void main() {",

				"vec4 texel1 = texture2D( tDiffuse1, vUv );",
				"vec4 texel2 = texture2D( tDiffuse2, vUv );",
				"gl_FragColor = opacity * mix( texel1, texel2, mixRatio );",

			"}"

		].join("\n")

	},

	/* -------------------------------------------------------------------------
	//	NVIDIA FXAA by Timothy Lottes
	//		http://timothylottes.blogspot.com/2011/06/fxaa3-source-released.html
	//	- WebGL port by @supereggbert
	//		http://www.glge.org/demos/fxaa/
	 ------------------------------------------------------------------------- */

	'fxaa': {

		uniforms: {

			"tDiffuse": 	{ type: "t", value: 0, texture: null },
			"resolution": 	{ type: "v2", value: new THREE.Vector2( 1 / 1024, 1 / 512 )  }

		},

		vertexShader: [

			"varying vec2 vUv;",

			"void main() {",

				"vUv = vec2( uv.x, 1.0 - uv.y );",

				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

		].join("\n"),

		fragmentShader: [

			"uniform sampler2D tDiffuse;",
			"uniform vec2 resolution;",

			"varying vec2 vUv;",

			"#define FXAA_REDUCE_MIN   (1.0/128.0)",
			"#define FXAA_REDUCE_MUL   (1.0/8.0)",
			"#define FXAA_SPAN_MAX     8.0",

			"void main() {",

				"vec3 rgbNW = texture2D( tDiffuse, ( gl_FragCoord.xy + vec2( -1.0, -1.0 ) ) * resolution ).xyz;",
				"vec3 rgbNE = texture2D( tDiffuse, ( gl_FragCoord.xy + vec2( 1.0, -1.0 ) ) * resolution ).xyz;",
				"vec3 rgbSW = texture2D( tDiffuse, ( gl_FragCoord.xy + vec2( -1.0, 1.0 ) ) * resolution ).xyz;",
				"vec3 rgbSE = texture2D( tDiffuse, ( gl_FragCoord.xy + vec2( 1.0, 1.0 ) ) * resolution ).xyz;",
				"vec3 rgbM  = texture2D( tDiffuse,  gl_FragCoord.xy  * resolution ).xyz;",

				"vec3 luma = vec3( 0.299, 0.587, 0.114 );",

				"float lumaNW = dot( rgbNW, luma );",
				"float lumaNE = dot( rgbNE, luma );",
				"float lumaSW = dot( rgbSW, luma );",
				"float lumaSE = dot( rgbSE, luma );",
				"float lumaM  = dot( rgbM,  luma );",
				"float lumaMin = min( lumaM, min( min( lumaNW, lumaNE ), min( lumaSW, lumaSE ) ) );",
				"float lumaMax = max( lumaM, max( max( lumaNW, lumaNE) , max( lumaSW, lumaSE ) ) );",

				"vec2 dir;",
				"dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));",
				"dir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));",

				"float dirReduce = max( ( lumaNW + lumaNE + lumaSW + lumaSE ) * ( 0.25 * FXAA_REDUCE_MUL ), FXAA_REDUCE_MIN );",

				"float rcpDirMin = 1.0 / ( min( abs( dir.x ), abs( dir.y ) ) + dirReduce );",
				"dir = min( vec2( FXAA_SPAN_MAX,  FXAA_SPAN_MAX),",
					  "max( vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX),",
							"dir * rcpDirMin)) * resolution;",

				"vec3 rgbA = 0.5 * (",
					"texture2D( tDiffuse, gl_FragCoord.xy  * resolution + dir * ( 1.0 / 3.0 - 0.5 ) ).xyz +",
					"texture2D( tDiffuse, gl_FragCoord.xy  * resolution + dir * ( 2.0 / 3.0 - 0.5 ) ).xyz );",

				"vec3 rgbB = rgbA * 0.5 + 0.25 * (",
					"texture2D( tDiffuse, gl_FragCoord.xy  * resolution + dir * -0.5 ).xyz +",
					"texture2D( tDiffuse, gl_FragCoord.xy  * resolution + dir * 0.5 ).xyz );",

				"float lumaB = dot( rgbB, luma );",

				"if ( ( lumaB < lumaMin ) || ( lumaB > lumaMax ) ) {",

					"gl_FragColor = vec4( rgbA, 1.0 );",

				"} else {",

					"gl_FragColor = vec4( rgbB, 1.0 );",

				"}",

			"}",

		].join("\n"),

	},

	/* -------------------------------------------------------------------------
	//	Luminosity
	//	http://en.wikipedia.org/wiki/Luminosity
	 ------------------------------------------------------------------------- */

	'luminosity': {

		uniforms: {

			"tDiffuse": 	{ type: "t", value: 0, texture: null }

		},

		vertexShader: [

			"varying vec2 vUv;",

			"void main() {",

				"vUv = vec2( uv.x, 1.0 - uv.y );",

				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

		].join("\n"),

		fragmentShader: [

			"uniform sampler2D tDiffuse;",

			"varying vec2 vUv;",

			"void main() {",

				"vec4 texel = texture2D( tDiffuse, vUv );",

				"vec3 luma = vec3( 0.299, 0.587, 0.114 );",

				"float v = dot( texel.xyz, luma );",

				"gl_FragColor = vec4( v, v, v, texel.w );",

			"}"

		].join("\n")

	},

	/* -------------------------------------------------------------------------
	//	Color correction
	 ------------------------------------------------------------------------- */

	'colorCorrection': {

		uniforms: {

			"tDiffuse" : 	{ type: "t", value: 0, texture: null },
			"powRGB" :		{ type: "v3", value: new THREE.Vector3( 2, 2, 2 ) },
			"mulRGB" :		{ type: "v3", value: new THREE.Vector3( 1, 1, 1 ) }

		},

		vertexShader: [

			"varying vec2 vUv;",

			"void main() {",

				"vUv = vec2( uv.x, 1.0 - uv.y );",

				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

		].join("\n"),

		fragmentShader: [

			"uniform sampler2D tDiffuse;",
			"uniform vec3 powRGB;",
			"uniform vec3 mulRGB;",

			"varying vec2 vUv;",

			"void main() {",

				"gl_FragColor = texture2D( tDiffuse, vUv );",
				"gl_FragColor.rgb = mulRGB * pow( gl_FragColor.rgb, powRGB );",

			"}"

		].join("\n")

	},

	/* -------------------------------------------------------------------------
	//	Normal map shader
	//	- compute normals from heightmap
	 ------------------------------------------------------------------------- */

	'normalmap': {

		uniforms: {

			"heightMap"	: { type: "t", value: 0, texture: null },
			"resolution": { type: "v2", value: new THREE.Vector2( 512, 512 ) },
			"scale"		: { type: "v2", value: new THREE.Vector2( 1, 1 ) },
			"height"	: { type: "f", value: 0.05 }

		},

		vertexShader: [

			"varying vec2 vUv;",

			"void main() {",

				"vUv = vec2( uv.x, 1.0 - uv.y );",

				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

		].join("\n"),

		fragmentShader: [

			"uniform float height;",
			"uniform vec2 resolution;",
			"uniform sampler2D heightMap;",

			"varying vec2 vUv;",

			"void main() {",

				"float val = texture2D( heightMap, vUv ).x;",

				"float valU = texture2D( heightMap, vUv + vec2( 1.0 / resolution.x, 0.0 ) ).x;",
				"float valV = texture2D( heightMap, vUv + vec2( 0.0, 1.0 / resolution.y ) ).x;",

				"gl_FragColor = vec4( ( 0.5 * normalize( vec3( val - valU, val - valV, height  ) ) + 0.5 ), 1.0 );",

			"}",

		].join("\n")

	},

	/* -------------------------------------------------------------------------
	//	Screen-space ambient occlusion shader
	//	- ported from
	//		SSAO GLSL shader v1.2
	//		assembled by Martins Upitis (martinsh) (http://devlog-martinsh.blogspot.com)
	//		original technique is made by ArKano22 (http://www.gamedev.net/topic/550699-ssao-no-halo-artifacts/)
	//	- modifications
	//		- modified to use RGBA packed depth texture (use clear color 1,1,1,1 for depth pass)
	//		- made fog more compatible with three.js linear fog
	//		- refactoring and optimizations
	 ------------------------------------------------------------------------- */

	'ssao': {

		uniforms: {

			"tDiffuse": 	{ type: "t", value: 0, texture: null },
			"tDepth":   	{ type: "t", value: 1, texture: null },
			"size": 		{ type: "v2", value: new THREE.Vector2( 512, 512 ) },
			"cameraNear":	{ type: "f", value: 1 },
			"cameraFar":	{ type: "f", value: 100 },
			"fogNear":		{ type: "f", value: 5 },
			"fogFar":		{ type: "f", value: 100 },
			"fogEnabled":	{ type: "i", value: 0 },
			"aoClamp":		{ type: "f", value: 0.3 }

		},

		vertexShader: [

			"varying vec2 vUv;",

			"void main() {",

				"vUv = vec2( uv.x, 1.0 - uv.y );",

				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

		].join("\n"),

		fragmentShader: [

			"uniform float cameraNear;",
			"uniform float cameraFar;",

			"uniform float fogNear;",
			"uniform float fogFar;",

			"uniform bool fogEnabled;",

			"uniform vec2 size;",		// texture width, height
			"uniform float aoClamp;", 	// depth clamp - reduces haloing at screen edges

			"uniform sampler2D tDiffuse;",
			"uniform sampler2D tDepth;",

			"varying vec2 vUv;",

			//"#define PI 3.14159265",
			"#define DL 2.399963229728653", // PI * ( 3.0 - sqrt( 5.0 ) )
			"#define EULER 2.718281828459045",

			// helpers

			"float width = size.x;", 	// texture width
			"float height = size.y;", 	// texture height

			"float cameraFarPlusNear = cameraFar + cameraNear;",
			"float cameraFarMinusNear = cameraFar - cameraNear;",
			"float cameraCoef = 2.0 * cameraNear;",

			// user variables

			"const int samples = 8;", 		// ao sample count
			"const float radius = 5.0;", 	// ao radius

			"const bool useNoise = false;", 		 // use noise instead of pattern for sample dithering
			"const float noiseAmount = 0.0002;", // dithering amount

			"const float diffArea = 0.4;", 		// self-shadowing reduction
			"const float gDisplace = 0.4;", 	// gauss bell center

			"const bool onlyAO = false;", 		// use only ambient occlusion pass?
			"const float lumInfluence = 0.3;",  // how much luminance affects occlusion

			// RGBA depth

			"float unpackDepth( const in vec4 rgba_depth ) {",

				"const vec4 bit_shift = vec4( 1.0 / ( 256.0 * 256.0 * 256.0 ), 1.0 / ( 256.0 * 256.0 ), 1.0 / 256.0, 1.0 );",
				"float depth = dot( rgba_depth, bit_shift );",
				"return depth;",

			"}",

			// generating noise / pattern texture for dithering

			"vec2 rand( const vec2 coord ) {",

				"vec2 noise;",

				"if ( useNoise ) {",

					"float nx = dot ( coord, vec2( 12.9898, 78.233 ) );",
					"float ny = dot ( coord, vec2( 12.9898, 78.233 ) * 2.0 );",

					"noise = clamp( fract ( 43758.5453 * sin( vec2( nx, ny ) ) ), 0.0, 1.0 );",

				"} else {",

					"float ff = fract( 1.0 - coord.s * ( width / 2.0 ) );",
					"float gg = fract( coord.t * ( height / 2.0 ) );",

					"noise = vec2( 0.25, 0.75 ) * vec2( ff ) + vec2( 0.75, 0.25 ) * gg;",

				"}",

				"return ( noise * 2.0  - 1.0 ) * noiseAmount;",

			"}",

			"float doFog() {",

				"float zdepth = unpackDepth( texture2D( tDepth, vUv ) );",
				"float depth = -cameraFar * cameraNear / ( zdepth * cameraFarMinusNear - cameraFar );",

				"return smoothstep( fogNear, fogFar, depth );",

			"}",

			"float readDepth( const in vec2 coord ) {",

				//"return ( 2.0 * cameraNear ) / ( cameraFar + cameraNear - unpackDepth( texture2D( tDepth, coord ) ) * ( cameraFar - cameraNear ) );",
				"return cameraCoef / ( cameraFarPlusNear - unpackDepth( texture2D( tDepth, coord ) ) * cameraFarMinusNear );",


			"}",

			"float compareDepths( const in float depth1, const in float depth2, inout int far ) {",

				"float garea = 2.0;", 						 // gauss bell width
				"float diff = ( depth1 - depth2 ) * 100.0;", // depth difference (0-100)

				// reduce left bell width to avoid self-shadowing

				"if ( diff < gDisplace ) {",

					"garea = diffArea;",

				"} else {",

					"far = 1;",

				"}",

				"float dd = diff - gDisplace;",
				"float gauss = pow( EULER, -2.0 * dd * dd / ( garea * garea ) );",
				"return gauss;",

			"}",

			"float calcAO( float depth, float dw, float dh ) {",

				"float dd = radius - depth * radius;",
				"vec2 vv = vec2( dw, dh );",

				"vec2 coord1 = vUv + dd * vv;",
				"vec2 coord2 = vUv - dd * vv;",

				"float temp1 = 0.0;",
				"float temp2 = 0.0;",

				"int far = 0;",
				"temp1 = compareDepths( depth, readDepth( coord1 ), far );",

				// DEPTH EXTRAPOLATION

				"if ( far > 0 ) {",

					"temp2 = compareDepths( readDepth( coord2 ), depth, far );",
					"temp1 += ( 1.0 - temp1 ) * temp2;",

				"}",

				"return temp1;",

			"}",

			"void main() {",

				"vec2 noise = rand( vUv );",
				"float depth = readDepth( vUv );",

				"float tt = clamp( depth, aoClamp, 1.0 );",

				"float w = ( 1.0 / width )  / tt + ( noise.x * ( 1.0 - noise.x ) );",
				"float h = ( 1.0 / height ) / tt + ( noise.y * ( 1.0 - noise.y ) );",

				"float pw;",
				"float ph;",

				"float ao;",

				"float dz = 1.0 / float( samples );",
				"float z = 1.0 - dz / 2.0;",
				"float l = 0.0;",

				"for ( int i = 0; i <= samples; i ++ ) {",

					"float r = sqrt( 1.0 - z );",

					"pw = cos( l ) * r;",
					"ph = sin( l ) * r;",
					"ao += calcAO( depth, pw * w, ph * h );",
					"z = z - dz;",
					"l = l + DL;",

				"}",

				"ao /= float( samples );",
				"ao = 1.0 - ao;",

				"if ( fogEnabled ) {",

					"ao = mix( ao, 1.0, doFog() );",

				"}",

				"vec3 color = texture2D( tDiffuse, vUv ).rgb;",

				"vec3 lumcoeff = vec3( 0.299, 0.587, 0.114 );",
				"float lum = dot( color.rgb, lumcoeff );",
				"vec3 luminance = vec3( lum );",

				"vec3 final = vec3( color * mix( vec3( ao ), vec3( 1.0 ), luminance * lumInfluence ) );", // mix( color * ao, white, luminance )

				"if ( onlyAO ) {",

					"final = vec3( mix( vec3( ao ), vec3( 1.0 ), luminance * lumInfluence ) );", // ambient occlusion only

				"}",

				"gl_FragColor = vec4( final, 1.0 );",

			"}"

		].join("\n")

	},

	/* -------------------------------------------------------------------------
	//	Colorify shader
	 ------------------------------------------------------------------------- */

	'colorify': {

		uniforms: {

			tDiffuse: { type: "t", value: 0, texture: null },
			color:    { type: "c", value: new THREE.Color( 0xffffff ) }

		},

		vertexShader: [

			"varying vec2 vUv;",

			"void main() {",

				"vUv = vec2( uv.x, 1.0 - uv.y );",
				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

		].join("\n"),

		fragmentShader: [

			"uniform vec3 color;",
			"uniform sampler2D tDiffuse;",

			"varying vec2 vUv;",

			"void main() {",

				"vec4 texel = texture2D( tDiffuse, vUv );",

				"vec3 luma = vec3( 0.299, 0.587, 0.114 );",
				"float v = dot( texel.xyz, luma );",

				"gl_FragColor = vec4( v * color, texel.w );",

			"}"

		].join("\n")

	},

	/* -------------------------------------------------------------------------
	//	Unpack RGBA depth shader
	//	- show RGBA encoded depth as monochrome color
	 ------------------------------------------------------------------------- */

	'unpackDepthRGBA': {

		uniforms: {

			tDiffuse: { type: "t", value: 0, texture: null },
			opacity:  { type: "f", value: 1.0 }

		},

		vertexShader: [

			"varying vec2 vUv;",

			"void main() {",

				"vUv = vec2( uv.x, 1.0 - uv.y );",
				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

		].join("\n"),

		fragmentShader: [

			"uniform float opacity;",

			"uniform sampler2D tDiffuse;",

			"varying vec2 vUv;",

			// RGBA depth

			"float unpackDepth( const in vec4 rgba_depth ) {",

				"const vec4 bit_shift = vec4( 1.0 / ( 256.0 * 256.0 * 256.0 ), 1.0 / ( 256.0 * 256.0 ), 1.0 / 256.0, 1.0 );",
				"float depth = dot( rgba_depth, bit_shift );",
				"return depth;",

			"}",

			"void main() {",

				"float depth = 1.0 - unpackDepth( texture2D( tDiffuse, vUv ) );",
				"gl_FragColor = opacity * vec4( vec3( depth ), 1.0 );",

			"}"

		].join("\n")

	},

	// METHODS

	buildKernel: function( sigma ) {

		// We lop off the sqrt(2 * pi) * sigma term, since we're going to normalize anyway.

		function gauss( x, sigma ) {

			return Math.exp( - ( x * x ) / ( 2.0 * sigma * sigma ) );

		}

		var i, values, sum, halfWidth, kMaxKernelSize = 25, kernelSize = 2 * Math.ceil( sigma * 3.0 ) + 1;

		if ( kernelSize > kMaxKernelSize ) kernelSize = kMaxKernelSize;
		halfWidth = ( kernelSize - 1 ) * 0.5

		values = new Array( kernelSize );
		sum = 0.0;
		for ( i = 0; i < kernelSize; ++i ) {

			values[ i ] = gauss( i - halfWidth, sigma );
			sum += values[ i ];

		}

		// normalize the kernel

		for ( i = 0; i < kernelSize; ++i ) values[ i ] /= sum;

		return values;

	}

};
