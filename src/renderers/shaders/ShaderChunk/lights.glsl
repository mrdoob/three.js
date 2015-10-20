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

		vec3 lightPosition = pointLight.position; 
	
		vec3 lVector = lightPosition - geometry.position; 
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

		vec3 lightPosition = spotLight.position;
	
		vec3 lVector = lightPosition - geometry.position;
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

	IncidentLight getHemisphereIndirectLight( const in HemisphereLight hemiLight, const in GeometricContext geometry ) { 
	
		IncidentLight indirectLight;

		float dotNL = dot( geometry.normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;

		indirectLight.color = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		indirectLight.direction = geometry.normal;

		return indirectLight;
	}

#endif
