	vec4 albedoColor = vec4(in_albedo, 0.0);
	vec3 normal_es = normalize( var_normal_es );
	vec3 tangent_es = normalize( var_tangent_es );
	vec3 binormal_es = cross( tangent_es, normal_es );
	vec3 f0 = in_f0;
	vec2 roughness = vec2(in_roughness, in_roughness);
	
	// ---------------------------------
	// Albedo texture
	// ---------------------------------
	#if defined(MAP_MAIN_ALBEDO) || defined(MAP_D1_ALBEDO) || defined(MAP_D2_ALBEDO)
		vec4 tmp_albedo;
	#endif
	#ifdef MAP_MAIN_ALBEDO
		tmp_albedo = texture2D( in_map_main_albedo, var_mainUv * in_scale_main + in_offset_main );
		tmp_albedo *= tmp_albedo;
		albedoColor = BLENDFUNC_MAIN_ALBEDO(albedoColor, tmp_albedo, in_blendfactor1_main_albedo);
	#endif
	#ifdef MAP_D1_ALBEDO
		tmp_albedo = texture2D( in_map_d1_albedo, var_d1Uv * in_scale_d1 + in_offset_d1 );
		tmp_albedo *= tmp_albedo;
		albedoColor = BLENDFUNC_D1_ALBEDO(albedoColor, tmp_albedo, in_blendfactor1_d1_albedo);
	#endif
	#ifdef MAP_D2_ALBEDO
		tmp_albedo = texture2D( in_map_d2_albedo, var_d2Uv * in_scale_d2 + in_offset_d2 );
		tmp_albedo *= tmp_albedo;
		albedoColor = BLENDFUNC_D2_ALBEDO(albedoColor, tmp_albedo, in_blendfactor1_d2_albedo);
	#endif

	// ---------------------------------
	// Normal roughness mapping
	// ---------------------------------
	#ifdef MAP_MAIN_NORMALR
		vec4 nr1 = texture2D( in_map_main_normalr, var_mainUv * in_scale_main + in_offset_main );
		roughness += nr1.zw * in_blendfactor2_main_normalr;
	#endif
	#ifdef MAP_D1_NORMALR
		vec4 nr2 = texture2D( in_map_d1_normalr, var_d1Uv * in_scale_d1 + in_offset_d1 );
		roughness += nr2.zw * in_blendfactor2_d1_normalr;
	#endif
	#ifdef MAP_D2_NORMALR
		vec4 nr3 = texture2D( in_map_d2_normalr, var_d2Uv * in_scale_d2 + in_offset_d2 );
		roughness += nr3.zw * in_blendfactor2_d2_normalr;
	#endif
	#if defined(MAP_MAIN_NORMALR) || defined(MAP_D1_NORMALR) || defined(MAP_D2_NORMALR)
		// Calculate the TBN matrix
		if(length(var_tangent_es) > 0.0)
		{
			mat3 tbnMatrix = mat3( tangent_es, binormal_es, normal_es );
			vec3 normal_tbns = vec3(0.0, 0.0, 0.0);
	#endif
	#ifdef MAP_MAIN_NORMALR
			normal_tbns.xy += vec2(nr1.x - 0.5, 0.5 - nr1.y ) * 2.0 * in_blendfactor1_main_normalr;
	#endif
	#ifdef MAP_D1_NORMALR
			normal_tbns.xy += vec2(nr2.x - 0.5, 0.5 - nr2.y ) * 2.0 * in_blendfactor1_d1_normalr;
	#endif
	#ifdef MAP_D2_NORMALR
			normal_tbns.xy += vec2(nr3.x - 0.5, 0.5 - nr3.y ) * 2.0 * in_blendfactor1_d2_normalr;
	#endif
	#if defined(MAP_MAIN_NORMALR) || defined(MAP_D1_NORMALR) || defined(MAP_D2_NORMALR)
			normal_tbns.z = sqrt( max(1.0 - normal_tbns.x * normal_tbns.x - normal_tbns.y * normal_tbns.y, 0.0) );
			normal_es = tbnMatrix * normalize(normal_tbns);
		}
		roughness = clamp(roughness, 0.0, 1.0);
	#endif

	// ---------------------------------
	// F0 texture
	// ---------------------------------
	#if defined(MAP_MAIN_F0) || defined(MAP_D1_F0) || defined(MAP_D2_F0)
		vec4 f0a;
		vec4 f01 = vec4(f0, 1.0);
	#endif
	#ifdef MAP_MAIN_F0
		f0a = texture2D( in_map_main_f0, var_mainUv * in_scale_main + in_offset_main );
		f01 = BLENDFUNC_MAIN_F0(f01, vec4(f0a.rgb, 1.0) , in_blendfactor1_main_f0);
	#endif
	#ifdef MAP_D1_F0
		f0a = texture2D( in_map_d1_f0, var_d1Uv * in_scale_d1 + in_offset_d1 );
		f01 = BLENDFUNC_D1_F0(f01, vec4(f0a.rgb, 1.0) , in_blendfactor1_d1_f0);
	#endif
	#ifdef MAP_D2_F0
		f0a = texture2D( in_map_d2_f0, var_d2Uv * in_scale_d2 + in_offset_d2 );
		f01 = BLENDFUNC_D2_F0(f01, vec4(f0a.rgb, 1.0) , in_blendfactor1_d2_f0);
	#endif
	#if defined(MAP_MAIN_F0) || defined(MAP_D1_F0) || defined(MAP_D2_F0)
		f0 = clamp(f01.rgb, vec3(0.0, 0.0, 0.0), vec3(1.0, 1.0, 1.0));
	#endif

	// ---------------------------------
	// Pysicaly based shading
	// ---------------------------------
	// A Roughness of 0 causes a infinite small specular reflection which is not possible in reality so we add a small bias to it
	// Roughness^2 is because of a better experience on sliding between 0 and 1. Attention the cube texture look up is linear and without bias!
	vec2 roughnessOffseted = roughness + in_light_roughness_offset;
	vec2 roughnessBiasedXY = roughnessOffseted * roughnessOffseted * (1.0 - ROUGHNESS_BIAS) + ROUGHNESS_BIAS;
	vec3 roughnessBiased = vec3(roughnessBiasedXY.x, roughnessBiasedXY.y, length(roughnessBiasedXY));

	vec3 finalColour = vec3(0.0, 0.0, 0.0);
	vec3 viewDir_es = -normalize(var_position_es);
	float NoV = clamp( dot( normal_es, viewDir_es ), 0.0, 1.0 );
	vec3 alpha = roughnessBiased * roughnessBiased;
    vec3 alpha2 = alpha * alpha;
	
	// ---------------------------------
	// LIGHT_DIR_COUNT x Directional light
	// ---------------------------------
	#if LIGHT_DIR_COUNT > 0
        for( int i = 0; i < LIGHT_DIR_COUNT; i++ )
        {
            vec3 lightDir_es = directionalLights[i].direction;

            vec3 halfWay_es = normalize( lightDir_es + viewDir_es );
            float NoL = clamp( dot( normal_es, lightDir_es), 0.0, 1.0 );
            float NoH = clamp( dot( normal_es, halfWay_es ), 0.00001, 1.0 );
            float VoH = clamp( dot( viewDir_es, halfWay_es ), 0.00001, 1.0 );

            vec3 fs = microfacetBRDF_GGX(NoV, NoL, NoH, VoH, halfWay_es, tangent_es, binormal_es, alpha, alpha2, f0);
            vec3 fd = diffuseBRDF_Disney(NoV, NoL, NoH, VoH, roughnessBiased.z, f0);

            finalColour += (fd * albedoColor.xyz + fs) * directionalLights[i].color * NoL;
        }
    #endif

	// ---------------------------------
	// LIGHT_POINT_COUNT x Point light
	// ---------------------------------
	#if LIGHT_POINT_COUNT > 0
        for( int i = 0; i < LIGHT_POINT_COUNT; i++ )
        {
            vec3 lightDir_es = pointLights[i].position - var_position_es;
            float distance = length( lightDir_es );
            lightDir_es /= distance;

            float atten = 1.0;
            if(pointLights[i].distance > 0.0)
                atten = 1.0 - distance / pointLights[i].distance;

            if(atten > 0.0)
            {
                vec3 halfWay_es = normalize( lightDir_es + viewDir_es );
                float NoL = clamp( dot( normal_es, lightDir_es), 0.0, 1.0 );
                float NoH = clamp( dot( normal_es, halfWay_es ), 0.00001, 1.0 );
                float VoH = clamp( dot( viewDir_es, halfWay_es ), 0.00001, 1.0 );

            	vec3 fs = microfacetBRDF_GGX(NoV, NoL, NoH, VoH, halfWay_es, tangent_es, binormal_es, alpha, alpha2, f0);
                vec3 fd = diffuseBRDF_Disney(NoV, NoL, NoH, VoH, roughnessBiased.z, f0);

                finalColour += (fd * albedoColor.xyz + fs) * pointLights[i].color * NoL * atten;
            }
        }
	#endif

	// ---------------------------------
	// LIGHT_SPOT_COUNT x Spot light
	// ---------------------------------
	#if LIGHT_SPOT_COUNT > 0
        for( int i = 0; i < LIGHT_SPOT_COUNT; i++ )
        {
            vec3 lightDir_es = spotLights[i].position - var_position_es;
            float distance = length( lightDir_es );
            lightDir_es /= distance;

            float atten = 1.0;
            if(spotLights[i].distance > 0.0)
                atten = 1.0 - distance / spotLights[i].distance;

            if(atten > 0.0)
            {
                float spotEffect = dot( spotLights[i].direction, lightDir_es );
                if ( spotEffect > spotLights[i].angleCos )
                {
                    spotEffect = pow(spotEffect, spotLights[i].exponent);

                    vec3 halfWay_es = normalize( lightDir_es + viewDir_es );
                    float NoL = clamp( dot( normal_es, lightDir_es), 0.0, 1.0 );
                    float NoH = clamp( dot( normal_es, halfWay_es ), 0.00001, 1.0 );
                    float VoH = clamp( dot( viewDir_es, halfWay_es ), 0.00001, 1.0 );

            		vec3 fs = microfacetBRDF_GGX(NoV, NoL, NoH, VoH, halfWay_es, tangent_es, binormal_es, alpha, alpha2, f0);
                    vec3 fd = diffuseBRDF_Disney(NoV, NoL, NoH, VoH, roughnessBiased.z, f0);

                    finalColour += (fd * albedoColor.xyz + fs) * spotLights[i].color * NoL * atten * spotEffect;
                }
            }
        }
	#endif
	
	// ---------------------------------
	// Environment Map
	// ---------------------------------
	#ifdef MAP_ENVIRONMENT
	{
		vec3 reflDir_es = reflect( -viewDir_es, normal_es );
		vec3 reflDir_ws = vec3(ivMat * vec4(reflDir_es, 0.0));

		float r = length(roughness);
		float ro = r + in_light_roughness_offset;
		float rBiased = ro * ro * (1.0 - ROUGHNESS_BIAS) + ROUGHNESS_BIAS;

		float targetLodLevel = sqrt(r) * (in_map_environment_mipmapcount + 1.0);
		vec3 cubeColor = textureCubeLod( in_map_environment, reflDir_ws, targetLodLevel ).xyz;
		cubeColor *= cubeColor;
		
		targetLodLevel = in_map_environment_mipmapcount - 1.0; // 2x2 pixel per face
		vec3 cubeColorGlobal = textureCubeLod( in_map_environment, reflDir_ws, targetLodLevel ).xyz;
		cubeColorGlobal *= cubeColorGlobal;

		float NoV = clamp(dot( normal_es, viewDir_es ), -1.0, 1.0);
		if(NoV < 0.0)
			NoV = -NoV * 0.2;

		float NoL = NoV;
		float NoH = 1.0;
		float VoH = NoV;
		
		vec3 fs = (f0 + (1.0 - f0) * pow( 1.0 - NoV, 5.0 ));
		vec3 fd = diffuseBRDF_Disney(NoV, NoL, NoH, VoH, rBiased, f0);

		finalColour += (fd * albedoColor.xyz * cubeColorGlobal + fs * cubeColor) * NoL * in_map_environment_intensity;
	}
	#endif

	// ---------------------------------
	// Bring the result to gamma space if hardware gamma write is disabled
	// ---------------------------------
	finalColour = sqrt(finalColour);

	gl_FragColor = vec4(finalColour.r, finalColour.g, finalColour.b, 1.0);
