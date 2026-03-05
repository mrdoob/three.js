export default /* glsl */`
#ifdef USE_IRRADIANCE_PROBE_GRID

uniform highp sampler3D probeGridSH0;
uniform highp sampler3D probeGridSH1;
uniform highp sampler3D probeGridSH2;

uniform vec3 probeGridMin;
uniform vec3 probeGridMax;

vec3 getProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {

	vec3 texSize = vec3( textureSize( probeGridSH0, 0 ) );
	vec3 texSizeMinusOne = texSize - 1.0;
	vec3 gridRange = probeGridMax - probeGridMin;
	vec3 probeSpacing = gridRange / texSizeMinusOne;

	// Offset sample position along normal by half a probe spacing
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probeGridMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * texSizeMinusOne / texSize + 0.5 / texSize;

	vec4 s0 = texture( probeGridSH0, uvw );
	vec4 s1 = texture( probeGridSH1, uvw );
	vec4 s2 = texture( probeGridSH2, uvw );

	// Unpack 4 vec3 SH L1 coefficients
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;

	// Evaluate L1 irradiance
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;

	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;

	return max( result, vec3( 0.0 ) );

}

#endif
`;
