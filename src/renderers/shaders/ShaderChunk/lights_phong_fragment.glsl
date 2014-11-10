vec3 normal = normalize( vNormal );
vec3 viewPosition = normalize( vViewPosition );

#ifdef DOUBLE_SIDED

	normal = normal * ( -1.0 + 2.0 * float( gl_FrontFacing ) );

#endif

#ifdef USE_NORMALMAP

	normal = perturbNormal2Arb( -vViewPosition, normal );

#elif defined( USE_BUMPMAP )

	normal = perturbNormalArb( -vViewPosition, normal, dHdxy_fwd() );

#endif

#if MAX_POINT_LIGHTS > 0

	vec3 pointDiffuse = vec3( 0.0 );
	vec3 pointSpecular = vec3( 0.0 );

	for ( int i = 0; i < MAX_POINT_LIGHTS; i ++ ) {

		vec4 lPosition = viewMatrix * vec4( pointLightPosition[ i ], 1.0 );
		vec3 lVector = lPosition.xyz + vViewPosition.xyz;

		float lDistance = 1.0;
		if ( pointLightDistance[ i ] > 0.0 )
			lDistance = 1.0 - min( ( length( lVector ) / pointLightDistance[ i ] ), 1.0 );

		lVector = normalize( lVector );

				// diffuse

		float dotProduct = dot( normal, lVector );

		#ifdef WRAP_AROUND

			float pointDiffuseWeightFull = max( dotProduct, 0.0 );
			float pointDiffuseWeightHalf = max( 0.5 * dotProduct + 0.5, 0.0 );

			vec3 pointDiffuseWeight = mix( vec3( pointDiffuseWeightFull ), vec3( pointDiffuseWeightHalf ), wrapRGB );

		#else

			float pointDiffuseWeight = max( dotProduct, 0.0 );

		#endif

		pointDiffuse += diffuse * pointLightColor[ i ] * pointDiffuseWeight * lDistance;

				// specular

		vec3 pointHalfVector = normalize( lVector + viewPosition );
		float pointDotNormalHalf = max( dot( normal, pointHalfVector ), 0.0 );
		float pointSpecularWeight = specularStrength * max( pow( pointDotNormalHalf, shininess ), 0.0 );

		float specularNormalization = ( shininess + 2.0 ) / 8.0;

		vec3 schlick = specular + vec3( 1.0 - specular ) * pow( max( 1.0 - dot( lVector, pointHalfVector ), 0.0 ), 5.0 );
		pointSpecular += schlick * pointLightColor[ i ] * pointSpecularWeight * pointDiffuseWeight * lDistance * specularNormalization;

	}

#endif

#if MAX_SPOT_LIGHTS > 0

	vec3 spotDiffuse = vec3( 0.0 );
	vec3 spotSpecular = vec3( 0.0 );

	for ( int i = 0; i < MAX_SPOT_LIGHTS; i ++ ) {

		vec4 lPosition = viewMatrix * vec4( spotLightPosition[ i ], 1.0 );
		vec3 lVector = lPosition.xyz + vViewPosition.xyz;

		float lDistance = 1.0;
		if ( spotLightDistance[ i ] > 0.0 )
			lDistance = 1.0 - min( ( length( lVector ) / spotLightDistance[ i ] ), 1.0 );

		lVector = normalize( lVector );

		float spotEffect = dot( spotLightDirection[ i ], normalize( spotLightPosition[ i ] - vWorldPosition ) );

		if ( spotEffect > spotLightAngleCos[ i ] ) {

			spotEffect = max( pow( max( spotEffect, 0.0 ), spotLightExponent[ i ] ), 0.0 );

					// diffuse

			float dotProduct = dot( normal, lVector );

			#ifdef WRAP_AROUND

				float spotDiffuseWeightFull = max( dotProduct, 0.0 );
				float spotDiffuseWeightHalf = max( 0.5 * dotProduct + 0.5, 0.0 );

				vec3 spotDiffuseWeight = mix( vec3( spotDiffuseWeightFull ), vec3( spotDiffuseWeightHalf ), wrapRGB );

			#else

				float spotDiffuseWeight = max( dotProduct, 0.0 );

			#endif

			spotDiffuse += diffuse * spotLightColor[ i ] * spotDiffuseWeight * lDistance * spotEffect;

					// specular

			vec3 spotHalfVector = normalize( lVector + viewPosition );
			float spotDotNormalHalf = max( dot( normal, spotHalfVector ), 0.0 );
			float spotSpecularWeight = specularStrength * max( pow( spotDotNormalHalf, shininess ), 0.0 );

			float specularNormalization = ( shininess + 2.0 ) / 8.0;

			vec3 schlick = specular + vec3( 1.0 - specular ) * pow( max( 1.0 - dot( lVector, spotHalfVector ), 0.0 ), 5.0 );
			spotSpecular += schlick * spotLightColor[ i ] * spotSpecularWeight * spotDiffuseWeight * lDistance * specularNormalization * spotEffect;

		}

	}

#endif

