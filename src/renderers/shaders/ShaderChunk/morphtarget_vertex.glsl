#ifdef USE_MORPHTARGETS

	vec3 morphed = vec3( 0.0 );
	morphed += ( morphTarget0 - position ) * morphTargetInfluences[ 0 ];
	morphed += ( morphTarget1 - position ) * morphTargetInfluences[ 1 ];
	morphed += ( morphTarget2 - position ) * morphTargetInfluences[ 2 ];
	morphed += ( morphTarget3 - position ) * morphTargetInfluences[ 3 ];

	#ifndef USE_MORPHNORMALS

	morphed += ( morphTarget4 - position ) * morphTargetInfluences[ 4 ];
	morphed += ( morphTarget5 - position ) * morphTargetInfluences[ 5 ];
	morphed += ( morphTarget6 - position ) * morphTargetInfluences[ 6 ];
	morphed += ( morphTarget7 - position ) * morphTargetInfluences[ 7 ];

	#endif

	morphed += position;

#endif