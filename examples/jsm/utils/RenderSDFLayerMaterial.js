import { ShaderMaterial } from 'three';

export class RenderSDFLayerMaterial extends ShaderMaterial {

	constructor( params ) {

		super( {
			uniforms: {
				sdfTex: { value: null },
				layer: { value: 0 },
			},

			vertexShader: /* glsl */`
				varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}
			`,

			fragmentShader: /* glsl */`
				uniform sampler3D sdfTex;
				uniform float layer;
				varying vec2 vUv;

				void main() {
					vec4 data = texture( sdfTex, vec3( vUv, layer ) );
					
					// Display three channels side by side
					vec3 color;
					if ( vUv.x < 0.33 ) {
						// Left third: Distance (grayscale, normalized around 0)
						float dist = data.r;
						float normalized = dist * 0.5 + 0.5; // Map -1,1 to 0,1
						color = vec3( normalized );
					} else if ( vUv.x < 0.66 ) {
						// Middle third: U channel (red, fractional part to handle >1 values)
						float u = fract( data.g );
						color = vec3( u, 0.0, 0.0 );
					} else {
						// Right third: V channel (green, fractional part to handle >1 values)
						float v = fract( data.b );
						color = vec3( 0.0, v, 0.0 );
					}
					
					gl_FragColor = vec4( color, 1.0 );

					#include <colorspace_fragment>
				}
			`
		} );

		this.setValues( params );

	}

}
