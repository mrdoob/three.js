/**
 * Combine accumulation and revealage for weighted, blended order-independent transparency
 */

const WboitCompositeShader = {

	uniforms: {

		'tAccumulation': { value: null },
		'tRevealage': { value: null }

	},

	vertexShader: /* glsl */`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,

	fragmentShader: /* glsl */`

		precision highp float;
		precision highp int;

		varying vec2 vUv;

		uniform sampler2D tAccumulation;
		uniform sampler2D tRevealage;

		float EPSILON = 0.00001;

		bool fuzzyEqual( float a, float b ) {

			return abs( a - b ) <= ( abs( a ) < abs( b ) ? abs( b ) : abs( a ) ) * EPSILON;

		}

		void main() {

			float reveal = texture2D( tRevealage, vUv ).r;
			if ( fuzzyEqual( reveal, 1.0 ) ) discard;

			vec4 accum = texture2D( tAccumulation, vUv );

			vec4 composite = vec4( accum.rgb / clamp( accum.a, 0.0001, 50000.0 ), reveal );
			gl_FragColor = clamp( composite, 0.01, 300.0 );

		}`,

};

export { WboitCompositeShader };
