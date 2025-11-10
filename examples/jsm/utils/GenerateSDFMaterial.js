import { ShaderMaterial, Vector3 } from 'three';

export class GenerateSDFMaterial extends ShaderMaterial {

	constructor( params ) {

		super( {
			uniforms: {
				bvh: { value: null },
				matrix: { value: null },
				zValue: { value: 0 }
			},

			vertexShader: /* glsl */`
				varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}
			`,

			fragmentShader: /* glsl */`
				varying vec2 vUv;
				uniform BVH bvh;
				uniform mat4 matrix;
				uniform float zValue;

				void main() {
					// calculate the point in space for this pixel
					vec3 point = vec3( vUv.x - 0.5, vUv.y - 0.5, zValue - 0.5 );
					point = ( matrix * vec4( point, 1.0 ) ).xyz;

					// get the distance to the geometry
					uvec4 faceIndices = uvec4( 0u );
					vec3 faceNormal = vec3( 0.0, 0.0, 1.0 );
					vec3 barycoord = vec3( 0.0 );
					vec3 outPoint = vec3( 0.0 );
					float dist = bvhClosestPointToPoint(
						bvh, point.xyz, faceIndices, faceNormal, barycoord, outPoint
					);

					// if the triangle face normal and the point to triangle vector are pointing in the same direction
					// then the point is in the negative half space of the triangle
					vec3 toTriangle = normalize( outPoint - point );
					if ( dot( faceNormal, toTriangle ) < 0.0 ) {
						dist *= - 1.0;
					}

					gl_FragColor = vec4( dist );
				}
			`
		} );

		this.setValues( params );

	}

}
