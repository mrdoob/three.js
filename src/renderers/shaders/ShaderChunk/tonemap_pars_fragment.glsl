#ifdef USE_TONEMAPPING

	uniform float middleGrey;
	uniform float maxLuminance;
	const vec3 LUM_CONVERT = vec3(0.299, 0.587, 0.114);
	uniform float avgLuminance; //TEMP!
	uniform sampler2D luminanceMap;

	vec3 ToneMap( vec3 vColor ) {

		float fCurrentLum = 2.0 * texture2D(luminanceMap, vec2(0.5, 0.5)).r;

		// Get the calculated average luminance 
		float fLumAvg = fCurrentLum + 0.001;//texture2D(PointSampler1, float2(0.5, 0.5)).r;

		// Calculate the luminance of the current pixel
		float fLumPixel = dot(vColor, LUM_CONVERT);

		// Apply the modified operator (Eq. 4)
		float fLumScaled = (fLumPixel * middleGrey) / fLumAvg;

		float fLumCompressed = (fLumScaled * (1.0 + (fLumScaled / ( maxLuminance * maxLuminance)))) / (1.0 + fLumScaled);
		return fLumCompressed * vColor;
	}
	
#endif