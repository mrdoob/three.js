uniform vec3 ambientLightColor;

vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {

#if defined ( PHYSICAL_LIGHTS )

	return ambientLightColor;

#else

	return PI * ambientLightColor;

#endif

}
