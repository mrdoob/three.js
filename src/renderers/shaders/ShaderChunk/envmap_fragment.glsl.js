export default /* glsl */`
#ifdef USE_ENVMAP

	#ifdef ENV_WORLDPOS

		vec3 cameraToVertex = normalize( vWorldPosition - cameraPosition );

		// Transforming Normal Vectors with the Inverse Transformation
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );

		#ifdef ENVMAP_MODE_REFLECTION

			vec3 reflectVec = reflect( cameraToVertex, worldNormal );

		#else

			vec3 reflectVec = refract( cameraToVertex, worldNormal, refractionRatio );

		#endif

	#else

		vec3 reflectVec = vReflect;

	#endif

	#ifdef ENVMAP_TYPE_CUBE

		vec4 envColor = textureCube( envMap, vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );

	#elif defined( ENVMAP_TYPE_EQUIREC )

		vec2 sampleUV;

		reflectVec = normalize( reflectVec );

		sampleUV.y = asin( clamp( reflectVec.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;

		sampleUV.x = atan( reflectVec.z, reflectVec.x ) * RECIPROCAL_PI2 + 0.5;

		vec4 envColor = texture2D( envMap, sampleUV );

	#elif defined( ENVMAP_TYPE_SPHERE )

		reflectVec = normalize( reflectVec );

		vec3 reflectView = normalize( ( viewMatrix * vec4( reflectVec, 0.0 ) ).xyz + vec3( 0.0, 0.0, 1.0 ) );

		vec4 envColor = texture2D( envMap, reflectView.xy * 0.5 + 0.5 );

	#else

		vec4 envColor = vec4( 0.0 );

	#endif

	envColor = envMapTexelToLinear( envColor );

	#ifdef ENVMAP_BLENDING_MULTIPLY

		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );

	#elif defined( ENVMAP_BLENDING_MIX )

		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );

	#elif defined( ENVMAP_BLENDING_ADD )

		outgoingLight += envColor.xyz * specularStrength * reflectivity;

	#endif

#endif
`;
