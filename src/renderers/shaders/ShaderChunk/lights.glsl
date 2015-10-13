

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

#define MAX_AREA_LIGHTS 0 

#if MAX_AREA_LIGHTS > 0

	struct HemisphereLight {
	  vec3 position;
	  vec3 width;
	  vec3 height;
	  vec3 color;
	  //sampler2D image;
	  float distance;
	  float decay;
	};

	uniform AreaLight areaLights[ MAX_AREA_LIGHTS ];

	void getAreaIncidentLight( const in AreaLight areaLight, const in GeometricContext geometry, out IncidentLight diffuseIncidentLight, out IncidentLight specularIncidentLight ) {
	
		float widthLength = length( areaLight.width );
		float heightLength = length( areaLight.height );

		vec3 widthDir = areaLight.width / widthLength;
		vec3 heightDir = areaLight.height / heightLength;
		vec3 areaLightDirection = normalize( cross( widthDir, heightDir ) );

		// project onto plane and calculate direction from center to the projection.
		vec3 planePosition = projectOnPlane( viewDir, areaLight.position, areaLightDirection ),  // projection in plane
		vec3 planeOffset = planePosition - areaLight.position;

		// calculate distance from area:
		vec2 planeOffsetUV = vec2( dot( planeOffset, widthDir ), dot( planeOffset, heightDir ) );
		vec2 clampedPlaneOffsetUV = vec2( clamp( planeOffsetUV.x, -widthLength, widthLength ), clamp( planeOffsetUV.y, -heightLength, heightLength ) );
		vec3 clampedPlanePosition = areaLight.position + ( widthDir * clampedPlaneOffsetUV.x + heightDir * clampedPlaneOffsetUV.y );

		vec3 positionToLight = ( clampedPlanePosition - geometry.position );
		float lightDistance = length( positionToLight );

		diffuseIncidentLight.color = areaLight.color[ i ] * calcLightAttenuation( lightDistance, areaLight.distance, areaLight.decay ) * 0.01;
		diffuseIncidentLight.direction = positionToLight / lightDistance;


		vec3 reflectDir = reflect( geometry.viewDir, geometry.normal );
		planePosition = linePlaneIntersect( geometry.position, reflectDir, areaLight.osition[ i ], areaLightNormal[ i ] );
		float specAngle = dot( reflectDir, direction );
		
		if( dot( geometry.position - areaLight.position, areaLightDirection ) >= 0.0 && specAngle > 0.0 ) {

			planeOffset = planePosition - areaLight.position;
			planeOffsetUV = vec2( dot( planeOffset, widthDir ), dot( planeOffset, heightDir ) );
			clampedPlaneOffsetUV = vec2( clamp( planeOffsetUV.x, -widthLength, widthLength ), clamp( planeOffsetUV.y, -heightLength, heightLength ) );
			clampedPlanePosition = areaLight.position + ( widthDir * clampedPlaneOffsetUV.x + heightDir * clampedPlaneOffsetUV.y );

			positionToLight = ( clampedPlanePosition - geometry.position );
			lightDistance = length( positionToLight );

			specularIncidentLight.color = areaLight.color[ i ] * calcLightAttenuation( lightDistance, areaLight.distance, areaLight.decay ) * 0.01;
			specularIncidentLight.direction = positionToLight / lightDistance;

		}
		else {

			specularIncidentLight.color = vec3( 0.0 );
			specularIncidentLight.direction = vec3( 1.0, 0.0, 0.0 );

		}

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


#define MAX_LIGHT_PROBES 0

#if MAX_LIGHT_PROBES > 0

	struct ProbeLight {
	  vec3 position;
	  vec3 sh[9];
	};

	uniform LightProbes lightProbes[ MAX_LIGHT_PROBES ];

	void getLightProbeIncidentLight( const in GeometricContext geometry, out IncidentLight incidentLight ) { 

		// TODO: loop through all light probes and calculate their contributions
		// based on an inverse distance weighting.	

		incidentLight.color = vec3( 0.0 );
		incidentLight.direction = geometry.normal;

	}

#endif
