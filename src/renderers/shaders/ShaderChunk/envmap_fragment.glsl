#ifdef USE_ENVMAP

	vec3 reflectVec;

	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP )

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

	#ifdef DOUBLE_SIDED

		float flipNormal = ( -1.0 + 2.0 * float( gl_FrontFacing ) );
		vec4 cubeColor = textureCube( envMap, flipNormal * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );

	#else

		vec4 cubeColor = textureCube( envMap, vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );

	#endif

	#ifdef GAMMA_INPUT

		cubeColor.xyz *= cubeColor.xyz;

	#endif

	if ( combine == 1 ) {

		gl_FragColor.xyz = mix( gl_FragColor.xyz, cubeColor.xyz, specularStrength * reflectivity );

	} else if ( combine == 2 ) {

		gl_FragColor.xyz += cubeColor.xyz * specularStrength * reflectivity;

	} else {

		gl_FragColor.xyz = mix( gl_FragColor.xyz, gl_FragColor.xyz * cubeColor.xyz, specularStrength * reflectivity );

	}

#endif