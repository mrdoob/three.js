#ifndef FLAT_SHADED

	vec3 normal = normalize( vNormal );

	#ifdef DOUBLE_SIDED

		normal = normal * ( -1.0 + 2.0 * float( gl_FrontFacing ) );

	#endif

#else

	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );

#endif

#ifdef USE_NORMALMAP

	normal = perturbNormal2Arb( -vViewPosition, normal );

#elif defined( USE_BUMPMAP )

	normal = perturbNormalArb( -vViewPosition, normal, dHdxy_fwd() );

#endif

vec3 viewDir = normalize( vViewPosition );

vec3 totalDiffuseLight = vec3( 0.0 );
vec3 totalSpecularLight = vec3( 0.0 );

#if MAX_POINT_LIGHTS > 0

	for ( int i = 0; i < MAX_POINT_LIGHTS; i ++ ) {

		#ifdef LIGHT_USE_TEXTURE
			
			vec4 point1 = texture2D(lightTexture, vec2( 1.0/8.0 ,float(MAX_DIR_LIGHTS + i) * 1.0 / 128.0 - 1.0 / 256.0 ));
			vec4 point2 = texture2D(lightTexture, vec2( 3.0/8.0 ,float(MAX_DIR_LIGHTS + i) * 1.0 / 128.0 - 1.0 / 256.0 ));
			
			vec3 pointLightColorI =  point1.xyz;
			vec3 pointLightPositionI = vec3( point1.w, point2.x, point2.y );
			float pointLightDistanceI = point2.z;
			float pointLightDecayI = point2.w;
			
		#else 
			
			vec3 pointLightColorI =  pointLightColor[ i ];
			vec3 pointLightPositionI = pointLightPosition[ i ];
			float pointLightDistanceI = pointLightDistance[ i ];
			float pointLightDecayI = pointLightDecay[ i ];
			
		#endif

		vec3 lightColor = pointLightColorI;

		vec3 lightPosition = pointLightPositionI;
		vec3 lVector = lightPosition + vViewPosition.xyz;

		vec3 lightDir = normalize( lVector );

		// attenuation

		float attenuation = calcLightAttenuation( length( lVector ), pointLightDistanceI, pointLightDecayI );

		// diffuse

		float cosineTerm = saturate( dot( normal, lightDir ) );

		totalDiffuseLight += lightColor * attenuation * cosineTerm;

		// specular

		vec3 brdf = BRDF_BlinnPhong( specular, shininess, normal, lightDir, viewDir );

		totalSpecularLight += brdf * specularStrength * lightColor * attenuation * cosineTerm;


	}

#endif

#if MAX_SPOT_LIGHTS > 0

	for ( int i = 0; i < MAX_SPOT_LIGHTS; i ++ ) {

		#ifdef LIGHT_USE_TEXTURE
			
			vec4 point1 = texture2D(lightTexture, vec2( 1.0/8.0 ,float(MAX_DIR_LIGHTS + MAX_POINT_LIGHTS + i) * 1.0 / 128.0 + 1.0 / 256.0));
			vec4 point2 = texture2D(lightTexture, vec2( 3.0/8.0 ,float(MAX_DIR_LIGHTS + MAX_POINT_LIGHTS + i) * 1.0 / 128.0 + 1.0 / 256.0));
			vec4 point3 = texture2D(lightTexture, vec2( 5.0/8.0 ,float(MAX_DIR_LIGHTS + MAX_POINT_LIGHTS + i) * 1.0 / 128.0 + 1.0 / 256.0));
			vec4 point4 = texture2D(lightTexture, vec2( 7.0/8.0 ,float(MAX_DIR_LIGHTS + MAX_POINT_LIGHTS + i) * 1.0 / 128.0 + 1.0 / 256.0));
			
			vec3 pointLightColorI =  point1.xyz;
			vec3 pointLightPositionI = vec3( point1.w, point2.x, point2.y );
			vec3 spotLightDirectionI = vec3( point2.z, point2.w, point3.x );
			float pointLightDistanceI = point3.y;
			float pointLightDecayI = point3.z;
			float spotLightAngleCosI = point4.w;
			float spotLightExponentI = point4.x;
			
		#else 
			
			vec3 spotLightColorI =  spotLightColor[ i ];
			vec3 spotLightPositionI = spotLightPosition[ i ];
			vec3 spotLightDirectionI = spotLightDirection[ i ];
			float spotLightDistanceI = spotLightDistance[ i ];
			float spotLightDecayI = spotLightDecay[ i ];
			float spotLightAngleCosI = spotLightAngleCos[ i ];
			float spotLightExponentI = spotLightExponent[ i ];
			
		#endif

		vec3 lightColor = spotLightColorI;

		vec3 lightPosition = spotLightPositionI;
		vec3 lVector = lightPosition + vViewPosition.xyz;
		vec3 lightDir = normalize( lVector );

		float spotEffect = dot( spotLightDirectionI, lightDir );

		if ( spotEffect > spotLightAngleCosI ) {

			spotEffect = saturate( pow( saturate( spotEffect ), spotLightExponentI ) );

			// attenuation

			float attenuation = calcLightAttenuation( length( lVector ), spotLightDistanceI, spotLightDecayI );

			attenuation *= spotEffect;

			// diffuse

			float cosineTerm = saturate( dot( normal, lightDir ) );

			totalDiffuseLight += lightColor * attenuation * cosineTerm;

			// specular

			vec3 brdf = BRDF_BlinnPhong( specular, shininess, normal, lightDir, viewDir );

			totalSpecularLight += brdf * specularStrength * lightColor * attenuation * cosineTerm;

		}

	}

