#define PI 3.14159
#define PI2 6.28318
#define RECIPROCAL_PI2 0.15915494
#define LOG2 1.442695
#define EPSILON 1e-6

float square( in float a ) { return a*a; }
vec2  square( in vec2 a )  { return vec2( a.x*a.x, a.y*a.y ); }
vec3  square( in vec3 a )  { return vec3( a.x*a.x, a.y*a.y, a.z*a.z ); }
vec4  square( in vec4 a )  { return vec4( a.x*a.x, a.y*a.y, a.z*a.z, a.w*a.w ); }
float saturate( in float a ) { return clamp( a, 0.0, 1.0 ); }
vec2  saturate( in vec2 a )  { return clamp( a, 0.0, 1.0 ); }
vec3  saturate( in vec3 a )  { return clamp( a, 0.0, 1.0 ); }
vec4  saturate( in vec4 a )  { return clamp( a, 0.0, 1.0 ); }
float average( in float a ) { return a; }
float average( in vec2 a )  { return ( a.x + a.y) * 0.5; }
float average( in vec3 a )  { return ( a.x + a.y + a.z) / 3.0; }
float average( in vec4 a )  { return ( a.x + a.y + a.z + a.w) * 0.25; }
float whiteCompliment( in float a ) { return saturate( 1.0 - a ); }
vec2  whiteCompliment( in vec2 a )  { return saturate( vec2(1.0) - a ); }
vec3  whiteCompliment( in vec3 a )  { return saturate( vec3(1.0) - a ); }
vec4  whiteCompliment( in vec4 a )  { return saturate( vec4(1.0) - a ); }
vec3 transformDirection( in vec3 normal, in mat4 matrix ) {
	return normalize( ( matrix * vec4( normal, 0.0 ) ).xyz );
}
// http://en.wikibooks.org/wiki/GLSL_Programming/Applying_Matrix_Transformations
vec3 inverseTransformDirection( in vec3 normal, in mat4 matrix ) {
	return normalize( ( vec4( normal, 0.0 ) * matrix ).xyz );
}
vec3 projectOnPlane(in vec3 point, in vec3 pointOnPlane, in vec3 planeNormal) {
	float distance = dot( planeNormal, point-pointOnPlane );
	return point - distance * planeNormal;
}
float sideOfPlane( in vec3 point, in vec3 pointOnPlane, in vec3 planeNormal ) {
	return sign( dot( point - pointOnPlane, planeNormal ) );
}
vec3 linePlaneIntersect( in vec3 pointOnLine, in vec3 lineDirection, in vec3 pointOnPlane, in vec3 planeNormal ) {
	return pointOnLine + lineDirection * ( dot( planeNormal, pointOnPlane - pointOnLine ) / dot( planeNormal, lineDirection ) );
}
float calcLightAttenuation( float lightDistance, float cutoffDistance, float decayExponent ) {
	if ( decayExponent > 0.0 ) {
	  return pow( saturate( 1.0 - lightDistance / cutoffDistance ), decayExponent );
	}
	return 1.0;
}

vec3 inputToLinear( in vec3 a ) {
#ifdef GAMMA_INPUT
	return pow( a, vec3( float( GAMMA_FACTOR ) ) );
#else
	return a;
#endif
}
vec3 linearToOutput( in vec3 a ) {
#ifdef GAMMA_OUTPUT
	return pow( a, vec3( 1.0 / float( GAMMA_FACTOR ) ) );
#else
	return a;
#endif
}
