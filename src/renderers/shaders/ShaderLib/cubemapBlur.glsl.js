export const copyFragment = /* glsl */`

#include <common>

#ifdef USE_ENVMAP

	uniform samplerCube envMap;
	uniform float flipEnvMap;

#else

	uniform sampler2D envMap;

#endif

varying vec3 vWorldDirection;

vec3 sampleSource( vec3 direction ) {

	#ifdef USE_ENVMAP

		return textureCubeLodEXT( envMap, vec3( flipEnvMap * direction.x, direction.yz ), 0.0 ).rgb;

	#else

		return texture2DLodEXT( envMap, equirectUv( direction ), 0.0 ).rgb;

	#endif

}

void main() {

	// Supersample to preserve energy in small HDR highlights.
	vec3 dx = dFdx( vWorldDirection ) / float( SUPERSAMPLING );
	vec3 dy = dFdy( vWorldDirection ) / float( SUPERSAMPLING );
	vec3 origin = vWorldDirection - ( dx + dy ) * 0.5 * float( SUPERSAMPLING - 1 );

	vec3 color = vec3( 0.0 );

	for ( int i = 0; i < SUPERSAMPLING; i ++ ) {

		for ( int j = 0; j < SUPERSAMPLING; j ++ ) {

			color += sampleSource( normalize( origin + float( i ) * dx + float( j ) * dy ) );

		}

	}

	gl_FragColor = vec4( color / float( SUPERSAMPLING * SUPERSAMPLING ), 1.0 );

}
`;

export const blurFragment = /* glsl */`

uniform samplerCube envMap;
uniform float sigma;
uniform float level;
uniform float spacing;
uniform int radius;

varying vec3 vWorldDirection;

void main() {

	vec3 direction = normalize( vWorldDirection );

	vec3 up = abs( direction.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
	vec3 tangent = normalize( cross( up, direction ) );
	vec3 bitangent = cross( direction, tangent );

	float k = - 0.5 / ( sigma * sigma );

	vec3 color = vec3( 0.0 );
	float weightSum = 0.0;

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

	gl_FragColor = vec4( color / weightSum, 1.0 );

}
`;

export const sphereFragment = /* glsl */`

#include <common>

uniform samplerCube envMap;
uniform float sigma;

varying vec3 vWorldDirection;

void main() {

	vec3 direction = normalize( vWorldDirection );

	float k = - 0.5 / ( sigma * sigma );

	vec3 color = vec3( 0.0 );
	float weightSum = 0.0;

	// Pair antipodal samples to reuse angle and solid angle calculations.
	for ( int t = 0; t < 3 * SIZE * SIZE; t ++ ) {

		int axis = t / ( SIZE * SIZE );
		int texel = t - axis * SIZE * SIZE;

		vec2 st = ( vec2( float( texel % SIZE ), float( texel / SIZE ) ) + 0.5 ) / float( SIZE ) * 2.0 - 1.0;

		vec3 d = axis == 0 ? vec3( 1.0, st ) : axis == 1 ? vec3( st.x, 1.0, st.y ) : vec3( st, 1.0 );
		float r2 = dot( d, d );
		float solidAngle = inversesqrt( r2 * r2 * r2 );

		float theta = acos( clamp( dot( direction, d * inversesqrt( r2 ) ), - 1.0, 1.0 ) );
		float weight = exp( k * theta * theta ) * solidAngle;

		color += weight * textureCubeLodEXT( envMap, d, LEVEL ).rgb;
		weightSum += weight;

		theta = PI - theta;
		weight = exp( k * theta * theta ) * solidAngle;

		color += weight * textureCubeLodEXT( envMap, - d, LEVEL ).rgb;
		weightSum += weight;

	}

	gl_FragColor = vec4( color / weightSum, 1.0 );

}
`;
