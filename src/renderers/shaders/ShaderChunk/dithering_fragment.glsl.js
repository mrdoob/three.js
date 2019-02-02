export default /* glsl */`
#if defined( DITHERING )

  gl_FragColor.rgb = dithering( gl_FragColor.rgb );

#endif
`;
