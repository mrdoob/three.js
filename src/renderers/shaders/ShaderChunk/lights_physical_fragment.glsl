
// roughness linear remapping

roughnessFactor = roughnessFactor * 0.5 + 0.5; // disney's remapping of [ 0, 1 ] roughness to [ 0.5, 1 ]


// metalness effect on color

vec3 specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );

diffuseColor.rgb *= ( 1.0 - metalnessFactor );



GeometricContext geometry = GeometricContext( -vViewPosition, normalize( normal ), normalize(vViewPosition ) );

ReflectedLight directReflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ) );
ReflectedLight indirectReflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ) );


#if MAX_POINT_LIGHTS > 0

	for ( int i = 0; i < MAX_POINT_LIGHTS; i ++ ) {

		IncidentLight directLight = getPointDirectLight( pointLights[ i ], geometry );

		BRDF_Lambert( directLight, geometry, diffuse, directReflectedLight );

		BRDF_GGX( directLight, geometry, specularColor, roughnessFactor, directReflectedLight );

	}

#endif

#if MAX_SPOT_LIGHTS > 0

	for ( int i = 0; i < MAX_SPOT_LIGHTS; i ++ ) {

		IncidentLight directLight = getSpotDirectLight( pointLights[ i ], geometry );

		BRDF_Lambert( directLight, geometry, diffuse, directReflectedLight );

		BRDF_GGX( directLight, geometry, specularColor, roughnessFactor, directReflectedLight );

	}

#endif

#if MAX_DIR_LIGHTS > 0

	for ( int i = 0; i < MAX_DIR_LIGHTS; i ++ ) {

		IncidentLight directLight = getDirectionalDirectLight( pointLights[ i ], geometry );

		BRDF_Lambert( directLight, geometry, diffuse, directReflectedLight );

		BRDF_GGX( directLight, geometry, specularColor, roughnessFactor, directReflectedLight );

	}

#endif

#if MAX_HEMI_LIGHTS > 0

	for ( int i = 0; i < MAX_HEMI_LIGHTS; i ++ ) {

		IncidentLight indirectLight = getHemisphereIndirectLight( hemisphereLights[ i ], geometry );

		BRDF_Lambert( indirectLight, geometry, diffuse, indirectReflectedLight );

	}

#endif
