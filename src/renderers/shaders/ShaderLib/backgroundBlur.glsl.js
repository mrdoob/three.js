export const copyFragment = /* glsl */`

#include <common>

varying vec3 vWorldDirection;
uniform bool forceLevelZero;

#ifdef CUBEMAP_SOURCE

	uniform samplerCube envMap;
	uniform float flipEnvMap;

#else

	uniform sampler2D envMap;

#endif

vec3 sampleSource( vec3 direction ) {

	#ifdef CUBEMAP_SOURCE

		return textureLod( envMap, vec3( flipEnvMap * direction.x, direction.yz ), 0.0 ).rgb;

	#else

		return textureLod( envMap, equirectUv( direction ), 0.0 ).rgb;

	#endif

}

void main() {

	if ( forceLevelZero ) {

		// Preserve the energy of small HDR highlights when capturing backgrounds.
		vec3 dx = dFdx( vWorldDirection ) / 4.0;
		vec3 dy = dFdy( vWorldDirection ) / 4.0;
		vec3 origin = vWorldDirection - ( dx + dy ) * 0.5 * 3.0;
		vec3 color = vec3( 0.0 );

		for ( int i = 0; i < 4; i ++ ) {

			for ( int j = 0; j < 4; j ++ ) {

				color += sampleSource( normalize( origin + float( i ) * dx + float( j ) * dy ) );

			}

		}

		gl_FragColor = vec4( color / 16.0, 1.0 );

	} else {

		#ifdef CUBEMAP_SOURCE

			vec3 direction = vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz );
			gl_FragColor = vec4( textureCube( envMap, direction ).rgb, 1.0 );

		#else

			// Average four subpixel samples to preserve small, bright features.
			vec3 direction = normalize( vWorldDirection );
			vec3 dx = dFdx( direction ) * 0.25;
			vec3 dy = dFdy( direction ) * 0.25;

			vec3 color = textureLod( envMap, equirectUv( normalize( direction - dx - dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction + dx - dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction - dx + dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction + dx + dy ) ), 0.0 ).rgb;
			gl_FragColor = vec4( color * 0.25, 1.0 );

		#endif

	}

}
`;

export const blurFragment = /* glsl */`

#include <common>

uniform samplerCube envMap;
uniform float sigma;
uniform float level;
uniform float spacing;
uniform int radius;

varying vec3 vWorldDirection;

void main() {

	vec3 direction = normalize( vWorldDirection );
	float k = - 0.5 / ( sigma * sigma );
	vec3 color = vec3( 0.0 );
	float weightSum = 0.0;

	if ( radius > 0 ) {

		vec3 up = abs( direction.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
		vec3 tangent = normalize( cross( up, direction ) );
		vec3 bitangent = cross( direction, tangent );

		// Weight tangent-plane taps by angular Gaussian and solid angle.
		// Uniform bounds prevent loop unrolling.
		for ( int i = - radius; i <= radius; i ++ ) {

			for ( int j = 0; j <= radius; j ++ ) {

				vec2 offset = vec2( float( i ), float( j ) ) * spacing;
				float r2 = dot( offset, offset );
				float theta = atan( sqrt( r2 ) );
				float weight = exp( k * theta * theta ) * inversesqrt( ( 1.0 + r2 ) * ( 1.0 + r2 ) * ( 1.0 + r2 ) );

				color += weight * textureCubeLodEXT( envMap, direction + offset.x * tangent + offset.y * bitangent, level ).rgb;
				weightSum += weight;

				// Mirrored taps share Gaussian and solid angle weights.
				if ( j > 0 ) {

					color += weight * textureCubeLodEXT( envMap, direction + offset.x * tangent - offset.y * bitangent, level ).rgb;
					weightSum += weight;

				}

			}

		}

	} else {

		// Wide blurs pair every texel of the 32-pixel source mip with its antipode.
		for ( int t = 0; t < 3 * 32 * 32; t ++ ) {

			int axis = t / ( 32 * 32 );
			int texel = t - axis * 32 * 32;
			vec2 st = ( vec2( float( texel % 32 ), float( texel / 32 ) ) + 0.5 ) / 32.0 * 2.0 - 1.0;

			vec3 d = axis == 0 ? vec3( 1.0, st ) : axis == 1 ? vec3( st.x, 1.0, st.y ) : vec3( st, 1.0 );
			float r2 = dot( d, d );
			float solidAngle = inversesqrt( r2 * r2 * r2 );
			float theta = acos( clamp( dot( direction, d * inversesqrt( r2 ) ), - 1.0, 1.0 ) );
			float weight = exp( k * theta * theta ) * solidAngle;

			color += weight * textureCubeLodEXT( envMap, d, level ).rgb;
			weightSum += weight;

			theta = PI - theta;
			weight = exp( k * theta * theta ) * solidAngle;

			color += weight * textureCubeLodEXT( envMap, - d, level ).rgb;
			weightSum += weight;

		}

	}

	gl_FragColor = vec4( color / weightSum, 1.0 );

}
`;
