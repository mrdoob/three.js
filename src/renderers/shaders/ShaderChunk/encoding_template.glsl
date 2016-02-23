// this is intended to be the body of a macro.  Define the name of the function,
// set the defines and then include this glsl snippet to define its body.

#if defined( MACRO_DECODE )

  #if ( MACRO_DECODE == ENCODING_Linear )
    return value;
  #elif ( MACRO_DECODE == ENCODING_sRGB )
    return sRGBToLinear( value );
  #elif ( MACRO_DECODE == ENCODING_RGBE )
    return RGBEToLinear( value );
  #elif ( MACRO_DECODE == ENCODING_LogLuv )
    return LogLuvToLinear( value );
  #elif ( MACRO_DECODE == ENCODING_RGBM7 )
    return RGBMToLinear( value, 7.0 );
  #elif ( MACRO_DECODE == ENCODING_RGBM16 )
    return RGBMToLinear( value, 16.0 );
  #elif ( MACRO_DECODE == ENCODING_RGBD )
    return RGBDToLinear( value, 256.0 );
  #elif ( MACRO_DECODE == ENCODING_Gamma )
      return GammaToLinear( value, float( GAMMA_FACTOR ) );
  #else
    return vec4( 1.0, 0.0, 0.0, 1.0 );
  #endif

#elif defined( MACRO_ENCODE )

  #if ( MACRO_ENCODE == ENCODING_Linear )
    return value;
  #elif ( MACRO_ENCODE == ENCODING_sRGB )
    return LinearTosRGB( value );
  #elif ( MACRO_ENCODE == ENCODING_RGBE )
    return LinearToRGBE( value );
  #elif ( MACRO_ENCODE == ENCODING_LogLuv )
    return LinearToLogLuv( value );
  #elif ( MACRO_ENCODE == ENCODING_RGBM7 )
    return LinearToRGBM( value, 7.0 );
  #elif ( MACRO_ENCODE == ENCODING_RGBM16 )
    return LinearToRGBM( value, 16.0 );
  #elif ( MACRO_ENCODE == ENCODING_RGBD )
    return LinearToRGBD( value, 256.0 );
  #elif ( MACRO_ENCODE == ENCODING_Gamma )
    return LinearToGamma( value, float( GAMMA_FACTOR ) );
  #else
    return vec4( 1.0, 0.0, 0.0, 1.0 );
  #endif

#endif
