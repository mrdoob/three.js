uniform vec3 ambientLightColor;

#if MAX_SPOT_LIGHTS > 0 || defined( USE_ENVMAP )

	varying vec3 vWorldPosition;

#endif

varying vec3 vViewPosition;

#ifndef FLAT_SHADED

	varying vec3 vNormal;

#endif

#if MAX_DIR_LIGHTS > 0

	uniform vec3 directionalLightColor[ MAX_DIR_LIGHTS ];
	uniform vec3 directionalLightDirection[ MAX_DIR_LIGHTS ];

	#define getDirLight( directionalIndex, lightDir, lightIntensity ) { 
	
		lightDir = directionalLightDirection[ directionalIndex ]; 
		lightIntensity = directionalLightColor[ directionalIndex ]; 
	
	}

#endif

#if MAX_HEMI_LIGHTS > 0

	uniform vec3 hemisphereLightSkyColor[ MAX_HEMI_LIGHTS ];
	uniform vec3 hemisphereLightGroundColor[ MAX_HEMI_LIGHTS ];
	uniform vec3 hemisphereLightDirection[ MAX_HEMI_LIGHTS ];

#endif

#if MAX_POINT_LIGHTS > 0

	uniform vec3 pointLightColor[ MAX_POINT_LIGHTS ];
	uniform vec3 pointLightPosition[ MAX_POINT_LIGHTS ];
	uniform float pointLightDistance[ MAX_POINT_LIGHTS ];
	uniform float pointLightDecay[ MAX_POINT_LIGHTS ];

	#define getPointLight( pointIndex, lightDir, lightIntensity ) { 
	
		vec3 lightPosition = pointLightPosition[ pointIndex ]; 
	
		vec3 lVector = lightPosition + vViewPosition.xyz; 
		lightDir = normalize( lVector ); 
	
		lightIntensity = pointLightColor[ pointIndex ]; 
		lightIntensity *= calcLightAttenuation( length( lVector ), pointLightDistance[ pointIndex ], pointLightDecay[ pointIndex ] ); 
	
	}

#endif

#if MAX_SPOT_LIGHTS > 0

	uniform vec3 spotLightColor[ MAX_SPOT_LIGHTS ];
	uniform vec3 spotLightPosition[ MAX_SPOT_LIGHTS ];
	uniform vec3 spotLightDirection[ MAX_SPOT_LIGHTS ];
	uniform float spotLightAngleCos[ MAX_SPOT_LIGHTS ];
	uniform float spotLightExponent[ MAX_SPOT_LIGHTS ];
	uniform float spotLightDistance[ MAX_SPOT_LIGHTS ];
	uniform float spotLightDecay[ MAX_SPOT_LIGHTS ];

	#define getSpotLight( spotIndex, lightDir, lightIntensity ) {
	
		vec3 lightPosition = spotLightPosition[ spotIndex ];
	
		vec3 lVector = lightPosition + vViewPosition.xyz;
		lightDir = normalize( lVector );
	
		float spotEffect = dot( spotLightDirection[ spotIndex ], lightDir );
		spotEffect = saturate( pow( saturate( spotEffect ), spotLightExponent[ spotIndex ] ) );
	
		lightIntensity = spotLightColor[ spotIndex ];
		lightIntensity *= ( spotEffect * calcLightAttenuation( length( lVector ), spotLightDistance[ spotIndex ], spotLightDecay[ spotIndex ] ) );

	}

#endif





