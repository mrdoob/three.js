export default /* glsl */`
#ifdef DITHER_TRANSPARENCY

	// adapted from https://www.shadertoy.com/view/Mlt3z8
	float bayerDither2x2( vec2 v ) {
		return mod( 3.0 * v.y + 2.0 * v.x, 4.0 );
	}

	float bayerDither4x4( vec2 v ) {
		vec2 P1 = mod( v, 2.0 );
		vec2 P2 = floor( 0.5 * mod( v, 4.0 ) );
		return 4.0 * bayerDither2x2( P1 ) + bayerDither2x2( P2 );
	}

	float bayerDither8x8( vec2 v ) {
		vec2 P1 = mod( v, 2.0 );
		vec2 P2 = floor( 0.5 * mod( v, 4.0 ) );
		vec2 P4 = floor( 0.25 * mod( v, 8.0 ) );
		return 4.0 * ( 4.0 * bayerDither2x2( P1 ) + bayerDither2x2( P2 ) ) + bayerDither2x2( P4 );
	}

#endif
`;
