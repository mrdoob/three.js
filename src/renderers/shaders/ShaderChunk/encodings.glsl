// For a discussion of what this is, please read this: http://lousodrome.net/blog/light/2013/05/26/gamma-correct-and-hdr-rendering-in-a-32-bits-buffer/

// These encodings should have the same integer values as THREE.LinearEncoding, THREE.sRGBEncoding, etc...
#define ENCODING_Linear 3000
#define ENCODING_sRGB   3001
#define ENCODING_RGBE   3002
//#define ENCODING_LogLuv 3003
#define ENCODING_RGBM7  3004
#define ENCODING_RGBM16 3005
//#define ENCODING_RGBM16 3007

vec4 LinearToLinear( in vec4 value ) {
  return value;
}

vec4 sRGBToLinear( in vec4 value ) {
  return vec4( pow( value.xyz, vec3( float( GAMMA_FACTOR ) ) ), value.w );
}

vec4 RGBEToLinear( in vec4 value ) {
  return vec4( value.xyz * exp2( value.w*256.0 - 128.0 ), 1.0 );
}

vec4 RGBM7ToLinear( in vec4 value ) {
  return vec4( value.xyz * value.w * 7.0, 1.0 );
}

vec4 RGBM16ToLinear( in vec4 value ) {
  return vec4( value.xyz * value.w * 16.0, 1.0 );
}

vec4 LinearTosRGB( in vec4 value ) {
  return vec4( pow( value.xyz, vec3( 1.0 / float( GAMMA_FACTOR ) ) ), value.w );
}

vec4 LinearToRGBE( in vec4 value ) {
  float maxComponent = max(max(value.r, value.g), value.b );
  float fExp = ceil( log2(maxComponent) );
  return vec4( value.rgb / exp2(fExp), (fExp + 128.0) / 255.0 );
}
