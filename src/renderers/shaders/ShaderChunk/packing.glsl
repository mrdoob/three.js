vec3 packNormalToRGB( const in vec3 normal ) {
  return normalize( normal ) * 0.5 + 0.5;
}

vec3 unpackRGBToNormal( const in vec3 rgb ) {
  return 1.0 - 2.0 * rgb.xyz;
}


vec4 packLinearUnitToRGBA( const in float value ) {
	const vec4 bit_shift = vec4( 256.0 * 256.0 * 256.0, 256.0 * 256.0, 256.0, 1.0 );
	const vec4 bit_mask = vec4( 0.0, 1.0 / 256.0, 1.0 / 256.0, 1.0 / 256.0 );
	vec4 res = mod( value * bit_shift * vec4( 255 ), vec4( 256 ) ) / vec4( 255 );
	res -= res.xxyz * bit_mask;
	return res;
}
float unpackRGBAToLinearUnit( const in vec4 rgba ) {
	const vec4 bitSh = vec4( 1.0 / ( 256.0 * 256.0 * 256.0 ), 1.0 / ( 256.0 * 256.0 ), 1.0 / 256.0, 1.0 );
	return dot( rgba, bitSh );
}

vec4 packDepthToRGBA( const in float depth, const in float near, const in float far ) {
  float unitDepth = ( depth - near ) / ( far - near );
  return packLinearUnitToRGBA( unitDepth );
}
float unpackRGBAToDepth( const in vec4 rgba, const in float near, const in float far ) {
  float unitDepth = unpackRGBAToLinearUnit( rgba );
  return unitDepth * ( far - near ) + near;
}

vec4 packDepthToNearBiasedRGBA( const in float depth, const in float near, const in float far ) {
  float nearBiasedUnitDepth = (( depth - near ) * far ) / (( far - near ) * depth );
  return packLinearUnitToRGBA( nearBiasedUnitDepth );
}
float unpackNearBiasedRGBAToDepth( const in vec4 rgba, const in float near, const in float far ) {
  float nearBiasedUnitDepth = unpackRGBAToLinearUnit( rgba );
  return ( near * far ) / ( ( near - far ) * nearBiasedUnitDepth + far );
}
