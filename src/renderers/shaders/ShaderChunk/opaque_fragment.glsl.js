export default /* glsl */`
#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif

#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif

#ifdef BLENDING_ADDITIVE

	gl_FragColor = vec4( outgoingLight * diffuseColor.a, 1.0 );

#else

	gl_FragColor = vec4( outgoingLight, diffuseColor.a );

#endif
`;
