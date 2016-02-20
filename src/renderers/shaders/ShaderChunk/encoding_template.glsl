// this is intended to be the body of a macro.  Define the name of the function,
// set the defines and then include this glsl snippet to define its body.

#if defined( MACRO_DECODE )

  #if ( MACRO_ENCODING_TYPE == ENCODING_Linear )
    return value;
  #elif ( MACRO_ENCODING_TYPE == ENCODING_sRGB )
    return sRGBToLinear( value );
  #elif ( MACRO_ENCODING_TYPE == ENCODING_RGBE )
    return RGBEToLinear( value );
  //#elif ( MACRO_ENCODING_TYPE == ENCODING_LogLuv )  TODO
  //  return LogLuvToLinear( value );
  #elif ( MACRO_ENCODING_TYPE == ENCODING_RGBM7 )
    return RGBM7ToLinear( value );
  #elif ( MACRO_ENCODING_TYPE == ENCODING_RGBM16 )
    return RGBM16ToLinear( value );
  //#elif ( MACRO_ENCODING_TYPE == ENCODING_RGBD )  TODO
  //  return RGBMDToLinear( value );
  #else
    return vec4( 1.0, 0.0, 0.0, 1.0 );
  #endif

#elif defined( MACRO_ENCODE )

  #if ( MACRO_ENCODING_TYPE == ENCODING_Linear )
    return value;
  #elif ( MACRO_ENCODING_TYPE == ENCODING_sRGB )
    return LinearTosRGB( value );
  #elif ( MACRO_ENCODING_TYPE == ENCODING_RGBE )
    return LinearToRGBE( value );
  //#elif ( MACRO_ENCODING_TYPE == ENCODING_LogLuv )  TODO
  //  return LinearToLogLuv( value );
  //#elif ( MACRO_ENCODING_TYPE == ENCODING_RGBM7 )  TODO
  //  return LinearToRGBM7( value );
  //#elif ( MACRO_ENCODING_TYPE == ENCODING_RGBM16 )  TODO
  //  return LinearToRGBM16( value );
  //#elif ( MACRO_ENCODING_TYPE == ENCODING_RGBD )  TODO
  //  return LinearToRGBMD( value );
  #else
    return vec4( 1.0, 0.0, 0.0, 1.0 );
  #endif

#endif
