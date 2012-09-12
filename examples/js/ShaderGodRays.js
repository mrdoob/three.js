/**
 * @author huwb / http://huwbowles.com/
 *
 * God-rays (crepuscular rays)
 *
 * Similar implementation to the one used by Crytek for CryEngine 2 [Sousa2008].
 * Blurs a mask generated from the depth map along radial lines emanating from the light
 * source. The blur repeatedly applies a blur filter of increasing support but constant
 * sample count to produce a blur filter with large support.
 *
 * My implementation performs 3 passes, similar to the implementation from Sousa. I found
 * just 6 samples per pass produced acceptible results. The blur is applied three times,
 * with decreasing filter support. The result is equivalent to a single pass with
 * 6*6*6 = 216 samples.
 *
 * References:
 *
 * Sousa2008 - Crysis Next Gen Effects, GDC2008, http://www.crytek.com/sites/default/files/GDC08_SousaT_CrysisEffects.ppt
 */

THREE.ShaderGodRays = {

	/**
	 * The god-ray generation shader.
	 *
	 * First pass:
	 *
	 * The input is the depth map. I found that the output from the
	 * THREE.MeshDepthMaterial material was directly suitable without
	 * requiring any treatment whatsoever.
	 *
	 * The depth map is blurred along radial lines towards the "sun". The
	 * output is written to a temporary render target (I used a 1/4 sized
	 * target).
	 *
	 * Pass two & three:
	 *
	 * The results of the previous pass are re-blurred, each time with a
	 * decreased distance between samples.
	 */

	'godrays_generate': {

		uniforms: {

			tInput: {
				type: "t",
				value: null
			},

			fStepSize: {
				type: "f",
				value: 1.0
			},

			vSunPositionScreenSpace: {
				type: "v2",
				value: new THREE.Vector2( 0.5, 0.5 )
			}

		},

		vertexShader: [

			"varying vec2 vUv;",

			"void main() {",

				"vUv = uv;",
				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

		].join("\n"),

		fragmentShader: [

			"#define TAPS_PER_PASS 6.0",

			"varying vec2 vUv;",

			"uniform sampler2D tInput;",

			"uniform vec2 vSunPositionScreenSpace;",
			"uniform float fStepSize;", // filter step size

			"void main() {",

				// delta from current pixel to "sun" position

				"vec2 delta = vSunPositionScreenSpace - vUv;",
				"float dist = length( delta );",

				// Step vector (uv space)

				"vec2 stepv = fStepSize * delta / dist;",

				// Number of iterations between pixel and sun

				"float iters = dist/fStepSize;",

				"vec2 uv = vUv.xy;",
				"float col = 0.0;",

				// Unrolling didnt do much on my hardware (ATI Mobility Radeon 3450),
				// so i've just left the loop

				"for ( float i = 0.0; i < TAPS_PER_PASS; i += 1.0 ) {",

					// Accumulate samples, making sure we dont walk past the light source.

					// The check for uv.y < 1 would not be necessary with "border" UV wrap
					// mode, with a black border colour. I don't think this is currently
					// exposed by three.js. As a result there might be artifacts when the
					// sun is to the left, right or bottom of screen as these cases are
					// not specifically handled.

					"col += ( i <= iters && uv.y < 1.0 ? texture2D( tInput, uv ).r : 0.0 );",
					"uv += stepv;",

				"}",

				// Should technically be dividing by 'iters', but 'TAPS_PER_PASS' smooths out
				// objectionable artifacts, in particular near the sun position. The side
				// effect is that the result is darker than it should be around the sun, as
				// TAPS_PER_PASS is greater than the number of samples actually accumulated.
				// When the result is inverted (in the shader 'godrays_combine', this produces
				// a slight bright spot at the position of the sun, even when it is occluded.

				"gl_FragColor = vec4( col/TAPS_PER_PASS );",
				"gl_FragColor.a = 1.0;",

			"}"

		].join("\n")

	},

	/**
	 * Additively applies god rays from texture tGodRays to a background (tColors).
	 * fGodRayIntensity attenuates the god rays.
	 */

	'godrays_combine': {

		uniforms: {

			tColors: {
				type: "t",
				value: null
			},

			tGodRays: {
				type: "t",
				value: null
			},

			fGodRayIntensity: {
				type: "f",
				value: 0.69
			},

			vSunPositionScreenSpace: {
				type: "v2",
				value: new THREE.Vector2( 0.5, 0.5 )
			}

		},

		vertexShader: [

			"varying vec2 vUv;",

			"void main() {",

				"vUv = uv;",
				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

			].join("\n"),

		fragmentShader: [

			"varying vec2 vUv;",

			"uniform sampler2D tColors;",
			"uniform sampler2D tGodRays;",

			"uniform vec2 vSunPositionScreenSpace;",
			"uniform float fGodRayIntensity;",

			"void main() {",

				// Since THREE.MeshDepthMaterial renders foreground objects white and background
				// objects black, the god-rays will be white streaks. Therefore value is inverted
				// before being combined with tColors

				"gl_FragColor = texture2D( tColors, vUv ) + fGodRayIntensity * vec4( 1.0 - texture2D( tGodRays, vUv ).r );",
				"gl_FragColor.a = 1.0;",

			"}"

		].join("\n")

	},


	/**
	 * A dodgy sun/sky shader. Makes a bright spot at the sun location. Would be
	 * cheaper/faster/simpler to implement this as a simple sun sprite.
	 */

	'godrays_fake_sun': {

		uniforms: {

			vSunPositionScreenSpace: {
				type: "v2",
				value: new THREE.Vector2( 0.5, 0.5 )
			},

			fAspect: {
				type: "f",
				value: 1.0
			},

			sunColor: {
				type: "c",
				value: new THREE.Color( 0xffee00 )
			},

			bgColor: {
				type: "c",
				value: new THREE.Color( 0x000000 )
			}

		},

		vertexShader: [

			"varying vec2 vUv;",

			"void main() {",

				"vUv = uv;",
				"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

		].join("\n"),

		fragmentShader: [

			"varying vec2 vUv;",

			"uniform vec2 vSunPositionScreenSpace;",
			"uniform float fAspect;",

			"uniform vec3 sunColor;",
			"uniform vec3 bgColor;",

			"void main() {",

				"vec2 diff = vUv - vSunPositionScreenSpace;",

				// Correct for aspect ratio

				"diff.x *= fAspect;",

				"float prop = clamp( length( diff ) / 0.5, 0.0, 1.0 );",
				"prop = 0.35 * pow( 1.0 - prop, 3.0 );",

				"gl_FragColor.xyz = mix( sunColor, bgColor, 1.0 - prop );",
				"gl_FragColor.w = 1.0;",

			"}"

		].join("\n")

	}

};
