export default /* glsl */`
#ifdef DITHER_TRANSPARENCY

	if( ( bayerDither8x8( floor( mod( gl_FragCoord.xy, 8.0 ) ) ) ) / 64.0 >= opacity ) discard;

#endif
`;
