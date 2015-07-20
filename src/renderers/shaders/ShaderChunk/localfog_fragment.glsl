#if MAX_LOCAL_FOGS > 0

for ( int i = 0; i < MAX_LOCAL_FOGS; i ++ ) {

	vec3  fVector = localFogPosition[ i ] - vWorldPosition;
	float dist = length( fVector );

	float fogFactor = 1.0 - smoothstep( localFogFar[ i ], localFogRadius [ i ], dist );
	outgoingLight = mix( outgoingLight, localFogColor[ i ], fogFactor );

}

#endif