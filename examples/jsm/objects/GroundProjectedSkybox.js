import { Mesh, IcosahedronGeometry, ShaderMaterial, DoubleSide } from 'three';

/**
 * Ground projected env map adapted from @react-three/drei.
 * https://github.com/pmndrs/drei/blob/master/src/core/Environment.tsx
 */
class GroundProjectedSkybox extends Mesh {

	constructor( texture, options = {} ) {

		const isCubeMap = texture.isCubeTexture;

		const defines = [
			isCubeMap ? '#define ENVMAP_TYPE_CUBE' : ''
		];

		const vertexShader = /* glsl */ `
			varying vec3 vWorldPosition;

			void main() {

				vec4 worldPosition = ( modelMatrix * vec4( position, 1.0 ) );
				vWorldPosition = worldPosition.xyz;

				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

			}
			`;
		const fragmentShader = defines.join( '\n' ) + /* glsl */ `

				varying vec3 vWorldPosition;

				uniform float radius;
				uniform float height;
				uniform float angle;

				#ifdef ENVMAP_TYPE_CUBE

					uniform samplerCube map;

				#else

					uniform sampler2D map;

				#endif

				// From: https://www.shadertoy.com/view/4tsBD7
				float diskIntersectWithBackFaceCulling( vec3 ro, vec3 rd, vec3 c, vec3 n, float r ) 
				{

					float d = dot ( rd, n );

					if( d > 0.0 ) { return 1e6; }

					vec3 o = ro - c;
					float t = - dot( n, o ) / d;
					vec3 q = o + rd * t;

					return ( dot( q, q ) < r * r ) ? t : 1e6;

				}

				// From: https://www.iquilezles.org/www/articles/intersectors/intersectors.htm
				float sphereIntersect( vec3 ro, vec3 rd, vec3 ce, float ra ) {

					vec3 oc = ro - ce;
					float b = dot( oc, rd );
					float c = dot( oc, oc ) - ra * ra;
					float h = b * b - c;

					if( h < 0.0 ) { return -1.0; }

					h = sqrt( h );

					return - b + h;

				}

				vec3 project() {

					vec3 p = normalize( vWorldPosition );
					vec3 camPos = cameraPosition;
					camPos.y -= height;

					float intersection = sphereIntersect( camPos, p, vec3( 0.0 ), radius );
					if( intersection > 0.0 ) {

						vec3 h = vec3( 0.0, - height, 0.0 );
						float intersection2 = diskIntersectWithBackFaceCulling( camPos, p, h, vec3( 0.0, 1.0, 0.0 ), radius );
						p = ( camPos + min( intersection, intersection2 ) * p ) / radius;

					} else {

						p = vec3( 0.0, 1.0, 0.0 );

					}

					return p;

				}

				#include <common>

				void main() {

					vec3 projectedWorldPosition = project();

					#ifdef ENVMAP_TYPE_CUBE

						vec3 outcolor = textureCube( map, projectedWorldPosition ).rgb;

					#else

						vec3 direction = normalize( projectedWorldPosition );
						vec2 uv = equirectUv( direction );
						vec3 outcolor = texture2D( map, uv ).rgb;

					#endif

					gl_FragColor = vec4( outcolor, 1.0 );

					#include <tonemapping_fragment>
					#include <colorspace_fragment>

				}
				`;

		const uniforms = {
			map: { value: texture },
			height: { value: options.height || 15 },
			radius: { value: options.radius || 100 },
		};

		const geometry = new IcosahedronGeometry( 1, 16 );
		const material = new ShaderMaterial( {
			uniforms,
			fragmentShader,
			vertexShader,
			side: DoubleSide,
		} );

		super( geometry, material );

	}

	set radius( radius ) {

		this.material.uniforms.radius.value = radius;

	}

	get radius() {

		return this.material.uniforms.radius.value;

	}

	set height( height ) {

		this.material.uniforms.height.value = height;

	}

	get height() {

		return this.material.uniforms.height.value;

	}

}

export { GroundProjectedSkybox };
