
#ifndef INSTANCE_TRANSFORM

vec3 transformed = vec3( position );

#else

#ifndef INSTANCE_MATRIX 

	mat4 _instanceMatrix = getInstanceMatrix();

	#define INSTANCE_MATRIX

#endif

vec3 transformed = ( _instanceMatrix * vec4( position , 1. )).xyz;

#endif

