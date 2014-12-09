#ifdef USE_LIGHTMAP

   #ifndef USE_ENHANCED_LIGHTMAP
       gl_FragColor = gl_FragColor * texture2D( lightMap, vUv2 );

   #else
       // compute the light value
			 vec4 unit = vec4(1.0);
	  	 vec4 light = 2.0 * (texture2D(lightMap, vUv2) - lm_Center * unit);

	     // compute the light intensity modifier
			 vec4 modifier = - lm_Falloff * light * light + unit;

	     	// apply the lightmap
				gl_FragColor = gl_FragColor + light * modifier * lm_Intensity;
			  //gl_FragColor = gl_FragColor + light * lm_Intensity;
   #endif

#endif
