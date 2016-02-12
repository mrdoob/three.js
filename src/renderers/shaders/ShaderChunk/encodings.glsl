// For a discussion of what this is, please read this: http://lousodrome.net/blog/light/2013/05/26/gamma-correct-and-hdr-rendering-in-a-32-bits-buffer/

// These encodings should have the same integer values as THREE.Linear, THREE.sRGB, etc...
#define ENCODING_Linear 3000
#define ENCODING_sRGB   3001
#define ENCODING_RGBE   3002
//#define ENCODING_LogLuv 3003
#define ENCODING_RGBM7  3004
#define ENCODING_RGBM16 3005
//#define ENCODING_RGBM16 3007

vec4 texelDecode( in vec4 encodedTexel, in int encoding ) {

  // Q: should we use a switch statement here instead of a set of ifs?

  if( encoding == ENCODING_Linear ) {
    return encodedTexel;
  }

  if( encoding == ENCODING_sRGB ) {
    return vec4( pow( encodedTexel.xyz, vec3( 2.2 ) ), encodedTexel.w );
  }

  if( encoding == ENCODING_RGBE ) {
    return vec4( encodedTexel.xyz * exp2( encodedTexel.w*256.0 - 128.0 ), 1.0 );
  }

  // TODO, see here http://graphicrants.blogspot.ca/2009/04/rgbm-color-encoding.html
  //if( encoding == ENCODING_LogLuv ) {
  //}

  if( encoding == ENCODING_RGBM7 ) {
    return vec4( encodedTexel.xyz * encodedTexel.w * 7.0, 1.0 );
  }

  if( encoding == ENCODING_RGBM16 ) {
    return vec4( encodedTexel.xyz * encodedTexel.w * 16.0, 1.0 );
  }

  // TODO
  //if( encoding == ENCODING_RGBD ) {
  //}

  // return red when encoding not supported
  return vec4( 1.0, 0.0, 0.0, 1.0 );

}

vec4 texelEncode( in vec4 linearRgba, in int encoding )
{

  // Q: should we use a switch statement here instead of a set of ifs?

  if( encoding == ENCODING_Linear ) {
    return linearRgba;
  }

  if( encoding == ENCODING_sRGB ) {
    return vec4( pow( linearRgba.xyz, vec3( 0.4545 ) ), linearRgba.w );
  }

  if( encoding == ENCODING_RGBE ) {
    float maxComponent = max(max(linearRgba.r, linearRgba.g), linearRgba.b );
    float fExp = ceil( log2(maxComponent) );
    return vec4( linearRgba.rgb / exp2(fExp), (fExp + 128.0) / 255.0 );
  }

  // TODO, see here http://graphicrants.blogspot.ca/2009/04/rgbm-color-encoding.html
  //if( encoding == ENCODING_LogLuv ) {
  //}

  // TODO
  //if( encoding == ENCODING_RGBM7 ) {
  //}

  // TODO
  //if( encoding == ENCODING_RGBM16 ) {
  //}

  // TODO
  //if( encoding == ENCODING_RGBD ) {
  //}

  // return red when encoding not supported
  return vec4( 1.0, 0.0, 0.0, 1.0 );

}
