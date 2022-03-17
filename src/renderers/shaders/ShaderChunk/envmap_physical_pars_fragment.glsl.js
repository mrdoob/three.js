export default /* glsl */`
#if defined( USE_ENVMAP )

	uniform float refractionRatio;

	vec3 getIBLIrradiance( const in vec3 normal ) {

		#if defined( ENVMAP_TYPE_CUBE_UV )

			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );

			vec4 envMapColor = textureCubeUV( envMap, worldNormal, 1.0 );

			return PI * envMapColor.rgb * envMapIntensity;

		#else

			return vec3( 0.0 );

		#endif

	}

	vec3 getIBLRadiance( const in vec3 outVec, const in float roughness ) {

		#if defined( ENVMAP_TYPE_CUBE_UV )

			vec3 worldOutVec = inverseTransformDirection( outVec, viewMatrix );

			vec4 envMapColor = textureCubeUV( envMap, worldOutVec, roughness );

			return envMapColor.rgb * envMapIntensity;

		#else

			return vec3( 0.0 );

		#endif

	}

	vec3 getIBLRadianceReflection( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {

		vec3 reflectVec = reflect( -viewDir, normal );

		// Mixing the reflection with the normal is more accurate and keeps rough objects from gathering light from behind their tangent plane.
		reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );

		return getIBLRadiance(reflectVec, roughness);

	}

	vec3 refract2(vec3 viewVec, vec3 Normal, float ior) {
		float vn = dot(viewVec, Normal);
		float k = 1.0 - ior * ior * (1.0 - vn * vn);
		vec3 refrVec = ior * viewVec - (ior * vn + sqrt(k)) * Normal;
		return refrVec;
	}

	vec3 getIBLRadianceRefraction( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {

		vec3 refractVec = refract2( -viewDir, normal, refractionRatio );

		return getIBLRadiance(refractVec, roughness);

	}

#endif
`;
