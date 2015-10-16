#if MAX_HEMI_LIGHTS > 0

	for ( int i = 0; i < MAX_HEMI_LIGHTS; i ++ ) {

		vec3 lightDir = hemisphereLightDirection[ i ];

		float dotProduct = dot( normal, lightDir );

		float hemiDiffuseWeight = 0.5 * dotProduct + 0.5;

		vec3 lightColor = mix( hemisphereLightGroundColor[ i ], hemisphereLightSkyColor[ i ], hemiDiffuseWeight );

		totalAmbientLight += lightColor;

	}

#endif

