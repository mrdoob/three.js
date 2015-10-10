uniform vec3 ambientLightColor;

#if MAX_SPOT_LIGHTS > 0 || defined( USE_ENVMAP )

	varying vec3 vWorldPosition;

#endif

varying vec3 vViewPosition;

#ifndef FLAT_SHADED

	varying vec3 vNormal;

#endif


#if MAX_DIR_LIGHTS > 0

	struct DirectionalLight {
	  vec3 direction;
	  vec3 color;
	};

	uniform DirectionalLight singleTestDirLight;

	uniform DirectionalLight directionalLights[ MAX_DIR_LIGHTS ];

	void getDirLight( const in DirectionalLight directionalLight, out vec3 lightDir, out vec3 lightColor ) { 
	
		lightDir = directionalLight.direction; 
		lightColor = directionalLight.color;

	}

#endif

#if MAX_HEMI_LIGHTS > 0

	struct HemisphereLight {
	  vec3 direction;
	  vec3 skyColor;
	  vec3 groundColor;
	};

	uniform HemisphereLight hemisphereLights[ MAX_HEMI_LIGHTS ];

#endif

#if MAX_POINT_LIGHTS > 0

	struct PointLight {
	  vec3 position;
	  vec3 color;
	  float distance;
	  float decay;
	};

	uniform PointLight singleTestPointLight;

	uniform PointLight pointLights[ MAX_POINT_LIGHTS ];

	void getPointLight( const in PointLight pointLight, out vec3 lightDir, out vec3 lightColor ) { 
	
		vec3 lightPosition = pointLight.position; 
	
		vec3 lVector = lightPosition + vViewPosition.xyz; 
		lightDir = normalize( lVector ); 
	
		lightColor = pointLight.color; 
		lightColor *= calcLightAttenuation( length( lVector ), pointLight.distance, pointLight.decay ); 
	
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

	void getSpotLight( const in SpotLight spotLight, out vec3 lightDir, out vec3 lightColor ) {
	
		vec3 lightPosition = spotLight.position;
	
		vec3 lVector = lightPosition + vViewPosition.xyz;
		lightDir = normalize( lVector );
	
		float spotEffect = dot( spotLight.direction, lightDir );
		spotEffect = saturate( pow( saturate( spotEffect ), spotLight.exponent ) );
	
		lightColor = spotLight.color;
		lightColor *= ( spotEffect * calcLightAttenuation( length( lVector ), spotLight.distance, spotLight.decay ) );

	}

#endif





