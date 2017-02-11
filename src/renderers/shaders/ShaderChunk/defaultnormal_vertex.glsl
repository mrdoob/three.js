#ifdef FLIP_SIDED

	objectNormal = -objectNormal;

#endif

#ifndef INSTANCE_TRANSFORM

vec3 transformedNormal = normalMatrix * objectNormal;

#else

#ifndef INSTANCE_TRANSFORM_DEFINED

	mat4 aTRS = mat4(
		
		vec4( aTRS0.xyz , 0.),
		vec4( aTRS1.xyz , 0.),
		vec4( aTRS2.xyz , 0.),
		vec4( aTRS0.w , aTRS1.w , aTRS2.w , 1.)

	);

	#define INSTANCE_TRANSFORM_DEFINED

#endif

#ifndef INSTANCE_UNIFORM
	
vec3 transformedNormal =  transpose( inverse( mat3( modelViewMatrix * aTRS ) ) ) * objectNormal ;

#else

vec3 transformedNormal = ( modelViewMatrix * aTRS * vec4( objectNormal , 0.0 ) ).xyz;

#endif

#endif