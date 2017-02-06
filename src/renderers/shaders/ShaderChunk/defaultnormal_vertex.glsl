#ifdef FLIP_SIDED

	objectNormal = -objectNormal;

#endif

#ifndef INSTANCE_TRANSFORM

vec3 transformedNormal = normalMatrix * objectNormal;

#else

// mat4 aNormalMatrix = mat4(
// 	vec4( aNRM0.x , aNRM0.y , aNRM0.z, 0. ),
// 	vec4( aNRM1.x , aNRM1.y , aNRM1.z, 0. ),
// 	vec4( aNRM2.x , aNRM2.y , aNRM2.z, 0. ),
// 	vec4( 0., 0. , 0. , 1. )
// );
mat4 aNormalMatrix = mat4(
	vec4( aNRM0.x , aNRM0.y , aNRM0.z, 0. ),
	vec4( aNRM1.x , aNRM1.y , aNRM1.z, 0. ),
	vec4( aNRM2.x , aNRM2.y , aNRM2.z, 0. ),
	vec4( 0., 0. , 0. , 1. )
);
mat4 aNormalMatrix = mat4(
	vec4( aNRM0.x , aNRM1.x , aNRM2.x, 0. ),
	vec4( aNRM0.y , aNRM1.y , aNRM2.y, 0. ),
	vec4( aNRM0.z , aNRM1.z , aNRM2.z, 0. ),
	vec4( 0., 0. , 0. , 1. )
	
);

#ifndef INSTANCE_TRANSFORM_DEFINED

mat4 aTRS = mat4(
	aTRS0,aTRS1,aTRS2,aTRS3
);

#define INSTANCE_TRANSFORM_DEFINED

#endif

mat4 nMat = viewMatrix * aTRS; 

vec3 transformedNormal =  transpose( inverse( mat3( nMat ) ) ) * objectNormal ;

#endif