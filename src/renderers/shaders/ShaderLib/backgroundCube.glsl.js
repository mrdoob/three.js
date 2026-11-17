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

uniform float backgroundIntensity;
uniform float backgroundBlurriness;
uniform mat3 backgroundRotation;

varying vec3 vWorldDirection;

uniform samplerCube envMap;

vec3 cubeDirection( int axis, float side, vec2 uv ) {

	vec2 st = 2.0 * uv - 1.0;
	vec2 over = min( max( abs( st ) - 1.0, 0.0 ), 0.75 );
	vec2 p = clamp( st, - 1.0, 1.0 ) / ( ( 1.0 - over.x ) * ( 1.0 - over.y ) );
	vec3 d = vec3( p, side );
	return axis == 0 ? d.zxy : axis == 1 ? d.yzx : d;

}

vec4 sampleBlurred( vec3 direction ) {

	vec3 a = abs( direction );
	int axis = a.x > a.z && a.x > a.y ? 0 : a.z > a.y ? 2 : 1;
	vec3 d = direction / max( max( a.x, a.y ), a.z );
	float side = d[ axis ];
	vec2 uv = 0.5 * ( axis == 0 ? d.yz : axis == 1 ? d.zx : d.xy ) + 0.5;
	float size = float( textureSize( envMap, 0 ).x );
	vec2 p = uv * size - 0.5;
	vec2 i = floor( p );
	vec2 f = p - i;

	// Fold the cubic weights into two bilinear samples per axis.
	vec2 s1 = ( 1.0 + f * ( 3.0 + f * ( 3.0 - 2.0 * f ) ) ) / 6.0;
	vec2 s0 = 1.0 - s1;
	vec2 q = 1.0 - f;
	vec2 t0 = ( i + 0.5 - q * q * q / ( 6.0 * s0 ) ) / size;
	vec2 t1 = ( i + 1.5 + f * f * f / ( 6.0 * s1 ) ) / size;
	vec4 color = mix(
		mix( textureCube( envMap, cubeDirection( axis, side, vec2( t0.x, t0.y ) ) ), textureCube( envMap, cubeDirection( axis, side, vec2( t1.x, t0.y ) ) ), s1.x ),
		mix( textureCube( envMap, cubeDirection( axis, side, vec2( t0.x, t1.y ) ) ), textureCube( envMap, cubeDirection( axis, side, vec2( t1.x, t1.y ) ) ), s1.x ),
		s1.y
	);

	// Blend to bilinear where three face grids meet.
	vec2 st = abs( 2.0 * uv - 1.0 );
	float texel = 2.0 / size;
	float corner = smoothstep( texel, 2.0 * texel, 1.0 - min( st.x, st.y ) );
	if ( corner < 1.0 ) color = mix( textureCube( envMap, direction ), color, corner );
	return color;

}

void main() {

	#ifdef ENVMAP_TYPE_PMREM

		vec4 texColor = textureLod( envMap, backgroundRotation * vWorldDirection, 0.0 );

	#else

		vec3 direction = backgroundRotation * vWorldDirection;
		vec4 texColor = backgroundBlurriness > 0.0 ? sampleBlurred( direction ) : textureCube( envMap, direction );

	#endif

	texColor.rgb *= backgroundIntensity;

	gl_FragColor = texColor;

	#include <tonemapping_fragment>
	#include <colorspace_fragment>

}
`;
