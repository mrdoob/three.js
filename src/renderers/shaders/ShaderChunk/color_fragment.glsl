#ifdef USE_COLOR

	diffuseColor.rgb *= vColor;

#endif

#ifdef INSTANCE_COLOR 
		
	diffuseColor.rgb *= vInstanceColor;
		
#endif