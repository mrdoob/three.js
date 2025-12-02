export default /* glsl */`
#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif

#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif

#ifdef PREMULTIPLIED_ALPHA

gl_FragColor = vec4( outgoingLight * diffuseColor.a, diffuseColor.a );

#else

gl_FragColor = vec4( outgoingLight, diffuseColor.a );

#endif
`;