#endif

#if MAX_DIR_LIGHTS > 0

	for( int i = 0; i < MAX_DIR_LIGHTS; i ++ ) {
		
		#ifdef LIGHT_USE_TEXTURE
			
			vec4 point1 = texture2D(lightTexture, vec2( 1.0/8.0 ,float(i) * 1.0 / 128.0 - 1.0 / 256.0 ));
			vec4 point2 = texture2D(lightTexture, vec2( 3.0/8.0 ,float(i) * 1.0 / 128.0 - 1.0 / 256.0 ));
			
			vec3 directionalLightColorI =  point1.xyz;
			vec3 directionalLightDirectionI = vec3( point1.w, point2.x, point2.y );
			
		#else 
			
			vec3 directionalLightColorI =  directionalLightColor[ i ];
			vec3 directionalLightDirectionI = directionalLightDirection[ i ];
			
		#endif


		vec3 lightColor = directionalLightColorI;

		vec3 lightDir = directionalLightDirectionI;

		// diffuse

		float cosineTerm = saturate( dot( normal, lightDir ) );

		totalDiffuseLight += lightColor * cosineTerm;

		// specular

		vec3 brdf = BRDF_BlinnPhong( specular, shininess, normal, lightDir, viewDir );

		totalSpecularLight += brdf * specularStrength * lightColor * cosineTerm;

	}

#endif

#if MAX_HEMI_LIGHTS > 0

	for( int i = 0; i < MAX_HEMI_LIGHTS; i ++ ) {
		
		#ifdef LIGHT_USE_TEXTURE
			
			vec4 point1 = texture2D(lightTexture, vec2( 1.0/8.0 ,float(MAX_DIR_LIGHTS + MAX_POINT_LIGHTS + MAX_SPOT_LIGHTS + i) * 1.0 / 128.0 + 1.0 / 256.0));
			vec4 point2 = texture2D(lightTexture, vec2( 3.0/8.0 ,float(MAX_DIR_LIGHTS + MAX_POINT_LIGHTS + MAX_SPOT_LIGHTS + i) * 1.0 / 128.0 + 1.0 / 256.0));
			vec4 point3 = texture2D(lightTexture, vec2( 5.0/8.0 ,float(MAX_DIR_LIGHTS + MAX_POINT_LIGHTS + MAX_SPOT_LIGHTS + i) * 1.0 / 128.0 + 1.0 / 256.0));
			
			vec3 hemisphereLightSkyColorI =  point1.xyz;
			vec3 hemisphereLightGroundColorI = vec3( point1.w, point2.x, point2.y );
			vec3 hemisphereLightDirectionI = vec3( point2.z, point2.w, point3.x );
			
		#else 
			
			vec3 hemisphereLightDirectionI =  hemisphereLightDirection[ i ];
			vec3 hemisphereLightSkyColorI = hemisphereLightSkyColor[ i ];
			vec3 hemisphereLightGroundColorI = hemisphereLightGroundColor[ i ];

		#endif

		vec3 lightDir = hemisphereLightDirectionI;

		// diffuse

		float dotProduct = dot( normal, lightDir );

		float hemiDiffuseWeight = 0.5 * dotProduct + 0.5;

		vec3 lightColor = mix( hemisphereLightGroundColorI, hemisphereLightSkyColorI, hemiDiffuseWeight );

		totalDiffuseLight += lightColor;

		// specular (sky term only)

		vec3 brdf = BRDF_BlinnPhong( specular, shininess, normal, lightDir, viewDir );

		totalSpecularLight += brdf * specularStrength * lightColor * max( dotProduct, 0.0 );

	}

#endif

#ifdef METAL

	outgoingLight += diffuseColor.rgb * ( totalDiffuseLight + totalAmbientLight ) * specular + totalSpecularLight + totalEmissiveLight;

#else

	outgoingLight += diffuseColor.rgb * ( totalDiffuseLight + totalAmbientLight ) + totalSpecularLight + totalEmissiveLight;

#endif
