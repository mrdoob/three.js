export default /* glsl */`
#ifdef USE_LIGHT_PROBE_VOLUME

uniform highp sampler3D probeGridSH0;
uniform highp sampler3D probeGridSH1;
uniform highp sampler3D probeGridSH2;
uniform highp sampler3D probeGridSH3;
uniform highp sampler3D probeGridSH4;
uniform highp sampler3D probeGridSH5;
uniform highp sampler3D probeGridSH6;

uniform vec3 probeGridMin;
uniform vec3 probeGridMax;

vec3 getLightProbeVolumeIrradiance( vec3 worldPos, vec3 worldNormal ) {

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
	vec4 s3 = texture( probeGridSH3, uvw );
	vec4 s4 = texture( probeGridSH4, uvw );
	vec4 s5 = texture( probeGridSH5, uvw );
	vec4 s6 = texture( probeGridSH6, uvw );

	// Unpack 9 vec3 SH L2 coefficients
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;

	// Evaluate L2 irradiance
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;

	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );

	return max( result, vec3( 0.0 ) );

}

#endif
`;
