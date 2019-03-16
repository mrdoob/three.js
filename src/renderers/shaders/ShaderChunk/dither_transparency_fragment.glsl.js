export default /* glsl */`
#ifdef DITHER_TRANSPARENCY

	if( ( bayerDither4x4( floor( mod( gl_FragCoord.xy, 4.0 ) ) ) ) / 16.0 >= opacity ) discard;

#endif
`;
