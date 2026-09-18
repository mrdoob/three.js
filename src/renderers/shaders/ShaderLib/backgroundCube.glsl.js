export const vertex = /* glsl */`
varying vec3 vWorldDirection;

#include <common>

void main() {

	vWorldDirection = transformDirection( position, modelMatrix );

	#include <begin_vertex>
	#include <project_vertex>

	gl_Position.z = gl_Position.w; // set z to camera.far

}
`;

export const fragment = /* glsl */`

uniform samplerCube envMap;

uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;

varying vec3 vWorldDirection;

#ifdef ENVMAP_TYPE_CUBE

	float getFace( vec3 direction ) {

		vec3 absDirection = abs( direction );

		float face = - 1.0;

		if ( absDirection.x > absDirection.z ) {

			if ( absDirection.x > absDirection.y )

				face = direction.x > 0.0 ? 0.0 : 3.0;

			else

				face = direction.y > 0.0 ? 1.0 : 4.0;

		} else {

			if ( absDirection.z > absDirection.y )

				face = direction.z > 0.0 ? 2.0 : 5.0;

			else

				face = direction.y > 0.0 ? 1.0 : 4.0;

		}

		return face;

	}

	// Faces are ordered +X, +Y, +Z, -X, -Y, -Z.
	vec2 getUV( vec3 direction, float face ) {

		vec2 uv;

		if ( face == 0.0 ) {

			uv = vec2( direction.z, direction.y ) / abs( direction.x ); // pos x

		} else if ( face == 1.0 ) {

			uv = vec2( - direction.x, - direction.z ) / abs( direction.y ); // pos y

		} else if ( face == 2.0 ) {

			uv = vec2( - direction.x, direction.y ) / abs( direction.z ); // pos z

		} else if ( face == 3.0 ) {

			uv = vec2( - direction.z, direction.y ) / abs( direction.x ); // neg x

		} else if ( face == 4.0 ) {

			uv = vec2( - direction.x, direction.z ) / abs( direction.y ); // neg y

		} else {

			uv = vec2( direction.x, direction.y ) / abs( direction.z ); // neg z

		}

		return 0.5 * ( uv + 1.0 );

	}

	// Direction (not normalized) of face coordinates in the getUV convention that may lie past the face
	// edge. The texel grid continues into the neighbouring face at the same texel index along the edge, so
	// coordinates past the edge land on the neighbour's texel centers rather than on the extrapolated face plane.
	vec3 cubeFaceDir( float face, vec2 uv ) {

		vec2 st = 2.0 * uv - 1.0;
		vec2 over = min( max( abs( st ) - 1.0, 0.0 ), 0.75 );
		st = clamp( st, - 1.0, 1.0 ) / ( ( 1.0 - over.x ) * ( 1.0 - over.y ) );

		if ( face == 0.0 ) return vec3( 1.0, st.y, st.x );
		if ( face == 1.0 ) return vec3( - st.x, 1.0, - st.y );
		if ( face == 2.0 ) return vec3( - st.x, st.y, 1.0 );
		if ( face == 3.0 ) return vec3( - 1.0, st.y, - st.x );
		if ( face == 4.0 ) return vec3( - st.x, - 1.0, st.y );
		return vec3( st.x, st.y, - 1.0 );

	}

	// The blurred cube map's texels are only a few sigmas wide, bilinear magnification would show its
	// grid. Cubic B-spline reconstruction: four bilinear taps with the weights folded into the tap positions.
	vec4 sampleBlurred( vec3 direction ) {

		float size = float( textureSize( envMap, 0 ).x );

		float face = getFace( direction );
		vec2 uv = getUV( direction, face );

		// texel i has its center at p = i
		vec2 p = uv * size - 0.5;
		vec2 i = floor( p );
		vec2 f = p - i;

		// cubic B-spline weights of texels i - 1 .. i + 2
		vec2 f2 = f * f;
		vec2 f3 = f2 * f;
		vec2 w0 = ( 1.0 - 3.0 * f + 3.0 * f2 - f3 ) / 6.0;
		vec2 w1 = ( 4.0 - 6.0 * f2 + 3.0 * f3 ) / 6.0;
		vec2 w2 = ( 1.0 + 3.0 * f + 3.0 * f2 - 3.0 * f3 ) / 6.0;
		vec2 w3 = f3 / 6.0;

		// pair the taps: one bilinear fetch between i - 1 and i, one between i + 1 and i + 2
		vec2 s0 = w0 + w1;
		vec2 s1 = w2 + w3;
		vec2 t0 = ( i - 0.5 + w1 / s0 ) / size;
		vec2 t1 = ( i + 1.5 + w3 / s1 ) / size;

		vec4 color = textureCube( envMap, cubeFaceDir( face, vec2( t0.x, t0.y ) ) ) * s0.x * s0.y
			+ textureCube( envMap, cubeFaceDir( face, vec2( t1.x, t0.y ) ) ) * s1.x * s0.y
			+ textureCube( envMap, cubeFaceDir( face, vec2( t0.x, t1.y ) ) ) * s0.x * s1.y
			+ textureCube( envMap, cubeFaceDir( face, vec2( t1.x, t1.y ) ) ) * s1.x * s1.y;

		// the grids of the three faces meeting at a corner disagree within a texel or two, blend to bilinear there
		vec2 st = abs( 2.0 * uv - 1.0 );
		float texel = 2.0 / size;
		float corner = smoothstep( texel, 2.0 * texel, 1.0 - min( st.x, st.y ) );

		if ( corner < 1.0 ) color = mix( textureCube( envMap, direction ), color, corner );

		return color;

	}

#endif

void main() {

	vec3 direction = backgroundRotation * vWorldDirection;

	#ifdef ENVMAP_TYPE_PMREM

		vec4 texColor = textureLod( envMap, direction, 0.0 );

	#else

		vec4 texColor = backgroundBlurriness > 0.0 ? sampleBlurred( direction ) : textureCube( envMap, direction );

	#endif

	texColor.rgb *= backgroundIntensity;

	gl_FragColor = texColor;

	#include <tonemapping_fragment>
	#include <colorspace_fragment>

}
`;
