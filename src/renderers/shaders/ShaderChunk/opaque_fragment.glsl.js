export default /* glsl */`
#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif

#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif

#ifdef PREMULTIPLIED_ALPHA

// Convert to sRGB, apply premultiplied alpha, convert back to linear.
// This ensures correct blending in sRGB framebuffers.
vec3 srgb = sRGBTransferOETF( vec4( outgoingLight, 1.0 ) ).rgb;
srgb *= diffuseColor.a;
gl_FragColor = vec4( sRGBTransferEOTF( vec4( srgb, 1.0 ) ).rgb, diffuseColor.a );

#else

gl_FragColor = vec4( outgoingLight, diffuseColor.a );

#endif
`;
