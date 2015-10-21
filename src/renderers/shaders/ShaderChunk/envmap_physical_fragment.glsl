#ifdef USE_ENVMAP

	float reflectivityFactor = reflectivity; // fix add map - replace specular strength?

	vec3 cameraToVertex = normalize( vWorldPosition - cameraPosition );

	// Transforming Normal Vectors with the Inverse Transformation
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );

	#ifdef ENVMAP_MODE_REFLECTION

		vec3 reflectVec = reflect( cameraToVertex, worldNormal );

	#else

		vec3 reflectVec = refract( cameraToVertex, worldNormal, refractionRatio );

	#endif

	#ifdef DOUBLE_SIDED

		float flipNormal = ( float( gl_FrontFacing ) * 2.0 - 1.0 );

	#else

		float flipNormal = 1.0;

	#endif

	#ifdef ENVMAP_TYPE_CUBE

		#if defined( TEXTURE_CUBE_LOD_EXT )

			float bias = pow( roughness, 0.5 ) * 7.0; // from bhouston - there are other models for this calculation (roughness; not roughnesFactor)

			vec4 envMapColor = textureCubeLodEXT( envMap, flipNormal * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ), bias );

		#else

			vec4 envMapColor = textureCube( envMap, flipNormal * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );

		#endif

	#elif defined( ENVMAP_TYPE_EQUIREC )

		vec2 sampleUV;
		sampleUV.y = saturate( flipNormal * reflectVec.y * 0.5 + 0.5 );
		sampleUV.x = atan( flipNormal * reflectVec.z, flipNormal * reflectVec.x ) * RECIPROCAL_PI2 + 0.5;
		vec4 envMapColor = texture2D( envMap, sampleUV );

	#elif defined( ENVMAP_TYPE_SPHERE )

		vec3 reflectView = flipNormal * normalize((viewMatrix * vec4( reflectVec, 0.0 )).xyz + vec3(0.0,0.0,1.0));
		vec4 envMapColor = texture2D( envMap, reflectView.xy * 0.5 + 0.5 );

	#endif

	envMapColor.rgb = inputToLinear( envMapColor.rgb );

    indirectReflectedLight.specular += envBRDFApprox( specularColor, roughnessFactor, normal, viewDir  ) * envMapColor.rgb * envMapIntensity * reflectivityFactor;

#endif

