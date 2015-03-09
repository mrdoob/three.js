#ifdef USE_LIGHTMAP

	outgoingLight *= diffuseColor.xyz * texture2D( lightMap, vUv2 ).xyz;

#endif