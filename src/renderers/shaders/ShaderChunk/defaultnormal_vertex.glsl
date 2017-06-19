#ifdef FLIP_SIDED

	objectNormal = -objectNormal;

#endif

#ifndef INSTANCE_TRANSFORM

vec3 transformedNormal = normalMatrix * objectNormal;

#else



#ifndef INSTANCE_MATRIX 

	mat4 _instanceMatrix = getInstanceMatrix();

	#define INSTANCE_MATRIX

#endif

#ifndef INSTANCE_UNIFORM
	
vec3 transformedNormal =  transpose( inverse( mat3( modelViewMatrix * _instanceMatrix ) ) ) * objectNormal ;

#else

vec3 transformedNormal = ( modelViewMatrix * _instanceMatrix * vec4( objectNormal , 0.0 ) ).xyz;

#endif

#endif