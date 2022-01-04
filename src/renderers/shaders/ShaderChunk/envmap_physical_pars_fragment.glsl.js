export default /* glsl */`
#if defined( USE_ENVMAP )

	#ifdef ENVMAP_MODE_REFRACTION

		uniform float refractionRatio;

	#endif

	vec3 getIBLIrradiance( const in vec3 normal, const in int maxMIPLevel ) {

		#if defined( ENVMAP_TYPE_CUBE_UV )

			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );

			vec4 envMapColor = textureCubeUV( envMap, worldNormal, 1.0 );

			return PI * envMapColor.rgb * envMapIntensity;

		#elif defined ( ENVMAP_TYPE_CUBE )

			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );

			vec3 queryVec = vec3( flipEnvMap * worldNormal.x, worldNormal.yz );

			#ifdef TEXTURE_LOD_EXT

				vec4 envMapColor = textureCubeLodEXT( envMap, queryVec, float( maxMIPLevel ) );

			#else

				// force the bias high to get the last LOD level as it is the most blurred.
				vec4 envMapColor = textureCube( envMap, queryVec, float( maxMIPLevel ) );

			#endif

			return PI * envMapColor.rgb * envMapIntensity;

		#else

			return vec3( 0.0 );

		#endif

	}

	#if defined( ENVMAP_TYPE_CUBE )

		// Trowbridge-Reitz distribution to Mip level, following the logic of http://casual-effects.blogspot.ca/2011/08/plausible-environment-lighting-in-two.html
		float getSpecularMIPLevel( const in float roughness, const in int maxMIPLevel ) {

			float maxMIPLevelScalar = float( maxMIPLevel );

			float sigma = PI * roughness * roughness / ( 1.0 + roughness );
			float desiredMIPLevel = maxMIPLevelScalar + log2( sigma );

			// clamp to allowable LOD ranges.
			return clamp( desiredMIPLevel, 0.0, maxMIPLevelScalar );

		}

	#endif

	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in int maxMIPLevel ) {

		vec3 reflectVec;

		#ifdef ENVMAP_MODE_REFLECTION

			reflectVec = reflect( - viewDir, normal );

			// Mixing the reflection with the normal is more accurate and keeps rough objects from gathering light from behind their tangent plane.
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );

		#else

			reflectVec = refract( - viewDir, normal, refractionRatio );

		#endif

		reflectVec = inverseTransformDirection( reflectVec, viewMatrix );

		#if defined( ENVMAP_TYPE_CUBE_UV )

			vec4 envMapColor = textureCubeUV( envMap, reflectVec, roughness );

			return envMapColor.rgb * envMapIntensity;

		#elif defined( ENVMAP_TYPE_CUBE )

			vec3 queryReflectVec = vec3( flipEnvMap * reflectVec.x, reflectVec.yz );

			float specularMIPLevel = getSpecularMIPLevel( roughness, maxMIPLevel );

			#ifdef TEXTURE_LOD_EXT

				vec4 envMapColor = textureCubeLodEXT( envMap, queryReflectVec, specularMIPLevel );

			#else

				vec4 envMapColor = textureCube( envMap, queryReflectVec, specularMIPLevel );

			#endif

			return envMapColor.rgb * envMapIntensity;

		#else

			return vec3( 0.0 );

		#endif

	}

#endif
`;
