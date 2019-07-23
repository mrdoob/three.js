export default /* glsl */ `
#ifndef STANDARD
	#ifdef USE_CLEARCOAT_NORMALMAP
	
	  uniform sampler2D clearCoatNormalMap;
		uniform vec2 clearCoatNormalScale;
		
	#endif
#endif
`;
