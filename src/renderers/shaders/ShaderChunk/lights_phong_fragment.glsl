vec3 viewDir = normalize( vViewPosition );

vec3 totalReflectedLight = vec3( 0.0 );

#ifdef METAL

	diffuseColor.rgb = diffuseColor.rgb * specular;

#endif

#if MAX_POINT_LIGHTS > 0

	for ( int i = 0; i < MAX_POINT_LIGHTS; i ++ ) {

		vec3 lightDir, lightIntensity;
		getSpotLight( i, lightDir, lightIntensity );

		if( dot( lightIntensity, lightIntensity ) > 0.0 ) {

			vec3 halfDir = normalize( lightDir + viewDir );
			float dotNL = saturate( dot( normal, lightDir ) );
			float dotNH = saturate( dot( normal, halfDir ) );
			float dotLH = saturate( dot( lightDir, halfDir ) );

			totalReflectedLight += (
				BRDF_Lambert( diffuseColor.rgb, dotNL ) +
				BRDF_BlinnPhong( specular, shininess, dotNH, dotLH )
				) * lightIntensity;

		}

	}

#endif

#if MAX_SPOT_LIGHTS > 0

	for ( int i = 0; i < MAX_SPOT_LIGHTS; i ++ ) {

		vec3 lightDir, lightIntensity;
		getSpotLight( i, lightDir, lightIntensity );

		if( dot( lightIntensity, lightIntensity ) > 0.0 ) {

			vec3 halfDir = normalize( lightDir + viewDir );
			float dotNL = saturate( dot( normal, lightDir ) );
			float dotNH = saturate( dot( normal, halfDir ) );
			float dotLH = saturate( dot( lightDir, halfDir ) );

			totalReflectedLight += (
				BRDF_Lambert( diffuseColor.rgb, dotNL ) +
				BRDF_BlinnPhong( specular, shininess, dotNH, dotLH )
				) * lightIntensity;

		}

	}

#endif

#if MAX_DIR_LIGHTS > 0

	for( int i = 0; i < MAX_DIR_LIGHTS; i ++ ) {

		vec3 lightDir, lightIntensity;
		getDirLight( i, lightDir, lightIntensity );

		if( dot( lightIntensity, lightIntensity ) > 0.0 ) {

			vec3 halfDir = normalize( lightDir + viewDir );
			float dotNL = saturate( dot( normal, lightDir ) );
			float dotNH = saturate( dot( normal, halfDir ) );
			float dotLH = saturate( dot( lightDir, halfDir ) );

			totalReflectedLight += (
				BRDF_Lambert( diffuseColor.rgb, dotNL ) +
				BRDF_BlinnPhong( specular, shininess, dotNH, dotLH )
				) * lightIntensity;

		}

	}

#endif

outgoingLight += totalReflectedLight + totalEmissiveLight;
