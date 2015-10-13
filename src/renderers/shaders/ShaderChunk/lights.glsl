

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


#define MAX_AREA_LIGHTS 0 

#if MAX_AREA_LIGHTS > 0

	struct HemisphereLight {
	  vec3 position;	// NOTE: top left of area light, not the center
	  vec3 width;
	  vec3 height;
	  vec3 color;
	  //sampler2D image;
	  float distance;
	  float decay;
	};

	uniform AreaLight areaLights[ MAX_AREA_LIGHTS ];

	vec3 clampToAreaLight( const in mat3 worldToPlaneMat, const in vec3 lightPositionPlaneCoord, const in vec3 point ) {

		// convert into "plane space" from world space
		var pointPlaneCoord = worldToPlaneMat * point;

		// clamp point plane coords to positive unit in plane space.
		pointPlaneCoord.xy = clamp( positionPlaneCoord.xy - lightPositionPlaneCoord.xy, 0.0, 1.0 ) + lightPositionPlaneCoord.xy;
		pointPlaneCoord.z = lightPositionPlaneOffset; // project onto plane in plane coordinate space

		// convert out of "plane space" into world space
		return positionPlaneCoord * worldToPlaneMat;

	}

	void getAreaIncidentLight( const in AreaLight areaLight, const in GeometricContext geometry, out IncidentLight diffuseIncidentLight, out IncidentLight specularIncidentLight ) {
	
		vec3 areaLightDirection = normalize( cross( widthDir, heightDir ) );
		// NOTE: width and height are purposely not normalized, this is necessary because plane space is scaled based on width/height size.
		mat3 worldToPlaneMat = mat3( areaLight.width, areaLight.height, areaLightDirection );
		vec3 lightPositionPlaneCoord = worldToPlaneMat * areaLight.position;

		vec3 clampedPlanePosition = clampToAreaLight( worldToPlaneMat, lightPositionPlaneCoord, geometry.position );

		vec3 positionToLight = ( clampedPlanePosition - geometry.position );
		float lightDistance = length( positionToLight );

		diffuseIncidentLight.color = areaLight.color[ i ] * calcLightAttenuation( lightDistance, areaLight.distance, areaLight.decay ) * 0.01;
		diffuseIncidentLight.direction = positionToLight / lightDistance;

		vec3 reflectDir = reflect( geometry.viewDir, geometry.normal );
		float specAngle = dot( reflectDir, direction );
		
		if( dot( geometry.position - areaLight.position, areaLightDirection ) >= 0.0 && specAngle > 0.0 ) {

			lightPositionPlaneCoord = linePlaneIntersect( geometry.position, reflectDir, areaLight.position, areaLight.normal );
			clampedPlanePosition = clampToAreaLight( worldToPlaneMat, lightPositionPlaneCoord, lightPositionPlaneCoord );

			positionToLight = ( clampedPlanePosition - geometry.position );
			lightDistance = length( positionToLight );

			specularIncidentLight.color = areaLight.color[ i ] * calcLightAttenuation( lightDistance, areaLight.distance, areaLight.decay );
			specularIncidentLight.direction = positionToLight / lightDistance;

		}
		else {

			specularIncidentLight.color = vec3( 0.0 );
			specularIncidentLight.direction = vec3( 1.0, 0.0, 0.0 );

		}

	}

#endif