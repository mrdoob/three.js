vec3 viewDir = normalize( vViewPosition );

vec3 diffuse = diffuseColor.rgb;

#ifdef METAL

	diffuse = vec3( 0.0 );

#endif

#define ENERGY_PRESERVING_MONOCHROME

#ifdef ENERGY_PRESERVING_RGB

	diffuse *= whiteCompliment( specular );

#elif defined( ENERGY_PRESERVING_MONOCHROME )

	diffuse *= whiteCompliment( luminance( specular ) );

#endif

IncidentLight incidentLight;
ReflectedLight directReflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ) );
ReflectedLight indirectReflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ) );

#if MAX_POINT_LIGHTS > 0

	for ( int i = 0; i < MAX_POINT_LIGHTS; i ++ ) {

		getPointIncidentLight( pointLights[ i ], -vViewPosition, incidentLight );

		BRDF_Lambert( incidentLight, normal, diffuse, directReflectedLight );
		//BRDF_OrenNayar( incidentLight, normal, viewDir, diffuse, 0.5, directReflectedLight );

		BRDF_BlinnPhong( incidentLight, normal, viewDir, specular, shininess, directReflectedLight );

	}

#endif

#if MAX_SPOT_LIGHTS > 0

	for ( int i = 0; i < MAX_SPOT_LIGHTS; i ++ ) {

		getSpotIncidentLight( spotLights[ i ], -vViewPosition, incidentLight );

		BRDF_Lambert( incidentLight, normal, diffuse, directReflectedLight );
		//BRDF_OrenNayar( incidentLight, normal, viewDir, diffuse, 0.5, directReflectedLight );

		BRDF_BlinnPhong( incidentLight, normal, viewDir, specular, shininess, directReflectedLight );

	}

#endif

#if MAX_DIR_LIGHTS > 0

	for( int i = 0; i < MAX_DIR_LIGHTS; i ++ ) {

		getDirIncidentLight( directionalLights[ i ], incidentLight );

		BRDF_Lambert( incidentLight, normal, diffuse, directReflectedLight );
		//BRDF_OrenNayar( incidentLight, normal, viewDir, diffuse, 0.5, directReflectedLight );

		BRDF_BlinnPhong( incidentLight, normal, viewDir, specular, shininess, directReflectedLight );

	}

#endif

#if MAX_HEMI_LIGHTS > 0

	for( int i = 0; i < MAX_HEMI_LIGHTS; i ++ ) {

		getHemisphereIncidentLight( hemisphereLights[ i ], normal, incidentLight );

		BRDF_Lambert( incidentLight, normal, diffuse, indirectReflectedLight );
		//BRDF_OrenNayar( incidentLight, normal, viewDir, diffuse, 0.5, indirectReflectedLight );

	}

#endif


outgoingLight +=
	directReflectedLight.specular + directReflectedLight.diffuse +
	indirectReflectedLight.specular + indirectReflectedLight.diffuse +
	totalEmissiveLight;
