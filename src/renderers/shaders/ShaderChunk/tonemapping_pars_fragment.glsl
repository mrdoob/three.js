#define saturate(a) clamp( a, 0.0, 1.0 )

uniform float toneMappingExposure;
uniform float toneMappingWhitePoint;

vec3 LinearToneMapping( vec3 color ) {

  return toneMappingExposure * color;

}
vec3 ReinhardToneMapping( vec3 color ) {

  color *= toneMappingExposure;
  return saturate( color / ( vec3( 1.0 ) + color ) );

}

#define Uncharted2Helper( x ) max( ( ( x * ( 0.15 * x + 0.10 * 0.50 ) + 0.20 * 0.02 ) / ( x * ( 0.15 * x + 0.50 ) + 0.20 * 0.30 ) ) - 0.02 / 0.30, vec3( 0.0 ) )

vec3 Uncharted2ToneMapping( vec3 color ) {

  color *= toneMappingExposure;
  return saturate( Uncharted2Helper( color ) / Uncharted2Helper( vec3( toneMappingWhitePoint ) ) );

}
