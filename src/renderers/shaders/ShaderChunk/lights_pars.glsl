uniform vec3 ambientLightColor;


#if MAX_DIR_LIGHTS > 0

	struct DirectionalLight {
	  vec3 direction;
	  vec3 color;
	};

	uniform DirectionalLight directionalLights[ MAX_DIR_LIGHTS ];

	IncidentLight getDirectionalDirectLight( const in DirectionalLight directionalLight, const in GeometricContext geometry ) { 

		IncidentLight directLight;
	
		directLight.color = directionalLight.color;
		directLight.direction = directionalLight.direction; 

		return directLight;
	}

#endif


#if MAX_POINT_LIGHTS > 0

	struct PointLight {
	  vec3 position;
	  vec3 color;
	  float distance;
	  float decay;
	};

	uniform PointLight pointLights[ MAX_POINT_LIGHTS ];

	IncidentLight getPointDirectLight( const in PointLight pointLight, const in GeometricContext geometry ) { 
	
		IncidentLight directLight;
	
		vec3 lVector = pointLight.position - geometry.position; 
		directLight.direction = normalize( lVector ); 
	
		directLight.color = pointLight.color; 
		directLight.color *= calcLightAttenuation( length( lVector ), pointLight.distance, pointLight.decay ); 
	
		return directLight;
	}

#endif


#if MAX_SPOT_LIGHTS > 0

	struct SpotLight {
	  vec3 position;
	  vec3 direction;
	  vec3 color;
	  float distance;
	  float decay;
	  float angleCos;
	  float exponent;
	};

	uniform SpotLight spotLights[ MAX_SPOT_LIGHTS ];

	IncidentLight getSpotDirectLight( const in SpotLight spotLight, const in GeometricContext geometry ) {
	
		IncidentLight directLight;

		vec3 lVector = spotLight.position - geometry.position;
		directLight.direction = normalize( lVector );
	
		float spotEffect = dot( spotLight.direction, directLight.direction );
		spotEffect = saturate( pow( saturate( spotEffect ), spotLight.exponent ) );
	
		directLight.color = spotLight.color;
		directLight.color *= ( spotEffect * calcLightAttenuation( length( lVector ), spotLight.distance, spotLight.decay ) );

		return directLight;
	}

#endif


#if MAX_HEMI_LIGHTS > 0

	struct HemisphereLight {
	  vec3 direction;
	  vec3 skyColor;
	  vec3 groundColor;
	};

	uniform HemisphereLight hemisphereLights[ MAX_HEMI_LIGHTS ];

	vec3 getHemisphereIndirectLightColor( const in HemisphereLight hemiLight, const in GeometricContext geometry ) { 
	
		float dotNL = dot( geometry.normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;

		return mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );

	}

#endif


#if defined( USE_ENVMAP ) && defined( PHYSICAL )

	vec3 getSpecularLightProbeIndirectLightColor( /*const in SpecularLightProbe specularLightProbe,*/ const in GeometricContext geometry, const in float lodLevel ) { 
	
		#ifdef ENVMAP_MODE_REFLECTION

			vec3 reflectVec = reflect( -geometry.viewDir, geometry.normal );

		#else

			vec3 reflectVec = refract( -geometry.viewDir, geometry.normal, refractionRatio );

		#endif

		#ifdef DOUBLE_SIDED

			float flipNormal = ( float( gl_FrontFacing ) * 2.0 - 1.0 );

		#else

			float flipNormal = 1.0;

		#endif

		reflectVec = inverseTransformDirection( reflectVec, viewMatrix );

		#ifdef ENVMAP_TYPE_CUBE

			#if defined( TEXTURE_CUBE_LOD_EXT )				

				vec4 envMapColor = textureCubeLodEXT( envMap, flipNormal * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ), lodLevel );

			#else

				vec4 envMapColor = textureCube( envMap, flipNormal * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );

			#endif

		#elif defined( ENVMAP_TYPE_EQUIREC )

			vec2 sampleUV;
			sampleUV.y = saturate( flipNormal * reflectVec.y * 0.5 + 0.5 );
			sampleUV.x = atan( flipNormal * reflectVec.z, flipNormal * reflectVec.x ) * RECIPROCAL_PI2 + 0.5;
			vec4 envMapColor = texture2D( envMap, sampleUV );

		#elif defined( ENVMAP_TYPE_SPHERE )

			vec3 reflectView = flipNormal * normalize((viewMatrix * vec4( reflectVec, 0.0 )).xyz + vec3(0.0,0.0,1.0));
			vec4 envMapColor = texture2D( envMap, reflectView.xy * 0.5 + 0.5 );

		#endif

		envMapColor.rgb = inputToLinear( envMapColor.rgb );

		return envMapColor.rgb * reflectivity;

	}

#endif

