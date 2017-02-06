
#ifndef INSTANCE_TRANSFORM

vec3 transformed = vec3( position );

#else

#ifndef INSTANCE_TRANSFORM_DEFINED

mat4 aTRS = mat4(
	aTRS0,aTRS1,aTRS2,aTRS3
);

#define INSTANCE_TRANSFORM_DEFINED

#endif

vec3 transformed = ( aTRS * vec4( position , 1. )).xyz;

#endif

