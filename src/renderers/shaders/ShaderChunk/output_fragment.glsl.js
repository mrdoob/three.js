export default /* glsl */`
#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif

gl_FragColor = vec4( outgoingLight, diffuseColor.a );
`;
