export default /* glsl */`
/**
 * This is a template that can be used to light a material, it uses pluggable
 * RenderEquations (RE)for specific lighting scenarios.
 *
 * Instructions for use:
 * - Ensure that both RE_Direct, RE_IndirectDiffuse and RE_IndirectSpecular are defined
 * - If you have defined an RE_IndirectSpecular, you need to also provide a Material_LightProbeLOD. <---- ???
 * - Create a material parameter that is to be passed as the third parameter to your lighting functions.
 *
 * TODO:
 * - Add area light support.
 * - Add sphere light support.
 * - Add diffuse light probe (irradiance cubemap) support.
 */

GeometricContext geometry;

geometry.position = - vViewPosition;
geometry.normal = normal;
geometry.viewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );

#ifdef CLEARCOAT

	geometry.clearcoatNormal = clearcoatNormal;

#endif

IncidentLight directLight;

#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )

	PointLight pointLight;

	#pragma unroll_loop
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {

		pointLight.position = pointLights[ i ].position;
		pointLight.color = pointLights[ i ].color;
		pointLight.distance = pointLights[ i ].distance;
		pointLight.decay = pointLights[ i ].decay;
		pointLight.shadow = pointLights[ i ].shadow;
		pointLight.shadowBias = pointLights[ i ].shadowBias;
		pointLight.shadowRadius = pointLights[ i ].shadowRadius;
		pointLight.shadowMapSize = pointLights[ i ].shadowMapSize;
		pointLight.shadowCameraNear = pointLights[ i ].shadowCameraNear;
		pointLight.shadowCameraFar = pointLights[ i ].shadowCameraFar;

		getPointDirectLightIrradiance( pointLight, geometry, directLight );

		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		directLight.color *= all( bvec3( pointLight.shadow, directLight.visible, receiveShadow ) ) ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
		#endif

		RE_Direct( directLight, geometry, material, reflectedLight );

	}

#endif

#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )

	SpotLight spotLight;

	#pragma unroll_loop
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {

		spotLight.position = spotLights[ i ].position;
		spotLight.direction = spotLights[ i ].direction;
		spotLight.color = spotLights[ i ].color;
		spotLight.distance = spotLights[ i ].distance;
		spotLight.decay = spotLights[ i ].decay;
		spotLight.coneCos = spotLights[ i ].coneCos;
		spotLight.penumbraCos = spotLights[ i ].penumbraCos;
		spotLight.shadow = spotLights[ i ].shadow;
		spotLight.shadowBias = spotLights[ i ].shadowBias;
		spotLight.shadowRadius = spotLights[ i ].shadowRadius;
		spotLight.shadowMapSize = spotLights[ i ].shadowMapSize;

		getSpotDirectLightIrradiance( spotLight, geometry, directLight );

		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		directLight.color *= all( bvec3( spotLight.shadow, directLight.visible, receiveShadow ) ) ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowBias, spotLight.shadowRadius, vSpotShadowCoord[ i ] ) : 1.0;
		#endif

		RE_Direct( directLight, geometry, material, reflectedLight );

	}

#endif

#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )

	DirectionalLight directionalLight;

	#pragma unroll_loop
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {

		directionalLight.direction = directionalLights[ i ].direction;
		directionalLight.color = directionalLights[ i ].color;
		directionalLight.shadow = directionalLights[ i ].shadow;
		directionalLight.shadowBias = directionalLights[ i ].shadowBias;
		directionalLight.shadowRadius = directionalLights[ i ].shadowRadius;
		directionalLight.shadowMapSize = directionalLights[ i ].shadowMapSize;

		getDirectionalDirectLightIrradiance( directionalLight, geometry, directLight );

		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directLight.color *= all( bvec3( directionalLight.shadow, directLight.visible, receiveShadow ) ) ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif

		RE_Direct( directLight, geometry, material, reflectedLight );

	}

#endif

#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )

	RectAreaLight rectAreaLight;

	#pragma unroll_loop
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {

		rectAreaLight.color = rectAreaLight[ i ].color;
		rectAreaLight.position = rectAreaLight[ i ].position;
		rectAreaLight.halfWidth = rectAreaLight[ i ].halfWidth;
		rectAreaLight.halfHeight = rectAreaLight[ i ].halfHeight;

		RE_Direct_RectArea( rectAreaLight, geometry, material, reflectedLight );

	}

#endif

#if defined( RE_IndirectDiffuse )

	vec3 iblIrradiance = vec3( 0.0 );

	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );

	irradiance += getLightProbeIrradiance( lightProbe, geometry );

	#if ( NUM_HEMI_LIGHTS > 0 )

		HemisphereLight hemisphereLight;

		#pragma unroll_loop
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {

			hemisphereLight.direction = hemisphereLights[ i ].direction;
			hemisphereLight.skyColor = hemisphereLights[ i ].skyColor;
			hemisphereLight.groundColor = hemisphereLights[ i ].groundColor;

			irradiance += getHemisphereLightIrradiance( hemisphereLight, geometry );

		}

	#endif

#endif

#if defined( RE_IndirectSpecular )

	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );

#endif
`;