#if MAX_DIR_LIGHTS > 0

	vec3 dirDiffuse = vec3( 0.0 );
	vec3 dirSpecular = vec3( 0.0 );

	for( int i = 0; i < MAX_DIR_LIGHTS; i ++ ) {

		vec4 lDirection = viewMatrix * vec4( directionalLightDirection[ i ], 0.0 );
		vec3 dirVector = normalize( lDirection.xyz );

				// diffuse

		float dotProduct = dot( normal, dirVector );

		#ifdef WRAP_AROUND

			float dirDiffuseWeightFull = max( dotProduct, 0.0 );
			float dirDiffuseWeightHalf = max( 0.5 * dotProduct + 0.5, 0.0 );

			vec3 dirDiffuseWeight = mix( vec3( dirDiffuseWeightFull ), vec3( dirDiffuseWeightHalf ), wrapRGB );

		#else

			float dirDiffuseWeight = max( dotProduct, 0.0 );

		#endif

		dirDiffuse += diffuse * directionalLightColor[ i ] * dirDiffuseWeight;

		// specular

		vec3 dirHalfVector = normalize( dirVector + viewPosition );
		float dirDotNormalHalf = max( dot( normal, dirHalfVector ), 0.0 );
		float dirSpecularWeight = specularStrength * max( pow( dirDotNormalHalf, shininess ), 0.0 );

		/*
		// fresnel term from skin shader
		const float F0 = 0.128;

		float base = 1.0 - dot( viewPosition, dirHalfVector );
		float exponential = pow( base, 5.0 );

		float fresnel = exponential + F0 * ( 1.0 - exponential );
		*/

		/*
		// fresnel term from fresnel shader
		const float mFresnelBias = 0.08;
		const float mFresnelScale = 0.3;
		const float mFresnelPower = 5.0;

		float fresnel = mFresnelBias + mFresnelScale * pow( 1.0 + dot( normalize( -viewPosition ), normal ), mFresnelPower );
		*/

		float specularNormalization = ( shininess + 2.0 ) / 8.0;

		// 		dirSpecular += specular * directionalLightColor[ i ] * dirSpecularWeight * dirDiffuseWeight * specularNormalization * fresnel;

		vec3 schlick = specular + vec3( 1.0 - specular ) * pow( max( 1.0 - dot( dirVector, dirHalfVector ), 0.0 ), 5.0 );
		dirSpecular += schlick * directionalLightColor[ i ] * dirSpecularWeight * dirDiffuseWeight * specularNormalization;


	}

#endif

#if MAX_HEMI_LIGHTS > 0

	vec3 hemiDiffuse = vec3( 0.0 );
	vec3 hemiSpecular = vec3( 0.0 );

	for( int i = 0; i < MAX_HEMI_LIGHTS; i ++ ) {

		vec4 lDirection = viewMatrix * vec4( hemisphereLightDirection[ i ], 0.0 );
		vec3 lVector = normalize( lDirection.xyz );

		// diffuse

		float dotProduct = dot( normal, lVector );
		float hemiDiffuseWeight = 0.5 * dotProduct + 0.5;

		vec3 hemiColor = mix( hemisphereLightGroundColor[ i ], hemisphereLightSkyColor[ i ], hemiDiffuseWeight );

		hemiDiffuse += diffuse * hemiColor;

		// specular (sky light)

		vec3 hemiHalfVectorSky = normalize( lVector + viewPosition );
		float hemiDotNormalHalfSky = 0.5 * dot( normal, hemiHalfVectorSky ) + 0.5;
		float hemiSpecularWeightSky = specularStrength * max( pow( max( hemiDotNormalHalfSky, 0.0 ), shininess ), 0.0 );

		// specular (ground light)

		vec3 lVectorGround = -lVector;

		vec3 hemiHalfVectorGround = normalize( lVectorGround + viewPosition );
		float hemiDotNormalHalfGround = 0.5 * dot( normal, hemiHalfVectorGround ) + 0.5;
		float hemiSpecularWeightGround = specularStrength * max( pow( max( hemiDotNormalHalfGround, 0.0 ), shininess ), 0.0 );

		float dotProductGround = dot( normal, lVectorGround );

		float specularNormalization = ( shininess + 2.0 ) / 8.0;

		vec3 schlickSky = specular + vec3( 1.0 - specular ) * pow( max( 1.0 - dot( lVector, hemiHalfVectorSky ), 0.0 ), 5.0 );
		vec3 schlickGround = specular + vec3( 1.0 - specular ) * pow( max( 1.0 - dot( lVectorGround, hemiHalfVectorGround ), 0.0 ), 5.0 );
		hemiSpecular += hemiColor * specularNormalization * ( schlickSky * hemiSpecularWeightSky * max( dotProduct, 0.0 ) + schlickGround * hemiSpecularWeightGround * max( dotProductGround, 0.0 ) );

	}

#endif

vec3 totalDiffuse = vec3( 0.0 );
vec3 totalSpecular = vec3( 0.0 );

#if MAX_DIR_LIGHTS > 0

	totalDiffuse += dirDiffuse;
	totalSpecular += dirSpecular;

#endif

#if MAX_HEMI_LIGHTS > 0

	totalDiffuse += hemiDiffuse;
	totalSpecular += hemiSpecular;

#endif

#if MAX_POINT_LIGHTS > 0

	totalDiffuse += pointDiffuse;
	totalSpecular += pointSpecular;

#endif

#if MAX_SPOT_LIGHTS > 0

	totalDiffuse += spotDiffuse;
	totalSpecular += spotSpecular;

#endif

#ifdef METAL

	gl_FragColor.xyz = gl_FragColor.xyz * ( emissive + totalDiffuse + ambientLightColor * ambient + totalSpecular );

#else

	gl_FragColor.xyz = gl_FragColor.xyz * ( emissive + totalDiffuse + ambientLightColor * ambient ) + totalSpecular;

#endif