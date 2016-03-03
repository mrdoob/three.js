uniform vec3 ambientLightColor;

vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {

#if defined ( PHYSICALLY_CORRECT )

	return ambientLightColor;

#else

	return PI * ambientLightColor;

#endif

}
