( function () {

	/**
 * Full-screen tone-mapping shader based on http://www.cis.rit.edu/people/faculty/ferwerda/publications/sig02_paper.pdf
 */
	const ToneMapShader = {
		uniforms: {
			'tDiffuse': {
				value: null
			},
			'averageLuminance': {
				value: 1.0
			},
			'luminanceMap': {
				value: null
			},
			'maxLuminance': {
				value: 16.0
			},
			'minLuminance': {
				value: 0.01
			},
			'middleGrey': {
				value: 0.6
			}
		},
		vertexShader:
  /* glsl */
  `

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,
		fragmentShader:
  /* glsl */
  `

		#include <common>

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		uniform float middleGrey;
		uniform float minLuminance;
		uniform float maxLuminance;
		#ifdef ADAPTED_LUMINANCE
			uniform sampler2D luminanceMap;
		#else
			uniform float averageLuminance;
		#endif

		vec3 ToneMap( vec3 vColor ) {
			#ifdef ADAPTED_LUMINANCE
				// Get the calculated average luminance
				float fLumAvg = texture2D(luminanceMap, vec2(0.5, 0.5)).r;
			#else
				float fLumAvg = averageLuminance;
			#endif

			// Calculate the luminance of the current pixel
			float fLumPixel = luminance( vColor );

			// Apply the modified operator (Eq. 4)
			float fLumScaled = (fLumPixel * middleGrey) / max( minLuminance, fLumAvg );

			float fLumCompressed = (fLumScaled * (1.0 + (fLumScaled / (maxLuminance * maxLuminance)))) / (1.0 + fLumScaled);
			return fLumCompressed * vColor;
		}

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			gl_FragColor = vec4( ToneMap( texel.xyz ), texel.w );

		}`
	};

	THREE.ToneMapShader = ToneMapShader;

} )();
