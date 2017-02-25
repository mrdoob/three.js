#ifdef FLIP_SIDED

	objectNormal = -objectNormal;

#endif

#ifndef INSTANCE_TRANSFORM

vec3 transformedNormal = normalMatrix * objectNormal;

#else

#ifndef INSTANCE_UNIFORM
	
vec3 transformedNormal =  transpose( inverse( mat3( modelViewMatrix * getInstanceMatrix() ) ) ) * objectNormal ;

#else

vec3 transformedNormal = ( modelViewMatrix * getInstanceMatrix() * vec4( objectNormal , 0.0 ) ).xyz;

#endif

#endif