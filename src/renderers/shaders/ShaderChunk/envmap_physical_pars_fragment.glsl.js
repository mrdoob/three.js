export default /* glsl */`
#if defined( USE_ENVMAP ) && defined( PHYSICAL )

	#if defined( ENVMAP_TYPE_SH )

		vec3 sampleSHMap(int id) {
			return texture2D(envMap, vec2(float(id) / 8.0, 0)).rgb;
		}

		vec3 shGetRadianceAt( vec3 shCoefficients[9], vec3 normal )
		{
			normal.y *= -1.0;

	    // band 0
	    vec3 result = sampleSHMap(0);

	    // band 1
	    result += sampleSHMap(1) * normal.y;
	    result += sampleSHMap(2) * normal.z;
	    result += sampleSHMap(3) * normal.x;

	    // band 2
	    result += sampleSHMap(4) * ( normal.x*normal.y );
	    result += sampleSHMap(5) * ( normal.y*normal.z );
	    result += sampleSHMap(6) * ( 3.0 * normal.z*normal.z - 1.0 );
	    result += sampleSHMap(7) * ( normal.x*normal.z );
	    result += sampleSHMap(8) * ( normal.x*normal.x - normal.y*normal.y );

	    return result;
		}

		#define C1 0.429043
		#define C2 0.511664
		#define C3 0.743125
		#define C4 0.886227
		#define C5 0.247708

		vec3 shGetIrradianceAt( vec3 normal ) {
			// This does fix the orientation, but would be good to determine why this is "needed"
			normal.y *= -1.0;

		  // band 0
		  vec3 result = sampleSHMap(0) * C4;

		  // band 1
		  result += sampleSHMap(1) * ( 2.0 * C2 * normal.y );
		  result += sampleSHMap(2) * ( 2.0 * C2 * normal.z );
		  result += sampleSHMap(3) * ( 2.0 * C2 * normal.x );

		  // band 2
		  result += sampleSHMap(4) * ( 2.0 * C1 * normal.x*normal.y );
		  result += sampleSHMap(5) * ( 2.0 * C1 * normal.y*normal.z );
		  result += sampleSHMap(6) * ( C3 * normal.z*normal.z - C5 );
		  result += sampleSHMap(7) * ( 2.0 * C1 * normal.x*normal.z );
		  result += sampleSHMap(8) * ( C1 * ( normal.x*normal.x - normal.y*normal.y ) );

		  return result;
		}

	#endif

	vec3 getLightProbeIndirectIrradiance( /*const in SpecularLightProbe specularLightProbe,*/ const in GeometricContext geometry, const in int maxMIPLevel ) {

		vec3 worldNormal = inverseTransformDirection( geometry.normal, viewMatrix );

		#ifdef ENVMAP_TYPE_CUBE

			vec3 queryVec = vec3( flipEnvMap * worldNormal.x, worldNormal.yz );

			// TODO: replace with properly filtered cubemaps and access the irradiance LOD level, be it the last LOD level
			// of a specular cubemap, or just the default level of a specially created irradiance cubemap.

			#ifdef TEXTURE_LOD_EXT

				vec4 envMapColor = textureCubeLodEXT( envMap, queryVec, float( maxMIPLevel ) );

			#else

				// force the bias high to get the last LOD level as it is the most blurred.
				vec4 envMapColor = textureCube( envMap, queryVec, float( maxMIPLevel ) );

			#endif

			envMapColor.rgb = envMapTexelToLinear( envMapColor ).rgb;

		#elif defined( ENVMAP_TYPE_CUBE_UV )

			vec3 queryVec = vec3( flipEnvMap * worldNormal.x, worldNormal.yz );
			vec4 envMapColor = textureCubeUV( envMap, queryVec, 1.0 );

		#elif defined( ENVMAP_TYPE_SH )

			vec3 queryVec = vec3( flipEnvMap * worldNormal.x, worldNormal.yz );
			vec3 envMapColor = shGetIrradianceAt( queryVec );

		#else

			vec4 envMapColor = vec4( 0.0 );

		#endif

		return PI * envMapColor.rgb * envMapIntensity;

	}

	// taken from here: http://casual-effects.blogspot.ca/2011/08/plausible-environment-lighting-in-two.html
	float getSpecularMIPLevel( const in float blinnShininessExponent, const in int maxMIPLevel ) {

		//float envMapWidth = pow( 2.0, maxMIPLevelScalar );
		//float desiredMIPLevel = log2( envMapWidth * sqrt( 3.0 ) ) - 0.5 * log2( pow2( blinnShininessExponent ) + 1.0 );

		float maxMIPLevelScalar = float( maxMIPLevel );
		float desiredMIPLevel = maxMIPLevelScalar + 0.79248 - 0.5 * log2( pow2( blinnShininessExponent ) + 1.0 );

		// clamp to allowable LOD ranges.
		return clamp( desiredMIPLevel, 0.0, maxMIPLevelScalar );

	}

	vec3 getLightProbeIndirectRadiance( /*const in SpecularLightProbe specularLightProbe,*/ const in GeometricContext geometry, const in float blinnShininessExponent, const in int maxMIPLevel ) {

		#ifdef ENVMAP_MODE_REFLECTION

			vec3 reflectVec = reflect( -geometry.viewDir, geometry.normal );

		#else

			vec3 reflectVec = refract( -geometry.viewDir, geometry.normal, refractionRatio );

		#endif

		reflectVec = inverseTransformDirection( reflectVec, viewMatrix );

		float specularMIPLevel = getSpecularMIPLevel( blinnShininessExponent, maxMIPLevel );

		#ifdef ENVMAP_TYPE_CUBE

			vec3 queryReflectVec = vec3( flipEnvMap * reflectVec.x, reflectVec.yz );

			#ifdef TEXTURE_LOD_EXT

				vec4 envMapColor = textureCubeLodEXT( envMap, queryReflectVec, specularMIPLevel );

			#else

				vec4 envMapColor = textureCube( envMap, queryReflectVec, specularMIPLevel );

			#endif

			envMapColor.rgb = envMapTexelToLinear( envMapColor ).rgb;

		#elif defined( ENVMAP_TYPE_CUBE_UV )

			vec3 queryReflectVec = vec3( flipEnvMap * reflectVec.x, reflectVec.yz );
			vec4 envMapColor = textureCubeUV( envMap, queryReflectVec, BlinnExponentToGGXRoughness(blinnShininessExponent ));

		#elif defined( ENVMAP_TYPE_EQUIREC )

			vec2 sampleUV;
			sampleUV.y = asin( clamp( reflectVec.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
			sampleUV.x = atan( reflectVec.z, reflectVec.x ) * RECIPROCAL_PI2 + 0.5;

			#ifdef TEXTURE_LOD_EXT

				vec4 envMapColor = texture2DLodEXT( envMap, sampleUV, specularMIPLevel );

			#else

				vec4 envMapColor = texture2D( envMap, sampleUV, specularMIPLevel );

			#endif

			envMapColor.rgb = envMapTexelToLinear( envMapColor ).rgb;

		#elif defined( ENVMAP_TYPE_SPHERE )

			vec3 reflectView = normalize( ( viewMatrix * vec4( reflectVec, 0.0 ) ).xyz + vec3( 0.0,0.0,1.0 ) );

			#ifdef TEXTURE_LOD_EXT

				vec4 envMapColor = texture2DLodEXT( envMap, reflectView.xy * 0.5 + 0.5, specularMIPLevel );

			#else

				vec4 envMapColor = texture2D( envMap, reflectView.xy * 0.5 + 0.5, specularMIPLevel );

			#endif

			envMapColor.rgb = envMapTexelToLinear( envMapColor ).rgb;

		#elif defined( ENVMAP_TYPE_SH )

			vec3 queryReflectVec = vec3( flipEnvMap * reflectVec.x, reflectVec.yz );
			vec3 envMapColor = shGetIrradianceAt(queryReflectVec);

		#endif

		return envMapColor.rgb * envMapIntensity;

	}

#endif
`;
