#ifdef USE_LIGHTMAP

   varying vec2 vUv2;
   uniform sampler2D lightMap;

   #ifdef USE_ENHANCED_LIGHTMAP
	 	  //  <0, 2> the degree to which lightmap modifies the original texture color
      uniform float lm_Intensity;

	    // <0, 1> neutral point in the light map color range where the original texture color is unchanged
      uniform float lm_Center;

	    // <0, 1> quadratic rate of intensity decrease for extreme lightmap values
      uniform float lm_Falloff;

   #endif

#endif
