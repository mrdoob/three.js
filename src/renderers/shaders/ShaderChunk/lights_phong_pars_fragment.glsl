uniform vec3 ambientLightColor;

#if MAX_SPOT_LIGHTS > 0 || defined( USE_ENVMAP )

	varying vec3 vWorldPosition;

#endif

varying vec3 vViewPosition;

#ifndef FLAT_SHADED

	varying vec3 vNormal;

#endif


#if MAX_DIR_LIGHTS > 0

	//uniform vec3 directionalLightColor[ MAX_DIR_LIGHTS ];
	//uniform vec3 directionalLightDirection[ MAX_DIR_LIGHTS ];

	struct DirectionalLight {
	  vec3 color;
	  vec3 direction;
	};

	uniform DirectionalLight directionalLights[ MAX_DIR_LIGHTS ];

	void getDirLight( const in DirectionalLight directionalLight, out vec3 lightDir, out vec3 lightColor ) { 
	
		lightDir = directionalLight.direction; 
		lightColor = directionalLight.color;

	}

#endif

#if MAX_HEMI_LIGHTS > 0

	//uniform vec3 hemisphereLightSkyColor[ MAX_HEMI_LIGHTS ];
	//uniform vec3 hemisphereLightGroundColor[ MAX_HEMI_LIGHTS ];
	//uniform vec3 hemisphereLightDirection[ MAX_HEMI_LIGHTS ];

	struct HemisphereLight {
	  vec3 skyColor;
	  vec3 groundColor;
	  vec3 direction;
	};

	uniform HemisphereLight hemisphereLights[ MAX_HEMI_LIGHTS ];

#endif

#if MAX_POINT_LIGHTS > 0

	//uniform vec3 pointLightColor[ MAX_POINT_LIGHTS ];
	//uniform vec3 pointLightPosition[ MAX_POINT_LIGHTS ];
	//uniform float pointLightDistance[ MAX_POINT_LIGHTS ];
	//uniform float pointLightDecay[ MAX_POINT_LIGHTS ];

	struct PointLight {
	  vec3 color;
	  vec3 position;
	  float decay;
	  float distance;
	};

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

	//uniform vec3 spotLightColor[ MAX_SPOT_LIGHTS ];
	//uniform vec3 spotLightPosition[ MAX_SPOT_LIGHTS ];
	//uniform vec3 spotLightDirection[ MAX_SPOT_LIGHTS ];
	//uniform float spotLightAngleCos[ MAX_SPOT_LIGHTS ];
	//uniform float spotLightExponent[ MAX_SPOT_LIGHTS ];
	//uniform float spotLightDistance[ MAX_SPOT_LIGHTS ];
	//uniform float spotLightDecay[ MAX_SPOT_LIGHTS ];

	struct SpotLight {
	  vec3 color;
	  vec3 position;
	  vec3 direction;
	  float angleCos;
	  float exponent;
	  float distance;
	  float decay;
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





