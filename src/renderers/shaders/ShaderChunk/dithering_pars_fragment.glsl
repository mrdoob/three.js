// based on https://www.shadertoy.com/view/MslGR8
vec3 dithering( vec3 color ) {
	//Calculate grid position
	float grid_position = fract( dot( gl_FragCoord.xy - vec2( 0.5, 0.5 ) , vec2( 1.0 / 16.0, 10.0 / 36.0 ) + 0.25 ) );

	//Shift the individual colors differently, thus making it even harder to see the dithering pattern
	vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );

	//modify shift acording to grid position.
	dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );

	//shift the color by dither_shift
	return color + 0.5 / 255.0 + dither_shift_RGB;
}