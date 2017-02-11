
#ifndef INSTANCE_TRANSFORM

vec3 transformed = vec3( position );

#else

#ifndef INSTANCE_TRANSFORM_DEFINED

	//format it so that we dont waste a whole attribute
	mat4 aTRS = mat4(
		
		vec4( aTRS0.xyz , 0.),
		vec4( aTRS1.xyz , 0.),
		vec4( aTRS2.xyz , 0.),
		vec4( aTRS0.w , aTRS1.w , aTRS2.w , 1.)

	);


	#define INSTANCE_TRANSFORM_DEFINED

#endif

vec3 transformed = ( aTRS * vec4( position , 1. )).xyz;

#endif

