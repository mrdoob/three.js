/**
 * @author alteredq / http://alteredqualia.com/
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
 *
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
