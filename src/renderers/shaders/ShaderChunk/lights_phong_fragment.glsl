vec3 viewDir = normalize( vViewPosition );

vec3 totalReflectedLight = vec3( 0.0 );

vec3 diffuse = diffuseColor.rgb;

#ifdef METAL

	diffuse *= specular;

#endif

#if MAX_POINT_LIGHTS > 0

	for ( int i = 0; i < MAX_POINT_LIGHTS; i ++ ) {

		vec3 lightDir, lightIntensity;
		getPointLightDirect( pointLights[i], -vViewPosition, lightDir, lightIntensity );

		if( dot( lightIntensity, lightIntensity ) > 0.0 ) {


			vec3 halfDir = normalize( lightDir + viewDir ) * singleTestPointLight.distance;
			float dotNL = saturate( dot( normal, lightDir ) );
			float dotNH = saturate( dot( normal, halfDir ) );
			float dotLH = saturate( dot( lightDir, halfDir ) );

			totalReflectedLight += (
				BRDF_Lambert( diffuse, dotNL ) +
				BRDF_BlinnPhong( specular, shininess, dotNH, dotLH )
				) * lightIntensity;

		}

	}

#endif

#if MAX_SPOT_LIGHTS > 0

	for ( int i = 0; i < MAX_SPOT_LIGHTS; i ++ ) {

		vec3 lightDir, lightIntensity;
		getSpotLightDirect( spotLights[i], -vViewPosition, lightDir, lightIntensity );

		if( dot( lightIntensity, lightIntensity ) > 0.0 ) {

			vec3 halfDir = normalize( lightDir + viewDir );
			float dotNL = saturate( dot( normal, lightDir ) );
			float dotNH = saturate( dot( normal, halfDir ) );
			float dotLH = saturate( dot( lightDir, halfDir ) );

			totalReflectedLight += (
				BRDF_Lambert( diffuse, dotNL ) +
				BRDF_BlinnPhong( specular, shininess, dotNH, dotLH )
				) * lightIntensity;

		}

	}

#endif

#if MAX_DIR_LIGHTS > 0

	for( int i = 0; i < MAX_DIR_LIGHTS; i ++ ) {

		vec3 lightDir, lightIntensity;
		getDirLightDirect( directionalLights[i], lightDir, lightIntensity );

		if( dot( lightIntensity, lightIntensity ) > 0.0 ) {

			vec3 halfDir = normalize( lightDir + viewDir );
			float dotNL = saturate( dot( normal, lightDir ) );
			float dotNH = saturate( dot( normal, halfDir ) );
			float dotLH = saturate( dot( lightDir, halfDir ) );

			totalReflectedLight += (
				BRDF_Lambert( diffuse, dotNL ) +
				BRDF_BlinnPhong( specular, shininess, dotNH, dotLH )
				) * lightIntensity;

		}

	}

#endif

outgoingLight += totalReflectedLight + totalEmissiveLight;
