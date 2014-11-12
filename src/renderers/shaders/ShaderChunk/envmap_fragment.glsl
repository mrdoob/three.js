#ifdef USE_ENVMAP

	vec3 reflectVec;

	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG )

		vec3 cameraToVertex = normalize( vWorldPosition - cameraPosition );

		// http://en.wikibooks.org/wiki/GLSL_Programming/Applying_Matrix_Transformations
		// Transforming Normal Vectors with the Inverse Transformation

		vec3 worldNormal = normalize( vec3( vec4( normal, 0.0 ) * viewMatrix ) );

		if ( useRefract ) {

			reflectVec = refract( cameraToVertex, worldNormal, refractionRatio );

		} else { 

			reflectVec = reflect( cameraToVertex, worldNormal );

		}

	#else

		reflectVec = vReflect;

	#endif

	#ifdef ENVMAP_TYPE_CUBE
		#ifdef DOUBLE_SIDED

			float flipNormal = ( -1.0 + 2.0 * float( gl_FrontFacing ) );
			vec4 envColor = textureCube( envMap, flipNormal * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );

		#else

			vec4 envColor = textureCube( envMap, vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );

		#endif
	#elif ENVMAP_TYPE_EQUIREC
		vec2 sampleUV;
    sampleUV.y = clamp( reflectVec.y * -0.5 + 0.5, 0.0, 1.0);
   	sampleUV.x = atan( reflectVec.z, reflectVec.x ) * 0.15915494309189533576888376337251 + 0.5; // reciprocal( 2 PI ) + 0.5
   	vec4 envColor = texture2D( envMap, sampleUV );
	#endif

	#ifdef ENVMAP_HDR_INPUT
		#if ENVMAP_HDR_INPUT == HDR_TYPE_RGBM
			envColor.xyz = HDRDecodeRGBM( envColor );
		#elif ENVMAP_HDR_INPUT == HDR_TYPE_RGBD
			envColor.xyz = HDRDecodeRGBD( envColor );
		#elif ENVMAP_HDR_INPUT == HDR_TYPE_RGBE
			envColor.xyz = HDRDecodeRGBE( envColor );
		#endif
	#endif

	#ifdef GAMMA_INPUT

		envColor.xyz *= envColor.xyz;

	#endif

	if ( combine == 1 ) {

		gl_FragColor.xyz = mix( gl_FragColor.xyz, envColor.xyz, specularStrength * reflectivity );

	} else if ( combine == 2 ) {

		gl_FragColor.xyz += envColor.xyz * specularStrength * reflectivity;

	} else {

		gl_FragColor.xyz = mix( gl_FragColor.xyz, gl_FragColor.xyz * envColor.xyz, specularStrength * reflectivity );

	}

#endif