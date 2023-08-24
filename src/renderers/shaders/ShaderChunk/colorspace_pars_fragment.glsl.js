export default /* glsl */`

// http://www.russellcottrell.com/photo/matrixCalculator.htm

mat3 REC709_TO_P3 = transpose( mat3(
	0.8224621, 0.0331941, 0.0170827,
	0.1775380, 0.9668058, 0.0723974,
	-0.0000001, 0.0000001, 0.9105199
) );

mat3 P3_TO_REC709 = transpose( mat3(
	1.2249401, - 0.0420569, - 0.0196376,
	- 0.2249404, 1.0420571, - 0.0786361,
	0.0000001, 0.0000000, 1.0982735
) );

vec4 Rec709ToP3( in vec4 value ) {
	return vec4( value.rgb * REC709_TO_P3, value.a );
}

vec4 P3ToRec709( in vec4 value ) {
	return vec4( value.rgb * P3_TO_REC709, value.a );
}

vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}

vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}
`;
