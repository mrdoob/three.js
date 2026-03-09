export default /* glsl */`
#ifdef USE_LIGHT_PROBE_VOLUME

uniform highp sampler3D probeGridSH0;
uniform highp sampler3D probeGridSH1;
uniform highp sampler3D probeGridSH2;
uniform highp sampler3D probeGridSH3;
uniform highp sampler3D probeGridSH4;

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

	// Unpack L1 coefficients (RGB) and L2 coefficients (luminance)
	vec3 c0 = s0.rgb;
	vec3 c1 = s1.rgb;
	vec3 c2 = s2.rgb;
	vec3 c3 = s3.rgb;

	float c4 = s0.a;
	float c5 = s1.a;
	float c6 = s2.a;
	float c7 = s3.a;
	float c8 = s4.r;

	// Evaluate L1 irradiance (color)
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;

	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;

	// Evaluate L2 irradiance (luminance)
	float l2 = c4 * 2.0 * 0.429043 * x * y;
	l2 += c5 * 2.0 * 0.429043 * y * z;
	l2 += c6 * ( 0.743125 * z * z - 0.247708 );
	l2 += c7 * 2.0 * 0.429043 * x * z;
	l2 += c8 * 0.429043 * ( x * x - y * y );

	result += vec3( l2 );

	return max( result, vec3( 0.0 ) );

}

#endif
`;
