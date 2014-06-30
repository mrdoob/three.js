#if defined( USE_ENVMAP ) && ! defined( USE_BUMPMAP ) && ! defined( USE_NORMALMAP )

	vec3 worldNormal = mat3( modelMatrix[ 0 ].xyz, modelMatrix[ 1 ].xyz, modelMatrix[ 2 ].xyz ) * objectNormal;
	worldNormal = normalize( worldNormal );

	vec3 cameraToVertex = normalize( worldPosition.xyz - cameraPosition );

	if ( useRefract ) {

		vReflect = refract( cameraToVertex, worldNormal, refractionRatio );

	} else {

		vReflect = reflect( cameraToVertex, worldNormal );

	}

#endif