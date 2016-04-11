// expects values in the range of [0,1]x[0,1], returns values in the [0,1] range.
highp float noiseRandom1D( const in vec2 unitUV ) {
  const highp float a = 12.9898;
  const highp float b = 78.233;
  const highp float c = 43758.5453;

  highp float dt= dot(unitUV.xy,vec2(a,b));
  highp float sn= mod(dt, 3.14159265359);
  return fract(sin(sn) * c);
}
highp vec2 noiseRandom2D( const in vec2 unitUV ) {
  return vec2( noiseRandom1D( unitUV ), noiseRandom1D( unitUV + vec2( 0.4, 0.6 ) ) );
}
highp vec3 noiseRandom3D( const in vec2 unitUV ) {
  return vec3( noiseRandom1D( unitUV ), noiseRandom1D( unitUV + vec2( 0.4, 0.6 ) ), noiseRandom1D( unitUV + vec2( 0.6, 0.4 ) ) );
}
