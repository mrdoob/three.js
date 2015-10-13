const float PI = 3.14159;
const float PI2 = 6.28318;
const float RECIPROCAL_PI = 0.31830988618;
const float RECIPROCAL_PI2 = 0.15915494;
const float LOG2 = 1.442695;
const float EPSILON = 1e-6;

float	square( const in float a ) { return a*a; }
float	saturate( const in float a ) { return clamp( a, 0.0, 1.0 ); }
vec3	saturate( const in vec3 a ) { return clamp( a, 0.0, 1.0 ); }
vec3	whiteCompliment( const in vec3 color ) { return 1.0 - saturate( color ); }
float	luminance( const in vec3 color ) { return dot( color, vec3( 0.2125, 0.7154, 0.0721 ) ); }
float	average( const in vec3 color ) { return dot( color, vec3( 0.3333 ) ); }


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
