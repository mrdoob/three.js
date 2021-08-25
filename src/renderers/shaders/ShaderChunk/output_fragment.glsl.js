export default /* glsl */`
#ifdef OPAQUE

gl_FragColor = vec4( outgoingLight, 1.0 );

#else

gl_FragColor = vec4( outgoingLight, diffuseColor.a );

#endif
`;
