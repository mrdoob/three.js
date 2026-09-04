import { ShaderMaterial } from 'three';

export class RenderSDFLayerMaterial extends ShaderMaterial {

	constructor( params ) {

		super( {
			uniforms: {
				sdfTex: { value: null },
				uvTex: { value: null },
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
				uniform sampler3D uvTex;
				uniform float layer;
				varying vec2 vUv;

				void main() {
					vec4 data = texture( sdfTex, vec3( vUv, layer ) );
					vec2 uv = texture( uvTex, vec3( vUv, layer ) ).rg;

					// Distance, normal and UV side by side
					vec3 color;
					if ( vUv.x < 0.33 ) {
						color = vec3( data.r * 0.5 + 0.5 );
					} else if ( vUv.x < 0.66 ) {
						color = data.gba * 0.5 + 0.5;
					} else {
						color = vec3( fract( uv ), 0.0 );
					}
					gl_FragColor = vec4( color, 1.0 );

					#include <colorspace_fragment>
				}
			`
		} );

		this.setValues( params );

	}

}
