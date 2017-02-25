
#ifndef INSTANCE_TRANSFORM

vec3 transformed = vec3( position );

#else

vec3 transformed = ( getInstanceMatrix() * vec4( position , 1. )).xyz;

#endif

