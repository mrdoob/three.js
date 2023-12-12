export default /* glsl */`
#ifndef saturate
// <common> may have defined saturate() already
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif

uniform float toneMappingExposure;

// exposure only
vec3 LinearToneMapping( vec3 color ) {

	return saturate( toneMappingExposure * color );

}

// source: https://www.cs.utah.edu/docs/techreports/2002/pdf/UUCS-02-001.pdf
vec3 ReinhardToneMapping( vec3 color ) {

	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );

}

// source: http://filmicworlds.com/blog/filmic-tonemapping-operators/
vec3 OptimizedCineonToneMapping( vec3 color ) {

	// optimized filmic operator by Jim Hejl and Richard Burgess-Dawson
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );

}

// source: https://github.com/selfshadow/ltc_code/blob/master/webgl/shaders/ltc/ltc_blit.fs
vec3 RRTAndODTFit( vec3 v ) {

	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;

}

// this implementation of ACES is modified to accommodate a brighter viewing environment.
// the scale factor of 1/0.6 is subjective. see discussion in #19621.

vec3 ACESFilmicToneMapping( vec3 color ) {

	// sRGB => XYZ => D65_2_D60 => AP1 => RRT_SAT
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ), // transposed from source
		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);

	// ODT_SAT => XYZ => D60_2_D65 => sRGB
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ), // transposed from source
		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);

	color *= toneMappingExposure / 0.6;

	color = ACESInputMat * color;

	// Apply RRT and ODT
	color = RRTAndODTFit( color );

	color = ACESOutputMat * color;

	// Clamp to [0, 1]
	return saturate( color );

}

// AGX Tone Mapping implementation from
// https://iolite-engine.com/blog_posts/minimal_agx_implementation
// https://www.shadertoy.com/view/cd3XWr
// Mean error^2: 3.6705141e-06
vec3 agxDefaultContrastApprox( vec3 x ) {

	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;

	return + 15.5     * x4 * x2
    	- 40.14    * x4 * x
        + 31.96    * x4
        - 6.868    * x2 * x
        + 0.4298   * x2
        + 0.1191   * x
        - 0.00232;

}

vec3 agx( vec3 val ) {

  	const mat3 agx_mat = mat3(
    	0.842479062253094, 0.0423282422610123, 0.0423756549057051,
    	0.0784335999999992,  0.878468636469772,  0.0784336,
    	0.0792237451477643, 0.0791661274605434, 0.879142973793104
	);

  	const float min_ev = -12.47393f;
  	const float max_ev = 4.026069f;

  	// Input transform (inset)
  	val = agx_mat * val;

  	// Log2 space encoding
  	val = clamp(log2(val), min_ev, max_ev);
  	val = (val - min_ev) / (max_ev - min_ev);

  	// Apply sigmoid function approximation
  	val = agxDefaultContrastApprox(val);

  	return val;

}

vec3 agxEotf( vec3 val ) {

  	const mat3 agx_mat_inv = mat3(
    	1.19687900512017, -0.0528968517574562, -0.0529716355144438,
    	-0.0980208811401368, 1.15190312990417, -0.0980434501171241,
    	-0.0990297440797205, -0.0989611768448433, 1.15107367264116
	);

 	// Inverse input transform (outset)
  	val = agx_mat_inv * val;

  	// sRGB IEC 61966-2-1 2.2 Exponent Reference EOTF Display
  	// NOTE: We're linearizing the output here. Comment/adjust when
  	// *not* using a sRGB render target
  	val = pow(val, vec3(2.2));

  	return val;

}

vec3 AgXToneMapping( vec3 color ) {

	color *= toneMappingExposure;
	color = agx( color );
	color = agxEotf( color );
	return color;

}

vec3 CustomToneMapping( vec3 color ) { return color; }
`;
