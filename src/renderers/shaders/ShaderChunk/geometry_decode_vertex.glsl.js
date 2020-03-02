export default /* glsl */`
#ifdef USE_PACKED_POSITION
	#if USE_PACKED_POSITION == 0
		transformed = ( vec4(transformed, 1.0) * quantizeMatPos ).xyz;
	#endif
#endif

#ifdef USE_UV
    #ifdef USE_PACKED_UV
        vUv = decodeUV(vUv);
	#endif
#endif
`;