

float calcLightAttenuation( float lightDistance, float cutoffDistance, float decayExponent ) {

	if ( decayExponent > 0.0 ) {

	  return pow( saturate( -lightDistance / cutoffDistance + 1.0 ), decayExponent );

	}

	return 1.0;

}


#if MAX_DIR_LIGHTS > 0

	struct DirectionalLight {
	  vec3 direction;
	  vec3 color;
	};

	uniform DirectionalLight directionalLights[ MAX_DIR_LIGHTS ];

	void getDirIncidentLight( const in DirectionalLight directionalLight, const in GeometricContext geometry, out IncidentLight incidentLight ) { 
	
		incidentLight.color = directionalLight.color;
		incidentLight.direction = directionalLight.direction; 

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

	void getPointIncidentLight( const in PointLight pointLight, const in GeometricContext geometry, out IncidentLight incidentLight ) { 
	
		vec3 lightPosition = pointLight.position; 
	
		vec3 lVector = lightPosition - geometry.position; 
		incidentLight.direction = normalize( lVector ); 
	
		incidentLight.color = pointLight.color; 
		incidentLight.color *= calcLightAttenuation( length( lVector ), pointLight.distance, pointLight.decay ); 
	
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

	void getSpotIncidentLight( const in SpotLight spotLight, const in GeometricContext geometry, out IncidentLight incidentLight ) {
	
		vec3 lightPosition = spotLight.position;
	
		vec3 lVector = lightPosition - geometry.position;
		incidentLight.direction = normalize( lVector );
	
		float spotEffect = dot( spotLight.direction, incidentLight.direction );
		spotEffect = saturate( pow( saturate( spotEffect ), spotLight.exponent ) );
	
		incidentLight.color = spotLight.color;
		incidentLight.color *= ( spotEffect * calcLightAttenuation( length( lVector ), spotLight.distance, spotLight.decay ) );

	}

#endif


#if MAX_HEMI_LIGHTS > 0

	struct HemisphereLight {
	  vec3 direction;
	  vec3 skyColor;
	  vec3 groundColor;
	};

	uniform HemisphereLight hemisphereLights[ MAX_HEMI_LIGHTS ];

	void getHemisphereIncidentLight( const in HemisphereLight hemiLight, const in GeometricContext geometry, out IncidentLight incidentLight ) { 
	
		float dotNL = dot( geometry.normal, hemiLight.direction );

		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;

		incidentLight.color = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );

		incidentLight.direction = geometry.normal;

	}

#endif
